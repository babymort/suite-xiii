// =====================================================================
//  SUITE XIII — CADRO LIVE · contrôle de l'image (saison 6, phase L)
//  Sur le moniteur LIVE :
//   · grilles (tiers, tiers + centre, 4 × 4) et marges de sécurité (titre 90 %, action 93 %) ;
//   · rapports de cadre en surimpression avec cache réglable : 2,39 · 2,35 · 2 (Univisium) · 1,85 · 1,66 · 4:3 · 1:1 · 4:5 · 9:16 ;
//   · zoom pixel 1:1 et × 2 (le cadre suit la souris) pour vérifier le point ;
//   · gel de l'image ; mémoire A (image figée) : comparaison A / B en alternance ou en volet partagé (poignée à glisser) ;
//   · plein écran du moniteur (bouton du haut ou F) : grilles, cadres, aides et comparaison suivent.
//  Raccourcis : G gel · 1 zoom 1:1 · M mémoriser A · W volet A | B · B alterner A / direct.
// =====================================================================
const XCVIEW = (() => {
    const K = 'xiii.cadro.view';
    const DEF = { grid: 'none', title: false, action: false, ratio: 'none', mask: 70, zoom: 0, cmp: 'off', wipe: 50 };
    const J = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(K)) || {}); } catch (e) { return Object.assign({}, DEF); } };
    let C = J(); const W = () => { try { const o = Object.assign({}, C); delete o.zoom; localStorage.setItem(K, JSON.stringify(o)); } catch (e) { } }; C.zoom = 0;
    const RATIOS = [['none', 'Aucun'], ['2.39', '2,39 : 1 (Scope)'], ['2.35', '2,35 : 1'], ['2', '2 : 1 (Univisium)'], ['1.85', '1,85 : 1 (Flat)'], ['1.66', '1,66 : 1'], ['1.333', '4 : 3'], ['1', '1 : 1'], ['0.8', '4 : 5 (réseaux)'], ['0.5625', '9 : 16 (vertical)']];
    let ov = null, raf = 0, frozen = false, A = null, origin = [50, 50];
    const css = () => { if (document.getElementById('xcv-css')) return; const s = document.createElement('style'); s.id = 'xcv-css';
        s.textContent = '#xcl .mon video{transform-origin:50% 50%;transition:transform .12s ease-out}#xcl .xcv-a{position:absolute;pointer-events:none;z-index:1}#xcl .xce-cv{z-index:2}#xcl .xcv-g{position:absolute;pointer-events:none;z-index:3;overflow:visible}#xcl .xcv-h{position:absolute;z-index:4;width:22px;margin-left:-11px;cursor:ew-resize;display:flex;justify-content:center}#xcl .xcv-h::before{content:"";width:2px;height:100%;background:#f0b378;box-shadow:0 0 0 1px rgba(0,0,0,.6)}#xcl .xcv-h b{position:absolute;top:50%;transform:translateY(-50%);background:#f0b378;color:#111;font:800 10px system-ui;padding:3px 5px;border-radius:5px;white-space:nowrap}' +
            '#xcl .xcv-badges{position:absolute;left:10px;top:34px;display:flex;gap:4px;z-index:5;pointer-events:none}#xcl .xcv-badges span{font:700 11px ui-monospace,monospace;padding:3px 7px;border-radius:5px;background:rgba(21,101,192,.85);color:#fff}#xcl .xce-tip,#xcl .xce-pin,#xcl .xce-al,#xcl .xce-lg,#xcl .osd{z-index:5}' +
            '#xcl .xcv label{display:flex;align-items:center;gap:6px;margin:3px 0;font-size:12px;cursor:pointer}#xcl .xcv select{margin:2px 0 4px}#xcl .xcv input[type=range]{flex:1;min-width:0;accent-color:#f0b378}#xcl .xcv .seg2{display:flex;gap:3px;flex-wrap:wrap;margin:3px 0}#xcl .xcv .seg2 button{padding:4px 8px;font-size:11.5px}#xcl .xcv .seg2 button.on{background:rgba(240,179,120,.18);border-color:#f0b378;color:#f6c79a}#xcl .xcv .kb{margin-left:auto;font:600 10px ui-monospace,monospace;opacity:.5;border:1px solid #444;border-radius:4px;padding:0 4px}' +
            '#xcl.xcv-z .mon{cursor:crosshair}';
        document.head.appendChild(s); };
    // ---------- réglages ----------
    function panel(o) { const as = o.querySelector('aside'); if (!as || as.querySelector('.xcv')) return; const d = document.createElement('div'); d.className = 'xcv'; const ref = as.querySelector('.xce'); if (ref) ref.after(d); else as.insertBefore(d, as.querySelector('h4:nth-of-type(3)') || null); draw(d); }
    function draw(d) {
        d = d || (ov && ov.querySelector('.xcv')); if (!d) return;
        const seg = (k, opts) => '<div class="seg2">' + opts.map(([v, l, kb]) => '<button data-g="' + k + '" data-v="' + v + '" class="' + (String(C[k]) === String(v) ? 'on' : '') + '" title="' + (kb ? 'Raccourci : ' + kb : '') + '">' + l + '</button>').join('') + '</div>';
        d.innerHTML = '<h4>🖼️ Contrôle de l\'image</h4><label>Grille <select data-s="grid"><option value="none"' + (C.grid === 'none' ? ' selected' : '') + '>Aucune</option><option value="thirds"' + (C.grid === 'thirds' ? ' selected' : '') + '>Tiers</option><option value="thirdsc"' + (C.grid === 'thirdsc' ? ' selected' : '') + '>Tiers + centre</option><option value="g4"' + (C.grid === 'g4' ? ' selected' : '') + '>4 × 4</option></select></label>' +
            '<label><input type="checkbox" data-c="title"' + (C.title ? ' checked' : '') + '> Marge titre (90 %)</label><label><input type="checkbox" data-c="action"' + (C.action ? ' checked' : '') + '> Marge action (93 %)</label>' +
            '<label>Cadre <select data-s="ratio">' + RATIOS.map(r => '<option value="' + r[0] + '"' + (C.ratio === r[0] ? ' selected' : '') + '>' + r[1] + '</option>').join('') + '</select></label>' + (C.ratio !== 'none' ? '<label style="padding-left:4px">Cache <input type="range" data-r="mask" min="0" max="100" step="5" value="' + C.mask + '"><span style="font:600 11px ui-monospace;min-width:34px;text-align:right">' + C.mask + ' %</span></label>' : '') +
            '<div style="font-size:12px;margin-top:6px">Zoom <span class="kb" style="float:right">1</span></div>' + seg('zoom', [[0, 'Ajusté'], [1, 'Pixel 1:1', '1'], [2, '× 2']]) +
            '<div class="seg2"><button data-a="freeze" class="' + (frozen ? 'on' : '') + '" title="Raccourci : G">' + (frozen ? '▶ Reprendre' : '⏸ Geler l\'image') + '</button><button data-a="mem" title="Raccourci : M">📌 Mémoriser A</button></div>' +
            '<div style="font-size:12px;margin-top:4px">Comparaison' + (A ? ' <small style="opacity:.6">(A : ' + A.t + ')</small>' : ' <small style="opacity:.6">(mémorisez A d\'abord)</small>') + '</div>' + seg('cmp', [['off', 'Direct'], ['a', 'Image A', 'B'], ['wipe', 'Volet A | B', 'W']]);
        d.querySelectorAll('[data-s]').forEach(i => i.onchange = () => { C[i.dataset.s] = i.value; W(); draw(d); });
        d.querySelectorAll('[data-c]').forEach(i => i.onchange = () => { C[i.dataset.c] = i.checked; W(); });
        d.querySelectorAll('[data-r]').forEach(i => i.oninput = () => { C[i.dataset.r] = +i.value; i.nextElementSibling.textContent = i.value + ' %'; W(); });
        d.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { const k = b.dataset.g, v = k === 'zoom' ? +b.dataset.v : b.dataset.v; if (k === 'cmp' && v !== 'off' && !A) mem(); C[k] = v; W(); draw(d); });
        d.querySelectorAll('[data-a]').forEach(b => b.onclick = () => b.dataset.a === 'freeze' ? freeze() : mem());
    }
    // ---------- actions ----------
    function freeze(on) { const v = ov && ov.querySelector('video'); if (!v || v.hidden) return; frozen = on == null ? !frozen : on; if (frozen) v.pause(); else v.play().catch(() => { }); draw(); }
    function mem() { const v = ov && ov.querySelector('video'); if (!v || !v.videoWidth) return; const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); A = { src: c.toDataURL('image/jpeg', .92), t: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), w: c.width, h: c.height }; const im = ov.querySelector('.xcv-a'); if (im) im.src = A.src; if (C.cmp === 'off') C.cmp = 'wipe'; draw(); }
    // ---------- surimpressions ----------
    function layers(o) {
        const mon = o.querySelector('.mon'); if (!mon || mon.querySelector('.xcv-g')) return mon;
        const im = document.createElement('img'); im.className = 'xcv-a'; im.alt = ''; im.hidden = true; mon.appendChild(im);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); g.setAttribute('class', 'xcv-g'); mon.appendChild(g);
        const h = document.createElement('div'); h.className = 'xcv-h'; h.hidden = true; h.innerHTML = '<b>A | B</b>'; mon.appendChild(h);
        const bd = document.createElement('div'); bd.className = 'xcv-badges'; mon.appendChild(bd);
        let drag = false; h.addEventListener('pointerdown', e => { drag = true; h.setPointerCapture(e.pointerId); e.preventDefault(); });
        h.addEventListener('pointermove', e => { if (!drag) return; const r = mon.querySelector('video').getBoundingClientRect(); C.wipe = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)); });
        h.addEventListener('pointerup', () => { drag = false; W(); });
        mon.addEventListener('mousemove', e => { if (!C.zoom) return; const r = mon.getBoundingClientRect(); origin = [Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)), Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100))]; });
        return mon;
    }
    function svg(g, w, h) {
        const L = [], ln = (x1, y1, x2, y2, c, dash) => L.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || 'rgba(255,255,255,.55)') + '" stroke-width="1" ' + (dash ? 'stroke-dasharray="6 4"' : '') + ' vector-effect="non-scaling-stroke"/>');
        let fx = 0, fy = 0, fw = w, fh = h; // zone du cadre choisi
        if (C.ratio !== 'none') { const r = +C.ratio, ir = w / h; if (r > ir) { fh = w / r; fy = (h - fh) / 2; } else { fw = h * r; fx = (w - fw) / 2; } const m = 'rgba(0,0,0,' + (C.mask / 100) + ')';
            if (fy > 0) L.push('<rect x="0" y="0" width="' + w + '" height="' + fy + '" fill="' + m + '"/><rect x="0" y="' + (fy + fh) + '" width="' + w + '" height="' + fy + '" fill="' + m + '"/>'); if (fx > 0) L.push('<rect x="0" y="0" width="' + fx + '" height="' + h + '" fill="' + m + '"/><rect x="' + (fx + fw) + '" y="0" width="' + fx + '" height="' + h + '" fill="' + m + '"/>');
            L.push('<rect x="' + fx + '" y="' + fy + '" width="' + fw + '" height="' + fh + '" fill="none" stroke="#f0b378" stroke-width="1.5" vector-effect="non-scaling-stroke"/><text x="' + (fx + 6) + '" y="' + (fy + 14) + '" fill="#f0b378" font-size="11" font-family="ui-monospace,monospace">' + (RATIOS.find(x => x[0] === C.ratio) || ['', ''])[1] + '</text>'); }
        const n = C.grid === 'g4' ? 4 : 3; if (C.grid !== 'none') { for (let i = 1; i < n; i++) { ln(fx + fw * i / n, fy, fx + fw * i / n, fy + fh); ln(fx, fy + fh * i / n, fx + fw, fy + fh * i / n); } }
        if (C.grid === 'thirdsc') { const cx = fx + fw / 2, cy = fy + fh / 2, s = Math.min(fw, fh) * .04; ln(cx - s, cy, cx + s, cy, '#fff'); ln(cx, cy - s, cx, cy + s, '#fff'); }
        const safe = (p, c) => { const mw = fw * (1 - p) / 2, mh = fh * (1 - p) / 2; L.push('<rect x="' + (fx + mw) + '" y="' + (fy + mh) + '" width="' + (fw - 2 * mw) + '" height="' + (fh - 2 * mh) + '" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/>'); };
        if (C.action) safe(.93, 'rgba(120,200,255,.8)'); if (C.title) safe(.9, 'rgba(255,220,90,.85)');
        const html = L.join(''); if (g.__h !== html) { g.innerHTML = html; g.__h = html; } g.setAttribute('viewBox', '0 0 ' + w + ' ' + h); g.setAttribute('preserveAspectRatio', 'none');
    }
    const fit = (el, r, m) => { const s = el.style, L = (r.left - m.left) + 'px', T = (r.top - m.top) + 'px', Wd = r.width + 'px', Hd = r.height + 'px'; if (s.left !== L) s.left = L; if (s.top !== T) s.top = T; if (s.width !== Wd) s.width = Wd; if (s.height !== Hd) s.height = Hd; };
    function tick() {
        raf = requestAnimationFrame(tick); ov = document.getElementById('xcl'); if (!ov) return; css(); panel(ov); const mon = layers(ov), v = ov.querySelector('video'); if (!mon || !v) return;
        const on = !v.hidden && v.videoWidth; if (frozen && !v.paused) { frozen = false; draw(); } ov.classList.toggle('xcv-z', !!C.zoom);
        // zoom : 1:1 = un pixel de la source par pixel de l'écran
        const base = v.offsetWidth || 1, k = !on || !C.zoom ? 1 : (v.videoWidth / (base * devicePixelRatio)) * (C.zoom === 2 ? 2 : 1), tf = k > 1.001 ? 'scale(' + k.toFixed(3) + ')' : '', to = origin[0].toFixed(1) + '% ' + origin[1].toFixed(1) + '%';
        if (v.style.transform !== tf) v.style.transform = tf; if (v.style.transformOrigin !== to) v.style.transformOrigin = to;
        const g = mon.querySelector('.xcv-g'), im = mon.querySelector('.xcv-a'), h = mon.querySelector('.xcv-h'), bd = mon.querySelector('.xcv-badges');
        if (!on) { g.style.display = 'none'; im.hidden = true; h.hidden = true; bd.innerHTML = ''; return; } g.style.display = '';
        const r = v.getBoundingClientRect(), m = mon.getBoundingClientRect(); fit(g, r, m); svg(g, v.videoWidth, v.videoHeight);
        const showA = A && C.cmp !== 'off'; im.hidden = !showA; if (showA) { if (im.getAttribute('src') !== A.src) im.src = A.src; fit(im, r, m); const cp = C.cmp === 'wipe' ? 'inset(0 ' + (100 - C.wipe).toFixed(2) + '% 0 0)' : 'none'; if (im.style.clipPath !== cp) im.style.clipPath = cp; }
        h.hidden = !(showA && C.cmp === 'wipe'); if (!h.hidden) { h.style.left = (r.left - m.left + r.width * C.wipe / 100) + 'px'; h.style.top = Math.max(0, r.top - m.top) + 'px'; h.style.height = Math.min(r.height, m.height) + 'px'; }
        const B = [frozen ? '⏸ GEL' : '', C.zoom ? (C.zoom === 2 ? 'ZOOM × 2' : 'PIXEL 1:1') : '', showA ? (C.cmp === 'a' ? 'IMAGE A · ' + A.t : 'A | B') : ''].filter(Boolean).map(x => '<span>' + x + '</span>').join(''); if (bd.innerHTML !== B) bd.innerHTML = B;
    }
    addEventListener('keydown', e => { if (!document.getElementById('xcl') || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return; const k = e.key.toLowerCase(); let did = true;
        if (k === 'g') freeze(); else if (k === '1') { C.zoom = C.zoom ? 0 : 1; draw(); } else if (k === 'm') mem(); else if (k === 'w') { if (!A) mem(); C.cmp = C.cmp === 'wipe' ? 'off' : 'wipe'; W(); draw(); } else if (k === 'b') { if (!A) mem(); C.cmp = C.cmp === 'a' ? 'off' : 'a'; W(); draw(); } else did = false;
        if (did) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    const watch = () => new MutationObserver(() => { const o = document.getElementById('xcl'); if (o && !raf) raf = requestAnimationFrame(tick); else if (!o && raf) { cancelAnimationFrame(raf); raf = 0; frozen = false; C.zoom = 0; } }).observe(document.body, { childList: true });
    if (document.body) watch(); else addEventListener('DOMContentLoaded', watch);
    return { cfg: () => Object.assign({}, C), freeze, mem, still: () => A, setA: o => { A = o; if (C.cmp === 'off') C.cmp = 'wipe'; W(); draw(); } };
})();
