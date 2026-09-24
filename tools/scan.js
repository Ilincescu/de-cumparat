// Scanner pentru cautarea zilnica. Inlocuieste munca facuta pana acum cu
// browserul: Storia, Autovit si OLX servesc toate JSON structurat, iar
// verificarea linkurilor moarte se face cu un HEAD, fara browser.
//
//   node tools/scan.js linkuri     verifica ce anunturi au murit (410/404)
//   node tools/scan.js storia      scaneaza casele si apartamentele din oras
//   node tools/scan.js masini      scaneaza Autovit, fara browser
//   node tools/scan.js dubluri     gaseste anunturi diferite cu aceleasi poze
//   node tools/scan.js diff        compara ultimul snapshot cu cel dinainte
//   node tools/scan.js tot         toate, in ordinea de mai sus
//
// buildId-ul Storia se schimba la fiecare deploy. Cand scanarea da 404, se ia
// unul nou deschizand cu Playwright o pagina de cautare si citind
// JSON.parse(document.getElementById('__NEXT_DATA__').textContent).buildId
//
// Playwright a ramas necesar doar pentru OLX si Facebook. OLX da 403 la un GET
// simplu, deci bicicletele se iau tot din browser. Autovit raspunde la un GET
// obisnuit in aproximativ o secunda si are tot JSON-ul in pagina.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RADACINA = path.join(__dirname, '..');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html' };
const PRAG_PRET = { casa: 190000, apartament: 110000 };
const DOSAR_SNAPSHOT = path.join(__dirname, 'snapshots');

// Localitati din judet care nu sunt orasul Sibiu. Anuntul poate avea pinul in
// oras si proprietatea in alta parte, asa ca se verifica si textul.
const IN_AFARA = /r[aă][sș]inari|al[tț][aâ]na|tili[sș]ca|p[aă]ltini[sș]|[sș]ura mic[aă]|[sș]ura mare|bavaria|cisn[aă]die|[sș]elimb[aă]r|nucet|dealul sibiului|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|sadu|ro[sș]ia|cristian|de vacan[tț][aă]|viile sibiului/i;

// Motive de excludere scrise in descriere, nu in titlu. Fiecare a costat o
// recomandare data si apoi retrasa.
const EXCLUDERI = [
  { cheie: 'curte comuna', re: /curte\s+(este\s+)?(comun|[iî]n comun)|cot[aă]\s+parte|curte\s+comun[aă]/i },
  { cheie: 'doua corpuri', re: /dou[aă]\s+corpuri|2\s+corpuri|dou[aă]\s+locuin[tț]e/i },
  { cheie: 'nefinisata', re: /la\s+alb|la\s+ro[sș]u|stadiul\s+de\s+gri|semifinisat/i },
];

function citesteJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function buildId() {
  const f = path.join(__dirname, 'storia-build.json');
  return citesteJson(f).buildId;
}

function numar(s) {
  if (s === null || s === undefined) return null;
  const m = String(s).replace(/[^0-9]/g, '');
  return m ? parseInt(m, 10) : null;
}

// Ruleaza fn peste lista cu cel mult n cereri in zbor. Secvential, cele 53 de
// linkuri durau aproape un minut; cu 12 in paralel, cateva secunde.
async function paralel(lista, n, fn) {
  const rezultat = new Array(lista.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, lista.length) }, async () => {
    while (true) {
      const k = i++;
      if (k >= lista.length) return;
      rezultat[k] = await fn(lista[k], k);
    }
  }));
  return rezultat;
}

// ---------------------------------------------------------------- linkuri

async function stare(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'manual', headers: UA });
    return r.status;
  } catch (e) { return 0; }
}

async function verificaLinkuri() {
  const surse = [
    ['date.json', 'anunturi'],
    ['masini.json', 'masini'],
    ['biciclete.json', 'biciclete'],
  ];
  const raport = [];
  for (const [fisier, camp] of surse) {
    const cale = path.join(RADACINA, fisier);
    if (!fs.existsSync(cale)) continue;
    const j = citesteJson(cale);
    const lista = (j[camp] || []).filter(o => o.u);
    const t0 = Date.now();
    const stari = await paralel(lista, 12, o => stare(o.u));
    const morti = [];
    let vii = 0, incerte = 0;
    stari.forEach((s, k) => {
      const o = lista[k];
      if (s === 410 || s === 404) morti.push({ u: o.u, p: o.p, t: o.t || o.titlu || '' });
      else if (s === 200) vii++;
      else incerte++;
    });
    const secunde = ((Date.now() - t0) / 1000).toFixed(1);
    raport.push({ fisier, total: lista.length, vii, morti, incerte, secunde });
    console.log(`${fisier}: ${vii} vii, ${morti.length} moarte, ${incerte} incerte (${secunde}s)`);
    morti.forEach(m => console.log(`   410 ${String(m.p).padStart(6)} ${String(m.t).slice(0, 56)}`));
  }
  return raport;
}

// ----------------------------------------------------------------- storia

async function cautare(tip, pagina) {
  const b = buildId();
  const u = `https://www.storia.ro/_next/data/${b}/ro/rezultate/vanzare/${tip}/sibiu/sibiu.json`
    + `?priceMax=${PRAG_PRET[tip]}&limit=72&page=${pagina}`
    + `&searchingCriteria=vanzare&searchingCriteria=${tip}&searchingCriteria=sibiu&searchingCriteria=sibiu`;
  const r = await fetch(u, { headers: UA });
  if (r.status === 404) throw new Error('buildId expirat - ia unul nou din browser si pune-l in tools/storia-build.json');
  if (!r.ok) throw new Error('cautare status ' + r.status);
  const j = await r.json();
  return (((j.pageProps || {}).data || {}).searchAds || {}).items || [];
}

async function fisaTehnica(slug) {
  const b = buildId();
  const u = `https://www.storia.ro/_next/data/${b}/ro/oferta/${slug}.json?id=${slug}`;
  const r = await fetch(u, { headers: UA });
  if (!r.ok) return null;
  const j = await r.json();
  const a = (j.pageProps || {}).ad;
  if (!a) return null;
  const ch = {};
  (a.characteristics || []).forEach(c => { ch[c.key] = c.localizedValue || c.value; });
  return {
    ch,
    creat: (a.createdAt || '').slice(0, 10),
    modificat: (a.modifiedAt || '').slice(0, 10),
    imagini: (a.images || []).map(i => i.medium || i.large).filter(Boolean),
    descriere: (a.description || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  };
}

// Orasul e marcat cu locationLevel 'county_capital'. Comunele si orasele mici
// din judet nu il au, oricat de aproape ar fi de Sibiu.
function inOras(x) {
  const locs = (((x.location || {}).reverseGeocoding || {}).locations) || [];
  return locs.some(l => l.locationLevel === 'county_capital' && /^sibiu$/i.test(l.name));
}

async function scaneazaStoria() {
  const rezultat = [];
  for (const tip of ['casa', 'apartament']) {
    let brute = [];
    for (let p = 1; p <= 4; p++) {
      const it = await cautare(tip, p);
      if (!it.length) break;
      brute = brute.concat(it);
    }
    const oras = brute.filter(inOras);
    console.log(`${tip}: ${brute.length} in judet, ${oras.length} in oras`);

    const t0 = Date.now();
    const fise = await paralel(oras, 8, x => fisaTehnica(x.slug));
    console.log(`  fise tehnice citite in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

    oras.forEach((x, idx) => {
      const d = fise[idx];
      const text = x.title + ' ' + ((d && d.descriere) || '');
      const motive = [];
      if (IN_AFARA.test(text)) motive.push('in afara orasului');
      EXCLUDERI.forEach(e => { if (e.re.test(text)) motive.push(e.cheie); });

      const locs = (((x.location || {}).reverseGeocoding || {}).locations) || [];
      rezultat.push({
        tip, id: x.id, titlu: x.title,
        pret: x.totalPrice ? x.totalPrice.value : null,
        mpu: x.areaInSquareMeters || null,
        camere: x.roomsNumber,
        zona: ((locs[locs.length - 1] || {}).fullName || '').replace(', Sibiu', ''),
        url: 'https://www.storia.ro/ro/oferta/' + x.slug,
        creat: d ? d.creat : null,
        stare: d ? d.ch.construction_status : null,
        teren: d ? numar(d.ch.terrain_area) : null,
        an: d ? d.ch.build_year : null,
        material: d ? d.ch.building_material : null,
        ferestre: d ? d.ch.windows_type : null,
        pod: d ? d.ch.garret_type : null,
        formaCladire: d ? d.ch.building_type : null,
        nrImagini: d ? d.imagini.length : 0,
        exclus: motive.length ? motive : null,
        descriere: d ? d.descriere : '',
      });
    });
  }

  fs.mkdirSync(DOSAR_SNAPSHOT, { recursive: true });
  const azi = new Date().toISOString().slice(0, 10);
  const cale = path.join(DOSAR_SNAPSHOT, `storia-${azi}.json`);
  fs.writeFileSync(cale, JSON.stringify(rezultat, null, 1));
  const excluse = rezultat.filter(r => r.exclus).length;
  console.log(`salvat ${rezultat.length} anunturi (${excluse} excluse automat) -> ${path.relative(RADACINA, cale)}`);
  return rezultat;
}

// ---------------------------------------------------------------- dubluri

async function gasesteDubluri(nrPoze = 4) {
  const snap = ultimulSnapshot();
  if (!snap) return console.log('nu exista snapshot; ruleaza intai: node tools/scan.js storia');
  const lista = citesteJson(snap.cale).filter(x => !x.exclus && x.nrImagini);
  console.log(`compar pozele a ${lista.length} anunturi`);

  const t0 = Date.now();
  const dupaHash = new Map();
  await paralel(lista, 6, async a => {
    const slug = a.url.replace('https://www.storia.ro/ro/oferta/', '');
    const d = await fisaTehnica(slug);
    if (!d) return;
    const hashuri = await paralel(d.imagini.slice(0, nrPoze), 4, async u => {
      const r = await fetch(u, { headers: UA });
      if (!r.ok) return null;
      return crypto.createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex').slice(0, 16);
    });
    hashuri.filter(Boolean).forEach(h => {
      if (!dupaHash.has(h)) dupaHash.set(h, new Set());
      dupaHash.get(h).add(a.url);
    });
  });
  console.log(`poze comparate in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const perechi = new Map();
  for (const [, urls] of dupaHash) {
    if (urls.size < 2) continue;
    const l = [...urls].sort();
    for (let i = 0; i < l.length; i++)
      for (let k = i + 1; k < l.length; k++) {
        const key = l[i] + '||' + l[k];
        perechi.set(key, (perechi.get(key) || 0) + 1);
      }
  }
  const info = new Map(lista.map(a => [a.url, a]));
  const rez = [...perechi.entries()].map(([k, n]) => { const [a, b] = k.split('||'); return { a, b, n }; })
    .sort((x, y) => y.n - x.n);
  console.log(`perechi cu poze identice: ${rez.length}`);
  rez.forEach(p => {
    const A = info.get(p.a) || {}, B = info.get(p.b) || {};
    console.log(`  ${p.n} poze identice`);
    console.log(`    ${A.pret} | ${A.mpu} mpu | ${String(A.titlu).slice(0, 56)}`);
    console.log(`    ${B.pret} | ${B.mpu} mpu | ${String(B.titlu).slice(0, 56)}`);
  });
  return rez;
}

// ----------------------------------------------------------------- masini

// Garda joasa e motiv de excludere, nu o preferinta: doar SUV si crossover.
const GARDA_INALTA = new RegExp([
  'duster', 'stepway', 'tivoli', 'compass', 'renegade',
  '2008', '3008', '5008', 'aircross', 'crossland', 'grandland', 'captur', 'juke',
  'tucson', 'kona', 'santa fe', 'sportage', 'sorento', 'niro',
  'cx-?[35]', 'rav4', 'x-?trail', 'qashqai', 'koleos', 'arkana',
  'vitara', 'jimny', 's-?cross', 'ignis',
  'tiguan', 't-?cross', 't-?roc', 'taigo', 'kamiq', 'karoq', 'kodiaq', 'q[2358]\\b',
  'ecosport', 'kuga', 'puma', 'bronco',
  'xc[46]0', 'x[1356]\\b', 'gla', 'glb', 'glc',
  'dokker', 'caddy', 'berlingo', 'partner', 'rifter', 'combo', 'doblo', 'express',
].join('|'), 'i');

// Cvadricicluri: se vand pe Autovit, dar nu sunt masini.
const CVADRICICLU = /aixam|ligier|chatenet|aigo|elaris|suda|allview|microcar/i;

// Autovit pune raspunsul GraphQL in __NEXT_DATA__, sub pageProps.urqlState.
// Un GET obisnuit il aduce in ~1 secunda, deci nu e nevoie de browser.
function dinNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('pagina nu contine __NEXT_DATA__');
  const j = JSON.parse(m[1]);
  const urql = ((j.props || {}).pageProps || {}).urqlState || {};
  for (const k of Object.keys(urql)) {
    let d = urql[k] && urql[k].data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { continue; } }
    if (d && d.advertSearch && d.advertSearch.edges) return d.advertSearch;
  }
  throw new Error('nu am gasit advertSearch in urqlState');
}

async function scaneazaMasini({ anMinim = 2020, pretMax = 11500, kmMax = 100000, raza = 75 } = {}) {
  const u = `https://www.autovit.ro/autoturisme/de-la-${anMinim}/sibiu`
    + `?search%5Bfilter_float_price%3Ato%5D=${pretMax}`
    + `&search%5Bfilter_float_mileage%3Ato%5D=${kmMax}`
    + `&search%5Bdist%5D=${raza}`;
  const t0 = Date.now();
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error('autovit status ' + r.status);
  const cautare = dinNextData(await r.text());
  console.log(`autovit: ${cautare.totalCount} rezultate, citite in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const toate = cautare.edges.map(e => {
    const n = e.node || {};
    const p = {};
    (n.parameters || []).forEach(x => { p[x.key] = x.displayValue || x.value; });
    return {
      m: n.title || '',
      an: parseInt(p.year, 10) || null,
      km: numar(p.mileage),
      cp: numar(p.engine_power),
      f: (p.fuel_type || '').toLowerCase(),
      p: (n.price && n.price.amount && n.price.amount.units) || null,
      z: (n.location && n.location.city && n.location.city.name) || '',
      src: 'autovit',
      u: n.url,
      warn: /puretech/i.test(n.title || '')
        ? 'Motor PureTech cu curea de distributie in baie de ulei - cere dovada schimbarii ei.' : null,
      d: new Date().toISOString().slice(0, 10),
    };
  });

  const masini = toate.filter(x => !CVADRICICLU.test(x.m));
  const potrivite = masini.filter(x => GARDA_INALTA.test(x.m));
  const joase = masini.filter(x => !GARDA_INALTA.test(x.m));

  console.log(`  ${toate.length - masini.length} cvadricicluri sarite`);
  console.log(`  ${joase.length} cu garda joasa, sarite`);
  console.log(`  ${potrivite.length} potrivite:`);
  potrivite.sort((a, b) => (a.p || 0) - (b.p || 0)).forEach(x =>
    console.log(`    ${String(x.p).padStart(6)} ${x.an} ${String(x.km).padStart(6)}km ${String(x.z).padEnd(14)} ${x.m}`));
  return potrivite;
}

// ---------------------------------------------------------------- publi24

// publi24 raspunde la un GET obisnuit si isi tine anunturile in HTML, deci se
// citesc cu expresii regulate. Nu are JSON in pagina si nici API public.
function parsePubli24(html) {
  const out = [];
  for (const bloc of html.split('class="article-item').slice(1)) {
    const url = (bloc.match(/href='([^']+\.html)'/) || [])[1];
    if (!url) continue;
    const titlu = (bloc.match(/<p class="article-title[^"]*"[^>]*>\s*([^<]+)/)
      || bloc.match(/alt="([^"]{8,140})"/) || [])[1] || '';
    const pretTxt = (bloc.match(/class="article-price"[^>]*>\s*([^<]+)/) || [])[1] || '';
    const pret = numar(pretTxt.replace(/\s/g, ''));
    out.push({
      titlu: titlu.replace(/\s+/g, ' ').replace(/&#(\d+);/g, (m, c) => String.fromCharCode(c)).trim(),
      pret: /EUR|€/i.test(pretTxt) ? pret : null,
      url,
    });
  }
  return out;
}

async function scaneazaPubli24(pagini = 3) {
  const antet = { ...UA, 'Accept-Language': 'ro-RO,ro;q=0.9' };
  let toate = [];
  let total = null;
  for (let p = 1; p <= pagini; p++) {
    const u = `https://www.publi24.ro/anunturi/imobiliare/de-vanzare/sibiu/${p > 1 ? '?pag=' + p : ''}`;
    const r = await fetch(u, { headers: antet });
    if (!r.ok) { console.log(`publi24 pagina ${p}: status ${r.status}`); break; }
    const html = await r.text();
    if (total === null) total = numar((html.match(/search-result-total-items" content="(\d+)"/) || [])[1]);
    const a = parsePubli24(html);
    if (!a.length) break;
    toate = toate.concat(a);
  }
  const vazute = new Set();
  toate = toate.filter(x => !vazute.has(x.url) && vazute.add(x.url));

  // pe publi24 apar si terenuri si garsoniere in aceeasi lista
  const NU = /\bteren\b|garsonier|spatiu comercial|hala|depozit/i;
  const case_ = toate.filter(x => /\bcas[aă]\b|vil[aă]/i.test(x.titlu) && !NU.test(x.titlu));
  console.log(`publi24: ${total} anunturi in total, ${toate.length} citite, ${case_.length} case`);
  case_.filter(x => x.pret && x.pret <= 190000).sort((a, b) => a.pret - b.pret).forEach(x =>
    console.log(`  ${String(x.pret).padStart(7)} ${x.titlu.slice(0, 64)}\n          ${x.url}`));
  return case_;
}

// ------------------------------------------------------------------- diff

function snapshoturi() {
  if (!fs.existsSync(DOSAR_SNAPSHOT)) return [];
  return fs.readdirSync(DOSAR_SNAPSHOT).filter(f => f.startsWith('storia-')).sort()
    .map(f => ({ nume: f, cale: path.join(DOSAR_SNAPSHOT, f) }));
}
function ultimulSnapshot() { const s = snapshoturi(); return s[s.length - 1] || null; }

function diferente() {
  const s = snapshoturi();
  if (s.length < 2) return console.log('am nevoie de doua snapshoturi ca sa compar');
  const vechi = citesteJson(s[s.length - 2].cale), nou = citesteJson(s[s.length - 1].cale);
  console.log(`${s[s.length - 2].nume} -> ${s[s.length - 1].nume}`);
  const mv = new Map(vechi.map(x => [x.url, x])), mn = new Map(nou.map(x => [x.url, x]));

  const noi = nou.filter(x => !mv.has(x.url) && !x.exclus);
  const disparute = vechi.filter(x => !mn.has(x.url));
  const scumpiri = [];
  nou.forEach(x => { const v = mv.get(x.url); if (v && v.pret !== x.pret) scumpiri.push({ x, vechi: v.pret }); });

  console.log(`\nANUNTURI NOI (${noi.length})`);
  noi.forEach(x => {
    const curte = x.teren ? x.teren - Math.round(x.mpu * 0.75) : null;
    console.log(`  ${String(x.pret).padStart(7)} ${String(x.mpu || '?').padStart(4)}mpu curte~${curte || '?'} ${(x.stare || '?').padEnd(14)} ${x.zona}`);
    console.log(`          ${String(x.titlu).slice(0, 78)}`);
    console.log(`          ${x.url}`);
  });
  console.log(`\nDISPARUTE (${disparute.length})`);
  disparute.forEach(x => console.log(`  ${String(x.pret).padStart(7)} ${String(x.titlu).slice(0, 62)}`));
  console.log(`\nPRET SCHIMBAT (${scumpiri.length})`);
  scumpiri.forEach(p => {
    const d = p.x.pret - p.vechi;
    console.log(`  ${String(p.vechi).padStart(7)} -> ${String(p.x.pret).padStart(7)} (${d > 0 ? '+' : ''}${d}) ${String(p.x.titlu).slice(0, 56)}`);
  });
  return { noi, disparute, scumpiri };
}

// ------------------------------------------------------------------- main

(async () => {
  const cmd = process.argv[2] || 'tot';
  if (cmd === 'linkuri') await verificaLinkuri();
  else if (cmd === 'storia') await scaneazaStoria();
  else if (cmd === 'masini') await scaneazaMasini();
  else if (cmd === 'publi24') await scaneazaPubli24();
  else if (cmd === 'dubluri') await gasesteDubluri();
  else if (cmd === 'diff') diferente();
  else if (cmd === 'tot') {
    console.log('--- linkuri moarte ---'); await verificaLinkuri();
    console.log('\n--- scanare storia ---'); await scaneazaStoria();
    console.log('\n--- masini pe autovit ---'); await scaneazaMasini();
    console.log('\n--- diferente fata de ieri ---'); diferente();
    console.log('\n--- dubluri dupa poze ---'); await gasesteDubluri();
  } else {
    console.log('comenzi: linkuri | storia | masini | publi24 | dubluri | diff | tot');
  }
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
