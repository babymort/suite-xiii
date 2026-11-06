// =====================================================================
//  DECOUP XIII — 🤖 Dépouillement du scénario par l'IA
//  L'IA de l'utilisateur relit chaque séquence et propose, par catégorie, ce que le repérage par mots-clés
//  a manqué : accessoires, costumes, maquillage / coiffure, véhicules, animaux, effets spéciaux, effets visuels,
//  cascades, figuration (avec effectifs), musique / son, personnages muets. Proposition à valider ligne par ligne
//  avant d'entrer dans le tableau de dépouillement (CSV, PDF, plan de travail inchangés).
// =====================================================================
var XDPAI = window.XDPAI || (() => {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const say = m => { try { toast(m); } catch (e) { } };
    // catégories ajoutées au tableau (en plus des 7 d'origine)
    const EXTRA = [
        ['hmc', '💄', 'Maquillage / coiffure', 'maquillage|maquillée|maquillé|cicatrice|ecchymose|bleu sur|blessure|sang|sueur|transpire|larmes|pleure|barbe|moustache|perruque|chauve|coiffure|chignon|tatouage|vieilli|vieillie|cerne|cernes|pâle|bronzé|bronzée|makeup|scar|bruise|tattoo|wig'],
        ['vfx', '🖥️', 'Effets visuels / VFX', 'incrustation|fond vert|écran vert|hologramme|téléportation|disparaît|se dématérialise|morphing|clone|double de|apparition|fantôme|vaisseau|extraterrestre|monstre|green screen|vfx|cgi'],
        ['cas', '🤸', 'Cascades', 'cascade|cascadeur|chute|tombe|saute|sauter|se jette|bagarre|se battent|combat|coup de poing|percute|renversé|renversée|accident|poursuite|course-poursuite|fight|stunt|falls|jumps']
    ];
    function setup() {
        if (typeof DP_CATS === 'undefined' || DP_CATS.some(c => c[0] === 'hmc')) return;
        EXTRA.forEach(c => { DP_CATS.push(c); try { DP_RX.push([c[0], new RegExp('(^|[^\\p{L}])(' + c[3] + ')(?=$|[^\\p{L}])', 'giu')]); } catch (e) { } });
    }
    const CATS = () => (typeof DP_CATS !== 'undefined' ? DP_CATS : []).map(c => ({ id: c[0], ico: c[1], nom: c[2] }));
    const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    // texte de chaque séquence, retrouvé dans le scénario d'origine grâce aux en-têtes
    function texts(B) {
        const src = String(B.src || ''), out = []; let pos = 0;
        const at = B.scenes.map(s => { const h = String(s.heading || '').trim(); if (!h || h[0] === '(') return -1; const i = src.indexOf(h, pos); if (i >= 0) pos = i + h.length; return i; });
        B.scenes.forEach((s, k) => { const a = at[k]; if (a < 0) { out.push(''); return; } let b = src.length; for (let j = k + 1; j < at.length; j++) if (at[j] > a) { b = at[j]; break; } out.push(src.slice(a, b).trim()); });
        return out;
    }
    function batches(B) {
        const T = texts(B), L = []; let cur = [], len = 0;
        B.scenes.forEach((s, i) => { const t = (T[i] || s.summary || '').slice(0, 6000); if (cur.length && (len + t.length > 22000 || cur.length >= 30)) { L.push(cur); cur = []; len = 0; } cur.push({ i, s, t }); len += t.length; });
        if (cur.length) L.push(cur); return L;
    }
    function prompt(batch, all) {
        return 'Tu es premier assistant réalisateur. Fais le DÉPOUILLEMENT de ces séquences de scénario, comme sur une feuille de dépouillement : pour chaque séquence, liste ce qu’il faudra prévoir au tournage, par catégorie. Sois concret et court (un élément = quelques mots), n’invente rien qui ne soit pas écrit ou évidemment nécessaire, et ne répète pas les personnages qui ont des répliques.\n'
            + 'Catégories (id = nom) : ' + CATS().map(c => c.id + ' = ' + c.nom).join(' ; ') + ' ; muets = personnages présents sans réplique.\n'
            + 'Pour la figuration, donne l’effectif et le type (« 20 passants », « 2 serveurs »). Pour les effets et cascades, précise l’action (« coup de feu à blanc », « chute dans l’escalier »).\n'
            + 'Personnages connus : ' + [...new Set(all.flatMap(s => s.chars || []))].slice(0, 60).join(', ') + '.\n\n'
            + 'Réponds UNIQUEMENT par un JSON : {"sequences":[{"num":"12","el":{"acc":["…"],"cos":["…"]},"muets":["…"],"note":"remarque de préparation éventuelle"}]} (n’écris que les catégories non vides).\n\n'
            + batch.map(x => '### SÉQUENCE ' + x.s.num + ' — ' + [x.s.ie, x.s.decor, x.s.effet].filter(Boolean).join(' · ') + '\n' + (x.t || x.s.summary || '(texte non disponible)')).join('\n\n');
    }
    // propositions = éléments absents du tableau actuel
    function diff(B, R) {
        const P = [], C = CATS().map(c => c.id);
        (R.sequences || []).forEach(q => {
            const i = B.scenes.findIndex(s => String(s.num).trim().toUpperCase() === String(q.num).trim().toUpperCase()); if (i < 0) return; const s = B.scenes[i];
            Object.keys(q.el || {}).forEach(k => { if (!C.includes(k)) return; (Array.isArray(q.el[k]) ? q.el[k] : [q.el[k]]).forEach(v => { v = String(v || '').trim().slice(0, 80); if (!v) return; if ((s.el[k] || []).some(x => fold(x) === fold(v))) return; if (P.some(p => p.i === i && p.k === k && fold(p.v) === fold(v))) return; const rep = (s.el[k] || []).filter(x => fold(x).length > 2 && fold(v).includes(fold(x))); P.push({ i, k, v, rep, on: true }); }); });
            (q.muets || []).forEach(v => { v = String(v || '').trim().slice(0, 40); if (v && !s.chars.some(c => fold(c) === fold(v))) P.push({ i, k: 'chars', v, on: true }); });
            if (q.note) P.push({ i, k: 'note', v: String(q.note).slice(0, 200), on: false });
        });
        return P;
    }
    function apply(B, P) {
        let n = 0; P.filter(p => p.on).forEach(p => { const s = B.scenes[p.i]; if (!s) return;
            if (p.k === 'chars') { s.chars.push(p.v.toUpperCase()); n++; }
            else if (p.k === 'note') { s.summary = (s.summary ? s.summary + ' — ' : '') + '📝 ' + p.v; n++; }
            else { const R = (p.rep || []).map(fold); s.el[p.k] = (s.el[p.k] || []).filter(x => !R.includes(fold(x))).concat(p.v); n++; } });   // la précision de l'IA remplace le mot-clé repéré (« passants » → « 8 passants »)
        try { autosave(); } catch (e) { } try { dpRender(); } catch (e) { } return n;
    }
    // ---------- interface ----------
    let busy = null;
    function css() {
        if (document.getElementById('xdpai-css')) return; const s = document.createElement('style'); s.id = 'xdpai-css';
        s.textContent = '#xdpai{margin:10px 0;padding:10px 12px;border:1px solid var(--border-color,#444);border-radius:10px;background:var(--bg-panel-alt,rgba(255,255,255,.03))}#xdpai .r{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#xdpai .l{max-height:46vh;overflow:auto;margin-top:8px}#xdpai .sq{margin:8px 0 2px;font-weight:700}#xdpai label{display:flex;gap:7px;align-items:flex-start;padding:2px 0 2px 10px;cursor:pointer}#xdpai .c{opacity:.7;min-width:150px}#xdpai .w{color:#ffb74d}#xdpai .d{opacity:.7}';
        document.head.appendChild(s);
    }
    function panel() { let p = document.getElementById('xdpai'); const bar = document.getElementById('dp-mk'); if (!p && bar) { bar.closest('.dp-bar').insertAdjacentHTML('afterend', '<div id="xdpai"></div>'); p = document.getElementById('xdpai'); } return p; }
    async function run() {
        setup(); css(); const B = dpState(), p = panel(); if (!p) return;
        if (!B.scenes.length) { say('Importez d’abord un scénario (📂 ou 📋)'); return; }
        if (typeof XAI === 'undefined' || !XAI.configured || !XAI.configured()) { p.innerHTML = '<div class="r"><span class="w">🤖 Aucune IA connectée.</span><button id="xdpai-set">Connecter mon IA</button><span class="d">Le dépouillement par mots-clés reste disponible sans IA.</span></div>'; p.querySelector('#xdpai-set').onclick = () => { try { XAI.openSettings(); } catch (e) { } }; return; }
        if (busy) return; const L = batches(B); busy = new AbortController(); let P = [], err = '';
        p.innerHTML = '<div class="r"><b>🤖 L’IA relit le scénario…</b><span id="xdpai-st" class="d"></span><button id="xdpai-stop">⏹ Arrêter</button></div>'; p.querySelector('#xdpai-stop').onclick = () => busy && busy.abort();
        for (let k = 0; k < L.length; k++) {
            const st = p.querySelector('#xdpai-st'); if (st) st.textContent = 'lot ' + (k + 1) + ' / ' + L.length + ' · ' + L[k].length + ' séquence(s)';
            try { const r = await XAI.ask(prompt(L[k], B.scenes), { signal: busy.signal, maxTokens: 8000 }); P = P.concat(diff(B, XAI.json(r))); }
            catch (e) { if (e && e.name === 'AbortError') { err = 'arrêté'; break; } err = e && e.message || String(e); }
        }
        busy = null; show(B, P, err);
    }
    function show(B, P, err) {
        const p = panel(); if (!p) return; const C = {}; CATS().forEach(c => C[c.id] = c.ico + ' ' + c.nom); C.chars = '🎭 Personnage muet'; C.note = '📝 Note de préparation';
        if (!P.length) { p.innerHTML = '<div class="r">' + (err ? '<span class="w">⚠️ ' + esc(err) + '</span>' : '✅ L’IA n’a rien trouvé de plus que le dépouillement actuel.') + '<button id="xdpai-x">Fermer</button></div>'; p.querySelector('#xdpai-x').onclick = () => p.remove(); return; }
        const by = {}; P.forEach((x, j) => (by[x.i] = by[x.i] || []).push(j));
        p.innerHTML = '<div class="r"><b>🤖 ' + P.filter(x => x.k !== 'note').length + ' élément(s) proposé(s) par l’IA</b><span class="d">— décochez ce qui ne convient pas, puis ajoutez au tableau</span>' + (err ? '<span class="w">⚠️ ' + esc(err) + ' (résultat partiel)</span>' : '') + '</div>'
            + '<div class="r" style="margin-top:6px"><button data-all="1">Tout cocher</button><button data-all="0">Tout décocher</button></div><div class="l">'
            + Object.keys(by).map(i => { const s = B.scenes[+i]; return '<div class="sq">Séq. ' + esc(s.num) + ' — ' + esc([s.ie, s.decor, s.effet].filter(Boolean).join(' · ')) + '</div>' + by[i].map(j => '<label><input type="checkbox" data-j="' + j + '"' + (P[j].on ? ' checked' : '') + '><span class="c">' + esc(C[P[j].k] || P[j].k) + '</span><span>' + esc(P[j].v) + (P[j].rep && P[j].rep.length ? ' <span class="d">(remplace « ' + esc(P[j].rep.join(' », « ')) + ' »)</span>' : '') + '</span></label>').join(''); }).join('')
            + '</div><div class="r" style="margin-top:8px"><button id="xdpai-ok" class="dp-main">✅ Ajouter au dépouillement</button><button id="xdpai-x">Annuler</button></div>';
        p.querySelectorAll('[data-j]').forEach(c => c.onchange = () => { P[+c.dataset.j].on = c.checked; });
        p.querySelectorAll('[data-all]').forEach(b => b.onclick = () => { const v = b.dataset.all === '1'; P.forEach(x => x.on = v); p.querySelectorAll('[data-j]').forEach(c => c.checked = v); });
        p.querySelector('#xdpai-x').onclick = () => p.remove();
        p.querySelector('#xdpai-ok').onclick = () => { const n = apply(B, P); say('🤖 ' + n + ' élément(s) ajouté(s) au dépouillement'); };
    }
    // bouton dans la fenêtre 📜 Scénario & dépouillement
    function hook() {
        setup(); if (typeof dpOpen !== 'function' || dpOpen.__ai) return; const o = dpOpen;
        dpOpen = function () { const r = o.apply(this, arguments); try { const mk = document.getElementById('dp-mk'); if (mk && !document.getElementById('xdpai-btn')) { mk.insertAdjacentHTML('beforebegin', '<button id="xdpai-btn" title="L’IA relit chaque séquence et propose accessoires, costumes, maquillage, véhicules, animaux, effets, VFX, cascades, figuration, musique et personnages muets — à valider ligne par ligne">🤖 Dépouillement par l’IA</button>'); document.getElementById('xdpai-btn').onclick = run; } } catch (e) { } return r; };
        dpOpen.__ai = 1;
    }
    hook(); if (document.readyState !== 'complete') addEventListener('load', hook);
    return { run, diff, apply, texts, batches, prompt, setup };
})();
