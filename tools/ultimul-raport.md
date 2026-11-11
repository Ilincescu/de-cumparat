# Raport 11 nov 2026

**Surse:** toate. Storia, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; din browser OLX (case si chirii), imobiliare.ro (case si chirii) si Facebook (case si chirii). `tools/ultima-rulare.json`: nimic esuat, nimic lipsa din browser. Iesire prin Digi, nu prin VPN.

**Din browser:**
- imobiliare.ro chirii: 638 din 638 (22 de pagini, a 23-a da 404 = sfarsitul listei).
- imobiliare.ro case: 712 citite (24 de pagini), 260 sub 250.000 €; 17 deschise (casele din oras, fara curte comuna, duplex sau doua corpuri, cele mai ieftine), niciun 403.
- OLX case: 91 de anunturi OLX, 89 cu descriere.
- OLX chirii: 106 (88 cu mp, 75 cu cartier).
- Facebook case: cautarea "casa de vanzare" a dat 48 de carduri, aproape toate apartamente si obiecte. Am mai cautat "casa de vanzare sibiu" si "vand casa": 5 case din zona, cu descriere.
- Facebook chirii: 10, 3 cu descriere.

**Adaugate: 5** (4 case, 1 apartament):
- 49.500 € - apartament 2 camere, 39 mp, Tiglari (Storia, nou azi) - https://www.storia.ro/ro/oferta/apartament-cu-2-camere-39-mp-zona-iglari-vizavi-de-lacul-lu-IDJ8oQ
- 220.000 € - casa 3 camere, 140 mp, Lazaret (imobiliare.ro; a disparut azi de pe Storia la acelasi pret) - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-lazaret-3-camere-275994823
- 225.000 € - casa singura in curte, 100 mp, teren 585 mp, Turnisor (Facebook, proprietar) - https://www.facebook.com/marketplace/item/1759925495143442/
- 234.900 € - casa mobilata 4 camere, Gusterita (imobiliare.ro; aceeasi casa de 5 ori, vezi raportul din 9 nov) - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-gusterita-mobilata-4-camere-276175593
- 249.000 € - casa individuala, Gusterita (imobiliare.ro) - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-gusterita-3-camere-276123560

**Sterse: 6** (2 case, 4 apartamente):
- casa noua, Cartierul Arhitectilor, 219.990 € - https://www.storia.ro/ro/oferta/casa-cartierul-arhitectilor-de-vanzare-noua-pivnita-teren-250-IDIacj
- casa 3 camere Lazaret, 220.000 € (Storia; ramane pe imobiliare.ro) - https://www.storia.ro/ro/oferta/cas-3-camere-de-vnzare-sibiu-lazaret-140-mp-IDIv41
- apartamente: Hipodrom 1 107.000 €, Aleea Rosiorilor 64.000 €, Tiglari 47.999 € si Tiglari 28 mp 47.500 €.

**Pret schimbat: 0.**

**Capcane prinse azi:**
- Din cele 7 anunturi noi de pe Storia, 6 sunt republicari ale celor disparute azi, cu alt ID (garsonierele din Centrul Istoric si Lazaret, apartamentul de 88.000 € din Strand).
- Apartamentul de 47.999 € din Tiglari, Lacul lui Binder, a disparut azi, iar cel nou de 49.500 € e tot in Tiglari, vizavi de Lacul lui Binder. Poate fi acelasi, republicat mai scump.
- Pe Facebook, casa de renovat din Turnisor (139.000 €) are "2 intrari separate", deci e de fapt pe doua locuinte, iar casa noua din Gusterita (320.000 €) se preda la alb si e peste buget. Niciuna nu a intrat in lista.

**Poze (top 3 case si top 3 apartamente din azi.json):** `node tools/verifica.js` a dat 403, si din browser (Storia blocheaza IP-ul dupa scanare), deci le-am luat din `arhiva/poze/`, cel mult 8 pe anunt:
- casa 2 camere, Terezian, 180.000 € - 5 din 5 arhivate - curata.
- casa Lazaret/Lupeni, 199.990 € - 8 din 8 arhivate - aceeasi pata deschisa pe hol, langa usa, in poza 7; de verificat la vizionare.
- casa Piata Cluj - Kogalniceanu, 129.900 € - **0 poze arhivate, NEVERIFICATA** (a treia zi la rand).
- apartament Tiglari, 49.500 € (nou azi) - **0 poze arhivate, NEVERIFICAT.**
- apartament Tiglari, 51.000 € - 6 arhivate, plus 7 la aceeasi locuinta publicata de alta agentie - curat, fara scara si fara dezumidificatoare.
- apartament Lacul lui Binder, 65.000 € - **0 poze arhivate, NEVERIFICAT.**
