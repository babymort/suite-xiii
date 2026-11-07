// SUITE XIII — module commun. Source : xiii-src/suite-mcp.js
// =====================================================================
//  SUITE XIII — 🔌 Connecteur SUITE XIII pour Claude et ChatGPT
//  Crée l'adresse personnelle du connecteur MCP (fonction Supabase « xiii-mcp ») à coller dans Claude.ai ou ChatGPT :
//  l'IA lit — et, si vous l'autorisez, modifie — le projet du Drive d'équipe avec VOTRE abonnement.
//  Le Master crée un lien dédié (lecture seule ou écriture, durée), révocable à tout moment ; rien n'est stocké chez SUITE XIII.
// =====================================================================
var XMCPC = window.XMCPC || (() => {
    const FN = 'https://abvvsoccbdftticlmpgi.supabase.co/functions/v1/xiii-mcp/k/', NOM = '🤖 Connecteur IA';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const cfg = () => { const c = J('xiii.drive', null); return c && c.url ? c : null; };
    const b64 = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const link = (u, t, n) => FN + b64(JSON.stringify({ u, t, n: n || 'Claude' }));
    async function api(a, p) { const c = cfg(); const r = await fetch(c.url, { method: 'POST', redirect: 'follow', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: 'Master' }, p || {})) }); return r.json(); }
    function css() {
        if (document.getElementById('xmcpc-css')) return; const s = document.createElement('style'); s.id = 'xmcpc-css';
        s.textContent = '#xmcpc{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif}#xmcpc .b{background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);border-radius:12px;width:min(720px,96vw);max-height:90vh;overflow:auto;padding:16px 18px}#xmcpc h3{margin:0 0 8px}#xmcpc .r{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}#xmcpc code{word-break:break-all;display:block;background:rgba(0,0,0,.3);padding:8px;border-radius:6px;font-size:12px}#xmcpc .d{opacity:.75}#xmcpc .w{color:#ffb74d}#xmcpc ol{padding-left:20px}#xmcpc li{margin:3px 0}#xmcpc .go{background:rgb(var(--accent,240,179,120));color:#111;border:0;border-radius:6px;padding:7px 14px;font-weight:700;cursor:pointer}#xmcpc button{cursor:pointer}';
        document.head.appendChild(s);
    }
    const close = () => { const o = document.getElementById('xmcpc'); if (o) o.remove(); };
    const HOW = '<h3 style="margin-top:14px">Où coller l’adresse</h3><ol><li><b>Claude.ai</b> (offres qui acceptent les connecteurs personnalisés) : Paramètres › Connecteurs › <i>Ajouter un connecteur personnalisé</i> → nom « SUITE XIII », collez l’adresse, sans identifiants OAuth. Activez-le ensuite dans une conversation (menu des outils).</li>'
        + '<li><b>ChatGPT</b> (selon votre offre) : Paramètres › Applications et connecteurs › mode développeur › <i>Créer</i> → adresse du serveur MCP = l’adresse ci-dessus, authentification : aucune.</li>'
        + '<li>Demandez par exemple : « Lis la feuille de service de demain et vérifie les horaires », « Ajoute deux lignes de matériel au devis ».</li></ol>'
        + '<p class="d">🔒 L’adresse contient votre clé : ne la partagez pas. L’IA n’écrit que si le lien est en écriture, et vous montre chaque modification avant de la faire. Les modifications arrivent chez l’équipe par le Drive comme une modification normale (signée « 🤖 … connecteur XIII »). Photos et fichiers lourds ne sont pas transmis.</p>';
    async function open() {
        css(); close(); const c = cfg(), o = document.createElement('div'); o.id = 'xmcpc'; document.body.appendChild(o);
        o.addEventListener('mousedown', e => { if (e.target === o) close(); });
        const shell = h => { o.innerHTML = '<div class="b"><div class="r" style="margin-top:0"><h3 style="flex:1;margin:0">🔌 SUITE XIII dans Claude ou ChatGPT</h3><button data-x>✕</button></div>' + h + '</div>'; o.querySelector('[data-x]').onclick = close; };
        if (!c) { shell('<p>Le connecteur passe par le <b>☁️ Drive d’équipe</b> du projet : reliez d’abord le projet au Drive (bouton ☁️ en haut des outils), puis revenez ici.</p><p class="d">Avec votre abonnement Claude Pro / Max ou ChatGPT, l’IA lira alors vos feuilles de service, devis, plannings, matériel… sans clé API.</p>'); return; }
        if (c.tok) { // membre : son propre lien, avec ses droits
            shell('<p>Votre lien d’équipe donne au connecteur <b>les mêmes droits que vous</b> (outils et écriture décidés par le Master).</p><div class="r"><label>Nom affiché <input id="xm-n" value="Claude" style="width:140px"></label></div><code id="xm-u"></code><div class="r"><button class="go" id="xm-cp">📋 Copier l’adresse</button></div>' + HOW);
            const up = () => o.querySelector('#xm-u').textContent = link(c.url, c.tok, o.querySelector('#xm-n').value.trim() || 'Claude'); up(); o.querySelector('#xm-n').oninput = up;
            o.querySelector('#xm-cp').onclick = async () => { try { await navigator.clipboard.writeText(o.querySelector('#xm-u').textContent); o.querySelector('#xm-cp').textContent = '✅ Copiée'; } catch (e) { } };
            return;
        }
        // Master : lien dédié, droits et durée au choix, liste des connecteurs existants (révocables)
        shell('<p>Créez un <b>lien dédié au connecteur</b> : vous choisissez ce que l’IA peut faire, et vous pourrez le révoquer à tout moment.</p>'
            + '<div class="r"><label>Droits <select id="xm-d"><option value="read">👁 Lecture seule (conseillé pour commencer)</option><option value="edit">✏️ Lecture et écriture</option></select></label><label>Durée <select id="xm-e"><option value="30">30 jours</option><option value="90">90 jours</option><option value="0">sans limite</option></select></label><label>Nom <input id="xm-n" value="Claude" style="width:110px"></label><button class="go" id="xm-mk">🔌 Créer l’adresse</button></div><div id="xm-out"></div><h3 style="margin-top:14px">Connecteurs actifs</h3><div id="xm-list" class="d">Chargement…</div>' + HOW);
        const list = async () => { const L = o.querySelector('#xm-list'); try { const j = await api('team'); const T = (j.team || []).filter(m => String(m.nom).indexOf(NOM) === 0 && !m.off && (!m.exp || m.exp > Date.now()));
            L.innerHTML = T.length ? T.map(m => '<div class="r">' + esc(m.nom) + ' · ' + (m.droit === 'edit' ? '✏️ écriture' : '👁 lecture') + ' · ' + (m.exp ? 'jusqu’au ' + new Date(m.exp).toLocaleDateString('fr-FR') : 'sans limite') + ' <button data-rm="' + esc(m.tok) + '">⛔ Révoquer</button></div>').join('') : 'Aucun connecteur actif.';
            L.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { if (!confirm('Révoquer ce connecteur ? L’adresse ne fonctionnera plus.')) return; await api('rminv', { tok: b.dataset.rm }); list(); }); } catch (e) { L.textContent = 'Liste indisponible (Drive injoignable).'; } };
        list();
        o.querySelector('#xm-mk').onclick = async () => {
            const b = o.querySelector('#xm-mk'), d = o.querySelector('#xm-d').value, days = +o.querySelector('#xm-e').value, n = o.querySelector('#xm-n').value.trim() || 'Claude'; b.disabled = true; b.textContent = '⏳…';
            try { const j = await api('mkinv', { nom: NOM + ' · ' + n, droit: d, exp: days ? Date.now() + days * 864e5 : 0 }); if (!j.ok || !j.tok) throw new Error(j.err || 'refus du Drive');
                const u = link(c.url, j.tok, n); o.querySelector('#xm-out').innerHTML = '<p>✅ Adresse créée (' + (d === 'edit' ? 'lecture et écriture' : 'lecture seule') + ') :</p><code>' + esc(u) + '</code><div class="r"><button class="go" id="xm-cp">📋 Copier l’adresse</button></div>';
                o.querySelector('#xm-cp').onclick = async () => { try { await navigator.clipboard.writeText(u); o.querySelector('#xm-cp').textContent = '✅ Copiée'; } catch (e) { } }; list(); }
            catch (e) { o.querySelector('#xm-out').innerHTML = '<p class="w">⚠️ ' + esc(e.message || e) + '</p>'; }
            b.disabled = false; b.textContent = '🔌 Créer l’adresse';
        };
    }
    return { open, link };
})();
