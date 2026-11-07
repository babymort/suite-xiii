// SUITE XIII — module commun. Source : xiii-src/sb-peeps.js
// =====================================================================
//  STORYBOARDO XIII — 🙂 Open Peeps : personnages dessinés découpés en pantins (vue éclatée)
//  Illustrations Open Peeps de Pablo Stanley (openpeeps.com), licence CC0 — libres de droits.
//  Données chargées à la demande : data/openpeeps.json (poses découpées, coiffures, visages, barbes, accessoires).
//  Élément : { kind:'puppet', type:'peep', pPose, pHead, pFace, pBeard, pAcc, pFill, pSkin, pInk, pose, poseOf, handR, handL, headFlip }
//  Le pantin reprend le moteur des personnages : poignées, poses, miroir, ⇄ inverser, touches V T R E.
// =====================================================================
var XPEEPS = window.XPEEPS || (() => {
    const URLD = 'data/openpeeps.json', HH = 400, K = HH / 2840; // 2840 unités Open Peeps = un adulte debout
    let D = null, loading = null, CID = 0, failed = false;
    const PRE = 'op' + Math.random().toString(36).slice(2, 6);
    const r1 = v => (Math.round(v * 10) / 10).toString(), r3 = v => (+v.toFixed(4)).toString();
    const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
    const rot = (v, a) => { const r = rad(a), c = Math.cos(r), s = Math.sin(r); return [v[0] * c + v[1] * s, -v[0] * s + v[1] * c]; };
    function load() {
        if (D) return Promise.resolve(D);
        if (!loading) loading = fetch(URLD).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(d => { D = d; failed = false; return D; })
            .catch(e => { loading = null; failed = true; try { toast('⚠️ Open Peeps : données introuvables (' + (e.message || e) + '). Ouvrez STORYBOARDO depuis le site de la suite.', 6000); } catch (x) { } throw e; });
        return loading;
    }
    const ready = () => !!D;
    function refresh() { try { renderStage(); } catch (e) { } try { renderStrip(); } catch (e) { } try { renderProps(); } catch (e) { } try { renderLibrary(); } catch (e) { } }
    // ---------- données d'une pose ----------
    const pid = el => (D && D.P[el.pPose]) ? el.pPose : 'standing/walking-1';
    const RESTC = {};
    function rest(id) {
        if (RESTC[id]) return RESTC[id];
        const q = D.P[id].j, tor = (angTo(q.p, q.n) + 360) % 360, r = { torso: tor, head: 0, dy: 0 };
        ['r', 'l'].forEach(s => {
            if (q[s + 's'] && q[s + 'e'] && q[s + 'w']) { const ua = angTo(q[s + 's'], q[s + 'e']), fa = angTo(q[s + 'e'], q[s + 'w']); r[s + 'UA'] = nrm(ua - tor - 180); r[s + 'FA'] = nrm(fa - ua); }
            else { r[s + 'UA'] = POSE0[s + 'UA']; r[s + 'FA'] = POSE0[s + 'FA']; }
            if (q[s + 'p'] && q[s + 'k'] && q[s + 'a']) { const th = angTo(q[s + 'p'], q[s + 'k']), sh = angTo(q[s + 'k'], q[s + 'a']); r[s + 'Th'] = nrm(th); r[s + 'Sh'] = nrm(sh - th); }
            else { r[s + 'Th'] = POSE0[s + 'Th']; r[s + 'Sh'] = POSE0[s + 'Sh']; }
        });
        return (RESTC[id] = r);
    }
    const locks = P => { const L = P.lk || [], o = { r: L.includes('r') || !P.j.rs, l: L.includes('l') || !P.j.ls, legs: L.includes('legs') || !P.j.rp }; o.all = o.r && o.l && o.legs; return o; };
    function poseOf(el) {
        const id = pid(el), R0 = rest(id), P = D.P[id], lk = locks(P), p = Object.assign({}, R0, el.poseOf === id ? (el.pose || {}) : {});
        if (lk.r) { p.rUA = R0.rUA; p.rFA = R0.rFA; } if (lk.l) { p.lUA = R0.lUA; p.lFA = R0.lFA; }
        if (lk.legs) { ['lTh', 'lSh', 'rTh', 'rSh'].forEach(k => p[k] = R0[k]); p.torso = R0.torso; p.dy = 0; }
        return p;
    }
    // ---------- cinématique : mêmes clés que le moteur (pelvis, neck, head, lElbow, lHand…) ----------
    function joints(el) {
        const id = pid(el), P = D.P[id], q = P.j, R0 = rest(id), p = poseOf(el), lk = locks(P);
        const restPel = (P.g - q.p[1]) * K, pelvis = [0, -restPel + (p.dy || 0) * HH], dT = nrm(p.torso - R0.torso);
        const rel = n => [(q[n][0] - q.p[0]) * K, (q[n][1] - q.p[1]) * K], at = n => add(pelvis, rot(rel(n), dT)), L = (a, b) => dist(q[a], q[b]) * K;
        const J = { pelvis, mir: false, view: '3q', id, P, q, p, R0, dT, lk, ang: {}, rest: {}, hide: [] };
        J.neck = at('n'); J.shoulder = J.neck; J.up = vec(p.torso, 1); J.side = [-J.up[1], J.up[0]];
        const a0 = angTo(D.hp, D.hc), hl = dist(D.hp, D.hc) * K; J.a0 = el.headFlip ? -a0 : a0;
        J.head = add(J.neck, vec(J.a0 + dT + p.head, hl));
        ['r', 'l'].forEach(s => {
            if (q[s + 's']) {
                const ua = p.torso + 180 + p[s + 'UA'], fa = ua + p[s + 'FA'];
                J[s + 'Shoulder'] = at(s + 's'); J[s + 'Elbow'] = add(J[s + 'Shoulder'], vec(ua, L(s + 's', s + 'e'))); J[s + 'Hand'] = add(J[s + 'Elbow'], vec(fa, L(s + 'e', s + 'w')));
                J[s + '_ua'] = ua; J[s + '_fa'] = fa;
                if (lk[s]) { J[s + 'Elbow'] = at(s + 'e'); J[s + 'Hand'] = at(s + 'w'); }
            } else { J[s + 'Shoulder'] = J.neck; J[s + 'Elbow'] = add(J.neck, [0, 60]); J[s + 'Hand'] = add(J.neck, [0, 120]); J[s + '_ua'] = 0; J[s + '_fa'] = 0; }
            if (q[s + 'p']) {
                const th = p[s + 'Th'], sh = th + p[s + 'Sh'];
                J[s + 'Hip'] = at(s + 'p'); J[s + 'Knee'] = add(J[s + 'Hip'], vec(th, L(s + 'p', s + 'k'))); J[s + 'Foot'] = add(J[s + 'Knee'], vec(sh, L(s + 'k', s + 'a')));
                J[s + '_th'] = th; J[s + '_sh'] = sh;
            } else { J[s + 'Hip'] = pelvis; J[s + 'Knee'] = add(pelvis, [0, restPel / 2]); J[s + 'Foot'] = [pelvis[0], 0]; J[s + '_th'] = 0; J[s + '_sh'] = 0; }
            if (lk[s]) J.hide.push(s + 'Elbow', s + 'Hand');
        });
        if (lk.legs) J.hide.push('lKnee', 'lFoot', 'rKnee', 'rFoot', 'pelvis', 'neck');
        J.d = { H: HH, head: hl, th: q.rp ? L('rp', 'rk') : restPel / 2, sh: q.rk ? L('rk', 'ra') : restPel / 2, k: 1, w: HH * 0.047, torso: Math.hypot.apply(null, rel('n')) };
        return J;
    }
    function fromHandle(el, key, m) {
        const J = joints(el), p = Object.assign({}, J.p), id = J.id;
        if (key === 'head') p.head = Math.max(-80, Math.min(80, nrm(angTo(J.neck, m) - J.a0 - J.dT)));
        else if (key === 'neck') { if (!J.lk.legs) p.torso = (angTo(J.pelvis, m) + 360) % 360; }
        else if (key === 'pelvis') { if (!J.lk.legs) p.dy = Math.max(-0.3, Math.min(0.55, (m[1] + (J.P.g - J.q.p[1]) * K) / HH)); }
        else {
            const s = key[0], part = key.slice(1);
            if ((part === 'Elbow' || part === 'Hand') && J.lk[s]) { lockedToast(J, s); return; }
            if ((part === 'Knee' || part === 'Foot') && J.lk.legs) { lockedToast(J, 'legs'); return; }
            if (part === 'Elbow') p[s + 'UA'] = nrm(angTo(J[s + 'Shoulder'], m) - (p.torso + 180));
            else if (part === 'Hand') p[s + 'FA'] = nrm(angTo(J[s + 'Elbow'], m) - J[s + '_ua']);
            else if (part === 'Knee') p[s + 'Th'] = nrm(angTo(J[s + 'Hip'], m));
            else if (part === 'Foot') p[s + 'Sh'] = nrm(angTo(J[s + 'Knee'], m) - J[s + '_th']);
        }
        el.pose = p; el.poseOf = id;
    }
    let lastLockT = 0;
    function lockedToast(J, s) { if (Date.now() - lastLockT < 3000) return; lastLockT = Date.now(); toast('🔒 « ' + J.P.n + ' » : ' + (s === 'legs' ? 'pose dessinée, corps fixe' : 'bras dessiné contre le corps') + ' — choisissez une pose libre (Marche, Chemise, Doigt levé…) pour l’articuler', 4000); }
    // ---------- dessin ----------
    const lay = (L, fill, ink) => L.map(x => '<path fill-rule="evenodd" fill="' + (x[0] === 0 ? fill : x[0] === 1 ? ink : x[0]) + '" d="' + x[1] + '"/>').join('');
    const colors = el => ({ fill: el.pFill || '#ffffff', skin: el.pSkin || el.pFill || '#ffffff', ink: el.pInk || '#000000' });
    function headInner(el, c) {
        const H = D.H[el.pHead] || D.H['Short 1'], F = D.F[el.pFace] || D.F.Calm, B = el.pBeard && D.B[el.pBeard], A = el.pAcc && D.A[el.pAcc];
        return lay(H.L, c.skin, c.ink) + '<g transform="translate(' + D.fo[0] + ' ' + D.fo[1] + ')">' + lay(F.L, c.skin, c.ink) + '</g>' +
            (B ? '<g transform="translate(' + D.bo[0] + ' ' + D.bo[1] + ')">' + lay(B.L, c.skin, c.ink) + '</g>' : '') + (A ? '<g transform="translate(' + D.ao[0] + ' ' + D.ao[1] + ')">' + lay(A.L, c.skin, c.ink) + '</g>' : '');
    }
    // pièce : repère de la pose → articulation `at`, rotation (repos − actuel)
    const tf = (at, phi, piv, sx) => 'translate(' + r1(at[0]) + ' ' + r1(at[1]) + ') rotate(' + phi.toFixed(2) + ') scale(' + r3((sx || 1) * K) + ' ' + r3(K) + ') translate(' + (-piv[0]) + ' ' + (-piv[1]) + ')';
    function handFor(el, s, J) {
        let id = el[s === 'l' ? 'handL' : 'handR'];
        // main dessinée dans la poche : dès que le bras bouge, on lui donne une main détendue
        if (!id && J.P.hid && J.P.hid.includes(s) && (Math.abs(nrm(J.p[s + 'UA'] - J.R0[s + 'UA'])) > 6 || Math.abs(nrm(J.p[s + 'FA'] - J.R0[s + 'FA'])) > 6)) id = 'detendue';
        if (!id || J.lk[s] || !J.q[s + 's']) return null;
        const M = (D.M || []).find(x => x[0] === id); if (!M || !D.P[M[2]]) return null;
        return { id, S: D.P[M[2]], side: M[3], src: M[2] };
    }
    function svg(el, opt) {
        if (!D) { if (!failed) load().then(refresh).catch(() => { }); return '<g><rect x="-70" y="-400" width="140" height="400" rx="28" fill="#f3f3f3" stroke="#bbb" stroke-width="4" stroke-dasharray="14 10"/><text x="0" y="-190" text-anchor="middle" font-size="26" font-family="Helvetica,Arial" fill="#888">' + (failed ? 'Open Peeps' : 'Chargement…') + '</text></g>'; }
        const J = joints(el), P = J.P, q = J.q, p = J.p, c = colors(el), u = PRE + (++CID).toString(36), dT = J.dT;
        let defs = '<g id="' + u + 'b">' + lay(P.L, c.fill, c.ink) + '</g>';
        Object.keys(P.pc).forEach(n => { defs += '<clipPath id="' + u + n + '"><path clip-rule="evenodd" d="' + P.pc[n] + '"/></clipPath>'; });
        const use = n => '<g clip-path="url(#' + u + n + ')"><use href="#' + u + 'b"/></g>';
        // parties reconstruites (cachées dans le dessin d'origine) : aplat + contour, sous TOUS les dessins, solidaires de leur pièce
        let EXT = '', EXT_T = '';
        const exoS = (E, tr) => (E && (E[0] || E[1])) ? '<g transform="' + tr + '">' + (E[0] ? '<path fill-rule="evenodd" fill="' + c.fill + '" d="' + E[0] + '"/>' : '') + (E[1] ? '<path fill-rule="evenodd" fill="' + c.ink + '" d="' + E[1] + '"/>' : '') + '</g>' : '';
        const exo = (E, tr, top) => { if (top) EXT_T += exoS(E, tr); else EXT += exoS(E, tr); };
        const part = (n, at, piv, phi) => { if (!P.pc[n]) return ''; const tr = tf(at, phi, piv); if (P.ex) exo(P.ex[n], tr); return '<g transform="' + tr + '">' + use(n) + '</g>'; };
        const T = { torso: '' }, A = a => angTo(q[a[0]], q[a[1]]);
        // torse (+ rustines dessous : haut des jambes et aplat sous les bras)
        const tT = tf(J.pelvis, -dT, q.p);
        let under = '';
        if (P.pl && !P.ex) { defs += '<clipPath id="' + u + 'pl"><path clip-rule="evenodd" d="' + P.pl + '"/></clipPath>'; under += '<g transform="' + tT + '"><g clip-path="url(#' + u + 'pl)"><use href="#' + u + 'b"/></g></g>'; }
        if (P.pa && !P.ex) under += '<g transform="' + tT + '"><path fill-rule="evenodd" fill="' + c.fill + '" d="' + P.pa + '"/></g>';
        if (P.ex) exo(P.ex.torso, tT, true);
        const torso = P.pc.torso ? '<g transform="' + tT + '">' + use('torso') + '</g>' : '<g transform="' + tT + '"><use href="#' + u + 'b"/></g>';
        const head = '<g transform="' + tf(J.neck, -(dT + p.head), D.hp, el.headFlip ? -1 : 1) + '">' + headInner(el, c) + '</g>';
        const arm = s => {
            if (!q[s + 's'] || J.lk[s]) return '';
            let o = part(s + 'UA', J[s + 'Shoulder'], q[s + 's'], A([s + 's', s + 'e']) - J[s + '_ua']) + part(s + 'FA', J[s + 'Elbow'], q[s + 'e'], A([s + 'e', s + 'w']) - J[s + '_fa']);
            const h = handFor(el, s, J);
            if (h) {
                const S = h.S, sq = S.j, ss = h.side, rH = angTo(sq[ss + 'w'], sq[ss + 'h']), bend = rH - angTo(sq[ss + 'e'], sq[ss + 'w']);
                defs += '<g id="' + u + 'h' + s + '">' + lay(S.L, c.fill, c.ink) + '</g><clipPath id="' + u + 'hc' + s + '"><path clip-rule="evenodd" d="' + S.pc[ss + 'Hd'] + '"/></clipPath>';
                const trh = tf(J[s + 'Hand'], rH - (J[s + '_fa'] + bend), sq[ss + 'w']); if (S.ex) exo(S.ex[ss + 'Hd'], trh);
                o += '<g transform="' + trh + '"><g clip-path="url(#' + u + 'hc' + s + ')"><use href="#' + u + 'h' + s + '"/></g></g>';
            } else o += part(s + 'Hd', J[s + 'Hand'], q[s + 'w'], A([s + 'w', s + 'h']) - (J[s + '_fa'] + A([s + 'w', s + 'h']) - A([s + 'e', s + 'w'])));
            return o;
        };
        const leg = s => (!q[s + 'p'] || J.lk.legs) ? '' : part(s + 'Th', J[s + 'Hip'], q[s + 'p'], A([s + 'p', s + 'k']) - J[s + '_th']) + part(s + 'Sh', J[s + 'Knee'], q[s + 'k'], A([s + 'k', s + 'a']) - J[s + '_sh']);
        const aL = arm('l'), lL = leg('l'), lR = leg('r'), aR = arm('r');
        return '<defs>' + defs + '</defs>' + under + EXT + EXT_T + aL + lL + lR + torso + head + aR;
    }
    // ---------- personnage fixe (vignettes) : pose au repos, sans découpe ----------
    function still(o, w, h, pad) {
        const P = D.P[o.pPose], off = D.off[P.c], c = colors(o), hx = off[0], hy = off[1];
        const x0 = Math.min(P.bb[0], hx - 90), x1 = Math.max(P.bb[2], hx + 520), y0 = Math.min(P.bb[1], hy - 70), y1 = P.bb[3];
        const vw = x1 - x0, vh = y1 - y0, pd = pad == null ? 40 : pad;
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (x0 - pd) + ' ' + (y0 - pd) + ' ' + (vw + 2 * pd) + ' ' + (vh + 2 * pd) + '"' + (w ? ' width="' + w + '" height="' + (h || Math.round(w * (vh + 2 * pd) / (vw + 2 * pd))) + '"' : '') + '>' +
            lay(P.L, c.fill, c.ink) + '<g transform="translate(' + hx + ' ' + hy + ')">' + headInner(o, c) + '</g></svg>';
    }
    const THUMB = new Map();
    function thumb(o) {
        const k = [o.pPose, o.pHead, o.pFace, o.pBeard, o.pAcc].join('|'); if (THUMB.has(k)) return THUMB.get(k);
        let u = ''; try { u = URL.createObjectURL(new Blob([still(o)], { type: 'image/svg+xml' })); } catch (e) { u = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(still(o)); }
        THUMB.set(k, u); return u;
    }
    // ---------- ajout ----------
    const tplEl = i => { const t = D.T[i]; return { pPose: t[1], pHead: t[2], pFace: t[3], pBeard: t[4], pAcc: t[5] }; };
    function addTpl(i) {
        if (!D) { load().then(() => addTpl(i)).catch(() => { }); return; }
        const o = tplEl(i), P = D.P[o.pPose], n = PN().els.filter(e => e.kind === 'puppet').length, fl = PN().bg.floor;
        addEl(Object.assign({ kind: 'puppet', type: 'peep', name: '', pose: {}, x: W * (0.3 + 0.18 * (n % 4)), y: Hh() * Math.max(0.6, Math.min(0.95, (fl != null ? fl : 0.72) + 0.16)), s: Hh() / 900 * (P.c === 'bust' ? 2.1 : 1) }, o));
    }
    function addRandom() {
        if (!D) { load().then(addRandom).catch(() => { }); return; }
        const pick = a => a[Math.floor(Math.random() * a.length)], ps = Object.keys(D.P).filter(k => k.startsWith('standing/'));
        const n = PN().els.filter(e => e.kind === 'puppet').length, fl = PN().bg.floor;
        addEl({ kind: 'puppet', type: 'peep', name: '', pose: {}, pPose: pick(ps), pHead: pick(Object.keys(D.H)), pFace: pick(['Calm', 'Smile', 'Smile Big', 'Serious', 'Cheeky', 'Explaining', 'Driven', 'Cute']), pBeard: Math.random() < 0.25 ? pick(Object.keys(D.B)) : '', pAcc: Math.random() < 0.25 ? pick(Object.keys(D.A)) : '', x: W * (0.3 + 0.18 * (n % 4)), y: Hh() * Math.max(0.6, Math.min(0.95, (fl != null ? fl : 0.72) + 0.16)), s: Hh() / 900 });
    }
    function shuffle() {
        const el = selEl(); if (!el || el.type !== 'peep' || !D) return; snap();
        const pick = a => a[Math.floor(Math.random() * a.length)];
        el.pHead = pick(Object.keys(D.H)); el.pFace = pick(Object.keys(D.F).slice(0, 16)); el.pBeard = Math.random() < 0.3 ? pick(Object.keys(D.B)) : ''; el.pAcc = Math.random() < 0.25 ? pick(Object.keys(D.A)) : '';
        dirty(); redrawEl(el); renderProps(); renderStripThumb(PN());
    }
    // ---------- propriétés ----------
    const CATS = [['standing', '🧍 Debout'], ['sitting', '🪑 Assis'], ['bust', '👤 Buste (plan rapproché)']];
    function props(el) {
        if (!D) { load().then(() => renderProps()).catch(() => { }); return '<p class="hint">⏳ Chargement des personnages Open Peeps…</p>'; }
        const id = pid(el), P = D.P[id], lk = locks(P);
        const sel = (k, opts, v) => '<select data-p="el.' + k + '">' + opts + '</select>';
        const opt = (v, t, cur) => '<option value="' + esc(v) + '"' + (String(v) === String(cur || '') ? ' selected' : '') + '>' + esc(t) + '</option>';
        const poses = CATS.map(C => '<optgroup label="' + esc(C[1]) + '">' + Object.keys(D.P).filter(k => D.P[k].c === C[0]).sort((a, b) => D.P[a].n.localeCompare(D.P[b].n, 'fr')).map(k => opt(k, D.P[k].n + (locks(D.P[k]).all ? '' : locks(D.P[k]).r || locks(D.P[k]).l ? ' · jambes articulées' : ' · tout articulé'), id)).join('') + '</optgroup>').join('');
        const heads = Object.keys(D.H).sort((a, b) => D.H[a].n.localeCompare(D.H[b].n, 'fr')).map(k => opt(k, D.H[k].n, el.pHead)).join('');
        const faces = Object.keys(D.F).map(k => opt(k, D.F[k].n, el.pFace)).join('');
        const beards = opt('', 'Aucune', el.pBeard) + Object.keys(D.B).map(k => opt(k, D.B[k].n, el.pBeard)).join('');
        const accs = opt('', 'Aucun', el.pAcc) + Object.keys(D.A).map(k => opt(k, D.A[k].n, el.pAcc)).join('');
        const hands = s => opt('', 'Celle du dessin', el[s]) + (D.M || []).map(m => opt(m[0], m[1], el[s])).join('');
        const lockTxt = lk.all ? '🔒 Pose dessinée : le corps reste tel quel ; la tête s’incline, se retourne et change d’expression.' : (lk.r || lk.l) ? '🔒 Bras dessinés contre le corps : seules les jambes, le buste et la tête s’articulent.' : '🤸 Tout s’articule : tirez les ronds (tête, buste, coudes, mains, genoux, pieds, bassin).';
        return fld('Nom affiché', pIn('el.name', el.name, 'text', 'ex. LÉA')) +
            '<div class="sb-h" style="margin:6px 0 4px">🙂 Open Peeps</div>' +
            fld('Pose et tenue', sel('pPose', poses)) +
            '<div class="fgrid2">' + fld('Coiffure', sel('pHead', heads)) + fld('Expression', sel('pFace', faces)) + fld('Barbe', sel('pBeard', beards)) + fld('Accessoire', sel('pAcc', accs)) + '</div>' +
            '<div class="mb-actions" style="justify-content:flex-start;margin:0 0 6px;flex-wrap:wrap"><button class="btn-sm" onclick="pupCycle(\'expr\')" title="Expression suivante (touche E)">😀 Expression</button><button class="btn-sm" onclick="pupCycle(\'headView\')" title="Tête droite, penchée, relevée (touche T)">🔄 Tête</button><button class="btn-sm' + (el.headFlip ? ' btn-active' : '') + '" onclick="pupCycle(\'headFlip\')" title="Regarde de l’autre côté, par-dessus l’épaule (touche R)">⇆ Regard</button><button class="btn-sm" onclick="XPEEPS.shuffle()" title="Coiffure, visage et accessoires au hasard">🎲 Hasard</button></div>' +
            (lk.r && lk.l ? '' : '<div class="fgrid2">' + (lk.r ? '<span></span>' : fld('Main (bras avant)', sel('handR', hands('handR')))) + (lk.l ? '<span></span>' : fld('Main (bras arrière)', sel('handL', hands('handL')))) + '</div>') +
            '<div class="fgrid2">' + fld('Aplat du corps', pIn('el.pFill', el.pFill || '#ffffff', 'color')) + fld('Visage', pIn('el.pSkin', el.pSkin || el.pFill || '#ffffff', 'color')) + fld('Trait', pIn('el.pInk', el.pInk || '#000000', 'color')) + '<span></span></div>' +
            '<p class="hint" style="margin-top:-2px">' + lockTxt + '</p>' +
            '<div class="mb-actions" style="justify-content:flex-start;margin:6px 0;flex-wrap:wrap"><button class="btn-sm" onclick="setLibTab(\'pup\')">🤸 Poses…</button><button class="btn-sm" onclick="mirrorPose()" title="Inverser bras et jambes avant / arrière">⇄ Inverser</button><button class="btn-sm" onclick="XPEEPS.restPose()" title="Revenir à la pose du dessin">↺ Pose d’origine</button><button class="btn-sm" onclick="savePose()">💾 Pose</button><button class="btn-sm" onclick="XPEEPS.sheet()" title="Toutes les pièces détachées du personnage, ses expressions et ses mains">🧩 Vue éclatée</button></div>' +
            '<p class="hint">Illustrations <a href="https://www.openpeeps.com" target="_blank" rel="noopener">Open Peeps</a> de Pablo Stanley — licence CC0, libres pour tout usage.</p>';
    }
    function restPose() { const el = selEl(); if (!el || el.type !== 'peep') return; snap(); el.pose = {}; el.poseOf = pid(el); dirty(); redrawEl(el); renderStripThumb(PN()); }
    // ---------- vue éclatée (planche) ----------
    const PCL = { torso: ['Buste', '#ff8a65'], rUA: ['Bras', '#4fc3f7'], rFA: ['Avant-bras', '#4fc3f7'], rHd: ['Main', '#4fc3f7'], lUA: ['Bras', '#81c784'], lFA: ['Avant-bras', '#81c784'], lHd: ['Main', '#81c784'], rTh: ['Cuisse', '#ba68c8'], rSh: ['Jambe', '#ba68c8'], lTh: ['Cuisse', '#f06292'], lSh: ['Jambe', '#f06292'] };
    const PIV = { torso: 'p', rUA: 'rs', rFA: 're', rHd: 'rw', lUA: 'ls', lFA: 'le', lHd: 'lw', rTh: 'rp', rSh: 'rk', lTh: 'lp', lSh: 'lk' };
    const PAR = { rUA: 'torso', rFA: 'rUA', rHd: 'rFA', lUA: 'torso', lFA: 'lUA', lHd: 'lFA', rTh: 'torso', rSh: 'rTh', lTh: 'torso', lSh: 'lTh' };
    function sheetSvg(el) {
        const id = pid(el), P = D.P[id], q = P.j, c = colors(el), u = PRE + 'x' + (++CID).toString(36), Wd = 2400, Ht = 1600;
        const name = el.name || (D.T.find(t => t[1] === id && t[2] === el.pHead) || [''])[0] || P.n;
        let defs = '<g id="' + u + 'b">' + lay(P.L, c.fill, c.ink) + '</g><g id="' + u + 'h">' + headInner(el, c) + '</g>';
        Object.keys(P.pc).forEach(n => { defs += '<clipPath id="' + u + n + '"><path clip-rule="evenodd" d="' + P.pc[n] + '"/></clipPath>'; });
        const txt = (x, y, s, t, o) => '<text x="' + x + '" y="' + y + '" font-family="Helvetica,Arial,sans-serif" font-size="' + s + '"' + (o || '') + '>' + esc(t) + '</text>';
        const off = D.off[P.c];
        // 1. le personnage assemblé (pose actuelle)
        const fig = svg(el), JJ = joints(el), jk = JOINT_KEYS.map(k => JJ[k]);
        const fx0 = Math.min.apply(null, jk.map(v => v[0])) - 75, fx1 = Math.max.apply(null, jk.map(v => v[0])) + 75, fy0 = JJ.head[1] - 85, fy1 = Math.max(10, Math.max.apply(null, jk.map(v => v[1])) + 25), fw = fx1 - fx0, fh = fy1 - fy0, s1 = Math.min(500 / fw, 1250 / fh);
        let o = '<rect width="' + Wd + '" height="' + Ht + '" fill="#fff"/>' + txt(40, 62, 38, 'STORYBOARDO XIII — vue éclatée · ' + name, ' font-weight="700" fill="#1d1d27"') + txt(40, 98, 21, P.n + ' · ' + (D.H[el.pHead] || {}).n + ' · ' + (D.F[el.pFace] || {}).n + (el.pBeard && D.B[el.pBeard] ? ' · ' + D.B[el.pBeard].n : '') + (el.pAcc && D.A[el.pAcc] ? ' · ' + D.A[el.pAcc].n : ''), ' fill="#555"');
        const box = (x, y, w, h, t) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="18" fill="#f4f2ee" stroke="#d4d4d4" stroke-width="3" stroke-dasharray="12 9"/>' + txt(x + 18, y + 36, 24, t, ' font-weight="700" fill="#1d1d27"');
        o += box(30, 130, 560, 1420, '1. Personnage assemblé');
        o += '<g transform="translate(' + (310 - (fx0 + fw / 2) * s1) + ' ' + (1520 - fy1 * s1) + ') scale(' + s1.toFixed(4) + ')">' + fig + JOINT_KEYS.filter(k => !JJ.hide.includes(k)).map(k => '<circle cx="' + r1(JJ[k][0]) + '" cy="' + r1(JJ[k][1]) + '" r="5" fill="#f0b378" stroke="#1d1d27" stroke-width="1.5"/>').join('') + '</g>';
        // 2. pièces détachées
        const names = Object.keys(P.pc).length ? Object.keys(P.pc) : ['torso'], ce = n => P.ce[n] || q.p, f = 0.65;
        const offs = { torso: [0, 0] }; const go = n => { if (offs[n]) return offs[n]; const pa = go(PAR[n]), a = ce(PAR[n]), b = ce(n); return (offs[n] = [pa[0] + (b[0] - a[0]) * f, pa[1] + (b[1] - a[1]) * f]); };
        names.forEach(go);
        const hOff = [0, -330];
        let xs0 = P.bb[0], xs1 = P.bb[2], ys0 = Math.min(P.bb[1], off[1] - 70) + hOff[1], ys1 = P.bb[3];
        names.forEach(n => { xs0 = Math.min(xs0, P.bb[0] + offs[n][0]); xs1 = Math.max(xs1, P.bb[2] + offs[n][0]); ys1 = Math.max(ys1, P.bb[3] + Math.max(0, offs[n][1])); });
        xs0 = Math.min(xs0, off[0] - 90); xs1 = Math.max(xs1, off[0] + 520);
        const bw = 900, bh = 1330, s2 = Math.min((bw - 60) / (xs1 - xs0), (bh - 80) / (ys1 - ys0));
        o += box(610, 130, bw, 1420, '2. Pièces détachées (pantin)');
        let ex = '';
        names.forEach(n => { const d = offs[n]; ex += '<g transform="translate(' + r1(d[0]) + ' ' + r1(d[1]) + ')">' + (P.ex && P.ex[n] ? (P.ex[n][0] ? '<path fill-rule="evenodd" fill="' + c.fill + '" d="' + P.ex[n][0] + '"/>' : '') + (P.ex[n][1] ? '<path fill-rule="evenodd" fill="' + c.ink + '" d="' + P.ex[n][1] + '"/>' : '') : '') + (n === 'torso' && !P.pc.torso ? '<use href="#' + u + 'b"/>' : '<g clip-path="url(#' + u + n + ')"><use href="#' + u + 'b"/></g>') + '</g>'; });
        ex += '<g transform="translate(' + (off[0] + hOff[0]) + ' ' + (off[1] + hOff[1]) + ')"><use href="#' + u + 'h"/></g>';
        // articulations : rond sur la pièce enfant + trait pointillé vers le parent
        const piv = (n, side) => { const k = PIV[n], pt = q[k] || q.p, d = offs[side === 'parent' ? PAR[n] : n]; return [pt[0] + d[0], pt[1] + d[1]]; };
        names.filter(n => n !== 'torso').forEach(n => { const a = piv(n, 'parent'), b = piv(n), col = (PCL[n] || ['', '#888'])[1]; ex += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + col + '" stroke-width="' + (6 / s2) + '" stroke-dasharray="' + (14 / s2) + ' ' + (10 / s2) + '"/><circle cx="' + a[0] + '" cy="' + a[1] + '" r="' + (9 / s2) + '" fill="#fff" stroke="' + col + '" stroke-width="' + (4 / s2) + '"/><circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + (11 / s2) + '" fill="' + col + '" stroke="#1d1d27" stroke-width="' + (2.5 / s2) + '"/>'; });
        const hp = [D.hp[0] + off[0] + hOff[0], D.hp[1] + off[1] + hOff[1]], np = q.n;
        ex += '<line x1="' + np[0] + '" y1="' + np[1] + '" x2="' + hp[0] + '" y2="' + hp[1] + '" stroke="#ffb74d" stroke-width="' + (6 / s2) + '" stroke-dasharray="' + (14 / s2) + ' ' + (10 / s2) + '"/><circle cx="' + np[0] + '" cy="' + np[1] + '" r="' + (9 / s2) + '" fill="#fff" stroke="#ffb74d" stroke-width="' + (4 / s2) + '"/><circle cx="' + hp[0] + '" cy="' + hp[1] + '" r="' + (11 / s2) + '" fill="#ffb74d" stroke="#1d1d27" stroke-width="' + (2.5 / s2) + '"/>';
        // étiquettes
        names.forEach(n => { const L = PCL[n]; if (!L) return; const pt = ce(n), d = offs[n]; ex += '<text x="' + (pt[0] + d[0]) + '" y="' + (pt[1] + d[1]) + '" font-family="Helvetica,Arial" font-size="' + (19 / s2) + '" font-weight="700" text-anchor="middle" fill="#1d1d27" paint-order="stroke" stroke="#fff" stroke-width="' + (6 / s2) + '">' + esc(L[0]) + '</text>'; });
        ex += '<text x="' + (hp[0]) + '" y="' + (off[1] + hOff[1] - 20) + '" font-family="Helvetica,Arial" font-size="' + (19 / s2) + '" font-weight="700" text-anchor="middle" fill="#1d1d27">Tête</text>';
        o += '<g transform="translate(' + (610 + 30 - xs0 * s2 + (bw - 60 - (xs1 - xs0) * s2) / 2) + ' ' + (130 + 60 - ys0 * s2) + ') scale(' + s2.toFixed(5) + ')">' + ex + '</g>';
        // 3. expressions
        o += box(1530, 130, 840, 820, '3. Expressions (touche E)');
        const fk = Object.keys(D.F), cw = 136, ch = 150;
        fk.forEach((k, i) => {
            const x = 1550 + (i % 6) * cw, y = 178 + Math.floor(i / 6) * ch, s3 = 100 / 600;
            o += '<g transform="translate(' + (x + 16) + ' ' + y + ') scale(' + s3.toFixed(4) + ') translate(90 40)">' + lay((D.H[el.pHead] || D.H['Short 1']).L, c.skin, c.ink) + '<g transform="translate(' + D.fo[0] + ' ' + D.fo[1] + ')">' + lay(D.F[k].L, c.skin, c.ink) + '</g>' + (el.pBeard && D.B[el.pBeard] ? '<g transform="translate(' + D.bo[0] + ' ' + D.bo[1] + ')">' + lay(D.B[el.pBeard].L, c.skin, c.ink) + '</g>' : '') + (el.pAcc && D.A[el.pAcc] ? '<g transform="translate(' + D.ao[0] + ' ' + D.ao[1] + ')">' + lay(D.A[el.pAcc].L, c.skin, c.ink) + '</g>' : '') + '</g>' + txt(x + 68, y + 142, 15, D.F[k].n, ' text-anchor="middle" font-weight="700" fill="#333" paint-order="stroke" stroke="#fff" stroke-width="5"');
        });
        // 4. positions de la tête
        o += box(1530, 970, 840, 280, '4. Positions de la tête (T, R)');
        [['Droite', 0, 1], ['Penchée', -16, 1], ['Relevée', 16, 1], ['Regard arrière', 0, -1]].forEach((v, i) => {
            const x = 1600 + i * 200, y = 1010, s4 = 140 / 600;
            o += '<g transform="translate(' + (x + 75) + ' ' + (y + 175) + ') rotate(' + (-v[1]) + ') scale(' + (v[2] * s4).toFixed(4) + ' ' + s4.toFixed(4) + ') translate(' + (-D.hp[0]) + ' ' + (-D.hp[1]) + ')"><use href="#' + u + 'h"/></g>' + txt(x + 75, y + 210, 17, v[0], ' text-anchor="middle" font-weight="700" fill="#333" paint-order="stroke" stroke="#fff" stroke-width="6"');
        });
        // 5. mains
        o += box(1530, 1270, 840, 280, '5. Mains interchangeables');
        (D.M || []).forEach((m, i) => {
            const S = D.P[m[2]], ss = m[3]; if (!S || !S.pc[ss + 'Hd']) return; const hid = u + 'm' + i;
            defs += '<g id="' + hid + '">' + lay(S.L, c.fill, c.ink) + '</g><clipPath id="' + hid + 'c"><path clip-rule="evenodd" d="' + S.pc[ss + 'Hd'] + '"/></clipPath>';
            const w0 = S.j[ss + 'w'], tip = S.j[ss + 'h'], mid = [(w0[0] + tip[0]) / 2, (w0[1] + tip[1]) / 2], s5 = 0.3, x = 1580 + i * 92, y = 1400;
            o += '<g transform="translate(' + x + ' ' + y + ') scale(' + s5 + ') translate(' + (-mid[0]) + ' ' + (-mid[1]) + ')"><g clip-path="url(#' + hid + 'c)"><use href="#' + hid + '"/></g></g>' + txt(x, y + 118, 13, m[1], ' text-anchor="middle" fill="#333" paint-order="stroke" stroke="#fff" stroke-width="4"');
        });
        o += txt(40, 1585, 17, 'Illustrations Open Peeps — Pablo Stanley (openpeeps.com), licence CC0 · découpe et articulations : STORYBOARDO XIII', ' fill="#777"');
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + Wd + ' ' + Ht + '" width="' + Wd + '" height="' + Ht + '"><defs>' + defs + '</defs>' + o + '</svg>';
    }
    async function sheetPng(el) {
        const s = sheetSvg(el), im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); await im.decode();
        const c = document.createElement('canvas'); c.width = 2400; c.height = 1600; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0);
        return await new Promise(r => c.toBlob(r, 'image/png'));
    }
    function sheet() {
        const el = selEl(); if (!el || el.type !== 'peep') return; if (!D) { load().then(sheet).catch(() => { }); return; }
        const s = sheetSvg(el), nm = safeName('vue_eclatee_' + (el.name || D.P[pid(el)].n));
        modal('<h3>🧩 Vue éclatée<span class="close-x" onclick="closeModal()">✕</span></h3><p class="hint" style="margin-top:0">Le personnage, ses pièces détachées (chaque rond = une articulation du pantin), ses 30 expressions, les positions de la tête et les mains interchangeables.</p><div style="background:#fff;border-radius:10px;overflow:auto;max-height:62vh"><img alt="" style="width:100%;display:block" src="' + esc('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s)) + '"></div>' +
            '<div class="mb-actions"><button onclick="closeModal()">Fermer</button><button id="xpv-svg">⬇️ SVG (vectoriel)</button><button class="btn-big" id="xpv-png">⬇️ PNG</button></div>', 'wide');
        $('xpv-svg').onclick = () => download(new Blob([s], { type: 'image/svg+xml' }), 'STORYBOARDO_' + nm + '.svg', 'image/svg+xml');
        $('xpv-png').onclick = async () => { const b = await sheetPng(el); download(b, 'STORYBOARDO_' + nm + '.png', 'image/png'); };
    }
    // ---------- bibliothèque ----------
    const LCATS = [['standing', 'Debout'], ['sitting', 'Assis'], ['bust', 'Bustes']];
    function libHtml(q) {
        if (!D) { if (!failed) load().then(() => { if (prefs.libTab === 'pup') renderLibrary(); }).catch(() => { }); return '<div class="sb-h">🙂 Open Peeps</div><p class="hint">' + (failed ? '⚠️ Données Open Peeps introuvables.' : '⏳ Chargement des personnages…') + '</p>'; }
        const cat = prefs.peepCat || 'standing';
        const L = D.T.map((t, i) => ({ t, i })).filter(x => D.P[x.t[1]] && D.P[x.t[1]].c === cat && (!q || fold(x.t[0] + ' ' + D.P[x.t[1]].n + ' ' + (D.H[x.t[2]] || {}).n).includes(q)));
        return '<div class="sb-h">🙂 Open Peeps — prêts à articuler</div><div class="sb-chips">' + LCATS.map(c => '<span class="kw' + (cat === c[0] ? ' on' : '') + '" onclick="prefs.peepCat=\'' + c[0] + '\';savePrefs();renderLibrary()">' + c[1] + ' (' + D.T.filter(t => D.P[t[1]] && D.P[t[1]].c === c[0]).length + ')</span>').join('') + '<span class="kw" onclick="XPEEPS.addRandom()" title="Un personnage composé au hasard">🎲 Au hasard</span></div>' +
            '<div class="sb-thumbs sb-peeps">' + L.map(x => { const o = tplEl(x.i); return '<div class="sb-th" onclick="XPEEPS.addTpl(' + x.i + ')" title="Ajouter : ' + esc((x.t[0] ? x.t[0] + ' — ' : '') + D.P[x.t[1]].n) + '"><img src="' + esc(thumb(o)) + '" alt="" loading="lazy" style="object-fit:contain;background:#fff"><span>' + esc(x.t[0] || D.P[x.t[1]].n) + '</span></div>'; }).join('') + '</div>' +
            '<p class="hint">Pose, coiffure, expression, barbe, accessoires et mains se changent ensuite à droite. Illustrations Open Peeps (Pablo Stanley, CC0).</p>';
    }
    // ---------- branchement dans le moteur ----------
    if (typeof pupJoints === 'function' && typeof puppetSvg === 'function') {
        const _pj = pupJoints, _ps = puppetSvg, _pf = poseFromHandle, _pc = pupCycle, _ap = applyPose, _mp = mirrorPose, _rl = renderLibrary;
        const isP = el => el && el.type === 'peep';
        pupJoints = function (el) {
            if (isP(el)) { if (D) return joints(el); const J0 = _pj(Object.assign({}, el, { type: 'homme', view: '3q', pose: {} })); J0.hide = JOINT_KEYS.slice(); return J0; }
            return _pj(el);
        };
        puppetSvg = function (el) { return isP(el) ? svg(el) : _ps(el); };
        poseFromHandle = function (el, key, m) { if (isP(el)) { if (D) fromHandle(el, key, m); return; } return _pf(el, key, m); };
        const HEADT = [[0, 'droite'], [-14, 'penchée'], [14, 'relevée']];
        pupCycle = function (k) {
            const el = selEl(); if (!isP(el)) return _pc(k); if (!D) return;
            snap(); const id = pid(el);
            if (k === 'view') { el.flip = !el.flip; toast('⇋ Miroir — les Open Peeps sont dessinés de trois-quarts : le miroir les tourne de l’autre côté', 2500); }
            else if (k === 'headView') { const p = poseOf(el), i = HEADT.findIndex(h => Math.abs(h[0] - (p.head || 0)) < 1), n = HEADT[(i + 1) % HEADT.length]; p.head = n[0]; el.pose = p; el.poseOf = id; toast('🔄 Tête ' + n[1], 1500); }
            else if (k === 'headFlip') { el.headFlip = !el.headFlip; toast(el.headFlip ? '⇆ Regarde derrière lui' : '⇆ Regarde devant lui', 1500); }
            else if (k === 'expr') { const L = Object.keys(D.F), i = L.indexOf(el.pFace); el.pFace = L[(i + 1) % L.length]; toast('😀 ' + D.F[el.pFace].n, 1500); }
            dirty(); redrawEl(el); renderProps(); renderStripThumb(PN());
        };
        applyPose = function (id) {
            const el = selEl(); if (!isP(el)) return _ap(id); if (!D) return;
            const p = allPoses().find(x => x[0] === id); if (!p) return; snap();
            el.pose = Object.assign({}, rest(pid(el)), id === 'debout' ? POSE0 : {}, p[2]); el.poseOf = pid(el); dirty(); redrawEl(el); renderProps(); renderStripThumb(PN());
            const lk = locks(D.P[pid(el)]); if (lk.all || lk.r || lk.l) lockedToast(joints(el), lk.all ? 'legs' : 'r');
        };
        mirrorPose = function () {
            const el = selEl(); if (!isP(el)) return _mp(); if (!D) return; snap();
            const p = poseOf(el), q2 = Object.assign({}, p); ['UA', 'FA', 'Th', 'Sh'].forEach(k => { q2['l' + k] = p['r' + k]; q2['r' + k] = p['l' + k]; }); el.pose = q2; el.poseOf = pid(el); dirty(); redrawEl(el); renderStripThumb(PN());
        };
        renderLibrary = function () {
            _rl.apply(this, arguments);
            if (prefs.libTab !== 'pup') return; const box = $('lib-list'); if (!box) return;
            const q = fold(($('lib-search') || {}).value || '').trim(), first = box.querySelector('.sb-thumbs');
            const html = '<div id="xpeeps-lib">' + libHtml(q) + '</div>';
            if (first) first.insertAdjacentHTML('afterend', html); else box.insertAdjacentHTML('afterbegin', html);
        };
        // E : expression suivante
        document.addEventListener('keydown', e => {
            if (e.key.toLowerCase() !== 'e' || e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName || '') || e.target.isContentEditable) return;
            const el = selEl(); if (isP(el) && prefs.view === 'edit') { e.preventDefault(); e.stopImmediatePropagation(); pupCycle('expr'); }
        }, true);
        // un projet qui contient des Open Peeps charge les données tout de suite
        setTimeout(() => { try { if (P.panels.some(pn => pn.els.some(isP))) load().then(refresh).catch(() => { }); } catch (e) { } }, 0);
    }
    return { load, ready, addTpl, addRandom, shuffle, props, restPose, sheet, sheetSvg, sheetPng, still, svg, joints: el => D ? joints(el) : null, data: () => D };
})();
