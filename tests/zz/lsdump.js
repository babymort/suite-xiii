const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const ctx = await chromium.launchPersistentContext(process.argv[2]); const p = await ctx.newPage(); await p.goto('http://localhost:8765/blank.html');
 fs.writeFileSync(process.argv[3], JSON.stringify(await p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; }))); await ctx.close(); })();
