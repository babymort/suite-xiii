// =====================================================================
//  SUITE XIII — XDVER : 🕰️ versions datées du Drive (☁️ Drive du projet › Versions datées)
//  Le script Drive (v22) garde une copie de chaque outil avant modification (au plus toutes les 20 min,
//  40 récentes puis une par jour sur 60 jours) dans le dossier « SUITE XIII — versions » du Drive du Master.
//  Ici : liste des versions, point de restauration à la demande, restauration (l'état actuel est gardé dans 🕘 Historique).
// =====================================================================
var XDVER = window.XDVER || (() => {
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const cfg = () => { const c = J('xiii.drive', null); return c && c.url ? c : null; };
    const me = () => { try { return XDRIVE.me(); } catch (e) { return 'Master'; } };
    async function api(a, p) { const c = cfg(); if (!c) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: me() }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    const fmt = ts => new Date(ts).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const kb = n => n > 1e6 ? (n / 1e6).toFixed(1) + ' Mo' : Math.max(1, Math.round(n / 1e3)) + ' Ko';
    const ERR = { action: 'Mettez à jour le script Drive (version 22, page Drive) pour les versions datées.', droit: 'Réservé aux personnes qui peuvent modifier cet outil.', forbidden: 'Cet outil ne vous est pas ouvert.', off: 'Drive non relié.', net: 'Drive injoignable.' };
    function open(app) {
        css(); const old = document.getElementById('xdv'); if (old) old.remove(); const nm = typeof XLINKS !== 'undefined' && XLINKS.T[app] ? XLINKS.T[app][1] : app.toUpperCase();
        document.body.insertAdjacentHTML('beforeend', '<div id="xdv" role="dialog" aria-modal="true" aria-label="Versions datées"><div class="xdv-b"><div class="xdv-h"><b>🕰️ Versions datées — ' + esc(nm) + '</b><button class="xdv-x" aria-label="Fermer">✕</button></div><div class="xdv-c"><p class="xdv-n">⏳ Lecture du Drive…</p></div></div></div>');
        const o = document.getElementById('xdv'), close = () => o.remove(); o.querySelector('.xdv-x').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); }); o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        draw(app);
    }
    async function draw(app) {
        const c = document.querySelector('#xdv .xdv-c'); if (!c) return; const r = await api('ver_list', { app }); if (!document.getElementById('xdv')) return;
        if (!r.ok) { c.innerHTML = '<p class="xdv-n">⚠️ ' + esc(ERR[r.err] || r.err) + '</p>'; return; }
        const L = (r.list || []).map(x => { let d = {}; try { d = JSON.parse(x.desc || '{}'); } catch (e) { } return Object.assign({}, x, d, { ts: d.ts || x.ts }); });
        c.innerHTML = '<p class="xdv-n">Le Drive garde une copie de l’outil avant chaque série de modifications (au plus toutes les 20 min) : 40 versions récentes, puis une par jour pendant 60 jours, dans le dossier « SUITE XIII — versions » du Drive du Master. Restaurer remplace l’outil pour toute l’équipe ; l’état actuel reste récupérable dans 🕘 Historique.</p>' +
            '<div class="xdv-a"><input id="xdv-lab" placeholder="Nom du point (ex. Version envoyée au client)" maxlength="60"><button id="xdv-now">📌 Créer un point de restauration</button></div>' +
            (L.length ? '<div class="xdv-l">' + L.map(x => '<div class="xdv-i"><div><b>' + esc(fmt(x.ts)) + '</b>' + (x.label ? ' <span class="pt">📌 ' + esc(x.label) + '</span>' : x.point ? ' <span class="pt">📌 point</span>' : '') + '<small>n° ' + esc(x.rev) + ' · ' + esc(x.by || '—') + ' · ' + kb(x.size) + '</small></div><button data-r="' + esc(x.id) + '" data-t="' + esc(fmt(x.ts)) + '">↺ Restaurer</button></div>').join('') + '</div>' : '<p class="xdv-n">Pas encore de version : la première sera créée à la prochaine modification de l’outil (ou créez un point maintenant).</p>');
        c.querySelector('#xdv-now').onclick = async e => { const b = e.target; b.disabled = true; b.textContent = '⏳…'; const r2 = await api('ver_now', { app, label: c.querySelector('#xdv-lab').value.trim() }); b.disabled = false; b.textContent = '📌 Créer un point de restauration'; if (!r2.ok) { say('⚠️ ' + (ERR[r2.err] || r2.err)); return; } say('📌 Point de restauration créé'); draw(app); };
        c.querySelectorAll('[data-r]').forEach(b => b.onclick = async () => {
            if (!confirm('Restaurer ' + app.toUpperCase() + ' dans son état du ' + b.dataset.t + ' ?\n\nL’outil sera remplacé pour toute l’équipe. L’état actuel reste récupérable dans 🕘 Historique (et dans ces versions).')) return;
            b.disabled = true; b.textContent = '⏳…'; const g = await api('ver_get', { app, id: b.dataset.r }); if (!g.ok || !g.v || !g.v.data) { b.disabled = false; b.textContent = '↺ Restaurer'; say('⚠️ ' + (ERR[g.err] || g.err || 'version illisible')); return; }
            let data = g.v.data; try { if (typeof XFILES !== 'undefined' && JSON.stringify(data).indexOf('xiiif:') > -1) data = await XFILES.unpack(data); } catch (e) { }
            try { if (typeof XHIST !== 'undefined' && XHIST.add) await XHIST.add('Avant restauration de la version Drive du ' + b.dataset.t, 'drive', false); } catch (e) { }
            document.getElementById('xdv').remove();
            if (typeof XDELEG !== 'undefined' && XDELEG.put) XDELEG.put(data, { m: '🕰️ Version du Drive du ' + b.dataset.t + ' restaurée — elle part au Drive pour toute l’équipe' });
            else { Object.keys(data).forEach(k => { try { localStorage.setItem(k, data[k]); } catch (e) { } }); location.reload(); }
        });
    }
    const say = m => { try { (window.toast || window.showToast || (() => { }))(m); } catch (e) { } };
    function css() {
        if (document.getElementById('xdv-css')) return; const s = document.createElement('style'); s.id = 'xdv-css';
        s.textContent = '#xdv{position:fixed;inset:0;z-index:10220;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;font:13.5px/1.45 system-ui,sans-serif}.xdv-b{background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid #4fa3e0;border-radius:12px;width:min(600px,100%);max-height:88vh;display:flex;flex-direction:column;box-shadow:0 18px 50px rgba(0,0,0,.6)}.xdv-h{display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-color,#3a3a40)}.xdv-h b{font-size:15px}.xdv-x{margin-left:auto;background:none;border:0;color:inherit;font-size:17px;cursor:pointer}.xdv-c{overflow:auto;padding:12px 16px;display:flex;flex-direction:column;gap:10px}' +
            '.xdv-n{margin:0;font-size:12.5px;color:var(--text-dim,#aaa)}.xdv-a{display:flex;gap:6px;flex-wrap:wrap}.xdv-a input{flex:1;min-width:180px;font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:7px;padding:6px 9px}.xdv-c button{font:inherit;font-size:12.5px;padding:6px 11px;border-radius:8px;border:1px solid var(--border-color,#45454b);background:var(--bg-panel-alt,#2c2c31);color:inherit;cursor:pointer}' +
            '.xdv-l{display:flex;flex-direction:column;gap:5px}.xdv-i{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.04)}.xdv-i div{flex:1;min-width:0}.xdv-i small{display:block;font-size:11.5px;color:var(--text-dim,#aaa)}.xdv-i .pt{font-size:11.5px;padding:1px 7px;border-radius:9px;background:rgba(79,163,224,.2)}';
        document.head.appendChild(s);
    }
    return { open };
})();
