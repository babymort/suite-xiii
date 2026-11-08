// =====================================================================
//  SUITE XIII — XTYPE : une seule échelle typographique (saison 6, phase A)
//  Quatre tailles pour toute l'interface (barres, menus, fenêtres, panneaux, volets) : 11 · 12,5 · 14 · 18 px,
//  deux graisses (normale 400, appuyée 600). Les chiffres (horaires, timecodes, montants, durées) sont à chasse fixe
//  et alignés, comme sur la photo de référence. Le contenu des outils (textes saisis, aperçus, PDF) n'est pas touché.
// =====================================================================
(function () {
    if (document.getElementById('xtype-css')) return;
    const UI = '#top-bar,#toolbar,#xb-menu,[role=dialog],.modal-box,#xs-panel,.xinsp,#library-panel,.xem-trio,.xem-card,#pmenu,#xdock-btn';
    const q = (sel) => UI.split(',').map(u => 'html body ' + u + ' ' + sel).join(',');
    const self = (sel) => UI.split(',').map(u => 'html body ' + u + sel).join(',');
    const css = ':root{--xt-1:11px;--xt-2:12.5px;--xt-3:14px;--xt-4:18px;--xt-mono:ui-monospace,"SF Mono","Cascadia Mono",Consolas,monospace}' +
        // chiffres alignés partout (n'a d'effet que sur les chiffres)
        'html body{font-variant-numeric:tabular-nums}' +
        'input[type=time],input[type=number],input[type=date],.tc,.time,.timecode,.dur,.duration,.price,.amount,.num,[class*="-time"],[class*="time-"],td.r,.mono{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1}' +
        // échelle : texte courant de l'interface
        self('') + '{font-size:var(--xt-2)}' +
        q('button') + ',' + q('select') + ',' + q('input:not([type=checkbox]):not([type=radio])') + ',' + q('label') + ',' + q('li') + ',' + q('td') + ',' + q('th') + '{font-size:var(--xt-2)!important}' +
        q('span') + ',' + q('b') + ',' + q('strong') + ',' + q('em') + ',' + q('a') + '{font-size:var(--xt-2)!important}' +
        q('i') + ',' + q('.k') + ',' + q('kbd') + '{font-size:var(--xt-1)!important}' +
        q('[class$="-brand"] *') + ',' + q('[class$="-brand"]') + '{font-size:var(--xt-3)!important}' +
        q('p') + '{font-size:var(--xt-2)!important;line-height:1.45}' +
        q('small') + ',' + q('.hint') + ',' + q('.sub') + ',' + q('.muted') + ',' + q('h5') + ',' + q('h6') + ',' + q('.lbl') + '{font-size:var(--xt-1)!important}' +
        q('h4') + ',' + q('summary') + ',' + q('b') + '{font-weight:600}' + q('h4') + ',' + q('summary') + '{font-size:var(--xt-3)!important}' +
        q('h2') + ',' + q('h3') + '{font-size:var(--xt-4)!important;font-weight:600!important;letter-spacing:0}' +
        q('textarea') + '{font-size:var(--xt-3)!important}' +
        // les grands compteurs des outils (horloges, totaux) gardent leur taille mais en chiffres à chasse fixe
        'html body .xem-trio .i{font-size:24px!important}#xid-chip i{font-size:var(--xt-1)!important}.stat b,.stat strong,.kpi b,[class*="clock"],[id*="clock"],#ws-stats b{font-family:var(--xt-mono)!important;font-variant-numeric:tabular-nums;letter-spacing:0}';
    const s = document.createElement('style'); s.id = 'xtype-css'; s.textContent = css; (document.head || document.documentElement).appendChild(s);
})();
