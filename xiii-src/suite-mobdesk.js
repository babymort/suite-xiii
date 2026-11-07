// =====================================================================
//  SUITE XIII — 📱 version mobile depuis le bureau pour DEVISO, REPERO et SOUSTITRO (phase ZZ)
//  Les pages téléphone existaient (deviso-m, repero-m, soustitro-m) et annonçaient « bouton 📱 » sur l'ordinateur,
//  mais l'ordinateur ne savait ni envoyer ni récupérer : bouton 📱 Mobile (QR code, lien, fichier) + fusion du retour.
//  XM (échanges bureau ⇄ téléphone) et l'adaptateur générique GMD sont repris tels quels de CASTO.
// =====================================================================
(function () {
if (window.XM) return;
const XQR = (() => {
    const ECC = [[-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
    const BLK = [[-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
        [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
        [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
        [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]];
    const ECL = { L: [0, 1], M: [1, 0], Q: [2, 3], H: [3, 2] };
    const raw = v => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
    const dataCw = (v, e) => Math.floor(raw(v) / 8) - ECC[e][v] * BLK[e][v];
    const bit = (x, i) => ((x >>> i) & 1) !== 0;
    const mul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; };
    const rsDiv = d => { const r = new Array(d - 1).fill(0); r.push(1); let root = 1; for (let i = 0; i < d; i++) { for (let j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = mul(root, 2); } return r; };
    const rsRem = (data, div) => { const r = div.map(() => 0); data.forEach(b => { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= mul(c, f); }); }); return r; };
    function make(text, level) {
        const e = (ECL[level || 'L'] || ECL.L)[0], bytes = Array.from(new TextEncoder().encode(String(text)));
        let ver = 0; for (let v = 1; v <= 40; v++) { const cc = v <= 9 ? 8 : 16; if (4 + cc + 8 * bytes.length <= dataCw(v, e) * 8) { ver = v; break; } }
        if (!ver) return null;
        const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
        put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
        const cap = dataCw(ver, e) * 8; put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
        for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) put(p, 8);
        const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
        // blocs + correction d'erreur
        const nb = BLK[e][ver], el = ECC[e][ver], rc = Math.floor(raw(ver) / 8), ns = nb - rc % nb, sl = Math.floor(rc / nb), div = rsDiv(el), blocks = [];
        for (let i = 0, k = 0; i < nb; i++) { const dl = sl - el + (i < ns ? 0 : 1), dat = data.slice(k, k + dl); k += dl; const ecc = rsRem(dat, div); if (i < ns) dat.push(0); blocks.push(dat.concat(ecc)); }
        const all = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== sl - el || j >= ns) all.push(b[i]); });
        const size = ver * 4 + 17, M = Array.from({ length: size }, () => new Array(size).fill(false)), F = Array.from({ length: size }, () => new Array(size).fill(false));
        const setF = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
        for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
        const finder = (x, y) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy; if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, d !== 2 && d !== 4); } };
        finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
        let ap = []; if (ver > 1) { const n = Math.floor(ver / 7) + 2, st = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2; ap = [6]; for (let p = size - 7; ap.length < n; p -= st) ap.splice(1, 0, p); }
        ap.forEach((x, i) => ap.forEach((y, j) => { if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) return; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }));
        const fmt = mask => {
            const d = (ECL[level || 'L'][1] << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const b = ((d << 10) | r) ^ 0x5412;
            for (let i = 0; i <= 5; i++) setF(8, i, bit(b, i)); setF(8, 7, bit(b, 6)); setF(8, 8, bit(b, 7)); setF(7, 8, bit(b, 8)); for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(b, i));
            for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(b, i)); for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(b, i)); setF(8, size - 8, true);
        };
        fmt(0);
        if (ver >= 7) { let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); const b = (ver << 12) | r; for (let i = 0; i < 18; i++) { const c = bit(b, i), a = size - 11 + i % 3, d = Math.floor(i / 3); setF(a, d, c); setF(d, a, c); } }
        for (let i = 0, right = size - 1; right >= 1; right -= 2) { if (right === 6) right = 5; for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) { const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert; if (!F[y][x] && i < all.length * 8) { M[y][x] = bit(all[i >>> 3], 7 - (i & 7)); i++; } } }
        const inv = (m, x, y) => [(x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0, (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, x * y % 2 + x * y % 3 === 0, (x * y % 2 + x * y % 3) % 2 === 0, ((x + y) % 2 + x * y % 3) % 2 === 0][m];
        const apply = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && inv(m, x, y)) M[y][x] = !M[y][x]; };
        const penalty = () => {
            let p = 0, dark = 0;
            for (let y = 0; y < size; y++) { let run = 1; for (let x = 1; x < size; x++) { if (M[y][x] === M[y][x - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
            for (let x = 0; x < size; x++) { let run = 1; for (let y = 1; y < size; y++) { if (M[y][x] === M[y - 1][x]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
            for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; }
            for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (M[y][x]) dark++;
            p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10; return p;
        };
        let best = 0, bp = Infinity; for (let m = 0; m < 8; m++) { apply(m); fmt(m); const p = penalty(); if (p < bp) { bp = p; best = m; } apply(m); }
        apply(best); fmt(best);
        return { size, ver, get: (x, y) => x >= 0 && y >= 0 && x < size && y < size && M[y][x] };
    }
    function svg(text, o) {
        o = o || {}; const q = make(text, o.ecl || 'L'); if (!q) return null; const b = o.border == null ? 4 : o.border, n = q.size + 2 * b; let d = '';
        for (let y = 0; y < q.size; y++) { let x = 0; while (x < q.size) { if (q.get(x, y)) { let w = 1; while (x + w < q.size && q.get(x + w, y)) w++; d += 'M' + (x + b) + ',' + (y + b) + 'h' + w + 'v1h-' + w + 'z'; x += w; } else x++; } }
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="' + n + '" height="' + n + '" fill="' + (o.light || '#fff') + '"/><path d="' + d + '" fill="' + (o.dark || '#000') + '"/></svg>';
    }
    return { make, svg, capacity: (level) => { const e = (ECL[level || 'L'] || ECL.L)[0]; return dataCw(40, e) - 3; } };
})();
window.XM = (() => {
    const FORMAT = 'xiii-mobile', QR_MAX = 1800;
    const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const uid = () => Math.random().toString(36).slice(2, 10);
    const safe = s => String(s || 'projet').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'projet';
    const isPhone = () => { try { return matchMedia('(max-width:700px)').matches && matchMedia('(pointer:coarse)').matches; } catch (e) { return false; } };
    // ---------- encodage ----------
    const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    const unb64u = t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
    async function pipe(u8, Ctor, fmt) { const st = new Blob([u8]).stream().pipeThrough(new Ctor(fmt)); return new Uint8Array(await new Response(st).arrayBuffer()); }
    async function pack(obj) {
        const u8 = new TextEncoder().encode(JSON.stringify(obj));
        if (typeof CompressionStream !== 'undefined') { try { return 'z' + b64u(await pipe(u8, CompressionStream, 'deflate-raw')); } catch (e) { } }
        return 'r' + b64u(u8);
    }
    async function unpack(s) {
        s = String(s || '').trim(); if (!s) throw new Error('Lien vide');
        let u8 = unb64u(s.slice(1)); if (s[0] === 'z') u8 = await pipe(u8, DecompressionStream, 'deflate-raw'); else if (s[0] !== 'r') throw new Error('Lien non reconnu');
        return JSON.parse(new TextDecoder().decode(u8));
    }
    const baseUrl = page => { const u = new URL(page || location.pathname.split('/').pop(), location.href); u.hash = ''; u.search = ''; return u.href; };
    const envelope = (app, kind, name, data) => ({ format: FORMAT, v: 1, app, kind: kind || 'project', name: name || '', ts: Date.now(), data });
    async function link(page, env) { return baseUrl(page) + '#mx=' + await pack(env); }
    function checkEnv(env, app) {
        if (!env || env.format !== FORMAT) throw new Error('Ce fichier n\'est pas un envoi SUITE XIII mobile');
        if (app && env.app !== app) throw new Error('Cet envoi est destiné à « ' + env.app + ' », pas à « ' + app + ' »');
        return env;
    }
    // ---------- stockage local (une enveloppe par application) ----------
    const mem = {};
    const load = app => { try { return JSON.parse(localStorage.getItem('xiii.m.' + app)); } catch (e) { return mem[app] || null; } };
    const save = (app, obj) => { mem[app] = obj; try { localStorage.setItem('xiii.m.' + app, JSON.stringify(obj)); return true; } catch (e) { return false; } };
    const drop = app => { delete mem[app]; try { localStorage.removeItem('xiii.m.' + app); } catch (e) { } };
    // ---------- interface ----------
    let toastT;
    function toast(msg, ms) { let t = $('.m-toast'); if (!t) { t = document.createElement('div'); t.className = 'm-toast'; document.body.appendChild(t); } t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms || 2600); }
    function sheet(html, o) {
        o = o || {}; closeSheet(); const ov = document.createElement('div'); ov.className = 'm-ov'; ov.id = 'm-ov';
        ov.innerHTML = '<div class="m-sheet" role="dialog"><div class="grab"></div>' + (o.title ? '<h2><span class="grow">' + o.title + '</span><button class="m-ibtn plain" data-x aria-label="Fermer">✕</button></h2>' : '') + html + '</div>';
        ov.addEventListener('mousedown', e => { if (e.target === ov) closeSheet(); }); ov.addEventListener('touchstart', e => { if (e.target === ov) closeSheet(); }, { passive: true });
        document.body.appendChild(ov); const x = $('[data-x]', ov); if (x) x.onclick = closeSheet; ov._onClose = o.onClose; return ov.querySelector('.m-sheet');
    }
    function closeSheet() { const ov = $('#m-ov'); if (ov) { ov.remove(); if (ov._onClose) try { ov._onClose(); } catch (e) { } } }
    // choix : renvoie l'index du bouton (ou -1 si fermé)
    function ask(title, text, buttons) {
        return new Promise(res => {
            const s = sheet('<p style="margin:0 0 14px;color:var(--text-muted)">' + text + '</p><div class="m-actions" style="margin-top:0">' + (buttons || ['OK']).map((b, i) => '<button class="m-btn ' + (i === 0 ? 'primary' : '') + (b.danger ? ' danger' : '') + '" data-i="' + i + '">' + esc(b.label || b) + '</button>').join('') + '</div>', { title: esc(title), onClose: () => res(-1) });
            $$('[data-i]', s).forEach(b => b.onclick = () => { const ov = $('#m-ov'); if (ov) ov._onClose = null; closeSheet(); res(+b.dataset.i); });
        });
    }
    function download(name, content, mime) { const b = content instanceof Blob ? content : new Blob([content], { type: mime || 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(a.href); }, 1500); }
    async function copy(text) { try { await navigator.clipboard.writeText(text); return true; } catch (e) { const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { } t.remove(); return ok; } }
    function pickFile(accept, cb) { const i = document.createElement('input'); i.type = 'file'; i.accept = accept || '.json,application/json'; i.style.display = 'none'; i.onchange = async () => { const f = i.files[0]; i.remove(); if (f) cb(f); }; document.body.appendChild(i); i.click(); }
    async function readEnvFile(f, app) { return checkEnv(JSON.parse(await f.text()), app); }
    // ---------- fenêtre d'envoi : QR + lien + fichier (bureau et mobile) ----------
    //  cfg = { app, page, title, kind, name, make: () => data | null, note, empty }
    async function send(cfg) {
        const data = cfg.make(); if (data == null) { toast(cfg.empty || 'Rien à envoyer'); return; }
        const env = envelope(cfg.app, cfg.kind || 'project', cfg.name ? (typeof cfg.name === 'function' ? cfg.name() : cfg.name) : '', data);
        const url = await link(cfg.page, env), json = JSON.stringify(env), qr = url.length <= QR_MAX ? XQR.svg(url, { ecl: 'L', border: 2 }) : null, mob = document.body.classList.contains('xm');
        const fname = cfg.file || ((cfg.title || cfg.app) + '_' + safe(env.name) + '.xiii-m.json').replace(/\s+/g, '_');
        const body = (qr ? '<div class="m-qr">' + qr + '</div><p class="m-hint" style="text-align:center;margin:4px 0 12px">Scannez ce code avec l\'appareil photo' + (cfg.kind === 'return' ? ' de l\'ordinateur' : ' du téléphone') + '.' + (url.length > 1100 ? ' Code dense : affichez-le en grand.' : '') + '</p>'
            : '<div class="m-card" style="margin-top:0"><b>Trop volumineux pour un QR code</b><p class="m-hint" style="margin:6px 0 0">' + (url.length < 8000 ? 'Utilisez le lien (message, mail, AirDrop…) ou le fichier ci-dessous.' : 'Utilisez le fichier ci-dessous (AirDrop, mail, cloud…) : le lien serait trop long.') + '</p></div>') +
            '<div class="m-actions" style="margin-top:0">' + (url.length < 8000 ? '<button class="m-btn" id="xm-copy">🔗 Copier le lien</button>' : '') + ((navigator.share && mob) ? '<button class="m-btn" id="xm-share">📤 Partager…</button>' : '') + '<button class="m-btn primary" id="xm-file">⬇️ Fichier</button>' + (typeof XQT !== 'undefined' ? '<button class="m-btn" id="xm-qra" title="Transfert sans réseau : suite de QR codes animés à scanner avec le téléphone (SUITE XIII › Accueil › 📷 Scanner)">📲 QR animé</button>' : '') + '</div>' +
            (cfg.note ? '<p class="m-hint" style="margin:12px 2px 0">' + cfg.note + '</p>' : '') + '<p class="m-hint" style="margin:8px 2px 0">' + (json.length / 1024 < 10 ? Math.max(1, Math.round(json.length / 102.4) / 10) : Math.round(json.length / 1024)) + ' Ko · le projet n\'est pas envoyé sur Internet : tout est dans le lien ou le fichier.</p>';
        const s = host(body, '📱 ' + esc(cfg.heading || (cfg.kind === 'return' ? 'Renvoyer au bureau' : 'Envoyer vers le mobile')), mob);
        const q = id => $(id, s.ov || s);
        const c = q('#xm-copy'); if (c) c.onclick = async () => toast(await copy(url) ? '🔗 Lien copié' : '⚠️ Copie impossible : utilisez le fichier');
        const sh = q('#xm-share'); if (sh) sh.onclick = async () => { try { await navigator.share({ title: cfg.title || cfg.app, text: cfg.title || cfg.app, url }); } catch (e) { } };
        q('#xm-file').onclick = () => { download(fname, json, 'application/json'); toast('⬇️ Fichier enregistré'); };
        const qa = q('#xm-qra'); if (qa) qa.onclick = () => XQT.sendText(fname, json);
    }
    // fenêtre : feuille du bas sur mobile, boîte centrée sur le bureau (styles en ligne : aucun CSS requis)
    function host(html, title, mob) {
        if (mob) { const s = sheet(html, { title }); s.ov = s.parentNode; return s; }
        const old = document.getElementById('xm-d-ov'); if (old) old.remove();
        const ov = document.createElement('div'); ov.id = 'xm-d-ov'; ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10060;display:flex;align-items:center;justify-content:center;';
        ov.innerHTML = '<div style="background:var(--bg-menu,#2d2d2d);color:var(--text-main,#fff);width:520px;max-width:94vw;max-height:90vh;overflow-y:auto;border-radius:10px;border:1px solid var(--border-color,#444);padding:20px;box-shadow:0 4px 18px rgba(0,0,0,.5);font-size:13.5px;font-family:inherit;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid var(--border-color,#444);padding-bottom:8px;"><b style="font-size:15px;">' + title + '</b><span data-x style="cursor:pointer;font-weight:bold;color:var(--text-muted,#aaa);padding:0 4px;">✕</span></div><div class="xm-d">' + html + '</div></div>';
        ov.addEventListener('mousedown', e => { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov); $('[data-x]', ov).onclick = () => ov.remove();
        const s = $('.xm-d', ov); s.ov = ov; if (!document.getElementById('xm-d-css')) { const st = document.createElement('style'); st.id = 'xm-d-css'; st.textContent = '#xm-d-ov .m-qr{background:#fff;border-radius:10px;padding:6px;width:min(100%,340px);margin:6px auto}#xm-d-ov .m-qr svg{display:block;width:100%;height:auto}#xm-d-ov .m-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}#xm-d-ov .m-actions>*{flex:1 1 130px}#xm-d-ov .m-btn{padding:9px 12px;font-size:13.5px;border-radius:8px;border:1px solid var(--btn-border,rgba(240,179,120,.35));background:var(--btn-bg,rgba(240,179,120,.12));color:inherit;cursor:pointer;font-weight:600}#xm-d-ov .m-btn.primary{border-color:rgba(240,179,120,.85);background:rgba(240,179,120,.28)}#xm-d-ov .m-hint{font-size:12px;color:var(--text-dim,#888);line-height:1.45}#xm-d-ov .m-card{border:1px solid var(--border-color,#444);border-radius:8px;padding:10px 12px;background:var(--bg-panel-alt,#252525);margin:10px 0}#xm-d-ov .m-sec{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-dim,#888);margin:16px 2px 6px}'; document.head.appendChild(st); }
        return s;
    }
    // ---------- réception : lien (#mx=…), fichier ou lien collé ----------
    async function fromHash(app, onEnv) {
        if (/^#qrx/.test(location.hash || '')) { // fichier reçu par QR animés (XQT) puis « Ouvrir dans … »
            try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
            let t = null; try { t = localStorage.getItem('xiii.qrx.pending'); localStorage.removeItem('xiii.qrx.pending'); } catch (e) { }
            if (t) { try { const env = checkEnv(JSON.parse(t), app); await onEnv(env, 'file'); } catch (e) { toast('⚠️ ' + (e.message || 'Fichier illisible'), 4500); } return true; }
        }
        const m = /[#&]mx=([\w-]+)/.exec(location.hash || ''); if (!m) return false;
        try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
        try { const env = checkEnv(await unpack(m[1]), app); await onEnv(env, 'link'); } catch (e) { toast('⚠️ ' + (e.message || 'Lien illisible'), 4500); }
        return true;
    }
    function importFile(app, onEnv) { pickFile('.json,application/json', async f => { try { await onEnv(await readEnvFile(f, app), 'file'); } catch (e) { toast('⚠️ ' + (e.message || 'Fichier illisible'), 4500); } }); }
    async function importLink(app, onEnv) {
        const mob = document.body.classList.contains('xm');
        const s = host('<label class="m-field" style="display:block;margin-bottom:10px"><span class="m-hint">Collez le lien reçu</span><textarea id="xm-paste" rows="4" style="width:100%;box-sizing:border-box;font-size:16px;padding:10px;border-radius:8px;border:1px solid var(--border-color,#444);background:var(--bg-input,#3a3a3a);color:inherit"></textarea></label><div class="m-actions"><button class="m-btn primary" id="xm-pgo">Importer</button></div>', '🔗 Importer un lien', mob);
        $('#xm-pgo', s.ov || s).onclick = async () => { const v = $('#xm-paste', s.ov || s).value, m = /mx=([\w-]+)/.exec(v) || [0, v.trim()]; try { const env = checkEnv(await unpack(m[1]), app); if (s.ov) s.ov.remove(); closeSheet(); await onEnv(env, 'link'); } catch (e) { toast('⚠️ ' + (e.message || 'Lien illisible'), 4500); } };
    }
    // ---------- panneau « 📱 Mobile » des outils bureau ----------
    //  cfg = { app, page, title, name:()=>'', make:()=>data|null, apply:async(env)=>message, note }
    function desktopPanel(cfg) {
        const s = host('<p class="m-hint" style="margin:0 0 10px">Emportez ce projet sur le téléphone : ouvrez la <b>version mobile</b> de ' + esc(cfg.title) + ' en scannant un QR code, en ouvrant un lien ou en important un fichier.</p>' +
            '<div class="m-actions" style="margin-top:0"><button class="m-btn primary" id="xm-go">📱 Envoyer vers le mobile</button><button class="m-btn" id="xm-open">↗ Ouvrir la version mobile ici</button></div>' +
            (cfg.apply ? '<div class="m-sec">Récupérer ce qui a été fait sur le mobile</div><div class="m-actions" style="margin-top:0"><button class="m-btn" id="xm-ifile">📂 Importer un fichier</button><button class="m-btn" id="xm-ilink">🔗 Coller un lien</button></div><p class="m-hint" style="margin:8px 2px 0">' + (cfg.returnNote || 'Sur le mobile, « Renvoyer au bureau » produit le fichier ou le lien à importer ici.') + '</p>' : ''), '📱 Version mobile — ' + esc(cfg.title), false);
        const q = id => $(id, s.ov);
        q('#xm-go').onclick = () => { s.ov.remove(); send({ app: cfg.app, page: cfg.page, title: cfg.title, name: cfg.name, make: cfg.make, note: cfg.note, empty: cfg.empty }); };
        q('#xm-open').onclick = async () => { const d = cfg.make(); if (d == null) { toast(cfg.empty || 'Rien à envoyer'); return; } s.ov.remove(); window.open(await link(cfg.page, envelope(cfg.app, 'project', typeof cfg.name === 'function' ? cfg.name() : cfg.name, d)), '_blank'); };
        if (cfg.apply) { const ap = async env => { s.ov && s.ov.remove(); const m = await cfg.apply(env); if (m) toast(m, 5000); }; q('#xm-ifile').onclick = () => importFile(cfg.app, ap); q('#xm-ilink').onclick = () => { s.ov.remove(); importLink(cfg.app, async env => { const m = await cfg.apply(env); if (m) toast(m, 5000); }); }; }
    }
    // retour par lien sur le bureau (#mx=… de type return)
    function desktopBoot(cfg) { return fromHash(cfg.app, async env => { if (env.kind === 'return' && cfg.apply) { const m = await cfg.apply(env); if (m) toast(m, 5000); } }); }
    // ---------- thème, en-tête et menu des pages mobiles ----------
    function initTheme() { let p = {}; try { p = JSON.parse(localStorage.getItem('hubXIII.prefs')) || {}; } catch (e) { } document.body.classList.add('xm'); document.body.classList.toggle('light-theme', p.theme === 'light'); const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = p.theme === 'light' ? '#ffffff' : '#222222'; }
    function toggleTheme() { let p = {}; try { p = JSON.parse(localStorage.getItem('hubXIII.prefs')) || {}; } catch (e) { } p.theme = p.theme === 'light' ? 'dark' : 'light'; try { localStorage.setItem('hubXIII.prefs', JSON.stringify(p)); } catch (e) { } initTheme(); }
    //  menu standard ⋯ : cfg = { app, deskPage, items:[{icon,label,sub,run}] , onImport(env, via) , sendReturn() }
    function menu(cfg) {
        const items = (cfg.items || []).concat([
            cfg.onImport ? { icon: '📂', label: 'Importer un fichier', sub: 'Envoi du bureau (.xiii-m.json)', run: () => importFile(cfg.app, cfg.onImport) } : null,
            cfg.onImport ? { icon: '🔗', label: 'Coller un lien', sub: 'Lien ou QR reçu du bureau', run: () => importLink(cfg.app, cfg.onImport) } : null,
            cfg.sendReturn ? { icon: '📤', label: 'Renvoyer au bureau', sub: 'QR code, lien ou fichier', run: cfg.sendReturn } : null,
            { icon: '🌓', label: 'Thème clair / sombre', run: toggleTheme },
            cfg.deskPage ? { icon: '🖥️', label: 'Version bureau', sub: 'Interface complète', run: () => { try { sessionStorage.setItem('xiiiDesk', '1'); } catch (e) { } location.href = cfg.deskPage + '?desktop=1'; } } : null,
            { icon: '🏠', label: 'Accueil SUITE XIII', run: () => { location.href = 'index.html'; } }].filter(Boolean));
        const s = sheet('<div class="m-list" style="margin:0">' + items.map((it, i) => '<button class="m-item" data-i="' + i + '"><span class="ico">' + it.icon + '</span><span class="grow"><b>' + esc(it.label) + '</b>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</span></button>').join('') + '</div><p class="m-credit">Application développée par Matthieu Lamotte</p>', { title: 'Menu' });
        $$('[data-i]', s).forEach(b => b.onclick = () => { closeSheet(); setTimeout(() => items[+b.dataset.i].run(), 60); });
    }
    return { FORMAT, $, $$, esc, uid, safe, isPhone, pack, unpack, link, envelope, checkEnv, load, save, drop, toast, sheet, closeSheet, ask, download, copy, pickFile, readEnvFile, send, host, fromHash, importFile, importLink, desktopPanel, desktopBoot, initTheme, toggleTheme, menu };
})();
const XM = window.XM;
function GMD(CFG) {
    if (typeof XM === 'undefined' || typeof P === 'undefined' || window['__gmd' + CFG.app]) return; window['__gmd' + CFG.app] = 1;
    const APP = CFG.app, pick = (o, fs) => { const r = { id: o.id }; fs.forEach(f => { if (o[f.k] !== undefined) r[f.k] = JSON.parse(JSON.stringify(o[f.k])); }); return r; };
    const arr = k => (Array.isArray(P[k]) ? P[k] : (P[k] = []));
    function make() {
        const cols = {}; let n = 0;
        CFG.cols.forEach(c => { cols[c.key] = arr(c.key).filter(x => x && x.id).map(x => { n++; return pick(x, c.fields); }); });
        if (!n && !CFG.blank) return null;
        return { name: P.name || '', cols, extra: CFG.extra ? CFG.extra(P) : {} };
    }
    async function apply(env) {
        if (env.kind !== 'return' || !env.data || !env.data.cols) return '⚠️ Ce fichier n\'est pas un retour du mobile';
        let mod = 0, add = 0;
        try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { }
        CFG.cols.forEach(c => (env.data.cols[c.key] || []).forEach(x => {
            const L = arr(c.key), cur = L.find(o => o.id === x.id);
            if (cur) { c.fields.forEach(f => { if (x[f.k] === undefined) return;
                if (f.t === 'list' && Array.isArray(x[f.k])) { const m = new Map((cur[f.k] || []).map(s => [s.id, s])); x[f.k].forEach(s => { if (m.has(s.id)) Object.assign(m.get(s.id), s); else (cur[f.k] = cur[f.k] || []).push(s); }); }
                else cur[f.k] = x[f.k]; }); mod++; }
            else if (x._new) { const o = Object.assign(c.add ? c.add(P, {}) : {}, x); delete o._new; L.push(o); add++; }
        }));
        try { if (typeof dirty === 'function') dirty(); } catch (e) { } try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { } try { if (typeof renderAll === 'function') renderAll(); else if (typeof render === 'function') render(); } catch (e) { }
        return '📱 Retour du mobile fusionné : ' + mod + ' modifié(s), ' + add + ' ajouté(s)';
    }
    function openMobile() {
        try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { }
        XM.desktopPanel({ app: APP, page: APP + '-m.html', title: CFG.title, name: () => P.name || CFG.title, make, apply, empty: CFG.empty || 'Rien à envoyer pour l\'instant',
            note: CFG.note || 'Le téléphone reçoit une version légère (' + CFG.cols.map(c => c.label.toLowerCase()).join(', ') + '), utilisable hors ligne.',
            returnNote: 'Sur le téléphone : « Renvoyer au bureau » (QR, lien ou fichier). Seuls les champs modifiés et les ajouts sont fusionnés.' });
    }
    window['gmOpen_' + APP] = openMobile;
    const addBtn = () => { if (document.getElementById('xm-btn')) return true; const ref = [...document.querySelectorAll('#top-bar button')].find(b => /💾/.test(b.textContent)); if (!ref) return false;
        const b = document.createElement('button'); b.id = 'xm-btn'; b.onclick = openMobile; b.title = 'Version mobile : emporter ' + CFG.title + ' sur le téléphone (QR code, lien, fichier) et récupérer ce qui y a été fait';
        b.innerHTML = '<span class="btn-icon">📱</span><span class="btn-label">Mobile</span>'; ref.parentNode.insertBefore(b, ref); return true; };
    if (!addBtn()) setTimeout(addBtn, 800);
    XM.desktopBoot({ app: APP, apply });
}
const APPX = '__APP__';
// ---------- SOUSTITRO : adaptateur générique (liste des sous-titres, corrections fusionnées par identifiant) ----------
if (APPX === 'soustitro') GMD({ app: 'soustitro', title: 'SOUSTITRO', cols: [{ key: 'cues', label: 'Sous-titres', fields: [{ k: 't' }, { k: 's' }, { k: 'e' }], add: () => ({ t: '', s: 0, e: 1 }) }], empty: 'Aucun sous-titre à envoyer' });
// bouton 📱 dans la barre (repris par ⚙️ › Version mobile quand la barre le range)
function btn(title, open) { const add = () => { if (document.getElementById('xm-btn')) return true; const ref = [...document.querySelectorAll('#top-bar button')].find(b => /💾/.test(b.textContent)); if (!ref) return false;
    const b = document.createElement('button'); b.id = 'xm-btn'; b.onclick = open; b.title = 'Version mobile : emporter ' + title + ' sur le téléphone (QR code, lien, fichier) et récupérer ce qui y a été fait';
    b.innerHTML = '<span class="btn-icon">📱</span><span class="btn-label">Mobile</span>'; ref.parentNode.insertBefore(b, ref); return true; }; if (!add()) setTimeout(add, 800); }
const save = () => { try { if (typeof dirty === 'function') dirty(); } catch (e) { } try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { } try { if (typeof renderAll === 'function') renderAll(); else if (typeof render === 'function') render(); } catch (e) { } };
const clone = o => JSON.parse(JSON.stringify(o));
// ---------- DEVISO : le devis ouvert part sur le téléphone ; au retour, ses versions s'ajoutent au devis (ou le remplacent) ----------
if (APPX === 'deviso') {
    const apply = async env => {
        const d = env.data || {}, p = d.project; if (env.kind !== 'return' || !p || !Array.isArray(p.versions)) return '⚠️ Ce fichier n\'est pas un retour de DEVISO mobile';
        const same = P && p.id && P.id === p.id, i = await XM.ask('📱 Estimatif du téléphone', '« ' + XM.esc(p.name || 'Estimatif mobile') + ' » : ' + p.versions.length + ' version(s).' + (same ? ' C\'est le devis ouvert, modifié sur le téléphone.' : ''), ['Ajouter ses versions au devis ouvert', { label: 'Remplacer le devis ouvert', danger: true }, 'Annuler']);
        if (i === 0) { const ids = new Set(P.versions.map(v => v.id)); let n = 0; p.versions.forEach(v => { const c = clone(v); if (ids.has(c.id)) { c.id = Math.random().toString(36).slice(2, 10); } c.name = (c.name || 'Version') + ' (mobile)'; P.versions.push(c); n++; }); save(); return '📱 ' + n + ' version(s) du téléphone ajoutée(s) au devis — rien n\'a été remplacé'; }
        if (i === 1) { const keep = P.id; try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { } P = Object.assign(clone(p), { id: keep }); if (!P.versions.some(v => v.id === P.cur)) P.cur = P.versions[0] && P.versions[0].id; save(); return '📱 Devis remplacé par la version du téléphone (Ctrl+Z pour revenir)'; }
        return '';
    };
    const open = () => { try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { }
        XM.desktopPanel({ app: 'deviso', page: 'deviso-m.html', title: 'DEVISO', name: () => P.name || 'Devis', make: () => (P && (P.versions || []).length ? { project: clone(P), base: null } : null), apply, empty: 'Le devis est vide',
            note: 'Le téléphone reçoit le devis ouvert (toutes ses versions), utilisable hors ligne : chiffrage rapide sur place, puis « Renvoyer au bureau ».',
            returnNote: 'Sur le téléphone : ⋯ › « Renvoyer au bureau » (QR, lien ou fichier). Vous choisirez d\'ajouter les versions au devis ou de le remplacer.' }); };
    btn('DEVISO', open); const boot = () => XM.desktopBoot({ app: 'deviso', apply }); if (window.XBOOT && XBOOT.ready) XBOOT.ready(boot, 2950); else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 300)); else setTimeout(boot, 300);
}
// ---------- REPERO : les lieux partent sur le téléphone (sans les photos) ; au retour : lieux créés, champs modifiés, photos prises sur place ----------
if (APPX === 'repero') {
    const F = ['name', 'cat', 'status', 'rating', 'address', 'city', 'cp', 'date', 'access', 'owner', 'qualite', 'phone', 'email', 'tech'];
    const apply = async env => {
        const d = env.data || {}; if (env.kind !== 'return' || !d.patch) return '⚠️ Ce fichier n\'est pas un retour de REPERO mobile';
        try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { }
        let c = 0, m = 0, ph = 0, conf = 0; const byId = id => (P.spots || []).find(s => s.id === id);
        (d.created || []).forEach(s => { if (byId(s.id)) return; const o = Object.assign({ chk: {}, chkN: {}, photos: [], tech: {}, radius: 1500, notes: '' }, clone(s)); o.photos = []; P.spots.push(o); c++; });
        Object.keys(d.patch).forEach(id => { const s = byId(id), p = d.patch[id]; if (!s) return; F.forEach(f => { if (p[f] !== undefined) s[f] = p[f]; });
            if (p.notes !== undefined) { if (p.n0 !== undefined && String(s.notes || '') !== String(p.n0 || '') && String(s.notes || '') !== String(p.notes || '')) { s.notes = (s.notes ? s.notes + '\n\n' : '') + '📱 Terrain : ' + p.notes; conf++; } else s.notes = p.notes; }
            if (p.lat != null) { s.lat = p.lat; s.lon = p.lon; } if (p.chk) s.chk = Object.assign(s.chk || {}, p.chk); if (p.chkN) s.chkN = Object.assign(s.chkN || {}, p.chkN); m++; });
        (d.ph || []).forEach(x => { const s = byId(x.s); if (!s || !x.d) return; if ((s.photos || []).some(p => p.id === x.id)) return; PH[x.id] = { id: x.id, spot: s.id, data: x.d, w: x.w || 0, h: x.h || 0 }; (s.photos = s.photos || []).push(Object.assign({ id: x.id, cap: x.c || '' }, x.g ? { lat: x.g[0], lon: x.g[1], hd: x.g[2], acc: x.g[3] } : {})); ph++; });
        save(); return '📱 Retour du terrain fusionné : ' + c + ' lieu(x) créé(s), ' + m + ' modifié(s), ' + ph + ' photo(s)' + (conf ? ' · ' + conf + ' note(s) modifiée(s) des deux côtés : les deux versions sont gardées' : '') + ((d.ph || []).some(x => !x.d) ? ' · photos restées sur le téléphone (renvoyer « avec les photos » en fichier)' : '');
    };
    const open = () => { try { if (typeof saveProject === 'function') saveProject(false); } catch (e) { }
        XM.desktopPanel({ app: 'repero', page: 'repero-m.html', title: 'REPERO', name: () => P.name || 'Repérages', make: () => ((P.spots || []).length ? { id: P.id, name: P.name || '', author: P.author || '', info: clone(P.info || {}), spots: P.spots.map(s => { const o = clone(s); o.photos = []; return o; }), an: {} } : null), apply, empty: 'Aucun lieu à emporter',
            note: 'Le téléphone reçoit les lieux (sans les photos, trop lourdes pour un QR code), utilisables hors ligne sur le terrain : checklist, notes, nouvelles photos géolocalisées.',
            returnNote: 'Sur le téléphone : ⋯ › « Renvoyer au bureau ». Les lieux créés, les champs modifiés et (en fichier) les photos sont fusionnés.' }); };
    btn('REPERO', open); const boot = () => XM.desktopBoot({ app: 'repero', apply }); if (window.XBOOT && XBOOT.ready) XBOOT.ready(boot, 2950); else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 300)); else setTimeout(boot, 300);
}
})();
