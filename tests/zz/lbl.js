// Libellés de boutons qui débordent de leur bouton ou boutons qui se chevauchent, en balayant les largeurs d'écran
const { chromium } = require('playwright'); const [ws, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const R = {};
  for (const p of pages) { const ctx = await b.newContext({ viewport: { width: 1920, height: 800 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); await pg.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); } catch (e) { } if (window.WIDE) { } }, p.replace('.html', '')); if (process.env.WIDE) await pg.addInitScript(() => { const s = document.createElement('style'); s.textContent = 'button,button *{letter-spacing:.09em!important}'; setTimeout(() => document.head.appendChild(s), 2500); });
    await pg.goto('http://localhost:8765/' + p + '?desktop=1'); await pg.waitForTimeout(3000);
    const [a, z, st] = ws.split(',').map(Number);
    for (let w = a; w >= z; w -= st) { await pg.setViewportSize({ width: w, height: 800 }); await pg.waitForTimeout(450);
      const r = await pg.evaluate(() => { const P = []; const B = [...document.querySelectorAll('#top-bar button,#toolbar button,#top-bar input,#toolbar input[type=text]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && getComputedStyle(e).visibility !== 'hidden' && e.offsetParent; });
        B.forEach(e => { const r = e.getBoundingClientRect(); e.querySelectorAll('.btn-label,span').forEach(l => { const q = l.getBoundingClientRect(); if (q.width > 2 && getComputedStyle(l).display !== 'none' && (q.right > r.right + 2 || q.left < r.left - 2)) P.push('libellé déborde : ' + (e.id || e.title.slice(0, 20)) + ' « ' + l.textContent.trim().slice(0, 16) + ' »'); }); });
        for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) { const x = B[i].getBoundingClientRect(), y = B[j].getBoundingClientRect(); if (B[i].contains(B[j]) || B[j].contains(B[i])) continue; const ox = Math.min(x.right, y.right) - Math.max(x.left, y.left), oy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top); if (ox > 2 && oy > 2) P.push('chevauchement : ' + (B[i].id || B[i].title.slice(0, 18) || B[i].placeholder) + ' / ' + (B[j].id || B[j].title.slice(0, 18) || B[j].placeholder) + ' ' + Math.round(ox)); }
        return [...new Set(P)]; });
      if (r.length) (R[p] = R[p] || {})[w] = r; }
    await ctx.close(); }
  console.log(JSON.stringify(R, null, 0)); await b.close(); })();
