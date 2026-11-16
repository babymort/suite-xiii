// Qu'est-ce qui modifie la page pendant l'écran de chargement (empêche le « calme » de 200 ms) ?
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const pg = process.argv[2] || 'plano';
 const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
 await ctx.route('**/*', r => r.request().url().startsWith('http://localhost') ? r.continue() : r.abort());
 await ctx.addInitScript(a => { localStorage.setItem('xiii.tips.off', 'true'); localStorage.setItem('xiii.tour2.' + a + '.hide', '1'); window.__mu = [];
  const nm = n => !n ? '?' : n.nodeType !== 1 ? '#text<' + nm(n.parentNode) : (n.id ? '#' + n.id : n.tagName.toLowerCase() + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/)[0] : ''));
  const go = () => new MutationObserver(M => { const t = Math.round(performance.now()); if (!document.documentElement.classList.contains('xb0')) return; M.forEach(m => window.__mu.push([t, m.type === 'attributes' ? 'attr ' + m.attributeName + ' ' + (m.oldValue || '') + ' → ' + (m.target.getAttribute(m.attributeName) || '') : m.type, nm(m.target)])); }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'], attributeOldValue: true });
  if (document.documentElement) go(); else document.addEventListener('readystatechange', go, { once: true }); }, pg);
 const p = await ctx.newPage(); await p.goto('http://localhost:8765/' + pg + '.html?desktop=1'); await p.waitForTimeout(3500);
 const M = await p.evaluate(() => window.__mu.filter(x => x[0] > 500));
 const by = {}; M.forEach(([t, k, n]) => { const key = k + ' ' + n; by[key] = by[key] || []; by[key].push(t); });
 Object.entries(by).sort((a, c) => c[1].length - a[1].length).slice(0, 25).forEach(([k, T]) => console.log(String(T.length).padStart(4), k.padEnd(48), T.slice(0, 8).join(',')));
 await b.close(); })();
