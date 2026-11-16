// CONFORT POUR TOUS : boutons sans nom lisible par un lecteur d'écran, champs sans étiquette, images sans texte, focus invisible au clavier, langue, Tab qui atteint la barre
const { chromium } = require('playwright');
const pages = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const T = { nom: 0, champ: 0, img: 0, focus: 0 };
 for (const pg of pages) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, pg);
  const p = await ctx.newPage(); await p.goto('http://localhost:8765/' + pg + '.html?desktop=1'); await p.waitForTimeout(3000);
  const r = await p.evaluate(() => { const vis = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
   const name = e => (e.getAttribute('aria-label') || e.getAttribute('aria-labelledby') && 'x' || e.title || (e.innerText || '').replace(/[\u{1F000}-\u{1FFFF}☀-➿️‍✕×▾▸›‹←→↑↓☰⋯…+\-]/gu, '').trim() || (e.querySelector('img[alt]:not([alt=""])') ? 'img' : '')).trim();
   const nb = [...document.querySelectorAll('button,a[href],[role=button]')].filter(e => vis(e) && !name(e));
   const lab = e => e.labels && e.labels.length || e.getAttribute('aria-label') || e.title || e.placeholder || e.getAttribute('aria-labelledby');
   const nf = [...document.querySelectorAll('input:not([type=hidden]):not([type=file]),select,textarea')].filter(e => vis(e) && !lab(e));
   const ni = [...document.querySelectorAll('img')].filter(e => vis(e) && !e.hasAttribute('alt') && e.getBoundingClientRect().width > 24);
   return { lang: document.documentElement.lang, nb: nb.length, nbEx: nb.slice(0, 4).map(e => (e.id || e.className.toString().split(' ')[0] || e.tagName) + '[' + (e.textContent || '').trim().slice(0, 4) + ']'), nf: nf.length, nfEx: nf.slice(0, 3).map(e => e.id || e.className || e.type), ni: ni.length }; });
  // clavier : 15 Tab, le focus est-il visible (contour ou ombre) ?
  let inv = 0, seen = 0, ex = [];
  for (let i = 0; i < 15; i++) { await p.keyboard.press('Tab'); const f = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const s = getComputedStyle(e); const ok = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none'); return { ok, d: (e.id || e.className.toString().split(' ')[0] || e.tagName).slice(0, 18) }; }); if (f) { seen++; if (!f.ok) { inv++; if (ex.length < 3) ex.push(f.d); } } }
  T.nom += r.nb; T.champ += r.nf; T.img += r.ni; T.focus += inv;
  const L = [r.lang !== 'fr' ? 'langue « ' + r.lang + ' »' : '', r.nb ? r.nb + ' bouton(s) sans nom : ' + r.nbEx.join(' ') : '', r.nf ? r.nf + ' champ(s) sans étiquette : ' + r.nfEx.join(' ') : '', r.ni ? r.ni + ' image(s) sans texte' : '', inv ? 'focus invisible ' + inv + '/' + seen + ' : ' + ex.join(' ') : '', !seen ? 'Tab n\'atteint rien' : ''].filter(Boolean);
  console.log(pg.padEnd(13), L.join(' · ') || 'ok'); await ctx.close(); }
 console.log('TOTAL', JSON.stringify(T)); await b.close(); })();
