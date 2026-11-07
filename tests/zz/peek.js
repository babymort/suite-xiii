const { chromium } = require('playwright'); const [t, ty] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const pg = await b.newPage(); await pg.goto('http://localhost:8766/' + t + '.html?desktop=1'); await pg.waitForTimeout(2300);
  await pg.evaluate(async ([t, ty]) => { await XMODELS.apply(t, ty, false); }, [t, ty]); await pg.reload(); await pg.waitForTimeout(2300);
  console.log(await pg.evaluate(() => { const s = JSON.stringify(P, (k, v) => typeof v === 'string' && v.length > 60 ? v.slice(0, 60) + '…' : (k === 'img' || k === 'src' || k === 'data' ? '…' : v)); return s.slice(0, 3500); })); await b.close(); })();
