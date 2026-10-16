// Marcheaza in date.json anunturile care sunt aceeasi casa cu altul, ca pagina
// sa arate o singura data fiecare proprietate.
//
//   node tools/marcheaza-dubluri.js            proba
//   node tools/marcheaza-dubluri.js --scrie    scrie in date.json
//
// Gruparea o facea doar azi.js, pentru clasamentul de dimineata; lista de pe
// pagina arata aceeasi casa din Lupeni (204.990, teren 237 mp) de opt ori.
// Nu se sterge nimic: cel mai ieftin anunt ramane capul grupului, celelalte
// primesc dup = id-ul capului si pagina le ascunde.

const fs = require('fs');
const path = require('path');
const { grupeaza, idAnunt } = require('./dubluri.js');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');
const cale = path.join(RADACINA, 'date.json');
const j = JSON.parse(fs.readFileSync(cale, 'utf8'));

// "teren 237 mp" scris in titlu bate fisa: la IDID45 fisa da alt numar si
// casa scapa din grup. Fara mentiune in titlu, ramane terenul din snapshot.
const dosar = path.join(__dirname, 'snapshots');
const ultim = fs.readdirSync(dosar).filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
const terenSnapshot = new Map();
if (ultim) JSON.parse(fs.readFileSync(path.join(dosar, ultim), 'utf8'))
  .forEach(x => { if (x.teren) terenSnapshot.set(idAnunt(x.url), x.teren); });

const terenDinText = o => {
  const m = `${o.t || ''} ${o.g || ''}`.match(/teren\s*(?:de\s*)?(\d{2,4})\s*mp/i);
  return m ? +m[1] : null;
};

const case_ = j.anunturi.filter(o => o.k === 'casa' && !o.mort);
const forma = case_.map(o => ({
  o,
  url: o.u,
  zona: o.z,
  teren: terenDinText(o) || terenSnapshot.get(idAnunt(o.u)),
  mpu: o.a,
  pret: o.p,
  camere: o.r,
}));

const cap = new Map();
grupeaza(forma).forEach(g => g.anunturi.forEach(a => cap.set(a.o, g.sef.o)));

// Legaturile scrise de mana in warn ("Acelasi imobil ca IDID45") trec peste
// grupare: acolo am comparat pozele sau adresa.
const dupaId = new Map(case_.map(o => [idAnunt(o.u), o]));
case_.forEach(o => {
  const m = String(o.warn || '').match(/Acelasi imobil ca (ID[A-Za-z0-9]+)/);
  const altul = m && dupaId.get(m[1]);
  if (altul && altul !== o) cap.set(o, cap.get(altul) || altul);
});

let marcate = 0;
const grupuri = new Map();
case_.forEach(o => {
  let sef = cap.get(o) || o;
  while (cap.get(sef) && cap.get(sef) !== sef) sef = cap.get(sef);
  if (sef === o) { delete o.dup; return; }
  o.dup = idAnunt(sef.u);
  marcate++;
  grupuri.set(sef, (grupuri.get(sef) || 0) + 1);
});
case_.forEach(o => { if (grupuri.has(o)) o.alte = grupuri.get(o); else delete o.alte; });

console.log(`date.json: ${case_.length} case, ${marcate} dubluri in ${grupuri.size} proprietati`);
[...grupuri].sort((a, b) => b[1] - a[1]).slice(0, 10)
  .forEach(([o, n]) => console.log(`  ${n + 1} anunturi · ${o.p} € · ${o.z} · ${idAnunt(o.u)}`));

if (SCRIE) fs.writeFileSync(cale, JSON.stringify(j, null, 1) + '\n');
