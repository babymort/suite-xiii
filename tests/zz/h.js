const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true })).newPage();
  await pg.goto('http://localhost:8765/plano.html?desktop=1'); await pg.waitForTimeout(4000);
  console.log(JSON.stringify(await pg.evaluate(() => ['xb-home', 'xf-btn', 'xsh-btn'].map(i => { const e = document.getElementById(i), c = getComputedStyle(e); return [i, c.height, c.padding, c.fontSize, c.lineHeight, c.minHeight, e.className, [...e.children].map(x => x.className + ':' + getComputedStyle(x).fontSize + '/' + getComputedStyle(x).display)]; }))));
  await b.close(); })();
