// Où passe le temps avant affichage : HTML reçu, scripts, DOMContentLoaded, load, lever du rideau (XBOOT)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pages = process.argv.slice(2);
 for (const pg of pages) { const R = [];
  for (let k = 0; k < 3; k++) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
   await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
   await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); let seen = 0; const iv = setInterval(() => { const H = document.documentElement; if (!H) return; if (H.classList.contains('xb0')) seen = 1; else if (seen) { window.__up = performance.now(); clearInterval(iv); } }, 5); }, pg);
   const p = await ctx.newPage(); await p.goto('http://localhost:8765/' + pg + '.html?desktop=1'); await p.waitForTimeout(3500);
   R.push(await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const lt = performance.getEntriesByType('longtask') || []; const s = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script'); return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), up: Math.round(window.__up || -1), scripts: s.length, lastScript: Math.round(Math.max(0, ...s.map(r => r.responseEnd))) }; }));
   await ctx.close(); }
  const avg = k => Math.round(R.reduce((a, r) => a + r[k], 0) / R.length);
  console.log(pg.padEnd(12), 'DOMContentLoaded', avg('dcl'), 'ms · load', avg('load'), 'ms · dernier script reçu', avg('lastScript'), 'ms · rideau levé', avg('up'), 'ms ·', R[0].scripts, 'scripts'); }
 await b.close(); })();
