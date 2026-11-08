// =====================================================================
//  SUITE XIII — XFOCUS : mode focus (saison 6, phase B)
//  Une touche (F) masque la barre du haut, la seconde barre et les panneaux annexes de l'outil :
//  il ne reste que la zone de travail (écriture dans SCRIPTO, plan dans PLANO, conducteur à l'antenne…).
//  F ou Échap pour revenir. Bouton ⛶ dans le secteur ② Afficher, commande « Mode focus » dans Ctrl K.
//  Rien n'est retiré de la page : les éléments sont seulement cachés par une classe sur <body>.
// =====================================================================
(function () {
    if (window.XFOCUS) return;
    const APPX = XIII_APP, $ = id => document.getElementById(id);
    // panneaux annexes masqués en plus des deux barres (la zone de travail reste)
    const PANELS = {
        conduco: '#props-panel', encodo: '#side', repero: '#side-col'
    };
    const KEY = 'xiii.focus.' + APPX;
    function css() {
        if ($('xfocus-css')) return; const s = document.createElement('style'); s.id = 'xfocus-css';
        const extra = PANELS[APPX] ? ',body.xfocus ' + PANELS[APPX].split(',').join(',body.xfocus ') : '';
        s.textContent = 'body.xfocus #top-bar,body.xfocus #toolbar,body.xfocus #xs-gear,body.xfocus #xt-tab,body.xfocus #xoff,body.xfocus #dev-credit' + extra + '{display:none!important}' +
            '#xfocus-out{position:fixed;top:8px;left:50%;transform:translateX(-50%);box-shadow:0 6px 18px rgba(0,0,0,.35);z-index:100040;display:none;align-items:center;gap:8px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--border-color,#555);background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);font:600 12.5px system-ui,"Segoe UI",sans-serif;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .2s}' +
            '#xfocus-out.show,#xfocus-out:focus-visible{opacity:1;pointer-events:auto}#xfocus-out kbd{font:600 11px ui-monospace,monospace;padding:1px 5px;border-radius:4px;border:1px solid var(--border-color,#666)}body.xfocus #xfocus-out{display:inline-flex}' +
            '@media print{#xfocus-out{display:none!important}}';
        document.head.appendChild(s);
    }
    function relayout() { try { window.dispatchEvent(new Event('resize')); } catch (e) { } }
    function set(on) {
        css(); document.body.classList.toggle('xfocus', !!on);
        const b = $('xfocus-btn'); if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
        try { sessionStorage.setItem(KEY, on ? '1' : ''); } catch (e) { }
        relayout(); setTimeout(relayout, 60);
        const o = $('xfocus-out'); if (o) { o.title = 'Quitter le mode focus (F ou Échap)'; clearTimeout(hideT); o.classList.toggle('show', !!on); if (on) hideT = setTimeout(() => { hideT = 0; o.classList.remove('show'); }, 3000); }
    }
    let hideT = 0;
    // le bouton « Quitter » se montre 3 s à l'entrée, puis quand la souris approche du bord haut (il ne cache rien le reste du temps)
    document.addEventListener('mousemove', e => { if (!on()) return; const o = $('xfocus-out'); if (!o) return; if (e.clientY < 48) { clearTimeout(hideT); o.classList.add('show'); } else if (!hideT || e.clientY > 90) { if (!o.matches(':hover')) o.classList.remove('show'); } }, { passive: true });
    document.addEventListener('touchstart', e => { if (!on() || !e.touches[0] || e.touches[0].clientY > 60) return; const o = $('xfocus-out'); if (o) { o.classList.add('show'); clearTimeout(hideT); hideT = setTimeout(() => { hideT = 0; o.classList.remove('show'); }, 4000); } }, { passive: true });
    const on = () => document.body.classList.contains('xfocus');
    const typing = t => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const modal = () => [...document.querySelectorAll('[role=dialog],.modal,.modal-overlay,#xf-ov,#xtour-ov,.xtour')].some(e => e.offsetWidth > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden');
    function mount() {
        const tb = $('toolbar'); if (!tb || $('xfocus-btn')) return;
        css();
        const b = document.createElement('button'); b.type = 'button'; b.id = 'xfocus-btn'; b.dataset.xsec = 'aff';
        b.title = 'Mode focus (F) — masque les barres pour ne garder que la zone de travail'; b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="btn-icon">⛶</span><span class="btn-label">Focus</span>'; b.onclick = () => set(!on());
        const aff = tb.querySelector(':scope > .xsec[data-sec="aff"]'); (aff || tb).appendChild(b);
        const o = document.createElement('button'); o.type = 'button'; o.id = 'xfocus-out'; o.innerHTML = '⛶ Quitter le focus <kbd>F</kbd>'; o.onclick = () => set(false); document.body.appendChild(o);
        try { if (sessionStorage.getItem(KEY) === '1') set(true); } catch (e) { }
    }
    document.addEventListener('keydown', e => {
        if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
        if ((e.key === 'f' || e.key === 'F') && !e.repeat && $('xfocus-btn') && !modal()) { e.preventDefault(); set(!on()); }
        else if (e.key === 'Escape' && on() && !modal()) set(false);
    });
    let n = 0; const go = () => { if ($('toolbar')) mount(); else if (++n < 10) setTimeout(go, 500); };
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(() => setTimeout(go, 400), 2997); else throw 0; } catch (e) { addEventListener('load', () => setTimeout(go, 1200)); }
    window.XFOCUS = { set, toggle: () => set(!on()), on };
})();
