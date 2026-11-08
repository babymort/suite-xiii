// SUITE XIII — code commun partagé par tous les outils (phase C, saison 6). Source : xiii-src/core/core-02.js
// =====================================================================
//  SUITE XIII — XCHARTE : charte graphique commune à tous les PDF du projet
//  Couleurs, police, logo, en-tête, pied de page, mention, numérotation, date, filigrane, titres des rapports…
//  • PDF jsPDF (SYNO, PLANO, CONDUCO, CALL SHEETO, DECOUP…) : habillage ajouté à chaque page
//  • rapports « Imprimer / PDF » (DEVISO, PACKINGO, BACKUPO, MOODO, REPERO…) : marges de page, police, titres, filigrane
//  • DOSSIER : couleur d'accent reprise quand le dossier n'a pas la sienne
//  Réglage commun (clé « xiii.charte »), modifiable dans 🎬 Projet XIII → 🎨 Charte graphique, ou ⚙️ de chaque outil.
// =====================================================================
const XCHARTE = (() => {
    const KEY = 'xiii.charte';
    const APPS = [['planno', 'PLANNO'], ['casto', 'CASTO'], ['posto', 'POSTO'], ['sono', 'SONO'], ['lumo', 'LUMO'], ['runo', 'RUNO'], ['transporto', 'TRANSPORTO'], ['soustitro', 'SOUSTITRO'], ['encodo', 'ENCODO'], ['syno', 'SYNO'], ['plano', 'PLANO'], ['conduco', 'CONDUCO'], ['callsheeto', 'CALL SHEETO'], ['decoup', 'DECOUP'], ['deviso', 'DEVISO'], ['packingo', 'PACKINGO'], ['backupo', 'BACKUPO'], ['moodo', 'MOODO'], ['repero', 'REPERO'], ['scripto', 'SCRIPTO'], ['storyboardo', 'STORYBOARDO'], ['cadro', 'CADRO'], ['ressourco', 'RESSOURCO'], ['dossier', 'DOSSIER']];
    const DEF = { on: true, color: '#b8651f', color2: '#555555', font: 'helvetica', size: 7.5, title: '', sub: '', mention: '', logo: '', lw: 0, lh: 0, useLogo: true, logoPos: 'foot', logoSize: 'm',
        head: 'band', headH: 'm', headText: 'none', headCustom: '', headAlign: 'right', foot: true, footLine: true, footLeft: 'title-sub', footCustom: '', num: 'n/t', date: false,
        water: '', waterOp: 0.08, waterAngle: 'diag', waterSize: 'm', waterTone: 'main', version: '', cover: false, coverTheme: 'dark', coverInfo: true, printCover: false, printFont: '', printTitles: true, off: { ressourco: 1 } };
    const PRESETS = [['Sobre', { color: '#333333', color2: '#666666', font: 'helvetica', head: 'line', headH: 's', footLine: true }], ['Production', { color: '#b8651f', color2: '#555555', font: 'helvetica', head: 'band', headH: 'm' }], ['Cinéma', { color: '#8b1e1e', color2: '#444444', font: 'times', head: 'line', headH: 'm', headText: 'title', printFont: 'serif' }], ['Broadcast', { color: '#0d47a1', color2: '#37474f', font: 'helvetica', head: 'band', headH: 'l', headText: 'title-sub' }], ['Technique', { color: '#2e7d32', color2: '#455a64', font: 'courier', head: 'band', headH: 's', printFont: 'mono' }]];
    const FONTS = [['helvetica', 'Sans (Helvetica)', 'Helvetica,Arial,sans-serif'], ['times', 'Serif (Times)', '"Times New Roman",Times,serif'], ['courier', 'Machine à écrire (Courier)', '"Courier New",Courier,monospace']];
    const HH = { s: 1.5, m: 3.2, l: 6 }, LS = { s: 10, m: 16, l: 24 };
    let APP = '';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fiche = () => { try { const s = JSON.parse(localStorage.getItem('xiii.projets') || 'null'); return s && s.list ? s.list.find(f => f && f.id === s.active) || null : null; } catch (e) { return null; } };
    function raw() { let o = {}; try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { } if (o.head === true) o.head = 'band'; if (o.head === false) o.head = 'none'; if (o.num === true) o.num = 'n/t'; if (o.num === false) o.num = 'none'; return Object.assign({}, DEF, o); }
    // 🎨 palette d'une image (kit de marque Canva exporté, logo, affiche) : couleurs dominantes saturées, puis une couleur sombre lisible pour le texte
    function palette(im) {
        const W = 120, H = Math.max(1, Math.round(W * im.height / im.width)), cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, W, H);
        const d = x.getImageData(0, 0, W, H).data, B = {}, hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0, lum = (r * 299 + g * 587 + b * 114) / 1000; const k = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5); const o = B[k] || (B[k] = { n: 0, r: 0, g: 0, b: 0, sat: 0, lum: 0 }); o.n++; o.r += r; o.g += g; o.b += b; o.sat += sat; o.lum += lum; }
        const L = Object.values(B).map(o => ({ n: o.n, r: o.r / o.n, g: o.g / o.n, b: o.b / o.n, sat: o.sat / o.n, lum: o.lum / o.n }));
        const vivid = L.filter(o => o.sat > .28 && o.lum > 35 && o.lum < 235).sort((a, b) => b.n * (0.5 + b.sat) - a.n * (0.5 + a.sat));
        const out = []; vivid.forEach(o => { if (out.length < 1 || (out.length < 2 && Math.abs(o.r - out[0].r) + Math.abs(o.g - out[0].g) + Math.abs(o.b - out[0].b) > 120)) out.push(o); });
        const dark = L.filter(o => o.lum < 90).sort((a, b) => b.n - a.n)[0];
        const res = out.map(o => hex(o.r, o.g, o.b)); if (res.length < 2 && dark) res.push(hex(dark.r, dark.g, dark.b)); return res.slice(0, 2);
    }
    function resolve(c) { c = Object.assign({}, DEF, c); const f = fiche() || {}; c.T = c.title || f.title || ''; c.S = c.sub || [f.production, f.client].filter(Boolean).join(' · '); c.L = c.useLogo ? (c.logo || (typeof f.logo === 'string' && /^data:image\//.test(f.logo) ? f.logo : '')) : ''; return c; }
    const get = () => resolve(raw());
    const active = app => { const c = get(); return c.on && !(c.off || {})[app || APP] ? c : null; };
    async function save(c) { const o = {}; Object.keys(DEF).forEach(k => { o[k] = c[k] !== undefined ? c[k] : DEF[k]; }); const L = resolve(o).L; const [w, h] = await imgSize(L); o.lw = w; o.lh = h; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { alert('Stockage plein : logo trop lourd ?'); } applyPrint(); return o; }
    const rgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || '') || [0, '555555']; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    function imgSize(src) { return new Promise(r => { if (!src || !/^data:image\//.test(src)) return r([0, 0]); const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.onerror = () => r([0, 0]); i.src = src; }); }
    const leftTxt = c => c.footLeft === 'none' ? '' : c.footLeft === 'custom' ? c.footCustom : c.footLeft === 'title' ? c.T : c.footLeft === 'sub' ? c.S : [c.T, c.S].filter(Boolean).join(' — ');
    const headTxt = c => c.headText === 'title' ? c.T : c.headText === 'title-sub' ? [c.T, c.S].filter(Boolean).join(' — ') : c.headText === 'custom' ? c.headCustom : c.headText === 'mention' ? c.mention : '';
    const numTxt = (c, i, n) => c.num === 'n/t' ? i + ' / ' + n : c.num === 'page' ? 'Page ' + i + ' sur ' + n : c.num === 'n' ? String(i) : '';
    const today = () => new Date().toLocaleDateString('fr-FR');
    // ---------- jsPDF ----------
    function stamp(doc) {
        const c = active(); if (!c || Object.prototype.hasOwnProperty.call(doc, '__xcDone')) return; doc.__xcDone = 1;
        try {
            const k = doc.internal.scaleFactor, P = v => v / k, n = doc.getNumberOfPages(), cur = doc.internal.getCurrentPageInfo ? doc.internal.getCurrentPageInfo().pageNumber : n, [r, g, b] = rgb(c.color), [r2, g2, b2] = rgb(c.color2);
            const ff = doc.getFont ? doc.getFont() : null, fs = doc.getFontSize ? doc.getFontSize() : 10, F = c.font || 'helvetica', sz = +c.size || 7.5;
            let lw = 0, lh = 0; if (c.L && c.lw && c.lh) { lh = LS[c.logoSize] || 16; lw = Math.min(lh * 5, lh * c.lw / c.lh); }
            const fmt = /png/i.test((c.L || '').slice(0, 22)) ? 'PNG' : 'JPEG', hb = HH[c.headH] || 3.2;
            for (let i = 1; i <= n; i++) {
                doc.setPage(i); const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = P(18);
                if (c.water) { try { if (doc.GState && doc.setGState) { doc.saveGraphicsState && doc.saveGraphicsState(); doc.setGState(new doc.GState({ opacity: +c.waterOp || 0.08 })); } doc.setFont(F, 'bold'); doc.setFontSize(Math.min(W, H) * k / Math.max(4, c.water.length) * ({ s: .8, m: 1.3, l: 1.8 }[c.waterSize] || 1.3)); if (c.waterTone === 'grey') doc.setTextColor(120, 120, 120); else doc.setTextColor(r, g, b); doc.text(c.water, W / 2, H / 2, { align: 'center', angle: c.waterAngle === 'horiz' ? 0 : 30, baseline: 'middle' }); if (doc.GState && doc.setGState) { doc.restoreGraphicsState ? doc.restoreGraphicsState() : doc.setGState(new doc.GState({ opacity: 1 })); } } catch (e) { } }
                if (c.head === 'band') { doc.setFillColor(r, g, b); doc.rect(0, 0, W, P(hb), 'F'); }
                else if (c.head === 'line') { doc.setDrawColor(r, g, b); doc.setLineWidth(P(hb / 2.5)); doc.line(M, P(14), W - M, P(14)); }
                const ht = headTxt(c), hy = c.head === 'line' ? P(11) : P(hb + 9);
                if (ht) { doc.setFont(F, 'bold'); doc.setFontSize(sz); doc.setTextColor(r2, g2, b2); doc.text(ht.slice(0, 120), c.headAlign === 'left' ? M : W - M, hy, { align: c.headAlign === 'left' ? 'left' : 'right' }); }
                if (lw && (c.logoPos === 'head' || c.logoPos === 'both')) { try { const x = c.headAlign === 'left' && ht ? W - M - P(lw) : (ht ? M : W - M - P(lw)); doc.addImage(c.L, fmt, x, P(hb + 3), P(lw), P(lh)); } catch (e) { } }
                const TL = window.__xcToolLogo; if (TL && TL.d && c.toolLogo !== false) { try { const th = 9, tw = Math.min(30, th * TL.w / TL.h); doc.addImage(TL.d, 'PNG', W - M - P(tw * 2.835), P(hb + 3), P(tw * 2.835), P(th * 2.835)); } catch (e) { } } // logo de l'outil (logos/OUTIL.png)
                if (c.foot) {
                    const y = H - P(9);
                    if (c.footLine) { doc.setDrawColor(r, g, b); doc.setLineWidth(P(.6)); doc.line(M, H - P(19), W - M, H - P(19)); }
                    doc.setFont(F, 'normal'); doc.setFontSize(sz); doc.setTextColor(r2, g2, b2);
                    let x = M; if (lw && (c.logoPos === 'foot' || c.logoPos === 'both')) { const h2 = Math.min(lh, 12), w2 = h2 * lw / lh; try { doc.addImage(c.L, fmt, x, H - P(6.5 + h2), P(w2), P(h2)); x += P(w2 + 6); } catch (e) { } }
                    const lt = leftTxt(c); if (lt) doc.text(lt.slice(0, 110), x, y);
                    if (c.mention && c.headText !== 'mention') { doc.setFont(F, 'bold'); doc.setTextColor(r, g, b); doc.text(c.mention.slice(0, 60), W / 2, y, { align: 'center' }); doc.setFont(F, 'normal'); doc.setTextColor(r2, g2, b2); }
                    const rt = [c.version, c.date ? today() : '', numTxt(c, i, n)].filter(Boolean).join('   ·   '); if (rt) doc.text(rt, W - M, y, { align: 'right' });
                }
            }
            let curP = cur; if (c.cover && doc.insertPage) { try { coverPage(doc, c); curP = cur + 1; } catch (e) { console.warn('XCHARTE cover', e); } }
            doc.setPage(curP); if (ff) try { doc.setFont(ff.fontName, ff.fontStyle); } catch (e) { } doc.setFontSize(fs); doc.setTextColor(0, 0, 0);
        } catch (e) { console.warn('XCHARTE', e); }
    }
    const coverLines = c => { const f = fiche() || {}, d = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : ''; }; const dt = f.debut && f.fin && f.fin !== f.debut ? 'Du ' + d(f.debut) + ' au ' + d(f.fin) : d(f.debut || f.fin); return c.coverInfo ? [f.realisation ? 'Réalisation : ' + f.realisation : '', f.lieu, dt, f.contact ? 'Contact : ' + f.contact : ''].filter(Boolean) : []; };
    function coverPage(doc, c) {
        doc.insertPage(1); doc.setPage(1);
        const k = doc.internal.scaleFactor, P = v => v / k, W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), F = c.font || 'helvetica', dark = c.coverTheme !== 'light', [r, g, b] = rgb(c.color), M = Math.min(W, H) * 0.09;
        if (dark) { doc.setFillColor(22, 22, 24); doc.rect(0, 0, W, H, 'F'); } { const fc = (fiche() || {}).coverB; if (fc && c.coverImg !== false) { try { doc.addImage(fc, 'JPEG', 0, 0, W, Math.min(W * 0.32, H * 0.26)); } catch (e) { } } } doc.setFillColor(r, g, b); doc.rect(0, 0, P(8), H, 'F');
        let y = H * 0.34;
        if (c.L && c.lw && c.lh) { const lh = Math.min(H * 0.1, P(60)), lw = Math.min(W * 0.4, lh * c.lw / c.lh); try { doc.addImage(c.L, /png/i.test(c.L.slice(0, 22)) ? 'PNG' : 'JPEG', M, y - lh - P(28), lw, lh); } catch (e) { } }
        doc.setFont(F, 'bold'); doc.setTextColor(r, g, b); doc.setFontSize(10); if (c.mention) doc.text(c.mention.toUpperCase(), M, y - P(8), { charSpace: 1.5 });
        doc.setTextColor(dark ? 255 : 25, dark ? 255 : 25, dark ? 255 : 25); doc.setFontSize(Math.min(40, Math.max(22, 900 / Math.max(10, (c.T || '').length)))); const tl = doc.splitTextToSize(c.T || 'Projet', W - 2 * M); doc.text(tl, M, y + P(30)); y += P(30) + tl.length * P(Math.min(40, 30) * 1.15);
        doc.setFont(F, 'normal'); doc.setFontSize(14); doc.setTextColor(dark ? 200 : 80, dark ? 200 : 80, dark ? 200 : 80); if (c.S) { doc.text(c.S, M, y + P(10)); y += P(26); }
        doc.setDrawColor(r, g, b); doc.setLineWidth(P(1.5)); doc.line(M, y + P(8), M + P(60), y + P(8)); y += P(30);
        doc.setFontSize(10.5); doc.setTextColor(dark ? 170 : 90, dark ? 170 : 90, dark ? 170 : 90); coverLines(c).forEach(t => { doc.text(t, M, y); y += P(16); });
        doc.setFontSize(9); doc.text([c.version, today()].filter(Boolean).join('   ·   '), M, H - M * 0.7);
    }
    function printCover(c) {
        let el = document.getElementById('xc-cover'); if (!c || !c.printCover) { if (el) el.remove(); return ''; }
        if (!el) { el = document.createElement('div'); el.id = 'xc-cover'; document.body.insertBefore(el, document.body.firstChild); }
        const dark = c.coverTheme !== 'light', fam = (FONTS.find(f => f[0] === c.font) || FONTS[0])[2];
        const fcv = (fiche() || {}).coverB; el.innerHTML = (fcv && c.coverImg !== false ? '<img class="xcc-img" src="' + fcv + '" alt="">' : '') + '<div class="xcc-bar" style="background:' + c.color + '"></div><div class="xcc-in">' + (c.L ? '<img src="' + c.L + '" style="max-height:22mm;max-width:70mm;object-fit:contain;margin-bottom:10mm">' : '') + (c.mention ? '<div style="color:' + c.color + ';font-weight:700;letter-spacing:.2em;font-size:10pt;margin-bottom:4mm">' + esc(c.mention.toUpperCase()) + '</div>' : '') + '<div style="font-size:34pt;font-weight:800;line-height:1.1">' + esc(c.T || 'Projet') + '</div>' + (c.S ? '<div style="font-size:14pt;opacity:.75;margin-top:3mm">' + esc(c.S) + '</div>' : '') + '<div style="width:22mm;height:1.5pt;background:' + c.color + ';margin:8mm 0"></div>' + coverLines(c).map(t => '<div style="font-size:10.5pt;opacity:.7;margin:1.5mm 0">' + esc(t) + '</div>').join('') + '</div><div class="xcc-ft">' + esc([c.version, today()].filter(Boolean).join('   ·   ')) + '</div>';
        el.style.cssText = 'font-family:' + fam + ';background:' + (dark ? '#161618' : '#fff') + ';color:' + (dark ? '#fff' : '#191919');
        return '#xc-cover{display:none}@media print{#xc-cover{display:block!important;position:relative;height:100vh;page-break-after:always;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}#xc-cover .xcc-bar{position:absolute;left:0;top:0;bottom:0;width:3mm}#xc-cover .xcc-img{position:absolute;left:0;right:0;top:0;width:100%;height:26%;object-fit:cover}#xc-cover .xcc-in{position:absolute;left:18mm;right:15mm;top:30%}#xc-cover .xcc-ft{position:absolute;left:18mm;bottom:12mm;font-size:9pt;opacity:.6}}';
    }
    function patchJsPDF() {
        const J = window.jspdf && window.jspdf.jsPDF; if (J && !window.__jsPDFPristine && !J.__xcWrap) window.__jsPDFPristine = J; if (!J || !J.API || J.API.__xcPatch) return !!J; const A = J.API; A.__xcPatch = 1;
        // jsPDF 2.x : output / save sont créés sur chaque document (pas sur API) → on les enveloppe à la création de chaque document,
        // sinon l'ancienne enveloppe appelait une fonction inexistante (« Cannot read properties of undefined (reading 'apply') »)
        const wrap = doc => {
            if (!doc || doc.__xcW) return; doc.__xcW = 1;
            const out = doc.output; if (typeof out === 'function') doc.output = function () { if (!window.__xcNoWrap) try { stamp(doc); } catch (e) { } return out.apply(doc, arguments); };
            const sv = doc.save; if (typeof sv === 'function') doc.save = function () { const args = arguments; if (window.__xcNoWrap) return sv.apply(doc, args); try { stamp(doc); } catch (e) { } if (preview(doc, () => sv.apply(doc, args), args[0])) return doc; return sv.apply(doc, args); };
        };
        if (typeof A.output === 'function' || typeof A.save === 'function') { // anciennes versions : méthodes partagées
            const out = A.output; if (typeof out === 'function') A.output = function () { try { stamp(this); } catch (e) { } return out.apply(this, arguments); };
            const sv = A.save; if (typeof sv === 'function') A.save = function () { try { stamp(this); } catch (e) { } const doc = this, args = arguments; if (preview(doc, () => sv.apply(doc, args), args[0])) return doc; return sv.apply(this, arguments); };
        } else if (Array.isArray(A.events)) A.events.push(['initialized', function () { wrap(this); }]);
        return true;
    }
    // ---------- 👁 aperçu avant export (tous les PDF jsPDF de la suite) ----------
    const KPV = 'xiii.pdf.preview';
    function preview(doc, dl, name) {
        try { if (localStorage.getItem(KPV) === '0' || window.__xcNoPv) return false; } catch (e) { }
        let url; try { url = doc.output('bloburl'); } catch (e) { return false; }
        const n = doc.getNumberOfPages ? doc.getNumberOfPages() : 0, ov = document.createElement('div'); ov.id = 'xpv-ov';
        ov.innerHTML = '<div class="xpv-box"><div class="xpv-h"><b>👁 Aperçu du PDF</b><span>' + esc(name || 'document.pdf') + (n ? ' · ' + n + ' page' + (n > 1 ? 's' : '') : '') + '</span><label><input type="checkbox" id="xpv-no"> Ne plus afficher l\'aperçu</label><button id="xpv-ch" title="Charte graphique des PDF : en-tête, logo, pied de page, numérotation">🎨 Charte</button><button id="xpv-x">Fermer</button><button id="xpv-dl" class="ok">⬇️ Télécharger</button></div><iframe src="' + url + '#view=FitH" title="Aperçu du PDF"></iframe></div>';
        document.body.appendChild(ov);
        const close = () => { const no = ov.querySelector('#xpv-no').checked; try { if (no) localStorage.setItem(KPV, '0'); } catch (e) { } ov.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); };
        ov.querySelector('#xpv-x').onclick = close; ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
        ov.querySelector('#xpv-dl').onclick = () => { close(); dl(); };
        ov.querySelector('#xpv-ch').onclick = () => { close(); try { panel(); } catch (e) { } };
        if (!document.getElementById('xpv-css')) { const st = document.createElement('style'); st.id = 'xpv-css'; st.textContent = '#xpv-ov{position:fixed;inset:0;z-index:2147483300;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:18px}.xpv-box{width:min(1000px,100%);height:min(92vh,1200px);display:flex;flex-direction:column;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6);font:13.5px "Segoe UI",system-ui,sans-serif}.xpv-h{display:flex;gap:10px;align-items:center;padding:10px 14px;flex-wrap:wrap}.xpv-h span{color:var(--text-dim,#aaa);margin-right:auto}.xpv-h label{display:flex;gap:5px;align-items:center;font-size:12px;color:var(--text-dim,#aaa)}.xpv-h button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:6px 12px;cursor:pointer}.xpv-h button.ok{background:rgba(240,179,120,.35);border-color:#f0b378;font-weight:700}.xpv-box iframe{flex:1;border:0;background:#525659}'; document.head.appendChild(st); }
        return true;
    }
    // ---------- impression ----------
    function applyPrint() {
        let st = document.getElementById('xc-print'), wm = document.getElementById('xc-wm'); const c = active();
        if (!c) { if (st) st.remove(); if (wm) wm.remove(); printCover(null); return; }
        if (!st) { st = document.createElement('style'); st.id = 'xc-print'; document.head.appendChild(st); }
        const q = s => '"' + String(s || '').replace(/\\/g, '').replace(/"/g, '\\"').replace(/[\n\r]/g, ' ') + '"', col = c.color, col2 = c.color2, fam = (FONTS.find(f => f[0] === c.font) || FONTS[0])[2], sz = (+c.size || 7.5) + 'pt';
        const bt = c.footLine ? 'border-top:.6pt solid ' + col + ';' : '', box = 'font:' + sz + ' ' + fam + ';color:' + col2 + ';vertical-align:middle;' + bt;
        const right = [c.version ? q(c.version + '   ·   ') : '', c.date ? q(today() + '   ·   ') : '', c.num === 'n/t' ? 'counter(page) " / " counter(pages)' : c.num === 'page' ? '"Page " counter(page) " sur " counter(pages)' : c.num === 'n' ? 'counter(page)' : ''].filter(Boolean).join(' ') || '""';
        const ht = headTxt(c), hb = (HH[c.headH] || 3.2) + 'pt';
        let page = (c.foot ? 'margin-bottom:14mm;' : '') + (ht || c.head !== 'none' ? 'margin-top:14mm;' : '');
        if (c.foot) page += '@bottom-left{content:' + q(leftTxt(c)) + ';' + box + '}@bottom-center{content:' + q(c.headText === 'mention' ? '' : c.mention) + ';font:bold ' + sz + ' ' + fam + ';color:' + col + ';vertical-align:middle;' + bt + '}@bottom-right{content:' + right + ';' + box + '}';
        const hbox = c.head === 'band' ? 'border-top:' + hb + ' solid ' + col + ';' : c.head === 'line' ? 'border-bottom:' + (parseFloat(hb) / 2.5).toFixed(1) + 'pt solid ' + col + ';' : '';
        if (c.head !== 'none' || ht) page += (c.headAlign === 'left' ? '@top-left{content:' + q(ht) + ';' : '@top-right{content:' + q(ht) + ';') + 'font:bold ' + sz + ' ' + fam + ';color:' + col2 + ';vertical-align:' + (c.head === 'band' ? 'top;padding-top:5mm' : 'bottom;padding-bottom:2mm') + ';' + hbox + '}' + (c.headAlign === 'left' ? '@top-right' : '@top-left') + '{content:"";' + hbox + '}@top-center{content:"";' + hbox + '}';
        const pf = c.printFont === 'serif' ? FONTS[1][2] : c.printFont === 'mono' ? FONTS[2][2] : c.printFont === 'sans' ? FONTS[0][2] : '';
        const cv = printCover(c);
        st.textContent = cv + '@media print{@page{' + page + '}' + (c.printCover ? '@page:first{margin:0;@bottom-left{content:none;border:0}@bottom-center{content:none;border:0}@bottom-right{content:none;border:0}@top-left{content:none;border:0}@top-center{content:none;border:0}@top-right{content:none;border:0}}' : '') + (pf ? 'body,body *:not(svg):not(svg *){font-family:' + pf + '!important}' : '') + (c.printTitles ? 'h1,h2,h3{color:' + col + '!important}h1,h2{border-color:' + col + '!important}' : '') + '#xc-wm{display:flex!important}}#xc-wm{display:none}';
        if (c.water) { if (!wm) { wm = document.createElement('div'); wm.id = 'xc-wm'; document.body.appendChild(wm); } wm.style.cssText = 'position:fixed;inset:0;align-items:center;justify-content:center;pointer-events:none;z-index:2147483000;font:bold ' + Math.min({ s: 9, m: 15, l: 21 }[c.waterSize] || 15, ({ s: 70, m: 105, l: 135 }[c.waterSize] || 105) / Math.max(1, c.water.length)) + 'vw ' + fam + ';color:' + (c.waterTone === 'grey' ? '#777' : col) + ';opacity:' + (+c.waterOp || .08) + ';transform:rotate(' + (c.waterAngle === 'horiz' ? 0 : -30) + 'deg);white-space:nowrap'; wm.textContent = c.water; } else if (wm) wm.remove();
    }
    function patchDossier() {
        if (APP !== 'dossier' || typeof buildDossierPdf !== 'function' || buildDossierPdf.__xc) return;
        const b = buildDossierPdf; const w = async function (p, onStep) { const c = active('dossier'); if (!c) return b.apply(this, arguments); const q = JSON.parse(JSON.stringify(p)); if (!q.design.accent) q.design.accent = c.color; if (!q.design.watermark && c.water) q.design.watermark = c.water; if (c.font === 'times' && q.design.serif === false) q.design.serif = true; if (c.coverTheme === 'light' && (!q.design.theme || q.design.theme === 'xiii')) q.design.theme = 'epure'; else if (c.coverTheme === 'dark' && q.design.theme === 'epure') q.design.theme = 'xiii'; return b.call(this, q, onStep); };
        w.__xc = 1; buildDossierPdf = w;
    }
    // ---------- formulaire (réutilisé par Projet XIII et le panneau ⚙️) ----------
    function form(host, c0, onChange) {
        let c = Object.assign({}, DEF, c0 || raw());
        const sel = (k, opts) => '<select data-x="' + k + '">' + opts.map(o => '<option value="' + esc(o[0]) + '"' + (String(c[k]) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
        const inp = (k, ph, t) => '<input data-x="' + k + '" type="' + (t || 'text') + '" value="' + esc(c[k]) + '" placeholder="' + esc(ph || '') + '">';
        const chk = (k, l) => '<label class="xc-c"><input type="checkbox" data-x="' + k + '"' + (c[k] ? ' checked' : '') + '> ' + l + '</label>';
        const fld = (l, h, cls) => '<label class="xc-f ' + (cls || '') + '"><span>' + l + '</span>' + h + '</label>';
        const f = fiche() || {};
        host.innerHTML = '<div class="xc-wrap"><div class="xc-form">' +
            '<label class="xc-on"><input type="checkbox" data-x="on"' + (c.on ? ' checked' : '') + '> <b>Appliquer la charte à tous les PDF du projet</b></label>' +
            '<div class="xc-presets"><span>Styles prêts :</span>' + PRESETS.map((p, i) => '<button type="button" data-pre="' + i + '" style="--pc:' + p[1].color + '">' + p[0] + '</button>').join('') + '</div>' +
            '<div class="xc-h">Couleurs & police</div><div class="xc-g">' + fld('Couleur principale', '<input type="color" data-x="color" value="' + esc(c.color) + '">') + fld('Couleur du texte', '<input type="color" data-x="color2" value="' + esc(c.color2) + '">') + fld('Police', sel('font', FONTS.map(x => [x[0], x[1]]))) + fld('Taille', sel('size', [[6.5, 'Petite'], [7.5, 'Normale'], [9, 'Grande']])) + '</div>' +
            '<p style="margin:4px 0 10px;font-size:12px;opacity:.85"><button type="button" data-pal style="cursor:pointer">🎨 Couleurs depuis une image</button> <input type="file" accept="image/*" data-palf hidden> exportez votre kit de marque Canva (ou un logo, une affiche) en PNG : les deux couleurs dominantes deviennent la charte.</p>' +
            '<div class="xc-h">Textes</div><div class="xc-g">' + fld('Titre', inp('title', f.title || 'Nom du projet'), 'w2') + fld('Sous-titre / société', inp('sub', [f.production, f.client].filter(Boolean).join(' · ') || 'Société de production'), 'w2') + fld('Mention', inp('mention', 'Confidentiel · Document de travail · V2…'), 'w2') + fld('Texte du filigrane (vide = aucun)', '<input data-x="water" list="xc-wl" value="' + esc(c.water) + '" placeholder="Écrivez librement ou choisissez…"><datalist id="xc-wl">' + ['BROUILLON', 'CONFIDENTIEL', 'DOCUMENT DE TRAVAIL', 'NE PAS DIFFUSER', 'COPIE', 'VERSION PROVISOIRE', 'VALIDÉ', 'ANNULE ET REMPLACE'].map(x => '<option value="' + x + '">').join('') + '</datalist>', 'w2') + fld('Version du document', inp('version', 'V1, V2 — 12/10…')) + '</div>' +
            '<div class="xc-h">Filigrane</div><div class="xc-g">' + fld('Intensité', sel('waterOp', [[0.05, 'Très léger'], [0.08, 'Léger'], [0.13, 'Moyen'], [0.2, 'Marqué']])) + fld('Orientation', sel('waterAngle', [['diag', 'En diagonale'], ['horiz', 'Horizontal']])) + fld('Taille', sel('waterSize', [['s', 'Petite'], ['m', 'Moyenne'], ['l', 'Grande']])) + fld('Couleur', sel('waterTone', [['main', 'Couleur principale'], ['grey', 'Gris neutre']])) + '</div>' +
            '<div class="xc-h">Page de garde</div><div class="xc-g"><div class="xc-f w2">' + chk('cover', 'Page de garde en tête des PDF des outils') + chk('printCover', 'Page de garde sur les rapports imprimés') + '</div>' + fld('Thème de la page de garde', sel('coverTheme', [['dark', '🌙 Sombre'], ['light', '☀️ Clair']])) + '<div class="xc-f">' + chk('coverInfo', 'Réalisation, lieu, dates, contact') + '</div><p class="xc-note w4" style="grid-column:1/-1;margin:0">Le thème s\'applique aussi à la couverture du DOSSIER (clair = « Épuré », sombre = « XIII ») s\'il n\'a pas de thème choisi.</p></div>' +
            '<div class="xc-h">Logo</div><div class="xc-g"><div class="xc-f"><span>Image</span><div class="xc-logo" data-logo>' + (resolve(c).L ? '<img src="' + resolve(c).L + '">' : 'choisir…') + '</div><input type="file" accept="image/*" data-logof hidden></div>' + fld('Position', sel('logoPos', [['foot', 'Pied de page'], ['head', 'En-tête'], ['both', 'En-tête et pied'], ['none', 'Aucune']])) + fld('Taille', sel('logoSize', [['s', 'Petit'], ['m', 'Moyen'], ['l', 'Grand']])) + '<div class="xc-f">' + chk('useLogo', 'Afficher le logo') + (c.logo ? '<a href="#" data-lrm>retirer ce logo</a>' : f.logo ? '<small>logo de la fiche projet</small>' : '') + '</div></div>' +
            '<div class="xc-h">En-tête</div><div class="xc-g">' + fld('Style', sel('head', [['band', 'Bandeau de couleur'], ['line', 'Filet sous l\'en-tête'], ['none', 'Aucun']])) + fld('Épaisseur', sel('headH', [['s', 'Fine'], ['m', 'Moyenne'], ['l', 'Épaisse']])) + fld('Texte', sel('headText', [['none', 'Aucun'], ['title', 'Titre'], ['title-sub', 'Titre — société'], ['mention', 'Mention'], ['custom', 'Texte libre']])) + fld('Alignement', sel('headAlign', [['right', 'À droite'], ['left', 'À gauche']])) + fld('Texte libre de l\'en-tête', inp('headCustom', 'ex. Dossier technique — V3'), 'w4') + '</div>' +
            '<div class="xc-h">Pied de page</div><div class="xc-g"><div class="xc-f">' + chk('foot', 'Pied de page') + chk('footLine', 'Filet de couleur') + '</div>' + fld('À gauche', sel('footLeft', [['title-sub', 'Titre — société'], ['title', 'Titre'], ['sub', 'Société'], ['custom', 'Texte libre'], ['none', 'Rien']])) + fld('Numérotation', sel('num', [['n/t', '2 / 5'], ['page', 'Page 2 sur 5'], ['n', '2'], ['none', 'Aucune']])) + '<div class="xc-f">' + chk('date', 'Date d\'édition') + '</div>' + fld('Texte libre du pied', inp('footCustom', 'ex. Productions XIII — 01 23 45 67 89'), 'w4') + '</div>' +
            '<div class="xc-h">Rapports imprimés</div><div class="xc-g">' + fld('Police du contenu', sel('printFont', [['', 'Celle de l\'outil'], ['sans', 'Sans (Helvetica)'], ['serif', 'Serif (Times)'], ['mono', 'Machine à écrire']])) + '<div class="xc-f w3">' + chk('printTitles', 'Titres des rapports dans la couleur principale') + '</div></div>' +
            '<div class="xc-h">Outils concernés</div><div class="xc-apps">' + APPS.map(a => '<label><input type="checkbox" data-app="' + a[0] + '"' + ((c.off || {})[a[0]] ? '' : ' checked') + '> ' + a[1] + '</label>').join('') + '</div>' +
            '<p class="xc-note">PDF de SYNO, PLANO, CONDUCO, CALL SHEETO et DECOUP : habillage ajouté à chaque page. Rapports « Imprimer / PDF » (DEVISO, PACKINGO, BACKUPO…) : en-tête et pied dans les marges (Chrome, Edge), police, titres et filigrane. DOSSIER : couleur, filigrane et police serif repris s\'il n\'a pas les siens. RESSOURCO est décoché par défaut (contrats et autorisations gardent leur mise en page).</p>' +
            '</div><div class="xc-pvw"><div class="xc-h">Aperçu</div><div data-pv></div></div></div>';
        const pv = () => {
            const r = resolve(c), on = r.on, col = r.color, col2 = r.color2, fam = (FONTS.find(x => x[0] === r.font) || FONTS[0])[2], fs = (+r.size || 7.5) * 0.9, hb = (HH[r.headH] || 3.2) * 1.4, ht = headTxt(r), lt = leftTxt(r), rt = [r.version, r.date ? today() : '', numTxt(r, 2, 5)].filter(Boolean).join(' · ');
            const logo = sz => r.L ? '<img src="' + r.L + '" style="height:' + sz + 'px;max-width:70px;object-fit:contain">' : '', ls = { s: 9, m: 13, l: 19 }[r.logoSize] || 13;
            const dk = r.coverTheme !== 'light', cl = coverLines(r), cov = (r.cover || r.printCover) ? '<div class="xc-page xc-cov" style="background:' + (dk ? '#161618' : '#fff') + ';color:' + (dk ? '#fff' : '#191919') + ';font-family:' + fam + ';opacity:' + (on ? 1 : .5) + '"><div style="position:absolute;left:0;top:0;bottom:0;width:5px;background:' + col + '"></div><div style="position:absolute;left:18px;right:12px;top:28%">' + (r.L ? '<img src="' + r.L + '" style="max-height:20px;max-width:90px;display:block;margin-bottom:10px">' : '') + (r.mention ? '<div style="color:' + col + ';font-size:7px;font-weight:700;letter-spacing:.2em">' + esc(r.mention.toUpperCase()) + '</div>' : '') + '<div style="font-size:18px;font-weight:800;line-height:1.1;margin-top:3px">' + esc(r.T || 'Projet') + '</div>' + (r.S ? '<div style="font-size:9px;opacity:.75">' + esc(r.S) + '</div>' : '') + '<div style="width:26px;height:2px;background:' + col + ';margin:8px 0"></div>' + cl.map(t => '<div style="font-size:7px;opacity:.7">' + esc(t) + '</div>').join('') + '</div><div style="position:absolute;left:18px;bottom:10px;font-size:6.5px;opacity:.6">' + esc([r.version, today()].filter(Boolean).join(' · ')) + '</div></div><div class="xc-pvl">Page de garde</div>' : '';
            host.querySelector('[data-pv]').className = cov ? 'xc-two' : ''; host.querySelector('[data-pv]').innerHTML = (cov ? '<div>' + cov + '</div><div>' : '<div>') + '<div class="xc-page" style="opacity:' + (on ? 1 : .5) + ';font-family:' + fam + '">' +
                (r.head === 'band' ? '<div style="height:' + hb + 'px;background:' + col + '"></div>' : '') +
                '<div style="display:flex;align-items:center;justify-content:' + (r.headAlign === 'left' ? 'space-between' : 'space-between') + ';gap:6px;padding:6px 14px 4px;min-height:14px;' + (r.head === 'line' ? 'border-bottom:' + Math.max(1, hb / 2.5) + 'px solid ' + col + ';margin:0 14px;padding:6px 0 4px' : '') + '">' + (r.headAlign === 'left' ? '<b style="font-size:' + fs + 'px;color:' + col2 + '">' + esc(ht) + '</b>' + ((r.logoPos === 'head' || r.logoPos === 'both') ? logo(ls) : '') : ((r.logoPos === 'head' || r.logoPos === 'both') ? logo(ls) : '<span></span>') + '<b style="font-size:' + fs + 'px;color:' + col2 + '">' + esc(ht) + '</b>') + '</div>' +
                '<div style="padding:8px 14px"><div style="font-weight:700;font-size:12px;color:' + (r.printTitles ? col : '#222') + ';margin-bottom:6px;font-family:' + (r.printFont === 'serif' ? FONTS[1][2] : r.printFont === 'mono' ? FONTS[2][2] : 'inherit') + '">Feuille de service — J3</div><div class="xc-lines"><i></i><i></i><i style="width:70%"></i><i></i><i style="width:55%"></i><i></i><i style="width:80%"></i></div></div>' +
                (r.water ? '<div class="xc-wm" style="color:' + (r.waterTone === 'grey' ? '#777' : col) + ';opacity:' + (+r.waterOp || .08) * 1.6 + ';transform:rotate(' + (r.waterAngle === 'horiz' ? 0 : -30) + 'deg);font-size:' + Math.min({ s: 22, m: 34, l: 46 }[r.waterSize] || 34, ({ s: 140, m: 200, l: 250 }[r.waterSize] || 200) / Math.max(1, r.water.length)) + 'px">' + esc(r.water) + '</div>' : '') +
                (r.foot ? '<div class="xc-foot" style="' + (r.footLine ? 'border-top:1px solid ' + col + ';' : '') + 'font-size:' + fs + 'px;color:' + col2 + '">' + ((r.logoPos === 'foot' || r.logoPos === 'both') ? logo(Math.min(ls, 11)) : '') + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(lt) + '</span><b style="color:' + col + '">' + esc(r.headText === 'mention' ? '' : r.mention) + '</b><span style="flex:1;text-align:right">' + esc(rt) + '</span></div>' : '') + '</div>' + (cov ? '<div class="xc-pvl">Pages suivantes</div>' : '') + '</div>';
        };
        const changed = () => { pv(); if (onChange) onChange(Object.assign({}, c)); };
        host.querySelectorAll('[data-x]').forEach(i => i.addEventListener(i.type === 'checkbox' || i.tagName === 'SELECT' || i.type === 'color' ? 'change' : 'input', () => { const k = i.dataset.x; c[k] = i.type === 'checkbox' ? i.checked : /^(size|waterOp)$/.test(k) ? +i.value : i.value; changed(); }));
        host.querySelectorAll('[data-x][type=color]').forEach(i => i.addEventListener('input', () => { c[i.dataset.x] = i.value; changed(); }));
        host.querySelectorAll('[data-app]').forEach(i => i.onchange = () => { c.off = Object.assign({}, c.off); if (i.checked) delete c.off[i.dataset.app]; else c.off[i.dataset.app] = 1; changed(); });
        host.querySelectorAll('[data-pre]').forEach(b => b.onclick = () => { Object.assign(c, PRESETS[+b.dataset.pre][1], { on: true }); form(host, c, onChange); if (onChange) onChange(Object.assign({}, c)); });
        const pb = host.querySelector('[data-pal]'), pf = host.querySelector('[data-palf]'); if (pb) { pb.onclick = () => pf.click(); pf.onchange = () => { const f = pf.files[0]; if (!f) return; const u = URL.createObjectURL(f), im = new Image(); im.onload = () => { const P = palette(im); URL.revokeObjectURL(u); if (!P.length) { alert('Aucune couleur franche trouvée dans cette image.'); return; } c.color = P[0]; if (P[1]) c.color2 = P[1]; form(host, c, onChange); if (onChange) onChange(Object.assign({}, c)); }; im.src = u; }; }
        const lg = host.querySelector('[data-logo]'), lf = host.querySelector('[data-logof]'); lg.onclick = () => lf.click();
        lf.onchange = e => { const fl = e.target.files[0]; if (!fl) return; const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 240 / im.height, 600 / im.width), cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); c.logo = cv.toDataURL('image/png'); c.useLogo = true; form(host, c, onChange); if (onChange) onChange(Object.assign({}, c)); }; im.src = rd.result; }; rd.readAsDataURL(fl); };
        const rm = host.querySelector('[data-lrm]'); if (rm) rm.onclick = e => { e.preventDefault(); c.logo = ''; form(host, c, onChange); if (onChange) onChange(Object.assign({}, c)); };
        css(); pv(); return { get: () => Object.assign({}, c) };
    }
    function css() {
        if (document.getElementById('xc-css')) return; const s = document.createElement('style'); s.id = 'xc-css';
        s.textContent = '.xc-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.xc-two .xc-foot{font-size:5px!important}.xc-wrap{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:22px;align-items:start}.xc-pvw{position:sticky;top:0}.xc-on{display:flex;gap:8px;align-items:center;margin-bottom:10px;font-size:14px}.xc-on input{width:auto!important}.xc-presets{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:6px}.xc-presets span{font-size:12px;color:var(--text-dim,#999)}.xc-presets button{border-left:4px solid var(--pc)!important;padding:5px 11px!important;font-size:12.5px!important}' +
            '.xc-h{margin:14px 0 6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim,#999)}.xc-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px 12px}.xc-f{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:12.5px}.xc-f>span{font-size:11.5px;color:var(--text-dim,#aaa)}.xc-f.w2{grid-column:span 2}.xc-f.w3{grid-column:span 3}.xc-f.w4{grid-column:1/-1}.xc-f small,.xc-f a{font-size:11.5px;color:var(--text-dim,#999)}' +
            '.xc-g input[type=text],.xc-g input:not([type]),.xc-g select{width:100%;box-sizing:border-box;background:var(--bg-input,#17171a);color:inherit;border:1px solid var(--border-color,#45454b);border-radius:6px;padding:6px 8px;font:inherit}.xc-g input[type=color]{width:100%;height:32px;padding:2px;border:1px solid var(--border-color,#45454b);border-radius:6px;background:transparent}.xc-c{display:flex;gap:6px;align-items:center;font-size:12.5px;padding:3px 0}.xc-c input{width:auto!important}' +
            '.xc-logo{height:38px;border:1px dashed var(--border-color,#555);border-radius:6px;background:#fff;color:#888;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden}.xc-logo img{max-height:34px;max-width:100%}' +
            '.xc-apps{display:flex;flex-wrap:wrap;gap:6px}.xc-apps label{border:1px solid var(--border-color,#45454b);border-radius:99px;padding:3px 10px;font-size:12px;display:inline-flex;gap:5px;align-items:center}.xc-apps input{width:auto!important}.xc-note{font-size:11.5px;color:var(--text-dim,#888);margin:12px 0 0;line-height:1.5}' +
            '.xc-pvl{font-size:11px;color:var(--text-dim,#999);text-align:center;margin:4px 0 12px}.xc-cov{margin-bottom:0}.xc-page{width:100%;aspect-ratio:210/297;background:#fff;color:#333;position:relative;box-shadow:0 4px 18px rgba(0,0,0,.45);border-radius:2px;overflow:hidden}.xc-lines i{display:block;height:5px;background:#e6e6e6;border-radius:3px;margin:7px 0}.xc-wm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:34px;transform:rotate(-30deg);pointer-events:none;white-space:nowrap}.xc-foot{position:absolute;left:14px;right:14px;bottom:8px;padding-top:4px;display:flex;align-items:center;gap:6px}' +
            '@media(max-width:900px){.xc-wrap{grid-template-columns:1fr}.xc-pvw{position:static;max-width:300px}.xc-g{grid-template-columns:1fr 1fr}}';
        document.head.appendChild(s);
    }
    // ---------- panneau autonome (⚙️ des outils) ----------
    function panel() {
        if (typeof XPROJET !== 'undefined') { XPROJET.open('c'); return; }
        const old = document.getElementById('xc-ov'); if (old) old.remove();
        const o = document.createElement('div'); o.id = 'xc-ov'; o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10095;display:flex;align-items:center;justify-content:center;font-size:13px';
        o.innerHTML = '<div style="background:var(--bg-menu,#2d2d2d);color:var(--text-main,#fff);width:1000px;max-width:96vw;max-height:92vh;overflow:auto;border-radius:10px;border:1px solid var(--border-color,#444);padding:18px"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><b style="font-size:15px">🎨 Charte graphique des PDF</b><span id="xc-x" style="cursor:pointer;font-size:18px">✕</span></div><div id="xc-host"></div><div style="text-align:right;margin-top:12px"><button id="xc-ok" style="padding:8px 18px;border-color:rgba(240,179,120,.85);background:rgba(240,179,120,.25)">Enregistrer</button></div></div>';
        document.body.appendChild(o); o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); }); o.querySelector('#xc-x').onclick = () => o.remove();
        const F = form(o.querySelector('#xc-host'), raw());
        o.querySelector('#xc-ok').onclick = async () => { const n = await save(F.get()); o.remove(); try { if (typeof toast === 'function') toast(n.on ? '🎨 Charte appliquée aux PDF du projet' : 'Charte désactivée'); } catch (e) { } };
    }
    function loadToolLogo(app) { // logo personnalisé de l'outil : site/logos/OUTIL.png (repris dans les en-têtes de PDF)
        try { fetch('logos/' + app + '.png', { cache: 'force-cache' }).then(r => r.ok ? r.blob() : null).then(b => { if (!b || !/image/.test(b.type)) return; const f = new FileReader(); f.onload = () => { const i = new Image(); i.onload = () => { window.__xcToolLogo = { d: f.result, w: i.naturalWidth, h: i.naturalHeight }; }; i.src = f.result; }; f.readAsDataURL(b); }).catch(() => { }); } catch (e) { }
    }
    function init(app) {
        APP = app; loadToolLogo(app); const ap = () => { try { applyPrint(); } catch (e) { } }; if (document.body) ap(); else document.addEventListener('DOMContentLoaded', ap);
        window.addEventListener('storage', e => { if (e.key === KEY || e.key === 'xiii.projets') ap(); });
        if (!window.jspdf) { try { let v; Object.defineProperty(window, 'jspdf', { configurable: true, enumerable: true, get() { return v; }, set(x) { v = x; setTimeout(patchJsPDF, 0); setTimeout(patchJsPDF, 500); } }); } catch (e) { } }
        let t = 0; const iv = setInterval(() => { patchJsPDF(); patchDossier(); if (++t > 120) clearInterval(iv); }, 1000);
        window.addEventListener('beforeprint', ap);
        const c = raw(); if (c.on && c.useLogo && !c.logo && !c.lw) { const L = get().L; if (L) imgSize(L).then(([w, h]) => { const n = raw(); n.lw = w; n.lh = h; try { localStorage.setItem(KEY, JSON.stringify(n)); } catch (e) { } }); }
    }
    return { init, panel, form, save, raw, get, stamp, active };
})();

XCHARTE.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XPWA : installation (application sur l'ordinateur / le téléphone) et fonctionnement hors ligne
//  service worker : site/sw.js (généré par pwa/make_pwa.py) · manifeste : site/manifest.webmanifest
// =====================================================================
const XPWA = (() => {
    let deferred = null, reg = null;
    const mode = () => { try { return localStorage.getItem('xiii.pwa.mode') || 'offline'; } catch (e) { return 'offline'; } };
    const register = () => can ? navigator.serviceWorker.register('sw.js' + (mode() === 'online' ? '?mode=online' : '')).then(r => { reg = r; return r; }).catch(() => null) : Promise.resolve(null);
    async function setMode(m) { try { localStorage.setItem('xiii.pwa.mode', m); } catch (e) { } await register(); }
    const can = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && (location.protocol === 'https:' || /^(localhost|127\.)/.test(location.hostname));
    function head() {
        const add = (tag, attrs) => { const sel = tag + Object.keys(attrs).filter(k => k === 'rel' || k === 'name').map(k => '[' + k + '="' + attrs[k] + '"]').join(''); if (document.head.querySelector(sel)) return; const e = document.createElement(tag); Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k])); document.head.appendChild(e); };
        add('link', { rel: 'manifest', href: 'manifest.webmanifest' }); add('meta', { name: 'theme-color', content: '#1d1b19' }); add('link', { rel: 'apple-touch-icon', href: 'xiii-apple-touch.png' });
        add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }); add('meta', { name: 'apple-mobile-web-app-title', content: 'SUITE XIII' });
    }
    const ask = m => new Promise(res => { const sw = navigator.serviceWorker && navigator.serviceWorker.controller; if (!sw) return res(null); const ch = new MessageChannel(); ch.port1.onmessage = e => res(e.data); sw.postMessage(m, [ch.port2]); setTimeout(() => res(null), 120000); });
    const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    async function install(m) {
        await setMode(m);
        if (deferred && !installed()) { deferred.prompt(); const r = await deferred.userChoice; deferred = null; if (r && r.outcome === 'accepted') { try { if (typeof toast === 'function') toast('📲 SUITE XIII installée' + (m === 'online' ? ' (en ligne)' : ' (hors ligne)')); } catch (e) { } return; } }
        panel(m);
    }
    function panel(want) {
        if (want) { try { localStorage.setItem('xiii.pwa.mode', want); } catch (e) { } register(); }
        const old = document.getElementById('xp-ov'); if (old) old.remove();
        const o = document.createElement('div'); o.id = 'xp-ov'; o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10300;display:flex;align-items:center;justify-content:center';
        const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        o.innerHTML = '<div style="background:var(--bg-menu,#2d2d2d);color:var(--text-main,#fff);width:520px;max-width:94vw;border-radius:8px;border:1px solid var(--border-color,#444);padding:18px;font-size:13px;line-height:1.55"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><b style="font-size:15px">📲 Installer la suite</b><span id="xp-x" style="cursor:pointer;font-size:18px">✕</span></div>' +
            '<p style="margin:0 0 10px;color:var(--text-dim,#aaa)">Installée, la suite s\'ouvre comme une application (icône sur le bureau, le Dock ou l\'écran d\'accueil, sans barre du navigateur). Choisissez si elle doit aussi fonctionner <b>sans connexion</b> (tournage en sous-sol, campagne, avion). Vos données restent dans ce navigateur, comme avant.</p>' +
            '<div style="display:grid;gap:6px;margin-bottom:10px"><label style="display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border:1px solid var(--border-color,#444);border-radius:6px;cursor:pointer"><input type="radio" name="xp-m" value="online"' + (mode() === 'online' ? ' checked' : '') + '><span><b>🌐 En ligne</b> — application installée, tout fonctionne comme sur le site (toujours la dernière version, rien n\'est stocké en plus)</span></label><label style="display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border:1px solid var(--border-color,#444);border-radius:6px;cursor:pointer"><input type="radio" name="xp-m" value="offline"' + (mode() !== 'online' ? ' checked' : '') + '><span><b>✈︎ En ligne + hors ligne</b> — pareil, et en plus une copie de la suite est gardée pour travailler sans connexion</span></label></div>' +
            '<div id="xp-st" style="padding:8px 10px;border:1px solid var(--border-color,#444);border-radius:6px;margin-bottom:10px">…</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap"><button id="xp-in" style="flex:1;padding:9px;border-color:rgba(240,179,120,.85);background:rgba(240,179,120,.25)">📲 Installer l\'application</button><button id="xp-warm" style="flex:1;padding:9px">⬇️ Tout préparer pour le hors-ligne</button></div>' +
            '<p id="xp-h" style="margin:10px 0 0;font-size:11.5px;color:var(--text-dim,#888)">' + (ios ? 'iPhone / iPad : dans Safari, bouton Partager ⎋ puis « Sur l\'écran d\'accueil ».' : 'Chrome / Edge : bouton ci-dessus, ou icône ⊕ dans la barre d\'adresse. Safari (Mac) : Fichier → « Ajouter au Dock ».') + ' Hors ligne : les fonds de carte (REPERO), la météo, l\'IA et les données en direct restent indisponibles.</p></div>';
        document.body.appendChild(o); o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); }); o.querySelector('#xp-x').onclick = () => o.remove();
        apkBlock(o.firstElementChild, ios);
        const st = o.querySelector('#xp-st'), bi = o.querySelector('#xp-in');
        const refresh = async () => { if (!can) { st.innerHTML = '⚠️ Le hors-ligne demande que la suite soit servie en <b>https</b> (Netlify) : indisponible en ouvrant le fichier directement.'; return; } const s = await ask({ t: 'status' }); st.innerHTML = installed() ? '✅ Application installée.' : ''; if (mode() === 'online') { st.innerHTML += (installed() ? '<br>' : '') + '🌐 Mode en ligne : tous les outils fonctionnent normalement avec une connexion' + (s && !s.online ? ' (activation au prochain rechargement)' : '') + '.'; return; } st.innerHTML += s ? (installed() ? '<br>' : '') + '💾 Hors ligne : <b>' + s.pages + ' / ' + s.total + '</b> fichiers de la suite · <b>' + s.libs + ' / ' + s.libsTotal + '</b> bibliothèques (PDF, tableurs, cartes…) · version ' + s.ver : '⏳ Préparation du hors-ligne… (rechargez la page une fois)'; };
        refresh();
        o.querySelectorAll('input[name=xp-m]').forEach(r => r.onchange = async () => { await setMode(r.value); st.textContent = '⏳ Changement de mode…'; setTimeout(refresh, 1500); o.querySelector('#xp-warm').disabled = r.value === 'online'; });
        o.querySelector('#xp-warm').disabled = mode() === 'online';
        bi.disabled = installed() || (!deferred && !/Safari/.test(navigator.userAgent)); if (installed()) bi.textContent = '✅ Déjà installée';
        bi.onclick = async () => { const m = (o.querySelector('input[name=xp-m]:checked') || {}).value || 'offline'; await setMode(m); if (deferred) { deferred.prompt(); const r = await deferred.userChoice; deferred = null; if (r && r.outcome === 'accepted') { bi.textContent = '✅ Installée'; bi.disabled = true; } } else o.querySelector('#xp-h').style.color = 'rgb(240,179,120)'; };
        o.querySelector('#xp-warm').onclick = async () => { if (!can) return; st.textContent = '⏳ Téléchargement des pages et des bibliothèques…'; const r = await ask({ t: 'warm' }); if (!r) { st.textContent = '⚠️ Service hors ligne pas encore actif : rechargez la page puis recommencez.'; return; } await refresh(); st.innerHTML += '<br>✅ Prêt : ' + r.ok + ' / ' + r.total + ' bibliothèques en cache.'; };
    }
    // ---------- 📱 application mobile XIII : raccourci installé par le navigateur du téléphone (Chrome, Edge, Samsung, Safari) ----------
    function apkBlock(box, ios) {
        const d = document.createElement('div'); d.style.cssText = 'margin-top:12px;padding:10px 12px;border:1px solid rgba(240,179,120,.5);border-radius:8px'; box.appendChild(d);
        const mob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent), url = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '') + 'equipe.html';
        const qr = !mob && typeof XQRS !== 'undefined' ? XQRS.svg(url, { ecl: 'M', border: 2 }) : '';
        d.innerHTML = '<b>📱 Application mobile XIII</b><p style="margin:4px 0 8px;color:var(--text-dim,#aaa)">Une icône sur l\'écran d\'accueil du téléphone qui s\'ouvre en plein écran comme une vraie application (le navigateur travaille en arrière-plan) : échanges d\'équipe, mentions, notifications, outils de terrain.</p>' +
            (mob ? '<a href="equipe.html#install"><button style="padding:9px 12px;border-color:rgba(240,179,120,.85);background:rgba(240,179,120,.25)">📲 Installer l\'application sur ce téléphone</button></a>' : '<div style="display:grid;grid-template-columns:130px 1fr;gap:12px;align-items:center"><div style="background:#fff;border-radius:8px;padding:5px">' + qr + '</div><p style="margin:0;font-size:12.5px">Scannez avec le téléphone, puis touchez <b>« Installer l\'application »</b>.<br><span style="color:var(--text-dim,#888)">Android (Chrome, Edge, Samsung) : un seul geste. iPhone (Safari) : Partager ⎋ › « Sur l\'écran d\'accueil ».</span></p></div>');
    }
    function init(app) {
        head();
        window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; const b = document.getElementById('xp-btn'); if (b) b.classList.add('xp-ready'); });
        if (can) window.addEventListener('load', register);
        const dot = () => { let d = document.getElementById('xp-off'); if (navigator.onLine) { if (d) d.remove(); return; } if (!d) { d = document.createElement('div'); d.id = 'xp-off'; d.textContent = '✈︎ Hors ligne'; d.title = 'Pas de connexion : la suite continue de fonctionner, vos données sont enregistrées dans ce navigateur.'; d.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:10030;background:#37474f;color:#fff;font:600 12px Segoe UI,sans-serif;padding:5px 10px;border-radius:99px;opacity:.9'; document.body.appendChild(d); } };
        window.addEventListener('online', dot); window.addEventListener('offline', dot); if (document.readyState === 'complete') dot(); else window.addEventListener('load', dot);
        if (app === 'index') { const go = () => { const bar = document.querySelector('#top-bar .bar-right'); if (!bar || document.getElementById('xp-btn')) return; const anchor = bar.querySelector('button[onclick="XBUNDLE.panel()"], button[onclick="XPROJET.open()"]'); const h = '<button id="xp-btn" title="Installer la suite comme une application : en ligne, ou en ligne + hors ligne (au choix sur la page suivante)"><span>📲</span><span>Installer</span></button>'; if (anchor) anchor.insertAdjacentHTML('beforebegin', h); else bar.insertAdjacentHTML('afterbegin', h); document.getElementById('xp-btn').onclick = () => panel(); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go(); }
    }
    return { init, panel, install, mode, status: () => ask({ t: 'status' }) };
})();

XPWA.init(XIII_APP);

// généré par xiii/make_optics.js depuis cadro/data.js — ne pas modifier
const XOPT = {"sens":[["s0","ARRI Alexa 35 · Open Gate 4.6K","Cinéma",27.99,19.22,4608,3164,"bayer"],["s1","ARRI Alexa Mini LF · Open Gate","Cinéma",36.7,25.54,4448,3096,"bayer"],["s2","ARRI Alexa Mini / SXT · Open Gate 3.4K","Cinéma",28.25,18.17,3424,2202,"bayer"],["s3","ARRI Alexa / Amira · 16:9 2.8K","Cinéma",23.76,13.37,2880,1620,"bayer"],["s4","ARRI Alexa 65 · Open Gate","Cinéma",54.12,25.58,6560,3100,"bayer"],["s5","RED V-Raptor 8K VV","Cinéma",40.96,21.6,8192,4320,"bayer"],["s6","RED Komodo 6K S35","Cinéma",27.03,14.26,6144,3240,"bayer"],["s7","RED Gemini 5K S35","Cinéma",30.72,15.8,5120,2700,"bayer"],["s8","Sony Venice · 6K plein format 3:2","Cinéma",36.2,24.1,6048,4032,"bayer"],["s9","Sony Venice 2 · 8.6K plein format","Cinéma",36.2,24.1,8640,5760,"bayer"],["s10","Sony FX9 · 6K plein format","Cinéma",35.7,18.8,6048,3192,"bayer"],["s11","Canon C70 / C300 Mk III · S35 4K","Cinéma",26.2,13.8,4096,2160,"bayer"],["s12","Canon C500 Mk II · plein format 5.9K","Cinéma",38.1,20.1,5952,3140,"bayer"],["s13","Blackmagic URSA Mini Pro 12K","Cinéma",27.03,14.25,12288,6480,"bayer"],["s14","Blackmagic URSA Cine 12K LF","Cinéma",35.64,23.32,12288,8040,"bayer"],["s15","Blackmagic Cinema Camera 6K plein format","Cinéma",36,24,6048,4032,"bayer"],["s16","Blackmagic Pocket 6K / 6K Pro","Cinéma",23.1,12.99,6144,3456,"bayer"],["s17","Blackmagic Pocket 4K / G2","Cinéma",18.96,10,4096,2160,"bayer"],["s18","Sony FX6 / FX3 / A7S III · 12 Mpx","Hybride",35.6,23.8,4240,2832,"bayer"],["s19","Sony A7 IV","Hybride",35.9,23.9,7008,4672,"bayer"],["s20","Sony A1","Hybride",35.9,24,8640,5760,"bayer"],["s21","Sony α6400 / ZV-E10 (APS-C)","Hybride",23.5,15.6,6000,4000,"bayer"],["s22","Canon EOS R5 / R5 C","Hybride",36,24,8192,5464,"bayer"],["s23","Canon EOS R6 Mark II","Hybride",35.9,23.9,6000,4000,"bayer"],["s24","Canon EOS R7 (APS-C)","Hybride",22.3,14.8,6960,4640,"bayer"],["s25","Panasonic S1H","Hybride",35.6,23.8,6024,4020,"bayer"],["s26","Panasonic GH6 (Micro 4/3)","Hybride",17.3,13,5776,4336,"bayer"],["s27","Panasonic GH5 II (Micro 4/3)","Hybride",17.3,13,5184,3888,"bayer"],["s28","Nikon Z9","Hybride",35.9,23.9,8256,5504,"bayer"],["s29","Nikon Z6 III","Hybride",35.9,23.9,6048,4032,"bayer"],["s30","Fujifilm X-H2S (APS-C)","Hybride",23.5,15.6,6240,4160,"bayer"],["s31","Fujifilm GFX100 II (moyen format)","Hybride",43.8,32.9,11648,8736,"bayer"],["s32","Sigma fp (plein format)","Hybride",35.9,23.9,6000,4000,"bayer"],["s33","Sony PXW-Z750 · 3 CMOS 2/3″ 4K","Broadcast",9.59,5.39,3840,2160,"3ccd"],["s34","Caméra broadcast 2/3″ HD (3 capteurs)","Broadcast",9.59,5.39,1920,1080,"3ccd"],["s35","Sony PXW-Z280 · 3 CMOS 1/2″","Broadcast",6.4,3.6,1920,1080,"3ccd"],["s36","Caméscope 1/3″ (3 capteurs)","Broadcast",4.8,2.7,1920,1080,"3ccd"],["s37","Caméscope 1″ (capteur unique)","Broadcast",13.2,7.43,3840,2160,"bayer"],["s38","iPhone 15 Pro · caméra principale (≈ 1/1.28″)","Téléphone",9.8,7.35,4032,3024,"bayer"],["s39","Smartphone · capteur 1/2.55″ (typique)","Téléphone",5.6,4.2,4000,3000,"bayer"],["s40","Plein format 36 × 24 (6000 × 4000)","Formats",36,24,6000,4000,"bayer"],["s41","Super 35 · 3 perf (24,89 × 18,66)","Formats",24.89,18.66,4096,3072,"bayer"],["s42","Super 35 · 16:9 (24,89 × 14)","Formats",24.89,14,4096,2304,"bayer"],["s43","Academy 35 mm (22,0 × 16,0)","Formats",22,16,3520,2560,"bayer"],["s44","Super 16 (12,52 × 7,41)","Formats",12.52,7.41,2048,1212,"bayer"],["s45","16 mm (10,26 × 7,49)","Formats",10.26,7.49,2048,1495,"bayer"],["s46","APS-C Canon (22,3 × 14,9)","Formats",22.3,14.9,6000,4000,"bayer"],["s47","APS-C Sony / Nikon / Fuji (23,5 × 15,6)","Formats",23.5,15.6,6000,4000,"bayer"],["s48","Micro 4/3 (17,3 × 13,0)","Formats",17.3,13,4608,3456,"bayer"],["s49","1 pouce (13,2 × 8,8)","Formats",13.2,8.8,5472,3648,"bayer"],["s50","Moyen format 44 × 33","Formats",43.8,32.9,8256,6192,"bayer"],["s51","65 mm 5 perf (52,48 × 23,01)","Formats",52.48,23.01,6560,2876,"bayer"],["s52","IMAX 15/70 (70,41 × 52,63)","Formats",70.41,52.63,8192,6124,"mono"]],"lenses":[["sig","ARRI Signature Prime","LPL","12–280 mm"],["up","ARRI Ultra Prime","PL","8–180 mm"],["mp","ARRI / Zeiss Master Prime","PL","12–150 mm"],["s4","Cooke S4/i","PL","12–300 mm"],["s7","Cooke S7/i (plein format)","PL","16–300 mm"],["sup","Zeiss Supreme Prime","PL","15–200 mm"],["cp3","Zeiss CP.3","PL","15–135 mm"],["sigff","Sigma Cine FF High Speed","PL","14–135 mm"],["cne","Canon CN-E Prime","EF","14–135 mm"],["lux","Leitz Summilux-C","PL","16–135 mm"],["vesp","DZOFilm Vespid","PL","16–125 mm"],["xeen","Samyang Xeen CF","PL","16–85 mm"],["nik","Panasonic Lumix S / Sony G Master (photo)","E","14–135 mm"],["z1","Zoom Angénieux Optimo 24-290","PL","24–290 mm"],["z2","Zoom Fujinon Premista 28-100","PL","28–100 mm"],["z3","Zoom Canon CN-E 18-80 (servo)","EF","18–80 mm"],["z4","Zoom Sony FE 24-70 GM II","E","24–70 mm"],["z5","Zoom Sony FE PZ 28-135 G","E","28–135 mm"],["b4","Zoom broadcast 2/3″ B4 (22×, 7,6-168)","B4","7.6–168 mm"]],"aspect":[["1.7778","16:9 (1,78)"],["1.8963","17:9 DCI (1,90)"],["1.85","1,85:1"],["2","2:1 Univisium"],["2.39","2,39:1 Scope"],["2.35","2,35:1"],["1.3333","4:3"],["1.5","3:2"],["1","1:1"],["0.8","4:5"],["0.5625","9:16 vertical"],["2.76","2,76:1 Ultra Panavision"],["1.43","1,43:1 IMAX"]],"rec":[["1920","HD 1920"],["2048","2K DCI 2048"],["3840","UHD 3840"],["4096","4K DCI 4096"],["4608","4,6K 4608"],["5120","5K 5120"],["6144","6K 6144"],["7680","8K UHD 7680"],["8192","8K DCI 8192"],["12288","12K 12288"]]};

// =====================================================================
//  SUITE XIII — XPROJET : « 🎬 Projet XIII », la fiche complète du projet en cours
//  • une grande page : informations globales, lieux, technique (caméras et objectifs de CADRO), équipe (annuaire),
//    nom du projet dans chaque outil, export / import du projet complet (.xiii), changement de projet
//  • stockée dans la fiche projet commune (xiii.projets) : les outils reprennent déjà titre, dates, lieu, société…
//  • en plus, à l'ouverture de chaque outil : nom du projet propre à l'outil, type de DOSSIER, réglages CADRO
//  • l'équipe est versée dans l'annuaire XIII (xiii.annuaire), proposé partout
// =====================================================================
const XPROJET = (() => {
    const KP = 'xiii.projets', KB = 'xiii.annuaire';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const J = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || '') || d; } catch (e) { return d; } };
    const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const TYPES = [['fiction', '🎬 Fiction', 'fiction', 'fiction'], ['tv', '📺 Émission TV', 'tv', 'tv'], ['live', '🎤 Captation live / concert', 'live', 'tv'], ['doc', '🎥 Documentaire', 'doc', 'fiction'], ['pub', '✨ Publicité / clip', 'pub', 'artistique'], ['corporate', '🏢 Institutionnel / corporate', 'corporate', 'tech'], ['event', '🎪 Événementiel', 'event', 'tech'], ['artistique', '🎨 Projet artistique', 'autre', 'artistique'], ['libre', '🧩 Thème libre', 'autre', 'blank']];
    const TOOLS = [['planno', '📅 PLANNO'], ['casto', '🎭 CASTO'], ['posto', '🎞️ POSTO'], ['sono', '🎚️ SONO'], ['lumo', '💡 LUMO'], ['runo', '🔴 RUNO'], ['transporto', '🚐 TRANSPORTO'], ['soustitro', '💬 SOUSTITRO'], ['encodo', '🔄 ENCODO'], ['syno', '🔀 SYNO'], ['plano', '📐 PLANO'], ['conduco', '🎬 CONDUCO'], ['callsheeto', '📋 CALL SHEETO'], ['packingo', '🧳 PACKINGO'], ['backupo', '💽 BACKUPO'], ['deviso', '💶 DEVISO'], ['ressourco', '📑 RESSOURCO'], ['repero', '📍 REPERO'], ['moodo', '🎨 MOODO'], ['storyboardo', '🖼️ STORYBOARDO'], ['scripto', '📝 SCRIPTO'], ['decoup', '✂️ DECOUP'], ['cadro', '🎯 CADRO'], ['graphico', '🎛️ GRAPHICO'], ['dossier', '📚 DOSSIER']];
    const DEPTS = [['prod', 'Production'], ['real', 'Réalisation'], ['image', 'Image'], ['elec', 'Électro'], ['machino', 'Machinerie'], ['son', 'Son'], ['deco', 'Décoration'], ['cost', 'Costumes'], ['hmc', 'Maquillage / Coiffure'], ['regie', 'Régie'], ['cast', 'Comédiens / Talents'], ['fig', 'Figuration'], ['secu', 'Sécurité / Secours'], ['transport', 'Transport'], ['cantine', 'Cantine / Catering'], ['post', 'DIT / Post-prod'], ['autre', 'Autre']];
    const ROLES = ['Réalisateur·rice', 'Producteur·rice', 'Directeur·rice de production', 'Chargé·e de production', 'Régisseur·se général·e', '1er·e assistant·e réalisation', 'Scripte', 'Chef·fe opérateur·rice', 'Cadreur·se', '1er·e assistant·e caméra', 'Pointeur·se', 'DIT', 'Chef·fe électro', 'Électricien·ne', 'Chef·fe machiniste', 'Ingénieur·e du son', 'Perchman', 'Mixeur·se', 'Chef·fe décorateur·rice', 'Accessoiriste', 'Costumier·ère', 'Maquilleur·se', 'Coiffeur·se', 'Monteur·se', 'Étalonneur·se', 'Truquiste', 'Directeur·rice technique', 'Réalisateur·rice live', 'Opérateur·rice vision', 'Comédien·ne', 'Présentateur·rice', 'Chauffeur·se', 'Secouriste'];
    const DEPT_RX = [['real', /(realisat|scripte|assistant.*real)/], ['image', /(cadr|chef.*op|camera|steadi|pointeu|dit|vision|drone)/], ['son', /(son|perch|mix|audio)/], ['elec', /(electr|lumiere|eclair)/], ['machino', /(machin|grip)/], ['deco', /(deco|accessoir)/], ['cost', /(costum|habill)/], ['hmc', /(maquill|coiff)/], ['regie', /(regisseu|regie)/], ['post', /(monteu|etalon|truquis|post)/], ['prod', /(product|direct.*prod|charge)/], ['secu', /(secour|secur)/], ['transport', /(chauffeu|transport)/], ['cast', /(comedien|present|artiste|acteur|actrice|chant|music|talent)/]];
    const POSK = 'xiii.settings.postes';
    const postes = () => { const c = J(POSK, []) || []; return ROLES.concat((Array.isArray(c) ? c : []).filter(x => x && ROLES.indexOf(x) < 0)); };
    const tsplit = m => { if (m.prenom == null && m.nom == null) { const t = String(m.name || '').trim().split(/\s+/).filter(Boolean); m.prenom = t.length > 1 ? t[0] : ''; m.nom = t.length > 1 ? t.slice(1).join(' ') : (t[0] || ''); } m.prenom = m.prenom || ''; m.nom = m.nom || ''; m.address = m.address || ''; m.secu = m.secu || ''; return m; };
    const tname = m => [m.prenom, m.nom].map(x => String(x || '').trim()).filter(Boolean).join(' ') || String(m.name || '').trim();
    const deptOf = r => { const f = fold(r); const m = DEPT_RX.find(x => x[1].test(f)); return m ? m[0] : 'autre'; };
    let APP = '';
    // ---------- fiche projet ----------
    const state = () => { const s = J(KP, null); return s && Array.isArray(s.list) ? s : { active: '', list: [] }; };
    const active = () => { const s = state(); return s.list.find(f => f && f.id === s.active) || null; };
    function blank() { return { id: uid(), title: '', genre: '', production: '', client: '', realisation: '', producteur: '', debut: '', fin: '', diffusion: '', duree: '', lieu: '', adresse: '', contact: '', acces: '', logo: '', updated: Date.now() }; }
    function write(f) { const s = state(), i = s.list.findIndex(x => x && x.id === f.id); f.updated = Date.now(); f.rev = Date.now(); if (i < 0) s.list.push(f); else s.list[i] = f; s.active = f.id; try { localStorage.setItem(KP, JSON.stringify(s)); } catch (e) { alert('Stockage du navigateur plein (logo trop lourd ?)'); return false; } try { window.dispatchEvent(new StorageEvent('storage', { key: KP })); } catch (e) { } header(); try { if (typeof showCurrentProject === 'function') showCurrentProject(); } catch (e) { } return true; }
    const projName = () => { const f = active(); return f && f.title || ''; };
    // ---------- en-tête : nom du projet en cours ----------
    function header() {
        const n = projName(), b = document.querySelector('#top-bar .brand'); if (!b) return;
        let s = document.getElementById('xpj-name'); if (!s) { s = document.createElement('span'); s.id = 'xpj-name'; s.title = 'Projet en cours — cliquer pour ouvrir Projet XIII'; s.onclick = open; b.appendChild(s); }
        s.textContent = n ? n : ''; s.style.display = n ? '' : 'none';
    }
    // ---------- page ----------
    let F = null, ov = null, CH = null, CHD = false;
    function open(sec) {
        CH = null; CHD = false; F = JSON.parse(JSON.stringify(active() || blank())); F.tech = Object.assign({ cams: [], lenses: [], fps: '25', aspect: '1.7778', rec: '3840', codec: '', audio: '', notes: '' }, F.tech || {}); F.team = F.team || []; F.names = F.names || {}; F.locs = F.locs || []; F.ptype = F.ptype || (TYPES.find(t => t[2] === F.genre) || [''])[0];
        if (F.contact && !F.contactName && !F.contactPhone && !F.contactEmail) { String(F.contact).split(/\s*[·|,;]\s*/).forEach(x => { if (/@/.test(x)) F.contactEmail = x; else if (/^[+\d][\d .-]{6,}$/.test(x)) F.contactPhone = x; else if (!F.contactName) F.contactName = x; }); }
        if (ov) ov.remove(); ov = document.createElement('div'); ov.id = 'xpj-ov'; document.body.appendChild(ov); draw();
        if (typeof XTOUR !== 'undefined' && XTOUR.run) XTOUR.run('projet', XTOUR.T.projet);
        document.addEventListener('keydown', escK, true);
        if (sec) setTimeout(() => { const el = ov && ov.querySelector('#xpj-' + sec); if (el) { const b = ov.querySelector('.xpj-body'); b.style.scrollBehavior = 'auto'; b.scrollTop = el.offsetTop - b.offsetTop; b.style.scrollBehavior = ''; } }, 30);
    }
    const escK = e => { if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S') && ov) { e.preventDefault(); e.stopPropagation(); save(); return; } if (e.key === 'Escape' && ov && !document.querySelector('#xb-ov,#xpj-pick')) { e.stopPropagation(); close(); } };
    function close() { if (ov) ov.remove(); ov = null; document.removeEventListener('keydown', escK, true); }
    const I = (k, ph, t, cls) => '<label class="xpj-f ' + (cls || '') + '"><span>' + esc(ph[0]) + '</span><input data-k="' + k + '" type="' + (t || 'text') + '" value="' + esc(get(k)) + '" placeholder="' + esc(ph[1] || '') + '"></label>';
    const get = k => k.split('.').reduce((o, x) => o == null ? '' : o[x], F) ?? '';
    const set = (k, v) => { const p = k.split('.'), last = p.pop(); p.reduce((o, x) => (o[x] = o[x] || {}), F)[last] = v; };
    function draw() {
        const st = state(), others = st.list.filter(f => f && f.id !== F.id), sel = (k, opts, cur) => '<select data-k="' + k + '">' + opts.map(o => '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
        const sensOpts = [['', '— caméra —']].concat((typeof XOPT !== 'undefined' ? XOPT.sens : []).map(s => [s[0], s[1]]));
        const NAV = [['g', '🧭 Global'], ['l', '📍 Lieux'], ['t', '🎥 Technique'], ['h', '👥 Équipe'], ['o', '🗂️ Outils'], ['p', '🖼️ Personnalisation'], ['c', '🎨 Charte PDF'], ['f', '📦 Fichier']];
        const WS = typeof XWS !== 'undefined', WSL = WS ? XWS.list() : [], WC = WS ? XWS.color() : '';
        ov.innerHTML = '<div class="xpj-box"><div class="xpj-head"><div><small>' + (WS ? '<i class="xpj-wsd" style="background:' + esc(WC) + '"></i>' : '') + 'PROJET XIII</small><input id="xpj-title" data-k="title" value="' + esc(F.title) + '" placeholder="Nom du projet"></div>' +
            '<div class="xpj-ha">' + (WS ? '<select id="xpj-sw" title="Changer de projet XIII (chaque projet a son Drive, son équipe et ses données)"><option value="">⇄ Changer de projet…</option>' + (WSL.length > 1 ? '<optgroup label="Projets XIII">' + WSL.filter(w => w.id !== XWS.id).map(w => '<option value="ws:' + w.id + '" style="color:' + esc(w.color) + '">● ' + esc(w.name) + '</option>').join('') + '</optgroup>' : '') + '<option value="__ws">＋ Nouveau projet XIII (Drive et équipe séparés)</option>' + (others.length ? '<optgroup label="Autres fiches dans ce projet">' + others.map(f => '<option value="' + f.id + '">' + esc(f.title || 'Sans titre') + '</option>').join('') + '</optgroup>' : '') + '</select>' : others.length ? '<select id="xpj-sw" title="Changer de projet"><option value="">⇄ Changer de projet…</option>' + others.map(f => '<option value="' + f.id + '">' + esc(f.title || 'Sans titre') + '</option>').join('') + '<option value="__new">＋ Nouveau projet</option></select>' : '<button id="xpj-new">＋ Nouveau projet</button>') + '<button id="xpj-save1" title="Enregistrer sans fermer (Ctrl+S)">💾 Enregistrer</button><button id="xpj-save" class="xpj-main">✓ Enregistrer et fermer</button><button id="xpj-x" title="Fermer (Échap)">✕</button></div></div>' +
            '<nav class="xpj-nav">' + NAV.map(n => '<a href="#xpj-' + n[0] + '">' + n[1] + '</a>').join('') + '</nav><div class="xpj-body">' +
            // ----- global
            '<section id="xpj-g"><h3>🧭 Informations globales</h3><div class="xpj-types">' + TYPES.map(t => '<button data-type="' + t[0] + '" class="' + (F.ptype === t[0] ? 'on' : '') + '">' + t[1] + '</button>').join('') + '</div><p class="xpj-dim">Le type règle aussi le modèle de dossier dans <b>📚 DOSSIER</b> (' + esc(((TYPES.find(t => t[0] === F.ptype) || [])[3]) || '—') + ').</p>' + (WS ? '<div class="xpj-wsc"><span>Couleur du projet <small>liseré des onglets</small></span>' + XWS.colors.map(c => '<button data-wsc="' + c + '" title="' + c + '" style="background:' + c + '" class="' + (c.toLowerCase() === String(WC).toLowerCase() ? 'on' : '') + '"></button>').join('') + '<label title="Autre couleur"><input type="color" id="xpj-wscol" value="' + esc(WC) + '"></label></div>' : '') + '<div class="xpj-grid">' +
            I('production', ['Société de production', 'Productions XIII']) + I('client', ['Client / diffuseur', 'France TV, marque…']) + I('realisation', ['Réalisation', 'Prénom Nom']) + I('producteur', ['Direction de production', 'Prénom Nom']) +
            I('debut', ['Début du tournage'], 'date') + I('fin', ['Fin du tournage'], 'date') + I('diffusion', ['Diffusion / événement'], 'date') + I('duree', ['Format / durée', '52 min · 2 h de direct']) +
            I('contactName', ['Contact production — nom', 'Prénom Nom']) + I('contactPhone', ['Téléphone', '06 00 00 00 00'], 'tel') + I('contactEmail', ['E-mail', 'prod@exemple.fr'], 'email') + '<span></span>' + '<label class="xpj-f w2"><span>Logo</span><span class="xpj-logo" id="xpj-logo">' + (F.logo ? '<img src="' + esc(F.logo) + '">' : 'Choisir une image…') + '</span><input type="file" id="xpj-lf" accept="image/*" hidden></label><label class="xpj-f w2"><span>Couverture <small style="opacity:.6">bannière floutée de l\'Accueil et des PDF (sinon le logo)</small></span><span class="xpj-logo xpj-cov" id="xpj-cov">' + (F.cover ? '<img src="' + esc(F.cover) + '"><a href="#" id="xpj-crm" title="Retirer la couverture">✕</a>' : 'Choisir une image…') + '</span><input type="file" id="xpj-cf" accept="image/*" hidden></label></div></section>' +
            // ----- lieux
            '<section id="xpj-l"><h3>📍 Lieux <small class="xpj-dim">— ajoutés à chaque journée de CALL SHEETO et aux lieux à repérer de REPERO</small></h3><div class="xpj-grid">' + I('lieu', ['Lieu principal', 'Tapez un nom de lieu…']) + I('adresse', ['Adresse (recherche automatique comme dans REPERO)', 'Tapez une adresse ou un lieu, puis choisissez'], 'text', 'w3') + (F.lat ? '<p class="xpj-dim w4" style="grid-column:1/-1;margin:0">📍 ' + (+F.lat).toFixed(5) + ', ' + (+F.lon).toFixed(5) + ' — position reprise par CALL SHEETO (météo, hôpital) et REPERO</p>' : '') + '<label class="xpj-f w4"><span>Accès & infos pratiques</span><textarea data-k="acces" placeholder="Parking, quai de déchargement, codes…">' + esc(F.acces) + '</textarea></label></div>' +
            '<div class="xpj-sub">Autres lieux</div><table class="xpj-t">' + F.locs.map((l, i) => '<tr data-li="' + i + '"><td><input data-lk="name" value="' + esc(l.name) + '" placeholder="Nom (décor, base régie…)"></td><td><input data-lk="address" value="' + esc(l.address) + '" placeholder="Adresse"></td><td><input data-lk="note" value="' + esc(l.note) + '" placeholder="Note"></td><td><button data-ldel="' + i + '">✕</button></td></tr>').join('') + '</table><button id="xpj-ladd" class="xpj-sm">＋ Lieu</button></section>' +
            // ----- technique
            '<section id="xpj-t"><h3>🎥 Technique</h3><div class="xpj-sub">Caméras <small>(liste de CADRO : reprise par CADRO, STORYBOARDO et PLANO)</small></div><table class="xpj-t">' + F.tech.cams.map((c, i) => '<tr data-ci="' + i + '"><td style="width:48%">' + sel('', sensOpts, c.sid).replace('data-k=""', 'data-ck="sid"') + '</td><td><input data-ck="label" value="' + esc(c.label) + '" placeholder="Rôle (A cam, grue, steadicam…)"></td><td style="width:80px"><input data-ck="qty" type="number" min="1" value="' + esc(c.qty || 1) + '"></td><td><button data-cdel="' + i + '">✕</button></td></tr>').join('') + '</table><button id="xpj-cadd" class="xpj-sm">＋ Caméra</button>' +
            '<div class="xpj-sub">Objectifs</div><div class="xpj-chips">' + (typeof XOPT !== 'undefined' ? XOPT.lenses : []).map(l => '<label class="' + (F.tech.lenses.includes(l[0]) ? 'on' : '') + '"><input type="checkbox" data-lens="' + l[0] + '"' + (F.tech.lenses.includes(l[0]) ? ' checked' : '') + '>' + esc(l[1]) + ' <small>' + esc(l[2] + ' · ' + l[3]) + '</small></label>').join('') + '</div>' +
            '<div class="xpj-grid" style="margin-top:12px"><label class="xpj-f"><span>Cadence</span>' + sel('tech.fps', [['23.976', '23,976 i/s'], ['24', '24 i/s'], ['25', '25 i/s'], ['29.97', '29,97 i/s'], ['30', '30 i/s'], ['50', '50 i/s'], ['59.94', '59,94 i/s'], ['60', '60 i/s']], F.tech.fps) + '</label>' +
            '<label class="xpj-f"><span>Format d\'image</span>' + sel('tech.aspect', (typeof XOPT !== 'undefined' ? XOPT.aspect : [['1.7778', '16:9']]), F.tech.aspect) + '</label><label class="xpj-f"><span>Définition</span>' + sel('tech.rec', (typeof XOPT !== 'undefined' ? XOPT.rec : [['3840', 'UHD']]), F.tech.rec) + '</label>' + I('tech.codec', ['Codec / enregistrement', 'ProRes 422 HQ, X-OCN…']) +
            I('tech.audio', ['Son', 'Mixette 8 pistes, 4 HF…'], 'text', 'w2') + I('tech.notes', ['Notes techniques', 'Liaisons HF, régie, LUT…'], 'text', 'w2') + '</div></section>' +
            // ----- équipe
            '<section id="xpj-h"><h3>👥 Équipe <small class="xpj-dim">— reprise dans CALL SHEETO, TRANSPORTO (adresses → feuilles de route), RESSOURCO (contrats, DPAE : adresse et n° de sécu), DEVISO, l\'annuaire XIII…</small> <button type="button" id="xpj-postes" title="Créer ou retirer des postes">⚙️ Postes</button></h3><div class="xpj-tw"><table class="xpj-t xpj-team"><tr><th>Prénom</th><th>Nom</th><th>Équipe</th><th>Poste</th><th>E-mail</th><th>Téléphone</th><th>Adresse</th><th>N° Sécu</th><th></th></tr>' + F.team.map((m, i) => { tsplit(m); return '<tr data-ti="' + i + '"><td><input data-tk="prenom" value="' + esc(m.prenom) + '" placeholder="Prénom"></td><td><input data-tk="nom" value="' + esc(m.nom) + '" placeholder="Nom"></td><td>' + sel('', DEPTS, m.dept || deptOf(m.role)).replace('data-k=""', 'data-tk="dept"') + '</td><td><input data-tk="role" value="' + esc(m.role) + '" list="xpj-roles" placeholder="Poste"></td><td><input data-tk="email" value="' + esc(m.email) + '" type="email"></td><td><input data-tk="phone" value="' + esc(m.phone) + '" type="tel"></td><td><input data-tk="address" class="xpj-addr' + (m.lat ? ' ok' : '') + '" value="' + esc(m.address) + '" placeholder="Adresse (domicile)" title="' + (m.lat ? 'Adresse localisée ✓' : 'Tapez puis choisissez l\'adresse proposée') + '"></td><td><input data-tk="secu" class="xpj-secu" value="' + esc(m.secu) + '" placeholder="1 85 05 …" inputmode="numeric" autocomplete="off" title="N° de sécurité sociale (15 chiffres) — reste dans ce projet, repris seulement par RESSOURCO"></td><td><button data-tdel="' + i + '">✕</button></td></tr>'; }).join('') + '</table></div><datalist id="xpj-roles">' + postes().map(r => '<option value="' + esc(r) + '">').join('') + '</datalist>' +
            '<div class="xpj-row"><button id="xpj-tadd" class="xpj-sm">＋ Personne</button><button id="xpj-tbook" class="xpj-sm">📇 Ajouter depuis l\'annuaire (' + J(KB, []).length + ')</button></div></section>' +
            // ----- outils
            '<section id="xpj-o"><h3>🗂️ Nom du projet dans chaque outil</h3><p class="xpj-dim">Par défaut, chaque outil prend le nom du projet. Personnalisez-le si besoin (ex. « Conducteur — direct du 17 »). Le nom s\'applique à l\'ouverture de l\'outil, sauf si vous l\'y avez changé à la main.</p><div class="xpj-grid">' + TOOLS.map(t => '<label class="xpj-f"><span>' + t[1] + '</span><input data-name="' + t[0] + '" value="' + esc(F.names[t[0]] || '') + '" placeholder="' + esc(F.title || 'Nom du projet') + '"></label>').join('') + '</div>' +
            '</section>' +
            '<section id="xpj-p"><h3>🖼️ Personnalisation <small class="xpj-dim">— pour toute l\'équipe, par le ☁️ Drive</small></h3><div id="xpj-pcfg"></div></section>' +
            (typeof XCHARTE !== 'undefined' ? '<section id="xpj-c"><h3>🎨 Charte graphique des PDF <small class="xpj-dim">— une même identité sur tous les PDF du projet</small></h3><div id="xpj-chost"></div></section>' : '') +
            // ----- fichier
            '<section id="xpj-f"><h3>📦 Fichier du projet</h3><p class="xpj-dim">Tout le projet — tous les outils, fiches, annuaire, photos — dans un seul fichier <b>.xiii</b> : pour changer d\'ordinateur, archiver ou transmettre.</p><div class="xpj-row"><button id="xpj-exp" class="xpj-main">⬇️ Exporter le projet (.xiii)</button><button id="xpj-importo" title="Importer depuis Excel / Google Sheets, Movie Magic, StudioBinder, feuilles de service ou devis PDF">📥 Importer d\'un logiciel</button><button id="xpj-imp">📂 Importer un projet XIII…</button>' + (typeof XWS !== 'undefined' && XWS.id !== 'main' ? '<button id="xpj-wsdel" title="Efface toutes les données de ce projet XIII sur cet appareil">🗑 Supprimer ce projet XIII</button>' : '') + '</div><div id="xpj-fst" class="xpj-dim"></div></section>' +
            '</div></div>';
        wire(); try { if (typeof XPCFG !== 'undefined') XPCFG.mount(ov.querySelector('#xpj-pcfg')); } catch (e) { }
    }
    function wire() {
        const q = s => ov.querySelector(s), qa = s => ov.querySelectorAll(s);
        qa('[data-k]').forEach(i => i.addEventListener('input', () => { set(i.dataset.k, i.value); if (i.dataset.k === 'title') qa('[data-name]').forEach(n => n.placeholder = i.value || 'Nom du projet'); }));
        qa('[data-type]').forEach(b => b.onclick = () => { F.ptype = b.dataset.type; F.genre = TYPES.find(t => t[0] === F.ptype)[2]; F.dtype = TYPES.find(t => t[0] === F.ptype)[3]; redraw(); });
        q('#xpj-logo').onclick = () => q('#xpj-lf').click();
        q('#xpj-cov').onclick = e => { if (e.target.id === 'xpj-crm') { e.preventDefault(); e.stopPropagation(); delete F.cover; delete F.coverB; q('#xpj-cov').textContent = 'Choisir une image…'; return; } q('#xpj-cf').click(); };
        q('#xpj-cf').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 600 / im.height, 1400 / im.width), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); F.cover = c.toDataURL('image/jpeg', .8);
            const b = document.createElement('canvas'), w = 900, h = Math.round(w * .32); b.width = w; b.height = h; const x = b.getContext('2d'), s2 = Math.max(w / im.width, h / im.height) * 1.15, dw = im.width * s2, dh = im.height * s2; x.filter = 'blur(16px) saturate(1.2)'; x.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh); x.filter = 'none'; const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(10,8,6,.25)'); g.addColorStop(1, 'rgba(10,8,6,.62)'); x.fillStyle = g; x.fillRect(0, 0, w, h); F.coverB = b.toDataURL('image/jpeg', .75);
            q('#xpj-cov').innerHTML = '<img src="' + F.cover + '"><a href="#" id="xpj-crm" title="Retirer la couverture">✕</a>'; }; im.src = r.result; }; r.readAsDataURL(f); };
        q('#xpj-lf').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 300 / im.height, 800 / im.width), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); F.logo = c.toDataURL('image/png'); q('#xpj-logo').innerHTML = '<img src="' + F.logo + '">'; }; im.src = r.result; }; r.readAsDataURL(f); };
        const rows = (attr, arr, key) => qa('[data-' + attr + ']').forEach(tr => { const o = arr[+tr.dataset[attr]]; tr.querySelectorAll('[data-' + key + ']').forEach(i => i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'input', () => { o[i.dataset[key]] = i.type === 'number' ? (+i.value || 1) : i.value; if (key === 'tk' && i.dataset.tk === 'role') { const d = tr.querySelector('[data-tk=dept]'); if (d && !o._deptSet) { o.dept = deptOf(i.value); d.value = o.dept; } } if (key === 'tk' && i.dataset.tk === 'dept') o._deptSet = 1; })); });
        rows('li', F.locs, 'lk');
        const gm = r => { F.lat = r.lat; F.lon = r.lon; F.ville = r.a.city || r.a.town || r.a.village || ''; F.cp = r.a.postcode || ''; F.adresse = r.addr; if (!F.lieu || document.activeElement === q('[data-k=lieu]')) F.lieu = r.name || F.lieu || r.addr; redraw(); toastX('📍 Lieu localisé'); };
        ['[data-k=lieu]', '[data-k=adresse]'].forEach(sq => { const i = q(sq); if (i) geoAttach(i, gm); });
        qa('[data-li]').forEach(tr => { const l = F.locs[+tr.dataset.li]; ['name', 'address'].forEach(k => { const i = tr.querySelector('[data-lk=' + k + ']'); geoAttach(i, r => { l.lat = r.lat; l.lon = r.lon; l.address = r.addr; if (!l.name || k === 'name') l.name = r.name || l.name || r.addr; redraw(); }); }); });
 rows('ci', F.tech.cams, 'ck'); rows('ti', F.team, 'tk');
        qa('[data-ti]').forEach(tr => { const m = F.team[+tr.dataset.ti], i = tr.querySelector('[data-tk=address]'); tr.querySelectorAll('[data-tk=prenom],[data-tk=nom]').forEach(x => x.addEventListener('input', () => { m.name = tname(m); })); if (i) { i.addEventListener('input', () => { delete m.lat; delete m.lon; i.classList.remove('ok'); }); geoAttach(i, r => { m.address = r.addr; m.lat = r.lat; m.lon = r.lon; i.value = r.addr; i.classList.add('ok'); }); } const sc = tr.querySelector('[data-tk=secu]'); if (sc) sc.addEventListener('change', () => { const d = sc.value.replace(/\s/g, ''); sc.classList.toggle('bad', !!d && !/^[12378][0-9]{2}(0[1-9]|1[0-2]|[2-9][0-9])(2[AB]|[0-9]{2})[0-9]{6}([0-9]{2})?$/i.test(d)); }); });
        if (q('#xpj-postes')) q('#xpj-postes').onclick = () => { const cur = (J(POSK, []) || []).join('\n'); const v = prompt('Postes personnalisés, un par ligne (ils s\'ajoutent à la liste des postes de tous les projets) :', cur); if (v == null) return; try { localStorage.setItem(POSK, JSON.stringify(v.split(/\n|;/).map(x => x.trim()).filter(Boolean))); } catch (e) { } redraw('#xpj-h'); };
        qa('[data-ldel]').forEach(b => b.onclick = () => { F.locs.splice(+b.dataset.ldel, 1); redraw(); }); qa('[data-cdel]').forEach(b => b.onclick = () => { F.tech.cams.splice(+b.dataset.cdel, 1); redraw(); }); qa('[data-tdel]').forEach(b => b.onclick = () => { F.team.splice(+b.dataset.tdel, 1); redraw(); });
        q('#xpj-ladd').onclick = () => { F.locs.push({ name: '', address: '', note: '' }); redraw('#xpj-l'); }; q('#xpj-cadd').onclick = () => { F.tech.cams.push({ sid: '', label: '', qty: 1 }); redraw('#xpj-t'); }; q('#xpj-tadd').onclick = () => { F.team.push({ name: '', prenom: '', nom: '', role: '', dept: '', phone: '', email: '', address: '', secu: '' }); redraw('#xpj-h'); };
        qa('[data-lens]').forEach(c => c.onchange = () => { const L = F.tech.lenses; if (c.checked) { if (!L.includes(c.dataset.lens)) L.push(c.dataset.lens); } else F.tech.lenses = L.filter(x => x !== c.dataset.lens); c.parentElement.classList.toggle('on', c.checked); });
        qa('[data-name]').forEach(i => i.addEventListener('input', () => { const v = i.value.trim(); if (v) F.names[i.dataset.name] = v; else delete F.names[i.dataset.name]; }));
        q('#xpj-tbook').onclick = pickBook;
        if (q('#xpj-chost')) { CH = CH || XCHARTE.raw(); XCHARTE.form(q('#xpj-chost'), CH, v => { CH = v; CHD = true; }); }
        const wsPaint = c => { XWS.set(XWS.id, { color: c }); q('.xpj-wsd') && (q('.xpj-wsd').style.background = c); ov.querySelectorAll('[data-wsc]').forEach(b => b.classList.toggle('on', b.dataset.wsc.toLowerCase() === c.toLowerCase())); const ci = q('#xpj-wscol'); if (ci) ci.value = c; };
        ov.querySelectorAll('[data-wsc]').forEach(b => b.onclick = () => wsPaint(b.dataset.wsc)); if (q('#xpj-wscol')) q('#xpj-wscol').oninput = e => wsPaint(e.target.value);
        if (q('#xpj-wsdel')) q('#xpj-wsdel').onclick = () => { const n = (XWS.meta() || {}).name || 'ce projet'; if (!confirm('Supprimer définitivement le projet XIII « ' + n + ' » sur cet appareil ?\n\nToutes ses données (outils, fiche, connexion Drive, équipe) seront effacées. Pensez à l\'exporter en .xiii avant.')) return; const i = XWS.id; close(); XWS.remove(i); XWS.go('main'); };
        q('#xpj-x').onclick = () => { if (dirtyF() && !confirm('Fermer sans enregistrer les modifications ?')) return; close(); };
        q('#xpj-save').onclick = () => { save(); close(); };
        q('#xpj-save1').onclick = () => { save(); };
        const sw = q('#xpj-sw'); if (sw) sw.onchange = () => { const v = sw.value; if (!v) return; if (dirtyF() && !confirm('Changer de projet sans enregistrer les modifications ?')) { sw.value = ''; return; }
            if (v === '__ws' || v.startsWith('ws:')) { close(); XWS.go(v === '__ws' ? XWS.create().id : v.slice(3)); return; } if (v === '__new' && typeof XGUIDE !== 'undefined') { close(); setTimeout(() => XGUIDE.start(), 50); return; } if (v === '__new') { F = null; const s = state(); s.active = ''; localStorage.setItem(KP, JSON.stringify(s)); } else { const s = state(); s.active = v; localStorage.setItem(KP, JSON.stringify(s)); } header(); open(); };
        if (q('#xpj-new')) q('#xpj-new').onclick = () => { if (typeof XGUIDE !== 'undefined') { if (dirtyF()) save(true); close(); setTimeout(() => XGUIDE.start(), 50); return; } if (!F.title && !F.production) { toastX('Remplissez d\'abord ce projet'); return; } if (dirtyF()) save(true); const s = state(); s.active = ''; localStorage.setItem(KP, JSON.stringify(s)); header(); open(); };
        if (q('#xpj-importo')) q('#xpj-importo').onclick = () => { // 📥 IMPORTO, intégré à la fiche projet
            document.querySelectorAll('#xim-ov').forEach(x => x.remove()); const o = document.createElement('div'); o.id = 'xim-ov';
            o.innerHTML = '<div class="xim"><div class="xim-h"><b>📥 Importer depuis un logiciel du métier</b><button aria-label="Fermer">✕</button></div><iframe src="importo.html?embed=1" title="Import"></iframe></div>';
            document.body.appendChild(o); o.querySelector('button').onclick = () => o.remove(); o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); });
            if (!document.getElementById('xim-css')) { const st = document.createElement('style'); st.id = 'xim-css'; st.textContent = '#xim-ov{position:fixed;inset:0;z-index:10400;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:14px}.xim{width:min(1200px,100%);height:min(860px,100%);display:flex;flex-direction:column;background:var(--bg-menu,#232327);border:1px solid var(--border-color,#555);border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6)}.xim-h{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border-bottom:1px solid var(--border-color,#444);color:var(--text-main,#eee);font:14px "Segoe UI",sans-serif}.xim-h button{background:none;border:0;color:inherit;font-size:16px;cursor:pointer}.xim iframe{flex:1;border:0;width:100%}'; document.head.appendChild(st); }
        };
        q('#xpj-exp').onclick = async () => { const st = q('#xpj-fst'); if (typeof XBUNDLE === 'undefined') { st.textContent = 'Indisponible ici'; return; } save(true); st.textContent = '⏳ Rassemblement des données…'; try { const n = F.title || 'Projet XIII', B = await XBUNDLE.build(n), blob = await XBUNDLE.pack(B), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = n.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.xiii'; document.body.appendChild(a); a.click(); a.remove(); st.textContent = '✅ Fichier enregistré (' + Math.max(1, Math.round(blob.size / 1024)) + ' Ko).'; } catch (e) { st.textContent = '⚠️ ' + (e.message || e); } };
        q('#xpj-imp').onclick = () => { if (typeof XBUNDLE === 'undefined') return; XBUNDLE.panel(); setTimeout(() => { const b = document.querySelector('#xb-imp'); if (b) b.click(); }, 50); };
        F._snap = F._snap || snap();
    }
    const snap = () => JSON.stringify(Object.assign({}, F, { _snap: undefined }));
    const dirtyF = () => (F && F._snap && snap() !== F._snap) || CHD;
    function redraw(anchor) { const b = ov.querySelector('.xpj-body'), y = b ? b.scrollTop : 0, s = F._snap; draw(); F._snap = s; const nb = ov.querySelector('.xpj-body'); nb.scrollTop = y; if (anchor) { const el = ov.querySelector(anchor + ' table tr:last-child input'); if (el) el.focus(); } }
    // ---------- recherche d'adresses (même moteur que REPERO : OpenStreetMap / Nominatim) ----------
    let geoT = null, geoBox = null, geoSeq = 0;
    const fmtAddr = a => { const st = [a.house_number, a.road || a.pedestrian || a.square || a.place].filter(Boolean).join(' '), city = a.city || a.town || a.village || a.municipality || ''; return [st, [a.postcode, city].filter(Boolean).join(' ')].filter(Boolean).join(', '); };
    function geoClose() { if (geoBox) geoBox.remove(); geoBox = null; }
    function geoAttach(inp, pick) {
        inp.setAttribute('autocomplete', 'off');
        inp.addEventListener('input', () => { clearTimeout(geoT); const v = inp.value.trim(); if (v.length < 3) { geoClose(); return; } geoT = setTimeout(() => geoSearch(inp, v, pick), 550); });
        inp.addEventListener('keydown', e => { if (!geoBox) return; const it = [...geoBox.querySelectorAll('.xpj-gi')], i = it.findIndex(x => x.classList.contains('on')); if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); it.forEach(x => x.classList.remove('on')); const n = it[(i + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length]; if (n) n.classList.add('on'); } else if (e.key === 'Enter' && i >= 0) { e.preventDefault(); it[i].click(); } else if (e.key === 'Escape') { e.stopPropagation(); geoClose(); } });
        inp.addEventListener('blur', () => setTimeout(geoClose, 200));
    }
    async function geoSearch(inp, v, pick) {
        const my = ++geoSeq; let res = [];
        try { const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=fr&q=' + encodeURIComponent(v)); res = (await r.json() || []).map(x => ({ lat: +x.lat, lon: +x.lon, name: x.name || '', label: x.display_name, addr: fmtAddr(x.address || {}) || x.display_name, a: x.address || {} })); } catch (e) { res = null; }
        if (my !== geoSeq || document.activeElement !== inp) return; geoClose();
        geoBox = document.createElement('div'); geoBox.id = 'xpj-geo'; const R = inp.getBoundingClientRect(); geoBox.style.cssText = 'left:' + R.left + 'px;top:' + (R.bottom + 2) + 'px;width:' + Math.max(R.width, 340) + 'px';
        geoBox.innerHTML = res === null ? '<div class="xpj-gx">⚠️ Recherche indisponible (connexion ?)</div>' : res.length ? res.map((x, i) => '<div class="xpj-gi" data-i="' + i + '"><b>' + esc(x.name || x.addr) + '</b><small>' + esc(x.label) + '</small></div>').join('') + '<div class="xpj-gx">© OpenStreetMap</div>' : '<div class="xpj-gx">Aucun résultat</div>';
        document.body.appendChild(geoBox);
        geoBox.querySelectorAll('.xpj-gi').forEach(el => el.onmousedown = e => { e.preventDefault(); const x = res[+el.dataset.i]; geoClose(); pick(x); });
    }
    function pickBook() {
        const book = J(KB, []), have = new Set(F.team.map(m => fold(m.name)));
        const p = document.createElement('div'); p.id = 'xpj-pick'; p.innerHTML = '<div class="xpj-pk"><b>📇 Annuaire XIII</b><input id="xpj-pq" placeholder="Rechercher…"><div id="xpj-pl"></div><div class="xpj-row"><button id="xpj-pok" class="xpj-main">Ajouter la sélection</button><button id="xpj-pno">Annuler</button></div></div>'; ov.appendChild(p);
        const list = () => { const qv = fold(p.querySelector('#xpj-pq').value); p.querySelector('#xpj-pl').innerHTML = book.filter(c => !qv || fold(c.name + ' ' + c.role + ' ' + c.company).includes(qv)).slice(0, 300).map((c, i) => '<label><input type="checkbox" value="' + book.indexOf(c) + '"' + (have.has(fold(c.name)) ? ' disabled checked' : '') + '><b>' + esc(c.name) + '</b> <small>' + esc([c.role, c.phone].filter(Boolean).join(' · ')) + '</small></label>').join('') || '<p class="xpj-dim">Annuaire vide.</p>'; };
        list(); p.querySelector('#xpj-pq').oninput = list; p.querySelector('#xpj-pno').onclick = () => p.remove();
        p.querySelector('#xpj-pok').onclick = () => { p.querySelectorAll('input[type=checkbox]:checked:not(:disabled)').forEach(c => { const x = book[+c.value]; F.team.push(tsplit({ name: x.name || '', prenom: x.prenom, nom: x.nom, role: x.role || '', dept: x.dept || deptOf(x.role), phone: x.phone || '', email: x.email || '', address: x.address || '', lat: x.lat, lon: x.lon, _deptSet: 1 })); }); p.remove(); redraw('#xpj-h'); };
    }
    function toastX(m) { try { if (typeof toast === 'function') return toast(m); } catch (e) { } let t = document.getElementById('xpj-toast'); if (!t) { t = document.createElement('div'); t.id = 'xpj-toast'; document.body.appendChild(t); } t.textContent = m; t.className = 'show'; clearTimeout(t._t); t._t = setTimeout(() => t.className = '', 2600); }
    // ---------- enregistrer et appliquer ----------
    function save(quiet) {
        const f = JSON.parse(JSON.stringify(F)); delete f._snap; f.title = String(f.title || '').trim();
        f.team = f.team.map(m => { tsplit(m); m.name = tname(m); return m; }).filter(m => m.name || m.role).map(m => { const o = { name: m.name, prenom: m.prenom, nom: m.nom, role: m.role, dept: m.dept || deptOf(m.role), phone: m.phone, email: m.email, address: m.address || '' }; if (m.address && m.lat != null) { o.lat = +m.lat; o.lon = +m.lon; } if (m.secu) o.secu = String(m.secu).replace(/[^0-9AB ]/gi, '').trim(); return o; });
        f.locs = f.locs.filter(l => l.name || l.address); f.tech.cams = f.tech.cams.filter(c => c.sid || c.label);
        const t = TYPES.find(x => x[0] === f.ptype); if (t) { f.genre = t[2]; f.dtype = t[3]; }
        f.contact = [f.contactName, f.contactPhone, f.contactEmail].map(x => String(x || '').trim()).filter(Boolean).join(' · ');
        if (!write(f)) return; F = JSON.parse(JSON.stringify(f)); F._snap = snap();
        // annuaire
        try { const book = J(KB, []); let n = 0; f.team.forEach(m => { if (!m.name) return; const k = fold(m.name), e = fold(m.email); let c = book.find(x => (e && fold(x.email) === e) || fold(x.name) === k); if (!c) { c = { id: 'c' + Math.random().toString(36).slice(2, 10), name: m.name, role: '', phone: '', email: '', address: '', company: '', notes: '', dept: '' }; book.push(c); n++; } ['role', 'phone', 'email', 'dept', 'address', 'prenom', 'nom', 'lat', 'lon'].forEach(x => { if (m[x] != null && m[x] !== '') c[x] = m[x]; }); if (!c.company && f.production) c.company = f.production; c.projects = Array.from(new Set((c.projects || []).concat(f.title ? [f.title] : []))); }); localStorage.setItem(KB, JSON.stringify(book)); } catch (e) { }
        // CADRO : caméra et objectif par défaut (repris aussi par STORYBOARDO et PLANO)
        try { const cs = J('cadro.state', null) || (f.tech.cams.some(c => c.sid) ? { S: {} } : null); const cam = f.tech.cams.find(c => c.sid); if (cs && cs.S && (cam || f.tech.lenses.length)) { const s = typeof XOPT !== 'undefined' && cam ? XOPT.sens.find(x => x[0] === cam.sid) : null; if (cam && s && cam.sid !== cs.S.sid) Object.assign(cs.S, { sid: s[0], name: s[1], sw: s[3], sh: s[4], srw: s[5], srh: s[6], cfa: s[7] || 'bayer' }); if (f.tech.lenses[0] && !cs.S.lens) cs.S.lens = f.tech.lenses[0]; cs.S.fps = +f.tech.fps || cs.S.fps; cs.S.aspect = +f.tech.aspect || cs.S.aspect; cs.S.recW = +f.tech.rec || cs.S.recW; localStorage.setItem('cadro.state', JSON.stringify(cs)); } } catch (e) { }
        if (CHD && typeof XCHARTE !== 'undefined' && CH) { XCHARTE.save(CH); CHD = false; }
        { const sv = seen(), o = sv && sv.id === f.id ? sv.snap || {} : null; if (o && APP !== 'index') { const now = snapOf(f), ks = WATCH.map(w => w[0]).filter(k => o[k] !== now[k]); if (ks.length) importChanges(f, ks, o); else markSeen(f); } else if (APP !== 'index') markSeen(f); }
        applyHere(true);
        if (!quiet) toastX('✓ Projet « ' + (f.title || 'sans titre') + ' » enregistré : les outils le reprennent à leur ouverture');
    }
    // ---------- dans chaque outil : nom propre, DOSSIER, CADRO ----------
    function nameTarget() { try { if (typeof P === 'undefined' || !P) return null; if (P.prod && typeof P.prod === 'object' && 'name' in P.prod) return [P.prod, 'name']; if (typeof P.name === 'string') return [P, 'name']; } catch (e) { } return null; }
    function applyHere(now) {
        const f = active(); if (!f || !APP || APP === 'index' || APP === 'jour') return;
        const K = 'xiii.projet.applied.' + APP, done = J(K, {}); if (!now && done.id === f.id && done.rev === f.rev) return;
        let changed = false;
        const want = (f.names && f.names[APP]) || f.title;
        if (want && APP !== 'dossier') { const t = nameTarget(); if (t) { const cur = t[0][t[1]] || ''; const forced = !!(f.names && f.names[APP]) && (done.forced !== want || done.rev !== f.rev); if (forced || !cur || cur === done.name || /^(projet|sans titre|nouveau projet)/i.test(cur)) { if (cur !== want) { t[0][t[1]] = want; changed = true; const inp = document.getElementById('project-name'); if (inp) inp.value = want; } } } }
        if (APP === 'dossier' && typeof P !== 'undefined' && P) {
            try { if (P.pristine && f.dtype && typeof makeProject === 'function' && typeof TEMPLATES !== 'undefined' && TEMPLATES[f.dtype]) { const np = makeProject(f.dtype, want || f.title || ''); const i = ALL.indexOf(P); if (i >= 0) ALL[i] = np; else ALL.push(np); P = np; if (typeof closeModal === 'function') closeModal(); changed = true; toastX('📚 Dossier « ' + (np.name) + ' » créé : modèle ' + (TEMPLATES[f.dtype].label || f.dtype)); }
                else if (!P.pristine && P.cover && !P.cover.title && want) { P.cover.title = want; changed = true; }
                if (P.cover) { ['production', 'realisation', 'producteur', 'diffuseur'].forEach(k => { const src = k === 'diffuseur' ? f.client : f[k]; if (src && !P.cover[k]) { P.cover[k] = src; changed = true; } }); } } catch (e) { console.warn(e); }
        }
        if (APP === 'cadro' && typeof S !== 'undefined' && S && f.tech) { try { const cam = (f.tech.cams || []).find(c => c.sid); if (cam && S.sid !== cam.sid && typeof applySensor === 'function' && typeof CD_SENS !== 'undefined') { const s = CD_SENS.find(x => x.id === cam.sid); if (s) { applySensor(s); changed = true; } } if (f.tech.lenses && f.tech.lenses[0] && !S.lens) { S.lens = f.tech.lenses[0]; changed = true; } if (+f.tech.fps && S.fps !== +f.tech.fps) { S.fps = +f.tech.fps; changed = true; } } catch (e) { } }
        // CALL SHEETO : équipe et lieux dans chaque journée · REPERO : lieux à repérer (sans réajouter ce que vous avez supprimé)
        const pushed = Object.assign({ team: [], locs: [] }, done.pushed || {}), locList = [].concat(f.lieu || f.adresse ? [{ name: f.lieu || f.adresse, address: f.adresse || '', note: f.acces || '', main: 1, lat: f.lat, lon: f.lon }] : [], f.locs || []).filter(l => l.name || l.address);
        const ltype = n => { const x = fold(n); return /base|regie|qg/.test(x) ? 'base' : /parking.*(tech|camion)|camion/.test(x) ? 'park_tech' : /parking/.test(x) ? 'park' : /cantine|catering|repas/.test(x) ? 'cantine' : /loge|hmc|maquill/.test(x) ? 'loges' : /rdv|rendez/.test(x) ? 'rdv' : /rassemblement/.test(x) ? 'rassemblement' : 'decor'; };
        const mkid = () => (typeof uid === 'function' ? uid() : Math.random().toString(36).slice(2, 10));
        if (APP === 'callsheeto' && typeof P !== 'undefined' && P && Array.isArray(P.days)) {
            try {
                const team = (f.team || []).filter(m => m.name && pushed.team.indexOf(fold(m.name)) < 0), locs = locList.filter(l => pushed.locs.indexOf(fold(l.name || l.address)) < 0);
                P.days.forEach(d => {
                    d.crew = d.crew || []; d.locations = d.locations || [];
                    team.forEach(m => { if (!d.crew.some(c => fold(c.name) === fold(m.name))) { d.crew.push({ id: mkid(), dept: m.dept || deptOf(m.role), role: m.role || '', name: m.name, phone: m.phone || '', email: m.email || '', call: '', hmc: '', note: '' }); changed = true; } });
                    locs.forEach(l => { const n = l.name || l.address; if (!d.locations.some(x => fold(x.name) === fold(n) || (l.address && fold(x.address) === fold(l.address)))) { d.locations.push({ id: mkid(), type: l.main ? 'decor' : ltype(n), name: n, address: l.address || '', lat: l.lat != null ? +l.lat : null, lon: l.lon != null ? +l.lon : null, tz: '', access: l.note || '', contact: '', phone: '', code: '' }); changed = true; } });
                });
                team.forEach(m => pushed.team.push(fold(m.name))); locs.forEach(l => pushed.locs.push(fold(l.name || l.address)));
                if (!P.company && f.production) { P.company = f.production; changed = true; } if (!P.director && f.realisation) { P.director = f.realisation; changed = true; } if (!P.producer && f.producteur) { P.producer = f.producteur; changed = true; }
                if (changed) toastX('📋 Projet XIII : équipe et lieux ajoutés aux journées');
            } catch (e) { console.warn(e); }
        }
        if (APP === 'repero' && typeof P !== 'undefined' && P && Array.isArray(P.spots) && typeof blankSpot === 'function') {
            try { const locs = locList.filter(l => pushed.locs.indexOf(fold(l.name || l.address)) < 0); locs.forEach(l => { const n = l.name || l.address; if (!P.spots.some(x => fold(x.name) === fold(n))) { P.spots.push(blankSpot(Object.assign({ name: n, address: l.address || '', notes: l.note || '' }, l.lat != null ? { lat: +l.lat, lon: +l.lon } : {}))); changed = true; } pushed.locs.push(fold(n)); }); if (changed) { try { dirty(); } catch (e) { } toastX('📍 Projet XIII : lieux ajoutés (à placer sur la carte)'); } } catch (e) { console.warn(e); }
        }
        if (changed) { try { if (typeof saveProject === 'function') saveProject(false); else if (typeof saveState === 'function') saveState(false); } catch (e) { } try { if (typeof renderAll === 'function') renderAll(); else if (typeof render === 'function') render(); } catch (e) { } }
        const t = nameTarget(); try { localStorage.setItem(K, JSON.stringify({ id: f.id, rev: f.rev, name: t ? t[0][t[1]] : want, forced: f.names && f.names[APP] || '', pushed })); } catch (e) { }
    }

    // ---------- fiche modifiée ailleurs (accueil, autre outil) : proposer l'import ----------
    const WATCH = [['title', 'Nom du projet'], ['genre', 'Type'], ['production', 'Société de production'], ['client', 'Client / diffuseur'], ['realisation', 'Réalisation'], ['producteur', 'Direction de production'], ['debut', 'Début du tournage'], ['fin', 'Fin du tournage'], ['diffusion', 'Diffusion / événement'], ['duree', 'Format / durée'], ['lieu', 'Lieu principal'], ['adresse', 'Adresse'], ['contact', 'Contact production'], ['acces', 'Accès & infos pratiques']];
    const KSEEN = () => 'xiii.projet.seen.' + APP;
    const snapOf = f => { const o = {}; WATCH.forEach(([k]) => o[k] = f && f[k] != null ? String(f[k]) : ''); return o; };
    const seen = () => J(KSEEN(), null);
    const markSeen = f => { try { localStorage.setItem(KSEEN(), JSON.stringify({ id: f.id, snap: snapOf(f), at: Date.now() })); } catch (e) { } };
    const fmtV = (k, v) => !v ? '—' : /^(debut|fin|diffusion)$/.test(k) && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : String(v).length > 60 ? String(v).slice(0, 57) + '…' : String(v);
    const dd = (a, b) => Math.round((Date.parse(a + 'T12:00:00') - Date.parse(b + 'T12:00:00')) / 864e5);
    const addDay = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
    // conséquences propres à chaque outil : { preview(f, old, keys) → texte, apply(f, old, keys) → bool }
    const ADAPT = {
        planno: {
            ok: () => typeof P !== 'undefined' && P && Array.isArray(P.tasks) && P.tasks.length,
            plan(f, o, keys) {
                const out = { shift: 0, tour: null, diff: null }; const T = P.tasks;
                if ((keys.includes('debut') || keys.includes('fin')) && f.debut) {
                    const tour = T.filter(t => t.phase === 'tournage' && !t.ms).sort((a, b) => String(a.start).localeCompare(String(b.start)));
                    const ref = (o.debut && keys.includes('debut')) ? o.debut : (tour[0] ? tour[0].start : '');
                    out.shift = ref ? dd(f.debut, ref) : 0; out.tour = [f.debut, f.fin && f.fin >= f.debut ? f.fin : f.debut]; out.n = tour.length;
                }
                if (keys.includes('diffusion') && f.diffusion) out.diff = f.diffusion;
                return out;
            },
            preview(f, o, keys) { const x = this.plan(f, o, keys), L = []; if (x.shift) L.push('le planning est décalé de ' + (x.shift > 0 ? '+' : '') + x.shift + ' jour' + (Math.abs(x.shift) > 1 ? 's' : '') + ' (tâches non terminées)'); if (x.tour) L.push('le tournage passe du ' + fmtV('debut', x.tour[0]) + ' au ' + fmtV('fin', x.tour[1])); if (x.diff) L.push('le jalon de diffusion passe au ' + fmtV('diffusion', x.diff)); return L; },
            apply(f, o, keys) {
                const x = this.plan(f, o, keys), T = P.tasks, mk = () => (typeof uid === 'function' ? uid() : Math.random().toString(36).slice(2, 10));
                if (x.shift) T.forEach(t => { if (t.status === 'done') return; if (t.start) t.start = addDay(t.start, x.shift); if (t.end) t.end = addDay(t.end, x.shift); });
                if (x.tour) { const tour = T.filter(t => t.phase === 'tournage' && !t.ms).sort((a, b) => String(a.start).localeCompare(String(b.start))); if (tour.length === 1) { tour[0].start = x.tour[0]; tour[0].end = x.tour[1]; } else if (!tour.length) T.push({ id: mk(), name: 'Tournage', phase: 'tournage', start: x.tour[0], end: x.tour[1], who: [], status: 'todo' }); else { tour[0].start = x.tour[0]; const last = tour[tour.length - 1]; if (last.end < x.tour[1] || last.start > x.tour[1]) last.end = x.tour[1] >= last.start ? x.tour[1] : last.start; } }
                if (x.diff) { const m = T.find(t => t.ms && /diffus|antenne|evenement|événement|live/i.test(t.name || '')); if (m) { m.start = m.end = x.diff; } else T.push({ id: mk(), name: 'Diffusion', phase: 'livraison', start: x.diff, end: x.diff, who: [], status: 'todo', ms: true }); }
                return !!(x.shift || x.tour || x.diff);
            }
        }
    };
    async function importChanges(f, keys, o) {
        const n0 = APP; let msgs = [];
        try { const A = ADAPT[APP]; if (A && A.ok() && A.apply(f, o || {}, keys)) msgs.push('planning'); } catch (e) { console.warn(e); }
        if (keys.includes('title')) { try { const t = nameTarget(), want = (f.names && f.names[APP]) || f.title; if (t && want && APP !== 'dossier' && t[0][t[1]] !== want) { t[0][t[1]] = want; const inp = document.getElementById('project-name'); if (inp) inp.value = want; msgs.push('nom'); } } catch (e) { } }
        try { if (typeof XProj !== 'undefined' && XProj.syncKeys) { const c = XProj.current && XProj.current(); let ch = null; if (c && c.id === f.id) ch = await XProj.syncKeys(f, keys); else if (!c && XProj.link) ch = await XProj.link(f, 'force'); if (ch && ch.length) msgs = msgs.concat(ch); } } catch (e) { console.warn(e); }
        applyHere(true);
        try { if (typeof saveProject === 'function') saveProject(false); else if (typeof saveState === 'function') saveState(false); } catch (e) { }
        try { if (typeof renderAll === 'function') renderAll(); else if (typeof render === 'function') render(); } catch (e) { }
        markSeen(f); return msgs;
    }
    let asking = false;
    function check() {
        const f = active(); if (!f || !APP || APP === 'index') return;
        const sv = seen();
        if (!sv || sv.id !== f.id) { applyHere(false); markSeen(f); return; } // première fois, ou autre projet : rien à demander
        const now = snapOf(f), keys = WATCH.map(w => w[0]).filter(k => (sv.snap || {})[k] !== now[k]);
        if (!keys.length || asking) return;
        ask(f, sv.snap || {}, keys);
    }
    function ask(f, o, keys) {
        asking = true; const old = document.getElementById('xpj-ask'); if (old) old.remove();
        const A = ADAPT[APP]; let extra = []; try { if (A && A.ok()) extra = A.preview(f, o, keys); } catch (e) { }
        const nm = (TOOLS.find(t => t[0] === APP) || [0, APP.toUpperCase()])[1];
        const d = document.createElement('div'); d.id = 'xpj-ask';
        d.innerHTML = '<div class="xpj-ak"><div class="xpj-akh"><b>🎬 Le projet « ' + esc(f.title || 'sans titre') + ' » a été modifié</b><small>depuis votre dernière visite dans ' + esc(nm) + '</small></div>' +
            '<table>' + keys.map(k => '<tr><td><label><input type="checkbox" data-k="' + k + '" checked> ' + esc((WATCH.find(w => w[0] === k) || [k, k])[1]) + '</label></td><td class="o">' + esc(fmtV(k, o[k])) + '</td><td>→</td><td class="n">' + esc(fmtV(k, f[k])) + '</td></tr>').join('') + '</table>' +
            (extra.length ? '<div class="xpj-akx">Dans cet outil : ' + extra.map(esc).join(' · ') + '</div>' : '') +
            '<div class="xpj-akb"><button data-a="no" title="Garder les réglages actuels de l\'outil et ne plus proposer ces changements">Ignorer</button><button data-a="later" title="Reposer la question à la prochaine ouverture">Plus tard</button><button data-a="ok" class="ok">⬇️ Importer les nouveaux réglages</button></div></div>';
        document.body.appendChild(d);
        const close = () => { d.remove(); asking = false; };
        d.querySelector('[data-a=no]').onclick = () => { markSeen(f); close(); };
        d.querySelector('[data-a=later]').onclick = close;
        d.querySelector('[data-a=ok]').onclick = async () => { const ks = [...d.querySelectorAll('[data-k]:checked')].map(i => i.dataset.k); close(); if (!ks.length) { markSeen(f); return; } const m = await importChanges(f, ks, o); markSeen(f); toastX('✓ Réglages du projet importés' + (m.length ? ' : ' + [...new Set(m)].join(', ') : '')); };
    }
    // ---------- annuaire en lecture ----------
    function book() {
        const B = J(KB, []), f = active(), inTeam = new Set(((f && f.team) || []).map(m => fold(m.name)));
        const old = document.getElementById('xpj-bk'); if (old) old.remove();
        const o = document.createElement('div'); o.id = 'xpj-bk'; document.body.appendChild(o);
        const draw = q => {
            const Q = fold(q || ''), L = B.filter(c => !Q || fold([c.name, c.role, c.company, c.phone, c.email].join(' ')).includes(Q));
            const by = {}; L.forEach(c => { const d = c.dept || deptOf(c.role); (by[d] = by[d] || []).push(c); });
            const order = DEPTS.map(d => d[0]);
            o.querySelector('.xpj-bkl').innerHTML = L.length ? Object.keys(by).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(d => '<div class="xpj-bkd">' + esc((DEPTS.find(x => x[0] === d) || [0, 'Autre'])[1]) + ' · ' + by[d].length + '</div>' + by[d].sort((a, b) => fold(a.name).localeCompare(fold(b.name))).map(c => '<div class="xpj-bkc"><div><b>' + esc(c.name || '—') + '</b>' + (inTeam.has(fold(c.name)) ? ' <span class="xpj-tag">équipe du projet</span>' : '') + '<small>' + esc([c.role, c.company].filter(Boolean).join(' · ')) + '</small></div><div class="xpj-bka">' + (c.phone ? '<a href="tel:' + esc(String(c.phone).replace(/[^\d+]/g, '')) + '">📞 ' + esc(c.phone) + '</a>' : '') + (c.email ? '<a href="mailto:' + esc(c.email) + '">✉️ ' + esc(c.email) + '</a>' : '') + '</div></div>').join('')).join('') : '<p class="xpj-dim" style="text-align:center;padding:30px">' + (B.length ? 'Aucun contact ne correspond.' : 'L\'annuaire est vide : ajoutez l\'équipe dans Projet XIII.') + '</p>';
        };
        o.innerHTML = '<div class="xpj-bkb"><div class="xpj-bkh"><div><small>ANNUAIRE XIII</small><b>' + B.length + ' contact' + (B.length > 1 ? 's' : '') + '</b></div><input type="search" placeholder="Rechercher un nom, un rôle…"><button class="xpj-main" id="xpj-bke">✏️ Modifier l\'annuaire</button><button id="xpj-bkx" title="Fermer">✕</button></div><div class="xpj-bkl"></div></div>';
        draw(''); o.querySelector('input').oninput = e => draw(e.target.value);
        const close = () => { o.remove(); document.removeEventListener('keydown', k, true); }, k = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
        document.addEventListener('keydown', k, true); o.addEventListener('mousedown', e => { if (e.target === o) close(); });
        o.querySelector('#xpj-bkx').onclick = close; o.querySelector('#xpj-bke').onclick = () => { close(); open('h'); };
    }
    // ---------- styles ----------
    function css() {
        if (document.getElementById('xpj-css')) return; const s = document.createElement('style'); s.id = 'xpj-css';
        s.textContent = '#xpj-name{color:rgb(240,179,120);font-weight:800;margin-left:12px;padding-left:12px;border-left:1px solid rgba(240,179,120,.4);cursor:pointer;max-width:42vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:.02em}#xpj-name:hover{text-decoration:underline}' +
            '.xpj-btn{border-color:rgba(240,179,120,.9)!important;background:linear-gradient(135deg,rgba(240,179,120,.35),rgba(240,179,120,.15))!important;color:inherit;font-weight:700!important;box-shadow:0 0 0 1px rgba(240,179,120,.25),0 2px 12px rgba(240,179,120,.18)}.xpj-btn:hover{background:rgba(240,179,120,.45)!important}' +
            '#xpj-ov{position:fixed;inset:0;z-index:10080;background:rgba(0,0,0,.7);display:flex;align-items:stretch;justify-content:center;padding:2vh 2vw;font:13.5px/1.5 "Segoe UI",system-ui,sans-serif}' +
            '.xpj-box{position:relative;width:min(1180px,100%);background:var(--bg-menu,#202024);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:12px;display:grid;grid-template-rows:auto auto 1fr;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6)}' +
            '.xpj-head{display:flex;gap:16px;align-items:flex-end;justify-content:space-between;padding:16px 20px 12px;border-bottom:1px solid var(--border-color,#3a3a3f);flex-wrap:wrap;background:linear-gradient(90deg,rgba(240,179,120,.12),transparent 60%)}#xpj-x{position:absolute!important;top:12px;right:14px;z-index:3;width:34px;height:34px;padding:0!important;display:flex;align-items:center;justify-content:center;border-radius:50%!important;font-size:15px}.xpj-head{padding-right:60px!important}.xpj-wsd{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;vertical-align:0;box-shadow:0 0 8px currentColor}.xpj-wsc{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:4px 0 12px}.xpj-wsc>span{font-weight:700;margin-right:6px}.xpj-wsc small{font-weight:400;opacity:.65;margin-left:4px}.xpj-wsc button{width:24px;height:24px;padding:0!important;border-radius:50%!important;border:2px solid transparent!important;cursor:pointer}.xpj-wsc button.on{border-color:#fff!important;box-shadow:0 0 0 2px rgba(240,179,120,.7),0 0 12px currentColor}.xpj-wsc label{display:inline-flex}.xpj-wsc input[type=color]{width:30px;height:26px;padding:0;border:1px solid var(--border-color,#555);border-radius:8px;background:none;cursor:pointer}.xpj-head small{display:block;font:800 11px/1 "Segoe UI",sans-serif;letter-spacing:.2em;color:rgb(240,179,120);margin-bottom:6px}' +
            '#xpj-title{font:800 clamp(20px,3vw,30px)/1.1 "Segoe UI",sans-serif!important;background:transparent!important;border:0!important;border-bottom:2px solid rgba(240,179,120,.5)!important;color:rgb(240,179,120)!important;padding:2px 0!important;min-width:min(520px,80vw);border-radius:0!important;outline:0}' +
            '.xpj-ha{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.xpj-box button,.xpj-box select{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#4a4a50);border-radius:8px;padding:7px 12px;cursor:pointer}.xpj-box button.xpj-main{border-color:rgb(240,179,120);background:rgba(240,179,120,.3);font-weight:700}.xpj-box .xpj-sm{padding:5px 10px;font-size:12.5px}' +
            '.xpj-nav{display:flex;gap:4px;padding:8px 20px;border-bottom:1px solid var(--border-color,#3a3a3f);overflow-x:auto}.xpj-nav a{padding:5px 12px;border-radius:99px;text-decoration:none;color:var(--text-dim,#aaa);white-space:nowrap}.xpj-nav a:hover{background:rgba(240,179,120,.15);color:inherit}' +
            '.xpj-body{overflow:auto;padding:6px 20px 30px;scroll-behavior:smooth}.xpj-body section{padding:18px 0;border-bottom:1px solid var(--border-color,#333)}.xpj-body h3{margin:0 0 12px;font-size:16px}.xpj-dim{color:var(--text-dim,#999);font-size:12.5px}.xpj-sub{margin:14px 0 6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim,#999)}' +
            '.xpj-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px 14px}.xpj-f{display:flex;flex-direction:column;gap:4px;min-width:0}.xpj-f>span{font-size:11.5px;color:var(--text-dim,#aaa)}.xpj-f.w2{grid-column:span 2}.xpj-f.w3{grid-column:span 3}.xpj-f.w4{grid-column:1/-1}' +
            '.xpj-box input,.xpj-box textarea,.xpj-t select,.xpj-f select{width:100%;box-sizing:border-box;background:var(--bg-input,#17171a);color:inherit;border:1px solid var(--border-color,#45454b);border-radius:6px;padding:7px 9px;font:inherit}.xpj-box textarea{min-height:60px;resize:vertical}' +
            '.xpj-types{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:6px}.xpj-types button{padding:9px 14px;font-size:14px}.xpj-types button.on{border-color:rgb(240,179,120);background:rgba(240,179,120,.28);font-weight:700}' +
            '.xpj-logo{display:flex;align-items:center;justify-content:center;height:46px;border:1px dashed var(--border-color,#555);border-radius:6px;cursor:pointer;background:#fff;color:#888;font-size:12px;overflow:hidden}.xpj-logo img{max-height:42px;max-width:100%}.xpj-cov{position:relative;background:#222!important}.xpj-cov img{max-height:46px!important;width:100%;object-fit:cover}.xpj-cov a{position:absolute;top:3px;right:5px;color:#fff;text-decoration:none;font-size:12px;background:rgba(0,0,0,.5);border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center}' +
            '.xpj-tw{overflow-x:auto}.xpj-team{min-width:1100px}.xpj-team td:nth-child(7){min-width:200px}.xpj-addr.ok{border-color:#81c784!important}.xpj-secu{-webkit-text-security:disc;font-family:monospace!important}.xpj-secu:focus{-webkit-text-security:none}.xpj-secu.bad{border-color:#e57373!important}#xpj-postes{font-size:11px;padding:2px 8px;margin-left:6px}' + '.xpj-t{width:100%;border-collapse:collapse}.xpj-t th{text-align:left;font-size:11px;color:var(--text-dim,#999);font-weight:600;padding:4px}.xpj-t td{padding:3px 4px}.xpj-t button{padding:5px 9px}.xpj-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}' +
            '.xpj-chips{display:flex;flex-wrap:wrap;gap:6px}.xpj-chips label{display:inline-flex;gap:6px;align-items:center;border:1px solid var(--border-color,#45454b);border-radius:99px;padding:4px 10px;cursor:pointer;font-size:12.5px}.xpj-chips label.on{border-color:rgb(240,179,120);background:rgba(240,179,120,.18)}.xpj-chips input{width:auto!important}.xpj-chips small{color:var(--text-dim,#999)}' +
            '#xpj-pick{position:absolute;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:2}.xpj-pk{width:min(520px,92%);max-height:80%;display:flex;flex-direction:column;gap:8px;background:var(--bg-menu,#26262b);border:1px solid var(--border-color,#555);border-radius:10px;padding:16px}#xpj-pl{overflow:auto;display:flex;flex-direction:column;gap:2px}#xpj-pl label{display:flex;gap:8px;align-items:center;padding:4px}#xpj-pl input{width:auto}' +
            '#xpj-bk{position:fixed;inset:0;z-index:10080;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:3vh 3vw;font:13.5px/1.5 "Segoe UI",system-ui,sans-serif}.xpj-bkb{width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--bg-menu,#202024);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:12px;overflow:hidden}.xpj-bkh{display:flex;gap:10px;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border-color,#3a3a3f);flex-wrap:wrap;background:linear-gradient(90deg,rgba(240,179,120,.12),transparent 60%)}.xpj-bkh small{display:block;font:800 11px/1 "Segoe UI",sans-serif;letter-spacing:.2em;color:rgb(240,179,120)}.xpj-bkh b{font-size:18px}.xpj-bkh input{flex:1;min-width:160px;background:var(--bg-input,#17171a);color:inherit;border:1px solid var(--border-color,#45454b);border-radius:6px;padding:7px 9px;font:inherit}.xpj-bkh button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#4a4a50);border-radius:8px;padding:7px 12px;cursor:pointer}.xpj-bkh button.xpj-main{border-color:rgb(240,179,120);background:rgba(240,179,120,.3);font-weight:700}.xpj-bkl{overflow:auto;padding:4px 16px 16px}.xpj-bkd{margin:14px 0 4px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim,#999)}.xpj-bkc{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid var(--border-color,#333);flex-wrap:wrap}.xpj-bkc small{display:block;color:var(--text-dim,#999)}.xpj-bka{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:12.5px}.xpj-bka a{color:inherit;text-decoration:none;opacity:.85}.xpj-bka a:hover{opacity:1;text-decoration:underline}.xpj-tag{font-size:10.5px;border:1px solid rgba(240,179,120,.6);color:rgb(240,179,120);border-radius:99px;padding:0 6px;margin-left:4px}' +
            '#xpj-geo{position:fixed;z-index:10200;background:var(--bg-menu,#26262b);color:var(--text-main,#eee);border:1px solid var(--border-color,#555);border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.5);max-height:320px;overflow:auto;font:13px "Segoe UI",system-ui,sans-serif}.xpj-gi{padding:7px 10px;cursor:pointer;border-bottom:1px solid var(--border-color,#333)}.xpj-gi:hover,.xpj-gi.on{background:rgba(240,179,120,.18)}.xpj-gi b{display:block}.xpj-gi small{display:block;color:var(--text-dim,#999);font-size:11.5px}.xpj-gx{padding:6px 10px;font-size:11px;color:var(--text-dim,#888)}' +
            '#xpj-ask{position:fixed;inset:0;z-index:10085;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font:13.5px/1.45 "Segoe UI",system-ui,sans-serif}.xpj-ak{width:min(620px,100%);max-height:90vh;overflow:auto;background:var(--bg-menu,#222226);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.6);padding:16px 18px}.xpj-akh b{display:block;font-size:16px}.xpj-akh small{color:var(--text-dim,#999)}.xpj-ak table{width:100%;border-collapse:collapse;margin:12px 0}.xpj-ak td{padding:5px 6px;border-bottom:1px solid var(--border-soft,#333);vertical-align:top}.xpj-ak td.o{color:var(--text-dim,#999);text-decoration:line-through}.xpj-ak td.n{color:rgb(240,179,120);font-weight:600}.xpj-ak label{display:flex;gap:6px;align-items:center;cursor:pointer;white-space:nowrap}.xpj-akx{background:rgba(240,179,120,.1);border:1px solid rgba(240,179,120,.35);border-radius:8px;padding:8px 10px;font-size:12.5px}.xpj-akb{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}.xpj-akb button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:7px 14px;cursor:pointer}.xpj-akb .ok{background:rgba(240,179,120,.3);border-color:rgb(240,179,120);font-weight:700}' +
            '#xpj-toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#333;color:#fff;padding:9px 16px;border-radius:8px;z-index:10090;opacity:0;transition:opacity .2s;pointer-events:none}#xpj-toast.show{opacity:1}' +
            '@media(max-width:760px){.xpj-grid{grid-template-columns:1fr 1fr}.xpj-f.w3{grid-column:1/-1}#xpj-ov{padding:0}.xpj-box{border-radius:0}}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; css();
        const go = () => {
            header();
            if (app === 'index') { const b = document.querySelector('#top-bar button[onclick="XBUNDLE.panel()"], #top-bar button[onclick="XPROJET.open()"]'); if (b) { b.setAttribute('onclick', 'XPROJET.open()'); b.title = 'Projet XIII : nom, type, informations, technique, équipe, export / import du projet'; b.className = (b.className + ' xpj-btn').trim(); b.innerHTML = '<span>🎬</span><span>Projet XIII</span>'; } }
            setTimeout(check, 1800);
            try { if (typeof XWS !== 'undefined' && (XWS.meta() || {}).fresh) { XWS.set(XWS.id, { fresh: 0 }); if (!active()) setTimeout(() => { if (typeof XGUIDE !== 'undefined') XGUIDE.start(); else open(); }, 900); } } catch (e) { }
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
        window.addEventListener('storage', e => { if (e.key === KP) { header(); setTimeout(check, 300); } });
    }
    // ✨ démarrage guidé : crée la fiche complète d'un coup (mêmes effets qu'un enregistrement de la fiche)
    function create(d) {
        F = Object.assign(blank(), { team: [], locs: [], names: {}, ptype: '' }, d || {});
        F.tech = Object.assign({ cams: [], lenses: [], fps: '25', aspect: '1.7778', rec: '3840', codec: '', audio: '', notes: '' }, (d && d.tech) || {});
        F._snap = ''; save(true); return active();
    }
    return { init, open, close, book, active, create, TYPES, ROLES, DEPTS };
})();

XPROJET.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XGUIDE : ✨ démarrage guidé d'un projet
//  Questionnaire court (type, nom, dates, lieu, caméras, équipe) → fiche Projet XIII complète
//  (les outils la reprennent : titres, dates, lieux, équipe dans l'annuaire et CALL SHEETO, caméras dans CADRO…)
//  + un ordre de travail proposé selon le type de production, suivi sur l'accueil et rappelé dans chaque outil.
// =====================================================================
const XGUIDE = (() => {
    let APP = '';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const NM = { decoup: ['✂️', 'DECOUP', 'Découper le scénario en séquences et plans'], casto: ['🎭', 'CASTO', 'Trouver et réunir les talents'], repero: ['📍', 'REPERO', 'Repérer les lieux'], storyboardo: ['🖼️', 'STORYBOARDO', 'Dessiner les plans clés'], moodo: ['🎨', 'MOODO', 'Poser l\'univers visuel'], planno: ['📅', 'PLANNO', 'Bâtir le planning de production (planning type d\'après vos dates)'], deviso: ['💶', 'DEVISO', 'Chiffrer le devis'], ressourco: ['📑', 'RESSOURCO', 'Rassembler contrats et autorisations'], callsheeto: ['📋', 'CALL SHEETO', 'Préparer les feuilles de service (équipe et lieux déjà ajoutés)'], packingo: ['🧳', 'PACKINGO', 'Lister et coliser le matériel'], transporto: ['🚐', 'TRANSPORTO', 'Organiser trajets, navettes et hébergements'], scripto: ['📝', 'SCRIPTO', 'Suivre le tournage plan par plan'], backupo: ['💽', 'BACKUPO', 'Décharger et sauvegarder les rushes'], posto: ['🎞️', 'POSTO', 'Suivre le montage et les retours'], soustitro: ['💬', 'SOUSTITRO', 'Sous-titrer les livrables'], encodo: ['🔄', 'ENCODO', 'Convertir les fichiers livrés'], dossier: ['📚', 'DOSSIER', 'Assembler le dossier final'], conduco: ['🎬', 'CONDUCO', 'Écrire le conducteur minuté'], syno: ['🔀', 'SYNO', 'Dessiner le synoptique technique (caméras, régie)'], plano: ['📐', 'PLANO', 'Faire le plan d\'implantation du plateau'], lumo: ['💡', 'LUMO', 'Plan de feu et patch lumière'], sono: ['🎚️', 'SONO', 'Fiche son, patch et HF'], runo: ['🔴', 'RUNO', 'Piloter le direct'], graphico: ['🎛️', 'GRAPHICO', 'Préparer les habillages à l\'antenne'], cadro: ['🎯', 'CADRO', 'Choisir caméras et objectifs'] };
    const ORDER = {
        fiction: ['decoup', 'storyboardo', 'casto', 'repero', 'planno', 'deviso', 'ressourco', 'callsheeto', 'packingo', 'transporto', 'scripto', 'backupo', 'posto', 'dossier'],
        doc: ['repero', 'planno', 'deviso', 'ressourco', 'callsheeto', 'packingo', 'transporto', 'backupo', 'posto', 'soustitro', 'dossier'],
        tv: ['conduco', 'syno', 'plano', 'lumo', 'sono', 'graphico', 'planno', 'deviso', 'callsheeto', 'packingo', 'transporto', 'runo', 'posto', 'dossier'],
        live: ['syno', 'plano', 'lumo', 'sono', 'conduco', 'graphico', 'planno', 'deviso', 'callsheeto', 'packingo', 'transporto', 'runo', 'backupo', 'dossier'],
        pub: ['moodo', 'storyboardo', 'casto', 'repero', 'planno', 'deviso', 'ressourco', 'callsheeto', 'packingo', 'scripto', 'backupo', 'posto', 'dossier'],
        corporate: ['moodo', 'repero', 'planno', 'deviso', 'callsheeto', 'packingo', 'backupo', 'posto', 'soustitro', 'dossier'],
        event: ['plano', 'syno', 'lumo', 'sono', 'conduco', 'planno', 'deviso', 'callsheeto', 'packingo', 'transporto', 'runo', 'dossier'],
        artistique: ['moodo', 'storyboardo', 'repero', 'planno', 'deviso', 'ressourco', 'callsheeto', 'posto', 'dossier'],
        libre: ['planno', 'deviso', 'callsheeto', 'packingo', 'dossier']
    };
    const KG = () => { const s = J('xiii.projets', null); return s && s.active ? 'xiii.guide.' + s.active : null; };
    const guide = () => { const k = KG(); return k ? J(k, null) : null; };
    // ---------- questionnaire ----------
    let D = null, step = 0, ov = null;
    function start() {
        D = { ptype: '', title: '', debut: '', fin: '', diffusion: '', lieu: '', adresse: '', cams: 1, production: '', realisation: '', team: [{ name: '', role: '' }] }; step = 0;
        if (ov) ov.remove(); ov = document.createElement('div'); ov.id = 'xg-ov'; document.body.appendChild(ov); ov.addEventListener('mousedown', e => { if (e.target === ov) close(); }); draw();
    }
    const close = () => { if (ov) ov.remove(); ov = null; };
    const STEPS = ['Type', 'Dates et lieu', 'Technique', 'Équipe', 'C\'est parti'];
    function read() {
        if (!ov) return; ov.querySelectorAll('[data-f]').forEach(i => { D[i.dataset.f] = i.type === 'number' ? Math.max(0, Math.min(40, +i.value || 0)) : i.value; });
        const rows = [...ov.querySelectorAll('.xg-tm')]; if (rows.length) D.team = rows.map(r => ({ name: r.querySelector('[data-n]').value.trim(), role: r.querySelector('[data-r]').value.trim() }));
    }
    function draw() {
        const T = typeof XPROJET !== 'undefined' ? XPROJET.TYPES : [], R = typeof XPROJET !== 'undefined' && XPROJET.ROLES ? XPROJET.ROLES : [];
        let body = '';
        if (step === 0) body = '<h4>Quel type de production ?</h4><div class="xg-types">' + T.map(t => '<button data-t="' + t[0] + '" class="' + (D.ptype === t[0] ? 'on' : '') + '">' + esc(t[1]) + '</button>').join('') + '</div><label>Nom du projet<input data-f="title" value="' + esc(D.title) + '" placeholder="ex. Concert Khaled — Olympia"></label>';
        if (step === 1) body = '<h4>Quand et où ?</h4><div class="xg-g"><label>Début du tournage<input type="date" data-f="debut" value="' + esc(D.debut) + '"></label><label>Fin du tournage<input type="date" data-f="fin" value="' + esc(D.fin) + '"></label><label>Diffusion / livraison <small>(facultatif)</small><input type="date" data-f="diffusion" value="' + esc(D.diffusion) + '"></label><label>Lieu principal<input data-f="lieu" value="' + esc(D.lieu) + '" placeholder="ex. Olympia"></label><label class="w">Adresse<input data-f="adresse" value="' + esc(D.adresse) + '" placeholder="28 boulevard des Capucines, Paris"></label></div>';
        if (step === 2) body = '<h4>Combien de caméras ?</h4><div class="xg-cam"><button data-c="-1">−</button><input type="number" data-f="cams" value="' + D.cams + '" min="0" max="40"><button data-c="1">＋</button><span>' + (D.cams > 1 ? 'caméras' : 'caméra') + '</span></div><p class="xg-d">Le nombre est repris dans la fiche technique du projet (vous choisirez les modèles et objectifs dans 🎯 CADRO).</p><div class="xg-g"><label>Société de production<input data-f="production" value="' + esc(D.production) + '"></label><label>Réalisation<input data-f="realisation" value="' + esc(D.realisation) + '"></label></div>';
        if (step === 3) body = '<h4>Qui est dans l\'équipe ?</h4><p class="xg-d">Nom et poste : l\'équipe est ajoutée à l\'annuaire et aux journées de CALL SHEETO. Vous pourrez compléter plus tard.</p><datalist id="xg-roles">' + R.map(r => '<option value="' + esc(r) + '">').join('') + '</datalist>' + D.team.map((m, i) => '<div class="xg-tm"><input data-n value="' + esc(m.name) + '" placeholder="Prénom Nom"><input data-r list="xg-roles" value="' + esc(m.role) + '" placeholder="Poste"><button data-del="' + i + '">✕</button></div>').join('') + '<button id="xg-add" class="xg-s">＋ Ajouter une personne</button>';
        if (step === 4) { const L = ORDER[D.ptype] || ORDER.libre; body = '<h4>Votre ordre de travail</h4><p class="xg-d">Proposé pour « ' + esc((T.find(t => t[0] === D.ptype) || [0, 'ce projet'])[1]) + ' ». Il s\'affiche sur l\'accueil et chaque outil vous indique l\'étape suivante. Vous pouvez décocher ce qui ne vous concerne pas.</p><div class="xg-ord">' + L.map((a, i) => '<label><input type="checkbox" data-o="' + a + '" checked><b>' + (i + 1) + '</b> ' + NM[a][0] + ' <b>' + NM[a][1] + '</b> <small>' + esc(NM[a][2]) + '</small></label>').join('') + '</div>'; }
        ov.innerHTML = '<div class="xg-box"><div class="xg-h"><b>✨ Nouveau projet guidé</b><span class="xg-x">✕</span></div><div class="xg-steps">' + STEPS.map((s, i) => '<span class="' + (i === step ? 'on' : i < step ? 'ok' : '') + '">' + (i < step ? '✓' : i + 1) + ' ' + s + '</span>').join('') + '</div><div class="xg-b">' + body + '</div><div class="xg-f">' + (step ? '<button id="xg-prev" class="xg-s">← Retour</button>' : '<span></span>') + '<button id="xg-next" class="ok">' + (step < 4 ? 'Suivant →' : '✨ Créer le projet') + '</button></div></div>';
        ov.querySelector('.xg-x').onclick = close;
        ov.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { read(); D.ptype = b.dataset.t; draw(); });
        ov.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { read(); D.cams = Math.max(0, Math.min(40, D.cams + +b.dataset.c)); draw(); });
        ov.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { read(); D.team.splice(+b.dataset.del, 1); if (!D.team.length) D.team.push({ name: '', role: '' }); draw(); });
        const add = ov.querySelector('#xg-add'); if (add) add.onclick = () => { read(); D.team.push({ name: '', role: '' }); draw(); const n = ov.querySelectorAll('[data-n]'); n[n.length - 1].focus(); };
        const pv = ov.querySelector('#xg-prev'); if (pv) pv.onclick = () => { read(); step--; draw(); };
        ov.querySelector('#xg-next').onclick = () => {
            read();
            if (step === 0 && !D.ptype) return msg('Choisissez un type de production');
            if (step === 0 && !D.title.trim()) { msg('Donnez un nom au projet'); return ov.querySelector('[data-f=title]').focus(); }
            if (step === 1 && D.fin && D.debut && D.fin < D.debut) return msg('La fin du tournage est avant le début');
            if (step < 4) { step++; draw(); return; }
            finish([...ov.querySelectorAll('[data-o]:checked')].map(i => i.dataset.o));
        };
        const f = ov.querySelector('input:not([type=checkbox])'); if (f && step !== 4) f.focus();
    }
    function msg(m) { try { if (typeof toast === 'function') return toast(m); } catch (e) { } let t = ov.querySelector('.xg-m'); if (!t) { t = document.createElement('div'); t.className = 'xg-m'; ov.querySelector('.xg-f').prepend(t); } t.textContent = m; }
    function finish(order) {
        const team = D.team.filter(m => m.name || m.role);
        const f = XPROJET.create({ title: D.title.trim(), ptype: D.ptype, debut: D.debut, fin: D.fin || D.debut, diffusion: D.diffusion, lieu: D.lieu, adresse: D.adresse, production: D.production, realisation: D.realisation, team, tech: { cams: D.cams ? [{ sid: '', label: D.cams > 1 ? D.cams + ' caméras' : 'Caméra', qty: D.cams }] : [] } });
        if (f) W('xiii.guide.' + f.id, { order, done: {}, at: Date.now(), type: D.ptype });
        if (f && window.XMODELS && D.ptype && D.ptype !== 'libre') try { localStorage.setItem('xiii.models.offer', JSON.stringify({ type: D.ptype, at: Date.now() })); setTimeout(() => { if (APP !== 'index') XMODELS.offer(); }, 700); } catch (e) { }
        close(); try { if (typeof renderGuide === 'function') renderGuide(); } catch (e) { } home();
        try { if (typeof toast === 'function') toast('✨ Projet « ' + D.title + ' » créé — suivez l\'ordre de travail'); } catch (e) { }
        try { if (typeof renderProject === 'function') renderProject(); else if (APP === 'index') setTimeout(() => location.reload(), 600); } catch (e) { }
    }
    // ---------- accueil : carte « ordre de travail » ----------
    function home() {
        if (APP !== 'index') return; const g = guide(); let c = document.getElementById('xg-card');
        if (!g) { if (c) c.remove(); return; }
        const anchor = document.getElementById('ui-proj') ? document.getElementById('ui-proj').closest('.title-row') : document.querySelector('main, .container, body');
        if (!c) { c = document.createElement('div'); c.id = 'xg-card'; if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(c, anchor.nextSibling); else document.body.prepend(c); }
        const n = g.order.filter(a => g.done[a]).length, next = g.order.find(a => !g.done[a]);
        c.innerHTML = '<div class="xg-ch"><b>✨ Ordre de travail</b><span>' + n + ' / ' + g.order.length + ' étapes ouvertes</span><button id="xg-hide" title="Masquer ce suivi">✕</button></div><div class="xg-bar"><i style="width:' + Math.round(100 * n / Math.max(1, g.order.length)) + '%"></i></div><div class="xg-list">' +
            g.order.map((a, i) => '<a href="' + a + '.html" class="' + (g.done[a] ? 'ok' : a === next ? 'next' : '') + '"><b>' + (g.done[a] ? '✓' : i + 1) + '</b>' + NM[a][0] + ' ' + NM[a][1] + '<small>' + esc(NM[a][2]) + '</small></a>').join('') + '</div>';
        c.querySelector('#xg-hide').onclick = () => { if (!confirm('Masquer l\'ordre de travail de ce projet ?')) return; localStorage.removeItem(KG()); home(); };
    }
    // ---------- dans un outil : étape cochée + rappel de l'étape suivante ----------
    function inTool() {
        const g = guide(); if (!g || g.order.indexOf(APP) < 0) return;
        const first = !g.done[APP]; g.done[APP] = Date.now(); W(KG(), g);
        if (!first) return;
        const i = g.order.indexOf(APP), next = g.order.slice(i + 1).find(a => !g.done[a]) || g.order.find(a => !g.done[a]);
        const b = document.createElement('div'); b.id = 'xg-ban';
        b.innerHTML = '<span>✨ Étape ' + (i + 1) + '/' + g.order.length + ' : <b>' + esc(NM[APP][2]) + '</b>' + (next ? ' · ensuite : ' + NM[next][0] + ' ' + NM[next][1] : ' · dernière étape !') + '</span>' + (next ? '<a href="' + next + '.html">Étape suivante →</a>' : '') + '<button>✕</button>';
        document.body.appendChild(b); b.querySelector('button').onclick = () => b.remove(); setTimeout(() => { if (b.parentNode) b.remove(); }, 14000);
    }
    function css() {
        const s = document.createElement('style'); s.id = 'xg-css';
        s.textContent = '#xg-ov{position:fixed;inset:0;z-index:2147483100;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;padding:16px;font:14px/1.5 "Segoe UI",system-ui,sans-serif}.xg-box{width:min(640px,100%);max-height:92vh;display:flex;flex-direction:column;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.7);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.6)}' +
            '.xg-h{display:flex;justify-content:space-between;padding:14px 18px 6px;font-size:17px}.xg-x{cursor:pointer;opacity:.7}.xg-steps{display:flex;gap:4px;padding:0 18px 10px;flex-wrap:wrap}.xg-steps span{font-size:11.5px;padding:3px 8px;border-radius:10px;background:rgba(128,128,128,.15);color:var(--text-dim,#aaa)}.xg-steps .on{background:rgba(240,179,120,.3);color:var(--text-main,#fff);font-weight:700}.xg-steps .ok{color:#81c784}' +
            '.xg-b{padding:4px 18px 12px;overflow:auto}.xg-b h4{margin:6px 0 10px;font-size:16px}.xg-d{color:var(--text-dim,#999);font-size:12.5px;margin:0 0 10px}.xg-b label{display:flex;flex-direction:column;gap:3px;font-size:12.5px;color:var(--text-dim,#aaa);margin:6px 0}.xg-g{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}.xg-g .w{grid-column:1/-1}' +
            '.xg-box input{font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:8px 10px}.xg-box button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:7px 12px;cursor:pointer;height:auto}.xg-box button.ok{background:rgba(240,179,120,.35);border-color:rgb(240,179,120);font-weight:700}' +
            '.xg-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:6px;margin-bottom:10px}.xg-types button{text-align:left;padding:10px 12px}.xg-types button.on{background:rgba(240,179,120,.3);border-color:rgb(240,179,120);font-weight:700}' +
            '.xg-cam{display:flex;align-items:center;gap:8px;margin-bottom:8px}.xg-cam input{width:80px;text-align:center;font-size:22px;font-weight:700}.xg-cam button{font-size:20px;width:44px}.xg-tm{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;margin-bottom:6px}' +
            '.xg-ord{display:flex;flex-direction:column;gap:2px}.xg-ord label{flex-direction:row;align-items:center;gap:8px;color:var(--text-main,#eee);font-size:13.5px;margin:0;padding:5px 6px;border-radius:6px}.xg-ord label:hover{background:rgba(128,128,128,.12)}.xg-ord small{color:var(--text-dim,#999)}' +
            '.xg-f{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 18px;border-top:1px solid var(--border-color,#3a3a40)}.xg-m{color:#ffb74d;font-size:12.5px;margin-right:auto}' +
            '#xg-card{margin:14px auto;max-width:1100px;background:var(--bg-panel,rgba(40,38,34,.9));border:1px solid rgba(240,179,120,.45);border-radius:14px;padding:12px 16px;font:13.5px/1.4 "Segoe UI",system-ui,sans-serif}.xg-ch{display:flex;gap:10px;align-items:center}.xg-ch span{color:var(--text-dim,#999);font-size:12.5px;margin-right:auto}.xg-ch button{background:none;border:0;color:inherit;opacity:.6;cursor:pointer}' +
            '.xg-bar{height:5px;background:rgba(128,128,128,.25);border-radius:3px;margin:8px 0 10px;overflow:hidden}.xg-bar i{display:block;height:100%;background:linear-gradient(90deg,#f0b378,#81c784)}.xg-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}.xg-list a{display:flex;flex-wrap:wrap;gap:4px;align-items:center;padding:7px 10px;border-radius:9px;border:1px solid var(--border-color,rgba(128,128,128,.3));color:inherit;text-decoration:none}.xg-list a b{min-width:18px}.xg-list a small{width:100%;color:var(--text-dim,#999);font-size:11.5px}.xg-list a.ok{opacity:.55}.xg-list a.ok b{color:#81c784}.xg-list a.next{border-color:rgb(240,179,120);background:rgba(240,179,120,.12)}' +
            '#xg-ban{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:10120;display:flex;gap:10px;align-items:center;background:#1f1d1a;color:#fff;border:1px solid rgb(240,179,120);border-radius:12px;padding:8px 12px;box-shadow:0 8px 30px rgba(0,0,0,.6);font:13px "Segoe UI",sans-serif;max-width:calc(100vw - 24px);flex-wrap:wrap}#xg-ban a{color:#f0b378;font-weight:700}#xg-ban button{background:none;border:0;color:#aaa;cursor:pointer}@media(max-width:600px){.xg-g{grid-template-columns:1fr}}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; css();
        const go = () => {
            if (APP === 'index') {
                const b = document.querySelector('.xpj-btn'); if (false && b && !document.getElementById('xg-btn')) { /* ✨ Nouveau projet : désormais dans 🎬 Projet XIII (doublon retiré de l'accueil) */ b.insertAdjacentHTML('beforebegin', '<button id="xg-btn" class="xpj-btn" title="Créer un projet en répondant à quelques questions : type, dates, lieu, caméras, équipe. Les outils sont pré-remplis et un ordre de travail est proposé."><span>✨</span><span>Nouveau projet</span></button>'); document.getElementById('xg-btn').onclick = start; }
                home();
            } else inTool();
        };
        XBOOT.ready(go, 700);
    }
    return { init, start };
})();

XGUIDE.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XFIND : recherche globale (Ctrl+K / ⌘K) dans toute la suite
//  • outils · commandes de la page (boutons) · contenu de tous les projets enregistrés dans ce navigateur
//    (localStorage + bases IndexedDB des outils, sans les images) · annuaire
//  • ouvrir un résultat d'un autre outil : APP.html#xfind=texte → l'outil s'ouvre et surligne le texte
// =====================================================================
const XFIND = (() => {
    const TOOLS = [['syno', '🔀', 'SYNO', 'Synoptiques'], ['plano', '📐', 'PLANO', 'Plans d\'implantation'], ['conduco', '🎬', 'CONDUCO', 'Conducteurs'], ['callsheeto', '📋', 'CALL SHEETO', 'Feuilles de service'], ['packingo', '🧳', 'PACKINGO', 'Listes de colisage'],
        ['backupo', '💽', 'BACKUPO', 'Sauvegarde des rushes'], ['deviso', '💶', 'DEVISO', 'Devis et budget'], ['ressourco', '📑', 'RESSOURCO', 'Documents administratifs'], ['repero', '📍', 'REPERO', 'Repérages'], ['moodo', '🎨', 'MOODO', 'Moodboards'],
        ['storyboardo', '🖼️', 'STORYBOARDO', 'Storyboards'], ['scripto', '📝', 'SCRIPTO', 'Script de tournage'], ['decoup', '✂️', 'DECOUP', 'Découpage et scénario'], ['cadro', '🎯', 'CADRO', 'Optique et cadre'], ['graphico', '🎛️', 'GRAPHICO', 'Habillage live'], ['dossier', '📚', 'DOSSIER', 'Dossier de production'], ['planno', '📅', 'PLANNO', 'Planning de production'], ['casto', '🎭', 'CASTO', 'Casting & talents'], ['posto', '🎞️', 'POSTO', 'Suivi de post-production'], ['sono', '🎚️', 'SONO', 'Fiche son, patch et plan HF'], ['lumo', '💡', 'LUMO', 'Plan de feu, DMX et puissance'], ['runo', '🔴', 'RUNO', 'Direct stream Twitch / YouTube'], ['transporto', '🚐', 'TRANSPORTO', 'Logistique, navettes, hôtels'], ['soustitro', '💬', 'SOUSTITRO', 'Sous-titres SRT / VTT'], ['encodo', '🔄', 'ENCODO', 'Convertir vidéo, audio, image, PDF (codec, débit, taille)'], ['ludo', '🎲', 'LUDO', 'Jeux'], ['matos', '📦', 'MATOS', 'Parc matériel, catalogue et réservations'], ['calendrier', '🗓️', 'CALENDRIER', 'Toutes les dates'], ['controle', '✅', 'CONTRÔLE', 'Vérification avant tournage'], ['drive', '☁️', 'DRIVE', 'Drive du projet (équipe)'], ['index', '🏠', 'ACCUEIL', 'Accueil de la suite']];
    const T = id => TOOLS.find(t => t[0] === id);
    const fold = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const RX = [['matosxiii', 'matos'], ['xiii.catalogue', 'catalogue'], ['soustitr', 'soustitro'], ['transporto', 'transporto'], ['runo', 'runo'], ['lumo', 'lumo'], ['sono', 'sono'], ['posto', 'posto'], ['casto', 'casto'], ['planno', 'planno'], ['callsheet', 'callsheeto'], ['conduc', 'conduco'], ['packing', 'packingo'], ['backup', 'backupo'], ['deviso', 'deviso'], ['ressourco', 'ressourco'], ['repero', 'repero'], ['moodo', 'moodo'], ['storyboard', 'storyboardo'], ['scripto', 'scripto'], ['decoup', 'decoup'], ['dossier', 'dossier'], ['graphico', 'graphico'], ['plano', 'plano'], ['cadro', 'cadro'], ['ludo', 'ludo'], ['syno', 'syno'], ['xbook', 'book'], ['annuaire', 'book'], ['xproj', 'fiche']];
    const appOfKey = k => { const f = fold(k); const m = RX.find(r => f.indexOf(r[0]) > -1); return m ? m[1] : ''; };
    const SKIPK = /^xiii\.(mod|sent|versions|tour|settings|asrun)|prefs|\.ui$|theme|_key$|anthropic|token/i;
    let APP = '', IDX = null, IDXAT = 0;
    // ---------- index du contenu ----------
    // type de l'objet qui contient le texte : 👤 personne, 📍 lieu, 📦 matériel
    function kindOf(o) { const k = Object.keys(o).join(' '); if (/\b(lat|lon|adresse_lieu|address|adresse|city|cp)\b/.test(k) && /\b(name|lieu|title)\b/.test(k)) return 'l'; if (/\b(phone|tel|telephone|email|prenom|fonction|ph|role|call|cachet|secu)\b/.test(k) && /\b(name|nom|n|prenom)\b/.test(k)) return 'p'; if (/\b(sn|kg|brand|model|inPorts|outPorts|inp|outp|units|qty|watt|w|univ|addr|mic|stand)\b/.test(k) && /\b(name|title|model|src|mic)\b/.test(k)) return 'm'; return ''; }
    function walk(v, path, out, depth, ctx) {
        if (out.length > 4000 || depth > 9 || v == null) return;
        if (typeof v === 'string') { if (v.length > 1 && v.length < 1500 && !/^data:|^blob:|^[A-Za-z0-9+/=]{200,}$/.test(v)) out.push([path, v, ctx || '']); return; }
        if (typeof v === 'number' || typeof v === 'boolean') return;
        if (Array.isArray(v)) { v.slice(0, 1500).forEach((x, i) => walk(x, path, out, depth + 1, ctx)); return; }
        if (typeof v === 'object' && !(v instanceof Blob) && !(v instanceof ArrayBuffer)) { const kc = kindOf(v) || (depth > 3 ? '' : ''); Object.keys(v).slice(0, 300).forEach(k => { if (/^(id|uid|src|img|image|thumb|blob|data|png|sig|svg|hash|md5|xxh|color|col|font|css|key|ref|tpl|type|kind|mime|fileId)$/i.test(k)) return; walk(v[k], k, out, depth + 1, kc && typeof v[k] === 'string' ? kc : ''); }); }
    }
    function nameOf(o) { if (!o || typeof o !== 'object') return ''; return o.name || o.title || o.titre || (o.cover && o.cover.title) || (o.meta && (o.meta.title || o.meta.name)) || (o.project && (o.project.name || o.project.title)) || ''; }
    async function build() {
        const docs = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i); if (!k || SKIPK.test(k)) continue; const raw = localStorage.getItem(k) || ''; if (raw.length < 3 || raw.length > 8e6) continue;
            let v; try { v = JSON.parse(raw); } catch (e) { v = raw; } const app = appOfKey(k); if (!app) continue;
            const L = []; walk(v, '', L, 0); if (L.length) docs.push({ app, key: k, name: nameOf(v), L });
        }
        const dbs = ['dossierXIII', 'reperoXIII', 'moodoXIII', 'storyboardoXIII', 'graphicoXIII'];
        for (const n of dbs) {
            try {
                const db = await new Promise((res, rej) => { const r = indexedDB.open(n); r.onsuccess = () => res(r.result); r.onerror = () => rej(); r.onupgradeneeded = () => { r.transaction.abort(); rej(); }; }).catch(() => null); if (!db) continue;
                for (const sn of Array.from(db.objectStoreNames)) { if (/file|img|image|blob|thumb|photo|media|ticket/i.test(sn)) continue; const vals = await new Promise(res => { const q = db.transaction(sn, 'readonly').objectStore(sn).getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => res([]); }); vals.slice(0, 200).forEach(v => { const L = []; walk(v, '', L, 0); if (L.length) docs.push({ app: appOfKey(n), key: n + '/' + sn, name: nameOf(v), L }); }); }
                db.close();
            } catch (e) { }
        }
        IDX = docs; IDXAT = Date.now(); return docs;
    }
    const LABELS = { name: 'nom', title: 'titre', titre: 'titre', nom: 'nom', prenom: 'prénom', role: 'rôle', fonction: 'fonction', email: 'e-mail', tel: 'tél.', telephone: 'tél.', phone: 'tél.', note: 'note', notes: 'notes', text: 'texte', label: 'libellé', lieu: 'lieu', adresse: 'adresse', addr: 'adresse', desc: 'description', company: 'société' };
    function searchData(q) {
        const W = fold(q).split(/\s+/).filter(Boolean); if (!W.length || !IDX) return [];
        const res = [];
        IDX.forEach(d => {
            let hits = 0; d.L.forEach(([path, s, ty]) => { if (FT && ty !== FT) return; if (hits >= 3) return; const f = fold(s); if (W.every(w => f.indexOf(w) > -1)) { hits++; const i = f.indexOf(W[0]), a = Math.max(0, i - 40); res.push({ kind: 'data', ty, app: d.app, key: d.key, name: d.name, path, text: s, snip: (a ? '…' : '') + s.slice(a, a + 110) + (s.length > a + 110 ? '…' : ''), score: (f === fold(q) ? 50 : 0) + (/^(name|nom|title|titre|label)$/i.test(path) ? 20 : 0) + (f.indexOf(W[0]) === 0 ? 10 : 0) - s.length / 200 }); } });
        });
        return res.sort((a, b) => b.score - a.score).slice(0, 40);
    }
    // ---------- commandes de la page ----------
    // commandes : tous les boutons de l'outil (barres, panneaux, menu « Exporter ▾ ») — un mot peut aussi trouver ses synonymes
    const SYN = { pdf: ['imprim', 'rendu', 'pdf'], imprimer: ['imprim', 'pdf', 'rendu'], sauvegarder: ['enregistr', 'sauvegard'], sauver: ['enregistr'], enregistrer: ['enregistr'], exporter: ['export', 'csv', 'pdf', 'imprim'], partager: ['partag', 'diffus', 'lien'], equipe: ['equipe', 'deleg', 'drive', 'avis', 'mots'], annuler: ['annul', 'retablir', 'version'], ouvrir: ['ouvrir', 'charger'], nouveau: ['nouveau', 'nouvelle', 'ajouter', 'vierge'], ajouter: ['ajout', 'nouveau', 'nouvelle', '+'], supprimer: ['supprim', 'effac', 'retir'], tableau: ['tableau', 'csv', 'excel'], excel: ['csv', 'excel', 'tableau'] };
    function commands(q) {
        const W = fold(q).split(/\s+/).filter(Boolean), seen = new Set(), out = [];
        const ok = (f, w) => f.indexOf(w) > -1 || (SYN[w] || []).some(x => f.indexOf(x) > -1);
        const L = [...document.querySelectorAll('#toolbar button, #top-bar button, #view-group button, .btn-group button, header button, [data-view], #xb-hold button, button[title]')];
        L.forEach(b => {
            if (b.closest('#xf-ov,#xb-menu') || b.disabled || (!b.offsetParent && !b.closest('#xb-hold')) || (b.closest('#xb-team') && getComputedStyle(b.closest('#xb-team')).display === 'none')) return;
            const lab = ((b.querySelector('.btn-label') || {}).textContent || b.textContent || '').replace(/\s+/g, ' ').trim(), tip = b.title || '', icon = (b.querySelector('.btn-icon') || {}).textContent || '';
            const t = (lab && lab.length > 2 && !/^\W+$/.test(lab) ? lab : tip.split(/ : | — /)[0]).trim(); if (!t || seen.has(t)) return; seen.add(t); const f = fold(t + ' ' + tip);
            if (!W.length || W.every(w => ok(f, w))) out.push({ kind: 'cmd', label: t.slice(0, 70), sub: tip && tip !== t ? tip.slice(0, 120) : '', icon: icon || '▸', el: b, score: W.filter(w => ok(fold(t), w)).length });
        });
        out.sort((x, y) => y.score - x.score);
        return out.slice(0, W.length ? 14 : 8);
    }
    // ⚡ actions des autres outils : chaque outil mémorise ses commandes quand on l'ouvre ; on peut ensuite les lancer de partout
    const KC = 'xiii.cmds';
    function saveCmds() { if (!APP || APP === 'index') return; const W = []; const seen = new Set(); document.querySelectorAll('#toolbar button, #top-bar button, .btn-group button, #xb-hold button, button[title]').forEach(b => { if (b.closest('#xf-ov,#xb-menu,#xs-ov,#xs-gear') || !b.getAttribute('onclick') && !b.title) return; const lab = ((b.querySelector('.btn-label') || {}).textContent || b.textContent || '').replace(/\s+/g, ' ').trim(), tip = b.title || '', t = (lab && lab.length > 2 && !/^\W+$/.test(lab) ? lab : tip.split(/ : | — /)[0]).trim(); if (!t || t.length > 60 || seen.has(t)) return; seen.add(t); W.push([t, tip.slice(0, 120), ((b.querySelector('.btn-icon') || {}).textContent || '▸').trim()]); }); try { const A = JSON.parse(localStorage.getItem(KC) || '{}'); A[APP] = W.slice(0, 80); localStorage.setItem(KC, JSON.stringify(A)); } catch (e) { } }
    function remote(q) { const W = fold(q).split(/\s+/).filter(Boolean); if (!W.length) return []; let A = {}; try { A = JSON.parse(localStorage.getItem(KC) || '{}'); } catch (e) { } const out = []; Object.keys(A).forEach(app => { if (app === APP) return; const t = T(app); (A[app] || []).forEach(c => { const f = fold(c[0] + ' ' + c[1] + ' ' + (t ? t[2] : app)); if (W.every(w => f.indexOf(w) > -1 || (SYN[w] || []).some(x => f.indexOf(x) > -1))) out.push({ kind: 'rcmd', app, label: c[0], sub: (t ? t[2] : app.toUpperCase()) + (c[1] && c[1] !== c[0] ? ' · ' + c[1] : ''), icon: c[2] }); }); }); return out.slice(0, 8); }
    function runPending() { const m = /[#&]xfa=([^&]+)/.exec(location.hash); if (!m) return; const lab = decodeURIComponent(m[1]); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } const go = (n) => { const b = [...document.querySelectorAll('button')].find(b => { const l = ((b.querySelector('.btn-label') || {}).textContent || b.textContent || '').replace(/\s+/g, ' ').trim(); return l === lab || (b.title || '').split(/ : | — /)[0].trim() === lab; }); if (b) b.click(); else if (n < 8) setTimeout(() => go(n + 1), 600); }; setTimeout(() => go(0), 1200); }
    // espace onglets : onglets ouverts et projets XIII
    const XT = () => { try { return window.parent !== window && window.parent.__xtapi ? window.parent.__xtapi : null; } catch (e) { return null; } };
    const nav = (u, nt) => { const x = XT(); if (x && typeof xiiiOpenTab === 'function') { xiiiOpenTab(u, nt); return; } if (nt) window.open(u, '_blank'); else location.href = u; };
    function openTabs(q) { const x = XT(); if (!x) return []; const W = fold(q).split(/\s+/).filter(Boolean); return x.tabs().filter(t => !t.on && (!W.length || W.every(w => fold(t.label + ' ' + t.wsName).indexOf(w) > -1))).map(t => ({ kind: 'tab', id: t.id, label: t.label, sub: 'Projet : ' + t.wsName, color: t.color, app: t.app })); }
    function projects(q) { if (typeof XWS === 'undefined') return []; const L = XWS.list(); if (L.length < 2 && q) return []; const W = fold(q).split(/\s+/).filter(Boolean); return L.filter(w => w.id !== XWS.id && (!W.length || W.every(x => fold(w.name + ' projet').indexOf(x) > -1))).map(w => ({ kind: 'ws', id: w.id, label: w.name, sub: 'Basculer sur ce projet XIII (son Drive, son équipe, ses données)', color: w.color })); }
    function tools(q) { const W = fold(q).split(/\s+/).filter(Boolean); return TOOLS.filter(t => t[0] !== APP && (!W.length || W.every(w => fold(t[2] + ' ' + t[3]).indexOf(w) > -1))).map(t => ({ kind: 'tool', id: t[0], label: t[2], sub: t[3], icon: t[1] })); }
    // ---------- interface ----------
    let ov = null, items = [], sel = 0, FT = '';
    const TY = { p: ['👤', 'Personnes'], l: ['📍', 'Lieux'], m: ['📦', 'Matériel'] };
    function open() {
        if (ov) { ov.querySelector('input').select(); return; }
        ov = document.createElement('div'); ov.id = 'xf-ov';
        ov.innerHTML = '<div class="xf-box" role="dialog" aria-label="Recherche dans la suite"><div class="xf-in"><span>🔎</span><input type="text" placeholder="Rechercher dans tout le projet : nom, lieu, matériel, texte… ou une commande" autocomplete="off" spellcheck="false"><kbd>Échap</kbd></div><div class="xf-ty">' + [['', 'Tout']].concat(Object.keys(TY).map(k => [k, TY[k][0] + ' ' + TY[k][1]])).map(x => '<button data-ty="' + x[0] + '"' + (FT === x[0] ? ' class="on"' : '') + '>' + x[1] + '</button>').join('') + '</div><div class="xf-res"></div><div class="xf-ft"><span>↑↓ choisir · Entrée ouvrir · <b>Ctrl+K</b> / <b>⌘K</b> partout</span><span id="xf-st"></span></div></div>';
        document.body.appendChild(ov); const inp = ov.querySelector('input');
        ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
        ov.querySelectorAll('[data-ty]').forEach(b => b.onclick = () => { FT = b.dataset.ty; ov.querySelectorAll('[data-ty]').forEach(x => x.classList.toggle('on', x === b)); sel = 0; draw(inp.value); inp.focus(); });
        inp.addEventListener('input', () => { sel = 0; draw(inp.value); });
        inp.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); hl(); } else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); hl(); }
            else if (e.key === 'Enter') { e.preventDefault(); go(items[sel], e.ctrlKey || e.metaKey); } else if (e.key === 'Escape') { e.preventDefault(); close(); }
        });
        try { inp.value = sessionStorage.getItem('xf.q') || ''; } catch (e) { } inp.select(); inp.focus(); draw(inp.value);
        if (!IDX || Date.now() - IDXAT > 15000) { ov.querySelector('#xf-st').textContent = 'indexation…'; build().then(d => { if (!ov) return; ov.querySelector('#xf-st').textContent = d.length + ' projets / fiches indexés'; draw(inp.value); }); }
        else ov.querySelector('#xf-st').textContent = IDX.length + ' projets / fiches indexés';
    }
    function close() { if (ov) { try { sessionStorage.setItem('xf.q', ov.querySelector('input').value); } catch (e) { } ov.remove(); ov = null; } }
    function draw(q) {
        const C = FT ? [] : commands(q), Tl = FT ? [] : tools(q), D = q.trim().length >= 2 ? searchData(q) : [];
        items = []; let h = '';
        const sec = (t, arr, f) => { if (!arr.length) return; h += '<div class="xf-h">' + t + '</div>'; arr.forEach(x => { x.i = items.length; items.push(x); h += '<div class="xf-it" data-i="' + x.i + '">' + f(x) + '</div>'; }); };
        const mark = s => { let e = esc(s); fold(q).split(/\s+/).filter(Boolean).forEach(w => { const f = fold(s), i = f.indexOf(w); if (i > -1) { const raw = s.slice(i, i + w.length); e = e.replace(esc(raw), '<mark>' + esc(raw) + '</mark>'); } }); return e; };
        sec('Outils', Tl.slice(0, q ? 8 : 18), x => '<span class="xf-ic">' + x.icon + '</span><span class="xf-tx"><b>' + mark(x.label) + '</b><small>' + esc(x.sub) + '</small></span><span class="xf-go">↗</span>'); // saison 6 : les outils toujours en tête des résultats
        if (q.trim().length >= 2) sec('Dans vos projets', D, x => { const t = T(x.app) || [x.app, x.app === 'book' ? '📇' : x.app === 'fiche' ? '🎬' : '📄', x.app === 'book' ? 'ANNUAIRE' : x.app === 'fiche' ? 'FICHE PROJET' : x.app.toUpperCase()]; return '<span class="xf-ic">' + (x.ty ? TY[x.ty][0] : t[1]) + '</span><span class="xf-tx"><b>' + mark(x.snip) + '</b><small>' + (x.ty ? t[1] + ' ' : '') + esc(t[2]) + (x.name && x.name !== x.text ? ' · ' + esc(String(x.name).slice(0, 60)) : '') + (LABELS[x.path] ? ' · ' + LABELS[x.path] : '') + '</small></span><span class="xf-go">↵</span>'; });
        sec('Commandes de cette page', C, x => '<span class="xf-ic">' + esc(x.icon) + '</span><span class="xf-tx"><b>' + mark(x.label) + '</b>' + (x.sub ? '<small>' + esc(x.sub) + '</small>' : '') + '</span>');
        if (!FT) sec('⚡ Actions dans les autres outils', remote(q), x => '<span class="xf-ic">' + esc(x.icon) + '</span><span class="xf-tx"><b>' + mark(x.label) + '</b><small>' + esc(x.sub) + '</small></span><span class="xf-go">↗</span>');
        if (!FT) sec('Onglets ouverts', openTabs(q).slice(0, 8), x => '<span class="xf-ic"><img src="logos/' + x.app + '.png?v=3" alt="" style="width:20px;height:20px;object-fit:contain" onerror="this.replaceWith(\'▸\')"></span><span class="xf-tx"><b>' + mark(x.label) + '</b><small><span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:' + esc(x.color) + '"></span>' + esc(x.sub) + '</small></span><span class="xf-go">⇥</span>');
        if (!FT) sec('Projets XIII', projects(q).slice(0, 8), x => '<span class="xf-ic"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + esc(x.color) + ';box-shadow:0 0 8px ' + esc(x.color) + '"></span></span><span class="xf-tx"><b>' + mark(x.label) + '</b><small>' + esc(x.sub) + '</small></span><span class="xf-go">⇄</span>');
        if (!items.length) h = '<div class="xf-empty">' + (IDX ? 'Aucun résultat pour « ' + esc(q) + ' ».' : 'Indexation en cours…') + '</div>';
        const r = ov.querySelector('.xf-res'); r.innerHTML = h; r.querySelectorAll('.xf-it').forEach(el => { el.onmousemove = () => { if (sel !== +el.dataset.i) { sel = +el.dataset.i; hl(); } }; el.onclick = e => go(items[+el.dataset.i], e.ctrlKey || e.metaKey); }); hl();
    }
    function hl() { if (!ov) return; ov.querySelectorAll('.xf-it').forEach(el => el.classList.toggle('on', +el.dataset.i === sel)); const c = ov.querySelector('.xf-it.on'); if (c) c.scrollIntoView({ block: 'nearest' }); }
    function go(x, newTab) {
        if (!x) return; const q = ov ? ov.querySelector('input').value : '';
        if (x.kind === 'cmd') { close(); setTimeout(() => x.el.click(), 30); return; }
        if (x.kind === 'tab') { close(); const t = XT(); if (t) t.show(x.id); return; }
        if (x.kind === 'ws') { close(); const t = XT(); if (t) t.project(x.id); else XWS.go(x.id); return; }
        if (x.kind === 'rcmd') { close(); const u = x.app + '.html#xfa=' + encodeURIComponent(x.label); nav(u, newTab); return; }
        let page, find = '';
        if (x.kind === 'tool') page = x.id + '.html';
        else { const app = x.app === 'book' || x.app === 'fiche' ? (APP || 'index') : x.app; page = app + '.html'; find = x.text.length < 120 ? x.text : q; }
        if (x.kind === 'data' && (x.app === APP || ((x.app === 'book' || x.app === 'fiche') && APP))) { close(); highlight(find); return; }
        close(); const url = page + (find ? '#xfind=' + encodeURIComponent(find) : ''); nav(url, newTab);
    }
    function highlight(s) {
        if (!s) return; let ok = false;
        try { window.getSelection().removeAllRanges(); ok = window.find && window.find(s, false, false, true, false, false, false); } catch (e) { }
        if (!ok) { const inp = [...document.querySelectorAll('input,textarea')].find(i => fold(i.value).indexOf(fold(s)) > -1); if (inp) { inp.scrollIntoView({ block: 'center' }); inp.focus(); try { const i = fold(inp.value).indexOf(fold(s)); inp.setSelectionRange(i, i + s.length); } catch (e) { } ok = true; inp.classList.add('xf-flash'); setTimeout(() => inp.classList.remove('xf-flash'), 2200); } }
        if (!ok) { try { if (typeof toast === 'function') toast('🔎 « ' + s.slice(0, 40) + ' » : ouvrez la vue ou l\'onglet concerné de cet outil'); } catch (e) { } }
    }
    function init(app) {
        APP = app;
        document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); e.stopImmediatePropagation(); if (ov) close(); else open(); } }, true);
        const css = document.createElement('style'); css.textContent = '#xf-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483500;display:flex;justify-content:center;align-items:flex-start;padding-top:10vh;font:14px "Segoe UI",system-ui,sans-serif}.xf-box{width:min(680px,94vw);background:#232327;color:#eee;border:1px solid #444;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.6);overflow:hidden}.xf-in{display:flex;gap:10px;align-items:center;padding:12px 14px;border-bottom:1px solid #3a3a3f}.xf-in input{flex:1;background:transparent!important;border:0!important;outline:0!important;color:#fff!important;font-size:17px!important;padding:4px 0!important;box-shadow:none!important}.xf-in kbd,.xf-ft b{font:11px monospace;background:#333;border:1px solid #555;border-radius:4px;padding:1px 5px;color:#ccc}.xf-res{max-height:58vh;overflow:auto;padding:6px}.xf-h{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#888;margin:8px 8px 4px}.xf-it{display:flex;gap:10px;align-items:center;padding:7px 10px;border-radius:7px;cursor:pointer}.xf-it.on{background:rgba(240,179,120,.18)}.xf-ic{width:24px;text-align:center;font-size:16px}.xf-tx{flex:1;min-width:0}.xf-tx b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xf-tx small{display:block;color:#999;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xf-tx mark{background:rgba(240,179,120,.45);color:inherit;border-radius:2px}.xf-go{color:#888}.xf-empty{padding:24px;text-align:center;color:#999}.xf-ft{display:flex;justify-content:space-between;gap:10px;padding:8px 14px;border-top:1px solid #3a3a3f;color:#888;font-size:11.5px}.xf-ty{display:flex;gap:6px;padding:8px 12px 2px}.xf-ty button{font:inherit;font-size:12px;color:#ddd;background:#2c2c31;border:1px solid #45454b;border-radius:14px;padding:2px 10px;cursor:pointer}.xf-ty button.on{background:rgba(240,179,120,.25);border-color:rgba(240,179,120,.75);color:#fff}.xf-flash{outline:3px solid rgb(240,179,120)!important;transition:outline .3s}';
        document.head.appendChild(css);
        const addBtn = () => { if (document.getElementById('xf-btn') || APP === 'index') return; const host = document.getElementById('xb-file') || document.getElementById('xd-dash') || document.getElementById('top-bar'); if (!host) return; const b = document.createElement('button'); b.id = 'xf-btn'; b.title = '🔎 Rechercher dans tout le projet : personnes, lieux, matériel, textes de tous les outils (Ctrl+K / ⌘K)'; b.innerHTML = '<span class="btn-icon">🔎</span><span class="btn-label">Rechercher</span>'; b.onclick = () => open(); host.insertBefore(b, host.firstChild); };
        XBOOT.ready(addBtn, 2800); XBOOT.ready(() => setTimeout(saveCmds, 2500), 3000); runPending();
        const h = /[#&]xfind=([^&]+)/.exec(location.hash);
        if (h) { const s = decodeURIComponent(h[1]); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } const run = () => setTimeout(() => highlight(s), 1500); if (document.readyState === 'complete') run(); else window.addEventListener('load', run); }
    }
    return { init, open, close, build, search: q => searchData(q) };
})();

XFIND.init(XIII_APP);

window.XQRS = window.XQRS || (function(){
// =====================================================================
//  XQR : générateur de QR code (mode octets, niveaux L/M/Q/H, versions 1 à 40) — sans dépendance
//  XQR.make(texte, 'L') → { size, ver, get(x, y) } ou null si trop long ; XQR.svg(texte, opts) → chaîne SVG ou null
// =====================================================================
const XQR = (() => {
    const ECC = [[-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
    const BLK = [[-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
        [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
        [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
        [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]];
    const ECL = { L: [0, 1], M: [1, 0], Q: [2, 3], H: [3, 2] };
    const raw = v => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
    const dataCw = (v, e) => Math.floor(raw(v) / 8) - ECC[e][v] * BLK[e][v];
    const bit = (x, i) => ((x >>> i) & 1) !== 0;
    const mul = (x, y) => { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; };
    const rsDiv = d => { const r = new Array(d - 1).fill(0); r.push(1); let root = 1; for (let i = 0; i < d; i++) { for (let j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; } root = mul(root, 2); } return r; };
    const rsRem = (data, div) => { const r = div.map(() => 0); data.forEach(b => { const f = b ^ r.shift(); r.push(0); div.forEach((c, i) => { r[i] ^= mul(c, f); }); }); return r; };
    function make(text, level) {
        const e = (ECL[level || 'L'] || ECL.L)[0], bytes = Array.from(new TextEncoder().encode(String(text)));
        let ver = 0; for (let v = 1; v <= 40; v++) { const cc = v <= 9 ? 8 : 16; if (4 + cc + 8 * bytes.length <= dataCw(v, e) * 8) { ver = v; break; } }
        if (!ver) return null;
        const bits = []; const put = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
        put(4, 4); put(bytes.length, ver <= 9 ? 8 : 16); bytes.forEach(b => put(b, 8));
        const cap = dataCw(ver, e) * 8; put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
        for (let p = 0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) put(p, 8);
        const data = []; for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
        // blocs + correction d'erreur
        const nb = BLK[e][ver], el = ECC[e][ver], rc = Math.floor(raw(ver) / 8), ns = nb - rc % nb, sl = Math.floor(rc / nb), div = rsDiv(el), blocks = [];
        for (let i = 0, k = 0; i < nb; i++) { const dl = sl - el + (i < ns ? 0 : 1), dat = data.slice(k, k + dl); k += dl; const ecc = rsRem(dat, div); if (i < ns) dat.push(0); blocks.push(dat.concat(ecc)); }
        const all = []; for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== sl - el || j >= ns) all.push(b[i]); });
        const size = ver * 4 + 17, M = Array.from({ length: size }, () => new Array(size).fill(false)), F = Array.from({ length: size }, () => new Array(size).fill(false));
        const setF = (x, y, d) => { M[y][x] = d; F[y][x] = true; };
        for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
        const finder = (x, y) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy; if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, d !== 2 && d !== 4); } };
        finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
        let ap = []; if (ver > 1) { const n = Math.floor(ver / 7) + 2, st = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (n * 2 - 2)) * 2; ap = [6]; for (let p = size - 7; ap.length < n; p -= st) ap.splice(1, 0, p); }
        ap.forEach((x, i) => ap.forEach((y, j) => { if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) return; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }));
        const fmt = mask => {
            const d = (ECL[level || 'L'][1] << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const b = ((d << 10) | r) ^ 0x5412;
            for (let i = 0; i <= 5; i++) setF(8, i, bit(b, i)); setF(8, 7, bit(b, 6)); setF(8, 8, bit(b, 7)); setF(7, 8, bit(b, 8)); for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(b, i));
            for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(b, i)); for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(b, i)); setF(8, size - 8, true);
        };
        fmt(0);
        if (ver >= 7) { let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); const b = (ver << 12) | r; for (let i = 0; i < 18; i++) { const c = bit(b, i), a = size - 11 + i % 3, d = Math.floor(i / 3); setF(a, d, c); setF(d, a, c); } }
        for (let i = 0, right = size - 1; right >= 1; right -= 2) { if (right === 6) right = 5; for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) { const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert; if (!F[y][x] && i < all.length * 8) { M[y][x] = bit(all[i >>> 3], 7 - (i & 7)); i++; } } }
        const inv = (m, x, y) => [(x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0, (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, x * y % 2 + x * y % 3 === 0, (x * y % 2 + x * y % 3) % 2 === 0, ((x + y) % 2 + x * y % 3) % 2 === 0][m];
        const apply = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && inv(m, x, y)) M[y][x] = !M[y][x]; };
        const penalty = () => {
            let p = 0, dark = 0;
            for (let y = 0; y < size; y++) { let run = 1; for (let x = 1; x < size; x++) { if (M[y][x] === M[y][x - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
            for (let x = 0; x < size; x++) { let run = 1; for (let y = 1; y < size; y++) { if (M[y][x] === M[y - 1][x]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
            for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; }
            for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (M[y][x]) dark++;
            p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10; return p;
        };
        let best = 0, bp = Infinity; for (let m = 0; m < 8; m++) { apply(m); fmt(m); const p = penalty(); if (p < bp) { bp = p; best = m; } apply(m); }
        apply(best); fmt(best);
        return { size, ver, get: (x, y) => x >= 0 && y >= 0 && x < size && y < size && M[y][x] };
    }
    function svg(text, o) {
        o = o || {}; const q = make(text, o.ecl || 'L'); if (!q) return null; const b = o.border == null ? 4 : o.border, n = q.size + 2 * b; let d = '';
        for (let y = 0; y < q.size; y++) { let x = 0; while (x < q.size) { if (q.get(x, y)) { let w = 1; while (x + w < q.size && q.get(x + w, y)) w++; d += 'M' + (x + b) + ',' + (y + b) + 'h' + w + 'v1h-' + w + 'z'; x += w; } else x++; } }
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="' + n + '" height="' + n + '" fill="' + (o.light || '#fff') + '"/><path d="' + d + '" fill="' + (o.dark || '#000') + '"/></svg>';
    }
    return { make, svg, capacity: (level) => { const e = (ECL[level || 'L'] || ECL.L)[0]; return dataCw(40, e) - 3; } };
})();
if (typeof module !== 'undefined') module.exports = XQR;

return XQR;})();
// =====================================================================
//  SUITE XIII — XQT : 📲 transfert de fichiers PC ↔ téléphone par QR codes animés, SANS RÉSEAU
//  Principe repris de « airgapped-qr-code-transfer » (M. Ramachandran, licence MIT) : fichier compressé (gzip),
//  découpé en morceaux, affichés en suite de QR codes lus par la caméra. Version XIII plus fiable :
//  la suite tourne EN BOUCLE (on peut prendre le train en marche, les morceaux manqués repassent), chaque QR
//  porte l'identifiant du transfert et son numéro, une empreinte CRC32 vérifie le fichier reçu.
//  Envoi : XQT.send(file | {name, type, blob}) · Réception : XQT.scan() · Fichiers reçus : XQT.inbox()
// =====================================================================
var XQT = window.XQT || (() => {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const QR = () => window.XQRS || (typeof XQR !== 'undefined' ? XQR : null);
    const toast = (m, ms) => { try { (window.XM && XM.toast ? XM.toast : window.toast)(m, ms || 3500); } catch (e) { } };
    const kb = n => n < 1024 ? n + ' o' : n < 1048576 ? Math.round(n / 1024) + ' Ko' : (n / 1048576).toFixed(1).replace('.', ',') + ' Mo';
    // ---------- outils binaires ----------
    const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = t[(c ^ u[i]) & 255] ^ (c >>> 8); return ((c ^ 0xFFFFFFFF) >>> 0).toString(16); }; })();
    const b64 = u => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
    const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    async function gz(u, inflate) { if (typeof CompressionStream === 'undefined') return null; const s = new Blob([u]).stream().pipeThrough(inflate ? new DecompressionStream('gzip') : new CompressionStream('gzip')); return new Uint8Array(await new Response(s).arrayBuffer()); }
    const css = `#xqt{position:fixed;inset:0;z-index:10500;background:#0d0d0f;color:#f2ede6;font:15px/1.4 -apple-system,"Segoe UI",Roboto,sans-serif;display:flex;flex-direction:column}#xqt *{box-sizing:border-box}
#xqt .h{display:flex;gap:8px;align-items:center;padding:max(10px,env(safe-area-inset-top)) 12px 10px;border-bottom:1px solid #2a2a30}#xqt .h b{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#xqt button{font:inherit;color:inherit;background:#26262b;border:1px solid #3a3a42;border-radius:12px;padding:9px 14px;cursor:pointer;min-height:44px}#xqt button.pr{background:#f0b378;color:#1d1b19;border-color:#f0b378;font-weight:700}
#xqt .m{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px;overflow:auto;position:relative}#xqt canvas.q{background:#fff;padding:14px;border-radius:12px;image-rendering:pixelated;max-width:min(92vw,78vh);max-height:min(92vw,78vh)}
#xqt .s{color:#a39b91;font-size:13px;text-align:center}#xqt .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}#xqt select,#xqt input[type=range]{font:inherit;color:inherit;background:#1d1d22;border:1px solid #3a3a42;border-radius:10px;padding:6px 8px}
#xqt video{width:100%;max-width:560px;max-height:58vh;object-fit:cover;border-radius:14px;background:#000}#xqt .vf{position:relative;width:100%;max-width:560px}#xqt .vf i{position:absolute;inset:12%;border:3px solid #ff8a1e;border-radius:14px}
#xqt .grid{display:flex;flex-wrap:wrap;gap:2px;max-width:560px;justify-content:center}#xqt .grid span{width:9px;height:9px;border-radius:2px;background:#3a3a42}#xqt .grid span.ok{background:#66bb6a}
#xqt .bar{height:10px;width:100%;max-width:560px;background:#26262b;border-radius:99px;overflow:hidden}#xqt .bar i{display:block;height:100%;background:#66bb6a;transition:width .2s}
#xqt .f{display:flex;gap:10px;align-items:center;width:100%;max-width:560px;padding:10px;border:1px solid #2a2a30;border-radius:12px;margin-bottom:6px}#xqt .f span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}`;
    function shell(title) {
        if (!document.getElementById('xqt-css')) { const s = document.createElement('style'); s.id = 'xqt-css'; s.textContent = css; document.head.appendChild(s); }
        close(); const o = document.createElement('div'); o.id = 'xqt'; o.innerHTML = '<div class="h"><button data-x>✕</button><b>' + esc(title) + '</b></div><div class="m"></div>'; document.body.appendChild(o);
        o.querySelector('[data-x]').onclick = close; return o.querySelector('.m');
    }
    let stopFn = null;
    function close() { if (stopFn) { try { stopFn(); } catch (e) { } stopFn = null; } const o = document.getElementById('xqt'); if (o) o.remove(); }
    // =================================================================
    //  ENVOI
    // =================================================================
    const SIZES = [['Rapide (gros QR)', 1100], ['Normal', 700], ['Robuste (petits QR)', 380]];
    async function send(src) {
        if (!QR()) { toast('⚠️ Générateur de QR indisponible'); return; }
        if (!src) { const i = document.createElement('input'); i.type = 'file'; i.onchange = () => i.files[0] && send(i.files[0]); i.click(); return; }
        const blob = src.blob || src, name = src.name || 'fichier', type = src.type || blob.type || 'application/octet-stream';
        const raw = new Uint8Array(await blob.arrayBuffer()); let z = 0, data = raw; try { const c = await gz(raw); if (c && c.length < raw.length * 0.95) { data = c; z = 1; } } catch (e) { }
        const meta = { n: name, t: type, s: raw.length, c: CRC(raw), z }; let sid = '';
        let size = 700, fps = 8, chunks = [], timer = 0, k = 0, turns = 0;
        const m = shell('📲 Envoi : ' + name);
        const cut = () => { chunks = []; for (let i = 0; i < data.length; i += size) chunks.push(b64(data.subarray(i, i + size))); };
        const frame = i => i < 0 ? 'XQT1:' + sid + ':M:' + chunks.length + ':' + b64(new TextEncoder().encode(JSON.stringify(meta))) : 'XQT1:' + sid + ':' + i + ':' + chunks.length + ':' + chunks[i];
        m.innerHTML = '<canvas class="q"></canvas><div class="s" id="xq-s"></div><div class="row"><label>Vitesse <input type="range" id="xq-f" min="2" max="15" value="' + fps + '"></label><select id="xq-z">' + SIZES.map(s => '<option value="' + s[1] + '"' + (s[1] === size ? ' selected' : '') + '>' + s[0] + '</option>').join('') + '</select></div><div class="s">Sur le téléphone : SUITE XIII › Accueil › 📷 Scanner, visez cet écran. La suite tourne en boucle jusqu\'à ce que tout soit reçu ; aucun réseau n\'est utilisé.</div>';
        const cv = m.querySelector('canvas'), g = cv.getContext('2d');
        const draw = txt => { const q = QR().make(txt, 'L'); if (!q) return; const sc = Math.max(2, Math.floor(Math.min(innerWidth * 0.9, innerHeight * 0.72) / q.size)); cv.width = cv.height = q.size * sc; g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#000'; for (let y = 0; y < q.size; y++) for (let x = 0; x < q.size; x++) if (q.get(x, y)) g.fillRect(x * sc, y * sc, sc, sc); };
        const loop = () => { const n = chunks.length, i = k % (n + Math.ceil(n / 8)); const mi = Math.floor(i / 9), isMeta = i % 9 === 0; const idx = isMeta ? -1 : Math.min(n - 1, i - mi - 1); draw(frame(idx)); if (!isMeta && idx === n - 1) turns++; k++;
            const st = document.getElementById('xq-s'); if (st) st.textContent = kb(raw.length) + (z ? ' (compressé ' + kb(data.length) + ')' : '') + ' · ' + n + ' QR · tour ' + (turns + 1) + ' · ' + (isMeta ? 'en-tête' : (idx + 1) + ' / ' + n); };
        const run = () => { clearInterval(timer); sid = Math.random().toString(36).slice(2, 8); cut(); k = 0; turns = 0; timer = setInterval(loop, 1000 / fps); loop(); };
        m.querySelector('#xq-f').oninput = e => { fps = +e.target.value; clearInterval(timer); timer = setInterval(loop, 1000 / fps); };
        m.querySelector('#xq-z').onchange = e => { size = +e.target.value; run(); };
        stopFn = () => clearInterval(timer); run();
    }
    const sendText = (name, text, type) => send({ name, type: type || 'application/json', blob: new Blob([text], { type: type || 'application/json' }) });
    // =================================================================
    //  RÉCEPTION
    // =================================================================
    let jsqrP = null;
    const loadJsQR = () => jsqrP || (jsqrP = new Promise((ok, ko) => { if (window.jsQR) return ok(window.jsQR); const U = ['https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js', 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js']; let i = 0; const nx = () => { if (i >= U.length) { jsqrP = null; return ko(new Error('Lecteur de QR indisponible : ouvrez une fois cette page en ligne, ou utilisez Chrome (Android)')); } const s = document.createElement('script'); s.src = U[i++]; s.onload = () => ok(window.jsQR); s.onerror = nx; document.head.appendChild(s); }; nx(); }));
    async function detector() {
        if ('BarcodeDetector' in window) { try { const f = await BarcodeDetector.getSupportedFormats(); if (f.includes('qr_code')) { const d = new BarcodeDetector({ formats: ['qr_code'] }); return async v => (await d.detect(v)).map(x => x.rawValue); } } catch (e) { } }
        const J = await loadJsQR(), c = document.createElement('canvas'), g = c.getContext('2d', { willReadFrequently: true });
        return async v => { const k = Math.min(1, 900 / Math.max(v.videoWidth, v.videoHeight)); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k); g.drawImage(v, 0, 0, c.width, c.height); const r = J(g.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: 'dontInvert' }); return r ? [r.data] : []; };
    }
    async function scan(onText) {
        const m = shell('📷 Scanner');
        m.innerHTML = '<div class="vf"><video playsinline muted></video><i></i></div><div class="bar"><i style="width:0"></i></div><div class="s" id="xq-st">Visez le QR code (ou la suite de QR animés) affiché sur l\'ordinateur.</div><div class="grid"></div>';
        const v = m.querySelector('video'); let stream = null, alive = true, S = null;
        stopFn = () => { alive = false; if (stream) stream.getTracks().forEach(t => t.stop()); };
        try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false }); v.srcObject = stream; await v.play(); }
        catch (e) { m.querySelector('#xq-st').textContent = '⚠️ Caméra inaccessible : autorisez la caméra pour ce site.'; return; }
        let det; try { det = await detector(); } catch (e) { m.querySelector('#xq-st').textContent = '⚠️ ' + e.message; return; }
        const st = m.querySelector('#xq-st'), bar = m.querySelector('.bar i'), grid = m.querySelector('.grid');
        const paint = () => { const got = S.parts.filter(Boolean).length; bar.style.width = Math.round(got / S.n * 100) + '%'; st.textContent = (S.meta ? S.meta.n + ' · ' : '') + got + ' / ' + S.n + ' morceaux' + (got < S.n ? ' — gardez le téléphone pointé, les manquants repassent' : ''); if (S.n <= 600) { if (grid.children.length !== S.n) grid.innerHTML = '<span></span>'.repeat(S.n); S.parts.forEach((p, i) => { if (p) grid.children[i].className = 'ok'; }); } };
        const tick = async () => {
            if (!alive) return;
            if (v.readyState >= 2) { let L = []; try { L = await det(v); } catch (e) { }
                for (const t of L) {
                    const mm = /^XQT1:(\w+):(M|\d+):(\d+):(.*)$/s.exec(t);
                    if (!mm) { if (!S) { stopFn(); close(); if (onText) onText(t); else plain(t); return; } continue; }
                    const [, sid, i, n] = mm, body = mm[4];
                    if (!S || S.sid !== sid || S.n !== +n) { S = { sid, n: +n, parts: new Array(+n).fill(null), meta: null }; try { navigator.vibrate && navigator.vibrate(30); } catch (e) { } }
                    if (i === 'M') { if (!S.meta) { try { S.meta = JSON.parse(new TextDecoder().decode(unb64(body))); } catch (e) { } } } else if (!S.parts[+i]) S.parts[+i] = body;
                    paint();
                    if (S.meta && S.parts.every(Boolean)) { stopFn(); await finish(S, m); return; }
                } }
            setTimeout(tick, 70);
        };
        tick();
    }
    async function finish(S, m) {
        try {
            const bin = S.parts.map(unb64), tot = bin.reduce((a, u) => a + u.length, 0), all = new Uint8Array(tot); let o = 0; bin.forEach(u => { all.set(u, o); o += u.length; });
            const raw = S.meta.z ? await gz(all, true) : all; if (!raw) throw new Error('Décompression impossible sur ce navigateur');
            if (CRC(raw) !== S.meta.c) throw new Error('Fichier altéré (empreinte différente) : relancez le scan');
            try { navigator.vibrate && navigator.vibrate([60, 40, 60]); } catch (e) { }
            const rec = { id: 'f' + Date.now(), name: S.meta.n, type: S.meta.t, size: raw.length, at: Date.now(), blob: new Blob([raw], { type: S.meta.t }) };
            await save(rec); result(rec, m);
        } catch (e) { m.innerHTML = '<div class="s">⚠️ ' + esc(e.message) + '</div><button class="pr" id="xq-r">↻ Recommencer</button>'; m.querySelector('#xq-r').onclick = () => scan(); }
    }
    function plain(t) { const m = shell('📷 QR code lu'); const url = /^https?:\/\//i.test(t);
        m.innerHTML = '<div class="s" style="word-break:break-all;max-width:560px;color:#f2ede6">' + esc(t.slice(0, 600)) + '</div><div class="row">' + (url ? '<button class="pr" id="xq-o">↗ Ouvrir le lien</button>' : '') + '<button id="xq-c">📋 Copier</button><button id="xq-a">📷 Scanner encore</button></div>';
        if (url) m.querySelector('#xq-o').onclick = () => { location.href = t; }; m.querySelector('#xq-c').onclick = () => { try { navigator.clipboard.writeText(t); toast('📋 Copié'); } catch (e) { } }; m.querySelector('#xq-a').onclick = () => scan(); }
    // fichier SUITE XIII (projet) → outil à ouvrir
    async function xiiiApp(rec) { if (!/json/i.test(rec.type) && !/\.json$/i.test(rec.name)) return null; try { const j = JSON.parse(await rec.blob.text()); if (j && j.format === 'xiii-mobile' && j.app) return j.app; if (j && j.app && typeof j.app === 'string' && /^[a-z]+$/.test(j.app)) return j.app; } catch (e) { } return null; }
    async function result(rec, m) {
        const app = await xiiiApp(rec), phone = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
        m.innerHTML = '<div style="font-size:46px">✅</div><div><b>' + esc(rec.name) + '</b></div><div class="s">' + kb(rec.size) + ' reçus sans réseau · rangé dans « 📁 Fichiers reçus »</div><div class="row">' + (app ? '<button class="pr" id="xq-app">📲 Ouvrir dans ' + esc(app.toUpperCase()) + '</button>' : '<button class="pr" id="xq-o">👁 Ouvrir</button>') + '<button id="xq-d">💾 Enregistrer</button><button id="xq-a">📷 Autre transfert</button></div>';
        const u = URL.createObjectURL(rec.blob);
        if (app) m.querySelector('#xq-app').onclick = async () => { try { localStorage.setItem('xiii.qrx.pending', await rec.blob.text()); } catch (e) { toast('⚠️ Fichier trop gros pour l\'ouverture directe : enregistrez-le puis importez-le'); return; } location.href = app + (phone ? '-m' : '') + '.html#qrx'; };
        else m.querySelector('#xq-o').onclick = () => { const w = window.open(u, '_blank'); if (!w) location.href = u; };
        m.querySelector('#xq-d').onclick = () => { const a = document.createElement('a'); a.href = u; a.download = rec.name; document.body.appendChild(a); a.click(); a.remove(); };
        m.querySelector('#xq-a').onclick = () => scan();
    }
    // ---------- fichiers reçus (IndexedDB : consultables hors ligne) ----------
    let dbp = null;
    const idb = () => dbp || (dbp = new Promise((ok, ko) => { const r = indexedDB.open('xiii-qrx', 1); r.onupgradeneeded = () => r.result.createObjectStore('f', { keyPath: 'id' }); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); }));
    const store = async (mode, fn) => { const d = await idb(); return new Promise((ok, ko) => { const t = d.transaction('f', mode), r = fn(t.objectStore('f')); t.oncomplete = () => ok(r && r.result); t.onerror = () => ko(t.error); }); };
    const save = rec => store('readwrite', s => s.put(rec)).then(async () => { const L = await list(); for (const x of L.slice(30)) await del(x.id); });
    const list = () => store('readonly', s => s.getAll()).then(L => (L || []).sort((a, b) => b.at - a.at)).catch(() => []);
    const del = id => store('readwrite', s => s.delete(id));
    async function inbox() {
        const m = shell('📁 Fichiers reçus'), L = await list();
        m.style.justifyContent = 'flex-start';
        m.innerHTML = (L.length ? L.map(r => '<div class="f" data-id="' + r.id + '"><span><b>' + esc(r.name) + '</b><br><small class="s">' + kb(r.size) + ' · ' + new Date(r.at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</small></span><button data-o>Ouvrir</button><button data-d>🗑</button></div>').join('') : '<div class="s">Aucun fichier reçu. Sur l\'ordinateur : « 📲 Transfert QR » ; ici : « 📷 Scanner ».</div>') + '<button class="pr" id="xq-sc">📷 Scanner</button>';
        m.querySelectorAll('.f').forEach(d => { const r = L.find(x => x.id === d.dataset.id); d.querySelector('[data-o]').onclick = () => result(r, m); d.querySelector('[data-d]').onclick = async () => { await del(r.id); inbox(); }; });
        m.querySelector('#xq-sc').onclick = () => scan();
    }
    function menu() { const m = shell('📲 Transfert QR (sans réseau)'); m.innerHTML = '<div class="s" style="max-width:520px">Passez un fichier (PDF d\'un plan au sol, synoptique, dossier, projet SUITE XIII…) de l\'ordinateur au téléphone, ou l\'inverse, avec une suite de QR codes animés : aucun réseau, aucun câble.</div><button class="pr" id="xq-s">📤 Envoyer un fichier…</button><button id="xq-r">📷 Recevoir (scanner)</button><button id="xq-i">📁 Fichiers reçus</button>'; m.querySelector('#xq-s').onclick = () => send(); m.querySelector('#xq-r').onclick = () => scan(); m.querySelector('#xq-i').onclick = () => inbox(); }
    // bouton sur la page d'accueil (ordinateur)
    (function mount() { if (!/(^|\/)(index\.html)?$/.test(location.pathname)) return; const go = () => { const ref = document.getElementById('xp-btn'), bar = document.querySelector('#top-bar .bar-right'); if (!bar || document.getElementById('xqt-btn')) return !!document.getElementById('xqt-btn'); const b = document.createElement('button'); b.id = 'xqt-btn'; b.title = 'Transfert QR : envoyer un PDF, un plan au sol ou un synoptique au téléphone sans réseau (suite de QR codes animés)'; b.innerHTML = '<span>📲</span><span>Transfert QR</span>'; b.onclick = menu; if (ref) ref.after(b); else bar.prepend(b); return true; }; let n = 0; const t = setInterval(() => { if (go() || ++n > 40) clearInterval(t); }, 250); })();
    const api = { send, sendText, scan, inbox, close, list, CRC, menu };
    window.XQT = api; return api;
})();

// =====================================================================
//  SUITE XIII — XSHARE : 🔗 partage en lecture seule, sans compte ni serveur
//  Reprend les documents que l'outil sait envoyer à DOSSIER (feuille de service, conducteur, plan, planning…)
//  et les met dans un lien : le contenu voyage compressé dans l'adresse (voir.html#…), rien n'est stocké en ligne.
//  Lien court → QR code ; lien long → partage du lien ou d'une page .html autonome.
// =====================================================================
const XSHARE = (() => {
    let APP = '';
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    async function pack(obj) { const txt = new TextEncoder().encode(JSON.stringify(obj)); if (typeof CompressionStream !== 'function') return 'j.' + b64u(txt); const s = new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'z.' + b64u(new Uint8Array(await new Response(s).arrayBuffer())); }
    const blobB64 = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(String(f.result).split(',')[1] || ''); f.onerror = () => r(''); f.readAsDataURL(b); });
    const base = () => location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const say = m => { try { if (typeof toast === 'function') toast(m); else alert(m); } catch (e) { } };
    function opener() {
        const names = Object.keys(window).filter(k => { try { return typeof window[k] === 'function' && /^(open|send)/i.test(k) && /Dossier/i.test(k) && String(window[k]).indexOf('xiiiSendToDossier') > -1; } catch (e) { return false; } });
        if (names.length) return () => window[names[0]]();
        const b = [...document.querySelectorAll('button,[onclick]')].find(x => /Dossier/i.test(x.getAttribute('onclick') || '') && !x.closest('#xsh-ov'));
        return b ? () => b.click() : null;
    }
    function grabCfg() {
        return new Promise((res, rej) => {
            const go = opener(); if (!go || typeof window.xiiiSendToDossier !== 'function') { rej(new Error('Cet outil n\'a pas encore de document à partager.')); return; }
            const prev = window.xiiiSendToDossier; let done = false;
            window.xiiiSendToDossier = function (cfg) { done = true; window.xiiiSendToDossier = prev; res(cfg); };
            try { const r = go(); if (r && r.catch) r.catch(e => { window.xiiiSendToDossier = prev; rej(e); }); } catch (e) { window.xiiiSendToDossier = prev; rej(e); }
            setTimeout(() => { if (!done) { window.xiiiSendToDossier = prev; rej(new Error('Aucun document à partager (projet vide ?)')); } }, 4000);
        });
    }
    function ov(html) { let o = document.getElementById('xsh-ov'); if (o) o.remove(); o = document.createElement('div'); o.id = 'xsh-ov'; o.innerHTML = '<div class="xsh-box">' + html + '</div>'; o.addEventListener('mousedown', e => { if (e.target === o) o.remove(); }); document.body.appendChild(o); const x = o.querySelector('[data-x]'); if (x) x.onclick = () => o.remove(); return o; }
    const head = t => '<div class="xsh-h"><b>🔗 ' + t + '</b><span data-x>✕</span></div>';
    async function open() {
        css(); let cfg;
        const o = ov(head('Partager en lecture seule') + '<p class="xsh-dim">Préparation…</p>');
        try { cfg = await grabCfg(); } catch (e) { o.querySelector('.xsh-box').innerHTML = head('Partager en lecture seule') + '<p>' + esc(e.message || e) + '</p>'; o.querySelector('[data-x]').onclick = () => o.remove(); return; }
        const ch = cfg.choices || [];
        o.querySelector('.xsh-box').innerHTML = head('Partager en lecture seule') + '<p class="xsh-dim" style="margin-top:0">Le destinataire voit le document tel quel, sans pouvoir le modifier, sans compte. Le contenu voyage dans le lien lui-même : rien n\'est mis en ligne.</p>' +
            ch.map((c, i) => '<label class="xsh-opt"><input type="radio" name="xsh-c" value="' + i + '"' + (i ? '' : ' checked') + '><span><b>' + esc(c.title || c.label) + '</b>' + (c.sub || c.desc ? '<small>' + esc(c.sub || c.desc) + '</small>' : '') + '</span></label>').join('') +
            '<label class="xsh-f">Message (facultatif)<input id="xsh-msg" placeholder="Ex. Voici la feuille de service de demain"></label><div class="xsh-act"><button id="xsh-go" class="xsh-main">🔗 Créer le lien</button></div><div id="xsh-res"></div>';
        o.querySelector('[data-x]').onclick = () => o.remove();
        o.querySelector('#xsh-go').onclick = async () => {
            const c = ch[+(o.querySelector('input[name=xsh-c]:checked') || {}).value || 0], R = o.querySelector('#xsh-res'); R.innerHTML = '<p class="xsh-dim">⏳ Préparation du document…</p>';
            try {
                const r = await c.make(); if (!r || (!r.html && !r.blob)) throw new Error('Document vide');
                const meta = { a: cfg.app || APP, p: cfg.project || '', t: c.title || c.label || 'Document', m: o.querySelector('#xsh-msg').value.trim(), d: Date.now() };
                let payload;
                if (r.html) payload = Object.assign(meta, { k: 'h', h: r.html });
                else { const t = r.type || r.blob.type || 'application/pdf'; payload = Object.assign(meta, { k: /pdf/.test(t) ? 'p' : /image/.test(t) ? 'i' : 'f', y: t, n: r.name || 'document', b: await blobB64(r.blob) }); }
                const code = await pack(payload), url = base() + 'voir.html#' + code, L = url.length; try { const LG = JSON.parse(localStorage.getItem('xiii.share.log') || '[]'); LG.push({ app: APP, t: meta.t, p: meta.p, ts: Date.now(), url: L < 6000 ? url : '' }); localStorage.setItem('xiii.share.log', JSON.stringify(LG.slice(-80))); } catch (e) { }
                const qr = L <= 2800 && typeof XQRS !== 'undefined' ? XQRS.svg(url, { ecl: 'L', border: 2 }) : '';
                const file = r.blob ? new File([r.blob], r.name || 'document.pdf', { type: r.blob.type || 'application/pdf' }) : null;
                R.innerHTML = (L > 1900000 ? '<p class="xsh-warn">⚠️ Document trop lourd pour un lien (' + Math.round(L / 1024) + ' Ko). Envoyez le fichier ou la page autonome.</p>' : '<div class="xsh-link"><input readonly value="' + esc(url) + '"><button data-copy>📋 Copier</button></div>' + (qr ? '<div class="xsh-qr">' + qr + '<small>Scannez avec l\'appareil photo du téléphone</small></div>' : '<p class="xsh-dim">Lien long (' + Math.round(L / 1024) + ' Ko) : parfait par e-mail, Messages, WhatsApp ou Slack ; trop long pour un QR code.</p>')) +
                    '<div class="xsh-act">' + (navigator.share && L <= 1900000 ? '<button data-sh>📤 Partager le lien…</button>' : '') + (file && navigator.canShare && navigator.canShare({ files: [file] }) ? '<button data-shf>📎 Envoyer le fichier…</button>' : '') + '<button data-page>⬇️ Page .html autonome</button>' + (L <= 1900000 ? '<button data-open>👁 Aperçu</button>' : '') + '</div>';
                const q = s => R.querySelector(s);
                if (q('[data-copy]')) q('[data-copy]').onclick = async () => { try { await navigator.clipboard.writeText(url); say('📋 Lien copié'); } catch (e) { q('.xsh-link input').select(); document.execCommand('copy'); say('📋 Lien copié'); } };
                if (q('[data-sh]')) q('[data-sh]').onclick = () => navigator.share({ title: meta.t + (meta.p ? ' — ' + meta.p : ''), text: meta.m || meta.t, url }).catch(() => { });
                if (q('[data-shf]')) q('[data-shf]').onclick = () => navigator.share({ files: [file], title: meta.t }).catch(() => { });
                if (q('[data-open]')) q('[data-open]').onclick = () => window.open(url, '_blank');
                q('[data-page]').onclick = async () => { try { const v = await (await fetch(base() + 'voir.html', { cache: 'no-store' })).text(); const page = v.replace('/*XSH_EMBED*/', 'window.XSH_EMBED=' + JSON.stringify(code) + ';'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([page], { type: 'text/html' })); a.download = (meta.t + (meta.p ? ' - ' + meta.p : '')).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_') + '.html'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { say('⚠️ Page de lecture introuvable (voir.html)'); } };
            } catch (e) { R.innerHTML = '<p class="xsh-warn">⚠️ ' + esc(e.message || e) + '</p>'; }
        };
    }
    function css() {
        if (document.getElementById('xsh-css')) return; const s = document.createElement('style'); s.id = 'xsh-css';
        s.textContent = '#xsh-ov{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:10310;display:flex;align-items:center;justify-content:center;font:13.5px/1.5 "Segoe UI",system-ui,sans-serif}.xsh-box{background:var(--bg-menu,#26262b);color:var(--text-main,#eee);border:1px solid var(--border-color,#444);border-radius:10px;width:560px;max-width:94vw;max-height:90vh;overflow:auto;padding:18px}.xsh-h{display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px}.xsh-h span{cursor:pointer;font-size:18px}.xsh-dim{color:var(--text-dim,#999);font-size:12.5px}.xsh-warn{color:#ffb74d}' +
            '.xsh-opt{display:flex;gap:9px;align-items:flex-start;padding:8px 10px;border:1px solid var(--border-color,#444);border-radius:8px;margin-bottom:6px;cursor:pointer}.xsh-opt input{margin-top:3px}.xsh-opt small{display:block;color:var(--text-dim,#999)}.xsh-f{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--text-dim,#aaa);margin:10px 0}.xsh-f input,.xsh-link input{width:100%;box-sizing:border-box;background:var(--bg-input,#17171a);color:inherit;border:1px solid var(--border-color,#555);border-radius:6px;padding:7px 9px;font:inherit}' +
            '.xsh-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.xsh-box button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#4a4a50);border-radius:8px;padding:7px 12px;cursor:pointer}.xsh-box .xsh-main{border-color:rgb(240,179,120);background:rgba(240,179,120,.3);font-weight:700}.xsh-link{display:flex;gap:6px;margin-top:10px}.xsh-qr{background:#fff;color:#333;border-radius:8px;padding:8px;width:220px;margin:10px auto 0;text-align:center}.xsh-qr svg{display:block;width:100%;height:auto}.xsh-qr small{font-size:11px}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; if (/^(index|jour|ludo|cadro)$/.test(app)) return;
        const add = () => { if (document.getElementById('xsh-btn')) return; const b = [...document.querySelectorAll('#top-bar button,#toolbar button')].find(x => /Dossier/i.test(x.getAttribute('onclick') || '') || /Vers DOSSIER/i.test(x.title || x.textContent || '')); if (!b) return; b.insertAdjacentHTML('afterend', '<button id="xsh-btn" title="Partager en lecture seule : lien, QR code ou page autonome, sans compte"><span class="btn-icon">🔗</span><span class="btn-label">Partager</span></button>'); document.getElementById('xsh-btn').onclick = open; };
        XBOOT.ready(add, 250); // avant le rangement de la barre (XBAR)
    }
    return { init, open, grab: grabCfg, pack };
})();

XSHARE.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XREFRESH : documents envoyés à DOSSIER XIII tenus à jour
//  • chaque outil note l'heure de sa dernière modification réelle (xiii.mod.APP)
//  • chaque envoi vers DOSSIER est enregistré (xiii.sent : clé → outil, titre, heure)
//  • ouvert avec #xrefresh=clé1|clé2 (par DOSSIER, en arrière-plan), l'outil régénère ces documents
//    sans fenêtre et les renvoie : DOSSIER remplace l'ancienne version à la même place.
// =====================================================================
const XREFRESH = (() => {
    let APP = '', AUTO = null;
    const PAGE = () => (location.pathname.split('/').pop() || (APP + '.html')).replace(/-m\.html$/, '.html');
    const raw = Storage.prototype.setItem;
    const jget = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || '') || d; } catch (e) { return d; } };
    function trackMods() {
        let t = 0;
        Storage.prototype.setItem = function (k, v) {
            if (this === localStorage && APP && !/^xiii\.|prefs|tour|theme|\.ui$|settings/i.test(k)) { try { if (this.getItem(k) !== String(v)) { const now = Date.now(); if (now - t > 1500) { t = now; raw.call(this, 'xiii.mod.' + APP, String(now)); } } } catch (e) { } }
            return raw.apply(this, arguments);
        };
    }
    function reg(key, title) { const R = jget('xiii.sent', {}); R[key] = { app: APP, page: PAGE(), title, ts: Date.now() }; const ks = Object.keys(R); if (ks.length > 400) ks.sort((a, b) => R[a].ts - R[b].ts).slice(0, ks.length - 400).forEach(k => delete R[k]); try { raw.call(localStorage, 'xiii.sent', JSON.stringify(R)); } catch (e) { } }
    const keyOf = c => c.key || ('t:' + APP + ':' + c.title);
    function banner(t, ok) { let b = document.getElementById('xr-ban'); if (!b) { b = document.createElement('div'); b.id = 'xr-ban'; b.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483600;background:#26262b;color:#fff;border:1px solid rgba(240,179,120,.8);border-radius:10px;padding:10px 16px;font:13px Segoe UI,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5)'; document.body.appendChild(b); } b.textContent = t; if (ok != null) b.style.borderColor = ok ? '#66bb6a' : '#e57373'; }
    async function autoSend(cfg) {
        const want = AUTO.keys[AUTO.i], c = cfg.choices.find(x => keyOf(x) === want) || cfg.choices.find(x => want.indexOf('t:') === 0 && want.slice(want.indexOf(':', 2) + 1) === x.title);
        if (!c) throw new Error('document introuvable dans l\'outil');
        const r = await c.make(); if (!r || (!r.blob && !r.html)) throw new Error('aucun document produit');
        const p = { format: 'xiii-link', version: 1, kind: 'document', id: XIII.id(), from: cfg.from, app: cfg.app, ts: Date.now(), created: new Date().toISOString(), project: { name: cfg.project || '' }, title: c.title, target: { title: c.title, keywords: c.keywords || [] }, key: keyOf(c), oldKey: want !== keyOf(c) ? want : '', file: r.blob ? { name: r.name || (XIII.safe(c.title) + '.pdf'), type: r.type || r.blob.type || 'application/pdf', blob: r.blob } : null, html: r.html || null, to: 'dossier', auto: 1 };
        await XIII.put(p); try { await XIII.offer('dossier', p.id); } catch (e) { }
        reg(p.key, c.title); return c.title;
    }
    function wrapSend() {
        if (typeof window.xiiiSendToDossier !== 'function' || window.xiiiSendToDossier.__xr) return;
        const orig = window.xiiiSendToDossier;
        const w = function (cfg) {
            (cfg.choices || []).forEach(c => { const k = keyOf(c); c.key = k; const mk = c.make; c.make = async function () { const r = await mk.apply(this, arguments); if (r) reg(k, c.title); return r; }; });
            if (AUTO && AUTO.wait) { const res = AUTO.wait; AUTO.wait = null; autoSend(cfg).then(res.ok, res.ko); return; }
            return orig.apply(this, arguments);
        };
        w.__xr = 1; window.xiiiSendToDossier = w;
    }
    function opener() {
        const names = Object.keys(window).filter(k => { try { return typeof window[k] === 'function' && /^(open|send)/i.test(k) && /Dossier/i.test(k) && String(window[k]).indexOf('xiiiSendToDossier') > -1; } catch (e) { return false; } });
        if (names.length) return () => window[names[0]]();
        const b = [...document.querySelectorAll('button,[onclick]')].find(x => /Dossier/i.test(x.getAttribute('onclick') || '') || /Vers DOSSIER/i.test(x.title || x.textContent || ''));
        return b ? () => b.click() : null;
    }
    async function runAuto() {
        const go = opener(); const done = [], bad = [];
        if (!go) { banner('⚠️ Envoi vers DOSSIER introuvable dans cet outil', false); report(done, ['outil']); return; }
        for (AUTO.i = 0; AUTO.i < AUTO.keys.length; AUTO.i++) {
            banner('⟳ Mise à jour pour DOSSIER XIII… (' + (AUTO.i + 1) + '/' + AUTO.keys.length + ')');
            try {
                const t = await new Promise((ok, ko) => { AUTO.wait = { ok, ko }; setTimeout(() => ko(new Error('délai dépassé')), 90000); try { const r = go(); if (r && r.catch) r.catch(ko); } catch (e) { ko(e); } });
                done.push(t); const ov = document.getElementById('xiii-send'); if (ov) ov.remove();
            } catch (e) { bad.push(AUTO.keys[AUTO.i] + ' : ' + (e.message || e)); }
        }
        banner(bad.length ? '⚠️ ' + done.length + ' mis à jour, ' + bad.length + ' en échec' : '✅ ' + done.length + ' document(s) mis à jour dans DOSSIER XIII', !bad.length); report(done, bad);
        if (window.opener || window.parent !== window) setTimeout(() => { try { if (window.parent === window) window.close(); } catch (e) { } }, 1600);
    }
    function report(done, bad) { try { const m = { t: 'xrefresh-done', app: APP, done, bad }; if (window.parent !== window) window.parent.postMessage(m, location.origin); if (window.opener) window.opener.postMessage(m, location.origin); } catch (e) { } }
    function init(app) {
        APP = app; if (app === 'dossier') return; trackMods();
        const h = /[#&]xrefresh=([^&]+)/.exec(location.hash);
        if (h) { AUTO = { keys: decodeURIComponent(h[1]).split('|').filter(Boolean), i: 0 }; try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } }
        const ready = () => { wrapSend(); setInterval(wrapSend, 2000); if (AUTO) setTimeout(runAuto, 2200); };
        XBOOT.ready(ready, 300);
    }
    return { init, get auto() { return AUTO; } };
})();

XREFRESH.init(XIII_APP);

// =====================================================================
//  SUITE XIII — XDELEG : 🤝 déléguer un outil à un membre de l'équipe, sans compte ni serveur
//  Le Master envoie un lien (deleg.html#i=…) : le contenu de l'outil voyage compressé dans l'adresse.
//  Le membre remplit l'outil dans son navigateur (ses propres projets sont mis de côté puis restaurés),
//  puis renvoie son travail par un lien de retour (deleg.html#r=…). Le lien d'invitation reste valable :
//  le membre peut le rouvrir, reprendre son travail et renvoyer une nouvelle version.
//  Le Master ouvre le lien de retour : l'outil propose l'import, compare la date avec la dernière version
//  importée et garde une copie de sauvegarde (annulation possible).
// =====================================================================
const XDELEG = (() => {
    const KEYS = {
        backupo: ['backupoXIII.project'], callsheeto: ['callsheetoXIII.project'], casto: ['castoXIII.project'], conduco: ['conducoXIII.project'], decoup: ['decoupXIII.project'],
        deviso: ['devisoXIII.project'], graphico: ['graphicoXIII.project'], melango: ['melangoXIII.project'], lumo: ['lumoXIII.project'], moodo: ['moodoXIII.project'], packingo: ['packingoXIII.project'],
        planno: ['plannoXIII.project'], plano: ['planoXIII.project'], posto: ['postoXIII.project'], repero: ['reperoXIII.project'], ressourco: ['ressourcoXIII.project'],
        runo: ['runoXIII.project'], scripto: ['scriptoXIII.project'], sono: ['sonoXIII.project'], soustitro: ['soustitroXIII.project'], storyboardo: ['storyboardoXIII.project'],
        syno: ['synoptique_projects'], transporto: ['transportoXIII.project'], catalogue: ['xiii.catalogue'], matos: ['matosXIII.parc']
    };
    const NAMES = { melango: 'MELANGO', matos: 'MATOS', catalogue: 'CATALOGUE', backupo: 'BACKUPO', callsheeto: 'CALL SHEETO', casto: 'CASTO', conduco: 'CONDUCO', decoup: 'DECOUP', deviso: 'DEVISO', graphico: 'GRAPHICO', lumo: 'LUMO', moodo: 'MOODO', packingo: 'PACKINGO', planno: 'PLANNO', plano: 'PLANO', posto: 'POSTO', repero: 'REPERO', ressourco: 'RESSOURCO', runo: 'RUNO', scripto: 'SCRIPTO', sono: 'SONO', soustitro: 'SOUSTITRO', storyboardo: 'STORYBOARDO', syno: 'SYNO', transporto: 'TRANSPORTO' };
    const IMG = /^(moodo|repero|storyboardo|graphico)$/; // photos et images rangées à part (IndexedDB) : non transmises
    let APP = '', LOCK = null;
    const K_ME = 'xiii.deleg.me', K_SENT = 'xiii.deleg.sent', K_IN = 'xiii.deleg.inbox', K_ACT = a => 'xiii.deleg.active.' + a, K_OWN = a => 'xiii.deleg.own.' + a, K_WORK = 'xiii.deleg.works', K_BAK = a => 'xiii.deleg.bak.' + a;
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    // écriture brute : ignore le verrou posé pendant un rechargement
    const RAW = Storage.prototype.setItem;
    const W = (k, v) => { try { if (v == null) localStorage.removeItem(k); else RAW.call(localStorage, k, typeof v === 'string' ? v : JSON.stringify(v)); return true; } catch (e) { say('⚠️ Stockage du navigateur plein'); return false; } };
    // pendant un rechargement, l'outil ne doit pas réécrire ses anciennes données par-dessus celles qu'on vient de poser
    Storage.prototype.setItem = function (k, v) { if (LOCK && this === localStorage && LOCK.indexOf(k) > -1) return; return RAW.call(this, k, v); };
    const say = (m, ms) => { try { if (typeof toast === 'function') toast(m, ms); else alert(m); } catch (e) { } };
    const uid = () => 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const fmt = ts => { const d = new Date(ts); return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
    const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    async function pack(obj) { const txt = new TextEncoder().encode(JSON.stringify(obj)); if (typeof CompressionStream !== 'function') return 'j.' + b64u(txt); const st = new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'z.' + b64u(new Uint8Array(await new Response(st).arrayBuffer())); }
    const base = () => location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    const fiche = () => { const s = J('xiii.projets', null); return s && s.list ? s.list.find(f => f && f.id === s.active) || null : null; };
    function grab() { // contenu actuel de l'outil (après un enregistrement forcé)
        try { if (typeof saveProject === 'function') saveProject(false); else if (typeof saveState === 'function') saveState(false); else if (typeof saveAllToBrowser === 'function') saveAllToBrowser(false); } catch (e) { }
        const o = {}; (KEYS[APP] || []).forEach(k => { const v = localStorage.getItem(k); if (v != null) o[k] = v; }); return o;
    }
    function put(data, after) { // pose les données puis recharge l'outil (une version 🗂️ de l'état actuel est gardée avant)
        if (typeof XHIST !== 'undefined' && put.ok !== 2) { if (put.ok === 1) return; put.ok = 1; const go = () => { put.ok = 2; put(data, after); }; Promise.race([XHIST.before(after), new Promise(r => setTimeout(r, 1500))]).then(go, go); return; }
        put.ok = 0;
        const keys = KEYS[APP] || []; keys.forEach(k => W(k, data && data[k] != null ? data[k] : null));
        LOCK = keys.slice(); if (after) W('xiii.deleg.after', after);
        location.replace(location.href.replace(/#.*$/, ''));
    }
    const dlg = html => { let o = document.getElementById('xdl-ov'); if (o) o.remove(); o = document.createElement('div'); o.id = 'xdl-ov'; o.innerHTML = '<div class="xdl-box">' + html + '</div>'; document.body.appendChild(o); o.querySelectorAll('[data-x]').forEach(b => b.onclick = () => o.remove()); return o; };
    function mail(to, subj, body, link) {
        const short = link.length < 1700, txt = body + '\n\n' + (short ? link : '👉 Collez ici le lien (il a été copié) :\n') + '\n';
        try { navigator.clipboard && navigator.clipboard.writeText(link); } catch (e) { }
        location.href = 'mailto:' + encodeURIComponent(to || '') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(txt);
        return short;
    }
    // ---------- MASTER : envoyer une invitation ----------
    function openInvite(pre) {
        if (J(K_ACT(APP), null)) { say('Vous travaillez déjà pour un Master dans cet outil'); return; }
        const PT = parts(grab()), me = J(K_ME, {}), f = fiche(), sent = J(K_SENT, []).filter(x => x.app === APP), book = J('xiii.annuaire', []);
        const o = dlg('<h3>🤝 Déléguer ' + esc(NAMES[APP]) + '<span data-x class="xdl-x">✕</span></h3><p class="xdl-h">Un membre de l\'équipe remplit cet outil de son côté, puis vous renvoie son travail par un lien. Le lien reste valable : il peut renvoyer une version mise à jour à tout moment.</p>' +
            '<div class="xdl-g"><label>Votre nom<input id="xdl-mn" value="' + esc(me.name || '') + '"></label><label>Votre e-mail (pour recevoir le travail)<input id="xdl-me" type="email" value="' + esc(me.email || '') + '"></label>' +
            '<label>Membre de l\'équipe<input id="xdl-tn" list="xdl-bk" placeholder="Prénom Nom"></label><label>Son e-mail<input id="xdl-te" type="email"></label>' +
            '<label class="w">Message<textarea id="xdl-msg" rows="3">Peux-tu compléter ' + esc(NAMES[APP]) + (f && f.title ? ' pour « ' + esc(f.title) + ' »' : '') + ' et me le renvoyer avec le bouton « 📤 Renvoyer au Master » ? Merci !</textarea></label>' +
            (PT.length ? '<label class="w">Partie à confier<select id="xdl-pt"><option value="">Tout l\'outil</option>' + PT.map((x, i) => '<option value="' + i + '">' + esc(x.label) + '</option>').join('') + '</select></label><label class="w ck" id="xdl-onl" style="display:none"><input type="checkbox" id="xdl-only" checked> N\'envoyer que cette partie (le membre ne voit pas le reste)</label>' : '') +
            '<label class="w ck"><input type="checkbox" id="xdl-inc" checked> Envoyer le contenu actuel de l\'outil (le membre part de votre travail)' + (IMG.test(APP) ? ' — les photos et images ne sont pas transmises' : '') + '</label></div>' +
            '<datalist id="xdl-bk">' + book.filter(c => c && c.name).map(c => '<option value="' + esc(c.name) + '">').join('') + '</datalist>' +
            '<div class="xdl-b"><a href="echanges.html" target="_blank" style="margin-right:auto;align-self:center;color:rgb(240,179,120)">📨 Toutes les échanges</a><button data-x>Annuler</button><button id="xdl-cp">📋 Copier le lien</button><button id="xdl-go" class="ok">✉️ Envoyer par e-mail</button></div>' +
            (sent.length ? '<h4>Délégations en cours</h4>' + sent.slice().reverse().map(x => '<div class="xdl-row"><b>' + esc(x.to || 'Membre') + '</b> <small>envoyé le ' + fmt(x.ts) + (x.last ? ' · dernière version importée : ' + fmt(x.last) : ' · rien reçu') + '</small>' + (x.link ? '<button data-re="' + x.id + '" title="Recopier le lien d\'invitation">📋</button>' : '') + '</div>').join('') : '') +
            (J(K_BAK(APP), null) ? '<p class="xdl-h">↩ <a href="#" id="xdl-undo">Revenir au contenu d\'avant le dernier import</a> (' + fmt(J(K_BAK(APP), {}).ts) + ')</p>' : ''));
        const pts = o.querySelector('#xdl-pt'); if (pts) pts.onchange = () => { o.querySelector('#xdl-onl').style.display = pts.value !== '' ? '' : 'none'; };
        if (pre && pts) { const i = PT.findIndex(x => x.label.indexOf(pre) > -1); if (i > -1) { pts.value = String(i); pts.onchange(); } if (pre.mail) o.querySelector('#xdl-te').value = pre.mail; }
        o.querySelector('#xdl-tn').oninput = e => { const c = book.find(x => x && x.name === e.target.value); if (c && c.email) o.querySelector('#xdl-te').value = c.email; };
        const make = async () => {
            const mn = o.querySelector('#xdl-mn').value.trim(), mev = o.querySelector('#xdl-me').value.trim(), tn = o.querySelector('#xdl-tn').value.trim(), te = o.querySelector('#xdl-te').value.trim();
            if (!mev) { o.querySelector('#xdl-me').focus(); say('Indiquez votre e-mail : le travail vous sera renvoyé à cette adresse'); return null; }
            W(K_ME, { name: mn, email: mev });
            const ptv = o.querySelector('#xdl-pt') ? o.querySelector('#xdl-pt').value : '', sc = ptv !== '' ? PT[+ptv] : null, only = sc && o.querySelector('#xdl-only').checked;
            let data = o.querySelector('#xdl-inc').checked || sc ? grab() : null; if (data && only) data = strip(data, sc);
            const id = uid(), p = { t: 'i', v: 1, id, app: APP, ts: Date.now(), master: { name: mn, email: mev }, to: { name: tn, email: te }, msg: o.querySelector('#xdl-msg').value, proj: f ? f.title || '' : '', fiche: f || null, data, scope: sc, notes: notes() };
            const link = base() + 'deleg.html#i=' + await pack(p);
            W('xiii.deleg.base.' + id, { ts: p.ts, data: p.data || {}, scope: sc }); // point de départ : la fusion n'applique que ce que le membre a changé
            const S = J(K_SENT, []); S.push({ id, app: APP, to: tn || te, email: te, ts: p.ts, part: sc ? sc.label : '', link: link.length < 200000 ? link : '' }); W(K_SENT, S.slice(-60));
            return { link, p };
        };
        o.querySelector('#xdl-go').onclick = async () => { const r = await make(); if (!r) return; const sh = mail(r.p.to.email, 'SUITE XIII — ' + NAMES[APP] + (r.p.proj ? ' · ' + r.p.proj : '') + ' à compléter', (r.p.to.name ? 'Bonjour ' + r.p.to.name.split(' ')[0] + ',' : 'Bonjour,') + '\n\n' + r.p.msg + '\n\nOuvrez ce lien dans votre navigateur (ordinateur conseillé) :', r.link); o.remove(); say(sh ? '✉️ Invitation prête dans votre messagerie' : '✉️ Le lien est long : il a été copié, collez-le dans l\'e-mail', 6000); };
        o.querySelector('#xdl-cp').onclick = async () => { const r = await make(); if (!r) return; try { await navigator.clipboard.writeText(r.link); say('📋 Lien d\'invitation copié'); } catch (e) { prompt('Copiez le lien :', r.link); } o.remove(); };
        o.querySelectorAll('[data-re]').forEach(b => b.onclick = async () => { const x = J(K_SENT, []).find(y => y.id === b.dataset.re); if (x && x.link) { try { await navigator.clipboard.writeText(x.link); say('📋 Lien recopié'); } catch (e) { prompt('Lien :', x.link); } } });
        const u = o.querySelector('#xdl-undo'); if (u) u.onclick = e => { e.preventDefault(); const b = J(K_BAK(APP), null); if (!b) return; W(K_BAK(APP), null); o.remove(); put(b.data, { t: 'msg', m: '↩ Contenu d\'avant l\'import restauré' }); };
    }

    // ---------- 💬 commentaires et validations : un fil par élément, qui voyage avec les liens ----------
    const K_NOTES = () => 'xiii.notes.' + APP;
    const notes = () => J(K_NOTES(), {});
    const myName = () => { const A = J(K_ACT(APP), null); return (A && A.to && A.to.name) || J(K_ME, {}).name || ''; };
    function mergeNotes(inc) { // réunion des fils (messages identiques ignorés) ; le statut le plus récent l'emporte
        if (!inc || typeof inc !== 'object') return 0; const N = notes(); let n = 0;
        Object.keys(inc).forEach(id => { const a = N[id] || (N[id] = { label: inc[id].label, thread: [] }), b = inc[id]; const seen = new Set(a.thread.map(m => m.ts + '|' + m.who));
            (b.thread || []).forEach(m => { if (!seen.has(m.ts + '|' + m.who)) { a.thread.push(m); n++; } }); a.thread.sort((x, y) => x.ts - y.ts); if (b.label) a.label = b.label;
            if ((b.sts || 0) > (a.sts || 0)) { a.status = b.status; a.by = b.by; a.sts = b.sts; } });
        W(K_NOTES(), N); refreshNoteBtn(); return n;
    }
    function elements() { // tout ce qui a un identifiant et un nom dans l'outil
        const out = [], seen = new Set(), data = grab();
        (KEYS[APP] || []).forEach(k => { const walk = (n, d, pre) => { if (!n || typeof n !== 'object' || d > 5 || out.length > 600) return; if (Array.isArray(n)) { n.forEach(x => walk(x, d + 1, pre)); return; }
            const id = idOf(n), nm = nameOf(n); let pre2 = pre; if (id != null && nm && !seen.has(id)) { seen.add(id); out.push({ id, label: (pre ? pre + ' › ' : '') + nm }); if (Object.values(n).some(v => Array.isArray(v) && v.length && v.every(y => idOf(y) != null))) pre2 = nm; }
            Object.values(n).forEach(v => { if (v && typeof v === 'object') walk(v, d + 1, pre2); }); }; walk(parse(data[k]), 0, ''); });
        return out;
    }
    const ST2 = { ok: ['✅', 'Validé', 'xdl-ok'], rev: ['🔁', 'À revoir', 'xdl-warn'] };
    function refreshNoteBtn() { const b = document.getElementById('xnt-btn'); if (!b) return; const N = notes(), open = Object.values(N).filter(t => t.status === 'rev' || (!t.status && t.thread.length)).length; b.dataset.n = open || ''; b.title = 'Commentaires et validations' + (open ? ' — ' + open + ' à traiter' : ''); }
    function openNotes(focus) {
        const N = notes(), ids = Object.keys(N).sort((a, b) => ((N[b].thread.slice(-1)[0] || {}).ts || N[b].sts || 0) - ((N[a].thread.slice(-1)[0] || {}).ts || N[a].sts || 0));
        const EL = elements(), f = openNotes.f || '';
        const vis = ids.filter(id => !f || (f === 'rev' && N[id].status === 'rev') || (f === 'ok' && N[id].status === 'ok') || (f === 'open' && !N[id].status));
        const o = dlg('<h3>💬 Commentaires et validations — ' + esc(NAMES[APP]) + '<span data-x class="xdl-x">✕</span></h3>' +
            '<div class="xdl-g"><label class="w">Nouveau commentaire sur<select id="xnt-el"><option value="__all">Tout l\'outil (général)</option>' + EL.map(e => '<option value="' + esc(e.id) + '"' + (focus === e.id ? ' selected' : '') + '>' + esc(e.label) + '</option>').join('') + '</select></label><label class="w"><textarea id="xnt-tx" rows="2" placeholder="Votre remarque…"></textarea></label></div>' +
            '<div class="xdl-b" style="margin-top:4px"><input id="xnt-me" value="' + esc(myName()) + '" placeholder="Votre nom" style="width:140px;margin-right:auto"><button id="xnt-add" class="ok">💬 Ajouter</button></div>' +
            '<div class="xdl-ft"><span>' + [['', 'Tous'], ['open', 'Ouverts'], ['rev', '🔁 À revoir'], ['ok', '✅ Validés']].map(x => '<a href="#" data-f="' + x[0] + '" style="margin-right:10px;' + (f === x[0] ? 'font-weight:700;color:rgb(240,179,120)' : 'color:inherit') + '">' + x[1] + '</a>').join('') + '</span><span>' + ids.length + ' fil(s)</span></div>' +
            '<div class="xdl-ch">' + (vis.length ? vis.map(id => { const t = N[id], st = ST2[t.status]; return '<div class="xnt-t" data-id="' + esc(id) + '"><div class="xnt-h"><b>' + esc(t.label || id) + '</b>' + (st ? ' <span class="' + st[2] + '">' + st[0] + ' ' + st[1] + (t.by ? ' par ' + esc(t.by) : '') + '</span>' : '') + '</div>' +
                t.thread.map(m => '<div class="xnt-m"><b>' + esc(m.who || '—') + '</b> <small>' + fmt(m.ts) + '</small><br>' + esc(m.txt).replace(/\n/g, '<br>') + '</div>').join('') +
                '<div class="xnt-a"><input data-rep placeholder="Répondre…"><button data-s="ok" title="Valider">✅</button><button data-s="rev" title="À revoir">🔁</button>' + (t.status ? '<button data-s="" title="Rouvrir">↺</button>' : '') + '<button data-d title="Supprimer le fil">✕</button></div></div>'; }).join('') : '<p class="xdl-h" style="padding:10px">Aucun commentaire' + (f ? ' dans ce filtre' : '') + '. Commentez un élément ci-dessus : le fil part avec vos liens de délégation et revient avec les réponses.</p>') + '</div>' +
            '<div class="xdl-b"><button id="xnt-chat" title="Discuter avec toute l\'équipe (tapez @ pour mentionner)">💬 Chat du projet</button><button id="xnt-dos" title="Envoyer le journal des commentaires et validations à DOSSIER XIII">📚 Journal vers DOSSIER</button><button data-x class="ok">Fermer</button></div>');
        const who = () => { const v = o.querySelector('#xnt-me').value.trim(); if (v) { const me = J(K_ME, {}); if (!J(K_ACT(APP), null) && me.name !== v) { me.name = v; W(K_ME, me); } } return v || 'Moi'; };
        const lab = id => id === '__all' ? 'Général' : (EL.find(e => e.id === id) || {}).label || id;
        const save = (fn) => { const N2 = notes(); fn(N2); W(K_NOTES(), N2); refreshNoteBtn(); o.remove(); openNotes(); };
        o.querySelector('#xnt-add').onclick = () => { const tx = o.querySelector('#xnt-tx').value.trim(); if (!tx) return; const id = o.querySelector('#xnt-el').value, w = who(); save(N2 => { const t = N2[id] || (N2[id] = { label: lab(id), thread: [] }); t.thread.push({ who: w, txt: tx, ts: Date.now() }); if (t.status === 'ok') { t.status = null; t.sts = Date.now(); } }); };
        o.querySelectorAll('[data-f]').forEach(a => a.onclick = e => { e.preventDefault(); openNotes.f = a.dataset.f; o.remove(); openNotes(); });
        o.querySelectorAll('.xnt-t').forEach(d => { const id = d.dataset.id, w = () => who();
            d.querySelector('[data-rep]').onkeydown = e => { if (e.key === 'Enter' && e.target.value.trim()) { const tx = e.target.value.trim(), ww = w(); save(N2 => N2[id].thread.push({ who: ww, txt: tx, ts: Date.now() })); } };
            d.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const ww = w(); save(N2 => { N2[id].status = b.dataset.s || null; N2[id].by = ww; N2[id].sts = Date.now(); N2[id].thread.push({ who: ww, txt: b.dataset.s === 'ok' ? '✅ Validé' : b.dataset.s === 'rev' ? '🔁 À revoir' : '↺ Rouvert', ts: Date.now(), sys: 1 }); }); });
            d.querySelector('[data-d]').onclick = () => { if (confirm('Supprimer ce fil de commentaires ?')) save(N2 => { delete N2[id]; }); }; });
        o.querySelector('#xnt-chat').onclick = () => { const el = o.querySelector('#xnt-el'), lb = el && el.value !== '__all' ? el.options[el.selectedIndex].text : ''; o.remove(); if (window.XMENT && XMENT.openChat) XMENT.openChat(lb); };
        o.querySelector('#xnt-dos').onclick = () => { if (typeof xiiiSendToDossier !== 'function') { say('Envoi vers DOSSIER indisponible'); return; } const N2 = notes(), ks = Object.keys(N2); if (!ks.length) { say('Aucun commentaire'); return; } o.remove();
            const html = '<p><b>Journal des commentaires et validations — ' + esc(NAMES[APP]) + '</b> (' + new Date().toLocaleDateString('fr-FR') + ')</p>' + ks.map(id => { const t = N2[id], st = ST2[t.status]; return '<p><b>' + esc(t.label || id) + '</b> — ' + (st ? st[1] + (t.by ? ' par ' + esc(t.by) : '') + ' le ' + fmt(t.sts) : 'ouvert') + '</p><ul>' + t.thread.map(m => '<li>' + esc(fmt(m.ts)) + ' — <b>' + esc(m.who) + '</b> : ' + esc(m.txt) + '</li>').join('') + '</ul>'; }).join('');
            xiiiSendToDossier({ app: 'SUITE XIII', from: APP, project: (fiche() || {}).title || '', choices: [{ label: 'Journal des validations ' + NAMES[APP], sub: ks.length + ' fil(s) de commentaires avec leur statut', title: 'Validations — ' + NAMES[APP], keywords: ['validation', 'commentaires', 'suivi'], key: 'notes:' + APP, make: async () => ({ html }) }] }); };
    }
    // ---------- MEMBRE : mode délégation ----------
    function startMember(p) {
        if (p.notes) mergeNotes(p.notes);
        const A = J(K_ACT(APP), null), works = J(K_WORK, {}), w = works[p.id];
        const go = data => { if (!A) W(K_OWN(APP), { ts: Date.now(), data: grab() }); W(K_ACT(APP), { id: p.id, app: APP, master: p.master, to: p.to, proj: p.proj, msg: p.msg, ts: p.ts, scope: p.scope || null }); if (p.fiche) mergeFiche(p.fiche); put(data, { t: 'msg', m: '🤝 Vous travaillez pour ' + (p.master.name || p.master.email) + ' : renvoyez votre travail avec « 📤 Renvoyer au Master »' }); };
        if (A && A.id === p.id) { banner(); return; }
        const o = dlg('<h3>🤝 ' + esc(p.master.name || p.master.email || 'Le Master') + ' vous demande de compléter ' + esc(NAMES[APP]) + '<span data-x class="xdl-x">✕</span></h3>' + (p.proj ? '<p><b>Projet :</b> ' + esc(p.proj) + '</p>' : '') + (p.msg ? '<blockquote class="xdl-q">' + esc(p.msg).replace(/\n/g, '<br>') + '</blockquote>' : '') +
            '<p class="xdl-h">Vos propres projets dans ' + esc(NAMES[APP]) + ' sont mis de côté pendant ce travail, et restaurés quand vous cliquez sur « Terminer ». Tout reste dans votre navigateur.</p>' +
            (A ? '<p class="xdl-warn">⚠️ Vous travaillez déjà pour une autre demande dans cet outil : elle sera sauvegardée et vous pourrez la reprendre en rouvrant son lien.</p>' : '') +
            '<div class="xdl-b"><button data-x>Plus tard</button>' + (w ? '<button id="xdl-new">Repartir de la version reçue</button><button id="xdl-res" class="ok">▶ Reprendre mon travail (' + fmt(w.ts) + ')</button>' : '<button id="xdl-ok" class="ok">▶ Commencer</button>') + '</div>');
        const pre = () => { if (A) { const W2 = J(K_WORK, {}); W2[A.id] = { ts: Date.now(), data: grab(), meta: A }; W(K_WORK, W2); } };
        const b1 = o.querySelector('#xdl-ok'), b2 = o.querySelector('#xdl-res'), b3 = o.querySelector('#xdl-new');
        if (b1) b1.onclick = () => { pre(); go(p.data || {}); };
        if (b2) b2.onclick = () => { pre(); go(w.data); };
        if (b3) b3.onclick = () => { pre(); go(p.data || {}); };
    }
    function mergeFiche(f) { try { const s = J('xiii.projets', { active: '', list: [] }); if (!s.list.find(x => x && x.id === f.id)) { s.list.push(f); } W('xiii.projets', s); } catch (e) { } }
    async function sendBack() {
        const A = J(K_ACT(APP), null); if (!A) return;
        const data = grab(), ts = Date.now(), works = J(K_WORK, {}); works[A.id] = { ts, data, meta: A }; W(K_WORK, works);
        const me = J(K_ME, {});
        const p = { t: 'r', v: 1, id: A.id, app: APP, ts, scope: A.scope || null, notes: notes(), from: { name: A.to && A.to.name || me.name || '', email: A.to && A.to.email || me.email || '' }, proj: A.proj, data };
        const link = base() + 'deleg.html#r=' + await pack(p);
        const sh = mail(A.master && A.master.email, 'SUITE XIII — ' + NAMES[APP] + (A.proj ? ' · ' + A.proj : '') + ' complété (' + fmt(ts) + ')', 'Bonjour' + (A.master && A.master.name ? ' ' + A.master.name.split(' ')[0] : '') + ',\n\nVoici mon travail sur ' + NAMES[APP] + ' (version du ' + fmt(ts) + '). Ouvrez ce lien pour l\'importer :', link);
        say(sh ? '📤 E-mail de retour prêt dans votre messagerie' : '📤 Le lien est long : il a été copié, collez-le dans l\'e-mail au Master', 7000);
    }
    function finish() {
        const A = J(K_ACT(APP), null); if (!A) return;
        const o = dlg('<h3>Terminer le travail pour ' + esc(A.master && (A.master.name || A.master.email) || 'le Master') + '<span data-x class="xdl-x">✕</span></h3><p>Votre travail est sauvegardé : en rouvrant le lien reçu, vous le retrouverez pour le modifier et le renvoyer. Vos propres projets ' + esc(NAMES[APP]) + ' vont être restaurés.</p><div class="xdl-b"><button data-x>Annuler</button><button id="xdl-send">📤 Renvoyer d\'abord</button><button id="xdl-end" class="ok">Terminer</button></div>');
        o.querySelector('#xdl-send').onclick = () => { o.remove(); sendBack(); };
        o.querySelector('#xdl-end').onclick = () => { const works = J(K_WORK, {}); works[A.id] = { ts: Date.now(), data: grab(), meta: A }; W(K_WORK, works); const own = J(K_OWN(APP), null); W(K_ACT(APP), null); W(K_OWN(APP), null); put(own ? own.data : {}, { t: 'msg', m: '✓ Vos projets ' + NAMES[APP] + ' sont restaurés' }); };
    }
    function banner() {
        const A = J(K_ACT(APP), null), old = document.getElementById('xdl-ban'); if (old) old.remove(); if (!A) return;
        const b = document.createElement('div'); b.id = 'xdl-ban';
        b.innerHTML = '<span>🤝 Travail pour <b>' + esc(A.master && (A.master.name || A.master.email) || 'le Master') + '</b>' + (A.proj ? ' · ' + esc(A.proj) : '') + (A.scope ? ' · ✂️ ' + esc(A.scope.label) : '') + '</span><button id="xdl-bs" class="ok">📤 Renvoyer au Master</button><button id="xdl-be" title="Sauvegarder ce travail et retrouver vos propres projets">Terminer</button>';
        document.body.appendChild(b); b.querySelector('#xdl-bs').onclick = sendBack; b.querySelector('#xdl-be').onclick = finish;
    }
    // ---------- MASTER : recevoir un retour ----------

    // ---------- 🔀 fusion : ce que le membre a changé, appliqué à votre version actuelle ----------
    const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
    const idOf = o => isObj(o) && o.id != null ? String(o.id) : null;
    const idArr = (a, b) => Array.isArray(a) && Array.isArray(b) && (a.length || b.length) && a.concat(b).every(x => idOf(x) != null);
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function diff(a, b, path, out) {
        if (same(a, b)) return out;
        if (idArr(a, b)) {
            const A = new Map(a.map(x => [idOf(x), x])), B = new Map(b.map(x => [idOf(x), x]));
            b.forEach((x, i) => { const id = idOf(x); if (!A.has(id)) out.push({ op: 'add', path, id, val: x, after: i ? idOf(b[i - 1]) : null }); else diff(A.get(id), x, path.concat([{ id }]), out); });
            a.forEach(x => { const id = idOf(x); if (!B.has(id)) out.push({ op: 'del', path, id, old: x }); });
            return out;
        }
        if (isObj(a) && isObj(b)) { new Set(Object.keys(a).concat(Object.keys(b))).forEach(k => diff(a[k], b[k], path.concat([k]), out)); return out; }
        out.push({ op: 'set', path, old: a, val: b }); return out;
    }
    function nav(root, path, mk) { let o = root; for (const st of path) { if (o == null) return undefined; if (typeof st === 'object') { if (!Array.isArray(o)) return undefined; o = o.find(x => idOf(x) === st.id); } else { if (o[st] == null && mk) o[st] = {}; o = o[st]; } } return o; }
    function applyOp(root, c) {
        if (c.op === 'set') { const par = nav(root, c.path.slice(0, -1), true), k = c.path[c.path.length - 1]; if (par == null || typeof k === 'object') return false; if (c.val === undefined) delete par[k]; else par[k] = JSON.parse(JSON.stringify(c.val)); return true; }
        let arr = nav(root, c.path, false);
        if (!Array.isArray(arr)) { if (c.op !== 'add') return false; const par = nav(root, c.path.slice(0, -1), true); if (!isObj(par)) return false; arr = par[c.path[c.path.length - 1]] = []; }
        const i = arr.findIndex(x => idOf(x) === c.id);
        if (c.op === 'del') { if (i > -1) arr.splice(i, 1); return i > -1; }
        if (i > -1) return false; const j = c.after != null ? arr.findIndex(x => idOf(x) === c.after) : -1; arr.splice(j > -1 ? j + 1 : (c.after == null ? 0 : arr.length), 0, JSON.parse(JSON.stringify(c.val))); return true;
    }
    const noop = (cur, c) => { if (c.op === 'set') return same(nav(cur, c.path, false), c.val); const arr = nav(cur, c.path, false), has = Array.isArray(arr) && arr.some(x => idOf(x) === c.id); return c.op === 'add' ? has : !has; };
    const parse = v => { try { return JSON.parse(v); } catch (e) { return v; } };
    const NAMEK = ['name', 'label', 'title', 'n', 'nom', 'src', 't', 'text', 'ref', 'role', 'poste', 'desc'];
    const nameOf = o => { if (!isObj(o)) return ''; for (const k of NAMEK) if (typeof o[k] === 'string' && o[k].trim()) return o[k].trim().slice(0, 60); return ''; };
    const COL = { tasks: 'Tâche', items: 'Élément', tabs: 'Onglet', days: 'Journée', crew: 'Équipe', eq: 'Matériel', fees: 'Frais', versions: 'Version', cues: 'Sous-titre', ch: 'Entrée', hf: 'Liaison HF', mix: 'Retour', nodes: 'Équipement', connections: 'Câble', locations: 'Lieu', spots: 'Lieu', people: 'Personne', talents: 'Talent', cases: 'Caisse', shots: 'Plan', scenes: 'Séquence', boxes: 'Encadré', comments: 'Retour', segs: 'Segment', graphics: 'Graphique', fixtures: 'Projecteur' };
    // regroupe les changements par élément (ajouté / supprimé / modifié) pour les présenter et les choisir
    function lockedIn(mine, c) { // 🔒 élément verrouillé / validé par le Master : le travail du membre ne l'écrase pas
        try { for (let i = 0; i < c.path.length; i++) if (typeof c.path[i] === 'object') { const el = nav(mine, c.path.slice(0, i + 1), false); if (el && el.locked === true) return true; }
            if (c.op === 'del' && c.id != null) { const el = nav(mine, c.path.concat([{ id: c.id }]), false); if (el && el.locked === true) return true; } } catch (e) { }
        return false;
    }
    function changes(baseStr, mineStr, theirStr, sc) {
        const keys = KEYS[APP] || [], G = [];
        keys.forEach(k => {
            const base = parse(baseStr[k] != null ? baseStr[k] : (mineStr[k] != null ? mineStr[k] : 'null')), their = parse(theirStr[k] != null ? theirStr[k] : 'null'), mine = parse(mineStr[k] != null ? mineStr[k] : 'null');
            const IGN = /^(updated|at|ts|savedAt|modified|lastSave|rev|_.*)$/, ops = diff(base, their, [], []).filter(c => !(c.op === 'set' && IGN.test(String(c.path[c.path.length - 1])))).filter(c => !sc || sc.k !== k ? !sc : inScope(sc, c, base, their)).filter(c => !noop(mine, c)).filter(c => !lockedIn(mine, c)), byEl = new Map();
            ops.forEach(c => {
                let cut = -1; c.path.forEach((st, i) => { if (typeof st === 'object') cut = i; });
                const elPath = c.op === 'set' && cut > -1 ? c.path.slice(0, cut + 1) : null;
                const key = c.op === 'set' ? (elPath ? JSON.stringify(elPath) : 'root:' + JSON.stringify(c.path.slice(0, 2))) : c.op + JSON.stringify(c.path) + c.id;
                if (!byEl.has(key)) {
                    const colName = s0 => { for (let i = s0.length - 1; i >= 0; i--) if (typeof s0[i] === 'string') return COL[s0[i]] || s0[i]; return 'Élément'; };
                    let lab;
                    if (c.op === 'add') lab = colName(c.path) + ' « ' + (nameOf(c.val) || c.id) + ' »';
                    else if (c.op === 'del') lab = colName(c.path) + ' « ' + (nameOf(c.old) || c.id) + ' »';
                    else if (elPath) { const el = nav(their, elPath, false) || nav(base, elPath, false); lab = colName(elPath.slice(0, -1)) + ' « ' + (nameOf(el) || elPath[elPath.length - 1].id) + ' »'; }
                    else lab = 'Réglage « ' + c.path.filter(x => typeof x === 'string').join(' › ') + ' »';
                    byEl.set(key, { k, op: c.op === 'set' ? 'mod' : c.op, lab, ops: [], fields: [] });
                }
                const g = byEl.get(key); g.ops.push(c); if (c.op === 'set') { const f = c.path.filter(x => typeof x === 'string').slice(elPath ? -1 : -2).join('.'); if (!g.fields.includes(f)) g.fields.push(f); }
            });
            byEl.forEach(g => G.push(g));
        });
        return G;
    }
    function merged(mineStr, groups) {
        const out = Object.assign({}, mineStr), roots = {};
        groups.forEach(g => { if (!(g.k in roots)) roots[g.k] = parse(mineStr[g.k] != null ? mineStr[g.k] : 'null'); if (roots[g.k] == null) roots[g.k] = Array.isArray(g.ops[0] && g.ops[0].val) ? [] : {}; g.ops.forEach(c => { if (!c.path.length && c.op === 'set') roots[g.k] = c.val; else applyOp(roots[g.k], c); }); });
        Object.keys(roots).forEach(k => { out[k] = typeof roots[k] === 'string' ? roots[k] : JSON.stringify(roots[k]); });
        return out;
    }
    // ---------- ✂️ délégation partielle : un onglet, une journée, une version, un département… ----------
    const GRP = ['redac', 'dept', 'phase', 'cat', 'department', 'service', 'famille', 'fam', 'type'];
    function parts(dataStr) {
        const out = [];
        (KEYS[APP] || []).forEach(k => {
            const root = parse(dataStr[k]);
            const walk = (node, path, depth, prefix) => {
                if (depth > 3 || node == null || typeof node !== 'object') return;
                if (Array.isArray(node)) {
                    if (!node.length || !node.every(x => idOf(x) != null)) return;
                    const col = (() => { for (let i = path.length - 1; i >= 0; i--) if (typeof path[i] === 'string') return COL[path[i]] || path[i]; return 'Onglet'; })();
                    const box = x => Object.values(x).some(v => Array.isArray(v) && v.length && v.every(y => idOf(y) != null));
                    if (node.length > 1 && node.length <= 40) node.filter(box).forEach(x => out.push({ k, path, id: idOf(x), label: prefix + col + ' « ' + (nameOf(x) || idOf(x)) + ' »' }));
                    for (const f of GRP) { const vals = [...new Set(node.map(x => x[f]).filter(v => typeof v === 'string' && v))]; if (vals.length > 1 && vals.length <= 15) { vals.forEach(v => out.push({ k, path, field: f, value: v, label: prefix + col + ' › ' + pretty(v) + ' (' + node.filter(x => x[f] === v).length + ')' })); break; } }
                    if (node.length <= 12) node.forEach(x => walk(x, path.concat([{ id: idOf(x) }]), depth + 1, (node.length > 1 ? (nameOf(x) || col) + ' › ' : prefix)));
                    return;
                }
                Object.keys(node).forEach(key => { if (Array.isArray(node[key]) || (node[key] && typeof node[key] === 'object' && depth < 2)) walk(node[key], path.concat([key]), depth + 1, prefix); });
            };
            walk(root, [], 0, '');
        });
        return out.slice(0, 60);
    }
    function pretty(v) { // codes internes → libellés de l'outil (catégories, départements, phases)
        for (const g of ['ECATS', 'DEPTS_D', 'CATS', 'PHASES', 'DEPTS', 'CATEGORIES', 'HFT']) { let T; try { T = eval(g); } catch (e) { continue; } if (!Array.isArray(T)) continue; const r = T.find(x => Array.isArray(x) ? x[0] === v : x && x.id === v); if (r) return Array.isArray(r) ? String(r[1]).replace(/^\S+\s(?=\S)/, m => /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(m) ? '' : m) : r.name || v; }
        return v;
    }
    const startsWith = (a, b) => b.every((st, i) => same(a[i], st));
    function inScope(sc, c, base, their) {
        if (!sc) return true;
        if (sc.id != null) { const el = sc.path.concat([{ id: sc.id }]); return startsWith(c.path, el) || ((c.op === 'add' || c.op === 'del') && same(c.path, sc.path) && c.id === sc.id); }
        if (!startsWith(c.path, sc.path)) return false;
        if (c.op === 'add') return same(c.path, sc.path) ? c.val && c.val[sc.field] === sc.value : true;
        if (c.op === 'del' && same(c.path, sc.path)) return c.old && c.old[sc.field] === sc.value;
        const st = c.path[sc.path.length]; if (!st || typeof st !== 'object') return false;
        const p2 = sc.path.concat([st]), e1 = nav(base, p2, false), e2 = nav(their, p2, false);
        return (e1 && e1[sc.field] === sc.value) || (e2 && e2[sc.field] === sc.value);
    }
    function strip(dataStr, sc) { // n'envoie que la partie confiée
        if (!sc) return dataStr; const out = Object.assign({}, dataStr), root = parse(dataStr[sc.k]);
        const arr = sc.path.length ? nav(root, sc.path, false) : root; if (!Array.isArray(arr)) return out;
        const keep = arr.filter(x => sc.id != null ? idOf(x) === sc.id : x[sc.field] === sc.value); arr.splice(0, arr.length, ...keep);
        out[sc.k] = JSON.stringify(root); return out;
    }
    const fmtV = v => v === undefined || v === null || v === '' ? '—' : typeof v === 'object' ? (nameOf(v) || (Array.isArray(v) ? v.length + ' élément(s)' : '…')) : String(v).slice(0, 50);
    function compare(p, done) {
        const bs = J('xiii.deleg.base.' + p.id, null), sc = p.scope || (bs && bs.scope) || null, mine = grab(), G = changes(bs ? bs.data : (sc ? strip(mine, sc) : mine), mine, p.data || {}, sc);
        const ic = { add: '➕', del: '➖', mod: '✏️' }, cl = { add: 'xdl-gA', del: 'xdl-gD', mod: 'xdl-gM' };
        const o = dlg('<h3>🔍 Changements de ' + esc(p.from && (p.from.name || p.from.email) || 'du membre') + '<span data-x class="xdl-x">✕</span></h3>' +
            '<p class="xdl-h">' + (bs ? 'Seuls les changements faits par le membre depuis votre envoi sont listés : vos propres modifications depuis restent intactes.' : 'Version de départ inconnue (invitation envoyée depuis un autre navigateur) : la liste compare votre version actuelle avec la sienne.') + '</p>' +
            (G.length ? '<div class="xdl-ft"><label><input type="checkbox" id="xdl-all" checked> Tout</label><span>' + ['add', 'mod', 'del'].map(t => { const n = G.filter(g => g.op === t).length; return n ? ic[t] + ' ' + n : ''; }).filter(Boolean).join(' · ') + '</span></div>' +
                '<div class="xdl-ch">' + G.map((g, i) => '<label class="xdl-c ' + cl[g.op] + '"><input type="checkbox" data-g="' + i + '" checked><span class="xdl-ci">' + ic[g.op] + '</span><span class="xdl-ct"><b>' + esc(g.lab) + '</b>' + (g.op === 'mod' ? '<small>' + g.ops.slice(0, 4).map(c => esc(c.path.filter(x => typeof x === 'string').slice(-1)[0] || 'valeur') + ' : <s>' + esc(fmtV(c.old)) + '</s> → ' + esc(fmtV(c.val))).join(' · ') + (g.ops.length > 4 ? ' · +' + (g.ops.length - 4) : '') + '</small>' : g.op === 'add' ? '<small>ajouté par le membre</small>' : '<small>supprimé par le membre</small>') + '</span></label>').join('') + '</div>'
                : '<p class="xdl-ok">✓ Aucun changement à reprendre : votre version contient déjà tout son travail.</p>') +
            (sc ? '<p class="xdl-h">✂️ Partie confiée : <b>' + esc(sc.label) + '</b> — les changements hors de cette partie sont ignorés.</p>' : '') + '<div class="xdl-b"><button data-x>Annuler</button>' + (sc ? '' : '<button id="xdl-rep" title="Remplacer tout le contenu par sa version">Tout remplacer</button>') + (G.length ? '<button id="xdl-mg" class="ok">🔀 Fusionner la sélection</button>' : '') + '</div>');
        const boxes = () => [...o.querySelectorAll('[data-g]')], cnt = () => { const n = boxes().filter(b => b.checked).length, b = o.querySelector('#xdl-mg'); if (b) b.textContent = '🔀 Fusionner ' + n + ' changement' + (n > 1 ? 's' : ''); };
        const all = o.querySelector('#xdl-all'); if (all) all.onchange = () => { boxes().forEach(b => b.checked = all.checked); cnt(); };
        boxes().forEach(b => b.onchange = cnt); cnt();
        const rp = o.querySelector('#xdl-rep'); if (rp) rp.onclick = () => { o.remove(); done(p.data || {}, 'remplacée'); };
        const mg = o.querySelector('#xdl-mg'); if (mg) mg.onclick = () => { const pick = boxes().filter(b => b.checked).map(b => G[+b.dataset.g]); if (!pick.length) { say('Aucun changement coché'); return; } o.remove(); done(merged(mine, pick), pick.length + ' changement(s) fusionné(s)'); };
    }
    function receive(p) {
        const nn = p.notes ? mergeNotes(p.notes) : 0; if (nn) setTimeout(() => say('💬 ' + nn + ' nouveau(x) commentaire(s) — bouton 💬'), 1200);
        { // trace de chaque version reçue (boîte d'échanges), et version en attente si elle n'est pas importée tout de suite
            const S0 = J(K_SENT, []); let x0 = S0.find(y => y.id === p.id); if (!x0) { x0 = { id: p.id, app: APP, to: p.from && (p.from.name || p.from.email), email: p.from && p.from.email, ts: p.ts }; S0.push(x0); }
            x0.vers = (x0.vers || []).filter(v => v.ts !== p.ts).concat([{ ts: p.ts, got: Date.now() }]).slice(-20); x0.from = p.from; W(K_SENT, S0);
            const PD = J('xiii.deleg.pending', {}); if (!x0.last || p.ts > x0.last) { PD[p.id] = p; W('xiii.deleg.pending', PD); }
        }
        const S = J(K_SENT, []), x = S.find(y => y.id === p.id), last = x && x.last, older = last && p.ts <= last;
        const st = J('xiii.projets', null), list = st && st.list ? st.list.filter(Boolean) : [];
        const o = dlg('<h3>📥 Travail reçu de ' + esc(p.from && (p.from.name || p.from.email) || 'un membre') + '<span data-x class="xdl-x">✕</span></h3>' +
            '<p><b>' + esc(NAMES[APP]) + '</b>' + (p.proj ? ' · ' + esc(p.proj) : '') + ' — version du <b>' + fmt(p.ts) + '</b></p>' +
            (last ? '<p class="' + (older ? 'xdl-warn' : 'xdl-ok') + '">' + (older ? '⚠️ Cette version est plus ancienne (ou identique) que celle déjà importée le ' + fmt(last) + ' : inutile de l\'importer.' : '✓ Plus récente que la dernière version importée (' + fmt(last) + ').') + '</p>' : (x ? '' : '<p class="xdl-h">Invitation envoyée depuis un autre navigateur ou une ancienne version : import possible quand même.</p>')) +
            (list.length ? '<label class="xdl-l">Projet en cours<select id="xdl-pj">' + list.map(f => '<option value="' + esc(f.id) + '"' + (f.id === st.active ? ' selected' : '') + '>' + esc(f.title || 'Sans titre') + '</option>').join('') + '</select></label>' : '') +
            '<p class="xdl-h">« Comparer » liste ses ajouts, modifications et suppressions : vous choisissez ce que vous gardez. « Tout remplacer » prend sa version entière. Une copie de sauvegarde est gardée : « 🤝 Déléguer » → « Revenir au contenu d\'avant le dernier import ».' + (IMG.test(APP) ? ' Les photos et images ne sont pas transmises par les liens.' : '') + '</p>' +
            (p.scope ? '<p class="xdl-h">✂️ Partie confiée : <b>' + esc(p.scope.label) + '</b> — seule cette partie sera mise à jour.</p>' : '') + '<div class="xdl-b"><button data-x>' + (older ? 'Ignorer' : 'Plus tard') + '</button>' + (p.scope ? '' : '<button id="xdl-imp">Tout remplacer</button>') + '<button id="xdl-cmp" class="ok">🔍 Comparer et fusionner</button></div>');
        const finish = (data, how) => {
            const pj = o.querySelector('#xdl-pj'); if (pj && st) { st.active = pj.value; W('xiii.projets', st); }
            W(K_BAK(APP), { ts: Date.now(), data: grab() });
            const S2 = J(K_SENT, []), i = S2.findIndex(y => y.id === p.id); if (i > -1) { S2[i].last = Math.max(S2[i].last || 0, p.ts); S2[i].from = p.from; } else S2.push({ id: p.id, app: APP, to: p.from && (p.from.name || p.from.email), ts: p.ts, last: p.ts }); W(K_SENT, S2);
            { const PD = J('xiii.deleg.pending', {}); if (PD[p.id] && PD[p.id].ts <= p.ts) { delete PD[p.id]; W('xiii.deleg.pending', PD); } }
            put(data, { t: 'msg', m: '⬇️ Version du ' + fmt(p.ts) + ' ' + how + ' — annulable depuis « 🤝 Déléguer »' });
        };
        const ib = o.querySelector('#xdl-imp'); if (ib) ib.onclick = () => finish(p.data || {}, 'importée');
        o.querySelector('#xdl-cmp').onclick = () => { o.remove(); compare(p, finish); };
    }
    // ---------- démarrage ----------
    function css() {
        if (document.getElementById('xdl-css')) return; const s = document.createElement('style'); s.id = 'xdl-css';
        s.textContent = '#xdl-ov{position:fixed;inset:0;z-index:10200;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;font:13.5px/1.5 "Segoe UI",system-ui,sans-serif}' +
            '.xdl-box{width:min(620px,100%);max-height:92vh;overflow:auto;background:var(--bg-menu,#232327);color:var(--text-main,#eee);border:1px solid rgba(240,179,120,.6);border-radius:12px;padding:16px 18px;box-shadow:0 18px 50px rgba(0,0,0,.6)}' +
            '.xdl-box h3{margin:0 0 8px;font-size:16px;display:flex;justify-content:space-between;gap:10px}.xdl-x{cursor:pointer;opacity:.7}.xdl-box h4{margin:14px 0 4px;font-size:13px}.xdl-h{color:var(--text-dim,#999);font-size:12.5px}' +
            '.xdl-g{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}.xdl-g label,.xdl-l{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--text-dim,#aaa)}.xdl-g .w{grid-column:1/-1}.xdl-g .ck{flex-direction:row;align-items:center;gap:6px;color:var(--text-main,#eee)}' +
            '.xdl-box input,.xdl-box textarea,.xdl-box select{font:inherit;color:inherit;background:var(--bg-input,#17171a);border:1px solid var(--border-color,#45454b);border-radius:6px;padding:6px 8px}.xdl-g .ck input{width:auto}' +
            '.xdl-b{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:12px}.xdl-box button{font:inherit;color:inherit;background:var(--bg-panel-alt,#2c2c31);border:1px solid var(--border-color,#45454b);border-radius:8px;padding:6px 12px;cursor:pointer}.xdl-box button.ok,#xdl-ban button.ok{background:rgba(240,179,120,.3);border-color:rgb(240,179,120);font-weight:700}' +
            '.xdl-row{display:flex;gap:8px;align-items:center;padding:4px 0;border-bottom:1px solid var(--border-soft,#333)}.xdl-row small{color:var(--text-dim,#999);flex:1}.xdl-q{margin:8px 0;padding:8px 12px;border-left:3px solid rgb(240,179,120);background:rgba(240,179,120,.08)}' +
            '.xdl-ft{display:flex;justify-content:space-between;align-items:center;margin:8px 0 4px;font-size:12.5px;color:var(--text-dim,#aaa)}.xdl-ft label{display:flex;gap:6px;align-items:center;color:var(--text-main,#eee)}.xdl-ch{max-height:48vh;overflow:auto;border:1px solid var(--border-color,#444);border-radius:8px}.xdl-c{display:flex;gap:8px;align-items:flex-start;padding:6px 10px;border-bottom:1px solid var(--border-soft,#333);cursor:pointer}.xdl-c:last-child{border-bottom:0}.xdl-c input{margin-top:3px}.xdl-ct b{display:block;font-size:13px}.xdl-ct small{color:var(--text-dim,#aaa);font-size:11.5px}.xdl-ct s{opacity:.7}.xdl-gA{border-left:3px solid #66bb6a}.xdl-gD{border-left:3px solid #ef5350}.xdl-gM{border-left:3px solid #42A5F5}' +
            '#xnt-btn{position:relative}#xnt-btn[data-n]:not([data-n=""])::after{content:attr(data-n);position:absolute;top:-5px;right:-5px;background:#42A5F5;color:#fff;border-radius:9px;font:700 10px/15px sans-serif;min-width:15px;padding:0 3px}.xnt-t{padding:8px 10px;border-bottom:1px solid var(--border-soft,#333)}.xnt-h{margin-bottom:4px}.xnt-m{font-size:12.5px;padding:4px 0 4px 10px;border-left:2px solid var(--border-color,#555);margin:3px 0}.xnt-m small{color:var(--text-dim,#999)}.xnt-a{display:flex;gap:4px;margin-top:5px}.xnt-a input{flex:1;min-width:0}.xnt-a button{padding:3px 7px!important}' +
            '.xdl-warn{color:#ffb74d}.xdl-ok{color:#81c784}' +
            '#xdl-ban{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:10150;display:flex;gap:10px;align-items:center;background:#1c1c20;color:#fff;border:1px solid rgb(240,179,120);border-radius:12px;padding:8px 12px;box-shadow:0 8px 30px rgba(0,0,0,.6);font:13px "Segoe UI",sans-serif;max-width:calc(100vw - 24px);flex-wrap:wrap}' +
            '#xdl-ban button{font:inherit;color:#fff;background:#333;border:1px solid #555;border-radius:8px;padding:6px 12px;cursor:pointer}' +
            '@media(max-width:600px){.xdl-g{grid-template-columns:1fr}}';
        document.head.appendChild(s);
    }
    function init(app) {
        APP = app; if (!KEYS[app]) return; css();
        const go = () => {
            const after = J('xiii.deleg.after', null); if (after) { W('xiii.deleg.after', null); if (after.m) setTimeout(() => say(after.m, 6000), 300); }
            banner();
            if (!document.getElementById('xdl-btn')) { let ref = document.getElementById('xsh-btn') || [...document.querySelectorAll('#top-bar button,#toolbar button')].find(x => /Dossier/i.test(x.getAttribute('onclick') || '') || /Vers DOSSIER/i.test(x.title || x.textContent || '')); if (!ref) { const g = [...document.querySelectorAll('#top-bar .btn-group, #top-bar .tb-group, #toolbar .btn-group')].pop(); if (g) ref = g.lastElementChild; } if (!ref) ref = [...document.querySelectorAll('#top-bar button')].filter(b => !b.closest('#tabs-container')).pop();
                if (ref) { ref.insertAdjacentHTML('afterend', '<button id="xdl-btn" title="Déléguer cet outil à un membre de l\'équipe : il le remplit et vous le renvoie par un lien"><span class="btn-icon">🤝</span><span class="btn-label">Déléguer</span></button>'); document.getElementById('xdl-btn').onclick = () => J(K_ACT(APP), null) ? finish() : openInvite(); } }
            if (!document.getElementById('xnt-btn')) { const d = document.getElementById('xdl-btn'); if (d) { d.insertAdjacentHTML('afterend', '<button id="xnt-btn" title="Commentaires et validations"><span class="btn-icon">💬</span><span class="btn-label">Avis</span></button>'); document.getElementById('xnt-btn').onclick = () => openNotes(); refreshNoteBtn(); } }
            const inbox = J(K_IN, null);
            if (inbox && inbox.app === APP) { W(K_IN, null); if (inbox.t === 'i') startMember(inbox); else if (inbox.t === 'r') receive(inbox); }
        };
        const run = () => (typeof XBOOT !== 'undefined' ? XBOOT.ready(go, 900) : setTimeout(go, 900)); // boutons placés avant l'affichage
        if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
    }
    return { init, openInvite, sendBack, openNotes, mergeNotes, KEYS, NAMES, grab, put, notes: () => notes(), _t: { diff, changes, merged } };
})();

XDELEG.init(XIII_APP);

