# Raport 27 nov 2026

**Rulare din cloud** (sarcina programata, fara laptop). Au lipsit **imobiliare.ro** (403 din cloud) si **Facebook Marketplace** (cere login din cloud), adica pasii b), c), e) si f), case si chirii. Verificarea VPN cu ipinfo.io a fost sarita: iesirea e prin Google Cloud.

**Surse citite:** Storia (case, apartamente, chirii), Autovit (plus dorintele), publi24, lajumate/homezz, agentiile, licitatiile si ANAF fara browser; OLX case si OLX chirii cu Playwright (script Node). Linkurile moarte au fost verificate.

**Din browser - OLX a dat mult mai putin decat ieri:**
- OLX case: 41 de anunturi OLX (ieri 72), 39 cu descriere. 16 in oras, 7 trec filtrele, 0 noi.
- OLX chirii: 27 (ieri 114), din 7 pagini; doar 21 intrate in chirii-externe.
- Am reluat scanarea o data: acelasi rezultat (41 si 27), deci nu e o eroare trecatoare. Paginile raspund 200 si au carduri, dar dupa pagina 7 nu mai apar anunturi OLX noi (restul cardurilor sunt copii Storia), iar pagina 1 a chiriilor face acum redirect 301 la URL-ul fara `page=1`. Pare o schimbare pe OLX, nu in scriptul de citire; de urmarit maine. Masuratoarea din urmarire-chirii.js are azi o gaura (doar 27 de anunturi vazute).

**Liste:** case 435 -> 437, apartamente 578 -> 579, masini 982 -> 991, biciclete 25 (seara de 26 nov., completarea de pe laptop adusese casele la 435).
- publica.js: 9 anunturi moarte scoase, 139 noi; curata.js a scos apoi 128 (date.json 1.144 -> 1.016).
- Linkuri: date.json 692 vii, 9 moarte, 313 incerte (lasate in lista); masini.json 499 vii, 480 moarte, 12 incerte; biciclete 7 vii, 15 moarte, 3 incerte.
- Surse fara browser: publi24 37 trec filtrele, lajumate 27, ambele 0 noi; agentii 9, 1 noua (casa cu comision 0 in Lazaret/Lupeni, 249.900 €, novaimob.ro, aceeasi cu IDHVgo de pe Storia); licitatii si ANAF 0 case. Chirii publi24: 162 (ieri 228).
- Dorinte: Ford SUV verde 23 de anunturi (cel mai ieftin 19.500 €), MG EHS plug-in 19 (cel mai ieftin 16.490 €).

**Storia, 26 -> 27 nov:** 25 de anunturi noi, 25 disparute, 5 preturi schimbate (snapshot 1.488 -> 1.493).
- casa noua: casa cu comision 0 in zona Lazaret/Lupeni, 100 mp, 249.900 €, de renovat, curte ~76 mp dupa scanner (sub 100 mp, nu intra in top) - https://www.storia.ro/ro/oferta/casa-individuala-de-vanzare-cu-comision-0-zona-lazaret-lupeni-IDHVgo
- pret: casa cu 2 camere de la Piata Cluj a crescut de la 149.999 la 180.000 € (+30.001); apartament 2 camere decomandat, 95.000 -> 89.900 €; apartament 2 camere, 77.000 -> 72.000 €.

**Respinse azi: 0.**

**Poze din top:** topul de case si de apartamente e acelasi ca ieri si ca pe 25 nov. Am verificat in pagina fiecarui anunt (`__NEXT_DATA__`) ca numarul de poze si pretul nu s-au schimbat (5, 9, 7, 8, 9, 6 poze; aceleasi preturi), deci verificarea din 25 nov. ramane valabila.
- casa cu 2 camere din Terezian (zona Marmelada), 90 mp, teren 450 mp, 180.000 € - sobe pe gaz, pivnita, 5 poze mici - https://www.storia.ro/ro/oferta/cas-2-camere-de-vnzare-sibiu-terezian-90-mp-IDBsmy
- casa cu 4 camere din Gusterita, 146 mp, 199.000 € - https://www.storia.ro/ro/oferta/cas-4-camere-guteria-sibiu-146-mp-teren-326-mp-IDI2JG
- casa cu 2 camere ultracentral (Centrul Civic), 55 mp, 129.000 € - doua usi pe fatada dinspre curte, de intrebat - https://www.storia.ro/ro/oferta/cas-cu-curte-n-sibiu-ultracentral-82-mp-IDFPwD
- apartamentul din Lazaret, 36 mp, 54.000 € - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lazaret-IDBcBD
- apartamentul la etajul 1 al unei case din Centrul Istoric, 49 mp, 72.900 € - https://www.storia.ro/ro/oferta/apartament-etajul-1-la-casa-cu-2-camere-in-zona-centrala-din-sibiu-IDIZ4M
- apartamentul de la parterul unui bloc langa Lacul lui Binder (Tiglari), 38 mp, 58.400 € - a doua camera ingusta, de verificat - https://www.storia.ro/ro/oferta/apartament-2-camere-zona-lacul-lui-binder-IDIp0Z

**Masini, top:** neschimbat: Sandero Stepway 2021 (Bascov, 9.999 €), Sandero Stepway 2020 (Selimbar, 6.690 €), Logan Stepway 2020 (Bucuresti, 8.500 €).

**Ce a picat:** niciun script nu s-a oprit cu eroare; update.js a urcat singur commit-ul de date. OLX a dat de doua-patru ori mai putine anunturi (vezi sus). imobiliare.ro si Facebook n-au fost citite si raman in ultima-rulare.json ca lipsa_browser.

## Completare de pe laptop (27 nov., ~09:00, iesire prin Digi)

**imobiliare.ro case:** 722 de anunturi in 25 de pagini, 264 pana in 250.000 €. Una noua in lista: casa cu comision 0 din Lazaret/Lupeni, 100 mp, 249.900 € - e aceeasi casa cu cea de pe Storia si novaimob.ro de azi dimineata - https://www.imobiliare.ro/oferta/casa-individuala-de-vanzare-sibiu-lazaret-4-camere-275773912 . Am deschis doar 2 anunturi (limita de 403): casa de 80 mp din Turnisor (85.000 €) si casa renovata de 60 mp din Piata Cluj (99.500 €). Amandoua au curte comuna, deci ies.

**imobiliare.ro chirii:** 636 de anunturi cu 2 camere (ieri 640).

**Facebook case:** cautarea a dat azi doar 29 de anunturi (lista se termina, nu se mai incarca altele); 1 de la partener, sarit. 25 de descrieri luate cu cont. Niciuna noua in lista: cele din oras sunt deja in date.json sau sunt la Cristian, Cisnadie, Daia, Mandra.

**Facebook chirii: n-a mers.** Scriptul a stat 30 de minute fara raspuns si l-am oprit. facebook-chirii.json ramane cel de ieri si e in ultima-rulare.json ca lipsa_browser.

**OLX, reluat de pe laptop - scaderea de dimineata era o eroare de citire, nu o schimbare pe OLX:**
- OLX chirii: 88 de anunturi (dimineata 27). Pagina 7 n-are niciun anunt OLX (doar copii Storia), dar pagina 8 are 6, iar paginile pana la 26 mai au cate 3-6. Citirea se oprea la prima pagina fara anunturi noi. Am corectat regula in tools/prompt-zilnic.txt: se opreste abia dupa 4 pagini la rand fara anunturi noi sau la o pagina repetata. Scriptul din cloud trebuie corectat la fel; el nu e in repo.
- OLX case: 41 (ca dimineata), 39 cu descriere; 0 noi.

**Liste dupa completare:** case 437 -> 438, apartamente 579, masini 991, biciclete 25.

**Top:** neschimbat fata de dimineata (case, apartamente si masini), deci n-au fost poze noi de verificat.
