// =====================================================================
//  SUITE XIII — XERRL : 🩺 journal des erreurs visible par l'utilisateur
//  Chaque outil note ses erreurs JavaScript dans ce navigateur (50 dernières, doublons regroupés).
//  Démarrer › 🔔 Notifs : « 🩺 n erreur(s) récente(s) » → détail, copie du rapport, envoi en un clic dans 🐞 Bug & Suggestion.
//  (Le journal anonyme envoyé au serveur — XERR — reste inchangé.)
// =====================================================================
var XERRL = window.XERRL || (() => {
    const K = 'xiii.errl', APP = '__APP__', MAIL = 'mlamotte@3is.fr';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const clean = s => String(s || '').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '‹e-mail›').replace(/\b0\d([ .]?\d\d){4}\b/g, '‹tél›').slice(0, 300);
    let n = 0;
    function note(msg, src, line, col, kind) {
        if (n++ > 20) return; msg = clean(msg); if (!msg || /ResizeObserver loop|Script error\.?$/i.test(msg)) return;
        const file = String(src || '').split(/[?#]/)[0].split('/').pop(), L = J(K, []), k = APP + '|' + msg + '|' + file + ':' + (line || 0), o = L.find(x => x.k === k);
        if (o) { o.n = (o.n || 1) + 1; o.ts = Date.now(); } else L.push({ k, app: APP, msg, at: file ? file + ':' + (line || 0) + (col ? ':' + col : '') : '', kind: kind || 'erreur', ts: Date.now(), n: 1 });
        L.sort((a, b) => b.ts - a.ts); W(K, L.slice(0, 50)); try { dispatchEvent(new Event('xiii-errl')); } catch (e) { }
    }
    if (!/[?&](xrun|xmodel|xvit)=/.test(location.search)) {
        addEventListener('error', e => { if (e && e.message) note(e.message, e.filename, e.lineno, e.colno); }, true);
        addEventListener('unhandledrejection', e => { const r = e && e.reason; const m = r && (r.message || (typeof r === 'string' ? r : '')); if (m && !/abort|NetworkError|Failed to fetch|Load failed/i.test(m)) note(m, r && r.stack && (/\((.*?):\d+:\d+\)/.exec(r.stack) || [])[1], (r && r.stack && /:(\d+):\d+\)/.exec(r.stack) || [])[1], 0, 'promesse'); });
    }
    const list = () => J(K, []), recent = () => list().filter(x => Date.now() - x.ts < 7 * 864e5);
    const nm = a => (typeof XLINKS !== 'undefined' && XLINKS.T[a] ? XLINKS.T[a][1] : String(a || '').toUpperCase());
    function report(L) {
        L = L || recent(); let v = ''; try { v = (document.querySelector('meta[name=xiii-version]') || {}).content || ''; } catch (e) { }
        const ua = navigator.userAgent, br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navigateur', os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : '';
        return ['Bonjour,', '', '[Décrivez ici ce que vous faisiez quand le problème est arrivé]', '', '— Journal des erreurs (' + L.length + ') —'].concat(L.slice(0, 15).map(x => '• ' + new Date(x.ts).toLocaleString('fr-FR') + ' · ' + nm(x.app) + ' · ' + x.msg + (x.at ? ' (' + x.at + ')' : '') + (x.n > 1 ? ' ×' + x.n : '')),
            ['', 'Site : ' + location.host + ' · ' + br + ' / ' + os + ' · écran ' + screen.width + '×' + screen.height + (v ? ' · version ' + v : '')]).join('\n');
    }
    const mailto = L => 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Bug & Suggestion de la suite XIII') + '&body=' + encodeURIComponent(report(L).slice(0, 1800));
    function open() {
        css(); const old = document.getElementById('xerl'); if (old) old.remove(); const L = list();
        document.body.insertAdjacentHTML('beforeend', '<div id="xerl" role="dialog" aria-modal="true" aria-label="Journal des erreurs"><div class="xel-b"><div class="xel-h"><b>🩺 Journal des erreurs</b><button class="xel-x" aria-label="Fermer">✕</button></div><div class="xel-c">' +
            (L.length ? '<p class="xel-n">Erreurs rencontrées par les outils dans ce navigateur (50 dernières, aucune donnée de projet). Envoyez-les en un clic : cela aide beaucoup à corriger.</p><div class="xel-l">' + L.map(x => '<div class="xel-i' + (Date.now() - x.ts < 864e5 ? ' new' : '') + '"><div><b>' + esc(nm(x.app)) + '</b><small>' + esc(new Date(x.ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })) + (x.n > 1 ? ' · ×' + x.n : '') + (x.kind === 'promesse' ? ' · asynchrone' : '') + '</small></div><code>' + esc(x.msg) + (x.at ? '<i>' + esc(x.at) + '</i>' : '') + '</code></div>').join('') + '</div>' +
                '<div class="xel-a"><a class="p" href="' + esc(mailto(L)) + '">🐞 Envoyer dans Bug &amp; Suggestion</a><button data-cp>📋 Copier le rapport</button><button data-clr>🧹 Vider</button></div>' : '<div class="xel-ok"><b>✅ Aucune erreur enregistrée</b><span>Si un outil se comporte mal, 🐞 Bug &amp; Suggestion reste là pour le signaler.</span></div>') + '</div></div></div>');
        const o = document.getElementById('xerl'), close = () => o.remove(); o.querySelector('.xel-x').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); }); o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        const cp = o.querySelector('[data-cp]'); if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(report(L)); cp.textContent = '✅ Copié'; } catch (e) { cp.textContent = 'Copie impossible'; } };
        const cl = o.querySelector('[data-clr]'); if (cl) cl.onclick = () => { if (!confirm('Vider le journal des erreurs de ce navigateur ?')) return; W(K, []); close(); try { dispatchEvent(new Event('xiii-errl')); } catch (e) { } };
    }
    function css() {
        if (document.getElementById('xel-css')) return; const s = document.createElement('style'); s.id = 'xel-css';
        s.textContent = '#xerl{position:fixed;inset:0;z-index:9992;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;font:14px system-ui,sans-serif}.xel-b{background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;width:min(680px,100%);max-height:88vh;display:flex;flex-direction:column}.xel-h{display:flex;align-items:center;padding:12px 14px;border-bottom:1px solid var(--border-soft,#3a3633)}.xel-h b{font-size:16px}.xel-x{margin-left:auto;background:none;border:0;color:inherit;font-size:17px;cursor:pointer}.xel-c{overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px}' +
            '.xel-n{margin:0;font-size:12.5px;color:var(--text-dim,#aaa)}.xel-l{display:flex;flex-direction:column;gap:6px}.xel-i{display:flex;gap:10px;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.04);border-left:3px solid #777}.xel-i.new{border-left-color:#e57373}.xel-i>div{flex:none;width:120px}.xel-i b{display:block;font-size:12.5px}.xel-i small{font-size:11px;color:var(--text-dim,#aaa)}.xel-i code{flex:1;min-width:0;font:12px ui-monospace,monospace;overflow-wrap:anywhere}.xel-i code i{display:block;font-style:normal;color:var(--text-dim,#999);font-size:11px}' +
            '.xel-a{display:flex;gap:8px;flex-wrap:wrap}.xel-a a,.xel-a button{font:600 13px system-ui,sans-serif;padding:8px 13px;border-radius:9px;border:1px solid var(--border-color,#45454b);background:transparent;color:inherit;cursor:pointer;text-decoration:none}.xel-a .p{background:#F0B378;color:#1a1a1a;border-color:#F0B378}.xel-ok{display:flex;flex-direction:column;gap:4px;padding:16px;border-radius:12px;background:rgba(102,187,106,.1);border:1px solid rgba(102,187,106,.4)}.xel-ok span{font-size:12.5px;color:var(--text-dim,#bbb)}';
        document.head.appendChild(s);
    }
    // 🐞 Bug & Suggestion (accueil) : le message part avec le journal des erreurs récentes
    if (APP === 'index') document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('#xbug-btn'); if (a && recent().length) a.href = mailto(recent()); }, true);
    return { open, list, recent, report, note };
})();
