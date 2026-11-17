# Raport 17 nov 2026

**Surse:** Storia, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; din browser OLX (case si chirii), imobiliare.ro (case si chirii), Facebook (case si chirii). Iesire prin Digi (AS8708), nu prin VPN. Ultima rulare a fost pe 13 nov, deci diferentele sunt pe patru zile (13 -> 17 nov).

**Reluare de pe 13 nov:** chiriile de pe Facebook, care lipsisera, s-au citit azi.

**Din browser:**
- imobiliare.ro chirii: 672 (23 de pagini, inaintea caselor, din cauza limitei de cereri).
- imobiliare.ro case: 714 citite, 261 sub 250.000 €; 23 deschise din 135 noi (fara curte comuna, duplex, doua corpuri, sate, spatii comerciale; cele mai ieftine), niciun 403.
- OLX case: 83 de anunturi OLX, 81 cu descriere.
- OLX chirii: 115 (92 cu mp).
- Facebook case: 81 de carduri, aproape toate din alte judete; doar 2 din judetul Sibiu (un apartament la casa pe str. Rennes si o casa in Sorostin), ambele cu descriere.
- Facebook chirii: 6 gasite, 4 pastrate (Turnisor, Dioda, Magnolia si unul fara zona, 350-400 €). Scoase: un apartament cu 3 dormitoare si o casa in Selimbar.

**Probleme la rulare, rezolvate:**
- Prima rulare `update.js` (08:17): Storia a dat 403 la cautare, apoi a mers la a doua incercare. Scanarea s-a refacut si `update.js` a rulat din nou (08:27).
- `tools/urmarire-chirii.js` cadea fiindca primea `{n, out}` in loc de lista. Acum le accepta pe amandoua, ca `chirii-externe.js`.

**Liste:** case 428 -> 427, apartamente 601 -> 583, masini 817 -> 860, biciclete 25.

**Storia, 13 -> 17 nov:** 59 de anunturi noi, 121 disparute, 44 de preturi schimbate. La case:
- casa cu 3 camere si garaj din cartierul Resita, 204.900 -> 194.900 €
- La apartamente sunt mai ales scaderi mici (2.000-4.000 €) in Vasile Aaron si la Lacul lui Binder. Garsonierele din Vasile Aaron au scazut toate la 48.500 €.

**Respinse azi dupa poze: 1**
- casa sasesca din Turnisor, 4 camere, 112 mp, 180.000 € - interiorul e renovat si curat, dar fatada dinspre curte are tencuiala cazuta si peticita (poza 12), iar zidurile de la intrare au pete la baza (poza 11). Venise direct pe locul 1 in top - https://www.storia.ro/ro/oferta/casa-cu-4-camere-singur-in-curte-de-vanzare-in-sibiu-zona-linistita-IDJeJ6

**Poze din top (dupa respingere):**
- casa cu 2 camere din Terezian, 180.000 € - 5 din 5 poze vazute pe 13 nov - curata - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 3 camere din Lupeni, 195.000 € - 20 din 20 vazute pe 13 nov - curata - https://www.storia.ro/ro/oferta/cas-individual-cu-3-camere-curte-n-sibiu-zona-lupeni-IDIyH3
- casa cu 4 camere din Terezian, 198.000 € - 6 din 6 vazute pe 13 nov - curata, dar are putine poze - https://www.storia.ro/ro/oferta/casa-individuala-i-4-camere-i-acces-auto-i-curte-i-terezian-IDEqhl
- apartamentul de 77 mp din Centrul Istoric, cu gradina de 30 mp, 85.000 € - 7 din 7 in arhiva - fara igrasie, scara interioara sau subsol; e la parter intr-o curte veche cu mai multe locuinte, iar tavanul din camera are fisuri in tencuiala (poza 2) - https://www.storia.ro/ro/oferta/apartament-2-camere-77-mp-si-gradina-de-30-mp-zona-centrala-IDHWoh
- apartamentul din Tiglari, 51.000 € - 6 din 6 vazute pe 13 nov - curat - https://www.storia.ro/ro/oferta/apartament-de-vnzare-2-camere-sibiu-tigllari-IDEAhs
- apartamentul din Gusterita, 75.000 € - 8 din 8 in arhiva - curat, cu centrala proprie - https://www.storia.ro/ro/oferta/apartament-cu-2-camere-in-gusterita-IDGoIa

`node tools/verifica.js` a dat 403 imediat dupa scanare. Pozele casei respinse s-au luat din pagina HTML a anuntului, dupa ce Storia a raspuns din nou (un minut mai tarziu).

**Capcane prinse azi:**
- Pretul de pe cardurile OLX venea lipit de CSS ("229 900 €.css-o2j8v0{...}"). L-am curatat inainte de `update.js`, ca sa nu se citeasca cifre din CSS.
- Cautarea "casa de vanzare" pe Facebook Marketplace Sibiu da acum anunturi din toata tara. Locatia de pe card e a contului, deci filtrul pe "Sibiu" ramane necesar.
