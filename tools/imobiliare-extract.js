// Reteta pentru imobiliare.ro. Site-ul nu are __NEXT_DATA__ si nici API de lista:
// /map/listings intoarce doar pinurile de pe harta (id + pret, fara titlu), iar
// cererile simple primesc 403. Singura cale e Playwright + citit din DOM.
//
// Cum se foloseste in rularea zilnica:
//   1. mcp__playwright__browser_navigate la
//      https://www.imobiliare.ro/vanzare-case-vile/judetul-sibiu/sibiu
//      (pentru apartamente: /vanzare-apartamente/judetul-sibiu/sibiu/2-camere)
//   2. mcp__playwright__browser_evaluate cu functia de mai jos, copiata ca atare.
//   3. Paginile urmatoare: adauga ?pagina=2, ?pagina=3 si repeta.
//
// ATENTIE: filtrul de pret din URL NU se aplica - pagina intoarce si case de
// 880.000. Filtreaza dupa campul p, in cod, ca la publi24.

() => {
  const nr = t => { const m = (t || '').replace(/\./g, '').match(/(\d+)/); return m ? +m[1] : null; };
  return [...document.querySelectorAll('article')].map(a => {
    const link = a.querySelector('a[href*="/oferta/"]');
    if (!link) return null;
    const pret = a.querySelector('span[class*="text-price"]');
    const href = link.getAttribute('href');
    const txt = a.innerText.replace(/\s+/g, ' ');
    return {
      p: pret ? nr(pret.textContent) : null,
      t: ((a.querySelector('h2, h3') || {}).textContent || '').trim(),
      // camerele si cartierul sunt in slug: .../casa-individuala-de-vanzare-sibiu-turnisor-3-camere-275708349
      camere: (href.match(/-(\d+)-camere-/) || [])[1] || (txt.match(/(\d+)\s*camere/) || [])[1] || null,
      zona: (href.match(/-sibiu-([a-z-]+?)-(?:mobilata-)?\d+-camere-/) || [])[1] || null,
      mp: (txt.match(/(\d+)\s*mpu/) || [])[1] || (txt.match(/(\d+)\s*m²/) || [])[1] || null,
      u: 'https://www.imobiliare.ro' + href
    };
  }).filter(x => x && x.p);
}
