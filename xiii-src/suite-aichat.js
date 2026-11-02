// =====================================================================
//  SUITE XIII — XAIC : ✨ assistant IA (avec l'IA de l'utilisateur, ⚙️ › Intelligence artificielle)
//  Bouton « ✨ IA » dans la barre du haut (à droite du ＋ de l'outil) — visible seulement quand une IA est connectée.
//  Volet à droite : conversation gardée par projet XIII, contexte (outil ouvert, projet, date), copier une réponse.
//  Rien ne part tant que l'utilisateur n'envoie pas de message ; l'équipe n'est jamais envoyée si l'option est cochée.
// =====================================================================
var XAIC = window.XAIC || (() => {
    if (/[?&](xrun|xmodel|xvit)=/.test(location.search)) return {};
    const APP = '__APP__', J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ok = () => typeof XAI !== 'undefined' && XAI.configured && XAI.configured();
    function proj() { const s = J('xiii.projets', null) || {}, id = s.active || '_', L = s.list || s.projets || s.items || []; const p = Array.isArray(L) ? L.find(x => x && (x.id === id)) : (L[id] || null); return { id, title: (p && (p.title || p.name || p.titre)) || '' }; }
    const KEY = () => 'xiii.aichat.' + proj().id, msgs = () => J(KEY(), []), save = L => W(KEY(), L.slice(-60));
    const nm = () => (typeof XLINKS !== 'undefined' && XLINKS.T && XLINKS.T[APP] ? XLINKS.T[APP][1] : APP.toUpperCase());
    const SYS = 'Tu es l’assistant de SUITE XIII, une suite d’outils web pour la production audiovisuelle (tournage, direct, captation, post-production). Tu réponds en français, de façon concise et concrète, comme un régisseur / directeur de production expérimenté : préparation, feuilles de service, plans de tournage, matériel, devis, conventions collectives de l’audiovisuel, sécurité sur les plateaux. Quand c’est utile, indique quel outil XIII sert à quoi (PLANO plan de tournage et plateau, CALL SHEETO feuilles de service, CONDUCO conducteurs, DEVISO devis, MATOS matériel, CASTO casting, REPERO repérages, STORYBOARDO storyboard, PLANNO tâches, DOSSIER dossier de production, SYNO synoptiques…). Si tu n’es pas sûr d’un chiffre réglementaire, dis-le.';
    function ctx() { const p = proj(), d = new Date(); return 'Contexte : outil ouvert ' + nm() + (p.title ? ' · projet « ' + p.title + ' »' : '') + ' · ' + d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + '.'; }
    let busy = null;
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
        if (plus) plus.insertAdjacentElement('afterend', b); else { b.classList.add('fl'); document.body.appendChild(b); }
    }
    function toggle() { const o = document.getElementById('xaic'); if (o) { o.remove(); return; } open(); }
    function open() {
        css(); const p = proj();
        document.body.insertAdjacentHTML('beforeend', '<aside id="xaic" role="dialog" aria-label="Assistant IA"><header><div style="flex:1"><b>✨ Assistant XIII</b><small>' + esc(XAI.label ? XAI.label() : '') + (p.title ? ' · ' + esc(p.title) : '') + '</small></div><button data-clr title="Effacer la conversation de ce projet">🧹</button><button data-x title="Fermer">✕</button></header><div class="l"></div><form><textarea placeholder="Votre question… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"></textarea><button>Envoyer</button></form></aside>');
        const o = document.getElementById('xaic'), ta = o.querySelector('textarea');
        o.querySelector('[data-x]').onclick = () => o.remove();
        o.querySelector('[data-clr]').onclick = () => { if (confirm('Effacer la conversation de ce projet ?')) { save([]); draw(); } };
        o.querySelector('form').onsubmit = e => { e.preventDefault(); send(ta.value); ta.value = ''; };
        ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(ta.value); ta.value = ''; } if (e.key === 'Escape') o.remove(); });
        draw(); setTimeout(() => ta.focus(), 50);
    }
    const SUG = ['Prépare la liste des étapes de préparation de ce tournage', 'Quels postes prévoir pour une captation 3 caméras ?', 'Rappelle-moi les temps de repos entre deux journées', 'Aide-moi à rédiger le mot d’accueil de la feuille de service'];
    function draw() {
        const o = document.getElementById('xaic'); if (!o) return; const L = msgs(), box = o.querySelector('.l');
        box.innerHTML = (L.length ? '' : '<p class="h">Posez une question sur votre production : l’assistant connaît le métier et les outils XIII. Rien ne part avant votre envoi ; seul le contexte (outil ouvert, titre du projet, date) accompagne la question.</p><div class="sg">' + SUG.map(s => '<button>' + esc(s) + '</button>').join('') + '</div>') +
            L.map((m, i) => '<div class="m ' + (m.r === 'u' ? 'u' : 'a') + (m.err ? ' e' : '') + '">' + esc(m.t) + (m.r === 'a' && !m.err ? '<button class="cp" data-cp="' + i + '">📋 Copier</button>' : '') + '</div>').join('') + (busy ? '<div class="m a h">⏳ L’IA réfléchit…</div>' : '');
        box.querySelectorAll('.sg button').forEach(b => b.onclick = () => send(b.textContent));
        box.querySelectorAll('[data-cp]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(L[+b.dataset.cp].t); b.textContent = '✅ Copié'; } catch (e) { } });
        box.scrollTop = box.scrollHeight;
    }
    async function send(t) {
        t = String(t || '').trim(); if (!t || busy) return; const L = msgs(); L.push({ r: 'u', t, ts: Date.now() }); save(L); busy = new AbortController(); draw();
        const hist = L.slice(-12, -1).map(m => (m.r === 'u' ? 'Utilisateur : ' : 'Assistant : ') + m.t).join('\n\n');
        const prompt = SYS + '\n\n' + ctx() + (hist ? '\n\nConversation précédente :\n' + hist : '') + '\n\nUtilisateur : ' + t + '\n\nAssistant :';
        let r; try { r = { r: 'a', t: String(await XAI.ask(prompt, { signal: busy.signal, maxTokens: 2000 }) || '').trim() || '(réponse vide)' }; } catch (e) { r = { r: 'a', err: 1, t: '⚠️ ' + (e && e.message || e) }; }
        busy = null; const L2 = msgs(); L2.push(Object.assign(r, { ts: Date.now() })); save(L2); draw();
    }
    setTimeout(mount, 300); addEventListener('load', () => setTimeout(mount, 300)); addEventListener('storage', e => { if (e.key && /^xiii\.ai/.test(e.key)) mount(); }); setInterval(mount, 5000);
    return { open, toggle, mount };
})();
