// Motoare cu curea de distributie in baie de ulei: se schimba la timp si costa
// cat o reparatie mare daca se rupe. Nu e un defect al anuntului, e un cost de stiut.
//
// Un singur loc pentru regula, folosit de scan.js, adauga-masini.js si azi.js.
// Pana pe 2026-11-04 era copiata in trei fisiere si nu prindea titlurile reale
// de pe Autovit: cauta "ecoboost 1.0", iar anunturile scriu "1.0 EcoBoost";
// cauta la Opel "1.2 Turbo", iar Crossland-ul scrie "1.2 Start/Stop". Asa a
// ajuns un Ford EcoSport 1.0 EcoBoost pe locul 1 si un Opel Crossland 1.2 pe
// locul 2 in topul de masini, desi masini.json le trecea la "de evitat".
//
// - PureTech (Peugeot, Citroen, DS, Opel): 1.0 si 1.2, cu sau fara turbo.
//   Opel, Citroen si DS il scriu in titlu doar "1.2", "1.2 Turbo" sau "1.2 ECOTEC".
// - Ford 1.0 EcoBoost (EcoSport, Puma, Fiesta, Focus), in orice ordine a cuvintelor.

const CUREA_IN_ULEI = /puretech|\b1\.0\s*eco\s*boost\b|\beco\s*boost\s*1\.0\b|\b(opel|citro[eë]n|ds)\b.*\b1\.2\b/i;

// Cand titlul nu spune motorul ("Ford EcoSport", "Peugeot 2008"), il spun modelul,
// benzina si puterea: din 2018, aceste modele pe benzina pana la 160 CP au doar
// 1.0 EcoBoost (Ford) sau 1.2 PureTech (Peugeot, Citroen, Opel, DS). Asa a urcat
// pe 2026-11-04 un "Ford EcoSport" de 125 CP pe locul 3, dupa ce regula pe titlu
// le scosese pe celelalte.
const MODEL_CU_CUREA = /\bford\b.*\b(ecosport|puma)\b|\bopel\b.*\b(crossland|grandland)\b|\bpeugeot\b.*\b(2008|3008|5008)\b|\bcitro[eë]n\b.*\b(c3 aircross|c4 cactus|c5 aircross)\b|\bds\s*[37]\b/i;

const MESAJ = 'Curea de distributie in baie de ulei (PureTech sau 1.0 EcoBoost; la Ford dupa 2019 sursele se contrazic) - verifica pe VIN la service si cere istoricul reviziilor.';

// Avertisment care spune DOAR de curea: pe site nu ascunde masina, in azi.js
// scade putin. Aceeasi regula ca DOAR_CUREA din index.html.
const DOAR_CUREA = /^(Curea de distributie in baie de ulei|Motor (PureTech( \(la Opel scris 1\.2 Turbo\))? )?cu curea de distributie in baie de ulei)/;

// titlu + (optional) combustibil, putere si an, ca in masini.json: { f, cp, an }
function avertisment(titlu, { f, cp, an } = {}) {
  const t = titlu || '';
  if (CUREA_IN_ULEI.test(t)) return MESAJ;
  if (MODEL_CU_CUREA.test(t) && /benzin/i.test(f || '') && cp && cp <= 160 && (an || 0) >= 2018) return MESAJ;
  return null;
}

module.exports = { CUREA_IN_ULEI, MODEL_CU_CUREA, MESAJ, DOAR_CUREA, avertisment };
