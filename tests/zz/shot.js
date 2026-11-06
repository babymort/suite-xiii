const { chromium } = require('playwright'); const [vw, vh, theme, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +vw, height: +vh }, isMobile: +vw < 600, hasTouch: +vw < 1100 });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  for (const p of pages) { const pg = await ctx.newPage(); const app = p.replace('.html', '').replace('-m', '');
    await pg.addInitScript(([a, t]) => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); localStorage.setItem('xiii.theme.mode', t); }, [app, theme]);
    await pg.goto('http://localhost:8765/' + p + (p.includes('-m') || process.env.NODESK ? '' : '?desktop=1')); await pg.waitForTimeout(4500); await pg.evaluate(() => document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()));
    await pg.screenshot({ path: '/tmp/zz/s_' + vw + '_' + p.replace('.html', '') + '.png', clip: { x: 0, y: 0, width: +vw, height: Math.min(+vh, 160) } }); await pg.close(); } await b.close(); })();
