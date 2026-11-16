// SUITE XIII — saison 6, phase ZZ « Textes lisibles sur chaque fond » (mesuré par robot dans les 15 thèmes, WCAG AA)
// Les textes secondaires dérivent de la couleur de texte du thème (jamais un gris fixe), les liens d'accent sont
// rapprochés de la couleur du texte, et les thèmes Régie nuit / Terminal ont des cartes et un menu d'accueil sur fond noir.
(() => {
    if (window.XLEGIBLE) return; window.XLEGIBLE = 1;
    const css = '.xem-trio small,#xem-first p,#xem-syno p,.xem-h{color:color-mix(in srgb,var(--text-main,#eee) 74%,transparent)!important}' +
        '#xid-chip.empty span{opacity:1!important;font-style:italic;color:color-mix(in srgb,currentColor 82%,transparent)}' +
        '.xd-l{color:color-mix(in srgb,var(--accent-text,#f0b378) 72%,var(--text-main,#fff))!important}' +
        'body.xregie .xd-c,body.xregie #xh-pinhint,body.xregie #xh-nav,body.xregie section.phase,body.xregie #xd-dash>.xd-hd{background:#0b0000!important;background-image:none!important}' +
        'body.xregie .xd-c *,body.xregie #xh-pinhint,body.xregie #xh-pinhint *,body.xregie #xh-nav .xh-foot,body.xregie .phase-hint{color:#ff6a60!important}' +
        'html body.xregie,html body.xh.xregie{background:#000!important;background-image:none!important}' +
        '#xh-find,#xh-find span,#xh-find kbd,#xd-dash>.xd-hd b{color:color-mix(in srgb,var(--text-main,#eee) 76%,transparent)!important}' +
        'body.xterm #xh-nav,body.xterm #xh-nav .xh-foot{background:#000!important;background-image:none!important}body.xterm #xh-nav .xh-foot{color:#33ff66!important}';
    // ZZ « Application et versions téléphone » : au doigt, zones tactiles d'au moins 32 px (onglet bibliothèque, bandeaux sauvegarde et hors ligne)
    const touch = '@media (pointer:coarse){#xlib-tab{min-width:32px!important}#xoff button,#xau-chip button{min-height:34px!important;padding-top:6px!important;padding-bottom:6px!important}}';
    const add = () => { const s = document.createElement('style'); s.id = 'xlegible-css'; s.textContent = css + touch; (document.head || document.documentElement).appendChild(s); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
})();
