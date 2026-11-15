#!/usr/bin/env python3
# Numéros de version de fin de saison : version publiée de la saison précédente + vagues communes + nouveautés propres.
# season_versions.py <commit de la publication précédente> <feuille de route .html> <nom de saison>
import re, json, sys, subprocess
R='/home/claude/suite-xiii/'; base, road, season = sys.argv[1], sys.argv[2], sys.argv[3]
s=open(road,encoding='utf-8').read(); P=json.loads(re.search(r'const P=(\[.*?\]);\n',s,re.S).group(1))
COMMON=['Phase A','Phase B ','Phase B2','Phase C','Phase E','Phase P']  # vagues qui touchent tous les outils
waves=sum(1 for ph in P if any(ph[0].startswith(c.strip()) for c in COMMON) and any(i[3]=='done' for i in ph[1]))
NAMES={'callsheeto':'CALL SHEETO','storyboardo':'STORYBOARDO','index':'ACCUEIL'}
own={}
def count(app):
    nm=NAMES.get(app,app.upper()); rx=re.compile(r'\b'+re.escape(nm)+r'\b')
    return sum(1 for ph in P if not ph[0].startswith('Phase ZZ') for i in ph[1] if i[3]=='done' and (rx.search(ph[0]+' '+i[0]+' '+i[1]+' '+i[2]) or (app=='cadro' and 'CADRO' in ph[0])))
V={}
for f in sorted(subprocess.check_output(['git','-C',R,'ls-files','*.html']).decode().split()):
    cur=open(R+f,encoding='utf-8').read()
    m=re.search(r"((?:XSET\.init\(\{|const CFG = \{)\s*app: '([a-z0-9-]+)', title: '[^']*', version: ')([^']*)(')",cur)
    if not m: continue
    app=m.group(2)
    try: old=subprocess.check_output(['git','-C',R,'show',base+':'+f],stderr=subprocess.DEVNULL).decode()
    except Exception: old=''
    mo=re.search(r"app: '"+app+r"', title: '[^']*', version: '([^']*)'",old); pub=mo.group(1) if mo else m.group(3)
    if app=='index': new=season
    else:
        own[app]=count(app); n=waves+own[app]
        mm=re.match(r'^([vV])(\d+)$',pub); md=re.match(r'^([vV])(\d+)\.(\d+)$',pub)
        new=mm.group(1)+str(int(mm.group(2))+n) if mm else md.group(1)+md.group(2)+'.'+str(int(md.group(3))+n) if md else pub
    cur=cur[:m.start(3)]+new+cur[m.end(3):]; open(R+f,'w',encoding='utf-8').write(cur); V[app]=[pub,new]
json.dump(V,open('/home/claude/xiii-src/versions.json','w'),ensure_ascii=False,indent=0)
print('vagues communes :',waves)
for a,(o,n) in V.items(): print(f'{a:12} {o:>7} → {n}  (+{own.get(a,0)} propres)')
