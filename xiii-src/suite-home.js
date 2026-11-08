// =====================================================================
//  SUITE XIII — XHOME6 : accueil épuré (saison 6, phase A)
//  Grand logo plus discret, tableau de bord en grille régulière, outils en liste compacte :
//  icône, nom, rôle, dernière modification. Bouton ☰ Liste / ▦ Tuiles (retenu sur cet appareil).
// =====================================================================
(function () {
    if (window.XHOME6 || XIII_APP !== 'index') return;
    const K = 'xiii.home.view', list = () => { try { return localStorage.getItem(K) !== 'tiles'; } catch (e) { return true; } };
    const ago = t => { if (!t) return 'jamais ouvert'; const d = Date.now() - t, m = 6e4, h = 36e5, j = 864e5; if (d < h) return 'il y a ' + Math.max(1, Math.round(d / m)) + ' min'; if (d < j) return 'il y a ' + Math.round(d / h) + ' h'; if (d < 7 * j) return 'il y a ' + Math.round(d / j) + ' j'; return 'le ' + new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
    const css = 'html body .title-row{min-height:0!important;padding:6px 0 0!important;margin-bottom:6px!important}html body .hero-logo,html body #ui-title{max-height:92px!important;height:auto!important;width:auto!important}html body .hero-logo img,html body .hero-logo svg{max-height:92px!important;width:auto!important}' +
        'html body #xd-dash .xd-g{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;grid-auto-rows:minmax(84px,auto);gap:10px!important}html body #xd-dash .xd-c{width:auto!important;margin:0!important;break-inside:avoid}' +
        // liste compacte
        'html.xh6-list body .phase .grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(340px,1fr))!important;gap:6px 10px!important}' +
        'html.xh6-list body .phase .card{min-height:0!important;height:auto!important;padding:8px 12px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:10px}' +
        'html.xh6-list body .phase .card>:not(.card-top):not(.xh6-mod){display:none!important}html.xh6-list body .phase .card .card-top{flex:1;margin:0!important;min-width:0}html.xh6-list body .phase .card .card-icon{width:32px!important;height:32px!important;font-size:18px!important}' +
        'html.xh6-list body .phase .card .card-name{font-size:14px!important}html.xh6-list body .phase .card .card-role{font-size:11px!important}html.xh6-list body .phase .card .card-ver{display:none!important}' +
        '.xh6-mod{font-size:11px;color:var(--text-dim,#999);white-space:nowrap;font-variant-numeric:tabular-nums}html:not(.xh6-list) .xh6-mod{display:none}' +
        'html.xh6-list body .phase-head{padding:6px 0!important;min-height:0!important}html.xh6-list body .phase-name{font-size:18px!important}html.xh6-list body .phase{margin-bottom:14px!important}' +
        '#xh6-sw{margin-left:auto;display:inline-flex;gap:2px;padding:2px;border:1px solid var(--border-color,#444);border-radius:9px}#xh6-sw button{all:unset;cursor:pointer;padding:4px 10px;border-radius:7px;font-size:12.5px}#xh6-sw button.on{background:rgba(240,179,120,.18);color:rgb(240,179,120)}';
    function mod() { document.querySelectorAll('.phase .card[href]').forEach(c => { const a = (c.getAttribute('href') || '').replace(/\.html.*$/, ''); let t = 0; try { t = +localStorage.getItem('xiii.mod.' + a) || 0; } catch (e) { } let s = c.querySelector(':scope > .xh6-mod'); if (!s) { s = document.createElement('span'); s.className = 'xh6-mod'; c.appendChild(s); } const v = ago(t); if (s.textContent !== v) s.textContent = v; s.title = t ? 'Dernière modification : ' + new Date(t).toLocaleString('fr-FR') : ''; }); }
    function sw() { const h = document.querySelector('.phase .phase-head'); if (!h || document.getElementById('xh6-sw')) return; const d = document.createElement('div'); d.id = 'xh6-sw'; d.innerHTML = '<button data-v="list">☰ Liste</button><button data-v="tiles">▦ Tuiles</button>'; h.style.display = 'flex'; h.style.alignItems = 'center'; h.appendChild(d); d.onclick = e => { const v = e.target.dataset.v; if (!v) return; try { localStorage.setItem(K, v); } catch (x) { } apply(); }; }
    function apply() { document.documentElement.classList.toggle('xh6-list', list()); const d = document.getElementById('xh6-sw'); if (d) d.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.v === 'list') === list())); }
    const s = document.createElement('style'); s.id = 'xh6-css'; s.textContent = css; document.head.appendChild(s); apply();
    const go = () => { sw(); mod(); apply(); }; addEventListener('load', () => setTimeout(go, 300)); setTimeout(go, 1500); setInterval(mod, 60000);
    window.XHOME6 = { apply };
})();
