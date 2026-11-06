// bouton ⏹ Arrêter pendant une réponse en continu
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const pg = await ctx.newPage();
  await ctx.route('**/*', async r => { const u = r.request().url(); if (/anthropic/.test(u)) { await new Promise(z => setTimeout(z, 4000)); return r.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: 'data: {"type":"content_block_delta","delta":{"text":"trop tard"}}\n\n' }).catch(() => { }); } if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.ai', JSON.stringify({ p: 'anthropic', keys: { anthropic: 'k' }, models: {}, urls: {} })); } catch (e) { } });
  await pg.goto('http://localhost:8765/matos.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  await pg.evaluate(() => { document.querySelectorAll('#xt-root').forEach(m => m.remove()); XAIC.mount(); XAIC.open(); });
  await pg.waitForTimeout(300); await pg.fill('#xaic textarea', 'test'); await pg.click('#xaic button:has-text("Envoyer")'); await pg.waitForTimeout(500);
  const has = await pg.evaluate(() => [!!document.querySelector('#xaic [data-stop]'), document.querySelector('#xaic .l') && document.querySelector('#xaic .l').innerText.slice(-200), XAI.configured()]); console.log(JSON.stringify(has)); await pg.click('#xaic [data-stop]'); await pg.waitForTimeout(500);
  const last = await pg.evaluate(() => [...document.querySelectorAll('#xaic .m.a')].pop().textContent);
  console.log(JSON.stringify({ has, last })); await b.close();
})();
