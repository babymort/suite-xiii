// SUITE XIII — module commun. Source : xiii-src/encodo-auto.js
// =====================================================================
//  ENCODO XIII — ⚡ automatisations
//  • Files nommées : « Proxies J2 », « Livraison client »… chacune avec sa fonction (catégorie + préréglage),
//    ses fichiers, et en option un dossier surveillé (entrée) et un dossier de sortie.
//  • Dossiers surveillés (Chrome, Edge) : chaque nouveau fichier déposé dans le dossier part dans sa file et se convertit seul ;
//    le résultat est écrit dans le dossier de sortie (ou téléchargé).
//  • Préréglage par client : la fonction se choisit seule d'après le client de la fiche projet.
//  • Notification de fin : notification du système, titre de l'onglet qui clignote, son discret — même dans un autre onglet.
// =====================================================================
var XENA = window.XENA || (() => {
    const K = 'encodoXIII.auto', J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fold = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const id = () => Math.random().toString(36).slice(2, 10), say = (m, ms) => { try { toast(m, ms); } catch (e) { } };
    const FS = typeof window.showDirectoryPicker === 'function';
    const CATN = { video: '🎞️ Vidéo', audio: '🎧 Audio', image: '🖼️ Image', doc: '📄 PDF' }, KIND = { video: ['video'], audio: ['audio', 'video'], image: ['image'], doc: ['pdf', 'image'] };
    let S = Object.assign({ files: [], clients: [], notify: true, sound: true }, J(K, {}));
    const save = () => W(K, Object.assign({}, S, { files: S.files.map(f => Object.assign({}, f, { seen: undefined })) }));
    // ---------- poignées de dossiers (IndexedDB : elles ne passent pas en JSON) ----------
    const DB = () => new Promise((ok, ko) => { const r = indexedDB.open('encodo-auto', 1); r.onupgradeneeded = () => r.result.createObjectStore('h'); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
    async function hPut(k, h) { const d = await DB(); return new Promise(ok => { const t = d.transaction('h', 'readwrite'); h ? t.objectStore('h').put(h, k) : t.objectStore('h').delete(k); t.oncomplete = ok; t.onerror = ok; }); }
    async function hGet(k) { const d = await DB(); return new Promise(ok => { const r = d.transaction('h').objectStore('h').get(k); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }); }
    const H = {}; // poignées chargées
    async function perm(h, rw, ask) { if (!h) return false; const o = { mode: rw ? 'readwrite' : 'read' }; try { if ((await h.queryPermission(o)) === 'granted') return true; if (ask) return (await h.requestPermission(o)) === 'granted'; } catch (e) { } return false; }
    // ---------- préréglages ----------
    const presetsOf = cat => { const U = (typeof userPresets === 'function' ? userPresets() : []).filter(p => p.cat === cat).map(p => ['u:' + p.id, '⭐ ' + p.name]); return (PRESETS[cat] || []).map(p => [p[0], p[1]]).concat(U); };
    const presetName = (cat, v) => (presetsOf(cat).find(p => p[0] === v) || [, v || '—'])[1];
    function useCfg(cat, preset) { if (prefs.cat !== cat) setCat(cat, true); if (preset && prefs.preset[cat] !== preset) applyPreset(preset); try { $('preset').value = prefs.preset[cat]; } catch (e) { } }
    // ---------- files nommées : exécution file par file avec leur réglage ----------
    let BUSY = false;
    async function runNamed() {
        if (BUSY || RUN) return; BUSY = true; const back = { cat: prefs.cat, preset: prefs.preset[prefs.cat] };
        try {
            const groups = [...new Set(Q.filter(x => x.status === 'wait' || x.status === 'err').map(x => x.qn || ''))];
            for (const g of groups) {
                const F = S.files.find(f => f.id === g); if (g && !F) continue;
                if (F) useCfg(F.cat, F.preset); else useCfg(back.cat, back.preset);
                const order = Q.slice(), keep = new Set(Q.filter(x => (x.qn || '') === g || (x.status !== 'wait' && x.status !== 'err')));
                Q.splice(0, Q.length, ...order.filter(x => keep.has(x))); // les autres files attendent hors de la liste le temps de cette file
                try { await runQueue(); } finally { Q.splice(0, Q.length, ...order); }
                if (F) await writeOut(F); if (STOP) break;
            }
        } finally { BUSY = false; useCfg(back.cat, back.preset); try { render(); } catch (e) { } }
        done(true);
    }
    async function writeOut(F) {
        const out = H['o:' + F.id]; const L = Q.filter(x => x.qn === F.id && x.status === 'done' && (x.outs || []).length && !x._w); if (!L.length) return;
        if (out && await perm(out, true)) { let n = 0; for (const it of L) { for (const o of it.outs) { try { const fh = await out.getFileHandle(o.name, { create: true }), w = await fh.createWritable(); await w.write(o.blob); await w.close(); n++; } catch (e) { console.warn('ENCODO sortie', e); } } it._w = 1; } if (n) say('💾 ' + n + ' fichier(s) écrit(s) dans « ' + out.name + ' » (' + F.name + ')', 5000); }
        else if (F.dl) L.forEach(it => { it.outs.forEach(dl); it._w = 1; });
    }
    // ---------- dossiers surveillés ----------
    async function scan(F, first) {
        const dir = H['i:' + F.id]; if (!dir || !F.on || !(await perm(dir, false))) return 0; const seen = F.seen = F.seen || new Set(J(K + '.seen.' + F.id, [])); let n = 0; const add = [];
        try { for await (const [name, h] of dir.entries()) { if (h.kind !== 'file' || /^\./.test(name)) continue; const f = await h.getFile(), k = name + '|' + f.size + '|' + f.lastModified;
            if (seen.has(k)) continue; if (Date.now() - f.lastModified < 4000) continue; // fichier encore en cours de copie
            seen.add(k); if (first && !F.old) continue; if (KIND[F.cat].indexOf(kindOf(f)) < 0) continue; add.push(f); } } catch (e) { console.warn('ENCODO dossier', e); return 0; }
        W(K + '.seen.' + F.id, [...seen].slice(-3000));
        if (add.length) { const before = Q.length; addFiles(add); Q.slice(before).forEach(x => x.qn = F.id); n = add.length; say('📂 ' + n + ' nouveau(x) fichier(s) dans « ' + dir.name + ' » → file « ' + F.name + ' »', 5000); render(); }
        return n;
    }
    let tick = null;
    function watch() { clearInterval(tick); if (!S.files.some(f => f.on && H['i:' + f.id])) return; tick = setInterval(async () => { let n = 0; for (const F of S.files) n += await scan(F); if (n && !RUN && !BUSY) runNamed(); }, 8000); }
    // ---------- fin de conversion : notification ----------
    let blink = null; const T0 = document.title;
    function done(force) {
        if (BUSY && !force) return;
        const ok = Q.filter(x => x.status === 'done').length, er = Q.filter(x => x.status === 'err').length; if (!ok && !er) return; if (!S.notify) return;
        const msg = ok + ' fichier(s) converti(s)' + (er ? ' · ' + er + ' en erreur' : '');
        if (document.hidden) { try { if (window.Notification && Notification.permission === 'granted') { const n = new Notification('ENCODO — conversion terminée', { body: msg, tag: 'encodo-fin', icon: 'logos/encodo.png' }); n.onclick = () => { window.focus(); try { parent.focus(); } catch (e) { } n.close(); }; } } catch (e) { }
            clearInterval(blink); let k = 0; blink = setInterval(() => { document.title = (k++ % 2) ? '✅ Terminé — ENCODO' : T0; if (!document.hidden) { clearInterval(blink); document.title = T0; } }, 1000); }
        if (S.sound) try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.0001, a.currentTime); g.gain.exponentialRampToValueAtTime(.15, a.currentTime + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + .5); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .55); setTimeout(() => a.close(), 900); } catch (e) { }
        try { new BroadcastChannel('xiii-encodo-fin').postMessage({ msg, at: Date.now() }); } catch (e) { }
    }
    // ---------- préréglage par client ----------
    function fiche() { const s = J('xiii.projets', {}) || {}; return (s.list || []).find(x => x && x.id === s.active) || {}; }
    function clientRule() { const c = fold(fiche().client || ''); if (!c) return null; return S.clients.find(r => r.on !== false && fold(r.client) && (c.indexOf(fold(r.client)) >= 0 || fold(r.client).indexOf(c) >= 0)) || null; }
    function applyClient(quiet) { const r = clientRule(); if (!r) return false; useCfg(r.cat, r.preset); if (!quiet) say('👤 Préréglage du client « ' + r.client + ' » : ' + presetName(r.cat, r.preset), 5000); return true; }
    // ---------- fenêtre ----------
    function open() {
        css(); const old = document.getElementById('ena'); if (old) old.remove();
        document.body.insertAdjacentHTML('beforeend', '<div id="ena" role="dialog" aria-modal="true" aria-label="Automatisations ENCODO"><div class="ena-b"><div class="ena-h"><b>⚡ Automatisations</b><button class="ena-x" aria-label="Fermer">✕</button></div><div class="ena-c"></div></div></div>');
        const o = document.getElementById('ena'), close = () => o.remove(); o.querySelector('.ena-x').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); }); o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        draw();
    }
    const catSel = (v, a) => '<select ' + a + '>' + Object.keys(CATN).map(c => '<option value="' + c + '"' + (c === v ? ' selected' : '') + '>' + CATN[c] + '</option>').join('') + '</select>';
    const preSel = (cat, v, a) => '<select ' + a + '>' + presetsOf(cat).map(p => '<option value="' + E(p[0]) + '"' + (p[0] === v ? ' selected' : '') + '>' + E(p[1]) + '</option>').join('') + '</select>';
    async function draw() {
        const c = document.querySelector('#ena .ena-c'); if (!c) return; const cl = fiche().client || '', r = clientRule(), np = window.Notification ? Notification.permission : 'na';
        const rows = await Promise.all(S.files.map(async F => { const i = H['i:' + F.id], o = H['o:' + F.id], iok = i && await perm(i, false), ook = o && await perm(o, true), n = Q.filter(x => x.qn === F.id).length, w = Q.filter(x => x.qn === F.id && x.status === 'wait').length;
            return '<div class="ena-f" data-f="' + F.id + '"><div class="r1"><input class="nm" value="' + E(F.name) + '" aria-label="Nom de la file">' + catSel(F.cat, 'data-k="cat"') + preSel(F.cat, F.preset, 'data-k="preset"') + '<span class="ct">' + n + ' fichier(s)' + (w ? ' · ' + w + ' en attente' : '') + '</span><button data-a="del" title="Supprimer la file">🗑️</button></div>' +
                '<div class="r2"><button data-a="add">➕ Ajouter des fichiers</button>' + (FS ? '<button data-a="in" class="' + (i ? 'on' : '') + '">' + (i ? '📂 ' + E(i.name) + (iok ? '' : ' 🔒') : '📂 Surveiller un dossier…') + '</button>' + (i ? '<label class="ck"><input type="checkbox" data-k="on"' + (F.on ? ' checked' : '') + '> surveillance active</label><label class="ck"><input type="checkbox" data-k="old"' + (F.old ? ' checked' : '') + '> fichiers déjà présents aussi</label>' : '') +
                '<button data-a="out" class="' + (o ? 'on' : '') + '">' + (o ? '💾 → ' + E(o.name) + (ook ? '' : ' 🔒') : '💾 Dossier de sortie…') + '</button>' : '') + '<label class="ck"><input type="checkbox" data-k="dl"' + (F.dl ? ' checked' : '') + '> télécharger le résultat</label>' + ((i && !iok) || (o && !ook) ? '<button data-a="perm" class="p">🔓 Réactiver l’accès aux dossiers</button>' : '') + (w ? '<button data-a="run" class="p">▶ Convertir cette file</button>' : '') + '</div></div>'; }));
        c.innerHTML = '<section><h4>📚 Files nommées</h4><p class="ena-n">Chaque file garde sa fonction : déposez-y des fichiers ou un dossier entier. « ▶ Convertir » dans la barre traite toutes les files l’une après l’autre, chacune avec son réglage.' + (FS ? '' : ' <b>Dossiers surveillés : disponibles dans Chrome ou Edge sur ordinateur.</b>') + '</p>' + (rows.join('') || '<p class="ena-n">Aucune file pour l’instant.</p>') + '<button class="ena-add">➕ Nouvelle file</button></section>' +
            '<section><h4>👤 Préréglage par client</h4><p class="ena-n">Quand le client de la fiche projet correspond, ENCODO choisit la fonction à l’ouverture.' + (cl ? ' Client du projet : <b>' + E(cl) + '</b>' + (r ? ' → ' + E(presetName(r.cat, r.preset)) : ' (aucune règle)') : ' (fiche projet sans client)') + '</p>' +
            S.clients.map((x, k) => '<div class="ena-cl" data-c="' + k + '"><input value="' + E(x.client) + '" placeholder="Client (ex. France Télévisions)" data-k="client">' + catSel(x.cat, 'data-k="cat"') + preSel(x.cat, x.preset, 'data-k="preset"') + '<button data-a="cdel">✕</button></div>').join('') +
            '<div class="ena-row"><button class="ena-cadd">➕ Règle client</button>' + (cl ? '<button class="ena-cnow">Créer la règle « ' + E(cl) + ' » avec la fonction actuelle</button>' : '') + (r ? '<button class="ena-capply">Appliquer maintenant</button>' : '') + '</div></section>' +
            '<section><h4>🔔 Fin de conversion</h4><label class="ck"><input type="checkbox" data-g="notify"' + (S.notify ? ' checked' : '') + '> Me prévenir quand c’est fini, même si je suis dans un autre onglet ou un autre outil</label>' + (np === 'default' ? ' <button class="ena-np">Autoriser les notifications</button>' : np === 'denied' ? '<small class="ena-n">Notifications bloquées dans le navigateur : seul le titre de l’onglet clignotera.</small>' : '') +
            '<label class="ck"><input type="checkbox" data-g="sound"' + (S.sound ? ' checked' : '') + '> Petit son à la fin</label></section>';
        const F = el => S.files.find(f => f.id === el.closest('[data-f]').dataset.f);
        c.querySelectorAll('.ena-f .nm').forEach(i => i.onchange = () => { F(i).name = i.value.trim() || 'File'; save(); });
        c.querySelectorAll('.ena-f [data-k]').forEach(i => i.onchange = () => { const f = F(i), k = i.dataset.k; if (i.type === 'checkbox') f[k] = i.checked; else f[k] = i.value; if (k === 'cat') f.preset = presetsOf(f.cat)[0][0]; save(); if (k === 'on') watch(); if (k === 'cat') draw(); });
        c.querySelectorAll('.ena-f [data-a]').forEach(b => b.onclick = async () => { const f = F(b), a = b.dataset.a;
            if (a === 'del') { if (!confirm('Supprimer la file « ' + f.name + ' » ? (les fichiers restent dans la liste)')) return; S.files = S.files.filter(x => x !== f); Q.forEach(x => { if (x.qn === f.id) delete x.qn; }); await hPut('i:' + f.id, null); await hPut('o:' + f.id, null); delete H['i:' + f.id]; delete H['o:' + f.id]; save(); watch(); draw(); }
            if (a === 'add') { const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.onchange = () => { const before = Q.length; addFiles(inp.files); Q.slice(before).forEach(x => x.qn = f.id); render(); draw(); }; inp.click(); }
            if (a === 'in' || a === 'out') { try { const h = await window.showDirectoryPicker({ mode: a === 'out' ? 'readwrite' : 'read', id: 'encodo-' + a }); H[(a === 'in' ? 'i:' : 'o:') + f.id] = h; await hPut((a === 'in' ? 'i:' : 'o:') + f.id, h); if (a === 'in') { f.on = true; f.seen = new Set(); W(K + '.seen.' + f.id, []); save(); const n = await scan(f, true); say(f.old ? '📂 ' + n + ' fichier(s) déjà présents ajoutés' : '📂 Surveillance active : les nouveaux fichiers seront convertis seuls', 5000); watch(); if (n && !RUN) runNamed(); } draw(); } catch (e) { if (e && e.name !== 'AbortError') say('⚠️ ' + e.message); } }
            if (a === 'perm') { await perm(H['i:' + f.id], false, true); await perm(H['o:' + f.id], true, true); watch(); draw(); }
            if (a === 'run') { document.getElementById('ena').remove(); runNamed(); } });
        c.querySelector('.ena-add').onclick = () => { S.files.push({ id: id(), name: 'File ' + (S.files.length + 1), cat: prefs.cat, preset: prefs.preset[prefs.cat], on: false, dl: !FS }); save(); draw(); };
        c.querySelectorAll('.ena-cl [data-k]').forEach(i => i.onchange = () => { const x = S.clients[+i.closest('[data-c]').dataset.c]; x[i.dataset.k] = i.value; if (i.dataset.k === 'cat') { x.preset = presetsOf(x.cat)[0][0]; draw(); } save(); });
        c.querySelectorAll('.ena-cl [data-a=cdel]').forEach(b => b.onclick = () => { S.clients.splice(+b.closest('[data-c]').dataset.c, 1); save(); draw(); });
        c.querySelector('.ena-cadd').onclick = () => { S.clients.push({ client: '', cat: prefs.cat, preset: prefs.preset[prefs.cat] }); save(); draw(); };
        const cn = c.querySelector('.ena-cnow'); if (cn) cn.onclick = () => { S.clients = S.clients.filter(x => fold(x.client) !== fold(cl)); S.clients.push({ client: cl, cat: prefs.cat, preset: prefs.preset[prefs.cat] }); save(); draw(); say('👤 Règle enregistrée pour « ' + cl + ' »'); };
        const ca = c.querySelector('.ena-capply'); if (ca) ca.onclick = () => { applyClient(); draw(); };
        c.querySelectorAll('[data-g]').forEach(i => i.onchange = () => { S[i.dataset.g] = i.checked; save(); if (i.dataset.g === 'notify' && i.checked && window.Notification && Notification.permission === 'default') Notification.requestPermission().then(draw); });
        const npb = c.querySelector('.ena-np'); if (npb) npb.onclick = () => Notification.requestPermission().then(draw);
    }
    // ---------- badges dans la file : nom de la file sur chaque fichier ----------
    function badges() { const qs = document.querySelectorAll('.qi[data-id]'); qs.forEach(row => { const it = Q.find(x => x.id === row.dataset.id); let b = row.querySelector('.ena-q'); if (!it || !it.qn) { if (b) b.remove(); return; } const F = S.files.find(f => f.id === it.qn); if (!F) return; if (!b) { b = document.createElement('span'); b.className = 'ena-q'; const t = row.querySelector('.nm') || row.firstElementChild; (t || row).appendChild(b); } b.textContent = '📚 ' + F.name; }); }
    function css() {
        if (document.getElementById('ena-css')) return; const s = document.createElement('style'); s.id = 'ena-css';
        s.textContent = '#ena{position:fixed;inset:0;z-index:9991;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;font:14px system-ui,sans-serif}.ena-b{background:var(--bg-panel,#252321);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;width:min(900px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 14px 50px rgba(0,0,0,.5)}.ena-h{display:flex;align-items:center;padding:12px 14px;border-bottom:1px solid var(--border-color,#3a3633)}.ena-h b{font-size:16px}.ena-x{margin-left:auto;background:none;border:0;color:inherit;font-size:17px;cursor:pointer}.ena-c{overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:16px}' +
            '.ena-c h4{margin:0 0 6px;font-size:14px}.ena-n{margin:0 0 8px;font-size:12.5px;color:var(--text-dim,#aaa)}.ena-f{border:1px solid var(--border-color,#45454b);border-radius:10px;padding:8px 10px;margin-bottom:8px;display:flex;flex-direction:column;gap:7px}.ena-f .r1,.ena-f .r2,.ena-cl,.ena-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.ena-f .nm{font-weight:700;width:170px}.ena-f .ct{font-size:12px;color:var(--text-dim,#aaa);margin-left:auto}' +
            '.ena-c input:not([type=checkbox]),.ena-c select{font:inherit;font-size:13px;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:7px;padding:5px 8px;max-width:280px}.ena-c button{font:inherit;font-size:12.5px;padding:5px 10px;border-radius:8px;border:1px solid var(--border-color,#45454b);background:rgba(255,255,255,.04);color:inherit;cursor:pointer}.ena-c button.on{border-color:rgba(240,179,120,.7);background:rgba(240,179,120,.12)}.ena-c button.p{background:#F0B378;color:#1a1a1a;border-color:#F0B378;font-weight:700}' +
            '.ena-c .ck{display:inline-flex;gap:5px;align-items:center;font-size:12.5px;cursor:pointer;margin-right:6px}.ena-c .ck input{margin:0}.ena-cl{margin-bottom:6px}.ena-c section:last-child .ck{display:flex;margin:5px 0}.ena-c section:last-child small{display:block;margin:2px 0 4px 30px}.ena-q{display:inline-block;margin-left:6px;font-size:10.5px;padding:1px 7px;border-radius:9px;background:rgba(240,179,120,.18);border:1px solid rgba(240,179,120,.45);font-weight:600;vertical-align:middle}';
        document.head.appendChild(s);
    }
    // ---------- branchement ----------
    async function init() {
        css();
        const grp = document.querySelector('#top-bar .btn-group'); if (grp && !document.getElementById('b-auto')) { const b = document.createElement('button'); b.id = 'b-auto'; b.title = 'Automatisations : files nommées, dossiers surveillés, préréglage par client, notification de fin'; b.innerHTML = '<span class="btn-icon">⚡</span><span class="btn-label">Automatisations</span>'; b.onclick = open; grp.appendChild(b); }
        // « Convertir » : files nommées gérées si le besoin existe
        const go = document.getElementById('b-go'); if (go) go.onclick = () => { if (Q.some(x => x.qn && x.status !== 'done')) runNamed(); else runQueue(); };
        if (typeof window.finish === 'function' && !window.finish.__ena) { const f0 = window.finish; window.finish = function () { const r = f0.apply(this, arguments); setTimeout(() => done(), 60); return r; }; window.finish.__ena = 1; }
        addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && Q.some(x => x.qn && x.status !== 'done')) { e.stopImmediatePropagation(); e.preventDefault(); runNamed(); } }, true);
        for (const F of S.files) { for (const p of ['i:', 'o:']) { try { const h = await hGet(p + F.id); if (h) H[p + F.id] = h; } catch (e) { } } }
        if (typeof window.renderQueue === 'function' && !window.renderQueue.__ena) { const r0 = window.renderQueue; window.renderQueue = function () { const r = r0.apply(this, arguments); try { badges(); } catch (e) { } return r; }; window.renderQueue.__ena = 1; }
        watch(); setInterval(badges, 1500);
        setTimeout(() => applyClient(false), 1200);
    }
    if (/encodo\.html/.test(location.pathname) || document.getElementById('b-go')) (document.readyState === 'complete' ? setTimeout(init, 500) : addEventListener('load', () => setTimeout(init, 500)));
    return { open, runNamed, applyClient, _s: () => S, scan, done };
})();
