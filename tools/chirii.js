// Cat se cere pe chirie, pe cartiere, pentru apartamente cu 2 camere in Sibiu.
//
//   node tools/chirii.js
//
// Intrebarea la care raspunde: unde se cumpara ieftin SI se inchiriaza usor.
// Pretul singur nu ajunge - un cartier ieftin in care nu cauta nimeni chirie
// e o capcana. Asa ca scoate din Storia si anunturile de vanzare, si pe cele
// de inchiriere, le grupeaza pe cartier si calculeaza:
//
//   pret median      cat ceri ca sa cumperi acolo
//   chirie mediana   cat se cere pe luna acolo
//   ani             pretul impartit la chiria pe un an (mai mic = mai bine)
//   oferta          cate apartamente stau pe piata la inchiriat in cartier
//
// "Oferta" e cheia pentru "sansa sa inchiriez": multe anunturi de inchiriere
// intr-un cartier mic inseamna concurenta, nu cerere. Se citeste impreuna cu
// numarul de anunturi de vanzare.

const fs = require('fs');
const path = require('path');

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const BUILD = path.join(__dirname, 'storia-build.json');

let BUILD_ID = null;

// buildId-ul se schimba la fiecare deploy Storia, adica de cateva ori pe
// saptamana, si atunci endpointul de date da 404. Se ia din pagina normala.
async function reimprospateaza() {
  const r = await fetch('https://www.storia.ro/ro/rezultate/vanzare/apartament/sibiu/sibiu', { headers: UA });
  const h = await r.text();
  const m = h.match(/"buildId":"([^"]+)"/);
  if (!m) throw new Error('nu am gasit buildId in pagina Storia');
  BUILD_ID = m[1];
  fs.writeFileSync(BUILD, JSON.stringify({ buildId: BUILD_ID, actualizat: new Date().toISOString().slice(0, 10) }) + '\n');
  console.log('buildId nou:', BUILD_ID);
}

function buildId() {
  if (BUILD_ID) return BUILD_ID;
  BUILD_ID = JSON.parse(fs.readFileSync(BUILD, 'utf8')).buildId;
  return BUILD_ID;
}

async function cauta(tranzactie, pagina) {
  const b = buildId();
  const u = `https://www.storia.ro/_next/data/${b}/ro/rezultate/${tranzactie}/apartament/sibiu/sibiu.json`
    + `?limit=72&page=${pagina}`
    + `&searchingCriteria=${tranzactie}&searchingCriteria=apartament&searchingCriteria=sibiu&searchingCriteria=sibiu`;
  const r = await fetch(u, { headers: UA });
  if (r.status === 404) throw new Error('buildId expirat - ia unul nou din browser si pune-l in tools/storia-build.json');
  if (!r.ok) throw new Error(tranzactie + ' status ' + r.status);
  const j = await r.json();
  return (((j.pageProps || {}).data || {}).searchAds || {}).items || [];
}

function inOras(x) {
  const locs = (((x.location || {}).reverseGeocoding || {}).locations) || [];
  return locs.some(l => l.locationLevel === 'county_capital' && /^sibiu$/i.test(l.name));
}

// Cartierul vine ca ultima treapta din reverseGeocoding. Anunturile care nu
// trec de nivelul orasului raman fara cartier - agentul nu a pus adresa.
function cartier(x) {
  const locs = (((x.location || {}).reverseGeocoding || {}).locations) || [];
  const ultim = locs[locs.length - 1] || {};
  if (ultim.locationLevel !== 'district') return { nume: 'Fara cartier', id: null };
  return { nume: String(ultim.name || '').trim(), id: ultim.id || null };
}

const linkCartier = (id, tranzactie) => id
  ? `https://www.storia.ro/ro/rezultate/${tranzactie}/apartament/${id}`
  : null;

async function toate(tranzactie) {
  let out = [];
  for (let p = 1; p <= 6; p++) {
    const it = await cauta(tranzactie, p);
    if (!it.length) break;
    out = out.concat(it);
    await new Promise(r => setTimeout(r, 300));
  }
  // Filtrul de camere pus in URL trimite raspunsul intr-un redirect, asa ca
  // se cer toate apartamentele si se taie aici, dupa campul din rezultat.
  return out.filter(x => inOras(x) && x.roomsNumber === 'TWO');
}

const mediana = v => {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

(async () => {
  await reimprospateaza();
  const vanzari = await toate('vanzare');
  const chirii = await toate('inchiriere');
  console.log(`vanzare: ${vanzari.length} apartamente 2 camere in oras`);
  console.log(`inchiriere: ${chirii.length} apartamente 2 camere in oras\n`);

  const z = {};
  const pune = (x, camp) => {
    const { nume: c, id } = cartier(x);
    const e = z[c] || (z[c] = { id, vanzare: [], vanzareMp: [], chirie: [] });
    if (!e.id && id) e.id = id;
    const p = x.totalPrice ? x.totalPrice.value : null;
    if (!p) return;
    if (camp === 'chirie') { e.chirie.push(p); return; }
    e.vanzare.push(p);
    if (x.areaInSquareMeters) e.vanzareMp.push(p / x.areaInSquareMeters);
  };
  vanzari.forEach(x => pune(x, 'vanzare'));
  chirii.forEach(x => pune(x, 'chirie'));

  const randuri = Object.entries(z).map(([c, e]) => {
    const pv = mediana(e.vanzare);
    const ch = mediana(e.chirie);
    return {
      cartier: c,
      nv: e.vanzare.length,
      nc: e.chirie.length,
      pret: pv,
      ppm: e.vanzareMp.length ? Math.round(mediana(e.vanzareMp)) : null,
      chirie: ch,
      ani: pv && ch ? +(pv / (ch * 12)).toFixed(1) : null,
      linkVanzare: linkCartier(e.id, 'vanzare'),
      linkChirie: linkCartier(e.id, 'inchiriere'),
    };
  }).filter(r => r.nv >= 3 && r.nc >= 3).sort((a, b) => (a.ani || 99) - (b.ani || 99));

  const cap = ['cartier', 'vanzari', 'chirii', 'pret median', 'EUR/mp', 'chirie', 'ani'];
  const lat = [22, 7, 6, 11, 7, 7, 5];
  console.log(cap.map((c, i) => c.padEnd(lat[i])).join(''));
  console.log(lat.map(n => '-'.repeat(n - 1) + ' ').join(''));
  randuri.forEach(r => {
    console.log([r.cartier.slice(0, 21), r.nv, r.nc, r.pret, r.ppm, r.chirie, r.ani]
      .map((v, i) => String(v == null ? '-' : v).padEnd(lat[i])).join(''));
  });

  fs.writeFileSync(path.join(__dirname, 'snapshots', `chirii-${new Date().toISOString().slice(0, 10)}.json`),
    JSON.stringify(randuri, null, 1));
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
