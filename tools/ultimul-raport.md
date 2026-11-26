# Raport 26 nov 2026

**Rulare din cloud** (sarcina programata, fara laptop). Au lipsit **imobiliare.ro** (403 din cloud) si **Facebook Marketplace** (cere login din cloud), adica pasii b), c), e) si f), case si chirii. Verificarea VPN cu ipinfo.io a fost sarita: iesirea e prin Google Cloud.

**Surse citite:** Storia (case, apartamente, chirii), Autovit (plus dorintele), publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX case si OLX chirii cu Playwright (script Node). Linkurile moarte au fost verificate.

**Din browser:**
- OLX case: 72 de anunturi OLX, 70 cu descriere. 18 in oras, 7 trec filtrele, 0 noi.
- OLX chirii: 114 (113 deschise), 77 intrate in chirii-externe.

**Liste:** case 430 -> 429, apartamente 578 -> 578, masini 970 -> 982, biciclete 25.
- publica.js: 7 anunturi moarte scoase, 134 noi; curata.js a scos apoi 128 (date.json 1.135 -> 1.007).
- Linkuri: date.json 694 vii, 7 moarte, 307 incerte (lasate in lista); masini.json 505 vii, 465 moarte, 12 incerte; biciclete 7 vii, 15 moarte, 3 incerte.
- Surse fara browser: publi24 37 trec filtrele, lajumate 27, agentii 8, toate 0 noi; licitatii si ANAF 0 case.
- Dorinte: Ford SUV verde 22 de anunturi (cel mai ieftin 19.500 €), MG EHS plug-in 17 (cel mai ieftin 16.490 €).

**Storia, 25 -> 26 nov:** 22 de anunturi noi, 14 disparute, 7 preturi schimbate (snapshot 1.476 -> 1.488).
- casa noua: casa cu 3 camere langa Piata Cibin, 85 mp, 110.000 €, curte de ~71 mp dupa scanner (sub pragul de 100 mp, deci nu intra in top) - https://www.storia.ro/ro/oferta/casa-3-camere-piata-cibin-sibiu-IDwU5E
- cea mai mare scadere: casa individuala cu 5 camere, 180.000 -> 160.000 € (-20.000). Nu e in top.
- apartamente: 2 camere Semaforului 48 mp, 92.900 -> 89.900 €; 3 camere Cedonia 92.000 -> 89.900 €.

**Respinse azi: 0.**

**Poze din top:** topul de case si de apartamente e acelasi ca ieri. Am verificat in pagina fiecarui anunt (`__NEXT_DATA__`) ca numarul de poze si pretul nu s-au schimbat: aceleasi poze ca ieri, vazute deja toate, la marime mare.
- casa cu 2 camere din Terezian (zona Marmelada), 90 mp, teren 450 mp, 180.000 € - 5 poze, mici; sobe pe gaz, pivnita, curte pavata cu vita de vie - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 4 camere din Gusterita, 146 mp, 199.000 € - 9 poze; fara poza cu fatada; curtea din singura poza e pietris - https://www.storia.ro/ro/oferta/cas-4-camere-guteria-sibiu-146-mp-teren-326-mp-IDI2JG
- casa cu 2 camere ultracentral (Centrul Civic), 55 mp, 129.000 € - 7 poze; subsol partial; doua usi alaturate pe fatada dinspre curte, de intrebat - https://www.storia.ro/ro/oferta/cas-cu-curte-n-sibiu-ultracentral-82-mp-IDFPwD
- apartamentul din Lazaret, 36 mp, 54.000 € - 8 poze, mici; neconcludent la igrasie - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lazaret-IDBcBD
- apartamentul la etajul 1 al unei case din Centrul Istoric, 49 mp, 72.900 € - 9 poze; curat - https://www.storia.ro/ro/oferta/apartament-etajul-1-la-casa-cu-2-camere-in-zona-centrala-din-sibiu-IDIZ4M
- apartamentul de la parterul unui bloc langa Lacul lui Binder (Tiglari), 38 mp, 58.400 € - 6 poze; renovat; a doua camera e ingusta, de verificat ca e de locuit - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lacul-lui-binder-IDIp0Z

**Masini, top:** Sandero Stepway 2021, 29.763 km, Bascov, 9.999 €; Sandero Stepway 2020, 79.000 km, Selimbar, 6.690 € (adusa din Germania); Logan Stepway 2020, 24.240 km, Bucuresti, 8.500 € (nou pe locul 3).

**Ce a picat:** nimic din scripturi; update.js a urcat singur commit-ul de date. imobiliare.ro si Facebook n-au fost citite si raman in ultima-rulare.json ca lipsa_browser.
