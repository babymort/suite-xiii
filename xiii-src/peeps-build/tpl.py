import svgp, glob, re, json, os
T='/home/claude/peeps/Flat Assets/Templates/'
def combos(cat):
    out = []
    for f in sorted(glob.glob(T+cat+'/*.svg'), key=lambda s: int(re.findall(r'(\d+)\.svg', s)[0])):
        r = svgp.load(f); g = r['groups']
        pose = [k for k in g if k.startswith('pose/') or k.startswith('body/')]
        head = [k for k in g if k.startswith('head/')]
        face = [k for k in g if k.startswith('face/')]
        fh = [k for k in g if k.startswith('facial-hair/')]; acc = [k for k in g if k.startswith('accessories/')]
        P = g[pose[0]]; H = g[head[0]]
        rel = ((H[4]-P[4])/P[0], (H[5]-P[5])/P[0])
        out.append(dict(f=os.path.basename(f), pose=pose[0], head=head[0], face=face[0] if face else None, fh=fh[0] if fh else None, acc=acc[0] if acc else None, scale=round(P[0],4), rel=(round(rel[0],1), round(rel[1],1)),
            frel=tuple(round((g[face[0]][i]-H[i])/P[0],1) for i in (4,5)) if face else None))
    return out
if __name__ == '__main__':
    for cat in ['Standing', 'Sitting', 'Bust']:
        C = combos(cat); print(cat, len(C))
        from collections import Counter
        print(' rel', Counter((c['pose'].split('/')[-1], c['rel']) for c in C).most_common(40))
        print(' frel', Counter(c['frel'] for c in C).most_common(5))
