# Piața chiriilor în Sibiu: ce am aflat

Investigație pentru apartamentul de investiție (2 camere, de închiriat). Regulile
care decurg de aici sunt în `REGULI.md` §7. Aici stau datele și ce n-am putut afla.

## Chiria după mărime (OLX, 2026-10-26)

37 de anunțuri proprii OLX de 2 camere de închiriat în Sibiu, cu chirie în € și
mp. Sursa: https://www.olx.ro/imobiliare/apartamente-garsoniere-de-inchiriat/2-camere/sibiu/ .
Datele brute stau în `tools/externe/olx-chirii.json`, care e în `.gitignore`,
deci doar local.

| Mărime | Anunțuri | Chirie cerută mediană | €/mp |
|---|---|---|---|
| 20–42 mp | 4 | 400 € | 10,0 |
| 42–50 mp | 7 | 350 € | 7,8 |
| 50–60 mp | 21 | 375 € | 7,1 |
| peste 60 mp | 5 | 450 € | 6,9 |

- Toate la un loc: 7,45 €/mp (`tools/chirii-mp.json`).
- Un 2 camere tipic în Sibiu are 50–60 mp: peste jumătate din anunțuri.
- Între 40 și 60 mp chiria aproape nu se schimbă (350–375 €). Mai mulți mp la cumpărare nu aduc mai multă chirie. Abia peste 60 mp urcă la 450 €.
- Sub 42 mp sunt doar 4 anunțuri: [central, pe termen scurt, 30 mp, 380 €](https://www.olx.ro/d/oferta/apartament-central-sibiu-de-inchiriat-pe-termen-scurt-sau-lung-IDkTeJu.html), [The Lake Home, 40 mp, 400 €](https://www.olx.ro/d/oferta/apartament-2-camere-1-dormitor-de-inchiriat-the-lake-home-sibiu-400-luna-IDl3ano.html), [Vasile Aaron, 40 mp, 350 €](https://www.olx.ro/d/oferta/inchiriez-apartament-2-camere-vasile-aaron-sibiu-IDkY8QX.html), [Turnișor, nou, 40 mp, 400 €](https://www.olx.ro/d/oferta/inchiriez-apartament-2-camere-nou-modern-direct-proprietar-etaj-1-cartier-turnisor-1-loc-de-parcare-cu-bariera-IDk53gp.html). Niciunul nu e un 30 mp vechi.
- Limite: sunt chirii cerute, nu încasate; eșantionul e mic (banda 40–50 mp are 7 anunțuri); OLX are puține chirii față de Storia.

## Chiria pe cartier (Storia, 2026-09-30)

Din `tools/chirii.js`, salvat în `tools/snapshots/chirii-2026-09-30.json`. Mediana
chiriei cerute pentru 2 camere, de orice mărime.

| Cartier | Anunțuri de închiriat | Chirie mediană | Preț mediu de vânzare |
|---|---|---|---|
| Țiglari | 15 | 450 € | 98.950 € |
| Centrul Istoric | 35 | 450 € | 106.000 € |
| Lazaret | 9 | 430 € | 105.000 € |
| Terezian | 8 | 405 € | 98.990 € |
| Centrul Civic | 12 | 405 € | 109.999 € |
| Turnișor | 12 | 400 € | 109.500 € |
| Ștrand I | 15 | 400 € | 117.612 € |
| Hipodrom I | 17 | 380 € | 105.999 € |
| Hipodrom III | 39 | 380 € | 107.000 € |
| Trei Stejari | 7 | 350 € | 95.000 € |
| Vasile Aaron | 13 | 330 € | 101.990 € |

- Mediana cartierului **nu** e chiria unui apartament anume. 450 € în Țiglari nu înseamnă 450 € pentru un 30 mp (Mihai a prins asta, 2026-10-26).
- Câte anunțuri de închiriat sunt într-un cartier arată concurența, nu cererea.

## Cererea în Țiglari: neaflată

- Pe OLX, azi: niciun anunț de închiriat din cele 46 de 2 camere din Sibiu nu pomenește Țiglari.
- „Caut chirie” pe OLX: un singur anunț în tot Sibiul ([200 €](https://www.olx.ro/d/oferta/caut-o-chirie-in-zona-sibiu-200-IDkZdOo.html)). Oamenii nu postează ce caută.
- Ce ar răspunde: în câte zile dispare un anunț de închiriat din cartier. Asta cere să salvăm fiecare anunț de închiriat cu ID și dată, zilnic (`tools/chirii.js` salvează acum doar mediane). Altă cale: întrebat o agenție care administrează chirii.

## Ce spun ghidurile pentru Sibiu (2026-10-26)

- Randament brut ~4,5–7%, net ~3–4% ([capital.ro](https://www.capital.ro/mitul-chiriei-sigure-cat-ramane-in-mana-dupa-toate-costurile-in-2026.html)). Topul de azi iese la 12,9–14,2 ani pe brut, adică ~7–7,8%, la capătul de sus al intervalului.
- 2 camere e tipul cel mai căutat, cu vârf la începutul anului universitar ([antena3.ro](https://www.antena3.ro/continut-platit/piata-chiriilor-din-sibiu-in-2026-cerere-sustinuta-in-timp-ce-cresterea-preturilor-de-vanzare-pierde-ritm-798253.html), conținut plătit de o agenție).
- ULBS a ocupat ~4.000 de locuri la admiterea din iulie 2026, +14% față de anul trecut ([agerpres](https://agerpres.ro/comunicate/2026/08/05/comunicat-de-presa---universitatea-lucian-blaga-din-sibiu--1582380)).
- Impozit: 10% după o deducere forfetară de 20% ([ANAF](https://static.anaf.ro/static/10/Galati/cedarea_folosintei.pdf)); pentru 2026 se discută 30% (neverificat în Codul fiscal).

## Decizii deschise

- Minimul de suprafață: de la 30 la **40 mp**? Sub 40 nu există dovezi că se închiriază.
- Estimarea chiriei: din chiria pe mp (cum face acum `azi.js`) sau din mediana benzii de mărime (350–375 € pentru 40–60 mp)? Chiria pe mp subestimează apartamentele mici și le dă celor mari un avantaj pe care datele nu-l arată.
