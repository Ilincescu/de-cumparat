// Arhiva anunturilor de case si apartamente: ce a fost pe piata, cat a cerut,
// cand a aparut si cand a disparut, plus descrierea si pozele celor care conteaza.
//
//   node tools/arhiva.js            reface arhiva.json si descarca pozele lipsa
//   node tools/arhiva.js <ID>       arata un anunt din arhiva
//
// Mihai, 2026-10-26: "daca vor dura cautarile mele si dispar de pe site-uri,
// sa ma bazez pe istoricul meu". Anuntul sters de pe Storia ia cu el descrierea
// si pozele; snapshoturile zilnice au descrierea, dar nu pozele.
//
// Ce intra:
//   - toate casele si apartamentele de 2 camere din snapshoturile Storia
//     (tools/snapshots/storia-*.json): prima si ultima zi vazut, fisa, descrierea
//   - restul surselor din date.json (publi24, OLX, imobiliare, Facebook, agentii):
//     din ziua in care le vede arhiva
//   - preturile din istoric-preturi.json (tools/istoric.js)
//   - pozele (arhiva/poze/<ID>/) doar pentru favorite, topul din azi.json, cele
//     respinse si cele deja verificate cu verifica.js. Toate pozele tuturor
//     anunturilor ar fi ~500 MB in git, peste ce tine GitHub Pages.
//
// "Disparut" la Storia = lipseste din snapshoturile de dupa ultima zi in care a
// fost vazut, iar ultimul snapshot e complet (cel putin 80% din anunturile de
// obicei). Un snapshot taiat de 403 nu face ca totul sa para disparut.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const DOSAR = path.join(__dirname, 'snapshots');
const CALE = path.join(RADACINA, 'arhiva.json');
const POZE = path.join(RADACINA, 'arhiva', 'poze');
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
const AZI = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
// 8, nu toate: ~65 KB pe poza, iar pozele raman in git pentru totdeauna
const MAX_POZE = 8;

const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || String(u);
const citeste = (f, implicit) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return implicit; } };
const decodeaza = s => String(s || '').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
  .replace(/&([a-z])(acute|circ|breve|cedil|grave|uml);/gi, '$1').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');

function dinStoria(arhiva) {
  const fisiere = fs.readdirSync(DOSAR).filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort();
  const zile = [], marimi = [];
  for (const f of fisiere) {
    const data = f.slice(7, 17);
    const lista = citeste(path.join(DOSAR, f), []).filter(x => x.tip === 'casa' || (x.tip === 'apartament' && x.camere === 'TWO'));
    zile.push(data); marimi.push(lista.length);
    for (const x of lista) {
      const id = idAnunt(x.url);
      const e = arhiva[id] || (arhiva[id] = { id, sursa: 'storia' });
      e.prima = e.prima && e.prima < data ? e.prima : data;
      if (!e.ultima || data >= e.ultima) {
        e.ultima = data;
        Object.assign(e, {
          tip: x.tip === 'casa' ? 'casa' : 'ap', u: x.url, t: decodeaza(x.titlu), zona: (x.zona || '').replace(', Sibiu', ''),
          mp: x.mpu || null, teren: x.teren || null, etaj: x.etaj || null, an: x.an || null, stare: x.stare || null,
          agentie: x.agentie || null, privat: x.privat || null, postat: x.creat || null,
          descriere: decodeaza(x.descriere).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2500),
        });
      }
    }
  }
  // Snapshot complet = cel putin 80% din mediana ultimelor 5
  const ultimele = marimi.slice(-6, -1).sort((a, b) => a - b);
  const normal = ultimele.length ? ultimele[Math.floor(ultimele.length / 2)] : 0;
  const complet = zile.filter((z, i) => marimi[i] >= 0.8 * normal || i < zile.length - 5);
  const ultimaZi = zile[zile.length - 1];
  const ultimulComplet = marimi[marimi.length - 1] >= 0.8 * normal;
  for (const e of Object.values(arhiva)) {
    if (e.sursa !== 'storia') continue;
    const dupa = complet.find(z => z > e.ultima);
    e.disparut = dupa && (ultimulComplet || e.ultima < ultimaZi) ? dupa : null;
  }
  return { zile: zile.length, ultimaZi, ultimulComplet };
}

// Celelalte surse sunt doar in date.json: le vad din ziua in care ruleaza arhiva
function dinDate(arhiva) {
  const d = citeste(path.join(RADACINA, 'date.json'), { anunturi: [] });
  const acum = new Set();
  for (const o of d.anunturi) {
    if (o.src === 'storia') continue;
    const id = o.src + ':' + idAnunt(o.u);
    acum.add(id);
    const e = arhiva[id] || (arhiva[id] = { id, sursa: o.src, prima: AZI });
    Object.assign(e, { tip: o.k === 'casa' ? 'casa' : 'ap', u: o.u, t: decodeaza(o.t), zona: (o.z || '').replace(', Sibiu', ''),
      mp: o.a || null, teren: o.g || null, ultima: AZI, disparut: null });
    if (o.warn) e.nota = o.warn;
  }
  for (const e of Object.values(arhiva)) if (e.sursa !== 'storia' && !acum.has(e.id) && !e.disparut) e.disparut = AZI;
}

function preturi(arhiva) {
  const ist = citeste(path.join(RADACINA, 'istoric-preturi.json'), { anunturi: {} }).anunturi;
  for (const e of Object.values(arhiva)) {
    const p = ist[e.sursa === 'storia' ? e.id : idAnunt(e.u)];
    if (p && p.preturi.length) {
      e.preturi = p.preturi;
      // Pretul vazut mai devreme in git (date.json) muta si "prima" inapoi
      if (p.preturi[0].d < e.prima) e.prima = p.preturi[0].d;
    }
  }
}

// Ce merita poze: favorite, topul de azi (cu dublurile lui), respinse, verificate
function deArhivatPoze(arhiva) {
  const ids = new Set();
  const fav = citeste(path.join(RADACINA, 'favorite.json'), { anunturi: {} }).anunturi;
  Object.keys(fav).forEach(u => ids.add(idAnunt(u)));
  const azi = citeste(path.join(RADACINA, 'azi.json'), {});
  for (const x of [].concat(azi.case || [], azi.apartamente || [])) {
    ids.add(idAnunt(x.url));
    (x.alte || []).forEach(a => ids.add(idAnunt(a.url)));
  }
  const r = citeste(path.join(__dirname, 'respinse.json'), { case: [], apartamente: [] });
  [].concat(r.case || [], r.apartamente || []).forEach(x => ids.add(x.id));
  const ver = path.join(RADACINA, 'poze', 'verificari');
  if (fs.existsSync(ver)) fs.readdirSync(ver).forEach(d => ids.add(d));
  return [...ids].filter(id => arhiva[id]);
}

async function fisaStoria(slug) {
  const b = citeste(path.join(__dirname, 'storia-build.json'), {}).buildId;
  const r = await fetch(`https://www.storia.ro/_next/data/${b}/ro/oferta/${slug}.json`, { headers: UA });
  if (!r.ok) return null;
  return ((await r.json()).pageProps || {}).ad || null;
}

async function poze(arhiva) {
  const ids = deArhivatPoze(arhiva);
  let noi = 0, esuate = 0;
  for (const id of ids) {
    const dest = path.join(POZE, id);
    const are = fs.existsSync(dest) ? fs.readdirSync(dest).filter(f => f.endsWith('.jpg')) : [];
    if (are.length) { arhiva[id].poze = are.length; continue; }
    fs.mkdirSync(dest, { recursive: true });
    // Intai ce a descarcat deja verifica.js: merge si dupa ce anuntul a fost sters
    const ver = path.join(RADACINA, 'poze', 'verificari', id);
    if (fs.existsSync(ver)) {
      fs.readdirSync(ver).filter(f => f.endsWith('.jpg')).sort().slice(0, MAX_POZE).forEach(f => fs.copyFileSync(path.join(ver, f), path.join(dest, f)));
    } else if (arhiva[id].sursa === 'storia' && !arhiva[id].disparut) {
      const ad = await fisaStoria(String(arhiva[id].u).split('/oferta/')[1]).catch(() => null);
      const img = ad ? (ad.images || []).map(i => i.medium || i.large).filter(Boolean).slice(0, MAX_POZE) : [];
      for (let k = 0; k < img.length; k++) {
        const r = await fetch(img[k], { headers: UA }).catch(() => null);
        if (r && r.ok) fs.writeFileSync(path.join(dest, String(k + 1).padStart(2, '0') + '.jpg'), Buffer.from(await r.arrayBuffer()));
        await new Promise(z => setTimeout(z, 150));
      }
      await new Promise(z => setTimeout(z, 400));
    }
    const n = fs.readdirSync(dest).filter(f => f.endsWith('.jpg')).length;
    if (n) { arhiva[id].poze = n; noi++; } else { fs.rmdirSync(dest); esuate++; }
  }
  return { cu: ids.length, noi, esuate };
}

function arata(id) {
  const a = citeste(CALE, { anunturi: {} }).anunturi;
  const k = Object.keys(a).find(x => x.toLowerCase().includes(String(id).toLowerCase()));
  if (!k) return console.log('nu e in arhiva');
  const e = a[k];
  console.log(`${e.t}\n${e.u}\n${e.zona} · ${e.mp || '?'} mp · vazut ${e.prima} .. ${e.ultima}${e.disparut ? ` · disparut ${e.disparut}` : ' · activ'}`);
  (e.preturi || []).forEach(p => console.log(`  ${p.d}  ${p.p} EUR`));
  if (e.poze) console.log(`  ${e.poze} poze in arhiva/poze/${e.id}/`);
}

(async () => {
  if (process.argv[2]) return arata(process.argv[2]);
  const vechi = citeste(CALE, { anunturi: {} }).anunturi;
  // Storia se reface din snapshoturi; celelalte surse se pastreaza din arhiva veche
  const arhiva = {};
  for (const [k, e] of Object.entries(vechi)) if (e.sursa !== 'storia') arhiva[k] = e;
  const s = dinStoria(arhiva);
  dinDate(arhiva);
  preturi(arhiva);
  const p = await poze(arhiva);
  for (const e of Object.values(arhiva)) if (vechi[e.id] && vechi[e.id].poze && !e.poze) e.poze = vechi[e.id].poze;
  fs.writeFileSync(CALE, JSON.stringify({
    actualizat: AZI,
    note: 'Arhiva caselor si apartamentelor (2 camere) vazute pe piata, si dupa ce dispar de pe site-uri. Scrisa de tools/arhiva.js. Pozele sunt in arhiva/poze/<id>/ doar pentru favorite, top, respinse si verificate.',
    anunturi: arhiva,
  }));
  const v = Object.values(arhiva);
  console.log(`arhiva.json: ${v.length} anunturi (${v.filter(e => e.tip === 'casa').length} case, ${v.filter(e => e.tip === 'ap').length} apartamente), `
    + `${v.filter(e => e.disparut).length} disparute; ${s.zile} snapshoturi Storia, ultimul ${s.ultimaZi}${s.ultimulComplet ? '' : ' (INCOMPLET - nu marchez disparute din el)'}`);
  console.log(`poze: ${p.cu} anunturi de pastrat, ${p.noi} arhivate acum, ${p.esuate} fara poze (sterse inainte sa le iau)`);
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
