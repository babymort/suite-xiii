// =====================================================================
//  SUITE XIII — XA11Y2 : confort pour tous, en complément de XA11Y (phase ZZ, saison 5)
//  Mesuré par robot sur les 34 outils, thèmes sombre et clair, avant correction :
//  103 (sombre) et 212 (clair) textes sous le contraste minimal, 73 champs et 7 boutons sans nom pour les lecteurs d'écran,
//  9 fenêtres qui ne se fermaient pas avec Échap, focus clavier laissé derrière les fenêtres ouvertes.
//  • contrastes : chaque texte trop pâle sur son fond est foncé (thème clair) ou éclairci (thème sombre) juste assez
//    pour atteindre le niveau AA (4,5:1, 3:1 pour les gros titres) — même teinte, recalculé à chaque changement de thème
//  • fenêtres : Échap ferme la plus haute (par son bouton ✕), le focus entre dans la fenêtre, Tab y reste, et revient
//    au bouton d'origine à la fermeture ; rôle « dialog » annoncé avec son titre
//  • noms : chaque champ reçoit le nom de sa colonne ou de son libellé voisin ; ✕ ＋ ★ 🏠… seuls deviennent « Fermer », « Ajouter »…
//  • contour de focus : visible même là où un outil l'avait retiré
// =====================================================================
(function () {
    if (window.XA11Y2) return; const APPX = '__APP__';
    const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
    // ---------- couleurs ----------
    const rgb = s => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(s || ''); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
    const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const BGC = new WeakMap(); let gen = 0;
    function bgOf(e) { // fond réellement visible derrière le texte (calques semi-transparents composés), null si image
        const L = []; let x = e;
        for (; x; x = x.parentElement) { const hit = BGC.get(x); if (hit && hit.g === gen) { L.push([...hit.c, 1]); break; }
            const c = getComputedStyle(x); const bi = c.backgroundImage; if (bi && bi !== 'none') { if (!/gradient/.test(bi)) return null; const g = rgb((bi.match(/rgba?\([^)]+\)/) || [''])[0]); if (g && g[3] > 0) { L.push(g); if (g[3] >= .95) break; } }
            const k = rgb(c.backgroundColor); if (k && k[3] > 0) { L.push(k); if (k[3] >= .95) break; } }
        if (!L.length || L[L.length - 1][3] < .95) { const d = document.body.classList.contains('light-theme') ? [250, 248, 244] : [30, 30, 30]; const b = rgb(getComputedStyle(document.documentElement).backgroundColor); L.push(b && b[3] > .5 ? [b[0], b[1], b[2], 1] : [...d, 1]); }
        let c = L.pop().slice(0, 3); while (L.length) { const l = L.pop(); c = c.map((v, i) => v * (1 - l[3]) + l[i] * l[3]); }
        BGC.set(e, { g: gen, c }); return c;
    }
    const toHsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2; let h = 0, s = 0; if (M !== m) { const d = M - m; s = l > .5 ? d / (2 - M - m) : d / (M + m); h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; };
    const toRgb = ([h, s, l]) => { if (!s) return [l, l, l].map(v => Math.round(v * 255)); const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { t < 0 && (t += 1); t > 1 && (t -= 1); return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255)); };
    function fixColor(fg, bg, need) { // même teinte, luminosité déplacée à l'opposé du fond, jusqu'au seuil
        const hsl = toHsl(fg), dark = lum(bg) > .18; let lo = dark ? 0 : hsl[2], hi = dark ? hsl[2] : 1, best = null;
        const ok = l => ratio(toRgb([hsl[0], hsl[1], l]), bg) >= need;
        if (!ok(dark ? 0 : 1)) return dark ? [0, 0, 0] : [255, 255, 255];
        for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (ok(mid)) { best = mid; if (dark) lo = mid; else hi = mid; } else { if (dark) hi = mid; else lo = mid; } }
        return toRgb([hsl[0], hsl[1], best == null ? (dark ? 0 : 1) : best]);
    }
    const SKIP = 'svg,canvas,video,[contenteditable],[aria-hidden=true],[id*=watermark],#xa-skip,.leaflet-container,.leaflet-pane,[disabled],:disabled,[aria-disabled=true],#xt-root,.xa2-no';
    const DONE = new WeakMap(); let busy = false;
    function contrast(root) {
        if (busy || document.documentElement.classList.contains('xa-none')) return; busy = true; let n = 0, k = 0;
        try {
            const tw = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT); let t;
            while ((t = tw.nextNode()) && k < 5000) { k++; const s = t.textContent; if (s.length < 2 || !/[A-Za-zÀ-ÿ0-9]/.test(s)) continue; const el = t.parentElement; if (!el) continue;
                const d = DONE.get(el); if (d && d.g === gen) continue; DONE.set(el, { g: gen });
                if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue; if (el.closest(SKIP)) continue;
                const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity < .5) continue;
                const fg = rgb(cs.color); if (!fg || fg[3] < .3) continue; if (+cs.opacity < 1) fg[3] *= +cs.opacity; const bg = bgOf(el); if (!bg) continue;
                let f = fg.slice(0, 3); if (fg[3] < 1) f = f.map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
                const fs = parseFloat(cs.fontSize), need = (fs >= 24 || (fs >= 18.6 && +cs.fontWeight >= 700)) ? 3.05 : 4.55;
                if (ratio(f, bg) >= need) continue;
                if (+cs.opacity < 1) { el.dataset.xa2op = el.style.getPropertyValue('opacity') || '-'; el.style.setProperty('opacity', '1', 'important'); f = fg.slice(0, 3); const a0 = fg[3] / +cs.opacity; if (a0 < 1) f = f.map((v, i) => v * a0 + bg[i] * (1 - a0)); if (ratio(f, bg) >= need) { n++; continue; } }
                const c = fixColor(f, bg, need); if (!el.dataset.xa2c) el.dataset.xa2c = el.style.getPropertyValue('color') || '-'; el.dataset.xa2bg = bg.slice(0, 3).map(Math.round).join(',');
                el.style.setProperty('color', 'rgb(' + c.join(',') + ')', 'important'); n++; }
        } catch (e) { } busy = false; return n;
    }
    function resetContrast() { gen++; $$('[data-xa2c]').forEach(e => { const o = e.dataset.xa2c; if (o === '-') e.style.removeProperty('color'); else e.style.setProperty('color', o); delete e.dataset.xa2c; }); $$('[data-xa2op]').forEach(e => { const o = e.dataset.xa2op; if (o === '-') e.style.removeProperty('opacity'); else e.style.setProperty('opacity', o); delete e.dataset.xa2op; }); }
    // ---------- noms pour les lecteurs d'écran ----------
    const GLYPH = { '✕': 'Fermer', '×': 'Fermer', '✖': 'Fermer', '＋': 'Ajouter', '+': 'Ajouter', '➕': 'Ajouter', '★': 'Favori', '☆': 'Favori', '🏠': 'Accueil', '🗑': 'Supprimer', '🗑️': 'Supprimer', '✎': 'Modifier', '✏️': 'Modifier', '⋯': 'Plus d’options', '…': 'Plus d’options', '▾': 'Ouvrir la liste', '◀': 'Précédent', '▶': 'Suivant', '↑': 'Monter', '↓': 'Descendre', '⟳': 'Actualiser', '🔍': 'Rechercher', '⚙️': 'Réglages', '❓': 'Aide', '📋': 'Copier', '⧉': 'Dupliquer' };
    const clean = s => String(s || '').replace(/\s+/g, ' ').replace(/[*:]+\s*$/, '').trim().slice(0, 60);
    function fieldName(e) {
        const td = e.closest('td,th'); if (td) { const tr = td.parentElement, tb = td.closest('table'); if (tb && tr) { const i = [...tr.children].indexOf(td), hr = tb.querySelector('thead tr') || tb.querySelector('tr'); const h = hr && hr !== tr && hr.children[i]; if (h && clean(h.textContent)) return clean(h.textContent); } }
        // grille de lignes (div) : en-tête de colonne au même x
        const row = e.closest('[id^=row-],.row,.line,.item'); if (row) { const r = e.getBoundingClientRect(), cx = r.left + r.width / 2; const head = row.parentElement && [...row.parentElement.children].find(x => x !== row && /head|hdr|thead|cols/i.test(x.className + ' ' + x.id)); if (head) { const c = [...head.querySelectorAll('*')].filter(x => !x.children.length && clean(x.textContent)).find(x => { const q = x.getBoundingClientRect(); return cx >= q.left - 4 && cx <= q.right + 4; }); if (c) return clean(c.textContent); } }
        for (let p = e.previousElementSibling, i = 0; p && i < 3; p = p.previousElementSibling, i++) { if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(p.tagName)) break; const t = clean(p.textContent); if (t && t.length < 50) return t; }
        const par = e.parentElement; if (par) { const own = [...par.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' '); if (clean(own)) return clean(own); const lab = par.querySelector('label,.label,.lbl,b,strong,small,span'); if (lab && lab !== e && !lab.contains(e) && clean(lab.textContent) && clean(lab.textContent).length < 50) return clean(lab.textContent); }
        if (e.tagName === 'SELECT' && e.options[0]) return clean(e.options[e.selectedIndex >= 0 ? e.selectedIndex : 0].textContent);
        if (e.name) return clean(e.name.replace(/[-_]/g, ' ')); if (e.id) return clean(e.id.replace(/^[a-z]+-/, '').replace(/[-_]/g, ' '));
        return '';
    }
    function names(root) {
        $$('input:not([type=hidden]):not([type=button]):not([type=submit]):not([aria-label]):not([aria-labelledby]),select:not([aria-label]):not([aria-labelledby]),textarea:not([aria-label]):not([aria-labelledby])', root).forEach(e => {
            if (e.title || e.placeholder || e.closest('label') || (e.id && document.querySelector('label[for="' + CSS.escape(e.id) + '"]'))) return; const n = fieldName(e); if (n) e.setAttribute('aria-label', n); });
        $$('button:not([aria-label]),[role=button]:not([aria-label]),a[href]:not([aria-label])', root).forEach(b => {
            if (b.title) return; const t = (b.textContent || '').trim(); if (t.replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{2BFF}\u{FE0F}\u{200D}✓✕＋−×·•…+]/gu, '').trim()) return;
            const g = GLYPH[t] || GLYPH[t.replace(/️/g, '')]; if (g) b.setAttribute('aria-label', g); });
    }
    // ---------- fenêtres : Échap, focus, Tab ----------
    const CLOSE = 'button[data-x],[data-close],.xs-x,.close,.modal-close,.m-x,.close-x,[id$="-x"],[id$="-close"],button[aria-label^="Fermer"],button[title^="Fermer"]';
    const REMOVABLE = /^(m-ov|xm-d-ov|xmd-ov|xgt-ov|xsh-ov|xps-ban|xzz-dv)$/;
    let base = null;
    const isLayer = e => { if (!e || e.nodeType !== 1 || /^(SCRIPT|STYLE|LINK)$/.test(e.tagName) || e.id === 'xt-root' || e.id === 'xa-skip') return false; const c = getComputedStyle(e); if (c.position !== 'fixed' || c.display === 'none' || c.visibility === 'hidden' || +c.opacity < .1) return false; const r = e.getBoundingClientRect(); return e.getAttribute('role') === 'dialog' || r.width * r.height > innerWidth * innerHeight * .25; };
    const isModal = e => { const r = e.getBoundingClientRect(); return r.width >= innerWidth * .9 && r.height >= innerHeight * .9; };
    const layers = () => [...document.body.children].filter(e => isLayer(e) && !(base && base.has(e))).sort((a, b) => (+getComputedStyle(a).zIndex || 0) - (+getComputedStyle(b).zIndex || 0));
    const FOC = 'input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
    const focusables = o => $$(FOC, o).filter(x => x.offsetParent || getComputedStyle(x).position === 'fixed');
    const PREV = new WeakMap();
    function opened(o) {
        if (o.dataset.xa2o || !isModal(o)) return; o.dataset.xa2o = 1; PREV.set(o, document.activeElement);
        const box = o.querySelector('[role=dialog],.m-sheet,.modal,.xs-box,.box,.panel') || o; if (!box.getAttribute('role')) box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
        const h = box.querySelector('h1,h2,h3,h4,.title,.hd'); if (h && !box.getAttribute('aria-label') && !box.getAttribute('aria-labelledby')) box.setAttribute('aria-label', clean(h.textContent));
        setTimeout(() => { if (!o.isConnected || o.contains(document.activeElement)) return; const f = focusables(o); const first = f.find(x => /^(INPUT|SELECT|TEXTAREA)$/.test(x.tagName) && !x.readOnly) || f.find(x => !x.matches(CLOSE)) || f[0]; if (first) try { first.focus({ preventScroll: true }); } catch (e) { } }, 60);
    }
    function closed(o) { const p = PREV.get(o); if (p && p.isConnected && !layers().length) try { p.focus({ preventScroll: true }); } catch (e) { } }
    function onKey(e) {
        const L = layers(); if (!L.length) return; const top = L[L.length - 1];
        if (e.key === 'Escape') { setTimeout(() => { if (!top.isConnected || !isLayer(top)) return; // personne ne l'a fermée
                const x = [...top.querySelectorAll(CLOSE)].filter(b => b.offsetParent || getComputedStyle(b).position === 'fixed').pop() || [...top.querySelectorAll('button')].find(b => /^\s*[✕×✖]\s*$/.test(b.textContent) || /^(annuler|fermer)$/i.test(b.textContent.trim()));
                if (x) x.click(); else if (REMOVABLE.test(top.id)) top.remove(); else { const r = top.getBoundingClientRect(); if (r.width >= innerWidth * .9) top.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })), top.dispatchEvent(new MouseEvent('click', { bubbles: true })); } }, 0); return; }
        if (e.key === 'Tab' && isModal(top)) { const f = focusables(top); if (!f.length) return; const a = document.activeElement, i = f.indexOf(a);
            if (i < 0) { e.preventDefault(); f[0].focus(); } else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    }
    // ---------- styles ----------
    function css() { if (document.getElementById('xa2-css')) return; const s = document.createElement('style'); s.id = 'xa2-css';
        s.textContent = 'html body :focus-visible:not(#xa2-a):not(#xa2-b){outline:2px solid #f0b378!important;outline-offset:2px!important}html body.light-theme :focus-visible:not(#xa2-a):not(#xa2-b){outline-color:#9a4f0e!important}' +
            '#tabs-container .tab *{opacity:1}iframe:focus{outline:2px solid #f0b378!important;outline-offset:2px}'; document.head.appendChild(s); }
    // ---------- démarrage ----------
    let T = 0;
    const pass = () => { names(); contrast(); $$('[id*=watermark]:not([aria-hidden])').forEach(e => e.setAttribute('aria-hidden', 'true')); };
    function start() {
        css(); base = new Set([...document.body.children].filter(isLayer)); pass();
        addEventListener('keydown', onKey, true);
        const seenL = new Set();
        new MutationObserver(ms => {
            for (const m of ms) { m.addedNodes.forEach(n => { if (n.parentElement === document.body) setTimeout(() => { if (isLayer(n) && !base.has(n)) { seenL.add(n); opened(n); } }, 30); }); m.removedNodes.forEach(n => { if (seenL.has(n)) { seenL.delete(n); closed(n); } }); }
            clearTimeout(T); T = setTimeout(pass, 900);
        }).observe(document.body, { childList: true, subtree: true, characterData: true });
        // un état qui change (onglet actif, bouton allumé…) : les textes concernés repartent de leur couleur d'origine et sont revérifiés
        // …mais seulement si le fond derrière le texte a vraiment changé : sinon la couleur corrigée était effacée puis remise
        // sans fin à chaque changement de classe d'un parent (nom d'onglet qui clignotait blanc / noir)
        const restore = e => { const o = e.dataset.xa2c; if (o === undefined) return; try { gen++; const b = bgOf(e); gen--; if (b && e.dataset.xa2bg === b.slice(0, 3).map(Math.round).join(',')) return; } catch (x) { } delete e.dataset.xa2bg; if (o === '-') e.style.removeProperty('color'); else e.style.setProperty('color', o); delete e.dataset.xa2c; };
        new MutationObserver(ms => { let any = false; for (const m of ms) { const t = m.target; if (t === document.body || !t.isConnected) continue; any = true; restore(t); t.querySelectorAll('[data-xa2c]').forEach(restore); }
            if (any) { clearTimeout(T); T = setTimeout(() => { gen++; pass(); }, 500); } }).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
        // overlays affichés/masqués par classe ou style (sans ajout au DOM)
        setInterval(() => { [...document.body.children].forEach(n => { if (base.has(n)) return; const L = isLayer(n); if (L && !seenL.has(n)) { seenL.add(n); delete n.dataset.xa2o; opened(n); } else if (!L && seenL.has(n)) { seenL.delete(n); closed(n); } }); }, 400);
        // thème ou contraste renforcé changés : tout est recalculé
        const sig = () => [document.body.classList.contains('light-theme'), document.documentElement.classList.contains('xa-contrast'), document.documentElement.classList.contains('xa-none'), document.documentElement.getAttribute('data-theme'), document.body.getAttribute('data-theme')].join('|'); let S0 = sig();
        const re = () => { const s = sig(); if (s === S0) return; S0 = s; resetContrast(); clearTimeout(T); T = setTimeout(pass, 150); };
        new MutationObserver(re).observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        new MutationObserver(re).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    }
    const go = () => setTimeout(start, 400);
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(go, 2960); else throw 0; } catch (e) { if (document.readyState === 'loading') addEventListener('DOMContentLoaded', go); else go(); }
    window.XA11Y2 = { contrast, resetContrast, names, layers };
})();
