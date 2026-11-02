import struct, zlib, sys
def parse(path):
    d=open(path,'rb').read(); ver=struct.unpack('<I',d[23:27])[0]; big=ver>=7500
    pos=27
    def rd_node(p):
        if big: end,np_,plen=struct.unpack('<QQQ',d[p:p+24]); p+=24
        else: end,np_,plen=struct.unpack('<III',d[p:p+12]); p+=12
        nl=d[p]; p+=1
        if end==0: return None,p
        name=d[p:p+nl].decode('latin1'); p+=nl
        props=[]
        for _ in range(np_):
            t=chr(d[p]); p+=1
            if t=='Y': props.append(struct.unpack('<h',d[p:p+2])[0]); p+=2
            elif t=='C': props.append(bool(d[p])); p+=1
            elif t=='I': props.append(struct.unpack('<i',d[p:p+4])[0]); p+=4
            elif t=='F': props.append(struct.unpack('<f',d[p:p+4])[0]); p+=4
            elif t=='D': props.append(struct.unpack('<d',d[p:p+8])[0]); p+=8
            elif t=='L': props.append(struct.unpack('<q',d[p:p+8])[0]); p+=8
            elif t in 'fdlib':
                n,enc,cl=struct.unpack('<III',d[p:p+12]); p+=12; raw=d[p:p+cl]; p+=cl
                if enc==1: raw=zlib.decompress(raw)
                fmt={'f':'f','d':'d','l':'q','i':'i','b':'b'}[t]; props.append(list(struct.unpack('<%d%s'%(n,fmt),raw)))
            elif t in 'SR':
                n=struct.unpack('<I',d[p:p+4])[0]; p+=4; v=d[p:p+n]; p+=n; props.append(v.decode('utf8','replace') if t=='S' else v)
            else: raise Exception('type '+t)
        kids=[]
        while p<end:
            k,p=rd_node(p)
            if k is None: break
            kids.append(k)
        return {'n':name,'p':props,'c':kids},end
    nodes=[]
    while pos<len(d)-160:
        n,pos=rd_node(pos)
        if n is None: break
        nodes.append(n)
    return nodes
def find(n,name): return [c for c in n['c'] if c['n']==name]
if __name__=='__main__':
    N=parse(sys.argv[1]); top={n['n']:n for n in N}
    obj=top['Objects']
    from collections import Counter
    print(Counter((c['n'],c['p'][2] if len(c['p'])>2 else '') for c in obj['c']))
    for c in obj['c']:
        if c['n']=='Geometry':
            v=find(c,'Vertices')[0]['p'][0]; idx=find(c,'PolygonVertexIndex')[0]['p'][0]
            print('geo',c['p'][1].split('\x00')[0],len(v)//3,'verts',len(idx),'idx', 'layers',[k['n'] for k in c['c']])
    print([c['p'][1].split('\x00')[0] for c in obj['c'] if c['n']=='Model'][:50])
    print('anim', [c['p'][1].split('\x00')[0] for c in obj['c'] if c['n'] in('AnimationStack','AnimationCurve')][:5], sum(1 for c in obj['c'] if c['n']=='AnimationCurve'))
