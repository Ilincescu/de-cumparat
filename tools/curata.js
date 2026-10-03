// Scoate din date.json ce nu vrea sa vada deloc: anunturi din afara orasului
// Sibiu si anunturi cu curte comuna. Filtrele paginii le ascundeau doar cand
// erau bifate, iar listele scoase din date - istoricul de preturi, tabelele -
// le aratau oricum.
//
//   node tools/curata.js            proba
//   node tools/curata.js --scrie    scrie in date.json

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');

// Localitati din judetul Sibiu care nu sunt orasul. Se verifica in titlu si in
// zona, fiindca anuntul poate avea pinul pe oras si casa in alta comuna.
const IN_AFARA = /r[aă][sș]inari|al[tț][aâ]na|tili[sș]ca|p[aă]ltini[sș]|[sș]ura mic|[sș]ura mare|bavaria|cisn[aă]die|[sș]elimb[aă]r|nucet|dealul sibiului|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|sadu|ro[sș]ia|cristian|vurp[aă]r|daia|corn[aă][tț]el|hosman|cop[sș]a|ru[sș]i|slimnic|de vacan[tț]/i;

// „Curtea este comună" nu se prinde cu /curte\s+comun/ - intre cele doua cuvinte
// incap altele. Asa a trecut de filtru casa de pe Eschil, care o scrie explicit.
// Acum se cauta cele doua cuvinte in aceeasi propozitie, in orice ordine.
const CURTE_COMUNA = /curt[eiă][^.!?]{0,40}comun|comun[ăa][^.!?]{0,40}curt|cot[aă]\s+parte|p[aă]r[tț]i\s+comune|[iî]n\s+indiviziune/i;

const cale = path.join(RADACINA, 'date.json');
const j = JSON.parse(fs.readFileSync(cale, 'utf8'));
const inainte = j.anunturi.length;

const scoase = { afara: [], comuna: [] };
j.anunturi = j.anunturi.filter(o => {
  const text = `${o.t || ''} ${o.z || ''} ${o.g || ''}`;
  if (o.af || IN_AFARA.test(text)) { scoase.afara.push(o); return false; }
  if (o.c === 'comuna' || CURTE_COMUNA.test(text)) { scoase.comuna.push(o); return false; }
  return true;
});

console.log(`date.json: ${inainte} -> ${j.anunturi.length}`);
console.log(`  ${scoase.afara.length} in afara orasului Sibiu`);
console.log(`  ${scoase.comuna.length} cu curte comuna`);

if (!SCRIE) { console.log('\n(proba; ruleaza cu --scrie ca sa salvez)'); process.exit(0); }
fs.writeFileSync(cale, JSON.stringify(j, null, 1));
console.log('\nscris in date.json');
