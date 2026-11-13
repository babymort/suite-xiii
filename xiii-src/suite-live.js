// =====================================================================
//  SUITE XIII — XLIVE : mise à jour en direct des widgets de l'accueil (saison 6, phase D)
//  Dès qu'un outil enregistre (autre onglet, onglet de l'espace de travail, ou données arrivées du Drive dans cette page),
//  le Dashboard se redessine — sans recharger — et les widgets dont le contenu a changé s'éclairent brièvement.
//  Aussi : rafraîchissement à minuit (jour courant, échéances) et au retour sur l'accueil après une absence.
// =====================================================================
(function () {
    if (window.XLIVE) return;
    const D = () => (typeof XDASH !== 'undefined' && XDASH.render) ? XDASH : null;
    // clés suivies : données des outils et réglages partagés ; pas les préférences de l'accueil lui-même
    const WATCH = /XIII\.|^xiii\.(projets|annuaire|pcfg|drive|inbox|resume|catalogue|ws)/, SKIP = /^xiii\.(dash\.|calw|wx5|home\.|anim\.|ui\.|tour|ctx\.|mod\.|pins)/;
    const css = document.createElement('style'); css.id = 'xlive-css';
    css.textContent = '#xd-dash .xd-c.xlive{animation:xlivePulse 1.4s ease-out}@keyframes xlivePulse{0%{box-shadow:0 0 0 0 rgba(240,179,120,.0)}18%{box-shadow:0 0 0 2px rgba(240,179,120,.75),0 0 22px rgba(240,179,120,.35)}100%{box-shadow:0 0 0 0 rgba(240,179,120,0)}}' +
        '@media (prefers-reduced-motion:reduce){#xd-dash .xd-c.xlive{animation:none;outline:2px solid rgba(240,179,120,.6);outline-offset:-2px}}';
    (document.head || document.documentElement).appendChild(css);
    const sig = c => (c.textContent || '').replace(/\s+/g, ' ').replace(/\d{1,2}:\d{2}(:\d{2})?/g, '').trim(); // sans les heures qui défilent
    let T = 0;
    function refresh() {
        T = 0; const X = D(); if (!X || document.querySelector('#xwm,#xd-pop,#xd-gal')) { if (X) T = setTimeout(refresh, 1500); return; } // pas pendant un réglage
        const before = new Map([...document.querySelectorAll('#xd-dash .xd-c[data-card]')].map(c => [c.dataset.card, sig(c)]));
        try { X.render(); } catch (e) { return; }
        setTimeout(() => document.querySelectorAll('#xd-dash .xd-c[data-card]').forEach(c => { const b = before.get(c.dataset.card); if (b != null && b !== sig(c)) { c.classList.remove('xlive'); void c.offsetWidth; c.classList.add('xlive'); setTimeout(() => c.classList.remove('xlive'), 1500); } }), 80);
    }
    const soon = () => { if (!T) T = setTimeout(refresh, 450); };
    const hit = k => k && WATCH.test(k) && !SKIP.test(k);
    // 1) autres onglets / outils de l'espace de travail
    addEventListener('storage', e => { if (hit(e.key)) soon(); }); // (storageArea n'est pas comparable dans une page encadrée)
    // 2) écritures dans cette page (données arrivées du Drive, réglages du projet…)
    try { const set0 = Storage.prototype.setItem, rm0 = Storage.prototype.removeItem;
        Storage.prototype.setItem = function (k, v) { const r = set0.apply(this, arguments); if (this === localStorage && hit(k)) soon(); return r; };
        Storage.prototype.removeItem = function (k) { const r = rm0.apply(this, arguments); if (this === localStorage && hit(k)) soon(); return r; }; } catch (e) { }
    // 3) retour sur l'accueil après une absence, et minuit
    let hidAt = 0; document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') hidAt = Date.now(); else if (hidAt && Date.now() - hidAt > 60e3) soon(); });
    (function midnight() { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 5); setTimeout(() => { soon(); midnight(); }, m - n); })();
    window.XLIVE = { refresh };
})();
