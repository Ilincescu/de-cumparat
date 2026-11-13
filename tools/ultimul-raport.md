# Raport 13 nov 2026

**Surse:** Storia, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; din browser OLX (case si chirii), imobiliare.ro (case si chirii) si Facebook (case). Iesire prin Digi, nu prin VPN. Rularea din 12 nov a lipsit, deci diferentele de mai jos sunt pe doua zile (11 -> 13 nov).

**Lipsa: chiriile de pe Facebook.** Playwright a dat "Detached while handling command" la derulare. `tools/ultima-rulare.json` o trece la `lipsa_browser`, deci maine se reia.

**Din browser:**
- imobiliare.ro chirii: 638 (22 de pagini, inaintea caselor, din cauza limitei de cereri).
- imobiliare.ro case: 689 citite (24 de pagini, a 25-a da 404 = sfarsitul listei), 254 sub 250.000 €; 22 deschise din 56 noi fara curte comuna, duplex sau doua corpuri (cele mai ieftine), niciun 403.
- OLX case: 82 de anunturi OLX, 80 cu descriere.
- OLX chirii: 110 (89 cu mp, 81 cu cartier).
- Facebook case: 29 de carduri, 0 de la parteneri; 9 descrieri din 13 deschise.

**Liste:** case 400 -> 428, apartamente 588 -> 601, masini 817, biciclete 25.

**Storia, 11 -> 13 nov:** 113 anunturi noi, 80 disparute, 31 de preturi schimbate. Scaderi la case:
- casa cu 3 camere din Lupeni, 205.000 -> 195.000 € (acum pe locul 2 in top) - https://www.storia.ro/ro/oferta/cas-individual-cu-3-camere-curte-n-sibiu-zona-lupeni-IDIyH3
- casa cu gradina si pivnita din Terezian, 120.000 -> 110.000 €, dar curtea e de numai ~22 mp - https://www.storia.ro/ro/oferta/casa-cu-gradina-de-vanzare-si-curte-pivnita-zona-terezian-sibiu-IDJcB2
- casa pe un nivel de 141 mp din Turnisor, 195.000 -> 190.000 €
- casele din Gusterita (aceeasi casa listata de mai multe ori), 234.900 -> 229.900 €

**Respinse azi dupa poze si descriere: 6**
- casa din Turnisor cu pivnita si pod, 174.900 € - pete de umezeala pe peretele si tavanul dormitorului, tencuiala patata la baza fatadei - https://www.storia.ro/ro/oferta/casa-individuala-in-sibiu-pivnita-pod-teren-238-mp-zona-turnisor-IDFsCl
- aceeasi casa, la alta agentie, 174.900 € - aceleasi poze; dupa releveu, bucataria si baia sunt la subsol - https://www.storia.ro/ro/oferta/casa-individuala-cu-teren-de-238-mp-zona-turnisor-IDCPZh
- casa cu pivnita din Lazaret, 199.990 € - tencuiala cazuta si patata la baza peretelui de langa usa baii (poza 10). E pata pe care raportul din 11 nov o notase "de verificat" - https://www.storia.ro/ro/oferta/casa-individuala-teren-359-mp-pivnita-lazaret-IDGptL
- apartamentul de 39 mp din Tiglari, 49.500 € - pete negre de mucegai sub fereastra din dormitor (pozele 9 si 14) - https://www.storia.ro/ro/oferta/apartament-cu-2-camere-39-mp-zona-iglari-vizavi-de-lacul-lu-IDJ8oQ
- casa de pe strada Paltinului (zona Milea), 169.000 € - releveul arata "Corp A", deci are mai multe corpuri, si nu are nicio poza din interior - https://www.storia.ro/ro/oferta/casa-single-de-vanzare-sibiu-zona-milea-teren-329-mp-IDGlPb
- apartamentul la casa de pe Filarmonicii, 189.900 € - sunt doua locuinte (parter si etaj, fiecare cu bucatarie si baie) - https://www.storia.ro/ro/oferta/apartament-la-casa-i-3-camere-i-central-i-IDHk9t

**Poze din top (dupa respingeri):** `node tools/verifica.js` a dat 403. Pagina HTML a anuntului (`__NEXT_DATA__`) a mers, asa ca am vazut toate pozele, nu doar cele 8 din `arhiva/poze/`:
- casa cu 2 camere din Terezian, 180.000 € - 5 din 5 poze - curata - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 3 camere din Lupeni, 195.000 € - 20 din 20 - curata; bucataria si o camera sunt la demisol, uscate in poze - https://www.storia.ro/ro/oferta/cas-individual-cu-3-camere-curte-n-sibiu-zona-lupeni-IDIyH3
- casa cu 4 camere din Terezian, 198.000 €, teren 450 mp - 6 din 6 - curata, dar pozele sunt putine (fara bucatarie si pivnita) - https://www.storia.ro/ro/oferta/casa-individuala-i-4-camere-i-acces-auto-i-curte-i-terezian-IDEqhl
- apartamentul din Tiglari, 51.000 € - 6 din 6 - curat, fara scara si fara dezumidificatoare - https://www.storia.ro/ro/oferta/apartament-de-vnzare-2-camere-sibiu-tigllari-IDEAhs
- apartamentul de langa Lacul lui Binder, 65.000 € - 8 din 8 - curat - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lacul-lui-binder-IDIp0J
- apartamentul din Lazaret (Otelarilor), 54.000 € - 8 din 8 - curat - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lazaret-IDBcBD

**Capcane prinse azi:**
- Casa din Turnisor de 174.900 € e listata de doua agentii, cu acelasi teren si aceleasi poze. A doua copie a urcat in top imediat dupa ce am respins-o pe prima.
- Pe Facebook, daca stergi dialogurile din pagina de cautare, click-ul pe card deschide anuntul fara text. Regula din `tools/prompt-zilnic.txt` e corectata.
