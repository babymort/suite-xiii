// =====================================================================
//  SUITE XIII — XSCEN : 📄 lecture de scénario / note d'intention
//  Déposez un scénario (PDF, Final Draft .fdx, Fountain, .docx, .txt) ou collez le texte : séquences (INT/EXT,
//  décor, jour/nuit, personnages), rôles (répliques, séquences), décors, besoins techniques repérés.
//  Puis ✨ pré-remplissage : DECOUP (découpage), CASTO (rôles à caster), REPERO (décors à repérer),
//  MATOS (matériel du projet) et la fiche projet ; en option STORYBOARDO, SCRIPTO, CALL SHEETO, PLANNO.
//  Avec une IA connectée : lecture enrichie (résumés, descriptions des rôles, besoins) ; sinon analyse locale.
// =====================================================================
var XSCEN = window.XSCEN || (() => {
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fold = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const cap = s => { s = String(s || '').toLowerCase().replace(/(^|[\s'’(-])([a-zà-ÿ])/g, (m, a, b) => a + b.toUpperCase()); return s.replace(/\b(De|Du|Des|La|Le|Les|Et|D|L)\b/g, m => m.toLowerCase()).replace(/^./, c => c.toUpperCase()); };
    const say = m => { try { (window.toast || (() => { }))(m); } catch (e) { } };
    const uid = () => Math.random().toString(36).slice(2, 10);
    // ================= 1. lecture du fichier =================
    async function pdfText(buf) {
        const lib = await import('./_selftest_pdf/pdf.min.mjs'); lib.GlobalWorkerOptions.workerSrc = './_selftest_pdf/pdf.worker.min.mjs';
        const doc = await lib.getDocument({ data: buf }).promise, out = [];
        for (let i = 1; i <= doc.numPages; i++) { const pg = await doc.getPage(i), tc = await pg.getTextContent(), rows = [];
            tc.items.forEach(it => { if (!it.str) return; const y = Math.round(it.transform[5]), x = it.transform[4]; let r = rows.find(r => Math.abs(r.y - y) < 3); if (!r) rows.push(r = { y, it: [] }); r.it.push({ x, s: it.str, w: it.width || 0 }); });
            rows.sort((a, b) => b.y - a.y).forEach(r => { r.it.sort((a, b) => a.x - b.x); let line = '', end = null; r.it.forEach(t => { if (end != null && t.x - end > 2 && !/\s$/.test(line)) line += ' '; line += t.s; end = t.x + t.w; }); out.push({ s: line, x: r.it[0].x }); });
            out.push({ s: '', x: 0, page: i }); }
        // les noms de personnages sont centrés : on garde l'indentation pour aider la lecture
        const xs = out.filter(l => l.s.trim()).map(l => Math.round(l.x)), base = xs.length ? xs.sort((a, b) => a - b)[Math.floor(xs.length * .1)] : 0;
        return out.map(l => (l.s.trim() && l.x - base > 120 ? ' '.repeat(Math.min(30, Math.round((l.x - base) / 8))) : '') + l.s).join('\n');
    }
    async function docxText(buf) {
        if (!window.JSZip) await new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = ok; s.onerror = () => ko(new Error('Lecture .docx indisponible hors ligne : enregistrez en PDF ou .txt')); document.head.appendChild(s); });
        const z = await JSZip.loadAsync(buf), x = await z.file('word/document.xml').async('string');
        return x.replace(/<w:tab\/>/g, '\t').replace(/<\/w:p>/g, '\n').replace(/<w:br\/>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    }
    function fdxText(x) { // Final Draft : on reconstruit un texte « Fountain »
        const d = new DOMParser().parseFromString(x, 'text/xml'), out = [];
        d.querySelectorAll('Content > Paragraph, Paragraph').forEach(p => { if (p.closest('Paragraph') !== p && p.parentElement && p.parentElement.closest('Paragraph')) return; const t = p.getAttribute('Type') || '', s = [...p.querySelectorAll('Text')].map(n => n.textContent).join('').trim(); if (!s) return;
            if (t === 'Scene Heading') out.push('', s.toUpperCase(), ''); else if (t === 'Character') out.push('', ' '.repeat(20) + s.toUpperCase()); else if (t === 'Parenthetical') out.push(s); else if (t === 'Dialogue') out.push(s); else if (t === 'Transition') out.push('', s.toUpperCase(), ''); else out.push('', s); });
        return out.join('\n');
    }
    async function readFile(f) {
        const n = (f.name || '').toLowerCase();
        if (/\.pdf$/.test(n) || f.type === 'application/pdf') return pdfText(await f.arrayBuffer());
        if (/\.docx$/.test(n)) return docxText(await f.arrayBuffer());
        if (/\.fdx$/.test(n)) return fdxText(await f.text());
        if (/\.(doc|pages|odt|rtf)$/.test(n)) throw new Error('Format ' + n.split('.').pop().toUpperCase() + ' non lu : enregistrez le document en PDF ou en .docx');
        return f.text();
    }
    // ================= 2. analyse locale =================
    const MOM = { jour: 'Jour', day: 'Jour', matin: 'Jour', morning: 'Jour', midi: 'Jour', 'apres-midi': 'Jour', aube: 'Aube', dawn: 'Aube', soir: 'Soir', evening: 'Soir', crepuscule: 'Soir', dusk: 'Soir', nuit: 'Nuit', night: 'Nuit' };
    const HEAD = /^\s*(?:(?:seq(?:uence)?|séq(?:uence)?|sc(?:ene|ène)?)\.?\s*(\d+[a-z]?)\s*[-–—:.]?\s*)?(\d+[a-z]?[.)]?\s+)?(int\.?\s*\/\s*ext|ext\.?\s*\/\s*int|i\/e|int(?:erieur|érieur)?|ext(?:erieur|érieur)?)[.\s:-]+(.+?)\s*$/i;
    const TRANS = /^(fondu|enchain|enchaîn|coupe|cut to|fade|smash|dissolve|retour a|retour à|fin\b|the end|noir\b|ouverture|suite\b|continu)/i;
    const NOTCUE = /^(int|ext|plan|insert|flash|retour|fin|titre|carton|générique|generique|scene|séquence|sequence|noir|off|v\.?o|o\.?s|musique|bruit|silence|pause|ellipse|fondu|cut|fade|the end|continued|suite|more|page)\b/i;
    function splitHead(rest) {
        let lieu = rest, mom = '', m = /^(.*?)\s*[-–—]+\s*([^-–—]+?)\s*(?:[-–—]+\s*[^-–—]*)?$/.exec(rest);
        if (m && MOM[fold(m[2]).replace(/\s+/g, '-').replace(/\d+$/, '').trim()] !== undefined) { lieu = m[1]; mom = MOM[fold(m[2]).replace(/\s+/g, '-').replace(/\d+$/, '').trim()]; }
        else { const w = fold(rest).split(/[\s.,/–—-]+/).reverse().find(x => MOM[x]); if (w) { mom = MOM[w]; lieu = rest.replace(new RegExp('[\\s.,/–—-]*' + w + '.*$', 'i'), ''); } }
        lieu = lieu.replace(/\s+\d+[a-z]?$/i, '').replace(/[.\s–—-]+$/, '').trim();
        return { lieu: cap(lieu), mom: mom || 'Jour' };
    }
    function parse(text) {
        const L = String(text || '').replace(/\r/g, '').split('\n'), seqs = [], roles = {}; let cur = null, title = '', firstSeen = false;
        const isCue = (l, next) => { const raw = l.replace(/ /g, ' '), t = raw.trim().replace(/\s*\((v\.?o\.?|o\.?s\.?|off|hors champ|h\.?c\.?|cont'?d|suite|cont\.|in|voix off|au tel(e|é)phone)\)\s*$/i, '').replace(/\s*\(.*\)\s*$/, '').trim();
            if (!t || t.length > 32 || t.length < 2 || t !== t.toUpperCase() || !/[A-ZÀ-Ý]/.test(t) || /[.!?:;]$/.test(t) || /^\d+$/.test(t) || NOTCUE.test(t) || TRANS.test(t) || HEAD.test(t)) return null;
            if (!next || !next.trim() || next.trim() === next.trim().toUpperCase() && /[A-Z]{3}/.test(next)) return null; return t; };
        for (let i = 0; i < L.length; i++) { const l = L[i].replace(/ /g, ' '), t = l.trim(); if (!t) continue;
            const h = HEAD.exec(t);
            if (h && t === t.toUpperCase() || h && /^(int|ext)[.\s]/i.test(t) && t.length < 90) { const num = (h[1] || (h[2] || '').replace(/[.)\s]/g, '') || String(seqs.length + 1)); const ie = /\//.test(h[3]) || /^i\/e/i.test(h[3]) ? 'INT/EXT' : /^int/i.test(h[3]) ? 'INT' : 'EXT'; const { lieu, mom } = splitHead(h[4]);
                cur = { n: num, ie, lieu, mom, desc: '', roles: [], lines: 0, words: 0, txt: [] }; seqs.push(cur); firstSeen = true; continue; }
            if (!firstSeen) { if (!title && t.length < 80 && t === t.toUpperCase() && /[A-Z]{3}/.test(t) && !/^(scenario|scénario|ecrit|écrit|version|v\d|draft|par |by |note d|synopsis|traitement|continuit|bible|dossier|pitch|intention)/i.test(t)) title = cap(t); continue; }
            const next = (L.slice(i + 1).find(x => x.trim()) || ''), cue = isCue(l, next);
            if (cue) { const nm = cap(cue); const r = roles[nm] = roles[nm] || { nom: nm, rep: 0, seqs: [] }; r.rep++; if (cur && r.seqs.indexOf(cur.n) < 0) r.seqs.push(cur.n); if (cur && cur.roles.indexOf(nm) < 0) cur.roles.push(nm); continue; }
            if (cur) { cur.lines++; cur.words += t.split(/\s+/).length; if (cur.txt.length < 8 && !/^\(/.test(t)) cur.txt.push(t); }
        }
        seqs.forEach(s => { const a = s.txt.find(x => x.length > 20 && x !== x.toUpperCase()) || s.txt[0] || ''; s.desc = a.length > 170 ? a.slice(0, 167).replace(/\s+\S*$/, '') + '…' : a; s.pages = Math.max(1 / 8, Math.round((s.lines * 1.7 / 55) * 8) / 8); // lignes non vides ≈ 60 % d'une page de scénario
            // personnages cités en majuscules dans l'action (première apparition) : ajoutés aux rôles de la séquence
            s.txt.join(' ').replace(/\b([A-ZÀ-Ý][A-ZÀ-Ý'-]{2,}(?: [A-ZÀ-Ý][A-ZÀ-Ý'-]{2,})?)\b/g, (m0, n) => { const nm = cap(n); if (roles[nm] && s.roles.indexOf(nm) < 0) { s.roles.push(nm); if (roles[nm].seqs.indexOf(s.n) < 0) roles[nm].seqs.push(s.n); } }); delete s.txt; });
        const R = Object.values(roles).filter(r => r.rep >= 1).sort((a, b) => b.rep - a.rep);
        const lieux = {}; seqs.forEach(s => { const k = fold(s.lieu.replace(/\s*[-–—,].*$/, '')) || fold(s.lieu); const o = lieux[k] = lieux[k] || { nom: s.lieu.replace(/\s*[-–—,].*$/, '') || s.lieu, ie: new Set(), mom: new Set(), seqs: [], pages: 0 }; o.ie.add(s.ie); o.mom.add(s.mom); o.seqs.push(s.n); o.pages += s.pages; });
        const LX = Object.values(lieux).map(o => ({ nom: o.nom, ie: [...o.ie].join('/'), mom: [...o.mom].join(', '), seqs: o.seqs, pages: o.pages })).sort((a, b) => b.seqs.length - a.seqs.length);
        return { title, seqs, roles: R, lieux: LX, kind: seqs.length >= 2 ? 'scenario' : 'note', words: String(text).split(/\s+/).length };
    }
    // ================= 3. besoins techniques repérés dans le texte =================
    const NEEDS = [
        [/\bnuit\b/, s => s.ie !== 'INT' && s.mom === 'Nuit', 'Groupe électrogène silencieux', 'LUMIERE', 'Séquences extérieur nuit'],
        [/\bnuit\b/, s => s.ie !== 'INT' && s.mom === 'Nuit', 'Projecteur HMI 4 kW (nuit américaine / ambiance lune)', 'LUMIERE', 'Séquences extérieur nuit'],
        [/pluie|averse|orage|trempe|mouill/, null, 'Machine à pluie + rampes', 'GRIP', 'Pluie à l’image'],
        [/voiture|conduit|volant|taxi|camion|moto\b|route|autoroute|parking/, null, 'Travelling voiture (ventouses / hostess tray)', 'GRIP', 'Scènes en véhicule'],
        [/drone|vue aerienne|vue aérienne|survol|plan aerien|plan aérien/, null, 'Drone (télépilote + autorisation)', 'IMAGE', 'Plans aériens'],
        [/court|poursuit|fuit|s.enfuit|cavale|course|sprint|bagarre|se bat|combat/, null, 'Steadicam / stabilisateur', 'IMAGE', 'Action en mouvement'],
        [/mer\b|plage|piscine|riviere|rivière|lac\b|nage|plonge|sous l.eau|baignoire|bain\b/, null, 'Caisson étanche / protection pluie caméra', 'IMAGE', 'Eau à l’image'],
        [/fumee|fumée|brouillard|brume|vapeur/, null, 'Machine à fumée / brouillard', 'GRIP', 'Fumée ou brume'],
        [/feu\b|incendie|flamme|brule|brûle|cheminee|cheminée|bougie/, null, 'Extincteurs + pompier de plateau', 'REGIE', 'Feu à l’image'],
        [/arme|pistolet|revolver|fusil|couteau|tir\b|coup de feu/, null, 'Armes factices (armurier agréé)', 'REGIE', 'Armes à l’image'],
        [/concert|boite de nuit|boîte de nuit|bar\b|foule|fete|fête|mariage|manifestation|stade/, null, 'Micros HF supplémentaires (2) + ambiance', 'SON', 'Scènes de foule / bruyantes'],
        [/telephone|téléphone|portable|ecran|écran|ordinateur|television|télévision/, null, 'Écrans de jeu (incrustation / contenus à préparer)', 'REGIE', 'Écrans à l’image'],
        [/toit|falaise|echafaudage|échafaudage|balcon|vertige|grue/, null, 'Harnais et ligne de vie (EPI hauteur)', 'REGIE', 'Hauteur'],
        [/enfant|bebe|bébé|petit garcon|petit garçon|petite fille/, null, 'Loge enfant + autorisations DDETS', 'REGIE', 'Mineurs au tournage'],
        [/chien|chat\b|cheval|animal|animaux/, null, 'Dresseur animalier', 'REGIE', 'Animaux à l’image'],
        [/neige|givre|gel\b/, null, 'Neige artificielle', 'GRIP', 'Neige'],
        [/musique|chante|chanson|danse|piano|guitare/, null, 'Playback / enceinte de retour plateau', 'SON', 'Musique jouée à l’image']
    ];
    function needs(P) {
        const out = [], seen = {};
        P.seqs.forEach(s => { const t = fold(s.lieu + ' ' + s.desc + ' ' + s.mom + ' ' + s.ie); NEEDS.forEach(([re, ok, name, grp, why]) => { if ((ok ? ok(s) : re.test(t))) { const o = seen[name] = seen[name] || { name, grp, why, seqs: [] }; if (o.seqs.indexOf(s.n) < 0) o.seqs.push(s.n); } }); });
        return Object.values(seen).map(o => Object.assign(o, { qty: 1, on: true }));
    }
    // ================= 4. lecture par l'IA (facultative) =================
    async function ai(text, P) {
        const t = String(text).slice(0, 90000);
        const prompt = 'Tu es directeur de production. Lis ce ' + (P.kind === 'note' ? 'document (note d’intention ou synopsis)' : 'scénario') + ' et réponds UNIQUEMENT en JSON :\n' +
            '{"titre":"","genre":"fiction|doc|clip|pub|…","synopsis":"3 phrases","sequences":[{"n":"1","ie":"INT|EXT|INT/EXT","lieu":"","moment":"Jour|Nuit|Aube|Soir","resume":"une phrase","roles":["Prénom"],"pages":1}],' +
            '"roles":[{"nom":"","description":"âge, caractère, apparence en une phrase","genre":"f|m","importance":"principal|secondaire|silhouette|figuration","enfant":false}],' +
            '"lieux":[{"nom":"","description":"ce qu’il faut trouver au repérage","contraintes":""}],"materiel":[{"nom":"","grp":"IMAGE|SON|LUMIERE|GRIP|REGIE|CONSOMMABLES","qty":1,"raison":""}]}\n' +
            'Garde la numérotation du scénario. Si c’est une note d’intention sans séquences, propose les décors, les rôles et le matériel qu’elle implique, et laisse "sequences" vide.\n\nTEXTE :\n' + t;
        const r = await XAI.ask(prompt, { maxTokens: 8000 }); return XAI.json(r);
    }
    function mergeAI(P, A) {
        if (!A) return P; if (A.titre && (!P.title || P.kind === 'note' || /note d|synopsis|intention|traitement/i.test(P.title))) P.title = A.titre; P.synopsis = A.synopsis || ''; P.genre = A.genre || '';
        if (Array.isArray(A.sequences) && A.sequences.length && (!P.seqs.length || A.sequences.length >= P.seqs.length * .7)) {
            const old = P.seqs; P.seqs = A.sequences.map((s, i) => { const o = old.find(x => String(x.n) === String(s.n)) || old[i] || {}; return { n: String(s.n || i + 1), ie: /\//.test(s.ie || '') ? 'INT/EXT' : /^int/i.test(s.ie || o.ie || '') ? 'INT' : 'EXT', lieu: s.lieu || o.lieu || '', mom: s.moment || o.mom || 'Jour', desc: s.resume || o.desc || '', roles: (s.roles || o.roles || []).map(cap), pages: +s.pages || o.pages || 1 }; }); }
        const R = {}; P.roles.forEach(r => R[fold(r.nom)] = r);
        (A.roles || []).forEach(r => { const k = fold(r.nom); const o = R[k] || (R[k] = { nom: cap(r.nom), rep: 0, seqs: P.seqs.filter(s => s.roles.some(x => fold(x) === k)).map(s => s.n) }); Object.assign(o, { desc: r.description || '', g: r.genre === 'f' ? 'f' : r.genre === 'm' ? 'm' : '', imp: r.importance || '', enfant: !!r.enfant }); });
        P.roles = Object.values(R).sort((a, b) => (b.rep - a.rep) || (b.seqs.length - a.seqs.length));
        (A.lieux || []).forEach(l => { const k = fold(l.nom), o = P.lieux.find(x => fold(x.nom) === k || fold(x.nom).indexOf(k) === 0 || k.indexOf(fold(x.nom)) === 0); if (o) Object.assign(o, { desc: l.description || '', contr: l.contraintes || '' }); else P.lieux.push({ nom: l.nom, ie: '', mom: '', seqs: [], pages: 0, desc: l.description || '', contr: l.contraintes || '' }); });
        P.needs = (P.needs || []).concat((A.materiel || []).filter(m => m && m.nom && !(P.needs || []).some(x => fold(x.name) === fold(m.nom))).map(m => ({ name: m.nom, grp: /^(IMAGE|SON|LUMIERE|GRIP|REGIE|CONSOMMABLES)$/.test(m.grp) ? m.grp : 'REGIE', qty: Math.max(1, +m.qty || 1), why: m.raison || '', seqs: [], on: true, ia: 1 })));
        P.ai = 1; return P;
    }
    // ================= 5. profil de pré-remplissage (moteur des exemples XMODELS) =================
    const fiche = () => { const s = J('xiii.projets', {}) || {}; return (s.list || []).find(x => x && x.id === s.active) || null; };
    function buildProfile(P, opt) {
        const M = window.XMODELS, f = fiche() || {}; if (!M || !M.profiles) throw new Error('Moteur des modèles indisponible');
        const base = JSON.parse(JSON.stringify(M.profiles[M.profiles[f.ptype] ? f.ptype : 'fiction']));
        const S = P.seqs.length ? P.seqs : [{ n: '1', ie: 'INT', lieu: (P.lieux[0] || {}).nom || 'Décor principal', mom: 'Jour', desc: P.synopsis || 'Séquence à écrire', roles: P.roles.slice(0, 3).map(r => r.nom), pages: 1 }];
        // jours de tournage : décors regroupés, environ 4 pages par jour, nuits à part ; ou dates de la fiche
        const nbF = f.debut && f.fin ? Math.round((new Date(f.fin) - new Date(f.debut)) / 864e5) + 1 : 0, tot = S.reduce((a, s) => a + (s.pages || 1), 0);
        const nDays = Math.max(1, Math.min(30, nbF || Math.ceil(tot / 4) || 1));
        const order = S.slice().sort((a, b) => (a.mom === 'Nuit') - (b.mom === 'Nuit') || fold(a.lieu).localeCompare(fold(b.lieu)) || (parseFloat(a.n) - parseFloat(b.n)));
        const per = tot / nDays; let d = 0, acc = 0; const dayOf = {};
        order.forEach(s => { if (acc >= per && d < nDays - 1) { d++; acc = 0; } dayOf[s.n] = d; acc += s.pages || 1; });
        const dayLieu = Array.from({ length: nDays }, (_, i) => { const L = order.filter(s => dayOf[s.n] === i).map(s => s.lieu); return L.length ? [...new Set(L)].slice(0, 2).join(' & ') + (order.some(s => dayOf[s.n] === i && s.mom === 'Nuit') ? ' — nuit' : '') : 'Jour ' + (i + 1); });
        const tDay = (base.times || [['08:00', '09:00', '13:00', '19:00']])[0], tNight = ['16:00', '17:30', '22:00', '04:00'];
        // plans par défaut : plan d'ensemble, un plan par personnage (champ / contrechamp), un insert
        const plans = s => { const R = s.roles.slice(0, 4), P0 = [['PG', 'face', '', '24 mm', 'Plan d’ensemble — ' + (s.desc || s.lieu), 6, '']];
            if (R.length === 2) P0.push(['2S', 'profil', '', '35 mm', R[0] + ' et ' + R[1], 5, ''], ['GP', '3q', '', '50 mm', R[0] + ' (champ)', 4, ''], ['GP', '3q', '', '50 mm', R[1] + ' (contrechamp)', 4, '']);
            else R.forEach(r => P0.push(['PR', '3q', '', '50 mm', r, 4, '']));
            P0.push(['INS', 'face', '', '100 mm', 'Insert / détail', 2, '']); return P0; };
        base.title = P.title || f.title || base.title; base.short = (P.title || f.title || base.short).slice(0, 30); base.nDays = nDays; base.dayTitles = dayLieu;
        base.times = dayLieu.map((_, i) => order.some(s => dayOf[s.n] === i && s.mom === 'Nuit') ? tNight : tDay);
        base.seqs = S.map(s => [String(s.n), s.ie === 'INT/EXT' ? 'INT' : s.ie, s.lieu, s.mom === 'Nuit' ? 'Nuit' : 'Jour', s.desc || '', s.roles.slice(), plans(s), dayOf[s.n] || 0]);
        const roles = P.roles.filter(r => opt.roles[r.nom] !== false);
        base.cast = roles.map(r => { const kind = r.enfant || /enfant|petit|petite|bebe|bébé|fillette|garcon|garçon/i.test(r.nom + ' ' + (r.desc || '')) ? 'enfant' : /figurant|passant|client|foule|silhouette/i.test(r.nom + ' ' + (r.imp || '')) ? 'figurant' : 'comedien';
            return ['À caster — ' + r.nom, r.nom, kind, 'casting', kind === 'figurant' ? 110 : kind === 'enfant' ? 180 : 350, 'jour', r.g || (/a$|e$/i.test(r.nom.split(' ')[0]) ? 'f' : 'm')]; });
        base.spots = P.lieux.filter(l => opt.lieux[l.nom] !== false).map((l, i) => [l.nom, '', '', '', null, null, i ? 'decor' : 'decor', 'avoir', [l.ie && l.ie + (l.mom ? ' · ' + l.mom : ''), l.seqs.length ? 'Séq. ' + l.seqs.join(', ') : '', l.desc || '', l.contr ? '⚠️ ' + l.contr : ''].filter(Boolean).join(' — '), 0]);
        // pas d'adresses ni de personnes inventées : lieux et équipe à compléter (la fiche projet reste prioritaire)
        const blank = n => ({ name: n, address: '', lat: null, lon: null, access: '', contact: '', phone: '' });
        base.venue = blank((P.lieux[0] || {}).nom || 'Décor principal'); base.base = blank('Base régie (à définir)'); base.park = blank('Parking (à définir)'); base.cantine = blank('Cantine (à définir)'); base.loges = blank('Loges (à définir)'); base.hosp = blank('Urgences les plus proches (à définir)');
        base.client = f.client || ''; base.prod = f.production || ''; base.domain = '';
        base.crew = (f.team || []).filter(m => m && (m.name || m.nom)).map(m => [m.dept || 'autre', m.role || 'Équipe', m.name || [m.prenom, m.nom].filter(Boolean).join(' ')]);
        [['real', 'Réalisation'], ['real', '1er assistant réalisation'], ['real', 'Scripte'], ['prod', 'Direction de production'], ['regie', 'Régie générale'], ['image', 'Chef opérateur'], ['son', 'Chef opérateur son'], ['elec', 'Chef électricien'], ['machino', 'Chef machiniste'], ['deco', 'Décoration'], ['cost', 'Costumes'], ['hmc', 'Maquillage']].forEach(([d, r]) => { if (!base.crew.some(c => fold(c[1]).indexOf(fold(r).split(' ')[0].slice(0, 6)) === 0)) base.crew.push([d, r, 'À définir (' + r + ')']); });
        base.risks = [...new Set((base.risks || []).filter(r => ({ nuit: S.some(s => s.mom === 'Nuit'), eau: (P.needs || []).some(n => /etanche|étanche/i.test(n.name)), vehicule: (P.needs || []).some(n => /voiture/i.test(n.name)), hauteur: (P.needs || []).some(n => /harnais/i.test(n.name)) })[r] !== false))];
        return base;
    }
    // ================= 6. application =================
    function frame(tool) { return window.XMODELS && XMODELS.frame ? XMODELS.frame(tool, 'scen') : Promise.resolve({ ok: false, msg: 'moteur indisponible' }); }
    function toMatos(P) {
        const L = (P.needs || []).filter(n => n.on); if (!L.length) return 0; const st = J('xiii.projets', {}) || {}, id = st.active || '_';
        const m = J('matosXIII.parc', null) || { v: 1, units: [], resas: [] }; m.pm = m.pm || {}; const pm = m.pm[id] = m.pm[id] || { items: [] }; let n = 0;
        L.forEach(e => { const x = pm.items.find(i => fold(i.name) === fold(e.name)); if (x) return; pm.items.push({ id: uid(), name: e.name, qty: e.qty || 1, grp: e.grp || 'REGIE', on: true, src: '📄 Scénario' + (e.seqs && e.seqs.length ? ' · séq. ' + e.seqs.slice(0, 8).join(', ') : '') + (e.why ? ' · ' + e.why : '') }); n++; });
        W('matosXIII.parc', m); return n;
    }
    function toFiche(P) {
        const st = J('xiii.projets', {}) || {}; let f = (st.list || []).find(x => x && x.id === st.active); if (!f) return 0; let n = 0;
        if (!f.title && P.title) { f.title = P.title; n++; } if (!f.ptype) { f.ptype = 'fiction'; n++; }
        f.locs = f.locs || []; P.lieux.forEach(l => { if (!f.locs.some(x => fold(x.name) === fold(l.nom))) { f.locs.push({ name: l.nom, address: '', note: [l.ie, l.mom, l.seqs.length ? 'séq. ' + l.seqs.join(', ') : ''].filter(Boolean).join(' · ') }); n++; } });
        if (P.synopsis && !f.synopsis) { f.synopsis = P.synopsis; n++; }
        f.rev = (f.rev || 0) + 1; W('xiii.projets', st); return n;
    }
    // ================= 7. interface =================
    let CUR = null;
    function open() {
        css(); if (document.getElementById('xsc')) return;
        document.body.insertAdjacentHTML('beforeend', '<div id="xsc" role="dialog" aria-modal="true" aria-label="Lecture de scénario"><div class="xsc-b"><div class="xsc-h"><b>📄 Lire un scénario ou une note d’intention</b><button class="xsc-x" aria-label="Fermer">✕</button></div><div class="xsc-c"></div></div></div>');
        const o = document.getElementById('xsc'), close = () => o.remove(); o.querySelector('.xsc-x').onclick = close; o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        step1();
    }
    function step1() {
        const c = document.querySelector('#xsc .xsc-c'), ai = typeof XAI !== 'undefined' && XAI.configured && XAI.configured();
        c.innerHTML = '<label class="xsc-drop" tabindex="0"><input type="file" accept=".pdf,.fdx,.fountain,.txt,.docx,.md,text/plain,application/pdf" hidden><b>Déposez le scénario ici</b><span>ou cliquez pour choisir · PDF, Final Draft (.fdx), Fountain, Word (.docx), texte</span></label>' +
            '<details class="xsc-paste"><summary>…ou collez le texte</summary><textarea rows="8" placeholder="1. INT. APPARTEMENT DE LÉA – NUIT&#10;&#10;Léa rentre, trempée.&#10;&#10;                    MAX&#10;          Tu rentres tard."></textarea><button class="xsc-go">Analyser le texte</button></details>' +
            '<p class="xsc-n">' + (ai ? '🤖 L’IA connectée (' + esc(XAI.label ? XAI.label() : '') + ') complétera la lecture : résumés, description des rôles, contraintes des décors, matériel.' : '🔎 Analyse locale (en-têtes INT./EXT., noms des personnages, mots-clés). <button class="xsc-lk" data-ai>Connecter une IA</button> pour une lecture plus fine et les notes d’intention.') + ' Le texte reste dans votre navigateur' + (ai ? ', sauf l’envoi à l’IA choisie' : '') + '.</p>';
        const inp = c.querySelector('input[type=file]'), drop = c.querySelector('.xsc-drop');
        const go = async (getText, name) => { c.innerHTML = '<p class="xsc-w">⏳ Lecture' + (name ? ' de « ' + esc(name) + ' »' : '') + '…</p>'; let txt; try { txt = await getText(); } catch (e) { c.innerHTML = '<p class="xsc-w">⚠️ ' + esc(e.message || e) + '</p><button class="xsc-back">← Réessayer</button>'; c.querySelector('.xsc-back').onclick = step1; return; } analyse(txt, name); };
        inp.onchange = () => { const f = inp.files[0]; if (f) go(() => readFile(f), f.name); };
        drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
        ['dragover', 'dragenter'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('on'); })); drop.addEventListener('dragleave', () => drop.classList.remove('on'));
        drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('on'); const f = e.dataTransfer.files[0]; if (f) go(() => readFile(f), f.name); });
        c.querySelector('.xsc-go').onclick = () => { const t = c.querySelector('textarea').value; if (t.trim()) go(async () => t, ''); };
        const a = c.querySelector('[data-ai]'); if (a) a.onclick = () => XAI.openSettings && XAI.openSettings();
    }
    async function analyse(txt, name) {
        const c = document.querySelector('#xsc .xsc-c'); if (!c) return; let P = parse(txt); P.needs = needs(P); P.file = name || '';
        if (!P.title && name) P.title = cap(name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\b(v\d+|version.*|final|def)\b/gi, '').trim());
        if (typeof XAI !== 'undefined' && XAI.configured && XAI.configured()) { c.innerHTML = '<p class="xsc-w">🤖 Lecture par l’IA (' + P.seqs.length + ' séquence(s) repérée(s) localement)… cela peut prendre une minute.</p>';
            try { P = mergeAI(P, await ai(txt, P)); } catch (e) { P.aiErr = e.message || String(e); } }
        if (!P.seqs.length && !P.roles.length && !P.lieux.length) { c.innerHTML = '<p class="xsc-w">🤔 Je n’ai trouvé ni séquence (en-têtes « INT. / EXT. »), ni personnage.' + (P.aiErr ? ' (IA : ' + esc(P.aiErr) + ')' : '') + '</p><p class="xsc-n">Pour une note d’intention ou un synopsis, connectez une IA : elle en déduit décors, rôles et matériel.</p><button class="xsc-back">← Recommencer</button>'; c.querySelector('.xsc-back').onclick = step1; return; }
        CUR = P; review();
    }
    function review() {
        const P = CUR, c = document.querySelector('#xsc .xsc-c'), f = fiche() || {}, nuit = P.seqs.filter(s => s.mom === 'Nuit').length, ext = P.seqs.filter(s => s.ie !== 'INT').length, pages = P.seqs.reduce((a, s) => a + (s.pages || 0), 0);
        const has = k => { try { const v = localStorage.getItem(k); return v && v.length > 80; } catch (e) { return false; } }, K = (window.XMODELS && XMODELS.keys) || {};
        const T = [['decoup', '✂️ DECOUP', 'découpage : une ligne par séquence + plans de base', 1], ['casto', '🎭 CASTO', 'un rôle par personnage, à caster', 1], ['repero', '📍 REPERO', 'un décor à repérer par lieu', 1], ['matos', '📦 MATOS', 'matériel repéré → « Matériel du projet » (ajout)', 1], ['fiche', '🎬 Fiche projet', 'titre, décors' + (P.synopsis ? ', synopsis' : '') + ' (ajout)', 1],
            ['storyboardo', '🖼️ STORYBOARDO', 'une case par plan', 0], ['scripto', '📝 SCRIPTO', 'séquences et plans pour la scripte', 0], ['callsheeto', '📋 CALL SHEETO', 'journées de tournage d’après les décors', 0], ['planno', '📅 PLANNO', 'planning prépa / tournage', 0]];
        c.innerHTML = '<div class="xsc-k"><div><b>' + esc(P.title || 'Sans titre') + '</b><span>' + (P.file ? esc(P.file) + ' · ' : '') + (P.kind === 'note' ? 'note d’intention / synopsis' : 'scénario') + (P.ai ? ' · 🤖 lu par l’IA' : ' · 🔎 analyse locale') + '</span></div>' +
            '<div><b>' + P.seqs.length + '</b><span>séquences</span></div><div><b>' + P.roles.length + '</b><span>rôles</span></div><div><b>' + P.lieux.length + '</b><span>décors</span></div><div><b>' + (pages ? Math.round(pages) : '—') + '</b><span>pages env.</span></div><div><b>' + ext + ' / ' + nuit + '</b><span>ext. / nuits</span></div></div>' +
            (P.aiErr ? '<p class="xsc-n">⚠️ IA indisponible (' + esc(P.aiErr) + ') : analyse locale seulement.</p>' : '') + (P.synopsis ? '<p class="xsc-syn">' + esc(P.synopsis) + '</p>' : '') +
            '<nav class="xsc-t"><button data-t="seq" class="on">🎬 Séquences</button><button data-t="rol">🎭 Rôles</button><button data-t="lie">📍 Décors</button><button data-t="mat">📦 Matériel</button><button data-t="go">✨ Pré-remplir</button></nav><div class="xsc-p"></div>';
        const p = c.querySelector('.xsc-p');
        const tabs = {
            seq: () => P.seqs.length ? '<table class="xsc-tb"><thead><tr><th>N°</th><th></th><th>Décor</th><th>Moment</th><th>Personnages</th><th>Résumé</th><th>Pages</th></tr></thead><tbody>' + P.seqs.map(s => '<tr><td>' + esc(s.n) + '</td><td>' + esc(s.ie) + '</td><td>' + esc(s.lieu) + '</td><td>' + (s.mom === 'Nuit' ? '🌙 ' : '') + esc(s.mom) + '</td><td>' + esc(s.roles.join(', ')) + '</td><td class="d">' + esc(s.desc) + '</td><td>' + (s.pages ? (Math.round(s.pages * 8) + '/8') : '') + '</td></tr>').join('') + '</tbody></table>' : '<p class="xsc-n">Pas de séquence (note d’intention) : DECOUP recevra une séquence de départ à compléter.</p>',
            rol: () => '<p class="xsc-n">Décochez les rôles à ne pas envoyer à CASTO (personnages cités une seule fois, voix off…).</p><table class="xsc-tb"><thead><tr><th></th><th>Rôle</th><th>Répliques</th><th>Séquences</th><th>Description</th></tr></thead><tbody>' + P.roles.map(r => '<tr><td><input type="checkbox" data-r="' + esc(r.nom) + '"' + (P.optR && P.optR[r.nom] === false ? '' : ' checked') + '></td><td><b>' + esc(r.nom) + '</b>' + (r.enfant ? ' 👶' : '') + '</td><td>' + (r.rep || '') + '</td><td>' + esc((r.seqs || []).join(', ')) + '</td><td class="d">' + esc(r.desc || r.imp || '') + '</td></tr>').join('') + '</tbody></table>',
            lie: () => '<table class="xsc-tb"><thead><tr><th></th><th>Décor</th><th>Int / ext</th><th>Moments</th><th>Séquences</th><th>À trouver</th></tr></thead><tbody>' + P.lieux.map(l => '<tr><td><input type="checkbox" data-l="' + esc(l.nom) + '"' + (P.optL && P.optL[l.nom] === false ? '' : ' checked') + '></td><td><b>' + esc(l.nom) + '</b></td><td>' + esc(l.ie) + '</td><td>' + esc(l.mom) + '</td><td>' + esc(l.seqs.join(', ')) + '</td><td class="d">' + esc([l.desc, l.contr].filter(Boolean).join(' — ')) + '</td></tr>').join('') + '</tbody></table>',
            mat: () => (P.needs.length ? '<p class="xsc-n">Repéré dans le texte : décochez ce qui ne sert pas. Ajouté au « Matériel du projet » de MATOS (rien n’est retiré).</p><table class="xsc-tb"><thead><tr><th></th><th>Matériel</th><th>Famille</th><th>Pourquoi</th><th>Séquences</th></tr></thead><tbody>' + P.needs.map((n, i) => '<tr><td><input type="checkbox" data-m="' + i + '"' + (n.on ? ' checked' : '') + '></td><td><b>' + esc(n.name) + '</b>' + (n.ia ? ' 🤖' : '') + '</td><td>' + esc(n.grp) + '</td><td class="d">' + esc(n.why) + '</td><td>' + esc((n.seqs || []).join(', ')) + '</td></tr>').join('') + '</tbody></table>' : '<p class="xsc-n">Aucun besoin particulier repéré (nuit extérieure, pluie, véhicule, drone, eau, foule, armes, hauteur, enfants, animaux…).</p>'),
            go: () => '<p class="xsc-n">Choisissez les outils à pré-remplir. ⚠️ Les outils marqués « remplace » reçoivent un nouveau contenu : l’ancien est gardé (↶ « Restaurer » dans le menu Exemple de l’outil).</p><div class="xsc-go2">' + T.map(([k, n, d, on]) => { const full = k === 'matos' || k === 'fiche' ? false : has(K[k] || ''); return '<label><input type="checkbox" data-o="' + k + '"' + ((P.optO ? P.optO[k] : on) ? ' checked' : '') + '><span><b>' + n + '</b><small>' + d + (full ? ' · <em>remplace le contenu actuel</em>' : k === 'matos' || k === 'fiche' ? '' : ' · outil vide') + '</small></span></label>'; }).join('') + '</div>' +
                '<p class="xsc-n">Jours de tournage : ' + (f.debut && f.fin ? 'dates de la fiche (' + esc(f.debut) + ' → ' + esc(f.fin) + ')' : 'estimés à ~4 pages par jour, décors regroupés, nuits à part') + '.</p><div class="xsc-a"><button class="xsc-run">✨ Pré-remplir</button><span class="xsc-st"></span></div><ol class="xsc-log"></ol>'
        };
        const sync = () => { P.optR = P.optR || {}; p.querySelectorAll('[data-r]').forEach(x => P.optR[x.dataset.r] = x.checked); P.optL = P.optL || {}; p.querySelectorAll('[data-l]').forEach(x => P.optL[x.dataset.l] = x.checked); p.querySelectorAll('[data-m]').forEach(x => P.needs[+x.dataset.m].on = x.checked); if (p.querySelector('[data-o]')) { P.optO = {}; p.querySelectorAll('[data-o]').forEach(x => P.optO[x.dataset.o] = x.checked); } };
        const show = t => { sync(); c.querySelectorAll('.xsc-t button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); p.innerHTML = tabs[t](); p.querySelectorAll('input').forEach(x => x.onchange = sync); const r = p.querySelector('.xsc-run'); if (r) r.onclick = () => run(r); };
        c.querySelectorAll('.xsc-t button').forEach(b => b.onclick = () => show(b.dataset.t)); show('seq');
    }
    async function run(btn) {
        const P = CUR, p = document.querySelector('#xsc .xsc-p'), O = {}; p.querySelectorAll('[data-o]').forEach(x => O[x.dataset.o] = x.checked); P.optO = O;
        const log = p.querySelector('.xsc-log'), st = p.querySelector('.xsc-st'), add = (t, ok) => { log.insertAdjacentHTML('beforeend', '<li class="' + (ok === false ? 'ko' : ok === true ? 'ok' : '') + '">' + t + '</li>'); return log.lastElementChild; };
        btn.disabled = true; p.querySelectorAll('[data-o]').forEach(x => x.disabled = true);
        let prof; try { prof = buildProfile(P, { roles: P.optR || {}, lieux: P.optL || {} }); W('xiii.scen.profile', prof); W('xiii.scen.last', { at: Date.now(), title: P.title, seqs: P.seqs.length, roles: P.roles.length, lieux: P.lieux.length }); } catch (e) { add('⚠️ ' + esc(e.message || e), false); btn.disabled = false; return; }
        if (O.fiche) { const n = toFiche(P); add('🎬 Fiche projet : ' + (n ? n + ' élément(s) ajouté(s)' : 'déjà à jour'), true); }
        if (O.matos) { const n = toMatos(P); add('📦 MATOS : ' + n + ' ligne(s) ajoutée(s) au matériel du projet', true); }
        const tools = ['decoup', 'casto', 'repero', 'storyboardo', 'scripto', 'callsheeto', 'planno'].filter(k => O[k]); let ok = 0;
        for (const k of tools) { const li = add('⏳ ' + (window.XLINKS && XLINKS.T[k] ? XLINKS.T[k][0] + ' ' + XLINKS.T[k][1] : k.toUpperCase()) + '…'); st.textContent = 'Pré-remplissage ' + (tools.indexOf(k) + 1) + ' / ' + tools.length + '…';
            const r = await frame(k); li.className = r.ok ? 'ok' : 'ko'; li.textContent = (r.ok ? '✅ ' : '⚠️ ') + li.textContent.replace(/^⏳ /, '').replace(/…$/, '') + (r.ok ? ' pré-rempli' : ' : ' + (r.msg || 'erreur')); if (r.ok) ok++; }
        st.textContent = '✅ Terminé'; const a = p.querySelector('.xsc-a'); a.insertAdjacentHTML('beforeend', tools.map(k => '<a class="xsc-op" href="' + (k === 'planno' ? 'calendrier.html' : k + '.html') + '">↗ ' + (window.XLINKS && XLINKS.T[k] ? XLINKS.T[k][1] : k) + '</a>').join('') + (O.matos ? '<a class="xsc-op" href="matos.html?v=proj">↗ MATOS</a>' : ''));
        try { if (typeof XHIST !== 'undefined') { } } catch (e) { }
    }
    function css() {
        if (document.getElementById('xsc-css')) return; const s = document.createElement('style'); s.id = 'xsc-css';
        s.textContent = '#xsc{position:fixed;inset:0;z-index:9991;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;font:14px system-ui,sans-serif}.xsc-b{background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;width:min(1000px,100%);max-height:92vh;display:flex;flex-direction:column;box-shadow:0 14px 50px rgba(0,0,0,.5)}.xsc-h{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-soft,#3a3633)}.xsc-h b{font-size:16px}.xsc-x{margin-left:auto;background:none;border:0;color:inherit;font-size:17px;cursor:pointer;padding:4px 8px}.xsc-c{overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px}' +
            '.xsc-drop{display:flex;flex-direction:column;align-items:center;gap:6px;padding:34px 16px;border:2px dashed rgba(240,179,120,.5);border-radius:14px;cursor:pointer;text-align:center}.xsc-drop.on,.xsc-drop:hover,.xsc-drop:focus{background:rgba(240,179,120,.08);outline:none}.xsc-drop b{font-size:16px}.xsc-drop span{font-size:12.5px;color:var(--text-dim,#aaa)}.xsc-paste summary{cursor:pointer;font-size:13px;color:var(--text-dim,#bbb)}.xsc-paste textarea{width:100%;box-sizing:border-box;margin:8px 0;font:12.5px ui-monospace,monospace;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:8px}' +
            '.xsc-n{margin:0;font-size:12.5px;color:var(--text-dim,#aaa);line-height:1.45}.xsc-w{margin:0;font-size:14px}.xsc-lk{background:none;border:0;color:#F0B378;text-decoration:underline;cursor:pointer;font:inherit;padding:0}.xsc-go,.xsc-run,.xsc-back{align-self:flex-start;padding:9px 16px;border-radius:10px;border:0;background:#F0B378;color:#1a1a1a;font-weight:700;cursor:pointer}.xsc-run:disabled{opacity:.5}' +
            '.xsc-k{display:flex;flex-wrap:wrap;gap:8px}.xsc-k>div{padding:8px 12px;border-radius:10px;background:rgba(255,255,255,.05);display:flex;flex-direction:column;min-width:80px}.xsc-k>div:first-child{flex:1;min-width:200px}.xsc-k b{font-size:17px}.xsc-k span{font-size:11.5px;color:var(--text-dim,#aaa)}.xsc-syn{margin:0;padding:8px 12px;border-left:3px solid #F0B378;font-size:13px;line-height:1.5}' +
            '.xsc-t{display:flex;gap:6px;flex-wrap:wrap}.xsc-t button{padding:7px 12px;border-radius:9px;border:1px solid var(--border-color,#45454b);background:transparent;color:inherit;font:600 13px system-ui,sans-serif;cursor:pointer}.xsc-t button.on{background:rgba(240,179,120,.18);border-color:rgba(240,179,120,.7)}.xsc-t button[data-t=go]{margin-left:auto;background:#F0B378;color:#1a1a1a;border-color:#F0B378}' +
            '.xsc-p{display:flex;flex-direction:column;gap:10px}.xsc-tb{border-collapse:collapse;font-size:12.5px;width:100%}.xsc-tb th,.xsc-tb td{padding:5px 7px;border-bottom:1px solid var(--border-soft,#333);text-align:left;vertical-align:top}.xsc-tb th{position:sticky;top:0;background:var(--bg-panel,#252321);font-weight:600;color:var(--text-dim,#bbb)}.xsc-tb td.d{color:var(--text-dim,#bbb);max-width:380px}.xsc-tb input{width:auto;margin:0}' +
            '.xsc-go2{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:8px}.xsc-go2 label{display:flex;gap:9px;align-items:flex-start;padding:9px 10px;border:1px solid var(--border-color,#45454b);border-radius:10px;cursor:pointer}.xsc-go2 input{width:auto;margin:3px 0 0}.xsc-go2 small{display:block;font-size:11.5px;color:var(--text-dim,#aaa);margin-top:2px}.xsc-go2 em{color:#ffb74d;font-style:normal}' +
            '.xsc-a{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.xsc-st{font-size:12.5px;font-weight:600}.xsc-op{font-size:12.5px;padding:6px 10px;border-radius:8px;border:1px solid rgba(240,179,120,.6);color:inherit;text-decoration:none}.xsc-log{margin:0;padding:0 0 0 18px;font-size:13px;display:flex;flex-direction:column;gap:3px}.xsc-log li.ok{color:#81c784}.xsc-log li.ko{color:#e57373}';
        document.head.appendChild(s);
    }
    return { open, parse, needs, buildProfile, readFile, _cur: () => CUR };
})();
