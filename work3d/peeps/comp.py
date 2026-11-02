import svgp, subprocess, os
A='/home/claude/peeps/Flat Assets/Separate Atoms/'
OFF = {'standing': (525, -454), 'sitting': (426, -457), 'bust': (225, -459)}
FACE = (159, 186); FH = (123, 338); ACC = (47, 241)
def tr(layers, dx, dy):
    m = [1, 0, 0, 1, dx, dy]; out = []
    for l in layers:
        subs = [{'start': svgp.app(m, *s['start']), 'closed': s['closed'], 'segs': [(g[0],) + tuple(svgp.app(m, *p) for p in g[1:]) for g in s['segs']]} for s in l[2]]
        out.append((l[0], l[1], subs, l[3]))
    return out
def person(pose, head, face='Smile', fh=None, acc=None, cat=None):
    cat = cat or ('bust' if pose.startswith('body/') else pose.split('/')[1])
    L = svgp.load(A+pose+'.svg')['layers']; hx, hy = OFF[cat]
    H = tr(svgp.load(A+'head/'+head+'.svg')['layers'], hx, hy)
    F = tr(svgp.load(A+'face/'+face+'.svg')['layers'], hx+FACE[0], hy+FACE[1]) if face else []
    B = tr(svgp.load(A+'facial-hair/'+fh+'.svg')['layers'], hx+FH[0], hy+FH[1]) if fh else []
    C = tr(svgp.load(A+'accessories/'+acc+'.svg')['layers'], hx+ACC[0], hy+ACC[1]) if acc else []
    return L, H + F + B + C
