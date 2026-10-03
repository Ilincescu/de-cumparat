// Poarta prin care trebuie sa treaca orice casa inainte sa spun ceva despre ea.
//
//   node tools/verifica.js <ID sau URL>
//   node tools/verifica.js IDHW8J
//
// De ce exista. Am afirmat de sapte ori lucruri despre case fara sa le fi
// deschis dovada: "structura e sanatoasa" din poze, "actele sunt curate" din
// textul agentiei, "te muti maine" dintr-un camp completat de agentie, un
// clasament pe EUR/mp fara sa ma uit la poze, o casa cu curte comuna pusa la
// comparabile, si de doua ori case pe care Mihai le respinsese deja.
//
// Scriptul face partea mecanica si, cel mai important, scoate la final lista
// AFIRMATII INTERZISE - lucrurile pe care datele nu le sustin. Daca o afirmatie
// e acolo, nu o scriu, oricat de probabila ar parea.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const RADACINA = path.join(__dirname, '..');

const idDin = s => ((String(s).match(/(ID[A-Za-z0-9]+)/) || [])[1]) || s;

// Campurile tehnice care conteaza, si ce nu am voie sa spun daca lipsesc.
const CAMPURI = [
  ['construction_status', 'starea constructiei', 'ca e gata de locuit sau ca e de renovat'],
  ['heating', 'incalzirea', 'ca are centrala, calorifere sau sobe'],
  ['windows_type', 'tamplaria', 'ca are termopane sau lemn'],
  ['building_material', 'materialul', 'din ce e construita'],
  ['build_year', 'anul', 'cat de veche e'],
  ['terrain_area', 'terenul', 'cat teren are'],
  ['m', 'suprafata utila', 'cati mp utili are'],
  ['garret_type', 'podul', 'daca se poate mansarda'],
  ['building_type', 'tipul cladirii', 'daca e singur in curte'],
  ['rooms_num', 'numarul de camere', 'cate camere are'],
];

// Ce caut in descriere. Absenta nu e dovada de absenta, dar e semnal.
const IN_TEXT = [
  ['incalzire', /centrala?\s+termic|calorifer|[iî]nc[aă]lzire|sob[aă]|teracot|[iî]n pardoseal/i],
  ['curte comuna', /curt[eiă][^.!?]{0,40}comun|comun[ăa][^.!?]{0,40}curt|cot[aă]\s+parte|[iî]n\s+indiviziune/i],
  ['doua corpuri', /2 corpuri|dou[aă] corpuri|garsonier|duplex|triplex|cvadruplex/i],
  ['umezeala', /igrasie|mucegai|umezeal|infiltrat/i],
  ['curte pavata', /curte pavat|curte betonat|pavaj|dale/i],
  ['anexe', /anex[aă]|garaj|magazie|[sș]ur[aă]|bucat[aă]rie de var[aă]|foi[sș]or|afum[aă]toare/i],
  ['de renovat', /de renovat|necesit[aă] renovare|la ro[sș]u|la alb|nefinisat/i],
];

async function fisa(id) {
  // intai caut slugul in ultimul snapshot, ca sa nu ghicesc URL-ul
  const dir = path.join(__dirname, 'snapshots');
  const f = fs.readdirSync(dir).filter(x => /^storia-\d{4}/.test(x)).sort().pop();
  const snap = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const gasit = snap.find(x => String(x.url).includes(id));
  const url = gasit ? gasit.url : null;
  if (!url) return { eroare: `nu gasesc ${id} in ${f}. Da URL-ul complet.` };

  const h = await (await fetch(url, { headers: UA })).text();
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return { eroare: 'pagina nu are __NEXT_DATA__' };
  const ad = ((JSON.parse(m[1]).props || {}).pageProps || {}).ad || {};
  const ch = {};
  (ad.characteristics || []).forEach(c => { ch[c.key] = c.localizedValue || c.value; });
  return {
    url, ad, ch, snapshot: f,
    descriere: String(ad.description || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim(),
  };
}

function istoricPret(id) {
  const c = path.join(RADACINA, 'istoric-preturi.json');
  if (!fs.existsSync(c)) return null;
  const h = JSON.parse(fs.readFileSync(c, 'utf8')).anunturi || {};
  return h[id] || null;
}

function esteRespinsa(id) {
  const c = 'C:/Users/mihai.ilincescu/.claude/projects/C--Visma/memory/case-respinse-de-mihai.md';
  if (!fs.existsSync(c)) return null;
  const t = fs.readFileSync(c, 'utf8');
  const linie = t.split('\n').find(l => l.includes(id));
  return linie ? linie.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim() : null;
}

function duplicate(id, ch) {
  const dir = path.join(__dirname, 'snapshots');
  const f = fs.readdirSync(dir).filter(x => /^storia-\d{4}/.test(x)).sort().pop();
  const snap = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const teren = Number(String(ch.terrain_area || '').replace(/[^\d]/g, ''));
  if (!teren) return [];
  return snap.filter(x => !String(x.url).includes(id)
    && Math.abs(Number(x.teren) - teren) <= 2)
    .map(x => `${x.pret} EUR, ${x.mpu} mp, ${x.url}`);
}

async function poze(id, ad) {
  const dest = path.join(RADACINA, 'poze', 'verificari', id);
  fs.mkdirSync(dest, { recursive: true });
  const img = (ad.images || []).map(i => i.medium || i.large).filter(Boolean);
  let n = 0;
  for (let k = 0; k < img.length; k++) {
    const nume = path.join(dest, String(k + 1).padStart(2, '0') + '.jpg');
    if (fs.existsSync(nume)) { n++; continue; }
    const r = await fetch(img[k], { headers: UA });
    if (!r.ok) continue;
    fs.writeFileSync(nume, Buffer.from(await r.arrayBuffer()));
    n++;
    await new Promise(z => setTimeout(z, 120));
  }
  const lista = fs.readdirSync(dest).filter(x => x.endsWith('.jpg')).sort();
  fs.writeFileSync(path.join(dest, 'index.html'),
    '<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#111;font:11px sans-serif;color:#fff}'
    + '.g{display:grid;grid-template-columns:repeat(5,1fr);gap:2px}figure{margin:0;position:relative}'
    + 'img{width:100%;height:175px;object-fit:cover;display:block}'
    + 'figcaption{position:absolute;left:0;bottom:0;background:#000c;padding:2px 5px}</style><div class="g">'
    + lista.map(x => `<figure><img src="${x}"><figcaption>${x.replace('.jpg', '')}</figcaption></figure>`).join('')
    + '</div>');
  return { n, dest };
}

(async () => {
  const arg = process.argv[2];
  if (!arg) { console.log('folosire: node tools/verifica.js <ID sau URL>'); process.exit(1); }
  const id = idDin(arg);

  const r = await fisa(id);
  if (r.eroare) { console.log('EROARE:', r.eroare); process.exit(1); }
  const { ad, ch } = r;

  console.log('='.repeat(72));
  console.log(ad.title);
  console.log(r.url);
  console.log('='.repeat(72));

  const zile = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  const creat = (ad.createdAt || '').slice(0, 10);
  const modif = (ad.modifiedAt || '').slice(0, 10);
  const azi = new Date().toISOString().slice(0, 10);
  console.log(`\npret ${(ad.target || {}).Price} EUR | status ${ad.status} | pus ${creat}`
    + ` | modificat ${modif} | ${creat ? zile(creat, ad.status === 'active' ? azi : modif) : '?'} zile pe piata`);

  console.log('\n--- CE SPUNE FISA TEHNICA ---');
  const lipsesc = [];
  CAMPURI.forEach(([k, eticheta, afirmatie]) => {
    if (ch[k] != null && ch[k] !== '') console.log(`  ${eticheta.padEnd(22)} ${ch[k]}`);
    else lipsesc.push([eticheta, afirmatie]);
  });

  console.log('\n--- CE SPUNE DESCRIEREA ---');
  const gasiteInText = [];
  IN_TEXT.forEach(([eticheta, re]) => {
    const g = r.descriere.match(re);
    if (g) {
      gasiteInText.push(eticheta);
      const i = r.descriere.search(re);
      console.log(`  ${eticheta.padEnd(16)} "...${r.descriere.slice(Math.max(0, i - 40), i + 70).trim()}..."`);
    }
  });
  if (!gasiteInText.length) console.log('  nimic din lista de verificat');

  const resp = esteRespinsa(id);
  if (resp) console.log('\n!!! RESPINSA DEJA DE MIHAI:', resp);

  const ist = istoricPret(id);
  if (ist && ist.preturi.length > 1) {
    console.log('\n--- ISTORIC DE PRET ---');
    ist.preturi.forEach(p => console.log(`  ${p.d}  ${p.p}`));
  }

  const dup = duplicate(id, ch);
  if (dup.length) {
    console.log('\n--- POSIBILE DUPLICATE (acelasi teren) ---');
    dup.forEach(d => console.log('  ' + d));
  }

  const p = await poze(id, ad);
  console.log(`\n--- POZE ---\n  ${p.n} salvate in ${p.dest}`);
  console.log(`  deschide: ${path.join(p.dest, 'index.html')}`);

  console.log('\n' + '='.repeat(72));
  console.log('AFIRMATII INTERZISE - datele nu le sustin');
  console.log('='.repeat(72));
  const interzise = [];
  lipsesc.forEach(([eticheta, afirmatie]) => interzise.push(`${afirmatie} (lipseste ${eticheta} din fisa)`));
  if (!gasiteInText.includes('incalzire') && !ch.heating)
    interzise.push('ORICE despre incalzire - nici fisa, nici descrierea nu o pomenesc');
  interzise.push('ca structura e sanatoasa, ca nu are igrasie, sau ca actele sunt curate - astea cer expertiza si extras CF');
  if (ch.construction_status === 'ready_to_use')
    interzise.push('"gata de locuit" ca fapt - e camp completat de agentie, prins mincind de 3 ori pana acum');
  interzise.forEach(x => console.log('  x ' + x));

  console.log('\n' + '='.repeat(72));
  console.log('INAINTE SA SCRIU CEVA DESPRE CASA ASTA');
  console.log('='.repeat(72));
  console.log('  1. am deschis index.html si m-am uitat la TOATE pozele');
  console.log('  2. am citit descrierea intreaga, nu doar primele randuri');
  console.log('  3. am verificat ca nu e in lista de respinse');
  console.log('  4. fiecare afirmatie are o sursa: fisa, descriere, poza anume, sau masuratoare');
  console.log('  5. nimic din lista de mai sus nu apare in ce scriu');
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
