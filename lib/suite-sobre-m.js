// SUITE XIII — module commun. Source : xiii-src/suite-sobre-m.js
// =====================================================================
//  SUITE XIII — XSOBREM : thèmes ◼️ Sobre et ◻️ Sobre clair sur téléphone (saison 6, phase A)
//  Les 22 pages téléphone (-m) et l'app équipe (equipe.html, team.html) suivent le thème choisi dans ⚙️ › Affichage :
//  à plat, traits fins, aucune transparence ni lueur, couleurs de la suite. Chargé dans <head> : pas d'éclair au chargement.
// =====================================================================
(function () {
    var R = document.documentElement, m = '';
    var D = { bg: '#0e0f12', p1: '#121317', p2: '#16171b', p3: '#1c1d22', l1: '#1f2126', l2: '#2a2c32', t: '#ececee', mu: '#a3a6ad', di: '#858991', a: '#ff8a3d', at: '#ff9d5c', cs: 'dark' };
    var L = { bg: '#f6f5f2', p1: '#ffffff', p2: '#f1efeb', p3: '#e9e6e0', l1: '#e4e1db', l2: '#d5d1c9', t: '#1b1c1f', mu: '#555960', di: '#6d7178', a: '#c2570c', at: '#a8480a', cs: 'light' };
    function vars(c) {
        return 'color-scheme:' + c.cs + ';--bg:' + c.bg + ';--panel:' + c.p1 + ';--panel2:' + c.p2 + ';--line:' + c.l2 + ';--fg:' + c.t + ';--dim:' + c.di + ';--acc:' + c.a + ';' +
            '--bg-main:' + c.bg + ';--bg-panel:' + c.p1 + ';--bg-panel-alt:' + c.p1 + ';--bg-header:' + c.bg + ';--bg-topbar:' + c.bg + ';--bg-input:' + c.p2 + ';--bg-menu:' + c.p1 + ';' +
            '--glass:' + c.p1 + ';--glass2:' + c.p1 + ';--gline:' + c.l2 + ';--glow:transparent;--border-color:' + c.l2 + ';--border-soft:' + c.l1 + ';--text-main:' + c.t + ';--text-muted:' + c.mu + ';--text-dim:' + c.di + ';--row-bg:transparent;--row-alt:transparent;--accent-text:' + c.at + ';--accent:' + (c.cs === 'dark' ? '255,138,61' : '194,87,12') + ';';
    }
    var X = 'html.xsobre:not(#xs0)', B = X + ' body:not(#xs1)';
    var css = X + ',' + B + '{' + vars(D) + '}' + 'html.xsobre.xsobrel:not(#xs0),html.xsobre.xsobrel:not(#xs0) body:not(#xs1){' + vars(L) + '}' +
        B + '{background:var(--bg-main)!important;background-image:none!important;color:var(--text-main)}' +
        X + ' *,' + X + ' *::before,' + X + ' *::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;text-shadow:none!important}' +
        X + ' button,' + X + ' .btn,' + X + ' [role=button],' + X + ' header,' + X + ' nav,' + X + ' .card,' + X + ' .tool,' + X + ' .tile{background-image:none!important;box-shadow:none!important;filter:none!important}' +
        X + ' button,' + X + ' .btn{border:1px solid var(--border-color)!important;border-radius:8px!important}' +
        X + ' .card,' + X + ' .tool,' + X + ' .tile,' + X + ' section,' + X + ' .box{border-color:var(--border-color)!important}' +
        X + ' input:not([type=checkbox]):not([type=radio]):not([type=range]),' + X + ' select,' + X + ' textarea{background:var(--bg-input)!important;border:1px solid var(--border-color)!important;color:var(--text-main)!important;box-shadow:none!important}' +
        X + ' header,' + X + ' #tb{background:var(--bg-main)!important;border-bottom:1px solid var(--border-color)!important}' +
        X + ' .pri,' + X + ' button.primary{background-color:var(--acc)!important;border-color:var(--acc)!important;color:#140a03!important}html.xsobre.xsobrel:not(#xs0) .pri,html.xsobre.xsobrel:not(#xs0) button.primary{color:#fff!important}' +
        X + ' h1,' + X + ' h2,' + X + ' h3{text-shadow:none!important;background-image:none!important;-webkit-text-fill-color:currentColor!important}';
    var s = document.createElement('style'); s.id = 'xsobrem-css'; s.textContent = css; (document.head || R).appendChild(s);
    function apply() {
        try { m = localStorage.getItem('xiii.theme.mode') || ''; } catch (e) { m = ''; }
        var on = m === 'sobre' || m === 'sobrec'; R.classList.toggle('xsobre', on); R.classList.toggle('xsobrel', m === 'sobrec');
        var meta = document.querySelector('meta[name=theme-color]'); if (meta && on) meta.content = m === 'sobrec' ? L.bg : D.bg;
    }
    // 🌓 du menu ⋯ des pages téléphone : Sombre → Clair → ◼️ Sobre → ◻️ Sobre clair (même réglage que ⚙️ › Thème sur ordinateur)
    function cycle() {
        var cur = ''; try { cur = localStorage.getItem('xiii.theme.mode') || ''; } catch (e) { }
        if (!cur) { try { cur = (JSON.parse(localStorage.getItem('hubXIII.prefs')) || {}).theme === 'light' ? 'light' : 'dark'; } catch (e) { cur = 'dark'; } }
        var O = ['dark', 'light', 'sobre', 'sobrec'], nx = O[(O.indexOf(cur) + 1) % O.length], base = nx === 'light' || nx === 'sobrec' ? 'light' : 'dark';
        try { localStorage.setItem('xiii.theme.mode', nx); var p = JSON.parse(localStorage.getItem('hubXIII.prefs') || '{}') || {}; p.theme = base; localStorage.setItem('hubXIII.prefs', JSON.stringify(p)); } catch (e) { }
        apply(); return { mode: nx, label: { dark: '🌙 Sombre', light: '☀️ Clair', sobre: '◼️ Sobre', sobrec: '◻️ Sobre clair' }[nx] };
    }
    apply(); addEventListener('storage', function (e) { if (!e.key || e.key === 'xiii.theme.mode') apply(); });
    window.XSOBREM = { apply: apply, cycle: cycle };
})();
