# Lecteur minimal des SVG Open Peeps (M L C Z absolus, transformations de groupe) -> sous-chemins absolus
import re, xml.etree.ElementTree as ET
NUM = r'-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?'
def mat_mul(a, b):  # a·b, matrices [a,b,c,d,e,f]
    return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]
def parse_tf(s):
    m = [1, 0, 0, 1, 0, 0]
    for fn, args in re.findall(r'(\w+)\s*\(([^)]*)\)', s or ''):
        v = [float(x) for x in re.findall(NUM, args)]
        if fn == 'translate': t = [1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0]
        elif fn == 'scale': t = [v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0]
        elif fn == 'matrix': t = v
        elif fn == 'rotate':
            import math; a = math.radians(v[0]); c, s_ = math.cos(a), math.sin(a); t = [c, s_, -s_, c, 0, 0]
            if len(v) == 3: t = mat_mul(mat_mul([1, 0, 0, 1, v[1], v[2]], t), [1, 0, 0, 1, -v[1], -v[2]])
        else: raise ValueError(fn)
        m = mat_mul(m, t)
    return m
def app(m, x, y): return (m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5])
def parse_d(d, m):
    toks = re.findall(r'[MLCZmlcz]|' + NUM, d); subs = []; cur = None; cmd = None; i = 0; pen = (0, 0); start = (0, 0)
    while i < len(toks):
        t = toks[i]
        if t in 'MLCZmlcz': cmd = t; i += 1
        if cmd in 'Zz': 
            if cur: cur['closed'] = True
            pen = start; cmd = None; continue
        if cmd in 'Mm':
            x, y = float(toks[i]), float(toks[i+1]); i += 2
            if cmd == 'm': x, y = pen[0]+x, pen[1]+y
            cur = {'start': (x, y), 'segs': [], 'closed': False}; subs.append(cur); pen = start = (x, y); cmd = 'L' if cmd == 'M' else 'l'
        elif cmd in 'Ll':
            x, y = float(toks[i]), float(toks[i+1]); i += 2
            if cmd == 'l': x, y = pen[0]+x, pen[1]+y
            cur['segs'].append(('L', (x, y))); pen = (x, y)
        elif cmd in 'Cc':
            v = [float(toks[i+k]) for k in range(6)]; i += 6
            if cmd == 'c': v = [v[0]+pen[0], v[1]+pen[1], v[2]+pen[0], v[3]+pen[1], v[4]+pen[0], v[5]+pen[1]]
            cur['segs'].append(('C', (v[0], v[1]), (v[2], v[3]), (v[4], v[5]))); pen = (v[4], v[5])
        else: raise ValueError(cmd)
    out = []
    for s in subs:
        out.append({'start': app(m, *s['start']), 'closed': s['closed'], 'segs': [(g[0],) + tuple(app(m, *p) for p in g[1:]) for g in s['segs']]})
    return out
def color_of(c):
    c = (c or '').lower()
    return {'#ffffff': 'bg', 'white': 'bg', '#000000': 'ink', '#221e1f': 'ink', '#231f20': 'ink'}.get(c, c)
def load(path, base=None):
    """-> {'vb':(w,h), 'layers':[(kind, fill, [subpaths])], 'groups':{id: matrix}}"""
    root = ET.parse(path).getroot(); ns = '{http://www.w3.org/2000/svg}'
    vb = [float(x) for x in root.get('viewBox').split()]
    res = {'vb': (vb[2], vb[3]), 'layers': [], 'groups': {}}
    def walk(el, m, fill, gid):
        tag = el.tag.replace(ns, '')
        m2 = mat_mul(m, parse_tf(el.get('transform'))) if el.get('transform') else m
        f2 = el.get('fill', fill)
        if tag == 'g':
            if el.get('id'): res['groups'][el.get('id')] = m2
            for ch in el: walk(ch, m2, f2, el.get('id') or gid)
        elif tag == 'path':
            res['layers'].append((color_of(f2), f2, parse_d(el.get('d'), m2), gid))
        elif tag in ('svg',):
            for ch in el: walk(ch, m2, f2, gid)
    walk(root, base or [1, 0, 0, 1, 0, 0], None, None)
    return res
def flatten(sub, n=10):
    """points d'un sous-chemin (béziers échantillonnées)"""
    pts = [sub['start']]; p0 = sub['start']
    for g in sub['segs']:
        if g[0] == 'L': pts.append(g[1]); p0 = g[1]
        else:
            (x1, y1), (x2, y2), (x3, y3) = g[1], g[2], g[3]
            for k in range(1, n+1):
                t = k/n; u = 1-t
                pts.append((u*u*u*p0[0] + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3, u*u*u*p0[1] + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3))
            p0 = g[3]
    return pts
def to_d(subs, nd=1, m=None):
    f = lambda v: ('%.*f' % (nd, v)).rstrip('0').rstrip('.') if nd else str(int(round(v)))
    P = (lambda p: app(m, *p)) if m else (lambda p: p)
    o = []
    for s in subs:
        p = P(s['start']); o.append('M%s %s' % (f(p[0]), f(p[1])))
        for g in s['segs']:
            if g[0] == 'L': p = P(g[1]); o.append('L%s %s' % (f(p[0]), f(p[1])))
            else: o.append('C' + ' '.join(f(c) for q in g[1:] for c in P(q)))
        if s['closed']: o.append('Z')
    return ''.join(o)
FILL = {'bg': '#ffffff', 'ink': '#000000'}
import os
if os.environ.get('BGC'): FILL['bg'] = os.environ['BGC']
def svg_doc(layers, vb, w=None, extra=''):
    body = ''.join('<path fill-rule="evenodd" fill="%s" d="%s"/>' % (FILL.get(l[0], l[0]), to_d(l[2])) for l in layers)
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s"%s>%s%s</svg>' % (' '.join(str(round(v, 2)) for v in vb), (' width="%d" height="%d"' % (w, round(w * vb[3] / vb[2]))) if w else '', body, extra)
