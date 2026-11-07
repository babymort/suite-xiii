// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-07.js
// =====================================================================
//  SUITE XIII — XICAL : 📡 abonnement iCal en temps réel (via le ☁️ Drive du projet)
//  Quand l'abonnement est activé (CALENDRIER › 📡 Abonnement), chaque outil ouvert republie le calendrier de toute
//  la suite sur le Drive dès qu'une date change. Google Agenda, Apple Calendrier, Outlook s'abonnent à l'adresse
//  …/exec?a=ical&k=… et se mettent à jour tout seuls (au rythme de rafraîchissement de chaque agenda).
// =====================================================================
const XICAL = (() => {
    const K = 'xiii.ical', J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const drv = () => { const c = J('xiii.drive', null); return c && c.url && c.code && !c.tok ? c : null; };
    const S = () => J(K, {}), W = o => { try { localStorage.setItem(K, JSON.stringify(Object.assign(S(), o))); } catch (e) { } };
    const url = s => drv() ? drv().url.split('?')[0] + '?a=ical&k=' + s.k : '';
    async function call(a, p) { const c = drv(); return (await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a, code: c.code, by: (c.me && c.me.name) || 'Master' }, p)) })).json(); }
    let busy = false;
    async function publish(force) {
        const s = S(); if (!s.on || !s.k || !drv() || busy || typeof XCALEV === 'undefined') return null;
        const E = XCALEV.events(s.off || {}), txt = XCALEV.ics(E, s.name || 'SUITE XIII'), sig = txt.replace(/DTSTAMP:\w+/g, '').length + ':' + [...txt.replace(/DTSTAMP:\w+/g, '')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
        if (!force && sig === s.sig) return { same: true };
        busy = true;
        try { const g = await call('get', { app: 'ical_pub', since: -1 }); if (!g.ok) return g; let live = {}; try { live = JSON.parse((g.data || {}).live || '{}'); } catch (e) { }
            live[s.k] = { ics: txt, ts: Date.now(), n: E.length }; const r = await call('put', { app: 'ical_pub', base: g.rev || 0, data: { live: JSON.stringify(live) }, sum: '📡 agenda : ' + E.length + ' événement(s)' });
            if (r.ok) W({ sig, ts: Date.now(), n: E.length }); return r;
        } catch (e) { return { ok: false, err: 'net' }; } finally { busy = false; }
    }
    async function off() { const s = S(); try { const g = await call('get', { app: 'ical_pub', since: -1 }); const live = JSON.parse((g.data || {}).live || '{}'); if (live[s.k]) { live[s.k] = { off: true }; await call('put', { app: 'ical_pub', base: g.rev || 0, data: { live: JSON.stringify(live) }, sum: '📡 abonnement retiré' }); } } catch (e) { } W({ on: false }); }
    function init() { setTimeout(() => { publish(false); setInterval(() => publish(false), 30000); addEventListener('storage', e => { if (e.key && /XIII\.project|matosXIII|xiii\.cands/.test(e.key)) { clearTimeout(init.t); init.t = setTimeout(() => publish(false), 4000); } }); }, 6000); }
    return { init, publish, off, url, S, W, drv };
})();

XICAL.init();

// =====================================================================
//  SUITE XIII — XSCOPE : 🎯 une seule vue (onglet / journée / plan) d'un outil
//  capture() relève la vue ouverte (bouton de vue + onglet du haut) ; lock() n'affiche plus que les vues
//  permises : lien public d'une seule vue (🔗 Partager › 🎯 Une seule vue) ou autorisation précise
//  d'un membre (👥 Équipe › outils › 🎯 Autorisation précise).
// =====================================================================
var XSCOPE = window.XSCOPE || (() => {
    let APP = '', LOCK = null, busy = false;
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const clean = s => String(s || '').replace(/[✕⧉✎✏️❌×]/g, '').replace(/\s+/g, ' ').trim();
    const tabs = () => [...document.querySelectorAll('#tabs-container > .tab')];
    const tkey = t => { const ti = t.querySelector('.tab-title'); const oc = ti && ti.getAttribute('onclick'); if (oc) return oc.replace(/\s+/g, ''); const b = ti && (ti.querySelector('b') || ti.firstChild); return 'txt:' + clean(b ? b.textContent : (ti || t).textContent).slice(0, 40); };
    const tlab = t => { const ti = t.querySelector('.tab-title') || t; const c = ti.cloneNode(true); c.querySelectorAll('small,.tab-dot').forEach(x => x.remove()); return clean(c.textContent).slice(0, 40); };
    const views = () => [...document.querySelectorAll('#view-group [data-view]')];
    function capture() {
        const v = views().find(b => b.classList.contains('btn-active') || b.classList.contains('active')), t = tabs().find(x => x.classList.contains('active'));
        const o = { app: APP }; if (v) { o.v = v.dataset.view; o.vl = clean(v.textContent); } if (t && tabs().length > 1) { o.t = tkey(t); o.tl = tlab(t); } else if (t) { o.t = tkey(t); o.tl = tlab(t); }
        o.l = [o.tl, o.vl].filter(Boolean).join(' · ') || 'Vue actuelle'; return o;
    }
    const label = L => (L || []).map(x => x.l).join(' / ');
    function apply() {
        if (!LOCK || busy) return; busy = true;
        try {
            const V = new Set(LOCK.map(x => x.v).filter(Boolean)), T = new Set(LOCK.map(x => x.t).filter(Boolean));
            if (V.size) { const vb = views(); vb.forEach(b => { const ok = V.has(b.dataset.view); b.style.display = ok ? '' : 'none'; }); const act = vb.find(b => b.classList.contains('btn-active') || b.classList.contains('active')); if (act && !V.has(act.dataset.view)) { const first = [...V][0]; if (typeof setView === 'function') setView(first); else { const b = vb.find(x => x.dataset.view === first); if (b) b.click(); } } }
            if (T.size) { const tb = tabs(); tb.forEach(t => { t.style.display = T.has(tkey(t)) ? '' : 'none'; }); const act = tb.find(t => t.classList.contains('active')); if (act && !T.has(tkey(act))) { const ok = tb.find(t => T.has(tkey(t))); const ti = ok && (ok.querySelector('.tab-title') || ok); if (ti) ti.click(); } }
            let chip = document.getElementById('xsc-chip'); if (!chip) { chip = document.createElement('div'); chip.id = 'xsc-chip'; document.body.appendChild(chip); } chip.textContent = '🎯 ' + label(LOCK); chip.title = 'Vue partagée : seules ces parties de l\'outil sont visibles';
        } catch (e) { } setTimeout(() => { busy = false; }, 50);
    }
    function lock(L) { LOCK = (L || []).filter(Boolean); if (!LOCK.length) { LOCK = null; return; } document.documentElement.classList.add('xscope'); apply(); let t = null; new MutationObserver(() => { clearTimeout(t); t = setTimeout(apply, 120); }).observe(document.body, { childList: true, subtree: true }); }
    const b64e = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const b64d = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return JSON.parse(decodeURIComponent(escape(atob(s)))); };
    // ---------- 🔗 Partager › 🎯 Une seule vue ----------
    async function panel() {
        document.querySelectorAll('#xsc-ov').forEach(x => x.remove()); const sc = capture(), c = J('xiii.drive', null), M = !!(c && c.url && c.code);
        document.body.insertAdjacentHTML('beforeend', '<div id="xsc-ov"><div class="xsc-b"><div class="xsc-h"><b>🎯 Partager une seule vue</b><button id="xsc-x">✕</button></div><p>Vue ouverte : <b>' + E(sc.l) + '</b><br><small>Changez d\'onglet, de journée ou de plan avant d\'ouvrir cette fenêtre pour en partager un autre.</small></p>' +
            '<div class="xsc-s"><b>🌐 Lien de cette vue</b><small>Lecture seule, toujours à jour (via le ☁️ Drive) : le destinataire ne voit que cette vue, sans le reste de l\'outil.</small><button id="xsc-pub">Créer le lien de la vue</button><div id="xsc-po"></div></div>' +
            (M ? '<div class="xsc-s"><b>👤 Donner cette vue à un membre</b><small>Autorisation précise : dans cet outil, le membre ne verra que les vues que vous lui donnez.</small><div id="xsc-mo">Chargement de l\'équipe…</div></div>' : '') + '</div></div>');
        const o = document.getElementById('xsc-ov'); o.onclick = e => { if (e.target === o || e.target.id === 'xsc-x') o.remove(); };
        document.getElementById('xsc-pub').onclick = async () => {
            const P = document.getElementById('xsc-po'); if (typeof XPUB === 'undefined' || typeof XPUB.ensure !== 'function') { P.innerHTML = '<p class="xsc-e">Publication indisponible dans cet outil.</p>'; return; }
            P.textContent = 'Publication…'; const r = await XPUB.ensure(); if (!r || !r.url) { P.innerHTML = '<p class="xsc-e">' + E((r && r.err) || 'Reliez le ☁️ Drive du projet pour publier.') + '</p>'; return; }
            const url = r.url + '&sc=' + b64e([sc]), qr = window.XQRS ? XQRS.svg(url, { ecl: 'L', border: 2 }) : '';
            P.innerHTML = '<div class="xsc-q">' + qr + '</div><div class="xsc-r"><input readonly value="' + E(url) + '"><button id="xsc-cp">📋 Copier</button></div>'; document.getElementById('xsc-cp').onclick = async () => { try { await navigator.clipboard.writeText(url); document.getElementById('xsc-cp').textContent = '✓ Copié'; } catch (e) { prompt('Lien :', url); } };
        };
        if (M) { const box = document.getElementById('xsc-mo'); const api = async (a, p) => { try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a, code: c.code, by: (c.me && c.me.name) || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } };
            const r = await api('team'); if (!r.ok) { box.innerHTML = '<p class="xsc-e">' + (r.err === 'admin' ? 'Réservé au Master' : 'Drive injoignable') + '</p>'; return; }
            const L = (r.team || []).filter(x => !x.off && x.droit !== 'pending' && x.droit !== 'admin' && String(x.nom).charAt(0) !== '§');
            if (!L.length) { box.innerHTML = '<p>Aucun membre : créez-en dans 👥 Équipe.</p>'; return; }
            box.innerHTML = '<div class="xsc-r"><select id="xsc-m">' + L.map(x => '<option value="' + E(x.tok) + '">' + E(x.nom) + ((x.scope || {})[APP] ? ' · ' + x.scope[APP].length + ' vue(s)' : '') + '</option>').join('') + '</select><button id="xsc-give">Donner la vue</button></div><div id="xsc-mr"></div>';
            document.getElementById('xsc-give').onclick = async () => { const tok = document.getElementById('xsc-m').value, x = L.find(y => y.tok === tok), S = Object.assign({}, x.scope || {}); S[APP] = (S[APP] || []).filter(y => !(y.v === sc.v && y.t === sc.t)).concat([sc]);
                const outils = x.outils && x.outils.length ? (x.outils.includes(APP) ? x.outils : x.outils.concat([APP])) : null;
                const q = await api('mbr_set', { tok, set: { scope: S, outils } }); document.getElementById('xsc-mr').innerHTML = q.ok ? '<p class="xsc-ok">✓ ' + E(x.nom) + ' voit maintenant, dans cet outil : ' + E(label(S[APP])) + '</p>' : '<p class="xsc-e">❌ ' + E(q.err) + '</p>'; if (q.ok) x.scope = S; };
        }
    }
    function init(app) {
        APP = app; const s = document.createElement('style');
        s.textContent = '#xsc-chip{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:9984;background:rgba(240,179,120,.18);color:#f0b378;border:1px solid rgba(240,179,120,.6);border-radius:99px;padding:4px 12px;font:600 11.5px "Segoe UI",sans-serif;pointer-events:none;max-width:90vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}html.xscope #tabs-container ~ button,html.xscope .tab-add,html.xscope #add-tab-btn,html.xscope .tab .tab-btn{display:none!important}#xsc-ov{position:fixed;inset:0;z-index:9994;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px}.xsc-b{background:var(--bg-panel,#252321);color:var(--text-main,#eee);border-radius:14px;width:min(520px,100%);max-height:92vh;overflow:auto;padding:14px 16px;font:14px/1.45 "Segoe UI",sans-serif}.xsc-h{display:flex;justify-content:space-between;align-items:center}.xsc-h b{font-size:17px}.xsc-b small{display:block;opacity:.7;font-size:12px}.xsc-s{border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:10px 12px;margin-top:10px}.xsc-b button{font:600 13px "Segoe UI",sans-serif;padding:7px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:transparent;color:inherit;cursor:pointer;margin-top:8px}#xsc-pub,#xsc-give{background:#f0b378;color:#1d1b19;border-color:#f0b378}.xsc-r{display:flex;gap:6px;align-items:center;margin-top:6px}.xsc-r input,.xsc-r select{flex:1;font:13px "Segoe UI",sans-serif;padding:7px 9px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:inherit;min-width:0}.xsc-q{width:170px;background:#fff;border-radius:8px;padding:6px;margin-top:8px}.xsc-q svg{width:100%;height:auto;display:block}.xsc-e{color:#ef5350}.xsc-ok{color:#81c784}@media print{#xsc-chip,#xsc-ov{display:none!important}}';
        document.head.appendChild(s);
        const go = () => {
            const m = /[#&]sc=([^&]+)/.exec(location.hash); if (m) { try { lock(b64d(m[1])); return; } catch (e) { } }
            const c = J('xiii.drive', null); if (c && c.tok && !c.code && c.scope && c.scope[APP] && c.scope[APP].length) lock(c.scope[APP]);
        };
        XBOOT.ready(go, 600);
    }
    return { init, capture, lock, panel, b64e, b64d };
})();

XSCOPE.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XJOIN : 📲 connecter quelqu'un par lien / QR code (🔗 Partager, Master et Sous-Masters)
//  👤 une personne (lien nominatif : connexion directe, sans rien taper) · 👥 un secteur (chacun tape son nom
//  et reçoit son propre accès) · 📱 mon téléphone (le Master relie son téléphone, mêmes droits).
//  Tous les accès restent listés et révocables dans ☁️ Drive › équipe.
// =====================================================================
var XJOIN = window.XJOIN || (() => {
    let APP = '';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const cfg = () => { const c = J('xiii.drive', null); return c && c.url && c.code ? c : null; };
    const TEAMS = [['production', 'Production'], ['realisation', 'Réalisation'], ['image', 'Image / caméras'], ['son', 'Son'], ['lumiere', 'Lumière'], ['regie', 'Régie'], ['technique', 'Technique / vidéo'], ['deco', 'Décor / accessoires'], ['hmc', 'Costumes / maquillage'], ['post', 'Post-production'], ['talents', 'Talents / comédiens']];
    const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    async function pack(o) { const t = new TextEncoder().encode(JSON.stringify(o)); if (typeof CompressionStream !== 'function') return 'j.' + b64u(t); const st = new Blob([t]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'z.' + b64u(new Uint8Array(await new Response(st).arrayBuffer())); }
    async function api(a, p) { const c = cfg(); try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a, code: c.code, by: (c.me && c.me.name) || c.master || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    const fiche = () => { const s = J('xiii.projets', null), c = cfg(); return s && s.list ? s.list.find(f => f && f.id === ((c && c.pid) || s.active)) || null : null; };
    const base = () => location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const me = () => { const c = cfg(); return (c.me && c.me.name) || c.master || 'Master'; };
    async function make(mode, f) {
        const c = cfg(), common = { v: 2, url: c.url, pid: c.pid || '', proj: c.proj || '', master: me(), fiche: fiche(), go: f.go || 'index.html' };
        if (mode === 'me') { const r = await api('mkinv', { nom: me() + ' (téléphone)', droit: 'admin' }); if (!r.ok) throw r.err; return Object.assign(common, { code: r.tok, self: 1, nom: me(), perm: 'admin' }); }
        if (mode === 'sec') { const r = await api('mkinv', { sec: 1, nom: (TEAMS.find(t => t[0] === f.sec) || [0, f.sec])[1], droit: f.droit, secteur: f.sec, outils: f.outils, exp: f.exp }); if (!r.ok) throw r.err; return Object.assign(common, { stok: r.tok, sec: 1, perm: f.droit, secteur: f.sec, apps: f.outils }); }
        if (!f.nom) throw 'nom'; const r = await api('mkinv', { nom: f.nom, droit: f.droit, secteur: f.sec, outils: f.outils, exp: f.exp }); if (!r.ok) throw r.err;
        return Object.assign(common, { tok: r.tok, nom: f.nom, perm: f.droit, secteur: f.sec, apps: f.outils, auto: 1 });
    }
    function open() {
        document.querySelectorAll('#xjn-ov').forEach(x => x.remove()); const c = cfg();
        if (!c) { alert('📲 Connexion par QR : reliez d\'abord le projet au ☁️ Drive (en tant que Master).'); return; }
        const T = window.XLINKS ? XLINKS.T : {}, here = T[APP] ? T[APP][1] : APP.toUpperCase();
        document.body.insertAdjacentHTML('beforeend', '<div id="xjn-ov"><div class="xjn-b"><div class="xjn-h"><b>📲 Connecter au projet</b><button id="xjn-x">✕</button></div>' +
            '<div class="xjn-t"><button data-m="one" class="on">👤 Une personne</button><button data-m="sec">👥 Un secteur</button><button data-m="me">📱 Mon téléphone</button></div><div id="xjn-f"></div><div id="xjn-o"></div>' +
            '<p class="xjn-n">Le lien relie le téléphone ou l\'ordinateur au ☁️ Drive du projet en un geste. Vous gardez la main : chaque accès est listé et révocable dans <a href="drive.html">☁️ Drive › équipe</a>.</p></div></div>');
        const o = document.getElementById('xjn-ov'); let M = 'one';
        o.onclick = e => { if (e.target === o || e.target.id === 'xjn-x') o.remove(); };
        const sel = (id, L, v) => '<select id="' + id + '">' + L.map(x => '<option value="' + x[0] + '"' + (x[0] === v ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select>';
        const DR = [['edit', '✏️ Modification'], ['comment', '💬 Commentaires'], ['read', '👁️ Lecture seule']];
        const form = () => {
            const F = document.getElementById('xjn-f'); document.getElementById('xjn-o').innerHTML = '';
            if (M === 'me') F.innerHTML = '<p>Un QR code à scanner avec <b>votre</b> téléphone : il est relié au projet avec vos droits de Master (badge 👑), sans code à taper.</p><button class="xjn-go" id="xjn-go">Créer le QR code de mon téléphone</button>';
            else F.innerHTML = (M === 'one' ? '<label>Nom<input id="xjn-n" placeholder="Prénom Nom"></label>' : '') + '<div class="xjn-g"><label>Secteur' + sel('xjn-s', M === 'one' ? [['', '—']].concat(TEAMS) : TEAMS, M === 'one' ? '' : 'image') + '</label><label>Droit' + sel('xjn-d', DR, M === 'one' ? 'edit' : 'read') + '</label><label>Outils' + sel('xjn-a', [['all', 'Tous les outils'], ['here', here + ' seulement']], 'all') + '</label><label>Fin d\'accès<input id="xjn-e" type="date"></label></div>' +
                (M === 'sec' ? '<p class="xjn-n" style="margin:4px 0 0">Un seul QR pour tout le secteur (à afficher en régie, au camion…) : chacun tape son nom et reçoit son propre accès.</p>' : '') + '<button class="xjn-go" id="xjn-go">Créer le lien et le QR code</button>';
            document.getElementById('xjn-go').onclick = async () => {
                const g = document.getElementById('xjn-go'), v = id => (document.getElementById(id) || {}).value || '';
                const f = { nom: v('xjn-n').trim(), sec: v('xjn-s'), droit: v('xjn-d') || 'read', outils: v('xjn-a') === 'here' ? [APP] : null, exp: v('xjn-e') ? +new Date(v('xjn-e') + 'T23:59:59') : 0 };
                if (M === 'one' && !f.nom) { document.getElementById('xjn-n').focus(); return; }
                g.disabled = true; g.textContent = 'Création…'; let p;
                try { p = await make(M, f); } catch (e) { g.disabled = false; g.textContent = 'Réessayer'; document.getElementById('xjn-o').innerHTML = '<p class="xjn-err">❌ ' + (e === 'admin' ? 'Réservé au Master' : e === 'net' ? 'Drive injoignable' : e === 'code' ? 'Mettez à jour le script Google (v14)' : E(e)) + '</p>'; return; }
                const url = window.__xjn = base() + 'drive.html#j=' + await pack(p), qr = window.XQRS ? XQRS.svg(url, { ecl: 'L', border: 2 }) : '';
                g.disabled = false; g.textContent = M === 'me' ? 'Recréer' : 'Créer un autre lien';
                document.getElementById('xjn-o').innerHTML = '<div class="xjn-r"><div class="xjn-q">' + qr + '</div><div><b>' + (M === 'me' ? '📱 Votre téléphone' : M === 'sec' ? '👥 ' + E((TEAMS.find(t => t[0] === f.sec) || [0, ''])[1]) : '👤 ' + E(f.nom)) + '</b><p>' + (M === 'sec' ? 'Scanner → taper son nom → connecté.' : 'Scanner (ou ouvrir le lien) → connecté directement.') + '</p><button id="xjn-cp">📋 Copier le lien</button>' + (navigator.share ? ' <button id="xjn-sh">📤 Envoyer</button>' : '') + (M !== 'me' ? ' <button id="xjn-pr">🖨️ Imprimer</button>' : '') + '</div></div>';
                document.getElementById('xjn-cp').onclick = async () => { try { await navigator.clipboard.writeText(url); document.getElementById('xjn-cp').textContent = '✓ Copié'; } catch (e) { prompt('Lien :', url); } };
                const sh = document.getElementById('xjn-sh'); if (sh) sh.onclick = () => navigator.share({ title: 'Rejoindre ' + (c.proj || 'le projet'), url }).catch(() => { });
                const pr = document.getElementById('xjn-pr'); if (pr) pr.onclick = () => { const w = window.open('', '_blank'); if (!w) return; w.document.write('<title>Connexion</title><body style="font-family:sans-serif;text-align:center;padding:40px"><h1>📲 ' + E(c.proj || 'Projet') + '</h1><h2>' + (M === 'sec' ? E((TEAMS.find(t => t[0] === f.sec) || [0, ''])[1]) : E(f.nom)) + '</h2><div style="width:60vmin;margin:20px auto">' + qr + '</div><p style="font-size:18px">Scannez pour rejoindre le projet</p></body>'); w.document.close(); setTimeout(() => w.print(), 300); };
            };
        };
        o.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { M = b.dataset.m; o.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); form(); });
        form();
    }
    function init(app) {
        APP = app; const s = document.createElement('style');
        s.textContent = '#xjn-ov{position:fixed;inset:0;z-index:9994;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px}.xjn-b{background:var(--bg-panel,var(--panel,#252321));color:var(--text,var(--fg,#eee));border-radius:14px;width:min(560px,100%);max-height:92vh;overflow:auto;padding:14px 16px;font:14px/1.45 "Segoe UI",sans-serif}.xjn-h{display:flex;justify-content:space-between;align-items:center}.xjn-h b{font-size:17px}.xjn-b button{font:600 13px "Segoe UI",sans-serif;padding:7px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:transparent;color:inherit;cursor:pointer}.xjn-t{display:flex;gap:6px;margin:12px 0}.xjn-t button.on,.xjn-b .xjn-go{background:#f0b378;color:#1d1b19;border-color:#f0b378}.xjn-b label{display:flex;flex-direction:column;gap:3px;font-size:12px;opacity:.95;margin-bottom:8px}.xjn-b input,.xjn-b select{font:14px "Segoe UI",sans-serif;padding:7px 9px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:inherit}.xjn-g{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}.xjn-go{width:100%;margin-top:4px}.xjn-r{display:grid;grid-template-columns:180px 1fr;gap:14px;align-items:center;margin-top:12px}@media(max-width:480px){.xjn-r{grid-template-columns:1fr}}.xjn-q{background:#fff;border-radius:10px;padding:8px}.xjn-q svg{width:100%;height:auto;display:block}.xjn-n{opacity:.65;font-size:12px;margin:12px 0 0}.xjn-n a{color:#f0b378}.xjn-err{color:#ef5350}@media print{#xjn-ov{display:none!important}}';
        document.head.appendChild(s);
    }
    return { init, open, can: () => !!cfg() };
})();

XJOIN.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XPHONE : 📱 photos prises avec l'application équipe → intégrées dans l'outil
//  L'application dépose la photo dans le ☁️ Drive (feuille « Photos ») ; à l'ouverture de l'outil sur l'ordinateur,
//  un bandeau « 📱 N photo(s) prises au téléphone — Intégrer » les ajoute avec la fonction d'import de l'outil.
// =====================================================================
var XPHONE = window.XPHONE || (() => {
    let APP = '';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const cfg = () => { const c = J('xiii.drive', null); return c && c.url ? c : null; };
    async function api(a, p) { const c = cfg(); if (!c) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok && !c.code ? { tok: c.tok } : { code: c.code, by: (c.me && c.me.name) || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    // comment chaque outil ajoute des images : (fichiers, photos) → nombre ajouté
    const ADD = {
        moodo: async F => typeof addFiles === 'function' ? await addFiles(F) : 0,
        casto: async (F, L, IT) => { // rôles et candidats saisis au téléphone (photo facultative)
            if (typeof P === 'undefined' || !P.talents) return 0; const fold = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); let n = 0;
            const img = f => new Promise(res => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 640 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .82)); }; im.onerror = () => res(''); im.src = r.result; }; r.onerror = () => res(''); r.readAsDataURL(f); });
            const id = () => Math.random().toString(36).slice(2, 10); P.roles = P.roles || [];
            for (const it of IT) { let t = {}; try { t = JSON.parse(it.x.target || '{}'); } catch (e) { }
                if (t.role && !P.roles.some(r => fold(r.name) === fold(t.role))) P.roles.push({ id: id(), name: t.role, desc: t.rdesc || '' });
                if (t.kind === 'role') { n++; continue; }
                if (!t.name) continue; let c = P.talents.find(x => fold(x.name) === fold(t.name));
                if (!c) { c = { id: id(), name: t.name, role: t.role || '', phone: t.phone || '', email: t.email || '', agent: '', kind: 'comedien', status: 'casting', avail: {}, days: [], tags: ['📱 téléphone'], cachetType: 'jour', notes: '' }; P.talents.push(c); }
                if (t.note) c.notes = (c.notes ? c.notes + '\n' : '') + t.note; if (it.file && !c.photo) c.photo = await img(it.file); n++; }
            try { dirty(); render(); } catch (e) { } return n; },
        repero: async F => { // lieu choisi au téléphone (ou nouveau lieu, à la position GPS du téléphone)
            if (typeof addPhotos !== 'function' || typeof P === 'undefined') return 0; let n = 0; const G = {};
            F.forEach(f => { const k = (f.xph && f.xph.target) || ''; (G[k] = G[k] || []).push(f); });
            for (const k of Object.keys(G)) { let t = {}; try { t = JSON.parse(k || '{}'); } catch (e) { }
                let s = (t.s && P.spots.find(x => x.id === t.s)) || (t.n && P.spots.find(x => (x.name || '').trim().toLowerCase() === String(t.n).trim().toLowerCase()));
                if (!s) { const o = { name: t.n || ('Lieu ' + (P.spots.length + 1)) }; if (t.lat != null) { o.lat = t.lat; o.lon = t.lon; } s = typeof addSpot === 'function' ? await addSpot(o, { stay: true }) : null; s = s && s.id ? s : P.spots[P.spots.length - 1]; }
                if (!s) continue; const before = s.photos.length; n += await addPhotos(s, G[k]); s.photos.slice(before).forEach((m, i) => { const x = G[k][i] && G[k][i].xph; if (!x) return; if (x.cap && !m.cap) m.cap = x.cap; if (t.lat != null && m.lat == null) { m.lat = t.lat; m.lon = t.lon; } }); }
            try { dirty(); renderLibrary(); renderStats(); refresh(); } catch (e) { } return n; }
    };
    const has = a => !!ADD[a];
    async function check() {
        if (!ADD[APP]) return; const c = cfg(); if (!c || (c.tok && !c.code && c.perm !== 'edit')) return;
        const r = await api('ph_list', { app: APP }); if (!r.ok || !(r.photos || []).length) return; const L = r.photos;
        document.querySelectorAll('#xph-ban').forEach(b => b.remove());
        document.body.insertAdjacentHTML('beforeend', '<div id="xph-ban"><span>📱 <b>' + L.length + (APP === 'casto' ? ' fiche(s) de casting</b> envoyée(s) du téléphone' : ' photo(s)</b> prise(s) au téléphone') + (L[0].by ? ' par ' + String(L[0].by).replace(/</g, '&lt;') + (L.length > 1 && L.some(x => x.by !== L[0].by) ? '…' : '') : '') + '</span><button id="xph-ok">✓ Intégrer</button><button id="xph-no" class="sec">Plus tard</button></div>');
        document.getElementById('xph-no').onclick = () => document.getElementById('xph-ban').remove();
        document.getElementById('xph-ok').onclick = async () => {
            const b = document.getElementById('xph-ok'); b.disabled = true; b.textContent = 'Téléchargement…'; const F = [], done = [];
            const IT = []; for (const x of L) { if (/^x/.test(x.fid)) { IT.push({ x }); done.push(x.fid); continue; } const f = await api('file_get', { id: x.fid }); if (!f.ok || !f.b64) continue; const bin = atob(f.b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
                const name = (x.cap || ('Photo ' + (x.by || '') + ' ' + new Date(x.ts).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }))).replace(/[\/\\:]/g, '-') + '.jpg';
                const file = new File([u], name, { type: f.mime || 'image/jpeg' }); file.xph = x; F.push(file); IT.push({ x, file }); done.push(x.fid); }
            let n = 0; try { n = await ADD[APP](F, L, IT); } catch (e) { }
            if (done.length) await api('ph_done', { ids: done }); document.getElementById('xph-ban').remove(); try { (window.toast || console.log)('📱 ' + (n || F.length) + ' photo(s) du téléphone intégrée(s)'); } catch (e) { }
        };
    }
    function init(app) {
        APP = app; if (!ADD[app]) return; const s = document.createElement('style');
        s.textContent = '#xph-ban{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:9979;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 24px);background:#2b2723;color:#f2ede6;border:1px solid #f0b378;border-radius:12px;padding:9px 12px;font:13.5px/1.35 "Segoe UI",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4)}#xph-ban button{font:600 13px "Segoe UI",sans-serif;padding:6px 12px;border-radius:8px;border:0;background:#f0b378;color:#1d1b19;cursor:pointer}#xph-ban button.sec{background:transparent;color:#f2ede6;border:1px solid #555}@media print{#xph-ban{display:none!important}}html.xembed #xph-ban{display:none!important}';
        document.head.appendChild(s); setTimeout(() => check().catch(() => { }), 3000); setInterval(() => { if (document.visibilityState === 'visible' && !document.getElementById('xph-ban')) check().catch(() => { }); }, 120000);
    }
    return { init, check, ADD, has };
})();

XPHONE.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XPASS : passerelles de la saison 4 (envoi d'un outil à l'autre par une « boîte de réception »)
//  L'outil source prépare un paquet (📤 Vers Suite XIII), l'outil cible s'ouvre et propose de l'intégrer :
//  bandeau « 📥 … reçu de … — Intégrer / Ignorer ». Rien n'est modifié sans le clic.
// =====================================================================
var XPASS = window.XPASS || (() => {
    let APP = '';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const F = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    const id = () => Math.random().toString(36).slice(2, 10);
    const G = () => (typeof P !== 'undefined' ? P : null);
    const say = m => { try { (window.toast || window.showToast || console.log)(m); } catch (e) { } };
    const save = () => { try { if (typeof dirty === 'function') dirty(); } catch (e) { } try { if (typeof saveProject === 'function') saveProject(true); else if (typeof saveAll === 'function') saveAll(true); } catch (e) { } try { if (typeof render === 'function') render(); else if (typeof renderAll === 'function') renderAll(); else if (typeof renderContent === 'function') renderContent(); } catch (e) { } };
    const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    // ---------- les passerelles : [source>cible] = { src() → paquet, lab(paquet), merge(paquet) → message } ----------
    // ---------- MATOS : ajout au « Matériel du projet » de la fiche active ----------
    const fold = x => F(x);
    function toPM(items, src) {
        const p = G(); if (!p) throw 'MATOS pas encore prêt'; const s = J('xiii.projets', null), id = (s && s.active) || '_'; p.pm = p.pm || {}; const pm = p.pm[id] = p.pm[id] || { items: [] }; let n = 0;
        items.forEach(e => { const nm = String(e.name || '').trim(); if (!nm) return; const g = e.grp || 'IMAGE', x = pm.items.find(i => fold(i.name) === fold(nm) && i.grp === g);
            if (x) { if (e.max) x.qty = Math.max(x.qty || 1, e.qty || 1); else x.qty = (x.qty || 0) + (e.qty || 1); if (e.note && !String(x.src || '').includes(e.note)) x.src = (x.src ? x.src + ' · ' : '') + e.note; }
            else pm.items.push({ id: id2(), name: nm, qty: e.qty || 1, grp: g, on: true, src: src + (e.note ? ' · ' + e.note : '') }); n++; });
        try { if (typeof setView === 'function') setTimeout(() => setView('proj'), 50); } catch (e) { }
        return n;
    }
    const id2 = () => Math.random().toString(36).slice(2, 10);
    // véhicule conseillé d'après le poids et le volume (marge de 30 % pour le calage)
    function vehFor(kg, vol) { const v = vol * 1.3;
        if (v <= 0.6 && kg <= 250) return ['car', 'Voiture (break / coffre)'];
        if (v <= 6 && kg <= 800) return ['van', 'Utilitaire 6 m³'];
        if (v <= 12 && kg <= 1100) return ['van', 'Utilitaire 12 m³'];
        if (v <= 20 && kg <= 1100) return ['van', 'Utilitaire 20 m³ (permis B)'];
        const n = Math.max(1, Math.ceil(Math.max(v / 40, kg / 8000))); return ['truck', (n > 1 ? n + ' × ' : '') + 'Porteur 40 m³ (permis C)']; }
    const nf1 = x => (Math.round(x * 10) / 10).toLocaleString('fr-FR');
    const DRX = [['real', /(realisat|scripte|assistant.*real)/], ['image', /(cadr|chef.*op|camera|steadi|pointeu|dit|vision|drone)/], ['son', /(son|perch|mix|audio)/], ['elec', /(electr|lumiere|eclair)/], ['machino', /(machin|grip)/], ['deco', /(deco|accessoir)/], ['cost', /(costum|habill)/], ['hmc', /(maquill|coiff)/], ['regie', /(regisseu|regie)/], ['post', /(monteu|etalon|truquis|post)/], ['prod', /(product|direct.*prod|charge)/], ['secu', /(secour|secur)/], ['transport', /(chauffeu|transport)/], ['cast', /(comedi|acteu|actric|talent|figura|artiste)/]];
    const dept = r => { const f = F(r); const m = DRX.find(x => x[1].test(f)); return m ? m[0] : 'autre'; };
    const hm = (t, k) => { const m = /^(\d{1,2})[:h](\d{2})/.exec(t || ''); if (!m) return ''; let x = (+m[1]) * 60 + (+m[2]) + k; x = (x + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
    const isoD = s => { s = String(s || '').trim(); let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); if (m) return m[0]; m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s); return m ? m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0') : ''; };
    // envoi groupé du matériel : payload « équipement » posé pour plusieurs outils d'un coup
    const EQT = { matos: n => 'matos.html?v=proj#pmimp=' + n, packingo: n => 'packingo.html#xlink=' + n, deviso: n => 'deviso.html#xlink=' + n };
    function eqPayload() { const f = n => typeof window[n] === 'function' ? window[n] : null; let d = null;
        try { if (f('xiiiCollectMaterial')) d = xiiiCollectMaterial('all'); else if (f('xpkCollect')) d = xpkCollect('all'); else if (f('xdPackPayload')) d = xdPackPayload(); else if (f('xdLsPayload')) d = xdLsPayload(); } catch (e) { }
        return d && ((d.items || []).length || (d.cables || []).length) ? d : null; }
    function sendAll(to) { const d0 = eqPayload(); if (!d0) return 0; let box = J('xiii.link.outbox', []) || [], n = 0;
        to.forEach(t => { const d = Object.assign({}, d0, { id: id() + id(), to: t, ts: Date.now(), from: APP }); box = box.filter(x => x && Date.now() - (x.ts || 0) < 7 * 864e5 && !(x.to === t && x.from === APP)); box.push(d);
            const L = J(box2(t), []).filter(x => !(x.k === 'eq' && x.from === APP)); L.push({ k: 'eq', from: APP, at: Date.now(), id: id(), lid: d.id, to: t, n: (d.items || []).reduce((a, i) => a + (+i.qty || 1), 0) }); W(box2(t), L); n++; });
        try { localStorage.setItem('xiii.link.outbox', JSON.stringify(box.slice(-12))); } catch (e) { return 0; } return n; }
    const box2 = a => 'xiii.inbox.' + a;
    const R = {
        'eq': { noP: 1,
            src() { throw 'Envoi groupé uniquement'; },
            lab: k => k.n + ' équipement(s)',
            merge(k) { location.href = EQT[k.to](k.lid); setTimeout(() => location.reload(), 60); return 'Ouverture de l\'import…'; }
        },
        // POSTO → PLANNO : étapes de post-production et livrables → tâches du planning (mises à jour au renvoi, jamais doublées)
        'posto>planno': {
            src() { const p = G(), S = (p.steps || []).filter(s => s.name && (s.start || s.due)).map(s => ({ k: 'st:' + s.id, name: s.name, who: s.who || '', start: s.start || s.due, end: s.due || s.start, status: s.status || 'todo', ms: false })),
                    L = (p.deliv || []).filter(d => d.name && d.due).map(d => ({ k: 'lv:' + d.id, name: '📦 ' + d.name, who: d.to || '', start: d.due, end: d.due, status: d.status === 'done' || d.done ? 'done' : 'todo', ms: true }));
                if (!S.length && !L.length) throw 'Aucune étape ni livrable daté dans POSTO'; return { items: S.concat(L), proj: p.name || '' }; },
            lab: k => k.items.length + ' étape(s) et livrable(s) de post-production',
            merge(k) { const p = G(); p.tasks = p.tasks || []; let a = 0, u = 0;
                k.items.forEach(i => { const tag = 'posto:' + i.k, o = p.tasks.find(t => t.xsrc === tag) || p.tasks.find(t => !t.xsrc && F(t.name) === F(i.name) && (t.phase === 'post' || t.phase === 'livraison'));
                    const val = { name: i.name, start: i.start, end: i.end, status: i.status, ms: i.ms, phase: i.ms ? 'livraison' : 'post' };
                    if (o) { Object.assign(o, { start: val.start, end: val.end, status: val.status, xsrc: tag }); if (i.who && !(o.who || []).length) o.who = [i.who]; u++; }
                    else { p.tasks.push(Object.assign({ id: id(), who: i.who ? [i.who] : [], xsrc: tag }, val)); a++; } });
                return (a ? a + ' tâche(s) ajoutée(s)' : '') + (a && u ? ', ' : '') + (u ? u + ' tâche(s) mise(s) à jour (dates, état)' : '') + ' dans le planning'; }
        },
        // MOODO → REPERO : planches « Lieu / décor » → lieux à voir (pistes d'adresses, ambiance, contraintes), une seule fois par planche
        'moodo>repero': {
            src() { const p = G(), B = (p.boards || []).filter(b => b.type === 'lieu' && b.name);
                if (!B.length) throw 'Aucune planche « Lieu / décor » dans MOODO'; const fi = b => b.fiche || {};
                return { items: B.map(b => ({ k: b.id, name: b.name, pistes: String(fi(b).pistes || '').trim(), notes: [fi(b).type && 'Type : ' + fi(b).type, fi(b).ambiance && 'Ambiance : ' + fi(b).ambiance, fi(b).lumiere && 'Lumière : ' + fi(b).lumiere, fi(b).contraintes && 'Contraintes : ' + fi(b).contraintes].filter(Boolean).join(' · ') })), proj: p.name || '' }; },
            lab: k => k.items.length + ' décor(s) recherché(s)',
            merge(k) { const p = G(); p.spots = p.spots || []; let a = 0, u = 0;
                k.items.forEach(i => { const tag = 'moodo:' + i.k, o = p.spots.find(s => s.xsrc === tag), line = (i.pistes.split(/\n/)[0] || '').trim(), adr = /\d/.test(line) ? line : '';
                    const note = '🎨 MOODO — ' + (i.notes || 'planche décor') + (i.pistes ? ' · Pistes : ' + i.pistes : '');
                    if (o) { o.notes = String(o.notes || '').replace(/🎨 MOODO — [^\n]*/, '').trim(); o.notes = (o.notes ? o.notes + '\n' : '') + note; u++; return; }
                    p.spots.push({ id: id(), name: i.name, address: adr, city: '', cp: '', lat: null, lon: null, cat: 'decor', status: 'avoir', date: '', access: '', owner: '', phone: '', email: '', notes: note, rating: 0, chk: {}, chkN: {}, photos: [], tech: {}, radius: 1500, hosp: '', src: null, created: new Date().toISOString(), xsrc: tag }); a++; });
                return (a ? a + ' lieu(x) « à voir » ajouté(s)' : '') + (a && u ? ', ' : '') + (u ? u + ' mis à jour' : '') + ' — à placer sur la carte (adresse)'; }
        },
        'repero>transporto': {
            src() { const p = G(), A = (p.spots || []).filter(s => s.status !== 'ecarte' && (s.address || s.city)), K = A.filter(s => s.status === 'retenu'), L = (K.length ? K : A).map(s => ({ name: s.name || 'Lieu', addr: [s.address, s.cp, s.city].filter(Boolean).join(' '), date: s.date || '' })); if (!L.length) throw 'Aucun lieu avec une adresse dans REPERO'; return { items: L }; },
            lab: k => k.items.length + ' lieu(x) de tournage',
            merge(k) { const p = G(); p.trips = p.trips = p.trips || []; p.xplaces = k.items.map(i => i.name + ' — ' + i.addr); const base = (p.hotels || [])[0]; let n = 0;
                k.items.forEach(i => { if (!i.date) return; const dest = i.name + ' — ' + i.addr; if (p.trips.some(t => t.date === i.date && F(t.to) === F(dest))) return; p.trips.push({ id: id(), date: i.date, time: '', dur: 30, from: base ? base.name : '', to: dest, veh: '', driver: '', pax: [], note: '📍 REPERO' }); n++; });
                try { if (typeof places === 'function') places(); } catch (e) { }
                return k.items.length + ' destination(s) proposée(s) dans les navettes' + (n ? ', ' + n + ' navette(s) créée(s) aux dates de tournage des lieux' : ''); }
        },
        'casto>callsheeto': {
            src() { const p = G(), L = (p.talents || []).filter(t => t.status === 'confirme' && t.name).map(t => ({ name: t.name, role: t.role || '', phone: t.phone || '', email: t.email || '', days: t.days || [], minor: !!t.minor, parent: t.parent || '' })); if (!L.length) throw 'Aucun talent « Confirmé » dans CASTO'; if (!L.some(t => t.days.length)) throw 'Cochez les jours de tournage des talents (📅 Disponibilités)'; return { items: L }; },
            lab: k => k.items.length + ' talent(s) à convoquer',
            merge(k) { const p = G(); let n = 0, d0 = 0;
                (p.days || []).forEach(d => { if (!d.date) return; d.crew = d.crew || []; const gen = (d.times || {}).general || ''; k.items.filter(t => t.days.includes(d.date)).forEach(t => { let c = d.crew.find(x => F(x.name) === F(t.name));
                    if (!c) { c = { id: id(), dept: 'cast', role: t.role || 'Comédien·ne', name: t.name, phone: t.phone, email: t.email, call: '', hmc: '', note: '' }; d.crew.push(c); }
                    c.dept = 'cast'; if (t.role) c.role = t.role; if (!c.phone) c.phone = t.phone; if (!c.email) c.email = t.email; if (!c.hmc && gen) c.hmc = gen; if (!c.call && gen) c.call = hm(gen, 60); if (t.minor && !/Mineur/.test(c.note || '')) c.note = ((c.note || '') + ' Mineur — représentant : ' + (t.parent || '?')).trim(); n++; }); d0++; });
                return n ? n + ' convocation(s) sur ' + d0 + ' journée(s) : HMC à l\'heure générale, plateau 1 h après (à ajuster)' : 'Aucune journée de la feuille de service ne correspond aux jours cochés dans CASTO'; }
        },
        'ressourco>callsheeto': {
            src() { const p = G(), M = {}; (p.docs || []).forEach(d => (d.rows || []).filter(r => r.on !== false && r.v).forEach(r => { const v = r.v, nm = ((v.prenom || '') + ' ' + (v.nom || '')).trim(); if (!nm) return; const m = M[F(nm)] = M[F(nm)] || { name: nm };
                    ['fonction', 'role', 'telephone', 'email', 'date_debut', 'date_fin', 'jours', 'horaires'].forEach(x => { if (v[x] && !m[x]) m[x] = v[x]; }); m.doc = m.doc || d.name; }));
                const L = Object.values(M); if (!L.length) throw 'Aucune personne dans les contrats de RESSOURCO'; return { items: L }; },
            lab: k => k.items.length + ' personne(s) sous contrat',
            merge(k) { const p = G(); let n = 0, u = 0;
                (p.days || []).forEach(d => { if (!d.date) return; d.crew = d.crew || []; k.items.forEach(m => { const a = isoD(m.date_debut), b = isoD(m.date_fin) || a, js = String(m.jours || '').split(/[,;\s]+/).map(isoD).filter(Boolean);
                    const on = js.length ? js.includes(d.date) : a ? (d.date >= a && d.date <= b) : true; if (!on) return; const fn = m.fonction || m.role || '', t0 = /(\d{1,2})[:h](\d{2})/.exec(m.horaires || '');
                    let c = d.crew.find(x => F(x.name) === F(m.name)); if (!c) { c = { id: id(), dept: dept(fn), role: fn, name: m.name, phone: '', email: '', call: '', hmc: '', note: '' }; d.crew.push(c); n++; } else u++;
                    if (!c.phone && m.telephone) c.phone = m.telephone; if (!c.email && m.email) c.email = m.email; if (!c.role && fn) c.role = fn; if (!c.call && t0) c.call = t0[1].padStart(2, '0') + ':' + t0[2]; }); });
                return n + ' membre(s) ajouté(s), ' + u + ' complété(s) (téléphone, horaires) sur les journées de leur contrat'; }
        },
        'conduco>graphico': {
            src() { const p = G(), T = ((p.resources || {}).talents || []).filter(t => t.name).map(t => ({ name: t.name, role: t.role || '' })); if (!T.length) throw 'Aucun intervenant déclaré dans CONDUCO (Ressources › Intervenants)'; return { items: T, name: p.name || '' }; },
            lab: k => k.items.length + ' synthé(s) nom + fonction',
            merge(k) { const p = G(); if (typeof GX === 'undefined' || typeof addGraphicObj !== 'function') throw 'GRAPHICO pas encore prêt'; const t = GX.LIB.find(x => x.id === 'syn-classique') || GX.LIB.find(x => x.cat === 'Synthés'); let n = 0;
                k.items.forEach(i => { const nm = 'Synthé — ' + i.name; if (p.graphics.some(g => g.name === nm)) return; const g = GX.instantiate(t, p, (typeof prefs !== 'undefined' && prefs.palKey) || 'cuivre'); g.name = nm; (g.vars || []).forEach(v => { if (v.k === 'nom') v.def = i.name; if (v.k === 'fonction') v.def = i.role || ''; }); addGraphicObj(typeof normGraphic === 'function' ? normGraphic(g) : g, false); n++; });
                return n ? n + ' synthé(s) créé(s) (modèle « ' + t.name + ' »), un par intervenant' : 'Tous les intervenants ont déjà leur synthé'; }
        },
        'conduco>sono': {
            src() { const p = G(), T = ((p.resources || {}).talents || []).filter(t => t.name).map(t => ({ name: t.name, role: t.role || '', mic: t.mic || '' })); if (!T.length) throw 'Aucun intervenant déclaré dans CONDUCO'; return { items: T }; },
            lab: k => k.items.length + ' intervenant(s) à équiper',
            merge(k) { const p = G(); p.ch = p.ch || []; p.hf = p.hf || []; let n = 0, h = 0;
                k.items.forEach(i => { if (p.ch.some(c => F(c.src) === F(i.name))) return; const mic = i.mic || 'Micro cravate HF', hfOn = /hf|cravate|serre|lav|sans fil|main hf/i.test(mic) || !i.mic; let hf = '';
                    if (hfOn) { const x = { id: id(), name: 'HF — ' + i.name, t: 'main', model: '', f: '', lo: '', hi: '', grp: 'Plateau', note: '🎬 CONDUCO' }; p.hf.push(x); hf = x.name; h++; }
                    p.ch.push({ id: id(), src: i.name, mic, stand: hfOn ? '' : 'Pied de table', sb: '', ph: false, hf, grp: 'Plateau', note: '🎬 CONDUCO' + (i.role ? ' · ' + i.role : '') }); n++; });
                return n + ' voie(s) ajoutée(s) au patch' + (h ? ', ' + h + ' émetteur(s) HF à fréquencer' : ''); }
        },
        'syno>conduco': { noP: 0,
            src() { if (typeof xiiiCollectSources !== 'function') throw 'SYNO pas encore prêt'; const d = xiiiCollectSources('all'), S = d.sources || []; const cams = S.filter(s => s.kind === 'live' || s.kind === 'cam').map(s => s.name), recs = S.filter(s => s.kind === 'rec' || s.kind === 'iso').map(s => s.name); if (!cams.length && !recs.length) throw 'Aucune caméra ni enregistreur reconnu dans le synoptique'; return { cams, recs }; },
            lab: k => k.cams.length + ' caméra(s), ' + k.recs.length + ' enregistreur(s)',
            merge(k) { const p = G(), r = p.resources = p.resources || { cams: [], talents: [], sources: [] }; r.cams = r.cams || []; r.sources = r.sources || []; const PAL = typeof PALETTE !== 'undefined' ? PALETTE : ['#EF5350', '#FFA726', '#66BB6A', '#4FC3F7', '#AB47BC']; let c = 0, s = 0;
                k.cams.forEach(nm => { if (r.cams.some(x => F(x.name) === F(nm))) return; const num = r.cams.reduce((a, x) => Math.max(a, +x.num || 0), 0) + 1; r.cams.push({ id: id(), num, name: nm, type: /ptz/i.test(nm) ? 'PTZ / Tourelle' : /steadi/i.test(nm) ? 'Steadicam' : /grue|jib/i.test(nm) ? 'Grue / Jib' : 'Studio / pied', op: '', optic: '', pos: '', color: PAL[(num * 3) % PAL.length] }); c++; });
                k.recs.forEach(nm => { if (r.sources.some(x => F(x.name) === F(nm))) return; const n2 = r.sources.filter(x => /^MAG/.test(x.code || '')).length + 1; r.sources.push({ id: id(), code: 'MAG' + n2, name: nm, kind: 'Playback' }); s++; });
                return c + ' caméra(s) et ' + s + ' magnéto(s) ajoutés aux listes du conducteur'; }
        },
        'encodo>posto': { noP: 1,
            src() { if (typeof Q === 'undefined') throw 'ENCODO pas encore prêt'; const L = Q.filter(x => x.status === 'done' && (x.outs || []).length).map(x => ({ src: x.name, outs: x.outs.map(o => o.name) })); if (!L.length) throw 'Aucun fichier converti pour l\'instant'; return { items: L }; },
            lab: k => k.items.length + ' fichier(s) converti(s) prêts au dérushage',
            merge(k) { const p = G(); if (!p) throw 'POSTO pas encore prêt'; p.rushes = p.rushes || []; const base = s => F(String(s).replace(/\.[a-z0-9]{2,5}$/i, '')); let m = 0, a = 0;
                k.items.forEach(i => { const b = base(i.src), r = p.rushes.find(x => x.clip && (base(x.clip) === b || b.includes(base(x.clip)) || base(x.clip).includes(b)));
                    const tag = '🎞️ prêt : ' + i.outs.join(', '); if (r) { if (!String(r.mnote || '').includes(tag)) r.mnote = ((r.mnote || '') + ' ' + tag).trim(); m++; } else { p.rushes.push({ id: id(), clip: i.src.replace(/\.[a-z0-9]{2,5}$/i, ''), st: '', seq: '', plan: '', take: '', mnote: tag, done: false, star: false }); a++; } });
                try { if (window.XDER && XDER.render) XDER.render(); } catch (e) { }
                return m + ' prise(s) reliée(s) à leur fichier converti' + (a ? ', ' + a + ' fichier(s) ajouté(s) au dérushage' : ''); }
        },
        'posto>soustitro': {
            src() { const p = G(), V = p.versions || [], v = (typeof vOf === 'function' ? vOf() : null) || V[V.length - 1]; const C = ((v && v.comments) || []).filter(c => c.text && c.tc != null).sort((a, b) => a.tc - b.tc).map(c => ({ tc: +c.tc || 0, text: c.text, cat: c.cat || '', who: c.who || '' })); if (!C.length) throw 'Aucun retour horodaté sur la version en cours'; return { items: C, name: (p.name || '') + (v && (v.label || v.name) ? ' — ' + (v.label || v.name) : '') }; },
            lab: k => k.items.length + ' marqueur(s) de « ' + k.name + ' »',
            merge(k) { const p = G(); p.cues = p.cues || []; let n = 0; k.items.forEach((c, i) => { const nx = k.items[i + 1], e = Math.min(c.tc + 3, nx ? Math.max(c.tc + 1, nx.tc - 0.1) : c.tc + 3); if (p.cues.some(x => Math.abs(x.s - c.tc) < .05 && x.t === c.text)) return; p.cues.push({ id: id(), s: +c.tc.toFixed(2), e: +e.toFixed(2), t: (c.who ? c.who + ' : ' : '') + c.text }); n++; });
                p.cues.sort((a, b) => a.s - b.s); if (!p.name) p.name = k.name; return n + ' marqueur(s) devenus sous-titres aux bons temps (3 s chacun, à ajuster)'; }
        },
        'packingo>transporto': {
            src() { const p = G(), C = p.cases || []; if (!C.length) throw 'Aucune caisse dans PACKINGO';
                const kgC = typeof caseKg === 'function' ? caseKg : c => (+c.tare || 0) + (c.items || []).reduce((a, i) => a + (+i.kg || 0) * (+i.qty || 1), 0), volC = typeof caseVol === 'function' ? caseVol : c => (+c.L || 0) * (+c.W || 0) * (+c.H || 0) / 1e6;
                const kg = C.reduce((a, c) => a + kgC(c), 0), vol = C.reduce((a, c) => a + volC(c), 0), nodim = C.filter(c => !volC(c)).length;
                return { kg: Math.round(kg), vol: Math.round(vol * 100) / 100, n: C.length, nodim, proj: (p.prod && p.prod.name) || '' }; },
            lab: k => k.n + ' caisse(s) · ' + nf1(k.kg) + ' kg · ' + nf1(k.vol) + ' m³',
            merge(k) { const p = G(); p.veh = p.veh || []; const [t, lab] = vehFor(k.kg, k.vol), MK = '📦 PACKINGO :';
                const note = MK + ' ' + k.n + ' caisse(s), ' + nf1(k.kg) + ' kg, ' + nf1(k.vol) + ' m³' + (k.nodim ? ' (' + k.nodim + ' sans dimensions)' : '') + ' → conseillé : ' + lab;
                let v = p.veh.find(x => String(x.note || '').includes(MK)) || p.veh.find(x => x.type !== 'car' && x.type !== 'moto' && !x.note);
                if (v) { v.note = String(v.note || '').split(MK)[0].trim(); v.note = (v.note ? v.note + ' · ' : '') + note; if (!v.type || v.type === 'autre') v.type = t; }
                else p.veh.push(v = { id: id(), name: 'Véhicule matériel', type: t, seats: t === 'car' ? 4 : 3, plate: '', driver: '', rent: '', note });
                return 'Charge reçue : ' + nf1(k.kg) + ' kg, ' + nf1(k.vol) + ' m³ → véhicule conseillé : ' + lab + ' (« ' + v.name + ' »)'; }
        },
        'lumo>syno': { noP: 1,
            src() { const p = G(), X = p.fx || []; if (!X.length) throw 'Aucun projecteur dans LUMO'; const U = [...new Set(X.map(f => String(f.univ || '1').trim() || '1'))].sort((a, b) => (+a || 0) - (+b || 0));
                return { u: U, n: X.reduce((a, f) => a + (+f.qty || 1), 0), proj: p.name || '' }; },
            lab: k => 'éclairage : ' + k.n + ' projecteur(s), ' + k.u.length + ' univers DMX',
            merge(k) { const A = typeof XCAT !== 'undefined' && XCAT.ADD && XCAT.ADD.syno; if (!A) throw 'SYNO pas encore prêt'; const U = k.u.length; let n = 0;
                const have = [...document.querySelectorAll('.node .node-title')].map(t => F(t.textContent)), sk = []; // déjà dans le synoptique (renvoi) : on ne double pas
                const add = it => { const base = F(it.model.split(' (')[0]); if (have.some(h => h.includes(base))) { sk.push(it.model.split(' (')[0]); return; } try { A.run(Object.assign({ brand: '', cat: 'lum' }, it)); n++; } catch (e) { } };
                add({ model: 'Console lumière (' + U + ' univers DMX)', inp: 'ETHERNET', outp: 'DMX OUT ×' + Math.min(4, U) + '; ETHERNET' });
                if (U > 1) { add({ model: 'Switch réseau lumière (Art-Net / sACN)', inp: 'ETHERNET', outp: 'ETHERNET ×' + (Math.ceil(U / 4) + 1) }); for (let i = 0; i < Math.ceil(U / 4); i++) add({ model: 'Nœud Art-Net / sACN ' + (i + 1) + ' (univers ' + k.u.slice(i * 4, i * 4 + 4).join(', ') + ')', inp: 'ETHERNET', outp: 'DMX OUT ×' + Math.min(4, U - i * 4) }); }
                add({ model: 'Splitter DMX (' + k.n + ' projecteurs)', inp: 'DMX IN', outp: 'DMX OUT ×6' });
                return n + ' élément(s) d\'éclairage ajoutés au synoptique (console, réseau DMX)' + (sk.length ? ' · déjà présents, non doublés : ' + sk.join(', ') : ''); }
        },
        'cadro>matos': {
            src() { const S0 = typeof S !== 'undefined' ? S : (J('cadro.state', {}) || {}).S || {}; const L = []; if (S0.name) L.push({ name: String(S0.name).split(' · ')[0], qty: 1, grp: 'IMAGE' });
                const ln = typeof lensOf === 'function' ? lensOf() : null; if (ln) { const nm = ln.name || ln.n || (Array.isArray(ln) ? ln[1] : '') || ln.id; L.push({ name: 'Optiques ' + nm + (S0.f ? ' (focale principale ' + S0.f + ' mm)' : ''), qty: 1, grp: 'IMAGE' }); } if (!L.length) throw 'Choisissez d\'abord un boîtier ou une optique dans CADRO'; return { items: L }; },
            lab: k => k.items.map(i => i.name).join(' + '),
            merge(k) { const n = toPM(k.items.map(i => Object.assign({ max: 1 }, i)), '🎥 CADRO'); return n + ' ligne(s) ajoutée(s) au 🎬 Matériel du projet (boîtier, optique)'; }
        },
        'decoup>matos': {
            src() { const p = G(), T = p.tabs || []; if (!T.length) throw 'Aucun découpage';
                const CT = { 'Steadicam': ['Steadicam', 'GRIP'], 'Grue / Jib': ['Grue / jib', 'GRIP'], 'Grue télescopique': ['Grue télescopique', 'GRIP'], 'Travelling / Dolly': ['Travelling + rails', 'GRIP'], 'Drone': ['Drone de prise de vue', 'IMAGE'], 'Spidercam / Câble': ['Câblecam (Spidercam)', 'GRIP'], 'Gimbal / Smartphone': ['Gimbal (stabilisateur)', 'GRIP'], 'PTZ / Tourelle': ['Caméra PTZ / tourelle', 'IMAGE'] };
                const MV = { trav_av: ['Travelling + rails', 'GRIP'], trav_ar: ['Travelling + rails', 'GRIP'], trav_lat: ['Travelling + rails', 'GRIP'], dolly_zoom: ['Travelling + rails', 'GRIP'], steadicam: ['Steadicam / gimbal', 'GRIP'], grue: ['Grue / jib', 'GRIP'], drone: ['Drone de prise de vue', 'IMAGE'] };
                const M = {}; const need = (e, seq, q) => { const k = e[0]; const m = M[k] = M[k] || { name: e[0], grp: e[1], qty: 0, seqs: new Set() }; m.qty = Math.max(m.qty, q || 1); m.seqs.add(String(seq).split(' — ')[0].replace(/^Séq\.?\s*/i, '')); };
                T.forEach(t => { const C = {}; (t.cams || []).forEach(c => C[c.id] = c); let seq = t.name || 'Découpage';
                    (t.items || []).forEach(it => { if (it.kind === 'header') { seq = it.title || seq; return; } const cnt = {}; (it.cams || []).forEach(cid => { const c = C[cid] || C[cid && cid.id]; if (c && CT[c.type]) cnt[c.type] = (cnt[c.type] || 0) + 1; }); Object.keys(cnt).forEach(ty => need(CT[ty], seq, cnt[ty])); (it.shots || []).forEach(sh => { if (MV[sh.move]) need(MV[sh.move], seq, 1); }); if (MV[it.move]) need(MV[it.move], seq, 1); }); });
                const L = Object.values(M).map(m => ({ name: m.name, grp: m.grp, qty: m.qty, note: 'séq. ' + [...m.seqs].slice(0, 4).join(', ') + (m.seqs.size > 4 ? '…' : '') })); if (!L.length) throw 'Aucune machinerie particulière (steadicam, grue, drone, travelling…) dans le découpage'; return { items: L }; },
            lab: k => k.items.map(i => (i.qty > 1 ? i.qty + '× ' : '') + i.name).join(', '),
            merge(k) { const n = toPM(k.items.map(i => Object.assign({ max: 1 }, i)), '🎬 DECOUP'); return n + ' machinerie(s) ajoutée(s) au 🎬 Matériel du projet, avec les séquences concernées'; }
        },
        'repero>matos': {
            src() { const p = G(), A = (p.spots || []).filter(s => s.status !== 'ecarte'), K = A.filter(s => s.status === 'retenu'), L0 = K.length ? K : A; if (!L0.length) throw 'Aucun lieu dans REPERO';
                const RU = [['elec', 'ko', 'Groupe électrogène', 'GRIP', 'pas de courant'], ['elec', 'q', 'Groupe électrogène (à confirmer)', 'GRIP', 'courant incertain'], ['elec', 'ko', 'Distribution électrique (armoire, prolongateurs)', 'GRIP', 'pas de courant'], ['res', 'ko', 'Routeur 4G/5G agrégé (bonding)', 'REGIE', 'pas de réseau'], ['fond', 'ko', 'Micros HF supplémentaires + bonnettes anti-vent', 'SON', 'bruit de fond'], ['camion', 'ko', 'Chariots de manutention', 'GRIP', 'accès camion difficile'], ['dist', 'ko', 'Chariots de manutention', 'GRIP', 'portage long'], ['risque', 'ko', 'EPI (harnais, gilets, casques)', 'CONSOMMABLES', 'risques sur le lieu']];
                const M = {}; L0.forEach(s => { const c = s.chk || {}; RU.forEach(r => { if (c[r[0]] === r[1]) { const m = M[r[2]] = M[r[2]] || { name: r[2], grp: r[3], qty: 1, why: new Set() }; m.why.add((s.name || 'lieu') + ' : ' + r[4]); } }); });
                const L = Object.values(M).map(m => ({ name: m.name, grp: m.grp, qty: 1, note: [...m.why].slice(0, 3).join(' ; ') })); if (!L.length) throw 'Aucune contrainte relevée dans la checklist des lieux (courant, réseau, bruit, accès…)'; return { items: L, n: L0.length }; },
            lab: k => k.items.length + ' besoin(s) liés aux lieux : ' + k.items.map(i => i.name).join(', '),
            merge(k) { const n = toPM(k.items.map(i => Object.assign({ max: 1 }, i)), '📍 REPERO'); return n + ' suggestion(s) ajoutée(s) au 🎬 Matériel du projet (à vérifier)'; }
        },
        'casto>transporto': {
            src() { const p = G(), L = (p.talents || []).filter(t => t.status === 'confirme' && t.name).map(t => ({ n: t.name, role: t.role || '', ph: t.phone || '' })); if (!L.length) throw 'Aucun talent « Confirmé » dans CASTO'; return { items: L, proj: p.name || '' }; },
            lab: k => k.items.length + ' talent(s) confirmé(s)',
            merge(k) { const p = G(); p.people = p.people || []; let n = 0; k.items.forEach(t => { if (p.people.some(x => F(x.n) === F(t.n))) return; p.people.push({ id: id(), n: t.n, role: t.role, ph: t.ph, arr: '', dep: '', hotel: true, need: '', note: '🎭 CASTO' }); n++; }); return n + ' passager(s) ajouté(s) (hébergement à prévoir coché)'; }
        },
        'deviso>matos': {
            src() { const p = G(), v = (p.versions || []).find(x => x.id === p.cur) || (p.versions || [])[0]; const L = ((v && v.eq) || []).filter(e => e.on !== false && e.name).map(e => ({ name: e.name, qty: Math.max(1, +e.qty || 1) })); if (!L.length) throw 'Aucun matériel dans le devis'; return { items: L, proj: p.name || 'Projet', from: p.debut || iso(new Date()), to: p.fin || p.debut || iso(new Date()), v: (v && v.name) || '' }; },
            lab: k => k.items.reduce((a, e) => a + e.qty, 0) + ' équipement(s) du devis « ' + (k.v || k.proj) + ' »',
            merge(k) { const p = G(); p.resas = p.resas || []; const used = new Set(), got = [], miss = [];
                k.items.forEach(e => { const f = F(e.name); for (let i = 0; i < e.qty; i++) { const u = (p.units || []).find(u => !used.has(u.id) && u.state !== 'hs' && (F(u.name) === f || F(u.name).includes(f) || f.includes(F(u.name)))); if (u) { used.add(u.id); got.push(u.id); } else { miss.push(e.name); break; } } });
                const tag = 'deviso:' + F(k.proj) + ':' + F(k.v || ''), old = p.resas.find(r => r.xsrc === tag && r.status === 'option'), note = '💶 DEVISO' + (k.v ? ' · ' + k.v : '') + (miss.length ? ' · absent du parc : ' + [...new Set(miss)].join(', ') : '');
                if (old) { Object.assign(old, { from: k.from, to: k.to, units: got, note }); try { if (typeof setView === 'function') setTimeout(() => setView('resa'), 50); } catch (e) { } return 'Réservation en option mise à jour (même devis, pas de doublon) : ' + got.length + ' unité(s)' + (miss.length ? ', ' + new Set(miss).size + ' modèle(s) absent(s) du parc' : ''); }
                p.resas.push({ id: id(), proj: k.proj, from: k.from, to: k.to, status: 'option', units: got, note, xsrc: tag });
                try { if (typeof setView === 'function') setTimeout(() => setView('resa'), 50); } catch (e) { }
                return 'Réservation en option créée : ' + got.length + ' unité(s)' + (miss.length ? ', ' + new Set(miss).size + ' modèle(s) absent(s) du parc' : '') + ' — conflits signalés dans 📅 Réservations'; }
        },
        'matos>callsheeto': {
            src() { const p = G(), U = {}; (p.units || []).forEach(u => U[u.id] = u.name); const L = (p.resas || []).filter(r => r.status !== 'annule').map(r => ({ proj: r.proj, from: r.from, to: r.to || r.from, names: (r.units || []).map(x => U[x]).filter(Boolean) })).filter(r => r.names.length); { const s0 = J('xiii.projets', null), pm = p.pm && p.pm[(s0 && s0.active) || '_']; if (pm && (pm.items || []).some(i => i.on)) { const nm = []; pm.items.filter(i => i.on).forEach(i => { for (let q = 0; q < Math.min(+i.qty || 1, 50); q++) nm.push(i.name); }); L.push({ proj: 'Matériel du projet', from: pm.out || '0000-00-00', to: pm.back || '9999-12-31', names: nm }); } } if (!L.length) throw 'Aucune réservation ni « Matériel du projet » coché'; return { items: L }; },
            lab: k => k.items.length + ' réservation(s) de matériel',
            merge(k) { const p = G(); let n = 0; const MK = '🎥 Matériel réservé (MATOS) :';
                (p.days || []).forEach(d => { if (!d.date) return; const names = []; k.items.forEach(r => { if (r.from <= d.date && d.date <= r.to) names.push(...r.names); }); const cnt = {}; names.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
                    let t = String(d.notes || ''); const i = t.indexOf(MK); if (i > -1) { const j = t.indexOf('\n\n', i); t = (t.slice(0, i) + (j > -1 ? t.slice(j + 2) : '')).trim(); }
                    if (names.length) { t = (t ? t + '\n\n' : '') + MK + ' ' + Object.keys(cnt).map(x => (cnt[x] > 1 ? cnt[x] + '× ' : '') + x).join(', '); n++; } d.notes = t; });
                return n ? 'Matériel ajouté aux notes de ' + n + ' journée(s)' : 'Aucune journée de la feuille de service ne tombe pendant les réservations'; }
        },
        'repero>plano': {
            src() { const p = G(), s = (p.spots || []).find(x => x.id === p.cur) || (p.spots || [])[0]; if (!s) throw 'Aucun lieu dans REPERO'; const ph = (s.photos || []).map(m => (typeof PH !== 'undefined' && PH[m.id] && PH[m.id].data) || '').find(Boolean); if (!ph) throw 'Ajoutez d\'abord le plan de masse ou la photo aérienne dans les photos du lieu « ' + (s.name || '') + ' »'; return { name: s.name || 'Lieu', img: ph }; },
            lab: k => 'le fond de plan du lieu « ' + k.name + ' »',
            merge(k) { const inp = document.getElementById('bg-upload'); if (!inp) throw 'Fond de plan indisponible'; const b = atob(k.img.split(',')[1]), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); const mime = (k.img.match(/^data:([^;]+)/) || [0, 'image/jpeg'])[1];
                const dt = new DataTransfer(); dt.items.add(new File([u], (k.name || 'lieu') + '.' + (mime.split('/')[1] || 'jpg'), { type: mime })); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); return 'Fond de plan importé : calibrez-le à l\'échelle (deux points de distance connue)'; }
        },
        'conduco>soustitro': {
            src() { const p = G(), t = (p.tabs || [])[p.active || 0] || (p.tabs || [])[0]; const L = ((t && t.items) || []).filter(i => i.script && i.script.trim()).map(i => ({ title: i.title || '', script: i.script.trim() })); if (!L.length) throw 'Aucun texte prompteur dans ce conducteur'; return { items: L, name: (p.name || '') + (t && t.name ? ' — ' + t.name : '') }; },
            lab: k => k.items.length + ' texte(s) prompteur',
            merge(k) { const p = G(); p.cues = p.cues || []; const was = p.cues.filter(c => c.xsrc === 'conduco').length; p.cues = p.cues.filter(c => c.xsrc !== 'conduco'); let a = p.cues.reduce((m, c) => Math.max(m, +c.e || 0), 0) + (p.cues.length ? 1 : 0), n = 0; // renvoi : on remplace les sous-titres déjà préparés depuis CONDUCO au lieu de les doubler
                k.items.forEach(it => it.script.split(/(?<=[.!?…])\s+|\n+/).map(x => x.trim()).filter(Boolean).forEach(x => { const len = Math.max(1.2, Math.min(7, x.length / 15)); p.cues.push({ id: id(), s: +a.toFixed(2), e: +(a + len).toFixed(2), t: typeof breakLines === 'function' ? breakLines(x) : x, xsrc: 'conduco' }); a += len + 0.1; n++; }));
                if (!p.name) p.name = k.name; return n + ' sous-titre(s) préparé(s) à partir du prompteur (temps estimés, à caler sur le direct)' + (was ? ' — remplacent les ' + was + ' préparés au dernier envoi' : ''); }
        },
        'backupo>posto': {
            src() { const p = G(), D = {}; (p.days || []).forEach(d => D[d.id] = d.date || ''); const req = (p.prod && p.prod.copiesReq) || 2;
                const L = (p.log || []).filter(l => !(l.errors && l.errors.length) && (l.dests || []).filter(d => d.st === 'ok').length >= Math.min(req, (l.dests || []).filter(d => d.st !== 'na').length || 1)).map(l => ({ date: D[l.day] || '', roll: l.roll || '', card: l.card || '', first: l.first || '', last: l.last || '', files: l.files || 0, bytes: l.bytes || 0 }));
                if (!L.length) throw 'Aucune carte déchargée et vérifiée'; return { items: L }; },
            lab: k => k.items.length + ' carte(s) déchargée(s) et vérifiée(s)',
            merge(k) { const p = G(); p.rushes = p.rushes || []; p.bkRolls = k.items; let n = 0; const base = s => String(s || '').replace(/\.[^.]+$/, '').toUpperCase();
                p.rushes.forEach(r => { if (!r.clip) return; const c = base(r.clip); const hit = k.items.find(x => (!x.date || !r.date || x.date === r.date) && ((x.first && x.last && c >= base(x.first) && c <= base(x.last)) || (x.roll && c.indexOf(String(x.roll).toUpperCase()) === 0))); if (hit) { if (r.bk !== hit.roll) n++; r.bk = hit.roll || hit.card || '✓'; } });
                try { if (typeof setView === 'function') setTimeout(() => setView('derush'), 50); } catch (e) { }
                return n + ' prise(s) marquée(s) 💽 disponible(s) au dérushage (' + k.items.length + ' carte(s) reçue(s))'; }
        },
        'scripto>callsheeto': {
            src() { const p = G(), today = iso(new Date()), days = (p.days || []).filter(d => d.date && d.date <= today).sort((a, b) => b.date.localeCompare(a.date));
                for (const d of days) { const L = (p.shots || []).filter(s => s.day === d.id && s.status !== 'done' && s.status !== 'skip'); if (L.length) return { date: d.date, label: d.label || '', items: L.map(s => ({ seq: s.seq || '', plan: s.plan || '', name: s.name || '', decor: s.decor || '' })) }; }
                throw 'Aucun plan non tourné sur les journées passées'; },
            lab: k => k.items.length + ' plan(s) non tourné(s) le ' + k.date.split('-').reverse().join('/'),
            merge(k) { const p = G(), D = (p.days || []).filter(d => d.date > k.date).sort((a, b) => a.date.localeCompare(b.date)); const d = D[0]; if (!d) throw 'Aucune journée après le ' + k.date.split('-').reverse().join('/') + ' dans la feuille de service';
                d.schedule = d.schedule || []; let n = 0; k.items.forEach(s => { const desc = '↪ REPORT ' + (k.label || k.date) + ' — Séq. ' + s.seq + ' / Plan ' + s.plan + (s.name ? ' : ' + s.name : '') + (s.decor ? ' (' + s.decor + ')' : ''); if (d.schedule.some(x => x.desc === desc)) return; d.schedule.push({ id: id(), time: '', desc }); n++; });
                return n + ' plan(s) reporté(s) au planning de ' + (d.name || d.date.split('-').reverse().join('/')); }
        }
    };
    const box = a => 'xiii.inbox.' + a;
    function send(k) {
        const r = R[k]; if (!r) return false; let pk; try { pk = r.src(); } catch (e) { alert(typeof e === 'string' ? e : 'Envoi impossible : ' + e.message); return true; }
        const [from, to] = k.split('>'); pk.k = k; pk.from = from; pk.at = Date.now(); pk.id = id();
        const L = J(box(to), []).filter(x => x.k !== k); L.push(pk); if (!W(box(to), L)) { alert('Paquet trop lourd pour être transmis (stockage du navigateur plein)'); return true; }
        location.href = to + '.html'; return true;
    }
    function banner() {
        document.querySelectorAll('#xps-ban').forEach(b => b.remove()); const L = J(box(APP), []).filter(x => R[x.k]); if (!L.length) return;
        const T = window.XLINKS ? XLINKS.T : {}, pk = L[0], fr = T[pk.from] || ['📤', pk.from.toUpperCase()];
        document.body.insertAdjacentHTML('beforeend', '<div id="xps-ban"><span>📥 <b>' + E(R[pk.k].lab(pk)) + '</b> reçu(s) de ' + fr[0] + ' ' + E(fr[1]) + (L.length > 1 ? ' <small>(+' + (L.length - 1) + ')</small>' : '') + '</span><button id="xps-ok">✓ Intégrer</button><button id="xps-no" class="sec">Ignorer</button></div>');
        const drop = () => W(box(APP), J(box(APP), []).filter(x => x.id !== pk.id));
        document.getElementById('xps-no').onclick = () => { drop(); banner(); };
        document.getElementById('xps-ok').onclick = () => { let m; try { if (!G() && pk.k !== 'repero>plano' && !R[pk.k].noP) throw 'Outil pas encore prêt'; m = R[pk.k].merge(pk); } catch (e) { alert(typeof e === 'string' ? e : 'Intégration impossible : ' + e.message); return; } drop(); if (pk.k !== 'repero>plano') save(); say('📥 ' + m); banner(); };
    }
    // 🤖 exécution sans clic (assistant de projet) : src = préparer le paquet dans la boîte de la cible ; merge = l'intégrer ici et enregistrer
    function auto(k, mode) {
        const r = R[k]; if (!r) throw 'Passerelle inconnue : ' + k; const [from, to] = k.split('>');
        if (mode === 'src') { const pk = r.src(); pk.k = k; pk.from = from; pk.at = Date.now(); pk.id = id(); const L = J(box(to), []).filter(x => x.k !== k); L.push(pk); if (!W(box(to), L)) throw 'Paquet trop lourd (stockage plein)'; return r.lab(pk); }
        const L = J(box(APP), []), pk = L.filter(x => x.k === k).pop(); if (!pk) throw 'Rien à intégrer (la source est vide ?)';
        if (!G() && !r.noP) throw 'Outil pas encore prêt'; const m = r.merge(pk); W(box(APP), J(box(APP), []).filter(x => x.id !== pk.id)); save(); return m || 'intégré';
    }
    function bootRun() { // ?xrun={"id","op","k"} : lancé dans un cadre caché par l'assistant
        let q; try { q = JSON.parse(new URLSearchParams(location.search).get('xrun') || 'null'); } catch (e) { q = null; } if (!q || !q.id) return false; let n = 0;
        const reply = o => { try { (window.parent !== window ? window.parent : window.opener || window).postMessage(Object.assign({ xrun: q.id }, o), location.origin); } catch (e) { } };
        const go = () => { const ready = document.readyState === 'complete' && (q.op === 'eq' ? !!G() || n > 8 : (R[q.k] && (R[q.k].noP || G()))); if (!ready && n++ < 60) { setTimeout(go, 300); return; }
            if (q.op === 'eq') { setTimeout(() => { let c = 0; try { c = sendAll([q.k]); } catch (e) { } reply(c ? { ok: true, msg: 'matériel prêt : import proposé à l\'ouverture' } : { ok: false, msg: 'aucun matériel à envoyer' }); }, 1200); return; }
            try { const m = auto(q.k, q.op); setTimeout(() => reply({ ok: true, msg: String(m || '') }), 700); } catch (e) { reply({ ok: false, msg: typeof e === 'string' ? e : (e && e.message) || String(e) }); } };
        setTimeout(go, 900); return true;
    }
    function init(app) {
        APP = app; if (bootRun()) return; if (app === 'transporto') setTimeout(() => { if (typeof places !== 'function' || places.__x) return; const p0 = places; places = function () { const r = p0.apply(this, arguments); try { const rp = J('reperoXIII.project', null), dl = document.getElementById('dl-place'); if (dl) { const have = new Set([...dl.options].map(o => o.value)); ((rp && rp.spots) || []).filter(s => s.status !== 'ecarte' && (s.address || s.city)).forEach(s => { const v = (s.name || 'Lieu') + ' — ' + [s.address, s.cp, s.city].filter(Boolean).join(' '); if (!have.has(v)) dl.insertAdjacentHTML('beforeend', '<option value="' + E(v) + '">'); }); } } catch (e) { } return r; }; places.__x = 1; try { places(); } catch (e) { } }, 1500);
        const s = document.createElement('style');
        s.textContent = '#xps-ban{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:9980;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 24px);background:#2b2723;color:#f2ede6;border:1px solid #f0b378;border-radius:12px;padding:9px 12px;font:13.5px/1.35 "Segoe UI",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4)}#xps-ban button{font:600 13px "Segoe UI",sans-serif;padding:6px 12px;border-radius:8px;border:0;background:#f0b378;color:#1d1b19;cursor:pointer}#xps-ban button.sec{background:transparent;color:#f2ede6;border:1px solid #555}@media print{#xps-ban{display:none!important}}html.xembed #xps-ban{display:none!important}';
        document.head.appendChild(s);
        const go = () => setTimeout(banner, 1200); if (document.readyState === 'complete') go(); else addEventListener('load', go);
    }
    return { init, send, R, has: k => !!R[k], sendAll, eqPayload, EQT, auto };
})();

XPASS.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XLINKS : carte des passerelles entre outils (qui envoie quoi à qui)
//  Partagée par la fenêtre 🔀 Passerelles des outils et par les ponts de l'accueil.
// =====================================================================
var XLINKS = window.XLINKS || (() => {
    const T = {
        backupo: ['💽', 'BACKUPO', 'Déchargement des rushes'], cadro: ['🎯', 'CADRO', 'Optiques et cadre'], calendrier: ['🗓️', 'CALENDRIER', 'Toutes les dates'],
        callsheeto: ['📋', 'CALL SHEETO', 'Feuilles de service'], casto: ['🎭', 'CASTO', 'Casting'], catalogue: ['🗃️', 'CATALOGUE', 'Base matériel'],
        conduco: ['🎬', 'CONDUCO', 'Conducteur'], controle: ['✅', 'CONTRÔLE', 'Contrôle avant tournage'], decoup: ['✂️', 'DECOUP', 'Découpage'],
        deviso: ['💶', 'DEVISO', 'Devis et budget'], dossier: ['📚', 'DOSSIER', 'Dossier de production'], graphico: ['🎛️', 'GRAPHICO', 'Habillage et NDI'],
        importo: ['📥', 'IMPORTO', 'Import depuis les logiciels'], jour: ['🎥', 'MODE TOURNAGE', 'Le jour J'], lumo: ['💡', 'LUMO', 'Lumière'],
        matos: ['📦', 'MATOS', 'Parc matériel'], moodo: ['🎨', 'MOODO', 'Moodboard'], packingo: ['🧳', 'PACKINGO', 'Colisage'], planno: ['📅', 'PLANNO', 'Planning'],
        plano: ['📐', 'PLANO', 'Plan d\'implantation'], posto: ['🎞️', 'POSTO', 'Post-production'], repero: ['📍', 'REPERO', 'Repérages'],
        ressourco: ['📑', 'RESSOURCO', 'Contrats et droits'], runo: ['🔴', 'RUNO', 'Déroulé live'], scripto: ['📝', 'SCRIPTO', 'Script et rapports'],
        sono: ['🎚️', 'SONO', 'Son'], soustitro: ['💬', 'SOUSTITRO', 'Sous-titres'], storyboardo: ['🖼️', 'STORYBOARDO', 'Storyboard'],
        syno: ['🔀', 'SYNO', 'Synoptique'], transporto: ['🚐', 'TRANSPORTO', 'Logistique']
    };
    // [de, vers, ce qui passe]
    const L = [
        ['callsheeto', 'deviso', 'Équipe convoquée, horaires et repas de chaque journée → lignes de devis (main-d\'œuvre, défraiements).'],
        ['callsheeto', 'repero', 'Lieux des journées de tournage → fiches de repérage.'],
        ['callsheeto', 'ressourco', 'Équipe et dates → contrats à préparer et DPAE.'],
        ['casto', 'callsheeto', 'Talents confirmés → équipe des journées (convocations).'],
        ['casto', 'ressourco', 'Talents → contrats artistes et droits à l\'image.'],
        ['casto', 'deviso', 'Cachets des talents → lignes de devis.'],
        ['conduco', 'callsheeto', 'Date, horaires et équipe de l\'émission → feuille de service.'],
        ['conduco', 'deviso', 'Moyens de l\'émission → lignes de devis.'],
        ['decoup', 'callsheeto', 'Séquences par journée → plan de travail de la feuille de service.'],
        ['decoup', 'scripto', 'Plans à tourner → script, prêts pour la scripte.'],
        ['decoup', 'storyboardo', 'Une case de storyboard par plan.'],
        ['deviso', 'ressourco', 'Postes du devis → contrats et paie à préparer.'],
        ['dossier', 'deviso', 'Éléments budgétaires du dossier → devis.'],
        ['dossier', 'ressourco', 'Équipe du dossier → contrats.'],
        ['matos', 'deviso', 'Matériel réservé pour le projet → lignes de location du devis.'],
        ['matos', 'packingo', 'Matériel réservé → caisses de colisage.'],
        ['moodo', 'plano', 'Décors et références → plan d\'implantation.'],
        ['moodo', 'deviso', 'Éléments chiffrables de la planche → devis.'],
        ['moodo', 'repero', 'Adresses et contacts des lieux → repérages.'],
        ['packingo', 'deviso', 'Caisses et matériel → lignes de location du devis.'],
        ['plano', 'packingo', 'Tout le matériel placé sur le plan → liste de colisage.'],
        ['plano', 'syno', 'Équipements et longueurs de câbles → synoptique pré-câblé.'],
        ['plano', 'deviso', 'Matériel du plan → devis.'],
        ['plano', 'lumo', 'Projecteurs placés → plan de feu.'],
        ['lumo', 'plano', 'Plan de feu → projecteurs sur le plan.'],
        ['posto', 'planno', 'Étapes de post-production et livrables → planning.'],
        ['repero', 'callsheeto', 'Lieux validés (adresse, accès, hôpital, météo) → journées de tournage.'],
        ['repero', 'ressourco', 'Lieux → autorisations de tournage à obtenir.'],
        ['repero', 'jour', 'Météo et plan B → mode tournage.'],
        ['scripto', 'backupo', 'Plans tournés par carte → contrôle du déchargement.'],
        ['scripto', 'posto', 'Prises cerclées et notes → marqueurs et dérushage.'],
        ['syno', 'backupo', 'Sources d\'enregistrement → plan de déchargement.'],
        ['syno', 'deviso', 'Équipements du synoptique → devis.'],
        ['syno', 'packingo', 'Équipements et câbles → liste de colisage.'],
        ['syno', 'plano', 'Équipements → à placer sur le plan.'],
        ['syno', 'sono', 'Sources audio → patch son.'],
        ['transporto', 'callsheeto', 'Navettes et transports → feuille de service.'],
        ['soustitro', 'graphico', 'Sous-titres à l\'antenne en direct → incrustation sur un canal NDI.'],
        ['catalogue', 'syno', 'Équipements du catalogue (avec leurs ports) → nœuds du synoptique.'],
        ['catalogue', 'plano', 'Équipements du catalogue → à placer.'], ['catalogue', 'lumo', 'Projecteurs du catalogue.'], ['catalogue', 'sono', 'Micros, HF et consoles du catalogue.'],
        ['catalogue', 'packingo', 'Équipements du catalogue → caisses.'], ['catalogue', 'deviso', 'Prix de location du catalogue → devis.'], ['catalogue', 'matos', 'Modèles du catalogue → parc matériel.'],
        ['cadro', 'plano', 'Réglage caméra (capteur, focale) → champ de vision sur le plan.'], ['cadro', 'storyboardo', 'Réglage caméra → cadre des cases.'],
        ['callsheeto', 'jour', 'Feuille de service du jour → mode tournage.'], ['planno', 'calendrier', 'Tâches et jalons → calendrier global.'],
        ['casto', 'transporto', 'Talents confirmés → passagers des navettes, hébergement à prévoir.'], ['deviso', 'matos', 'Matériel du devis → réservation en option dans le parc (conflits signalés).'],
        ['matos', 'callsheeto', 'Matériel réservé pour la journée → feuille de service.'], ['repero', 'plano', 'Plan de masse / photo aérienne du lieu → fond de plan.'],
        ['conduco', 'soustitro', 'Textes du prompteur → sous-titres préparés du direct.'], ['backupo', 'posto', 'Cartes déchargées et vérifiées → prises disponibles au dérushage.'],
        ['scripto', 'callsheeto', 'Plans non tournés → reportés sur la journée suivante.'],
        ['repero', 'transporto', 'Adresses des lieux retenus → destinations des navettes (et navettes aux dates des lieux).'], ['ressourco', 'callsheeto', 'Équipe sous contrat → journées de leur contrat (téléphones, horaires).'],
        ['conduco', 'graphico', 'Intervenants (nom, fonction) → un synthé chacun.'], ['conduco', 'sono', 'Intervenants → voies du patch et émetteurs HF.'], ['syno', 'conduco', 'Caméras et magnétos du synoptique → listes du conducteur.'],
        ['backupo', 'encodo', 'Cartes déchargées → proxys ProRes automatiques.'], ['encodo', 'posto', 'Fichiers convertis → prêts au dérushage.'], ['posto', 'soustitro', 'Retours horodatés de la version → sous-titres aux bons temps.'],
        ['packingo', 'transporto', 'Poids et volume des caisses → véhicule conseillé (voiture, utilitaire 6 / 12 / 20 m³, porteur).'], ['lumo', 'syno', 'Éclairage → console DMX, réseau Art-Net / sACN et splitters dans le synoptique.'],
        ['lumo', 'deviso', 'Projecteurs du plan de feu → chiffrage de la location lumière.'], ['sono', 'deviso', 'Micros, pieds et HF → chiffrage de la location son.'],
        ['cadro', 'matos', 'Boîtier et optique choisis → « Matériel du projet » de MATOS.'], ['decoup', 'matos', 'Machinerie par séquence (steadicam, grue, drone, travelling) → « Matériel du projet ».'],
        ['repero', 'matos', 'Contraintes des lieux (pas de courant, pas de réseau, accès…) → matériel suggéré (groupe électrogène…).'], ['matos', 'calendrier', 'Sortie et retour du matériel du projet → calendrier, rappel la veille.'], ['matos', 'catalogue', 'Équipements saisis à la main → proposés à l\'ajout au catalogue.'],
        ['syno', 'matos', 'Équipements du synoptique → « Matériel du projet » (demande de prêt, location).'], ['plano', 'matos', 'Matériel du plan → « Matériel du projet » de MATOS.'], ['packingo', 'matos', 'Contenu des caisses → « Matériel du projet » de MATOS.'], ['lumo', 'matos', 'Projecteurs du plan de feu → « Matériel du projet » de MATOS.'], ['sono', 'matos', 'Micros, pieds et HF → « Matériel du projet » de MATOS.'], ['matos', 'plano', 'Matériel du projet → à placer sur le plan.'], ['matos', 'syno', 'Image, son et régie → nœuds du synoptique.'], ['matos', 'lumo', 'Lumière → liste des projecteurs.'], ['matos', 'sono', 'Son → patch.'], ['matos', 'dossier', 'Matériel du projet → rubrique technique du dossier.'],
        ['importo', 'planno', 'Planning importé (Excel, Movie Magic…).'], ['importo', 'callsheeto', 'Feuilles de service PDF importées.'], ['importo', 'deviso', 'Devis loueurs PDF importés.'], ['importo', 'casto', 'Listes de talents importées.'],
    ];
    ['callsheeto', 'casto', 'conduco', 'decoup', 'deviso', 'lumo', 'moodo', 'packingo', 'planno', 'plano', 'posto', 'repero', 'ressourco', 'runo', 'scripto', 'sono', 'soustitro', 'storyboardo', 'syno', 'transporto', 'backupo']
        .forEach(a => L.push([a, 'dossier', 'Document de l\'outil (PDF) → rubrique adaptée du dossier de production.']));
    const from = a => L.filter(x => x[0] === a), to = a => L.filter(x => x[1] === a);
    const peers = a => [...new Set(L.filter(x => x[0] === a || x[1] === a).map(x => x[0] === a ? x[1] : x[0]))];
    // saison 6 : CATALOGUE fait partie de MATOS (onglet Catalogue) et IMPORTO de la fiche projet — plus proposés comme outils à part
    (() => { const seen = new Set(); for (let i = L.length - 1; i >= 0; i--) { const x = L[i]; if (x[0] === 'catalogue') x[0] = 'matos'; if (x[1] === 'catalogue') x[1] = 'matos'; const k = x[0] + '>' + x[1]; if (x[0] === 'importo' || x[1] === 'importo' || x[0] === x[1] || seen.has(k)) L.splice(i, 1); else seen.add(k); } delete T.catalogue; delete T.importo; })();
    return { T, L, from, to, peers };
})();

// =====================================================================
//  SUITE XIII — XGATE : 📤 Vers Suite XIII (ex-Passerelles + 📚 DOSSIER) (fenêtre graphique d'envoi vers les autres outils)
//  À gauche l'outil ouvert, à droite les outils reliables ; au survol un lien se trace entre les deux
//  et la description de ce qui est transféré s'affiche en bas. Le clic lance l'envoi existant de l'outil
//  (bouton « Envoyer vers … » retrouvé dans la page, même rangé dans un menu), sinon ouvre l'outil cible.
// =====================================================================
const XGATE = (() => {
    let APP = '';
    const $ = id => document.getElementById(id), E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fn = n => typeof window[n] === 'function' ? window[n] : null;
    const thenClick = (f, sel) => () => { const F = fn(f); if (!F) return false; F(); setTimeout(() => { const b = document.querySelector(sel); if (b) b.click(); }, 120); return true; };
    const SPECIAL = {
        'soustitro>graphico': () => { const F = fn('setView'); if (F) { F('live'); return true; } },
        'callsheeto>deviso': () => { const F = fn('openSendCrewToDeviso'); if (F) { F(); return true; } },
        'plano>deviso': thenClick('openMaterialExport', '#xpk-deviso'),
        'syno>plano': thenClick('openMaterialExport', '#xl-plano'), // le bouton « 📐 Envoyer vers PLANO » est dans la fenêtre 📋 Liste du matériel (sinon : arrivée sans rien, avec un faux avertissement)
        'syno>deviso': thenClick('openMaterialExport', '#xpk-deviso')
    };
    ['syno', 'plano', 'packingo', 'lumo', 'sono', 'deviso'].forEach(a => { SPECIAL['matos>' + a] = () => { if (typeof PM === 'undefined') return false; PM.sendTo(a); return true; }; });
    SPECIAL['backupo>encodo'] = () => { const b = document.querySelector('.xbk-px button'); if (b) { b.click(); return true; } alert('Déchargez d\'abord une carte : le bouton « 🎞️ Proxies dans ENCODO » apparaît sous le bilan du roll.'); return true; };
    ['lumo', 'sono'].forEach(a => { SPECIAL[a + '>deviso'] = () => { const F = fn('openSendToDeviso'); if (F) { F(); return true; } }; });
    ['syno', 'plano', 'packingo', 'lumo', 'sono'].forEach(a => { SPECIAL[a + '>matos'] = () => { const F = fn('xiiiToMatos'); return F ? F() : false; }; });
    if (window.XPASS) Object.keys(XPASS.R).forEach(k => { SPECIAL[k] = () => XPASS.send(k); }); // passerelles saison 4 (boîte de réception)
    const can = k => SPECIAL[k] && (window.XPASS && XPASS.has(k) || k !== 'soustitro>graphico' || fn('setView')) && (!/>deviso$/.test(k) || k === 'matos>deviso' || ((k === 'lumo>deviso' || k === 'sono>deviso') && fn('openSendToDeviso')) || fn(k === 'callsheeto>deviso' ? 'openSendCrewToDeviso' : 'openMaterialExport'));
    const nameRx = a => XLINKS.T[a] ? new RegExp('\\b' + XLINKS.T[a][1].replace(/ /g, '\\s?').replace('Ô', '[OÔ]') + '\\b', 'i') : /(?!)/; // outil sans fiche XLINKS : aucun bouton à chercher
    function findBtn(to) {
        const rx = nameRx(to);
        const B = [...document.querySelectorAll('button,[role=button]')].filter(b => !b.closest('#xgt-ov,#xb-menu'));
        const txt = b => ((b.title || '') + ' ' + (b.textContent || '')).replace(/\s+/g, ' ');
        const ok = b => { const t = txt(b); return rx.test(t) && /(envoyer|vers|→|transmettre|créer les|à DOSSIER|à CALL|chiffrer)/i.test(t) && !/(depuis|ouvrir|journal|importer|reprendre|reçu)/i.test(t); }; // « 💶 Chiffrer … dans DEVISO » est aussi un envoi
        const sc = b => (to === 'dossier' && /📚/.test(b.textContent) ? 4 : 0) + (/envoyer/i.test(txt(b)) ? 1 : 0) + (rx.test(b.textContent) ? 2 : 0);
        return B.filter(ok).sort((a, b) => sc(b) - sc(a))[0] || null;
    }
    // fenêtre d'envoi à plusieurs destinations (CASTO, REPERO…) : on ne garde cochée que la destination choisie dans 📤 Vers Suite XIII
    function pickIn(to) { try {
        const nm = XLINKS.T[to] ? XLINKS.T[to][1] : to, rx = nameRx(to), all = Object.keys(XLINKS.T).filter(a => a !== to).map(a => nameRx(a));
        const inFixed = el => { for (let x = el; x && x !== document.body; x = x.parentElement) if (getComputedStyle(x).position === 'fixed') return x; return null; };
        const boxes = [...document.querySelectorAll('label')].filter(l => l.offsetParent && l.querySelector('input[type=checkbox]') && inFixed(l)), o = (boxes.find(l => rx.test(l.textContent)) && inFixed(boxes.find(l => rx.test(l.textContent)))) || [...document.querySelectorAll('body > *')].reverse().find(x => getComputedStyle(x).position === 'fixed' && x.offsetHeight > 100 && rx.test(x.textContent)); if (!o) return;
        const mine = boxes.filter(l => rx.test(l.textContent)), others = boxes.filter(l => !rx.test(l.textContent) && all.some(r => r.test(l.textContent)));
        if (mine.length) { const set = (l, v) => { const i = l.querySelector('input[type=checkbox]'); if (i.checked !== v) { i.checked = v; i.dispatchEvent(new Event('change', { bubbles: true })); i.dispatchEvent(new Event('input', { bubbles: true })); } }; mine.forEach(l => set(l, true)); others.forEach(l => set(l, false)); return; }
        const rows = [...o.querySelectorAll('[onclick],[data-to],[data-t],[data-a],[role=button],.row,div')].filter(r => r.offsetParent && r.children.length < 8 && rx.test((r.querySelector('b,strong,h4') || {}).textContent || '') && !r.querySelector('input'));
        const r = rows.sort((a, b) => a.textContent.length - b.textContent.length)[0]; if (r) r.click();
    } catch (e) { } }
    function go(to) {
        const k = APP + '>' + to; try { if (can(k) && SPECIAL[k]()) { close(); return; } } catch (e) { }
        if (to === 'dossier') { const f = ['openSendToDossier', 'openSendDossier'].map(fn).find(Boolean); if (f) { close(); f(); return; } }
        const b = findBtn(to); close();
        if (b) { b.click(); setTimeout(() => pickIn(to), 200); return; }
        if (to === 'dossier') { const d = [...document.querySelectorAll('button')].find(x => /📚/.test(x.textContent) && /DOSSIER/.test(x.textContent + x.title) && !/journal|ouvrir/i.test(x.textContent)); if (d) { d.click(); return; } }
        location.href = to + '.html#xfrom=' + APP; // l'outil d'arrivée ouvre son import depuis cet outil (ou explique ce qu'il reprend tout seul)
    }
    // ---- ⚡ tout envoyer d'un coup (matériel → MATOS + PACKINGO + DEVISO) ----
    const ALLT = () => ['matos', 'packingo', 'deviso'].filter(t => t !== APP);
    function allRow() { if (!window.XPASS || !XPASS.sendAll || !['plano', 'syno', 'packingo', 'lumo', 'sono'].includes(APP) || !XPASS.eqPayload()) return ''; const T = XLINKS.T;
        return '<button class="xgt-t xgt-all" data-all="1" data-a="' + ALLT()[0] + '" data-dir="out" data-d="Le matériel de l\'outil part en une fois vers ' + ALLT().map(t => (T[t] || ['', t])[1]).join(', ') + ' : chacun propose l\'intégration à son ouverture (visible aussi dans Démarrer › Notifs)."><span class="i">⚡</span><span><b>Tout envoyer</b><small>' + ALLT().map(t => (T[t] || ['', t.toUpperCase()])[1]).join(' + ') + '</small></span><span class="go">Envoyer →</span></button>'; }
    function doAll() { const T = ALLT(), n = XPASS.sendAll(T); close(); if (!n) { alert('Rien à envoyer (aucun matériel) ou stockage plein.'); return; }
        document.querySelectorAll('#xgt-done').forEach(x => x.remove()); const d = document.createElement('div'); d.id = 'xgt-done';
        d.innerHTML = '<span>⚡ Matériel envoyé vers ' + T.map(t => E((XLINKS.T[t] || ['', t])[1])).join(', ') + '</span>' + T.map(t => '<button data-o="' + t + '">' + E((XLINKS.T[t] || ['', t])[1]) + ' ↗</button>').join('') + '<button class="sec">OK</button>'; document.body.appendChild(d);
        d.onclick = e => { const t = e.target.dataset.o; if (t) { const u = t + '.html'; if (typeof xiiiOpenTab === 'function' && window.parent !== window) xiiiOpenTab(u, true); else window.open(u, '_blank'); e.target.remove(); } else if (e.target.classList.contains('sec')) d.remove(); }; setTimeout(() => d.remove(), 20000); }
    // ---- vers le même outil d'un autre projet XIII ----
    function wsRows(me) {
        if (!window.XWS || !XWS.copyTool || APP === 'index' || APP === 'dossier-m') return ''; const L = XWS.list().filter(w => w.id !== XWS.id); if (!L.length) return '';
        return '<div class="xgt-g">' + E(me[1]) + ' vers un autre projet XIII</div>' + L.map(w => { const n = APP === 'matos' ? pmCount(w.id) : XWS.toolKeys(APP, w.id).length;
            return '<button class="xgt-t xgt-ws" data-ws="' + E(w.id) + '" data-a="' + APP + '" data-dir="out" data-d="' + E('Copie ' + (APP === 'matos' ? 'le « Matériel du projet »' : 'toutes les données') + ' de ' + me[1] + ' dans le projet « ' + w.name + ' »' + (n ? ' — remplace ce qui s\'y trouve (annulable)' : ' (vide pour l\'instant)')) + '"><span class="i" style="display:flex;align-items:center;justify-content:center"><i style="width:14px;height:14px;border-radius:50%;background:' + E(w.color) + ';box-shadow:0 0 8px ' + E(w.color) + '"></i></span><span><b>' + E(w.name) + '</b><small>' + (n ? (APP === 'matos' ? n + ' ligne(s) déjà présente(s) : remplacées' : 'contient déjà des données ' + E(me[1]) + ' : remplacées') : 'aucune donnée ' + E(me[1]) + ' pour l\'instant') + (XWS.hasBackup(APP, w.id) ? ' · <a href="#" data-undo="' + E(w.id) + '">↶ annuler la dernière copie</a>' : '') + '</small></span><span class="go">Copier →</span></button>'; }).join('');
    }
    const fiche = i => { try { const p = JSON.parse(XWS.peek(i, 'xiii.projets')); return p && p.active ? p.active : '_'; } catch (e) { return '_'; } };
    const myFiche = () => { try { const p = JSON.parse(localStorage.getItem('xiii.projets')); return p && p.active ? p.active : '_'; } catch (e) { return '_'; } };
    function pmCount(i) { try { const pm = (typeof P !== 'undefined' && P && P.pm) || {}; return ((pm[fiche(i)] || {}).items || []).length; } catch (e) { return 0; } }
    function saveTool() { try { if (typeof dirty === 'function') dirty(); } catch (e) { } try { if (typeof saveProject === 'function') saveProject(true); else if (typeof saveAll === 'function') saveAll(true); } catch (e) { } }
    function openIn(w) { const u = APP + '.html'; if (window.parent !== window) { try { window.top.postMessage({ xtab: { open: u, openWs: w.id } }, location.origin); return; } catch (e) { } } window.open(u, 'xws:' + w.id); }
    function toastWs(m, w) { document.querySelectorAll('#xgt-done').forEach(x => x.remove()); const d = document.createElement('div'); d.id = 'xgt-done'; d.innerHTML = '<span>' + m + '</span><button>Ouvrir dans « ' + E(w.name) + ' » ↗</button><button class="sec">OK</button>'; document.body.appendChild(d); const [a, b] = d.querySelectorAll('button'); a.onclick = () => { d.remove(); openIn(w); }; b.onclick = () => d.remove(); setTimeout(() => d.remove(), 15000); }
    async function toWs(id) {
        const w = XWS.list().find(x => x.id === id); if (!w) return; const me = (XLINKS.T[APP] || ['', APP.toUpperCase()])[1];
        if (APP === 'matos') { if (typeof P === 'undefined' || !P) return; P.pm = P.pm || {}; const src = P.pm[myFiche()], dst = fiche(id);
            if (!src || !(src.items || []).length) { alert('Le « Matériel du projet » est vide dans ce projet.'); return; }
            if (dst === myFiche() && dst !== '_') { alert('Les deux projets XIII partagent la même fiche projet : rien à copier.'); return; }
            const had = ((P.pm[dst] || {}).items || []).length; if (had && !confirm('Le projet « ' + w.name + ' » a déjà ' + had + ' ligne(s) de matériel. Les remplacer ?')) return;
            if (had) P.pm['_bak_' + dst] = P.pm[dst]; P.pm[dst] = JSON.parse(JSON.stringify(src)); saveTool(); close(); toastWs('📦 ' + src.items.length + ' ligne(s) de matériel copiées dans « ' + E(w.name) + ' »', w); return; }
        const n = XWS.toolKeys(APP, id).length, k = XWS.toolKeys(APP).length; if (!k) { alert('Rien à copier : ' + me + ' est vide dans ce projet.'); return; }
        if (n && !confirm('Le projet « ' + w.name + ' » contient déjà des données ' + me + '.\nElles seront remplacées par celles de ce projet (vous pourrez annuler depuis cette fenêtre).\n\nContinuer ?')) return;
        saveTool(); close(); try { const r = await XWS.copyTool(APP, id); toastWs('📦 ' + me + ' copié dans « ' + E(w.name) + ' »' + (r.recs ? ' (' + r.recs + ' élément(s) lourds : images, fichiers)' : ''), w); } catch (e) { alert('Copie impossible : ' + e.message); }
    }
    function undoWs(id) { const w = XWS.list().find(x => x.id === id); if (APP === 'matos') { const d = fiche(id), b = P.pm['_bak_' + d]; if (b) { P.pm[d] = b; delete P.pm['_bak_' + d]; saveTool(); } } else XWS.restoreTool(APP, id); close(); try { (window.toast || alert)('↶ Copie annulée dans « ' + (w ? w.name : '') + ' »'); } catch (e) { } }
    function close() { document.querySelectorAll('#xgt-ov').forEach(o => { try { o.remove(); } catch (e) { } }); }
    function open() {
        close(); const T = XLINKS.T, me = T[APP] || ['🧩', APP.toUpperCase(), ''];
        if (APP !== 'dossier' && !XLINKS.from(APP).some(x => x[1] === 'dossier') && findBtn('dossier')) XLINKS.L.push([APP, 'dossier', 'Document de l\'outil (PDF) → rubrique adaptée du dossier de production.']);
        const outs = XLINKS.from(APP).slice().sort((a, b) => (b[1] === 'dossier') - (a[1] === 'dossier')), ins = XLINKS.to(APP).filter(x => !outs.some(y => y[1] === x[0])); if (fn('xiiiFromMatos') && !ins.some(x => x[0] === 'matos')) ins.unshift(['matos', APP, 'Matériel du projet de MATOS (lignes cochées) → importé ici.']); if (APP === 'matos') ['plano', 'syno', 'lumo', 'sono', 'packingo'].forEach(a => { if (!ins.some(x => x[0] === a)) ins.push([a, 'matos', 'Matériel de ' + ((T[a] || [])[1] || a) + ' → « Matériel du projet » (ouvre l\'outil et renvoie sa liste ici).']); });
        const row = (a, d, dir) => { const t = T[a] || ['🧩', a, '']; const b = dir === 'out' ? findBtn(a) : null;
            return '<button class="xgt-t" data-a="' + a + '" data-dir="' + dir + '" data-d="' + E(d) + '" data-b="' + (b ? 1 : 0) + '"><span class="i">' + t[0] + '</span><span><b>' + E(t[1]) + '</b><small>' + E(t[2]) + '</small></span><span class="go">' + (dir === 'out' ? (b || can(APP + '>' + a) ? 'Envoyer →' : 'Ouvrir ↗') : (a === 'matos' && fn('xiiiFromMatos')) || (APP === 'matos' && a !== 'catalogue') ? '← Importer' : '← reçoit') + '</span></button>'; };
        const o = document.createElement('div'); o.id = 'xgt-ov';
        o.innerHTML = '<div class="xgt-w" role="dialog" aria-label="Vers Suite XIII"><div class="xgt-h"><b>📤 Vers Suite XIII — depuis ' + E(me[1]) + '</b><button class="xgt-x" aria-label="Fermer">✕</button></div>' +
            '<div class="xgt-b"><svg class="xgt-s"><defs><marker id="xgt-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="xgt-mk"/></marker></defs><path class="xgt-p" d=""/></svg>' +
            '<div class="xgt-l"><div class="xgt-me"><span class="i">' + me[0] + '</span><b>' + E(me[1]) + '</b><small>' + E(me[2]) + '</small><em>' + outs.length + ' envoi(s) · ' + ins.length + ' réception(s)</em></div></div>' +
            '<div class="xgt-r">' + allRow() + wsRows(me) + (outs.length ? '<div class="xgt-g">Envoyer vers</div>' + outs.map(x => row(x[1], x[2], 'out')).join('') : '<p class="xgt-n">Cet outil n\'envoie pas directement vers un autre outil.</p>') +
            (ins.length ? '<div class="xgt-g">Reçoit aussi de</div>' + ins.map(x => row(x[0], x[2], 'in')).join('') : '') + '</div></div>' +
            '<div class="xgt-d" aria-live="polite">Survolez un outil à droite pour voir ce qui passe par la passerelle.</div></div>';
        document.body.appendChild(o);
        const w = o.querySelector('.xgt-b'), p = o.querySelector('.xgt-p'), me$ = o.querySelector('.xgt-me'), D = o.querySelector('.xgt-d');
        const link = el => {
            const W = w.getBoundingClientRect(), a = me$.getBoundingClientRect(), b = el.getBoundingClientRect(), r = w.querySelector('.xgt-r');
            const x1 = a.right - W.left, y1 = a.top + a.height / 2 - W.top + w.scrollTop * 0, x2 = b.left - W.left - 4, y2 = b.top + b.height / 2 - W.top;
            const out = el.dataset.dir === 'out', c = (x2 - x1) * .5;
            p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + (x1 + c) + ' ' + y1 + ' ' + (x2 - c) + ' ' + y2 + ' ' + x2 + ' ' + y2);
            p.setAttribute(out ? 'marker-end' : 'marker-start', 'url(#xgt-ar)'); p.removeAttribute(out ? 'marker-start' : 'marker-end');
            p.classList.toggle('in', !out);
            o.querySelectorAll('.xgt-t.h').forEach(x => x.classList.remove('h')); el.classList.add('h');
            const t = XLINKS.T[el.dataset.a] || ['', el.dataset.a];
            if (el.dataset.all) { D.innerHTML = '<b>⚡ Tout envoyer</b> · ' + E(el.dataset.d); return; }
            if (el.dataset.ws) { D.innerHTML = '<b>' + E(me[1]) + ' → ' + E(me[1]) + ' · ' + E(el.querySelector('b').textContent) + '</b> · ' + E(el.dataset.d) + '<br><small>Cliquez pour copier. Les préférences, bibliothèques et le catalogue sont déjà communs à tous les projets.</small>'; return; }
            D.innerHTML = '<b>' + (out ? E(me[1]) + ' → ' + E(t[1]) : E(t[1]) + ' → ' + E(me[1])) + '</b> · ' + E(el.dataset.d) + '<br><small>' + (out ? (el.dataset.b === '1' || can(APP + '>' + el.dataset.a) ? 'Cliquez pour lancer l\'envoi.' : 'Cliquez pour ouvrir ' + E(t[1]) + ' : la passerelle s\'y trouve (import, 🧺 panier ou Drive du projet).') : 'Passerelle à lancer depuis ' + E(t[1]) + ' (cliquez pour l\'ouvrir).') + '</small>';
        };
        o.querySelectorAll('.xgt-t').forEach(el => { el.onmouseenter = () => link(el); el.onfocus = () => link(el); el.onclick = e => el.dataset.all ? doAll() : e.target.dataset.undo ? (e.preventDefault(), undoWs(e.target.dataset.undo)) : el.dataset.ws ? toWs(el.dataset.ws) : el.dataset.dir === 'out' ? go(el.dataset.a) : (APP === 'matos' && el.dataset.a !== 'catalogue' ? (close(), location.href = el.dataset.a + '.html#xtomatos') : el.dataset.a === 'matos' && fn('xiiiFromMatos') ? (close(), fn('xiiiFromMatos')()) : (location.href = el.dataset.a + '.html')); });
        o.querySelector('.xgt-r').addEventListener('scroll', () => { const h = o.querySelector('.xgt-t.h'); if (h) link(h); });
        o.querySelector('.xgt-x').onclick = close; o.addEventListener('mousedown', e => { if (e.target === o) close(); });
        o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        const f = o.querySelector('.xgt-t'); if (f) setTimeout(() => { f.focus(); link(f); }, 30);
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xgt-css';
        s.textContent = '#xgt-done{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10070;display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 24px);padding:10px 14px;border-radius:16px;background:rgba(20,18,16,.92);backdrop-filter:blur(18px);color:#f3ede6;border:1px solid rgba(240,180,41,.5);box-shadow:0 14px 40px rgba(0,0,0,.45),0 0 26px rgba(240,180,41,.18);font:13.5px "Segoe UI",sans-serif}#xgt-done button{font:600 13px "Segoe UI",sans-serif;padding:7px 14px;border-radius:999px;border:0;background:linear-gradient(135deg,#f0b429,#ff8a3d);color:#1a1206;cursor:pointer}#xgt-done button.sec{background:transparent;color:#f3ede6;border:1px solid #666}.xgt-ws small a{color:rgb(var(--accent,240,179,120))}' + '#xgt-ov{position:fixed;inset:0;z-index:10060;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font:13px/1.4 "Segoe UI",system-ui,sans-serif}' +
            '.xgt-w{width:min(760px,96vw);max-height:90vh;display:flex;flex-direction:column;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid var(--border-color,#555);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.55);overflow:hidden}' +
            '.xgt-h{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-color,#444)}.xgt-h b{font-size:15px}.xgt-x{background:none;border:0;color:inherit;font-size:16px;cursor:pointer}' +
            '.xgt-b{position:relative;display:grid;grid-template-columns:200px 1fr;gap:90px;padding:16px;min-height:0;flex:1}.xgt-s{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}' +
            '.xgt-p{fill:none;stroke:rgb(var(--accent,240,179,120));stroke-width:3;stroke-linecap:round;stroke-dasharray:9 7;filter:drop-shadow(0 0 4px rgba(var(--accent,240,179,120),.6));animation:xgt-o .9s linear infinite}.xgt-p.in{animation-name:xgt-i}.xgt-mk{fill:rgb(var(--accent,240,179,120))}' +
            '@keyframes xgt-o{from{stroke-dashoffset:0}to{stroke-dashoffset:-32}}@keyframes xgt-i{from{stroke-dashoffset:0}to{stroke-dashoffset:32}}' +
            '.xgt-l{display:flex;align-items:center}.xgt-me{width:100%;padding:18px 14px;border-radius:12px;border:2px solid rgb(var(--accent,240,179,120));background:rgba(var(--accent,240,179,120),.12);text-align:center;display:flex;flex-direction:column;gap:4px;position:sticky;top:0}.xgt-me .i{font-size:34px}.xgt-me b{font-size:16px}.xgt-me small,.xgt-me em{color:var(--text-dim,#aaa);font-size:11.5px}' +
            '.xgt-r{display:flex;flex-direction:column;gap:6px;overflow:auto;max-height:62vh;padding-right:4px}.xgt-g{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-dim,#999);margin:6px 0 2px}.xgt-n{color:var(--text-dim,#999)}' +
            '.xgt-t{display:flex;align-items:center;gap:10px;text-align:left;font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:10px;padding:8px 10px;cursor:pointer;height:auto!important}.xgt-t .i{font-size:20px;width:26px;text-align:center}.xgt-t>span:nth-child(2){flex:1}.xgt-t small{display:block;color:var(--text-dim,#999);font-size:11.5px}.xgt-t .go{font-size:11.5px;color:var(--text-dim,#999)}' +
            '.xgt-t.h,.xgt-t:focus-visible{border-color:rgb(var(--accent,240,179,120));background:rgba(var(--accent,240,179,120),.16);outline:none}.xgt-t.h .go{color:rgb(var(--accent,240,179,120))}.xgt-t[data-dir=in]{opacity:.85}' +
            '.xgt-d{padding:12px 16px;border-top:1px solid var(--border-color,#444);background:var(--bg-panel-alt,#2a2a2e);min-height:54px}.xgt-d small{color:var(--text-dim,#999)}' +
            '@media(max-width:640px){.xgt-b{grid-template-columns:1fr;gap:12px}.xgt-s{display:none}.xgt-me{flex-direction:row;justify-content:center;align-items:center;padding:10px}.xgt-me small,.xgt-me em{display:none}}';
        document.head.appendChild(s);
    }
    function place() {
        if ($('xgt-btn')) return true;
        const z = $('xb-file') || (($('top-bar') || {}).lastElementChild); if (!z) return false;
        const b = document.createElement('button'); b.id = 'xgt-btn'; b.title = 'Vers Suite XIII : envoyer vers DOSSIER et les autres outils de la suite (ce qui passe, et où)';
        b.innerHTML = '<span class="btn-icon">📤</span><span class="btn-label">Vers Suite XIII</span>'; b.onclick = open;
        // le bouton 📚 DOSSIER de la barre est remplacé : l'envoi reste disponible dans la fenêtre (DOSSIER en tête de liste)
        const D = [...z.querySelectorAll('button')].filter(x => x.id !== 'xgt-btn' && /📚/.test(x.textContent) && !/journal|ouvrir/i.test(x.textContent + x.title));
        const d = D[D.length - 1]; if (d && d.parentNode === z) d.after(b); else z.appendChild(b);
        D.forEach(x => { x.style.display = 'none'; x.dataset.xgtHid = '1'; });
        return true;
    }
    function init(app) {
        APP = app; if (!XLINKS.T[app]) return; if (!XLINKS.peers(app).length) return; if (!$('xgt-css')) css();
        if (typeof XBOOT !== 'undefined') XBOOT.ready(() => { if ($('xb-file') || $('top-bar')) place(); }, 1850); // placé avec la barre, avant l'affichage
        let n = 0; const iv = setInterval(() => { n++; if (($('xb-file') || n > 8) && place()) clearInterval(iv); if (n > 30) clearInterval(iv); }, 600);
    }
    return { init, open, findBtn, go };
})();

XGATE.init(XIII_APP);

