const { chromium } = require('playwright'); const [vw, sel, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +vw, height: 800 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  for (const p of pages) { const pg = await ctx.newPage(); await pg.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, p.replace('.html', ''));
    await pg.goto('http://localhost:8765/' + p + '?desktop=1'); await pg.waitForTimeout(4500);
    console.log(p, JSON.stringify(await pg.evaluate(s => { const t = document.querySelector(s); if (!t) return null; const cs = getComputedStyle(t); return { w: t.clientWidth, sw: t.scrollWidth, wrap: cs.flexWrap, ov: cs.overflowX, ch: [...t.children].filter(c => c.getBoundingClientRect().width).map(c => [c.id || c.className.toString().slice(0, 16) || c.tagName, Math.round(c.getBoundingClientRect().left), Math.round(c.getBoundingClientRect().width), getComputedStyle(c).flexShrink, getComputedStyle(c).minWidth]) }; }, sel)));
    await pg.close(); } await b.close(); })();
