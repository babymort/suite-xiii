// réponses en continu : SSE simulé pour Claude, Gemini, OpenAI + volet de chat
const { chromium } = require('playwright');
const sse = (k, parts) => parts.map(t => 'data: ' + JSON.stringify(k === 'claude' ? { type: 'content_block_delta', delta: { type: 'text_delta', text: t } } : k === 'gemini' ? { candidates: [{ content: { parts: [{ text: t }] } }] } : { choices: [{ delta: { content: t } }] }) + '\n\n').join('') + (k === 'openai' ? 'data: [DONE]\n\n' : '');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const pg = await ctx.newPage(); const seen = {};
  await ctx.route('**/*', r => { const u = r.request().url();
    if (/anthropic|googleapis|openai/.test(u)) { const body = JSON.parse(r.request().postData() || '{}'); const k = /anthropic/.test(u) ? 'claude' : /google/.test(u) ? 'gemini' : 'openai'; seen[k] = { stream: !!body.stream || /streamGenerate/.test(u) };
      return r.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: sse(k, ['Bonjour', ', voici ', 'la réponse ', k + '.']) }); }
    if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } });
  await pg.goto('http://localhost:8765/deviso.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1800);
  const out = await pg.evaluate(async () => { const res = {};
    for (const p of ['anthropic', 'gemini', 'openai']) { localStorage.setItem('xiii.ai', JSON.stringify({ p, keys: { [p]: 'test-key' }, models: {}, urls: {} })); let n = 0;
      try { const t = await XAI.ask('test', { onDelta: () => n++ }); res[p] = [t, n]; } catch (e) { res[p] = 'ERR ' + e.message; } }
    // sans onDelta : appel normal (réponse non continue attendue → JSON)
    return res; });
  // volet de chat avec Claude
  await pg.evaluate(() => { localStorage.setItem('xiii.ai', JSON.stringify({ p: 'anthropic', keys: { anthropic: 'test-key' }, models: {}, urls: {} })); document.querySelectorAll('#xt-root').forEach(m => m.remove()); XAIC.mount(); XAIC.open(); });
  await pg.waitForTimeout(400); await pg.fill('#xaic textarea', 'Combien coûte une FX6 ?'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(800);
  const chat = await pg.evaluate(() => [...document.querySelectorAll('#xaic .m.a')].pop().textContent.slice(0, 80));
  await pg.evaluate(() => localStorage.removeItem('xiii.ai'));
  console.log(JSON.stringify({ out, seen, chat }), 'ERR', errs.join('|')); await b.close();
})();
