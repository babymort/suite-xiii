const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 1500, height: 950 } })).newPage();
  await pg.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); });
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1'); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(() => { const out = []; document.querySelectorAll('svg').forEach(s => { const bb = s.getBoundingClientRect(); if (bb.width > 600) out.push([s.id, s.getAttribute('viewBox'), Math.round(bb.width), Math.round(bb.height), s.getAttribute('preserveAspectRatio')]); }); return { out, ratio: P.ratio, W, H: Hh() }; });
  console.log(JSON.stringify(r)); await b.close(); })();
