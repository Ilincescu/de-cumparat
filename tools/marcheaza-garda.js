// Marcheaza fiecare masina cu gj = true cand are garda joasa, in loc sa o
// scoata din lista. Pana acum masinile joase erau sterse, iar cele din Sibiu
// dispareau cu totul, inclusiv de la favorite. Acum raman in fisier si le
// ascunde o bifa pe pagina.
//
//   node tools/marcheaza-garda.js            proba
//   node tools/marcheaza-garda.js --scrie    scrie in masini.json

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');

const GARDA_INALTA = new RegExp([
  'duster', 'stepway', 'tivoli', 'compass', 'renegade',
  '2008', '3008', '5008', 'aircross', 'crossland', 'grandland', 'captur', 'juke',
  'tucson', 'kona', 'santa fe', 'sportage', 'sorento', 'niro',
  'cx-?[35]', 'rav4', 'x-?trail', 'qashqai', 'koleos', 'arkana',
  'vitara', 'jimny', 's-?cross', 'ignis', 'wrangler', 'defender',
  'tiguan', 't-?cross', 't-?roc', 'taigo', 'kamiq', 'karoq', 'kodiaq', 'q[2358]\\b',
  'ecosport', 'kuga', 'puma', 'bronco',
  'xc[46]0', 'x[1356]\\b', 'gla', 'glb', 'glc',
  'dokker', 'caddy', 'berlingo', 'partner', 'rifter', 'combo', 'doblo', 'express',
].join('|'), 'i');

const cale = path.join(RADACINA, 'masini.json');
const j = JSON.parse(fs.readFileSync(cale, 'utf8'));

let joase = 0, inalte = 0;
for (const m of j.masini) {
  m.gj = !GARDA_INALTA.test(m.m || '');
  if (m.gj) joase++; else inalte++;
}

j.observatii = (j.observatii || []).filter(o => !/garda joasa/i.test(o));
j.observatii.push('Masinile cu garda joasa nu se mai sterg din lista, ci se marcheaza cu gj = true. Pe pagina le ascunde bifa "ascunde garda joasa", pornita implicit. Asa raman in fisier si nu dispar de la favorite.');

console.log(`masini: ${j.masini.length} | garda inalta ${inalte} | garda joasa ${joase}`);
if (!SCRIE) { console.log('\n(proba; ruleaza cu --scrie ca sa salvez)'); process.exit(0); }
fs.writeFileSync(cale, JSON.stringify(j, null, 1));
console.log('\nscris in masini.json');
