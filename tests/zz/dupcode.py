# Code copié à l'identique dans plusieurs pages (lignes longues communes à au moins N outils)
import glob, os, zlib, collections
R = '/home/claude/suite-xiii/'
pages = [f for f in glob.glob(R + '*.html') if not f.endswith('-m.html')]
cnt = collections.Counter(); per = {}
for f in pages:
    L = set(l for l in open(f, encoding='utf-8').read().split('\n') if len(l) > 200)
    per[f] = L; cnt.update(L)
shared = {l for l, n in cnt.items() if n >= 10}
tot = sum(len(l) for l in shared)
print('pages', len(pages), '· lignes longues présentes dans ≥ 10 pages :', len(shared), '·', tot // 1024, 'Ko (gzip', len(zlib.compress('\n'.join(shared).encode(), 6)) // 1024, 'Ko) recopiés dans chaque page')
for f in ['plano', 'deviso', 'casto']:
    p = R + f + '.html'; s = sum(len(l) for l in per[p] & shared); print(' ', f, 'dont commun :', s // 1024, 'Ko sur', os.path.getsize(p) // 1024)
# plus gros blocs communs, avec leur début pour les reconnaître
for l in sorted(shared, key=len, reverse=True)[:12]: print('   ', len(l) // 1024, 'Ko ·', cnt[l], 'pages ·', l.strip()[:110])
