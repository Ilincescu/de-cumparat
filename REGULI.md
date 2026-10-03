# Regulile proiectului

Fiecare regulă de aici vine dintr-o greșeală pe care am făcut-o și pe care Mihai a
prins-o. În paranteză, de câte ori am repetat-o înainte să fie scrisă.

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

## Ce caută Mihai

Criteriile complete sunt în memoria `de-cumparat-criterii-cumparare`. Pe scurt:
casă mică cu **grădină verde** în orașul Sibiu, minim 100 mp curte **proprie confirmată**,
fără două corpuri, bucătăria accesibilă din interior. Buget 250.000 € pentru tot.

**Nu vrea chiriaș în curte.** A spus-o pe 3 octombrie 2026. Garsoniera din Berzelor nu
mai e un argument.
