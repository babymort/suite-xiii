// CHARGEMENT D'UN SEUL COUP : rideau levé quand ? Qu'est-ce qui bouge / apparaît encore après (3 s) ?
const { chromium } = require('playwright'); const fs = require('fs');
const pages = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const out = []; const Q = pages.slice();
  await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const pg = Q.shift(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { }
      window.__ev = []; const t0 = performance.now(); let up = 0;
      let seen = 0; const iv = setInterval(() => { const H = document.documentElement; if (!H) return; if (H.classList.contains('xb0')) seen = 1; else if (seen || document.readyState === 'complete') { up = performance.now(); window.__up = up - t0; clearInterval(iv); } }, 10);
      try { new PerformanceObserver(l => l.getEntries().forEach(e => { if (up && !e.hadRecentInput) window.__ev.push(['décalage', Math.round(performance.now() - up), +e.value.toFixed(4), (e.sources || []).map(s => s.node && (s.node.id || s.node.className || s.node.tagName)).filter(Boolean).slice(0, 3).join(',')]); })).observe({ type: 'layout-shift', buffered: true }); } catch (e) { }
      const mo = new MutationObserver(ms => { if (!up) return; const dt = performance.now() - up; if (dt > 3000) return; ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType !== 1) return; const r = n.getBoundingClientRect(); if (r.width * r.height < 400 || r.bottom < 0 || r.top > innerHeight) return; const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || +cs.opacity === 0) return; if (/^(xt-|xtp|toast|xce-|xcv-|xpv)/.test(n.id || '') ) return; window.__ev.push(['ajout', Math.round(dt), (n.id ? '#' + n.id : n.tagName.toLowerCase() + '.' + String(n.className || '').split(' ')[0]).slice(0, 40), Math.round(r.width) + '×' + Math.round(r.height)]); })); });
      addEventListener('DOMContentLoaded', () => mo.observe(document.body, { childList: true, subtree: true })); });
    const p = await ctx.newPage(); await p.goto('http://localhost:8765/' + pg + (pg.includes('?') ? '' : '?desktop=1')).catch(() => { }); await p.waitForTimeout(5500);
    const r = await p.evaluate(() => ({ up: Math.round(window.__up || -1), ev: window.__ev })).catch(e => ({ up: -1, ev: [['err', e.message]] }));
    // dans l'espace, l'accueil est dans un cadre
    out.push([pg, r]); await ctx.close(); } }));
  out.sort((a, b) => a[0].localeCompare(b[0]));
  for (const [pg, r] of out) { const sh = r.ev.filter(e => e[0] === 'décalage'), ad = r.ev.filter(e => e[0] === 'ajout'); const cls = sh.reduce((a, e) => a + e[2], 0);
    console.log(pg.padEnd(18) + ' rideau ' + String(r.up).padStart(5) + ' ms · décalages ' + cls.toFixed(3) + ' (' + sh.length + ') · ajouts visibles ' + ad.length + (ad.length ? ' : ' + ad.slice(0, 4).map(e => e[2] + '@' + e[1]).join(' ') : '') + (sh.length ? ' | ' + sh.slice(0, 3).map(e => e[3] + '@' + e[1]).join(' ') : '')); }
  fs.writeFileSync('/tmp/zz/boot.json', JSON.stringify(out)); await b.close(); })();
