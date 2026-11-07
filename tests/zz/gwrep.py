import json,sys
d=json.load(open(sys.argv[1]))
for k,v in d.items():
    print('==',k,v.get('type'),'prefill',v.get('prefill'),'sz',v.get('sz'),'keys',v.get('keys'))
    print('   envoi1',v.get('send1'),'→',v.get('land1'),'| reçu1',v.get('recv1'))
    print('   envoi2',v.get('send2'),'| reçu2',v.get('recv2'))
    for c in ['c1','c2']:
        x=v.get(c) or {}; print('  ',c,'ajouts',x.get('added'),'dObjs',x.get('dObjs'),'perdus',len(x.get('lost',[])),x.get('lost',[])[:3],'doublons',len(x.get('dup',[])),x.get('dup',[])[:3])
    for e in v['E'][:8]: print('   !',e)
