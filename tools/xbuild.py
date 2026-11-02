#!/usr/bin/env python3
# Construit la beta directement dans le dépôt : modules « extra » + patchs exacts + version du service worker.
import os, re, sys, hashlib, glob, json
R = '/home/claude/suite-xiii/'; SRC = '/home/claude/xiii-src/'
# modules ajoutés après le bloc commun : nom -> pages ('*' = toutes les pages avec le bloc commun, sinon liste)
EXTRA = json.load(open(SRC + 'extra.json'))
pages = sorted(f for f in os.listdir(R) if f.endswith('.html') and 'SUITE XIII:SETTINGS:END' in open(R + f, encoding='utf-8').read())
for f in pages:
    app = f[:-5]; s = open(R + f, encoding='utf-8').read()
    js = ''
    for name, who in EXTRA:
        if who == '*' and app.endswith('-m'): continue
        if who == '*' or app in who:
            code = open(SRC + name, encoding='utf-8').read().replace('__APP__', app)
            js += '\n' + code + '\n'
    s = re.sub(r'\n?<!-- SUITE XIII:EXTRA:START -->.*?<!-- SUITE XIII:EXTRA:END -->', '', s, flags=re.S)
    if js:
        blk = '\n<!-- SUITE XIII:EXTRA:START -->\n<script>' + js.replace('</script', '<\\/script') + '</script>\n<!-- SUITE XIII:EXTRA:END -->'
        s = s.replace('<!-- SUITE XIII:SETTINGS:END -->', '<!-- SUITE XIII:SETTINGS:END -->' + blk, 1)
    open(R + f, 'w', encoding='utf-8').write(s)
# version du service worker
h = hashlib.md5()
for f in sorted(glob.glob(R + '*.html')): h.update(open(f, 'rb').read())
sw = open(R + 'sw.js', encoding='utf-8').read(); sw = re.sub(r"const VER = '[0-9a-f]+'", "const VER = '" + h.hexdigest()[:10] + "'", sw, 1); open(R + 'sw.js', 'w', encoding='utf-8').write(sw)
print('ok', len(pages), 'pages · sw', h.hexdigest()[:10])
