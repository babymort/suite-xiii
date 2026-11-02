#!/usr/bin/env python3
# Met à jour les numéros de version des outils (XSET.init) d'après la feuille de route.
# Règle : +1 par phase où l'outil a reçu une nouveauté propre, +6 pour les grandes vagues communes de la saison 5
# (données et IA · design et onglets · accueil et Démarrer · multi-projets · équipe en temps réel · fiabilité).
import re, json, os
R='/home/claude/suite-xiii/'; C=json.load(open('/tmp/vcount.json'))
WAVES=6
out={}
for f in sorted(os.listdir(R)):
    if not f.endswith('.html'): continue
    s=open(R+f,encoding='utf-8').read()
    m=re.search(r"((?:XSET\.init\(\{|const CFG = \{)\s*app: '([a-z0-9-]+)', title: '[^']*', version: ')([^']*)(')", s)
    if not m: continue
    app=m.group(2); old=m.group(3)
    if app=='index': new='Saison 5'
    else:
        n=C['spec'].get(app,0)+WAVES
        mm=re.match(r'^([vV])(\d+)$',old); md=re.match(r'^([vV])(\d+)\.(\d+)$',old)
        if mm: new=mm.group(1)+str(int(mm.group(2))+n)
        elif md: new=md.group(1)+md.group(2)+'.'+str(int(md.group(3))+n)
        else: new='v1.'+str(n)
    s=s[:m.start(3)]+new+s[m.end(3):]; open(R+f,'w',encoding='utf-8').write(s); out[app]=(old,new)
json.dump(out,open('/home/claude/xiii-src/versions.json','w'),ensure_ascii=False,indent=0)
for a,(o,n) in out.items(): print(f'{a:12} {o:>7} → {n}')
