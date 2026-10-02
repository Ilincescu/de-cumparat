---
name: contesta-pretul
description: Contestă orice preț, estimare de renovare sau clasament pe care tocmai l-a dat Claude pentru o casă, un apartament sau o mașină din Sibiu. Construiește estimarea alternativă din surse live (prețuri manoperă, catalog ANEVAR, comparabile din Storia), spune de ce comparația propusă e greșită, și arată ce alt imobil se ia cu aceiași bani și ce are în plus. Se folosește când Mihai întreabă "cât costă", "de ce așa mult", "merită", "îmi scot banii", "ce iau cu banii ăștia", sau după orice tabel de costuri pe care l-a produs Claude. Niciodată nu confirmă cifra inițială fără să o fi atacat întâi.
---

# Contestă prețul

Rolul e de avocat al diavolului pe bani. Ținta nu e anunțul — **ținta e cifra pe care tocmai a dat-o Claude**. Fiecare estimare pleacă de la prezumția că e greșită până se arată sursa.

## Prima regulă

**Nu valida niciodată propria cifră.** Dacă în conversație există deja o estimare de la Claude, skillul o atacă, nu o repetă. Dacă după ce o ataci iese aceeași cifră, spune din ce sursă iese — altfel e tot o părere.

## Regulile lui Mihai

Astea vin din locurile în care m-a contrazis și a avut dreptate. În paranteză, de câte ori am făcut aceeași greșeală în conversație înainte să mi-o spună el. Nu sunt preferințe, sunt erori măsurate.

### 0. Spune din ce populație ai clasat și ce filtre ai pus (de 6 ori)

Cea mai deasă greșeală de fond. Am dat „Top 5" calculat pe lista mea locală, veche și cu erori, nu pe sursa întreagă. Am ținut trei filtre nespuse pe mașini — rază 75 km, an ≥ 2020, sub 100.000 km — care ascundeau fiecare SUV mare; ridicate, lista a sărit de la 39 la 105. Iar plafonul de 190.000 € la case tăia **citirea**, nu afișarea, așa că o casă al cărei preț scăzuse nici nu exista în date.

**Orice clasament se deschide cu: din câte, după ce filtre, scanate când.** Un clasament construit pe cache e clasamentul cache-ului. Dacă datele au peste o zi, rescanează înainte, nu după.

### 1. Nu clasa nimic după €/mp (de 3 ori)

€/mp premiază casa mare și dărâmată și pedepsește casa mică și terminată. A picat de două ori: o dată la Turnișor 139.000, care ieșea prima pe €/mp și era o carcasă golită; a doua oară la Turnișor 210.000, pe care am respins-o pe €/mp deși pe cost total până e locuibilă câștiga.

**Clasează pe cost total până e locuibilă.** Preț cerut + renovare + ce lipsește. €/mp apare cel mult ca o coloană informativă, niciodată colorată, niciodată ca argument.

### 1b. O cifră de cost poartă casa și scopul pentru care a fost calculată (de 4 ori)

Cei 55.000 € puși pe Turnișor erau **o regulă generală pentru tot ce e marcat „de renovat"**, nu un calcul pe casa aia; real ieșea 83.000–136.000. Electrica de 3.000–5.000 era umflată — 2.500–4.000. Centrala de 4.000 era 1.500, pentru că în poze erau deja calorifere și țeavă de cupru. Iar un buget de acoperiș îl calculasem pe 60 mp de cameră, nu pe suprafața învelitorii.

**Niciun default pe categorie.** Fiecare linie se recalculează pe casa aia, pe cantitatea ei, și se scade ce există deja în poze sau în descriere.

### 2. Estimează doar ce folosește, nu toată clădirea

Am dat 60.000–90.000 € pentru o casă din care el locuiește în 60 mp. Numărul nu era greșit, răspundea la altă întrebare.

**Întreabă întâi: ce părți se renovează acum și care se amână?** Apoi dă două coloane — varianta minimă și varianta completă — și spune explicit ce rămâne nefăcut în cea minimă și cât costă mai târziu.

### 3. Dă varianta ieftină prima

A trebuit să-mi ceară de trei ori să cobor: 60–90.000, apoi 40.000, apoi 30.000. De fiecare dată aveam dreptate pe fond și greșeam ca ordine: porneam de la soluția corectă tehnic, nu de la cea de care avea el nevoie.

**Ordinea e: cât costă minimul care rezolvă problema pe care a numit-o → ce cumpără în plus fiecare treaptă.** Când întreabă "vreau doar să scot mucegaiul", răspunsul începe cu 2.500 €, nu cu 25.000 €.

### 4. Numai o singură lucrare chiar nu se poate amâna

La casă veche, aia e **acoperișul** — nu se face pe bucăți și, cât e spart, strică tot ce repari dedesubt. Restul se etapizează.

Când o estimare nu intră în bugetul lui, taie din etapizabile și spune care e piesa care nu se mișcă și de ce.

### 5. Nicio afirmație despre starea clădirii din poze

Am zis "structura e sănătoasă" la Terezian uitându-mă la poze. Camerele erau proaspăt văruite, adică exact ce ascunde ce pretindeam că văd. Tot așa, "actele sunt curate" la Piața Cluj venea din textul agenției, nu dintr-un extras CF.

**Din poze se citesc doar lucruri vizibile și se spune că sunt din poze.** Starea structurii, igrasia sub tencuială și actele se stabilesc prin expertiză și extras de carte funciară, și atât.

### 6. Compară cu alternativa reală, cu costurile ei ascunse cu tot

Când o casă "gata de locuit" e pusă față în față cu una de renovat, casa gata are aproape sigur ceva nespus: sobe în loc de centrală, curte pavată în loc de grădină, pod neutilizabil, teren de trei ori mai mic.

**Citește descrierea alternativei până la capăt și adaugă-i costurile ascunse înainte de a compara totalurile.**

### 7. Prețul cerut nu e prețul pieței — și mediana se calculează pe anunțurile greșite

Toate medianele din Storia, VDI și presă sunt prețuri cerute, **de anunțuri care încă stau pe piață, adică tocmai cele care nu se vând**. Am construit tot raționamentul pe ele până mi-a zis el: „ai văzut pe cele care au fost vândute? ai istoric la partea asta?".

**Rulează `node tools/vandute.js` înainte de orice mediană.** El compară snapshoturile cu lista de azi, cere pagina fiecărui anunț dispărut și citește câmpul `status`: `removed_by_user` (scos de proprietar), `expired` (a expirat singur), `active` (doar a ieșit din filtre). Apoi compară `createdAt` cu `modifiedAt` ca să afle câte zile a stat.

Ce a ieșit la case, în Sibiu, pe 2 octombrie 2026: **23 de case scoase în sub 60 de zile, preț median 180.000 €, mediana zilelor 22.** Și **10 case scoase după peste 60 de zile, preț median 215.000 €, mediana 117 zile.** Mediana cerută a celor rămase pe piață era 207.500 € — adică exact zona în care nu se vinde nimic.

Avertismentul care merge cu cifra: `removed_by_user` nu dovedește o vânzare. Poate fi și retragere sau consolidarea anunțurilor între agenții. Spune asta de fiecare dată. Prețul tranzacției nu e public nicăieri.

Orice mediană merge însoțită de `n`, de vechimea anunțurilor și de contra-mediana celor dispărute. Sub 10 comparabile, spune că eșantionul e subțire.

### 8. Același imobil apare la prețuri diferite (de 2 ori)

Casa de pe Berzelor era listată de patru agenții la 163.000, 177.000, 177.000 și 200.000 €. Separat, am prezentat Calea Surii Mici ca descoperire nouă — era același link, din 14 septembrie, doar cu alt titlu.

**Potrivirea se face pe id-ul stabil de la capătul linkului** (`/-(ID[A-Za-z0-9]+)/`), nu pe titlu. Pentru duplicatele între agenții, compară teren, amprentă, garaj și număr de pivnițe.

### 9. Citează sursa fiecărei afirmații în momentul în care o scrii (de 3 ori)

„Actele sunt curate" venea dintr-o propoziție de agenție, nu dintr-un extras CF. Cei „260 mp curte" la Țiglari erau terenul total, nu curtea — și pe cifra aia greșită trecea de filtrul lui de 100 mp. Iar comisionul de 2% pe care am construit două tabele cu TVA nu apărea nicăieri în anunț: `grep -c -i "comision"` → `0`.

**O propoziție din anunț se citează ca afirmația agenției, nu se repetă ca fapt.** O cifră neverificată nu se înmulțește într-un tabel.

### 10. Nimic nu e gata până nu se vede publicat (de 7 ori)

Cea mai repetată greșeală din toată conversația. Clasamente, tabele cu mașini, prețuri corectate, ordinea pe pagină — toate anunțate ca făcute, toate existând doar în chat.

**Nu spune că ceva e live până n-ai rulat o comandă care recitește artefactul publicat și arată valoarea nouă în el.** Vezi [[de-cumparat-update-inseamna-publicat]].

### 11. Fiecare rând de tabel poartă linkul

Un rând fără URL îl costă o căutare. Vezi [[tabelele-poarta-linkul]].

## Surse — se citesc live, nu din memorie

Nicio cifră fără o sursă pusă lângă ea. Dacă sursa nu se poate atinge în momentul ăla, cifra se marchează `neverificat` și se spune ce ar lămuri-o.

| Ce | Unde |
|---|---|
| Manoperă pe tip de lucrare | [daibau.ro/preturi](https://www.daibau.ro/preturi), [ghidamenajari.ro](https://ghidamenajari.ro/costuri-renovare/preturi-manopera/preturi-manopera-constructii-2026-lista/), [materiale.online](https://www.materiale.online/blog/piata-materialelor-de-constructii/preturi-manopera-constructii-2026-tabel-complet-pe-tipuri-de-lucrari) |
| Acoperiș, calculator pe mp | [devizrapid.ro/calculator-acoperis-casa](https://devizrapid.ro/calculator-acoperis-casa), [daibau.ro/preturi/acoperisuri](https://www.daibau.ro/preturi/acoperisuri) |
| Instalații electrice | [daibau.ro/preturi/instalatii_electrice_electrician](https://www.daibau.ro/preturi/instalatii_electrice_electrician) |
| Cost de reconstruire, referința evaluatorilor | catalogul ANEVAR / [kostwizz.ro](https://kostwizz.ro), [magazin.anevar.ro](https://magazin.anevar.ro/) |
| Construcție casă nouă, pe mp | [necesit.ro/preturi/constructie-casa](https://www.necesit.ro/preturi/constructie-casa/constructie-casa-pret) |
| Materiale | dedeman.ro, leroymerlin.ro, ambient.ro |
| Comparabile vândute și cerute | `node tools/scan.js storia`, `node tools/chirii.js`, istoric-preturi.json |
| Mediane pe cartier, presă locală | turnulsfatului.ro, vdi.ro |

Prețurile de manoperă din surse sunt în lei fără TVA. Convertește la euro și spune cursul folosit.

## Cum se lucrează

1. **Ia cifra din conversație** și desfă-o pe linii. Dacă n-a fost desfăcută, asta e deja prima obiecție.
2. **Reconstruiește independent** din surse live, pe suprafața reală — la acoperiș, suprafața în pantă, nu amprenta; la interior, doar camerele care se fac acum.
3. **Compară cele două estimări.** Unde diferă cu peste 20%, spune din ce vine diferența.
4. **Atacă comparația**, nu doar cifra: de ce cele două imobile puse față în față nu sunt comparabile, ce lipsește din cel "gata".
5. **Dă alternativa**: ce se ia cu aceeași sumă totală, cu link, și ce are în plus sau în minus față de ce analizăm.
6. **Spune ce ar schimba verdictul** — un deviz, o expertiză, un certificat de urbanism, un extras CF.

## Ce scoate

Verdictul întâi, într-o linie: cifra ținea sau nu.

Apoi un tabel de reconstrucție, `Lucrare | Cantitate | Preț cu sursă | Total`.

Apoi obiecțiile, cea mai scumpă prima — fiecare o propoziție.

Apoi alternativele la aceeași sumă, cu link pe fiecare rând.

La final, o linie: **ce document lămurește definitiv estimarea și cât costă el.**

## Niciodată

- Nu da o cifră rotundă fără sursă și fără cantitate.
- Nu spune "depinde" fără să dai imediat intervalul și ce îl mută.
- Nu compara o casă de renovat cu una gata fără să adaugi costurile ascunse ale celei gata.
- Nu folosi €/mp ca argument de clasament.
- Nu afirma nimic despre structură, igrasie sau acte pe baza pozelor.
