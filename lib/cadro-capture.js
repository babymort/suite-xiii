// SUITE XIII — module commun. Source : xiii-src/cadro-capture.js
// =====================================================================
//  SUITE XIII — CADRO LIVE · captures et rapports (saison 6, phase L)
//  Bouton « 📸 Capture » du moniteur (ou K) : fige l'image affichée (étalonnée si l'étalonnage est actif) et prépare :
//   · ⬇️ PNG « image + scopes » : image, forme d'onde, parade, vecteurscope, histogramme et fiche technique sur une planche ;
//   · ⬇️ PNG image seule (pleine résolution) ;
//   · 📄 fiche de raccord à imprimer / enregistrer en PDF (habillage de la charte du projet) : image, scopes, réglages,
//     séquence / plan / prise, notes ;
//   · 📚 envoi à DOSSIER (rubrique proposée par DOSSIER) et 🖼️ envoi à STORYBOARDO (un plan par image, image en fond de case).
//  Rien n'est envoyé hors de l'appareil : DOSSIER et STORYBOARDO sont ouverts dans le même navigateur.
// =====================================================================
const XCCAP = (() => {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    let shot = null;
    const css = () => { if (document.getElementById('xcc-css')) return; const s = document.createElement('style'); s.id = 'xcc-css';
        s.textContent = '#xcc{position:fixed;inset:0;z-index:2147482500;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif;color:#e8e8e8}#xcc .b{width:min(980px,95vw);max-height:92vh;overflow-y:auto;background:#151518;border:1px solid #333;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.6);padding:16px 18px}' +
            '#xcc h3{margin:0 0 10px;font:600 16px system-ui}#xcc img{width:100%;border-radius:8px;border:1px solid #333;display:block}#xcc .g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}#xcc label{display:flex;flex-direction:column;gap:3px;font-size:11.5px;opacity:.9}#xcc input,#xcc textarea{background:#1d1d22;border:1px solid #3a3a42;border-radius:7px;color:inherit;padding:6px 8px;font:13px system-ui}#xcc textarea{min-height:52px;resize:vertical}' +
            '#xcc .a{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}#xcc button{padding:7px 12px;border-radius:8px;border:1px solid #3a3a42;background:#1d1d22;color:inherit;cursor:pointer;font:500 12.5px system-ui}#xcc button:hover{border-color:#f0b378}#xcc button.p{background:rgba(240,179,120,.16);border-color:rgba(240,179,120,.55);color:#f6c79a}#xcc .st{margin-top:8px;font-size:12px;min-height:16px;opacity:.85}#xcc .ck{flex-direction:row;align-items:center;gap:6px}';
        document.head.appendChild(s); };
    const fiche = () => { try { const s = JSON.parse(localStorage.getItem('xiii.projets') || 'null'); return s && s.list ? s.list.find(f => f && f.id === s.active) || {} : {}; } catch (e) { return {}; } };
    // ---------- capture ----------
    function grab() {
        const ov = document.getElementById('xcl'), v = ov && ov.querySelector('video'); if (!v || v.hidden || !v.videoWidth) { alert('Aucun signal à capturer : démarrez une source.'); return null; }
        const src = typeof XCGRADE !== 'undefined' ? XCGRADE.src(v) : v, c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
        const tr = (typeof XCLIVE !== 'undefined' && XCLIVE.stream() && XCLIVE.stream().getVideoTracks()[0]) || null;
        const g = typeof XCGRADE !== 'undefined' ? XCGRADE.cfg() : null, sc = typeof XCSCOPES !== 'undefined' ? XCSCOPES.cfg() : { range: 'video', scale: 'ire', tgt: 75 };
        // scopes sur l'image capturée
        const S = {}; if (typeof XCSCOPES !== 'undefined' && XCSCOPES._t) { const T = XCSCOPES._t, sm = document.createElement('canvas'); sm.width = 320; sm.height = 180; const sx = sm.getContext('2d'); sx.drawImage(c, 0, 0, 320, 180); const d = sx.getImageData(0, 0, 320, 180).data; if (d) { const mk = (w, h) => { const x = document.createElement('canvas'); x.width = w; x.height = h; return x; }; S.wave = mk(480, 260); T.wave(S.wave, d, false); S.parade = mk(480, 260); T.wave(S.parade, d, true); S.vec = mk(360, 320); T.vec(S.vec, d); S.hist = mk(480, 200); T.hist(S.hist, d); } }
        let ylo = 0, yhi = 0, n = 0; { const t = document.createElement('canvas'); t.width = 320; t.height = 180; const x = t.getContext('2d'); x.drawImage(c, 0, 0, 320, 180); const d = x.getImageData(0, 0, 320, 180).data; for (let i = 0; i < d.length; i += 4) { const y = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2], e = sc.range === 'video' ? (y - 16) / 219 * 100 : y / 255 * 100; if (e >= 99.5) yhi++; else if (e <= .5) ylo++; n++; } }
        return { c, S, at: new Date(), src: (XCLIVE.stream() && XCLIVE.stream().__stop) || !tr ? 'Mire de démonstration' : (tr.label || 'Source vidéo'), w: c.width, h: c.height, g, clip: yhi / n * 100, crush: ylo / n * 100, sc };
    }
    const gtxt = g => !g || !g.on ? 'Aucun (image source)' : ['Lift ' + (g.liftM >= 0 ? '+' : '') + g.liftM.toFixed(2), 'Gamma ' + g.gamM.toFixed(2), 'Gain ' + g.gainM.toFixed(2), 'Saturation ' + g.sat.toFixed(2), g.wb && g.wb.some(x => Math.abs(x - 1) > .005) ? 'Balance ' + g.wb.map(x => x.toFixed(2)).join(' / ') : '', g.lutOn && g.lutName ? 'LUT « ' + g.lutName + ' » ' + g.lutMix + ' %' : ''].filter(Boolean).join(' · ');
    function meta(s, f) { return [['Projet', (fiche().title || '') + ''], ['Séquence', f.seq], ['Plan', f.plan], ['Prise', f.take], ['Caméra', f.cam], ['Date', s.at.toLocaleString('fr-FR')], ['Source', s.src], ['Image', s.w + ' × ' + s.h], ['Écrêtage', s.clip.toFixed(1) + ' %'], ['Noirs bouchés', s.crush.toFixed(1) + ' %'], ['Étalonnage', gtxt(s.g)], ['Notes', f.note]].filter(r => String(r[1] || '').trim()); }
    // planche « image + scopes »
    function board(s, f) {
        const W = 1920, im = 1280, ih = Math.round(im * s.h / s.w), H = Math.max(ih + 60, 1080), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
        x.fillStyle = '#0d0d10'; x.fillRect(0, 0, W, H); x.drawImage(s.c, 20, 20, im, ih);
        // colonne des scopes : hauteurs fixes pour que tout tienne sur la planche
        let y = 20; const col = 1320, cw = 580, HS = { wave: 236, parade: 236, vec: 330, hist: 190 }; [['wave', 'Forme d\'onde'], ['parade', 'RGB parade'], ['vec', 'Vecteurscope'], ['hist', 'Histogramme']].forEach(([k, l]) => { const z = s.S[k]; if (!z) return; const h = HS[k], w = k === 'vec' ? Math.round(h * z.width / z.height) : cw; x.drawImage(z, col + (cw - w) / 2, y, w, h); x.fillStyle = 'rgba(255,255,255,.6)'; x.font = '600 13px system-ui'; x.fillText(l.toUpperCase(), col + 8, y + 18); y += h + 12; });
        x.fillStyle = '#f0b378'; x.font = '400 30px Georgia,serif'; x.fillText('CADRO LIVE', 20, ih + 62); x.fillStyle = '#ccc'; x.font = '14px system-ui';
        const M = meta(s, f), cols = 2, per = Math.ceil(M.length / cols), CW = im / cols; M.forEach((r, i) => { const cx = 20 + Math.floor(i / per) * CW, cy = ih + 95 + (i % per) * 22; x.fillStyle = '#888'; x.fillText(r[0], cx, cy); x.fillStyle = '#e8e8e8'; let t = String(r[1]).replace(/\n/g, ' · '); while (t.length > 3 && x.measureText(t).width > CW - 130) t = t.slice(0, -2); if (t !== String(r[1]).replace(/\n/g, ' · ')) t += '…'; x.fillText(t, cx + 115, cy); });
        return c;
    }
    const blob = (c, t, q) => new Promise(r => c.toBlob(r, t || 'image/png', q));
    const name = (f, s) => (window.XIII && XIII.safe ? XIII.safe : x => x)('CADRO LIVE' + (f.seq ? ' - Séq ' + f.seq : '') + (f.plan ? ' - Plan ' + f.plan : '') + (f.take ? ' - Prise ' + f.take : '') + ' - ' + s.at.toLocaleString('fr-FR').replace(/[/:]/g, '-'));
    function dl(b, n) { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = n; document.body.appendChild(a); HTMLAnchorElement.prototype.click.call(a); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }
    function sheetHtml(s, f) {
        const sc = k => s.S[k] ? '<figure><img src="' + s.S[k].toDataURL('image/png') + '"><figcaption>' + ({ wave: 'Forme d\'onde', parade: 'RGB parade', vec: 'Vecteurscope', hist: 'Histogramme' })[k] + '</figcaption></figure>' : '';
        return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Fiche de raccord — ' + esc(name(f, s)) + '</title><style>@page{size:A4 landscape;margin:12mm}body{font:11pt system-ui,Helvetica,Arial,sans-serif;color:#111;margin:0}h1{font:400 22pt Georgia,serif;color:#b8651f;margin:0 0 6px}.top{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:12px}td{overflow-wrap:anywhere}.top>img{width:100%;border:1px solid #999}table{border-collapse:collapse;width:100%;font-size:10pt}td{border-bottom:1px solid #ddd;padding:3px 6px;vertical-align:top}td:first-child{color:#666;white-space:nowrap;width:30%}.sc{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}figure{margin:0}figure img{width:100%;background:#000;border-radius:3px}figcaption{font-size:8.5pt;color:#666;text-align:center}</style></head><body>' +
            '<h1>Fiche de raccord</h1><div class="top"><img src="' + s.c.toDataURL('image/jpeg', .9) + '"><table>' + meta(s, f).map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]).replace(/\n/g, '<br>') + '</td></tr>').join('') + '</table></div><div class="sc">' + ['wave', 'parade', 'vec', 'hist'].map(sc).join('') + '</div></body></html>';
    }
    function sheet(s, f) { const w = window.open('', '_blank'); if (!w) { alert('Fenêtre bloquée : autorisez les fenêtres pour ce site.'); return; } w.document.write(sheetHtml(s, f)); w.document.close(); setTimeout(() => { try { w.focus(); w.print(); } catch (e) { } }, 600); }
    async function toDossier(s, f, st) {
        if (!window.XIII || !XIII.put) { st('⚠️ Envoi indisponible ici.'); return; } st('⏳ Préparation…'); const b = await blob(board(s, f)), t = 'Fiche de raccord — ' + (f.seq ? 'Séq. ' + f.seq + ' ' : '') + (f.plan ? 'Plan ' + f.plan : s.at.toLocaleString('fr-FR'));
        const p = { format: 'xiii-link', version: 1, kind: 'document', id: XIII.id(), from: 'cadro', app: 'CADRO XIII', ts: Date.now(), created: new Date().toISOString(), project: { name: fiche().title || '' }, title: t, target: { title: t, keywords: ['raccord', 'image', 'etalonnage', 'cadre', 'photo'] }, key: 'cadro:live:' + s.at.getTime(), file: { name: name(f, s) + '.png', type: 'image/png', blob: b }, html: null, to: 'dossier' };
        try { await XIII.put(p); const ack = await XIII.offer('dossier', p.id); if (ack) { st('✅ Reçu par DOSSIER (déjà ouvert) : choisissez-y la rubrique.'); return; } window.open('dossier.html#xlink=' + p.id, '_blank'); st('✅ Envoyé : DOSSIER s\'est ouvert pour le ranger (aussi dans « 📥 À classer »).'); } catch (e) { st('⚠️ ' + esc(e.message || 'Envoi impossible')); }
    }
    function toStory(s, f, st) {
        const c = document.createElement('canvas'), w = Math.min(1600, s.w); c.width = w; c.height = Math.round(w * s.h / s.w); c.getContext('2d').drawImage(s.c, 0, 0, c.width, c.height);
        let L = []; try { L = JSON.parse(localStorage.getItem('xiii.inbox.cadrolive')) || []; } catch (e) { } L.push({ img: c.toDataURL('image/jpeg', .85), seq: f.seq || '', plan: f.plan || '', notes: [f.note, 'CADRO LIVE · ' + s.at.toLocaleString('fr-FR') + ' · ' + s.src, gtxt(s.g)].filter(Boolean).join('\n'), at: Date.now() });
        try { localStorage.setItem('xiii.inbox.cadrolive', JSON.stringify(L.slice(-12))); } catch (e) { st('⚠️ Image trop lourde pour être transmise (stockage plein).'); return; }
        st('✅ Image prête (' + L.length + ' en attente). <button data-sbgo>🖼️ Ouvrir STORYBOARDO</button>'); const b = document.querySelector('#xcc [data-sbgo]'); if (b) b.onclick = () => window.open('storyboardo.html', '_blank');
    }
    // ---------- fenêtre ----------
    let F = { seq: '', plan: '', take: '', cam: '', note: '' };
    function open() {
        const s = grab(); if (!s) return; shot = s; css(); close();
        const o = document.createElement('div'); o.id = 'xcc'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Capture');
        o.innerHTML = '<div class="b"><h3>📸 Capture — ' + esc(s.at.toLocaleTimeString('fr-FR')) + ' · ' + s.w + ' × ' + s.h + (s.g && s.g.on ? ' · étalonnée' : '') + '</h3><img alt="" src="' + board(s, F).toDataURL('image/jpeg', .85) + '">' +
            '<div class="g"><label>Séquence<input data-f="seq" value="' + esc(F.seq) + '"></label><label>Plan<input data-f="plan" value="' + esc(F.plan) + '"></label><label>Prise<input data-f="take" value="' + esc(F.take) + '"></label><label>Caméra<input data-f="cam" value="' + esc(F.cam) + '" placeholder="A, B…"></label></div><label>Notes<textarea data-f="note" placeholder="Raccord lumière, costume, position…">' + esc(F.note) + '</textarea></label>' +
            '<div class="a"><button class="p" data-a="board">⬇️ PNG image + scopes</button><button data-a="img">⬇️ PNG image seule</button><button data-a="sheet">📄 Fiche de raccord (imprimer / PDF)</button><button data-a="dossier">📚 Envoyer à DOSSIER</button><button data-a="story">🖼️ Envoyer à STORYBOARDO</button><span style="flex:1"></span><button data-a="x">Fermer</button></div><div class="st"></div></div>';
        document.body.appendChild(o); const st = h => { o.querySelector('.st').innerHTML = h; };
        o.querySelectorAll('[data-f]').forEach(i => i.oninput = () => { F[i.dataset.f] = i.value; });
        o.addEventListener('mousedown', e => { if (e.target === o) close(); });
        o.querySelectorAll('[data-a]').forEach(b => b.onclick = async () => { const a = b.dataset.a;
            if (a === 'x') return close(); if (a === 'board') { dl(await blob(board(s, F)), name(F, s) + ' - planche.png'); st('⬇️ Planche téléchargée.'); }
            if (a === 'img') { dl(await blob(s.c), name(F, s) + '.png'); st('⬇️ Image téléchargée.'); } if (a === 'sheet') sheet(s, F); if (a === 'dossier') toDossier(s, F, st); if (a === 'story') toStory(s, F, st); });
        const f = o.querySelector('[data-f=seq]'); if (f) f.focus();
    }
    function close() { const o = document.getElementById('xcc'); if (o) o.remove(); }
    addEventListener('keydown', e => { if (!document.getElementById('xcl')) return; if (e.key === 'Escape' && document.getElementById('xcc')) { e.preventDefault(); e.stopImmediatePropagation(); close(); return; } if (e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target; if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return; if (e.key.toLowerCase() === 'k' && !document.getElementById('xcc')) { e.preventDefault(); e.stopImmediatePropagation(); open(); } }, true);
    const watch = () => new MutationObserver(() => { const o = document.getElementById('xcl'); if (!o || o.querySelector('[data-cap]')) return; const sp = o.querySelector('header .sp'); if (!sp) return; const b = document.createElement('button'); b.dataset.cap = 1; b.className = 'p'; b.title = 'Capture : image + scopes, fiche de raccord, envoi DOSSIER / STORYBOARDO (K)'; b.textContent = '📸 Capture'; b.onclick = open; sp.after(b); }).observe(document.body, { childList: true, subtree: true });
    if (document.body) watch(); else addEventListener('DOMContentLoaded', watch);
    return { open, close, grab, board, sheetHtml };
})();
