// Citește din Google Flights prețurile pentru sarcina „Prețuri zboruri Asia 2027”.
// S-a născut din rulările de pe 22–25 noiembrie 2026, când aceeași secvență Playwright
// a fost rescrisă de mână în fiecare sesiune. Lecțiile sunt în tools/zboruri-asia-note.md.
//
// Folosire: node tools/zboruri-asia.js <fisier-iesire.json> [ORIG-DEST-data ...]
// Citește tools/zboruri-asia-config.json, caută câte o căutare odată (fără paralel, cu pauze),
// și scrie după fiecare căutare, ca o rulare întreruptă să poată fi reluată: cheile deja
// citite fără eroare sunt sărite.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'zboruri-asia-config.json'), 'utf8'));
const out = process.argv[2] || 'zboruri-asia-rezultat.json';
const only = process.argv.slice(3);
const C = cfg.conditii;
const ESCALA_SCURTA_MIN = 6 * 60; // REGULI.md: arată și cel mai ieftin zbor cu escală ≤ 6 h
const PARTIAL_SUB = 30;           // sub atâtea rezultate citite, lista e probabil parțială

// Orașe din Golf / Orientul Mijlociu, pe lângă codurile din config (Google scrie orașul, nu codul).
const ME = ['Doha', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Bahrain', 'Manama', 'Kuwait', 'Riyadh', 'Jeddah',
  'Muscat', 'Amman', 'Dammam', 'Medina', 'Salalah', 'Ras Al Khaimah', 'Al Ain', 'Cairo', 'Tel Aviv',
  'Beirut', 'Baghdad', 'Tehran', 'Erbil', 'Zayed', 'Hamad', 'King Khalid', 'King Abdulaziz', 'Queen Alia'];

function minute(s) {
  const h = /(\d+) hr/.exec(s), m = /(\d+) min/.exec(s);
  return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0);
}

function cautari() {
  const dus = [...new Set(cfg.trasee.map(t => t[0]))];
  const intors = [...new Set(cfg.trasee.map(t => t[1]))];
  const L = [];
  for (const d of dus) for (const z of cfg.date_dus) L.push([cfg.plecare_din, d, z]);
  for (const o of intors) for (const z of cfg.date_intors) L.push([o, cfg.plecare_din, z]);
  return L.filter(([f, t, z]) => !only.length || only.includes(`${f}-${t}-${z}`));
}

function zboruri(labels) {
  const ok = [];
  for (const a of labels) {
    const m = /([\d,]+) euros\. (\d+) stops? flight with (.+?)\. Leaves/.exec(a);
    if (!m || +m[2] !== C.escale_max) continue;
    const companii = m[3];
    if (C.exclus_companii.some(x => companii.includes(x))) continue;
    const lay = [...a.matchAll(/is a (.+?) layover at (.+?) in ([^.]+)\./g)];
    if (lay.length !== 1) continue;
    const [, escDur, aeroport, oras] = lay[0];
    const txt = (aeroport + ' ' + oras).toLowerCase();
    if (ME.some(x => txt.includes(x.toLowerCase()))) continue;
    if (C.exclus_escale.some(c => a.includes(`(${c})`))) continue;
    const d = /Total duration ([^.]+)\./.exec(a);
    ok.push({
      pret: +m[1].replace(/,/g, ''), companii, escala: oras.trim(), aeroport,
      durata: d ? d[1].trim() : null, escala_durata: escDur,
      durata_min: d ? minute(d[1]) : null, escala_min: minute(escDur),
    });
  }
  // cel mai ieftin; la preț egal, durata totală cea mai scurtă (nota din 24 noiembrie)
  ok.sort((x, y) => x.pret - y.pret || (x.durata_min ?? 1e9) - (y.durata_min ?? 1e9));
  return ok;
}

async function citeste(page, url) {
  let ultim = 'necunoscut';
  for (let incercare = 1; incercare <= 3; incercare++) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const rej = page.locator('button:has-text("Reject all")');
    if (await rej.count()) { await rej.first().click(); await page.waitForTimeout(3000); }
    // „Loading results”: așteaptă până dispare, cel mult ~25 s
    for (let i = 0; i < 25; i++) {
      await page.waitForTimeout(1000);
      const t = await page.evaluate(() => document.body.innerText);
      if (!t.includes('Loading results') && /€\s?\d/.test(t)) break;
    }
    if (page.url().includes('/sorry/')) return { fail: 'captcha Google (pagina „unusual traffic”)', incercari: incercare };
    const txt = await page.evaluate(() => document.body.innerText);
    if (txt.includes('Oops, something went wrong')) { ultim = 'Google Flights: „Oops, something went wrong”'; await page.waitForTimeout(8000); continue; }
    if (!/€\s?\d/.test(txt)) { ultim = 'niciun preț pe pagină'; await page.waitForTimeout(8000); continue; }
    const more = page.locator('button[aria-label*="more flights"]');
    if (await more.count()) { try { await more.first().click(); await page.waitForTimeout(5000); } catch {} }
    const labels = [...new Set(await page.evaluate(() => [...document.querySelectorAll('[aria-label]')]
      .map(e => e.getAttribute('aria-label')).filter(a => /euros\./.test(a) && /flight with/.test(a))))];
    if (!labels.length) { ultim = 'pagina s-a încărcat, dar rezultatele nu s-au putut citi'; await page.waitForTimeout(8000); continue; }
    if (labels.length < PARTIAL_SUB && incercare < 3) { ultim = `listă parțială (${labels.length})`; await page.waitForTimeout(10000); continue; }
    return { labels, incercari: incercare };
  }
  return { fail: ultim + ' (3 încercări)', incercari: 3 };
}

(async () => {
  const rez = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
  const L = cautari();
  const b = await chromium.launch();
  const t0 = Date.now();
  for (const [f, t, z] of L) {
    const key = `${f}-${t}-${z}`;
    if (rez[key] && !rez[key].fail) continue;
    const url = `https://www.google.com/travel/flights?q=One%20way%20flights%20to%20${t}%20from%20${f}%20on%20${z}&hl=en&curr=EUR&gl=RO`;
    const page = await b.newPage({ locale: 'en-US' });
    let r;
    try { r = await citeste(page, url); } catch (e) { r = { fail: 'eroare: ' + e.message.split('\n')[0], incercari: 1 }; }
    await page.close();
    const e = { url, incercari: r.incercari };
    if (r.fail) { e.fail = r.fail; if (r.fail.startsWith('captcha')) { rez[key] = e; fs.writeFileSync(out, JSON.stringify(rez, null, 1)); console.log(key, e.fail, '— opresc, fără ocolire'); break; } }
    else {
      const ok = zboruri(r.labels);
      e.rezultate_citite = r.labels.length;
      if (r.labels.length < PARTIAL_SUB) e.nota = `listă parțială: ${r.labels.length} rezultate citite`;
      if (!ok.length) e.fail = 'niciun zbor cu o escală, fără Qatar și fără escală în Orientul Mijlociu';
      else {
        Object.assign(e, ok[0]);
        if (ok[0].escala_min > ESCALA_SCURTA_MIN) {
          const s = ok.find(x => x.escala_min <= ESCALA_SCURTA_MIN);
          if (s) e.escala_scurta = s;
        }
      }
    }
    rez[key] = e;
    fs.writeFileSync(out, JSON.stringify(rez, null, 1));
    console.log(key, e.fail || `${e.pret} € ${e.companii} prin ${e.escala} (${e.rezultate_citite} rez., ${e.incercari} înc.)`);
    await new Promise(res => setTimeout(res, 4000 + Math.random() * 4000));
  }
  console.log('durata', Math.round((Date.now() - t0) / 60000), 'min');
  await b.close();
})();
