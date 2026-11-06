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
    const SYS = 'Tu es l’assistant de SUITE XIII, une suite d’outils web pour la production audiovisuelle (tournage, direct, captation, post-production). Tu réponds en français, de façon concise et concrète, comme un régisseur / directeur de production expérimenté : préparation, feuilles de service, plans de tournage, matériel, devis, conventions collectives de l’audiovisuel, sécurité sur les plateaux. Quand c’est utile, indique quel outil XIII sert à quoi (PLANO plan de tournage et plateau, CALL SHEETO feuilles de service, CONDUCO conducteurs, DEVISO devis, MATOS matériel, CASTO casting, REPERO repérages, STORYBOARDO storyboard, PLANNO tâches, DOSSIER dossier de production, SYNO synoptiques…). Repères métier (France, à vérifier sur les textes en vigueur avant toute décision) : conventions collectives de la production audiovisuelle (IDCC 2642), des entreprises techniques au service de la création et de l’événement (IDCC 2717), de la production cinématographique (IDCC 3097), des prestataires techniques ; intermittents (annexes 8 et 10), DPAE avant la prise de poste, repos quotidien de 11 h consécutives sauf dérogations prévues par la convention, majorations des heures supplémentaires, de nuit, du dimanche et des jours fériés ; mineurs : autorisation préfectorale et horaires encadrés ; sécurité : plan de prévention, travail en hauteur et nacelles, électricité (habilitations, groupes électrogènes, prises 16 A / 32 A / P17), effets spéciaux, armes factices, véhicules et travellings, cascades, drones (catégorie, scénario, déclaration), météo et chaleur ; autorisations de tournage (mairie, préfecture de police à Paris, domaine public), assurances, carnet ATA à l’étranger. En direct et en captation : conducteur, régie, intercom, synoptique, redondances, temps de mise en place et de démontage. En post-production : dérushage, montage, étalonnage, mixage, sous-titres, livrables (PAD, normes de diffusion, loudness). Si tu n’es pas sûr d’un chiffre réglementaire, dis-le et indique où le vérifier (texte de la convention, Légifrance, URSSAF, CNC). Quand le contexte détaillé du projet ou de l’outil est fourni, appuie-toi dessus, chiffres compris, et signale ce qui manque ou paraît incohérent. Tu aides aussi à écrire les documents d’auteur et de production : note d’intention (pourquoi ce film, le regard, l’enjeu, la forme), note de réalisation (dispositif, image, lumière, son, montage, rythme, références), synopsis, logline, traitement, bible, présentation de l’équipe, lettres aux partenaires, dossiers CNC / régions / chaînes. Pour un texte à rédiger : si des éléments essentiels manquent (sujet, personnages, ton, durée, format, destinataire), pose d’abord 3 à 5 questions courtes ; sinon rédige directement un texte prêt à coller, à la première personne pour l’auteur, dans un français soigné et sans clichés, puis propose une variante plus courte.';
    const noCtx = () => !!J('xiii.aichat.noctx', false), rich = () => !noCtx() && !!J('xiii.aichat.rich', false);
    function fiche() {
        const s = J('xiii.projets', null) || {}, L = s.list || []; const p = Array.isArray(L) ? L.find(x => x && x.id === s.active) : null; if (!p) return '';
        const fr = d => d ? String(d).split('-').reverse().join('/') : '', f = [['genre', 'Genre'], ['production', 'Société de production'], ['client', 'Client / diffuseur'], ['diffusion', 'Diffusion'], ['duree', 'Durée'], ['lieu', 'Lieu principal']].filter(k => p[k[0]]).map(k => k[1] + ' : ' + String(p[k[0]]).slice(0, 120));
        if (p.debut) f.push('Tournage : ' + fr(p.debut) + (p.fin && p.fin !== p.debut ? ' → ' + fr(p.fin) : ''));
        return f.length ? 'Fiche projet — ' + f.join(' · ') + '.' : '';
    }
    // résumé du contenu de l'outil ouvert : quantités, intitulés, horaires — jamais de noms de personnes, téléphones ni adresses
    const SUM = {
        matos: () => { const L = PM.cur().items.filter(i => i.on !== false); return 'Matériel du projet (' + L.length + ' lignes) : ' + L.slice(0, 40).map(i => (i.qty > 1 ? i.qty + ' × ' : '') + i.name + ' [' + i.grp + ']').join(' ; '); },
        deviso: () => { const v = V(); let t = ''; try { const T = totals(); t = ' · total HT retenu ' + Math.round(T.R.ht) + ' €'; } catch (e) { }
            return 'Devis « ' + (v.name || '') + ' »' + t + '. Matériel : ' + v.eq.filter(e => e.on !== false && e.name).slice(0, 30).map(e => (e.qty > 1 ? e.qty + ' × ' : '') + e.name + (e.days ? ' (' + e.days + ' j)' : '')).join(' ; ') + '. Équipe (postes) : ' + v.crew.filter(c => c.on !== false).slice(0, 30).map(c => (c.qty > 1 ? c.qty + ' × ' : '') + (c.role || c.poste) + (c.days ? ' (' + c.days + ' j)' : '')).join(' ; ') + '. Frais : ' + v.fees.filter(f => f.on !== false && f.name).slice(0, 20).map(f => f.name).join(' ; ') + '.'; },
        callsheeto: () => { const d = D(), T = d.times || {}; const roles = {}; (d.crew || []).forEach(c => { const r = c.role || c.dept; if (r) roles[r] = (roles[r] || 0) + 1; });
            return 'Journée « ' + (d.name || '') + ' » du ' + String(d.date || '').split('-').reverse().join('/') + ' · convocation ' + (T.general || '?') + ' · PAT ' + (T.pat || '?') + ' · repas ' + (T.lunch || '?') + ' · fin ' + (T.wrap || '?') + '. Lieux : ' + (d.locations || []).map(l => l.name || l.type).filter(Boolean).join(', ') + '. Déroulé : ' + (d.schedule || []).slice(0, 30).map(x => (x.time || '') + ' ' + (x.ev ? x.desc : 'Séq. ' + (x.seq || '?') + ' ' + (x.ie || '') + ' ' + (x.desc || ''))).join(' ; ') + '. Équipe (postes, sans noms) : ' + Object.keys(roles).map(r => (roles[r] > 1 ? roles[r] + ' × ' : '') + r).join(', ') + '.'; },
        planno: () => { let f = window.XPLANNO_TASKS; if (typeof f !== 'function') { const fr = [...document.querySelectorAll('iframe')].find(x => /planno\.html/.test(x.src)); try { f = fr && fr.contentWindow.XPLANNO_TASKS; } catch (e) { } } const A = typeof f === 'function' ? f() : []; const L = A.filter(t => !t.done).sort((a, b) => String(a.start).localeCompare(String(b.start))); return 'Planning : ' + A.length + ' tâches, à venir : ' + L.slice(0, 25).map(t => t.name + ' (' + String(t.start || '').split('-').reverse().join('/') + (t.phase ? ', ' + t.phase : '') + ')').join(' ; ') + '.'; },
        storyboardo: () => 'Storyboard : ' + P.panels.length + ' plans — ' + P.panels.slice(0, 30).map((p, i) => (i + 1) + '. ' + (p.title || 'sans titre') + (p.action ? ' : ' + String(p.action).slice(0, 80) : '')).join(' ; ') + '.',
        plano: () => { const it = tab().items, c = {}; it.forEach(i => { const k = i.kind === 'obj' || i.kind === 'light' ? (i.name || i.ref) : i.kind; c[k] = (c[k] || 0) + 1; }); return 'Plan « ' + tab().name + ' » : ' + Object.keys(c).slice(0, 40).map(k => (c[k] > 1 ? c[k] + ' × ' : '') + k).join(', ') + '.'; }
    };
    SUM.calendrier = SUM.planno;
    function toolSum() { const f = SUM[APP]; if (!f) return ''; try { return String(f() || '').slice(0, 3000); } catch (e) { return ''; } }
    function ctx() { if (noCtx()) return 'Contexte : non communiqué par l’utilisateur.'; const p = proj(), d = new Date(); return 'Contexte : outil ouvert ' + nm() + (p.title ? ' · projet « ' + p.title + ' »' : '') + ' · ' + d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '.' + (rich() ? ['', fiche(), toolSum()].filter((x, i) => i === 0 || x).join('\n') : ''); }
    let busy = null, att = null, lastField = null, live = '', liveT = 0;
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
        if (plus) plus.insertAdjacentElement('afterend', b); else { b.classList.add('fl'); document.body.appendChild(b); place(); addEventListener('resize', place); setInterval(place, 1500); }
    }
    // bouton flottant : entre ⚙️ (en bas) et 🐞 Bug & Suggestion (au-dessus), sans recouvrement
    function place() {
        const b = document.getElementById('xaic-btn'); if (!b || !b.classList.contains('fl')) return;
        const g = document.getElementById('xs-gear'), bug = document.getElementById('xbug-btn'), H = innerHeight;
        if (g) { const r = g.getBoundingClientRect(); b.style.right = Math.max(8, innerWidth - r.right) + 'px'; b.style.bottom = (H - r.top + 10) + 'px'; }
        if (bug) { bug.style.removeProperty('bottom'); const rb = b.getBoundingClientRect(), g2 = g && g.getBoundingClientRect(); bug.style.bottom = (H - rb.top + 10) + 'px'; if (g2) bug.style.right = Math.max(8, innerWidth - g2.right) + 'px'; }
    }
    function toggle() { const o = document.getElementById('xaic'); if (o) { o.remove(); return; } open(); }
    function open() {
        const ex = document.getElementById('xaic'); if (ex) { const t = ex.querySelector('textarea'); if (t) t.focus(); return; }   // jamais deux volets ouverts
        css(); const p = proj();
        document.body.insertAdjacentHTML('beforeend', '<aside id="xaic" role="dialog" aria-label="Assistant IA"><header><div style="flex:1"><b>✨ Assistant XIII</b><small>' + esc(XAI.label ? XAI.label() : '') + (p.title ? ' · ' + esc(p.title) : '') + '</small></div>' + (ACT[APP] ? '<button data-act title="' + esc(ACT[APP].lab) + ' : l’IA propose, vous cochez et validez">🛠️</button>' : '') + '<button data-mcp title="🔌 Utiliser SUITE XIII depuis Claude.ai ou ChatGPT, avec votre abonnement (connecteur)">🔌</button>' + '<button data-gate title="🔀 Envoyer vers un autre outil : écrivez ce que vous voulez transmettre, l’IA choisit la bonne passerelle (champ vide : toutes les passerelles)">🔀</button>' + '<button data-clr title="Effacer la conversation de ce projet">🧹</button><button data-x title="Fermer">✕</button></header><div class="l"></div><div class="at" style="padding:0 12px;font-size:12px;opacity:.8"></div><label style="display:flex;gap:6px;align-items:center;padding:4px 12px 0;font-size:11.5px;opacity:.75" title="Seuls partent : votre message, la pièce jointe éventuelle et, si coché, le nom de l’outil, le titre du projet et la date. Jamais l’équipe, les contacts ni les données des outils."><input type="checkbox" data-ctx' + (noCtx() ? '' : ' checked') + '> Joindre le contexte (outil, titre du projet, date) · 🔒 jamais l’équipe ni les données</label><label style="display:flex;gap:6px;align-items:center;padding:2px 12px 0;font-size:11.5px;opacity:.75" title="Ajoute la fiche projet (genre, production, dates, lieu, durée) et un résumé de l’outil ouvert (lignes de devis, matériel, déroulé, tâches, plans…) pour des réponses chiffrées. Jamais de noms de personnes, téléphones, e-mails ni adresses."><input type="checkbox" data-rich' + (rich() ? ' checked' : '') + (noCtx() ? ' disabled' : '') + '> + fiche projet et contenu de l’outil (sans noms ni coordonnées)</label><form><label title="Joindre une photo, un croquis, un PDF (texte) ou un fichier texte (TXT, CSV, MD, JSON)" style="display:flex;align-items:center;cursor:pointer;font-size:18px">📎<input type="file" accept="image/*,.pdf,.txt,.csv,.md,.json,.srt,.html" hidden></label><textarea placeholder="Votre question… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"></textarea><button>Envoyer</button></form></aside>');
        const o = document.getElementById('xaic'), ta = o.querySelector('textarea');
        o.querySelector('[data-ctx]').onchange = e => { W('xiii.aichat.noctx', !e.target.checked); const r = o.querySelector('[data-rich]'); if (r) { r.disabled = !e.target.checked; if (!e.target.checked) r.checked = false; } };
        o.querySelector('[data-rich]').onchange = e => W('xiii.aichat.rich', !!e.target.checked);
        o.querySelector('[data-x]').onclick = () => o.remove(); const ab = o.querySelector('[data-act]'); if (ab) ab.onclick = act; const gb = o.querySelector('[data-gate]'); if (gb) gb.onclick = gateAI; const mb = o.querySelector('[data-mcp]'); if (mb) mb.onclick = () => { try { XMCPC.open(); } catch (e) { } };
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
            L.map((m, i) => '<div class="m ' + (m.r === 'u' ? 'u' : 'a') + (m.err ? ' e' : '') + '">' + esc(m.t) + (m.r === 'u' && m.att ? '\n📎 ' + esc(m.att) : '') + (m.r === 'a' && !m.err ? '<span style="display:flex;gap:12px"><button class="cp" data-cp="' + i + '">📋 Copier</button><button class="cp" data-in="' + i + '" title="Insérer dans le dernier champ de texte utilisé de l’outil">↘️ Dans le champ</button></span>' : '') + '</div>').join('') + (busy ? (live ? '<div class="m a" id="xaic-live">' + esc(live) + '<span class="h"> ▍</span><span style="display:flex"><button class="cp" data-stop>⏹ Arrêter</button></span></div>' : '<div class="m a h">⏳ L’IA réfléchit… <button class="cp" data-stop>⏹ Arrêter</button></div>') : '');
        box.querySelectorAll('.sg button').forEach(b => b.onclick = () => send(b.dataset.w || b.textContent));
        box.querySelectorAll('[data-cp]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(L[+b.dataset.cp].t); b.textContent = '✅ Copié'; } catch (e) { } });
        box.querySelectorAll('[data-in]').forEach(b => b.onclick = () => { const f = lastField, v = L[+b.dataset.in].t; if (!f || !document.contains(f)) { b.textContent = 'Cliquez d’abord dans un champ de l’outil'; return; } if (f.isContentEditable) f.focus(), document.execCommand('insertText', false, v); else { const a = f.selectionStart != null ? f.selectionStart : f.value.length; f.value = f.value.slice(0, a) + v + f.value.slice(f.selectionEnd != null ? f.selectionEnd : a); f.dispatchEvent(new Event('input', { bubbles: true })); f.dispatchEvent(new Event('change', { bubbles: true })); } b.textContent = '✅ Inséré'; });
        box.querySelectorAll('[data-stop]').forEach(b => b.onclick = () => { try { busy && busy.abort(); } catch (e) { } });
        box.scrollTop = box.scrollHeight;
    }
    async function send(t) {
        t = String(t || '').trim(); if (!t || busy) return;
        const IN = !att && intent(t); if (IN) { const M = msgs(); M.push({ r: 'u', t, ts: Date.now() }); save(M); draw(); gate(IN, null, '🔀 Passerelle correspondante'); return; }
        const L = msgs(), A = att; att = null; showAtt(); L.push({ r: 'u', t, ts: Date.now(), att: A ? A.name : '' }); save(L); busy = new AbortController(); draw();
        const hist = L.slice(-12, -1).map(m => (m.r === 'u' ? 'Utilisateur : ' : 'Assistant : ') + m.t).join('\n\n');
        const prompt = SYS + '\n\n' + ctx() + (hist ? '\n\nConversation précédente :\n' + hist : '') + (A && A.text ? '\n\nFichier joint « ' + A.name + ' » :\n' + A.text : '') + (A && A.image ? '\n\n(Une image est jointe : « ' + A.name + ' ».)' : '') + '\n\nUtilisateur : ' + t + '\n\nAssistant :';
        // ✍️ la réponse s'écrit au fur et à mesure (si le service le permet), sinon elle arrive d'un bloc
        live = ''; const onDelta = txt => { live = txt; if (liveT) return; liveT = requestAnimationFrame(() => { liveT = 0; const el = document.getElementById('xaic-live'), box = document.querySelector('#xaic .l'); if (el) { el.firstChild.textContent = live; if (box) box.scrollTop = box.scrollHeight; } else draw(); }); };
        let r; try { r = { r: 'a', t: String(await XAI.ask(prompt, Object.assign({ signal: busy.signal, maxTokens: 2000, onDelta }, A && A.image ? { image: A.image } : {})) || '').trim() || '(réponse vide)' }; } catch (e) { r = e && e.name === 'AbortError' ? (live ? { r: 'a', t: live + ' […]' } : { r: 'a', err: 1, t: '⏹ Réponse arrêtée.' }) : { r: 'a', err: 1, t: '⚠️ ' + (e && e.message || e) }; }
        live = ''; busy = null; const L2 = msgs(); L2.push(Object.assign(r, { ts: Date.now() })); save(L2); draw();
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
    // feuille de service : déroulé horaire du jour affiché
    ACT.callsheeto = { max: 20, lab: '🛠️ Remplir le déroulé de la feuille de service', ask: 'Propose le déroulé horaire de la journée de tournage affichée (séquences à tourner et événements : prêt à tourner, mise en place, repas, déplacement, fin de journée), cohérent avec la demande, les horaires et les lieux du projet.',
        schema: '{"items":[{"heure":"HH:MM","type":"seq|event","seq":"n° de séquence","ie":"INT|EXT|INT/EXT","desc":"…","roles":"rôles présents","pages":"1 3/8"}]}',
        row: x => (x.heure || '--:--') + ' · ' + (x.type === 'event' ? '⏸ ' : '') + (x.seq ? 'Séq. ' + x.seq + ' ' : '') + (x.ie ? x.ie + ' ' : '') + (x.desc || '') + (x.roles ? ' (' + x.roles + ')' : ''),
        apply(L) { const d = D(); const hm = v => { const m = /^(\d{1,2})\s*[:h]\s*(\d{2})$/.exec(String(v || '').trim()); return m ? String(+m[1]).padStart(2, '0') + ':' + m[2] : ''; };
            L.forEach(x => { const t = hm(x.heure); if (x.type === 'event') d.schedule.push({ id: uid(), ev: true, time: t, desc: String(x.desc || 'PAUSE').toUpperCase().slice(0, 60) });
                else d.schedule.push({ id: uid(), ev: false, time: t, seq: String(x.seq || '').slice(0, 20), ie: /int\s*\/\s*ext/i.test(x.ie) ? 'INT/EXT' : /ext/i.test(x.ie) ? 'EXT' : /int/i.test(x.ie) ? 'INT' : '', loc: (typeof wxLoc === 'function' && wxLoc(d) || {}).id || '', desc: String(x.desc || '').slice(0, 300), roles: String(x.roles || '').slice(0, 200), pages: String(x.pages || '').slice(0, 12) }); });
            if (typeof setView === 'function' && typeof view !== 'undefined' && view !== 'edit') setView('edit'); if (typeof sortSched === 'function') sortSched(); else { refreshSched(); touch(); }
            return L.length + ' ligne(s) ajoutée(s) au déroulé du jour affiché, triées par heure'; } };
    // MATOS : liste du matériel du projet actif
    ACT.matos = { max: 30, lab: '🛠️ Ajouter du matériel au projet (MATOS)', ask: () => 'Propose la liste du matériel à emporter pour la demande (caméras, optiques, son, lumière, machinerie, régie, consommables), avec des quantités réalistes. Groupe parmi : ' + (typeof PM !== 'undefined' ? PM.GRP.join(', ') : 'IMAGE, SON, LUMIERE, CONSOMMABLES, REGIE, GRIP') + '.',
        schema: '{"items":[{"nom":"…","qte":1,"groupe":"IMAGE"}]}',
        row: x => (x.qte > 1 ? x.qte + ' × ' : '') + (x.nom || '') + (x.groupe ? ' · ' + x.groupe : ''),
        apply(L) { if (typeof PM === 'undefined') throw new Error('MATOS pas encore prêt'); L.forEach(x => { const g = String(x.groupe || '').toUpperCase(); PM.add(String(x.nom || '').slice(0, 120), Math.max(1, Math.min(99, Math.round(+x.qte || 1))), PM.GRP.includes(g) ? g : PM.guess('', x.nom || ''), 'IA'); });
            try { dirty(); } catch (e) { } try { render(); } catch (e) { } return L.length + ' ligne(s) ajoutée(s) au matériel du projet (sous « Matériel du projet »)'; } };
    // DEVISO : lignes de matériel, d'équipe et de frais dans la version affichée
    ACT.deviso = { max: 30, lab: '🛠️ Ajouter des lignes au devis (DEVISO)', ask: () => 'Propose les lignes de devis correspondant à la demande : matériel (avec catégorie), postes d’équipe (avec nombre et jours) et frais (transport, repas, hébergement, assurance…). Laisse "prix" vide si tu ne le connais pas : DEVISO applique ses tarifs (conventions collectives pour l’équipe). Postes disponibles (id = intitulé) : '
            + (typeof POSTES0 !== 'undefined' ? POSTES0.map(p => p[0] + ' = ' + p[1]).join(' ; ') : '') + '. Catégories de matériel (id = nom) : ' + (typeof ECATS !== 'undefined' ? ECATS.map(c => c[0] + ' = ' + c[1]).join(' ; ') : '') + '.',
        schema: '{"items":[{"type":"materiel|equipe|frais","nom":"…","poste":"id du poste (équipe)","cat":"id de catégorie (matériel)","qte":1,"jours":1,"prix":null}]}',
        row: x => ({ materiel: '🎥 ', equipe: '👥 ', frais: '🧾 ' }[x.type] || '• ') + (x.qte > 1 ? x.qte + ' × ' : '') + (x.nom || x.poste || '') + (x.jours ? ' · ' + x.jours + ' j' : '') + (x.prix ? ' · ' + x.prix + ' € HT' : ''),
        apply(L) { const v = V(), n = { eq: 0, crew: 0, fees: 0 }, q = x => Math.max(1, Math.min(999, Math.round(+x.qte || 1))), dj = x => (+x.jours > 0 ? Math.min(365, +x.jours) : null), pr = x => (x.prix != null && x.prix !== '' && isFinite(+x.prix) && +x.prix >= 0 ? Math.round(+x.prix * 100) / 100 : null);
            L.forEach(x => {
                if (x.type === 'equipe') { const p = posteOf(String(x.poste || '')); const c = { id: uid(), on: true, name: '', role: String(x.nom || p.name || '').slice(0, 80), poste: p.id, dept: p.dept, mode: p.mode, qty: q(x) }; if (dj(x)) c.days = dj(x); if (pr(x) != null) c.rate = pr(x); v.crew.push(c); n.crew++; }
                else if (x.type === 'frais') { const f = { id: uid(), on: true, name: String(x.nom || '').slice(0, 120), qty: q(x), unit: 'forfait' }; if (pr(x) != null) f.price = pr(x); v.fees.push(f); n.fees++; }
                else { const cats = typeof ECATS !== 'undefined' ? ECATS.map(c => c[0]) : []; const e = newEq({ name: String(x.nom || '').slice(0, 120), qty: q(x), cat: cats.includes(x.cat) ? x.cat : 'div' }); if (dj(x)) e.days = dj(x); if (pr(x) != null) e.price = pr(x); v.eq.push(e); n.eq++; }
            });
            dirty(); renderContent(); renderStats(); renderTabs();
            return [n.eq && n.eq + ' matériel', n.crew && n.crew + ' poste(s) d’équipe', n.fees && n.fees + ' frais'].filter(Boolean).join(', ') + ' ajouté(s) à la version « ' + (v.name || 'affichée') + ' » — à vérifier : prix vides = tarifs DEVISO'; } };
    ACT.calendrier = ACT.planno;
    // ---------- 🔀 passerelles depuis le volet : ce que cet outil peut envoyer, et l'IA qui dit lesquelles servent ----------
    const PAPP = APP === 'calendrier' ? 'planno' : APP;
    function links() { try { return typeof XLINKS !== 'undefined' ? XLINKS.from(PAPP).filter((x, i, a) => a.findIndex(y => y[1] === x[1]) === i) : []; } catch (e) { return []; } }
    const tname = t => { const T = typeof XLINKS !== 'undefined' ? XLINKS.T : {}; return T[t] ? T[t][0] + ' ' + T[t][1] : t.toUpperCase(); };
    function gate(L, why, title) {
        const box = document.querySelector('#xaic .l'); if (!box) return; document.querySelectorAll('#xaic-gate').forEach(x => x.remove());
        if (!L.length) { box.insertAdjacentHTML('beforeend', '<div class="m a h" id="xaic-gate">Cet outil n’a pas de passerelle vers un autre outil.</div>'); return; }
        box.insertAdjacentHTML('beforeend', '<div class="m a" id="xaic-gate"><b>' + esc(title || '🔀 Envoyer vers un autre outil') + '</b>' + L.map(x => '<div style="display:flex;gap:8px;align-items:flex-start;margin-top:7px;white-space:normal"><button class="cp" data-go="' + esc(x[1]) + '" style="opacity:1;font-weight:700;flex:none">' + esc(tname(x[1])) + ' ↗</button><span>' + esc(x[2]) + (why && why[x[1]] ? '<br><i>💡 ' + esc(why[x[1]]) + '</i>' : '') + '</span></div>').join('')
            + '<div style="margin-top:8px;display:flex;gap:8px"><button class="cp" data-all>Toutes les passerelles…</button><button class="cp" data-no>Fermer</button></div></div>');
        const g = document.getElementById('xaic-gate'); box.scrollTop = box.scrollHeight;
        g.querySelector('[data-no]').onclick = () => g.remove();
        g.querySelector('[data-all]').onclick = () => { try { XGATE.open(); } catch (e) { } };
        g.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const t = b.dataset.go; const L2 = msgs(); L2.push({ r: 'a', t: '🔀 Passerelle vers ' + tname(t) + ' lancée : suivez les indications de l’outil (l’outil d’arrivée propose l’intégration, rien n’est remplacé sans votre accord).', ts: Date.now() }); save(L2); draw();
            try { if (typeof XGATE !== 'undefined' && XGATE.go) XGATE.go(t); else location.href = t + '.html'; } catch (e) { location.href = t + '.html'; } });
    }
    async function gateAI() {
        const L = links(); if (!L.length || busy) { gate(L); return; } const ta = document.querySelector('#xaic textarea'), t = (ta && ta.value || '').trim(); if (ta) ta.value = '';
        if (!t) { gate(L); return; }
        const M = msgs(); M.push({ r: 'u', t: '🔀 ' + t, ts: Date.now() }); save(M); busy = new AbortController(); draw();
        const prompt = SYS + '\n\n' + ctx() + '\n\nPasserelles disponibles depuis cet outil (id = ce qui passe) :\n' + L.map(x => x[1] + ' = ' + x[2]).join('\n') + '\n\nL’utilisateur demande : ' + t + '\n\nChoisis les passerelles utiles (3 au plus, la plus utile d’abord) et dis en une phrase pourquoi. Réponds UNIQUEMENT par un JSON {"items":[{"id":"…","pourquoi":"…"}]} ({"items":[]} si aucune ne convient).';
        let R = null, err = ''; try { R = (XAI.json(await XAI.ask(prompt, { signal: busy.signal, maxTokens: 800 })).items || []); } catch (e) { err = e && e.name === 'AbortError' ? 'Arrêté.' : (e && e.message || String(e)); }
        busy = null; draw();
        if (!R) { const M2 = msgs(); M2.push({ r: 'a', err: 1, t: '⚠️ ' + err, ts: Date.now() }); save(M2); draw(); gate(L); return; }
        const why = {}, pick = []; R.forEach(x => { const l = L.find(y => y[1] === x.id); if (l && !pick.includes(l)) { pick.push(l); why[l[1]] = String(x.pourquoi || '').slice(0, 200); } });
        gate(pick.length ? pick : L, why, pick.length ? '🔀 Passerelles conseillées par l’IA' : '🔀 Aucune passerelle ne correspond : toutes celles de l’outil');
    }
    // « envoie le matériel vers DEVISO » : proposé directement, sans appel à l'IA
    function intent(t) {
        const f = String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); if (!/\b(envoi|envoie|envoyer|transf[e]?re|transmet|transmettre|pousse|exporte|bascule|passe)\w*\b/.test(f)) return null;
        const L = links().filter(x => { const T = typeof XLINKS !== 'undefined' ? XLINKS.T[x[1]] : null; const nm = (T ? T[1] : x[1]).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); return f.includes(nm) || f.includes(x[1]); });
        return L.length ? L : null;
    }
    async function act() {
        const A = ACT[APP], ta = document.querySelector('#xaic textarea'); if (!A || busy) return;
        const t = (ta.value || '').trim() || (msgs().filter(m => m.r === 'u').slice(-1)[0] || {}).t; if (!t) { ta.placeholder = 'Décrivez d’abord ce que l’IA doit créer…'; ta.focus(); return; } ta.value = '';
        const L = msgs(); L.push({ r: 'u', t: A.lab + ' : ' + t, ts: Date.now() }); save(L); busy = new AbortController(); draw();
        const prompt = SYS + '\n\n' + ctx() + '\n\n' + (typeof A.ask === 'function' ? A.ask() : A.ask) + '\nDemande : ' + t + '\n\nRéponds UNIQUEMENT par un JSON de la forme ' + A.schema + ' (' + (A.max || 10) + ' éléments au plus, dates au format AAAA-MM-JJ à partir d’aujourd’hui si besoin).';
        let items = null, err = ''; try { const r = await XAI.ask(prompt, { signal: busy.signal, maxTokens: 5000 }); items = (XAI.json(r).items || []).slice(0, A.max || 20); } catch (e) { err = e && e.message || String(e); }
        busy = null; draw(); const box = document.querySelector('#xaic .l'); if (!box) return;
        if (!items || !items.length) { const L2 = msgs(); L2.push({ r: 'a', err: 1, t: '⚠️ ' + (err || 'L’IA n’a rien proposé de lisible. Reformulez la demande.'), ts: Date.now() }); save(L2); draw(); return; }
        box.insertAdjacentHTML('beforeend', '<div class="m a" id="xaic-prop"><b>Proposition — cochez ce qu’il faut créer :</b>' + items.map((x, i) => '<label style="display:flex;gap:6px;margin-top:5px;white-space:normal"><input type="checkbox" data-k="' + i + '" checked><span>' + esc(A.row(x)) + '</span></label>').join('') + '<div style="display:flex;gap:8px;margin-top:8px"><button class="cp" data-ok style="opacity:1;font-weight:700">✅ Créer</button><button class="cp" data-no>Annuler</button></div></div>'); box.scrollTop = box.scrollHeight;
        const pr = document.getElementById('xaic-prop');
        pr.querySelector('[data-no]').onclick = () => pr.remove();
        pr.querySelector('[data-ok]').onclick = () => { const sel = items.filter((x, i) => pr.querySelector('[data-k="' + i + '"]').checked); let m; try { m = sel.length ? A.apply(sel) : 'Rien de créé'; } catch (e) { m = '⚠️ ' + e.message; } pr.remove(); const L3 = msgs(); L3.push({ r: 'a', t: '✅ ' + m + '.', ts: Date.now() }); save(L3); draw(); };
    }
    if (typeof XBOOT !== 'undefined') XBOOT.ready(mount, 1950); setTimeout(mount, 300); addEventListener('load', () => setTimeout(mount, 300)); addEventListener('storage', e => { if (e.key && /^xiii\.ai/.test(e.key)) mount(); }); setInterval(mount, 5000);
    return { open, toggle, mount };
})();
