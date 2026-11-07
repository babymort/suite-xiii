// Accessibilité : noms lisibles (boutons, champs, images), contrastes des textes (WCAG AA), parcours au clavier (Tab : focus visible, pas de piège)
// node a11y.js <sortie.json> <dark|light> page…     serveur :8765
const { chromium } = require('playwright'); const fs = require('fs');
const [out, theme, ...pages] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const R = {};
  for (const p of pages) { const app = p.replace('.html', ''); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    await ctx.addInitScript(([a, th]) => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); const k = 'hubXIII.prefs'; const o = JSON.parse(localStorage.getItem(k) || '{}'); o.theme = th; localStorage.setItem(k, JSON.stringify(o)); } catch (e) { } }, [app, theme]);
    const pg = await ctx.newPage(); const res = { E: [] }; pg.on('pageerror', e => res.E.push(e.message.slice(0, 120)));
    try {
      await pg.goto('http://localhost:8765/' + p + '?desktop=1', { waitUntil: 'load', timeout: 30000 }); await pg.waitForTimeout(3000);
      await pg.evaluate(async a => { try { await XMODELS.apply(a, 'fiction', false); } catch (e) { } }, app).catch(() => { }); await pg.reload(); await pg.waitForTimeout(4800);
      await pg.evaluate(() => document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()));
      Object.assign(res, await pg.evaluate(() => {
        const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return false; for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity < .1) return false; } return true; };
        const where = e => { const ids = []; for (let x = e; x && x !== document.body && ids.length < 3; x = x.parentElement) if (x.id) ids.push('#' + x.id); return ids.join('<') || e.className.toString().split(' ')[0] || e.tagName; };
        const txt = e => (e.innerText || e.textContent || '').replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}\u{200D}✓✕＋−×·•…]/gu, '').trim();
        const name = e => e.getAttribute('aria-label') || (e.getAttribute('aria-labelledby') && (document.getElementById(e.getAttribute('aria-labelledby')) || {}).textContent) || txt(e) || e.title || (e.querySelector('img[alt]') || {}).alt || '';
        const noName = [], noLab = [], noAlt = [];
        document.querySelectorAll('button,a[href],[role=button],[role=tab],[role=menuitem]').forEach(e => { if (!vis(e)) return; if (!name(e).trim()) noName.push(where(e) + ' «' + (e.textContent || '').trim().slice(0, 6) + '»'); });
        document.querySelectorAll('input:not([type=hidden]):not([type=button]):not([type=submit]),select,textarea').forEach(e => { if (!vis(e)) return; const l = e.getAttribute('aria-label') || e.title || e.placeholder || (e.id && document.querySelector('label[for="' + CSS.escape(e.id) + '"]')) || e.closest('label') || e.getAttribute('aria-labelledby'); if (!l) noLab.push(where(e) + ' ' + (e.type || e.tagName)); });
        document.querySelectorAll('img').forEach(e => { if (vis(e) && !e.hasAttribute('alt') && e.getAttribute('role') !== 'presentation') noAlt.push(where(e)); });
        // contrastes
        const rgb = s => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(s); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
        const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
        const bgOf = e => { let layers = []; for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.backgroundImage && c.backgroundImage !== 'none' && !/gradient/.test(c.backgroundImage)) return null; const g = /gradient/.test(c.backgroundImage) ? rgb((c.backgroundImage.match(/rgba?\([^)]+\)/) || [''])[0]) : null; const k = g || rgb(c.backgroundColor); if (k && k[3] > 0) { layers.push(k); if (k[3] >= .95) break; } }
          let base = [255, 255, 255]; const bodyBg = rgb(getComputedStyle(document.body).backgroundColor); if (bodyBg && bodyBg[3] > .5) base = bodyBg.slice(0, 3); if (!layers.length || layers[layers.length - 1][3] < .95) layers.push([...base, 1]);
          let c = layers.pop().slice(0, 3); while (layers.length) { const l = layers.pop(); c = c.map((v, i) => v * (1 - l[3]) + l[i] * l[3]); } return c; };
        const low = []; let checked = 0; const seen = new Set();
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, k = 0;
        while ((n = tw.nextNode()) && k < 6000) { k++; const t = n.textContent.trim(); if (t.length < 2 || !/[A-Za-zÀ-ÿ0-9]/.test(t)) continue; const el = n.parentElement; if (!el || seen.has(el) || !vis(el)) continue; seen.add(el);
          if (el.closest('svg,canvas,video,[contenteditable],#xa-skip,[id*=watermark],.leaflet-container,[disabled],:disabled,[aria-disabled=true]')) continue; const cs = getComputedStyle(el); const fg = rgb(cs.color); if (!fg) continue; const bg = bgOf(el); if (!bg) continue;
          let f = fg.slice(0, 3); const op = fg[3] * (+cs.opacity || 1); if (op < 1) f = f.map((v, i) => v * op + bg[i] * (1 - op));
          const L1 = lum(f), L2 = lum(bg), ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05); const fs = parseFloat(cs.fontSize), big = fs >= 24 || (fs >= 18.6 && +cs.fontWeight >= 700); checked++;
          if (ratio < (big ? 3 : 4.5)) low.push({ t: t.slice(0, 22), r: Math.round(ratio * 100) / 100, fs, w: where(el), fg: cs.color, bg: 'rgb(' + bg.map(Math.round).join(',') + ')' }); }
        return { noName: [...new Set(noName)], noLab: [...new Set(noLab)], noAlt: [...new Set(noAlt)], checked, low, theme: document.body.classList.contains('light-theme') ? 'light' : 'dark' };
      }));
      // clavier : 70 Tab depuis le début
      await pg.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
      const K = { n: 0, noRing: [], stuck: 0, hidden: 0 }; let last = '', same = 0;
      for (let i = 0; i < 70; i++) { await pg.keyboard.press('Tab'); const f = await pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const c = getComputedStyle(e); const r = e.getBoundingClientRect(); const ring = (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || (c.boxShadow && c.boxShadow !== 'none');
          const id = (e.id ? '#' + e.id : e.tagName + '.' + e.className.toString().split(' ')[0] + '@' + [...document.querySelectorAll('*')].indexOf(e)) + ' ' + (e.getAttribute('aria-label') || e.title || e.textContent || '').trim().slice(0, 18); return { id, ring, vis: r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth }; }).catch(() => null);
        if (!f) continue; K.n++; if (f.id === last) { if (++same > 3) { K.stuck++; K.at = f.id; break; } } else same = 0; last = f.id; if (!f.vis) K.hidden++; else if (!f.ring) K.noRing.push(f.id); }
      K.noRing = [...new Set(K.noRing)]; res.kb = K;
    } catch (e) { res.E.push('robot ' + e.message.slice(0, 120)); }
    R[app] = res; fs.writeFileSync(out, JSON.stringify(R)); await ctx.close(); }
  await b.close(); })();
