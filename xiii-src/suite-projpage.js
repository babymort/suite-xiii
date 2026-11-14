// =====================================================================
//  SUITE XIII — XPROJPAGE : PROJET XIII en page d'outil (saison 6, phase X)
//  La fiche projet ne s'ouvre plus en fenêtre : elle occupe tout l'écran, comme un outil (même logique, mêmes champs).
//   · en haut : barre de titre « PROJET XIII » + nom du projet + changer de projet / enregistrer / fermer ;
//   · à gauche : volet des rubriques (Global, Lieux, Technique, Équipe, Outils, Personnalisation, Charte, Fichier), comme DOSSIER,
//     avec la rubrique en cours surlignée pendant le défilement et le nombre de champs remplis ;
//   · au centre : le contenu, sur toute la hauteur.
//  Accès direct : index.html#projet (ou n'importe quel outil + #projet).
// =====================================================================
(function () {
    if (window.XPROJPAGE) return;
    const css = document.createElement('style'); css.id = 'xprojpage-css';
    css.textContent =
        '#xpj-ov.xpj-page{padding:0!important;background:var(--bg-main,#141416)!important;animation:xppIn .22s cubic-bezier(.2,.7,.2,1)}@keyframes xppIn{from{opacity:0;transform:translateY(6px)}}' +
        '#xpj-ov.xpj-page .xpj-box{width:100%!important;max-width:none!important;height:100%;border:0!important;border-radius:0!important;box-shadow:none!important;grid-template-columns:250px minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr)!important;background:var(--bg-main,#141416)!important}' +
        '#xpj-ov.xpj-page .xpj-head{grid-column:1/-1;background:var(--bg-topbar,var(--bg-panel,#1c1c20));border-bottom:1px solid var(--border-color,#333)}' +
        '#xpj-ov.xpj-page .xpj-nav{grid-column:1;grid-row:2;flex-direction:column!important;gap:2px!important;padding:14px 10px!important;border-bottom:0!important;border-right:1px solid var(--border-color,#333);overflow-y:auto!important;overflow-x:hidden!important;background:var(--bg-panel,#1a1a1e)}' +
        '#xpj-ov.xpj-page .xpj-nav::before{content:"Rubriques";display:block;font:700 10.5px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.5;padding:4px 10px 8px}' +
        '#xpj-ov.xpj-page .xpj-nav a{display:flex!important;align-items:center;gap:8px;padding:9px 10px!important;border-radius:9px;white-space:nowrap;border-left:3px solid transparent;transition:background .15s,border-color .15s,color .15s}' +
        '#xpj-ov.xpj-page .xpj-nav a:hover{background:rgba(255,255,255,.05)}#xpj-ov.xpj-page .xpj-nav a.on{background:rgba(240,179,120,.12);border-left-color:#f0b378;color:var(--text-main,#fff);font-weight:650}' +
        '#xpj-ov.xpj-page .xpj-nav a small{margin-left:auto;font-size:10.5px;opacity:.55;font-variant-numeric:tabular-nums}' +
        '#xpj-ov.xpj-page .xpj-body{grid-column:2;grid-row:2;overflow-y:auto!important;padding:24px max(28px,calc((100% - 1100px)/2))!important;scroll-behavior:smooth}' +
        '#xpj-ov.xpj-page .xpj-body>section{scroll-margin-top:16px}' +
        '#xpj-ov.xpj-page .xpp-k{font:400 22px/1 Astoria,Georgia,serif;color:#f0b378;margin-right:12px;white-space:nowrap}' +
        '@media (max-width:820px){#xpj-ov.xpj-page .xpj-box{grid-template-columns:1fr!important;grid-template-rows:auto auto minmax(0,1fr)!important}#xpj-ov.xpj-page .xpj-nav{grid-column:1;grid-row:2;flex-direction:row!important;overflow-x:auto!important;border-right:0;border-bottom:1px solid var(--border-color,#333)}#xpj-ov.xpj-page .xpj-nav::before{display:none}#xpj-ov.xpj-page .xpj-body{grid-column:1;grid-row:3}}';
    (document.head || document.documentElement).appendChild(css);
    const filled = sec => { const I = [...sec.querySelectorAll('input:not([type=file]):not([type=checkbox]):not([type=radio]),textarea,select')]; const n = I.filter(i => (i.value || '').trim() && !(i.tagName === 'SELECT' && i.selectedIndex <= 0)).length; return [n, I.length]; };
    function dress(ov) {
        if (ov.classList.contains('xpj-page')) return; ov.classList.add('xpj-page');
        const nav = ov.querySelector('.xpj-nav'), body = ov.querySelector('.xpj-body'); if (!nav || !body) return;
        const A = [...nav.querySelectorAll('a[href^="#xpj-"]')];
        const count = () => A.forEach(a => { const s = body.querySelector(a.getAttribute('href')); if (!s) return; const [n, t] = filled(s); let sm = a.querySelector('small'); if (!t) { if (sm) sm.remove(); return; } if (!sm) { sm = document.createElement('small'); a.appendChild(sm); } const v = n + '/' + t; if (sm.textContent !== v) sm.textContent = v; });
        const spy = () => { let cur = A[0]; const top = body.getBoundingClientRect().top + 60; A.forEach(a => { const s = body.querySelector(a.getAttribute('href')); if (s && s.getBoundingClientRect().top <= top) cur = a; }); if (body.scrollTop + body.clientHeight >= body.scrollHeight - 4) cur = A[A.length - 1]; A.forEach(a => a.classList.toggle('on', a === cur)); };
        body.addEventListener('scroll', spy, { passive: true }); body.addEventListener('input', () => { clearTimeout(body.__xc); body.__xc = setTimeout(count, 300); });
        // titre d'outil dans l'en-tête
        count(); spy();
    }
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.id === 'xpj-ov') dress(n); }))).observe(document.documentElement, { childList: true, subtree: true });
    // accès direct par l'adresse : …#projet
    const fromHash = () => { if (!/^#projet\b/.test(location.hash)) return; let n = 0; const go = () => { if (typeof XPROJET === 'undefined' || !XPROJET.open) { if (++n < 40) setTimeout(go, 200); return; } try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } XPROJET.open(); }; go(); };
    addEventListener('hashchange', fromHash); if (document.readyState === 'loading') addEventListener('DOMContentLoaded', fromHash); else fromHash();
    window.XPROJPAGE = { dress };
})();
