import sys; sys.path.insert(0,'..'); sys.path.insert(0,'.')
import seg, numpy as np, math
from ann import J
from scipy import ndimage as ndi
rows=[]
for n in sorted(J):
    if J[n].get('lock')==['r','l','legs']: continue
    R=seg.run(n); lab=R['lab']; sil=R['sil']; names=R['names']
    for i,nm in enumerate(names):
        if nm=='torso' or nm not in R['info']: continue
        inf=R['info'][nm]; a=np.array(inf['a']); e=np.array(inf['e']); L=np.hypot(*(e-a))
        # largeur de la région étiquetée perpendiculairement à l'os (valeur médiane)
        v=e-a; u=v/(L or 1); nrm=np.array([-u[1],u[0]]); ws=[]
        for t in np.linspace(.2,.8,7):
            c=a+v*t; w=0
            for sgn in (1,-1):
                k=0
                while k<120:
                    p=c+sgn*nrm*k; x,y=int(round(p[0])),int(round(p[1]))
                    if x<0 or y<0 or x>=lab.shape[1] or y>=lab.shape[0] or lab[y,x]!=i or not sil[y,x]: break
                    k+=1
                w+=k
            ws.append(w)
        rows.append((n,nm,round(L),round(inf['rad']),round(float(np.median(ws))/2,1)))
for r in rows: print(*r)
