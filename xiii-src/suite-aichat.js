// =====================================================================
//  SUITE XIII — XAIC : ✨ assistant IA (avec l'IA de l'utilisateur, ⚙️ › Intelligence artificielle)
//  Bouton « ✨ IA » dans la barre du haut (à droite du ＋ de l'outil) — visible seulement quand une IA est connectée.
//  Volet à droite : conversation gardée par projet XIII, contexte (outil ouvert, projet, date), copier une réponse.
//  Rien ne part tant que l'utilisateur n'envoie pas de message ; l'équipe n'est jamais envoyée si l'option est cochée.
// =====================================================================
var XAIC = window.XAIC || (() => {
    if (/[?&](xrun|xmodel|xvit|embed)=/.test(location.search)) return {};
    const APP = '__APP__', J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ok = () => typeof XAI !== 'undefined' && XAI.configured && XAI.configured();
    function proj() { const s = J('xiii.projets', null) || {}, id = s.active || '_', L = s.list || s.projets || s.items || []; const p = Array.isArray(L) ? L.find(x => x && (x.id === id)) : (L[id] || null); return { id, title: (p && (p.title || p.name || p.titre)) || '' }; }
    const KEY = () => 'xiii.aichat.' + proj().id, msgs = () => J(KEY(), []), save = L => W(KEY(), L.slice(-60));
    const nm = () => (typeof XLINKS !== 'undefined' && XLINKS.T && XLINKS.T[APP] ? XLINKS.T[APP][1] : APP.toUpperCase());
    const SYS = 'Tu es l’assistant de SUITE XIII, une suite d’outils web pour la production audiovisuelle (tournage, direct, captation, post-production). Tu réponds en français, de façon concise et concrète, comme un régisseur / directeur de production expérimenté : préparation, feuilles de service, plans de tournage, matériel, devis, conventions collectives de l’audiovisuel, sécurité sur les plateaux. Quand c’est utile, indique quel outil XIII sert à quoi (PLANO plan de tournage et plateau, CALL SHEETO feuilles de service, CONDUCO conducteurs, DEVISO devis, MATOS matériel, CASTO casting, REPERO repérages, STORYBOARDO storyboard, PLANNO tâches, DOSSIER dossier de production, SYNO synoptiques…). Si tu n’es pas sûr d’un chiffre réglementaire, dis-le. Tu aides aussi à écrire les documents d’auteur et de production : note d’intention (pourquoi ce film, le regard, l’enjeu, la forme), note de réalisation (dispositif, image, lumière, son, montage, rythme, références), synopsis, logline, traitement, bible, présentation de l’équipe, lettres aux partenaires, dossiers CNC / régions / chaînes. Pour un texte à rédiger : si des éléments essentiels manquent (sujet, personnages, ton, durée, format, destinataire), pose d’abord 3 à 5 questions courtes ; sinon rédige directement un texte prêt à coller, à la première personne pour l’auteur, dans un français soigné et sans clichés, puis propose une variante plus courte.';
    const noCtx = () => !!J('xiii.aichat.noctx', false);
    function ctx() { if (noCtx()) return 'Contexte : non communiqué par l’utilisateur.'; const p = proj(), d = new Date(); return 'Contexte : outil ouvert ' + nm() + (p.title ? ' · projet « ' + p.title + ' »' : '') + ' · ' + d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '.'; }
    let busy = null, att = null, lastField = null;
    document.addEventListener('focusin', e => { const t = e.target; if (t && !t.closest('#xaic') && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|search|)$/.test(t.type || '')) || t.isContentEditable)) lastField = t; }, true);
    function css() {
        if (document.getElementById('xaic-css')) return; const s = document.createElement('style'); s.id = 'xaic-css';
        s.textContent = '#xaic-btn{font:700 12.5px system-ui,sans-serif;padding:6px 11px;border-radius:9px;border:1px solid rgba(240,179,120,.6);background:linear-gradient(135deg,rgba(240,179,120,.25),rgba(240,179,120,.08));color:inherit;cursor:pointer;margin-left:6px}#xaic-btn.fl{position:fixed;right:18px;bottom:84px;z-index:9990;background:#2a2622;color:#f0b378}' +
            '#xaic{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);z-index:10200;background:var(--bg-panel,#232120);color:var(--text-main,#eee);border-left:1px solid rgba(240,179,120,.45);box-shadow:-12px 0 40px rgba(0,0,0,.5);display:flex;flex-direction:column;font:13.5px/1.5 system-ui,sans-serif}#xaic header{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}#xaic header b{font-size:15px}#xaic header small{opacity:.6;font-size:11.5px;display:block}#xaic header button{background:none;border:0;color:inherit;font-size:16px;cursor:pointer;opacity:.8}' +
            '#xaic .l{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px}#xaic .m{padding:9px 12px;border-radius:12px;white-space:pre-wrap;overflow-wrap:anywhere;max-width:92%}#xaic .u{align-self:flex-end;background:rgba(240,179,120,.18)}#xaic .a{align-self:flex-start;background:rgba(255,255,255,.05)}#xaic .a .cp{display:block;margin-top:6px;font-size:11.5px;opacity:.7;background:none;border:0;color:inherit;cursor:pointer;padding:0}#xaic .e{color:#ef9a9a}#xaic .h{opacity:.7;font-size:12.5px}' +
            '#xaic form{display:flex;gap:6px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08)}#xaic textarea{flex:1;resize:none;font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid rgba(255,255,255,.15);border-radius:9px;padding:8px 10px;min-height:42px;max-height:160px}#xaic form button{font:700 13px system-ui;padding:0 14px;border-radius:9px;border:0;background:#F0B378;color:#1a1a1a;cursor:pointer}#xaic .sg{display:flex;flex-wrap:wrap;gap:6px}#xaic .sg button{font:12px system-ui;padding:5px 9px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:none;color:inherit;cursor:pointer}';
        document.head.appendChild(s);
    }
    function mount() {
        css(); const has = document.getElementById('xaic-btn');
        if (!ok()) { if (has) has.remove(); return; } if (has) return;
        const b = document.createElement('button'); b.id = 'xaic-btn'; b.textContent = '✨ IA'; b.title = 'Assistant IA (' + (XAI.label ? XAI.label() : '') + ')'; b.onclick = toggle;
        // à droite du premier bouton ＋ de la barre du haut, sinon bouton flottant
        const plus = [...document.querySelectorAll('.top-bar button, #xb-tool button, header button')].find(x => /^\s*[＋+➕]/.test(x.textContent) || /➕/.test(x.innerHTML.slice(0, 200)));
        if (plus) plus.insertAdjacentElement('afterend', b); else { b.classList.add('fl'); document.body.appendChild(b); place(); addEventListener('resize', place); setTimeout(place, 1500); }
    }
    // bouton flottant : entre ⚙️ (en bas) et 🐞 Bug & Suggestion (au-dessus), sans recouvrement
    function place() {
        const b = document.getElementById('xaic-btn'); if (!b || !b.classList.contains('fl')) return;
        const g = document.getElementById('xs-gear'), bug = document.getElementById('xbug-btn'), H = innerHeight;
        if (g) { const r = g.getBoundingClientRect(); b.style.right = Math.max(8, innerWidth - r.right) + 'px'; b.style.bottom = (H - r.top + 10) + 'px'; }
        if (bug) { const rb = b.getBoundingClientRect(), r2 = bug.getBoundingClientRect(); if (r2.bottom > rb.top - 8) bug.style.setProperty('bottom', (H - rb.top + 10) + 'px', 'important'); }
    }
    function toggle() { const o = document.getElementById('xaic'); if (o) { o.remove(); return; } open(); }
    function open() {
        css(); const p = proj();
        document.body.insertAdjacentHTML('beforeend', '<aside id="xaic" role="dialog" aria-label="Assistant IA"><header><div style="flex:1"><b>✨ Assistant XIII</b><small>' + esc(XAI.label ? XAI.label() : '') + (p.title ? ' · ' + esc(p.title) : '') + '</small></div>' + (ACT[APP] ? '<button data-act title="' + esc(ACT[APP].lab) + ' : l’IA propose, vous cochez et validez">🛠️</button>' : '') + '<button data-clr title="Effacer la conversation de ce projet">🧹</button><button data-x title="Fermer">✕</button></header><div class="l"></div><div class="at" style="padding:0 12px;font-size:12px;opacity:.8"></div><label style="display:flex;gap:6px;align-items:center;padding:4px 12px 0;font-size:11.5px;opacity:.75" title="Seuls partent : votre message, la pièce jointe éventuelle et, si coché, le nom de l’outil, le titre du projet et la date. Jamais l’équipe, les contacts ni les données des outils."><input type="checkbox" data-ctx' + (noCtx() ? '' : ' checked') + '> Joindre le contexte (outil, titre du projet, date) · 🔒 jamais l’équipe ni les données</label><form><label title="Joindre une photo, un croquis, un PDF (texte) ou un fichier texte (TXT, CSV, MD, JSON)" style="display:flex;align-items:center;cursor:pointer;font-size:18px">📎<input type="file" accept="image/*,.pdf,.txt,.csv,.md,.json,.srt,.html" hidden></label><textarea placeholder="Votre question… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"></textarea><button>Envoyer</button></form></aside>');
        const o = document.getElementById('xaic'), ta = o.querySelector('textarea');
        o.querySelector('[data-ctx]').onchange = e => W('xiii.aichat.noctx', !e.target.checked);
        o.querySelector('[data-x]').onclick = () => o.remove(); const ab = o.querySelector('[data-act]'); if (ab) ab.onclick = act;
        o.querySelector('[data-clr]').onclick = () => { if (confirm('Effacer la conversation de ce projet ?')) { save([]); draw(); } };
        o.querySelector('form').onsubmit = e => { e.preventDefault(); send(ta.value); ta.value = ''; };
        ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); ta.value = ''; } if (e.key === 'Escape') o.remove(); });
        o.querySelector('input[type=file]').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { att = await readAtt(f); } catch (x) { att = null; alert(x.message || x); } showAtt(); };
        draw(); showAtt(); setTimeout(() => ta.focus(), 50);
    }
    const WRI = [['📝 Note d’intention', 'Aide-moi à rédiger la note d’intention de mon projet. Pose-moi d’abord les questions nécessaires.'], ['🎬 Note de réalisation', 'Aide-moi à rédiger la note de réalisation (dispositif, image, son, montage). Pose-moi d’abord les questions nécessaires.'], ['📖 Synopsis', 'Aide-moi à écrire le synopsis (court et long) de mon projet.'], ['💡 Logline / pitch', 'Propose 5 loglines et un pitch de 3 phrases pour mon projet.'], ['✉️ Lettre partenaire', 'Aide-moi à écrire une lettre de présentation du projet à un partenaire (diffuseur, région, marque).']];
    const SUG = ['Prépare la liste des étapes de préparation de ce tournage', 'Quels postes prévoir pour une captation 3 caméras ?', 'Rappelle-moi les temps de repos entre deux journées', 'Aide-moi à rédiger le mot d’accueil de la feuille de service'];
    function draw() {
        const o = document.getElementById('xaic'); if (!o) return; const L = msgs(), box = o.querySelector('.l');
        box.innerHTML = (L.length ? '' : '<p class="h">Posez une question sur votre production : l’assistant connaît le métier et les outils XIII. Rien ne part avant votre envoi, et directement vers votre IA (pas de serveur XIII au milieu) ; seul le contexte coché en bas (outil ouvert, titre du projet, date) accompagne la question — jamais l’équipe, les contacts ni les données des outils.</p><p class="h" style="margin:8px 0 4px">✍️ Écrire avec l’IA :</p><div class="sg">' + WRI.map(w => '<button data-w="' + esc(w[1]) + '">' + esc(w[0]) + '</button>').join('') + '</div><p class="h" style="margin:8px 0 4px">💬 Questions :</p><div class="sg">' + SUG.map(s => '<button>' + esc(s) + '</button>').join('') + '</div>') +
            L.map((m, i) => '<div class="m ' + (m.r === 'u' ? 'u' : 'a') + (m.err ? ' e' : '') + '">' + esc(m.t) + (m.r === 'u' && m.att ? '\n📎 ' + esc(m.att) : '') + (m.r === 'a' && !m.err ? '<span style="display:flex;gap:12px"><button class="cp" data-cp="' + i + '">📋 Copier</button><button class="cp" data-in="' + i + '" title="Insérer dans le dernier champ de texte utilisé de l’outil">↘️ Dans le champ</button></span>' : '') + '</div>').join('') + (busy ? '<div class="m a h">⏳ L’IA réfléchit…</div>' : '');
        box.querySelectorAll('.sg button').forEach(b => b.onclick = () => send(b.dataset.w || b.textContent));
        box.querySelectorAll('[data-cp]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(L[+b.dataset.cp].t); b.textContent = '✅ Copié'; } catch (e) { } });
        box.querySelectorAll('[data-in]').forEach(b => b.onclick = () => { const f = lastField, v = L[+b.dataset.in].t; if (!f || !document.contains(f)) { b.textContent = 'Cliquez d’abord dans un champ de l’outil'; return; } if (f.isContentEditable) f.focus(), document.execCommand('insertText', false, v); else { const a = f.selectionStart != null ? f.selectionStart : f.value.length; f.value = f.value.slice(0, a) + v + f.value.slice(f.selectionEnd != null ? f.selectionEnd : a); f.dispatchEvent(new Event('input', { bubbles: true })); f.dispatchEvent(new Event('change', { bubbles: true })); } b.textContent = '✅ Inséré'; });
        box.scrollTop = box.scrollHeight;
    }
    async function send(t) {
        t = String(t || '').trim(); if (!t || busy) return; const L = msgs(), A = att; att = null; showAtt(); L.push({ r: 'u', t, ts: Date.now(), att: A ? A.name : '' }); save(L); busy = new AbortController(); draw();
        const hist = L.slice(-12, -1).map(m => (m.r === 'u' ? 'Utilisateur : ' : 'Assistant : ') + m.t).join('\n\n');
        const prompt = SYS + '\n\n' + ctx() + (hist ? '\n\nConversation précédente :\n' + hist : '') + (A && A.text ? '\n\nFichier joint « ' + A.name + ' » :\n' + A.text : '') + (A && A.image ? '\n\n(Une image est jointe : « ' + A.name + ' ».)' : '') + '\n\nUtilisateur : ' + t + '\n\nAssistant :';
        let r; try { r = { r: 'a', t: String(await XAI.ask(prompt, Object.assign({ signal: busy.signal, maxTokens: 2000 }, A && A.image ? { image: A.image } : {})) || '').trim() || '(réponse vide)' }; } catch (e) { r = { r: 'a', err: 1, t: '⚠️ ' + (e && e.message || e) }; }
        busy = null; const L2 = msgs(); L2.push(Object.assign(r, { ts: Date.now() })); save(L2); draw();
    }
    async function readAtt(f) {
        if (/^image\//.test(f.type)) {
            if (XAI.canSee && !XAI.canSee()) throw new Error('L’IA connectée ne lit pas les images : choisissez-en une autre dans ⚙️ › Intelligence artificielle.');
            const url = await new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsDataURL(f); });
            const im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; }), k = Math.min(1, 1568 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
            c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            return { name: f.name, image: { mediaType: 'image/jpeg', base64: c.toDataURL('image/jpeg', 0.85).split(',')[1] } };
        }
        if (/pdf$/i.test(f.type) || /\.pdf$/i.test(f.name)) {
            if (f.size > 15e6) throw new Error('PDF trop lourd (15 Mo maximum).');
            if (!window.pdfjsLib) await new Promise((ok, ko) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; sc.onload = ok; sc.onerror = () => ko(new Error('Lecteur PDF injoignable (connexion ?)')); document.head.appendChild(sc); });
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise; let out = '';
            for (let i = 1; i <= Math.min(doc.numPages, 40) && out.length < 60000; i++) { const c = await (await doc.getPage(i)).getTextContent(); out += '\n— page ' + i + ' —\n' + c.items.map(x => x.str + (x.hasEOL ? '\n' : ' ')).join(''); }
            if (!out.replace(/— page \d+ —|\s/g, '')) throw new Error('Ce PDF ne contient pas de texte (scan) : joignez plutôt une photo de la page.');
            return { name: f.name + ' (' + doc.numPages + ' p.)', text: out.slice(0, 60000) };
        }
        if (f.size > 400000) throw new Error('Fichier trop lourd (400 Ko maximum pour un texte).');
        return { name: f.name, text: (await f.text()).slice(0, 60000) };
    }
    function showAtt() { const d = document.querySelector('#xaic .at'); if (!d) return; d.innerHTML = att ? '📎 ' + esc(att.name) + ' <a href="#" style="color:inherit">✕</a>' : ''; const a = d.querySelector('a'); if (a) a.onclick = e => { e.preventDefault(); att = null; showAtt(); }; }

    // ---------- 🛠️ actions dans l'outil : l'IA propose, l'utilisateur coche et valide ----------
    const ACT = {
        planno: { lab: '🛠️ Créer des tâches dans PLANNO', ask: 'Propose les tâches de planning correspondant à la demande (préparation, repérages, tournage, post-production, livraison).',
            schema: '{"items":[{"name":"…","phase":"prepa|casting|reperage|tournage|post|livraison","start":"AAAA-MM-JJ","end":"AAAA-MM-JJ"}]}',
            row: x => x.name + (x.start ? ' · ' + x.start.split('-').reverse().join('/') + (x.end && x.end !== x.start ? ' → ' + x.end.split('-').reverse().join('/') : '') : '') + (x.phase ? ' · ' + x.phase : ''),
            apply(L) { let f = window.XPLANNO_AI; if (typeof f !== 'function') { const fr = [...document.querySelectorAll('iframe')].find(x => /planno\.html/.test(x.src)); try { f = fr && fr.contentWindow.XPLANNO_AI; } catch (e) { } } if (typeof f !== 'function') throw new Error('Ouvrez la vue Production (planning PLANNO) puis recommencez'); return f(L) + ' tâche(s) ajoutée(s) au planning'; } },
        storyboardo: { lab: '🛠️ Créer des plans dans STORYBOARDO', ask: 'Découpe la demande en plans de storyboard (valeur de plan, action, dialogue éventuel).',
            schema: '{"items":[{"titre":"…","valeur":"Plan large|Plan moyen|Plan rapproché|Gros plan|…","action":"…","dialogue":"…"}]}',
            row: x => (x.titre ? x.titre + ' — ' : '') + (x.valeur ? '[' + x.valeur + '] ' : '') + (x.action || ''),
            apply(L) { const cur = PN(); let at = idx(cur); L.forEach(x => { const n = blankPanel({ seq: cur.seq }); if (x.titre) n.title = String(x.titre).slice(0, 80); n.action = [x.valeur, x.action].filter(Boolean).join(' — '); if (x.dialogue) n.dialogue = x.dialogue; P.panels.splice(++at, 0, n); }); dirty(); renderAll(); return L.length + ' plan(s) ajouté(s) après le plan affiché'; } }
    };
    ACT.calendrier = ACT.planno;
    async function act() {
        const A = ACT[APP], ta = document.querySelector('#xaic textarea'); if (!A || busy) return;
        const t = (ta.value || '').trim() || (msgs().filter(m => m.r === 'u').slice(-1)[0] || {}).t; if (!t) { ta.placeholder = 'Décrivez d’abord ce que l’IA doit créer…'; ta.focus(); return; } ta.value = '';
        const L = msgs(); L.push({ r: 'u', t: A.lab + ' : ' + t, ts: Date.now() }); save(L); busy = new AbortController(); draw();
        const prompt = SYS + '\n\n' + ctx() + '\n\n' + A.ask + '\nDemande : ' + t + '\n\nRéponds UNIQUEMENT par un JSON de la forme ' + A.schema + ' (10 éléments au plus, dates au format AAAA-MM-JJ à partir d’aujourd’hui si besoin).';
        let items = null, err = ''; try { const r = await XAI.ask(prompt, { signal: busy.signal, maxTokens: 3000 }); items = (XAI.json(r).items || []).slice(0, 20); } catch (e) { err = e && e.message || String(e); }
        busy = null; draw(); const box = document.querySelector('#xaic .l'); if (!box) return;
        if (!items || !items.length) { const L2 = msgs(); L2.push({ r: 'a', err: 1, t: '⚠️ ' + (err || 'L’IA n’a rien proposé de lisible. Reformulez la demande.'), ts: Date.now() }); save(L2); draw(); return; }
        box.insertAdjacentHTML('beforeend', '<div class="m a" id="xaic-prop"><b>Proposition — cochez ce qu’il faut créer :</b>' + items.map((x, i) => '<label style="display:flex;gap:6px;margin-top:5px;white-space:normal"><input type="checkbox" data-k="' + i + '" checked><span>' + esc(A.row(x)) + '</span></label>').join('') + '<div style="display:flex;gap:8px;margin-top:8px"><button class="cp" data-ok style="opacity:1;font-weight:700">✅ Créer</button><button class="cp" data-no>Annuler</button></div></div>'); box.scrollTop = box.scrollHeight;
        const pr = document.getElementById('xaic-prop');
        pr.querySelector('[data-no]').onclick = () => pr.remove();
        pr.querySelector('[data-ok]').onclick = () => { const sel = items.filter((x, i) => pr.querySelector('[data-k="' + i + '"]').checked); let m; try { m = sel.length ? A.apply(sel) : 'Rien de créé'; } catch (e) { m = '⚠️ ' + e.message; } pr.remove(); const L3 = msgs(); L3.push({ r: 'a', t: '✅ ' + m + '.', ts: Date.now() }); save(L3); draw(); };
    }
    setTimeout(mount, 300); addEventListener('load', () => setTimeout(mount, 300)); addEventListener('storage', e => { if (e.key && /^xiii\.ai/.test(e.key)) mount(); }); setInterval(mount, 5000);
    return { open, toggle, mount };
})();
