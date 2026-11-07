const { chromium } = require('playwright'); const L = process.argv.slice(2).map(x => x.split('>'));
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  for (const [f, t] of L) { const pg = await ctx.newPage(); await pg.goto('http://localhost:8765/' + f + '.html?desktop=1'); await pg.waitForTimeout(2600);
    console.log(f + '>' + t, JSON.stringify(await pg.evaluate(t => { const k = XGATE && XPASS ? (XPASS.has(location.pathname.split('/').pop().replace('.html', '') + '>' + t)) : null; const b = XGATE.findBtn(t); return { xpass: k, btn: b && ((b.id || '') + ' | ' + (b.title || '').slice(0, 80) + ' | ' + b.textContent.trim().slice(0, 40)), onclick: b && String(b.getAttribute('onclick') || '').slice(0, 60) }; }, t))); await pg.close(); }
  await b.close(); })();
