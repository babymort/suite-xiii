const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort()); const E = [];
  await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } });
  let pg = await ctx.newPage(); pg.on('pageerror', e => E.push(e.message)); await pg.goto('http://localhost:8766/posto.html?desktop=1'); await pg.waitForTimeout(2300);
  await pg.evaluate(async () => { await XMODELS.apply('posto', 'fiction', false); }); await pg.reload(); await pg.waitForTimeout(2300);
  const r = [];
  for (let i = 0; i < 2; i++) { await pg.goto('http://localhost:8766/posto.html?desktop=1'); await pg.waitForTimeout(2300); await pg.evaluate(() => XGATE.go('planno')); await pg.waitForTimeout(4500);
    const f = pg.frames().find(x => /planno\.html/.test(x.url())); const ban = f ? await f.evaluate(() => { const b = document.getElementById('xps-ok'); if (b) { b.click(); return 'ok'; } return 'pas de bandeau'; }) : 'pas de cadre ' + pg.url();
    await pg.waitForTimeout(1500); const t = await pg.evaluate(() => { const p = JSON.parse(localStorage.getItem('plannoXIII.project') || '{}'); return { n: (p.tasks || []).length, posto: (p.tasks || []).filter(t => /^posto:/.test(t.xsrc || '')).length }; }); r.push({ ban, t }); }
  console.log(JSON.stringify(r), E); await b.close(); })();
