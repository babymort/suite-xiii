// REGROUPER LES NOUVEAUX BOUTONS : boutons des barres saison 5 (port 8766) vs beta (8765) — où sont rangés les nouveaux ?
const { chromium } = require('playwright'); const fs = require('fs');
const apps = process.argv.slice(2);
const LIST = () => { const sec = b => { const s = b.closest('[data-sec],.xsec,.btn-group,#xb-file,#xb-bar,#xb-tool,#xtop-moved,#top-bar,#toolbar'); return s ? (s.id || s.dataset.sec || s.className.split(' ')[0]) : '?'; };
  const bar = b => b.closest('#top-bar') ? 'haut' : b.closest('#toolbar') ? 'outils' : '?';
  return [...document.querySelectorAll('#top-bar button,#toolbar button')].filter(b => b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden').map((b, i) => { const lab = ((b.querySelector('.btn-label') || {}).textContent || '').trim(); const t = (b.title || '').split(/ : | — | \(/)[0].trim(); return { k: (b.id || '') + '|' + (t || lab).slice(0, 30), lab: lab || t.slice(0, 18), bar: bar(b), sec: sec(b), i, x: Math.round(b.getBoundingClientRect().left) }; }); };
(async () => { const b = await chromium.launch(); const out = {};
 for (const a of apps) { const R = {};
  for (const [v, port] of [['s5', 8766], ['s6', 8765]]) { const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
   await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
   await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
   const p = await ctx.newPage(); try { await p.goto('http://localhost:' + port + '/' + a + '.html?desktop=1'); await p.waitForTimeout(3500); R[v] = await p.evaluate(LIST); } catch (e) { R[v] = []; } await ctx.close(); }
  const old = new Set(R.s5.map(x => x.k.split('|')[1].toLowerCase())), oid = new Set(R.s5.map(x => x.k.split('|')[0]).filter(Boolean));
  const nw = R.s6.filter(x => !old.has(x.k.split('|')[1].toLowerCase()) && !(x.k.split('|')[0] && oid.has(x.k.split('|')[0])));
  out[a] = { n5: R.s5.length, n6: R.s6.length, nw: nw.map(x => x.lab + ' [' + x.bar + ' · ' + x.sec + ' · après « ' + ((R.s6[x.i - 1] || {}).lab || '—') + ' »]') };
  console.log(a.padEnd(12), 'saison 5 :', R.s5.length, '· saison 6 :', R.s6.length, '· nouveaux :', nw.length, '\n   ' + out[a].nw.join('\n   ')); }
 fs.writeFileSync('/tmp/zz/newbtn.json', JSON.stringify(out)); await b.close(); })();
