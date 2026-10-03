// Doua serii de preturi pentru Sibiu, luate live de la sursa.
//
//   node tools/indici.js
//
// 1. Indicele imobiliare.ro, lunar, din iulie 2012. Seria completa sta in
//    HTML-ul paginii, ca array Chart.js - pagina afiseaza doar luna curenta.
//    Apartamente, EUR/mp util. PRET CERUT.
// 2. VDI.ro, trimestrial, din 2021-Q4. Singura serie publica separata pe CASE
//    si pe TERENURI. Tot PRET CERUT, licenta CC BY 4.0.
//
// Nicio sursa publica din Romania nu da preturi de TRANZACTIE pentru Sibiu.
// Cea mai apropiata e grila notariala de pe unnpr.ro, dar aia e un prag minim
// de taxare actualizat in trepte, nu un indice de piata.

const fs = require('fs');
const path = require('path');

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'accept-encoding': 'gzip, deflate' };
const IESIRE = path.join(__dirname, '..', 'indici-sibiu.json');

async function imobiliare() {
  const r = await fetch('https://www.imobiliare.ro/indicele-imobiliare-ro/Sibiu', { headers: UA });
  const h = await r.text();
  const L = h.match(/labels:\s*\[([^\]]+)\]/);
  const D = h.match(/data:\s*\[([0-9,\s.]+)\]/);
  if (!L || !D) { console.log('imobiliare.ro: nu am gasit seria (marime ' + h.length + ')'); return []; }
  const lab = L[1].split(',').map(s => s.replace(/['"\s]/g, ''));
  const dat = D[1].split(',').map(s => Number(s.trim()));
  return lab.map((l, i) => ({ luna: l, eurPeMp: dat[i] })).filter(x => x.eurPeMp);
}

async function vdi() {
  const r = await fetch('https://vdi.ro/api/stats/sibiu', { headers: UA });
  if (!r.ok) { console.log('vdi.ro: HTTP ' + r.status); return null; }
  return r.json();
}

(async () => {
  const imo = await imobiliare();
  console.log(`indicele imobiliare.ro: ${imo.length} puncte lunare`
    + (imo.length ? `, ${imo[0].luna} -> ${imo[imo.length - 1].luna}` : ''));
  const an2026 = imo.filter(x => /\/2026$/.test(x.luna));
  const dec2025 = imo.find(x => x.luna === '12/2025');
  if (dec2025) console.log(`\n  12/2025  ${dec2025.eurPeMp} EUR/mp   <- reper de inceput de an`);
  an2026.forEach(x => console.log(`  ${x.luna.padStart(7)}  ${x.eurPeMp} EUR/mp`));
  if (dec2025 && an2026.length) {
    const u = an2026[an2026.length - 1];
    console.log(`\n  de la 12/2025 la ${u.luna}: ${dec2025.eurPeMp} -> ${u.eurPeMp} EUR/mp `
      + `(${(((u.eurPeMp / dec2025.eurPeMp) - 1) * 100).toFixed(1)}%)`);
  }

  // VDI tine seriile in time_series, ca obiect indexat numeric, fiecare cu
  // campul `metric`. Pastrez doar cele care spun ceva despre o casa cu teren.
  const DE_PASTRAT = ['Case — vânzare', 'Case — EUR/mp', 'Terenuri — EUR/mp',
    'Chirie case', 'Apartamente 2 camere — EUR/mp'];
  const v = await vdi();
  const serii = {};
  if (v && v.time_series) {
    Object.values(v.time_series).forEach(m => {
      if (DE_PASTRAT.includes(m.metric)) serii[m.metric] = { unitate: m.unit, puncte: m.data };
    });
    console.log(`\nvdi.ro: ${Object.keys(v.time_series).length} metrici, pastrez ${Object.keys(serii).length}`);
    for (const [nume, s] of Object.entries(serii)) {
      const p = s.puncte, a = p[0], b = p[p.length - 1];
      const d = ((b.value / a.value - 1) * 100).toFixed(1);
      console.log(`  ${nume.padEnd(32)} ${a.month} ${Math.round(a.value)}  ->  ${b.month} ${Math.round(b.value)}  (${d > 0 ? '+' : ''}${d}%)`);
    }
  }

  fs.writeFileSync(IESIRE, JSON.stringify({
    actualizat: new Date().toISOString().slice(0, 10),
    avertisment: 'Ambele sunt preturi CERUTE, nu de tranzactie. Pentru Sibiu nu exista nicio sursa publica de preturi de tranzactie. '
      + 'VDI a trecut in august 2026 de la pret mediu la pret median - nu compara direct peste acel punct.',
    imobiliare_ro: { tip: 'asking', ce: 'apartamente, EUR/mp util, lunar din 7/2012', serie: imo },
    vdi_ro: { tip: 'asking', ce: 'trimestrial din 2021-Q4', serii },
  }, null, 1));
  console.log('\nscris in indici-sibiu.json');
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
