// Scaneaza ce am scris deja, nu doar ce urmeaza sa scriu.
//
//   node tools/verifica-text.js
//
// De ce exista. Poarta din verifica.js ma opreste inainte sa scriu o afirmatie
// nesustinuta. Dar textul scris inainte de a construi poarta ramane acolo, si
// nimeni nu-l reciteste. Asa a supravietuit "te muti in ea" despre o casa din
// 1974 fara incalzire specificata - de doua ori, pana cand Mihai l-a aratat.
//
// Ruleaza peste paginile proiectului si cauta formulari pe care nu am voie sa
// le folosesc. Cateva vor fi alarme false: scopul nu e sa fie curat, e sa ma
// uit la fiecare si sa decid.

const fs = require('fs');
const path = require('path');

const RADACINA = path.join(__dirname, '..');
const PAGINI = ['berzelor.html', 'comparatie.html', 'index.html', 'poze.html'];

// Fiecare tipar are afirmatia pe care o ascunde si ce ar trebui sa am ca s-o sustin.
const TIPARE = [
  { re: /te mu[tț]i (în ea|mâine|imediat)|gata de mutat|poți locui imediat/gi,
    ce: 'ca se poate locui imediat',
    cer: 'incalzire confirmata, tamplarie, stare reala din poze - nu campul agentiei' },
  { re: /gata de locuit/gi,
    ce: '"gata de locuit"',
    cer: 'daca vine din construction_status, e camp completat de agentie; marcheaza-l ca atare' },
  { re: /structura (e|este) (sănătoasă|bună|solidă)|fără probleme de structură/gi,
    ce: 'ca structura e buna',
    cer: 'expertiza tehnica, nu poze' },
  { re: /acte(le)? (sunt )?(curate|în regulă|ok)/gi,
    ce: 'ca actele sunt curate',
    cer: 'extras de carte funciara, nu textul agentiei' },
  { re: /nu are (igrasie|mucegai|umezeală)/gi,
    ce: 'absenta umezelii',
    cer: 'nu se poate dovedi din poze - doar expertiza' },
  { re: /jumătate din (teren|suprafa[tț]ă)/gi,
    ce: 'o proportie din teren',
    cer: 'suprafata fiecarui CF' },
  { re: /fără (nicio )?hârti[ei]|nu (cere|trebuie) nicio autorizație/gi,
    ce: 'ca nu trebuie autorizatii',
    cer: 'depinde de lucrare; injectarea nu cere, placile de inox da' },
  { re: /\b(se vinde|se vând|se vindea) (cu|la)\b/gi,
    ce: 'un pret de tranzactie',
    cer: 'in Romania nu exista preturi de tranzactie publice - spune "cere", nu "se vinde"' },
  { re: /piața a refuzat/gi,
    ce: 'ca piata a refuzat un pret',
    cer: 'pretul trebuie sa fi stat destul cat sa fie testat' },
];

let total = 0;
for (const fisier of PAGINI) {
  const cale = path.join(RADACINA, fisier);
  if (!fs.existsSync(cale)) continue;
  const linii = fs.readFileSync(cale, 'utf8').split('\n');
  const gasite = [];
  linii.forEach((linie, i) => {
    TIPARE.forEach(t => {
      const m = linie.match(t.re);
      if (m) gasite.push({ nr: i + 1, text: m[0], ce: t.ce, cer: t.cer, linie: linie.trim().slice(0, 110) });
    });
  });
  if (!gasite.length) continue;
  console.log(`\n=== ${fisier} ===`);
  gasite.forEach(g => {
    total++;
    console.log(`\n  ${fisier}:${g.nr}  "${g.text}"`);
    console.log(`     afirma: ${g.ce}`);
    console.log(`     cere:   ${g.cer}`);
    console.log(`     context: ...${g.linie}...`);
  });
}

console.log(`\n${total ? total + ' formulari de verificat.' : 'Nimic de verificat.'}`);
console.log('Unele pot fi in regula - de exemplu cand chiar spun ca afirmatia e a agentiei.');
console.log('Scopul nu e sa fie gol, e sa ma uit la fiecare.');
