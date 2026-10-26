// Chiriile de 2 camere din Sibiu de pe celelalte site-uri, nu doar Storia.
//
//   node tools/chirii-externe.js
//
// De ce: in Tiglari Storia avea doar chirii din blocuri noi (Lake Home), iar
// blocurile vechi se inchiriaza mult de la proprietar, care pune anuntul pe OLX,
// Publi24 sau Facebook. Cu Storia singur, chiria din top venea din tot orasul
// (Mihai, 2026-10-26: "cauta si in celelalte site-uri care vand si pentru chirii").
//
// Fara browser, zilnic: Publi24 si lajumate (copiile homezz). Cu browserul, cand
// fisierele sunt de azi (prompt-zilnic.txt, pasii d, e, f):
//   tools/externe/olx-chirii.json         {u, t, p, ld, mp, z}
//   tools/externe/imobiliare-chirii.json  {u, t, p, mp, desc}
//   tools/externe/facebook-chirii.json    {u, t, p, desc}
//
// Iese tools/snapshots/chirii-externe-<data>.json, cu aceeasi forma ca
// chirii-anunturi-<data>.json (Storia) plus sursa si titlul. azi.js le citeste
// pe amandoua; dublurile intre site-uri le scoate el.

const fs = require('fs');
const path = require('path');

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0' };
const DOSAR = path.join(__dirname, 'snapshots');
const EXTERNE = path.join(__dirname, 'externe');
const AZI = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const pauza = ms => new Promise(r => setTimeout(r, ms));
const fara = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fara2 = s => fara(s).replace(/(.)\1+/g, '$1');

// Tilisca lipseste: e si cartier al Sibiului pe Storia, nu doar satul. Aleea
// Selimbar e strada in Sibiu (Facebook, 2026-10-26), nu comuna.
const AFARA = /r[aă][sș]inari|al[tț][aâ]na|p[aă]ltini[sș]|[sș]ura mic|[sș]ura mare|cisn[aă]die|(?<!aleea\s)[sș]elimb[aă]r|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|cristian|vurp[aă]r|slimnic|regim hotelier|pe noapte|termen scurt/i;

// Cartierele sunt numele din Storia, ca sa se potriveasca cu anunturile de vanzare
function cartiere() {
  const f = fs.readdirSync(DOSAR).filter(x => /^chirii-anunturi-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  const din = f ? JSON.parse(fs.readFileSync(path.join(DOSAR, f), 'utf8')).map(a => a.cartier) : [];
  return [...new Set(din)].filter(c => c && c !== 'Fara cartier').sort((a, b) => b.length - a.length);
}
const CARTIERE = cartiere();

// Pe celelalte site-uri zona se scrie dupa strada sau reper ("Mihai Viteazu",
// "Piata Cluj"), nu dupa cartierul Storia. Nu ghicesc harta: invat din
// anunturile de vanzare Storia - cartierul in care cad cele cu reperul in
// titlu. Doar cu minim 8 anunturi si peste 55% intr-un cartier; altfel reperul
// ramane fara cartier si chiria conteaza doar la nivel de oras (2026-10-26:
// "doamna stanca" se imparte 26/22/22% intre trei cartiere).
const REPERE = ['strand', 'hipodrom', 'mihai viteazu', 'doamna stanca', 'rahovei', 'piata cluj', 'calea cisnadiei',
  'ultracentral', 'garii', 'cedonia', 'arhitectilor', 'ciresica', 'sub arini', 'piata cibin', 'avantgarden', 'surii mici',
  'vasile milea', 'calea dumbravii', 'lacul lui binder', 'binder', 'ogorului', 'semaforului', 'tribunei', 'mall'];
function invataRepere() {
  const f = fs.readdirSync(DOSAR).filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  if (!f) return [];
  const s = JSON.parse(fs.readFileSync(path.join(DOSAR, f), 'utf8'));
  const l = (Array.isArray(s) ? s : Object.values(s).flat()).filter(x => x && x.titlu && x.zona);
  const randuri = l.map(x => ({ t: fara2(x.titlu + ' ' + String(x.descriere || '').slice(0, 300)), c: x.zona.replace(', Sibiu', '') }))
    .filter(r => r.c && r.c !== 'Fara cartier' && r.c !== 'Sibiu');
  const out = [];
  for (const k of REPERE) {
    const g = randuri.filter(r => r.t.includes(fara2(k)));
    const n = {};
    g.forEach(r => { n[r.c] = (n[r.c] || 0) + 1; });
    const [c, cate] = Object.entries(n).sort((a, b) => b[1] - a[1])[0] || [];
    // Fara \b la coada: "mihai viteazu" trebuie sa prinda si "mihai viteazul"
    if (g.length >= 8 && cate / g.length > 0.55) out.push([new RegExp('\\b' + fara2(k)), c, k, g.length, Math.round(cate / g.length * 100)]);
  }
  return out;
}
const ALIAS = invataRepere();
const scapa = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function cartierDin(text) {
  const t = fara2(text);
  return CARTIERE.find(c => new RegExp('\\b' + scapa(fara2(c)) + '\\b').test(t))
    || (ALIAS.find(([r]) => r.test(t)) || [])[1] || 'Fara cartier';
}
const decodeaza = s => String(s || '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&amp;/g, '&').replace(/&quot;/g, '"');

const numar = s => { const m = String(s || '').replace(',', '.').match(/\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const mpDin = t => { const m = String(t || '').match(/(\d{2,3}(?:[.,]\d+)?)\s*(?:mp|m²|m2|m 2|metri)/i); return m ? numar(m[1]) : null; };
const euro = s => { const m = String(s || '').match(/(\d[\d .]*)\s*(?:€|eur)/i); return m ? Number(m[1].replace(/[^\d]/g, '')) || null : null; };

function rand(sursa, url, titlu, chirie, mp, text, postat = null, etaj = null) {
  titlu = decodeaza(titlu); text = decodeaza(text);
  if (!chirie || chirie < 150 || chirie > 1500 || !mp || mp < 20 || mp > 150) return null;
  if (AFARA.test(titlu + ' ' + text) || /garsonier/i.test(titlu)) return null;
  return { id: sursa + ':' + url.split(/[/?]/).filter(Boolean).pop(), url, chirie, mp, etaj, cartier: cartierDin(titlu + ' ' + String(text).slice(0, 400)), postat, sursa, titlu };
}

// Publi24: HTML, ?pag=N. Cardul are pretul si, la agentii, "50 mp, zona X";
// unde lipseste suprafata deschid anuntul ("Suprafata utila N").
async function publi24() {
  const baza = 'https://www.publi24.ro/anunturi/imobiliare/de-inchiriat/apartamente/apartamente-2-camere/sibiu/sibiu/';
  const carduri = new Map();
  for (let p = 1; p <= 20; p++) {
    const h = await (await fetch(baza + (p > 1 ? '?pag=' + p : ''), { headers: UA })).text();
    const bl = h.split('<div class="article-item').slice(1);
    let noi = 0;
    for (const b of bl) {
      const u = (b.match(/href="(https:\/\/www\.publi24\.ro[^"]+\/anunt\/[^"]+)"/) || [])[1];
      if (!u || carduri.has(u)) continue;
      noi++;
      const titlu = ((b.match(/alt="([^"]*)"/) || [])[1] || '').trim();
      const pret = ((b.match(/article-price[^>]*>([\s\S]*?)<\/(span|div|p)/) || [])[1] || '').replace(/<[^>]+>/g, ' ');
      carduri.set(u, { u, titlu, pret, text: b.replace(/^[^>]*>/, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') });
    }
    if (!noi) break;
    await pauza(400);
  }
  const out = [];
  for (const c of carduri.values()) {
    let mp = mpDin(c.text);
    if (!mp) {
      const t = (await (await fetch(c.u, { headers: UA })).text()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      mp = numar((t.match(/Suprafata utila\s*(\d+(?:[.,]\d+)?)/i) || [])[1]);
      await pauza(300);
    }
    const r = rand('publi24', c.u, c.titlu, euro(c.pret), mp, c.text);
    if (r) out.push(r);
  }
  return out;
}

// lajumate: __NEXT_DATA__.pageProps.adsServer, ?page=N; city_id 7572 e orasul
// Sibiu. Suprafata, etajul si camerele sunt in ad_fields.
async function lajumate() {
  const out = [];
  for (let p = 1; p <= 15; p++) {
    const h = await (await fetch('https://lajumate.ro/anunturi/imobiliare/apartamente-de-inchiriat/in/sibiu' + (p > 1 ? '?page=' + p : ''), { headers: UA })).text();
    const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    const ads = m ? JSON.parse(m[1]).props.pageProps.adsServer || [] : [];
    if (!ads.length) break;
    for (const x of ads) {
      const f = k => (x.ad_fields.find(a => a.name === k) || {}).value;
      if (x.city_id !== 7572 || f('rooms') !== '2' || fara(x.currency) !== 'eur') continue;
      const r = rand('lajumate', `https://lajumate.ro/ad/${x.slug}-${x.id}`, x.title, Math.round(Number(x.price)), numar(f('real_estate_dimensions')),
        x.description || '', String(x.listed_at || '').slice(0, 10) || null, f('real_estate_floor') || null);
      if (r) out.push(r);
    }
    await pauza(400);
  }
  return out;
}

// Fisierele scoase azi cu browserul; cele din alte zile nu se folosesc
function dinBrowser(fisier, sursa, citeste) {
  const f = path.join(EXTERNE, fisier);
  if (!fs.existsSync(f) || fs.statSync(f).mtime.toISOString().slice(0, 10) !== AZI) return { lipsa: true, out: [] };
  let l = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (typeof l === 'string') l = JSON.parse(l);
  if (!Array.isArray(l)) l = l.out || l.anunturi || [];
  return { out: l.map(x => citeste(x)).filter(Boolean) };
}

(async () => {
  console.log('repere invatate din Storia:', ALIAS.map(([, c, k, n, p]) => `${k} -> ${c} (${p}% din ${n})`).join(', '));
  const surse = {
    publi24: await publi24().catch(e => (console.log('publi24:', e.message), [])),
    lajumate: await lajumate().catch(e => (console.log('lajumate:', e.message), [])),
  };
  const browser = {
    olx: dinBrowser('olx-chirii.json', 'olx', x => rand('olx', x.u, x.t, euro(x.p), numar(x.mp), x.z || '')),
    imobiliare: dinBrowser('imobiliare-chirii.json', 'imobiliare', x => rand('imobiliare', x.u, x.t, euro(x.p), numar(x.mp) || mpDin(x.t + ' ' + x.desc), x.desc || '')),
    // Pe Facebook pretul scris "RON" la anunturile proprii e de fapt in euro (prompt-zilnic.txt, c)
    facebook: dinBrowser('facebook-chirii.json', 'facebook', x => rand('facebook', x.u, x.t, euro(x.p) || numar(x.p), mpDin(x.t + ' ' + x.desc), x.desc || '')),
  };
  for (const [k, v] of Object.entries(browser)) { surse[k] = v.out; if (v.lipsa) console.log(`${k}: fisierul din browser nu e de azi, sar`); }
  const toate = Object.values(surse).flat();
  fs.writeFileSync(path.join(DOSAR, `chirii-externe-${AZI}.json`), JSON.stringify(toate, null, 1));
  for (const [k, v] of Object.entries(surse)) console.log(`${k.padEnd(11)} ${String(v.length).padStart(4)} chirii, ${v.filter(x => x.cartier !== 'Fara cartier').length} cu cartier`);
  console.log(`scris snapshots/chirii-externe-${AZI}.json (${toate.length})`);
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
