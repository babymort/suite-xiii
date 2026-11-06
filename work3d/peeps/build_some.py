# Reconstruit quelques poses et les injecte dans un openpeeps.json existant
import sys, json, build
src = sys.argv[1]; names = sys.argv[2:]
D = json.load(open(src, encoding='utf-8'))
for n in names: D['P'][n] = build.build_pose(n); print('pose', n, sum(len(v[0]) + len(v[1]) for v in D['P'][n]['ex'].values()) // 1024, 'Ko ext')
open(src, 'w', encoding='utf-8').write(json.dumps(D, ensure_ascii=False, separators=(',', ':')))
