// ZZ : clic gauche et clic droit sur chaque bouton des barres (outil par outil)
const { chromium } = require('playwright'); const fs = require('fs');
const APPS = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JSON.parse(fs.readFileSync('/home/claude/xiii-src/versions.json'))).filter(a => fs.existsSync('/home/claude/suite-xiii/' + a + '.html'));
async function open(ctx, app) { const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('dialog', d => d.dismiss().catch(() => { })); p.on('filechooser', () => { });
  await p.goto('http://localhost:8765/' + app + '.html?desktop=1', { timeout: 30000 }); await p.waitForTimeout(2400);
  await p.evaluate(() => { document.querySelectorAll('#xt-root,#xtp,#xnw-ov,#xg-ban').forEach(m => m.remove()); }); return p; }
const LIST = () => [...document.querySelectorAll('#top-bar button,#toolbar button,#xb2 button,#top-bar a[href],#toolbar a[href]')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.top < innerHeight && r.left < innerWidth && getComputedStyle(b).visibility !== 'hidden' && !b.disabled; });
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, acceptDownloads: false });
 await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); for (const k of Object.keys(localStorage)) { } } catch (e) { } window.print = () => { }; window.open = () => null; });
 await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 const R = { };
 for (const app of APPS) { const rep = { n: 0, cover: [], err: [], nav: [], rmenu: 0, rstay: [], dead: [] }; R[app] = rep; let p;
  try { p = await open(ctx, app); const labels = await p.evaluate(LIST => eval(LIST)().map((x, i) => (x.id ? '#' + x.id : '') + '|' + ((x.title || x.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30))), LIST.toString().replace(/^\(\) => /, '() => '));
   rep.n = labels.length;
   for (let i = 0; i < labels.length; i++) {
    for (let tryn = 0; tryn < 2; tryn++) {
     const info = await p.evaluate(([i, LIST, want]) => { const L = eval(LIST)(); const x = L.find(e => ((e.id ? '#' + e.id : '') + '|' + ((e.title || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30))) === want) || null; if (!x) return { gone: 1 }; x.scrollIntoView({ block: 'nearest', inline: 'nearest' }); const r = x.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, h = document.elementFromPoint(cx, cy); return { cx, cy, ok: !!h && (h === x || x.contains(h) || h.closest('button,a') === x) }; }, [i, LIST.toString(), labels[i]]).catch(() => ({ gone: 1 }));
     if (info.gone) break;
     if (!info.ok) { if (tryn === 0) { await p.close(); p = await open(ctx, app); continue; } rep.cover.push(labels[i]); break; }
     const url = p.url(), e0 = p.errs.length;
     // clic droit : un menu s'ouvre-t-il, se ferme-t-il en cliquant ailleurs ?
     const vis0 = await p.evaluate(() => [...document.querySelectorAll('[class*=menu],[id*=menu],[class*=ctx],[id*=ctx]')].filter(m => m.getClientRects().length && getComputedStyle(m).visibility !== "hidden" && getComputedStyle(m).position.match(/fixed|absolute/)).length);
     await p.mouse.click(info.cx, info.cy, { button: 'right' }); await p.waitForTimeout(220);
     const vis1 = await p.evaluate(() => [...document.querySelectorAll('[class*=menu],[id*=menu],[class*=ctx],[id*=ctx]')].filter(m => m.getClientRects().length && getComputedStyle(m).visibility !== "hidden" && getComputedStyle(m).position.match(/fixed|absolute/)).length);
     if (vis1 > vis0) { rep.rmenu++; await p.mouse.click(800, 880); await p.waitForTimeout(220); const vis2 = await p.evaluate(() => [...document.querySelectorAll('[class*=menu],[id*=menu],[class*=ctx],[id*=ctx]')].filter(m => m.getClientRects().length && getComputedStyle(m).visibility !== "hidden" && getComputedStyle(m).position.match(/fixed|absolute/)).length); if (vis2 > vis0) rep.rstay.push(labels[i]); }
     await p.keyboard.press('Escape');
     // clic gauche
     const dom0 = await p.evaluate(() => document.documentElement.outerHTML.length + ":" + document.querySelectorAll("*").length + document.body.className);
     await p.mouse.click(info.cx, info.cy); await p.waitForTimeout(350);
     const dom1 = await p.evaluate(() => document.documentElement.outerHTML.length + ":" + document.querySelectorAll("*").length + document.body.className).catch(() => 'nav');
     if (p.errs.length > e0) rep.err.push(labels[i] + ' → ' + p.errs.slice(e0).join(' / ').slice(0, 120));
     if (p.url().split('#')[0] !== url.split('#')[0]) { rep.nav.push(labels[i]); await p.close(); p = await open(ctx, app); break; }
     if (dom1 === dom0) rep.dead.push(labels[i]);
     await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.waitForTimeout(120);
     break; } }
  } catch (e) { rep.fatal = e.message.slice(0, 100); }
  try { await p.close(); } catch (e) { }
  console.log(app, JSON.stringify(rep)); }
 fs.writeFileSync('/tmp/zz/clicks_' + (process.argv[2] || 'all') + '.json', JSON.stringify(R)); await b.close(); })();
