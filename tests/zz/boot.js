// Ce qui change dans les barres APRÈS l'affichage (classe xb1 / fin de xb0) : boutons ajoutés, retirés, déplacés
const { chromium } = require('playwright'); const fs = require('fs'); const [out, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const R = {};
  const one = async (ctx, p) => { const pg = await ctx.newPage(); const app = p.replace('.html', '');
    await pg.addInitScript(([a, ALL]) => { localStorage.setItem('xiii.tips.off', 'true'); if (ALL) localStorage.setItem('__all', '1'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1');
      const sig = () => { const L = []; document.querySelectorAll('#top-bar button,#top-bar select,#top-bar input,#toolbar button,#toolbar select,#toolbar input').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.height && getComputedStyle(e).visibility !== 'hidden') L.push((e.id || (e.title || e.textContent).trim().slice(0, 18)) + '@' + Math.round(r.left / 4) + ',' + Math.round(r.top / 4)); }); return L; };
      window.__log = []; var process_all = localStorage.getItem('__all') === '1'; let prev = null, shownAt = null;
      const tick = () => { const H = document.documentElement; const shown = !H.classList.contains('xb0') && document.body; const bars = !H.classList.contains('xzzb0'); if (bars && shown && window.__bars == null) window.__bars = performance.now(); if (shown && shownAt == null) { shownAt = performance.now(); window.__shown = shownAt; }
        if (shownAt != null) { const s = sig(), j = s.join('|'); if (prev != null && j !== prev && (process_all || !H.classList.contains('xzzb0'))) { const P = new Set(prev.split('|')), S = new Set(s); window.__log.push([Math.round(performance.now() - shownAt), s.filter(x => !P.has(x)).slice(0, 6), [...P].filter(x => !S.has(x)).slice(0, 6), s.length]); } prev = j; }
        if (performance.now() < 12000) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); }, [app, !!process.env.ALL]);
    try { await pg.goto('http://localhost:8765/' + p + '?desktop=1', { waitUntil: 'load', timeout: 20000 }); await pg.waitForTimeout(9000);
      R[p] = await pg.evaluate(() => ({ shown: Math.round(window.__shown || -1), bars: Math.round((window.__bars || -1) - (window.__shown || 0)), log: window.__log })); } catch (e) { R[p] = { err: e.message.slice(0, 80) }; }
    await pg.close(); };
  const ctxs = await Promise.all([0, 1, 2, 3].map(() => b.newContext({ viewport: { width: 1440, height: 900 } })));
  for (const c of ctxs) await c.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  const Q = pages.slice(); await Promise.all(ctxs.map(async c => { while (Q.length) await one(c, Q.shift()); }));
  fs.writeFileSync(out, JSON.stringify(R)); await b.close(); })();
