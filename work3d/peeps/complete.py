# Reconstruction des parties cachées des pièces d'un pantin Open Peeps.
# Le dessin d'origine est « à plat » : ce qui est derrière un bras, sous un pull ou entre les jambes n'existe pas.
# Pour chaque pièce on calcule donc une forme COMPLÈTE (capsule du membre, enveloppe du torse, bassin arrondi),
# puis on remplit ce qui manque : aplat blanc ou noir selon le vêtement voisin + trait de contour sur le bord reconstruit.
import numpy as np, cv2, math
from scipy import ndimage as ndi
import seg
S = seg.S
TYPE_HW = {'UA': 44, 'FA': 35, 'Hd': 30, 'Th': 64, 'Sh': 54}   # demi-largeur typique (px à S = 0,5)
def disc(shape, c, r):
    m = np.zeros(shape, np.uint8); cv2.circle(m, (int(round(c[0])), int(round(c[1]))), int(round(r)), 1, -1); return m.astype(bool)
def capsule(shape, a, b, r):
    m = np.zeros(shape, np.uint8); cv2.line(m, (int(round(a[0])), int(round(a[1]))), (int(round(b[0])), int(round(b[1]))), 1, max(1, int(round(2 * r))))
    cv2.circle(m, (int(round(a[0])), int(round(a[1]))), int(round(r)), 1, -1); cv2.circle(m, (int(round(b[0])), int(round(b[1]))), int(round(r)), 1, -1); return m.astype(bool)
def hull(mask):
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out = np.zeros(mask.shape, np.uint8)
    if not cs: return out.astype(bool)
    pts = np.concatenate(cs); cv2.fillPoly(out, [cv2.convexHull(pts)], 1); return out.astype(bool)
def line_width(ink, thick):
    dt = ndi.distance_transform_edt(ink); thin = ink & ~thick
    mx = ndi.maximum_filter(dt, size=5); ridge = thin & (dt == mx) & (dt >= 1.5)
    if ridge.sum() < 30: return 6.0
    return float(np.clip(2 * np.median(dt[ridge]), 4, 11))
def hw_of(R, name, dtsil):
    inf = R['info'][name]; a = np.array(inf['a']); e = np.array(inf['e']); v = e - a; vals = []
    for t in np.linspace(0.25, 0.75, 9):
        x, y = a + v * t; xi, yi = int(round(x)), int(round(y))
        if 0 <= yi < dtsil.shape[0] and 0 <= xi < dtsil.shape[1]: vals.append(dtsil[yi, xi])
    ref = TYPE_HW[name[1:]]; m = float(np.percentile(vals, 30)) if vals else ref
    if name[1:] in ('UA', 'FA'):   # les rayons de la découpe butent sur les traits du manche : meilleure mesure de la largeur réelle
        est = (inf['rad'] - 14 * S) * 1.05; m = min(m, max(est, 0.5 * ref))
        return float(np.clip(m, 0.5 * ref, 1.18 * ref))
    return float(np.clip(m, 0.72 * ref, 1.18 * ref))
def complete(R):
    lab, sil, ink = R['lab'], R['sil'] > 0, R['ink'] > 0; names = R['names']; an = R['an']; info = R['info']; fr = R['frame']; ox, oy = fr[0], fr[1]
    shp = lab.shape; toP = lambda p: ((p[0] - ox) * S, (p[1] - oy) * S)
    dti = ndi.distance_transform_edt(ink)
    _core = (dti > 5.5).astype(np.uint8); _nc, _cl, _st, _ = cv2.connectedComponentsWithStats(_core, connectivity=8)
    _big = np.zeros(ink.shape, np.uint8)
    for _c in range(1, _nc):
        if _st[_c, cv2.CC_STAT_AREA] >= 700: _big[_cl == _c] = 1
    solid0 = ink & (cv2.dilate(_big, np.ones((5, 5), np.uint8)) > 0)
    V = {n: (lab == i) & sil for i, n in enumerate(names)}
    # --- affinage des étiquettes : un bras n'emporte pas le pull / la chemise qui dépassent de sa largeur réelle ---
    dtsil0 = ndi.distance_transform_edt(sil)
    base0 = V['torso'].copy()
    for s_ in 'rl':
        if s_ + 's' in an: base0 |= disc(shp, toP(an[s_ + 's']), 26)
    hull0 = hull(base0) & sil
    for i, n in enumerate(names):
        if n[1:] not in ('UA', 'FA') or n not in info: continue
        hw0 = hw_of(R, n, dtsil0); a0, e0 = np.array(info[n]['a']), np.array(info[n]['e'])
        cap0 = cv2.dilate(capsule(shp, a0, e0, hw0).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
        bad = (lab == i) & sil & ~cap0 & hull0
        lab[bad] = 0
    # un bras ne garde que sa propre largeur : ce qui dépasse (ourlet du pull, ceinture, pantalon noir) revient au corps voisin
    armsI = [i for i, n in enumerate(names) if n[1:] in ('UA', 'FA', 'Hd')]
    if armsI:
        nonarm = np.isin(lab, [i for i in range(len(names)) if i not in armsI]) & sil
        if nonarm.any():
            dn, (ny, nx) = ndi.distance_transform_edt(~nonarm, return_indices=True)
            for i in armsI:
                n = names[i]
                if n not in info: continue
                a0, e0 = np.array(info[n]['a']), np.array(info[n]['e'])
                if n.endswith('Hd'): continue
                hw0 = hw_of(R, n, dtsil0)
                cap0 = cv2.dilate(capsule(shp, a0, e0, hw0).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
                bad = (lab == i) & sil & ~cap0 & (dn <= 1.3 * hw0)
                lab[bad] = lab[ny[bad], nx[bad]]
            for i in armsI:   # noir plein (ceinture, pantalon) dans un bras clair : au corps voisin
                m = (lab == i) & sil
                if m.sum() < 50: continue
                sol = m & solid0
                if sol.sum() < 0.5 * m.sum():
                    lab[sol] = lab[ny[sol], nx[sol]]
    # contours des zones lissés (plus de dents d'escalier ni de coins vifs entre deux pièces) ; les mains restent intactes
    hdI = [i for i, n in enumerate(names) if n.endswith('Hd')]
    keep = np.isin(lab, hdI) | ~sil
    cand = [i for i in range(len(names)) if i not in hdI]
    if len(cand) > 1:
        G = np.stack([cv2.GaussianBlur(((lab == i) & sil & ~keep).astype(np.float32), (0, 0), 5) for i in cand], 0)
        new = np.array(cand, np.int16)[G.argmax(0)]; ok = sil & ~keep & (G.max(0) > 0.05)
        lab[ok] = new[ok]
    # une main ne garde que ses propres zones blanches fermées (poing, doigts) : pas le pantalon ou le pull blanc qui l'entoure
    if hdI and 'nonarm' in dir():
        wh = (sil & ~ink).astype(np.uint8); nw, cw, sw_, _ = cv2.connectedComponentsWithStats(wh, connectivity=4)
        bigw = np.zeros(shp, bool)
        for c_ in range(1, nw):
            if sw_[c_, cv2.CC_STAT_AREA] > 9000: bigw |= (cw == c_)
        for i in hdI:
            bad = (lab == i) & bigw
            if bad.any(): lab[bad] = lab[ny[bad], nx[bad]]
    # main cachée (dans la poche) : l'avant-bras s'arrête au poignet, la poche reste au torse
    yy_, xx_ = np.mgrid[0:shp[0], 0:shp[1]]
    for i, n in enumerate(names):
        if n[1:] == 'FA' and n[0] in an.get('hidden', []) and n in info:
            a_, e_ = np.array(info[n]['a']), np.array(info[n]['e']); v_ = e_ - a_; L_ = float(np.hypot(*v_)) or 1
            t_ = ((xx_ - a_[0]) * v_[0] + (yy_ - a_[1]) * v_[1]) / (L_ * L_)
            lab[(lab == i) & sil & (t_ > 1.08)] = 0
    # haut de cuisse arrondi (au lieu d'un coin vif qui dépasse quand la jambe pivote)
    for i, n in enumerate(names):
        if n[1:] == 'Th' and n in info:
            a_, e_ = np.array(info[n]['a']), np.array(info[n]['e']); v_ = e_ - a_; L_ = float(np.hypot(*v_)) or 1
            hwt = hw_of(R, n, dtsil0); t_ = ((xx_ - a_[0]) * v_[0] + (yy_ - a_[1]) * v_[1]) / L_
            d_ = np.hypot(xx_ - a_[0], yy_ - a_[1])
            lab[(lab == i) & sil & (t_ < hwt * 1.3) & (d_ > hwt * 1.05)] = 0
    V = {n: (lab == i) & sil for i, n in enumerate(names)}
    dti = ndi.distance_transform_edt(ink)
    core = (dti > 5.5).astype(np.uint8); nc, cl, st, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
    big = np.zeros(ink.shape, np.uint8)
    for c in range(1, nc):
        if st[c, cv2.CC_STAT_AREA] >= 700: big[cl == c] = 1   # vrais aplats noirs (vêtements) : grandes zones, pas les croisements de traits
    solid = ink & (cv2.dilate(big, np.ones((5, 5), np.uint8)) > 0)
    thick = ink & (dti > 2.0)
    lw = line_width(ink, thick); dtsil = ndi.distance_transform_edt(sil); silD = cv2.dilate(sil.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    hw = {n: hw_of(R, n, dtsil) for n in names if n in info and n[1:] != 'Hd'}
    for n in names:
        if n in info and n[1:] == 'Hd': hw[n] = float(np.clip(info[n]['rad'] / 1.6, 26, 40))
    # --- formes complètes ---
    C = {}
    for n in names:
        if n == 'torso': continue
        a, e = toP(an[R['bones'][[b[0] for b in R['bones']].index(n)][1]]), toP(an[R['bones'][[b[0] for b in R['bones']].index(n)][2]])
        if n.endswith('Hd'): C[n] = V[n].copy()   # la main garde son dessin tel quel (le poignet est couvert par l'avant-bras)
        else:
            if n.endswith('Sh'): e = info[n]['e']  # jusqu'au pied
            C[n] = capsule(shp, a, e, hw[n] * (0.74 if n[1:] in ('UA', 'FA') else 1.0))   # un peu plus fin que le membre : jamais de halo autour du dessin
    # torse : enveloppe convexe du torse visible + épaules, bassin arrondi
    T = V['torso'].copy(); sh = []
    shd = [toP(an[k]) for k in ('rs', 'ls') if k in an]
    mid = (sum(p[0] for p in shd) / len(shd), sum(p[1] for p in shd) / len(shd)) if len(shd) == 2 else toP(an['n']) if 'n' in an else (shp[1] / 2, shp[0] / 3)
    for s in 'rl':
        if s + 's' in an and (s + 'UA') in hw:
            j = toP(an[s + 's']); v = np.array(mid) - np.array(j); L = float(np.hypot(*v)) or 1; r = hw[s + 'UA'] * 0.5
            c = np.array(j) + v / L * min(L, r); sh.append(disc(shp, c, r))   # le bord du torse passe par l'articulation, le bras recouvre sa moitié extérieure
    base = T.copy()
    for d in sh: base |= d
    hips = []
    hipY = None
    if 'rp' in an and 'lp' in an:
        hipY = max(toP(an['rp'])[1], toP(an['lp'])[1])
        for s in 'rl':
            if (s + 'Th') in hw: hips.append(disc(shp, toP(an[s + 'p']), hw[s + 'Th'] * 0.95))
            else: hips.append(disc(shp, toP(an[s + 'p']), TYPE_HW['Th'] * 0.9))
    Hu = hull(base)
    quad = np.zeros(shp, np.uint8)
    if hips: cv2.fillPoly(quad, [np.array([toP(an['rs']) if 'rs' in an else toP(an['n']), toP(an['ls']) if 'ls' in an else toP(an['n']), toP(an['lp']), toP(an['rp'])], np.int32)], 1)
    below = (np.arange(shp[0])[:, None] >= (hipY - 6 if hipY is not None else 0))
    pel = ((np.logical_or.reduce(hips) if hips else np.zeros(shp, bool)) & below) | quad.astype(bool)
    C['torso'] = (Hu | pel | T)
    # --- remplissage ---
    out = {}
    for i, n in enumerate(names):
        Vk = V[n]; Ck = C[n] & (silD | Vk)
        ext = Ck & ~Vk
        # aplat : classe de l'intérieur visible le plus proche (noir plein ou blanc)
        interior = Vk & (~ink | solid)
        if interior.sum() < 40: interior = (V['torso'] & (~ink | solid)) if n != 'torso' else interior
        if interior.sum() < 10: out[n] = (np.zeros(shp, bool), np.zeros(shp, bool)); continue
        _, (iy, ix) = ndi.distance_transform_edt(~interior, return_indices=True)
        cls = solid[iy, ix]
        if n == 'torso' and hipY is not None:   # au-dessus de la ceinture : la couleur du haut (pas le pantalon noir voisin)
            above = np.arange(shp[0])[:, None] < hipY - 6; ia = interior & above
            if ia.sum() > 80:
                _, (jy, jx) = ndi.distance_transform_edt(~ia, return_indices=True); cls = np.where(above, solid[jy, jx], cls)
        if n[1:] in ('UA', 'FA', 'Hd'): cls = np.full(shp, bool(solid[interior].mean() > 0.5))   # membre : une seule couleur de manche
        # contour : bande intérieure le long du bord reconstruit
        w = int(round(lw))
        edge = Ck & ~(cv2.erode(Ck.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * w + 1, 2 * w + 1))) > 0)
        # pas de trait là où le bord est déjà dessiné (encre visible à moins de 2 px) ou contre la silhouette d'origine non cachée
        near_ink = cv2.dilate((ink & Vk).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        band = edge & ext & ~near_ink
        fill = ext & ~cls; blk = (ext & cls) | band
        if n[1:] == 'Th' and hipY is not None:
            up = np.arange(shp[0])[:, None] < hipY - 4; fill &= ~up; blk &= ~up
        out[n] = (fill, blk)
    return out, dict(hw=hw, lw=lw, C=C)
