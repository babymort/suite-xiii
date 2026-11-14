// SUITE XIII — module commun. Source : xiii-src/suite-reglpage.js
// =====================================================================
//  SUITE XIII — XREGLPAGE : « Réglages du projet » en page d'outil (saison 6, phase X)
//  Même interface que PROJET XIII, TEAM et DRIVE : barre de titre + sélecteur Projet · Drive · Team · Réglages,
//  volet de rubriques à gauche, réglages au centre (une ligne par réglage, bouton « Ouvrir »).
//  Les réglages viennent des tuiles de la section « Réglages du projet » de l'accueil : mêmes actions, rien de dupliqué.
//  Accès : index.html#reglages, ou le bouton « Ouvrir en page » de la section.
// =====================================================================
(function () {
    if (window.XREGLPAGE) return;
    const GROUPS = [['projet', '🎬', 'Projet', /^projet|scénario|cohérence|charte/i], ['donnees', '☁️', 'Données', /drive|sauvegarde/i], ['connexions', '🔗', 'Connexions', /intelligence|automatisation/i], ['apparence', '🎨', 'Apparence', /thème|barres|accueil|couleur|raccourci/i], ['install', '📲', 'Installation', /install/i]];
    const EXTRA = [['🧩', 'Barres à la carte', 'Ordre des secteurs, favoris, boutons masqués', () => window.XBARCFG && XBARCFG.open()], ['🏠', 'Accueil sur mesure', 'Sections, ordre et widgets de l\'accueil', () => window.XHOMECFG && XHOMECFG.open()], ['⌨️', 'Raccourcis clavier', 'Changer les touches, profils de touches', () => window.XKMAP && XKMAP.open()], ['🖌️', 'Thème perso', 'Couleurs de fond, de texte et d\'accent', () => window.XCTHEME && XCTHEME.open()]];
    const PAGES = [['projet', '🎬', 'Projet', 'index.html#projet'], ['drive', '☁️', 'Drive', 'drive.html'], ['team', '👥', 'Team', 'team.html'], ['reglages', '⚙️', 'Réglages', 'index.html#reglages']];
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const css = document.createElement('style'); css.id = 'xreglpage-css';
    css.textContent =
        '#xrg-ov{position:fixed;inset:0;z-index:900;display:grid;grid-template-columns:240px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);background:var(--bg-main,#141416);color:var(--text-main,#eee);animation:xrgIn .22s cubic-bezier(.2,.7,.2,1)}@keyframes xrgIn{from{opacity:0;transform:translateY(6px)}}' +
        '#xrg-ov>header{grid-column:1/-1;display:flex;align-items:center;gap:14px;padding:10px 170px 10px 18px;background:var(--bg-topbar,var(--bg-panel,#1c1c20));border-bottom:1px solid var(--border-color,#333)}' +
        '#xrg-ov>header h1{font:400 26px/1 Astoria,Georgia,serif;letter-spacing:.02em;margin:0;color:#f0b378;white-space:nowrap}#xrg-ov .xrg-x{background:none;border:0;color:inherit;font-size:20px;cursor:pointer;padding:4px}' +
        '#xrg-ov .xmg-sw{display:flex;gap:4px;margin-left:auto;padding:3px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--border-color,#333)}#xrg-ov .xmg-sw a{display:flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:9px;color:inherit;text-decoration:none;font:600 13px system-ui,sans-serif;opacity:.75}#xrg-ov .xmg-sw a:hover{opacity:1;background:rgba(255,255,255,.06)}#xrg-ov .xmg-sw a.on{opacity:1;background:rgba(240,179,120,.18);color:#f6c79a}' +
        '#xrg-ov nav{grid-column:1;grid-row:2;display:flex;flex-direction:column;gap:2px;padding:14px 10px;overflow-y:auto;border-right:1px solid var(--border-color,#333);background:var(--bg-panel,#1a1a1e)}#xrg-ov nav::before{content:"Rubriques";display:block;font:700 10.5px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.5;padding:4px 10px 8px}' +
        '#xrg-ov nav button{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:9px 10px;border-radius:9px;border:0;border-left:3px solid transparent;background:transparent;color:inherit;font:500 13.5px system-ui,sans-serif;cursor:pointer}#xrg-ov nav button:hover{background:rgba(255,255,255,.05)}#xrg-ov nav button.on{background:rgba(240,179,120,.12);border-left-color:#f0b378;font-weight:650}#xrg-ov nav small{margin-left:auto;opacity:.5;font-size:10.5px}' +
        '#xrg-ov .xrg-b{grid-column:2;grid-row:2;overflow-y:auto;padding:24px max(28px,calc((100% - 900px)/2));scroll-behavior:smooth;padding-bottom:90px}#xrg-ov section{scroll-margin-top:16px;margin-bottom:28px}#xrg-ov section h2{font:600 15px system-ui,sans-serif;margin:0 0 10px;opacity:.85}' +
        '#xrg-ov .xrg-r{display:flex;align-items:center;gap:14px;padding:12px 14px;border:1px solid var(--border-color,#333);border-radius:12px;background:var(--bg-panel,#1a1a1e);margin-bottom:8px}#xrg-ov .xrg-r .i{font-size:22px;width:30px;text-align:center}#xrg-ov .xrg-r div{flex:1;min-width:0}#xrg-ov .xrg-r b{display:block;font:600 14px system-ui,sans-serif}#xrg-ov .xrg-r small{display:block;opacity:.65;font-size:12.5px;margin-top:2px}#xrg-ov .xrg-r em{display:block;font-style:normal;font-size:11.5px;color:#ef9a9a;margin-top:2px}' +
        '#xrg-ov .xrg-r button{flex:none;padding:7px 14px;border-radius:9px;border:1px solid rgba(240,179,120,.45);background:rgba(240,179,120,.12);color:#f6c79a;font:600 12.5px system-ui,sans-serif;cursor:pointer}#xrg-ov .xrg-r button:hover{background:rgba(240,179,120,.24)}' +
        'body.light-theme #xrg-ov .xmg-sw a.on,body.light-theme #xrg-ov .xrg-r button{color:#9a5a1c}' +
        '#xh-set .xrg-open{float:right;margin-top:-34px;padding:6px 12px;border-radius:9px;border:1px solid var(--xh-line,#444);background:var(--xh-glass,rgba(255,255,255,.04));color:inherit;font:600 12.5px system-ui,sans-serif;cursor:pointer}' +
        '@media (max-width:820px){#xrg-ov{grid-template-columns:1fr;grid-template-rows:auto auto minmax(0,1fr)}#xrg-ov nav{grid-row:2;flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--border-color,#333)}#xrg-ov nav::before{display:none}#xrg-ov .xrg-b{grid-column:1;grid-row:3}#xrg-ov .xmg-sw a span{display:none}}';
    (document.head || document.documentElement).appendChild(css);
    function rows() {
        const sec = document.getElementById('xh-set'); const R = [];
        if (sec) sec.querySelectorAll('.xh-t[data-k]').forEach(b => { const q = s => (b.querySelector(s) || {}).textContent || ''; R.push({ i: q('.i'), t: q('b'), s: q('small'), w: q('em'), fn: () => b.click() }); });
        EXTRA.forEach(e => { if (!R.some(r => r.t === e[1])) R.push({ i: e[0], t: e[1], s: e[2], w: '', fn: e[3] }); });
        return R;
    }
    function close() { const o = document.getElementById('xrg-ov'); if (o) o.remove(); document.documentElement.style.overflow = ''; }
    function open() {
        close(); const R = rows(); const seen = new Set(); const G = GROUPS.map(g => [g, R.filter(r => { if (seen.has(r) || !g[3].test(r.t)) return false; seen.add(r); return true; })]); const used = new Set(G.flatMap(x => x[1]));
        const rest = R.filter(r => !used.has(r)); if (rest.length) G.push([['autres', '🧰', 'Autres'], rest]);
        const L = G.filter(x => x[1].length);
        const o = document.createElement('div'); o.id = 'xrg-ov'; let n = 0; const F = [];
        o.innerHTML = '<header><button class="xrg-x" title="Retour à l\'accueil (Échap)">🏠</button><h1>Réglages du projet</h1><div class="xmg-sw">' + PAGES.map(p => '<a href="' + p[3] + '" class="' + (p[0] === 'reglages' ? 'on' : '') + '" data-p="' + p[0] + '" title="' + p[2] + '">' + p[1] + '<span>' + p[2] + '</span></a>').join('') + '</div></header>' +
            '<nav>' + L.map(x => '<button type="button" data-g="' + x[0][0] + '">' + x[0][1] + ' ' + x[0][2] + '<small>' + x[1].length + '</small></button>').join('') + '</nav>' +
            '<div class="xrg-b">' + L.map(x => '<section id="xrg-' + x[0][0] + '"><h2>' + x[0][1] + ' ' + x[0][2] + '</h2>' + x[1].map(r => { F.push(r.fn); return '<div class="xrg-r"><span class="i">' + esc(r.i) + '</span><div><b>' + esc(r.t) + '</b><small>' + esc(r.s) + '</small>' + (r.w ? '<em>' + esc(r.w) + '</em>' : '') + '</div><button type="button" data-f="' + (n++) + '">Ouvrir</button></div>'; }).join('') + '</section>').join('') + '</div>';
        document.body.appendChild(o);
        const body = o.querySelector('.xrg-b'), B = [...o.querySelectorAll('nav button')];
        o.querySelector('.xrg-x').onclick = close;
        o.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { try { F[+b.dataset.f](); } catch (e) { } });
        o.querySelectorAll('.xmg-sw a').forEach(a => a.onclick = ev => { if (a.dataset.p === 'reglages') { ev.preventDefault(); return; } if (a.dataset.p === 'projet') { ev.preventDefault(); close(); if (window.XPROJET) XPROJET.open(); } });
        B.forEach(b => b.onclick = () => { body.__lock = Date.now(); B.forEach(x => x.classList.toggle('on', x === b)); const s = o.querySelector('#xrg-' + b.dataset.g); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        const spy = () => { if (Date.now() - (body.__lock || 0) < 900) return; let cur = B[0]; const top = body.getBoundingClientRect().top + 60; B.forEach(b => { const s = o.querySelector('#xrg-' + b.dataset.g); if (s && s.getBoundingClientRect().top <= top) cur = b; }); if (body.scrollTop + body.clientHeight >= body.scrollHeight - 4) cur = B[B.length - 1]; B.forEach(b => b.classList.toggle('on', b === cur)); };
        body.addEventListener('scroll', spy, { passive: true }); spy();
    }
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xrg-ov') && !document.querySelector('.xd-ov,[role=dialog]:not(#xrg-ov)')) close(); });
    // bouton « Ouvrir en page » dans la section de l'accueil (la section est reconstruite : on le remet à chaque fois)
    const addBtn = () => { const s = document.getElementById('xh-set'); if (!s || s.querySelector('.xrg-open')) return; const h = s.querySelector('.xh-sub') || s.querySelector('h2'); if (!h) return; const b = document.createElement('button'); b.className = 'xrg-open'; b.type = 'button'; b.textContent = '⚙️ Ouvrir en page'; b.onclick = open; h.after(b); };
    new MutationObserver(addBtn).observe(document.documentElement, { childList: true, subtree: true });
    const fromHash = () => { if (!/^#reglages\b/.test(location.hash)) return; let n = 0; const go = () => { if (!document.getElementById('xh-set') && ++n < 40) return setTimeout(go, 200); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } open(); }; go(); };
    addEventListener('hashchange', fromHash); if (document.readyState === 'loading') addEventListener('DOMContentLoaded', fromHash); else fromHash();
    window.XREGLPAGE = { open, close };
})();
