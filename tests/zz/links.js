const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = await b.newPage(); await pg.goto('http://localhost:8765/casto.html?desktop=1'); await pg.waitForTimeout(2500);
  console.log(JSON.stringify(await pg.evaluate(() => { const R = Object.keys(XPASS.R); const L = XLINKS.L.map(x => x[0] + '>' + x[1]); return { xpass: R.filter(k => k !== 'eq'), other: L.filter(k => R.indexOf(k) < 0), n: L.length, keys: XMODELS.keys }; }))); await b.close(); })();
