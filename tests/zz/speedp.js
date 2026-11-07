// Temps d'ouverture : écran prêt (fin du chargement XBOOT) et barres complètes, avec et sans processeur ralenti ×4
const { chromium } = require('playwright'); const fs = require('fs'); const [out, thr, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const R = {};
  for (const p of pages) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    const runs = [];
    for (let i = 0; i < 2; i++) { const pg = await ctx.newPage(); const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +thr });
      await pg.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } window.__spd = {};
        const tick = () => { const n = performance.now(), H = document.documentElement; if (!H) return setTimeout(tick, 5); if (!window.__spd.shown && document.body && !H.classList.contains('xb0')) window.__spd.shown = n; if (!window.__spd.bars && window.__spd.shown && !H.classList.contains('xzzb0')) window.__spd.bars = n; if (n < 15000 && !window.__spd.bars) setTimeout(tick, 8); }; setTimeout(tick, 0); }, p.replace('.html', ''));
      await pg.goto('http://localhost:'+(process.env.PORT||8765)+'/' + p + '?desktop=1', { waitUntil: 'load', timeout: 60000 }); await pg.waitForTimeout(3500 * Math.max(1, +thr / 2));
      runs.push(await pg.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; window.__dbg = JSON.stringify(window.__spd) + ' ' + document.documentElement.className; return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), shown: Math.round(window.__spd.shown || -1), bars: Math.round(window.__spd.bars || -1), dbg: window.__dbg, js: Math.round(performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').reduce((a, r) => a + r.duration, 0)) }; }));
      await pg.close(); }
    R[p] = runs[1]; await ctx.close(); } // 2e ouverture = cache chaud (comme un utilisateur qui revient)
  fs.writeFileSync(out, JSON.stringify(R)); await b.close(); })();
