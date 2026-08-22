import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Clock3, MessageSquare, ShieldCheck, UserRoundSearch } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { formatMinorMoney } from '../lib/formatMinorMoney';
import { discoverMasters } from '../api/masterEndpoints';
import type { MasterProfile } from '../api/masterTypes';
import {
  closeConsultation,
  createAgreementConsultation,
  extendConsultation,
  getConsultation,
  listAgreementConsultations,
  listConsultationMessages,
  postConsultationMessage,
  revokeConsultation,
  submitConsultationOpinion,
} from '../api/consultationEndpoints';
import type { ConsultationMessage, MasterConsultation } from '../api/consultationTypes';

/** MW-11 — paid second opinion without transferring agreement authority. */
export default function AgreementConsultation() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, session } = useAuth();
  const [consultations, setConsultations] = useState<MasterConsultation[] | null>(null);
  const [active, setActive] = useState<MasterConsultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState('');
  const [hours, setHours] = useState('1');
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [message, setMessage] = useState('');
  const [opinion, setOpinion] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const consultationId = searchParams.get('consultation');

  const load = useCallback(async () => {
    if (!session?.accessToken || !agreementId) return;
    setLoading(true);
    setError(null);
    const [listResult, mastersResult] = await Promise.all([
      listAgreementConsultations(session.accessToken, agreementId),
      discoverMasters(session.accessToken),
    ]);
    if (!listResult.ok || !listResult.data) {
      setError(listResult.error || 'Consultations could not be loaded.');
      setLoading(false);
      return;
    }
    setConsultations(listResult.data);
    if (mastersResult.ok && mastersResult.data) setMasters(mastersResult.data.filter(m => m.status === 'ACTIVE' && m.available));
    const nextId = consultationId || listResult.data[0]?.id;
    if (nextId) {
      const [detailResult, messageResult] = await Promise.all([
        getConsultation(session.accessToken, agreementId, nextId),
        listConsultationMessages(session.accessToken, agreementId, nextId),
      ]);
      if (detailResult.ok && detailResult.data) setActive(detailResult.data);
      if (messageResult.ok && messageResult.data) setMessages(messageResult.data);
    } else {
      setActive(null);
      setMessages([]);
    }
    setLoading(false);
  }, [session?.accessToken, agreementId, consultationId]);

  useEffect(() => { void load(); }, [load]);

  const selectedMaster = useMemo(() => masters.find(m => m.id === selectedMasterId), [masters, selectedMasterId]);

  if (!user || !session) return <Navigate to="/signin" replace />;
  if (!agreementId) return <Navigate to="/agreements" replace />;

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedMasterId || !scope.trim()) return;
    const requestedHours = Number(hours);
    if (!Number.isFinite(requestedHours) || requestedHours <= 0) return;
    setBusy(true); setNote(null);
    const result = await createAgreementConsultation(session.accessToken, agreementId, {
      masterProfileId: selectedMasterId,
      requestedHours,
      scopeSummary: scope.trim(),
    });
    setBusy(false);
    if (!result.ok || !result.data) {
      setNote(result.error || 'SecurePay could not create the consultation.');
      return;
    }
    setSearchParams({ consultation: result.data.id });
    setScope(''); setSelectedMasterId('');
  }

  async function handleMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!active || !message.trim()) return;
    setBusy(true);
    const result = await postConsultationMessage(session.accessToken, agreementId, active.id, { body: message.trim() });
    setBusy(false);
    if (!result.ok) { setNote(result.error || 'Message could not be sent.'); return; }
    setMessage(''); void load();
  }

  async function handleOpinion(event: React.FormEvent) {
    event.preventDefault();
    if (!active || !opinion.trim()) return;
    setBusy(true);
    const result = await submitConsultationOpinion(session.accessToken, agreementId, active.id, { opinion: opinion.trim() });
    setBusy(false);
    if (!result.ok) { setNote(result.error || 'Opinion could not be submitted.'); return; }
    setOpinion(''); void load();
  }

  async function runAction(action: 'extend' | 'close' | 'revoke') {
    if (!active) return;
    setBusy(true);
    const result = action === 'extend'
      ? await extendConsultation(session.accessToken, agreementId, active.id, { additionalMinutes: 60 })
      : action === 'close'
        ? await closeConsultation(session.accessToken, agreementId, active.id)
        : await revokeConsultation(session.accessToken, agreementId, active.id);
    setBusy(false);
    if (!result.ok) setNote(result.error || 'That action is not available.');
    else void load();
  }

  return <TraderShell>
    <Link to={`/agreements/${agreementId}`} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Agreement</Link>
    <TraderPageHeader eyebrow="Master consultation" title="Ask for experience. Keep your agreement authority." description="A Master can give a paid, scoped second opinion. The parties still decide. The Master cannot release money, accept terms, declare Payment Ready or settle the agreement." />

    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Boundary icon={<ShieldCheck size={17} />} title="Advisory only" body="A Master gives perspective, not a ruling." />
      <Boundary icon={<Clock3 size={17} />} title="Rate is snapshotted" body="The backend owns the agreed rate and consultation timer." />
      <Boundary icon={<MessageSquare size={17} />} title="Scoped room" body="Only consultation-authorised chat and evidence should be visible." />
    </div>

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Consultation is not available yet" detail={error} onRetry={() => void load()} />}
    {note && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{note}</p>}

    {!loading && !error && <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Ask a Master</p>
          <p className="mt-1 text-sm text-ink/55">The inviter is the consultation fee bearer. SecurePayAPI must confirm the fee and authority before anything is charged.</p>
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <select value={selectedMasterId} onChange={e => setSelectedMasterId(e.target.value)} required className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm">
              <option value="">Choose an available Master</option>
              {masters.map(m => <option key={m.id} value={m.id}>{m.category} · {m.ksNumber} · {formatMinorMoney(m.currency, m.rateMinorPerHour)}/hr</option>)}
            </select>
            {selectedMaster && <p className="text-xs text-ink/50">Current advertised rate: {formatMinorMoney(selectedMaster.currency, selectedMaster.rateMinorPerHour)}/hour. The backend must snapshot the consultation rate.</p>}
            <textarea value={scope} onChange={e => setScope(e.target.value)} required rows={3} placeholder="What would you like the Master to look at?" className="w-full rounded-xl border border-ink/15 p-3 text-sm" />
            <label className="block text-xs font-semibold text-ink/55">Requested hours
              <input value={hours} onChange={e => setHours(e.target.value)} type="number" min="0.5" step="0.5" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm" />
            </label>
            <button disabled={busy || !selectedMasterId || !scope.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">Invite Master</button>
          </form>
        </section>

        {consultations && consultations.length > 0 && <section className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm">
          <p className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-green-700">Consultations on this agreement</p>
          <div className="mt-3 space-y-2">{consultations.map(c => <button key={c.id} type="button" onClick={() => setSearchParams({ consultation: c.id })} className={`w-full rounded-xl border p-3 text-left text-sm ${active?.id === c.id ? 'border-green-700/30 bg-green-50' : 'border-ink/8 bg-white'}`}>
            <strong className="block text-ink">{c.category || c.masterKsNumber || 'Master consultation'}</strong>
            <span className="text-xs text-ink/50">{c.status} · {formatMinorMoney(c.currency, c.rateMinorPerHour)}/hr</span>
          </button>)}</div>
        </section>}
      </div>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        {!active ? <div className="py-10 text-center"><UserRoundSearch className="mx-auto text-ink/25" /><h2 className="mt-3 font-display text-2xl">No consultation open</h2><p className="mx-auto mt-2 max-w-md text-sm text-ink/55">Invite an available Master when you need a second opinion on this agreement.</p></div> : <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Scoped consultation</p>
            <h2 className="mt-1 font-display text-2xl">{active.category || active.masterKsNumber || 'Master opinion'}</h2>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink/55"><span>{active.status}</span><span>{formatMinorMoney(active.currency, active.rateMinorPerHour)}/hr</span>{active.expiresAt && <span>Until {new Date(active.expiresAt).toLocaleString()}</span>}</div>
            {active.scopeSummary && <p className="mt-3 rounded-xl bg-[#f7f8f4] p-3 text-sm text-ink/65">{active.scopeSummary}</p>}
            <div className="mt-3 flex flex-wrap gap-2">{active.canExtend && <button disabled={busy} onClick={() => void runAction('extend')} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold">Extend 1 hour</button>}{active.canRevoke && <button disabled={busy} onClick={() => void runAction('revoke')} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold">Revoke access</button>}<button disabled={busy} onClick={() => void runAction('close')} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold">Close consultation</button></div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Joint consultation chat</p>
            <div className="mt-2 max-h-72 space-y-2 overflow-auto rounded-xl border border-ink/8 bg-[#fbfcf9] p-3">{messages.length === 0 ? <p className="text-sm text-ink/45">No consultation messages yet.</p> : messages.map(m => <div key={m.id} className="rounded-xl bg-white p-3 text-sm shadow-sm"><strong className="text-xs text-green-700">{m.authorKsNumber || 'Participant'}</strong><p className="mt-1 text-ink/70">{m.body}</p><time className="mt-1 block text-[11px] text-ink/35">{new Date(m.createdAt).toLocaleString()}</time></div>)}</div>
            {active.canMessage !== false && <form onSubmit={handleMessage} className="mt-2 flex gap-2"><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Write in the scoped consultation room" className="min-h-11 flex-1 rounded-xl border border-ink/15 px-3 text-sm" /><button disabled={busy || !message.trim()} className="rounded-full bg-green-700 px-4 text-sm font-semibold text-white">Send</button></form>}
          </div>

          <div className="rounded-2xl border border-green-700/10 bg-green-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Master Opinion</p>
            {active.opinion ? <><p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">{active.opinion}</p><p className="mt-2 text-xs text-ink/45">Submitted opinion is displayed as immutable advice. Parties retain authority.</p></> : active.canSubmitOpinion ? <form onSubmit={handleOpinion} className="mt-3 space-y-2"><textarea value={opinion} onChange={e => setOpinion(e.target.value)} rows={5} placeholder="Your reasoned second opinion" className="w-full rounded-xl border border-green-700/15 bg-white p-3 text-sm" /><button disabled={busy || !opinion.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Submit immutable opinion</button></form> : <p className="mt-2 text-sm text-ink/55">No Master Opinion has been submitted.</p>}
          </div>
        </div>}
      </section>
    </div>}
  </TraderShell>;
}

function Boundary({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-green-700">{icon}<strong className="text-sm">{title}</strong></div><p className="mt-1 text-xs leading-5 text-ink/50">{body}</p></div>;
}
