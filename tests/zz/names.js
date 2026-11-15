const { chromium } = require('playwright'); const fs = require('fs');
const APPS = Object.keys(JSON.parse(fs.readFileSync('/home/claude/xiii-src/versions.json'))).filter(a => fs.existsSync('/home/claude/suite-xiii/' + a + '.html'));
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } });
 const R = [];
 for (const app of APPS) { const p = await ctx.newPage(); try { await p.goto('http://localhost:8765/' + app + '.html?desktop=1'); await p.waitForTimeout(2300);
  const L = await p.evaluate(() => [...document.querySelectorAll('#top-bar button,#toolbar button,#xb2 button,#top-bar a,#toolbar a')].filter(b => b.getClientRects().length).map(b => { const lab = (b.querySelector('.btn-label') || {}).textContent; const t = [...b.childNodes].map(n => n.nodeType === 3 ? n.nodeValue : (n.classList && (n.classList.contains('xgl-e') || n.tagName === 'svg') ? '' : n.textContent)).join('').trim().replace(/\s+/g, ' '); return { id: b.id || '', oc: (b.getAttribute('onclick') || '').slice(0, 40), lab: (lab || t || '').trim(), title: (b.title || b.getAttribute('aria-label') || '').trim() }; }));
  L.forEach(x => R.push(Object.assign({ app }, x))); } catch (e) { } await p.close(); }
 fs.writeFileSync('/tmp/zz/names.json', JSON.stringify(R)); console.log(R.length); await b.close(); })();
