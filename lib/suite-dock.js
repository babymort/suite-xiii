// SUITE XIII — module commun. Source : xiii-src/suite-dock.js
// =====================================================================
//  SUITE XIII — XDOCK : moins de fenêtres (saison 6, phase B)
//  Les fenêtres de réglages et de saisie qui couvraient l'écran s'ouvrent maintenant en panneau sur le côté droit :
//  le travail reste visible et cliquable à gauche. Un bouton ◧ / ▣ sur chaque fenêtre la remet au centre (ou sur le côté),
//  et ce choix est retenu pour cette fenêtre dans cet outil.
//  Restent au centre : les confirmations et petites questions, les grandes fenêtres (aperçus, tableaux, exemples),
//  la recherche, la visite guidée, et tout sur téléphone ou fenêtre étroite.
// =====================================================================
(function () {
    if (window.XDOCK) return;
    const APPX = XIII_APP, $ = id => document.getElementById(id), K = 'xiii.dock.' + APPX;
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const SKIP = '#xf-ov,#xb-menu,#xem-first,#xctx-key,#wsdlg,#xid-pop,#xfocus-out,#xdock-btn,#xoff,#xau-ban,#xs-gear,#xt-tab,#xt-pop,#xt-bar,#xt-block,#xt-hole,#xb-master,#xem-syno,#xpres,#export-loader,.xtoast,#toast,.toast';
    const big = r => r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.85;
    let T = 0;
    function boxOf(ov) {
        // la boîte de la fenêtre : le plus grand enfant visible, nettement plus petit que l'écran
        let best = null, area = 0;
        const look = (el, d) => { for (const c of el.children) { const r = c.getBoundingClientRect(); if (r.width < 160 || r.height < 80) continue; if (r.width < innerWidth * 0.86) { if (r.width * r.height > area) { area = r.width * r.height; best = c; } } else if (d < 2) look(c, d + 1); } };
        look(ov, 0); return best;
    }
    const titleOf = b => { const h = b.querySelector('h1,h2,h3,h4,.modal-title,header,b,strong'); return ((h && h.textContent) || b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48); };
    function scan() {
        T = 0; if (innerWidth < 900) return;
        const cand = [];
        for (const el of document.body.children) {
            if (el.matches(SKIP) || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue; const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position !== 'fixed') continue; const r = el.getBoundingClientRect(); if (!big(r)) continue; cand.push(el);
        }
        document.querySelectorAll('[data-xdock]').forEach(ov => { if (cand.indexOf(ov) < 0) undock(ov, true); });
        cand.forEach(ov => {
            let b = ov.dataset.xdock === '1' ? ov.querySelector('[data-xdockbox]') : boxOf(ov); if (!b) return;
            const r0 = b.dataset.xw ? { width: +b.dataset.xw, height: +b.dataset.xh } : b.getBoundingClientRect();
            if (r0.width > 640 || r0.height < 200 || b.querySelectorAll('input,select,textarea,button').length < 3) return; // petite question, ou grande fenêtre : au centre
            const key = titleOf(b), pref = J(K, {})[key];
            ov.dataset.xdockKey = key; b.dataset.xdockbox = 1; if (!b.dataset.xw) { b.dataset.xw = Math.round(r0.width); b.dataset.xh = Math.round(r0.height); }
            if (pref === 0) { if (ov.dataset.xdock === '1') undock(ov); ov.dataset.xdock = '0'; } else if (ov.dataset.xdock !== '1') dock(ov, b);
            btn(ov, b);
        });
        if (!document.querySelector('[data-xdock]')) { const x = $('xdock-btn'); if (x) x.remove(); }
        document.documentElement.classList.toggle('xdock-on', !!document.querySelector('[data-xdock="1"]'));
    }
    function topY() { const tb = $('toolbar') || $('top-bar'); if (!tb || !tb.offsetHeight) return 0; return Math.max(0, Math.round(tb.getBoundingClientRect().bottom)); }
    function dock(ov, b) { ov.dataset.xdock = '1'; ov.classList.add('xdock'); b.classList.add('xdock-box'); document.documentElement.style.setProperty('--xdock-top', topY() + 'px'); }
    function undock(ov, gone) { const b = ov.querySelector('[data-xdockbox]'); ov.classList.remove('xdock'); if (b) b.classList.remove('xdock-box'); if (gone) { delete ov.dataset.xdock; } else ov.dataset.xdock = '0'; }
    function btn(ov, b) {
        let x = $('xdock-btn'); if (!x) { x = document.createElement('button'); x.type = 'button'; x.id = 'xdock-btn'; document.body.appendChild(x); }
        const on = ov.dataset.xdock === '1', r = b.getBoundingClientRect();
        const lb = on ? '▣ Au centre' : '◧ Sur le côté'; if (x.textContent !== lb) x.textContent = lb; x.title = on ? 'Afficher cette fenêtre au centre de l’écran' : 'Ouvrir cette fenêtre en panneau à droite : le travail reste visible';
        x.style.top = Math.max(4, Math.round(r.top + 8)) + 'px'; x.style.left = Math.round(on ? r.left - 112 : r.right + 8) + 'px';
        if (!on && r.right + 120 > innerWidth) { x.style.left = Math.round(r.right - 118) + 'px'; x.style.top = Math.max(4, Math.round(r.top - 34)) + 'px'; }
        x.onclick = e => { e.stopPropagation(); const P = J(K, {}); if (on) { undock(ov); P[ov.dataset.xdockKey] = 0; } else { dock(ov, b); P[ov.dataset.xdockKey] = 1; } try { localStorage.setItem(K, JSON.stringify(P)); } catch (er) { } setTimeout(scan, 30); };
    }
    const st = document.createElement('style'); st.id = 'xdock-css';
    st.textContent = '.xdock{background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:none!important}' +
        '.xdock .xdock-box{pointer-events:auto!important;position:fixed!important;top:var(--xdock-top,0px)!important;right:0!important;bottom:0!important;left:auto!important;width:min(360px,40vw)!important;max-width:none!important;max-height:none!important;height:auto!important;margin:0!important;transform:none!important;border-radius:0!important;overflow:auto!important;box-shadow:-14px 0 34px rgba(0,0,0,.35)!important;border:0!important;border-left:1px solid var(--border-color,#444)!important;animation:xdockIn .16s ease-out}' +
        '@keyframes xdockIn{from{transform:translateX(24px)!important;opacity:.4}to{opacity:1}}' +
        '#xdock-btn{position:fixed;z-index:2147483000;height:26px;padding:0 10px;border-radius:999px;border:1px solid var(--border-color,#555);background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);font:600 11.5px system-ui,"Segoe UI",sans-serif;cursor:pointer;opacity:.8;box-shadow:0 4px 14px rgba(0,0,0,.3)}#xdock-btn:hover{opacity:1;border-color:rgb(240,179,120)}' +
        'html.xdock-on #xt-tab{display:none!important}html.xdock-on #xs-gear{right:calc(min(360px,40vw) + 18px)!important}@media print{#xdock-btn{display:none!important}}';
    (document.head || document.documentElement).appendChild(st);
    const later = () => { if (!T) T = setTimeout(scan, 120); };
    const go = () => { new MutationObserver(later).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'hidden', 'open'] }); addEventListener('resize', later); scan(); };
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XDOCK = { scan };
})();
