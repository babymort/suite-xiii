// SUITE XIII — module commun. Source : xiii-src/suite-wman.js
// =====================================================================
//  SUITE XIII — XWMAN : gestionnaire de widgets du Dashboard (saison 6, phase D)
//  Le bouton ＋ des widgets ouvre une fenêtre en trois zones :
//   1. en haut à gauche, la GRILLE : chaque widget est un bloc qu'on déplace et qu'on redimensionne (poignée en bas à droite),
//      sans chevauchement — comme un inventaire ; un bloc refusé (hors grille ou sur un autre) s'affiche en rouge et revient ;
//   2. à droite, le BANDEAU DE RÉGLAGES du widget cliqué : taille, position, style, couleur, titre, contenu (Master), retirer ;
//   3. en bas, la LISTE de tous les widgets : on les glisse sur la grille (1 × 1 par défaut), ou ＋ pour la première place libre.
//  Clavier : flèches = déplacer, Maj + flèches = redimensionner, Suppr = retirer, Échap = fermer.
//  Disposition propre à chaque personne (xiii.dash.me : lay + sty), appliquée au Dashboard sur grand écran (4 colonnes).
// =====================================================================
(function () {
    if (window.XWMAN) return;
    const COLS = 4, MAXH = 4, ROWH = 132, GAP = 12, D = () => (typeof XDASH !== 'undefined' && XDASH.cards) ? XDASH : null;
    const $ = (s, r) => (r || document).querySelector(s), esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const STY = [['std', 'Standard'], ['accent', 'Liseré'], ['solid', 'Teinté'], ['glass', 'Verre'], ['ghost', 'Discret']];
    const COLORS = ['', '#f0b378', '#f0b429', '#4fc3f7', '#81c784', '#e57373', '#ba68c8', '#4db6ac', '#f06292'];
    const wide = () => innerWidth >= 900;
    const ico = n => (String(n).match(/^\S+/) || [''])[0], lab = n => String(n).replace(/^\S+\s*/, '');

    // ---------------- styles ----------------
    const css = document.createElement('style'); css.id = 'xwm-css';
    css.textContent =
        /* Dashboard : disposition libre */
        'html body #xd-dash .xd-g.xwm-on{grid-template-columns:repeat(' + COLS + ',minmax(0,1fr))!important;grid-auto-rows:' + ROWH + 'px!important;grid-auto-flow:row!important;align-items:stretch!important;gap:' + GAP + 'px!important}' +
        'html body #xd-dash .xd-g.xwm-on>.xd-c{min-height:0!important;height:auto!important;overflow:auto;scrollbar-width:thin}' +
        '#xd-dash .xd-c[data-xwms=accent]{border-color:var(--xwmc,var(--xc-1,#f0b378))!important;box-shadow:inset 3px 0 0 var(--xwmc,var(--xc-1,#f0b378))}' +
        '#xd-dash .xd-c[data-xwms=solid]{background:color-mix(in srgb,var(--xwmc,var(--xc-1,#f0b378)) 14%,var(--bg-panel,#1c1c1f))!important;border-color:color-mix(in srgb,var(--xwmc,var(--xc-1,#f0b378)) 40%,transparent)!important}' +
        '#xd-dash .xd-c[data-xwms=glass]{background:rgba(255,255,255,.045)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-color:rgba(255,255,255,.12)!important}' +
        '#xd-dash .xd-c[data-xwms=ghost]{background:transparent!important;border-style:dashed!important;box-shadow:none!important}' +
        /* la taille se règle dans le gestionnaire : plus de coin de redimensionnement sur l'accueil */'#xd-dash .xd-rs{display:none!important}' +
        /* formats : anneau, jauge, barre */'#xd-dash .xwm-fmt{display:flex;align-items:center;gap:14px;margin:4px 0 6px}#xd-dash .xwm-fmt svg{flex:none;overflow:visible}#xd-dash .xwm-fmt .tr{fill:none;stroke:var(--xc-track,rgba(255,255,255,.09))}#xd-dash .xwm-fmt .vl{fill:none;stroke:var(--xwmc,var(--xc-1,#f0b378));stroke-linecap:round;transition:stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)}' +
        '#xd-dash .xwm-fmt text{fill:var(--text-main,#eee);font:800 19px system-ui,"Segoe UI",sans-serif;text-anchor:middle;dominant-baseline:central}#xd-dash .xwm-fmt .sb{font-size:12px;opacity:.65;line-height:1.35}' +
        '#xd-dash .xwm-fmt.bar{flex-direction:column;align-items:stretch;gap:6px;width:100%;align-self:stretch}#xd-dash .xwm-fmt.bar .bt{width:100%}#xd-dash .xwm-fmt .bt{height:12px;border-radius:999px;background:var(--xc-track,rgba(255,255,255,.08));overflow:hidden}#xd-dash .xwm-fmt .bv{height:100%;border-radius:999px;background:linear-gradient(90deg,color-mix(in srgb,var(--xwmc,var(--xc-1,#f0b378)) 70%,#fff 0%),var(--xwmc,var(--xc-1,#f0b378)));transition:width 1s cubic-bezier(.2,.7,.2,1)}#xd-dash .xwm-fmt .bn{font:800 22px system-ui,sans-serif}' +
        '#xd-dash .xd-c[data-xwmf] .xwm-hid{display:none!important}' +
        '#xd-dash .xwm-fmt.curve{display:block;width:100%}#xd-dash .xwm-fmt .cvh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}#xd-dash .xwm-fmt .cvh b{font:800 26px/1.1 system-ui,sans-serif;font-variant-numeric:tabular-nums}#xd-dash .xwm-fmt .cvh span{font-size:12px;opacity:.75}#xd-dash .xwm-fmt .cvh .up,#xd-dash .xwm-fmt .cvh .dn{color:var(--xwmc,var(--xc-1,#f0b378));opacity:.95}' +
        '#xd-dash .xwm-fmt .cvs{display:block;width:100%;height:70px;margin:6px 0 2px;overflow:visible}#xd-dash .xwm-fmt .cl{fill:none;stroke:var(--xwmc,var(--xc-1,#f0b378));stroke-width:2.2;stroke-linecap:round;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:xwmDraw 1.1s cubic-bezier(.3,.7,.2,1) .15s forwards}#xd-dash .xwm-fmt .ca{opacity:0;animation:xwmFade .8s ease .6s forwards}#xd-dash .xwm-fmt .cd{fill:var(--xwmc,var(--xc-1,#f0b378));opacity:0;animation:xwmFade .3s ease 1.2s forwards}' +
        '@keyframes xwmDraw{to{stroke-dashoffset:0}}@keyframes xwmFade{to{opacity:1}}#xd-dash .xwm-fmt .cvx{display:flex;justify-content:space-between;font-size:11px;opacity:.5}#xd-dash .xwm-fmt .cv0{display:flex;flex-direction:column;gap:4px}#xd-dash .xwm-fmt .cv0 b{font:800 26px system-ui,sans-serif}#xd-dash .xwm-fmt .cv0 span{font-size:12px;opacity:.65}' +
        '#xd-dash .xwm-fmt.kpi{flex-direction:column;align-items:flex-start;gap:2px}#xd-dash .xwm-fmt .kv{font:800 40px/1.05 system-ui,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.02em;color:var(--xwmc,var(--text-main,#eee))}' +
        '#xd-dash .xwm-fmt.compact{flex-direction:column;align-items:flex-start;gap:2px}#xd-dash .xwm-fmt.compact .bn{font-size:34px;line-height:1.05;color:var(--xwmc,var(--xc-1,#f0b378))}' +
        '#xd-dash .xwm-fmt .ch{display:flex;flex-wrap:wrap;gap:6px}#xd-dash .xwm-fmt .ch a{padding:3px 10px;border-radius:999px;border:1px solid var(--border-color,#4a4a50);font-size:12px;color:inherit;text-decoration:none;transition:border-color .15s,background .15s}#xd-dash .xwm-fmt .ch a:hover{border-color:var(--xwmc,var(--xc-1,#f0b378))}#xd-dash .xwm-fmt .ch a.ok{border-color:rgba(129,199,132,.55)}#xd-dash .xwm-fmt .ch a.ko{border-color:rgba(229,115,115,.6);color:#ef9a9a}' +
        '#xd-dash .xwm-fmt.time{display:block;width:100%}#xd-dash .xwm-fmt .tl{list-style:none;margin:2px 0 0;padding:0 0 0 14px;border-left:2px solid rgba(255,255,255,.1)}#xd-dash .xwm-fmt .tl li{position:relative;padding:0 0 9px 6px}#xd-dash .xwm-fmt .tl li::before{content:"";position:absolute;left:-21px;top:4px;width:10px;height:10px;border-radius:50%;background:var(--xwmc,var(--xc-1,#f0b378));box-shadow:0 0 0 3px var(--bg-panel,#1c1c1f)}#xd-dash .xwm-fmt .tl li.ko::before{background:#e57373}#xd-dash .xwm-fmt .tl a{color:inherit;text-decoration:none;display:flex;flex-direction:column}#xd-dash .xwm-fmt .tl b{font-size:13px;font-weight:650}#xd-dash .xwm-fmt .tl small{font-size:11.5px;opacity:.6}' +
        '#xd-dash .xwm-fmt.histo{display:block;width:100%}#xd-dash .xwm-fmt .hg{display:flex;flex-direction:column;gap:6px}#xd-dash .xwm-fmt .hg a{display:grid;grid-template-columns:minmax(0,40%) 1fr auto;align-items:center;gap:8px;color:inherit;text-decoration:none;font-size:12px}#xd-dash .xwm-fmt .hl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#xd-dash .xwm-fmt .ht{height:9px;border-radius:999px;background:var(--xc-track,rgba(255,255,255,.07));overflow:hidden}#xd-dash .xwm-fmt .hv{display:block;height:100%;border-radius:999px;background:var(--xwmc,var(--xc-1,#f0b378));transition:width .9s cubic-bezier(.2,.7,.2,1)}#xd-dash .xwm-fmt .hn{font-variant-numeric:tabular-nums;opacity:.75;min-width:18px;text-align:right}' +
        '#xd-dash .xd-c[data-xwmt="0"]>h4{display:none!important}#xd-dash .xd-c[data-xwmc]>h4{color:var(--xwmc)}' +
        /* fenêtre */
        '#xwm{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;animation:xwmF .18s ease-out}' +
        '@keyframes xwmF{from{opacity:0}}@keyframes xwmB{from{opacity:0;transform:translateY(8px) scale(.985)}}' +
        '#xwm .xwm-b{width:min(1320px,100%);height:min(880px,100%);display:grid;grid-template-columns:minmax(0,1fr) 330px;grid-template-rows:auto minmax(0,1fr) 200px;grid-template-areas:"hd hd" "gr sd" "ls ls";background:var(--bg-menu,#1d1d21);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:16px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5);font:13px/1.45 system-ui,"Segoe UI",sans-serif;animation:xwmB .22s cubic-bezier(.2,.7,.2,1)}' +
        '#xwm .xwm-hd{grid-area:hd;display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-color,#333)}#xwm .xwm-hd b{font-size:15px}#xwm .xwm-hd small{opacity:.6;flex:1}' +
        '#xwm button{font:inherit;color:inherit;cursor:pointer}#xwm .xwm-btn{height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--border-color,#555);background:transparent}#xwm .xwm-btn:hover{border-color:#f0b378}' +
        '#xwm .xwm-btn.pri{background:#f0b378;border-color:#f0b378;color:#1a1208;font-weight:700}#xwm .xwm-btn.pri:hover{filter:brightness(1.06)}' +
        /* zone 1 : grille */
        '#xwm .xwm-gr{grid-area:gr;overflow:auto;padding:16px;scrollbar-width:thin}' +
        '#xwm .xwm-bd{position:relative;user-select:none;transition:height .2s ease}' +
        '#xwm .xwm-cell{position:absolute;border:1px dashed rgba(255,255,255,.09);border-radius:10px;background:rgba(255,255,255,.015)}' +
        '#xwm .xwm-w{position:absolute;border-radius:12px;border:1px solid var(--border-color,#4a4a50);background:var(--bg-panel,#26262b);display:flex;flex-direction:column;gap:4px;padding:10px 12px;cursor:grab;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.25);transition:left .2s cubic-bezier(.2,.7,.2,1),top .2s cubic-bezier(.2,.7,.2,1),width .2s cubic-bezier(.2,.7,.2,1),height .2s cubic-bezier(.2,.7,.2,1),box-shadow .15s,border-color .15s;touch-action:none}' +
        '#xwm .xwm-w:hover{border-color:rgba(240,179,120,.6)}#xwm .xwm-w.sel{border-color:#f0b378;box-shadow:0 0 0 2px rgba(240,179,120,.45),0 8px 22px rgba(0,0,0,.35)}' +
        '#xwm .xwm-w.drag{transition:none;cursor:grabbing;z-index:5;opacity:.92;box-shadow:0 16px 36px rgba(0,0,0,.45)}' +
        '#xwm .xwm-w .i{font-size:22px;line-height:1}#xwm .xwm-w .n{font-weight:650;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#xwm .xwm-w .z{font-size:11px;opacity:.55;margin-top:auto}' +
        '#xwm .xwm-w[data-s=accent]{box-shadow:inset 3px 0 0 var(--c,#f0b378)}#xwm .xwm-w[data-s=solid]{background:color-mix(in srgb,var(--c,#f0b378) 16%,var(--bg-panel,#26262b))}#xwm .xwm-w[data-s=glass]{background:rgba(255,255,255,.05)}#xwm .xwm-w[data-s=ghost]{background:transparent;border-style:dashed}' +
        '#xwm .xwm-h{position:absolute;right:0;bottom:0;width:24px;height:24px;cursor:nwse-resize;opacity:.55}#xwm .xwm-h::before{content:"";position:absolute;right:3px;bottom:3px;width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;border-radius:0 0 3px 0}#xwm .xwm-w:hover .xwm-h{opacity:1}' +
        '#xwm .xwm-pv{position:absolute;border-radius:12px;border:2px dashed #81c784;background:rgba(129,199,132,.12);pointer-events:none;transition:left .1s,top .1s,width .1s,height .1s;display:none}#xwm .xwm-pv.bad{border-color:#e57373;background:rgba(229,115,115,.14)}' +
        /* zone 2 : réglages */
        '#xwm .xwm-sd{grid-area:sd;border-left:1px solid var(--border-color,#333);overflow:auto;padding:16px;display:flex;flex-direction:column;gap:14px;scrollbar-width:thin;background:rgba(255,255,255,.02)}' +
        '#xwm .xwm-sd h3{margin:0;font-size:15px;display:flex;align-items:center;gap:8px}#xwm .xwm-sd h5{margin:0 0 6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.6;font-weight:700}' +
        '#xwm .xwm-empty{opacity:.6;text-align:center;margin:auto 0;line-height:1.6}#xwm .xwm-empty i{font-size:30px;font-style:normal;display:block;margin-bottom:6px}' +
        '#xwm .xwm-seg{display:flex;flex-wrap:wrap;gap:4px}#xwm .xwm-seg button{min-width:34px;height:30px;padding:0 9px;border-radius:8px;border:1px solid var(--border-color,#4a4a50);background:transparent;transition:background .15s,border-color .15s}' +
        '#xwm .xwm-seg button.on{background:rgba(240,179,120,.18);border-color:#f0b378;color:#f6c79a}#xwm .xwm-seg button:disabled{opacity:.3;cursor:not-allowed}' +
        '#xwm .xwm-col{width:26px;height:26px;border-radius:50%;border:2px solid transparent;padding:0;min-width:0!important}#xwm .xwm-col.on{border-color:#fff!important}' +
        '#xwm .xwm-pvw{border-radius:12px;overflow:hidden;max-height:170px;position:relative;pointer-events:none}#xwm .xwm-pvw>.xd-c{margin:0!important;transform-origin:top left}' +
        '#xwm .xwm-row{display:flex;align-items:center;justify-content:space-between;gap:10px}' +
        '#xwm .xwm-sw{position:relative;width:38px;height:22px;border-radius:999px;background:#555;border:0;transition:background .15s}#xwm .xwm-sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .18s cubic-bezier(.2,.7,.2,1)}#xwm .xwm-sw.on{background:#c79a63}#xwm .xwm-sw.on::after{transform:translateX(16px)}' +
        '#xwm [hidden]{display:none!important}' +
        /* widget « Outils récents » : logo lisible, nom qui tient dans sa case */'#xd-dash .xd-tools{grid-template-columns:repeat(auto-fill,minmax(88px,1fr))!important;gap:8px!important}' +
        '#xd-dash .xd-tools a{min-width:0;padding:10px 6px 8px!important;gap:6px!important;transition:border-color .15s,transform .15s,background .15s}#xd-dash .xd-tools a:hover{transform:translateY(-1px);background:rgba(255,255,255,.04)}' +
        '#xd-dash .xd-tools a .xd-ic{display:flex;align-items:center;justify-content:center;width:100%;height:30px;font-size:22px!important}#xd-dash .xd-tools a .xd-ic img{max-width:100%;max-height:30px;object-fit:contain;filter:drop-shadow(0 0 6px rgba(240,179,120,.25))}' +
        '#xd-dash .xd-tools a>span:not(.xd-ic){display:block;max-width:100%;font-size:11px!important;font-weight:700;letter-spacing:.03em;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '#xwm-pm{position:fixed;z-index:5;width:300px;padding:8px;border-radius:12px;background:var(--bg-menu,#232327);border:1px solid var(--border-color,#4a4a50);box-shadow:0 18px 40px rgba(0,0,0,.45);animation:xwmB .16s cubic-bezier(.2,.7,.2,1)}#xwm-pm h5{margin:4px 8px 6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.6}#xwm-pm hr{border:0;border-top:1px solid var(--border-color,#333);margin:6px 4px}' +
        '#xwm-pm button{all:unset;box-sizing:border-box;display:flex;gap:10px;align-items:center;width:100%;padding:8px;border-radius:9px;cursor:pointer}#xwm-pm button:hover,#xwm-pm button:focus-visible{background:rgba(240,179,120,.12)}#xwm-pm .i{font-size:20px;width:28px;text-align:center}#xwm-pm b{display:block;font-size:13px}#xwm-pm small{display:block;font-size:11.5px;opacity:.6;line-height:1.3}' +
        '#xwm .xwm-tg{display:inline-flex;align-items:center;gap:6px;margin-left:6px}#xwm .xwm-tg label{font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:.05em;font-weight:700}#xwm .xwm-tg select{height:30px;border-radius:8px;border:1px solid var(--border-color,#555);background:var(--bg-panel,#26262b);color:inherit;font:inherit;padding:0 8px}' +
        '#xwm .xwm-hint{opacity:.6;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#xwm .xwm-w.lk{cursor:not-allowed;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 8px,transparent 8px 16px)}#xwm .xwm-w.lk .xwm-h{display:none}' +
        '#xwm .xwm-lkm{padding:12px;border-radius:10px;background:rgba(240,179,120,.08);border:1px solid rgba(240,179,120,.35);line-height:1.5}' +
        '#xwm .xwm-del{margin-top:auto;height:32px;border-radius:8px;border:1px solid rgba(229,115,115,.5);background:transparent;color:#ef9a9a}#xwm .xwm-del:hover{background:rgba(229,115,115,.12)}' +
        /* zone 3 : liste */
        '#xwm .xwm-ls{grid-area:ls;border-top:1px solid var(--border-color,#333);padding:12px 16px;overflow:auto;scrollbar-width:thin}#xwm .xwm-ls h5{margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.6;font-weight:700}' +
        '#xwm .xwm-li{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}' +
        '#xwm .xwm-it{display:flex;align-items:center;gap:8px;height:42px;padding:0 8px 0 10px;border-radius:10px;border:1px solid var(--border-color,#444);background:var(--bg-panel,#26262b);cursor:grab;transition:border-color .15s,opacity .15s,transform .15s}' +
        '#xwm .xwm-it:hover{border-color:rgba(240,179,120,.6);transform:translateY(-1px)}#xwm .xwm-it .i{font-size:18px}#xwm .xwm-it .n{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '#xwm .xwm-it.on{opacity:.5;cursor:pointer}#xwm .xwm-it .a{width:26px;height:26px;border-radius:7px;border:1px solid var(--border-color,#555);background:transparent;flex:none}#xwm .xwm-it.on .a{border-color:transparent;color:#81c784}' +
        '@media (max-width:899px){#xwm .xwm-b{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr) auto 170px;grid-template-areas:"hd" "gr" "sd" "ls"}#xwm .xwm-sd{border-left:0;border-top:1px solid var(--border-color,#333);max-height:40vh}}' +
        '@media (prefers-reduced-motion:reduce){#xwm,#xwm *{animation:none!important;transition:none!important}}';
    (document.head || document.documentElement).appendChild(css);

    // ---------------- modèle ----------------
    const fits = (L, k, x, y, w, h) => { if (x < 0 || y < 0 || w < 1 || h < 1 || x + w > COLS || h > MAXH) return false;
        for (const o in L) { if (o === k) continue; const b = L[o]; if (x < b.x + b.w && b.x < x + w && y < b.y + b.h && b.y < y + h) return false; } return true; };
    const free = (L, w, h) => { for (let y = 0; y < 200; y++) for (let x = 0; x + w <= COLS; x++) if (fits(L, null, x, y, w, h)) return { x, y }; return { x: 0, y: 0 }; };
    // ---------------- dispositions toutes prêtes ----------------
    // [widget, x, y, largeur, hauteur, format]
    const PRESETS = [
        ['prod', '🎬', 'Production', 'Budget, coûts par poste, frise, échéances, dossier', [['proj', 0, 0, 1, 1], ['countdown', 1, 0, 1, 1], ['budget', 2, 0, 1, 1, 'ring'], ['postes', 3, 0, 1, 2, 'histo'], ['frise', 0, 1, 3, 1], ['dead', 0, 2, 1, 2, 'time'], ['check', 1, 2, 1, 1, 'ring'], ['dossier', 2, 2, 1, 1, 'gauge'], ['cal', 1, 3, 2, 2], ['effectif', 3, 2, 1, 2, 'histo'], ['msg', 3, 4, 1, 1]]],
        ['regie', '📋', 'Régie', 'Compte à rebours, feuille du jour, météo, charge, calendrier', [['countdown', 0, 0, 2, 1], ['day', 2, 0, 1, 1], ['dead', 3, 0, 1, 1, 'compact'], ['charge', 0, 1, 2, 1, 'histo'], ['wx5', 2, 1, 2, 2], ['cal', 0, 2, 2, 2], ['matos', 2, 3, 1, 1, 'ring'], ['team', 3, 3, 1, 1], ['online', 0, 4, 1, 1]]],
        ['tech', '🎥', 'Technique', 'Matériel, rushes, météo des lieux, charge, outils', [['matos', 0, 0, 1, 1, 'ring'], ['rush', 1, 0, 1, 1, 'ring'], ['day', 2, 0, 1, 1], ['countdown', 3, 0, 1, 1], ['wx5', 0, 1, 2, 2], ['charge', 2, 1, 2, 1, 'histo'], ['need', 2, 2, 2, 1, 'chips'], ['docs', 0, 3, 2, 1], ['fav', 2, 3, 2, 1]]],
        ['post', '🎞️', 'Post-production', 'Versions à valider, rushes, frise, retours, documents', [['post', 0, 0, 2, 2], ['rush', 2, 0, 1, 1, 'ring'], ['docs', 3, 0, 1, 2], ['dead', 2, 1, 1, 1, 'compact'], ['frise', 0, 2, 4, 1], ['fb', 0, 3, 2, 1], ['budget', 2, 3, 1, 1, 'bar'], ['dossier', 3, 3, 1, 1, 'ring']]]];
    const KB = 'xiii.dash.before';
    function preset(id) {
        const P = PRESETS.find(x => x[0] === id); if (!P) return; const C = D().cards(), N = {}, NS = {};
        try { localStorage.setItem(KB, JSON.stringify({ lay: L, sty: S, at: Date.now(), tgt })); } catch (e) { }
        P[4].forEach(([k, x, y, w, h, f]) => { if (!C[k] || !fits(N, k, x, y, w, h)) return; N[k] = { x, y, w, h }; NS[k] = Object.assign({}, S[k] || {}); if (f) NS[k].f = f; else delete NS[k].f; });
        Object.keys(LK).forEach(k => { if (locked(k) && L[k]) { N[k] = L[k]; NS[k] = S[k] || {}; } });
        L = N; S = NS; sel = null; dirty = true; drawAll(); hint(); try { if (window.XTOAST) XTOAST('✨ Disposition « ' + P[2] + ' » appliquée · Enregistrer pour la garder'); } catch (e) { }
    }
    function prevMenu(btn) {
        let m = $('#xwm-pm'); if (m) { m.remove(); return; } const b4 = JJ(KB), r = btn.getBoundingClientRect();
        m = document.createElement('div'); m.id = 'xwm-pm'; m.style.cssText = 'top:' + (r.bottom + 6) + 'px;left:' + Math.max(8, r.right - 300) + 'px';
        m.innerHTML = '<h5>Dispositions toutes prêtes</h5>' + PRESETS.map(x => '<button type="button" data-ps="' + x[0] + '"><span class="i">' + x[1] + '</span><span><b>' + esc(x[2]) + '</b><small>' + esc(x[3]) + '</small></span></button>').join('') +
            (b4 && b4.lay ? '<hr><button type="button" data-ps="back"><span class="i">↺</span><span><b>Disposition d’avant</b><small>Celle qui était là avant le dernier préréglage</small></span></button>' : '');
        ov.appendChild(m); m.onclick = e => { const t = e.target.closest('[data-ps]'); if (!t) return; m.remove(); if (t.dataset.ps === 'back') { const B = JJ(KB); if (B && B.lay) { L = B.lay; S = B.sty || {}; sel = null; dirty = true; drawAll(); } } else preset(t.dataset.ps); };
        setTimeout(() => ov && ov.addEventListener('pointerdown', function h(e) { if (!e.target.closest('#xwm-pm,[data-pre]')) { const x = $('#xwm-pm'); if (x) x.remove(); } ov && ov.removeEventListener('pointerdown', h); }), 0);
    }
    // ---------------- dispositions imposées par le Master ----------------
    // conf().imp = { '*': {lay, sty, lock:[…], at}, '<secteur>': {…} } — enregistré avec les réglages du projet (partagés par le Drive).
    // Un membre sans disposition personnelle reçoit celle de son secteur (sinon celle de toute l'équipe) ; les widgets verrouillés
    // restent à leur place imposée, même s'il a sa propre disposition.
    const SECT = [['*', 'Toute l’équipe'], ['production', 'Production'], ['realisation', 'Réalisation'], ['image', 'Image'], ['son', 'Son'], ['lumiere', 'Lumière'], ['regie', 'Régie'], ['technique', 'Technique'], ['decor', 'Décor'], ['hmc', 'HMC'], ['post', 'Post-production'], ['artistes', 'Artistes'], ['client', 'Client']];
    const fold = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const JJ = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const mySecs = () => { const d = JJ('xiii.drive'); return d && d.tok && !d.code ? String(d.secteur || '').split(',').map(fold).filter(Boolean) : []; };
    const isM = () => { try { return D().master(); } catch (e) { return true; } };
    function imposed() { const I = (D().conf().imp) || {}; for (const s of mySecs()) { const k = Object.keys(I).find(x => fold(x) === s); if (k && I[k] && I[k].lay) return Object.assign({ who: k }, I[k]); } return I['*'] && I['*'].lay ? Object.assign({ who: '*' }, I['*']) : null; }
    function eff() {
        const U = D().me(), mine = { lay: U.lay, sty: U.sty || {}, lock: {}, src: 'me' }; if (isM()) return mine; const I = imposed(); if (!I) return mine;
        const lock = {}; (I.lock || []).forEach(k => { if (I.lay[k]) lock[k] = 1; });
        if (!U.lay || !Object.keys(U.lay).length) return { lay: I.lay, sty: Object.assign({}, I.sty || {}, U.sty || {}), lock, src: I.who };
        const L = JSON.parse(JSON.stringify(U.lay)); Object.keys(lock).forEach(k => { delete L[k]; });
        const N = {}; Object.keys(lock).forEach(k => { N[k] = Object.assign({}, I.lay[k]); });
        Object.keys(L).forEach(k => { const b = L[k]; const p = fits(N, k, b.x, b.y, b.w, b.h) ? b : Object.assign({ w: b.w, h: b.h }, free(N, b.w, b.h)); N[k] = { x: p.x, y: p.y, w: b.w, h: b.h }; });
        const S = Object.assign({}, U.sty || {}); Object.keys(lock).forEach(k => { if (I.sty && I.sty[k]) S[k] = I.sty[k]; else delete S[k]; });
        return { lay: N, sty: S, lock, src: 'me+' + I.who };
    }
    // les widgets d'une disposition imposée doivent être affichés (pas masqués par d'anciens choix)
    let syncing = false;
    function sync() { if (syncing || isM()) return; const E = eff(); if (!E.lay) return; const X = D(), U = X.me(), C = X.conf(), off = new Set(U.off || C.off || []), need = Object.keys(E.lay).filter(k => off.has(k)); if (!need.length) return;
        syncing = true; need.forEach(k => off.delete(k)); U.off = [...off]; U.order = (U.order || C.order || []).filter(k => !need.includes(k)).concat(need); X.setMe(U); setTimeout(() => { X.render(); syncing = false; }, 0); }
    function initial() {
        const X = D(), U = X.me(), C = X.conf(), CARDS = X.cards();
        if (tgt !== 'me') { const I = (C.imp || {})[tgt]; if (I && I.lay) return JSON.parse(JSON.stringify(I.lay)); }
        else { const E = eff(); if (E.lay && Object.keys(E.lay).length) return JSON.parse(JSON.stringify(E.lay)); }
        const ord = (U.order || C.order).filter(k => CARDS[k]), off = new Set(U.off || C.off), L = {};
        ord.filter(k => !off.has(k)).forEach(k => { const el = $('#xd-dash .xd-c[data-card="' + k + '"]'); const w = Math.min(COLS, (U.size || {})[k] || 1);
            const h = el ? Math.max(1, Math.min(MAXH, Math.ceil((el.offsetHeight + GAP) / (ROWH + GAP)))) : 1; const p = free(L, w, h); L[k] = { x: p.x, y: p.y, w, h }; });
        return L;
    }

    // ---------------- formats d'un widget ----------------
    // Chaque widget est lu tel qu'il est dessiné, puis présenté autrement ; le contenu d'origine reste dans la page (masqué).
    //  · rapport (« 36 % », « 12/40 ») : Texte, Chiffre clé, Anneau, Jauge, Barre
    //  · liste de lignes (échéances, retours, outils à remplir…) : Liste, Compact, Pastilles, Frise, Histogramme (si chaque ligne porte un nombre)
    //  · chiffre seul (convocation 07:30, J-12…) : Texte, Chiffre clé
    const FN = { text: 'Texte', kpi: 'Chiffre clé', ring: 'Anneau', gauge: 'Jauge', bar: 'Barre', list: 'Liste', compact: 'Compact', chips: 'Pastilles', time: 'Frise', histo: 'Histogramme', curve: 'Courbe' };
    const PCT = /^\s*(\d+(?:[.,]\d+)?)\s*%\s*$/, FRAC = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
    const leafs = c => [...c.querySelectorAll('*')].filter(e => !e.children.length && !e.closest('.xwm-fmt'));
    function shape(c) {
        if (!c) return null; const L = leafs(c), pe = L.find(e => PCT.test(e.textContent)) || L.find(e => FRAC.test(e.textContent) && e.closest('.xd-cd'));
        const rows = [...c.querySelectorAll(':scope > .xd-r, :scope > div > .xd-r')].filter(r => !r.closest('.xwm-fmt'));
        const big = c.querySelector(':scope > .xd-cd > b, :scope .xd-cd > b');
        if (pe) { const t = pe.textContent, m = FRAC.exec(t), v = m ? (+m[2] ? +m[1] / +m[2] * 100 : 0) : parseFloat(t.replace(',', '.')); return { type: 'ratio', el: pe, v: Math.max(0, Math.min(100, v)), lbl: m ? m[1] + '/' + m[2] : Math.round(v) + ' %', rows, f: ['text', 'kpi', 'ring', 'gauge', 'bar', 'curve'].concat(rows.length ? ['compact'] : []) }; }
        if (rows.length) { const DATE = /(janv|févr|fév|mars|avr|mai|juin|juil|août|sept|oct|nov|déc|lun\.|mar\.|mer\.|jeu\.|ven\.|sam\.|dim\.|aujourd|demain|hier|J-\d|\d\/\d|\d:\d|\d h)/i, num = rows.every(r => { const t = (r.querySelector('small') || r).textContent; return (/\d/.test(t) && !DATE.test(t)) || /à remplir|aucun/i.test(t); }); return { type: 'list', rows, f: ['list', 'compact', 'chips', 'time'].concat(num && rows.length > 1 ? ['histo'] : [], ['curve']) }; }
        if (big && big.textContent.trim()) return { type: 'kpi', el: big, f: ['text', 'kpi'] };
        return null;
    }
    const SHOWN = new Map();
    // historique : une valeur par widget et par jour (le % pour un rapport, le nombre de lignes pour une liste), 120 jours au plus
    const KH = 'xiii.dash.hist', today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const hist = () => { try { return JSON.parse(localStorage.getItem(KH)) || {}; } catch (e) { return {}; } };
    const valOf = S => S.type === 'ratio' ? Math.round(S.v * 10) / 10 : S.type === 'list' ? S.rows.length : null;
    function record(k, S) { const v = valOf(S); if (v == null || !isFinite(v)) return; const H = hist(), L = H[k] = H[k] || [], d = today(), last = L[L.length - 1];
        if (last && last[0] === d) { if (last[1] === v) return; last[1] = v; } else L.push([d, v]); if (L.length > 120) L.splice(0, L.length - 120);
        try { localStorage.setItem(KH, JSON.stringify(H)); } catch (e) { } }
    const frd = d => { const x = new Date(d + 'T12:00'); return x.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
    function curveSvg(k, S) {
        const L = (hist()[k] || []).slice(-60), unit = S.type === 'ratio' ? ' %' : '', W = 260, H = 70, P = 4;
        if (L.length < 2) return '<div class="cv0"><b>' + esc(S.type === 'ratio' ? S.lbl : String(S.rows.length)) + '</b><span>La courbe se construit jour après jour : revenez demain pour voir l\'évolution.</span></div>';
        const V = L.map(x => x[1]), lo = S.type === 'ratio' ? 0 : Math.min(...V), hi = S.type === 'ratio' ? 100 : Math.max(...V, lo + 1);
        const X = i => P + i * (W - 2 * P) / (L.length - 1), Y = v => H - P - (v - lo) / (hi - lo || 1) * (H - 2 * P);
        let d = 'M' + X(0) + ' ' + Y(V[0]); for (let i = 1; i < L.length; i++) { const x0 = X(i - 1), x1 = X(i), m = (x0 + x1) / 2; d += ' C' + m + ' ' + Y(V[i - 1]) + ' ' + m + ' ' + Y(V[i]) + ' ' + x1 + ' ' + Y(V[i]); }
        const gid = 'xwg' + k, last = V[V.length - 1], dv = last - V[0];
        return '<div class="cvh"><b>' + esc(String(Math.round(last * 10) / 10).replace('.', ',') + unit) + '</b><span class="' + (dv > 0 ? 'up' : dv < 0 ? 'dn' : '') + '">' + (dv > 0 ? '▲ +' : dv < 0 ? '▼ ' : '= ') + esc(String(Math.round(dv * 10) / 10).replace('.', ',') + unit) + ' depuis le ' + esc(frd(L[0][0])) + '</span></div>' +
            '<svg class="cvs" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Évolution de ' + esc(frd(L[0][0])) + ' à aujourd\'hui"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--xwmc,var(--xc-1,#f0b378))" stop-opacity=".35"/><stop offset="1" stop-color="var(--xwmc,var(--xc-1,#f0b378))" stop-opacity="0"/></linearGradient></defs>' +
            '<path class="ca" d="' + d + ' L' + X(L.length - 1) + ' ' + H + ' L' + X(0) + ' ' + H + ' Z" fill="url(#' + gid + ')"/><path class="cl" d="' + d + '" pathLength="1"/><circle class="cd" cx="' + X(L.length - 1) + '" cy="' + Y(last) + '" r="3.5"/></svg>' +
            '<div class="cvx"><span>' + esc(frd(L[0][0])) + '</span><span>aujourd\'hui</span></div>';
    }
    const anim = (box, sel, fn) => requestAnimationFrame(() => requestAnimationFrame(() => box.querySelectorAll(sel).forEach(fn)));
    const ringSvg = (v, from, lbl) => { const r = 30, C = 2 * Math.PI * r; return '<svg width="78" height="78" viewBox="0 0 78 78" role="img" aria-label="' + esc(lbl) + '"><circle class="tr" cx="39" cy="39" r="' + r + '" stroke-width="8"/><circle class="vl" data-to="' + C * (1 - v / 100) + '" cx="39" cy="39" r="' + r + '" stroke-width="8" stroke-dasharray="' + C + '" stroke-dashoffset="' + C * (1 - from / 100) + '" transform="rotate(-90 39 39)"/><text x="39" y="40"' + (lbl.length > 5 ? ' style="font-size:15px"' : '') + '>' + esc(lbl) + '</text></svg>'; };
    const gaugeSvg = (v, from, lbl) => { const L = Math.PI * 40; return '<svg width="100" height="60" viewBox="0 0 100 60" role="img" aria-label="' + esc(lbl) + '"><path class="tr" d="M10 52 A40 40 0 0 1 90 52" stroke-width="9"/><path class="vl" data-to="' + L * (1 - v / 100) + '" d="M10 52 A40 40 0 0 1 90 52" stroke-width="9" stroke-dasharray="' + L + '" stroke-dashoffset="' + L * (1 - from / 100) + '"/><text x="50" y="44"' + (lbl.length > 5 ? ' style="font-size:15px"' : '') + '>' + esc(lbl) + '</text></svg>'; };
    const rowTxt = r => [(r.querySelector('span') || r).textContent.trim(), ((r.querySelector('small') || {}).textContent || '').trim()];
    function fmt(c, f) {
        c.querySelectorAll('.xwm-fmt').forEach(x => x.remove()); c.querySelectorAll('.xwm-hid').forEach(x => x.classList.remove('xwm-hid')); delete c.dataset.xwmf;
        const S = shape(c); if (S) record(c.dataset.card, S); if (!S || !f || f === 'text' || f === 'list' || S.f.indexOf(f) < 0) return;
        const k = c.dataset.card, box = document.createElement('div'); box.className = 'xwm-fmt ' + f; const hide = e => e && e.classList.add('xwm-hid');
        if (S.type === 'ratio' || (S.type === 'kpi' && f === 'kpi')) {
            const blk = S.el.parentElement && S.el.parentElement !== c ? S.el.parentElement : S.el;
            const sub = blk === S.el ? '' : [...blk.children].filter(e => e !== S.el && !e.contains(S.el) && e.textContent.trim()).map(e => e.innerHTML.trim()).join('<br>');
            if (f === 'curve') { box.innerHTML = curveSvg(k, S) + (sub ? '<div class="sb">' + sub + '</div>' : ''); }
            else if (f === 'kpi') { box.innerHTML = '<span class="kv">' + esc(S.lbl || S.el.textContent.trim()) + '</span>' + (sub ? '<div class="sb">' + sub + '</div>' : ''); }
            else if (f === 'compact') { box.innerHTML = '<span class="bn">' + esc(S.lbl) + '</span>' + (sub ? '<div class="sb">' + sub + '</div>' : ''); }
            else { const v = S.v, from = SHOWN.has(k) ? SHOWN.get(k) : 0; SHOWN.set(k, v);
                if (f === 'ring') box.innerHTML = ringSvg(v, from, S.lbl) + (sub ? '<div class="sb">' + sub + '</div>' : '');
                else if (f === 'gauge') box.innerHTML = gaugeSvg(v, from, S.lbl) + (sub ? '<div class="sb">' + sub + '</div>' : '');
                else box.innerHTML = '<span class="bn">' + esc(S.lbl) + '</span><div class="bt"><div class="bv" data-to="' + v + '" style="width:' + from + '%"></div></div>' + (sub ? '<div class="sb">' + sub + '</div>' : '');
                anim(box, '.vl', e => e.setAttribute('stroke-dashoffset', e.dataset.to)); anim(box, '.bv', e => { e.style.width = e.dataset.to + '%'; }); }
            blk.before(box); hide(blk);
            [...c.querySelectorAll('[style*="width"]')].filter(e => /%/.test(e.style.width) && !e.closest('.xwm-fmt')).forEach(b => hide(b.parentElement && b.parentElement.children.length === 1 ? b.parentElement : b));
            if (f === 'compact') S.rows.forEach(hide);
        } else if (S.type === 'list') {
            const R = S.rows, T = R.map(rowTxt), href = r => r.getAttribute('href') || '#';
            if (f === 'curve') box.innerHTML = curveSvg(k, S);
            else if (f === 'compact') box.innerHTML = '<span class="bn">' + R.length + '</span><div class="sb">' + R.slice(0, 3).map((r, i) => esc(T[i][0])).join(' · ') + (R.length > 3 ? ' · +' + (R.length - 3) : '') + '</div>';
            else if (f === 'chips') box.innerHTML = '<div class="ch">' + R.map((r, i) => '<a href="' + esc(href(r)) + '" class="' + esc(((r.querySelector('small') || {}).className || '') + (r.classList.contains('late') ? ' ko' : '')) + '" title="' + esc(T[i][1]) + '">' + esc(T[i][0]) + '</a>').join('') + '</div>';
            else if (f === 'time') box.innerHTML = '<ol class="tl">' + R.map((r, i) => '<li class="' + (r.classList.contains('late') ? 'ko' : '') + '"><a href="' + esc(href(r)) + '"><b>' + esc(T[i][0]) + '</b>' + (T[i][1] ? '<small>' + esc(T[i][1]) + '</small>' : '') + '</a></li>').join('') + '</ol>';
            else if (f === 'histo') { const V = T.map(t => { const m = /(\d+(?:[.,]\d+)?)/.exec(t[1].replace(/(\d)[\s\u00a0\u202f](?=\d{3}\b)/g, '$1')); return m ? parseFloat(m[1].replace(',', '.')) : 0; }), M = Math.max(1, ...V), NL = T.map(t => (t[1].split('·')[0] || '').replace(/personnes?|convoqués?|éléments?/g, '').trim() || '0');
                box.innerHTML = '<div class="hg">' + R.map((r, i) => '<a href="' + esc(href(r)) + '" title="' + esc(T[i][0] + ' : ' + T[i][1]) + '"><span class="hl">' + esc(T[i][0]) + '</span><span class="ht"><span class="hv" data-to="' + (V[i] / M * 100) + '" style="width:0"></span></span><span class="hn">' + esc(/à remplir/i.test(T[i][1]) ? '0' : NL[i]) + '</span></a>').join('') + '</div>';
                anim(box, '.hv', e => { e.style.width = e.dataset.to + '%'; }); }
            R[0].before(box); R.forEach(hide);
        } else return;
        c.dataset.xwmf = f;
    }


    // ---------------- application au Dashboard ----------------
    let applying = false;
    function apply(flip) {
        const X = D(), g = $('#xd-dash .xd-g'); if (!X || !g || applying) return; applying = true;
        try {
            sync(); const E = eff(), L = E.lay, S = E.sty || {}, on = !!(L && Object.keys(L).length) && wide();
            const before = flip ? new Map([...g.children].map(c => [c.dataset.card, c.getBoundingClientRect()])) : null;
            g.classList.toggle('xwm-on', on);
            [...g.querySelectorAll(':scope>.xd-c[data-card]')].forEach(c => {
                const k = c.dataset.card, b = L && L[k], s = S[k] || {};
                if (on && b) { c.style.setProperty('grid-column', (b.x + 1) + ' / span ' + b.w, 'important'); c.style.setProperty('grid-row', (b.y + 1) + ' / span ' + b.h, 'important'); }
                else { c.style.removeProperty('grid-column'); c.style.removeProperty('grid-row'); }
                if (s.s && s.s !== 'std') c.dataset.xwms = s.s; else delete c.dataset.xwms;
                if (s.c) { c.style.setProperty('--xwmc', s.c); c.dataset.xwmc = 1; } else { c.style.removeProperty('--xwmc'); delete c.dataset.xwmc; }
                if (s.t === false) c.dataset.xwmt = '0'; else delete c.dataset.xwmt;
                fmt(c, s.f || (c.classList.contains('xd-defhisto') ? 'histo' : ''));
            });
            // FLIP : chaque widget glisse doucement de son ancienne place à la nouvelle
            if (before) [...g.children].forEach(c => { const a = before.get(c.dataset.card); if (!a) { try { c.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' }); } catch (e) { } return; }
                const r = c.getBoundingClientRect(), dx = a.left - r.left, dy = a.top - r.top, sx = a.width / (r.width || 1), sy = a.height / (r.height || 1);
                if (Math.abs(dx) + Math.abs(dy) > 1 || Math.abs(sx - 1) + Math.abs(sy - 1) > .01) try { c.animate([{ transformOrigin: 'top left', transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')' }, { transformOrigin: 'top left', transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' }); } catch (e) { } });
        } finally { applying = false; }
    }
    let flipNext = false;
    new MutationObserver(ms => { if (applying) return; if (ms.some(m => m.target.id === 'xd-dash' || (m.target.classList && m.target.classList.contains('xd-g') && [...m.addedNodes].some(n => n.nodeType === 1)))) { const f = flipNext; flipNext = false; apply(f); } })
        .observe(document.documentElement, { childList: true, subtree: true });
    addEventListener('resize', () => apply(false));

    // ---------------- la fenêtre ----------------
    let L = {}, S = {}, LK = {}, tgt = 'me', sel = null, ov = null, dirty = false;
    function open() {
        const X = D(); if (!X) return; close(true);
        load(tgt); dirty = false;
        ov = document.createElement('div'); ov.id = 'xwm'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Gestionnaire de widgets');
        const M = isM(), E0 = eff();
        ov.innerHTML = '<div class="xwm-b"><div class="xwm-hd"><b>🧩 Widgets de l’accueil</b>' + (M ? '<span class="xwm-tg"><label>Disposition</label><select data-tgt aria-label="Disposition à modifier"><option value="me">👤 La mienne</option>' + SECT.map(x => '<option value="' + x[0] + '">' + (x[0] === '*' ? '👥 ' : '🏷️ ') + esc(x[1]) + (((X.conf().imp || {})[x[0]] || {}).lay ? ' ●' : '') + '</option>').join('') + '</select></span>' : '') + '<small class="xwm-hint"></small>' +
            (!M && E0.src !== 'me' ? '' : '') + '<button class="xwm-btn" data-reset title="" hidden></button>' +
            '<button class="xwm-btn" data-pre title="Dispositions toutes prêtes : Production, Régie, Technique, Post-production">✨ Préréglages</button><button class="xwm-btn" data-auto title="Ranger automatiquement les widgets placés, sans trou">↺ Ranger</button><button class="xwm-btn" data-cancel>Annuler</button><button class="xwm-btn pri" data-ok>✓ Enregistrer</button></div>' +
            '<div class="xwm-gr"><div class="xwm-bd"></div></div><div class="xwm-sd"></div><div class="xwm-ls"><h5>Tous les widgets — glissez-les sur la grille</h5><div class="xwm-li"></div></div></div>';
        document.body.appendChild(ov);
        ov.addEventListener('pointerdown', e => { if (e.target === ov) close(); });
        $('[data-cancel]', ov).onclick = () => close();
        $('[data-ok]', ov).onclick = saveAll;
        const tg = $('[data-tgt]', ov); if (tg) { tg.value = tgt; tg.onchange = () => { if (dirty && !confirm('Changer de disposition sans enregistrer ?')) { tg.value = tgt; return; } tgt = tg.value; load(tgt); dirty = false; drawAll(); hint(); }; }
        $('[data-reset]', ov).onclick = () => { const X2 = D(); if (tgt !== 'me') { if (!confirm('Supprimer la disposition imposée « ' + SECT.find(x => x[0] === tgt)[1] + ' » ?')) return; X2.save(C => { const I = Object.assign({}, C.imp || {}); delete I[tgt]; C.imp = I; }); dirty = false; close(true); flipNext = true; return; }
            if (!confirm('Revenir à la disposition du Master ? Votre disposition personnelle sera effacée.')) return; const U = X2.me(); delete U.lay; delete U.sty; X2.setMe(U); dirty = false; close(true); flipNext = true; X2.render(); setTimeout(() => apply(true), 30); };
        hint(); $('[data-pre]', ov).onclick = e => prevMenu(e.currentTarget);
        $('[data-auto]', ov).onclick = () => { const ks = Object.keys(L).sort((a, b) => L[a].y - L[b].y || L[a].x - L[b].x), N = {}; ks.forEach(k => { const p = free(N, L[k].w, L[k].h); N[k] = { x: p.x, y: p.y, w: L[k].w, h: L[k].h }; }); L = N; dirty = true; drawBoard(); };
        addEventListener('keydown', key, true); addEventListener('resize', drawBoard);
        try { new ResizeObserver(drawBoard).observe($('.xwm-gr', ov)); } catch (e) { }
        drawAll();
    }
    function load(t) { const X = D(), C = X.conf(); tgt = t;
        if (t === 'me') { const E = eff(); L = initial(); S = JSON.parse(JSON.stringify(E.sty || {})); LK = Object.assign({}, E.lock); }
        else { const I = (C.imp || {})[t] || {}; L = I.lay ? JSON.parse(JSON.stringify(I.lay)) : (() => { const t0 = tgt; tgt = 'me'; const x = initial(); tgt = t0; return x; })(); S = JSON.parse(JSON.stringify(I.sty || {})); LK = {}; (I.lock || []).forEach(k => { LK[k] = 1; }); }
        sel = Object.keys(L).find(k => !(tgt === 'me' && LK[k])) || Object.keys(L)[0] || null; }
    const locked = k => tgt === 'me' && !!LK[k];
    function hint() { if (!ov) return; const h = $('.xwm-hint', ov), r = $('[data-reset]', ov), E = eff(), X = D(), U = X.me();
        if (tgt !== 'me') { h.textContent = 'Disposition imposée à « ' + SECT.find(x => x[0] === tgt)[1] + ' » · 🔒 = le membre ne peut ni la déplacer ni la retirer'; r.hidden = !((X.conf().imp || {})[tgt] || {}).lay; r.textContent = '🗑 Supprimer'; r.title = 'Supprimer cette disposition imposée'; }
        else if (!isM() && E.src !== 'me') { h.textContent = E.src.indexOf('me+') === 0 ? 'Votre disposition · les widgets 🔒 sont imposés par le Master' : 'Disposition du Master (' + (SECT.find(x => x[0] === E.src) || [, E.src])[1] + ') · modifiez-la pour en faire la vôtre'; r.hidden = !(U.lay && Object.keys(U.lay).length); r.textContent = '↺ Disposition du Master'; r.title = 'Revenir à la disposition imposée par le Master'; }
        else { h.textContent = 'Glissez les blocs · poignée en bas à droite pour la taille · cliquez un bloc pour le régler'; r.hidden = true; } }
    function close(silent) {
        if (!ov) return; if (!silent && dirty && !confirm('Fermer sans enregistrer la nouvelle disposition ?')) return;
        removeEventListener('keydown', key, true); removeEventListener('resize', drawBoard);
        const o = ov; ov = null; if (silent) { o.remove(); return; }
        try { o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-in' }).onfinish = () => o.remove(); } catch (e) { o.remove(); }
    }
    function saveAll() {
        const X = D(), CARDS = X.cards(), U = X.me(), ks = Object.keys(L).sort((a, b) => L[a].y - L[b].y || L[a].x - L[b].x);
        if (tgt !== 'me') { const T = tgt, lay = L, sty = S, lock = Object.keys(LK).filter(k => L[k]); X.save(C => { const I = Object.assign({}, C.imp || {}); I[T] = { lay, sty, lock, at: Date.now() }; C.imp = I; if (T === '*') { C.order = ks.concat(Object.keys(CARDS).filter(k => !lay[k])); C.off = Object.keys(CARDS).filter(k => !lay[k]); } });
            dirty = false; close(true); try { if (window.XTOAST) XTOAST('✓ Disposition imposée enregistrée'); } catch (e) { } return; }
        U.lay = L; U.sty = S; U.order = ks.concat(Object.keys(CARDS).filter(k => !L[k])); U.off = Object.keys(CARDS).filter(k => !L[k]);
        U.size = Object.assign({}, U.size || {}); ks.forEach(k => { U.size[k] = Math.min(3, L[k].w); });
        X.setMe(U); dirty = false; close(true); flipNext = true; X.render(); setTimeout(() => apply(true), 30);
    }
    const geo = () => { const gr = $('.xwm-gr', ov), W = Math.max(320, gr.clientWidth - 32), cw = (W - GAP * (COLS - 1)) / COLS, ch = Math.min(96, Math.max(70, cw * 0.42)); return { W, cw, ch }; };
    const box = (G, b) => ({ left: b.x * (G.cw + GAP), top: b.y * (G.ch + GAP), width: b.w * G.cw + (b.w - 1) * GAP, height: b.h * G.ch + (b.h - 1) * GAP });
    const setBox = (el, r) => { el.style.left = r.left + 'px'; el.style.top = r.top + 'px'; el.style.width = r.width + 'px'; el.style.height = r.height + 'px'; };
    function rows() { let m = 0; for (const k in L) m = Math.max(m, L[k].y + L[k].h); return Math.max(4, m + 2); }
    function drawAll() { drawBoard(); drawSide(); drawList(); }
    function drawBoard() {
        if (!ov) return; const bd = $('.xwm-bd', ov), G = geo(), R = rows(), CARDS = D().cards();
        bd.style.height = (R * (G.ch + GAP) - GAP) + 'px';
        // cases
        let cells = bd.querySelector('.xwm-cells'); if (!cells) { cells = document.createElement('div'); cells.className = 'xwm-cells'; bd.appendChild(cells); }
        if (cells.childElementCount !== R * COLS) { cells.innerHTML = ''; for (let y = 0; y < R; y++) for (let x = 0; x < COLS; x++) { const c = document.createElement('div'); c.className = 'xwm-cell'; c.dataset.x = x; c.dataset.y = y; cells.appendChild(c); } }
        cells.querySelectorAll('.xwm-cell').forEach(c => setBox(c, box(G, { x: +c.dataset.x, y: +c.dataset.y, w: 1, h: 1 })));
        let pv = bd.querySelector('.xwm-pv'); if (!pv) { pv = document.createElement('div'); pv.className = 'xwm-pv'; bd.appendChild(pv); }
        // blocs : créés une fois, puis seulement repositionnés (transition fluide)
        bd.querySelectorAll('.xwm-w').forEach(w => { if (!L[w.dataset.k]) { try { w.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 150 }).onfinish = () => w.remove(); } catch (e) { w.remove(); } w.dataset.gone = 1; } });
        Object.keys(L).forEach(k => {
            let w = bd.querySelector('.xwm-w[data-k="' + k + '"]:not([data-gone])'), born = false;
            if (!w) { born = true; w = document.createElement('div'); w.className = 'xwm-w'; w.dataset.k = k; w.tabIndex = 0;
                w.innerHTML = '<span class="i">' + esc(ico(CARDS[k])) + '</span><span class="n">' + esc(lab(CARDS[k])) + '</span><span class="z"></span><i class="xwm-h" title="Glisser pour redimensionner"></i>';
                w.addEventListener('pointerdown', down); bd.appendChild(w); }
            const b = L[k], s = S[k] || {}; w.querySelector('.z').textContent = (LK[k] ? '🔒 ' : '') + b.w + ' × ' + b.h; w.classList.toggle('sel', k === sel); w.classList.toggle('lk', locked(k));
            w.dataset.s = s.s || 'std'; if (s.c) w.style.setProperty('--c', s.c); else w.style.removeProperty('--c');
            if (!w.classList.contains('drag')) setBox(w, box(G, b));
            if (born) try { w.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)' }); } catch (e) { }
        });
    }
    // déplacer / redimensionner un bloc
    function down(e) {
        if (e.button !== 0) return; if (locked(e.currentTarget.dataset.k)) { select(e.currentTarget.dataset.k); return; } const w = e.currentTarget, k = w.dataset.k, rs = !!e.target.closest('.xwm-h'), bd = $('.xwm-bd', ov), pv = $('.xwm-pv', ov), G = geo();
        e.preventDefault(); w.setPointerCapture(e.pointerId); const b0 = Object.assign({}, L[k]), r0 = box(G, b0), x0 = e.clientX, y0 = e.clientY; let moved = false, tgt = b0;
        const mv = ev => { const dx = ev.clientX - x0, dy = ev.clientY - y0; if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
            if (!moved) { moved = true; w.classList.add('drag'); pv.style.display = 'block'; }
            if (rs) { const W = Math.max(G.cw * .6, r0.width + dx), H = Math.max(G.ch * .6, r0.height + dy); w.style.width = W + 'px'; w.style.height = H + 'px';
                tgt = { x: b0.x, y: b0.y, w: Math.max(1, Math.min(COLS - b0.x, Math.round((W + GAP) / (G.cw + GAP)))), h: Math.max(1, Math.min(MAXH, Math.round((H + GAP) / (G.ch + GAP)))) }; }
            else { const X = r0.left + dx, Y = r0.top + dy; w.style.left = X + 'px'; w.style.top = Y + 'px';
                tgt = { x: Math.round(X / (G.cw + GAP)), y: Math.round(Y / (G.ch + GAP)), w: b0.w, h: b0.h }; }
            const ok = fits(L, k, tgt.x, tgt.y, tgt.w, tgt.h); pv.classList.toggle('bad', !ok); setBox(pv, box(G, { x: Math.max(0, Math.min(COLS - tgt.w, tgt.x)), y: Math.max(0, tgt.y), w: tgt.w, h: tgt.h }));
            if (tgt.y + tgt.h + 1 > rows()) bd.style.height = ((tgt.y + tgt.h + 2) * (G.ch + GAP) - GAP) + 'px'; };
        const up = () => { w.removeEventListener('pointermove', mv); w.removeEventListener('pointerup', up); w.removeEventListener('pointercancel', up); pv.style.display = 'none'; pv.classList.remove('bad');
            if (moved) { w.classList.remove('drag'); if (fits(L, k, tgt.x, tgt.y, tgt.w, tgt.h)) { L[k] = tgt; dirty = true; } }
            select(k); };
        w.addEventListener('pointermove', mv); w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up);
    }
    function select(k) { sel = k; drawBoard(); drawSide(); drawList(); const w = ov && $('.xwm-w[data-k="' + k + '"]', ov); if (w) try { w.focus({ preventScroll: true }); } catch (e) { } }
    function set(k, nb) { if (locked(k) || !fits(L, k, nb.x, nb.y, nb.w, nb.h)) { const w = $('.xwm-w[data-k="' + k + '"]', ov); if (w) try { w.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 180 }); } catch (e) { } return false; } L[k] = nb; dirty = true; drawBoard(); drawSide(); return true; }
    function remove(k) { if (locked(k)) return; delete L[k]; dirty = true; if (sel === k) sel = null; drawAll(); }
    function place(k, at) { const p = at && fits(L, k, at.x, at.y, 1, 1) ? at : free(L, 1, 1); L[k] = { x: p.x, y: p.y, w: 1, h: 1 }; dirty = true; sel = k; drawAll(); const g = $('.xwm-gr', ov), w = $('.xwm-w[data-k="' + k + '"]', ov); if (g && w) w.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    function key(e) {
        if (!ov) return; if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
        if (!sel || !L[sel] || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return; const b = L[sel], d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (d) { e.preventDefault(); e.stopPropagation(); if (e.shiftKey) set(sel, { x: b.x, y: b.y, w: Math.max(1, b.w + d[0]), h: Math.max(1, b.h + d[1]) }); else set(sel, { x: b.x + d[0], y: b.y + d[1], w: b.w, h: b.h }); }
        else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); remove(sel); }
    }
    // zone 2 : réglages du widget choisi
    function drawSide() {
        if (!ov) return; const sd = $('.xwm-sd', ov), X = D(), CARDS = X.cards();
        if (!sel || !L[sel]) { sd.innerHTML = '<div class="xwm-empty"><i>👆</i>Cliquez un widget de la grille<br>pour afficher ses réglages.</div>'; return; }
        const k = sel, b = L[k], s = S[k] || {}, real = $('#xd-dash .xd-c[data-card="' + k + '"]'), gear = real && real.querySelector('.xd-gear');
        if (locked(k)) { sd.innerHTML = '<h3><span style="font-size:22px">' + esc(ico(CARDS[k])) + '</span>' + esc(lab(CARDS[k])) + '</h3><div class="xwm-lkm">🔒 Widget imposé par le Master : sa place, sa taille et son style sont fixés pour l’équipe.</div>'; sd.onclick = null; return; }
        const seg = (name, vals, cur, okf) => '<div class="xwm-seg" data-f="' + name + '">' + vals.map(v => '<button type="button" data-v="' + v[0] + '"' + (String(v[0]) === String(cur) ? ' class="on"' : '') + (okf && !okf(v[0]) ? ' disabled' : '') + '>' + v[1] + '</button>').join('') + '</div>';
        const n = a => a.map(x => [x, String(x)]);
        sd.innerHTML = '<h3><span style="font-size:22px">' + esc(ico(CARDS[k])) + '</span>' + esc(lab(CARDS[k])) + '</h3>' +
            (real ? '<div class="xwm-pvw"></div>' : '') +
            '<div><h5>Largeur</h5>' + seg('w', n([1, 2, 3, 4]), b.w, v => fits(L, k, b.x, b.y, v, b.h)) + '</div>' +
            '<div><h5>Hauteur</h5>' + seg('h', n([1, 2, 3, 4]), b.h, v => fits(L, k, b.x, b.y, b.w, v)) + '</div>' +
            '<div><h5>Position</h5><div class="xwm-row"><span>Colonne ' + (b.x + 1) + ' · ligne ' + (b.y + 1) + '</span>' + seg('mv', [['L', '←'], ['U', '↑'], ['D', '↓'], ['R', '→']], '') + '</div></div>' +
            (() => { const S2 = shape(real); return S2 ? '<div><h5>Format</h5>' + seg('f', S2.f.map(x => [x, FN[x]]), s.f && S2.f.indexOf(s.f) > -1 ? s.f : (real.classList.contains('xd-defhisto') && S2.f.indexOf('histo') > -1 ? 'histo' : S2.f[0])) + '</div>' : ''; })() +
            '<div><h5>Style</h5>' + seg('s', STY, s.s || 'std') + '</div>' +
            '<div><h5>Couleur</h5><div class="xwm-seg" data-f="c">' + COLORS.map(c => '<button type="button" class="xwm-col' + ((s.c || '') === c ? ' on' : '') + '" data-v="' + c + '" title="' + (c ? c : 'Couleur du thème') + '" style="background:' + (c || 'conic-gradient(#f0b378,#4fc3f7,#81c784,#f0b378)') + '"></button>').join('') + '</div></div>' +
            '<div class="xwm-row"><span>Afficher le titre</span><button type="button" class="xwm-sw' + (s.t === false ? '' : ' on') + '" data-f="t" aria-label="Afficher le titre"></button></div>' +
            (gear ? '<button type="button" class="xwm-btn" data-f="gear">⚙️ Réglages du contenu (Master)</button>' : '') +
            (tgt !== 'me' ? '<div class="xwm-row"><span>🔒 Verrouiller pour l’équipe<small style="display:block;opacity:.6;font-size:11px">Le membre ne peut ni le déplacer ni le retirer</small></span><button type="button" class="xwm-sw' + (LK[k] ? ' on' : '') + '" data-f="lk" aria-label="Verrouiller"></button></div>' : '') +
            '<button type="button" class="xwm-del" data-f="del">Retirer de la grille</button>';
        if (real) { const pw = $('.xwm-pvw', sd), cl = real.cloneNode(true); cl.querySelectorAll('[id]').forEach(x => x.removeAttribute('id')); cl.style.cssText = ''; cl.style.width = real.offsetWidth + 'px';
            const sc = Math.min(1, (sd.clientWidth - 32) / (real.offsetWidth || 1)); cl.style.transform = 'scale(' + sc + ')'; pw.style.height = Math.min(170, real.offsetHeight * sc) + 'px';
            if (s.s && s.s !== 'std') cl.dataset.xwms = s.s; else delete cl.dataset.xwms; if (s.c) cl.style.setProperty('--xwmc', s.c); pw.setAttribute('aria-hidden', 'true'); pw.appendChild(cl); }
        sd.onclick = e => {
            const t = e.target.closest('button'); if (!t || t.disabled) return; const f = (t.closest('[data-f]') || {}).dataset ? t.closest('[data-f]').dataset.f : '', v = t.dataset.v;
            if (f === 'w') set(k, Object.assign({}, b, { w: +v })); else if (f === 'h') set(k, Object.assign({}, b, { h: +v }));
            else if (f === 'mv') { const d = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] }[v]; set(k, Object.assign({}, b, { x: b.x + d[0], y: b.y + d[1] })); }
            else if (f === 'f') { S[k] = Object.assign({}, s, { f: v }); dirty = true; drawSide(); }
            else if (f === 's') { S[k] = Object.assign({}, s, { s: v }); dirty = true; drawBoard(); drawSide(); }
            else if (f === 'c') { S[k] = Object.assign({}, s, { c: v }); if (!v) delete S[k].c; dirty = true; drawBoard(); drawSide(); }
            else if (f === 't') { S[k] = Object.assign({}, s, { t: s.t === false }); dirty = true; drawSide(); }
            else if (f === 'del') remove(k);
            else if (f === 'lk') { if (LK[k]) delete LK[k]; else LK[k] = 1; dirty = true; drawBoard(); drawSide(); }
            else if (f === 'gear') { saveAll(); setTimeout(() => { const r2 = $('#xd-dash .xd-c[data-card="' + k + '"]'); if (r2) { r2.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => D().pop(k, r2), 350); } }, 120); }
        };
    }
    // zone 3 : la liste (glisser vers la grille)
    function drawList() {
        if (!ov) return; const li = $('.xwm-li', ov), CARDS = D().cards();
        li.innerHTML = Object.keys(CARDS).map(k => '<div class="xwm-it' + (L[k] ? ' on' : '') + '" data-k="' + k + '" draggable="' + (L[k] ? 'false' : 'true') + '" title="' + (L[k] ? 'Déjà sur la grille : cliquez pour le régler' : 'Glissez sur la grille, ou ＋ pour la première place libre') + '"><span class="i">' + esc(ico(CARDS[k])) + '</span><span class="n">' + esc(lab(CARDS[k])) + '</span><button type="button" class="a" tabindex="-1">' + (L[k] ? '✓' : '＋') + '</button></div>').join('');
        li.querySelectorAll('.xwm-it').forEach(it => { const k = it.dataset.k;
            it.onclick = () => { if (L[k]) select(k); else place(k); }; if (locked(k)) it.title = 'Imposé par le Master';
            it.ondragstart = e => { e.dataTransfer.setData('text/xwm', k); e.dataTransfer.effectAllowed = 'copy'; };
        });
        const bd = $('.xwm-bd', ov), pv = $('.xwm-pv', ov);
        const cellAt = e => { const G = geo(), r = bd.getBoundingClientRect(); return { x: Math.max(0, Math.min(COLS - 1, Math.floor((e.clientX - r.left) / (G.cw + GAP)))), y: Math.max(0, Math.floor((e.clientY - r.top) / (G.ch + GAP))) }; };
        bd.ondragover = e => { if (![...e.dataTransfer.types].includes('text/xwm')) return; e.preventDefault(); const c = cellAt(e), G = geo(); pv.style.display = 'block'; pv.classList.toggle('bad', !fits(L, null, c.x, c.y, 1, 1)); setBox(pv, box(G, { x: c.x, y: c.y, w: 1, h: 1 })); };
        bd.ondragleave = e => { if (!bd.contains(e.relatedTarget)) pv.style.display = 'none'; };
        bd.ondrop = e => { const k = e.dataTransfer.getData('text/xwm'); pv.style.display = 'none'; pv.classList.remove('bad'); if (!k) return; e.preventDefault(); place(k, cellAt(e)); };
    }
    // le ＋ des widgets ouvre ce gestionnaire (à la place de l'ancienne galerie)
    document.addEventListener('click', e => { const p = e.target.closest && e.target.closest('#xd-plus'); if (!p || !D()) return; e.preventDefault(); e.stopImmediatePropagation(); open(); }, true);
    window.XWMAN = { open, apply };
})();
