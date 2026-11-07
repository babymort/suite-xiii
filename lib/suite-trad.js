// SUITE XIII — module commun. Source : xiii-src/suite-trad.js
// =====================================================================
//  SUITE XIII — 🌐 Documents traduits pour l'étranger
//  Dans l'aperçu de n'importe quel PDF de la suite (feuille de service, liste matériel, colisage, devis,
//  autorisations, dossier…) : « 🌐 Traduire » → anglais, espagnol, allemand, italien, portugais, néerlandais.
//  Le PDF est régénéré avec ses propres textes traduits par l'IA de l'utilisateur : même mise en page,
//  noms, adresses, marques, chiffres et horaires inchangés. Traductions mémorisées (rien n'est retraduit deux fois).
// =====================================================================
var XTRAD = window.XTRAD || (() => {
    const LANGS = [['en', 'English', '🇬🇧'], ['es', 'Español', '🇪🇸'], ['de', 'Deutsch', '🇩🇪'], ['it', 'Italiano', '🇮🇹'], ['pt', 'Português', '🇵🇹'], ['nl', 'Nederlands', '🇳🇱']];
    const LN = { en: 'anglais (britannique, vocabulaire des tournages internationaux)', es: 'espagnol', de: 'allemand', it: 'italien', pt: 'portugais', nl: 'néerlandais' };
    const K = l => 'xiii.trad.' + l, J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let mode = '', lang = '', DICT = {}, COL = null, SPLIT = null, done = null, last = null, lastT = 0;
    // texte à traduire ? (pas les nombres, dates, heures, codes, e-mails, URL, téléphones…)
    const worth = s => { s = String(s || '').trim(); if (s.length < 2 || s.length > 1500) return false; if (!/\p{L}{2,}/u.test(s)) return false; if (/^[\w.+-]+@[\w.-]+$|^https?:\/\/|^www\./i.test(s)) return false; if (/^[\d\s+().\/:-]+$/.test(s)) return false; return true; };
    const tr = s => { if (typeof s !== 'string' || !lang) return s; const k = s.trim(); const t = DICT[k]; return t ? s.replace(k, t) : s; };
    const col = s => { if (typeof s === 'string' && worth(s) && !(SPLIT && SPLIT.has(s))) COL.add(s.trim()); };
    function wrapDoc(doc) {
        if (!doc || doc.__xtr) return; doc.__xtr = 1;
        const T = doc.text, S = doc.splitTextToSize, W = doc.getTextWidth, SV = doc.save, OUT = doc.output;
        if (typeof T === 'function') doc.text = function (t) { const a = Array.prototype.slice.call(arguments);
            if (mode === 'collect') { (Array.isArray(t) ? t : [t]).forEach(col); } else if (mode === 'apply') a[0] = Array.isArray(t) ? t.map(tr) : tr(t);
            return T.apply(this, a); };
        if (typeof S === 'function') doc.splitTextToSize = function (t) { const a = Array.prototype.slice.call(arguments);
            if (mode === 'collect') { col(t); const r = S.apply(this, a); (r || []).forEach(x => SPLIT.add(x)); return r; }
            if (mode === 'apply') a[0] = tr(t); return S.apply(this, a); };
        if (typeof W === 'function') doc.getTextWidth = function (t) { return W.call(this, mode === 'apply' ? tr(t) : t); };
        if (typeof SV === 'function') doc.save = function () { if (mode === 'collect') { const f = done; done = null; if (f) f(); return doc; } const r = SV.apply(this, arguments); if (mode === 'apply') end(); return r; };
        if (typeof OUT === 'function') doc.output = function (type) { if (mode === 'collect' && type !== 'bloburl') { const f = done; done = null; if (f) setTimeout(f, 0); } return OUT.apply(this, arguments); };
    }
    function patch() {
        const P = window.jspdf && window.jspdf.jsPDF; if (!P || !P.API || P.API.__xtrPatch) return !!(P && P.API && P.API.__xtrPatch);
        P.API.__xtrPatch = 1; if (Array.isArray(P.API.events)) P.API.events.push(['initialized', function () { wrapDoc(this); }]); return true;
    }
    let tries = 0; (function poll() { if (patch() || ++tries > 120) return; setTimeout(poll, 1000); })();
    // le dernier bouton cliqué = l'export à relancer
    document.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('button,a,[onclick],[data-a],.ctx-item,.xs-item,li'); if (!t || t.closest('#xpv-ov,#xtr-st,#xaic,#xs-ov')) return; if (mode) return; last = t; lastT = Date.now(); }, true);
    function status(h, stop) {
        let s = document.getElementById('xtr-st'); if (!h) { if (s) s.remove(); return; }
        if (!s) { s = document.createElement('div'); s.id = 'xtr-st'; s.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483400;background:#2b2723;color:#f2ede6;border:1px solid #f0b378;border-radius:10px;padding:10px 14px;font:13px system-ui,sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 6px 24px rgba(0,0,0,.45)'; document.body.appendChild(s); }
        s.innerHTML = h + (stop ? ' <button id="xtr-stop" style="cursor:pointer">⏹ Arrêter</button>' : ' <button id="xtr-ok" style="cursor:pointer">OK</button>');
        const b = s.querySelector('#xtr-stop'); if (b) b.onclick = stop; const o = s.querySelector('#xtr-ok'); if (o) o.onclick = () => status('');
    }
    function end() { mode = ''; lang = ''; window.__xcNoPv = 0; }
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    async function rerun() { const el = last; if (!el) throw new Error('Relancez l’export du PDF puis choisissez la langue dans l’aperçu.'); try { el.click(); } catch (e) { throw new Error('Export introuvable : relancez-le.'); } }
    async function translate(L, list, signal, onp) {
        const D = J(K(L), {}), todo = list.filter(s => !D[s]);
        for (let i = 0; i < todo.length; i += 120) {
            const part = todo.slice(i, i + 120); onp && onp(i, todo.length);
            const p = 'Traduis en ' + LN[L] + ' ces textes extraits d’un document de production audiovisuelle (feuille de service, liste de matériel, colisage, devis, autorisation de tournage, dossier). Garde EXACTEMENT : noms de personnes, de sociétés, de lieux, adresses, marques et modèles de matériel, numéros, horaires, dates, codes, sigles techniques (INT/EXT, HMI, SDI…). Utilise le vocabulaire professionnel des tournages (call time, wrap, unit base, grip, gaffer…). Garde la ponctuation, les majuscules et les symboles. Un texte = une traduction, même ordre.\n'
                + 'Réponds UNIQUEMENT par un JSON {"t":["…"]} de ' + part.length + ' éléments.\n\n' + JSON.stringify(part);
            const j = XAI.json(await XAI.ask(p, { signal, maxTokens: 8000 })), R = Array.isArray(j.t) ? j.t : [];
            part.forEach((s, k) => { const v = R[k]; if (typeof v === 'string' && v.trim()) D[s] = v.trim(); });
            try { localStorage.setItem(K(L), JSON.stringify(D)); } catch (e) { }
        }
        return D;
    }
    async function run(L) {
        if (mode) return; if (typeof XAI === 'undefined' || !XAI.configured || !XAI.configured()) { status('🌐 Connectez d’abord votre IA (⚙️ › Intelligence artificielle) pour traduire.'); return; }
        if (!last || Date.now() - lastT > 10 * 60000) { status('🌐 Relancez l’export du PDF, puis choisissez la langue dans l’aperçu.'); return; }
        const pv = document.getElementById('xpv-ov'); if (pv) pv.remove();
        const ac = new AbortController(), stop = () => { ac.abort(); end(); status('⏹ Traduction arrêtée.'); };
        try {
            // 1. relecture du document : on relance l'export sans rien télécharger pour relever ses textes
            mode = 'collect'; COL = new Set(); SPLIT = new Set(); window.__xcNoPv = 1; status('🌐 Lecture des textes du document…', stop);
            const got = new Promise(r => { done = r; }); await rerun(); await Promise.race([got, sleep(20000)]); done = null;
            const list = [...COL]; mode = ''; if (!list.length) throw new Error('Aucun texte trouvé dans ce PDF (export non relancé ?).');
            // 2. traduction (mémorisée)
            const D = await translate(L, list, ac.signal, (i, n) => status('🌐 Traduction en ' + LANGS.find(x => x[0] === L)[1] + ' : ' + Math.min(n, i + 120) + ' / ' + n + ' textes…', stop));
            if (ac.signal.aborted) return;
            // 3. export traduit (même mise en page)
            DICT = D; lang = L; mode = 'apply'; window.__xcNoPv = 0; status('');
            await rerun(); setTimeout(() => { if (mode === 'apply') end(); }, 60000);   // l'aperçu traduit s'ouvre ; retour au français après l'enregistrement
            const miss = list.filter(s => !D[s]).length; if (miss) status('🌐 ' + (list.length - miss) + ' / ' + list.length + ' textes traduits (les autres restent en français).');
        } catch (e) { end(); if (!ac.signal.aborted) status('⚠️ ' + esc(e && e.message || e)); }
    }
    // bouton dans l'aperçu PDF commun
    const mo = new MutationObserver(() => { const h = document.querySelector('#xpv-ov .xpv-h'); if (!h || h.querySelector('#xtr-sel')) return;
        h.insertAdjacentHTML('beforeend', '<select id="xtr-sel" title="Traduire ce PDF pour un tournage à l’étranger (même mise en page ; noms, adresses, marques et chiffres inchangés)" style="margin-left:6px"><option value="">🌐 ' + (mode === 'apply' ? 'Traduit' : 'Traduire…') + '</option>' + LANGS.map(l => '<option value="' + l[0] + '">' + l[2] + ' ' + l[1] + '</option>').join('') + '</select>');
        h.querySelector('#xtr-sel').onchange = e => { const v = e.target.value; if (v) run(v); };
    }); const obs = () => { if (document.body) mo.observe(document.body, { childList: true }); else setTimeout(obs, 200); }; obs();
    return { run, LANGS, patch, clear: l => { try { localStorage.removeItem(K(l)); } catch (e) { } }, _state: () => ({ mode, lang, last: !!last }) };
})();
