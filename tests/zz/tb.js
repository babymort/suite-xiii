const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  for (const a of process.argv.slice(2)) { const pg = await ctx.newPage(); await pg.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
    await pg.goto('http://localhost:8765/' + a + '.html?desktop=1'); await pg.waitForTimeout(5000);
    console.log(a, JSON.stringify(await pg.evaluate(() => { const t = document.getElementById('toolbar'); if (!t) return null; const cs = getComputedStyle(t); return { jc: cs.justifyContent, ch: [...t.children].map(c => [c.tagName, c.id || c.className.toString().slice(0, 20), getComputedStyle(c).flexGrow, getComputedStyle(c).marginLeft, Math.round(c.getBoundingClientRect().left)]) }; })));
    await pg.close(); } await b.close(); })();
