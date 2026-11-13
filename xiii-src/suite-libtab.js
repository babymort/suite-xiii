// =====================================================================
//  SUITE XIII — XLIBTAB : languette de la bibliothèque (saison 6, retour du 08/11)
//  Le bouton « Afficher / masquer la bibliothèque » quitte la barre d'outils : c'est une languette accrochée au bord du volet.
//  Volet replié : collée au bord gauche de l'écran (comme la languette 🧺 à droite). Volet déplié : collée au bord droit du volet,
//  elle suit le volet pendant qu'il s'ouvre ou se ferme. Le bouton d'origine reste caché dans la page (Ctrl K le trouve toujours).
// =====================================================================
(function () {
    if (window.XLIBTAB) return;
    const $ = id => document.getElementById(id);
    let tab, panel, src, ro;
    function place() {
        if (!tab || !panel || !src) return;
        const r = panel.getBoundingClientRect(), open = r.width > 4 && getComputedStyle(panel).display !== 'none';
        const x = open ? Math.round(r.right) : 0; if (tab.style.left !== x + 'px') tab.style.left = x + 'px'; if (document.documentElement.style.getPropertyValue('--xlib-r') !== x + 'px') document.documentElement.style.setProperty('--xlib-r', x + 'px');
        const top = Math.max(r.top, ($('toolbar') || {}).getBoundingClientRect ? $('toolbar').getBoundingClientRect().bottom : 0), bot = r.height > 40 ? r.bottom : innerHeight;
        { const tp = Math.round(top + (bot - top) * 0.46 - 26) + 'px'; if (tab.style.top !== tp) tab.style.top = tp; }
        const t = (src.title || '').replace(/^(Masquer|Afficher)\s*/i, '') || 'la bibliothèque';
        if (tab.classList.contains('open') !== open || !tab.querySelector('svg')) { tab.classList.toggle('open', open); tab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (open ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>'; }
        { const tt = (open ? 'Masquer ' : 'Afficher ') + t, ae = open ? 'true' : 'false'; if (tab.title !== tt) tab.title = tt; if (tab.getAttribute('aria-expanded') !== ae) tab.setAttribute('aria-expanded', ae); }
    }
    function mount() {
        src = $('lib-toggle-btn'); panel = $('library-panel'); if (!src || !panel) return false;
        if (!$('xlib-css')) { const s = document.createElement('style'); s.id = 'xlib-css';
            s.textContent = '#lib-toggle-btn[data-xlib]{display:none!important}' +
                '#xlib-tab{position:fixed;z-index:90;width:22px;height:52px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:0 10px 10px 0;border:1px solid rgba(240,179,120,.6);border-left:0;background:var(--bg-menu,#232327);color:var(--text-main,#eee);cursor:pointer;box-shadow:4px 4px 16px rgba(0,0,0,.35);transition:background .15s}' +
                '#xlib-tab svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}#xlib-tab:hover{background:rgba(240,179,120,.22)}#xlib-tab:focus-visible{outline:2px solid rgb(240,179,120);outline-offset:2px}' +
                /* bandeau de sauvegarde (en bas à gauche) : ne recouvre pas le volet ouvert */'#xau-chip{left:calc(var(--xlib-r,0px) + 16px)!important;max-width:min(560px,calc(100vw - var(--xlib-r,0px) - 32px))!important;transition:left .2s ease}' +
                /* pendant l'ouverture (largeur 0 → 281 px) le contenu garde sa taille finale : il est dévoilé, pas écrasé */'#library-panel{overflow:hidden!important;contain:paint}#library-panel>*{min-width:280px;box-sizing:border-box}' +
                'body.xfocus #xlib-tab{display:none}@media print{#xlib-tab{display:none!important}}';
            document.head.appendChild(s); }
        if (!src.dataset.xlib) { src.dataset.xlib = 1; try { if (window.XSECT) XSECT.arrange(); } catch (e) { } }
        if (!tab) { tab = document.createElement('button'); tab.type = 'button'; tab.id = 'xlib-tab'; tab.innerHTML = '<i>‹</i>'; tab.onclick = () => { src.click(); [60, 140, 260].forEach(t => setTimeout(place, t)); }; document.body.appendChild(tab);
            try { ro = new ResizeObserver(place); ro.observe(panel); } catch (e) { }
            addEventListener('resize', place); panel.addEventListener('transitionend', place); setInterval(place, 1000); }
        place(); return true;
    }
    let n = 0; const go = () => { if (!mount() && ++n < 12) setTimeout(go, 500); };
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(() => setTimeout(go, 300), 2996); else throw 0; } catch (e) { addEventListener('load', () => setTimeout(go, 900)); }
    window.XLIBTAB = { place };
})();
