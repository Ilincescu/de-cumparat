// Preluare de leasing: pretul afisat e doar avansul, restul sunt rate. Un Audi
// Q5 din 2024 aparea la 10.000 EUR, cu inca 39 de rate pe deasupra; un Toyota
// RAV4 din 2023 a stat pe locul 1 la 10.000 EUR, cu "Predare leasing, mai sunt
// 47 rate x ~2900 lei" scris doar in descriere (Mihai, 2026-11-22).
//
// Un singur loc pentru regula, folosit de azi.js (pe titlu si warn) si de
// masini-avariate.js (pe descrierea anuntului). "60 de rate de 250 EUR" e
// finantarea dealerului, cu pretul intreg afisat, deci nu declanseaza.

const LEASING = /(predare|preluare|cesiune|transfer)\s+(de\s+)?leasing|preiei?\s+\d+\s+rate|rate\s+r[aă]mase|mai\s+(sunt|au\s+r[aă]mas)\s+\d+\s+rate/i;

module.exports = { LEASING };
