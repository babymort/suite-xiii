(function () {
  function jsPDF() { const d = this; d.__texts = [];
    const base = { text(t) { (Array.isArray(t) ? t : [t]).forEach(s => d.__texts.push(String(s))); return d; },
      splitTextToSize(t, w) { const out = []; let cur = ''; String(t == null ? '' : t).split(/\s+/).forEach(wd => { if ((cur + ' ' + wd).length > Math.max(10, (w || 100) / 2) && cur) { out.push(cur); cur = wd; } else cur = cur ? cur + ' ' + wd : wd; }); if (cur) out.push(cur); return out.length ? out : ['']; },
      getTextWidth: t => String(t == null ? '' : t).length * 2, getStringUnitWidth: t => String(t).length * .5, getFontSize: () => 10, getLineHeightFactor: () => 1.15, getNumberOfPages: () => d.__p || 1, addPage() { d.__p = (d.__p || 1) + 1; return d; },
      getFontList: () => ({ helvetica: ['normal', 'bold'] }), getTextDimensions: t => ({ w: String(t).length * 2, h: 4 }), getCurrentPageInfo: () => ({ pageNumber: 1 }),
      save(n) { window.__saved = (window.__saved || []).concat([{ n, k: 'pdf', t: d.__texts.length }]); return d; },
      output(t) { const b = new Blob(['%PDF-1.4 fake'], { type: 'application/pdf' }); window.__saved = (window.__saved || []).concat([{ n: 'output:' + t, k: 'pdf', t: d.__texts.length }]); if (t === 'bloburl' || t === 'bloburi') return URL.createObjectURL(b); if (t === 'datauristring' || t === 'dataurlstring' || t === 'datauri') return 'data:application/pdf;base64,JVBERi0xLjQ='; if (t === 'arraybuffer') return new ArrayBuffer(8); return b; },
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297, width: 210, height: 297 }, getNumberOfPages: () => d.__p || 1, scaleFactor: 2.83, getFont: () => ({ fontName: 'helvetica' }), events: { subscribe() { } } } };
    Object.assign(d, base);
    const P = new Proxy(d, { get(t, k) { if (k in t) return t[k]; if (typeof k === 'symbol') return undefined; return function () { return P; }; } });
    (jsPDF.API.events || []).forEach(e => { try { if (e[0] === 'initialized') e[1].call(P); } catch (x) { } }); return P; }
  jsPDF.API = { events: [] }; jsPDF.version = 'fake'; window.jspdf = { jsPDF }; window.jsPDF = jsPDF;
})();
