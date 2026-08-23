import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Scale, ShieldAlert } from 'lucide-react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { discoverMasters } from '../api/masterEndpoints';
import type { MasterProfile } from '../api/masterTypes';
import {
  closeRecoveryCase,
  getRecoveryRoom,
  inviteRecoveryMaster,
  openRecoveryCase,
  recordRecoveryDisposition,
} from '../api/recoveryEndpoints';
import type { OpinionDisposition, RecoveryRoom } from '../api/recoveryTypes';
import {
  getAgreementReviewCase,
  listAgreementReviewCases,
  listAgreementReviewEvidence,
} from '../api/securepayEndpoints';
import type {
  SecurePayAgreementReviewCaseDetail,
  SecurePayAgreementReviewCaseSummary,
  SecurePayAgreementReviewEvidenceItem,
} from '../api/securepayTypes';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderShell from '../components/trader/TraderShell';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { formatMinorMoney } from '../lib/formatMinorMoney';

/** MW-12 — Recovery is an overlay on Agreement Review, never a parallel dispute engine. */
export default function AgreementRecovery() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, session } = useAuth();
  const [reviewCases, setReviewCases] = useState<SecurePayAgreementReviewCaseSummary[]>([]);
  const [review, setReview] = useState<SecurePayAgreementReviewCaseDetail | null>(null);
  const [evidence, setEvidence] = useState<SecurePayAgreementReviewEvidenceItem[]>([]);
  const [room, setRoom] = useState<RecoveryRoom | null>(null);
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState('');
  const [briefing, setBriefing] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [dispositionNote, setDispositionNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const requestedReviewId = searchParams.get('reviewCase');
  const recoveryCaseId = searchParams.get('recoveryCase');

  const load = useCallback(async () => {
    if (!session?.accessToken || !agreementId) return;
    setLoading(true); setError(null);
    const [reviewsResult, mastersResult] = await Promise.all([
      listAgreementReviewCases(agreementId, session.accessToken),
      discoverMasters(session.accessToken),
    ]);
    if (!reviewsResult.ok || !reviewsResult.data) {
      setError(reviewsResult.error || 'Agreement Review could not be loaded.'); setLoading(false); return;
    }
    const cases = reviewsResult.data.items;
    setReviewCases(cases);
    if (mastersResult.ok && mastersResult.data) setMasters(mastersResult.data.filter(m => m.status === 'ACTIVE' && m.available));
    const chosen = cases.find(item => item.reviewCaseId === requestedReviewId) || cases[0];
    if (chosen) {
      const [detailResult, evidenceResult] = await Promise.all([
        getAgreementReviewCase(chosen.reviewCaseId, agreementId, session.accessToken),
        listAgreementReviewEvidence(chosen.reviewCaseId, agreementId, session.accessToken),
      ]);
      if (detailResult.ok && detailResult.data) setReview(detailResult.data); else setReview(null);
      if (evidenceResult.ok && evidenceResult.data) setEvidence(evidenceResult.data.items); else setEvidence([]);
    } else {
      setReview(null); setEvidence([]);
    }
    if (recoveryCaseId) {
      const roomResult = await getRecoveryRoom(session.accessToken, recoveryCaseId);
      if (roomResult.ok && roomResult.data) setRoom(roomResult.data);
      else { setRoom(null); setNote(roomResult.error || 'That Recovery Room is not available to this participant.'); }
    } else setRoom(null);
    setLoading(false);
  }, [session?.accessToken, agreementId, requestedReviewId, recoveryCaseId]);

  useEffect(() => { void load(); }, [load]);

  const selectedReview = useMemo(() => reviewCases.find(item => item.reviewCaseId === review?.reviewCaseId), [reviewCases, review]);

  if (!user || !session) return <Navigate to="/signin" replace />;
  if (!agreementId) return <Navigate to="/agreements" replace />;

  async function openFormalRecovery() {
    if (!review) return;
    setBusy(true); setNote(null);
    const result = await openRecoveryCase(session.accessToken, { reviewCaseId: review.reviewCaseId, agreementId });
    setBusy(false);
    if (!result.ok || !result.data) { setNote(result.error || 'Formal Recovery could not be opened.'); return; }
    const next = new URLSearchParams(searchParams); next.set('reviewCase', review.reviewCaseId); next.set('recoveryCase', result.data.id); setSearchParams(next);
  }

  async function inviteMaster(event: React.FormEvent) {
    event.preventDefault(); if (!room || !selectedMasterId || !briefing.trim()) return;
    const requestedMinutes = Number(minutes); if (!Number.isInteger(requestedMinutes) || requestedMinutes < 1) return;
    setBusy(true); setNote(null);
    const result = await inviteRecoveryMaster(session.accessToken, room.recoveryCase.id, { masterProfileId: selectedMasterId, requestedMinutes, briefingNotes: briefing.trim() });
    setBusy(false);
    if (!result.ok) setNote(result.error || 'The Master could not be invited.'); else { setBriefing(''); setSelectedMasterId(''); void load(); }
  }

  async function disposition(value: OpinionDisposition) {
    if (!room) return; setBusy(true); setNote(null);
    const result = await recordRecoveryDisposition(session.accessToken, room.recoveryCase.id, { disposition: value, note: dispositionNote.trim() || undefined });
    setBusy(false);
    if (!result.ok) setNote(result.error || 'Your response to the Master Opinion could not be recorded.'); else { setDispositionNote(''); void load(); }
  }

  async function closeRoom() {
    if (!room) return; setBusy(true); setNote(null);
    const result = await closeRecoveryCase(session.accessToken, room.recoveryCase.id); setBusy(false);
    if (!result.ok) setNote(result.error || 'Recovery could not be closed.'); else void load();
  }

  return <TraderShell>
    <Link to={`/agreements/${agreementId}`} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Agreement</Link>
    <TraderPageHeader eyebrow="Recovery & Resolution" title="Bring the facts back together before deciding what happens next." description="Agreement Review remains the dispute and evidence record. Formal Recovery adds a KES 100 opener-paid process, optional Master perspective and each party’s own response. SecurePay does not decide who is right." />
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Guide icon={<ShieldAlert size={17} />} title="What happened" body="Agreement Review remains the authoritative case, timeline and evidence record." />
      <Guide icon={<Scale size={17} />} title="What it means" body="A Master may advise at stalemate, but the opinion is never a ruling." />
      <Guide icon={<FileText size={17} />} title="What next" body="Each party records Adopt, Partially Adopt or Ignore for themselves." />
    </div>
    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Recovery could not be loaded" detail={error} onRetry={() => void load()} />}
    {note && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{note}</p>}
    {!loading && !error && <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Agreement Review</p>
          {reviewCases.length === 0 ? <><p className="mt-3 text-sm leading-6 text-ink/55">No participant-visible Agreement Review case exists for this agreement. Formal Recovery cannot be invented by YUI; begin from the agreement’s real review/dispute action when that action is available.</p><Link to={`/agreements/${agreementId}`} className="mt-4 inline-flex min-h-11 items-center rounded-full border border-green-700/20 px-4 text-sm font-semibold text-green-700">Back to agreement</Link></> : <><select value={review?.reviewCaseId || ''} onChange={e => { const next = new URLSearchParams(searchParams); next.set('reviewCase', e.target.value); next.delete('recoveryCase'); setSearchParams(next); }} className="mt-3 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm">{reviewCases.map(item => <option key={item.reviewCaseId} value={item.reviewCaseId}>{item.state} · {new Date(item.openedAt).toLocaleDateString()}</option>)}</select>{review && <div className="mt-4 space-y-2 text-sm text-ink/60"><p><strong className="text-ink">State:</strong> {review.state}</p><p><strong className="text-ink">Your role:</strong> {review.callerRole}</p>{review.responseDeadlineAt && <p><strong className="text-ink">Response by:</strong> {new Date(review.responseDeadlineAt).toLocaleString()}</p>}<p className="text-xs text-ink/45">The review case remains the authoritative dispute record. Recovery does not replace or resolve it.</p></div>}</>}
        </section>
        {review && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Review evidence</p>{evidence.length === 0 ? <p className="mt-3 text-sm text-ink/45">No participant-visible evidence is attached to this review yet.</p> : <ul className="mt-3 space-y-2">{evidence.map(item => <li key={item.evidenceId} className="rounded-xl border border-ink/8 p-3"><strong className="text-sm text-ink">{item.evidenceType}</strong><p className="mt-1 text-xs text-ink/55">{item.originalFilename} · {item.submittedByCaller ? 'submitted by you' : 'submitted by another participant'}</p><time className="mt-1 block text-[11px] text-ink/35">{new Date(item.submittedAt).toLocaleString()}</time></li>)}</ul>}</section>}
      </div>
      <div className="space-y-5">
        {!room && review && <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Formal Recovery</p><h2 className="mt-2 font-display text-2xl">Open or return to the Recovery Room</h2><p className="mt-2 text-sm leading-6 text-ink/60">The backend charges the locked KES 100 formal-dispute fee to the person who opens Recovery. Repeating this action for the same Agreement Review is idempotent and does not create a second charge.</p><button disabled={busy} onClick={() => void openFormalRecovery()} className="mt-4 min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">Continue to formal Recovery · KES 100</button></section>}
        {room && <>
          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Recovery Room</p><h2 className="mt-1 font-display text-2xl">{room.recoveryCase.status}</h2></div><span className="rounded-full bg-[#f4f5f1] px-3 py-1 text-xs font-semibold text-ink/55">{formatMinorMoney('KES', room.recoveryCase.formalDisputeFeeMinor)} formal fee</span></div><p className="mt-3 text-xs leading-5 text-ink/45">Closing this room is housekeeping only. It does not resolve the underlying Agreement Review or move money.</p>{room.recoveryCase.status !== 'CLOSED' && <button disabled={busy} onClick={() => void closeRoom()} className="mt-3 min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold">Close Recovery Room</button>}</section>
          {!room.consultation && room.recoveryCase.status !== 'CLOSED' && <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Stalemate Master</p><p className="mt-2 text-sm text-ink/55">Invite a real Market Master into a scoped MW-11 consultation. The Master gains no agreement, release or settlement authority.</p><form onSubmit={inviteMaster} className="mt-4 space-y-3"><select value={selectedMasterId} onChange={e => setSelectedMasterId(e.target.value)} required className="min-h-11 w-full rounded-xl border border-green-700/15 bg-white px-3 text-sm"><option value="">Choose an available Master</option>{masters.map(master => <option key={master.id} value={master.id}>{master.category} · {master.ksNumber || 'Master'}</option>)}</select><textarea value={briefing} onChange={e => setBriefing(e.target.value)} rows={3} required placeholder="What is the stalemate you want the Master to consider?" className="w-full rounded-xl border border-green-700/15 bg-white p-3 text-sm" /><label className="block text-xs font-semibold text-ink/55">Requested minutes<input value={minutes} onChange={e => setMinutes(e.target.value)} type="number" min="1" step="15" className="mt-1 min-h-11 w-full rounded-xl border border-green-700/15 bg-white px-3 text-sm" /></label><button disabled={busy} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Invite Master</button></form></section>}
          {room.consultation && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Master consultation</p><p className="mt-2 text-sm text-ink/60">Status: {room.consultation.status} · {formatMinorMoney(room.consultation.currency, room.consultation.rateMinorPerHourSnapshot)}/hr</p><Link to={`/agreements/${agreementId}/consultation?consultation=${encodeURIComponent(room.consultation.id)}`} className="mt-3 inline-flex min-h-11 items-center rounded-full border border-green-700/20 px-4 text-sm font-semibold text-green-700">Open consultation</Link></section>}
          {room.opinion && <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Master Opinion</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/75">{room.opinion.opinionText}</p><p className="mt-2 text-xs text-ink/45">Advisory only. It is not a SecurePay decision or a release instruction.</p><textarea value={dispositionNote} onChange={e => setDispositionNote(e.target.value)} rows={2} placeholder="Optional note about your own choice" className="mt-4 w-full rounded-xl border border-green-700/15 bg-white p-3 text-sm" /><div className="mt-3 flex flex-wrap gap-2">{(['ADOPT','PARTIALLY_ADOPT','IGNORE'] as OpinionDisposition[]).map(value => <button key={value} disabled={busy} onClick={() => void disposition(value)} className="min-h-10 rounded-full border border-green-700/20 bg-white px-4 text-sm font-semibold text-green-800">{value === 'PARTIALLY_ADOPT' ? 'Partially Adopt' : value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div></section>}
          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Party choices</p>{room.dispositions.length === 0 ? <p className="mt-2 text-sm text-ink/45">No party has recorded a disposition toward a Master Opinion.</p> : <ul className="mt-3 space-y-2">{room.dispositions.map(item => <li key={item.id} className="rounded-xl bg-[#f7f8f4] p-3 text-sm"><strong>{item.identityId === user.id ? 'You' : 'Agreement participant'} · {item.disposition.replace('_', ' ')}</strong>{item.note && <p className="mt-1 text-xs text-ink/55">{item.note}</p>}</li>)}</ul>}</section>
        </>}
      </div>
    </div>}
  </TraderShell>;
}

function Guide({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-green-700">{icon}<strong className="text-sm">{title}</strong></div><p className="mt-1 text-xs leading-5 text-ink/50">{body}</p></div>;
}
