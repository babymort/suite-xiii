import svgp, glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
A='/home/claude/peeps/Flat Assets/Separate Atoms/'; OUT='/tmp/claude-0/-home-claude/8e592bf0-1121-5e8e-b31c-4451140c5b35/scratchpad/grid/'; os.makedirs(OUT, exist_ok=True)
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13) if os.path.exists('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') else ImageFont.load_default()
def bbox(r):
    xs=[];ys=[]
    for l in r['layers']:
        for s in l[2]:
            for p in svgp.flatten(s,4): xs.append(p[0]); ys.append(p[1])
    return min(xs),min(ys),max(xs),max(ys)
def render(f, S, step=100, pts=None):
    r = svgp.load(A+f); b = bbox(r); W, H = r['vb']
    vb = (b[0]-130, b[1]-70, b[2]-b[0]+200, b[3]-b[1]+150)
    png = OUT+'_tmp.png'; open(OUT+'_tmp.svg','w').write(svgp.svg_doc(r['layers'], vb, int(vb[2]*S))); subprocess.run(['rsvg-convert',OUT+'_tmp.svg','-o',png],check=True)
    im = Image.open(png).convert('RGBA'); bg = Image.new('RGBA', im.size, (255,255,255,255)); bg.alpha_composite(im); im = bg
    S2 = im.width / vb[2]; ox, oy = vb[0], vb[1]
    X = lambda x: (x-ox)*S2; Y = lambda y: (y-oy)*S2
    d = ImageDraw.Draw(im)
    x0 = int(b[0]//step*step); y0 = int(b[1]//step*step)
    for x in range(x0, int(b[2])+step, step):
        d.line([(X(x), Y(b[1])-5), (X(x), Y(b[3])+5)], fill=(255,0,0,110) if x%500 else (255,0,0,220), width=1)
        if x % 200 == 0:
            for yy in range(0, int(b[3]), 500): d.text((X(x)+2, Y(yy)+3), str(x), fill=(200,0,0,255), font=font)
        if x % 200 == 0: d.text((X(x)-12, Y(b[3])+8), str(x), fill=(200,0,0,255), font=font); d.text((X(x)-12, 1), str(x), fill=(200,0,0,255), font=font)
    for y in range(y0, int(b[3])+step, step):
        d.line([(X(b[0])-5, Y(y)), (X(b[2])+5, Y(y))], fill=(0,0,255,110) if y%500 else (0,0,255,220), width=1)
        d.text((2, Y(y)-7), str(y), fill=(0,0,200,255), font=font)
    if pts:
        for k,(x,y) in pts.items():
            if x is None: continue
            c = (0,170,0,255) if k[0]=='r' else (230,120,0,255) if k[0]=='l' else (200,0,200,255)
            d.ellipse([X(x)-6,Y(y)-6,X(x)+6,Y(y)+6], outline=c, width=3); d.text((X(x)+7,Y(y)-7), k, fill=c, font=font)
    return im, b
def sheet(files, S, name, cols=4, pts=None):
    ims = [render(f, S, pts=(pts or {}).get(f))[0] for f in files]
    cw = max(i.width for i in ims); ch = max(i.height for i in ims) + 22; rows = (len(ims)+cols-1)//cols
    c = Image.new('RGB', (cw*cols, ch*rows), 'white'); d = ImageDraw.Draw(c)
    for k, (f, i) in enumerate(zip(files, ims)):
        x, y = (k%cols)*cw, (k//cols)*ch; c.paste(i, (x, y+20)); d.text((x+5, y+2), f.split('/')[-1], fill=(0,0,0), font=font)
    c.save(OUT+name); return OUT+name
if __name__ == '__main__':
    fs = sys.argv[3:]; print(sheet(fs, float(sys.argv[1]), sys.argv[2]))
