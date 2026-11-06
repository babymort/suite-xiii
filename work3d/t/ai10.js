// passerelles depuis le volet IA (MATOS)
const { chromium } = require('playwright'); const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const pg = await ctx.newPage(); const errs = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); });
  await pg.goto('http://localhost:8765/matos.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  await pg.evaluate(() => { try { XTOUR && XTOUR.end && XTOUR.end(); } catch (e) { } document.querySelectorAll('#xt-root').forEach(m => m.remove()); window.__asked = 0; XAI.configured = () => true; XAI.ask = async p => { window.__asked++; window.__p = p; return '{"items":[{"id":"packingo","pourquoi":"Le matériel réservé doit être mis en caisses avant le départ."},{"id":"zz","pourquoi":"x"}]}'; }; XAIC.open(); });
  await pg.waitForTimeout(300);
  // 1. intention directe
  await pg.fill('#xaic textarea', 'Envoie le matériel vers DEVISO'); await pg.click('#xaic button:has-text("Envoyer")'); await pg.waitForTimeout(300);
  const r1 = await pg.evaluate(() => ({ asked: window.__asked, card: !!document.getElementById('xaic-gate'), go: [...document.querySelectorAll('#xaic-gate [data-go]')].map(b => b.dataset.go) }));
  // 2. 🔀 avec l'IA
  await pg.fill('#xaic textarea', 'on part demain, il faut préparer les caisses'); await pg.click('#xaic [data-gate]'); await pg.waitForTimeout(500);
  const r2 = await pg.evaluate(() => ({ asked: window.__asked, list: /packingo = /.test(window.__p), go: [...document.querySelectorAll('#xaic-gate [data-go]')].map(b => b.dataset.go), why: (document.querySelector('#xaic-gate i') || {}).textContent }));
  await pg.screenshot({ path: OUT + '/ai10.png' });
  // 3. 🔀 champ vide : toutes
  await pg.click('#xaic [data-gate]'); await pg.waitForTimeout(300);
  const r3 = await pg.evaluate(() => [...document.querySelectorAll('#xaic-gate [data-go]')].map(b => b.dataset.go));
  // 4. clic : la passerelle part
  const nav = pg.waitForEvent('framenavigated', { timeout: 5000 }).catch(() => null); const pop = ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await pg.click('#xaic-gate [data-go="deviso"]'); await pg.waitForTimeout(1500); await pg.screenshot({ path: OUT + '/ai10b.png' });
  const r4 = { url: pg.url(), pages: ctx.pages().map(p => p.url()), ov: await pg.evaluate(() => !!document.querySelector('#xiii-send,#xgt-ov,#xgt-done')).catch(() => 'nav') };
  console.log(JSON.stringify({ r1, r2, r3, r4 }), 'ERR', errs.join('|')); await b.close();
})();
