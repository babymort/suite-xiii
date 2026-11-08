// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-08.js
// =====================================================================
//  SUITE XIII — XPCFG : 🖼️ personnalisation du projet, réglée par le Master pour toute l'équipe
//  Thème imposé, outils masqués sur l'accueil, photo de fond de l'accueil (déposée en fichier dans le Drive).
//  Réglage : 🎬 Projet XIII › 🖼️ Personnalisation. Partage : Drive du projet (« projet_cfg »), relu à chaque ouverture.
// =====================================================================
const XPCFG = (() => {
    const K = 'xiii.pcfg', J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const drive = () => J('xiii.drive', null), master = () => { const c = drive(); return !c || !c.url || !!c.code; }; // sans Drive : réglage local
    const THEMES = [['', '— libre (chacun son thème) —'], ['dark', '🌙 Sombre'], ['light', '☀️ Clair'], ['auto', '🖥️ Auto'], ['sobre', '◼️ Sobre'], ['sobrec', '◻️ Sobre clair'], ['w2k', '🪟 Win 2000'], ['xp', '🟦 Win XP'], ['cyber', '🌆 Cyberpunk'], ['rainbow', '🌈 Rainbow'], ['mac9', '🍎 Mac OS 9'], ['term', '📟 Terminal'], ['sepia', '🎞️ Pellicule'], ['regie', '🎛️ Régie'], ['soleil', '🔆 Plein soleil'], ['gb', '🎮 Game Boy']];
    let APP = '';
    const cfg = () => J(K, {}) || {};
    // ---------- 🔐 outils par secteur ----------
    const SECT = [['production', 'Production'], ['realisation', 'Réalisation'], ['image', 'Image'], ['son', 'Son'], ['lumiere', 'Lumière'], ['regie', 'Régie'], ['technique', 'Technique'], ['decor', 'Décor'], ['hmc', 'HMC'], ['post', 'Post-production'], ['artistes', 'Artistes'], ['client', 'Client']];
    const fold = x => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const secLabel = k => { const f = SECT.find(x => x[0] === fold(k)); return f ? f[1] : (((cfg().secs || []).find(x => fold(x[0]) === fold(k)) || [])[1] || k); };
    const mySecs = () => { const d = drive(); return d && d.tok && !d.code ? String(d.secteur || '').split(',').map(fold).filter(Boolean) : []; };
    // interdit pour moi si TOUS mes secteurs l'interdisent (une personne image + prod garde ce que la prod a)
    function denied(app, c) { c = c || cfg(); const D = c.deny || {}, S = mySecs(); if (master() || !S.length) return false; return S.every(s => { const k = Object.keys(D).find(x => fold(x) === s); return k && (D[k] || []).indexOf(app) > -1; }); }
    function restrictions(c) { c = c || cfg(); const D = c.deny || {}, T = typeof XLINKS !== 'undefined' ? XLINKS.T : {}; const all = Object.keys(T).filter(a => a !== 'jour'), nm = a => (T[a] || ['', a.toUpperCase()])[1];
        return Object.keys(D).filter(k => (D[k] || []).length).map(k => { const open = all.filter(a => D[k].indexOf(a) < 0), few = open.length < D[k].length; return { sec: k, label: secLabel(k), apps: D[k], open, names: D[k].map(nm), txt: few ? (open.length ? 'seulement ' + open.map(nm).join(', ') : 'aucun outil') : 'sans ' + D[k].map(nm).join(', ') }; }); }
    async function api(a, p) { const c = drive(); if (!c || !c.url) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: (c.me && c.me.name) || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    // ---------- appliquer ----------
    async function bgUrl(c) { if (!c.bg) return ''; if (/^data:/.test(c.bg)) return c.bg; if (typeof XFILES === 'undefined') return ''; const r = await XFILES.unpack({ b: c.bg }); return /^data:/.test(r.b) ? r.b : ''; }
    async function apply() {
        const c = cfg();
        if (c.theme && typeof XTHEME !== 'undefined' && XTHEME.mode() !== c.theme && localStorage.getItem('xiii.pcfg.applied') !== c.theme + '|' + (c.at || 0)) { XTHEME.set(c.theme); localStorage.setItem('xiii.pcfg.applied', c.theme + '|' + (c.at || 0)); }
        if (APP !== 'index') { block(c); return; }
        const hid = new Set((c.hidden || []).concat(Object.keys((typeof XLINKS !== 'undefined' && XLINKS.T) || {}).filter(a => denied(a, c)))), app = a => ((a.getAttribute('href') || '').split(/[?#]/)[0].split('/').pop() || '').replace(/\.html$/, '');
        document.querySelectorAll('a.card').forEach(a => { if (hid.has(app(a))) { a.style.display = 'none'; a.dataset.pcfg = '1'; } else if (a.dataset.pcfg) { a.style.display = ''; delete a.dataset.pcfg; } });
        document.querySelectorAll('section.phase').forEach(ph => { if (!ph.querySelector('a.card')) return; ph.style.display = [...ph.querySelectorAll('a.card')].some(a => a.style.display !== 'none') ? '' : 'none'; });
        const u = await bgUrl(c), a = Math.max(0, Math.min(.9, c.dim == null ? .55 : +c.dim));
        if (u) { document.body.classList.add('xpbg'); document.body.style.setProperty('--xpbg', 'linear-gradient(rgba(0,0,0,' + a + '),rgba(0,0,0,' + a + ')),url("' + u + '")'); }
        else { document.body.classList.remove('xpbg'); document.body.style.removeProperty('--xpbg'); }
    }
    // outil interdit à mon secteur : écran d'information (les données ne sont de toute façon plus servies par le Drive v21)
    function block(c) {
        const on = APP && APP !== 'index' && denied(APP, c), o = document.getElementById('xpc-deny');
        if (!on) { if (o) o.remove(); return; } if (o) return;
        const T = typeof XLINKS !== 'undefined' ? XLINKS.T : {}, nm = (T[APP] || ['', APP.toUpperCase()])[1], S = mySecs().map(secLabel).join(' / ');
        document.body.insertAdjacentHTML('beforeend', '<div id="xpc-deny" role="alertdialog" aria-modal="true" style="position:fixed;inset:0;z-index:99990;background:rgba(10,10,12,.92);display:flex;align-items:center;justify-content:center;padding:20px;font:15px system-ui,sans-serif;color:#eee"><div style="max-width:420px;text-align:center;background:#252321;border:1px solid rgba(240,179,120,.5);border-radius:16px;padding:26px 22px"><div style="font-size:40px">🔐</div><h2 style="margin:8px 0 6px;font-size:19px">' + esc(nm) + ' n\'est pas ouvert à votre secteur</h2><p style="color:#bbb;margin:0 0 16px">Le Master du projet a réservé cet outil à d\'autres secteurs' + (S ? ' (vous : <b>' + esc(S) + '</b>)' : '') + '. Demandez-lui si vous en avez besoin.</p><a href="index.html" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#F0B378;color:#1a1a1a;font-weight:700;text-decoration:none">← Retour à l\'accueil</a></div></div>');
    }
    // ---------- partage par le Drive ----------
    async function pull() {
        const c = drive(); if (!c || !c.url) return; const loc = cfg();
        const r = await api('get', { app: 'projet_cfg', since: loc.rev || null }); if (!r.ok || !r.rev || r.same) return;
        let n = {}; try { n = JSON.parse((r.data || {}).cfg || '{}'); } catch (e) { return; }
        n.rev = r.rev; if (master() && loc.at && loc.at > (n.at || 0)) return; // modification locale plus récente du Master : elle partira à l'enregistrement
        W(K, n); apply(); try { dispatchEvent(new Event('xiii-pcfg')); } catch (e) { }
    }
    async function push(c) {
        const d = drive(); if (!d || !d.url || !d.code) return { ok: true, local: true };
        let D = { cfg: JSON.stringify(Object.assign({}, c, { rev: undefined })) };
        if (typeof XFILES !== 'undefined') { await XFILES.prepare(D, 'fond-accueil'); D = XFILES.pack(D); }
        const g = await api('get', { app: 'projet_cfg', since: -1 }); const r = await api('put', { app: 'projet_cfg', base: g.rev || 0, data: D, sum: 'personnalisation du projet' });
        if (r.ok) { const s = JSON.parse(D.cfg); s.rev = r.rev; W(K, s); } return r;
    }
    // ---------- réglage (🎬 Projet XIII › 🖼️ Personnalisation) ----------
    function photo(file) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => { const m = 1920, k = Math.min(1, m / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/jpeg', .82)); }; im.onerror = rej; im.src = URL.createObjectURL(file); }); }
    async function mount(el) {
        if (!el) return; const c = Object.assign({}, cfg()), M = master(), T = typeof XLINKS !== 'undefined' ? XLINKS.T : {}, hid = new Set(c.hidden || []);
        const prev = await bgUrl(c);
        el.innerHTML = (M ? '' : '<p class="xpj-dim">🔒 Réglé par le Master du projet pour toute l\'équipe.</p>') +
            '<div class="xpc-g"><label class="xpj-f"><span>Thème imposé à l\'équipe</span><select id="xpc-th"' + (M ? '' : ' disabled') + '>' + THEMES.map(t => '<option value="' + t[0] + '"' + ((c.theme || '') === t[0] ? ' selected' : '') + '>' + t[1] + '</option>').join('') + '</select></label>' +
            '<div class="xpj-f"><span>Photo de fond de l\'accueil</span><div class="xpc-bg" id="xpc-bgp" style="' + (prev ? 'background-image:url(&quot;' + prev + '&quot;)' : '') + '">' + (prev ? '' : '<small>Aucune photo</small>') + '</div>' +
            (M ? '<div class="xpc-row"><label class="xpc-btn">📷 Choisir une photo<input type="file" accept="image/*" id="xpc-file" hidden></label>' + (prev ? '<button id="xpc-rm">✕ Retirer</button>' : '') + '</div><label class="xpc-row"><span>Assombrir</span><input type="range" id="xpc-dim" min="0" max="0.85" step="0.05" value="' + (c.dim == null ? .55 : c.dim) + '"></label>' : '') + '</div></div>' +
            '<div class="xpj-f" id="xpc-acc"></div>' +
            (M ? '<div class="xpc-row"><button id="xpc-save" class="xpj-main">💾 Enregistrer pour l\'équipe</button><span id="xpc-st" class="xpj-dim">' + (drive() && drive().code ? 'Partagé par le ☁️ Drive du projet.' : 'Drive non relié : réglage gardé sur ce poste.') + '</span></div>' : '');
        const deny = JSON.parse(JSON.stringify(c.deny || {})); let cols = [...new Set(Object.keys(deny).filter(k => (deny[k] || []).length).concat(c.cols || []))];
        const TL = Object.keys(T).filter(a => a !== 'jour');
        const acc = () => { const box = el.querySelector('#xpc-acc'); if (!box) return; const D = deny, avail = SECT.concat(c.secs || []).filter(x => cols.indexOf(x[0]) < 0);
            box.innerHTML = '<span>🧰 Outils disponibles pour l\'équipe <small>— cochés = ouverts. « Tous » s\'applique à toute l\'équipe (outil masqué sinon) ; une colonne de secteur réserve ou interdit un outil à ce secteur. Le Master voit toujours tout.</small></span>' +
                '<div class="xpc-acc"><table><thead><tr><th>Outil</th><th title="Toute l\'équipe">👥 Tous</th>' + cols.map(k => '<th><label title="Tout cocher / décocher pour ' + esc(secLabel(k)) + '"><input type="checkbox" data-colall="' + esc(k) + '"' + (M ? '' : ' disabled') + (!(D[k] || []).length ? ' checked' : '') + '> ' + esc(secLabel(k)) + '</label>' + (M ? '<button data-rmcol="' + esc(k) + '" title="Retirer la colonne (le secteur retrouve tous les outils)">✕</button>' : '') + '</th>').join('') +
                (M ? '<th class="add"><select id="xpc-addsec" aria-label="Ajouter un secteur"><option value="">➕ Secteur…</option>' + avail.map(x => '<option value="' + esc(x[0]) + '">' + esc(x[1]) + '</option>').join('') + '<option value="__new">Autre secteur…</option></select></th>' : '') + '</tr></thead><tbody>' +
                TL.map(a => { const off = hid.has(a); return '<tr class="' + (off ? 'off' : '') + '"><th>' + T[a][0] + ' ' + esc(T[a][1]) + '</th><td><input type="checkbox" data-all="' + a + '"' + (off ? '' : ' checked') + (M ? '' : ' disabled') + ' aria-label="' + esc(T[a][1]) + ' pour toute l\'équipe"></td>' + cols.map(k => '<td><input type="checkbox" data-sec="' + esc(k) + '" data-app="' + a + '"' + ((D[k] || []).indexOf(a) > -1 ? '' : ' checked') + (M && !off ? '' : ' disabled') + ' aria-label="' + esc(T[a][1]) + ' pour ' + esc(secLabel(k)) + '"></td>').join('') + (M ? '<td></td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>' +
                (cols.length ? '' : '<p class="xpj-dim" style="margin:6px 0 0">Ajoutez une colonne de secteur (➕) pour ouvrir ou fermer des outils à un secteur précis (image, production…).</p>') +
                '<div class="xpc-sum">' + restrictions({ deny: D }).map(r => '<span>🔐 <b>' + esc(r.label) + '</b> : ' + esc(r.txt) + '</span>').join('') + '</div>';
            if (!M) return;
            box.querySelectorAll('[data-all]').forEach(x => x.onchange = () => { x.checked ? hid.delete(x.dataset.all) : hid.add(x.dataset.all); acc(); });
            box.querySelectorAll('[data-sec]').forEach(x => x.onchange = () => { const k = x.dataset.sec, L = D[k] = D[k] || []; const i = L.indexOf(x.dataset.app); if (x.checked && i > -1) L.splice(i, 1); else if (!x.checked && i < 0) L.push(x.dataset.app); acc(); });
            box.querySelectorAll('[data-colall]').forEach(x => x.onchange = () => { D[x.dataset.colall] = x.checked ? [] : TL.slice(); acc(); });
            box.querySelectorAll('[data-rmcol]').forEach(b => b.onclick = () => { const k = b.dataset.rmcol; delete D[k]; cols = cols.filter(x => x !== k); acc(); });
            const ad = box.querySelector('#xpc-addsec'); if (ad) ad.onchange = () => { let k = ad.value; if (!k) return; if (k === '__new') { const n = (prompt('Nom du secteur (tel qu\'il est donné aux membres dans 👥 Membres et droits) :') || '').trim(); if (!n) { acc(); return; } k = fold(n).replace(/[^a-z0-9]+/g, '-'); c.secs = (c.secs || []).filter(x => x[0] !== k).concat([[k, n]]); } if (cols.indexOf(k) < 0) cols.push(k); D[k] = D[k] || []; acc(); };
        };
        acc();
        // secteurs déjà donnés aux membres (Drive) : proposés d'office en colonnes s'ils ont des restrictions, sinon dans la liste
        if (M && drive() && drive().code) api('team').then(r => { if (!r.ok) return; const extra = []; (r.team || []).forEach(m => String(m.secteur || '').split(',').map(x => x.trim()).filter(Boolean).forEach(x => { if (!SECT.some(y => y[0] === fold(x)) && !(c.secs || []).some(y => fold(y[0]) === fold(x))) extra.push([fold(x), x]); })); if (extra.length) { c.secs = (c.secs || []).concat(extra.filter((x, i, a) => a.findIndex(y => y[0] === x[0]) === i)); acc(); } }).catch(() => { });
        if (!M) return;
        const q = s => el.querySelector(s);
        q('#xpc-file').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { c.bg = await photo(f); const p = q('#xpc-bgp'); p.style.backgroundImage = 'url("' + c.bg + '")'; p.innerHTML = ''; } catch (x) { q('#xpc-st').textContent = '⚠️ Image illisible'; } };
        const rm = q('#xpc-rm'); if (rm) rm.onclick = () => { c.bg = ''; const p = q('#xpc-bgp'); p.style.backgroundImage = ''; p.innerHTML = '<small>Aucune photo</small>'; };
        q('#xpc-save').onclick = async () => {
            c.theme = q('#xpc-th').value; c.dim = +q('#xpc-dim').value; c.hidden = [...hid]; Object.keys(deny).forEach(k => { if (!(deny[k] || []).length) delete deny[k]; }); c.deny = deny; c.cols = cols; c.at = Date.now();
            q('#xpc-st').textContent = '⏳ Enregistrement…'; if (!W(K, c)) { q('#xpc-st').textContent = '⚠️ Stockage plein : choisissez une photo plus légère'; return; }
            const r = await push(c); q('#xpc-st').textContent = r.ok ? (r.local ? '✅ Enregistré sur ce poste' : '✅ Enregistré pour toute l\'équipe') : '⚠️ Drive : ' + (r.err || 'erreur'); apply();
        };
    }
    function init(app) {
        APP = app;
        const s = document.createElement('style'); s.textContent = 'body.xpbg{background-image:var(--xpbg)!important;background-size:cover!important;background-position:center!important;background-attachment:fixed!important}body.xpbg .intro,body.xpbg .intro *,body.xpbg #ui-subtitle,body.xpbg .phase-head,body.xpbg .phase-head *{color:#fff!important;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 14px rgba(0,0,0,.7)}' +
            '.xpc-acc{overflow:auto;max-height:420px;border:1px solid var(--border-soft,#3a3633);border-radius:10px;margin-top:6px}.xpc-acc table{border-collapse:collapse;font-size:12.5px;min-width:100%}.xpc-acc th,.xpc-acc td{padding:5px 8px;border-bottom:1px solid var(--border-soft,#333);text-align:center;white-space:nowrap}.xpc-acc thead th{position:sticky;top:0;background:var(--bg-panel,#252321);z-index:1;font-weight:600}.xpc-acc thead th label{display:inline-flex;gap:4px;align-items:center;cursor:pointer}.xpc-acc thead th button{background:none;border:0;color:var(--text-dim,#999);cursor:pointer;padding:0 0 0 4px;font-size:11px}.xpc-acc tbody th{text-align:left;font-weight:500;position:sticky;left:0;background:var(--bg-panel,#252321)}.xpc-acc tr.off th{opacity:.5;text-decoration:line-through}.xpc-acc td input{width:auto;margin:0;cursor:pointer}.xpc-acc select{width:auto!important;max-width:150px;font:inherit;font-size:12px;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:6px;padding:3px 5px}.xpc-sum{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.xpc-sum span{font-size:12px;padding:3px 9px;border-radius:99px;background:rgba(229,115,115,.14);border:1px solid rgba(229,115,115,.4)}' +
            '.xpc-g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.xpc-bg{height:110px;border-radius:10px;border:1px dashed var(--border-color,#555);background:center/cover no-repeat;display:flex;align-items:center;justify-content:center;color:var(--text-dim,#999)}.xpc-row{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}.xpc-btn{cursor:pointer;border:1px solid var(--border-color,#555);border-radius:8px;padding:5px 10px}.xpc-tools{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:2px 18px;font-size:13.5px}.xpc-tools label{display:flex!important;flex-direction:row!important;gap:8px;align-items:center;justify-content:space-between;padding:6px 2px;border-bottom:1px solid var(--border-color,rgba(128,128,128,.25));cursor:pointer;margin:0!important}.xpc-tools label span{flex:1}.xpc-tools label input{order:2}@media(max-width:640px){.xpc-g{grid-template-columns:1fr}}';
        document.head.appendChild(s);
        const go = () => { apply(); pull(); }; XBOOT.ready(go, 600);
        addEventListener('storage', e => { if (e.key === K) apply(); });
    }
    async function save(patch) { const c = Object.assign({}, cfg(), patch, { at: Date.now() }); if (!W(K, c)) return { ok: false, err: 'stockage' }; const r = await push(c); apply(); return r; }
    return { init, mount, apply, pull, save, get: cfg, denied, restrictions, isMaster: master };
})();

XPCFG.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XPUSH : 📲 application équipe et vraies notifications (Web Push, sans serveur à installer)
//  • Le poste du Master possède une paire de clés VAPID (créée une fois, gardée dans ce navigateur).
//  • Les téléphones de l'équipe (equipe.html installée) s'abonnent et déposent leur abonnement dans le ☁️ Drive.
//  • Pour notifier : ce navigateur chiffre le message pour chaque téléphone (RFC 8291, aes128gcm), signe le jeton
//    VAPID (ES256), et le script Google du Drive le remet au service de notification (Google, Apple, Mozilla) :
//    le téléphone sonne même application fermée.
// =====================================================================
var XPUSH = window.XPUSH || (() => {
    const te = new TextEncoder();
    const b64u = u8 => { u8 = new Uint8Array(u8); let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    const ub64 = s => { s = String(s || '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
    const cat = (...a) => { const n = a.reduce((x, y) => x + y.length, 0), o = new Uint8Array(n); let i = 0; a.forEach(x => { o.set(x, i); i += x.length; }); return o; };
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const S = crypto.subtle;
    async function hmac(key, data) { const k = await S.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return new Uint8Array(await S.sign('HMAC', k, data)); }
    // ---------- clés VAPID du Master ----------
    let VK = null;
    async function vapid() {
        if (VK) return VK; let v = J('xiii.push.vapid', null);
        if (!v || !v.pub || !v.jwk) {
            const k = await S.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
            v = { pub: b64u(await S.exportKey('raw', k.publicKey)), jwk: await S.exportKey('jwk', k.privateKey), at: Date.now() }; W('xiii.push.vapid', v);
        }
        VK = { pub: v.pub, key: await S.importKey('jwk', v.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']) }; return VK;
    }
    const JWTC = {};
    async function jwt(endpoint) {
        const aud = new URL(endpoint).origin, c = JWTC[aud]; if (c && c.exp - 3600 > Date.now() / 1000) return c.t;
        const v = await vapid(), exp = Math.floor(Date.now() / 1000) + 12 * 3600;
        const h = b64u(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))), p = b64u(te.encode(JSON.stringify({ aud, exp, sub: 'mailto:equipe@suite-xiii.app' })));
        const sig = new Uint8Array(await S.sign({ name: 'ECDSA', hash: 'SHA-256' }, v.key, te.encode(h + '.' + p)));
        JWTC[aud] = { t: h + '.' + p + '.' + b64u(sig), exp }; return JWTC[aud].t;
    }
    // ---------- chiffrement d'un message pour un abonnement (RFC 8291 / 8188) ----------
    async function encrypt(sub, text) {
        const ua = ub64(sub.keys.p256dh), auth = ub64(sub.keys.auth);
        const eph = await S.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']), as = new Uint8Array(await S.exportKey('raw', eph.publicKey));
        const uaKey = await S.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
        const shared = new Uint8Array(await S.deriveBits({ name: 'ECDH', public: uaKey }, eph.privateKey, 256));
        const prkKey = await hmac(auth, shared), ikm = (await hmac(prkKey, cat(te.encode('WebPush: info\0'), ua, as, new Uint8Array([1])))).slice(0, 32);
        const salt = crypto.getRandomValues(new Uint8Array(16)), prk = await hmac(salt, ikm);
        const cek = (await hmac(prk, cat(te.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16), nonce = (await hmac(prk, cat(te.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);
        const k = await S.importKey('raw', cek, 'AES-GCM', false, ['encrypt']), ct = new Uint8Array(await S.encrypt({ name: 'AES-GCM', iv: nonce }, k, cat(te.encode(text), new Uint8Array([2]))));
        const hd = new Uint8Array(21); hd.set(salt, 0); new DataView(hd.buffer).setUint32(16, 4096); hd[20] = 65;
        return cat(hd, as, ct);
    }
    async function request(sub, payload, o) {
        o = o || {}; const v = await vapid(), body = await encrypt(sub, JSON.stringify(payload));
        return { endpoint: sub.endpoint, body: b64u(body), headers: { 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: String(o.ttl || 86400), Urgency: o.urg ? 'high' : 'normal', Authorization: 'vapid t=' + (await jwt(sub.endpoint)) + ', k=' + v.pub } };
    }
    // ---------- Drive ----------
    const drive = () => J('xiii.drive', null);
    const isMaster = () => { const c = drive(); return !!(c && c.url && c.code); };
    async function api(a, p) { const c = drive(); if (!c || !c.url) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: (c.me && c.me.name) || c.master || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    let SUBS = null, subsAt = 0;
    async function subs(force) { if (!force && SUBS && SUBS.length && Date.now() - subsAt < 60000) return SUBS; const r = await api('push_subs'); if (r.ok) { SUBS = r.subs || []; subsAt = Date.now(); } return SUBS || []; }
    // envoyer : { title, body, url, tag, lvl:'urg'|'info', to: secteur | '@Nom' | '' }
    const F = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    async function send(m) {
        if (!isMaster() || J('xiii.push.off', false)) return { ok: false, err: 'off' };
        const all = await subs(); let L = all.filter(s => !m.to || (m.to[0] === '@' ? F(s.nom) === F(m.to.slice(1)) : !s.secteur || s.secteur === m.to)); if (m.to && m.to[0] !== '@' && !all.some(s => s.secteur === m.to)) L = all; // équipe inconnue des téléphones : tout le monde
        if (!L.length) return { ok: true, n: 0 };
        const payload = { title: m.title || 'SUITE XIII', body: m.body || '', url: m.url || 'equipe.html', tag: m.tag || '', lvl: m.lvl || 'info', at: Date.now(), p: (J('xiii.app.cfg', {}) || {}).p || '' };
        const msgs = []; for (const s of L) { try { msgs.push(await request(s.sub, payload, { urg: m.lvl === 'urg' })); } catch (e) { console.warn('XPUSH', e); } }
        const r = await api('push_send', { msgs }); if (r.ok && r.gone && r.gone.length) SUBS = (SUBS || []).filter(s => r.gone.indexOf(s.sub.endpoint) < 0);
        try { const lg = J('xiii.push.log', []); lg.unshift({ at: Date.now(), title: payload.title, body: payload.body, n: msgs.length, ok: r.ok ? r.sent : 0 }); W('xiii.push.log', lg.slice(0, 40)); } catch (e) { }
        return r.ok ? { ok: true, n: msgs.length, sent: r.sent } : r;
    }
    // ---------- lien / QR de l'application équipe ----------
    async function prep(ann) {
        const c = drive(), cfg = J('xiii.app.cfg', {}) || {}; let jk = cfg.jk || '';
        if (isMaster() && !cfg.ok) { const r = await api('app_cfg', { set: { on: true, droit: cfg.droit || 'read' } }); if (r.ok) { jk = r.cfg.jk; cfg.ok = 1; cfg.jk = jk; cfg.droit = r.cfg.droit; } }
        if (isMaster()) { const v = await vapid(); cfg.v = v.pub; }
        if (ann) { cfg.ann = ann; cfg.p = ann.p || cfg.p || ''; }
        if (c && c.url) cfg.url = c.url; W('xiii.app.cfg', cfg); return cfg;
    }
    function joinUrl(ann) {
        const cfg = J('xiii.app.cfg', {}) || {}, a = ann || cfg.ann, base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
        const o = { p: (a && a.p) || cfg.p || '' }; if (a && a.r) o.a = { r: a.r, k: a.k, b: a.b || '' }; if (cfg.url && cfg.jk) o.d = { u: cfg.url, j: cfg.jk }; if (cfg.v) o.v = cfg.v;
        return base + 'equipe.html#j=' + b64u(te.encode(JSON.stringify(o)));
    }
    // ---------- surveillance des outils : prévenir l'équipe des changements (Master, Drive relié) ----------
    const WATCH = { callsheetoXIII: ['📋 Feuille de service modifiée', 'callsheeto', 'jour.html'], plannoXIII: ['📅 Planning de production modifié', 'planno', 'planno-m.html'], transportoXIII: ['🚐 Transports modifiés', 'transporto', 'transporto-m.html'], conducoXIII: ['🎬 Conducteur modifié', 'conduco', 'jour.html'], scriptoXIII: null };
    function watch() {
        const sig = {}, tmr = {}, last = J('xiii.push.last', {});
        const dig = k => { const s = localStorage.getItem(k + '.project') || ''; let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
        Object.keys(WATCH).forEach(k => { if (WATCH[k]) sig[k] = dig(k); });
        setInterval(() => {
            if (!isMaster() || !(J('xiii.app.cfg', {}) || {}).auto) return;
            Object.keys(sig).forEach(k => { const d = dig(k); if (d === sig[k]) return; sig[k] = d; clearTimeout(tmr[k]);
                tmr[k] = setTimeout(() => { if (Date.now() - (last[k] || 0) < 10 * 60000) return; last[k] = Date.now(); W('xiii.push.last', last); const w = WATCH[k]; send({ title: w[0], body: 'Mis à jour à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' — touchez pour voir', url: w[2], tag: w[1] }); }, 90000); });
        }, 5000);
    }
    let started = false;
    function init() { if (started) return; started = true; if (isMaster()) { vapid().then(v => { const c = J('xiii.app.cfg', {}) || {}; if (c.vs === v.pub) return; api('app_cfg', { set: { v: v.pub } }).then(r => { if (r && r.ok) { const c2 = J('xiii.app.cfg', {}) || {}; c2.vs = v.pub; W('xiii.app.cfg', c2); } }); }).catch(() => { }); setTimeout(() => { if ((J('xiii.app.cfg', {}) || {}).ok) return; prep().catch(() => { }); }, 3000); } watch(); }
    return { init, send, subs, prep, joinUrl, vapid, encrypt, request, isMaster, b64u, ub64, api };
})();

XPUSH.init();

// =====================================================================
//  SUITE XIII — XOFF : 📶 mode hors ligne garanti
//  Sur chaque page : vérifie que la page et toutes ses bibliothèques (PDF, 3D, cartes, QR, Excel…) sont en cache
//  pour fonctionner sans réseau sur le tournage ; pastille claire de l'état ; « Tout préparer » en un clic.
//  Sans réseau : bandeau qui dit ce qui marche et ce qui ne marche pas (météo, fonds de carte non visités,
//  géocodage, Drive, IA…). Le contrôle détaillé de toute la suite est dans 📲 Installer / hors ligne.
// =====================================================================
const XOFF = (() => {
    const LIBN = [[/jspdf|pdf-lib|pdfmake/i, 'PDF (export)'], [/pdf\.js|pdfjs|pdf\.min|pdf\.worker/i, 'lecture de PDF'], [/three/i, '3D'], [/leaflet/i, 'cartes'], [/qrcode|qr/i, 'QR codes'], [/xlsx|sheetjs/i, 'Excel'], [/lz-string/i, 'liens de partage'], [/jszip/i, 'ZIP / Word'], [/html2canvas/i, 'captures'], [/chart/i, 'graphiques'], [/fonts\.g/i, 'polices']];
    const NET = { repero: ['météo et climat', 'analyse des alentours (OpenStreetMap)', 'fonds de carte non visités', 'recherche d\'adresse'], callsheeto: ['météo', 'recherche d\'adresse et hôpital', 'fonds de carte non visités'], jour: ['météo'], dossier: ['IA (génération de textes)'], syno: ['IA'], runo: ['diffusion en direct'], drive: ['Drive du projet'], transporto: ['itinéraires'] };
    const libName = u => (LIBN.find(x => x[0].test(u)) || [, u.split('/').slice(-1)[0].split('?')[0]])[1];
    const ask = m => new Promise(res => { const sw = navigator.serviceWorker && navigator.serviceWorker.controller; if (!sw) return res(null); const ch = new MessageChannel(); const t = setTimeout(() => res(null), 4000); ch.port1.onmessage = e => { clearTimeout(t); res(e.data); }; sw.postMessage(m, [ch.port2]); });
    let APP = '', ST = null;
    function needs() { const U = new Set(); document.querySelectorAll('script[src],link[rel=stylesheet][href]').forEach(e => { const u = e.src || e.href; if (/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com)/.test(u)) U.add(u); }); return [...U]; }
    async function check() {
        const can = 'serviceWorker' in navigator && navigator.serviceWorker.controller, mode = (() => { try { return localStorage.getItem('xiii.pwa.mode') || 'offline'; } catch (e) { return 'offline'; } })();
        if (!can) return ST = { ok: false, why: /^https?:$/.test(location.protocol) ? 'cache hors ligne pas encore actif (rechargez la page une fois)' : 'ouvrez la suite depuis son adresse web pour activer le hors ligne', miss: [] };
        if (mode === 'online') return ST = { ok: false, why: 'mode « toujours en ligne » choisi : rien n\'est gardé pour le hors ligne', miss: [] };
        const urls = needs(), page = location.href.split('#')[0].split('?')[0], r = await ask({ t: 'has', urls: urls.concat([page]) });
        if (!r || !r.has) return ST = { ok: false, why: 'état du cache inconnu', miss: [] };
        const miss = urls.filter(u => !r.has[u]); return ST = { ok: !miss.length && r.has[page], page: r.has[page], miss: [...new Set(miss.map(libName))] };
    }
    function chip() {
        let c = document.getElementById('xoff'); const on = navigator.onLine;
        if (on && (!ST || ST.ok || !ST.miss.length)) { if (c) c.remove(); const b = document.getElementById('xoff-b'); if (b) b.remove(); return; }
        if (!c) { c = document.createElement('div'); c.id = 'xoff'; document.body.appendChild(c); }
        if (!on) c.innerHTML = '📴 <b>Hors ligne</b>' + (ST && ST.ok ? ' — l\'outil fonctionne' : ST && ST.miss.length ? ' — <span class="w">indisponible : ' + ST.miss.join(', ') + '</span>' : '') + (NET[APP] ? '<br><small>Sans réseau : ' + NET[APP].join(', ') + '. Le reste fonctionne, vos données restent dans l\'appareil.</small>' : '<br><small>Vos données restent dans l\'appareil ; la synchronisation reprendra au retour du réseau.</small>') + '<button data-x>✕</button>';
        else c.innerHTML = '📶 <b>Pas encore prêt hors ligne</b> — ' + (ST.miss.length ? ST.miss.length + ' bibliothèque(s) à mettre en cache : ' + ST.miss.join(', ') : (ST.why || 'page à mettre en cache')) + ' <button data-p>⬇️ Tout préparer pour le tournage</button><button data-x>Plus tard</button>';
        const p = c.querySelector('[data-p]'); if (p) p.onclick = prepare; c.querySelector('[data-x]').onclick = () => { c.remove(); try { sessionStorage.setItem('xoff.later', '1'); } catch (e) { } };
        try { if (on && sessionStorage.getItem('xoff.later')) c.remove(); } catch (e) { }
    }
    async function prepare() {
        const c = document.getElementById('xoff'); if (c) c.innerHTML = '⏳ Mise en cache de toutes les pages et bibliothèques de la suite…';
        // les bibliothèques de cette page (même celles chargées à la demande) puis tout le reste via le service worker
        await Promise.all(needs().map(u => fetch(u, { mode: 'no-cors' }).catch(() => null)));
        const r = await ask({ t: 'warm' }); await check(); chip();
        try { if (typeof toast === 'function') toast(ST.ok ? '✅ Prêt pour le hors ligne : toute la suite est en cache' + (r ? ' (' + r.ok + ' bibliothèques)' : '') : '⚠️ Certaines bibliothèques n\'ont pas pu être téléchargées : ' + ST.miss.join(', ')); } catch (e) { }
    }
    function init(app) {
        APP = app;
        const s = document.createElement('style'); s.textContent = '#xoff{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:10050;max-width:min(720px,calc(100vw - 24px));padding:7px 12px;border-radius:12px;background:var(--bg-menu,#2a2622);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);box-shadow:0 8px 24px rgba(0,0,0,.4);font:12.5px/1.4 "Segoe UI",system-ui,sans-serif}#xoff small{color:var(--text-dim,#aaa)}#xoff .w{color:#ffb74d}#xoff button{margin-left:6px;font:inherit;font-size:12px;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:7px;padding:2px 8px;cursor:pointer}#xoff button[data-p]{background:rgba(240,179,120,.28);border-color:rgba(240,179,120,.75)}';
        document.head.appendChild(s);
        const run = async () => { await check(); chip(); };
        addEventListener('online', run); addEventListener('offline', run);
        if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('controllerchange', () => setTimeout(run, 1500));
        XBOOT.idle(run, 4000);
    }
    return { init, check, prepare, state: () => ST };
})();

XOFF.init(XIII_APP);

// SUITE XIII — XMODELS : exemples types par type de projet pour chaque outil (généré par models/build.sh)
(function () {
if (window.XMODELS) return;
// ---------------------------------------------------------------------
//  XMODELS — profils d'exemple par type de projet (données communes à tous les outils)
//  seqs : [num, ie, décor, effet, résumé, personnages[], plans[[valeur, angle, mvt, focale, description, durée s, son]], jour]
//  sched (feuille de service) : [jour, heure, événement?, séquence, lieu, description, rôles]
// ---------------------------------------------------------------------
const XMP = {};
XMP.live = {
    icon: '🎤', label: 'Concert / captation live', title: 'Les Nuits Électriques — Lina Vega en concert', short: 'Nuits Électriques',
    client: 'France Télévisions — France 4', prod: 'Productions XIII', domain: 'prodxiii.fr', nDays: 3, dayTitles: ['Montage & installation', 'Balances, filage & direct', 'Démontage'],
    times: [['07:00', '08:00', '12:30', '22:00'], ['09:00', '10:00', '13:00', '23:59'], ['00:30', '01:00', '', '06:00']],
    venue: { name: 'Halle Tony Garnier', address: '20 Place des Docteurs Charles et Christophe Mérieux, 69007 Lyon', lat: 45.7316, lon: 4.8203, access: 'Accès technique quai C, rue Jean Bouin. Hauteur max 4 m, hayon obligatoire. Badge prestataire à retirer à la loge du gardien.', contact: 'Régie générale de la salle', phone: '04 72 76 85 85' },
    base: { name: 'Car régie HD12 & base technique', address: 'Parking technique quai C, 69007 Lyon', lat: 45.7309, lon: 4.8190, access: 'Car régie stationné côté Rhône, alimentation 125 A tétra fournie par la salle.' },
    park: { name: 'Parking équipe', address: 'Parking Tony Garnier P2, Rue Jean Bouin, 69007 Lyon', lat: 45.7299, lon: 4.8213, access: 'Places réservées sur présentation du badge.' },
    cantine: { name: 'Catering artistes & équipe', address: 'Salle annexe niveau -1, Halle Tony Garnier', lat: 45.7318, lon: 4.8207, access: 'Service 12:30-14:00 et 18:30-19:45.' },
    loges: { name: 'Loges artistes', address: 'Couloir des loges, côté jardin, Halle Tony Garnier', lat: 45.7317, lon: 4.8201, access: 'Accès réservé, badge ALL ACCESS.' },
    hosp: { name: 'Hôpital Édouard Herriot (urgences)', address: '5 Place d’Arsonval, 69003 Lyon', phone: '08 25 08 25 69', lat: 45.7425, lon: 4.8822 },
    risks: ['hauteur', 'elec', 'levage', 'fumee', 'nuit'],
    crew: [['prod', 'Productrice déléguée', 'Camille Martin'], ['prod', 'Directeur de production', 'Tom Lefèvre'], ['prod', 'Chargée de production', 'Manon Girard'], ['real', 'Réalisatrice', 'Sarah Leroy'], ['real', 'Scripte', 'Claire Dumas'], ['real', 'Assistante réalisation', 'Julie Bonnet'],
        ['image', 'Directeur photo', 'Thomas Moreau'], ['image', 'Ingénieur de la vision', 'Yanis Morel'], ['image', 'Cadreur grue', 'Julien Marchal'], ['image', 'Cadreuse', 'Sarah Kessler'], ['image', 'Cadreur', 'Hugo Renard'], ['image', 'Cadreuse', 'Inès Benali'], ['image', 'Opérateur Steadicam', 'Tom Laurent'], ['image', 'Cadreuse épaule', 'Nora Diallo'], ['machino', 'Machiniste grue', 'Bruno Caron'],
        ['post', 'Opérateur ralentis (EVS)', 'Medhi Saïdi'], ['post', 'Truquiste / habillage', 'Alice Perrin'], ['son', 'Chef opérateur son (mix TV)', 'Sami Roux'], ['son', 'Ingénieur son façade', 'Louis Garnier'], ['son', 'Ingénieure retours', 'Inès Faure'], ['son', 'Technicien HF', 'Victor Lambert'],
        ['elec', 'Éclairagiste', 'Paul Girard'], ['elec', 'Pupitreur lumière', 'Lucas Blanc'], ['elec', 'Électricien', 'Karim Benali'], ['regie', 'Régisseur général', 'Chloé Garnier'], ['regie', 'Régisseur plateau', 'Antoine Meyer'], ['hmc', 'Maquilleuse', 'Emma Rousseau'], ['secu', 'Chargé de sécurité (SSIAP 2)', 'Marc Vidal'], ['transport', 'Chauffeur poids lourd', 'Didier Fontaine']],
    cast: [['Lina Vega', 'Chant lead', 'musicien', 'confirme', 1200, 'forfait', 'f'], ['Marco Ruiz', 'Guitare, chœurs', 'musicien', 'confirme', 450, 'forfait', 'm'], ['Jade Moreau', 'Basse', 'musicien', 'confirme', 450, 'forfait', 'f'], ['Samir Haddad', 'Batterie', 'musicien', 'confirme', 450, 'forfait', 'm'], ['Éloïse Tran', 'Claviers, chœurs', 'musicien', 'confirme', 450, 'forfait', 'f'], ['Paul Lefèvre', 'Animateur', 'animateur', 'confirme', 900, 'forfait', 'm']],
    seqs: [['1', 'INT', 'Grande salle — scène', 'Nuit', 'Générique : la salle au noir, les faisceaux balaient le public, le groupe entre.', ['Lina Vega', 'Paul Lefèvre'], [['PG', 'plongee', 'grue', '14 mm', 'Salle debout, faisceaux qui balaient', 10, 'Ambiance salle'], ['PA', 'face', 'steadicam', '24 mm', 'Paul entre côté cour, suivi jusqu’au centre', 20, 'HF 5'], ['PL', 'face', 'grue', '18 mm', 'Scène entière, groupe en place', 8, '']], 1],
        ['2', 'INT', 'Grande salle — scène', 'Nuit', 'Néon : premier titre, strobes sur les refrains, confettis au dernier refrain.', ['Lina Vega', 'Marco Ruiz', 'Jade Moreau', 'Samir Haddad', 'Éloïse Tran'], [['PL', 'dos', '', '35 mm', 'Contre : silhouette de Lina sur l’écran LED', 12, 'Multipiste'], ['INS', 'face', '', 'Grand angle', 'Mini-cam : attaque caisse claire', 4, ''], ['PR', 'face', '', '86x', 'Lina, première phrase', 20, 'HF 1'], ['PA', '3q', 'pano', '22x', 'Marco, riff de guitare', 8, ''], ['PM', 'face', 'steadicam', '13x', 'Orbite autour de Lina au refrain', 28, '']], 1],
        ['3', 'INT', 'Grande salle — coin salon', 'Nuit', 'Interview de Lina par Paul, assis côté jardin.', ['Lina Vega', 'Paul Lefèvre'], [['2S', '3q', '', '22x', 'Paul et Lina sur les tabourets', 15, 'HF 1 + HF 5'], ['PR', 'face', '', '86x', 'Lina répond', 60, ''], ['PR', 'face', '', '22x', 'Contrechamp Paul', 30, '']], 1],
        ['4', 'INT', 'Grande salle — scène', 'Nuit', 'Horizon, piano-voix : douche ambre, salle aux briquets.', ['Lina Vega', 'Éloïse Tran'], [['PL', 'dos', '', '20x', 'Contre : le piano dans la douche', 20, 'Piano 2 micros'], ['GP', 'face', '', '86x', 'Lina, yeux fermés', 40, 'HF 1'], ['PG', 'plongee', 'grue', '14 mm', 'Salle, briquets et téléphones', 30, 'Ambiance']], 1],
        ['5', 'INT', 'Grande salle — scène', 'Nuit', 'Rappel Électrique : plein feu, CO2 au final, salut du groupe.', ['Lina Vega', 'Marco Ruiz', 'Jade Moreau', 'Samir Haddad', 'Éloïse Tran'], [['PG', 'face', 'grue', '14 mm', 'Retour du groupe, salle debout', 12, ''], ['PM', 'face', 'steadicam', '13x', 'Lina court sur l’avancée', 30, ''], ['PL', 'dos', '', '20x', 'Contre, confettis et CO2', 15, '']], 1]],
    sched: [[0, '07:00', 1, '', 'base', 'Arrivée du car régie et des camions, déchargement quai C', ''], [0, '08:00', 1, '', 'decor', 'Montage : truss, lumière, ponts son, ledwall', ''], [0, '10:00', 1, '', 'decor', 'Câblage vidéo : fibres SMPTE, tirage SDI, intercom', ''], [0, '12:30', 1, '', 'cantine', 'REPAS', ''], [0, '14:00', 1, '', 'decor', 'Implantation des caméras, grue, praticables', ''], [0, '17:00', 1, '', 'decor', 'Réglages vision & focus lumière (pupitre)', ''], [0, '20:00', 1, '', 'decor', 'Tests liaisons satellite et streaming', ''],
        [1, '10:00', 1, '', 'decor', 'Line check son & retours', ''], [1, '14:00', 0, 'B', 'decor', 'Balances du groupe', 'Groupe complet'], [1, '16:00', 0, 'F', 'decor', 'Filage caméras sur le conducteur complet', 'Groupe, Paul Lefèvre'], [1, '18:30', 1, '', 'cantine', 'REPAS', ''], [1, '19:30', 1, '', 'decor', 'Ouverture des portes au public', ''], [1, '20:45', 0, '1', 'decor', 'Mise en place antenne, chauffe public par Paul', 'Paul Lefèvre'], [1, '21:00', 0, '2-5', 'decor', 'DIRECT — Les Nuits Électriques', 'Groupe complet, Paul Lefèvre'], [1, '22:30', 1, '', 'decor', 'Fin d’antenne, démontage caméras', ''],
        [2, '00:30', 1, '', 'decor', 'Démontage plateau, lumière et son', ''], [2, '04:00', 1, '', 'base', 'Chargement des camions', ''], [2, '06:00', 1, '', 'base', 'Départ du car régie', '']],
    cams: [['Grue face', 'Sony HDC-3500', 'Fujinon UA14x4.5', 'Salle, derrière la régie façade', 'Julien Marchal'], ['Face serré', 'Sony HDC-3500', 'Canon UJ86x9.3', 'Praticable face, 25 m', 'Sarah Kessler'], ['Jardin', 'Sony HDC-3500', 'Fujinon UA22x8', 'Avant-scène jardin', 'Hugo Renard'], ['Cour', 'Sony HDC-3500', 'Fujinon UA22x8', 'Avant-scène cour', 'Inès Benali'], ['Steadicam', 'Sony HDC-P50', 'Fujinon HA13x4.5', 'Scène et avancée', 'Tom Laurent'], ['Mini-cam batterie', 'Marshall CV380', 'Grand angle 3,6 mm', 'Pied de grosse caisse', ''], ['Public / épaule', 'Sony PXW-Z750', 'Canon 17x', 'Fosse', 'Nora Diallo'], ['PTZ contre', 'Panasonic AW-UE160', 'Zoom 20x', 'Fond de scène, perche 3', 'Pupitre PTZ']],
    lights: [['Robe MegaPointe', 12, 'Pont', 'Faisceaux, gobos', '', 39], ['Robe Spiider', 10, 'Contre', 'Wash contre', '', 30], ['Martin MAC Aura XB', 8, 'Pont', 'Wash face scène', '', 14], ['Découpe ETC Source Four 750 W', 6, 'Face', 'Face musiciens', '1/2 CTO', 1], ['Ayrton Diablo (poursuite auto)', 2, 'Face', 'Poursuite Lina', '', 32], ['Astera AX1 Pixel Tube', 16, 'Fond / cyclo', 'Décor vertical', '', 16], ['Stroboscope GLP JDC1', 8, 'Pont', 'Strobes refrains', '', 21], ['PAR LED RGBW 7×10 W', 12, 'Public', 'Éclairage public (caméras)', '', 8], ['Machine à brouillard (hazer)', 2, 'Effets', 'Hazer MDG', '', 2], ['Canon CO2 (jet)', 4, 'Effets', 'Final rappel', '', 1]],
    audio: [['Grosse caisse', 'Shure Beta 91A', 'Au sol'], ['Grosse caisse ext.', 'Shure Beta 52A', 'Petit pied perche'], ['Caisse claire', 'Shure SM57', 'Pince / clip'], ['Charleston', 'Neumann KM 184', 'Petit pied perche'], ['Tom 1', 'Sennheiser e604', 'Pince / clip'], ['Tom basse', 'Sennheiser e604', 'Pince / clip'], ['OH G', 'AKG C414', 'Grand pied perche'], ['OH D', 'AKG C414', 'Grand pied perche'], ['Basse DI', 'Radial J48'], ['Guitare', 'Sennheiser e906', 'Au sol'], ['Clavier G', 'Boîte de direct passive'], ['Clavier D', 'Boîte de direct passive'], ['Piano grave', 'Neumann KM 184', 'Petit pied perche'], ['Piano aigu', 'Neumann KM 184', 'Petit pied perche'], ['Voix Lina', 'Liaison HF'], ['Chœur Marco', 'Shure SM58', 'Grand pied perche'], ['Chœur Éloïse', 'Shure SM58', 'Grand pied perche'], ['Paul (animateur)', 'Liaison HF', 'Sur la personne'], ['Playback cordes G', 'Lecteur / playback'], ['Playback cordes D', 'Lecteur / playback'], ['Ambiance salle G', 'Neumann U 87', 'Grand pied perche'], ['Ambiance salle D', 'Neumann U 87', 'Grand pied perche'], ['Ordre', 'Shure SM58', 'Table / pupitre']],
    hf: [['Voix Lina', 'main', 'Shure Axient AD2'], ['Voix Lina (spare)', 'main', 'Shure Axient AD2'], ['Paul', 'bodypack', 'Shure Axient AD1'], ['Ear Lina', 'iem', 'Shure PSM 1000'], ['Ear Marco', 'iem', 'Shure PSM 1000'], ['Ear Éloïse', 'iem', 'Shure PSM 1000'], ['Ear Samir', 'iem', 'Shure PSM 1000'], ['Ear Jade', 'iem', 'Shure PSM 1000'], ['Steadicam', 'camlink', 'Sennheiser EK 6042 (caméra)'], ['Intercom plateau', 'inter', 'Autre']],
    mixes: [['Ear Lina', 'iem', 'Lina Vega'], ['Ear Marco', 'iem', 'Marco Ruiz'], ['Ear Jade', 'iem', 'Jade Moreau'], ['Side fill batterie', 'wedge', 'Samir Haddad'], ['Ear Éloïse', 'iem', 'Éloïse Tran'], ['Wedge animateur', 'wedge', 'Paul Lefèvre']],
    runo: [['Écran d’attente — Les Nuits Électriques', 15, 'Attente', 'Compte à rebours + playlist du groupe'], ['Pré-show : backstage avec Lina', 10, 'Backstage', 'Caméra épaule en loge, questions du chat'], ['Concert — partie 1', 35, 'Programme', 'Flux du car régie (PGM) en 1080p50'], ['Entracte : coulisses & quiz', 10, 'Coulisses', 'Quiz sur le groupe, sondage du chat'], ['Concert — partie 2 acoustique', 30, 'Programme', ''], ['Rappel', 10, 'Programme', ''], ['After : réactions du public', 10, 'Plateau', 'Interviews en sortie de salle, remerciements, annonce tournée']],
    planno: [['prepa', 'Fiche technique & synoptique (SYNO)', -42, 10, 0, 'Directeur de production'], ['prepa', 'Validation du devis diffuseur', -35, 1, 1, 'Productrice'], ['reperage', 'Visite technique de la salle', -28, 1, 0, 'Régisseur'], ['prepa', 'Plan d’implantation (PLANO) & conducteur', -21, 7, 0, 'Réalisatrice'], ['prepa', 'Habillage graphique (GRAPHICO)', -18, 10, 0, 'Truquiste'], ['casting', 'Contrats artistes & droits musicaux', -21, 14, 0, 'Chargée de production'], ['prepa', 'Préparation matériel (PACKINGO)', -4, 3, 0, 'Régisseur'], ['prepa', 'Dépôt dossier SACEM', -7, 1, 1, 'Chargée de production'], ['tournage', 'Montage & installation', 0, 1, 0, ''], ['tournage', 'Balances, filage & DIRECT', 1, 1, 0, ''], ['tournage', 'Démontage', 2, 1, 0, ''], ['post', 'Montage best-of 52’', 3, 8, 0, 'Monteur'], ['post', 'Mixage 5.1 & stéréo', 8, 4, 0, 'Chef opérateur son'], ['post', 'Étalonnage', 11, 2, 0, 'Étalonneur'], ['livraison', 'PAD France 4', 15, 1, 1, ''], ['livraison', 'Mise en ligne replay & extraits réseaux', 16, 2, 0, '']],
    post: { steps: [['Sauvegarde des ISO & PGM (BACKUPO)', 'DIT', 0, 1], ['Synchro multicam & dérushage', 'Monteur', 1, 3], ['Montage best-of 52’', 'Monteur', 3, 8], ['Mixage 5.1 & stéréo', 'Chef opérateur son', 8, 12], ['Étalonnage', 'Étalonneur', 11, 13], ['Sous-titres SME', 'Sous-titreur', 12, 14], ['Exports & PAD', 'Monteur', 14, 15]], deliv: ['tv', 'web', 's916', 'master'], versions: [['V1', 'notes', 'Best-of 52’ — premier montage', [['00:02:10:00', 'Rallonger l’entrée de Paul, on rate le premier sourire', 'montage', 'Sarah Leroy'], ['00:14:32:12', 'Clap de fin trop fort sur le public', 'son', 'Sami Roux'], ['00:21:05:00', 'Plan grue sous-exposé, à rattraper', 'etalo', 'Thomas Moreau']]], ['V2', 'sent', 'Corrections réal + diffuseur', []]] },
    vehicles: [['Porteur 20 m³ hayon', 'truck', 3, 'Didier Fontaine'], ['Car régie HD12', 'truck', 2, 'Yanis Morel'], ['Minibus équipe', 'minibus', 9, 'Antoine Meyer'], ['Navette artistes', 'van', 7, 'Chloé Garnier']],
    hotel: { name: 'Hôtel Mercure Lyon Gerland', addr: '70 Avenue Leclerc, 69007 Lyon', phone: '04 72 71 30 00', price: '109' },
    travel: { from: 'Paris Gare de Lyon', to: 'Lyon Part-Dieu', mode: 'train', who: ['Lina Vega', 'Marco Ruiz', 'Jade Moreau', 'Samir Haddad', 'Éloïse Tran', 'Paul Lefèvre', 'Sarah Leroy', 'Camille Martin'] },
    eq: [['Sony HDC-3500', 4], ['Sony FX9', 1], ['Caméra PTZ', 1], ['Fujinon UA107x8.4', 1], ['Canon CN 17-120 (CN7x17)', 2], ['Trépied Sachtler S20 (S1)', 3], ['DJI Ronin 2', 1], ['Grue Jimmy Jib', 1], ['Teradek Bolt 4K LT 750 (émetteur + récepteur)', 1], ['Blackmagic ATEM Constellation 4K', 1], ['Blackmagic HyperDeck Studio Mini', 6], ['TVLogic LQM-241W 24"', 4], ['Clear-Com DX-410 (kit 4 postes)', 2], ['Shure Axient AD2', 2], ['Console Yamaha QL5', 1], ['Robe MegaPointe', 12], ['Martin MAC Aura XB', 8], ['Astera Titan Tube (kit de 8)', 2], ['Machine à brouillard', 2], ['Câble SDI 10 m', 20], ['Groupe électrogène 100 kVA', 1], ['Porteur 20 m³', 1]],
    fees: [['Car régie HD 12 caméras (forfait jour)', 2, 'jour', 4500, 3800, 6500], ['Liaison satellite / fibre diffuseur', 1, 'forfait', 2200, 1500, 3200], ['Droits musicaux (SACEM, forfait captation)', 1, 'forfait', 1800, 1200, 2600], ['Catering équipe (repas)', 70, 'repas', 21.4, 15, 28], ['Régie (consommables, gaffer, piles)', 1, 'forfait', 450, 300, 700]],
    syno: 'live', plano: 'live',
    mood: { intention: 'Faire ressentir l’énergie de la salle à la maison : caméras au cœur du public, contre-jours, sueur et confettis.', palette: ['#0B0B1A', '#FF2E88', '#3D5AFE', '#FFB300', '#F5F5F5'], focales: 'Longues focales serrées sur Lina (86x), grand-angle steadicam sur l’avancée, mini-cams embarquées.', look: 'Noirs denses, couleurs saturées, flares assumés sur les contres, cadence 50p pour les ralentis.', refs: 'Coldplay Live in Buenos Aires, Billie Eilish Live at the O2, Christine and the Queens (Arte Concert)', lieu: 'Halle de 6 000 places, scène 16 × 12 m, avancée de 8 m au centre du public.' },
    spots: [['Halle Tony Garnier', '20 Place des Docteurs Charles et Christophe Mérieux', 'Lyon', '69007', 45.7316, 4.8203, 'decor', 'valide', 'Scène 16 × 12 m, accroches 1 t par point, 125 A tétra en régie, quai de déchargement couvert.', 5], ['Le Transbordeur', '3 Boulevard de Stalingrad', 'Villeurbanne', '69100', 45.7782, 4.8597, 'decor', 'option', 'Option de repli (1 800 places).', 3], ['Parvis — duplex', 'Place Antonin Perrin', 'Lyon', '69007', 45.7305, 4.8222, 'decor', 'avoir', 'Car régie 2 pour le duplex, autorisation mairie à demander.', 4]],
    packs: ['p-tech', 'p-art', 'p-img']
};

XMP.tv = {
    icon: '📺', label: 'Émission TV / talk-show', title: 'Le Grand Débrief — saison 2', short: 'Grand Débrief',
    client: 'TMC', prod: 'Productions XIII', domain: 'prodxiii.fr', nDays: 2, dayTitles: ['Installation & répétitions', 'Enregistrement — 2 numéros'],
    times: [['08:00', '09:00', '12:30', '19:00'], ['09:00', '10:30', '13:00', '22:30']],
    venue: { name: 'Studios de la Plaine — Plateau 4', address: '12 Rue du Landy, 93200 Saint-Denis', lat: 48.9183, lon: 2.3555, access: 'Accès poids lourds par la cour arrière. Badges nominatifs à l’accueil.', contact: 'Régie studio', phone: '01 49 46 00 00' },
    base: { name: 'Régie finale — Studio 4', address: '12 Rue du Landy, 93200 Saint-Denis', lat: 48.9184, lon: 2.3557, access: '1er étage, ascenseur de charge.' },
    park: { name: 'Parking studio', address: 'Rue Ampère, 93200 Saint-Denis', lat: 48.9190, lon: 2.3560, access: '30 places réservées.' },
    cantine: { name: 'Restaurant d’entreprise', address: 'Rez-de-chaussée, bâtiment B', lat: 48.9182, lon: 2.3550, access: 'Tickets à retirer à la production.' },
    loges: { name: 'Loges & maquillage', address: '2e étage, couloir des loges', lat: 48.9183, lon: 2.3556, access: '' },
    hosp: { name: 'Hôpital Delafontaine (urgences)', address: '2 Rue du Dr Delafontaine, 93200 Saint-Denis', phone: '01 42 35 61 40', lat: 48.9390, lon: 2.3600 },
    risks: ['hauteur', 'elec', 'fumee'],
    crew: [['prod', 'Producteur artistique', 'Nicolas Arnaud'], ['prod', 'Directrice de production', 'Camille Martin'], ['prod', 'Chargé de production', 'Hugo Bernard'], ['real', 'Réalisateur', 'Olivier Mercier'], ['real', 'Scripte', 'Claire Dumas'], ['real', 'Rédactrice en chef', 'Aurélie Fabre'], ['real', 'Chargée des invités', 'Léa Petit'],
        ['image', 'Directeur photo', 'Thomas Moreau'], ['image', 'Ingénieur de la vision', 'Yanis Morel'], ['image', 'Cadreur grue', 'Julien Marchal'], ['image', 'Cadreuse', 'Sarah Kessler'], ['image', 'Cadreur', 'Hugo Renard'], ['image', 'Cadreuse', 'Inès Benali'], ['image', 'Cadreur épaule', 'Tom Laurent'],
        ['post', 'Truquiste / synthés', 'Alice Perrin'], ['post', 'Opérateur prompteur', 'Kevin Roche'], ['son', 'Chef opérateur son', 'Sami Roux'], ['son', 'Assistant son / HF', 'Victor Lambert'], ['elec', 'Chef électricien', 'Paul Girard'], ['elec', 'Pupitreur lumière', 'Lucas Blanc'], ['deco', 'Chef décorateur', 'Bastien Leroux'], ['regie', 'Régisseuse plateau', 'Chloé Garnier'], ['regie', 'Chauffeur de salle', 'Max Durand'], ['hmc', 'Maquilleuse', 'Emma Rousseau'], ['hmc', 'Coiffeuse', 'Zoé Martin'], ['cost', 'Habilleuse', 'Agathe Simon']],
    cast: [['Julia Moreno', 'Présentatrice', 'animateur', 'confirme', 1500, 'jour', 'f'], ['Karim Belkacem', 'Chroniqueur', 'animateur', 'confirme', 600, 'jour', 'm'], ['Sophie Lambert', 'Chroniqueuse', 'animateur', 'confirme', 600, 'jour', 'f'], ['Pr. Hélène Varga', 'Invitée — astrophysicienne', 'invite', 'confirme', 0, 'forfait', 'f'], ['Romain Delcourt', 'Invité — humoriste', 'invite', 'option', 0, 'forfait', 'm'], ['Les Fréquences', 'Live musical', 'musicien', 'confirme', 1200, 'forfait', 'm'], ['Public (120 pers.)', 'Public', 'figurant', 'confirme', 0, 'forfait', 'm']],
    seqs: [['1', 'INT', 'Plateau 4 — desk', 'Jour', 'Lancement : Julia présente les invités, chroniqueurs en place.', ['Julia Moreno', 'Karim Belkacem', 'Sophie Lambert'], [['PG', 'face', 'grue', '14 mm', 'Grue : arrivée sur le desk, public en amorce', 12, 'Ambiance public'], ['PR', 'face', '', '22x', 'Julia face caméra, lancement', 25, 'HF 1'], ['2S', '3q', '', '22x', 'Chroniqueurs', 10, '']], 1],
        ['2', 'INT', 'Plateau 4 — desk', 'Jour', 'Interview de l’astrophysicienne Hélène Varga.', ['Julia Moreno', 'Pr. Hélène Varga'], [['2S', '3q', '', '22x', 'Julia et Hélène en amorce', 20, ''], ['PR', 'face', '', '86x', 'Hélène répond', 90, 'HF 4'], ['PR', 'face', '', '22x', 'Contrechamp Julia', 40, '']], 1],
        ['3', 'INT', 'Plateau 4 — desk', 'Jour', 'Chronique de Karim : la semaine en 5 images (incrustations plein écran).', ['Karim Belkacem'], [['PR', 'face', '', '22x', 'Karim face caméra prompteur', 60, 'HF 2'], ['PM', 'face', 'zoom_out', '22x', 'Élargissement sur l’écran LED', 8, '']], 1],
        ['4', 'INT', 'Plateau 4 — scène musicale', 'Jour', 'Live des Fréquences.', ['Les Fréquences'], [['PL', 'face', 'grue', '14 mm', 'Grue sur le groupe', 15, 'Multipiste'], ['PR', '3q', '', '86x', 'Chanteur', 30, ''], ['PM', 'face', 'epaule', '17x', 'Épaule dans le public', 20, '']], 1],
        ['5', 'INT', 'Plateau 4 — desk', 'Jour', 'Débat final et générique.', ['Julia Moreno', 'Karim Belkacem', 'Sophie Lambert', 'Romain Delcourt'], [['PG', 'face', 'grue', '14 mm', 'Plateau général, générique', 30, '']], 1]],
    sched: [[0, '08:00', 1, '', 'decor', 'Montage décor et câblage plateau', ''], [0, '12:30', 1, '', 'cantine', 'REPAS', ''], [0, '14:00', 1, '', 'decor', 'Réglages lumière et vision', ''], [0, '16:30', 0, 'R', 'decor', 'Répétition à blanc avec doublures', 'Doublures'], [1, '09:00', 1, '', 'loges', 'Maquillage présentatrice et chroniqueurs', 'Julia, Karim, Sophie'], [1, '10:30', 0, 'R', 'decor', 'Répétition générale', 'Toute l’équipe artistique'], [1, '13:00', 1, '', 'cantine', 'REPAS', ''], [1, '14:30', 1, '', 'decor', 'Entrée du public, chauffe de salle', 'Public'], [1, '15:00', 0, '1-5', 'decor', 'ENREGISTREMENT — numéro 1', 'Tous'], [1, '18:30', 1, '', 'decor', 'Changement de plateau, invités numéro 2', ''], [1, '19:30', 0, '1-5', 'decor', 'ENREGISTREMENT — numéro 2', 'Tous']],
    cams: [['Grue', 'Sony HDC-3500', 'Fujinon UA14x4.5', 'Fond de plateau cour', 'Julien Marchal'], ['Présentatrice', 'Sony HDC-3500', 'Fujinon UA22x8', 'Face desk', 'Sarah Kessler'], ['Invités', 'Sony HDC-3500', 'Fujinon UA22x8', 'Jardin', 'Hugo Renard'], ['Contrechamp', 'Sony HDC-3500', 'Fujinon UA22x8', 'Cour', 'Inès Benali'], ['Épaule public', 'Sony HDC-P50', 'Fujinon HA18x7.6', 'Gradins', 'Tom Laurent'], ['PTZ zénithale', 'Panasonic AW-UE160', 'Zoom 20x', 'Grill au-dessus du desk', 'Pupitre PTZ']],
    lights: [['ARRI SkyPanel S60-C', 6, 'Face', 'Face desk diffusée', '', 8], ['Fresnel 2 kW', 4, 'Contre', 'Contres invités', '', 1], ['ARRI Orbiter', 2, 'Face', 'Face présentatrice', '', 8], ['Martin MAC Aura XB', 10, 'Pont', 'Ambiance décor', '', 14], ['Astera AX1 Pixel Tube', 12, 'Fond / cyclo', 'Lignes de décor', '', 16], ['PAR LED RGBW 7×10 W', 16, 'Public', 'Public', '', 8], ['Machine à brouillard (hazer)', 1, 'Effets', 'Hazer', '', 2]],
    audio: [['Présentatrice', 'Liaison HF', 'Sur la personne'], ['Chroniqueur Karim', 'Liaison HF', 'Sur la personne'], ['Chroniqueuse Sophie', 'Liaison HF', 'Sur la personne'], ['Invité 1', 'Liaison HF', 'Sur la personne'], ['Invité 2', 'Liaison HF', 'Sur la personne'], ['Micro main public', 'Liaison HF'], ['Ambiance public G', 'Neumann KM 184', 'Grand pied perche'], ['Ambiance public D', 'Neumann KM 184', 'Grand pied perche'], ['Voix Fréquences', 'Shure Beta 58A', 'Grand pied perche'], ['Guitare Fréquences', 'Sennheiser e906', 'Au sol'], ['Clavier G', 'Boîte de direct active'], ['Clavier D', 'Boîte de direct active'], ['Playback G', 'Lecteur / playback'], ['Playback D', 'Lecteur / playback'], ['Ordre / talkback', 'Shure SM58', 'Table / pupitre']],
    hf: [['Julia', 'bodypack', 'Sennheiser SK 6000'], ['Karim', 'bodypack', 'Sennheiser SK 6000'], ['Sophie', 'bodypack', 'Sennheiser SK 6000'], ['Invité 1', 'bodypack', 'Sennheiser SK 6000'], ['Invité 2', 'bodypack', 'Sennheiser SK 6000'], ['Micro public', 'main', 'Sennheiser 2000 SKM'], ['Oreillette Julia', 'iem', 'Sennheiser EW IEM G4']],
    mixes: [['Oreillette présentatrice', 'iem', 'Julia Moreno'], ['Retour groupe', 'wedge', 'Les Fréquences'], ['Diffusion public', 'wedge', 'Public']],
    runo: [['Écran d’attente', 5, 'Attente', ''], ['Avant-show : coulisses avec Julia', 10, 'Backstage', ''], ['Émission en simultané', 52, 'Programme', 'PGM du plateau'], ['After : questions du chat aux invités', 15, 'Plateau', 'Micro main + caméra épaule']],
    planno: [['prepa', 'Conception & conducteur (CONDUCO)', -30, 14, 0, 'Rédactrice en chef'], ['casting', 'Booking des invités', -21, 14, 0, 'Chargée des invités'], ['reperage', 'Visite technique du studio', -14, 1, 0, 'Réalisateur'], ['prepa', 'Habillage GRAPHICO & synthés', -14, 10, 0, 'Truquiste'], ['prepa', 'Construction du décor', -10, 6, 0, 'Chef décorateur'], ['prepa', 'Validation conducteur chaîne', -3, 1, 1, 'Producteur'], ['tournage', 'Installation & répétitions', 0, 1, 0, ''], ['tournage', 'Enregistrement 2 numéros', 1, 1, 0, ''], ['post', 'Montage & versions courtes', 2, 3, 0, 'Monteur'], ['post', 'Mixage', 4, 1, 0, 'Chef opérateur son'], ['livraison', 'PAD numéro 1', 5, 1, 1, ''], ['livraison', 'Diffusion', 7, 1, 1, '']],
    post: { steps: [['Ingest des ISO', 'DIT', 0, 1], ['Montage numéro 1', 'Monteur', 1, 3], ['Montage numéro 2', 'Monteur', 2, 4], ['Mixage', 'Chef opérateur son', 4, 5], ['Sous-titres & synthés', 'Truquiste', 4, 5], ['Exports & PAD', 'Monteur', 5, 6]], deliv: ['tv', 'web', 's916'], versions: [['V1', 'notes', 'Numéro 1 — premier montage', [['00:03:12:00', 'Synthé invitée : titre à corriger (« astrophysicienne »)', 'gfx', 'Aurélie Fabre'], ['00:18:40:00', 'Couper la relance de Karim, trop longue', 'montage', 'Nicolas Arnaud']]], ['V2', 'ok', 'Validée chaîne', []]] },
    vehicles: [['Navette invités', 'car', 4, 'Hugo Bernard'], ['Utilitaire décor', 'van', 3, 'Bastien Leroux']],
    hotel: { name: 'Novotel Paris Saint-Denis Stade', addr: '16 Rue de la Cokerie, 93200 Saint-Denis', phone: '01 49 46 99 00', price: '135' },
    travel: { from: 'Lyon Part-Dieu', to: 'Paris Gare de Lyon', mode: 'train', who: ['Pr. Hélène Varga', 'Les Fréquences'] },
    eq: [['Sony HDC-3500', 4], ['Sony FX9', 1], ['Caméra PTZ', 1], ['Grue Jimmy Jib', 1], ['Trépied Sachtler S20 (S1)', 3], ['Prompteur Autoscript', 2], ['Blackmagic ATEM Constellation 4K', 1], ['Blackmagic HyperDeck Studio Mini', 6], ['TVLogic LQM-241W 24"', 4], ['Clear-Com DX-410 (kit 4 postes)', 1], ['Sennheiser EW 500 G4 + micro cravate', 6], ['Console Yamaha QL1', 1], ['ARRI SkyPanel S60-C', 6], ['ARRI Orbiter', 2], ['Martin MAC Aura XB', 10], ['Câble SDI 10 m', 16]],
    fees: [['Location studio (plateau + régie)', 2, 'jour', 6500, 5000, 9000], ['Construction décor', 1, 'forfait', 12000, 8000, 18000], ['Accueil public (agence)', 2, 'jour', 900, 600, 1400], ['Catering & loges', 1, 'forfait', 1600, 1100, 2400]],
    syno: 'tv', plano: 'tv',
    mood: { intention: 'Un talk chaleureux et moderne : on doit avoir envie de s’asseoir au desk avec eux.', palette: ['#101828', '#1E88E5', '#FFC107', '#F4E9D8', '#E53935'], focales: 'Plans poitrine serrés (22x) pour les échanges, grue en mouvement permanent sur les lancements.', look: 'Image claire, peaux chaudes, fond bleu profond avec lignes LED ambrées.', refs: 'Quotidien, Late Show with Stephen Colbert, C à vous', lieu: 'Plateau de 600 m², desk central en arc, écran LED 8 × 3 m, gradins 120 places.' },
    spots: [['Studios de la Plaine — Plateau 4', '12 Rue du Landy', 'Saint-Denis', '93200', 48.9183, 2.3555, 'decor', 'valide', 'Plateau 600 m², grill motorisé, régie 4K, 120 places public.', 5], ['Studio Rive Gauche', '20 Rue Jean-Jaurès', 'Boulogne-Billancourt', '92100', 48.8354, 2.2420, 'decor', 'option', 'Alternative si décalage de date.', 3]],
    packs: ['p-tech', 'p-art', 'p-img']
};

XMP.fiction = {
    icon: '🎬', label: 'Fiction / court métrage', title: 'NUIT BLANCHE — court métrage', short: 'Nuit Blanche',
    client: 'CNC — aide au court métrage', prod: 'Atelier XIII Films', domain: 'atelierxiii.fr', nDays: 5, weekdays: 1, dayTitles: ['Appartement de Léa', 'Appartement & palier', 'Bar Le Comptoir — nuit', 'Rues & quais — nuit', 'Toit & voiture'],
    times: [['07:30', '08:45', '13:00', '19:30'], ['07:30', '08:45', '13:00', '19:30'], ['15:00', '16:30', '21:00', '03:00'], ['16:00', '17:30', '22:00', '04:00'], ['12:00', '13:30', '18:00', '23:30']],
    venue: { name: 'Appartement de Léa', address: '18 Rue Burdeau, 69001 Lyon', lat: 45.7705, lon: 4.8299, access: '5e étage sans ascenseur : prévoir le portage. Code porte 4512B.', contact: 'M. Faure (propriétaire)', phone: '06 41 22 18 90' },
    base: { name: 'Base régie & loges', address: 'Salle paroissiale, 6 Rue Imbert-Colomès, 69001 Lyon', lat: 45.7712, lon: 4.8309, access: 'Rez-de-chaussée, clés à la régie.' },
    park: { name: 'Parking camions', address: 'Montée de la Grande Côte, 69001 Lyon', lat: 45.7716, lon: 4.8317, access: 'Emplacements réservés par arrêté municipal.' },
    cantine: { name: 'Cantine', address: 'Salle paroissiale, 6 Rue Imbert-Colomès, 69001 Lyon', lat: 45.7712, lon: 4.8309, access: 'Traiteur à partir de 12:45.' },
    loges: { name: 'Loges HMC', address: 'Salle paroissiale — 1er étage', lat: 45.7712, lon: 4.8309, access: '' },
    hosp: { name: 'Hôpital de la Croix-Rousse (urgences)', address: '103 Grande Rue de la Croix-Rousse, 69004 Lyon', phone: '04 26 73 25 00', lat: 45.7822, lon: 4.8237 },
    risks: ['nuit', 'voie', 'eau', 'vehicule', 'hauteur'],
    crew: [['prod', 'Productrice', 'Camille Martin'], ['prod', 'Directeur de production', 'Julien Petit'], ['regie', 'Régisseur général', 'Antoine Meyer'], ['regie', 'Régisseuse adjointe', 'Margaux Leclerc'], ['real', 'Réalisatrice', 'Sarah Leroy'], ['real', '1er assistant réalisation', 'Nicolas Roux'], ['real', 'Scripte', 'Claire Dumas'],
        ['image', 'Chef opérateur', 'Thomas Moreau'], ['image', '1re assistante caméra', 'Inès Garnier'], ['image', '2e assistant caméra', 'Lucas Fabre'], ['post', 'DIT', 'Medhi Saïdi'], ['elec', 'Chef électricien', 'Karim Benali'], ['elec', 'Électricien', 'Léo Chevalier'], ['machino', 'Chef machiniste', 'Bruno Caron'],
        ['son', 'Chef opératrice son', 'Lucie Faure'], ['son', 'Perchman', 'Victor Lambert'], ['deco', 'Cheffe décoratrice', 'Anaïs Robin'], ['deco', 'Accessoiriste', 'Simon Morel'], ['cost', 'Cheffe costumière', 'Agathe Simon'], ['hmc', 'Maquilleuse', 'Emma Rousseau'], ['hmc', 'Coiffeur', 'Rayan Aubert'], ['cast', 'Directrice de casting', 'Mélanie Brun'], ['secu', 'Coordinateur cascades', 'Franck Dupuis']],
    cast: [['Emma Dubois', 'Léa', 'comedien', 'confirme', 350, 'jour', 'f'], ['Paul Bernard', 'Max', 'comedien', 'confirme', 350, 'jour', 'm'], ['Yasmine Haddad', 'Inès', 'comedien', 'confirme', 290, 'jour', 'f'], ['Gérard Lenoir', 'Le patron du bar', 'comedien', 'option', 250, 'jour', 'm'], ['Noah Petit', 'Le voisin (enfant)', 'enfant', 'casting', 180, 'jour', 'm'], ['Figurants bar (12)', 'Clients du bar', 'figurant', 'confirme', 110, 'jour', 'm']],
    seqs: [['1', 'INT', 'Appartement de Léa', 'Nuit', 'Léa rentre trempée et allume la lampe. Max l’attendait dans le fauteuil.', ['Léa', 'Max'], [['PE', 'face', 'trav_av', '24 mm', 'Léa entre dans l’appartement plongé dans le noir', 6, 'Pluie dehors, clé dans la serrure'], ['GP', 'profil', '', '50 mm', 'Léa fixe la lampe éteinte, téléphone à la main', 3, 'Tonalité'], ['2S', '3q', '', '50 mm', 'Elle découvre Max assis dans le fauteuil', 5, 'MAX : Tu rentres tard.'], ['INS', 'face', '', '100 mm', 'Le verre de Max, glaçon fondu', 2, '']], 0],
        ['2', 'INT', 'Appartement de Léa', 'Jour', 'Le lendemain : cartons jamais déballés, Léa range en silence.', ['Léa'], [['PG', 'face', '', '18 mm', 'Le salon encombré de cartons, lumière de fenêtre', 5, 'Ambiance rue'], ['PR', '3q', 'epaule', '35 mm', 'Léa ouvre un carton, trouve une photo', 6, ''], ['INS', 'face', '', '100 mm', 'La photo : Léa et Max, plus jeunes', 3, '']], 0],
        ['3', 'INT', 'Palier de l’immeuble', 'Jour', 'Le petit voisin rapporte le chat de Léa.', ['Léa', 'Le voisin'], [['PM', 'face', '', '35 mm', 'Léa ouvre la porte, l’enfant tend le chat', 6, ''], ['GP', 'cplongee', '', '50 mm', 'L’enfant, sérieux', 3, 'VOISIN : Il était encore chez nous.']], 1],
        ['4', 'INT', 'Bar Le Comptoir', 'Nuit', 'Léa retrouve Inès au comptoir. Le patron leur sert deux verres.', ['Léa', 'Inès', 'Le patron du bar'], [['PG', 'face', 'trav_lat', '24 mm', 'Le bar plein, Léa traverse la foule', 8, 'Musique d’ambiance coupée au tournage'], ['2S', 'profil', '', '50 mm', 'Léa et Inès au comptoir', 10, 'INÈS : Il est revenu ?'], ['OTS', '3q', '', '85 mm', 'Amorce Inès, Léa hésite', 8, ''], ['INS', 'face', '', '100 mm', 'Le patron verse deux verres', 3, '']], 2],
        ['5', 'EXT', 'Rue des Capucins', 'Nuit', 'Léa marche vite sous la pluie, les néons se reflètent sur le pavé.', ['Léa'], [['PG', 'plongee', 'grue', '18 mm', 'La rue mouillée, Léa minuscule', 6, 'Pluie (machine)'], ['PM', 'face', 'trav_ar', '35 mm', 'Léa marche vers la caméra', 8, ''], ['GP', 'profil', 'suivi', '85 mm', 'Le visage de Léa, néon magenta', 5, '']], 3],
        ['6', 'EXT', 'Quai du Rhône', 'Nuit', 'Max rattrape Léa sur le quai. Dispute, puis silence.', ['Léa', 'Max'], [['PE', '3q', 'steadicam', '24 mm', 'Max court pour rattraper Léa', 8, ''], ['2S', 'profil', '', '50 mm', 'Face à face sur le quai', 15, 'MAX : Je ne suis pas venu pour ça.'], ['GP', 'face', '', '85 mm', 'Léa, larmes retenues', 5, '']], 3],
        ['7', 'INT', 'Voiture de Max', 'Nuit', 'Max raccompagne Léa en voiture, aucun des deux ne parle.', ['Léa', 'Max'], [['2S', 'face', '', '24 mm', 'Pare-brise : Max conduit, Léa regarde dehors', 20, 'Moteur, essuie-glaces'], ['GP', 'profil', '', '50 mm', 'Max', 6, '']], 4],
        ['8', 'EXT', 'Toit de l’immeuble', 'Crépuscule', 'Léa et Max sur le toit, la ville s’allume. Elle sourit enfin.', ['Léa', 'Max'], [['PG', 'face', 'drone', '24 mm', 'Le drone recule : les toits de la Croix-Rousse', 10, 'Musique'], ['2S', 'dos', '', '35 mm', 'De dos, face à la ville', 12, ''], ['TGP', 'face', '', '100 mm', 'Le sourire de Léa', 4, '']], 4]],
    cams: [['Caméra A', 'ARRI Alexa Mini LF', 'Cooke S4/i 18-100 mm (série)', 'Plateau', 'Thomas Moreau'], ['Caméra B', 'Sony Venice 2', 'Zeiss Supreme Prime', 'Plateau', 'Inès Garnier']],
    lights: [['ARRI M18 (HMI 1 800 W)', 2, 'Extérieur fenêtre', 'Lumière de jour à travers la fenêtre', 'CTB', 1], ['ARRI SkyPanel S60-C', 2, 'Plafond', 'Ambiance générale', '', 8], ['Kino Flo Celeb 450', 2, 'Face', 'Face douce', '', 4], ['Aputure LS 600D Pro', 2, 'Contre', 'Contre / effet néon', 'Magenta', 1], ['Astera Titan Tube', 8, 'Décor', 'Effets néon rue', '', 16], ['Fresnel 650 W', 3, 'Décor', 'Lampes pratiques renforcées', '1/2 CTO', 1], ['Ballon éclairant Ø150', 1, 'Rue', 'Ambiance rue nuit', '', 1], ['Machine à brouillard (hazer)', 1, 'Effets', 'Bar', '', 1]],
    audio: [['Perche', 'Sennheiser MKH 416', 'Sur la personne'], ['HF Léa', 'Liaison HF', 'Sur la personne'], ['HF Max', 'Liaison HF', 'Sur la personne'], ['HF Inès', 'Liaison HF', 'Sur la personne'], ['HF Patron', 'Liaison HF', 'Sur la personne'], ['Ambiance stéréo', 'Micro d’ambiance']],
    hf: [['Léa', 'bodypack', 'Lectrosonics SMWB'], ['Max', 'bodypack', 'Lectrosonics SMWB'], ['Inès', 'bodypack', 'Lectrosonics SMWB'], ['Patron du bar', 'bodypack', 'Lectrosonics SMWB'], ['Retour réal (Comtek)', 'iem', 'Autre'], ['Caméra A', 'camlink', 'Sennheiser EK 6042 (caméra)']],
    mixes: [['Casques réal & script', 'iem', 'Sarah Leroy, Claire Dumas'], ['Retour perche', 'iem', 'Victor Lambert']],
    runo: [['Écran d’attente', 5, 'Attente', ''], ['Live making-of : visite du plateau', 20, 'Plateau', 'Caméra épaule, questions du chat'], ['Rencontre avec Sarah Leroy (réalisatrice)', 20, 'Interview', ''], ['Questions du chat aux comédiens', 15, 'Plateau', ''], ['Teaser exclusif & remerciements', 5, 'Programme', '']],
    planno: [['prepa', 'Version de tournage du scénario', -70, 21, 0, 'Réalisatrice'], ['prepa', 'Financement & contrats', -60, 25, 0, 'Productrice'], ['casting', 'Casting comédiens', -42, 14, 0, 'Directrice de casting'], ['reperage', 'Repérages décors', -35, 10, 0, '1er assistant réalisation'], ['prepa', 'Découpage technique & storyboard', -28, 10, 0, 'Réalisatrice'], ['prepa', 'Essais caméra & costumes', -10, 2, 0, 'Chef opérateur'], ['prepa', 'Lecture à la table', -5, 1, 1, 'Réalisatrice'], ['prepa', 'Autorisations de tournage (mairie, police)', -21, 14, 0, 'Régisseur général'], ['tournage', 'Tournage', 0, 5, 0, ''], ['post', 'Dérushage & montage image', 7, 25, 0, 'Monteur'], ['post', 'Montage son & bruitage', 33, 10, 0, 'Monteur son'], ['post', 'Mixage', 43, 3, 0, 'Mixeur'], ['post', 'Étalonnage', 40, 5, 0, 'Étalonneur'], ['livraison', 'DCP & copie festival', 50, 1, 1, '']],
    post: { steps: [['Dérushage / synchro', 'Assistant monteur', 1, 6], ['Montage image', 'Monteur', 7, 32], ['Montage son', 'Monteur son', 33, 42], ['Mixage', 'Mixeur', 43, 45], ['Étalonnage', 'Étalonneur', 40, 44], ['Graphisme / VFX', 'Truquiste', 35, 45], ['Sous-titres anglais', 'Traductrice', 44, 47], ['DCP & exports', 'Monteur', 48, 50]], deliv: ['dcp', 'master', 'web'], versions: [['V1', 'notes', 'Ours — 22 min', [['01:02:15:00', 'Entrée de Max trop tôt : garder le silence plus longtemps', 'montage', 'Sarah Leroy'], ['01:09:40:12', 'Raccord sac épaule gauche faux', 'montage', 'Claire Dumas'], ['01:15:00:00', 'Néon trop saturé, peaux virent au violet', 'etalo', 'Thomas Moreau']]], ['V2', 'notes', 'Fin de montage — 17 min', [['01:16:30:00', 'Musique finale : essayer la version piano', 'son', 'Camille Martin']]], ['V3', 'wip', 'PAT image', []]] },
    vehicles: [['Camion caméra 20 m³', 'truck', 3, 'Lucas Fabre'], ['Camion électro/machino', 'truck', 3, 'Léo Chevalier'], ['Loge HMC mobile', 'van', 3, 'Rayan Aubert'], ['Navette comédiens', 'minibus', 8, 'Margaux Leclerc'], ['Voiture de jeu (Peugeot 406)', 'car', 4, 'Paul Bernard']],
    hotel: { name: 'Hôtel des Artistes', addr: '8 Rue Gaspard André, 69002 Lyon', phone: '04 78 42 04 88', price: '95' },
    travel: { from: 'Paris Gare de Lyon', to: 'Lyon Part-Dieu', mode: 'train', who: ['Emma Dubois', 'Paul Bernard', 'Yasmine Haddad', 'Sarah Leroy', 'Thomas Moreau', 'Lucie Faure'] },
    eq: [['ARRI Alexa Mini LF', 1], ['Sony Venice 2', 1], ['Cooke S4/i (série 5 optiques)', 1], ['Zeiss Supreme Prime (série)', 1], ['Teradek Bolt 4K LT 750 (émetteur + récepteur)', 2], ['Moniteur SmallHD Cine 13', 2], ['DJI Ronin 2', 1], ['Trépied Sachtler Video 20 S1', 2], ['Dolly Panther + rails', 1], ['ARRI M18', 2], ['ARRI SkyPanel S60-C', 2], ['Kino Flo Celeb 450', 2], ['Aputure LS 600D Pro', 2], ['Astera Titan Tube (kit de 8)', 1], ['Sound Devices 888', 1], ['Lectrosonics SMWB', 4], ['Sennheiser MKH 416', 1], ['Groupe électrogène 20 kVA', 1], ['Camion 20 m³', 2]],
    fees: [['Décoration & accessoires', 1, 'forfait', 4500, 3000, 7000], ['Costumes', 1, 'forfait', 1800, 1200, 2600], ['Autorisations & régie extérieure', 1, 'forfait', 900, 600, 1400], ['Machine à pluie + pompiers', 1, 'jour', 1100, 800, 1600], ['Drone (télépilote + déclaration)', 1, 'jour', 950, 700, 1300], ['Assurance production', 1, 'forfait', 1200, 900, 1800]],
    syno: 'fiction', plano: 'fiction',
    mood: { intention: 'Une ville qui ne dort pas, vue par quelqu’un qui n’y trouve pas sa place : solitude au milieu des lumières.', palette: ['#0B1D3A', '#1F3B73', '#FF3D8B', '#F2A65A', '#E8E2D6'], focales: 'Longues focales (85–135 mm) pour isoler Léa, grand-angle seulement pour les plans d’ensemble.', look: 'Contraste élevé, noirs denses, léger grain 35 mm, halos sur les sources.', refs: 'In the Mood for Love, Drive, Lost in Translation', lieu: 'Petit deux-pièces sous les toits de la Croix-Rousse, encombré de cartons.' },
    spots: [['Appartement de Léa', '18 Rue Burdeau', 'Lyon', '69001', 45.7705, 4.8299, 'decor', 'valide', '5e sans ascenseur, vue sur les toits. Propriétaire d’accord pour 2 jours.', 5], ['Bar Le Comptoir', '4 Rue de la Martinière', 'Lyon', '69001', 45.7680, 4.8300, 'decor', 'valide', 'Fermeture au public le mardi soir, tournage 17h-3h.', 4], ['Rue des Capucins', 'Rue des Capucins', 'Lyon', '69001', 45.7695, 4.8334, 'decor', 'option', 'Arrêté de circulation à demander (pluie artificielle).', 4], ['Quai du Rhône — berges', 'Quai Augagneur', 'Lyon', '69003', 45.7600, 4.8430, 'decor', 'avoir', 'Accès camion difficile, prévoir un portage.', 3], ['Toit de l’immeuble', '18 Rue Burdeau', 'Lyon', '69001', 45.7705, 4.8299, 'decor', 'avoir', 'Garde-corps à vérifier, ligne de vie obligatoire.', 4]],
    packs: ['p-tech', 'p-art', 'p-img', 'p-lieu']
};

XMP.doc = {
    icon: '🎥', label: 'Documentaire', title: 'Les Gardiens du Rhône', short: 'Gardiens du Rhône',
    client: 'France 3 Auvergne-Rhône-Alpes', prod: 'Productions XIII', domain: 'prodxiii.fr', nDays: 4, weekdays: 1, dayTitles: ['Écluse & capitainerie', 'Sur la péniche', 'Laboratoire & interviews', 'Aube sur le fleuve'],
    times: [['07:00', '08:00', '12:30', '18:00'], ['06:30', '07:30', '12:30', '18:00'], ['08:30', '09:30', '13:00', '18:30'], ['05:00', '05:45', '12:00', '15:00']],
    venue: { name: 'Écluse de Pierre-Bénite', address: 'Chemin de l’Écluse, 69310 Pierre-Bénite', lat: 45.6985, lon: 4.8238, access: 'Accès par la digue, autorisation CNR obligatoire (gilets fournis).', contact: 'Capitainerie CNR', phone: '04 72 00 69 69' },
    base: { name: 'Voiture de production', address: 'Parking de l’écluse, 69310 Pierre-Bénite', lat: 45.6990, lon: 4.8230, access: '' },
    park: { name: 'Parking de l’écluse', address: 'Chemin de l’Écluse, 69310 Pierre-Bénite', lat: 45.6990, lon: 4.8230, access: '' },
    cantine: { name: 'Restaurant Le Bistrot du Port', address: 'Quai Rambaud, 69002 Lyon', lat: 45.7420, lon: 4.8180, access: 'Réservation pour 6.' },
    loges: null,
    hosp: { name: 'Centre hospitalier Lyon Sud (urgences)', address: '165 Chemin du Grand Revoyet, 69310 Pierre-Bénite', phone: '04 78 86 11 11', lat: 45.6995, lon: 4.8130 },
    risks: ['eau', 'froid', 'drone'],
    crew: [['prod', 'Producteur', 'Nicolas Arnaud'], ['prod', 'Chargée de production', 'Manon Girard'], ['real', 'Réalisatrice', 'Julie Navarro'], ['real', 'Assistant réalisation / fixeur', 'Bastien Royer'], ['image', 'Chef opérateur', 'Thomas Moreau'], ['image', 'Assistant caméra', 'Lucas Fabre'], ['image', 'Télépilote drone', 'Marc Vidal'], ['son', 'Ingénieure du son', 'Lucie Faure'], ['post', 'Monteuse', 'Hélène Carpentier']],
    cast: [['Jean-Pierre Rivière', 'Éclusier depuis 30 ans', 'invite', 'confirme', 0, 'forfait', 'm'], ['Marion Duval', 'Capitaine de péniche', 'invite', 'confirme', 0, 'forfait', 'f'], ['Dr Amina Kader', 'Hydrobiologiste (INRAE)', 'invite', 'confirme', 0, 'forfait', 'f'], ['Les pêcheurs du Rhône', 'Groupe de pêcheurs', 'figurant', 'option', 0, 'forfait', 'm'], ['Voix off', 'Narration', 'comedien', 'casting', 450, 'forfait', 'f']],
    seqs: [['1', 'EXT', 'Écluse de Pierre-Bénite', 'Aube', 'Ouverture : le fleuve dans la brume, l’éclusier commence sa journée.', ['Jean-Pierre Rivière'], [['PG', 'plongee', 'drone', '24 mm', 'Le drone survole l’écluse dans la brume', 12, 'Ambiance fleuve'], ['PM', 'dos', 'suivi', '35 mm', 'Jean-Pierre marche sur la digue', 10, ''], ['INS', 'face', '', '100 mm', 'Ses mains sur la manivelle', 4, '']], 0],
        ['2', 'INT', 'Capitainerie', 'Jour', 'Interview de Jean-Pierre : 30 ans au bord de l’eau.', ['Jean-Pierre Rivière'], [['PR', '3q', '', '50 mm', 'Interview cam A, regard hors champ', 600, 'Cravate + perche'], ['GP', 'profil', '', '85 mm', 'Cam B profil', 600, ''], ['INS', 'face', '', '100 mm', 'Photos anciennes au mur', 5, '']], 0],
        ['3', 'EXT', 'Péniche Marion — pont', 'Jour', 'À bord : Marion manœuvre l’entrée dans l’écluse.', ['Marion Duval'], [['PE', '3q', 'epaule', '24 mm', 'Marion à la barre, l’écluse en fond', 15, 'HF Marion'], ['GP', 'face', 'epaule', '50 mm', 'Concentration', 6, ''], ['PG', 'zenith', 'drone', '24 mm', 'La péniche dans le sas', 10, '']], 1],
        ['4', 'INT', 'Laboratoire INRAE', 'Jour', 'Amina analyse les prélèvements : ce que l’eau raconte.', ['Dr Amina Kader'], [['PM', '3q', 'trav_lat', '35 mm', 'Amina au microscope', 10, ''], ['INS', 'face', '', '100 mm macro', 'Larves d’éphémères', 6, ''], ['PR', '3q', '', '50 mm', 'Interview', 600, 'Cravate']], 2],
        ['5', 'EXT', 'Berges du Rhône', 'Aube', 'Final : les pêcheurs au lever du jour.', ['Les pêcheurs du Rhône'], [['PG', 'face', 'grue', '24 mm', 'Silhouettes au lever du soleil', 10, ''], ['PM', 'profil', '', '85 mm', 'Lancer de ligne', 6, '']], 3]],
    cams: [['Caméra A', 'Sony FX6', 'Sony FE 24-105 mm f/4', 'Interviews & épaule', 'Thomas Moreau'], ['Caméra B', 'Sony FX3', 'Sony FE 70-200 mm f/2.8', 'Profil interview', 'Lucas Fabre'], ['Drone', 'DJI Inspire 3', 'Zenmuse X9-8K', 'Aérien', 'Marc Vidal']],
    lights: [['Aputure LS 600D Pro', 1, 'Face', 'Key interview (octa 120)', '', 1], ['Aputure Nova P300c', 1, 'Face', 'Fill', '', 4], ['Astera Titan Tube', 2, 'Contre', 'Contre / décor', '', 16], ['Réflecteur 5 en 1', 2, 'Face', 'Extérieur', '', 0]],
    audio: [['Perche', 'Sennheiser MKH 416', 'Sur la personne'], ['HF 1 (interviewé)', 'Liaison HF', 'Sur la personne'], ['HF 2', 'Liaison HF', 'Sur la personne'], ['Ambiance stéréo', 'Micro d’ambiance']],
    hf: [['Interviewé 1', 'bodypack', 'Sennheiser EW-D SK'], ['Interviewé 2', 'bodypack', 'Sennheiser EW-D SK'], ['Caméra A', 'camlink', 'Sennheiser EK 6042 (caméra)']],
    mixes: [['Casque réal', 'iem', 'Julie Navarro']],
    runo: [['Écran d’attente', 5, 'Attente', ''], ['Avant-première en ligne : présentation', 10, 'Plateau', ''], ['Projection — extraits', 25, 'Programme', ''], ['Débat avec la réalisatrice et Amina Kader', 25, 'Plateau', 'Questions du chat'], ['Remerciements', 5, 'Plateau', '']],
    planno: [['prepa', 'Recherches & enquête', -60, 30, 0, 'Réalisatrice'], ['prepa', 'Dossier CNC / chaîne', -50, 10, 0, 'Producteur'], ['reperage', 'Repérages & rencontres', -25, 10, 0, 'Réalisatrice'], ['prepa', 'Autorisation CNR & déclaration drone', -20, 10, 0, 'Chargée de production'], ['tournage', 'Tournage bloc 1', 0, 4, 0, ''], ['post', 'Dérushage & transcriptions', 6, 10, 0, 'Monteuse'], ['post', 'Montage', 16, 30, 0, 'Monteuse'], ['post', 'Enregistrement voix off', 44, 1, 1, ''], ['post', 'Mixage & étalonnage', 46, 8, 0, ''], ['livraison', 'PAD France 3', 56, 1, 1, '']],
    post: { steps: [['Dérushage & transcriptions', 'Monteuse', 1, 10], ['Montage', 'Monteuse', 10, 40], ['Voix off', 'Réalisatrice', 44, 44], ['Mixage', 'Mixeur', 46, 50], ['Étalonnage', 'Étalonneur', 48, 52], ['Sous-titres', 'Monteuse', 52, 54], ['PAD', 'Monteuse', 55, 56]], deliv: ['tv', 'web', 'master'], versions: [['V1', 'notes', 'Ours 75 min', [['00:05:20:00', 'Interview Jean-Pierre : garder l’anecdote de la crue de 1990', 'montage', 'Julie Navarro'], ['00:31:10:00', 'Drone : bruit d’hélices à nettoyer', 'son', 'Lucie Faure']]], ['V2', 'wip', 'Version 52 min', []]] },
    vehicles: [['Voiture de production', 'car', 5, 'Bastien Royer']],
    hotel: null, travel: null,
    eq: [['Sony FX6', 1], ['Sony FX3', 1], ['Sony FE 24-105 mm f/4 G', 1], ['Sony FE 70-200 mm f/2.8 GM II', 1], ['DJI Inspire 3', 1], ['Trépied Sachtler Flowtech 75', 2], ['DJI RS 3 Pro', 1], ['Aputure LS 600D Pro', 1], ['Aputure Nova P300c', 1], ['Zoom F6', 1], ['Sennheiser EW-D (micro cravate)', 2], ['Sennheiser MKH 416', 1], ['Tentacle Sync E (kit)', 1]],
    fees: [['Archives (INA, photos)', 1, 'forfait', 1500, 800, 2500], ['Transcriptions', 1, 'forfait', 600, 400, 900], ['Location bateau suiveur', 1, 'jour', 450, 350, 650], ['Défraiements (km, repas)', 1, 'forfait', 700, 500, 1000]],
    syno: 'doc', plano: 'doc',
    mood: { intention: 'Donner un visage aux gens qui vivent avec le fleuve, au rythme de l’eau.', palette: ['#0E3B43', '#5B8C85', '#C9D6DF', '#E0B973', '#2D2D2A'], focales: 'Moyens et longs (50–200 mm) pour les observations, 24 mm à l’épaule dans l’action.', look: 'Naturaliste, lumière disponible, brumes et contre-jours d’aube, LUT douce.', refs: 'Les Glaneurs et la Glaneuse, Honeyland, Le Sel de la Terre', lieu: 'Écluse, péniche, laboratoire, berges à l’aube.' },
    spots: [['Écluse de Pierre-Bénite', 'Chemin de l’Écluse', 'Pierre-Bénite', '69310', 45.6985, 4.8238, 'decor', 'valide', 'Autorisation CNR obtenue, gilets obligatoires.', 5], ['Laboratoire INRAE', '5 Rue de la Doua', 'Villeurbanne', '69100', 45.7800, 4.8700, 'decor', 'valide', 'Tournage le jeudi uniquement.', 4], ['Berges — lever du soleil', 'Quai Fillon', 'Lyon', '69007', 45.7290, 4.8270, 'decor', 'avoir', 'Lever du soleil à 7h12, orientation est parfaite.', 5]],
    packs: ['p-img', 'p-lieu']
};

XMP.pub = {
    icon: '✨', label: 'Publicité / clip', title: 'AURORE — film publicitaire 30’’', short: 'Aurore',
    client: 'Maison Aurore (cosmétiques) — agence Blanc Papier', prod: 'Productions XIII', domain: 'prodxiii.fr', nDays: 2, weekdays: 1, dayTitles: ['Studio — fond infini', 'Extérieur — plage & villa'],
    times: [['07:00', '08:30', '13:00', '19:30'], ['05:00', '06:00', '12:30', '20:30']],
    venue: { name: 'Studio Lumière — Plateau 2', address: '38 Rue de la Gare de Vaise, 69009 Lyon', lat: 45.7790, lon: 4.8040, access: 'Quai de déchargement plain-pied, cyclorama blanc 12 × 8 m.', contact: 'Accueil studio', phone: '04 78 83 00 00' },
    base: { name: 'Espace agence & client', address: 'Mezzanine du studio', lat: 45.7790, lon: 4.8041, access: 'Video village, wifi, catering.' },
    park: { name: 'Parking studio', address: 'Rue de la Gare de Vaise, 69009 Lyon', lat: 45.7792, lon: 4.8043, access: '' },
    cantine: { name: 'Catering studio', address: 'Mezzanine', lat: 45.7790, lon: 4.8040, access: '' },
    loges: { name: 'Loges HMC', address: 'Studio — loges 1 et 2', lat: 45.7790, lon: 4.8040, access: '' },
    hosp: { name: 'Hôpital de la Croix-Rousse (urgences)', address: '103 Grande Rue de la Croix-Rousse, 69004 Lyon', phone: '04 26 73 25 00', lat: 45.7822, lon: 4.8237 },
    risks: ['hauteur', 'elec', 'eau'],
    crew: [['prod', 'Productrice', 'Camille Martin'], ['prod', 'Directeur de production', 'Julien Petit'], ['real', 'Réalisateur', 'Adrien Vasseur'], ['real', '1re assistante réalisation', 'Pauline Marchand'], ['real', 'Scripte', 'Claire Dumas'], ['image', 'Chef opérateur', 'Thomas Moreau'], ['image', '1er assistant caméra', 'Lucas Fabre'], ['post', 'DIT', 'Medhi Saïdi'], ['elec', 'Chef électricien', 'Karim Benali'], ['machino', 'Chef machiniste', 'Bruno Caron'], ['machino', 'Opérateur Technocrane', 'Hervé Collin'], ['deco', 'Chef déco / set designer', 'Anaïs Robin'], ['deco', 'Styliste produit', 'Lou Barbier'], ['cost', 'Styliste', 'Agathe Simon'], ['hmc', 'Maquilleuse beauté', 'Emma Rousseau'], ['hmc', 'Coiffeur', 'Rayan Aubert'], ['regie', 'Régisseur', 'Antoine Meyer'], ['autre', 'Représentante agence', 'Sophie Blanc'], ['autre', 'Cliente (marque)', 'Isabelle Aurore']],
    cast: [['Ines Okafor', 'Mannequin principale', 'comedien', 'confirme', 1800, 'forfait', 'f'], ['Hugo Lemaire', 'Partenaire', 'comedien', 'option', 900, 'forfait', 'm'], ['Mains (packshot)', 'Modèle mains', 'silhouette', 'confirme', 400, 'forfait', 'f']],
    seqs: [['1', 'INT', 'Studio — fond infini', 'Jour', 'Packshot : le flacon tourne dans un rayon de lumière dorée.', ['Mains (packshot)'], [['INS', 'face', 'trav_lat', '100 mm macro', 'Slider macro sur le flacon, gouttes en suspension', 4, ''], ['TGP', 'face', '', '100 mm macro', 'Le sérum coule sur la peau', 3, ''], ['PR', 'face', 'zoom_out', '50 mm', 'Le flacon sur son socle, logo', 3, '']], 0],
        ['2', 'INT', 'Studio — fond infini', 'Jour', 'Beauté : Ines face caméra, lumière d’aube artificielle.', ['Ines Okafor'], [['GP', 'face', 'trav_av', '85 mm', 'Ines ouvre les yeux, rayon de lumière', 4, ''], ['TGP', 'profil', '', '100 mm', 'Peau, reflet doré', 3, ''], ['PR', '3q', 'grue', '50 mm', 'Technocrane : Ines se retourne', 4, '']], 0],
        ['3', 'EXT', 'Plage de la villa', 'Aube', 'Ines court sur la plage au lever du soleil.', ['Ines Okafor', 'Hugo Lemaire'], [['PG', 'face', 'drone', '24 mm', 'Le drone suit Ines au bord de l’eau', 5, ''], ['PM', 'profil', 'suivi', '50 mm', 'Course au ralenti 100 i/s', 4, ''], ['2S', '3q', '', '85 mm', 'Hugo la rejoint, rire', 3, '']], 1],
        ['4', 'INT', 'Villa — salle de bain', 'Jour', 'Rituel : Ines applique le sérum devant le miroir.', ['Ines Okafor'], [['OTS', 'dos', '', '50 mm', 'Reflet dans le miroir', 4, ''], ['INS', 'face', '', '100 mm', 'Pipette, goutte', 2, ''], ['PR', 'face', '', '85 mm', 'Sourire final', 3, 'Voix off : « Aurore. Chaque matin. »']], 1]],
    cams: [['Caméra A', 'ARRI Alexa 35', 'ARRI Signature Prime', 'Plateau', 'Thomas Moreau'], ['Caméra ralenti', 'Phantom Flex 4K', 'Laowa 24 mm Probe', 'Packshot', 'Lucas Fabre']],
    lights: [['ARRI SkyPanel S360-C', 2, 'Plafond', 'Toit lumineux du cyclo', '', 16], ['ARRI M90 (HMI 9 kW)', 1, 'Face', 'Rayon de soleil (Fresnel)', '1/2 CTO', 1], ['Aputure Nova P600c', 2, 'Face', 'Beauté (bol + diffusion)', '', 4], ['Kino Flo FreeStyle 41', 4, 'Contre', 'Liserés', '', 4], ['Projecteur découpe (Leko)', 2, 'Face', 'Rayon sur le flacon', 'Ambre', 1], ['Ballon éclairant Ø150', 1, 'Extérieur', 'Remplissage aube', '', 1]],
    audio: [['Playback musique G', 'Lecteur / playback'], ['Playback musique D', 'Lecteur / playback'], ['Talkback réal', 'Shure SM58', 'Table / pupitre'], ['Témoin caméra', 'Micro d’ambiance']],
    hf: [['Ordre plateau', 'iem', 'Sennheiser EW IEM G4'], ['Caméra A', 'camlink', 'Sennheiser EK 6042 (caméra)']],
    mixes: [['Playback plateau', 'wedge', 'Ines Okafor']],
    runo: [['Écran d’attente', 5, 'Attente', ''], ['Lancement : la nouvelle gamme Aurore', 10, 'Programme', 'Film 30’’ + making-of'], ['Live avec Ines Okafor', 15, 'Plateau', 'Questions du chat'], ['Jeu concours', 10, 'Plateau', ''], ['Clôture', 5, 'Programme', '']],
    planno: [['prepa', 'Brief agence & traitement réalisateur', -28, 5, 0, 'Réalisateur'], ['prepa', 'Validation du devis', -21, 1, 1, 'Productrice'], ['casting', 'Casting mannequins', -18, 5, 0, '1re assistante réalisation'], ['reperage', 'Repérage villa', -14, 2, 0, 'Réalisateur'], ['prepa', 'Storyboard & shooting board', -12, 5, 0, 'Réalisateur'], ['prepa', 'Essais beauté & lumière', -4, 1, 0, 'Chef opérateur'], ['prepa', 'PPM (pre-production meeting)', -7, 1, 1, 'Productrice'], ['tournage', 'Tournage', 0, 2, 0, ''], ['post', 'Montage offline', 3, 4, 0, 'Monteur'], ['livraison', 'Présentation V1 agence', 7, 1, 1, ''], ['post', 'Étalonnage, VFX, mixage', 9, 5, 0, ''], ['livraison', 'Livraison des versions (30’’, 15’’, 6’’, 9:16)', 15, 1, 1, '']],
    post: { steps: [['Offline', 'Monteur', 3, 7], ['Retours agence', 'Productrice', 7, 8], ['Étalonnage', 'Étalonneur', 9, 11], ['VFX (gouttes, nettoyage peau)', 'Truquiste', 9, 13], ['Musique & mixage', 'Mixeur', 11, 13], ['Déclinaisons 15’’ / 6’’ / 9:16', 'Monteur', 13, 15]], deliv: ['tv', 'web', 's916', 's11', 'master'], versions: [['V1', 'notes', 'Offline 30’’', [['00:00:03:12', 'Le logo doit apparaître plus tôt (exigence client)', 'gfx', 'Sophie Blanc'], ['00:00:12:00', 'Plan plage plus long', 'montage', 'Isabelle Aurore'], ['00:00:21:05', 'Peau trop rosée', 'etalo', 'Adrien Vasseur']]], ['V2', 'sent', 'Online étalonnée', []]] },
    vehicles: [['Camion caméra/électro', 'truck', 3, 'Karim Benali'], ['Van loge HMC', 'van', 4, 'Rayan Aubert'], ['Navette agence & client', 'car', 4, 'Antoine Meyer']],
    hotel: { name: 'Villa Florentine', addr: '25 Montée Saint-Barthélémy, 69005 Lyon', phone: '04 72 56 56 56', price: '290' },
    travel: { from: 'Paris Gare de Lyon', to: 'Lyon Part-Dieu', mode: 'train', who: ['Ines Okafor', 'Sophie Blanc', 'Isabelle Aurore', 'Adrien Vasseur'] },
    eq: [['ARRI Alexa 35', 1], ['ARRI Signature Prime (série)', 1], ['Phantom Flex 4K', 1], ['Laowa 24 mm Probe', 1], ['Technocrane 22', 1], ['Slider motorisé eMotimo', 1], ['DJI Inspire 3', 1], ['Teradek Bolt 6 XT 750', 2], ['Moniteur Sony PVM-X2400', 2], ['ARRI SkyPanel S360-C', 2], ['ARRI M90', 1], ['Aputure Nova P600c', 2], ['Kino Flo FreeStyle 41', 4], ['Groupe électrogène 60 kVA', 1]],
    fees: [['Location studio cyclo', 1, 'jour', 2200, 1600, 3000], ['Location villa', 1, 'jour', 3500, 2500, 5000], ['Stylisme & accessoires', 1, 'forfait', 2500, 1500, 3500], ['Musique (licence)', 1, 'forfait', 4000, 2500, 8000], ['Droits mannequin (1 an, web + TV)', 1, 'forfait', 6000, 4000, 9000]],
    syno: 'pub', plano: 'pub',
    mood: { intention: 'La lumière de l’aube sur la peau : pureté, chaleur, éveil.', palette: ['#F7E7CE', '#E8B87D', '#C9786B', '#FFFFFF', '#3B2F2F'], focales: 'Macro et longues focales (85–100 mm), ralentis 100 à 1 000 i/s.', look: 'Lumière dorée, hautes lumières douces, peaux lumineuses, grain fin.', refs: 'Dior J’adore, Chanel N°5 (Baz Luhrmann), clips d’Aurora', lieu: 'Cyclorama blanc infini, villa méditerranéenne lumineuse.' },
    spots: [['Studio Lumière — Plateau 2', '38 Rue de la Gare de Vaise', 'Lyon', '69009', 45.7790, 4.8040, 'decor', 'valide', 'Cyclo 12 × 8 m, grill 6 m, 400 A.', 5], ['Villa — plage privée', 'Chemin des Calanques', 'Cassis', '13260', 43.2140, 5.5370, 'decor', 'option', 'Lever du soleil 7h05, accès plage par escalier (portage).', 4]],
    packs: ['p-tech', 'p-art', 'p-img', 'p-lieu']
};

XMP.corporate = {
    icon: '🏢', label: 'Institutionnel / corporate', title: 'Convention annuelle Helvia 2027', short: 'Convention Helvia',
    client: 'Helvia Énergie — direction de la communication', prod: 'Productions XIII', domain: 'prodxiii.fr', nDays: 2, dayTitles: ['Installation & répétitions', 'Convention — plénière & streaming'],
    times: [['08:00', '09:00', '12:30', '20:00'], ['06:30', '07:30', '12:30', '19:00']],
    venue: { name: 'Centre de Congrès de Lyon — Amphithéâtre', address: '50 Quai Charles de Gaulle, 69006 Lyon', lat: 45.7860, lon: 4.8530, access: 'Livraisons quai B, créneaux à réserver 48 h avant.', contact: 'Chef de projet Centre de Congrès', phone: '04 72 82 26 26' },
    base: { name: 'Régie technique', address: 'Fond de salle, Amphithéâtre', lat: 45.7860, lon: 4.8531, access: '' },
    park: { name: 'Parking Cité Internationale P1', address: 'Quai Charles de Gaulle, 69006 Lyon', lat: 45.7855, lon: 4.8525, access: '' },
    cantine: { name: 'Cocktail déjeunatoire', address: 'Foyer de l’Amphithéâtre', lat: 45.7861, lon: 4.8532, access: '' },
    loges: { name: 'Loges intervenants', address: 'Niveau -1, salons 1 et 2', lat: 45.7860, lon: 4.8530, access: '' },
    hosp: { name: 'Hôpital de la Croix-Rousse (urgences)', address: '103 Grande Rue de la Croix-Rousse, 69004 Lyon', phone: '04 26 73 25 00', lat: 45.7822, lon: 4.8237 },
    risks: ['hauteur', 'elec', 'levage'],
    crew: [['prod', 'Cheffe de projet', 'Camille Martin'], ['prod', 'Directeur technique', 'Tom Lefèvre'], ['real', 'Réalisateur', 'Olivier Mercier'], ['real', 'Assistante réalisation', 'Julie Bonnet'], ['image', 'Cadreur', 'Hugo Renard'], ['image', 'Cadreuse', 'Sarah Kessler'], ['image', 'Cadreur', 'Julien Marchal'], ['image', 'Ingénieur vision / streaming', 'Yanis Morel'], ['post', 'Opératrice slides & médias', 'Alice Perrin'], ['post', 'Opérateur prompteur', 'Kevin Roche'], ['son', 'Ingénieur du son', 'Sami Roux'], ['son', 'Assistant son HF', 'Victor Lambert'], ['elec', 'Éclairagiste', 'Paul Girard'], ['regie', 'Régisseuse plateau', 'Chloé Garnier'], ['hmc', 'Maquilleuse', 'Emma Rousseau'], ['autre', 'Directrice communication (client)', 'Nathalie Brunet']],
    cast: [['Claire Fontaine', 'PDG Helvia', 'invite', 'confirme', 0, 'forfait', 'f'], ['Marc Delaunay', 'Directeur financier', 'invite', 'confirme', 0, 'forfait', 'm'], ['Samia Benali', 'Directrice innovation', 'invite', 'confirme', 0, 'forfait', 'f'], ['Thomas Weber', 'Grand témoin — navigateur', 'invite', 'option', 3500, 'forfait', 'm'], ['Élodie Marsan', 'Maîtresse de cérémonie', 'animateur', 'confirme', 1200, 'forfait', 'f']],
    seqs: [['1', 'INT', 'Amphithéâtre — scène', 'Jour', 'Ouverture : film d’entreprise puis discours de la PDG.', ['Élodie Marsan', 'Claire Fontaine'], [['PG', 'face', 'grue', '18 mm', 'Salle de 900 personnes, écran géant', 10, ''], ['PR', 'face', '', '22x', 'Claire au pupitre (prompteur)', 600, 'HF pupitre'], ['PUB', '3q', '', '22x', 'Réactions de la salle', 6, '']], 0],
        ['2', 'INT', 'Amphithéâtre — scène', 'Jour', 'Table ronde innovation : 3 intervenants et la maîtresse de cérémonie.', ['Élodie Marsan', 'Samia Benali', 'Marc Delaunay', 'Thomas Weber'], [['PE', 'face', '', '22x', 'Les 4 intervenants sur fauteuils', 20, ''], ['PR', '3q', '', '22x', 'Intervenant qui parle', 600, ''], ['PR', 'face', '', '22x', 'Écoute', 10, '']], 0],
        ['3', 'INT', 'Studio interviews — foyer', 'Jour', 'Interviews courtes pour les réseaux sociaux internes (format 9:16).', ['Claire Fontaine', 'Samia Benali', 'Thomas Weber'], [['PR', '3q', '', '50 mm', 'Interview cam A', 120, 'Cravate'], ['GP', 'profil', '', '85 mm', 'Cam B', 120, '']], 0]],
    sched: [[0, '08:00', 1, '', 'decor', 'Montage scène, écran LED, lumière', ''], [0, '12:30', 1, '', 'cantine', 'REPAS', ''], [0, '14:00', 1, '', 'decor', 'Installation caméras, régie, encodeurs streaming', ''], [0, '17:00', 0, 'R', 'decor', 'Répétition avec les intervenants et slides', 'Claire Fontaine, Élodie Marsan'], [1, '07:30', 1, '', 'loges', 'Maquillage intervenants', ''], [1, '08:15', 1, '', 'decor', 'Tests streaming (lien privé) et ouverture des portes', ''], [1, '09:00', 0, '1', 'decor', 'Plénière d’ouverture — EN DIRECT (streaming interne)', 'Claire Fontaine, Élodie Marsan'], [1, '10:30', 0, '2', 'decor', 'Table ronde innovation', 'Samia, Marc, Thomas Weber'], [1, '12:30', 1, '', 'cantine', 'Cocktail déjeunatoire', ''], [1, '14:00', 0, '3', 'decor', 'Interviews réseaux sociaux (foyer)', 'Intervenants'], [1, '17:30', 1, '', 'decor', 'Clôture, démontage', '']],
    cams: [['Face pupitre', 'Sony PXW-Z750', 'Canon 22x', 'Régie fond de salle', 'Hugo Renard'], ['Large / grue', 'Sony PXW-Z750', 'Fujinon 14x', 'Grue fond de salle', 'Julien Marchal'], ['Table ronde', 'Sony PXW-Z750', 'Canon 22x', 'Côté cour', 'Sarah Kessler'], ['PTZ salle', 'Panasonic AW-UE150', 'Zoom 20x', 'Balcon', 'Pupitre PTZ'], ['Interviews A', 'Sony FX6', 'Sony 24-105 mm', 'Foyer', 'Hugo Renard']],
    lights: [['ETC Source Four LED Series 3', 8, 'Face', 'Face scène', '', 6], ['Martin MAC Aura XB', 8, 'Contre', 'Contres & ambiance', '', 14], ['PAR LED RGBW 7×10 W', 12, 'Décor', 'Couleur Helvia (vert)', '', 8], ['Aputure LS 300x', 2, 'Face', 'Interviews', '', 2]],
    audio: [['Pupitre', 'Shure Beta 58A', 'Table / pupitre'], ['Maîtresse de cérémonie', 'Liaison HF', 'Sur la personne'], ['Intervenant 1', 'Liaison HF', 'Sur la personne'], ['Intervenant 2', 'Liaison HF', 'Sur la personne'], ['Intervenant 3', 'Liaison HF', 'Sur la personne'], ['Micro salle 1', 'Liaison HF'], ['Micro salle 2', 'Liaison HF'], ['Ordinateur slides G', 'Boîte de direct active'], ['Ordinateur slides D', 'Boîte de direct active'], ['Film d’entreprise G', 'Lecteur / playback'], ['Film d’entreprise D', 'Lecteur / playback'], ['Visio intervenant distant', 'Ligne (clavier, ordinateur)']],
    hf: [['MC Élodie', 'bodypack', 'Shure ULXD1'], ['Intervenant 1', 'bodypack', 'Shure ULXD1'], ['Intervenant 2', 'bodypack', 'Shure ULXD1'], ['Intervenant 3', 'bodypack', 'Shure ULXD1'], ['Micro salle 1', 'main', 'Shure ULXD2'], ['Micro salle 2', 'main', 'Shure ULXD2']],
    mixes: [['Retour scène', 'wedge', 'Intervenants'], ['Mix streaming', 'autre', 'Encodeur']],
    runo: [['Écran d’attente Helvia', 15, 'Attente', 'Compte à rebours + film de marque'], ['Plénière d’ouverture', 45, 'Programme', 'PGM régie salle'], ['Table ronde innovation', 60, 'Programme', 'Questions via Slido'], ['Pause — best-of 2026', 15, 'Attente', ''], ['Témoignage Thomas Weber', 30, 'Programme', ''], ['Clôture & remerciements', 10, 'Programme', '']],
    planno: [['prepa', 'Brief client & note d’intention', -45, 5, 0, 'Cheffe de projet'], ['prepa', 'Validation du devis', -35, 1, 1, 'Cheffe de projet'], ['reperage', 'Visite technique du Centre de Congrès', -28, 1, 0, 'Directeur technique'], ['prepa', 'Habillage & slides (charte Helvia)', -21, 14, 0, 'Opératrice slides & médias'], ['prepa', 'Film d’ouverture', -30, 20, 0, 'Réalisateur'], ['prepa', 'Plateforme de streaming interne', -14, 7, 0, 'Ingénieur vision / streaming'], ['tournage', 'Installation & répétitions', 0, 1, 0, ''], ['tournage', 'Convention', 1, 1, 0, ''], ['post', 'Montage best-of 3 min', 2, 4, 0, 'Monteur'], ['post', 'Pastilles réseaux sociaux', 3, 3, 0, 'Monteur'], ['livraison', 'Retours client V1', 7, 1, 1, ''], ['livraison', 'Livraison finale', 10, 1, 1, '']],
    post: { steps: [['Récupération ISO & replay', 'Ingénieur vision / streaming', 1, 2], ['Best-of 3 min', 'Monteur', 2, 6], ['Pastilles 9:16 (x6)', 'Monteur', 3, 6], ['Sous-titres incrustés', 'Monteur', 5, 6], ['Mixage', 'Ingénieur du son', 5, 6], ['Exports', 'Monteur', 9, 10]], deliv: ['web', 's916', 'master'], versions: [['V1', 'notes', 'Best-of 3 min', [['00:00:45:00', 'Ajouter le chiffre clé « +18 % » en incrustation', 'gfx', 'Nathalie Brunet'], ['00:01:50:00', 'Retirer le plan sur le stand partenaire', 'montage', 'Nathalie Brunet']]], ['V2', 'ok', 'Validée', []]] },
    vehicles: [['Utilitaire 12 m³', 'van', 3, 'Tom Lefèvre'], ['Navette intervenants', 'car', 4, 'Chloé Garnier']],
    hotel: { name: 'Hôtel Crowne Plaza Lyon Cité Internationale', addr: '22 Quai Charles de Gaulle, 69006 Lyon', phone: '04 78 17 86 86', price: '159' },
    travel: { from: 'Paris Gare de Lyon', to: 'Lyon Part-Dieu', mode: 'train', who: ['Thomas Weber', 'Élodie Marsan'] },
    eq: [['Sony PXW-Z750', 3], ['Sony FX6', 1], ['Caméra PTZ', 1], ['Grue Jimmy Jib', 1], ['Trépied Sachtler S20 (S1)', 3], ['Prompteur Autoscript', 1], ['Blackmagic ATEM Television Studio 4K8', 1], ['Blackmagic HyperDeck Studio Mini', 4], ['Encodeur streaming (Kiloview / Teradek)', 2], ['Écran LED 6 × 3 m', 1], ['Shure ULXD (kit 4)', 2], ['Console Yamaha QL1', 1], ['ETC Source Four LED Series 3', 8], ['Martin MAC Aura XB', 8]],
    fees: [['Location amphithéâtre (forfait technique)', 2, 'jour', 3800, 3000, 5000], ['Plateforme de streaming sécurisée', 1, 'forfait', 1500, 900, 2500], ['Graphisme & slides', 1, 'forfait', 2200, 1500, 3200], ['Interprétariat (anglais)', 1, 'jour', 1400, 1100, 1800]],
    syno: 'corporate', plano: 'corporate',
    mood: { intention: 'Une entreprise qui avance : sobre, lumineux, humain.', palette: ['#0A3D2E', '#2ECC71', '#F5F7F6', '#1B1F23', '#F4B400'], focales: 'Plans taille et poitrine, grue lente sur la salle.', look: 'Image neutre et claire, charte verte Helvia sur les contres.', refs: 'Apple Keynote, TEDx, Dreamforce', lieu: 'Amphithéâtre de 900 places, scène 14 × 7 m, écran LED central.' },
    spots: [['Centre de Congrès de Lyon', '50 Quai Charles de Gaulle', 'Lyon', '69006', 45.7860, 4.8530, 'decor', 'valide', 'Amphithéâtre 900 places, régie fond de salle, fibre disponible.', 5], ['Siège Helvia — hall', '12 Rue de la République', 'Lyon', '69002', 45.7630, 4.8360, 'decor', 'avoir', 'Pour les interviews de complément.', 3]],
    packs: ['p-tech', 'p-img']
};

XMP.event = {
    icon: '🎪', label: 'Événementiel / soirée de gala', title: 'Les Trophées de l’Innovation 2027', short: 'Trophées Innovation',
    client: 'Région Auvergne-Rhône-Alpes', prod: 'Productions XIII', domain: 'prodxiii.fr', nDays: 2, dayTitles: ['Montage & répétitions', 'Cérémonie & dîner de gala'],
    times: [['08:00', '09:00', '12:30', '21:00'], ['09:00', '10:00', '12:30', '01:30']],
    venue: { name: 'La Sucrière', address: '49-50 Quai Rambaud, 69002 Lyon', lat: 45.7378, lon: 4.8166, access: 'Livraisons par le quai, monte-charge 3 t. Badges à l’accueil technique.', contact: 'Régie La Sucrière', phone: '04 27 82 69 40' },
    base: { name: 'Régie vidéo & lumière', address: 'Mezzanine, La Sucrière', lat: 45.7378, lon: 4.8167, access: '' },
    park: { name: 'Parking Confluence', address: 'Quai Rambaud, 69002 Lyon', lat: 45.7385, lon: 4.8170, access: '' },
    cantine: { name: 'Repas équipe', address: 'Salle annexe, La Sucrière', lat: 45.7378, lon: 4.8166, access: 'Service 12:30 et 18:30.' },
    loges: { name: 'Loges lauréats & artistes', address: 'Niveau 1, salons privés', lat: 45.7378, lon: 4.8166, access: '' },
    hosp: { name: 'Hôpital Édouard Herriot (urgences)', address: '5 Place d’Arsonval, 69003 Lyon', phone: '08 25 08 25 69', lat: 45.7425, lon: 4.8822 },
    risks: ['hauteur', 'elec', 'levage', 'fumee', 'pyro', 'nuit'],
    crew: [['prod', 'Directrice de projet', 'Camille Martin'], ['prod', 'Directeur technique', 'Tom Lefèvre'], ['prod', 'Chargée de production', 'Manon Girard'], ['real', 'Réalisateur', 'Olivier Mercier'], ['real', 'Metteuse en scène', 'Clara Dufour'], ['real', 'Régisseuse générale de scène', 'Julie Bonnet'], ['image', 'Ingénieur de la vision', 'Yanis Morel'], ['image', 'Cadreur grue', 'Julien Marchal'], ['image', 'Cadreuse', 'Sarah Kessler'], ['image', 'Cadreur épaule', 'Tom Laurent'], ['post', 'Opérateur média serveur', 'Alice Perrin'], ['son', 'Ingénieur son façade', 'Louis Garnier'], ['son', 'Technicien HF', 'Victor Lambert'], ['elec', 'Concepteur lumière', 'Paul Girard'], ['elec', 'Pupitreur', 'Lucas Blanc'], ['regie', 'Régisseur plateau', 'Antoine Meyer'], ['regie', 'Responsable accueil', 'Léa Petit'], ['secu', 'Chef de sécurité SSIAP 3', 'Marc Vidal'], ['secu', 'Artificier', 'Franck Dupuis'], ['cantine', 'Traiteur (chef de cuisine)', 'Jean Morel']],
    cast: [['Élodie Marsan', 'Maîtresse de cérémonie', 'animateur', 'confirme', 1500, 'forfait', 'f'], ['Quatuor Lumen', 'Intermèdes musicaux', 'musicien', 'confirme', 2400, 'forfait', 'f'], ['Compagnie Aérienne', 'Numéro de tissu aérien', 'autre', 'option', 3000, 'forfait', 'f'], ['Président de Région', 'Discours d’ouverture', 'invite', 'confirme', 0, 'forfait', 'm'], ['Lauréats (6)', 'Lauréats', 'invite', 'confirme', 0, 'forfait', 'm']],
    seqs: [['1', 'INT', 'Grande nef — scène', 'Nuit', 'Ouverture : numéro aérien sur le quatuor, entrée de la maîtresse de cérémonie.', ['Compagnie Aérienne', 'Quatuor Lumen', 'Élodie Marsan'], [['PG', 'cplongee', 'grue', '14 mm', 'Grue montante sur l’artiste en tissu', 15, 'Quatuor live'], ['PM', 'face', 'steadicam', '24 mm', 'Élodie descend l’escalier de scène', 10, 'HF MC']], 0],
        ['2', 'INT', 'Grande nef — scène', 'Nuit', 'Remise des 6 trophées : film du lauréat, montée sur scène, discours.', ['Élodie Marsan', 'Lauréats (6)'], [['PL', 'face', '', '22x', 'Lauréat se lève dans la salle', 8, ''], ['PR', 'face', '', '22x', 'Discours au pupitre', 90, 'Pupitre'], ['PE', 'face', '', '14x', 'Photo officielle avec le trophée', 10, '']], 0],
        ['3', 'INT', 'Grande nef — tables', 'Nuit', 'Dîner de gala : ambiance, plans de coupe pour le film souvenir.', [], [['PM', '3q', 'epaule', '24 mm', 'Tables, toasts, rires', 10, ''], ['INS', 'face', '', '100 mm', 'Assiettes du chef', 4, '']], 0]],
    sched: [[0, '08:00', 1, '', 'decor', 'Accroches & montage des ponts (rigging)', ''], [0, '11:00', 1, '', 'decor', 'Montage scène, écran LED, lumière, son', ''], [0, '12:30', 1, '', 'cantine', 'REPAS', ''], [0, '14:00', 1, '', 'decor', 'Mise en place des tables (80 tables de 10)', ''], [0, '17:00', 0, 'R1', 'decor', 'Répétition technique : numéro aérien', 'Compagnie Aérienne'], [1, '10:00', 0, 'R2', 'decor', 'Répétition générale avec la maîtresse de cérémonie', 'Élodie Marsan, Quatuor Lumen'], [1, '12:30', 1, '', 'cantine', 'REPAS', ''], [1, '15:00', 1, '', 'decor', 'Brief sécurité & pyrotechnie', ''], [1, '18:30', 1, '', 'decor', 'Accueil des invités, cocktail', ''], [1, '20:00', 0, '1-2', 'decor', 'CÉRÉMONIE (captation + écrans salle)', 'Tous'], [1, '21:45', 0, '3', 'decor', 'Dîner de gala', ''], [1, '23:30', 1, '', 'decor', 'Soirée dansante, début du démontage vidéo', '']],
    cams: [['Grue', 'Sony HDC-3200', 'Fujinon UA14x4.5', 'Fond de salle', 'Julien Marchal'], ['Face scène', 'Sony HDC-3200', 'Canon UJ86x9.3', 'Régie', 'Sarah Kessler'], ['Steadicam', 'Sony HDC-P50', 'Fujinon HA13x4.5', 'Scène & salle', 'Tom Laurent'], ['PTZ lauréats', 'Panasonic AW-UE160', 'Zoom 20x', 'Balcon jardin', 'Pupitre PTZ'], ['PTZ pupitre', 'Panasonic AW-UE160', 'Zoom 20x', 'Balcon cour', 'Pupitre PTZ']],
    lights: [['Robe MegaPointe', 16, 'Pont', 'Faisceaux', '', 39], ['Robe Spiider', 12, 'Contre', 'Wash', '', 30], ['Ayrton Diablo (poursuite auto)', 2, 'Face', 'Poursuite MC et lauréats', '', 32], ['ETC Source Four 750 W', 10, 'Face', 'Face scène & pupitre', '1/2 CTO', 1], ['PAR LED RGBW 7×10 W', 40, 'Public', 'Ambiance tables', '', 8], ['Astera AX1 Pixel Tube', 24, 'Décor', 'Colonnes lumineuses', '', 16], ['Machine à brouillard (hazer)', 2, 'Effets', 'Hazer', '', 2], ['Jets d’étincelles froides', 4, 'Effets', 'Entrée lauréats', '', 1]],
    audio: [['MC Élodie', 'Liaison HF', 'Sur la personne'], ['Pupitre', 'Shure Beta 58A', 'Table / pupitre'], ['Micro main lauréat 1', 'Liaison HF'], ['Micro main lauréat 2', 'Liaison HF'], ['Violon 1', 'DPA d:screet 6060'], ['Violon 2', 'DPA d:screet 6060'], ['Alto', 'DPA d:screet 6060'], ['Violoncelle', 'DPA d:screet 6060'], ['Médias serveur G', 'Lecteur / playback'], ['Médias serveur D', 'Lecteur / playback'], ['Ambiance salle', 'Neumann KM 184', 'Grand pied perche']],
    hf: [['MC', 'bodypack', 'Shure Axient AD1'], ['Lauréat 1', 'main', 'Shure Axient AD2'], ['Lauréat 2', 'main', 'Shure Axient AD2'], ['Quatuor (4 émetteurs)', 'bodypack', 'Shure ULXD1'], ['Oreillette MC', 'iem', 'Shure PSM 1000'], ['Steadicam', 'camlink', 'Autre']],
    mixes: [['Retour quatuor', 'wedge', 'Quatuor Lumen'], ['Oreillette MC', 'iem', 'Élodie Marsan']],
    runo: [['Écran d’attente', 10, 'Attente', ''], ['Tapis rouge : arrivées', 20, 'Tapis rouge', 'Caméra épaule + interviews'], ['Cérémonie en direct', 90, 'Programme', ''], ['Réactions des lauréats', 15, 'Backstage', '']],
    planno: [['prepa', 'Conception & scénographie', -60, 20, 0, 'Metteuse en scène'], ['prepa', 'Validation budget client', -45, 1, 1, 'Directrice de projet'], ['reperage', 'Visite technique La Sucrière', -40, 1, 0, 'Directeur technique'], ['prepa', 'Films des lauréats (6 × 1 min)', -35, 20, 0, 'Réalisateur'], ['casting', 'Artistes & maîtresse de cérémonie', -40, 15, 0, 'Chargée de production'], ['prepa', 'Dossier sécurité préfecture', -30, 10, 0, 'Chef de sécurité SSIAP 3'], ['prepa', 'Plan de tables & invitations', -21, 14, 0, 'Responsable accueil'], ['tournage', 'Montage & répétitions', 0, 1, 0, ''], ['tournage', 'Cérémonie', 1, 1, 0, ''], ['post', 'Film souvenir 4 min', 3, 6, 0, 'Monteur'], ['livraison', 'Livraison film & photos', 10, 1, 1, '']],
    post: { steps: [['Récupération ISO', 'Ingénieur de la vision', 1, 2], ['Film souvenir 4 min', 'Monteur', 3, 8], ['Pastilles lauréats 9:16', 'Monteur', 4, 8], ['Mixage', 'Ingénieur son façade', 8, 9], ['Exports', 'Monteur', 9, 10]], deliv: ['web', 's916', 'master'], versions: [['V1', 'notes', 'Film souvenir', [['00:01:10:00', 'Mettre le discours du Président plus tôt', 'montage', 'Camille Martin']]]] },
    vehicles: [['Semi-remorque lumière & structure', 'truck', 2, 'Didier Fontaine'], ['Porteur 20 m³ vidéo', 'truck', 3, 'Yanis Morel'], ['Navette VIP', 'car', 4, 'Léa Petit']],
    hotel: { name: 'Hôtel Mob Lyon Confluence', addr: '55 Quai Rambaud, 69002 Lyon', phone: '04 58 55 55 88', price: '139' },
    travel: { from: 'Paris Gare de Lyon', to: 'Lyon Part-Dieu', mode: 'train', who: ['Élodie Marsan', 'Quatuor Lumen', 'Compagnie Aérienne'] },
    eq: [['Sony HDC-3500', 2], ['Sony HDC-P50', 1], ['Caméra PTZ', 2], ['Grue Jimmy Jib', 1], ['Blackmagic ATEM Constellation 4K', 1], ['Média serveur disguise', 1], ['Écran LED 10 × 4 m', 1], ['Robe MegaPointe', 16], ['Robe Spiider', 12], ['Console grandMA3 light', 1], ['L-Acoustics Kara (système)', 1], ['Console DiGiCo SD12', 1], ['Shure Axient AD2', 2], ['Truss carré 40 cm (12 m)', 6], ['Moteur 1 t', 12]],
    fees: [['Location La Sucrière', 2, 'jour', 9000, 7000, 12000], ['Traiteur (dîner 800 couverts)', 800, 'couvert', 85, 65, 120], ['Trophées (fabrication)', 6, 'unité', 350, 250, 500], ['Agents de sécurité', 12, 'vacation', 280, 230, 340], ['Photographe', 1, 'jour', 900, 700, 1300]],
    syno: 'event', plano: 'event',
    mood: { intention: 'Célébrer l’audace : une nef industrielle transformée en écrin de lumière.', palette: ['#0D0D0D', '#C9A227', '#F2F2F2', '#6A1B9A', '#00BCD4'], focales: 'Grue large pour l’espace, longues focales sur les émotions des lauréats.', look: 'Or et noir, faisceaux dans la brume, peaux chaudes.', refs: 'Cérémonie des César, Victoires de la Musique, Met Gala', lieu: 'Ancienne nef industrielle de 1 700 m², dîner de 800 couverts.' },
    spots: [['La Sucrière', '49-50 Quai Rambaud', 'Lyon', '69002', 45.7378, 4.8166, 'decor', 'valide', 'Nef 1 700 m², 22 points d’accroche de 1 t, cuisine traiteur.', 5], ['Musée des Confluences', '86 Quai Perrache', 'Lyon', '69002', 45.7327, 4.8183, 'decor', 'option', 'Alternative, jauge 600.', 4]],
    packs: ['p-tech', 'p-art', 'p-img']
};

XMP.artistique = {
    icon: '🎨', label: 'Projet artistique / performance', title: 'MÉTAMORPHOSES — performance danse & vidéo', short: 'Métamorphoses',
    client: 'Biennale de la Danse — Les Subsistances', prod: 'Compagnie XIII', domain: 'compagniexiii.fr', nDays: 3, dayTitles: ['Installation & mapping', 'Répétition générale', 'Représentation & captation'],
    times: [['09:00', '10:00', '13:00', '22:00'], ['10:00', '14:00', '13:00', '23:00'], ['12:00', '15:00', '13:00', '23:30']],
    venue: { name: 'Les Subsistances — Verrière', address: '8 bis Quai Saint-Vincent, 69001 Lyon', lat: 45.7698, lon: 4.8162, access: 'Accès décor par le portail quai Saint-Vincent, hauteur 3,8 m.', contact: 'Régie générale des Subs', phone: '04 78 39 10 02' },
    base: { name: 'Régie vidéo & son', address: 'Passerelle haute de la Verrière', lat: 45.7698, lon: 4.8163, access: '' },
    park: { name: 'Parking quai Saint-Vincent', address: 'Quai Saint-Vincent, 69001 Lyon', lat: 45.7695, lon: 4.8170, access: '' },
    cantine: { name: 'Cantine des Subs', address: 'Bâtiment Est', lat: 45.7699, lon: 4.8160, access: '' },
    loges: { name: 'Loges danseurs', address: 'Bâtiment Ouest, 1er étage', lat: 45.7697, lon: 4.8159, access: '' },
    hosp: { name: 'Hôpital de la Croix-Rousse (urgences)', address: '103 Grande Rue de la Croix-Rousse, 69004 Lyon', phone: '04 26 73 25 00', lat: 45.7822, lon: 4.8237 },
    risks: ['hauteur', 'fumee', 'elec', 'nuit'],
    crew: [['prod', 'Administratrice de production', 'Camille Martin'], ['real', 'Chorégraphe', 'Naïma Ferhat'], ['real', 'Artiste vidéaste / réalisateur', 'Adrien Vasseur'], ['real', 'Assistante chorégraphie', 'Pauline Marchand'], ['image', 'Chef opérateur captation', 'Thomas Moreau'], ['image', 'Cadreuse steadicam', 'Nora Diallo'], ['image', 'Cadreur', 'Hugo Renard'], ['post', 'Vidéaste mapping (média serveur)', 'Alice Perrin'], ['son', 'Créateur sonore', 'Louis Garnier'], ['elec', 'Créatrice lumière', 'Margaux Leclerc'], ['regie', 'Régisseur général', 'Antoine Meyer'], ['cost', 'Costumière', 'Agathe Simon']],
    cast: [['Kenza Amrani', 'Danseuse soliste', 'comedien', 'confirme', 220, 'jour', 'f'], ['Léo Marchetti', 'Danseur', 'comedien', 'confirme', 200, 'jour', 'm'], ['Aya Nakamura-Roux', 'Danseuse', 'comedien', 'confirme', 200, 'jour', 'f'], ['Malik Diop', 'Danseur', 'comedien', 'confirme', 200, 'jour', 'm'], ['Ensemble amateur (10)', 'Chœur dansé', 'figurant', 'confirme', 0, 'forfait', 'f']],
    seqs: [['1', 'INT', 'Verrière — plateau', 'Nuit', 'Éclosion : Kenza émerge d’une toile projetée, la vidéo révèle sa silhouette.', ['Kenza Amrani'], [['PG', 'face', '', '24 mm', 'Plan fixe large : la toile et le mapping', 30, 'Création sonore'], ['PM', '3q', 'steadicam', '35 mm', 'Steadicam autour de Kenza', 40, ''], ['TGP', 'face', '', '85 mm', 'Mains et texture projetée', 10, '']], 2],
        ['2', 'INT', 'Verrière — plateau', 'Nuit', 'Mue : quatuor au sol, les corps se fondent dans les motifs vidéo.', ['Kenza Amrani', 'Léo Marchetti', 'Aya Nakamura-Roux', 'Malik Diop'], [['PG', 'zenith', '', '14 mm', 'Caméra zénithale : motifs au sol', 60, ''], ['PM', 'face', 'steadicam', '24 mm', 'Traversée du quatuor', 40, '']], 2],
        ['3', 'INT', 'Verrière — plateau', 'Nuit', 'Envol : l’ensemble amateur entoure les danseurs, final en lumière blanche.', ['Ensemble amateur (10)', 'Kenza Amrani'], [['PG', 'plongee', 'grue', '18 mm', 'Grue au-dessus du cercle', 30, ''], ['GP', 'face', '', '85 mm', 'Visage de Kenza, lumière blanche', 10, '']], 2]],
    sched: [[0, '09:00', 1, '', 'decor', 'Déchargement, montage tapis de danse et toiles', ''], [0, '13:00', 1, '', 'cantine', 'REPAS', ''], [0, '14:00', 1, '', 'decor', 'Calage vidéoprojecteurs & mapping', ''], [0, '19:00', 1, '', 'decor', 'Encodage lumière', ''], [1, '10:00', 1, '', 'decor', 'Échauffement & raccords chorégraphiques', 'Danseurs'], [1, '14:00', 0, 'R', 'decor', 'Répétition avec vidéo et son', 'Danseurs'], [1, '20:00', 0, 'G', 'decor', 'Générale (captation de sécurité)', 'Tous'], [2, '15:00', 1, '', 'decor', 'Raccords et installation caméras', ''], [2, '19:00', 1, '', 'cantine', 'REPAS', ''], [2, '20:30', 0, '1-3', 'decor', 'REPRÉSENTATION — captation 4 caméras', 'Tous'], [2, '22:00', 1, '', 'decor', 'Bord de scène & démontage', '']],
    cams: [['Large fixe', 'Sony FX9', 'Sony FE 16-35 mm', 'Gradin centre', ''], ['Steadicam', 'Sony FX6', 'Sony FE 24 mm GM', 'Plateau', 'Nora Diallo'], ['Serré', 'Sony FX9', 'Canon CN7x17', 'Gradin cour', 'Hugo Renard'], ['Zénithale', 'Blackmagic Micro Studio 4K', 'Laowa 7,5 mm', 'Grill', '']],
    lights: [['Contre LED (Ayrton Perseo)', 8, 'Contre', 'Contres découpés', '', 39], ['Douche HMI 2,5 kW', 2, 'Pont', 'Douches blanches final', '', 1], ['Découpe ETC Source Four 750 W', 10, 'Latérales', 'Latérales danse (pendrillons)', 'CTB', 1], ['Astera AX1 Pixel Tube', 12, 'Sol', 'Rampes au sol', '', 16], ['Machine à brouillard (hazer)', 2, 'Effets', 'Hazer', '', 2]],
    audio: [['Création sonore G', 'Lecteur / playback'], ['Création sonore D', 'Lecteur / playback'], ['Sub', 'Lecteur / playback'], ['Ambiance plateau G', 'DPA 4099'], ['Ambiance plateau D', 'DPA 4099'], ['Respiration Kenza (HF)', 'Liaison HF', 'Sur la personne']],
    hf: [['Kenza', 'bodypack', 'Shure Axient AD1']],
    mixes: [['Retours plateau', 'wedge', 'Danseurs']],
    runo: [['Écran d’attente', 10, 'Attente', ''], ['Rencontre avec Naïma Ferhat', 15, 'Plateau', ''], ['Représentation en direct', 55, 'Programme', ''], ['Bord de scène', 15, 'Plateau', 'Questions du chat']],
    planno: [['prepa', 'Écriture & résidence de création', -90, 30, 0, 'Chorégraphe'], ['prepa', 'Création vidéo & mapping', -50, 30, 0, 'Vidéaste mapping (média serveur)'], ['casting', 'Audition ensemble amateur', -40, 2, 0, 'Assistante chorégraphie'], ['prepa', 'Création sonore', -40, 25, 0, 'Créateur sonore'], ['reperage', 'Visite technique de la Verrière', -30, 1, 0, 'Régisseur général'], ['prepa', 'Costumes', -30, 20, 0, 'Costumière'], ['tournage', 'Installation', 0, 1, 0, ''], ['tournage', 'Générale', 1, 1, 0, ''], ['tournage', 'Représentation & captation', 2, 1, 0, ''], ['post', 'Montage captation intégrale', 4, 10, 0, 'Artiste vidéaste / réalisateur'], ['post', 'Teaser 1 min', 4, 3, 0, 'Artiste vidéaste / réalisateur'], ['livraison', 'Livraison captation & teaser', 15, 1, 1, '']],
    post: { steps: [['Synchro multicam', 'Monteur', 1, 3], ['Montage captation intégrale', 'Artiste vidéaste / réalisateur', 3, 12], ['Teaser 1 min', 'Artiste vidéaste / réalisateur', 3, 6], ['Mixage', 'Créateur sonore', 11, 13], ['Étalonnage', 'Étalonneur', 12, 14], ['Exports', 'Monteur', 14, 15]], deliv: ['web', 's916', 'master'], versions: [['V1', 'notes', 'Captation intégrale', [['00:12:00:00', 'Rester sur la zénithale pendant tout le quatuor', 'montage', 'Naïma Ferhat']]]] },
    vehicles: [['Utilitaire décor', 'van', 3, 'Antoine Meyer']],
    hotel: { name: 'Hôtel Le Royal Lyon', addr: '20 Place Bellecour, 69002 Lyon', phone: '04 78 37 57 31', price: '120' },
    travel: { from: 'Marseille Saint-Charles', to: 'Lyon Part-Dieu', mode: 'train', who: ['Kenza Amrani', 'Léo Marchetti', 'Aya Nakamura-Roux', 'Malik Diop'] },
    eq: [['Sony FX9', 2], ['Sony FX6', 1], ['Blackmagic Micro Studio Camera 4K', 1], ['DJI Ronin 2', 1], ['Blackmagic ATEM Mini Extreme ISO', 1], ['Vidéoprojecteur 20 000 lm', 3], ['Média serveur Resolume Arena', 1], ['Tapis de danse (12 × 10 m)', 1], ['Ayrton Perseo', 8], ['Astera AX1 Pixel Tube', 12], ['Console Allen & Heath SQ6', 1]],
    fees: [['Droits création sonore', 1, 'forfait', 1500, 1000, 2500], ['Costumes', 1, 'forfait', 2200, 1500, 3000], ['Défraiements danseurs', 4, 'forfait', 300, 200, 400]],
    syno: 'artistique', plano: 'artistique',
    mood: { intention: 'Le corps en transformation : la vidéo comme une seconde peau.', palette: ['#050505', '#E0E0E0', '#7C4DFF', '#18FFFF', '#FF6E40'], focales: 'Large fixe pour la composition, steadicam au plus près des corps, zénithale pour les motifs.', look: 'Noir profond, peau en clair-obscur, couleurs uniquement dans la vidéo projetée.', refs: 'Pina (Wim Wenders), Adrien M & Claire B, Hofesh Shechter', lieu: 'Verrière de 20 × 15 m, gradin de 200 places, toiles tendues sur 3 côtés.' },
    spots: [['Les Subsistances — Verrière', '8 bis Quai Saint-Vincent', 'Lyon', '69001', 45.7698, 4.8162, 'decor', 'valide', 'Verrière 300 m², noir possible le soir, grill 9 m.', 5]],
    packs: ['p-tech', 'p-art', 'p-img']
};
// ---------------------------------------------------------------------
//  XMODELS — cœur : contexte du projet (fiche + profil du type), outils communs
// ---------------------------------------------------------------------
const XM_KEYS = { planno: 'plannoXIII.project', deviso: 'devisoXIII.project', callsheeto: 'callsheetoXIII.project', conduco: 'conducoXIII.project', plano: 'planoXIII.project', syno: 'synoptique_projects', lumo: 'lumoXIII.project', sono: 'sonoXIII.project', packingo: 'packingoXIII.project', posto: 'postoXIII.project', casto: 'castoXIII.project', decoup: 'decoupXIII.project', transporto: 'transportoXIII.project', runo: 'runoXIII.project', ressourco: 'ressourcoXIII.project', repero: 'reperoXIII.project', storyboardo: 'storyboardoXIII.project', moodo: 'moodoXIII.project', scripto: 'scriptoXIII.project' };
const XM_NAMES = { planno: '🗓️ PLANNO', deviso: '💶 DEVISO', callsheeto: '📋 CALL SHEETO', conduco: '🎬 CONDUCO', plano: '📐 PLANO', syno: '🔌 SYNO', lumo: '💡 LUMO', sono: '🎚️ SONO', packingo: '📦 PACKINGO', posto: '🎞️ POSTO', casto: '🎭 CASTO', decoup: '✂️ DECOUP', transporto: '🚐 TRANSPORTO', runo: '🔴 RUNO', ressourco: '📝 RESSOURCO', repero: '📍 REPERO', storyboardo: '🖍️ STORYBOARDO', moodo: '🎨 MOODO', scripto: '✍️ SCRIPTO' };
const XM_ORDER = ['planno', 'casto', 'callsheeto', 'transporto', 'deviso', 'packingo', 'syno', 'plano', 'lumo', 'sono', 'conduco', 'runo', 'decoup', 'scripto', 'storyboardo', 'moodo', 'repero', 'ressourco', 'posto'];
const XM_TYPES = ['live', 'tv', 'fiction', 'doc', 'pub', 'corporate', 'event', 'artistique'];
const xmJ = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const xmUid = () => Math.random().toString(36).slice(2, 10);
const xmPad = n => String(n).padStart(2, '0');
const xmIso = d => d.getFullYear() + '-' + xmPad(d.getMonth() + 1) + '-' + xmPad(d.getDate());
const xmParse = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const xmAdd = (s, n) => { const d = xmParse(s) || new Date(); d.setDate(d.getDate() + n); return xmIso(d); };
const xmFold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const xmEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const xmHash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const xmPhone = s => { const h = xmHash(s); return '06 ' + [0, 1, 2, 3].map(i => xmPad(((h >>> (i * 7)) % 90) + 10)).join(' '); };
const xmMail = (s, dom) => { const p = xmFold(s).replace(/[^a-z\s-]/g, '').trim().split(/\s+/); return p.length > 1 ? p[0] + '.' + p.slice(1).join('') + '@' + dom : p[0] + '@' + dom; };
const xmHm = (h, add) => { const m = /^(\d{1,2}):(\d{2})/.exec(h || ''); if (!m) return h || ''; let t = +m[1] * 60 + +m[2] + (add || 0); t = ((t % 1440) + 1440) % 1440; return xmPad(Math.floor(t / 60)) + ':' + xmPad(t % 60); };
const xmToday = () => xmIso(new Date());
const xmHav = (a, b, c, d) => { const R = 6371, r = x => x * Math.PI / 180, dl = r(c - a), dn = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10; };
const xmPlate = s => { const h = xmHash(s), L = 'ABCDEFGHJKLMNPQRSTVWXYZ', l = i => L[(h >>> i) % L.length]; return l(0) + l(5) + '-' + (100 + h % 900) + '-' + l(10) + l(15); };

function xmFiche() { const s = xmJ('xiii.projets', null); if (!s || !Array.isArray(s.list)) return null; return s.list.find(x => x && x.id === s.active) || null; }
function xmTypeOfFiche(f) {
    f = f || xmFiche() || {}; if (f.ptype && XMP[f.ptype]) return f.ptype;
    const g = f.genre || ''; return g === 'live' ? 'live' : g === 'tv' ? 'tv' : g === 'doc' ? 'doc' : g === 'pub' ? 'pub' : g === 'corporate' ? 'corporate' : g === 'event' ? 'event' : g === 'fiction' ? 'fiction' : g === 'autre' ? 'artistique' : '';
}
// jours de tournage : fiche (début → fin) sinon dans ~5 semaines
function xmDays(p, f) {
    const wk = d => { const x = xmParse(d).getDay(); return x !== 0 && x !== 6; };
    let out = [];
    if (f.debut && xmParse(f.debut)) {
        const end = f.fin && xmParse(f.fin) && f.fin >= f.debut ? f.fin : f.debut;
        for (let d = f.debut, i = 0; d <= end && i < 60; d = xmAdd(d, 1), i++) if (!p.weekdays || wk(d)) out.push(d);
        if (!out.length) out = [f.debut];
        if (!f.fin || f.fin === f.debut) { let d = out[out.length - 1]; while (out.length < p.nDays) { d = xmAdd(d, 1); if (!p.weekdays || wk(d)) out.push(d); } }
        return out;
    }
    let d = xmAdd(xmToday(), 35); while (xmParse(d).getDay() !== 1) d = xmAdd(d, 1);
    if (/live|event|artistique/.test(p.key)) { while (xmParse(d).getDay() !== 4) d = xmAdd(d, 1); }
    while (out.length < p.nDays) { if (!p.weekdays || wk(d)) out.push(d); d = xmAdd(d, 1); }
    return out;
}
// contexte complet : profil du type adapté au projet actif (titre, dates, lieu, équipe)
function xmCtx(type) {
    const p0 = XMP[type] || (type === 'scen' ? (() => { try { return JSON.parse(localStorage.getItem('xiii.scen.profile')); } catch (e) { return null; } })() : null); if (!p0) throw new Error('Type inconnu : ' + type); // « scen » : profil construit depuis un scénario (📄 XSCEN)
    const p = Object.assign({ key: type }, p0), f = xmFiche() || {};
    const ren = {};
    const roleName = rx => { const m = p.crew.find(c => rx.test(xmFold(c[1]))); return m ? m[2] : null; };
    const r1 = roleName(/^realisat|^chorégraphe|^choregraphe/), r2 = roleName(/^product|^directri?c?e? de projet|cheffe de projet|administratrice/);
    if (f.realisation && r1) ren[r1] = f.realisation; if (f.producteur && r2) ren[r2] = f.producteur;
    const N = n => ren[n] || n;
    const days = xmDays(p, f);
    const C = { type, p, f, N, days, title: f.title || p.title, short: f.title || p.short, client: f.client || p.client, prod: f.production || p.prod, domain: p.domain };
    C.day = i => days[Math.max(0, Math.min(i, days.length - 1))];
    C.first = days[0]; C.last = days[days.length - 1];
    C.dayOfSeq = s => Math.min(s[7] || 0, days.length - 1);
    const pl = o => o ? Object.assign({}, o) : null;
    C.venue = pl(p.venue); if (f.lieu || f.adresse) { const same = !f.adresse || xmFold(f.adresse) === xmFold(p.venue.address); C.venue.name = f.lieu || C.venue.name; if (!same) { C.venue.address = f.adresse; C.venue.lat = f.lat || null; C.venue.lon = f.lon || null; } if (f.acces) C.venue.access = f.acces; }
    C.base = pl(p.base); C.park = pl(p.park); C.cantine = pl(p.cantine); C.loges = pl(p.loges); C.hosp = pl(p.hosp);
    C.crew = p.crew.map(([dept, role, name]) => ({ dept, role, name: N(name), phone: xmPhone(N(name)), email: xmMail(N(name), p.domain) }));
    // équipe saisie dans la fiche projet : prioritaire sur les mêmes rôles
    (f.team || []).filter(m => m && m.name && m.role).forEach(m => { const c = C.crew.find(x => xmFold(x.role) === xmFold(m.role)); if (c) { ren[c.name] = m.name; Object.assign(c, { name: m.name, phone: m.phone || c.phone, email: m.email || c.email }); } else C.crew.push({ dept: m.dept || 'autre', role: m.role, name: m.name, phone: m.phone || xmPhone(m.name), email: m.email || '' }); });
    const AG = [['Agents Associés', '01 44 55 66 77'], ['Artmedia', '01 43 17 33 00'], ['Agence Adequat', '01 42 33 44 55'], ['Time Art', '01 45 61 22 33']];
    C.cast = p.cast.map(([name, role, kind, status, cachet, cachetType, g]) => { const a = AG[xmHash(name) % AG.length]; return { name, role, kind, status, cachet, cachetType, g, phone: xmPhone(name), email: /\(|^les |^public|^lauréats|^ensemble|^mains|^figurants|^quatuor|^compagnie/i.test(name) ? '' : xmMail(name, 'mail.fr'), agent: kind === 'comedien' || kind === 'enfant' ? a[0] : '', agentPhone: kind === 'comedien' || kind === 'enfant' ? a[1] : '' }; });
    if (type === 'scen') { C.cast.forEach(c => Object.assign(c, { phone: '', email: '', agent: '', agentPhone: '' })); C.crew.forEach(c => { if (!(f.team || []).some(m => m && m.name === c.name)) Object.assign(c, { phone: '', email: '' }); }); } // scénario importé : pas de coordonnées inventées
    C.who = re => { const rx = re instanceof RegExp ? re : new RegExp(xmFold(re).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); return C.crew.find(c => rx.test(xmFold(c.role))) || null; };
    C.whoName = role => { if (!role) return ''; const c = C.crew.find(x => xmFold(x.role) === xmFold(role)) || C.who(role); return c ? c.name : role; };
    C.castOf = ch => C.cast.find(c => xmFold(c.name) === xmFold(ch) || xmFold(c.role) === xmFold(ch) || xmFold(c.role).split(/[ ,—(]/)[0] === xmFold(ch)) || null;
    C.seqs = p.seqs.map(s => ({ num: s[0], ie: s[1], decor: s[2], effet: s[3], summary: s[4], chars: s[5], plans: s[6].map((x, k) => ({ k: k + 1, valeur: x[0], angle: x[1], mvt: x[2], focale: x[3], desc: x[4], dur: x[5], son: x[6] || '' })), day: Math.min(s[7] || 0, days.length - 1) }));
    C.heading = s => (s.ie ? s.ie + '. ' : '') + s.decor + (s.effet ? ' — ' + s.effet : '');
    C.spotOf = decor => { const k = xmFold(decor).split(' — ')[0]; return (p.spots || []).find(s => xmFold(s[0]).indexOf(k) >= 0 || k.indexOf(xmFold(s[0]).split(' — ')[0]) >= 0) || null; };
    C.director = C.whoName((p.crew.find(c => /^r[ée]alisat|^chor/.test(xmFold(c[1]))) || [])[1]);
    C.producer = C.whoName((p.crew.find(c => /^product|direct.* de projet|cheffe de projet|administratrice/.test(xmFold(c[1]))) || [])[1]);
    C.regisseur = C.who(/regisseu|directeur technique|directeur de production/) || C.crew[0];
    C.times = i => (p.times && (p.times[i] || p.times[p.times.length - 1])) || ['08:00', '09:00', '13:00', '19:00'];
    C.status = (s, e) => { const t = xmToday(); return e && e < t ? 'done' : s && s <= t ? 'wip' : 'todo'; };
    // feuille de service : programmée (sched) ou déduite des séquences
    C.sched = i => {
        if (p.sched) return p.sched.filter(x => Math.min(x[0], days.length - 1) === i).map(x => ({ time: x[1], ev: !!x[2], seq: x[3], loc: x[4], desc: x[5], roles: x[6] }));
        const T = C.times(i), L = C.seqs.filter(s => s.day === i), out = [{ time: T[0], ev: true, loc: 'cantine', desc: 'Convocation — petit-déjeuner à la cantine' }];
        let t = T[1], lunch = false;
        L.forEach(s => { if (!lunch && T[2] && t >= T[2] && t < '23:00') { out.push({ time: T[2], ev: true, loc: 'cantine', desc: 'REPAS' }); t = xmHm(T[2], 60); lunch = true; } out.push({ time: t, ev: false, seq: s.num, ie: s.ie + ' / ' + (s.effet || 'JOUR').toUpperCase(), loc: 'decor:' + s.decor, desc: s.summary, roles: s.chars.join(', '), pages: Math.max(1, Math.round(s.plans.length / 2)) + '/8' }); t = xmHm(t, Math.max(60, s.plans.length * 45)); });
        if (!lunch && T[2]) out.push({ time: T[2], ev: true, loc: 'cantine', desc: 'REPAS' });
        out.push({ time: T[3], ev: true, loc: 'base', desc: 'Fin de journée prévue — rangement, retour des HF à la régie son' });
        return out.sort((a, b) => (a.time < '05:00' ? '2' : '1') + a.time < (b.time < '05:00' ? '2' : '1') + b.time ? -1 : 1);
    };
    return C;
}
// codes communs (storyboard ⇄ conducteur / découpage)
const XM_MV = { '': 'Fixe', pano: 'Pano gauche-droite', tilt: 'Tilt haut', trav_av: 'Travelling avant', trav_ar: 'Travelling arrière', trav_lat: 'Travelling latéral', zoom_in: 'Zoom avant', zoom_out: 'Zoom arrière', steadicam: 'Steadicam suivi', epaule: 'Épaule libre', grue: 'Grue montée', drone: 'Grue balayage', suivi: 'Steadicam suivi' };
const XM_MVTAG = { '': 'Fixe', pano: 'Panoramique', tilt: 'Panoramique', trav_av: 'Travelling', trav_ar: 'Travelling', trav_lat: 'Travelling', zoom_in: 'Zoom', zoom_out: 'Zoom', steadicam: 'Steadicam', epaule: 'Épaule', grue: 'Grue', drone: 'Drone', suivi: 'Steadicam' };
const XM_PLAN = v => ({ OTS: 'AMO', POV: 'SUBJ', PUB: 'PUB' }[v] || v);
// ---------------------------------------------------------------------
//  XMODELS — adaptateurs (1) : chaque fonction tourne DANS son outil et renvoie les données à enregistrer
// ---------------------------------------------------------------------
const XMA = {};

XMA.planno = C => {
    const p = C.p, tasks = [];
    p.planno.forEach(([ph, name, off, len, ms, role]) => {
        let st, en;
        if (ph === 'tournage') { st = C.day(off); en = C.day(off + Math.max(1, len) - 1); }
        else if (off < 0) { st = xmAdd(C.first, off); en = ms ? st : xmAdd(st, Math.max(1, len) - 1); }
        else { st = xmAdd(C.last, off); en = ms ? st : xmAdd(st, Math.max(1, len) - 1); }
        const w = role ? C.crew.filter(c => xmFold(c.role) === xmFold(role) || xmFold(c.role).indexOf(xmFold(role)) === 0).slice(0, 2).map(c => c.name + ' — ' + c.role) : [];
        if (role && !w.length) w.push(role);
        tasks.push({ id: xmUid(), name, phase: ph, start: st, end: en, who: w, status: C.status(st, en), ms: !!ms });
    });
    if (!tasks.some(t => t.phase === 'tournage')) tasks.push({ id: xmUid(), name: 'Tournage', phase: 'tournage', start: C.first, end: C.last, who: [], status: C.status(C.first, C.last) });
    // jours de tournage détaillés (titres des journées)
    if (C.days.length > 1 && (C.p.dayTitles || []).length) C.days.forEach((d, i) => { if (!tasks.some(t => t.phase === 'tournage' && t.start === d && t.end === d)) tasks.push({ id: xmUid(), name: 'J' + (i + 1) + ' — ' + (C.p.dayTitles[i] || ''), phase: 'tournage', start: d, end: d, who: [], status: C.status(d, d), ms: false, src: 'xm-j' + i }); });
    return { app: 'PLANNO XIII', v: 1, name: C.title, tasks, updated: Date.now() };
};

XMA.lumo = C => {
    const POS = typeof POSITIONS !== 'undefined' ? POSITIONS : ['Face', 'Contre', 'Pont', 'Sol', 'Décor', 'Public', 'Effets'];
    const pos = s => { const f = xmFold(s); return POS.find(x => xmFold(x) === f) || POS.find(x => xmFold(x).indexOf(f.split(' ')[0]) === 0) || (/lat/.test(f) ? 'Latéraux jardin' : /fenetre|exter|rue/.test(f) ? 'Décor' : /plafond|grill/.test(f) ? 'Pont' : 'Décor'); };
    const GEL = { 'ctb': 'L201', '1/2 cto': 'L205', 'cto': 'L204', 'magenta': 'L128', 'ambre': 'L105', 'rouge': 'L106' };
    const W = n => { const f = xmFold(n), m = typeof FX !== 'undefined' ? FX.find(x => xmFold(x[0]) === f) : null; if (m) return m[1];
        return /m90|9 kw/.test(f) ? 9000 : /m18|1 800/.test(f) ? 1800 : /2,5 kw/.test(f) ? 2500 : /2 kw/.test(f) ? 2000 : /1 kw/.test(f) ? 1000 : /750/.test(f) ? 750 : /650/.test(f) ? 650 : /s360/.test(f) ? 1500 : /s60|skypanel/.test(f) ? 450 : /megapointe/.test(f) ? 470 : /spiider/.test(f) ? 800 : /aura/.test(f) ? 350 : /tube/.test(f) ? 48 : /par led/.test(f) ? 70 : /strobo|jdc/.test(f) ? 1500 : /brouillard|hazer/.test(f) ? 1500 : /diablo|perseo/.test(f) ? 450 : /orbiter/.test(f) ? 500 : /kino|celeb|freestyle/.test(f) ? 250 : /600/.test(f) ? 720 : /300/.test(f) ? 350 : /co2|etincel/.test(f) ? 300 : /ballon/.test(f) ? 1000 : /source four led/.test(f) ? 200 : 500; };
    let univ = 1, addr = 1, n = 0; const fx = [];
    C.p.lights.forEach(([name, qty, p, use, gel, ch], i) => {
        ch = +ch || 0; if (ch && addr + ch * qty - 1 > 512) { univ++; addr = 1; }
        fx.push({ id: xmUid(), code: 'P' + (++n), name, qty, use, pos: pos(p), gel: GEL[xmFold(gel)] || '', w: W(name), ch: ch || '', univ: String(univ), addr: ch ? addr : '', circ: W(name) >= 1000 ? 'C' + (i + 1) : 'D' + (Math.floor(i / 2) + 1), phase: ['L1', 'L2', 'L3'][i % 3] });
        if (ch) addr += ch * qty;
    });
    const big = fx.reduce((a, f) => a + f.w * f.qty, 0) > 30000;
    return { app: 'LUMO XIII', v: 1, name: C.title, fx, set: { supply: big ? 'tri125' : 'tri63', circ: 16, volt: 230 }, updated: Date.now() };
};

XMA.sono = C => {
    const PH = /km 184|u 87|c414|ksm|nt5|4099|kms|condens|neumann|akg c|dpa/i;
    const ch = C.p.audio.map(([src, mic, stand], i) => ({ id: xmUid(), src, mic: mic || '', stand: stand || '', sb: 'SB' + (1 + Math.floor(i / 16)) + '-' + xmPad(i % 16 + 1), ph: PH.test(mic || ''), hf: '', grp: '', note: '' }));
    const hf = C.p.hf.map(([name, t, model], i) => ({ id: xmUid(), name, t, model, f: '', lo: '', hi: '', grp: t === 'iem' ? 'Ears' : t === 'camlink' ? 'Caméras' : 'Micros', note: '' }));
    // liaison voie ⇄ émetteur HF par le nom
    ch.filter(c => /liaison hf/i.test(c.mic)).forEach(c => { const k = xmFold(c.src).replace(/^(voix|hf|micro main|micro)\s*/, '').split(/[ (]/)[0]; const h = hf.find(h => !ch.some(x => x.hf === h.id) && h.t !== 'iem' && h.t !== 'camlink' && (xmFold(h.name).indexOf(k) >= 0 || k.indexOf(xmFold(h.name).split(' ')[0]) >= 0)) || hf.find(h => !ch.some(x => x.hf === h.id) && (h.t === 'main' || h.t === 'bodypack')); if (h) c.hf = h.id; });
    const mix = (C.p.mixes || []).map(([name, type, who]) => { const lv = {}, w = xmFold(who).split(/[ ,]/)[0]; ch.forEach(c => { const f = xmFold(c.src); lv[c.id] = w && f.indexOf(w) >= 0 ? 3 : /voix|chant|presentat|animat|mc |pupitre|interv/.test(f) ? 2 : /grosse caisse|caisse claire|basse|clavier|piano|guitare/.test(f) ? 1 : 0; if (!lv[c.id]) delete lv[c.id]; }); return { id: xmUid(), name, type: { iem: 'iem2', autre: 'wedge' }[type] || type, who, lv }; });
    return { app: 'SONO XIII', v: 1, name: C.title, ch, hf, mix, set: { space: 0.35, imd: 0.1, tvBusy: '' }, updated: Date.now() };
};

XMA.posto = C => {
    const ps = C.p.post, tc0 = C.type === 'fiction' ? '01:00:00:00' : '00:00:00:00', fps = 25;
    const sec = tc => { const m = /(\d+):(\d+):(\d+)(?::(\d+))?/.exec(tc || ''); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] + (+m[4] || 0) / fps : 0; };
    const steps = ps.steps.map(([name, role, a, b]) => { const s = xmAdd(C.last, a), e = xmAdd(C.last, b); return { id: xmUid(), name, who: C.whoName(role), start: s, due: e, status: C.status(s, e) }; });
    const PR = typeof PRESETS !== 'undefined' ? PRESETS : [];
    const deliv = ps.deliv.map((k, i) => { const p = PR.find(x => x[0] === k) || [k, k, '']; return { id: xmUid(), preset: p[0], name: p[1].replace(/^\S+\s/, '') + ' — ' + C.short, spec: p[2], to: k === 'tv' || k === 'dcp' ? C.client : k === 'master' ? C.prod + ' (archives)' : 'Réseaux / web', due: xmAdd(C.last, 15 + i), done: '', status: 'todo', checks: {} }; });
    const versions = ps.versions.map(([label, status, notes, com], i) => ({ id: xmUid(), label, date: xmAdd(C.last, 7 + i * 5), status, url: '', tc0, notes, comments: com.map(([tc, text, cat, who], k) => ({ id: xmUid(), tc: Math.max(0, sec(tc) - sec(tc0)), text, cat, who, done: status === 'ok' || (status === 'sent' && k === 0), ts: Date.now() - (com.length - k) * 36e5 })) }));
    return { app: 'POSTO XIII', v: 1, name: C.title, fps, versions, steps, deliv, updated: Date.now() };
};

XMA.casto = C => {
    const roles = [], talents = [];
    const daysOf = c => { const s = new Set(); C.seqs.forEach(q => { if (q.chars.some(x => C.castOf(x) === c)) s.add(C.day(q.day)); }); if (!s.size && !C.seqs.length) C.days.forEach(d => s.add(d)); return [...s].sort(); };
    C.cast.forEach((c, i) => {
        if (!roles.some(r => xmFold(r.name) === xmFold(c.role))) roles.push({ id: xmUid(), name: c.role, desc: '' });
        const days = daysOf(c).length ? daysOf(c) : C.days.slice(-1), avail = {};
        C.days.forEach(d => avail[d] = c.status === 'option' ? 'opt' : 'ok');
        talents.push({ id: xmUid(), name: c.name, role: c.role, kind: c.kind, status: c.status, phone: c.phone, email: c.email, agent: c.agent, agentPhone: c.agentPhone, cachet: c.cachet ? String(c.cachet) : '', cachetType: c.cachetType || 'jour', droits: c.status === 'confirme' ? 'signed' : c.status === 'option' ? 'sent' : '', contrat: c.status === 'confirme' ? (xmHash(c.name) % 3 ? 'signed' : 'sent') : '', minor: c.kind === 'enfant', age: c.kind === 'enfant' ? '10' : '', tags: [c.kind === 'comedien' ? 'Premier rôle' : c.kind].slice(0, 1), notes: c.kind === 'enfant' ? 'Autorisation DDETS et présence d’un parent obligatoires. Horaires réglementés.' : '', avail, days });
        // pistes de casting pour les premiers rôles
        if (i < 2 && C.type !== 'scen' && (c.kind === 'comedien' || c.kind === 'animateur')) [['Chloé Vasseur', 'Margot Klein'], ['Antoine Royer', 'Samuel Diaz']][i].forEach((n, k) => { const av = {}; C.days.forEach((d, j) => av[d] = k === 1 && j === 0 ? 'no' : 'ok'); talents.push({ id: xmUid(), name: c.g === 'm' ? ['Antoine Royer', 'Samuel Diaz', 'Hugo Perrin', 'Malik Sow'][i * 2 + k] : ['Chloé Vasseur', 'Margot Klein', 'Lise Aubry', 'Nadia Fares'][i * 2 + k], role: c.role, kind: c.kind, status: k ? 'decline' : 'casting', phone: xmPhone(n + c.role), email: '', agent: 'Agents Associés', agentPhone: '01 44 55 66 77', cachet: c.cachet ? String(c.cachet) : '', cachetType: c.cachetType, tags: ['Essai filmé'], notes: k ? 'Indisponible : tournage d’une série en parallèle.' : 'Essai filmé le ' + xmAdd(C.first, -30) + ', très bonne énergie avec la réalisatrice.', avail: av, days: [] }); });
    });
    return { app: 'CASTO XIII', v: 1, name: C.title, talents, roles, extraDays: [], updated: Date.now() };
};

XMA.transporto = C => {
    const p = C.p, people = [], veh = [], trips = [], hotels = [], rooms = [], travels = [];
    const tr = p.travel || { who: [] }, travellers = new Set(tr.who.map(xmFold));
    const add = (n, role, ph, em, hotel) => { const o = { id: xmUid(), n, role, ph, em, arr: hotel ? xmAdd(C.first, -1) : C.first, dep: hotel ? xmAdd(C.last, 1) : C.last, hotel, need: '', note: '' }; people.push(o); return o; };
    C.cast.filter(c => !/\(|^public|^lauréats|^ensemble|^mains|^figurants/i.test(c.name)).forEach(c => add(c.name, c.role, c.phone, c.email, travellers.has(xmFold(c.name)) || !!p.hotel));
    C.crew.forEach(c => { if (/real|image|son|prod|hmc|cost/.test(c.dept) || travellers.has(xmFold(c.name))) add(c.name, c.role, c.phone, c.email, travellers.has(xmFold(c.name))); });
    people.forEach(o => { if (/enfant|voisin/i.test(o.role)) o.need = 'Accompagné d’un parent'; else if (xmHash(o.n) % 7 === 0) o.need = 'Végétarien'; });
    (p.vehicles || []).forEach(([name, type, seats, driver]) => veh.push({ id: xmUid(), name, type, seats, plate: xmPlate(name), driver: C.N(driver), rent: /car régie|voiture de jeu/i.test(name) ? '' : ['Rent A Car Pro', 'Hertz Utilitaires', 'Petit Forestier'][xmHash(name) % 3], note: type === 'truck' ? 'Permis C requis au-delà de 3,5 t' : '' }));
    if (p.hotel) {
        const h = { id: xmUid(), name: p.hotel.name, addr: p.hotel.addr, phone: p.hotel.phone, ci: xmAdd(C.first, -1), co: xmAdd(C.last, 1), conf: 'RES-' + (xmHash(p.hotel.name) % 90000 + 10000), price: p.hotel.price };
        hotels.push(h);
        people.filter(o => o.hotel).forEach((o, i) => rooms.push({ id: xmUid(), hotel: h.id, num: String(101 + i), type: 'single', from: o.arr, to: o.dep, occ: [o.id] }));
    }
    const pid = n => (people.find(o => xmFold(o.n) === xmFold(n)) || {}).id;
    if (p.travel) tr.who.forEach((n, i) => { const id = pid(n); if (!id) return; const o = people.find(x => x.id === id);
        travels.push({ id: xmUid(), pid: id, dir: 'aller', mode: tr.mode, date: o.arr, time: i % 2 ? '10:04' : '08:56', from: tr.from, to: tr.to, arrT: i % 2 ? '12:02' : '10:58', num: 'TGV INOUI ' + (i % 2 ? '6607' : '6603'), ref: 'QX' + (xmHash(n) % 9000 + 1000), cost: '79' });
        travels.push({ id: xmUid(), pid: id, dir: 'retour', mode: tr.mode, date: o.dep, time: '17:04', from: tr.to, to: tr.from, arrT: '19:02', num: 'TGV INOUI 6630', ref: 'QX' + (xmHash(n + 'r') % 9000 + 1000), cost: '89' }); });
    const shuttle = veh.find(v => /minibus|van|car/.test(v.type) && !/voiture de jeu|car régie/i.test(v.name)) || veh[0];
    const hp = people.filter(o => o.hotel).map(o => o.id);
    if (p.travel && hotels.length) { const ids = travels.filter(t => t.dir === 'aller').map(t => t.pid); if (ids.length) trips.push({ id: xmUid(), date: xmAdd(C.first, -1), time: '11:15', dur: 25, from: tr.to, to: hotels[0].name, veh: shuttle ? shuttle.id : '', driver: shuttle ? shuttle.driver : '', pax: ids, note: 'Accueil en gare — pancarte « ' + C.short + ' »' }); }
    C.days.forEach((d, i) => { const T = C.times(i); if (!hp.length || !hotels.length) return;
        trips.push({ id: xmUid(), date: d, time: xmHm(T[0], -30), dur: 20, from: hotels[0].name, to: C.venue.name, veh: shuttle ? shuttle.id : '', driver: shuttle ? shuttle.driver : '', pax: hp.slice(0, shuttle ? shuttle.seats : 8), note: 'J' + (i + 1) });
        trips.push({ id: xmUid(), date: d, time: xmHm(T[3], 20), dur: 20, from: C.venue.name, to: hotels[0].name, veh: shuttle ? shuttle.id : '', driver: shuttle ? shuttle.driver : '', pax: hp.slice(0, shuttle ? shuttle.seats : 8), note: 'Retour fin de journée' }); });
    return { app: 'TRANSPORTO XIII', v: 1, name: C.title, people, veh, trips, hotels, rooms, travels, updated: Date.now() };
};

XMA.runo = C => {
    const T = C.times(C.days.length > 1 ? 1 : 0);
    const start = /live|event|artistique/.test(C.type) ? '20:30' : /corporate/.test(C.type) ? '08:45' : '19:00';
    return { app: 'RUNO XIII', v: 1, name: C.title + ' — live', start, segs: C.p.runo.map(([title, dur, scene, notes]) => ({ id: xmUid(), title, dur, scene, notes })), goals: [], alerts: [], live: { on: false, idx: 0, segStart: 0, showStart: 0, done: {} }, set: { channel: '', alertGid: '', alertMap: {}, alertSec: 6, chatGid: '', chatMap: {} }, updated: Date.now(), _t: T };
};

XMA.callsheeto = C => {
    const p = C.p, mk = typeof newProject === 'function' ? newProject() : { app: 'CALL SHEETO XIII', version: 1, settings: { showEmails: true, hideCastContacts: false, publishUrl: '' }, days: [] };
    Object.assign(mk, { name: C.title, company: C.prod, director: C.director, producer: C.producer, updated: Date.now() });
    const LOC = (type, o) => o ? { id: xmUid(), type, name: o.name, address: o.address || o.addr || '', lat: o.lat || null, lon: o.lon || null, tz: 'Europe/Paris', access: o.access || '', contact: o.contact || '', phone: o.phone || '', code: '' } : null;
    const rg = C.regisseur, sst = C.who(/assist|regisseu|charg/) || rg;
    mk.days = C.days.map((date, i) => {
        const d = typeof newDay === 'function' ? newDay(i + 1) : { id: xmUid(), safety: { risks: [], extra: [] } };
        const T = C.times(i), sch = C.sched(i);
        Object.assign(d, { name: 'J' + (i + 1), date, title: (p.dayTitles || [])[i] || '', dayNum: i + 1, dayTotal: C.days.length, times: { general: T[0], pat: T[1], lunch: T[2] || '', wrap: T[3] } });
        const locs = [], byDecor = {};
        const main = LOC('decor', C.venue); locs.push(main);
        sch.filter(x => /^decor:/.test(x.loc || '')).forEach(x => { const dn = x.loc.slice(6); if (byDecor[dn]) return; const sp = C.spotOf(dn); if (sp && xmFold(sp[0]) !== xmFold(C.venue.name)) { const l = LOC('decor', { name: sp[0], address: sp[1] + ', ' + sp[3] + ' ' + sp[2], lat: sp[4], lon: sp[5], access: sp[8] }); locs.push(l); byDecor[dn] = l.id; } else byDecor[dn] = main.id; });
        const lb = LOC('base', C.base), lp = LOC('park_tech', C.park), lc = LOC('cantine', C.cantine), ll = LOC('loges', C.loges);
        [lb, lp, lc, ll].forEach(l => l && locs.push(l));
        d.locations = locs; d.wxLocId = main.id;
        const locId = k => !k ? main.id : /^decor:/.test(k) ? byDecor[k.slice(6)] || main.id : k === 'base' && lb ? lb.id : k === 'cantine' && lc ? lc.id : k === 'loges' && ll ? ll.id : main.id;
        d.schedule = sch.map(x => x.ev ? { id: xmUid(), ev: true, time: x.time, desc: x.desc } : { id: xmUid(), ev: false, time: x.time, seq: x.seq || '', ie: x.ie || '', loc: locId(x.loc), desc: x.desc, roles: x.roles || '', pages: x.pages || '' });
        const present = new Set(); C.seqs.filter(s => s.day === i).forEach(s => s.chars.forEach(ch => { const c = C.castOf(ch); if (c) present.add(c); }));
        if (p.sched) sch.forEach(x => C.cast.forEach(c => { if (x.roles && xmFold(x.roles).indexOf(xmFold(c.name).split(' ')[0]) >= 0) present.add(c); }));
        d.crew = C.crew.map(c => ({ id: xmUid(), dept: c.dept, role: c.role, name: c.name, phone: c.phone, email: c.email, call: /regie|elec|machino/.test(c.dept) ? xmHm(T[0], -30) : '', hmc: '', note: '' }))
            .concat([...present].map(c => ({ id: xmUid(), dept: c.kind === 'figurant' ? 'fig' : 'cast', role: C.type === 'fiction' ? c.role : c.role, name: c.name, phone: c.phone, email: c.email, call: xmHm(T[1], -60), hmc: xmHm(T[1], -45), note: c.kind === 'enfant' ? 'Accompagné d’un parent — loge dédiée' : '' })));
        d.safety = Object.assign(d.safety || {}, { risks: (p.risks || []).slice(), referent: rg ? rg.name : '', referentPhone: rg ? rg.phone : '', firstAid: sst ? sst.name + ' (SST)' : '', firstAidPhone: sst ? sst.phone : '', assembly: 'Trousse de secours et extincteur à la base régie — point de rassemblement devant ' + (C.base ? C.base.name : C.venue.name),
            hospital: C.hosp ? Object.assign({}, C.hosp, { dist: C.venue.lat && C.hosp.lat ? xmHav(C.venue.lat, C.venue.lon, C.hosp.lat, C.hosp.lon) : null }) : null });
        d.practical = [C.park ? '🅿️ ' + C.park.name + ' — ' + (C.park.access || C.park.address) : '', C.venue.access ? '🚪 Accès : ' + C.venue.access : '', C.cantine ? '🍽️ ' + C.cantine.name + (C.cantine.access ? ' — ' + C.cantine.access : '') : '', 'Tenue : chaussures fermées' + (/live|event/.test(C.type) ? ', vêtements noirs pour les équipes visibles du public.' : '.')].filter(Boolean).join('\n');
        d.notes = i === 0 ? 'Bienvenue sur « ' + C.title + ' » ! Badges et talkies à retirer à la régie.' : '';
        return d;
    });
    return mk;
};

XMA.repero = C => {
    const ST = { valide: 'retenu', option: 'vu', avoir: 'avoir' };
    const P0 = typeof blankProject === 'function' ? blankProject() : { v: 1, id: xmUid(), name: '', author: '', info: {}, spots: [], cur: '', created: new Date().toISOString() };
    Object.assign(P0, { name: C.title, author: C.regisseur ? C.regisseur.name : '' });
    P0.info = Object.assign(P0.info || {}, { production: C.prod, realisation: C.director, producteur: C.producer, client: C.client, dates: C.first + (C.last !== C.first ? ' → ' + C.last : ''), contact: C.regisseur ? C.regisseur.name + ' — ' + C.regisseur.phone : '' });
    const bs = o => typeof blankSpot === 'function' ? blankSpot(o) : Object.assign({ id: xmUid(), photos: [], chk: {}, chkN: {}, tech: {} }, o);
    P0.spots = (C.p.spots || []).map(([name, address, city, cp, lat, lon, cat, status, notes, rating], i) => bs({ name, address, city, cp, lat, lon, tz: 'Europe/Paris', cat: status === 'option' ? 'alt' : cat, status: ST[status] || 'avoir', date: xmAdd(C.first, -30 + i * 2), access: /rue|quai|berge|place|parvis|plage/i.test(name) ? 'public' : 'prive', owner: i === 0 ? (C.venue.contact || '') : '', phone: i === 0 ? (C.venue.phone || '') : '', notes, rating }));
    [['base', C.base], ['parking', C.park]].forEach(([cat, o]) => { if (o && o.lat) P0.spots.push(bs({ name: o.name, address: o.address, city: '', lat: o.lat, lon: o.lon, tz: 'Europe/Paris', cat, status: 'retenu', notes: o.access || '', rating: 4 })); });
    P0.cur = (P0.spots[0] || {}).id || '';
    return P0;
};

XMA.ressourco = C => {
    const P0 = typeof blankProject === 'function' ? blankProject() : { v: 1, id: xmUid(), common: {}, defs: {}, docs: [], cur: '' };
    P = P0; P.name = C.title; P.author = C.producer;
    const city = (/(\d{5})\s+([^,]+)$/.exec(C.venue.address || '') || [])[2] || 'Lyon';
    Object.assign(P.common, { titre: C.title, production: C.prod, adresse_production: '12 Rue de la Charité, 69002 Lyon', siret: '812 345 678 00021', producteur: C.producer, realisation: C.director, diffuseur: C.client, lieu_tournage: C.venue.name + (C.venue.address ? ', ' + C.venue.address : ''), dates_tournage: C.first === C.last ? C.first : 'du ' + C.first + ' au ' + C.last, contact_production: (C.regisseur ? C.regisseur.name + ' — ' + C.regisseur.phone + ' — ' + C.regisseur.email : ''), ville_signature: city, date_signature: xmAdd(C.first, -14), exploitation: '10 ans, monde entier, tous supports', duree_cession: '10 ans', territoire: 'Monde entier' });
    if (typeof addDoc === 'function' && typeof modelOf === 'function' && typeof PACKS !== 'undefined') {
        const ids = []; (C.p.packs || []).forEach(pk => { const x = PACKS.find(p => p.id === pk); if (x) x.ids.forEach(id => { if (ids.indexOf(id) < 0) ids.push(id); }); });
        ids.forEach(id => { const m = modelOf(id); if (m) try { addDoc(m, true); } catch (e) { } });
        const split = n => { const a = String(n).split(' '); return { prenom: a[0], nom: a.slice(1).join(' ') || a[0] }; };
        const row = (o, extra) => ({ id: xmUid(), on: true, v: Object.assign(split(o.name), { email: o.email || '', telephone: o.phone || '', adresse: (xmHash(o.name) % 120 + 1) + ' rue Victor Hugo, 69002 Lyon', nationalite: 'Française', date_debut: C.first, date_fin: C.last, jours: String(C.days.length) }, extra || {}) });
        const tech = C.crew.filter(c => !/autre|cantine/.test(c.dept)), art = C.cast.filter(c => !/\(|^public|^lauréats|^ensemble|^figurants|^mains/i.test(c.name));
        P.docs.forEach(d => { const t = String(d.tpl || ''); let L = null;
            if (/tech|cddu|nda/.test(t)) L = tech.map(c => row(c, { fonction: c.role, remuneration: '' }));
            else if (/art|img-adulte|img-invite/.test(t)) L = art.map(c => row(c, { role: c.role, cachet: c.cachet ? c.cachet + ' €' : '', fonction: c.role }));
            else if (/dpae/.test(t)) L = tech.slice(0, 6).map(c => row(c, { fonction: c.role })).concat(art.map(c => row(c, { fonction: c.role })));
            else if (/lieu|reperage/.test(t)) L = (C.p.spots || []).slice(0, 4).map(s => ({ id: xmUid(), on: true, v: { lieu: s[0], adresse_lieu: s[1] + ', ' + s[3] + ' ' + s[2], proprietaire: /rue|quai|place/i.test(s[0]) ? 'Mairie de ' + s[2] : 'Gestionnaire du lieu', date_tournage: C.first, horaires: '07:00 — 20:00' } }));
            else if (/mineur/.test(t)) L = C.cast.filter(c => c.kind === 'enfant').map(c => row(c, {}));
            if (L && L.length) d.rows = L; });
        P.cur = (P.docs[0] || {}).id || '';
    }
    return P;
};
// ---------------------------------------------------------------------
//  XMODELS — adaptateurs (2) : devis, caisses, découpage, script, storyboard, moodboard
// ---------------------------------------------------------------------
XMA.deviso = C => {
    const p = C.p; P = blankProject();
    Object.assign(P, { name: C.title, client: C.client, lieu: C.venue.name + (C.venue.address ? ', ' + C.venue.address : ''), debut: C.first, fin: C.last, author: C.producer, notes: 'Exemple type « ' + p.label + ' ». Hors droits de diffusion. Repas fournis selon la feuille de service.' });
    const conv = { fiction: 'cinema', pub: 'cinema', tv: 'flux', live: 'flux', doc: 'fiction', corporate: 'event', event: 'event', artistique: 'event' }[C.type] || 'flux';
    const setup = /live|event|corporate|artistique|tv/.test(C.type);
    Object.assign(P.set, { tournage: C.days.length - (setup && C.days.length > 1 ? 1 : 0), install: setup ? 1 : 0, demontage: /live|event/.test(C.type) ? 1 : 0, conv, convAuto: false, amp: 10, nights: p.hotel ? C.days.length + 1 : 0 });
    const v = V(); v.name = 'Devis A — complet';
    const cat = n => { try { return (matchRef(n) || { ref: { c: 'div' } }).ref.c; } catch (e) { return 'div'; } };
    p.eq.forEach(([name, qty]) => v.eq.push(newEq({ name, qty, cat: /câble/i.test(name) ? 'cab' : cat(name) })));
    const addC = (name, role, extra) => { let po; try { po = posteOf(posteFromRole(role)); } catch (e) { po = { id: 'autre', dept: 'autre', mode: 'cddu' }; } v.crew.push(Object.assign({ id: xmUid(), on: true, name, role, poste: po.id, dept: po.dept, mode: po.mode }, extra || {})); };
    C.crew.filter(c => !/autre|cantine/.test(c.dept)).forEach(c => addC(c.name, c.role));
    C.cast.forEach(c => addC(c.name, c.role, { mode: 'cachet', dept: 'cast', rate: c.cachet || 0, on: c.cachet > 0 }));
    (p.fees || []).forEach(([name, qty, unit, price, lo, hi]) => v.fees.push({ id: xmUid(), on: true, name, qty, unit, price, lo, hi }));
    v.fees.push({ id: xmUid(), on: true, name: 'Régie (consommables, petit matériel)', qty: 1, unit: 'forfait', price: 250, lo: 150, hi: 400 });
    const b = { id: xmUid(), name: 'Devis B — économique', eq: cloneLines(v.eq).map(e => Object.assign(e, { qty: Math.max(1, Math.round(e.qty * 0.7)) })), crew: cloneLines(v.crew).filter((c, i, a) => i < a.length * 0.8 || c.dept === 'cast'), fees: cloneLines(v.fees).filter((f, i) => i < 3) };
    P.versions.push(b);
    return P;
};

XMA.packingo = C => {
    const p = C.p; P = blankProject(); const d0 = xmAdd(C.first, -1);
    Object.assign(P.prod, { name: C.title, client: C.client, lieu: C.venue.name, depart: d0, retour: xmAdd(C.last, 1), resp: (C.who(/regisseu|assistant cam|directeur tech/) || C.crew[0]).name, notes: C.venue.access || '' });
    P.cps = [{ id: xmUid(), name: 'Départ dépôt', icon: '🚚', date: d0 }, { id: xmUid(), name: 'Arrivée ' + C.venue.name.split(' — ')[0], icon: '📍', date: C.first }, { id: xmUid(), name: 'Fin de tournage', icon: '🎬', date: C.last }, { id: xmUid(), name: 'Retour dépôt', icon: '🏁', date: xmAdd(C.last, 1) }];
    P.curCp = P.cps[0].id;
    const COL = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'];
    P.vehicles = (p.vehicles || []).filter(v => /truck|van/.test(v[1]) && !/car régie|loge/i.test(v[0])).slice(0, 3).map(([name, type, seats, driver], i) => ({ id: xmUid(), name, type: type === 'truck' ? 'Caisse 20 m³ hayon (permis B)' : 'Fourgon L2H1 (Trafic, Vivaro)', payload: type === 'truck' ? 850 : 1100, vol: type === 'truck' ? 20 : 6, pax: Math.min(3, seats), plate: xmPlate(name), driver: C.N(driver).split(' ')[0], color: COL[i % 4] }));
    if (!P.vehicles.length) P.vehicles = [{ id: xmUid(), name: 'Utilitaire 12 m³', type: 'Fourgon L3H2 (Master, Jumpy)', payload: 1200, vol: 12, pax: 3, plate: xmPlate(C.title), driver: (C.crew[1] || C.crew[0]).name.split(' ')[0], color: COL[0] }];
    const v1 = P.vehicles[0], v2 = P.vehicles[1] || v1;
    const CAT = [['cam', /sony|arri|venice|alexa|phantom|hdc|ptz|blackmagic micro|z750|fx\d|fx9|fx6|fx3|marshall|panasonic/i, 'Caméras', 'Flight case caméra', '#E53935', [['Batterie V-mount 150 Wh', 6], ['Chargeur 4 voies V-mount', 1], ['Carte CFexpress / SD', 6], ['Housse de pluie caméra', 1]]],
        ['opt', /fujinon|canon (cn|uj|17)|cooke|zeiss|signature|laowa|fe \d|prime|^ua/i, 'Optiques', 'Valise Peli 1650', '#8E24AA', [['Trousse de nettoyage optiques', 1], ['Filtres ND 4×5,65 (jeu)', 1]]],
        ['sup', /trépied|ronin|grue|jib|technocrane|slider|dolly|rails|rs 3|steadicam/i, 'Supports & machinerie', 'Tube trépieds', '#8D6E63', [['Sac de sable', 6]]],
        ['vid', /atem|hyperdeck|teradek|moniteur|tvlogic|smallhd|pvm|encodeur|prompteur|serveur|resolume|disguise|projecteur 20|vidéoprojecteur/i, 'Vidéo & régie', 'Flight case rack 19" 8U', '#3949AB', [['Switch réseau', 1], ['Câbles d’alimentation IEC (lot 10)', 1]]],
        ['son', /shure|sennheiser|lectrosonics|console|zoom f|sound devices|mkh|l-acoustics|digico|tentacle|clear-com|allen/i, 'Son & intercom', 'Valise Peli 1610', '#EC407A', [['Piles AA (boîte de 48)', 2], ['Casque de monitoring', 4], ['Câbles XLR 5 m (lot 10)', 1]]],
        ['lum', /arri (sky|m\d|orbiter)|skypanel|aputure|kino|astera|robe|martin|etc|ayrton|fresnel|hmi|par|machine à brouillard|nova|megapointe|spiider/i, 'Lumière', 'Caisse longue pieds lumière', '#FDD835', [['Pied C-stand', 4], ['Gaffer toilé (rouleau)', 4], ['Diffusion 216 (rouleau)', 1]]],
        ['cab', /câble/i, 'Câbles', 'Malle câbles à roulettes', '#00ACC1', [['Trousse adaptateurs & barils', 1], ['Touret BNC 50 m', 2]]]];
    const groups = {}; p.eq.forEach(([n, q]) => { if (/groupe|camion|porteur|utilitaire|écran led|tapis|truss|moteur/i.test(n)) return; const c = CAT.find(c => c[1].test(n)) || CAT[3]; (groups[c[0]] = groups[c[0]] || []).push([n, q]); });
    let k = 0;
    CAT.forEach(c => { const L = groups[c[0]]; if (!L) return; for (let i = 0; i < L.length; i += 6) { k++; const items = L.slice(i, i + 6).concat(i === 0 ? c[5] : []);
        const pr = (typeof CASES !== 'undefined' ? CASES : []).find(x => x[0] === c[3]) || [c[3], 10, 60, 40, 40, 40];
        P.cases.push({ id: xmUid(), code: 'FC-' + xmPad(k), name: c[2] + (L.length > 6 ? ' ' + (i / 6 + 1) : ''), type: pr[0], color: c[4], tare: pr[1], L: pr[2], W: pr[3], H: pr[4], max: pr[5], veh: (c[0] === 'vid' || c[0] === 'son' ? v2 : v1).id, ord: 0, fragile: /cam|opt|vid/.test(c[0]), notes: '',
            items: items.map(([n, q]) => { let e = null; try { e = libFind(n); } catch (x) { } e = e || { name: n, kg: 0, cat: 'div' }; return { id: xmUid(), name: e.name || n, cat: e.cat || 'div', kg: e.kg || 0, qty: q, sn: c[0] === 'cam' && q === 1 ? (n.split(' ').pop().toUpperCase().slice(0, 4) + '-' + (xmHash(n) % 9000 + 1000)) : '' }; }) }); } });
    k++; P.cases.push({ id: xmUid(), code: 'SAC-' + xmPad(k), name: 'Outillage & consommables', type: 'Caisse plastique 60×40', color: '#78909C', tare: 2, L: 60, W: 40, H: 32, max: 30, veh: v2.id, ord: 0, fragile: false, notes: '', items: [['Trousse outillage', 1], ['Gaffer toilé (rouleau)', 6], ['Trousse de secours', 1], ['Lampe frontale', 3], ['Talkies-walkies (lot de 6 + chargeur)', 1]].map(([n, q]) => ({ id: xmUid(), name: n, cat: 'div', kg: 0, qty: q, sn: '' })) });
    try { P.vehicles.forEach(v => autoSortSilent(v.id)); } catch (e) { }
    return P;
};

XMA.decoup = C => {
    P = newProject(); P.name = C.title; P.author = (C.who(/scripte|assist.*real/) || C.crew[0]).name;
    const COLS = ['#EF5350', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA', '#EC407A', '#FFD54F'];
    P.resources.cams = C.p.cams.map((c, i) => ({ id: xmUid(), num: i + 1, name: c[0], type: /steadi/i.test(c[0]) ? 'Steadicam' : /grue|jib/i.test(c[0]) ? 'Grue / Jib' : /ptz/i.test(c[0]) ? 'PTZ / Tourelle' : /épaule|epaule/i.test(c[0]) ? 'Épaule' : /drone/i.test(c[0]) ? 'Drone' : 'Studio / pied', op: c[4] || '', optic: c[1] + ' · ' + c[2], pos: c[3], color: COLS[i % COLS.length] }));
    const chars = []; C.seqs.forEach(s => s.chars.forEach(c => { if (chars.indexOf(c) < 0) chars.push(c); }));
    P.resources.talents = chars.map((c, i) => { const ca = C.castOf(c); return { id: xmUid(), name: c, role: ca && ca.name !== c ? ca.name : (ca ? ca.role : ''), mic: 'HF ' + (i + 1), color: ['#F06292', '#4FC3F7', '#81C784', '#FFB74D', '#BA68C8', '#FFD54F'][i % 6] }; });
    const tid = c => (P.resources.talents.find(t => t.name === c) || {}).id;
    const t = P.tabs[0]; t.name = 'Découpage technique'; t.date = C.first; t.start = '00:00:00';
    const V = v => ({ PL: 'PG', PUB: 'PE', AMO: 'OTS', SUBJ: 'POV' }[v] || v), cams = P.resources.cams;
    const ANG = { face: 'Face', profil: 'Profil', '3q': 'Trois-quarts', dos: 'De dos', plongee: 'Plongée', cplongee: 'Contre-plongée', zenith: 'Zénithale' };
    t.items = [];
    C.seqs.forEach(s => {
        t.items.push(newHeader('Séq. ' + s.num + ' — ' + C.heading(s), COLS[(+s.num || 0) % COLS.length]));
        s.plans.forEach((pl, k) => { const cam = /drone/.test(pl.mvt) ? cams.find(c => /drone/i.test(c.name)) : /steadi|suivi/.test(pl.mvt) ? cams.find(c => /steadi/i.test(c.name)) : /grue/.test(pl.mvt) ? cams.find(c => /grue|jib/i.test(c.name)) : cams[k % Math.min(2, cams.length)];
            t.items.push(newItem(V(pl.valeur), { title: pl.desc, num: s.num + '.' + pl.k, decor: C.heading(s), talents: s.chars.filter(c => xmFold(pl.desc).indexOf(xmFold(c).split(' ')[0]) >= 0 || s.chars.length <= 2).map(tid).filter(Boolean), cams: cam ? [cam.id] : [], angle: ANG[pl.angle] || '', move: XM_MV[pl.mvt] || 'Fixe', focale: pl.focale, dur: Math.min(pl.dur, 120), audio: pl.son, notes: k === 0 ? s.summary : '', status: C.status(C.day(s.day), C.day(s.day)) === 'done' ? 'ok' : 'prep', trans: k === s.plans.length - 1 ? 'fondu' : 'cut' })); });
    });
    // scénario reconstitué (dépouillement)
    const txt = C.seqs.map(s => s.num + '. ' + (s.ie || 'INT') + '. ' + s.decor.toUpperCase() + ' — ' + (s.effet || 'JOUR').toUpperCase() + '\n\n' + s.summary + '\n\n' + s.plans.filter(pl => / : /.test(pl.son)).map(pl => { const m = /^([^:]+) : (.*)$/.exec(pl.son); return m[1].toUpperCase().trim() + '\n' + m[2].replace(/^«\s*|\s*»$/g, ''); }).join('\n\n')).join('\n\n');
    try { P.breakdown = { src: txt, scenes: dpParse(txt) }; } catch (e) { }
    return P;
};

XMA.scripto = C => {
    P = scNormalize(null); P.name = C.title; P.client = C.client; P.author = (C.who(/scripte/) || C.who(/assist/) || C.crew[0]).name;
    const days = [P.days[0]]; P.days[0].label = 'J1'; P.days[0].date = C.day(0); P.days[0].notes = (C.p.dayTitles || [])[0] || '';
    for (let i = 1; i < C.days.length; i++) { const d = scBlankDay(P); d.label = 'J' + (i + 1); d.date = C.day(i); d.notes = (C.p.dayTitles || [])[i] || ''; P.days.push(d); days.push(d); }
    const today = xmToday(), ST = ['ng', 'mid', 'ok'];
    C.seqs.forEach(s => s.plans.forEach(pl => {
        const day = days[s.day] || days[0], past = day.date < today, sh = Object.assign(scBlankShot(P, day.id), {
            seq: s.num, plan: String(pl.k), name: pl.desc, decor: C.heading(s), valeur: pl.valeur === 'PL' ? 'PG' : pl.valeur, focale: pl.focale, imgTags: [XM_MVTAG[pl.mvt] || 'Fixe'], image: (pl.angle ? 'Axe ' + ({ face: 'face', profil: 'profil', '3q': 'trois-quarts', dos: 'de dos', plongee: 'plongée', cplongee: 'contre-plongée', zenith: 'zénithal' }[pl.angle] || pl.angle) + '. ' : '') + (XM_MV[pl.mvt] || 'Fixe') + '.',
            sonTags: /mos|^$/i.test(pl.son) && pl.valeur === 'INS' ? ['MOS — sans son'] : /hf|cravate/i.test(pl.son) ? ['Son direct', 'HF'] : ['Son direct', 'Perche'], son: pl.son, raccord: pl.k === 1 && s.chars.length ? s.chars.slice(0, 2).join(' et ') + ' : tenue de la séquence ' + s.num + ' (voir photos).' : '', status: past ? 'done' : 'todo' });
        if (past) sh.takes = [0, 1, 2].slice(0, 2 + (xmHash(pl.desc) % 2)).map((x, i, a) => ({ id: xmUid(), n: String(i + 1), st: i === a.length - 1 ? 'ok' : ST[i], dur: '0:' + xmPad(20 + (xmHash(pl.desc + i) % 40)), clip: 'A' + xmPad(1 + (P.shots.length * 3 + i) % 99) + 'C00' + (i + 1), note: i === a.length - 1 ? 'Retenue réal' : ['Point', 'Avion', 'Faux départ'][i % 3], t: Date.now() - (20 - i) * 240000 }));
        P.shots.push(sh);
    }));
    P.cur = { day: days[0].id, shot: (P.shots[0] || {}).id };
    return P;
};

XMA.storyboardo = C => {
    P = blankProject(); P.name = C.title; P.client = C.client; P.author = C.director; P.ratio = C.type === 'fiction' ? '2.39' : C.type === 'pub' ? '1.85' : '16:9';
    const h = Hh(), S = h / 900, pose = id => Object.assign({}, (POSES.find(p => p[0] === id) || POSES[0])[2]);
    const FURN_K = [[/appartement|salon|loge/, [['canape', 0.3], ['lampe', 0.55], ['fenetre', 0.8]]], [/bar|comptoir/, [['comptoir', 0.5], ['tabouret', 0.35], ['tabouret', 0.62]]], [/bureau|capitainerie|laboratoire/, [['bureau', 0.5], ['ordi', 0.5], ['etagere', 0.15]]], [/rue|quai|berge|parvis|plage|digue|ecluse|toit/, [['immeuble', 0.2], ['lampadaire', 0.85], ['arbre', 0.65]]], [/voiture/, [['voiture', 0.5]]], [/scene|plateau|salle|nef|verriere|amphi|studio/, [['projecteur', 0.12], ['projecteur', 0.88], ['camera', 0.08]]], [/salle de bain/, [['commode', 0.5]]], [/palier/, [['porte', 0.5], ['escalier', 0.15]]], [/peniche/, [['colonne', 0.2]]]];
    const bgOf = s => /nuit|crepuscule/.test(xmFold(s.effet)) ? 'nuit' : s.ie === 'EXT' ? 'exterieur' : /studio|fond infini/.test(xmFold(s.decor)) ? 'papier' : /scene|nef|verriere/.test(xmFold(s.decor)) ? 'noir' : 'interieur';
    const scaleOf = v => ({ PG: [0.55, 0.92], PL: [0.6, 0.92], PE: [0.8, 0.94], PM: [1.15, 1.02], PA: [1.3, 1.08], '2S': [1.6, 1.2], OTS: [1.7, 1.25], PR: [2.0, 1.32], GP: [3.2, 1.62], TGP: [4.6, 2.05], INS: [0, 0], PUB: [0.8, 0.95] }[v] || [1, 1]);
    const COL = ['#8b7cf6', '#f4d35e', '#4fc3f7', '#ef9a9a', '#a5d6a7'], HAIR = ['#5a3b28', '#2a2230', '#c49a6c', '#1b1b1b'];
    const panels = [];
    C.seqs.forEach(s => s.plans.forEach(pl => {
        if (panels.length >= 16) return;
        const [sc, yy] = scaleOf(pl.valeur), bg = bgOf(s), dark = bg === 'nuit' || bg === 'noir';
        const els = [];
        if (sc < 1.5) (FURN_K.find(f => f[0].test(xmFold(s.decor))) || [0, []])[1].forEach(([fid, x]) => els.push({ id: xmUid(), kind: 'furn', fid, x: 1600 * x, y: h * 0.9, s: S * 0.85, r: 0, color: dark ? '#9aa4b8' : undefined, fill: dark ? '#2a3142' : undefined }));
        if (pl.valeur === 'INS' || pl.valeur === 'TGP' && !s.chars.length) els.push({ id: xmUid(), kind: 'furn', fid: /verre|bar/.test(xmFold(pl.desc)) ? 'tasse' : /photo/.test(xmFold(pl.desc)) ? 'tableau' : /flacon|serum/.test(xmFold(pl.desc)) ? 'tasse' : /assiette/.test(xmFold(pl.desc)) ? 'table' : 'lampebureau', x: 800, y: h * 0.95, s: S * 3, r: 0 });
        else {
            const who = s.chars.filter(c => xmFold(pl.desc).indexOf(xmFold(c).split(' ')[0]) >= 0); const L = (who.length ? who : s.chars).slice(0, sc > 2.5 ? 1 : sc > 1.4 ? 2 : 3);
            const ps = /court|course/.test(xmFold(pl.desc)) ? 'course' : /marche|traverse|entre|descend/.test(xmFold(pl.desc)) ? 'marche' : /assis|fauteuil|tabouret|table|voiture|conduit|piano|desk/.test(xmFold(pl.desc + s.decor)) && !/scene/.test(xmFold(s.decor)) ? 'assis' : /telephone/.test(xmFold(pl.desc)) ? 'telephone' : /danse|bras|salut|public/.test(xmFold(pl.desc)) ? 'bras_leves' : 'debout';
            L.forEach((c, i) => { const ca = C.castOf(c), g = ca && ca.g === 'm' ? 'homme' : ca && ca.kind === 'enfant' ? 'enfant' : 'femme', n = L.length;
                els.push({ id: xmUid(), kind: 'puppet', type: /groupe|public|ensemble|figurants|pecheurs|lauréats|laureats|quatuor|compagnie/.test(xmFold(c)) ? 'silhouette' : g, view: pl.angle === 'profil' ? 'profil' : pl.angle === 'dos' ? 'dos' : pl.angle === 'face' ? 'face' : '3q', name: c.split(' ')[0].toUpperCase(), color: COL[C.seqs.reduce((a, q) => a.concat(q.chars), []).indexOf(c) % COL.length] || COL[i], hair: HAIR[xmHash(c) % HAIR.length], skin: SKINS[xmHash(c) % SKINS.length], pose: pose(ps), x: n === 1 ? 800 : 800 + (i - (n - 1) / 2) * (sc > 1.4 ? 520 : 360), y: h * yy, s: S * sc, r: 0, flip: i % 2 === 1 }); });
        }
        if (/trav|steadi|suivi|grue|drone|pano|zoom/.test(pl.mvt)) els.push({ id: xmUid(), kind: 'arrow', style: 'cam', dx: /ar|out|recule/.test(pl.mvt + pl.desc) ? 220 : -240, dy: /grue|drone/.test(pl.mvt) ? -160 : -30, label: XM_MV[pl.mvt] || '', x: 1380, y: h * 0.86, s: 1, r: 0 });
        const dl = /^([^:]+) : (.*)$/.exec(pl.son || '');
        panels.push(blankPanel({ seq: s.num, num: String(panels.length + 1), valeur: pl.valeur === 'PL' ? 'PG' : pl.valeur, angle: pl.angle, mvt: pl.mvt, focale: pl.focale, dur: Math.max(2, Math.min(8, Math.round(pl.dur / (pl.dur > 60 ? 20 : 2)) || 3)), action: pl.desc + '.', dialogue: dl ? dl[0] : '', son: dl ? '' : pl.son, trans: pl.k === s.plans.length ? 'fondu' : 'cut', bg: { preset: bg, floor: 0.72 }, els }));
    }));
    P.panels = panels.length ? panels : P.panels; P.cur = P.panels[0].id;
    return P;
};

XMA.moodo = async C => {
    const m = C.p.mood, pal = m.palette; P = blankProject(); P.name = C.title; P.client = C.client; P.author = C.director;
    const mk = async (b, g, c1, c2, sh, cap, src, star) => { const id = 'im' + xmUid(); await putImg(id, demoImg(c1, c2, sh)); b.items.push({ id: xmUid(), kind: 'img', img: id, w: 900, h: 600, cap, src, tags: [], group: (b.groups[g] || b.groups[0]).id, star: !!star }); };
    const da = blankBoard('da', 'Intention générale'); P.boards.push(da);
    Object.assign(da.fiche, { intention: m.intention, palette: 'Dominantes : ' + pal.slice(0, 3).join(', ') + '. Accents : ' + pal.slice(3).join(', ') + '.', ratio: C.type === 'fiction' ? '2.39:1' : '16:9', focales: m.focales, look: m.look, refs: m.refs });
    da.palette = pal.slice();
    await mk(da, 0, pal[0], pal[2], C.type === 'fiction' ? 'city' : 'fig', 'Ambiance générale', 'Référence', true);
    await mk(da, 2, pal[1], pal[3] || pal[0], 'win', 'Lumière : sources motivées', 'Photogramme');
    await mk(da, 3, pal[2], pal[4] || pal[1], 'noise', 'Texture & étalonnage', 'Essai LUT');
    da.items.push({ id: xmUid(), kind: 'note', text: m.look, tags: ['lumière'], group: da.groups[2].id });
    m.refs.split(/,\s*/).slice(0, 3).forEach(r => da.items.push({ id: xmUid(), kind: 'ref', title: r, who: '', year: '', cap: '', src: '', tags: [], group: (da.groups[4] || da.groups[0]).id }));
    pal.forEach(c => da.items.push({ id: xmUid(), kind: 'color', color: c, cap: '', tags: [], group: (da.groups[3] || da.groups[0]).id }));
    for (const c of C.cast.filter(c => c.kind !== 'figurant').slice(0, 2)) {
        const pe = blankBoard('perso', c.role + ' — ' + c.name); P.boards.push(pe);
        Object.assign(pe.fiche, { nom: C.type === 'fiction' ? c.role : c.name, role: c.role, silhouette: '', visage: 'Peau naturelle, maquillage léger et mat', cheveux: c.g === 'f' ? 'Cheveux mi-longs, naturels' : 'Courts, naturels', tenue: C.type === 'live' ? 'Noir et métal, une pièce lumineuse sous les faisceaux' : C.type === 'corporate' ? 'Tenue sobre, pas de rayures fines ni de blanc pur (caméras)' : 'Tons de la palette, matières mates', attitude: '' });
        pe.palette = [pal[0], pal[3] || pal[1]];
        await mk(pe, 0, pal[3] || pal[1], pal[0], 'fig', 'Portrait de référence — lumière latérale', 'Casting', true);
    }
    const li = blankBoard('lieu', C.venue.name); P.boards.push(li);
    Object.assign(li.fiche, { type: m.lieu, ambiance: m.intention, lumiere: m.look, contraintes: C.venue.access || '' });
    await mk(li, 1, pal[0], pal[1], 'win', C.venue.name, 'Repérage', true); await mk(li, 0, pal[1], pal[2], 'city', 'Accès & extérieurs', 'Repérage');
    if (/fiction|pub|artistique|live/.test(C.type)) { const co = blankBoard('costume', 'Costumes'); P.boards.push(co); Object.assign(co.fiche, { personnages: C.cast.slice(0, 3).map(c => C.type === 'fiction' ? c.role : c.name).join(', '), palette: pal.slice(0, 3).join(', '), contraintes: 'HF à cacher, doublures pour les scènes de pluie ou de sueur.' }); await mk(co, 0, pal[2], pal[0], 'fig', 'Silhouette principale', 'Essai costume', true); }
    P.cur = da.id;
    return P;
};
// ---------------------------------------------------------------------
//  XMODELS — CONDUCO : un conducteur complet par type de projet
//  élément : [type, titre, durée s, { t: intervenants, c: caméras engagées, s: découpage [[cam, plan, mouvement, description, top, durée]],
//             g: habillage [[type, texte, à]], src, au (son), li (lumière), no (notes), hard, st (statut), sc (texte), res (réserve) }]
// ---------------------------------------------------------------------
const XM_RUN = {
    tv: C => { const [J, K, S, H, R, F] = C.cast.map(c => c.name); return [['#', 'Avant antenne', '#78909C'], ['public', 'Chauffe de salle', 300, { no: 'Max Durand chauffe le public, consignes applaudissements.', s: [[5, 'PUB', 'Épaule libre', 'Public qui applaudit', 'Top chauffeur']] }],
        ['open', 'Générique', 30, { hard: '19:00:00', st: 'ok', src: 'VT1', g: [['Logo', C.short, '0:00']], li: 'Mém. 1 : ouverture lumière salle', s: [[1, 'PG', 'Grue descente', 'Plateau général, public debout', 'Fin VT', 10]] }],
        ['#', 'Partie 1', '#42A5F5'], ['plateau', 'Lancement de l’émission', 90, { t: [J, K, S], st: 'rep', sc: 'Bonsoir à toutes et à tous, bienvenue dans ' + C.short + ' ! Ce soir, une astrophysicienne qui va nous faire lever les yeux…', g: [['Synthé nom', J + ' — Présentatrice', '0:05']], s: [[2, 'PR', 'Fixe', 'Julia face caméra', 'Top générique', 25], [3, '2S', 'Fixe', 'Chroniqueurs', '« …et toujours avec moi »', 10], [1, 'PL', 'Grue balayage', 'Plateau entier', 'Lancement invitée', 8]] }],
        ['itw', 'Interview — ' + H, 420, { t: [J, H], st: 'rep', g: [['Synthé nom', H, '0:15'], ['Réseaux sociaux', '#' + C.short.replace(/\W/g, ''), '3:00']], li: 'Mém. 5 : ambiance salon', s: [[3, '2S', 'Fixe', 'Julia et l’invitée', 'Début', 15], [3, 'PR', 'Fixe', 'L’invitée', 'Réponses'], [4, 'PR', 'Fixe', 'Contrechamp Julia', 'Questions'], [6, 'PE', 'Fixe', 'Zénithale du desk', 'Transition']] }],
        ['vt', 'Reportage — Une nuit à l’observatoire', 180, { src: 'VT2', st: 'ok', au: 'VT stéréo', no: 'Pendant le VT : installation du groupe sur la scène musicale.' }],
        ['game', 'La chronique de Karim', 240, { t: [K], g: [['Plein écran', 'La semaine en 5 images', '0:10']], s: [[4, 'PR', 'Fixe', 'Karim au prompteur', 'Début', 60], [1, 'PM', 'Zoom arrière', 'Élargissement sur l’écran LED', 'Image 3']] }],
        ['pub', 'Coupure publicitaire', 180, { st: 'ok' }],
        ['#', 'Partie 2', '#EC407A'], ['live', 'Live — ' + F, 210, { t: [F], g: [['Titre', F + ' — titre inédit', '0:10']], au: 'Multipiste, mix TV', li: 'Mém. 12 : scène musicale', s: [[1, 'PL', 'Grue balayage', 'Groupe', 'Intro', 15], [3, 'PR', 'Fixe', 'Chanteur', 'Couplet'], [5, 'PM', 'Épaule libre', 'Dans le public', 'Refrain']] }],
        ['plateau', 'Débat final', 300, { t: [J, K, S, R], s: [[1, 'PG', 'Grue montée', 'Plateau général', 'Début'], [2, 'PR', 'Fixe', 'Julia relance', ''], [3, 'PR', 'Fixe', 'Romain Delcourt', 'Vanne']] }],
        ['end', 'Générique de fin', 40, { g: [['Crédits', 'Générique déroulant', '0:00']], s: [[1, 'PG', 'Grue montée', 'Plateau, public debout', 'Générique']] }]]; },
    corporate: C => { const [CF, MD, SB, TW, EM] = C.cast.map(c => c.name); return [['#', 'Accueil', '#78909C'], ['public', 'Écran d’attente & installation de la salle', 900, { hard: '08:45:00', src: 'VT1', no: 'Compte à rebours sur l’écran LED et le streaming.' }],
        ['#', 'Plénière d’ouverture', '#2ECC71'], ['open', 'Film d’ouverture Helvia 2027', 120, { hard: '09:00:00', st: 'ok', src: 'VT2', au: 'Film stéréo', li: 'Salle au noir' }],
        ['plateau', 'Accueil par ' + EM, 180, { t: [EM], g: [['Synthé nom', EM + ' — Maîtresse de cérémonie', '0:10']], s: [[2, 'PL', 'Grue balayage', 'Salle et scène', 'Fin du film', 10], [1, 'PT', 'Fixe', 'Élodie au centre', 'Début']] }],
        ['speech', 'Discours de ' + CF + ' — Cap 2030', 1200, { t: [CF], st: 'rep', g: [['Synthé nom', CF + ' — PDG', '0:15'], ['Bandeau', 'Cap 2030 : énergie locale, impact global', '5:00']], src: 'SL1', no: 'Prompteur : texte V7 validé. Slides 1 à 24.', s: [[1, 'PR', 'Fixe', 'PDG au pupitre', 'Début'], [4, 'PUB', 'Fixe', 'Salle attentive', 'Applaudissements', 6], [2, 'PL', 'Grue balayage', 'Scène et écran', 'Slide chiffres clés']] }],
        ['speech', 'Résultats 2026 — ' + MD, 900, { t: [MD], g: [['Synthé nom', MD + ' — Directeur financier', '0:10'], ['Compteur', '+18 % de chiffre d’affaires', '3:00']], src: 'SL1', s: [[1, 'PR', 'Fixe', 'Marc au pupitre', 'Début']] }],
        ['#', 'Table ronde', '#42A5F5'], ['itw', 'Table ronde innovation', 2700, { t: [EM, SB, MD, TW], g: [['Synthé nom', SB + ' — Directrice innovation', '0:30'], ['Synthé nom', TW + ' — Navigateur', '1:00'], ['QR code', 'Posez vos questions sur Slido', '20:00']], no: 'Questions de la salle à partir de 30:00 (micros salle 1 et 2).', s: [[3, 'PE', 'Fixe', 'Les 4 fauteuils', 'Début', 20], [3, 'PR', 'Fixe', 'Intervenant qui parle', ''], [4, 'PUB', 'Fixe', 'Question de la salle', 'Micro salle'], [2, 'PL', 'Grue balayage', 'Scène', 'Transition']] }],
        ['pub', 'Pause — best-of 2026', 900, { src: 'VT3' }],
        ['speech', 'Grand témoin — ' + TW, 1800, { t: [TW], g: [['Synthé nom', TW + ' — Navigateur, 3 tours du monde', '0:15']], src: 'VT4', s: [[1, 'PA', 'Fixe', 'Thomas sur scène, sans pupitre', 'Début'], [2, 'PG', 'Grue montée', 'Salle debout', 'Fin']] }],
        ['end', 'Clôture & remerciements', 300, { t: [CF, EM], g: [['Réseaux sociaux', '#Helvia2027', '1:00']], s: [[2, 'PG', 'Grue montée', 'Photo de famille sur scène', 'Fin']] }]]; },
    event: C => { const [EM, QL, CA, PR, LA] = C.cast.map(c => c.name); const Lt = ['Mobilité', 'Santé', 'Agriculture', 'Numérique', 'Industrie', 'Coup de cœur'];
        return [['#', 'Accueil', '#78909C'], ['public', 'Cocktail & placement des invités', 1500, { hard: '19:30:00', no: 'Écrans salle : boucle des partenaires.' }],
            ['#', 'Ouverture', '#C9A227'], ['open', 'Numéro aérien — ' + CA, 240, { hard: '20:00:00', t: [CA, QL], st: 'rep', li: 'Mém. 1 : douche sur le tissu, salle au noir', au: 'Quatuor live (4 HF)', s: [[1, 'PG', 'Grue montée', 'L’artiste s’élève dans le tissu', 'Début', 30], [3, 'PM', 'Orbite', 'Steadicam autour du quatuor', 'Thème 2'], [2, 'GP', 'Fixe', 'Visage de l’artiste', 'Final']] }],
            ['plateau', 'Entrée de ' + EM, 120, { t: [EM], g: [['Synthé nom', EM + ' — Maîtresse de cérémonie', '0:10']], s: [[3, 'PM', 'Steadicam suivi', 'Élodie descend l’escalier', 'Top musique'], [2, 'PR', 'Fixe', 'Élodie face', 'Bonsoir']] }],
            ['speech', 'Discours d’ouverture — ' + PR, 420, { t: [PR], g: [['Synthé nom', PR, '0:10']], s: [[5, 'PR', 'Fixe', 'PTZ pupitre', 'Début'], [1, 'PL', 'Grue balayage', 'Salle', 'Applaudissements']] }],
            ['#', 'Remise des trophées', '#6A1B9A']].concat(Lt.map((l, i) => ['speech', 'Trophée ' + l, 420, { t: [EM, LA], src: 'VT' + (i + 1), g: [['Titre', 'Trophée ' + l, '0:05'], ['Synthé nom', 'Lauréat ' + l, '1:30']], li: 'Jets d’étincelles froides à l’annonce', st: i < 2 ? 'rep' : 'prep', s: [[4, 'PL', 'Fixe', 'Lauréat se lève dans la salle', 'Annonce'], [3, 'PM', 'Steadicam suivi', 'Montée sur scène', ''], [5, 'PR', 'Fixe', 'Discours au pupitre', ''], [2, 'PE', 'Fixe', 'Photo officielle', 'Remise']] }]))
            .concat([['live', 'Intermède — ' + QL, 240, { t: [QL] }], ['speech', 'Trophée spécial du jury (réserve)', 300, { res: true, no: 'Seulement si le timing le permet.' }], ['end', 'Photo de famille & lancement du dîner', 180, { t: [EM, LA], s: [[1, 'PG', 'Grue montée', 'Tous les lauréats sur scène', 'Final']] }]]); },
    fiction: C => { const out = []; C.days.forEach((d, i) => { out.push(['#', 'J' + (i + 1) + ' — ' + ((C.p.dayTitles || [])[i] || d), ['#42A5F5', '#EC407A', '#66BB6A', '#FFA726', '#AB47BC'][i % 5]]); C.sched(i).forEach(x => { if (x.ev) out.push([/repas/i.test(x.desc) ? 'pub' : /convoc/i.test(x.desc) ? 'open' : 'end', x.desc, /repas/i.test(x.desc) ? 3600 : 1800, { hard: x.time + ':00', st: d < xmToday() ? 'ok' : 'prep' }]); else { const s = C.seqs.find(q => q.num === x.seq); out.push(['plateau', 'Séq. ' + x.seq + ' — ' + (s ? C.heading(s) : x.desc), s ? Math.max(3600, s.plans.length * 2700) : 3600, { hard: x.time + ':00', t: (s ? s.chars : []).map(c => (C.castOf(c) || { name: c }).name), no: x.desc, st: d < xmToday() ? 'ok' : 'prep', s: s ? s.plans.map(pl => [pl.k % 2 ? 1 : 2, XM_PLAN(pl.valeur === 'PL' ? 'PG' : pl.valeur), XM_MV[pl.mvt] || 'Fixe', pl.desc, 'Plan ' + s.num + '.' + pl.k, null]) : [] }]); } }); }); return out; },
    doc: C => { const [JP, MA, AK] = C.cast.map(c => c.name); return [['#', 'Avant antenne', '#78909C'], ['open', 'Générique « ' + C.short + ' »', 40, { hard: '20:55:00', src: 'VT1', st: 'ok' }],
        ['plateau', 'Lancement en plateau', 120, { t: [C.director], g: [['Synthé nom', C.director + ' — Réalisatrice', '0:10']], s: [[1, 'PR', 'Fixe', 'Réalisatrice en plateau', 'Début']] }],
        ['vt', 'Chapitre 1 — L’éclusier', 900, { src: 'VT2', t: [JP], g: [['Synthé nom', JP + ' — Éclusier', '1:20']] }], ['vt', 'Chapitre 2 — La capitaine', 840, { src: 'VT3', t: [MA], g: [['Synthé nom', MA + ' — Capitaine de péniche', '0:40']] }],
        ['duplex', 'Duplex depuis l’écluse de Pierre-Bénite', 240, { src: 'DPX1', t: [JP], s: [[2, 'PM', 'Épaule libre', 'Jean-Pierre devant l’écluse', 'Top duplex']] }],
        ['vt', 'Chapitre 3 — Ce que l’eau raconte', 900, { src: 'VT4', t: [AK], g: [['Synthé nom', AK + ' — Hydrobiologiste', '0:30']] }],
        ['itw', 'Débat : l’avenir du Rhône', 1200, { t: [C.director, AK], g: [['QR code', 'Votre question : #GardiensDuRhone', '5:00']], s: [[1, '2S', 'Fixe', 'Débat', 'Début'], [1, 'PR', 'Fixe', 'Amina', '']] }],
        ['end', 'Générique de fin', 60, { g: [['Crédits', 'Générique', '0:00']] }]]; },
    pub: C => { const out = []; C.days.forEach((d, i) => { out.push(['#', 'J' + (i + 1) + ' — ' + ((C.p.dayTitles || [])[i] || d), i ? '#E8B87D' : '#C9786B']); C.sched(i).forEach(x => { const s = C.seqs.find(q => q.num === x.seq); out.push(x.ev ? [/repas/i.test(x.desc) ? 'pub' : 'trans', x.desc, /repas/i.test(x.desc) ? 3600 : 1800, { hard: x.time + ':00' }] : ['plateau', 'Plan ' + x.seq + ' — ' + (s ? C.heading(s) : ''), s ? s.plans.length * 3600 : 3600, { hard: x.time + ':00', t: (s ? s.chars : []).map(c => (C.castOf(c) || { name: c }).name), no: x.desc + (s && /plage|aube/i.test(C.heading(s)) ? ' — lever du soleil : la lumière dure 25 min, tout doit être prêt.' : ''), s: s ? s.plans.map(pl => [/drone/.test(pl.mvt) ? 1 : 1, XM_PLAN(pl.valeur === 'PL' ? 'PG' : pl.valeur), XM_MV[pl.mvt] || 'Fixe', pl.desc, 'Validation agence', null]) : [] }]); }); }); return out; },
    artistique: C => { const [KA, LM, AY, MD, EN] = C.cast.map(c => c.name); return [['#', 'Avant la représentation', '#78909C'], ['public', 'Entrée du public', 900, { hard: '20:15:00', li: 'Salle en service, plateau au noir' }],
        ['speech', 'Mot d’accueil des Subsistances', 120, { s: [[1, 'PG', 'Fixe', 'Plan large salle', 'Début']] }],
        ['#', 'MÉTAMORPHOSES', '#7C4DFF'], ['live', 'I. Éclosion', 900, { hard: '20:30:00', t: [KA], src: 'MS1', li: 'Contres découpés, mapping toile', s: [[1, 'PG', 'Fixe', 'Toile et mapping', 'Noir', 30], [2, 'PM', 'Orbite', 'Steadicam autour de Kenza', 'Kenza sort de la toile'], [3, 'TGP', 'Fixe', 'Mains et texture projetée', 'Ralenti musical']] }],
        ['live', 'II. Mue', 1200, { t: [KA, LM, AY, MD], src: 'MS2', s: [[4, 'PG', 'Fixe', 'Zénithale : motifs au sol', 'Quatuor au sol'], [2, 'PM', 'Steadicam suivi', 'Traversée', 'Accélération']] }],
        ['live', 'III. Envol', 900, { t: [KA, EN], src: 'MS3', li: 'Douches HMI blanches au final', s: [[1, 'PG', 'Fixe', 'Le cercle de l’ensemble', 'Entrée ensemble'], [3, 'GP', 'Fixe', 'Visage de Kenza', 'Final']] }],
        ['end', 'Saluts', 180, { t: [KA, LM, AY, MD, EN], s: [[1, 'PG', 'Fixe', 'Saluts', 'Lumière salle']] }], ['itw', 'Bord de scène avec Naïma Ferhat', 1200, { t: [C.director], st: 'prep' }]]; }
};
XMA.conduco = C => {
    P = newProject(); P.name = C.title; P.author = C.director; P.resources.cams = []; P.tabs = [];
    const b = builder();
    if (C.type === 'live') { const t = modelConcert(b); t.date = C.day(1); t.name = 'Direct — ' + C.day(1); P.tabs = [t]; P.active = 0; return P; }
    const COLS = ['#EF5350', '#FFA726', '#FFD54F', '#66BB6A', '#26C6DA', '#42A5F5', '#AB47BC', '#EC407A'];
    const CT = n => /steadi/i.test(n) ? 'Steadicam' : /grue|jib/i.test(n) ? 'Grue / Jib' : /ptz/i.test(n) ? 'PTZ / Tourelle' : /épaule|epaule|public/i.test(n) ? 'Épaule' : /drone/i.test(n) ? 'Drone' : /zénith|zenith/i.test(n) ? 'Caméra fixe' : 'Studio / pied';
    const cams = {}; C.p.cams.forEach((c, i) => cams[i + 1] = b.cam(i + 1, c[0], CT(c[0]), COLS[i % 8], c[4] || '', c[2], c[3]));
    const tal = {}; C.cast.forEach((c, i) => tal[c.name] = b.tal(c.name, c.role, /musicien|figurant/.test(c.kind) ? '' : 'HF ' + (i + 1)));
    const srcs = {}; const S = code => { if (!code) return ''; if (!srcs[code]) srcs[code] = b.src(code, { VT: 'Film / VT', SL: 'Slides', MS: 'Média serveur', DP: 'Duplex' }[code.slice(0, 2)] + ' ' + code.replace(/\D/g, ''), /^SL|^MS/.test(code) ? 'Écran' : /^DP/.test(code) ? 'Duplex' : 'VT'); return srcs[code]; };
    const show = C.days.length > 1 && /tv|corporate|event|artistique/.test(C.type) ? C.days.length - 1 : 0;
    const t = newTab(/fiction|pub/.test(C.type) ? 'Plan de travail horaire' : 'Conducteur — ' + C.day(show));
    t.date = C.day(show); t.items = [];
    const spec = (XM_RUN[C.type] || XM_RUN.tv)(C), first = spec.find(x => x[0] !== '#' && x[3] && x[3].hard);
    t.start = first ? first[3].hard : '20:00:00';
    spec.forEach(x => {
        if (x[0] === '#') { t.items.push(newHeader(x[1], x[2])); return; }
        const o = x[3] || {}, it = newItem(x[0], { title: x[1], dur: x[2], status: o.st || 'prep', reserve: !!o.res, script: o.sc || '', notes: o.no || '', audio: o.au || '', light: o.li || '', source: S(o.src) });
        if (o.hard && /fiction|pub/.test(C.type)) it.hard = o.hard;
        it.talents = (o.t || []).map(n => tal[n] || b.tal(n, '', '')).filter(Boolean);
        it.cams = (o.c || []).map(n => cams[n]).filter(Boolean);
        it.shots = (o.s || []).map(s => newShot({ cam: cams[s[0]] || '', plan: s[1], move: s[2], desc: s[3], cue: s[4] || '', dur: s[5] || null }));
        it.gfx = (o.g || []).map(g => G(g[0], g[1], g[2]));
        t.items.push(it);
    });
    P.tabs = [t]; P.active = 0;
    return P;
};
// ---------------------------------------------------------------------
//  XMODELS — SYNO : un synoptique complet par type de projet
//  nœud : [clé, colonne, titre, entrées[], sorties[], ip, commentaire] · câble : [de, sortie, vers, entrée, nom]
//  zone : [titre, couleur, clés[]] · note : [colonne, ligne, texte]
// ---------------------------------------------------------------------
const XM_SC = { sdi: '#007ACC', fib: '#FFB300', hdmi: '#7E57C2', xlr: '#E53935', ip: '#43A047', dmx: '#FF7043', com: '#8D6E63', aes: '#EC407A' };
const xmSig = t => /fibre|smpte/i.test(t) ? XM_SC.fib : /hdmi|hdbaset/i.test(t) ? XM_SC.hdmi : /xlr|ligne|jack|analog/i.test(t) ? XM_SC.xlr : /rj45|dante|ndi|ethernet|artnet|réseau|ip\b|srt|usb/i.test(t) ? XM_SC.ip : /dmx/i.test(t) ? XM_SC.dmx : /intercom|4 fils|beltpack/i.test(t) ? XM_SC.com : /aes|madi/i.test(t) ? XM_SC.aes : XM_SC.sdi;
const XM_CAMS = (C, sig) => C.p.cams.map((c, i) => ['c' + (i + 1), 0, 'CAM ' + (i + 1) + ' — ' + c[0] + ' (' + c[1] + ')', [], [/ptz|mini|marshall|micro studio/i.test(c[0] + c[1]) ? 'SDI OUT' : sig], '', c[3] + (c[4] ? ' · ' + c[4] : '')]);
const XM_SY = {
    live: C => { const n = C.p.cams.length, ccu = C.p.cams.map((c, i) => i).filter(i => !/ptz|mini|marshall|épaule|steadi/i.test(C.p.cams[i][0]));
        return { nodes: XM_CAMS(C, 'Fibre SMPTE OUT').map((x, i) => /steadi/i.test(C.p.cams[i][0]) ? (x[4] = ['Émetteur HF vidéo'], x) : /épaule/i.test(C.p.cams[i][0]) ? (x[4] = ['SDI OUT'], x) : x).concat([
            ['ccu', 1, 'Bases caméra Sony HDCU-3500 (CCU)', ccu.map(i => 'Fibre SMPTE IN CAM ' + (i + 1)), ccu.map(i => 'SDI OUT CAM ' + (i + 1)), '10.10.1.20', 'Réglages vision depuis les RCP (Yanis Morel)'],
            ['hfrx', 1, 'Récepteur HF vidéo (steadicam)', ['Antenne HF'], ['SDI OUT'], '', 'Liaison COFDM, délai 1 image'],
            ['evs', 1, 'Serveur ralentis EVS XT-VIA', ['SDI IN 1', 'SDI IN 2', 'SDI IN 3', 'SDI IN 4'], ['SDI OUT PGM 1', 'SDI OUT PGM 2'], '10.10.1.30', 'Medhi Saïdi — ralentis & best-of'],
            ['gfx', 1, 'Habillage GRAPHICO / CasparCG', ['RJ45 IN Contrôle'], ['SDI OUT Fill', 'SDI OUT Key'], '10.10.1.40', 'Titres des chansons, synthés'],
            ['vt', 1, 'Lecteur VT (playout)', [], ['SDI OUT VT'], '10.10.1.41', 'Générique, portrait de Lina'],
            ['mix', 2, 'Mélangeur Sony XVS-G1 (2 M/E)', Array.from({ length: n }, (x, i) => 'SDI IN ' + (i + 1)).concat(['SDI IN EVS 1', 'SDI IN EVS 2', 'SDI IN GFX Fill', 'SDI IN GFX Key', 'SDI IN VT']), ['SDI OUT PGM', 'SDI OUT PGM clean', 'SDI OUT AUX 1 (écran LED)', 'SDI OUT AUX 2 (ISO)', 'SDI OUT Multiviewer 1', 'SDI OUT Multiviewer 2'], '10.10.1.10', 'Réalisatrice : Sarah Leroy'],
            ['mv', 3, 'Murs d’écrans multiviewer (régie)', ['SDI IN MV 1', 'SDI IN MV 2'], [], '', '2 × 55" — 16 sources'],
            ['iso', 3, 'Enregistreurs ISO HyperDeck ×6', ['SDI IN PGM', 'SDI IN ISO'], [], '10.10.1.50', 'ProRes 422 HQ, sauvegarde BACKUPO'],
            ['emb', 3, 'Embedder audio (PGM + mix TV)', ['SDI IN PGM', 'AES IN Mix TV'], ['SDI OUT PGM embeddé'], '', ''],
            ['fib', 4, 'Liaison fibre diffuseur (France 4)', ['SDI IN PGM'], [], '', 'Contribution 1080i50, secours satellite'],
            ['enc', 4, 'Encodeur streaming SRT', ['SDI IN PGM'], ['RJ45 OUT Internet'], '10.10.1.60', 'Vers RUNO / plateforme'],
            ['led', 4, 'Processeur écran LED scène', ['SDI IN AUX 1'], ['RJ45 OUT Dalles'], '10.10.2.10', 'Écran LED 12 × 4 m'],
            ['sb', 0, 'Stagebox scène (Dante 64 voies)', ['XLR IN 1-32', 'XLR IN 33-48'], ['Dante OUT Primaire', 'Dante OUT Secondaire'], '10.10.3.10', 'Split façade / retours / TV'],
            ['foh', 1, 'Console façade DiGiCo SD12', ['Dante IN'], ['AES OUT Façade'], '10.10.3.20', 'Louis Garnier'],
            ['mon', 1, 'Console retours (ears)', ['Dante IN'], ['RJ45 OUT Émetteurs ears'], '10.10.3.21', 'Inès Faure'],
            ['tv', 2, 'Console broadcast Lawo mc²36 (car)', ['Dante IN'], ['AES OUT Mix TV stéréo', 'AES OUT 5.1'], '10.10.3.30', 'Sami Roux — mix TV'],
            ['sw', 2, 'Switch réseau Dante / contrôle', ['RJ45 IN 1', 'RJ45 IN 2', 'RJ45 IN 3'], ['RJ45 OUT 1', 'RJ45 OUT 2'], '10.10.0.1', ''],
            ['icom', 3, 'Matrice intercom Riedel Artist', ['RJ45 IN Bolero'], ['4 fils OUT CCU', 'RJ45 OUT Beltpacks HF'], '10.10.4.10', 'Bolero : cadreurs, régie plateau, lumière']]),
            conns: ccu.map((i, k) => ['c' + (i + 1), 0, 'ccu', k, 'Fibre CAM ' + (i + 1)]).concat(ccu.map((i, k) => ['ccu', k, 'mix', i])).concat(C.p.cams.map((c, i) => /steadi/i.test(c[0]) ? [['c' + (i + 1), 0, 'hfrx', 0], ['hfrx', 0, 'mix', i]] : !ccu.includes(i) ? [['c' + (i + 1), 0, 'mix', i]] : []).flat())
                .concat([['mix', 3, 'evs', 0], ['evs', 0, 'mix', n], ['evs', 1, 'mix', n + 1], ['gfx', 0, 'mix', n + 2], ['gfx', 1, 'mix', n + 3], ['vt', 0, 'mix', n + 4], ['mix', 4, 'mv', 0], ['mix', 5, 'mv', 1], ['mix', 0, 'iso', 0], ['mix', 3, 'iso', 1], ['mix', 0, 'emb', 0], ['tv', 0, 'emb', 1], ['emb', 0, 'fib', 0], ['emb', 0, 'enc', 0], ['mix', 2, 'led', 0], ['sb', 0, 'foh', 0], ['sb', 0, 'mon', 0], ['sb', 1, 'tv', 0]]),
            zones: [['Plateau', '#EF5350', C.p.cams.map((c, i) => 'c' + (i + 1)).concat(['sb'])], ['Car régie HD12', '#42A5F5', ['ccu', 'hfrx', 'evs', 'gfx', 'vt', 'mix', 'mv', 'iso', 'emb', 'tv', 'sw', 'icom']], ['Diffusion', '#66BB6A', ['fib', 'enc', 'led']]],
            notes: [[4, 0, '📡 Contribution : fibre diffuseur + secours satellite. Streaming via SRT vers la plateforme.']] }; },
    tv: C => { const n = C.p.cams.length; return { nodes: XM_CAMS(C, 'Fibre SMPTE OUT').concat([
            ['ccu', 1, 'Bases caméra (CCU) ×5', ['Fibre IN 1', 'Fibre IN 2', 'Fibre IN 3', 'Fibre IN 4', 'Fibre IN 5'], ['SDI OUT 1', 'SDI OUT 2', 'SDI OUT 3', 'SDI OUT 4', 'SDI OUT 5'], '10.20.1.20', ''],
            ['pmt', 1, 'PC prompteur (Autoscript)', [], ['SDI OUT Texte'], '10.20.1.25', 'Kevin Roche'],
            ['gfx', 1, 'Habillage GRAPHICO', ['RJ45 IN'], ['SDI OUT Fill', 'SDI OUT Key'], '10.20.1.40', 'Synthés, plein écran chronique'],
            ['vt', 1, 'Serveur VT / playout', [], ['SDI OUT VT 1', 'SDI OUT VT 2'], '10.20.1.41', 'Reportages, jingles'],
            ['mix', 2, 'Mélangeur Ross Carbonite (2 M/E)', Array.from({ length: n }, (x, i) => 'SDI IN ' + (i + 1)).concat(['SDI IN VT 1', 'SDI IN VT 2', 'SDI IN GFX Fill', 'SDI IN GFX Key']), ['SDI OUT PGM', 'SDI OUT AUX 1 (écran LED)', 'SDI OUT AUX 2 (retour plateau)', 'SDI OUT Multiviewer'], '10.20.1.10', 'Réal : ' + C.director],
            ['pmon', 2, 'Moniteur prompteur CAM 2', ['SDI IN'], [], '', ''],
            ['mv', 3, 'Multiviewer régie', ['SDI IN'], [], '', ''], ['rec', 3, 'Enregistreurs PGM + ISO', ['SDI IN PGM'], [], '10.20.1.50', 'PAD : ProRes 422 HQ'], ['led', 3, 'Écran LED plateau 8 × 3 m', ['SDI IN AUX 1'], [], '10.20.2.10', ''], ['ret', 3, 'Retours plateau (TV 55")', ['SDI IN AUX 2'], [], '', ''],
            ['hf', 0, 'Récepteurs HF Sennheiser 6000 ×7', [], ['AES OUT 1-8'], '10.20.3.5', 'Présentatrice, chroniqueurs, invités'],
            ['cs', 1, 'Console son Yamaha QL1', ['AES IN HF', 'XLR IN Ambiances', 'XLR IN Groupe'], ['SDI OUT Embed', 'XLR OUT Diffusion public'], '10.20.3.20', C.whoName('Chef opérateur son')],
            ['icom', 2, 'Intercom Clear-Com (régie, plateau, cadreurs)', ['RJ45 IN'], ['4 fils OUT'], '10.20.4.10', '']]),
            conns: [0, 1, 2, 3, 4].filter(i => i < n - 1).map(i => ['c' + (i + 1), 0, 'ccu', i]).concat([0, 1, 2, 3, 4].filter(i => i < n - 1).map(i => ['ccu', i, 'mix', i])).concat([['c' + n, 0, 'mix', n - 1], ['vt', 0, 'mix', n], ['vt', 1, 'mix', n + 1], ['gfx', 0, 'mix', n + 2], ['gfx', 1, 'mix', n + 3], ['pmt', 0, 'pmon', 0], ['mix', 3, 'mv', 0], ['mix', 0, 'rec', 0], ['mix', 1, 'led', 0], ['mix', 2, 'ret', 0], ['hf', 0, 'cs', 0]]),
            zones: [['Plateau 4', '#EF5350', XM_CAMS(C, '').map(x => x[0]).concat(['hf', 'pmon', 'led', 'ret'])], ['Régie finale', '#42A5F5', ['ccu', 'pmt', 'gfx', 'vt', 'mix', 'mv', 'rec', 'cs', 'icom']]], notes: [] }; },
    fiction: C => ({ nodes: [
            ['ca', 0, 'Caméra A — ' + C.p.cams[0][1], ['TC IN (LEMO)'], ['SDI OUT 1', 'SDI OUT 2'], '', C.p.cams[0][2]], ['cb', 0, 'Caméra B — ' + (C.p.cams[1] || C.p.cams[0])[1], ['TC IN (LEMO)'], ['SDI OUT 1', 'SDI OUT 2'], '', (C.p.cams[1] || C.p.cams[0])[2]],
            ['ma', 1, 'Moniteur 1er assistant A (SmallHD 7")', ['SDI IN'], [], '', 'Point : ' + C.whoName('1re assistante caméra')], ['ta', 1, 'Émetteur Teradek Bolt A', ['SDI IN'], ['Liaison HF vidéo'], '', ''], ['tb', 1, 'Émetteur Teradek Bolt B', ['SDI IN'], ['Liaison HF vidéo'], '', ''], ['mb', 1, 'Moniteur assistant B', ['SDI IN'], [], '', ''],
            ['ra', 2, 'Récepteur Teradek A', ['Liaison HF vidéo'], ['SDI OUT 1', 'SDI OUT 2'], '', ''], ['rb', 2, 'Récepteur Teradek B', ['Liaison HF vidéo'], ['SDI OUT 1', 'SDI OUT 2'], '', ''],
            ['vv', 3, 'Combo réal — SmallHD Cine 13 (quad)', ['SDI IN A', 'SDI IN B'], [], '', C.director + ', ' + C.whoName('Scripte')], ['dit', 3, 'Station DIT (Livegrade + LUT)', ['SDI IN A', 'SDI IN B'], ['SDI OUT LUT A', 'SDI OUT LUT B'], '', C.whoName('DIT')], ['cl', 4, 'Moniteur chef opérateur (étalonné)', ['SDI IN A', 'SDI IN B'], [], '', C.whoName('Chef opérateur')],
            ['rd', 3, 'Lecteur de cartes Codex / CFexpress', [], ['USB-C OUT'], '', ''], ['bk', 4, 'Sauvegarde BACKUPO (2 copies + LTO)', ['USB-C IN'], [], '', 'Checksums xxHash, rapport de fin de journée'],
            ['pe', 0, 'Perche Sennheiser MKH 416', [], ['XLR OUT'], '', C.whoName('Perchman')], ['hfr', 0, 'Récepteurs HF Lectrosonics ×4', [], ['XLR OUT 1', 'XLR OUT 2', 'XLR OUT 3', 'XLR OUT 4'], '', 'Léa, Max, Inès, Patron'],
            ['sd', 1, 'Enregistreur Sound Devices 888', ['XLR IN Perche', 'XLR IN HF 1', 'XLR IN HF 2', 'XLR IN HF 3', 'XLR IN HF 4'], ['TC OUT', 'Jack OUT Comtek'], '', C.whoName('Chef opératrice son')],
            ['tc', 2, 'Tentacle Sync (maître TC)', ['TC IN'], ['TC OUT A', 'TC OUT B'], '', 'Jam sync chaque matin'], ['ct', 2, 'Émetteur Comtek (casques réal & script)', ['Jack IN'], [], '', '']],
        conns: [['ca', 0, 'ma', 0], ['ca', 1, 'ta', 0], ['cb', 0, 'mb', 0], ['cb', 1, 'tb', 0], ['ta', 0, 'ra', 0], ['tb', 0, 'rb', 0], ['ra', 0, 'vv', 0], ['rb', 0, 'vv', 1], ['ra', 1, 'dit', 0], ['rb', 1, 'dit', 1], ['dit', 0, 'cl', 0], ['dit', 1, 'cl', 1], ['rd', 0, 'bk', 0], ['pe', 0, 'sd', 0], ['hfr', 0, 'sd', 1], ['hfr', 1, 'sd', 2], ['hfr', 2, 'sd', 3], ['hfr', 3, 'sd', 4], ['sd', 0, 'tc', 0], ['tc', 0, 'ca', 0], ['tc', 1, 'cb', 0], ['sd', 1, 'ct', 0]],
        zones: [['Plateau', '#EF5350', ['ca', 'cb', 'ma', 'mb', 'ta', 'tb', 'pe', 'hfr']], ['Village vidéo', '#42A5F5', ['ra', 'rb', 'vv', 'dit', 'cl']], ['Son', '#26A69A', ['sd', 'tc', 'ct']], ['Données', '#FFA726', ['rd', 'bk']]], notes: [[4, 6, '🎞️ Rushes : 2 copies sur place + LTO à la prod. Rapport DIT envoyé chaque soir à la post-production (POSTO).']] }),
    doc: C => ({ nodes: [['ca', 0, 'Caméra A — Sony FX6', ['TC IN', 'XLR IN 1', 'XLR IN 2'], ['SDI OUT'], '', 'Interviews & épaule'], ['cb', 0, 'Caméra B — Sony FX3', ['TC IN'], ['HDMI OUT'], '', 'Profil interview'], ['dr', 0, 'Drone DJI Inspire 3', [], ['Liaison HF vidéo'], '', C.whoName('Télépilote drone')],
            ['mo', 1, 'Moniteur réal 7"', ['SDI IN'], [], '', ''], ['rc', 1, 'Radiocommande + écran drone', ['Liaison HF vidéo'], ['HDMI OUT'], '', ''], ['mb', 1, 'Moniteur caméra B', ['HDMI IN'], [], '', ''],
            ['pe', 0, 'Perche MKH 416', [], ['XLR OUT'], '', ''], ['hf', 0, 'Récepteurs HF Sennheiser EW-D ×2', [], ['XLR OUT 1', 'XLR OUT 2'], '', 'Cravates interviewés'],
            ['zf', 1, 'Enregistreur Zoom F6', ['XLR IN 1', 'XLR IN 2', 'XLR IN 3'], ['XLR OUT Retour cam A', 'TC OUT'], '', C.whoName('Ingénieure du son')], ['tc', 2, 'Tentacle Sync E ×3', ['TC IN'], ['TC OUT A', 'TC OUT B'], '', ''],
            ['lap', 2, 'Portable de sauvegarde', ['USB-C IN Cartes'], ['USB-C OUT'], '', 'Sauvegarde chaque soir'], ['ssd', 3, 'SSD navette ×2 (BACKUPO)', ['USB-C IN'], [], '', 'Une copie part avec la réalisatrice']],
        conns: [['ca', 0, 'mo', 0], ['cb', 0, 'mb', 0], ['dr', 0, 'rc', 0], ['pe', 0, 'zf', 0], ['hf', 0, 'zf', 1], ['hf', 1, 'zf', 2], ['zf', 0, 'ca', 1], ['zf', 1, 'tc', 0], ['tc', 0, 'ca', 0], ['tc', 1, 'cb', 0], ['lap', 0, 'ssd', 0]],
        zones: [['Image', '#42A5F5', ['ca', 'cb', 'dr', 'mo', 'rc', 'mb']], ['Son', '#26A69A', ['pe', 'hf', 'zf', 'tc']], ['Données', '#FFA726', ['lap', 'ssd']]], notes: [] }),
    pub: C => ({ nodes: [['ca', 0, 'Caméra A — ARRI Alexa 35', ['TC IN'], ['SDI OUT 1', 'SDI OUT 2'], '', 'Signature Prime'], ['ph', 0, 'Caméra ralenti — Phantom Flex 4K', ['Trigger IN'], ['SDI OUT', 'RJ45 OUT Contrôle'], '', 'Jusqu’à 1 000 i/s'], ['tc', 0, 'Technocrane 22 (tête Libra)', [], ['RJ45 OUT Télécommande'], '', ''],
            ['tx', 1, 'Émetteur Teradek Bolt 6 XT', ['SDI IN'], ['Liaison HF vidéo'], '', ''], ['pc', 1, 'PC Phantom (PCC)', ['RJ45 IN'], ['RJ45 OUT Données'], '', 'Visionnage des prises ralenti'], ['rx', 2, 'Récepteur Teradek', ['Liaison HF vidéo'], ['SDI OUT 1', 'SDI OUT 2'], '', ''],
            ['dit', 3, 'Station DIT (Livegrade, LUT Aurore)', ['SDI IN A', 'SDI IN Phantom'], ['SDI OUT 1', 'SDI OUT 2', 'SDI OUT 3'], '', C.whoName('DIT')], ['da', 4, 'Distributeur SDI 1→4', ['SDI IN'], ['SDI OUT 1', 'SDI OUT 2', 'SDI OUT 3', 'SDI OUT 4'], '', ''],
            ['vr', 5, 'Moniteur réalisateur Sony PVM-X2400', ['SDI IN'], [], '', C.director], ['vc', 5, 'Moniteur client & agence (village)', ['SDI IN'], [], '', 'Isabelle Aurore, Sophie Blanc'], ['vh', 5, 'Moniteur HMC / stylisme', ['SDI IN'], [], '', ''], ['rec', 5, 'Enregistreur témoin (Atomos)', ['SDI IN'], [], '', 'Visionnage client immédiat'],
            ['pb', 2, 'Playback musique (QLab)', [], ['XLR OUT L', 'XLR OUT R'], '', 'Musique au tempo pour les mouvements'], ['hp', 3, 'Enceintes plateau', ['XLR IN L', 'XLR IN R'], [], '', ''], ['nas', 4, 'Sauvegarde BACKUPO + navette', ['RJ45 IN'], [], '', '']],
        conns: [['ca', 0, 'tx', 0], ['tx', 0, 'rx', 0], ['rx', 0, 'dit', 0], ['ph', 0, 'dit', 1], ['ph', 1, 'pc', 0], ['pc', 0, 'nas', 0], ['dit', 0, 'da', 0], ['da', 0, 'vr', 0], ['da', 1, 'vc', 0], ['da', 2, 'vh', 0], ['da', 3, 'rec', 0], ['pb', 0, 'hp', 0], ['pb', 1, 'hp', 1]],
        zones: [['Plateau', '#EF5350', ['ca', 'ph', 'tc', 'tx', 'pb', 'hp']], ['DIT', '#FFA726', ['pc', 'rx', 'dit', 'nas']], ['Video village', '#42A5F5', ['da', 'vr', 'vc', 'vh', 'rec']]], notes: [] }),
    corporate: C => ({ nodes: XM_CAMS(C, 'SDI OUT').slice(0, 4).concat([['sl', 0, 'PC slides (PowerPoint)', [], ['HDMI OUT'], '10.30.1.30', C.whoName('Opératrice slides & médias')], ['vis', 0, 'PC visio (intervenant distant)', ['HDMI IN Retour'], ['HDMI OUT'], '10.30.1.31', 'Teams / Zoom en N-1'],
            ['cv', 1, 'Convertisseurs HDMI → SDI ×2', ['HDMI IN 1', 'HDMI IN 2'], ['SDI OUT 1', 'SDI OUT 2'], '', ''],
            ['mix', 2, 'Mélangeur ATEM Television Studio 4K8', ['SDI IN 1', 'SDI IN 2', 'SDI IN 3', 'SDI IN 4', 'SDI IN 5 Slides', 'SDI IN 6 Visio', 'XLR IN Audio'], ['SDI OUT PGM', 'SDI OUT AUX 1 (écran salle)', 'SDI OUT AUX 2 (retour visio)', 'SDI OUT Multiview'], '10.30.1.10', 'Réal : ' + C.director],
            ['pmt', 1, 'Prompteur pupitre', ['SDI IN'], [], '', ''], ['mv', 3, 'Multiview régie', ['SDI IN'], [], '', ''], ['rec', 3, 'Enregistreurs HyperDeck PGM + ISO', ['SDI IN'], [], '10.30.1.50', 'Replay & best-of'],
            ['enc', 3, 'Encodeur streaming (Kiloview E3)', ['SDI IN'], ['RJ45 OUT'], '10.30.1.60', 'Plateforme privée Helvia (SRT/RTMP)'], ['led', 3, 'Processeur LED Novastar + écran 6 × 3 m', ['SDI IN'], [], '10.30.2.10', ''], ['cvr', 3, 'Retour visio (SDI → HDMI)', ['SDI IN'], ['HDMI OUT'], '', ''],
            ['hf', 0, 'Récepteurs HF Shure ULXD ×6', [], ['Dante OUT'], '10.30.3.5', 'MC, intervenants, micros salle'],
            ['cs', 1, 'Console Yamaha QL1', ['Dante IN HF', 'XLR IN Pupitre', 'XLR IN Slides', 'XLR IN Visio'], ['XLR OUT Façade', 'XLR OUT Stream'], '10.30.3.20', C.whoName('Ingénieur du son')], ['pa', 2, 'Diffusion salle (amplis + enceintes)', ['XLR IN'], [], '', ''], ['sw', 2, 'Switch réseau (Dante, contrôle, internet 100 Mb/s)', ['RJ45 IN WAN'], ['RJ45 OUT 1', 'RJ45 OUT 2'], '10.30.0.1', 'Ligne dédiée Centre de Congrès']]),
        conns: [['c1', 0, 'mix', 0], ['c2', 0, 'mix', 1], ['c3', 0, 'mix', 2], ['c4', 0, 'mix', 3], ['sl', 0, 'cv', 0], ['vis', 0, 'cv', 1], ['cv', 0, 'mix', 4], ['cv', 1, 'mix', 5], ['mix', 3, 'mv', 0], ['mix', 0, 'rec', 0], ['mix', 0, 'enc', 0], ['mix', 1, 'led', 0], ['mix', 2, 'cvr', 0], ['cvr', 0, 'vis', 0], ['hf', 0, 'cs', 0], ['cs', 0, 'pa', 0], ['cs', 1, 'mix', 6]],
        zones: [['Salle & scène', '#2ECC71', ['c1', 'c2', 'c3', 'c4', 'hf', 'pmt', 'led']], ['Régie', '#42A5F5', ['sl', 'vis', 'cv', 'mix', 'mv', 'rec', 'enc', 'cvr', 'cs', 'pa', 'sw']]], notes: [[4, 0, '🌐 Streaming interne : lien privé, 1 200 connexions prévues. Secours 4G bondée.']] }),
    event: C => ({ nodes: XM_CAMS(C, 'Fibre SMPTE OUT').concat([['ccu', 1, 'CCU ×3', ['Fibre IN 1', 'Fibre IN 2', 'Fibre IN 3'], ['SDI OUT 1', 'SDI OUT 2', 'SDI OUT 3'], '10.40.1.20', ''],
            ['films', 1, 'Lecteur films lauréats', [], ['SDI OUT'], '10.40.1.41', '6 films de 1 min'],
            ['mix', 2, 'Mélangeur ATEM Constellation 4K', ['SDI IN 1', 'SDI IN 2', 'SDI IN 3', 'SDI IN 4', 'SDI IN 5', 'SDI IN Films'], ['SDI OUT PGM', 'SDI OUT AUX → média serveur', 'SDI OUT Multiview'], '10.40.1.10', ''],
            ['ds', 3, 'Média serveur disguise vx 2', ['SDI IN Capture'], ['SDI OUT LED', 'SDI OUT Rétro'], '10.40.2.5', C.whoName('Opérateur média serveur')], ['led', 4, 'Processeur & écran LED 10 × 4 m', ['SDI IN'], [], '10.40.2.10', ''], ['rp', 4, 'Rétroprojection écrans latéraux', ['SDI IN'], [], '', ''], ['rec', 3, 'Enregistreurs PGM + ISO', ['SDI IN'], [], '', 'Film souvenir'], ['mv', 3, 'Multiview', ['SDI IN'], [], '', ''],
            ['ma', 0, 'Console lumière grandMA3 light', [], ['RJ45 OUT Art-Net'], '10.40.5.10', C.whoName('Pupitreur')], ['node', 1, 'Nodes Art-Net → DMX ×4', ['RJ45 IN'], ['DMX OUT U1', 'DMX OUT U2', 'DMX OUT U3', 'DMX OUT U4'], '10.40.5.20', ''], ['lyr', 2, 'Lyres MegaPointe & Spiider (U1-U2)', ['DMX IN U1', 'DMX IN U2'], [], '', ''], ['par', 2, 'PAR LED tables & Pixel Tubes (U3-U4)', ['DMX IN U3', 'DMX IN U4'], [], '', ''],
            ['hf', 0, 'Récepteurs HF Axient & ULXD', [], ['Dante OUT'], '10.40.3.5', ''], ['fx', 1, 'Console DiGiCo SD12', ['Dante IN', 'XLR IN Quatuor'], ['AES OUT Système', 'AES OUT Captation'], '10.40.3.20', C.whoName('Ingénieur son façade')], ['amp', 2, 'Amplis LA12X + L-Acoustics Kara', ['AES IN'], [], '10.40.3.30', '']]),
        conns: [['c1', 0, 'ccu', 0], ['c2', 0, 'ccu', 1], ['c3', 0, 'ccu', 2], ['ccu', 0, 'mix', 0], ['ccu', 1, 'mix', 1], ['ccu', 2, 'mix', 2], ['c4', 0, 'mix', 3], ['c5', 0, 'mix', 4], ['films', 0, 'mix', 5], ['mix', 1, 'ds', 0], ['ds', 0, 'led', 0], ['ds', 1, 'rp', 0], ['mix', 0, 'rec', 0], ['mix', 2, 'mv', 0], ['ma', 0, 'node', 0], ['node', 0, 'lyr', 0], ['node', 1, 'lyr', 1], ['node', 2, 'par', 0], ['node', 3, 'par', 1], ['hf', 0, 'fx', 0], ['fx', 0, 'amp', 0]],
        zones: [['Vidéo', '#42A5F5', ['c1', 'c2', 'c3', 'c4', 'c5', 'ccu', 'films', 'mix', 'ds', 'led', 'rp', 'rec', 'mv']], ['Lumière', '#FDD835', ['ma', 'node', 'lyr', 'par']], ['Son', '#26A69A', ['hf', 'fx', 'amp']]], notes: [] }),
    artistique: C => ({ nodes: XM_CAMS(C, 'SDI OUT').concat([['mix', 1, 'Mélangeur ATEM Mini Extreme ISO', ['SDI→HDMI IN 1', 'SDI→HDMI IN 2', 'SDI→HDMI IN 3', 'SDI→HDMI IN 4'], ['USB-C OUT Enregistrement ISO', 'HDMI OUT Multiview', 'RJ45 OUT Stream'], '10.50.1.10', 'Captation & streaming'],
            ['ssd', 2, 'SSD enregistrement ISO', ['USB-C IN'], [], '', ''], ['mv', 2, 'Écran multiview', ['HDMI IN'], [], '', ''],
            ['ir', 0, 'Caméra infrarouge de tracking', [], ['RJ45 OUT NDI'], '10.50.2.20', 'Suivi des danseurs'],
            ['res', 1, 'Média serveur Resolume Arena', ['RJ45 IN Tracking', 'RJ45 IN OSC'], ['HDMI OUT 1', 'HDMI OUT 2', 'HDMI OUT 3'], '10.50.2.10', C.whoName('Vidéaste mapping')], ['hdb', 2, 'Émetteurs HDBaseT ×3', ['HDMI IN 1', 'HDMI IN 2', 'HDMI IN 3'], ['HDBaseT OUT 1', 'HDBaseT OUT 2', 'HDBaseT OUT 3'], '', ''],
            ['p1', 3, 'Vidéoprojecteur 20 000 lm — toile fond', ['HDBaseT IN'], [], '10.50.2.31', ''], ['p2', 3, 'Vidéoprojecteur — toile jardin', ['HDBaseT IN'], [], '10.50.2.32', ''], ['p3', 3, 'Vidéoprojecteur — sol (zénithal)', ['HDBaseT IN'], [], '10.50.2.33', ''],
            ['ql', 0, 'Mac QLab (création sonore + OSC)', [], ['Dante OUT', 'RJ45 OUT OSC'], '10.50.3.10', C.whoName('Créateur sonore')], ['sq', 1, 'Console Allen & Heath SQ6', ['Dante IN', 'XLR IN Ambiances'], ['XLR OUT Diffusion', 'XLR OUT Captation'], '10.50.3.20', ''], ['hp', 2, 'Diffusion 4.1 (façade + surround)', ['XLR IN'], [], '', '']]),
        conns: [['c1', 0, 'mix', 0], ['c2', 0, 'mix', 1], ['c3', 0, 'mix', 2], ['c4', 0, 'mix', 3], ['mix', 0, 'ssd', 0], ['mix', 1, 'mv', 0], ['ir', 0, 'res', 0], ['ql', 1, 'res', 1], ['res', 0, 'hdb', 0], ['res', 1, 'hdb', 1], ['res', 2, 'hdb', 2], ['hdb', 0, 'p1', 0], ['hdb', 1, 'p2', 0], ['hdb', 2, 'p3', 0], ['ql', 0, 'sq', 0], ['sq', 0, 'hp', 0]],
        zones: [['Captation', '#42A5F5', ['c1', 'c2', 'c3', 'c4', 'mix', 'ssd', 'mv']], ['Mapping', '#7C4DFF', ['ir', 'res', 'hdb', 'p1', 'p2', 'p3']], ['Son', '#26A69A', ['ql', 'sq', 'hp']]], notes: [[3, 9, '🔁 QLab déclenche les scènes Resolume en OSC : un seul GO pour son + vidéo.']] })
};
XMA.syno = C => {
    const T = (XM_SY[C.type] || XM_SY.tv)(C), BX = 15000, BY = 15000, CW = 440, id = {}, H = n => 150 + Math.max(n[3].length, n[4].length, 1) * 30, colY = {};
    // placement par zones : une zone qui partage des colonnes avec une précédente démarre sous elle
    const zOf = {}; (T.zones || []).forEach((z, zi) => z[2].forEach(k => { if (zOf[k] == null) zOf[k] = zi; }));
    const bands = [], groups = (T.zones || []).map((z, zi) => T.nodes.filter(n => zOf[n[0]] === zi)).concat([T.nodes.filter(n => zOf[n[0]] == null)]), yOf = {};
    groups.forEach(G => { if (!G.length) return; const c0 = Math.min(...G.map(n => n[1])), c1 = Math.max(...G.map(n => n[1]));
        const top = bands.filter(b => !(b.c1 < c0 || b.c0 > c1)).reduce((m, b) => Math.max(m, b.bot + 140), 0), cy = {};
        G.forEach(n => { const y = cy[n[1]] == null ? top : cy[n[1]]; yOf[n[0]] = y; cy[n[1]] = y + H(n) + 34; });
        bands.push({ c0, c1, bot: Math.max(...Object.values(cy)) }); });
    const nodes = T.nodes.map(n => { const nid = 'node_' + xmUid(); id[n[0]] = nid; const y = yOf[n[0]];
        return { id: nid, x: (BX + n[1] * CW) + 'px', y: (BY + y) + 'px', title: n[2], ip: n[5] || '', comment: n[6] || '', img: null, locked: false, inPorts: n[3].map((t, i) => ({ id: 'in-' + i, text: t })), outPorts: n[4].map((t, i) => ({ id: 'out-' + i, text: t })) }; });
    const byId = {}; T.nodes.forEach((n, i) => byId[n[0]] = { n, d: nodes[i] });
    const conns = T.conns.filter(c => byId[c[0]] && byId[c[2]] && byId[c[0]].n[4][c[1]] != null && byId[c[2]].n[3][c[3]] != null).map(c => { const lab = byId[c[0]].n[4][c[1]]; return { id: 'cable_' + xmUid(), fromNode: id[c[0]], fromPort: 'out-' + c[1], toNode: id[c[2]], toPort: 'in-' + c[3], name: c[4] || '', length: '', color: xmSig(lab + ' ' + byId[c[2]].n[3][c[3]]), style: 'zigzag', stroke: 'solid', weight: 3 }; });
    const zones = (T.zones || []).map(([title, color, keys]) => { const L = keys.map(k => byId[k]).filter(Boolean); if (!L.length) return null; let x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0; L.forEach(({ n, d }) => { const x = parseFloat(d.x), y = parseFloat(d.y); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 330); y1 = Math.max(y1, y + H(n)); }); return { id: 'zone_' + xmUid(), x: (x0 - 30) + 'px', y: (y0 - 50) + 'px', width: (x1 - x0 + 60) + 'px', height: (y1 - y0 + 80) + 'px', title, color }; }).filter(Boolean);
    const annotations = (T.notes || []).map(([c, r, text]) => ({ id: 'ann_' + xmUid(), x: (BX + c * CW) + 'px', y: (BY - 230 + r * 60) + 'px', width: '300px', height: '110px', text: xmEsc(text), color: '#FFEE58' }));
    const legendData = {}; conns.forEach(c => { const k = c.color.toUpperCase() + '|solid|3'; legendData[k] = legendData[k] || ({ [XM_SC.sdi]: 'SDI / vidéo', [XM_SC.fib]: 'Fibre SMPTE', [XM_SC.hdmi]: 'HDMI / HDBaseT', [XM_SC.xlr]: 'Audio analogique', [XM_SC.ip]: 'Réseau / IP / Dante', [XM_SC.dmx]: 'DMX', [XM_SC.com]: 'Intercom', [XM_SC.aes]: 'AES / MADI' }[c.color] || ''); });
    const tab = { id: 'tab_' + xmUid(), name: C.short + ' — synoptique ' + C.p.label.split(' /')[0].toLowerCase(), nodes, zones, annotations, connections: conns, legendData, legendPos: { x: (BX - 330) + 'px', y: BY + 'px' }, ipPos: { x: (BX - 330) + 'px', y: (BY + 260) + 'px' }, migratedToV46: true };
    try { projectsData = [tab]; activeTabId = tab.id; } catch (e) { }
    return [tab];
};
// ---------------------------------------------------------------------
//  XMODELS — PLANO : un plan au sol complet par type de projet (cotes en cm)
//  élément : [id bibliothèque, x, y, rotation | [cible x, cible y], étiquette, patch]
// ---------------------------------------------------------------------
const xmRow = (id, x0, x1, y, n, rot, lab, patch) => Array.from({ length: n }, (v, i) => [id, Math.round(x0 + (n > 1 ? (x1 - x0) * i / (n - 1) : 0)), y, rot, i === 0 ? lab : '', patch]);
const XM_PL = {
    live: C => ({ name: 'Plan de scène — ' + C.short, walls: [[[[0, 0], [3000, 0], [3000, 3400], [0, 3400]], 'Grande salle', '#90a4ae'], [[[700, 150], [2300, 150], [2300, 1350], [700, 1350]], 'Scène 16 × 12 m', '#5d4037'], [[[1350, 1350], [1650, 1350], [1650, 2150], [1350, 2150]], 'Avancée', '#5d4037']],
        zones: [[1500, 2350, 2600, 1300, '#FF7043', 'Fosse — public debout'], [1500, 3050, 900, 400, '#4FC3F7', 'Régie façade & lumière'], [3550, 600, 900, 700, '#42A5F5', 'Car régie HD12 (quai C)'], [3550, 1700, 900, 500, '#FFA726', 'Loges & catering']],
        items: [['d-ledwall', 1100, 220, 0, 'Écran LED'], ['d-ledwall', 1500, 220, 0, ''], ['d-ledwall', 1900, 220, 0, ''], ['d-prat-2x1', 1500, 600, 0, 'Praticable batterie'], ['m-batterie', 1500, 600, 180, 'Batterie — Samir', { color: '#FFB74D', showLabel: true }], ['m-piano-queue', 950, 650, 200, 'Piano — Éloïse', { showLabel: true }], ['pers-musicien', 1950, 650, 180, 'Claviers — Éloïse', { showLabel: true, color: '#BA68C8' }],
            ['pers-musicien', 1050, 1000, 180, 'Guitare — Marco', { showLabel: true, color: '#4FC3F7' }], ['pers-musicien', 1950, 1000, 180, 'Basse — Jade', { showLabel: true, color: '#81C784' }], ['pers-danseur', 1500, 1150, 180, 'LINA', { showLabel: true, color: '#F06292' }], ['a-micro-pied', 1500, 1230, 0, ''],
            ['a-retour', 1500, 1300, 180, ''], ['a-retour', 1050, 1120, 180, ''], ['a-retour', 1950, 1120, 180, ''], ['a-sub', 1500, 760, 180, 'Side batterie'], ['a-line', 620, 1250, 15, 'Line array G'], ['a-line', 2380, 1250, -15, 'Line array D'], ['a-sub', 900, 1430, 0, ''], ['a-sub', 2100, 1430, 0, ''],
            ...xmRow('l-lyre-wash', 850, 2150, 330, 6, 180, 'Contre (Spiider)', { L: { kelvin: 5600, throw: 700, angle: 30 } }), ...xmRow('l-lyre-spot', 800, 2200, 1300, 6, 0, 'Face (MegaPointe)', { L: { throw: 900, angle: 18 } }), ...xmRow('l-strobe', 900, 2100, 800, 4, 0, 'Strobes'), ['l-poursuite', 1500, 3200, [1500, 1150], 'Poursuite Lina', { L: { throw: 2100, angle: 8 } }],
            ['d-truss', 1500, 330, 0, 'Pont contre'], ['d-truss', 1500, 1300, 0, 'Pont face'],
            ...xmRow('d-vauban', 760, 1300, 1450, 4, 0, 'Crash barrière'), ...xmRow('d-vauban', 1700, 2240, 1450, 4, 0, ''), ...xmRow('d-vauban', 1300, 1300, 1700, 1, 90, ''), ...xmRow('d-vauban', 1700, 1700, 1700, 1, 90, ''),
            ...xmRow('pers-public', 300, 1200, 2000, 5, 0, 'Public'), ...xmRow('pers-public', 1800, 2700, 2000, 5, 0, ''), ...xmRow('pers-public', 400, 2600, 2500, 8, 0, ''),
            ['t-regie', 1500, 3050, 180, 'Régie façade'], ['a-console', 1350, 3100, 180, 'DiGiCo SD12'], ['la-console', 1650, 3100, 180, 'grandMA3'],
            ['cam-jib', 1500, 2800, [1500, 900], 'CAM 1 — Grue', { fov: { angle: 50, len: 1600 } }], ['cam-studio', 1750, 3000, [1500, 1100], 'CAM 2 — Face serré', { fov: { angle: 8, len: 1900 } }], ['cam-studio', 500, 1450, [1300, 900], 'CAM 3 — Jardin', { fov: { angle: 25, len: 1000 } }], ['cam-studio', 2500, 1450, [1700, 900], 'CAM 4 — Cour', { fov: { angle: 25, len: 1000 } }],
            ['cam-steadicam', 1750, 1250, [1500, 900], 'CAM 5 — Steadicam', { fov: { angle: 60, len: 500 } }], ['cam-gopro', 1430, 650, [1500, 600], 'CAM 6 — Mini-cam', { fov: { angle: 90, len: 150 } }], ['cam-eng', 1000, 1650, [1500, 1100], 'CAM 7 — Épaule', { fov: { angle: 40, len: 700 } }], ['cam-ptz', 1500, 280, [1500, 1600], 'CAM 8 — PTZ contre', { fov: { angle: 55, len: 1400 } }],
            ['s-sortie', 60, 3300, 0, ''], ['s-sortie', 2940, 3300, 0, ''], ['s-sortie', 60, 100, 0, ''], ['t-extincteur', 2250, 1400, 0, ''], ['t-secours', 2900, 1600, 0, '']],
        arrows: [[[1750, 1250], [1500, 2050], [1800, 1700], '#26C6DA', 'Steadicam : sur l’avancée au rappel'], [[3100, 900], [2350, 900], [2700, 800], '#FF5252', 'Entrée artistes']],
        dims: [[[700, 150], [2300, 150], -60], [[2300, 150], [2300, 1350], 60], [[0, 3400], [3000, 3400], 60]] }),
    tv: C => ({ name: 'Plateau 4 — ' + C.short, walls: [[[[0, 0], [2400, 0], [2400, 1900], [0, 1900]], 'Plateau 4 (600 m²)', '#90a4ae']],
        zones: [[1200, 2150, 1400, 400, '#4FC3F7', 'Régie finale (1er étage)'], [1200, 1550, 2000, 500, '#9575CD', 'Gradins public — 120 places'], [2050, 450, 500, 450, '#EC407A', 'Scène musicale']],
        items: [['d-ledwall', 900, 60, 0, 'Écran LED 8 × 3 m'], ['d-ledwall', 1300, 60, 0, ''], ['m-desk-tv', 1100, 500, 180, 'Desk'], ['pers-presentateur', 1100, 380, 180, 'Julia (présentatrice)', { showLabel: true, color: '#4DB6AC' }], ['pers-assis', 930, 420, 165, 'Invitée', { showLabel: true, color: '#F06292' }], ['pers-assis', 1270, 420, 195, 'Invité', { showLabel: true, color: '#F06292' }], ['pers-assis', 780, 520, 150, 'Karim', { showLabel: true, color: '#FFD54F' }], ['pers-assis', 1420, 520, 210, 'Sophie', { showLabel: true, color: '#FFD54F' }],
            ['d-tournette', 2050, 450, 0, 'Scène musicale'], ['pers-musicien', 2000, 400, 200, 'Les Fréquences', { showLabel: true }], ['pers-musicien', 2120, 420, 160, ''], ['m-batterie', 2100, 300, 180, ''], ['a-retour', 2050, 600, 180, ''], ['m-plante-grande', 250, 150, 0, ''], ['m-plante-grande', 1950, 150, 0, ''],
            ['cam-jib', 1900, 1100, [1100, 450], 'CAM 1 — Grue', { fov: { angle: 50, len: 900 } }], ['cam-prompter', 1100, 1050, 0, 'CAM 2 — Présentatrice (prompteur)', { fov: { angle: 25, len: 650 } }], ['cam-studio', 500, 1000, [1150, 420], 'CAM 3 — Invités', { fov: { angle: 28, len: 800 } }], ['cam-studio', 1650, 1000, [1000, 420], 'CAM 4 — Contrechamp', { fov: { angle: 28, len: 800 } }], ['cam-eng', 400, 1400, [1100, 600], 'CAM 5 — Épaule public', { fov: { angle: 40, len: 600 } }], ['cam-ptz', 1100, 300, 180, 'CAM 6 — PTZ zénithale', { fov: { angle: 70, len: 300 } }],
            ['l-skypanel', 900, 850, [1000, 450], 'Face 1', { L: { throw: 450, angle: 90, intensity: 70 } }], ['l-skypanel', 1300, 850, [1200, 450], 'Face 2', { L: { throw: 450, angle: 90, intensity: 70 } }], ['l-fresnel-2k', 700, 150, [950, 420], 'Contre invités'], ['l-fresnel-2k', 1500, 150, [1250, 420], ''], ['l-lyre-wash', 250, 600, [800, 300], 'Ambiance décor'], ['l-lyre-wash', 1950, 800, [1300, 300], ''], ...xmRow('l-parled', 400, 2000, 1750, 6, 0, 'Public'),
            ['s-porte-double', 2350, 1000, 90, 'Accès plateau'], ['s-sortie', 60, 1850, 0, ''], ['t-regie', 1200, 2150, 0, 'Régie'], ['pers-debout', 1000, 2200, 0, 'Réalisateur', { showLabel: true, color: '#FFB74D' }], ['pers-debout', 1400, 2200, 0, 'Scripte', { showLabel: true, color: '#FFB74D' }]],
        arrows: [[[2300, 1000], [1150, 600], [1700, 700], '#FF5252', 'Entrée invités']], dims: [[[0, 1900], [2400, 1900], 60], [[0, 0], [0, 1900], -60]] }),
    fiction: C => ({ name: 'Appartement de Léa — séq. 1, 2', walls: [[[[0, 0], [900, 0], [900, 650], [0, 650]], 'Salon', '#a1887f'], [[[900, 0], [1350, 0], [1350, 650], [900, 650]], 'Chambre', '#a1887f'], [[[0, 650], [500, 650], [500, 950], [0, 950]], 'Entrée / palier', '#a1887f']],
        zones: [[1700, 300, 500, 450, '#4FC3F7', 'Village vidéo (cuisine)'], [-350, 300, 450, 500, '#FFA726', 'Extérieur : nacelle HMI (rue)']],
        items: [['s-porte', 250, 650, 0, 'Porte d’entrée'], ['s-fenetre', 450, 0, 0, 'Fenêtre sur rue'], ['s-fenetre', 1120, 0, 0, ''], ['s-porte', 900, 400, 90, ''], ['m-canape-3', 300, 230, 0, 'Canapé'], ['m-fauteuil', 700, 330, 220, 'Fauteuil de Max'], ['m-table-basse', 330, 360, 0, 'Table basse'], ['m-lampadaire', 560, 140, 0, 'Lampe (pratique)'], ['m-biblio', 60, 400, 90, ''], ['t-flight', 120, 560, 0, 'Cartons'], ['t-flight', 220, 590, 15, ''], ['m-lit-double', 1180, 300, 90, 'Lit'], ['m-armoire', 1300, 580, 0, ''],
            ['pers-marche', 300, 600, 0, 'LÉA', { showLabel: true, color: '#8b7cf6' }], ['pers-assis', 700, 330, 220, 'MAX', { showLabel: true, color: '#f4d35e' }], ['d-spike-t', 420, 450, 0, 'Marque Léa 1'], ['d-spike-t', 560, 330, 0, 'Marque Léa 2'],
            ['cam-dolly', 200, 450, [550, 300], 'CAM A — dolly', { fov: { angle: 50, len: 450 } }], ['cam-rail', 250, 470, 60, 'Rails 3 m'], ['cam-cine', 820, 560, [600, 330], 'CAM B', { fov: { angle: 28, len: 400 } }], ['pers-perchman', 600, 560, 0, 'Perche', { showLabel: true }],
            ['l-hmi-1800', -200, 120, [400, 250], 'M18 — soleil', { L: { kelvin: 5600, throw: 700, angle: 25 } }], ['l-kino', 120, 120, [400, 300], 'Kino — face douce'], ['l-skypanel', 450, 330, 0, 'Plafond (ambiance)', { L: { intensity: 40, throw: 300, angle: 100 } }], ['l-tube', 820, 60, [700, 330], 'Effet néon', { L: { gel: true, gelColor: '#E040FB' } }], ['la-drapeau', 650, 120, 30, ''], ['la-refl', 150, 260, 60, ''],
            ['t-moniteur', 1650, 280, 180, 'Combo réal'], ['m-chaise-real', 1620, 380, 0, 'Réalisatrice'], ['m-chaise-real', 1760, 380, 0, 'Scripte'], ['t-laptop', 1800, 220, 0, 'DIT'], ['t-armoire-elec', 1950, 500, 0, 'Distribution']],
        arrows: [[[250, 640], [550, 340], [350, 450], '#FF5252', 'Trajet de Léa (séq. 1)'], [[200, 450], [380, 380], null, '#26C6DA', 'Travelling avant']], dims: [[[0, 0], [1350, 0], -60], [[0, 0], [0, 950], -60]] }),
    doc: C => ({ name: 'Interview — capitainerie', walls: [[[[0, 0], [800, 0], [800, 600], [0, 600]], 'Capitainerie', '#a1887f']],
        zones: [[1150, 300, 450, 400, '#4FC3F7', 'Régie mobile (son + réal)']],
        items: [['s-baie', 400, 0, 0, 'Baie vitrée sur l’écluse'], ['s-porte', 780, 450, 90, ''], ['m-bureau', 650, 120, 0, 'Bureau de l’éclusier'], ['m-fauteuil', 380, 230, 200, 'Interviewé', { showLabel: true }], ['pers-assis', 380, 230, 200, 'JEAN-PIERRE', { showLabel: true, color: '#4DB6AC' }], ['m-chaise', 520, 380, 20, 'Réalisatrice (hors champ)'], ['m-plante', 150, 80, 0, ''], ['m-biblio', 30, 300, 90, 'Archives'],
            ['cam-cine', 560, 420, [380, 230], 'CAM A — 3/4 face (FX6)', { fov: { angle: 30, len: 300 } }], ['cam-cine', 150, 330, [380, 230], 'CAM B — profil (FX3)', { fov: { angle: 15, len: 300 } }], ['pers-perchman', 300, 450, 0, 'Perche'],
            ['l-softbox', 640, 260, [380, 230], 'Key (LS 600D + octa)', { L: { kelvin: 5000 } }], ['l-ledpanel', 200, 450, [380, 230], 'Fill', { L: { intensity: 35 } }], ['l-tube', 120, 120, [380, 230], 'Contre'], ['la-poly', 280, 120, 0, ''], ['t-laptop', 1150, 250, 0, 'Sauvegarde'], ['m-chaise', 1250, 350, 0, 'Son']],
        arrows: [], dims: [[[0, 600], [800, 600], 60]] }),
    pub: C => ({ name: 'Studio cyclo — packshot & beauté', walls: [[[[0, 0], [1600, 0], [1600, 1400], [0, 1400]], 'Plateau 2', '#90a4ae']],
        zones: [[800, 330, 1200, 500, '#ECEFF1', 'Cyclorama blanc 12 × 8 m'], [1350, 1150, 450, 350, '#4FC3F7', 'Video village client & agence'], [250, 1150, 400, 350, '#EC407A', 'Loge HMC']],
        items: [['d-fondvert', 800, 120, 0, 'Fond infini', { color: '#ECEFF1' }], ['m-table-carre', 600, 450, 0, 'Table packshot', { showLabel: true }], ['f-pastille', 600, 450, 0, 'Flacon'], ['pers-debout', 1050, 450, 180, 'INES (beauté)', { showLabel: true, color: '#C9786B' }], ['d-spike-t', 1050, 520, 0, ''],
            ['cam-slider', 600, 650, [600, 450], 'Phantom — slider macro', { fov: { angle: 20, len: 250 } }], ['cam-techno', 1250, 850, [1050, 450], 'Alexa 35 — Technocrane', { fov: { angle: 30, len: 500 } }], ['cam-tripod', 900, 750, 0, 'Pied de secours'],
            ['l-skypanel', 800, 300, 0, 'Toit lumineux S360 ×2', { L: { throw: 400, angle: 110 } }], ['l-hmi-4k', 200, 350, [600, 450], 'M90 — rayon de soleil', { L: { kelvin: 4300, angle: 10, throw: 600 } }], ['l-bol', 1050, 650, [1050, 450], 'Bol beauté'], ['l-kino', 850, 380, [1050, 450], 'Liseré G'], ['l-kino', 1250, 380, [1050, 450], 'Liseré D'], ['l-decoupe', 350, 650, [600, 450], 'Découpe flacon', { L: { gel: true, gelColor: '#FFAB00' } }], ['la-drapeau', 450, 500, 0, ''],
            ['t-moniteur', 1300, 1100, 180, 'Moniteur client'], ['t-moniteur', 1450, 1100, 180, 'Moniteur agence'], ['m-canape-2', 1380, 1280, 180, ''], ['t-laptop', 1100, 1150, 0, 'DIT'], ['m-miroir', 250, 1100, 180, ''], ['m-portemanteau', 400, 1300, 0, 'Stylisme'], ['m-comptoir', 900, 1350, 0, 'Catering'], ['s-porte-double', 1600, 700, 90, 'Quai']],
        arrows: [[[1250, 850], [1050, 520], [1300, 600], '#26C6DA', 'Bras Technocrane']], dims: [[[0, 1400], [1600, 1400], 60]] }),
    corporate: C => ({ name: 'Amphithéâtre — plénière', walls: [[[[0, 0], [2800, 0], [2800, 3000], [0, 3000]], 'Amphithéâtre (900 places)', '#90a4ae'], [[[700, 100], [2100, 100], [2100, 800], [700, 800]], 'Scène 14 × 7 m', '#5d4037']],
        zones: [[1400, 2850, 900, 250, '#4FC3F7', 'Régie technique'], [1400, 1800, 2400, 1600, '#9575CD', 'Public — 900 places']],
        items: [['d-ledwall', 1100, 150, 0, 'Écran LED 6 × 3 m'], ['d-ledwall', 1700, 150, 0, ''], ['m-pupitre', 1850, 600, 180, 'Pupitre', { showLabel: true }], ['pers-presentateur', 1850, 540, 180, 'Orateur'], ['m-fauteuil', 1050, 500, 160, 'Table ronde'], ['m-fauteuil', 1200, 480, 175, ''], ['m-fauteuil', 1350, 480, 185, ''], ['m-fauteuil', 1500, 500, 200, ''], ['m-table-basse', 1270, 580, 0, ''], ['m-plante-grande', 800, 250, 0, ''], ['m-plante-grande', 2000, 250, 0, ''],
            ['d-tv', 1350, 760, 180, 'Retour orateur'], ['cam-prompter', 1850, 2700, [1850, 600], 'CAM 1 — Face pupitre', { fov: { angle: 6, len: 2100 } }], ['cam-jib', 1400, 2650, [1400, 400], 'CAM 2 — Grue', { fov: { angle: 40, len: 2300 } }], ['cam-studio', 2500, 1000, [1300, 500], 'CAM 3 — Table ronde', { fov: { angle: 15, len: 1300 } }], ['cam-ptz', 300, 1800, [1400, 500], 'CAM 4 — PTZ balcon', { fov: { angle: 30, len: 1600 } }],
            ...xmRow('l-decoupe', 800, 2000, 1100, 6, 0, 'Face scène'), ...xmRow('l-lyre-wash', 800, 2000, 150, 4, 180, 'Contres'), ...xmRow('l-parled', 750, 2050, 780, 6, 180, 'Couleur Helvia', { L: { gel: true, gelColor: '#00E676' } }), ['a-line', 600, 750, 15, 'Diffusion G'], ['a-line', 2200, 750, -15, 'Diffusion D'],
            ...xmRow('m-chaise', 400, 2400, 1200, 10, 180, 'Public'), ...xmRow('m-chaise', 400, 2400, 1500, 10, 180, ''), ...xmRow('m-chaise', 400, 2400, 1800, 10, 180, ''), ...xmRow('m-chaise', 400, 2400, 2100, 10, 180, ''),
            ['a-micro-pied', 900, 1050, 0, 'Micro salle 1'], ['a-micro-pied', 1900, 1050, 0, 'Micro salle 2'], ['t-regie', 1400, 2850, 180, 'Régie'], ['s-sortie', 60, 2900, 0, ''], ['s-sortie', 2740, 2900, 0, '']],
        arrows: [], dims: [[[700, 100], [2100, 100], -60]] }),
    event: C => ({ name: 'Nef — cérémonie & dîner de gala', walls: [[[[0, 0], [4000, 0], [4000, 3000], [0, 3000]], 'Grande nef (1 700 m²)', '#90a4ae'], [[[1300, 100], [2700, 100], [2700, 700], [1300, 700]], 'Scène', '#5d4037']],
        zones: [[2000, 2750, 900, 300, '#4FC3F7', 'Régie vidéo, lumière & son'], [3600, 1500, 600, 1600, '#C0CA33', 'Bar & office traiteur'], [400, 1500, 600, 1000, '#FF7043', 'Coulisses lauréats']],
        items: [['d-ledwall', 1600, 150, 0, 'Écran LED 10 × 4 m'], ['d-ledwall', 2000, 150, 0, ''], ['d-ledwall', 2400, 150, 0, ''], ['d-escalier-scene', 2000, 760, 0, 'Escalier'], ['m-pupitre', 2550, 550, 180, 'Pupitre'], ['d-arche', 1450, 550, 0, 'Portique tissu aérien', { showLabel: true }], ['pers-danseur', 1450, 550, 180, 'Artiste aérienne'], ...xmRow('pers-musicien', 1700, 2000, 520, 4, 180, 'Quatuor Lumen'),
            ...[0, 1, 2, 3, 4, 5, 6].flatMap(c => [0, 1, 2, 3].map(r => ['m-banquet-8', 700 + c * 430, 1100 + r * 380, 0, c === 0 && r === 0 ? 'Tables de 10 (80 tables)' : ''])),
            ['cam-jib', 2000, 2600, [2000, 400], 'CAM 1 — Grue', { fov: { angle: 45, len: 2300 } }], ['cam-studio', 2300, 2700, [2550, 550], 'CAM 2 — Face', { fov: { angle: 6, len: 2200 } }], ['cam-steadicam', 2200, 900, [2000, 500], 'CAM 3 — Steadicam', { fov: { angle: 60, len: 500 } }], ['cam-ptz', 600, 900, [1500, 1500], 'CAM 4 — PTZ lauréats', { fov: { angle: 30, len: 1200 } }], ['cam-ptz', 3400, 900, [2550, 550], 'CAM 5 — PTZ pupitre', { fov: { angle: 20, len: 1000 } }],
            ...xmRow('l-lyre-spot', 1300, 2700, 800, 8, 0, 'Face (MegaPointe)'), ...xmRow('l-lyre-wash', 1350, 2650, 120, 6, 180, 'Contres (Spiider)'), ['l-poursuite', 2000, 2900, [2000, 600], 'Poursuites'], ['d-truss', 2000, 800, 0, 'Pont face'], ['d-truss', 2000, 120, 0, 'Pont contre'], ['a-line', 1150, 650, 15, 'Kara G'], ['a-line', 2850, 650, -15, 'Kara D'],
            ['m-comptoir', 3600, 1300, 90, 'Bar'], ['t-regie', 2000, 2750, 180, 'Régie'], ['t-extincteur', 1250, 700, 0, ''], ['s-sortie', 60, 2900, 0, ''], ['s-sortie', 3940, 2900, 0, ''], ['s-porte-double', 2000, 3000, 0, 'Entrée invités']],
        arrows: [[[700, 1700], [2000, 760], [1200, 1100], '#FFD54F', 'Montée des lauréats']], dims: [[[0, 3000], [4000, 3000], 60]] }),
    artistique: C => ({ name: 'Verrière — Métamorphoses', walls: [[[[0, 0], [2000, 0], [2000, 2200], [0, 2200]], 'Verrière (300 m²)', '#90a4ae']],
        zones: [[1000, 650, 1200, 1000, '#212121', 'Tapis de danse 12 × 10 m'], [1000, 1750, 1800, 600, '#9575CD', 'Gradin 200 places'], [1000, 2120, 600, 140, '#4FC3F7', 'Régie (passerelle haute)']],
        items: [['d-tapis-danse', 1000, 650, 0, 'Tapis de danse'], ['d-fondrond', 1000, 100, 0, 'Toile de fond (mapping)'], ['d-rideau', 300, 650, 90, 'Toile jardin (mapping)'], ['pers-danseur', 1000, 450, 180, 'KENZA', { showLabel: true, color: '#7C4DFF' }], ['pers-danseur', 750, 700, 160, 'Léo'], ['pers-danseur', 1250, 700, 200, 'Aya'], ['pers-danseur', 1000, 900, 180, 'Malik'], ...xmRow('pers-silhouette', 450, 1550, 1150, 6, 180, 'Ensemble amateur'),
            ['d-videoproj', 1000, 2050, 0, 'Vidéoprojecteur toile fond'], ['d-videoproj', 1850, 650, 270, 'Vidéoprojecteur toile jardin'], ['d-videoproj', 1000, 650, 0, 'Vidéoprojecteur zénithal (grill)'],
            ['cam-cine', 1000, 1950, [1000, 600], 'CAM 1 — Large fixe', { fov: { angle: 50, len: 1500 } }], ['cam-steadicam', 1400, 950, [1000, 600], 'CAM 2 — Steadicam', { fov: { angle: 50, len: 400 } }], ['cam-studio', 1700, 1700, [1000, 500], 'CAM 3 — Serré', { fov: { angle: 10, len: 1300 } }], ['cam-gopro', 1000, 600, 180, 'CAM 4 — Zénithale', { fov: { angle: 100, len: 200 } }],
            ...xmRow('l-lyre-spot', 400, 1600, 80, 5, 180, 'Contres découpés'), ...xmRow('l-decoupe', 250, 250, 300, 3, 90, 'Latérales jardin', { L: { gel: true, gelColor: '#7FB2FF' } }), ...xmRow('l-decoupe', 1750, 1750, 300, 3, 270, 'Latérales cour'), ['l-hmi-1800', 1000, 650, 0, 'Douche HMI final'], ...xmRow('l-batten', 450, 1550, 1180, 4, 0, 'Rampes au sol'),
            ['a-enceinte', 200, 1300, 45, 'Façade G'], ['a-enceinte', 1800, 1300, -45, 'Façade D'], ['a-enceinte', 200, 100, 135, 'Surround'], ['a-enceinte', 1800, 100, 225, ''], ['a-sub', 1000, 1300, 0, ''], ['t-regie', 1000, 2120, 180, 'Régie']],
        arrows: [[[1400, 950], [700, 700], [1100, 1000], '#26C6DA', 'Steadicam : orbite']], dims: [[[0, 2200], [2000, 2200], 60]] })
};
XMA.plano = C => {
    const spec = (XM_PL[C.type] || XM_PL.tv)(C), t = newTab(spec.name), DEG = Math.PI / 180;
    const aim = (x, y, tx, ty) => Math.round(((Math.atan2(tx - x, -(ty - y)) / DEG) + 360) % 360);
    spec.walls.forEach(([pts, label, col]) => t.items.push({ id: uid(), kind: 'wall', pts, closed: true, thick: 20, color: null, label, showLen: false, showArea: true, fill: true, fillColor: col, locked: false }));
    spec.zones.forEach(([x, y, w, h, color, label]) => t.items.push({ id: uid(), kind: 'zone', x, y, w, h, rot: 0, color, opacity: 0.12, label, locked: false }));
    spec.items.forEach(([id, x, y, r, label, patch]) => { const lib = libById(id); if (!lib) return; const it = itemFromLib(lib, x, y); it.rot = Array.isArray(r) ? aim(x, y, r[0], r[1]) : (r || 0);
        if (label) { it.label = label; if (!it.fov || patch && patch.showLabel) it.showLabel = true; if (it.fov) it.showLabel = true; }
        Object.keys(patch || {}).forEach(k => { if ((k === 'L' || k === 'fov') && it[k]) Object.assign(it[k], patch[k]); else if (k !== 'L' && k !== 'fov') it[k] = patch[k]; });
        t.items.push(it); });
    spec.arrows.forEach(([p1, p2, c, color, label]) => t.items.push({ id: uid(), kind: 'arrow', p1, p2, c: c || [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2], color, width: 6, dashed: true, label, locked: false }));
    spec.dims.forEach(([p1, p2, off]) => t.items.push({ id: uid(), kind: 'dim', p1, p2, off, color: null, label: '', locked: false }));
    P = newProject(); P.name = C.title; P.author = C.regisseur ? C.regisseur.name : ''; P.tabs = [t]; P.active = 0;
    return P;
};
// ---------------------------------------------------------------------
//  XMODELS — application, interface (choix du type, pré-remplissage de toute la suite)
// ---------------------------------------------------------------------
const XM_PAGE = (/([a-z-]+)\.html$/i.exec(location.pathname) || [])[1] || '', XM_TOOL = XM_PAGE === 'calendrier' ? 'planno' : XM_PAGE;
const XM_URL = { planno: 'calendrier.html?v=prod&' };
const xmHas = tool => { const v = localStorage.getItem(XM_KEYS[tool]); if (!v) return 0; try { const o = JSON.parse(v), n = JSON.stringify(o).length; if (Array.isArray(o)) return o.some(t => (t.nodes || []).length) ? n : 0;
    const cnt = ['tasks', 'fx', 'ch', 'versions', 'steps', 'talents', 'people', 'segs', 'spots', 'docs', 'cases', 'shots', 'boards'].reduce((a, k) => a + (Array.isArray(o[k]) ? o[k].length : 0), 0) + (o.tabs || []).reduce((a, t) => a + (t.items || []).length, 0) + (o.days || []).reduce((a, d) => a + (d.schedule || []).length + (d.crew || []).length, 0) + (o.panels || []).reduce((a, p) => a + (p.els || []).length, 0) + (o.versions || []).reduce((a, v) => a + (v.eq || []).length + (v.crew || []).length, 0);
    return cnt ? n : 0; } catch (e) { return 0; } };
async function xmApply(tool, type, reload) {
    if (!XMA[tool]) throw new Error('Outil non pris en charge');
    const C = xmCtx(type), data = await XMA[tool](C), key = XM_KEYS[tool], old = localStorage.getItem(key);
    if (old && xmHas(tool)) try { localStorage.setItem('xiii.models.bak.' + tool, JSON.stringify({ at: Date.now(), data: old })); } catch (e) { }
    if (data && data._t) delete data._t;
    localStorage.setItem(key, JSON.stringify(data));
    try { localStorage.setItem('xiii.models.last.' + tool, JSON.stringify({ type, at: Date.now() })); } catch (e) { }
    if (tool !== 'syno' && XM_TOOL === tool) { try { P = data; } catch (e) { } }
    if (reload) { window.__xmReload = 1; setTimeout(() => location.reload(), 60); }
    return data;
}
// fiche projet : complète ce qui est vide (titre, type, dates, lieu, équipe, lieux, caméras)
function xmFillFiche(type) {
    const s = xmJ('xiii.projets', null); if (!s || !Array.isArray(s.list)) return false;
    const f = s.list.find(x => x && x.id === s.active); if (!f) return false;
    const C = xmCtx(type), p = C.p;
    f.ptype = type; const T = typeof XPROJET !== 'undefined' && XPROJET.TYPES ? XPROJET.TYPES.find(t => t[0] === type) : null; if (T) { f.genre = T[2]; f.dtype = T[3]; }
    if (!f.title) f.title = p.title; if (!f.debut) f.debut = C.first; if (!f.fin) f.fin = C.last; if (!f.lieu) f.lieu = C.venue.name; if (!f.adresse) f.adresse = C.venue.address;
    if (!f.client) f.client = C.client; if (!f.production) f.production = C.prod; if (!f.realisation) f.realisation = C.director; if (!f.producteur) f.producteur = C.producer;
    if (!f.contact && C.regisseur) f.contact = C.regisseur.name + ' — ' + C.regisseur.phone; if (!f.acces) f.acces = C.venue.access || '';
    if (!f.duree) f.duree = { fiction: '17 min', tv: '52 min', live: '90 min', doc: '52 min', pub: '30 s', corporate: '3 min (best-of)', event: '4 min (film souvenir)', artistique: '55 min' }[type] || '';
    if (!f.diffusion) f.diffusion = xmAdd(C.last, { fiction: 60, tv: 7, live: 0, doc: 60, pub: 21, corporate: 10, event: 10, artistique: 15 }[type] || 30);
    if (!(f.team || []).some(m => m && m.name)) f.team = C.crew.map(c => ({ name: c.name, role: c.role, dept: c.dept, phone: c.phone, email: c.email }));
    if (!(f.locs || []).some(l => l && (l.name || l.address))) f.locs = (p.spots || []).slice(1).map(s => ({ name: s[0], address: s[1] + ', ' + s[3] + ' ' + s[2], note: s[8] }));
    f.tech = Object.assign({ cams: [], lenses: [], fps: '25', aspect: '1.7778', rec: '3840', codec: '', audio: '', notes: '' }, f.tech || {});
    if (!f.tech.cams.length) f.tech.cams = p.cams.map(c => ({ sid: '', label: c[1] + ' — ' + c[0], qty: 1 }));
    if (!f.tech.codec) f.tech.codec = /fiction|pub/.test(type) ? 'ARRIRAW / ProRes 4444' : 'ProRes 422 HQ'; if (type === 'fiction') f.tech.aspect = '2.39';
    if (!f.tech.audio) f.tech.audio = /live|event|tv/.test(type) ? 'Multipiste 48 kHz 24 bits, mix stéréo + 5.1' : 'Son direct 48 kHz 24 bits, perche + HF';
    f.updated = Date.now(); f.rev = Date.now();
    try { localStorage.setItem('xiii.projets', JSON.stringify(s)); } catch (e) { return false; }
    return true;
}
// ---------- interface ----------
const XM_CSS = '#xmd-ov{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.66);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:16px;font:14px "Segoe UI",system-ui,sans-serif}#xmd{width:min(760px,100%);max-height:92vh;overflow:auto;background:linear-gradient(var(--xh-glass,transparent),var(--xh-glass,transparent)),var(--bg-menu,#1b1c24);background-color:#1b1c24;color:var(--xh-txt,#eee);border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:18px 18px 14px;box-shadow:0 24px 70px rgba(0,0,0,.5)}#xmd h3{margin:0 0 4px;font:22px Astoria,Georgia,serif;letter-spacing:.03em;display:flex;justify-content:space-between;align-items:center}#xmd h3 button{all:unset;cursor:pointer;font-size:18px;padding:2px 8px}#xmd p.d{margin:2px 0 12px;opacity:.75;font-size:13px}#xmd .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:8px}#xmd .t{all:unset;box-sizing:border-box;cursor:pointer;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);display:flex;flex-direction:column;gap:3px}#xmd .t b{font-size:14px}#xmd .t small{opacity:.65;font-size:11.5px;line-height:1.3}#xmd .t.on{border-color:#f0b429;background:rgba(240,180,41,.15);box-shadow:0 0 0 1px #f0b429 inset}#xmd .t i{font-style:normal;font-size:10.5px;color:#f0b429;font-weight:700}#xmd .w{margin:12px 0 0;padding:9px 12px;border-radius:12px;background:rgba(255,183,77,.12);border:1px solid rgba(255,183,77,.35);font-size:12.5px}#xmd .a{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;margin-top:14px}#xmd .a button{all:unset;cursor:pointer;padding:9px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.18);font-weight:600;font-size:13px}#xmd .a button.p{background:#f0b429;color:#1a1206;border-color:#f0b429}#xmd .a button:disabled{opacity:.4;cursor:default}#xmd .l{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:4px 10px;margin-top:10px}#xmd .l label{display:flex;gap:6px;align-items:center;font-size:13px;padding:5px 6px;border-radius:8px}#xmd .l label small{opacity:.6;font-size:11px}#xmd .l .st{margin-left:auto;font-size:12px}#xmd .bar{height:6px;border-radius:4px;background:rgba(255,255,255,.1);margin-top:12px;overflow:hidden}#xmd .bar div{height:100%;width:0;background:#f0b429;transition:width .3s}' + 'body.light-theme #xmd,html[data-theme=light] #xmd{background:#fff;color:#222;border-color:#ddd}';
function xmCss() { if (!document.getElementById('xmd-css')) { const s = document.createElement('style'); s.id = 'xmd-css'; s.textContent = XM_CSS; document.head.appendChild(s); } }
function xmModal(html) { xmCss(); xmClose(); const o = document.createElement('div'); o.id = 'xmd-ov'; o.innerHTML = '<div id="xmd" role="dialog">' + html + '</div>'; o.addEventListener('mousedown', e => { if (e.target === o) xmClose(); }); document.body.appendChild(o); o.querySelectorAll('[data-x]').forEach(b => b.onclick = xmClose); return o; }
function xmClose() { const o = document.getElementById('xmd-ov'); if (o) o.remove(); }
const xmTypeCards = (cur, sel) => XM_TYPES.map(t => '<button class="t' + (t === sel ? ' on' : '') + '" data-ty="' + t + '"><b>' + XMP[t].icon + ' ' + xmEsc(XMP[t].label) + '</b><small>' + xmEsc(XMP[t].title) + '</small>' + (t === cur ? '<i>★ TYPE DE VOTRE PROJET</i>' : '') + '</button>').join('');
function xmPick(tool) {
    tool = tool || XM_TOOL; const f = xmFiche() || {}, cur = xmTypeOfFiche(f); let sel = cur || 'live';
    const has = xmHas(tool), bak = xmJ('xiii.models.bak.' + tool, null), orig = window.__xmOrigExample;
    const o = xmModal('<h3><span>📐 Exemple type — ' + xmEsc((XM_NAMES[tool] || tool).replace(/^\S+\s/, '')) + '</span><button data-x>✕</button></h3><p class="d">Un exemple complet et réaliste, construit pour le type de projet choisi' + (f.title || f.debut || f.lieu ? ', <b>calé sur votre projet</b> (' + xmEsc([f.title, f.debut && ('dès le ' + f.debut), f.lieu].filter(Boolean).join(' · ')) + ')' : '') + '. La même équipe, les mêmes lieux et les mêmes dates se retrouvent dans tous les outils.</p>' +
        '<div class="g">' + xmTypeCards(cur, sel) + '</div>' + (has ? '<div class="w">⚠️ L’outil contient déjà des données : elles seront remplacées. Une copie est gardée (↩️ Restaurer mes données).</div>' : '') +
        '<div class="a">' + (bak ? '<button data-bak>↩️ Restaurer mes données</button>' : '') + (orig ? '<button data-orig>Exemple d’origine</button>' : '') + '<button data-all>🧩 Pré-remplir tous les outils…</button><button class="p" data-go>📐 Charger l’exemple</button></div>');
    o.querySelectorAll('[data-ty]').forEach(b => b.onclick = () => { sel = b.dataset.ty; o.querySelectorAll('[data-ty]').forEach(x => x.classList.toggle('on', x === b)); });
    o.querySelector('[data-go]').onclick = async e => { e.target.disabled = true; e.target.textContent = '⏳ Construction…'; try { await xmApply(tool, sel, true); } catch (err) { console.error(err); e.target.disabled = false; e.target.textContent = '📐 Charger l’exemple'; alert('Exemple impossible : ' + err.message); } };
    if (bak) o.querySelector('[data-bak]').onclick = () => { localStorage.setItem(XM_KEYS[tool], bak.data); localStorage.removeItem('xiii.models.bak.' + tool); try { P = JSON.parse(bak.data); } catch (e) { } window.__xmReload = 1; location.reload(); };
    if (orig) o.querySelector('[data-orig]').onclick = () => { xmClose(); orig(); };
    o.querySelector('[data-all]').onclick = () => xmAll(sel);
}
// pré-remplit toute la suite : chaque outil est ouvert, invisible, et construit son exemple avec ses propres règles
function xmAll(type, opt) {
    opt = opt || {}; const f = xmFiche() || {}; type = type || xmTypeOfFiche(f) || 'live';
    const st = {}; XM_ORDER.forEach(t => st[t] = xmHas(t));
    const o = xmModal('<h3><span>🧩 Pré-remplir la suite</span><button data-x>✕</button></h3><p class="d">' + (opt.intro ? '✨ Projet créé ! Voulez-vous démarrer avec un exemple complet dans chaque outil ? ' : '') + 'Chaque outil coché reçoit l’exemple type complet, adapté à votre projet. Les outils qui contiennent déjà des données sont décochés (une copie est gardée si vous les cochez).</p><div class="g" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">' + xmTypeCards(xmTypeOfFiche(f), type) + '</div>' +
        '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:13px"><input type="checkbox" data-fiche checked> Compléter aussi la fiche projet (dates, lieu, équipe, caméras — seulement les champs vides)</label>' +
        '<div class="l">' + XM_ORDER.map(t => '<label><input type="checkbox" data-t="' + t + '"' + (st[t] ? '' : ' checked') + '> ' + XM_NAMES[t] + (st[t] ? ' <small>(données)</small>' : '') + '<span class="st" data-s="' + t + '"></span></label>').join('') + '</div><div class="bar"><div></div></div>' +
        '<div class="a"><button data-none>Tout décocher</button><button data-every>Tout cocher</button><button class="p" data-go>🧩 Pré-remplir</button></div>');
    o.querySelectorAll('[data-ty]').forEach(b => b.onclick = () => { type = b.dataset.ty; o.querySelectorAll('[data-ty]').forEach(x => x.classList.toggle('on', x === b)); });
    o.querySelector('[data-none]').onclick = () => o.querySelectorAll('[data-t]').forEach(c => c.checked = false);
    o.querySelector('[data-every]').onclick = () => o.querySelectorAll('[data-t]').forEach(c => c.checked = true);
    o.querySelector('[data-go]').onclick = async e => {
        const L = [...o.querySelectorAll('[data-t]:checked')].map(c => c.dataset.t); if (!L.length && !o.querySelector('[data-fiche]').checked) return;
        e.target.disabled = true; o.querySelectorAll('[data-t],[data-ty],[data-none],[data-every]').forEach(x => x.disabled = true);
        if (o.querySelector('[data-fiche]').checked) xmFillFiche(type);
        let i = 0, ok = 0, here = false; const bar = o.querySelector('.bar div');
        for (const t of L) {
            const s = o.querySelector('[data-s="' + t + '"]'); s.textContent = '⏳';
            if (t === XM_TOOL) { here = true; s.textContent = '⏳ en dernier'; i++; continue; }
            const r = await xmFrame(t, type); s.textContent = r.ok ? '✅' : '⚠️'; s.title = r.msg || ''; if (r.ok) ok++;
            bar.style.width = (++i / L.length * 100) + '%';
        }
        if (here) { try { await xmApply(XM_TOOL, type, false); ok++; o.querySelector('[data-s="' + XM_TOOL + '"]').textContent = '✅'; } catch (err) { o.querySelector('[data-s="' + XM_TOOL + '"]').textContent = '⚠️'; } }
        bar.style.width = '100%';
        o.querySelector('p.d').innerHTML = '<b>✅ ' + ok + ' / ' + L.length + ' outil(s) pré-rempli(s)</b> avec l’exemple « ' + xmEsc(XMP[type].label) + ' ». Ouvrez chaque outil pour le découvrir ; tout reste modifiable.';
        const a = o.querySelector('.a'); a.innerHTML = '<button data-x>Fermer</button>' + (here || XM_KEYS[XM_TOOL] ? '<button class="p" data-rl>Recharger la page</button>' : '');
        a.querySelector('[data-x]').onclick = () => { xmClose(); if (opt.done) opt.done(); }; const rl = a.querySelector('[data-rl]'); if (rl) rl.onclick = () => { window.__xmReload = 1; location.reload(); };
    };
}
function xmFrame(tool, type) {
    return new Promise(res => {
        const fr = document.createElement('iframe'), done = r => { clearTimeout(to); window.removeEventListener('message', on); fr.remove(); res(r); };
        const on = e => { const d = e.data; if (d && d.xmodel === tool) done({ ok: !!d.ok, msg: d.msg }); };
        const to = setTimeout(() => done({ ok: false, msg: 'Délai dépassé' }), 40000);
        window.addEventListener('message', on);
        try { if (window.XWS && XWS.id) fr.dataset.ws = XWS.id; } catch (e) { }
        fr.style.cssText = 'position:fixed;left:-20000px;top:0;width:1400px;height:900px;border:0;visibility:hidden';
        fr.src = (XM_URL[tool] || tool + '.html?') + 'xmodel=' + encodeURIComponent(type) + '&t=1';
        document.body.appendChild(fr);
    });
}
// ---------- démarrage ----------
function xmBoot() {
    const q = new URLSearchParams(location.search), mt = q.get('xmodel');
    if (mt && XM_TOOL && XMA[XM_TOOL]) {   // mode « invisible » (pré-remplissage depuis un autre outil)
        const run = async () => { let r; try { await xmApply(XM_TOOL, mt, false); r = { xmodel: XM_TOOL, ok: true }; } catch (e) { console.error(e); r = { xmodel: XM_TOOL, ok: false, msg: String(e && e.message || e) }; } try { (window.parent !== window ? window.parent : window.opener || window).postMessage(r, '*'); } catch (e) { } };
        const go = () => setTimeout(run, 900);
        if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
        return;
    }
    if (XM_TOOL && XMA[XM_TOOL] && !/-m$/.test(XM_TOOL)) {
        if (typeof window.loadExample === 'function' && !window.__xmOrigExample) { window.__xmOrigExample = window.loadExample; window.loadExample = () => xmPick(); }
        if (XM_TOOL === 'plano' && typeof window.demoTab === 'function') window.__xmOrigExample = window.__xmOrigExample || null;
        window.XSET_HELP = window.XSET_HELP || []; if (!window.XSET_HELP.some(x => x.k === 'xmd')) window.XSET_HELP.unshift({ k: 'xmd', icon: '📐', label: 'Exemple type selon le projet', sub: 'Concert, fiction, émission, pub… un exemple complet et calé sur votre projet', run: () => setTimeout(() => xmPick(), 150) });
        const addBtn = () => { if (document.getElementById('xmd-btn') || document.querySelector('#top-bar button[onclick^="loadExample"]')) return; const bar = document.getElementById('top-bar'); if (!bar) return; const g = bar.querySelector('.btn-group'); const b = document.createElement('button'); b.id = 'xmd-btn'; b.title = 'Exemple type selon le type de projet (concert, fiction, émission…)'; b.innerHTML = '<span class="btn-icon">📐</span><span class="btn-label">Exemple type</span>'; b.onclick = () => xmPick(); (g || bar).appendChild(b); };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBtn); else addBtn();
        // chargement de la page juste après un exemple : message de confirmation
        try { const l = xmJ('xiii.models.last.' + XM_TOOL, null); if (l && Date.now() - l.at < 8000 && XMP[l.type]) setTimeout(() => { const t = document.createElement('div'); t.textContent = '📐 Exemple « ' + XMP[l.type].label + ' » chargé'; t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;background:#f0b429;color:#1a1206;padding:10px 18px;border-radius:999px;font:600 14px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.35)'; document.body.appendChild(t); setTimeout(() => t.remove(), 3500); try { if (typeof fitView === 'function') fitView(); if (typeof centerViewOnNodes === 'function') centerViewOnNodes(); } catch (e) { } }, 700); } catch (e) { }
    }
    // juste après la création d'un projet (guide) : proposer de pré-remplir toute la suite
    setTimeout(xmOffer, 1200);
    // fiche projet : bouton « Pré-remplir tous les outils »
    const mo = new MutationObserver(() => { const g = document.querySelector('#xpj-g .xpj-types'); if (!g || document.getElementById('xmd-fiche')) return;
        const b = document.createElement('button'); b.id = 'xmd-fiche'; b.type = 'button'; b.textContent = '🧩 Pré-remplir tous les outils avec un exemple type'; b.style.cssText = 'margin:8px 0 2px;padding:9px 14px;border-radius:12px;border:1px solid #f0b429;background:rgba(240,180,41,.14);color:inherit;font-weight:700;cursor:pointer;width:100%';
        b.onclick = () => { const on = document.querySelector('#xpj-g .xpj-types button.on'), ty = on ? on.dataset.type : ''; const sv = document.getElementById('xpj-save'); if (sv) sv.click(); setTimeout(() => { try { XPROJET.close(); } catch (e) { } xmAll(XMP[ty] ? ty : xmTypeOfFiche(), { done: () => { try { XPROJET.open(); } catch (e) { } } }); }, 250); };
        g.insertAdjacentElement('afterend', b); });
    const start = () => mo.observe(document.body, { childList: true, subtree: true });
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
}
function xmOffer() { const o = xmJ('xiii.models.offer', null); if (!o || Date.now() - o.at > 120000 || document.getElementById('xmd-ov')) return; localStorage.removeItem('xiii.models.offer'); xmAll(o.type, { intro: 1 }); }
window.XMODELS = { offer: xmOffer, pick: xmPick, all: xmAll, apply: xmApply, ctx: xmCtx, fillFiche: xmFillFiche, has: xmHas, profiles: XMP, adapters: XMA, tool: XM_TOOL, keys: XM_KEYS, frame: xmFrame };
xmBoot();
})();


// =====================================================================
//  SUITE XIII — XCHECK : ✅ checklist de préparation, générée depuis la fiche projet et les outils
//  • les tâches dépendent du type de projet, des lieux (voie publique, lieu privé, ERP), des talents (mineurs),
//    des risques (drone, nuit, pyrotechnie, hauteur, eau), de la musique, des déplacements…
//  • échéance en J-x par rapport au premier jour de tournage ; détection automatique de ce qui est déjà fait dans les outils
//  • état par projet : « xiii.check » = { done:{id:{at,by}}, na:{id:1}, custom:[{id,cat,t,j}] }
//  • passerelles : PLANNO (jalons de préparation), CALENDRIER / agenda (XCALEV), tableau de bord (carte), fiche projet
// =====================================================================
const XCHECK = (() => {
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const S = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = n => String(n).padStart(2, '0'), iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), today = () => iso(new Date());
    const addD = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
    const fr = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
    const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const uid = () => Math.random().toString(36).slice(2, 9);
    const K = 'xiii.check';
    const fiche = () => { const s = J('xiii.projets', null); return s && s.list ? s.list.find(f => f && f.id === s.active) || null : null; };
    const st = () => Object.assign({ done: {}, na: {}, custom: [] }, J(K, {}) || {});
    const me = () => { const d = J('xiii.drive', null); return (d && d.me && d.me.name) || 'Moi'; };
    const CATS = [['adm', '🧾 Production & administratif'], ['aut', '🏛️ Autorisations & droits'], ['eq', '👥 Équipe & contrats'], ['tal', '🎭 Talents'], ['lieu', '📍 Lieux & technique'], ['mat', '🎥 Matériel'], ['sec', '🦺 Sécurité'], ['log', '🚐 Logistique'], ['post', '🎞️ Post-production & livraison'], ['perso', '📝 Mes tâches']];
    const L = { net: ['https://www.net-entreprises.fr', 'net-entreprises.fr (DPAE)'], cs: ['https://www.conges-spectacles.com', 'Congés Spectacles'], au: ['https://www.audiens.org', 'Audiens'], guso: ['https://www.guso.fr', 'GUSO'], sacem: ['https://www.sacem.fr', 'SACEM'], ff: ['https://www.filmfrance.net', 'Film France (commissions du film)'], cnc: ['https://www.cnc.fr', 'CNC'], at: ['https://alphatango.aviation-civile.gouv.fr', 'AlphaTango (déclaration drone)'], geo: ['https://www.geoportail.gouv.fr', 'Géoportail (zones drones)'], cmb: ['https://www.cmb-sante.fr', 'Centre médical de la Bourse'] };
    // ---------- contexte : ce que disent la fiche et les outils ----------
    function ctx() {
        const f = fiche() || {}, raw = k => localStorage.getItem(k) || '';
        const cs = J('callsheetoXIII.project', null), ca = J('castoXIII.project', null), rp = J('reperoXIII.project', null), rc = J('ressourcoXIII.project', null), tr = J('transportoXIII.project', null), so = J('sonoXIII.project', null), po = J('postoXIII.project', null), pk = J('packingoXIII.project', null), dv = J('devisoXIII.project', null), pl = J('planoXIII.project', null), sy = J('synoptique_projects', null), cd = J('conducoXIII.project', null), lu = J('lumoXIII.project', null);
        const type = f.ptype || ({ live: 'live', tv: 'tv', doc: 'doc', pub: 'pub', corporate: 'corporate', event: 'event', fiction: 'fiction', autre: 'artistique' }[f.genre] || '');
        const risks = new Set(); ((cs && cs.days) || []).forEach(d => ((d.safety || {}).risks || []).forEach(r => risks.add(r)));
        const big = [raw('devisoXIII.project'), raw('synoptique_projects'), raw('planoXIII.project'), raw('decoupXIII.project'), raw('scriptoXIII.project'), raw('storyboardoXIII.project'), JSON.stringify(f.tech || {})].join(' ');
        const docs = ((rc && rc.docs) || []), docRows = rx => docs.filter(d => rx.test(d.tpl || '')).reduce((a, d) => a + (d.rows || []).filter(r => Object.values(r.v || {}).filter(Boolean).length > 1).length, 0);
        const talents = (ca && ca.talents) || [], spots = (rp && rp.spots) || [];
        const ext = /"ie":"EXT|EXT\.|\bEXT\b/.test(raw('decoupXIII.project') + raw('scriptoXIII.project') + raw('callsheetoXIII.project'));
        const night = risks.has('nuit') || /—\s*nuit|NUIT|"effet":"Nuit/.test(raw('decoupXIII.project')) || ((cs && cs.days) || []).some(d => (d.times || {}).wrap >= '22:00' || ((d.times || {}).wrap || '9') < '05:00');
        const c = {
            f, type, debut: f.debut || ((cs && cs.days && cs.days[0]) || {}).date || '', fin: f.fin || f.debut || '',
            public: /live|event|corporate|tv|artistique/.test(type) || risks.has('enfants') && false,
            voie: risks.has('voie') || spots.some(s => s.access === 'public') || (ext && /fiction|doc|pub/.test(type)),
            prive: spots.some(s => s.access && s.access !== 'public') || !!(f.lieu || f.adresse) || /fiction|pub|doc/.test(type),
            drone: risks.has('drone') || /drone|inspire|mavic|\bdji (air|mini|avata)/i.test(big),
            pyro: risks.has('pyro') || /pyrotech|canon co2|co2 \(|étincelles|etincelles|artificier/i.test(big + raw('lumoXIII.project')),
            hauteur: risks.has('hauteur') || /nacelle|truss|accroche|grue|technocrane|toit/i.test(big),
            eau: risks.has('eau') || /quai|berge|plage|bateau|péniche|peniche|écluse|piscine/i.test(big + raw('reperoXIII.project')),
            night, ext,
            minors: talents.some(t => t.minor || t.kind === 'enfant') || risks.has('enfants'),
            talents: talents.length || ((cs && cs.days) || []).some(d => (d.crew || []).some(m => m.dept === 'cast')),
            music: /live|tv|event|pub|artistique/.test(type) || /"mus":"[^"]/.test(raw('conducoXIII.project')),
            travel: !!(tr && ((tr.travels || []).length || (tr.hotels || []).length)), hotels: !!(tr && (tr.hotels || []).length),
            hf: !!(so && (so.hf || []).length), tvdeliv: /tv|live|doc/.test(type),
            cs, ca, rp, rc, tr, so, po, pk, dv, pl, sy, cd, lu, docRows, spots, talents
        };
        return c;
    }
    // ---------- catalogue des tâches : [id, cat, J-x, titre, aide, condition, détection, lien, outil] ----------
    function catalog(c) {
        const T = c.type, fic = /fiction|pub/.test(T), flux = /live|tv|event|corporate|artistique/.test(T);
        const day1 = c.cs && c.cs.days && c.cs.days[0];
        const n = v => v ? v : 0, has = x => x ? true : null;
        const crewN = day1 ? (day1.crew || []).filter(m => m.dept !== 'cast' && m.dept !== 'fig').length : (c.f.team || []).length;
        return [
            ['devis', 'adm', -30, 'Devis validé et signé par le client / diffuseur', 'Version retenue du devis, conditions de paiement, acompte.', 1, () => c.dv && (c.dv.versions || []).some(v => (v.eq || []).length || (v.crew || []).length) ? 'chiffré dans DEVISO' : null, null, 'deviso'],
            ['contrat-client', 'adm', -21, 'Contrat de production / bon de commande signé', 'Objet, livrables, droits cédés, calendrier, pénalités, conditions d’annulation.', /pub|corporate|event|tv|live/.test(T), null, null, 'ressourco'],
            ['budget', 'adm', -45, 'Plan de financement et budget arrêtés', 'Apports, aides (CNC, région), crédit d’impôt, part producteur.', /fiction|doc|artistique/.test(T), null, L.cnc, 'deviso'],
            ['assurance', 'adm', -21, 'Assurances : RC production, matériel (bris, vol), multirisque tournage', 'Attestation demandée par les lieux et les loueurs. Vérifier les franchises et la valeur assurée du matériel loué.', 1, null, null, null],
            ['assur-indispo', 'adm', -21, 'Assurance indisponibilité des artistes / négatif', 'Couvre l’arrêt du tournage si un rôle principal est indisponible.', /fiction|pub/.test(T), null, null, null],
            ['rca', 'adm', 15, 'Dépôt au Registre public du cinéma et de l’audiovisuel (RCA)', 'Pour les œuvres exploitées commercialement : titre, contrats de cession de droits.', /fiction|doc/.test(T), null, L.cnc, null],
            ['voie', 'aut', -21, 'Autorisation de tournage sur la voie publique', 'Mairie ou bureau des tournages (Mission cinéma, préfecture de police à Paris). Délai souvent de 2 à 3 semaines. Joindre l’attestation d’assurance.', c.voie, null, L.ff, 'repero'],
            ['stationnement', 'aut', -15, 'Arrêté de stationnement pour les véhicules techniques', 'Emplacements réservés (camions, loges) : demande à la mairie avec plan et immatriculations.', c.voie || /live|event/.test(T), null, null, 'transporto'],
            ['lieux', 'aut', -14, 'Autorisations des lieux privés signées', 'Propriétaire, dates, horaires, état des lieux, conditions financières.', c.prive, () => c.docRows(/lieu|reperage/) ? c.docRows(/lieu|reperage/) + ' autorisation(s) dans RESSOURCO' : null, null, 'ressourco'],
            ['drone', 'aut', -10, 'Vol de drone : déclaration et autorisations', 'Télépilote certifié et exploitant déclaré ; scénario (S1/S2/S3 ou catégorie ouverte/spécifique) ; notification préalable sur AlphaTango ; autorisation préfectorale en zone peuplée ; vérifier les zones interdites.', c.drone, null, L.at, null],
            ['drone-zone', 'aut', -10, 'Zones de vol vérifiées (aéroports, zones réglementées)', 'Carte des restrictions pour drones sur Géoportail, NOTAM du jour J.', c.drone, null, L.geo, 'repero'],
            ['pyro', 'aut', -30, 'Pyrotechnie / effets spéciaux : déclaration en préfecture', 'Artificier certifié (F4-T2 / C4), déclaration préalable, accord du lieu et du chargé de sécurité.', c.pyro, null, null, null],
            ['enfants', 'aut', -30, 'Enfants de moins de 16 ans : autorisation préalable de la DDETS', 'Commission des enfants du spectacle : dossier par enfant (autorisation des parents, certificat médical, horaires, scolarité). Part de la rémunération versée à la Caisse des dépôts.', c.minors, null, null, 'casto'],
            ['sacem', 'aut', -14, /pub/.test(T) ? 'Musique : licences de synchronisation (éditeur + producteur)' : 'Musique : droits SACEM / déclaration des œuvres', /pub/.test(T) ? 'Durée, territoires, médias, période : à négocier avec l’éditeur et le label.' : 'Autorisation de captation des œuvres, programme déposé, relevé des musiques après diffusion (CONDUCO › relevé SACEM).', c.music, null, L.sacem, 'conduco'],
            ['image', 'aut', -3, 'Autorisations de droit à l’image signées', 'Talents, invités, figurants, public identifiable. Les mineurs : signature des deux parents.', c.talents || c.public, () => c.docRows(/img-/) ? c.docRows(/img-/) + ' autorisation(s) dans RESSOURCO' : null, null, 'ressourco'],
            ['affichage', 'aut', -2, 'Affichage « tournage en cours — vous pouvez être filmé » aux entrées', 'Pour le public, les spectateurs et les passants.', c.public || c.voie, null, null, null],
            ['contrats', 'eq', -7, 'Contrats CDDU de l’équipe technique envoyés et signés', 'Fonction, dates, rémunération conforme aux minima de la convention (RESSOURCO › Intermittents).', crewN > 0 || 1, () => c.docRows(/cddu|contrat-tech/) ? c.docRows(/cddu|contrat-tech/) + ' contrat(s) dans RESSOURCO' : null, null, 'ressourco'],
            ['fiches', 'eq', -10, 'Fiches de renseignements de l’équipe complètes', 'N° de sécurité sociale, Congés Spectacles, adresse, RIB, contact d’urgence, allergies.', 1, () => c.docRows(/fiche/) ? c.docRows(/fiche/) + ' fiche(s) dans RESSOURCO' : null, null, 'ressourco'],
            ['dpae', 'eq', -1, 'DPAE de chaque salarié faite avant l’embauche', 'Déclaration préalable à l’embauche pour chaque contrat (techniciens et artistes), au plus tard avant la prise de poste.', 1, () => c.docRows(/dpae/) ? c.docRows(/dpae/) + ' personne(s) dans la DPAE (RESSOURCO)' : null, L.net, 'ressourco'],
            ['cs-audiens', 'eq', -7, 'Affiliations Congés Spectacles et Audiens à jour', 'Déclarations et cotisations des intermittents après le tournage.', 1, null, L.cs, null],
            ['guso', 'eq', -7, 'GUSO si l’organisateur n’est pas une entreprise du spectacle', 'Pour les artistes engagés par un organisateur occasionnel (entreprise, association).', /event|corporate|artistique/.test(T), null, L.guso, null],
            ['medecine', 'eq', -14, 'Suivi médical des intermittents', 'Visite d’information et de prévention via le Centre médical de la Bourse.', 1, null, L.cmb, null],
            ['convoc', 'eq', -2, 'Feuille de service du premier jour diffusée', 'Horaires, lieux, plan d’accès, contacts, sécurité. Envoi groupé depuis CALL SHEETO.', 1, () => day1 && (day1.crew || []).length && (day1.schedule || []).length ? 'J1 prête dans CALL SHEETO (' + day1.crew.length + ' pers.)' : null, null, 'callsheeto'],
            ['casting', 'tal', -21, 'Tous les rôles confirmés', 'Casting, options levées, disponibilités sur les jours de tournage (CASTO).', c.talents, () => { const R = (c.ca && c.ca.roles) || []; return R.length && R.every(r => (c.ca.talents || []).some(t => t.status === 'confirme' && fold(t.role) === fold(r.name))) ? R.length + ' rôle(s) confirmé(s) dans CASTO' : null; }, null, 'casto'],
            ['contrats-art', 'tal', -7, 'Contrats des artistes-interprètes signés', 'Cachets, droits voisins, cession des droits d’exploitation.', c.talents, () => c.docRows(/contrat-art/) ? c.docRows(/contrat-art/) + ' contrat(s) artiste dans RESSOURCO' : null, null, 'ressourco'],
            ['hmc', 'tal', -7, 'Essais maquillage, coiffure et costumes', 'Validation réalisation, photos de référence (MOODO).', fic || /tv/.test(T), null, null, 'moodo'],
            ['reperages', 'lieu', -21, 'Repérages faits et lieux validés', 'Lumière, son, accès, électricité, loges, stationnement (REPERO).', 1, () => c.spots.some(s => s.status === 'retenu') ? c.spots.filter(s => s.status === 'retenu').length + ' lieu(x) retenu(s) dans REPERO' : null, null, 'repero'],
            ['visite-tech', 'lieu', -14, 'Visite technique avec la régie du lieu', 'Accroches (charges), puissance électrique, quai de déchargement, passages de câbles, réseau.', flux, null, null, 'plano'],
            ['plan', 'lieu', -10, 'Plan d’implantation validé', 'Caméras, lumière, son, régie, circulations et issues de secours (PLANO).', flux || fic, () => c.pl && (c.pl.tabs || []).some(t => (t.items || []).length > 5) ? 'plan dans PLANO' : null, null, 'plano'],
            ['syno', 'lieu', -10, 'Synoptique et liste des liaisons validés', 'Signaux, câbles, adresses IP, intercom (SYNO).', flux, () => Array.isArray(c.sy) && c.sy.some(t => (t.nodes || []).length > 3) ? 'synoptique dans SYNO' : null, null, 'syno'],
            ['elec', 'lieu', -10, 'Puissance électrique confirmée (ou groupe électrogène réservé)', 'Bilan des projecteurs et de la régie (LUMO) comparé à l’alimentation disponible.', 1, () => c.lu && (c.lu.fx || []).length ? 'bilan de puissance dans LUMO' : null, null, 'lumo'],
            ['hf', 'lieu', -5, 'Plan de fréquences HF calculé et coordonné', 'Canaux TNT libres du lieu, coordination avec les autres prestataires (SONO).', c.hf, () => c.so && (c.so.hf || []).length && c.so.hf.every(h => h.f) ? 'fréquences toutes attribuées dans SONO' : null, null, 'sono'],
            ['meteo', 'lieu', -3, 'Plan B météo (lieu de repli, protections)', 'Séquences de remplacement en intérieur, bâches, housses de pluie.', c.ext || c.voie, null, null, 'repero'],
            ['liste', 'mat', -14, 'Liste du matériel arrêtée', 'Caméras, optiques, lumière, son, machinerie, consommables (MATOS / DEVISO).', 1, () => c.dv && (c.dv.versions || []).some(v => (v.eq || []).length) ? 'liste chiffrée dans DEVISO' : null, null, 'matos'],
            ['loueur', 'mat', -10, 'Matériel réservé chez le(s) loueur(s)', 'Bon de commande, dates d’enlèvement et de retour, attestation d’assurance envoyée.', 1, null, null, 'matos'],
            ['essais', 'mat', -3, fic ? 'Essais caméra chez le loueur' : 'Préparation et test du matériel', fic ? 'Optiques, LUT, enregistrement, synchro TC, liaisons vidéo.' : 'Mise en route complète de la chaîne (caméras → régie → enregistrement / diffusion).', 1, null, null, null],
            ['caisses', 'mat', -1, 'Caisses préparées et pointées au départ', 'Contenu, numéros de série, véhicules (PACKINGO).', 1, () => c.pk && (c.pk.cases || []).length ? c.pk.cases.length + ' caisse(s) dans PACKINGO' : null, null, 'packingo'],
            ['supports', 'mat', -2, 'Supports d’enregistrement et disques de sauvegarde prêts', 'Cartes formatées, 2 copies + navette (BACKUPO).', 1, null, null, 'backupo'],
            ['risques', 'sec', -5, 'Évaluation des risques et consignes de sécurité', 'Risques du tournage, référent sécurité, consignes sur la feuille de service (CALL SHEETO › Sécurité).', 1, () => day1 && ((day1.safety || {}).risks || []).length && (day1.safety || {}).referent ? 'consignes dans CALL SHEETO' : null, null, 'callsheeto'],
            ['secours', 'sec', -2, 'Secours : trousse, SST désigné, hôpital le plus proche', 'Sur la feuille de service et affiché à la base régie.', 1, () => day1 && (day1.safety || {}).hospital && (day1.safety || {}).firstAid ? 'hôpital et SST dans CALL SHEETO' : null, null, 'callsheeto'],
            ['erp', 'sec', -21, 'Sécurité du public : jauge, issues de secours, SSIAP', 'Dossier de sécurité validé avec l’exploitant du lieu, plan d’évacuation, agents de sécurité.', c.public, null, null, 'plano'],
            ['hauteur', 'sec', -5, 'Travail en hauteur et levage : accroches certifiées, nacelles, harnais', 'Vérification des points d’accroche, CACES des opérateurs, zone d’exclusion.', c.hauteur, null, null, null],
            ['nuit', 'sec', -3, 'Tournage de nuit : circulations éclairées, retour des équipes', 'Taxis ou navettes au-delà de l’amplitude prévue, vigilance fatigue.', c.night, null, null, 'transporto'],
            ['eau', 'sec', -3, 'Proximité de l’eau : gilets, sauveteur désigné', 'Pas de matériel électrique sans protection.', c.eau, null, null, null],
            ['hotels', 'log', -14, 'Hôtels réservés et rooming list envoyée', 'Chambres par personne, arrivées / départs, petits-déjeuners (TRANSPORTO).', c.hotels || c.travel, () => c.tr && (c.tr.rooms || []).length ? c.tr.rooms.length + ' chambre(s) dans TRANSPORTO' : null, null, 'transporto'],
            ['billets', 'log', -14, 'Billets de train / avion émis', 'Références envoyées à chaque voyageur.', c.travel, () => c.tr && (c.tr.travels || []).length && c.tr.travels.every(t => t.ref) ? c.tr.travels.length + ' trajet(s) avec référence' : null, null, 'transporto'],
            ['navettes', 'log', -5, 'Véhicules loués et navettes planifiées', 'Chauffeurs, horaires, points de rendez-vous.', 1, () => c.tr && (c.tr.veh || []).length ? c.tr.veh.length + ' véhicule(s) dans TRANSPORTO' : null, null, 'transporto'],
            ['repas', 'log', -5, 'Repas et catering commandés', 'Nombre de couverts par jour, régimes (végétarien, allergies).', 1, null, null, 'callsheeto'],
            ['workflow', 'post', -7, 'Workflow de post-production validé', 'Codecs, DIT, sauvegardes, proxies, montage, étalonnage, mixage (POSTO).', 1, () => c.po && (c.po.steps || []).length ? c.po.steps.length + ' étape(s) dans POSTO' : null, null, 'posto'],
            ['specs', 'post', -14, 'Spécifications de livraison reçues', c.tvdeliv ? 'PAD du diffuseur : format, normes sonores (EBU R128), sous-titres, conducteur de diffusion.' : 'Formats et déclinaisons attendus par le client (16:9, 9:16, durées).', 1, () => c.po && (c.po.deliv || []).length ? c.po.deliv.length + ' livrable(s) dans POSTO' : null, null, 'posto'],
            ['releve', 'post', 7, 'Relevé des musiques envoyé (cue sheet)', 'Après diffusion : relevé SACEM depuis CONDUCO.', c.music && /live|tv|event/.test(T), null, L.sacem, 'conduco']
        ].filter(x => x[5]).map(x => ({ id: x[0], cat: x[1], j: x[2], t: x[3], help: x[4], auto: x[6], link: x[7], tool: x[8] }));
    }
    function items() {
        const c = ctx(), s = st(), t0 = today();
        const L = catalog(c).concat((s.custom || []).map(x => ({ id: x.id, cat: x.cat || 'perso', j: x.j, t: x.t, help: x.help || '', custom: 1 })));
        return { c, s, list: L.map(x => { let a = null; try { a = x.auto ? x.auto() : null; } catch (e) { } const due = c.debut && x.j != null ? addD(x.j > 0 ? (c.fin || c.debut) : c.debut, x.j) : ''; const done = !!s.done[x.id], na = !!s.na[x.id];
            return Object.assign(x, { autoTxt: a || '', due, done, na, ok: done || na, late: !done && !na && due && due < t0 }); }).sort((a, b) => (a.j || 0) - (b.j || 0)) };
    }
    function stats() { const { list } = items(), A = list.filter(x => !x.na), d = A.filter(x => x.done).length; return { n: A.length, done: d, pct: A.length ? Math.round(d / A.length * 100) : 0, late: A.filter(x => x.late).length, next: A.filter(x => !x.done).slice(0, 4), autoN: A.filter(x => !x.done && x.autoTxt).length }; }
    // ---------- actions ----------
    function toggle(id, k) { const s = st(); if (k === 'na') { if (s.na[id]) delete s.na[id]; else { s.na[id] = 1; delete s.done[id]; } } else { if (s.done[id]) delete s.done[id]; else { s.done[id] = { at: Date.now(), by: me() }; delete s.na[id]; } } S(K, s); syncPlanno(true); }
    function acceptAuto() { const s = st(); let n = 0; items().list.forEach(x => { if (!x.done && !x.na && x.autoTxt) { s.done[x.id] = { at: Date.now(), by: me(), auto: x.autoTxt }; n++; } }); S(K, s); syncPlanno(true); return n; }
    function syncPlanno(quiet) {
        const pl = J('plannoXIII.project', null) || { app: 'PLANNO XIII', v: 1, name: '', tasks: [] }; const { list, c } = items(); let n = 0;
        if (quiet && !pl.tasks.some(t => /^xc:/.test(t.src || ''))) return 0;
        if (!c.debut) return -1;
        list.forEach(x => { if (!x.due) return; let t = pl.tasks.find(y => y.src === 'xc:' + x.id); if (x.na) { if (t) pl.tasks = pl.tasks.filter(y => y !== t); return; } if (!t) { t = { id: uid(), phase: x.j > 0 ? 'livraison' : 'prepa', who: [], ms: true, src: 'xc:' + x.id }; pl.tasks.push(t); n++; } Object.assign(t, { name: '✅ ' + x.t, start: x.due, end: x.due, status: x.done ? 'done' : 'todo' }); });
        pl.updated = Date.now(); S('plannoXIII.project', pl); return n;
    }
    // ---------- carte (tableau de bord) ----------
    function card() {
        const s = stats(); if (!s.n) return '<p class="xd-e">Remplissez la fiche projet : la checklist de préparation se génère d’après le type, les lieux et les dates.</p>';
        return '<div class="xck-k"><div><b>' + s.pct + ' %</b><span>' + s.done + ' / ' + s.n + ' faites</span></div>' + (s.late ? '<div><b class="ko">' + s.late + '</b><span>en retard</span></div>' : '') + (s.autoN ? '<div><b>' + s.autoN + '</b><span>détectée(s) faite(s)</span></div>' : '') + '</div><div class="xpd-bar"><i style="width:' + s.pct + '%;background:#81c784"></i></div>' +
            s.next.map(x => '<div class="xck-n' + (x.late ? ' ko' : '') + '">' + (x.late ? '⚠️' : '○') + ' ' + esc(x.t) + (x.due ? ' <small>' + fr(x.due) + '</small>' : '') + '</div>').join('') + '<button class="xd-l" onclick="XCHECK.open()">✅ Checklist complète →</button>';
    }
    // ---------- page ----------
    let FIL = 'todo';
    function open() {
        let ov = document.getElementById('xck'); if (!ov) { ov = document.createElement('div'); ov.id = 'xck'; document.body.appendChild(ov); ov.addEventListener('mousedown', e => { if (e.target === ov) close(); }); }
        const { list, c } = items(), A = list.filter(x => !x.na), done = A.filter(x => x.done).length, pct = A.length ? Math.round(done / A.length * 100) : 0, late = A.filter(x => x.late).length, autoN = A.filter(x => !x.done && x.autoTxt).length;
        const vis = list.filter(x => FIL === 'all' || (FIL === 'todo' && !x.ok) || (FIL === 'late' && x.late) || (FIL === 'done' && x.ok));
        const T = { live: 'concert / captation', tv: 'émission TV', fiction: 'fiction', doc: 'documentaire', pub: 'publicité / clip', corporate: 'corporate', event: 'événementiel', artistique: 'projet artistique' }[c.type];
        const tags = [c.voie && '🚦 voie publique', c.public && '👥 public', c.drone && '🛸 drone', c.minors && '🧒 mineurs', c.night && '🌙 nuit', c.pyro && '🎆 pyrotechnie', c.hauteur && '🏗️ hauteur', c.eau && '🌊 eau', c.music && '🎵 musique', c.travel && '🚆 déplacements'].filter(Boolean);
        const row = x => '<div class="xck-r' + (x.ok ? ' ok' : '') + (x.late ? ' late' : '') + (x.na ? ' na' : '') + '" data-id="' + x.id + '"><button class="xck-c" data-tg="' + x.id + '" title="Fait / à faire">' + (x.done ? '✓' : x.na ? '—' : '') + '</button><div class="xck-t"><b>' + esc(x.t) + '</b>' + (x.help ? '<small>' + esc(x.help) + '</small>' : '') + '<div class="xck-m">' + (x.autoTxt && !x.done ? '<span class="xck-a">🔎 ' + esc(x.autoTxt) + '</span>' : '') + (x.tool ? '<a href="' + x.tool + '.html">Ouvrir ' + x.tool.toUpperCase() + ' →</a>' : '') + (x.link ? '<a href="' + x.link[0] + '" target="_blank" rel="noopener">' + esc(x.link[1]) + ' ↗</a>' : '') + (x.done && st().done[x.id] && st().done[x.id].by ? '<span>fait par ' + esc(st().done[x.id].by) + '</span>' : '') + '</div></div><div class="xck-d"><b>' + (x.j != null ? (x.j > 0 ? 'J+' + x.j : 'J' + x.j) : '') + '</b><small>' + (x.due ? fr(x.due) : '') + (x.late ? '<br>en retard' : '') + '</small></div><button class="xck-na" data-na="' + x.id + '" title="Non concerné">' + (x.na ? '↺' : 'N/A') + '</button>' + (x.custom ? '<button class="xck-na" data-del="' + x.id + '" title="Supprimer">🗑</button>' : '') + '</div>';
        ov.innerHTML = '<div class="xck-box"><div class="xck-h"><b>✅ Checklist de préparation — ' + esc(c.f.title || 'Projet') + '</b><button data-print>🖨️</button><button data-x>✕</button></div>' +
            '<p class="xck-s">Générée d’après la fiche projet' + (T ? ' (<b>' + T + '</b>' + (c.debut ? ', tournage le ' + fr(c.debut) : ', <b>dates à renseigner</b>') + ')' : ' — <b>choisissez le type de projet dans la fiche</b>') + ' et le contenu des outils. ' + (tags.length ? 'Détecté : ' + tags.join(' · ') + '.' : '') + '</p>' +
            '<div class="xck-kpi"><div><b>' + pct + ' %</b><span>' + done + ' / ' + A.length + ' faites</span><div class="xpd-bar"><i style="width:' + pct + '%;background:#81c784"></i></div></div><div><b class="' + (late ? 'ko' : 'ok') + '">' + late + '</b><span>en retard</span></div><div><b>' + autoN + '</b><span>détectée(s) faite(s) dans les outils</span>' + (autoN ? '<button data-auto>Tout cocher</button>' : '') + '</div></div>' +
            '<div class="xck-f">' + [['todo', 'À faire'], ['late', 'En retard'], ['done', 'Faites / N/A'], ['all', 'Tout']].map(f => '<button data-f="' + f[0] + '" class="' + (FIL === f[0] ? 'on' : '') + '">' + f[1] + '</button>').join('') + '<span></span><button data-add>➕ Ajouter une tâche</button><button data-pl title="Ajouter les échéances au planning (jalons)">🗓️ Vers PLANNO</button></div>' +
            CATS.map(([k, l]) => { const R = vis.filter(x => x.cat === k); return R.length ? '<section><h4>' + l + ' <small>' + list.filter(x => x.cat === k && x.ok).length + ' / ' + list.filter(x => x.cat === k).length + '</small></h4>' + R.map(row).join('') + '</section>' : ''; }).join('') + (vis.length ? '' : '<p class="xck-e">' + (FIL === 'todo' ? '🎉 Tout est fait !' : 'Rien ici.') + '</p>') + '</div>';
        const q = s => ov.querySelectorAll(s);
        q('[data-x]').forEach(b => b.onclick = close); q('[data-print]').forEach(b => b.onclick = () => window.print());
        q('[data-tg]').forEach(b => b.onclick = () => { toggle(b.dataset.tg); open(); });
        q('[data-na]').forEach(b => b.onclick = () => { toggle(b.dataset.na, 'na'); open(); });
        q('[data-del]').forEach(b => b.onclick = () => { const s = st(); s.custom = s.custom.filter(x => x.id !== b.dataset.del); S(K, s); open(); });
        q('[data-f]').forEach(b => b.onclick = () => { FIL = b.dataset.f; open(); });
        q('[data-auto]').forEach(b => b.onclick = () => { acceptAuto(); open(); });
        q('[data-pl]').forEach(b => b.onclick = () => { const n = syncPlanno(false); b.textContent = n < 0 ? '⚠️ Dates du tournage manquantes' : '✓ ' + n + ' jalon(s) ajouté(s) à PLANNO'; });
        q('[data-add]').forEach(b => b.onclick = () => { const t = (prompt('Nouvelle tâche de préparation') || '').trim(); if (!t) return; const j = parseInt(prompt('Échéance : combien de jours avant le tournage ? (ex. 7)', '7'), 10); const s = st(); s.custom.push({ id: 'u' + uid(), cat: 'perso', t, j: isNaN(j) ? null : -Math.abs(j) }); S(K, s); open(); });
        if (!document.getElementById('xck-k')) addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xck')) close(); });
    }
    function close() { const o = document.getElementById('xck'); if (o) o.remove(); }
    const css = document.createElement('style');
    css.textContent = '#xck{position:fixed;inset:0;z-index:10300;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:flex-start;padding:4vh 14px;overflow:auto;font:14px/1.45 "Segoe UI",system-ui,sans-serif}.xck-box{width:min(980px,100%);background:var(--bg-menu,#1f1f23);color:var(--text-main,#eee);border:1px solid rgba(129,199,132,.5);border-radius:16px;padding:16px 18px;box-shadow:0 20px 60px rgba(0,0,0,.6)}' +
        '.xck-h{display:flex;gap:8px;align-items:center}.xck-h b{flex:1;font-size:18px}.xck-box button{font:inherit;color:inherit;background:rgba(129,199,132,.12);border:1px solid rgba(129,199,132,.45);border-radius:8px;padding:5px 10px;cursor:pointer}.xck-s{opacity:.8;font-size:12.5px;margin:6px 0 10px}' +
        '.xck-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:10px}.xck-kpi>div{background:rgba(128,128,128,.1);border:1px solid rgba(128,128,128,.25);border-radius:12px;padding:10px 12px}.xck-kpi b{display:block;font-size:24px}.xck-kpi span{font-size:12px;opacity:.75;display:block;margin-bottom:6px}' +
        '.xck-f{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:4px 0 8px}.xck-f span{flex:1}.xck-f button.on{background:#81c784;color:#10200f}' +
        '#xck section{margin-top:10px}#xck h4{margin:6px 0;font-size:14px}#xck h4 small{opacity:.6;font-weight:400}.xck-r{display:grid;grid-template-columns:30px 1fr 92px auto auto;gap:10px;align-items:start;padding:8px 6px;border-top:1px solid rgba(128,128,128,.18)}.xck-r.late .xck-d{color:#e57373}.xck-r.ok .xck-t b{text-decoration:line-through;opacity:.6}.xck-r.na{opacity:.5}' +
        '.xck-c{width:26px;height:26px;padding:0!important;border-radius:8px!important;font-weight:800}.xck-r.ok .xck-c{background:#81c784!important;color:#10200f}.xck-t small{display:block;opacity:.72;font-size:12px}.xck-m{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;margin-top:3px}.xck-m a{color:#f0b378;text-decoration:none}.xck-m span{opacity:.75}.xck-a{color:#81c784;opacity:1!important}.xck-d{text-align:right;font-size:12px}.xck-d b{display:block}.xck-d small{opacity:.75}.xck-na{font-size:11px!important;padding:3px 6px!important}' +
        '.xck-k{display:flex;gap:14px;margin:2px 0 6px}.xck-k b{display:block;font-size:20px}.xck-k span{font-size:11px;opacity:.7}.xck-n{font-size:12.5px;margin:3px 0}.xck-n small{opacity:.6}.xck-n.ko{color:#e57373}.xck-e{opacity:.7;padding:10px}.ko{color:#e57373!important}.ok{color:#81c784}' +
        '.xpd-bar{height:8px;border-radius:99px;background:rgba(128,128,128,.25);overflow:hidden}.xpd-bar i{display:block;height:100%;border-radius:99px}' +
        '@media(max-width:700px){.xck-r{grid-template-columns:28px 1fr 70px}.xck-na{display:none}}@media print{#xck{position:static;background:none;padding:0}.xck-box{box-shadow:none;border:0;color:#111;background:#fff}.xck-h button,.xck-f,.xck-na,.xck-kpi button{display:none}}';
    document.head.appendChild(css);
    // ---------- accès : fiche projet, ⚙️ ----------
    function init() {
        window.XSET_HELP = window.XSET_HELP || []; if (!window.XSET_HELP.some(x => x.k === 'xck')) window.XSET_HELP.push({ k: 'xck', icon: '✅', label: 'Checklist de préparation du projet', sub: 'Autorisations, assurances, contrats, sécurité… d’après la fiche projet', run: () => setTimeout(open, 150) });
        const mo = new MutationObserver(() => { const g = document.querySelector('#xpj-g .xpj-types'); if (!g || document.getElementById('xck-fiche')) return; const s = stats(); const b = document.createElement('button'); b.id = 'xck-fiche'; b.type = 'button'; b.textContent = '✅ Checklist de préparation — ' + s.done + ' / ' + s.n + (s.late ? ' · ⚠️ ' + s.late + ' en retard' : ''); b.style.cssText = 'margin:6px 0 2px;padding:9px 14px;border-radius:12px;border:1px solid #81c784;background:rgba(129,199,132,.12);color:inherit;font-weight:700;cursor:pointer;width:100%';
            b.onclick = () => { const sv = document.getElementById('xpj-save'); if (sv) sv.click(); setTimeout(() => { try { XPROJET.close(); } catch (e) { } open(); }, 200); }; (document.getElementById('xmd-fiche') || g).insertAdjacentElement('afterend', b); });
        const go = () => mo.observe(document.body, { childList: true, subtree: true }); if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
        if (/[?&]check=1/.test(location.search)) setTimeout(open, 900);
    }
    // échéances non faites pour l'agenda (XCALEV)
    function events() { try { const { list } = items(); return list.filter(x => x.due && !x.ok).map(x => ({ d: x.due, t: '✅ ' + x.t, late: x.late, tool: x.tool })); } catch (e) { return []; } }
    return { init, open, close, card, stats, items, events, toggle, acceptAuto, syncPlanno };
})();
XCHECK.init();


// =====================================================================
//  SUITE XIII — XDISPO : 🙋 disponibilités de l'équipe + 🗳️ propositions de dates
//  Chaque membre coche ses jours (✅ dispo · ❔ peut-être · ❌ indispo) ; le Master voit la grille de l'équipe,
//  repère les meilleurs créneaux, propose des dates, l'équipe vote, la date retenue part dans PLANNO / CALENDRIER et le chat.
//  Script Drive v20 (dispo_* / poll_*). Sans Drive : vos dispos restent sur cet appareil.
// =====================================================================
var XDISPO = window.XDISPO || (() => {
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fold = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const cfg = () => { const c = J('xiii.drive', null); return c && c.url ? c : null; };
    const me = () => { const c = cfg(); return (c && c.me && c.me.name) || (J('xiii.deleg.me', {}) || {}).name || 'Moi'; };
    const isMaster = () => { const c = cfg(); return !c || !!c.code || c.role === 'master'; };
    async function api(a, p) { const c = cfg(); if (!c) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: me() || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    const pad = n => String(n).padStart(2, '0'), iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), T0 = () => iso(new Date());
    const addD = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
    const frD = (s, o) => { const x = new Date(s + 'T12:00').toLocaleDateString('fr-FR', o || { weekday: 'short', day: 'numeric', month: 'short' }); return x.charAt(0).toUpperCase() + x.slice(1); };
    const ST = { y: ['✅', 'Disponible', '#66bb6a'], p: ['❔', 'Peut-être', '#ffb74d'], n: ['❌', 'Indisponible', '#e57373'] }, NEXT = { '': 'y', y: 'p', p: 'n', n: '' };
    const K_MINE = 'xiii.dispo.mine', K_CACHE = 'xiii.dispo.cache', K_NOTE = 'xiii.dispo.note';
    const say = m => { try { (window.toast || (() => { }))(m); } catch (e) { } };
    // ---------- données ----------
    let D = J(K_CACHE, { list: [], polls: [], at: 0 }), MODE = ''; // MODE : '' | 'off' | 'old' | 'ok'
    function mine() { return J(K_MINE, {}); }
    async function refresh() {
        const r = await api('dispo_list'); if (!r.ok) { MODE = r.err === 'off' ? 'off' : r.err === 'action' ? 'old' : 'err'; return r; }
        MODE = 'ok'; D = { list: r.list || [], polls: r.polls || [], at: Date.now(), me: r.me || me(), admin: !!r.admin }; W(K_CACHE, D);
        const m = (r.list || []).find(x => fold(x.nom) === fold(r.me || me())); if (m && !J('xiii.dispo.dirty', 0)) { W(K_MINE, m.days || {}); if (m.note) W(K_NOTE, m.note); }
        return r;
    }
    let pushT = 0;
    function saveMine(days) { W(K_MINE, days); W('xiii.dispo.dirty', 1); clearTimeout(pushT); pushT = setTimeout(async () => { const r = await api('dispo_set', { days: mine(), note: J(K_NOTE, '') }); if (r.ok) W('xiii.dispo.dirty', 0); setSync(r); }, 900); }
    function setSync(r) { const s = document.querySelector('#xdp .xdp-sync'); if (!s) return; s.textContent = r.ok ? '☁️ Partagé avec l\'équipe' : r.err === 'off' ? '💾 Enregistré sur cet appareil (Drive non connecté)' : r.err === 'action' ? '💾 Sur cet appareil — mettez à jour le script Drive (v20) pour partager' : '⚠️ Non partagé (' + r.err + ') — nouvel essai à la prochaine modification'; }
    // personnes : réponses Drive + fiche équipe (même sans réponse) ; moi en premier
    function people() {
        const out = [], seen = {}, add = (nom, sec, days, note) => { const k = fold(nom); if (!k) return; if (seen[k]) { if (days && !seen[k].days) Object.assign(seen[k], { days, note }); return; } seen[k] = { nom, sec: sec || '', days: days || null, note: note || '' }; out.push(seen[k]); };
        add(D.me || me(), '', mine(), J(K_NOTE, ''));
        (D.list || []).forEach(x => add(x.nom, x.secteur, x.days, x.note));
        try { const S = J('xiii.projets', {}) || {}, f = (S.list || []).find(x => x && x.id === S.active); (f && f.team || []).forEach(m => add(m.name || [m.prenom, m.nom].filter(Boolean).join(' '), m.dept || '', null)); } catch (e) { }
        seen[fold(D.me || me())].days = mine(); return out;
    }
    // ---------- meilleurs créneaux ----------
    function best(P, from, n, len) {
        len = Math.max(1, len || 1); const R = [];
        for (let i = 0; i < n; i++) { const d0 = addD(from, i); let sc = 0, ok = 0, ko = 0, unk = 0, who = [];
            for (let k = 0; k < len; k++) { const d = addD(d0, k); P.forEach(p => { const v = p.days ? p.days[d] : undefined; if (v === 'y') { sc += 2; ok++; } else if (v === 'p') sc += 1; else if (v === 'n') { ko++; if (who.indexOf(p.nom) < 0) who.push(p.nom); } else unk++; }); }
            R.push({ d: d0, sc, ok, ko, unk, who }); }
        return R.filter(x => x.ok > 0).sort((a, b) => a.ko - b.ko || b.sc - a.sc || a.d.localeCompare(b.d)).slice(0, 6);
    }
    // ---------- fenêtre ----------
    let DRAG = null; addEventListener('pointerup', () => { DRAG = null; }); addEventListener('pointercancel', () => { DRAG = null; });
    let TAB = 'mine', MONTH = T0().slice(0, 7), SEL = new Set(), FILT = '', LEN = 1;
    function open(tab) {
        if (document.getElementById('xdp')) return; if (tab) TAB = tab; css();
        document.body.insertAdjacentHTML('beforeend', '<div id="xdp" role="dialog" aria-modal="true" aria-label="Disponibilités de l\'équipe"><div class="xdp-b"><div class="xdp-h"><b>🙋 Disponibilités de l\'équipe</b><span class="xdp-sync"></span><button class="xdp-x" aria-label="Fermer">✕</button></div>' +
            '<nav role="tablist"><button data-t="mine">🙋 Mes dispos</button><button data-t="team">👥 Équipe</button><button data-t="poll">🗳️ Propositions <i></i></button></nav><div class="xdp-c"></div></div></div>');
        const o = document.getElementById('xdp'), close = () => o.remove(); o.querySelector('.xdp-x').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); });
        o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        o.querySelectorAll('nav button').forEach(b => b.onclick = () => { TAB = b.dataset.t; draw(); });
        draw(); refresh().then(r => { setSync(r.ok ? { ok: 1 } : r); if (document.getElementById('xdp')) draw(); });
    }
    function draw() {
        const o = document.getElementById('xdp'); if (!o) return; o.querySelectorAll('nav button').forEach(b => { const on = b.dataset.t === TAB; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
        const open = (D.polls || []).filter(p => p.status !== 'closed' && !(p.votes || {})[D.me || me()] && whoOk(p)).length, i = o.querySelector('nav i'); i.textContent = open || '';
        const c = o.querySelector('.xdp-c'); ({ mine: vMine, team: vTeam, poll: vPoll })[TAB](c);
    }
    const whoOk = p => !p.who || !p.who.length || p.who.some(w => fold(w) === fold(D.me || me()));
    function monthNav(c, re) { const [y, m] = MONTH.split('-').map(Number), lab = new Date(y, m - 1, 15).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        return '<div class="xdp-mn"><button data-mv="-1" aria-label="Mois précédent">‹</button><b>' + lab + '</b><button data-mv="1" aria-label="Mois suivant">›</button>' + (MONTH !== T0().slice(0, 7) ? '<button data-mv="0" class="sm">Aujourd\'hui</button>' : '') + '</div>'; }
    function wireNav(c, re) { c.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => { const v = +b.dataset.mv; if (!v) MONTH = T0().slice(0, 7); else { const [y, m] = MONTH.split('-').map(Number), d = new Date(y, m - 1 + v, 1); MONTH = d.getFullYear() + '-' + pad(d.getMonth() + 1); } re(); }); }
    function monthDays() { const [y, m] = MONTH.split('-').map(Number), first = new Date(y, m - 1, 1), n = new Date(y, m, 0).getDate(), lead = (first.getDay() + 6) % 7; return { lead, days: Array.from({ length: n }, (_, i) => MONTH + '-' + pad(i + 1)) }; }
    // 🙋 mes dispos : calendrier du mois, un clic fait tourner ✅ → ❔ → ❌ → vide
    function vMine(c) {
        const M = mine(), { lead, days } = monthDays(), t0 = T0();
        c.innerHTML = '<p class="xdp-hint">Touchez un jour : ✅ disponible → ❔ peut-être → ❌ indisponible → vide. Glissez pour en remplir plusieurs. Le Master et l\'équipe voient vos réponses.</p>' + monthNav() +
            '<div class="xdp-cal">' + ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => '<span class="wd">' + x + '</span>').join('') + '<span></span>'.repeat(lead) +
            days.map(d => { const v = M[d] || '', s = ST[v]; return '<button class="dy' + (v ? ' ' + v : '') + (d === t0 ? ' td' : '') + (d < t0 ? ' past' : '') + '" data-d="' + d + '" aria-label="' + frD(d, { weekday: 'long', day: 'numeric', month: 'long' }) + ' : ' + (s ? s[1] : 'non renseigné') + '"><b>' + +d.slice(8) + '</b>' + (s ? '<i>' + s[0] + '</i>' : '') + '</button>'; }).join('') + '</div>' +
            '<div class="xdp-q"><span>Tout le mois :</span><button data-all="y">✅ Dispo</button><button data-all="wk">✅ Semaine · ❌ week-end</button><button data-all="n">❌ Indispo</button><button data-all="">🧹 Effacer</button></div>' +
            '<label class="xdp-note">Note pour la production<input maxlength="300" placeholder="Ex. : dispo à partir de 14 h le jeudi, véhiculé…" value="' + esc(J(K_NOTE, '')) + '"></label>' +
            '<div class="xdp-leg">' + Object.keys(ST).map(k => '<span><i style="background:' + ST[k][2] + '"></i>' + ST[k][1] + '</span>').join('') + '<span class="xdp-n">' + Object.values(M).filter(v => v === 'y').length + ' jour(s) dispo renseigné(s)</span></div>';
        wireNav(c, () => vMine(c));
        let last = ''; const set = (b, v) => { last = b.dataset.d; const M2 = mine(); if (v) M2[b.dataset.d] = v; else delete M2[b.dataset.d]; b.className = 'dy' + (v ? ' ' + v : '') + (b.dataset.d === t0 ? ' td' : '') + (b.dataset.d < t0 ? ' past' : ''); b.innerHTML = '<b>' + +b.dataset.d.slice(8) + '</b>' + (v ? '<i>' + ST[v][0] + '</i>' : ''); saveMine(M2); const n = c.querySelector('.xdp-n'); if (n) n.textContent = Object.values(M2).filter(x => x === 'y').length + ' jour(s) dispo renseigné(s)'; };
        const cal = c.querySelector('.xdp-cal');
        cal.addEventListener('pointerdown', e => { const b = e.target.closest('.dy'); if (!b) return; e.preventDefault(); try { b.releasePointerCapture(e.pointerId); } catch (x) { } DRAG = NEXT[mine()[b.dataset.d] || '']; set(b, DRAG); });
        cal.addEventListener('pointermove', e => { if (DRAG == null) return; const t = document.elementFromPoint(e.clientX, e.clientY), b = t && t.closest && t.closest('.dy'); if (b && cal.contains(b) && b.dataset.d !== last) set(b, DRAG); });
        c.querySelectorAll('.dy').forEach(b => b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(b, NEXT[mine()[b.dataset.d] || '']); } }));
        c.querySelectorAll('[data-all]').forEach(b => b.onclick = () => { const M2 = mine(), v = b.dataset.all; days.filter(d => d >= t0).forEach(d => { const wd = new Date(d + 'T12:00').getDay(), x = v === 'wk' ? (wd === 0 || wd === 6 ? 'n' : 'y') : v; if (x) M2[d] = x; else delete M2[d]; }); saveMine(M2); vMine(c); });
        c.querySelector('.xdp-note input').onchange = e => { W(K_NOTE, e.target.value.trim()); saveMine(mine()); };
    }
    // 👥 équipe : grille personnes × jours + meilleurs créneaux
    function vTeam(c) {
        const all = people(), secs = [...new Set(all.map(p => p.sec).filter(Boolean))], P = all.filter(p => !FILT || p.sec === FILT), { days } = monthDays(), t0 = T0();
        const DD = days.filter(d => d >= t0 || MONTH < t0.slice(0, 7)), from = DD[0] || days[0], B = best(P, from, DD.length || days.length, LEN);
        const cnt = d => P.reduce((a, p) => { const v = p.days && p.days[d]; a[v || 'u']++; return a; }, { y: 0, p: 0, n: 0, u: 0 });
        const noRep = P.filter(p => !p.days || !Object.keys(p.days).length);
        c.innerHTML = (MODE === 'off' ? '<p class="xdp-warn">Drive d\'équipe non connecté : seules vos dispos apparaissent. Connectez-le (Réglages → Gestion d\'équipe) pour voir celles de l\'équipe.</p>' : MODE === 'old' ? '<p class="xdp-warn">Mettez à jour le script Drive (version 20, page Drive) pour partager les disponibilités.</p>' : '') +
            monthNav() + '<div class="xdp-f">' + (secs.length ? '<select aria-label="Filtrer par équipe"><option value="">Toute l\'équipe (' + all.length + ')</option>' + secs.map(s => '<option' + (s === FILT ? ' selected' : '') + '>' + esc(s) + '</option>').join('') + '</select>' : '<span>' + P.length + ' personne(s)</span>') +
            '<label>Durée<select data-len>' + [1, 2, 3, 4, 5, 7].map(n => '<option value="' + n + '"' + (n === LEN ? ' selected' : '') + '>' + n + ' jour' + (n > 1 ? 's' : '') + '</option>').join('') + '</select></label></div>' +
            '<div class="xdp-best"><b>💡 Meilleurs créneaux' + (LEN > 1 ? ' (' + LEN + ' jours)' : '') + '</b>' + (B.length ? B.map(x => '<button data-pick="' + x.d + '" title="' + (x.who.length ? 'Indisponible(s) : ' + esc(x.who.join(', ')) : 'Personne d\'indisponible') + '">' + frD(x.d) + (LEN > 1 ? ' → ' + frD(addD(x.d, LEN - 1), { day: 'numeric', month: 'short' }) : '') + ' <small>' + (x.ko ? '❌ ' + x.ko : '✅ ' + Math.round(x.ok / LEN)) + (x.unk ? ' · ? ' + Math.round(x.unk / LEN) : '') + '</small></button>').join('') : '<span>Pas encore assez de réponses.</span>') + '</div>' +
            '<div class="xdp-gw"><table class="xdp-g"><thead><tr><th>Personne</th>' + days.map(d => { const k = cnt(d), wd = new Date(d + 'T12:00').getDay(); return '<th class="' + (SEL.has(d) ? 'sel ' : '') + (wd === 0 || wd === 6 ? 'we ' : '') + (d < t0 ? 'past' : '') + '" data-col="' + d + '" title="' + frD(d, { weekday: 'long', day: 'numeric', month: 'long' }) + ' — ✅ ' + k.y + ' · ❔ ' + k.p + ' · ❌ ' + k.n + ' · sans réponse ' + k.u + '\nCliquez pour sélectionner ce jour"><small>' + 'DLMMJVS'[wd] + '</small>' + +d.slice(8) + '<i style="--k:' + (P.length ? k.y / P.length : 0) + '"></i></th>'; }).join('') + '</tr></thead><tbody>' +
            P.map(p => '<tr><th title="' + esc(p.note || '') + '">' + esc(p.nom) + (p.sec ? '<small>' + esc(p.sec) + '</small>' : '') + (p.note ? ' 📝' : '') + (!p.days || !Object.keys(p.days).length ? '<small class="nr">sans réponse</small>' : '') + '</th>' + days.map(d => { const v = p.days && p.days[d]; return '<td class="' + (v || '') + (SEL.has(d) ? ' sel' : '') + '" title="' + esc(p.nom) + ' · ' + frD(d) + ' : ' + (v ? ST[v][1] : 'pas de réponse') + '">' + (v ? ST[v][0] : '') + '</td>'; }).join('') + '</tr>').join('') + '</tbody></table></div>' +
            '<div class="xdp-act"><span>' + (SEL.size ? SEL.size + ' jour(s) sélectionné(s)' : 'Cliquez sur les en-têtes de jours (ou un créneau 💡) pour sélectionner') + '</span>' + (SEL.size ? '<button data-clr>Désélectionner</button>' : '') +
            (isMaster() ? '<button class="ok" data-prop' + (SEL.size ? '' : ' disabled') + '>🗳️ Proposer ces dates à l\'équipe</button>' : '') +
            (noRep.length && cfg() && window.XMENT ? '<button data-nudge title="Message dans le chat avec une mention @ à chacun">📣 Relancer ' + noRep.length + ' sans réponse</button>' : '') + '</div>';
        wireNav(c, () => vTeam(c));
        const s = c.querySelector('.xdp-f select:not([data-len])'); if (s) s.onchange = () => { FILT = s.value; vTeam(c); };
        c.querySelector('[data-len]').onchange = e => { LEN = +e.target.value; vTeam(c); };
        c.querySelectorAll('[data-col]').forEach(h => h.onclick = () => { const d = h.dataset.col; SEL.has(d) ? SEL.delete(d) : SEL.add(d); vTeam(c); });
        c.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { for (let k = 0; k < LEN; k++) SEL.add(addD(b.dataset.pick, k)); vTeam(c); });
        const cl = c.querySelector('[data-clr]'); if (cl) cl.onclick = () => { SEL.clear(); vTeam(c); };
        const pr = c.querySelector('[data-prop]'); if (pr) pr.onclick = () => { TAB = 'poll'; draw(); editPoll(null, [...SEL].sort()); };
        const nu = c.querySelector('[data-nudge]'); if (nu) nu.onclick = async () => { const tg = noRep.map(p => '@' + p.nom.trim().replace(/\s+/g, '_')).join(' '); const r = await XMENT.chatSend(tg + ' pouvez-vous indiquer vos disponibilités ? (Démarrer › 📅 Agenda › 🙋 Disponibilités, ou l\'app équipe)', null); say(r.ok ? '📣 Relance envoyée dans le chat' : '⚠️ Relance impossible (' + r.err + ')'); };
    }
    // 🗳️ propositions de dates
    function vPoll(c) {
        const L = (D.polls || []).slice().sort((a, b) => (a.status === 'closed') - (b.status === 'closed') || b.at - a.at), my = D.me || me(), M = isMaster();
        c.innerHTML = (MODE === 'off' ? '<p class="xdp-warn">Les propositions de dates passent par le Drive d\'équipe : connectez-le pour en créer et voter.</p>' : MODE === 'old' ? '<p class="xdp-warn">Mettez à jour le script Drive (version 20) pour les propositions de dates.</p>' : '') +
            (M && MODE !== 'off' ? '<div class="xdp-act" style="justify-content:flex-start"><button class="ok" data-new>➕ Nouvelle proposition</button><span>Astuce : dans 👥 Équipe, sélectionnez les jours où le plus de monde est dispo puis « Proposer ».</span></div>' : '') +
            '<div class="xdp-pl">' + (L.length ? L.map(p => {
                const V = p.votes || {}, voters = Object.keys(V), mv = (V[my] || {}).v || {}, closed = p.status === 'closed', who = p.who && p.who.length ? p.who : null, miss = who ? who.filter(w => !voters.some(v => fold(v) === fold(w))) : [];
                const score = d => voters.reduce((a, n) => { const x = (V[n].v || {})[d.d + (d.t ? ' ' + d.t : '')] || (V[n].v || {})[d.d]; if (x) a[x]++; return a; }, { y: 0, p: 0, n: 0 }), top = p.dates.map(d => ({ d, s: score(d) })).sort((a, b) => a.s.n - b.s.n || (b.s.y * 2 + b.s.p) - (a.s.y * 2 + a.s.p))[0];
                return '<div class="xdp-p' + (closed ? ' cl' : '') + '" data-id="' + esc(p.id) + '"><div class="hd"><b>' + esc(p.title) + '</b><small>par ' + esc(p.by) + ' · ' + voters.length + ' réponse(s)' + (who ? ' / ' + who.length + ' concerné(s)' : '') + '</small>' + (closed ? '<span class="chs">📅 Retenu : ' + esc(frD(p.chosen.slice(0, 10), { weekday: 'long', day: 'numeric', month: 'long' }) + (p.chosen.slice(11) ? ' ' + p.chosen.slice(11) : '')) + '</span>' : '') + '</div>' + (p.note ? '<p class="nt">' + esc(p.note) + '</p>' : '') +
                    '<table class="xdp-pv"><thead><tr><th></th>' + p.dates.map(d => { const s = score(d), isTop = top && top.d === d && voters.length; return '<th class="' + (isTop && !closed ? 'top' : '') + (closed && p.chosen === d.d + (d.t ? ' ' + d.t : '') ? ' chosen' : '') + '">' + frD(d.d) + (d.t ? '<small>' + esc(d.t) + '</small>' : '') + '<em>✅ ' + s.y + ' · ❔ ' + s.p + ' · ❌ ' + s.n + '</em></th>'; }).join('') + '</tr></thead><tbody>' +
                    (!closed && whoOk(p) ? '<tr class="mine"><th>Vous</th>' + p.dates.map(d => { const k = d.d + (d.t ? ' ' + d.t : ''), v = mv[k] || ''; return '<td><button data-vote="' + esc(k) + '" class="' + v + '" aria-label="Votre réponse pour ' + frD(d.d) + ' : ' + (v ? ST[v][1] : 'aucune') + '">' + (v ? ST[v][0] : '—') + '</button></td>'; }).join('') + '</tr>' : '') +
                    voters.filter(n => fold(n) !== fold(my) || closed || !whoOk(p)).map(n => '<tr><th>' + esc(n) + '</th>' + p.dates.map(d => { const x = (V[n].v || {})[d.d + (d.t ? ' ' + d.t : '')]; return '<td class="' + (x || '') + '">' + (x ? ST[x][0] : '') + '</td>'; }).join('') + '</tr>').join('') + '</tbody></table>' +
                    (miss.length && !closed ? '<p class="nt">⏳ Sans réponse : ' + esc(miss.join(', ')) + '</p>' : '') +
                    '<div class="xdp-act">' + (!closed && whoOk(p) ? '<button class="ok" data-send>✓ Envoyer mes réponses</button><button data-fill title="Reprend ce que vous avez coché dans « Mes dispos »">🙋 Pré-remplir avec mes dispos</button>' : '') +
                    (M ? (closed ? '<button data-reopen>↺ Rouvrir</button>' : '<button data-close>📅 Retenir une date…</button>' + (miss.length && window.XMENT ? '<button data-nudge>📣 Relancer</button>' : '') + '<button data-edit>✏️ Modifier</button>') + '<button data-del title="Supprimer la proposition">🗑️</button>' : '') + '</div></div>';
            }).join('') : '<p class="xdp-e">Aucune proposition de dates pour l\'instant.' + (M ? ' Créez-en une, l\'équipe vote depuis Démarrer ou l\'app équipe.' : ' Le Master vous préviendra dans le chat.') + '</p>') + '</div>';
        const nw = c.querySelector('[data-new]'); if (nw) nw.onclick = () => editPoll(null, [...SEL].sort());
        c.querySelectorAll('.xdp-p').forEach(el => { const p = L.find(x => x.id === el.dataset.id); if (!p) return; const V = {}; Object.assign(V, (((p.votes || {})[my] || {}).v) || {});
            el.querySelectorAll('[data-vote]').forEach(b => b.onclick = () => { const k = b.dataset.vote, v = NEXT[V[k] || ''] || 'y'; if (v) V[k] = v; else delete V[k]; b.className = v; b.textContent = v ? ST[v][0] : '—'; });
            const f = el.querySelector('[data-fill]'); if (f) f.onclick = () => { const Mi = mine(); el.querySelectorAll('[data-vote]').forEach(b => { const v = Mi[b.dataset.vote.slice(0, 10)]; if (v) { V[b.dataset.vote] = v; b.className = v; b.textContent = ST[v][0]; } }); };
            const s = el.querySelector('[data-send]'); if (s) s.onclick = async () => { s.disabled = true; const r = await api('poll_vote', { id: p.id, votes: V }); s.disabled = false; if (r.ok) { say('🗳️ Réponses envoyées'); Object.assign(p, r.poll); W(K_CACHE, D); vPoll(c); } else say('⚠️ Envoi impossible (' + r.err + ')'); };
            const cl = el.querySelector('[data-close]'); if (cl) cl.onclick = () => choose(p, c);
            const ro = el.querySelector('[data-reopen]'); if (ro) ro.onclick = () => savePoll(Object.assign({}, p, { status: 'open', chosen: '' }), c);
            const ed = el.querySelector('[data-edit]'); if (ed) ed.onclick = () => editPoll(p);
            const de = el.querySelector('[data-del]'); if (de) de.onclick = async () => { if (!confirm('Supprimer « ' + p.title + ' » et ses réponses ?')) return; const r = await api('poll_del', { id: p.id }); if (r.ok) { D.polls = D.polls.filter(x => x.id !== p.id); W(K_CACHE, D); vPoll(c); } else say('⚠️ ' + r.err); };
            const nu = el.querySelector('[data-nudge]'); if (nu) nu.onclick = async () => { const voters = Object.keys(p.votes || {}), miss = (p.who || []).filter(w => !voters.some(v => fold(v) === fold(w))); const r = await XMENT.chatSend(miss.map(w => '@' + w.trim().replace(/\s+/g, '_')).join(' ') + ' merci de répondre à la proposition « ' + p.title + ' » (Démarrer › 📅 Agenda › 🙋 Disponibilités › 🗳️)', null); say(r.ok ? '📣 Relance envoyée' : '⚠️ ' + r.err); };
        });
    }
    async function savePoll(p, c, announce) {
        const r = await api('poll_save', { poll: p }); if (!r.ok) { say('⚠️ Enregistrement impossible (' + (r.err === 'admin' ? 'réservé au Master' : r.err) + ')'); return null; }
        const i = D.polls.findIndex(x => x.id === r.poll.id); if (i < 0) D.polls.push(r.poll); else D.polls[i] = r.poll; W(K_CACHE, D);
        if (announce && window.XMENT && XMENT.chatSend) XMENT.chatSend(announce, null).catch(() => { });
        if (c && c.isConnected) vPoll(c); else draw(); return r.poll;
    }
    // création / modification
    function editPoll(p, preDates) {
        const all = people(), isNew = !p; p = p || { id: 'p' + Date.now().toString(36), title: '', note: '', dates: (preDates || []).map(d => ({ d, t: '' })), who: all.map(x => x.nom).filter(n => fold(n) !== fold(D.me || me())) };
        const o = document.getElementById('xdp'), c = o.querySelector('.xdp-c');
        const render = () => { c.innerHTML = '<div class="xdp-ed"><h4>' + (isNew ? '➕ Nouvelle proposition de dates' : '✏️ Modifier la proposition') + '</h4>' +
            '<label>Objet<input data-k="title" maxlength="120" placeholder="Ex. : Tournage clip — jour 1, Repérage Lyon, Réunion de prépa…" value="' + esc(p.title) + '"></label>' +
            '<label>Précisions (facultatif)<input data-k="note" maxlength="500" placeholder="Lieu, horaires, durée…" value="' + esc(p.note) + '"></label>' +
            '<div class="xdp-dl"><b>Dates proposées</b>' + (p.dates.length ? p.dates.map((d, i) => '<span class="dt"><input type="date" data-di="' + i + '" value="' + d.d + '"><input data-ti="' + i + '" placeholder="Heure / créneau" value="' + esc(d.t) + '" maxlength="20"><button data-rm="' + i + '" aria-label="Retirer">✕</button></span>').join('') : '<span class="xdp-e">Aucune date.</span>') + '<button data-add>➕ Ajouter une date</button></div>' +
            '<div class="xdp-who"><b>Concerné(s)</b> <button data-allw class="sm">Tous</button><button data-now class="sm">Aucun</button><div>' + all.filter(x => fold(x.nom) !== fold(D.me || me())).map(x => '<label><input type="checkbox" value="' + esc(x.nom) + '"' + (p.who.some(w => fold(w) === fold(x.nom)) ? ' checked' : '') + '>' + esc(x.nom) + (x.sec ? ' <small>' + esc(x.sec) + '</small>' : '') + '</label>').join('') + '</div></div>' +
            '<label class="ck"><input type="checkbox" data-ann checked> 💬 Annoncer dans le chat avec une mention @ aux personnes concernées</label>' +
            '<div class="xdp-act"><button data-cancel>Annuler</button><button class="ok" data-save>' + (isNew ? '🗳️ Envoyer la proposition' : '💾 Enregistrer') + '</button></div></div>';
            const sync = () => { p.title = c.querySelector('[data-k=title]').value.trim(); p.note = c.querySelector('[data-k=note]').value.trim(); c.querySelectorAll('[data-di]').forEach(x => p.dates[+x.dataset.di].d = x.value); c.querySelectorAll('[data-ti]').forEach(x => p.dates[+x.dataset.ti].t = x.value.trim()); p.who = [...c.querySelectorAll('.xdp-who input:checked')].map(x => x.value); };
            c.querySelector('[data-add]').onclick = () => { sync(); const l = p.dates.slice(-1)[0]; p.dates.push({ d: l ? addD(l.d, 1) : addD(T0(), 7), t: l ? l.t : '' }); render(); };
            c.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { sync(); p.dates.splice(+b.dataset.rm, 1); render(); });
            c.querySelector('[data-allw]').onclick = () => c.querySelectorAll('.xdp-who input').forEach(x => x.checked = true); c.querySelector('[data-now]').onclick = () => c.querySelectorAll('.xdp-who input').forEach(x => x.checked = false);
            c.querySelector('[data-cancel]').onclick = () => draw();
            c.querySelector('[data-save]').onclick = async () => { sync(); p.dates = p.dates.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d.d)); if (!p.title) { c.querySelector('[data-k=title]').focus(); say('Donnez un objet à la proposition'); return; } if (!p.dates.length) { say('Ajoutez au moins une date'); return; }
                const ann = c.querySelector('[data-ann]').checked && isNew ? (p.who.map(w => '@' + w.trim().replace(/\s+/g, '_')).join(' ') + ' 🗳️ Nouvelle proposition de dates : « ' + p.title + ' » — ' + p.dates.map(d => frD(d.d) + (d.t ? ' ' + d.t : '')).join(', ') + ' · Répondez dans Démarrer › 📅 Agenda › 🙋 Disponibilités (ou l\'app équipe).').trim() : '';
                SEL.clear(); const b = c.querySelector('[data-save]'); b.disabled = true; const r = await savePoll(Object.assign({}, p, { status: 'open' }), null, ann); b.disabled = false; if (r) { TAB = 'poll'; draw(); say(isNew ? '🗳️ Proposition envoyée' : '💾 Enregistré'); } };
        };
        render(); c.querySelector('[data-k=title]').focus();
    }
    // retenir une date → PLANNO (jalon) + chat
    function choose(p, c) {
        const el = c.querySelector('.xdp-p[data-id="' + p.id + '"] .xdp-act'), V = p.votes || {};
        el.innerHTML = '<span>Quelle date retenir ?</span>' + p.dates.map(d => { const k = d.d + (d.t ? ' ' + d.t : ''), s = Object.keys(V).reduce((a, n) => { const x = (V[n].v || {})[k]; if (x) a[x]++; return a; }, { y: 0, p: 0, n: 0 }); return '<button data-ch="' + esc(k) + '">' + frD(d.d) + (d.t ? ' ' + esc(d.t) : '') + ' <small>✅' + s.y + ' ❌' + s.n + '</small></button>'; }).join('') + '<label class="ck"><input type="checkbox" checked data-pl> Ajouter à PLANNO / CALENDRIER</label><button data-x>Annuler</button>';
        el.querySelector('[data-x]').onclick = () => vPoll(c);
        el.querySelectorAll('[data-ch]').forEach(b => b.onclick = async () => { const k = b.dataset.ch, toPl = el.querySelector('[data-pl]').checked;
            const ann = ((p.who || []).concat(Object.keys(V)).filter((x, i, a) => a.findIndex(y => fold(y) === fold(x)) === i && fold(x) !== fold(D.me || me())).map(w => '@' + w.trim().replace(/\s+/g, '_')).join(' ') + ' 📅 Date retenue pour « ' + p.title + ' » : ' + frD(k.slice(0, 10), { weekday: 'long', day: 'numeric', month: 'long' }) + (k.slice(11) ? ' ' + k.slice(11) : '') + '.').trim();
            const r = await savePoll(Object.assign({}, p, { status: 'closed', chosen: k }), c, ann); if (r && toPl) toPlanno(r); });
    }
    function toPlanno(p) {
        try { const pl = J('plannoXIII.project', null) || { app: 'PLANNO XIII', v: 1, name: '', tasks: [] }; pl.tasks = pl.tasks || []; let t = pl.tasks.find(x => x.src === 'xd:' + p.id);
            if (!t) { t = { id: 't' + Date.now().toString(36), phase: 'prepa', who: [], ms: true, src: 'xd:' + p.id }; pl.tasks.push(t); }
            Object.assign(t, { name: '📅 ' + p.title + (p.chosen.slice(11) ? ' (' + p.chosen.slice(11) + ')' : ''), start: p.chosen.slice(0, 10), end: p.chosen.slice(0, 10), who: Object.keys(p.votes || {}).filter(n => ((p.votes[n].v || {})[p.chosen]) !== 'n').slice(0, 30) });
            pl.updated = Date.now(); W('plannoXIII.project', pl); say('📅 Ajouté à PLANNO et au CALENDRIER'); } catch (e) { say('⚠️ PLANNO : ' + e.message); }
    }
    // ---------- pour CALENDRIER / agenda : propositions ouvertes, dates retenues, indispos agrégées ----------
    function events() {
        const C = J(K_CACHE, { list: [], polls: [] }), E = [], t0 = addD(T0(), -31);
        (C.polls || []).forEach(p => { if (p.status === 'closed' && p.chosen) return; (p.dates || []).forEach(d => d.d >= t0 && E.push({ d: d.d, t: '🗳️ Proposé : ' + p.title + (d.t ? ' (' + d.t + ')' : ''), det: Object.keys(p.votes || {}).length + ' réponse(s)' })); });
        const ko = {}; (C.list || []).forEach(m => Object.keys(m.days || {}).forEach(d => { if (m.days[d] === 'n' && d >= t0) (ko[d] = ko[d] || []).push(m.nom); }));
        Object.keys(ko).forEach(d => E.push({ d, t: '❌ ' + (ko[d].length > 2 ? ko[d].length + ' indisponibles' : ko[d].join(', ') + ' indispo.'), det: ko[d].join(', ') }));
        return E;
    }
    async function pending() { if (!cfg()) return 0; await refresh(); return (D.polls || []).filter(p => p.status !== 'closed' && !(p.votes || {})[D.me || me()] && whoOk(p)).length; }
    function css() {
        if (document.getElementById('xdp-css')) return; const s = document.createElement('style'); s.id = 'xdp-css';
        s.textContent = '#xdp{position:fixed;inset:0;z-index:9991;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:14px;font:14px system-ui,sans-serif}.xdp-b{background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;width:min(980px,100%);max-height:92vh;display:flex;flex-direction:column;box-shadow:0 14px 50px rgba(0,0,0,.5)}' +
            '.xdp-h{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-soft,#3a3633)}.xdp-h b{font-size:16px}.xdp-sync{font-size:11.5px;color:var(--text-dim,#aaa);margin-left:auto}.xdp-x{background:none;border:0;color:inherit;font-size:17px;cursor:pointer;padding:4px 8px}' +
            '#xdp nav{display:flex;gap:6px;padding:8px 14px 0;flex-wrap:wrap}#xdp nav button{padding:7px 12px;border-radius:9px 9px 0 0;border:1px solid var(--border-color,#45454b);border-bottom:0;background:transparent;color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}#xdp nav button.on{background:rgba(240,179,120,.18);border-color:rgba(240,179,120,.7)}#xdp nav i{font-style:normal;background:#F0B378;color:#1a1a1a;border-radius:9px;padding:0 6px;margin-left:4px}#xdp nav i:empty{display:none}' +
            '.xdp-c{overflow:auto;padding:12px 14px 14px;border-top:1px solid var(--border-soft,#3a3633);display:flex;flex-direction:column;gap:10px}.xdp-hint{margin:0;font-size:12.5px;color:var(--text-dim,#bbb)}.xdp-warn{margin:0;padding:8px 10px;border-radius:8px;background:rgba(255,183,77,.12);border:1px solid rgba(255,183,77,.4);font-size:12.5px}.xdp-e{color:var(--text-dim,#999);font-size:13px}' +
            '.xdp-mn{display:flex;align-items:center;gap:8px}.xdp-mn b{text-transform:capitalize;min-width:150px;text-align:center}.xdp-mn button,.xdp-q button,.xdp-act button,.xdp-best button,.xdp-ed button,.xdp-who button{padding:6px 11px;border-radius:8px;border:1px solid var(--border-color,#45454b);background:rgba(255,255,255,.04);color:inherit;font:inherit;font-size:13px;cursor:pointer}.xdp-mn button.sm,.sm{font-size:12px!important;padding:4px 8px!important}' +
            '.xdp-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;max-width:560px}.xdp-cal .wd{text-align:center;font-size:11px;color:var(--text-dim,#999)}.xdp-cal .dy{aspect-ratio:1.25;border-radius:9px;border:1px solid var(--border-color,#45454b);background:rgba(255,255,255,.03);color:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;touch-action:none;user-select:none;font:inherit;padding:0}.xdp-cal .dy b{font-size:13px}.xdp-cal .dy i{font-style:normal;font-size:13px}.xdp-cal .dy.y{background:rgba(102,187,106,.22);border-color:#66bb6a}.xdp-cal .dy.p{background:rgba(255,183,77,.2);border-color:#ffb74d}.xdp-cal .dy.n{background:rgba(229,115,115,.2);border-color:#e57373}.xdp-cal .dy.td{box-shadow:0 0 0 2px #F0B378 inset}.xdp-cal .dy.past{opacity:.45}' +
            '.xdp-q{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px}.xdp-note{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--text-dim,#bbb);max-width:560px}.xdp-note input,.xdp-ed input,.xdp-f select{font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:7px;padding:7px 9px}' +
            '.xdp-leg{display:flex;flex-wrap:wrap;gap:12px;font-size:11.5px;color:var(--text-dim,#aaa)}.xdp-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}' +
            '.xdp-f{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12.5px}.xdp-f label{display:flex;gap:6px;align-items:center}.xdp-best{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px}.xdp-best b{margin-right:4px}.xdp-best button small{color:var(--text-dim,#aaa)}' +
            '.xdp-gw{overflow:auto;border:1px solid var(--border-soft,#3a3633);border-radius:10px;max-height:46vh}.xdp-g{border-collapse:collapse;font-size:12px;min-width:100%}.xdp-g th,.xdp-g td{border-bottom:1px solid var(--border-soft,#333);text-align:center;padding:4px 3px;min-width:26px}.xdp-g thead th{position:sticky;top:0;background:var(--bg-panel,#252321);cursor:pointer;font-weight:600;z-index:1}.xdp-g thead th small{display:block;font-size:9.5px;color:var(--text-dim,#999)}.xdp-g thead th i{display:block;height:4px;border-radius:2px;margin:2px 2px 0;background:rgba(102,187,106,calc(.15 + var(--k)*.85))}.xdp-g thead th.we{color:var(--text-dim,#999)}.xdp-g th.past,.xdp-g td.past{opacity:.5}' +
            '.xdp-g tbody th{text-align:left;position:sticky;left:0;background:var(--bg-panel,#252321);white-space:nowrap;padding-right:10px;font-weight:600;z-index:1}.xdp-g tbody th small{display:block;font-weight:400;font-size:10.5px;color:var(--text-dim,#999)}.xdp-g tbody th small.nr{color:#ffb74d}.xdp-g thead th:first-child{left:0;z-index:2;text-align:left}.xdp-g td.y{background:rgba(102,187,106,.25)}.xdp-g td.p{background:rgba(255,183,77,.22)}.xdp-g td.n{background:rgba(229,115,115,.25)}.xdp-g .sel{outline:2px solid #F0B378;outline-offset:-2px}' +
            '.xdp-act{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:flex-end;font-size:12.5px}.xdp-act span{margin-right:auto;color:var(--text-dim,#aaa)}.xdp-act button.ok,.xdp-ed button.ok{background:#F0B378;color:#1a1a1a;border-color:#F0B378;font-weight:600}.xdp-act button:disabled{opacity:.45;cursor:default}' +
            '.xdp-pl{display:flex;flex-direction:column;gap:10px}.xdp-p{border:1px solid var(--border-color,#45454b);border-radius:11px;padding:10px 12px;display:flex;flex-direction:column;gap:8px}.xdp-p.cl{opacity:.8}.xdp-p .hd{display:flex;flex-wrap:wrap;gap:8px;align-items:baseline}.xdp-p .hd small{color:var(--text-dim,#aaa)}.xdp-p .chs{margin-left:auto;background:rgba(102,187,106,.2);border:1px solid #66bb6a;border-radius:8px;padding:2px 8px;font-size:12.5px}.xdp-p .nt{margin:0;font-size:12.5px;color:var(--text-dim,#bbb)}' +
            '.xdp-pv{border-collapse:collapse;font-size:12.5px;overflow:auto;display:block}.xdp-pv th,.xdp-pv td{padding:5px 7px;text-align:center;border-bottom:1px solid var(--border-soft,#333);white-space:nowrap}.xdp-pv thead th{font-weight:600}.xdp-pv thead th small,.xdp-pv thead th em{display:block;font-weight:400;font-style:normal;font-size:10.5px;color:var(--text-dim,#aaa)}.xdp-pv th.top{background:rgba(102,187,106,.15);border-radius:6px}.xdp-pv th.chosen{background:rgba(102,187,106,.3)}.xdp-pv tbody th{text-align:left;font-weight:600}.xdp-pv td.y{background:rgba(102,187,106,.22)}.xdp-pv td.p{background:rgba(255,183,77,.2)}.xdp-pv td.n{background:rgba(229,115,115,.22)}' +
            '.xdp-pv [data-vote]{min-width:40px;min-height:34px;border-radius:8px;border:1px dashed var(--border-color,#555);background:transparent;color:inherit;cursor:pointer;font-size:15px}.xdp-pv [data-vote].y{background:rgba(102,187,106,.3);border:1px solid #66bb6a}.xdp-pv [data-vote].p{background:rgba(255,183,77,.28);border:1px solid #ffb74d}.xdp-pv [data-vote].n{background:rgba(229,115,115,.3);border:1px solid #e57373}.xdp-pv tr.mine th{color:#F0B378}' +
            '.xdp-ed{display:flex;flex-direction:column;gap:10px;max-width:640px}.xdp-ed h4{margin:0}.xdp-ed label{display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:var(--text-dim,#bbb)}.xdp-ed label.ck{flex-direction:row;align-items:center;gap:6px}.xdp-ed label.ck input{width:auto}.xdp-dl{display:flex;flex-direction:column;gap:6px;align-items:flex-start}.xdp-dl .dt{display:flex;gap:6px;align-items:center}.xdp-dl .dt input:nth-child(2){width:130px}.xdp-who div{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:6px}.xdp-who label{flex-direction:row!important;align-items:center;gap:5px;color:var(--text,#eee)!important}.xdp-who input{width:auto}' +
            '@media (max-width:640px){.xdp-b{max-height:100vh;border-radius:0}#xdp{padding:0}.xdp-cal .dy{aspect-ratio:1}}';
        document.head.appendChild(s);
    }
    return { open, refresh, events, pending, best, _people: people };
})();


