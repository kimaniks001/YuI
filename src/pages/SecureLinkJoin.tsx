// ═══════════════════════════════════════════════════════════════
// SECURELINK JOIN — Phase 3 UI Slice 3
//
// The counterparty side of Slice 2's invitation: opening a real invitation,
// understanding what it actually is, authenticating if needed, and joining
// only through real SecurePayAPI behavior. Verified directly against
// ~/SecurePayAPI: AgreementInvitationController.java (view + join),
// AgreementInvitationViewService.java, AgreementJoinService.java,
// InvitationOwnershipVerifier.java, and the OpenAPI contract.
//
// Contract facts this page is built around (verified, not assumed):
//   - GET /api/v1/agreement-invitations/{token} is PUBLIC (`security: []`
//     in the spec; the controller never calls requireAuthenticatedActor for
//     view). Viewing is not acceptance and does not join, activate, fund,
//     or confirm the agreement.
//   - POST /api/v1/agreement-invitations/{token}/join requires
//     authentication. The joining identity is always the authenticated
//     actor server-side — there is no client-supplied identity field.
//   - Joining sets the participant to JOINED_UNCONFIRMED, never CONFIRMED —
//     "joining" and "accepting the agreement" are genuinely different
//     things on this backend, not a UI simplification.
//   - The invitation-preview response (PublicInvitationView) never exposes
//     the intended KS Number, intended identity, or the creator's identity
//     — so this page cannot and does not show "who invited you" or
//     preemptively warn about a KS Number mismatch before joining. A
//     mismatch can only be discovered by attempting to join (the backend
//     returns AGREEMENT_OWNERSHIP_MISMATCH), which is surfaced as-is.
//   - JoinAgreementResponse now carries `agreementId` (~/SecurePayAPI commit
//     d1dedf2, "expose agreement id after invitation join" — the retained
//     gap this page's Slice 3 comment used to describe is closed). That,
//     combined with GET /agreements/{agreementId}/versions/{versionId}
//     being authorized for a joined participant (not just the creator —
//     verified directly against AgreementAuthorizationService#requireRead /
//     #isJoinedParticipant), is what makes Slice 4's confirmation action
//     below possible: it targets exactly agreementId + joinedVersionId from
//     this same join response, never a substituted/current version.
//
// Token handling: the raw invitation token lives only in the URL and in
// component state derived from it. It is never written to localStorage/
// sessionStorage, never logged, and never re-displayed once consumed — the
// result screen shows only the join response's own fields.
//
// Phase 3 UI Slice 4 ("participant confirmation") adds a "Confirm this
// version" action below, reachable once JOINED_UNCONFIRMED. It calls POST
// /agreements/{agreementId}/versions/{versionId}/confirm
// (AgreementController#confirmVersion, verified directly against source)
// with exactly {idempotencyKey, expectedVersionNumber, expectedContentHash}
// — expectedVersionNumber from the join response's joinedVersionNumber,
// expectedContentHash read (never derived, computed, or hashed
// client-side) from GET /agreements/{agreementId}/versions/{joinedVersionId}
// immediately beforehand. Confirming here proves only this participant's
// own participation in this exact version — never the creator's, never
// mutual, never a final contract, payment-ready status, funding, or
// settlement (none of those are claimed anywhere below).
// ═══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  ArrowRight, CheckCircle2, Loader2,
  Eye, EyeOff, LogIn, LogOut,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  viewAgreementInvitation, joinAgreementInvitation,
  getAgreementVersion, confirmAgreementVersion,
} from '../api/securepayEndpoints';
import type {
  SecurePayInvitationView, SecurePayJoinedAgreement, SecurePayAgreementConfirmation,
} from '../api/securepayTypes';


function formatKES(amountMinor: number): string {
  return (amountMinor / 100).toLocaleString('en-KE', { maximumFractionDigits: 2 });
}

function formatExpiry(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
}

function participantStatusLabel(status: SecurePayJoinedAgreement['participantStatus']): string {
  switch (status) {
    case 'JOINED_UNCONFIRMED': return 'Joined — not yet confirmed';
    case 'CONFIRMED': return 'Confirmed';
    case 'CREATOR': return 'Creator';
    case 'INVITED': return 'Invited';
    case 'PENDING': return 'Pending';
    default: return status;
  }
}

const cardCls = 'b5-live-door-card bg-white rounded-2xl border border-[#1a1a1a]/6 shadow-sm p-7 space-y-6';
const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 bg-white text-[#1a1a1a] text-sm placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all duration-200';
const primaryBtnCls = 'w-full flex items-center justify-center gap-2 bg-[#3a7a1f] hover:bg-[#2d6018] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-xl transition-all duration-200';

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="b5-join-room min-h-screen" style={{ background: '#fafaf8' }}>
      <nav className="px-6 md:px-12 py-4 border-b border-[#1a1a1a]/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="sp-living-mark-link" aria-label="SecurePay home"><LivingSecurePayMark state="guiding" size="md" presence="polite" /></Link>
        </div>
      </nav>
      <div className="max-w-md mx-auto px-6 py-12">{children}</div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
      <LivingSecurePayMark state="caution" size="xs" presence="present" label="SecurePay needs your attention" />
      <span>{message}</span>
    </div>
  );
}

// ─── Manual code entry — reached at the bare /securelink/join route (no
// token in the URL). This does not invent a lookup capability: it simply
// forwards whatever the visitor pastes into the same token-addressed route
// this page already handles. ────────────────────────────────────────────
function ManualEntry() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const submit = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    navigate(`/securelink/join/${encodeURIComponent(trimmed)}`);
  };
  return (
    <Shell>
      <div className={cardCls}>
        <div>
          <div className="b5-live-door-light mb-4"><LivingSecurePayMark state="guiding" size="lg" presence="polite" label="SecurePay is guiding your invitation" /><span className="text-xs text-[#1a1a1a]/40">Your invitation doorway</span></div>
          <h1 className="font-display text-xl font-medium text-[#1a1a1a] mb-1">Enter your invitation code</h1>
          <p className="text-sm text-[#1a1a1a]/45">
            Paste the invitation code someone on SecurePay sent you.
          </p>
        </div>
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={inputCls}
          placeholder="Invitation code"
          aria-label="Invitation code"
          autoFocus
        />
        <button type="button" onClick={submit} disabled={!code.trim()} className={primaryBtnCls}>
          Continue <ArrowRight size={14} />
        </button>
      </div>
    </Shell>
  );
}

// ─── Inline sign-in — same useAuth() context/backend calls the nav's
// sign-in modal uses (KS Number + password → OTP). Rendered inline instead
// of as a modal so the invitation token in the URL is never left and never
// needs a "resume" mechanism: the user simply never leaves this page. ────
function InlineSignIn({ resumePath }: { resumePath: string }) {
  const { signIn, completeSignIn, resendChallenge, cancelChallenge, challenge } = useAuth();
  const [ksNumber, setKsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async () => {
    setError(''); setNotice(''); setLoading(true);
    const err = await signIn(ksNumber.trim(), password);
    setLoading(false);
    if (err) { setError(err); return; }
  };

  const verify = async () => {
    setError(''); setLoading(true);
    const err = await completeSignIn(otp.trim());
    setLoading(false);
    if (err) { setError(err); return; }
    // Deliberately no navigation — signing in updates `user` in the shared
    // auth context, and this same component re-renders into the signed-in
    // join view without ever leaving this URL.
  };

  const resend = async () => {
    setError(''); setNotice(''); setLoading(true);
    const err = await resendChallenge();
    setLoading(false);
    if (err) { setError(err); return; }
    setNotice('A new code has been sent.');
  };

  const isOtpStep = !!challenge;

  return (
    <div className={cardCls}>
      <div>
        <h2 className="font-display text-xl font-medium text-[#1a1a1a] mb-1">
          {isOtpStep ? 'Enter your code' : 'Sign in to join'}
        </h2>
        <p className="text-sm text-[#1a1a1a]/45">
          {isOtpStep ? 'We sent a verification code for this sign-in.' : 'Sign in with your KS Number to join this proposed agreement.'}
        </p>
      </div>

      {!isOtpStep ? (
        <div className="space-y-3">
          <input
            type="text" className={inputCls} placeholder="KS Number (e.g. KS2145)"
            value={ksNumber} onChange={e => setKsNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()} autoComplete="username"
            aria-label="KS Number"
          />
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} className={inputCls} placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} autoComplete="current-password"
              aria-label="Password"
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60"
              aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus
            className={`${inputCls} text-center tracking-[0.3em] font-mono`}
            placeholder="Verification code" value={otp} onChange={e => setOtp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verify()}
            aria-label="Verification code"
          />
          <button type="button" onClick={resend} className="text-[10px] text-[#3a7a1f] font-semibold hover:underline">
            Resend code
          </button>
        </div>
      )}

      {error && <ErrorBanner message={error} />}
      {notice && (
        <div className="flex items-start gap-2 bg-[#f6faf2] border border-[#3a7a1f]/15 rounded-xl px-3.5 py-3">
          <LivingSecurePayMark state="success" size="xs" presence="polite" label="Verification code resent" />
          <p className="text-xs text-[#1a1a1a]/70 leading-relaxed">{notice}</p>
        </div>
      )}

      <button
        onClick={isOtpStep ? verify : submit}
        disabled={loading || (isOtpStep ? !otp : (!ksNumber || !password))}
        className={primaryBtnCls}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : !isOtpStep ? <LogIn size={15} /> : null}
        {loading ? 'Please wait…' : isOtpStep ? 'Verify code' : 'Sign in'}
      </button>

      {isOtpStep && (
        <button type="button" onClick={() => { cancelChallenge(); setOtp(''); setError(''); setNotice(''); }}
          className="w-full text-center text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/60">
          Back
        </button>
      )}

      {!isOtpStep && (
        <p className="text-center text-xs text-[#1a1a1a]/40">
          New to SecurePay?{' '}
          <Link to={`/signup?next=${encodeURIComponent(resumePath)}`} className="text-[#3a7a1f] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      )}
    </div>
  );
}

export default function SecureLinkJoin() {
  const { token: rawToken } = useParams<{ token?: string }>();
  const token = rawToken?.trim() || null;
  const { user, session, signOut } = useAuth();

  const [invitation, setInvitation] = useState<SecurePayInvitationView | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joined, setJoined] = useState<SecurePayJoinedAgreement | null>(null);
  const joiningRef = useRef(false);
  // Stable per token+identity — a retry of the exact same join intent (same
  // token, same signed-in identity) must reuse this key so a dropped
  // response can safely replay instead of risking a duplicate participant
  // record. Rotated only when there is genuinely a new intent: a different
  // token, or a different identity after a sign-out (see handleSwitchAccount).
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  // ── Confirmation (Slice 4) ──────────────────────────────────────────
  const [versionHash, setVersionHash] = useState<string | null>(null);
  const [versionLoading, setVersionLoading] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<SecurePayAgreementConfirmation | null>(null);
  const confirmingRef = useRef(false);
  // Stable per confirmation target (agreementId + joinedVersionId) — a
  // retry of the exact same confirmation intent must reuse this key so a
  // dropped response can safely replay. Only rotates if the target itself
  // changes (it never does within one join — see the effect below), never
  // merely because a response was lost.
  const confirmIdempotencyKeyRef = useRef<string | null>(null);
  const confirmTargetKeyRef = useRef<string | null>(null);

  const loadInvitation = useCallback(async (t: string) => {
    setPreviewLoading(true);
    setPreviewError(null);
    const result = await viewAgreementInvitation(t);
    setPreviewLoading(false);
    if (!result.ok || !result.data) {
      setPreviewError(result.error || 'Could not load this invitation.');
      return;
    }
    setInvitation(result.data);
  }, []);

  // GET /agreements/{agreementId}/versions/{versionId} — reads the
  // authoritative contentHash for exactly the joined version, never a
  // "current version" endpoint. Never derives, computes, or hashes
  // anything client-side.
  const loadVersionForConfirm = useCallback(async (target: SecurePayJoinedAgreement) => {
    if (!session?.accessToken) return;
    setVersionLoading(true);
    setVersionError(null);
    const result = await getAgreementVersion(target.agreementId, target.joinedVersionId, session.accessToken);
    setVersionLoading(false);
    if (!result.ok || !result.data) {
      setVersionError(result.error || 'Could not load the agreement version to confirm.');
      return;
    }
    if (result.data.id !== target.joinedVersionId) {
      // Defense in depth — should be unreachable, since we always request
      // by the exact joined version id and never a "current version" read.
      setVersionError('Could not verify the joined version. Please refresh and try again.');
      return;
    }
    setVersionHash(result.data.contentHash);
  }, [session?.accessToken]);

  useEffect(() => {
    if (!token) return;
    idempotencyKeyRef.current = crypto.randomUUID();
    setInvitation(null);
    setJoined(null);
    setJoinError(null);
    setVersionHash(null);
    setVersionError(null);
    setConfirmError(null);
    setConfirmation(null);
    confirmTargetKeyRef.current = null;
    confirmIdempotencyKeyRef.current = null;
    loadInvitation(token);
  }, [token, loadInvitation]);

  // Fires once per successful join, when there's genuinely something to
  // confirm. Generates a fresh idempotency key only the first time this
  // exact agreementId+joinedVersionId target is seen — a re-render with the
  // same target reuses it, so a retry after a lost response replays safely
  // instead of risking a duplicate confirmation.
  useEffect(() => {
    if (!joined || joined.participantStatus !== 'JOINED_UNCONFIRMED' || !joined.confirmationRequired) return;
    const targetKey = `${joined.agreementId}:${joined.joinedVersionId}`;
    if (confirmTargetKeyRef.current !== targetKey) {
      confirmTargetKeyRef.current = targetKey;
      confirmIdempotencyKeyRef.current = crypto.randomUUID();
      loadVersionForConfirm(joined);
    }
  }, [joined, loadVersionForConfirm]);

  if (!token) return <ManualEntry />;

  const submitJoin = async () => {
    if (joiningRef.current || !session?.accessToken) return;
    joiningRef.current = true;
    setJoinError(null);
    setJoining(true);
    try {
      const result = await joinAgreementInvitation(
        token,
        { idempotencyKey: idempotencyKeyRef.current },
        session.accessToken
      );
      if (!result.ok || !result.data) {
        setJoinError(result.error || 'Something went wrong. Please try again.');
        return;
      }
      setJoined(result.data);
    } finally {
      joiningRef.current = false;
      setJoining(false);
    }
  };

  const retryLoadVersion = () => {
    if (joined) loadVersionForConfirm(joined);
  };

  // POST /agreements/{agreementId}/versions/{versionId}/confirm — sends
  // exactly {idempotencyKey, expectedVersionNumber, expectedContentHash}.
  // expectedVersionNumber comes from the join response's
  // joinedVersionNumber; expectedContentHash comes only from the version
  // read above, never derived or fabricated client-side.
  const submitConfirm = async () => {
    if (confirmingRef.current || !session?.accessToken || !joined || !versionHash) return;
    confirmingRef.current = true;
    setConfirmError(null);
    setConfirming(true);
    try {
      const result = await confirmAgreementVersion(
        joined.agreementId,
        joined.joinedVersionId,
        {
          idempotencyKey: confirmIdempotencyKeyRef.current!,
          expectedVersionNumber: joined.joinedVersionNumber,
          expectedContentHash: versionHash,
        },
        session.accessToken
      );
      if (!result.ok || !result.data) {
        setConfirmError(result.error || 'Something went wrong. Please try again.');
        return;
      }
      setConfirmation(result.data);
    } finally {
      confirmingRef.current = false;
      setConfirming(false);
    }
  };

  // Recourse for a KS Number/identity mismatch: sign out and let a
  // different, correctly-identified account sign in — never an override of
  // the backend's ownership check, never a client-side identity switch.
  const switchAccount = async () => {
    await signOut();
    idempotencyKeyRef.current = crypto.randomUUID();
    setJoinError(null);
  };

  if (previewLoading) {
    return (
      <Shell>
        <div className={`${cardCls} items-center text-center`}>
          <Loader2 size={22} className="animate-spin text-[#3a7a1f] mx-auto" />
          <p className="text-sm text-[#1a1a1a]/50">Loading invitation…</p>
        </div>
      </Shell>
    );
  }

  if (previewError) {
    return (
      <Shell>
        <div className={cardCls}>
          <ErrorBanner message={previewError} />
          <button type="button" onClick={() => loadInvitation(token)} className={primaryBtnCls}>
            Try again
          </button>
          <Link to="/" className="block text-center text-sm text-[#1a1a1a]/35 hover:text-[#1a1a1a]/60">
            Back to SecurePay
          </Link>
        </div>
      </Shell>
    );
  }

  if (!invitation) return null;

  if (joined) {
    return (
      <Shell>
        <div className="space-y-6 text-center">
          <LivingSecurePayMark state="success" size="lg" presence="present" label="You joined this SecureLink" />
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-medium text-[#1a1a1a]">You've joined this SecureLink</h1>
            <p className="text-sm text-[#1a1a1a]/50 leading-relaxed">{joined.notice}</p>
          </div>

          <div className="bg-white border border-[#1a1a1a]/8 rounded-2xl p-5 text-left space-y-3">
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Reference</p>
              <p className="text-sm font-mono text-[#1a1a1a]/80">{joined.publicReference}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Your role</p>
              <p className="text-sm text-[#1a1a1a]/80">{joined.role}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Status</p>
              <p className="text-sm text-[#1a1a1a]/80">
                {confirmation?.status === 'CONFIRMED'
                  ? participantStatusLabel('CONFIRMED')
                  : participantStatusLabel(joined.participantStatus)}
              </p>
            </div>
          </div>

          {joined.confirmationRequired && !confirmation && (
            <p className="text-xs text-[#1a1a1a]/40 leading-relaxed">
              Joining only records your participation. Confirming the agreement is a separate step, not part of joining.
            </p>
          )}

          {joined.participantStatus === 'JOINED_UNCONFIRMED' && joined.confirmationRequired && !confirmation && (
            <div className="bg-white border border-[#1a1a1a]/8 rounded-2xl p-5 text-left space-y-4">
              <div>
                <h2 className="font-display text-base font-medium text-[#1a1a1a] mb-1">Confirm your participation</h2>
                <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
                  This confirms the exact agreement version you joined (version {joined.joinedVersionNumber}) — it confirms only your own participation, not the other party's, and it is not a final contract, does not mark this as payment-ready, and does not move any funds.
                </p>
              </div>

              {versionError && (
                <div className="space-y-3">
                  <ErrorBanner message={versionError} />
                  <button type="button" onClick={retryLoadVersion} className={primaryBtnCls}>
                    Try again
                  </button>
                </div>
              )}

              {confirmError && <ErrorBanner message={confirmError} />}

              {!versionError && (
                <button
                  type="button"
                  onClick={submitConfirm}
                  disabled={versionLoading || !versionHash || confirming}
                  className={primaryBtnCls}
                >
                  {confirming || versionLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <CheckCircle2 size={15} />}
                  {versionLoading ? 'Preparing…' : confirming ? 'Confirming…' : 'Confirm this version'}
                </button>
              )}
            </div>
          )}

          {confirmation && (
            <div className="bg-white border border-[#3a7a1f]/20 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-center gap-2">
                <LivingSecurePayMark state="success" size="xs" presence="polite" label="Your participation is confirmed for this version" />
                <h2 className="font-display text-base font-medium text-[#1a1a1a]">You've confirmed this version</h2>
              </div>
              <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
                You confirmed version {confirmation.versionNumber} on {formatExpiry(confirmation.confirmedAt)}. This
                confirms your own participation only — it does not by itself mean the other party has confirmed, and
                it is not a final contract, payment-ready status, funding, or a release of funds.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Phase 4 handoff — agreementId comes straight from
                JoinAgreementResponse (the same field Slice 4's confirmation
                action above already targets), never guessed from the
                publicReference or the invitation token. */}
            <Link to={`/agreements/${joined.agreementId}`}
              className="inline-flex w-full items-center justify-center gap-2 bg-[#3a7a1f] hover:bg-[#2d6018] text-white font-medium text-sm py-3 rounded-full transition-all duration-200">
              View agreement
            </Link>
            <Link to="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70 font-medium text-sm py-2 transition-colors">
              Go to SecurePay Home
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const currentPath = `/securelink/join/${encodeURIComponent(token)}`;
  const isOwnershipMismatch = joinError?.startsWith('This invitation is not for your account') ?? false;

  return (
    <Shell>
      <div className="space-y-6">
        <div className={cardCls}>
          <div>
            <div className="b5-live-door-light mb-4"><LivingSecurePayMark state="guiding" size="lg" presence="polite" label="SecurePay is guiding this invitation" /><span className="text-xs text-[#1a1a1a]/40">Read the trade before you join</span></div>
            <p className="text-[10px] font-bold text-[#3a7a1f] uppercase tracking-widest mb-2">Review before joining</p>
            <h1 className="font-display text-xl font-medium text-[#1a1a1a] mb-1">You've been invited to an agreement</h1>
            <p className="text-sm text-[#1a1a1a]/45">
              Someone has invited you to a SecurePay agreement. {invitation.notice}
            </p>
          </div>

          <div className="bg-[#fafaf8] border border-[#1a1a1a]/6 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Who invited you</p>
              <p className="text-sm text-[#1a1a1a]/80">Not disclosed in this invitation preview</p>
              <p className="text-xs text-[#1a1a1a]/40 mt-1">SecurePayAPI does not return the inviter's identity on the public invitation route. Check the reference and proposal with the person who sent you this token.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Reference</p>
              <p className="text-sm font-mono text-[#1a1a1a]/80">{invitation.publicReference}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Title</p>
              <p className="text-sm text-[#1a1a1a]/80">{invitation.title}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">What it's for</p>
              <p className="text-sm text-[#1a1a1a]/80 whitespace-pre-wrap">{invitation.purpose}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Your role</p>
              <p className="text-sm text-[#1a1a1a]/80">{invitation.intendedRole}</p>
            </div>
            {invitation.proposedAmountMinor != null && invitation.currency && (
              <div>
                <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Amount</p>
                <p className="text-sm text-[#1a1a1a]/80">{invitation.currency} {formatKES(invitation.proposedAmountMinor)}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Expires</p>
              <p className="text-sm text-[#1a1a1a]/80">{formatExpiry(invitation.invitationExpiresAt)}</p>
            </div>
          </div>

          <div className="grid gap-3 text-xs leading-relaxed text-[#1a1a1a]/55">
            <div className="rounded-xl border border-[#3a7a1f]/15 bg-[#f6faf2] p-3">
              <p className="font-semibold text-[#1a1a1a]/75">What are you being asked to do?</p>
              <p>Sign in, let SecurePay verify this invitation belongs to your KS Number, and join as {invitation.intendedRole}. Confirmation is a later, separate choice.</p>
            </div>
            <div className="rounded-xl border border-[#e87c1e]/20 bg-[#fff8f0] p-3">
              <p className="font-semibold text-[#1a1a1a]/75">What has not happened yet?</p>
              <p>This proposal is not accepted, funded, Payment Ready, paid, released, delivered, or settled merely because you viewed or joined it.</p>
            </div>
            <div className="rounded-xl border border-[#1a1a1a]/8 bg-white p-3">
              <p className="font-semibold text-[#1a1a1a]/75">What happens next?</p>
              <p>After joining, you can review the exact joined version, confirm only your own participation if required, and open the authoritative agreement workspace.</p>
            </div>
          </div>
        </div>

        {!user ? (
          <InlineSignIn resumePath={currentPath} />
        ) : (
          <div className={cardCls}>
            {joinError && (
              <div className="space-y-3">
                <ErrorBanner message={joinError} />
                {isOwnershipMismatch && (
                  <button type="button" onClick={switchAccount}
                    className="w-full flex items-center justify-center gap-2 border border-[#1a1a1a]/15 text-[#1a1a1a]/65 hover:text-[#1a1a1a] font-medium text-sm py-3 rounded-xl transition-colors">
                    <LogOut size={14} /> Sign out and try a different account
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-[#1a1a1a]/40">
              Signed in as <span className="font-mono text-[#1a1a1a]/70">{user.ksNumber}</span>
            </p>
            <button type="button" onClick={submitJoin} disabled={joining} className={primaryBtnCls} aria-label="Join SecureLink">
              {joining ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              {joining ? 'Joining…' : 'Join SecureLink'}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}
