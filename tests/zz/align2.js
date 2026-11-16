// ESPACEMENT ET ALIGNEMENT : barres de chaque outil — hauteurs, alignement vertical, écarts dans un groupe, icône centrée
const { chromium } = require('playwright'); const fs = require('fs');
const apps = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const Q = apps.slice(), out = [];
 await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const a = Q.shift(); const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
  const p = await ctx.newPage();
  try { await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(3500);
   out.push([a, await p.evaluate(() => { const R = {};
    for (const id of ['top-bar', 'toolbar']) { const bar = document.getElementById(id); if (!bar) continue;
     const B = [...bar.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 6 && r.height > 6 && r.left < innerWidth && getComputedStyle(x).visibility !== 'hidden' && !x.closest('#tabs-container,.xn-auth,#xid-chip'); });
     const lab = x => (x.id || ((x.querySelector('.btn-label') || {}).textContent || x.title || '').trim().slice(0, 14));
     const H = {}, C = {}; B.forEach(x => { const r = x.getBoundingClientRect(); const h = Math.round(r.height); H[h] = (H[h] || 0) + 1; const c = Math.round(r.top + r.height / 2); C[c] = (C[c] || 0) + 1; });
     const hMain = +Object.entries(H).sort((x, y) => y[1] - x[1])[0][0], cMain = +Object.entries(C).sort((x, y) => y[1] - x[1])[0][0];
     const odd = B.filter(x => { const r = x.getBoundingClientRect(); return Math.abs(r.height - hMain) > 2 && !/select/i.test(x.tagName); }).map(x => lab(x) + ' ' + Math.round(x.getBoundingClientRect().height) + 'px');
     const off = B.filter(x => { const r = x.getBoundingClientRect(); return Math.abs(r.top + r.height / 2 - cMain) > 2; }).map(x => lab(x) + ' décalé ' + Math.round(x.getBoundingClientRect().top + x.getBoundingClientRect().height / 2 - cMain) + 'px');
     // écarts entre voisins d'un même parent (groupe)
     const gaps = {}; B.forEach((x, i) => { const y = B[i + 1]; if (!y || y.parentElement !== x.parentElement) return; const g = Math.round(y.getBoundingClientRect().left - x.getBoundingClientRect().right); gaps[g] = (gaps[g] || 0) + 1; });
     // icône centrée dans son bouton (boutons sans libellé visible)
     const ic = B.filter(x => { const s = x.querySelector('svg'); if (!s || !s.getClientRects().length) return false; const lb = x.querySelector('.btn-label'); if (lb && lb.getClientRects().length && lb.getBoundingClientRect().width > 2) return false; const r = x.getBoundingClientRect(), q = s.getBoundingClientRect(); return Math.abs((q.left + q.width / 2) - (r.left + r.width / 2)) > 1.5 || Math.abs((q.top + q.height / 2) - (r.top + r.height / 2)) > 1.5; }).map(x => { const r = x.getBoundingClientRect(), q = x.querySelector('svg').getBoundingClientRect(); return lab(x) + ' (' + Math.round((q.left + q.width / 2) - (r.left + r.width / 2)) + ',' + Math.round((q.top + q.height / 2) - (r.top + r.height / 2)) + ')'; });
     R[id] = { n: B.length, h: hMain, odd, off, gaps, ic }; }
    return R; })]);
  } catch (e) { out.push([a, { err: e.message.slice(0, 60) }]); } await ctx.close(); } }));
 out.sort((x, y) => x[0].localeCompare(y[0])); const H = {};
 for (const [a, R] of out) { const lines = []; if (R.err) { console.log(a, "ERR", R.err); continue; } for (const id in R) { const r = R[id]; if (!r || r.err) { lines.push(id + ' ' + (r && r.err)); continue; } (H[id] = H[id] || {})[r.h] = ((H[id] || {})[r.h] || 0) + 1;
   const gl = Object.entries(r.gaps).sort((x, y) => y[1] - x[1]); const gOdd = gl.slice(1).filter(g => Math.abs(+g[0] - +gl[0][0]) > 1);
   if (r.odd.length || r.off.length || r.ic.length || gOdd.length) lines.push(id + ' h=' + r.h + (r.odd.length ? ' · hauteur différente : ' + r.odd.slice(0, 4).join(', ') : '') + (r.off.length ? ' · désalignés : ' + r.off.slice(0, 4).join(', ') : '') + (gOdd.length ? ' · écarts ' + gl.map(g => g[0] + 'px×' + g[1]).join(' ') : '') + (r.ic.length ? ' · icône décentrée : ' + r.ic.slice(0, 4).join(', ') : '')); }
  if (lines.length) console.log(a.padEnd(12), lines.join('\n             ')); }
 console.log('hauteur des boutons par barre (nb d\'outils) :', JSON.stringify(H)); await b.close(); })();
