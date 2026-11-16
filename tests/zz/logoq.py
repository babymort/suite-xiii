# Logos plus légers : palette 256 couleurs (transparence gardée), mêmes dimensions — MOODO ramené à 268 px de haut comme les autres
# python3 logoq.py essai|appliquer
import sys, glob, os
from PIL import Image, features
R = '/home/claude/suite-xiii/'; OUT = '/tmp/zz/logoq/'; os.makedirs(OUT, exist_ok=True)
mode = sys.argv[1] if len(sys.argv) > 1 else 'essai'
LIQ = features.check_feature('libimagequant'); print('libimagequant', LIQ)
tot0 = tot1 = 0
SKIP = ('index.png', 'suite-xiii-a.png', 'suite-xiii-c.png', 'xiii-halo.png', 'xiii-logo-suite.png')  # grands halos : la palette y crée des bandes
for f in sorted(glob.glob(R + 'logos/*.png')):
    if os.path.basename(f) in SKIP: continue
    im = Image.open(f).convert('RGBA')
    if f.endswith('moodo.png') and im.height > 268: im = im.resize((round(im.width * 268 / im.height), 268), Image.LANCZOS)
    q = im.quantize(colors=256, method=Image.Quantize.LIBIMAGEQUANT if LIQ else Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
    out = OUT + os.path.basename(f); q.save(out, optimize=True)
    a = os.path.getsize(f); b = os.path.getsize(out)
    if mode == 'appliquer' and b < a * 0.9:
        q.save(f, optimize=True); b = os.path.getsize(f)
    tot0 += a; tot1 += min(a, b)
print('avant', tot0 // 1024, 'Ko · après', tot1 // 1024, 'Ko')
# planche de comparaison (gauche : avant, droite : après)
L = ['moodo', 'decoup', 'storyboardo', 'calendrier', 'jour', 'index']; rows = []
for n in L:
    a = Image.open(R + 'logos/%s.png' % n).convert('RGBA'); b = Image.open(OUT + '%s.png' % n).convert('RGBA')
    if a.size != b.size: a = a.resize(b.size)
    rows.append((a, b))
H = sum(r[0].height for r in rows) + 10 * len(rows); W = max(r[0].width for r in rows) * 2 + 20
c = Image.new('RGBA', (W, H), (30, 30, 30, 255)); y = 0
for a, b in rows: c.alpha_composite(a, (0, y)); c.alpha_composite(b, (a.width + 20, y)); y += a.height + 10
c.convert('RGB').save('/tmp/zz/logoq_cmp.png')
