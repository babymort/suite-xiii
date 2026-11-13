// SUITE XIII — module commun. Source : xiii-src/suite-navfold.js
// =====================================================================
//  SUITE XIII — XNAVFOLD : colonne de gauche de l'accueil repliable en icônes (saison 6, phase D)
//  Un bouton « ‹ » en bas de la colonne (ou la touche [) la replie en icônes seules : les widgets prennent toute la largeur.
//  Le nom de chaque section passe en bulle au survol. Choix retenu (xiii.home.fold). Grand écran seulement.
// =====================================================================
(function () {
    if (window.XNAVFOLD) return;
    const K = 'xiii.home.fold', R = document.documentElement, W = 76;
    const on = () => { try { return localStorage.getItem(K) === '1'; } catch (e) { return false; } };
    const css = document.createElement('style'); css.id = 'xnavfold-css';
    css.textContent =
        '@media (min-width:900px){' +
        'body.xh #xh-nav{transition:width .26s cubic-bezier(.2,.7,.2,1),padding .26s cubic-bezier(.2,.7,.2,1)}body.xh main{transition:margin-left .26s cubic-bezier(.2,.7,.2,1)!important}body.xh>footer{transition:margin-left .26s cubic-bezier(.2,.7,.2,1)}' +
        'html.xnf body.xh #xh-nav{width:' + W + 'px!important;padding:16px 10px!important}' +
        'html.xnf body.xh main{margin-left:' + (W + 24) + 'px!important}html.xnf body.xh main>*{max-width:1480px}html.xnf body.xh>footer{margin-left:' + (W + 22) + 'px!important}html.xnf body.xh #top-bar{padding-left:' + (W + 26) + 'px}' +
        'html.xnf body.xh #xh-nav button{justify-content:center;padding:10px 0!important;width:auto!important;gap:0}html.xnf body.xh #xh-nav button>span:last-child{display:none}' +
        'html.xnf body.xh #xh-nav button.on{width:56px!important;margin-right:-2px}html.xnf body.xh #xh-ind{width:56px!important;left:10px!important}' +
        'html.xnf body.xh #xh-nav .cur-proj,html.xnf body.xh #xh-nav .xh-foot{display:none!important}html.xnf body.xh #xh-nav .xh-logo img{max-width:52px!important}' +
        'html.xnf body.xh #xb-master,html.xnf body.xh #xacc-chip,html.xnf body.xh #xau-chip{left:' + (W + 8) + 'px}' +
        '#xnf-btn{all:unset;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;height:30px;border-radius:10px;color:var(--xh-dim,#999);cursor:pointer;font:600 12px system-ui,sans-serif;transition:background .15s,color .15s}#xnf-btn:hover{background:var(--xh-glass2,rgba(255,255,255,.06));color:var(--xh-txt,#eee)}#xnf-btn:focus-visible{outline:2px solid #f0b378}' +
        '#xnf-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .26s}html.xnf #xnf-btn svg{transform:rotate(180deg)}html.xnf #xnf-btn span{display:none}' +
        '#xnf-tip{position:fixed;z-index:99999;pointer-events:none;padding:5px 10px;border-radius:8px;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);font:600 12px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35);opacity:0;transform:translateX(-4px);transition:opacity .12s,transform .12s}#xnf-tip.on{opacity:1;transform:none}' +
        '}@media (max-width:899px){#xnf-btn{display:none!important}}';
    (document.head || R).appendChild(css);
    function apply() { R.classList.toggle('xnf', on()); const b = document.getElementById('xnf-btn'); if (b) { b.title = on() ? 'Déplier la colonne ( [ )' : 'Replier la colonne en icônes ( [ )'; b.setAttribute('aria-expanded', on() ? 'false' : 'true'); }
        setTimeout(() => { try { dispatchEvent(new Event('resize')); } catch (e) { } }, 280); }
    function set(v) { try { localStorage.setItem(K, v ? '1' : '0'); } catch (e) { } apply(); }
    function mount() {
        const n = document.getElementById('xh-nav'); if (!n || document.getElementById('xnf-btn')) return;
        const b = document.createElement('button'); b.type = 'button'; b.id = 'xnf-btn';
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span>Replier</span>';
        b.onclick = () => set(!on()); const foot = n.querySelector('.xh-foot'); if (foot) foot.before(b); else n.appendChild(b); apply();
        // bulle du nom de section quand la colonne est repliée
        let tip = document.getElementById('xnf-tip'); if (!tip) { tip = document.createElement('div'); tip.id = 'xnf-tip'; document.body.appendChild(tip); }
        n.addEventListener('mouseover', e => { const t = e.target.closest('button[data-t]'); if (!t || !on()) { tip.classList.remove('on'); return; } const r = t.getBoundingClientRect(); tip.textContent = (t.querySelector('span:last-child') || t).textContent.trim(); tip.style.left = (r.right + 10) + 'px'; tip.style.top = (r.top + r.height / 2 - 14) + 'px'; tip.classList.add('on'); });
        n.addEventListener('mouseleave', () => tip.classList.remove('on'));
    }
    addEventListener('keydown', e => { if (e.key !== '[' || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || '')) || e.target.isContentEditable) return; e.preventDefault(); e.stopPropagation(); set(!on()); }, true);
    apply(); new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true }); mount();
    window.XNAVFOLD = { set, on };
})();
