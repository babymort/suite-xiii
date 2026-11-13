// SUITE XIII — module commun. Source : xiii-src/suite-motion.js
// =====================================================================
//  SUITE XIII — XMOTION : la fluidité commune à toute la suite (saison 6, phase E)
//  Des mouvements courts et discrets, jamais spectaculaires :
//   · fenêtres (réglages, saisies, confirmations, aperçus) : fondu du voile + la boîte monte de 8 px (0,22 s) ;
//   · menus, listes déroulantes, bulles : fondu + 4 px (0,14 s) ;  · messages (toasts) : glissent depuis le bas ;
//   · changement d'onglet d'un outil : la zone de travail apparaît en fondu (0,18 s) ;
//   · boutons, champs, interrupteurs : couleurs et bordures en transition douce, appui marqué de 1 px ;
//   · volet bibliothèque et panneaux : ouverture glissée.
//  Le réglage « Réduire les animations des outils » garde ses boutons sans transition ; « mouvement réduit » de l'appareil coupe tout.
// =====================================================================
(function () {
    if (window.XMOTION) return;
    const R = document.documentElement, mq = matchMedia('(prefers-reduced-motion: reduce)'), off = () => mq.matches;
    const EASE = 'cubic-bezier(.2,.7,.2,1)';
    const SKIP = /^(xwm|xtm|xt-|xlib-tab|xs-gear|xbug|xoff|xau-chip|xdock-btn|xnf-|xfocus-out|xb-master|xacc-chip|xid-pop|export-loader|xpres|xh-nav|xh-find|top-bar|toolbar|main-layout|library-panel|xd-)/;
    const css = document.createElement('style'); css.id = 'xmotion-css';
    css.textContent = '@media (prefers-reduced-motion:no-preference){' +
        '#top-bar button,#toolbar button,.btn,.xs-seg button,.tab,.lib-item,.xd-r,.xd-l{transition:background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .18s ease,opacity .15s ease}' +
        '#top-bar button:active:not(:disabled),#toolbar button:active:not(:disabled){transform:translateY(1px)}' +
        'input:not([type=range]):not([type=checkbox]):not([type=radio]),select,textarea{transition:border-color .15s ease,box-shadow .15s ease,background-color .15s ease}' +
        '.xs-sw span,.xs-sw span::before,.xs-sw span::after{transition:background-color .18s ease,transform .2s ' + EASE + '}' +
        
        'details>summary{transition:color .15s}details[open]>*:not(summary){animation:xmoIn .2s ' + EASE + '}' +
        '}@keyframes xmoIn{from{opacity:0;transform:translateY(-3px)}}' +
        'html.xreduce #top-bar button:active,html.xreduce #toolbar button:active{transform:none}';
    (document.head || R).appendChild(css);
    const vis = el => { if (!el.isConnected) return false; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .05) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const layerOf = el => { const cs = getComputedStyle(el); return cs.position === 'fixed' || cs.position === 'absolute'; };
    const isToast = el => /toast/i.test(el.id + ' ' + el.className);
    function boxOf(ov) { let best = null, a = 0; const look = (el, d) => { for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.width < 120 || r.height < 60) continue; if (r.width < innerWidth * .95 || r.height < innerHeight * .95) { if (r.width * r.height > a) { a = r.width * r.height; best = c; } } else if (d < 2) look(c, d + 1); } }; look(ov, 0); return best; }
    function enter(el) {
        if (off() || SKIP.test(el.id || '') || el.dataset.xmoSkip) return; const r = el.getBoundingClientRect();
        try {
            if (isToast(el)) { el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: EASE }); return; }
            if (r.width >= innerWidth * .6 && r.height >= innerHeight * .6) { // fenêtre avec voile
                el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
                const b = boxOf(el); if (b && !b.classList.contains('xdock-box')) b.animate([{ opacity: 0, transform: 'translateY(8px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: EASE });
                return; }
            if (r.width * r.height < innerWidth * innerHeight * .5) el.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 140, easing: EASE }); // menu, bulle
        } catch (e) { }
    }
    // suivi des calques posés sur la page (enfants directs de <body>) : apparition = ajout, ou passage de caché à visible
    const SEEN = new WeakMap(); let armed = false, raf = 0; const pend = new Set();
    const check = () => { raf = 0; pend.forEach(el => { const v = el.isConnected && layerOf(el) && vis(el), was = SEEN.get(el); SEEN.set(el, v); if (armed && v && !was) enter(el); }); pend.clear(); };
    const queue = el => { if (el && el.nodeType === 1 && el.parentElement === document.body) { pend.add(el); if (!raf) raf = requestAnimationFrame(check); } };
    const att = new MutationObserver(ms => ms.forEach(m => queue(m.target)));
    const watch = el => { if (el.nodeType !== 1 || /^(SCRIPT|STYLE|LINK)$/.test(el.tagName)) return; att.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden', 'open'] }); queue(el); };
    function start() {
        [...document.body.children].forEach(el => { watch(el); SEEN.set(el, layerOf(el) && vis(el)); });
        new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(watch))).observe(document.body, { childList: true });
        setTimeout(() => { armed = true; }, 1200); // pas d'animation pour ce qui est déjà là au chargement
        // changement d'onglet : la zone de travail apparaît en fondu
        const tc = document.getElementById('tabs-container'); let act = null;
        const actOf = () => { const a = tc && tc.querySelector('.tab.active'); return a ? [...tc.children].indexOf(a) + '|' + (a.textContent || '').slice(0, 30) : null; };
        if (tc) { act = actOf(); new MutationObserver(() => { const n = actOf(); if (n === act) return; const was = act; act = n; if (!armed || off() || was == null) return;
            const ml = document.getElementById('main-layout'); if (!ml) return; [...ml.children].filter(c => c.id !== 'library-panel' && !SKIP.test(c.id || '') && vis(c)).forEach(c => { try { c.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' }); } catch (e) { } }); })
            .observe(tc, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true }); }
    }
    // volet bibliothèque : glisse à sa taille finale (une transition de largeur écrasait son contenu pendant l'ouverture)
    function libWatch() { let was = document.body.classList.contains('lib-hidden');
        new MutationObserver(() => { const h = document.body.classList.contains('lib-hidden'); if (h === was) return; was = h; if (h || off() || !armed) return; const p = document.getElementById('library-panel'); if (!p) return;
            try { p.animate([{ opacity: 0, transform: 'translateX(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: EASE }); } catch (e) { } }).observe(document.body, { attributes: true, attributeFilter: ['class'] }); }
    if (document.body) { start(); libWatch(); } else addEventListener('DOMContentLoaded', () => { start(); libWatch(); });
    window.XMOTION = { enter };
})();
