(function () {
  const sheet = d => ({ '!ref': 'A1:B2', __d: d });
  window.XLSX = { version: 'fake', utils: { book_new: () => ({ SheetNames: [], Sheets: {} }), json_to_sheet: sheet, aoa_to_sheet: sheet, table_to_sheet: sheet, sheet_add_aoa: s => s, sheet_add_json: s => s,
      book_append_sheet(wb, ws, n) { n = n || 'Feuille' + (wb.SheetNames.length + 1); wb.SheetNames.push(n); wb.Sheets[n] = ws; }, sheet_to_json: () => [], sheet_to_csv: () => '', encode_cell: c => 'A1', decode_range: () => ({ s: { r: 0, c: 0 }, e: { r: 1, c: 1 } }), encode_range: () => 'A1:B2' },
    writeFile(wb, n) { window.__saved = (window.__saved || []).concat([{ n, k: 'xlsx', s: wb.SheetNames.length }]); }, writeFileXLSX(wb, n) { this.writeFile(wb, n); },
    write: () => new ArrayBuffer(8), read: () => ({ SheetNames: ['F1'], Sheets: { F1: {} } }) };
})();
