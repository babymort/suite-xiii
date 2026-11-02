// Ouvre chaque page du site et relève les erreurs JavaScript (réseau externe bloqué : ignoré)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const R = '/home/claude/suite-xiii/', pages = fs.readdirSync(R).filter(f => f.endsWith('.html')).sort();
  const b = await chromium.launch(); const ctx = await b.newContext({ serviceWorkers: 'block' });
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('http://localhost')) return r.abort(); r.continue(); });
  let bad = 0;
  for (let i = 0; i < pages.length; i += 6) {
    await Promise.all(pages.slice(i, i + 6).map(async f => { const p = await ctx.newPage(), E = [];
      p.on('pageerror', e => { if (!/supabase|Failed to fetch|NetworkError|net::/i.test(e.message)) E.push(e.message.slice(0, 160)); });
      try { await p.goto('http://localhost:8765/' + f + (f === 'index.html' ? '?v=prod' : ''), { timeout: 20000 }); await p.waitForTimeout(3500); } catch (e) { E.push('chargement : ' + e.message.slice(0, 80)); }
      if (E.length) { bad++; console.log('✗ ' + f + ' — ' + E.slice(0, 3).join(' | ')); } await p.close(); }));
  }
  console.log('Pages testées : ' + pages.length + ' · en erreur : ' + bad); await b.close();
})();
