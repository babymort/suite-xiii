// APPLICATION ET VERSIONS TÉLÉPHONE : chaque page sur iPhone et Android — redirection vers la version -m, erreurs, débordement horizontal, zones tactiles trop petites, texte trop petit, appli installable
const { chromium, devices } = require('playwright');
const pages = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const S = {};
 for (const dev of ['iPhone 13', 'Pixel 7']) for (const pg of pages) { const ctx = await b.newContext({ ...devices[dev] });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } });
  const p = await ctx.newPage(); const E = []; p.on('pageerror', e => E.push(e.message.slice(0, 70))); p.on('dialog', d => d.dismiss().catch(() => { }));
  let r;
  try { await p.goto('http://localhost:8765/' + pg + '.html'); await p.waitForTimeout(3000);
   r = await p.evaluate(() => { const W = innerWidth; const over = document.documentElement.scrollWidth - W;
    const vis = e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0 && q.top < innerHeight && q.bottom > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const wide = [...document.querySelectorAll('body *')].filter(e => { const q = e.getBoundingClientRect(); return vis(e) && q.right > W + 2 && getComputedStyle(e).position !== 'fixed' && !e.closest('[style*="overflow"],.xh-nav,nav,table'); }).slice(0, 3).map(e => (e.id || e.className.toString().split(' ')[0] || e.tagName).slice(0, 20));
    const tiny = [...document.querySelectorAll('button,a[href],input,select,[role=button]')].filter(e => { const q = e.getBoundingClientRect(); return vis(e) && (q.width < 28 || q.height < 28) && !/checkbox|radio|hidden/.test(e.type || ''); }).map(e => ((e.title || e.textContent || e.placeholder || e.id || '').trim().replace(/\s+/g, ' ').slice(0, 16)) + ' ' + Math.round(e.getBoundingClientRect().width) + '×' + Math.round(e.getBoundingClientRect().height));
    const small = [...document.querySelectorAll('body *')].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2) && parseFloat(getComputedStyle(e).fontSize) < 11).length;
    return { url: location.pathname.replace('/', ''), over, wide, tiny: tiny.length, tinyEx: tiny.slice(0, 4), small, man: !!document.querySelector('link[rel=manifest]'), sw: !!(navigator.serviceWorker && navigator.serviceWorker.controller) }; });
  } catch (e) { r = { err: e.message.slice(0, 60) }; }
  const bad = r.err ? 'ERREUR ' + r.err : [r.over > 2 ? 'déborde de ' + r.over + ' px (' + r.wide.join(', ') + ')' : '', r.tiny ? r.tiny + ' zone(s) tactile(s) < 28 px : ' + r.tinyEx.join(', ') : '', r.small ? r.small + ' texte(s) < 11 px' : '', !r.man ? 'pas installable (manifeste absent)' : '', E.length ? 'ERREUR JS ' + E[0] : ''].filter(Boolean).join(' · ');
  console.log(dev.padEnd(9), pg.padEnd(14), '→ ' + (r.url || '').padEnd(18), bad || 'ok');
  await ctx.close(); }
 await b.close(); })();
