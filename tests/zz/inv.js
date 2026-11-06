// Inventaire des boutons visibles : barres du haut (y<150) et boutons flottants (position fixed)
const { chromium } = require('playwright'); const fs = require('fs');
const pages = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } }); const out = {};
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); for (const k of Object.keys(localStorage)) { } });
  for (const p of pages) { const pg = await ctx.newPage(); const app = p.replace('.html', '');
    await pg.addInitScript(a => { localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, app);
    try { await pg.goto('http://localhost:8765/' + p + '?desktop=1', { waitUntil: 'load', timeout: 20000 }); await pg.waitForTimeout(+process.env.WAIT||1500);
      out[app] = await pg.evaluate(() => { document.querySelectorAll('#xt-root').forEach(m => m.remove()); const R = [];
        document.querySelectorAll('button,a.btn,[role=button],select').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return;
          let fixed = false; for (let x = e; x && x !== document.body; x = x.parentElement) if (getComputedStyle(x).position === 'fixed') { fixed = true; break; }
          if (!(r.top < 150 || fixed)) return; if (e.closest('.modal,#modal-ov,[role=dialog]')) return;
          R.push({ id: e.id || '', t: (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40), ti: (e.title || e.getAttribute('aria-label') || '').slice(0, 60), x: Math.round(r.left), y: Math.round(r.top), f: fixed ? 1 : 0, par: (e.parentElement && (e.parentElement.id || e.parentElement.className) || '').toString().slice(0, 30) }); });
        return R; }); } catch (e) { out[app] = 'ERR ' + e.message.slice(0, 80); }
    await pg.close(); }
  fs.writeFileSync('inv.json', JSON.stringify(out, null, 0)); await b.close(); })();
