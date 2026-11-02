const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await pg.addInitScript(() => { try { if (!localStorage.getItem('xiii.tips.off')) { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); } } catch (e) { } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  const r = await pg.evaluate(async () => { try { closeModal(); } catch (e) { } addPuppet('homme'); const el = PN().els[0]; SEL = el.id; renderStage(); renderProps(); setLibTab('pup');
    const o = { sw: !!document.getElementById('xexp'), normal: document.querySelectorAll('#ovl .jt').length, poses: /applyPose/.test($('lib-list').innerHTML) };
    el.expert = true; renderStage(); o.perso = document.querySelectorAll('#ovl .jt').length; el.expert = false;
    PN().expert = true; renderStage(); o.plan = document.querySelectorAll('#ovl .jt').length; PN().expert = false;
    XEXPERT.setAll(true); o.tout = document.querySelectorAll('#ovl .jt').length; o.posesExp = /applyPose/.test($('lib-list').innerHTML); XEXPERT.setAll(false); return o; });
  const g = await pg.$('#stage [data-eid]'); const bb = await g.boundingBox(); await pg.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' });
  r.menu = await pg.evaluate(() => (document.getElementById('sb-ctx') || {}).textContent);
  console.log(JSON.stringify(r), errs.join('|')); await b.close();
})();
