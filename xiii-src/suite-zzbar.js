// =====================================================================
//  SUITE XIII — XZZB : rangement des boutons ajoutés pendant la saison (phase ZZ)
//  • 🗒️ Nouveau ▾ : « vierge » et « exemple type » (📐) réunis en un seul bouton de la zone outil.
//  • Envois vers un autre outil (💶 Chiffrer dans DEVISO, Envoyer vers CALL SHEETO…) : rangés dans 📤 Vers Suite XIII
//    quand ce bouton existe et propose la même destination (le bouton d'origine reste dans la page, caché, et sert d'action).
//  • Boutons d'outil ajoutés en bout de barre (🗃️ Catalogue, 🧍 Cadre 3D, 🤖 Préremplir…) : ramenés dans un groupe
//    à la suite des autres outils, au lieu d'être isolés à droite après l'état d'enregistrement.
// =====================================================================
var XZZB = window.XZZB || (() => {
    const $ = id => document.getElementById(id), ico = b => ((b.querySelector('.btn-icon') || {}).textContent || b.textContent || '').trim();
    const tip = b => (b.title || b.textContent || '').replace(/\s+/g, ' ').trim(), vis = b => b && b.style.display !== 'none' && !b.hidden && b.offsetParent !== null;
    const done = {}, APP = '__APP__';
    // ---------- barres complètes dès l'ouverture ----------
    // les modules communs se placent dans les barres pendant ~1 à 2 s : le contenu des barres reste invisible (place réservée,
    // fond visible) jusqu'à ce qu'il ne bouge plus, puis apparaît d'un bloc — 2,5 s au plus après l'affichage de l'outil
    const H = document.documentElement;
    function shield() {
        if (/[?&](embed|out|view|share|pub)=/.test(location.search) || H.classList.contains('xzzb1')) return;
        H.classList.add('xzzb0'); const st = document.createElement('style'); st.id = 'xzzb-css';
        st.textContent = 'html.xzzb0 #top-bar>*:not(#xb-brand):not(.xn-homeg),html.xzzb0 #toolbar>*{opacity:0!important;pointer-events:none!important}html.xzzb1 #top-bar>*,html.xzzb1 #toolbar>*{transition:opacity .18s ease-out}';
        (document.head || H).appendChild(st);
        const t0 = performance.now(); let shownAt = 0, last = '', stable = 0;
        const sig = () => { let s = ''; document.querySelectorAll('#top-bar button,#top-bar select,#top-bar input,#toolbar button,#toolbar select,#toolbar input').forEach(e => { const r = e.getBoundingClientRect(); if (r.width) s += (e.id || e.title.slice(0, 8)) + Math.round(r.left) + ',' + Math.round(r.top) + ';'; }); return s; };
        const free = () => { H.classList.remove('xzzb0'); H.classList.add('xzzb1'); };
        const tick = () => { const now = performance.now();
            if (!shownAt && !H.classList.contains('xb0')) shownAt = now;
            if (now - t0 > 6000 || (shownAt && now - shownAt > 2500)) return free();
            if (shownAt) { const s = sig(); if (s === last) { if (!stable) stable = now; if (now - stable > 200) return free(); } else { last = s; stable = 0; } }
            setTimeout(tick, 50); };
        tick();
    }
    try { if (document.getElementById('top-bar') || document.getElementById('toolbar') || document.readyState === 'loading') shield(); } catch (e) { }
    // ---------- stockage du navigateur plein : prévenir au lieu d'afficher « Enregistré » ----------
    // (contrôle ZZ : DEVISO, STORYBOARDO… affichaient « Enregistré » alors que l'écriture avait échoué)
    (function quota() {
        const S = window.Storage && Storage.prototype; if (!S || S.__xzzq) return; S.__xzzq = 1; const set = S.setItem; let shown = 0;
        const warn = () => { const now = Date.now(); const st = document.getElementById('save-state'); if (st) { st.textContent = '⚠️ Non enregistré : stockage plein'; st.style.color = '#ff8a65'; }
            if (now - shown < 20000 || !document.body) return; shown = now; let b = document.getElementById('xzz-quota');
            if (!b) { b = document.createElement('div'); b.id = 'xzz-quota'; b.setAttribute('role', 'alert'); b.style.cssText = 'position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:2147483002;max-width:min(560px,94vw);background:#3a1d14;color:#ffe0d6;border:1px solid #ff8a65;border-radius:10px;padding:10px 14px;font:13px/1.45 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5)';
                b.innerHTML = '<b>⚠️ Stockage du navigateur plein</b> : vos dernières modifications ne sont <b>pas enregistrées</b> ici. Exportez le projet (⬇️ fichier .json) pour ne rien perdre, puis libérez de la place (anciens projets, photos, ⚙️ › stockage). <button style="margin-left:6px">OK</button>';
                b.querySelector('button').onclick = () => b.remove(); document.body.appendChild(b); } };
        S.setItem = function (k, v) { try { return set.call(this, k, v); } catch (e) { if (e && (e.name === 'QuotaExceededError' || e.code === 22 || /quota/i.test(e.message || '')) && this === window.localStorage && !/^__/.test(k)) { try { warn(); setTimeout(warn, 400); } catch (x) { } } throw e; } };
    })();
    // 🖼️ photo de fond de l'accueil : aussi dans ⚙️ Réglages de l'accueil (le réglage vit dans 🎬 Projet XIII › Personnalisation)
    if (APP === 'index') { window.XSET_HELP = window.XSET_HELP || []; if (!window.XSET_HELP.some(x => x.k === 'xpbg')) window.XSET_HELP.unshift({ k: 'xpbg', icon: '🖼️', label: 'Photo de fond de l’accueil', sub: 'Choisie par le Master pour toute l’équipe (avec le thème et les outils visibles)', run: () => { try { XPROJET.open('p'); } catch (e) { } } }); }
    // sélecteurs sur plusieurs lignes (thèmes de ⚙️ Paramètres) : coins moins arrondis, posés en style direct (les skins utilisent des sélecteurs très précis)
    try { new MutationObserver(() => { document.querySelectorAll('.xs-seg').forEach(g => { if (g.dataset.xzzr || !/wrap/.test(g.style.flexWrap)) return; g.dataset.xzzr = 1; g.style.setProperty('border-radius', '16px', 'important'); }); }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) { }
    // ---------- 🗒️ Nouveau ▾ ----------
    function nouveau() {
        if (done.nv) return; const z = $('xb-tool'); if (!z) return;
        const B = [...z.querySelectorAll('button')].filter(vis);
        const vierge = B.find(b => /🗒️/.test(ico(b)) && /vierge|nouveau/i.test(tip(b)));
        const ex = B.filter(b => b !== vierge && (b.id === 'xmd-btn' || /📐/.test(ico(b)) && /exemple/i.test(tip(b))));
        if (!vierge || !ex.length) return; done.nv = 1;
        const L = [vierge].concat(ex), n = document.createElement('button'); n.id = 'xzz-new'; n.title = 'Nouveau : document vierge ou exemple type';
        n.innerHTML = '<span class="btn-icon">🗒️</span><span class="btn-label">Nouveau ▾</span>';
        vierge.before(n); L.forEach(b => { b.style.display = 'none'; b.dataset.xzz = 'nv'; });
        n.onclick = e => menu(e, n, '🗒️ Nouveau', 'Partir d’une page blanche ou d’un exemple à adapter.', L.map(b => [b.id === 'xmd-btn' || /📐/.test(ico(b)) ? '🧩' : ico(b).slice(0, 3), tip(b), () => b.click()]));
    }
    function menu(e, at, title, sub, items) {
        e.stopPropagation(); let m = $('xb-menu'); if (m) { m.remove(); return; }
        const r = at.getBoundingClientRect(); m = document.createElement('div'); m.id = 'xb-menu';
        m.style.cssText = 'position:fixed;z-index:2147483001;top:' + (r.bottom + 6) + 'px;left:' + Math.max(8, Math.min(innerWidth - 310, r.left - 60)) + 'px';
        const E = s => String(s).replace(/[<>&"]/g, '');
        m.innerHTML = '<b>' + title + '</b><p>' + sub + '</p>' + items.map((x, i) => { const h = x[1].split(/ : | — |\. | \(/)[0].slice(0, 60), rest = x[1].slice(h.length).replace(/^[\s:—.(]+/, '').slice(0, 100); return '<button data-i="' + i + '"><span>' + E(x[0]) + '</span><span><b>' + E(h) + '</b>' + (rest ? '<small>' + E(rest) + '</small>' : '') + '</span></button>'; }).join('');
        document.body.appendChild(m); m.querySelectorAll('[data-i]').forEach(x => x.onclick = () => { m.remove(); items[+x.dataset.i][2](); });
        setTimeout(() => document.addEventListener('click', function off(ev) { if (!ev.target.closest('#xb-menu')) { m.remove(); document.removeEventListener('click', off); } }), 0);
    }
    // ---------- envois vers un autre outil → 📤 Vers Suite XIII ----------
    // pour chaque outil relié, le bouton que la fenêtre « Vers Suite XIII » utiliserait est caché de la barre (il reste l'action de la fenêtre)
    function envois() {
        const g = $('xgt-btn'); if (!g || typeof XLINKS === 'undefined' || typeof XGATE === 'undefined' || !XGATE.findBtn) return; let peers = [];
        try { peers = XLINKS.peers(APP); } catch (e) { return; }
        [['xd-btn', 'deviso'], ['xc-btn', 'callsheeto']].forEach(([id, to]) => { const b = $(id); if (b && !b.dataset.xzz && peers.indexOf(to) >= 0) { b.style.display = 'none'; b.dataset.xzz = 'gt'; } });
        peers.forEach(to => { if (to === 'dossier') return; let b = null; try { b = XGATE.findBtn(to); } catch (e) { } if (!b || b === g || b.dataset.xzz || !b.closest('#top-bar,#toolbar,#xb-tool,#xb-file')) return;
            if (!/^\s*(Envoyer|Renvoyer|Transmettre|Chiffrer|Créer les)/i.test(b.title || b.textContent)) return; b.style.display = 'none'; b.dataset.xzz = 'gt'; });
    }
    // ---------- 🧩 exemples : icône propre (📐 est l'icône de PLANO) et plusieurs modèles réunis ----------
    function exemples() {
        const x = $('xmd-btn'); if (x && !x.dataset.xzzi) { x.dataset.xzzi = 1; const i = x.querySelector('.btn-icon'); if (i) i.textContent = '🧩'; else if (/📐/.test(x.textContent)) x.innerHTML = x.innerHTML.replace('📐', '🧩'); }
        if (done.ex || done.nv || $('xzz-new')) return; const z = $('xb-tool'); if (!z) return;
        const L = [...z.querySelectorAll('button')].filter(vis).filter(b => b.id === 'xmd-btn' || /(exemple|modèle)/i.test(tip(b)) && /📐|🧩/.test(ico(b)) && !/(reprendre|depuis|importer)/i.test(tip(b)));
        if (L.length < 2) return; done.ex = 1; const n = document.createElement('button'); n.id = 'xzz-ex'; n.title = 'Exemples et modèles';
        n.innerHTML = '<span class="btn-icon">🧩</span><span class="btn-label">Exemples ▾</span>'; L[0].before(n); L.forEach(b => { b.style.display = 'none'; b.dataset.xzz = 'ex'; });
        n.onclick = e => menu(e, n, '🧩 Exemples et modèles', 'Partir d’un document type, à adapter.', L.map(b => ['🧩', tip(b), () => b.click()]));
    }
    // ---------- boutons d'outil isolés en bout de barre ----------
    const TOOLS = /^(xcat-btn|xm3d-btn|xcsai-btn|xdpai-btn|xph3d-btn)$/;
    function rangeTools() {
        const t = $('toolbar'); if (!t) return; const strays = [...t.children].filter(c => c.tagName === 'BUTTON' && TOOLS.test(c.id)); if (!strays.length) return;
        let g = $('xzz-tg'); const anchor = [...t.children].find(c => c.id === 'save-state' || c.classList.contains('save-state') || c.classList.contains('tb-label') || c.tagName === 'LABEL' || c.tagName === 'INPUT');
        if (!g) { g = document.createElement('span'); g.className = 'btn-group'; g.id = 'xzz-tg'; const d = document.createElement('div'); d.className = 'divider'; d.id = 'xzz-dv';
            if (anchor) { anchor.before(d); anchor.before(g); } else { t.appendChild(d); t.appendChild(g); } }
        strays.forEach(b => g.appendChild(b));
    }
    // ---------- espacement et alignement (contrôlé sur ordinateur 1440, tablette 1024, téléphone 390, thèmes clair et sombre) ----------
    function css() {
        if ($('xzz-css')) return; const st = document.createElement('style'); st.id = 'xzz-css';
        st.textContent = // le resserrement par paliers reste celui de XFIT (corrigé : il voit maintenant les groupes qui débordent)
            
            '.xfit2 .btn-group,.xfit2 .tool-group,.xfit2 .view-group{width:auto!important}' + // largeur réservée aux libellés inutile quand ils sont masqués
            'html body #xs-panel .xs-seg[style*="flex-wrap"],html body .xs-seg[style*="flex-wrap"]{border-radius:16px!important;justify-content:flex-start}.xs-seg>.xgl-ind{position:absolute;pointer-events:none}' + // sélecteur de thèmes sur plusieurs lignes : coins arrondis qui ne mangent plus les boutons des extrémités
            (APP === 'index' ? 'body.xh.xpbg,body.xpbg{background:var(--xpbg) center/cover fixed no-repeat!important}' : '') + // photo de fond de l'accueil choisie par le Master : passe devant le dégradé du tableau de bord
            '#top-bar #project-name,#toolbar #project-name{field-sizing:content;min-width:120px;max-width:300px}' +
            '#top-bar button,#toolbar button{flex-shrink:0}#top-bar input[type=text],#top-bar input:not([type]),#toolbar input[type=text],#toolbar input:not([type]){flex-shrink:0;min-width:104px!important}' + // un champ (nom, « Votre nom ») ne se laisse plus écraser sous les boutons : la barre se resserre ou défile à la place
 // nom du projet lisible en entier (dans la limite de la barre)
            '#top-bar>#tabs-container,#top-bar>.tabs-container{flex-shrink:40!important;min-width:140px!important}#top-bar>div:last-child:not(.tabs-container):not(#tabs-container){flex-shrink:0!important}' + // les onglets (qui défilent) cèdent la place en premier, avant les boutons et le nom
            '#top-bar .tabs-container{min-width:0}#xzz-tg:empty,#xzz-tg:empty+.divider{display:none}' +
            '#toolbar button,#top-bar button{white-space:nowrap}' +
            '@media(max-width:1180px){#toolbar>.tb-label{display:none}}' +
            '.xzz-scroll{overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:thin;overscroll-behavior-x:contain}' +
            (APP === 'melango' ? '@media(max-width:1100px){#h-learn{display:none!important}}@media(max-width:1000px){#app>header{overflow-x:auto!important;scrollbar-width:none}}@media(max-width:1200px){header{gap:3px!important}header>button,header>div>button,header .hb{padding-left:6px!important;padding-right:6px!important;font-size:11.5px!important}}' : '');
        (document.head || document.documentElement).appendChild(st);
    }
    // 🏠 Accueil : même taille d'icône que les autres boutons de la barre quand celle-ci passe en mode compact
    function homeIcon() {
        const h = document.querySelector('#top-bar .xn-home .btn-icon'); if (!h) return; const o = [...document.querySelectorAll('#top-bar button:not(.xn-home) .btn-icon')].find(x => x.offsetParent); if (!o) return;
        const f = parseFloat(getComputedStyle(o).fontSize); h.style.fontSize = f < 14 ? f + 'px' : '';
    }
    function run() { try { nouveau(); } catch (e) { } try { exemples(); } catch (e) { } try { envois(); } catch (e) { } try { rangeTools(); } catch (e) { } try { css(); homeIcon(); } catch (e) { } }
    function init() { if (typeof XBOOT !== 'undefined') XBOOT.ready(run, 1900); let n = 0; const iv = setInterval(() => { run(); if (++n > 25) clearInterval(iv); }, 300); if (document.readyState !== 'loading') run(); else addEventListener('DOMContentLoaded', run); }
    init(); addEventListener('resize', () => { try { homeIcon(); } catch (e) { } });
    return { run, menu };
})();
