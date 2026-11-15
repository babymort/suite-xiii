// ZZ « Rien ne bouge ni ne clignote » : après le lever du rideau, on suit 4 s les boutons, titres, onglets, panneaux :
// déplacement (> 2 px) ou apparition / disparition répétée = clignotement. + décalages de mise en page (layout-shift).
const { chromium } = require('playwright'); const fs = require('fs');
const pages = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const out = []; const Q = pages.slice();
  await Promise.all([0].map(async () => { while (Q.length) { const pg = Q.shift(); const app = pg.replace(/\.html.*/, ''); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    await ctx.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); localStorage.setItem('xiii.news.seen', JSON.stringify({ ver: 'x', k: [] })); } catch (e) { }
      window.__ls = []; let up = 0; const t0 = performance.now(); let seen = 0;
      const iv = setInterval(() => { const H = document.documentElement; if (!H) return; if (H.classList.contains('xb0')) seen = 1; else if (seen || document.readyState === 'complete') { up = performance.now(); window.__up = up - t0; clearInterval(iv); } }, 10);
      try { new PerformanceObserver(l => l.getEntries().forEach(e => { if (up && !e.hadRecentInput && e.value > 0.001) window.__ls.push([Math.round(performance.now() - up), +e.value.toFixed(4), (e.sources || []).map(s => s.node && (s.node.id ? '#' + s.node.id : (s.node.className && typeof s.node.className === 'string' ? '.' + s.node.className.split(' ')[0] : s.node.nodeName))).filter(Boolean).slice(0, 3).join(',')]); })).observe({ type: 'layout-shift', buffered: true }); } catch (e) { }
    }, app);
    const p = await ctx.newPage(); const res = { pg };
    try { await p.goto('http://localhost:8765/' + pg + (pg.includes('?') ? '' : '?desktop=1'), { timeout: 30000 });
      await p.waitForFunction(() => window.__up > 0, null, { timeout: 15000 }).catch(() => { });
      const snap = () => p.evaluate(() => { const M = {}; let i = 0; document.querySelectorAll('button,h1,h2,h3,[role=tab],#top-bar,#toolbar,.tab,.card,a.tile,.tile,nav a,input,select').forEach(e => { if (e.closest('#xt-root,#xtp,.xtp,#xws-line')) return; const r = e.getBoundingClientRect(); const v = r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(e).visibility !== 'hidden' && +getComputedStyle(e).opacity > .05; const k = (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + (typeof e.className === 'string' ? e.className.split(' ')[0] : '') + ':' + (e.textContent || '').trim().slice(0, 14)) + '@' + (i++ % 100000); if (!e.__xk) e.__xk = k; M[e.__xk] = v ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : 0; }); return M; });
      const S = []; await p.waitForTimeout(150); for (let t = 0; t < 20; t++) { S.push(await snap()); await p.waitForTimeout(200); }
      const keys = new Set(S.flatMap(s => Object.keys(s))); const moved = [], blink = [];
      for (const k of keys) { const seq = S.map(s => s[k]); let tog = 0, last = null, mv = 0; for (const v of seq) { if (v === undefined) continue; const vis = !!v; if (last !== null && vis !== last.vis) tog++; if (last && last.v && v && (Math.abs(v[0] - last.v[0]) > 2 || Math.abs(v[1] - last.v[1]) > 2)) mv++; last = { vis, v }; } if (tog >= 2) blink.push(k.split('@')[0]); else if (mv) moved.push(k.split('@')[0]); }
      res.up = await p.evaluate(() => Math.round(window.__up || -1)); res.ls = await p.evaluate(() => window.__ls); res.moved = [...new Set(moved)]; res.blink = [...new Set(blink)];
    } catch (e) { res.err = e.message.slice(0, 80); }
    out.push(res); await ctx.close(); } }));
  out.sort((a, b) => a.pg.localeCompare(b.pg)); fs.writeFileSync('/tmp/zz/motion2.json', JSON.stringify(out));
  for (const r of out) { const cls = (r.ls || []).reduce((a, e) => a + e[1], 0); console.log(r.pg.padEnd(16), 'rideau', r.up, '· CLS', cls.toFixed(3), '· bouge', (r.moved || []).length, (r.moved || []).slice(0, 4).join(' | '), '· clignote', (r.blink || []).length, (r.blink || []).slice(0, 3).join(' | '), r.err || ''); }
  await b.close(); })();
