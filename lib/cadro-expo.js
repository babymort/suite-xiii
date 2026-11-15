// SUITE XIII — module commun. Source : xiii-src/cadro-expo.js
// =====================================================================
//  SUITE XIII — CADRO LIVE · aides à l'exposition (saison 6, phase L)
//  Surimpressions sur le moniteur LIVE (calculées sur l'appareil, ≈ 20 / s) :
//   · zébras : seuil réglable (70 → 100 IRE), second zébra « peau » optionnel (plage ± 5 IRE) ;
//   · fausses couleurs (légende IRE à l'écran) : noirs bouchés, ombres, gris moyen 18 %, peau, hautes lumières, écrêtage ;
//   · peaking de mise au point : contours nets surlignés, sensibilité et couleur réglables ;
//   · alertes : part de l'image écrêtée / bouchée affichée en direct dès qu'elle dépasse le seuil ;
//   · pipette : valeurs R V B, luma en IRE et code couleur sous le curseur (clic = épingler, clic droit = retirer).
//  Raccourcis : Z zébras · C fausses couleurs · P peaking. Mêmes échelles que les scopes (IRE / %, plage vidéo / pleine).
// =====================================================================
const XCEXPO = (() => {
    const K = 'xiii.cadro.expo';
    const DEF = { zeb: false, zt: 95, z2: false, z2t: 60, fc: false, pk: false, pks: 50, pkc: 'red', al: true, alt: 1, pip: true };
    const J = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(K)) || {}); } catch (e) { return Object.assign({}, DEF); } };
    let C = J(); const W = () => { try { localStorage.setItem(K, JSON.stringify(C)); } catch (e) { } };
    const AW = 640, AH = 360; let wk = null, wx = null, ov = null, raf = 0, last = 0, ph = 0, pins = [], hover = null;
    const Y = (r, g, b) => .2126 * r + .7152 * g + .0722 * b;
    const rng = () => { try { return XCSCOPES.cfg().range; } catch (e) { return 'video'; } };
    const ire = v => rng() === 'video' ? (v - 16) / 219 * 100 : v / 255 * 100;
    // fausses couleurs (bandes IRE, inspirées des moniteurs de plateau)
    const FC = [[-99, 2.5, [130, 30, 170], 'Noirs bouchés'], [2.5, 10, [40, 70, 210], 'Ombres profondes'], [10, 20, [60, 140, 220], 'Ombres'], [38, 45, [40, 190, 80], 'Gris moyen 18 %'], [52, 58, [240, 120, 170], 'Peau (+1 diaph)'], [92, 99, [235, 210, 40], 'Hautes lumières'], [99, 999, [230, 40, 40], 'Écrêtage']];
    const PKC = { red: [255, 40, 40], green: [40, 255, 90], blue: [60, 140, 255], white: [255, 255, 255], yellow: [255, 230, 40] };
    const css = () => { if (document.getElementById('xce-css')) return; const s = document.createElement('style'); s.id = 'xce-css';
        s.textContent = 'body:has(#xcl) #xtp,body:has(#xcl) #xt-root{display:none!important}#xcl .xce-cv{position:absolute;pointer-events:none;image-rendering:auto}#xcl .xce-al{position:absolute;right:10px;top:10px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;pointer-events:none}#xcl .xce-al span{font:700 11px ui-monospace,monospace;padding:4px 8px;border-radius:6px;background:rgba(198,40,40,.85);color:#fff}#xcl .xce-al span.b{background:rgba(106,27,154,.85)}' +
            '#xcl .xce-lg{position:absolute;left:10px;bottom:10px;display:flex;flex-wrap:wrap;gap:3px;max-width:70%;pointer-events:none}#xcl .xce-lg i{font:600 10px system-ui;font-style:normal;padding:2px 6px;border-radius:4px;color:#fff;text-shadow:0 1px 2px #000}' +
            '#xcl .xce-tip{position:absolute;pointer-events:none;font:600 11px ui-monospace,monospace;background:rgba(10,10,12,.88);border:1px solid #444;border-radius:6px;padding:4px 7px;white-space:nowrap;z-index:2}#xcl .xce-tip i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px;border:1px solid #888}#xcl .xce-pin{position:absolute;width:9px;height:9px;margin:-5px 0 0 -5px;border:2px solid #f0b378;border-radius:50%;pointer-events:none;box-shadow:0 0 0 1px #000}' +
            '#xcl .xce label{display:flex;align-items:center;gap:6px;margin:3px 0;font-size:12px;cursor:pointer}#xcl .xce input[type=range]{flex:1;min-width:0;accent-color:#f0b378}#xcl .xce .v{font:600 11px ui-monospace,monospace;min-width:52px;text-align:right;opacity:.8}#xcl .xce select{width:auto;margin:0;padding:3px;font-size:11.5px}#xcl .xce .kb{margin-left:auto;font:600 10px ui-monospace,monospace;opacity:.5;border:1px solid #444;border-radius:4px;padding:0 4px}';
        document.head.appendChild(s); };
    // ---------- réglages (volet de gauche) ----------
    function panel(o) {
        const as = o.querySelector('aside'); if (!as || as.querySelector('.xce')) return; const d = document.createElement('div'); d.className = 'xce'; as.insertBefore(d, as.querySelector('h4:nth-of-type(3)') || null); draw(d);
    }
    function draw(d) {
        d = d || (ov && ov.querySelector('.xce')); if (!d) return;
        const chk = (k, l, kb) => '<label><input type="checkbox" data-k="' + k + '"' + (C[k] ? ' checked' : '') + '> ' + l + (kb ? '<span class="kb">' + kb + '</span>' : '') + '</label>';
        const rg = (k, mn, mx, st, suf) => '<label style="padding-left:22px"><input type="range" data-r="' + k + '" min="' + mn + '" max="' + mx + '" step="' + st + '" value="' + C[k] + '"><span class="v">' + C[k] + suf + '</span></label>';
        d.innerHTML = '<h4>🎛️ Aides à l\'exposition</h4>' + chk('zeb', 'Zébras', 'Z') + (C.zeb ? rg('zt', 70, 100, 1, ' IRE') : '') + chk('z2', 'Second zébra (peau ± 5)') + (C.z2 ? rg('z2t', 30, 90, 1, ' IRE') : '') +
            chk('fc', 'Fausses couleurs', 'C') + chk('pk', 'Peaking (mise au point)', 'P') + (C.pk ? rg('pks', 10, 100, 5, ' %') + '<label style="padding-left:22px">Couleur <select data-s="pkc">' + Object.keys(PKC).map(k => '<option value="' + k + '"' + (C.pkc === k ? ' selected' : '') + '>' + ({ red: 'Rouge', green: 'Vert', blue: 'Bleu', white: 'Blanc', yellow: 'Jaune' })[k] + '</option>').join('') + '</select></label>' : '') +
            chk('al', 'Alertes écrêtage / noirs bouchés') + (C.al ? rg('alt', .1, 10, .1, ' %') : '') + chk('pip', 'Pipette sous le curseur');
        d.querySelectorAll('[data-k]').forEach(i => i.onchange = () => { C[i.dataset.k] = i.checked; if (i.dataset.k === 'fc' && i.checked) C.zeb = C.zeb; W(); draw(d); });
        d.querySelectorAll('[data-r]').forEach(i => i.oninput = () => { C[i.dataset.r] = +i.value; i.nextElementSibling.textContent = i.value + (i.dataset.r === 'pks' || i.dataset.r === 'alt' ? ' %' : ' IRE'); W(); });
        d.querySelectorAll('[data-s]').forEach(i => i.onchange = () => { C[i.dataset.s] = i.value; W(); });
    }
    // ---------- surimpression ----------
    function layer(o) {
        const mon = o.querySelector('.mon'); if (!mon) return null; let cv = mon.querySelector('.xce-cv');
        if (!cv) { cv = document.createElement('canvas'); cv.className = 'xce-cv'; cv.width = AW; cv.height = AH; mon.appendChild(cv); const al = document.createElement('div'); al.className = 'xce-al'; mon.appendChild(al); const lg = document.createElement('div'); lg.className = 'xce-lg'; mon.appendChild(lg); const tip = document.createElement('div'); tip.className = 'xce-tip'; tip.hidden = true; mon.appendChild(tip); pipette(mon); }
        return cv;
    }
    function place(cv, v) { const r = v.getBoundingClientRect(), m = v.parentElement.getBoundingClientRect(), s = cv.style; const L = (r.left - m.left) + 'px', T = (r.top - m.top) + 'px'; if (s.left !== L) s.left = L; if (s.top !== T) s.top = T; s.width = r.width + 'px'; s.height = r.height + 'px'; }
    function frame(v, cv) {
        if (!wk) { wk = document.createElement('canvas'); wk.width = AW; wk.height = AH; wx = wk.getContext('2d', { willReadFrequently: true }); }
        const vw = v.videoWidth, vh = v.videoHeight; if (!vw) return; const h = Math.round(AW * vh / vw); if (wk.height !== h) { wk.height = h; cv.height = h; }
        wx.drawImage(typeof XCGRADE !== 'undefined' ? XCGRADE.src(v) : v, 0, 0, AW, h); let D; try { D = wx.getImageData(0, 0, AW, h); } catch (e) { return; }
        const s = D.data, x = cv.getContext('2d'), out = x.createImageData(AW, h), o = out.data, n = AW * h; let clip = 0, crush = 0; ph = (ph + 1) % 8;
        const lum = new Float32Array(n); for (let i = 0, p = 0; p < n; p++, i += 4) { const y = Y(s[i], s[i + 1], s[i + 2]), e = ire(y); lum[p] = y; if (e >= 99.5) clip++; else if (e <= .5) crush++;
            if (C.fc) { const b = FC.find(f => e >= f[0] && e < f[1]); if (b) { o[i] = b[2][0]; o[i + 1] = b[2][1]; o[i + 2] = b[2][2]; } else { const g = Math.max(0, Math.min(255, e * 2.55)) * .85; o[i] = o[i + 1] = o[i + 2] = g; } o[i + 3] = 255; }
            if (C.zeb || C.z2) { const X = p % AW, Yy = (p / AW) | 0, st = ((X + Yy + ph) & 7) < 3; if (st && ((C.zeb && e >= C.zt) || (C.z2 && Math.abs(e - C.z2t) <= 5))) { const hi = C.zeb && e >= C.zt; o[i] = hi ? 255 : 210; o[i + 1] = hi ? 255 : 120; o[i + 2] = hi ? 255 : 220; o[i + 3] = 230; } } }
        if (C.pk) { const th = (110 - C.pks) * 1.3, col = PKC[C.pkc] || PKC.red; for (let yy = 1; yy < h - 1; yy++) for (let xx = 1; xx < AW - 1; xx++) { const p = yy * AW + xx; const gx = lum[p + 1] - lum[p - 1] + .5 * (lum[p - AW + 1] - lum[p - AW - 1] + lum[p + AW + 1] - lum[p + AW - 1]), gy = lum[p + AW] - lum[p - AW] + .5 * (lum[p + AW - 1] - lum[p - AW - 1] + lum[p + AW + 1] - lum[p - AW + 1]);
                if (gx * gx + gy * gy > th * th) { const i = p * 4; o[i] = col[0]; o[i + 1] = col[1]; o[i + 2] = col[2]; o[i + 3] = 255; } } }
        x.putImageData(out, 0, 0);
        // alertes et légende
        const mon = cv.parentElement, al = mon.querySelector('.xce-al'), lg = mon.querySelector('.xce-lg'), pc = clip / n * 100, pb = crush / n * 100;
        const ah = C.al ? (pc >= C.alt ? '<span>⚠ Écrêtage ' + pc.toFixed(1) + ' %</span>' : '') + (pb >= C.alt ? '<span class="b">⚠ Noirs bouchés ' + pb.toFixed(1) + ' %</span>' : '') : ''; if (al.innerHTML !== ah) al.innerHTML = ah;
        const lh = C.fc ? FC.map(f => '<i style="background:rgb(' + f[2].join(',') + ')">' + f[3] + (f[0] > -99 && f[1] < 999 ? ' ' + f[0] + '–' + f[1] : '') + '</i>').join('') : ''; if (lg.innerHTML !== lh) lg.innerHTML = lh;
        if (pins.length || hover) tips(v);
    }
    // ---------- pipette ----------
    let px1 = null; const pick = (v, fx, fy) => { if (!px1) { const c = document.createElement('canvas'); c.width = c.height = 1; px1 = c.getContext('2d', { willReadFrequently: true }); } try { px1.drawImage(typeof XCGRADE !== 'undefined' ? XCGRADE.src(v) : v, Math.floor(fx * v.videoWidth), Math.floor(fy * v.videoHeight), 1, 1, 0, 0, 1, 1); return px1.getImageData(0, 0, 1, 1).data; } catch (e) { return null; } };
    function pipette(mon) {
        const pos = e => { const v = mon.querySelector('video'), r = v.getBoundingClientRect(); const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height; return fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1 ? [fx, fy] : null; };
        mon.addEventListener('mousemove', e => { hover = C.pip ? pos(e) : null; if (!hover) mon.querySelector('.xce-tip').hidden = true; });
        mon.addEventListener('mouseleave', () => { hover = null; mon.querySelector('.xce-tip').hidden = true; });
        mon.addEventListener('click', e => { const p = pos(e); if (p && C.pip) { pins.push(p); if (pins.length > 4) pins.shift(); } });
        mon.addEventListener('contextmenu', e => { if (pins.length) { e.preventDefault(); pins = []; mon.querySelectorAll('.xce-pin,.xce-tip.p').forEach(x => x.remove()); } });
    }
    const txt = d => { const y = ire(Y(d[0], d[1], d[2])); return '<i style="background:rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')"></i>R ' + d[0] + ' V ' + d[1] + ' B ' + d[2] + ' · ' + y.toFixed(1) + (((() => { try { return XCSCOPES.cfg().scale; } catch (e) { return 'ire'; } })()) === 'pct' ? ' %' : ' IRE') + ' · #' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase(); };
    function tips(v) {
        const mon = v.parentElement, r = v.getBoundingClientRect(), m = mon.getBoundingClientRect(), L = r.left - m.left, T = r.top - m.top;
        const tip = mon.querySelector('.xce-tip:not(.p)'); if (hover) { const d = pick(v, hover[0], hover[1]); if (d) { tip.hidden = false; tip.innerHTML = txt(d); const x = L + hover[0] * r.width + 14, y = T + hover[1] * r.height + 14; tip.style.left = Math.min(x, m.width - tip.offsetWidth - 6) + 'px'; tip.style.top = Math.min(y, m.height - 28) + 'px'; } }
        mon.querySelectorAll('.xce-pin,.xce-tip.p').forEach(x => x.remove());
        pins.forEach(p => { const d = pick(v, p[0], p[1]); if (!d) return; const dot = document.createElement('div'); dot.className = 'xce-pin'; dot.style.left = (L + p[0] * r.width) + 'px'; dot.style.top = (T + p[1] * r.height) + 'px'; mon.appendChild(dot); const t = document.createElement('div'); t.className = 'xce-tip p'; t.innerHTML = txt(d); t.style.left = (L + p[0] * r.width + 8) + 'px'; t.style.top = (T + p[1] * r.height - 26) + 'px'; mon.appendChild(t); });
    }
    function tick(t) {
        raf = requestAnimationFrame(tick); ov = document.getElementById('xcl'); if (!ov) return; css(); panel(ov); const v = ov.querySelector('video'), cv = layer(ov); if (!cv || !v) return;
        const any = C.zeb || C.z2 || C.fc || C.pk || C.al; cv.hidden = v.hidden || !(C.zeb || C.z2 || C.fc || C.pk); if (v.hidden) { const al = cv.parentElement.querySelector('.xce-al'); if (al) al.innerHTML = ''; return; }
        place(cv, v); if (t - last < 50) return; last = t; if (!any && !hover && !pins.length) return; if (v.readyState < 2) return;
        if (any) frame(v, cv); else tips(v);
    }
    addEventListener('keydown', e => { if (!document.getElementById('xcl') || e.ctrlKey || e.metaKey || e.altKey) return; const tg = e.target; if (tg && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName)) return; const k = { z: 'zeb', c: 'fc', p: 'pk' }[e.key.toLowerCase()]; if (!k) return; e.preventDefault(); e.stopImmediatePropagation(); C[k] = !C[k]; W(); draw(); }, true);
    const watch = () => new MutationObserver(() => { const o = document.getElementById('xcl'); if (o && !raf) raf = requestAnimationFrame(tick); else if (!o && raf) { cancelAnimationFrame(raf); raf = 0; pins = []; hover = null; } }).observe(document.body, { childList: true });
    if (document.body) watch(); else addEventListener('DOMContentLoaded', watch);
    return { cfg: () => Object.assign({}, C), set: o => { Object.assign(C, o); W(); draw(); }, ire };
})();
