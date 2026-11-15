// NOUVEAUTÉS DE LA SAISON : chaque fonction ouverte / utilisée sur une vraie page, erreurs JS relevées
const { chromium } = require('playwright');
const T = [
 ['plano', 'Raccourcis clavier', async p => { await p.evaluate(() => XKMAP.open()); return p.evaluate(() => document.querySelectorAll('#xkm-l .r').length >= 10); }],
 ['plano', 'Réglages par outil', async p => { await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(3500); await p.goto('http://localhost:8765/plano.html?desktop=1'); await p.waitForTimeout(2500); await p.evaluate(() => XTOOLCFG.open()); return p.evaluate(() => document.querySelectorAll('#xtc-l .r[data-k]').length > 20); }],
 ['plano', 'Animations', async p => { await p.evaluate(() => XANIM.open()); return p.evaluate(() => !!document.querySelector('#xan-box .xan-seg button')); }],
 ['plano', 'Profils', async p => { await p.evaluate(() => XPROF.open()); return p.evaluate(() => document.querySelectorAll('#xpf-box [data-b]').length === 3); }],
 ['plano', 'Notifications', async p => { await p.evaluate(() => XNOTIF.open()); return p.evaluate(() => document.querySelectorAll('#xnf2-box input[data-c]').length === 18); }],
 ['plano', 'Accessibilité', async p => { await p.evaluate(() => XA11Y3.open()); return p.evaluate(() => document.querySelectorAll('#xa3-box [data-k]').length >= 9); }],
 ['plano', 'Thème perso', async p => { await p.evaluate(() => XCTHEME.open()); return p.evaluate(() => !!document.querySelector('#xct')); }],
 ['plano', 'Barres à la carte', async p => { await p.evaluate(() => XBARCFG.open()); return p.evaluate(() => !!document.querySelector('#xbc')); }],
 ['plano', 'Fiche projet en page + Identité', async p => { await p.evaluate(() => XPIDENT.open()); await p.waitForTimeout(800); return p.evaluate(() => !!document.querySelector('#xpj-ov.xpj-page') && !!document.getElementById('xpj-id')); }],
 ['plano', 'Charte : modèles', async p => { await p.evaluate(() => XPROJET.open('c')); await p.waitForTimeout(600); return p.evaluate(() => !!document.querySelector('[data-modsave]')); }],
 ['index', 'Accueil sur mesure', async p => { const f = p.frames().find(f => /index\.html/.test(f.url())) || p.mainFrame(); await f.evaluate(() => XHOMECFG.open()); return f.evaluate(() => !!document.querySelector('#xhc')); }],
 ['index', 'Réglages du projet en page', async p => { const f = p.frames().find(f => /index\.html/.test(f.url())) || p.mainFrame(); await f.evaluate(() => XREGLPAGE.open()); return f.evaluate(() => document.querySelectorAll('#xrg-ov .xrg-r').length > 10); }],
 ['team', 'TEAM en outil', async p => p.evaluate(() => document.documentElement.classList.contains('xmg') && !!document.querySelector('.xmg-sw'))],
 ['drive', 'DRIVE en outil', async p => p.evaluate(() => document.documentElement.classList.contains('xmg'))],
 ['cadro', 'CADRO LIVE complet', async p => { await p.evaluate(() => XCLIVE.open()); await p.waitForTimeout(500); await p.evaluate(() => document.querySelector('#xcl [data-go2]').click()); await p.waitForTimeout(1500); return p.evaluate(() => !!XCLIVE.stream() && !!document.querySelector('#xcl .xcs') && !!document.querySelector('#xcl .xce') && !!document.querySelector('#xcl .xcv') && !!document.querySelector('#xcl .xcg') && !!document.querySelector('#xcl [data-cap]')); }],
 ['cadro', 'CADRO LIVE capture', async p => { await p.evaluate(() => XCLIVE.open()); await p.evaluate(() => document.querySelector('#xcl [data-go2]').click()); await p.waitForTimeout(1500); await p.evaluate(() => XCCAP.open()); return p.evaluate(() => !!document.querySelector('#xcc img')); }],
 ['storyboardo', 'Réception CADRO LIVE', async p => { await p.evaluate(() => localStorage.setItem('xiii.inbox.cadrolive', JSON.stringify([{ img: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', seq: '1', plan: '2', notes: 't' }]))); await p.evaluate(() => XCLSB.ban()); return p.evaluate(() => !!document.getElementById('xclsb')); }],
 ['plano', 'Taille du texte 150 %', async p => { await p.evaluate(() => { localStorage.setItem('xiii.a11y', JSON.stringify({ size: 150 })); XA11Y3.apply(); XZOOM.set('a11y', 1.5); }); await p.waitForTimeout(300); const r = await p.evaluate(() => { const b = document.getElementById('xbug-btn') || document.querySelector('#xs-gear'); if (!b) return true; const x = b.getBoundingClientRect(); return x.right <= innerWidth + 2 && x.bottom <= innerHeight + 2; }); await p.evaluate(() => { localStorage.removeItem('xiii.a11y'); XZOOM.set('a11y', 1); }); return r; }],
];
(async () => { const b = await chromium.launch(); const res = [];
  for (const [app, name, fn] of T) { const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); await c.addInitScript(() => { try { localStorage.setItem('xiii.tips.off', 'true'); } catch (e) { } }); const p = await c.newPage(); const E = []; p.on('pageerror', e => E.push(e.message.slice(0, 120)));
    await p.goto('http://localhost:8765/' + app + '.html?desktop=1'); await p.waitForTimeout(app === 'index' ? 4500 : 2800); await p.evaluate(() => document.querySelectorAll('#xt-root,#xnw-ov').forEach(x => x.remove())).catch(() => { });
    let ok = false; try { ok = await fn(p); } catch (e) { E.push('robot : ' + e.message.slice(0, 120)); } res.push([ok && !E.length ? '✓' : '✗', app, name, E.join(' | ')]); await c.close(); }
  res.forEach(r => console.log(r.join('  '))); await b.close(); })();
