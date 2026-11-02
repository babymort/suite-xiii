import json, struct, base64
d=json.load(open('stick.json'))
P=[(-p[0],p[1],-p[2]) for p in d['P']]; J=[(-p[0],p[1],-p[2]) for p in d['J']]  # face à -z comme les personnages de PLANO
q=lambda v:max(-32767,min(32767,int(round(v*100))))
b=bytearray()
b+=struct.pack('<HHB',len(P),len(d['T'])//3,len(J))
for p in P: b+=struct.pack('<hhh',*map(q,p))
for t in d['T']: b+=struct.pack('<H',t)
for w in d['W']:
    w=(w+[[0,0]]*4)[:4]; s=sum(x[0] for x in w) or 1
    ws=[int(round(x[0]/s*255)) for x in w]; ws[0]+=255-sum(ws)
    b+=bytes([x[1] for x in w])+bytes(ws)
for j,p in zip(J,d['par']): b+=struct.pack('<hhhb',*map(q,j),p)
# brouillage (format propre à la suite : le modèle n'est pas récupérable tel quel)
k=0x5EED13; o=bytearray(len(b))
for i,x in enumerate(b): k=(k*1103515245+12345)&0x7fffffff; o[i]=x^((k>>16)&255)
s=base64.b64encode(bytes(o)).decode()
names=d['B']; print(len(b),len(s),names)
open('xman-data.js','w').write("const XMAN_D = '"+s+"', XMAN_B = "+json.dumps(names)+";\n")
