// SUITE XIII — module commun. Source : xiii-src/suite-density.js
// =====================================================================
//  SUITE XIII — XDENSE : densité réglable (saison 6, phase A)
//  ⚙️ › Affichage › Densité : Confortable (comme avant) ou Compact — barres, lignes de tableaux, listes et marges resserrées
//  pour voir plus de lignes à l'écran (DEVISO, CONDUCO, PACKINGO…). Un seul réglage pour toute la suite, sur cet appareil.
// =====================================================================
(function () {
    if (window.XDENSE) return;
    const K = 'xiii.ux.density', R = document.documentElement;
    const on = () => { try { return localStorage.getItem(K) === 'compact'; } catch (e) { return false; } };
    const D = 'html.xdense body';
    const css = '@media (min-width:900px){html.xdense body:not(.xm) #top-bar{height:40px!important;min-height:40px!important}html.xdense body:not(.xm) #toolbar{height:40px!important;min-height:40px!important}}' +
        D + ' #top-bar button,' + D + ' #toolbar button{height:26px!important;min-height:26px!important;min-width:28px!important}' + D + ' #toolbar select,' + D + ' #toolbar input:not([type=checkbox]):not([type=radio]){height:26px!important;min-height:26px!important;padding-top:0!important;padding-bottom:0!important}' +
        D + ' td,' + D + ' th{padding-top:3px!important;padding-bottom:3px!important}' +
        D + ' #content,' + D + ' #view-area,' + D + ' #workspace{line-height:1.3}' +
        D + ' .item,' + D + ' .row,' + D + ' .line,' + D + ' .ln,' + D + ' .it,' + D + ' .crate,' + D + ' .card-b>div,' + D + ' #library-panel li,' + D + ' #library-panel .lib-item{padding-top:3px!important;padding-bottom:3px!important;min-height:0!important;flex-shrink:0!important}' +
        D + ' .card,' + D + ' .panel,' + D + ' section{margin-bottom:8px}' + D + ' .card-h{padding-top:6px!important;padding-bottom:6px!important}' +
        D + ' input:not([type=checkbox]):not([type=radio]):not([type=range]),' + D + ' select{min-height:26px!important;padding-top:2px!important;padding-bottom:2px!important}';
    const s = document.createElement('style'); s.id = 'xdense-css'; s.textContent = css; (document.head || R).appendChild(s);
    function apply() { R.classList.toggle('xdense', on()); const d = document.getElementById('xdense-sw'); if (d) d.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.v === 'compact') === on())); try { dispatchEvent(new Event('resize')); } catch (e) { } }
    function sw() {
        const pan = document.getElementById('xs-panel'); if (!pan || document.getElementById('xdense-sw')) return;
        const seg = pan.querySelector('[data-xtm],[data-theme]'); const box = seg ? (seg.closest('.xs-f') || seg.parentNode) : null; if (!box) return;
        const row = document.createElement('div'); row.className = 'xs-f'; row.innerHTML = '<label style="display:block;margin:10px 0 6px">Densité</label>';
        const d = document.createElement('div'); d.id = 'xdense-sw'; d.className = 'xs-seg'; d.innerHTML = '<button type="button" data-v="confort">Confortable</button><button type="button" data-v="compact">Compact</button>';
        d.onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; try { localStorage.setItem(K, b.dataset.v); } catch (x) { } apply(); };
        row.appendChild(d); (document.getElementById('xh6-sw') ? document.getElementById('xh6-sw').closest('.xs-f') : box).after(row); apply();
    }
    apply(); addEventListener('storage', e => { if (e.key === K) apply(); });
    const go = () => new MutationObserver(() => { if (document.getElementById('xs-panel') && !document.getElementById('xdense-sw')) sw(); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XDENSE = { apply };
})();
