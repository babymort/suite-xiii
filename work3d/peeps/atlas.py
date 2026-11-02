import svgp, glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
A='/home/claude/peeps/Flat Assets/Separate Atoms/'; O='/tmp/claude-0/-home-claude/8e592bf0-1121-5e8e-b31c-4451140c5b35/scratchpad/'
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
def atlas(d, out, cols=10, cw=150, vb=None, under=None):
    fs = sorted(glob.glob(A+d+'/*.svg')); ims = []
    for f in fs:
        L = svgp.load(f)['layers']; W, H = svgp.load(f)['vb']
        if under: L = svgp.load(A+under)['layers'] + [(l[0], l[1], [{'start': (s['start'][0]+159, s['start'][1]+186), 'closed': s['closed'], 'segs': [(g[0],)+tuple((p[0]+159, p[1]+186) for p in g[1:]) for g in s['segs']]} for s in l[2]], l[3]) for l in L]
        v = vb or (-90, -70, W+180, H+180)
        open(O+'_a.svg','w').write(svgp.svg_doc(L, v, cw)); subprocess.run(['rsvg-convert','-b','#e8e8e8',O+'_a.svg','-o',O+'_a.png'], check=True)
        ims.append((os.path.basename(f)[:-4], Image.open(O+'_a.png').convert('RGB')))
    ch = max(i.height for _, i in ims) + 16; rows = (len(ims)+cols-1)//cols
    c = Image.new('RGB', (cols*cw, rows*ch), 'white'); dr = ImageDraw.Draw(c)
    for k, (n, i) in enumerate(ims):
        x, y = (k%cols)*cw, (k//cols)*ch; c.paste(i, (x, y)); dr.text((x+3, y+ch-15), n, fill=(0,0,0), font=font)
    c.save(O+out); print(O+out)
if __name__ == '__main__': atlas(sys.argv[1], sys.argv[2], under=sys.argv[3] if len(sys.argv) > 3 else None)
