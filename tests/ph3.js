// vérifie que plusieurs images partent bien dans la requête (Claude, Gemini, OpenAI) — réseau intercepté
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const pg = await ctx.newPage(); const seen = {};
  await ctx.route('**/*', r => { const u = r.request().url();
    if (/anthropic|googleapis|openai/.test(u)) { const body = JSON.parse(r.request().postData() || '{}'); const k = /anthropic/.test(u) ? 'claude' : /google/.test(u) ? 'gemini' : 'openai';
      const c = k === 'claude' ? body.messages[0].content.filter(x => x.type === 'image').length : k === 'gemini' ? body.contents[0].parts.filter(x => x.inline_data).length : body.messages[0].content.filter(x => x.type === 'image_url').length; seen[k] = c;
      const resp = k === 'claude' ? { content: [{ type: 'text', text: '{"ok":1}' }] } : k === 'gemini' ? { candidates: [{ content: { parts: [{ text: '{"ok":1}' }] } }] } : { choices: [{ message: { content: '{"ok":1}' } }] };
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(resp) }); }
    if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  await pg.goto('http://localhost:8765/plano.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1500);
  const out = await pg.evaluate(async () => { const im = { mediaType: 'image/jpeg', base64: '/9j/AAA' }, res = {};
    for (const p of ['anthropic', 'gemini', 'openai']) { localStorage.setItem('xiii.ai', JSON.stringify({ p, keys: { [p]: 'test-key' }, models: {}, urls: {} }));
      try { res[p] = await XAI.ask('test', { images: [im, im, im] }); } catch (e) { res[p] = 'ERR ' + e.message; } }
    localStorage.removeItem('xiii.ai'); return res; });
  console.log(JSON.stringify({ out, seen })); await b.close();
})();
