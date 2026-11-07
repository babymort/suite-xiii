#!/usr/bin/env python3
# Remplacement exact dans toutes les pages du site ET dans le code commun (xiii-src/core, phase C) :
# patch.py fichier.json  ([[ancien, nouveau, nombre_minimum], ...]) — le minimum compte une fois le code commun
# comme « toutes les pages qui l'utilisent » ; relancer ensuite tools/xbuild.py pour recopier lib/.
import os, sys, json, glob
R = '/home/claude/suite-xiii/'; CORE = '/home/claude/xiii-src/core/'
users = sum(1 for f in os.listdir(R) if f.endswith('.html') and 'lib/core-' in open(R + f, encoding='utf-8').read())
for old, new, mn in json.load(open(sys.argv[1], encoding='utf-8')):
    n = 0; c = 0
    for f in os.listdir(R):
        if not f.endswith('.html'): continue
        s = open(R + f, encoding='utf-8').read()
        if old in s: s = s.replace(old, new); open(R + f, 'w', encoding='utf-8').write(s); n += 1
    for p in glob.glob(CORE + 'core-*.*'):
        s = open(p, encoding='utf-8').read()
        if old in s: s = s.replace(old, new); open(p, 'w', encoding='utf-8').write(s); c += 1
    tot = n + (users if c else 0)
    print(('ok ' if tot >= mn else 'MANQUE ') + str(n) + ' page(s)' + (' + code commun (' + str(c) + ' fichier(s), ' + str(users) + ' pages)' if c else '') + ' : ' + old[:60].replace('\n', ' '))
