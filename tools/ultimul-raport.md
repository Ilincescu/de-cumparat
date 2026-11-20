# Raport 20 nov 2026

**Surse:** Storia, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; din browser OLX (case si chirii), imobiliare.ro (case si chirii), Facebook (case si chirii). Iesire prin Digi (AS8708), nu prin VPN. Rularea din 18 nov a mers complet; pe 19 nov n-a fost rulare.

**Din browser:**
- imobiliare.ro chirii: 659 (22 de pagini, inaintea caselor). Pretul de pe card lipea numaratoarea pozelor ("1 / 13 380 €" -> 13380) la 23 de anunturi; corectat, si regula e acum in prompt.
- imobiliare.ro case: 743 citite, 274 sub 250.000 €. Dupa 22 + 25 de pagini, a doua deschidere de anunt a dat 403: azi limita a venit mai devreme decat de obicei (~50 de cereri). Raman cardurile.
- OLX case: 79 de anunturi OLX, 77 cu descriere.
- OLX chirii: 111 (88 cu mp).
- Facebook case: 52 de carduri cu case (din 393, restul haine, mobila, terenuri, parteneri); descriere pentru 14, cele care par case in oras. 5 dintre ele n-aveau titlul "Descriere" - textul era sub "Detalii"; reluate asa.
- Facebook chirii: 15, 14 cu descriere.

**Liste:** case 435 -> 444, apartamente 601 -> 594, masini 878 -> 907, biciclete 25.

**Storia, 18 -> 20 nov:** 64 de anunturi noi, 86 disparute, 12 preturi schimbate. Cele mai mari scaderi:
- casa de 130 mp din Centrul Istoric, de renovat, cu pod, 220.000 -> 213.000 € (doua anunturi)
- casa cu 3 camere, 88 mp, din Centrul Istoric, 150.000 -> 145.000 € (doua anunturi)
- casa de pe Strada Lunga, 110.000 -> 105.000 €
- apartamente: 2 camere in Tiglari, parter inalt, 52.000 -> 50.000 €; 2 camere de 36 mp in Hipodrom 1, 78.000 -> 74.999 €; 2 camere de 47 mp, 72.000 -> 68.999 €.

**Respinse azi dupa poze: 0**

**Dublura prinsa azi:** casa din Lupeni de 194.990 € (TABOO) si cea de 195.000 € (Tower Imob) sunt aceeasi casa - aceeasi mobila, aceeasi pivnita boltita, aceeasi curte cu vita. Stateau pe locurile 1 si 3. O agentie a pus pinul in Gusterita si terenul 122 mp (in loc de 237), asa ca gruparea automata n-avea cum s-o prinda. Am legat-o in date.json, iar `azi.js` tine acum cont de legaturile scrise de mana. Tot ea e casa care circula din septembrie la 205.000 € (8 anunturi): pretul a scazut cu 10.000 €.

**Poze din top:**
- casa cu 4 camere din Lupeni, 122 mp (demisol cu bucatarie si o camera, parter cu 3 camere), curte libera 134 mp, garaj, 194.990 € - 19 din 19 + 20 din 20 la anuntul-dublura, din pagina anuntului - curata; pivnita e boltita din caramida, uscata in poze; zidul vecinului din curte are o fisura - https://www.storia.ro/ro/oferta/casa-individuala-de-vanzare-cu-teren-237-mp-garaj-in-zona-lupeni-sibiu-IDJiCe
- casa cu 2 camere din Terezian, 90 mp, 180.000 € - 5 din 5 in arhiva - curata - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 4 camere din Terezian, 112 mp, teren 450 mp, 198.000 € - 6 din 6, din pagina anuntului - curata, dar are putine poze si niciuna cu casa din afara - https://www.storia.ro/ro/oferta/casa-individuala-i-4-camere-i-acces-auto-i-curte-i-terezian-IDEqhl
- apartamentul de 30 mp din Tiglari, parter, 47.000 € - 8 din 8 in arhiva - curat - https://www.storia.ro/ro/oferta/apartament-2-camere-parter-zona-tiglari-IDIvVP
- apartamentul de 77 mp din Centrul Istoric, cu gradina, 85.000 € - 7 din 7 in arhiva - fara igrasie, scara interioara sau subsol; tavanul din camera are fisuri - https://www.storia.ro/ro/oferta/apartament-cu-2-camere-77mp-utili-gradina-pivnita-debara-1100EUR-mp-IDHWoh
- apartamentul de 30 mp din Tiglari, parter, 49.990 € - 8 din 8 in arhiva - curat; tavan inclinat in hol si baie (sub scara blocului), fara scara interioara - https://www.storia.ro/ro/oferta/apartament-de-vanzare-cu-2-camere-in-zona-tiglari-sibiu-IDJejJ

`node tools/verifica.js` a dat 403 imediat dupa scanare. Casele fara poze in arhiva s-au luat dupa cateva minute din pagina HTML a anuntului (`__NEXT_DATA__`), toate pozele.

**Capcane prinse azi:**
- Masini: un BMW X5 din 2026 la 1 € iesise pe locul 1. `azi.js` scoate acum orice masina sub 3.000 € (pret de momeala sau avans). Noul loc 1, un RAV4 din 2023 cu 58.000 km la 10.000 €, e tot suspect de ieftin - de verificat inainte de orice telefon.
- Facebook: prima derulare aducea "Recomandarile de azi" in loc de rezultate; acum se colecteaza la fiecare pas si se pastreaza doar casele.
