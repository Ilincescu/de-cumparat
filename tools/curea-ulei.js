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

const MESAJ = 'Motor cu curea de distributie in baie de ulei (PureTech sau 1.0 EcoBoost) - cere dovada schimbarii ei.';

const avertisment = titlu => (CUREA_IN_ULEI.test(titlu || '') ? MESAJ : null);

module.exports = { CUREA_IN_ULEI, MESAJ, avertisment };
