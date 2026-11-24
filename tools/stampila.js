// Pune pe o pagina ora si data ultimei actualizari, ora Romaniei.
//
//   node tools/stampila.js weekend-nasi.html
//
// Inlocuieste ce e intre <!--stampila--> si <!--/stampila--> din pagina. Se
// ruleaza dupa FIECARE modificare a paginii, inainte de commit. Mihai,
// 2026-11-24: "vreau sa pui sus ora si data cand ai updatat ultima oara" - ca sa
// vada daca pagina pe care o are deschisa e versiunea noua (browserul tine
// pagina in cache, si "nu e updatata" a fost de doua ori doar o versiune veche).
// Stampila e in HTML-ul publicat, deci arata exact versiunea pe care o vezi.

const fs = require('fs');

const cale = process.argv[2];
if (!cale) { console.error('folosire: node tools/stampila.js <pagina.html>'); process.exit(1); }

const parti = {};
new Intl.DateTimeFormat('ro-RO', {
  timeZone: 'Europe/Bucharest', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
}).formatToParts(new Date()).forEach(p => { parti[p.type] = p.value; });

const text = `Actualizat ${parti.weekday} ${parti.day} ${parti.month} ${parti.year}, ${parti.hour}:${parti.minute} (ora României)`;
const html = fs.readFileSync(cale, 'utf8');
const marcaj = /<!--stampila-->[\s\S]*?<!--\/stampila-->/;
if (!marcaj.test(html)) { console.error(`${cale} n-are <!--stampila--> ... <!--/stampila-->`); process.exit(1); }
fs.writeFileSync(cale, html.replace(marcaj, `<!--stampila-->${text}<!--/stampila-->`));
console.log(text);
