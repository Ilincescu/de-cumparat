// Ce s-a vandut, nu ce sta nevandut.
//
//   node tools/vandute.js                 toate anunturile disparute
//   node tools/vandute.js terezian        doar un cartier (se cauta in zona si titlu)
//   node tools/vandute.js --tip casa      doar case, sau apartament
//
// Medianele de pe Storia sunt preturi CERUTE, de anunturi care inca stau pe
// piata - adica tocmai cele care nu se vand. Anunturile care au disparut sunt
// singurul semnal despre ce accepta piata cu adevarat.
//
// Pentru fiecare anunt pe care l-am vazut candva si care nu mai apare azi, se
// cere pagina lui publica si se citeste campul `status`:
//
//   removed_by_user   l-a scos proprietarul sau agentia - vandut sau retras
//   expired           a expirat singur, de obicei inseamna ca nu s-a vandut
//   active            inca exista, doar a iesit din filtrele scanarii
//
// "Vandut" nu se poate dovedi din afara: Storia nu spune pretul tranzactiei.
// Dar un anunt scos de proprietar dupa trei saptamani si unul expirat dupa
// patru luni sunt doua lucruri foarte diferite, si asta se poate citi.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const DOSAR = path.join(__dirname, 'snapshots');
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };

const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || String(u);
const zile = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

function snapshoturi() {
  return fs.readdirSync(DOSAR)
    .filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x))
    .sort()
    .map(f => ({ data: f.slice(7, 17), lista: JSON.parse(fs.readFileSync(path.join(DOSAR, f), 'utf8')) }));
}

// Tot ce am vazut vreodata, cu ultima stare cunoscuta si ziua in care am vazut-o.
function vazuteVreodata() {
  const toate = new Map();
  for (const s of snapshoturi()) {
    for (const x of s.lista) {
      const id = idAnunt(x.url);
      const e = toate.get(id) || { id, prima: s.data };
      toate.set(id, Object.assign(e, {
        url: x.url, titlu: x.titlu, pret: x.pret, mpu: x.mpu, teren: x.teren,
        zona: x.zona, tip: x.tip, creat: x.creat, stare: x.stare, ultima: s.data,
      }));
    }
  }
  // istoricul de preturi merge mai in urma decat snapshoturile
  const caleIstoric = path.join(RADACINA, 'istoric-preturi.json');
  if (fs.existsSync(caleIstoric)) {
    const h = JSON.parse(fs.readFileSync(caleIstoric, 'utf8')).anunturi || {};
    for (const [id, e] of Object.entries(h)) {
      if (!e.preturi || !e.preturi.length) continue;
      const prim = e.preturi[0], ultim = e.preturi[e.preturi.length - 1];
      const v = toate.get(id);
      if (v) {
        if (prim.d < v.prima) v.prima = prim.d;
        v.pretInitial = prim.p;
      } else if (String(e.u || '').includes('storia')) {
        toate.set(id, {
          id, url: e.u, titlu: e.t, pret: ultim.p, pretInitial: prim.p,
          prima: prim.d, ultima: ultim.d, tip: /apartament/i.test(e.t || '') ? 'apartament' : 'casa',
          zona: null, mpu: null, teren: null, creat: null, stare: null,
        });
      }
    }
  }
  return toate;
}

async function stareLive(url) {
  try {
    const r = await fetch(url, { headers: UA });
    const h = await r.text();
    const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) return { status: 'necunoscut', http: r.status };
    const a = ((JSON.parse(m[1]).props || {}).pageProps || {}).ad;
    if (!a) return { status: 'fara date', http: r.status };
    return {
      status: a.status || 'necunoscut',
      http: r.status,
      pret: (a.target || {}).Price || null,
      creat: (a.createdAt || '').slice(0, 10),
      modificat: (a.modifiedAt || '').slice(0, 10),
    };
  } catch (e) {
    return { status: 'eroare', http: 0 };
  }
}

(async () => {
  const argumente = process.argv.slice(2);
  const iTip = argumente.indexOf('--tip');
  const tip = iTip >= 0 ? argumente[iTip + 1] : null;
  const cuvant = argumente.filter((a, i) => !a.startsWith('--') && i !== iTip + 1)[0];

  const snaps = snapshoturi();
  if (!snaps.length) return console.log('nu am niciun snapshot');
  const azi = snaps[snaps.length - 1];
  const vii = new Set(azi.lista.map(x => idAnunt(x.url)));

  let disparute = [...vazuteVreodata().values()].filter(e => !vii.has(e.id));
  if (tip) disparute = disparute.filter(e => e.tip === tip);
  if (cuvant) {
    const re = new RegExp(cuvant, 'i');
    disparute = disparute.filter(e => re.test(e.zona || '') || re.test(e.titlu || ''));
  }

  console.log(`snapshoturi: ${snaps[0].data} .. ${azi.data}`);
  console.log(`anunturi disparute din lista${tip ? ' (' + tip + ')' : ''}${cuvant ? ' care contin "' + cuvant + '"' : ''}: ${disparute.length}`);
  console.log('verific starea fiecaruia pe Storia...\n');

  const rezultat = [];
  for (const e of disparute) {
    const s = await stareLive(e.url);
    rezultat.push(Object.assign({}, e, { live: s }));
    process.stdout.write('.');
    await new Promise(r => setTimeout(r, 350));
  }
  console.log('\n');

  const eticheta = {
    removed_by_user: 'SCOS de proprietar',
    expired: 'expirat',
    active: 'inca activ (a iesit din filtre)',
  };

  const grupe = {};
  rezultat.forEach(r => { (grupe[r.live.status] = grupe[r.live.status] || []).push(r); });

  for (const [stare, lista] of Object.entries(grupe).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n=== ${eticheta[stare] || stare}: ${lista.length} ===`);
    lista.sort((a, b) => (b.pret || 0) - (a.pret || 0)).forEach(r => {
      const creat = r.live.creat || r.creat;
      const dStr = creat && r.live.modificat ? `${zile(creat, r.live.modificat)} zile pe piata` : '';
      const pret = r.live.pret || r.pret;
      const scadere = r.pretInitial && pret && r.pretInitial !== pret
        ? ` (de la ${r.pretInitial})` : '';
      console.log(`  ${String(pret).padStart(7)} EUR${scadere} | ${String(r.mpu || '?').padStart(4)} mp | teren ${String(r.teren || '?').padStart(4)} | ${dStr}`);
      console.log(`    ${String(r.titlu || '').slice(0, 68)}`);
      console.log(`    ${r.url}`);
    });
  }

  const scoase = (grupe.removed_by_user || []).filter(r => r.live.pret || r.pret);
  if (scoase.length) {
    const p = scoase.map(r => r.live.pret || r.pret).sort((a, b) => a - b);
    const m = Math.floor(p.length / 2);
    console.log(`\n--- anunturi scoase de proprietar: ${p.length}, pret median cerut la final ${p.length % 2 ? p[m] : Math.round((p[m-1]+p[m])/2)} EUR ---`);
    console.log('Pretul cerut la momentul scoaterii, nu pretul de vanzare. Storia nu publica tranzactia.');
  }

  fs.writeFileSync(path.join(DOSAR, `disparute-${azi.data}.json`),
    JSON.stringify(rezultat.map(r => ({
      id: r.id, url: r.url, titlu: r.titlu, pret: r.live.pret || r.pret,
      pretInitial: r.pretInitial || null, mpu: r.mpu, teren: r.teren, zona: r.zona,
      tip: r.tip, creat: r.live.creat || r.creat, modificat: r.live.modificat || null,
      status: r.live.status,
    })), null, 1));
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
