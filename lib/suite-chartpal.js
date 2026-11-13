// SUITE XIII — module commun. Source : xiii-src/suite-chartpal.js
// =====================================================================
//  SUITE XIII — XCHARTPAL : une seule palette pour tous les graphiques de l'accueil (saison 6, phase D)
//  --xc-1 orange XIII · --xc-2 ambre · --xc-3 bleu · --xc-4 vert · --xc-5 violet · --xc-track (rail des jauges et barres)
//  Déclinée pour les thèmes sombres, Sobre (noir mat, teintes adoucies) et clairs (Clair, Sobre clair : teintes plus denses
//  pour rester lisibles sur fond blanc). Anneaux, jauges, barres, histogrammes, courbes, frise et météo s'en servent.
// =====================================================================
(function () {
    if (window.XCHARTPAL) return;
    const s = document.createElement('style'); s.id = 'xchartpal-css';
    s.textContent =
        ':root{--xc-1:#f0b378;--xc-2:#f0b429;--xc-3:#64b5f6;--xc-4:#81c784;--xc-5:#ba68c8;--xc-track:rgba(255,255,255,.08);--xc-r:14px}' +
        'html.xsobre:not(.xsobrel),html:has(body.xsobre:not(.xsobrel)){--xc-1:#d9a26e;--xc-2:#c9a43a;--xc-3:#7aa7cf;--xc-4:#86b38a;--xc-5:#a88bbf;--xc-track:rgba(255,255,255,.07)}' +
        'html:has(body.light-theme),html.xsobrel,html:has(body.xsobrel){--xc-1:#c56f1e;--xc-2:#a87a06;--xc-3:#1f6fb5;--xc-4:#2e7d32;--xc-5:#7b3f99;--xc-track:rgba(0,0,0,.08)}' +
        '#xd-dash .xd-c{border-radius:var(--xc-r)!important}' +
        'html:has(body.light-theme) .xfr-ph,html.xsobrel .xfr-ph,html:has(body.xsobrel) .xfr-ph{color:#fff!important}';
    (document.head || document.documentElement).appendChild(s);
    window.XCHARTPAL = { css: s };
})();
