import sys; sys.path.insert(0,'.')
import seg, complete, numpy as np, cv2
SC='/tmp/claude-0/-home-claude/8e592bf0-1121-5e8e-b31c-4451140c5b35/scratchpad/'
for n in sys.argv[1:]:
    R=seg.run(n); out,inf=complete.complete(R); H,W=R['sil'].shape
    img=np.full((H,W,3),255,np.uint8); img[R['sil']>0]=(235,235,235); img[R['ink']>0]=(60,60,60)
    for k,(f,b) in out.items():
        img[f]=(0.5*img[f]+0.5*np.array([255,150,150])).astype(np.uint8)
        img[b]=(0.4*img[b]+0.6*np.array([30,30,230])).astype(np.uint8)
    for k,c in inf['C'].items():
        cs,_=cv2.findContours(c.astype(np.uint8),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); cv2.drawContours(img,cs,-1,(0,160,0),1)
    cv2.imwrite(SC+'m2_'+n.replace('/','_')+'.png',img[:,:,::-1]); print(n,{k:round(v) for k,v in inf['hw'].items()},round(inf['lw'],1))
