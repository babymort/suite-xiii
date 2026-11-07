// Hors ligne sur téléphone : après une première visite (service worker installé), les pages s'ouvrent sans réseau
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'], serviceWorkers: 'allow' }); const pg = await ctx.newPage();
  await ctx.route(/^(?!http:\/\/localhost)/, r => r.abort());
  await pg.goto('http://localhost:8766/equipe.html'); await pg.waitForTimeout(1500);
  await pg.evaluate(async () => { await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; });
  await pg.waitForTimeout(9000); // pré-cache des pages
  const L = process.argv.slice(2), R = {};
  await ctx.setOffline(true);
  for (const p of L) { try { const t = Date.now(); await pg.goto('http://localhost:8766/' + p, { waitUntil: 'domcontentloaded', timeout: 15000 }); await pg.waitForTimeout(1200); R[p] = (await pg.title()).slice(0, 40) + ' · ' + (Date.now() - t) + ' ms' + ((await pg.content()).includes('pas encore été enregistrée') ? ' ⚠️ non mise en cache' : ''); } catch (e) { R[p] = 'ERR ' + e.message.slice(0, 60); } }
  console.log(JSON.stringify(R, null, 1)); await b.close(); })();
