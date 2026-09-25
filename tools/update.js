// Un singur "update": cauta, publica in date.json si urca pe site.
//
//   node tools/update.js
//
// Pana acum pasii erau separati si se opreau la jumatate: scanarea scria un
// snapshot, publicarea trebuia ceruta separat, iar commit-ul si push-ul erau
// de mana. De aici venea intrebarea "de ce nu apare pe site" - gasisem
// anuntul, dar nu ajunsese nicaieri.
//
// Pasii, in ordine:
//   1. scan.js storia    - case si apartamente din oras, cu fisa tehnica
//   2. scan.js masini    - Autovit, fara browser
//   3. publica.js        - scoate mortii, adauga noii in date.json
//   4. git commit + push - publica pe GitHub Pages
//
// Bicicletele raman pe Playwright: OLX da 403 la cereri directe.

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const RADACINA = path.join(__dirname, '..');
const AZI = new Date().toISOString().slice(0, 10);

function ruleaza(comanda, argumente, optional = false) {
  console.log(`\n=== ${comanda} ${argumente.join(' ')} ===`);
  try {
    const iesire = execFileSync(comanda, argumente, { cwd: RADACINA, encoding: 'utf8', stdio: 'pipe' });
    process.stdout.write(iesire);
    return iesire;
  } catch (e) {
    process.stdout.write(e.stdout || '');
    process.stderr.write(e.stderr || '');
    if (!optional) throw new Error(`${comanda} ${argumente.join(' ')} a esuat`);
    console.log('(pas optional, continui)');
    return '';
  }
}

function numara() {
  const d = JSON.parse(fs.readFileSync(path.join(RADACINA, 'date.json'), 'utf8'));
  const m = JSON.parse(fs.readFileSync(path.join(RADACINA, 'masini.json'), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.join(RADACINA, 'biciclete.json'), 'utf8'));
  return {
    case_: d.anunturi.filter(o => o.k === 'casa').length,
    ap: d.anunturi.filter(o => o.k === 'ap').length,
    masini: m.masini.length,
    biciclete: b.biciclete.length,
  };
}

(async () => {
  const inainte = numara();

  ruleaza('node', ['tools/scan.js', 'storia']);
  ruleaza('node', ['tools/scan.js', 'masini'], true);
  ruleaza('node', ['tools/publica.js', '--scrie']);

  const dupa = numara();
  const schimbari = ruleaza('git', ['status', '--porcelain']);
  if (!schimbari.trim()) {
    console.log('\nnimic de publicat, site-ul e deja la zi');
    return;
  }

  const mesaj = `Update ${AZI}: ${dupa.case_} case, ${dupa.ap} apartamente, `
    + `${dupa.masini} masini, ${dupa.biciclete} biciclete\n\n`
    + `Fata de rularea anterioara: case ${inainte.case_} -> ${dupa.case_}, `
    + `apartamente ${inainte.ap} -> ${dupa.ap}.\n\n`
    + 'Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>';

  ruleaza('git', ['add', 'date.json', 'masini.json', 'biciclete.json', 'tools/snapshots']);
  ruleaza('git', ['commit', '-q', '-m', mesaj]);
  ruleaza('git', ['push', '-q', 'origin', 'HEAD:main']);

  console.log('\n=== gata ===');
  console.log(`case ${inainte.case_} -> ${dupa.case_}, apartamente ${inainte.ap} -> ${dupa.ap}, `
    + `masini ${dupa.masini}, biciclete ${dupa.biciclete}`);
  console.log('https://ilincescu.github.io/de-cumparat/');
  console.log('GitHub Pages are nevoie de aproximativ un minut ca sa reconstruiasca pagina.');
})().catch(e => { console.error('\nEROARE:', e.message); process.exit(1); });
