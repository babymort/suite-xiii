# Construit data/openpeeps.json pour STORYBOARDO : poses découpées, têtes, visages, barbes, accessoires, personnages prêts
import svgp, seg, comp, tpl, complete, numpy as np, cv2, json, glob, os, math, re
from ann import J as ANN
A = seg.A; S = seg.S
HP = (225, 480)  # pivot de la tête (repère de la tête) : haut du cou
HC = (236, 285)  # centre de la tête
def R(v): return int(round(v))
def num(v, first=False):
    s = str(v); return s
def enc_nums(vals):
    out = ''
    for i, v in enumerate(vals):
        s = str(v)
        out += s if (i == 0 or s[0] == '-') else ' ' + s
    return out
def enc_path(subs, dx=0, dy=0):
    """sous-chemins (béziers) -> chemin SVG compact en entiers relatifs"""
    o = []
    for s in subs:
        p = (R(s['start'][0] + dx), R(s['start'][1] + dy)); o.append('M' + enc_nums(p)); last = None
        for g in s['segs']:
            if g[0] == 'L':
                q = (R(g[1][0] + dx), R(g[1][1] + dy)); c = 'l'; vals = (q[0] - p[0], q[1] - p[1]); p = q
            else:
                pts = [(R(x + dx), R(y + dy)) for x, y in g[1:]]; c = 'c'; vals = tuple(v for q in pts for v in (q[0] - p[0], q[1] - p[1])); p = pts[2]
            body = enc_nums(vals)
            if c == last: o.append(body if body[0] == '-' else ' ' + body)
            else: o.append(c + body)
            last = c
        if s['closed']: o.append('z')
    return ''.join(o)
def enc_poly(polys):
    o = []
    for poly in polys:
        p = poly[0]; o.append('M' + enc_nums(p)); prev = p; first = True
        for q in poly[1:]:
            d = (q[0] - prev[0], q[1] - prev[1]); prev = q
            b = enc_nums(d); o.append(('l' + b) if first else (b if b[0] == '-' else ' ' + b)); first = False
        o.append('z')
    return ''.join(o)
def layers_out(layers, dx=0, dy=0):
    out = []
    for l in layers:
        t = 0 if l[0] == 'bg' else 1 if l[0] == 'ink' else l[0]
        out.append([t, enc_path(l[2], dx, dy)])
    return out
def bbox_layers(layers):
    xs, ys = [], []
    for l in layers:
        for s in l[2]:
            for p in svgp.flatten(s, 4): xs.append(p[0]); ys.append(p[1])
    return [R(min(xs)), R(min(ys)), R(max(xs)), R(max(ys))]
def polys_of(mask, ox, oy):
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    out = []
    for c in cs:
        if cv2.contourArea(c) < 40: continue
        c = cv2.approxPolyDP(c, 0.9, True)
        if len(c) < 3: continue
        out.append([(R(p[0][0] / S + ox), R(p[0][1] / S + oy)) for p in c])
    return out
def disc(shape, c, r):
    m = np.zeros(shape, np.uint8); cv2.circle(m, (int(c[0]), int(c[1])), int(r), 1, -1); return m
NAMES_POSE = {'blazer': 'Main sur la hanche', 'crossed_arms': 'Bras croisés', 'easing': 'Décontracté', 'pointing_finger': 'Doigt levé', 'polka_dots': 'Pull à pois', 'resting': 'Main sur la poche',
    'robot_dance': 'Main tendue', 'shirt': 'Chemise', 'walking': 'Marche', 'bike': 'À vélo', 'closed_legs': 'Assis, genoux relevés', 'crossed_legs': 'Assis, jambe croisée', 'hands_back': 'Assis par terre',
    'mid': 'Assis, penché', 'one_leg_up': 'Assis, pied sur le siège', 'wheelchair': 'Fauteuil roulant'}
def pose_label(n):
    b = n.split('/')[1]; m = re.match(r'(.*?)-(\d)$', b); base, k = (m.group(1), m.group(2)) if m else (b, '')
    lab = NAMES_POSE.get(base, base)
    if base == 'shirt': lab = 'Chemise et short' if k in ('1', '2') else 'Chemise et pantalon'; k = {'1': '1', '2': '2', '3': '1', '4': '2'}[k]
    return lab + (' ' + k if k else '')
def build_pose(name):
    r = seg.run(name); an = r['an']; cat = r['cat']; ox, oy = r['frame'][0], r['frame'][1]
    ext, cinf = complete.complete(r)   # affine aussi les étiquettes (r['lab'] modifié sur place)
    lab, sil = r['lab'], r['sil']; names = r['names']; info = r['info']
    layers = r['layers']; bb = bbox_layers(layers); ground = bb[3]
    hp = (comp.OFF[cat][0] + HP[0], comp.OFF[cat][1] + HP[1])  # cou (attache de la tête), repère de la pose
    j = {k: [R(v[0]), R(v[1])] for k, v in an.items() if isinstance(v, tuple)}
    j['n'] = [R(hp[0]), R(hp[1])]
    if 'rp' in j: j['p'] = [R((j['rp'][0] + j['lp'][0]) / 2), R((j['rp'][1] + j['lp'][1]) / 2)]
    else: j['p'] = [j['n'][0], R(min(ground - 300, hp[1] + 900))]
    toP = lambda p: ((p[0] - ox) * S, (p[1] - oy) * S)
    pcs = {}; exs = {}; H, W = lab.shape
    idx = {n: i for i, n in enumerate(names)}
    hw = cinf['hw']
    JN = {'UA': ('s', 'e'), 'FA': ('e', 'w'), 'Th': ('p', 'k'), 'Sh': ('k', None), 'Hd': ('w', None)}
    for i, n in enumerate(names):
        m = (lab == i).astype(bool)
        if n != 'torso' and n in info and n in hw:
            sd, t = n[0], n[1:]; q = lambda k: toP(an[sd + k])
            nb = lambda nm: (lab == idx[nm]) if nm in idx else np.zeros(m.shape, bool)
            rr = hw[n] * (0.95 if t != 'Hd' else 1.0)
            if t == 'UA': m = m | (disc(m.shape, q('e'), rr).astype(bool) & nb(sd + 'FA'))
            elif t == 'FA': m = m | (disc(m.shape, q('e'), rr).astype(bool) & nb(sd + 'UA')) | (disc(m.shape, q('w'), rr).astype(bool) & nb(sd + 'Hd'))
            elif t == 'Hd': m = m | (disc(m.shape, q('w'), rr).astype(bool) & nb(sd + 'FA'))
            elif t == 'Th': m = m | (disc(m.shape, q('k'), rr).astype(bool) & nb(sd + 'Sh'))
            elif t == 'Sh': m = m | (disc(m.shape, q('k'), rr).astype(bool) & nb(sd + 'Th'))
        m = cv2.dilate(m.astype(np.uint8), np.ones((5, 5), np.uint8))
        pcs[n] = enc_poly(polys_of(m, ox, oy))
        f, k = ext[n]
        if f.any() or k.any(): exs[n] = [enc_poly(polys_of(cv2.dilate(f.astype(np.uint8), np.ones((3, 3), np.uint8)), ox, oy)), enc_poly(polys_of(cv2.dilate(k.astype(np.uint8), np.ones((3, 3), np.uint8)), ox, oy))]
    patchA = patchL = ''
    ce = {}
    for i, n in enumerate(names):
        yy, xx = np.nonzero((lab == i) & (sil > 0))
        if len(xx): ce[n] = [R(xx.mean() / S + ox), R(yy.mean() / S + oy)]
    out = dict(c=cat, n=pose_label(name), L=layers_out(layers), j=j, lk=an.get('lock', []), hid=an.get('hidden', []), pc=pcs, ex=exs, pa=patchA, pl=patchL, g=ground, bb=bb, ce=ce)
    return out
def build_bust(f):
    r = svgp.load(f); L = r['layers']; bb = bbox_layers(L); hp = (comp.OFF['bust'][0] + HP[0], comp.OFF['bust'][1] + HP[1])
    j = {'n': [R(hp[0]), R(hp[1])], 'p': [R(hp[0]), bb[3] - 60]}
    return dict(c='bust', n=BUST_FR.get(os.path.basename(f)[:-4], os.path.basename(f)[:-4]), L=layers_out(L), j=j, lk=['r', 'l', 'legs'], hid=[], pc={}, pa='', pl='', g=bb[3], bb=bb, ce={})
BUST_FR = {'Blazer Black Tee': 'Veste et tee-shirt noir', 'Button Shirt 1': 'Chemise 1', 'Button Shirt 2': 'Chemise 2', 'Coffee': 'Tasse de café', 'Device': 'Téléphone', 'Dress': 'Robe', 'Explaining': 'Explique',
    'Fur Jacket': 'Veste fourrée', 'Gaming': 'Manette de jeu', 'Gym Shirt': 'Débardeur', 'Hoodie': 'Sweat à capuche', 'Killer': 'Couteau', 'Macbook': 'Ordinateur portable', 'Paper': 'Lit un papier',
    'Pointing Up': 'Doigt levé', 'Polka Dot Jacket': 'Veste à pois', 'Polo and Sweater': 'Polo et pull', 'Shirt and Coat': 'Chemise et manteau', 'Sporty Tee': 'Tee-shirt sport', 'Striped Pocket Tee': 'Tee-shirt à poche rayée',
    'Striped Tee': 'Marinière', 'Sweater Dots': 'Pull moucheté', 'Sweater': 'Pull, bras croisés', 'Tee 1': 'Tee-shirt blanc', 'Tee 2': 'Tee-shirt noir', 'Tee Arms Crossed': 'Bras croisés', 'Tee Selena': 'Tee-shirt imprimé',
    'Thunder T-Shirt': 'Tee-shirt éclair', 'Turtleneck': 'Col roulé', 'Whatever': 'Bof !'}
HEAD_FR = {'Afro': 'Afro', 'Bangs 2': 'Carré à frange', 'Bangs': 'Carré clair à frange', 'Bantu Knots': 'Nœuds bantous', 'Bear': 'Ébouriffés clairs', 'Bun 2': 'Chignon haut', 'Bun': 'Chignon et bandeau', 'Buns': 'Deux chignons',
    'Cornrows 2': 'Tresses longues', 'Cornrows': 'Queue tressée', 'Flat Top Long': 'Brosse haute', 'Flat Top': 'Brosse', 'Gray Bun': 'Chignon clair', 'Gray Medium': 'Mi-longs clairs', 'Gray Short': 'Courts clairs',
    'Hijab': 'Hijab', 'Long Afro': 'Afro volumineux', 'Long Bangs': 'Longs à frange', 'Long Curly': 'Longs bouclés', 'Long': 'Longs ondulés', 'Medium 1': 'Carré', 'Medium 2': 'Mi-longs attachés', 'Medium 3': 'Mi-longs',
    'Medium Bangs 2': 'Bouclés clairs', 'Medium Bangs 3': 'Couettes à frange', 'Medium Bangs': 'Mi-longs à frange', 'Medium Straight': 'Raie au milieu', 'Mohawk 2': 'Petite crête', 'Mohawk': 'Crête', 'No Hair 1': 'Chauve',
    'No Hair 2': 'Dégarni', 'No Hair 3': 'Crâne rasé', 'Pomp': 'Banane', 'Shaved 1': 'Courts arrondis', 'Shaved 2': 'Courts texturés', 'Shaved 3': 'Ébouriffés', 'Short 1': 'Courts', 'Short 2': 'Courts 2', 'Short 3': 'Courts frisés',
    'Short 4': 'Courts ondulés clairs', 'Short 5': 'Courts en bataille', 'Turban': 'Turban', 'Twists 2': 'Frisés', 'Twists': 'Vanilles', 'hat-beanie': 'Bonnet', 'hat-hip': 'Chapeau'}
FACE_FR = [('Calm', 'Calme'), ('Smile', 'Sourire'), ('Smile Big', 'Grand sourire'), ('Smile LOL', 'Mort de rire'), ('Smile Teeth Gap', 'Sourire malicieux'), ('Cheeky', 'Coquin'), ('Cute', 'Attendri'), ('Loving Grin 1', 'Amoureux'),
    ('Loving Grin 2', 'Amoureux 2'), ('Eating Happy', 'Gourmand'), ('Awe', 'Émerveillé'), ('Explaining', 'Explique'), ('Driven', 'Déterminé'), ('Serious', 'Sérieux'), ('Solemn', 'Grave'), ('Suspicious', 'Méfiant'),
    ('Contempt', 'Mépris'), ('Blank', 'Blasé'), ('Tired', 'Fatigué'), ('Eyes Closed', 'Yeux fermés'), ('Concerned', 'Inquiet'), ('Concerned Fear', 'Inquiet, apeuré'), ('Fear', 'Peur'), ('Hectic', 'Paniqué'),
    ('Angry with Fang', 'Fâché'), ('Rage', 'Colère'), ('Very Angry', 'Furieux'), ('Old', 'Âgé'), ('Monster', 'Monstre'), ('Cyclops', 'Cyclope')]
BEARD_FR = {'Chin': 'Collier', 'Full': 'Barbe', 'Full 2': 'Barbe 2', 'Full 3': 'Barbe 3', 'Full 4': 'Barbe 4', 'Goatee 1': 'Bouc', 'Goatee 2': 'Bouc 2'}
ACC_FR = {'Eyepatch': 'Cache-œil', 'Glasses': 'Lunettes', 'Glasses 2': 'Lunettes 2', 'Glasses 3': 'Lunettes 3', 'Glasses 4': 'Lunettes 4', 'Glasses 5': 'Lunettes 5', 'Sunglasses': 'Lunettes de soleil', 'Sunglasses 2': 'Lunettes de soleil 2'}
HANDS = [('ouverte', 'Ouverte', 'standing/shirt-1', 'r'), ('detendue', 'Détendue', 'standing/easing-1', 'r'), ('pendante', 'Pendante', 'standing/polka_dots', 'r'), ('hanche', 'Sur la hanche', 'standing/blazer-1', 'r'),
    ('poche', 'Sur la poche', 'standing/resting-1', 'r'), ('long', 'Le long du corps', 'standing/pointing_finger-1', 'r'), ('pointe', 'Doigt levé', 'standing/pointing_finger-1', 'l'),
    ('paume', 'Paume tendue', 'standing/robot_dance-1', 'l'), ('salut', 'Salut', 'sitting/wheelchair', 'l')]
NAMES = ['Alex', 'Sam', 'Charlie', 'Camille', 'Sacha', 'Lou', 'Morgan', 'Noa', 'Eden', 'Andréa', 'Robin', 'Jo', 'Maé', 'Ange', 'Dominique', 'Claude', 'Swann', 'Alix', 'Ariel', 'Élie', 'Kim', 'Loan', 'Louison', 'Nour', 'Yaël', 'Tal', 'Joan', 'Jordan', 'Marley', 'Mika', 'Océan', 'Quinn', 'Sky', 'Taylor', 'Gaël', 'Jessy', 'Lison', 'Ilan', 'Kelly', 'Lenny', 'Milan', 'Nino', 'Rémy', 'Sasha', 'Teddy', 'Yuna', 'Ayo', 'Nikita']
def atom(dirn, nm):
    f = A + dirn + '/' + nm + '.svg'; return layers_out(svgp.load(f)['layers'])
def main(out):
    D = dict(v=1, lic='Open Peeps — Pablo Stanley (openpeeps.com) — licence CC0', hp=HP, hc=HC, off=comp.OFF, fo=comp.FACE, bo=comp.FH, ao=comp.ACC, P={}, H={}, F={}, B={}, A={}, T=[], M=[])
    for n in sorted(ANN): D['P'][n] = build_pose(n); print('pose', n, sum(len(x[1]) for x in D['P'][n]['L']), sum(len(v) for v in D['P'][n]['pc'].values()))
    for f in sorted(glob.glob(A + 'body/*.svg')): D['P']['bust/' + os.path.basename(f)[:-4]] = build_bust(f)
    for f in sorted(glob.glob(A + 'head/*.svg')): nm = os.path.basename(f)[:-4]; D['H'][nm] = dict(n=HEAD_FR.get(nm, nm), L=atom('head', nm))
    for nm, fr in FACE_FR: D['F'][nm] = dict(n=fr, L=atom('face', nm))
    for f in sorted(glob.glob(A + 'facial-hair/*.svg')):
        nm = os.path.basename(f)[:-4]
        if nm.startswith('*'): continue
        D['B'][nm] = dict(n=BEARD_FR.get(nm, nm.replace('Moustache', 'Moustache')), L=atom('facial-hair', nm))
    for f in sorted(glob.glob(A + 'accessories/*.svg')):
        nm = os.path.basename(f)[:-4]
        if nm.startswith('*'): continue
        D['A'][nm] = dict(n=ACC_FR.get(nm, nm), L=atom('accessories', nm))
    # personnages prêts (modèles Open Peeps)
    idmap = lambda g, pre: g.split('/')[-1].replace('mono/', '')
    heads = {k.replace(' ', '-'): k for k in D['H']}; faces = {k.replace(' ', '-'): k for k in D['F']}; beards = {k.replace(' ', '-'): k for k in D['B']}; accs = {k.replace(' ', '-'): k for k in D['A']}
    bodies = {k.split('/')[1].replace(' ', '-'): k for k in D['P'] if k.startswith('bust/')}
    k = 0
    for cat in ['Standing', 'Sitting', 'Bust']:
        for c in tpl.combos(cat):
            pz = c['pose'].split('/')[-1]
            pid = ('standing/' if cat == 'Standing' else 'sitting/') + pz if cat != 'Bust' else bodies.get(pz)
            hd = heads.get(c['head'].split('/')[-1]); fc = faces.get((c['face'] or '').split('/')[-1]); bd = beards.get((c['fh'] or '').split('/')[-1]); ac = accs.get((c['acc'] or '').split('/')[-1])
            if pid not in D['P'] or not hd: print('?', c); continue
            nm = NAMES[k % len(NAMES)] if cat != 'Bust' else ''
            D['T'].append([nm, pid, hd, fc or 'Calm', bd or '', ac or '']); k += 1
    for h in HANDS: D['M'].append(list(h))
    s = json.dumps(D, ensure_ascii=False, separators=(',', ':'))
    open(out, 'w', encoding='utf-8').write(s); print('écrit', out, len(s) // 1024, 'Ko', len(D['T']), 'personnages')
if __name__ == '__main__':
    import sys; main(sys.argv[1])
