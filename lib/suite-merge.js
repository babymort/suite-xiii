// SUITE XIII — module commun. Source : xiii-src/suite-merge.js
// =====================================================================
//  SUITE XIII — XMERGE (saison 6) : CATALOGUE est un onglet de MATOS, IMPORTO un bouton de la fiche projet.
//  Les anciennes adresses (favoris, liens partagés, onglets) arrivent au bon endroit :
//  catalogue.html → matos.html#vue=cat · importo.html → accueil, fiche projet, « 📥 Importer d'un logiciel ».
// =====================================================================
(function () {
    const APPX = XIII_APP, h = location.hash || '';
    if (APPX === 'matos') { const m = /[#&]vue=(\w+)/.exec(h); if (m) { const go = (n) => { if (typeof setView === 'function' && document.querySelector('#view-group [data-view="' + m[1] + '"]')) { setView(m[1]); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } } else if ((n || 0) < 30) setTimeout(() => go((n || 0) + 1), 200); }; setTimeout(go, 300); } }
    if (APPX === 'index' && /[#&]ximport\b/.test(h)) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
        let n = 0; const go = () => { if (typeof XPROJET === 'undefined' || !XPROJET.open) { if (++n < 40) setTimeout(go, 250); return; } XPROJET.open(); let k = 0; const clk = () => { const b = document.getElementById('xpj-importo'); if (b) b.click(); else if (++k < 30) setTimeout(clk, 150); }; setTimeout(clk, 250); }; setTimeout(go, 800); }
    // accueil : court champ de recherche en haut à gauche, qui ouvre la même recherche que Ctrl + K
    if (APPX === 'index') { const mk = () => { if (document.getElementById('xh-find') || window.top !== window && !/espace\.html?$/.test((() => { try { return parent.location.pathname; } catch (e) { return ''; } })())) return; if (typeof XFIND === 'undefined') { setTimeout(mk, 300); return; }
        const st = document.createElement('style'); st.textContent = '#xh-find{position:absolute;z-index:40;top:16px;left:calc(var(--xh-w,200px) + 52px);display:flex;align-items:center;gap:8px;width:250px;height:36px;padding:0 10px 0 12px;box-sizing:border-box;border-radius:10px;border:1px solid var(--border-color,#444);background:var(--bg-panel,#2b2b2b);color:var(--text-dim,#999);font:13.5px system-ui,"Segoe UI",sans-serif;cursor:text}#xh-find:hover{border-color:rgba(240,179,120,.6);color:var(--text-main,#eee)}#xh-find span{flex:1;text-align:left}#xh-find kbd{font:600 11px system-ui;padding:2px 6px;border-radius:5px;border:1px solid var(--border-color,#555);color:var(--text-dim,#999)}body.xh #ui-title{margin-top:38px}@media (max-width:860px){#xh-find{left:16px;top:12px;width:calc(100% - 140px)}}';
        document.head.appendChild(st); const b = document.createElement('button'); b.id = 'xh-find'; b.type = 'button'; b.title = 'Rechercher un outil, un élément, une personne, une action (Ctrl K)'; b.innerHTML = '<span>🔎 Rechercher…</span><kbd>Ctrl K</kbd>'; b.onclick = () => XFIND.open(); document.body.appendChild(b); };
        setTimeout(mk, 600); }
})();
