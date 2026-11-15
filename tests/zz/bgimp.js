// Photo de fond de l'accueil : import, enregistrement avec Drive (simulé), rechargement, Drive injoignable
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
 let driveUp = true; const store = {};
 await ctx.route('https://fake.drive/**', async r => { if (!driveUp) return r.abort(); const q = JSON.parse(r.request().postData() || '{}'); let o = { ok: true };
  if (q.a === 'file_put') { store[q.h] = q; o = { ok: true, id: 'FILE' + Object.keys(store).length + 'abcdefghij' }; }
  else if (q.a === 'get') o = { ok: true, rev: 1 }; else if (q.a === 'put') o = { ok: true, rev: 2 }; else if (q.a === 'file_get') o = { ok: false, err: 'introuvable' };
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) }); });
 await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://localhost') || u.startsWith('https://fake.drive')) return r.fallback(); return r.abort(); });
 await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.index.hide', '1'); localStorage.setItem('xiii.news.seen', JSON.stringify({ ver: 'x', k: [] })); if (!localStorage.getItem('xiii.drive')) localStorage.setItem('xiii.drive', JSON.stringify({ url: 'https://fake.drive/exec', code: 'ABC' })); } catch (e) { } });
 const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html?desktop=1'); await p.waitForTimeout(3000);
 await p.evaluate(() => XPROJET.open()); await p.waitForTimeout(800);
 const has = await p.evaluate(() => !!document.querySelector('#xpc-file')); console.log('bouton photo présent :', has);
 await p.setInputFiles('#xpc-file', process.argv[2] || '/tmp/zz/test_photo.jpg'); await p.waitForTimeout(1500);
 console.log('aperçu :', await p.evaluate(() => (document.querySelector('#xpc-bgp').style.backgroundImage || '').slice(0, 40)));
 await p.evaluate(() => { document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); document.querySelector('#xpc-save').click(); }); await p.waitForTimeout(2500); console.log('statut :', await p.evaluate(() => document.querySelector('#xpc-st').textContent));
 const chk = async l => console.log(l, await p.evaluate(() => [document.body.classList.contains('xpbg'), (document.body.style.getPropertyValue('--xpbg') || '').slice(0, 60), (JSON.parse(localStorage.getItem('xiii.pcfg') || '{}').bg || '').slice(0, 40)]));
 await p.keyboard.press('Escape'); await p.waitForTimeout(500); await chk('après enregistrement :');
 await p.reload(); await p.waitForTimeout(3500); await chk('après rechargement :');
 driveUp = false; await p.reload(); await p.waitForTimeout(3500); await chk('Drive injoignable :');
 await p.evaluate(() => indexedDB.deleteDatabase('xiiiFiles')); await p.reload(); await p.waitForTimeout(3500); await chk('autre appareil (pas de copie locale), Drive injoignable :');
 console.log('erreurs :', errs); await b.close(); })();
