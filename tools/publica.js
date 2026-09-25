// Duce rezultatul scanarii in date.json, adica veriga care lipsea intre
// "scan.js storia" si site: scanarea scria doar un snapshot, iar anunturile
// noi nu ajungeau niciodata pe pagina.
//
//   node tools/publica.js            arata ce s-ar schimba, fara sa scrie
//   node tools/publica.js --scrie    scrie efectiv in date.json
//
// Scoate anunturile moarte (410/404, cu reluare pentru raspunsurile neclare)
// si adauga din ultimul snapshot ce nu e deja in lista si nu a fost exclus
// automat. Compara dupa ID-ul de la capatul linkului, nu dupa tot linkul:
// Storia redenumeste uneori linkul pastrand acelasi ID.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html' };
const AZI = new Date().toISOString().slice(0, 10);
const SCRIE = process.argv.includes('--scrie');

const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || u;

// Pagina filtreaza implicit pe curte proprie confirmata si pe minim 100 mp de
// curte, iar un anunt cu gm sau c pe null nu trece niciunul din filtre - adica
// e pe site dar nu se vede. De aceea suprafata curtii si tipul ei se scot din
// descriere, nu se lasa necompletate.
function curteDinDescriere(text) {
  if (!text) return null;
  const tipare = [
    /(?:teren|curte|gr[aă]din[aă])\s+liber[aă]?\s*(?:de|:)?\s*(\d{2,4})\s*(?:mp|m2|m²)/i,
    /(?:curte|gr[aă]din[aă])\s+(?:proprie\s+)?(?:de|cu)\s*(\d{2,4})\s*(?:mp|m2|m²)/i,
    /(\d{2,4})\s*(?:mp|m2|m²)\s+(?:de\s+)?(?:teren\s+liber|curte|gr[aă]din[aă])/i,
  ];
  for (const re of tipare) {
    const m = text.match(re);
    if (m) {
      const v = parseInt(m[1], 10);
      if (v >= 20 && v <= 5000) return v;
    }
  }
  return null;
}

function tipCurte(text) {
  if (!text) return null;
  if (/curte\s+comun|[iî]n\s+comun|cot[aă]\s+parte/i.test(text)) return 'comuna';
  if (/curte\s+proprie|curte\s+privat|curte\s+individual|singur\s+[iî]n\s+curte|f[aă]r[aă]\s+p[aă]r[tț]i\s+comune/i.test(text)) return 'proprie';
  return null;
}

async function stare(u) {
  try { return (await fetch(u, { method: 'HEAD', redirect: 'manual', headers: UA })).status; }
  catch (e) { return 0; }
}

async function paralel(lista, n, fn) {
  const rez = new Array(lista.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, lista.length) }, async () => {
    while (true) { const k = i++; if (k >= lista.length) return; rez[k] = await fn(lista[k]); }
  }));
  return rez;
}

function ultimulSnapshot() {
  const dosar = path.join(__dirname, 'snapshots');
  if (!fs.existsSync(dosar)) return null;
  const f = fs.readdirSync(dosar).filter(x => x.startsWith('storia-')).sort().pop();
  return f ? path.join(dosar, f) : null;
}

(async () => {
  const caleDate = path.join(RADACINA, 'date.json');
  const j = JSON.parse(fs.readFileSync(caleDate, 'utf8'));
  const inainte = j.anunturi.length;

  // 1. anunturi moarte
  const stari = await paralel(j.anunturi, 12, o => o.u ? stare(o.u) : 200);
  const deReluat = [];
  stari.forEach((s, k) => { if (s !== 200 && s !== 410 && s !== 404) deReluat.push(k); });
  for (const k of deReluat) {
    await new Promise(r => setTimeout(r, 250));
    stari[k] = await stare(j.anunturi[k].u);
  }
  const morti = [];
  const vii = j.anunturi.filter((o, k) => {
    if (stari[k] === 410 || stari[k] === 404) { morti.push(o); return false; }
    return true;
  });

  // 2. anunturi noi din ultimul snapshot
  const snap = ultimulSnapshot();
  const noi = [];
  if (snap) {
    const s = JSON.parse(fs.readFileSync(snap, 'utf8'));
    const existente = new Set(vii.map(o => idAnunt(o.u)));
    for (const x of s) {
      if (x.exclus || !x.pret) continue;
      if (existente.has(idAnunt(x.url))) continue;
      if (x.tip === 'casa' && x.pret > 250000) continue;
      if (x.tip === 'apartament' && (x.camere !== 'TWO' || x.pret > 110000)) continue;
      existente.add(idAnunt(x.url));
      const text = `${x.titlu} ${x.descriere || ''}`;
      const gm = curteDinDescriere(text);
      noi.push({
        k: x.tip === 'casa' ? 'casa' : 'ap',
        p: x.pret, t: x.titlu, z: x.zona || 'Sibiu',
        r: { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6 }[x.camere] || null,
        a: x.mpu || null,
        g: gm ? `curte libera ${gm} mp` : (x.teren ? `teren ${x.teren} mp` : null),
        gm, c: tipCurte(text),
        src: 'storia', u: x.url,
        warn: x.stare === 'to_renovation' ? 'Declarata de renovat in fisa tehnica.' : null,
        d: AZI,
      });
    }
  }

  console.log(`date.json: ${inainte} anunturi`);
  console.log(`  ${morti.length} moarte, de scos`);
  console.log(`  ${noi.length} noi, de adaugat`);
  noi.forEach(x => console.log(`    ${x.k === 'casa' ? 'casa' : 'ap  '} ${String(x.p).padStart(7)} ${String(x.a || '?').padStart(4)}mpu ${String(x.z).padEnd(18)} ${String(x.t).slice(0, 56)}`));
  console.log(`  rezultat: ${vii.length + noi.length} anunturi`);

  if (!SCRIE) { console.log('\n(proba; ruleaza cu --scrie ca sa salvez)'); return; }
  j.anunturi = vii.concat(noi);
  j.actualizat = AZI;
  fs.writeFileSync(caleDate, JSON.stringify(j, null, 1));
  console.log('\nscris in date.json');
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
