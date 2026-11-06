// Service worker : réseau lent (3 s) → la page en cache s'ouvre en moins d'une seconde ; hors ligne → page du cache
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ serviceWorkers: 'allow' }); const pg = await ctx.newPage(); const U = 'http://localhost:8766/casto.html';
  try { fs.unlinkSync('/tmp/xslow'); } catch (e) { }
  await pg.goto(U); await pg.waitForTimeout(1500);
  const reg = await pg.evaluate(async () => { const r = await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; return !!r; });
  await pg.waitForTimeout(6000); await pg.reload(); await pg.waitForTimeout(1500);
  const ctl = await pg.evaluate(() => !!navigator.serviceWorker.controller);
  fs.writeFileSync('/tmp/xslow', '1'); let t = Date.now(); await pg.goto(U, { waitUntil: 'domcontentloaded' }); const slowMs = Date.now() - t;
  fs.unlinkSync('/tmp/xslow'); t = Date.now(); await pg.goto(U, { waitUntil: 'domcontentloaded' }); const fastMs = Date.now() - t;
  await ctx.setOffline(true); t = Date.now(); let off = ''; try { await pg.goto(U, { waitUntil: 'domcontentloaded' }); off = (await pg.title()) + ' ' + (Date.now() - t) + ' ms'; } catch (e) { off = 'ERR ' + e.message.slice(0, 60); }
  console.log(JSON.stringify({ reg, ctl, slowMs, fastMs, off })); await b.close(); })();
