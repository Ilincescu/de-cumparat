// Aceeasi casa, mai multe anunturi.
//
//   node tools/dubluri.js           grupurile din ultimul snapshot
//   node tools/dubluri.js --poze    confirma grupurile comparand pozele
//
// Se foloseste si ca modul: require('./dubluri').grupeaza(lista)
//
// Casa din Berzelor statea la cinci agentii, intre 162.990 si 200.000 EUR, si
// am tratat-o mult timp ca pe cinci case. In clasamentul de dimineata au
// intrat doua anunturi Lupeni, 205.000 si 204.990, aceeasi casa pe locurile
// 2 si 3 - doua din trei locuri ocupate de o singura proprietate.
//
// Ordinea verificarilor merge de la ieftin la scump:
//   1. semnale structurale, fara retea - teren, zona, camere, mp, pret
//   2. doar pentru perechile suspecte, hash de poze - singura dovada sigura
//
// Terenul e semnalul cel mai tare pentru ca e un numar masurat, copiat din
// carte funciara. Doua anunturi care spun amandoua 237 mp teren in acelasi
// cartier sunt aproape sigur aceeasi casa. Preturile, in schimb, mint: agentii
// isi pun comisionul diferit, iar mp utili sunt declarati cum vrea fiecare -
// 121 la una, 130 la cealalta, aceeasi casa.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const DOSAR = path.join(__dirname, 'snapshots');

const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || String(u);
const cartier = x => String(x.zona || '').replace(/,\s*Sibiu$/i, '').trim().toLowerCase();
const aproape = (a, b, p) => a != null && b != null && a > 0 && b > 0
  && Math.abs(a - b) / Math.max(a, b) <= p;

// Doua conditii obligatorii, apoi punctaj.
//
// Obligatoriu: acelasi cartier SI aceeasi suprafata de teren. Terenul e
// masurat si copiat din cartea funciara, deci doua anunturi pentru aceeasi
// casa il dau la fel; doua case diferite rareori au exact acelasi numar.
// Fara conditia asta, punctajul singur lega in lant case care nu au nimic in
// comun: un grup de 10 amesteca Centrul Istoric cu Gusterita si Calea
// Cisnadiei, pentru ca A semana cu B, B cu C, dar A deloc cu C.
//
// Prefer sa scap o dublura decat sa unesc gresit: o dublura scapata imi ocupa
// un loc in clasament, dar o unire gresita ascunde o casa adevarata.
const PRAG = 7;

function scor(a, b) {
  if (!cartier(a) || cartier(a) !== cartier(b)) return { total: 0, motive: [] };
  if (!a.teren || !b.teren || a.teren !== b.teren) return { total: 0, motive: [] };
  const s = [[4, `teren identic ${a.teren} mp`], [2, 'acelasi cartier']];
  if (aproape(a.mpu, b.mpu, 0.10)) s.push([2, `mp utili ${a.mpu} vs ${b.mpu}`]);
  if (aproape(a.pret, b.pret, 0.05)) s.push([2, `pret ${a.pret} vs ${b.pret}`]);
  if (a.camere && a.camere === b.camere) s.push([1, `${a.camere} camere`]);
  if (a.an && a.an === b.an) s.push([1, `an ${a.an}`]);
  return { total: s.reduce((t, x) => t + x[0], 0), motive: s.map(x => x[1]) };
}

// Grupuri de anunturi care arata ca aceeasi casa. Nu atinge reteaua.
//
// Fiecare membru trebuie sa semene cu capul de grup, nu cu vecinul lui.
// Altfel se formeaza lanturi: pragul e trecut din aproape in aproape si
// grupul creste pana aduna jumatate de cartier.
function grupeaza(lista) {
  const ramase = lista.slice().sort((a, b) => (a.pret || 1e9) - (b.pret || 1e9));
  const grupuri = [];
  while (ramase.length) {
    const sef = ramase.shift();
    const anunturi = [sef];
    let motive = [];
    for (let i = ramase.length - 1; i >= 0; i--) {
      const s = scor(sef, ramase[i]);
      if (s.total < PRAG) continue;
      anunturi.push(ramase.splice(i, 1)[0]);
      if (!motive.length) motive = s.motive;
    }
    // Capul de grup e cel mai ieftin, pentru ca lista e sortata dupa pret.
    // Daca aceeasi casa are doua preturi, al doilea e argument de negociere.
    grupuri.push({ anunturi, motive, sef });
  }
  return grupuri;
}

// ---------- confirmare cu poze: singura dovada sigura ----------

// Intoarce {hashuri, blocat}. Distinctia conteaza: zero poze comune inseamna
// "sunt case diferite" doar daca am reusit sa citesc pozele. Dupa o scanare
// mare Storia da 403, iar un 403 citit ca "zero potriviri" ar fi exact genul
// de concluzie care pare dovada si nu e.
async function hashuriPoze(url, cate = 4) {
  const slug = String(url).replace('https://www.storia.ro/ro/oferta/', '');
  const b = JSON.parse(fs.readFileSync(path.join(__dirname, 'storia-build.json'), 'utf8')).buildId;
  const r = await fetch(`https://www.storia.ro/_next/data/${b}/ro/oferta/${slug}.json?id=${slug}`, { headers: UA });
  if (r.status === 403 || r.status === 429) return { hashuri: [], blocat: r.status };
  if (!r.ok) return { hashuri: [], blocat: false };
  const a = ((await r.json()).pageProps || {}).ad;
  if (!a) return { hashuri: [], blocat: false };
  const poze = (a.images || []).map(i => i.medium || i.large).filter(Boolean).slice(0, cate);
  const out = [];
  let blocat = false;
  for (const u of poze) {
    try {
      const im = await fetch(u, { headers: UA });
      if (im.status === 403 || im.status === 429) { blocat = im.status; continue; }
      if (!im.ok) continue;
      out.push(crypto.createHash('sha256').update(Buffer.from(await im.arrayBuffer())).digest('hex').slice(0, 16));
    } catch (e) { /* o poza lipsa nu strica verdictul */ }
  }
  return { hashuri: out, blocat: out.length ? false : blocat };
}

// Potrivirea de poze dovedeste intr-un singur sens: o poza identica inseamna
// sigur aceeasi casa, pentru ca e acelasi fisier. Poze diferite nu infirma
// nimic - fiecare agentie isi face pozele ei, din alt unghi si in alta zi.
// Deci verdictul e ori 'confirmat', ori 'neconcludent'. Niciodata 'infirmat'.
async function confirma(grup) {
  const seturi = [];
  let blocat = false;
  for (const a of grup.anunturi) {
    const h = await hashuriPoze(a.url);
    if (h.blocat) blocat = h.blocat;
    seturi.push(new Set(h.hashuri));
    await new Promise(z => setTimeout(z, 400));
  }
  let comune = 0;
  for (let i = 0; i < seturi.length; i++)
    for (let j = i + 1; j < seturi.length; j++)
      comune += [...seturi[i]].filter(h => seturi[j].has(h)).length;
  const citite = seturi.filter(s => s.size).length;
  if (comune) return { comune, verdict: 'confirmat' };
  if (blocat || citite < 2) return { comune: 0, verdict: `neconcludent (${blocat || 'fara poze'})` };
  return { comune: 0, verdict: 'neconcludent — poze proprii la fiecare agentie' };
}

module.exports = { grupeaza, scor, confirma, hashuriPoze, idAnunt };

// ---------- rulare directa ----------

if (require.main === module) (async () => {
  const f = fs.readdirSync(DOSAR).filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  const lista = JSON.parse(fs.readFileSync(path.join(DOSAR, f), 'utf8')).filter(x => x.tip === 'casa');
  const grupuri = grupeaza(lista).filter(g => g.anunturi.length > 1)
    .sort((a, b) => b.anunturi.length - a.anunturi.length);

  console.log(`${f}: ${lista.length} case in ${grupeaza(lista).length} proprietati distincte`);
  console.log(`${grupuri.length} proprietati au mai mult de un anunt\n`);

  const poze = process.argv.includes('--poze');
  for (const g of grupuri) {
    const p = g.anunturi.map(a => a.pret).filter(Boolean);
    console.log(`${g.anunturi.length} anunturi · ${Math.min(...p).toLocaleString('ro-RO')}–`
      + `${Math.max(...p).toLocaleString('ro-RO')} € · ${g.sef.zona}`);
    console.log(`  de ce: ${g.motive.join(', ')}`);
    if (poze) {
      const c = await confirma(g);
      console.log(`  poze: ${c.verdict}${c.comune ? ` (${c.comune} identice)` : ''}`);
    }
    g.anunturi.sort((a, b) => (a.pret || 0) - (b.pret || 0)).forEach(a => {
      console.log(`    ${String(a.pret).padStart(7)} € · ${String(a.mpu || '?').padStart(4)} mp · `
        + `${a.creat} · ${a.url}`);
    });
    console.log();
  }
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
