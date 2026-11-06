// dépouillement par l'IA dans DECOUP (IA simulée)
const { chromium } = require('playwright'); const OUT = process.argv[2];
const SC = `INT. CUISINE DE LÉA - NUIT

Léa, pâle, une cicatrice sur la joue, verse du café. Son chat dort sur la chaise.

LÉA
Tu rentres tard.

EXT. RUE - JOUR

Marc court, poursuivi par deux policiers. Il saute par-dessus une voiture. Des passants s'écartent.

MARC
Laissez-moi !`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const pg = await ctx.newPage(); const errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(() => localStorage.setItem('xiii.tips.off', 'true'));
  await pg.goto('http://localhost:8765/decoup.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  const r0 = await pg.evaluate(sc => { document.querySelectorAll('#xt-root').forEach(m => m.remove()); window.__n = 0;
    XAI.configured = () => true; XAI.ask = async p => { window.__n++; window.__p = p; return JSON.stringify({ sequences: [
      { num: '1', el: { acc: ['tasse de café', 'café'], hmc: ['cicatrice sur la joue', 'teint pâle'], ani: ['chat'], zz: ['x'] }, note: 'Chat : prévoir un dresseur' },
      { num: '2', el: { cas: ['saut par-dessus une voiture'], fig: ['8 passants', '2 policiers'], veh: ['voiture garée'] }, muets: ['Policier 1'] }, { num: '99', el: { acc: ['fantôme'] } }] }); };
    dpOpen(); document.getElementById('dp-paste').click(); document.getElementById('dp-txt').value = sc; document.getElementById('dp-an').click();
    const B = dpState(); return { cats: DP_CATS.map(c => c[0]).join(','), scenes: B.scenes.length, before: JSON.stringify(B.scenes.map(s => s.el)), btn: !!document.getElementById('xdpai-btn'), txt: XDPAI.texts(B).map(t => t.length) }; }, SC);
  await pg.click('#xdpai-btn'); await pg.waitForTimeout(600);
  await pg.screenshot({ path: OUT + '/dp1.png' });
  const r1 = await pg.evaluate(() => ({ n: window.__n, hasText: /Son chat dort/.test(window.__p) && /saute par-dessus/.test(window.__p), rows: document.querySelectorAll('#xdpai [data-j]').length }));
  await pg.click('#xdpai-ok'); await pg.waitForTimeout(300);
  const r2 = await pg.evaluate(() => { const B = dpState(); return B.scenes.map(s => ({ num: s.num, chars: s.chars, el: s.el, sum: s.summary })); });
  console.log(JSON.stringify({ r0, r1, r2 }, null, 1), 'ERR', errs.join('|')); await b.close();
})();
