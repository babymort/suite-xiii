// Phase B2 — contrôle de la seconde barre rangée par secteurs, dans chaque outil et à plusieurs largeurs :
// un seul séparateur entre deux secteurs visibles (ni en tête, ni en fin, ni deux de suite), aucun chevauchement,
// une seule ligne, rien hors de l'écran ; liste des secteurs et capture de la barre.
// node sect.js <sortie.json> <largeurs,…> outil…   (serveur :8766)
const { chromium } = require('playwright'); const fs = require('fs');
const [out, ws, ...pages] = process.argv.slice(2); const R = {};
(async () => { const b = await chromium.launch();
 for (const w of ws.split(',').map(Number)) { const c = await b.newContext({ viewport: { width: w, height: 850 } }); await c.route(/^(?!http:\/\/localhost)/, r => r.abort());
  await c.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.news.seen', JSON.stringify({ ver: 'x', k: [] })); });
  const Q = pages.slice();
  await Promise.all([0, 1, 2].map(async () => { while (Q.length) { const pg = Q.shift(); const p = await c.newPage(); const E = []; p.on('pageerror', e => E.push(e.message.slice(0, 90)));
   await p.addInitScript(a => localStorage.setItem('xiii.tour2.' + a + '.hide', '1'), pg);
   try { await p.goto('http://localhost:8766/' + pg + '.html?desktop=1', { timeout: 40000 }); await p.waitForTimeout(2200); await p.evaluate(async a => { try { await XMODELS.apply(a, 'fiction', false); } catch (e) { } }, pg); await p.reload(); await p.waitForTimeout(5200);
    await p.evaluate(() => document.querySelectorAll('#xoff,#xtp,#xnw-ov,#xt-root').forEach(e => e.remove()));
    const r = await p.evaluate(() => { const tb = document.getElementById('toolbar'); if (!tb) return null; const pb = []; const V = e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 2 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'; };
      const kids = [...tb.children].filter(V); const seq = kids.map(k => k.classList.contains('divider') ? '|' : k.classList.contains('xsec') ? k.dataset.sec : '?' + (k.id || k.className));
      const s = seq.join(' '); if (/^\|/.test(s) || /\| *$/.test(s.replace(/ etat$/, '')) || /\| \|/.test(s)) pb.push('séparateurs : ' + s);
      const secs = seq.filter(x => x !== '|' && x !== 'etat'); const dv = seq.filter(x => x === '|').length; if (secs.length && dv !== secs.length - 1) pb.push('séparateurs ' + dv + ' pour ' + secs.length + ' secteurs : ' + s);
      if (seq.some(x => x[0] === '?')) pb.push('hors secteur : ' + seq.filter(x => x[0] === '?').join(','));
      ['cre', 'aff', 'mod', 'met', 'ass'].forEach(k => { const n = [...tb.querySelectorAll(':scope > .xsec[data-sec="' + k + '"] .divider')].filter(V).length; if (n) pb.push('trait à l’intérieur de ' + k); });
      const el = [...tb.querySelectorAll('button,select,input,.tb-label,#save-state,.divider')].filter(V).map(e => [e, e.getBoundingClientRect()]);
      const tr = tb.getBoundingClientRect(); const cy = el.filter(([e]) => !e.matches('.divider')).map(([, q]) => (q.top + q.bottom) / 2); const spread = cy.length ? Math.max(...cy) - Math.min(...cy) : 0;
      if (spread > 12 || tr.height > 56) pb.push('plusieurs lignes (' + Math.round(tr.height) + ' px)');
      for (let i = 0; i < el.length; i++) for (let j = i + 1; j < el.length; j++) { const [a, qa] = el[i], [z, qz] = el[j]; if (a.contains(z) || z.contains(a)) continue; const ox = Math.min(qa.right, qz.right) - Math.max(qa.left, qz.left), oy = Math.min(qa.bottom, qz.bottom) - Math.max(qa.top, qz.top); if (ox > 2 && oy > 2) pb.push('chevauchement ' + (a.id || a.title || a.className).toString().slice(0, 20) + ' / ' + (z.id || z.title || z.className).toString().slice(0, 20)); }
      el.forEach(([e, q]) => { if (q.right > innerWidth + 1 || q.left < -1) pb.push('hors écran ' + (e.id || e.title || e.tagName).toString().slice(0, 25)); });
      // écarts entre secteurs voisins
      const S = [...tb.querySelectorAll(':scope > .xsec')].filter(V).map(x => [x.dataset.sec, x.getBoundingClientRect()]);
      const L = [...tb.querySelectorAll(':scope > .xsec')].filter(V).map(x => x.dataset.sec + ': ' + [...x.querySelectorAll('button,select,input')].filter(V).map(y => ((y.querySelector('.btn-icon') || y).textContent || '').trim().slice(0, 3) || (y.tagName === 'SELECT' ? '▾' : '✎')).join(' '));
      return { pb: [...new Set(pb)], L, seq: s }; });
    if (w === 1440) await p.screenshot({ path: '/tmp/zz/sect_' + pg + '.png', clip: { x: 0, y: 0, width: w, height: 110 } });
    (R[pg] = R[pg] || {})[w] = r ? Object.assign(r, { E }) : null; } catch (e) { (R[pg] = R[pg] || {})[w] = { err: e.message.slice(0, 80) }; } await p.close(); } }));
  await c.close(); fs.writeFileSync(out, JSON.stringify(R)); }
 await b.close(); })();
