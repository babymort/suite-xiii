// jsPDF de test : enregistre les tracés page par page, puis les dessine sur un canvas (window.__pdfRender) pour vérifier la mise en page
(function () {
  const ctxM = document.createElement('canvas').getContext('2d');
  const FAM = { helvetica: 'Helvetica, Arial, sans-serif', times: '"Times New Roman", Times, serif', courier: '"Courier New", monospace' };
  const col = a => { if (a.length >= 3 && typeof a[0] === 'number') return 'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')'; if (typeof a[0] === 'string') return a[0]; if (typeof a[0] === 'number') { const g = a[0] <= 1 && a.length === 1 && !Number.isInteger(a[0]) ? a[0] * 255 : a[0]; return 'rgb(' + g + ',' + g + ',' + g + ')'; } return '#000'; };
  const FMT = { a3: [297, 420], a4: [210, 297], a5: [148, 210], letter: [215.9, 279.4], legal: [215.9, 355.6] };
  const K = { mm: 72 / 25.4, pt: 1, px: 72 / 96, cm: 72 / 2.54, in: 72 };
  function jsPDF(o, u, f) {
    if (o && typeof o === 'object') { u = o.unit; f = o.format; o = o.orientation; }
    o = String(o || 'p').toLowerCase()[0]; u = u || 'mm'; const k = K[u] || K.mm;
    let wh = Array.isArray(f) ? [f[0] * k / K.mm, f[1] * k / K.mm] : (FMT[String(f || 'a4').toLowerCase()] || FMT.a4).slice();
    if (Array.isArray(f)) wh = [f[0], f[1]].map(v => v * k / K.mm); // mm
    const pw = wh.map(v => v * K.mm / k); // en unités
    const d = this; const S = { fs: 16, font: 'helvetica', style: 'normal', tc: '#000', fc: '#000', dc: '#000', lw: .2 * K.mm / k, alpha: 1, lhf: 1.15, dash: null };
    const pages = []; let cur = 0;
    const mkPage = (W, H) => ({ W, H, ops: [] }); let defWH = (o === 'l' ? [Math.max(...pw), Math.min(...pw)] : [Math.min(...pw), Math.max(...pw)]);
    if (Array.isArray(f) && o !== 'l' && o !== 'p') defWH = pw;
    pages.push(mkPage(...defWH));
    const st = () => ({ ...S }); const op = (t, a) => pages[cur].ops.push({ t, a, s: st(), stamp: !!d.__xcStamping });
    const fontCss = () => (/bold/.test(S.style) ? 'bold ' : '') + (/italic|oblique/.test(S.style) ? 'italic ' : '') + (S.fs * 96 / 72) + 'px ' + (FAM[S.font] || FAM.helvetica);
    const tw = s => { ctxM.font = fontCss(); return ctxM.measureText(String(s)).width * 72 / 96 / k; };
    Object.assign(d, {
      __pages: pages, __k: k,
      setFont(n, s, w) { if (n) S.font = String(n).toLowerCase(); if (s != null) S.style = String(s).toLowerCase(); if (w === 700 || w === 'bold') S.style = 'bold'; return d; },
      setFontSize(n) { S.fs = +n; return d; }, getFontSize: () => S.fs, setFontStyle(s) { S.style = s; return d; }, setFontType(s) { S.style = s; return d; },
      getFont: () => ({ fontName: S.font, fontStyle: S.style }), getFontList: () => ({ helvetica: ['normal', 'bold', 'italic', 'bolditalic'], times: ['normal', 'bold', 'italic', 'bolditalic'], courier: ['normal', 'bold'] }),
      setTextColor(...a) { S.tc = col(a); return d; }, setFillColor(...a) { S.fc = col(a); return d; }, setDrawColor(...a) { S.dc = col(a); return d; },
      setLineWidth(w) { S.lw = w; return d; }, setLineDashPattern(p) { S.dash = p && p.length ? p : null; return d; }, setLineCap() { return d; }, setLineJoin() { return d; }, setCharSpace() { return d; },
      getLineHeightFactor: () => S.lhf, getTextColor: () => S.tc, getFillColor: () => S.fc, getDrawColor: () => S.dc, setLineHeightFactor(v) { S.lhf = v; return d; },
      getTextWidth: s => tw(s), getStringUnitWidth: s => tw(s) / (S.fs / k), getTextDimensions: s => ({ w: tw(s), h: S.fs / k }),
      splitTextToSize(t, w) { const out = []; String(t == null ? '' : t).split('\n').forEach(par => { let line = ''; par.split(/(\s+)/).forEach(tok => { const tst = line + tok; if (tw(tst.trim()) > w && line.trim()) { out.push(line.trim()); line = tok.trimStart(); while (tw(line) > w && line.length > 1) { let i = line.length; while (i > 1 && tw(line.slice(0, i)) > w) i--; out.push(line.slice(0, i)); line = line.slice(i); } } else line = tst; }); out.push(line.trim()); }); return out; },
      text(t, x, y, opt) { if (typeof t === 'number' && typeof x === 'string') { const z = t; t = y; y = x; x = z; } opt = opt || {}; let L = Array.isArray(t) ? t.map(String) : String(t == null ? '' : t).split('\n'); if (opt.maxWidth) L = [].concat(...L.map(s => d.splitTextToSize(s, opt.maxWidth))); op('text', { L, x, y, o: opt }); return d; },
      textWithLink(t, x, y, o) { return d.text(t, x, y, o); }, link() { return d; },
      rect(x, y, w, h, s) { op('rect', { x, y, w, h, s }); return d; }, roundedRect(x, y, w, h, rx, ry, s) { op('rect', { x, y, w, h, s, r: rx }); return d; },
      line(x1, y1, x2, y2) { op('line', { x1, y1, x2, y2 }); return d; }, lines(L, x, y, sc, s, c) { let px = x, py = y; const pts = [[px, py]]; (L || []).forEach(p => { px += p[p.length - 2]; py += p[p.length - 1]; pts.push([px, py]); }); op('poly', { pts, s, c }); return d; },
      circle(x, y, r, s) { op('ell', { x, y, rx: r, ry: r, s }); return d; }, ellipse(x, y, rx, ry, s) { op('ell', { x, y, rx, ry, s }); return d; },
      triangle(a, b, c2, e, f2, g, s) { op('poly', { pts: [[a, b], [c2, e], [f2, g]], s, c: true }); return d; },
      addImage(img, fmt, x, y, w, h) { if (img && typeof img === 'object' && img.x != null && !(img instanceof Element)) { ({ x, y, width: w, height: h } = img); img = img.imageData; } let src = img; if (img && img.tagName === 'CANVAS') try { src = img.toDataURL(); } catch (e) { } else if (img && img.tagName === 'IMG') src = img.src; op('img', { src, x, y, w, h }); return d; },
      addPage(f2, o2) { let W = defWH[0], H = defWH[1]; if (Array.isArray(f2)) { W = f2[0]; H = f2[1]; } else if (f2 && FMT[String(f2).toLowerCase()]) { const z = FMT[String(f2).toLowerCase()].map(v => v * K.mm / k); W = Math.min(...z); H = Math.max(...z); } if (String(o2 || '')[0] === 'l') { const a = Math.max(W, H), b = Math.min(W, H); W = a; H = b; } else if (String(o2 || '')[0] === 'p') { const a = Math.min(W, H), b = Math.max(W, H); W = a; H = b; } pages.push(mkPage(W, H)); cur = pages.length - 1; return d; },
      insertPage(n) { d.addPage(); const p = pages.pop(); pages.splice(Math.max(0, n - 1), 0, p); cur = Math.max(0, n - 1); return d; },
      deletePage(n) { pages.splice(n - 1, 1); cur = Math.min(cur, pages.length - 1); return d; }, movePage() { return d; },
      setPage(n) { cur = Math.max(0, Math.min(pages.length - 1, n - 1)); return d; }, getNumberOfPages: () => pages.length,
      saveGraphicsState() { return d; }, restoreGraphicsState() { S.alpha = 1; return d; }, GState: function (o) { return o; }, setGState(g) { if (g && g.opacity != null) S.alpha = g.opacity; return d; },
      setProperties() { return d; }, setDocumentProperties() { return d; }, setCreationDate() { return d; }, addFont() { return d; }, addFileToVFS() { return d; }, setR2L() { return d; }, clip() { return d; }, discardPath() { return d; }, moveTo() { return d; }, lineTo() { return d; }, stroke() { return d; }, fill() { return d; }, close() { return d; },
      save(n) { (window.__pdfDocs = window.__pdfDocs || []).push({ n: n || 'document.pdf', pages, k }); window.__saved = (window.__saved || []).concat([{ n, k: 'pdf' }]); return d; },
      output(t) { (window.__pdfDocs = window.__pdfDocs || []).push({ n: 'output:' + t, pages, k }); const b = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' }); if (/url|uri/.test(t || '')) return /string/.test(t || '') ? 'data:application/pdf;base64,JVBERi0xLjQ=' : URL.createObjectURL(b); if (t === 'arraybuffer') return new ArrayBuffer(8); return b; },
      internal: { scaleFactor: k, pageSize: { getWidth: () => pages[cur].W, getHeight: () => pages[cur].H, get width() { return pages[cur].W; }, get height() { return pages[cur].H; } }, getNumberOfPages: () => pages.length, getCurrentPageInfo: () => ({ pageNumber: cur + 1 }), getFont: () => ({ fontName: S.font, fontStyle: S.style }), events: { subscribe() { }, publish() { } }, write() { }, getEncryptor: () => s => s },
      getCurrentPageInfo: () => ({ pageNumber: cur + 1 })
    });
    const P = new Proxy(d, { get(t, kk) { if (kk in t) return t[kk]; if (typeof kk === 'symbol' || kk === 'then' || kk.startsWith('__')) return undefined; (window.__pdfMissing = window.__pdfMissing || {})[kk] = 1; return function () { return P; }; } });
    (jsPDF.API.events || []).forEach(e => { try { if (e[0] === 'initialized') e[1].call(P); } catch (x) { console.warn('init ev', x); } });
    return P;
  }
  jsPDF.API = { events: [] }; jsPDF.version = '2.5.1-test'; window.jspdf = { jsPDF }; window.jsPDF = jsPDF;
  // rendu + relevé des boîtes
  window.__pdfRender = async function (di, scale) {
    const D = window.__pdfDocs[di]; const out = []; scale = scale || 4; // px par mm
    const load = src => new Promise(r => { if (!src || typeof src !== 'string') return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
    for (const pg of D.pages) {
      const k = D.k || 72 / 25.4;
      const cv = document.createElement('canvas'); const sc = 900 / Math.max(pg.W, pg.H); cv.width = Math.round(pg.W * sc); cv.height = Math.round(pg.H * sc); const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.scale(sc, sc);
      const boxes = [];
      for (const o of pg.ops) { const s = o.s, a = o.a; x.globalAlpha = s.alpha; x.lineWidth = s.lw; x.strokeStyle = s.dc; x.fillStyle = s.fc; x.setLineDash(s.dash || []);
        const fs = (sty) => { if (/F/i.test(sty || '')) x.fill(); if (!sty || /D|S/i.test(sty) || sty === null) x.stroke(); };
        if (o.t === 'rect') { x.beginPath(); if (a.r && x.roundRect) x.roundRect(a.x, a.y, a.w, a.h, a.r); else x.rect(a.x, a.y, a.w, a.h); fs(a.s); }
        else if (o.t === 'line') { x.beginPath(); x.moveTo(a.x1, a.y1); x.lineTo(a.x2, a.y2); x.stroke(); }
        else if (o.t === 'ell') { x.beginPath(); x.ellipse(a.x, a.y, Math.abs(a.rx), Math.abs(a.ry), 0, 0, 7); fs(a.s); }
        else if (o.t === 'poly') { x.beginPath(); a.pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); if (a.c) x.closePath(); fs(a.s); }
        else if (o.t === 'img') { const im = await load(a.src); if (im) x.drawImage(im, a.x, a.y, a.w, a.h); else { x.strokeStyle = 'red'; x.strokeRect(a.x, a.y, a.w, a.h); } boxes.push({ k: 'img', x: a.x, y: a.y, w: a.w, h: a.h, stamp: o.stamp }); }
        else if (o.t === 'text') { const fsz = s.fs / k; x.font = (/bold/.test(s.style) ? 'bold ' : '') + (/italic/.test(s.style) ? 'italic ' : '') + fsz + 'px ' + (FAM[s.font] || FAM.helvetica); x.fillStyle = s.tc; const al = a.o.align || 'left'; x.textAlign = al === 'justify' ? 'left' : al; const bl = a.o.baseline || 'alphabetic'; x.textBaseline = bl === 'hanging' ? 'top' : bl;
          const lh = fsz * (a.o.lineHeightFactor || s.lhf);
          a.L.forEach((ln, i) => { const yy = a.y + i * lh; if (a.o.angle) { x.save(); x.translate(a.x, yy); x.rotate(-a.o.angle * Math.PI / 180); x.fillText(ln, 0, 0); x.restore(); } else { x.fillText(ln, a.x, yy); if (ln.trim()) { const w = x.measureText(ln).width, x0 = al === 'center' ? a.x - w / 2 : al === 'right' ? a.x - w : a.x; const y0 = bl === 'top' || bl === 'hanging' ? yy : bl === 'middle' ? yy - fsz / 2 : bl === 'bottom' ? yy - fsz : yy - fsz * .72; boxes.push({ k: 'text', t: ln.slice(0, 40), x: x0, y: y0, w, h: fsz * .92, stamp: o.stamp, a: s.alpha }); } } }); }
      }
      out.push({ png: cv.toDataURL('image/png'), W: pg.W, H: pg.H, boxes });
    }
    return out;
  };
})();
