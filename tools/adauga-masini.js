// Adauga in masini.json rezultatele unei cautari Autovit, fara browser.
//
//   node tools/adauga-masini.js suzuki/vitara/de-la-2015 13000 150000
//
// Primul argument e calea de model de pe Autovit, al doilea pretul maxim in
// EUR, al treilea kilometrajul maxim. Sare peste cvadricicluri, peste masinile
// cu garda joasa si peste anunturile deja existente in lista.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html' };

const GARDA_INALTA = new RegExp([
  'duster', 'stepway', 'tivoli', 'compass', 'renegade',
  '2008', '3008', '5008', 'aircross', 'crossland', 'grandland', 'captur', 'juke',
  'tucson', 'kona', 'santa fe', 'sportage', 'sorento', 'niro',
  'cx-?[35]', 'rav4', 'x-?trail', 'qashqai', 'koleos', 'arkana',
  'vitara', 'jimny', 's-?cross', 'ignis', 'wrangler', 'defender',
  'tiguan', 't-?cross', 't-?roc', 'taigo', 'kamiq', 'karoq', 'kodiaq', 'q[2358]\\b',
  'ecosport', 'kuga', 'puma', 'bronco',
  'xc[46]0', 'x[1356]\\b', 'gla', 'glb', 'glc',
  'dokker', 'caddy', 'berlingo', 'partner', 'rifter', 'combo', 'doblo', 'express',
].join('|'), 'i');
const CVADRICICLU = /aixam|ligier|chatenet|aigo|elaris|suda|allview|microcar/i;

function numar(s) {
  if (s === null || s === undefined) return null;
  const c = String(s).replace(/[^0-9]/g, '');
  return c ? parseInt(c, 10) : null;
}

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
  throw new Error('nu am gasit advertSearch');
}

(async () => {
  const model = process.argv[2];
  const pretMax = +(process.argv[3] || 13000);
  const kmMax = +(process.argv[4] || 150000);
  if (!model) { console.log('lipseste modelul, de exemplu: suzuki/vitara/de-la-2015'); process.exit(1); }

  const u = `https://www.autovit.ro/autoturisme/${model}`
    + `?search%5Bfilter_float_price%3Ato%5D=${pretMax}`
    + `&search%5Bfilter_float_mileage%3Ato%5D=${kmMax}`;
  const t0 = Date.now();
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error('autovit status ' + r.status);
  const cautare = dinNextData(await r.text());
  console.log(`autovit: ${cautare.totalCount} rezultate in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const azi = new Date().toISOString().slice(0, 10);
  let gasite = cautare.edges.map(e => {
    const n = e.node || {};
    const p = {};
    (n.parameters || []).forEach(x => { p[x.key] = x.displayValue || x.value; });
    return {
      m: n.title || '',
      an: numar(p.year), km: numar(p.mileage), cp: numar(p.engine_power),
      f: (p.fuel_type || '').toLowerCase(),
      p: (n.price && n.price.amount && n.price.amount.units) || null,
      z: (n.location && n.location.city && n.location.city.name) || '',
      src: 'autovit', u: n.url,
      warn: /puretech/i.test(n.title || '')
        ? 'Motor PureTech cu curea de distributie in baie de ulei - cere dovada schimbarii ei.' : null,
      d: azi,
    };
  }).filter(x => !CVADRICICLU.test(x.m));
  gasite.forEach(x => { x.gj = !GARDA_INALTA.test(x.m); });

  const j = JSON.parse(fs.readFileSync(path.join(RADACINA, 'masini.json'), 'utf8'));
  const existente = new Set(j.masini.map(m => m.u));
  const adaugate = gasite.filter(g => !existente.has(g.u));

  j.masini = j.masini.concat(adaugate).sort((a, b) => (a.p || 0) - (b.p || 0));
  j.actualizat = azi;
  fs.writeFileSync(path.join(RADACINA, 'masini.json'), JSON.stringify(j, null, 1));

  console.log(`adaugate ${adaugate.length}, lista are acum ${j.masini.length} masini`);
  adaugate.forEach(x => console.log(`  ${String(x.p).padStart(6)} ${x.an} ${String(x.km).padStart(6)}km ${String(x.z).padEnd(18)} ${x.m}`));
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
