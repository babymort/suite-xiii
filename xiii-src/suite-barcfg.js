// =====================================================================
//  SUITE XIII — XBARCFG : les barres à la carte (saison 6, phase P)
//  Une fenêtre « 🧰 Barres à la carte » (clic droit sur la barre, ou ⚙️ › Affichage) :
//   · Ordre des secteurs de la seconde barre (Créer, Afficher, Modifier, Outils métier, Assistants) : glisser ou ↑ ↓ —
//     le même ordre dans tous les outils ;
//   · Boutons de l'outil : ★ en favori (rangés en tête de barre, dans « ★ Favoris ») · 👁 visible ou masqué ;
//   · Tout remettre comme à l'origine.
//  Les favoris et boutons masqués sont propres à chaque outil ; l'ordre des secteurs vaut pour toute la suite.
// =====================================================================
(function () {
    if (window.XBARCFG) return;
    const APPX = typeof XIII_APP !== 'undefined' ? XIII_APP : '', $ = id => document.getElementById(id);
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const KO = 'xiii.ux.bar.order', KF = 'xiii.ux.bar.fav.' + APPX, KH = 'xiii.ctx.hide.' + APPX;
    const ico = b => { const i = b.querySelector('.btn-icon'); if (i) return i.innerHTML; const s = b.querySelector('svg'); return s ? s.outerHTML : esc((b.textContent || '').trim().slice(0, 2)); };
    const css = document.createElement('style'); css.id = 'xbarcfg-css';
    css.textContent =
        '#xbc{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font:13px/1.45 system-ui,"Segoe UI",sans-serif}' +
        '#xbc .b{width:min(720px,100%);max-height:min(860px,100%);display:flex;flex-direction:column;background:var(--bg-menu,#1d1d21);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden}' +
        '#xbc .h{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--border-color,#333)}#xbc .h b{font-size:16px;flex:1}#xbc button{font:inherit;color:inherit;cursor:pointer}' +
        '#xbc .x{width:32px;height:32px;border-radius:9px;border:1px solid var(--border-color,#555);background:transparent}#xbc .c{overflow:auto;padding:16px 18px;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin}' +
        '#xbc h5{margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.6}#xbc .hint{font-size:12px;opacity:.6;margin:-4px 0 8px}' +
        '#xbc .ord{display:flex;flex-wrap:wrap;gap:6px}#xbc .ord div{display:flex;align-items:center;gap:6px;height:34px;padding:0 6px 0 12px;border-radius:10px;border:1px solid var(--border-color,#4a4a50);background:var(--bg-panel,#26262b);cursor:grab;transition:transform .15s,border-color .15s}#xbc .ord div.over{border-color:#f0b378;border-style:dashed}#xbc .ord div.drag{opacity:.4}' +
        '#xbc .ord i{font-style:normal;font-weight:800;opacity:.45;font-size:11px}#xbc .ord button{width:22px;height:22px;border-radius:6px;border:0;background:transparent;opacity:.6}#xbc .ord button:hover{opacity:1;background:rgba(255,255,255,.07)}' +
        '#xbc .sec{margin-bottom:10px}#xbc .sec>b{display:block;font-size:12px;opacity:.75;margin:6px 0 4px}#xbc .row{display:flex;align-items:center;gap:10px;padding:5px 8px;border-radius:9px}#xbc .row:hover{background:rgba(255,255,255,.04)}#xbc .row.off{opacity:.45}' +
        '#xbc .row .ic{width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex:none}#xbc .row .ic svg{width:16px;height:16px}#xbc .row .lb{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '#xbc .tg{width:30px;height:28px;border-radius:8px;border:1px solid var(--border-color,#4a4a50);background:transparent;font-size:14px;opacity:.55;transition:opacity .15s,background .15s,border-color .15s}#xbc .tg.on{opacity:1;border-color:#f0b378;background:rgba(240,179,120,.16)}' +
        '#xbc .f{display:flex;gap:8px;justify-content:space-between;padding:12px 18px;border-top:1px solid var(--border-color,#333)}#xbc .f button{height:32px;padding:0 14px;border-radius:9px;border:1px solid var(--border-color,#555);background:transparent}#xbc .f .ok{background:#f0b378;border-color:#f0b378;color:#1a1208;font-weight:700}';
    (document.head || document.documentElement).appendChild(css);
    const refresh = () => { try { if (window.XCTX) XCTX.applyHidden(); } catch (e) { } try { if (window.XSECT && XSECT.refresh) XSECT.refresh(); } catch (e) { } };
    function open() {
        const S = window.XSECT; if (!S || !S.SECT0) return; close(); const tb = $('toolbar');
        const ov = document.createElement('div'); ov.id = 'xbc'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Barres à la carte');
        ov.innerHTML = '<div class="b"><div class="h"><b>🧰 Barres à la carte</b><button class="x" title="Fermer (Échap)">✕</button></div><div class="c"></div><div class="f"><button data-reset>↺ Tout remettre comme à l’origine</button><button class="ok" data-ok>✓ Terminé</button></div></div>';
        document.body.appendChild(ov); const C = ov.querySelector('.c');
        const draw = () => {
            const O = J(KO, []), base = S.SECT0.slice().sort((a, b) => { const i = O.indexOf(a[0]), j = O.indexOf(b[0]); return (i < 0 ? 99 + S.SECT0.indexOf(a) : i) - (j < 0 ? 99 + S.SECT0.indexOf(b) : j); });
            const F = J(KF, []), H = J(KH, []);
            // boutons de la seconde barre, par secteur
            const groups = []; if (tb) [['fav', '★ Favoris']].concat(base).forEach(([k, n]) => { const g = tb.querySelector(':scope > .xsec[data-sec="' + k + '"]'); if (!g) return; const B = [...g.querySelectorAll('button')].filter(b => b.offsetWidth > 0 || b.dataset.xctxh); if (B.length) groups.push([n, B]); });
            C.innerHTML = '<div><h5>Ordre des secteurs</h5><p class="hint">Glissez ou utilisez ↑ ↓ — le même ordre dans tous les outils. « ★ Favoris » reste en tête.</p><div class="ord">' + base.map(([k, n], i) => '<div draggable="true" data-k="' + k + '"><i>' + (i + 1) + '</i>' + esc(n) + '<button type="button" data-mv="-1" title="Avant">‹</button><button type="button" data-mv="1" title="Après">›</button></div>').join('') + '</div></div>' +
                '<div><h5>Boutons de cet outil</h5><p class="hint">★ : en favori, rangé en tête de barre · 👁 : visible (décochez pour masquer).</p>' +
                (groups.length ? groups.map(([n, B]) => '<div class="sec"><b>' + esc(n) + '</b>' + B.map(b => { const k = S.keyOf(b), off = H.indexOf(k) > -1, fv = F.indexOf(k) > -1; return '<div class="row' + (off ? ' off' : '') + '" data-key="' + esc(k) + '"><span class="ic">' + ico(b) + '</span><span class="lb">' + esc(S.labOf(b) || k) + '</span><button type="button" class="tg' + (fv ? ' on' : '') + '" data-a="fav" title="Favori">★</button><button type="button" class="tg' + (off ? '' : ' on') + '" data-a="vis" title="Visible">👁</button></div>'; }).join('') + '</div>').join('') : '<p class="hint">Aucun bouton dans la seconde barre de cet outil.</p>') + '</div>';
            // ordre : glisser / flèches
            const ord = C.querySelector('.ord'), keys = () => [...ord.children].map(d => d.dataset.k); let dragK = null;
            ord.querySelectorAll('[data-k]').forEach(d => {
                d.ondragstart = e => { dragK = d.dataset.k; d.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; };
                d.ondragend = () => { d.classList.remove('drag'); ord.querySelectorAll('.over').forEach(x => x.classList.remove('over')); };
                d.ondragover = e => { if (dragK && dragK !== d.dataset.k) { e.preventDefault(); d.classList.add('over'); } }; d.ondragleave = () => d.classList.remove('over');
                d.ondrop = e => { e.preventDefault(); const L = keys().filter(k => k !== dragK); L.splice(L.indexOf(d.dataset.k), 0, dragK); W(KO, L); refresh(); draw(); };
                d.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => { const L = keys(), i = L.indexOf(d.dataset.k), j = i + +b.dataset.mv; if (j < 0 || j >= L.length) return; L.splice(j, 0, L.splice(i, 1)[0]); W(KO, L); refresh(); draw(); });
            });
            C.querySelectorAll('.row [data-a]').forEach(b => b.onclick = () => { const k = b.closest('.row').dataset.key;
                if (b.dataset.a === 'fav') { const F2 = J(KF, []), i = F2.indexOf(k); if (i > -1) F2.splice(i, 1); else F2.push(k); W(KF, F2); }
                else { const H2 = J(KH, []), i = H2.indexOf(k); if (i > -1) H2.splice(i, 1); else H2.push(k); W(KH, H2); }
                refresh(); setTimeout(draw, 60); });
        };
        draw();
        ov.querySelector('.x').onclick = ov.querySelector('[data-ok]').onclick = close; ov.addEventListener('pointerdown', e => { if (e.target === ov) close(); });
        ov.querySelector('[data-reset]').onclick = () => { if (!confirm('Remettre l’ordre des secteurs (toute la suite), les favoris et les boutons masqués (cet outil) comme à l’origine ?')) return; try { localStorage.removeItem(KO); localStorage.removeItem(KF); localStorage.removeItem(KH); } catch (e) { } refresh(); setTimeout(draw, 60); };
        addEventListener('keydown', esc_, true);
    }
    const esc_ = e => { if (e.key === 'Escape' && $('xbc')) { e.preventDefault(); e.stopPropagation(); close(); } };
    function close() { const o = $('xbc'); if (o) o.remove(); removeEventListener('keydown', esc_, true); }
    // entrée dans ⚙️ › Affichage (sous « Couleur de la suite »)
    function row() { const pan = $('xs-panel'); if (!pan || $('xbc-row')) return; const a = $('xcolor-sw') || ($('xdense-sw') && $('xdense-sw').closest('.xs-f')); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xbc-row'; d.innerHTML = '<label>Barres à la carte<small>Ordre des secteurs, favoris, boutons masqués.</small></label><div class="xs-c"><button type="button" class="xs-btn">🧰 Personnaliser…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.after(d); }
    const go = () => new MutationObserver(() => { if ($('xs-panel')) row(); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XBARCFG = { open, close };
})();
