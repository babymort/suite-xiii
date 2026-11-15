// TOUT FONCTIONNE SANS RÉSEAU : service worker installé + « Tout préparer », réseau coupé, chaque page rouverte
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const F = n => fs.readFileSync(path.join(__dirname, 'fake', n), 'utf8'); const ANY = F('any.js');
const LIBS = [[/jspdf/i, F('jspdf-cv.js')], [/xlsx/i, F('xlsx.js')], [/html2canvas|qrcode|jsQR|lz-string/i, F('misc.js')], [/leaflet.*\.js/i, ANY + ';window.L=__any();'], [/\.css(\?|$)/i, ''], [/\.(woff2?|ttf)(\?|$)/i, '']];
const pages = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ serviceWorkers: 'allow', viewport: { width: 1440, height: 900 } });
 let off = false; const extFail = {};
 await ctx.route('**/*', r => { const u = r.request().url(); if (off && !u.startsWith('http://localhost')) { return r.abort('internetdisconnected'); } if (u.startsWith('http://localhost')) return r.continue(); const m = LIBS.find(x => x[0].test(u)); return r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: /\.css/.test(u) ? 'text/css' : /\.(woff2?|ttf)/.test(u) ? 'font/woff2' : 'application/javascript', body: m ? m[1] : ANY }); });
 await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.news.seen', JSON.stringify({ ver: 'x', k: [] })); localStorage.setItem('xiii.pwa.mode', 'offline'); } catch (e) { } });
 const p = await ctx.newPage(); await p.goto('http://localhost:8765/index.html?desktop=1'); await p.waitForTimeout(2500);
 const t0 = Date.now(); await p.evaluate(async () => { const r = await navigator.serviceWorker.register('sw.js'); await navigator.serviceWorker.ready; });
 await p.reload(); await p.waitForTimeout(2500);
 const st = await p.evaluate(() => new Promise(res => { const c = new MessageChannel(); c.port1.onmessage = e => res(e.data); navigator.serviceWorker.controller ? navigator.serviceWorker.controller.postMessage({ t: 'warm' }, [c.port2]) : res('pas de contrôleur'); setTimeout(() => res('délai'), 60000); }));
 const st2 = await p.evaluate(() => new Promise(res => { const c = new MessageChannel(); c.port1.onmessage = e => res(e.data); navigator.serviceWorker.controller.postMessage({ t: 'status' }, [c.port2]); setTimeout(() => res('délai'), 10000); }));
 console.log('préparation :', Math.round((Date.now() - t0) / 1000) + ' s', JSON.stringify(st).slice(0, 150), '· état :', JSON.stringify(st2).slice(0, 200));
 off = true; await ctx.setOffline(true); await p.close();
 const out = [];
 for (const pg of pages) { const q = await ctx.newPage(); const errs = [], fails = []; q.on('pageerror', e => errs.push(e.message.slice(0, 80))); q.on('requestfailed', r => { const u = r.url(); if (!/script\.google|supabase|openrouter|tile|nominatim|api\.|open-meteo|wikimedia|openverse|unsplash|fonts\.g/.test(u)) fails.push(u.replace('http://localhost:8765/', '').slice(0, 60)); });
  let ok = '', note = '';
  try { await q.goto('http://localhost:8765/' + pg, { timeout: 20000 }); await q.waitForTimeout(3500);
   ok = await q.evaluate(() => (document.documentElement.classList.contains('xb0') ? 'RIDEAU BLOQUÉ ' : '') + (document.body && document.body.innerText.trim().length > 50 ? 'ok' : 'VIDE')); note = await q.evaluate(() => { const x = document.getElementById('xoff'); return x && x.getClientRects().length ? x.innerText.replace(/\s+/g, ' ').slice(0, 120) : ''; });
  } catch (e) { ok = 'ÉCHEC ' + e.message.slice(0, 60); }
  out.push(pg.split('?')[0].padEnd(20) + ' ' + ok + (errs.length ? ' · ERR ' + [...new Set(errs)].slice(0, 2).join(' / ') : '') + (fails.length ? ' · manquants : ' + [...new Set(fails)].slice(0, 3).join(', ') : '') + (note ? ' · bandeau : ' + note : '')); await q.close(); }
 console.log(out.join('\n')); await b.close(); })();
