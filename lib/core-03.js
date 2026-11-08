// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-03.js
// =====================================================================
//  SUITE XIII — XFILES : les gros fichiers (photos, PDF…) vont dans le Drive en vrais fichiers
//  Dans les données envoyées au ☁️ Drive, chaque image / PDF intégré de plus de ~40 Ko (« data:…;base64,… »)
//  est déposé une fois comme fichier (PNG, JPG, PDF…) dans le dossier « SUITE XIII — fichiers » du Master,
//  et remplacé par une courte référence « xiiif:ID|type ». À la réception, la référence redevient le fichier
//  (copie gardée dans ce navigateur : chaque fichier n'est téléchargé qu'une fois).
// =====================================================================
const XFILES = (() => {
    const RX = /data:([a-z]+\/[\w.+-]+);base64,[A-Za-z0-9+/=]{54000,}/g, RF = /xiiif:([\w-]{10,80})\|([a-z]+\/[\w.+-]+)/g;
    const MAPK = 'xiii.files.map';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    let MAP = J(MAPK, {}); const saveMap = () => { try { localStorage.setItem(MAPK, JSON.stringify(MAP)); } catch (e) { } };
    const key = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i += 7) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return s.length.toString(36) + '-' + h.toString(36) + '-' + s.slice(-24).replace(/[^A-Za-z0-9]/g, ''); };
    // ---------- copie locale (IndexedDB) ----------
    const db = () => new Promise((res, rej) => { const r = indexedDB.open('xiiiFiles', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    async function idb(mode, fn) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('f', mode), s = t.objectStore('f'), q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); }
    const cget = id => idb('readonly', s => s.get(id)).catch(() => null), cput = (id, v) => idb('readwrite', s => s.put(v, id)).catch(() => null);
    // ---------- Drive ----------
    async function api(a, p) { const c = J('xiii.drive', null); if (!c || !c.url) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: (c.me && c.me.name) || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'application/pdf': 'pdf', 'image/svg+xml': 'svg', 'audio/mpeg': 'mp3', 'video/mp4': 'mp4' };
    // dépose dans le Drive les gros fichiers pas encore envoyés (données : { clé: chaîne })
    async function prepare(data, label) {
        let n = 0; for (const k of Object.keys(data || {})) { const v = data[k]; if (typeof v !== 'string' || v.length < 54000) continue;
            for (const m of v.matchAll(RX)) { const s = m[0], h = key(s); if (MAP[h]) continue;
                const r = await api('file_put', { h, mime: m[1], name: (label || 'fichier') + '-' + h.split('-')[1] + '.' + (EXT[m[1]] || 'bin'), b64: s.slice(s.indexOf(',') + 1) });
                if (r.ok && r.id) { MAP[h] = r.id; saveMap(); cput(r.id, s); n++; } else return n; } }
        return n;
    }
    // remplace (sans réseau) les fichiers déjà déposés par leur référence
    function pack(data) { const o = {}; Object.keys(data || {}).forEach(k => { const v = data[k]; o[k] = typeof v === 'string' && v.length >= 54000 ? v.replace(RX, (s, mime) => { const id = MAP[key(s)]; return id ? 'xiiif:' + id + '|' + mime : s; }) : v; }); return o; }
    // références → fichiers (copie locale, sinon téléchargement depuis le Drive)
    async function unpack(data) {
        const ids = new Set(); Object.values(data || {}).forEach(v => { if (typeof v === 'string' && v.indexOf('xiiif:') > -1) for (const m of v.matchAll(RF)) ids.add(m[1] + '|' + m[2]); });
        if (!ids.size) return data; const got = {};
        for (const x of ids) { const [id, mime] = x.split('|'); let s = await cget(id);
            if (!s) { const r = await api('file_get', { id }); if (r.ok && r.b64) { s = 'data:' + (r.mime || mime) + ';base64,' + r.b64; cput(id, s); } }
            if (s) { got[id] = s; MAP[key(s)] = id; } }
        saveMap(); const o = {}; Object.keys(data).forEach(k => { const v = data[k]; o[k] = typeof v === 'string' && v.indexOf('xiiif:') > -1 ? v.replace(RF, (t, id) => got[id] || t) : v; }); return o;
    }
    return { prepare, pack, unpack, key };
})();

// =====================================================================
//  SUITE XIII — XWAIT : ⏳ animation d'attente XIII (barres III ⇄ X) pour les attentes longues
//  XWAIT.show('Préparation du PDF…') / XWAIT.hide(). Branché tout seul sur les messages « ⏳ … » des outils.
// =====================================================================
const XWAIT = (() => {
    const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf5c"/><stop offset="1" stop-color="#e8960f"/></linearGradient></defs><g filter="url(#g)" fill="url(#o)"><rect x="-6" y="-31" width="12" height="62" rx="1.5"><animateTransform attributeName="transform" type="translate" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.15;.45;.6;.9;1" keySplines=".6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1" values="30 50;30 50;50 50;50 50;30 50;30 50" additive="sum"/><animateTransform attributeName="transform" type="rotate" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.15;.45;.6;.9;1" keySplines=".6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1" values="0;0;-27;-27;0;0" additive="sum"/></rect><rect x="-6" y="-31" width="12" height="62" rx="1.5"><animateTransform attributeName="transform" type="translate" dur="1.8s" repeatCount="indefinite" values="50 50" additive="sum"/><animateTransform attributeName="transform" type="scale" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.15;.45;.6;.9;1" keySplines=".6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1" values="1 1;1 1;0 .2;0 .2;1 1;1 1" additive="sum"/></rect><rect x="-6" y="-31" width="12" height="62" rx="1.5"><animateTransform attributeName="transform" type="translate" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.15;.45;.6;.9;1" keySplines=".6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1" values="70 50;70 50;50 50;50 50;70 50;70 50" additive="sum"/><animateTransform attributeName="transform" type="rotate" dur="1.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.15;.45;.6;.9;1" keySplines=".6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1;.6 0 .2 1" values="0;0;27;27;0;0" additive="sum"/></rect></g></svg>';
    let el = null, t = null;
    function show(txt, ms) {
        if (!document.body) return; if (!el) { el = document.createElement('div'); el.id = 'xwait'; el.innerHTML = '<div class="xw-b"><div class="xw-i">' + SVG + '</div><div class="xw-t"></div></div>'; document.body.appendChild(el);
            const s = document.createElement('style'); s.textContent = '#xwait{position:fixed;inset:0;z-index:2147483400;display:flex;align-items:center;justify-content:center;background:rgba(10,9,8,.35);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;transition:opacity .2s;pointer-events:none}#xwait.on{opacity:1}#xwait .xw-b{display:flex;flex-direction:column;align-items:center;gap:12px;padding:22px 28px;border-radius:18px;background:rgba(20,18,16,.72);border:1px solid rgba(240,180,41,.35);box-shadow:0 0 40px rgba(240,180,41,.18),0 20px 50px rgba(0,0,0,.45)}#xwait .xw-i{width:64px;height:64px}#xwait .xw-i svg{width:100%;height:100%}#xwait .xw-t{font:600 13px/1.3 "Segoe UI",system-ui,sans-serif;color:#f3ede6;max-width:260px;text-align:center}@media print{#xwait{display:none!important}}'; document.head.appendChild(s); }
        el.querySelector('.xw-t').textContent = String(txt || 'Un instant…').replace(/^⏳\s*/, ''); requestAnimationFrame(() => el.classList.add('on'));
        clearTimeout(t); t = setTimeout(hide, ms || 6000);
    }
    function hide() { clearTimeout(t); if (el) el.classList.remove('on'); }
    function hook() { // messages « ⏳ … » des outils → animation ; message suivant → fin de l'attente
        if (typeof window.toast !== 'function' || window.toast.__xw) return; const o = window.toast;
        const w = function (m) { try { const s = String(m || ''); if (/^⏳/.test(s)) show(s, 8000); else hide(); } catch (e) { } return o.apply(this, arguments); }; w.__xw = 1; try { window.toast = w; toast = w; } catch (e) { }
    }
    if (typeof XBOOT !== 'undefined') XBOOT.ready(hook, 2000); else addEventListener('load', hook);
    addEventListener('afterprint', hide);
    return { show, hide, SVG };
})();

// =====================================================================
//  SUITE XIII — XSPACE : espacement régulier des boutons (Phase O)
//  Repère les commandes collées côte à côte (boutons, listes, champs, onglets : écart < 4 px) et leur ajoute
//  un léger espace de 6 px, dans tous les outils, y compris quand les barres changent. Seules les commandes
//  d'un même groupe soudé (onglets entre eux, sélecteur segmenté) restent collées.
// =====================================================================
const XSPACE = (() => {
    const GROUP = 'nav,[role=tablist],.tabs,.seg,.segmented,.xs-seg,#xh-nav,#tb,.ctx-menu,.dp-vers,[id*=tabs],[class*=tabs]';
    const SEL = 'button,.btn,select,input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]),.tab';
    function fix() {
        // par lignes : on ne compare que des voisins (rapide même avec des milliers de boutons)
        const bs = [...document.querySelectorAll(SEL)].filter(b => b.offsetParent && !b.closest('#xsplash')), H = innerHeight;
        const rows = new Map(); let n = 0;
        bs.forEach(b => { const r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 12 || r.bottom < 0 || r.top > H) return; const k = Math.round((r.top + r.bottom) / 10); (rows.get(k) || rows.set(k, []).get(k)).push({ b, r }); });
        rows.forEach(L => { if (L.length < 2) return; L.sort((x, y) => x.r.left - y.r.left);
            for (let i = 1; i < L.length; i++) { const a = L[i - 1], d = L[i]; if (Math.abs(a.r.height - d.r.height) > 14) continue; const g = d.r.left - a.r.right; if (g <= -1 || g >= 4) continue; if (a.b.contains(d.b) || d.b.contains(a.b)) continue; const gi = a.b.closest(GROUP), gj = d.b.closest(GROUP); if (gi && gi === gj) continue;
                const cur = parseFloat(getComputedStyle(d.b).marginLeft) || 0; d.b.style.setProperty('margin-left', (cur + 6 - Math.max(0, g)) + 'px', 'important'); n++; } });
        return n;
    }
    let t = null; const go = () => { clearTimeout(t); t = setTimeout(fix, 250); };
    const start = () => { fix(); [800, 2000, 4000, 8000].forEach(ms => setTimeout(fix, ms)); new MutationObserver(go).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] }); addEventListener('resize', go); };
    if (typeof XBOOT !== 'undefined') XBOOT.ready(start, 3500); else addEventListener('load', () => setTimeout(start, 600));
    return { fix };
})();

// =====================================================================
//  SUITE XIII — XUX : confort et direction artistique communs (Phase U)
//  • Barres d'outils Glassglow dans tous les outils (verre, boutons arrondis, lueur orange) — thèmes sombre et clair,
//    les habillages rétro (Win 2000, Terminal…) restent intacts.
//  • Touche « ? » : fiche des raccourcis de l'outil ouvert + taille du texte + contraste renforcé.
//  • Focus clavier visible partout.
// =====================================================================
const XUX = (() => {
    const SK = ['w2k', 'xp', 'cyber', 'rainbow', 'mac9', 'term', 'sepia', 'regie', 'soleil', 'gb', 'sobre'].map(k => ':not(.x' + k + ')').join('');
    const D = 'body' + SK + ':not(.light-theme)', L = 'body' + SK + '.light-theme';
    const KF = 'xiii.ux.fs', KC = 'xiii.ux.hc';
    const J = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
    function css() {
        const st = document.createElement('style'); st.id = 'xux-css'; st.textContent =
            D + ' #top-bar,' + D + ' #toolbar{background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.015)),rgba(16,15,14,.82)!important;backdrop-filter:blur(16px) saturate(1.3);-webkit-backdrop-filter:blur(16px) saturate(1.3);border-bottom:1px solid rgba(255,255,255,.07)!important;box-shadow:0 1px 0 rgba(240,180,41,.06),0 8px 24px rgba(0,0,0,.25)}' +
            D + ' #top-bar button,' + D + ' #toolbar button,' + D + ' #top-bar select,' + D + ' #toolbar select{border-radius:11px!important;background:rgba(255,255,255,.05)!important;border:1px solid rgba(255,255,255,.1)!important;transition:background .15s,border-color .15s,box-shadow .2s,transform .1s}' +
            D + ' #top-bar button:hover,' + D + ' #toolbar button:hover{background:rgba(240,180,41,.14)!important;border-color:rgba(240,180,41,.55)!important;box-shadow:0 0 14px rgba(240,180,41,.18)}' +
            D + ' #top-bar button:active,' + D + ' #toolbar button:active{transform:scale(.96)}' +
            D + ' #top-bar .btn-active,' + D + ' #toolbar .btn-active,' + D + ' #top-bar button.active,' + D + ' #toolbar button.active{background:linear-gradient(135deg,rgba(240,180,41,.32),rgba(240,180,41,.12))!important;border-color:rgba(240,180,41,.75)!important;box-shadow:0 0 16px rgba(240,180,41,.25),0 0 0 1px rgba(240,180,41,.3) inset}' +
            L + ' #top-bar,' + L + ' #toolbar{background:linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,255,255,.7))!important;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(60,40,10,.1)!important;box-shadow:0 6px 20px rgba(60,40,10,.06)}' +
            L + '{background:radial-gradient(900px 600px at 0% 0%,rgba(240,170,41,.13),transparent 65%),radial-gradient(900px 700px at 100% 100%,rgba(240,150,30,.1),transparent 65%),#f4f0e9!important;background-attachment:fixed!important}' +
            L + ' #top-bar button,' + L + ' #toolbar button{border-radius:11px!important;transition:background .15s,border-color .15s,box-shadow .2s}' + L + ' #top-bar button:hover,' + L + ' #toolbar button:hover{border-color:rgba(201,133,0,.6)!important;box-shadow:0 0 12px rgba(240,180,41,.2)}' +
            'body.xux-pres #top-bar,body.xux-pres #toolbar,body.xux-pres #xs-gear,body.xux-pres #xbug-btn,body.xux-pres #xt-tab,body.xux-pres #xenc-tab,body.xux-pres .xs-credit,body.xux-pres #xb-master,body.xux-pres #xacc-chip,body.xux-pres #xau-chip,body.xux-pres #xh-nav,body.xux-pres .beta-banner,body.xux-pres [id*=panel]:not(#xux-pill),body.xux-pres #side,body.xux-pres #xf-btn{display:none!important}body.xux-pres #xux-pill{display:flex}body.xux-pres .xux-hid{display:none!important}#xux-pill{display:none;position:fixed;top:12px;right:12px;z-index:2147483300;align-items:center;gap:8px;padding:7px 14px;border-radius:99px;background:rgba(20,18,16,.75);border:1px solid rgba(240,180,41,.5);color:#f3ede6;font:600 12.5px "Segoe UI",sans-serif;cursor:pointer;backdrop-filter:blur(10px);opacity:.35;transition:opacity .2s}#xux-pill:hover{opacity:1}' +
            ':focus-visible{outline:2px solid #f0b429!important;outline-offset:2px}' +
            'html.xux-hc body{filter:contrast(1.12)}html.xux-hc .hint,html.xux-hc small{opacity:1!important}' +
            '#xux-ov{position:fixed;inset:0;z-index:2147483400;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font:14px/1.5 "Segoe UI",system-ui,sans-serif}#xux-ov>div{width:min(640px,100%);max-height:86vh;overflow:auto;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,180,41,.45);border-radius:16px;padding:18px 20px;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 30px rgba(240,180,41,.08)}#xux-ov h3{margin:0 0 10px;font-size:17px}#xux-ov h4{margin:14px 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}#xux-ov .r{display:flex;justify-content:space-between;gap:14px;padding:5px 0;border-top:1px solid rgba(127,127,127,.18)}#xux-ov kbd{font:600 12px ui-monospace,Consolas,monospace;background:rgba(240,180,41,.14);border:1px solid rgba(240,180,41,.45);border-radius:6px;padding:2px 7px;white-space:nowrap}#xux-ov .seg{display:flex;gap:6px;flex-wrap:wrap}#xux-ov .seg button{font:inherit;font-size:13px;padding:6px 12px;border-radius:10px;cursor:pointer;background:rgba(255,255,255,.06);border:1px solid rgba(127,127,127,.35);color:inherit}#xux-ov .seg button.on{background:rgba(240,180,41,.28);border-color:#f0b429}';
        document.head.appendChild(st);
    }
    function applyPrefs() { const z = +J(KF, '100') || 100; document.body.style.zoom = z === 100 ? '' : (z / 100); document.documentElement.classList.toggle('xux-hc', J(KC, '0') === '1'); }
    function shortcuts() {
        const out = [], seen = new Set(), add = (k, t) => { const key = k + t; if (seen.has(key)) return; seen.add(key); out.push([k, t]); };
        document.querySelectorAll('[title]').forEach(el => { const t = el.getAttribute('title') || '', m = t.match(/\(((?:Ctrl|⌘|Maj|Shift|Alt|Suppr|Échap|Espace|Entrée|F\d+|[A-Z0-9?+←→↑↓])(?:[ +][^)]{0,18})?)\)/); if (!m) return; const lab = ((el.querySelector && el.querySelector('.btn-label') || {}).textContent || t.replace(m[0], '').split(/ : | — /)[0]).replace(/\s+/g, ' ').trim(); if (lab) add(m[1].replace(/Ctrl/g, 'Ctrl'), lab.slice(0, 60)); });
        return out;
    }
    function open() {
        if (document.getElementById('xux-ov')) return; const S = shortcuts(), z = +J(KF, '100') || 100, hc = J(KC, '0') === '1';
        const o = document.createElement('div'); o.id = 'xux-ov';
        o.innerHTML = '<div><h3>⌨️ Raccourcis et confort</h3><h4>Partout dans la suite</h4>' + (window.XKEYS ? XKEYS.LIST : [['Ctrl K', 'Rechercher, ou lancer une action de n\'importe quel outil'], ['Ctrl Maj P', 'Présentation client (masque les boutons d\'édition)'], ['?', 'Cette fiche'], ['Ctrl S', 'Enregistrer (dans la plupart des outils)'], ['Ctrl Z / Ctrl Y', 'Annuler / rétablir (outils équipés)'], ['Échap', 'Fermer une fenêtre']]).map(r => '<div class="r"><span>' + r[1] + '</span><kbd>' + r[0] + '</kbd></div>').join('') +
            (S.length ? '<h4>Dans cet outil</h4>' + S.slice(0, 40).map(r => '<div class="r"><span>' + r[1].replace(/[<>&]/g, '') + '</span><kbd>' + r[0].replace(/[<>&]/g, '') + '</kbd></div>').join('') : '') +
            '<h4>Taille du texte</h4><div class="seg" data-g="fs">' + [90, 100, 112, 125, 140].map(v => '<button data-v="' + v + '" class="' + (v === z ? 'on' : '') + '">' + v + ' %</button>').join('') + '</div><h4>Contraste</h4><div class="seg" data-g="hc"><button data-v="0" class="' + (hc ? '' : 'on') + '">Normal</button><button data-v="1" class="' + (hc ? 'on' : '') + '">Renforcé</button></div><p style="opacity:.6;font-size:12px;margin:12px 0 0">Taille du texte et contraste valent pour toute la suite, sur cet appareil.</p><div style="text-align:right;margin-top:10px"><button data-x style="font:inherit;padding:7px 16px;border-radius:10px;cursor:pointer;background:rgba(240,180,41,.2);border:1px solid #f0b429;color:inherit">Fermer</button></div></div>';
        document.body.appendChild(o);
        o.onclick = e => { if (e.target === o || e.target.closest('[data-x]')) { o.remove(); return; } const b = e.target.closest('[data-v]'); if (!b) return; const g = b.parentNode.dataset.g; try { localStorage.setItem(g === 'fs' ? KF : KC, b.dataset.v); } catch (er) { } b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); applyPrefs(); };
    }
    function present(on) { const b = document.body; on = on == null ? !b.classList.contains('xux-pres') : on; b.classList.toggle('xux-pres', on); if (on) { [...document.querySelectorAll('body *')].forEach(el => { if (el.id === 'xux-pill' || el.closest('#xux-pill')) return; const cs = getComputedStyle(el); if ((cs.position !== 'fixed' && cs.position !== 'absolute' && cs.position !== 'sticky') || cs.display === 'none') return; const r = el.getBoundingClientRect(); if (r.width * r.height > innerWidth * innerHeight * 0.3) return; if (el.matches('button,input,select') || el.querySelector('button,input,select')) el.classList.add('xux-hid'); }); } else document.querySelectorAll('.xux-hid').forEach(el => el.classList.remove('xux-hid')); let p = document.getElementById('xux-pill'); if (!p) { p = document.createElement('div'); p.id = 'xux-pill'; p.innerHTML = '🎬 Présentation client · <u>quitter</u> (Échap)'; p.onclick = () => present(false); document.body.appendChild(p); } try { dispatchEvent(new Event('resize')); } catch (e) { } }
    function init(app) {
        css(); const go = () => applyPrefs(); if (document.body) go(); else addEventListener('DOMContentLoaded', go);
        addEventListener('storage', e => { if (e.key === KF || e.key === KC) applyPrefs(); });
        document.addEventListener('keydown', e => { if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return; e.preventDefault(); const o = document.getElementById('xux-ov'); if (o) o.remove(); else open(); }, true);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = document.getElementById('xux-ov'); if (o) o.remove(); else if (document.body.classList.contains('xux-pres')) present(false); } if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) { e.preventDefault(); present(); } });
        window.XSET_HELP = (window.XSET_HELP || []).concat([{ icon: '⌨️', label: 'Raccourcis et confort', sub: 'Touche « ? » : raccourcis, taille du texte, contraste', run: open }, { icon: '🎬', label: 'Présentation client', sub: 'Masque tous les boutons d\'édition (Ctrl+Maj+P, Échap pour quitter)', run: () => present(true) }]);
    }
    return { init, open, present };
})();

XUX.init(XIII_APP);

// =====================================================================
//  XTABS — côté outil : dans l'Espace onglets (espace.html), les liens vers un autre outil s'ouvrent en onglet
// =====================================================================
(function () {
    let shell = null; try { shell = window.parent !== window && window.parent.__xtshell ? window.parent : null; } catch (e) { }
    window.xiiiOpenTab = (url, bg) => { if (shell) { shell.postMessage({ xtab: { open: url, bg } }, location.origin); return true; } location.href = 'espace.html?open=' + encodeURIComponent(url); return true; };
    if (!shell) { const pg = location.pathname.split('/').pop() || 'index.html'; if (/^(index\.html)?$/.test(pg) && window.top === window && !location.search && !location.hash) location.replace('espace.html'); return; }
    document.documentElement.classList.add('xtab-in');
    window.__xtErr = 0; window.addEventListener('error', e => { if (e && e.error !== undefined && !(e.target && e.target !== window)) window.__xtErr++; });
    const tool = u => { try { const x = new URL(u, location.href); return x.origin === location.origin && /\/[\w-]+\.html$/.test(x.pathname) && !/^(espace)\.html$/.test(x.pathname.split('/').pop()) ? x.pathname.split('/').pop() + x.search + x.hash : null; } catch (e) { return null; } };
    document.addEventListener('click', e => { if (e.defaultPrevented || e.button !== 0) return; const a = e.target.closest && e.target.closest('a[href]'); if (!a || a.hasAttribute('download')) return; const u = tool(a.getAttribute('href')); if (!u) return; const here = location.pathname.split('/').pop(); if (u.split(/[?#]/)[0] === here) return; e.preventDefault(); shell.postMessage({ xtab: { open: u, bg: e.ctrlKey || e.metaKey } }, location.origin); }, true);
    const o0 = window.open; window.open = function (u, n) { const t = u && tool(u); if (t) { shell.postMessage({ xtab: { open: t } }, location.origin); return window; } return o0.apply(window, arguments); };
})();


// =====================================================================
//  SUITE XIII — XCONF : confort commun (Phase AB)
//  • « Reprendre » : chaque outil note sa dernière ouverture dans le projet XIII en cours (xiii.resume)
//  • 📁 Fichiers récents : chaque PDF / Excel / image téléchargé depuis un outil est gardé (20 derniers) pour Démarrer › Fichiers
//  • 📝 Brouillons : un texte en cours de frappe est gardé ; après un plantage, proposition de le restaurer
//  • 🎬 Mode tournage : gros boutons, contraste élevé, écran toujours allumé (commun à tous les outils)
//  • ⌨️ Raccourcis personnalisés : une combinaison de touches → un bouton de l'outil ; fiche imprimable (touche « ? »)
// =====================================================================
const XCONF = (() => {
    let APP = '';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toastX = m => { try { if (typeof toast === 'function') return toast(m); } catch (e) { } };
    // ---------- reprendre ----------
    function resume() { if (!APP || APP === 'index' || /-m$/.test(APP)) return; const L = J('xiii.resume', []).filter(x => x && x.app !== APP); L.unshift({ app: APP, url: location.pathname.split('/').pop() + location.search, at: Date.now() }); W('xiii.resume', L.slice(0, 10)); }
    // ---------- fichiers récents (IndexedDB du projet) ----------
    const DB = 'xiiiRecentFiles', MAXF = 20, MAXB = 25e6;
    function db() { return new Promise((ok, ko) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore('f', { keyPath: 'id' }); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); }); }
    async function list() { try { const d = await db(); return await new Promise(ok => { const q = d.transaction('f').objectStore('f').getAll(); q.onsuccess = () => ok((q.result || []).sort((a, b) => b.at - a.at)); q.onerror = () => ok([]); }); } catch (e) { return []; } }
    async function put(rec) { try { const d = await db(), old = await list(), tx = d.transaction('f', 'readwrite'), st = tx.objectStore('f'); old.filter(x => x.name === rec.name && x.app === rec.app).forEach(x => st.delete(x.id)); st.put(rec); old.filter(x => !(x.name === rec.name && x.app === rec.app)).slice(MAXF - 1).forEach(x => st.delete(x.id)); try { window.dispatchEvent(new CustomEvent('xiii-files')); localStorage.setItem('xiii.files.ping', String(Date.now())); } catch (e) { } } catch (e) { } }
    async function remove(id) { try { const d = await db(); d.transaction('f', 'readwrite').objectStore('f').delete(id); } catch (e) { } }
    let lastCap = '';
    function capture(a) { try { const href = a.href || '', name = a.getAttribute('download') || ''; if (!name || !/^(blob:|data:)/.test(href)) return; try { window.dispatchEvent(new CustomEvent('xiii-file', { detail: { name } })); } catch (e) { } const k = href + '|' + name; if (k === lastCap) return; lastCap = k; setTimeout(() => { if (lastCap === k) lastCap = ''; }, 1500);
        fetch(href).then(r => r.blob()).then(b => { if (!b || b.size > MAXB || b.size < 20) return; put({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, app: APP, at: Date.now(), size: b.size, type: b.type || '', blob: b }); }).catch(() => { }); } catch (e) { } }
    function hookDownloads() {
        const A = HTMLAnchorElement.prototype, c0 = A.click, d0 = A.dispatchEvent;
        A.click = function () { if (this.hasAttribute('download')) capture(this); return c0.apply(this, arguments); };
        A.dispatchEvent = function (e) { if (e && e.type === 'click' && this.hasAttribute && this.hasAttribute('download')) capture(this); return d0.apply(this, arguments); };
        document.addEventListener('click', e => { const a = e.target && e.target.closest && e.target.closest('a[download]'); if (a) capture(a); }, true);
    }
    // ---------- brouillons ----------
    const DK = () => 'xiii.draft.' + APP;
    const fieldOf = el => el && el.id && !/^x[a-z]{1,4}-/.test(el.id) && (el.tagName === 'TEXTAREA' || el.isContentEditable || (el.tagName === 'INPUT' && /^(text|search|)$/.test(el.type || ''))) ? el : null;
    const valOf = el => el.isContentEditable ? el.innerHTML : el.value;
    function drafts() {
        let tm = 0; const pend = {};
        document.addEventListener('input', e => { const el = fieldOf(e.target); if (!el) return; const v = valOf(el); if (String(v).length < 12) return; pend[el.id] = { v, at: Date.now(), lab: (el.getAttribute('aria-label') || el.placeholder || (el.labels && el.labels[0] && el.labels[0].textContent) || el.id).slice(0, 60) }; clearTimeout(tm); tm = setTimeout(() => { const D = J(DK(), {}); Object.assign(D, pend); W(DK(), D); }, 700); }, true);
        document.addEventListener('focusout', e => { const el = fieldOf(e.target); if (!el) return; setTimeout(() => { delete pend[el.id]; const D = J(DK(), {}); if (D[el.id]) { delete D[el.id]; W(DK(), D); } }, 900); }, true);
        setTimeout(() => { const D = J(DK(), {}), ids = Object.keys(D); if (!ids.length) return; const todo = ids.filter(id => { const el = document.getElementById(id); return el && D[id] && Date.now() - D[id].at < 7 * 864e5 && String(valOf(el)) !== String(D[id].v); });
            if (!todo.length) { W(DK(), {}); return; }
            const b = document.createElement('div'); b.id = 'xcf-draft'; b.innerHTML = '<b>📝 Brouillon récupéré</b><span>' + todo.length + ' texte' + (todo.length > 1 ? 's' : '') + ' en cours de frappe n\'' + (todo.length > 1 ? 'ont' : 'a') + ' pas été enregistré' + (todo.length > 1 ? 's' : '') + ' (' + esc(todo.map(id => '« ' + D[id].lab + ' »').join(', ')) + ', ' + new Date(D[todo[0]].at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + ').</span><button data-a="y">Restaurer</button><button data-a="n">Ignorer</button>';
            document.body.appendChild(b); b.onclick = e => { const a = e.target.dataset && e.target.dataset.a; if (!a) return; if (a === 'y') todo.forEach(id => { const el = document.getElementById(id); if (!el) return; if (el.isContentEditable) el.innerHTML = D[id].v; else el.value = D[id].v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }); W(DK(), {}); b.remove(); if (a === 'y') toastX('📝 Brouillon restauré'); };
        }, 2500);
    }
    // ---------- mode tournage ----------
    const KS = 'xiii.ux.shoot'; let wl = null;
    const shootOn = () => J(KS, 0) === 1;
    async function lock(on) { try { if (on && 'wakeLock' in navigator && document.visibilityState === 'visible') { if (!wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } else if (!on && wl) { wl.release(); wl = null; } } catch (e) { } }
    function applyShoot() { const on = shootOn(); document.documentElement.classList.toggle('xshoot', on); lock(on); }
    function shoot(on) { on = on == null ? !shootOn() : !!on; W(KS, on ? 1 : 0); applyShoot(); toastX(on ? '🎬 Mode tournage : gros boutons, contraste élevé, écran toujours allumé' : '🎬 Mode tournage désactivé'); return on; }
    // ---------- raccourcis personnalisés ----------
    const KK = () => 'xiii.ux.keys.' + APP;
    const combo = e => { const k = e.key.length === 1 ? e.key.toUpperCase() : e.key; if (/^(Control|Shift|Alt|Meta)$/.test(k)) return ''; return [e.ctrlKey || e.metaKey ? 'Ctrl' : '', e.altKey ? 'Alt' : '', e.shiftKey ? 'Maj' : '', k === ' ' ? 'Espace' : k].filter(Boolean).join('+'); };
    const labOf = b => { const l = ((b.querySelector('.btn-label') || {}).textContent || b.textContent || '').replace(/\s+/g, ' ').trim(); return (l && l.length > 1 && !/^\W+$/.test(l) ? l : (b.title || '').split(/ : | — | \(/)[0]).trim().slice(0, 60); };
    function commands() { const seen = new Set(), out = []; document.querySelectorAll('#toolbar button, #top-bar button, .btn-group button, header button, [data-view], button[title]').forEach(b => { if (b.closest('#xux-ov,#xf-ov,#xst,#xs-ov,#xcf-draft') || b.disabled) return; const l = labOf(b); if (!l || seen.has(l)) return; seen.add(l); out.push([l, b]); }); return out; }
    function keys() { document.addEventListener('keydown', e => { const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return; const K = J(KK(), {}), c = combo(e); if (!c || !K[c]) return; const hit = commands().find(x => x[0] === K[c]); if (!hit) { toastX('⌨️ « ' + K[c] + ' » est introuvable sur cette vue'); return; } e.preventDefault(); e.stopPropagation(); hit[1].click(); }, true); }
    function printSheet() {
        const K = J(KK(), {}), gl = (window.XKEYS ? XKEYS.LIST.map(r => [r[0].replace(/(Ctrl|Maj) /g, '$1+'), r[1]]).concat([['Ctrl+Tab', 'Onglet suivant (espace onglets)'], ['Alt+1…9', 'Aller à l\'onglet n°'], ['Alt+W', 'Fermer l\'onglet'], ['Alt+Maj+T', 'Rouvrir le dernier onglet fermé']]) : [['Ctrl+K', 'Rechercher, ouvrir un outil, changer d\'onglet ou de projet'], ['?', 'Fiche des raccourcis et du confort'], ['Ctrl+Z / Ctrl+Y', 'Annuler / rétablir'], ['Ctrl+S', 'Enregistrer'], ['Ctrl+Maj+P', 'Présentation client'], ['Ctrl+Tab', 'Onglet suivant (espace onglets)'], ['Alt+1…9', 'Aller à l\'onglet n°'], ['Alt+W', 'Fermer l\'onglet'], ['Alt+Maj+T', 'Rouvrir le dernier onglet fermé']]);
        const rows = (L, t) => '<h2>' + t + '</h2><table>' + L.map(r => '<tr><td><kbd>' + esc(r[0]) + '</kbd></td><td>' + esc(r[1]) + '</td></tr>').join('') + '</table>';
        const own = Object.keys(K).map(k => [k, K[k]]), tool = [...document.querySelectorAll('#xux-ov .r')].map(r => [(r.querySelector('kbd') || {}).textContent || '', (r.querySelector('span') || {}).textContent || '']).filter(r => r[0]);
        const w = window.open('', '_blank'); if (!w) { toastX('Autorisez les fenêtres pour imprimer'); return; }
        w.document.write('<!doctype html><meta charset="utf-8"><title>Raccourcis ' + esc(APP.toUpperCase()) + ' XIII</title><style>body{font:13px "Segoe UI",sans-serif;color:#111;margin:28px}h1{font-size:20px;margin:0 0 4px}p{color:#666;margin:0 0 14px}h2{font-size:14px;margin:18px 0 6px;border-bottom:2px solid #f0b429;padding-bottom:3px}table{width:100%;border-collapse:collapse}td{padding:5px 6px;border-bottom:1px solid #ddd}td:first-child{width:150px}kbd{font:600 12px Consolas,monospace;background:#f3f1ee;border:1px solid #ccc;border-radius:5px;padding:2px 6px}</style><h1>⌨️ Raccourcis — ' + esc(APP.toUpperCase()) + ' XIII</h1><p>SUITE XIII · ' + new Date().toLocaleDateString('fr-FR') + '</p>' + rows(gl, 'Partout dans la suite') + (tool.length ? rows(tool, 'Dans cet outil') : '') + (own.length ? rows(own, 'Mes raccourcis') : '') + '<script>setTimeout(()=>print(),300)<\/script>');
        w.document.close();
    }
    function sheetExtra(o) {
        if (!o || o.querySelector('.xcf-x')) return; const box = o.firstElementChild || o, K = J(KK(), {});
        const d = document.createElement('div'); d.className = 'xcf-x';
        d.innerHTML = '<h4>🎬 Mode tournage</h4><div class="seg" data-g="xcf-shoot"><button data-s="0" class="' + (shootOn() ? '' : 'on') + '">Normal</button><button data-s="1" class="' + (shootOn() ? 'on' : '') + '">Tournage — gros boutons, contraste, écran allumé</button></div>' +
            '<h4>⌨️ Mes raccourcis dans cet outil</h4><div class="xcf-k">' + (Object.keys(K).length ? Object.keys(K).map(k => '<div class="r"><span>' + esc(K[k]) + '</span><kbd>' + esc(k) + '</kbd><button data-del="' + esc(k) + '" title="Retirer">✕</button></div>').join('') : '<p style="opacity:.6;margin:4px 0">Aucun pour l\'instant.</p>') + '</div>' +
            '<div class="xcf-add"><select><option value="">Choisir un bouton de l\'outil…</option>' + commands().map(c => '<option>' + esc(c[0]) + '</option>').join('') + '</select><input readonly placeholder="Puis tapez la combinaison…"><button data-add>＋ Ajouter</button></div>' +
            '<div style="margin-top:12px"><button data-print>🖨️ Imprimer la fiche des raccourcis</button></div>';
        box.appendChild(d); let cur = '';
        const inp = d.querySelector('.xcf-add input'); inp.onkeydown = e => { e.preventDefault(); e.stopPropagation(); const c = combo(e); if (c) { cur = c; inp.value = c; } };
        d.onclick = e => { const t = e.target;
            if (t.dataset.s != null) { shoot(t.dataset.s === '1'); d.querySelectorAll('[data-s]').forEach(x => x.classList.toggle('on', x === t)); }
            else if (t.dataset.del) { const k = J(KK(), {}); delete k[t.dataset.del]; W(KK(), k); d.remove(); sheetExtra(o); }
            else if (t.hasAttribute('data-add')) { const c = d.querySelector('.xcf-add select').value; if (!c || !cur) { toastX('Choisissez un bouton puis tapez une combinaison'); return; } if (/^(Ctrl\+[KZYSCVXAP]|\?|Échap|Escape)$/.test(cur)) { toastX('« ' + cur + ' » est déjà utilisé par la suite'); return; } const k = J(KK(), {}); k[cur] = c; W(KK(), k); d.remove(); sheetExtra(o); }
            else if (t.hasAttribute('data-print')) printSheet(); };
    }
    const CSS = 'html.xshoot{font-size:118%}html.xshoot body{filter:contrast(1.12) saturate(1.05)}html.xshoot button:not(.x):not(.xst-x){min-height:44px!important;min-width:44px;font-size:max(15px,1em)!important}html.xshoot input,html.xshoot select{min-height:40px;font-size:15px!important}' +
        '#xcf-draft{position:fixed;left:16px;bottom:16px;z-index:2147483000;max-width:min(560px,92vw);display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:12px 14px;border-radius:14px;background:rgba(30,26,22,.92);color:#f2f2f2;border:1px solid rgba(240,180,41,.5);box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 24px rgba(240,180,41,.18);backdrop-filter:blur(16px);font:13px "Segoe UI",system-ui,sans-serif}#xcf-draft span{flex:1 1 100%;opacity:.85}#xcf-draft button{cursor:pointer;padding:7px 14px;border-radius:999px;border:1px solid rgba(240,180,41,.6);background:rgba(240,180,41,.18);color:inherit;font-weight:700}#xcf-draft button[data-a=n]{background:none;border-color:rgba(255,255,255,.25)}' +
        '.xcf-k .r{display:flex;align-items:center;gap:8px}.xcf-k .r span{flex:1}.xcf-k .r button{all:unset;cursor:pointer;opacity:.6;padding:0 4px}.xcf-add{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.xcf-add select{flex:1 1 180px}.xcf-add input{width:150px}';
    function init(app) {
        APP = app; const st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
        applyShoot(); addEventListener('storage', e => { if (e.key === KS) applyShoot(); }); document.addEventListener('visibilitychange', () => { if (shootOn()) lock(true); });
        hookDownloads(); keys();
        const go = () => { resume(); drafts(); new MutationObserver(m => { const o = document.getElementById('xux-ov'); if (o) sheetExtra(o); }).observe(document.body, { childList: true }); };
        if (document.body) go(); else addEventListener('DOMContentLoaded', go);
    }
    return { init, list, remove, shoot, shootOn, printSheet };
})();

XCONF.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XGLOW : design glassglow commun (Phase AC)
//  • barre d'outils en verre orangé, action principale en pilule orange
//  • panneaux latéraux identiques (Démarrer, ⚙️, passerelles) : même verre, même pilule, indicateur glissant
//  • mode clair « papier chaud » (verre beige, lueur ambre)
//  • icônes maison au trait fin à la place des émojis dans les barres d'outils (désactivable dans « ? »)
//  • progression lumineuse : signale au bandeau d'onglets les exports en cours (barre orange sous l'onglet)
// =====================================================================
const XGLOW = (() => {
    const SK = ['w2k', 'xp', 'cyber', 'rainbow', 'mac9', 'term', 'sepia', 'regie', 'soleil', 'gb', 'sobre'].map(k => ':not(.x' + k + ')').join('');
    const D = 'body' + SK + ':not(.light-theme)', L = 'body' + SK + '.light-theme', A = 'body' + SK;
    const KI = 'xiii.ux.icons';
    const tb = s => s.split(',').map(x => x.trim()).map(x => [D + ' #top-bar ' + x, D + ' #toolbar ' + x]).flat().join(',');
    const tbL = s => s.split(',').map(x => x.trim()).map(x => [L + ' #top-bar ' + x, L + ' #toolbar ' + x]).flat().join(',');
    const CSS =
        // — barre d'outils : verre orangé —
        D + ' #top-bar,' + D + ' #toolbar{background:linear-gradient(180deg,rgba(255,138,61,.11),rgba(240,180,41,.025) 70%),rgba(18,15,13,.84)!important;border-bottom:1px solid rgba(240,180,41,.22)!important;box-shadow:0 1px 0 rgba(240,180,41,.18),0 10px 30px rgba(0,0,0,.28),0 0 40px rgba(240,180,41,.06)!important}' +
        // — action principale en pilule orange —
        [D, L].map(x => x + ' #top-bar button.xgl-pri,' + x + ' #toolbar button.xgl-pri').join(',') + ',' + A + ' .xgl-pri{border-radius:999px!important;background:linear-gradient(135deg,#f0b429,#ff8a3d)!important;color:#1a1206!important;border:1px solid rgba(255,200,120,.9)!important;font-weight:700!important;box-shadow:0 0 18px rgba(240,180,41,.38),0 2px 8px rgba(0,0,0,.25)!important;padding-left:14px!important;padding-right:14px!important}' +
        [D, L].map(x => x + ' #top-bar button.xgl-pri:hover,' + x + ' #toolbar button.xgl-pri:hover').join(',') + ',' + A + ' .xgl-pri:hover{filter:brightness(1.08);box-shadow:0 0 26px rgba(240,180,41,.55),0 2px 8px rgba(0,0,0,.25)!important}' + A + ' .xgl-pri *{color:#1a1206!important}' +
        // — icônes maison —
        '.xgl-e{display:none!important}svg.xgl-ic{width:1.15em;height:1.15em;vertical-align:-.2em;flex:0 0 auto;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;margin-right:.15em}' +
        tb('button:hover svg.xgl-ic') + '{stroke:#ffcf5c;filter:drop-shadow(0 0 4px rgba(240,180,41,.6))}' +
        // — mode clair « papier chaud » —
        L + '{--xgl-paper:#f3ead9}' +
        L + ' #top-bar,' + L + ' #toolbar{background:linear-gradient(180deg,rgba(255,250,240,.9),rgba(246,236,218,.82))!important;border-bottom:1px solid rgba(176,120,30,.22)!important;box-shadow:0 1px 0 rgba(255,255,255,.7) inset,0 8px 26px rgba(150,100,20,.10),0 0 34px rgba(230,160,40,.10)!important}' +
        tbL('button,select') + '{background:rgba(255,248,236,.75)!important;border:1px solid rgba(176,120,30,.22)!important;color:#3a2a14!important}' +
        tbL('button:hover') + '{background:rgba(240,180,41,.18)!important;border-color:rgba(201,133,0,.6)!important;box-shadow:0 0 14px rgba(230,160,40,.28)!important}' +
        L + ' #top-bar button.xgl-pri,' + L + ' #toolbar button.xgl-pri{color:#2a1a04!important}' +
        'body.light-theme #xst{--xh-glass:rgba(250,243,230,.88);--xh-line:rgba(150,100,20,.18);--xh-txt:#2a2016;--xh-dim:#7a6a55}body.light-theme #xst-b{--xh-glass:rgba(250,243,230,.85);--xh-line:rgba(150,100,20,.22);--xh-txt:#2a2016}' +
        // — panneaux latéraux identiques : ⚙️ (#xs-panel) aligné sur Démarrer —
        A + ' #xs-panel{background:linear-gradient(180deg,rgba(255,138,61,.06),transparent 30%),rgba(20,18,16,.86)!important;backdrop-filter:blur(22px) saturate(1.4);-webkit-backdrop-filter:blur(22px) saturate(1.4);border:1px solid rgba(255,255,255,.12)!important;border-radius:26px 0 0 26px!important;box-shadow:0 20px 60px rgba(0,0,0,.45),0 0 40px rgba(240,180,41,.07)!important;overflow:hidden}' +
        'body.light-theme' + SK.replace(/:not\(\.xsoleil\)/, '') + ' #xs-panel{background:linear-gradient(180deg,rgba(240,180,41,.10),transparent 30%),rgba(250,243,230,.92)!important;border-color:rgba(150,100,20,.18)!important;color:#2a2016!important}' +
        A + ' #xs-panel .xs-seg{position:relative;border-radius:999px!important;padding:3px!important;gap:2px;background:rgba(127,127,127,.12)!important;border:1px solid rgba(127,127,127,.18)!important;overflow:hidden}' +
        A + ' #xs-panel .xs-seg button{position:relative;z-index:1;border-radius:999px!important;border:0!important;background:transparent!important;transition:color .25s}' +
        A + ' #xs-panel .xs-seg button.on{color:#1a1206!important;background:transparent!important}' +
        A + ' #xs-panel .xs-seg .xgl-ind{position:absolute;z-index:0;top:3px;bottom:3px;border-radius:999px;background:linear-gradient(135deg,#f0b429,#ff8a3d);box-shadow:0 0 16px rgba(240,180,41,.45);transition:left .3s cubic-bezier(.2,.8,.2,1),width .3s cubic-bezier(.2,.8,.2,1),top .3s cubic-bezier(.2,.8,.2,1),height .3s cubic-bezier(.2,.8,.2,1)}' +
        A + ' #xs-panel .xs-seg:not(:has(.xgl-ind)) button.on{background:linear-gradient(135deg,#f0b429,#ff8a3d)!important}' +
        A + ' #xs-panel .xs-btn{border-radius:999px!important}' + A + ' #xs-panel .xs-sec{border-radius:16px!important}' +
        // — passerelles : bandeau et menu au même verre —
        A + ' #xps-ban{background:linear-gradient(135deg,rgba(255,138,61,.14),rgba(240,180,41,.05)),rgba(20,18,16,.86)!important;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border:1px solid rgba(240,180,41,.45)!important;border-radius:18px!important;box-shadow:0 14px 40px rgba(0,0,0,.4),0 0 30px rgba(240,180,41,.15)!important;color:#f3ede6!important}' +
        A + ' #xps-ban button{border-radius:999px!important}' + A + ' #xps-ok{background:linear-gradient(135deg,#f0b429,#ff8a3d)!important;color:#1a1206!important;border:0!important;font-weight:700!important}' +
        // — Démarrer : un widget par ligne —
        '#xst .xd-g{display:flex!important;flex-direction:column!important;gap:10px!important}#xst .xd-g>*{width:100%!important;align-self:stretch!important;box-sizing:border-box;max-width:100%!important;grid-column:auto!important;min-width:0}' +
        // — fiche « ? » —
        '.xgl-x h4{margin:14px 0 6px}';

    // ---- icônes maison (trait fin, 24×24) ----
    const P = {
        doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
        save: '<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M8 3v5h7V3M8 21v-6h8v6"/>',
        folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
        down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', up: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
        share: '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M8 7l4-4 4 4"/>',
        print: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/>',
        gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 14H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
        search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>', plus: '<path d="M12 5v14M5 12h14"/>',
        trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
        eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
        clip: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
        link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
        cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.5a4.3 4.3 0 0 1-.5 8.5z"/>',
        undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
        clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>', cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
        palette: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.1-.9-1.4-.9-2.4 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
        cam: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
        img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/>',
        cut: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 17M8 15.5L20 7"/>',
        lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
        chart: '<path d="M4 20V10M10 20V4M16 20v-7M2 20h20"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
        play: '<path d="M7 4l13 8-13 8z"/>', pause: '<path d="M8 4v16M16 4v16"/>', stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
        refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
        help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
        home: '<path d="M3 11l9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
        box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
        clap: '<path d="M3 10h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 10l1.5-5.5 16 3L21 10M8 5l2 4.5M13.5 6l2 4"/>',
        mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', light: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
        list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01"/>', grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
        bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>', star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
        bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', check: '<path d="M4 12.5l5 5L20 6.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', pin: '<path d="M12 21s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
        ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>', film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
        book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>', phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
        map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>', tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
        euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5M4 10h9M4 14h9"/>',
        note: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11h7M9 15h7M9 19h4"/>', focus: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>', left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>', chev: '<path d="M6 9l6 6 6-6"/>', signal: '<path d="M12 13v8M8.5 9.5a5 5 0 0 1 7 0M5.5 6.5a9.5 9.5 0 0 1 13 0"/><circle cx="12" cy="12" r="1.2"/>', hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v6M14 10V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7 6 6 0 0 1-5.5-3.5L3 14a1.5 1.5 0 0 1 2.5-1.5L8 15"/>', video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>', pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3M4 20h16"/>', archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>', target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>', zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>', weather: '<path d="M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 9a4.5 4.5 0 0 1 .5 9z"/><path d="M9 21l1-2M13 21l1-2"/>', cross: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 7v10M7 12h10"/>', bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13v1M15 13v1M9.5 16.5h5M3 12v3M21 12v3"/>', bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>', scroll: '<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8"/><path d="M6 4a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2zM8 8v10a2 2 0 1 1-4 0M11 9h5M11 13h5"/>', calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11v6M8 15h2M12 15h2"/>', panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16M16.5 8h2M16.5 11h2M16.5 14h2"/>', journal: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12 8h4M12 12h4"/>', live: '<circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="8.5"/>', meal: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5a2 2 0 0 0 2 2M9 3v5M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>', scale: '<path d="M12 4v16M6 20h12M5 8h14M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/>', card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>', contacts: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7.5 17a4.5 4.5 0 0 1 9 0M2 7h2M2 12h2M2 17h2"/>', bank: '<path d="M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', broom: '<path d="M14 3l-4 9M7 12h8l2 9H5z"/><path d="M9 16v5M13 16v5"/>', headph: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>', text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>', rect: '<rect x="4" y="6" width="16" height="12" rx="1.5"/>', circle: '<circle cx="12" cy="12" r="8"/>', ticker: '<path d="M3 12h14M13 8l4 4-4 4M20 6v12"/>', bar: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M3 12h10"/>', sliders: '<path d="M6 3v18M12 3v18M18 3v18"/><rect x="4" y="12" width="4" height="3" rx="1"/><rect x="10" y="6" width="4" height="3" rx="1"/><rect x="16" y="15" width="4" height="3" rx="1"/>', sat: '<path d="M5 19a9 9 0 0 1 0-12.7M8 16a5 5 0 0 1 0-7"/><circle cx="12" cy="12" r="1.5"/><path d="M14 10l6-6M16 4h4v4"/>', brush: '<path d="M20 4L10 14M10 14c-2-1-5 0-5 3 0 2-1 3-2 3 4 2 8 0 8-3z"/>', trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>', cup: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2v3M12 2v3"/>', restart: '<path d="M4 12a8 8 0 1 0 2.5-5.8L4 8.5M4 4v4.5h4.5"/>', sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>', loop: '<path d="M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4"/>', swap: '<path d="M4 8h16M16 4l4 4-4 4M20 16H4M8 12l-4 4 4 4"/>', truck: '<path d="M2 6h12v10H2zM14 9h4l3 3v4h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>', cursor: '<path d="M5 3l14 7-6 2-2 6z"/>', wall: '<rect x="3" y="5" width="18" height="14"/><path d="M3 12h18M9 5v7M15 12v7"/>', zone: '<rect x="4" y="4" width="16" height="16" rx="1" stroke-dasharray="3 2.5"/>', measure: '<path d="M3 12h18M3 8v8M21 8v8M8 12v-2M13 12v-2M18 12v-2"/>', curve: '<path d="M4 18c3-12 13 0 16-12M17 6h3v3"/>', cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>', tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>', screen: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>', magnet: '<path d="M6 3v9a6 6 0 0 0 12 0V3h-4v9a2 2 0 0 1-4 0V3zM6 7h4M14 7h4"/>', cabinet: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 12h14M10 7.5h4M10 16.5h4"/>', briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>', dup: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', wand: '<path d="M4 20L15 9M14 4v3M19 9h3M17.5 5.5l2-2M12 7l5 5"/>', keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>', person: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 11l4-2 4 2M9.5 21l2.5-6 2.5 6"/>', chair: '<path d="M7 3v10h10V3M5 13h14M7 13v8M17 13v8M7 17h10"/>', arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>', num: '<path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16"/>', steth: '<path d="M6 3v6a5 5 0 0 0 10 0V3M11 14v2a4 4 0 0 0 8 0v-2"/><circle cx="19" cy="12" r="2"/>', train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="14" r=".8"/><circle cx="15" cy="14" r=".8"/>', van: '<path d="M2 7h13l5 4v6H2z"/><path d="M15 7v4h5"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>', bed: '<path d="M3 18V6M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10" r="1.6"/>', eraser: '<path d="M4 15l9-9 7 7-6 6H8z"/><path d="M9 20h11"/>', flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>', gem: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>'
    };
    const M = { '📄': 'doc', '📕': 'doc', '🧾': 'doc', '📃': 'doc', '📝': 'edit', '💾': 'save', '📂': 'folder', '📁': 'folder', '🗂': 'folder', '⬇': 'down', '📥': 'down', '⬆': 'up', '📤': 'share', '🖨': 'print', '⚙': 'gear', '🔍': 'search', '🔎': 'search', '➕': 'plus', '＋': 'plus', '🗑': 'trash', '✏': 'edit', '🖊': 'edit', '👁': 'eye', '📋': 'clip', '🔗': 'link', '☁': 'cloud', '↶': 'undo', '↩': 'undo', '↷': 'redo', '↪': 'redo', '🕘': 'clock', '🕑': 'clock', '⏱': 'clock', '📅': 'cal', '📆': 'cal', '🗓': 'cal', '🎨': 'palette', '📷': 'cam', '📸': 'cam', '🖼': 'img', '✂': 'cut', '🔒': 'lock', '📊': 'chart', '📈': 'chart', '✉': 'mail', '📧': 'mail', '▶': 'play', '⏸': 'pause', '⏹': 'stop', '🔄': 'refresh', '🔃': 'refresh', '❓': 'help', '🏠': 'home', '👥': 'users', '📦': 'box', '🎬': 'clap', '🎙': 'mic', '🎤': 'mic', '💡': 'light', '☰': 'list', '📑': 'list', '▦': 'grid', '🔔': 'bell', '⭐': 'star', '⚡': 'bolt', '✅': 'check', '✔': 'check', '📍': 'pin', '📐': 'ruler', '🎞': 'film', '📚': 'book', '📱': 'phone', '🗺': 'map', '🧭': 'map', '🏷': 'tag', '💶': 'euro', '🧩': 'grid', '✨': 'star', '🧳': 'box', '🎭': 'users', '👤': 'users', '🔀': 'share', '✕': 'x', '🗒': 'note', '◀': 'left', '⛶': 'focus', '📡': 'signal', '🙋': 'hand', '🎥': 'video', '✍': 'pen', '›': 'right', '🗃': 'archive', '🎯': 'target', '🔬': 'zoom', '🦺': 'shield', '🌦': 'weather', '🏥': 'cross', '🤖': 'bot', '🔖': 'bookmark', '📜': 'scroll', '🧮': 'calc', '▤': 'panel', '📓': 'journal', '🕐': 'clock', '🔴': 'live', '▾': 'chev', '🍽': 'meal', '⚖': 'scale', '💳': 'card', '📇': 'contacts', '⟳': 'refresh', '🏛': 'bank', '🌐': 'globe', '🧹': 'broom', '🎧': 'headph', '🔤': 'text', '▭': 'rect', '◯': 'circle', '★': 'star', '⇢': 'ticker', '▰': 'bar', '🎛': 'sliders', '🛰': 'sat', '🖌': 'brush', '🏆': 'trophy', '☕': 'cup', '↺': 'restart', '🔊': 'sound', '🔁': 'loop', '↔': 'swap', '🚚': 'truck', '🖱': 'cursor', '🧱': 'wall', '🔲': 'zone', '📏': 'measure', '➰': 'curve', '🧊': 'cube', '📺': 'tv', '🖥': 'screen', '🧲': 'magnet', '🗄': 'cabinet', '💼': 'briefcase', '💬': 'chat', '⧉': 'dup', '🌙': 'moon', '🎚': 'sliders', '🪄': 'wand', '⌨': 'keyboard', '🧍': 'person', '🪑': 'chair', '➡': 'arrow', '🔢': 'num', '🩺': 'steth', '🚆': 'train', '🚐': 'van', '🏨': 'bed', '🧽': 'eraser', '📶': 'signal', '📑': 'dup', '🕒': 'clock', '🕓': 'clock', '✎': 'edit', '🕗': 'clock', '🕖': 'clock', '🏁': 'flag', '💎': 'gem', '❌': 'x' };
    const RX = new RegExp('^(\\s*)(' + Object.keys(M).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length).join('|') + ')(\\uFE0F)?\\s?');
    const svg = k => '<svg class="xgl-ic" viewBox="0 0 24 24" aria-hidden="true">' + P[k] + '</svg>';
    const iconsOn = () => { try { return localStorage.getItem(KI) !== '0'; } catch (e) { return true; } };
    function iconize(root) {
        if (!iconsOn()) return;
        // saison 6 : au-delà des barres — menus, fenêtres, panneaux, volet, écrans d'accueil (titres et boutons de l'interface, jamais le contenu saisi)
        const UI = '#xb-menu,[role=dialog],.modal-box,.modal,#xs-panel,.xinsp,#library-panel,.xem-trio,.xem-card,.welcome,.empty,.side-empty,.ct-empty,.gx-empty,#xid-pop';
        const IN = ['button', 'a', 'label', 'h2', 'h3', 'h4', 'summary', '.card-h'].map(t => UI.split(',').map(u => u + ' ' + t).join(',')).join(',');
        (root || document).querySelectorAll('#top-bar button,#toolbar button,#top-bar a,#toolbar a,#top-bar label,#toolbar label,#toolbar span:not(.btn-label):not(.xgl-e),#top-bar span:not(.btn-label):not(.xgl-e),#xoff,#xoff *,' + IN).forEach(b => {
            if (b.matches('input,textarea,select') || b.isContentEditable || b.closest('[contenteditable=true],#xb-menu small')) return;
            if (b.closest('#xst')) return;
            const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let n, done = 0;
            while (!done && (n = w.nextNode())) {
                if (!n.nodeValue.trim()) continue; done = 1; if (n.parentNode.classList && n.parentNode.classList.contains('xgl-e')) break;
                const m = RX.exec(n.nodeValue); if (!m) break; const k = M[m[2]]; if (!k) break;
                const s = document.createElement('span'); s.className = 'xgl-e'; s.textContent = m[2] + (m[3] || '');
                const t = document.createElement('template'); t.innerHTML = svg(k);
                const rest = n.nodeValue.slice(m[0].length); n.nodeValue = (rest ? ' ' : '') + rest;
                n.parentNode.insertBefore(s, n); n.parentNode.insertBefore(t.content.firstChild, n); if (!rest.trim()) n.nodeValue = '';
            }
        });
    }

    // ---- action principale ----
    const PRI = /^\s*(\S+\s+)?(exporter|export|pdf|générer|generer|enregistrer|sauvegarder|imprimer|lancer|convertir|publier|envoyer)\b/i;
    function primary() {
        const cur = document.querySelector('.xgl-pri'), xe = document.getElementById('xb-exp');
        if (cur && (cur === xe || (!xe && cur.offsetParent !== null))) return;
        const vis = x => x.offsetParent !== null && !x.closest('#xst,[class*=menu],[class*=drop],[id*=menu]');
        const all = [...document.querySelectorAll('#top-bar button,#toolbar button')].filter(vis);
        const b = document.querySelector('#xb-exp') || all.find(x => x.matches('.primary,.btn-primary,.btn-main,[data-primary]')) || all.find(x => PRI.test(x.textContent || '') && !/^\W*$/.test(x.textContent)) || all.find(x => /^\s*(exporter|export)\b/i.test(x.title || ''));
        if (b && b !== cur) { if (cur) cur.classList.remove('xgl-pri'); b.classList.add('xgl-pri'); }
    }

    // ---- indicateur glissant des sélecteurs du panneau ⚙️ ----
    function slide(seg) {
        let ind = seg.querySelector(':scope>.xgl-ind'); const on = seg.querySelector(':scope>button.on');
        if (!ind) { ind = document.createElement('span'); ind.className = 'xgl-ind'; seg.prepend(ind); if (getComputedStyle(seg).position === 'static') seg.style.position = 'relative'; }
        if (!on) { ind.style.width = '0'; return; } ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px';
        ind.style.top = on.offsetTop + 'px'; ind.style.height = on.offsetHeight + 'px'; ind.style.bottom = 'auto'; // sélecteur sur plusieurs lignes (thèmes) : la pastille suit la ligne du bouton choisi
    }
    function panels() { document.querySelectorAll('#xs-panel .xs-seg').forEach(s => { try { slide(s); } catch (e) { } }); }

    // ---- progression lumineuse (vers le bandeau d'onglets) ----
    let bt = 0;
    const post = p => { try { if (window.__xtshell === undefined && window.parent !== window) window.parent.postMessage({ xtbusy: p }, '*'); } catch (e) { } };
    function busy(on, pct) { clearTimeout(bt); post(on ? (pct == null ? -1 : Math.max(0, Math.min(100, pct))) : null); if (on) bt = setTimeout(() => post(null), 15000); }
    const EXP = /(export|pdf|générer|generer|imprimer|convertir|télécharger|telecharger|\.xlsx|excel|zip)/i;

    // ---- fiche « ? » : icônes maison / émojis ----
    function sheet(o) {
        if (!o || o.querySelector('.xgl-x')) return; const box = o.firstElementChild || o, on = iconsOn();
        const d = document.createElement('div'); d.className = 'xgl-x';
        d.innerHTML = '<h4>✏️ Icônes des barres d\'outils</h4><div class="seg"><button data-i="1" class="' + (on ? 'on' : '') + '">Icônes maison (trait fin)</button><button data-i="0" class="' + (on ? '' : 'on') + '">Émojis</button></div>';
        d.onclick = e => { const v = e.target.dataset.i; if (v == null) return; try { localStorage.setItem(KI, v); } catch (x) { } d.querySelectorAll('[data-i]').forEach(x => x.classList.toggle('on', x === e.target)); if (v === '1') iconize(); else document.querySelectorAll('.xgl-e').forEach(s => { const g = s.nextSibling; if (g && g.classList && g.classList.contains('xgl-ic')) g.remove(); s.replaceWith(document.createTextNode(s.textContent + ' ')); }); };
        box.appendChild(d);
    }

    function init(app) {
        const go = () => {
            const st = document.createElement('style'); st.id = 'xgl-css'; st.textContent = CSS; document.head.appendChild(st);
            let t = 0; const tick = () => { clearTimeout(t); t = setTimeout(() => { try { iconize(); primary(); panels(); } catch (e) { } }, 120); };
            tick(); setTimeout(tick, 1200);
            new MutationObserver(m => { for (let i = 0; i < Math.min(m.length, 40); i++) { const r = m[i]; const el = r.target.nodeType === 1 ? r.target : r.target.parentNode; if (el && el.closest && (el.closest('#top-bar,#toolbar,#xs-panel,#xb-menu,[role=dialog],.modal-box,.modal,.xinsp,#library-panel,.xem-trio,.xem-card,.welcome,.empty') || [...r.addedNodes].some(n => n.nodeType === 1 && (n.id === 'xs-ov' || n.id === 'xs-panel' || n.id === 'xb-menu' || (n.matches && n.matches('[role=dialog],.modal-overlay,.modal')))))) { tick(); break; } } const o = document.getElementById('xux-ov'); if (o) sheet(o); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
            document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button,a'); if (!b) return; if (b.closest('#xs-panel .xs-seg')) setTimeout(panels, 0); const l = (b.textContent || '') + ' ' + (b.title || ''); if (b.closest('#top-bar,#toolbar,.xpv-box,[id*=export],[class*=export]') && EXP.test(l)) busy(true); }, true);
            window.addEventListener('xiii-file', () => busy(false)); window.addEventListener('afterprint', () => busy(false));
            const wp = window.print; if (wp && !wp.__xgl) { const f = function () { busy(false); return wp.apply(this, arguments); }; f.__xgl = 1; window.print = f; }
        };
        if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
    }
    return { init, busy, iconize, icon: k => P[k] ? svg(k) : '' };
})();

XGLOW.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XENC : suivi des conversions ENCODO depuis tous les outils
//  Pendant qu'ENCODO convertit (dans son onglet / sa fenêtre), un petit onglet apparaît sur le bord droit
//  de l'écran, sous le panier : fichier en cours, pourcentage, temps restant, fichiers terminés à télécharger.
// =====================================================================
const XENC = (() => {
    const K = 'xiii.encodo.job', esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    let S = null, open = false, bc = null;
    const get = () => { try { return JSON.parse(localStorage.getItem(K)); } catch (e) { return null; } };
    function css() { if (document.getElementById('xenc-css')) return; const st = document.createElement('style'); st.id = 'xenc-css'; st.textContent =
        '#xenc-tab{position:fixed;right:0;top:calc(46% + 70px);z-index:10100;writing-mode:vertical-rl;padding:10px 5px;border-radius:10px 0 0 10px;border:1px solid rgba(240,179,120,.6);border-right:0;background:var(--bg-menu,#232327);color:#fff;cursor:pointer;font:600 12px "Segoe UI",sans-serif;box-shadow:-4px 4px 16px rgba(0,0,0,.4);display:flex;gap:6px;align-items:center}#xenc-tab b{color:#f0b378}#xenc-tab.done b{color:#81c784}' +
        '#xenc-p{position:fixed;right:34px;top:calc(46% + 20px);z-index:10101;width:320px;max-width:calc(100vw - 50px);background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);border-radius:14px;padding:14px;box-shadow:-8px 10px 30px rgba(0,0,0,.5);font:13px/1.45 "Segoe UI",system-ui,sans-serif}' +
        '#xenc-p .bar{height:7px;border-radius:4px;background:rgba(127,127,127,.25);overflow:hidden;margin:8px 0}#xenc-p .bar i{display:block;height:100%;background:linear-gradient(90deg,#ffcf5c,#f0a429)}#xenc-p .f{display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid rgba(127,127,127,.2)}#xenc-p .f span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#xenc-p button{font:inherit;font-size:12px;padding:4px 9px;border-radius:8px;cursor:pointer;background:rgba(240,179,120,.15);border:1px solid rgba(240,179,120,.5);color:inherit}#xenc-p small{color:var(--text-dim,#999)}';
        document.head.appendChild(st); }
    function draw() {
        const live = S && Date.now() - (S.at || 0) < 15000, recent = S && S.files && S.files.length && Date.now() - (S.at || 0) < 30 * 60000;
        let t = document.getElementById('xenc-tab'), p = document.getElementById('xenc-p');
        if (!S || !(live && S.run) && !recent) { if (t) t.remove(); if (p) p.remove(); return; }
        css(); const run = live && S.run, pct = S.cur ? Math.round(S.cur.pct || 0) : 100;
        if (!t) { t = document.createElement('div'); t.id = 'xenc-tab'; t.title = 'Conversions ENCODO'; t.onclick = () => { open = !open; draw(); }; document.body.appendChild(t); }
        t.className = run ? '' : 'done'; t.innerHTML = '🔄 <b>' + (run ? pct + ' %' : '✓ ' + S.files.length) + '</b>';
        if (!open) { if (p) p.remove(); return; }
        if (!p) { p = document.createElement('div'); p.id = 'xenc-p'; document.body.appendChild(p); }
        p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center"><b>🔄 ENCODO</b><button data-x>✕</button></div>' +
            (run && S.cur ? '<div style="margin-top:8px"><div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(S.cur.name) + '</div><div class="bar" style="display:block"><i style="width:' + pct + '%"></i></div><small>' + esc(S.cur.txt || '') + ' · ' + S.done + ' / ' + S.n + ' fichier(s)</small></div>' : S.run && !live ? '<p><small>⚠️ ENCODO ne répond plus : sa page a peut-être été fermée.</small></p>' : '<p><small>✅ Conversions terminées.</small></p>') +
            (S.files.length ? '<div style="margin-top:8px">' + S.files.slice(-8).map(f => '<div class="f"><span title="' + esc(f.name) + '">' + esc(f.name) + '</span><button data-dl="' + esc(f.k) + '">⬇️</button></div>').join('') + '</div>' : '') +
            '<div style="margin-top:10px;text-align:right"><button data-o>Ouvrir ENCODO ↗</button></div>';
        p.querySelector('[data-x]').onclick = () => { open = false; draw(); };
        p.querySelector('[data-o]').onclick = () => { const w = window.open('encodo.html', 'xiii-encodo'); try { w && w.focus(); } catch (e) { } };
        p.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { if (bc) bc.postMessage({ t: 'dl', k: b.dataset.dl }); else { try { localStorage.setItem('xiii.encodo.req', JSON.stringify({ t: 'dl', k: b.dataset.dl, at: Date.now() })); } catch (e) { } } });
    }
    function init(app) {
        if (app === 'encodo') return; S = get();
        try { bc = new BroadcastChannel('xiii-encodo'); bc.onmessage = e => { if (e.data && e.data.t === 'job') { S = e.data.s; draw(); } }; } catch (e) { }
        addEventListener('storage', e => { if (e.key === K) { S = get(); draw(); } });
        setInterval(() => { S = get() || S; draw(); }, 5000);
        const go = () => draw(); if (typeof XBOOT !== 'undefined') XBOOT.ready(go, 3000); else addEventListener('load', go);
    }
    return { init };
})();

XENC.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XERR : 🩺 journal des erreurs (anonyme)
//  Les erreurs JavaScript rencontrées par les utilisateurs sont envoyées, sans aucune donnée de projet ni
//  identité : outil, message tronqué, fichier:ligne, navigateur (court), beta / public. 5 au plus par page,
//  doublons regroupés. Lecture réservée au serveur (Supabase). Désactivable : ⚙️ (clé xiii.errlog = "off").
// =====================================================================
(function () {
    try { if (localStorage.getItem('xiii.errlog') === 'off') return; } catch (e) { }
    const H = location.hostname, site = /^beta--/.test(H) ? 'beta' : /netlify\.app$|suite-?xiii/.test(H) ? 'public' : /^(localhost|127\.|$)/.test(H) ? 'local' : 'autre';
    if (site === 'local') return;
    const app = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '').slice(0, 40) || 'index';
    const ua = (() => { const u = navigator.userAgent; const b = /Edg\//.test(u) ? 'Edge' : /Chrome\//.test(u) ? 'Chrome' : /Firefox\//.test(u) ? 'Firefox' : /Safari\//.test(u) ? 'Safari' : 'Autre'; const o = /iPhone|iPad/.test(u) ? 'iOS' : /Android/.test(u) ? 'Android' : /Mac OS/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'Linux'; return b + ' · ' + o; })();
    const seen = {}; let sent = 0;
    const IGN = /ResizeObserver loop|Script error\.?$|extension:\/\/|NetworkError|Failed to fetch|Load failed|AbortError|The user aborted|\[object ErrorEvent\]/i; // ErrorEvent : relais vide d'un worker, sans information
    const clean = s => String(s || '').replace(/https?:\/\/[^\s)]+\/([^\/\s)]+)/g, '$1').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[e-mail]').replace(/\b\d{6,}\b/g, '[n]').slice(0, 400);
    function send(msg, src) {
        msg = clean(msg); if (!msg || IGN.test(msg) || window.__xdiag) return; const k = msg + '|' + src; // __xdiag : diagnostic en cours (échecs attendus) if (seen[k]) { seen[k]++; return; } if (sent >= 5) return; seen[k] = 1; sent++;
        setTimeout(() => { try { fetch('https://abvvsoccbdftticlmpgi.supabase.co/rest/v1/client_errors', { method: 'POST', keepalive: true, headers: { apikey: 'sb_publishable_wB5kIn6lQtO-YWdUlt3gfg_IBIgBMuL', 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ app, msg, src: clean(src).slice(0, 200), site, ua, n: Math.min(50, seen[k]) }) }).catch(() => { }); } catch (e) { } }, 3000);
    }
    addEventListener('error', e => { if (!e || !e.message) return; send(e.message, (e.filename || '').split('/').pop() + ':' + (e.lineno || 0)); });
    addEventListener('unhandledrejection', e => { const r = e && e.reason; send('Promesse : ' + ((r && (r.message || r)) || '?'), r && r.stack ? String(r.stack).split('\n')[1] || '' : ''); });
})();

// =====================================================================
//  SUITE XIII — XIFTTT : 🔗 automatisations IFTTT (service « Webhooks »)
//  Événements de la suite → IFTTT, qui enchaîne ce que vous voulez (SMS, e-mail, Slack, lampe connectée…).
//  Événements : xiii_fin_emission (CONDUCO), xiii_rushes_ok (BACKUPO, carte vérifiée), xiii_convocations (CALL SHEETO).
//  Réglage dans ⚙️ › 🔗 Automatisations : clé Webhooks (gardée sur cet appareil) et choix des événements.
// =====================================================================
const XIFTTT = (() => {
    const K = 'xiii.ifttt', J = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } };
    const EV = [['xiii_fin_emission', "🏁 Fin d'émission (CONDUCO)"], ['xiii_rushes_ok', '💽 Carte copiée et vérifiée (BACKUPO)'], ['xiii_convocations', '📨 Convocations envoyées (CALL SHEETO)']];
    function fire(ev, v1, v2, v3) {
        const c = J(); if (!c.key || (c.off || {})[ev]) return false;
        const u = 'https://maker.ifttt.com/trigger/' + ev + '/with/key/' + encodeURIComponent(c.key) + '?value1=' + encodeURIComponent(v1 || '') + '&value2=' + encodeURIComponent(v2 || '') + '&value3=' + encodeURIComponent(v3 || '');
        try { fetch(u, { mode: 'no-cors' }).catch(() => { }); } catch (e) { } return true;
    }
    function panel() {
        const c = J(), o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:9995;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px';
        o.innerHTML = '<div style="background:var(--bg-panel,#232323);color:inherit;border:1px solid var(--border-color,#444);border-radius:12px;padding:18px;width:min(520px,100%);font:14px/1.5 \'Segoe UI\',system-ui,sans-serif"><b style="font-size:16px">🔗 Automatisations IFTTT</b><p style="opacity:.8;margin:6px 0 10px">Reliez la SUITE XIII à IFTTT (service <b>Webhooks</b>) : à chaque événement coché, IFTTT lance l\'action de votre choix — SMS ou message à l\'équipe, e-mail, notification…</p>' +
            '<label style="display:block;font-size:12px;opacity:.75">Clé Webhooks (ifttt.com › Webhooks › Documentation)</label><input id="xif-k" value="' + (c.key || '').replace(/"/g, '') + '" placeholder="ex. dA1b2C3…" style="width:100%;box-sizing:border-box;padding:8px;margin:4px 0 10px;border-radius:8px;border:1px solid #555;background:#111;color:inherit">' +
            EV.map(e => '<label style="display:flex;gap:8px;align-items:center;margin:4px 0"><input type="checkbox" data-ev="' + e[0] + '"' + ((c.off || {})[e[0]] ? '' : ' checked') + '> ' + e[1] + ' <code style="opacity:.6;font-size:11px">' + e[0] + '</code></label>').join('') +
            '<p style="opacity:.7;font-size:12px">Dans IFTTT : « If This » = Webhooks › « Receive a web request » avec le nom d\'événement ci-dessus ; les détails arrivent dans Value1 à Value3. Le service Webhooks d\'IFTTT peut demander un abonnement IFTTT Pro.</p>' +
            '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><button id="xif-t">Tester</button><button id="xif-x">Fermer</button><button id="xif-s" style="background:#f0b429;color:#1b1406;border:0;border-radius:8px;padding:6px 14px;font-weight:700">Enregistrer</button></div></div>';
        document.body.appendChild(o); const save = () => { const off = {}; o.querySelectorAll('[data-ev]').forEach(i => { if (!i.checked) off[i.dataset.ev] = 1; }); localStorage.setItem(K, JSON.stringify({ key: o.querySelector('#xif-k').value.trim(), off })); };
        o.querySelector('#xif-x').onclick = () => o.remove(); o.querySelector('#xif-s').onclick = () => { save(); o.remove(); };
        o.querySelector('#xif-t').onclick = () => { save(); const ok = fire('xiii_test', 'Test SUITE XIII', new Date().toLocaleString('fr-FR'), ''); alert(ok ? 'Événement « xiii_test » envoyé : vérifiez l\'activité de votre applet IFTTT.' : 'Indiquez d\'abord votre clé Webhooks.'); };
    }
    return { fire, panel, EV };
})();

// =====================================================================
//  SUITE XIII — XLIVE : ⚡ synchro instantanée de l'équipe (Supabase Realtime, canal « broadcast »)
//  Le Drive du projet reste la seule source des données. XLIVE ne transporte qu'un signal « l'outil X a changé
//  (révision n) » entre les appareils du même projet : chacun relit aussitôt le Drive au lieu d'attendre le
//  prochain passage (4 à 20 s). Aucune donnée du projet ne transite par Supabase.
//  Canal : empreinte SHA-256 de l'adresse du Drive du projet (non devinable sans le lien du projet).
//  Hors ligne ou Supabase indisponible : tout continue comme avant (relecture périodique).
// =====================================================================
const XLIVE = (() => {
    const WS = 'wss://abvvsoccbdftticlmpgi.supabase.co/realtime/v1/websocket?apikey=sb_publishable_wB5kIn6lQtO-YWdUlt3gfg_IBIgBMuL&vsn=1.0.0';
    const J = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
    const ME = Math.random().toString(36).slice(2, 10), L = new Set(), L2 = new Set();
    let ws = null, topic = '', ref = 0, hb = null, retry = 0, joined = false, wantUrl = '', q = [];
    async function hash(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('xiii|' + s)); return [...new Uint8Array(b)].slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join(''); }
    const send = o => { try { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); } catch (e) { } };
    async function connect() {
        const c = J('xiii.drive'); if (!c || !c.url || typeof WebSocket === 'undefined' || !crypto.subtle) return;
        if (ws && wantUrl === c.url && ws.readyState <= 1) return; wantUrl = c.url;
        try { if (ws) ws.close(); } catch (e) { }
        topic = 'realtime:xiii-' + await hash(c.url.split('?')[0]); joined = false;
        try { ws = new WebSocket(WS); } catch (e) { return; }
        ws.onopen = () => { retry = 0; send({ topic, event: 'phx_join', payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } }, ref: String(++ref) }); clearInterval(hb); hb = setInterval(() => send({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) }), 25000); };
        ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (x) { return; }
            if (m.event === 'phx_reply' && m.topic === topic && m.payload && m.payload.status === 'ok') { joined = true; const Q = q; q = []; Q.forEach(p => ping(p)); }
            if (m.event === 'broadcast' && m.payload && m.payload.event === 'xpres') { const p = m.payload.payload || {}; if (p.from !== ME) L2.forEach(fn => { try { fn(p); } catch (x) { } }); }
            if (m.event === 'broadcast' && m.payload && m.payload.event === 'xiii') { const p = m.payload.payload || {}; if (p.from === ME) return; L.forEach(fn => { try { fn(p); } catch (x) { } }); } };
        ws.onclose = () => { joined = false; clearInterval(hb); if (!J('xiii.drive')) return; const d = Math.min(30000, 1000 * Math.pow(2, retry++)); setTimeout(() => { if (document.visibilityState === 'visible') connect(); }, d); };
        ws.onerror = () => { };
    }
    function ping(p) { p = Object.assign({ from: ME, at: Date.now() }, p || {}); if (!joined) { q.push(p); if (q.length > 20) q.shift(); connect(); return; } send({ topic, event: 'broadcast', payload: { type: 'broadcast', event: 'xiii', payload: p }, ref: String(++ref) }); }
    const on = fn => { L.add(fn); connect(); return () => L.delete(fn); };
    // 👥 présence en direct : signal léger, jamais mis en file (perdu si non connecté), écouté à part des signaux de données
    function sig(p) { if (!joined) { connect(); return false; } send({ topic, event: 'broadcast', payload: { type: 'broadcast', event: 'xpres', payload: Object.assign({ from: ME }, p || {}) }, ref: String(++ref) }); return true; }
    const onSig = fn => { L2.add(fn); connect(); return () => L2.delete(fn); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') connect(); });
    addEventListener('storage', e => { if (e.key === 'xiii.drive') connect(); });
    return { on, ping, sig, onSig, connect, live: () => joined, id: ME };
})();

// =====================================================================
//  SUITE XIII — XDRIVE : ☁️ Drive du projet
//  Les données de chaque outil sont rangées dans un Google Sheets du Drive du Master, via un petit script
//  Google Apps Script qu'il installe lui-même (drive.html). Les membres n'ont besoin d'aucun compte :
//  le lien d'équipe contient l'adresse du script et le code d'équipe.
//  Synchronisation : à l'ouverture, quelques secondes après chaque enregistrement, et toutes les 25 s.
//  Deux personnes modifient en même temps → fusion élément par élément (moteur de XDELEG), sans rien écraser.
// =====================================================================
const XDRIVE = (() => {
    let APP = '', PRES = {}, okIds = new Set(), lastBeat = 0, busy = false, timer = null, deb = null, pend = null, lastInput = Date.now(), st = { s: 'off', m: 'Drive non relié' };
    const K_CFG = 'xiii.drive', K_BASE = a => 'xiii.drive.base.' + a, K_OWN = a => 'xiii.drive.own.' + a, K_STAT = 'xiii.drive.stat';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const RAW = Storage.prototype.setItem;
    const W = (k, v) => { try { if (v == null) localStorage.removeItem(k); else RAW.call(localStorage, k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { } };
    const say = (m, ms) => { try { if (typeof toast === 'function') toast(m, ms); } catch (e) { } };
    const fmt = ts => { if (!ts) return '—'; const d = new Date(ts), t = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); return (new Date().toDateString() === d.toDateString() ? 'aujourd\'hui' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })) + ' à ' + t; };
    const cfg = () => J(K_CFG, null);
    const perm = () => { const c = cfg(); return (c && c.perm) || 'edit'; };
    function unionNotes(a, b) { // réunion de deux fils de commentaires (texte JSON)
        if (!a && !b) return undefined; let N = {}, T = {}; try { N = JSON.parse(a || '{}'); T = JSON.parse(b || '{}'); } catch (e) { return a || b; }
        Object.keys(T).forEach(id => { const x = N[id] || (N[id] = { label: T[id].label, thread: [] }), seen = new Set(x.thread.map(m => m.ts + '|' + m.who)); (T[id].thread || []).forEach(m => { if (!seen.has(m.ts + '|' + m.who)) x.thread.push(m); }); x.thread.sort((u, v) => u.ts - v.ts); if ((T[id].sts || 0) > (x.sts || 0)) { x.status = T[id].status; x.by = T[id].by; x.sts = T[id].sts; } });
        return JSON.stringify(N);
    }
    const DEV = (() => { let d = localStorage.getItem('xiii.drive.dev'); if (!d) { d = 'v' + Math.random().toString(36).slice(2, 10); W('xiii.drive.dev', d); } return d; })();
    // ---------- présence : qui modifie cet outil en ce moment ----------
    const around = (P, a) => Object.entries(((P || PRES)[a || APP]) || {}).filter(([id, v]) => id !== DEV && Date.now() - v.ts < 45000).map(([id, v]) => Object.assign({ id }, v)); // 👥 tout le monde qui a l'outil ouvert
    const others = (P, a) => around(P, a).filter(v => v.e == null || Date.now() - v.e < 45000); // ✏️ ceux qui modifient
    const where = () => { const b = document.querySelector('#view-group .btn-active,[data-view].btn-active,[data-view].active,.tab.active,.tab-active,[role=tab][aria-selected=true]'); return b ? (b.textContent || '').replace(/[\u2190-\u2BFF\uFE0F\u200D]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, '').replace(/\s+/g, ' ').trim().slice(0, 30) : ''; };
    let lastLook = 0, lockKey = '', lockEdit = 0, lockSent = '';
    // 🔒 verrou d'élément : l'élément que je modifie est signalé aux autres (contour à ma couleur, protégé ~15 s)
    const LA = ['data-id', 'data-uid', 'data-key', 'data-idx', 'data-row', 'data-i'];
    function keyOf(t) { if (!t || !t.closest || t.closest('[id^="xdr-"],#xpres,[id^="xt-"],[id^="xs-"]')) return ''; for (const a of LA) { const e = t.closest('[' + a + ']'); if (e && e.getAttribute(a)) return a + '=' + e.getAttribute(a); } const f = t.closest('input[id],textarea[id],select[id],[contenteditable=true][id]'); return f ? 'id=' + f.id : ''; }
    function elOf(k) { const i = k.indexOf('='); if (i < 0) return null; const a = k.slice(0, i), v = k.slice(i + 1); try { return document.querySelector(a === 'id' ? '#' + CSS.escape(v) : '[' + a + '="' + CSS.escape(v) + '"]'); } catch (e) { return null; } }
    const pcol = n => { let h = 0; for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) | 0; return 'hsl(' + (Math.abs(h) % 360) + ',60%,55%)'; };
    function lockSend(force) { const c = cfg(); if (!c || why() || perm() !== 'edit') return; const k = lockKey && Date.now() - lockEdit < 15000 ? lockKey : ''; if (!force && k === lockSent && !k) return; lockSent = k; api('beat', { app: APP, by: me(), id: DEV, look: 1, w: where(), f: k }).then(r => { if (r && r.ok && r.pres) { PRES = r.pres; presUI(); } }); }
    function locks() {
        document.querySelectorAll('.xlock').forEach(e => { e.classList.remove('xlock'); e.style.removeProperty('--xlc'); e.removeAttribute('data-xlock'); });
        around().forEach(a => { if (!a.f || !a.ft || Date.now() - a.ft > 15000 || a.f === lockKey) return; const e = elOf(a.f); if (!e) return; e.classList.add('xlock'); e.style.setProperty('--xlc', pcol(a.by)); e.setAttribute('data-xlock', '🔒 ' + a.by); });
    }
    function lockGuard(e) { const L = e.target && e.target.closest && e.target.closest('.xlock'); if (!L) return; e.preventDefault(); e.stopPropagation(); if (e.target.blur) try { e.target.blur(); } catch (x) { } const now = Date.now(); if (now - (lockGuard.t || 0) > 2500) { lockGuard.t = now; try { (window.toast || window.showToast || alert.bind(null))(L.getAttribute('data-xlock') + ' modifie cet élément : réessayez dans quelques secondes'); } catch (x) { } } }
    function look() { // présence : toutes les 20 s quand l'outil est visible
        const c = cfg(); if (!c || why() || document.visibilityState !== 'visible') return; const now = Date.now(); if (now - lastLook < 18000) return; lastLook = now;
        api('beat', { app: APP, by: me(), id: DEV, look: 1, w: where() }).then(r => { if (r && r.ok && r.pres) { const had = around().length; PRES = r.pres; presUI(); try { dispatchEvent(new Event('xiii-pres')); } catch (e) { } if (!had && around().length) tick(false); } });
    }
    function beat(stop) {
        const c = cfg(); if (!c || why()) return; const now = Date.now(); if (!stop && now - lastBeat < 10000) return; lastBeat = stop ? 0 : now;
        const body = { app: APP, by: me(), id: DEV, stop: !!stop, w: where() };
        if (stop && navigator.sendBeacon) { try { navigator.sendBeacon(c.url, new Blob([JSON.stringify(Object.assign({ a: 'beat', code: c.code }, body))], { type: 'text/plain' })); } catch (e) { } return; }
        api('beat', body).then(r => { if (r && r.ok && r.pres) { PRES = r.pres; presUI(); try { dispatchEvent(new Event('xiii-pres')); } catch (e) { } } });
    }
    function presUI() {
        const O = others(), b = document.getElementById('xdr-btn'); if (!b) return;
        let chip = document.getElementById('xdr-chip'); if (!chip) { b.insertAdjacentHTML('afterend', '<span id="xdr-chip"></span>'); chip = document.getElementById('xdr-chip'); chip.onclick = panel; }
        const N = J('xiii.drive.news.' + APP, null), names = [...new Set(O.map(o => o.by))].join(', ');
        if (O.length) { chip.className = 'busy'; chip.textContent = '✏️ Modifications en cours · ' + names; chip.title = names + ' modifie cet outil en ce moment'; }
        else if (perm() !== 'edit') { chip.className = 'ro'; chip.textContent = perm() === 'read' ? '👁️ Lecture seule' : '💬 Commentaires seulement'; chip.title = 'Droit donné par le Master : vos modifications de l\'outil ne sont pas enregistrées' + (perm() === 'comment' ? ' (seuls vos commentaires 💬 Avis le sont)' : ''); }
        else if (N && Date.now() - N.ts < 15 * 60000) { chip.className = 'news'; chip.textContent = '✨ Nouveautés de l\'équipe'; chip.title = 'Dernière modification par ' + N.by + ' ' + fmt(N.ts); }
        else { chip.className = ''; chip.textContent = ''; }
        let pl = document.getElementById('xpres'); if (!pl) { chip.insertAdjacentHTML('afterend', '<span id="xpres"></span>'); pl = document.getElementById('xpres'); pl.onclick = panel; }
        const A = around(), seen = {}; A.forEach(a => { if (!seen[a.by]) seen[a.by] = a; else if (a.ts > seen[a.by].ts) seen[a.by] = a; });
        const col = n => { let h = 0; for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) | 0; return 'hsl(' + (Math.abs(h) % 360) + ',60%,55%)'; };
        const ini = n => (String(n).trim().split(/\s+/).map(w => w[0] || '').join('').slice(0, 2) || '?').toUpperCase();
        const L = Object.values(seen); pl.innerHTML = L.slice(0, 5).map(a => { const ed = a.e != null && Date.now() - a.e < 45000; return '<i style="background:' + col(a.by) + (ed ? ';box-shadow:0 0 0 2px #ff9800' : '') + '" title="' + String(a.by).replace(/"/g, '') + (a.w ? ' — ' + String(a.w).replace(/"/g, '') : '') + (ed ? ' · ✏️ modifie' : ' · 👁️ consulte') + '">' + ini(a.by) + '</i>'; }).join('') + (L.length > 5 ? '<i style="background:#555" title="' + L.slice(5).map(a => a.by).join(', ').replace(/"/g, '') + '">+' + (L.length - 5) + '</i>' : '');
        pl.style.display = L.length ? '' : 'none';
        locks();
        [...okIds].forEach(id => { if (!O.find(o => o.id === id)) okIds.delete(id); });
    }
    function guard(e) { // premier clic pendant qu'un autre modifie : prévenir
        const O = others().filter(o => !okIds.has(o.id)); if (!O.length || e.target.closest('#xdr-ov,#xdr-ban,#xdr-chip,#xdr-btn,#xmm-ban,#xmm-ov,#xmm-btn,#xhs-ov,#xhs-btn,#xdl-ov,#xnt-btn')) return;
        e.preventDefault(); e.stopPropagation();
        const names = [...new Set(O.map(o => o.by))].join(', ');
        const o = dlg('<h3>✏️ Modifications en cours par quelqu\'un d\'autre</h3><p><b>' + esc(names) + '</b> modifie ' + esc(XDELEG.NAMES[APP] || APP) + ' en ce moment (dernier signe ' + fmt(Math.max.apply(null, O.map(x => x.ts))) + ').</p><p class="xdr-h">Si vous modifiez aussi, vos changements seront fusionnés élément par élément ; sur un même champ, la dernière modification l\'emporte. Vous pouvez aussi attendre la fin de ses modifications.</p>' +
            '<div class="xdr-b"><button data-x>Attendre</button><button id="xdr-go" class="ok">Continuer à modifier quand même</button></div>');
        o.querySelector('#xdr-go').onclick = () => { O.forEach(x => okIds.add(x.id)); o.remove(); };
    }
    const keys = () => (XDELEG.KEYS[APP] || []);
    const NK = () => 'xiii.notes.' + APP;
    const me = () => { const c = cfg() || {}; return (c.me && c.me.name) || (J('xiii.deleg.me', {}) || {}).name || (c.role === 'master' ? 'Master' : 'Membre'); };
    const fiche = () => { const s = J('xiii.projets', null); return s && s.list ? s.list.find(f => f && f.id === s.active) || null : null; };
    const MK = () => 'xiii.memo.' + APP;
    const SIDE = () => perm() === 'read' ? [MK()] : [NK(), MK()]; // ce que chacun peut écrire en dehors des données de l'outil
    const U2 = k => k === MK() ? unionMemo : unionNotes;
    function unionMemo(a, b) { // 📌 mots pour l'équipe : réunion des mots, réponses, « lu par » et archivages
        if (!a && !b) return undefined; let N = {}, T = {}; try { N = JSON.parse(a || '{}'); T = JSON.parse(b || '{}'); } catch (e) { return a || b; }
        Object.keys(T).forEach(id => { const x = N[id], y = T[id]; if (!x) { N[id] = y; return; } const seen = new Set((x.rep || []).map(r => r.ts + '|' + r.by)); x.rep = (x.rep || []).concat((y.rep || []).filter(r => !seen.has(r.ts + '|' + r.by))).sort((u, v) => u.ts - v.ts); x.read = Object.assign({}, y.read || {}, x.read || {}); x.arch = Math.max(x.arch || 0, y.arch || 0); });
        return JSON.stringify(N);
    }
    function local() { return typeof XFILES !== 'undefined' ? XFILES.pack(rawLocal()) : rawLocal(); }
    function rawLocal() { const o = XDELEG.grab(); [NK(), MK()].forEach(k => { const n = localStorage.getItem(k); if (n != null && n !== '{}') o[k] = n; }); return o; }
    const isEmpty = d => !d || !keys().some(k => { const v = d[k]; if (v == null) return false; try { const x = JSON.parse(v); return x && (typeof x !== 'object' || Object.keys(x).length); } catch (e) { return !!v; } });
    // changements « réels » (les dates d'enregistrement sont ignorées : pas de va-et-vient entre deux postes)
    const delta = (from, to) => XDELEG._t.changes(from || {}, from || {}, to || {});
    const differs = (from, to) => delta(from, to).length > 0 || [NK(), MK()].some(k => ((from || {})[k] || '') !== ((to || {})[k] || ''));
    const summary = (from, to) => { if (!from) return 'première version envoyée au Drive'; const G = delta(from, to); const ico = { add: '＋', del: '－', mod: '✎' }; const s = G.slice(0, 8).map(g => ico[g.op] + ' ' + g.lab).join(' · ') + (G.length > 8 ? ' · … (' + G.length + ' au total)' : ''); return s || (((from || {})[MK()] || '') !== ((to || {})[MK()] || '') ? '📌 mots pour l\'équipe' : ((from || {})[NK()] || '') !== ((to || {})[NK()] || '') ? '💬 commentaires' : 'mise à jour'); };
    function why() { // raison d'une pause éventuelle
        const c = cfg(); if (!c || !c.url) return 'off';
        if (c.apps && c.apps.indexOf(APP) < 0) return 'Pause : cet outil n\'est pas partagé avec vous';
        if (J('xiii.deleg.active.' + APP, null)) return 'Pause : vous travaillez sur une délégation dans cet outil';
        const f = fiche(); if (c.pid && f && f.id !== c.pid) return 'Pause : la fiche projet active n\'est pas « ' + (c.proj || 'celle du Drive') + ' »';
        return '';
    }
    function set(s, m) { st = { s, m }; const b = document.getElementById('xdr-btn'); if (b) { b.dataset.s = s; b.title = '☁️ Drive du projet — ' + m; }
        const S = J(K_STAT, {}); S[APP] = Object.assign(S[APP] || {}, { s, m, at: Date.now() }); W(K_STAT, S); }
    async function api(a, p) {
        const c = cfg(), ctl = typeof AbortController === 'function' ? new AbortController() : null, to = setTimeout(() => ctl && ctl.abort(), 30000);
        try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code }, p || {})), signal: ctl && ctl.signal, redirect: 'follow' }); return await r.json(); }
        catch (e) { return { ok: false, err: 'net' }; } finally { clearTimeout(to); }
    }
    const ERR = { pending: 'en attente de validation par le Master', readonly: 'lecture seule', forbidden: 'outil non partagé avec vous', expired: 'lien expiré : demandez-en un nouveau au Master', revoked: 'accès retiré par le Master', admin: 'réservé au Master', net: 'hors connexion ou Drive injoignable', code: 'code d\'équipe refusé (il a peut-être été changé)', not_installed: 'script non installé (fonction « installer » à exécuter)', busy: 'Drive occupé, nouvel essai bientôt', conflict: 'conflit', script: 'erreur du script Google' };
    async function push(data, base) {
        const b = J(K_BASE(APP), null), r = await api('put', { app: APP, base, data, by: me(), sum: summary(b && b.data, data) });
        if (r.ok) { W(K_BASE(APP), { rev: r.rev, ts: r.ts, by: me(), data }); try { XLIVE.ping({ app: APP, rev: r.rev, by: me() }); } catch (e) { } return r; }
        return r;
    }
    const idle = () => Date.now() - lastInput > 8000 && !document.querySelector('input:focus,textarea:focus,select:focus,[contenteditable]:focus') && !document.querySelector('#xdl-ov,#xdr-ov,.modal-overlay.show,.modal.show,.modal-overlay[style*="flex"]');
    function apply(rec, msg) { // pose la version fusionnée puis recharge l'outil
        pend = null; hideBan(); if (rec.by && rec.by !== me()) W('xiii.drive.news.' + APP, { by: rec.by, ts: rec.ts || Date.now() });
        const n = rec.data[NK()]; if (n) { try { XDELEG.mergeNotes(JSON.parse(n)); } catch (e) { } }
        const mm = rec.data[MK()]; if (mm) { const u = unionMemo(localStorage.getItem(MK()), mm); if (u !== localStorage.getItem(MK())) localStorage.setItem(MK(), u); }
        if (!delta(local(), rec.data).length) { W(K_BASE(APP), rec); set('ok', 'à jour'); return; } // seuls les avis / mots ont changé : pas besoin de recharger l'outil
        W(K_BASE(APP), rec);
        if (typeof XFILES !== 'undefined' && JSON.stringify(rec.data).indexOf('xiiif:') > -1) { XFILES.unpack(rec.data).then(d => XDELEG.put(d, { m: msg })); return; }
        XDELEG.put(rec.data, { m: msg });
    }
    // ---------- le cœur : une synchronisation ----------
    async function tick(initial) {
        if (busy) return; const w = why(); if (w === 'off') { set('off', 'Drive non relié'); return; } if (w) { set('pause', w); return; }
        busy = true;
        try {
            if (typeof XFILES !== 'undefined' && perm() === 'edit') { try { const nf = await XFILES.prepare(rawLocal(), APP); if (nf) set('sync', nf + ' fichier(s) déposé(s) dans le Drive'); } catch (e) { } }
            const c = cfg(), b = J(K_BASE(APP), null), mine = local();
            for (let tries = 0; tries < 3; tries++) {
                set('sync', 'synchronisation…');
                const r = await api('get', { app: APP, since: b ? b.rev : null }); if (r && r.pres) { PRES[APP] = r.pres; presUI(); }
                if (!r.ok) { set('err', ERR[r.err] || r.err || 'erreur'); return; }
                if (perm() !== 'edit') { // 👁️ lecture seule / 💬 commentaires : l'outil suit le Drive, seuls les commentaires partent
                    if (!r.rev) { set('ok', 'rien encore dans le Drive pour cet outil'); return; }
                    if (!b && !isEmpty(mine) && !localStorage.getItem(K_OWN(APP))) W(K_OWN(APP), mine);
                    const rec = r.same ? b : { rev: r.rev, ts: r.ts, by: r.by, data: r.data || {} }, srv = rec.data;
                    if (b && SIDE().some(k => (mine[k] || '') !== (b.data[k] || '') && (mine[k] || '') !== (srv[k] || ''))) {
                        const m = Object.assign({}, srv); SIDE().forEach(k => { const u = U2(k)(srv[k], mine[k]); if (u) m[k] = u; });
                        const p = await push(m, rec.rev); if (p.err === 'conflict') continue; if (!p.ok) { set('err', ERR[p.err] || p.err); return; }
                        if (differs(m, mine)) apply({ rev: p.rev, ts: p.ts, by: me(), data: m }, '✅ Envoyé'); else { W(K_BASE(APP), { rev: p.rev, ts: p.ts, by: me(), data: m }); set('ok', 'envoyé ' + fmt(p.ts)); } return;
                    }
                    if (differs(srv, mine)) { if (initial || idle() || (b && !differs(b.data, srv))) { apply(rec, (b && !differs(b.data, srv) ? (perm() === 'read' ? '👁️ Lecture seule : modification annulée' : '💬 Seuls les commentaires sont enregistrés') : '☁️ Mis à jour : ' + (r.by || 'l\'équipe'))); return; } pend = rec; ban(rec, summary(mine, srv)); set('wait', 'mise à jour disponible'); return; }
                    W(K_BASE(APP), rec); set('ok', (perm() === 'read' ? 'lecture seule' : 'commentaires seulement') + ' — à jour (' + fmt(r.ts) + ')'); return;
                }
                if (!r.rev) { // rien encore pour cet outil dans le Drive
                    if (isEmpty(mine)) { set('ok', 'à jour (outil vide)'); return; }
                    const p = await push(mine, 0); if (p.ok) { set('ok', 'envoyé au Drive ' + fmt(p.ts)); return; } if (p.err === 'conflict') continue; set('err', ERR[p.err] || p.err); return;
                }
                if (r.same) {
                    if (b && differs(b.data, mine)) { const p = await push(mine, b.rev); if (p.ok) { set('ok', 'enregistré dans le Drive ' + fmt(p.ts)); if (!initial && delta(b.data, mine).length) beat(); return; } if (p.err === 'conflict') continue; set('err', ERR[p.err] || p.err); return; }
                    set('ok', 'à jour — dernière modification ' + fmt(r.ts) + (r.by ? ' par ' + r.by : '')); return;
                }
                const their = r.data || {}, rec = { rev: r.rev, ts: r.ts, by: r.by, data: their };
                if (!b) { // premier lien de ce poste avec le Drive
                    if (!differs(their, mine)) { W(K_BASE(APP), rec); set('ok', 'à jour'); return; }
                    if (c.role === 'member' || isEmpty(mine)) { if (c.role === 'member' && !isEmpty(mine) && !localStorage.getItem(K_OWN(APP))) W(K_OWN(APP), mine); apply(rec, '☁️ Version du Drive chargée (' + (r.by || 'Master') + ', ' + fmt(r.ts) + ')'); return; }
                    set('pause', 'choix à faire : version du Drive ou la vôtre'); firstChoice(rec, mine); return;
                }
                // le Drive a changé depuis notre dernière synchro
                if (!differs(mine, their)) { W(K_BASE(APP), rec); set('ok', 'à jour'); return; } // ex. envoi fait en quittant la page
                if (!differs(b.data, mine)) { // rien de neuf ici : on prend la version du Drive
                    if (initial || idle()) { apply(rec, '☁️ Mis à jour : ' + (r.by || 'un membre') + ' — ' + summary(mine, their)); return; }
                    pend = rec; ban(rec, summary(mine, their)); set('wait', 'mise à jour disponible'); return;
                }
                // modifié des deux côtés : fusion élément par élément
                const G = XDELEG._t.changes(b.data, mine, their), m = XDELEG._t.merged(mine, G);
                [NK(), MK()].forEach(k => { const u = U2(k)(mine[k], their[k]); if (u) m[k] = u; });
                if (!(initial || idle())) { pend = rec; ban(rec, summary(b.data, their)); set('wait', 'modifications à fusionner'); return; }
                if (!differs(their, m)) { apply(rec, '☁️ À jour avec le Drive'); return; }
                const p = await push(m, r.rev);
                if (p.ok) { apply({ rev: p.rev, ts: p.ts, by: me(), data: m }, '☁️ Fusionné avec les modifications de ' + (r.by || 'l\'équipe') + ' (' + G.length + ' élément' + (G.length > 1 ? 's' : '') + ')'); return; }
                if (p.err !== 'conflict') { set('err', ERR[p.err] || p.err); return; }
            }
            set('err', 'trop de modifications simultanées, nouvel essai bientôt');
        } finally { busy = false; }
    }
    function firstChoice(rec, mine) {
        const o = dlg('<h3>☁️ Le Drive contient déjà ' + esc(XDELEG.NAMES[APP] || APP) + '</h3><p>Version enregistrée par <b>' + esc(rec.by || '—') + '</b> le ' + fmt(rec.ts) + '. Ce poste contient une autre version.</p>' +
            '<div class="xdr-b"><button id="xdr-take" class="ok">📥 Prendre la version du Drive</button><button id="xdr-mine">📤 Remplacer le Drive par la mienne</button><button data-x>Plus tard</button></div><p class="xdr-h">Votre version actuelle est gardée en sauvegarde dans les deux cas (⚙️ ou Échanges).</p>');
        W('xiii.drive.bak.' + APP, { ts: Date.now(), data: mine });
        o.querySelector('#xdr-take').onclick = () => { o.remove(); apply(rec, '☁️ Version du Drive chargée'); };
        o.querySelector('#xdr-mine').onclick = async () => { o.remove(); const p = await push(mine, rec.rev); if (p.ok) { set('ok', 'Drive remplacé par votre version'); say('☁️ Votre version est maintenant celle du Drive'); } else set('err', ERR[p.err] || p.err); };
    }
    // ---------- bandeau « mise à jour disponible » ----------
    function ban(rec, sum) {
        let b = document.getElementById('xdr-ban'); if (!b) { b = document.createElement('div'); b.id = 'xdr-ban'; document.body.appendChild(b); }
        b.innerHTML = '<span>☁️ <b>' + esc(rec.by || 'Un membre') + '</b> a modifié le projet : ' + esc(sum).slice(0, 140) + '</span><button class="ok">Mettre à jour</button><button data-l>Plus tard</button>';
        b.querySelector('.ok').onclick = () => { lastInput = 0; tick(true); };
        b.querySelector('[data-l]').onclick = () => { b.remove(); };
    }
    const hideBan = () => { const b = document.getElementById('xdr-ban'); if (b) b.remove(); };
    const dlg = html => { let o = document.getElementById('xdr-ov'); if (o) o.remove(); o = document.createElement('div'); o.id = 'xdr-ov'; o.innerHTML = '<div class="xdr-box">' + html + '</div>'; document.body.appendChild(o); o.querySelectorAll('[data-x]').forEach(b => b.onclick = () => o.remove()); return o; };
    // ---------- fenêtre d'état ----------
    async function panel() {
        const c = cfg();
        if (!c) { location.href = 'drive.html'; return; } W('xiii.drive.news.' + APP, null); presUI();
        const b = J(K_BASE(APP), null);
        const o = dlg('<h3>☁️ Drive du projet<span data-x class="xdr-x">✕</span></h3>' +
            '<p><b>Projet :</b> ' + esc(c.proj || '—') + '<br><b>Vous :</b> ' + esc(me()) + ' (' + (c.role === 'master' ? 'Master' : 'membre de l\'équipe') + ')<br><b>État :</b> <span class="xdr-st" data-s="' + st.s + '">' + esc(st.m) + '</span>' + (b ? '<br><b>Version locale :</b> n° ' + b.rev + ' du ' + fmt(b.ts) : '') + '</p>' +
            '<h4>Dernières modifications</h4><div id="xdr-log" class="xdr-log"><small>Chargement…</small></div>' +
            '<div class="xdr-b"><button id="xdr-ver" title="Versions de cet outil gardées par le Drive : revenir à un état précédent">🕰️ Versions datées</button><button id="xdr-now" class="ok">🔄 Synchroniser maintenant</button><a href="drive.html"><button>⚙️ Gérer le Drive</button></a></div>');
        o.querySelector('#xdr-now').onclick = () => { o.remove(); lastInput = 0; tick(true); };
        const vb = o.querySelector('#xdr-ver'); if (vb) vb.onclick = () => { o.remove(); if (typeof XDVER !== 'undefined') XDVER.open(APP); };
        if (why()) return void (o.querySelector('#xdr-log').innerHTML = '<small>' + esc(why()) + '</small>');
        const r = await api('log', { app: APP }), L = o.querySelector('#xdr-log'); if (!L) return;
        L.innerHTML = r.ok ? (r.log.length ? r.log.slice(0, 15).map(x => '<div><small>' + fmt(x.ts) + ' · n° ' + x.rev + '</small> <b>' + esc(x.by) + '</b> ' + esc(x.sum) + '</div>').join('') : '<small>Aucune modification pour l\'instant.</small>') : '<small class="xdr-e">' + esc(ERR[r.err] || r.err) + '</small>';
    }
    function css() {
        if (document.getElementById('xdr-css')) return; const s = document.createElement('style'); s.id = 'xdr-css';
        s.textContent = '#xdr-btn{position:relative}#xdr-btn::after{content:"";position:absolute;top:3px;right:3px;width:8px;height:8px;border-radius:50%;background:#777;box-shadow:0 0 0 2px var(--bg-menu,#222)}#xdr-btn[data-s=ok]::after{background:#66bb6a}#xdr-btn[data-s=sync]::after{background:#42a5f5}#xdr-btn[data-s=wait]::after,#xdr-btn[data-s=pause]::after{background:#ffb74d}#xdr-btn[data-s=err]::after{background:#ef5350}#xdr-btn[data-s=off]{opacity:.55}#xdr-btn[data-s=off]::after{display:none}' +
            '#xdr-ov{position:fixed;inset:0;z-index:10210;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;font:13.5px/1.5 "Segoe UI",system-ui,sans-serif}.xdr-box{width:min(560px,100%);max-height:90vh;overflow:auto;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid #4fa3e0;border-radius:12px;padding:16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.6)}' +
            '.xdr-box h3{margin:0 0 8px;font-size:16px;display:flex;justify-content:space-between}.xdr-box h4{margin:12px 0 4px;font-size:13px}.xdr-x{cursor:pointer;opacity:.7}.xdr-h{color:var(--text-dim,#999);font-size:12px}.xdr-b{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:12px}.xdr-box button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:6px 12px;cursor:pointer}.xdr-box button.ok,#xdr-ban button.ok{background:rgba(79,163,224,.3);border-color:#4fa3e0;font-weight:700}' +
            '.xdr-log{max-height:40vh;overflow:auto;font-size:12.5px;border:1px solid var(--border-color,#444);border-radius:8px;padding:6px 10px}.xdr-log div{padding:3px 0;border-bottom:1px solid var(--border-soft,#333)}.xdr-log small{color:var(--text-dim,#999)}.xdr-e,.xdr-st[data-s=err]{color:#ef9a9a}.xdr-st[data-s=ok]{color:#81c784}' +
            '.xlock{outline:2px solid var(--xlc,#ff9800)!important;outline-offset:1px;position:relative;cursor:not-allowed!important}.xlock::after{content:attr(data-xlock);position:absolute;right:0;top:-16px;font:600 10px/14px "Segoe UI",sans-serif;padding:0 5px;border-radius:6px;background:var(--xlc,#ff9800);color:#fff;white-space:nowrap;z-index:50;pointer-events:none}@media print{.xlock{outline:0!important}.xlock::after{display:none!important}}' + '#xpres{display:inline-flex;align-self:center;margin-left:4px;cursor:pointer}#xpres i{font:700 10px/22px "Segoe UI",sans-serif;font-style:normal;width:22px;height:22px;border-radius:50%;color:#fff;text-align:center;margin-left:-5px;border:2px solid var(--bg-panel,#252321)}#xpres i:first-child{margin-left:0}@media print{#xpres{display:none!important}}' + '#xdr-chip{display:none;align-self:center;margin-left:4px;font:600 11.5px/1 "Segoe UI",sans-serif;padding:5px 9px;border-radius:12px;cursor:pointer;white-space:nowrap}#xdr-chip.busy{display:inline-block;background:rgba(255,152,0,.2);border:1px solid #ff9800;color:#ffcc80;animation:xdrp 1.6s infinite}#xdr-chip.ro{display:inline-block;background:rgba(158,158,158,.15);border:1px solid #888;color:#ccc}#xdr-chip.news{display:inline-block;background:rgba(66,165,245,.18);border:1px solid #42a5f5;color:#90caf9}@keyframes xdrp{50%{opacity:.6}}' +
            '#xdr-ban{position:fixed;right:14px;top:62px;z-index:10140;display:flex;gap:8px;align-items:center;background:#16212b;color:#fff;border:1px solid #4fa3e0;border-radius:12px;padding:8px 12px;box-shadow:0 8px 30px rgba(0,0,0,.6);font:13px "Segoe UI",sans-serif;max-width:min(520px,calc(100vw - 28px));flex-wrap:wrap}#xdr-ban button{font:inherit;color:#fff;background:#333;border:1px solid #555;border-radius:8px;padding:5px 10px;cursor:pointer}';
        document.head.appendChild(s);
    }
    function addBtn() {
        if (document.getElementById('xdr-btn')) return;
        const ref = document.getElementById('xnt-btn') || document.getElementById('xdl-btn'); if (!ref) return;
        ref.insertAdjacentHTML('afterend', '<button id="xdr-btn" data-s="off" title="☁️ Drive du projet"><span class="btn-icon">☁️</span><span class="btn-label">Drive</span></button>');
        document.getElementById('xdr-btn').onclick = panel;
    }
    function init(app) {
        APP = app; if (app === 'index') return home(); if (!XDELEG.KEYS[app]) return; css();
        addEventListener('pointerdown', guard, true);
        let roT = 0; const roBlock = e => { const c = cfg(); if (!c || perm() === 'edit' || why()) return; if (e.target.closest && e.target.closest('#xdr-ov,#xdl-ov,#xdr-ban,#xft-ov,#xf-ov,.xnt-a,#xmm-ov,#xmm-ban,#xhs-ov')) return; if (e.type === 'keydown' && !(e.key.length === 1 || /Backspace|Delete|Enter/.test(e.key)) && !(e.ctrlKey || e.metaKey)) return; if (e.type === 'keydown' && (e.ctrlKey || e.metaKey) && !/^[zyvxd]$/i.test(e.key)) return; e.preventDefault(); e.stopPropagation(); if (Date.now() - roT > 4000) { roT = Date.now(); say(perm() === 'read' ? '👁️ Lecture seule : le Master ne vous a pas donné le droit de modifier' : '💬 Vous pouvez seulement commenter (bouton 💬 Avis)'); } };
        ['keydown', 'beforeinput', 'drop', 'paste'].forEach(t => addEventListener(t, roBlock, true));
        const OUT = e => e.target && e.target.closest && e.target.closest('#xmm-ov,#xdl-ov,#xhs-ov,#xdr-ov,#xft-ov,#xf-ov');
        addEventListener('input', e => { if (!OUT(e)) beat(); }, true); addEventListener('keydown', e => { if (!OUT(e) && (e.key.length === 1 || /Backspace|Delete|Enter/.test(e.key))) beat(); }, true);
        ['keydown', 'pointerdown', 'input', 'wheel'].forEach(e => addEventListener(e, () => { lastInput = Date.now(); }, { capture: true, passive: true }));
        // enregistrement de l'outil → synchro quelques secondes plus tard
        const prev = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) { const r = prev.apply(this, arguments); if (this === localStorage && cfg() && (keys().indexOf(k) > -1 || k === NK() || k === MK())) { clearTimeout(deb); deb = setTimeout(() => tick(false), 3500); } return r; };
        const go = () => {
            addBtn(); presUI(); tick(true);
            (async () => { const c = cfg(); if (!c || !c.tok || c.code) return; const r = await api('ping'); if (!r || !r.ok || !r.me) return; const d = J('xiii.drive', null); if (!d || d.tok !== c.tok) return; let ch = false; // 👥 le Master a pu changer le nom, les droits, les outils ou les secteurs : appliqués sans nouveau lien
                const nm = String(r.me.nom || '').replace(/ \(app\)$/, ''); if (nm && (!d.me || d.me.name !== nm)) { d.me = Object.assign({}, d.me, { name: nm }); ch = true; }
                if (r.me.droit && r.me.droit !== d.perm) { d.perm = r.me.droit; ch = true; } const ap = r.me.outils || null; if (JSON.stringify(ap) !== JSON.stringify(d.apps || null)) { d.apps = ap; ch = true; } if ((r.me.secteur || '') !== (d.secteur || '')) { d.secteur = r.me.secteur || ''; ch = true; } if (JSON.stringify(r.me.scope || null) !== JSON.stringify(d.scope || null)) { d.scope = r.me.scope || null; ch = true; if (window.XSCOPE && d.scope && d.scope[APP]) XSCOPE.lock(d.scope[APP]); }
                if (ch) { W('xiii.drive', d); try { presUI(); } catch (e) { } } })();
            ['focusin', 'pointerdown'].forEach(t => addEventListener(t, e => { const k = keyOf(e.target); if (k !== lockKey) { lockKey = k; if (!k && lockSent) lockSend(true); } }, true));
            ['input', 'change'].forEach(t => addEventListener(t, e => { const k = keyOf(e.target); if (!k) return; lockKey = k; const fresh = lockSent !== k; lockEdit = Date.now(); if (fresh) lockSend(true); }, true));
            ['pointerdown', 'keydown', 'beforeinput', 'focusin'].forEach(t => addEventListener(t, lockGuard, true));
            setInterval(() => { if (lockKey && Date.now() - lockEdit < 15000) lockSend(true); else if (lockSent) lockSend(true); locks(); }, 5000);
            let nT = 0; timer = setInterval(() => { look(); if (document.visibilityState !== 'visible') return; nT++; if (around().length || nT % 3 === 0) tick(false); }, 4000); look(); // synchro toutes les 4 s quand d'autres sont là, 12 s sinon
            document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(false); });
            try { XLIVE.on(p => { if (!p.app || p.app === APP) setTimeout(() => tick(false), 150 + Math.random() * 400); }); } catch (e) { } // ⚡ un équipier vient d'enregistrer : relecture immédiate
            // en quittant la page : dernier envoi (sans attendre de réponse)
            addEventListener('pagehide', () => { try { if (lastBeat) beat(true); } catch (e) { } try { const c = cfg(), b = J(K_BASE(APP), null); if (!c || why() || !b || pend || !navigator.sendBeacon) return; const mine = local(); if (!differs(b.data, mine)) return; navigator.sendBeacon(c.url, new Blob([JSON.stringify({ a: 'put', code: c.code, app: APP, base: b.rev, data: mine, by: me(), sum: summary(b.data, mine) })], { type: 'text/plain' })); } catch (e) { } });
        };
        XBOOT.ready(go, 1500);
    }
    const LOCKED = () => !document.getElementById('xdr-btn'); // pas de signe de présence pendant le chargement de l'outil
    // ---------- accueil : pastilles sur les cartes des outils ----------
    function home() {
        const c = cfg(); if (!c) return;
        const s = document.createElement('style'); s.textContent = '.xdr-pin{position:absolute;top:8px;right:8px;z-index:5;font:700 10.5px/1 "Segoe UI",sans-serif;padding:4px 8px;border-radius:10px;pointer-events:none;white-space:nowrap}.xdr-pin.busy{background:#ff9800;color:#1b1b1b;animation:xdrp 1.6s infinite}.xdr-pin.news{background:#42a5f5;color:#0d1b2a}@keyframes xdrp{50%{opacity:.65}}'; document.head.appendChild(s);
        const run = async () => {
            if (document.visibilityState !== 'visible') return;
            const r = await api('revs', {}); if (!r || !r.ok) return; if (r.pres) { PRES = r.pres; try { dispatchEvent(new Event('xiii-pres')); } catch (e) { } }
            document.querySelectorAll('.xdr-pin').forEach(x => x.remove());
            Object.keys(XDELEG.KEYS).forEach(a => {
                const card = [...document.querySelectorAll('a.card[href]')].find(x => new RegExp('(^|/)' + a + '(\\.html)?([?#]|$)').test(x.getAttribute('href'))); if (!card) return;
                const O = others(r.pres || {}, a), v = (r.apps || {})[a], b = J(K_BASE(a), null);
                let cls = '', t = '';
                if (O.length) { cls = 'busy'; t = '✏️ ' + [...new Set(O.map(o => o.by))].join(', '); }
                else if (v && v.rev > (b ? b.rev : 0) && v.by !== me()) { cls = 'news'; t = '✨ Nouveautés'; }
                if (!cls) return; if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
                card.insertAdjacentHTML('beforeend', '<span class="xdr-pin ' + cls + '" title="' + esc(cls === 'busy' ? t.slice(3) + ' modifie cet outil en ce moment' : 'Modifié par ' + v.by + ' ' + fmt(v.ts)) + '">' + esc(cls === 'busy' ? t + ' modifie' : t) + '</span>');
            });
        };
        const go = () => { run(); setInterval(run, 12000); document.addEventListener('visibilitychange', run); try { XLIVE.on(() => setTimeout(run, 300)); } catch (e) { } };
        XBOOT.ready(go, 600);
    }
    return { init, tick, panel, status: () => st, _pres: () => PRES, unionMemo, perm: () => perm(), me: () => me(), cfg: () => cfg() };
})();

XDRIVE.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XHIST : 🗂️ versions datées et nommées de chaque outil
//  Version créée automatiquement : avant chaque import (délégation, Drive, fusion, restauration) et
//  toutes les 30 min de travail ; ou à la main (« 📌 Créer une version »).
//  Pour chaque version : comparer avec l'état actuel (ajouts, modifications, suppressions), restaurer
//  (l'état actuel est gardé avant), renommer, exporter, supprimer. Rangées dans ce navigateur (IndexedDB).
// =====================================================================
const XHIST = (() => {
    let APP = '', lastAuto = 0;
    const MAXAUTO = 30, MAXALL = 60, EVERY = 30 * 60000;
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const say = m => { try { if (typeof toast === 'function') toast(m); } catch (e) { } };
    const fmt = ts => { const d = new Date(ts); return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
    const me = () => { const c = J('xiii.drive', null); return (c && c.me && c.me.name) || (J('xiii.deleg.me', {}) || {}).name || 'moi'; };
    const keys = () => XDELEG.KEYS[APP] || [];
    const cur = () => { const o = {}; keys().forEach(k => { const v = localStorage.getItem(k); if (v != null) o[k] = v; }); return o; };
    const size = d => Object.values(d || {}).reduce((a, v) => a + String(v).length, 0);
    const same = (a, b) => keys().every(k => (a[k] || null) === (b[k] || null));
    // ---------- IndexedDB ----------
    let dbp = null;
    const db = () => dbp || (dbp = new Promise((ok, ko) => { const r = indexedDB.open('xiii-hist', 1); r.onupgradeneeded = () => { const s = r.result.createObjectStore('v', { keyPath: 'id' }); s.createIndex('app', 'app'); }; r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); }));
    const tx = async (mode, fn) => { const d = await db(); return new Promise((ok, ko) => { const t = d.transaction('v', mode), s = t.objectStore('v'); let out; Promise.resolve(fn(s)).then(v => out = v); t.oncomplete = () => ok(out); t.onerror = () => ko(t.error); }); };
    const req = r => new Promise((ok, ko) => { r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
    const list = async () => { try { const L = await tx('readonly', s => req(s.index('app').getAll(APP))); return (L || []).sort((a, b) => b.ts - a.ts); } catch (e) { return []; } };
    async function add(name, src, auto, data) {
        data = data || cur(); if (!Object.keys(data).length) return null;
        const L = await list(); if (L[0] && same(L[0].data, data) && auto) return null; // rien de neuf depuis la dernière version
        const v = { id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), app: APP, ts: Date.now(), name: name || 'Version', src: src || '', by: me(), auto: !!auto, data };
        try {
            await tx('readwrite', s => { s.put(v); const A = L.filter(x => x.auto && !x.pin), drop = A.slice(auto ? MAXAUTO - 1 : MAXAUTO).concat(L.slice(MAXALL - 1).filter(x => !x.pin)); new Set(drop).forEach(x => s.delete(x.id)); });
        } catch (e) { say('⚠️ Versions : stockage du navigateur plein'); return null; }
        return v;
    }
    const put = v => tx('readwrite', s => s.put(v)), del = id => tx('readwrite', s => s.delete(id));
    // appelé par XDELEG.put juste avant de remplacer les données de l'outil (import, Drive, fusion, restauration)
    async function before(after) {
        if (!APP) return;
        if (window.__xhsSkip) { window.__xhsSkip = 0; return; }
        const m = (after && after.m) || 'Import', drive = /☁️/.test(m);
        if (drive && Date.now() - lastAuto < 15 * 60000) return; // les mises à jour du Drive arrivent souvent : une version par quart d'heure suffit
        const data = cur(); lastAuto = Date.now(); try { sessionStorage.setItem('xiii.hist.last.' + APP, String(lastAuto)); } catch (e) { }
        try { await add('Avant : ' + m.replace(/^\S+\s/, '').slice(0, 80), drive ? 'Drive' : 'Import', true, data); } catch (e) { }
    }
    // ---------- comparaison ----------
    function diffHtml(v) {
        const now = cur(), G = XDELEG._t.changes(v.data, v.data, now);
        if (!G.length) return '<p class="xhs-d">Aucune différence : l\'outil est identique à cette version.</p>';
        const lab = { add: ['＋', 'ajouté depuis', '#81c784'], del: ['－', 'supprimé depuis', '#ef9a9a'], mod: ['✎', 'modifié depuis', '#90caf9'] };
        return '<p class="xhs-d">Depuis cette version, ' + G.length + ' élément' + (G.length > 1 ? 's ont' : ' a') + ' changé :</p><div class="xhs-ch">' + G.map(g => '<div style="color:' + lab[g.op][2] + '">' + lab[g.op][0] + ' ' + esc(g.lab) + (g.fields && g.fields.length ? ' <small>(' + esc(g.fields.slice(0, 5).join(', ')) + ')</small>' : '') + '</div>').join('') + '</div>';
    }
    // ---------- fenêtre ----------
    async function open(sel) {
        let o = document.getElementById('xhs-ov'); if (o) o.remove();
        o = document.createElement('div'); o.id = 'xhs-ov'; document.body.appendChild(o);
        const L = await list(), V = L.find(x => x.id === sel) || null;
        o.innerHTML = '<div class="xhs-box"><h3>🗂️ Versions de ' + esc(XDELEG.NAMES[APP] || APP) + '<span class="xhs-x" data-x>✕</span></h3>' +
            '<div class="xhs-new"><input id="xhs-nm" placeholder="Nom de la version (ex. « Validé par le client »)"><button id="xhs-add" class="ok">📌 Créer une version</button></div>' +
            '<p class="xhs-d">Versions automatiques avant chaque import (délégation, Drive, fusion, restauration) et toutes les 30 min de travail. Les versions 📌 ne sont jamais effacées automatiquement. Rangées dans ce navigateur.</p>' +
            '<div class="xhs-cols"><div class="xhs-l">' + (L.length ? L.map(v => '<div class="xhs-v' + (V && V.id === v.id ? ' on' : '') + '" data-id="' + v.id + '"><b>' + (v.pin ? '📌 ' : v.auto ? '' : '📌 ') + esc(v.name) + '</b><small>' + fmt(v.ts) + ' · ' + esc(v.by) + (v.src ? ' · ' + esc(v.src) : '') + '</small></div>').join('') : '<p class="xhs-d">Aucune version pour l\'instant.</p>') + '</div>' +
            '<div class="xhs-r">' + (V ? '<h4>' + esc(V.name) + '</h4><small class="xhs-d">' + fmt(V.ts) + ' · par ' + esc(V.by) + ' · ' + Math.round(size(V.data) / 1024) + ' Ko</small>' + diffHtml(V) +
                '<div class="xhs-b"><button id="xhs-rs" class="ok">↩️ Restaurer cette version</button><button id="xhs-rn">✏️ Renommer</button><button id="xhs-pin">' + (V.pin || !V.auto ? '📌 Épinglée' : '📌 Garder') + '</button><button id="xhs-ex">⬇️ Exporter</button><button id="xhs-dl">🗑️</button></div>' : '<p class="xhs-d">← Choisissez une version pour voir ce qui a changé depuis, et la restaurer si besoin.</p>') + '</div></div></div>';
        o.querySelectorAll('[data-x]').forEach(b => b.onclick = () => o.remove());
        o.onclick = e => { if (e.target === o) o.remove(); };
        o.querySelectorAll('.xhs-v').forEach(d => d.onclick = () => open(d.dataset.id));
        o.querySelector('#xhs-add').onclick = async () => { const n = o.querySelector('#xhs-nm').value.trim() || 'Version du ' + fmt(Date.now()); try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { } const v = await add(n, 'Manuelle', false); say(v ? '📌 Version « ' + n + ' » créée' : 'Outil vide : rien à enregistrer'); if (v) open(v.id); };
        if (!V) return;
        o.querySelector('#xhs-rs').onclick = async () => {
            if (!confirm('Restaurer « ' + V.name + ' » ? L\'état actuel est gardé dans une version « Avant restauration ».')) return;
            await add('Avant restauration de « ' + V.name + ' »', 'Restauration', false);
            lastAuto = Date.now(); window.__xhsSkip = 1; XDELEG.put(V.data, { m: '↩️ Version « ' + V.name + ' » restaurée' });
        };
        o.querySelector('#xhs-rn').onclick = async () => { const n = prompt('Nom de la version', V.name); if (!n) return; V.name = n.trim(); await put(V); open(V.id); };
        o.querySelector('#xhs-pin').onclick = async () => { V.pin = !(V.pin || !V.auto); if (!V.pin) V.auto = true; await put(V); open(V.id); };
        o.querySelector('#xhs-ex').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ suite: 'XIII', app: APP, version: V.name, ts: V.ts, by: V.by, data: V.data }, null, 1)], { type: 'application/json' })); a.download = APP + ' - ' + V.name.replace(/[\\/:*?"<>|]/g, '_') + '.xiii-version.json'; a.click(); };
        o.querySelector('#xhs-dl').onclick = async () => { if (!confirm('Supprimer la version « ' + V.name + ' » ?')) return; await del(V.id); open(); };
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xhs-css';
        s.textContent = '#xhs-ov{position:fixed;inset:0;z-index:10220;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;font:13.5px/1.5 "Segoe UI",system-ui,sans-serif}.xhs-box{width:min(900px,100%);max-height:90vh;display:flex;flex-direction:column;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);border-radius:12px;padding:16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.6)}' +
            '.xhs-box h3{margin:0 0 8px;font-size:16px;display:flex;justify-content:space-between}.xhs-box h4{margin:0;font-size:15px}.xhs-x{cursor:pointer;opacity:.7}.xhs-d{color:var(--text-dim,#999);font-size:12.5px}.xhs-new{display:flex;gap:8px}.xhs-new input{flex:1}' +
            '.xhs-box input{font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:6px;padding:6px 8px}.xhs-box button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:6px 12px;cursor:pointer}.xhs-box button.ok{background:rgba(240,179,120,.3);border-color:rgb(240,179,120);font-weight:700}' +
            '.xhs-cols{display:grid;grid-template-columns:minmax(220px,1fr) 1.6fr;gap:14px;min-height:0;flex:1;overflow:hidden}.xhs-l{overflow:auto;border:1px solid var(--border-color,#444);border-radius:8px}.xhs-v{padding:7px 10px;border-bottom:1px solid var(--border-soft,#333);cursor:pointer}.xhs-v:hover{background:rgba(255,255,255,.05)}.xhs-v.on{background:rgba(240,179,120,.15);box-shadow:inset 3px 0 rgb(240,179,120)}.xhs-v b{display:block;font-size:13px}.xhs-v small{color:var(--text-dim,#999)}' +
            '.xhs-r{overflow:auto}.xhs-ch{max-height:38vh;overflow:auto;border:1px solid var(--border-color,#444);border-radius:8px;padding:6px 10px;font-size:12.5px}.xhs-ch small{color:var(--text-dim,#999)}.xhs-b{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}@media(max-width:700px){.xhs-cols{grid-template-columns:1fr}}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; if (!XDELEG.KEYS[app] || !window.indexedDB) return; css();
        try { lastAuto = Number(sessionStorage.getItem('xiii.hist.last.' + APP)) || 0; } catch (e) { }
        // sauvegarde importante : une version automatique toutes les 30 min de travail
        let t = null; const prev = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) { const r = prev.apply(this, arguments); if (this === localStorage && keys().indexOf(k) > -1) { clearTimeout(t); t = setTimeout(async () => { const L = await list(), last = L[0] ? L[0].ts : 0; if (Date.now() - last > EVERY) add('Sauvegarde automatique', 'Travail', true); }, 5000); } return r; };
        const go = () => {
            window.XSET_HELP = window.XSET_HELP || []; if (!window.XSET_HELP.some(x => x.k === 'xhs')) window.XSET_HELP.unshift({ k: 'xhs', icon: '🗂️', label: 'Versions', sub: 'Comparer avec une version précédente, la restaurer, en créer une', run: () => setTimeout(() => open(), 150) });
            if (document.getElementById('xhs-btn')) return; const ref = document.getElementById('xnt-btn') || document.getElementById('xdl-btn'); if (!ref) return;
            ref.insertAdjacentHTML('afterend', '<button id="xhs-btn" title="🗂️ Versions : comparer avec une version précédente, la restaurer, en créer une"><span class="btn-icon">🗂️</span><span class="btn-label">Versions</span></button>');
            document.getElementById('xhs-btn').onclick = () => open(); document.getElementById('xhs-btn').style.display = 'none'; // 🗂️ rangé dans ⚙️ Paramètres
            list().then(L => { if (!L.length) add('Ouverture de l\'outil', 'Départ', true); }); // point de départ
        };
        XBOOT.ready(go, 1300);
    }
    return { init, open, add, before, list };
})();

XHIST.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XMEMO : 📌 mots pour l'équipe sur un outil
//  Un message épinglé sur l'outil, pour tout le monde, une équipe, une personne ou le Master.
//  Affiché en bandeau à l'ouverture de l'outil tant qu'il n'est pas lu ; « lu par », réponses, archivage.
//  Partagé avec l'équipe par le ☁️ Drive du projet (même les membres en lecture seule peuvent répondre et marquer « lu »).
// =====================================================================
const XMEMO = (() => {
    let APP = '', SHOWARCH = false;
    const TEAMS = [['production', 'Production'], ['realisation', 'Réalisation'], ['image', 'Image / caméras'], ['son', 'Son'], ['lumiere', 'Lumière'], ['regie', 'Régie'], ['technique', 'Technique / vidéo'], ['deco', 'Décor / accessoires'], ['hmc', 'Costumes / maquillage'], ['post', 'Post-production'], ['artistes', 'Artistes / talents'], ['client', 'Client / diffuseur']];
    const TN = Object.fromEntries(TEAMS);
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const fmt = ts => { const d = new Date(ts); return (new Date().toDateString() === d.toDateString() ? 'aujourd\'hui' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
    const K = () => 'xiii.memo.' + APP;
    const all = () => J(K(), {});
    const save = M => { try { localStorage.setItem(K(), JSON.stringify(M)); } catch (e) { } refresh(); };
    const cfg = () => J('xiii.drive', null);
    const me = () => { const c = cfg(); return (c && c.me && c.me.name) || (J('xiii.deleg.me', {}) || {}).name || 'Master'; };
    const master = () => { const c = cfg(); return !c || !c.tok; };
    const team = () => (cfg() || {}).secteur || '';
    const toLab = t => !t || t.k === 'all' ? 'tout le monde' : t.k === 'team' ? 'équipe ' + (TN[t.v] || t.v) : t.k === 'master' ? 'le Master' : t.v;
    const forMe = m => master() || m.by === me() || !m.to || m.to.k === 'all' || (m.to.k === 'team' && m.to.v === team()) || (m.to.k === 'person' && fold(m.to.v) === fold(me()));
    const unread = () => Object.values(all()).filter(m => !m.arch && forMe(m) && m.by !== me() && !(m.read || {})[me()] && (master() ? (m.to && (m.to.k === 'master' || m.to.k === 'all')) || !m.to : true)).sort((a, b) => b.ts - a.ts);
    function mark(id) { const M = all(); if (!M[id]) return; M[id].read = M[id].read || {}; M[id].read[me()] = Date.now(); save(M); }
    function reply(id, txt) { txt = String(txt || '').trim(); if (!txt) return; const M = all(); if (!M[id]) return; (M[id].rep = M[id].rep || []).push({ ts: Date.now(), by: me(), txt: txt.slice(0, 1500) }); M[id].read = M[id].read || {}; M[id].read[me()] = Date.now(); save(M); }
    function refresh() {
        const b = document.getElementById('xmm-btn'); if (b) { const n = unread().length; b.dataset.n = n || ''; b.title = '📌 Mots pour l\'équipe' + (n ? ' — ' + n + ' non lu(s)' : ''); }
        banner(); if (document.getElementById('xmm-ov')) open(true);
    }
    // ---------- bandeau à l'ouverture ----------
    function banner() {
        let el = document.getElementById('xmm-ban'); const U = unread();
        if (!U.length) { if (el) el.remove(); return; }
        if (!el) { el = document.createElement('div'); el.id = 'xmm-ban'; document.body.appendChild(el); }
        el.innerHTML = U.slice(0, 3).map(m => '<div class="xmm-n"><div><b>📌 ' + esc(m.by) + '</b> <small>→ ' + esc(toLab(m.to)) + ' · ' + fmt(m.ts) + '</small><div class="xmm-t">' + esc(m.txt) + '</div></div><div class="xmm-a"><button data-ok="' + m.id + '">✓ Lu</button><button data-op="' + m.id + '">Répondre</button></div></div>').join('') + (U.length > 3 ? '<div class="xmm-more" data-op="">+ ' + (U.length - 3) + ' autre(s) mot(s)…</div>' : '');
        el.querySelectorAll('[data-ok]').forEach(x => x.onclick = () => mark(x.dataset.ok));
        el.querySelectorAll('[data-op]').forEach(x => x.onclick = () => open(false, x.dataset.op));
    }
    // ---------- fenêtre ----------
    function open(keep, focus) {
        let o = document.getElementById('xmm-ov'); const vals = {}; if (o && keep) o.querySelectorAll('textarea,input,select').forEach(e => { if (e.id || e.dataset.r) vals[e.id || 'r' + e.dataset.r] = e.value; });
        const act = document.activeElement, actKey = act && o && o.contains(act) ? (act.id || 'r' + act.dataset.r) : null;
        if (!o) { o = document.createElement('div'); o.id = 'xmm-ov'; document.body.appendChild(o); o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); }); }
        const M = Object.values(all()).filter(forMe).filter(m => SHOWARCH ? m.arch : !m.arch).sort((a, b) => b.ts - a.ts), names = [...new Set((J('xiii.annuaire', []) || []).map(p => p && (p.name || p.n)).concat(Object.values(all()).map(m => m.by)).filter(Boolean))];
        const ro = typeof XDRIVE !== 'undefined' && XDRIVE.perm && XDRIVE.perm() === 'read';
        o.innerHTML = '<div class="xmm-box"><h3>📌 Mots pour l\'équipe — ' + esc((XDELEG.NAMES || {})[APP] || APP) + '<span class="xmm-x">✕</span></h3>' +
            '<p class="xmm-d">Un message épinglé sur cet outil, affiché en bandeau à l\'ouverture pour les personnes visées.' + (cfg() ? ' Partagé par le ☁️ Drive du projet.' : ' ⚠️ Drive du projet non relié : les mots restent sur ce poste.') + '</p>' +
            (ro ? '<p class="xmm-d">👁️ Lecture seule : vous pouvez lire, répondre et marquer « lu ».</p>' : '<div class="xmm-new"><textarea id="xmm-txt" rows="2" placeholder="Votre mot (ex. « Ne touchez pas aux horaires du J2, en attente du client »)"></textarea><div class="xmm-to"><select id="xmm-to"><option value="all">👥 Tout le monde</option>' + (master() ? '' : '<option value="master">🎬 Le Master</option>') + TEAMS.map(([k, l]) => '<option value="team:' + k + '">Équipe ' + l + '</option>').join('') + '<option value="person">👤 Une personne…</option></select><input id="xmm-who" list="xmm-dl" placeholder="Prénom Nom" style="display:none"><datalist id="xmm-dl">' + names.map(n => '<option value="' + esc(n) + '">').join('') + '</datalist><button id="xmm-add" class="ok">📌 Épingler</button></div></div>') +
            '<div class="xmm-tabs"><button data-ar="0" class="' + (SHOWARCH ? '' : 'on') + '">En cours</button><button data-ar="1" class="' + (SHOWARCH ? 'on' : '') + '">🗄️ Archivés</button></div>' +
            '<div class="xmm-list">' + (M.length ? M.map(m => { const rd = Object.keys(m.read || {}).filter(n => n !== m.by), mineNotRead = m.by !== me() && !(m.read || {})[me()];
                return '<div class="xmm-m' + (mineNotRead ? ' new' : '') + (focus === m.id ? ' foc' : '') + '"><div class="xmm-h"><b>' + esc(m.by) + '</b> → ' + esc(toLab(m.to)) + ' <small>' + fmt(m.ts) + '</small></div><div class="xmm-t">' + esc(m.txt) + '</div>' +
                    (m.rep || []).map(r => '<div class="xmm-r"><b>' + esc(r.by) + '</b> <small>' + fmt(r.ts) + '</small><br>' + esc(r.txt) + '</div>').join('') +
                    '<div class="xmm-f"><small>' + (rd.length ? '👁 Lu par ' + esc(rd.join(', ')) : 'Pas encore lu') + '</small><span>' + (mineNotRead ? '<button data-ok="' + m.id + '">✓ Lu</button>' : '') + ((m.by === me() || master()) && !ro ? '<button data-ar-m="' + m.id + '">' + (m.arch ? '↩️ Désarchiver' : '🗄️ Archiver') + '</button>' : '') + '</span></div>' +
                    (m.arch ? '' : '<div class="xmm-rp"><input data-r="' + m.id + '" placeholder="Répondre…"><button data-rs="' + m.id + '">↩️</button></div>') + '</div>'; }).join('') : '<p class="xmm-d" style="text-align:center;padding:16px">' + (SHOWARCH ? 'Aucun mot archivé.' : 'Aucun mot en cours sur cet outil.') + '</p>') + '</div></div>';
        o.querySelector('.xmm-x').onclick = () => o.remove();
        Object.keys(vals).forEach(k => { const e = k[0] === 'r' && !document.getElementById(k) ? o.querySelector('[data-r="' + k.slice(1) + '"]') : o.querySelector('#' + k); if (e) e.value = vals[k]; });
        if (actKey) { const e = actKey[0] === 'r' && !o.querySelector('#' + actKey) ? o.querySelector('[data-r="' + actKey.slice(1) + '"]') : o.querySelector('#' + actKey); if (e) e.focus(); }
        const sel = o.querySelector('#xmm-to'); if (sel) { const w = o.querySelector('#xmm-who'); const sync = () => w.style.display = sel.value === 'person' ? '' : 'none'; sel.onchange = sync; sync();
            o.querySelector('#xmm-add').onclick = () => { const txt = o.querySelector('#xmm-txt').value.trim(); if (!txt) return o.querySelector('#xmm-txt').focus(); const v = sel.value; let to = { k: 'all' };
                if (v === 'master') to = { k: 'master' }; else if (v.indexOf('team:') === 0) to = { k: 'team', v: v.slice(5) }; else if (v === 'person') { if (!w.value.trim()) return w.focus(); to = { k: 'person', v: w.value.trim() }; }
                const Mm = all(), id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); Mm[id] = { id, ts: Date.now(), by: me(), to, txt: txt.slice(0, 2000), read: {}, rep: [], arch: 0 }; o.querySelector('#xmm-txt').value = ''; save(Mm); try { toast('📌 Mot épinglé pour ' + toLab(to)); } catch (e) { } }; }
        o.querySelectorAll('[data-ar]').forEach(b => b.onclick = () => { SHOWARCH = b.dataset.ar === '1'; open(); });
        o.querySelectorAll('[data-ok]').forEach(b => b.onclick = () => mark(b.dataset.ok));
        o.querySelectorAll('[data-ar-m]').forEach(b => b.onclick = () => { const Mm = all(), m = Mm[b.dataset.arM]; m.arch = m.arch ? 0 : Date.now(); if (!m.arch) m.unarch = Date.now(); save(Mm); });
        o.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { const i = o.querySelector('[data-r="' + b.dataset.rs + '"]'); reply(b.dataset.rs, i.value); });
        o.querySelectorAll('[data-r]').forEach(i => i.onkeydown = e => { if (e.key === 'Enter') reply(i.dataset.r, i.value); });
        const f = o.querySelector('.xmm-m.foc'); if (f && !keep) { f.scrollIntoView({ block: 'center' }); const i = f.querySelector('[data-r]'); if (i) i.focus(); }
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xmm-css';
        s.textContent = '#xmm-btn{position:relative}#xmm-btn[data-n]:not([data-n=""])::after{content:attr(data-n);position:absolute;top:-5px;right:-5px;background:#fbc02d;color:#222;border-radius:9px;font:700 10px/15px sans-serif;min-width:15px;padding:0 3px}' +
            '#xmm-ban{position:fixed;left:50%;top:58px;transform:translateX(-50%);z-index:10130;width:min(620px,calc(100vw - 24px));display:flex;flex-direction:column;gap:6px;font:13.5px/1.45 "Segoe UI",system-ui,sans-serif}.xmm-n{display:flex;gap:10px;align-items:flex-start;background:#fff59d;color:#3e2f00;border-radius:4px 4px 12px 4px;padding:9px 12px;box-shadow:0 8px 24px rgba(0,0,0,.45);transform:rotate(-.4deg)}.xmm-n>div:first-child{flex:1;min-width:0}.xmm-n small{opacity:.7}.xmm-t{white-space:pre-wrap;word-wrap:break-word;margin-top:2px}.xmm-a{display:flex;flex-direction:column;gap:4px}.xmm-a button{font:inherit;font-size:12px;color:#3e2f00!important;border:1px solid rgba(0,0,0,.25)!important;background:rgba(255,255,255,.7)!important;min-width:0!important;height:auto!important;border-radius:6px;padding:3px 8px;cursor:pointer;white-space:nowrap}.xmm-more{background:#fff59d;color:#3e2f00;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:12.5px;align-self:flex-start}' +
            '#xmm-ov{position:fixed;inset:0;z-index:10230;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;font:13.5px/1.5 "Segoe UI",system-ui,sans-serif}.xmm-box{width:min(640px,100%);max-height:90vh;overflow:auto;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid #fbc02d;border-radius:12px;padding:16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.6)}.xmm-box h3{margin:0 0 6px;font-size:16px;display:flex;justify-content:space-between;gap:8px}.xmm-x{cursor:pointer;opacity:.7}.xmm-d{color:var(--text-dim,#999);font-size:12.5px;margin:0 0 8px}' +
            '.xmm-box textarea,.xmm-box input,.xmm-box select{font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:6px;padding:6px 8px}.xmm-box textarea{width:100%;box-sizing:border-box;resize:vertical}.xmm-to{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}.xmm-to select{flex:1}.xmm-to input{flex:1}.xmm-box button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:5px 10px;cursor:pointer}.xmm-box button.ok{background:rgba(251,192,45,.3);border-color:#fbc02d;font-weight:700}' +
            '.xmm-tabs{display:flex;gap:6px;margin:12px 0 6px}.xmm-tabs button.on{background:rgba(251,192,45,.25);border-color:#fbc02d}.xmm-m{border:1px solid var(--border-color,#444);border-left:4px solid #fbc02d;border-radius:8px;padding:8px 10px;margin-bottom:8px}.xmm-m.new{background:rgba(251,192,45,.08)}.xmm-m.foc{box-shadow:0 0 0 2px #fbc02d}.xmm-h small,.xmm-r small,.xmm-f small{color:var(--text-dim,#999)}.xmm-r{margin:6px 0 0 14px;padding:4px 8px;border-left:2px solid var(--border-color,#555);font-size:13px;white-space:pre-wrap}.xmm-f{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:6px}.xmm-f span{display:flex;gap:4px}.xmm-rp{display:flex;gap:4px;margin-top:6px}.xmm-rp input{flex:1;min-width:0}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; if (!XDELEG.KEYS[app]) return; css();
        addEventListener('storage', e => { if (e.key === K()) refresh(); });
        const prev = Storage.prototype.setItem; let t = null;
        Storage.prototype.setItem = function (k, v) { const r = prev.apply(this, arguments); if (this === localStorage && k === K()) { clearTimeout(t); t = setTimeout(refresh, 50); } return r; };
        const go = () => {
            if (!document.getElementById('xmm-btn')) { const ref = document.getElementById('xnt-btn') || document.getElementById('xdl-btn'); if (ref) { ref.insertAdjacentHTML('afterend', '<button id="xmm-btn" title="📌 Mots pour l\'équipe"><span class="btn-icon">📌</span><span class="btn-label">Mots</span></button>'); document.getElementById('xmm-btn').onclick = () => open(); } }
            refresh();
        };
        XBOOT.ready(go, 1400);
    }
    return { init, open, unread };
})();

XMEMO.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XMENT : 📣 mentions @Prénom
//  Dans un 💬 avis (fil d'un élément) ou un 📌 mot, écrire @Prénom (ou @Prénom_Nom) prévient la personne :
//  notification sur son téléphone (si le Master envoie) et message sur sa page d'accueil à la prochaine ouverture.
// =====================================================================
var XMENT = window.XMENT || (() => {
    let APP = '';
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const cfg = () => { const c = J('xiii.drive', null); return c && c.url ? c : null; };
    const me = () => { const c = cfg(); return (c && c.me && c.me.name) || (J('xiii.deleg.me', {}) || {}).name || ''; };
    async function api(a, p) { const c = cfg(); if (!c) return { ok: false, err: 'off' }; try { const r = await fetch(c.url, { method: 'POST', body: JSON.stringify(Object.assign({ a }, c.tok ? { tok: c.tok } : { code: c.code, by: me() || c.master || 'Master' }, p || {})), redirect: 'follow' }); return await r.json(); } catch (e) { return { ok: false, err: 'net' }; } }
    const RX = /(^|[\s(,;:])@([A-Za-zÀ-ÖØ-öø-ÿ][\wÀ-ÖØ-öø-ÿ'.-]*)/g;
    const tags = t => { const o = []; let m; RX.lastIndex = 0; while ((m = RX.exec(String(t || '')))) o.push(m[2].replace(/[.'-]+$/, '')); return [...new Set(o)]; };
    const NAMES = { callsheeto: 'CALL SHEETO', soustitro: 'SOUSTITRO', chat: 'Chat du projet', index: 'Accueil' };
    const appName = a => (window.XLINKS && XLINKS.T[a] ? XLINKS.T[a][1] : NAMES[a] || String(a || '').toUpperCase());
    // ---------- dans un outil : repérer mes nouveaux messages avec des @ ----------
    function scan(k, v) {
        let o; try { o = JSON.parse(v); } catch (e) { return; } if (!o || typeof o !== 'object') return;
        const sent = J('xiii.ment.sent', {}), out = [], my = me(), c0 = cfg() || {}, mine = [my, (J('xiii.deleg.me', {}) || {}).name, c0.master, 'Master', 'le Master'].filter(Boolean);
        const look = (txt, who, ts, el) => { if (!ts || (who && mine.length && mine.indexOf(who) < 0)) return; const T = tags(txt); if (!T.length) return; const key = APP + '|' + ts; if (sent[key]) return; sent[key] = Date.now(); out.push({ to: T, txt, el, ts }); };
        Object.keys(o).forEach(id => { const x = o[id] || {}; if (Array.isArray(x.thread)) x.thread.forEach(m => look(m.txt, m.who, m.ts, x.label || '')); // 💬 avis
            if (x.txt != null) { look(x.txt, x.by, x.ts, '📌 mot'); (x.rep || []).forEach(r => look(r.txt, r.by, r.ts, '📌 réponse à un mot')); } });
        if (!out.length) return; const ks = Object.keys(sent); if (ks.length > 400) ks.sort((a, b) => sent[a] - sent[b]).slice(0, ks.length - 300).forEach(x => delete sent[x]); W('xiii.ment.sent', sent);
        if (Date.now() - started < 4000) return; // messages déjà présents à l'ouverture : pas de nouvelle mention
        out.forEach(m => { api('ment_add', { to: m.to, app: APP, el: m.el, txt: m.txt });
            if (window.XPUSH && XPUSH.isMaster()) m.to.forEach(t => XPUSH.send({ title: '📣 ' + (my || 'Le Master') + ' vous mentionne', body: appName(APP) + (m.el ? ' › ' + m.el : '') + ' : ' + m.txt.slice(0, 140), url: APP + '.html', tag: 'ment', to: '@' + t.replace(/_/g, ' ') }).catch(() => { })); });
        try { (window.toast || (() => { }))('📣 Mention envoyée à ' + out.map(m => m.to.map(t => '@' + t).join(' ')).join(', ')); } catch (e) { }
    }
    let started = Date.now();
    // ---------- accueil : « on vous a mentionné » ----------
    async function home() {
        if (!cfg()) return; const r = await api('ment_list'); if (!r.ok || !r.ments || !r.ments.length) return;
        const show = () => {
            if (document.getElementById('xmt-ov')) return; if (document.getElementById('xnw-ov')) { setTimeout(show, 1500); return; }
            const L = r.ments.map(m => Object.assign({}, m, { txt: String(m.txt || '').replace(/^'/, '') })); document.body.insertAdjacentHTML('beforeend', '<div id="xmt-ov"><div class="xmt-b"><div class="xmt-h"><b>📣 On vous a mentionné</b><span>' + L.length + ' message' + (L.length > 1 ? 's' : '') + ' depuis votre dernière visite</span></div><div class="xmt-l">' +
                L.map(m => '<a class="xmt-i" href="' + (m.app === 'chat' ? 'index.html' : esc(m.app) + '.html') + '"><div><b>' + esc(m.by) + '</b> · ' + esc(appName(m.app)) + (m.el ? ' › ' + esc(m.el) : '') + '<small>' + new Date(m.ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</small></div><p>' + esc(m.txt).replace(/(^|\s)@([\wÀ-ÿ'.-]+)/g, '$1<mark>@$2</mark>') + '</p></a>').join('') +
                '</div><div class="xmt-f"><button id="xmt-ok">✓ Marquer comme lu</button><button id="xmt-later" class="sec">Plus tard</button></div></div></div>');
            const o = document.getElementById('xmt-ov'), close = () => o.remove();
            document.getElementById('xmt-ok').onclick = () => { api('ment_read'); close(); };
            document.getElementById('xmt-later').onclick = close; o.onclick = e => { if (e.target === o) close(); };
            o.querySelectorAll('.xmt-i').forEach(a => a.addEventListener('click', () => api('ment_read')));
        };
        show();
    }
    function init(app) {
        APP = app; started = Date.now();
        const s = document.createElement('style'); s.textContent = '#xmt-ov{position:fixed;inset:0;z-index:9993;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}.xmt-b{background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;width:min(520px,100%);max-height:84vh;display:flex;flex-direction:column;font:14px/1.45 "Segoe UI",sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.5)}.xmt-h{padding:14px 16px 8px;display:flex;flex-direction:column;gap:2px}.xmt-h b{font-size:16px}.xmt-h span{opacity:.65;font-size:12.5px}.xmt-l{overflow:auto;padding:0 10px}.xmt-i{display:block;text-decoration:none;color:inherit;padding:10px 8px;border-top:1px solid rgba(255,255,255,.08);border-radius:8px}.xmt-i:hover{background:rgba(240,179,120,.08)}.xmt-i small{float:right;opacity:.55}.xmt-i p{margin:4px 0 0;white-space:pre-wrap}.xmt-i mark{background:rgba(240,179,120,.25);color:inherit;border-radius:4px;padding:0 2px}.xmt-f{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px}.xmt-f button{font:600 13px "Segoe UI",sans-serif;padding:8px 14px;border-radius:8px;border:0;background:#f0b378;color:#1d1b19;cursor:pointer}.xmt-f button.sec{background:transparent;color:inherit;border:1px solid rgba(255,255,255,.2)}@media print{#xmt-ov{display:none!important}}';
        document.head.appendChild(s); s.textContent += CSS2; try { acWire(); hlWire(); } catch (e) { }
        if (app !== 'index') setTimeout(() => toolMentions().catch(() => { }), 5000);
        if (app === 'index') { setTimeout(() => home().catch(() => { }), 3500); return; }
        const prev = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) { const r = prev.apply(this, arguments); if (this === localStorage && (k === 'xiii.notes.' + APP || k === 'xiii.memo.' + APP)) { try { scan(k, v); } catch (e) { } } return r; };
        ['xiii.notes.' + APP, 'xiii.memo.' + APP].forEach(k => { const v = localStorage.getItem(k); if (v) try { scan(k, v); } catch (e) { } }); // mémoriser l'existant
    }

    // =================================================================
    //  👥 qui peut-on mentionner : équipe de la fiche projet + annuaire + membres Drive vus dans le chat
    // =================================================================
    const fold = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    function people() {
        const out = [], seen = {}, add = (prenom, nom, info) => { prenom = String(prenom || '').trim(); nom = String(nom || '').trim(); if (!prenom && !nom) return; const full = (prenom + ' ' + nom).trim(), k = fold(full); if (!k || seen[k]) return; seen[k] = 1; out.push({ prenom: prenom || nom, nom: prenom ? nom : '', full, info: info || '' }); };
        const split = n => { const a = String(n || '').trim().split(/\s+/); return [a.shift() || '', a.join(' ')]; };
        try { const S = J('xiii.projets', {}) || {}, f = (S.list || []).find(x => x && x.id === S.active); (f && f.team || []).forEach(m => { const [a, b] = m.prenom || m.nom ? [m.prenom, m.nom] : split(m.name); add(a, b, [m.role, m.dept].filter(Boolean).join(' · ')); }); } catch (e) { }
        (J('xiii.annuaire', []) || []).forEach(m => { if (!m) return; const [a, b] = m.prenom || m.nom ? [m.prenom, m.nom] : split(m.name); add(a, b, m.role || m.job || ''); });
        (J('xiii.chat.who', []) || []).forEach(n => { const [a, b] = split(n); add(a, b, 'membre du Drive'); });
        return out;
    }
    // jeton à insérer : @Prénom si unique, sinon @Prénom_Nom
    const token = (p, all) => { const dup = all.filter(x => fold(x.prenom) === fold(p.prenom)).length > 1; return '@' + (dup && p.nom ? (p.prenom + '_' + p.nom) : p.prenom).replace(/\s+/g, '_'); };
    // =================================================================
    //  ⌨️ autocomplétion @ dans les avis, mots, réponses et le chat
    // =================================================================
    const ZONE = '.xdl-box,#xst,#xch,[data-xment],.xmo,#xmo,.xnt-a';
    let AC = null; // { el, start, items, i }
    function acClose() { const d = document.getElementById('xmt-ac'); if (d) d.remove(); AC = null; }
    function acShow(el) {
        if (!el || !(el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|)$/.test(el.type || ''))) || !el.closest(ZONE)) { acClose(); return; }
        const pos = el.selectionStart, before = el.value.slice(0, pos), m = /(^|[\s(,;:])@([\wÀ-ÖØ-öø-ÿ'.-]{0,30})$/.exec(before);
        if (!m) { acClose(); return; }
        const q = fold(m[2]).replace(/_/g, ' '), all = people(), items = all.filter(p => !q || fold(p.full).split(/\s+/).some(w => w.indexOf(q) === 0) || fold(p.full).indexOf(q) === 0).slice(0, 8);
        if (!items.length) { acClose(); return; }
        AC = { el, start: pos - m[2].length - 1, items, i: AC && AC.el === el ? Math.min(AC.i, items.length - 1) : 0, all };
        let d = document.getElementById('xmt-ac'); if (!d) { d = document.createElement('div'); d.id = 'xmt-ac'; d.setAttribute('role', 'listbox'); document.body.appendChild(d); }
        d.innerHTML = '<small>Mentionner — ↑↓ puis Entrée</small>' + items.map((p, k) => '<div role="option" data-k="' + k + '"' + (k === AC.i ? ' class="on" aria-selected="true"' : '') + '><b>' + esc(p.full) + '</b>' + (p.info ? '<i>' + esc(p.info) + '</i>' : '') + '</div>').join('');
        const r = el.getBoundingClientRect(), h = Math.min(260, 26 + items.length * 34), up = r.bottom + h > innerHeight - 8;
        d.style.left = Math.max(6, Math.min(r.left, innerWidth - 270)) + 'px'; d.style.top = (up ? Math.max(6, r.top - h - 4) : r.bottom + 4) + 'px';
        d.querySelectorAll('[data-k]').forEach(o => o.onmousedown = e => { e.preventDefault(); AC.i = +o.dataset.k; acPick(); });
    }
    function acPick() {
        if (!AC) return; const { el, start, items, i, all } = AC, t = token(items[i], all) + ' ', end = el.selectionStart;
        el.value = el.value.slice(0, start) + t + el.value.slice(end); const c = start + t.length; el.setSelectionRange(c, c); acClose(); el.focus();
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function acWire() {
        document.addEventListener('input', e => { try { acShow(e.target); } catch (x) { } }, true);
        document.addEventListener('keydown', e => { if (!AC || e.target !== AC.el) return; const n = AC.items.length;
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopImmediatePropagation(); AC.i = (AC.i + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; acShow(AC.el); }
            else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopImmediatePropagation(); acPick(); }
            else if (e.key === 'Escape') { e.stopImmediatePropagation(); acClose(); } }, true);
        document.addEventListener('focusout', e => { if (AC && e.target === AC.el) setTimeout(() => { if (AC && document.activeElement !== AC.el) acClose(); }, 120); }, true);
        addEventListener('resize', acClose); document.addEventListener('scroll', e => { if (AC && !(e.target && e.target.id === 'xmt-ac')) acClose(); }, true);
    }
    // =================================================================
    //  🖍️ surligner les @ dans les fils affichés (avis, mots, chat) — @moi en plus fort
    // =================================================================
    const isMe = t => { const a = fold(String(t).replace(/_/g, ' ')), b = fold(me()); return !!a && !!b && (a === b || a === b.split(' ')[0] || a.replace(/ /g, '') === b.replace(/ /g, '')); };
    const hl = html => String(html).replace(/(^|[\s(,;:>])@([A-Za-zÀ-ÖØ-öø-ÿ][\wÀ-ÖØ-öø-ÿ'.-]*)/g, (m0, a, t) => a + '<mark class="xmt-at' + (isMe(t.replace(/[.'-]+$/, '')) ? ' me' : '') + '">@' + t + '</mark>');
    function hlNode(n) { if (!n || n.dataset.xmh || n.textContent.indexOf('@') < 0) return; n.dataset.xmh = 1;
        const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), L = []; while (w.nextNode()) if (/@\w|@[À-ÿ]/.test(w.currentNode.nodeValue) && !w.currentNode.parentNode.closest('mark,input,textarea,a')) L.push(w.currentNode);
        L.forEach(t => { const s = document.createElement('span'); s.innerHTML = hl(esc(t.nodeValue)); t.parentNode.replaceChild(s, t); });
        if (n.querySelector('mark.xmt-at.me')) n.classList.add('xmt-mine'); }
    const HLSEL = '.xnt-m,.xch-m .tx,#xst-ml .r span,.xmo-t,.xmo-r';
    function hlWire() { const run = () => document.querySelectorAll(HLSEL).forEach(hlNode); let q = 0; new MutationObserver(() => { if (q) return; q = requestAnimationFrame(() => { q = 0; run(); }); }).observe(document.body, { childList: true, subtree: true }); run(); }
    // =================================================================
    //  💬 chat du projet (Drive v19 : chat_send / chat_list) — repli : messages au Master (msg_*)
    // =================================================================
    let CHAT_MODE = null; // 'chat' | 'msg'
    async function chatList(since) {
        if (CHAT_MODE !== 'msg') { const r = await api('chat_list', { since: since || 0 }); if (r.ok) { CHAT_MODE = 'chat'; const who = new Set(J('xiii.chat.who', [])); (r.msgs || []).forEach(m => m.nom && who.add(m.nom)); W('xiii.chat.who', [...who].slice(-60)); return r; } if (r.err !== 'action') return r; CHAT_MODE = 'msg'; }
        const r = await api('msg_list'); if (!r.ok) return r; return { ok: true, legacy: 1, msgs: (r.msgs || []).slice().reverse() };
    }
    async function chatSend(txt, ctx) {
        txt = String(txt || '').trim(); if (!txt) return { ok: false, err: 'vide' }; const to = tags(txt);
        let r = CHAT_MODE === 'msg' ? { ok: false, err: 'action' } : await api('chat_send', { txt, app: ctx && ctx.app || '', el: ctx && ctx.el || '', to });
        if (!r.ok && r.err === 'action') { CHAT_MODE = 'msg'; r = await api('msg_send', { txt: (ctx && ctx.app ? '[' + appName(ctx.app) + (ctx.el ? ' › ' + ctx.el : '') + '] ' : '') + txt }); }
        if (r.ok && to.length) { api('ment_add', { to, app: ctx && ctx.app || 'chat', el: '💬 Chat' + (ctx && ctx.el ? ' › ' + ctx.el : ''), txt });
            if (window.XPUSH && XPUSH.isMaster && XPUSH.isMaster()) to.forEach(t => XPUSH.send({ title: '📣 ' + (me() || 'Le Master') + ' vous mentionne', body: '💬 ' + txt.slice(0, 140), url: (ctx && ctx.app || 'index') + '.html', tag: 'ment', to: '@' + t.replace(/_/g, ' ') }).catch(() => { })); }
        if (r.ok) W('xiii.chat.seen', Date.now());
        return r;
    }
    const fmtT = ts => { const d = new Date(ts), t = new Date(); return d.toDateString() === t.toDateString() ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
    // dessine un chat complet dans le conteneur c ; ctx = { app, el } (contexte proposé, désactivable)
    function chatTeam(c, ctx) {
        ctx = ctx || {}; let last = 0, timer = 0, useCtx = !!ctx.app, L = [];
        c.innerHTML = '<div class="xch-l" aria-live="polite"><p class="xch-e">Chargement…</p></div>' +
            '<div class="xch-f">' + (ctx.app ? '<label class="xch-ctx" title="Le message rappelle l\'outil et l\'élément d\'où il est parti (lien direct)"><input type="checkbox" checked> 📎 ' + esc(appName(ctx.app)) + (ctx.el ? ' › ' + esc(ctx.el) : '') + '</label>' : '') +
            '<div class="xch-in"><textarea rows="1" placeholder="Message à l\'équipe… (@ pour mentionner)" aria-label="Message"></textarea><button class="xch-go">Envoyer</button></div><small class="xch-h"></small></div>';
        const box = c.querySelector('.xch-l'), ta = c.querySelector('textarea'), hint = c.querySelector('.xch-h'), cb = c.querySelector('.xch-ctx input');
        if (cb) cb.onchange = () => useCtx = cb.checked;
        const row = m => { const mine = m.nom && fold(m.nom) === fold(me()); let tx = esc(m.txt).replace(/\n/g, '<br>'); const lg = /^\[([^\]]{1,80})\]\s*/.exec(m.txt || '');
            const chip = m.app ? '<a class="xch-chip" href="' + esc(m.app) + '.html">📎 ' + esc(appName(m.app)) + (m.el ? ' › ' + esc(m.el) : '') + '</a>' : '';
            return '<div class="xch-m' + (mine ? ' me' : '') + '"><div class="hd"><b>' + esc(m.nom || '—') + '</b>' + (m.secteur ? '<i>' + esc(m.secteur) + '</i>' : '') + '<small>' + fmtT(m.ts) + '</small></div>' + chip + '<div class="tx">' + hl(tx) + '</div></div>'; };
        const draw = () => { if (!L.length) { box.innerHTML = '<p class="xch-e">Aucun message pour l\'instant. Écrivez le premier — tapez @ pour prévenir quelqu\'un.</p>'; return; }
            const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 40; let prevDay = '';
            box.innerHTML = L.map(m => { const d = new Date(m.ts).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); const sep = d !== prevDay ? '<div class="xch-d">' + d + '</div>' : ''; prevDay = d; return sep + row(m); }).join('');
            box.querySelectorAll('.xch-m').forEach(n => { if (n.querySelector('mark.me')) n.classList.add('xmt-mine'); n.querySelector('.tx').dataset.xmh = 1; });
            if (atEnd || !last) box.scrollTop = box.scrollHeight; };
        const load = async () => { if (!c.isConnected) { clearInterval(timer); return; } const r = await chatList(last); if (!c.isConnected) return;
            if (!r.ok) { box.innerHTML = '<p class="xch-e">' + (r.err === 'off' ? 'Connectez le Drive d\'équipe (Réglages → Gestion d\'équipe) pour discuter avec l\'équipe.' : r.err === 'admin' ? 'Le chat d\'équipe demande la mise à jour du script Drive (version 19).' : '⚠️ Drive injoignable — nouvel essai dans un instant.') + '</p>'; return; }
            if (r.legacy) { L = r.msgs; hint.textContent = 'ℹ️ Script Drive ancien (avant v19) : ce fil n\'est lu que par le Master. Mettez à jour le script (page Drive) pour un chat partagé.'; }
            else { const seen = new Set(L.map(m => m.ts + '|' + m.nom)); (r.msgs || []).forEach(m => { if (!seen.has(m.ts + '|' + m.nom)) L.push(m); }); L.sort((a, b) => a.ts - b.ts); L = L.slice(-200); }
            if (L.length) last = r.legacy ? 0 : L[L.length - 1].ts; W('xiii.chat.seen', Date.now()); draw(); };
        const send = async () => { const t = ta.value.trim(); if (!t) return; const b = c.querySelector('.xch-go'); b.disabled = true;
            const r = await chatSend(t, useCtx ? ctx : null); b.disabled = false;
            if (r.ok) { ta.value = ''; ta.style.height = ''; const T = tags(t); hint.textContent = T.length ? '📣 Mention envoyée à ' + T.map(x => '@' + x).join(' ') : ''; if (r.ts && !r.legacy) { L.push({ ts: r.ts, nom: me(), txt: t, app: useCtx ? ctx.app : '', el: useCtx ? ctx.el : '' }); last = Math.max(last, r.ts); draw(); } else load(); }
            else hint.textContent = '⚠️ ' + (r.err === 'off' ? 'Drive non connecté' : r.err === 'net' ? 'Hors ligne : message non envoyé, réessayez' : 'Envoi impossible (' + r.err + ')'); };
        c.querySelector('.xch-go').onclick = send;
        ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !AC) { e.preventDefault(); send(); } });
        ta.addEventListener('input', () => { ta.style.height = ''; ta.style.height = Math.min(120, ta.scrollHeight) + 'px'; });
        load(); timer = setInterval(() => { if (!document.hidden) load(); }, 20000);
        return { reload: load, focus: () => ta.focus() };
    }
    // 🔒 messages privés au Master (msg_send / msg_list) — invisibles pour le reste de l'équipe
    const isMaster = () => { const c = cfg() || {}; return !!c.code || c.role === 'master'; };
    function pvInto(c, ctx) {
        ctx = ctx || {}; const M = isMaster();
        if (M) {
            c.innerHTML = '<p class="xch-note">🔒 Messages envoyés à vous seul par les membres de l\'équipe.</p><div class="xch-l"><p class="xch-e">Chargement…</p></div>';
            const box = c.querySelector('.xch-l');
            const load = async () => { const r = await api('msg_list'); if (!c.isConnected) return;
                if (!r.ok) { box.innerHTML = '<p class="xch-e">' + (r.err === 'off' ? 'Connectez le Drive d\'équipe pour recevoir les messages privés.' : '⚠️ Drive injoignable.') + '</p>'; return; }
                const L = (r.msgs || []).slice(0, 50);
                box.innerHTML = L.length ? L.map(m => '<div class="xch-m' + (m.lu ? '' : ' nw') + '"><div class="hd"><b>' + esc(m.nom || '—') + '</b>' + (m.secteur ? '<i>' + esc(m.secteur) + '</i>' : '') + '<small>' + fmtT(m.ts) + (m.lu ? '' : ' · nouveau') + '</small></div><div class="tx">' + hl(esc(String(m.txt).replace(/^'/, '')).replace(/\n/g, '<br>')) + '</div><button class="xch-rep" data-n="' + esc(m.nom || '') + '" title="Répond dans le chat de l\'équipe en mentionnant la personne (visible par tous)">↩ Répondre dans le chat (@' + esc(String(m.nom || '').split(' ')[0]) + ')</button></div>').join('') : '<p class="xch-e">Aucun message privé reçu.</p>';
                box.querySelectorAll('.xch-rep').forEach(b => b.onclick = () => { const host = c.closest('.xch-root'); if (host && host._go) host._go('all', '@' + b.dataset.n.trim().replace(/\s+/g, '_') + ' '); });
                L.filter(m => !m.lu).forEach(m => api('msg_read', { ts: m.ts })); };
            load(); return { reload: load, focus: () => { } };
        }
        c.innerHTML = '<p class="xch-note">🔒 Seul le Master lira ce message. Il n\'apparaît pas dans le chat de l\'équipe.</p><div class="xch-l"></div>' +
            '<div class="xch-f">' + (ctx.app ? '<label class="xch-ctx"><input type="checkbox" checked> 📎 ' + esc(appName(ctx.app)) + (ctx.el ? ' › ' + esc(ctx.el) : '') + '</label>' : '') +
            '<div class="xch-in"><textarea rows="2" placeholder="Message privé au Master…" aria-label="Message privé au Master"></textarea><button class="xch-go">🔒 Envoyer</button></div><small class="xch-h"></small></div>';
        const box = c.querySelector('.xch-l'), ta = c.querySelector('textarea'), hint = c.querySelector('.xch-h'), cb = c.querySelector('.xch-ctx input');
        const draw = () => { const S = J('xiii.chat.pv', []); box.innerHTML = S.length ? S.slice().reverse().map(m => '<div class="xch-m me"><div class="hd"><b>Vous → Master</b><small>' + fmtT(m.at) + '</small></div>' + (m.app ? '<span class="xch-chip">📎 ' + esc(appName(m.app)) + (m.el ? ' › ' + esc(m.el) : '') + '</span>' : '') + '<div class="tx">' + esc(m.t).replace(/\n/g, '<br>') + '</div></div>').join('') : '<p class="xch-e">Une question, une info à ne pas partager avec tout le monde ? Écrivez-la ici.</p>'; box.scrollTop = box.scrollHeight; };
        const send = async () => { const t = ta.value.trim(); if (!t) return; const b = c.querySelector('.xch-go'), withCtx = cb ? cb.checked : false; b.disabled = true;
            const r = await api('msg_send', { txt: (withCtx && ctx.app ? '[' + appName(ctx.app) + (ctx.el ? ' › ' + ctx.el : '') + '] ' : '') + t }); b.disabled = false;
            if (!r.ok) { hint.textContent = '⚠️ ' + (r.err === 'off' ? 'Drive non connecté' : r.err === 'net' ? 'Hors ligne : message non envoyé, réessayez' : 'Envoi impossible (' + r.err + ')'); return; }
            const S = J('xiii.chat.pv', []); S.push({ t, at: Date.now(), app: withCtx ? ctx.app : '', el: withCtx ? ctx.el : '' }); W('xiii.chat.pv', S.slice(-40)); ta.value = ''; hint.textContent = '🔒 Envoyé au Master'; draw(); };
        c.querySelector('.xch-go').onclick = send; ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !AC) { e.preventDefault(); send(); } });
        draw(); return { reload: draw, focus: () => ta.focus() };
    }
    // chat complet : onglets « 👥 Toute l'équipe » / « 🔒 Au Master » (ou « 🔒 Privés reçus » pour le Master)
    function chatInto(c, ctx) {
        const M = isMaster(); let cur = J('xiii.chat.view', 'all'), H = {};
        c.classList.add('xch-root'); c.innerHTML = '<div class="xch-seg" role="tablist"><button role="tab" data-v="all">👥 Toute l\'équipe</button><button role="tab" data-v="pv">' + (M ? '🔒 Privés reçus <i></i>' : '🔒 Au Master seulement') + '</button></div><div class="xch-p" data-p="all"></div><div class="xch-p" data-p="pv"></div>';
        const go = (v, pre) => { cur = v; W('xiii.chat.view', v); c.querySelectorAll('.xch-seg button').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
            c.querySelectorAll('.xch-p').forEach(p => p.hidden = p.dataset.p !== v); const p = c.querySelector('[data-p="' + v + '"]');
            if (!H[v]) H[v] = (v === 'all' ? chatTeam : pvInto)(p, ctx); else if (v === 'pv') H[v].reload();
            if (pre) { const ta = p.querySelector('textarea'); if (ta) { ta.value = pre; ta.focus(); ta.setSelectionRange(pre.length, pre.length); } } else H[v].focus(); };
        c._go = go; c.querySelectorAll('.xch-seg button').forEach(b => b.onclick = () => go(b.dataset.v));
        if (M) api('msg_list').then(r => { const n = r.ok ? (r.msgs || []).filter(m => !m.lu).length : 0, i = c.querySelector('.xch-seg i'); if (i) i.textContent = n ? n : ''; }).catch(() => { });
        go(cur === 'pv' ? 'pv' : 'all');
        return { reload: () => H[cur] && H[cur].reload(), focus: () => H[cur] && H[cur].focus() };
    }
    // fenêtre de chat dans un outil (depuis 💬 Avis ou la palette)
    function openChat(el) {
        if (document.getElementById('xch')) return; const ctx = { app: APP, el: el || '' };
        document.body.insertAdjacentHTML('beforeend', '<div id="xch" role="dialog" aria-label="Chat du projet"><div class="xch-t"><b>💬 Chat du projet</b><button class="xch-x" aria-label="Fermer">✕</button></div><div class="xch-c"></div></div>');
        const o = document.getElementById('xch'), close = () => o.remove(); o.querySelector('.xch-x').onclick = close;
        o.addEventListener('keydown', e => { if (e.key === 'Escape' && !AC) close(); }); const h = chatInto(o.querySelector('.xch-c'), ctx); setTimeout(() => h.focus(), 50);
    }
    // nombre de messages du chat non lus (pour les badges)
    async function chatUnread() { const s = J('xiii.chat.seen', 0); const r = await chatList(s); let n = 0; if (r.ok && !r.legacy) { const m = me(); n = (r.msgs || []).filter(x => x.ts > s && fold(x.nom) !== fold(m)).length; }
        if (isMaster()) { const p = await api('msg_list'); if (p.ok) n += (p.msgs || []).filter(x => !x.lu).length; } return n; }
    // à l'ouverture d'un outil : mentions qui le concernent
    async function toolMentions() { if (!cfg()) return; const r = await api('ment_list'); if (!r.ok) return; const here = (r.ments || []).filter(m => m.app === APP); if (!here.length) return;
        const b = document.getElementById('xnt-btn'); if (b) { b.dataset.m = here.length; b.title = '📣 ' + here.length + ' mention(s) pour vous dans cet outil'; }
        try { (window.toast || (() => { }))('📣 ' + here.map(m => m.by).filter((x, i, a) => a.indexOf(x) === i).join(', ') + ' vous mentionne ici — ouvrez 💬 Avis'); } catch (e) { } }
    const CSS2 = '#xmt-ac{position:fixed;z-index:10050;width:260px;max-height:260px;overflow:auto;background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.6);border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.45);padding:4px;font:13px system-ui,sans-serif}#xmt-ac small{display:block;padding:3px 8px;color:var(--text-dim,#999);font-size:11px}#xmt-ac div{padding:6px 8px;border-radius:7px;cursor:pointer;display:flex;flex-direction:column}#xmt-ac div.on,#xmt-ac div:hover{background:rgba(240,179,120,.18)}#xmt-ac i{font-style:normal;font-size:11px;color:var(--text-dim,#aaa)}' +
        'mark.xmt-at{background:rgba(66,165,245,.18);color:inherit;border-radius:4px;padding:0 2px;font-weight:600}mark.xmt-at.me{background:rgba(240,179,120,.35);box-shadow:0 0 0 1px rgba(240,179,120,.7)}.xmt-mine{border-left-color:#F0B378!important}' +
        '#xch{position:fixed;right:16px;bottom:16px;z-index:9992;width:min(400px,calc(100vw - 32px));height:min(560px,calc(100vh - 32px));background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;font:14px system-ui,sans-serif}.xch-t{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border-soft,#3a3633)}.xch-x{background:none;border:0;color:inherit;font-size:16px;cursor:pointer;padding:4px 8px}.xch-c{flex:1;min-height:0;display:flex;flex-direction:column}' +
        '.xch-c,#xst .xch-wrap{display:flex;flex-direction:column;min-height:0}.xch-l{flex:1;min-height:120px;overflow:auto;padding:8px 10px;display:flex;flex-direction:column;gap:6px}.xch-e{color:var(--text-dim,#999);font-size:13px;text-align:center;padding:16px 6px}.xch-d{text-align:center;font-size:11px;color:var(--text-dim,#999);margin:6px 0 2px;text-transform:capitalize}' +
        '.xch-m{background:rgba(255,255,255,.05);border-left:3px solid rgba(66,165,245,.5);border-radius:8px;padding:6px 9px;max-width:92%;align-self:flex-start}.xch-m.me{align-self:flex-end;border-left-color:rgba(240,179,120,.7);background:rgba(240,179,120,.08)}.xch-m .hd{display:flex;gap:6px;align-items:baseline;font-size:12px}.xch-m .hd i{font-style:normal;color:var(--text-dim,#999)}.xch-m .hd small{margin-left:auto;color:var(--text-dim,#999);font-size:11px}.xch-m .tx{font-size:13.5px;line-height:1.4;margin-top:2px;overflow-wrap:anywhere}' +
        '.xch-chip{display:inline-block;margin-top:3px;font-size:11px;padding:1px 7px;border-radius:9px;background:rgba(66,165,245,.15);color:inherit;text-decoration:none}.xch-chip:hover{background:rgba(66,165,245,.3)}' +
        '.xch-f{border-top:1px solid var(--border-soft,#3a3633);padding:8px 10px;display:flex;flex-direction:column;gap:5px}.xch-ctx{font-size:12px;color:var(--text-dim,#bbb);display:flex;gap:5px;align-items:center}.xch-ctx input{width:auto;margin:0}.xch-in{display:flex;gap:6px;align-items:flex-end}.xch-in textarea{flex:1;min-width:0;resize:none;font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:7px 9px;max-height:120px}.xch-go{padding:7px 12px;border-radius:8px;border:0;background:#F0B378;color:#1a1a1a;font-weight:600;cursor:pointer}.xch-go:disabled{opacity:.5}.xch-h{font-size:11px;color:var(--text-dim,#999);min-height:0}.xch-h:empty{display:none}' +
        '.xch-seg{display:flex;gap:4px;padding:6px 8px 0}.xch-seg button{flex:1;padding:6px 8px;border-radius:8px;border:1px solid var(--border-color,#45454b);background:transparent;color:inherit;font:600 12.5px system-ui,sans-serif;cursor:pointer}.xch-seg button.on{background:rgba(240,179,120,.18);border-color:rgba(240,179,120,.7)}.xch-seg i{font-style:normal;background:#F0B378;color:#1a1a1a;border-radius:9px;padding:0 5px;margin-left:3px}.xch-seg i:empty{display:none}.xch-p{flex:1;min-height:0;display:flex;flex-direction:column}.xch-p[hidden]{display:none}.xch-root{display:flex;flex-direction:column;min-height:0;flex:1}.xch-note{font-size:11.5px;color:var(--text-dim,#aaa);margin:6px 10px 0;padding:5px 8px;border-radius:7px;background:rgba(255,255,255,.04)}.xch-m.nw{border-left-color:#F0B378}.xch-rep{margin-top:4px;font-size:11px;padding:2px 7px;border-radius:7px;border:1px solid var(--border-color,#45454b);background:transparent;color:inherit;cursor:pointer}' +
        '#xnt-btn[data-m]:not([data-m=""])::before{content:"@";position:absolute;top:-5px;left:-5px;background:#F0B378;color:#1a1a1a;border-radius:9px;font:700 10px/15px sans-serif;min-width:15px;text-align:center}';
    return { init, tags, people, hl, chatInto, openChat, chatSend, chatList, chatUnread };
})();

XMENT.init(XIII_APP);

