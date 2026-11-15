// ZZ « Textes lisibles sur chaque fond » : contraste WCAG AA de chaque texte visible, pour chaque thème
// node contrast.js "<thèmes,…>" page…
const { chromium } = require('playwright'); const fs = require('fs');
const [TH, ...pages] = process.argv.slice(2);
const AUDIT = () => {
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return false; for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.visibility === 'hidden' || c.display === 'none' || +c.opacity < .3) return false; } return true; };
  const where = e => { let x = e, s = []; for (let i = 0; i < 3 && x && x !== document.body; i++, x = x.parentElement) s.unshift(x.id ? '#' + x.id : x.tagName.toLowerCase() + (typeof x.className === 'string' && x.className ? '.' + x.className.trim().split(/\s+/)[0] : '')); return s.join('>'); };
  const rgb = s => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(s); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const bgOf = e => { let layers = []; for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x); if (c.backgroundImage && c.backgroundImage !== 'none' && !/gradient/.test(c.backgroundImage)) return null; const g = /gradient/.test(c.backgroundImage) ? rgb((c.backgroundImage.match(/rgba?\([^)]+\)/) || [''])[0]) : null; const k = g || rgb(c.backgroundColor); if (k && k[3] > 0) { layers.push(k); if (k[3] >= .95) break; } }
    let base = [255, 255, 255]; const bb = rgb(getComputedStyle(document.body).backgroundColor), hb = rgb(getComputedStyle(document.documentElement).backgroundColor); if (bb && bb[3] > .5) base = bb.slice(0, 3); else if (hb && hb[3] > .5) base = hb.slice(0, 3); if (!layers.length || layers[layers.length - 1][3] < .95) layers.push([...base, 1]);
    let c = layers.pop().slice(0, 3); while (layers.length) { const l = layers.pop(); c = c.map((v, i) => v * (1 - l[3]) + l[i] * l[3]); } return c; };
  const low = []; let checked = 0; const seen = new Set();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, k = 0;
  while ((n = tw.nextNode()) && k < 8000) { k++; const t = n.textContent.trim(); if (t.length < 2 || !/[A-Za-zÀ-ÿ0-9]/.test(t)) continue; const el = n.parentElement; if (!el || seen.has(el) || !vis(el)) continue; seen.add(el);
    if (el.closest('svg,canvas,video,[contenteditable],[id*=watermark],.leaflet-container,[disabled],:disabled,[aria-disabled=true],.xgl-e,option,#xws-line')) continue; const cs = getComputedStyle(el); if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') continue; const fg = rgb(cs.color); if (!fg) continue; const bg = bgOf(el); if (!bg) continue;
    let f = fg.slice(0, 3); const op = fg[3]; if (op < 1) f = f.map((v, i) => v * op + bg[i] * (1 - op));
    const L1 = lum(f), L2 = lum(bg), r = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05); const fs = parseFloat(cs.fontSize), big = fs >= 24 || (fs >= 18.6 && +cs.fontWeight >= 700); checked++;
    if (r < (big ? 3 : 4.5)) low.push({ t: t.slice(0, 20), r: Math.round(r * 100) / 100, w: where(el), fg: 'rgb(' + f.map(Math.round).join(',') + ')', bg: 'rgb(' + bg.map(Math.round).join(',') + ')' }); }
  return { checked, low };
};
(async () => { const b = await chromium.launch(); const R = {};
  for (const th of TH.split(',')) { R[th] = {};
   for (const p of pages) { const app = p.replace('.html', ''); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    await ctx.addInitScript(([a, th]) => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); localStorage.setItem('xiii.theme.mode', th); } catch (e) { } }, [app, th]);
    const pg = await ctx.newPage();
    try { await pg.goto('http://localhost:8765/' + p + (p.includes('?') ? '' : '?desktop=1'), { timeout: 30000 }); await pg.waitForTimeout(3200); await pg.evaluate(() => document.querySelectorAll('#xt-root,#xtp,#xnw-ov').forEach(m => m.remove())); await pg.waitForTimeout(400);
      R[th][app] = await pg.evaluate(AUDIT); } catch (e) { R[th][app] = { err: e.message.slice(0, 80) }; }
    await ctx.close(); }
   const tot = Object.values(R[th]).reduce((a, x) => a + (x.low ? x.low.length : 0), 0), chk = Object.values(R[th]).reduce((a, x) => a + (x.checked || 0), 0); console.log(th, 'textes:', chk, 'trop pâles:', tot, '·', Object.entries(R[th]).map(([a, x]) => a + ':' + (x.low ? x.low.length : 'E')).join(' ')); }
  fs.writeFileSync('/tmp/zz/contrast_' + TH.replace(/,/g, '_').slice(0, 40) + '.json', JSON.stringify(R)); await b.close(); })();
