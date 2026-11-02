// =====================================================================
//  STORYBOARDO XIII — 🎛️ Mode normal / mode expert (pantins)
//  Normal : personnages en silhouette (coiffure, tenue, vues, expressions), sans poignées d'articulation ni poses.
//  Expert (rig puppet) : pour tout l'outil (interrupteur en haut à droite), pour un plan (clic droit sur sa vignette)
//  ou pour un seul personnage de ce plan (clic droit sur lui).
// =====================================================================
var XEXPERT = window.XEXPERT || (() => {
    const all = () => !!prefs.expert;
    const on = (el, pn) => all() || !!(pn || PN()).expert || !!(el && el.expert);
    function setAll(v) { prefs.expert = !!v; savePrefs(); sync(); toast(v ? '🎛️ Mode expert : pantins articulés partout' : '🙂 Mode normal : silhouettes rapides, sans articulations', 2500); }
    function sync() { const c = document.getElementById('xexp-ck'); if (c) c.checked = all(); try { renderStage(); renderProps(); renderLibrary(); renderStrip(); } catch (e) { } }
    function css() {
        if (document.getElementById('xexp-css')) return; const s = document.createElement('style'); s.id = 'xexp-css';
        s.textContent = '#xexp{display:inline-flex;align-items:center;gap:7px;font:600 12px system-ui,sans-serif;color:var(--text-main,#eee);margin-right:10px;cursor:pointer;user-select:none}#xexp input{display:none}#xexp i{width:34px;height:18px;border-radius:9px;background:#555;position:relative;transition:.15s}#xexp i:after{content:"";position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:.15s}#xexp input:checked+i{background:#F0B378}#xexp input:checked+i:after{left:18px}.sb-th .xexp-b{position:absolute;top:3px;right:3px;font-size:11px}.xexp-pill{display:inline-block;font-size:11px;padding:1px 7px;border-radius:9px;background:rgba(240,179,120,.2);margin-left:6px}';
        document.head.appendChild(s);
    }
    function mountSwitch() {
        css(); if (document.getElementById('xexp')) return; const st = document.getElementById('save-state'); if (!st || !st.parentNode) return;
        st.insertAdjacentHTML('beforebegin', '<label id="xexp" title="Mode expert : poignées d\'articulation, poses et pantins (rig puppet) pour tout l\'outil. Sinon : clic droit sur un plan ou sur un personnage."><span>Expert</span><input type="checkbox" id="xexp-ck"' + (all() ? ' checked' : '') + '><i></i></label>');
        document.getElementById('xexp-ck').onchange = e => setAll(e.target.checked);
    }
    function ctx(x, y, title, items) {
        try { closePanelMenu(); } catch (e) { }
        const m = document.createElement('div'); m.id = 'sb-ctx'; m.className = 'sb-ctx';
        m.innerHTML = '<div class="sb-ctx-h">' + esc(title) + '</div>' + items.map((it, i) => '<button data-i="' + i + '">' + it[0] + '</button>').join('');
        document.body.appendChild(m); const r = m.getBoundingClientRect(); m.style.left = Math.min(x, innerWidth - r.width - 8) + 'px'; m.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + 'px';
        m.querySelectorAll('button').forEach(b => b.onclick = () => { m.remove(); items[+b.dataset.i][1](); });
        setTimeout(() => { const off = ev => { if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('mousedown', off, true); } }; document.addEventListener('mousedown', off, true); }, 0);
    }
    if (typeof pupJoints === 'function') {
        const _pj = pupJoints, _pm = panelMenu, _rl = renderLibrary, _rp = renderProps, _pf = poseFromHandle;
        // mode normal : aucune poignée d'articulation
        pupJoints = function (el) { const J = _pj(el); if (el && el.kind === 'puppet' && !on(el)) J.hide = JOINT_KEYS.slice(); return J; };
        poseFromHandle = function (el, key, m) { if (el && !on(el)) return; return _pf(el, key, m); };
        // clic droit sur la vignette d'un plan
        panelMenu = function (id, x, y) {
            _pm(id, x, y); const pn = P.panels.find(p => p.id === id), m = document.getElementById('sb-ctx'); if (!pn || !m) return;
            const b = document.createElement('button'); b.textContent = all() ? '🎛️ Mode expert actif partout' : pn.expert ? '🙂 Repasser ce plan en mode normal' : '🎛️ Mode expert sur ce plan';
            b.disabled = all(); b.onclick = () => { m.remove(); snap(); pn.expert = !pn.expert; dirty(); sync(); toast(pn.expert ? '🎛️ Plan ' + numOf(pn) + ' : pantins articulés' : '🙂 Plan ' + numOf(pn) + ' : mode normal', 2000); };
            m.insertBefore(b, m.querySelector('[data-a="del"]'));
        };
        // clic droit sur un personnage du plan
        document.addEventListener('contextmenu', e => {
            if (!e.target.closest || !e.target.closest('#stage')) return; const g = e.target.closest('[data-eid]');
            const el = g ? PN().els.find(x => x.id === g.dataset.eid) : selEl(); if (!el || el.kind !== 'puppet') return;
            e.preventDefault(); e.stopPropagation(); SEL = el.id; renderStage(); renderProps();
            const nm = el.name || (el.type === 'peep' ? 'Open Peeps' : 'ce personnage');
            ctx(e.clientX, e.clientY, '🧍 ' + nm, all() || PN().expert ? [['🎛️ Déjà en mode expert (' + (all() ? 'tout l\'outil' : 'ce plan') + ')', () => { }]] :
                [[el.expert ? '🙂 Repasser en silhouette (mode normal)' : '🎛️ Mode expert pour ce personnage (sur ce plan)', () => { snap(); el.expert = !el.expert; dirty(); renderStage(); renderProps(); renderLibrary(); renderStripThumb(PN()); toast(el.expert ? '🎛️ Pantin articulé : tirez ses ronds' : '🙂 Silhouette', 1800); }],
                ['🎛️ Mode expert sur tout le plan', () => { snap(); PN().expert = true; dirty(); sync(); }]]);
        }, true);
        // bibliothèque : les poses n'apparaissent qu'en mode expert
        renderLibrary = function () {
            _rl.apply(this, arguments);
            if (prefs.libTab !== 'pup' || on(selEl())) return; const box = $('lib-list'); if (!box) return;
            box.querySelectorAll('.sb-h').forEach(h => { if (/^Poses/.test(h.textContent)) { const n = h.nextElementSibling; if (n && n.classList.contains('sb-thumbs')) n.remove(); h.outerHTML = '<p class="hint">🙂 Mode normal : personnages en silhouette, sans articulations. Passez en <b>mode expert</b> (interrupteur en haut à droite, clic droit sur un plan ou sur un personnage) pour les pantins et les poses.</p>'; } });
            const f = $('lib-footer'); if (f && /savePose/.test(f.innerHTML)) f.innerHTML = '';
        };
        // propriétés : boutons d'articulation masqués en mode normal
        renderProps = function () {
            _rp.apply(this, arguments); const el = selEl(); if (!el || el.kind !== 'puppet') return; const box = $('props'); if (!box) return;
            const ph = box.querySelector('.sb-ph'); if (ph) ph.insertAdjacentHTML('beforeend', '<span class="xexp-pill">' + (on(el) ? '🎛️ expert' : '🙂 normal') + '</span>');
            if (on(el)) return;
            box.querySelectorAll('button').forEach(b => { const o = b.getAttribute('onclick') || ''; if (/setLibTab\('pup'\)|mirrorPose|savePose|restPose|pose=\{\}/.test(o)) b.remove(); });
            box.querySelectorAll('.hint').forEach(h => { if (/Tirez les ronds|Tout s’articule|seules les jambes/.test(h.textContent)) h.textContent = '🙂 Mode normal : silhouette sans articulations — clic droit sur le personnage pour le passer en pantin (mode expert).'; });
        };
        setTimeout(mountSwitch, 0); addEventListener('load', mountSwitch);
    }
    return { on, setAll, all };
})();
