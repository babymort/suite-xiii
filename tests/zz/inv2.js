// Phase B2 — inventaire de la seconde barre (#toolbar) de chaque outil, bouton par bouton, avec le secteur proposé
// node inv2.js <sortie.json> outil…   (serveur :8766)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1920, height: 1000 } }); await c.route(/^(?!http:\/\/localhost)/, r => r.abort());
 await c.addInitScript(() => { localStorage.setItem('xiii.tips.off', 'true'); });
 const Q = process.argv.slice(3), R = {};
 await Promise.all([0, 1, 2].map(async () => { while (Q.length) { const pg = Q.shift(); const p = await c.newPage(); await p.addInitScript(a => localStorage.setItem('xiii.tour2.' + a + '.hide', '1'), pg);
  try { await p.goto('http://localhost:8766/' + pg + '.html?desktop=1', { timeout: 40000 }); await p.waitForTimeout(2500); await p.evaluate(async a => { try { await XMODELS.apply(a, 'fiction', false); } catch (e) { } }, pg); await p.reload(); await p.waitForTimeout(4500);
   R[pg] = await p.evaluate(() => { const tb = document.getElementById('toolbar'); if (!tb) return null; const out = [];
    const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 2 && s.display !== 'none' && s.visibility !== 'hidden'; };
    let grp = 0, last = null;
    [...tb.querySelectorAll('button,select,input:not([type=hidden]),.divider,.ws-stats,[id$=stats],.tb-label,#xu-st,.xs-saved')].forEach(e => {
     if (!vis(e)) return; if (e.closest('button') && e.tagName !== 'BUTTON') return; if (e.matches('.divider')) { grp++; return; }
     const g = e.closest('.btn-group,.tool-group,.view-group,.tb-group'); if (g !== last) { if (g) grp++; last = g; }
     const ic = ((e.querySelector && e.querySelector('.btn-icon')) || e).textContent.trim().slice(0, 4), lab = ((e.querySelector && e.querySelector('.btn-label')) || {}).textContent || '';
     const t = e.tagName === 'SELECT' ? 'liste' : e.tagName === 'INPUT' ? 'champ' : e.tagName === 'BUTTON' ? 'bouton' : 'texte';
     out.push({ g: grp, t, ic: t === 'liste' ? '▾' : t === 'champ' ? '✎' : ic, lab: (lab || (t === 'liste' ? (e.options[e.selectedIndex] || {}).text : t === 'champ' ? (e.placeholder || e.value || '') : t === 'texte' ? e.textContent : '')).trim().replace(/\s+/g, ' ').slice(0, 50), ti: (e.title || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 140), id: e.id || '', on: e.classList.contains('btn-active') || e.classList.contains('on'), moved: !!e.closest('#xtop-moved'), dv: e.dataset && e.dataset.view || '' }); });
    return out; }); } catch (e) { R[pg] = 'ERR ' + e.message.slice(0, 80); } await p.close(); } }));
 fs.writeFileSync(process.argv[2], JSON.stringify(R)); await b.close(); })();
