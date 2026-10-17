// Marcheaza in masini.json masinile avariate (av = true), ca pagina sa nu le
// mai arate. Nu le sterg: raman in fisier, ca sa nu dispara de la favorite si
// sa nu fie adaugate din nou la urmatoarea scanare.
//
//   node tools/masini-avariate.js            proba
//   node tools/masini-avariate.js --scrie    scrie in masini.json
//
// Autovit are campul "Avariata" pe anunt, dar filtrul lor de cautare
// "neavariate" scoate si masinile la care vanzatorul nu l-a completat (164 din
// 700 pe 2026-10-17). Asa ca deschid fiecare anunt o singura data si citesc
// campul si descrierea: Renault Arkana ID7HO0Ko avea "Avariata: Da" si
// "Avariata" in descriere, si era in lista.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const SCRIE = process.argv.includes('--scrie');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'text/html' };
const AVARIE = /avariat|accidentat|\blovit[aă]?\b|dauna totala|pentru piese|nu porne[sș]te|motor (defect|stricat)|airbag(uri)? (declan[sș]at|deschis)/i;

async function verifica(u) {
  const r = await fetch(u, { headers: UA, signal: AbortSignal.timeout(20000) });
  if (!r.ok) return null;
  const h = await r.text();
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  const s = m[1];
  const camp = /"key":"damaged","label":"[^"]*","value":"Da"/.test(s);
  const desc = ((s.match(/"description":"((?:[^"\\]|\\.)*)"/g) || []).join(' ')).replace(/<[^>]+>/g, ' ');
  // "nu a fost lovita", "fara accidente", "neavariata" spun opusul.
  const fara = desc.replace(/\b(nu|f[aă]r[aă]|niciodat[aă])\s+(a\s+fost\s+|este\s+|e\s+|are\s+)?(lovit\w*|avariat\w*|accident\w*|daun\w*)/gi, ' ')
    .replace(/\bneavariat\w*/gi, ' ');
  const text = (fara.match(AVARIE) || [])[0];
  return camp ? 'campul Avariata: Da' : text ? `descrierea: "${text}"` : false;
}

(async () => {
  const cale = path.join(RADACINA, 'masini.json');
  const j = JSON.parse(fs.readFileSync(cale, 'utf8'));
  // Doar anunturile vii, de pe Autovit, necitite inca (avc = data verificarii).
  const deCitit = j.masini.filter(o => !o.mort && o.src === 'autovit' && !o.avc);
  let marcate = 0;
  for (let i = 0; i < deCitit.length; i += 6) {
    await Promise.all(deCitit.slice(i, i + 6).map(async o => {
      try {
        const v = await verifica(o.u);
        if (v === null) return;
        o.avc = new Date().toISOString().slice(0, 10);
        if (v) { o.av = true; o.av_motiv = v; marcate++; console.log(`  avariata (${v}): ${o.p} € ${o.m} ${o.u}`); }
      } catch (e) { /* reincerc la urmatoarea rulare */ }
    }));
  }
  console.log(`masini: ${deCitit.length} citite, ${marcate} avariate marcate, ${j.masini.filter(o => o.av).length} in total`);
  if (SCRIE) fs.writeFileSync(cale, JSON.stringify(j, null, 1) + '\n');
  process.exit(0);
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
