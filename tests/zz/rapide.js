// TOUT EST RAPIDE : rideau levé, tâches longues (> 100 ms) au chargement et pendant les clics des barres, temps de réponse de chaque clic
const { chromium } = require('playwright');
const apps = process.argv.slice(2);
const SEL = () => [...document.querySelectorAll('#top-bar button,#toolbar button')].filter(x => x.getClientRects().length && x.getBoundingClientRect().width > 6 && !x.closest('#xb-home,#tabs-container'));
(async () => { const b = await chromium.launch();
 for (const a of apps) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); if (r.request().isNavigationRequest() && !u.includes('/' + a + '.html')) return r.abort(); return r.continue(); });
  await ctx.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } window.print = () => { }; window.open = () => null;
   window.__lt = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: true }); } catch (e) { }
   window.__up = 0; const iv = setInterval(() => { const c = document.getElementById('xboot'); if (document.body && (!c || getComputedStyle(c).display === 'none' || +getComputedStyle(c).opacity < 0.05)) { window.__up = Math.round(performance.now()); clearInterval(iv); } }, 20); }, a);
  const p = await ctx.newPage(); p.on('dialog', d => d.dismiss().catch(() => { }));
  const R = {};
  try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(4000);
   const L = await p.evaluate(() => ({ up: window.__up, lt: window.__lt.slice() })); R.up = L.up; R.ltLoad = L.lt.filter(x => x > 100); const n0 = L.lt.length; const lat = [];
   const n = await p.evaluate(s => eval(s)().length, SEL.toString());
   for (let i = 0; i < Math.min(n, 40); i++) {
    const t = await p.evaluate(([i, s]) => new Promise(res => { document.querySelectorAll('#xt-root').forEach(x => x.remove()); const x = eval(s)()[i]; if (!x) return res(null);
      const lab = (x.title || x.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24); const t0 = performance.now(); try { x.click(); } catch (e) { }
      requestAnimationFrame(() => setTimeout(() => res([lab, Math.round(performance.now() - t0)]), 0)); }), [i, SEL.toString()]).catch(() => null);
    if (t) lat.push(t); await p.keyboard.press('Escape').catch(() => { }); await p.waitForTimeout(150);
    if (!p.url().includes('/' + a + '.html')) { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(2500); } }
   const lt2 = await p.evaluate(() => window.__lt).catch(() => []); R.ltUse = lt2.slice(n0).filter(x => x > 100);
   R.slow = lat.filter(x => x[1] > 100).sort((x, y) => y[1] - x[1]); R.med = lat.length ? lat.map(x => x[1]).sort((x, y) => x - y)[Math.floor(lat.length / 2)] : 0; R.n = lat.length;
  } catch (e) { R.err = e.message.slice(0, 80); }
  console.log(a.padEnd(12), 'rideau ' + R.up + ' ms · longues au chargement : ' + ((R.ltLoad || []).join(',') || '—') + ' · clic médian ' + R.med + ' ms (' + R.n + ')' + ((R.slow || []).length ? ' · lents : ' + R.slow.slice(0, 4).map(x => '« ' + x[0] + ' » ' + x[1]).join(', ') : '') + (R.err ? ' · ' + R.err : ''));
  await ctx.close(); }
 await b.close(); })();
