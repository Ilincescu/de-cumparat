// Tine un istoric de preturi pentru fiecare anunt: cat a cerut si cand.
// Fara el, o scadere se vede o singura data, in ziua in care s-a intamplat,
// si apoi se pierde - iar la negociere conteaza tocmai de cat timp sta pe
// piata si de la ce pret a plecat.
//
//   node tools/istoric.js              actualizeaza istoric-preturi.json
//   node tools/istoric.js <ID>         arata istoricul unui anunt
//   node tools/istoric.js --scaderi    anunturile care au scazut, cele mai mari intai
//
// Sursele sunt toate snapshoturile din tools/snapshots plus fisierele curente.
// Se poate rula oricand: pastreaza doar schimbarile, nu o valoare pe zi.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADACINA = path.join(__dirname, '..');
const CALE = path.join(RADACINA, 'istoric-preturi.json');

const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || String(u);

// Se aduna toate observatiile brute, din surse care nu vin in ordine
// cronologica, si abia la final se pastreaza doar schimbarile de pret.
// Cand aceeasi zi are doua valori, castiga cea mai recent adaugata.
function adauga(istoric, u, titlu, pret, data) {
  if (!u || !pret || !data) return;
  const id = idAnunt(u);
  const e = istoric[id] || (istoric[id] = { u, t: titlu || '', preturi: [] });
  if (titlu && !e.t) e.t = titlu;
  if (!String(e.u).startsWith('http') && String(u).startsWith('http')) e.u = u;
  e.preturi.push({ d: data, p: pret });
}

function comprima(istoric) {
  for (const e of Object.values(istoric)) {
    const peZi = new Map();
    for (const x of e.preturi) peZi.set(x.d, x.p);
    const zile = [...peZi.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const rezultat = [];
    for (const [d, p] of zile) {
      if (!rezultat.length || rezultat[rezultat.length - 1].p !== p) rezultat.push({ d, p });
    }
    e.preturi = rezultat;
  }
}

function dinGit(fisier, camp, cheiePret, cheieUrl, cheieTitlu, istoric) {
  let comituri;
  try {
    comituri = execFileSync('git', ['log', '--format=%H %cd', '--date=short', '--', fisier],
      { cwd: RADACINA, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch (e) { return 0; }
  let n = 0;
  for (const linie of comituri.reverse()) {
    const [sha, data] = linie.split(' ');
    let continut;
    try { continut = execFileSync('git', ['show', `${sha}:${fisier}`], { cwd: RADACINA, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { continue; }
    let j;
    try { j = JSON.parse(continut); } catch (e) { continue; }
    for (const o of (j[camp] || [])) {
      adauga(istoric, o[cheieUrl], o[cheieTitlu], o[cheiePret], data);
      n++;
    }
  }
  return n;
}

function construieste() {
  const istoric = fs.existsSync(CALE) ? JSON.parse(fs.readFileSync(CALE, 'utf8')).anunturi || {} : {};

  // snapshoturile Storia au data in nume si preturile exacte din ziua aceea
  const dosar = path.join(__dirname, 'snapshots');
  if (fs.existsSync(dosar)) {
    for (const f of fs.readdirSync(dosar).filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort()) {
      const data = f.slice(7, 17);
      for (const x of JSON.parse(fs.readFileSync(path.join(dosar, f), 'utf8'))) {
        adauga(istoric, x.url, x.titlu, x.pret, data);
      }
    }
  }

  // istoricul git al listelor acopera perioada dinaintea snapshoturilor
  dinGit('date.json', 'anunturi', 'p', 'u', 't', istoric);
  dinGit('masini.json', 'masini', 'p', 'u', 'm', istoric);
  dinGit('biciclete.json', 'biciclete', 'p', 'u', 't', istoric);

  comprima(istoric);
  const total = Object.keys(istoric).length;
  const cuSchimbari = Object.values(istoric).filter(e => e.preturi.length > 1).length;
  fs.writeFileSync(CALE, JSON.stringify({
    actualizat: new Date().toISOString().slice(0, 10),
    note: 'Istoric de preturi. Cheia e ID-ul de la capatul linkului. Fiecare intrare are linkul, titlul si lista de preturi observate, cu data. Se scrie o valoare noua doar cand pretul se schimba.',
    anunturi: istoric,
  }, null, 1));
  console.log(`istoric-preturi.json: ${total} anunturi, ${cuSchimbari} cu cel putin o schimbare de pret`);
  return istoric;
}

function arata(id) {
  const istoric = JSON.parse(fs.readFileSync(CALE, 'utf8')).anunturi;
  const cheie = Object.keys(istoric).find(k => k.toLowerCase().includes(String(id).toLowerCase()));
  if (!cheie) return console.log('nu am gasit anuntul');
  const e = istoric[cheie];
  console.log(e.t);
  console.log(e.u);
  e.preturi.forEach((x, i) => {
    const d = i ? x.p - e.preturi[i - 1].p : 0;
    console.log(`  ${x.d}  ${String(x.p).padStart(7)} EUR${d ? `  (${d > 0 ? '+' : ''}${d})` : ''}`);
  });
}

function scaderi() {
  // nu vrea sa vada anunturi din afara orasului sau cu curte comuna
  const AFARA = /r[aă][sș]inari|al[tț][aâ]na|tili[sș]ca|p[aă]ltini[sș]|[sș]ura mic|[sș]ura mare|bavaria|cisn[aă]die|[sș]elimb[aă]r|nucet|dealul sibiului|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|sadu|ro[sș]ia|cristian|vurp[aă]r|daia|corn[aă][tț]el|hosman|cop[sș]a|ru[sș]i|slimnic|de vacan[tț]/i;
  const COMUNA = /curt[eiă][^.!?]{0,40}comun|comun[ăa][^.!?]{0,40}curt|cot[aă]\s+parte|p[aă]r[tț]i\s+comune|[iî]n\s+indiviziune/i;
  const nedorit = e => AFARA.test(e.t || '') || COMUNA.test(e.t || '');
  const istoric = JSON.parse(fs.readFileSync(CALE, 'utf8')).anunturi;
  const lista = Object.values(istoric)
    .filter(e => e.preturi.length > 1 && !nedorit(e))
    .map(e => {
      const prim = e.preturi[0], ultim = e.preturi[e.preturi.length - 1];
      return { e, dif: ultim.p - prim.p, prim, ultim, zile: e.preturi.length };
    })
    .filter(x => x.dif < 0)
    .sort((a, b) => a.dif - b.dif);
  console.log(`anunturi care au scazut: ${lista.length}`);
  lista.forEach(x => {
    const proc = Math.round(x.dif / x.prim.p * 100);
    console.log(`  ${String(x.prim.p).padStart(7)} -> ${String(x.ultim.p).padStart(7)}  ${String(x.dif).padStart(8)} (${proc}%)  ${x.prim.d} .. ${x.ultim.d}`);
    console.log(`          ${String(x.e.t).slice(0, 70)}`);
    console.log(`          ${x.e.u}`);
  });
}

const arg = process.argv[2];
if (!arg) construieste();
else if (arg === '--scaderi') { construieste(); scaderi(); }
else { construieste(); arata(arg); }
