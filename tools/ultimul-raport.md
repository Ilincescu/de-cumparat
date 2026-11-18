# Raport 18 nov 2026

**Surse:** Storia, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; din browser OLX (case si chirii), imobiliare.ro (case si chirii), Facebook (case si chirii). Iesire prin Digi (AS8708), nu prin VPN. Rularea de ieri a mers complet, deci azi nu e reluare.

**Din browser:**
- imobiliare.ro chirii: 596 (21 de pagini, inaintea caselor, din cauza limitei de cereri).
- imobiliare.ro case: 660 citite, 237 sub 250.000 €; 25 deschise din 121 noi (cele mai ieftine, fara curte comuna, duplex, doua corpuri si sate), niciun 403.
- OLX case: 78 de anunturi OLX, 76 cu descriere.
- OLX chirii: 113 (89 cu mp).
- Facebook case: 28 de carduri (2 de la parteneri, sarite); descriere pentru 12 din cele 16 care par case in oras. La celelalte 4 dialogul nu avea "Descriere".
- Facebook chirii: 12, dintre care 8 cu descriere.

**Liste:** case 427 -> 435, apartamente 583 -> 601, masini 860 -> 878, biciclete 25.

**Storia, 17 -> 18 nov:** 59 de anunturi noi, 33 disparute, 20 de preturi schimbate. Cele mai mari:
- casa cu teren de 335 mp langa Parcul Tineretului, 199.900 -> 185.000 € (doua anunturi, aceeasi scadere)
- casa quadruplex cu 4 camere, 221.000 -> 218.000 €
- La apartamente sunt scaderi mici (2.000-4.000 €): 2 camere cu gradina in Calea Preda 91.000 -> 87.000 €, 2 camere de 54 mp 99.000 -> 96.000 €.

**Respinse azi dupa poze: 1**
- casa din 1979 din Lupeni, str. Gh. Doja, 4 camere, 110 mp (parter plus demisol), 199.000 € - in dormitorul mic peretele are vopseaua umflata si cazuta sub geam, deasupra caloriferului, plus fisuri mari (poza 13); tavanul camerei mari e fisurat (poza 7, 19). Venise direct pe locul 1 in top - https://www.storia.ro/ro/oferta/casa-de-vanzare-in-sibiu-zona-lupeni-IDJgYD

**Poze din top (dupa respingere):**
- casa cu 2 camere din Terezian, 180.000 € - 5 din 5 vazute pe 13 nov - curata - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 3 camere din Lupeni, 195.000 € - 20 din 20 vazute pe 13 nov - curata - https://www.storia.ro/ro/oferta/cas-individual-cu-3-camere-curte-n-sibiu-zona-lupeni-IDIyH3
- casa cu 4 camere din Terezian, 198.000 € - 6 din 6 vazute pe 13 nov - curata, dar are putine poze - https://www.storia.ro/ro/oferta/casa-individuala-i-4-camere-i-acces-auto-i-curte-i-terezian-IDEqhl
- apartamentul de 30 mp din Tiglari, langa Simpa, parter, 47.000 € - 10 din 10 vazute azi - curat, renovat, cu centrala proprie; camerele sunt mici (9,6 si 12,8 mp) - https://www.storia.ro/ro/oferta/apartament-2-camere-parter-zona-tiglari-IDIvVP
- apartamentul de 77 mp din Centrul Istoric, cu gradina de 30 mp, 85.000 € - 7 din 7 in arhiva - fara igrasie, scara interioara sau subsol; tavanul din camera are fisuri (poza 2) - https://www.storia.ro/ro/oferta/apartament-2-camere-77-mp-si-gradina-de-30-mp-zona-centrala-IDHWoh
- apartamentul de 30 mp din Tiglari, parter, 49.990 € - 8 din 8 vazute azi - curat, cu centrala proprie; holul si baia au tavanul inclinat (par sub scara blocului), fara scara interioara - https://www.storia.ro/ro/oferta/apartament-de-vanzare-cu-2-camere-in-zona-tiglari-sibiu-IDJejJ

`node tools/verifica.js` a dat 403 imediat dupa scanare, iar cele trei anunturi noi n-aveau poze in arhiva. Pozele s-au luat din pagina HTML a anuntului (`__NEXT_DATA__`), toate descarcate.

**Capcane prinse azi:**
- Pretul de pe cardurile OLX a venit din nou lipit de CSS, a doua zi la rand. Acum `surse-case.js` taie singur textul de la ".css", deci nu mai depinde de curatarea manuala.
- Pe imobiliare.ro, pretul de pe card prindea uneori cifre din fata ("0225.000 €", ".150.000 €"); s-a curatat la extragere.
