// Case din alte surse decat Storia, adaugate in date.json.
//
//   node tools/surse-case.js zilnic [--scrie]   publi24, lajumate/homezz, agentiile
//                                                si licitatiile, toate fara browser
//   node tools/surse-case.js fisier tools/externe/olx-raw.json [--scrie]
//
// OLX si imobiliare.ro dau 403 la un GET si raman pe browser (vezi
// tools/prompt-zilnic.txt). Restul se iau direct:
// - publi24: prin romimo.ro, care e aceeasi retea si are lista pe orasul Sibiu
//   cu JSON-LD (titlu, descriere, pret, link spre publi24). Pagina publi24
//   amesteca tot judetul si terenurile.
// - lajumate.ro: __NEXT_DATA__.pageProps.adsServer. Toate anunturile din Sibiu
//   sunt copii de pe homezz.ro (isCopy.site), deci o sursa le acopera pe amandoua.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');
const CE = process.argv[2] || 'zilnic';
const AZI = new Date().toISOString().slice(0, 10);
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36', 'Accept': 'text/html', 'Accept-Language': 'ro-RO,ro;q=0.9' };
const PRAG = 250000;

// Aceleasi excluderi ca la Storia (scan.js), cautate in titlu si descriere.
const IN_AFARA = /r[aă][sș]inari|al[tț][aâ]na|tili[sș]ca|p[aă]ltini[sș]|[sș]ura mic|[sș]ura mare|bavaria|cisn[aă]di|[sș]elimb[aă]r|nucet|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|sadu|ro[sș]ia|cristian|vurp[aă]r|daia|corn[aă][tț]el|slimnic|avrig|medias|media[sș]|de vacan[tț]|\bkm de sibiu|viile sibiului/i;
const EXCLUS = [
  ['curte comuna', /curt[eiă][^.!?]{0,40}comun|comun[ăa][^.!?]{0,40}curt|cot[aă]\s+parte|\bcot[aă]\s+(de\s+)?\d+\s*\/\s*\d+|[iî]n\s+indiviziune/i],
  ['doua corpuri', /(dou[aă]|2)\s+(corpuri|case|locuin[tț]e|apartamente|garsoniere)|aceea?(s|ș)i\s+curte/i],
  ['nefinisata', /\bla\s+alb\b|\bla\s+ro[sș]u\b|stadiul?\s+de\s+gri|semifinisat/i],
  ['nu e casa', /^apartament(?!\s+(la|de)\s+cas)|\bteren\s+intravilan\b(?!.*\bcas)|spa[tț]iu\s+comercial|\bhal[aă]\b|capsul|cas[aă]\s+mobil|glamping|c[aă]su[tț][aăe]|modular|container/i],
  ['alt judet', /v[aâ]lcea|\bbran\b|bra[sș]ov|bruiu|[sș]omartin|\bcomuna\b|\bcom\.|\bsat(ul|ului)?\b|[sș]eica|mic[aă]sasa|\bla\s+[tț]ar[aă]\b|\bjud(e[tț]ul)?\.?\s+(?!sibiu)[a-zăâîșț]{3,}|\bloc\.\s*(?!sibiu)[a-zăâîșț]{3,}/i],
];
// Sub 20.000 € nu e pretul unei case din oras: e chirie, pret pe mp sau avans.
const PRET_MINIM = 20000;

const curat = s => String(s || '').replace(/&#(\d+);/g, (m, c) => String.fromCharCode(c))
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const nr = (re, s) => { const m = String(s).match(re); return m ? +m[1] : null; };

function cartiere(date) {
  // Numele de cartier le iau din anunturile Storia deja in lista, ca sa poata
  // fi grupate cu ele de marcheaza-dubluri.js (acelasi cartier + acelasi teren).
  const s = new Set();
  date.anunturi.forEach(o => { const z = String(o.z || '').replace(/,\s*Sibiu$/i, '').replace(/\s*\(.*\)/, '').trim(); if (z && z !== 'Sibiu') s.add(z); });
  return [...s].sort((a, b) => b.length - a.length);
}
const fara = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function inFormaListei(x, zone) {
  const text = `${x.titlu} ${x.descriere}`;
  const t = fara(text);
  const zona = zone.find(z => t.includes(fara(z)));
  const teren = nr(/teren\D{0,12}(\d{2,4})\s*m/i, text);
  const curte = nr(/curte\D{0,12}(\d{2,4})\s*m/i, text);
  return {
    k: 'casa',
    p: x.pret,
    t: x.titlu,
    z: zona || 'Sibiu',
    r: x.camere || nr(/(\d)\s*camere/i, text),
    a: x.mpu || nr(/(\d{2,3})\s*(?:mpu|mp\s*util|m²?\s*util)/i, text),
    g: curte ? `curte ${curte} mp` : teren ? `teren ${teren} mp` : null,
    gm: curte || null,
    c: /singur[aă]?\s+[iî]n\s+curte|curte\s+proprie/i.test(text) ? 'proprie' : null,
    d2: /duplex|triplex|cvadruplex|[iî]n[sș]iruit/i.test(text) || undefined,
    src: x.src,
    u: x.url,
    warn: 'Din ' + x.src + '; detalii neverificate in descriere.',
    d: AZI,
  };
}

async function html(u) {
  const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${u}: status ${r.status}`);
  return r.text();
}

async function publi24() {
  const out = [];
  for (let p = 1; p <= 20; p++) {
    const h = await html('https://www.romimo.ro/case/vanzare/sibiu/sibiu/' + (p > 1 ? '?pag=' + p : ''));
    const m = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) break;
    const lista = (JSON.parse(m[1].replace(/[\u0000-\u001f]+/g, ' ')).itemListElement || []);
    const noi = lista.filter(x => x.url && !out.some(y => y.url.endsWith(x.url)));
    if (!noi.length) break;
    noi.forEach(x => {
      const o = x.offers || {};
      out.push({
        src: 'publi24',
        titlu: curat(x.name),
        descriere: curat(x.description),
        pret: o.priceCurrency === 'EUR' ? Math.round(+o.price) : null,
        url: 'https://www.publi24.ro/' + String(x.url).replace(/^\//, ''),
      });
    });
  }
  return out;
}

async function lajumate() {
  const out = [];
  for (let p = 1; p <= 30; p++) {
    const h = await html('https://lajumate.ro/anunturi/imobiliare/case-vile-de-vanzare/in/sibiu' + (p > 1 ? '?page=' + p : ''));
    const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!m) break;
    const a = JSON.parse(m[1]).props.pageProps.adsServer || [];
    if (!a.length) break;
    a.filter(x => x.city && x.city.name === 'Sibiu').forEach(x => {
      const camp = n => ((x.ad_fields || []).find(f => f.name === n) || {}).value;
      out.push({
        src: 'lajumate',
        titlu: curat(x.title),
        descriere: curat(x.description),
        pret: x.currency === 'eur' ? Math.round(+x.price) : null,
        mpu: +camp('real_estate_dimensions') || null,
        camere: +camp('rooms') || null,
        url: `https://lajumate.ro/ad/${x.slug}-${x.id}`,
      });
    });
  }
  // In lista titlul e taiat la 60 de caractere si descrierea lipseste, iar fara
  // ele nu prind zona, terenul sau "curte comuna". Le iau din pagina anuntului,
  // doar pentru cele sub plafon.
  const deCitit = out.filter(x => x.pret && x.pret <= PRAG);
  for (let i = 0; i < deCitit.length; i += 6) {
    await Promise.all(deCitit.slice(i, i + 6).map(async x => {
      try {
        const h = await html(x.url);
        const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        const ad = m && JSON.parse(m[1]).props.pageProps.adData;
        if (ad) { x.titlu = curat(ad.title).replace(/\s*-\s*Sibiu \(Sibiu\)$/, ''); x.descriere = curat(ad.description); }
      } catch (e) { /* ramane cu titlul din lista */ }
    }));
  }
  return out;
}

// Agentiile din Sibiu pe platforma REBS (acelasi site, alt domeniu). Lista are
// JSON-LD ItemList (titlu + link), fiecare anunt JSON-LD RealEstateListing cu
// pret, mp utili, camere si descriere. Anuntul REBS are un cod cpNNNNNNN, pe
// care agentiile il scriu si in descrierea de pe Storia ("CP3479236"); dupa el
// sar peste ce e deja pe Storia, fara sa citesc pagina.
const AGENTII_REBS = ['www.maac.ro', 'www.azura-estate.ro', 'www.novaimob.ro', 'www.sibiuestate.ro'];

// Anunturile pe care scanarea Storia le-a exclus (curte comuna, la gri, doua
// corpuri...), dupa pret + teren si dupa cartier + pret + mp utili. Aceeasi casa
// copiata pe imobiliare.ro sau lajumate are acolo doar textul de pe card, fara
// descrierea intreaga, si trecea de filtre: Gusterita 129.990 (doua camere la
// gri) era exclusa pe Storia si aparea totusi din imobiliare.ro.
function exclusePeStoria() {
  const dosar = path.join(__dirname, 'snapshots');
  const ultim = fs.readdirSync(dosar).filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  const m = new Map();
  if (!ultim) return m;
  const z = s => fara(String(s || '').replace(/,\s*Sibiu$/i, '').trim());
  JSON.parse(fs.readFileSync(path.join(dosar, ultim), 'utf8')).forEach(x => {
    if (!x.exclus || !x.exclus.length || !x.pret) return;
    const motiv = [].concat(x.exclus).join(', ');
    if (x.teren) m.set(`${x.pret}|t${x.teren}`, motiv);
    if (x.mpu && z(x.zona) && z(x.zona) !== 'sibiu') m.set(`${z(x.zona)}|${x.pret}|a${x.mpu}`, motiv);
  });
  return m;
}

// ANAF eLicitatii: lista e o pagina Next.js citibila direct (?pagina=N), pe
// categorii. Judetul si pretul de pornire sunt in datele paginii fiecarui bun
// ("judet":"SIBIU", "pretPornireLicitatie":"297039.5", in lei). Leul il
// transform in euro cu cursul BNR din ziua respectiva.
async function cursEuro() {
  // www.bnr.ro/nbrfxrates.xml redirecteaza acum la prima pagina; fluxul e pe curs.bnr.ro.
  const x = await html('https://curs.bnr.ro/nbrfxrates.xml');
  return +((x.match(/currency="EUR">([\d.]+)</) || [])[1]) || null;
}

async function anaf() {
  const curs = await cursEuro();
  const linkuri = new Set();
  // Filtrul pe judet e ?filtre={"judet":"32"} (32 = Sibiu); ?judet=32 e ignorat.
  const filtru = encodeURIComponent(JSON.stringify({ judet: '32' }));
  for (const cat of ['case-vile', 'duplexuri']) {
    for (let p = 1; p <= 40; p++) {
      const h = await html(`https://elicitatii.anaf.ro/publicitate/categorii/bunuri-imobile/${cat}?filtre=${filtru}&pagina=${p}`);
      const n = linkuri.size;
      (h.match(/\/publicitate\/produs\/[a-z0-9-]+/gi) || []).forEach(x => linkuri.add(x));
      if (linkuri.size === n) break;
    }
  }
  const out = [];
  const L = [...linkuri];
  for (let i = 0; i < L.length; i += 6) {
    await Promise.all(L.slice(i, i + 6).map(async l => {
      try {
        const u = 'https://elicitatii.anaf.ro' + l;
        const h = (await html(u)).replace(/\\"/g, '"');
        if (!/"judet":"SIBIU"/i.test(h)) return;
        const lei = +((h.match(/"pretPornireLicitatie":"([\d.]+)"/) || [])[1]) || null;
        out.push({
          src: 'licitatie',
          titlu: 'Licitatie ANAF: ' + l.replace(/^.*\/\d+-/, '').replace(/-/g, ' '),
          descriere: curat((h.match(/"descriere":"([^"]{0,2000})/) || [])[1]),
          pret: lei && curs ? Math.round(lei / curs) : null,
          url: u,
        });
      } catch (e) { /* un bun care nu raspunde nu opreste restul */ }
    }));
  }
  console.log(`anaf: ${out.length} case si duplexuri in judetul Sibiu (curs BNR ${curs})`);
  return out;
}

function coduriPeStoria() {
  const dosar = path.join(__dirname, 'snapshots');
  const ultim = fs.readdirSync(dosar).filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  const s = new Set();
  if (ultim) JSON.parse(fs.readFileSync(path.join(dosar, ultim), 'utf8'))
    .forEach(x => (String(x.descriere || '').match(/\bcp\s*\d{6,8}\b/gi) || []).forEach(c => s.add(c.replace(/\s/g, '').toLowerCase())));
  return s;
}

async function agentii() {
  const peStoria = coduriPeStoria();
  const out = [];
  let sarite = 0;
  for (const dom of AGENTII_REBS) {
    const linkuri = new Set();
    for (let p = 1; p <= 30; p++) {
      let h;
      try { h = await html(`https://${dom}/case-vile-de-vanzare/sibiu/` + (p > 1 ? '?page=' + p : '')); } catch (e) { break; }
      const m = h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const lista = m ? (JSON.parse(m[1]).itemListElement || []) : [];
      const inainte = linkuri.size;
      lista.forEach(x => x.url && linkuri.add(x.url));
      if (linkuri.size === inainte) break;
    }
    const deCitit = [...linkuri].filter(u => {
      const cod = (u.match(/-(cp\d+)\/?$/) || [])[1];
      if (cod && peStoria.has(cod)) { sarite++; return false; }
      return true;
    });
    for (let i = 0; i < deCitit.length; i += 6) {
      await Promise.all(deCitit.slice(i, i + 6).map(async u => {
        try {
          const h = await html(u);
          const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
            .map(x => { try { return JSON.parse(x[1]); } catch (e) { return null; } })
            .find(x => x && [].concat(x['@type']).includes('RealEstateListing'));
          if (!ld) return;
          const o = ld.offers || {};
          const zona = (u.match(/de-vanzare-(.+?)-sibiu-cp\d+/) || [])[1];
          out.push({
            src: dom.replace(/^www\./, '').replace(/\.ro$/, ''),
            titlu: curat(ld.name),
            descriere: curat(`${ld.description || ''} ${zona ? 'zona ' + zona.replace(/-/g, ' ') : ''}`),
            pret: o.priceCurrency === 'EUR' ? Math.round(+o.price) : null,
            mpu: (ld.floorSize || {}).value || null,
            camere: ld.numberOfRooms || null,
            url: u,
          });
        } catch (e) { /* un anunt care nu raspunde nu opreste restul */ }
      }));
    }
  }
  console.log(`agentii: ${sarite} anunturi sarite, sunt deja pe Storia (cod cp in descriere)`);
  return out;
}

// Licitatii si vanzari din executare, de pe executari.com (judetul Sibiu = 39,
// categoria Case = 5, paginare &p=N). Localitatea e la finalul linkului, deci
// orasul se alege fara sa deschid pagina; pretul de pornire il citesc din
// anunt, unde site-ul il da si in euro ("Pret de pornire: 153.975 RON (≈ 29.329 €)").
async function licitatii() {
  const linkuri = new Set();
  for (let p = 1; p <= 30; p++) {
    const h = await html('https://www.executari.com/lista_bunuri.php?cat=5&judet=39' + (p > 1 ? '&p=' + p : ''));
    const L = (h.match(/href="((?:licitatie|vanzare)-\d+-[^"]+\.html)"/g) || []).map(x => x.slice(6, -1));
    const inainte = linkuri.size;
    L.forEach(x => linkuri.add(x));
    if (linkuri.size === inainte) break;
  }
  // "...-medias-judetul-sibiu.html" se termina tot in sibiu, dar e judetul.
  const inOras = [...linkuri].filter(s => (/-sibiu\.html$|loc-sibiu/.test(s))
    && !/(jud|judetul)-sibiu\.html$/.test(s) && !/(poiana|ocna|miercurea|viile|dealul)-sibiului/.test(s));
  const out = [];
  for (const s of inOras) {
    try {
      const u = 'https://www.executari.com/' + s;
      const t = curat((await html(u)).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, ''))
        .replace(/≈/g, '&#8776;');
      const titlu = (t.match(/Print\s+(.+?)\s+Pret/) || [])[1] || s.replace(/^\w+-\d+-|\.html$/g, '').replace(/-/g, ' ');
      const eur = nr(/Pret de pornire:[^(]*\((?:&#8776;|~)?\s*([\d.]+)\s*(?:&euro;|€)/i, t.replace(/\./g, ''))
        || nr(/Pret[^:]{0,20}:\s*([\d.]+)\s*(?:EUR|€|&euro;)/i, t.replace(/\./g, ''));
      out.push({ src: 'licitatie', titlu, descriere: t.slice(0, 1500), pret: eur, url: u });
    } catch (e) { /* un anunt care nu raspunde nu opreste restul */ }
  }
  return out;
}

function noteaza(sursa, ce, date) {
  const cale = path.join(__dirname, 'cautari.json');
  let j = {};
  try { j = JSON.parse(fs.readFileSync(cale, 'utf8')); } catch (e) { /* prima rulare */ }
  const t = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  j[sursa] = { ce, cand: t.toISOString().slice(0, 16).replace('T', ' '), ...date };
  fs.writeFileSync(cale, JSON.stringify(j, null, 1) + '\n');
}

(async () => {
  // "fisier <cale>": anunturi scoase din browser (OLX, imobiliare.ro), ca lista
  // de {src, titlu, descriere, pret, url, mpu?, camere?}. Trec prin aceleasi filtre.
  // Accepta si forma bruta scoasa de browser_evaluate ({u, t, p: "80 000 €", loc,
  // desc, params}), salvata ca text JSON sau ca obiect {n, out}.
  const dinFisier = async () => {
    let j = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    if (typeof j === 'string') j = JSON.parse(j);
    const lista = Array.isArray(j) ? j : j.out || [];
    const src = path.basename(process.argv[3], '.json').replace(/-raw$/, '');
    // Facebook scrie "RON" la preturi care sunt de fapt in euro (vanzatorii pun
    // suma in EUR, iar contul e setat pe lei), si localitatea de pe card e a
    // contului, nu a casei - de aceea "Sibiu, Romania" trece, iar orasul real il
    // verifica filtrele din descriere.
    return lista.filter(x => !x.loc || /^sibiu\b/i.test(x.loc.trim())).map(x => x.titlu ? x : ({
      src,
      titlu: curat(x.t),
      descriere: curat(`${x.desc || ''} ${x.params || ''}`),
      pret: (src === 'facebook' || /€|eur/i.test(x.p || '')) ? +String(x.p).replace(/[^\d]/g, '') || null : null,
      mpu: nr(/Suprafa[tț]a utila:\s*(\d+)/i, x.params || '') || x.mp || null,
      camere: nr(/Camere:\s*(\d)/i, x.params || '') || x.camere || null,
      url: x.u,
    }));
  };
  // Toate sursele fara browser merg zilnic: impreuna dureaza sub un minut.
  const surse = CE === 'fisier' ? [[path.basename(process.argv[3], '.json').replace(/-raw$/, ''), dinFisier]]
    : [['publi24', publi24], ['lajumate', lajumate], ['agentii', agentii], ['licitatii', licitatii], ['anaf', anaf]];
  const cale = path.join(RADACINA, 'date.json');
  const date = JSON.parse(fs.readFileSync(cale, 'utf8'));
  const zone = cartiere(date);
  const excluse = exclusePeStoria();
  const existente = new Set(date.anunturi.map(o => o.u));

  for (const [nume, fn] of surse) {
    let lista;
    try { lista = await fn(); } catch (e) { console.log(`${nume}: EROARE ${e.message}`); continue; }
    const motive = {};
    const bune = lista.filter(x => {
      const text = `${x.titlu} ${x.descriere}`;
      const m = !x.pret ? 'fara pret in EUR' : x.pret > PRAG ? 'peste plafon'
        : x.pret < PRET_MINIM ? 'pret nerealist (chirie sau pe mp)'
        : IN_AFARA.test(text) ? 'in afara orasului'
        : (EXCLUS.find(([, re]) => re.test(text)) || [])[0];
      if (m) { motive[m] = (motive[m] || 0) + 1; return false; }
      return true;
    });
    const noi = bune.filter(x => !existente.has(x.url)).map(x => inFormaListei(x, zone)).filter(o => {
      const teren = nr(/teren\s*(\d+)/, o.g || '');
      const chei = [teren && `${o.p}|t${teren}`, o.a && o.z !== 'Sibiu' && `${fara(o.z)}|${o.p}|a${o.a}`].filter(Boolean);
      const motiv = chei.map(k => excluse.get(k)).find(Boolean);
      if (motiv) { motive['exclusa pe Storia: ' + motiv] = (motive['exclusa pe Storia: ' + motiv] || 0) + 1; return false; }
      return true;
    });
    console.log(`${nume}: ${lista.length} case in oras, ${bune.length} trec filtrele, ${noi.length} noi`);
    Object.entries(motive).forEach(([m, n]) => console.log(`  ${n} scoase: ${m}`));
    noi.sort((a, b) => a.p - b.p).forEach(o => console.log(`  + ${String(o.p).padStart(7)} € · ${o.t.slice(0, 60)} · ${o.u}`));
    if (SCRIE) {
      date.anunturi.push(...noi);
      noi.forEach(o => existente.add(o.u));
      noteaza(nume, 'case in orasul Sibiu', { gasite: lista.length, noi: noi.length });
    }
  }
  if (SCRIE) fs.writeFileSync(cale, JSON.stringify(date, null, 1) + '\n');
  process.exit(0);
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
