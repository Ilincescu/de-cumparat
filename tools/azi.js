// Ce a mai aparut de ieri. Trei case, trei apartamente, trei masini, atat.
//
//   node tools/azi.js              fata de rularea anterioara
//   node tools/azi.js --zile 7     ce a aparut in ultimele 7 zile
//   node tools/azi.js --scrie      scrie si azi.json, pentru pagina
//   node tools/azi.js --tot        arata si ce a picat, si de ce
//
// Ruleaza dupa tools/update.js, care face scanarea. Aici nu se scaneaza nimic,
// doar se compara snapshotul de azi cu cel anterior si se alege.
//
// Filtrele tari exclud, punctajul doar ordoneaza ce a trecut de ele. Ce a
// respins deja e in tools/respinse.json, nu in cod.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const DOSAR = path.join(__dirname, 'snapshots');

const { grupeaza } = require('./dubluri.js');

const respinse = JSON.parse(fs.readFileSync(path.join(__dirname, 'respinse.json'), 'utf8'));
const ID_RESPINSE = new Set(respinse.case.map(x => x.id));
const ID_AP_RESPINSE = new Set((respinse.apartamente || []).map(x => x.id));
const MASINI_RESPINSE = new RegExp(
  respinse.masini.map(x => x.model).concat(respinse.modele_prea_mici)
    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

const fara = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const idAnunt = u => ((String(u).match(/-(ID[A-Za-z0-9]+)(?:\.html)?$/) || [])[1]) || String(u);

// ---------- criteriile lui, ca filtre tari ----------

const AFARA = /r[aă][sș]inari|al[tț][aâ]na|tili[sș]ca|p[aă]ltini[sș]|[sș]ura mic|[sș]ura mare|bavaria|cisn[aă]die|[sș]elimb[aă]r|nucet|dealul sibiului|dealul daii|tropini|sibiel|t[aă]lmaciu|poplaca|ocna sibiului|sadu|tocile|ro[sș]ia|cristian|vurp[aă]r|daia|corn[aă][tț]el|hosman|cop[sș]a|ru[sș]ciori|ru[sș]i|slimnic|de vacan[tț]/i;
const COMUNA = /curt[eiă][^.!?]{0,40}comun|comun[ăa][^.!?]{0,40}curt|cot[aă]\s+parte|\bcot[aă]\s+(de\s+)?\d+\s*\/\s*\d+|p[aă]r[tț]i\s+comune|[iî]n\s+indiviziune/i;
// "Compartimentata in doua apartamente a cate 2 camere" e acelasi lucru cu
// doua corpuri, scris altfel - asa a trecut casa din Moara de Scoarta.
const CORPURI = /2 corpuri|dou[aă] corpuri|duplex|triplex|cvadruplex|garsonier|[iî]n[sș]iruit|dou[aă]\s+apartamente|2\s+apartamente|multifamilial|dou[aă]\s+locuin[tț]e|2\s+locuin[tț]e|dou[aă]\s+unit[aă][tț]i/i;
const SERVITUTE = /servitute|drept de trecere|acces prin curtea/i;
// Igrasia e blocker. Snapshotul are si excluderea din scan.js, dar doar din ziua
// in care a fost scanat; aici prinde si snapshoturile mai vechi.
const IGRASIE = /(?<!(f[aă]r[aă]|nu\s+(are|prezint[aă]|exist[aă])|lips[aă]|anti|zero)[\s\w&;-]{0,25})(igrasi|umezeal|mucegai|infiltra[tț]i)/i;
// Curtea pavata e criteriu de respingere, nu de punctaj - a refuzat casa din
// Petru Maior exact pentru asta. Prima varianta cerea cuvintele lipite,
// "curte pavata", si scapa formularea agentiei: "curte individuala, amenajata
// cu pavaj". Casa din Lupeni a ajuns asa pe locul 2, cu curtea betonata toata.
const BETON = /(curte|gr[aă]din[aă]|teren)[^.!?]{0,60}(pavaj|pavat|betonat|dale de beton)|(pavaj|pavat|betonat)[^.!?]{0,40}(curte|gr[aă]din[aă])/i;
const VERDE = /gr[aă]din[aă]|curte verde|spa[tț]iu verde|pomi fructiferi|iarb[aă]|livad[aă] [iî]n curte/i;

// Curea de distributie in baie de ulei - se schimba la 100.000 km si costa cat
// o reparatie mare daca se rupe. Nu e un defect al anuntului, e un cost de stiut.
// Opel, Citroen si DS au acelasi 1.2 PureTech, in titlu doar "1.2 Turbo".
const CUREA_IN_ULEI = /puretech|ecoboost 1\.0|\b(opel|citro[eë]n|ds)\b.*\b1\.2\s*(turbo|t)\b/i;

const snapshots = () => fs.readdirSync(DOSAR)
  .filter(x => /^storia-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort()
  .map(x => ({ data: x.slice(7, 17), cale: path.join(DOSAR, x) }));

// ---------- case ----------

// Cat teren ramane liber dupa ce scazi amprenta casei. Daca anuntul o spune, o
// iau de acolo; altfel scad suprafata construita la sol. Cand casa are etaj,
// mp utili supraestimeaza amprenta, deci cifra e prudenta.
const NR = '(?:aproximativ|aprox\\.?|cca\\.?|~)?\\s*(\\d{2,4})\\s*(?:mp|m2|m²)';
// Doar curtea si gradina, niciodata "teren". "Suprafata teren: 133 mp" e tot
// lotul, cu casa pe el: la Moara de Scoarta amprenta ocupa 70 din cei 133, si
// eu raportam 133 mp de curte pentru o alee betonata de trei metri latime.
const GRADINA = new RegExp(`(?:curte|gr[aă]din[aă])\\s*(?:proprie|individual[aă]|liber[aă])?\\s*(?:de|:|,)?\\s*${NR}`, 'i');
const AMPRENTA = new RegExp(`amprent[aă](?:\\s*la\\s*sol)?\\s*(?:de|:|,)?\\s*${NR}`, 'i');
const TEREN_TEXT = new RegExp(`suprafa[tț][aă]\\s*(?:de\\s*)?teren\\s*(?:de|:|,)?\\s*${NR}`, 'i');

function curteLibera(x) {
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  const g = t.match(GRADINA);
  if (g) return { mp: Number(g[1]), sigur: true };

  // Fisa si descrierea nu sunt mereu de acord - 150 mp in fisa, 133 in text la
  // aceeasi casa. Iau cifra mica: daca ma insel, ma insel in defavoarea casei.
  const dinText = t.match(TEREN_TEXT);
  const teren = Math.min(...[x.teren, dinText && Number(dinText[1])].filter(Boolean));

  const a = t.match(AMPRENTA);
  if (teren && a) return { mp: Math.max(0, teren - Number(a[1])), sigur: true };
  if (teren && x.mpu) return { mp: Math.max(0, teren - Math.round(x.mpu * 0.7)), sigur: false };
  return { mp: null, sigur: false };
}

function filtreazaCasa(x) {
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  if (ID_RESPINSE.has(idAnunt(x.url))) return 'respinsa deja';
  // Aceeasi casa republicata de alta agentie are alt ID: Turnisor IDHgc3 a revenit
  // ca IDIVfX pe locul 1, fara casa din spate pomenita in text. Potrivesc si pe
  // proprietate: cartier + mp utili + pret in 15%.
  const z = fara(x.zona || '');
  const r = respinse.case.find(c => c.zona && c.mpu && fara(c.zona) && z.includes(fara(c.zona))
    && c.mpu === x.mpu && x.pret && Math.abs(x.pret - c.pret) <= c.pret * 0.15);
  if (r) return `respinsa deja, aceeasi proprietate ca ${r.id}`;
  if (x.exclus && x.exclus.length) return 'exclusa automat: ' + [].concat(x.exclus).join(', ');
  if (AFARA.test(t)) return 'in afara orasului';
  if (COMUNA.test(t)) return 'curte comuna';
  if (CORPURI.test(t)) return 'doua corpuri sau garsoniera';
  if (SERVITUTE.test(t)) return 'acces prin curtea altuia';
  if (IGRASIE.test(t)) return 'igrasie';
  // 250.000 e pentru casa SI apartament; ~50.000 raman pentru apartament.
  if (!x.pret || x.pret > 200000) return 'peste buget';
  // Sub 20.000 nu e o casa intreaga: cota, avans sau chirie (ca PRET_MINIM din surse-case.js)
  if (x.pret < 20000) return 'pret nerealist pentru o casa';
  if (!x.mpu || x.mpu < 50) return 'sub 50 mp utili';
  if (BETON.test(t)) return 'curte pavata, nu verde';
  const c = curteLibera(x);
  if (c.mp != null && c.mp < 100) return `curte ~${c.mp} mp, sub 100`;
  if (c.mp == null) return 'nu scrie terenul';
  return null;
}

function punctajCasa(x) {
  let p = 0;
  const c = curteLibera(x);
  if (c.mp >= 150 && c.mp <= 450) p += 30;      // gradina, dar nu de intretinut cu tractorul
  else if (c.mp > 450) p += 18;
  else p += 12;
  if (x.mpu >= 70 && x.mpu <= 100) p += 25;     // banda lui
  else if (x.mpu <= 130) p += 14;
  else p += 4;                                   // peste 130 mp = incalzit si zugravit degeaba
  if (x.stare === 'ready_to_use') p += 12;
  p += Math.round((200000 - x.pret) / 200000 * 25);
  if (VERDE.test((x.titlu || '') + ' ' + (x.descriere || ''))) p += 10;
  return p;
}

// ---------- apartamente ----------

// Apartamentul e investitie de inchiriat, din ce ramane dupa casa: 2 camere,
// fara mansarda, fara dezvoltator, fara garsoniere, fara igrasie.
const MANSARDA = /mansard|pe\s+(2|dou[aă])\s+niveluri/i;
const DEZVOLTATOR = /dezvoltator|ansamblu\s+reziden|direct\s+de\s+la\s+constructor|bloc\s+nou|finalizare\s+[iî]n|predare\s+[iî]n/i;
// Apartamentul insusi e la subsol/demisol - nu pivnita sau boxa de la subsol, pe care o au multe blocuri
const SUBSOL = /(?<!(pivni\w*|box[aăe]\w*|beci\w*|garaj\w*|parcare\w*|camar\w*|camer\w*|spa[tț]i\w*|depozit\w*)[^.]{0,25})((?<!\bde\s)(la|[iî]n)\s+(subsol|demisol|suteran)|\betaj(ul)?\s*:?\s*(subsol|demisol)|apartament\w*\s+(de\s+|la\s+)?(subsol|demisol)|\b(subsol|demisol)\s*(\/|din)\s*\d)/i;
const ETAJ_SUS = new Set(['FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ABOVE_TENTH']);
const LA_CASA = /(apartament|locuin[tț][aă])\s+(la|[iî]n)\s+cas[aă]|\bla\s+cas[aă]\b/i;

function filtreazaAp(x, marcate) {
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  if (marcate.has(x.url)) return 'sters sau dublura (date.json)';
  if (ID_AP_RESPINSE.has(idAnunt(x.url))) return 'respins deja';
  if (IGRASIE.test(t)) return 'igrasie';
  if (RISC_SEISMIC.test(t)) return 'risc seismic, nu se poate inchiria';
  if (x.exclus && x.exclus.length) return 'exclus automat: ' + [].concat(x.exclus).join(', ');
  if (AFARA.test(t)) return 'in afara orasului';
  if (x.camere !== 'TWO') return 'nu are 2 camere';
  if (!x.mpu || x.mpu < 30) return 'sub 30 mp, practic garsoniera';
  if (MANSARDA.test(t)) return 'mansarda';
  // Mihai, 2026-10-26, la IDF6SF ("la subsolul unui imobil"): "beci, demisol, nu e ceva okay"
  if (x.etaj === 'CELLAR' || (!x.etaj && SUBSOL.test(t))) return 'subsol/demisol';
  if (x.etaj === 'GARRET') return 'mansarda';
  // Mihai, 2026-10-26: "sotia mea nu vrea la etajul 4". Il iau ca "4 si mai sus":
  // 5 e mai rau din aceleasi motive. Etajul vine din fisa Storia (scan.js)
  if (ETAJ_SUS.has(x.etaj)) return 'etajul 4 sau mai sus';
  if (DEZVOLTATOR.test(t) || Number(x.an) >= 2025) return 'de la dezvoltator';
  // "300 EUR" pe Storia la vanzare e o chirie pusa la categoria gresita
  if (!x.pret || x.pret < 20000) return 'fara pret de vanzare';
  return null;
}

// Apartamentul e investitie de inchiriat: vrea banii inapoi cat mai repede.
// Clasez pe ani de recuperare = pret / (chiria mediana a cartierului x 12),
// din ultimul snapshot al tools/chirii.js (chirii cerute pe Storia, 2 camere).
// Primul top era pe pret si a pus sus apartamente din cartiere cu chirie mica.
const CHIRII = (() => {
  const f = fs.readdirSync(DOSAR).filter(x => /^chirii-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  if (!f) return { data: null, zone: [], oras: null };
  const zone = JSON.parse(fs.readFileSync(path.join(DOSAR, f), 'utf8')).filter(z => z.cartier !== 'Fara cartier' && z.chirie);
  const v = zone.map(z => z.chirie).sort((a, b) => a - b);
  return { data: f.slice(7, 17), zone, oras: v[Math.floor(v.length / 2)] };
})();

// Mediana cartierului e pentru 2 camere de orice marime. Un 30 mp nu ia 450 €
// in Tiglari doar pentru ca mediana e 450 (2026-10-26, pe OLX 7,45 €/mp => ~225 €).
// Chiria estimata = €/mp din oras x factorul cartierului (mediana lui / mediana
// orasului) x mp, plafonata la mediana cartierului.
const CHIRIE_MP = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'chirii-mp.json'), 'utf8')); } catch (e) { return null; } })();

// Chiriile una cate una (tools/chirii.js, din 2026-10-26). Cand exista, chiria
// unui apartament = mediana chiriilor din acelasi cartier cu mp apropiati, ca la
// PropGenius; cartierul se largeste la oras doar daca are sub 3 asemanatoare.
const CHIRII_ANUNTURI = (() => {
  const f = fs.readdirSync(DOSAR).filter(x => /^chirii-anunturi-\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort().pop();
  return f ? JSON.parse(fs.readFileSync(path.join(DOSAR, f), 'utf8')).filter(a => a.mp && a.chirie) : [];
})();

// Chiria din bloc nou nu e chiria unui bloc din 1980: in Tiglari toate cele 4
// chirii de ~40 mp erau "The Lake Home", "bloc nou", "prima inchiriere" (420 €),
// iar un 39 mp din 1980 iesea la 420 € (2026-10-26). Cautarea nu da anul, dar
// slug-ul are titlul.
// "lux", "premium", "finisaje moderne" spun finisajul, nu anul blocului: cu ele, un
// bloc din 2010 din Tilisca lua chiria penthouse-urilor din Terezian si Hipodrom
// (550 €), cand in Tilisca 72 mp se cer 460-470 € (2026-10-26).
const CHIRIE_NOUA = /bloc-nou|prima-i?nchiriere|lake-home|lake-city|ansamblu|rezidential|green-hill|constructie-noua|nou-|-nou\b|lift/i;
const apNou = x => Number(x.an) >= 2010;

// Cartierul intreg, nu inceputul lui: "hipodrom iii, sibiu" incepe cu "hipodrom ii"
const eCartier = (z, c) => z === fara(c) || z.startsWith(fara(c) + ',');

function chirieComparabile(zona, mpu, nou) {
  const z = fara(zona || '');
  const inCartier = a => a.cartier !== 'Fara cartier' && eCartier(z, a.cartier);
  const potrivite = CHIRII_ANUNTURI.filter(a => CHIRIE_NOUA.test(a.url) === nou);
  const dinCartier = potrivite.filter(inCartier);
  // ±20% mp in cartier, apoi ±15% in oras; o plaja mai larga punea 47 mp langa 36 mp.
  // Un bloc nou ia si chiriile vechi din cartier inainte de oras: iese mai mica, nu
  // mai mare. Invers nu - un bloc vechi langa chirii noi iese prea scump.
  const incercari = [[dinCartier, 0.2, null]];
  if (nou) incercari.push([CHIRII_ANUNTURI.filter(inCartier), 0.2, null]);
  incercari.push([potrivite, 0.15, 'oras']);
  for (const [lista, abatere, unde] of incercari) {
    const g = lista.filter(a => Math.abs(a.mp - mpu) <= mpu * abatere);
    if (g.length < 3) continue;
    const v = g.map(a => a.chirie).sort((a, b) => a - b);
    const din = unde || g[0].cartier;
    return { chirie: Math.round(v[Math.floor(v.length / 2)] / 5) * 5, din, n: g.length, mp: [Math.round(mpu * (1 - abatere)), Math.round(mpu * (1 + abatere))] };
  }
  return null;
}

function chirieZona(zona, mpu, nou = false) {
  if (CHIRII_ANUNTURI.length && mpu) { const c = chirieComparabile(zona, mpu, nou); if (c) return c; }
  const z = fara(zona || '');
  const g = CHIRII.zone.find(c => eCartier(z, c.cartier));
  // Sub 5 anunturi de inchiriat, mediana cartierului e doua-trei apartamente
  const baza = g && g.nc >= 5 ? { chirie: g.chirie, din: g.cartier, n: g.nc } : { chirie: CHIRII.oras, din: 'oras', n: null };
  if (!CHIRIE_MP || !mpu || !CHIRII.oras) return baza;
  const pePm = CHIRIE_MP.eur_mp * baza.chirie / CHIRII.oras;
  return { ...baza, mediana: baza.chirie, chirie: Math.round(Math.min(baza.chirie, pePm * mpu) / 5) * 5, pe_mp: Math.round(pePm * 100) / 100 };
}

// Ani de recuperare NETI, cu riscurile care au o cifra cu sursa (REGULI.md §7,
// piata-chirii-sibiu.md):
//   luni goale  1/an la toate - Rightmove: "o luna pe an goala", chiria x 11
//               +1 sub 40 mp - PRESUPUNERE: nu exista date despre cat stau goale
//               apartamentele mici; Mihai: "acest risc trebuie sa intre in calcul"
//   impozit     8% din chirie - 10% dupa deducerea forfetara de 20% (ANAF)
//   intretinere 1% din pret pe an - regula uzuala pentru reparatii (Howsy)
const RISC = { luniGoale: 1, luniGoaleMic: 1, sub: 40, impozit: 0.08, intretinere: 0.01 };
// Banii dati la cumparare, peste pret (2026-10-26, Mihai: "comision de 2% ptr
// MAAC, plus altele la notar"):
//   comision  2% - cat cer agentiile; 0 doar la anunt direct de la proprietar
//             (x.privat). Storia nu ne spune inca cine a pus anuntul, deci
//             presupun agentie
//   notar     1,6% - onorariu + TVA + intabulare 0,15% + extras CF. Exemplu:
//             350.000 lei -> ~5.072 lei onorariu cu TVA, 1,45% (notari.pro/calculator-taxe-notariale),
//             plus 0,15% intabulare (capital.ro). Plateste cumparatorul (Codul civil)
const ACHIZITIE = { comision: 0.02, notar: 0.016 };
// Mihai, 2026-10-26: "sunt unele agentii care au comision 0". Pe 2026-10-26: 113 din
// 1.228 de apartamente Storia scriu asa. Plus proprietarii care refuza agentiile.
// "0% pentru vanzator" nu ajuta cumparatorul.
const FARA_COMISION = /(comision(ul)?\s*(pentru\s+cump[aă]r[aă]tor\s+este\s+)?(de\s*)?(0|zero)\s*%?|0\s*%\s*comision|f[aă]r[aă]\s+comision|scutit\w*\s+de\s+comision|nu\s+(percepem|se\s+percepe|perceput)\s+comision|nu\s+(pl[aă]tesc|ofer)\s+comision|nu\s+colaborez\s+cu\s+agen)(?![^.]{0,25}v[aâ]nz[aă]tor)/i;
const faraComision = x => !!x.privat || FARA_COMISION.test((x.titlu || '') + ' ' + (x.descriere || ''));
const costTotal = x => Math.round(x.pret * (1 + ACHIZITIE.notar + (faraComision(x) ? 0 : ACHIZITIE.comision)));
// Rs I / bulina rosie: legea 212/2022 modificata de 426/2023 interzice inchirierea
// pana la consolidare (cotidianul.ro; textul legii neverificat) - deci blocker.
const RISC_SEISMIC = /bulin[aă]\s+ro[sș]ie|clasa\s+(i|1)\s+de\s+risc|\brs\s*i\b|risc\s+seismic\s+(ridicat|clasa)|\bu[123]\b.*seismic/i;
const PARTER = /\bparter\b(?!\s+[iî]nalt)|\bdemisol\b|\bsuteran/i;
const ULTIMUL = /etaj(?:ul)?\s*(\d+)\s*(?:din|\/)\s*(\d+)/i;
const CENTRALA = /central[aă]\s+(termic[aă]\s+)?(proprie|pe\s+gaz|individual)/i;

// Cartierul vine din pinul pus de agent pe harta Storia, si pinul poate fi gresit:
// IDEAhs scrie "Tiglari" in titlu si "zona Tiglari" in descriere, pinul e pe str.
// Rennes, deci Strand I (2026-10-26). Cand titlul sau "zona/cartierul X" din
// descriere numeste alt cartier cunoscut, acela castiga.
const fara2 = s => fara(s).replace(/(.)\1+/g, '$1');
const CARTIERE = [...new Set(CHIRII_ANUNTURI.map(a => a.cartier).concat((CHIRII.zone || []).map(c => c.cartier)))]
  .filter(c => c && c !== 'Fara cartier').sort((a, b) => b.length - a.length);
const scapa = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function cartierDinText(x) {
  const zonaD = ((x.descriere || '').match(/(?:zona|cartier(?:ul)?)\s+([^.,;:!\n]{3,30})/gi) || []).join(' ');
  const t = fara2((x.titlu || '') + ' ' + zonaD);
  return CARTIERE.find(c => new RegExp('\\b' + scapa(fara2(c)) + '\\b').test(t)) || null;
}
function zonaAp(x) {
  const c = cartierDinText(x);
  if (!c || fara2(x.zona || '').startsWith(fara2(c))) return { zona: x.zona, pin: null };
  return { zona: c + ', Sibiu', pin: x.zona };
}

function calculAp(x) {
  const c = chirieZona(zonaAp(x).zona, x.mpu, apNou(x));
  const goale = RISC.luniGoale + (x.mpu < RISC.sub ? RISC.luniGoaleMic : 0);
  const net = c.chirie * (12 - goale) * (1 - RISC.impozit) - x.pret * RISC.intretinere;
  const cost = costTotal(x);
  return { c, goale, cost, net: Math.round(net), ani: net > 0 ? cost / net : Infinity };
}

// Riscuri fara cifra: nu schimba ordinea, dar se vad langa apartament.
function avertismenteAp(x) {
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  const a = [];
  const za = zonaAp(x);
  if (za.pin) a.push(`zona din anunț ${za.zona.replace(', Sibiu', '')}, pinul Storia ${za.pin.replace(', Sibiu', '')}`);
  // Etajul din fisa Storia bate textul, care pomeneste "parter" si la etajul 4 (IDIXZT)
  if (x.etaj ? x.etaj === 'GROUND' : PARTER.test(t)) a.push('parter');
  const e = t.match(ULTIMUL);
  if (e && e[1] === e[2] && Number(e[1]) > 0) a.push('ultimul etaj');
  if (x.an && Number(x.an) < 1978) a.push(`bloc din ${x.an}`);
  if (!CENTRALA.test(t)) a.push('nu scrie de centrală proprie');
  // Chiria vine din apartamente locuibile; aici renovarea se plateste inainte
  if (/necesit[aă]\s+renov|de\s+renovat|trebuie\s+renovat/i.test(t)) a.push('necesită renovare: chiria estimată e pentru renovat');
  return a;
}

function punctajAp(x) {
  return calculAp(x).ani;
}

function alegeAp(lista, marcate) {
  // Acelasi apartament la doua agentii: acelasi pret si aceiasi mp. Cartierul nu
  // intra in cheie - doua agentii l-au pus pe acelasi in Hipodrom II si III.
  // Pretul nu trebuie sa fie identic: IDEAhs (51.000) si IDECHg la I-Imob (52.000)
  // au aceleasi poze si erau locurile 1 si 3 (2026-10-26). Anul nu intra: unul
  // scrie 1997, celalalt 1980. Deci: aceiasi mp, acelasi etaj (cand il stim la
  // amandoua), acelasi cartier din anunt, pret la ±5%. Mp la ±1: Blitz il are pe
  // acelasi cu 36 mp (IDECg4, 49.900).
  const acelasi = (a, b) => Math.abs(a.mpu - b.mpu) <= 1
    && (!a.etaj || !b.etaj || a.etaj === b.etaj)
    && Math.abs(a.pret - b.pret) <= 0.05 * Math.min(a.pret, b.pret)
    && (a.pret === b.pret || fara2(zonaAp(a).zona) === fara2(zonaAp(b).zona));
  const pastrate = [];
  lista.filter(x => !filtreazaAp(x, marcate))
    .map(x => ({ x, p: punctajAp(x), alte: [] })).sort((a, b) => a.p - b.p)
    .forEach(g => { const s = pastrate.find(k => acelasi(k.x, g.x)); if (s) { if (s.x.url !== g.x.url && !s.alte.some(a => a.url === g.x.url)) s.alte.push(g.x); } else pastrate.push(g); });
  return pastrate;
}

// ---------- masini ----------

// La preluarea de leasing pretul afisat e doar avansul: un Audi Q5 din 2024
// aparea la 10.000 EUR, cu inca 39 de rate pe deasupra. Nu intra in buget
// si nu e comparabil cu restul listei.
const LEASING = /predare leasing|preluare leasing|preiei?\s+\d+\s+rate|rate\s+r[aă]mase|transfer leasing/i;

function filtreazaMasina(m) {
  if (m.mort) return `anunt sters de pe site (${m.mort_din})`;
  if (m.gj) return 'garda joasa';
  if (m.av) return 'avariata: ' + (m.av_motiv || '');
  if (LEASING.test((m.m || '') + ' ' + (m.warn || ''))) return 'preluare leasing, pretul e doar avansul';
  if (MASINI_RESPINSE.test(m.m || '')) return 'respinsa sau mai mica decat C3';
  if (!m.an || m.an < 2020) return 'mai veche de 2020';
  if (!m.km || m.km >= 100000) return 'peste 100.000 km';
  // Bugetul e 10.000; pana la 15.000 doar pentru o oferta rara (tare, din
  // oferte-tari.js). Il urcasem pe nesimtite la 11.500 si toate recomandarile
  // ajunsesera peste buget.
  if (!m.p || m.p > 15000) return 'peste buget';
  if (m.p > 10000 && !m.tare) return 'peste 10.000 si nu e oferta rara';
  return null;
}

function punctajMasina(m) {
  let p = (m.an - 2019) * 8;
  p += Math.round((100000 - m.km) / 100000 * 30);
  p += Math.round((15000 - m.p) / 15000 * 25);
  if (/sibiu|[sș]elimb[aă]r|cristian|cisn[aă]die/i.test(m.z || '')) p += 15;
  if (CUREA_IN_ULEI.test((m.m || '') + ' ' + (m.warn || ''))) p -= 25;
  else if (m.warn) p -= 8;
  return p;
}

// Unde am cautat si cand, citit din jurnalul scris de scan.js. Daca o sursa
// lipseste din jurnal sau e veche, se spune - altfel "am cautat peste tot" e
// doar pe cuvantul meu.
function surse() {
  let jurnal = {};
  try { jurnal = JSON.parse(fs.readFileSync(path.join(__dirname, 'cautari.json'), 'utf8')); } catch (e) { /* inca nimic */ }
  const AZI = new Date().toISOString().slice(0, 10);
  return [
    { nume: 'Storia', pentru: 'case' },
    { nume: 'Autovit', pentru: 'mașini' },
  ].map(s => {
    const j = jurnal[s.nume];
    if (!j) return { ...s, stare: 'nu am rulat-o niciodată' };
    const zi = j.cand.slice(0, 10);
    const zile = Math.round((Date.parse(AZI) - Date.parse(zi)) / 86400000);
    return {
      ...s, cand: j.cand, ce: j.ce,
      gasite: j.gasite, potrivite: j.potrivite != null ? j.potrivite : j.case,
      stare: zile === 0 ? 'azi' : zile === 1 ? 'ieri' : `acum ${zile} zile`,
      veche: zile > 1,
    };
  });
}

// ---------- rulare ----------

const arg = process.argv.slice(2);
const zile = arg.includes('--zile') ? Number(arg[arg.indexOf('--zile') + 1]) : null;
const scrie = arg.includes('--scrie');
const tot = arg.includes('--tot');

const snaps = snapshots();
if (snaps.length < 2) { console.log('am nevoie de cel putin doua snapshoturi'); process.exit(0); }

const acum = snaps[snaps.length - 1];
let referinta;
if (zile) {
  const prag = new Date(Date.now() - zile * 86400000).toISOString().slice(0, 10);
  const vechile = snaps.filter(s => s.data <= prag);
  referinta = vechile.length ? vechile[vechile.length - 1] : snaps[0];
} else {
  referinta = snaps[snaps.length - 2];
}

const azi = JSON.parse(fs.readFileSync(acum.cale, 'utf8'));
const vazute = new Set(JSON.parse(fs.readFileSync(referinta.cale, 'utf8')).map(x => idAnunt(x.url)));

// "Nou" inseamna postat pe Storia dupa data de referinta, nu "lipsea din
// snapshotul meu anterior". Pe 30 septembrie am inceput sa scanez mai multe
// pagini, si diferenta intre snapshoturi a scos deodata 143 de case "noi",
// dintre care unele erau pe piata din ianuarie. Data de postare nu minte.
const esteNou = x => x.creat && x.creat > referinta.data;

// Grupez pe proprietate inainte de clasament, altfel aceeasi casa ocupa doua
// locuri din trei: in Lupeni erau patru anunturi pentru un singur imobil, la
// 204.990 si 205.000 EUR. Pastrez anuntul cel mai ieftin si car dupa el
// celelalte preturi - ecartul e un argument de negociere, nu alta casa.
//
// Grupez pe toata piata, nu doar pe anunturile din fereastra: daca azi apare
// al patrulea anunt al unei case, vreau sa vad toate cele patru preturi, nu
// doar pe cele postate in aceeasi saptamana.
// Grupez pe TOATE casele, inclusiv pe cele care pica filtrele. Altfel anuntul
// care spune defectul e scos inainte de grupare si grupul nu mai afla de el.
function indexeazaGrupuri(toate) {
  const dupaUrl = new Map();
  grupeaza(toate).forEach(g => g.anunturi.forEach(a => dupaUrl.set(a.url, g)));
  return dupaUrl;
}

function alege(lista, index) {
  const picate = [];
  const vazut = new Set();
  const grupuri = [];
  lista.forEach(x => {
    const motiv = filtreazaCasa(x);
    if (motiv) { picate.push({ x, motiv }); return; }
    const g = index.get(x.url);
    if (!g || vazut.has(g.sef.url)) return;
    vazut.add(g.sef.url);
    // Curtea e a casei, nu a anuntului. BLITZ nu pomeneste pavajul, GRN scrie
    // "curte individuala, amenajata cu pavaj" - aceeasi casa din Lupeni. Daca
    // un singur anunt al proprietatii cade pe un filtru tare, cade toata.
    const caderi = g.anunturi.map(filtreazaCasa).filter(Boolean);
    if (caderi.length) { picate.push({ x: g.sef, motiv: caderi[0] + ' (din alt anunț al aceleiași case)' }); return; }
    grupuri.push({
      x: g.sef,
      p: punctajCasa(g.sef),
      alte: g.anunturi.filter(a => a.url !== g.sef.url)
        .map(a => ({ pret: a.pret, url: a.url, creat: a.creat }))
        .sort((a, b) => a.pret - b.pret),
    });
  });
  grupuri.sort((a, b) => b.p - a.p);
  return { trec: grupuri, picate };
}

// Ultima plasa, inainte de orice afisare. Marcarea link-urilor moarte se face
// la scanare, dar un anunt poate fi sters intre timp - un Peugeot deja sters a
// ajuns asa in clasament. Merg pe lista in jos si opresc cand am trei vii,
// deci un anunt mort nu lasa loc gol, ci il ia urmatorul.
async function primeleVii(lista, n, urlDin) {
  const ok = [];
  for (const x of lista) {
    if (ok.length === n) break;
    const u = urlDin(x);
    let s = 0;
    try { s = (await fetch(u, { method: 'HEAD', headers: UA_SIMPLU })).status; } catch (e) { s = 0; }
    // publi24 da 404 la HEAD pentru anunturi vii; confirm cu GET.
    if (s === 404 || s === 410) { try { s = (await fetch(u, { headers: UA_SIMPLU })).status; } catch (e) { s = 0; } }
    if (s === 410 || s === 404) { console.log(`  sarit, anunt sters de pe site: ${u}`); continue; }
    ok.push(x);
  }
  return ok;
}
const UA_SIMPLU = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };

(async () => {

const toateCasele = azi.filter(x => x.tip === 'casa');
const index = indexeazaGrupuri(toateCasele);
const caseNoi = toateCasele.filter(esteNou);
let { trec, picate } = alege(caseNoi, index);
let dinRezerva = false;

// Multe dimineti nu aduc nimic. In loc de o pagina goala, arat cele mai bune
// din ultima saptamana - dar spun pe fata ca nu sunt de azi.
const SAPT = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
let topCase = await primeleVii(trec, 3, g => g.x.url);
if (!topCase.length) {
  const r = alege(toateCasele.filter(x => x.creat > SAPT && !caseNoi.includes(x)), index);
  topCase = await primeleVii(r.trec, 3, g => g.x.url);
  dinRezerva = topCase.length > 0;
}
// Vrea mereu trei optiuni in top, nu o caseta goala: completez din toata lista,
// nu doar din ultima saptamana.
let dinTotLista = false;
if (topCase.length < 3) {
  const deja = new Set(topCase.map(g => g.x.url));
  const r = alege(toateCasele.filter(x => !deja.has(x.url)), index);
  const rest = await primeleVii(r.trec.filter(g => !deja.has(g.x.url)), 3 - topCase.length, g => g.x.url);
  if (rest.length) { topCase = topCase.concat(rest); dinRezerva = true; dinTotLista = true; }
}

const marcate = new Set(JSON.parse(fs.readFileSync(path.join(RADACINA, 'date.json'), 'utf8')).anunturi
  .filter(o => o.mort || o.dup).map(o => o.u));
const toateAp = azi.filter(x => x.tip === 'apartament');
const apNoi = toateAp.filter(esteNou);
// Spre deosebire de case, la apartament nu conteaza ce e nou, ci ce e ieftin:
// primele trei "postate azi" ieseau la 90.000, cand bugetul e ~50.000. Aleg din
// toata lista si marchez ce e nou.
const apOk = alegeAp(apNoi, marcate);
const topAp = await primeleVii(alegeAp(toateAp, marcate), 3, g => g.x.url);
const apDinRezerva = false;

let topMasini = [], masiniDinRezerva = false, masiniNoi = 0, masiniOk = 0, pragMasini = null;
const mCale = path.join(RADACINA, 'masini.json');
if (fs.existsSync(mCale)) {
  const masini = JSON.parse(fs.readFileSync(mCale, 'utf8')).masini || [];
  pragMasini = zile
    ? new Date(Date.now() - zile * 86400000).toISOString().slice(0, 10)
    : referinta.data;
  const noi = masini.filter(m => m.d && m.d > pragMasini);
  const alese = l => l.filter(m => !filtreazaMasina(m))
    .map(m => ({ m, p: punctajMasina(m) })).sort((a, b) => b.p - a.p);
  const ok = alese(noi);
  masiniNoi = noi.length; masiniOk = ok.length;
  topMasini = await primeleVii(ok, 3, g => g.m.u);
  // Criteriile de masina sunt stranse si multe zile nu aduc nimic. Ca la case,
  // arat atunci cele mai bune de pe toata lista, spunand ca nu sunt noi.
  if (!topMasini.length) {
    topMasini = await primeleVii(alese(masini.filter(m => !noi.includes(m))), 3, g => g.m.u);
    masiniDinRezerva = topMasini.length > 0;
  }
}

console.log(`\nCE A MAI APĂRUT   ${referinta.data} → ${acum.data}`);
console.log('='.repeat(62));
surse().forEach(s => console.log(`  ${s.nume.padEnd(8)} ${s.cand || '—'}  ${s.stare}`
  + (s.gasite != null ? `  ${s.gasite} găsite, ${s.potrivite} potrivite` : '')));

console.log(`\nCASE — ${caseNoi.length} postate în interval, ${trec.length} trec de criterii\n`);
if (!topCase.length) console.log('  nimic nou care să bifeze criteriile.\n');
else if (dinTotLista) console.log('  Prea puține noi. Completat cu cele mai bune de pe toată lista:\n');
else if (dinRezerva) console.log(`  Nimic postat în interval. Cele mai bune 3 de după ${SAPT}:\n`);
topCase.forEach(({ x, alte }, i) => {
  const c = curteLibera(x);
  console.log(`${i + 1}. ${x.pret.toLocaleString('ro-RO')} € · ${x.mpu} mp utili · curte ${c.sigur ? '' : '~'}${c.mp} mp · ${x.zona}`);
  console.log(`   ${String(x.titlu).slice(0, 66)}`);
  const repus = !dinRezerva && vazute.has(idAnunt(x.url)) ? ' · repostat, îl aveam deja' : '';
  console.log(`   postat ${x.creat}${x.stare === 'ready_to_use' ? ' · dat ca gata de locuit' : ''}${repus}`);
  console.log(`   ${x.url}`);
  if (alte.length) {
    const max = alte[alte.length - 1].pret;
    console.log(`   aceeași casă la încă ${alte.length} ${alte.length === 1 ? 'agent' : 'agenți'}, până la ${max.toLocaleString('ro-RO')} €`
      + (max > x.pret ? ` — cere ${(max - x.pret).toLocaleString('ro-RO')} € mai mult` : ''));
    alte.forEach(a => console.log(`     ${a.pret.toLocaleString('ro-RO')} € · ${a.creat} · ${a.url}`));
  }
  console.log();
});

console.log(`APARTAMENTE — ${apNoi.length} postate în interval, ${apOk.length} trec de criterii\n`);
if (!topAp.length) console.log('  nimic care să bifeze criteriile.\n');
else console.log('  Cele mai bune de pe toată lista Storia, nu doar cele noi:\n');
topAp.forEach(({ x, alte }, i) => {
  const t = (x.titlu || '') + ' ' + (x.descriere || '');
  const { c, goale, net, ani } = calculAp(x);
  const av = avertismenteAp(x);
  console.log(`${i + 1}. ${x.pret.toLocaleString('ro-RO')} € · ${x.mpu} mp utili · ${zonaAp(x).zona}${LA_CASA.test(t) ? ' · la casă' : ''}${esteNou(x) ? ' · NOU' : ''}`);
  console.log(`   chirie estimată ~${c.chirie} €/lună (${c.pe_mp ? `${c.pe_mp} €/mp × ${x.mpu} mp; ` : ''}${c.din === 'oras' ? 'cartier fără date' : `mediana ${c.din} ${c.mediana || c.chirie} €`})`);
  console.log(`   net ~${net.toLocaleString('ro-RO')} €/an (${goale} ${goale === 1 ? 'lună goală' : 'luni goale'}, impozit, reparații) · se recuperează în ${ani.toFixed(1)} ani`);
  if (av.length) console.log(`   ! ${av.join(' · ')}`);
  (alte || []).forEach(a => console.log(`   același apartament: ${a.pret.toLocaleString('ro-RO')} € · ${a.url}`));
  console.log(`   ${String(x.titlu).slice(0, 66)}`);
  console.log(`   postat ${x.creat} · ${x.url}\n`);
});

if (pragMasini) {
  console.log(`MAȘINI — ${masiniNoi} apărute după ${pragMasini}, ${masiniOk} trec de criterii\n`);
  if (!topMasini.length) console.log('  nimic nou care să bifeze criteriile.\n');
  else if (masiniDinRezerva) console.log('  Nimic nou. Cele mai bune de pe toată lista:\n');
  topMasini.forEach(({ m }, i) => {
    console.log(`${i + 1}. ${m.p.toLocaleString('ro-RO')} € · ${m.m} · ${m.an} · ${m.km.toLocaleString('ro-RO')} km · ${m.z}`);
    if (CUREA_IN_ULEI.test(m.m + ' ' + (m.warn || ''))) console.log('   ! curea de distribuție în ulei');
    else if (m.warn) console.log(`   ! ${String(m.warn).slice(0, 66)}`);
    console.log(`   ${m.u}\n`);
  });
}

if (tot && picate.length) {
  console.log(`--- ce a picat (${picate.length}) ---`);
  const pe = {};
  picate.forEach(({ motiv }) => { const k = motiv.replace(/~?\d+/g, 'N'); pe[k] = (pe[k] || 0) + 1; });
  Object.entries(pe).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`  ${String(n).padStart(3)}  ${k}`));
}

if (scrie) {
  fs.writeFileSync(path.join(RADACINA, 'azi.json'), JSON.stringify({
    generat: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16).replace('T', ' '),
    de_la: referinta.data, pana_la: acum.data,
    case_noi: caseNoi.length, case_trec: trec.length, din_rezerva: dinRezerva, din_tot_lista: dinTotLista,
    masini_din_rezerva: masiniDinRezerva,
    ap_noi: apNoi.length, ap_trec: apOk.length, ap_din_rezerva: apDinRezerva,
    chirii_din: CHIRII.data,
    apartamente: topAp.map(({ x, p, alte }) => ({
      alte: (alte || []).map(a => ({ pret: a.pret, url: a.url })),
      pret: x.pret, mpu: x.mpu, zona: zonaAp(x).zona, creat: x.creat, stare: x.stare,
      chirie: calculAp(x).c.chirie, chirie_din: calculAp(x).c.din, chirie_n: calculAp(x).c.n, chirie_mp: calculAp(x).c.mp, ani: Math.round(p * 10) / 10,
      net: calculAp(x).net, luni_goale: calculAp(x).goale, cost_total: calculAp(x).cost, fara_comision: faraComision(x), riscuri: avertismenteAp(x),
      la_casa: LA_CASA.test((x.titlu || '') + ' ' + (x.descriere || '')), nou: esteNou(x),
      titlu: x.titlu, url: x.url, scor: p,
    })),
    surse: surse(),
    case: topCase.map(({ x, p, alte }) => {
      const c = curteLibera(x);
      return {
        pret: x.pret, mpu: x.mpu, curte: c.mp, curte_sigura: c.sigur, teren: x.teren,
        zona: x.zona, an: x.an, stare: x.stare, creat: x.creat,
        repostat: vazute.has(idAnunt(x.url)), alte,
        titlu: x.titlu, url: x.url, scor: p,
      };
    }),
    masini: topMasini.map(({ m, p }) => ({
      pret: m.p, model: m.m, an: m.an, km: m.km, zona: m.z,
      warn: m.warn || null, url: m.u, scor: p,
    })),
  }, null, 1));
  console.log('scris în azi.json');
}

})().catch(e => { console.error('EROARE:', e.message); process.exit(1); });
