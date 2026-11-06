// faux jsPDF minimal pour les tests (texte noté, save / output)
(function () {
  function jsPDF() { const d = this; d.__texts = []; d.text = function (t, x, y) { (Array.isArray(t) ? t : [t]).forEach(s => d.__texts.push(s)); return d; };
    d.splitTextToSize = function (t, w) { const out = []; let cur = ''; String(t).split(' ').forEach(wd => { if ((cur + ' ' + wd).length > 30 && cur) { out.push(cur); cur = wd; } else cur = cur ? cur + ' ' + wd : wd; }); if (cur) out.push(cur); return out; };
    d.getTextWidth = t => String(t).length * 2; d.setFontSize = () => d; d.setFont = () => d; d.setTextColor = () => d; d.addPage = () => d; d.rect = () => d; d.line = () => d; d.setDrawColor = () => d; d.setFillColor = () => d; d.getNumberOfPages = () => 1; d.setPage = () => d; d.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297, width: 210, height: 297 }, getNumberOfPages: () => 1 };
    d.save = function (n) { window.__saved = (window.__saved || []).concat([{ n, texts: d.__texts.slice() }]); return d; };
    d.output = function (t) { if (t === 'bloburl') return URL.createObjectURL(new Blob(['%PDF-fake'], { type: 'application/pdf' })); return new Blob(['%PDF-fake']); };
    (jsPDF.API.events || []).forEach(e => { if (e[0] === 'initialized') e[1].call(d); }); }
  jsPDF.API = { events: [] }; window.jspdf = { jsPDF };
})();
