// SUITE XIII — saison 6, phase ZZ : tous les émojis de l'interface au trait (contour), jamais en couleur pleine.
// Chaque émoji connu devient une icône au trait (jeu Lucide, licence ISC) qui prend la couleur du texte ;
// pastilles et carrés de couleur (🟢 🔴 🟦…) → petit rond / carré au trait de leur couleur (le sens reste) ;
// drapeaux → code pays (GB, ES…) ; tout autre émoji → silhouette d'une seule couleur.
// Exceptions : champs de saisie, zones éditables, sélecteurs d'émoji (.xgl-keep), la Pause (LUDO), et le réglage « Émojis » (⚙️ › Icônes).
// L'émoji d'origine reste dans la page (caché) : le texte copié et les outils qui le lisent ne changent pas.
(() => {
    if (window.XEMO || (window.XIII_APP || '') === 'ludo') return;
    const I = /*@@I@@*/{}, M = /*@@M@@*/{};
    const DOT = { '🟢': '#43a047', '🔴': '#e53935', '🟠': '#fb8c00', '🟡': '#f9c00f', '🔵': '#1e88e5', '🟣': '#8e24aa', '🟤': '#8d6e63', '⚪': '', '⚫': '', '⭕': '#e53935', '🔘': '' };
    const SQ = { '🟦': '#1e88e5', '🟩': '#43a047', '🟧': '#fb8c00', '🟥': '#e53935', '🟨': '#f9c00f', '🟪': '#8e24aa', '🟫': '#8d6e63', '⬜': '', '⬛': '', '◻': '', '◼': '', '▫': '', '▪': '', '🔲': '', '🔳': '', '◽': '', '◾': '' };
    const HEART = { '❤': '#e53935', '🧡': '#fb8c00', '💛': '#f9c00f', '💚': '#43a047', '💙': '#1e88e5', '💜': '#8e24aa', '🖤': '', '🤍': '', '🤎': '#8d6e63' };
    const RX = /[\u{1F1E6}-\u{1F1FF}]{2}|[0-9#*]️?⃣|\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu;
    const QUICK = /[‼-㊙\u{1F000}-\u{1FAFF}]/u, PRES = /\p{Emoji_Presentation}|️/u;
    const SKIP = 'input,textarea,select,option,script,style,noscript,svg,canvas,code,pre,title,.xgl-keep,.xgl-e,.xemo,[contenteditable=""],[contenteditable=true],[data-xemo=off]';
    const on = () => { try { return localStorage.getItem('xiii.ux.icons') !== '0'; } catch (e) { return true; } };
    const NS = 'http://www.w3.org/2000/svg';
    const svg = (inner, cls) => { const t = document.createElement('template'); t.innerHTML = '<svg class="xemo-i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + inner + '</svg>'; return t.content.firstChild; };
    function glyph(e) {
        const k = e.replace(/️/g, ''), base = k.split('‍')[0];
        if (I[M[k]]) return svg(I[M[k]]);
        if (k in DOT) return svg('<circle cx="12" cy="12" r="6.5" style="' + (DOT[k] ? 'stroke:' + DOT[k] + ';fill:' + DOT[k] + '33' : k === '⚫' ? 'fill:currentColor' : '') + '"/>');
        if (k in SQ) return svg('<rect x="5.5" y="5.5" width="13" height="13" rx="2" style="' + (SQ[k] ? 'stroke:' + SQ[k] + ';fill:' + SQ[k] + '33' : /[⬛◼▪◾]/.test(k) ? 'fill:currentColor' : '') + '"/>');
        if (k in HEART) { const s = svg(I.Heart); if (HEART[k]) s.style.stroke = HEART[k]; return s; }
        if (/^[\u{1F1E6}-\u{1F1FF}]{2}$/u.test(k)) { const b = document.createElement('b'); b.className = 'xemo-t'; b.textContent = [...k].map(c => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 65)).join(''); return b; }
        if (/⃣/.test(k)) { const b = document.createElement('b'); b.className = 'xemo-t xemo-n'; b.textContent = k[0]; return b; }
        if (I[M[base]]) return svg(I[M[base]]);
        if (!PRES.test(e)) return null; // symbole affiché en texte (ex. → ©) : déjà d'une seule couleur
        const s = document.createElement('span'); s.className = 'xemo-s'; s.textContent = base; return s;
    }
    function fix(n) {
        const v = n.nodeValue; if (!v || !QUICK.test(v)) return;
        const p = n.parentNode; if (!p || p.nodeType !== 1 || p.closest(SKIP)) return;
        RX.lastIndex = 0; let m, last = 0, frag = null;
        while ((m = RX.exec(v))) {
            const g = glyph(m[0]); if (!g) continue;
            if (!frag) frag = document.createDocumentFragment();
            // l'espace collé à l'émoji passe dans l'icône (marge) : il disparaîtrait sinon dans les boutons en flex
            let a = m.index, z = m.index + m[0].length, cl = 'xemo';
            if (v[z] === ' ' && v.slice(z + 1).trim()) { z++; cl += ' xemo-r'; }
            else if (a > last && v[a - 1] === ' ' && v.slice(last, a - 1).trim() && !v.slice(z).trim()) { a--; cl += ' xemo-l'; }
            if (a > last) frag.appendChild(document.createTextNode(v.slice(last, a)));
            const w = document.createElement('span'); w.className = cl; const h = document.createElement('span'); h.className = 'xgl-e'; h.textContent = v.slice(a, z);
            w.appendChild(h); w.appendChild(g); frag.appendChild(w); last = z;
        }
        if (!frag) return; if (last < v.length) frag.appendChild(document.createTextNode(v.slice(last)));
        p.replaceChild(frag, n);
    }
    function run(root) {
        if (!on() || !root) return;
        if (root.nodeType === 3) return fix(root);
        if (root.nodeType !== 1 || !QUICK.test(root.textContent || '')) return;
        if (root.closest && root.closest(SKIP)) return;
        const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), L = []; let n;
        while ((n = w.nextNode())) if (QUICK.test(n.nodeValue)) L.push(n);
        L.forEach(fix);
    }
    // les émojis remis par l'option « Émojis » : on rend le texte d'origine
    function undo() { document.querySelectorAll('.xemo').forEach(w => { const h = w.querySelector('.xgl-e'); w.replaceWith(document.createTextNode(h ? h.textContent : '')); }); }
    function css() {
        const s = document.createElement('style'); s.id = 'xemo-css';
        s.textContent = '.xemo{display:inline;white-space:nowrap}.xemo-r{margin-right:.32em}.xemo-l{margin-left:.32em}.xemo .xgl-e{display:none!important}svg.xemo-i{display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}' +
            '.xemo-t{display:inline-block;font:700 .62em/1.5 system-ui,sans-serif;letter-spacing:.04em;padding:0 .35em;border:1.5px solid currentColor;border-radius:.4em;vertical-align:.12em}.xemo-n{border-radius:50%;padding:0 .45em}' +
            '.xemo-s{color:transparent!important;text-shadow:0 0 0 currentColor;opacity:.9}@media print{.xemo-s{color:inherit!important;text-shadow:none;filter:grayscale(1)}}';
        (document.head || document.documentElement).appendChild(s);
    }
    function init() {
        css(); run(document.body);
        new MutationObserver(R => {
            if (!on()) return;
            for (const r of R) {
                if (r.type === 'characterData') { fix(r.target); continue; }
                for (const a of r.addedNodes) { if (a.nodeType === 1 && (a.classList.contains('xemo') || a.matches('svg'))) continue; run(a); }
            }
        }).observe(document.body, { childList: true, subtree: true, characterData: true });
        addEventListener('storage', e => { if (e.key === 'xiii.ux.icons') { if (on()) run(document.body); else undo(); } });
    }
    window.XEMO = { run, undo, glyph };
    if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
