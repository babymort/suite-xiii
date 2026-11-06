// Annuler (XUNDO placé avant l'affichage) : l'annulation revient à l'état chargé, pas à un projet vide
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const errs = []; const R = {};
  await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
  for (const a of (process.env.A || 'transporto').split(',')) { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(a + ': ' + e.message));
    await pg.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
    await pg.goto('http://localhost:8765/' + a + '.html?desktop=1'); await pg.waitForTimeout(3000);
    R[a] = await pg.evaluate(async () => { document.querySelectorAll('#xt-root,.modal-ov,#modal-ov').forEach(m => m.remove()); const j0 = JSON.stringify(P); const n = document.getElementById('project-name');
      n.value = (n.value || '') + ' TEST'; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 900));
      const j1 = JSON.stringify(P); const u = document.getElementById('xu-undo'); const dis = u.disabled; u.click(); await new Promise(r => setTimeout(r, 500));
      const j2 = JSON.stringify(P); const strip = s => s.replace(/"(updated|savedAt|lastSave)":[^,}]*,?/g, '');
      return { j0: j0.slice(0, 300), j2: j2.slice(0, 300), changed: j0 !== j1, undoEnabled: !dis, back: strip(j2) === strip(j0), size0: j0.length, size2: j2.length }; });
    await pg.close(); }
  console.log(JSON.stringify(R), 'ERR', errs.join(' | ')); await b.close(); })();
