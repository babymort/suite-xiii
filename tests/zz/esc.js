// Clavier : chaque fenêtre de la suite s'ouvre, prend le focus (ou du moins le garde dedans) et se ferme avec Échap
// node esc.js <sortie.json> page…     serveur :8765
const { chromium } = require('playwright'); const fs = require('fs');
const [out, ...pages] = process.argv.slice(2);
const OPEN = ['#xgt-btn', '#xm-btn', '#xmd-btn', '#xzz-new', '#xzz-ex', '#xm3d', '#xph3d', '#xcat', '#xcsai', '#xdpai', '#xs-gear', '#xf-btn', '#xsh-btn', '#xaic-btn', '#xhs-btn', '#xmm-btn'];
(async () => { const b = await chromium.launch(); const R = {};
  for (const p of pages) { const app = p.replace('.html', ''); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    await ctx.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } window.open = () => null; }, app);
    const pg = await ctx.newPage(); const res = { E: [], ok: [], ko: [] }; pg.on('pageerror', e => res.E.push(e.message.slice(0, 120))); pg.on('dialog', d => d.dismiss().catch(() => { }));
    try { await pg.goto('http://localhost:8765/' + p + '?desktop=1', { waitUntil: 'load', timeout: 30000 }); await pg.waitForTimeout(4500);
      await pg.evaluate(() => document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()));
      const layers = () => pg.evaluate(() => [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .1) return false; const r = e.getBoundingClientRect(); return r.width * r.height > innerWidth * innerHeight * .04 || (r.width > 160 && r.height > 120); }).map(e => e.id || e.className.toString().split(' ')[0] || e.tagName));
      const base = new Set(await layers());
      for (const sel of OPEN) { const has = await pg.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel); if (!has) continue;
        await pg.waitForTimeout(700); const now = (await layers()).filter(x => !base.has(x)); if (!now.length) { res.ok.push(sel + ' (rien d\'ouvert)'); continue; }
        const inside = await pg.evaluate(() => { const a = document.activeElement; return a && a !== document.body ? (a.id || a.tagName) : 'body'; });
        await pg.keyboard.press('Escape'); await pg.waitForTimeout(450); const left = (await layers()).filter(x => !base.has(x));
        (left.length ? res.ko : res.ok).push(sel + ' → ' + now.slice(0, 2).join(',') + (left.length ? ' reste ouvert : ' + left.slice(0, 2).join(',') : '') + ' · focus ' + inside);
        if (left.length) { await pg.evaluate(ls => ls.forEach(id => { const e = document.getElementById(id); if (e) e.remove(); }), left); }
      }
    } catch (e) { res.E.push('robot ' + e.message.slice(0, 120)); }
    R[app] = res; fs.writeFileSync(out, JSON.stringify(R)); await ctx.close(); }
  await b.close(); })();
