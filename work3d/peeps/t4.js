const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 700 } });
  await pg.goto('http://localhost:8765/storyboardo.html?desktop=1', { waitUntil: 'load' }); await pg.waitForTimeout(1500);
  const h = await pg.evaluate(async () => {
    await XPEEPS.load(); const D = XPEEPS.data(); let h = '<div style="display:flex;flex-wrap:wrap;background:#fff">';
    D.M.forEach((m, i) => {
      const S = D.P[m[2]], ss = m[3], w = S.j[ss + 'w'], t = S.j[ss + 'h'];
      h += '<div style="width:300px;height:330px;border:1px solid #ddd"><svg viewBox="' + (w[0] - 260) + ' ' + (w[1] - 260) + ' 520 560" width="300" height="320"><defs><clipPath id="c' + i + '"><path clip-rule="evenodd" d="' + S.pc[ss + 'Hd'] + '"/></clipPath></defs><g opacity=".12">' + S.L.map(x => '<path fill-rule="evenodd" fill="' + (x[0] === 0 ? '#fff' : '#000') + '" d="' + x[1] + '"/>').join('') + '</g><g clip-path="url(#c' + i + ')">' + S.L.map(x => '<path fill-rule="evenodd" fill="' + (x[0] === 0 ? '#ffe2a0' : '#000') + '" d="' + x[1] + '"/>').join('') + '</g><circle cx="' + w[0] + '" cy="' + w[1] + '" r="10" fill="red"/><circle cx="' + t[0] + '" cy="' + t[1] + '" r="10" fill="blue"/></svg><div style="font:12px sans-serif">' + m[0] + ' ' + m[2] + ' ' + ss + '</div></div>';
    });
    return h + '</div>';
  });
  await pg.evaluate(h => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff'; d.innerHTML = h; document.body.appendChild(d); }, h);
  await pg.waitForTimeout(400); await pg.screenshot({ path: OUT + '/hands.png' }); await b.close();
})();
