// =====================================================================
//  SUITE XIII — XSOBRE : thème « ◼️ Sobre » (saison 6, design)
//  Fond noir mat, lignes fines, aucune transparence, aucun flou, aucune lueur, aucun dégradé.
//  Les couleurs de la suite restent : orange XIII pour l'action et l'état actif, ambre pour les repères.
//  Choix : ⚙️ › Affichage › Thème › ◼️ Sobre (comme les autres thèmes, un seul réglage pour toute la suite).
// =====================================================================
(function () {
    if (document.getElementById('xsobre-css')) return;
    const B = 'html body.xsobre:not(#xs0):not(#xs1)'; // les :not(#…) donnent à ces règles la priorité sur celles des outils
    const CSS = `
${B}{color-scheme:dark;
 --s-bg:#0e0f12;--s-bg2:#121317;--s-bg3:#16171b;--s-bg4:#1c1d22;--s-line:#1f2126;--s-line2:#2a2c32;--s-txt:#ececee;--s-mut:#a3a6ad;--s-dim:#858991;--s-acc:#ff8a3d;--s-acc2:#f0b429;--s-accbg:rgba(255,138,61,.13);
 --bg-main:var(--s-bg);--bg-panel:var(--s-bg2);--bg-panel-alt:var(--s-bg2);--bg-header:var(--s-bg);--bg-topbar:var(--s-bg);--bg-input:var(--s-bg3);--bg-menu:var(--s-bg2);
 --border-color:var(--s-line2);--border-soft:var(--s-line);--text-main:var(--s-txt);--text-muted:var(--s-mut);--text-dim:var(--s-dim);
 --lib-item-bg:var(--s-bg2);--lib-item-border:var(--s-line);--tab-bg:var(--s-bg2);--row-bg:transparent;--row-alt:transparent;--row-hover:var(--s-bg3);
 --accent:255,138,61;--accent-text:#ff9d5c;--x-acc:255,138,61;--x-acc-c:#ff8a3d;
 --btn-bg:var(--s-bg3);--btn-bg-hover:var(--s-bg4);--btn-border:var(--s-line2);--btn-border-hover:#3b3e45;--btn-bg-active:var(--s-accbg);--btn-border-active:var(--s-acc);
 --x-r-sm:6px;--x-r:8px;--x-r-lg:10px;--x-shadow:none;--x-font:system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
 --xh-glass:var(--s-bg2);--xh-line:var(--s-line2);--xh-txt:var(--s-txt);--xh-dim:var(--s-dim);
 --wm:rgba(255,255,255,.08);--wm2:rgba(255,255,255,.05);
 background:var(--s-bg)!important;background-image:none!important;font-family:var(--x-font)}
/* rien de translucide, rien de flou, aucune lueur */
${B} *,${B} *::before,${B} *::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;text-shadow:none!important}
${B} #workspace,${B} #workspace-container,${B} #content,${B} #main-layout,${B} main,${B} #app{background-color:var(--s-bg)!important;background-image:none!important}
/* barres du haut : à plat, une ligne fine dessous */
${B} #top-bar,${B} #toolbar,${B} header{background:var(--s-bg)!important;background-image:none!important;border-bottom:1px solid var(--s-line)!important;box-shadow:none!important}
${B} #toolbar{background:var(--s-bg)!important}
/* boutons : carrés arrondis sombres, liseré fin ; l'état actif passe à l'orange */
${B} button,${B} .btn,${B} select,${B} [role=button]:not(.xs-item):not(.card){box-shadow:none!important;background-image:none!important;filter:none!important}
${B} #top-bar button,${B} #toolbar button,${B} .btn-group button,${B} .modal-box button,${B} [class$="-box"] button,${B} #xs-panel button:not(.xs-item),${B} .m-btn,${B} .xs-seg button{background:var(--s-bg3)!important;border:1px solid var(--s-line2)!important;color:var(--s-txt)!important;border-radius:8px!important}
${B} #top-bar button:hover,${B} #toolbar button:hover,${B} .btn-group button:hover,${B} .modal-box button:hover,${B} [class$="-box"] button:hover,${B} #xs-panel button:not(.xs-item):hover,${B} .m-btn:hover{background:var(--s-bg4)!important;border-color:#3b3e45!important}
${B} button.btn-active,${B} button.on,${B} button.active,${B} button[aria-pressed=true],${B} .xs-seg button.on,${B} .tab.active,${B} .tab.on{background:var(--s-accbg)!important;border-color:var(--s-acc)!important;color:#ffb27f!important}
${B} button.btn-active svg.xgl-ic,${B} button.on svg.xgl-ic{stroke:var(--s-acc)!important}
${B} .xgl-pri,${B} #top-bar button.xgl-pri,${B} #toolbar button.xgl-pri,${B} button.primary,${B} .m-btn.primary,${B} .xnw-b .ok{background:var(--s-acc)!important;border-color:var(--s-acc)!important;color:#140a03!important;border-radius:8px!important;font-weight:700}
${B} .xgl-pri:hover,${B} button.primary:hover{background:#ff9b57!important;filter:none!important}
${B} .xgl-ind{display:none!important}
${B} .xs-seg{background:var(--s-bg)!important;border:1px solid var(--s-line2)!important;border-radius:9px!important;padding:2px!important;box-shadow:none!important}
${B} .xs-seg button,${B} #xs-panel .xs-seg button{border:0!important;background:transparent!important;color:var(--s-mut)!important}${B} #xs-panel .xs-seg button:hover{color:var(--s-txt)!important;background:var(--s-bg3)!important}${B} .xs-seg button.on,${B} #xs-panel .xs-seg button.on{background:var(--s-accbg)!important;color:#ffb27f!important;box-shadow:inset 0 0 0 1px var(--s-acc)!important}
/* champs */
${B} input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]),${B} select,${B} textarea{background:var(--s-bg2)!important;border:1px solid var(--s-line2)!important;color:var(--s-txt)!important;border-radius:6px!important;box-shadow:none!important}
${B} input:focus,${B} select:focus,${B} textarea:focus{border-color:var(--s-acc)!important}
/* tableaux et listes : en-têtes en petites capitales grises, lignes séparées d'un trait */
${B} th,${B} thead td,${B} .th,${B} [class*=thead] > *,${B} .col-head,${B} .hdr{text-transform:uppercase;letter-spacing:.07em;font-size:11px!important;font-weight:600!important;color:var(--s-dim)!important;background:var(--s-bg)!important;border-color:var(--s-line)!important}
${B} td{border-color:var(--s-line)!important}${B} tr{background:transparent!important}${B} tbody tr:hover{background:var(--s-bg3)!important}
${B} table{border-color:var(--s-line)!important}
/* cartes, panneaux, fenêtres : à plat, bord fin, coins discrets */
${B} .card,${B} .panel,${B} aside,${B} #library-panel,${B} #props,${B} .modal-box,${B} [class$="-box"],${B} #xs-panel,${B} .xs-sec,${B} #xb-menu,${B} #xt-panel,${B} .xnw,${B} .m-sheet,${B} .xm-d,${B} #xst,${B} #xst-b,${B} .xd-c,${B} .lib-item{background:var(--s-bg2)!important;background-image:none!important;border:1px solid var(--s-line)!important;box-shadow:none!important}
${B} .card,${B} .modal-box,${B} [class$="-box"],${B} #xs-panel,${B} .xnw,${B} .m-sheet,${B} .xm-d,${B} .xd-c{border-radius:10px!important}
${B} #library-panel,${B} aside{background:var(--s-bg)!important;border-width:0 1px 0 0!important}
${B} .lib-item:hover,${B} .card:hover{border-color:var(--s-line2)!important;background:var(--s-bg3)!important;transform:none!important}
${B} .modal-overlay,${B} [id$="-ov"],${B} #m-ov{background:rgba(0,0,0,.66)!important}
/* onglets de projets dans la barre */
${B} #tabs-container .tab{background:transparent!important;border:1px solid transparent!important;border-radius:8px!important;box-shadow:none!important}
${B} #tabs-container .tab.active,${B} #tabs-container .tab.on{background:var(--s-bg3)!important;border-color:var(--s-line2)!important;box-shadow:inset 0 -2px 0 var(--s-acc)!important;color:var(--s-txt)!important}
/* titres : blancs et nets, le repère orange reste sur le grand titre */
${B} h1,${B} h2,${B} h3{letter-spacing:-.01em}
${B} [id*=watermark] *{color:rgba(255,255,255,.07)!important}
/* barres de défilement fines */
${B} *{scrollbar-width:thin;scrollbar-color:#2a2c32 transparent}
${B} ::-webkit-scrollbar{width:8px;height:8px}${B} ::-webkit-scrollbar-thumb{background:#2a2c32;border-radius:8px;border:0}${B} ::-webkit-scrollbar-track{background:transparent}
${B} ::selection{background:rgba(255,138,61,.35)}
/* bulles, toasts */
${B} #toast,${B} .toast,${B} .xtoast{background:var(--s-bg3)!important;border:1px solid var(--s-line2)!important;color:var(--s-txt)!important;box-shadow:none!important;border-radius:8px!important}
/* accueil : barre latérale et tableau de bord à plat */
${B} #xh-nav,${B} #xh-nav *{background-image:none!important;box-shadow:none!important}
${B} #xh-nav{background:var(--s-bg)!important;border-right:1px solid var(--s-line)!important;border-radius:0!important}
${B} #xh-nav a,${B} #xh-nav button{border-radius:8px!important;border:1px solid transparent!important;background:transparent!important}
${B} #xh-nav a:hover,${B} #xh-nav button:hover{background:var(--s-bg3)!important}
${B} #xh-nav .on,${B} #xh-nav .active,${B} #xh-nav [aria-current]{background:var(--s-bg3)!important;border-color:var(--s-line2)!important;box-shadow:inset 2px 0 0 var(--s-acc)!important}
${B}.xh,${B}.xh.xpbg{background:var(--s-bg)!important;background-image:none!important}
${B} img{filter:none!important}
${B} *:not(#xt-hole):not(.color-swatch):not(input):not(.xa2-keep){box-shadow:none!important}
${B} #xh-nav{border-radius:0!important;width:200px}${B} #xh-ind{display:none!important}
${B} #xh-nav button{border-radius:8px!important;color:var(--s-mut)!important;background:transparent!important}
${B} #xh-nav button .i{background:var(--s-bg3)!important;border-radius:7px!important}
${B} #xh-nav button:hover{background:var(--s-bg3)!important;color:var(--s-txt)!important}
${B} #xh-nav button.on{width:auto!important;border-radius:8px!important;background:var(--s-bg3)!important;color:var(--s-txt)!important;box-shadow:inset 2px 0 0 var(--s-acc)!important}
${B} #xh-nav button.on .i{background:var(--s-accbg)!important;color:var(--s-acc)!important}
${B} #xh-nav .cur-proj{border-radius:8px!important;border-color:var(--s-line2)!important;background:var(--s-bg2)!important}
${B} #xd-dash .xd-c{background:var(--s-bg2)!important;border:1px solid var(--s-line)!important;border-radius:10px!important}
${B} #xs-gear,${B} #xbug-btn,${B} #xaic-btn{background:var(--s-bg3)!important;border:1px solid var(--s-line2)!important;color:var(--s-txt)!important}
`;
    const s = document.createElement('style'); s.id = 'xsobre-css'; s.textContent = CSS; (document.head || document.documentElement).appendChild(s);
})();
