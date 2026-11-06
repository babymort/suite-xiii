(function () {
  window.html2canvas = async () => { const c = document.createElement('canvas'); c.width = 20; c.height = 20; return c; };
  window.qrcode = function () { return { addData() { }, make() { }, getModuleCount: () => 21, isDark: () => false, createDataURL: () => 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', createSvgTag: () => '<svg xmlns="http://www.w3.org/2000/svg"></svg>', createImgTag: () => '<img alt="">', renderTo2dContext() { } }; };
  window.jsQR = () => null; window.LZString = { compressToEncodedURIComponent: s => encodeURIComponent(s), decompressFromEncodedURIComponent: s => decodeURIComponent(s), compressToUTF16: s => s, decompressFromUTF16: s => s, compressToBase64: s => btoa(unescape(encodeURIComponent(s))), decompressFromBase64: s => decodeURIComponent(escape(atob(s))) };
})();
