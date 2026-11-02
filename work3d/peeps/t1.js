const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); }); pg.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2500);
  const r = await pg.evaluate(async () => {
    try { closeModal(); } catch (e) { } document.querySelectorAll('.xtip,#xtip,[class*=tip]').forEach(x => { if (x.textContent.includes('Toujours au même')) x.remove(); });
    const o = {}; o.view = prefs.view; o.has = typeof XPEEPS;
    await XPEEPS.load(); o.T = XPEEPS.data().T.length;
    XPEEPS.addTpl(0); XPEEPS.addTpl(20); XPEEPS.addTpl(40);
    o.els = PN().els.map(e => e.type + ':' + (e.pPose || ''));
    return o;
  });
  console.log(JSON.stringify(r));
  await pg.waitForTimeout(800);
  await pg.screenshot({ path: process.argv[2] + '/s1.png' });
  const st = await pg.$('#stage'); if (st) await st.screenshot({ path: process.argv[2] + '/stage1.png' });
  console.log(errs.slice(0, 10).join('\n'));
  await b.close();
})();
