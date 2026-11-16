const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); for (const a of process.argv.slice(2)) { const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
 await p.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await p.goto('http://localhost:8765/' + a + '.html?desktop=1'); await p.waitForTimeout(3000);
 console.log(a, await p.evaluate(() => { const bar = document.getElementById('top-bar'); if (!bar) return 'no top-bar';
  const B = [...bar.querySelectorAll('button')].filter(x => x.getClientRects().length && x.getBoundingClientRect().width > 6 && !x.closest('#tabs-container,.xn-auth,#xid-chip'));
  return B.map((x, i) => { const r = x.getBoundingClientRect(), y = B[i + 1]; const par = x.parentElement; const cs = getComputedStyle(par); return (x.id || x.className.split(' ')[0]) + '@' + (par.id || par.className.split(' ')[0]) + '[gap ' + cs.gap + ' ml ' + getComputedStyle(x).marginLeft + '/' + getComputedStyle(x).marginRight + ']' + (y && y.parentElement === par ? ' →' + Math.round(y.getBoundingClientRect().left - r.right) : ' |'); }).join('\n  '); })); await p.close(); } await b.close(); })();
