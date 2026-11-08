// SUITE XIII — module commun. Source : xiii-src/suite-trayopt.js
// =====================================================================
//  SUITE XIII — XTRAYOPT : afficher / masquer le panier 🧺 (saison 6, retour du 08/11)
//  Il n'existait aucun réglage pour le panier : la languette 🧺 restait toujours là.
//  Interrupteur « Afficher le panier 🧺 » dans ⚙️ (sous les animations), pour toute la suite (clé xiii.tray.show).
// =====================================================================
(function () {
    if (window.XTRAYOPT) return;
    const K = 'xiii.tray.show', R = document.documentElement;
    const on = () => { try { return localStorage.getItem(K) !== '0'; } catch (e) { return true; } };
    const st = document.createElement('style'); st.id = 'xtrayopt-css';
    st.textContent = 'html.xtray-off #xt-tab,html.xtray-off #xt-panel,html.xtray-off #xt-zone,html.xtray-off #xt-pop{display:none!important}';
    (document.head || R).appendChild(st);
    function apply() { R.classList.toggle('xtray-off', !on()); const i = document.querySelector('[data-xtrayopt]'); if (i) i.checked = on(); }
    function row() {
        const pan = document.getElementById('xs-panel'); if (!pan || pan.querySelector('[data-xtrayopt]')) return;
        const ref = pan.querySelector('[data-xreddash],[data-xred]'), after = ref && ref.closest('.xs-f'); if (!after) return;
        const d = document.createElement('div'); d.className = 'xs-f';
        d.innerHTML = '<label>Afficher le panier 🧺<small>La languette sur le bord droit pour glisser des éléments d’un outil à l’autre. Pour toute la suite.</small></label><div class="xs-c"><label class="xs-sw"><input type="checkbox" data-xtrayopt' + (on() ? ' checked' : '') + '><span></span></label></div>';
        d.querySelector('input').onchange = e => { try { localStorage.setItem(K, e.target.checked ? '1' : '0'); } catch (x) { } apply(); };
        after.after(d);
    }
    apply(); addEventListener('storage', e => { if (e.key === K) apply(); });
    const go = () => new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XTRAYOPT = { apply };
})();
