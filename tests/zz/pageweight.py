# Ce qui pèse dans une page : images base64, SVG en ligne, gros blocs de données
import re, sys, zlib
R = '/home/claude/suite-xiii/'
for f in sys.argv[1:]:
    s = open(R + f + '.html', encoding='utf-8').read()
    b64 = re.findall(r'data:[a-z]+/[\w.+-]+;base64,[A-Za-z0-9+/=]{2000,}', s)
    svg = sum(len(x) for x in re.findall(r'<svg.*?</svg>', s, re.S))
    big = sorted(((len(m.group(0)), m.start()) for m in re.finditer(r'(?:\[[^\[\]]{20000,}\]|\{[^{}]{20000,}\})', s)), reverse=True)[:3]
    print(f.ljust(11), 'brut', len(s) // 1024, 'Ko · gzip', len(zlib.compress(s.encode(), 6)) // 1024, 'Ko · base64', len(b64), 'images', sum(len(x) for x in b64) // 1024, 'Ko · svg', svg // 1024, 'Ko')
    for n, i in big: print('      bloc', n // 1024, 'Ko :', s[max(0, i - 80):i].replace('\n', ' ')[-80:])
