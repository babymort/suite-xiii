// =====================================================================
//  SUITE XIII — XTOOLCFG : réglages par outil (saison 6, phase P)
//  Fenêtre « 🧰 Réglages par outil » (⚙️ › Affichage, ou page Réglages › Apparence) :
//   · nom affiché, icône (emoji) et couleur de chaque outil — repris sur les tuiles de l'accueil, dans les onglets
//     de l'espace de travail et dans le titre de l'onglet du navigateur ;
//   · outils de démarrage : ouverts automatiquement (en arrière-plan) à l'ouverture de l'espace de travail ;
//   · l'ordre des onglets se règle toujours en les glissant dans la barre des onglets.
//  Réglage personnel, valable pour tous les projets (clés xiii.tools.*).
// =====================================================================
(function () {
    if (window.XTOOLCFG) return;
    const KC = 'xiii.tools.cfg', KD = 'xiii.tools.def';
    const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
    const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const APP = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
    let C = get(KC, {}); // { app: { n: nom, i: emoji, c: couleur, boot: true } }
    // ---------- accueil : relevé des outils (nom, icône, couleur d'origine) + application ----------
    function cards() { return [...document.querySelectorAll('a.card[href$=".html"]')].filter(a => a.querySelector('.card-name')); }
    const appOfA = a => a.getAttribute('href').replace(/\.html.*$/, '');
    function snapshot() {
        const L = cards(); if (!L.length) return; const D = get(KD, {}); let ch = false;
        L.forEach(a => { const k = appOfA(a); if (D[k]) return; const nm = a.querySelector('.card-name'); D[k] = { n: (nm.firstChild && nm.firstChild.nodeType === 3 ? nm.firstChild.textContent : nm.textContent).trim(), i: ((a.querySelector('.card-icon') || {}).textContent || '').trim(), c: (a.style.getPropertyValue('--dc') || '').trim() }; ch = true; });
        if (ch) put(KD, D);
    }
    function applyHome() {
        const D = get(KD, {});
        cards().forEach(a => { const k = appOfA(a), c = C[k] || {}, d = D[k] || {}; const nm = a.querySelector('.card-name'), ic = a.querySelector('.card-icon');
            if (nm && nm.firstChild && nm.firstChild.nodeType === 3) { const v = (c.n || d.n || '') + ' '; if (v.trim() && nm.firstChild.textContent !== v) nm.firstChild.textContent = v; }
            if (ic) { const v = c.i || d.i; if (v && ic.textContent !== v) ic.textContent = v; }
            const col = c.c || d.c; if (col && a.style.getPropertyValue('--dc') !== col) a.style.setProperty('--dc', col); });
    }
    // ---------- outil : titre de l'onglet du navigateur ----------
    function applyTitle() { const c = C[APP]; if (!c || !c.n) return; const D = get(KD, {}), d = D[APP]; if (!d || !d.n) return; if (document.title.indexOf(d.n) === 0) document.title = c.n + document.title.slice(d.n.length); }
    // ---------- espace de travail : onglets (nom, couleur, icône) + outils de démarrage ----------
    function applyEsp() {
        if (typeof T === 'undefined' || typeof CATC === 'undefined') return; const D = get(KD, {});
        Object.keys(D).forEach(k => { const c = C[k] || {}; if (!T.__x) T.__x = {}; if (!(k in T.__x)) T.__x[k] = [T[k], CATC[k]]; const o = T.__x[k]; T[k] = c.n ? c.n.toUpperCase() : o[0]; if (c.c) CATC[k] = c.c; else if (o[1]) CATC[k] = o[1]; else delete CATC[k]; });
        try { draw(); } catch (e) { }
    }
    function iconsEsp() {
        document.querySelectorAll('#tabs .t[data-id] img').forEach(im => { const m = /logos\/([a-z0-9]+)\.png/.exec(im.getAttribute('src') || ''); if (!m) return; const c = C[m[1]]; let s = im.nextElementSibling && im.nextElementSibling.classList.contains('xtc-i') ? im.nextElementSibling : null;
            if (c && c.i) { im.style.display = 'none'; if (!s) { s = document.createElement('i'); s.className = 'xtc-i'; s.style.cssText = 'font-style:normal;font-size:15px;line-height:1;position:static;display:inline;background:none;width:auto;height:auto'; im.after(s); } if (s.textContent !== c.i) s.textContent = c.i; }
            else { if (im.style.display === 'none') im.style.display = ''; if (s) s.remove(); } });
    }
    function bootEsp() {
        let done = false; try { done = sessionStorage.getItem('xiii.tools.boot') === '1'; sessionStorage.setItem('xiii.tools.boot', '1'); } catch (e) { }
        if (done || typeof S === 'undefined' || !S.list) return; const B = Object.keys(C).filter(k => C[k].boot);
        B.forEach(k => { if (!S.list.some(t => (String(t.url).split(/[?#]/)[0].split('/').pop() || '').replace(/\.html$/, '') === k)) try { open(k + '.html', true); } catch (e) { } });
    }
    function applyAll() { if (APP === 'espace') { applyEsp(); iconsEsp(); } else if (APP === 'index') applyHome(); applyTitle(); }
    // ---------- fenêtre ----------
    const css = document.createElement('style'); css.id = 'xtoolcfg-css';
    css.textContent = '#xtc-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}#xtc-box{width:min(760px,95vw);max-height:88vh;display:flex;flex-direction:column;background:var(--bg-panel,#1c1c20);color:var(--text-main,#eee);border:1px solid var(--border-color,#333);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:13.5px system-ui,sans-serif}' +
        '#xtc-box h3{margin:0;padding:16px 18px 4px;font:600 16px system-ui,sans-serif}#xtc-box .sub{padding:0 18px 10px;opacity:.65;font-size:12.5px}#xtc-l{overflow-y:auto;padding:0 18px}#xtc-l .r{display:grid;grid-template-columns:40px minmax(0,1fr) 46px 44px auto 30px;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--border-color,#2a2a2e)}' +
        '#xtc-l .r.hd{font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.55;border-top:0}#xtc-l input[type=text]{width:100%;box-sizing:border-box;padding:5px 8px;border-radius:7px;border:1px solid var(--border-color,#444);background:rgba(255,255,255,.04);color:inherit}#xtc-l input.ic{text-align:center;padding:5px 2px}#xtc-l input[type=color]{width:40px;height:28px;border:0;background:none;padding:0;cursor:pointer}#xtc-l .pv{font-size:20px;text-align:center}#xtc-l label{display:flex;gap:5px;align-items:center;font-size:12px;white-space:nowrap}' +
        '#xtc-box button{padding:5px 10px;border-radius:8px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;cursor:pointer;font:500 12.5px system-ui,sans-serif}#xtc-box button:hover{background:rgba(255,255,255,.06)}#xtc-box .ft{display:flex;gap:8px;align-items:center;padding:12px 18px;border-top:1px solid var(--border-color,#333)}';
    (document.head || document.documentElement).appendChild(css);
    function save() { put(KC, C); applyAll(); }
    function open_() {
        close(); const D = get(KD, {}), K = Object.keys(D).filter(k => k !== 'index');
        const o = document.createElement('div'); o.id = 'xtc-ov'; o.setAttribute('role', 'dialog');
        o.innerHTML = '<div id="xtc-box"><h3>🧰 Réglages par outil</h3><div class="sub">Nom, icône et couleur de chaque outil (accueil, onglets, titre). « Au démarrage » : l\'outil s\'ouvre tout seul dans l\'espace de travail. L\'ordre des onglets se règle en les glissant.</div><div id="xtc-l">' +
            (K.length ? '<div class="r hd"><span></span><span>Nom affiché</span><span>Icône</span><span>Couleur</span><span>Démarrage</span><span></span></div>' + K.map(k => { const c = C[k] || {}, d = D[k]; return '<div class="r" data-k="' + k + '"><span class="pv">' + esc(c.i || d.i) + '</span><input type="text" data-f="n" placeholder="' + esc(d.n) + '" value="' + esc(c.n || '') + '"><input type="text" class="ic" data-f="i" maxlength="4" placeholder="' + esc(d.i) + '" value="' + esc(c.i || '') + '"><input type="color" data-f="c" value="' + (/^#[0-9a-f]{6}$/i.test(c.c || d.c || '') ? (c.c || d.c) : '#f0b429') + '"><label><input type="checkbox" data-f="boot"' + (c.boot ? ' checked' : '') + '> au démarrage</label><button data-rz title="Revenir à l\'origine">↺</button></div>'; }).join('') : '<p style="opacity:.7">Ouvrez l\'accueil une fois pour que la liste des outils soit relevée.</p>') +
            '</div><div class="ft"><span style="flex:1"></span><button data-all>↺ Tout remettre à l\'origine</button><button data-ok style="font-weight:700">✓ Terminé</button></div></div>';
        document.body.appendChild(o);
        o.addEventListener('input', e => { const r = e.target.closest('.r[data-k]'); if (!r) return; const k = r.dataset.k, f = e.target.dataset.f, c = C[k] = C[k] || {};
            const v = f === 'boot' ? e.target.checked : e.target.value.trim(); if (f === 'c' && v === (D[k].c || '')) delete c.c; else if (v) c[f] = v; else delete c[f];
            if (!Object.keys(c).length) delete C[k]; r.querySelector('.pv').textContent = (C[k] && C[k].i) || D[k].i; save(); });
        o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-ok]')) return close();
            const rz = e.target.closest('[data-rz]'); if (rz) { delete C[rz.closest('.r').dataset.k]; save(); open_(); }
            if (e.target.closest('[data-all]') && confirm('Remettre le nom, l\'icône, la couleur et le démarrage de tous les outils à l\'origine ?')) { C = {}; save(); open_(); } });
    }
    function close() { const o = document.getElementById('xtc-ov'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xtc-ov')) { e.stopImmediatePropagation(); close(); } }, true);
    addEventListener('storage', e => { if (e.key === KC) { C = get(KC, {}); applyAll(); } });
    // entrée dans ⚙️ › Affichage (sous « Raccourcis clavier » / « Barres à la carte »)
    function row() { if (!document.getElementById('xs-panel') || document.getElementById('xtc-row')) return; const a = document.getElementById('xkm-row') || document.getElementById('xbc-row'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xtc-row'; d.innerHTML = '<label>Réglages par outil<small>Nom, icône, couleur, outils de démarrage.</small></label><div class="xs-c"><button type="button" class="xs-btn">🧰 Personnaliser…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open_, 120); }; a.after(d); }
    const start = () => {
        if (APP === 'index') snapshot(); applyAll(); if (APP === 'espace') setTimeout(bootEsp, 1500);
        let t = 0; new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); if (APP === 'espace') iconsEsp(); else if (APP === 'index') { clearTimeout(t); t = setTimeout(applyHome, 80); } }).observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start();
    window.XTOOLCFG = { open: open_, close, apply: applyAll };
})();
