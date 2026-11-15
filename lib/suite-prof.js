// SUITE XIII — module commun. Source : xiii-src/suite-prof.js
// =====================================================================
//  SUITE XIII — XPROF : profils et préréglages (saison 6, phase P)
//  Fenêtre « 💾 Profils et préréglages » (⚙️ › Affichage, page Réglages) :
//   · préréglages prêts : 🖥️ Bureau, 🎬 Plateau, 📽️ Présentation (densité, mode tournage, animations) ;
//   · mes profils : enregistrer l'ensemble de ses réglages d'affichage (couleur, thème, barres, accueil, raccourcis, animations,
//     réglages par outil…), puis les recharger en un clic ; export / import d'un fichier pour passer d'un appareil à l'autre ;
//   · préréglages du Master : partagés avec toute l'équipe par le Drive du projet (réglages du projet), chacun les applique en un clic.
//  Un profil ne touche qu'à l'affichage personnel : jamais aux données des projets.
// =====================================================================
(function () {
    if (window.XPROF) return;
    const KL = 'xiii.prof.list', KC = 'xiii.prof.cur';
    const KEYS = /^xiii\.(color$|ctheme$|home\.cfg$|tray\.|ux\.|ctx\.hide\.|anim\.cfg$|keys\.map$|tools\.cfg$|theme\.mode$|a11y)/;
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const anim = o => JSON.stringify(Object.assign({ sp: 1, it: 1, st: 'roll', snd: false }, o));
    const BUILT = [['bureau', '🖥️', 'Bureau', 'Confortable, animations normales, gros boutons désactivés.', { 'xiii.ux.shoot': '0', 'xiii.ux.density': 'confort', 'xiii.anim.cfg': anim({}) }],
        ['plateau', '🎬', 'Plateau', 'Mode tournage (gros boutons, contraste, écran allumé), interface compacte, animations rapides et discrètes.', { 'xiii.ux.shoot': '1', 'xiii.ux.density': 'compact', 'xiii.anim.cfg': anim({ sp: 1.6, it: .5, st: 'fade' }) }],
        ['presentation', '📽️', 'Présentation', 'Pour montrer à un client : interface aérée, entrées en fondu, aucun son.', { 'xiii.ux.shoot': '0', 'xiii.ux.density': 'confort', 'xiii.anim.cfg': anim({ sp: .8, it: 1, st: 'fade' }) }]];
    function snap() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (KEYS.test(k)) o[k] = localStorage.getItem(k); } return o; }
    function apply(o, full, name) {
        try { if (full) { const del = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (KEYS.test(k) && !(k in o)) del.push(k); } del.forEach(k => localStorage.removeItem(k)); }
            Object.keys(o).forEach(k => { if (KEYS.test(k)) localStorage.setItem(k, o[k]); }); W(KC, name || ''); } catch (e) { alert('Stockage plein : profil non appliqué en entier.'); }
        // recharge toute la suite (l'espace de travail et ses onglets) pour que chaque module relise ses réglages
        setTimeout(() => { try { (window.top || window).location.reload(); } catch (e) { location.reload(); } }, 150);
    }
    const pcfg = () => (typeof XPCFG !== 'undefined' ? XPCFG.get() : {}) || {};
    const master = () => { try { return typeof XPCFG === 'undefined' || XPCFG.isMaster(); } catch (e) { return true; } };
    // ---------- fenêtre ----------
    const css = document.createElement('style'); css.id = 'xprof-css';
    css.textContent = '#xpf-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}#xpf-box{width:min(620px,94vw);max-height:90vh;overflow-y:auto;background:var(--bg-panel,#1c1c20);color:var(--text-main,#eee);border:1px solid var(--border-color,#333);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:13.5px system-ui,sans-serif}' +
        '#xpf-box h3{margin:0;padding:16px 18px 2px;font:600 16px system-ui,sans-serif}#xpf-box .sub{padding:0 18px 8px;opacity:.65;font-size:12.5px}#xpf-box .f{padding:10px 18px;border-top:1px solid var(--border-color,#2a2a2e)}#xpf-box .f>b{display:block;margin-bottom:8px}' +
        '#xpf-box .r{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid var(--border-color,#333);border-radius:10px;margin-bottom:6px}#xpf-box .r.on{border-color:#f0b378;background:rgba(240,179,120,.08)}#xpf-box .r .i{font-size:20px}#xpf-box .r div{flex:1;min-width:0}#xpf-box .r small{display:block;opacity:.65;font-size:12px}' +
        '#xpf-box button{padding:5px 10px;border-radius:8px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;cursor:pointer;font:500 12.5px system-ui,sans-serif;white-space:nowrap}#xpf-box button:hover{background:rgba(255,255,255,.06)}#xpf-box button.p{border-color:rgba(240,179,120,.5);background:rgba(240,179,120,.12);color:#f6c79a}#xpf-box .row{display:flex;flex-wrap:wrap;gap:6px}#xpf-box .e{opacity:.6;font-size:12.5px}#xpf-box .ft{display:flex;padding:12px 18px;border-top:1px solid var(--border-color,#333)}';
    (document.head || document.documentElement).appendChild(css);
    function open() {
        close(); const L = J(KL, {}), cur = J(KC, ''), M = master(), TP = pcfg().profiles || {};
        const row = (id, ic, nm, ds, btns) => '<div class="r' + (cur === id ? ' on' : '') + '"><span class="i">' + ic + '</span><div><b>' + esc(nm) + (cur === id ? ' · actif' : '') + '</b><small>' + esc(ds) + '</small></div>' + btns + '</div>';
        const o = document.createElement('div'); o.id = 'xpf-ov'; o.setAttribute('role', 'dialog');
        o.innerHTML = '<div id="xpf-box"><h3>💾 Profils et préréglages</h3><div class="sub">Un profil regroupe tous vos réglages d\'affichage (couleur, thème, barres, accueil, raccourcis, animations, réglages par outil). Il ne touche jamais aux données des projets. Appliquer recharge la suite.</div>' +
            '<div class="f"><b>Préréglages</b>' + BUILT.map(p => row('b:' + p[0], p[1], p[2], p[3], '<button class="p" data-b="' + p[0] + '">Appliquer</button>')).join('') + '</div>' +
            '<div class="f"><b>Mes profils</b>' + (Object.keys(L).length ? Object.keys(L).map(n => row('u:' + n, '👤', n, Object.keys(L[n].k || {}).length + ' réglages · ' + new Date(L[n].at || 0).toLocaleDateString('fr-FR'), '<button class="p" data-u="' + esc(n) + '">Appliquer</button><button data-up="' + esc(n) + '" title="Remplacer par les réglages actuels">↻</button><button data-del="' + esc(n) + '" title="Supprimer">🗑</button>')).join('') : '<p class="e">Aucun profil enregistré.</p>') +
            '<div class="row" style="margin-top:6px"><button class="p" data-save>＋ Enregistrer mes réglages actuels…</button><button data-exp>⬇️ Exporter (fichier)</button><button data-imp>⬆️ Importer…</button></div></div>' +
            '<div class="f"><b>Préréglages du Master (toute l\'équipe)</b>' + (Object.keys(TP).length ? Object.keys(TP).map(n => row('m:' + n, '🎬', n, 'Partagé par le Master · ' + Object.keys(TP[n].k || {}).length + ' réglages', '<button class="p" data-m="' + esc(n) + '">Appliquer</button>' + (M ? '<button data-mdel="' + esc(n) + '" title="Retirer pour toute l\'équipe">🗑</button>' : ''))).join('') : '<p class="e">' + (M ? 'Aucun préréglage partagé.' : 'Le Master n\'a partagé aucun préréglage.') + '</p>') +
            (M ? '<div class="row" style="margin-top:6px"><button class="p" data-share>📤 Partager mes réglages actuels avec l\'équipe…</button></div><p class="e" style="margin:6px 0 0">Enregistré dans les réglages du projet : avec le Drive relié, chaque membre le retrouve sur tous ses appareils.</p>' : '') + '</div>' +
            '<div class="ft"><span style="flex:1"></span><button data-ok style="font-weight:700">✓ Terminé</button></div></div>';
        document.body.appendChild(o);
        o.addEventListener('click', async e => { const t = e.target; if (t === o || t.closest('[data-ok]')) return close(); const g = a => { const x = t.closest('[' + a + ']'); return x ? x.getAttribute(a) : null; };
            let v;
            if ((v = g('data-b'))) { const p = BUILT.find(x => x[0] === v); if (p) apply(p[4], false, 'b:' + v); return; }
            if ((v = g('data-u'))) { const p = J(KL, {})[v]; if (p) apply(p.k, true, 'u:' + v); return; }
            if ((v = g('data-m'))) { const p = (pcfg().profiles || {})[v]; if (p) apply(p.k, true, 'm:' + v); return; }
            if ((v = g('data-up'))) { if (!confirm('Remplacer le profil « ' + v + ' » par vos réglages actuels ?')) return; const L2 = J(KL, {}); L2[v] = { k: snap(), at: Date.now() }; W(KL, L2); W(KC, 'u:' + v); return open(); }
            if ((v = g('data-del'))) { if (!confirm('Supprimer le profil « ' + v + ' » ?')) return; const L2 = J(KL, {}); delete L2[v]; W(KL, L2); return open(); }
            if (t.closest('[data-save]')) { const n = (prompt('Nom du profil (ex. Bureau, Plateau, Montage) :', '') || '').trim(); if (!n) return; const L2 = J(KL, {}); if (L2[n] && !confirm('Remplacer le profil « ' + n + ' » ?')) return; L2[n] = { k: snap(), at: Date.now() }; if (!W(KL, L2)) alert('Stockage plein.'); W(KC, 'u:' + n); return open(); }
            if (t.closest('[data-exp]')) { const b = new Blob([JSON.stringify({ xiii: 'profils', v: 1, list: J(KL, {}), now: snap() }, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'Profils SUITE XIII.json'; document.body.appendChild(a); HTMLAnchorElement.prototype.click.call(a); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); return; }
            if (t.closest('[data-imp]')) { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = () => { const f = i.files[0]; if (!f) return; f.text().then(s => { let d = null; try { d = JSON.parse(s); } catch (x) { } if (!d || d.xiii !== 'profils' || !d.list) { alert('Ce fichier n\'est pas un export de profils SUITE XIII.'); return; } const L2 = Object.assign(J(KL, {}), d.list); W(KL, L2); open(); }); }; i.click(); return; }
            if (t.closest('[data-share]')) { const n = (prompt('Nom du préréglage d\'équipe (ex. Plateau régie, Bureau prod) :', '') || '').trim(); if (!n) return; const P2 = Object.assign({}, pcfg().profiles || {}); P2[n] = { k: snap(), at: Date.now() }; const r = await XPCFG.save({ profiles: P2 }); if (r && r.ok === false) alert('Partage impossible (' + (r.err || 'Drive') + ').'); return open(); }
            if ((v = g('data-mdel'))) { if (!confirm('Retirer « ' + v + ' » pour toute l\'équipe ?')) return; const P2 = Object.assign({}, pcfg().profiles || {}); delete P2[v]; await XPCFG.save({ profiles: P2 }); return open(); }
        });
    }
    function close() { const o = document.getElementById('xpf-ov'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xpf-ov')) { e.stopImmediatePropagation(); close(); } }, true);
    function row() { if (!document.getElementById('xs-panel') || document.getElementById('xpf-row')) return; const a = document.getElementById('xpid-row') || document.getElementById('xan-row') || document.getElementById('xtc-row') || document.getElementById('xbc-row'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xpf-row'; d.innerHTML = '<label>Profils et préréglages<small>Bureau, Plateau, Présentation, vos profils, ceux du Master.</small></label><div class="xs-c"><button type="button" class="xs-btn">💾 Choisir…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.parentNode.insertBefore(d, a.parentNode.firstChild === a ? a : a.nextSibling); }
    const go = () => new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XPROF = { open, close, snap, apply };
})();
