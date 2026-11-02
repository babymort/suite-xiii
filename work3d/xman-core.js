// =====================================================================
//  SUITE XIII — XMAN : 🧍 mannequin 3D articulé (StickMan, PolyOne Studio — modèle gratuit CGTrader, licence Royalty Free)
//  Le modèle est stocké dans un format propre à la suite (non récupérable tel quel), puis posé ici :
//  mêmes poses que les personnages de PLANO (debout, assis, marche, perche, danse…), géométrie prête pour three.js.
// =====================================================================
var XMAN = window.XMAN || (() => {
    let M = null;
    function load() {
        if (M) return M; const s = atob(XMAN_D), b = new Uint8Array(s.length); let k = 0x5EED13;
        for (let i = 0; i < s.length; i++) { k = (Math.imul(k, 1103515245) + 12345) & 0x7fffffff; b[i] = s.charCodeAt(i) ^ ((k >> 16) & 255); }
        const v = new DataView(b.buffer); let o = 0; const nv = v.getUint16(o, true), nt = v.getUint16(o + 2, true), nb = v.getUint8(o + 4); o = 5;
        const P = new Float32Array(nv * 3); for (let i = 0; i < nv * 3; i++, o += 2) P[i] = v.getInt16(o, true) / 100;
        const T = new Uint16Array(nt * 3); for (let i = 0; i < nt * 3; i++, o += 2) T[i] = v.getUint16(o, true);
        const WI = new Uint8Array(nv * 4), WW = new Float32Array(nv * 4); for (let i = 0; i < nv; i++) { for (let j = 0; j < 4; j++) WI[i * 4 + j] = b[o + j]; for (let j = 0; j < 4; j++) WW[i * 4 + j] = b[o + 4 + j] / 255; o += 8; }
        const J = [], par = []; for (let i = 0; i < nb; i++) { J.push([v.getInt16(o, true) / 100, v.getInt16(o + 2, true) / 100, v.getInt16(o + 4, true) / 100]); par.push(v.getInt8(o + 6)); o += 7; }
        const ix = {}; XMAN_B.forEach((n, i) => ix[n] = i);
        M = { P, T, WI, WW, J, par, ix, H: 179.6 }; return M;
    }
    // ---- petites maths (quaternions) ----
    const qm = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
    const qv = (q, v) => { const [x, y, z, w] = q, ix = w * v[0] + y * v[2] - z * v[1], iy = w * v[1] + z * v[0] - x * v[2], iz = w * v[2] + x * v[1] - y * v[0], iw = -x * v[0] - y * v[1] - z * v[2]; return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x]; };
    const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    function fromTo(a, b) { a = nrm(a); b = nrm(b); const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; if (d < -0.9999) { const ax = Math.abs(a[0]) < .9 ? [1, 0, 0] : [0, 1, 0], c = nrm([a[1] * ax[2] - a[2] * ax[1], a[2] * ax[0] - a[0] * ax[2], a[0] * ax[1] - a[1] * ax[0]]); return [c[0], c[1], c[2], 0]; }
        const c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], q = [c[0], c[1], c[2], 1 + d], l = Math.hypot(...q); return q.map(x => x / l); }
    const rx = t => [Math.sin(t / 2), 0, 0, Math.cos(t / 2)], ry = t => [0, Math.sin(t / 2), 0, Math.cos(t / 2)], rz = t => [0, 0, Math.sin(t / 2), Math.cos(t / 2)];
    const D = Math.PI / 180;
    // direction d'un segment façon PLANO : a = vers l'avant (°), b = vers l'extérieur (°), side −1 gauche / +1 droite ; l'avant est −z
    const dirOf = (a, b, side) => [Math.sin(b * D) * side, -Math.cos(b * D) * Math.cos(a * D), -Math.cos(b * D) * Math.sin(a * D)];
    // pose : objet PLANO { lean, hip, seat, L, R, AL, AR, tilt, turn } (hauteurs en cm pour une taille H)
    function pose(p, H) {
        const m = load(), n = m.J.length, Q = Array(n).fill(null), P = Array(n).fill(null), I = m.ix, lean = p.lean || 0;
        const tor = qm(ry(-(p.turn || 0) * .5), rx(-lean)), head = qm(tor, rz(p.tilt || 0));
        const want = {}; const seg = (bone, child, s, side) => { if (s) want[I[bone]] = { c: I[child], d: dirOf(s[1], s[2], side) }; };
        seg('LeftUpLeg', 'LeftLeg', (p.L || [])[0], -1); seg('LeftLeg', 'LeftFoot', (p.L || [])[1], -1); seg('RightUpLeg', 'RightLeg', (p.R || [])[0], 1); seg('RightLeg', 'RightFoot', (p.R || [])[1], 1);
        seg('LeftArm', 'LeftForeArm', (p.AL || [])[0], -1); seg('LeftForeArm', 'LeftHand', (p.AL || [])[1], -1); seg('RightArm', 'RightForeArm', (p.AR || [])[0], 1); seg('RightForeArm', 'RightHand', (p.AR || [])[1], 1);
        const fixed = { Root: qm(rx(-lean * .4), [0, 0, 0, 1]), Spine: tor, Spine1: tor, Spine2: tor, Neck: head, Head: head, HeadTop_End: head, LeftShoulder: tor, RightShoulder: tor, LeftFoot: [0, 0, 0, 1], RightFoot: [0, 0, 0, 1] };
        for (let j = 0; j < n; j++) { const pa = m.par[j]; P[j] = pa < 0 ? m.J[j].slice() : (() => { const off = [m.J[j][0] - m.J[pa][0], m.J[j][1] - m.J[pa][1], m.J[j][2] - m.J[pa][2]], r = qv(Q[pa], off); return [P[pa][0] + r[0], P[pa][1] + r[1], P[pa][2] + r[2]]; })();
            const name = XMAN_B[j], w = want[j];
            if (w) { const d0 = [m.J[w.c][0] - m.J[j][0], m.J[w.c][1] - m.J[j][1], m.J[w.c][2] - m.J[j][2]]; Q[j] = fromTo(d0, w.d); }
            else if (fixed[name]) Q[j] = fixed[name]; else Q[j] = pa < 0 ? [0, 0, 0, 1] : Q[pa]; }
        return { P, Q };
    }
    // géométrie posée, à l'échelle H (cm), pieds au sol (ou bassin à la hauteur du siège)
    function geometry(T, p, H) {
        const m = load(), { P, Q } = pose(p || {}, H), s = (H || 175) / m.H, nv = m.P.length, out = new Float32Array(nv * 3);
        for (let i = 0; i < nv; i++) { let x = 0, y = 0, z = 0; const v = [m.P[i * 3], m.P[i * 3 + 1], m.P[i * 3 + 2]];
            for (let k = 0; k < 4; k++) { const w = m.WW[i * 4 + k]; if (!w) continue; const j = m.WI[i * 4 + k], r = qv(Q[j], [v[0] - m.J[j][0], v[1] - m.J[j][1], v[2] - m.J[j][2]]); x += w * (P[j][0] + r[0]); y += w * (P[j][1] + r[1]); z += w * (P[j][2] + r[2]); }
            out[i * 3] = x * s; out[i * 3 + 1] = y * s; out[i * 3 + 2] = z * s; }
        let dy; if (p && p.seat) { const hj = P[m.ix.LeftUpLeg][1] * s; dy = (p.hip || .3 * H) - .01 * H - hj; } else { let mn = 1e9; for (let i = 1; i < out.length; i += 3) mn = Math.min(mn, out[i]); dy = -mn; }
        for (let i = 1; i < out.length; i += 3) out[i] += dy;
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(out, 3)); g.setIndex(new T.BufferAttribute(m.T, 1)); g.computeVertexNormals();
        const J = {}; XMAN_B.forEach((nm, j) => J[nm] = [P[j][0] * s, P[j][1] * s + dy, P[j][2] * s]);
        return { geo: g, joints: J };
    }
    return { geometry, pose, load };
})();
