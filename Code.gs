/**
 * SUITE XIII — ☁️ Drive du projet (script Google Apps Script)
 * À coller dans : Google Sheets › Extensions › Apps Script.
 * Ce script n'agit QUE sur ce classeur (@OnlyCurrentDoc) : il n'a accès à rien d'autre dans votre Drive.
 * Il tourne avec votre compte : les membres de l'équipe n'ont besoin d'aucun compte Google.
 * Toute requête doit porter le code d'équipe, généré à l'installation.
 *
 * @OnlyCurrentDoc
 */
var XIII_VERSION = 19;
var CHUNK = 40000;               // une cellule Google Sheets contient au plus 50 000 caractères
var T_DATA = '_donnees', T_LOG = 'Journal', T_README = 'Lisez-moi', T_TEAM = 'Équipe', T_ACK = 'Accusés de lecture', T_PUSH = 'Notifications';

/** ▶️ À exécuter une fois (menu « Exécuter ») : crée les onglets et le code d'équipe. */
function installer() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), P = PropertiesService.getScriptProperties();
  var code = P.getProperty('CODE');
  if (!code) { code = nouveauCode_(); P.setProperty('CODE', code); }
  feuille_(T_DATA, ['outil', 'révision', 'modifié le', 'par', 'taille', 'données…']);
  feuille_(T_LOG, ['date', 'par', 'outil', 'révision', 'modifications']);
  feuille_(T_TEAM, ['jeton', 'nom', 'droit', 'outils', 'expire le', 'créé le', 'révoqué', 'équipe']);
  var r = feuille_(T_README, ['SUITE XIII — Drive du projet']);
  r.getRange(2, 1, 6, 1).setValues([
    ['Ce classeur centralise les données du projet. Il est rempli automatiquement par les outils de SUITE XIII.'],
    ['Un onglet par outil montre les éléments sous forme de tableau (lecture seule : il est régénéré à chaque modification).'],
    ['L\'onglet « Journal » trace qui a modifié quoi, et quand.'],
    ['Ne modifiez pas l\'onglet « _donnees » : c\'est la source des outils.'],
    ['Code d\'équipe : ' + code + '   (à garder secret ; pour le changer, exécutez la fonction « changerCode »)'],
    ['Pour couper l\'accès à tout le monde : Déployer › Gérer les déploiements › Archiver.']
  ]);
  Logger.log('✅ Installation terminée. Code d\'équipe : ' + code);
  Logger.log('Étape suivante : Déployer › Nouveau déploiement › Application Web (Exécuter en tant que : Moi — Qui a accès : Tout le monde).');
  return code;
}

/** ▶️ Génère un nouveau code d'équipe : les anciens liens ne fonctionnent plus. */
function changerCode() {
  var code = nouveauCode_(); PropertiesService.getScriptProperties().setProperty('CODE', code);
  var r = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_README);
  if (r) r.getRange(6, 1).setValue('Code d\'équipe : ' + code + '   (à garder secret ; pour le changer, exécutez la fonction « changerCode »)');
  Logger.log('🔑 Nouveau code d\'équipe : ' + code + ' — collez-le dans SUITE XIII › ☁️ Drive du projet, puis renvoyez le lien d\'équipe.');
  return code;
}

function doGet(e) {
  var q = (e && e.parameter) || {};
  if (q.a === 'ical') { // 📡 abonnement d'agenda (Google Agenda, Apple Calendrier, Outlook)
    var I = lire_('ical_pub'), all = {}; try { all = JSON.parse((I && I.data.live) || '{}'); } catch (x) { }
    var C = all[String(q.k || '')];
    var txt = C && !C.off ? C.ics : 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//SUITE XIII//FR\r\nX-WR-CALNAME:SUITE XIII (abonnement retiré)\r\nEND:VCALENDAR';
    return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.ICAL);
  }
  return repondre_(traiter_(q));
}
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { return repondre_({ ok: false, err: 'format' }); }
  return repondre_(traiter_(p));
}

function traiter_(p) {
  var code = PropertiesService.getScriptProperties().getProperty('CODE');
  if (!code) return { ok: false, err: 'not_installed' };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // 📡 CALL SHEETO : feuille de service vivante — lecture et accusé de lecture avec la seule clé de la feuille (lien envoyé à l'équipe)
  if (p.a === 'fs_get' || p.a === 'fs_ack') {
    var LV = lire_('cs_live'), all = {}; try { all = JSON.parse((LV && LV.data.live) || '{}'); } catch (x) { }
    var F = all[String(p.k || '')]; if (!F || F.off) return { ok: false, err: 'nosheet' };
    if (p.a === 'fs_get') { if (p.since != null && Number(p.since) === F.rev) return { ok: true, rev: F.rev, same: true }; return { ok: true, rev: F.rev, ts: F.ts, pack: F.pack, chg: F.chg || [], label: F.label || '' }; }
    var A = feuille_(T_ACK, ['date', 'feuille', 'nom', 'version', 'objet']);
    if (A.getMaxColumns() < 5) A.insertColumnsAfter(A.getMaxColumns(), 5 - A.getMaxColumns());
    A.appendRow([new Date(), String(p.k).slice(0, 40), String(p.nom || 'anonyme').replace(/^[=+\-@]/, "'").slice(0, 80), Number(p.rev) || 0, p.what === 'secu' ? 'consignes de sécurité' : 'lecture']);
    return { ok: true };
  }
  // 🌐 liens publics en lecture (PLANNO, CASTO, TRANSPORTO, RUNO, CONDUCO…) : seule la clé du lien est demandée
  if (p.a === 'pub_get') {
    var PB = lire_('pub_live'), allp = {}; try { allp = JSON.parse((PB && PB.data.live) || '{}'); } catch (x) { }
    var G = allp[String(p.k || '')]; if (!G || G.off) return { ok: false, err: 'nosheet' };
    if (p.since != null && Number(p.since) === G.rev) return { ok: true, rev: G.rev, same: true };
    return { ok: true, rev: G.rev, ts: G.ts, app: G.app, label: G.label || '', data: G.data };
  }
  // 📲 application équipe : rejoindre le tournage avec la clé du QR code du Master (crée un accès personnel au nom du membre)
  if (p.a === 'join') {
    var AC = appCfg_(); if (!AC.on || !AC.jk || String(p.jk || '') !== AC.jk) return { ok: false, err: 'code' };
    var nom = String(p.nom || '').replace(/^[=+\-@]/, '').trim().slice(0, 80); if (!nom) return { ok: false, err: 'nom' };
    var EJ = feuille_(T_TEAM, ['jeton', 'nom', 'droit', 'outils', 'expire le', 'créé le', 'révoqué', 'équipe']);
    if (EJ.getMaxColumns() < 8) EJ.insertColumnsAfter(EJ.getMaxColumns(), 8 - EJ.getMaxColumns());
    var tj = 't' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, '');
    EJ.appendRow([tj, nom + ' (app)', AC.droit || 'read', AC.outils && AC.outils.length ? AC.outils.join(',') : '*', '', new Date(), '', String(p.secteur || '').slice(0, 40)]);
    return { ok: true, tok: tj, droit: AC.droit || 'read', name: ss.getName() };
  }
  // 🏷️ PACKINGO : QR code des étiquettes de caisses — liste de la caisse et pointage, avec la seule clé des QR du projet
  // 📲 check-in de l'équipe : page d'arrivée publique (clé CIK du QR affiché sur le plateau)
  // 👥 lien / QR de secteur : chaque personne qui le scanne reçoit son propre accès (nom, droits et outils du secteur)
  // 🔗 lien / QR général : n'importe qui demande à rejoindre (nom et prénom) → « membres en attente », le Master valide
  // 📡 CONDUCO : direct à suivre (lecture, sans compte) — état du direct gardé quelques heures en cache
  if (p.a === 'cdl_get') { var cg = CacheService.getScriptCache().get('cdl:' + String(p.k || '').slice(0, 40)); if (!cg) return { ok: false, err: 'nolive' }; return { ok: true, st: JSON.parse(cg), now: Date.now() }; }
  if (p.a === 'gen_join') {
    var GK = PropertiesService.getScriptProperties().getProperty('GENK'); if (!GK || String(p.k || '') !== GK) return { ok: false, err: 'code' };
    var ng = String(p.nom || '').replace(/^[=+\-@§]/, '').trim().slice(0, 80); if (!ng) return { ok: false, err: 'vide' };
    var EG = feuille_(T_TEAM, ['jeton', 'nom', 'droit', 'outils', 'expire le', 'créé le', 'révoqué', 'équipe']), tg = 't' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, '');
    EG.appendRow([tg, ng, 'pending', '*', '', new Date(), '', '']); return { ok: true, tok: tg, name: ss.getName() };
  }
  if (p.a === 'sec_join') {
    var ES = feuille_(T_TEAM, ['jeton', 'nom', 'droit', 'outils', 'expire le', 'créé le', 'révoqué', 'équipe']), ns = ES.getLastRow(), rs = ns > 1 ? ES.getRange(2, 1, ns - 1, 8).getValues() : [], sr = null;
    for (var is = 0; is < rs.length; is++) if (rs[is][0] === String(p.tok || '') && String(rs[is][1]).charAt(0) === '§') sr = rs[is];
    if (!sr) return { ok: false, err: 'code' }; if (sr[6]) return { ok: false, err: 'revoked' }; if (sr[4] && +new Date(sr[4]) < Date.now()) return { ok: false, err: 'expired' };
    var nj = String(p.nom || '').replace(/^[=+\-@§]/, '').trim().slice(0, 80); if (!nj) return { ok: false, err: 'vide' };
    for (var js = 0; js < rs.length; js++) if (String(rs[js][1]).toLowerCase() === nj.toLowerCase() && !rs[js][6] && String(rs[js][7]) === String(sr[7]) && String(rs[js][2]) === String(sr[2])) return { ok: true, tok: rs[js][0], droit: sr[2], outils: sr[3] === '*' ? null : String(sr[3]).split(','), secteur: sr[7] };
    var tn = 't' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, '');
    ES.appendRow([tn, nj, sr[2], sr[3], sr[4], new Date(), '', sr[7]]);
    return { ok: true, tok: tn, droit: sr[2], outils: sr[3] === '*' ? null : String(sr[3]).split(','), secteur: sr[7] };
  }
  if (p.a === 'ci_get' || p.a === 'ci_add') {
    var CI = PropertiesService.getScriptProperties().getProperty('CIK');
    if (!CI || String(p.k || '') !== CI) return { ok: false, err: 'code' };
    if (p.a === 'ci_get') return { ok: true, name: ss.getName() };
    var nmc = String(p.n || '').replace(/^[=+\-@]/, '').trim().slice(0, 80); if (!nmc) return { ok: false, err: 'vide' };
    var AR = feuille_('Arrivées', ['jour', 'nom', 'arrivée', 'note']), dj = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var na = AR.getLastRow(), ra = na > 1 ? AR.getRange(2, 1, na - 1, 3).getValues() : [];
    for (var ia = 0; ia < ra.length; ia++) if (jr_(ra[ia][0]) === dj && String(ra[ia][1]).toLowerCase() === nmc.toLowerCase()) return { ok: true, ts: +new Date(ra[ia][2]), deja: true };
    AR.appendRow(["'" + dj, nmc, new Date(), String(p.note || '').slice(0, 200)]); return { ok: true, ts: Date.now() };
  }
  if (p.a === 'case_get' || p.a === 'case_check') {
    var CK = PropertiesService.getScriptProperties().getProperty('CASEK');
    if (!CK || String(p.k || '') !== CK) return { ok: false, err: 'code' };
    var lockC = LockService.getScriptLock(); if (p.a === 'case_check' && !lockC.tryLock(20000)) return { ok: false, err: 'busy' };
    try {
      var rc = lire_('packingo'); if (!rc) return { ok: false, err: 'nodata' };
      var PK = {}; try { PK = JSON.parse(rc.data['packingoXIII.project'] || '{}'); } catch (x) { return { ok: false, err: 'nodata' }; }
      var cs = (PK.cases || []).filter(function (c) { return c.id === p.c; })[0]; if (!cs) return { ok: false, err: 'nocase' };
      PK.checks = PK.checks || {};
      if (p.a === 'case_check') {
        var cp = String(p.cp || PK.curCp || ''), it = String(p.i || ''); if (!(PK.cps || []).some(function (x) { return x.id === cp; })) return { ok: false, err: 'cp' };
        if (it.indexOf('c:') !== 0 && !cs.items.some(function (x) { return x.id === it; })) return { ok: false, err: 'item' };
        var m = PK.checks[cp] = PK.checks[cp] || {}, who = String(p.by || 'QR').replace(/^[=+\-@]/, '').slice(0, 60), hm = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
        if (!p.s) delete m[it]; else if (it.indexOf('c:') === 0) m[it] = { sealed: true, t: hm }; else m[it] = { s: p.s === 'miss' ? 'miss' : 'ok', t: hm, by: who };
        rc.data['packingoXIII.project'] = JSON.stringify(PK); var ts2 = Date.now();
        ecrire_('packingo', rc.rev + 1, ts2, who + ' (QR)', rc.data);
        SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_LOG).appendRow([new Date(ts2), who + ' (QR)', 'packingo', rc.rev + 1, '🏷️ ' + (cs.code || cs.name) + ' · ' + (p.s ? (p.s === 'miss' ? '✗ manquant' : '✓ pointé') : 'pointage annulé')]);
        rc.rev += 1;
      }
      var chk = {}; (PK.cps || []).forEach(function (c) { var src = PK.checks[c.id] || {}, o = {}; cs.items.forEach(function (x) { if (src[x.id]) o[x.id] = src[x.id]; }); if (src['c:' + cs.id]) o['c:' + cs.id] = src['c:' + cs.id]; chk[c.id] = o; });
      return { ok: true, rev: rc.rev, proj: (PK.prod && PK.prod.name) || '', case: { id: cs.id, code: cs.code, name: cs.name, color: cs.color, fragile: !!cs.fragile, items: cs.items.map(function (x) { return { id: x.id, name: x.name, qty: x.qty, sn: x.sn || '', cat: x.cat || '' }; }) }, cps: (PK.cps || []).map(function (c) { return { id: c.id, name: c.name, icon: c.icon || '', date: c.date || '' }; }), cur: PK.curCp || '', checks: chk };
    } finally { if (p.a === 'case_check') lockC.releaseLock(); }
  }
  // qui parle ? le Master (code d'équipe) ou un membre (jeton personnel : droit, outils, expiration)
  var U;
  if (p.code && String(p.code) === code) U = { admin: true, droit: 'edit', outils: null, nom: String(p.by || 'Master').slice(0, 80) };
  else if (p.code && /^t[0-9A-Za-z]+$/.test(String(p.code))) { var sm = membre_(String(p.code)); if (sm.err) return { ok: false, err: sm.err }; if (sm.droit !== 'admin') return { ok: false, err: 'code' }; U = { admin: true, sm: true, droit: 'edit', outils: null, nom: sm.nom }; } // 👑 Sous-Master : son jeton vaut code d'administration (révocable)
  else if (p.tok) { U = membre_(String(p.tok)); if (U.err) return { ok: false, err: U.err }; if (U.nom.charAt(0) === '§') return { ok: false, err: 'code' }; }
  else return { ok: false, err: 'code' };
  if (U && U.droit === 'admin') { U.admin = true; U.sm = true; U.droit = 'edit'; U.outils = null; }
  var permis = function (app) { return app === 'dossier_pub' || app === 'projet_cfg' || app === 'kiosk_cfg' || (app === 'dossier_m' && (!U.outils || U.outils.indexOf('dossier') > -1)) || (/^m_[a-z]+(_ret)?$/.test(app) && (!U.outils || U.outils.indexOf(app.replace(/^m_/, '').replace(/_ret$/, '')) > -1)) || !U.outils || U.outils.indexOf(app) > -1; };
  var filtre = function (o) { var r = {}; Object.keys(o || {}).forEach(function (a) { if (permis(a)) r[a] = o[a]; }); return r; };
  try {
    if (p.a === 'ping') return { ok: true, vk: appCfg_().v || '', auto: PropertiesService.getScriptProperties().getProperty('AUTO') === '1', v: XIII_VERSION, name: ss.getName(), apps: filtre(lireRevs_()), me: { nom: U.nom, droit: U.droit, secteur: U.secteur || '', outils: U.outils, scope: U.scope || null, admin: !!U.admin } };
    if (p.a === 'revs') return { ok: true, apps: filtre(lireRevs_()), pres: filtre(presence_()) };
    if (p.a === 'team' || p.a === 'mkinv' || p.a === 'rminv') {
      if (!U.admin) return { ok: false, err: 'admin' };
      var E = feuille_(T_TEAM, ['jeton', 'nom', 'droit', 'outils', 'expire le', 'créé le', 'révoqué', 'équipe']);
      if (p.a === 'mkinv') {
        var tok = 't' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, '');
        var dr = ['edit', 'comment', 'read', 'admin'].indexOf(p.droit) > -1 ? p.droit : 'read';
        if (E.getMaxColumns() < 8) E.insertColumnsAfter(E.getMaxColumns(), 8 - E.getMaxColumns()); if (!E.getRange(1, 8).getValue()) E.getRange(1, 8).setValue('équipe');
        E.appendRow([tok, (p.sec ? '§' : '') + String(p.nom || 'membre').replace(/^§/, '').slice(0, 80), dr, (p.outils && p.outils.length ? p.outils.join(',') : '*'), p.exp ? new Date(Number(p.exp)) : '', new Date(), '', (Array.isArray(p.secteur) ? p.secteur.join(',') : String(p.secteur || '')).slice(0, 200)]);
        return { ok: true, tok: tok };
      }
      if (E.getMaxColumns() < 8) E.insertColumnsAfter(E.getMaxColumns(), 8 - E.getMaxColumns());
      if (E.getMaxColumns() < 9) E.insertColumnsAfter(E.getMaxColumns(), 9 - E.getMaxColumns()); if (!E.getRange(1, 9).getValue()) E.getRange(1, 9).setValue('vues précises');
      var n = E.getLastRow(), rows = n > 1 ? E.getRange(2, 1, n - 1, 9).getValues() : [];
      if (p.a === 'rminv') { for (var i = 0; i < rows.length; i++) if (rows[i][0] === p.tok) E.getRange(i + 2, 7).setValue(new Date()); return { ok: true }; }
      return { ok: true, team: rows.filter(function (r) { return r[0]; }).map(function (r) { return { tok: r[0], nom: r[1], droit: r[2], outils: r[3] === '*' ? null : String(r[3]).split(','), exp: r[4] ? +new Date(r[4]) : 0, at: +new Date(r[5]), off: r[6] ? +new Date(r[6]) : 0, secteur: r[7] || '', scope: sc_(r[8]) }; }) };
    }
    if (p.a === 'fs_acks') {
      if (!U.admin) return { ok: false, err: 'admin' };
      var A2 = feuille_(T_ACK, ['date', 'feuille', 'nom', 'version', 'objet']), na = A2.getLastRow(); if (A2.getMaxColumns() < 5) A2.insertColumnsAfter(A2.getMaxColumns(), 5 - A2.getMaxColumns()); var va = na > 1 ? A2.getRange(Math.max(2, na - 1999), 1, Math.min(2000, na - 1), 5).getValues() : [];
      return { ok: true, acks: va.filter(function (r) { return r[1] === p.k; }).map(function (r) { return { ts: +new Date(r[0]), nom: r[2], rev: Number(r[3]) || 0, what: /s[ée]curit/.test(String(r[4])) ? 'secu' : '' }; }) };
    }
    // 🔔 notifications : abonnements des téléphones (membres) et envoi (Master, messages chiffrés par son navigateur)
    if (p.a === 'push_sub' || p.a === 'push_unsub') {
      var NP = feuille_(T_PUSH, ['adresse', 'abonnement', 'nom', 'équipe', 'date']), sub = p.sub || {}, ep = String(sub.endpoint || '');
      if (!/^https:\/\//.test(ep) || ep.length > 900) return { ok: false, err: 'sub' };
      var nn = NP.getLastRow(), vv = nn > 1 ? NP.getRange(2, 1, nn - 1, 1).getValues() : [];
      for (var q = vv.length - 1; q >= 0; q--) if (vv[q][0] === ep) NP.deleteRow(q + 2);
      if (p.a === 'push_sub') NP.appendRow([ep, JSON.stringify({ endpoint: ep, keys: { p256dh: String((sub.keys || {}).p256dh || '').slice(0, 200), auth: String((sub.keys || {}).auth || '').slice(0, 60) } }), (U.admin ? String(p.nom || 'Master') : U.nom.replace(/ \(app\)$/, '')).slice(0, 80), String(p.secteur || U.secteur || '').slice(0, 40), new Date()]);
      return { ok: true };
    }
    if (p.a === 'push_subs' || p.a === 'push_send' || p.a === 'app_cfg') {
      if (!U.admin) return { ok: false, err: 'admin' };
      if (p.a === 'app_cfg') {
        var cf = appCfg_();
        if (p.set) { if (!cf.jk || p.set.newKey) cf.jk = 'j' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, ''); if (p.set.v) cf.v = String(p.set.v).replace(/[^\w-]/g, '').slice(0, 200); if (p.set.on != null) cf.on = !!p.set.on; if (p.set.droit && ['edit', 'comment', 'read'].indexOf(p.set.droit) > -1) cf.droit = p.set.droit; if (p.set.outils !== undefined) cf.outils = p.set.outils; PropertiesService.getScriptProperties().setProperty('APP', JSON.stringify(cf)); }
        return { ok: true, cfg: cf };
      }
      var NS = feuille_(T_PUSH, ['adresse', 'abonnement', 'nom', 'équipe', 'date']), ns = NS.getLastRow(), rs = ns > 1 ? NS.getRange(2, 1, ns - 1, 5).getValues() : [];
      if (p.a === 'push_subs') return { ok: true, subs: rs.filter(function (r) { return r[0]; }).map(function (r) { var o = {}; try { o = JSON.parse(r[1]); } catch (x) { } return { sub: o, nom: r[2], secteur: r[3], at: +new Date(r[4]) }; }) };
      var M = (p.msgs || []).slice(0, 200), reqs = M.map(function (m) { return { url: String(m.endpoint), method: 'post', contentType: 'application/octet-stream', headers: { 'Content-Encoding': 'aes128gcm', TTL: String(m.headers && m.headers.TTL || 86400), Urgency: String(m.headers && m.headers.Urgency || 'normal'), Authorization: String(m.headers && m.headers.Authorization || '') }, payload: Utilities.base64DecodeWebSafe(String(m.body || '')), muteHttpExceptions: true }; });
      var out = reqs.length ? UrlFetchApp.fetchAll(reqs) : [], sent = 0, gone = [], codes = [];
      out.forEach(function (r, i) { var c = r.getResponseCode(); codes.push(c); if (c >= 200 && c < 300) sent++; else if (c === 404 || c === 410) gone.push(M[i].endpoint); });
      if (gone.length) for (var g = rs.length - 1; g >= 0; g--) if (gone.indexOf(rs[g][0]) > -1) NS.deleteRow(g + 2);
      return { ok: true, sent: sent, gone: gone, codes: codes };
    }
    if (p.a === 'ci_cfg') { if (!U.admin) return { ok: false, err: 'admin' }; var PQ = PropertiesService.getScriptProperties(), cq = PQ.getProperty('CIK'); if (!cq || p.renew) { cq = 'c' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, ''); PQ.setProperty('CIK', cq); } return { ok: true, k: cq }; }
    if (p.a === 'ci_me') { // ✅ « Je suis arrivé » depuis l'app équipe (membre identifié par son lien)
      var nm2 = String(U.nom || '').replace(/ \(app\)$/, '').replace(/^[=+\-@]/, '').trim().slice(0, 80); if (!nm2) return { ok: false, err: 'vide' };
      var AR2 = feuille_('Arrivées', ['jour', 'nom', 'arrivée', 'note']), dj2 = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), na2 = AR2.getLastRow(), ra2 = na2 > 1 ? AR2.getRange(2, 1, na2 - 1, 3).getValues() : [];
      for (var i2 = 0; i2 < ra2.length; i2++) if (jr_(ra2[i2][0]) === dj2 && String(ra2[i2][1]).toLowerCase() === nm2.toLowerCase()) return { ok: true, ts: +new Date(ra2[i2][2]), deja: true };
      AR2.appendRow(["'" + dj2, nm2, new Date(), String(p.note || '📱 app équipe').slice(0, 200)]); return { ok: true, ts: Date.now() };
    }
    if (p.a === 'ci_list') { var AL = feuille_('Arrivées', ['jour', 'nom', 'arrivée', 'note']), nl = AL.getLastRow(), rl = nl > 1 ? AL.getRange(2, 1, nl - 1, 4).getValues() : [], dd = String(p.d || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));
      return { ok: true, d: dd, arr: rl.filter(function (r) { return jr_(r[0]) === dd; }).map(function (r) { return { n: String(r[1]), ts: +new Date(r[2]), note: String(r[3] || '') }; }) }; }
    // 👥 gestion de l'équipe : modifier un membre, secteurs, lien général
    if (p.a === 'mbr_set') { if (!U.admin) return { ok: false, err: 'admin' };
      var EM = feuille_(T_TEAM, ['jeton', 'nom', 'droit', 'outils', 'expire le', 'créé le', 'révoqué', 'équipe']), nm2 = EM.getLastRow(), rm2 = nm2 > 1 ? EM.getRange(1, 1, nm2, 1).getValues() : [], row = -1;
      for (var im = 1; im < rm2.length; im++) if (rm2[im][0] === String(p.tok || '')) row = im + 1; if (row < 0) return { ok: false, err: 'nomember' };
      var st = p.set || {};
      if (st.del) { EM.deleteRow(row); return { ok: true }; } // 🗑️ effacer définitivement
      if (st.nom != null) EM.getRange(row, 2).setValue(String(st.nom).replace(/^[=+\-@]/, '').slice(0, 80));
      if (st.droit && ['edit', 'comment', 'read', 'admin', 'pending'].indexOf(st.droit) > -1) EM.getRange(row, 3).setValue(st.droit);
      if (st.outils !== undefined) EM.getRange(row, 4).setValue(st.outils && st.outils.length ? st.outils.join(',') : '*');
      if (st.exp !== undefined) EM.getRange(row, 5).setValue(st.exp ? new Date(Number(st.exp)) : '');
      if (st.secteur !== undefined) EM.getRange(row, 8).setValue((Array.isArray(st.secteur) ? st.secteur.join(',') : String(st.secteur || '')).slice(0, 200));
      if (st.off !== undefined) EM.getRange(row, 7).setValue(st.off ? new Date() : '');
      if (st.scope !== undefined) { if (EM.getMaxColumns() < 9) EM.insertColumnsAfter(EM.getMaxColumns(), 9 - EM.getMaxColumns()); EM.getRange(row, 9).setValue(st.scope && Object.keys(st.scope).length ? JSON.stringify(st.scope).slice(0, 40000) : ''); } // 🎯 vues précises par outil
      return { ok: true }; }
    if (p.a === 'teams_get' || p.a === 'teams_set') { var PT = PropertiesService.getScriptProperties();
      if (p.a === 'teams_set') { if (!U.admin) return { ok: false, err: 'admin' }; PT.setProperty('TEAMS', JSON.stringify((p.teams || []).slice(0, 40).map(function (t) { return [String(t[0]).slice(0, 30), String(t[1]).slice(0, 40)]; }))); }
      var tl = null; try { tl = JSON.parse(PT.getProperty('TEAMS') || 'null'); } catch (x) { } return { ok: true, teams: tl }; }
    // 📱 photos prises au téléphone pour un outil (MOODO, REPERO, CASTO…) : fichier dans le Drive + ligne « Photos »
    if (p.a === 'ph_add' || p.a === 'ph_list' || p.a === 'ph_done') {
      var PH = feuille_('Photos', ['date', 'par', 'outil', 'cible', 'légende', 'fichier', 'intégré']);
      if (p.a === 'ph_add') { var pa = String(p.app || ''); if (!pa || !permis(pa)) return { ok: false, err: 'forbidden' }; if ((!p.b64 && pa !== 'casto') || String(p.b64 || '').length > 6e6) return { ok: false, err: 'photo' }; var fid2 = 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        if (p.b64) { var bp = Utilities.newBlob(Utilities.base64Decode(String(p.b64)), String(p.mime || 'image/jpeg'), pa + ' ' + U.nom.replace(/ \(app\)$/, '') + ' ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss') + '.jpg'); var fp = dossierFichiers_().createFile(bp); fp.setDescription('photo ' + pa); fid2 = fp.getId(); }
        PH.appendRow([new Date(), U.nom.replace(/ \(app\)$/, ''), pa, String(p.target || '').slice(0, 1000), String(p.cap || '').replace(/^[=+\-@]/, '').slice(0, 300), fid2, '']); return { ok: true }; }
      if (U.droit !== 'edit') return { ok: false, err: 'readonly' };
      var nph = PH.getLastRow(), rph = nph > 1 ? PH.getRange(2, 1, nph - 1, 7).getValues() : [];
      if (p.a === 'ph_done') { var ids2 = (p.ids || []).map(String); for (var q2 = 0; q2 < rph.length; q2++) if (ids2.indexOf(String(rph[q2][5])) > -1) PH.getRange(q2 + 2, 7).setValue(new Date()); return { ok: true }; }
      return { ok: true, photos: rph.filter(function (r) { return r[0] && !r[6] && String(r[2]) === String(p.app); }).map(function (r) { return { ts: +new Date(r[0]), by: r[1], target: r[3], cap: r[4], fid: r[5] }; }) };
    }
    if (p.a === 'case_key') { if (!permis('packingo')) return { ok: false, err: 'forbidden' }; var PKk = PropertiesService.getScriptProperties(), kc = PKk.getProperty('CASEK'); if (!kc && U.admin) { kc = 'k' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, ''); PKk.setProperty('CASEK', kc); } if (!kc) return { ok: false, err: 'nokey' }; return { ok: true, k: kc }; } // 🧳 application : pointer les caisses sans étiquette sous la main
    if (p.a === 'cdl_put') { if (U.droit !== 'edit') return { ok: false, err: 'readonly' }; var kk = String(p.k || '').slice(0, 40); if (!/^[a-z0-9]{8,40}$/i.test(kk)) return { ok: false, err: 'k' }; var st0 = p.st || {}; st0._srv = Date.now(); var sj = JSON.stringify(st0); if (sj.length > 90000) return { ok: false, err: 'big' }; if (p.off) CacheService.getScriptCache().remove('cdl:' + kk); else CacheService.getScriptCache().put('cdl:' + kk, sj, 21600); return { ok: true, now: Date.now() }; }
    if (p.a === 'bk_list' || p.a === 'bk_restore') { // 🛟 sauvegardes nocturnes : liste et restauration (Master uniquement)
      if (!U.admin) return { ok: false, err: 'admin' };
      var bit = DriveApp.getFoldersByName('SUITE XIII — sauvegardes'); if (!bit.hasNext()) return { ok: true, list: [], auto: PropertiesService.getScriptProperties().getProperty('AUTO') === '1' };
      var bdir = bit.next(), bL = [], bf = bdir.getFiles(), myName = SpreadsheetApp.getActiveSpreadsheet().getName();
      while (bf.hasNext()) { var bx = bf.next(); if (bx.getMimeType() === MimeType.GOOGLE_SHEETS && bx.getName().indexOf(myName + ' — ') === 0) bL.push(bx); }
      bL.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
      if (p.a === 'bk_list') return { ok: true, auto: PropertiesService.getScriptProperties().getProperty('AUTO') === '1', list: bL.map(function (x) { var rv = {}; try { var BD = SpreadsheetApp.openById(x.getId()).getSheetByName(T_DATA), bn = BD.getLastRow(); if (bn > 1) BD.getRange(2, 1, bn - 1, 4).getValues().forEach(function (r) { if (r[0] && !/^(auto_queue)$/.test(r[0])) rv[r[0]] = +new Date(r[2]); }); } catch (x2) { } return { id: x.getId(), name: x.getName(), at: +x.getDateCreated(), apps: rv }; }) };
      var src = null; for (var bi = 0; bi < bL.length; bi++) if (bL[bi].getId() === String(p.id)) src = bL[bi]; if (!src) return { ok: false, err: 'introuvable' };
      var lockB = LockService.getScriptLock(); if (!lockB.tryLock(20000)) return { ok: false, err: 'busy' };
      try {
        var cur = SpreadsheetApp.getActiveSpreadsheet(); DriveApp.getFileById(cur.getId()).makeCopy(cur.getName() + ' — avant restauration ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'), bdir);
        var SD = SpreadsheetApp.openById(src.getId()).getSheetByName(T_DATA), sn = SD.getLastRow(); if (sn < 2) return { ok: false, err: 'vide' };
        var rows = SD.getRange(2, 1, sn - 1, SD.getLastColumn()).getValues(), revs = lireRevs_(), done = [], quand = Utilities.formatDate(src.getDateCreated(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
        rows.forEach(function (r) { var ap = r[0]; if (!ap || ap === 'auto_queue' || (p.app && p.app !== ap)) return; var nb = Number(r[4]) || 0, txt = r.slice(5, 5 + nb).map(function (c) { return String(c).slice(1); }).join(''), dt = {}; try { dt = JSON.parse(txt || '{}'); } catch (x3) { return; }
          ecrire_(ap, ((revs[ap] || {}).rev || 0) + 1, Date.now(), 'Restauration du ' + quand, dt); done.push(ap); });
        cur.getSheetByName(T_LOG).appendRow([new Date(), U.nom || 'Master', 'restauration', p.app || 'tout', '🛟 Restauration de la sauvegarde du ' + quand + ' : ' + done.join(', ')]);
        return { ok: true, apps: done };
      } finally { lockB.releaseLock(); }
    }
    if (p.a === 'gen_cfg') { if (!U.admin) return { ok: false, err: 'admin' }; var PG = PropertiesService.getScriptProperties(), gk = PG.getProperty('GENK'); if (!gk || p.renew) { gk = 'g' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, ''); PG.setProperty('GENK', gk); } if (p.off) { PG.deleteProperty('GENK'); return { ok: true, k: '' }; } return { ok: true, k: gk }; }
    if (p.a === 'rap_cfg') { if (!U.admin) return { ok: false, err: 'admin' }; var RPp = PropertiesService.getScriptProperties(), rc0 = {}; try { rc0 = JSON.parse(RPp.getProperty('RAP') || '{}'); } catch (x) { }
      if (p.set) { rc0.on = !!p.set.on; rc0.to = String(p.set.to || '').slice(0, 300); rc0.h = Math.max(12, Math.min(23, Number(p.set.h) || 21)); rc0.cc = !!p.set.cc; RPp.setProperty('RAP', JSON.stringify(rc0)); }
      return { ok: true, cfg: rc0 }; }
    if (p.a === 'rap_now') { if (!U.admin) return { ok: false, err: 'admin' }; var rr0 = rapport_(String(p.d || '')); if (p.send) { var rcf = {}; try { rcf = JSON.parse(PropertiesService.getScriptProperties().getProperty('RAP') || '{}'); } catch (x) { } if (!rcf.to) return { ok: false, err: 'noto' }; MailApp.sendEmail({ to: rcf.to, subject: rr0.subject, htmlBody: rr0.html, name: 'SUITE XIII' }); } return { ok: true, subject: rr0.subject, html: rr0.html }; }
    if (p.a === 'case_cfg') { if (!U.admin) return { ok: false, err: 'admin' }; var PP = PropertiesService.getScriptProperties(), ck = PP.getProperty('CASEK'); if (!ck || p.renew) { ck = 'k' + nouveauCode_().replace(/-/g, '') + nouveauCode_().replace(/-/g, ''); PP.setProperty('CASEK', ck); } return { ok: true, k: ck }; }
    // ✉️ messages des membres au Master (carte « Écrire au Master » de l'accueil)
    // 🧾 dépenses du jour envoyées depuis le téléphone (photo du ticket + montant) → 💳 Réel de DEVISO
    if (p.a === 'dep_add' || p.a === 'dep_list' || p.a === 'dep_done') {
      var DP = feuille_('Dépenses', ['date', 'nom', 'montant TTC', 'poste', 'libellé', 'ticket', 'intégré']), qui = U.nom.replace(/ \(app\)$/, '');
      if (p.a === 'dep_add') {
        var mt = Math.round(Number(p.ttc) * 100) / 100; if (!(mt > 0) || mt > 1e6) return { ok: false, err: 'montant' };
        var fid = ''; if (p.b64 && String(p.b64).length < 4e6) { var bt = Utilities.newBlob(Utilities.base64Decode(String(p.b64)), String(p.mime || 'image/jpeg'), 'ticket ' + qui + ' ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm') + '.jpg'); var ft = dossierFichiers_().createFile(bt); ft.setDescription('ticket'); fid = ft.getId(); }
        DP.appendRow([new Date(), qui, mt, ['eq', 'crew', 'fees', 'other'].indexOf(p.cat) > -1 ? p.cat : 'fees', String(p.label || '').replace(/^[=+\-@]/, '').slice(0, 160), fid, '']);
        return { ok: true };
      }
      if (!U.admin) return { ok: false, err: 'admin' };
      var nd = DP.getLastRow(), rd = nd > 1 ? DP.getRange(2, 1, nd - 1, 7).getValues() : [];
      if (p.a === 'dep_done') { var ids = (p.ids || []).map(Number); for (var z = 0; z < rd.length; z++) if (ids.indexOf(+new Date(rd[z][0])) > -1) DP.getRange(z + 2, 7).setValue(new Date()); return { ok: true }; }
      return { ok: true, deps: rd.filter(function (r) { return r[0] && !r[6]; }).map(function (r) { return { ts: +new Date(r[0]), by: r[1], ttc: Number(r[2]), cat: r[3], label: r[4], ph: r[5] }; }) };
    }
    // 📣 mentions @Prénom dans les 💬 avis et 📌 mots : affichées sur l'accueil de la personne à sa prochaine ouverture
    if (p.a === 'ment_add' || p.a === 'ment_list' || p.a === 'ment_read') {
      var MN = feuille_('Mentions', ['date', 'de', 'pour', 'outil', 'élément', 'message', 'lu']), moi = U.nom.replace(/ \(app\)$/, '');
      var fd = function (x) { return String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[_.]+/g, ' ').trim(); };
      var vise = function (t) { var a = fd(t), b = fd(moi); return !!a && (a === b || a === b.split(' ')[0] || a.replace(/ /g, '') === b.replace(/ /g, '')); };
      if (p.a === 'ment_add') { var to = (p.to || []).slice(0, 10); to.forEach(function (t) { MN.appendRow([new Date(), moi, String(t).slice(0, 60), String(p.app || '').slice(0, 20), String(p.el || '').slice(0, 120), String(p.txt || '').replace(/^[=+\-]/, "'").slice(0, 1500), '']); }); return { ok: true, n: to.length }; }
      var nn = MN.getLastRow(), rr = nn > 1 ? MN.getRange(2, 1, nn - 1, 7).getValues() : [];
      if (p.a === 'ment_read') { for (var q = 0; q < rr.length; q++) if (vise(rr[q][2]) && !rr[q][6] && (!p.ts || +new Date(rr[q][0]) === Number(p.ts))) MN.getRange(q + 2, 7).setValue(new Date()); return { ok: true }; }
      return { ok: true, ments: rr.filter(function (r) { return r[0] && !r[6] && vise(r[2]); }).map(function (r) { return { ts: +new Date(r[0]), by: r[1], app: r[3], el: r[4], txt: r[5] }; }).reverse().slice(0, 30) };
    }
    if (p.a === 'chat_send' || p.a === 'chat_list') { // 💬 chat de projet : toute l'équipe lit et écrit (contexte outil › élément facultatif)
      var CH = feuille_('Chat', ['date', 'nom', 'équipe', 'message', 'outil', 'élément', 'mentions']);
      if (p.a === 'chat_send') { var ct = String(p.txt || '').replace(/^[=+\-@]/, "'").slice(0, 2000); if (!ct) return { ok: false, err: 'vide' }; var now = new Date(); CH.appendRow([now, U.nom.replace(/ \(app\)$/, ''), U.secteur || '', ct, String(p.app || '').slice(0, 20), String(p.el || '').slice(0, 120), (p.to || []).slice(0, 10).join(',')]); return { ok: true, ts: +now }; }
      var nc = CH.getLastRow(), k0 = Math.max(2, nc - 199), rc = nc > 1 ? CH.getRange(k0, 1, nc - k0 + 1, 7).getValues() : [], since = Number(p.since || 0);
      return { ok: true, me: U.nom.replace(/ \(app\)$/, ''), msgs: rc.filter(function (r) { return r[0] && +new Date(r[0]) > since; }).map(function (r) { return { ts: +new Date(r[0]), nom: r[1], secteur: r[2], txt: String(r[3]).replace(/^'/, ''), app: r[4], el: r[5], to: r[6] ? String(r[6]).split(',') : [] }; }) };
    }
    if (p.a === 'msg_send' || p.a === 'msg_list' || p.a === 'msg_read') {
      var MS = feuille_('Messages', ['date', 'nom', 'équipe', 'message', 'lu']);
      if (p.a === 'msg_send') { var tx = String(p.txt || '').replace(/^[=+\-@]/, "'").slice(0, 2000); if (!tx) return { ok: false, err: 'vide' }; MS.appendRow([new Date(), U.nom.replace(/ \(app\)$/, ''), U.secteur || '', tx, '']); return { ok: true }; }
      if (!U.admin) return { ok: false, err: 'admin' };
      var nm = MS.getLastRow(), rm = nm > 1 ? MS.getRange(2, 1, nm - 1, 5).getValues() : [];
      if (p.a === 'msg_read') { for (var w = 0; w < rm.length; w++) if (+new Date(rm[w][0]) === Number(p.ts)) MS.getRange(w + 2, 5).setValue(new Date()); return { ok: true }; }
      return { ok: true, msgs: rm.filter(function (r) { return r[0]; }).map(function (r) { return { ts: +new Date(r[0]), nom: r[1], secteur: r[2], txt: r[3], lu: r[4] ? 1 : 0 }; }).reverse().slice(0, 50) };
    }
    // 📎 gros fichiers (photos, PDF…) : vrais fichiers dans le dossier « SUITE XIII — fichiers », à côté du classeur
    if (p.a === 'file_put') {
      if (U.droit !== 'edit') return { ok: false, err: 'readonly' };
      var dir = dossierFichiers_(), h = String(p.h || '').slice(0, 120), it = dir.getFiles();
      while (it.hasNext()) { var ex = it.next(); if (ex.getDescription() === h) return { ok: true, id: ex.getId(), same: true }; }
      var bl = Utilities.newBlob(Utilities.base64Decode(String(p.b64 || '')), String(p.mime || 'application/octet-stream'), String(p.name || 'fichier').replace(/[\/\\]/g, '-').slice(0, 120));
      var fi = dir.createFile(bl); fi.setDescription(h);
      return { ok: true, id: fi.getId() };
    }
    if (p.a === 'file_get') {
      var fg; try { fg = DriveApp.getFileById(String(p.id || '')); } catch (x) { return { ok: false, err: 'nofile' }; }
      if (fg.getParents().hasNext() && fg.getParents().next().getId() !== dossierFichiers_().getId()) return { ok: false, err: 'nofile' };
      var b = fg.getBlob(); return { ok: true, mime: b.getContentType(), b64: Utilities.base64Encode(b.getBytes()) };
    }
    if (p.app && !permis(String(p.app))) return { ok: false, err: 'forbidden' };
    p.by = U.nom; // le nom vient du jeton, pas du poste : journal fiable
    if (p.a === 'beat') {
      if (U.droit !== 'edit' && !p.look) return { ok: true, pres: presence_() }; // « je suis en train de modifier cet outil » ; look = simple présence (outil ouvert)
      var C = CacheService.getScriptCache(), P2 = presence_(), now = Date.now(), app = String(p.app || '').slice(0, 20), id = String(p.id || '').slice(0, 40);
      if (!app || !id) return { ok: false, err: 'app' };
      P2[app] = P2[app] || {}; if (p.stop) delete P2[app][id]; else { var pv = P2[app][id] || {}; P2[app][id] = { by: String(p.by || 'anonyme').slice(0, 80), ts: now, e: p.look ? (pv.e || 0) : now, w: String(p.w || pv.w || '').slice(0, 40), f: String(p.f || '').slice(0, 90), ft: p.f ? now : 0 }; } // f = élément en cours d'édition (verrou)
      C.put('pres', JSON.stringify(P2), 300);
      return { ok: true, pres: P2 };
    }
    if (p.a === 'get') {
      var cur = lire_(p.app);
      if (!cur) return { ok: true, rev: 0, pres: presence_()[p.app] || {} };
      var pr = presence_()[p.app] || {};
      if (p.since != null && Number(p.since) === cur.rev) return { ok: true, rev: cur.rev, same: true, ts: cur.ts, by: cur.by, pres: pr };
      if (p.app === 'dossier_pub' && !U.admin) cur.data = visibles_(cur.data, U.secteur);
      return { ok: true, rev: cur.rev, ts: cur.ts, by: cur.by, data: cur.data, pres: pr };
    }
    if (p.a === 'put') {
      if (p.app === 'projet_cfg' && !U.admin) return { ok: false, err: 'admin' };
      if ((p.app === 'dossier_pub' || p.app === 'kiosk_cfg' || p.app === 'cs_live' || p.app === 'pub_live' || p.app === 'auto_queue' || p.app === 'ical_pub') && !U.admin) return { ok: false, err: 'admin' };
      if (!/^[a-z0-9_]{2,20}$/.test(String(p.app || ''))) return { ok: false, err: 'app' };
      var lock = LockService.getScriptLock();
      if (!lock.tryLock(20000)) return { ok: false, err: 'busy' };
      try {
        var old = lire_(p.app), rev = old ? old.rev : 0;
        if (Number(p.base || 0) !== rev) return { ok: false, err: 'conflict', rev: rev, ts: old && old.ts, by: old && old.by, data: old ? old.data : {} };
        var ts = Date.now(), by = String(p.by || 'anonyme').slice(0, 80);
        if (U.droit !== 'edit') { // commentaires : 💬 avis + 📌 mots ; lecture seule : 📌 mots (réponses, « lu ») ; le reste reste celui du Drive
          var ks = U.droit === 'comment' ? ['xiii.notes.' + p.app, 'xiii.memo.' + p.app] : ['xiii.memo.' + p.app], keep = old ? JSON.parse(JSON.stringify(old.data)) : {};
          ks.forEach(function (k) { if (p.data && p.data[k] != null) keep[k] = p.data[k]; });
          p.data = keep; p.sum = U.droit === 'comment' ? '💬 avis / 📌 mots' : '📌 mots';
        }
        ecrire_(p.app, rev + 1, ts, by, p.data || {});
        ss.getSheetByName(T_LOG).appendRow([new Date(ts), by, p.app, rev + 1, String(p.sum || '').slice(0, 2000)]);
        if (!/^(dossier_pub|cs_live|pub_live|auto_queue|ical_pub)$/.test(p.app)) { try { vue_(p.app, p.data || {}); } catch (x) { } }
        return { ok: true, rev: rev + 1, ts: ts };
      } finally { lock.releaseLock(); }
    }
    if (p.a === 'log') {
      var L = ss.getSheetByName(T_LOG), n = L.getLastRow();
      if (n < 2) return { ok: true, log: [] };
      var k = Math.min(p.app ? 60 : 500, n - 1), v = L.getRange(n - k + 1, 1, k, 5).getValues();
      return { ok: true, log: v.reverse().filter(function (r) { return (!p.app || r[2] === p.app) && permis(r[2]); }).map(function (r) { return { ts: +new Date(r[0]), by: r[1], app: r[2], rev: r[3], sum: r[4] }; }) };
    }
    return { ok: false, err: 'action' };
  } catch (x) { return { ok: false, err: 'script', msg: String(x && x.message || x) }; }
}

// DOSSIER : un membre ne reçoit que les documents que le Master a rendus visibles pour tous ou pour son équipe
function visibles_(data, secteur) {
  var pub = {}; try { pub = JSON.parse(data.pub || '{}'); } catch (x) { return {}; }
  pub.docs = (pub.docs || []).filter(function (d) { var v = d.vis || {}; var ms = String(secteur || '').split(',').filter(String); return v.all || ms.some(function (x) { return (v.teams || []).indexOf(x) > -1; }); });
  return { pub: JSON.stringify(pub) };
}
function sc_(v) { if (!v) return null; try { var o = JSON.parse(String(v)); return o && typeof o === 'object' && Object.keys(o).length ? o : null; } catch (x) { return null; } }
function membre_(tok) {
  var E = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_TEAM); if (!E || E.getLastRow() < 2) return { err: 'code' };
  var rows = E.getRange(2, 1, E.getLastRow() - 1, Math.min(9, E.getMaxColumns())).getValues();
  for (var i = 0; i < rows.length; i++) if (rows[i][0] === tok) {
    var r = rows[i];
    if (r[6]) return { err: 'revoked' };
    if (String(r[2]) === 'pending') return { err: 'pending' };
    if (r[4] && +new Date(r[4]) < Date.now()) return { err: 'expired' };
    return { nom: String(r[1]), droit: String(r[2]), secteur: String(r[7] || ''), outils: r[3] === '*' || !r[3] ? null : String(r[3]).split(','), scope: sc_(r[8]) };
  }
  return { err: 'code' };
}
// présence : qui modifie quoi en ce moment (mémoire courte du script, effacée après 45 s sans signe)
// ---------- 📨 rapport de fin de journée : plans (SCRIPTO), rushes (BACKUPO), horaires et arrivées (CALL SHEETO / check-in), dépenses ----------
function rapport_(d) {
  var tz = Session.getScriptTimeZone(); d = d || Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var G = function (app, k) { var r = lire_(app); if (!r || !r.data || !r.data[k]) return null; try { return JSON.parse(r.data[k]); } catch (x) { return null; } };
  var e = function (x) { return String(x == null ? '' : x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var cs = G('callsheeto', 'callsheetoXIII.project'), sc = G('scripto', 'scriptoXIII.project'), bk = G('backupo', 'backupoXIII.project');
  var proj = (cs && cs.name) || (sc && sc.name) || SpreadsheetApp.getActiveSpreadsheet().getName();
  var H = [], sec = function (t, b) { H.push('<h2 style="font:700 15px Arial;margin:22px 0 6px;color:#b8651f">' + t + '</h2>' + b); };
  var row = function (a, b) { return '<tr><td style="padding:3px 12px 3px 0;color:#666">' + a + '</td><td style="padding:3px 0"><b>' + b + '</b></td></tr>'; };
  var day = cs && (cs.days || []).filter(function (x) { return x.date === d; })[0];
  if (day) { var T = day.times || {}; sec('🕘 Horaires', '<table>' + [['Convocation', T.general], ['PAT', T.pat], ['Repas', T.lunch], ['Fin prévue', T.wrap]].filter(function (x) { return x[1]; }).map(function (x) { return row(x[0], e(x[1])); }).join('') + '</table>'); }
  var AR = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Arrivées'), arr = [];
  if (AR && AR.getLastRow() > 1) arr = AR.getRange(2, 1, AR.getLastRow() - 1, 3).getValues().filter(function (r) { return jr_(r[0]) === d; });
  if (day || arr.length) { var crew = day ? (day.crew || []).filter(function (c) { return c.name; }) : [];
    sec('👥 Équipe · ' + arr.length + ' arrivée(s)' + (crew.length ? ' / ' + crew.length + ' convoqué(s)' : ''), arr.length ? '<table>' + arr.map(function (r) { return row(e(r[1]), Utilities.formatDate(new Date(r[2]), tz, 'HH:mm')); }).join('') + '</table>' : '<p style="color:#666">Aucun check-in QR.</p>'); }
  var scd = sc && (sc.days || []).filter(function (x) { return x.date === d; })[0];
  if (scd) { var sh = (sc.shots || []).filter(function (s) { return s.day === scd.id && s.status !== 'skip'; }), dn = sh.filter(function (s) { return s.status === 'done'; }), rest = sh.filter(function (s) { return s.status !== 'done'; });
    sec('🎬 Plans · ' + dn.length + ' / ' + sh.length + ' tournés', (rest.length ? '<p>Non tournés : ' + rest.slice(0, 40).map(function (s) { return e(s.num || s.n || s.label || s.id); }).join(', ') + '</p>' : '<p>✅ Tous les plans prévus ont été tournés.</p>') + (scd.notes ? '<p style="color:#666">' + e(scd.notes) + '</p>' : '')); }
  var bkd = bk && (bk.days || []).filter(function (x) { return x.date === d; })[0];
  if (bkd) { var L = (bk.log || []).filter(function (l) { return l.day === bkd.id; }), req = (bk.prod && bk.prod.copiesReq) || 2, by = 0, bad = 0;
    L.forEach(function (l) { by += Number(l.bytes) || 0; if ((l.errors && l.errors.length) || (l.dests || []).filter(function (x) { return x.st === 'ok'; }).length < req) bad++; });
    sec('💽 Rushes', '<table>' + row('Cartes déchargées', L.length) + row('Volume', (by / 1e9).toFixed(1).replace('.', ',') + ' Go') + row('Copies requises', req) + row('À vérifier', bad ? '⚠️ ' + bad : '✅ aucune') + '</table>'); }
  var DP = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dépenses'), dep = [];
  if (DP && DP.getLastRow() > 1) dep = DP.getRange(2, 1, DP.getLastRow() - 1, 5).getValues().filter(function (r) { return r[0] && Utilities.formatDate(new Date(r[0]), tz, 'yyyy-MM-dd') === d; });
  if (dep.length) { var tot = 0; dep.forEach(function (r) { tot += Number(r[2]) || 0; }); sec('🧾 Dépenses du jour · ' + tot.toFixed(2).replace('.', ',') + ' € TTC', '<table>' + dep.map(function (r) { return row(e(r[1]) + (r[4] ? ' — ' + e(r[4]) : ''), Number(r[2]).toFixed(2).replace('.', ',') + ' €'); }).join('') + '</table>'); }
  var jour = d.split('-').reverse().join('/');
  var html = '<div style="font:14px/1.5 Arial,sans-serif;color:#222;max-width:640px"><div style="color:#888;font-size:12px;letter-spacing:.08em;text-transform:uppercase">' + e(proj) + '</div><h1 style="font:800 22px Arial;margin:4px 0 0">Rapport de fin de journée · ' + jour + (day && day.name ? ' · ' + e(day.name) : '') + '</h1>' +
    (H.length ? H.join('') : '<p style="color:#666">Rien d\'enregistré dans les outils pour cette journée.</p>') + '<p style="color:#999;font-size:11px;margin-top:26px">Envoyé automatiquement par SUITE XIII (☁️ Drive du projet).</p></div>';
  return { subject: '📨 ' + proj + ' — rapport du ' + jour, html: html, empty: !H.length };
}
function rapportAuto_() {
  var PP = PropertiesService.getScriptProperties(), c = {}; try { c = JSON.parse(PP.getProperty('RAP') || '{}'); } catch (x) { return; }
  if (!c.on || !c.to) return; var tz = Session.getScriptTimeZone(), now = new Date(), d = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  if (Number(Utilities.formatDate(now, tz, 'H')) < (c.h || 21) || c.last === d) return;
  var r = rapport_(d); c.last = d; PP.setProperty('RAP', JSON.stringify(c)); if (r.empty) return; // pas de tournage ce jour-là : pas de rapport
  MailApp.sendEmail({ to: c.to, subject: r.subject, htmlBody: r.html, name: 'SUITE XIII' });
}
function jr_(v) { if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd'); return String(v || '').replace(/^'/, ''); }
function presence_() {
  var o = {}; try { o = JSON.parse(CacheService.getScriptCache().get('pres') || '{}'); } catch (x) { }
  var lim = Date.now() - 45000; Object.keys(o).forEach(function (a) { Object.keys(o[a]).forEach(function (i) { if (o[a][i].ts < lim) delete o[a][i]; }); });
  return o;
}
// ---------- stockage : une ligne par outil, les données découpées en morceaux de 40 000 caractères ----------
function ligne_(app) {
  var D = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_DATA), n = D.getLastRow();
  if (n < 2) return -1;
  var col = D.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < col.length; i++) if (col[i][0] === app) return i + 2;
  return -1;
}
function lireRevs_() {
  var D = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_DATA), n = D.getLastRow(), o = {};
  if (n < 2) return o;
  D.getRange(2, 1, n - 1, 4).getValues().forEach(function (r) { if (r[0]) o[r[0]] = { rev: Number(r[1]) || 0, ts: +new Date(r[2]), by: r[3] }; });
  return o;
}
function lire_(app) {
  var D = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_DATA), i = ligne_(app);
  if (i < 0) return null;
  var head = D.getRange(i, 1, 1, 5).getValues()[0], nb = Number(head[4]) || 0;
  var txt = '';
  if (nb) txt = D.getRange(i, 6, 1, nb).getValues()[0].map(function (c) { return String(c).slice(1); }).join('');
  var data = {}; try { data = JSON.parse(txt || '{}'); } catch (x) { }
  return { rev: Number(head[1]) || 0, ts: +new Date(head[2]), by: head[3], data: data };
}
function ecrire_(app, rev, ts, by, data) {
  var D = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_DATA), txt = JSON.stringify(data), parts = [];
  for (var k = 0; k < txt.length; k += CHUNK) parts.push('~' + txt.slice(k, k + CHUNK)); // « ~ » : jamais lu comme une formule ou un nombre
  var i = ligne_(app); if (i < 0) { i = Math.max(2, D.getLastRow() + 1); }
  var need = 5 + parts.length; if (D.getMaxColumns() < need) D.insertColumnsAfter(D.getMaxColumns(), need - D.getMaxColumns());
  var w = Math.max(D.getLastColumn(), need);
  var row = [app, rev, new Date(ts), by, parts.length].concat(parts); while (row.length < w) row.push('');
  D.getRange(i, 1, 1, w).setValues([row]);
}

// ---------- onglet lisible par outil : chaque liste d'éléments devient un tableau ----------
var COLS = { tasks: 'Tâches', items: 'Éléments', days: 'Journées', crew: 'Équipe', eq: 'Matériel', fees: 'Frais', cues: 'Sous-titres', people: 'Personnes', talents: 'Talents', cases: 'Caisses', shots: 'Plans', scenes: 'Séquences', locations: 'Lieux', spots: 'Lieux', nodes: 'Équipements', connections: 'Câbles', fixtures: 'Projecteurs', segs: 'Segments', tabs: 'Onglets', versions: 'Versions' };
function vue_(app, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), name = app.toUpperCase(), S = ss.getSheetByName(name) || ss.insertSheet(name);
  var rows = [['SUITE XIII — ' + name + ' (lecture seule, mis à jour le ' + new Date().toLocaleString() + ')']], max = 1;
  Object.keys(data).forEach(function (k) {
    var v; try { v = JSON.parse(data[k]); } catch (x) { return; }
    var lists = []; trouver_(v, '', 0, lists);
    lists.forEach(function (L) {
      var cols = [];
      L.arr.forEach(function (o) { Object.keys(o).forEach(function (c) { var t = typeof o[c]; if ((t === 'string' || t === 'number' || t === 'boolean') && cols.indexOf(c) < 0 && cols.length < 25) cols.push(c); }); });
      if (!cols.length) return;
      rows.push(['']); rows.push([(COLS[L.name] || L.name) + ' (' + L.arr.length + ')']); rows.push(cols);
      L.arr.slice(0, 1500).forEach(function (o) { rows.push(cols.map(function (c) { var x = o[c]; return x == null ? '' : (typeof x === 'string' ? (/^[=+\-@]/.test(x) ? "'" + x : x).slice(0, 500) : x); })); });
      max = Math.max(max, cols.length);
    });
  });
  rows = rows.slice(0, 20000).map(function (r) { while (r.length < max) r.push(''); return r; });
  S.clearContents();
  if (S.getMaxColumns() < max) S.insertColumnsAfter(S.getMaxColumns(), max - S.getMaxColumns());
  S.getRange(1, 1, rows.length, max).setValues(rows);
}
function trouver_(n, name, d, out) {
  if (!n || typeof n !== 'object' || d > 4 || out.length > 30) return;
  if (Array.isArray(n)) {
    var objs = n.filter(function (x) { return x && typeof x === 'object' && !Array.isArray(x); });
    if (objs.length && objs.length === n.length) { out.push({ name: name || 'liste', arr: objs }); objs.forEach(function (o) { Object.keys(o).forEach(function (k) { if (Array.isArray(o[k])) trouver_(o[k], k, d + 1, out); }); }); }
    return;
  }
  Object.keys(n).forEach(function (k) { trouver_(n[k], k, d + 1, out); });
}

// ---------- utilitaires ----------
function feuille_(nom, entete) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), S = ss.getSheetByName(nom);
  if (!S) { S = ss.insertSheet(nom); S.getRange(1, 1, 1, entete.length).setValues([entete]); S.setFrozenRows(1); }
  return S;
}
function nouveauCode_() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 12; i++) { s += a.charAt(Math.floor(Math.random() * a.length)); if (i === 3 || i === 7) s += '-'; } return s; }
function dossierFichiers_() {
  var P = PropertiesService.getScriptProperties(), id = P.getProperty('FILES');
  if (id) { try { return DriveApp.getFolderById(id); } catch (x) { } }
  var par; try { par = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents(); } catch (x) { par = null; }
  var base = par && par.hasNext() ? par.next() : DriveApp.getRootFolder(), d = base.createFolder('SUITE XIII — fichiers'); P.setProperty('FILES', d.getId()); return d;
}
function appCfg_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('APP') || '{}'); } catch (x) { return {}; } }
function repondre_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// =====================================================================
//  ⏰ AUTOMATISATIONS (une seule fois : exécutez « activerAutomatisations » dans l'éditeur et acceptez les autorisations)
//  · envois programmés (lien de la feuille de service à l'équipe la veille, relance de ceux qui ne l'ont pas lue…)
//  · sauvegarde quotidienne du classeur dans le dossier « SUITE XIII — sauvegardes » de votre Drive (14 dernières)
// =====================================================================
function activerAutomatisations() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (/^(envoisProgrammes|sauvegardeQuotidienne)$/.test(t.getHandlerFunction())) ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('envoisProgrammes').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('sauvegardeQuotidienne').timeBased().everyDays(1).atHour(3).create();
  PropertiesService.getScriptProperties().setProperty('AUTO', '1');
  Logger.log('⏰ Automatisations actives : envois programmés (toutes les 15 min) et sauvegarde quotidienne (3 h).');
}
function envoisProgrammes() {
  try { rapportAuto_(); } catch (x) { } // 📨 rapport de fin de journée
  var Q = lire_('auto_queue'); if (!Q) return; var list = []; try { list = JSON.parse(Q.data.queue || '[]'); } catch (x) { return; }
  var now = Date.now(), changed = false, acks = null;
  list.forEach(function (j) {
    if (j.done || j.off || !j.at || j.at > now) return;
    var to = (j.to || []).filter(function (r) { return r && r.email; });
    if (j.onlyUnread && j.k) { // relance : seulement ceux qui n'ont pas encore confirmé la lecture
      if (!acks) { var A = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_ACK); acks = A && A.getLastRow() > 1 ? A.getRange(2, 1, A.getLastRow() - 1, 3).getValues() : []; }
      var read = {}; acks.forEach(function (r) { if (r[1] === j.k) read[String(r[2]).toLowerCase().trim()] = 1; });
      to = to.filter(function (r) { return !read[String(r.name || '').toLowerCase().trim()]; });
    }
    var n = 0;
    to.forEach(function (r) { try { MailApp.sendEmail({ to: r.email, subject: j.subject || 'SUITE XIII', body: String(j.body || '').replace(/\{nom\}/g, r.name || '').replace(/\{lien\}/g, (j.link || '') + (j.perso && r.name ? '&n=' + encodeURIComponent(r.name) : '')), name: j.from || 'Production' }); n++; } catch (x) { } });
    j.done = now; j.sent = n; changed = true;
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(T_LOG).appendRow([new Date(), 'Automatisation', 'auto', '', '⏰ ' + (j.label || j.subject) + ' : ' + n + ' e-mail(s) envoyé(s)']);
  });
  if (changed) ecrire_('auto_queue', Q.rev + 1, Date.now(), 'Automatisation', { queue: JSON.stringify(list) });
}
function sauvegardeQuotidienne() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), f = DriveApp.getFileById(ss.getId()), name = 'SUITE XIII — sauvegardes', it = DriveApp.getFoldersByName(name), dir = it.hasNext() ? it.next() : DriveApp.createFolder(name);
  f.makeCopy(ss.getName() + ' — ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), dir);
  var L = [], fi = dir.getFiles(); while (fi.hasNext()) L.push(fi.next()); L.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); }); L.slice(14).forEach(function (x) { x.setTrashed(true); });
}
