// feuille éclatée d'une pose en PNG
const { chromium } = require('playwright'); const out = process.argv[2]; const ids = process.argv.slice(3);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 2400, height: 1600 } });
  await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); } catch (e) { } });
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { try { closeModal(); } catch (e) { } await XPEEPS.load(); });
  for (const id of ids) {
    const s = await pg.evaluate(id => XPEEPS.sheetSvg({ pPose: id, pHead: 'Short 1', pFace: 'Calm', pFill: '#ffffff', pSkin: '#ffffff', name: 'Test' }), id);
    await pg.evaluate(s => { document.body.innerHTML = '<div style="position:fixed;left:0;top:0;z-index:99999;background:#fff">' + s.replace('<svg', '<svg width="2400" height="1600"') + '</div>'; }, s);
    await pg.waitForTimeout(100);
    await pg.screenshot({ path: out + '/t9_' + id.replace('/', '_') + '.png', clip: { x: 600, y: 120, width: 920, height: 1450 } });
    await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(700); await pg.evaluate(async () => { try { closeModal(); } catch (e) { } await XPEEPS.load(); });
  }
  await b.close();
})();
