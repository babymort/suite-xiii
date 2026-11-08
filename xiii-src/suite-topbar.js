// =====================================================================
//  SUITE XIII — XTOP : la barre du haut identique dans tous les outils (saison 6, phase B)
//  🏠 · logo · onglets du document ＋ │ 🔎 │ 🗒️ Nouveau ▾ · 📂 Ouvrir · 💾 Enregistrer · ⬇️ Exporter ▾ │ 📤 Vers Suite XIII · 🔗 Partager │ 👥 Équipe · ☁️ Drive · pastille du nom
//  Les boutons propres à l'outil quittent la barre du haut pour la seconde barre (ils seront rangés par secteurs en phase B2).
//  Les boutons d'origine sont gardés (cachés) : les menus ▾ les déclenchent, rien ne change dans le fonctionnement des outils.
// =====================================================================
(function () {
    if (window.XTOP) return;
    const $ = id => document.getElementById(id), vis = e => e && (e.offsetParent || getComputedStyle(e).position === 'fixed') && getComputedStyle(e).display !== 'none';
    const ico = b => ((b.querySelector('.btn-icon') || b).textContent || '').trim(), tip = b => (b.title || b.getAttribute('aria-label') || b.textContent || '').trim();
    const hide = b => { if (!b) return; b.dataset.xtop = 'h'; b.style.setProperty('display', 'none', 'important'); };
    const mk = (id, icon, label, title, onclick) => { let b = $(id); if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = id; b.innerHTML = '<span class="btn-icon">' + icon + '</span><span class="btn-label">' + label + '</span>'; b.title = title; b.onclick = onclick; } return b; };
    const dv = k => { let d = document.querySelector('[data-xtopdv="' + k + '"]'); if (!d) { d = document.createElement('div'); d.className = 'divider xb-dv'; d.dataset.xtopdv = k; } return d; };
    const menu = (e, at, title, sub, items) => { if (window.XZZB_MENU) window.XZZB_MENU(e, at, title, sub, items); else if (items[0]) items[0][2](); };
    (() => { const st = document.createElement('style'); st.id = 'xtop-css'; st.textContent = '#top-bar #xb-brand{margin-right:10px!important}#top-bar #tabs-container{justify-content:flex-start!important;flex:0 1 auto!important}#top-bar>#xb-file,#top-bar #xb-file{margin-left:auto}#xb-menu [data-i]{justify-content:flex-start!important;text-align:left!important}#xb-menu [data-i]>span:last-child{flex:1;min-width:0}'; document.head.appendChild(st); })();
    let busy = false, done = false, EXPI = () => [], NEWI = () => [];
    // dernier choix fait dans un menu ▾ (proposé en tête du clic droit : « refaire »)
    const last = (k, v) => { try { localStorage.setItem('xiii.ctx.last.' + XIII_APP + '.' + k, v); } catch (e) { } };
    // outils dont la barre du haut est construite autrement (CALENDRIER, PLANNO, CONTRÔLE, ENCODO, LUDO…) :
    // on crée les mêmes zones (xb-tool à vider vers la seconde barre, xb-file à droite) pour leur appliquer la même mise en ordre
    function prepare() {
        const tb = $('top-bar'); if (!tb || $('xb-file')) return;
        const STD = el => el.closest('#xb-home,.xn-homeg>#xb-home,#xb-brand,#tabs-container,[class$="-brand"],#xid-chip,.xn-auth');
        const w = document.createElement('div'); w.id = 'xtop-wrap'; w.style.cssText = 'display:flex;align-items:center;gap:6px';
        const file = document.createElement('span'); file.id = 'xb-file'; file.className = 'btn-group';
        const tool = document.createElement('span'); tool.id = 'xb-tool'; tool.dataset.xtopfb = 1; tool.style.display = 'none';
        w.append(tool, file); tb.appendChild(w);
        const fileLike = b => b.id === 'xf-btn' || b.id === 'xgt-btn' || b.id === 'xsh-btn' || b.id === 'xmd-btn' || b.id === 'xb-solo' || (/🖨️|⬇️|💾|📂/.test(ico(b)) && /(imprim|pdf|export|télécharg|enregistr|ouvrir)/i.test(tip(b)));
        [...tb.querySelectorAll('button')].filter(b => !STD(b) && !b.closest('#xtop-wrap') && fileLike(b)).forEach(b => file.appendChild(b));
        // le reste (boutons, champs, pastilles propres à l'outil) part vers la seconde barre
        const rest = []; [...tb.children].forEach(c => { if (c === w || STD(c) || c.matches('.xn-homeg')) { if (c.matches('.xn-homeg')) [...c.children].forEach(x => { if (x.id !== 'xb-home') rest.push(x); }); return; } if (!c.querySelector('#xb-home,#xb-brand,#tabs-container')) rest.push(c); else [...c.children].forEach(x => { if (!STD(x) && !x.querySelector('#tabs-container')) rest.push(x); }); });
        rest.forEach(x => { if (x.offsetParent || x.matches('button')) tool.appendChild(x); });
    }
    function organize() {
        prepare();
        { const t0 = $('xb-tool'); if (t0 && t0.dataset.xtopfb) document.querySelectorAll('#top-bar .xn-homeg > button:not(#xb-home)').forEach(b => t0.appendChild(b)); }
        const tb = $('top-bar'), file = $('xb-file'), bar = $('xb-bar'), tool = $('xb-tool'); if (!tb || !file || busy) return false; busy = true;
        try {
            const FB = [...file.querySelectorAll(':scope > button, :scope > select')];
            const search = $('xf-btn'), gate = $('xgt-btn');
            const save = FB.find(b => b.tagName === 'BUTTON' && /💾/.test(ico(b)) && b.dataset.xtop !== 'h'), open = FB.find(b => /📂/.test(ico(b)));
            const sel = $('export-format');
            const exp = FB.filter(b => b !== search && b !== gate && b !== save && b !== open && b.tagName === 'BUTTON' && !/^(xtop-|xsh-btn|xpb-btn|xb-solo|xid-chip|xmd-btn|xzz-ex|xzz-new)/.test(b.id) && !b.closest('.xn-auth') && (b.dataset.xtop === 'h' || vis(b)));
            // ⬇️ Exporter ▾ : formats de rendu + autres exports + fichier du projet
            const json = exp.find(b => /⬇️/.test(ico(b)) && /(\.json|en fichier|fichier du projet)/i.test(tip(b))), render = exp.find(b => /🖨️|🖼️/.test(ico(b)) && /rendu/i.test(tip(b))) || (sel && exp.find(b => /🖼️/.test(ico(b))));
            const others = exp.filter(b => b !== json && b !== render);
            let X = null;
            if (exp.length || sel) {
                EXPI = () => {
                    const it = [];
                    if (sel && render) [...sel.options].forEach(o => it.push([/pdf/i.test(o.value) ? '📄' : '🖼️', o.textContent.trim() + (/pdf/i.test(o.value) ? '' : (/jpe?g/i.test(o.value) ? ' — fichier plus léger' : ' — qualité maximale')), () => { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); render.click(); }]));
                    // le sous-menu 🖨️ « Exporter, imprimer » est déplié : tous les exports au même niveau
                    others.forEach(b => { const h = b.id === 'xb-exp' && $('xb-hold'); if (h) [...h.querySelectorAll('button')].forEach(x => it.push([ico(x).slice(0, 3) || '📄', tip(x), () => x.click()])); else it.push([ico(b).slice(0, 3) || '📄', tip(b), () => b.click()]); });
                    if (json) it.push(['📦', 'Fichier du projet : ' + tip(json).replace(/^Exporter\s*/i, ''), () => json.click()]);
                    return it.map(x => [x[0], x[1], () => { last('exp', x[1]); x[2](); }]);
                };
                X = mk('xtop-exp', '⬇️', 'Exporter ▾', 'Exporter : PDF, images, tableaux, impression, fichier du projet (Ctrl E · clic droit : export rapide)', null);
                X.onclick = e => menu(e, X, '⬇️ Exporter', 'Choisissez ce que vous voulez obtenir.', EXPI());
                exp.forEach(hide); if (sel) hide(sel);
            }
            // 🗒️ Nouveau ▾ : document vierge, exemples types
            const zn = $('xzz-new'), zx = $('xzz-ex') || $('xmd-btn');
            const vierges = [...document.querySelectorAll('[data-xzz="nv"]')].filter(b => b.id !== 'xmd-btn').concat(tool ? [...tool.querySelectorAll(':scope > button, #xtop-moved > button')].filter(b => !b.dataset.xzz && !/^(xzz-new|xtop-new|xzz-ex|xmd-btn)$/.test(b.id) && (/📐/.test(ico(b)) && /exemple/i.test(tip(b)) || /🗒️/.test(ico(b)) && /vierge|nouveau/i.test(tip(b)))) : []).concat([...document.querySelectorAll('#xtop-moved > button[data-xtopnv]')]);
            vierges.forEach(b => { b.dataset.xtopnv = 1; });
            let N = null;
            if (zn || zx || vierges.length) {
                NEWI = () => { const it = vierges.map(b => [ico(b).slice(0, 3) || '🗒️', tip(b), () => b.click()]);
                    if (zx) it.push(['🧩', 'Exemples types : un projet complet à adapter, selon le type de projet', () => zx.click()]);
                    if (!it.length && zn) it.push(['🗒️', 'Nouveau document', () => zn.click()]);
                    return it.map(x => [x[0], x[1], () => { last('new', x[1]); x[2](); }]); };
                N = mk('xtop-new', '🗒️', 'Nouveau ▾', 'Nouveau : document vierge ou exemple type', null);
                N.onclick = e => { const it = NEWI(); if (it.length === 1 && !vierges.length && zn) { zn.click(); return; } menu(e, N, '🗒️ Nouveau', 'Partir d’une page blanche ou d’un exemple à adapter.', it); };
                [zn, zx].concat(vierges).forEach(hide);
            }
            // ordre de la partie « fichier » : 🔎 │ 🗒️ 📂 💾 ⬇️ │ 📤 🔗
            const share = $('xsh-btn') || $('xpb-btn');
            const seq = [search, dv('a'), N, open, save, X, dv('b'), gate, share].filter(Boolean);
            seq.forEach(x => file.appendChild(x));
            // restent dans xb-file : boutons propres à l'outil ajoutés après coup → seconde barre
            // 👥 Équipe · ☁️ Drive · pastille du nom (dans certains outils, ce groupe était né dans la seconde barre : il remonte)
            if (bar && !tb.contains(bar)) { file.after(bar); bar.style.marginLeft = '0'; }
            { const host = bar || file, team = $('xb-solo'), chip = $('xid-chip'), auth = chip ? chip.closest('.xn-auth') || chip : null;
                const drive = [...tb.querySelectorAll('button')].find(b => /☁️|☁/.test(ico(b)) && b !== team && !b.closest('#tabs-container'));
                if (bar) bar.before(dv('c')); else if (team || drive || auth) host.appendChild(dv('c'));
                [team, drive, auth].filter(Boolean).forEach(x => host.appendChild(x)); }
            // boutons propres à l'outil : vers la seconde barre (le ＋ collé aux onglets reste)
            const tbar = $('toolbar');
            if (tool && tbar) {
                let g = $('xtop-moved'); if (!g) { g = document.createElement('span'); g.id = 'xtop-moved'; g.className = 'btn-group'; g.title = 'Boutons de l’outil'; tbar.insertBefore(g, tbar.firstChild); const d = document.createElement('div'); d.className = 'divider'; d.id = 'xtop-moved-dv'; g.after(d); }
                const tabs = $('tabs-container');
                [...tool.querySelectorAll(tool.dataset.xtopfb ? ':scope > *' : ':scope > button')].forEach((b, i) => {
                    if (b.dataset.xtop === 'h' || b === N || (!tool.dataset.xtopfb && !vis(b) && !b.dataset.xtopm)) return;
                    if (tabs && i === 0 && /➕|＋/.test(ico(b))) { if (b.previousElementSibling !== tabs) { b.dataset.xtopTab = 1; tabs.after(b); } return; }
                    b.dataset.xtopm = 1; g.appendChild(b); });
                if (N && N.parentElement !== file) file.insertBefore(N, open || save || X || null);
                const empty = !g.querySelector('button'); g.style.display = empty ? 'none' : ''; const d = $('xtop-moved-dv'); if (d) d.style.display = empty ? 'none' : '';
            }
            { const w = file.parentElement === tb ? file : file.closest('#top-bar > *'); if (w) { w.style.marginLeft = 'auto'; [...tb.children].forEach(c => { if (c !== w) c.style.flexGrow = '0'; }); } } // à gauche : 🏠 logo onglets ; à droite : le reste
            done = true; setTimeout(dvClean, 0);
        } catch (e) { try { console.warn('XTOP', e); } catch (x) { } }
        busy = false; return true;
    }
    // un seul trait entre deux groupes visibles : ni en tête, ni en fin, ni deux de suite (boutons absents selon l'outil, groupe 👥 posé plus tard…)
    function dvClean() {
        const tb = $('top-bar'); if (!tb) return;
        tb.querySelectorAll('[data-xdvh]').forEach(d => { d.style.removeProperty('display'); delete d.dataset.xdvh; });
        const L = [...tb.querySelectorAll('button,select,input,.divider,#tabs-container')].filter(e => e.id === 'tabs-container' || !e.closest('#tabs-container'));
        const hid = d => { d.dataset.xdvh = 1; d.style.setProperty('display', 'none', 'important'); };
        let prev = 'start', last = null;
        L.forEach(e => { if (!(e.offsetWidth > 0)) return; if (e.classList.contains('divider')) { if (prev !== 'el') hid(e); else { prev = 'dv'; last = e; } } else if (!e.closest('.divider')) prev = 'el'; });
        if (prev === 'dv' && last) hid(last);
    }
    setInterval(() => { if (!busy) dvClean(); }, 2000);
    let T = 0; const again = () => { clearTimeout(T); T = setTimeout(() => { organize(); try { dispatchEvent(new Event('resize')); } catch (e) { } }, 120); };
    function start() { if (!organize()) { setTimeout(start, 400); return; } again(); const tb = $('top-bar'); if (tb) new MutationObserver(ms => { if (!busy && ms.some(m => [...m.addedNodes].some(n => n.nodeType === 1 && n.tagName === 'BUTTON' && !n.dataset.xtop && !/^xtop-/.test(n.id) && !n.closest('#tabs-container')))) again(); }).observe(tb, { childList: true, subtree: true }); }
    try { if (typeof XBOOT !== 'undefined' && XBOOT.ready) XBOOT.ready(() => setTimeout(start, 80), 2990); else throw 0; } catch (e) { addEventListener('load', () => setTimeout(start, 700)); }
    window.XTOP = { organize, exportItems: () => EXPI(), newItems: () => NEWI() };
})();
