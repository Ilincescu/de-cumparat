// Masinile "din dorinta": peste buget, urmarite din curiozitate, pentru
// top-masini.html. Mihai, 2026-11-22: "o lista cu masinile din top 3 practice
// si la pretul care vreau si o lista cu cele din dorinta mea mai scumpe".
//
//   node tools/dorinte.js            proba
//   node tools/dorinte.js --scrie    scrie dorinte.json
//
// Fiecare dorinta e o cautare Autovit (ca ford-verde.js, din __NEXT_DATA__) si un
// filtru pe titlu si combustibil. Se pastreaza cele mai ieftine 5 de fiecare.
// O dorinta noua se adauga in DORINTE, nu in pagina.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html' };
const PE_GRUP = 5;

const DORINTE = [
  {
    id: 'ford-verde',
    nume: 'Ford SUV verde',
    nota: 'Urmarit din 4 noiembrie ("Ford verde, daca vezi ceva sa imi zici"). Puma si Kuga: motoarele 1.0 si 1.5 EcoBoost au cureaua in baie de ulei.',
    url: p => 'https://www.autovit.ro/autoturisme/ford?search%5Bfilter_enum_color%5D=green'
      + `&search%5Bfilter_float_year%3Afrom%5D=2018&page=${p}`,
    pastreaza: x => /\b(kuga|puma|ecosport|edge|explorer|bronco)\b/i.test(x.m),
  },
  {
    id: 'mg-ehs-phev',
    nume: 'MG EHS plug-in hibrid',
    nota: 'Un EHS plug-in din 2021 se cere acum 18.000-21.000 € (Autouncle, AutoScout24, 2026-11-22).',
    url: p => `https://www.autovit.ro/autoturisme/mg?search%5Bfilter_float_year%3Afrom%5D=2020&page=${p}`,
    pastreaza: x => /\behs\b/i.test(x.m) || (/\bhs\b/i.test(x.m) && /plug/i.test(x.f)),
    // Oferta cunoscuta din familie (2026-11-22), ca reper de pret; pagina e publica, deci fara nume
    reper: { m: 'MG EHS plug-in hibrid, oferta cunoscuta', an: 2021, km: 61000, f: 'hibrid plug-in', p: 14500,
      nota: '50-60 km pe electric, motor 1.5 benzina' },
  },
];

const numar = t => parseInt(String(t || '').replace(/[^\d]/g, ''), 10) || null;

async function pagina(url) {
  const h = await (await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) })).text();
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('fara __NEXT_DATA__ (Autovit a schimbat pagina sau a blocat cererea)');
  const st = JSON.parse(m[1]).props.pageProps.urqlState || {};
  for (const v of Object.values(st)) {
    let d; try { d = JSON.parse(v.data || '{}'); } catch (e) { continue; }
    const a = d.advertSearch;
    if (a && Array.isArray(a.edges)) return { total: a.totalCount, edges: a.edges };
  }
  return { total: 0, edges: [] };
}

async function cauta(dorinta) {
  const vazute = new Map();
  let total = 0;
  for (let p = 1; p <= 10; p++) {
    const { total: t, edges } = await pagina(dorinta.url(p));
    total = t || total;
    const noi = edges.filter(e => !vazute.has(e.node.id));
    if (!noi.length) break;
    noi.forEach(e => vazute.set(e.node.id, e.node));
    if (vazute.size >= total) break;
  }
  return [...vazute.values()].map(n => {
    const P = {};
    (n.parameters || []).forEach(x => { P[x.key] = x.displayValue || x.value; });
    return {
      m: n.title || '', an: numar(P.year), km: numar(P.mileage), cp: numar(P.engine_power),
      f: P.fuel_type || '', p: Math.round(Number(n.price && n.price.amount && n.price.amount.units)) || null,
      z: (n.location && n.location.city && n.location.city.name) || '', u: n.url,
      d: (n.createdAt || '').slice(0, 10),
    };
  }).filter(x => x.p && dorinta.pastreaza(x)).sort((a, b) => a.p - b.p);
}

(async () => {
  const grupuri = [];
  for (const d of DORINTE) {
    try {
      const l = await cauta(d);
      grupuri.push({ id: d.id, nume: d.nume, nota: d.nota, reper: d.reper || null, total: l.length, anunturi: l.slice(0, PE_GRUP) });
      console.log(`${d.nume}: ${l.length} anunturi, cel mai ieftin ${l.length ? l[0].p + ' EUR' : '-'}`);
      l.slice(0, PE_GRUP).forEach(x => console.log(`  ${x.p} EUR · ${x.m} · ${x.an} · ${x.km} km · ${x.f} · ${x.z}\n    ${x.u}`));
    } catch (e) {
      // O dorinta care nu se poate citi nu strica pagina: ramane ce era ieri
      console.log(`${d.nume}: EROARE ${e.message}`);
      grupuri.push({ id: d.id, nume: d.nume, nota: d.nota, reper: d.reper || null, eroare: e.message });
    }
  }
  if (!SCRIE) { console.log('\n(proba; ruleaza cu --scrie ca sa salvez)'); return; }
  const cale = path.join(RADACINA, 'dorinte.json');
  let vechi = {};
  try { vechi = JSON.parse(fs.readFileSync(cale, 'utf8')); } catch (e) { /* prima rulare */ }
  const dupaId = new Map((vechi.grupuri || []).map(g => [g.id, g]));
  const final = grupuri.map(g => (g.eroare && dupaId.get(g.id) && dupaId.get(g.id).anunturi)
    ? { ...dupaId.get(g.id), nota: g.nota, reper: g.reper, eroare: g.eroare } : g);
  fs.writeFileSync(cale, JSON.stringify({ actualizat: new Date().toISOString().slice(0, 10), grupuri: final }, null, 1) + '\n');
  console.log('scris dorinte.json');
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
