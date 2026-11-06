// Contrôle des barres d'outils : débordement, retours à la ligne, alignement vertical, hauteurs, chevauchements, écarts, textes coupés
const { chromium } = require('playwright'); const fs = require('fs');
const [vw, vh, theme, out, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const R = {};
  const one = async (ctx, p) => { const pg = await ctx.newPage(); const app = p.replace('.html', '').replace('-m', '');
    await pg.addInitScript(([a, t]) => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); localStorage.setItem('xiii.theme.mode', t); }, [app, theme]);
    try { await pg.goto('http://localhost:8765/' + p + (p.includes('-m') || process.env.NODESK ? '' : '?desktop=1'), { waitUntil: 'load', timeout: 20000 }); await pg.waitForTimeout(4500);
      R[p] = await pg.evaluate(() => { document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); const W = innerWidth, P = [];
        const bars = [...document.querySelectorAll('#top-bar,#toolbar,.top-bar,header.hrow,.m-top,.mtop,header')].filter((x, i, a) => a.indexOf(x) === i && !a.some(y => y !== x && y.contains(x)) && x.getBoundingClientRect().height > 20 && x.getBoundingClientRect().top < 200);
        const okv = e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
        bars.forEach(bar => { const id = bar.id || bar.className.toString().split(' ')[0] || bar.tagName; const br = bar.getBoundingClientRect();
          const it = [...bar.querySelectorAll('button,select,input:not([type=hidden]):not([type=file]):not([type=checkbox]),a.btn,label.xexp')].filter(okv).filter(e => !e.closest('#xb-menu,[role=dialog]') && !e.parentElement.closest('button'));
          const nm = e => (e.id || (e.title || e.textContent || e.tagName).trim().slice(0, 24)).replace(/\s+/g, ' ');
          if (bar.scrollWidth > bar.clientWidth + 2 && getComputedStyle(bar).overflowX !== 'auto') P.push([id, 'déborde', bar.scrollWidth - bar.clientWidth]);
          it.forEach(e => { const r = e.getBoundingClientRect(); let sc = false; for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') { sc = true; break; } } if ((r.right > W + 1 || r.left < -1) && !sc) P.push([id, 'hors écran', nm(e)]); if (sc && (r.right > W + 1)) P.push([id, 'défile', '']); if (e.tagName === 'BUTTON' && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible') P.push([id, 'texte coupé', nm(e)]); });
          const rows = []; it.forEach(e => { const r = e.getBoundingClientRect(), c = r.top + r.height / 2; let row = rows.find(x => Math.abs(x.c - c) < Math.max(10, r.height / 2)); if (!row) rows.push(row = { c, L: [] }); row.L.push([e, r]); });
          if (rows.length > 1) P.push([id, 'lignes', rows.length]);
          rows.forEach(row => { const L = row.L.sort((a, b) => a[1].left - b[1].left), med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
            const cs = L.map(x => x[1].top + x[1].height / 2), mc = med(cs); L.forEach((x, i) => { if (Math.abs(cs[i] - mc) > 3) P.push([id, 'décalé', nm(x[0]) + ' ' + Math.round(cs[i] - mc) + 'px']); });
            const hb = L.filter(x => x[0].tagName === 'BUTTON' && !/xb-brand/.test(x[0].id)).map(x => x[1].height), mh = med(hb); L.forEach(x => { if (x[0].tagName === 'BUTTON' && Math.abs(x[1].height - mh) > 4) P.push([id, 'hauteur', nm(x[0]) + ' ' + Math.round(x[1].height) + '/' + Math.round(mh)]); });
            for (let i = 1; i < L.length; i++) { const g = L[i][1].left - L[i - 1][1].right; if (g < -1) P.push([id, 'chevauche', nm(L[i - 1][0]) + ' / ' + nm(L[i][0]) + ' ' + Math.round(g)]); else if (g < 2 && L[i][0].parentElement === L[i - 1][0].parentElement && !/segment|seg|view-group|tool-group|xu-group/.test(L[i][0].parentElement.className + L[i][0].parentElement.id)) P.push([id, 'collé', nm(L[i - 1][0]) + ' / ' + nm(L[i][0])]); }
            // écarts irréguliers dans un même groupe
            const byP = new Map(); for (let i = 1; i < L.length; i++) if (L[i][0].parentElement === L[i - 1][0].parentElement) { const k = L[i][0].parentElement; if (!byP.has(k)) byP.set(k, []); byP.get(k).push(Math.round(L[i][1].left - L[i - 1][1].right)); }
            byP.forEach((g, k) => { if (g.length > 1 && Math.max(...g) - Math.min(...g) > 4) P.push([id, 'écarts', (k.id || k.className.toString().slice(0, 18)) + ' ' + g.join(',')]); }); });
        }); return P; }); } catch (e) { R[p] = [['page', 'ERR', e.message.slice(0, 60)]]; }
    await pg.close(); };
  const ctxs = await Promise.all([0, 1, 2, 3].map(() => b.newContext({ viewport: { width: +vw, height: +vh }, isMobile: +vw < 600, hasTouch: +vw < 1100 })));
  for (const c of ctxs) await c.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  const Q = pages.slice(); await Promise.all(ctxs.map(async c => { while (Q.length) await one(c, Q.shift()); }));
  fs.writeFileSync(out, JSON.stringify(R)); await b.close(); })();
