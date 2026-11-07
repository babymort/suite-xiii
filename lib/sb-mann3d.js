// SUITE XIII — module commun. Source : xiii-src/sb-mann3d.js
// =====================================================================
//  STORYBOARDO XIII — 🧍 Cadre 3D : mannequins à cadrer dans une case
//  Mini-scène 3D : 1 à 4 mannequins articulés (le StickMan de PLANO, mêmes poses), placés au sol ;
//  caméra réglée comme sur un plateau (focale plein format, distance, azimut, hauteur, point visé, roulis).
//  Rendu « trait » (silhouettes pour dessiner par-dessus) ou « ombré », posé en fond de la case avec la focale.
//  Moteur de rendu intégré (aucune bibliothèque à charger) : fonctionne hors ligne. La scène est gardée dans la case.
// =====================================================================
var XM3D = window.XM3D || (() => {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    // poses (mêmes que les personnages 3D de PLANO)
    const P = {
        stand: H => ({ hip: .53 * H, lean: 0, L: [[.245, 3, 5], [.246, 0, 3]], R: [[.245, 3, 5], [.246, 0, 3]], AL: [[.17, 6, 10], [.15, 14, 6]], AR: [[.17, 6, 10], [.15, 14, 6]], tilt: 0 }),
        relax: H => ({ hip: .53 * H, lean: .02, L: [[.245, 8, 5], [.246, 0, 3]], R: [[.245, -4, 3], [.246, -6, 2]], AL: [[.17, 4, 8], [.15, 30, 3]], AR: [[.17, 10, 14], [.15, 55, 8]], tilt: .06 }),
        present: H => ({ hip: .53 * H, lean: 0, L: [[.245, 3, 5], [.246, 0, 3]], R: [[.245, 3, 5], [.246, 0, 3]], AL: [[.17, 25, 28], [.15, 70, 36]], AR: [[.17, 30, -8], [.15, 135, -3]], tilt: .05 }),
        walk: H => ({ hip: .535 * H, lean: .06, L: [[.245, 26, 2], [.246, 6, 1]], R: [[.245, -22, 2], [.246, -38, 1]], AL: [[.17, -22, 8], [.15, 6, 4]], AR: [[.17, 24, 8], [.15, 52, 4]], tilt: 0 }),
        sit: H => ({ hip: .3 * H, lean: .06, L: [[.245, 88, 5], [.246, 2, 2]], R: [[.245, 88, 3], [.246, 2, 0]], AL: [[.17, 18, 8], [.15, 80, 4]], AR: [[.17, 18, 8], [.15, 80, 4]], tilt: 0, seat: .27 }),
        seat2: H => ({ hip: .3 * H, lean: -.1, L: [[.245, 80, 12], [.246, 10, 6]], R: [[.245, 74, -10], [.246, -14, -12]], AL: [[.17, 10, 12], [.15, 95, 10]], AR: [[.17, 22, 6], [.15, 70, 3]], tilt: .06, seat: .27 }),
        boom: H => ({ hip: .53 * H, lean: -.05, L: [[.245, 5, 6], [.246, 0, 3]], R: [[.245, -4, 6], [.246, -6, 3]], AL: [[.17, 160, 12], [.15, 172, 8]], AR: [[.17, 150, -12], [.15, 165, -8]], tilt: -.18 }),
        dance: H => ({ hip: .53 * H, lean: -.12, L: [[.245, 3, 8], [.246, 0, 4]], R: [[.245, 60, 24], [.246, -20, 20]], AL: [[.17, 150, 60], [.15, 160, 70]], AR: [[.17, 40, 70], [.15, 40, 100]], tilt: .2, turn: .35 }),
        guitar: H => ({ hip: .3 * H, lean: .04, L: [[.245, 88, 8], [.246, 2, 2]], R: [[.245, 92, 5], [.246, -4, 0]], AL: [[.17, 30, 14], [.15, 100, -20]], AR: [[.17, 28, 6], [.15, 88, 30]], tilt: .12, seat: .27 }),
        wheel: H => ({ hip: .27 * H, lean: .02, L: [[.245, 88, 4], [.246, 8, 2]], R: [[.245, 88, 4], [.246, 8, 2]], AL: [[.17, 8, 12], [.15, 48, 12]], AR: [[.17, 8, 12], [.15, 48, 12]], tilt: 0, seat: .24 }),
        cam: H => ({ hip: .53 * H, lean: .02, L: [[.245, 6, 8], [.246, -2, 4]], R: [[.245, -4, 8], [.246, -4, 4]], AL: [[.17, 36, 14], [.15, 105, -6]], AR: [[.17, 50, 8], [.15, 112, 18]], tilt: 0 }),
        point: H => ({ hip: .53 * H, lean: 0, L: [[.245, 3, 5], [.246, 0, 3]], R: [[.245, 3, 5], [.246, 0, 3]], AL: [[.17, 6, 10], [.15, 14, 6]], AR: [[.17, 88, 4], [.15, 92, 2]], tilt: 0 })
    };
    const PL = [['stand', 'Debout'], ['relax', 'Détendu'], ['walk', 'Marche'], ['present', 'Présente / parle'], ['point', 'Montre du doigt'], ['sit', 'Assis'], ['seat2', 'Assis, jambes croisées'], ['dance', 'Danse'], ['guitar', 'Guitare, assis'], ['cam', 'Caméra à l’épaule'], ['boom', 'Perche'], ['wheel', 'Fauteuil']];
    const COLS = ['#d88c5a', '#5a8cd8', '#62b06a', '#b06aa8'];
    const FOC = [14, 18, 24, 28, 35, 50, 85, 135, 200];
    // ---------- géométrie (sans three.js : on lit les tableaux produits par XMAN) ----------
    const T0 = { BufferGeometry: function () { this.a = {}; this.setAttribute = (n, x) => { this.a[n] = x; }; this.setIndex = i => { this.i = i; }; this.computeVertexNormals = () => { }; }, BufferAttribute: function (a, n) { this.array = a; this.itemSize = n; } };
    // groupes pour les traits intérieurs : 0 buste, 1 tête et cou, 2-3 bras, 4-5 jambes
    const BG = [0, 0, 0, 0, 1, 1, 1, 0, 2, 2, 2, 0, 3, 3, 3, 4, 4, 4, 5, 5, 5], GC = new Map(), TG = { v: null };
    function mesh(pose, H) {
        const k = pose + '|' + H; if (GC.has(k)) return GC.get(k);
        const g = XMAN.geometry(T0, (P[pose] || P.stand)(H), H).geo, pos = g.a.position.array, idx = g.i.array, n = pos.length / 3, nor = new Float32Array(n * 3);
        if (!TG.v) { const m = XMAN.load(), vg = new Uint8Array(n); for (let i = 0; i < n; i++) { let b = 0, bw = -1; for (let q = 0; q < 4; q++) if (m.WW[i * 4 + q] > bw) { bw = m.WW[i * 4 + q]; b = m.WI[i * 4 + q]; } vg[i] = BG[b] || 0; }
            const t = new Uint8Array(idx.length / 3); for (let f = 0; f < t.length; f++) { const a = vg[idx[f * 3]], b = vg[idx[f * 3 + 1]], c = vg[idx[f * 3 + 2]]; t[f] = a === b || a === c ? a : b === c ? b : a; } TG.v = t; }
        for (let f = 0; f < idx.length / 3; f++) { const i0 = idx[f * 3] * 3, i1 = idx[f * 3 + 1] * 3, i2 = idx[f * 3 + 2] * 3, ux = pos[i1] - pos[i0], uy = pos[i1 + 1] - pos[i0 + 1], uz = pos[i1 + 2] - pos[i0 + 2], vx = pos[i2] - pos[i0], vy = pos[i2 + 1] - pos[i0 + 1], vz = pos[i2 + 2] - pos[i0 + 2], cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
            for (const i of [i0, i1, i2]) { nor[i] += cx; nor[i + 1] += cy; nor[i + 2] += cz; } }
        for (let i = 0; i < n; i++) { const l = Math.hypot(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]) || 1; nor[i * 3] /= l; nor[i * 3 + 1] /= l; nor[i * 3 + 2] /= l; }
        const out = { pos, idx, nor }; GC.set(k, out); if (GC.size > 60) GC.delete(GC.keys().next().value); return out;
    }
    // ---------- caméra ----------
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nz = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    function camera(C, w, h) {
        const az = C.az * Math.PI / 180, d = C.d * 100, eye = [Math.sin(az) * d + C.tx * 100, C.ch, -Math.cos(az) * d + C.tz * 100], tg = [C.tx * 100, C.th, C.tz * 100];
        const f = nz(sub(tg, eye)); let r = nz(cross(f, [0, 1, 0])); if (!isFinite(r[0]) || Math.hypot(...cross(f, [0, 1, 0])) < 1e-4) r = [1, 0, 0]; let u = cross(r, f);
        const ro = (C.roll || 0) * Math.PI / 180, cr = Math.cos(ro), sr = Math.sin(ro), r2 = [r[0] * cr + u[0] * sr, r[1] * cr + u[1] * sr, r[2] * cr + u[2] * sr], u2 = [u[0] * cr - r[0] * sr, u[1] * cr - r[1] * sr, u[2] * cr - r[2] * sr];
        const fpx = (w / 2) / (18 / C.f);   // plein format : 36 mm de large
        return { eye, f, r: r2, u: u2, fpx, w, h, near: 8 };
    }
    const toCam = (K, p) => { const v = sub(p, K.eye); return [dot(v, K.r), dot(v, K.u), dot(v, K.f)]; };
    const proj = (K, c) => [K.w / 2 + c[0] / c[2] * K.fpx, K.h / 2 - c[1] / c[2] * K.fpx];
    // ---------- rendu ----------
    function draw(cv, S) {
        const w = cv.width, h = cv.height, g = cv.getContext('2d'), K = camera(S.cam, w, h), shade = S.style === 'ombre';
        g.fillStyle = shade ? '#e9e4dc' : '#ffffff'; g.fillRect(0, 0, w, h);
        // sol : horizon + quadrillage tous les 50 cm
        const fh = nz([K.f[0], 0, K.f[2]]), sd = cross(fh, [0, 1, 0]);
        const hz = [-1, 1].map(s => { const p = [K.eye[0] + (fh[0] + sd[0] * s * .5) * 1e7, K.eye[1], K.eye[2] + (fh[2] + sd[2] * s * .5) * 1e7], c = toCam(K, p); return c[2] > 1 ? proj(K, c) : null; });
        if (hz[0] && hz[1]) { const [a, b] = hz, ext = (p, q, x) => p[1] + (q[1] - p[1]) * (x - p[0]) / ((q[0] - p[0]) || 1e-6), yl = ext(a, b, -w), yr = ext(a, b, 2 * w);
            const below = K.eye[1] > 0; g.fillStyle = shade ? '#d6cebf' : '#f3f1ec'; g.beginPath(); if (below) { g.moveTo(-w, yl); g.lineTo(2 * w, yr); g.lineTo(2 * w, 3 * h); g.lineTo(-w, 3 * h); } else { g.moveTo(-w, yl); g.lineTo(2 * w, yr); g.lineTo(2 * w, -2 * h); g.lineTo(-w, -2 * h); } g.closePath(); g.fill();
            g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(1, w / 900); g.beginPath(); g.moveTo(-w, yl); g.lineTo(2 * w, yr); g.stroke(); }
        g.strokeStyle = shade ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.10)'; g.lineWidth = Math.max(1, w / 1400);
        const seg3 = (p, q) => { let a = toCam(K, p), b = toCam(K, q); if (a[2] < K.near && b[2] < K.near) return; if (a[2] < K.near) { const t = (K.near - a[2]) / (b[2] - a[2]); a = a.map((v, i) => v + (b[i] - v) * t); } else if (b[2] < K.near) { const t = (K.near - b[2]) / (a[2] - b[2]); b = b.map((v, i) => v + (a[i] - v) * t); } const A = proj(K, a), B = proj(K, b); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); };
        g.beginPath(); for (let i = -20; i <= 20; i++) { seg3([i * 50, 0, -1000], [i * 50, 0, 1000]); seg3([-1000, 0, i * 50], [1000, 0, i * 50]); } g.stroke();
        // rastérisation logicielle avec tampon de profondeur : couleur lissée (Gouraud) + calque d'identifiants (mannequin × membre) pour les contours
        const N = w * h, ZB = new Float32Array(N).fill(1e30), IDB = new Uint8Array(N), FB = new Float32Array(N), im = g.getImageData(0, 0, w, h), O = im.data, col = S.men.map((m, i) => m.col || COLS[i % 4]), LI = nz([-.4, .85, -.35]);
        S.men.forEach((m, mi) => {
            const M = mesh(m.pose, m.H), a = (m.rot || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), ox = m.x * 100, oz = m.z * 100, n = M.pos.length / 3, Z = new Float32Array(n), SX = new Float32Array(n), SY = new Float32Array(n), LV = new Float32Array(n), FV = new Float32Array(n);
            const hx = parseInt((col[mi] || '#888888').slice(1), 16), CR = hx >> 16, CG = hx >> 8 & 255, CB = hx & 255;
            for (let i = 0; i < n; i++) { const x = M.pos[i * 3], y = M.pos[i * 3 + 1], z = M.pos[i * 3 + 2], wx = x * ca + z * sa + ox, wz = -x * sa + z * ca + oz, c = toCam(K, [wx, y, wz]); Z[i] = c[2]; if (c[2] > K.near) { SX[i] = K.w / 2 + c[0] / c[2] * K.fpx; SY[i] = K.h / 2 - c[1] / c[2] * K.fpx; }
                const nx = M.nor[i * 3] * ca + M.nor[i * 3 + 2] * sa, ny = M.nor[i * 3 + 1], nzz = -M.nor[i * 3] * sa + M.nor[i * 3 + 2] * ca; LV[i] = .38 + .62 * Math.max(0, nx * LI[0] + ny * LI[1] + nzz * LI[2]); const ex = K.eye[0] - wx, ey = K.eye[1] - y, ez = K.eye[2] - wz, el = Math.hypot(ex, ey, ez) || 1; FV[i] = Math.abs(nx * ex + ny * ey + nzz * ez) / el; }
            if (shade) { const c = toCam(K, [ox, 0, oz]); if (c[2] > K.near) { const p = proj(K, c), rr = 35 * K.fpx / c[2]; g.putImageData(im, 0, 0); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(p[0], p[1], rr, rr * Math.max(.15, Math.min(1, K.eye[1] / Math.hypot(K.eye[1], c[2]))), 0, 0, Math.PI * 2); g.fill(); O.set(g.getImageData(0, 0, w, h).data); } }
            const id = M.idx;
            for (let t = 0; t < id.length / 3; t++) { const A = id[t * 3], B = id[t * 3 + 1], C = id[t * 3 + 2]; if (Z[A] < K.near || Z[B] < K.near || Z[C] < K.near) continue;
                const ax = SX[A], ay = SY[A], bx = SX[B], by = SY[B], cx = SX[C], cy = SY[C], ar = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); if (ar >= 0) continue; // face arrière (repère écran, y vers le bas)
                const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(w - 1, Math.ceil(Math.max(ax, bx, cx))), y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy))); if (x0 > x1 || y0 > y1) continue;
                const code = mi * 6 + TG.v[t] + 1, ia = 1 / ar, za = 1 / Z[A], zb = 1 / Z[B], zc = 1 / Z[C];
                for (let y = y0; y <= y1; y++) { const py = y + .5; for (let x = x0; x <= x1; x++) { const px = x + .5;
                    const wa = ((bx - px) * (cy - py) - (by - py) * (cx - px)) * ia, wb = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) * ia, wc = 1 - wa - wb; if (wa < 0 || wb < 0 || wc < 0) continue;
                    const iz = wa * za + wb * zb + wc * zc, zz = 1 / iz, o = y * w + x; if (zz >= ZB[o]) continue; ZB[o] = zz; IDB[o] = code; FB[o] = (wa * FV[A] * za + wb * FV[B] * zb + wc * FV[C] * zc) * zz;
                    const q = o * 4; if (shade) { const l = (wa * LV[A] * za + wb * LV[B] * zb + wc * LV[C] * zc) * zz; O[q] = CR * l; O[q + 1] = CG * l; O[q + 2] = CB * l; } else { O[q] = O[q + 1] = O[q + 2] = 255; } } } }
        });
        // contours : là où l'identifiant change (silhouettes, membres devant le corps, mannequins qui se recouvrent) ou la profondeur saute
        const r = Math.max(1, Math.round(w / 760)), ink = shade ? [25, 22, 20] : [17, 17, 17], ka = shade ? .85 : 1;
        // même mannequin, membres différents : trait seulement s'il y a recouvrement (saut de profondeur), pas sur les raccords d'épaule, de cou ou de hanche
        const jump = (o, o2, t) => ZB[o2] < ZB[o] && ZB[o] - ZB[o2] > Math.max(t, .015 * ZB[o2]);
        const edge = (o, o2) => { const a = IDB[o], b = IDB[o2]; if (a === b) return a && jump(o, o2, 12); if (!a || !b || ((a - 1) / 6 | 0) !== ((b - 1) / 6 | 0)) return true; return jump(o, o2, 1.5) || jump(o2, o, 1.5); };
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = y * w + x; let e = 0;
            if (x >= r && edge(o, o - r)) e++; if (x < w - r && edge(o, o + r)) e++; if (y >= r && edge(o, o - r * w)) e++; if (y < h - r && edge(o, o + r * w)) e++;
            // creux et bords rasants (bras le long du corps, plis) : trait plus léger là où la surface fuit
            let k = e ? ka * Math.min(1, .45 + e * .3) : 0; if (!e && IDB[o] && FB[o] < .2) k = ka * .75 * Math.min(1, (.2 - FB[o]) / .1);
            if (!k) continue; const q = o * 4; for (let c = 0; c < 3; c++) O[q + c] = Math.round(O[q + c] * (1 - k) + ink[c] * k); }
        g.putImageData(im, 0, 0);
        // repères des mannequins (numéros discrets)
        if (S.labels) S.men.forEach((m, i) => { const c = toCam(K, [m.x * 100, m.H + 18, m.z * 100]); if (c[2] < K.near) return; const p = proj(K, c); g.fillStyle = col[i]; g.font = 'bold ' + Math.round(w / 45) + 'px system-ui'; g.textAlign = 'center'; g.fillText(String(i + 1), p[0], p[1]); });
        return cv;
    }
    // ---------- scène par défaut ----------
    const def = () => ({ style: 'trait', labels: false, cam: { f: 35, d: 4, az: 0, ch: 160, th: 120, roll: 0, tx: 0, tz: 0 }, men: [{ pose: 'stand', x: 0, z: 0, rot: 0, H: 175, col: COLS[0] }] });
    // ---------- interface ----------
    function css() {
        if (document.getElementById('xm3d-css')) return; const s = document.createElement('style'); s.id = 'xm3d-css';
        s.textContent = '#xm3d{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font:12.5px system-ui,sans-serif}#xm3d .b{background:var(--bg-panel,#2d2d2d);color:var(--text-main,#eee);border-radius:12px;width:min(1240px,97vw);max-height:94vh;display:flex;flex-direction:column}#xm3d .h{display:flex;gap:8px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border-color,#444)}#xm3d .h b{flex:1;font-size:15px}#xm3d .c{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:12px;padding:12px 14px;overflow:auto}#xm3d canvas{width:100%;border-radius:6px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.3)}#xm3d .s{font-weight:700;margin:10px 0 4px}#xm3d .rw{display:grid;grid-template-columns:96px 1fr 52px;gap:6px;align-items:center;margin:3px 0}#xm3d .rw input[type=range]{width:100%}#xm3d .mn{border:1px solid var(--border-color,#444);border-radius:8px;padding:6px 8px;margin:6px 0}#xm3d .mh{display:flex;gap:6px;align-items:center}#xm3d .mh select{flex:1}#xm3d .f{display:flex;gap:8px;justify-content:flex-end;padding:10px 14px;border-top:1px solid var(--border-color,#444);flex-wrap:wrap;align-items:center}#xm3d .go{background:rgb(var(--accent,240,179,120));color:#111;border:0;border-radius:6px;padding:7px 14px;font-weight:700}#xm3d button{cursor:pointer}#xm3d .fo{display:flex;gap:4px;flex-wrap:wrap}#xm3d .fo button.on{outline:2px solid rgb(var(--accent,240,179,120))}#xm3d .d{opacity:.7}';
        document.head.appendChild(s);
    }
    function open() {
        if (typeof XMAN === 'undefined') { try { toast('⚠️ Mannequin 3D indisponible'); } catch (e) { } return; }
        css(); const pn = PN(), S = JSON.parse(JSON.stringify(pn.m3d || def())), ar = W / Hh();
        const o = document.createElement('div'); o.id = 'xm3d'; document.body.appendChild(o);
        const rng = (lab, k, min, max, step, unit, obj) => '<div class="rw"><span>' + lab + '</span><input type="range" data-c="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + obj[k] + '"><span data-v="' + k + '">' + obj[k] + unit + '</span></div>';
        const men = () => S.men.map((m, i) => '<div class="mn" data-m="' + i + '"><div class="mh"><b style="color:' + esc(m.col) + '">● ' + (i + 1) + '</b><select data-k="pose">' + PL.map(p => '<option value="' + p[0] + '"' + (p[0] === m.pose ? ' selected' : '') + '>' + p[1] + '</option>').join('') + '</select><button data-del="' + i + '" title="Retirer">✕</button></div>'
            + ['x|Gauche / droite|-5|5|0.1| m', 'z|Avant / arrière|-5|8|0.1| m', 'rot|Orientation|-180|180|5|°', 'H|Taille|90|200|1| cm'].map(s => { const [k, l, a, b, st, u] = s.split('|'); return '<div class="rw"><span>' + l + '</span><input type="range" data-k="' + k + '" min="' + a + '" max="' + b + '" step="' + st + '" value="' + m[k] + '"><span data-mv="' + k + '">' + m[k] + u + '</span></div>'; }).join('') + '</div>').join('');
        o.innerHTML = '<div class="b"><div class="h"><b>🧍 Cadre 3D — plan ' + esc(typeof numOf === 'function' ? numOf(pn) : '') + '</b><span class="d">Posez les mannequins et la caméra, puis placez l’image dans la case pour dessiner par-dessus.</span><button data-x>✕</button></div>'
            + '<div class="c"><div><canvas id="xm3d-cv" width="1280" height="' + Math.round(1280 / ar) + '"></canvas><div class="r d" style="margin-top:6px" id="xm3d-info"></div></div><div>'
            + '<div class="s">🎥 Caméra</div><div class="fo">' + FOC.map(f => '<button data-f="' + f + '"' + (f === S.cam.f ? ' class="on"' : '') + '>' + f + ' mm</button>').join('') + '</div>'
            + rng('Focale', 'f', 10, 300, 1, ' mm', S.cam) + rng('Distance', 'd', 0.3, 20, 0.1, ' m', S.cam) + rng('Azimut', 'az', -180, 180, 5, '°', S.cam) + rng('Hauteur', 'ch', 5, 600, 5, ' cm', S.cam) + rng('Point visé', 'th', 0, 300, 5, ' cm', S.cam) + rng('Roulis', 'roll', -35, 35, 1, '°', S.cam)
            + '<div class="rw"><span>Rendu</span><select id="xm3d-st"><option value="trait"' + (S.style !== 'ombre' ? ' selected' : '') + '>✏️ Trait (pour dessiner)</option><option value="ombre"' + (S.style === 'ombre' ? ' selected' : '') + '>🌓 Ombré</option></select><span></span></div>'
            + '<div class="rw"><span>Numéros</span><label><input type="checkbox" id="xm3d-lb"' + (S.labels ? ' checked' : '') + '> sur l’image</label><span></span></div>'
            + '<div class="s">🧍 Mannequins <button id="xm3d-add"' + (S.men.length >= 4 ? ' disabled' : '') + '>＋ Ajouter</button></div><div id="xm3d-men">' + men() + '</div></div></div>'
            + '<div class="f"><span class="d" style="flex:1">La scène reste dans la case : rouvrez 🧍 Cadre 3D pour la retoucher.</span><button data-c2>Annuler</button><button class="go" id="xm3d-ok">🎬 Placer dans la case</button></div></div>';
        const cv = o.querySelector('#xm3d-cv'), info = o.querySelector('#xm3d-info');
        const VAL = { PG: 'Plan général', PE: 'Plan d’ensemble', PM: 'Plan moyen', PA: 'Plan américain', PR: 'Plan rapproché', GP: 'Gros plan' };
        let raf = 0; const redraw = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; draw(cv, S);
            const m = S.men[0], dist = m ? Math.hypot(m.x * 100 - (Math.sin(S.cam.az * Math.PI / 180) * S.cam.d * 100 + S.cam.tx * 100), m.z * 100 - (-Math.cos(S.cam.az * Math.PI / 180) * S.cam.d * 100 + S.cam.tz * 100)) : 0;
            const frameH = dist * (36 / ar) / S.cam.f, k = m ? frameH / m.H : 0, val = !m ? '' : k > 2.2 ? 'PG' : k > 1.25 ? 'PE' : k > .8 ? 'PM' : k > .6 ? 'PA' : k > .38 ? 'PR' : 'GP';
            info.textContent = 'Champ vertical à ' + (dist / 100).toFixed(1) + ' m : ' + (frameH / 100).toFixed(2) + ' m' + (val ? ' · valeur de plan ≈ ' + VAL[val] + ' (mannequin 1)' : '') + ' · angle horizontal ' + (2 * Math.atan(18 / S.cam.f) * 180 / Math.PI).toFixed(0) + '°';
            S._val = val; }); };
        const bind = () => {
            o.querySelectorAll('[data-c]').forEach(r => r.oninput = () => { S.cam[r.dataset.c] = +r.value; o.querySelector('[data-v="' + r.dataset.c + '"]').textContent = r.value + ({ f: ' mm', d: ' m', ch: ' cm', th: ' cm' }[r.dataset.c] || '°'); if (r.dataset.c === 'f') o.querySelectorAll('[data-f]').forEach(b => b.classList.toggle('on', +b.dataset.f === S.cam.f)); redraw(); });
            o.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { S.cam.f = +b.dataset.f; const r = o.querySelector('[data-c="f"]'); r.value = S.cam.f; r.oninput(); });
            o.querySelectorAll('.mn').forEach(box => { const i = +box.dataset.m; box.querySelectorAll('[data-k]').forEach(c => c[c.tagName === 'SELECT' ? 'onchange' : 'oninput'] = () => { S.men[i][c.dataset.k] = c.tagName === 'SELECT' ? c.value : +c.value; const v = box.querySelector('[data-mv="' + c.dataset.k + '"]'); if (v) v.textContent = c.value + ({ x: ' m', z: ' m', H: ' cm' }[c.dataset.k] || '°'); redraw(); }); });
            o.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (S.men.length <= 1) return; S.men.splice(+b.dataset.del, 1); o.querySelector('#xm3d-men').innerHTML = men(); o.querySelector('#xm3d-add').disabled = false; bind(); redraw(); });
        };
        bind(); redraw();
        o.querySelector('#xm3d-st').onchange = e => { S.style = e.target.value; redraw(); };
        o.querySelector('#xm3d-lb').onchange = e => { S.labels = e.target.checked; redraw(); };
        o.querySelector('#xm3d-add').onclick = () => { if (S.men.length >= 4) return; const n = S.men.length; S.men.push({ pose: 'stand', x: [0, 1, -1, 2][n] || 0, z: n ? .6 : 0, rot: n % 2 ? -25 : 25, H: [175, 168, 182, 160][n], col: COLS[n % 4] }); o.querySelector('#xm3d-men').innerHTML = men(); o.querySelector('#xm3d-add').disabled = S.men.length >= 4; bind(); redraw(); };
        const close = () => o.remove(); o.querySelector('[data-x]').onclick = close; o.querySelector('[data-c2]').onclick = close;
        o.querySelector('#xm3d-ok').onclick = async () => {
            const out = document.createElement('canvas'); out.width = W; out.height = Hh(); draw(out, S);
            const id = 'bg' + uid(); await putImg(id, out.toDataURL('image/jpeg', .9)); snap(); const p = PN(); p.bg = p.bg || {}; p.bg.img = id; p.bg.imgOp = 1;
            const sv = Object.assign({}, S); delete sv._val; p.m3d = sv; p.focale = S.cam.f + ' mm'; if (S._val && !p.valeur) p.valeur = S._val;
            if (!p.angle) p.angle = S.cam.ch > S.cam.th + 60 ? 'plongee' : S.cam.ch < S.cam.th - 60 ? 'cplongee' : p.angle;
            dirty(); renderAll(); close(); try { toast('🧍 Cadre 3D placé dans le plan ' + numOf(p) + ' · ' + S.cam.f + ' mm — dessinez par-dessus'); } catch (e) { }
        };
    }
    function mount() {
        if (document.getElementById('xm3d-btn')) return; const tb = document.getElementById('toolbar'); if (!tb) return;
        tb.insertAdjacentHTML('beforeend', '<button id="xm3d-btn" title="Cadre 3D : mannequins articulés et caméra (focale, hauteur, angle) pour poser un cadre juste dans la case, en trait ou ombré"><span class="btn-icon">🧍</span><span class="btn-label">Cadre 3D</span></button>');
        document.getElementById('xm3d-btn').onclick = open;
    }
    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mount); else setTimeout(mount, 0); addEventListener('load', mount);
    return { open, draw, def, camera, P, PL };
})();
