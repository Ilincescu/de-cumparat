# Regulile proiectului

Fiecare regulă de aici vine dintr-o greșeală pe care am făcut-o și pe care Mihai a
prins-o. În paranteză, de câte ori am repetat-o înainte să fie scrisă.

---

## Regula 0: repar mecanismul, nu doar instanța

**Când ceva se repetă greșit sau merge ineficient, îl repar în aceeași tură, fără să
întreb, și spun într-un rând ce am schimbat.**

Patru declanșatoare, fiecare cu locul unde se duce reparația:

| Ce observ | Ce fac |
|---|---|
| **Mihai mă corectează a doua oară pe același lucru** | Nu e o scăpare, e o barieră care lipsește. Adaug afirmația în `tools/afirmatii-interzise.json` și regula aici. |
| **Un filtru a lăsat ceva să treacă** | Îl repar **peste tot unde e duplicat**, nu doar unde l-a prins. Regexul de curte comună era în trei fișiere. |
| **Am tastat aceeași secvență de comenzi a treia oară** | Devine tool în `tools/`, cu un comentariu care spune din ce problemă s-a născut. |
| **O afirmație s-a dovedit nesusținută** | Intră în `afirmatii-interzise.json` cu data și greșeala din care vine, ca `verifica.js` s-o scoată data viitoare. |

**Contorul de mai jos e partea care contează.** O greșeală cu un singur rând e o scăpare.
Una cu doi, trei sau șapte e un defect de proces, și atunci repararea instanței nu e
suficientă — trebuie construit ceva care s-o facă imposibilă.

| Greșeală | De câte ori | Ce am construit |
|---|---|---|
| Am spus că ceva e gata când exista doar în chat | 7 | `tools/update.js`, regula de livrare |
| Am clasat dintr-o listă veche sau cu filtre nespuse | 6 | plafon ridicat în `scan.js`, regula „din ce populație" |
| Cifre default pe categorie, nu pe casa aia | 4 | regula de recalculare pe linii |
| Verdicte despre structură din poze | 3 | `tools/verifica.js` + afirmații interzise |
| Clasament pe €/mp | 3 | regula de cost total |
| Text de agenție repetat ca fapt | 3 | regula de citare a sursei |
| I-am propus case pe care le respinsese | 3 | memoria `case-respinse-de-mihai`, verificată de `verifica.js`; `azi.js` respinge și pe proprietate (cartier + mp + preț), fiindcă aceeași casă revine cu alt ID |
| Potrivire pe titlu, nu pe ID | 2 | regula de ID |

---

## Poarta: `node tools/verifica.js <ID>`

**Nu scriu nicio propoziție despre o casă înainte să fi rulat asta.** Scriptul descarcă
pozele, scoate fișa tehnică, citește descrierea, verifică istoricul de preț, caută
duplicate, verifică dacă Mihai a respins-o deja — și scoate la final lista
**AFIRMAȚII INTERZISE**: lucrurile pe care datele nu le susțin.

Dacă o afirmație e pe lista aia, nu o scriu. Oricât de probabilă ar părea.

După ce rulez scriptul, **deschid `index.html` și mă uit la toate pozele.** Nu la
miniaturi — la poze. „Te muți mâine" a ieșit dintr-un contact sheet privit în treacăt.

---

## 1. Dovada înainte de afirmație

**Nicio afirmație fără sursa ei, numită în momentul în care o scriu.** (de 3 ori)

- Din **poze** se citesc doar lucruri vizibile, și se spune că sunt din poze. Starea structurii, igrasia sub tencuială și actele cer expertiză și extras CF. Am zis „structura e sănătoasă" uitându-mă la camere proaspăt văruite.
- O propoziție din **anunț** se citează ca afirmația agenției, nu se repetă ca fapt. „Actele sunt curate" venea din textul unui agent.
- **Câmpurile completate de agenție mint.** `construction_status: ready_to_use` l-am prins mințind de trei ori: Gușterița cu sobe de teracotă, Lazaret cu baie de fontă și boiler pe perete, Țiglari fără nicio mențiune de încălzire. Nu îl folosesc ca dovadă pentru nimic.
- **Absența unui câmp e informație.** Dacă fișa n-are `heating` și descrierea nu pomenește încălzirea, nu scriu nimic despre încălzire — scriu că lipsește și că trebuie întrebat.
- Nu dau un **link** fără să-l fi verificat. Am dat `izolatiicutablainox.ro`, domeniu care nu mai există.

## 2. Clasamente și comparabile

**Spun din ce populație am clasat, cu ce filtre, scanate când.** (de 6 ori) Un clasament
pe cache e clasamentul cache-ului. Dacă datele au peste o zi, rescanez întâi.

**Filtrele lui se aplică pe tabel, nu doar pe lista mare.** Comparabilele din
`berzelor.html` le construisem de mână și au intrat trei case cu curte comună.

**Potrivirea se face pe ID-ul de la capătul linkului**, niciodată pe titlu. Am prezentat
Calea Surii Mici ca descoperire nouă — era același anunț cu alt titlu. Și am pus în
tabelul de comparabile linkul casei însăși.

**Verific lista de respinse înainte de orice tabel de alternative.** I-am repropus de
două ori case pe care le refuzase. Lista e în memoria `case-respinse-de-mihai`.

## 3. Prețuri și estimări

**Clasez pe cost total până e folosibil, niciodată pe €/mp.** (de 3 ori) €/mp premiază
casa mare și dărâmată și pedepsește casa mică și terminată.

**Nicio cifră default pe categorie.** (de 4 ori) Cei 55.000 € puși pe Turnișor erau o
regulă generală pentru „de renovat", nu un calcul. Fiecare linie se recalculează pe casa
aia, pe cantitatea ei, și se scade ce există deja.

**Estimez doar partea pe care o folosește acum**, nu toată clădirea. Și dau varianta
ieftină prima. A trebuit să-mi ceară de trei ori să cobor de la 90.000 la 30.000.

**Spun pe ce suprafață calculez și cum am obținut-o.** Am rotunjit „60 mp" luni de zile
fără să adun vreodată cifrele din releveu. Adunate, dau 66,6.

**Desfac mediana înainte s-o citez:** `n`, interval min–max, câte intrări au date
stricate. Mediana „180.000 €" s-a dovedit a fi 20 de case între 59.999 și 249.000, și
s-a mutat cu 10.000 peste noapte.

**Prețul cerut nu e prețul pieței, iar un preț nou nu a fost testat de piață.** Am scris
„piața a refuzat 163.000" despre un preț care avea cinci zile.

**Nu inventez proporții.** „Jumătate din teren e înfundat" — nu știam cât.

## 4. Ce nu se amână și ce se poate

La casă veche, singura lucrare care nu se face pe bucăți e **acoperișul**. Restul se
etapizează. Când o estimare nu intră în buget, tai din etapizabile și spun care e piesa
care nu se mișcă.

**Nu spun „fără hârtii" global.** Injectarea din interior chiar nu cere nimic. Plăcile de
inox bătute în rost sunt intervenție în structura de rezistență. Săpătura lângă fundație
cere opinia unui structurist. Iar în zonă protejată, până și fațada cere aviz.

## 5. Context care schimbă citirea

**O casă nelocuită nu e aceeași casă cu una locuită.** 14 ani fără încălzire și aerisire
amplifică umezeala masiv. Ce se vede în poze e scenariul cel mai rău, nu starea de după
ce o încălzești.

**Verific premisa înainte s-o folosesc ca argument.** Am spus „mucegaiul a revenit în doi
ani" — demisolul nu intrase în renovarea aia.

## 6. Livrare

**Nimic nu e gata până nu se vede publicat.** (de 7 ori) Nu spun că ceva e live până
n-am rulat o comandă care recitește pagina publicată și arată valoarea nouă în ea.

**Fiecare rând de tabel poartă linkul lui.** Un rând fără URL îl costă o căutare.

**Răspuns scurt, verdictul primul.** Dacă întreabă a doua oară același lucru, prima
explicație a fost prea lungă — o tai, nu o reformulez mai pe larg.

**Nu las cod mort în commit** și nu las o secțiune greșită deasupra celei corecte.

---

## 7. Apartamentul de investiție, Sibiu — reguli de căutare

Apartamentul e pentru închiriat: vrea banii înapoi cât mai repede, într-o zonă
căutată, cu chirie mare (2026-10-26). Regulile vin din ghiduri de investiții
citite pe 2026-10-26; sursa e la fiecare. Ce scrie „presupunere" nu e din sursă.

1. **Clasez pe ani de recuperare NETI, nu pe preț.** Ani = (preț + renovare) ÷ chiria netă pe an. Net = chirie × 12 − impozit − luni goale − întreținere. În Sibiu, randamentul brut e ~4,5–7%, iar cel net ~3–4% ([capital.ro](https://www.capital.ro/mitul-chiriei-sigure-cat-ramane-in-mana-dupa-toate-costurile-in-2026.html)). Formula: [playtech.ro](https://playtech.ro/2025/cum-se-calculeaza-randamentul-investitiei-intr-un-apartament-in-cati-ani-trebuie-amortizata-cheltuiala-din-chirie/).
2. **Impozitul pe chirie:** 10% din venitul net, după o deducere forfetară de 20%, adică ~8% din chirie ([ANAF](https://static.anaf.ro/static/10/Galati/cedarea_folosintei.pdf)). Pentru 2026 sursele se contrazic: un proiect de lege duce deducerea la 30% ([capital.ro](https://www.capital.ro/obligatii-noi-din-2026-pentru-proprietarii-de-locuinte-impozit-marit-si-reguli-la-chirii-se-cere-inclusiv-bon-fiscal.html), [newsweek.ro](https://newsweek.ro/economie/impozit-chirii-2026-dispar-norme-venit-proprietari)). Neverificat în Codul fiscal.
3. **Lunile goale sunt un cost, nu o excepție.** Câteva luni goale pe an pot inversa clasamentul ([capital.ro](https://www.capital.ro/mitul-chiriei-sigure-cat-ramane-in-mana-dupa-toate-costurile-in-2026.html)). Presupunere implicită: 1 lună goală pe an. Test de stres: mai merge cu 3 luni goale sau cu chiria −10%?
4. **Chiria se compară cu apartamente de aceeași mărime din aceeași zonă,** nu cu mediana cartierului. Unitățile mici au randament mai mare, dar chiriașii se schimbă mai des, deci mai multe luni goale ([propertyinvestmentsuk](https://www.propertyinvestmentsuk.co.uk/perfect-buy-to-let/)). Un 2 camere de 30 mp nu ia mediana unui 2 camere de 50 mp.
5. **Chiria cerută nu e chiria încasată.** Cererea se vede în cât de repede dispar anunțurile de închiriat din cartier, nu în câte sunt. Multe anunțuri de închiriat înseamnă concurență.
6. **2 camere e tipul cel mai lichid în Sibiu.** Cerere tot anul, vârf la începutul anului universitar ([antena3.ro](https://www.antena3.ro/continut-platit/piata-chiriilor-din-sibiu-in-2026-cerere-sustinuta-in-timp-ce-cresterea-preturilor-de-vanzare-pierde-ritm-798253.html), conținut plătit de o agenție). ULBS a ocupat ~4.000 de locuri la admiterea din iulie 2026, cu 14% mai mult ca anul trecut ([agerpres](https://agerpres.ro/comunicate/2026/08/05/comunicat-de-presa---universitatea-lucian-blaga-din-sibiu--1582380)). Ce cartiere sunt aproape de facultăți: neverificat, de stabilit pe hartă, nu din memorie.
7. **Locația pe care o plătește un chiriaș:** pe jos până la magazine, transport și centru. Zonele degradate aduc chiriași slabi ([saga.co.uk](https://www.saga.co.uk/magazine/money/property/letting/five-things-that-make-a-good-buy-to-let-property)).
8. **Gata de închiriat sau de renovat:** renovarea intră în preț înainte de calculul anilor ([moneytothemasses](https://moneytothemasses.com/owning-a-home/the-buy-to-let-guide/amp)). Igrasia e blocker (regula de mai sus), nu cost de renovare.
9. **„Ideal investiție” și „randament garantat” din anunț nu sunt argumente** ([wall-street.ro](https://www.wall-street.ro/articol/Real-Estate/248223/de-ce-sa-fugi-de-ideal-investitie-si-randament-garantat-la-anunturi-imobiliare.html)). Cifrele de randament de la dezvoltatori vin de la vânzători ([bursa.ro](https://www.bursa.ro/dezvoltatorii-imobiliari-peste-30-procente-din-vanzarile-apartamentelor-noi-sunt-cu-scop-de-investitie-41988837)).
10. **Înainte de ofertă:** extras CF, datoriile și costurile asociației de proprietari, starea blocului, apoi vizionare în persoană ([op.fi](https://www.op.fi/en/private-customers/themes/housing/dreaming-of-getting-a-buy-to-let-home)). Administrarea (plăți întârziate, chiriași dificili) e un cost real ([wall-street.ro](https://www.wall-street.ro/articol/Money/213998/sfaturi-imobiliare-ce-trebuie-sa-ai-in-vedere-inainte-de-a-investi-in-locuinte.html)).

**Ce face azi `azi.js` din regulile astea:** 1 pe brut și 4. Chiria estimată = chiria pe mp din oraș (`tools/chirii-mp.json`, OLX: 7,45 €/mp, 36 de anunțuri, 2026-10-26) × factorul cartierului × mp, plafonată la mediana cartierului. Mihai a prins asta: 450 € pe un 30 mp în Țiglari e mediana cartierului, nu chiria lui. Regulile 2 și 3 scad toți anii în aceeași proporție, deci nu schimbă ordinea. Regula 5 cere chirii pe anunț cu dată (`tools/chirii.js` salvează doar mediane).

## Ce caută Mihai

Criteriile complete sunt în memoria `de-cumparat-criterii-cumparare`. Pe scurt:
casă mică cu **grădină verde** în orașul Sibiu, minim 100 mp curte **proprie confirmată**,
fără două corpuri, bucătăria accesibilă din interior. Buget 250.000 € pentru tot.

**Nu vrea chiriaș în curte.** A spus-o pe 3 octombrie 2026. Garsoniera din Berzelor nu
mai e un argument.
