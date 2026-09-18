// Parseaza un snapshot Playwright (.yml) de pe Storia sau OLX si scoate cate o linie per anunt.
// Folosire: node tools/parse-snapshot.js <fisier.yml>
const fs = require('fs');
const lines = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/);

const cards = [];
let cur = null;
for (const raw of lines) {
  const l = raw.trim();
  const m = l.match(/^- \/url: (\/ro\/oferta\/[^\s]+|https?:\/\/www\.olx\.ro\/d\/oferta\/[^\s]+)/);
  if (m) {
    const url = m[1];
    if (!cur || cur.url !== url) { cur = { url, texts: [] }; cards.push(cur); }
    continue;
  }
  if (!cur) continue;
  const t = l.match(/^- (?:paragraph|generic|heading|definition|term)[^:]*:\s*(.+)$/);
  if (t) {
    const v = t[1].trim();
    if (v && !v.startsWith('/url') && cur.texts.length < 40) cur.texts.push(v);
  }
}

for (const c of cards) {
  const txt = c.texts.join(' | ');
  const price = (txt.match(/([\d][\d  .]*)\s*€(?!\/)/) || [])[1];
  const eurmp = (txt.match(/([\d][\d  .,]*)\s*€\/m/) || [])[1];
  const rooms = (txt.match(/(\d+)\s*camer/) || [])[1];
  const mp = (txt.match(/([\d.,]+)\s*m²/) || [])[1];
  console.log([c.url, price ? price.replace(/[  .]/g, '') : '?', rooms || '?', mp || '?', txt.slice(0, 260)].join(' ;; '));
}
