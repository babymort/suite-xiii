#!/usr/bin/env python3
# Remplacement exact dans toutes les pages du site : patch.py fichier.json  ([[ancien, nouveau, nombre_minimum_de_pages], ...])
import os, sys, json
R = '/home/claude/suite-xiii/'
for old, new, mn in json.load(open(sys.argv[1], encoding='utf-8')):
    n = 0
    for f in os.listdir(R):
        if not f.endswith('.html'): continue
        s = open(R + f, encoding='utf-8').read()
        if old in s: s = s.replace(old, new); open(R + f, 'w', encoding='utf-8').write(s); n += 1
    print(('ok ' if n >= mn else 'MANQUE ') + str(n) + ' page(s) : ' + old[:60].replace('\n', ' '))
