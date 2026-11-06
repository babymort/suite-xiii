import svgp, numpy as np, cv2, glob, os
A='/home/claude/peeps/Flat Assets/Separate Atoms/'
def mask(f, S=0.1, ox=-300, oy=-300, W=2300, H=3200, kinds=('bg','ink')):
    r = svgp.load(A+f); m = np.zeros((int(H*S), int(W*S)), np.uint8)
    for l in r['layers']:
        if l[0] not in kinds: continue
        lm = np.zeros_like(m)
        for s in l[2]:
            p = np.array([[(x-ox)*S, (y-oy)*S] for x, y in svgp.flatten(s, 6)], np.int32)
            t = np.zeros_like(m); cv2.fillPoly(t, [p], 1); lm ^= t
        m |= lm
    return m
if __name__ == '__main__':
    for cat in ['standing', 'sitting']:
        fs = sorted(glob.glob(A+'pose/'+cat+'/*.svg')); fs = [f[len(A):] for f in fs]
        ms = {f: mask(f) for f in fs}
        for i, a in enumerate(fs):
            best = []
            for b in fs:
                if b == a: continue
                iou = (ms[a] & ms[b]).sum() / max(1, (ms[a] | ms[b]).sum()); best.append((iou, b.split('/')[-1]))
            best.sort(reverse=True); print(a.split('/')[-1], ['%s %.2f' % (n, v) for v, n in best[:2]])
