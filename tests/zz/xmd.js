const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.plano.hide', '1'); } catch (e) { } });
  await pg.goto('http://localhost:8765/plano.html?desktop=1'); await pg.waitForTimeout(3000); await pg.evaluate(() => { document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); XMODELS.all ? XMODELS.all() : XMODELS.pick('plano'); }); await pg.waitForTimeout(800);
  await pg.screenshot({ path: '/tmp/zz/xmd.png' }); await b.close(); })();
