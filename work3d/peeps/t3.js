const { chromium } = require('playwright'); const fs = require('fs');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { if (!localStorage.getItem('xiii.tips.off')) { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); } } catch (e) { } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2000);
  await pg.evaluate(() => { try { closeModal(); } catch (e) { } setLibTab('pup'); });
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: OUT + '/ui_lib.png' });
  // clic sur une vignette Open Peeps
  const th = await pg.$$('#xpeeps-lib .sb-th'); console.log('vignettes', th.length);
  await th[3].click(); await pg.waitForTimeout(400);
  await pg.evaluate(() => { prefs.peepCat = 'sitting'; renderLibrary(); }); await pg.waitForTimeout(300);
  const th2 = await pg.$$('#xpeeps-lib .sb-th'); console.log('assis', th2.length); await th2[1].click(); await pg.waitForTimeout(300);
  await pg.evaluate(() => { prefs.peepCat = 'bust'; renderLibrary(); }); const th3 = await pg.$$('#xpeeps-lib .sb-th'); console.log('bustes', th3.length); await th3[5].click(); await pg.waitForTimeout(300);
  // sélectionner le premier personnage, touche E deux fois, T, R
  const info = await pg.evaluate(() => { const els = PN().els; SEL = els[0].id; renderStage(); renderProps(); renderLibrary(); return els.map(e => [e.type, e.pPose, e.pFace, e.s.toFixed(2)]); });
  console.log(JSON.stringify(info));
  await pg.mouse.click(800, 700); await pg.evaluate(() => { SEL = PN().els[0].id; renderStage(); renderProps(); });
  await pg.keyboard.press('e'); await pg.keyboard.press('e'); await pg.keyboard.press('t'); await pg.keyboard.press('r');
  const after = await pg.evaluate(() => { const e = PN().els[0]; return [e.pFace, e.headFlip, JSON.stringify(e.pose).slice(0, 80), document.querySelectorAll('#ovl .jt').length]; });
  console.log('après E E T R', JSON.stringify(after));
  await pg.evaluate(() => applyPose('course')); await pg.waitForTimeout(300);
  await pg.screenshot({ path: OUT + '/ui_stage.png' });
  // poignées cachées pour une pose assise fixe
  const hid = await pg.evaluate(() => { SEL = PN().els[1].id; renderStage(); return document.querySelectorAll('#ovl .jt').length; }); console.log('poignées pose assise', hid);
  // vue éclatée
  await pg.evaluate(() => { SEL = PN().els[0].id; renderStage(); renderProps(); XPEEPS.sheet(); }); await pg.waitForTimeout(1500);
  await pg.screenshot({ path: OUT + '/ui_sheet_modal.png' });
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#xpv-png')]); await dl.saveAs(OUT + '/sheet0.png'); console.log('png', fs.statSync(OUT + '/sheet0.png').size);
  console.log(errs.slice(0, 10).join('\n')); await b.close();
})();
