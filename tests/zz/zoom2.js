// Mise en page 90 → 150 % : défilement horizontal de la page, boutons des barres qui se chevauchent ou sortent de l'écran
const { chromium } = require('playwright');
const pages = process.argv.slice(2), SZ = [90, 100, 125, 150];
(async () => { const b = await chromium.launch(); const Q = pages.slice(), out = [];
 await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const pg = Q.shift(); for (const z of SZ) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(([z, a]) => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); localStorage.setItem('xiii.news.seen', JSON.stringify({ ver: 'x', k: [] })); localStorage.setItem('xiii.a11y', JSON.stringify({ size: z })); } catch (e) { } }, [z, pg.replace(/\.html.*/, '')]);
  const p = await ctx.newPage(); try { await p.goto('http://localhost:8765/' + pg, { timeout: 30000 }); await p.waitForTimeout(2800);
   const r = await p.evaluate(() => { const B = [...document.querySelectorAll('#top-bar button,#toolbar button,#top-bar a,#xb2 button')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && getComputedStyle(e).visibility !== 'hidden'; });
    const R = B.map(e => [e, e.getBoundingClientRect()]); const ov = []; for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i][1], c = R[j][1]; if (R[i][0].contains(R[j][0]) || R[j][0].contains(R[i][0])) continue; const w = Math.min(a.right, c.right) - Math.max(a.left, c.left), h = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (w > 4 && h > 4) ov.push((R[i][0].id || R[i][0].title || R[i][0].textContent).trim().slice(0, 16) + '×' + (R[j][0].id || R[j][0].title || R[j][0].textContent).trim().slice(0, 16)); }
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    return { hs: document.documentElement.scrollWidth - document.documentElement.clientWidth, ov: ov.slice(0, 4), zoom: z }; });
   if (r.hs > 2 || r.ov.length) out.push(pg.split('?')[0] + ' ' + z + '% zoom=' + (+r.zoom).toFixed(2) + (r.hs > 2 ? ' · défile horizontalement de ' + r.hs + ' px' : '') + (r.ov.length ? ' · chevauchements : ' + r.ov.join(' | ') : ''));
  } catch (e) { out.push(pg + ' ' + z + '% ERR ' + e.message.slice(0, 60)); } await ctx.close(); } } }));
 console.log(out.sort().join('\n') || 'rien'); await b.close(); })();
