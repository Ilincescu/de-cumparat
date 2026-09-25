// Completeaza gm si c pentru anunturile deja aflate in date.json cu null la
// amandoua. Fara ele, filtrele implicite ale paginii - curte proprie si minim
// 100 mp - le ascund, desi anuntul e in fisier.
//
//   node tools/completeaza-curti.js            proba
//   node tools/completeaza-curti.js --scrie    scrie in date.json

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');

const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || u;

function curteDinDescriere(text) {
  if (!text) return null;
  const tipare = [
    /(?:teren|curte|gr[aă]din[aă])\s+liber[aă]?\s*(?:de|:)?\s*(\d{2,4})\s*(?:mp|m2|m²)/i,
    /(?:curte|gr[aă]din[aă])\s+(?:proprie\s+)?(?:de|cu)\s*(\d{2,4})\s*(?:mp|m2|m²)/i,
    /(\d{2,4})\s*(?:mp|m2|m²)\s+(?:de\s+)?(?:teren\s+liber|curte|gr[aă]din[aă])/i,
  ];
  for (const re of tipare) {
    const m = text.match(re);
    if (m) { const v = parseInt(m[1], 10); if (v >= 20 && v <= 5000) return v; }
  }
  return null;
}

// building_type 'detached' se afiseaza pe Storia ca 'Tip clădire: singur in
// curte'. E un camp completat de vanzator, deci trece drept confirmare, nu
// absenta mentiunii - exact ce cere filtrul de curte proprie.
function tipCurte(text, formaCladire) {
  const t = text || '';
  if (/curte\s+comun|[iî]n\s+comun|cot[aă]\s+parte/i.test(t)) return 'comuna';
  if (formaCladire === 'detached') return 'proprie';
  if (/curte\s+proprie|curte\s+privat|curte\s+individual|singur\s+[iî]n\s+curte|f[aă]r[aă]\s+p[aă]r[tț]i\s+comune/i.test(t)) return 'proprie';
  return null;
}

const dosar = path.join(__dirname, 'snapshots');
const descrieri = new Map();
const forme = new Map();
if (fs.existsSync(dosar)) {
  for (const f of fs.readdirSync(dosar).filter(x => x.startsWith('storia-')).sort()) {
    for (const x of JSON.parse(fs.readFileSync(path.join(dosar, f), 'utf8'))) {
      descrieri.set(idAnunt(x.url), `${x.titlu} ${x.descriere || ''}`);
      forme.set(idAnunt(x.url), x.formaCladire);
    }
  }
}
console.log(`descrieri disponibile din snapshoturi: ${descrieri.size}`);

const cale = path.join(RADACINA, 'date.json');
const j = JSON.parse(fs.readFileSync(cale, 'utf8'));

let completateGm = 0, completateC = 0, faraDescriere = 0;
for (const o of j.anunturi) {
  if (o.k !== 'casa') continue;
  if (o.gm != null && o.c != null) continue;
  const text = descrieri.get(idAnunt(o.u)) || o.t || '';
  if (!descrieri.has(idAnunt(o.u))) faraDescriere++;
  if (o.gm == null) { const v = curteDinDescriere(text); if (v) { o.gm = v; o.g = `curte libera ${v} mp`; completateGm++; } }
  if (o.c == null) { const t = tipCurte(text, forme.get(idAnunt(o.u))); if (t) { o.c = t; completateC++; } }
}

const case_ = j.anunturi.filter(o => o.k === 'casa');
console.log(`case: ${case_.length}`);
console.log(`  completate: gm ${completateGm}, c ${completateC}`);
console.log(`  fara descriere in snapshot: ${faraDescriere}`);
console.log(`  raman fara gm: ${case_.filter(o => o.gm == null).length}`);
console.log(`  raman fara c:  ${case_.filter(o => o.c == null).length}`);
console.log(`  trec de filtrele implicite (proprie + gm>=100): ${case_.filter(o => o.c === 'proprie' && o.gm >= 100).length}`);

if (!SCRIE) { console.log('\n(proba; ruleaza cu --scrie ca sa salvez)'); process.exit(0); }
fs.writeFileSync(cale, JSON.stringify(j, null, 1));
console.log('\nscris in date.json');
