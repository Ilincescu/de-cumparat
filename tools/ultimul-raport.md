# Raport 23 nov 2026

**Rulare din cloud** (sarcina programata, fara laptop). Au lipsit **imobiliare.ro** (403 din cloud) si **Facebook Marketplace** (cere login din cloud), adica pasii b), c), e) si f), case si chirii. Verificarea VPN cu ipinfo.io a fost sarita: iesirea e prin Google Cloud.

**Surse citite:** Storia (case, apartamente, chirii), Autovit (plus dorintele: Ford SUV verde si MG EHS plug-in), publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX case si OLX chirii cu Playwright (script Node). Linkurile moarte au fost verificate.

**Din browser:**
- OLX case: 90 de anunturi OLX, 88 cu descriere. 21 in oras, 8 trec filtrele, 0 noi.
- OLX chirii: 108 (107 deschise), 71 intrate in chirii-externe.

**Liste:** case 416 -> 417, apartamente 570 -> 567, masini 942 -> 946, biciclete 25 (ieri seara alta sesiune a scos casele din cladiri comune: 435 -> 416).
- publica.js: 3 anunturi moarte scoase, 109 noi; curata.js a scos apoi 108 (date.json 1.092 -> 984).
- Linkuri: date.json 681 vii, 3 moarte, 302 incerte (raspunsuri neclare, lasate in lista); masini.json 493 vii, 447 moarte, 6 incerte; biciclete 6 vii, 16 moarte, 3 incerte.
- Surse fara browser: publi24 36 trec filtrele, lajumate 28, agentii 14, toate 0 noi; 4 scoase de filtrul nou de cladire comuna; licitatii si ANAF 0 case.
- Dorinte: Ford SUV verde 24 de anunturi (cel mai ieftin 19.850 €), MG EHS plug-in 24 (cel mai ieftin 16.490 €).

**Storia, 22 -> 23 nov:** 2 anunturi noi, 10 disparute, 1 pret schimbat (snapshot 1.391 -> 1.387).
- noi: casa tip triplex in Terezian, 98 mp, 249.000 € (parte dintr-un triplex, deci cladire comuna) - https://www.storia.ro/ro/oferta/casa-tip-triplex-98-mp-utili-complet-mobilata-si-utilata-IDJjHq ; apartament de o camera, 44 mp, Centrul Istoric, 74.000 €.
- pret: casa de la proprietar, 229.900 -> 229.500 €.

**Respinse azi: 2 case**
- casa de pe Str. Infratirii 8, Piata Cluj, 117 mp, 198.000 € (IDHeWV): fatada la strada are doua usi, iar geamul din dreapta e al unui birou cu afise de asigurari si de masini in rate (poza 1). Regula noua "singur in cladire" spune ca o casa cu doua intrari e la fel ca o cladire comuna. Planul de amplasament (poza 8) arata o singura casa pe parcela de 433 mp; daca biroul e al proprietarului si iese odata cu el, casa poate reveni.
- "casa moderna LOW-E", 145 mp, 159.000 € (IDGXS9): nu e o casa de vanzare. E un model construit la comanda "oriunde in Romania sau Europa", iar descrierea scrie "TERENUL NU ESTE INCLUS".
Dupa fiecare respingere am rulat `node tools/azi.js --scrie`.

**Poze din top:** am luat pozele din pagina HTML a fiecarui anunt (`__NEXT_DATA__`) si le-am vazut pe toate, la marime mare.
- casa cu 4 camere din Terezian, 112 mp, 198.000 € - 6 din 6 poze (vazute si ieri) - fara igrasie vizibila; nicio poza cu fatada, deci nu se vede daca e singura in cladire - https://www.storia.ro/ro/oferta/casa-individuala-i-4-camere-i-acces-auto-i-curte-i-terezian-IDEqhl
- casa cu 4 camere din Gusterita, 146 mp, teren 326 mp, 199.000 € - 9 din 9 poze - fara igrasie, fara demisol; scara interioara spre etaj (e casa). Nicio poza cu fatada; singura poza din curte arata o fasie cu pietris, nu gradina - https://www.storia.ro/ro/oferta/cas-4-camere-guteria-sibiu-146-mp-teren-326-mp-IDI2JG
- casa cu 2 camere, ultracentral (Centrul Civic), 55 mp, teren 151 mp, 129.000 € - 7 din 7 poze - fara igrasie vizibila, dar camerele sunt proaspat varuite si goale, iar agentia scrie "subsol partial" (sub 150.000 €, deci permis). Curtea e verde. **De intrebat:** pe fatada dinspre curte sunt doua usi alaturate (una maro, una cu geam), poza 2; la stanga casei se lipesc alte corpuri de cladire - https://www.storia.ro/ro/oferta/cas-cu-curte-n-sibiu-ultracentral-82-mp-IDFPwD
- apartamentul din Tiglari, 30 mp, 49.990 € - 8 din 8 poze (vazute ieri) - curat; doua camere de locuit in poze; fara releveu - https://www.storia.ro/ro/oferta/apartament-de-vanzare-cu-2-camere-in-zona-tiglari-sibiu-IDJejJ
- apartamentul din Lazaret, 36 mp, 54.000 € - 8 din 8 poze, dar mici (800x600) - doua camere de locuit; fara scara interioara, fara subsol; vopsea ciupita pe muchia de langa usa de la intrare si tavan usor patat in camera gri, neconcludent; fara releveu - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lazaret-IDBcBD
- apartament la etajul 1 al unei case din Centrul Istoric, 2 camere, 49 mp, 72.900 € - 9 din 9 poze - fara igrasie, fara scara interioara, fara subsol; doua camere de locuit (dormitor si camera de zi cu centrala), bucatarie si baie cu dus; fara releveu. Nu seamana cu celelalte doua - https://www.storia.ro/ro/oferta/apartament-etajul-1-la-casa-cu-2-camere-in-zona-centrala-din-sibiu-IDIZ4M

**Masini, top:** Sandero Stepway 2021, 29.763 km, Bascov, 9.999 €; Sandero Stepway 2020, 79.000 km, Selimbar, acum 6.690 € (ieri 5.990; adusa din Germania, probabil neinmatriculata in Romania); Sandero Stepway 2022, 82.000 km, Bucuresti, 9.257 €.

**Ce a picat:** nimic din scripturi. update.js a urcat singur commit-ul de date (`git push` a mers fara gh). imobiliare.ro si Facebook n-au fost citite (vezi sus) si raman in ultima-rulare.json ca lipsa_browser.

## Completare de pe laptop (08:35)

Iesire prin Digi (nu VPN). Pasii a)-f) din browser, apoi `node tools/update.js` complet; lipsa_browser e acum gol.
- **imobiliare.ro chirii:** 644 de anunturi, 22 de pagini.
- **imobiliare.ro case:** 274 sub 250.000 € din 745. Din 140 necunoscute am incercat 13 descrieri; 403 dupa 2 (22 + 25 + 4 cereri in sesiune). Intrata in lista: casa cu 3 camere din Terezian, 70 mp, 71.250 € ("Black Friday"), fara descriere citita, deci curtea si cladirea sunt neverificate - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-terezian-mobilata-3-camere-275560947
- **Facebook case:** 1.154 de carduri cu casa/imobil/vila; 16 noi din oras, 16 din 16 cu descriere. Niciuna n-a intrat in lista.
- **Facebook chirii:** 13 carduri, 1 cu descriere.
- **OLX:** 90 de case (88 cu descriere) si 109 chirii, ca dimineata.
- **Top:** neschimbat fata de dimineata (aceleasi 3 case si 3 apartamente), deci pozele nu s-au mai verificat.
- Liste: case 417 -> 418, apartamente 567.
