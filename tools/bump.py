#!/usr/bin/env python3
# +1 version pour les outils donnés : bump.py plano storyboardo …  (à lancer à chaque étape qui touche un outil)
import re, sys, json
R='/home/claude/suite-xiii/'; V=json.load(open('/home/claude/xiii-src/versions.json'))
for app in sys.argv[1:]:
    f=R+app+'.html'; s=open(f,encoding='utf-8').read()
    m=re.search(r"((?:XSET\.init\(\{|const CFG = \{)\s*app: '"+app+r"', title: '[^']*', version: ')([^']*)(')", s)
    if not m: print('?', app); continue
    old=m.group(2); mm=re.match(r'^([vV])(\d+)$',old); md=re.match(r'^([vV])(\d+)\.(\d+)$',old)
    new=mm.group(1)+str(int(mm.group(2))+1) if mm else md.group(1)+md.group(2)+'.'+str(int(md.group(3))+1) if md else old
    s=s[:m.start(2)]+new+s[m.end(2):]; open(f,'w',encoding='utf-8').write(s); V[app]=[V.get(app,[old])[0],new]; print(app,old,'→',new)
json.dump(V,open('/home/claude/xiii-src/versions.json','w'),ensure_ascii=False,indent=0)
