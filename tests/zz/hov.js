// Survol des boutons : le libellé qui s'ouvre au survol est-il caché par un autre élément ou coupé ?
const { chromium } = require('playwright'); const [w, ...pages] = process.argv.slice(2); const fs = require('fs');
(async () => { const b = await chromium.launch(); const R = {};
  for (const p of pages) { const ctx = await b.newContext({ viewport: { width: +w, height: 800 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); await pg.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } }, p.replace('.html', ''));
    try { await pg.goto('http://localhost:8765/' + p + '?desktop=1', { timeout: 30000 }); await pg.waitForTimeout(3200); await pg.evaluate(() => document.querySelectorAll('#xt-root,#xtp,#xoff').forEach(m => m.remove()));
    const ids = await pg.evaluate(() => [...document.querySelectorAll('#top-bar button,#toolbar button')].filter(e => e.offsetParent && e.querySelector('.btn-label')).map((e, i) => { e.dataset.hv = i; return i; }));
    const bad = [];
    for (const i of ids) { const el = await pg.$('[data-hv="' + i + '"]'); if (!el) continue; try { await el.hover({ timeout: 1500, force: true }); } catch (e) { continue; } await pg.waitForTimeout(380);
      const r = await pg.evaluate(i => { const e = document.querySelector('[data-hv="' + i + '"]'), l = e.querySelector('.btn-label'); const cs = getComputedStyle(l); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .5) return null; const q = l.getBoundingClientRect(), r = e.getBoundingClientRect(); if (q.width < 3) return null;
        const pts = [0.2, 0.5, 0.85].map(f => document.elementFromPoint(q.left + q.width * f, q.top + q.height / 2)); const hid = pts.filter(t => t && !e.contains(t)).map(t => (t.id || t.placeholder || t.title || t.className || t.tagName).toString().slice(0, 24));
        const cut = q.right > r.right + 2 && getComputedStyle(e).overflow !== 'visible';
        return hid.length || cut || q.right > innerWidth ? { b: e.id || e.title.slice(0, 30), lab: l.textContent.trim().slice(0, 20), hid, cut, out: q.right > innerWidth } : null; }, i);
      if (r) bad.push(r); }
    if (bad.length) R[p] = bad; } catch (e) { R[p] = 'ERR ' + e.message.slice(0, 60); }
    await ctx.close(); }
  fs.writeFileSync('hov_' + w + '.json', JSON.stringify(R)); console.log(JSON.stringify(R).slice(0, 3000)); await b.close(); })();
