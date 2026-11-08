// =====================================================================
//  SUITE XIII — XHOME6 : accueil épuré (saison 6, phase A)
//  Grand logo plus discret, tableau de bord en grille régulière, outils en liste compacte :
//  icône, nom, rôle, dernière modification. Bouton ☰ Liste / ▦ Tuiles (retenu sur cet appareil).
// =====================================================================
(function () {
    if (window.XHOME6 || XIII_APP !== 'index') return;
    const K = 'xiii.home.view', list = () => { try { return localStorage.getItem(K) === 'list'; } catch (e) { return false; } }; // tuiles par défaut, liste réduite en option (⚙️)
    const ago = t => { if (!t) return 'jamais ouvert'; const d = Date.now() - t, m = 6e4, h = 36e5, j = 864e5; if (d < h) return 'il y a ' + Math.max(1, Math.round(d / m)) + ' min'; if (d < j) return 'il y a ' + Math.round(d / h) + ' h'; if (d < 7 * j) return 'il y a ' + Math.round(d / j) + ' j'; return 'le ' + new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
    const css = 'html body .title-row{min-height:0!important;padding:6px 0 0!important;margin-bottom:6px!important}html body .hero-logo,html body #ui-title{max-height:92px!important;height:auto!important;width:auto!important}html body .hero-logo img,html body .hero-logo svg{max-height:92px!important;width:auto!important}' +
        'html body #xd-dash .xd-g{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important;grid-auto-rows:minmax(84px,auto);gap:10px!important}html body #xd-dash .xd-c{width:auto!important;margin:0!important;break-inside:avoid}' +
        // liste compacte
        'html.xh6-list body .phase .grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(340px,1fr))!important;gap:6px 10px!important}' +
        'html.xh6-list body .phase .card{min-height:0!important;height:auto!important;padding:8px 12px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:10px}' +
        'html.xh6-list body .phase .card>:not(.card-top):not(.xh6-mod){display:none!important}html.xh6-list body .phase .card .card-top{flex:1;margin:0!important;min-width:0}html.xh6-list body .phase .card .card-icon{width:32px!important;height:32px!important;font-size:18px!important}' +
        'html.xh6-list body .phase .card .card-name{font-size:14px!important}html.xh6-list body .phase .card .card-role{font-size:11px!important}html.xh6-list body .phase .card .card-ver{display:none!important}' +
        // outils épinglés : toujours en version réduite
        'html body #xpin .grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(340px,1fr))!important;gap:6px 10px!important}' +
        'html body #xpin .card{min-height:0!important;height:auto!important;padding:8px 12px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:10px}' +
        'html body #xpin .card>:not(.card-top):not(.xh6-mod){display:none!important}html body #xpin .card .card-top{flex:1;margin:0!important;min-width:0}html body #xpin .card .card-icon{width:32px!important;height:32px!important;font-size:18px!important}' +
        'html body #xpin .card .card-name{font-size:14px!important}html body #xpin .card .card-role{font-size:11px!important}html body #xpin .card .card-ver{display:none!important}' +
        '.xh6-mod{font-size:11px;color:var(--text-dim,#999);white-space:nowrap;font-variant-numeric:tabular-nums}html:not(.xh6-list) .phase .xh6-mod{display:none}' +
        'html.xh6-list body .phase-head{padding:6px 0!important;min-height:0!important}html.xh6-list body .phase-name{font-size:18px!important}html.xh6-list body .phase{margin-bottom:14px!important}' +
        '';
    function mod() { document.querySelectorAll('.phase .card[href],#xpin .card[href]').forEach(c => { const a = (c.getAttribute('href') || '').replace(/\.html.*$/, ''); let t = 0; try { t = +localStorage.getItem('xiii.mod.' + a) || 0; } catch (e) { } let s = c.querySelector(':scope > .xh6-mod'); if (!s) { s = document.createElement('span'); s.className = 'xh6-mod'; c.appendChild(s); } const v = ago(t); if (s.textContent !== v) s.textContent = v; s.title = t ? 'Dernière modification : ' + new Date(t).toLocaleString('fr-FR') : ''; }); }
    function sw() { const pan = document.getElementById('xs-panel'); if (!pan || document.getElementById('xh6-sw')) return; const seg = pan.querySelector('[data-xtm],[data-theme]'); const box = seg ? (seg.closest('.xs-f') || seg.parentNode) : null; if (!box) return; const row = document.createElement('div'); row.className = 'xs-f'; row.innerHTML = '<label style="display:block;margin:10px 0 6px">Outils de l\'accueil</label>'; const d = document.createElement('div'); d.id = 'xh6-sw'; d.className = 'xs-seg'; d.innerHTML = '<button type="button" data-v="tiles">▦ Tuiles</button><button type="button" data-v="list">☰ Liste réduite</button>'; row.appendChild(d); box.after(row); d.onclick = e => { const v = (e.target.closest('[data-v]') || {}).dataset ? e.target.closest('[data-v]').dataset.v : null; if (!v) return; try { localStorage.setItem(K, v); } catch (x) { } apply(); }; }
    function apply() { document.documentElement.classList.toggle('xh6-list', list()); const d = document.getElementById('xh6-sw'); if (d) d.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.v === 'list') === list())); }
    const s = document.createElement('style'); s.id = 'xh6-css'; s.textContent = css; document.head.appendChild(s); apply();
    const go = () => { mod(); apply(); }; addEventListener('load', () => setTimeout(go, 300)); setTimeout(go, 1500); setInterval(mod, 60000);
    new MutationObserver(() => { if (document.getElementById('xs-panel') && !document.getElementById('xh6-sw')) { sw(); apply(); } }).observe(document.body || document.documentElement, { childList: true, subtree: true });
    window.XHOME6 = { apply };
})();
