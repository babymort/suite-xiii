// SUITE XIII — module commun. Source : xiii-src/cadro-live.js
// =====================================================================
//  SUITE XIII — CADRO LIVE (saison 6, phase L) : moniteur de contrôle d'un signal vidéo en direct, dans CADRO
//  Étape 1 — entrée du signal :
//   · toute source que le navigateur voit comme une caméra : carte de capture (HDMI / SDI → USB), webcam,
//     caméra virtuelle (OBS, NDI Virtual Input…) ; ou la mire de démonstration (barres + rampe + chiffres, sans matériel) ;
//   · choix de la source, de la résolution (auto, 720p, 1080p, UHD) et de la cadence (auto, 23,98 → 60 i/s) ;
//   · ce que la source donne vraiment : résolution, cadence demandée et mesurée, nom de l'appareil.
//  Les étapes suivantes (scopes, aides à l'exposition, contrôle de l'image, étalonnage, captures) s'ajoutent sur ce moniteur.
//  Ouverture : bouton « 📡 LIVE » de la barre de CADRO, ou cadro.html#live. Rien n'est enregistré ni envoyé : l'image reste sur l'appareil.
// =====================================================================
const XCLIVE = (() => {
    const K = 'xiii.cadro.live';
    const J = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } };
    const W = o => { try { localStorage.setItem(K, JSON.stringify(Object.assign(J(), o))); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const RES = [['auto', 'Automatique (la plus haute)'], ['1280x720', '1280 × 720 (HD)'], ['1920x1080', '1920 × 1080 (Full HD)'], ['2560x1440', '2560 × 1440 (QHD)'], ['3840x2160', '3840 × 2160 (UHD 4K)']];
    const FPS = [['auto', 'Automatique'], ['23.976', '23,98'], ['24', '24'], ['25', '25'], ['29.97', '29,97'], ['30', '30'], ['50', '50'], ['59.94', '59,94'], ['60', '60']];
    let S = null, run = false, ov = null, fpsM = 0, vfc = 0, seq = 0;
    const css = () => { if (document.getElementById('xcl-css')) return; const s = document.createElement('style'); s.id = 'xcl-css';
        s.textContent = '#xcl{position:fixed;inset:0;z-index:2147482000;display:grid;grid-template-columns:270px minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);background:#0c0c0e;color:#e8e8e8;font:13px system-ui,sans-serif}' +
            '#xcl>header{grid-column:1/-1;display:flex;align-items:center;gap:12px;padding:8px 14px;background:#141417;border-bottom:1px solid #2a2a30}#xcl>header h1{margin:0;font:400 22px/1 Astoria,Georgia,serif;color:#f0b378;letter-spacing:.02em}#xcl>header .live{font:700 11px system-ui;letter-spacing:.12em;padding:3px 8px;border-radius:6px;background:#3a1414;color:#ff8a80}#xcl>header .live.on{background:#c62828;color:#fff;animation:xclB 1.6s infinite}@keyframes xclB{50%{opacity:.55}}#xcl>header .sp{flex:1}' +
            '#xcl button{padding:6px 11px;border-radius:8px;border:1px solid #3a3a42;background:#1d1d22;color:inherit;cursor:pointer;font:500 12.5px system-ui,sans-serif}#xcl button:hover{border-color:#f0b378}#xcl button.p{background:rgba(240,179,120,.16);border-color:rgba(240,179,120,.55);color:#f6c79a}' +
            '#xcl aside{grid-row:2;overflow-y:auto;padding:12px;border-right:1px solid #2a2a30;background:#111114}#xcl aside h4{margin:12px 0 6px;font:700 10.5px system-ui;letter-spacing:.08em;text-transform:uppercase;opacity:.55}#xcl aside h4:first-child{margin-top:0}#xcl aside select{width:100%;padding:6px;border-radius:7px;background:#1a1a1f;color:inherit;border:1px solid #3a3a42;margin-bottom:6px}' +
            '#xcl .row{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0}#xcl dl{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;margin:0;font-size:12px}#xcl dt{opacity:.6}#xcl dd{margin:0;font-variant-numeric:tabular-nums}#xcl .note{font-size:11.5px;opacity:.65;line-height:1.45;margin:6px 0}#xcl .err{color:#ff8a80}' +
            '#xcl main{grid-row:2;grid-column:2;display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;padding:14px;position:relative}#xcl .mon{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#000;border:1px solid #2a2a30;border-radius:6px;overflow:hidden}#xcl video{max-width:100%;max-height:100%;display:block}#xcl .empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:.75;text-align:center;padding:20px}#xcl .empty b{font-size:15px}' +
            '#xcl [hidden]{display:none!important}#xcl .osd{position:absolute;left:10px;top:10px;font:600 11px ui-monospace,monospace;background:rgba(0,0,0,.55);padding:4px 8px;border-radius:6px;pointer-events:none}';
        document.head.appendChild(s); };
    // ---------- mire de démonstration (aucun matériel) ----------
    function mire(w, h, fps) {
        const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); let t = 0, run = true;
        const bars = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'];
        const draw = () => { if (!run) return; const bw = w / 7; bars.forEach((b, i) => { x.fillStyle = b; x.fillRect(i * bw, 0, bw + 1, h * .62); });
            const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#000'); g.addColorStop(1, '#fff'); x.fillStyle = g; x.fillRect(0, h * .62, w, h * .14);
            for (let i = 0; i < 11; i++) { const v = Math.round(i * 25.5); x.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; x.fillRect(i * w / 11, h * .76, w / 11 + 1, h * .1); }
            x.fillStyle = '#101010'; x.fillRect(0, h * .86, w, h * .14); x.fillStyle = '#f0b378'; x.font = 'bold ' + Math.round(h * .07) + 'px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
            const s = t / fps; x.fillText('CADRO LIVE · MIRE  ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(Math.floor(s % 60)).padStart(2, '0') + ':' + String(t % Math.round(fps)).padStart(2, '0'), w / 2, h * .93);
            const bx = (t * 6) % w; x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(bx, h * .62, 6, h * .14); t++; };
        const iv = setInterval(draw, 1000 / fps); draw(); const st = c.captureStream(fps); st.__stop = () => { run = false; clearInterval(iv); }; return st;
    }
    // ---------- sources ----------
    async function devices() { try { const L = await navigator.mediaDevices.enumerateDevices(); return L.filter(d => d.kind === 'videoinput'); } catch (e) { return []; } }
    function stop() { if (S) { S.getTracks().forEach(t => t.stop()); if (S.__stop) S.__stop(); } S = null; if (vfc && ov) { try { ov.querySelector('video').cancelVideoFrameCallback(vfc); } catch (e) { } } vfc = 0; paint(); }
    let chain = Promise.resolve(); const start = () => { run = true; return (chain = chain.then(doStart, doStart)); }, halt = () => { run = false; stop(); }; // une ouverture de source à la fois (une carte ne s'ouvre pas deux fois)
    async function doStart() {
        const my = ++seq, c = J(), v = ov && ov.querySelector('video'); stop(); const err = ov && ov.querySelector('[data-err]'); if (err) err.textContent = '';
        const [rw, rh] = c.res && c.res !== 'auto' ? c.res.split('x').map(Number) : [0, 0], fr = c.fps && c.fps !== 'auto' ? +c.fps : 0;
        try {
            if (!c.dev || c.dev === 'demo') S = mire(rw || 1920, rh || 1080, fr || 25);
            else { const vc = { deviceId: { exact: c.dev } }; if (rw) { vc.width = { ideal: rw }; vc.height = { ideal: rh }; } else { vc.width = { ideal: 4096 }; vc.height = { ideal: 2160 }; } if (fr) vc.frameRate = { ideal: fr };
                const st = await navigator.mediaDevices.getUserMedia({ video: vc, audio: false }); if (my !== seq) { st.getTracks().forEach(t => t.stop()); return; } S = st; }
            if (v) { v.srcObject = S; await v.play().catch(() => { }); measure(v); }
            const tr = S.getVideoTracks()[0]; if (tr) tr.addEventListener('ended', () => { stop(); run = false; if (err) err.textContent = '⚠️ Le signal s\'est arrêté (câble, carte débranchée ?).'; });
        } catch (e) { S = null; run = false; if (err) err.textContent = '⚠️ ' + (/NotAllowed|Permission/i.test(e.name + e.message) ? 'Accès à la caméra refusé : autorisez-le dans la barre d\'adresse du navigateur.' : /NotReadable|Busy/i.test(e.name + e.message) ? 'Source déjà utilisée par une autre application (OBS, visio…) : fermez-la ou choisissez une autre source.' : /Overconstrained/i.test(e.name) ? 'La source n\'accepte pas cette résolution / cadence : essayez « Automatique ».' : 'Signal indisponible (' + e.name + ').'); }
        paint();
    }
    function measure(v) { let n = 0, t0 = performance.now(); const cb = () => { n++; const t = performance.now(); if (t - t0 >= 1000) { fpsM = n * 1000 / (t - t0); n = 0; t0 = t; stats(); } vfc = v.requestVideoFrameCallback(cb); }; if (v.requestVideoFrameCallback) vfc = v.requestVideoFrameCallback(cb); }
    function stats() {
        if (!ov) return; const d = ov.querySelector('[data-st]'), osd = ov.querySelector('.osd'), v = ov.querySelector('video'); if (!d) return;
        if (!S) { d.innerHTML = '<dt>État</dt><dd>aucun signal</dd>'; if (osd) osd.hidden = true; return; }
        const tr = S.getVideoTracks()[0], st = tr && tr.getSettings ? tr.getSettings() : {}, w = v.videoWidth || st.width, h = v.videoHeight || st.height;
        const lab = S.__stop ? 'Mire de démonstration' : (tr && tr.label) || 'Source';
        d.innerHTML = '<dt>Source</dt><dd>' + esc(lab) + '</dd><dt>Image</dt><dd>' + (w ? w + ' × ' + h : '…') + (w && h ? ' (' + (w / h).toFixed(2) + ':1)' : '') + '</dd><dt>Cadence</dt><dd>' + (st.frameRate ? (+st.frameRate).toFixed(2) + ' i/s annoncées' : '—') + '</dd><dt>Mesurée</dt><dd>' + (fpsM ? fpsM.toFixed(1) + ' i/s' : '…') + '</dd>';
        if (osd) { osd.hidden = false; osd.textContent = (w ? w + '×' + h : '') + (fpsM ? ' · ' + fpsM.toFixed(1) + ' i/s' : ''); }
    }
    function paint() { if (!ov) return; const on = !!S; ov.querySelector('.live').classList.toggle('on', on); ov.querySelector('.live').textContent = on ? '● EN DIRECT' : 'PAS DE SIGNAL'; ov.querySelector('.empty').hidden = on; ov.querySelector('video').hidden = !on; ov.querySelector('[data-go]').textContent = run ? '⏹ Arrêter' : '▶ Démarrer'; stats(); }
    async function fill() {
        const sel = ov.querySelector('[data-dev]'), c = J(), L = await devices(), named = L.some(d => d.label);
        sel.innerHTML = '<option value="demo">🎨 Mire de démonstration (sans matériel)</option>' + L.map((d, i) => '<option value="' + esc(d.deviceId) + '">' + (/capture|hdmi|sdi|cam link|ultrastudio|magewell|avermedia|elgato|blackmagic|aja/i.test(d.label) ? '🎞️ ' : /obs|ndi|virtual/i.test(d.label) ? '🖥️ ' : '📷 ') + esc(d.label || ('Caméra ' + (i + 1))) + '</option>').join('');
        sel.value = L.some(d => d.deviceId === c.dev) ? c.dev : 'demo';
        ov.querySelector('[data-perm]').hidden = named || !L.length;
    }
    function open() {
        css(); if (ov) return; const c = J();
        ov = document.createElement('div'); ov.id = 'xcl'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'CADRO LIVE');
        ov.innerHTML = '<header><h1>CADRO LIVE</h1><span class="live">PAS DE SIGNAL</span><span class="sp"></span><button data-full title="Moniteur en plein écran (F)">⛶ Plein écran</button><button data-x title="Revenir à CADRO (Échap)">✕ Fermer</button></header>' +
            '<aside><h4>📡 Source</h4><select data-dev aria-label="Source vidéo"></select><div class="row"><button class="p" data-go>▶ Démarrer</button><button data-ref title="Relire la liste (carte branchée après coup)">↻</button></div>' +
            '<button data-perm hidden style="width:100%;margin:4px 0">🔓 Autoriser l\'accès aux sources vidéo</button><div class="note err" data-err></div>' +
            '<h4>Format demandé</h4><select data-res aria-label="Résolution">' + RES.map(r => '<option value="' + r[0] + '"' + ((c.res || 'auto') === r[0] ? ' selected' : '') + '>' + r[1] + '</option>').join('') + '</select><select data-fps aria-label="Cadence">' + FPS.map(r => '<option value="' + r[0] + '"' + ((c.fps || 'auto') === r[0] ? ' selected' : '') + '>' + (r[0] === 'auto' ? 'Cadence : automatique' : r[1] + ' i/s') + '</option>').join('') + '</select>' +
            '<p class="note">La source choisit au plus près de la demande : le résultat réel s\'affiche ci-dessous.</p><h4>Signal reçu</h4><dl data-st></dl>' +
            '<h4>Brancher un signal</h4><p class="note">Carte de capture HDMI / SDI → USB (Blackmagic, AJA, Magewell, Elgato…), webcam, ou caméra virtuelle d\'OBS / NDI : tout ce que l\'ordinateur voit comme une caméra apparaît dans la liste. L\'image reste sur cet appareil : rien n\'est enregistré ni envoyé.</p></aside>' +
            '<main><div class="mon"><video muted playsinline hidden></video><div class="osd" hidden></div><div class="empty"><b>Aucun signal</b><span>Choisissez une source à gauche puis ▶ Démarrer.<br>Sans matériel, la mire de démonstration permet d\'essayer.</span><button class="p" data-go2>▶ Démarrer la mire</button></div></div></main>';
        document.body.appendChild(ov); fill(); paint();
        ov.querySelector('[data-x]').onclick = close;
        ov.querySelector('[data-go]').onclick = () => run ? halt() : start();
        ov.querySelector('[data-go2]').onclick = () => { ov.querySelector('[data-dev]').value = 'demo'; W({ dev: 'demo' }); start(); };
        ov.querySelector('[data-ref]').onclick = fill;
        ov.querySelector('[data-perm]').onclick = async () => { try { const s = await navigator.mediaDevices.getUserMedia({ video: true }); s.getTracks().forEach(t => t.stop()); } catch (e) { ov.querySelector('[data-err]').textContent = '⚠️ Accès refusé : autorisez la caméra dans la barre d\'adresse.'; } fill(); };
        ov.querySelector('[data-dev]').onchange = e => { W({ dev: e.target.value }); if (run) start(); };
        ov.querySelector('[data-res]').onchange = e => { W({ res: e.target.value }); if (run) start(); };
        ov.querySelector('[data-fps]').onchange = e => { W({ fps: e.target.value }); if (run) start(); };
        ov.querySelector('[data-full]').onclick = full;
        try { navigator.mediaDevices.addEventListener('devicechange', fill); } catch (e) { }
    }
    function full() { const m = ov && ov.querySelector('.mon'); if (!m) return; if (document.fullscreenElement) document.exitFullscreen(); else m.requestFullscreen && m.requestFullscreen().catch(() => { }); }
    function close() { halt(); if (ov) ov.remove(); ov = null; try { navigator.mediaDevices.removeEventListener('devicechange', fill); } catch (e) { } }
    addEventListener('keydown', e => { if (!ov) return; const t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return; if (e.key === 'Escape' && !document.fullscreenElement) { e.stopImmediatePropagation(); close(); } else if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); e.stopImmediatePropagation(); full(); } else if (e.key === ' ') { e.preventDefault(); run ? halt() : start(); } }, true);
    function mount() {
        const tb = document.getElementById('toolbar'); if (!tb || document.getElementById('xcl-btn')) return;
        const b = document.createElement('button'); b.id = 'xcl-btn'; b.title = 'CADRO LIVE : moniteur de contrôle d\'un signal vidéo en direct (carte de capture, webcam, OBS / NDI)'; b.innerHTML = '<span class="btn-icon">📡</span><span class="btn-label">LIVE</span>'; b.onclick = open; tb.appendChild(b);
    }
    const boot = () => { mount(); if (/^#live\b/.test(location.hash)) open(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 300)); else setTimeout(boot, 300);
    addEventListener('load', mount); addEventListener('hashchange', () => { if (/^#live\b/.test(location.hash)) open(); });
    return { open, close, start, stop: halt, stream: () => S, video: () => ov && ov.querySelector('video') };
})();
