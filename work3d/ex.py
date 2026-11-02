import json, math, struct, base64, sys
from fbx import parse, find
N=parse(sys.argv[1]); top={n['n']:n for n in N}; obj=top['Objects']
byid={c['p'][0]:c for c in obj['c']}
nm=lambda c:c['p'][1].split('\x00')[0]
conns=[(c['p'][0],c['p'][1],c['p'][2]) for c in top['Connections']['c']]
geo=[c for c in obj['c'] if c['n']=='Geometry'][0]
V=find(geo,'Vertices')[0]['p'][0]; PI=find(geo,'PolygonVertexIndex')[0]['p'][0]
tris=[]; poly=[]
for i in PI:
    if i<0: poly.append(-i-1); 
    else: poly.append(i); continue
    for k in range(1,len(poly)-1): tris+= [poly[0],poly[k],poly[k+1]]
    poly=[]
nv=len(V)//3
bones=[c for c in obj['c'] if c['n']=='Model' and c['p'][2]=='LimbNode']
bid={b['p'][0]:i for i,b in enumerate(bones)}; names=[nm(b) for b in bones]
parent=[-1]*len(bones)
for t,ch,pa in conns:
    if t=='OO' and ch in bid and pa in bid: parent[bid[ch]]=bid[pa]
W=[[] for _ in range(nv)]; pos=[None]*len(bones)
for cl in [c for c in obj['c'] if c['n']=='Deformer' and c['p'][2]=='Cluster']:
    b=[ch for t,ch,pa in conns if pa==cl['p'][0] and ch in bid]
    if not b: continue
    bi=bid[b[0]]; ix=find(cl,'Indexes'); wt=find(cl,'Weights'); tl=find(cl,'TransformLink')[0]['p'][0]
    pos[bi]=tl[12:15]
    if ix:
        for i,w in zip(ix[0]['p'][0],wt[0]['p'][0]): W[i].append((w,bi))
# bones without cluster: use bindpose
bp=[c for c in obj['c'] if c['n']=='Pose'][0]
for pn in find(bp,'PoseNode'):
    nid=find(pn,'Node')[0]['p'][0]; m=find(pn,'Matrix')[0]['p'][0]
    if nid in bid and pos[bid[nid]] is None: pos[bid[nid]]=m[12:15]
# mesh model transform (geometry may be in mesh local space): check mesh model bindpose matrix
mesh=[c for c in obj['c'] if c['n']=='Model' and c['p'][2]=='Mesh'][0]
mm=None
for pn in find(bp,'PoseNode'):
    if find(pn,'Node')[0]['p'][0]==mesh['p'][0]: mm=find(pn,'Matrix')[0]['p'][0]
print('mesh matrix',[round(x,3) for x in mm] if mm else None)
def xf(m,v): return [m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12], m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13], m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]]
P=[xf(mm,V[i*3:i*3+3]) if mm else V[i*3:i*3+3] for i in range(nv)]
ys=[p[1] for p in P]; xs=[p[0] for p in P]; zs=[p[2] for p in P]
print('bbox x',min(xs),max(xs),'y',min(ys),max(ys),'z',min(zs),max(zs))
for i,n in enumerate(names): print(i,n,parent[i],[round(x,1) for x in pos[i]])
print('verts no weight', sum(1 for w in W if not w), 'max infl', max(len(w) for w in W))
json.dump({'P':P,'T':tris,'W':[sorted(w,reverse=True)[:4] for w in W],'B':names,'par':parent,'J':pos},open('stick.json','w'))
