# Raport 20 sep 2026

Toate cele cinci surse au raspuns azi. Adaugate **88 de case** si **85 de apartamente**; lista are acum 179 de case si 156 de apartamente. **Nu am sters nimic**: verificarea linkurilor vechi se face cu un fetch rulat in browser, iar `browser_evaluate` nu e aprobat in sesiunea asta.

**Cel mai bun anunt nou: 137.000 EUR, Lazaret** ([IDIAao](https://www.storia.ro/ro/oferta/cas-individual-n-lazaret-115-mp-utili-teren-133-mp-d-p-pod-IDIAao)) - 115 mp utili, D+P inalt+pod, teren 133 mp, singur in curte, **doua niveluri cu intrari separate care functioneaza ca doua apartamente**. Exact scenariul "stau intr-unul, inchiriez celalalt", si mai raman ~110.000 din buget. Necesita renovare, acoperis schimbat integral, clasa energetica B.

Alte trei de deschis: **107.000 Turnisor** (77,8 mp, construita 2025, dar se preda **la alb**), **110.000 Piata Cibin** (75 mp, teren 135, singur in curte - livingul e la demisol), **169.999 Gusterita** (teren liber 500 mp cu livada, dar la **gri avansat**).

Scadere de pret: casa de pe Randunelelor a trecut de la **249.000 la 205.000** in doua zile. Apartamentul cu curte proprie din Terezian a scazut de la 82.990 la 80.000.

Cel mai ieftin apartament de 2 camere: **49.990 EUR, Tiglari**, 36 mp, parter, centrala proprie - verificat in descriere, nu e mansarda.

Capcane prinse: cel de 52.500 din Stefan cel Mare parea cel mai ieftin din oras, dar descrierea il da **la mansarda**. Trei anunturi de "casa" din zona Bavaria/Paltinis/Rosia au eticheta de locatie "Centrul Istoric" pe Storia si sunt de fapt la 20-30 km.

Avertisment: majoritatea celor adaugate azi au doar eticheta "detalii neverificate" - au fost luate din listele de rezultate, nu am deschis fiecare anunt. Deschide anuntul inainte sa suni.

**Nu am putut face commit/push**: `git add` si `git commit` cer aprobare in sesiunea asta. Modificarile sunt in working tree, necomise. La fel, `node` nu e aprobat, deci JSON-ul nu a fost validat cu un parser - doar structural cu grep (335 de linii de anunt, toate cu forma corecta, doar ultima fara virgula).
