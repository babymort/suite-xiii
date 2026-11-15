import re,glob,sys
files=glob.glob('/home/claude/xiii-src/core/core-*.js')+glob.glob('/home/claude/xiii-src/*.js')+['/home/claude/suite-xiii/'+f for f in ['index.html','calendrier.html','espace.html','planno.html','notes.html','drive.html']]
R=[("CALENDRIER, PLANNO","PLANNO"),("PLANNO, CALENDRIER","PLANNO"),("PLANNO + CALENDRIER","PLANNO"),("CALENDRIER + PLANNO","PLANNO"),
   ("['calendrier', '🗓️', 'CALENDRIER', 'Toutes les dates']","['calendrier', '📅', 'PLANNO', 'Planning et calendrier']"),
   ("Dates et planning de production","Planning de production et calendrier"),
   ("CALENDRIER XIII - Toutes les dates de la suite","PLANNO XIII - Planning et calendrier"),
   ("'CALENDRIER'","'PLANNO'"),('"CALENDRIER"','"PLANNO"'),(">CALENDRIER <span>",">PLANNO <span>"),("<b>CALENDRIER</b>","<b>PLANNO</b>"),
   ("CALENDRIER XIII","PLANNO XIII"),("Ouvrir CALENDRIER","Ouvrir PLANNO"),("CALENDRIER ›","PLANNO ›"),("CALENDRIER —","PLANNO —"),("CALENDRIER →","PLANNO →"),("CALENDRIER</","PLANNO</")]
tot=0
for p in files:
    try: s=open(p,encoding='utf-8').read()
    except: continue
    out=[];n=0
    for line in s.split('\n'):
        if 'XNOTES' in line or line.lstrip().startswith('//') or line.lstrip().startswith('*') or '"tag":' in line: out.append(line); continue
        o=line
        for a,b in R: line=line.replace(a,b)
        if line!=o: n+=1
        out.append(line)
    if n: open(p,'w',encoding='utf-8').write('\n'.join(out)); print(p.split('/')[-1],n); tot+=n
print('lignes',tot)
