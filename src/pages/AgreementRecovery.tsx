import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, MessageCircle, Scale, ShieldAlert } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import {
  getAgreementRecovery,
  listRecoveryEvidence,
  listRecoveryMessages,
  openAgreementRecovery,
  postRecoveryMessage,
  recordMasterOpinionDisposition,
  resolveAgreementRecovery,
} from '../api/recoveryEndpoints';
import type { OpinionDisposition, RecoveryEvidence, RecoveryMessage, RecoveryRoom } from '../api/recoveryTypes';

/** MW-12 — structured recovery, never SecurePay adjudication. */
export default function AgreementRecovery() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const { user, session } = useAuth();
  const [room, setRoom] = useState<RecoveryRoom | null>(null);
  const [messages, setMessages] = useState<RecoveryMessage[]>([]);
  const [evidence, setEvidence] = useState<RecoveryEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [message, setMessage] = useState('');
  const [resolution, setResolution] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken || !agreementId) return;
    setLoading(true); setError(null); setMissing(false);
    const roomResult = await getAgreementRecovery(session.accessToken, agreementId);
    if (!roomResult.ok || !roomResult.data) {
      setRoom(null);
      setMissing(true);
      setLoading(false);
      return;
    }
    setRoom(roomResult.data);
    const [messageResult, evidenceResult] = await Promise.all([
      listRecoveryMessages(session.accessToken, agreementId),
      listRecoveryEvidence(session.accessToken, agreementId),
    ]);
    if (messageResult.ok && messageResult.data) setMessages(messageResult.data);
    if (evidenceResult.ok && evidenceResult.data) setEvidence(evidenceResult.data);
    setLoading(false);
  }, [session?.accessToken, agreementId]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/signin" replace />;
  if (!agreementId) return <Navigate to="/agreements" replace />;

  async function handleOpen(event: React.FormEvent) {
    event.preventDefault();
    if (!summary.trim()) return;
    setBusy(true); setNote(null);
    const result = await openAgreementRecovery(session.accessToken, agreementId, { summary: summary.trim() });
    setBusy(false);
    if (!result.ok) { setNote(result.error || 'Recovery could not be opened.'); return; }
    setSummary(''); void load();
  }

  async function handleMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    const result = await postRecoveryMessage(session.accessToken, agreementId, { body: message.trim() });
    setBusy(false);
    if (!result.ok) { setNote(result.error || 'Message could not be sent.'); return; }
    setMessage(''); void load();
  }

  async function handleDisposition(disposition: OpinionDisposition) {
    setBusy(true);
    const result = await recordMasterOpinionDisposition(session.accessToken, agreementId, { disposition });
    setBusy(false);
    if (!result.ok) setNote(result.error || 'Your response could not be recorded.');
    else void load();
  }

  async function handleResolve(event: React.FormEvent) {
    event.preventDefault();
    if (!resolution.trim()) return;
    setBusy(true);
    const result = await resolveAgreementRecovery(session.accessToken, agreementId, { resolutionRecord: resolution.trim() });
    setBusy(false);
    if (!result.ok) { setNote(result.error || 'Resolution could not be recorded.'); return; }
    setResolution(''); void load();
  }

  return <TraderShell>
    <Link to={`/agreements/${agreementId}`} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Agreement</Link>
    <TraderPageHeader eyebrow="Recovery & Resolution" title="When trade gets difficult, bring the facts back together." description="Recovery helps parties understand what happened, what it means, and what they can do next. SecurePay does not decide who is right and a Master Opinion is not a ruling." />

    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Guide icon={<ShieldAlert size={17} />} title="What happened" body="Put the disagreement, evidence and timeline in one place." />
      <Guide icon={<Scale size={17} />} title="What it means" body="See agreement state and informed perspective without turning it into adjudication." />
      <Guide icon={<FileText size={17} />} title="What can we do next" body="Record what the parties choose and preserve the recovery history." />
    </div>

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Recovery could not be loaded" detail={error} onRetry={() => void load()} />}
    {note && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{note}</p>}

    {!loading && missing && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Open Recovery</p>
      <p className="mt-2 text-sm text-ink/55">Describe the problem plainly. If the backend requires the formal dispute fee, it will enforce and record it; YUI does not assume payment or charge authority.</p>
      <form onSubmit={handleOpen} className="mt-4 space-y-3"><textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} required placeholder="What happened?" className="w-full rounded-xl border border-ink/15 p-3 text-sm" /><button disabled={busy || !summary.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">Open Recovery Room</button></form>
    </section>}

    {!loading && room && <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Recovery Room</p><span className="rounded-full bg-[#f4f5f1] px-3 py-1 text-xs font-semibold text-ink/55">{room.status}</span></div>
          {room.summary && <p className="mt-3 text-sm leading-6 text-ink/70">{room.summary}</p>}
          {room.formalDisputeFeeMinor != null && <p className="mt-3 text-xs text-ink/45">Formal dispute fee recorded by backend: {(room.currency || 'KES')} {(room.formalDisputeFeeMinor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}. The fee does not determine the outcome.</p>}
        </section>

        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-green-700"><MessageCircle size={15} /> Recovery conversation</p>
          <div className="mt-3 max-h-80 space-y-2 overflow-auto rounded-xl bg-[#fbfcf9] p-3">{messages.length === 0 ? <p className="text-sm text-ink/45">No messages yet.</p> : messages.map(m => <div key={m.id} className="rounded-xl bg-white p-3 shadow-sm"><strong className="text-xs text-green-700">{m.authorKsNumber || 'Participant'}</strong><p className="mt-1 text-sm text-ink/70">{m.body}</p><time className="mt-1 block text-[11px] text-ink/35">{new Date(m.createdAt).toLocaleString()}</time></div>)}</div>
          <form onSubmit={handleMessage} className="mt-3 flex gap-2"><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Add a recovery message" className="min-h-11 flex-1 rounded-xl border border-ink/15 px-3 text-sm" /><button disabled={busy || !message.trim()} className="rounded-full bg-green-700 px-4 text-sm font-semibold text-white">Send</button></form>
        </section>

        {room.masterOpinion && <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Stalemate Master Opinion</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/75">{room.masterOpinion}</p>
          <p className="mt-3 text-xs text-ink/45">This is informed perspective, not SecurePay or Master adjudication. Each party records what they choose to do with it.</p>
          <div className="mt-3 flex flex-wrap gap-2">{(['ADOPT','PARTIALLY_ADOPT','IGNORE'] as OpinionDisposition[]).map(d => <button key={d} disabled={busy} onClick={() => void handleDisposition(d)} className="min-h-10 rounded-full border border-green-700/20 bg-white px-4 text-sm font-semibold text-green-800">{d === 'PARTIALLY_ADOPT' ? 'Partially Adopt' : d.charAt(0) + d.slice(1).toLowerCase()}</button>)}</div>
        </section>}
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Evidence in this recovery</p>
          {evidence.length === 0 ? <p className="mt-3 text-sm text-ink/45">No recovery evidence is exposed by the backend yet.</p> : <ul className="mt-3 space-y-2">{evidence.map(item => <li key={item.id} className="rounded-xl border border-ink/8 p-3"><strong className="text-sm text-ink">{item.label || 'Evidence'}</strong>{item.note && <p className="mt-1 text-xs text-ink/55">{item.note}</p>}<time className="mt-1 block text-[11px] text-ink/35">{new Date(item.createdAt).toLocaleString()}</time></li>)}</ul>}
        </section>

        {room.canInviteMaster && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">At a stalemate?</p><p className="mt-2 text-sm text-ink/55">A scoped Master consultation can add perspective without transferring authority.</p><Link to={`/agreements/${agreementId}/consultation`} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Ask a Master</Link></section>}

        {room.canResolve && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Resolution record</p><p className="mt-2 text-sm text-ink/55">Record the parties’ resolution. This is a history of what was agreed, not a SecurePay ruling.</p><form onSubmit={handleResolve} className="mt-3 space-y-2"><textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={4} placeholder="What did the parties agree to do next?" className="w-full rounded-xl border border-ink/15 p-3 text-sm" /><button disabled={busy || !resolution.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Record resolution</button></form></section>}
      </div>
    </div>}
  </TraderShell>;
}

function Guide({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-green-700">{icon}<strong className="text-sm">{title}</strong></div><p className="mt-1 text-xs leading-5 text-ink/50">{body}</p></div>;
}
