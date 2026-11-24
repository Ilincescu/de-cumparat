# Raport 24 nov 2026

**Rulare din cloud** (sarcina programata, fara laptop). Au lipsit **imobiliare.ro** (403 din cloud) si **Facebook Marketplace** (cere login din cloud), adica pasii b), c), e) si f), case si chirii. Verificarea VPN cu ipinfo.io a fost sarita: iesirea e prin Google Cloud.

**Surse citite:** Storia (case, apartamente, chirii; buildId nou luat singur de scan.js), Autovit (plus dorintele), publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX case si OLX chirii cu Playwright (script Node). Linkurile moarte au fost verificate.

**Din browser:**
- OLX case: 90 de anunturi OLX, 88 cu descriere. 20 in oras, 8 trec filtrele, 1 noua: casa cu 3 camere si gradina de 574 mp, 110.000 € - https://www.olx.ro/d/oferta/casa-3-camere-gradina-574-mp-IDl8djS.html
- OLX chirii: 113 (112 deschise), 76 intrate in chirii-externe.

**Liste:** case 418 -> 420, apartamente 567 -> 552, masini 946 -> 956, biciclete 25.
- publica.js: 28 de anunturi moarte scoase, 118 noi; curata.js a scos apoi 109 (date.json 1.081 -> 972).
- Linkuri: date.json 659 vii, 28 moarte, 304 incerte (lasate in lista); masini.json 485 vii, 464 moarte, 7 incerte; biciclete 6 vii, 16 moarte, 3 incerte.
- Surse fara browser: publi24 37 trec filtrele, 1 noua (casa cu 4 camere in Gusterita, 229.900 €); lajumate 28, 0 noi; agentii 16, 4 noi; licitatii si ANAF 0 case.
- Atentie: printre cele 4 noi de la agentii e si "Casa moderna LOW-E" de pe maac.ro (159.000 €), respinsa ieri pe Storia ca IDGXS9 (fara teren). Respingerea e pe ID-ul Storia, deci copia de pe maac.ro a intrat in lista; nu e in top.
- Dorinte: Ford SUV verde 24 de anunturi (cel mai ieftin 19.850 €), MG EHS plug-in 19 (cel mai ieftin 16.490 €).

**Storia, 23 -> 24 nov:** 24 de anunturi noi, 82 disparute, 14 preturi schimbate (snapshot 1.387 -> 1.336).
- case noi: casa cu 4 camere in Gusterita, 140 mp, 229.900 € (https://www.storia.ro/ro/oferta/casa-individuala-4-camere-teren-300-de-mp-zona-gusterita-sibiu-IDJk3x); casa D+P+pod in Tiglari, 88 mp, 179.000 € (https://www.storia.ro/ro/oferta/casa-individuala-d-p-pod-teren-252-mp-baie-cu-geam-si-curte-in-sibiu-IDHW8J). Niciuna n-a intrat in top.
- cea mai mare scadere: casa cu 5 camere si teren de 250 mp in Gusterita, 195.000 -> 159.000 € (-36.000). Nu e in top.
- casa din Sadu, 250.000 -> 240.000 € (in afara orasului).

**Respins azi: 1 apartament**
- apartamentul la casa din Terezian, langa Parcul Terezian, 70 mp, 75.000 € (IDDZsA), intrat azi pe locul 1: tencuiala umflata si cazuta la baza peretelui in camera mare (poza 1), banda umeda la baza peretelui in dormitor (poza 2), pete si tencuiala cazuta in camera cu soba (pozele 6 si 11); tavanul bucatariei e spart (poza 3). Agentia scrie "pivnita uscata". Adaugat in tools/respinse.json, apoi am rulat `node tools/azi.js --scrie`. In locul lui a intrat IDIp0J.

**Poze din top:** am luat pozele din pagina HTML a fiecarui anunt (`__NEXT_DATA__`) si le-am vazut pe toate, la marime mare.
- casa cu 4 camere din Terezian, 112 mp, 198.000 € - 6 din 6 poze (aceleasi ca ieri) - fara igrasie vizibila; nicio poza cu fatada - https://www.storia.ro/ro/oferta/casa-individuala-i-4-camere-i-acces-auto-i-curte-i-terezian-IDEqhl
- casa cu 4 camere din Gusterita, 146 mp, 199.000 € - 9 din 9 poze (aceleasi ca ieri) - fara igrasie, fara demisol; nicio poza cu fatada; curtea din singura poza e pietris - https://www.storia.ro/ro/oferta/cas-4-camere-guteria-sibiu-146-mp-teren-326-mp-IDI2JG
- casa cu 5 camere din Turnisor, 240 mp, teren 350 mp, 200.000 € (noua in top) - 13 din 13 poze - fara igrasie vizibila; o singura casa (parter, etaj, mansarda), din 2010, de renovat dupa agentie. Curtea e mai mult pavata, cu iarba si pomi in spate. E mult peste banda de 70-100 mp - https://www.storia.ro/ro/oferta/cas-5-camere-de-vnzare-sibiu-turnior-240-mp-IDIcCf
- apartamentul din Lazaret, 36 mp, 54.000 € - 8 din 8 poze (aceleasi ca ieri, mici) - doua camere de locuit; neconcludent la igrasie - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lazaret-IDBcBD
- apartamentul la etajul 1 al unei case din Centrul Istoric, 49 mp, 72.900 € - 9 din 9 poze (aceleasi ca ieri) - curat; doua camere de locuit - https://www.storia.ro/ro/oferta/apartament-etajul-1-la-casa-cu-2-camere-in-zona-centrala-din-sibiu-IDIZ4M
- apartamentul de la parterul unui bloc langa Lacul lui Binder (Tiglari), 40 mp, 65.000 € (nou in top) - 8 din 8 poze - fara igrasie, fara scara interioara, fara subsol; doua camere de locuit (living si dormitor), bucatarie, baie; fara releveu. Nu seamana cu celelalte doua - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lacul-lui-binder-IDIp0J

**Masini, top:** Sandero Stepway 2021, 29.763 km, Bascov, 9.999 €; Sandero Stepway 2022, 82.000 km, Bucuresti, 9.257 €; Sandero Stepway 2022, 80.000 km, Bucuresti, 9.491 €.

**Ce a picat:** nimic din scripturi; update.js a urcat singur commit-ul de date. imobiliare.ro si Facebook n-au fost citite si raman in ultima-rulare.json ca lipsa_browser.
