const { chromium } = require('playwright'); const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1400, height: 1000 } }); const pg = await ctx.newPage(); const errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(() => { if (window.top !== window) return; localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.controle.hide', '1');
    localStorage.setItem('xiii.projets', JSON.stringify({ active: 'pA', list: [{ id: 'pA', title: 'Tokyo Story', debut: '2026-07-10', fin: '2026-07-20' }] })); localStorage.removeItem('xiii.abroad.pA');
    localStorage.setItem('xiii.ata.pA', JSON.stringify({ rows: [{ val: '12000' }, { val: '3500,50' }], head: { countries: 'Japon' } })); });
  await pg.goto('http://localhost:8765/controle.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2500);
  const r0 = await pg.evaluate(() => ({ block: !!document.getElementById('xab') }));
  await pg.evaluate(() => { const s = document.getElementById('xab-c'); s.value = 'Japon'; s.dispatchEvent(new Event('change')); }); await pg.waitForTimeout(200);
  const r1 = await pg.evaluate(() => ({ rows: [...document.querySelectorAll('#xab .ck-r b')].map(x => x.textContent), ata: (document.querySelector('#xab').textContent.match(/Liste préparée[^—]*/) || [''])[0], tz: (document.querySelector('#xab').textContent.match(/\+\d+ h[^—]*/) || [''])[0], elec: (document.querySelector('#xab').textContent.match(/Prises A \/ B[^:]*/) || [''])[0] }));
  await pg.evaluate(() => { const c = document.querySelector('#xab [data-k="visa"]'); c.checked = true; c.dispatchEvent(new Event('change')); }); await pg.waitForTimeout(100);
  await pg.evaluate(() => { XAI.configured = () => true; XAI.ask = async () => JSON.stringify({ items: [{ t: 'Jours fériés', det: 'Umi no Hi (3e lundi de juillet) : à vérifier' }] }); document.getElementById('xab-ai').click(); }); await pg.waitForTimeout(400);
  await pg.evaluate(() => { const s = document.getElementById('xab-c'); s.value = 'Belgique'; s.dispatchEvent(new Event('change')); }); await pg.waitForTimeout(100);
  const r2 = await pg.evaluate(() => ({ be: [...document.querySelectorAll('#xab .ck-r b')].map(x => x.textContent).slice(0, 3), st: JSON.parse(localStorage.getItem('xiii.abroad.pA')) }));
  await pg.evaluate(() => { const s = document.getElementById('xab-c'); s.value = 'Japon'; s.dispatchEvent(new Event('change')); render(); }); await pg.waitForTimeout(200);
  await pg.evaluate(() => document.getElementById('xab').scrollIntoView()); await pg.screenshot({ path: OUT + '/ab1.png' });
  console.log(JSON.stringify({ r0, r1, r2 }, null, 1), 'ERR', errs.join('|')); await b.close();
})();
