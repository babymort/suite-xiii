// SUITE XIII — module commun. Source : xiii-src/cadro-scopes.js
// =====================================================================
//  SUITE XIII — CADRO LIVE · scopes (saison 6, phase L)
//  Volet de droite du moniteur LIVE, scopes calculés en direct sur l'image (≈ 15 mesures / s, échantillon 320 px) :
//   · forme d'onde luma (Rec. 709) et RGB parade ;
//   · vecteurscope (Cb / Cr Rec. 709) avec cibles 75 % ou 100 % (R, Mg, B, Cy, G, Yl) et ligne des tons chair ;
//   · histogramme luma ou RGB, superposé ou séparé ;
//   · échelles en IRE ou en %, plage vidéo (16-235) ou pleine (0-255).
//  Plusieurs scopes peuvent être affichés l'un sous l'autre. Rien n'est envoyé : tout est calculé sur l'appareil.
// =====================================================================
const XCSCOPES = (() => {
    const K = 'xiii.cadro.scopes';
    const DEF = { on: ['wave', 'vec'], scale: 'ire', range: 'video', hist: 'over', tgt: 75, show: true };
    const J = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(K)) || {}); } catch (e) { return Object.assign({}, DEF); } };
    let C = J(); const W = () => { try { localStorage.setItem(K, JSON.stringify(C)); } catch (e) { } };
    const SC = [['wave', 'Forme d\'onde'], ['parade', 'RGB parade'], ['vec', 'Vecteurscope'], ['hist', 'Histogramme']];
    const SW = 320, SH = 180; let src = null, sx = null, raf = 0, last = 0, panel = null;
    const css = () => { if (document.getElementById('xcs-css')) return; const s = document.createElement('style'); s.id = 'xcs-css';
        s.textContent = '#xcl.xcs-on{grid-template-columns:270px minmax(0,1fr) 360px}#xcl .xcs{grid-row:2;grid-column:3;overflow-y:auto;border-left:1px solid #2a2a30;background:#111114;padding:10px;display:flex;flex-direction:column;gap:8px}' +
            '#xcl .xcs-t{display:flex;flex-wrap:wrap;gap:4px}#xcl .xcs-t button{padding:4px 8px;font-size:11.5px}#xcl .xcs-t button.on{background:rgba(240,179,120,.18);border-color:#f0b378;color:#f6c79a}#xcl .xcs-o{display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:11px;opacity:.9}#xcl .xcs-o select{width:auto;margin:0;padding:3px 4px;font-size:11px}' +
            '#xcl .xcs figure{flex:none;margin:0;position:relative;background:#050506;border:1px solid #26262c;border-radius:6px;overflow:hidden}#xcl .xcs figcaption{position:absolute;right:8px;top:4px;font:600 10px system-ui;letter-spacing:.06em;text-transform:uppercase;opacity:.6;pointer-events:none}#xcl .xcs canvas{display:block;width:100%;height:auto}' +
            '#xcl .xcs-hd{display:flex;align-items:center;gap:6px}#xcl .xcs-hd b{flex:1;font:700 10.5px system-ui;letter-spacing:.08em;text-transform:uppercase;opacity:.6}#xcl:not(.xcs-on) .xcs{display:none}';
        document.head.appendChild(s); };
    // ---------- mesures ----------
    const Y = (r, g, b) => .2126 * r + .7152 * g + .0722 * b;
    const lv = v => C.range === 'video' ? (v - 16) / 219 : v / 255; // 0..1 (peut sortir : sur- / sous-exposé hors plage)
    function sample(v) { if (!v || !v.videoWidth) return null; if (!src) { src = document.createElement('canvas'); src.width = SW; src.height = SH; sx = src.getContext('2d', { willReadFrequently: true }); } sx.drawImage(v, 0, 0, SW, SH); try { return sx.getImageData(0, 0, SW, SH).data; } catch (e) { return null; } }
    // graticule commun des formes d'onde : 0 → 100 (IRE ou %) avec marge -10 / 110
    const gy = (h, u) => h - 8 - (u + .07) / 1.14 * (h - 16);
    function grat(x, w, h) { x.strokeStyle = 'rgba(255,255,255,.12)'; x.fillStyle = 'rgba(255,255,255,.45)'; x.font = '10px ui-monospace,monospace'; x.lineWidth = 1;
        for (let i = 0; i <= 10; i++) { const y = Math.round(gy(h, i / 10)) + .5; x.strokeStyle = i === 0 || i === 10 ? 'rgba(240,179,120,.45)' : 'rgba(255,255,255,.1)'; x.beginPath(); x.moveTo(26, y); x.lineTo(w, y); x.stroke(); if (i % 2 === 0) x.fillText(String(i * 10), 2, y + 3); }
        x.fillText(C.scale === 'ire' ? 'IRE' : '%', 2, 10); }
    function wave(cv, d, parade) {
        const w = cv.width, h = cv.height, x = cv.getContext('2d'), L = 26, PW = w - L, img = x.createImageData(w, h), B = img.data, acc = new Uint16Array(w * h);
        const lanes = parade ? 3 : 1, lw = PW / lanes;
        for (let py = 0; py < SH; py++) for (let px = 0; px < SW; px++) { const i = (py * SW + px) * 4, r = d[i], g = d[i + 1], b = d[i + 2];
            if (parade) [r, g, b].forEach((c, k) => { const X = L + Math.floor(k * lw + px / SW * (lw - 2)), YY = Math.round(gy(h, lv(c))); if (YY >= 0 && YY < h) { const j = (YY * w + X) * 4 + k; B[j] = Math.min(255, B[j] + 70); } });
            else { const X = L + Math.floor(px / SW * (PW - 1)), YY = Math.round(gy(h, lv(Y(r, g, b)))); if (YY >= 0 && YY < h) acc[YY * w + X]++; } }
        if (!parade) { for (let i = 0; i < acc.length; i++) if (acc[i]) { const v = Math.min(255, 50 + acc[i] * 40); B[i * 4] = v * .55; B[i * 4 + 1] = v; B[i * 4 + 2] = v * .6; B[i * 4 + 3] = 255; } }
        else { for (let i = 0; i < B.length; i += 4) if (B[i] || B[i + 1] || B[i + 2]) B[i + 3] = 255; }
        x.fillStyle = '#050506'; x.fillRect(0, 0, w, h); const t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').putImageData(img, 0, 0); x.drawImage(t, 0, 0); grat(x, w, h);
        if (parade) { x.strokeStyle = 'rgba(255,255,255,.12)'; for (let k = 1; k < 3; k++) { const X = Math.round(L + k * lw) + .5; x.beginPath(); x.moveTo(X, 0); x.lineTo(X, h); x.stroke(); } }
    }
    // vecteurscope : Cb / Cr Rec. 709 ; cible = couleur pure à 75 % ou 100 %
    const cbcr = (r, g, b) => { const y = Y(r, g, b); return [(b - y) / 1.8556 / 255, (r - y) / 1.5748 / 255]; };
    const BARS = [['R', 1, 0, 0], ['Mg', 1, 0, 1], ['B', 0, 0, 1], ['Cy', 0, 1, 1], ['G', 0, 1, 0], ['Yl', 1, 1, 0]];
    function vec(cv, d) {
        const w = cv.width, h = cv.height, x = cv.getContext('2d'), cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 10, k = R / .5 * .92; // 0,5 = saturation maximale théorique
        const img = x.createImageData(w, h), B = img.data, acc = new Uint16Array(w * h);
        for (let i = 0; i < d.length; i += 8) { const [u, v] = cbcr(d[i], d[i + 1], d[i + 2]); const X = Math.round(cx + u * k), YY = Math.round(cy - v * k); if (X >= 1 && X < w - 1 && YY >= 1 && YY < h - 1) { const q = YY * w + X; acc[q] += 3; acc[q - 1]++; acc[q + 1]++; acc[q - w]++; acc[q + w]++; } }
        for (let i = 0; i < acc.length; i++) if (acc[i]) { const a = Math.min(255, 70 + acc[i] * 12); B[i * 4] = a * .55; B[i * 4 + 1] = a; B[i * 4 + 2] = a * .6; B[i * 4 + 3] = 255; }
        x.fillStyle = '#050506'; x.fillRect(0, 0, w, h); const t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').putImageData(img, 0, 0);
        x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 1; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke(); x.beginPath(); x.moveTo(cx - R, cy); x.lineTo(cx + R, cy); x.moveTo(cx, cy - R); x.lineTo(cx, cy + R); x.stroke();
        // ligne des tons chair (≈ 123° depuis l'axe Cb, entre R et Yl)
        const a = 123 * Math.PI / 180; x.strokeStyle = 'rgba(240,179,120,.55)'; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R, cy - Math.sin(a) * R); x.stroke(); x.setLineDash([]);
        const f = C.tgt / 100; x.font = 'bold 10px system-ui'; x.textAlign = 'center';
        BARS.forEach(([n, r, g, b]) => { const [u, v] = cbcr(r * 255 * f, g * 255 * f, b * 255 * f), X = cx + u * k, YY = cy - v * k, s = 7; x.strokeStyle = 'rgba(255,255,255,.55)'; x.strokeRect(X - s, YY - s, s * 2, s * 2); x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText(n, X + (X > cx ? 15 : -15), YY + 3); });
        x.drawImage(t, 0, 0); x.fillStyle = 'rgba(255,255,255,.45)'; x.textAlign = 'left'; x.fillText(C.tgt + ' %', 6, h - 6);
    }
    function hist(cv, d) {
        const w = cv.width, h = cv.height, x = cv.getContext('2d'), H = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
        for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; H[0][r]++; H[1][g]++; H[2][b]++; H[3][Math.round(Y(r, g, b))]++; }
        x.fillStyle = '#050506'; x.fillRect(0, 0, w, h);
        const sep = C.hist === 'sep', rows = C.hist === 'luma' ? [3] : sep ? [0, 1, 2] : [0, 1, 2, 3], col = ['rgba(255,80,80,', 'rgba(80,230,110,', 'rgba(90,140,255,', 'rgba(230,230,230,'];
        const lane = sep ? h / 3 : h, mx = Math.max(...rows.map(k => Math.max(...H[k].slice(1, 255)))) || 1;
        rows.forEach((k, j) => { const top = sep ? j * lane : 0; x.fillStyle = col[k] + (rows.length > 1 && !sep ? '.38)' : '.8)'); x.beginPath(); x.moveTo(0, top + lane);
            for (let i = 0; i < 256; i++) { const vv = Math.min(1, H[k][i] / mx); x.lineTo(i / 255 * w, top + lane - vv * (lane - 4)); } x.lineTo(w, top + lane); x.fill(); });
        // repères : noirs et blancs de la plage choisie
        const lo = C.range === 'video' ? 16 : 0, hi = C.range === 'video' ? 235 : 255; x.strokeStyle = 'rgba(240,179,120,.5)'; [lo, hi].forEach(v => { const X = Math.round(v / 255 * w) + .5; x.beginPath(); x.moveTo(X, 0); x.lineTo(X, h); x.stroke(); });
        const n = d.length / 4, clip = H[3].slice(hi).reduce((a, b) => a + b, 0) / n, crush = H[3].slice(0, lo + 1).reduce((a, b) => a + b, 0) / n;
        x.fillStyle = 'rgba(255,255,255,.55)'; x.font = '10px ui-monospace,monospace'; x.fillText('noirs ' + (crush * 100).toFixed(1) + ' %', 4, h - 5); x.textAlign = 'right'; x.fillText('blancs ' + (clip * 100).toFixed(1) + ' %', w - 4, h - 5); x.textAlign = 'left';
    }
    // ---------- volet ----------
    function build(ov) {
        css(); if (ov.querySelector('.xcs')) return; panel = document.createElement('aside'); panel.className = 'xcs'; panel.setAttribute('aria-label', 'Scopes');
        ov.appendChild(panel); ov.classList.toggle('xcs-on', C.show !== false);
        const hdr = ov.querySelector('header .sp'); if (hdr && !ov.querySelector('[data-scopes]')) { const b = document.createElement('button'); b.dataset.scopes = 1; b.title = 'Afficher / masquer les scopes (S)'; b.textContent = '📈 Scopes'; b.onclick = toggle; hdr.after(b); }
        draw();
    }
    function toggle() { const ov = document.getElementById('xcl'); if (!ov) return; C.show = !ov.classList.contains('xcs-on'); ov.classList.toggle('xcs-on', C.show); W(); }
    function draw() {
        if (!panel) return;
        panel.innerHTML = '<div class="xcs-hd"><b>📈 Scopes</b></div><div class="xcs-t">' + SC.map(s => '<button data-s="' + s[0] + '" class="' + (C.on.includes(s[0]) ? 'on' : '') + '" aria-pressed="' + C.on.includes(s[0]) + '">' + s[1] + '</button>').join('') + '</div>' +
            '<div class="xcs-o"><select data-o="scale" title="Échelle"><option value="ire"' + (C.scale === 'ire' ? ' selected' : '') + '>IRE</option><option value="pct"' + (C.scale === 'pct' ? ' selected' : '') + '>%</option></select>' +
            '<select data-o="range" title="Plage du signal"><option value="video"' + (C.range === 'video' ? ' selected' : '') + '>Plage vidéo 16-235</option><option value="full"' + (C.range === 'full' ? ' selected' : '') + '>Plage pleine 0-255</option></select>' +
            '<select data-o="tgt" title="Cibles du vecteurscope"><option value="75"' + (C.tgt == 75 ? ' selected' : '') + '>Cibles 75 %</option><option value="100"' + (C.tgt == 100 ? ' selected' : '') + '>Cibles 100 %</option></select>' +
            '<select data-o="hist" title="Histogramme"><option value="over"' + (C.hist === 'over' ? ' selected' : '') + '>Histo. RGB superposé</option><option value="sep"' + (C.hist === 'sep' ? ' selected' : '') + '>Histo. RGB séparé</option><option value="luma"' + (C.hist === 'luma' ? ' selected' : '') + '>Histo. luma</option></select></div>' +
            C.on.map(k => '<figure data-f="' + k + '"><canvas width="' + (k === 'vec' ? 340 : 340) + '" height="' + (k === 'vec' ? 300 : k === 'hist' && C.hist === 'sep' ? 210 : 190) + '"></canvas><figcaption>' + SC.find(s => s[0] === k)[1] + '</figcaption></figure>').join('') +
            (C.on.length ? '' : '<p class="note">Choisissez un ou plusieurs scopes.</p>');
        panel.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const k = b.dataset.s; C.on = C.on.includes(k) ? C.on.filter(x => x !== k) : SC.map(s => s[0]).filter(x => x === k || C.on.includes(x)); W(); draw(); });
        panel.querySelectorAll('[data-o]').forEach(s => s.onchange = () => { C[s.dataset.o] = s.dataset.o === 'tgt' ? +s.value : s.value; W(); draw(); });
    }
    function tick(t) {
        raf = requestAnimationFrame(tick); const ov = document.getElementById('xcl'); if (!ov) { panel = null; return; } if (!ov.querySelector('.xcs')) build(ov);
        if (!ov.classList.contains('xcs-on') || t - last < 66 || !panel) return; last = t;
        const v = ov.querySelector('video'); if (!v || v.hidden || v.readyState < 2) return; const d = sample(v); if (!d) return;
        panel.querySelectorAll('figure').forEach(f => { const cv = f.querySelector('canvas'), k = f.dataset.f; if (k === 'wave') wave(cv, d, false); else if (k === 'parade') wave(cv, d, true); else if (k === 'vec') vec(cv, d); else if (k === 'hist') hist(cv, d); });
    }
    addEventListener('keydown', e => { if (!document.getElementById('xcl') || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return; if (e.key === 's' || e.key === 'S') { e.preventDefault(); e.stopImmediatePropagation(); toggle(); } }, true);
    new MutationObserver(() => { if (document.getElementById('xcl') && !raf) raf = requestAnimationFrame(tick); if (!document.getElementById('xcl') && raf) { cancelAnimationFrame(raf); raf = 0; panel = null; } }).observe(document.documentElement, { childList: true, subtree: false });
    const mo = () => { if (document.body) new MutationObserver(() => { if (document.getElementById('xcl') && !raf) raf = requestAnimationFrame(tick); else if (!document.getElementById('xcl') && raf) { cancelAnimationFrame(raf); raf = 0; panel = null; } }).observe(document.body, { childList: true }); };
    if (document.body) mo(); else addEventListener('DOMContentLoaded', mo);
    return { _t: { wave, vec, hist, sample }, toggle, measure: { Y, cbcr, lv }, cfg: () => Object.assign({}, C) };
})();
