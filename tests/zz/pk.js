const { chromium } = require('playwright'); const L = process.argv.slice(2).map(x => x.split('>'));
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } window.open = u => { window.__op = (window.__op || []).concat([String(u)]); return null; }; });
  for (const [f, t] of L) { const pg = await ctx.newPage(); const E = []; pg.on('pageerror', e => E.push(e.message)); pg.on('dialog', d => { E.push('dlg ' + d.message().slice(0, 100)); d.accept(); });
    await pg.goto('http://localhost:8766/' + f + '.html?desktop=1'); await pg.waitForTimeout(2300); await pg.evaluate(async p => { try { await XMODELS.apply(p, 'fiction', false); } catch (e) { } }, f); await pg.reload(); await pg.waitForTimeout(2500);
    await pg.evaluate(t => { document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); XGATE.go(t); }, t); await pg.waitForTimeout(900);
    const st = await pg.evaluate(() => [...document.querySelectorAll('label')].filter(l => l.offsetParent && l.querySelector('input[type=checkbox]')).map(l => (l.querySelector('input').checked ? '☑' : '☐') + l.textContent.trim().slice(0, 18)).join(' | '));
    let nav = ''; try { await pg.waitForTimeout(800); nav = pg.url(); } catch (e) { }
    console.log(f + '>' + t, '|', st.slice(0, 200), '|', nav.split('/').pop(), E.join(';')); await pg.close(); }
  await b.close(); })();
