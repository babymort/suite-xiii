// SUITE XIII — module commun. Source : xiii-src/suite-insp.js
// =====================================================================
//  SUITE XIII — XINSP : l'inspecteur à droite (saison 6, phase B)
//  Les propriétés de l'élément sélectionné s'affichent partout au même endroit et avec la même présentation :
//  une colonne à droite, sous les barres, 360 px, titrée « Propriétés ». La zone de travail se resserre au lieu d'être recouverte.
//  ▤ Propriétés (secteur ② Afficher) ou la touche I l'affiche / le masque, choix retenu par outil.
//  Les fenêtres de saisie des autres outils s'ouvrent déjà dans ce même panneau à droite (XDOCK), à la même largeur.
// =====================================================================
(function () {
    if (window.XINSP) return;
    const APPX = XIII_APP, $ = id => document.getElementById(id);
    // dock : panneau flottant devenu colonne fixe ; col : colonne déjà dans la mise en page, seulement harmonisée
    const CONF = {
        conduco: { sel: '#props-panel', mode: 'dock', label: 'Propriétés de l’élément' },
        decoup: { sel: '#props-panel', mode: 'dock', label: 'Propriétés du plan' },
        plano: { sel: '#props-panel', mode: 'dock', label: 'Propriétés' },
        storyboardo: { sel: '#props', mode: 'col', label: 'Propriétés du plan' },
        repero: { sel: '#side-col', mode: 'col', label: 'Propriétés du lieu' },
        encodo: { sel: '#side', mode: 'col', label: 'Réglages de conversion' }
    };
    const C = CONF[APPX]; if (!C) return;
    const K = 'xiii.insp.' + APPX, W = 360;
    const hidden = () => { try { return localStorage.getItem(K) === '0'; } catch (e) { return false; } };
    function css() {
        if ($('xinsp-css')) return; const s = document.createElement('style'); s.id = 'xinsp-css'; const S = C.sel;
        s.textContent =
            // présentation commune (les deux modes)
            S + '.xinsp{background:var(--bg-panel,#262626)!important;color:var(--text-main,#eee);border:0!important;border-left:1px solid var(--border-color,#444)!important;border-radius:0!important;box-shadow:none!important;font-size:12.5px}' +
            S + '.xinsp::before{content:attr(data-xinsp);display:block;position:sticky;top:0;z-index:2;margin:0 0 6px;padding:9px 14px 8px;font:700 10.5px system-ui,"Segoe UI",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--text-dim,#999);background:inherit;border-bottom:1px solid var(--border-color,#444)}' +
            S + '.xinsp label,' + S + '.xinsp .lbl{letter-spacing:.02em}' +
            S + '.xinsp input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]),' + S + '.xinsp select{min-height:28px;box-sizing:border-box}' +
            // dock : colonne fixe à droite, la zone de travail se resserre
            (C.mode === 'dock' ? 'html.xinsp-open:not(.xinsp-hide) ' + S + '.xinsp{position:fixed!important;top:var(--xinsp-top,99px)!important;right:0!important;bottom:0!important;left:auto!important;width:' + W + 'px!important;max-height:none!important;height:auto!important;overflow-y:auto!important;z-index:95}' +
                'html.xinsp-open:not(.xinsp-hide) #workspace-container{margin-right:' + W + 'px!important}' + 'html.xinsp-open:not(.xinsp-hide) #xs-gear{right:' + (W + 18) + 'px!important}html.xinsp-open:not(.xinsp-hide) #xt-tab{display:none!important}' : '') +
            // col : la largeur reste celle de la mise en page de l'outil (forcée, elle débordait de l'écran dans STORYBOARDO)

            // la mise en page d'origine réservait déjà la place du panneau flottant (body.panel-open) : on l'annule, la colonne la réserve elle-même
            (C.mode === 'dock' ? 'html.xinsp-open:not(.xinsp-hide) body.panel-open #view-area{margin-right:0!important}html.xinsp-open:not(.xinsp-hide) body.panel-open #zoom-controls{right:0!important}html.xinsp-open:not(.xinsp-hide) body.panel-open #settings-btn{right:36px!important}html.xinsp-open:not(.xinsp-hide) body.panel-open #layers-btn{right:' + (APPX === 'plano' ? 212 : 10) + 'px!important}' : '') +
            'html.xinsp-hide ' + S + '.xinsp{display:none!important}' +
            'body.xfocus ' + S + '{display:none!important}html:has(body.xfocus) #workspace-container{margin-right:0!important}' +
            '@media (max-width:1100px){#xinsp-btn{display:none!important}}' + '@media (max-width:899px){' + S + '.xinsp{position:revert!important;width:auto!important;flex:revert!important;max-width:none!important}html.xinsp-open #workspace-container{margin-right:0!important}}';
        document.head.appendChild(s);
    }
    let lastOpen = null;
    function tick() {
        const p = document.querySelector(C.sel); if (!p) return;
        if (!p.classList.contains('xinsp')) { p.classList.add('xinsp'); p.dataset.xinsp = C.label; }
        const tb = $('toolbar'); if (tb) document.documentElement.style.setProperty('--xinsp-top', Math.round(tb.getBoundingClientRect().bottom) + 'px');
        document.documentElement.classList.toggle('xinsp-hide', hidden());
        // dock : la colonne n'existe que si l'outil affiche le panneau (un élément sélectionné)
        const o = C.mode === 'dock' ? (getComputedStyle(p).display !== 'none' && p.childElementCount > 0) : true;
        if (o !== lastOpen) { lastOpen = o; document.documentElement.classList.toggle('xinsp-open', !!o); try { dispatchEvent(new Event('resize')); } catch (e) { } }
        const b = $('xinsp-btn'); if (b) { const v = hidden() ? 'false' : 'true'; if (b.getAttribute('aria-pressed') !== v) b.setAttribute('aria-pressed', v); }
    }
    function set(on) { try { localStorage.setItem(K, on ? '1' : '0'); } catch (e) { } tick(); try { dispatchEvent(new Event('resize')); } catch (e) { } }
    function mount() {
        const tb = $('toolbar'); if (!tb || $('xinsp-btn')) return;
        const b = document.createElement('button'); b.type = 'button'; b.id = 'xinsp-btn'; b.dataset.xsec = 'aff';
        b.title = 'Propriétés (I) — afficher / masquer le panneau de droite'; b.innerHTML = '<span class="btn-icon">▤</span><span class="btn-label">Propriétés</span>';
        b.onclick = () => set(hidden()); const aff = tb.querySelector(':scope > .xsec[data-sec="aff"]'); (aff || tb).appendChild(b);
    }
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || (e.key !== 'i' && e.key !== 'I')) return;
        const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if ([...document.querySelectorAll('[role=dialog],.modal-overlay')].some(x => x.offsetWidth > 0)) return;
        e.preventDefault(); set(hidden());
    });
    const go = () => { css(); mount(); tick(); setInterval(() => { mount(); tick(); }, 400); };
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(() => setTimeout(go, 500), 2999); else throw 0; } catch (e) { addEventListener('load', () => setTimeout(go, 1300)); }
    window.XINSP = { set, tick };
})();
