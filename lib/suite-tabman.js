// SUITE XIII — module commun. Source : xiii-src/suite-tabman.js
// =====================================================================
//  SUITE XIII — XTABMAN : gestion des onglets en tuiles (saison 6, phase D)
//  Clic droit sur la barre des onglets d'un outil (journées, versions, conducteurs, plans…) : une page de gestion
//  présente chaque onglet comme une tuile — ouvrir, renommer, dupliquer, supprimer, réordonner (glisser), en créer un.
//  Le module lit la barre telle que l'outil la dessine (.tab › .tab-title + boutons .tab-btn) : les actions déclenchent
//  les boutons d'origine, rien ne change dans le fonctionnement de l'outil. Réordonner : outils dont les onglets sont dans P.tabs.
//  Maj + clic droit : menu habituel du navigateur.
// =====================================================================
(function () {
    if (window.XTABMAN) return;
    const $ = (s, r) => (r || document).querySelector(s), esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const SKIP = ['ludo']; // onglets propres à l'outil (LUDO : la liste des jeux)
    const APP = typeof XIII_APP !== 'undefined' ? XIII_APP : '';
    const TABS = () => { const c = $('#tabs-container'); return c ? [...c.querySelectorAll(':scope > .tab')] : []; };
    const titleEl = t => t.querySelector('.tab-title') || t;
    const nameOf = t => { const ti = titleEl(t).cloneNode(true); ti.querySelectorAll('svg,.xgl-e,small,.xgl-ic').forEach(x => x.remove()); return (ti.textContent || '').replace(/\s+/g, ' ').trim() || 'Sans nom'; };
    const subOf = t => { const sm = titleEl(t).querySelector('small'), ti = titleEl(t).title || ''; return [sm && sm.textContent.trim(), ti.replace(/\s*—?\s*double-clic.*$/i, '').replace(/^Double-clic.*$/i, '').trim()].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' · '); };
    const icoOf = t => { const e = titleEl(t).querySelector('.xgl-e'); return e ? e.textContent.trim() : ''; };
    const reorderable = () => typeof P !== 'undefined' && P && Array.isArray(P.tabs) && typeof renderTabs === 'function' && P.tabs.length === TABS().length;
    const metaOf = i => { try { if (!reorderable()) return ''; const t = P.tabs[i]; for (const k in t) if (Array.isArray(t[k]) && t[k].length && typeof t[k][0] === 'object') return t[k].length + ' élément' + (t[k].length > 1 ? 's' : ''); } catch (e) { } return ''; };
    const isAdd = b => b && b.matches && b.matches('button') && /➕|＋|\+/.test(b.textContent) && !/suivant|élément|ligne|plan suivant|prise/i.test(b.title || '');
    const addBtn = () => { const c = $('#tabs-container'); if (!c) return null; const n = c.nextElementSibling; if (isAdd(n)) return n; const x = $('[data-xtop-tab]'); return isAdd(x) ? x : null; };
    const kind = b => { const s = ((b.title || '') + ' ' + b.textContent).toLowerCase(); if (/dupli|copie/.test(s)) return 'dup'; if (/suppr|fermer|retirer|✕|×/.test(s)) return 'del'; if (/renomm|modifier|✏️|nom/.test(s)) return 'ren'; return 'other'; };

    const css = document.createElement('style'); css.id = 'xtm-css';
    css.textContent =
        '#xtm{position:fixed;inset:0;z-index:9000;background:rgba(8,8,10,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px;animation:xtmF .18s ease-out}' +
        '@keyframes xtmF{from{opacity:0}}@keyframes xtmB{from{opacity:0;transform:translateY(10px) scale(.985)}}@keyframes xtmT{from{opacity:0;transform:translateY(8px)}}' +
        '#xtm .xtm-b{width:min(1100px,100%);max-height:min(820px,100%);display:flex;flex-direction:column;background:var(--bg-menu,#1d1d21);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.5);font:13px/1.45 system-ui,"Segoe UI",sans-serif;animation:xtmB .22s cubic-bezier(.2,.7,.2,1);overflow:hidden}' +
        '#xtm .xtm-hd{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border-color,#333)}#xtm .xtm-hd b{font-size:16px}#xtm .xtm-hd small{opacity:.6;flex:1}' +
        '#xtm .xtm-q{height:32px;width:220px;max-width:40vw;padding:0 10px;border-radius:9px;border:1px solid var(--border-color,#555);background:rgba(255,255,255,.04);color:inherit;font:inherit}#xtm .xtm-q:focus{outline:none;border-color:#f0b378}' +
        '#xtm button{font:inherit;color:inherit;cursor:pointer}#xtm .xtm-x{width:32px;height:32px;border-radius:9px;border:1px solid var(--border-color,#555);background:transparent}#xtm .xtm-x:hover{border-color:#f0b378}' +
        '#xtm .xtm-g{padding:18px;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;scrollbar-width:thin}' +
        '#xtm .xtm-t{position:relative;display:flex;flex-direction:column;gap:6px;min-height:150px;padding:14px 14px 10px;border-radius:14px;border:1px solid var(--border-color,#45454b);background:linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.01));cursor:pointer;transition:transform .16s cubic-bezier(.2,.7,.2,1),border-color .15s,box-shadow .16s;animation:xtmT .26s cubic-bezier(.2,.7,.2,1) backwards}' +
        '#xtm .xtm-t:hover{transform:translateY(-2px);border-color:rgba(240,179,120,.65);box-shadow:0 10px 26px rgba(0,0,0,.35)}#xtm .xtm-t:focus-visible{outline:2px solid #f0b378;outline-offset:2px}' +
        '#xtm .xtm-t.on{border-color:#f0b378;box-shadow:0 0 0 1px rgba(240,179,120,.5) inset}#xtm .xtm-t.drag{opacity:.4}#xtm .xtm-t.over{border-style:dashed;border-color:#f0b378}' +
        '#xtm .xtm-n{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:11px;background:rgba(240,179,120,.14);color:#f6c79a;font-weight:800;font-size:16px}#xtm .xtm-t.on .xtm-n{background:#f0b378;color:#1a1208}' +
        '#xtm .xtm-nm{font-weight:700;font-size:15px;line-height:1.25;word-break:break-word}#xtm .xtm-sb{font-size:12px;opacity:.6;line-height:1.35}' +
        '#xtm .xtm-bd{position:absolute;top:12px;right:12px;font-size:10.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#1a1208;background:#f0b378;border-radius:999px;padding:2px 8px}' +
        '#xtm .xtm-ac{display:flex;gap:4px;margin-top:auto;padding-top:8px;border-top:1px solid rgba(255,255,255,.06);opacity:.55;transition:opacity .15s}#xtm .xtm-t:hover .xtm-ac,#xtm .xtm-t:focus-within .xtm-ac{opacity:1}' +
        '#xtm .xtm-ac button{height:28px;min-width:30px;padding:0 8px;border-radius:8px;border:1px solid transparent;background:transparent;font-size:13px}#xtm .xtm-ac button:hover{border-color:var(--border-color,#555);background:rgba(255,255,255,.05)}#xtm .xtm-ac button.del:hover{border-color:rgba(229,115,115,.6);color:#ef9a9a}' +
        '#xtm .xtm-dr{margin-left:auto;cursor:grab;opacity:.6}' +
        '#xtm .xtm-new{align-items:center;justify-content:center;border-style:dashed;background:transparent;color:#f6c79a;font-weight:700;gap:8px}#xtm .xtm-new i{font-style:normal;font-size:30px;line-height:1}#xtm .xtm-new i svg,#xtm .xtm-new svg{width:30px!important;height:30px!important}#xtm .xtm-dr svg{width:14px;height:14px}' +
        '#xtm .xtm-ft{padding:10px 18px;border-top:1px solid var(--border-color,#333);font-size:12px;opacity:.6}' +
        '@media (prefers-reduced-motion:reduce){#xtm,#xtm *{animation:none!important;transition:none!important}}';
    (document.head || document.documentElement).appendChild(css);

    let ov = null, mo = null, dragI = -1;
    // pendant une action de l'outil (renommer, supprimer, nouvel onglet…), la page s'efface : la fenêtre ou le champ de l'outil
    // reste au premier plan ; elle revient, à jour, dès que la saisie est terminée
    const busy = () => { const f = document.activeElement; if (f && f !== document.body && !f.closest('#xtm') && /^(INPUT|TEXTAREA|SELECT)$/.test(f.tagName)) return true; if (f && f.isContentEditable && !f.closest('#xtm')) return true;
        return [...document.querySelectorAll('.modal-overlay,#modal,#custom-modal,.modal,[role=dialog],[role=alertdialog]')].some(m => m.id !== 'xtm' && !m.closest('#xtm') && m.offsetWidth > 0 && getComputedStyle(m).display !== 'none' && getComputedStyle(m).visibility !== 'hidden' && +getComputedStyle(m).opacity > 0.05); };
    function act(fn) { if (!ov) return fn(); const o = ov; o.style.transition = 'opacity .12s'; o.style.opacity = '0'; o.style.pointerEvents = 'none'; fn(); let n = 0;
        const back = () => { if (ov !== o) return; if (busy() && ++n < 600) { setTimeout(back, 150); return; } o.style.opacity = ''; o.style.pointerEvents = ''; draw(); const t = $('.xtm-t.on', o); if (t) try { t.focus({ preventScroll: true }); } catch (e) { } };
        setTimeout(back, 250); }
    function open() {
        if (!TABS().length) return; close(true);
        ov = document.createElement('div'); ov.id = 'xtm'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Gestion des onglets');
        ov.innerHTML = '<div class="xtm-b"><div class="xtm-hd"><b>🗂️ Onglets</b><small></small><input class="xtm-q" type="search" placeholder="Filtrer…" aria-label="Filtrer les onglets"><button class="xtm-x" title="Fermer (Échap)">✕</button></div><div class="xtm-g"></div><div class="xtm-ft"></div></div>';
        document.body.appendChild(ov);
        ov.addEventListener('pointerdown', e => { if (e.target === ov) close(); });
        $('.xtm-x', ov).onclick = () => close();
        $('.xtm-q', ov).oninput = draw;
        addEventListener('keydown', key, true);
        mo = new MutationObserver(() => { clearTimeout(mo.t); mo.t = setTimeout(draw, 60); }); const c = $('#tabs-container'); if (c) mo.observe(c, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        draw(true); setTimeout(() => { const q = $('.xtm-q', ov); if (q && TABS().length > 8) q.focus(); else { const t = $('.xtm-t.on', ov) || $('.xtm-t', ov); if (t) t.focus(); } }, 30);
    }
    function close(silent) {
        if (!ov) return; removeEventListener('keydown', key, true); if (mo) mo.disconnect(); const o = ov; ov = null;
        if (silent) { o.remove(); return; } try { o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-in' }).onfinish = () => o.remove(); } catch (e) { o.remove(); }
    }
    function key(e) {
        if (!ov) return; if (e.key === 'Escape' && ov.style.opacity !== '0') { e.preventDefault(); e.stopPropagation(); close(); return; }
        const f = document.activeElement; if (!f || !f.classList || !f.classList.contains('xtm-t')) return;
        if (e.key === 'Enter') { e.preventDefault(); f.click(); }
        else if (e.key === 'F2') { e.preventDefault(); const b = f.querySelector('[data-k=ren]'); if (b) b.click(); }
        else if (e.key === 'Delete') { e.preventDefault(); const b = f.querySelector('[data-k=del]'); if (b) b.click(); }
        else if (/^Arrow/.test(e.key)) { const L = [...ov.querySelectorAll('.xtm-t')], i = L.indexOf(f), g = $('.xtm-g', ov), per = Math.max(1, Math.round(g.clientWidth / (f.offsetWidth + 14))); const j = i + ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -per, ArrowDown: per }[e.key]); if (L[j]) { e.preventDefault(); L[j].focus(); } }
    }
    function draw(first) {
        if (!ov) return; const T = TABS(), q = ($('.xtm-q', ov).value || '').toLowerCase().trim(), canMove = reorderable() && !q, g = $('.xtm-g', ov), add = addBtn();
        const what = (typeof XIII_NAMES !== 'undefined' && XIII_NAMES[APP]) || document.title.replace(/\s*[—|-].*$/, '');
        $('.xtm-hd small', ov).textContent = T.length + ' onglet' + (T.length > 1 ? 's' : '') + ' · ' + what;
        $('.xtm-ft', ov).textContent = 'Clic : ouvrir · Entrée : ouvrir · F2 : renommer · Suppr : supprimer' + (canMove ? ' · glisser ⋮⋮ pour réordonner' : '') + ' · Échap : fermer';
        g.innerHTML = '';
        T.forEach((t, i) => {
            const nm = nameOf(t); if (q && nm.toLowerCase().indexOf(q) < 0 && subOf(t).toLowerCase().indexOf(q) < 0) return;
            const on = t.classList.contains('active'), d = document.createElement('div'); d.className = 'xtm-t' + (on ? ' on' : ''); d.tabIndex = 0; d.dataset.i = i; if (first) d.style.animationDelay = Math.min(i, 12) * 30 + 'ms';
            const ic = icoOf(t), sub = subOf(t), meta = metaOf(i);
            d.innerHTML = (on ? '<span class="xtm-bd">Ouvert</span>' : '') + '<span class="xtm-n">' + (ic ? esc(ic) : i + 1) + '</span><span class="xtm-nm">' + esc(nm) + '</span>' + (sub || meta ? '<span class="xtm-sb">' + esc([sub, meta].filter(Boolean).join(' · ')) + '</span>' : '') + '<div class="xtm-ac"></div>';
            const ac = d.querySelector('.xtm-ac'), ti = titleEl(t);
            // actions : les boutons d'origine de l'onglet
            const btns = [...t.querySelectorAll('.tab-btn')];
            if (!btns.some(b => kind(b) === 'ren') && ti.getAttribute('ondblclick')) { const r = document.createElement('button'); r.type = 'button'; r.dataset.k = 'ren'; r.title = 'Renommer / modifier'; r.textContent = '✏️'; r.onclick = e => { e.stopPropagation(); act(() => ti.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))); }; ac.appendChild(r); }
            btns.forEach(b => { const k = kind(b), r = document.createElement('button'); r.type = 'button'; r.dataset.k = k; if (k === 'del') r.className = 'del'; r.title = b.title || ''; r.textContent = (b.textContent || '').trim() || '•'; r.onclick = e => { e.stopPropagation(); act(() => b.click()); }; ac.appendChild(r); });
            if (canMove && T.length > 1) { const h = document.createElement('span'); h.className = 'xtm-dr'; h.textContent = '⋮⋮'; h.title = 'Glisser pour réordonner'; ac.appendChild(h); d.draggable = true;
                d.ondragstart = e => { dragI = i; d.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/xtm', String(i)); } catch (x) { } };
                d.ondragend = () => { d.classList.remove('drag'); dragI = -1; g.querySelectorAll('.over').forEach(x => x.classList.remove('over')); };
                d.ondragover = e => { if (dragI < 0 || dragI === i) return; e.preventDefault(); d.classList.add('over'); };
                d.ondragleave = () => d.classList.remove('over');
                d.ondrop = e => { e.preventDefault(); d.classList.remove('over'); move(dragI, i); }; }
            d.onclick = () => { if (!on) ti.click(); close(); };
            g.appendChild(d);
        });
        if (add && !q) { const n = document.createElement('button'); n.type = 'button'; n.className = 'xtm-t xtm-new'; n.innerHTML = '<i>＋</i>' + esc((add.title || 'Nouvel onglet').replace(/\s*\(.*\)$/, '')); n.onclick = () => { act(() => add.click()); }; if (first) n.style.animationDelay = Math.min(T.length, 12) * 30 + 'ms'; g.appendChild(n); }
        if (!g.children.length) g.innerHTML = '<p style="opacity:.6;grid-column:1/-1;text-align:center;margin:30px 0">Aucun onglet ne correspond.</p>';
    }
    // réordonner (outils dont les onglets sont dans P.tabs) : l'onglet ouvert reste ouvert
    function move(a, b) {
        if (!reorderable() || a < 0 || a === b) return; const act = P.tabs[P.active], it = P.tabs.splice(a, 1)[0]; P.tabs.splice(b, 0, it); P.active = P.tabs.indexOf(act);
        try { renderTabs(); } catch (e) { } try { if (typeof autosave === 'function') autosave(); else if (typeof save === 'function') save(); } catch (e) { }
        const g = ov && $('.xtm-g', ov), before = g ? new Map([...g.querySelectorAll('.xtm-t:not(.xtm-new)')].map(x => [x.querySelector('.xtm-nm').textContent, x.getBoundingClientRect()])) : null;
        draw(); if (g && before) g.querySelectorAll('.xtm-t:not(.xtm-new)').forEach(x => { const r0 = before.get(x.querySelector('.xtm-nm').textContent); if (!r0) return; const r = x.getBoundingClientRect(); try { x.animate([{ transform: 'translate(' + (r0.left - r.left) + 'px,' + (r0.top - r.top) + 'px)' }, { transform: 'none' }], { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' }); } catch (e) { } });
    }
    // clic droit sur la barre des onglets
    addEventListener('contextmenu', e => {
        if (e.shiftKey || SKIP.indexOf(APP) > -1) return; const c = e.target.closest && e.target.closest('#tabs-container'); if (!c || !TABS().length || e.target.closest('input,textarea,[contenteditable]')) return;
        e.preventDefault(); e.stopImmediatePropagation(); open();
    }, true);
    window.XTABMAN = { open, close };
})();
