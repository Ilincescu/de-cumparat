// Pune tare = "<motiv>" pe ofertele rare: mult sub pretul anunturilor
// asemanatoare, aparute de curand, si care trec criteriile lui. Pagina le
// arata cu ⚡ si le pune primele, ca sa le vada inainte sa se dea.
//
//   node tools/oferte-tari.js            proba
//   node tools/oferte-tari.js --scrie    scrie in date.json si masini.json
//
// Rar inseamna rar: pragurile sunt alese ca sa iasa cateva pe zi, nu zeci.
// Un anunt ieftin care sta de saptamani pe site nu e o graba, e un motiv.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');
const ZILE_NOU = 7;

const azi = new Date();
const nou = o => o.d && (azi - new Date(o.d)) / 86400000 <= ZILE_NOU;
const viu = o => !o.mort && !o.dup && !o.av;
const mediana = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const eur = n => n.toLocaleString('ro-RO') + ' €';

// Ieftin din motive care nu sunt chilipir: o cota parte, un birou, o chirie.
const NU_E_OFERTA = /cot[aă]|\d+\/\d+\s+din|birou|spa[tț]iu|[iî]nchiri|garsonier|subsol|demisol|apartament (la |de )?cas/i;

function marcheaza(lista, asemanatoare, prag, minComparabile, bani = eur) {
  const marcate = [];
  lista.forEach(o => {
    delete o.tare;
    if (!viu(o) || !nou(o) || !o.p || NU_E_OFERTA.test(o.t || o.m || '')) return;
    const c = asemanatoare(o);
    if (c.length < minComparabile) return;
    const m = mediana(c.map(x => x.p));
    if (o.p > m * prag) return;
    o.tare = `${Math.round((1 - o.p / m) * 100)}% sub mediana a ${c.length} anunturi asemanatoare (${bani(m)})`;
    marcate.push(o);
  });
  return marcate;
}

const cDate = path.join(RADACINA, 'date.json');
const cMasini = path.join(RADACINA, 'masini.json');
const d = JSON.parse(fs.readFileSync(cDate, 'utf8'));
const m = JSON.parse(fs.readFileSync(cMasini, 'utf8'));

// Casa: criteriile lui, comparata cu casele din oras de marime apropiata.
const case_ = d.anunturi.filter(o => o.k === 'casa');
const caseVii = case_.filter(o => viu(o) && o.p && o.a);
// Curtea nu poate fi mai mare decat terenul: sub 100 mp teren nu are 100 mp curte.
const teren = o => { const x = `${o.g || ''} ${o.t || ''}`.match(/teren\D{0,10}(\d{2,4})\s*mp/i); return x ? +x[1] : null; };
const caseTari = marcheaza(
  case_.filter(o => o.p <= 200000 && o.a >= 50 && (o.gm == null || o.gm >= 100)
    && !(teren(o) < 100) && !o.d2 && o.c !== 'comuna'),
  o => caseVii.filter(x => x !== o && Math.abs(x.a - o.a) / o.a <= 0.2),
  0.6, 10);

// Apartament: 2 camere, minim 30 mp, comparat pe suprafata.
const ap = d.anunturi.filter(o => o.k === 'ap');
const apVii = ap.filter(o => viu(o) && o.p && o.a);
const apTari = marcheaza(
  ap.filter(o => o.a >= 30 && /2\s*camere/i.test(o.t || '')),
  o => apVii.filter(x => x !== o && Math.abs(x.a - o.a) / o.a <= 0.15),
  0.6, 20);

// Masina: acelasi model, an +-1, km +-30.000. Garda joasa si Duster nu, si nici
// crossoverele sub ~4,25 m - a refuzat Vitara (4,17 m) ca prea mica.
const SUB_4_25 = /stepway|sandero|crossland|ecosport|puma|captur|juke|t-?cross|kamiq|vitara|jimny|ignis|aircross|taigo|kona|stonic|express|dokker/i;
const masini = m.masini;
const masiniVii = masini.filter(o => viu(o) && o.p && !o.gj);
const model = o => String(o.m || '').toLowerCase().split(/\s+/).slice(0, 2).join(' ');
const masiniTari = marcheaza(
  masini.filter(o => !o.gj && !/duster/i.test(o.m || '') && !SUB_4_25.test(o.m || '')
    && o.an >= 2020 && o.km < 100000),
  o => masiniVii.filter(x => x !== o && model(x) === model(o)
    && Math.abs(x.an - o.an) <= 1 && Math.abs(x.km - o.km) <= 30000),
  0.8, 5);

// Bicicleta: putine anunturi, deci comparata cu toate cursierele vii pe marimea lui.
const cB = path.join(RADACINA, 'biciclete.json');
const b = JSON.parse(fs.readFileSync(cB, 'utf8'));
const peMarime = o => (o.cm >= 55 && o.cm <= 58) || /^(L|XL)$/i.test(o.sz || '');
const bVii = b.biciclete.filter(o => viu(o) && o.p && peMarime(o));
// Bicicletele sunt in lei, nu in euro.
const lei = n => n.toLocaleString('ro-RO') + ' lei';
const bTari = marcheaza(b.biciclete.filter(peMarime), o => bVii.filter(x => x !== o), 0.5, 8, lei);

for (const [ce, l] of [['case', caseTari], ['apartamente', apTari], ['masini', masiniTari], ['biciclete', bTari]]) {
  console.log(`${ce}: ${l.length} oferte rare`);
  l.forEach(o => console.log(`  ⚡ ${(ce === 'biciclete' ? lei : eur)(o.p)} · ${(o.t || o.m).slice(0, 60)} · ${o.tare}`));
}

if (SCRIE) {
  fs.writeFileSync(cDate, JSON.stringify(d, null, 1) + '\n');
  fs.writeFileSync(cMasini, JSON.stringify(m, null, 1) + '\n');
  fs.writeFileSync(cB, JSON.stringify(b, null, 1) + '\n');
}
