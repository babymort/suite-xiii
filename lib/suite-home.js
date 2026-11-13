// SUITE XIII — module commun. Source : xiii-src/suite-home.js
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
        /* outils fusionnés (CATALOGUE → MATOS, IMPORTO → fiche projet, PLANNO → CALENDRIER) : jamais en tuile */'html body a.card[data-merged]{display:none!important}' +
        'html body #xpin .grid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(340px,1fr))!important;gap:6px 10px!important}' +
        'html body #xpin .card{min-height:0!important;height:auto!important;padding:8px 12px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:10px}' +
        'html body #xpin .card>:not(.card-top):not(.xh6-mod){display:none!important}html body #xpin .card .card-top{flex:1;margin:0!important;min-width:0}html body #xpin .card .card-icon{width:32px!important;height:32px!important;font-size:18px!important}' +
        'html body #xpin .card .card-name{font-size:14px!important}html body #xpin .card .card-role{font-size:11px!important}html body #xpin .card .card-ver{display:none!important}' +
        /* DOSSIER (carte « wide final ») : demi-tuile comme les autres une fois épinglé */'html body #xpin .card.wide,html body #xpin .card.final{grid-column:auto!important;width:auto!important;max-width:none!important}html body #xpin .final-tag{display:none!important}html body #xpin .card.final .card-top{flex-direction:row!important;justify-content:flex-start!important}html body #xpin .card.final .card-top>div:not(.card-icon){order:0!important;margin:0!important;text-align:left!important}' +
        'html body #xpin .grid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))!important}html body #xpin .card{justify-content:flex-start!important}html body #xpin .card .card-top{justify-content:flex-start!important;text-align:left!important;gap:10px!important}html body #xpin .card .card-top>div:not(.card-icon){display:none!important}.xh6-nm{font-family:\'Astoria\',\'Archivo\',\'Segoe UI\',sans-serif;font-size:30px;line-height:1;color:var(--xh-acc,#f0b429);text-shadow:0 0 12px rgba(240,180,41,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.xh6-mod{font-size:11px;color:var(--text-dim,#999);white-space:nowrap;font-variant-numeric:tabular-nums}html:not(.xh6-list) .phase .xh6-mod{display:none}' +
        'html.xh6-list body .phase-head{padding:6px 0!important;min-height:0!important}html.xh6-list body .phase-name{font-size:18px!important}html.xh6-list body .phase{margin-bottom:14px!important}' +
        '';
    // épinglés : le nom de l'outil écrit avec la police de la suite (Astoria), comme les titres de phases
    function pinNames() { document.querySelectorAll('#xpin .card').forEach(c => { if (c.querySelector('.xh6-nm')) return; const n = c.querySelector('.card-name'); const t = n ? n.textContent.replace(/\s*XIII\s*$/i, '').trim() : ''; if (!t) return; const s = document.createElement('span'); s.className = 'xh6-nm'; s.textContent = t.charAt(0) + t.slice(1).toLowerCase(); const top = c.querySelector('.card-top') || c; top.appendChild(s); }); }
    function mod() { pinNames(); document.querySelectorAll('.phase .card[href],#xpin .card[href]').forEach(c => { const a = (c.getAttribute('href') || '').replace(/\.html.*$/, ''); let t = 0; try { t = +localStorage.getItem('xiii.mod.' + a) || 0; } catch (e) { } let s = c.querySelector(':scope > .xh6-mod'); if (!s) { s = document.createElement('span'); s.className = 'xh6-mod'; c.appendChild(s); } const v = ago(t); if (s.textContent !== v) s.textContent = v; s.title = t ? 'Dernière modification : ' + new Date(t).toLocaleString('fr-FR') : ''; }); }
    function sw() { const pan = document.getElementById('xs-panel'); if (!pan || document.getElementById('xh6-sw')) return; const seg = pan.querySelector('[data-xtm],[data-theme]'); const box = seg ? (seg.closest('.xs-f') || seg.parentNode) : null; if (!box) return; const row = document.createElement('div'); row.className = 'xs-f'; row.innerHTML = '<label style="display:block;margin:10px 0 6px">Outils de l\'accueil</label>'; const d = document.createElement('div'); d.id = 'xh6-sw'; d.className = 'xs-seg'; d.innerHTML = '<button type="button" data-v="tiles">▦ Tuiles</button><button type="button" data-v="list">☰ Liste réduite</button>'; row.appendChild(d); box.after(row); d.onclick = e => { const v = (e.target.closest('[data-v]') || {}).dataset ? e.target.closest('[data-v]').dataset.v : null; if (!v) return; try { localStorage.setItem(K, v); } catch (x) { } apply(); }; }
    function apply() { document.documentElement.classList.toggle('xh6-list', list()); const d = document.getElementById('xh6-sw'); if (d) d.querySelectorAll('button').forEach(b => b.classList.toggle('on', (b.dataset.v === 'list') === list())); }
    const s = document.createElement('style'); s.id = 'xh6-css'; s.textContent = css; document.head.appendChild(s); apply();
    const go = () => { mod(); apply(); }; addEventListener('load', () => setTimeout(go, 300)); setTimeout(go, 1500); setInterval(mod, 60000); setInterval(pinNames, 2000);
    new MutationObserver(() => { if (document.getElementById('xs-panel') && !document.getElementById('xh6-sw')) { sw(); apply(); } }).observe(document.body || document.documentElement, { childList: true, subtree: true });
    // ---------- Phase D · ouverture animée du tableau de bord ----------
    // cascade des widgets (fondu + légère montée), compteurs qui défilent jusqu'à leur valeur, barres qui se remplissent.
    // Coupée si ⚙️ › « Réduire les animations du Dashboard » ou si l'appareil demande moins d'animations.
    const calm = () => { try { return localStorage.getItem('xiii.anim.dash') === '1'; } catch (e) { return false; } }; // seul le réglage ⚙️ du Dashboard décide (pas le réglage de l'appareil)
    const st2 = document.createElement('style'); st2.id = 'xd-intro-css';
    st2.textContent = 'html.xd-intro #xd-dash .xd-c{opacity:0;transform:translateY(-10px);clip-path:inset(0 0 100% 0 round 14px);will-change:transform,opacity,clip-path}' +
        'html.xd-go #xd-dash .xd-c{opacity:1;transform:none;clip-path:inset(0 0 0 0 round 14px);transition:opacity .55s ease calc(var(--xi,0) * 250ms),transform .6s cubic-bezier(.2,.7,.2,1) calc(var(--xi,0) * 250ms),clip-path .7s cubic-bezier(.3,.7,.2,1) calc(var(--xi,0) * 250ms)}' +
        'html.xd-intro #xd-dash .xd-hd,html.xd-intro .title-row{opacity:0}html.xd-go #xd-dash .xd-hd,html.xd-go .title-row{opacity:1;transition:opacity .45s ease}' +
        'html.xd-go #xd-dash .xd-c [style*="width"]{transition:width .9s cubic-bezier(.2,.7,.2,1) .25s}';
    document.head.appendChild(st2);
    // ---- entrée du Dashboard : une ligne de temps unique (T0), indépendante des éléments ----
    // Le Dashboard se redessine quand ses données arrivent (~1,8 s après l'ouverture) : les widgets sont REMPLACÉS.
    // Avant, les nouveaux widgets n'avaient plus d'animation → « 2/3 s'animent puis tout apparaît d'un coup ».
    // Maintenant chaque widget (ancien ou redessiné) est calé sur la même horloge : il reprend exactement où il en était.
    const EASE = 'cubic-bezier(.2,.7,.2,1)', STEP = 250, DUR = 650;
    let T0 = 0, G = 0, END = 0, NUMS = [], mo = null, raf = 0;
    const NUMRX = /^\s*[J-]*\s*-?\d[\d\s.,]*\s*(%|€|h|j)?\s*$/;
    function dress() {
        const d = document.getElementById('xd-dash'); if (!d || !T0) return; const el = performance.now() - T0; if (el > END) return;
        const C = [...d.querySelectorAll('.xd-c')];
        C.forEach((c, i) => {
            if (c.__xg === G) return; c.__xg = G;
            try { const an = c.animate([{ opacity: 0, transform: 'translateY(-12px)', clipPath: 'inset(0 0 100% 0 round 14px)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0% 0 round 14px)' }], { duration: DUR, delay: i * STEP, easing: EASE, fill: 'backwards' }); an.currentTime = el; } catch (e) { }
            c.querySelectorAll('[style*="width"]').forEach(e => { const w = e.style.width; if (!/%$/.test(w)) return; try { const an = e.animate([{ width: '0%' }, { width: w }], { duration: 900, delay: i * STEP + 300, easing: EASE, fill: 'backwards' }); an.currentTime = el; } catch (x) { } });
            c.querySelectorAll('*').forEach(e => { if (e.children.length || !NUMRX.test(e.textContent) || e.textContent.trim().length >= 12) return; const t = e.textContent, m = /-?\d[\d\s]*([.,]\d+)?/.exec(t); if (m) NUMS.push([e, t, m[0], parseFloat(m[0].replace(/\s/g, '').replace(',', '.')), i]); });
        });
        if (!raf) raf = requestAnimationFrame(count);
    }
    function count(now) {
        raf = 0; const el = now - T0, ease = x => 1 - Math.pow(1 - x, 3); let more = false;
        NUMS = NUMS.filter(n => n[0].isConnected);
        NUMS.forEach(([e, t, raw, v, i]) => { const k = Math.max(0, Math.min(1, (el - i * STEP - 300) / 900)); if (k < 1) more = true;
            const dec = /[.,]\d/.test(raw) ? 1 : 0, x = v * ease(k), s2 = k >= 1 ? t : t.replace(raw, dec ? x.toFixed(1).replace('.', ',') : String(Math.round(x))); if (e.textContent !== s2) e.textContent = s2; });
        if (more) raf = requestAnimationFrame(count); else NUMS = [];
    }
    function intro() {
        if (calm()) { R.classList.remove('xd-intro'); return; } const d = document.getElementById('xd-dash'); if (!d) return;
        const C = d.querySelectorAll('.xd-c'); G++; NUMS = []; T0 = performance.now(); END = Math.max(C.length, 12) * STEP + DUR + 1200;
        dress(); R.classList.remove('xd-intro');
        if (!mo) { mo = new MutationObserver(ms => { if (performance.now() - T0 > END) return; if (ms.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && (n.matches('.xd-c') || n.querySelector('.xd-c'))))) dress(); });
            mo.observe(d.parentNode || d, { childList: true, subtree: true }); }
    }
    const R = document.documentElement;
    if (!calm()) R.classList.add('xd-intro');
    const waitDash = (n) => { const d = document.getElementById('xd-dash'), hid = R.classList.contains('xb0') || document.visibilityState === 'hidden'; if (d && d.querySelector('.xd-c') && !hid) { setTimeout(intro, 120); return; } /* après l'écran de chargement (sinon l'animation se joue sous le voile) */ if (n < 120) setTimeout(() => waitDash(n + 1), 50); else R.classList.remove('xd-intro'); };
    waitDash(0);
    // l'accueil réaffiché (onglet Accueil de la barre d'onglets, retour sur la page) : l'animation se rejoue
    let wasHidden = false; try { new ResizeObserver(() => { const h = document.documentElement.clientWidth < 5; if (wasHidden && !h && !calm()) { R.classList.add('xd-intro'); setTimeout(intro, 40); } wasHidden = h; }).observe(document.documentElement); } catch (e) { }
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !calm()) { R.classList.add('xd-intro'); setTimeout(intro, 40); } });
    window.XHOME6 = { apply, intro };
})();
