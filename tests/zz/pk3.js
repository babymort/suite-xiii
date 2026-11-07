const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = await b.newPage(); const E = []; pg.on('pageerror', e => E.push(e.message)); pg.on('console', m => E.push(m.type() + ' ' + m.text().slice(0, 100)));
  await pg.goto('http://localhost:8766/repero.html?desktop=1'); await pg.waitForTimeout(2500);
  await pg.evaluate(() => { window.__calls = []; const o = window.sendPlacesToRessourco; window.sendPlacesToRessourco = function () { window.__calls.push('ress'); }; XGATE.go('ressourco'); });
  await pg.waitForTimeout(1200); console.log(await pg.evaluate(() => JSON.stringify({ calls: window.__calls, modal: !!document.querySelector('.modal .mitem') }))); console.log(E.filter(x => !/Failed to load|net::/.test(x)).slice(0, 5)); await b.close(); })();
