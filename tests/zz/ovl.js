// Champs de texte des barres (nom du projet, « Votre nom »…) recouverts par des boutons ou trop étroits pour être lus
const { chromium } = require('playwright'); const fs = require('fs'); const [out, ws, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const R = {};
  for (const w of ws.split(',').map(Number)) { const ctx = await b.newContext({ viewport: { width: w, height: 850 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    const Q = pages.slice(); await Promise.all([0, 1, 2].map(async () => { while (Q.length) { const p = Q.shift(); const pg = await ctx.newPage();
      await pg.addInitScript(a => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a[0] + '.hide', '1'); if (a[1]) localStorage.setItem('xiii.drive', JSON.stringify({ url: 'https://script.google.com/macros/s/x/exec', code: 'ABC', proj: 'Test', me: { name: 'Matthieu' } })); } catch (e) { } }, [p.replace('.html', ''), !!process.env.DRIVE]);
      try { await pg.goto('http://localhost:8765/' + p + '?desktop=1', { waitUntil: 'load', timeout: 30000 }); await pg.waitForTimeout(3200);
        const r = await pg.evaluate(() => { const P = []; const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > .05; };
          const bars = [...document.querySelectorAll('#top-bar,#toolbar')]; bars.forEach(bar => {
            const ins = [...bar.querySelectorAll('input[type=text],input:not([type]),input[type=search]')].filter(vis), others = [...bar.querySelectorAll('button,select,a,label,.tabs-container,[id^=xb-]')].filter(vis);
            ins.forEach(i => { const a = i.getBoundingClientRect(); const nm = i.id || i.placeholder;
              if (a.width < 70) P.push([nm, 'trop étroit', Math.round(a.width)]);
              if (a.right > innerWidth + 1) P.push([nm, 'hors écran', '']);
              others.forEach(o => { if (o.contains(i) || i.contains(o)) return; const c = o.getBoundingClientRect(); const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ox > 3 && oy > 3) { const top = document.elementFromPoint(Math.max(a.left, c.left) + ox / 2, Math.max(a.top, c.top) + oy / 2); P.push([nm, 'recouvert par', (o.id || o.title || o.textContent).trim().slice(0, 30) + ' ' + Math.round(ox) + 'px' + (top === i ? ' (champ dessus)' : '')]); } });
              // texte saisi coupé : valeur plus large que le champ
              if (i.value && i.scrollWidth > i.clientWidth + 4) P.push([nm, 'texte coupé', i.value.slice(0, 30)]); }); });
          return P; });
        if (r.length) (R[p] = R[p] || {})[w] = r; } catch (e) { (R[p] = R[p] || {})[w] = [['page', 'ERR', e.message.slice(0, 60)]]; }
      await pg.close(); } }));
    await ctx.close(); }
  fs.writeFileSync(out, JSON.stringify(R)); await b.close(); })();
