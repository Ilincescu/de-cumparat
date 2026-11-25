# Raport 25 nov 2026

**Rulare din cloud** (sarcina programata, fara laptop). Au lipsit **imobiliare.ro** (403 din cloud) si **Facebook Marketplace** (cere login din cloud), adica pasii b), c), e) si f), case si chirii. Verificarea VPN cu ipinfo.io a fost sarita: iesirea e prin Google Cloud.

**Surse citite:** Storia (case, apartamente, chirii; buildId nou luat singur de scan.js), Autovit (plus dorintele), publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX case si OLX chirii cu Playwright (script Node). Linkurile moarte au fost verificate.

**Din browser:**
- OLX case: 73 de anunturi OLX, 71 cu descriere. 20 in oras, 8 trec filtrele, 0 noi.
- OLX chirii: 114 (113 deschise), 76 intrate in chirii-externe.

**Liste:** case 420 -> 430, apartamente 552 -> 578, masini 956 -> 970, biciclete 25.
- publica.js: 11 anunturi moarte scoase, 171 noi; curata.js a scos apoi 125 (date.json 1.133 -> 1.008).
- Linkuri: date.json 656 vii, 11 moarte, 306 incerte (lasate in lista); masini.json 502 vii, 457 moarte, 11 incerte; biciclete 7 vii, 15 moarte, 3 incerte.
- Surse fara browser: publi24 37 trec filtrele, lajumate 28, ambele 0 noi; agentii 8, 1 noua (casa renovata cu 4 camere in Gusterita, 229.500 €, azura-estate.ro); licitatii si ANAF 0 case.
- Dorinte: Ford SUV verde 22 de anunturi (cel mai ieftin 19.850 €), MG EHS plug-in 18 (cel mai ieftin 16.490 €).

**Storia, 24 -> 25 nov:** 119 anunturi "noi", 23 disparute, 14 preturi schimbate. Snapshotul a crescut de la 1.336 la 1.476: cele mai multe "noi" sunt anunturi care lipsisera ieri din cautare si au revenit (intre ele si IDGXS9, deja respins, si casa de pe Piata Cluj IDGPlk). Scaderi mici: casa cu 3 camere in Gusterita 130.000 -> 129.000 €; apartament cu 3 camere in Mihai Viteazul 99.500 -> 91.500 €.

**Respinse azi: 0.** Casa cu 4 camere din Terezian (IDEqhl), pe locul 1 ieri, a fost respinsa ieri de Mihai dupa vizionare (cladire impartita cu un magazin de asigurari in fata); a iesit din top.

**Poze din top:** am luat pozele din pagina HTML a fiecarui anunt (`__NEXT_DATA__`) si le-am vazut pe toate.
- casa cu 2 camere din Terezian (zona Marmelada), 90 mp utili, 198 mp construiti, teren 450 mp, 180.000 € (revenita in top; disparuse pe 22 nov) - 5 din 5 poze, mici - fara igrasie vizibila, dar pozele sunt putine si slabe. Dupa agentie: caramida, 1980, tigla, **incalzire cu sobe pe gaz**, pivnita sub jumatate de casa cu acces din curte, anexa si fundatie pentru o constructie de ~100 mp. Curtea din poza e pavata cu dale, cu vita de vie si o magazie in fund. Nu e aceeasi casa cu IDEqhl (alte camere, alt an), desi are tot 450 mp si tot MAAC - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 4 camere din Gusterita, 146 mp, 199.000 € - 9 din 9 poze (aceleasi) - fara igrasie, fara demisol; fara poza cu fatada - https://www.storia.ro/ro/oferta/cas-4-camere-guteria-sibiu-146-mp-teren-326-mp-IDI2JG
- casa cu 2 camere ultracentral (Centrul Civic), 55 mp, 129.000 € - 7 din 7 poze (aceleasi ca pe 23 nov) - fara igrasie vizibila; subsol partial; doua usi alaturate pe fatada dinspre curte, de intrebat - https://www.storia.ro/ro/oferta/cas-cu-curte-n-sibiu-ultracentral-82-mp-IDFPwD
- apartamentul din Lazaret, 36 mp, 54.000 € - 8 din 8 poze (aceleasi, mici) - doua camere de locuit; neconcludent la igrasie - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lazaret-IDBcBD
- apartamentul la etajul 1 al unei case din Centrul Istoric, 49 mp, 72.900 € - 9 din 9 poze (aceleasi) - curat - https://www.storia.ro/ro/oferta/apartament-etajul-1-la-casa-cu-2-camere-in-zona-centrala-din-sibiu-IDIZ4M
- apartamentul de la parterul unui bloc langa Lacul lui Binder (Tiglari), 38 mp, 58.400 € (nou in top) - 6 din 6 poze - proaspat renovat, fara igrasie, fara scara interioara, fara subsol. In poze se vad o camera cu geam si o camera ingusta (cu frigider), plus nisa de bucatarie, hol si baie; agentia scrie "nedecomandat". **De verificat la vizionare** ca a doua camera e de locuit, nu o bucatarie. Aceeasi agentie si acelasi bloc ca IDIp0J de ieri (40 mp, 65.000 €), dar alt apartament (alte poze, alt cod) - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lacul-lui-binder-IDIp0Z

**Masini, top:** Sandero Stepway 2021, 29.763 km, Bascov, 9.999 €; Sandero Stepway 2020, 79.000 km, Selimbar, 6.690 € (adusa din Germania); Sandero Stepway 2022, 82.000 km, Bucuresti, 9.257 €.

**Ce a picat:** nimic din scripturi; update.js a urcat singur commit-ul de date. imobiliare.ro si Facebook n-au fost citite si raman in ultima-rulare.json ca lipsa_browser.
