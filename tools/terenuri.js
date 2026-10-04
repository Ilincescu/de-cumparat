// Terenuri de construit in orasul Sibiu.
//
//   node tools/terenuri.js            toate, grupate pe cartier
//   node tools/terenuri.js 300 800    doar intre 300 si 800 mp
//
// Varianta "cumpar teren si construiesc" nu fusese niciodata masurata. Scriptul
// ia terenurile din oras, scoate cele agricole si cele fara acces, si arata
// pretul pe metru patrat pe cartier - ca sa se vada unde e teren si cat costa.
//
// Filtrul de oras e acelasi ca la case: locationLevel 'county_capital'. Comunele
// din jur, oricat de aproape, nu intra.

const fs = require('fs');
const path = require('path');

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const BUILD = path.join(__dirname, 'storia-build.json');
let BUILD_ID = null;

async function reimprospateaza() {
  const r = await fetch('https://www.storia.ro/ro/rezultate/vanzare/teren/sibiu/sibiu', { headers: UA });
  const m = (await r.text()).match(/"buildId":"([^"]+)"/);
  if (!m) throw new Error('nu gasesc buildId');
  BUILD_ID = m[1];
  fs.writeFileSync(BUILD, JSON.stringify({ buildId: BUILD_ID, actualizat: new Date().toISOString().slice(0, 10) }) + '\n');
  return BUILD_ID;
}

function buildId() {
  if (BUILD_ID) return BUILD_ID;
  BUILD_ID = JSON.parse(fs.readFileSync(BUILD, 'utf8')).buildId;
  return BUILD_ID;
}

async function cauta(pagina, aDoua) {
  const u = `https://www.storia.ro/_next/data/${buildId()}/ro/rezultate/vanzare/teren/sibiu/sibiu.json`
    + `?limit=72&page=${pagina}`
    + `&searchingCriteria=vanzare&searchingCriteria=teren&searchingCriteria=sibiu&searchingCriteria=sibiu`;
  const r = await fetch(u, { headers: UA });
  if (r.status === 404) {
    if (aDoua) throw new Error('404 si dupa buildId nou');
    await reimprospateaza();
    return cauta(pagina, true);
  }
  if (!r.ok) throw new Error('status ' + r.status);
  const j = await r.json();
  return (((j.pageProps || {}).data || {}).searchAds || {}).items || [];
}

const inOras = x => ((((x.location || {}).reverseGeocoding || {}).locations) || [])
  .some(l => l.locationLevel === 'county_capital' && /^sibiu$/i.test(l.name));

// Eticheta de cartier nu spune cat de departe esti. Calea Rasinari e trecuta
// "Valea Aurie" si e la 6,9 km de centru; Zorabia suna periferic si e la 2,5.
// Distanta in linie dreapta pana in Piata Mare taie discutia.
// Coordonatele nu vin in rezultatele cautarii, doar pe pagina anuntului. Le cer
// doar pentru cele cateva cu dovezi, nu pentru toate.
const CENTRU = [45.7971, 24.1519];
async function km(url) {
  try {
    const h = await (await fetch(url, { headers: UA })).text();
    const m = h.match(/"latitude":([0-9.]+),"longitude":([0-9.]+)/);
    if (!m) return null;
    const R = 6371, r = g => g * Math.PI / 180;
    const dLat = r(Number(m[1]) - CENTRU[0]), dLon = r(Number(m[2]) - CENTRU[1]);
    const d = Math.sin(dLat / 2) ** 2 + Math.cos(r(CENTRU[0])) * Math.cos(r(Number(m[1]))) * Math.sin(dLon / 2) ** 2;
    return Number((2 * R * Math.asin(Math.sqrt(d))).toFixed(1));
  } catch (e) { return null; }
}

function cartier(x) {
  const locs = (((x.location || {}).reverseGeocoding || {}).locations) || [];
  const u = locs[locs.length - 1] || {};
  return u.locationLevel === 'district' ? String(u.name).trim() : 'fara cartier';
}

// Ce nu e teren de casa: agricol, fara acces, sau prea mic ca sa incapa ceva.
const NEPOTRIVIT = /agricol|arabil|extravilan|f[aă]r[aă]\s+acces|[iî]nfundat|f[aă]r[aă]\s+utilit[aă][tț]i|p[aă][sș]une|livad[aă]|f[aâ][nș]ea[tț]/i;

// Pinul poate cadea in oras si terenul sa fie in alta parte - la terenuri se
// intampla mai des decat la case, pentru ca multe sunt parcelari de la margine.
// Aceeasi lista ca in scan.js.
const IN_AFARA = /r[aă][sș]inari|al[tț][aâ]na|tili[sș]ca|p[aă]ltini[sș]|[sș]ura mic|[sș]ura mare|bavaria|cisn[aă]die|[sș]elimb[aă]r|nucet|dealul sibiului|dealul daii|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|sadu|tocile|ro[sș]ia|cristian|vurp[aă]r|daia|corn[aă][tț]el|hosman|cop[sș]a|ru[sș]ciori|ru[sș]i|slimnic|de vacan[tț]|cabane|sat\s/i;

const med = v => { const a = [...v].sort((x, y) => x - y); const m = Math.floor(a.length / 2); return a.length ? (a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2)) : null; };

// Dovezi ca se poate construi, in ordinea puterii. Un teren intravilan NU e
// automat construibil - poate fi zonat industrial, spatiu verde sau circulatii.
// Singurul act care raspunde sigur e certificatul de urbanism, dar anunturile
// care pomenesc PUZ aprobat sau autorizatie sunt cele mai aproape de o dovada.
const DOVEZI = [
  { nume: 'autorizație de construire', re: /autoriza[tț]ie de construire|AC emis|cu autoriza[tț]ie/i, forta: 5 },
  { nume: 'PUZ aprobat', re: /PUZ\s*(aprobat|finalizat|adoptat)|cu PUZ\b/i, forta: 4 },
  { nume: 'proiect autorizat', re: /proiect autorizat|proiect aprobat/i, forta: 4 },
  { nume: 'certificat de urbanism', re: /certificat de urbanism|CU emis/i, forta: 3 },
  { nume: 'utilități la teren', re: /utilit[aă][tț]i(le)?\s*(la|pe|în|in|sunt|trase|existente|disponibile)|toate utilit[aă][tț]ile|branșament/i, forta: 2 },
  { nume: 'POT/CUT date', re: /\bPOT\b|\bCUT\b/i, forta: 2 },
  { nume: 'vecini construiți', re: /zon[aă] de case|cartier de case|case noi|vecin[aă]tate construit/i, forta: 1 },
];

(async () => {
  const min = Number(process.argv[2]) || 0;
  const max = Number(process.argv[3]) || 1e9;

  let brute = [];
  for (let p = 1; p <= 5; p++) {
    const it = await cauta(p);
    if (!it.length) break;
    brute = brute.concat(it);
    await new Promise(z => setTimeout(z, 300));
  }

  const oras = brute.filter(inOras);
  const bune = oras.filter(x => {
    const t = (x.title || '') + ' ' + (x.description || '');
    if (NEPOTRIVIT.test(t) || IN_AFARA.test(t)) return false;
    const mp = x.areaInSquareMeters;
    return mp && mp >= min && mp <= max;
  });

  console.log(`terenuri in judet: ${brute.length} | in orasul Sibiu: ${oras.length}`);
  console.log(`dupa filtrare (fara agricol, extravilan, fara acces${min || max < 1e9 ? `, ${min}-${max} mp` : ''}): ${bune.length}\n`);

  const peCartier = {};
  bune.forEach(x => {
    const c = cartier(x);
    const pret = x.totalPrice ? x.totalPrice.value : null;
    if (!pret) return;
    (peCartier[c] = peCartier[c] || []).push({
      pret, mp: x.areaInSquareMeters,
      ppm: pret / x.areaInSquareMeters,
      titlu: x.title,
      url: 'https://www.storia.ro/ro/oferta/' + x.slug,
    });
  });

  const randuri = Object.entries(peCartier)
    .map(([c, l]) => ({ c, n: l.length, ppm: Math.round(med(l.map(x => x.ppm))), pret: med(l.map(x => x.pret)), mp: med(l.map(x => x.mp)) }))
    .filter(r => r.n >= 2)
    .sort((a, b) => a.ppm - b.ppm);

  console.log('cartier                 n   EUR/mp   pret median   mp median');
  console.log('---------------------  --  -------  ------------  ---------');
  randuri.forEach(r => console.log(
    r.c.padEnd(22) + ' ' + String(r.n).padStart(2) + '  '
    + String(r.ppm).padStart(7) + '  ' + String(r.pret).padStart(12) + '  ' + String(r.mp).padStart(9)));

  const toate = Object.values(peCartier).flat();
  if (toate.length) console.log(`\nmediana pe tot orasul: ${Math.round(med(toate.map(x => x.ppm)))} EUR/mp`);

  // Cu ce dovada vine fiecare ca se poate construi pe el
  const cuDovezi = bune.map(x => {
    const t = (x.title || '') + ' ' + (x.description || '');
    const d = DOVEZI.filter(z => z.re.test(t));
    return {
      pret: x.totalPrice ? x.totalPrice.value : null,
      mp: x.areaInSquareMeters,
      titlu: x.title,
      url: 'https://www.storia.ro/ro/oferta/' + x.slug,
      cartier: cartier(x),
      dovezi: d.map(z => z.nume),
      scor: d.reduce((s, z) => s + z.forta, 0),
    };
  }).filter(x => x.pret && x.scor > 0).sort((a, b) => b.scor - a.scor || a.pret / a.mp - b.pret / b.mp);

  console.log(`\n${'='.repeat(70)}`);
  console.log('CU CE DOVADA VINE CA SE POATE CONSTRUI');
  console.log('='.repeat(70));
  console.log('Nimic de aici nu inlocuieste certificatul de urbanism, 11 lei.');
  console.log('Astea sunt doar anunturile care spun ceva verificabil.\n');
  const lot = cuDovezi.slice(0, 15);
  for (const x of lot) { x.km = await km(x.url); await new Promise(z => setTimeout(z, 300)); }
  lot.forEach(x => {
    console.log(`${String(Math.round(x.pret / x.mp)).padStart(4)} EUR/mp | ${String(x.pret).padStart(7)} EUR | ${String(x.mp).padStart(5)} mp | ${String(x.km == null ? '?' : x.km).padStart(4)} km de centru | ${x.cartier}`);
    console.log(`   ${String(x.titlu).slice(0, 62)}`);
    console.log(`   dovezi: ${x.dovezi.join(', ')}`);
    console.log(`   ${x.url}\n`);
  });
  const fara = bune.length - cuDovezi.length;
  if (fara > 0) console.log(`${fara} anunturi nu spun nimic despre construibilitate.`);
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
