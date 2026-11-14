// =====================================================================
//  SUITE XIII — XMGMT : les pages de gestion (TEAM, DRIVE…) dans l'interface des outils (saison 6, phase X)
//  · barre de titre d'outil (logo, nom de la page, projet en cours) + sélecteur commun 🎬 Projet · ☁️ Drive · 👥 Team ;
//  · les onglets de la page passent dans un volet de rubriques à gauche (comme DOSSIER et PROJET XIII) ;
//  · le contenu occupe le reste de l'écran. Rien ne change dans le fonctionnement des pages.
// =====================================================================
(function () {
    if (window.XMGMT) return;
    const APP = typeof XIII_APP !== 'undefined' ? XIII_APP : (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    const PAGES = [['projet', '🎬', 'Projet', 'index.html#projet'], ['drive', '☁️', 'Drive', 'drive.html'], ['team', '👥', 'Team', 'team.html'], ['reglages', '⚙️', 'Réglages', 'index.html#reglages']];
    const css = document.createElement('style'); css.id = 'xmgmt-css';
    css.textContent =
        'html.xmg,html.xmg body{height:100%}html.xmg body{margin:0!important;padding:0!important;display:grid!important;grid-template-columns:240px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);overflow:hidden!important;background:var(--bg-main,#141416)}' +
        'html.xmg body>header{grid-column:1/-1;position:relative!important;display:flex!important;align-items:center;gap:14px;flex-wrap:nowrap;padding:10px 18px!important;background:var(--bg-topbar,var(--bg-panel,#1c1c20))!important;border-bottom:1px solid var(--border-color,#333)!important;margin:0!important;max-width:none!important}' +
        'html.xmg body>header h1{font:400 26px/1 Astoria,Georgia,serif!important;letter-spacing:.02em;margin:0!important;color:#f0b378;white-space:nowrap}html.xmg body>header h1 span{display:none}' +
        'html.xmg .xmg-sw{display:flex;gap:4px;margin-left:auto;padding:3px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--border-color,#333)}html.xmg .xmg-sw a{display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:9px;color:inherit;text-decoration:none;font:600 13px system-ui,sans-serif;opacity:.75;transition:background .15s,opacity .15s}html.xmg .xmg-sw a:hover{opacity:1;background:rgba(255,255,255,.06)}html.xmg .xmg-sw a.on{opacity:1;background:rgba(240,179,120,.18);color:#f6c79a}' +
        'html.xmg [data-xmg-nav]{grid-column:1;grid-row:2;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:2px!important;padding:14px 10px!important;margin:0!important;overflow-y:auto;border-right:1px solid var(--border-color,#333);background:var(--bg-panel,#1a1a1e);position:static!important;width:auto!important;flex-wrap:nowrap!important}' +
        'html.xmg [data-xmg-nav]::before{content:"Rubriques";display:block;font:700 10.5px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.5;padding:4px 10px 8px}' +
        'html.xmg [data-xmg-nav]>button,html.xmg [data-xmg-nav]>a{display:flex!important;align-items:center;gap:8px;width:100%;text-align:left;padding:9px 10px!important;border-radius:9px!important;border:0!important;border-left:3px solid transparent!important;background:transparent!important;color:inherit;font:500 13.5px system-ui,sans-serif!important;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s}' +
        'html.xmg [data-xmg-nav]>button:hover,html.xmg [data-xmg-nav]>a:hover{background:rgba(255,255,255,.05)!important}html.xmg [data-xmg-nav]>.on,html.xmg [data-xmg-nav]>[aria-selected=true]{background:rgba(240,179,120,.12)!important;border-left-color:#f0b378!important;font-weight:650!important}' +
        'html.xmg body>.wrap[data-xmg-main]{width:auto!important}html.xmg [data-xmg-main]{grid-column:2;grid-row:2;overflow-y:auto;padding:24px max(24px,calc((100% - 1100px)/2))!important;margin:0!important;max-width:none!important;box-sizing:border-box}' +
        '@media (max-width:820px){html.xmg body{grid-template-columns:1fr;grid-template-rows:auto auto minmax(0,1fr)}html.xmg [data-xmg-nav]{grid-row:2;flex-direction:row!important;overflow-x:auto;border-right:0;border-bottom:1px solid var(--border-color,#333)}html.xmg [data-xmg-nav]::before{display:none}html.xmg [data-xmg-main]{grid-column:1;grid-row:3}html.xmg .xmg-sw a span{display:none}}';
    (document.head || document.documentElement).appendChild(css);
    // pages sans en-tête ni onglets (DRIVE) : en-tête construit, volet = titres des cartes (défilement)
    function mountCards() {
        const wrap = document.querySelector('body>.wrap'), main = document.getElementById('main'); if (!wrap || !main) return false;
        const R = document.documentElement; R.classList.add('xmg');
        let hd = document.querySelector('body>header.xmg-h'); if (!hd) { hd = document.createElement('header'); hd.className = 'xmg-h'; const h1 = wrap.querySelector('h1'); hd.innerHTML = '<a href="index.html" title="Accueil" style="text-decoration:none;font-size:20px">🏠</a><h1>' + (h1 ? h1.innerHTML : APP) + '</h1>'; if (h1) h1.style.display = 'none'; const top = wrap.querySelector('.top'); if (top) top.style.display = 'none'; document.body.prepend(hd); }
        let nav = document.querySelector('[data-xmg-nav]'); if (!nav) { nav = document.createElement('nav'); nav.dataset.xmgNav = 1; hd.after(nav); }
        wrap.dataset.xmgMain = 1; if (wrap.previousElementSibling !== nav) nav.after(wrap);
        const sync = () => { const C = [...main.querySelectorAll(':scope > .card, :scope > section')].filter(c => c.querySelector('h2,h3')); const sig = C.map(c => c.querySelector('h2,h3').textContent.trim()).join('|'); if (nav.dataset.sig === sig) return; nav.dataset.sig = sig;
            nav.innerHTML = C.map((c, i) => '<button type="button" data-i="' + i + '">' + c.querySelector('h2,h3').textContent.trim().replace(/[<>&]/g, '') + '</button>').join('') || '<button type="button" class="on">Accueil du Drive</button>';
            nav.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const c = C[+b.dataset.i]; if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); nav.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }); const f = nav.querySelector('button'); if (f) f.classList.add('on'); };
        sync(); new MutationObserver(sync).observe(main, { childList: true });
        if (!hd.querySelector('.xmg-sw')) { const sw = document.createElement('div'); sw.className = 'xmg-sw'; sw.innerHTML = PAGES.map(p => '<a href="' + p[3] + '" class="' + (p[0] === APP ? 'on' : '') + '" title="' + p[2] + '">' + p[1] + '<span>' + p[2] + '</span></a>').join(''); hd.appendChild(sw); }
        return true;
    }
    function mount() {
        if (!document.querySelector('body>header') && document.querySelector('body>.wrap #main')) return mountCards();
        const hd = document.querySelector('body>header'); if (!hd) return false;
        const nav = document.getElementById('nav') || hd.querySelector('nav'), main = document.getElementById('m') || document.querySelector('body>main'); if (!nav || !main) return false;
        document.documentElement.classList.add('xmg'); document.body.insertBefore(nav, main); nav.dataset.xmgNav = 1; main.dataset.xmgMain = 1;
        if (!hd.querySelector('.xmg-sw')) { const sw = document.createElement('div'); sw.className = 'xmg-sw'; sw.innerHTML = PAGES.map(p => '<a href="' + p[3] + '" class="' + (p[0] === APP ? 'on' : '') + '" title="' + p[2] + '">' + p[1] + '<span>' + p[2] + '</span></a>').join(''); hd.appendChild(sw); }
        return true;
    }
    let n = 0; const go = () => { if (!mount() && ++n < 20) setTimeout(go, 150); };
    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', go); else go();
    window.XMGMT = { mount };
})();
