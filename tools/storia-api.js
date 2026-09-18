// Ia anunturile de pe Storia prin endpointul de date al site-ului, fara browser.
//
//   node tools/storia-api.js casa 250000
//   node tools/storia-api.js apartament 90000
//
// Storia randeaza rezultatele pe server, iar acelasi JSON e servit la
// /_next/data/<buildId>/... . CloudFront blocheaza HTML-ul pentru curl, dar nu
// si acest endpoint. buildId se schimba la fiecare deploy Storia: e tinut in
// tools/storia-build.json, iar cand raspunsul vine 404 trebuie reimprospatat
// deschizand o data cu Playwright o pagina de cautare si citind
// JSON.parse(document.getElementById('__NEXT_DATA__').textContent).buildId

const fs = require('fs');
const path = require('path');

const CAMERE = {ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6};
const buildFile = path.join(__dirname, 'storia-build.json');

async function pagina(buildId, tip, pretMax, nr) {
  // judet + oras: cu un singur 'sibiu' cauta in tot judetul
  const cale = `vanzare/${tip}/sibiu/sibiu`;
  const u = `https://www.storia.ro/_next/data/${buildId}/ro/rezultate/${cale}.json`
    + `?priceMax=${pretMax}&by=LATEST&direction=DESC&page=${nr}`
    + `&searchingCriteria=vanzare&searchingCriteria=${tip}&searchingCriteria=sibiu&searchingCriteria=sibiu`;
  const r = await fetch(u, {headers: {'User-Agent': 'Mozilla/5.0'}});
  if (r.status === 404) throw new Error('buildId expirat - reimprospateaza-l din browser');
  if (!r.ok) throw new Error('status ' + r.status);
  const j = await r.json();
  return (j.pageProps && j.pageProps.data && j.pageProps.data.searchAds &&
          j.pageProps.data.searchAds.items) || [];
}

function normalizeaza(x, tip) {
  const loc = (x.location && x.location.address) || {};
  return {
    k: tip === 'casa' ? 'casa' : 'ap',
    p: x.totalPrice ? x.totalPrice.value : null,
    t: x.title,
    // cautarea acopera tot judetul: z poate fi si o comuna (Seica Mare, Ocna Sibiului)
    z: (loc.city && loc.city.name) || 'Sibiu',
    r: CAMERE[x.roomsNumber] || null,
    a: x.areaInSquareMeters || null,
    // terrainAreaInSquareMeters vine egal cu suprafata utila cand terenul nu e
    // declarat, deci nu e de incredere: mp de curte se iau din descriere
    gm: null,
    c: null,
    src: 'storia',
    u: 'https://www.storia.ro/ro/oferta/' + x.slug,
    agentie: x.agency ? x.agency.name : null,
    proprietar: !!x.isPrivateOwner,
    d: (x.dateCreated || '').slice(0, 10),
  };
}

(async () => {
  const tip = process.argv[2] || 'casa';
  const pretMax = +(process.argv[3] || 250000);
  const pagini = +(process.argv[4] || 2);
  const buildId = JSON.parse(fs.readFileSync(buildFile, 'utf8')).buildId;

  let toate = [];
  for (let i = 1; i <= pagini; i++) toate = toate.concat(await pagina(buildId, tip, pretMax, i));

  const existente = new Set(
    JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'date.json'), 'utf8')).anunturi.map(a => a.u));
  const noi = toate.map(x => normalizeaza(x, tip)).filter(a => a.p && !existente.has(a.u));

  console.error(`${toate.length} anunturi citite, ${noi.length} nu sunt in lista`);
  console.log(JSON.stringify(noi, null, 1));
})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
