// Import de photos quand le stockage local est (presque) plein : fond de l'accueil (Accueil sur mesure), fond du projet (Personnalisation), bannière
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
 await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await ctx.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.index.hide', '1'); localStorage.setItem('xiii.news.seen', JSON.stringify({ ver: 'x', k: [] })); } catch (e) { } });
 const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => { errs.push('ALERTE: ' + d.message()); d.dismiss(); });
 await p.goto('http://localhost:8765/index.html?desktop=1'); await p.waitForTimeout(2500);
 // remplir le stockage local
 const left = await p.evaluate(() => { localStorage.setItem('xiii.projets', JSON.stringify({ list: [{ id: 'f1', title: 'Concert Khaled' }], active: 'f1' })); let n = 0, blk = 'x'.repeat(200000); try { for (; n < 200; n++) localStorage.setItem('zz.fill.' + n, blk); } catch (e) { } let s = 'x'.repeat(20000); try { for (let k = 0; k < 50; k++) localStorage.setItem('zz.f2.' + k, s); } catch (e) { } return n; });
 console.log('stockage rempli (blocs de 200 Ko) :', left);
 const chooser = async (fn) => { const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 5000 }), p.evaluate(fn)]); await fc.setFiles('/tmp/zz/test_photo.jpg'); await p.waitForTimeout(2500); };
 // 1) Accueil sur mesure
 await p.evaluate(() => XHOMECFG.open()); await p.waitForTimeout(500);
 await chooser(() => { const b = [...document.querySelectorAll('#xhc .xhc-seg button')].find(x => x.dataset.v === 'img'); b.click(); });
 console.log('1 accueil :', await p.evaluate(() => [(JSON.parse(localStorage.getItem('xiii.home.cfg') || '{}').img || '').slice(0, 20), (getComputedStyle(document.documentElement).getPropertyValue('--xh-img') || '').slice(0, 30)]));
 await p.evaluate(() => { const o = document.getElementById('xhc'); if (o) o.remove(); });
 // 2) Personnalisation du projet (fond pour l'équipe)
 await p.evaluate(() => XPROJET.open()); await p.waitForTimeout(800); await p.setInputFiles('#xpc-file', '/tmp/zz/test_photo.jpg'); await p.waitForTimeout(1500);
 await p.evaluate(() => { document.querySelectorAll('#xt-root,#xtp').forEach(m => m.remove()); document.querySelector('#xpc-save').click(); }); await p.waitForTimeout(2000);
 console.log('2 projet :', await p.evaluate(() => [document.querySelector('#xpc-st').textContent, (JSON.parse(localStorage.getItem('xiii.pcfg') || '{}').bg || '').slice(0, 20), document.body.classList.contains('xpbg')]));
 // 3) bannière
 await p.evaluate(() => { document.querySelectorAll('#xpj-ov,.xpj-ov').forEach(o => o.remove()); XPIDENT.open(); }); await p.waitForTimeout(1500);
 const hasBn = await p.evaluate(() => !!document.querySelector('[data-bn]')); if (hasBn) await chooser(() => document.querySelector('[data-bn]').click());
 console.log('3 bannière :', hasBn, await p.evaluate(() => (localStorage.getItem('xiii.pid.banner') || '').slice(0, 20)));
 // rechargement
 await p.reload(); await p.waitForTimeout(3500);
 console.log('après rechargement :', await p.evaluate(() => ({ accueil: (getComputedStyle(document.documentElement).getPropertyValue('--xh-img') || '').slice(0, 30), projet: document.body.classList.contains('xpbg') && (document.body.style.getPropertyValue('--xpbg') || '').includes('data:'), banniere: (getComputedStyle(document.querySelector('main > .title-row') || document.body).getPropertyValue('--xpid-img') || '').slice(0, 30) })));
 console.log('erreurs :', errs.slice(0, 5)); await b.close(); })();
