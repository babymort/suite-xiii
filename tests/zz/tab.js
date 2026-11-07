const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const out = {};
  for (const w of [1280, 1440]) { const ctx = await b.newContext({ viewport: { width: w, height: 700 }, deviceScaleFactor: 2 }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  const pg = await ctx.newPage(); await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.plano.hide', '1'); } catch (e) { } });
  await pg.goto('http://localhost:8765/plano.html?desktop=1'); await pg.waitForTimeout(3000);
  out[w] = await pg.evaluate(async () => { document.querySelectorAll('#xt-root,#xtp,#xoff').forEach(m => m.remove()); for (let i = 0; i < 3; i++) { P.tabs.push(JSON.parse(JSON.stringify(P.tabs[0]))); P.tabs[P.tabs.length - 1].id = 'zz' + i; P.tabs[P.tabs.length - 1].name = 'Plateau émission de rentrée ' + i; } renderTabs(); await new Promise(r => setTimeout(r, 900));
    const tc = (document.querySelector('#top-bar .tabs-container') || document.getElementById('tabs-container')), r = tc.getBoundingClientRect(); const last = [...tc.querySelectorAll('*')].reduce((m, e) => Math.max(m, e.getBoundingClientRect().right), 0);
    await new Promise(r => setTimeout(r, 1500)); const tb = document.getElementById('top-bar'); return { cls: tb.className, sw: tb.scrollWidth, cw: tb.clientWidth, kids: [...tb.children].map(c => (c.id || c.className.toString().slice(0, 12)) + ':' + c.scrollWidth + '/' + c.clientWidth + ':' + getComputedStyle(c).overflowX), tc: [Math.round(r.left), Math.round(r.right)], contentRight: Math.round(last), ov: getComputedStyle(tc).overflowX }; });
  await pg.screenshot({ path: '/tmp/zz/tabs_' + w + '.png', clip: { x: 0, y: 0, width: w, height: 45 } }); await ctx.close(); }
  console.log(JSON.stringify(out)); await b.close(); })();
