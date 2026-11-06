// 🔌 création de l'adresse du connecteur (Drive simulé)
const { chromium } = require('playwright'); const OUT = process.argv[2];
const U = 'https://script.google.com/macros/s/AKfycbTESTtestTESTtest123456/exec';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1300, height: 900 } }); const pg = await ctx.newPage(); const errs = []; const seen = [];
  await ctx.route('**/*', async r => { const u = r.request().url(); if (u === U) { const p = JSON.parse(r.request().postData()); seen.push(p.a + (p.droit ? ':' + p.droit : '') + (p.exp ? ':exp' : ''));
      const resp = p.a === 'mkinv' ? { ok: true, tok: 'tABCDEF123' } : p.a === 'team' ? { ok: true, team: [{ tok: 'tOLD', nom: '🤖 Connecteur IA · Claude', droit: 'read', exp: Date.now() + 864e5 * 10, off: 0 }, { tok: 'tX', nom: 'Léa', droit: 'edit' }] } : { ok: true };
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) }); }
    if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(u => { if (window.top !== window) return; localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.drive', JSON.stringify({ url: u, code: 'MASTER-CODE' })); }, U);
  await pg.goto('http://localhost:8765/deviso.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(2000);
  await pg.evaluate(() => { document.querySelectorAll('#xt-root').forEach(m => m.remove()); XAI.configured = () => true; XAIC.open(); });
  await pg.waitForTimeout(300); const hasBtn = await pg.evaluate(() => !!document.querySelector('#xaic [data-mcp]'));
  await pg.evaluate(() => document.querySelector('#xaic [data-mcp]').click()); await pg.waitForTimeout(500);
  const list = await pg.evaluate(() => document.getElementById('xm-list').textContent);
  await pg.evaluate(() => { document.getElementById('xm-d').value = 'edit'; document.getElementById('xm-mk').click(); }); await pg.waitForTimeout(500);
  const url = await pg.evaluate(() => (document.querySelector('#xm-out code') || {}).textContent);
  await pg.screenshot({ path: OUT + '/mc1.png' });
  const k = url.split('/k/')[1], dec = JSON.parse(Buffer.from(k, 'base64url').toString());
  console.log(JSON.stringify({ hasBtn, list, url: url.slice(0, 90) + '…', dec, seen }), 'ERR', errs.join('|')); await b.close();
})();
