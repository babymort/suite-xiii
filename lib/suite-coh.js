// SUITE XIII — module commun. Source : xiii-src/suite-coh.js
// =====================================================================
//  SUITE XIII — XCOH : 🧭 vérification de cohérence du projet (entre les outils)
//  Relit les données de tous les outils du projet en cours et signale ce qui cloche :
//  câble ou entrée manquante (SYNO), projecteurs sans alimentation, circuits ou adresses DMX en conflit (PLANO / LUMO),
//  HF sans fréquence ou en double (SONO), talent sans convocation ou sans transport (CASTO / CALL SHEETO / TRANSPORTO),
//  caisses trop lourdes, véhicule surchargé (PACKINGO), dates hors tournage, mineurs, contrats non signés…
//  Rien n'est modifié : chaque point renvoie vers l'outil concerné ; « Ignorer » le retire de la liste.
// =====================================================================
var XCOH = window.XCOH || (() => {
    const J = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    const W = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fold = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    const pad = n => String(n).padStart(2, '0'), T0 = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    const frD = s => s ? new Date(s + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
    const nm = a => (typeof XLINKS !== 'undefined' && XLINKS.T[a] ? XLINKS.T[a][1] : String(a || '').toUpperCase()), ic = a => (typeof XLINKS !== 'undefined' && XLINKS.T[a] ? XLINKS.T[a][0] : '🧰');
    const list = (L, n) => { L = [...new Set(L)]; n = n || 4; return L.slice(0, n).join(', ') + (L.length > n ? ' et ' + (L.length - n) + ' autre(s)' : ''); };
    const sameP = (a, b) => { const x = fold(a), y = fold(b); if (!x || !y) return false; if (x === y) return true; const A = x.split(' '), B = y.split(' '); return A.length > 1 && B.length > 1 && A[0] === B[0] && A[A.length - 1] === B[B.length - 1]; };
    // ================= les contrôles =================
    function run() {
        const I = [], add = (lvl, app, k, t, d) => I.push({ lvl, app, k: app + ':' + k, t, d: d || '' });
        const f = (() => { const s = J('xiii.projets', {}) || {}; return (s.list || []).find(x => x && x.id === s.active) || {}; })();
        const SY = J('synoptique_projects', null), PL = J('planoXIII.project', null), LU = J('lumoXIII.project', null), SO = J('sonoXIII.project', null), CS = J('callsheetoXIII.project', null),
            TR = J('transportoXIII.project', null), CA = J('castoXIII.project', null), PK = J('packingoXIII.project', null), RS = J('ressourcoXIII.project', null);
        // ---------- SYNO ----------
        (Array.isArray(SY) ? SY : []).forEach(tab => {
            const N = tab.nodes || [], C = tab.connections || [], byId = {}; N.forEach(n => byId[n.id] = n); const tn = n => String(n.title || n.name || 'Équipement').replace(/\s+/g, ' ').slice(0, 60), tb = SY.length > 1 ? ' (onglet « ' + (tab.name || '') + ' »)' : '';
            const bad = C.filter(c => !byId[c.fromNode] || !byId[c.toNode]); if (bad.length) add('err', 'syno', 'orph' + tab.id, bad.length + ' câble(s) relié(s) à un équipement supprimé' + tb, list(bad.map(c => c.name || 'câble sans nom')));
            const portBad = C.filter(c => byId[c.fromNode] && byId[c.toNode] && (!(byId[c.fromNode].outPorts || []).some(p => p.id === c.fromPort) || !(byId[c.toNode].inPorts || []).some(p => p.id === c.toPort)));
            if (portBad.length) add('warn', 'syno', 'port' + tab.id, portBad.length + ' câble(s) sur un port qui n’existe plus' + tb, list(portBad.map(c => c.name || tn(byId[c.fromNode]) + ' → ' + tn(byId[c.toNode]))));
            const iso = N.filter(n => (n.inPorts || []).length + (n.outPorts || []).length > 0 && !C.some(c => c.fromNode === n.id || c.toNode === n.id));
            if (iso.length) add('err', 'syno', 'iso' + tab.id, iso.length + ' équipement(s) branché(s) à rien' + tb, list(iso.map(tn)) + ' — câble manquant ?');
            const noIn = N.filter(n => (n.inPorts || []).length && !(n.outPorts || []).length && !iso.includes(n) && !C.some(c => c.toNode === n.id));
            if (noIn.length) add('warn', 'syno', 'noin' + tab.id, noIn.length + ' récepteur(s) sans signal d’entrée' + tb, list(noIn.map(tn)));
            const ip = {}; N.forEach(n => { const a = String(n.ip || '').trim(); if (a) (ip[a] = ip[a] || []).push(tn(n)); });
            Object.keys(ip).filter(a => ip[a].length > 1).forEach(a => add('err', 'syno', 'ip' + a, 'Adresse IP ' + a + ' en double', list(ip[a])));
            const dbl = {}; C.forEach(c => { const k = c.toNode + '|' + c.toPort; (dbl[k] = dbl[k] || []).push(c); }); const D = Object.values(dbl).filter(x => x.length > 1);
            if (D.length) add('warn', 'syno', 'dbl' + tab.id, D.length + ' entrée(s) qui reçoivent plusieurs câbles' + tb, list(D.map(x => tn(byId[x[0].toNode] || {}) + ' (' + x.length + ')')));
        });
        // ---------- PLANO ----------
        const SRC = /^(t-groupe|t-armoire-elec|t-enrouleur|t-multi)$/, plLights = [];
        ((PL && PL.tabs) || []).forEach(tab => { const IT = tab.items || [], L = IT.filter(i => i.kind === 'light'); plLights.push(...L);
            if (L.length && !IT.some(i => SRC.test(i.ref || '') || /groupe|armoire|distrib|enrouleur|multiprise|p17/i.test((i.name || '') + ' ' + (i.label || ''))))
                add('err', 'plano', 'pow' + tab.id, L.length + ' projecteur(s) sans alimentation sur « ' + (tab.name || 'le plan') + ' »', 'Aucun groupe électrogène, armoire, enrouleur ou multiprise placé — ' + Math.round(L.reduce((a, i) => a + (+((i.L || {}).power) || 0), 0) / 100) / 10 + ' kW à alimenter');
        });
        // ---------- LUMO ----------
        if (LU && (LU.fx || []).length) {
            const SUP = { mono16: [1, 16], mono32: [1, 32], tri16: [3, 16], tri32: [3, 32], tri63: [3, 63], tri125: [3, 125], tri250: [3, 250] }, set = LU.set || {}, v = +set.volt || 230, s = SUP[set.supply] || null;
            const tot = LU.fx.reduce((a, x) => a + (+x.w || 0) * (+x.qty || 1), 0);
            if (s) { const cap = s[0] * s[1] * v; if (tot > cap) add('err', 'lumo', 'sup', 'Puissance installée (' + (tot / 1000).toFixed(1) + ' kW) supérieure à l’alimentation (' + (cap / 1000).toFixed(1) + ' kW)', 'Prévoir une alimentation plus forte ou un groupe électrogène'); else if (tot > cap * .8) add('warn', 'lumo', 'sup80', 'Alimentation chargée à ' + Math.round(tot / cap * 100) + ' %', 'Au-delà de 80 % : pas de marge pour les imprévus'); }
            const circ = {}; LU.fx.forEach(x => { const c = String(x.circ || '').trim(); if (c) circ[c] = (circ[c] || 0) + (+x.w || 0) * (+x.qty || 1); }); const cmax = (+set.circ || 16) * v;
            Object.keys(circ).filter(c => circ[c] > cmax).forEach(c => add('err', 'lumo', 'circ' + c, 'Circuit ' + c + ' surchargé : ' + (circ[c] / 1000).toFixed(1) + ' kW pour ' + (cmax / 1000).toFixed(1) + ' kW', 'Répartir les projecteurs sur d’autres circuits'));
            const ph = {}; LU.fx.forEach(x => { if (x.phase) ph[x.phase] = (ph[x.phase] || 0) + (+x.w || 0) * (+x.qty || 1); }); const P3 = Object.values(ph);
            if (P3.length >= 2 && Math.max(...P3) > 1.5 * Math.min(...P3) && Math.max(...P3) > 3000) add('warn', 'lumo', 'phase', 'Phases déséquilibrées', Object.keys(ph).map(k => k + ' ' + (ph[k] / 1000).toFixed(1) + ' kW').join(' · '));
            const U = {}; LU.fx.forEach(x => { const a = +x.addr, ch = +x.ch || 0, q = +x.qty || 1; if (!a || !ch) return; const u = String(x.univ || '1'); (U[u] = U[u] || []).push({ a, b: a + ch * q - 1, n: (x.code ? x.code + ' ' : '') + x.name }); });
            Object.keys(U).forEach(u => { const R = U[u].sort((x, y) => x.a - y.a); R.forEach(r => { if (r.b > 512) add('err', 'lumo', 'dmx512' + u + r.n, r.n + ' dépasse la fin de l’univers ' + u + ' (canal ' + r.b + ' > 512)', 'Passer une partie sur l’univers suivant'); });
                for (let i = 1; i < R.length; i++) if (R[i].a <= R[i - 1].b) add('err', 'lumo', 'dmx' + u + R[i].n, 'Adresses DMX qui se chevauchent (univers ' + u + ')', R[i - 1].n + ' (' + R[i - 1].a + '–' + R[i - 1].b + ') et ' + R[i].n + ' (' + R[i].a + '–' + R[i].b + ')'); });
            const noA = LU.fx.filter(x => !+x.addr && +x.ch); if (noA.length) add('warn', 'lumo', 'noaddr', noA.length + ' projecteur(s) sans adresse DMX', list(noA.map(x => (x.code ? x.code + ' ' : '') + x.name)));
            const nL = LU.fx.reduce((a, x) => a + (+x.qty || 1), 0); if (plLights.length > nL) add('info', 'plano', 'cnt', 'PLANO place ' + plLights.length + ' projecteurs, le plan de feu LUMO n’en compte que ' + nL, 'Projecteurs du plan absents du patch : passerelle PLANO → LUMO');
        }
        // ---------- SONO ----------
        if (SO) {
            const H = SO.hf || [], nof = H.filter(h => !String(h.f || '').trim()); if (nof.length) add('warn', 'sono', 'nof', nof.length + ' liaison(s) HF sans fréquence', list(nof.map(h => h.name || h.model)) + ' — à fréquencer (plan de fréquences)');
            const fq = {}; H.forEach(h => { const x = String(h.f || '').replace(',', '.').trim(); if (x) (fq[x] = fq[x] || []).push(h.name || h.model); }); Object.keys(fq).filter(x => fq[x].length > 1).forEach(x => add('err', 'sono', 'fq' + x, 'Fréquence ' + x + ' MHz utilisée deux fois', list(fq[x])));
            const ids = new Set((SO.ch || []).map(c => c.id)); (SO.mix || []).forEach(m => { const bad = Object.keys(m.lv || {}).filter(k => !ids.has(k)); if (bad.length) add('info', 'sono', 'mix' + m.id, 'Mix « ' + (m.name || '') + ' » : ' + bad.length + ' voie(s) supprimée(s) encore réglée(s)', 'Sans conséquence, à nettoyer'); });
        }
        // ---------- CALL SHEETO × CASTO × TRANSPORTO × RESSOURCO ----------
        const days = (CS && CS.days) || [], t0 = T0();
        days.forEach(d => { const lab = (d.name || 'Jour') + (d.date ? ' (' + frD(d.date) + ')' : '');
            if (!(d.locations || []).some(l => l && String(l.address || '').trim())) add('warn', 'callsheeto', 'addr' + d.id, lab + ' : aucun lieu avec adresse', 'L’équipe ne saura pas où aller');
            const h = (d.safety || {}).hospital; if (!h || !String(h.name || h.address || '').trim()) add('warn', 'callsheeto', 'hosp' + d.id, lab + ' : pas d’hôpital indiqué', 'Rubrique sécurité de la feuille de service');
            if (f.debut && d.date && (d.date < f.debut || (f.fin && d.date > f.fin))) add('warn', 'callsheeto', 'date' + d.id, lab + ' hors des dates de tournage de la fiche', 'Fiche : ' + frD(f.debut) + (f.fin ? ' → ' + frD(f.fin) : ''));
            const noPh = (d.crew || []).filter(c => c.name && !String(c.phone || '').trim()); if (noPh.length >= 3) add('info', 'callsheeto', 'ph' + d.id, lab + ' : ' + noPh.length + ' personne(s) sans téléphone', list(noPh.map(c => c.name)));
        });
        const T = ((CA && CA.talents) || []).filter(t => t.status === 'confirme');
        if (days.length) T.forEach(t => { const miss = (t.days || []).filter(dd => { const d = days.find(x => x.date === dd); return d && !(d.crew || []).some(c => sameP(c.name, t.name)); });
            if (miss.length) add('warn', 'casto', 'conv' + t.id, (t.name || 'Talent') + ' (' + (t.role || '') + ') confirmé mais pas convoqué', 'Jour(s) : ' + miss.map(frD).join(', ') + ' — passerelle CASTO → CALL SHEETO'); });
        if (TR && ((TR.people || []).length || (TR.trips || []).length || (TR.fdr && (TR.fdr.days || []).length))) {
            const P = TR.people || [], inTr = n => P.some(p => sameP(p.n, n)) || (TR.fdr && JSON.stringify(TR.fdr).length && P.some(p => sameP(p.n, n)));
            const noT = T.filter(t => !inTr(t.name)); if (noT.length) add('warn', 'transporto', 'tal', noT.length + ' talent(s) confirmé(s) sans transport', list(noT.map(t => t.name)) + ' — passerelle CASTO → TRANSPORTO');
            const first = n => { let m = ''; days.forEach(d => { if ((d.crew || []).some(c => sameP(c.name, n)) && (!m || d.date < m)) m = d.date; }); T.forEach(t => { if (sameP(t.name, n)) (t.days || []).forEach(x => { if (!m || x < m) m = x; }); }); return m; };
            P.forEach(p => { const fd = first(p.n); if (fd && p.arr && p.arr > fd) add('err', 'transporto', 'arr' + p.id, (p.n || '') + ' arrive le ' + frD(p.arr) + ', après sa convocation du ' + frD(fd), 'Avancer l’arrivée'); if (p.dep && fd && p.dep < fd) add('err', 'transporto', 'dep' + p.id, (p.n || '') + ' repart avant sa convocation', 'Départ ' + frD(p.dep) + ', convoqué le ' + frD(fd)); });
            const occ = new Set(); (TR.rooms || []).forEach(r => (r.occ || []).forEach(o => occ.add(o))); const noRoom = P.filter(p => p.hotel && !occ.has(p.id)); if (noRoom.length && (TR.rooms || []).length) add('warn', 'transporto', 'room', noRoom.length + ' personne(s) logée(s) sans chambre attribuée', list(noRoom.map(p => p.n)));
            const vid = new Set((TR.veh || []).map(v => v.id)); (TR.trips || []).forEach(tp => { if (tp.veh && !vid.has(tp.veh)) add('warn', 'transporto', 'veh' + tp.id, 'Navette du ' + frD(tp.date) + ' ' + (tp.time || '') + ' sur un véhicule supprimé', (tp.from || '') + ' → ' + (tp.to || '')); if (!tp.driver && !(TR.veh || []).some(v => v.id === tp.veh && v.driver)) add('info', 'transporto', 'drv' + tp.id, 'Navette du ' + frD(tp.date) + ' ' + (tp.time || '') + ' sans chauffeur', (tp.from || '') + ' → ' + (tp.to || '')); });
        } else if (T.length >= 3 && days.length) add('info', 'transporto', 'empty', 'Aucun transport prévu pour ' + T.length + ' talents confirmés', 'Passerelle CASTO → TRANSPORTO, ou feuilles de route TRANSPORTO');
        ((CA && CA.talents) || []).filter(t => t.minor || t.kind === 'enfant').forEach(t => { if (t.status === 'decline') return;
            if (!/autoris|ddets|prefecture|préfecture/i.test((t.notes || '') + ' ' + (t.tags || []).join(' '))) add('err', 'casto', 'min' + t.id, (t.name || 'Mineur') + ' : mineur sans autorisation notée', 'Autorisation DDETS (ou préfecture) obligatoire avant le tournage');
            (t.days || []).forEach(dd => { const d = days.find(x => x.date === dd), w = d && d.times && d.times.wrap; if (w && /^(2[0-3]|0\d)/.test(w)) add('warn', 'callsheeto', 'minw' + t.id + dd, (t.name || 'Mineur') + ' : fin de journée à ' + w + ' le ' + frD(dd), 'Horaires des mineurs réglementés : vérifier sa propre heure de fin'); }); });
        T.forEach(t => { const d0 = (t.days || []).slice().sort()[0]; if (!d0 || t.contrat === 'signed') return; const n = Math.round((new Date(d0 + 'T12:00') - new Date(t0 + 'T12:00')) / 864e5); if (n <= 7 && n >= -1) add(n <= 2 ? 'err' : 'warn', 'casto', 'ctr' + t.id, (t.name || 'Talent') + ' : contrat ' + (t.contrat === 'sent' ? 'envoyé, pas signé' : 'pas envoyé') + ', tournage ' + (n <= 0 ? 'aujourd’hui' : 'dans ' + n + ' j'), 'RESSOURCO › contrats'); });
        // ---------- PACKINGO ----------
        if (PK && (PK.cases || []).length) {
            const kgOf = c => (+c.tare || 0) + (c.items || []).reduce((a, i) => a + (+i.kg || 0) * (+i.qty || 1), 0), byV = {};
            PK.cases.forEach(c => { const kg = kgOf(c); if (c.max && kg > c.max) add('err', 'packingo', 'max' + c.id, (c.code || '') + ' ' + (c.name || 'Caisse') + ' : ' + Math.round(kg) + ' kg pour ' + c.max + ' kg maximum', 'Répartir dans une autre caisse'); else if (kg > 70 && !c.max) add('warn', 'packingo', 'kg' + c.id, (c.code || '') + ' ' + (c.name || 'Caisse') + ' : ' + Math.round(kg) + ' kg', 'Au-delà de 70 kg, port à 3 personnes ou chariot');
                if (c.veh) (byV[c.veh] = byV[c.veh] || []).push(c); });
            const noV = PK.cases.filter(c => !c.veh); if (noV.length && (PK.vehicles || []).length) add('warn', 'packingo', 'nov', noV.length + ' caisse(s) sans véhicule', list(noV.map(c => (c.code || '') + ' ' + (c.name || ''))));
            (PK.vehicles || []).forEach(v => { const L = byV[v.id] || [], kg = L.reduce((a, c) => a + kgOf(c), 0), vol = L.reduce((a, c) => a + (+c.L || 0) * (+c.W || 0) * (+c.H || 0) / 1e6, 0);
                if (v.payload && kg > v.payload) add('err', 'packingo', 'vkg' + v.id, (v.name || 'Véhicule') + ' surchargé : ' + Math.round(kg) + ' kg pour ' + v.payload + ' kg de charge utile', 'Ajouter un véhicule ou alléger');
                if (v.vol && vol * 1.3 > v.vol) add('warn', 'packingo', 'vvol' + v.id, (v.name || 'Véhicule') + ' plein : ' + vol.toFixed(1) + ' m³ de caisses pour ' + v.vol + ' m³', '30 % de marge de calage conseillée'); });
        }
        // ---------- dates du projet ----------
        if (!f.debut && (days.length || T.length)) add('info', 'projet', 'dates', 'Fiche projet sans dates de tournage', 'Les échéances, la checklist et les contrôles de dates en dépendent');
        const ign = J('xiii.coh.ignore', {}); return I.filter(x => !ign[x.k]).sort((a, b) => ({ err: 0, warn: 1, info: 2 }[a.lvl] - { err: 0, warn: 1, info: 2 }[b.lvl]));
    }
    function count() { const I = run(); return { err: I.filter(x => x.lvl === 'err').length, warn: I.filter(x => x.lvl === 'warn').length, info: I.filter(x => x.lvl === 'info').length, n: I.length }; }
    // ================= interface =================
    const LV = { err: ['⛔', 'À corriger'], warn: ['⚠️', 'À vérifier'], info: ['💡', 'Bon à savoir'] };
    function open() {
        css(); const old = document.getElementById('xcoh'); if (old) old.remove();
        document.body.insertAdjacentHTML('beforeend', '<div id="xcoh" role="dialog" aria-modal="true" aria-label="Vérification de cohérence"><div class="xco-b"><div class="xco-h"><b>🧭 Vérification de cohérence</b><span class="xco-s"></span><button class="xco-x" aria-label="Fermer">✕</button></div><div class="xco-c"></div></div></div>');
        const o = document.getElementById('xcoh'), close = () => o.remove(); o.querySelector('.xco-x').onclick = close; o.addEventListener('click', e => { if (e.target === o) close(); }); o.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        draw();
    }
    function draw() {
        const o = document.getElementById('xcoh'); if (!o) return; const I = run(), c = o.querySelector('.xco-c'), ign = J('xiii.coh.ignore', {}), nIgn = Object.keys(ign).length;
        o.querySelector('.xco-s').textContent = I.length ? I.filter(x => x.lvl === 'err').length + ' à corriger · ' + I.filter(x => x.lvl === 'warn').length + ' à vérifier' : '';
        if (!I.length) { c.innerHTML = '<div class="xco-ok"><b>✅ Rien d’incohérent repéré</b><span>SYNO, PLANO, LUMO, SONO, CALL SHEETO, CASTO, TRANSPORTO et PACKINGO concordent' + (nIgn ? ' (' + nIgn + ' point(s) ignoré(s))' : '') + '.</span></div>' + (nIgn ? '<button class="xco-rs">↺ Réafficher les points ignorés</button>' : ''); const r = c.querySelector('.xco-rs'); if (r) r.onclick = () => { W('xiii.coh.ignore', {}); draw(); }; return; }
        const G = {}; I.forEach(x => (G[x.app] = G[x.app] || []).push(x));
        c.innerHTML = '<p class="xco-n">Relecture de tous les outils du projet. Rien n’est modifié : ouvrez l’outil pour corriger, ou « Ignorer » si c’est voulu.</p>' + Object.keys(G).map(a => '<section><h4>' + (a === 'projet' ? '🎬 Fiche projet' : ic(a) + ' ' + esc(nm(a))) + '<a href="' + (a === 'projet' ? '#' : a + '.html') + '" data-app="' + a + '">↗ Ouvrir</a></h4>' +
            G[a].map(x => '<div class="xco-i ' + x.lvl + '"><span class="lv" title="' + LV[x.lvl][1] + '">' + LV[x.lvl][0] + '</span><div><b>' + esc(x.t) + '</b>' + (x.d ? '<small>' + esc(x.d) + '</small>' : '') + '</div><button data-ig="' + esc(x.k) + '" title="Ne plus signaler ce point">Ignorer</button></div>').join('') + '</section>').join('') +
            '<div class="xco-a"><button class="xco-re">↻ Revérifier</button>' + (nIgn ? '<button class="xco-rs">↺ Réafficher ' + nIgn + ' point(s) ignoré(s)</button>' : '') + '</div>';
        c.querySelectorAll('[data-ig]').forEach(b => b.onclick = () => { const g = J('xiii.coh.ignore', {}); g[b.dataset.ig] = Date.now(); W('xiii.coh.ignore', g); draw(); });
        c.querySelector('.xco-re').onclick = draw; const r = c.querySelector('.xco-rs'); if (r) r.onclick = () => { W('xiii.coh.ignore', {}); draw(); };
        c.querySelectorAll('a[data-app="projet"]').forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById('xcoh').remove(); try { XPROJET.open(); } catch (x) { } });
    }
    function css() {
        if (document.getElementById('xco-css')) return; const s = document.createElement('style'); s.id = 'xco-css';
        s.textContent = '#xcoh{position:fixed;inset:0;z-index:9991;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px;font:14px system-ui,sans-serif}.xco-b{background:var(--bg-panel,#252321);color:var(--text,#eee);border:1px solid rgba(240,179,120,.5);border-radius:14px;width:min(760px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 14px 50px rgba(0,0,0,.5)}.xco-h{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border-soft,#3a3633)}.xco-h b{font-size:16px}.xco-s{font-size:12px;color:var(--text-dim,#aaa);margin-left:auto}.xco-x{background:none;border:0;color:inherit;font-size:17px;cursor:pointer;padding:4px 8px}.xco-c{overflow:auto;padding:12px 14px 14px;display:flex;flex-direction:column;gap:12px}' +
            '.xco-n{margin:0;font-size:12.5px;color:var(--text-dim,#aaa)}.xco-c section h4{margin:0 0 6px;font-size:13.5px;display:flex;align-items:center;gap:8px}.xco-c section h4 a{margin-left:auto;font-size:12px;font-weight:600;color:#F0B378;text-decoration:none}.xco-i{display:flex;gap:9px;align-items:flex-start;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.04);margin-bottom:5px;border-left:3px solid #888}.xco-i.err{border-left-color:#e57373;background:rgba(229,115,115,.08)}.xco-i.warn{border-left-color:#ffb74d}.xco-i.info{border-left-color:#64b5f6}.xco-i .lv{flex:none}.xco-i div{flex:1;min-width:0}.xco-i b{font-size:13px;font-weight:600;display:block}.xco-i small{display:block;font-size:12px;color:var(--text-dim,#aaa);margin-top:2px;overflow-wrap:anywhere}' +
            '.xco-i button,.xco-a button{flex:none;font-size:11.5px;padding:4px 9px;border-radius:7px;border:1px solid var(--border-color,#45454b);background:transparent;color:var(--text-dim,#bbb);cursor:pointer}.xco-a{display:flex;gap:8px}.xco-a button{font-size:12.5px;padding:7px 12px;color:inherit}.xco-ok{display:flex;flex-direction:column;gap:4px;padding:18px;border-radius:12px;background:rgba(102,187,106,.1);border:1px solid rgba(102,187,106,.4)}.xco-ok span{font-size:12.5px;color:var(--text-dim,#bbb)}';
        document.head.appendChild(s);
    }
    return { run, count, open };
})();
