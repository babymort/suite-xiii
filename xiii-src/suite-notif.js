// =====================================================================
//  SUITE XIII — XNOTIF : notifications à son goût (saison 6, phase P)
//  Fenêtre « 🔔 Notifications » (⚙️ › Affichage, page Réglages, Démarrer › 🔔 Notifs) :
//   · quoi : chat et mentions, annonces du Master, documents reçus, enregistrements de l'équipe, alertes, tâches terminées ;
//   · comment : pour chacun, bannière (notification du système), son, badge (pastille de Démarrer et de l'icône de l'application) ;
//   · quand : heures calmes (ex. 22 h → 7 h, et/ou le week-end) : ni bannière ni son, le badge reste ; les alertes urgentes
//     peuvent passer quand même.
//  Appliqué partout : notifications des outils (ENCODO…), notifications poussées de l'équipe (service worker), sons, badges.
//  Réglage personnel, valable pour tous les projets (clé xiii.notif.cfg ; copie lue par le service worker).
// =====================================================================
(function () {
    if (window.XNOTIF) return;
    const K = 'xiii.notif.cfg';
    const CATS = [['chat', '💬', 'Chat et mentions'], ['annonce', '📣', 'Annonces et messages du Master'], ['doc', '📥', 'Documents reçus d\'un autre outil'], ['enreg', '📄', 'Enregistrements de l\'équipe'], ['alerte', '🚨', 'Alertes (urgences, incohérences)'], ['tache', '⚙️', 'Tâches terminées (conversions, exports)']];
    const DEF = { c: {}, quiet: { on: false, from: '22:00', to: '07:00', we: false }, urg: true };
    CATS.forEach(c => DEF.c[c[0]] = { ban: true, snd: c[0] === 'chat' || c[0] === 'alerte', badge: true });
    const get = () => { let o = {}; try { o = JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { } const r = JSON.parse(JSON.stringify(DEF)); Object.assign(r.quiet, o.quiet || {}); if (o.urg === false) r.urg = false; CATS.forEach(c => Object.assign(r.c[c[0]], (o.c || {})[c[0]] || {})); return r; };
    let C = get();
    const mins = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : 0; };
    function quiet(d) { const q = C.quiet; d = d || new Date(); if (!q.on) return false; if (q.we && (d.getDay() === 0 || d.getDay() === 6)) return true; const n = d.getHours() * 60 + d.getMinutes(), a = mins(q.from), b = mins(q.to); return a === b ? false : a < b ? n >= a && n < b : n >= a || n < b; }
    // catégorie d'un message d'après son titre / texte (les outils et le Drive n'en donnent pas toujours une)
    function cat(t) { t = String(t || '').toLowerCase(); return /🚨|urgent|alerte|incoh|danger|annul/.test(t) ? 'alerte' : /@|mention|chat|💬|message de|répond/.test(t) ? 'chat' : /annonce|📣|master|convocation/.test(t) ? 'annonce' : /reçu|envoy|📥|passerelle|intégr/.test(t) ? 'doc' : /enregistr|📄|modifi|sauvegard/.test(t) ? 'enreg' : /termin|convers|export|encodo|✅/.test(t) ? 'tache' : 'annonce'; }
    function ok(c, ch, urgent) { const p = C.c[c] || C.c.annonce; if (!p[ch]) return false; if (ch !== 'badge' && quiet() && !(urgent && C.urg)) return false; return true; }
    // copie pour le service worker (notifications poussées quand la suite est fermée)
    async function toSW() { try { if (!window.caches) return; const c = await caches.open('xnotifs'); await c.put('prefs', new Response(JSON.stringify(C))); } catch (e) { } }
    // ---------- 1. bannières : notifications du système ----------
    const N0 = window.Notification;
    if (N0 && !N0.__xn) { const N1 = function (title, opt) { const u = /🚨|urgent/i.test(title + ' ' + ((opt || {}).body || '')); if (!ok(cat(title + ' ' + ((opt || {}).body || '')), 'ban', u)) return { close() { }, addEventListener() { }, set onclick(v) { }, get onclick() { return null; } }; return new N0(title, opt); };
        Object.setPrototypeOf(N1, N0); N1.prototype = N0.prototype; Object.defineProperty(N1, 'permission', { get: () => N0.permission }); N1.requestPermission = (...a) => N0.requestPermission(...a); N1.__xn = 1; try { window.Notification = N1; } catch (e) { } }
    try { const SR = window.ServiceWorkerRegistration && ServiceWorkerRegistration.prototype; if (SR && SR.showNotification && !SR.showNotification.__xn) { const s0 = SR.showNotification; SR.showNotification = function (title, opt) { const u = /🚨|urgent/i.test(title + ' ' + ((opt || {}).body || '')); if (!ok(cat(title + ' ' + ((opt || {}).body || '')), 'ban', u)) return Promise.resolve(); return s0.apply(this, arguments); }; SR.showNotification.__xn = 1; } } catch (e) { }
    // ---------- 2. sons ----------
    let AC = null; const ding = (f1, f2) => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime; [[f1, 0], [f2, .11]].forEach(([f, d]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t + d); g.gain.exponentialRampToValueAtTime(.09, t + d + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d + .35); o.connect(g).connect(AC.destination); o.start(t + d); o.stop(t + d + .4); }); } catch (e) { } };
    function sound(c, urgent) { if (window.top !== window) { try { window.top.postMessage({ xnotifSnd: c, u: !!urgent }, location.origin); } catch (e) { } return; } if (!ok(c, 'snd', urgent)) return; if (c === 'alerte') ding(880, 660); else ding(660, 990); }
    addEventListener('message', e => { if (e.origin === location.origin && e.data && e.data.xnotifSnd && window.top === window) sound(e.data.xnotifSnd, e.data.u); });
    try { if (navigator.serviceWorker) navigator.serviceWorker.addEventListener('message', e => { const d = e.data || {}; if (d.t === 'xiii-push' && window.top === window) { const m = d.m || {}; sound(m.cat || cat((m.title || '') + ' ' + (m.body || '')), m.lvl === 'urg'); } }); } catch (e) { }
    // ---------- 3. badges : pastille de Démarrer + icône de l'application installée ----------
    let lastN = -1;
    function badges() {
        const i = document.querySelector('#xst-b i'); if (!i) return; const n = parseInt(i.textContent, 10) || 0;
        const show = ok('chat', 'badge') || ok('doc', 'badge'); i.style.visibility = show ? '' : 'hidden';
        if (n > lastN && lastN >= 0) sound('chat'); lastN = n;
        try { if (navigator.setAppBadge && window.top === window) { if (show && n) navigator.setAppBadge(n); else navigator.clearAppBadge && navigator.clearAppBadge(); } } catch (e) { }
    }
    // ---------- fenêtre ----------
    const css = document.createElement('style'); css.id = 'xnotif-css';
    css.textContent = '#xnf2-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center}#xnf2-box{width:min(600px,94vw);max-height:90vh;overflow-y:auto;background:var(--bg-panel,#1c1c20);color:var(--text-main,#eee);border:1px solid var(--border-color,#333);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:13.5px system-ui,sans-serif}' +
        '#xnf2-box h3{margin:0;padding:16px 18px 2px;font:600 16px system-ui,sans-serif}#xnf2-box .sub{padding:0 18px 8px;opacity:.65;font-size:12.5px}#xnf2-box .f{padding:10px 18px;border-top:1px solid var(--border-color,#2a2a2e)}#xnf2-box .f>b{display:block;margin-bottom:8px}' +
        '#xnf2-box table{width:100%;border-collapse:collapse}#xnf2-box th{font:600 11px system-ui,sans-serif;text-transform:uppercase;letter-spacing:.05em;opacity:.6;padding:4px;text-align:center}#xnf2-box th:first-child{text-align:left}#xnf2-box td{padding:6px 4px;border-top:1px solid var(--border-color,#2a2a2e);text-align:center}#xnf2-box td:first-child{text-align:left}#xnf2-box input[type=checkbox]{width:16px;height:16px;cursor:pointer;accent-color:#f0b378}' +
        '#xnf2-box label.l{display:flex;gap:8px;align-items:center;margin:4px 0}#xnf2-box input[type=time]{background:transparent;color:inherit;border:1px solid var(--border-color,#444);border-radius:7px;padding:4px 6px}#xnf2-box button{padding:6px 11px;border-radius:8px;border:1px solid var(--border-color,#444);background:transparent;color:inherit;cursor:pointer;font:500 12.5px system-ui,sans-serif}#xnf2-box .ft{display:flex;gap:8px;padding:12px 18px;border-top:1px solid var(--border-color,#333)}#xnf2-box .st{font-size:12px;opacity:.75}';
    (document.head || document.documentElement).appendChild(css);
    function save() { try { localStorage.setItem(K, JSON.stringify(C)); } catch (e) { } toSW(); badges(); }
    function open() {
        close(); const o = document.createElement('div'); o.id = 'xnf2-ov'; o.setAttribute('role', 'dialog');
        const perm = window.Notification ? N0.permission : 'na', q = C.quiet;
        o.innerHTML = '<div id="xnf2-box"><h3>🔔 Notifications</h3><div class="sub">Choisissez quoi vous prévient, et comment. Réglage personnel, pour tous les projets.</div>' +
            '<div class="f"><table><tr><th>Quoi</th><th>Bannière</th><th>Son</th><th>Badge</th></tr>' + CATS.map(c => '<tr><td>' + c[1] + ' ' + c[2] + '</td>' + ['ban', 'snd', 'badge'].map(ch => '<td><input type="checkbox" data-c="' + c[0] + '" data-ch="' + ch + '"' + (C.c[c[0]][ch] ? ' checked' : '') + '></td>').join('') + '</tr>').join('') + '</table>' +
            '<p class="st">Bannière : notification du système (même suite fermée, si elle est installée). Badge : pastille sur Démarrer et sur l\'icône de l\'application. ' + (perm === 'granted' ? '✅ Notifications autorisées sur cet appareil.' : perm === 'denied' ? '⛔ Notifications bloquées dans le navigateur (à rouvrir dans ses réglages du site).' : perm === 'na' ? 'Ce navigateur n\'affiche pas de bannières.' : '<button data-perm>Autoriser les bannières sur cet appareil</button>') + '</p></div>' +
            '<div class="f"><b>🌙 Heures calmes</b><label class="l"><input type="checkbox" data-q="on"' + (q.on ? ' checked' : '') + '> Ni bannière ni son pendant les heures calmes</label><div class="l" style="padding-left:24px;flex-wrap:wrap">de <input type="time" data-q="from" value="' + q.from + '"> à <input type="time" data-q="to" value="' + q.to + '"></div><label class="l"><input type="checkbox" data-q="we"' + (q.we ? ' checked' : '') + '> Tout le week-end aussi</label><label class="l"><input type="checkbox" data-urg' + (C.urg ? ' checked' : '') + '> Les alertes urgentes 🚨 passent quand même</label><p class="st">Les badges restent pendant les heures calmes : rien n\'est perdu.' + (quiet() ? ' <b>🌙 Heures calmes en ce moment.</b>' : '') + '</p></div>' +
            '<div class="ft"><button data-test>🔔 Tester</button><span style="flex:1"></span><button data-rs>↺ Par défaut</button><button data-ok style="font-weight:700">✓ Terminé</button></div></div>';
        document.body.appendChild(o);
        o.addEventListener('change', e => { const t = e.target; if (t.dataset.c) { C.c[t.dataset.c][t.dataset.ch] = t.checked; } else if (t.dataset.q) { C.quiet[t.dataset.q] = t.type === 'checkbox' ? t.checked : t.value; } else if (t.hasAttribute('data-urg')) C.urg = t.checked; save(); });
        o.addEventListener('click', e => { const t = e.target; if (t === o || t.closest('[data-ok]')) return close(); if (t.closest('[data-rs]')) { C = JSON.parse(JSON.stringify(DEF)); save(); return open(); }
            if (t.closest('[data-perm]')) { N0.requestPermission().then(open); return; }
            if (t.closest('[data-test]')) { if (quiet()) { alert('🌙 Heures calmes en ce moment : ni bannière ni son.'); return; } sound('chat'); try { if (N0 && N0.permission === 'granted' && ok('chat', 'ban')) new N0('SUITE XIII', { body: '🔔 Test : vos notifications fonctionnent.', icon: 'xiii-icon-192.png' }); } catch (x) { } } });
    }
    function close() { const o = document.getElementById('xnf2-ov'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('xnf2-ov')) { e.stopImmediatePropagation(); close(); } }, true);
    addEventListener('storage', e => { if (e.key === K) { C = get(); badges(); } });
    function row() { if (!document.getElementById('xs-panel') || document.getElementById('xnf2-row')) return; const a = document.getElementById('xpf-row') || document.getElementById('xan-row') || document.getElementById('xbc-row'); if (!a) return;
        const d = document.createElement('div'); d.className = 'xs-f'; d.id = 'xnf2-row'; d.innerHTML = '<label>Notifications<small>Quoi, comment (bannière, son, badge), heures calmes.</small></label><div class="xs-c"><button type="button" class="xs-btn">🔔 Régler…</button></div>';
        d.querySelector('button').onclick = () => { try { const x = document.querySelector('#xs-ov .xs-x,#xs-close'); if (x) x.click(); } catch (e) { } setTimeout(open, 120); }; a.after(d); }
    // lien depuis Démarrer › 🔔 Notifs
    function startLink() { const c = document.querySelector('#xst .xst-c, #xst [data-k="notif"].on'); const box = document.getElementById('xst'); if (!box || !box.classList.contains('on')) return; const nb = box.querySelector('nav button.on'); if (!nb || nb.dataset.k !== 'notif') return; const host = [...box.children].find(x => x.tagName !== 'NAV' && x.querySelector && (x.querySelector('#xst-dig') || x.querySelector('.r') || x.querySelector('.e'))); if (!host || host.querySelector('#xnf2-lk')) return; const b = document.createElement('button'); b.id = 'xnf2-lk'; b.className = 'xst-more'; b.style.cssText = 'width:100%;margin-bottom:8px'; b.textContent = '⚙️ Régler les notifications' + (quiet() ? ' · 🌙 heures calmes' : ''); b.onclick = open; host.prepend(b); }
    const start = () => { toSW(); badges(); let t = 0; new MutationObserver(() => { if (document.getElementById('xs-panel')) row(); clearTimeout(t); t = setTimeout(() => { badges(); startLink(); }, 60); }).observe(document.body, { childList: true, subtree: true, characterData: true }); };
    if (document.body) start(); else addEventListener('DOMContentLoaded', start);
    window.XNOTIF = { open, close, ok, cat, quiet, sound, cfg: () => JSON.parse(JSON.stringify(C)) };
})();
