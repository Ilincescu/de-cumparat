// Ce a mai aparut de ieri. Trei case, trei masini, atat.
//
//   node tools/azi.js              fata de rularea anterioara
//   node tools/azi.js --zile 7     ce a aparut in ultimele 7 zile
//   node tools/azi.js --scrie      scrie si azi.json, pentru pagina
//   node tools/azi.js --tot        arata si ce a picat, si de ce
//
// Ruleaza dupa tools/update.js, care face scanarea. Aici nu se scaneaza nimic,
// doar se compara snapshotul de azi cu cel anterior si se alege.
//
// Filtrele tari exclud, punctajul doar ordoneaza ce a trecut de ele. Ce a
// respins deja e in tools/respinse.json, nu in cod.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const DOSAR = path.join(__dirname, 'snapshots');

const respinse = JSON.parse(fs.readFileSync(path.join(__dirname, 'respinse.json'), 'utf8'));
const ID_RESPINSE = new Set(respinse.case.map(x => x.id));
const MASINI_RESPINSE = new RegExp(
  respinse.masini.map(x => x.model).concat(respinse.modele_prea_mici)
    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || String(u);

// ---------- criteriile lui, ca filtre tari ----------

const AFARA = /r[aă][sș]inari|al[tț][aâ]na|tili[sș]ca|p[aă]ltini[sș]|[sș]ura mic|[sș]ura mare|bavaria|cisn[aă]die|[sș]elimb[aă]r|nucet|dealul sibiului|dealul daii|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|sadu|tocile|ro[sș]ia|cristian|vurp[aă]r|daia|corn[aă][tț]el|hosman|cop[sș]a|ru[sș]ciori|ru[sș]i|slimnic|de vacan[tț]/i;
const COMUNA = /curt[eiă][^.!?]{0,40}comun|comun[ăa][^.!?]{0,40}curt|cot[aă]\s+parte|p[aă]r[tț]i\s+comune|[iî]n\s+indiviziune/i;
const CORPURI = /2 corpuri|dou[aă] corpuri|duplex|triplex|cvadruplex|garsonier|[iî]n[sș]iruit/i;
const SERVITUTE = /servitute|drept de trecere|acces prin curtea/i;
const BETON = /curte pavat|curte betonat|complet pavat|integral pavat|pavat[aă] integral/i;
const VERDE = /gr[aă]din[aă]|curte verde|spa[tț]iu verde|pomi fructiferi|iarb[aă]|livad[aă] [iî]n curte/i;

// Curea de distributie in baie de ulei - se schimba la 100.000 km si costa cat
// o reparatie mare daca se rupe. Nu e un defect al anuntului, e un cost de stiut.
const CUREA_IN_ULEI = /puretech|ecoboost 1\.0|1\.2 puretech/i;

const snapshots = () => fs.readdirSync(DOSAR)
  .filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort()
  .map(x => ({ data: x.slice(7, 17), cale: path.join(DOSAR, x) }));

// ---------- case ----------

// Cat teren ramane liber dupa ce scazi amprenta casei. Daca anuntul o spune, o
// iau de acolo; altfel scad suprafata construita la sol. Cand casa are etaj,
// mp utili supraestimeaza amprenta, deci cifra e prudenta.
function curteLibera(x) {
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  const m = t.match(/(?:teren|curte|gr[aă]din[aă])\s+liber[aă]?\s*(?:de|:)?\s*(\d{2,4})\s*(?:mp|m2|m²)/i);
  if (m) return { mp: Number(m[1]), sigur: true };
  if (x.teren && x.mpu) return { mp: Math.max(0, x.teren - Math.round(x.mpu * 0.7)), sigur: false };
  return { mp: null, sigur: false };
}

function filtreazaCasa(x) {
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  if (ID_RESPINSE.has(idAnunt(x.url))) return 'respinsa deja';
  if (x.exclus && x.exclus.length) return 'exclusa automat: ' + [].concat(x.exclus).join(', ');
  if (AFARA.test(t)) return 'in afara orasului';
  if (COMUNA.test(t)) return 'curte comuna';
  if (CORPURI.test(t)) return 'doua corpuri sau garsoniera';
  if (SERVITUTE.test(t)) return 'acces prin curtea altuia';
  if (!x.pret || x.pret > 250000) return 'peste buget';
  if (!x.mpu || x.mpu < 50) return 'sub 50 mp utili';
  const c = curteLibera(x);
  if (c.mp != null && c.mp < 100) return `curte ~${c.mp} mp, sub 100`;
  if (c.mp == null) return 'nu scrie terenul';
  return null;
}

function punctajCasa(x) {
  let p = 0;
  const c = curteLibera(x);
  if (c.mp >= 150 && c.mp <= 450) p += 30;      // gradina, dar nu de intretinut cu tractorul
  else if (c.mp > 450) p += 18;
  else p += 12;
  if (x.mpu >= 70 && x.mpu <= 100) p += 25;     // banda lui
  else if (x.mpu <= 130) p += 14;
  else p += 4;                                   // peste 130 mp = incalzit si zugravit degeaba
  if (x.stare === 'ready_to_use') p += 12;
  p += Math.round((250000 - x.pret) / 250000 * 25);
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  if (BETON.test(t)) p -= 15;
  if (VERDE.test(t)) p += 10;
  return p;
}

// ---------- masini ----------

function filtreazaMasina(m) {
  if (m.gj) return 'garda joasa';
  if (MASINI_RESPINSE.test(m.m || '')) return 'respinsa sau mai mica decat C3';
  if (!m.an || m.an < 2020) return 'mai veche de 2020';
  if (!m.km || m.km >= 100000) return 'peste 100.000 km';
  if (!m.p || m.p > 11500) return 'peste buget';
  return null;
}

function punctajMasina(m) {
  let p = (m.an - 2019) * 8;
  p += Math.round((100000 - m.km) / 100000 * 30);
  p += Math.round((11500 - m.p) / 11500 * 25);
  if (/sibiu|[sș]elimb[aă]r|cristian|cisn[aă]die/i.test(m.z || '')) p += 15;
  if (CUREA_IN_ULEI.test((m.m || '') + ' ' + (m.warn || ''))) p -= 25;
  else if (m.warn) p -= 8;
  return p;
}

// ---------- rulare ----------

const arg = process.argv.slice(2);
const zile = arg.includes('--zile') ? Number(arg[arg.indexOf('--zile') + 1]) : null;
const scrie = arg.includes('--scrie');
const tot = arg.includes('--tot');

const snaps = snapshots();
if (snaps.length < 2) { console.log('am nevoie de cel putin doua snapshoturi'); process.exit(0); }

const acum = snaps[snaps.length - 1];
let referinta;
if (zile) {
  const prag = new Date(Date.now() - zile * 86400000).toISOString().slice(0, 10);
  const vechile = snaps.filter(s => s.data <= prag);
  referinta = vechile.length ? vechile[vechile.length - 1] : snaps[0];
} else {
  referinta = snaps[snaps.length - 2];
}

const azi = JSON.parse(fs.readFileSync(acum.cale, 'utf8'));
const vazute = new Set(JSON.parse(fs.readFileSync(referinta.cale, 'utf8')).map(x => idAnunt(x.url)));

// "Nou" inseamna postat pe Storia dupa data de referinta, nu "lipsea din
// snapshotul meu anterior". Pe 30 septembrie am inceput sa scanez mai multe
// pagini, si diferenta intre snapshoturi a scos deodata 143 de case "noi",
// dintre care unele erau pe piata din ianuarie. Data de postare nu minte.
const esteNou = x => x.creat && x.creat > referinta.data;

function alege(lista) {
  const trec = [], picate = [];
  lista.forEach(x => {
    const motiv = filtreazaCasa(x);
    if (motiv) picate.push({ x, motiv }); else trec.push({ x, p: punctajCasa(x) });
  });
  trec.sort((a, b) => b.p - a.p);
  return { trec, picate };
}

const toateCasele = azi.filter(x => x.tip === 'casa');
const caseNoi = toateCasele.filter(esteNou);
let { trec, picate } = alege(caseNoi);
let topCase = trec.slice(0, 3), dinRezerva = false;

// Multe dimineti nu aduc nimic. In loc de o pagina goala, arat cele mai bune
// din ultima saptamana - dar spun pe fata ca nu sunt de azi.
const SAPT = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
if (!topCase.length) {
  const r = alege(toateCasele.filter(x => x.creat > SAPT && !caseNoi.includes(x)));
  topCase = r.trec.slice(0, 3);
  dinRezerva = topCase.length > 0;
}

console.log(`\nCE A MAI APĂRUT   ${referinta.data} → ${acum.data}`);
console.log('='.repeat(62));
console.log(`\nCASE — ${caseNoi.length} postate în interval, ${trec.length} trec de criterii\n`);
if (!topCase.length) console.log('  nimic nou care să bifeze criteriile.\n');
else if (dinRezerva) console.log(`  Nimic postat în interval. Cele mai bune 3 de după ${SAPT}:\n`);
topCase.forEach(({ x }, i) => {
  const c = curteLibera(x);
  console.log(`${i + 1}. ${x.pret.toLocaleString('ro-RO')} € · ${x.mpu} mp utili · curte ${c.sigur ? '' : '~'}${c.mp} mp · ${x.zona}`);
  console.log(`   ${String(x.titlu).slice(0, 66)}`);
  const repus = !dinRezerva && vazute.has(idAnunt(x.url)) ? ' · repostat, îl aveam deja' : '';
  console.log(`   postat ${x.creat}${x.stare === 'ready_to_use' ? ' · dat ca gata de locuit' : ''}${repus}`);
  console.log(`   ${x.url}\n`);
});

let topMasini = [];
const mCale = path.join(RADACINA, 'masini.json');
if (fs.existsSync(mCale)) {
  const masini = JSON.parse(fs.readFileSync(mCale, 'utf8')).masini || [];
  const prag = zile
    ? new Date(Date.now() - zile * 86400000).toISOString().slice(0, 10)
    : referinta.data;
  const noi = masini.filter(m => m.d && m.d > prag);
  const ok = noi.filter(m => !filtreazaMasina(m)).map(m => ({ m, p: punctajMasina(m) }));
  ok.sort((a, b) => b.p - a.p);
  topMasini = ok.slice(0, 3);
  console.log(`MAȘINI — ${noi.length} apărute după ${prag}, ${ok.length} trec de criterii\n`);
  if (!topMasini.length) console.log('  nimic nou care să bifeze criteriile.\n');
  topMasini.forEach(({ m }, i) => {
    console.log(`${i + 1}. ${m.p.toLocaleString('ro-RO')} € · ${m.m} · ${m.an} · ${m.km.toLocaleString('ro-RO')} km · ${m.z}`);
    if (CUREA_IN_ULEI.test(m.m + ' ' + (m.warn || ''))) console.log('   ! curea de distribuție în ulei');
    else if (m.warn) console.log(`   ! ${String(m.warn).slice(0, 66)}`);
    console.log(`   ${m.u}\n`);
  });
}

if (tot && picate.length) {
  console.log(`--- ce a picat (${picate.length}) ---`);
  const pe = {};
  picate.forEach(({ motiv }) => { const k = motiv.replace(/~?\d+/g, 'N'); pe[k] = (pe[k] || 0) + 1; });
  Object.entries(pe).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`  ${String(n).padStart(3)}  ${k}`));
}

if (scrie) {
  fs.writeFileSync(path.join(RADACINA, 'azi.json'), JSON.stringify({
    generat: new Date().toISOString().slice(0, 16).replace('T', ' '),
    de_la: referinta.data, pana_la: acum.data,
    case_noi: caseNoi.length, case_trec: trec.length, din_rezerva: dinRezerva,
    case: topCase.map(({ x, p }) => {
      const c = curteLibera(x);
      return {
        pret: x.pret, mpu: x.mpu, curte: c.mp, curte_sigura: c.sigur, teren: x.teren,
        zona: x.zona, an: x.an, stare: x.stare, creat: x.creat,
        repostat: vazute.has(idAnunt(x.url)),
        titlu: x.titlu, url: x.url, scor: p,
      };
    }),
    masini: topMasini.map(({ m, p }) => ({
      pret: m.p, model: m.m, an: m.an, km: m.km, zona: m.z,
      warn: m.warn || null, url: m.u, scor: p,
    })),
  }, null, 1));
  console.log('scris în azi.json');
}
