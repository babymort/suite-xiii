// =====================================================================
//  SUITE XIII — XA11Y3 : accessibilité à la carte (saison 6, phase P)
//  Fenêtre « ♿ Accessibilité » (⚙️ › Affichage, page Réglages) — complète la taille du texte et le contraste renforcé :
//   · contraste : normal / renforcé / maximal (textes blancs ou noirs, bordures marquées, plus de textes estompés) ;
//   · taille des cibles : normale / grande (36 px) / très grande (44 px) pour les boutons, cases et menus ;
//   · curseur agrandi : normal / grand / très grand, en couleur bien visible ;
//   · réduire la transparence : plus d'effet verre ni de flou, panneaux opaques ;
//   · contour de focus épais, liens soulignés, réduire les animations (passe par ✨ Animations).
//  Réglage personnel, valable pour tous les projets (clé xiii.a11y, partagée avec la taille du texte et le contraste).
// =====================================================================
(function () {
    if (window.XA11Y3) return;
    const K = 'xiii.a11y', R = document.documentElement;
    const J = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } };
    const W = o => { try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) { } };
    const svg = (s, hand) => { const k = s / 32; const arrow = '<path d="M3 2 L3 26 L9.5 20 L14 30 L18.5 28 L14 18.5 L23 18.5 Z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>';
        const hnd = '<path d="M11 3 a2.5 2.5 0 0 1 5 0 V13 h1.5 a2.2 2.2 0 0 1 4.4 0 v1 a2.2 2.2 0 0 1 4.4 0 v1.5 a2.2 2.2 0 0 1 4.2 .8 V22 c0 5 -3.5 8 -8 8 h-3 c-3 0 -5 -1.5 -6.5 -4 L5 18.5 a2.3 2.3 0 0 1 3.6 -2.8 L11 18 Z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>';
        return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '" viewBox="0 0 32 32">' + (hand ? hnd : arrow) + '<circle cx="' + (hand ? 13.5 : 3) + '" cy="' + (hand ? 3 : 2) + '" r="2.4" fill="#ffb74d"/></svg>') + '") ' + (hand ? Math.round(13 * k) + ' ' + Math.round(2 * k) : Math.round(3 * k) + ' ' + Math.round(2 * k)); };
    const css = document.createElement('style'); css.id = 'xa11y3-css';
    css.textContent =
        // contraste maximal
        'html.xa-ctmax body:not(.light-theme){--text-main:#fff;--text-dim:#f2f2f2;--text-muted:#f2f2f2;--border-color:#b9b9b9;--xh-dim:#f2f2f2;--xh-txt:#fff;--xh-line:rgba(255,255,255,.55);color:#fff}' +
        'html.xa-ctmax body.light-theme{--text-main:#000;--text-dim:#111;--text-muted:#111;--border-color:#333;--xh-dim:#111;--xh-txt:#000;--xh-line:rgba(0,0,0,.6);color:#000}' +
        'html.xa-ctmax small,html.xa-ctmax .hint,html.xa-ctmax .dim,html.xa-ctmax .e,html.xa-ctmax .sub,html.xa-ctmax [class*="-dim"]{opacity:1!important}html.xa-ctmax button,html.xa-ctmax input,html.xa-ctmax select,html.xa-ctmax textarea{border-color:var(--border-color)!important}html.xa-ctmax *{text-shadow:none!important}' +
        // cibles
        'html.xa-tgt1:not(#xa-z):not(#xa-y) button:not(.tab-btn),html.xa-tgt1:not(#xa-z):not(#xa-y) [role=button],html.xa-tgt1:not(#xa-z):not(#xa-y) select,html.xa-tgt1:not(#xa-z):not(#xa-y) .tab{min-height:36px!important;min-width:36px!important}html.xa-tgt1:not(#xa-z):not(#xa-y) input[type=checkbox],html.xa-tgt1:not(#xa-z):not(#xa-y) input[type=radio]{width:20px;height:20px}' +
        'html.xa-tgt2:not(#xa-z):not(#xa-y) button:not(.tab-btn),html.xa-tgt2:not(#xa-z):not(#xa-y) [role=button],html.xa-tgt2:not(#xa-z):not(#xa-y) select,html.xa-tgt2:not(#xa-z):not(#xa-y) .tab{min-height:44px!important;min-width:44px!important}html.xa-tgt2:not(#xa-z):not(#xa-y) input[type=checkbox],html.xa-tgt2:not(#xa-z):not(#xa-y) input[type=radio]{width:24px;height:24px}html.xa-tgt2:not(#xa-z):not(#xa-y) input[type=text],html.xa-tgt2:not(#xa-z):not(#xa-y) input:not([type]),html.xa-tgt2:not(#xa-z):not(#xa-y) input[type=number]{min-height:40px}' +
        // curseur
        'html.xa-cur1,html.xa-cur1 *{cursor:' + svg(40) + ',auto!important}html.xa-cur1 a,html.xa-cur1 a *,html.xa-cur1 button,html.xa-cur1 button *,html.xa-cur1 [role=button],html.xa-cur1 [role=button] *,html.xa-cur1 label,html.xa-cur1 select,html.xa-cur1 summary{cursor:' + svg(40, 1) + ',pointer!important}' +
        'html.xa-cur2,html.xa-cur2 *{cursor:' + svg(64) + ',auto!important}html.xa-cur2 a,html.xa-cur2 a *,html.xa-cur2 button,html.xa-cur2 button *,html.xa-cur2 [role=button],html.xa-cur2 [role=button] *,html.xa-cur2 label,html.xa-cur2 select,html.xa-cur2 summary{cursor:' + svg(64, 1) + ',pointer!important}' +
        'html.xa-cur1 input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]),html.xa-cur1 textarea,html.xa-cur1 [contenteditable=true],html.xa-cur2 input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]),html.xa-cur2 textarea,html.xa-cur2 [contenteditable=true]{cursor:text!important}' +
        // transparence
        'html.xa-notr *,html.xa-notr *::before,html.xa-notr *::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}html.xa-notr body:not(.light-theme){--xh-glass:#1f1f23;--bg-glass:#1f1f23}html.xa-notr body.light-theme{--xh-glass:#f4f4f2;--bg-glass:#f4f4f2}' +
        'html.xa-notr [role=dialog],html.xa-notr .modal,html.xa-notr .modal-box,html.xa-notr #xs-panel,html.xa-notr #xst,html.xa-notr #xh-nav{background-color:var(--bg-panel,#1c1c20)!important}' +
        // focus et liens
        'html.xa-focus :focus-visible{outline:3px solid #ffb74d!important;outline-offset:2px!important;box-shadow:0 0 0 6px rgba(0,0,0,.55)!important}html.xa-links main a:not([class]),html.xa-links p a,html.xa-links li a:not([class]){text-decoration:underline!important;text-underline-offset:2px}' +
        // fenêtre
        '#xa3-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}#xa3-box{width:min(560px,94vw);max-height:90vh;overflow-y:auto;background:var(--bg-panel,#1c1c20);color:var(--text-main,#eee);border:1px solid var(--border-color,#333);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:14px system-ui,sans-serif}' +
        '#xa3-box{display:block!important}#xa3-box .f{flex:none!important;height:auto!important}#xa3-box .xa3-seg{align-items:center!important}#xa3-box .xa3-seg button{height:auto!important;flex:none!important}' +
        '#xa3-box h3{margin:0;padding:16px 18px 2px;font:600 17px system-ui,sans-serif}#xa3-box .sub{padding:0 18px 8px;opacity:.75;font-size:13px}#xa3-box .f{padding:10px 18px;border-top:1px solid var(--border-color,#2a2a2e)}#xa3-box .f>b{display:block;margin-bottom:7px}#xa3-box .xa3-seg{display:flex;flex-wrap:wrap;gap:5px}' +
        '#xa3-box .xa3-seg button,#xa3-box .ft button{padding:7px 12px;border-radius:9px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;cursor:pointer;font:500 13px system-ui,sans-serif}#xa3-box .xa3-seg button.on{background:rgba(240,179,120,.2);border-color:#f0b378;color:#f6c79a}#xa3-box label.l{display:flex;gap:9px;align-items:center;padding:4px 0;cursor:pointer}#xa3-box label.l input{width:18px;height:18px;accent-color:#f0b378}#xa3-box .ft{display:flex;gap:8px;padding:12px 18px;border-top:1px solid var(--border-color,#333)}';
    (document.head || document.documentElement).appendChild(css);
    function apply() {
        const p = J(); R.classList.toggle('xa-contrast', !!p.contrast); R.classList.toggle('xa-ctmax', p.contrast === 'max');
        R.classList.toggle('xa-tgt1', p.tgt === 1); R.classList.toggle('xa-tgt2', p.tgt === 2); R.classList.toggle('xa-cur1', p.cur === 1); R.classList.toggle('xa-cur2', p.cur === 2);
        R.classList.toggle('xa-notr', !!p.notr); R.classList.toggle('xa-focus', !!p.focus); R.classList.toggle('xa-links', !!p.links);
    }
    const OPT = [['contrast', 'Contraste', [[false, 'Normal'], [true, 'Renforcé'], ['max', 'Maximal']]], ['tgt', 'Taille des boutons et cases', [[0, 'Normale'], [1, 'Grande'], [2, 'Très grande']]], ['cur', 'Curseur de la souris', [[0, 'Normal'], [1, 'Grand'], [2, 'Très grand']]]];
    function open() {
        close(); const p = J(), o = document.createElement('div'); o.id = 'xa3-ov'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Accessibilité');
        const animOff = window.XANIM && XANIM.cfg().sp === 0;
        o.innerHTML = '<div id="xa3-box"><h3>♿ Accessibilité</h3><div class="sub">Pour lire, viser et suivre plus facilement. Réglage personnel, pour tous les projets. La taille du texte se règle aussi au clavier : Ctrl Alt + / −.</div>' +
            OPT.map(([k, l, V]) => '<div class="f"><b>' + l + '</b><div class="xa3-seg" role="radiogroup" aria-label="' + l + '">' + V.map(([v, t]) => { const cur = k === 'contrast' ? (p.contrast === 'max' ? 'max' : !!p.contrast) : (p[k] || 0); return '<button role="radio" aria-checked="' + (cur === v) + '" data-k="' + k + '" data-v=\'' + JSON.stringify(v) + '\' class="' + (cur === v ? 'on' : '') + '">' + t + '</button>'; }).join('') + '</div></div>').join('') +
            '<div class="f"><b>Lisibilité et confort</b>' + [['notr', 'Réduire la transparence (pas d\'effet verre ni de flou, panneaux opaques)'], ['focus', 'Contour épais autour de l\'élément actif au clavier'], ['links', 'Souligner les liens']].map(([k, l]) => '<label class="l"><input type="checkbox" data-c="' + k + '"' + (p[k] ? ' checked' : '') + '> ' + l + '</label>').join('') +
            '<label class="l"><input type="checkbox" data-anim' + (animOff ? ' checked' : '') + '> Réduire les animations (aucune animation)</label></div>' +
            '<div class="ft"><span style="flex:1"></span><button data-rs>↺ Par défaut</button><button data-ok style="font-weight:700">✓ Terminé</button></div></div>';
        document.body.appendChild(o);
        o.addEventListener('click', e => { const t = e.target; if (t === o || t.closest('[data-ok]')) return close(); const q = J();
            if (t.closest('[data-rs]')) { ['contrast', 'tgt', 'cur', 'notr', 'focus', 'links'].forEach(k => delete q[k]); W(q); apply(); return open(); }
            const b = t.closest('[data-k]'); if (b) { const v = JSON.parse(b.dataset.v); if (v === false || v === 0) delete q[b.dataset.k]; else q[b.dataset.k] = v; W(q); apply(); open(); } });
        o.addEventListener('change', e => { const t = e.target, q = J(); if (t.dataset.c) { if (t.checked) q[t.dataset.c] = true; else delete q[t.dataset.c]; W(q); apply(); }
            if (t.hasAttribute('data-anim')) { try { const a = JSON.parse(localStorage.getItem('xiii.anim.cfg') || '{}'); a.sp = t.checked ? 0 : 1; localStorage.setItem('xiii.anim.cfg', JSON.stringify(a)); dispatchEvent(new StorageEvent('storage', { key: 'xiii.anim.cfg' })); } catch (x) { } } });
        const f = o.querySelector('.on,button'); if (f) f.focus();
    }
    function close() { const o = document.getElementById('xa3-ov'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xa3-ov')) { e.stopImmediatePropagation(); close(); } }, true);
    addEventListener('storage', e => { if (e.key === K) apply(); });
    // bouton « Plus de réglages » sous ⚙️ › Accessibilité (taille du texte, contraste)
    function more() { const s = document.getElementById('xa-set'); if (!s || s.querySelector('#xa3-more')) return; const b = document.createElement('button'); b.type = 'button'; b.id = 'xa3-more'; b.className = 'xs-btn'; b.style.marginTop = '8px'; b.textContent = '♿ Plus de réglages : contraste maximal, boutons, curseur, transparence…'; b.onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; s.appendChild(b); }
    const go = () => { apply(); new MutationObserver(() => { if (document.getElementById('xa-set')) more(); }).observe(document.body, { childList: true, subtree: true }); };
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    apply();
    window.XA11Y3 = { open, close, apply };
})();
