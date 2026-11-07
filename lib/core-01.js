// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-01.js
// =====================================================================
//  SUITE XIII — XBOOT : démarrage sans « saut » de l'interface
//  La page reste invisible (fondu) le temps que les modules de la suite rangent les boutons, appliquent le thème
//  et resserrent la barre ; tout est fait en une fois au chargement, puis la page apparaît déjà dans sa forme finale.
//  (le rideau est posé dans le <head> par inject_settings.py ; sécurité : affichage forcé au bout de 3 s)
// =====================================================================
const XBOOT = (() => {
    const Q = []; let done = false, shown = false;
    const H = document.documentElement;
    function reveal() {
        if (shown) return; shown = true;
        try { const bg = getComputedStyle(document.body).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)') localStorage.setItem('xiii.boot.bg', bg); } catch (e) { }
        H.classList.add('xb1'); H.classList.remove('xb0'); H.style.background = ''; setTimeout(() => H.classList.remove('xb1'), 260);
    }
    function settle() { // attend que l'interface ne bouge plus (≈ 2 images sans changement de structure), 350 ms au plus
        let last = performance.now(); const end = last + 350, mo = new MutationObserver(() => { last = performance.now(); });
        try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { }
        const chk = () => { const n = performance.now(); if (n - last > 60 || n > end) { mo.disconnect(); try { if (typeof XFIT !== 'undefined') XFIT.fit(); } catch (e) { } requestAnimationFrame(reveal); } else requestAnimationFrame(chk); };
        requestAnimationFrame(chk);
    }
    function run() {
        if (done) return; done = true; Q.sort((a, b) => a.o - b.o);
        for (const x of Q.splice(0)) { try { x.f(); } catch (e) { console.warn('XBOOT', e); } }
        settle();
    }
    // fn : démarrage d'un module (ordre conservé : o = ancien délai en ms) ; après l'affichage, exécution immédiate
    function ready(fn, o) { if (done) { setTimeout(fn, 0); return; } Q.push({ f: fn, o: o || 0 }); }
    // travail de fond qui ne touche pas à l'interface : quand le navigateur est libre
    function idle(fn, ms) { const go = () => (window.requestIdleCallback ? requestIdleCallback(() => fn(), { timeout: 2000 }) : setTimeout(fn, 0)); if (document.readyState === 'complete') setTimeout(go, ms || 0); else addEventListener('load', () => setTimeout(go, ms || 0)); }
    // au chargement complet ; si des images / cartes distantes retardent « load », on n'attend pas plus de 1,2 s après la lecture de la page
    if (document.readyState === 'complete') setTimeout(run, 0); else { addEventListener('load', () => setTimeout(run, 0)); const dcl = () => setTimeout(run, 1200); if (document.readyState === 'interactive') dcl(); else addEventListener('DOMContentLoaded', dcl); }
    setTimeout(reveal, 3000);
    return { ready, idle, reveal, run };
})();
// 🧪 BETA : bandeau affiché uniquement sur le site d'essai (beta--suite-xiii.netlify.app), jamais sur le site public
(function () { try { if (!/^beta--/.test(location.hostname)) return; const add = () => { if (document.getElementById('xiii-beta')) return; const b = document.createElement('div'); b.id = 'xiii-beta'; b.textContent = 'BETA'; b.title = 'Site d\'essai : les modifications ne sont pas encore publiées'; b.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:2147483646;background:#f0b429;color:#1b1406;font:800 12px/1 "Segoe UI",system-ui,sans-serif;letter-spacing:.2em;padding:4px 14px 5px;border-radius:0 0 8px 8px;box-shadow:0 2px 10px rgba(0,0,0,.35);pointer-events:none'; document.body.appendChild(b); }; if (document.body) add(); else document.addEventListener('DOMContentLoaded', add); } catch (e) { } })();

// =====================================================================
//  SUITE XIII — XBUNDLE : projet complet en un seul fichier .xiii
//  Rassemble tout ce que les outils XIII ont enregistré dans ce navigateur (projets, réglages,
//  annuaire, fiches projet, photos et images en IndexedDB) et le restitue sur un autre poste.
// =====================================================================
const XBUNDLE = (() => {
    const FMT = 'xiii-bundle';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const say = m => { try { if (typeof toast === 'function') toast(m); else alert(m); } catch (e) { } };
    const b2d = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.onerror = () => r(null); f.readAsDataURL(b); });
    async function enc(v) { // Blob / ArrayBuffer → représentation JSON
        if (v instanceof Blob) return { __xb: 'blob', t: v.type, d: await b2d(v) };
        if (v instanceof ArrayBuffer) return { __xb: 'ab', d: await b2d(new Blob([v])) };
        if (Array.isArray(v)) { const o = []; for (const x of v) o.push(await enc(x)); return o; }
        if (v && typeof v === 'object' && v.constructor === Object) { const o = {}; for (const k of Object.keys(v)) o[k] = await enc(v[k]); return o; }
        return v;
    }
    async function dec(v) {
        if (v && typeof v === 'object' && v.__xb) { const r = await fetch(v.d), b = await r.blob(); return v.__xb === 'ab' ? await b.arrayBuffer() : new Blob([b], { type: v.t || b.type }); }
        if (Array.isArray(v)) { const o = []; for (const x of v) o.push(await dec(x)); return o; }
        if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = await dec(v[k]); return o; }
        return v;
    }
    const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    async function dbNames() {
        if (indexedDB.databases) { try { return (await indexedDB.databases()).map(d => d.name).filter(Boolean); } catch (e) { } }
        return ['dossierXIII', 'dossierXIIIm', 'graphicoXIII', 'moodoXIII', 'moodoXIIIm', 'reperoXIII', 'storyboardoXIII', 'storyboardoXIIIm', 'xiii-m-packingo', 'xiiiM_repero', 'xiiiLink'];
    }
    async function dumpDb(name) {
        const db = await new Promise((res, rej) => { const r = indexedDB.open(name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onupgradeneeded = () => { r.transaction.abort(); rej(new Error('absente')); }; }).catch(() => null);
        if (!db) return null; const out = { v: db.version, stores: {} };
        for (const sn of Array.from(db.objectStoreNames)) {
            const st = db.transaction(sn, 'readonly').objectStore(sn), keys = await req(st.getAllKeys()), vals = await req(db.transaction(sn, 'readonly').objectStore(sn).getAll());
            const recs = []; for (let i = 0; i < keys.length; i++) recs.push([keys[i], await enc(vals[i])]);
            out.stores[sn] = { kp: st.keyPath, ai: st.autoIncrement, idx: Array.from(st.indexNames).map(n => { const ix = st.index(n); return [n, ix.keyPath, ix.unique, ix.multiEntry]; }), recs };
        }
        db.close(); return out;
    }
    async function build(name) {
        const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && !/^xiii\.versions\./.test(k) && k !== 'xiii.drive.dev') ls[k] = localStorage.getItem(k); } // la connexion au ☁️ Drive du projet (xiii.drive) voyage avec le fichier ; l'identifiant de l'appareil, non
        const idb = {}; for (const n of await dbNames()) { if (n === 'xiiiLink') continue; try { const d = await dumpDb(n); if (d && Object.values(d.stores).some(s => s.recs.length)) idb[n] = d; } catch (e) { } }
        return { format: FMT, v: 1, name: name || 'Projet XIII', ts: Date.now(), created: new Date().toISOString(), origin: location.host, ls, idb };
    }
    async function pack(obj) {
        const txt = JSON.stringify(obj);
        if (typeof CompressionStream === 'function') { const s = new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip')); return new Blob([await new Response(s).arrayBuffer()], { type: 'application/octet-stream' }); }
        return new Blob([txt], { type: 'application/json' });
    }
    async function unpack(file) {
        const buf = await file.arrayBuffer(), u = new Uint8Array(buf);
        if (u[0] === 0x1f && u[1] === 0x8b) { if (typeof DecompressionStream !== 'function') throw new Error('Navigateur trop ancien pour lire ce fichier compressé'); const s = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip')); return JSON.parse(await new Response(s).text()); }
        return JSON.parse(new TextDecoder().decode(u));
    }
    async function restoreDb(name, d) {
        await new Promise(r => { const q = indexedDB.deleteDatabase(name); q.onsuccess = q.onerror = q.onblocked = () => r(); });
        const db = await new Promise((res, rej) => { const r = indexedDB.open(name, Math.max(1, d.v || 1)); r.onupgradeneeded = () => { const x = r.result; Object.keys(d.stores).forEach(sn => { const s = d.stores[sn], st = x.createObjectStore(sn, Object.assign({}, s.kp != null ? { keyPath: s.kp } : {}, s.ai ? { autoIncrement: true } : {})); (s.idx || []).forEach(i => { try { st.createIndex(i[0], i[1], { unique: !!i[2], multiEntry: !!i[3] }); } catch (e) { } }); }); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
        for (const sn of Object.keys(d.stores)) { const s = d.stores[sn], vals = []; for (const [k, v] of s.recs) vals.push([k, await dec(v)]); await new Promise((res, rej) => { const tx = db.transaction(sn, 'readwrite'), st = tx.objectStore(sn); vals.forEach(([k, v]) => { if (s.kp != null) st.put(v); else st.put(v, k); }); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
        db.close();
    }
    async function restore(B, mode) {
        if (!B || B.format !== FMT) throw new Error('Ce fichier n\'est pas un projet complet XIII');
        if (mode === 'replace') { const keep = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^xiii\.versions\./.test(k)) keep.push(k); } Object.keys(localStorage).forEach(k => { if (keep.indexOf(k) < 0) localStorage.removeItem(k); }); }
        Object.keys(B.ls || {}).forEach(k => { try { localStorage.setItem(k, B.ls[k]); } catch (e) { throw new Error('Stockage du navigateur plein'); } });
        for (const n of Object.keys(B.idb || {})) await restoreDb(n, B.idb[n]);
    }
    function summary(B) {
        const ls = B.ls || {}, apps = new Set(); Object.keys(ls).forEach(k => { const m = /^(?:xiii\.m\.)?([a-z]+?)(?:XIII|\.|_|$)/i.exec(k); if (m) apps.add(m[1].toLowerCase()); });
        const n = Object.keys(B.idb || {}).reduce((a, d) => a + Object.values(B.idb[d].stores).reduce((x, s) => x + s.recs.length, 0), 0);
        let dv = ''; try { const d = JSON.parse(ls['xiii.drive'] || 'null'); if (d && d.url) dv = ' · ☁️ connexion au Drive du projet incluse' + (d.code ? ' (Master)' : d.me && d.me.name ? ' (' + d.me.name + ')' : ''); } catch (e) { }
        return Object.keys(ls).length + ' enregistrements' + (n ? ' · ' + n + ' fichiers / images' : '') + dv;
    }
    function panel() {
        const old = document.getElementById('xb-ov'); if (old) old.remove();
        const o = document.createElement('div'); o.id = 'xb-ov'; o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10300;display:flex;align-items:center;justify-content:center';
        o.innerHTML = '<div style="background:var(--bg-menu,#2d2d2d);color:var(--text-main,#fff);width:540px;max-width:94vw;border-radius:8px;border:1px solid var(--border-color,#444);padding:18px;font-size:13px;line-height:1.5">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><b style="font-size:15px">📦 Projet complet XIII</b><span id="xb-x" style="cursor:pointer;font-size:18px">✕</span></div>' +
            '<p style="margin:0 0 12px;color:var(--text-dim,#aaa)">Un seul fichier <b>.xiii</b> contient tout ce que les outils de la suite ont enregistré dans ce navigateur : projets de chaque outil, fiches projet, annuaire, réglages, photos et images. Idéal pour passer d\'un ordinateur à l\'autre, archiver une production ou la confier à un collègue.</p>' +
            '<div style="display:flex;gap:8px;margin-bottom:8px"><input id="xb-n" type="text" placeholder="Nom du fichier (ex. Nuit blanche — tournage)" style="flex:1"><button id="xb-exp" style="border-color:rgba(240,179,120,.85);background:rgba(240,179,120,.25)">⬇️ Tout exporter</button></div>' +
            '<button id="xb-imp" style="width:100%;padding:9px">📂 Ouvrir un projet complet (.xiii)…</button><div id="xb-st" style="margin-top:10px"></div></div>';
        document.body.appendChild(o);
        const st = h => { o.querySelector('#xb-st').innerHTML = h; }, close = () => o.remove();
        o.querySelector('#xb-x').onclick = close; o.addEventListener('mousedown', e => { if (e.target === o) close(); });
        o.querySelector('#xb-exp').onclick = async () => {
            st('⏳ Rassemblement des données…');
            try { try { if (typeof saveProject === 'function') saveProject(false); else if (typeof saveState === 'function') saveState(false); } catch (e) { }
                const n = o.querySelector('#xb-n').value.trim() || 'Projet XIII', B = await build(n), blob = await pack(B), a = document.createElement('a');
                a.href = URL.createObjectURL(blob); a.download = n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.xiii'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
                st('✅ <b>Fichier enregistré</b> (' + Math.max(1, Math.round(blob.size / 1024)) + ' Ko) · ' + esc(summary(B)) + '.');
            } catch (e) { st('⚠️ ' + esc(e.message || e)); }
        };
        o.querySelector('#xb-imp').onclick = () => {
            const i = document.createElement('input'); i.type = 'file'; i.accept = '.xiii,.json,application/json,application/octet-stream';
            i.onchange = async () => {
                const f = i.files[0]; if (!f) return; let B;
                try { B = await unpack(f); if (!B || B.format !== FMT) throw new Error('Ce fichier n\'est pas un projet complet XIII'); } catch (e) { st('⚠️ ' + esc(e.message || e)); return; }
                st('<p style="margin:0 0 8px">« <b>' + esc(B.name) + '</b> » du ' + new Date(B.ts).toLocaleString('fr-FR') + ' · ' + esc(summary(B)) + '.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="xb-rep" style="border-color:#e57373">♻️ Remplacer tout ce navigateur</button><button id="xb-mer">➕ Fusionner (les données du fichier priment)</button></div><p style="margin:8px 0 0;color:var(--text-dim,#aaa);font-size:12px">« Remplacer » efface d\'abord les données XIII de ce navigateur. Exportez-les avant si besoin. La page se recharge à la fin.</p>');
                const go = async mode => { st('⏳ Restauration…'); try { await restore(B, mode); st('✅ Projet restauré. Rechargement…'); setTimeout(() => location.reload(), 800); } catch (e) { st('⚠️ ' + esc(e.message || e)); } };
                o.querySelector('#xb-rep').onclick = () => go('replace'); o.querySelector('#xb-mer').onclick = () => go('merge');
            };
            i.click();
        };
    }
    return { build, pack, unpack, restore, panel };
})();

// =====================================================================
//  SUITE XIII — visite guidée commune (XTOUR)
//  Au premier lancement de chaque outil : mise en lumière de chaque zone / groupe de boutons, le reste de l'écran est assombri.
//  Boutons « Passer le tuto » / « Tuto suivant », case « Ne plus afficher ». Relance : ⚙️ Paramètres → Aide → Visite guidée.
// =====================================================================
const XTOUR = (() => {
    const APP = (location.pathname.split('/').pop() || 'index').replace(/\.html?$/i, '') || 'index';
    let KEY = 'xiii.tour2.' + APP + '.hide'; // v2 : l'ancienne clé avait été posée d'office pour tout le monde
    const T = {
        // textes propres à chaque outil : intro + description des grandes zones
        syno: { n: 'SYNO XIII', i: 'Dessinez le synoptique complet de votre régie : équipements, entrées / sorties, câbles et formats de signal.', lib: 'La bibliothèque : vos modèles d\'équipements et la <b>Base de données</b> (≈450 appareils avec leurs IN / OUT nommés). « + Insérer » pose un équipement sur le plan.', ws: 'Le plan de travail : glissez les équipements, tirez un câble d\'une sortie (à droite) vers une entrée (à gauche), molette pour zoomer, clic droit pour les options.' },
        plano: { n: 'PLANO XIII', i: 'Dessinez le plan d\'implantation du plateau : caméras, lumières, décor, mobilier, avec les angles et les distances.', lib: 'La bibliothèque d\'éléments par catégorie (caméras, lumière, mobilier, décor…). Glissez-déposez sur le plan.', ws: 'Le plan : déplacez, faites pivoter, mesurez. Molette pour zoomer, espace + glisser pour se déplacer.' },
        conduco: { n: 'CONDUCO XIII', i: 'Construisez le conducteur de vos émissions live et captations, séquence par séquence, avec le minutage.', lib: 'Les éléments types à ajouter au conducteur (séquences, plateaux, sujets, pubs…).', ws: 'Le conducteur : chaque ligne est une séquence, avec durée, cumul et horaires. Le mode On Air suit le direct.' },
        callsheeto: { n: 'CALL SHEETO XIII', i: 'Préparez la feuille de service : équipe, horaires, lieux, accès, contacts d\'urgence, météo.', lib: 'L\'annuaire et les éléments à ajouter à la feuille de service.', ws: 'La feuille de service, mise en page et prête à partager ou à imprimer.' },
        packingo: { n: 'PACKINGO XIII', i: 'Organisez le colisage et le chargement : flight cases, matériel, poids, volumes et check-in / check-out.', lib: 'Le matériel et les types de flight cases à ranger.', ws: 'Les colis et leur contenu, avec poids et volumes calculés.' },
        backupo: { n: 'BACKUPO XIII', i: 'Estimez l\'espace disque des rushes et tracez chaque déchargement de carte (checksums, caméras, dossiers).', lib: 'Les caméras, codecs et sources à ajouter.', ws: 'Le calcul d\'espace et le journal des déchargements.' },
        deviso: { n: 'DEVISO XIII', i: 'Construisez un devis estimatif : matériel loué, équipe technique, frais, avec les grilles de tarifs.', lib: 'La base de prix : matériel des loueurs et postes de l\'équipe, à ajouter au devis.', ws: 'Le devis : lignes, quantités, jours, remises et totaux.' },
        ressourco: { n: 'RESSOURCO XIII', i: 'Générez en lot les documents du dossier (contrats, autorisations, attestations…) à partir de modèles.', lib: 'Les modèles de documents disponibles.', ws: 'Le document en cours, ses champs et l\'aperçu.' },
        cadro: { n: 'CADRO XIII', i: 'Anticipez le cadre : focale, champ, profondeur de champ, monture et adaptateur, risque de moiré sur écran.', lib: 'Les capteurs de caméra (et les vôtres).', ws: 'Réglages à gauche, schémas et calculs expliqués à droite.' },
        repero: { n: 'REPERO XIII', i: 'Repérez un lieu sur la carte : soleil, bruit, secours, commerces, zones de drones, fréquences, droit à l\'image.', lib: 'Les couches d\'informations et vos repères.', ws: 'La carte : cliquez pour placer un repère, les analyses s\'affichent autour.' },
        dossier: { n: 'DOSSIER XIII', i: 'Rassemblez tout le projet en un dossier de production / dossier technique, avec les documents envoyés par les autres outils.', lib: 'Les sections et pièces du dossier.', ws: 'Le dossier : page de garde, sections, textes (avec brouillon IA) et pièces jointes.' },
        moodo: { n: 'MOODO XIII', i: 'Structurez toutes les idées en planches : personnages, lieux, direction artistique, lumière, costumes.', lib: 'Les types de cartes et les sources d\'inspiration.', ws: 'La planche : glissez-déposez images, palettes et fiches.' },
        storyboardo: { n: 'STORYBOARDO XIII', i: 'Dessinez chaque plan avec des personnages articulés, du mobilier et des flèches de caméra, puis l\'animatique.', lib: 'Personnages, poses, mobilier, décors et éléments à poser dans le plan.', ws: 'Le plan en cours, la planche et l\'animatique.' },
        scripto: { n: 'SCRIPTO XIII', i: 'Écrivez et suivez le script de tournage : séquences, dialogues, continuité.', lib: 'Les éléments du script (séquences, personnages, lieux).', ws: 'Le script, mis en forme et minuté.' },
        decoup: { n: 'DECOUP TECHNICO XIII', i: 'Le découpage technique plan par plan, minuté au timecode : valeur, angle, mouvement, focale, transition.', lib: 'Les valeurs de plan, mouvements et transitions.', ws: 'Le découpage, séquence par séquence.' },
        graphico: { n: 'GRAPHICO XIII', i: 'Créez vos habillages TV et overlays live, animez-les, puis pilotez-les depuis le pupitre vers OBS, vMix, TriCaster ou en NDI.', lib: 'Les modèles (≈110), les éléments de base et les graphiques de votre projet.', ws: 'Selon la vue : éditeur (scène, timeline, propriétés), pupitre (IN / OUT, conducteur) ou adresses des sorties.' },
        index: { n: 'SUITE XIII', i: 'La suite d\'outils de production audiovisuelle : de la conception au dossier final, avec toute l\'équipe.', steps: [
            [null, '👋 Bienvenue dans SUITE XIII', '<p>Une trentaine d\'outils pour préparer, organiser, tourner et livrer un projet audiovisuel, <b>dans le navigateur</b>, sans installation.</p><p>Ce grand tuto fait le tour de l\'accueil : le projet, les outils, l\'équipe, le Drive, l\'application mobile. Comptez 2 minutes. Chaque outil a ensuite sa propre visite à sa première ouverture.</p>'],
            [() => btn('Projet XIII'), '🎬 Le projet', '<p>La <b>fiche projet</b> est partagée par tous les outils : titre, dates, lieux, production, logo.</p><ul><li><b>＋ Nouveau projet</b> : un assistant pas à pas</li><li><b>📦 Fichier</b> : enregistrer / ouvrir tout le projet en un seul fichier <b>.xiii</b>, ou <b>📥 Importer d\'un logiciel</b> (Excel, Movie Magic, PDF…)</li><li>Personnalisation : thème, outils masqués, photo de fond</li></ul>'],
            ['#xd-dash', '📊 Le tableau de bord', '<p>L\'essentiel du projet en un coup d\'œil : <b>projet en cours</b>, <b>prochaines échéances</b> (toutes les dates des outils), <b>derniers retours de l\'équipe</b> et <b>message du Master</b> affiché à tous.</p>'],
            [() => document.getElementById('xh-nav') || document.querySelector('section.phase'), '🧰 Les onglets et les outils', '<p>Les onglets de gauche (en bas sur téléphone) : <b>📊 Dashboard</b> (widgets et outils épinglés), un onglet par étape — <b>concevoir</b>, <b>organiser</b>, <b>tourner</b>, <b>livrer</b> —, <b>⚙️ Réglages</b> du projet et <b>👥 Équipe</b> (Master). Cliquez une tuile pour ouvrir l\'outil, clic droit pour l\'épingler au Dashboard.</p><p>Les outils <b>se parlent</b> : dans chaque outil, <b>📤 Vers Suite XIII</b> envoie son travail vers les autres (devis, feuille de service, colisage, dossier…).</p>'],
            [() => btn('Rechercher'), '🔎 Recherche', '<p><b>Ctrl K</b> (ou ⌘ K) depuis n\'importe où : un outil, un élément, une personne, une action.</p>'],
            [() => btn('Drive'), '☁️ Le Drive du projet', '<p>Relie le projet au <b>Google Drive du Master</b> : tout le monde travaille sur les mêmes données, sans compte, avec la synchronisation, la présence en direct (pastilles), le verrou des éléments modifiés, le journal et les rapports de fin de journée.</p>'],
            [() => btn('Équipe'), '👥 L\'équipe', '<p>Toute la gestion de l\'équipe :</p><ul><li><b>Membres</b> : noms, secteurs, droits, outils (et vues précises), fin d\'accès</li><li><b>En attente</b> : les demandes à valider</li><li><b>Secteurs</b> : à créer et renommer</li><li><b>Liens & QR</b> : connecter une personne, un secteur, votre téléphone, la <b>vitrine client</b>, les <b>écrans kiosque</b></li><li><b>Échanges</b> : délégations et envois</li></ul>'],
            ['#xp-btn', '📲 Application et mobile', '<p>Installez la suite comme une application (hors ligne possible), et l\'<b>application mobile XIII</b> sur le téléphone de chacun : échanges, mentions, colisage, photos de repérage, dépenses, signatures…</p>'],
            ['#xs-gear', '⚙️ Paramètres et aide', '<p>Thème, sauvegarde automatique, versions, notifications… et la rubrique <b>Aide</b> : relancer ce tuto, et <b>chercher un tuto par mot-clé</b> (« devis », « QR », « signature »…).</p>'],
            [null, '✅ À vous de jouer', '<p>Commencez par <b>🎬 Projet XIII → ＋ Nouveau projet</b>, puis ouvrez le premier outil utile. Partout : <b>survolez un bouton</b> pour son info-bulle, <b>🔗 Partager</b> pour envoyer, <b>💬 Avis</b> et <b>@Prénom</b> pour échanger.</p><p>Ce tuto se relance dans <b>⚙️ Paramètres → Aide</b>.</p>']] },
        projet: { n: 'Projet XIII', steps: [ // 🎓 tuto de la fiche projet, à la première ouverture
            [null, '🎬 La fiche projet', '<p>Une seule fiche pour tout le projet : <b>tous les outils la reprennent</b> (feuille de service, devis, dossier, repérages…). Remplissez ce que vous savez, le reste peut attendre.</p>'],
            ['#xpj-g', '🧭 Informations globales', '<p>Type de projet, titre, dates de tournage, production, réalisation, contact : la base de tous les documents.</p>'],
            ['#xpj-l', '📍 Lieux', '<p>Ajoutés à chaque journée de CALL SHEETO et aux lieux à repérer dans REPERO.</p>'],
            ['#xpj-t', '🎥 Technique', '<p>Caméras, optiques, cadence, format : repris par CADRO, STORYBOARDO, PLANO et BACKUPO.</p>'],
            ['#xpj-h', '👥 Équipe', '<p>Ajoutée à la feuille de service et à l\'annuaire XIII.</p>'],
            ['#xpj-p', '🖼️ Personnalisation', '<p>Thème, outils masqués, photo de fond : pour toute l\'équipe, par le ☁️ Drive.</p>'],
            ['#xpj-f', '📦 Fichier du projet', '<p>Tout le projet en <b>un seul fichier .xiii</b> (à envoyer, archiver, rouvrir), et <b>📥 Importer d\'un logiciel</b>.</p>']] },
        team: { n: 'ÉQUIPE XIII', when: () => !!document.querySelector('nav [data-t=wait]') && !/Chargement/.test((document.getElementById('m') || {}).textContent || ''), steps: [
            [null, '👥 La page Équipe', '<p>Toute l\'équipe du projet, ses accès et ses échanges, gérés par le <b>Master</b> (et les Sous-Masters).</p>'],
            ['nav [data-t=mem]', '👥 Membres', '<p>Chaque personne : <b>renommez</b> d\'un clic sur le nom, choisissez ses <b>secteurs</b> (plusieurs possibles), son <b>droit</b>, ses <b>outils</b> (avec l\'<b>autorisation précise</b> : seulement certains onglets), une <b>fin d\'accès</b>, son <b>QR personnel</b> 📲, ou retirez l\'accès 🚫. Tout s\'applique chez elle sans nouveau lien.</p>'],
            ['nav [data-t=wait]', '⏳ En attente', '<p>Les personnes entrées par le <b>lien général</b> attendent ici : vérifiez leur nom, choisissez secteurs et droit, puis <b>Valider</b>.</p>'],
            ['nav [data-t=sec]', '🏷️ Secteurs', '<p>Créez, renommez, ordonnez les secteurs (Image, Son, Régie, Client…).</p>'],
            ['nav [data-t=link]', '📲 Liens & QR', '<p>Nouveau membre (nom imposé), <b>lien général</b> (chacun donne son nom), <b>QR de secteur</b>, <b>vitrine client</b>, <b>écrans kiosque</b> et <b>votre téléphone</b>.</p>'],
            ['nav [data-t=ex]', '💬 Échanges', '<p>Délégations envoyées et reçues, travaux à importer, envois vers DOSSIER.</p>']] },
        drive: { n: 'DRIVE XIII', steps: [
            [null, '☁️ Le Drive du projet', '<p>Les données du projet vivent dans le <b>Google Drive du Master</b> : chacun travaille sur la même version, sans compte. Le Master installe une fois le script Google, puis invite l\'équipe.</p>'],
            ['#rap', '📨 Rapport de fin de journée', '<p>Chaque soir de tournage, un e-mail à la production : horaires, arrivées, plans, rushes, dépenses.</p>'],
            ['#jr', '📜 Journal du projet', '<p>Qui a modifié quel outil, et quand. Chaque version peut être consultée.</p>']] },
        equipe: { n: 'XIII Équipe', mobile: true, when: () => !!document.getElementById('tb'), steps: [
            [null, '📱 L\'application de l\'équipe', '<p>Tout le tournage dans votre poche : outils en consultation, outils de terrain et échanges avec l\'équipe.</p>'],
            ['#tb [data-t=ex]', '💬 Échanges', '<p>Les avis laissés dans les outils (répondez directement, <b>@Prénom</b> pour mentionner) et vos messages au Master.</p>'],
            ['#tb [data-t=me]', '📣 Mentions', '<p>Quand quelqu\'un vous mentionne, c\'est ici (le compteur rouge vous prévient).</p>'],
            ['#tb [data-t=act]', '🔄 Activité', '<p>Qui a mis à jour quel outil, et quand.</p>'],
            [() => document.querySelector('.grid'), '🧰 Outils', '<p>Les outils du tournage, et dessous les <b>outils de terrain</b> : colisage, photos, casting, viseur, matos, retours client, dossier, documents et signatures, dépenses.</p>']] },
        ludo: { n: 'LUDO XIII', i: 'La pause : quelques jeux pour souffler entre deux prises.', lib: 'Les jeux disponibles.', ws: 'L\'aire de jeu.' }
    };
    let cfg = T[APP] || { n: (document.title || APP).split(' - ')[0], i: 'Bienvenue dans cet outil de la SUITE XIII.', lib: 'La bibliothèque d\'éléments.', ws: 'La zone de travail.' };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const vis = el => { if (!el || !el.isConnected) return false; const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
    const hidden = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };

    function describeButtons(box) {
        const seen = new Set(), items = [];
        box.querySelectorAll('button, select, input[type=text], input[type=search]').forEach(b => {
            if (!vis(b) || b.closest('#xt-root')) return;
            const ic = b.querySelector('.btn-icon'), lb = b.querySelector('.btn-label');
            let label = b.tagName === 'SELECT' ? '▾ Liste' : b.tagName === 'INPUT' ? '✎ ' + (b.placeholder || 'Champ') : ((ic ? ic.textContent.trim() : '') + ' ' + (lb ? lb.textContent.trim() : (ic ? '' : b.textContent.trim()))).trim();
            const tip = (b.getAttribute('title') || b.getAttribute('aria-label') || '').trim();
            if (!label && !tip) return; const k = label + '|' + tip; if (seen.has(k)) return; seen.add(k);
            items.push('<li><b>' + esc(label.slice(0, 40) || '•') + '</b>' + (tip && tip !== label ? ' — ' + esc(tip) : '') + '</li>');
        });
        return items;
    }
    const btn = t => Array.from(document.querySelectorAll('#top-bar button, #top-bar a')).find(b => vis(b) && (b.textContent || '').indexOf(t) > -1) || null;
    function buildSteps() {
        const S = [];
        if (cfg.steps) { cfg.steps.forEach(([sel, t, h]) => { const el = sel == null ? null : typeof sel === 'function' ? sel() : document.querySelector(sel); if (sel == null || vis(el)) S.push({ el, t, h }); }); return S; }
        S.push({ el: null, t: '👋 Bienvenue dans ' + cfg.n, h: '<p>' + cfg.i + '</p><p>Cette visite présente chaque zone et chaque groupe de boutons. <b>Tuto suivant</b> pour avancer, <b>Passer le tuto</b> pour commencer directement.</p>' });
        const add = (sel, t, h) => { const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (vis(el)) S.push({ el, t, h }); };
        add('#tabs-container', '🗂️ Onglets / projet', '<p>Vos projets ouverts. Cliquez pour changer de projet, double-cliquez sur le nom pour le renommer ou modifier ses réglages.</p>');
        // barre du haut et barre d'outils : un arrêt par groupe de boutons
        [['#top-bar', '⬆️ Barre du haut'], ['#toolbar', '🧰 Barre d\'outils']].forEach(([sel, name]) => {
            const bar = document.querySelector(sel); if (!vis(bar)) return;
            let groups = Array.from(bar.querySelectorAll('.btn-group')).filter(vis);
            const loose = Array.from(bar.querySelectorAll('button, select')).filter(b => vis(b) && !b.closest('.btn-group') && !b.closest('#tabs-container'));
            groups.forEach((g, i) => { const it = describeButtons(g); if (it.length) S.push({ el: g, t: name + (groups.length > 1 ? ' · ' + (i + 1) + '/' + groups.length : ''), h: '<ul>' + it.slice(0, 10).join('') + '</ul>' }); });
            if (loose.length) { const box = document.createElement('div'); loose.forEach(b => box.appendChild(b.cloneNode(true))); document.body.appendChild(box); box.style.cssText = 'position:fixed;left:-9999px;top:0'; const it = []; loose.forEach(b => { const tip = (b.getAttribute('title') || '').trim(), lab = b.textContent.trim().slice(0, 40); if (tip || lab) it.push('<li><b>' + esc(lab || '•') + '</b>' + (tip && tip !== lab ? ' — ' + esc(tip) : '') + '</li>'); }); box.remove(); if (it.length && !groups.length) S.push({ el: bar, t: name, h: '<ul>' + it.slice(0, 12).join('') + '</ul>' }); else if (it.length) loose.slice(0, 6).forEach(b => { const tip = b.getAttribute('title'); if (tip && vis(b)) S.push({ el: b, t: name, h: '<p><b>' + esc(b.textContent.trim().slice(0, 40)) + '</b> — ' + esc(tip) + '</p>' }); }); }
        });
        add('#library-panel', '📚 Panneau de gauche', '<p>' + cfg.lib + '</p><p>Le bouton ◀ de la barre d\'outils le masque pour agrandir la zone de travail.</p>');
        add('#lib-categories-bar', '🏷️ Catégories', '<p>Les onglets colorés filtrent la bibliothèque par catégorie.</p>');
        add('#lib-search', '🔎 Recherche', '<p>Tapez quelques lettres pour retrouver un élément dans la bibliothèque.</p>');
        add('#ws-stats', '📊 Compteurs', '<p>Les chiffres clés du projet, mis à jour en direct.</p>');
        add(document.querySelector('#content') || document.querySelector('#workspace-container'), '🖥️ Zone de travail', '<p>' + cfg.ws + '</p>');
        add('#xs-gear', '⚙️ Paramètres', '<p>Thème clair / sombre, valeurs par défaut de l\'outil, guide complet' + (window.XAI ? ', <b>connexion IA</b>' : '') + ' et <b>Visite guidée</b> pour revoir ce tutoriel à tout moment.</p>');
        S.push({ el: null, t: '✅ C\'est parti !', h: '<p>Vous connaissez l\'essentiel. Survolez un bouton pour revoir son rôle (info-bulle) et retrouvez cette visite dans <b>⚙️ Paramètres → Aide → Visite guidée</b>.</p><p>Cochez <b>Ne plus afficher</b> pour qu\'elle ne revienne pas à la prochaine ouverture.</p>' });
        return S;
    }

    let root = null, steps = [], idx = 0, onKey = null, onRe = null;
    function css() {
        if (document.getElementById('xtour-css')) return; const st = document.createElement('style'); st.id = 'xtour-css';
        st.textContent = '#xt-root{position:fixed;inset:0;z-index:2147483000;font:13px "Segoe UI",Tahoma,Verdana,sans-serif;color:#fff}' +
            '#xt-block{position:fixed;inset:0;background:transparent}' +
            '#xt-hole{position:fixed;border-radius:10px;box-shadow:0 0 0 200vmax rgba(5,5,10,.74);outline:2px solid rgba(240,179,120,.95);outline-offset:2px;transition:all .25s ease;pointer-events:none}' +
            '#xt-hole.center{left:50%!important;top:42%!important;width:0!important;height:0!important;outline:none}' +
            '#xt-pop{position:fixed;max-width:380px;min-width:260px;background:#26262b;border:1px solid rgba(240,179,120,.7);border-radius:12px;padding:14px 16px;box-shadow:0 10px 40px rgba(0,0,0,.6);transition:left .25s,top .25s}' +
            '#xt-pop h4{margin:0 0 8px;font-size:15px;color:rgb(240,179,120)}#xt-pop p{margin:6px 0;line-height:1.5;color:#ddd}#xt-pop ul{margin:4px 0;padding-left:18px;line-height:1.5;color:#ddd;max-height:46vh;overflow:auto}#xt-pop li{margin:2px 0}#xt-pop b{color:#fff}' +
            '#xt-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;background:#1c1c20;border:1px solid #444;border-radius:14px;padding:10px 14px;box-shadow:0 8px 30px rgba(0,0,0,.6);white-space:nowrap}' +
            '#xt-bar button{font:600 13px "Segoe UI",sans-serif;color:#fff;border-radius:9px;padding:9px 16px;cursor:pointer;border:1px solid #555;background:#333}#xt-bar button:hover{border-color:rgb(240,179,120)}' +
            '#xt-bar .nx{background:rgba(240,179,120,.35);border-color:rgb(240,179,120)}#xt-bar .pv{padding:9px 11px;display:inline-block;height:auto;width:auto;grid-template-columns:none}#xt-bar button,#xt-bar label,#xt-bar .ct{flex:0 0 auto;width:auto;height:auto;margin:0}#xt-bar label{display:flex;gap:6px;align-items:center;color:#ccc;cursor:pointer;font-size:12.5px}#xt-bar .ct{color:#999;font-size:12px;min-width:44px;text-align:center}' +
            '@media (max-width:700px){#xt-bar{flex-wrap:wrap;justify-content:center;width:calc(100% - 32px);white-space:normal}#xt-pop{max-width:calc(100vw - 32px)}}';
        document.head.appendChild(st);
    }
    function place() {
        if (!root) return; const s = steps[idx], hole = root.querySelector('#xt-hole'), pop = root.querySelector('#xt-pop'), bar = root.querySelector('#xt-bar');
        const W = innerWidth, H = innerHeight, barH = bar.getBoundingClientRect().height + 30;
        if (!s.el || !vis(s.el)) { hole.className = 'center'; hole.style.cssText = ''; pop.style.left = Math.max(16, (W - pop.offsetWidth) / 2) + 'px'; pop.style.top = Math.max(16, (H - barH - pop.offsetHeight) / 2) + 'px'; return; }
        hole.className = ''; const r = s.el.getBoundingClientRect(), p = 6;
        const x = Math.max(4, r.left - p), y = Math.max(4, r.top - p), w = Math.min(W - 8, r.right + p) - x, h = Math.min(H - 8, r.bottom + p) - y;
        hole.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
        const pw = pop.offsetWidth, ph = pop.offsetHeight, m = 14; let L, Tp;
        if (x + w + m + pw < W - 8) { L = x + w + m; Tp = y; }                // à droite
        else if (x - m - pw > 8) { L = x - m - pw; Tp = y; }                  // à gauche
        else if (y + h + m + ph < H - barH) { L = x; Tp = y + h + m; }        // dessous
        else if (y - m - ph > 8) { L = x; Tp = y - m - ph; }                  // dessus
        else { L = (W - pw) / 2; Tp = Math.max(8, H - barH - ph - 10); }     // à défaut : au-dessus de la barre
        pop.style.left = Math.max(8, Math.min(W - pw - 8, L)) + 'px'; pop.style.top = Math.max(8, Math.min(H - barH - ph, Tp)) + 'px';
    }
    function show(i) {
        idx = Math.max(0, Math.min(steps.length - 1, i)); const s = steps[idx];
        if (s.el && s.el.scrollIntoView) { try { s.el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { } }
        root.querySelector('#xt-pop').innerHTML = '<h4>' + s.t + '</h4>' + s.h;
        root.querySelector('.ct').textContent = (idx + 1) + ' / ' + steps.length;
        root.querySelector('.pv').disabled = idx === 0; root.querySelector('.nx').textContent = idx === steps.length - 1 ? 'Terminer ✓' : 'Tuto suivant ▶';
        place(); requestAnimationFrame(place);
    }
    function end() {
        if (!root) return; const ck = root.querySelector('#xt-hide'); try { if (ck && ck.checked) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) { }
        root.remove(); root = null; document.removeEventListener('keydown', onKey, true); removeEventListener('resize', onRe); removeEventListener('scroll', onRe, true);
    }
    function start(force) {
        if (root) return; css(); steps = buildSteps(); if (!steps.length) return;
        root = document.createElement('div'); root.id = 'xt-root';
        root.innerHTML = '<div id="xt-block"></div><div id="xt-hole"></div><div id="xt-pop" role="dialog" aria-live="polite"></div><div id="xt-bar"><label><input type="checkbox" id="xt-hide"' + (hidden() ? ' checked' : '') + '> Ne plus afficher</label><span class="ct"></span><button class="pv" title="Étape précédente">◀</button><button class="sk">Passer le tuto</button><button class="nx">Tuto suivant ▶</button></div>';
        document.body.appendChild(root);
        root.querySelector('.sk').onclick = end; root.querySelector('.nx').onclick = () => { if (idx >= steps.length - 1) end(); else show(idx + 1); }; root.querySelector('.pv').onclick = () => show(idx - 1);
        root.querySelector('#xt-hide').onchange = e => { try { if (e.target.checked) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (x) { } };
        onKey = e => { if (!root) return; if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); end(); } else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); root.querySelector('.nx').click(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); show(idx - 1); } else if (e.key !== 'Tab') e.stopPropagation(); };
        onRe = () => place(); document.addEventListener('keydown', onKey, true); addEventListener('resize', onRe); addEventListener('scroll', onRe, true);
        show(0);
    }
    function auto() {
        const q = location.search;
        if (/[#&]xtour=projet/.test(location.hash) && typeof XPROJET !== 'undefined') { history.replaceState(null, '', location.pathname); setTimeout(() => { XPROJET.open(); setTimeout(() => run('projet', T.projet, true), 300); }, 1500); return; }
        if (/[#&]xtour\b/.test(location.hash)) { history.replaceState(null, '', location.pathname + location.search); let n = 0; const go = () => { if (cfg.when && !cfg.when() && ++n < 40) { setTimeout(go, 500); return; } start(true); }; setTimeout(go, 1500); return; } // lien « tuto » depuis la recherche d'aide
        if (/[#&](j|join|ci|k)=/.test(location.hash) || /^(caisse|arrivee|kiosque|direct|vitrine)$/.test(APP)) return; // liens d'invitation / pages publiques : jamais de tuto par-dessus
        const inShell = (() => { try { return window.parent === window.top && /espace\.html?$/i.test(window.parent.location.pathname); } catch (e) { return false; } })(); // outil ouvert dans un onglet de la suite
        if (hidden() || (window.top !== window && !inShell) || /[?&](out|view|share|consult|print|embed)=/i.test(q) || /-m\.html?$/i.test(location.pathname) || (innerWidth < 760 && !cfg.mobile)) return;
        if (document.body.classList.contains('out-mode') || document.body.classList.contains('presentation-mode')) return;
        // attend qu'aucune fenêtre (accueil, reprise de projet…) ne soit ouverte avant de démarrer
        const isGuide = e => /^\s*📖\s*Guide/.test(((e.querySelector && e.querySelector('h2,h3')) || {}).textContent || ''); // guide ouvert d'office sur un outil vide : la visite passe devant
        const closeGuide = () => Array.from(document.querySelectorAll('.modal-overlay, #modal, #modal-ov')).filter(e => vis(e) && isGuide(e)).forEach(e => { const x = e.querySelector('.close-x,[data-x],.close,.modal-close'); if (x) x.click(); else if (typeof closeModal === 'function') closeModal(); else e.style.display = 'none'; });
        const busy = () => Array.from(document.querySelectorAll('.modal-overlay, #modal, #xs-ov, #xai-ov, #xnw-ov, #xmt-ov, #xfin, #xg-ov, [role=dialog]')).some(e => !e.closest('#xt-root') && vis(e) && e.getBoundingClientRect().width > innerWidth * .4 && !isGuide(e) && !(e.closest('.modal-overlay, #modal, #modal-ov') && isGuide(e.closest('.modal-overlay, #modal, #modal-ov'))));
        let tries = 0; const wait = () => { if (root || hidden()) return; if (!busy() && (!cfg.when || cfg.when())) { try { localStorage.setItem(KEY, '1'); } catch (e) { } closeGuide(); start(); } else if (++tries < 600) setTimeout(wait, 700); };
        setTimeout(wait, 1400);
    }
    if (document.readyState === 'complete') auto(); else addEventListener('load', auto);
    // tuto d'une page / fenêtre précise (fiche projet, Équipe, Drive, application…) : une fois, à la première ouverture
    function run(key, def, force) {
        const K2 = 'xiii.tour2.' + key + '.hide'; let h = false; try { h = localStorage.getItem(K2) === '1'; } catch (e) { } if ((h && !force) || root) return false;
        const old = [cfg, KEY]; cfg = def; KEY = K2; try { localStorage.setItem(K2, '1'); } catch (e) { }
        setTimeout(() => { start(); const back = () => { if (root) { setTimeout(back, 500); return; } cfg = old[0]; KEY = old[1]; }; setTimeout(back, 500); }, 350); return true;
    }
    // 🔎 tuto par recherche : mots-clés → bon tuto (outil, page ou fenêtre)
    const TOPICS = [
        ['index', 'Accueil de la suite', 'accueil tableau de bord outils recherche demarrer debuter commencer suite'],
        ['projet', 'Fiche projet', 'projet fiche titre dates lieux camera technique equipe fichier xiii importer import logiciel excel movie magic nouveau projet personnalisation fond theme'],
        ['team', 'Équipe : membres, accès, QR', 'equipe membre secteur droit acces autorisation invite inviter qr lien general attente valider sous-master retirer fin vitrine client kiosque ecran telephone connecter'],
        ['drive', 'Drive du projet', 'drive google synchronisation synchro partage master script installer rapport journal version sauvegarde'],
        ['equipe', 'Application mobile de l\'équipe', 'mobile telephone application app installer notifications mention message master depense ticket photo colisage scan viseur'],
        ['syno', 'SYNO — synoptique', 'synoptique cable cablage signal sdi hdmi regie connecteur equipement schema'], ['plano', 'PLANO — plan d\'implantation', 'plan sol implantation plateau camera lumiere decor distance angle fond de plan'],
        ['conduco', 'CONDUCO — conducteur', 'conducteur emission direct live prompteur minutage sequence regie horloge partager direct'], ['callsheeto', 'CALL SHEETO — feuille de service', 'feuille de service convocation horaire equipe journee meteo hopital acces'],
        ['packingo', 'PACKINGO — colisage', 'colisage caisse flight case etiquette qr chargement poids volume verification'], ['backupo', 'BACKUPO — rushes', 'rushes carte dechargement sauvegarde copie checksum disque codec debit taille'],
        ['deviso', 'DEVISO — devis et budget', 'devis budget tarif prix location facture depense reel ticket tva'], ['ressourco', 'RESSOURCO — documents', 'contrat document autorisation droit image signature signer attestation modele'],
        ['cadro', 'CADRO — cadre et optiques', 'focale objectif capteur champ profondeur moire cadre viseur'], ['repero', 'REPERO — repérages', 'reperage lieu carte soleil bruit drone photo gps autorisation'],
        ['dossier', 'DOSSIER — dossier de production', 'dossier pdf final production chapitre rubrique page de garde candidature'], ['moodo', 'MOODO — moodboard', 'moodboard planche intention reference image palette inspiration'],
        ['storyboardo', 'STORYBOARDO — storyboard', 'storyboard dessin plan personnage animatique case'], ['scripto', 'SCRIPTO — script', 'script scripte continuite raccord prise plan tourne rapport'],
        ['decoup', 'DECOUP — découpage technique', 'decoupage technique plan valeur mouvement transition'], ['posto', 'POSTO — post-production', 'post production montage version retour client livrable derushage archive etalonnage'],
        ['casto', 'CASTO — casting', 'casting talent comedien role candidat cachet disponibilite'], ['transporto', 'TRANSPORTO — logistique', 'transport navette hotel chambre voyage vehicule logistique'],
        ['calendrier', 'CALENDRIER — planning', 'calendrier planning production date tache jalon gantt'], ['matos', 'MATOS — parc matériel', 'matos materiel parc reservation sortie retour scan catalogue inventaire'],
        ['lumo', 'LUMO — lumière', 'lumiere projecteur plan de feu dmx'], ['sono', 'SONO — son', 'son patch micro hf console audio'], ['runo', 'RUNO — déroulé live', 'deroule live run of show'], ['soustitro', 'SOUSTITRO — sous-titres', 'sous-titres srt traduction live ndi'], ['encodo', 'ENCODO — convertisseur', 'convertir conversion encoder encodage format codec h264 h265 prores dnxhr mp4 mov wav mp3 pdf image compresser shutter format factory'], ['graphico', 'GRAPHICO — habillage', 'habillage graphique overlay ndi obs vmix synthe'], ['jour', 'MODE TOURNAGE', 'tournage jour j check-in arrivee qr kiosque regie']];
    const fold = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    function search(q) { const W = fold(q).split(/[^a-z0-9]+/).filter(w => w.length > 1); if (!W.length) return []; return TOPICS.map(t => { const hay = fold(t[1] + ' ' + t[2] + ' ' + ((T[t[0]] || {}).i || '')); let sc = 0; W.forEach(w => { if (hay.indexOf(w) > -1) sc += (fold(t[1]).indexOf(w) > -1 ? 3 : 1); else if (w.length > 3 && hay.indexOf(w.slice(0, -1)) > -1) sc += .5; }); return [sc, t]; }).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 8).map(x => x[1]); }
    function go(k) { if (k === APP) { start(true); return; } if (k === 'projet') { if (APP === 'index' && typeof XPROJET !== 'undefined') { XPROJET.open(); setTimeout(() => run('projet', T.projet, true), 300); } else location.href = 'index.html#xtour=projet'; return; } location.href = (k === 'index' ? 'index' : k) + '.html#xtour'; }
    return { start, run, T, search, go, TOPICS, app: APP, reset() { try { localStorage.removeItem(KEY); } catch (e) { } } };
})();

// 📱 XIII Équipe : une fois dans l'application, on y reste (l'accueil ramène à l'application, pas au site)
(function () {
    if (window.__xinapp) return; window.__xinapp = 1;
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    try { if (page === 'equipe.html' && (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(display-mode: standalone)').matches))) sessionStorage.setItem('xiii.inapp', '1'); } catch (e) { }
    function inApp() { try { return sessionStorage.getItem('xiii.inapp') === '1'; } catch (e) { return false; } }
    if (!inApp()) return;
    if (page === 'index.html' || page === '') { location.replace('equipe.html'); return; }
    document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
        var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (er) { return; }
        if (u.origin !== location.origin) return;
        var f = (u.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (f === 'index.html' || f === '') { e.preventDefault(); e.stopPropagation(); location.href = 'equipe.html'; return; }
        if (a.target === '_blank') { a.removeAttribute('target'); }
    }, true);
})();

