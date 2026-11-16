const { chromium } = require('playwright'); const [tag, ...apps] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); for (const a of apps) for (const th of ['dark', 'light']) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await ctx.addInitScript(([a, th]) => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); localStorage.setItem('xiii.theme.mode', th); }, [a, th]);
 const p = await ctx.newPage(); await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(3500); await p.evaluate(() => { document.querySelectorAll('#xt-root,#xtp').forEach(x => x.remove()); });
 await p.screenshot({ path: '/tmp/zz/q_' + tag + '_' + a + '_' + th + '.png' }); await ctx.close(); } await b.close(); })();
