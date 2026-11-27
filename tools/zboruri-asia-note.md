# Lecții pentru căutarea de zboruri Asia 2027

Citește-le la începutul fiecărei rulări. Ține fișierul sub 60 de rânduri; corectează o lecție
care nu mai e adevărată în loc să adaugi una care o contrazice.

## Din căutările de pe 22 noiembrie 2026 (trei sesiuni, peste 350 de căutări)

- **Graficul de prețuri din Google Flights nu e de folosit:** n-am putut confirma că respectă filtrele
  (o escală, fără Qatar, fără Golf). Se citește lista de zboruri pentru fiecare dată.
- **O căutare durează cam 40 de secunde.** 58 de căutări ≈ 38 de minute; 270 ≈ 2 ore.
- **Liste parțiale:** uneori Google arată doar 10–30 de zboruri și „Other flights” nu se deschide.
  Reia căutarea cu așteptare mai lungă; dacă tot e parțială, noteaz-o cu numărul de rezultate.
- **„Loading results”:** pagina nu e gata; așteaptă mai mult înainte de citire.
- **Captcha și „Oops, something went wrong”** au apărut mai ales cu trei sesiuni în paralel, dar
  pe 25 noiembrie captcha a venit și cu o singură căutare odată (pauze de 4–8 s), după 8 căutări.
  Nu se ocolește: scriptul se oprește la primul captcha.
- **Phnom Penh:** Google nu recunoaște codurile PNH și KTI; caută după numele orașului.
- **Prețul sugerat de Google în antet** (ex. „de la 358 €” din Cluj) poate avea două escale sau
  escală în Golf. Nu e un rezultat valid până nu verifici escalele.
- **Din Sibiu și Târgu Mureș** nu există zbor spre Bangkok cu o singură escală. Din Cluj și
  Timișoara dusul e mai scump decât din București (595–640 € față de 505 €).
- **Întoarcerile din aprilie** au fost cu 150–350 € mai scumpe decât cele din martie.

- **Escală și durată totală, 24 noiembrie:** KUL→OTP pe 30 martie, cel mai ieftin zbor (377 €) are
  escală de 16 h 25 min la Istanbul și 28 h 40 min în total; același zbor de dimineață cu escală de
  4 h 5 min costă 404 € (16 h 25 min în total), iar unul de seară 432 € (14 h 25 min). Citește pentru
  fiecare zbor și durata totală, și ia și cel mai ieftin zbor cu escală de cel mult 6 ore (vezi REGULI.md).

- **Același preț, mai multe zboruri (24 noiembrie):** OTP→BKK pe 27 februarie costă 505 € cu trei zboruri
  Austrian: escală 4 h 10 min (15 h 55 min în total), 9 h 25 min și 15 h 50 min. La preț egal, ia zborul
  cu durata totală cea mai scurtă și scrie-i escala și durata, nu primul din listă.

## Rularea din 25 noiembrie 2026 (prima cu tools/zboruri-asia.js)

- Fără SERPAPI_KEY, deci Playwright. Scriptul n-exista; l-am scris (`tools/zboruri-asia.js`, reia de
  unde a rămas: sare cheile citite deja). O căutare ≈ 35 s, 7 din 7 au mers din prima (94–110 rezultate).
- Captcha la a 8-a căutare (OTP→DPS, 7 feb), după 5 minute; reluat după 10 minute: captcha imediat.
  Citit doar OTP→BKK pe toate cele 7 date (505 € din 22 feb; 543–587 € pe 7, 13, 20 feb).
- Reparat: căutările mergeau toate dusurile, apoi toate întoarcerile, deci o rulare oprită nu dădea
  niciun traseu complet. Acum merg pe traseu (dusurile lui, apoi întoarcerile), în ordinea din config.
- Data viitoare: după captcha, încearcă din nou abia la rularea următoare, nu în aceeași oră.

## Rularea din 27 noiembrie 2026

- 4 min 22 s, captcha la a 6-a căutare (OTP→BKK, 1 mar); 4 din 5 au mers din prima, niciuna parțială.
  Citit iar doar OTP→BKK: 505 € pe 22 și 27 feb, 542 € pe 7 și 13 feb, 586 € pe 20 feb (ca pe 25).
- Limita reală e 6–8 căutări pe rulare, din 63: o rulare nu termină niciodată tot. Reparat în script:
  întâi cheile necitite, apoi cele citite cel mai demult (din zboruri-asia.json). Verifici cu `DRY=1`.
- La combinare, ia pentru fiecare sens ultima citire din zboruri-asia.json din ultimele 4 zile, și
  scrie pe rând data citirii fiecărui sens. Altfel niciun traseu nu se completează.

## Reper, 22 noiembrie 2026 (de persoană, din București)

- OTP→BKK 505 € (Austrian prin Viena) pe 22–24 și 27 feb, 1–3 și 5–8 mar.
- KUL→OTP 376 € (Turkish prin Istanbul) pe multe zile din martie; 549–735 € din aprilie.
- Cel mai ieftin total: Bangkok → … → Kuala Lumpur, 881 €.
