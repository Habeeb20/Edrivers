import { useCallback, useEffect, useState } from 'react';
import { api, qs } from './PaymentApi';

const naira = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 });
const date = (d) => (d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const name = (u) => (u ? `${u.firstName} ${u.lastName}` : '—');
const TONE = { ended: 'green', paid: 'green', success: 'green', processed: 'green', resolved: 'green', active: 'blue', accepted: 'blue', processing: 'blue', reviewing: 'blue',
  pending: 'amber', pending_approval: 'amber', awaiting_admin_approval: 'amber', unpaid: 'slate', cancelled: 'red', declined: 'red', rejected: 'red', failed: 'red', dismissed: 'slate', none: 'slate' };
const COLORS = { green: 'bg-emerald-100 text-emerald-800', blue: 'bg-sky-100 text-sky-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-rose-100 text-rose-800', slate: 'bg-slate-100 text-slate-600' };
const Badge = ({ v }) => <span className={`rounded px-2 py-0.5 text-xs font-medium ${COLORS[TONE[v] || 'slate']}`}>{String(v ?? '—').replace(/_/g, ' ')}</span>;
const Btn = ({ kind = 'solid', ...p }) => <button {...p} className={`rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-50 ${kind === 'solid' ? 'bg-teal-800 text-white hover:bg-teal-900' : kind === 'danger' ? 'bg-rose-700 text-white hover:bg-rose-800' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'} ${p.className || ''}`} />;
const Input = (p) => <input {...p} className={`w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 ${p.className || ''}`} />;
const Select = ({ options, ...p }) => <select {...p} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">{options.map((o) => <option key={o} value={o}>{o || 'All'}</option>)}</select>;

function useData(path, deps = []) {
  const [s, set] = useState({ data: null, total: 0, loading: true, error: '' });
  const load = useCallback(() => {
    set((x) => ({ ...x, loading: true, error: '' }));
    api.get(path).then((j) => set({ data: j.data, total: j.total, loading: false, error: '' })).catch((e) => set({ data: null, loading: false, error: e.message }));
  }, [path]); // eslint-disable-line
  useEffect(load, [load, ...deps]);
  return { ...s, reload: load };
}
const State = ({ s, empty }) => s.loading ? <p className="p-6 text-sm text-slate-500">Loading…</p> : s.error ? <p className="p-6 text-sm text-rose-700">{s.error}. Check your connection and try again.</p> : !s.data?.length && empty ? <p className="p-6 text-sm text-slate-500">{empty}</p> : null;
const Table = ({ head, children }) => <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-slate-600"><tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 tabular-nums">{children}</tbody></table></div>;

/* ---------------- Overview ---------------- */
function Overview({ go }) {
  const s = useData('/overview'); const d = s.data;
  if (!d) return <State s={s} />;
  const tiles = [['Collected from clients', d.collected.total, `${naira(d.collected.hire)} hires + ${naira(d.collected.callOut)} call-out`], ['Owed to drivers', d.owedToDrivers, 'Ready to pay out', 'payouts'],
    ['Paid to drivers', d.paidToDrivers, 'Confirmed transfers'], ['Platform earnings', d.platformEarnedFromPaidOut, 'From completed payouts'], ['Refunded', d.refunded, 'Processed + pending'], ['Open reports', d.openReports, 'Hold driver payouts', 'reports', true]];
  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{tiles.map(([l, v, sub, to, plain]) => <button key={l} onClick={() => to && go(to)} className="rounded-lg border border-slate-200 bg-white p-4 text-left">
      <p className="text-sm text-slate-500">{l}</p><p className="mt-1 text-2xl font-semibold tabular-nums text-teal-900">{plain ? v : naira(v)}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></button>)}</div>
    <div className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="mb-3 font-medium">Hires by status</h3>
      <div className="flex flex-wrap gap-2">{Object.entries(d.hiresByStatus).map(([k, v]) => <button key={k} onClick={() => go('hires', { status: k })} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"><Badge v={k} /> <b>{v}</b></button>)}</div></div></div>;
}

/* ---------------- Hires ---------------- */
const HIRE_STATUS = ['', 'pending', 'pending_approval', 'awaiting_admin_approval', 'accepted', 'active', 'ended', 'declined', 'cancelled', 'rejected'];
function Hires({ preset = {} }) {
  const [f, setF] = useState({ status: '', paymentStatus: '', payoutStatus: '', q: '', page: 1, ...preset });
  const s = useData('/hires?' + qs(f)); const [open, setOpen] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value, page: 1 });
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2"><Input className="max-w-xs" placeholder="Hire or payment reference" value={f.q} onChange={set('q')} />
      <Select value={f.status} onChange={set('status')} options={HIRE_STATUS} /><Select value={f.paymentStatus} onChange={set('paymentStatus')} options={['', 'pending', 'success', 'paid', 'failed']} />
      <Select value={f.payoutStatus} onChange={set('payoutStatus')} options={['', 'unpaid', 'processing', 'paid']} /></div>
    <State s={s} empty="No hires match these filters." />
    {s.data?.length > 0 && <Table head={['Client', 'Driver', 'Hours', 'Hire', 'Call-out', 'Total', 'Status', 'Payment', 'Driver payout', 'Reports', 'Rating', '']}>
      {s.data.map((h) => <tr key={h._id}><td className="px-3 py-2">{name(h.client)}</td><td className="px-3 py-2">{name(h.driver)}</td><td className="px-3 py-2">{h.durationHours}h</td><td className="px-3 py-2">{naira(h.amount)}</td>
        <td className="px-3 py-2">{naira(h.callOutCharge)}</td><td className="px-3 py-2 font-medium">{naira(h.totalPaid)}</td><td className="px-3 py-2"><Badge v={h.status} /></td><td className="px-3 py-2"><Badge v={h.paymentStatus} /></td>
        <td className="px-3 py-2"><Badge v={h.payout?.status || 'unpaid'} /></td><td className="px-3 py-2">{h.reportCount || '—'}</td><td className="px-3 py-2">{h.reviewRating ?? '—'}</td>
        <td className="px-3 py-2"><Btn kind="ghost" onClick={() => setOpen(h._id)}>Open</Btn></td></tr>)}</Table>}
    <div className="flex items-center gap-3 text-sm text-slate-600"><Btn kind="ghost" disabled={f.page < 2} onClick={() => setF({ ...f, page: f.page - 1 })}>Previous</Btn>Page {f.page} · {s.total || 0} hires
      <Btn kind="ghost" disabled={f.page * 20 >= (s.total || 0)} onClick={() => setF({ ...f, page: f.page + 1 })}>Next</Btn></div>
    {open && <HireDrawer id={open} onClose={() => { setOpen(null); s.reload(); }} />}</div>;
}

function HireDrawer({ id, onClose }) {
  const s = useData('/hires/' + id); const d = s.data; const [msg, setMsg] = useState(''); const [f, setF] = useState({ amount: '', reason: '', subject: '', body: '' });
  const run = (fn, ok) => async () => { setMsg(''); try { await fn(); setMsg(ok); s.reload(); } catch (e) { setMsg(e.message); } };
  const h = d?.hire;
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}><aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-5" onClick={(e) => e.stopPropagation()}>
    <div className="mb-4 flex justify-between"><h2 className="text-lg font-semibold">Hire details</h2><Btn kind="ghost" onClick={onClose}>Close</Btn></div>
    <State s={s} />{h && <div className="space-y-5 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">{[['Client', `${name(h.client)} · ${h.client?.phone || h.client?.email}`], ['Driver', `${name(h.driver)} · ${h.driver?.phone || ''}`], ['Category', h.category], ['Duration', h.durationHours + ' hours'],
        ['Date', `${date(h.date)} ${h.time || ''}`], ['Address', h.address], ['Vehicle', h.vehicleType === 'other' ? h.vehicleTypeOther : h.vehicleType], ['Passengers', h.passengerInfo?.numberOfPassengers],
        ['Hire amount', naira(h.amount)], ['Call-out charge', naira(h.callOutCharge)], ['Payment ref', h.paymentReference || '—'], ['Requested', date(h.requestedAt)]].map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="break-words">{v || '—'}</dd></div>)}</dl>
      <div className="flex gap-2"><Badge v={h.status} /><Badge v={h.paymentStatus} /><Badge v={'payout ' + (h.payout?.status || 'unpaid')} /><Badge v={'refund ' + (h.refund?.status || 'none')} /></div>
      {h.cancelReason && <p className="rounded bg-rose-50 p-2">Cancelled by {h.cancelledByRole}: {h.cancelReason}</p>}
      <section><h3 className="font-medium">Review</h3>{d.review ? <p>{d.review.rating}/5 — {d.review.comment || 'No comment'}</p> : <p className="text-slate-500">No review yet.</p>}</section>
      <section><h3 className="font-medium">Reports</h3>{d.reports.length ? d.reports.map((r) => <p key={r._id} className="mt-1 rounded bg-slate-50 p-2"><Badge v={r.status} /> {r.reason.replace(/_/g, ' ')} — {r.details}</p>) : <p className="text-slate-500">No reports.</p>}</section>
      {['cancelled', 'declined', 'rejected'].includes(h.status) && ['success', 'paid'].includes(h.paymentStatus) && (h.refund?.status || 'none') === 'none' && <section className="space-y-2 rounded border p-3"><h3 className="font-medium">Refund client</h3>
        <Input type="number" placeholder={`Amount (blank = full ${naira(h.amount + h.callOutCharge)})`} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <Input placeholder="Reason" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
        <Btn kind="danger" onClick={run(() => { if (!confirm('Send this refund through Paystack? This cannot be undone.')) throw new Error('Refund not sent'); return api.post(`/hires/${id}/refund`, { amount: f.amount ? +f.amount : undefined, reason: f.reason }); }, 'Refund sent')}>Send refund</Btn></section>}
      <section className="space-y-2 rounded border p-3"><h3 className="font-medium">Message client</h3><Input placeholder="Subject" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
        <textarea className="h-24 w-full rounded-md border border-slate-300 p-2" placeholder="Message" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <Btn onClick={run(() => api.post('/messages', { to: h.client._id, hire: id, subject: f.subject, body: f.body }), 'Message sent')}>Send message</Btn></section>
      {msg && <p role="status" className="font-medium text-teal-800">{msg}</p>}</div>}</aside></div>;
}

/* ---------------- Payouts ---------------- */
function Payouts() {
  const pend = useData('/payouts/pending'); const hist = useData('/payouts'); const [msg, setMsg] = useState('');
  const act = async (fn, ok) => { setMsg(''); try { const r = await fn(); setMsg(typeof ok === 'function' ? ok(r) : ok); pend.reload(); hist.reload(); } catch (e) { setMsg(e.message); } };
  const total = (pend.data || []).reduce((a, d) => a + d.driverAmount, 0);
  return <div className="space-y-6">{msg && <p role="status" className="rounded bg-teal-50 p-2 text-sm text-teal-900">{msg}</p>}
    <section className="space-y-2"><div className="flex items-center justify-between"><h3 className="font-medium">Ready to pay · {naira(total)}</h3>
      <Btn disabled={!pend.data?.length} onClick={() => confirm(`Pay ${pend.data.length} drivers ${naira(total)} from your Paystack balance?`) && act(() => api.post('/payouts/run'), (r) => `Started ${r.data.length} payouts`)}>Pay all drivers</Btn></div>
      <State s={pend} empty="Nothing owed. Paid hires appear here once they end and have no open report." />
      {pend.data?.length > 0 && <Table head={['Driver', 'Account', 'Hires', 'Driver gets', 'Platform keeps', '']}>{pend.data.map((d) => <tr key={d.driver._id}><td className="px-3 py-2">{name(d.driver)}</td>
        <td className="px-3 py-2">{d.driver.wallet?.accountNumber ? `${d.driver.wallet.bankName} ${d.driver.wallet.accountNumber}` : <span className="text-rose-700">No wallet account</span>}</td><td className="px-3 py-2">{d.hires}</td>
        <td className="px-3 py-2 font-medium">{naira(d.driverAmount)}</td><td className="px-3 py-2">{naira(d.platformCut)}</td>
        <td className="px-3 py-2"><Btn kind="ghost" disabled={!d.driver.wallet?.accountNumber} onClick={() => act(() => api.post(`/payouts/driver/${d.driver._id}`), 'Payout started')}>Pay driver</Btn></td></tr>)}</Table>}</section>
    <section className="space-y-2"><h3 className="font-medium">Payout history</h3><State s={hist} empty="No payouts yet." />
      {hist.data?.length > 0 && <Table head={['Date', 'Driver', 'Hires', 'Amount', 'Split used', 'Status', 'Note']}>{hist.data.map((p) => <tr key={p._id}><td className="px-3 py-2">{date(p.createdAt)}</td><td className="px-3 py-2">{name(p.driver)}</td>
        <td className="px-3 py-2">{p.items?.length}</td><td className="px-3 py-2 font-medium">{naira(p.totalAmount)}</td><td className="px-3 py-2">{p.items?.[0] ? `${p.items[0].hirePercent}% / ${p.items[0].callOutPercent}%` : '—'}</td>
        <td className="px-3 py-2"><Badge v={p.status} /></td><td className="px-3 py-2 text-rose-700">{p.paystack?.failureReason}</td></tr>)}</Table>}</section></div>;
}

/* ---------------- Refunds & Reports ---------------- */
function Refunds() {
  const s = useData('/refunds');
  return <><State s={s} empty="No refunds yet. Refund cancelled hires from the hire details panel." />{s.data?.length > 0 && <Table head={['Date', 'Client', 'Hire', 'Amount', 'Reason', 'Status']}>{s.data.map((r) => <tr key={r._id}><td className="px-3 py-2">{date(r.createdAt)}</td>
    <td className="px-3 py-2">{name(r.client)}</td><td className="px-3 py-2">{r.hire?.hireReference || r.hire?._id}</td><td className="px-3 py-2 font-medium">{naira(r.amount)}</td><td className="px-3 py-2">{r.reason}</td><td className="px-3 py-2"><Badge v={r.status} /></td></tr>)}</Table>}</>;
}
function Reports() {
  const [status, setStatus] = useState('pending'); const s = useData('/reports?' + qs({ status })); const [note, setNote] = useState({}); const [err, setErr] = useState('');
  const upd = async (id, st) => { setErr(''); try { await api.patch('/reports/' + id, { status: st, adminNotes: note[id] }); s.reload(); } catch (e) { setErr(e.message); } };
  return <div className="space-y-3"><Select value={status} onChange={(e) => setStatus(e.target.value)} options={['', 'pending', 'reviewing', 'resolved', 'dismissed']} />
    <p className="text-sm text-slate-500">Pending and reviewing reports hold the driver's payout for that hire until you resolve or dismiss them.</p>{err && <p className="text-sm text-rose-700">{err}</p>}
    <State s={s} empty="No reports in this status." />
    {s.data?.map((r) => <article key={r._id} className="space-y-2 rounded-lg border bg-white p-4 text-sm"><div className="flex flex-wrap items-center gap-2"><Badge v={r.status} /><b>{r.reason.replace(/_/g, ' ')}</b>
      <span className="text-slate-500">{name(r.reporter)} reported {name(r.reportedUser)} · {date(r.createdAt)}</span></div><p>{r.details}</p>
      <Input placeholder="Admin notes" defaultValue={r.adminNotes} onChange={(e) => setNote({ ...note, [r._id]: e.target.value })} />
      <div className="flex gap-2"><Btn kind="ghost" onClick={() => upd(r._id, 'reviewing')}>Mark reviewing</Btn><Btn onClick={() => upd(r._id, 'resolved')}>Resolve</Btn><Btn kind="ghost" onClick={() => upd(r._id, 'dismissed')}>Dismiss</Btn></div></article>)}</div>;
}

/* ---------------- Settings ---------------- */
function Settings() {
  const s = useData('/settings'); const [f, setF] = useState(null); const [msg, setMsg] = useState('');
  useEffect(() => { if (s.data) setF(s.data); }, [s.data]);
  if (!f) return <State s={s} />;
  const num = (k) => (e) => setF({ ...f, [k]: +e.target.value });
  const save = async () => { setMsg(''); try { await api.put('/settings', f); setMsg('Settings saved. They apply to payouts from now on.'); } catch (e) { setMsg(e.message); } };
  const L = ({ t, children }) => <label className="block space-y-1 text-sm"><span className="text-slate-600">{t}</span>{children}</label>;
  return <div className="max-w-xl space-y-4 rounded-lg border bg-white p-5">
    <L t="Driver's share of the hire amount (%)"><Input type="number" min="0" max="100" value={f.driverHirePercent} onChange={num('driverHirePercent')} /></L>
    <L t="Driver's share of the call-out charge (%)"><Input type="number" min="0" max="100" value={f.driverCallOutPercent} onChange={num('driverCallOutPercent')} /></L>
    <L t="Payout schedule"><Select value={f.payoutSchedule} onChange={(e) => setF({ ...f, payoutSchedule: e.target.value })} options={['daily', 'weekly', 'monthly', 'manual']} /></L>
    {f.payoutSchedule === 'weekly' && <L t="Pay on (0 = Sunday … 6 = Saturday)"><Input type="number" min="0" max="6" value={f.payoutWeekday} onChange={num('payoutWeekday')} /></L>}
    {f.payoutSchedule === 'monthly' && <L t="Pay on day of month (1–28)"><Input type="number" min="1" max="28" value={f.payoutMonthDay} onChange={num('payoutMonthDay')} /></L>}
    <L t="Minimum payout (₦)"><Input type="number" min="0" value={f.minPayoutAmount} onChange={num('minPayoutAmount')} /></L>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.autoPayout} onChange={(e) => setF({ ...f, autoPayout: e.target.checked })} /> Pay drivers automatically on schedule</label>
    <p className="rounded bg-slate-50 p-2 text-sm text-slate-600">On a ₦10,000 hire with a ₦5,000 call-out: driver gets {naira(10000 * f.driverHirePercent / 100 + 5000 * f.driverCallOutPercent / 100)}.</p>
    <div className="flex items-center gap-3"><Btn onClick={save}>Save settings</Btn>{msg && <span role="status" className="text-sm text-teal-800">{msg}</span>}</div></div>;
}

/* ---------------- Shell (top tab buttons, no sidebar) ---------------- */
const TABS = [['overview', 'Overview'], ['hires', 'Hires'], ['payouts', 'Payouts'], ['refunds', 'Refunds'], ['reports', 'Reports'], ['settings', 'Settings']];
export default function AdminPayments() {
  const [tab, setTab] = useState('overview'); const [preset, setPreset] = useState({});
  const go = (t, p = {}) => { setPreset(p); setTab(t); };
  return <div className="space-y-5 text-slate-900">
    <nav aria-label="Payment sections" className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map(([k, l]) => <button key={k} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${tab === k ? 'bg-teal-800 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{l}</button>)}</nav>
    <section className="space-y-4">
      {tab === 'overview' && <Overview go={go} />}{tab === 'hires' && <Hires key={JSON.stringify(preset)} preset={preset} />}{tab === 'payouts' && <Payouts />}
      {tab === 'refunds' && <Refunds />}{tab === 'reports' && <Reports />}{tab === 'settings' && <Settings />}</section></div>;
}