// Stockage du navigateur plein : l'outil prévient-il au lieu de planter ou de perdre en silence ?
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const R = {};
  for (const a of process.argv.slice(2)) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
    const pg = await ctx.newPage(); const E = []; pg.on('pageerror', e => E.push(e.message.slice(0, 120))); pg.on('dialog', d => { E.push('dialog: ' + d.message().slice(0, 100)); d.dismiss(); });
    await pg.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); }, a);
    await pg.goto('http://localhost:8765/' + a + '.html?desktop=1'); await pg.waitForTimeout(2500);
    R[a] = await pg.evaluate(async () => { document.querySelectorAll('#xt-root').forEach(m => m.remove());
      // remplit le stockage
      let i = 0; const big = 'x'.repeat(200000); try { while (i < 200) { localStorage.setItem('__fill' + i, big); i++; } } catch (e) { } let j = 0; const sm = 'y'.repeat(2000); try { while (j < 3000) { localStorage.setItem('__f2_' + j, sm); j++; } } catch (e) { }
      const seen = new Set(); const mo = new MutationObserver(m => m.forEach(x => x.addedNodes.forEach(n => { if (n.nodeType === 1 && /stockage|plein|quota|mémoire|espace/i.test(n.textContent || '')) seen.add((n.textContent || '').trim().slice(0, 120)); }))); mo.observe(document.body, { childList: true, subtree: true });
      const n = document.getElementById('project-name'); if (n) { n.value += ' X'.repeat(50); n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); }
      try { if (typeof saveProject === 'function') saveProject(true); } catch (e) { seen.add('throw ' + e.message.slice(0, 80)); }
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }));
      await new Promise(r => setTimeout(r, 2500)); const st = document.getElementById('save-state'); return { avert: [...seen].slice(0, 3), etat: st ? st.textContent.trim() : '' }; });
    R[a].E = E; await ctx.close(); }
  console.log(JSON.stringify(R, null, 1)); await b.close(); })();
