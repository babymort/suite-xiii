const { chromium } = require('playwright'); const [page, fn] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } window.open = u => { window.__op = (window.__op || []).concat([String(u)]); return null; }; });
  const pg = await ctx.newPage(); const E = []; pg.on('pageerror', e => E.push(e.message)); pg.on('dialog', d => { E.push('dlg ' + d.message().slice(0, 100)); d.accept(); });
  await pg.goto('http://localhost:8766/' + page + '.html?desktop=1'); await pg.waitForTimeout(2500);
  await pg.evaluate(async p => { try { await XMODELS.apply(p, 'fiction', false); } catch (e) { } }, page); await pg.reload(); await pg.waitForTimeout(2500);
  await pg.evaluate(f => { document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); window[f](); }, fn); await pg.waitForTimeout(800);
  await pg.screenshot({ path: '/tmp/zz/' + page + '_send.png' });
  console.log(JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && b.closest('.modal-overlay,.modal,[id$=-ov],#modal')).map(b => (b.id || '') + ':' + b.textContent.trim().slice(0, 40)))), E); await b.close(); })();
