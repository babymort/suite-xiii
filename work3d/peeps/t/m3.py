import sys; sys.path.insert(0,'.')
import seg, complete, numpy as np, cv2
SC='/tmp/claude-0/-home-claude/8e592bf0-1121-5e8e-b31c-4451140c5b35/scratchpad/'
n=sys.argv[1]; parts=sys.argv[2:]
R=seg.run(n); out,inf=complete.complete(R); H,W=R['sil'].shape
tiles=[]
for k in parts:
    img=np.full((H,W,3),255,np.uint8); img[R['sil']>0]=(225,225,225); img[R['ink']>0]=(110,110,110)
    f,b=out[k]; img[f]=(255,170,170); img[b]=(20,20,200)
    cv2.putText(img,k,(10,40),cv2.FONT_HERSHEY_SIMPLEX,1.2,(0,0,0),2); tiles.append(img)
cv2.imwrite(SC+'m3.png',np.hstack(tiles)[:,:,::-1])
