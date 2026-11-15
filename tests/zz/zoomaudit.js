// TAILLE DU TEXTE : pour chaque page, compare la place des éléments fixes (barres, boutons flottants, volets) entre 100 % et 90/110/125/150 %
const { chromium } = require('playwright'); const fs = require('fs');
const pages = process.argv.slice(2); const SZ = [90, 110, 125, 150];
(async () => { const b = await chromium.launch(); const out = {};
  const Q = pages.slice();
  await Promise.all([0, 1, 2, 3].map(async () => { while (Q.length) { const pgn = Q.shift(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); Object.keys(localStorage).forEach(k => { if (/tour/.test(k)) localStorage.removeItem(k); }); } catch (e) { } });
    const p = await ctx.newPage(); const R = {}; out[pgn] = R;
    const snap = () => p.evaluate(() => { const L = []; document.querySelectorAll('body *').forEach(e => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') return; if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return; const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8) return; if (e.closest('#xt-root,#xnw-ov')) return; const id = e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className || '').split(' ')[0]; L.push({ id, l: r.left, t: r.top, r: innerWidth - r.right, b: innerHeight - r.bottom, w: r.width, h: r.height }); });
      return { shim: !!window.__xzShim, L, sw: document.documentElement.scrollWidth, iw: innerWidth, z: getComputedStyle(document.documentElement).zoom }; });
    for (const z of [100].concat(SZ)) {
      await p.evaluate(z => localStorage.setItem('xiii.a11y', JSON.stringify({ size: z })), z).catch(() => { });
      await p.goto('http://localhost:8765/' + pgn + (pgn.includes('?') ? '&' : '?') + 'desktop=1'); await p.waitForTimeout(3200);
      await p.evaluate(() => document.querySelectorAll('#xt-root,#xnw-ov').forEach(x => x.remove())).catch(() => { });
      await p.waitForTimeout(300); R[z] = await snap().catch(e => ({ err: e.message }));
      if (z === 150 || z === 90) await p.screenshot({ path: '/tmp/zz/zm/' + pgn.replace(/\W/g, '_') + '_' + z + '.png' }).catch(() => { });
    }
    await ctx.close(); } }));
  // analyse
  const rep = [];
  for (const pg in out) { const R = out[pg], base = R[100]; if (!base || !base.L) continue; const by = {}; base.L.forEach(e => by[e.id] = by[e.id] || e);
    for (const z of SZ) { const S = R[z]; if (!S || !S.L) continue; const k = z / 100;
      if (S.sw > S.iw + 4 && !S.shim) rep.push(pg + ' ' + z + '% défilement horizontal ' + S.sw + '>' + S.iw);
      S.L.forEach(e => { const o = by[e.id]; if (/xa-skip|#xst$/.test(e.id)) return; if (e.l < -4 || e.t < -4 || e.r < -4 || e.b < -4) rep.push(pg + ' ' + z + '% hors écran ' + e.id + ' l' + Math.round(e.l) + ' t' + Math.round(e.t) + ' r' + Math.round(e.r) + ' b' + Math.round(e.b));
        if (!o) return; // ancrage : bord le plus proche à 100 %
        const ax = o.l <= o.r ? 'l' : 'r', ay = o.t <= o.b ? 't' : 'b'; const kk = S.shim || +S.z === 1 || S.z === 'normal' ? 1 : k; const dx = Math.abs(e[ax] - o[ax] * kk), dy = Math.abs(e[ay] - o[ay] * kk);
        if ((dx > 30 && Math.min(o.l, o.r) < 200) || (dy > 30 && Math.min(o.t, o.b) < 200)) rep.push(pg + ' ' + z + '% décalé ' + e.id + ' ' + (dx > 30 ? ax + ' ' + Math.round(o[ax]) + '→' + Math.round(e[ax]) + ' ' : '') + (dy > 30 ? ay + ' ' + Math.round(o[ay]) + '→' + Math.round(e[ay]) : '')); }); } }
  fs.writeFileSync('/tmp/zz/zm/rep.json', JSON.stringify(out)); console.log(rep.join('\n') || 'rien'); await b.close(); })();
