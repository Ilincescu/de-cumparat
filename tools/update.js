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
//   3. scan.js linkuri   - marcheaza anunturile sterse de pe site
//   4. publica.js        - scoate mortii, adauga noii in date.json
//   5. azi.js            - ce a aparut de ieri, trei case si trei masini
//   6. git commit + push - publica pe GitHub Pages
//
// Bicicletele raman pe Playwright: OLX da 403 la cereri directe.

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const RADACINA = path.join(__dirname, '..');
const AZI = new Date().toISOString().slice(0, 10);

// Ce n-a mers azi ramane scris in tools/ultima-rulare.json; update-zilnic.ps1
// reia rularea mai tarziu in aceeasi zi pana nu mai lipseste nimic (Mihai,
// 2026-10-27: "sa nu uiti sa mai citesti daca nu ai apucat cand trebuia").
const ESUATE = [];
function ruleaza(comanda, argumente, optional = false) {
  console.log(`\n=== ${comanda} ${argumente.join(' ')} ===`);
  try {
    const iesire = execFileSync(comanda, argumente, { cwd: RADACINA, encoding: 'utf8', stdio: 'pipe' });
    process.stdout.write(iesire);
    // Storia da 403 fara sa iasa cu eroare: scanarea scrie doar ca s-a oprit
    if (/\b403\b/.test(iesire) && /storia/i.test(argumente.join(' '))) ESUATE.push(argumente.join(' ') + ' (403)');
    return iesire;
  } catch (e) {
    process.stdout.write(e.stdout || '');
    process.stderr.write(e.stderr || '');
    ESUATE.push(argumente.join(' '));
    if (!optional) { scrieStare(); throw new Error(`${comanda} ${argumente.join(' ')} a esuat`); }
    console.log('(pas optional, continui)');
    return '';
  }
}

// Sursele din browser (prompt-zilnic.txt a-f) conteaza doar daca fisierul e de azi
const DIN_BROWSER = ['olx-raw.json', 'imobiliare-raw.json', 'facebook-raw.json', 'olx-chirii.json', 'imobiliare-chirii.json', 'facebook-chirii.json'];
function scrieStare() {
  const dir = path.join(RADACINA, 'tools', 'externe');
  const lipsa = DIN_BROWSER.filter(f => {
    const c = path.join(dir, f);
    return !fs.existsSync(c) || fs.statSync(c).mtime.toISOString().slice(0, 10) !== AZI;
  });
  const t = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString();
  fs.writeFileSync(path.join(RADACINA, 'tools', 'ultima-rulare.json'), JSON.stringify({
    data: t.slice(0, 10), ora: t.slice(11, 16), esuate: ESUATE, lipsa_browser: lipsa,
  }, null, 1) + '\n');
  if (ESUATE.length || lipsa.length) console.log(`\nDE RELUAT: ${[...ESUATE, ...lipsa].join(', ')}`);
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

  // Optional: cand Storia da 403 (dupa multe cereri), restul surselor tot se publica.
  ruleaza('node', ['tools/scan.js', 'storia'], true);
  ruleaza('node', ['tools/scan.js', 'masini'], true);
  ruleaza('node', ['tools/masini-avariate.js', '--scrie'], true);
  // Case din alte surse: publi24, lajumate/homezz, agentiile si licitatiile, fara
  // browser, plus ce a scos browserul azi din OLX, imobiliare.ro si Facebook in
  // tools/externe/*-raw.json (vezi prompt-zilnic.txt).
  ruleaza('node', ['tools/surse-case.js', 'zilnic', '--scrie'], true);
  const externe = path.join(RADACINA, 'tools', 'externe');
  if (fs.existsSync(externe)) fs.readdirSync(externe)
    .filter(f => f.endsWith('-raw.json') && fs.statSync(path.join(externe, f)).mtime.toISOString().slice(0, 10) === AZI)
    .forEach(f => ruleaza('node', ['tools/surse-case.js', 'fisier', path.join('tools', 'externe', f), '--scrie'], true));
  // Chiriile Storia una cate una: azi.js estimeaza chiria din ele (~12 cereri de cautare)
  ruleaza('node', ['tools/chirii.js'], true);
  // Si chiriile de pe Publi24, lajumate, plus OLX/imobiliare/Facebook scoase azi cu browserul
  ruleaza('node', ['tools/chirii-externe.js'], true);
  // Cat de repede dispar chiriile, pe marimi: masura cererii (tools/urmarire-chirii.js)
  ruleaza('node', ['tools/urmarire-chirii.js'], true);
  // Inainte de clasament, nu dupa: altfel ajunge in el un anunt deja sters.
  ruleaza('node', ['tools/scan.js', 'linkuri', '--scrie'], true);
  ruleaza('node', ['tools/publica.js', '--scrie']);
  ruleaza('node', ['tools/curata.js', '--scrie']);
  ruleaza('node', ['tools/marcheaza-dubluri.js', '--scrie']);
  ruleaza('node', ['tools/oferte-tari.js', '--scrie']);
  ruleaza('node', ['tools/istoric.js'], true);
  ruleaza('node', ['tools/azi.js', '--scrie'], true);
  // Dupa azi.js: pozele se pastreaza pentru topul de azi (istoric.html)
  ruleaza('node', ['tools/arhiva.js'], true);

  const dupa = numara();
  scrieStare();
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

  ruleaza('git', ['add', 'date.json', 'masini.json', 'biciclete.json', 'istoric-preturi.json', 'azi.json', 'tools/snapshots', 'tools/cautari.json', 'tools/chirii-urmarite.json', 'arhiva.json', 'arhiva']);
  ruleaza('git', ['commit', '-q', '-m', mesaj]);
  // Credential Manager n-are contul personal si asteapta un login pe care
  // nimeni nu-l vede; push-ul statea pana la timeout. Tokenul il are gh.
  process.env.GIT_TERMINAL_PROMPT = '0';
  process.env.GCM_INTERACTIVE = 'never';
  ruleaza('git', ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential',
    'push', '-q', 'origin', 'HEAD:main']);

  console.log('\n=== gata ===');
  console.log(`case ${inainte.case_} -> ${dupa.case_}, apartamente ${inainte.ap} -> ${dupa.ap}, `
    + `masini ${dupa.masini}, biciclete ${dupa.biciclete}`);
  console.log('https://ilincescu.github.io/de-cumparat/');
  console.log('GitHub Pages are nevoie de aproximativ un minut ca sa reconstruiasca pagina.');
})().catch(e => { console.error('\nEROARE:', e.message); process.exit(1); });
