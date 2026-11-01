# Raport 1 nov 2026

**Surse:** toate. Storia, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX, imobiliare.ro si Facebook (case si chirii) din browser, toate salvate azi (`tools/ultima-rulare.json`: nimic esuat, niciun fisier lipsa). Reluarea dupa 31 oct, cand lipsisera toate cele sase fisiere din browser.

**Cum s-au luat sursele din browser azi:** `browser_evaluate` si `browser_run_code_unsafe` nu erau permise in sesiune, asa ca datele s-au scos din snapshoturile paginilor (navigare pagina cu pagina), nu cu fetch in pagina. OLX case: 25 de pagini, 71 de anunturi OLX (restul copii Storia). imobiliare.ro case: 24 de pagini, 250 sub 250.000 €. OLX chirii: 20 de pagini, 104 anunturi. imobiliare.ro chirii: 21 de pagini, 627. Facebook: fara derulare (nici tastatura nu era permisa), deci doar primele carduri - 22 de case si 14 chirii.

**Adaugate: 9** (8 case, 1 apartament):
- 85.000 € - casa la 300 m de Piata Mica (OLX) - https://www.olx.ro/d/oferta/casa-de-vanzare-in-sibiu-la-300-m-de-piata-mica-IDl1pv9.html
- 85.000 € - casa 2 camere, central, mansarda si terasa (Storia) - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-central-mansard-i-teras-IDJ4OV
- 95.900 € - casa 3 camere, Turnisor (imobiliare.ro) - https://www.imobiliare.ro/oferta/casa-de-vanzare-sibiu-turnisor-3-camere-276143525
- 129.000 € - casa cu curte, ultracentral, 82 mp (imobiliare.ro) - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-ultracentral-2-camere-276015430
- 179.999 € - duplex singur in curte, Piata Cluj (OLX) - https://www.olx.ro/d/oferta/vand-duplex-in-sibiu-singur-in-curte-zona-piata-cluj-IDkyKNu.html
- 199.990 € - casa duplex, zona foarte centrala (OLX) - https://www.olx.ro/d/oferta/vand-casa-zona-foarte-centrala-IDkK3RN.html
- 205.000 € - duplex 113 mp + 400 mp teren, Gusterita (Facebook) - https://www.facebook.com/marketplace/item/2472986393192709/
- 234.900 € - casa 4 camere mobilata, Gusterita (imobiliare.ro) - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-gusterita-mobilata-4-camere-276151686
- 79.999 € - apartament 2 camere, Vasile Aaron (Storia) - https://www.storia.ro/ro/oferta/apartament-de-vanzare-cu-2-camere-balcon-pivnita-vasile-aaron-IDJ4I6

**Sterse: 5** - casa de 125.000 din Tiglari/Terezian si apartamentele de 79.999 (Vasile Aaron), 86.000 (Vasile Aaron), 85.000 (central, cu gradina) si 92.000 (Hipodrom III).

**Pret schimbat: 1** - apartamentul nou mobilat din Turnisor a crescut de la 89.500 la 93.000 €: https://www.storia.ro/ro/oferta/apartament-2-camere-mobilat-constructie-noua-boxa-turnisor-sibiu-IDIyaI

**Total pe site (citit live):** 386 case, 634 apartamente.

**Capcane prinse azi:**
- Apartamentul de 79.999 din Vasile Aaron a fost sters si republicat cu alt cod (IDIJZZ -> IDJ4I6), acelasi titlu si pret.
- Casa de 85.000 de langa Piata Mica (OLX) si casa de 85.000 din centru (Storia) pot fi acelasi imobil; de verificat in poze.
- Scoase de mana din fisierele extrase, ca sa nu intre gresit in lista: un penthouse din Cartierul Arhitectilor (Facebook; filtrul de "casa" il lasa sa treaca din cauza cuvantului "house"), o casa in Apoldu de Jos (Facebook) si una in Pauca (OLX) - ambele localitati lipsesc din lista "in afara orasului".
- La OLX au cazut la filtre, dupa citirea descrierii: 3 case "doua corpuri" si 2 cu curte comuna.

**Poze: NEVERIFICATE.** Storia da 403 (CloudFront) si la fisa JSON a anuntului, si la pagina anuntului, si din node si din browser, desi reteaua e Digi si scanarea de dimineata a mers. `node tools/verifica.js` nu a putut descarca nicio poza pentru top 3 case si top 3 apartamente din azi.json, deci igrasia, scara interioara si subsolul nu au fost verificate azi.
