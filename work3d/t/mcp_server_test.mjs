import { handle } from './mcp.mjs';
const U = 'https://script.google.com/macros/s/AKfycbTESTtestTESTtest123456/exec';
const store = { callsheeto: { rev: 3, ts: Date.now(), by: 'Matthieu', data: { 'callsheetoXIII.project': JSON.stringify({ days: [{ name: 'J1', date: '2026-11-20', schedule: [{ time: '09:00', desc: 'Atelier' }] }] }), 'xiii.notes.callsheeto': '{}' } } };
const calls = [];
globalThis.fetch = async (url, o) => { const p = JSON.parse(o.body); calls.push(p); if (url !== U) throw new Error('url');
  const R = x => ({ text: async () => JSON.stringify(x) });
  if (p.tok !== 'tEDIT' && p.tok !== 'tREAD') return R({ ok: false, err: 'code' });
  if (p.a === 'ping') return R({ ok: true, name: 'Les Ondes', apps: { callsheeto: { rev: store.callsheeto.rev, ts: store.callsheeto.ts, by: 'Matthieu' } }, me: { droit: p.tok === 'tEDIT' ? 'edit' : 'read', nom: 'Assistant' } });
  if (p.a === 'get') { const s = store[p.app]; return R(s ? { ok: true, rev: s.rev, ts: s.ts, by: s.by, data: s.data } : { ok: true, rev: 0 }); }
  if (p.a === 'put') { if (p.tok === 'tREAD') return R({ ok: false, err: 'readonly' }); const s = store[p.app]; if (p.base !== s.rev) return R({ ok: false, err: 'conflict' }); s.rev++; s.data = p.data; s.by = p.by; return R({ ok: true, rev: s.rev }); }
  return R({ ok: false, err: 'a' }); };
const key = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const post = async (k, body) => { const r = await handle(new Request('https://x.supabase.co/functions/v1/xiii-mcp/k/' + k, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })); return [r.status, r.status === 202 ? null : await r.json()]; };
const KE = key({ u: U, t: 'tEDIT', n: 'Claude' }), KR = key({ u: U, t: 'tREAD' });
let [s, j] = await post(KE, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } }); console.log('init', s, j.result.serverInfo, j.result.protocolVersion);
[s] = await post(KE, { jsonrpc: '2.0', method: 'notifications/initialized' }); console.log('notif', s);
[s, j] = await post(KE, { jsonrpc: '2.0', id: 2, method: 'tools/list' }); console.log('tools', j.result.tools.map(t => t.name));
[s, j] = await post(KE, { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'xiii_status', arguments: {} } }); console.log(j.result.content[0].text.split('\n').slice(0, 3).join(' | '));
[s, j] = await post(KE, { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'xiii_read', arguments: { tool: 'callsheeto', path: '/days/0/schedule' } } }); console.log('read', j.result.content[0].text);
[s, j] = await post(KE, { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'xiii_update', arguments: { tool: 'callsheeto', path: '/days/0/schedule', mode: 'append', value: { time: '13:00', desc: 'REPAS' }, summary: 'ajout repas' } } }); console.log('upd', j.result.content[0].text.split('\n')[0], JSON.parse(store.callsheeto.data['callsheetoXIII.project']).days[0].schedule.length, 'notes kept:', 'xiii.notes.callsheeto' in store.callsheeto.data, calls.at(-1).by);
[s, j] = await post(KR, { jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'xiii_update', arguments: { tool: 'callsheeto', path: '/days/0/name', mode: 'set', value: 'X' } } }); console.log('readonly', j.result.isError, j.result.content[0].text);
[s, j] = await post(key({ u: 'https://evil.com/x', t: 'a' }), { jsonrpc: '2.0', id: 7, method: 'tools/list' }); console.log('ssrf', s, j.error.message);
[s, j] = await post(key({ u: U, t: 'bad' }), { jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'xiii_status' } }); console.log('badtok', j.result.content[0].text);
const g = await handle(new Request('https://x.supabase.co/functions/v1/xiii-mcp', { method: 'GET' })); console.log('get', g.status);
