const { chromium } = require('playwright');
(async () => { const [a, v] = process.argv.slice(2); const b = await chromium.launch(); const ctx = await b.newContext(); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 const p = await ctx.newPage(); await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2500);
 const K = await p.evaluate(() => Object.keys(localStorage).filter(k => !/tips\.off|tour2/.test(k)));
 for (const k of K) { await p.evaluate(([k, v]) => { const s = JSON.parse(sessionStorage.getItem('bk') || '{}'); }, [k, v]);
  const p2 = await ctx.newPage(); const E = []; p2.on('pageerror', e => E.push(e.message.slice(0, 80) + ' @' + (e.stack || '').split('\n')[1]?.trim().slice(0, 90)));
  await p2.goto('http://localhost:8765/404x'); await p2.evaluate(([k, v]) => { localStorage.setItem(k, v); }, [k, v]);
  await p2.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p2.waitForTimeout(2500);
  if (E.length) console.log(k, '→', [...new Set(E)].slice(0, 2).join(' || '));
  await p2.evaluate(() => localStorage.clear()); await p2.close(); await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(1500); }
 await b.close(); })();
