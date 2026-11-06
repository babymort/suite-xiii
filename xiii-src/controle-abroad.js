// =====================================================================
//  CONTRÔLE XIII — 🌍 Check-list tournage à l'étranger
//  Choisissez le pays : la liste des démarches s'adapte (Union européenne ou non) — carnet ATA (lié à MATOS),
//  visas et permis de travail, détachement (formulaire A1), assurances, autorisations de tournage, drones,
//  batteries en avion, prises et tension, décalage horaire calculé pour les dates du tournage, conduite, téléphone.
//  🤖 « Compléter pour ce pays » : l'IA ajoute les points propres au pays (à vérifier auprès des sources officielles).
// =====================================================================
var XABROAD = window.XABROAD || (() => {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const JJ = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const WW = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
    const pid = () => { const s = JJ('xiii.projets', {}) || {}; return s.active || '_'; }, KEY = () => 'xiii.abroad.' + pid();
    // [nom, UE (union douanière), prises, tension, fuseau IANA]
    const C = [['Allemagne', 1, 'C / F', '230 V', 'Europe/Berlin'], ['Belgique', 1, 'C / E', '230 V', 'Europe/Brussels'], ['Espagne', 1, 'C / F', '230 V', 'Europe/Madrid'], ['Italie', 1, 'C / F / L', '230 V', 'Europe/Rome'], ['Portugal', 1, 'C / F', '230 V', 'Europe/Lisbon'],
        ['Pays-Bas', 1, 'C / F', '230 V', 'Europe/Amsterdam'], ['Luxembourg', 1, 'C / F', '230 V', 'Europe/Luxembourg'], ['Irlande', 1, 'G', '230 V', 'Europe/Dublin'], ['Grèce', 1, 'C / F', '230 V', 'Europe/Athens'], ['Pologne', 1, 'C / E', '230 V', 'Europe/Warsaw'],
        ['Suisse', 0, 'J (C passe)', '230 V', 'Europe/Zurich'], ['Royaume-Uni', 0, 'G', '230 V', 'Europe/London'], ['Norvège', 0, 'C / F', '230 V', 'Europe/Oslo'], ['Islande', 0, 'C / F', '230 V', 'Atlantic/Reykjavik'], ['Turquie', 0, 'C / F', '230 V', 'Europe/Istanbul'],
        ['Maroc', 0, 'C / E', '220 V', 'Africa/Casablanca'], ['Tunisie', 0, 'C / E', '230 V', 'Africa/Tunis'], ['Sénégal', 0, 'C / D / E / K', '230 V', 'Africa/Dakar'], ['Afrique du Sud', 0, 'C / D / M / N', '230 V', 'Africa/Johannesburg'],
        ['États-Unis (New York)', 0, 'A / B', '120 V · 60 Hz', 'America/New_York'], ['États-Unis (Los Angeles)', 0, 'A / B', '120 V · 60 Hz', 'America/Los_Angeles'], ['Canada (Montréal)', 0, 'A / B', '120 V · 60 Hz', 'America/Toronto'], ['Mexique', 0, 'A / B', '127 V · 60 Hz', 'America/Mexico_City'],
        ['Brésil', 0, 'N / C', '127 / 220 V · 60 Hz', 'America/Sao_Paulo'], ['Émirats arabes unis', 0, 'G', '230 V', 'Asia/Dubai'], ['Inde', 0, 'C / D / M', '230 V', 'Asia/Kolkata'], ['Chine', 0, 'A / C / I', '220 V', 'Asia/Shanghai'], ['Japon', 0, 'A / B', '100 V · 50 / 60 Hz', 'Asia/Tokyo'],
        ['Corée du Sud', 0, 'C / F', '220 V · 60 Hz', 'Asia/Seoul'], ['Thaïlande', 0, 'A / B / C / O', '230 V', 'Asia/Bangkok'], ['Australie', 0, 'I', '230 V', 'Australia/Sydney'], ['Nouvelle-Zélande', 0, 'I', '230 V', 'Pacific/Auckland']];
    const st = () => Object.assign({ country: '', ai: [], done: {} }, JJ(KEY(), {}) || {});
    const save = S => WW(KEY(), S);
    function offset(tz, date) {
        try { const d = new Date((date || new Date().toISOString().slice(0, 10)) + 'T12:00:00Z');
            const h = z => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: z, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d), g = t => +p.find(x => x.type === t).value; return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')); };
            const m = Math.round((h(tz) - h('Europe/Paris')) / 60000); if (!m) return 'même heure qu’à Paris'; const s = m > 0 ? '+' : '−', a = Math.abs(m); return s + Math.floor(a / 60) + ' h' + (a % 60 ? String(a % 60).padStart(2, '0') : '') + ' par rapport à Paris';
        } catch (e) { return ''; } }
    function ata() { const a = JJ('xiii.ata.' + pid(), null); return a && Array.isArray(a.rows) ? { n: a.rows.length, val: a.rows.reduce((s, r) => s + (parseFloat(String(r.val || 0).replace(',', '.')) || 0), 0), countries: (a.head || {}).countries || '' } : null; }
    // liste de base selon le pays
    function items(S, d0) {
        const c = C.find(x => x[0] === S.country), eu = c ? !!c[1] : false, A = ata(), L = [];
        const add = (k, t, det, auto) => L.push({ k, t, det, st: auto != null ? auto : (S.done[k] ? 'ok' : 'warn') });
        if (eu) add('ata', 'Carnet ATA', 'Pas nécessaire au sein de l’Union européenne : gardez la liste du matériel avec numéros de série et factures (MATOS › 🌍 Carnet ATA pour l’imprimer).', 'na');
        else add('ata', 'Carnet ATA (douane)', A && A.n ? 'Liste préparée dans MATOS : ' + A.n + ' ligne(s)' + (A.val ? ', valeur ' + Math.round(A.val).toLocaleString('fr-FR') + ' €' : '') + ' — à déposer à la CCI (e-ata) avec la garantie, délai de quelques jours.' : 'À préparer dans MATOS › Matériel du projet › 🌍 Carnet ATA, puis demande à la CCI (e-ata). Vérifiez que le pays accepte les carnets ATA.', A && A.n ? (S.done.ata ? 'ok' : 'warn') : 'bad');
        add('visa', eu ? 'Papiers d’identité' : 'Visas et permis de travail', eu ? 'Carte d’identité ou passeport valide pour toute l’équipe (vérifiez les dates d’expiration).' : 'Visa de travail / média selon le pays et la nationalité de chacun — délais parfois longs : consulat ou ambassade du pays, et France Diplomatie (Conseils aux voyageurs).');
        add('a1', eu || /Suisse|Norvège|Islande/.test(S.country) ? 'Détachement : formulaire A1' : 'Statut social de l’équipe à l’étranger', eu || /Suisse|Norvège|Islande/.test(S.country) ? 'Salariés envoyés en mission : demande de formulaire A1 (URSSAF / net-entreprises) et déclaration de détachement prévue par le pays d’accueil.' : 'Vérifiez la protection sociale des salariés détachés (convention bilatérale ou non) auprès de l’URSSAF / CLEISS.');
        add('assu', 'Assurances', 'Matériel (extension « monde » de la police), responsabilité civile à l’étranger, rapatriement de l’équipe' + (eu ? ', carte européenne d’assurance maladie' : '') + '.');
        add('auto', 'Autorisations de tournage locales', 'Commission du film ou mairie du pays, lieux privés, droit à l’image local : un fixer / producteur local accélère tout (ajoutez les accords dans RESSOURCO).');
        add('drone', 'Drone', 'Règles et déclarations propres au pays (souvent un opérateur local agréé) — rien à prévoir si pas de drone.');
        add('lith', 'Batteries lithium en avion', 'En cabine seulement, bornes protégées ; au-delà de 100 Wh accord de la compagnie, plus de 160 Wh interdit en vol de passagers (règles IATA) : prévoyez le transport par fret.');
        add('elec', 'Prises et tension', c ? 'Prises ' + c[2] + ' · ' + c[3] + ' : adaptateurs, multiprises, et vérifiez que chargeurs et projecteurs acceptent la tension' + (/60 Hz/.test(c[3]) ? ' (60 Hz : attention au scintillement des éclairages à 50 i/s)' : '') + '.' : 'Choisissez le pays pour connaître les prises et la tension.');
        if (c) add('tz', 'Décalage horaire', offset(c[4], d0) + ' le ' + (d0 ? d0.split('-').reverse().join('/') : 'jour J') + ' — à reporter dans les convocations et les rendez-vous avec la France.', 'ok');
        add('drive', 'Conduite', 'Permis international si nécessaire, assurance des véhicules de location, conduite à gauche ou à droite.');
        add('tel', 'Téléphone et données', 'Forfaits internationaux ou cartes locales pour l’équipe, partage de connexion pour l’envoi des rushes.');
        add('cash', 'Devise et paiements', 'Carte de la société, espèces pour les petits frais, per diem de l’équipe.');
        (S.ai || []).forEach((x, i) => add('ai' + i, '🤖 ' + x.t, x.det));
        return L;
    }
    const ICO = { ok: '✅', warn: '⚠️', bad: '⛔', na: '➖' };
    function block() {
        const S = st(), d0 = (typeof F !== 'undefined' && F.d0) || '', L = S.country ? items(S, d0) : [];
        return '<div class="ck-sec" id="xab"><h3>🌍 Tournage à l’étranger</h3><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 10px"><select id="xab-c"><option value="">— Tournage en France —</option>' + C.map(c => '<option' + (c[0] === S.country ? ' selected' : '') + '>' + esc(c[0]) + '</option>').join('') + (S.country && !C.some(c => c[0] === S.country) ? '<option selected>' + esc(S.country) + '</option>' : '') + '</select><input id="xab-o" placeholder="ou un autre pays…" style="width:160px">'
            + (S.country ? '<button id="xab-ai" title="L’IA ajoute les démarches propres à ce pays (à vérifier auprès des sources officielles)">🤖 Compléter pour ' + esc(S.country) + '</button><span class="ck-s" id="xab-st"></span>' : '') + '</div>'
            + (S.country ? L.map(r => '<label class="ck-r ' + r.st + '" style="display:flex;gap:8px;align-items:flex-start;cursor:' + (r.st === 'na' || r.k === 'tz' ? 'default' : 'pointer') + '">' + (r.st === 'na' || r.k === 'tz' ? '<span style="width:16px"></span>' : '<input type="checkbox" data-k="' + r.k + '"' + (S.done[r.k] ? ' checked' : '') + '>') + '<span>' + ICO[r.st] + ' <b>' + esc(r.t) + '</b><br><span class="ck-s">' + esc(r.det) + '</span></span></label>').join('') + '<p class="ck-s">Cochez ce qui est réglé. Règles susceptibles d’évoluer : vérifiez toujours auprès du consulat, de la douane, de la CCI et de France Diplomatie.</p>' : '<p class="ck-s">Choisissez le pays pour obtenir la liste des démarches (carnet ATA, visas, assurances, prises, décalage horaire…).</p>') + '</div>';
    }
    function wire() {
        const b = document.getElementById('xab'); if (!b) return; const S = st();
        const set = v => { const T = st(); if (T.country !== v) { T.country = v; T.ai = []; } save(T); paint(); };
        b.querySelector('#xab-c').onchange = e => set(e.target.value);
        b.querySelector('#xab-o').onchange = e => { const v = e.target.value.trim(); if (v) set(v.slice(0, 40)); };
        b.querySelectorAll('[data-k]').forEach(c => c.onchange = () => { const T = st(); T.done[c.dataset.k] = c.checked; save(T); paint(); });
        const ai = b.querySelector('#xab-ai'); if (ai) ai.onclick = () => complete(S.country);
    }
    function paint() { const old = document.getElementById('xab'); if (old) old.outerHTML = block(); else { const c = document.querySelector('#content .ck'); if (!c) return; const p = c.querySelector('p.ck-s:last-of-type'); if (p) p.insertAdjacentHTML('beforebegin', block()); else c.insertAdjacentHTML('beforeend', block()); } wire(); }
    async function complete(country) {
        const s = document.getElementById('xab-st'), b = document.getElementById('xab-ai');
        if (typeof XAI === 'undefined' || !XAI.configured || !XAI.configured()) { if (s) s.textContent = 'Connectez votre IA dans ⚙️ › Intelligence artificielle.'; return; }
        if (b) b.disabled = true; if (s) s.textContent = '⏳ L’IA prépare les points propres au pays…';
        const S = st(), base = items(S, (typeof F !== 'undefined' && F.d0) || '').map(r => r.t).join(' ; ');
        const p = 'Tu es directeur de production spécialisé dans les tournages internationaux, pour une société française. Pays du tournage : ' + country + '. Dates : ' + ((typeof F !== 'undefined' && F.d0) || '?') + ' → ' + ((typeof F !== 'undefined' && F.d1) || '?') + '.\nLa check-list contient déjà : ' + base + '.\n'
            + 'Ajoute 4 à 8 points PROPRES À CE PAYS que l’équipe française risque d’oublier (formalités d’entrée et de travail pour une équipe de tournage, douane du matériel, autorisations, sécurité, santé, climat, culture et usages, jours fériés pendant les dates). Une phrase concrète par point, avec l’organisme officiel à consulter. Si tu n’es pas sûr, dis « à vérifier ».\n'
            + 'Réponds UNIQUEMENT par un JSON {"items":[{"t":"titre court","det":"…"}]}.';
        try { const j = XAI.json(await XAI.ask(p, { maxTokens: 2000 })); const T = st(); T.ai = (j.items || []).slice(0, 8).map(x => ({ t: String(x.t || '').slice(0, 80), det: String(x.det || '').slice(0, 400) })).filter(x => x.t); save(T); paint(); }
        catch (e) { if (s) s.textContent = '⚠️ ' + (e && e.message || e); if (b) b.disabled = false; }
    }
    function hook() { if (typeof render !== 'function' || render.__ab) return; const r0 = render; render = function () { const x = r0.apply(this, arguments); try { paint(); } catch (e) { } return x; }; render.__ab = 1; try { paint(); } catch (e) { } }
    if (document.readyState === 'complete') hook(); else addEventListener('load', hook); setTimeout(hook, 1500);
    return { items, offset, C, complete };
})();
