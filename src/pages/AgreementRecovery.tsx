import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, FileText, Scale, ShieldAlert } from 'lucide-react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { discoverMasters } from '../api/masterEndpoints';
import type { MasterProfile } from '../api/masterTypes';
import { closeRecoveryCase, getRecoveryRoom, inviteRecoveryMaster, openRecoveryCase, recordRecoveryDisposition } from '../api/recoveryEndpoints';
import type { OpinionDisposition, RecoveryRoom } from '../api/recoveryTypes';
import { getAgreementReviewCase, listAgreementReviewCases, listAgreementReviewEvidence } from '../api/securepayEndpoints';
import type { SecurePayAgreementReviewCaseDetail, SecurePayAgreementReviewCaseSummary, SecurePayAgreementReviewEvidenceItem } from '../api/securepayTypes';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderShell from '../components/trader/TraderShell';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { formatMinorMoney } from '../lib/formatMinorMoney';

/** MW-12: Recovery composes Agreement Review + optional MW-11 advice; it never becomes an adjudicator. */
export default function AgreementRecovery() {
  const { agreementId } = useParams<{ agreementId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, session } = useAuth();
  const [reviews, setReviews] = useState<SecurePayAgreementReviewCaseSummary[]>([]);
  const [review, setReview] = useState<SecurePayAgreementReviewCaseDetail | null>(null);
  const [evidence, setEvidence] = useState<SecurePayAgreementReviewEvidenceItem[]>([]);
  const [room, setRoom] = useState<RecoveryRoom | null>(null);
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [masterId, setMasterId] = useState('');
  const [briefing, setBriefing] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [partyNote, setPartyNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reviewCaseId = searchParams.get('reviewCase');
  const recoveryCaseId = searchParams.get('recoveryCase');

  const load = useCallback(async () => {
    if (!session?.accessToken || !agreementId) return;
    setLoading(true); setError(null);
    const [reviewList, masterList] = await Promise.all([
      listAgreementReviewCases(agreementId, session.accessToken),
      discoverMasters(session.accessToken),
    ]);
    if (!reviewList.ok || !reviewList.data) {
      setError(reviewList.error || 'Agreement Review could not be loaded.'); setLoading(false); return;
    }
    setReviews(reviewList.data.items);
    if (masterList.ok && masterList.data) setMasters(masterList.data.filter(item => item.status === 'ACTIVE' && item.available));
    const chosen = reviewList.data.items.find(item => item.reviewCaseId === reviewCaseId) || reviewList.data.items[0];
    if (chosen) {
      const [detail, files] = await Promise.all([
        getAgreementReviewCase(chosen.reviewCaseId, agreementId, session.accessToken),
        listAgreementReviewEvidence(chosen.reviewCaseId, agreementId, session.accessToken),
      ]);
      setReview(detail.ok && detail.data ? detail.data : null);
      setEvidence(files.ok && files.data ? files.data.items : []);
    } else { setReview(null); setEvidence([]); }
    if (recoveryCaseId) {
      const recovery = await getRecoveryRoom(session.accessToken, recoveryCaseId);
      if (recovery.ok && recovery.data) setRoom(recovery.data);
      else { setRoom(null); setNotice(recovery.error || 'That Recovery Room is not available to you.'); }
    } else setRoom(null);
    setLoading(false);
  }, [session?.accessToken, agreementId, reviewCaseId, recoveryCaseId]);

  useEffect(() => { void load(); }, [load]);
  if (!user || !session) return <Navigate to="/signin" replace />;
  if (!agreementId) return <Navigate to="/agreements" replace />;

  // Capture the narrowed values for deferred handlers. React may render again
  // later, but these handlers belong to this authenticated render only.
  const accessToken = session.accessToken;
  const currentAgreementId = agreementId;

  async function openFormalRecovery() {
    if (!review) return;
    setBusy(true); setNotice(null);
    const result = await openRecoveryCase(accessToken, { reviewCaseId: review.reviewCaseId, agreementId: currentAgreementId });
    setBusy(false);
    if (!result.ok || !result.data) { setNotice(result.error || 'Formal Recovery could not be opened.'); return; }
    const next = new URLSearchParams(searchParams);
    next.set('reviewCase', review.reviewCaseId); next.set('recoveryCase', result.data.id); setSearchParams(next);
  }

  async function inviteMaster(event: React.FormEvent) {
    event.preventDefault(); if (!room || !masterId || !briefing.trim()) return;
    const requestedMinutes = Number(minutes); if (!Number.isInteger(requestedMinutes) || requestedMinutes < 1) return;
    setBusy(true); setNotice(null);
    const result = await inviteRecoveryMaster(accessToken, room.recoveryCase.id, { masterProfileId: masterId, requestedMinutes, briefingNotes: briefing.trim() });
    setBusy(false);
    if (!result.ok) setNotice(result.error || 'The Master could not be invited.');
    else { setMasterId(''); setBriefing(''); void load(); }
  }

  async function choose(value: OpinionDisposition) {
    if (!room) return;
    setBusy(true); setNotice(null);
    const result = await recordRecoveryDisposition(accessToken, room.recoveryCase.id, { disposition: value, note: partyNote.trim() || undefined });
    setBusy(false);
    if (!result.ok) setNotice(result.error || 'Your choice could not be recorded.');
    else { setPartyNote(''); void load(); }
  }

  async function closeRoom() {
    if (!room) return; setBusy(true); setNotice(null);
    const result = await closeRecoveryCase(accessToken, room.recoveryCase.id); setBusy(false);
    if (!result.ok) setNotice(result.error || 'Recovery could not be closed.'); else void load();
  }

  return <TraderShell>
    <Link to={`/agreements/${currentAgreementId}`} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Agreement</Link>
    <TraderPageHeader eyebrow="Recovery & Resolution" title="Bring the facts back together." description="Agreement Review keeps the dispute and evidence record. Formal Recovery adds a KES 100 opener-paid process, optional Master advice and each party’s own choice. SecurePay does not decide who is right." />
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Guide icon={<ShieldAlert size={17} />} title="What happened" body="Agreement Review stays authoritative." />
      <Guide icon={<Scale size={17} />} title="What it means" body="Master Opinion is advice, never a ruling." />
      <Guide icon={<FileText size={17} />} title="What next" body="Each party records its own response." />
    </div>
    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Recovery could not be loaded" detail={error} onRetry={() => void load()} />}
    {notice && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
    {!loading && !error && <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Agreement Review</p>
          {reviews.length === 0 ? <><p className="mt-3 text-sm leading-6 text-ink/55">No participant-visible review case exists. YUI will not manufacture a dispute. Start from the agreement’s real review action when the backend offers it.</p><Link to={`/agreements/${currentAgreementId}`} className="mt-4 inline-flex min-h-11 items-center rounded-full border border-green-700/20 px-4 text-sm font-semibold text-green-700">Back to agreement</Link></> : <>
            <select value={review?.reviewCaseId || ''} onChange={event => { const next = new URLSearchParams(searchParams); next.set('reviewCase', event.target.value); next.delete('recoveryCase'); setSearchParams(next); }} className="mt-3 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm">{reviews.map(item => <option key={item.reviewCaseId} value={item.reviewCaseId}>{item.state} · {new Date(item.openedAt).toLocaleDateString()}</option>)}</select>
            {review && <div className="mt-4 space-y-2 text-sm text-ink/60"><p><strong className="text-ink">State:</strong> {review.state}</p><p><strong className="text-ink">Your role:</strong> {review.callerRole}</p>{review.responseDeadlineAt && <p><strong className="text-ink">Response by:</strong> {new Date(review.responseDeadlineAt).toLocaleString()}</p>}<p className="text-xs text-ink/45">Recovery cannot change this case’s truth or move money.</p></div>}
          </>}
        </section>
        {review && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Review evidence</p>{evidence.length === 0 ? <p className="mt-3 text-sm text-ink/45">No participant-visible evidence is attached.</p> : <ul className="mt-3 space-y-2">{evidence.map(item => <li key={item.evidenceId} className="rounded-xl border border-ink/8 p-3"><strong className="text-sm">{item.evidenceType}</strong><p className="mt-1 text-xs text-ink/55">{item.originalFilename} · {item.submittedByCaller ? 'submitted by you' : 'submitted by another participant'}</p></li>)}</ul>}</section>}
      </div>
      <div className="space-y-5">
        {!room && review && <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Formal Recovery</p><h2 className="mt-2 font-display text-2xl">Open or return to Recovery</h2><p className="mt-2 text-sm leading-6 text-ink/60">The backend charges KES 100 to the person who opens Recovery. Re-opening the same review is idempotent, so it does not create a second charge.</p><button disabled={busy} onClick={() => void openFormalRecovery()} className="mt-4 min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">Continue · KES 100</button></section>}
        {room && <>
          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Recovery Room</p><h2 className="mt-1 font-display text-2xl">{room.recoveryCase.status}</h2></div><span className="rounded-full bg-[#f4f5f1] px-3 py-1 text-xs font-semibold text-ink/55">{formatMinorMoney('KES', room.recoveryCase.formalDisputeFeeMinor)} formal fee</span></div><p className="mt-3 text-xs leading-5 text-ink/45">Closing is housekeeping only — not a verdict, release or settlement.</p>{room.recoveryCase.status !== 'CLOSED' && <button disabled={busy} onClick={() => void closeRoom()} className="mt-3 min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold">Close room</button>}</section>
          {!room.consultation && room.recoveryCase.status !== 'CLOSED' && <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Stalemate Master</p><form onSubmit={inviteMaster} className="mt-3 space-y-3"><select value={masterId} onChange={event => setMasterId(event.target.value)} required className="min-h-11 w-full rounded-xl border border-green-700/15 bg-white px-3 text-sm"><option value="">Choose an available Master</option>{masters.map(item => <option key={item.id} value={item.id}>{item.category} · {item.ksNumber || 'Master'}</option>)}</select><textarea value={briefing} onChange={event => setBriefing(event.target.value)} rows={3} required placeholder="What stalemate should the Master consider?" className="w-full rounded-xl border border-green-700/15 bg-white p-3 text-sm" /><input value={minutes} onChange={event => setMinutes(event.target.value)} type="number" min="1" step="15" className="min-h-11 w-full rounded-xl border border-green-700/15 bg-white px-3 text-sm" aria-label="Requested minutes" /><button disabled={busy} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Invite Master</button></form></section>}
          {room.consultation && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Master consultation</p><p className="mt-2 text-sm text-ink/60">{room.consultation.status} · {formatMinorMoney(room.consultation.currency, room.consultation.rateMinorPerHourSnapshot)}/hr</p><Link to={`/agreements/${currentAgreementId}/consultation?consultation=${encodeURIComponent(room.consultation.id)}`} className="mt-3 inline-flex min-h-11 items-center rounded-full border border-green-700/20 px-4 text-sm font-semibold text-green-700">Open consultation</Link></section>}
          {room.opinion && <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Master Opinion</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/75">{room.opinion.opinionText}</p><p className="mt-2 text-xs text-ink/45">Advice only. Your choice below belongs to you.</p><textarea value={partyNote} onChange={event => setPartyNote(event.target.value)} rows={2} placeholder="Optional note" className="mt-4 w-full rounded-xl border border-green-700/15 bg-white p-3 text-sm" /><div className="mt-3 flex flex-wrap gap-2">{(['ADOPT', 'PARTIALLY_ADOPT', 'IGNORE'] as OpinionDisposition[]).map(value => <button key={value} disabled={busy} onClick={() => void choose(value)} className="min-h-10 rounded-full border border-green-700/20 bg-white px-4 text-sm font-semibold text-green-800">{value === 'PARTIALLY_ADOPT' ? 'Partially Adopt' : value.charAt(0) + value.slice(1).toLowerCase()}</button>)}</div></section>}
          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Party choices</p>{room.dispositions.length === 0 ? <p className="mt-2 text-sm text-ink/45">No disposition recorded yet.</p> : <ul className="mt-3 space-y-2">{room.dispositions.map(item => <li key={item.id} className="rounded-xl bg-[#f7f8f4] p-3 text-sm"><strong>{item.identityId === user.id ? 'You' : 'Agreement participant'} · {item.disposition.replace('_', ' ')}</strong>{item.note && <p className="mt-1 text-xs text-ink/55">{item.note}</p>}</li>)}</ul>}</section>
        </>}
      </div>
    </div>}
  </TraderShell>;
}

function Guide({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-green-700">{icon}<strong className="text-sm">{title}</strong></div><p className="mt-1 text-xs leading-5 text-ink/50">{body}</p></div>;
}
