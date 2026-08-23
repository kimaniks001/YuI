import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Clock3, MessageSquare, ShieldCheck, UserRoundSearch } from 'lucide-react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { discoverMasters, getMyMasterProfiles } from '../api/masterEndpoints';
import type { MasterProfile } from '../api/masterTypes';
import {
  acceptConsultation,
  approveConsultationExtension,
  closeConsultation,
  createAgreementConsultation,
  declineConsultation,
  getConsultation,
  getConsultationContext,
  getConsultationOpinion,
  listAgreementConsultations,
  listConsultationExtensionRequests,
  listConsultationMessages,
  postConsultationMessage,
  rejectConsultationExtension,
  requestConsultationExtension,
  revokeConsultation,
  submitConsultationOpinion,
} from '../api/consultationEndpoints';
import type {
  ConsultationExtensionRequestRecord,
  ConsultationMessage,
  ConsultationOpinion,
  MasterConsultation,
  ScopedAgreementContext,
} from '../api/consultationTypes';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderShell from '../components/trader/TraderShell';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { formatMinorMoney } from '../lib/formatMinorMoney';

/** MW-11: real, paid, scoped Master consultation. API owns every authority transition. */
export default function AgreementConsultation() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, session } = useAuth();
  const [consultations, setConsultations] = useState<MasterConsultation[]>([]);
  const [active, setActive] = useState<MasterConsultation | null>(null);
  const [context, setContext] = useState<ScopedAgreementContext | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [opinion, setOpinion] = useState<ConsultationOpinion | null>(null);
  const [extensions, setExtensions] = useState<ConsultationExtensionRequestRecord[]>([]);
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [myMasterProfileIds, setMyMasterProfileIds] = useState<Set<string>>(new Set());
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [briefing, setBriefing] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [message, setMessage] = useState('');
  const [opinionText, setOpinionText] = useState('');
  const [extensionMinutes, setExtensionMinutes] = useState('60');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const consultationId = searchParams.get('consultation');

  const load = useCallback(async () => {
    if (!session?.accessToken || !agreementId) return;
    setLoading(true); setError(null);
    const [listResult, mastersResult, ownMastersResult] = await Promise.all([
      listAgreementConsultations(session.accessToken, agreementId),
      discoverMasters(session.accessToken),
      getMyMasterProfiles(session.accessToken),
    ]);
    if (!listResult.ok || !listResult.data) {
      setError(listResult.error || 'Consultations could not be loaded.'); setLoading(false); return;
    }
    setConsultations(listResult.data);
    if (mastersResult.ok && mastersResult.data) setMasters(mastersResult.data.filter(item => item.status === 'ACTIVE' && item.available));
    if (ownMastersResult.ok && ownMastersResult.data) setMyMasterProfileIds(new Set(ownMastersResult.data.map(item => item.id)));
    else setMyMasterProfileIds(new Set());

    const nextId = consultationId || listResult.data[0]?.id;
    if (!nextId) {
      setActive(null); setContext(null); setMessages([]); setOpinion(null); setExtensions([]); setLoading(false); return;
    }
    const [detail, scoped, chat, submittedOpinion, extensionList] = await Promise.all([
      getConsultation(session.accessToken, nextId),
      getConsultationContext(session.accessToken, nextId),
      listConsultationMessages(session.accessToken, nextId),
      getConsultationOpinion(session.accessToken, nextId),
      listConsultationExtensionRequests(session.accessToken, nextId),
    ]);
    setActive(detail.ok && detail.data ? detail.data : null);
    setContext(scoped.ok && scoped.data ? scoped.data : null);
    setMessages(chat.ok && chat.data ? chat.data : []);
    setOpinion(submittedOpinion.ok && submittedOpinion.data ? submittedOpinion.data : null);
    setExtensions(extensionList.ok && extensionList.data ? extensionList.data : []);
    setLoading(false);
  }, [session?.accessToken, agreementId, consultationId]);

  useEffect(() => { void load(); }, [load]);

  const selectedMaster = useMemo(() => masters.find(item => item.id === selectedMasterId), [masters, selectedMasterId]);
  const isMaster = Boolean(active && myMasterProfileIds.has(active.masterProfileId));
  // /consultations/me is privacy-scoped to exactly inviter or invited Master.
  // If the caller does not own the invited Master profile, the remaining visible role is inviter.
  const isInviter = Boolean(active && !isMaster);

  if (!user || !session) return <Navigate to="/signin" replace />;
  if (!agreementId) return <Navigate to="/agreements" replace />;

  async function create(event: React.FormEvent) {
    event.preventDefault();
    const requestedMinutes = Number(minutes);
    if (!selectedMasterId || !briefing.trim() || !Number.isInteger(requestedMinutes) || requestedMinutes < 1) return;
    setBusy(true); setNotice(null);
    const result = await createAgreementConsultation(session.accessToken, { agreementId, masterProfileId: selectedMasterId, requestedMinutes, briefingNotes: briefing.trim() });
    setBusy(false);
    if (!result.ok || !result.data) { setNotice(result.error || 'The Master could not be invited.'); return; }
    setSearchParams({ consultation: result.data.id }); setSelectedMasterId(''); setBriefing('');
  }

  async function lifecycle(action: 'accept' | 'decline' | 'close' | 'revoke') {
    if (!active) return;
    setBusy(true); setNotice(null);
    const result = action === 'accept' ? await acceptConsultation(session.accessToken, active.id)
      : action === 'decline' ? await declineConsultation(session.accessToken, active.id)
      : action === 'close' ? await closeConsultation(session.accessToken, active.id)
      : await revokeConsultation(session.accessToken, active.id);
    setBusy(false);
    if (!result.ok) setNotice(result.error || 'That action is not available.'); else void load();
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault(); if (!active || !message.trim()) return;
    setBusy(true); const result = await postConsultationMessage(session.accessToken, active.id, { body: message.trim() }); setBusy(false);
    if (!result.ok) setNotice(result.error || 'Message could not be sent.'); else { setMessage(''); void load(); }
  }

  async function submitOpinion(event: React.FormEvent) {
    event.preventDefault(); if (!active || !opinionText.trim()) return;
    setBusy(true); const result = await submitConsultationOpinion(session.accessToken, active.id, { opinionText: opinionText.trim() }); setBusy(false);
    if (!result.ok) setNotice(result.error || 'Opinion could not be submitted.'); else { setOpinionText(''); void load(); }
  }

  async function requestExtension(event: React.FormEvent) {
    event.preventDefault(); if (!active) return;
    const additionalMinutes = Number(extensionMinutes); if (!Number.isInteger(additionalMinutes) || additionalMinutes < 1) return;
    setBusy(true); const result = await requestConsultationExtension(session.accessToken, active.id, { additionalMinutes }); setBusy(false);
    if (!result.ok) setNotice(result.error || 'Extension could not be requested.'); else void load();
  }

  async function decideExtension(requestId: string, approve: boolean) {
    if (!active) return; setBusy(true);
    const result = approve ? await approveConsultationExtension(session.accessToken, active.id, requestId) : await rejectConsultationExtension(session.accessToken, active.id, requestId);
    setBusy(false); if (!result.ok) setNotice(result.error || 'Extension decision could not be recorded.'); else void load();
  }

  return <TraderShell>
    <Link to={`/agreements/${agreementId}`} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Agreement</Link>
    <TraderPageHeader eyebrow="Master consultation" title="Ask for experience. Keep your agreement authority." description="A Master can give a paid, scoped second opinion. The parties still decide. The Master cannot declare Payment Ready, release money or settle the agreement." />
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><Boundary icon={<ShieldCheck size={17} />} title="Advisory only" body="The opinion is immutable advice, not a ruling." /><Boundary icon={<Clock3 size={17} />} title="Rate is snapshotted" body="SecurePayAPI owns the fee, PaymentIntent and access clock." /><Boundary icon={<MessageSquare size={17} />} title="Scoped access" body="The Master sees only what the backend permits." /></div>
    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Consultation could not be loaded" detail={error} onRetry={() => void load()} />}
    {notice && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
    {!loading && !error && <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Ask a Master</p><form onSubmit={create} className="mt-4 space-y-3"><select value={selectedMasterId} onChange={event => setSelectedMasterId(event.target.value)} required className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm"><option value="">Choose an available Master</option>{masters.map(item => <option key={item.id} value={item.id}>{item.category} · {item.ksNumber || 'Master'} · {formatMinorMoney(item.currency, item.rateMinorPerHour)}/hr</option>)}</select>{selectedMaster && <p className="text-xs text-ink/50">Advertised now: {formatMinorMoney(selectedMaster.currency, selectedMaster.rateMinorPerHour)}/hr. The backend stores a consultation-specific snapshot.</p>}<textarea value={briefing} onChange={event => setBriefing(event.target.value)} rows={3} required placeholder="What would you like the Master to consider?" className="w-full rounded-xl border border-ink/15 p-3 text-sm" /><input value={minutes} onChange={event => setMinutes(event.target.value)} type="number" min="1" step="15" className="min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm" aria-label="Requested consultation minutes" /><button disabled={busy} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">Invite Master</button></form></section>
        {consultations.length > 0 && <section className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><p className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-green-700">This agreement</p><div className="mt-3 space-y-2">{consultations.map(item => <button key={item.id} onClick={() => setSearchParams({ consultation: item.id })} className={`w-full rounded-xl border p-3 text-left ${active?.id === item.id ? 'border-green-700/30 bg-green-50' : 'border-ink/8'}`}><strong className="block text-sm">Master consultation</strong><span className="text-xs text-ink/50">{item.status} · {formatMinorMoney(item.currency, item.rateMinorPerHourSnapshot)}/hr</span></button>)}</div></section>}
      </div>
      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        {!active ? <div className="py-10 text-center"><UserRoundSearch className="mx-auto text-ink/25" /><h2 className="mt-3 font-display text-2xl">No consultation yet</h2></div> : <div className="space-y-5">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Scoped consultation</p><h2 className="mt-1 font-display text-2xl">{context?.title || 'Master consultation'}</h2><div className="mt-2 flex flex-wrap gap-3 text-sm text-ink/55"><span>{active.status}</span><span>{formatMinorMoney(active.currency, active.rateMinorPerHourSnapshot)}/hr</span><span>{active.requestedMinutes + active.additionalMinutesGranted} min</span>{active.accessExpiresAt && <span>Access until {new Date(active.accessExpiresAt).toLocaleString()}</span>}</div><p className="mt-3 rounded-xl bg-[#f7f8f4] p-3 text-sm text-ink/65">{active.briefingNotes}</p>{context && <p className="mt-2 text-xs text-ink/45">Shared context: {context.purpose} · agreement status {context.status}. Money, counterparties and full evidence are not exposed here.</p>}<div className="mt-3 flex flex-wrap gap-2">{isMaster && active.status === 'INVITED' && <><button disabled={busy} onClick={() => void lifecycle('accept')} className="min-h-10 rounded-full bg-green-700 px-4 text-sm font-semibold text-white">Accept</button><button disabled={busy} onClick={() => void lifecycle('decline')} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold">Decline</button></>}{isInviter && active.status === 'ACTIVE' && <><button disabled={busy} onClick={() => void lifecycle('close')} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold">Close</button><button disabled={busy} onClick={() => void lifecycle('revoke')} className="min-h-10 rounded-full border border-amber-200 px-4 text-sm font-semibold text-amber-800">Revoke access</button></>}</div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/45">Consultation chat</p><div className="mt-2 max-h-72 space-y-2 overflow-auto rounded-xl border border-ink/8 bg-[#fbfcf9] p-3">{messages.length === 0 ? <p className="text-sm text-ink/45">No messages yet.</p> : messages.map(item => <div key={item.id} className="rounded-xl bg-white p-3 text-sm shadow-sm"><p className="text-ink/70">{item.body}</p><time className="mt-1 block text-[11px] text-ink/35">{new Date(item.createdAt).toLocaleString()}</time></div>)}</div>{active.status === 'ACTIVE' && <form onSubmit={sendMessage} className="mt-2 flex gap-2"><input value={message} onChange={event => setMessage(event.target.value)} className="min-h-11 flex-1 rounded-xl border border-ink/15 px-3 text-sm" placeholder="Write in the consultation" /><button disabled={busy || !message.trim()} className="rounded-full bg-green-700 px-4 text-sm font-semibold text-white">Send</button></form>}</div>
          <div className="rounded-2xl border border-green-700/10 bg-green-50/50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Master Opinion</p>{opinion ? <><p className="mt-2 whitespace-pre-wrap text-sm text-ink/75">{opinion.opinionText}</p><p className="mt-2 text-xs text-ink/45">Submitted {new Date(opinion.submittedAt).toLocaleString()}. Advice only; parties retain authority.</p></> : isMaster && active.status === 'ACTIVE' ? <form onSubmit={submitOpinion} className="mt-3 space-y-2"><textarea value={opinionText} onChange={event => setOpinionText(event.target.value)} rows={5} className="w-full rounded-xl border border-green-700/15 bg-white p-3 text-sm" placeholder="Your reasoned second opinion" /><button disabled={busy || !opinionText.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Submit immutable opinion</button></form> : <p className="mt-2 text-sm text-ink/55">No Master Opinion has been submitted.</p>}</div>
          {active.status === 'ACTIVE' && <div className="rounded-2xl border border-ink/8 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Time extension</p>{isMaster && <form onSubmit={requestExtension} className="mt-3 flex gap-2"><input value={extensionMinutes} onChange={event => setExtensionMinutes(event.target.value)} type="number" min="1" step="15" className="min-h-11 w-28 rounded-xl border border-ink/15 px-3 text-sm" /><button disabled={busy} className="rounded-full border border-green-700/20 px-4 text-sm font-semibold text-green-700">Request minutes</button></form>}<div className="mt-3 space-y-2">{extensions.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f7f8f4] p-3 text-sm"><span>{item.additionalMinutes} min · {item.status}</span>{isInviter && item.status === 'PENDING' && <span className="flex gap-2"><button disabled={busy} onClick={() => void decideExtension(item.id, true)} className="font-semibold text-green-700">Approve</button><button disabled={busy} onClick={() => void decideExtension(item.id, false)} className="font-semibold text-amber-800">Reject</button></span>}</div>)}</div></div>}
        </div>}
      </section>
    </div>}
  </TraderShell>;
}

function Boundary({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-green-700">{icon}<strong className="text-sm">{title}</strong></div><p className="mt-1 text-xs leading-5 text-ink/50">{body}</p></div>;
}
