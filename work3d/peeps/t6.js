const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { if (!localStorage.getItem('xiii.tips.off')) { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.storyboardo.hide', '1'); } } catch (e) { } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  await pg.evaluate(async () => { try { closeModal(); } catch (e) { } await XPEEPS.load(); XPEEPS.addTpl(25); const el = PN().els[PN().els.length - 1]; el.handR = 'pointe'; el.handL = 'salut'; SEL = el.id; renderStage(); renderProps(); });
  await pg.waitForTimeout(300);
  // glisser la poignée du coude avant
  const h = await pg.$('#ovl [data-h="j:rElbow"]'); const bb = await h.boundingBox();
  await pg.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.mouse.down(); await pg.mouse.move(bb.x - 60, bb.y - 120, { steps: 6 }); await pg.mouse.up();
  const hk = await pg.$('#ovl [data-h="j:rKnee"]'); const kb = await hk.boundingBox();
  await pg.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2); await pg.mouse.down(); await pg.mouse.move(kb.x + 90, kb.y - 40, { steps: 6 }); await pg.mouse.up();
  const st = await pg.evaluate(() => { const e = PN().els[PN().els.length - 1]; return { pose: e.pose && Math.round(e.pose.rUA), knee: e.pose && Math.round(e.pose.rTh), poseOf: e.poseOf }; });
  console.log('après glisser', JSON.stringify(st));
  await pg.keyboard.press('Control+z'); const und = await pg.evaluate(() => { const e = PN().els[PN().els.length - 1]; return e.pose && Math.round(e.pose.rTh); }); console.log('après Ctrl+Z genou', und);
  const stage = await pg.$('#stage'); await stage.screenshot({ path: OUT + '/drag.png' });
  // sauvegarde puis rechargement
  await pg.evaluate(() => { try { saveProject(false); } catch (e) { } }); await pg.waitForTimeout(800);
  await pg.reload({ waitUntil: 'load' }); await pg.waitForTimeout(2500);
  const r = await pg.evaluate(() => ({ n: P.panels[0].els.filter(e => e.type === 'peep').length, ready: XPEEPS.ready(), ph: document.querySelector('#stage') && document.querySelector('#stage').innerHTML.includes('Chargement…') }));
  console.log('rechargé', JSON.stringify(r));
  console.log(errs.join('\n')); await b.close();
})();
