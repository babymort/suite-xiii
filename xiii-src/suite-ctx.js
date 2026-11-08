// =====================================================================
//  SUITE XIII — XCTX : clic droit sur les barres (saison 6, phase B)
//  Clic droit sur un bouton de la barre du haut ou de la barre d'outils = raccourcis rapides, au même endroit partout :
//    ⬇️ Exporter ▾ → tous les formats d'un coup, « ⚡ refaire » le dernier export en tête
//    📤 Vers Suite XIII → chaque destination directement (sans passer par la grande fenêtre)
//    🗒️ Nouveau ▾ → document vierge / exemples · 💾 → enregistrer, fichier du projet, versions · 🏠 → accueil ici ou dans un nouvel onglet
//    tout bouton → lancer, lui associer une touche du clavier, le masquer de la barre (barre simplifiée)
//  Clic droit dans une zone vide des barres → réafficher les boutons masqués, mode focus, recherche, raccourcis, paramètres.
//  Maj + clic droit garde le menu habituel du navigateur. Les menus des zones de travail (propres à chaque outil) ne changent pas.
// =====================================================================
(function () {
    if (window.XCTX) return;
    const APPX = XIII_APP, $ = id => document.getElementById(id);
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const ico = b => ((b.querySelector('.btn-icon') || b).textContent || '').trim().slice(0, 3);
    // même libellé que la liste des commandes (Ctrl K) et les raccourcis personnels (XUX)
    const labOf = b => { const l = ((b.querySelector('.btn-label') || {}).textContent || b.textContent || '').replace(/\s+/g, ' ').trim(); return (l && l.length > 1 && !/^\W+$/.test(l) ? l : (b.title || '').split(/ : | — | \(/)[0]).trim().slice(0, 60); };
    const clean = s => String(s || '').replace(/\s*▾\s*$/, '');
    const KH = 'xiii.ctx.hide.' + APPX, KL = k => 'xiii.ctx.last.' + APPX + '.' + k;
    const lastOf = k => { try { return localStorage.getItem(KL(k)) || ''; } catch (e) { return ''; } };
    const setLast = (k, v) => { try { localStorage.setItem(KL(k), v); } catch (e) { } };
    const say = m => { try { if (typeof toastX === 'function') return toastX(m); if (typeof toast === 'function') return toast(m); } catch (e) { } };
    // ---------- menu à l'endroit du clic (même présentation que les menus ▾ de la barre) ----------
    function show(e, title, sub, items) {
        document.querySelectorAll('#xb-menu').forEach(m => m.remove());
        if (!items.length || !window.XZZB_MENU) return;
        const x = e.clientX, y = e.clientY, at = { getBoundingClientRect: () => ({ bottom: y - 6, left: x + 60, top: y, right: x }) };
        XZZB_MENU(e, at, title, sub, items);
        const m = $('xb-menu'); if (!m) return; m.dataset.xctx = 1;
        const r = m.getBoundingClientRect(); if (r.bottom > innerHeight - 8) m.style.top = Math.max(8, innerHeight - r.height - 8) + 'px';
        if (r.right > innerWidth - 8) m.style.left = Math.max(8, innerWidth - r.width - 8) + 'px';
    }
    // « ⚡ refaire » le dernier choix d'une liste
    const again = (k, list, verb) => { const l = lastOf(k), hit = l && list.find(x => x[1] === l || x[3] === l); return hit ? [['⚡', verb + ' : ' + clean(hit[1]).split(/ : | — /)[0], hit[2]]] : []; };
    // ---------- touches du clavier ----------
    const RESERVED = /^(Ctrl\+[KSOEZYDP]|Ctrl\+Maj\+P|[FN?1-9]|Escape|Delete|Backspace|Enter|Tab|Espace)$/;
    function bindKey(b) {
        const lab = labOf(b); if (!lab) return;
        let box = $('xctx-key'); if (box) box.remove(); box = document.createElement('div'); box.id = 'xctx-key';
        box.innerHTML = '<b>⌨️ Raccourci pour « ' + lab.replace(/[<>&]/g, '') + ' »</b><span>Tapez la combinaison voulue (ex. Alt + E, Ctrl + Maj + L)… Échap pour annuler.</span>';
        document.body.appendChild(box);
        const k = ev => {
            ev.preventDefault(); ev.stopPropagation();
            if (ev.key === 'Escape') { done(); return; }
            const key = ev.key.length === 1 ? ev.key.toUpperCase() : ev.key; if (/^(Control|Shift|Alt|Meta)$/.test(key)) return;
            const c = [ev.ctrlKey || ev.metaKey ? 'Ctrl' : '', ev.altKey ? 'Alt' : '', ev.shiftKey ? 'Maj' : '', key === ' ' ? 'Espace' : key].filter(Boolean).join('+');
            if (RESERVED.test(c)) { box.querySelector('span').textContent = '« ' + c + ' » est déjà un raccourci de toute la suite. Essayez avec Alt ou Ctrl + Maj… (Échap pour annuler)'; return; }
            const K = J('xiii.ux.keys.' + APPX, {}); K[c] = lab; W('xiii.ux.keys.' + APPX, K); done(); say('⌨️ ' + c + ' → « ' + lab + ' » (liste dans la fiche ?)');
        };
        const done = () => { document.removeEventListener('keydown', k, true); box.remove(); };
        document.addEventListener('keydown', k, true);
    }
    // ---------- boutons masqués (barre d'outils simplifiée) ----------
    const keyOf = b => b.id ? '#' + b.id : 'l:' + labOf(b);
    function applyHidden() {
        const H = J(KH, []), tb = $('toolbar'); if (!tb) return; let ch = false;
        tb.querySelectorAll('button[data-xctxh]').forEach(b => { if (H.indexOf(keyOf(b)) < 0) { b.style.removeProperty('display'); delete b.dataset.xctxh; ch = true; } });
        if (H.length) tb.querySelectorAll('button').forEach(b => { if (!b.dataset.xctxh && H.indexOf(keyOf(b)) > -1) { b.dataset.xctxh = 1; b.style.setProperty('display', 'none', 'important'); ch = true; } });
        if (ch) try { if (window.XSECT) XSECT.arrange(); } catch (e) { }
    }
    function hide(b) { const H = J(KH, []), k = keyOf(b); if (H.indexOf(k) < 0) H.push(k); W(KH, H); applyHidden(); say('🙈 « ' + labOf(b) + ' » masqué — clic droit sur la barre pour le réafficher'); }
    function unhide(k) { W(KH, J(KH, []).filter(x => k !== '*' && x !== k)); applyHidden(); }
    function hiddenLabel(k) { const tb = $('toolbar'), b = tb && [...tb.querySelectorAll('button[data-xctxh]')].find(x => keyOf(x) === k); return b ? [ico(b), labOf(b)] : ['•', k.replace(/^l:|^#/, '')]; }
    // ---------- menus ----------
    function forButton(e, b) {
        const lab = labOf(b), id = b.id, it = [], inTool = !!b.closest('#toolbar'), i0 = ico(b) || '•';
        if (id === 'xtop-exp' && window.XTOP && XTOP.exportItems) { const L = XTOP.exportItems(); it.push(...again('exp', L, 'Refaire'), ...L); }
        else if (id === 'xtop-new' && window.XTOP && XTOP.newItems) { const L = XTOP.newItems(); it.push(...L); }
        else if (id === 'xgt-btn' && typeof XLINKS !== 'undefined' && typeof XGATE !== 'undefined') { // XLINKS, XGATE : constantes du code commun (pas sur window)
            const T = XLINKS.T, L = XLINKS.from(APPX).filter(x => T[x[1]]).map(x => [T[x[1]][0], 'Vers ' + T[x[1]][1] + ' : ' + x[2], () => { setLast('gate', x[1]); XGATE.go(x[1]); }, x[1]]);
            const l = lastOf('gate'), h = L.find(x => x[3] === l); if (h) it.push(['⚡', 'Renvoyer vers ' + T[l][1] + ' : comme la dernière fois', h[2]]);
            it.push(...L.map(x => x.slice(0, 3)), ['📤', 'Toutes les destinations : la fenêtre Vers Suite XIII', () => b.click()]);
        }
        else if (/💾/.test(i0) && b.closest('#xb-file')) {
            it.push(['💾', 'Enregistrer : dans ce navigateur (Ctrl S)', () => b.click()]);
            const f = window.XTOP && XTOP.exportItems ? XTOP.exportItems().find(x => /^Fichier du projet/.test(x[1])) : null; if (f) it.push(['📦', 'Enregistrer en fichier : à garder ou transmettre', f[2]]);
            const v = $('xhs-btn'); if (v) it.push(['🗂️', 'Versions : revenir à un état précédent', () => v.click()]);
        }
        else if (id === 'xb-home') it.push(['🏠', 'Accueil', () => b.click()], ['↗', 'Accueil dans un nouvel onglet', () => window.open('index.html', '_blank')]);
        else if (id === 'xfocus-btn') it.push(['⛶', 'Mode focus (F)', () => b.click()]);
        else it.push(['▶', clean(lab) || 'Lancer', () => b.click()]);
        it.push(['⌨️', 'Associer une touche du clavier : lancer ce bouton sans la souris', () => bindKey(b)]);
        if (inTool) it.push(['🙈', 'Masquer ce bouton : barre simplifiée (clic droit sur la barre pour le réafficher)', () => hide(b)]);
        show(e, (i0 + ' ' + clean(lab)).trim(), (b.title || 'Raccourcis de ce bouton').replace(/[<>&]/g, '').slice(0, 160), it);
    }
    function forBar(e) {
        const it = [], H = J(KH, []);
        if (H.length) { H.forEach(k => { const [i, l] = hiddenLabel(k); it.push(['👁', 'Réafficher « ' + l + ' »', () => unhide(k)]); }); if (H.length > 1) it.push(['👁', 'Réafficher tous les boutons masqués', () => unhide('*')]); }
        if (window.XFOCUS && $('xfocus-btn')) it.push(['⛶', 'Mode focus (F) : seulement la zone de travail', () => XFOCUS.toggle()]);
        const s = $('xf-btn'); if (s) it.push(['🔎', 'Rechercher (Ctrl K)', () => s.click()]);
        it.push(['⌨️', 'Fiche des raccourcis (?)', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))]);
        const g = $('xs-gear'); if (g) it.push(['⚙️', 'Paramètres de l\'outil', () => g.click()]);
        show(e, '🧰 Barres', H.length ? H.length + ' bouton(s) masqué(s) dans cet outil.' : 'Astuce : clic droit sur un bouton pour ses raccourcis.', it);
    }
    document.addEventListener('contextmenu', e => {
        if (e.shiftKey || e.defaultPrevented) return;
        const t = e.target; if (!t.closest || !t.closest('#top-bar,#toolbar') || t.closest('#tabs-container,input,select,textarea,[contenteditable]')) return;
        const b = t.closest('button'); e.preventDefault(); e.stopPropagation();
        if (b && !b.disabled) forButton(e, b); else forBar(e);
    }, true);
    // ---------- clic droit dans la zone de travail (outils qui n'ont pas leur propre menu) ----------
    // ordre commun : actions de l'élément (Modifier, Dupliquer, Copier, Supprimer, puis les siennes) │ Nouveau, Annuler, Rétablir │ Exporter, Envoyer │ Focus, Rechercher
    const OWNCTX = /^(conduco|decoup|plano|syno|storyboardo|sono|ludo)$/; // ces outils gardent leur menu (déjà riche) ; le reste de la page suit le menu commun
    const RANK = [[/modifier|éditer|renommer|ouvrir|détails?|fiche/i, 0], [/dupliquer|copie/i, 1], [/copier/i, 2], [/supprimer|retirer|effacer|✕|🗑/i, 9]];
    const rank = b => { const t = labOf(b) + ' ' + (b.title || '') + ' ' + ico(b); for (const [r, n] of RANK) if (r.test(t)) return n; return 5; };
    const ITEM = '[data-id],[data-uid],[data-key],[data-idx],[data-i],tr,li,.card,.row,[class*=card],[class*=item]';
    function elemActions(t) {
        const out = []; let el = t.closest(ITEM);
        for (let k = 0; el && k < 3; k++) { const B = [...el.querySelectorAll('button,[role=button]')].filter(b => b.offsetWidth > 0 && !b.disabled && !b.closest('#top-bar,#toolbar') && labOf(b)); if (B.length) { B.sort((a, b) => rank(a) - rank(b)).slice(0, 8).forEach(b => out.push([ico(b) || '•', (labOf(b) + (b.title && b.title !== labOf(b) ? ' : ' + b.title : '')).slice(0, 120), () => b.click()])); break; } el = el.parentElement && el.parentElement.closest(ITEM); }
        return out;
    }
    const tbBtn = rx => { const tb = $('toolbar'); return tb ? [...tb.querySelectorAll('button')].find(b => b.offsetWidth > 0 && !b.disabled && rx.test(ico(b) + ' ' + (b.title || ''))) : null; };
    function forWork(e, t) {
        const it = [], sel = String(getSelection ? getSelection() : '').trim();
        if (sel) it.push(['📋', 'Copier la sélection : ' + sel.slice(0, 40), () => { try { navigator.clipboard.writeText(sel); say('📋 Copié'); } catch (x) { document.execCommand('copy'); } }]);
        it.push(...elemActions(t));
        const add = tbBtn(/^[➕＋]/); if (add) it.push(['➕', 'Nouvel élément (N) : ' + (add.title || labOf(add)), () => add.click()]);
        const un = tbBtn(/^↶|Annuler/), re = tbBtn(/^↷|Rétablir/); if (un) it.push(['↶', 'Annuler (Ctrl Z)', () => un.click()]); if (re) it.push(['↷', 'Rétablir (Ctrl Y)', () => re.click()]);
        if (window.XTOP && XTOP.exportItems && XTOP.exportItems().length) it.push(['⬇️', 'Exporter… (Ctrl E)', () => setTimeout(() => forButton(e, $('xtop-exp') || document.body), 0)]);
        const g = $('xgt-btn'); if (g && g.offsetWidth) it.push(['📤', 'Envoyer vers un autre outil…', () => setTimeout(() => forButton(e, g), 0)]);
        if (window.XFOCUS && $('xfocus-btn')) it.push(['⛶', (XFOCUS.on() ? 'Quitter le mode focus' : 'Mode focus') + ' (F)', () => XFOCUS.toggle()]);
        const s = $('xf-btn'); if (s) it.push(['🔎', 'Rechercher (Ctrl K)', () => s.click()]);
        if (it.length) show(e, '🧰 ' + (document.title || '').split(/ [—-] /)[0].slice(0, 30), 'Maj + clic droit : menu du navigateur.', it);
    }
    document.addEventListener('contextmenu', e => {
        if (e.shiftKey || e.defaultPrevented || OWNCTX.test(APPX)) return;
        const t = e.target; if (!t.closest || !$('toolbar') || t.closest('#top-bar,#toolbar,input,select,textarea,[contenteditable],a[href],img,video,canvas,[role=dialog],.modal,.modal-overlay,#xb-menu,#xt-pop,#xt-block,#xt-bar,#xs-ov,#xs-gear')) return;
        e.preventDefault(); forWork(e, t);
    }); // phase de propagation : un outil qui a son propre menu (preventDefault) garde la main
    // ---------- styles de la fenêtre « tapez la combinaison » ----------
    const st = document.createElement('style'); st.id = 'xctx-css';
    st.textContent = '#xctx-key{position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:2147483002;display:flex;flex-direction:column;gap:6px;max-width:420px;padding:14px 16px;border-radius:12px;background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);border:1px solid rgb(240,179,120);box-shadow:0 12px 32px rgba(0,0,0,.45);font:13px system-ui,"Segoe UI",sans-serif}#xctx-key span{color:var(--text-dim,#aaa);font-size:12.5px}';
    (document.head || document.documentElement).appendChild(st);
    let n = 0; const iv = setInterval(() => { applyHidden(); if (++n > 10) clearInterval(iv); }, 1500);
    window.XCTX = { applyHidden, unhide, hide };
})();
