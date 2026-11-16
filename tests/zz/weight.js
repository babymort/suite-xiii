// PAGES LÉGÈRES ET RAPIDES : octets chargés par page (bruts et gzip estimés), par type, temps jusqu'au lever du rideau
const { chromium } = require('playwright'); const fs = require('fs'), zlib = require('zlib');
const R = '/home/claude/suite-xiii/'; const pages = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const out = [];
 for (const pg of pages) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const files = new Map();
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); let seen = 0; const t0 = performance.now(); const iv = setInterval(() => { const H = document.documentElement; if (!H) return; if (H.classList.contains('xb0')) seen = 1; else if (seen || document.readyState === 'complete') { window.__up = performance.now() - t0; clearInterval(iv); } }, 10); });
  const p = await ctx.newPage(); p.on('response', r => { const u = r.url(); if (!u.startsWith('http://localhost') || r.status() !== 200) return; const f = decodeURIComponent(new URL(u).pathname.slice(1) || 'index.html'); files.set(f, r.request().resourceType()); });
  await p.goto('http://localhost:8765/' + pg + (pg.includes('?') ? '' : '?desktop=1')); await p.waitForTimeout(4000); const up = await p.evaluate(() => Math.round(window.__up || -1));
  let raw = 0, gz = 0; const by = {}; const big = [];
  for (const [f, t] of files) { let buf; try { buf = fs.readFileSync(R + f); } catch (e) { continue; } const g = /\.(png|jpe?g|gif|webp|woff2?)$/.test(f) ? buf.length : zlib.gzipSync(buf, { level: 6 }).length; raw += buf.length; gz += g; by[t] = (by[t] || 0) + g; big.push([g, f]); }
  big.sort((a, b2) => b2[0] - a[0]);
  out.push([pg.split('?')[0], files.size, Math.round(raw / 1024), Math.round(gz / 1024), up, Object.entries(by).map(([t, n]) => t + ' ' + Math.round(n / 1024)).join(' · '), big.slice(0, 4).map(x => x[1] + ' ' + Math.round(x[0] / 1024) + 'k').join(', ')]);
  await ctx.close(); }
 out.sort((a, b2) => b2[3] - a[3]); out.forEach(o => console.log(o[0].padEnd(18), String(o[1]).padStart(3) + ' fichiers', String(o[2]).padStart(5) + ' Ko bruts', String(o[3]).padStart(5) + ' Ko transférés', 'rideau ' + o[4] + ' ms', '·', o[5], '\n     plus lourds :', o[6]));
 await b.close(); })();
