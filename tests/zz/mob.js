// Téléphone : affichage (débordement horizontal, éléments hors écran, textes trop petits), tactile (cibles < 40 px),
// erreurs JS, avec projet vide puis exemple type ; portrait et paysage ; hors ligne (service worker) en option
// node mob.js <sortie.json> <appareil: iphone|pixel> page…
const { chromium, devices } = require('playwright'); const fs = require('fs');
const [out, dev, ...pages] = process.argv.slice(2);
const D = dev === 'pixel' ? devices['Pixel 7'] : devices['iPhone 13'];
const NOISE = /Failed to load resource|net::ERR|favicon|ResizeObserver|status of 4\d\d|AbortError|NetworkError|Failed to fetch|Load failed|CORS|serviceWorker|ServiceWorker/i;
(async () => { const b = await chromium.launch(); const R = {};
  const audit = async (pg, tag) => pg.evaluate(() => {
    const W = innerWidth, P = { tiny: [], small: [], out: [], ovx: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0) - W };
    const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > .05 && r.bottom > 0 && r.top < innerHeight * 3; };
    let scrollerOf = e => { for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return x; } return null; };
    [...document.querySelectorAll('button,a[href],input:not([type=hidden]),select,[role=button],label.switch,summary')].filter(vis).forEach(e => { const r = e.getBoundingClientRect(); const nm = (e.id || e.getAttribute('aria-label') || e.title || e.textContent || e.placeholder || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 28);
      if ((r.width < 40 || r.height < 36) && !(e.tagName === 'INPUT' && /checkbox|radio/.test(e.type)) && !e.closest('#xb-master,.xb-x')) P.tiny.push(nm + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
      if ((r.right > W + 2 || r.left < -2) && !scrollerOf(e)) P.out.push(nm); });
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, k = 0; while ((n = tw.nextNode()) && k < 4000) { k++; const t = n.textContent.trim(); if (t.length < 3) continue; const el = n.parentElement; if (!el || !vis(el)) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 11) P.small.push(t.slice(0, 24) + ' ' + fs + 'px'); }
    P.tiny = [...new Set(P.tiny)]; P.small = [...new Set(P.small)].slice(0, 30); P.out = [...new Set(P.out)]; return P; }).catch(e => ({ err: e.message }));
  for (const p of pages) { const app = p.replace(/(-m)?\.html.*/, ''); const res = { E: [] };
    for (const mode of ['vide', 'exemple']) { const ctx = await b.newContext({ ...D }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
      await ctx.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); localStorage.setItem('xiii.tour2.' + a + '-m.hide', '1'); } catch (e) { } }, app);
      const pg = await ctx.newPage(); pg.on('pageerror', e => res.E.push([mode, 'JS', e.message.slice(0, 160)])); pg.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) res.E.push([mode, 'console', m.text().slice(0, 160)]); }); pg.on('dialog', d => d.dismiss().catch(() => { }));
      try { if (mode === 'exemple') { await pg.goto('http://localhost:8765/' + app + '.html?desktop=1'); await pg.waitForTimeout(2200); await pg.evaluate(async a => { try { await XMODELS.apply(a, 'tv', false); } catch (e) { } }, app).catch(() => { }); }
        await pg.goto('http://localhost:8765/' + p, { timeout: 25000 }); await pg.waitForTimeout(2800); await pg.evaluate(() => document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove())).catch(() => { });
        if (mode === 'exemple') { const ex = await pg.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /essayer avec un exemple|charger un exemple|exemple/i.test(x.textContent) && x.offsetParent); if (b) { b.click(); return b.textContent.trim().slice(0, 30); } return ''; }).catch(() => ''); res.ex = ex; await pg.waitForTimeout(1500);
          // tour des onglets du bas (navigation tactile) : chaque vue est contrôlée
          const tabs = await pg.evaluate(() => { const nav = [...document.querySelectorAll('nav,.m-tabs,.tabbar,.m-nav,footer,[class*=bottom]')].find(n => { const r = n.getBoundingClientRect(); return r.bottom >= innerHeight - 4 && r.height < 110 && n.querySelectorAll('button,a').length >= 2; }); if (!nav) return []; return [...nav.querySelectorAll('button,a')].filter(b => b.offsetParent).map((b, i) => { b.dataset.mt = i; return b.textContent.trim().slice(0, 16); }); }).catch(() => []);
          res.views = {}; for (let i = 0; i < tabs.length; i++) { try { await pg.tap('[data-mt="' + i + '"]', { timeout: 2000 }); } catch (e) { await pg.evaluate(i => { const b = document.querySelector('[data-mt="' + i + '"]'); if (b) b.click(); }, i).catch(() => { }); } await pg.waitForTimeout(700); const a = await audit(pg); res.views[tabs[i] || i] = { ovx: a.ovx, out: a.out.length, tiny: a.tiny.length, small: a.small.length, tinyL: a.tiny.slice(0, 5), smallL: a.small.slice(0, 4) }; } }
        res[mode] = await audit(pg, mode); res[mode].url = pg.url().replace('http://localhost:8765/', '');
        if (mode === 'exemple') { await pg.screenshot({ path: '/tmp/zz/m_' + p.replace(/\W/g, '_') + '.png' }); await pg.setViewportSize({ width: D.viewport.height, height: D.viewport.width }); await pg.waitForTimeout(700); res.paysage = await audit(pg, 'paysage'); }
      } catch (e) { res.E.push([mode, 'ouverture', e.message.slice(0, 120)]); }
      await ctx.close(); }
    R[p] = res; fs.writeFileSync(out, JSON.stringify(R)); }
  await b.close(); })();
