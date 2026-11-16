// POSTO → PLANNO de bout en bout : vraie étape dans POSTO, envoi, arrivée, intégration, tâche visible dans le planning
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await ctx.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); });
 const p = await ctx.newPage(); const E = []; p.on('pageerror', e => E.push(e.message)); p.on('dialog', d => { E.push('dialog ' + d.message()); d.dismiss(); });
 await p.goto('http://localhost:8765/posto.html'); await p.waitForTimeout(2500);
 await p.evaluate(() => { P.steps = P.steps || []; P.steps.push({ id: 'zt1', name: 'Étalonnage robot', start: '2026-12-01', due: '2026-12-03', status: 'todo' }); });
 await p.evaluate(() => XGATE.go('calendrier')); await p.waitForTimeout(4500);
 console.log('arrivée :', p.url().replace('http://localhost:8765/', ''));
 const fr = p.frames().find(f => /planno\.html/.test(f.url())); console.log('cadre PLANNO :', fr ? fr.url().replace('http://localhost:8765/', '') : 'aucun');
 const where = fr || p.mainFrame();
 const ban = await where.evaluate(() => { const b = document.getElementById('xps-ban'); return b ? b.innerText.replace(/\s+/g, ' ').slice(0, 120) : null; }).catch(e => 'ERR ' + e.message);
 const banTop = await p.evaluate(() => { const b = document.getElementById('xps-ban'); return b ? b.innerText.replace(/\s+/g, ' ').slice(0, 120) : null; });
 console.log('bandeau dans le cadre :', ban, '· bandeau en haut :', banTop);
 if (ban && typeof ban === 'string' && !ban.startsWith('ERR')) { await where.evaluate(() => document.getElementById('xps-ok').click()); await p.waitForTimeout(1500);
  console.log('tâche intégrée :', await where.evaluate(() => JSON.stringify((JSON.parse(localStorage.getItem('plannoXIII.project') || '{}').tasks || []).filter(t => /robot/.test(t.name)).map(t => t.name + ' ' + t.start)))); }
 console.log('erreurs :', E); await b.close(); })();
