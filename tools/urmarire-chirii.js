// Urmareste anunturile de inchiriat 2 camere din Sibiu, zi de zi, ca sa vedem
// in cate zile dispar, pe marimi. Asa se masoara cererea: chiria ceruta si
// numarul de anunturi arata oferta, nu cat de repede se inchiriaza
// (2026-10-26: "e mai greu de gasit chirias pentru un apartament mic?" - nu
// exista date publice despre asta, nici pentru Sibiu, nici pentru Romania).
//
//   node tools/urmarire-chirii.js            adauga scanarea de azi si raporteaza
//   node tools/urmarire-chirii.js raport     doar raportul
//
// Intrare: tools/externe/olx-chirii.json, scos cu browserul (prompt-zilnic.txt, d).
// Stare:   tools/chirii-urmarite.json, in git, ca sa nu se piarda istoria.
//
// Un anunt disparut nu e sigur inchiriat: poate fi expirat sau sters. De aceea
// raportul spune "disparut", nu "inchiriat", si citeste numai medianele.

const fs = require('fs');
const path = require('path');

const INTRARE = path.join(__dirname, 'externe', 'olx-chirii.json');
const STARE = path.join(__dirname, 'chirii-urmarite.json');
const AZI = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const BENZI = [[20, 40], [40, 50], [50, 60], [60, 200]];

const LUNI = { ianuarie: 1, februarie: 2, martie: 3, aprilie: 4, mai: 5, iunie: 6, iulie: 7, august: 8, septembrie: 9, octombrie: 10, noiembrie: 11, decembrie: 12 };

// "Sibiu - 09 octombrie 2026" sau "Sibiu - Azi la 10:15". "Reactualizat" muta
// data inainte, deci zilele masurate pot fi mai putine decat cele reale.
function dataPostarii(ld) {
  const s = String(ld || '').toLowerCase();
  if (/azi/.test(s)) return AZI;
  const m = s.match(/(\d{1,2})\s+([a-zăâîșț]+)\s+(\d{4})/);
  if (!m || !LUNI[m[2]]) return null;
  return `${m[3]}-${String(LUNI[m[2]]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

const zile = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const mediana = v => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
const id = u => (String(u).match(/-(ID[A-Za-z0-9]+)\.html/) || [])[1] || u;

function citesteStare() {
  try { return JSON.parse(fs.readFileSync(STARE, 'utf8')); }
  catch (e) { return { nota: 'Anunturi de inchiriat 2 camere Sibiu, urmarite zilnic de tools/urmarire-chirii.js.', scanari: [], anunturi: {} }; }
}

function adauga(stare) {
  if (!fs.existsSync(INTRARE) || fs.statSync(INTRARE).mtime.toISOString().slice(0, 10) !== AZI) {
    console.log('olx-chirii.json nu e de azi - nu adaug nimic (pasul d din prompt-zilnic.txt)');
    return false;
  }
  let lista = JSON.parse(fs.readFileSync(INTRARE, 'utf8'));
  if (typeof lista === 'string') lista = JSON.parse(lista);
  const vazute = new Set();
  for (const x of lista) {
    // Cardul poate avea doua sume lipite ("330 €Pretul e negociabil 280"): iau suma din fata lui €
    const m = String(x.p || '').match(/(\d[\d .]*)\s*€/);
    const pret = m ? Number(m[1].replace(/[^\d]/g, '')) || null : null;
    const k = id(x.u);
    vazute.add(k);
    const a = stare.anunturi[k] || (stare.anunturi[k] = {
      u: x.u, t: x.t, mp: Number(String(x.mp || '').replace(',', '.')) || null, zona: x.z || null,
      postat: dataPostarii(x.ld), vazut_prima: AZI, preturi: [],
    });
    a.vazut_ultima = AZI;
    a.disparut = null;
    if (pret && a.preturi[a.preturi.length - 1] !== pret) a.preturi.push(pret);
  }
  for (const [k, a] of Object.entries(stare.anunturi)) if (!vazute.has(k) && !a.disparut) a.disparut = AZI;
  if (!stare.scanari.includes(AZI)) stare.scanari.push(AZI);
  fs.writeFileSync(STARE, JSON.stringify(stare, null, 1) + '\n');
  console.log(`azi: ${lista.length} anunturi, ${Object.keys(stare.anunturi).length} urmarite in total`);
  return true;
}

function raport(stare) {
  // Sub 150 € e pret pe noapte (regim hotelier), nu chirie pe luna
  const toate = Object.values(stare.anunturi).filter(x => (x.preturi[x.preturi.length - 1] || 0) >= 150);
  console.log(`\nCHIRII 2 CAMERE SIBIU (OLX) — ${stare.scanari.length} scanări, din ${stare.scanari[0] || '—'}`);
  if (stare.scanari.length < 2) console.log('  Prima scanare: zilele până la dispariție apar de la a doua încolo.');
  for (const [a, b] of BENZI) {
    const g = toate.filter(x => x.mp >= a && x.mp < b);
    const duse = g.filter(x => x.disparut);
    const z = duse.map(x => x.postat ? zile(x.postat, x.disparut) : null).filter(n => n != null && n >= 0);
    const active = g.filter(x => !x.disparut).map(x => x.postat ? zile(x.postat, AZI) : null).filter(n => n != null);
    console.log(`  ${a}-${b === 200 ? '+' : b} mp: ${g.length} văzute, ${duse.length} dispărute`
      + (z.length ? `, dispar în mediana ${mediana(z)} zile` : '')
      + (active.length ? ` · active de mediana ${mediana(active)} zile` : ''));
  }
}

const stare = citesteStare();
if (process.argv[2] !== 'raport') adauga(stare);
raport(stare);
