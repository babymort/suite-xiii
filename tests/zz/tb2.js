const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); for (const w of [1180, 1280, 1366, 1536]) { const ctx = await b.newContext({ viewport: { width: w, height: 700 }, deviceScaleFactor: 2 }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  const pg = await ctx.newPage(); await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.plano.hide', '1'); } catch (e) { } });
  await pg.goto('http://localhost:8765/plano.html?desktop=1'); await pg.waitForTimeout(3500); await pg.evaluate(() => document.querySelectorAll('#xt-root,#xtp,#xoff').forEach(m => m.remove()));
  await pg.screenshot({ path: '/tmp/zz/pl_top_' + w + '.png', clip: { x: w / 2, y: 0, width: w / 2, height: 45 } }); await ctx.close(); } await b.close(); })();
