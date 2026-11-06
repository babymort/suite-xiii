# Découpe des poses Open Peeps en pièces articulées (régions -> polygones de découpe)
import svgp, numpy as np, cv2, math, json, sys
from scipy import ndimage as ndi
from ann import J as ANN
A = '/home/claude/peeps/Flat Assets/Separate Atoms/'
S = 0.5  # px par unité
# os : nom, articulation de départ, d'arrivée, côté, rapport de prolongement
BONES = [('rUA', 'rs', 're', 'r'), ('rFA', 're', 'rw', 'r'), ('rHd', 'rw', 'rh', 'r'), ('lUA', 'ls', 'le', 'l'), ('lFA', 'le', 'lw', 'l'), ('lHd', 'lw', 'lh', 'l'),
         ('rTh', 'rp', 'rk', 'legs'), ('rSh', 'rk', 'ra', 'legs'), ('lTh', 'lp', 'lk', 'legs'), ('lSh', 'lk', 'la', 'legs')]
PARENT = {'rFA': 'rUA', 'rHd': 'rFA', 'lFA': 'lUA', 'lHd': 'lFA', 'rSh': 'rTh', 'lSh': 'lTh', 'rUA': 'torso', 'lUA': 'torso', 'rTh': 'torso', 'lTh': 'torso'}
def raster(layers, frame):
    ox, oy, W, H = frame; Wp, Hp = int(W * S), int(H * S)
    sil = np.zeros((Hp, Wp), np.uint8); ink = np.zeros_like(sil); bg = np.zeros_like(sil)
    for l in layers:
        lm = np.zeros_like(sil)
        for s in l[2]:
            p = np.array([[(x - ox) * S, (y - oy) * S] for x, y in svgp.flatten(s, 8)], np.float32)
            t = np.zeros_like(sil); cv2.fillPoly(t, [np.round(p * 8).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=3); lm ^= t
        if l[0] == 'ink': ink |= lm
        else: bg |= lm
        sil |= lm
    return sil, ink, bg
def segd(P, a, b):  # distance des pixels P (N,2) au segment ab
    a = np.array(a, float); b = np.array(b, float); v = b - a; L = (v * v).sum() or 1
    t = np.clip(((P - a) * v).sum(1) / L, 0, 1); q = a + t[:, None] * v
    return np.sqrt(((P - q) ** 2).sum(1))
def run(name, verbose=False):
    an = ANN[name]; cat = name.split('/')[0]
    r = svgp.load(A + 'pose/' + name + '.svg'); layers = r['layers']
    xs, ys = [], []
    for l in layers:
        for s in l[2]:
            for p in svgp.flatten(s, 4): xs.append(p[0]); ys.append(p[1])
    bb = (min(xs), min(ys), max(xs), max(ys)); M = 60
    frame = (math.floor(bb[0] - M), math.floor(bb[1] - M), math.ceil(bb[2] - bb[0] + 2 * M), math.ceil(bb[3] - bb[1] + 2 * M))
    sil, ink, bg = raster(layers, frame); ox, oy = frame[0], frame[1]
    lock = set(an.get('lock', []))
    bones = [b for b in BONES if b[3] not in lock and b[1] in an and b[2] in an and not (b[0].endswith('Hd') and b[3] in an.get('hidden', []))]
    toP = lambda p: ((p[0] - ox) * S, (p[1] - oy) * S)
    names = ['torso'] + [b[0] for b in bones]
    lab = np.zeros(sil.shape, np.int16)  # 0 = torse
    ys_, xs_ = np.nonzero(sil); P = np.stack([xs_, ys_], 1).astype(float)
    dt = ndi.distance_transform_edt(sil)
    info = {}
    if bones:
        D = []; R = []
        hipY = (max(an['rp'][1], an['lp'][1]) - oy) * S if 'rp' in an else 1e9
        def ray(px, py, nx, ny, mask, lim):
            for k in range(1, int(lim)):
                x, y = int(round(px + nx * k)), int(round(py + ny * k))
                if x < 0 or y < 0 or x >= mask.shape[1] or y >= mask.shape[0] or mask[y, x]: return k
            return lim
        for b in bones:
            a, e = toP(an[b[1]]), toP(an[b[2]])
            if b[0].endswith('Hd'): e = (e[0] + (e[0] - a[0]) * 0.6, e[1] + (e[1] - a[1]) * 0.6)  # bout des doigts
            if b[0].endswith('Sh'): e = (e[0], e[1] + 40 * S)  # tibia : jusqu'au pied
            vx, vy = e[0] - a[0], e[1] - a[1]; Ln = math.hypot(vx, vy) or 1; nx, ny = -vy / Ln, vx / Ln
            cap = (200 if b[3] == 'legs' else 70 if b[0].endswith('Hd') else 95) * S
            rs_ = []
            for t in np.linspace(0.25, 0.75, 9):
                px, py = a[0] + vx * t, a[1] + vy * t
                yi, xi = int(round(py)), int(round(px))
                m = ink if not ink[yi, xi] else (1 - sil)  # vêtement noir : bord de la silhouette
                d1 = ray(px, py, nx, ny, m, cap); d2 = ray(px, py, -nx, -ny, m, cap); rs_.append(max(d1, d2))
            rad = float(np.median(rs_)) + 14 * S
            if b[0].endswith('Hd'): rad = max(rad, 75 * S, an.get('hrad', {}).get(b[3], 0) * S)
            if b[3] == 'legs': rad = max(rad, 140 * S)
            d = segd(P, a, e) / rad
            if b[0].endswith('Th'):  # haut de cuisse coupé net à la hanche
                t_ = ((P[:, 0] - a[0]) * vx + (P[:, 1] - a[1]) * vy) / (Ln * Ln); d = np.where(t_ < -0.02, 9.0, d)
            D.append(d); info[b[0]] = dict(a=a, e=e, rad=rad)
        D = np.stack(D, 1)
        # priorité aux bras et aux mains (devant les cuisses), puis aux jambes, sinon le torse
        armi = [i for i, b in enumerate(bones) if b[3] != 'legs']; legi0 = [i for i, b in enumerate(bones) if b[3] == 'legs']
        L0 = np.zeros(len(P), np.int16)
        for grp in (armi, legi0):
            if not grp: continue
            Dg = D[:, grp]; bg_ = Dg.argmin(1); okg = (Dg[np.arange(len(bg_)), bg_] <= 1.0) & (L0 == 0)
            L0[okg] = np.array(grp)[bg_[okg]] + 1
        # vêtements noirs (aplats d'encre épais) : jamais emportés par un bras ou une main de couleur claire
        dti = ndi.distance_transform_edt(ink); thick = cv2.dilate((dti > 4.5).astype(np.uint8), np.ones((7, 7), np.uint8))[ys_, xs_] > 0
        for i, b in enumerate(bones):
            if b[3] == 'legs': continue
            reg = L0 == i + 1; n = reg.sum()
            if n and (b[0].endswith('Hd') or (reg & thick).sum() < 0.5 * n): L0[reg & thick] = 0
        # sous les hanches : jamais le torse — la jambe la plus proche (sauf mains / bras)
        legi = [i for i, b in enumerate(bones) if b[3] == 'legs']
        if legi:
            low = (P[:, 1] > hipY + 30 * S) & (L0 == 0)
            if low.any():
                Dl = np.stack([segd(P[low], info[bones[i][0]]['a'], info[bones[i][0]]['e']) for i in legi], 1)
                L0[low] = np.array(legi)[Dl.argmin(1)] + 1
        lab[ys_, xs_] = L0
    # aimantation sur les traits : chaque zone blanche fermée prend l'étiquette majoritaire
    white = (bg & (1 - ink)).astype(np.uint8)
    nc, comp = cv2.connectedComponents(white, connectivity=4)
    tot = sil.sum()
    for c in range(1, nc):
        m = comp == c; n = m.sum()
        if n < 30 or n > tot * 0.2: continue
        h = np.bincount(lab[m].ravel(), minlength=len(names)); k = h.argmax()
        if h[k] >= n * 0.7: lab[m] = k
    if bones and 'rp' in an:
        legs_ = [k for k, n in enumerate(names) if n[1:] in ('Th', 'Sh')]
        if legs_:
            hy = (max(an['rp'][1], an['lp'][1]) - oy) * S + 30 * S
            yy, xx = np.nonzero((lab == 0) & (sil > 0)); m = yy > hy
            if m.any():
                Pq = np.stack([xx[m], yy[m]], 1).astype(float)
                Dl = np.stack([segd(Pq, info[names[k]]['a'], info[names[k]]['e']) for k in legs_], 1)
                lab[yy[m], xx[m]] = np.array(legs_)[Dl.argmin(1)]
    # îlots : un morceau isolé d'une étiquette (éclat d'encre, doigt oublié) rejoint l'étiquette voisine majoritaire
    for it in range(2):
        for k in range(len(names)):
            m = ((lab == k) & (sil > 0)).astype(np.uint8)
            if not m.any(): continue
            nc2, cc, stt, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
            if nc2 <= 2: continue
            big = stt[1:, cv2.CC_STAT_AREA].max()
            for c in range(1, nc2):
                a = stt[c, cv2.CC_STAT_AREA]
                if a >= max(400, big * 0.08): continue
                cm = cc == c; ring = cv2.dilate(cm.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool) & ~cm & (sil > 0)
                nb = lab[ring]; nb = nb[nb != k]
                if len(nb): lab[cm] = np.bincount(nb, minlength=len(names)).argmax()
    # pixels hors silhouette : étiquette du pixel de silhouette le plus proche
    _, (iy, ix) = ndi.distance_transform_edt(1 - sil, return_indices=True)
    full = lab[iy, ix]
    return dict(name=name, cat=cat, frame=frame, sil=sil, ink=ink, bg=bg, lab=full, names=names, bones=bones, info=info, an=an, layers=layers)
COLS = [(255, 220, 180), (120, 180, 255), (80, 120, 255), (40, 60, 200), (255, 140, 140), (230, 80, 80), (180, 30, 30), (140, 230, 140), (60, 170, 60), (220, 170, 255), (150, 90, 220)]
def overlay(R, path):
    lab, sil, ink = R['lab'], R['sil'], R['ink']; H, W = lab.shape
    img = np.full((H, W, 3), 255, np.uint8)
    for k, n in enumerate(R['names']):
        c = COLS[[ 'torso','rUA','rFA','rHd','lUA','lFA','lHd','rTh','rSh','lTh','lSh'].index(n)]
        m = (lab == k) & (sil > 0); img[m] = c
        mo = (lab == k) & (sil == 0); img[mo] = [int(v * 0.15 + 255 * 0.85) for v in c]
    img[ink > 0] = (img[ink > 0] * 0.25).astype(np.uint8)
    for n, i in R['info'].items():
        cv2.line(img, tuple(int(v) for v in i['a']), tuple(int(v) for v in i['e']), (0, 0, 0), 2)
        cv2.circle(img, tuple(int(v) for v in i['a']), 5, (0, 0, 0), -1)
    cv2.imwrite(path, img[:, :, ::-1]); return path
if __name__ == '__main__':
    out = []
    for n in sys.argv[1:]:
        R = run(n); out.append(overlay(R, '/tmp/claude-0/-home-claude/8e592bf0-1121-5e8e-b31c-4451140c5b35/scratchpad/seg_' + n.replace('/', '_') + '.png'))
    print(out)
