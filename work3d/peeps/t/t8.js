// Banc de test : chaque pose au repos puis avec bras / jambes déplacés, fond rose pour voir les trous
const { chromium } = require('playwright');
const out = process.argv[2]; const SCL = +(process.env.SCL||1.05), ONLY = (process.env.ONLY||'').split(',').filter(Boolean); const ids = process.argv.slice(3);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1700, height: 1500 }, deviceScaleFactor: 1 });
  await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); } catch (e) { } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { try { closeModal(); } catch (e) { } await XPEEPS.load(); });
  const all = await pg.evaluate(() => Object.keys(XPEEPS.data().P).filter(k => !k.startsWith('bust/')));
  const list = ids.length ? ids : all;
  for (const id of list) {
    const svg = await pg.evaluate(([id, SCL, ONLY]) => {
      const base = { pPose: id, pHead: 'Short 1', pFace: 'Calm', pFill: '#ffffff', pSkin: '#ffffff' };
      const J0 = XPEEPS.joints(Object.assign({}, base)); const R0 = J0.R0; const lk = J0.lk;
      const V = [['repos', {}], ['bras haut', { rUA: R0.rUA + 100, lUA: R0.lUA - 100 }], ['bras écartés', { rUA: R0.rUA - 70, lUA: R0.lUA + 70, rFA: R0.rFA + 40, lFA: R0.lFA - 40 }], ['jambes', { rTh: R0.rTh - 25, lTh: R0.lTh + 25, rSh: R0.rSh + 20, lSh: R0.lSh - 20 }], ['penché', { torso: R0.torso + 35 }]];
      let o = '<svg xmlns="http://www.w3.org/2000/svg" width="1700" height="1500" viewBox="0 0 1700 1500"><rect width="1700" height="1500" fill="#f4b8d0"/>';
      V.filter(v => !ONLY.length || ONLY.includes(v[0])).forEach((v, i) => { const el = Object.assign({}, base, { pose: v[1], poseOf: id }); const g = XPEEPS.svg(el);
        o += '<g transform="translate(' + (170 * SCL + i * 340 * SCL) + ' ' + (520 * SCL - (SCL > 1.3 ? 120 * SCL : 0)) + ') scale(' + SCL + ')">' + g + '</g><text x="' + (20 + i * 340) + '" y="30" font-size="22" font-family="Helvetica">' + id + ' · ' + v[0] + '</text>'; });
      return o + '</svg>'; }, [id, SCL, ONLY]);
    await pg.evaluate(s => { document.body.innerHTML = '<div id="tb" style="position:fixed;left:0;top:0;z-index:99999;background:#fff">' + s + '</div>'; }, svg);
    await pg.waitForTimeout(80);
    await pg.screenshot({ path: out + '/t8_' + id.replace('/', '_') + '.png', clip: { x: 0, y: 0, width: 1700, height: +(process.env.CH||600) } });
    await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(900); await pg.evaluate(async () => { try { closeModal(); } catch (e) { } await XPEEPS.load(); });
  }
  console.log(list.length + ' poses', errs.join('|')); await b.close();
})();
