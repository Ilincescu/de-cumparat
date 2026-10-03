// Serie de preturi cerute pentru casele din Sibiu, reconstruita din capturile
// archive.org ale paginii de rezultate Storia.
//
//   node tools/istoric-piata.js
//
// De ce exista: in Romania nu se publica preturi de tranzactie. Singurul mod de
// a vedea cum s-a miscat piata inainte sa incep eu sa o urmaresc (13 septembrie
// 2026) e sa citesc paginile asa cum aratau atunci. Wayback Machine a salvat
// pagina de cautare de cateva ori pe an.
//
// Metoda e identica la fiecare data: aceeasi pagina, acelasi filtru implicit,
// aceeasi extragere din __NEXT_DATA__. Deci seria e comparabila cu ea insasi,
// chiar daca e construita pe un singur ecran de rezultate.
//
// ATENTIE: sunt PRETURI CERUTE, nu de tranzactie. Si sunt anunturile active la
// data aceea, adica tocmai cele care nu se vandusera inca.

const fs = require('fs');
const path = require('path');

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const TINTA = 'https://www.storia.ro/ro/rezultate/vanzare/casa/sibiu/sibiu';
const IESIRE = path.join(__dirname, '..', 'istoric-piata.json');

const mediana = v => {
  if (!v.length) return null;
  const a = [...v].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
};

function inOras(x) {
  const locs = (((x.location || {}).reverseGeocoding || {}).locations) || [];
  return locs.some(l => l.locationLevel === 'county_capital' && /^sibiu$/i.test(l.name));
}

async function capturi() {
  const u = 'http://web.archive.org/cdx/search/cdx?url='
    + encodeURIComponent('storia.ro/ro/rezultate/vanzare/casa/sibiu/sibiu')
    + '&output=json&fl=timestamp,statuscode&filter=statuscode:200&collapse=timestamp:8';
  const j = await (await fetch(u, { headers: UA })).json();
  return j.slice(1).map(r => r[0]).sort();
}

async function citeste(ts) {
  const u = `http://web.archive.org/web/${ts}id_/${TINTA}`;
  const r = await fetch(u, { headers: UA });
  if (!r.ok) return null;
  const h = await r.text();
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  let j;
  try { j = JSON.parse(m[1]); } catch (e) { return null; }
  const pp = (j.props || {}).pageProps || {};
  const s = ((pp.data || {}).searchAds) || {};
  const items = (s.items || []).filter(inOras);
  if (!items.length) return null;
  const preturi = items.map(x => x.totalPrice && x.totalPrice.value).filter(Boolean);
  const ppm = items.filter(x => x.areaInSquareMeters && x.totalPrice)
    .map(x => x.totalPrice.value / x.areaInSquareMeters);
  return {
    data: `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`,
    peEcran: items.length,
    totalPeSite: s.totalResults || null,
    pretMedian: mediana(preturi),
    pretMin: Math.min(...preturi),
    pretMax: Math.max(...preturi),
    eurPeMpMedian: ppm.length ? Math.round(mediana(ppm)) : null,
  };
}

(async () => {
  const ts = await capturi();
  console.log(`capturi gasite in archive.org: ${ts.length}`);
  const serie = [];
  for (const t of ts) {
    const r = await citeste(t);
    if (r) { serie.push(r); console.log('  ' + r.data + '  ok'); }
    else console.log('  ' + t.slice(0, 8) + '  fara date');
    await new Promise(z => setTimeout(z, 1200));
  }

  console.log('\ndata        n   total  pret median   min      max     EUR/mp');
  console.log('----------  --  -----  -----------  -------  -------  ------');
  serie.forEach(r => console.log(
    r.data + '  ' + String(r.peEcran).padStart(2) + '  '
    + String(r.totalPeSite || '-').padStart(5) + '  '
    + String(r.pretMedian).padStart(11) + '  '
    + String(r.pretMin).padStart(7) + '  '
    + String(r.pretMax).padStart(7) + '  '
    + String(r.eurPeMpMedian || '-').padStart(6)));

  if (serie.length > 1) {
    const a = serie[0], b = serie[serie.length - 1];
    const d = Math.round((b.pretMedian - a.pretMedian) / a.pretMedian * 100);
    console.log(`\n${a.data} -> ${b.data}: mediana ${a.pretMedian} -> ${b.pretMedian} EUR (${d > 0 ? '+' : ''}${d}%)`);
  }

  fs.writeFileSync(IESIRE, JSON.stringify({
    actualizat: new Date().toISOString().slice(0, 10),
    sursa: 'capturi archive.org ale paginii Storia de case din orasul Sibiu',
    avertisment: 'Preturi CERUTE, nu de tranzactie. Un singur ecran de rezultate per data, aceeasi metoda la fiecare. Esantion mic - citeste n.',
    serie,
  }, null, 1));
  console.log('\nscris in istoric-piata.json');
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
