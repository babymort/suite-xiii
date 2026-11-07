// SUITE XIII — module commun. Source : xiii-src/suite-digest.js
// =====================================================================
//  SUITE XIII — XDIGEST : 📰 résumé de fin de journée — ce qui a changé dans le projet
//  Chaque jour, au premier passage dans un outil, la suite note un « point de départ » (quelques compteurs par outil).
//  Le soir, le résumé compare : séquences, talents, caisses, tâches faites…, enregistrements de l'équipe (journal du Drive),
//  messages et mentions, propositions de dates, incohérences, et ce qui est prévu demain.
//  Partage : copier, envoyer dans le chat de l'équipe, e-mail ; ✨ rédaction par l'IA connectée.
// =====================================================================
var XDIGEST = window.XDIGEST || (() => {
    const APP = XIII_APP;
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const pad = n => String(n).padStart(2, '0'), iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), T0 = () => iso(new Date());
    const addD = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return iso(d); };
    const frL = s => { const x = new Date(s + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); return x.charAt(0).toUpperCase() + x.slice(1); };
    const hm = ts => new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const nm = a => (typeof XLINKS !== 'undefined' && XLINKS.T[a] ? XLINKS.T[a][1] : String(a || '').toUpperCase()), ic = a => (typeof XLINKS !== 'undefined' && XLINKS.T[a] ? XLINKS.T[a][0] : '🧰');
    const cfg = () => { const c = J('xiii.drive', null); return c && c.url ? c : null; };
    const me = () => { const c = cfg(); return (c && c.me && c.me.name) || (J('xiii.deleg.me', {}) || {}).name || 'Master'; };
    async function api(a, p) { const c = cfg(); if (!c) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: me() }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    // ---------- compteurs par outil : [clé, outil, libellé, fonction(données) → nombre] ----------
    const len = x => Array.isArray(x) ? x.length : 0, sum = (L, f) => (L || []).reduce((a, x) => a + (f(x) || 0), 0);
    const M = [
        ['decoupXIII.project', 'decoup', [['séquence(s)', P => sum(P.tabs, t => len((t.items || []).filter(i => i.type === 'header')))], ['plan(s)', P => sum(P.tabs, t => len((t.items || []).filter(i => i.type !== 'header')))]]],
        ['castoXIII.project', 'casto', [['talent(s)', P => len(P.talents)], ['confirmé(s)', P => len((P.talents || []).filter(t => t.status === 'confirme'))], ['contrat(s) signé(s)', P => len((P.talents || []).filter(t => t.contrat === 'signed'))]]],
        ['reperoXIII.project', 'repero', [['lieu(x)', P => len(P.spots)], ['retenu(s)', P => len((P.spots || []).filter(s => s.status === 'retenu'))], ['photo(s)', P => sum(P.spots, s => len(s.photos))]]],
        ['callsheetoXIII.project', 'callsheeto', [['journée(s)', P => len(P.days)], ['convocation(s)', P => sum(P.days, d => len(d.crew))]]],
        ['transportoXIII.project', 'transporto', [['personne(s)', P => len(P.people)], ['navette(s)', P => len(P.trips)], ['trajet(s)', P => len(P.travels)]]],
        ['packingoXIII.project', 'packingo', [['caisse(s)', P => len(P.cases)], ['équipement(s)', P => sum(P.cases, c => sum(c.items, i => +i.qty || 1))]]],
        ['plannoXIII.project', 'planno', [['tâche(s)', P => len(P.tasks)], ['faite(s)', P => len((P.tasks || []).filter(t => t.status === 'done'))]]],
        ['planoXIII.project', 'plano', [['élément(s) sur le plan', P => sum(P.tabs, t => len(t.items))], ['projecteur(s)', P => sum(P.tabs, t => len((t.items || []).filter(i => i.kind === 'light')))]]],
        ['synoptique_projects', 'syno', [['équipement(s)', P => sum(P, t => len(t.nodes))], ['câble(s)', P => sum(P, t => len(t.connections))]]],
        ['lumoXIII.project', 'lumo', [['projecteur(s)', P => sum(P.fx, x => +x.qty || 1)]]],
        ['sonoXIII.project', 'sono', [['voie(s)', P => len(P.ch)], ['HF fréquencé(s)', P => len((P.hf || []).filter(h => String(h.f || '').trim()))]]],
        ['conducoXIII.project', 'conduco', [['élément(s)', P => sum(P.tabs, t => len(t.items))]]],
        ['storyboardoXIII.project', 'storyboardo', [['case(s)', P => sum(P.boards || P.tabs || [], b => len(b.panels || b.items || b.frames))]]],
        ['scriptoXIII.project', 'scripto', [['prise(s)', P => sum(P.days || P.tabs || [], d => len(d.takes || d.items))]]],
        ['ressourcoXIII.project', 'ressourco', [['document(s)', P => len(P.docs)], ['ligne(s)', P => sum(P.docs, d => len(d.rows))]]],
        ['devisoXIII.project', 'deviso', [['version(s) du devis', P => len(P.versions)]]],
        ['moodoXIII.project', 'moodo', [['élément(s)', P => sum(P.boards || P.tabs || [], b => len(b.items))]]],
        ['postoXIII.project', 'posto', [['version(s)', P => len(P.versions)], ['étape(s)', P => len(P.steps)]]]
    ];
    function metrics() {
        const o = {};
        M.forEach(([k, app, L]) => { let raw = null; try { raw = localStorage.getItem(k); } catch (e) { } if (!raw) return; let P; try { P = JSON.parse(raw); } catch (e) { return; }
            const v = {}; L.forEach(([lab, f]) => { try { const n = f(P); if (typeof n === 'number' && !isNaN(n)) v[lab] = n; } catch (e) { } }); o[app] = { v, h: raw.length, u: +(P.updated || P.ts || 0) || 0 }; });
        try { const m = J('matosXIII.parc', null), s = J('xiii.projets', {}) || {}, pm = m && m.pm && m.pm[s.active || '_']; if (pm) o.matos = { v: { 'matériel du projet': len(pm.items) }, h: JSON.stringify(pm).length }; } catch (e) { }
        try { if (typeof XCHECK !== 'undefined' && XCHECK.stats) { const st = XCHECK.stats(); if (st && st.n) o.check = { v: { 'tâche(s) de checklist faite(s)': st.done || 0 }, h: st.done || 0 }; } } catch (e) { }
        return o;
    }
    // point de départ du jour (au premier passage dans la suite ce jour-là)
    function snap() { const S = J('xiii.digest.snap', {}) || {}, t = T0(); if (S.date === t) return; W('xiii.digest.snap', { date: t, at: Date.now(), m: metrics(), prev: S.date ? { date: S.date, at: S.at, m: S.m } : null }); }
    // ---------- construction du résumé ----------
    async function build() {
        const S = J('xiii.digest.snap', {}) || {}, t = T0(), base = S.date === t ? S : { date: t, at: 0, m: {} }, now = metrics(), R = { tools: [], team: {}, chat: [], ments: [], polls: [], watch: [], tomorrow: [], since: base.at };
        const apps = new Set(Object.keys(now).concat(Object.keys(base.m || {})));
        apps.forEach(a => { const A = (base.m || {})[a] || { v: {}, h: 0 }, B = now[a] || { v: {}, h: 0 }, ch = [];
            Object.keys(B.v).forEach(l => { const d = (B.v[l] || 0) - ((A.v || {})[l] || 0); if (d) ch.push((d > 0 ? '+' : '') + d + ' ' + l); });
            if (ch.length || (A.h && B.h !== A.h)) R.tools.push({ app: a, ch, mod: !ch.length, tot: Object.keys(B.v).map(l => B.v[l] + ' ' + l).join(' · ') }); });
        const midnight = new Date(t + 'T00:00').getTime();
        if (cfg()) {
            const [lg, chat, mt, dp] = await Promise.all([api('log'), api('chat_list', { since: midnight }), api('ment_list'), api('dispo_list')]);
            if (lg.ok) (lg.log || []).filter(x => x.ts >= midnight && !/^(projet_cfg|kiosk_cfg|dossier_pub|auto)$/.test(x.app)).forEach(x => { const k = x.app; (R.team[x.by || '—'] = R.team[x.by || '—'] || {})[k] = ((R.team[x.by || '—'] || {})[k] || 0) + 1;
                const T = R.tools.find(z => z.app === k) || (R.tools.push({ app: k, ch: [], mod: true, tot: '' }), R.tools[R.tools.length - 1]); T.sums = T.sums || []; const s = String(x.sum || '').trim(); if (s && T.sums.indexOf(s) < 0 && T.sums.length < 4) T.sums.push(s); T.by = [...new Set((T.by || []).concat(x.by || []))]; });
            else R.driveErr = lg.err;
            if (chat.ok) R.chat = (chat.msgs || []).filter(m => m.ts >= midnight);
            if (mt.ok) R.ments = (mt.ments || []).filter(m => m.ts >= midnight);
            if (dp.ok) R.polls = (dp.polls || []).filter(p => p.status !== 'closed' || (p.chosen && p.chosen >= t));
        }
        try { if (typeof XCOH !== 'undefined') { const I = XCOH.run().filter(x => x.lvl === 'err'); if (I.length) R.watch.push(...I.slice(0, 5).map(x => '⛔ ' + nm(x.app) + ' : ' + x.t)); } } catch (e) { }
        try { if (typeof XCHECK !== 'undefined' && XCHECK.items) { const L = (XCHECK.items().list || []).filter(x => !x.done && !x.na && x.due && x.due <= addD(t, 1)); L.slice(0, 5).forEach(x => R.watch.push((x.due < t ? '⏰ En retard : ' : '📌 Échéance ' + (x.due === t ? 'aujourd’hui' : 'demain') + ' : ') + x.t)); } } catch (e) { }
        try { if (typeof XCALEV !== 'undefined') { const tm = addD(t, 1); R.tomorrow = XCALEV.events().filter(e => e.d0 <= tm && e.d1 >= tm && e.src !== 'dispo').slice(0, 10).map(e => (e.time ? e.time + ' · ' : '') + e.title); } } catch (e) { }
        R.tools.sort((a, b) => (b.ch.length - a.ch.length) || (b.sums ? b.sums.length : 0) - (a.sums ? a.sums.length : 0)); return R;
    }
    function toText(R, f) {
        const L = ['📰 ' + (f.title || 'Projet') + ' — résumé du ' + frL(T0()).toLowerCase(), ''];
        if (R.tools.length) { L.push('CE QUI A CHANGÉ'); R.tools.forEach(x => L.push('• ' + nm(x.app) + ' : ' + (x.ch.length ? x.ch.join(', ') : 'modifié') + (x.sums ? ' (' + x.sums.join(' ; ') + ')' : '') + (x.by && x.by.length ? ' — ' + x.by.join(', ') : ''))); L.push(''); }
        else L.push('Aucun changement dans les outils aujourd’hui.', '');
        const tm = Object.keys(R.team); if (tm.length) { L.push('ÉQUIPE'); tm.forEach(n => L.push('• ' + n + ' : ' + Object.keys(R.team[n]).map(nm).join(', '))); L.push(''); }
        if (R.chat.length) L.push('💬 ' + R.chat.length + ' message(s) dans le chat', '');
        if (R.polls.length) { L.push('DATES'); R.polls.forEach(p => L.push('• ' + p.title + ' : ' + (p.status === 'closed' ? 'retenu le ' + p.chosen : Object.keys(p.votes || {}).length + ' réponse(s)'))); L.push(''); }
        if (R.watch.length) { L.push('À SURVEILLER'); R.watch.forEach(w => L.push('• ' + w)); L.push(''); }
        if (R.tomorrow.length) { L.push('DEMAIN'); R.tomorrow.forEach(w => L.push('• ' + w)); }
        return L.join('\n').trim();
    }
    // ---------- interface ----------
    async function open() {
        css(); const old = document.getElementById('xdig'); if (old) old.remove(); const f = (() => { const s = J('xiii.projets', {}) || {}; return (s.list || []).find(x => x && x.id === s.active) || {}; })();
        document.body.insertAdjacentHTML('beforeend', '<div id="xdig" role="dialog" aria-modal="true" aria-label="Résumé du jour"><div class="xdg-b"><div class="xdg-h"><b>📰 Résumé du jour</b><span>' + esc(frL(T0())) + '</span><button class="xdg-x" aria-label="Fermer">✕</button></div><div class="xdg-c"><p class="xdg-n">⏳ Je rassemble ce qui a bougé…</p></div></div></div>');
        const o = document.getElementById('xdig'), close = () => o.remove(); o.querySelector('.xdg-x').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); }); o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        const R = await build(); if (!document.getElementById('xdig')) return; const c = o.querySelector('.xdg-c'), txt = toText(R, f), M2 = !cfg() || !!cfg().code, ai = typeof XAI !== 'undefined' && XAI.configured && XAI.configured();
        const sec = (t, body) => body ? '<section><h4>' + t + '</h4>' + body + '</section>' : '';
        c.innerHTML = '<p class="xdg-n">' + (R.since ? 'Depuis ' + hm(R.since) + ' (premier passage dans la suite aujourd’hui)' : 'Point de départ pris maintenant : les compteurs se compareront à partir de ce moment') + (cfg() ? ' · journal du Drive de toute l’équipe' + (R.driveErr ? ' (⚠️ ' + esc(R.driveErr) + ')' : '') : ' · Drive non relié : seulement cet appareil') + '.</p>' +
            sec('🔧 Ce qui a changé', R.tools.length ? R.tools.map(x => '<div class="xdg-r"><a href="' + (x.app === 'check' ? '#' : x.app === 'planno' ? 'calendrier.html' : x.app === 'matos' ? 'matos.html?v=proj' : x.app + '.html') + '" data-a="' + x.app + '">' + (x.app === 'check' ? '✅ Checklist' : ic(x.app) + ' ' + esc(nm(x.app))) + '</a><div><b>' + esc(x.ch.length ? x.ch.join(', ') : 'modifié') + '</b>' + (x.sums ? '<small>' + esc(x.sums.join(' · ')) + '</small>' : '') + (x.by && x.by.length ? '<small>par ' + esc(x.by.join(', ')) + '</small>' : '') + (x.tot ? '<small class="t">' + esc(x.tot) + '</small>' : '') + '</div></div>').join('') : '<p class="xdg-n">Aucun changement dans les outils aujourd’hui.</p>') +
            sec('👥 Qui a travaillé', Object.keys(R.team).map(n => '<div class="xdg-l">👤 <b>' + esc(n) + '</b> — ' + Object.keys(R.team[n]).map(a => esc(nm(a)) + (R.team[n][a] > 1 ? ' ×' + R.team[n][a] : '')).join(', ') + '</div>').join('')) +
            sec('💬 Échanges', (R.chat.length ? '<div class="xdg-l">' + R.chat.length + ' message(s) dans le chat — ' + esc([...new Set(R.chat.map(m => m.nom))].join(', ')) + '</div>' : '') + (R.ments.length ? '<div class="xdg-l">📣 ' + R.ments.length + ' mention(s) pour vous</div>' : '')) +
            sec('🗳️ Dates', R.polls.map(p => '<div class="xdg-l">' + (p.status === 'closed' ? '📅 ' : '🗳️ ') + esc(p.title) + ' — ' + (p.status === 'closed' ? 'retenu : ' + esc(p.chosen) : Object.keys(p.votes || {}).length + ' réponse(s)') + '</div>').join('')) +
            sec('⚠️ À surveiller', R.watch.map(w => '<div class="xdg-l">' + esc(w) + '</div>').join('')) +
            sec('📅 Demain', R.tomorrow.map(w => '<div class="xdg-l">' + esc(w) + '</div>').join('')) +
            '<div class="xdg-ai" hidden></div><div class="xdg-a"><button data-cp>📋 Copier</button>' + (cfg() && typeof XMENT !== 'undefined' ? '<button data-chat>💬 Envoyer dans le chat</button>' : '') + '<button data-mail>✉️ E-mail</button>' + (ai ? '<button data-ai class="p">✨ Rédiger avec l’IA</button>' : '') + '</div>';
        let out = txt; const say = m => { try { (window.toast || (() => { }))(m); } catch (e) { } };
        c.querySelector('[data-cp]').onclick = async () => { try { await navigator.clipboard.writeText(out); say('📋 Résumé copié'); } catch (e) { say('Copie impossible'); } };
        const ch = c.querySelector('[data-chat]'); if (ch) ch.onclick = async () => { ch.disabled = true; const r = await XMENT.chatSend(out.slice(0, 1900), null); ch.disabled = false; say(r.ok ? '💬 Résumé envoyé dans le chat' : '⚠️ ' + r.err); };
        c.querySelector('[data-mail]').onclick = () => { location.href = 'mailto:?subject=' + encodeURIComponent('📰 ' + (f.title || 'Projet') + ' — résumé du ' + frL(T0()).toLowerCase()) + '&body=' + encodeURIComponent(out.slice(0, 1800)); };
        const ab = c.querySelector('[data-ai]'); if (ab) ab.onclick = async () => { ab.disabled = true; ab.textContent = '⏳ Rédaction…'; const box = c.querySelector('.xdg-ai');
            try { const r = await XAI.ask('Tu es directeur de production. Rédige en français le résumé de fin de journée du projet audiovisuel « ' + (f.title || '') + ' » pour l’équipe, à partir de ces faits (n’invente rien, 120 mots maximum, ton clair et chaleureux, termine par les points d’attention et ce qui est prévu demain) :\n\n' + txt, { maxTokens: 900 }); out = String(r || '').trim(); box.hidden = false; box.innerHTML = '<h4>✨ Version rédigée</h4><p>' + esc(out).replace(/\n/g, '<br>') + '</p>'; ab.textContent = '✨ Rédigé'; }
            catch (e) { ab.disabled = false; ab.textContent = '✨ Rédiger avec l’IA'; say('⚠️ IA : ' + (e.message || e)); } };
        c.querySelectorAll('a[data-a="check"]').forEach(a => a.onclick = e => { e.preventDefault(); close(); try { XCHECK.open(); } catch (x) { } });
        if (!M2 && ch) ch.title = 'Envoie le résumé dans le chat de toute l’équipe';
    }
    // le soir, une seule fois : proposer le résumé
    function evening() { if (APP !== 'index') return; const h = new Date().getHours(), t = T0(); if (h < 18 || J('xiii.digest.shown', '') === t) return; W('xiii.digest.shown', t);
        const S = J('xiii.digest.snap', {}) || {}, ch = (() => { const n = metrics(), b = (S.date === t && S.m) || {}; return Object.keys(n).some(a => !b[a] || b[a].h !== n[a].h); })(); if (!ch && !cfg()) return;
        css(); document.body.insertAdjacentHTML('beforeend', '<div id="xdg-t"><span>📰 Le résumé de la journée est prêt</span><button data-o>Voir</button><button data-x aria-label="Fermer">✕</button></div>'); const b = document.getElementById('xdg-t');
        b.querySelector('[data-o]').onclick = () => { b.remove(); open(); }; b.querySelector('[data-x]').onclick = () => b.remove(); setTimeout(() => b && b.remove(), 30000); }
    function css() {
        if (document.getElementById('xdg-css')) return; const s = document.createElement('style'); s.id = 'xdg-css';
        s.textContent = '#xdig{position:fixed;inset:0;z-index:9991;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;font:14px system-ui,sans-serif}.xdg-b{background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;width:min(720px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 14px 50px rgba(0,0,0,.5)}.xdg-h{display:flex;align-items:baseline;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-soft,#3a3633)}.xdg-h b{font-size:16px}.xdg-h span{font-size:12.5px;color:var(--text-dim,#aaa)}.xdg-x{margin-left:auto;background:none;border:0;color:inherit;font-size:17px;cursor:pointer;padding:4px 8px}.xdg-c{overflow:auto;padding:12px 14px 14px;display:flex;flex-direction:column;gap:12px}' +
            '.xdg-n{margin:0;font-size:12.5px;color:var(--text-dim,#aaa)}.xdg-c section h4,.xdg-ai h4{margin:0 0 6px;font-size:13.5px}.xdg-r{display:flex;gap:10px;align-items:flex-start;padding:7px 9px;border-radius:9px;background:rgba(255,255,255,.04);margin-bottom:5px}.xdg-r a{flex:none;width:130px;font-weight:600;font-size:13px;color:#F0B378;text-decoration:none}.xdg-r div{flex:1;min-width:0}.xdg-r b{font-size:13px;display:block}.xdg-r small{display:block;font-size:11.5px;color:var(--text-dim,#aaa);margin-top:2px;overflow-wrap:anywhere}.xdg-r small.t{opacity:.75}.xdg-l{font-size:13px;padding:3px 0}' +
            '.xdg-ai{padding:10px 12px;border-left:3px solid #F0B378;background:rgba(240,179,120,.06);border-radius:0 9px 9px 0}.xdg-ai p{margin:0;font-size:13.5px;line-height:1.5}.xdg-a{display:flex;gap:8px;flex-wrap:wrap}.xdg-a button{padding:8px 13px;border-radius:9px;border:1px solid var(--border-color,#45454b);background:transparent;color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}.xdg-a button.p{background:#F0B378;color:#1a1a1a;border-color:#F0B378}.xdg-a button:disabled{opacity:.55}' +
            '#xdg-t{position:fixed;right:18px;bottom:18px;z-index:9990;display:flex;gap:8px;align-items:center;padding:10px 12px 10px 14px;border-radius:12px;background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.6);box-shadow:0 10px 30px rgba(0,0,0,.45);font:13.5px system-ui,sans-serif}#xdg-t button{padding:6px 11px;border-radius:8px;border:0;background:#F0B378;color:#1a1a1a;font-weight:700;cursor:pointer}#xdg-t button[data-x]{background:none;color:inherit;font-weight:400;padding:4px 6px}';
        document.head.appendChild(s);
    }
    if (!/[?&](xrun|xmodel|xvit)=/.test(location.search)) setTimeout(() => { try { snap(); evening(); } catch (e) { } }, 4000);
    return { open, build, metrics, toText, snap };
})();
