// SUITE XIII — module commun. Source : xiii-src/suite-kmap.js
// =====================================================================
//  SUITE XIII — XKMAP : raccourcis clavier personnalisables (saison 6, phase P)
//  · chaque raccourci commun de la suite peut recevoir une autre touche (fenêtre « ⌨️ Raccourcis clavier ») ;
//  · la nouvelle touche est traduite en l'ancienne avant tous les outils : aucun outil n'a besoin d'être modifié ;
//  · l'ancienne touche est libérée (elle ne fait plus rien), sauf si elle est reprise par un autre raccourci ;
//  · profils de touches : enregistrer / charger / supprimer des ensembles (ex. « Plateau », « Montage ») ;
//  · réglage personnel, valable pour tous les projets (clés xiii.keys.*).
// =====================================================================
(function () {
    if (window.XKMAP) return;
    const ACT = [['Ctrl K', 'Rechercher / lancer une action'], ['?', 'Fiche des raccourcis'], ['Ctrl S', 'Enregistrer'], ['Ctrl O', 'Ouvrir un fichier du projet'], ['Ctrl E', 'Exporter'], ['Ctrl Z', 'Annuler'], ['Ctrl Y', 'Rétablir'], ['N', 'Nouvel élément'], ['Ctrl D', 'Dupliquer la sélection'], ['Suppr', 'Supprimer la sélection'], ['F', 'Mode focus'], ['I', 'Panneau des propriétés'], ['Ctrl Maj P', 'Présentation client'], ['[', 'Afficher / masquer la bibliothèque']];
    const KM = 'xiii.keys.map', KP = 'xiii.keys.prof';
    const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
    const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    let MAP = get(KM, {}); // { combo par défaut : combo choisie }
    const NAMES = { ' ': 'Espace', Delete: 'Suppr', Backspace: 'Retour', Enter: 'Entrée', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Tab: 'Tab', Home: 'Début', End: 'Fin', PageUp: 'PgPréc', PageDown: 'PgSuiv' };
    const REV = Object.fromEntries(Object.entries(NAMES).map(([a, b]) => [b, a]));
    function combo(e) {
        if (/^(Control|Shift|Alt|Meta|Dead|Unidentified)$/.test(e.key)) return '';
        const one = e.key.length === 1 && e.key !== ' ', mod = e.ctrlKey || e.metaKey, P = [];
        if (mod) P.push('Ctrl'); if (e.altKey) P.push('Alt'); if (e.shiftKey && (mod || e.altKey || !one)) P.push('Maj');
        let k = NAMES[e.key] || (one ? e.key.toUpperCase() : e.key); if (one && (mod || e.altKey) && e.code && /^Key[A-Z]$/.test(e.code)) k = e.code.slice(3); // Ctrl + lettre : la lettre de la touche
        P.push(k); return P.join(' ');
    }
    function fire(t, c) {
        const P = c.split(' '), k = P.pop(), ctrl = P.includes('Ctrl'), sh = P.includes('Maj'), alt = P.includes('Alt');
        let key = REV[k] || k; if (key.length === 1 && /[A-Z]/.test(key)) key = sh ? key : key.toLowerCase();
        const code = /^[A-Za-z]$/.test(key) ? 'Key' + key.toUpperCase() : key === '[' ? 'BracketLeft' : key === 'Delete' ? 'Delete' : '';
        const o = { key, code, ctrlKey: ctrl, metaKey: false, shiftKey: sh, altKey: alt, bubbles: true, cancelable: true, composed: true };
        window.__xkmBusy = true; try { (t || document.body).dispatchEvent(new KeyboardEvent('keydown', o)); (t || document.body).dispatchEvent(new KeyboardEvent('keyup', o)); } finally { window.__xkmBusy = false; }
    }
    const typing = t => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    addEventListener('keydown', e => {
        if (window.__xkmBusy || !e.isTrusted || capturing) return; const c = combo(e); if (!c) return;
        const keys = Object.keys(MAP); if (!keys.length) return;
        const def = keys.find(d => MAP[d] === c);
        if (def) { if (typing(e.target) && !/Ctrl|Alt/.test(c)) return; e.preventDefault(); e.stopImmediatePropagation(); fire(e.target, def); return; }
        if (MAP[c] && MAP[c] !== c && !typing(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); } // ancienne touche libérée
    }, true);
    // ---------- fenêtre de réglage ----------
    let capturing = null;
    const css = document.createElement('style'); css.id = 'xkmap-css';
    css.textContent = '#xkm-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}#xkm-box{width:min(620px,94vw);max-height:88vh;display:flex;flex-direction:column;background:var(--bg-panel,#1c1c20);color:var(--text-main,#eee);border:1px solid var(--border-color,#333);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:13.5px system-ui,sans-serif}' +
        '#xkm-box h3{margin:0;padding:16px 18px 6px;font:600 16px system-ui,sans-serif}#xkm-box .xkm-sub{padding:0 18px 10px;opacity:.65;font-size:12.5px}#xkm-l{overflow-y:auto;padding:0 18px}#xkm-l .r{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border-color,#2a2a2e)}#xkm-l .r span{flex:1}' +
        '#xkm-box kbd{display:inline-block;min-width:22px;text-align:center;padding:3px 8px;border-radius:7px;border:1px solid var(--border-color,#444);background:rgba(255,255,255,.05);font:600 12px ui-monospace,monospace}#xkm-box kbd.ch{border-color:#f0b378;color:#f6c79a}#xkm-box kbd.wait{animation:xkmB 1s infinite}@keyframes xkmB{50%{opacity:.4}}' +
        '#xkm-box button{padding:5px 10px;border-radius:8px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;cursor:pointer;font:500 12.5px system-ui,sans-serif}#xkm-box button:hover{background:rgba(255,255,255,.06)}#xkm-box .ft{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 18px;border-top:1px solid var(--border-color,#333)}#xkm-box select{background:transparent;color:inherit;border:1px solid var(--border-color,#444);border-radius:8px;padding:5px}#xkm-box .msg{width:100%;font-size:12px;color:#ef9a9a;min-height:15px}';
    (document.head || document.documentElement).appendChild(css);
    function save() { put(KM, MAP); }
    const cur = d => MAP[d] || d;
    function open() {
        close(); const o = document.createElement('div'); o.id = 'xkm-ov'; o.setAttribute('role', 'dialog');
        o.innerHTML = '<div id="xkm-box"><h3>⌨️ Raccourcis clavier</h3><div class="xkm-sub">Cliquez sur « Changer », puis appuyez sur la nouvelle touche. Valable dans tous les outils et tous les projets.</div><div id="xkm-l"></div><div class="ft"><div class="msg"></div><label>Profil <select id="xkm-p"></select></label><button data-a="ps">💾 Enregistrer le profil…</button><button data-a="pd">🗑</button><span style="flex:1"></span><button data-a="rs">↺ Tout par défaut</button><button data-a="ok" style="font-weight:700">✓ Terminé</button></div></div>';
        document.body.appendChild(o); draw();
        o.addEventListener('click', ev => { if (ev.target === o) close(); const a = ev.target.closest('[data-a]'); if (!a) return; const P = get(KP, {});
            if (a.dataset.a === 'ok') close();
            if (a.dataset.a === 'rs') { MAP = {}; save(); draw(); }
            if (a.dataset.a === 'ps') { const n = (prompt('Nom du profil (ex. Plateau, Montage) :', '') || '').trim(); if (!n) return; P[n] = { ...MAP }; put(KP, P); draw(n); }
            if (a.dataset.a === 'pd') { const n = o.querySelector('#xkm-p').value; if (!n || n === '_std') return; delete P[n]; put(KP, P); draw(); }
            if (a.dataset.a === 'ch') { capturing = a.dataset.d; draw(); }
            if (a.dataset.a === 'rz') { delete MAP[a.dataset.d]; save(); draw(); } });
        o.querySelector('#xkm-p').onchange = ev => { const v = ev.target.value; MAP = v === '_std' ? {} : { ...(get(KP, {})[v] || {}) }; save(); draw(v); };
    }
    function draw(sel) {
        const o = document.getElementById('xkm-ov'); if (!o) return; const P = get(KP, {});
        o.querySelector('#xkm-l').innerHTML = ACT.map(([d, l]) => '<div class="r"><span>' + l + '</span>' + (capturing === d ? '<kbd class="wait">appuyez…</kbd>' : '<kbd class="' + (MAP[d] ? 'ch' : '') + '" title="Par défaut : ' + d + '">' + cur(d) + '</kbd>') + '<button data-a="ch" data-d="' + d + '">Changer</button>' + (MAP[d] ? '<button data-a="rz" data-d="' + d + '" title="Revenir à ' + d + '">↺</button>' : '<button disabled style="visibility:hidden">↺</button>') + '</div>').join('');
        const s = o.querySelector('#xkm-p'); s.innerHTML = '<option value="_std">Standard</option>' + Object.keys(P).map(n => '<option>' + n.replace(/[<>&]/g, '') + '</option>').join('');
        if (sel) s.value = sel; else { const m = JSON.stringify(MAP); const f = Object.keys(P).find(n => JSON.stringify(P[n]) === m); s.value = f || '_std'; }
    }
    function msg(t) { const m = document.querySelector('#xkm-box .msg'); if (m) m.textContent = t || ''; }
    addEventListener('keydown', e => {
        if (!capturing || !document.getElementById('xkm-ov')) return; e.preventDefault(); e.stopImmediatePropagation();
        if (e.key === 'Escape') { capturing = null; draw(); msg(''); return; }
        const c = combo(e); if (!c) return; const d = capturing;
        const other = ACT.map(a => a[0]).find(x => x !== d && cur(x) === c);
        if (other) { msg('« ' + c + ' » est déjà utilisé pour : ' + ACT.find(a => a[0] === other)[1]); capturing = null; draw(); return; }
        if (c === d) delete MAP[d]; else MAP[d] = c; capturing = null; save(); draw(); msg('');
    }, true);
    function close() { capturing = null; const o = document.getElementById('xkm-ov'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (e.key === 'Escape' && !capturing && document.getElementById('xkm-ov')) { e.stopImmediatePropagation(); close(); } }, true);
    addEventListener('storage', e => { if (e.key === KM) MAP = get(KM, {}); });
    // entrée dans ⚙️ › Affichage (sous « Barres à la carte »)
    function row() { const pan = document.getElementById('xs-panel'); if (!pan || document.getElementById('xkm-row')) return; const a = document.getElementById('xbc-row'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xkm-row'; d.innerHTML = '<label>Raccourcis clavier<small>Changer les touches, profils de touches.</small></label><div class="xs-c"><button type="button" class="xs-btn">⌨️ Personnaliser…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.after(d); }
    const go = () => new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    window.XKMAP = { open, close, combo, map: () => ({ ...MAP }) };
})();
