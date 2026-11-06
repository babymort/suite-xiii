const { chromium } = require('playwright'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); } catch (e) { } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  const r = await pg.evaluate(async () => { try { closeModal(); } catch (e) { } await XPEEPS.load(); const D = XPEEPS.data();
    const i = D.T.findIndex(t => t[0] === 'Lou' && t[1].startsWith('standing/resting')); XPEEPS.addTpl(i); const el = PN().els[0]; SEL = el.id; XEXPERT.setAll(true);
    const J = XPEEPS.joints(el), R0 = J.R0; el.pose = { rUA: R0.rUA + 150, rFA: R0.rFA - 80 }; el.poseOf = el.pPose; renderStage(); renderProps(); return { i, pose: el.pPose, name: D.T[i] }; });
  await pg.waitForTimeout(500);
  const st = await pg.$('#stage'); await st.screenshot({ path: out + '/t10_lou.png' });
  // glisser la poignée de l'avant-bras pour vérifier que l'interaction marche toujours
  const h = await pg.evaluate(() => { const j = document.querySelectorAll('#ovl .jt'); return j.length; });
  console.log(JSON.stringify(r), 'poignées', h, errs.join('|')); await b.close();
})();
