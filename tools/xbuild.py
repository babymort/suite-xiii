#!/usr/bin/env python3
# Construit la beta directement dans le dépôt.
# Saison 6, phase C : le code commun n'est plus recopié dans chaque page, il est servi une fois depuis lib/ :
#   • xiii-src/core/core-NN.js  → lib/core-NN.js   (grands modules communs, sortis du bloc SETTINGS par tools/core.py)
#   • xiii-src/<module>.js       → lib/<module>.js  (modules « extra » de extra.json ; '__APP__' devient la variable XIII_APP)
# Chaque page appelle ces fichiers avec ?v=<empreinte> : une nouvelle version est chargée dès qu'un fichier change.
# Puis : version du service worker (VER) et liste des fichiers mis en cache pour le hors ligne (PAGES).
import os, re, sys, hashlib, glob, json, shutil
R = '/home/claude/suite-xiii/'; SRC = '/home/claude/xiii-src/'; LIB = R + 'lib/'
os.makedirs(LIB, exist_ok=True)
EXTRA = json.load(open(SRC + 'extra.json'))
md5 = lambda b: hashlib.md5(b).hexdigest()[:10]
V = {}
# 1. code commun (core)
for p in sorted(glob.glob(SRC + 'core/core-*.*')):
    n = os.path.basename(p); b = open(p, 'rb').read(); open(LIB + n, 'wb').write(b); V[n] = md5(b)
# 2. modules extra
for name in sorted(set(x[0] for x in EXTRA)):
    code = open(SRC + name, encoding='utf-8').read().replace("'__APP__'", 'XIII_APP')
    if '__APP__' in code: sys.exit('__APP__ hors guillemets dans ' + name)
    b = ('// SUITE XIII — module commun. Source : xiii-src/' + name + '\n' + code).encode('utf-8'); open(LIB + name, 'wb').write(b); V[name] = md5(b)
# fichiers de lib/ qui ne sont plus produits : supprimés
for p in glob.glob(LIB + '*'):
    if os.path.basename(p) not in V: os.remove(p)
pages = sorted(f for f in os.listdir(R) if f.endswith('.html') and 'SUITE XIII:SETTINGS:END' in open(R + f, encoding='utf-8').read())
for f in pages:
    app = f[:-5]; s = open(R + f, encoding='utf-8').read()
    tags = []
    for name, who in EXTRA:
        if who == '@m' or (who == '*' and app.endswith('-m')): continue
        if who == '*' or app in who: tags.append('<script src="lib/' + name + '?v=' + V[name] + '"></script>')
    s = re.sub(r'\n?<!-- SUITE XIII:EXTRA:START -->.*?<!-- SUITE XIII:EXTRA:END -->', '', s, flags=re.S)
    if tags:
        blk = '\n<!-- SUITE XIII:EXTRA:START -->\n<script>var XIII_APP = window.XIII_APP || ' + json.dumps(app) + ';</script>\n' + '\n'.join(tags) + '\n<!-- SUITE XIII:EXTRA:END -->'
        s = s.replace('<!-- SUITE XIII:SETTINGS:END -->', '<!-- SUITE XIII:SETTINGS:END -->' + blk, 1)
    # empreintes des fichiers communs appelés dans la page
    s = re.sub(r'lib/(core-\d+\.(?:js|css))\?v=(?:@@[^@]+@@|[0-9a-f]+)', lambda m: 'lib/' + m.group(1) + '?v=' + V[m.group(1)], s)
    open(R + f, 'w', encoding='utf-8').write(s)
# 2 ter. pages sans bloc SETTINGS mais nommées dans extra.json (ex. l'espace de travail) : modules injectés avant </body>
for app in sorted(set(a for n, who in EXTRA if isinstance(who, list) for a in who)):
    f = app + '.html'
    if f in pages or not os.path.exists(R + f): continue
    s2 = open(R + f, encoding='utf-8').read()
    s2 = re.sub(r'\n?<!-- SUITE XIII:XEXTRA:START -->.*?<!-- SUITE XIII:XEXTRA:END -->', '', s2, flags=re.S)
    tags = ['<script src="lib/' + n + '?v=' + V[n] + '"></script>' for n, who in EXTRA if isinstance(who, list) and app in who]
    if tags and '</body>' in s2: i2 = s2.rfind('</body>'); s2 = s2[:i2] + '<!-- SUITE XIII:XEXTRA:START --><script>var XIII_APP = window.XIII_APP || ' + json.dumps(app) + ';</script>' + ''.join(tags) + '<!-- SUITE XIII:XEXTRA:END -->' + s2[i2:]  # la vraie fin de page (pas un '</body>' écrit dans du code)
    open(R + f, 'w', encoding='utf-8').write(s2)
# 2 bis. pages sans bloc SETTINGS (téléphone -m, app équipe) : modules « @m » de extra.json, chargés dans <head>
MP = sorted(f for f in os.listdir(R) if f.endswith('.html') and (f.endswith('-m.html') or f in ('equipe.html', 'team.html')))
for f in MP:
    s = open(R + f, encoding='utf-8').read()
    s = re.sub(r'\n?<!-- SUITE XIII:MEXTRA:START -->.*?<!-- SUITE XIII:MEXTRA:END -->', '', s, flags=re.S)
    tags = ['<script src="lib/' + name + '?v=' + V[name] + '"></script>' for name, who in EXTRA if who == '@m']
    if tags and '</head>' in s: s = s.replace('</head>', '<!-- SUITE XIII:MEXTRA:START -->' + ''.join(tags) + '<!-- SUITE XIII:MEXTRA:END -->\n</head>', 1)
    open(R + f, 'w', encoding='utf-8').write(s)
# 3. service worker : version et fichiers à garder hors ligne
h = hashlib.md5()
for f in sorted(glob.glob(R + '*.html')) + sorted(glob.glob(LIB + '*')): h.update(open(f, 'rb').read())
sw = open(R + 'sw.js', encoding='utf-8').read(); sw = re.sub(r"const VER = '[0-9a-f]+'", "const VER = '" + h.hexdigest()[:10] + "'", sw, 1)
m = re.search(r'PAGES = (\[[^\]]*\])', sw); L = [x for x in json.loads(m.group(1)) if not x.startswith('lib/')] + ['lib/' + n + '?v=' + V[n] for n in sorted(V)]
sw = sw[:m.start(1)] + json.dumps(L, ensure_ascii=False) + sw[m.end(1):]
open(R + 'sw.js', 'w', encoding='utf-8').write(sw)
print('ok', len(pages), 'pages ·', len(V), 'fichiers communs (' + str(round(sum(os.path.getsize(LIB + n) for n in V) / 1e3)) + ' Ko) · sw', h.hexdigest()[:10])
