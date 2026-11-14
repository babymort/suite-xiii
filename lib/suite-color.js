// SUITE XIII — module commun. Source : xiii-src/suite-color.js
// =====================================================================
//  SUITE XIII — XCOLOR : la couleur de la suite (saison 6, phase P)
//  ⚙️ › « Couleur de la suite » : Couleur XIII (l'orange d'origine) · Couleur du projet (celle du projet en cours dans l'espace
//  de travail) · Couleur perso (sélecteur + 10 teintes proposées). Pour toute la suite (clé xiii.color).
//  L'orange XIII est écrit en dur dans les styles des outils (deux teintes : #f0b378 et l'ambre #f0b429, et leurs rgba).
//  Hors couleur XIII, ce module réécrit à la volée les feuilles de style de la page et les styles posés sur les éléments
//  en remplaçant ces deux teintes par la couleur choisie (et une variante plus dense pour l'ambre). Couleur XIII : il ne touche à rien.
// =====================================================================
(function () {
    if (window.XCOLOR) return;
    const K = 'xiii.color', R = document.documentElement;
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const PALETTE = ['#f0b378', '#e57373', '#f06292', '#ba68c8', '#7986cb', '#4fc3f7', '#4db6ac', '#81c784', '#d4e157', '#ffb74d', '#a1887f', '#b0bec5'];
    const hexRgb = h => { h = String(h || '').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return isFinite(n) && h.length === 6 ? [n >> 16 & 255, n >> 8 & 255, n & 255] : null; };
    const toHsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2; let h = 0, s = 0; if (M !== m) { const d = M - m; s = l > .5 ? d / (2 - M - m) : d / (M + m); h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; };
    const toRgb = ([h, s, l]) => { if (!s) return [l, l, l].map(v => Math.round(v * 255)); const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { t < 0 && (t += 1); t > 1 && (t -= 1); return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255)); };
    const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
    function projColor() { const r = J('xiii.ws', null); if (!r || !Array.isArray(r.list)) return null; const w = r.list.find(x => x && x.id === r.cur) || r.list[0]; return w && w.color || null; }
    function chosen() { const c = J(K, {}) || {}; const mode = c.mode || 'xiii'; if (mode === 'projet') return { mode, c: projColor() }; if (mode === 'perso') return { mode, c: c.c || '#4fc3f7' }; return { mode: 'xiii', c: null }; }
    // couleur choisie → teinte « clair » (remplace #f0b378) et teinte « dense » (remplace l'ambre #f0b429)
    function tones(c) { const rgb = hexRgb(c); if (!rgb) return null; const [h, s, l] = toHsl(rgb), A = toRgb([h, Math.min(1, Math.max(.45, s)), Math.min(.78, Math.max(.6, l))]), B = toRgb([h, Math.min(1, Math.max(.6, s + .15)), Math.min(.6, Math.max(.45, l - .08))]); return { A, B }; }
    // remplacements dans un texte CSS (ou un attribut style)
    let T = null;
    const RX = [[/#f0b378\b/gi, () => hex(T.A)], [/#f0b429\b/gi, () => hex(T.B)], [/#f6c79a\b/gi, () => hex(toRgb((([h, s, l]) => [h, s, Math.min(.88, l + .1)])(toHsl(T.A))))],
        [/rgba?\(\s*240\s*,\s*179\s*,\s*120\s*(,\s*[\d.]+\s*)?\)/gi, (m, a) => (a ? 'rgba(' : 'rgb(') + T.A.join(',') + (a || '') + ')'],
        [/rgba?\(\s*240\s*,\s*1[3-8]\d\s*,\s*(?:30|41)\s*(,\s*[\d.]+\s*)?\)/gi, (m, a) => (a ? 'rgba(' : 'rgb(') + T.B.join(',') + (a || '') + ')'], // ambre et lueurs dorées (240,130…185,30/41)
        [/#ff8a3d\b/gi, () => hex(T.B)], [/rgba?\(\s*255\s*,\s*138\s*,\s*61\s*(,\s*[\d.]+\s*)?\)/gi, (m, a) => (a ? 'rgba(' : 'rgb(') + T.B.join(',') + (a || '') + ')']];
    const has = s => /f0b378|f0b429|f6c79a|ff8a3d|240\s*,\s*1[3-8]\d\s*,\s*(120|41|30)|255\s*,\s*138\s*,\s*61/i.test(s);
    const rw = s => RX.reduce((t, [rx, f]) => t.replace(rx, f), s);
    function doStyle(el) { if (el.id === 'xcolor-css') return; if (el.__xo == null) { if (!has(el.textContent)) return; el.__xo = el.textContent; } const want = T ? rw(el.__xo) : el.__xo; el.__xl = want; if (el.textContent !== want) el.textContent = want; }
    function doAttr(el) { const s = el.getAttribute('style'); if (!s) return; if (el.__xso == null || (s !== el.__xsw)) { if (!has(s) && el.__xso == null) return; if (s !== el.__xsw) el.__xso = s; } const want = T ? rw(el.__xso) : el.__xso; if (s !== want) { el.__xsw = want; el.setAttribute('style', want); } else el.__xsw = s; }
    let mo = null;
    function apply() {
        const ch = chosen(); T = ch.mode !== 'xiii' && ch.c ? tones(ch.c) : null; R.dataset.xcolor = T ? ch.mode : 'xiii';
        if (!T && !mo) return; // couleur XIII et rien n'a jamais été modifié : on ne touche à rien
        document.querySelectorAll('style').forEach(doStyle); document.querySelectorAll('[style]').forEach(doAttr);
        if (T) R.style.setProperty('--xiii-c', hex(T.A)); else R.style.removeProperty('--xiii-c');
        if (!mo) { mo = new MutationObserver(ms => { if (!T && !ms.length) return; for (const m of ms) {
                if (m.type === 'attributes') { if (m.target.nodeType === 1 && m.target.getAttribute('style') !== m.target.__xsw) doAttr(m.target); continue; }
                if (m.type === 'characterData' || (m.target.tagName === 'STYLE' && m.type === 'childList')) { const st = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (st && st.tagName === 'STYLE' && st.textContent !== st.__xl) { st.__xo = null; doStyle(st); } continue; } // une réécriture de l'outil (pas la nôtre) : nouvel original
                m.addedNodes.forEach(n => { if (n.nodeType !== 1) return; if (n.tagName === 'STYLE') doStyle(n); else { if (n.hasAttribute('style')) doAttr(n); if (n.firstElementChild) { n.querySelectorAll('style').forEach(doStyle); n.querySelectorAll('[style]').forEach(doAttr); } } }); } });
            mo.observe(R, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style'] }); }
    }
    // ---------- réglage dans ⚙️ ----------
    function row() {
        const pan = document.getElementById('xs-panel'); if (!pan || document.getElementById('xcolor-sw')) return;
        const ds = document.getElementById('xdense-sw'); if (!ds) return; const after = ds.closest('.xs-f'); if (!after) return; // juste sous « Densité »
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xcolor-sw';
        const draw = () => { const c = J(K, {}) || {}, mode = c.mode || 'xiii', pc = projColor();
            d.innerHTML = '<label>Couleur de la suite<small>Accents, liserés, graphiques… dans tous les outils.</small></label><div class="xs-c xc-box">' +
                '<div class="xs-seg" data-xc="mode"><button type="button" data-v="xiii" class="' + (mode === 'xiii' ? 'on' : '') + '"><i class="xc-dot" style="background:#f0b378"></i>XIII</button><button type="button" data-v="projet" class="' + (mode === 'projet' ? 'on' : '') + '"' + (pc ? '' : ' title="Aucun projet en cours dans l’espace de travail"') + '><i class="xc-dot" style="background:' + (pc || '#888') + '"></i>Projet</button><button type="button" data-v="perso" class="' + (mode === 'perso' ? 'on' : '') + '"><i class="xc-dot" style="background:' + (c.c || '#4fc3f7') + '"></i>Perso</button></div>' +
                (mode === 'perso' ? '<div class="xc-pal">' + PALETTE.map(p => '<button type="button" data-xcp="' + p + '" title="' + p + '" class="' + ((c.c || '').toLowerCase() === p ? 'on' : '') + '" style="background:' + p + '"></button>').join('') + '<label class="xc-pick" title="Choisir une couleur"><input type="color" value="' + (c.c || '#4fc3f7') + '"><span>＋</span></label></div>' : '') + '</div>';
            d.querySelectorAll('[data-xc=mode] button').forEach(b => b.onclick = () => { const v = J(K, {}) || {}; v.mode = b.dataset.v; if (v.mode === 'perso' && !v.c) v.c = '#4fc3f7'; save(v); draw(); });
            d.querySelectorAll('[data-xcp]').forEach(b => b.onclick = () => { save({ mode: 'perso', c: b.dataset.xcp }); draw(); });
            const inp = d.querySelector('.xc-pick input'); if (inp) { inp.oninput = () => save({ mode: 'perso', c: inp.value }, true); inp.onchange = () => { save({ mode: 'perso', c: inp.value }); draw(); }; } };
        draw(); after.after(d);
    }
    function save(v, live) { try { localStorage.setItem(K, JSON.stringify(v)); } catch (e) { } apply(); }
    const css = document.createElement('style'); css.id = 'xcolor-css';
    css.textContent = '#xcolor-sw .xs-seg button{display:inline-flex;align-items:center;gap:6px}#xcolor-sw .xc-dot{width:10px;height:10px;border-radius:50%;display:inline-block;box-shadow:0 0 0 1px rgba(255,255,255,.25)}' +
        '#xcolor-sw .xc-box{display:flex;flex-direction:column;align-items:flex-end;gap:8px}#xcolor-sw .xs-seg button{white-space:nowrap}#xcolor-sw .xc-pal{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;max-width:220px}#xcolor-sw .xc-pal button{width:24px;height:24px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;transition:transform .12s}#xcolor-sw .xc-pal button:hover{transform:scale(1.12)}#xcolor-sw .xc-pal button.on{border-color:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.35)}' +
        '#xcolor-sw .xc-pick{position:relative;width:24px;height:24px;border-radius:50%;border:1px dashed currentColor;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;opacity:.75}#xcolor-sw .xc-pick input{position:absolute;inset:0;opacity:0;cursor:pointer}';
    (document.head || R).appendChild(css);
    addEventListener('storage', e => { if (e.key === K || (e.key === 'xiii.ws' && (J(K, {}) || {}).mode === 'projet')) apply(); });
    const go = () => { apply(); new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XCOLOR = { apply, chosen };
})();
