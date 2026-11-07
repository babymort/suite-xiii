#!/usr/bin/env python3
# Phase C (saison 6) — CODE COMMUN : sort du bloc SETTINGS de chaque outil tout le code identique partout,
# le range dans xiii-src/core/ (fichiers partagés, copiés dans le site sous lib/ par xbuild.py),
# et laisse dans chaque page seulement ce qui lui est propre + les appels aux fichiers partagés.
# Usage : python3 core.py [--dry]   (une seule fois : ensuite les sources communes sont xiii-src/core/)
import re, os, sys, json, hashlib, collections, subprocess
R = '/home/claude/suite-xiii/'; OUT = '/home/claude/xiii-src/core/'
SKIP = {'catalogue.html', 'importo.html'}  # pages internes (intégrées), laissées entières
DRY = '--dry' in sys.argv
pages = sorted(f for f in os.listdir(R) if f.endswith('.html') and f not in SKIP and 'SUITE XIII:SETTINGS:END' in open(R + f, encoding='utf-8').read())
RX = re.compile(r'(<!-- SUITE XIII:SETTINGS:START -->)(.*?)(<!-- SUITE XIII:SETTINGS:END -->)', re.S)
TAG = re.compile(r'</?(script|style)[^>]*>')

def norm(body, app):
    a = re.escape(app)
    body = re.sub(r"(\.(?:init|initTool|boot)\(|\bAPP\s*=\s*|\bapp:\s*)'" + a + "'", r"\1'__APP__'", body)
    return body

def segments(b):
    # découpe comme le navigateur : hors élément, la prochaine balise <script>/<style> ouvre ; dedans, seule « </script> » (ou « </style> ») ferme
    out, i = [], 0
    while i < len(b):
        m = re.compile(r'<(script|style)[^>]*>', re.I).search(b, i)
        if not m: out.append(('html', b[i:])); break
        if m.start() > i: out.append(('html', b[i:m.start()]))
        out.append(('tag', m.group(0))); kind = m.group(1).lower(); j = b.lower().find('</' + kind, m.end())
        e = b.index('>', j) + 1; inner = b[m.end():j]; ctx = 'js' if kind == 'script' else 'css'
        if ctx == 'js':
            cuts = sorted(set([0, len(inner)] + [x.start() for x in re.finditer(r'(?m)^// =+\n//\s+\S[^\n]*XIII', inner)]))
            for a, z in zip(cuts, cuts[1:]):
                if z > a: out.append(('js', inner[a:z]))
        elif inner: out.append(('css', inner))
        out.append(('tag', b[j:e])); i = e
    return out

P = {}
for f in pages:
    s = open(R + f, encoding='utf-8').read(); app = f[:-5]
    m = RX.search(s); segs = segments(m.group(2))
    P[f] = [(c, norm(t, app) if c in ('js', 'css') else t) for c, t in segs]
N = len(P); H = lambda c, t: hashlib.md5((c + '\0' + t).encode()).hexdigest()
cnt = collections.Counter()
for f, segs in P.items():
    for k in set(H(c, t) for c, t in segs if c in ('js', 'css') and t.strip()): cnt[k] += 1
common = lambda c, t: c in ('js', 'css') and t.strip() and cnt[H(c, t)] == N
# ordre canonique des segments communs (première page)
ref = [H(c, t) for c, t in P[pages[0]] if common(c, t)]
for f, segs in P.items():
    if [H(c, t) for c, t in segs if common(c, t)] != ref: sys.exit('ordre des segments communs différent dans ' + f)
# coupures : entre deux communs consécutifs, s'il y a quoi que ce soit (balise, code propre) dans au moins une page
brk = set()
for f, segs in P.items():
    k = -1; between = False
    for c, t in segs:
        if common(c, t):
            if k >= 0 and between: brk.add(k)
            k += 1; between = False
        elif t.strip(): between = True
ctxOf = {}; textOf = {}
for c, t in P[pages[0]]:
    if common(c, t): ctxOf[H(c, t)] = c; textOf[H(c, t)] = t
chunks, cur = [], []
for i, h in enumerate(ref):
    if cur and ctxOf[h] != ctxOf[cur[0]]: chunks.append(cur); cur = []
    cur.append(h)
    if i in brk: chunks.append(cur); cur = []
if cur: chunks.append(cur)
files = {}
for n, ch in enumerate(chunks, 1):
    ext = 'js' if ctxOf[ch[0]] == 'js' else 'css'
    body = ''.join(textOf[h] for h in ch)
    if ext == 'js': body = body.replace("'__APP__'", 'XIII_APP')
    if '__APP__' in body: sys.exit('__APP__ resté dans le morceau ' + str(n))
    name = 'core-%02d.%s' % (n, ext)
    files[name] = ('// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/' + name + '\n' if ext == 'js' else '/* SUITE XIII — styles communs (phase C) */\n') + body
chunkOf = {h: n for n, ch in enumerate(chunks, 1) for h in ch}
first = {ch[0]: n for n, ch in enumerate(chunks, 1)}
# contrôle de syntaxe des morceaux communs
os.makedirs('/tmp/zz/core', exist_ok=True)
for name, body in files.items():
    if name.endswith('.js'):
        p = '/tmp/zz/core/' + name; open(p, 'w', encoding='utf-8').write(body)
        r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", p], capture_output=True, text=True)
        if r.returncode: sys.exit('syntaxe ' + name + ' : ' + r.stderr[-400:])
# nouvelles pages
newblk = {}
for f, segs in P.items():
    app = f[:-5]; o = ['<script>var XIII_APP = ' + json.dumps(app) + '; // nom de l\'outil, utilisé par le code commun (lib/core-*.js)</script>\n']
    for c, t in segs:
        if common(c, t):
            h = H(c, t)
            if h in first:
                n = first[h]; name = 'core-%02d.%s' % (n, 'js' if c == 'js' else 'css')
                o.append(('</script><script src="lib/%s?v=@@%s@@"></script><script>' if c == 'js' else '</style><link rel="stylesheet" href="lib/%s?v=@@%s@@"><style>') % (name, name))
            continue
        if c == 'tag': o.append(t); continue
        # code propre à la page : on remet la forme d'origine (nom réel de l'outil)
        o.append(t.replace("'__APP__'", "'" + app + "'"))
    b = ''.join(o)
    b = re.sub(r'<script>(\s*)</script>', r'\1', b); b = re.sub(r'<style>(\s*)</style>', r'\1', b)
    # contrôle : chaque script en ligne restant doit être valide seul
    for k, sc in enumerate(re.findall(r'<script>(.*?)</script>', b, re.S)):
        p = '/tmp/zz/core/%s.%d.js' % (app, k); open(p, 'w', encoding='utf-8').write(sc)
        r = subprocess.run(['node', '-e', "new (require('vm').Script)(require('fs').readFileSync(process.argv[1],'utf8'))", p], capture_output=True, text=True)
        if r.returncode: sys.exit('syntaxe en ligne ' + f + ' #' + str(k) + ' : ' + r.stderr[-300:])
    newblk[f] = b
tot0 = sum(len(RX.search(open(R + f, encoding='utf-8').read()).group(2).encode()) for f in pages); tot1 = sum(len(b.encode()) for b in newblk.values())
print('morceaux communs :', len(files), '·', round(sum(len(v.encode()) for v in files.values()) / 1e3), 'Ko · bloc par page :', round(tot0 / N / 1e3), '→', round(tot1 / N / 1e3), 'Ko')
if DRY: sys.exit(0)
os.makedirs(OUT, exist_ok=True)
for name, body in files.items(): open(OUT + name, 'w', encoding='utf-8').write(body)
for f, b in newblk.items():
    s = open(R + f, encoding='utf-8').read(); m = RX.search(s)
    open(R + f, 'w', encoding='utf-8').write(s[:m.start(2)] + b + s[m.end(2):])
json.dump(sorted(files), open(OUT + 'files.json', 'w'))
print('pages réécrites :', len(newblk))
