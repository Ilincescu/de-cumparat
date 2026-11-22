# Raport 22 nov 2026

**Rulare din cloud** (sarcina programata, fara laptop). Au lipsit **imobiliare.ro** (403 din cloud) si **Facebook Marketplace** (cere login din cloud), adica pasii b), c), e) si f), case si chirii. Verificarea VPN cu ipinfo.io a fost sarita: iesirea e prin Google Cloud, nu prin Visma.

**Surse citite:** Storia (case, apartamente, chirii), Autovit, publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX case si OLX chirii cu Playwright (script Node, nu Playwright MCP). Linkurile moarte au fost verificate.

**Din browser:**
- OLX case: 86 de anunturi OLX, 84 cu descriere. 20 in oras, 8 trec filtrele, 0 noi.
- OLX chirii: 105 (85 cu mp), 72 intrate in chirii-externe.

**Liste:** case 444 -> 435, apartamente 599 -> 570, masini 926 -> 942, biciclete 25.
- publica.js: 40 de anunturi moarte scoase, 109 noi adaugate; curata.js a scos apoi 108 (76 cu curte comuna, 27 la mansarda, 5 din afara orasului).
- Linkuri: date.json 693 vii, 40 moarte, 311 incerte (raspunsuri neclare, lasate in lista); masini.json 493 vii, 443 moarte, 6 incerte; biciclete 7 vii, 15 moarte, 3 incerte.
- Surse fara browser: publi24 37 trec filtrele, 0 noi; lajumate 28, 1 noua (casa in Tocile, 165.000 €, https://lajumate.ro/ad/casa-de-vanzare-tocile-17124159); agentii 14, 0 noi; licitatii si ANAF 0 case.

**Storia, 21 -> 22 nov:** 2 anunturi noi (niciuna casa), 82 disparute, 1 pret schimbat. Snapshotul a scazut de la 1.471 la 1.391 de anunturi.
- noi: apartament la etajul 2 din 2 intr-o vila din Turnisor, 54 mp, 85.000 €, de renovat (https://www.storia.ro/ro/oferta/vnd-apartament-situat-la-etajul-2-din-2-ntr-o-vil-din-zona-turnior-IDJjwI); o garsoniera de 21 mp in Strand.
- pret: apartament 3 camere Mihai Viteazul, 99.490 -> 91.500 €.
- disparute din top-ul de ieri: casa cu 2 camere din Terezian, 90 mp, 180.000 € (IDBsmy). Casa din Lupeni (IDJiCe) a iesit din top.

**Respinse azi dupa poze: 1**
- apartamentul de 77 mp din Centrul Istoric, cu gradina, 85.000 € (IDHWoh): pete umede la baza peretelui din bucatarie, in spatele masinii de spalat (poza 6), tencuiala scorojita langa fereastra si tavan fisurat in camera mare (poza 3). Ieri l-am trecut ca "fara igrasie, doar fisuri in tavan"; azi, la rezolutie completa, pata de la baza peretelui se vede clar. Adaugat in tools/respinse.json, apoi am rulat `node tools/azi.js --scrie`. In locul lui a intrat IDI0sk.

**Poze din top:** `node tools/verifica.js` n-a descarcat nicio poza (0 salvate), asa ca le-am luat din pagina HTML a fiecarui anunt (`__NEXT_DATA__`). Am vazut toate pozele, la marime mare, nu miniaturi.
- casa cu 4 camere din Terezian, 112 mp, teren 450 mp, 198.000 € - 6 din 6 poze - fara igrasie vizibila; nicio poza cu fatada - https://www.storia.ro/ro/oferta/casa-individuala-i-4-camere-i-acces-auto-i-curte-i-terezian-IDEqhl
- apartament la casa, 2 camere, 95 mp, Centrul Istoric, teren 200 mp, 149.000 € - 12 din 12 poze - fara igrasie vizibila. **De intrebat:** agentia scrie "gradina proprie", dar ultima poza arata o curte pavata cu mai multe case in jur, care pare comuna - https://www.storia.ro/ro/oferta/apartament-2-camere-la-casa-zona-centrala-IDIp2T
- casa cu 4 camere din Lazaret, 90 mp, teren 100 mp, 160.000 € - 19 din 19 poze - fara igrasie vizibila; are scara interioara si un nivel de jos cu calorifer (azi.js n-a marcat demisol) - https://www.storia.ro/ro/oferta/casa-cu-4-camere-balcon-si-curte-zona-lazaret-IDHs2G
- apartamentul din Tiglari, parter, 47.000 € - 10 din 10 poze - curat, fara scara interioara, fara subsol. **Atentie:** releveul din poza 2 da 29,9 mp utili (doua camere, 9,6 + 12,8 mp), sub pragul de 30 mp din criterii; nu l-am respins, fiindca are doua camere - https://www.storia.ro/ro/oferta/apartament-2-camere-parter-zona-tiglari-IDIvVP
- apartamentul din Tiglari, 30 mp, 49.990 € - 8 din 8 poze - curat - https://www.storia.ro/ro/oferta/apartament-de-vanzare-cu-2-camere-in-zona-tiglari-sibiu-IDJejJ
- apartament 64 mp langa Parcul Belvedere (Tilisca), comision 0, 99.900 € - 10 din 10 poze - fara igrasie, fara scara interioara. Pe tavan, deasupra aparatului de aer conditionat din bucatarie, e o dunga inchisa la culoare cat aparatul (poza 6): pare murdarie de la aer sau o zona retusata, nu umezeala; de intrebat - https://www.storia.ro/ro/oferta/apartament-64-mpu-lng-parcul-belvedere-comision-0-IDI0sk

**Ce a picat:**
- push-ul din update.js: respins, fiindca intre timp aparuse pe main un commit cu pagina primavara-2027.html. Am facut fetch + rebase + push si a mers (fara --force).
- imobiliare.ro si Facebook n-au fost citite (vezi sus); update.js le-a trecut in ultima-rulare.json ca lipsa_browser.

**Capcane:** locul 1 la masini e tot RAV4-ul din 2023 cu 58.000 km la 10.000 € - suspect de ieftin, de verificat inainte de orice telefon.
