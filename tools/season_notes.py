#!/usr/bin/env python3
# Notes de mise à jour d'une saison, tirées de la feuille de route : section de notes.html + entrées XNOTES de l'accueil.
# season_notes.py <feuille de route .html> <n° de saison> "<mois année>"
import re, json, sys, html, hashlib
road, n, when = sys.argv[1], sys.argv[2], sys.argv[3]; R='/home/claude/suite-xiii/'
s=open(road,encoding='utf-8').read(); P=json.loads(re.search(r'const P=(\[.*?\]);\n',s,re.S).group(1))
TOOLS='BACKUPO CADRO CALENDRIER CALL SHEETO CASTO CATALOGUE CONDUCO CONTROLE DECOUP DEVISO DOSSIER DRIVE ENCODO GRAPHICO IMPORTO LUDO LUMO MATOS MELANGO MOODO PACKINGO PLANNO PLANO POSTO REPERO RESSOURCO RUNO SCRIPTO SONO SOUSTITRO STORYBOARDO SYNO TEAM TRANSPORTO'.split()
def tag(ph, it):
    if ph.startswith('Phase L'): return 'CADRO'
    t=it[0].upper()
    if t in TOOLS or t in ('ACCUEIL','TOUTE LA SUITE'): return t
    for w in TOOLS:
        if re.search(r'\b'+w+r'\b', it[1]): return w
    if ph.startswith('Phase X'): return 'PROJET XIII'
    if ph.startswith('Phase D'): return 'ACCUEIL'
    return 'TOUTE LA SUITE'
def desc(d):
    parts=re.findall(r'(?:Fait|Retouche|Ajout)[^:]{0,40}:\s*(.+?)(?=\s(?:Fait|Retouche|Ajout)\s\(\d|$)', d)
    t=' '.join(p.strip() for p in parts) if parts else d
    t=re.sub(r'\s+',' ',t).strip(); return t[:1].upper()+t[1:]
secs=[]; items=[]; k=int(n)*1000
for ph in P:
    if ph[0].startswith('Phase ZZ'): continue
    L=[i for i in ph[1] if i[3]=='done' and 'RAPPEL' not in i[0]]
    if not L: continue
    lis=''.join('<li><span class="tag">'+html.escape(tag(ph[0],i))+'</span><div><b>'+html.escape(i[1])+'</b><p>'+html.escape(desc(i[2]))+'</p></div></li>' for i in L)
    secs.append('<h3>'+html.escape(ph[0])+'</h3><ul>'+lis+'</ul>')
    for i in L: items.append({'k':k,'s':'Saison '+n,'tag':tag(ph[0],i),'t':i[1]}); k+=1
sec='<section id="s'+n+'"><h2>Saison '+n+' <small>'+when+' · '+str(len(items))+' nouveautés</small></h2>'+''.join(secs)+'</section>'
f=R+'notes.html'; t=open(f,encoding='utf-8').read()
t=re.sub(r'<section id="s'+n+'">.*?</section>','',t,flags=re.S)
t=t.replace('<section id="s'+str(int(n)-1)+'">', sec+'<section id="s'+str(int(n)-1)+'">',1)
tot=len(re.findall(r'<li><span class="tag">',t)); t=re.sub(r'saison par saison — \d+ au total', 'saison par saison — '+str(tot)+' au total', t)
t=re.sub(r'<a href="#s'+n+'">.*?</a>','',t,flags=re.S); t=t.replace('<a href="#s'+str(int(n)-1)+'">','<a href="#s'+n+'">Saison '+n+' <small>'+str(len(items))+'</small></a><a href="#s'+str(int(n)-1)+'">',1)
open(f,'w',encoding='utf-8').write(t)
f=R+'index.html'; t=open(f,encoding='utf-8').read(); m=re.search(r'var XNOTES = (\{.*?\});\n',t,re.S); X=json.loads(m.group(1))
X['items']=[x for x in X['items'] if x['s']!='Saison '+n]+items; X['ver']=hashlib.md5(json.dumps(X['items']).encode()).hexdigest()[:10]
t=t[:m.start(1)]+json.dumps(X,ensure_ascii=False)+t[m.end(1):]; open(f,'w',encoding='utf-8').write(t)
print(len(items),'nouveautés · total notes',tot)
