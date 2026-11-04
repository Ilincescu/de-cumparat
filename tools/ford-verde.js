// Ford verde: SUV-urile Ford verzi de pe Autovit, pentru urmarire.
//
//   node tools/ford-verde.js
//
// Mihai, 2026-11-04: "Ford verde, daca vezi ceva sa imi zici". Stie ca e peste
// bugetul de masina; vrea sa afle doar de o oferta buna. Nu intra in masini.json
// si nu apare pe site: rezultatul se spune doar in chat.
//
// Ia toate Ford-urile cu culoarea verde din 2018 incoace (filtrul de culoare al
// Autovit), pastreaza SUV-urile (Kuga, Puma, EcoSport, Edge, Explorer, Bronco)
// si scrie, pe model, cel mai mic pret si lista sortata dupa pret.

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html' };
const SUV = /\b(kuga|puma|ecosport|edge|explorer|bronco)\b/i;
const URL = p => 'https://www.autovit.ro/autoturisme/ford?search%5Bfilter_enum_color%5D=green'
  + `&search%5Bfilter_float_year%3Afrom%5D=2018&page=${p}`;

const numar = t => parseInt(String(t || '').replace(/[^\d]/g, ''), 10) || null;

async function pagina(p) {
  const h = await (await fetch(URL(p), { headers: UA })).text();
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`pagina ${p}: fara __NEXT_DATA__ (Autovit a schimbat pagina sau a blocat cererea)`);
  const st = JSON.parse(m[1]).props.pageProps.urqlState || {};
  for (const v of Object.values(st)) {
    let d; try { d = JSON.parse(v.data || '{}'); } catch (e) { continue; }
    const a = d.advertSearch;
    if (a && Array.isArray(a.edges)) return { total: a.totalCount, edges: a.edges };
  }
  return { total: 0, edges: [] };
}

(async () => {
  const vazute = new Map();
  let total = 0;
  for (let p = 1; p <= 10; p++) {
    const { total: t, edges } = await pagina(p);
    total = t || total;
    const noi = edges.filter(e => !vazute.has(e.node.id));
    if (!noi.length) break;
    noi.forEach(e => vazute.set(e.node.id, e.node));
    if (vazute.size >= total) break;
  }
  const masini = [...vazute.values()].map(n => {
    const P = {};
    (n.parameters || []).forEach(x => { P[x.key] = x.displayValue || x.value; });
    return {
      m: n.title || '', an: numar(P.year), km: numar(P.mileage), cp: numar(P.engine_power),
      f: P.fuel_type || '', p: Math.round(Number(n.price && n.price.amount && n.price.amount.units)) || null,
      z: (n.location && n.location.city && n.location.city.name) || '', u: n.url,
      d: (n.createdAt || '').slice(0, 10),
    };
  }).filter(x => SUV.test(x.m)).sort((a, b) => a.p - b.p);

  console.log(`Ford verde pe Autovit, din 2018: ${total} anunturi, din care ${masini.length} SUV (citit ${new Date().toISOString().slice(0, 16)}Z)\n`);
  const pe = {};
  masini.forEach(x => { const k = (x.m.match(SUV) || [''])[0].toLowerCase(); (pe[k] = pe[k] || []).push(x); });
  Object.entries(pe).forEach(([k, l]) => console.log(`  ${k}: ${l.length} anunturi, cel mai ieftin ${l[0].p} EUR`));
  console.log('');
  masini.forEach(x => console.log(`${String(x.p).padStart(6)} EUR · ${x.m} · ${x.an} · ${x.km} km · ${x.cp} CP · ${x.f} · ${x.z} · pus ${x.d}\n         ${x.u}`));
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
