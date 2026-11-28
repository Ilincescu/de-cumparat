# Raport 28 nov 2026

**Rulare din cloud** (sarcina programata, fara laptop). Au lipsit **imobiliare.ro** (403 din cloud) si **Facebook Marketplace** (cere login din cloud), adica pasii b), c), e) si f), case si chirii. Verificarea VPN cu ipinfo.io a fost sarita: iesirea e prin Google Cloud.

**Surse citite:** Storia (case, apartamente, chirii), Autovit (plus dorintele), publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX case si OLX chirii cu Playwright (script Node). Linkurile moarte au fost verificate.

**Din browser:**
- OLX case: 73 de anunturi OLX, 71 cu descriere. 17 in oras, 7 trec filtrele, 1 noua: "Case de vanzare sibiu", 139.999 € - https://www.olx.ro/d/oferta/case-de-vanzare-sibiu-IDhu4tK.html
- OLX chirii: 109 (108 deschise), 78 intrate in chirii-externe. Am aplicat regula noua din prompt-zilnic.txt (oprire abia dupa 4 pagini la rand fara anunturi noi); ieri, cu oprirea la prima pagina fara noi, ieseau doar 27.

**Liste:** case 438 -> 436, apartamente 579 -> 582, masini 991 -> 998, biciclete 25.
- publica.js: 8 anunturi moarte scoase, 133 noi; curata.js a scos apoi 126 (date.json 1.144 -> 1.018).
- Linkuri: date.json 697 vii, 8 moarte, 314 incerte (lasate in lista); masini.json 487 vii, 497 moarte, 14 incerte; biciclete 7 vii, 15 moarte, 3 incerte.
- Surse fara browser: publi24 38 trec filtrele, 1 noua (casa in Tocile, 162.000 €, https://www.publi24.ro/anunturi/imobiliare/de-vanzare/case/case-vile/anunt/vand-casa-in-tocile/i9g756i3251976h01153969447ii8fd0.html); lajumate 27, agentii 9, ambele 0 noi; licitatii si ANAF 0 case. Chirii publi24: 126 (ieri 162, alaltaieri 228; in scadere).
- Dorinte: Ford SUV verde 23 de anunturi (cel mai ieftin 19.500 €), MG EHS plug-in 22 (cel mai ieftin 16.490 €).

**Storia, 27 -> 28 nov:** 12 anunturi noi (niciuna casa), 29 disparute, 16 preturi schimbate (snapshot 1.493 -> 1.479).
- case: casa cu demisol + parter, 130 mp, 205.000 -> 195.000 €; "casa formata din 2 apartamente" in Turnisor, 215.000 -> 189.900 € (cladire impartita, nu intra in top).
- apartamente: doua anunturi de 2 camere decomandat in Vasile Aaron, 110.000 -> 102.000 €; un 2 camere in zona Rahovei a crescut 90.000 -> 110.000 €.

**Respinse azi: 0.**

**Poze din top:** topul de case e acelasi; la apartamente, pe locul 3 a revenit IDIp0J in locul lui IDIp0Z (IDIp0Z e tot activ si in date.json, doar a coborat in clasament). Am verificat in pagina fiecarui anunt (`__NEXT_DATA__`) ca numarul de poze si pretul sunt aceleasi ca la verificarea completa (IDIp0J vazut pe 24 nov., restul pe 23-25 nov.).
- casa cu 2 camere din Terezian (zona Marmelada), 90 mp, teren 450 mp, 180.000 € - 5 poze; sobe pe gaz, pivnita - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 4 camere din Gusterita, 146 mp, 199.000 € - 9 poze - https://www.storia.ro/ro/oferta/cas-4-camere-guteria-sibiu-146-mp-teren-326-mp-IDI2JG
- casa cu 2 camere ultracentral (Centrul Civic), 55 mp, 129.000 € - 7 poze; doua usi pe fatada dinspre curte, de intrebat - https://www.storia.ro/ro/oferta/cas-cu-curte-n-sibiu-ultracentral-82-mp-IDFPwD
- apartamentul din Lazaret, 36 mp, 54.000 € - 8 poze - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lazaret-IDBcBD
- apartamentul la etajul 1 al unei case din Centrul Istoric, 49 mp, 72.900 € - 9 poze - https://www.storia.ro/ro/oferta/apartament-etajul-1-la-casa-cu-2-camere-in-zona-centrala-din-sibiu-IDIZ4M
- apartamentul de la parterul unui bloc langa Lacul lui Binder (Tiglari), 40 mp, 65.000 € - 8 poze; fara igrasie, doua camere de locuit (living si dormitor) - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lacul-lui-binder-IDIp0J

**Masini, top (schimbat):** Renault Captur 2020, 95.000 km, Drobeta-Turnu Severin, 9.999 €; VW T-Cross 1.0 TSI DSG 2022, 50.665 km, Bucuresti, 7.300 € (pret mic pentru an si km - de verificat daca e leasing sau avarie inainte de orice telefon); Sandero Stepway 2021, Bascov, 9.999 €.

**Ce a picat:** nimic; niciun script nu s-a oprit, update.js a urcat singur commit-ul de date, iar OLX a revenit la volumul obisnuit. imobiliare.ro si Facebook n-au fost citite si raman in ultima-rulare.json ca lipsa_browser.
