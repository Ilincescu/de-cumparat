# Raport 9 nov 2026

**Surse:** Storia, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; din browser OLX (case si chirii), imobiliare.ro (case si chirii). **Lipsa azi: Facebook, case si chirii** (`tools/ultima-rulare.json`: `lipsa_browser: facebook-raw.json, facebook-chirii.json`). La deschiderea anunturilor Facebook tab-ul s-a inchis si Playwright n-a mai raspuns; conform regulii, o singura incercare. Rularea de maine trebuie sa le ia (RELUARE).

**Inainte de rulare:** main avea deja rularea de 4 nov (facuta din alta parte), plus pagina Praga, Black Friday si regulile noi la masini (curea in ulei, utilitare). Clona locala avea o rulare de 4 nov nepublicata; am pus-o intr-un commit local si am adus main peste ea, ca update.js sa ruleze cu scripturile la zi.

**Din browser:**
- imobiliare.ro chirii: 627 din 627 (21 de pagini, a 22-a da 404 = sfarsitul listei).
- imobiliare.ro case: 685 citite (24 de pagini), 245 sub 250.000 €; din 44 alese de deschis s-au deschis 26, apoi 403. Limita a venit dupa ~72 de cereri, nu ~90 (scris in prompt).
- OLX case: 97 de anunturi OLX, 95 cu descriere.
- OLX chirii: 103 (87 cu mp, 70 cu cartier).

**Adaugate: 45** (23 case, 22 apartamente). Casele mai ieftine:
- 108.000 € - casa 3 camere, teren 300 mp, Turnisor (publi24) - https://www.publi24.ro/anunturi/imobiliare/de-vanzare/case/case-vile/anunt/casa-individuala-de-vanzare-3-camere-curte-400-mp-zona-turnisor/5548298e59827e9d1h174d9216347255.html
- 145.000 € - imobil P+E+M, Orasul de Jos (maac.ro) - https://www.maac.ro/casa-vila-3-camere-de-vanzare-orasul-de-jos-sibiu-cp1885192/
- 180.000 € - casa 2 camere, 90 mp, Terezian (imobiliare.ro; aceeasi cu cea de pe Storia din top) - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-terezian-mobilata-2-camere-276175940
- 189.999 € - casa 4 camere, 105 mp, curte libera 54 mp, Arhitectilor (publi24) - https://www.publi24.ro/anunturi/imobiliare/de-vanzare/case/case-vile/anunt/casa-4-camere-105-mpu-acces-auto-si-gradina-in-cartierul-arhitectilor/dg68e1034dd07g9i29hd85420ef4220i.html
- 198.000 € - casa 4 camere, Terezian (maac.ro) - https://www.maac.ro/casa-vila-4-camere-de-vanzare-terezian-sibiu-cp2643500/
- 204.990 € - casa cu teren 237 mp si garaj, Lupeni (publi24) - https://www.publi24.ro/anunturi/imobiliare/de-vanzare/case/case-vile/anunt/casa-individuala-de-vanzare-cu-teren-237-mp-garaj-in-zona-lupeni-sibiu/gg979f79353h775e1e2538916e990f1e.html
- Apartamentele noi: 63.000-109.900 €, cele mai ieftine 63.000 € Tiglari (https://www.storia.ro/ro/oferta/apartament-2-camere-de-vanzare-etaj-2-tiglari-sibiu-comision-0-IDJ7yE) si 69.990 € Ciresica (https://www.storia.ro/ro/oferta/apartament-2-camere-balcon-inchis-zona-ciresica-IDJ8WP).

**Sterse: 85** (20 case, 65 apartamente). Multe case MAAC au disparut de pe Storia si au reaparut azi pe maac.ro sau imobiliare.ro, cu acelasi pret (145.000, 198.000, 214.000, 230.000, 250.000).

**Pret schimbat: 23.** Scaderile mai mari:
- casa duplex Trei Stejari: 230.000 -> 199.999 € - https://www.storia.ro/ro/oferta/casa-tip-duplex-teren-335-mp-acces-auto-trei-stejari-IDHZQM
- casa 3 camere Lupeni (Black Friday): 239.000 -> 227.050 € - https://www.storia.ro/ro/oferta/cas-3-camere-de-vnzare-lupeni-sibiu-garaj-pivni-IDHM4l
- casa cu doua apartamente Turnisor: 200.000 -> 190.000 € - https://www.storia.ro/ro/oferta/casa-5-camere-curte-pivni-turnior-IDB5Vj
- apartament Doamna Stanca: 108.900 -> 99.500 € - https://www.storia.ro/ro/oferta/apartament-decomandat-43-mpu-2-camere-zona-doamna-stanca-sibiu-IDIQ3O
- apartament cu gradina, Lacul lui Binder: 90.000 -> 82.000 € - https://www.storia.ro/ro/oferta/apartament-de-vnzare-cu-grdin-zona-lacul-lui-binder-IDIR1F
- apartament 54 mp parter Terezian: 86.000 -> 81.000 € - https://www.storia.ro/ro/oferta/apartament-2-camere-parter-terezian-IDHj7K
- apartament la casa 36 mp: 59.000 -> 56.000 € - https://www.storia.ro/ro/oferta/apartament-la-cas-etaj-1-1-36-mp-utili-pivni-grdin-80-mp-IDHqcs

**Capcane prinse azi:**
- Casa mobilata din Gusterita (234.700 / 234.900 €) apare de 5 ori: de doua ori pe Storia, de doua ori pe publi24, o data pe imobiliare.ro.
- Apartamentul de 89.000 € din Strand 2 (Storia il pune la Tilisca): in poza baii se vede o balustrada de lemn in diagonala, adica o scara interioara. Respins.
- Apartamente noi "pe 2 niveluri" in Trei Stejari (87.900 si 99.500 €), de fapt 3 camere: nu intra.

**Poze (top 3 case si top 3 apartamente din azi.json):** `node tools/verifica.js` a dat 403 (Storia blocheaza IP-ul dupa scanare), deci din `arhiva/poze/`, cel mult 8 pe anunt:
- casa 2 camere, Terezian, 180.000 € - 5 arhivate - curata.
- casa Lazaret/Lupeni, 199.990 € - 8 arhivate - aceeasi pata deschisa pe hol, poza 7, langa usa; de verificat la vizionare.
- casa Piata Cluj - Kogalniceanu, 129.900 € - **0 poze arhivate, NEVERIFICATA.**
- apartament Gusterita, 75.000 € - 8 arhivate - curat.
- apartament Tiglari, 51.000 € - 6 arhivate - curat.
- apartament Strand 2, 89.000 € - 8 arhivate - **scara interioara (poza 7), respins**. In locul lui a intrat apartamentul de 65.000 € de la Lacul lui Binder - **0 poze arhivate, NEVERIFICAT.**
