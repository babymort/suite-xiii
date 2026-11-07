// SUITE XIII — module commun. Source : xiii-src/callsheeto-prefill.js
// =====================================================================
//  CALL SHEETO XIII — 🤖 Feuille de service préremplie par l'IA
//  À partir de la journée affichée (date, lieux, météo, postes de l'équipe), de la fiche projet et du plan de travail
//  de DECOUP (séquences prévues ce jour-là), l'IA propose : horaires, déroulé, risques et consignes de sécurité,
//  infos pratiques et accès, mot de la production. Tout est à cocher avant d'entrer dans la feuille ; rien n'est effacé.
// =====================================================================
var XCSAI = window.XCSAI || (() => {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const say = m => { try { toast(m); } catch (e) { } };
    const hm = v => { const m = /^(\d{1,2})\s*[:h]\s*(\d{2})$/.exec(String(v || '').trim()); return m && +m[1] < 24 && +m[2] < 60 ? String(+m[1]).padStart(2, '0') + ':' + m[2] : ''; };
    const fr = d => d ? String(d).split('-').reverse().join('/') : '';
    function fiche() { const s = J('xiii.projets', {}) || {}; const p = (s.list || []).find(x => x && x.id === s.active); if (!p) return '';
        return [['title', 'Titre'], ['genre', 'Genre'], ['production', 'Production'], ['diffusion', 'Diffusion'], ['duree', 'Durée']].filter(k => p[k[0]]).map(k => k[1] + ' : ' + p[k[0]]).join(' · ') + (p.debut ? ' · tournage ' + fr(p.debut) + (p.fin && p.fin !== p.debut ? ' → ' + fr(p.fin) : '') : ''); }
    // séquences prévues ce jour-là dans le plan de travail de DECOUP (même navigateur)
    function decoupDay(date) {
        const p = J('decoupXIII.project', null), B = p && p.breakdown; if (!B || !Array.isArray(B.scenes) || !B.scenes.length) return { seqs: [], src: '' };
        const by = {}; B.scenes.forEach(s => by[s.id] = s); let ids = null;
        if (B.plan && Array.isArray(B.plan.days)) { const d = B.plan.days.find(x => x.date === date); if (d) ids = d.ids; }
        const L = (ids ? ids.map(i => by[i]).filter(Boolean) : []).map(s => ({ num: s.num, ie: s.ie, decor: s.decor, effet: s.effet, pages: s.eighths ? Math.round(s.eighths) + '/8' : '', roles: (s.chars || []).join(', '), el: Object.keys(s.el || {}).map(k => k + ': ' + s.el[k].join(', ')).join(' ; ') }));
        return { seqs: L, src: ids ? 'plan de travail DECOUP' : '' };
    }
    function context(d) {
        const W = d.weather && d.weather.daily, roles = {}; (d.crew || []).forEach(c => { const r = c.role || c.dept; if (r) roles[r] = (roles[r] || 0) + 1; });
        const dc = decoupDay(d.date);
        return { dc, txt: 'Projet : ' + (fiche() || 'fiche projet vide') + '\n'
            + 'Journée : ' + (d.name || '') + (d.title ? ' « ' + d.title + ' »' : '') + ' · ' + fr(d.date) + (d.dayNum ? ' · jour ' + d.dayNum + (d.dayTotal ? '/' + d.dayTotal : '') : '') + '\n'
            + 'Horaires actuels : convocation ' + d.times.general + ', PAT ' + d.times.pat + ', repas ' + d.times.lunch + ', fin ' + d.times.wrap + '\n'
            + 'Lieux : ' + ((d.locations || []).map(l => (l.type || '') + ' « ' + (l.name || '?') + ' »' + (l.access ? ' (accès : ' + l.access + ')' : '')).join(' ; ') || 'aucun') + '\n'
            + (W ? 'Météo prévue : ' + JSON.stringify(W).slice(0, 400) + '\n' : 'Météo : non chargée\n')
            + 'Équipe (postes, sans noms) : ' + (Object.keys(roles).map(r => (roles[r] > 1 ? roles[r] + ' × ' : '') + r).join(', ') || 'non renseignée') + '\n'
            + 'Déroulé déjà saisi : ' + ((d.schedule || []).map(x => (x.time || '') + ' ' + (x.ev ? x.desc : 'Séq. ' + x.seq + ' ' + x.ie + ' ' + x.desc)).join(' ; ') || 'vide') + '\n'
            + (dc.seqs.length ? 'Séquences prévues ce jour (' + dc.src + ') :\n' + dc.seqs.map(s => '- Séq. ' + s.num + ' ' + [s.ie, s.decor, s.effet, s.pages].filter(Boolean).join(' · ') + (s.roles ? ' · rôles : ' + s.roles : '') + (s.el ? ' · ' + s.el : '')).join('\n') + '\n' : 'Séquences : pas de plan de travail DECOUP pour cette date.\n')
            + 'Risques déjà cochés : ' + ((d.safety.risks || []).join(', ') || 'aucun') + '\n'
            + 'Infos pratiques actuelles : ' + (d.practical || 'vides') + '\n' };
    }
    function prompt(c) {
        return 'Tu es régisseur général et premier assistant réalisateur. Prépare la FEUILLE DE SERVICE de cette journée de tournage d’après les éléments ci-dessous. Sois réaliste : temps d’installation (1 h à 1 h 30 avant le PAT pour un décor nouveau), repas au plus tard 6 h après la convocation, repos de 11 h entre deux journées, déplacements entre décors, lumière du jour pour les extérieurs, nuits à part. N’invente aucun nom, téléphone ni adresse.\n\n'
            + c.txt + '\nRisques possibles (id = intitulé) : ' + RISKS.map(r => r[0] + ' = ' + r[1]).join(' ; ') + '\n\n'
            + 'Réponds UNIQUEMENT par un JSON : {"horaires":{"general":"HH:MM","pat":"HH:MM","repas":"HH:MM","fin":"HH:MM"},'
            + '"deroule":[{"heure":"HH:MM","type":"seq|event","seq":"n°","ie":"INT|EXT|INT/EXT","desc":"…","roles":"…","pages":"…"}],'
            + '"risques":["id"],"securite":"consignes propres à la journée (2 à 4 phrases)","pratique":"accès, parking, cantine, tenue, loges… (3 à 6 lignes)","mot":"mot d’accueil de la production (2 phrases)","acces":[{"lieu":"nom exact du lieu","texte":"…"}],"alertes":["incohérence ou point à vérifier"]}';
    }
    function normalize(j, d) {
        const H = j.horaires || {}, T = { general: hm(H.general), pat: hm(H.pat), lunch: hm(H.repas || H.lunch), wrap: hm(H.fin || H.wrap) }, ids = RISKS.map(r => r[0]);
        return { times: Object.keys(T).filter(k => T[k] && T[k] !== d.times[k]).map(k => ({ k, v: T[k], on: true })),
            sched: (j.deroule || []).slice(0, 30).map(x => ({ x, on: true })),
            risks: [...new Set((j.risques || []).filter(r => ids.includes(r) && !d.safety.risks.includes(r)))].map(r => ({ r, on: true })),
            txt: [['securite', String(j.securite || '').trim()], ['pratique', String(j.pratique || '').trim()], ['mot', String(j.mot || '').trim()]].filter(t => t[1]).map(t => ({ k: t[0], v: t[1].slice(0, 1500), on: true })),
            acces: (j.acces || []).map(a => ({ l: (d.locations || []).find(l => l.name && String(l.name).toLowerCase() === String(a.lieu || '').toLowerCase()), v: String(a.texte || '').slice(0, 400) })).filter(a => a.l && a.v && !a.l.access).map(a => Object.assign(a, { on: true })),
            alerts: (j.alertes || []).slice(0, 6).map(String) };
    }
    function apply(d, S) {
        let n = 0; const add = (a, b) => a ? a + '\n\n' + b : b;
        S.times.filter(t => t.on).forEach(t => { d.times[t.k] = t.v; n++; });
        S.sched.filter(t => t.on).forEach(({ x }) => { const t = hm(x.heure); if (x.type === 'event') d.schedule.push({ id: uid(), ev: true, time: t, desc: String(x.desc || 'PAUSE').toUpperCase().slice(0, 60) });
            else d.schedule.push({ id: uid(), ev: false, time: t, seq: String(x.seq || '').slice(0, 20), ie: /int\s*\/\s*ext/i.test(x.ie) ? 'INT/EXT' : /ext/i.test(x.ie) ? 'EXT' : /int/i.test(x.ie) ? 'INT' : '', loc: (typeof wxLoc === 'function' && wxLoc(d) || {}).id || '', desc: String(x.desc || '').slice(0, 300), roles: String(x.roles || '').slice(0, 200), pages: String(x.pages || '').slice(0, 12) }); n++; });
        S.risks.filter(t => t.on).forEach(t => { d.safety.risks.push(t.r); n++; });
        S.txt.filter(t => t.on).forEach(t => { if (t.k === 'securite') d.safety.notes = add(d.safety.notes, t.v); else if (t.k === 'pratique') d.practical = add(d.practical, t.v); else d.notes = add(d.notes, t.v); n++; });
        S.acces.filter(t => t.on).forEach(t => { t.l.access = t.v; n++; });
        try { sortSched(); } catch (e) { } try { renderContent(); } catch (e) { try { renderAll(); } catch (x) { } } try { touch(); } catch (e) { }
        return n;
    }
    // ---------- interface ----------
    function css() {
        if (document.getElementById('xcsai-css')) return; const s = document.createElement('style'); s.id = 'xcsai-css';
        s.textContent = '#xcsai{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif}#xcsai .b{background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);border-radius:12px;width:min(920px,96vw);max-height:90vh;display:flex;flex-direction:column}#xcsai .h,#xcsai .f{display:flex;gap:8px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-color,#444)}#xcsai .f{border:0;border-top:1px solid var(--border-color,#444);justify-content:flex-end;flex-wrap:wrap}#xcsai .h b{flex:1;font-size:15px}#xcsai .c{padding:12px 16px;overflow:auto}#xcsai .s{font-weight:700;margin:12px 0 4px}#xcsai label{display:flex;gap:8px;align-items:flex-start;padding:3px 0;cursor:pointer;white-space:pre-wrap}#xcsai .d{opacity:.7}#xcsai .w{color:#ffb74d}#xcsai .go{background:rgb(var(--accent,240,179,120));color:#111;border:0;border-radius:6px;padding:7px 14px;font-weight:700}';
        document.head.appendChild(s);
    }
    const close = () => { const o = document.getElementById('xcsai'); if (o) o.remove(); };
    let busy = null;
    async function open() {
        css(); close(); const d = D(), c = context(d);
        const o = document.createElement('div'); o.id = 'xcsai'; document.body.appendChild(o);
        o.innerHTML = '<div class="b"><div class="h"><b>🤖 Préremplir la feuille de service — ' + esc(d.name || '') + ' · ' + esc(fr(d.date)) + '</b><button data-x>✕</button></div><div class="c" id="xcsai-c"></div><div class="f" id="xcsai-f"></div></div>';
        o.querySelector('[data-x]').onclick = () => { if (busy) busy.abort(); close(); }; o.addEventListener('mousedown', e => { if (e.target === o) { if (busy) busy.abort(); close(); } });
        const C = o.querySelector('#xcsai-c'), F = o.querySelector('#xcsai-f');
        const ready = typeof XAI !== 'undefined' && XAI.configured && XAI.configured();
        C.innerHTML = '<p>L’IA propose les horaires, le déroulé, les risques et consignes de sécurité, les infos pratiques et les accès de cette journée, d’après :</p><ul><li>la fiche projet, la date, les lieux, la météo' + (d.weather ? '' : ' <span class="w">(non chargée)</span>') + ' et les postes de l’équipe (jamais les noms ni les téléphones)</li><li>' + (c.dc.seqs.length ? '<b>' + c.dc.seqs.length + ' séquence(s)</b> prévue(s) ce jour au plan de travail de DECOUP' : '<span class="d">pas de plan de travail DECOUP à cette date : l’IA s’appuie sur les lieux et vos indications</span>') + '</li></ul>'
            + '<label class="d" style="display:block">Vos indications (facultatif)</label><textarea id="xcsai-hint" rows="3" style="width:100%;box-sizing:border-box" placeholder="ex. journée courte (fin 17 h), cantine sur place, tournage de nuit à partir de 21 h…"></textarea>'
            + (ready ? '' : '<p class="w">Aucune IA connectée : ⚙️ › Intelligence artificielle.</p>');
        F.innerHTML = '<button data-c>Annuler</button><button class="go" id="xcsai-go"' + (ready ? '' : ' disabled') + '>🤖 Proposer</button>';
        F.querySelector('[data-c]').onclick = close;
        F.querySelector('#xcsai-go').onclick = async () => {
            const b = F.querySelector('#xcsai-go'), hint = o.querySelector('#xcsai-hint').value.trim(); b.disabled = true; b.textContent = '⏳ L’IA prépare la journée…'; busy = new AbortController();
            let S = null, err = ''; try { const j = XAI.json(await XAI.ask(prompt(c) + (hint ? '\n\nIndications de l’utilisateur (prioritaires) : ' + hint : ''), { signal: busy.signal, maxTokens: 5000 })); S = normalize(j, d); } catch (e) { err = e && e.name === 'AbortError' ? '' : (e && e.message || String(e)); }
            busy = null; if (!document.getElementById('xcsai')) return;
            if (!S) { b.disabled = false; b.textContent = '🤖 Réessayer'; if (err) C.insertAdjacentHTML('beforeend', '<p class="w">⚠️ ' + esc(err) + '</p>'); return; }
            propose(o, d, S);
        };
    }
    function propose(o, d, S) {
        const C = o.querySelector('#xcsai-c'), F = o.querySelector('#xcsai-f'), LB = { general: 'Convocation générale', pat: 'Prêt à tourner', lunch: 'Repas', wrap: 'Fin de journée' }, TX = { securite: '🦺 Consignes de sécurité (ajoutées)', pratique: 'ℹ️ Infos pratiques (ajoutées)', mot: '💬 Mot de la production (notes)' };
        const RL = {}; RISKS.forEach(r => RL[r[0]] = r[1]); let h = '';
        const box = (g, i, on, txt) => '<label><input type="checkbox" data-g="' + g + '" data-i="' + i + '"' + (on ? ' checked' : '') + '><span>' + txt + '</span></label>';
        if (S.alerts.length) h += '<div class="s w">⚠️ Points à vérifier</div>' + S.alerts.map(a => '<div class="w">• ' + esc(a) + '</div>').join('');
        if (S.times.length) h += '<div class="s">⏰ Horaires</div>' + S.times.map((t, i) => box('times', i, t.on, esc(LB[t.k]) + ' : <b>' + esc(t.v) + '</b> <span class="d">(actuel ' + esc(d.times[t.k]) + ')</span>')).join('');
        if (S.sched.length) h += '<div class="s">🎬 Déroulé (' + S.sched.length + ' lignes, ajoutées et triées par heure)</div>' + S.sched.map(({ x }, i) => box('sched', i, true, esc((x.heure || '--:--') + ' · ' + (x.type === 'event' ? '⏸ ' : '') + (x.seq ? 'Séq. ' + x.seq + ' ' : '') + (x.ie ? x.ie + ' ' : '') + (x.desc || '') + (x.roles ? ' (' + x.roles + ')' : '')))).join('');
        if (S.risks.length) h += '<div class="s">🦺 Risques à cocher</div>' + S.risks.map((t, i) => box('risks', i, true, esc(RL[t.r]))).join('');
        S.txt.forEach((t, i) => { h += '<div class="s">' + TX[t.k] + '</div>' + box('txt', i, true, esc(t.v)); });
        if (S.acces.length) h += '<div class="s">🚪 Accès des lieux (champs vides seulement)</div>' + S.acces.map((t, i) => box('acces', i, true, '<b>' + esc(t.l.name) + '</b> : ' + esc(t.v))).join('');
        C.innerHTML = h || '<p>L’IA n’a rien proposé de plus.</p>';
        C.querySelectorAll('[data-g]').forEach(c => c.onchange = () => { S[c.dataset.g][+c.dataset.i].on = c.checked; });
        F.innerHTML = '<span class="d" style="flex:1">Rien n’est effacé : les textes s’ajoutent à la suite, le déroulé s’ajoute aux lignes existantes.</span><button data-c>Annuler</button><button class="go" id="xcsai-ok">✅ Remplir la feuille</button>';
        F.querySelector('[data-c]').onclick = close;
        F.querySelector('#xcsai-ok').onclick = () => { const n = apply(d, S); close(); say('🤖 Feuille de service : ' + n + ' élément(s) ajouté(s) — à relire avant envoi'); };
    }
    function mount() {
        if (document.getElementById('xcsai-btn')) return; const tb = document.getElementById('toolbar'); if (!tb) return;
        tb.insertAdjacentHTML('beforeend', '<button id="xcsai-btn" title="L’IA propose horaires, déroulé (d’après le plan de travail DECOUP), risques et consignes de sécurité, infos pratiques et accès de la journée affichée — à cocher avant de remplir"><span class="btn-icon">🤖</span><span class="btn-label">Préremplir</span></button>');
        document.getElementById('xcsai-btn').onclick = open;
    }
    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mount); else setTimeout(mount, 0); addEventListener('load', mount);
    return { open, context, prompt, normalize, apply, decoupDay };
})();
