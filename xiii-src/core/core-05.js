// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-05.js
// =====================================================================
//  SUITE XIII — XUNAME : annuler / rétablir partout, avec le nom de ce qui a été annulé
//  • Ctrl+Z, Ctrl+Maj+Z et Ctrl+Y dans tous les outils (Ctrl+Y ajouté là où il manquait)
//  • après chaque annulation, le message dit ce qui a changé : « ↶ Annulé : ✎ Tâche « Prépa » (end) »
//  Fonctionne avec l'historique propre de chaque outil : on compare l'état enregistré avant et après.
// =====================================================================
const XUNAME = (() => {
    let APP = '', busy = false;
    const say = m => { try { if (typeof toast === 'function') toast(m, 3500); } catch (e) { } };
    const typing = e => { const t = e.target; return t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable); };
    function name(before, after, redo) {
        let G = []; try { G = XDELEG._t.changes(before, before, after); } catch (e) { }
        if (!G.length) return null;
        const ico = { add: '＋', del: '－', mod: '✎' }, lab = G.slice(0, 2).map(g => ico[g.op] + ' ' + g.lab + (g.op === 'mod' && g.fields && g.fields.length ? ' (' + g.fields.slice(0, 3).map(f => f.split('.').pop()).join(', ') + ')' : '')).join(' · ') + (G.length > 2 ? ' + ' + (G.length - 2) + ' autre(s)' : '');
        return (redo ? '↷ Rétabli : ' : '↶ Annulé : ') + lab;
    }
    const raw = () => { const o = {}; (XDELEG.KEYS[APP] || []).forEach(k => { const v = localStorage.getItem(k); if (v != null) o[k] = v; }); return o; }; // sans forcer d'enregistrement (cela fausserait l'historique de l'outil)
    function watch(redo) {
        if (busy) return; busy = true; const before = raw();
        setTimeout(() => { const after = raw(), n = name(before, after, redo); if (n) say(n); busy = false; }, 650);
    }
    function init(app) {
        APP = app; if (typeof XDELEG === 'undefined' || !XDELEG.KEYS[app]) return;
        addEventListener('keydown', e => {
            if (!(e.ctrlKey || e.metaKey) || e.altKey || typing(e)) return; const k = (e.key || '').toLowerCase();
            if (k === 'z') watch(e.shiftKey);
            else if (k === 'y') watch(true);
        }, true);
        addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (!b) return; const t = (b.title || '') + ' ' + b.textContent; if (/^\s*↶|^Annuler\b/.test(b.title || '') || /^\s*↶\s*$/.test(b.textContent)) watch(false); else if (/^\s*↷|^Rétablir\b/.test(b.title || '') || /^\s*↷\s*$/.test(b.textContent)) watch(true); }, true);
    }
    return { init };
})();

XUNAME.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XTRAY : 🧺 panier commun pour glisser des éléments d'un outil à l'autre
//  Languette à droite de chaque outil → panneau : 🧺 Panier (gardé d'un outil à l'autre) · 👥 Annuaire · 📦 Cet outil.
//  On glisse un élément de « Cet outil » ou de l'annuaire dans le panier, on ouvre un autre outil et on le glisse
//  dans la page (ou bouton « → Ajouter ici ») : contact → équipe du jour (CALL SHEETO), personne (TRANSPORTO),
//  talent (CASTO) · caméra → plan (PLANO) · matériel → caisse (PACKINGO) · élément → tâche (PLANNO), texte (DOSSIER).
// =====================================================================
const XTRAY = (() => {
    let APP = '', TAB = 'tray', open = false;
    const K = 'xiii.tray', MIME = 'application/x-xiii';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const say = m => { try { if (typeof toast === 'function') toast(m, 3500); } catch (e) { } };
    const NAMES = () => (typeof XDELEG !== 'undefined' && XDELEG.NAMES) || {};
    const tray = () => J(K, []), saveTray = L => { try { localStorage.setItem(K, JSON.stringify(L.slice(0, 60))); } catch (e) { } draw(); };
    const isCam = it => /cam(e|é)ra|\bcam\b|ptz|camescope|camcorder/i.test(fold((it.name || '') + ' ' + (it.cat || '') + ' ' + (it.kind || '')));
    // ---------- éléments de l'outil ouvert ----------
    const NAMEK = ['name', 'n', 'label', 'title', 'nom', 'text', 'role', 'desc'];
    const nameOf = o => { for (const k of NAMEK) if (typeof o[k] === 'string' && o[k].trim()) return o[k].trim().slice(0, 80); return ''; };
    function elements() {
        const out = [], seen = new Set(); if (typeof XDELEG === 'undefined') return out;
        (XDELEG.KEYS[APP] || []).forEach(k => { let v; try { v = JSON.parse(localStorage.getItem(k)); } catch (e) { return; }
            const walk = (n, d, col) => { if (!n || typeof n !== 'object' || d > 6 || out.length > 300) return; if (Array.isArray(n)) { n.forEach(x => walk(x, d + 1, col)); return; }
                const nm = n.id != null ? nameOf(n) : ''; if (nm && !seen.has(nm + '|' + col)) { seen.add(nm + '|' + col); out.push({ t: 'el', name: nm, col, role: n.role || '', cat: n.cat || n.type || n.kind || n.dept || '', phone: n.phone || n.ph || '', email: n.email || '', src: APP }); }
                Object.keys(n).forEach(c => { if (n[c] && typeof n[c] === 'object') walk(n[c], d + 1, Array.isArray(n[c]) ? c : col); }); };
            walk(v, 0, ''); });
        return out;
    }
    const contacts = () => (J('xiii.annuaire', []) || []).filter(c => c && c.name).map(c => ({ t: 'contact', name: c.name, role: c.role || '', dept: c.dept || '', phone: c.phone || '', email: c.email || '', src: 'annuaire' }));
    // ---------- dépôt dans l'outil ouvert ----------
    const mkid = () => (typeof uid === 'function' ? uid() : 'x' + Math.random().toString(36).slice(2, 10));
    const today = () => new Date().toISOString().slice(0, 10);
    function persist() { try { if (typeof dirty === 'function') dirty(); } catch (e) { } try { if (typeof saveProject === 'function') saveProject(false); else if (typeof autosave === 'function') autosave(); } catch (e) { } try { if (typeof renderAll === 'function') renderAll(); else if (typeof render === 'function') render(); } catch (e) { } }
    const ADD = {
        callsheeto: { lab: 'ajouter à l\'équipe du jour', run(it) { const d = P.days[typeof cur === 'number' ? cur : 0]; if (!d) return 'Aucune journée'; d.crew = d.crew || []; if (d.crew.some(c => fold(c.name) === fold(it.name))) return 'déjà dans l\'équipe du jour'; d.crew.push({ id: mkid(), dept: it.dept || '', role: it.role || '', name: it.name, phone: it.phone || '', email: it.email || '', call: '' }); return '👥 ' + it.name + ' ajouté·e à l\'équipe du jour'; } },
        transporto: { lab: 'ajouter aux personnes', run(it) { P.people = P.people || []; if (P.people.some(p => fold(p.n) === fold(it.name))) return 'déjà dans la liste'; P.people.push({ id: mkid(), n: it.name, role: it.role || '', ph: it.phone || '', arr: '', dep: '', hotel: false, need: '', note: '' }); return '🚐 ' + it.name + ' ajouté·e'; } },
        casto: { lab: 'ajouter comme talent', run(it) { P.talents = P.talents || []; if (P.talents.some(t => fold(t.name) === fold(it.name))) return 'déjà dans le casting'; P.talents.push({ id: mkid(), name: it.name, role: it.role || '', kind: 'comedien', status: 'pressenti', avail: {}, days: [], tags: [], cachetType: 'jour', phone: it.phone || '', email: it.email || '' }); return '🎭 ' + it.name + ' ajouté·e au casting'; } },
        planno: { lab: 'créer une tâche', run(it) { P.tasks = P.tasks || []; P.tasks.push({ id: mkid(), name: (it.t === 'contact' ? 'Contacter ' : '') + it.name, phase: 'prepa', start: today(), end: today(), who: it.t === 'contact' ? [it.name] : [], status: 'todo' }); return '📅 Tâche « ' + it.name + ' » créée'; } },
        packingo: { lab: 'ajouter à la caisse active', run(it) { if (typeof addItem !== 'function') return null; const cs = (P.cases || []), id = (typeof prefs !== 'undefined' && prefs.activeCase) || (cs[0] && cs[0].id); if (!id) { if (typeof newCase === 'function') { newCase(undefined, true); } const c2 = (P.cases || [])[0]; if (!c2) return 'Créez d\'abord une caisse'; return (addItem(c2.id, { name: it.name, cat: 'div' }, 1), '🧳 Caisse créée et « ' + it.name + ' » ajouté'); } addItem(id, { name: it.name, cat: 'div' }, 1); return '🧳 « ' + it.name + ' » ajouté à la caisse'; } },
        plano: { lab: 'placer sur le plan', run(it) { if (typeof itemFromLib !== 'function' || typeof LIB === 'undefined') return null; const lib = LIB.find(l => l.id === (isCam(it) ? 'cam-studio' : 'cam-studio')); const ob = isCam(it) && lib ? itemFromLib(lib, 700, 500) : { id: mkid(), kind: 'text', x: 700, y: 500, rot: 0, text: it.name, size: (P.settings && P.settings.labelSize || 20) * 1.2, color: null, bold: true, locked: false }; if (ob.kind !== 'text') ob.label = it.name; if (typeof addItem === 'function') addItem(ob); return isCam(it) ? '📐 Caméra « ' + it.name + ' » placée au centre du plan' : '📐 « ' + it.name + ' » ajouté au plan'; } },
        dossier: { lab: 'ajouter au texte de l\'élément ouvert', run(it) { const f = typeof findSection === 'function' && P.ui ? findSection(P.ui.sel) : null; if (!f) return 'Ouvrez d\'abord un élément du dossier'; const line = '<p><b>' + esc(it.name) + '</b>' + [it.role, it.phone, it.email].filter(Boolean).map(x => ' · ' + esc(x)).join('') + '</p>'; f.s.text = (f.s.text || '') + line; try { if (typeof renderContent === 'function') renderContent(); } catch (e) { } return '📚 « ' + it.name + ' » ajouté à « ' + f.s.title + ' »'; } }
    };
    function drop(it) {
        const a = ADD[APP]; let r = null;
        if (a) { try { r = a.run(it); } catch (e) { console.warn('XTRAY', e); r = null; } }
        if (r == null) { const txt = [it.name, it.role, it.phone, it.email].filter(Boolean).join(' · '); try { navigator.clipboard.writeText(txt); } catch (e) { } say('📋 « ' + it.name + ' » copié : collez-le où vous voulez dans ' + (NAMES()[APP] || 'cet outil')); return; }
        persist(); say(r); draw();
    }
    // ---------- panneau ----------
    function itemHtml(it, i, where) { return '<div class="xt-it" draggable="true" data-w="' + where + '" data-i="' + i + '"><span class="xt-ic">' + (it.t === 'contact' ? '👤' : isCam(it) ? '🎥' : '▫️') + '</span><span class="xt-tx"><b>' + esc(it.name) + '</b><small>' + esc([it.role, it.col && it.t === 'el' ? it.col : '', it.src && where === 'tray' ? (NAMES()[it.src] || it.src) : ''].filter(Boolean).join(' · ')) + '</small></span>' + (where === 'tray' ? (ADD[APP] ? '<button data-add title="' + esc(ADD[APP].lab) + '">→ Ici</button>' : '') + '<button data-rm title="Retirer du panier">✕</button>' : '<button data-keep title="Mettre dans le panier">🧺</button>' + (where === 'book' && ADD[APP] ? '<button data-add title="' + esc(ADD[APP].lab) + '">→ Ici</button>' : '')) + '</div>'; }
    let LISTS = {};
    function draw() {
        const p = document.getElementById('xt-panel'); if (!p) return; const tab = document.getElementById('xt-tab'); const T = tray(); if (tab) tab.dataset.n = T.length || '';
        if (!open) { p.classList.remove('on'); return; } p.classList.add('on');
        const q = fold((document.getElementById('xt-q') || {}).value || '');
        LISTS = { tray: T, book: contacts(), tool: elements() }; const L = (LISTS[TAB] || []).map((x, i) => [x, i]).filter(([x]) => !q || fold(x.name + ' ' + x.role + ' ' + (x.col || '')).indexOf(q) > -1);
        const body = p.querySelector('.xt-body');
        body.innerHTML = (TAB === 'tray' && !T.length ? '<p class="xt-d">Le panier est vide. Glissez ici un élément de « 📦 Cet outil » ou de « 👥 Annuaire », puis ouvrez un autre outil et glissez-le dans la page.</p>' : '') + L.slice(0, 200).map(([x, i]) => itemHtml(x, i, TAB)).join('') + (TAB !== 'tray' && !L.length ? '<p class="xt-d">Rien à afficher.</p>' : '');
        body.querySelectorAll('.xt-it').forEach(el => {
            const it = () => LISTS[el.dataset.w][+el.dataset.i];
            el.addEventListener('dragstart', e => { e.dataTransfer.setData(MIME, JSON.stringify(it())); e.dataTransfer.setData('text/plain', it().name); e.dataTransfer.effectAllowed = 'copy'; document.body.classList.add('xt-dragging'); });
            el.addEventListener('dragend', () => document.body.classList.remove('xt-dragging'));
            const b = s => el.querySelector(s);
            if (b('[data-add]')) b('[data-add]').onclick = () => drop(it());
            if (b('[data-rm]')) b('[data-rm]').onclick = () => { const L2 = tray(); L2.splice(+el.dataset.i, 1); saveTray(L2); };
            if (b('[data-keep]')) b('[data-keep]').onclick = () => keep(it());
        });
        p.querySelectorAll('[data-tb]').forEach(b => b.classList.toggle('on', b.dataset.tb === TAB));
        const hint = p.querySelector('.xt-hint'); hint.textContent = ADD[APP] ? 'Déposer ici : ' + ADD[APP].lab : 'Déposer ici : copie le texte (collez-le dans l\'outil)';
    }
    function keep(it) { const L = tray(); if (L.some(x => x.name === it.name && x.src === it.src)) { say('Déjà dans le panier'); return; } L.unshift(Object.assign({}, it, { at: Date.now() })); saveTray(L); say('🧺 « ' + it.name + ' » mis dans le panier'); }
    function build() {
        if (document.getElementById('xt-tab')) return;
        document.body.insertAdjacentHTML('beforeend', '<button id="xt-tab" title="🧺 Panier XIII : glisser des éléments d\'un outil à l\'autre">🧺</button><aside id="xt-panel"><div class="xt-h"><b>🧺 Panier XIII</b><span class="xt-x">✕</span></div><div class="xt-tabs"><button data-tb="tray">🧺 Panier</button><button data-tb="book">👥 Annuaire</button><button data-tb="tool">📦 Cet outil</button></div><input id="xt-q" placeholder="Filtrer…"><div class="xt-drop">⬇️ Glissez ici pour garder dans le panier</div><div class="xt-body"></div><div class="xt-hint"></div></aside><div id="xt-zone"><span></span></div>');
        const p = document.getElementById('xt-panel');
        document.getElementById('xt-tab').onclick = () => { open = !open; draw(); };
        p.querySelector('.xt-x').onclick = () => { open = false; draw(); };
        p.querySelectorAll('[data-tb]').forEach(b => b.onclick = () => { TAB = b.dataset.tb; draw(); });
        document.getElementById('xt-q').oninput = draw;
        const dz = p.querySelector('.xt-drop');
        dz.addEventListener('dragover', e => { if (e.dataTransfer.types.includes(MIME)) { e.preventDefault(); dz.classList.add('ov'); } });
        dz.addEventListener('dragleave', () => dz.classList.remove('ov'));
        dz.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); dz.classList.remove('ov'); try { keep(JSON.parse(e.dataTransfer.getData(MIME))); } catch (er) { } });
        // dépôt dans l'outil : n'importe où hors du panneau
        const zone = document.getElementById('xt-zone');
        document.addEventListener('dragover', e => { if (!e.dataTransfer || !e.dataTransfer.types.includes(MIME) || e.target.closest('#xt-panel')) { zone.classList.remove('on'); return; } e.preventDefault(); zone.classList.add('on'); zone.querySelector('span').textContent = '⬇️ ' + (NAMES()[APP] || 'Outil') + ' : ' + (ADD[APP] ? ADD[APP].lab : 'copier le texte'); }, true);
        document.addEventListener('drop', e => { zone.classList.remove('on'); if (!e.dataTransfer || !e.dataTransfer.types.includes(MIME) || e.target.closest('#xt-panel')) return; e.preventDefault(); e.stopPropagation(); try { drop(JSON.parse(e.dataTransfer.getData(MIME))); } catch (er) { } }, true);
        document.addEventListener('dragend', () => zone.classList.remove('on'), true);
        addEventListener('storage', e => { if (e.key === K) draw(); });
        draw();
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xt-css';
        s.textContent = '#xt-tab{position:fixed;right:0;top:46%;z-index:10100;writing-mode:vertical-rl;padding:10px 5px;border-radius:10px 0 0 10px;border:1px solid rgba(240,179,120,.6);border-right:0;background:var(--bg-menu,#232327);color:#fff;cursor:pointer;font-size:16px;box-shadow:-4px 4px 16px rgba(0,0,0,.4)}#xt-tab[data-n]:not([data-n=""])::after{content:attr(data-n);writing-mode:horizontal-tb;display:block;margin-top:4px;background:#f0b378;color:#222;border-radius:8px;font:700 10px/15px sans-serif;padding:0 4px}' +
            '#xt-panel{position:fixed;right:0;top:56px;bottom:12px;width:310px;z-index:10110;display:none;flex-direction:column;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);border-right:0;border-radius:12px 0 0 12px;box-shadow:-10px 0 30px rgba(0,0,0,.5);font:13px/1.4 "Segoe UI",system-ui,sans-serif}#xt-panel.on{display:flex}' +
            '.xt-h{display:flex;justify-content:space-between;padding:10px 12px 4px}.xt-x{cursor:pointer;opacity:.7}.xt-tabs{display:flex;gap:4px;padding:4px 10px}.xt-tabs button{flex:1;font:inherit;font-size:12px;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:5px 4px;cursor:pointer}.xt-tabs button.on{background:rgba(240,179,120,.3);border-color:rgb(240,179,120)}' +
            '#xt-q{margin:6px 10px;font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:6px 8px}.xt-drop{margin:0 10px 6px;padding:8px;border:1.5px dashed rgba(240,179,120,.5);border-radius:8px;text-align:center;color:var(--text-dim,#aaa);font-size:12px}.xt-drop.ov{background:rgba(240,179,120,.2);color:#fff}' +
            '.xt-body{flex:1;overflow:auto;padding:0 10px}.xt-it{display:flex;gap:6px;align-items:center;padding:6px 6px;border:1px solid var(--border-soft,#333);border-radius:8px;margin-bottom:4px;cursor:grab;background:rgba(128,128,128,.06)}.xt-it:hover{border-color:rgba(240,179,120,.6)}.xt-tx{flex:1;min-width:0}.xt-tx b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xt-tx small{color:var(--text-dim,#999);font-size:11px}.xt-it button{font:inherit;font-size:11.5px;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:6px;padding:2px 6px;cursor:pointer;white-space:nowrap}' +
            '.xt-d{color:var(--text-dim,#999);font-size:12px}.xt-hint{padding:6px 12px 10px;color:var(--text-dim,#aaa);font-size:11.5px;border-top:1px solid var(--border-soft,#333)}' +
            '#xt-zone{position:fixed;inset:0;z-index:10105;pointer-events:none;display:none;align-items:flex-end;justify-content:center;padding-bottom:30px;box-shadow:inset 0 0 0 4px rgba(240,179,120,.8);background:rgba(240,179,120,.06)}#xt-zone.on{display:flex}#xt-zone span{background:#1f1d1a;color:#fff;border:1px solid #f0b378;border-radius:10px;padding:8px 14px;font:600 14px "Segoe UI",sans-serif}@media(max-width:700px){#xt-panel{width:86vw}}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; if (app === 'index' || app === 'jour') return; css();
        const go = () => build(); XBOOT.ready(go, 1200);
    }
    return { init, drop, keep };
})();

XTRAY.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XA11Y : accessibilité et clavier, dans tous les outils et l'accueil
//  • nom lisible par les lecteurs d'écran pour chaque bouton à icône seule (repris de son info-bulle)
//  • tout ce qui se clique se rejoint au clavier (Tab), s'active avec Entrée / Espace ; contour de focus visible
//  • lien « Aller au contenu » ; Échap ferme les fenêtres de la suite
//  • taille du texte réglable (⚙️ Paramètres › Affichage, ou Ctrl + Alt + / -) — 90 % à 150 %, retenue pour toute la suite
//  • contrastes : textes secondaires rendus plus lisibles (option « Contraste renforcé »)
// =====================================================================
const XA11Y = (() => {
    const K = 'xiii.a11y';
    const J = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } };
    const W = o => { try { localStorage.setItem(K, JSON.stringify(o)); } catch (e) { } };
    const SIZES = [90, 100, 110, 125, 150];
    function applyPrefs() {
        const p = J(), z = p.size || 100, root = document.documentElement;
        root.style.zoom = z === 100 ? '' : (z / 100); root.classList.toggle('xa-contrast', !!p.contrast);
    }
    function setSize(dir) { const p = J(), i = SIZES.indexOf(p.size || 100); p.size = SIZES[Math.max(0, Math.min(SIZES.length - 1, (i < 0 ? 1 : i) + dir))]; W(p); applyPrefs(); try { if (typeof toast === 'function') toast('🔠 Taille du texte : ' + p.size + ' %'); } catch (e) { } }
    // ---------- étiquettes et clavier ----------
    const CLICKY = '[onclick]:not(button):not(a):not(input):not(select):not(textarea):not(label):not(body):not(html),.tab,.tab-title,.card[data-key],[data-open],[data-cv],.xt-it,.xmm-more,.xc-c,.cp-click,.xs-item';
    function label(root) {
        (root || document).querySelectorAll('button:not([aria-label]),a[href]:not([aria-label])').forEach(b => {
            const lab = b.querySelector('.btn-label'), visible = lab && getComputedStyle(lab).display !== 'none' && lab.textContent.trim();
            const txt = (b.textContent || '').replace(/[\u{1F000}-\u{1FAFF}←-⯿️✓✕＋−]/gu, '').trim();
            if (visible || txt.length > 2) return;
            const t = (b.title || '').split(/ : | — |\. /)[0].trim(); if (t) b.setAttribute('aria-label', t);
        });
        (root || document).querySelectorAll(CLICKY).forEach(el => { if (el.dataset.xa || el.closest('[contenteditable]')) return; el.dataset.xa = 1; if (!el.hasAttribute('tabindex')) el.tabIndex = 0; if (!el.getAttribute('role')) el.setAttribute('role', 'button'); });
    }
    function onKey(e) {
        if (e.key === 'Escape') { // fermer la fenêtre de la suite la plus récente
            const ovs = ['#xb-menu', '#xt-panel.on', '#xg-ov', '#xmm-ov', '#xhs-ov', '#xdr-ov', '#xdl-ov', '#xf-ov', '#xft-ov'].map(s => document.querySelector(s)).filter(Boolean);
            const o = ovs[0]; if (o) { if (o.id === 'xt-panel') { const t = document.getElementById('xt-tab'); if (t) t.click(); } else o.remove(); e.preventDefault(); }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '6')) { e.preventDefault(); setSize(e.key === '-' || e.key === '6' ? -1 : 1); return; }
        if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.dataset && e.target.dataset.xa && e.target.getAttribute('role') === 'button') { e.preventDefault(); e.target.click(); }
    }
    // ---------- réglages dans ⚙️ Paramètres ----------
    function inSettings() {
        const pan = document.getElementById('xs-panel'); if (!pan || pan.querySelector('#xa-set')) return;
        const p = J(), sec = pan.querySelector('.xs-sec[data-sec="aff"] .xs-in') || pan.querySelector('.xs-in'); if (!sec) return;
        const d = document.createElement('div'); d.id = 'xa-set'; d.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid var(--border-color,#444)';
        d.innerHTML = '<b style="display:block;margin-bottom:6px">♿ Accessibilité</b><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span>Taille du texte</span>' + SIZES.map(s => '<button type="button" data-xs="' + s + '" style="padding:4px 9px;border-radius:7px;border:1px solid var(--border-color,#555);background:' + ((p.size || 100) === s ? 'rgba(240,179,120,.35)' : 'transparent') + ';color:inherit;cursor:pointer">' + s + ' %</button>').join('') + '</div>' +
            '<label style="display:flex;gap:8px;align-items:center;margin-top:8px;cursor:pointer"><input type="checkbox" id="xa-ct"' + (p.contrast ? ' checked' : '') + '> Contraste renforcé (textes secondaires plus lisibles)</label><p style="font-size:11.5px;color:var(--text-dim,#999);margin:6px 0 0">Raccourcis : Ctrl + K rechercher · Ctrl + Alt + / − taille du texte · Tab pour se déplacer · Entrée pour activer · Échap pour fermer.</p>' + (typeof XTIPS !== 'undefined' ? '<button type="button" id="xa-tips" style="margin-top:6px;padding:4px 9px;border-radius:7px;border:1px solid var(--border-color,#555);background:transparent;color:inherit;cursor:pointer">💡 Réafficher les astuces</button>' : '');
        sec.appendChild(d);
        d.querySelectorAll('[data-xs]').forEach(b => b.onclick = () => { const q = J(); q.size = +b.dataset.xs; W(q); applyPrefs(); d.remove(); inSettings(); });
        const tr = d.querySelector('#xa-tips'); if (tr) tr.onclick = () => { XTIPS.reset(); tr.textContent = '✓ Les astuces reviendront au fil de votre travail'; };
        d.querySelector('#xa-ct').onchange = e => { const q = J(); q.contrast = e.target.checked; W(q); applyPrefs(); };
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xa-css';
        s.textContent = ':focus-visible{outline:2px solid #f0b378!important;outline-offset:2px!important;border-radius:4px}button:focus-visible,[role=button]:focus-visible{box-shadow:0 0 0 4px rgba(240,179,120,.35)!important}' +
            '#xa-skip{position:fixed;left:8px;top:-60px;z-index:2147483646;background:#f0b378;color:#1d1b19;font:700 14px "Segoe UI",sans-serif;padding:8px 14px;border-radius:8px;text-decoration:none;transition:top .15s}#xa-skip:focus{top:8px}' +
            ':root:not(.xa-none) body:not(.light-theme){--text-dim:#a8a39b}:root:not(.xa-none) body.light-theme{--text-dim:#5e5a54}' + // contrastes vérifiés : textes secondaires ≥ 4,5:1
            'html.xa-contrast{--text-dim:#c9c4bb;--text-muted:#d8d3ca;--border-color:#7a756c}html.xa-contrast body.light-theme{--text-dim:#3d3a35;--text-muted:#2d2a26;--border-color:#6b665e}html.xa-contrast small,html.xa-contrast .hint,html.xa-contrast .dim{opacity:1!important}html.xa-contrast body:not(.light-theme) [style*="color"]:not(button):not(.btn-big){filter:brightness(1.35)}';
        document.head.appendChild(s);
    }
    function init(app) {
        applyPrefs(); css();
        addEventListener('keydown', onKey, true);
        const go = () => {
            if (!document.getElementById('xa-skip')) { const tb = document.getElementById('top-bar'), main = document.querySelector('#workspace,#content,main,#main,.m-main,#canvas-container,.wrap') || (tb && [...tb.parentNode.children].find(x => x !== tb && x.offsetHeight > 200 && !/^(SCRIPT|STYLE)$/.test(x.tagName))); if (main) { if (!main.id) main.id = 'xa-main'; if (!main.hasAttribute('tabindex')) main.tabIndex = -1; document.body.insertAdjacentHTML('afterbegin', '<a id="xa-skip" href="#' + main.id + '">Aller au contenu</a>'); } }
            label(); let t = null; new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => { label(); inSettings(); }, 250); }).observe(document.body, { childList: true, subtree: true });
        };
        XBOOT.ready(go, 1600);
    }
    return { init, setSize, label };
})();

XA11Y.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XTIPS : astuces au bon moment (remplace la visite guidée imposée au premier lancement)
//  Une bulle courte, posée à côté de l'élément concerné, la première fois qu'on : ouvre l'outil, change de vue,
//  ouvre « Exporter ▾ », enregistre, voit le groupe Équipe, ouvre le panier, travaille 3 min sans Ctrl + K…
//  « Compris » la range ; « Plus d'astuces » les coupe toutes. La visite complète reste dans ⚙️ › Aide.
// =====================================================================
const XTIPS = (() => {
    let APP = '', queue = [], showing = false;
    const KS = 'xiii.tips.seen', KO = 'xiii.tips.off';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const seen = id => !!J(KS, {})[id], mark = id => { const s = J(KS, {}); s[id] = Date.now(); try { localStorage.setItem(KS, JSON.stringify(s)); } catch (e) { } };
    const off = () => localStorage.getItem(KO) === '1';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const NAME = () => ((typeof XDELEG !== 'undefined' && XDELEG.NAMES && XDELEG.NAMES[APP]) || APP.toUpperCase());
    // astuce : id (unique, global ou par outil), cible (élément ou sélecteur), titre, texte, boutons en plus
    function tip(id, target, title, text, extra) {
        if (document.getElementById('xt-root') || document.getElementById('xnw-ov')) { setTimeout(() => tip(id, target, title, text, extra), 2500); return; } // pas d'astuce pendant la visite guidée
        if (off() || seen(id)) return; if (showing) { if (!queue.some(q => q[0] === id)) queue.push([id, target, title, text, extra]); return; }
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (target && (!el || !el.getBoundingClientRect().width)) return;
        showing = true; mark(id);
        const b = document.createElement('div'); b.id = 'xtp'; b.setAttribute('role', 'status');
        b.innerHTML = '<div class="xtp-h">💡 ' + esc(title) + '</div><div class="xtp-t">' + text + '</div><div class="xtp-b">' + (extra ? extra.map((x, i) => '<button data-e="' + i + '">' + esc(x[0]) + '</button>').join('') : '') + '<button class="ok" data-ok>Compris</button></div><button class="xtp-off" data-off>Ne plus afficher d\'astuces</button>';
        document.body.appendChild(b);
        place(b, el);
        const done = () => { b.remove(); showing = false; const n = queue.shift(); if (n) setTimeout(() => tip.apply(null, n), 600); };
        b.querySelector('[data-ok]').onclick = done;
        b.querySelector('[data-off]').onclick = () => { try { localStorage.setItem(KO, '1'); } catch (e) { } queue = []; done(); };
        (extra || []).forEach((x, i) => b.querySelector('[data-e="' + i + '"]').onclick = () => { done(); x[1](); });
        setTimeout(() => { if (b.parentNode) done(); }, 22000);
    }
    function place(b, el) {
        const W = Math.min(330, innerWidth - 20); b.style.width = W + 'px';
        if (!el) { b.style.right = '16px'; b.style.bottom = '16px'; return; }
        const r = el.getBoundingClientRect(), h = b.offsetHeight, below = r.bottom + h + 14 < innerHeight;
        b.style.left = Math.max(10, Math.min(innerWidth - W - 10, r.left + r.width / 2 - W / 2)) + 'px';
        b.style.top = (below ? r.bottom + 10 : Math.max(10, r.top - h - 10)) + 'px';
        b.classList.add(below ? 'dn' : 'up'); b.style.setProperty('--ax', Math.max(14, Math.min(W - 14, r.left + r.width / 2 - parseFloat(b.style.left))) + 'px');
    }
    // ---------- moments ----------
    function hooks() {
        // 1. première ouverture de l'outil : bienvenue courte (au lieu de la visite imposée)
        const tourBtn = typeof XTOUR !== 'undefined' ? [['🧭 Visite guidée', () => { try { XTOUR.start(); } catch (e) { } }]] : null;
        if (APP === 'index') return; // pas de bulle d'astuce sur l'accueil (supprimée à la demande)
        if (typeof XTOUR === 'undefined') tip('open.' + APP, null, 'Bienvenue dans ' + NAME(), 'Des astuces apparaîtront au fil de votre travail, au moment où elles servent. La visite guidée complète reste dans ⚙️ › Aide.', tourBtn);
        // 2. outils communs (une seule fois pour toute la suite)
        setTimeout(() => tip('common.file', '#xb-file', 'Toujours au même endroit', 'La barre du haut est la même dans tous les outils : 🔎 rechercher, 🗒️ <b>Nouveau ▾</b>, 📂 ouvrir, 💾 enregistrer, ⬇️ <b>Exporter ▾</b> (PDF, tableaux, impression, fichier du projet), 📤 <b>Vers Suite XIII</b> et 🔗 partager. En dessous, la barre de l’outil est rangée pareil partout : ① Créer · ② Afficher · ③ Modifier · ④ Outils métier · ⑤ Assistants.'), 2500);
        setTimeout(() => { if (!document.getElementById('xf-ov')) tip('common.ctrlk', '#xb-file', 'Gagnez du temps avec Ctrl + K', 'Tapez ce que vous voulez faire (« pdf », « ajouter », « équipe »…) : la commande se lance avec Entrée. La recherche fouille aussi tous vos projets.'); }, 180000);
        // 3. au premier usage d'un élément
        document.addEventListener('click', e => {
            const t = e.target.closest && e.target.closest('button,[data-view],.tab'); if (!t) return;
            const tt = (t.title || '') + ' ' + (t.textContent || '');
            if (t.id === 'xb-exp') setTimeout(() => tip('common.export', '#xb-menu', 'Tous les exports ici', 'Chaque document de l\'outil (PDF, CSV/Excel, calendrier, sous-titres…) est dans ce menu. Astuce : Ctrl + K puis « pdf » fonctionne aussi.'), 300);
            else if (/💾/.test(t.textContent) || /^Enregistrer/.test(t.title || '')) setTimeout(() => tip('common.save', t, 'Enregistré dans ce navigateur', 'Votre travail est aussi enregistré automatiquement. Pour le garder ailleurs ou le transmettre : ⬇️ Exporter le projet (fichier), ou 🗂️ Versions pour revenir en arrière.'), 400);
            else if (t.id === 'xhs-btn') setTimeout(() => tip('common.versions', '#xhs-ov .xhs-new', 'Versions', 'Donnez un nom à une étape importante (« validé client ») : elle ne sera jamais effacée. Une version est aussi créée automatiquement avant chaque import.'), 400);
            else if (t.id === 'xt-tab') setTimeout(() => tip('common.tray', '#xt-panel .xt-tabs', 'Le panier XIII', 'Glissez un élément de « 📦 Cet outil » ou de l\'annuaire dans le panier, puis déposez-le dans un autre outil : contact → équipe du jour, caméra → plan…'), 400);
            else if (t.id === 'xb-solo') setTimeout(() => tip('common.team', '#xb-menu', 'Travailler à plusieurs', 'Reliez votre Google Drive : l\'équipe travaille dans le même projet, sans compte. Ou déléguez juste cet outil par un lien.'), 300);
            else if (t.matches('[data-view],#view-group button,.view-btn') && !seen('view.' + APP)) setTimeout(() => tip('view.' + APP, t, 'Nouvelle vue', 'Chaque vue montre le même projet autrement : vos changements sont repris partout. Les raccourcis clavier de la vue sont dans ⚙️ Paramètres.'), 500);
        }, true);
        // 4. le groupe Équipe vient d'apparaître (Drive relié)
        const iv = setInterval(() => { const g = document.getElementById('xb-team'); if (g && getComputedStyle(g).display !== 'none' && g.offsetWidth) { clearInterval(iv); tip('common.teamon', g, 'Vos outils d\'équipe', '🤝 déléguer · 💬 avis sur un élément · 📌 mot épinglé pour l\'équipe · ☁️ état du Drive (pastille verte = à jour).'); } }, 3000);
        setTimeout(() => clearInterval(iv), 60000);
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xtp-css';
        s.textContent = '#xtp{position:fixed;z-index:2147483200;background:#2a2620;color:#f3eee6;border:1px solid #f0b378;border-radius:12px;padding:11px 13px 8px;box-shadow:0 12px 36px rgba(0,0,0,.55);font:13.5px/1.45 "Segoe UI",system-ui,sans-serif;animation:xtpin .2s ease-out}@keyframes xtpin{from{opacity:0;transform:translateY(6px)}}' +
            '#xtp.dn::before,#xtp.up::after{content:"";position:absolute;left:calc(var(--ax) - 7px);width:12px;height:12px;background:#2a2620;border:1px solid #f0b378;transform:rotate(45deg)}#xtp.dn::before{top:-7px;border-right:0;border-bottom:0}#xtp.up::after{bottom:-7px;border-left:0;border-top:0}' +
            '.xtp-h{font-weight:700;margin-bottom:3px}.xtp-t{color:#ddd6cb}.xtp-b{display:flex;gap:6px;justify-content:flex-end;margin-top:9px;flex-wrap:wrap}#xtp button{font:inherit;font-size:12.5px;color:inherit;background:#3a352d;border:1px solid #5a5248;border-radius:7px;padding:5px 11px;cursor:pointer;height:auto}#xtp button.ok{background:#f0b378;color:#1d1b19;border-color:#f0b378;font-weight:700}' +
            '#xtp .xtp-off{background:none!important;border:0!important;color:#a8a39b!important;font-size:11.5px!important;padding:4px 0 0!important;text-decoration:underline;display:block}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; if (app === 'jour') return;
        // la visite complète (XTOUR) se lance à la première ouverture de chaque outil : pas de bulle de bienvenue en plus
        css(); const go = () => hooks();
        XBOOT.ready(go, 2200);
    }
    return { init, tip, reset() { try { localStorage.removeItem(KS); localStorage.removeItem(KO); } catch (e) { } } };
})();

XTIPS.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XDS : charte graphique commune de l'interface (composants partagés)
//  Couleurs du logo XIII (cuivre #f0b378 sur anthracite), une seule typographie, mêmes champs, tableaux,
//  fenêtres, notifications et barres de défilement dans tous les outils. Les règles restent prudentes :
//  elles harmonisent sans casser les éléments propres à chaque outil (dessins, plans, conducteurs…).
// =====================================================================
const XDS = (() => {
    const CSS = `
:root{--x-acc:240,179,120;--x-acc-c:rgb(240,179,120);--x-r-sm:7px;--x-r:10px;--x-r-lg:14px;--x-shadow:0 18px 50px rgba(0,0,0,.55);--x-font:"Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif}
body{font-family:var(--x-font)}
/* champs (hors zones de dessin) */
:is(.modal-box,.modal,#modal,.panel,.side-panel,#props,#properties,#sidebar,.sidebar,aside,.card,.form,dialog,.xs-in,.mb-body) :is(input[type=text],input[type=number],input[type=email],input[type=tel],input[type=date],input[type=time],input[type=search],input:not([type]),select,textarea):not([class*=xt-]):not([class*=xg-]){border-radius:var(--x-r-sm);border:1px solid var(--border-color,#4a4744);background-color:var(--bg-input,#2a2826);color:var(--text-main,#eee);padding:6px 9px;font-family:inherit;transition:border-color .15s,box-shadow .15s}
:is(input,select,textarea):focus{border-color:var(--x-acc-c)!important;box-shadow:0 0 0 3px rgba(var(--x-acc),.18)!important;outline:none}
/* fenêtres */
.modal-overlay,#modal-overlay,.modal-ov,#modal.modal-overlay{backdrop-filter:blur(3px)}
.modal-box,.modal-content,#modal>.modal-box{border-radius:var(--x-r-lg)!important;border:1px solid rgba(var(--x-acc),.45)!important;box-shadow:var(--x-shadow)!important}
.modal-box h3,.modal-content h3{letter-spacing:.2px}
/* notification */
#toast{background:#1f1d1a!important;color:#f3eee6!important;border:1px solid rgba(var(--x-acc),.7)!important;border-radius:var(--x-r)!important;box-shadow:0 10px 30px rgba(0,0,0,.5)!important;font-family:var(--x-font)!important}
body.light-theme #toast{background:#fffaf4!important;color:#2b2621!important}
/* tableaux */
:is(.data-table,table.list,.tbl,table.grid,.xs-in table) th{background:rgba(var(--x-acc),.10);font-weight:600;text-transform:none}
:is(.data-table,table.list,.tbl,table.grid) tbody tr:hover{background:rgba(var(--x-acc),.06)}
/* cartes */
.card,.panel-card,.m-card{border-radius:var(--x-r)}
/* boutons principaux : même accent partout */
.btn-big,.btn-primary,button.primary,.mb-actions .btn-big{background:rgba(var(--x-acc),.28)!important;border:1px solid var(--x-acc-c)!important;color:var(--text-main,#fff)!important;border-radius:var(--x-r-sm)!important;font-weight:700}
.btn-big:hover,.btn-primary:hover,button.primary:hover{background:rgba(var(--x-acc),.4)!important}
body.light-theme :is(.btn-big,.btn-primary,button.primary){color:#2b2621!important}
.btn-danger,button.danger{border-color:#e57373!important}
/* barres de défilement */
*{scrollbar-width:thin;scrollbar-color:rgba(var(--x-acc),.35) transparent}
::-webkit-scrollbar{width:10px;height:10px}::-webkit-scrollbar-thumb{background:rgba(var(--x-acc),.3);border-radius:8px;border:2px solid transparent;background-clip:padding-box}::-webkit-scrollbar-thumb:hover{background:rgba(var(--x-acc),.5);background-clip:padding-box}::-webkit-scrollbar-track{background:transparent}
/* sélection de texte */
::selection{background:rgba(var(--x-acc),.35)}
`;
    const SW = '/* ---------- interrupteurs : les cases à cocher de la suite deviennent des sliders (sauf interrupteurs maison et cases minuscules) ---------- */\ninput[type=checkbox]:not(.xs-sw input):not(.b-sw input):not(.filepick input):not(.trk-pc input):not(.fl-c input):not(.cal-src input):not(.xsw-off){appearance:none!important;-webkit-appearance:none!important;width:32px!important;height:18px!important;min-width:32px!important;max-width:32px!important;min-height:18px!important;border-radius:99px!important;background:rgba(128,128,128,.42)!important;position:relative;cursor:pointer;flex:0 0 32px!important;margin:0 6px 0 0;vertical-align:middle;transition:background .15s;border:0!important;padding:0!important;box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)!important;accent-color:auto}\ninput[type=checkbox]:not(.xs-sw input):not(.b-sw input):not(.filepick input):not(.trk-pc input):not(.fl-c input):not(.cal-src input):not(.xsw-off)::before{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .15s;box-shadow:0 1px 2px rgba(0,0,0,.45)}\ninput[type=checkbox]:not(.xs-sw input):not(.b-sw input):not(.filepick input):not(.trk-pc input):not(.fl-c input):not(.cal-src input):not(.xsw-off):checked{background:rgba(var(--accent,240,179,120),.85)!important}\ninput[type=checkbox]:not(.xs-sw input):not(.b-sw input):not(.filepick input):not(.trk-pc input):not(.fl-c input):not(.cal-src input):not(.xsw-off):checked::before{transform:translateX(14px)}\ninput[type=checkbox]:indeterminate::before{transform:translateX(7px)}\ninput[type=checkbox]:disabled{opacity:.45;cursor:not-allowed}\ninput[type=checkbox]:focus-visible{outline:2px solid rgba(var(--accent,240,179,120),.9);outline-offset:2px}\n';
    function init() { if (document.getElementById('xds-css')) return; const s = document.createElement('style'); s.id = 'xds-css'; s.textContent = CSS + SW; (document.head || document.documentElement).appendChild(s); }
    return { init, CSS };
})();

XDS.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XTHEME : thème de toute la suite
//  🌙 Sombre · ☀️ Clair · 🖥️ Auto (suit le système) · 🪟 Win 2000 · 🟦 Win XP · 🌆 Cyberpunk · 🌈 Rainbow
//  Un seul réglage pour tous les outils (⚙️ › Affichage). Le thème clair est aussi appliqué aux outils
//  qui n'avaient pas encore de bascule (PLANNO, CASTO, POSTO, SONO, LUMO, RUNO, TRANSPORTO, SOUSTITRO).
// =====================================================================
const XTHEME = (() => {
    const K = 'xiii.theme.mode', SUITE = 'xiii.settings._suite';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: light)') : null;
    const mode = () => localStorage.getItem(K) || (J(SUITE, {}).globalTheme === 'light' ? 'light' : (J('hubXIII.prefs', {}).theme === 'light' ? 'light' : 'dark'));
    const SKINS = { w2k: 'light', xp: 'light', cyber: 'dark', rainbow: 'dark', mac9: 'light', term: 'dark', sepia: 'light', regie: 'dark', soleil: 'light', gb: 'light', sobre: 'dark' };
    const base = m => m === 'auto' ? (mq && mq.matches ? 'light' : 'dark') : SKINS[m] || m;
    function apply() {
        const m = mode(), b = base(m), s = J(SUITE, {});
        s.globalTheme = b; try { localStorage.setItem(SUITE, JSON.stringify(s)); const h = J('hubXIII.prefs', {}); h.theme = b; localStorage.setItem('hubXIII.prefs', JSON.stringify(h)); } catch (e) { }
        try { if (typeof XSET !== 'undefined' && XSET.setTheme) XSET.setTheme(b); } catch (e) { }
        if (!document.body) return;
        document.body.classList.toggle('light-theme', b === 'light'); // y compris les outils sans bascule propre
        Object.keys(SKINS).forEach(k => document.body.classList.toggle('x' + k, m === k));
        const meta = document.querySelector('meta[name=theme-color]'); if (meta) meta.content = ({ w2k: '#0a246a', xp: '#0a5fd8', cyber: '#0d0221', rainbow: '#1a1033', mac9: '#dddddd', term: '#000000', sepia: '#e9dcc2', regie: '#000000', soleil: '#ffffff', gb: '#9bbc0f', sobre: '#0e0f12' })[m] || (b === 'light' ? '#f4f1ec' : '#222222');
    }
    function set(m) { try { localStorage.setItem(K, m); } catch (e) { } apply(); try { const T = { w2k: '🪟 Thème Win 2000', xp: '🟦 Thème Win XP', cyber: '🌆 Thème Cyberpunk', rainbow: '🌈 Thème Rainbow', mac9: '🍎 Thème Mac OS 9', term: '📟 Thème Terminal', sepia: '🎞️ Thème Pellicule', regie: '🔴 Thème Régie nuit', soleil: '☀️ Thème Plein soleil', gb: '🎮 Thème Game Boy', sobre: '◼️ Thème Sobre' }; if (T[m] && typeof toast === 'function') toast(T[m] + ' activé'); } catch (e) { } }
    // ---------- ⚙️ Paramètres : les 4 thèmes à la place de Sombre / Clair ----------
    function inSettings() {
        const pan = document.getElementById('xs-panel'); if (!pan) return; const seg = pan.querySelector('[data-theme]'); if (!seg || seg.parentNode.dataset.xt) return;
        const box = seg.parentNode; box.dataset.xt = 1; const m = mode();
        box.innerHTML = [['dark', '🌙 Sombre'], ['light', '☀️ Clair'], ['auto', '🖥️ Auto'], ['sobre', '◼️ Sobre'], ['w2k', '🪟 Win 2000'], ['xp', '🟦 Win XP'], ['cyber', '🌆 Cyberpunk'], ['rainbow', '🌈 Rainbow'], ['mac9', '🍎 Mac OS 9'], ['term', '📟 Terminal'], ['sepia', '🎞️ Pellicule'], ['regie', '🔴 Régie nuit'], ['soleil', '🔆 Plein soleil'], ['gb', '🎮 Game Boy']].map(([k, l]) => '<button type="button" data-xtm="' + k + '" class="' + (m === k ? 'on' : '') + '" title="' + ({ auto: 'Suit le réglage clair / sombre de l\'ordinateur', w2k: 'L\'esprit Windows 2000 : gris, biseaux, barres de titre bleues', xp: 'L\'esprit Windows XP : bleu Luna, boutons arrondis, barre verte', cyber: 'Néons magenta et cyan sur fond nuit, typo technique', rainbow: 'Arc-en-ciel : dégradés animés et couleurs vives', mac9: 'L\'esprit Mac OS 9 Platinum : gris rayé, boutons arrondis', term: 'Vert phosphore sur noir, police à chasse fixe', sepia: 'Papier vieilli, tons sépia, perforations de pellicule', regie: 'Rouge sur noir : préserve la vision de nuit en régie ou en tournage nocturne', soleil: 'Contraste maximal et gros caractères pour une tablette en extérieur', gb: 'Quatre verts, look pixel', dark: 'Thème sombre', light: 'Thème clair' })[k] + '">' + l + '</button>').join('');
        box.style.flexWrap = 'wrap';
        box.querySelectorAll('[data-xtm]').forEach(b => b.onclick = () => { set(b.dataset.xtm); box.querySelectorAll('[data-xtm]').forEach(x => x.classList.toggle('on', x === b)); });
        const g = pan.querySelector('[data-global]'); if (g) { const row = g.closest('.xs-f') || g.parentNode; row.style.display = 'none'; } // un seul thème pour toute la suite
    }
    const W2K = `
body.xw2k{--bg-main:#3a6ea5;--bg-panel:#d4d0c8;--bg-panel-alt:#e4e1da;--bg-header:#d4d0c8;--bg-menu:#d4d0c8;--bg-input:#fff;--text-main:#000;--text-muted:#000;--text-dim:#404040;--border-color:#808080;--border-soft:#a0a0a0;--accent-text:#0a246a;--accent:10,36,106;--x-acc:10,36,106;--x-acc-c:#0a246a;--x-r-sm:0;--x-r:0;--x-r-lg:0;font-family:Tahoma,"MS Sans Serif",Verdana,Geneva,sans-serif!important;font-size:12px}
body.xw2k,body.xw2k #workspace,body.xw2k #workspace-container,body.xw2k #content{background:#3a6ea5!important}
body.xw2k *{font-family:Tahoma,"MS Sans Serif",Verdana,Geneva,sans-serif!important;border-radius:0!important;text-shadow:none!important;scrollbar-color:#c0c0c0 #e4e1da}
body.xw2k #top-bar{background:linear-gradient(90deg,#0a246a,#a6caf0)!important;color:#fff!important;border-bottom:2px solid #d4d0c8!important}
body.xw2k #top-bar .brand,body.xw2k #top-bar .brand *,body.xw2k #top-bar>span,body.xw2k #top-bar .tab-title{color:#fff!important}
body.xw2k #toolbar,body.xw2k #library-panel,body.xw2k #library-header,body.xw2k [id^=lib-],body.xw2k .panel,body.xw2k aside,body.xw2k #props,body.xw2k #tree-head,body.xw2k #tree-foot{background:#d4d0c8!important;color:#000!important;border-color:#808080!important}
body.xw2k button,body.xw2k .btn,body.xw2k .xs-seg button{background:#d4d0c8!important;color:#000!important;border:2px outset #f0f0f0!important;box-shadow:none!important;background-image:none!important}
body.xw2k button:active,body.xw2k button.on,body.xw2k button.active,body.xw2k .xs-seg button.on{border-style:inset!important;background:#e4e1da!important}
body.xw2k button:hover{background:#dedad3!important}
body.xw2k input,body.xw2k select,body.xw2k textarea{background:#fff!important;color:#000!important;border:2px inset #f0f0f0!important;box-shadow:none!important}
body.xw2k :focus-visible{outline:1px dotted #000!important;outline-offset:1px!important;box-shadow:none!important}
body.xw2k .card,body.xw2k .lib-item,body.xw2k .modal-box,body.xw2k #xs-panel,body.xw2k .xs-sec,body.xw2k .xhs-box,body.xw2k .xmm-box,body.xw2k .xdr-box,body.xw2k .xdl-box,body.xw2k .xg-box,body.xw2k #xt-panel,body.xw2k #xb-menu,body.xw2k .xpv-box{background:#d4d0c8!important;color:#000!important;border:2px outset #f0f0f0!important;box-shadow:2px 2px 0 #404040!important}
body.xw2k .modal-box h3,body.xw2k .xhs-box h3,body.xw2k .xmm-box h3,body.xw2k .xdr-box h3,body.xw2k .xdl-box h3,body.xw2k .xg-h,body.xw2k .xs-h,body.xw2k .xpv-h,body.xw2k .xt-h{background:linear-gradient(90deg,#0a246a,#a6caf0)!important;color:#fff!important;margin:-6px -6px 8px!important;padding:4px 8px!important;font-weight:700!important}
body.xw2k #toast{background:#ffffe1!important;color:#000!important;border:1px solid #000!important;box-shadow:2px 2px 0 rgba(0,0,0,.4)!important}
body.xw2k ::selection{background:#0a246a;color:#fff}
body.xw2k ::-webkit-scrollbar{width:16px;height:16px;background:#e4e1da}body.xw2k ::-webkit-scrollbar-thumb{background:#d4d0c8;border:2px outset #f0f0f0}
body.xw2k #xs-gear{position:fixed}
body.xw2k .hero-logo,body.xw2k h1 img{filter:drop-shadow(2px 2px 0 #404040)}
body.xw2k .card:hover{border-style:inset!important}
body.xw2k a{color:#0000ee}
`;
    const MORE = `
body.xmac9{--bg-main:#dddddd;--bg-panel:#eeeeee;--bg-panel-alt:#e4e4e4;--bg-header:#dddddd;--bg-menu:#eeeeee;--bg-input:#fff;--text-main:#000;--text-muted:#111;--text-dim:#555;--border-color:#888;--border-soft:#bbb;--accent-text:#3333cc;--accent:51,51,204;--x-acc:51,51,204;--x-acc-c:#3333cc}
body.xmac9 *{font-family:Charcoal,"Chicago","Geneva","Lucida Grande",sans-serif!important}
body.xmac9,body.xmac9 #workspace,body.xmac9 #content{background:repeating-linear-gradient(0deg,#dedede 0 1px,#e6e6e6 1px 2px)!important}
body.xmac9 #top-bar{background:repeating-linear-gradient(0deg,#ccc 0 1px,#eee 1px 2px)!important;border-bottom:1px solid #666!important;color:#000!important}
body.xmac9 #top-bar *{color:#000!important}
body.xmac9 button{background:linear-gradient(180deg,#fafafa,#d6d6d6)!important;color:#000!important;border:1px solid #555!important;border-radius:6px!important;box-shadow:inset 1px 1px 0 #fff,inset -1px -1px 0 #aaa!important}
body.xmac9 button:active,body.xmac9 button.btn-active,body.xmac9 button.on,body.xmac9 button.ok{background:linear-gradient(180deg,#9999ff,#6666cc)!important;color:#fff!important}
body.xmac9 input,body.xmac9 select,body.xmac9 textarea{background:#fff!important;color:#000!important;border:1px solid #555!important;box-shadow:inset 1px 1px 0 #999!important;border-radius:0!important}
body.xmac9 .card,body.xmac9 .modal-box,body.xmac9 #xs-panel,body.xmac9 [class$="-box"]{background:#eee!important;color:#000!important;border:1px solid #444!important;border-radius:2px!important;box-shadow:2px 2px 0 rgba(0,0,0,.35)!important}
body.xmac9 .modal-box h3{background:repeating-linear-gradient(0deg,#bbb 0 1px,#eee 1px 3px)!important;margin:-14px -16px 10px!important;padding:4px 12px!important;text-align:center;justify-content:center}
body.xmac9 ::selection{background:#ccccff}
body.xterm{--bg-main:#000;--bg-panel:#030a03;--bg-panel-alt:#061206;--bg-header:#000;--bg-menu:#020802;--bg-input:#000;--text-main:#33ff66;--text-muted:#2ee65c;--text-dim:#1a9e3c;--border-color:#1f7a35;--border-soft:#0f3d1b;--accent-text:#7dff9c;--accent:51,255,102;--x-acc:51,255,102;--x-acc-c:#33ff66}
body.xterm *{font-family:"IBM Plex Mono","Fira Code","Consolas","Courier New",monospace!important;color:#33ff66;text-shadow:0 0 3px rgba(51,255,102,.45)!important;border-radius:0!important}
body.xterm,body.xterm #workspace,body.xterm #content,body.xterm #top-bar,body.xterm #toolbar{background:#000!important}
body.xterm #top-bar{border-bottom:1px dashed #33ff66!important}body.xterm #top-bar b::after{content:"_";animation:xtblink 1s steps(1) infinite}
@keyframes xtblink{50%{opacity:0}}
body.xterm button{background:#000!important;color:#33ff66!important;border:1px solid #33ff66!important;box-shadow:none!important}
body.xterm button:hover,body.xterm button.btn-active,body.xterm button.on,body.xterm button.ok{background:#33ff66!important;color:#000!important;text-shadow:none!important}body.xterm button:hover *,body.xterm button.btn-active *{color:#000!important}
body.xterm input,body.xterm select,body.xterm textarea{background:#000!important;color:#33ff66!important;border:1px solid #1f7a35!important;caret-color:#33ff66}
body.xterm .card,body.xterm .modal-box,body.xterm #xs-panel,body.xterm [class$="-box"]{background:#000!important;border:1px solid #33ff66!important;box-shadow:none!important}
body.xterm img{filter:grayscale(1) sepia(1) hue-rotate(70deg) saturate(3)}body.xterm ::selection{background:#33ff66;color:#000}
body.xsepia{--bg-main:#e9dcc2;--bg-panel:#f4ead6;--bg-panel-alt:#eadcbf;--bg-header:#3b2a1a;--bg-menu:#f4ead6;--bg-input:#fbf5e8;--text-main:#3b2a1a;--text-muted:#4a3622;--text-dim:#7a6248;--border-color:#b49a74;--border-soft:#d6c2a0;--accent-text:#8a4b14;--accent:138,75,20;--x-acc:138,75,20;--x-acc-c:#8a4b14}
body.xsepia *{font-family:"Courier Prime","Courier New",Georgia,serif!important}
body.xsepia,body.xsepia #workspace,body.xsepia #content{background:#e9dcc2 radial-gradient(rgba(59,42,26,.05) 1px,transparent 1px)!important;background-size:6px 6px!important}
body.xsepia #top-bar{background:#2a1d10!important;color:#f4ead6!important;border-top:14px solid #111;border-bottom:14px solid #111;background-image:none!important;position:relative}
body.xsepia #top-bar::before,body.xsepia #top-bar::after{content:"";position:absolute;left:0;right:0;height:8px;background:repeating-linear-gradient(90deg,transparent 0 10px,#e9dcc2 10px 20px,transparent 20px 30px);opacity:.85}
body.xsepia #top-bar::before{top:-11px}body.xsepia #top-bar::after{bottom:-11px}
body.xsepia #top-bar *{color:#f4ead6!important}
body.xsepia button{background:#f4ead6!important;color:#3b2a1a!important;border:1px solid #8a6a44!important;border-radius:3px!important;box-shadow:1px 1px 0 #b49a74!important}
body.xsepia button.btn-active,body.xsepia button.on,body.xsepia button.ok{background:#8a4b14!important;color:#fbf5e8!important}
body.xsepia .card,body.xsepia .modal-box,body.xsepia #xs-panel,body.xsepia [class$="-box"]{background:#f8f0de!important;color:#3b2a1a!important;border:1px solid #b49a74!important;box-shadow:3px 3px 0 rgba(59,42,26,.18)!important}
body.xsepia img{filter:sepia(.6)}body.xsepia ::selection{background:#d6b98a}
body.xregie{--bg-main:#000;--bg-panel:#0a0000;--bg-panel-alt:#140000;--bg-header:#000;--bg-menu:#0a0000;--bg-input:#000;--text-main:#ff3b30;--text-muted:#e0352b;--text-dim:#992018;--border-color:#5a0f0a;--border-soft:#2a0705;--accent-text:#ff5a4f;--accent:255,59,48;--x-acc:255,59,48;--x-acc-c:#ff3b30}
body.xregie *{color:#ff3b30;border-color:#5a0f0a}body.xregie,body.xregie #workspace,body.xregie #content,body.xregie #top-bar,body.xregie #toolbar{background:#000!important}
body.xregie button{background:#0a0000!important;color:#ff3b30!important;border:1px solid #5a0f0a!important;box-shadow:none!important}
body.xregie button.btn-active,body.xregie button.on,body.xregie button.ok{background:#3a0000!important;border-color:#ff3b30!important}
body.xregie input,body.xregie select,body.xregie textarea{background:#000!important;color:#ff3b30!important;border:1px solid #5a0f0a!important}
body.xregie .card,body.xregie .modal-box,body.xregie #xs-panel,body.xregie [class$="-box"]{background:#050000!important;border:1px solid #3a0a06!important;box-shadow:none!important}
body.xregie img,body.xregie canvas,body.xregie video,body.xregie svg image{filter:grayscale(1) sepia(1) saturate(6) hue-rotate(-50deg) brightness(.6)}body.xregie ::selection{background:#ff3b30;color:#000}
body.xsoleil{--bg-main:#fff;--bg-panel:#fff;--bg-panel-alt:#f2f2f2;--bg-header:#fff;--bg-menu:#fff;--bg-input:#fff;--text-main:#000;--text-muted:#000;--text-dim:#222;--border-color:#000;--border-soft:#555;--accent-text:#0033cc;--accent:0,51,204;--x-acc:0,51,204;--x-acc-c:#0033cc}
body.xsoleil *{text-shadow:none!important;font-weight:600}
body.xsoleil,body.xsoleil #workspace,body.xsoleil #content,body.xsoleil #top-bar,body.xsoleil #toolbar{background:#fff!important;color:#000!important}
body.xsoleil #top-bar{border-bottom:3px solid #000!important}body.xsoleil #top-bar *{color:#000!important}
body.xsoleil button{background:#fff!important;color:#000!important;border:2px solid #000!important;box-shadow:none!important;min-height:36px}
body.xsoleil button.btn-active,body.xsoleil button.on,body.xsoleil button.ok{background:#000!important;color:#fff!important}body.xsoleil button.btn-active *,body.xsoleil button.on *{color:#fff!important}
body.xsoleil input,body.xsoleil select,body.xsoleil textarea{background:#fff!important;color:#000!important;border:2px solid #000!important}
body.xsoleil .card,body.xsoleil .modal-box,body.xsoleil #xs-panel,body.xsoleil [class$="-box"]{background:#fff!important;color:#000!important;border:3px solid #000!important;box-shadow:none!important}
body.xsoleil small,body.xsoleil .hint{color:#111!important}body.xsoleil :focus-visible{outline:4px solid #0033cc!important}
body.xgb{--bg-main:#9bbc0f;--bg-panel:#8bac0f;--bg-panel-alt:#9bbc0f;--bg-header:#306230;--bg-menu:#8bac0f;--bg-input:#9bbc0f;--text-main:#0f380f;--text-muted:#0f380f;--text-dim:#306230;--border-color:#0f380f;--border-soft:#306230;--accent-text:#0f380f;--accent:15,56,15;--x-acc:15,56,15;--x-acc-c:#0f380f}
body.xgb *{font-family:"Press Start 2P","Pixelify Sans","Courier New",monospace!important;color:#0f380f;border-radius:0!important;text-shadow:none!important;image-rendering:pixelated}
body.xgb,body.xgb #workspace,body.xgb #content{background:#9bbc0f!important;font-size:12px}
body.xgb #top-bar{background:#306230!important;border-bottom:4px solid #0f380f!important}body.xgb #top-bar *{color:#9bbc0f!important}
body.xgb button{background:#8bac0f!important;color:#0f380f!important;border:3px solid #0f380f!important;box-shadow:3px 3px 0 #306230!important}
body.xgb button:active,body.xgb button.btn-active,body.xgb button.on,body.xgb button.ok{background:#0f380f!important;color:#9bbc0f!important;box-shadow:none!important}body.xgb button.btn-active *,body.xgb button.on *{color:#9bbc0f!important}
body.xgb input,body.xgb select,body.xgb textarea{background:#9bbc0f!important;color:#0f380f!important;border:3px solid #0f380f!important}
body.xgb .card,body.xgb .modal-box,body.xgb #xs-panel,body.xgb [class$="-box"]{background:#8bac0f!important;border:4px solid #0f380f!important;box-shadow:4px 4px 0 #306230!important}
body.xgb img{filter:grayscale(1) sepia(1) hue-rotate(40deg) saturate(2.5) contrast(1.1)}body.xgb ::selection{background:#0f380f;color:#9bbc0f}
html:has(body.xregie){filter:grayscale(1) sepia(1) saturate(7) hue-rotate(-52deg) brightness(.85)}
html:has(body.xterm){filter:grayscale(1) sepia(1) saturate(5) hue-rotate(75deg)}
html:has(body.xgb){filter:grayscale(1) sepia(1) saturate(2.6) hue-rotate(38deg) contrast(1.05)}
@media (prefers-reduced-motion:reduce){body.xterm #top-bar b::after{animation:none}}
`;
    const XP = `
body.xxp{--bg-main:#ece9d8;--bg-panel:#fffffe;--bg-panel-alt:#f4f3ee;--bg-header:#ece9d8;--bg-menu:#fffffe;--bg-input:#fff;--text-main:#000;--text-muted:#222;--text-dim:#555;--border-color:#7f9db9;--border-soft:#c9d4e3;--accent-text:#0a5fd8;--accent:10,95,216;--x-acc:10,95,216;--x-acc-c:#0a5fd8;font-family:Tahoma,"Trebuchet MS",Verdana,sans-serif!important}
body.xxp *{font-family:Tahoma,"Trebuchet MS",Verdana,sans-serif!important;text-shadow:none!important}
body.xxp,body.xxp #workspace,body.xxp #content{background:#ece9d8!important}
body.xxp #top-bar{background:linear-gradient(180deg,#0997ff 0%,#0053ee 8%,#0050ee 40%,#06f 88%,#0047d6 100%)!important;color:#fff!important;border-bottom:1px solid #003c9e!important;border-radius:8px 8px 0 0}
body.xxp #top-bar .brand,body.xxp #top-bar .brand *,body.xxp #top-bar>span,body.xxp #top-bar b,body.xxp #top-bar .ps-brand span{color:#fff!important;text-shadow:1px 1px 0 #0a246a!important}
body.xxp #toolbar,body.xxp #library-panel,body.xxp aside,body.xxp .panel{background:#ece9d8!important;border-color:#aca899!important;color:#000!important}
body.xxp button,body.xxp .btn{background:linear-gradient(180deg,#fff,#ecebe6 86%,#d6d0c5)!important;color:#000!important;border:1px solid #003c74!important;border-radius:3px!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.6)!important}
body.xxp button:hover{box-shadow:inset 0 0 0 2px #f9b43e!important}
body.xxp button.btn-active,body.xxp button.on,body.xxp button.ok,body.xxp .btn-big{background:linear-gradient(180deg,#3fb33f,#2b9a2b)!important;color:#fff!important;border-color:#1c6e1c!important}
body.xxp input,body.xxp select,body.xxp textarea{background:#fff!important;color:#000!important;border:1px solid #7f9db9!important;border-radius:0!important}
body.xxp .card,body.xxp .modal-box,body.xxp #xs-panel,body.xxp [class$="-box"],body.xxp #xt-panel,body.xxp #xb-menu{background:#fffffe!important;color:#000!important;border:1px solid #0831d9!important;border-radius:8px 8px 3px 3px!important;box-shadow:2px 3px 10px rgba(0,0,0,.35)!important}
body.xxp .modal-box h3{background:linear-gradient(180deg,#0997ff,#0053ee 10%,#06f 90%,#0047d6)!important;color:#fff!important;margin:-14px -16px 10px!important;padding:6px 12px!important;border-radius:7px 7px 0 0;text-shadow:1px 1px 0 #0a246a!important}
body.xxp #toast{background:#ffffe1!important;color:#000!important;border:1px solid #000!important;border-radius:6px}
body.xxp ::selection{background:#316ac5;color:#fff}body.xxp a{color:#0046d5}
`, CY = `
body.xcyber{--bg-main:#0d0221;--bg-panel:#140533;--bg-panel-alt:#1d0a45;--bg-header:#0d0221;--bg-menu:#150638;--bg-input:#09011a;--text-main:#e0f7ff;--text-muted:#b7e9ff;--text-dim:#8b7fb8;--border-color:#ff2a6d;--border-soft:rgba(5,217,232,.25);--accent-text:#05d9e8;--accent:5,217,232;--x-acc:255,42,109;--x-acc-c:#ff2a6d}
body.xcyber *{font-family:"Rajdhani","Orbitron","Share Tech Mono","Consolas",monospace!important;letter-spacing:.02em}
body.xcyber,body.xcyber #workspace,body.xcyber #content{background:#0d0221 linear-gradient(transparent 0,transparent 31px,rgba(5,217,232,.06) 32px),#0d0221!important;background-size:100% 32px!important}
body.xcyber #top-bar{background:linear-gradient(90deg,#0d0221,#2b0a5c 50%,#0d0221)!important;border-bottom:2px solid #ff2a6d!important;box-shadow:0 0 18px rgba(255,42,109,.55)!important}
body.xcyber #top-bar b,body.xcyber .ps-brand b,body.xcyber .brand{color:#05d9e8!important;text-shadow:0 0 6px #05d9e8,0 0 14px #05d9e8!important}
body.xcyber .ps-brand span,body.xcyber h1,body.xcyber h2{color:#ff2a6d!important;text-shadow:0 0 8px rgba(255,42,109,.8)!important}
body.xcyber button:not(#xs-gear),body.xcyber .btn{background:rgba(5,217,232,.06)!important;color:#05d9e8!important;border:1px solid #05d9e8!important;border-radius:0!important;clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);text-transform:uppercase;box-shadow:none!important}
body.xcyber button:hover{background:rgba(5,217,232,.2)!important;box-shadow:0 0 12px #05d9e8!important}
body.xcyber button.btn-active,body.xcyber button.on,body.xcyber button.ok,body.xcyber .btn-big{background:#ff2a6d!important;color:#0d0221!important;border-color:#ff2a6d!important}
body.xcyber input,body.xcyber select,body.xcyber textarea{background:#09011a!important;color:#d1f7ff!important;border:1px solid #7700a6!important;border-radius:0!important;caret-color:#ff2a6d}
body.xcyber input:focus,body.xcyber textarea:focus{border-color:#05d9e8!important;box-shadow:0 0 8px rgba(5,217,232,.6)!important}
body.xcyber .card,body.xcyber .modal-box,body.xcyber #xs-panel,body.xcyber [class$="-box"],body.xcyber #xt-panel,body.xcyber #xb-menu{background:#140533!important;border:1px solid #ff2a6d!important;border-radius:0!important;box-shadow:0 0 0 1px rgba(5,217,232,.3),0 0 24px rgba(255,42,109,.35)!important}
body.xcyber #toast{background:#0d0221!important;color:#fef200!important;border:1px solid #fef200!important;border-radius:0;box-shadow:0 0 14px rgba(254,242,0,.5)}
body.xcyber ::selection{background:#ff2a6d;color:#0d0221}body.xcyber a{color:#fef200}
body.xcyber::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483000;background:repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 1px,transparent 1px 3px)}
`, RB = `
@keyframes xrbmove{0%{background-position:0% 50%}100%{background-position:200% 50%}}
body.xrainbow{--bg-main:#1a1033;--bg-panel:#241747;--bg-panel-alt:#2e1f5a;--bg-header:#1a1033;--bg-menu:#261a4d;--bg-input:#140c2a;--text-main:#fff;--text-muted:#f0e8ff;--text-dim:#bfb2e6;--border-color:#7d5fd6;--border-soft:rgba(255,255,255,.12);--accent-text:#ffd166;--accent:255,209,102;--x-acc:255,209,102;--x-acc-c:#ffd166}
body.xrainbow #top-bar{background:linear-gradient(90deg,#ff595e,#ff924c,#ffca3a,#8ac926,#1982c4,#6a4c93,#ff595e)!important;background-size:200% 100%!important;animation:xrbmove 12s linear infinite;border:0!important}
body.xrainbow #top-bar b,body.xrainbow #top-bar span,body.xrainbow #top-bar .brand{color:#fff!important;text-shadow:0 1px 3px rgba(0,0,0,.55)!important}
body.xrainbow #toolbar{border-bottom:3px solid transparent!important;border-image:linear-gradient(90deg,#ff595e,#ffca3a,#8ac926,#1982c4,#6a4c93) 1!important}
body.xrainbow button,body.xrainbow .btn{border-radius:999px!important;border:2px solid transparent!important;background:linear-gradient(#2e1f5a,#2e1f5a) padding-box,linear-gradient(90deg,#ff595e,#ffca3a,#8ac926,#1982c4,#6a4c93) border-box!important;color:#fff!important}
body.xrainbow button:hover{filter:brightness(1.25) saturate(1.2)}
body.xrainbow button.btn-active,body.xrainbow button.on,body.xrainbow button.ok,body.xrainbow .btn-big{background:linear-gradient(90deg,#ff595e,#ff924c,#ffca3a,#8ac926,#1982c4,#6a4c93) border-box!important;background-size:200% 100%!important;animation:xrbmove 6s linear infinite;color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.6)}
body.xrainbow .card,body.xrainbow .modal-box,body.xrainbow #xs-panel,body.xrainbow [class$="-box"]{border:2px solid transparent!important;background:linear-gradient(#241747,#241747) padding-box,linear-gradient(135deg,#ff595e,#ffca3a,#8ac926,#1982c4,#6a4c93) border-box!important;border-radius:16px!important}
body.xrainbow h1,body.xrainbow h2,body.xrainbow .ps-brand span{background:linear-gradient(90deg,#ff595e,#ffca3a,#8ac926,#1982c4,#c77dff);-webkit-background-clip:text;background-clip:text;color:transparent!important}
body.xrainbow ::selection{background:#ffca3a;color:#1a1033}body.xrainbow a{color:#8ecae6}
@media (prefers-reduced-motion:reduce){body.xrainbow *{animation:none!important}}
`;
    function css() { if (document.getElementById('xth-css')) return; const s = document.createElement('style'); s.id = 'xth-css'; s.textContent = W2K + XP + CY + RB + MORE + 'body.xsepia #top-bar button,body.xsepia #top-bar button *,body.xsepia #top-bar a.btn,body.xsepia #top-bar a.btn *{color:#2b1d0e!important}'; document.head.appendChild(s); }
    function init() {
        css(); apply();
        if (mq && mq.addEventListener) mq.addEventListener('change', () => { if (mode() === 'auto') apply(); });
        addEventListener('storage', e => { if (e.key === K) apply(); });
        const go = () => { apply(); let t = null; new MutationObserver(() => { clearTimeout(t); t = setTimeout(inSettings, 120); }).observe(document.body, { childList: true }); };
        XBOOT.ready(go, 300);
    }
    return { init, set, mode, apply };
})();

XTHEME.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XPDASH : 📈 tableau de bord du projet
//  Avancement par phase (PLANNO), budget du devis retenu (DEVISO) comparé au réel (dépenses DEVISO / app équipe),
//  échéances datées de tous les outils (XCALEV), retards. Carte « Pilotage » sur l'accueil + page complète.
// =====================================================================
const XPDASH = (() => {
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = n => String(n).padStart(2, '0'), today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    const dd = s => Math.round((Date.parse(String(s).slice(0, 10) + 'T12:00:00') - Date.parse(today() + 'T12:00:00')) / 864e5);
    const days = (a, b) => Math.max(1, Math.round((Date.parse(String(b || a).slice(0, 10) + 'T12:00:00') - Date.parse(String(a).slice(0, 10) + 'T12:00:00')) / 864e5) + 1);
    const fr = s => /^\d{4}-\d{2}-\d{2}/.test(s || '') ? new Date(s.slice(0, 10) + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : (s || '');
    const eur = n => Math.round(n || 0).toLocaleString('fr-FR') + ' €';
    const when = n => n === 0 ? 'aujourd\'hui' : n === 1 ? 'demain' : n < 0 ? 'il y a ' + (-n) + ' j' : 'dans ' + n + ' j';
    const fiche = () => { const s = J('xiii.projets', null); return s && s.list ? s.list.find(f => f && f.id === s.active) || null : null; };
    const PH = [['prepa', 'Préparation', '#7986cb'], ['casting', 'Casting & talents', '#ba68c8'], ['reperage', 'Repérages', '#4db6ac'], ['tournage', 'Tournage', '#ef5350'], ['post', 'Post-production', '#ffb74d'], ['livraison', 'Livraison & diffusion', '#81c784'], ['autre', 'Autre', '#90a4ae']];
    // ---------- données ----------
    function phases() {
        const pl = J('plannoXIII.project', null), T = ((pl && pl.tasks) || []).filter(t => t && t.name), t0 = today();
        return PH.map(([id, name, col]) => {
            const L = T.filter(t => (t.phase || 'autre') === id); if (!L.length) return null;
            let w = 0, wd = 0, late = 0, wip = 0, done = 0, d0 = '', d1 = '';
            L.forEach(t => { const s = t.start || '', e = t.end || t.start || ''; const k = t.ms ? 0.5 : (s ? days(s, e) : 1); w += k; const ok = t.status === 'done'; if (ok) { wd += k; done++; } else if (t.status === 'wip') { wd += k * (t.pct != null ? +t.pct / 100 : 0.5); wip++; } if (!ok && e && e < t0) late++; if (s && (!d0 || s < d0)) d0 = s; if (e && (!d1 || e > d1)) d1 = e; });
            return { id, name, col, n: L.length, done, wip, late, pct: w ? Math.round(wd / w * 100) : 0, d0, d1, now: d0 && d1 && d0 <= t0 && t0 <= d1, tasks: L };
        }).filter(Boolean);
    }
    function budget() {
        const S = J('devisoXIII.summary', null), DP = J('devisoXIII.project', null); if (!S || !S.ht) return null;
        const R = (DP && DP.real) || [], by = { eq: 0, crew: 0, fees: 0, other: 0 }; R.forEach(r => { by[r.cat || 'other'] = (by[r.cat || 'other'] || 0) + (+r.ht || 0); });
        const real = by.eq + by.crew + by.fees + by.other, dev = { eq: +S.eq || 0, crew: +S.crew || 0, fees: +S.fees || 0 }; dev.other = Math.max(0, (+S.ht || 0) - dev.eq - dev.crew - dev.fees); // frais généraux, imprévus, marge
        return { ht: +S.ht, version: S.version || '', dev, by, real, last: R.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 5) };
    }
    function deadlines(n) {
        const t = today(), L = [], f = fiche();
        if (typeof XCALEV !== 'undefined') { try { XCALEV.events().forEach(e => { if (e.d1 >= addDays(t, -30) && !/fait/.test(e.det || '')) L.push({ d: e.d0, d1: e.d1, t: e.title, a: e.src, late: e.d1 < t && !!e.warn, det: e.det }); }); } catch (e) { } }
        else { const pl = J('plannoXIII.project', null); ((pl && pl.tasks) || []).forEach(x => { if (x.status === 'done') return; const d = x.ms ? x.start : (x.end || x.start); if (d) L.push({ d, t: (x.ms ? '◆ ' : '') + x.name, a: 'planno', late: d < t }); }); }
        if (f) [['debut', '🎬 Début du tournage'], ['fin', '🏁 Fin du tournage'], ['diffusion', '📺 Diffusion']].forEach(([k, l]) => { if (f[k] && !L.some(x => x.d === f[k] && x.t === l)) L.push({ d: f[k], t: l, a: 'calendrier' }); });
        const seen = new Set(); return L.filter(x => (x.d >= t || x.late) && !seen.has(x.d + x.t) && seen.add(x.d + x.t)).sort((a, b) => (b.late - a.late) || a.d.localeCompare(b.d)).slice(0, n || 12);
    }
    function addDays(s, n) { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
    function overall(P) { const w = P.reduce((a, p) => a + p.n, 0); return w ? Math.round(P.reduce((a, p) => a + p.pct * p.n, 0) / w) : null; }
    const bar = (p, col) => '<div class="xpd-bar"><i style="width:' + Math.max(0, Math.min(100, p)) + '%;background:' + col + '"></i></div>';
    const cd = f => { if (!f || !f.debut) return null; const n = dd(f.debut), e = f.fin ? dd(f.fin) : n; return n > 0 ? ['J-' + n, 'avant le tournage'] : e >= 0 ? ['Jour ' + (1 - n), 'de tournage' + (f.fin ? ' sur ' + days(f.debut, f.fin) : '')] : ['J+' + (-e), 'après le tournage']; };
    // ---------- carte de l'accueil ----------
    function card() {
        const f = fiche(), P = phases(), B = budget(), D = deadlines(30), late = D.filter(x => x.late).length, o = overall(P), c = cd(f);
        if (!P.length && !B && !f) return '<p class="xd-e">Remplissez la fiche projet, le planning (PLANNO) et le devis (DEVISO) : le pilotage s\'affiche ici.</p>';
        const cur = P.find(p => p.now);
        return '<div class="xpd-k">' + (c ? '<div><b>' + c[0] + '</b><span>' + c[1] + '</span></div>' : '') + (o != null ? '<div><b>' + o + ' %</b><span>avancement' + (cur ? ' · ' + esc(cur.name) : '') + '</span></div>' : '') + (B ? '<div><b class="' + (B.real > B.ht ? 'ko' : '') + '">' + Math.round(B.real / B.ht * 100) + ' %</b><span>du budget dépensé</span></div>' : '') + (late ? '<div><b class="ko">' + late + '</b><span>en retard</span></div>' : '') + '</div>' +
            (P.length ? P.map(p => '<div class="xpd-ph"><span>' + esc(p.name) + (p.late ? ' <em>⚠️ ' + p.late + '</em>' : '') + '</span>' + bar(p.pct, p.col) + '<small>' + p.pct + ' %</small></div>').join('') : '') +
            '<button class="xd-l" onclick="XPDASH.open()">📈 Tableau de bord complet →</button>';
    }
    // ---------- page complète ----------
    function open() {
        const f = fiche(), P = phases(), B = budget(), D = deadlines(16), o = overall(P), c = cd(f), late = D.filter(x => x.late);
        let ov = document.getElementById('xpd'); if (ov) ov.remove(); ov = document.createElement('div'); ov.id = 'xpd';
        const sec = (t, body, link) => '<section><h3>' + t + (link ? '<a href="' + link[0] + '">' + link[1] + ' →</a>' : '') + '</h3>' + body + '</section>';
        const phHtml = P.length ? P.map(p => '<div class="xpd-row' + (p.now ? ' now' : '') + '"><div class="xpd-n"><i style="background:' + p.col + '"></i><b>' + esc(p.name) + '</b>' + (p.now ? ' <span class="xpd-tag">en cours</span>' : '') + '<small>' + (p.d0 ? fr(p.d0) + (p.d1 && p.d1 !== p.d0 ? ' → ' + fr(p.d1) : '') : 'sans dates') + ' · ' + p.done + '/' + p.n + ' tâche(s) faite(s)' + (p.wip ? ' · ' + p.wip + ' en cours' : '') + (p.late ? ' · <b class="ko">' + p.late + ' en retard</b>' : '') + '</small></div>' + bar(p.pct, p.col) + '<b class="xpd-p">' + p.pct + ' %</b></div>' +
            (p.late ? '<div class="xpd-late">' + p.tasks.filter(t => t.status !== 'done' && (t.end || t.start) && (t.end || t.start) < today()).slice(0, 4).map(t => '⚠️ ' + esc(t.name) + ' <small>(prévu ' + fr(t.end || t.start) + ')</small>').join('<br>') + '</div>' : '')).join('') : '<p class="xpd-e">Aucune tâche dans PLANNO. Le planning par phase (préparation, tournage, post-production…) alimente cet avancement.</p>';
        let bHtml = '<p class="xpd-e">Aucun devis chiffré dans DEVISO.</p>';
        if (B) { const rows = [['eq', '🎥 Matériel'], ['crew', '👥 Équipe'], ['fees', '🍽️ Frais'], ['other', '📦 Autres (frais généraux, imprévus, marge / dépenses diverses)']];
            bHtml = '<div class="xpd-bk"><div><span>Devis retenu' + (B.version ? ' (' + esc(B.version) + ')' : '') + '</span><b>' + eur(B.ht) + ' HT</b></div><div><span>Dépensé</span><b class="' + (B.real > B.ht ? 'ko' : '') + '">' + eur(B.real) + ' HT</b></div><div><span>Reste</span><b class="' + (B.ht - B.real < 0 ? 'ko' : 'ok') + '">' + eur(B.ht - B.real) + '</b></div></div>' +
                '<table class="xpd-t"><tr><th>Poste</th><th class="r">Devis</th><th class="r">Réel</th><th></th><th class="r">Écart</th></tr>' + rows.map(([k, l]) => { const a = B.by[k] || 0, b = B.dev[k] || 0, p = b ? a / b * 100 : (a ? 101 : 0); return '<tr><td>' + l + '</td><td class="r">' + eur(b) + '</td><td class="r">' + eur(a) + '</td><td style="width:30%">' + bar(Math.min(100, p), p > 100 ? '#e57373' : p > 85 ? '#ffb74d' : '#81c784') + '</td><td class="r ' + (a - b > 0.5 ? 'ko' : 'ok') + '">' + (a - b > 0 ? '+' : '') + eur(a - b) + '</td></tr>'; }).join('') + '</table>' +
                (B.last.length ? '<div class="xpd-sub">Dernières dépenses : ' + B.last.map(r => esc(r.label || 'Dépense') + ' <small>' + eur(r.ht) + ' · ' + fr(r.date) + '</small>').join(' · ') + '</div>' : '<div class="xpd-sub">Aucune dépense saisie : DEVISO › 💳 Réel, ou « Dépense » dans l\'application de l\'équipe.</div>'); }
        const dHtml = D.length ? D.map(x => { const n = dd(x.d); return '<a class="xpd-d' + (x.late ? ' late' : '') + '" href="' + (x.a === 'fiche' ? 'calendrier' : x.a) + '.html"><span class="xpd-dd">' + fr(x.d) + '</span><span>' + esc(x.t) + (x.det ? ' <small>' + esc(x.det) + '</small>' : '') + '</span><small>' + (x.late ? '⚠️ en retard' : when(n)) + '</small></a>'; }).join('') : '<p class="xpd-e">Aucune échéance à venir.</p>';
        ov.innerHTML = '<div class="xpd-box"><div class="xpd-h"><b>📈 Tableau de bord — ' + esc((f && f.title) || 'Projet') + '</b><button onclick="window.print()">🖨️</button><button id="xpd-x">✕</button></div>' +
            '<div class="xpd-kpi">' + (c ? '<div><b>' + c[0] + '</b><span>' + c[1] + '</span></div>' : '') + '<div><b>' + (o != null ? o + ' %' : '—') + '</b><span>avancement global</span>' + (o != null ? bar(o, '#f0b378') : '') + '</div>' + (B ? '<div><b class="' + (B.real > B.ht ? 'ko' : '') + '">' + Math.round(B.real / B.ht * 100) + ' %</b><span>du budget dépensé</span>' + bar(B.real / B.ht * 100, B.real > B.ht ? '#e57373' : '#81c784') + '</div>' : '') + '<div><b class="' + (late.length ? 'ko' : 'ok') + '">' + late.length + '</b><span>échéance(s) en retard</span></div></div>' +
            '<div class="xpd-g">' + sec('🗂️ Avancement par phase', phHtml, ['planno.html', 'PLANNO']) + sec('💶 Budget : devis / réel', bHtml, ['deviso.html', 'DEVISO']) + sec('⏰ Échéances', dHtml, ['calendrier.html', 'CALENDRIER']) + '</div></div>';
        document.body.appendChild(ov); ov.querySelector('#xpd-x').onclick = () => ov.remove(); ov.addEventListener('mousedown', e => { if (e.target === ov) ov.remove(); });
        const k = e => { if (e.key === 'Escape' && document.getElementById('xpd')) { ov.remove(); removeEventListener('keydown', k); } }; addEventListener('keydown', k);
    }
    const css = document.createElement('style');
    css.textContent = '.xpd-k{display:flex;gap:14px;flex-wrap:wrap;margin:2px 0 8px}.xpd-k div b{display:block;font-size:20px}.xpd-k div span{font-size:11px;opacity:.7}.xpd-ph{display:flex;gap:8px;align-items:center;font-size:12px;margin:3px 0}.xpd-ph span{width:42%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xpd-ph em{font-style:normal;color:#e57373}.xpd-ph .xpd-bar{flex:1}.xpd-ph small{width:34px;text-align:right}' +
        '.xpd-bar{height:8px;border-radius:99px;background:rgba(128,128,128,.25);overflow:hidden}.xpd-bar i{display:block;height:100%;border-radius:99px}.ko{color:#e57373!important}.ok{color:#81c784}' +
        '#xpd{position:fixed;inset:0;z-index:10300;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:flex-start;padding:4vh 14px;overflow:auto;font:14px/1.45 "Segoe UI",system-ui,sans-serif}.xpd-box{width:min(1100px,100%);background:var(--bg-menu,#1f1f23);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.5);border-radius:16px;padding:16px 18px;box-shadow:0 20px 60px rgba(0,0,0,.6)}' +
        '.xpd-h{display:flex;gap:8px;align-items:center}.xpd-h b{flex:1;font-size:18px}.xpd-h button,.xpd-box button{font:inherit;color:inherit;background:rgba(240,179,120,.15);border:1px solid rgba(240,179,120,.5);border-radius:8px;padding:6px 10px;cursor:pointer}' +
        '.xpd-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:12px 0}.xpd-kpi>div{background:rgba(128,128,128,.1);border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:10px 12px}.xpd-kpi b{display:block;font-size:26px}.xpd-kpi span{font-size:12px;opacity:.75;display:block;margin-bottom:6px}' +
        '.xpd-g{display:grid;grid-template-columns:1.1fr 1fr;gap:12px}.xpd-g section{background:rgba(128,128,128,.07);border:1px solid rgba(128,128,128,.22);border-radius:12px;padding:12px}.xpd-g section:last-child{grid-column:1/-1}.xpd-g h3{margin:0 0 8px;font-size:15px;display:flex;justify-content:space-between}.xpd-g h3 a{font-size:12px;color:#f0b378;font-weight:400}' +
        '.xpd-row{display:grid;grid-template-columns:1fr 34% 44px;gap:10px;align-items:center;padding:7px 4px;border-bottom:1px solid rgba(128,128,128,.18)}.xpd-row.now{background:rgba(240,179,120,.08);border-radius:8px}.xpd-n i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}.xpd-n small{display:block;opacity:.7;font-size:11.5px}.xpd-p{text-align:right}.xpd-tag{font-size:10.5px;background:#f0b378;color:#1d1b19;border-radius:6px;padding:0 5px}.xpd-late{font-size:12px;color:#e57373;padding:2px 4px 6px 20px}' +
        '.xpd-bk{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px}.xpd-bk span{display:block;font-size:11.5px;opacity:.7}.xpd-bk b{font-size:17px}.xpd-t{width:100%;border-collapse:collapse;font-size:12.5px}.xpd-t th{text-align:left;font-size:11px;opacity:.7;font-weight:600;padding:4px}.xpd-t td{padding:5px 4px;border-top:1px solid rgba(128,128,128,.18)}.xpd-t .r{text-align:right;white-space:nowrap}.xpd-sub{font-size:12px;opacity:.85;margin-top:8px}' +
        '.xpd-d{display:grid;grid-template-columns:110px 1fr auto;gap:10px;padding:6px 4px;border-bottom:1px solid rgba(128,128,128,.18);color:inherit;text-decoration:none;font-size:13px}.xpd-d small{opacity:.7}.xpd-d.late{color:#e57373}.xpd-dd{font-weight:600}.xpd-e{opacity:.7;font-size:13px}' +
        '@media(max-width:760px){.xpd-g{grid-template-columns:1fr}.xpd-row{grid-template-columns:1fr 30% 40px}.xpd-d{grid-template-columns:86px 1fr}}@media print{#xpd{position:static;background:none;padding:0}.xpd-box{box-shadow:none;border:0;color:#111;background:#fff}.xpd-h button{display:none}}';
    document.head.appendChild(css);
    return { open, card, phases, budget, deadlines };
})();

