const { chromium } = require('playwright'); const fs = require('fs');
const PL = fs.readFileSync('/opt/npm-tools/node_modules/pdf-lib/dist/pdf-lib.min.js', 'utf8'), ANY = fs.readFileSync('/tmp/zz/fake/any.js', 'utf8');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext();
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://localhost')) return r.continue(); if (/pdf-lib/.test(u)) return r.fulfill({ status: 200, contentType: 'application/javascript', body: PL }); if (/fontkit/.test(u)) return r.abort(); if (/\.js/.test(u)) return r.fulfill({ status: 200, contentType: 'application/javascript', body: ANY }); return r.abort(); });
  const pg = await ctx.newPage(); const E = []; pg.on('pageerror', e => E.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') E.push(m.text().slice(0, 200)); });
  await pg.goto('http://localhost:8765/dossier.html?desktop=1'); await pg.waitForTimeout(3000);
  await pg.evaluate(() => { const cv = document.createElement('canvas'); cv.width = 300; cv.height = 120; const x = cv.getContext('2d'); x.fillStyle = '#1d4ed8'; x.fillRect(0, 0, 300, 120); x.fillStyle = '#fff'; x.font = 'bold 56px Arial'; x.fillText('LOGO', 70, 82);
    localStorage.setItem('xiii.charte', JSON.stringify({ on: true, color: '#c2410c', logo: cv.toDataURL('image/png'), lw: 300, lh: 120, useLogo: true, logoPos: 'both', foot: true, footLeft: 'custom', footCustom: 'Yes We Do Productions — 01 23 45 67 89', mention: 'CONFIDENTIEL', off: {} })); });
  await pg.reload(); await pg.waitForTimeout(3500);
  const r = await pg.evaluate(async () => { try { P.chapters[0].sections[0].text = '<p>' + 'Texte de présentation. '.repeat(80) + '</p>'; const out = await buildDossierPdf(P, () => { }); const bytes = out && out.bytes ? out.bytes : out; const u8 = bytes instanceof Uint8Array ? bytes : bytes && bytes.buffer ? new Uint8Array(bytes.buffer) : null; if (!u8) return 'type ' + typeof out + ' ' + Object.keys(out || {}); let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); } catch (e) { return 'ERR ' + e.message; } });
  if (/^ERR|^type/.test(r)) console.log(r, E.slice(0, 5)); else { fs.writeFileSync('/tmp/zz/dos.pdf', Buffer.from(r, 'base64')); console.log('ok', E.slice(0, 3)); }
  await b.close(); })();
