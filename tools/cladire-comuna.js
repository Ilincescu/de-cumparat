// Casa care e de fapt o parte dintr-o cladire: apartament la casa, etajul sau
// parterul unei vile, jumatate de casa. Mihai, 2026-11-22: "nu vreau ceva care
// sa aiba cladire comuna, la etaj; la pretul asta vreau sa fiu singur in curte".
// Doar la case: la apartamente, "la casa" e un plus.
//
// Un singur loc pentru regula, folosit de scan.js, surse-case.js si azi.js, ca
// la curea-ulei.js. Pe 22 nov a prins 22 din 434 de case din snapshoturi, intre
// ele locurile 2 si 3 din top: IDIp2T ("apartament 2 camere la casa") si IDHs2G
// ("etajul 1 al unei vile, cu intrare separata fata de parter"). "Pasul de la
// apartament la casa" (IDJ16E) e o casa intreaga, de aceea "de la" nu declanseaza.
// "La etaj sunt 2 camere" nu declanseaza: casele cu etaj sunt in regula.

const CLADIRE_COMUNA = /(?<!de\s+la\s+)apartament\w*(?:\s+[^\s.,;:!?|]+){0,4}?\s+(?:la|[iî]n|[iî]ntr-o)\s+cas[aăe]|etaj(?:ul)?\s+(?:\d+\s+)?(?:al\s+)?(?:unei|de|din)\s+(?:cas|vil|imobil)|parter(?:ul)?\s+(?:al\s+)?(?:unei|de|din)\s+(?:cas|vil|imobil)|jum[aă]tate\s+(?:de|din)\s+(?:cas|vil|imobil)|parte\s+(?:de|din)\s+(?:cas|vil|imobil)|intrare\s+separat\w*\s+(?:fa[tț][aă]\s+de|de)\s+(?:parter|etaj)|bifamilial/i;

module.exports = { CLADIRE_COMUNA };
