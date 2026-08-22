import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Eye, EyeOff, Copy,
  LockKeyhole, ShieldCheck, User, Wrench, Info, Users, Share2,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { loadCreationIntent, clearCreationIntent, type CreationIntent } from '../lib/creationIntent';
import {
  createInitialFacts, confirmFact, proposeFact, authorizeFact,
  isRecipientResolved,
  type CreationFacts, type StageEntry, type ContributorEntry,
  type ContributionFrequency, type RecipientEntry,
} from '../lib/creationFacts';
import {
  plannedQuestions, nextQuestion, previousQuestion,
  questionPosition, totalQuestions, questionMeta,
  type QuestionId,
} from '../lib/creationEngine';
import { isBackendSupported, TOPOLOGY_LABELS } from '../lib/agreementTopology';
import { clearCreationDraft, loadCreationDraft } from '../lib/creationPersistence';
import {
  createAgreement, issueAgreementInvitation,
  listAgreementVersions, createAgreementMilestone,
  createGroupSecureLink, issueGroupSecureLinkPublicLocator,
} from '../api/securepayEndpoints';
import {
  createDistributionPlan, amendDistributionPlanAllocations,
  submitDistributionPlan,
} from '../api/secureflowEndpoints';
import {
  CreationShell, CreationBottomAction, QuestionTitle,
  KsnInput, CompactStageEditor, ConfirmerChoice,
  InfoDisclaimer, CompactReview, CompactGroupReview, CompactFlowReview,
  ContributorEditor, ContributionSplitChoice, RecipientInput,
  FrequencyChoice, RecipientListEditor, AllocationChoice, ObligationEditor,
  ContributionJoinChoice, GovernanceChoice, CompactGroupFlowReview,
} from '../components/creation';

// ─── Auth gate (inline, same route — no redirect) ───────────────
function InlineAuthGate({ onAuthed }: { onAuthed: () => void }) {
  const { signIn, completeSignIn, resendChallenge, cancelChallenge, challenge } = useAuth();
  const [ksNumber, setKsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const otpStep = !!challenge;

  const submitCredentials = async () => {
    if (!ksNumber.trim() || !password || loading) return;
    setError(''); setNotice(''); setLoading(true);
    const err = await signIn(ksNumber.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  const verify = async () => {
    if (!otp.trim() || loading) return;
    setError(''); setNotice(''); setLoading(true);
    const err = await completeSignIn(otp.trim());
    setLoading(false);
    if (err) setError(err);
    else onAuthed();
  };

  return (
    <div className="min-h-screen bg-[#fffdf8] flex flex-col">
      <header className="flex items-center px-4 h-14 border-b border-[#e9e7e1]">
        <Link to="/" aria-label="SecurePay home">
          <LivingSecurePayMark state="guiding" size="sm" presence="polite" />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#3a7a1f]/10 flex items-center justify-center mx-auto">
              <LockKeyhole size={20} className="text-[#3a7a1f]" />
            </div>
            <h1 className="font-display text-xl font-medium text-[#1a1a1a]">
              {otpStep ? 'Enter your code' : 'Sign in to continue'}
            </h1>
            <p className="text-sm text-[#1a1a1a]/50">
              {otpStep
                ? 'Complete sign-in, then your agreement setup continues here.'
                : 'SecurePay needs to know which trader is creating this agreement.'}
            </p>
          </div>

          {error && (
            <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-xl border border-[#3a7a1f]/15 bg-[#f4f8ef] px-3.5 py-3 text-sm text-[#315f1c]">{notice}</div>
          )}

          {!otpStep ? (
            <div className="space-y-3">
              <input aria-label="KSNumber" className="w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 bg-white text-[#1a1a1a] text-sm placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all duration-200" placeholder="KSNumber, e.g. KS2145"
                value={ksNumber} onChange={e => setKsNumber(e.target.value)} autoComplete="username" />
              <div className="relative">
                <input aria-label="Password" className="w-full px-4 py-3 pr-11 rounded-xl border border-[#1a1a1a]/10 bg-white text-[#1a1a1a] text-sm placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all duration-200" placeholder="Password"
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void submitCredentials()}
                  autoComplete="current-password" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a1a]/35">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button type="button" onClick={() => void submitCredentials()}
                disabled={loading || !ksNumber.trim() || !password}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-5 text-sm font-semibold text-white disabled:opacity-40">
                {loading ? null : null} Continue <ArrowRight size={16} />
              </button>
              <p className="text-center text-xs text-[#1a1a1a]/45">
                New to SecurePay? <Link to="/signup" className="font-semibold text-[#3a7a1f] hover:underline">Create your KSNumber</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <input aria-label="Verification code"
                className="w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 bg-white text-center font-mono tracking-[0.3em] text-sm text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all duration-200"
                placeholder="Code" value={otp}
                onChange={e => setOtp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void verify()}
                autoComplete="one-time-code" />
              <button type="button" onClick={() => void verify()}
                disabled={loading || !otp.trim()}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-5 text-sm font-semibold text-white disabled:opacity-40">
                <ShieldCheck size={16} /> Verify & continue
              </button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { cancelChallenge(); setOtp(''); setError(''); setNotice(''); }}
                  className="text-[#1a1a1a]/45 hover:text-[#1a1a1a]">Back</button>
                <button type="button" onClick={async () => { setLoading(true); const e = await resendChallenge(); setLoading(false); if (e) setError(e); else setNotice('A new code has been sent.'); }}
                  className="font-semibold text-[#3a7a1f] hover:underline">Resend code</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────

interface CreateJourneyProps {
  previewMode?: boolean;
}

export default function CreateJourney({ previewMode = false }: CreateJourneyProps) {
  const { user, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [intent] = useState<CreationIntent | null>(() => {
    const stateIntent = (location.state as { intent?: CreationIntent } | null)?.intent ?? null;
    if (stateIntent) return stateIntent;
    return loadCreationIntent();
  });

  const [authJustCompleted, setAuthJustCompleted] = useState(false);
  const [memoryExpanded, setMemoryExpanded] = useState(false);

  // Build initial facts from intent
  const [facts, setFacts] = useState<CreationFacts | null>(() => {
    if (!intent) return null;
    return createInitialFacts(intent);
  });

  // Restore draft if available (resume support)
  const draft = loadCreationDraft();
  const [screen, setScreen] = useState<QuestionId>(() => {
    if (!intent || !facts) return 'understood';
    const planned = plannedQuestions(facts);
    // If we have a draft with a valid screen, resume there
    if (draft && draft.currentScreen && planned.includes(draft.currentScreen as QuestionId)) {
      return draft.currentScreen as QuestionId;
    }
    return planned[0];
  });

  // Idempotency
  const idempotencyKeyRef = useRef(
    draft?.idempotencyKey ?? crypto.randomUUID(),
  );

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // ─── Guards ───────────────────────────────────────────────────
  if (!intent || !facts) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="font-display text-xl font-medium text-[#1a1a1a]">No agreement to set up</h1>
          <p className="text-sm text-[#1a1a1a]/50">
            Tell SecurePay what you're trying to do first, and we'll carry it forward.
          </p>
          <Link to={previewMode ? "/preview/home" : "/"} className="inline-flex items-center gap-2 text-sm font-semibold text-[#3a7a1f] hover:underline">
            Go to Home <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  if (!previewMode && !user && !authJustCompleted) {
    return <InlineAuthGate onAuthed={() => setAuthJustCompleted(true)} />;
  }
  if (!previewMode && !user) {
    return <InlineAuthGate onAuthed={() => setAuthJustCompleted(true)} />;
  }

  const total = totalQuestions(facts);
  const pos = questionPosition(facts, screen);
  const meta = questionMeta(screen, facts);
  const prev = previousQuestion(facts, screen);
  const next = nextQuestion(facts, screen);
  const topology = facts.topology.topology;
  const topologySupported = previewMode || isBackendSupported(topology);

  // ─── Navigation ──────────────────────────────────────────────
  const goNext = () => {
    if (next) setScreen(next);
  };
  const goBack = () => {
    if (prev) setScreen(prev);
    else if (previewMode) navigate('/preview/home');
  };

  // ─── Fact updaters ────────────────────────────────────────────
  const updatePayerIsCreator = (value: boolean) => {
    setFacts((f) => f ? { ...f, payerIsCreator: confirmFact(f.payerIsCreator, value) } : f);
  };
  const updateCounterpartyKs = (value: string) => {
    setFacts((f) => f ? { ...f, counterpartyKs: { ...f.counterpartyKs, value } } : f);
  };
  const confirmCounterparty = () => {
    setFacts((f) => f ? { ...f, counterpartyKs: confirmFact(f.counterpartyKs, f.counterpartyKs.value) } : f);
  };
  const updateStages = (stages: StageEntry[]) => {
    setFacts((f) => f ? { ...f, stages: { ...f.stages, value: stages } } : f);
  };
  const confirmStages = () => {
    setFacts((f) => f ? { ...f, stages: confirmFact(f.stages, f.stages.value) } : f);
  };
  const updateConfirmer = (value: 'me' | 'someone_else') => {
    setFacts((f) => f ? { ...f, confirmer: proposeFact(f.confirmer, value) } : f);
  };

  // ─── MANY_TO_ONE fact updaters ────────────────────────────────
  const updateContributors = (value: ContributorEntry[]) => {
    setFacts((f) => f ? { ...f, contributors: { ...f.contributors, value } } : f);
  };
  const confirmContributors = () => {
    setFacts((f) => f ? { ...f, contributors: confirmFact(f.contributors, f.contributors.value) } : f);
  };
  const updateContributionMode = (value: 'equal' | 'custom') => {
    setFacts((f) => f ? { ...f, contributionMode: confirmFact(f.contributionMode, value) } : f);
  };
  const updateRecipientKs = (value: string) => {
    setFacts((f) => f ? { ...f, recipientKs: { ...f.recipientKs, value } } : f);
  };
  const confirmRecipient = () => {
    setFacts((f) => f ? { ...f, recipientKs: confirmFact(f.recipientKs, f.recipientKs.value) } : f);
  };
  const updateFrequency = (value: ContributionFrequency) => {
    setFacts((f) => f ? { ...f, frequency: confirmFact(f.frequency, value) } : f);
  };

  // ─── ONE_TO_MANY fact updaters ────────────────────────────────
  const updateRecipients = (value: RecipientEntry[]) => {
    setFacts((f) => f ? { ...f, recipients: { ...f.recipients, value } } : f);
  };
  const confirmRecipients = () => {
    setFacts((f) => f ? { ...f, recipients: confirmFact(f.recipients, f.recipients.value) } : f);
  };
  const updateAllocationMode = (value: 'equal' | 'custom') => {
    setFacts((f) => {
      if (!f) return f;
      const updated = { ...f, allocationMode: confirmFact(f.allocationMode, value) };
      if (value === 'equal') {
        const amountMatch = f.intent.amount.match(/[\d,]+/);
        const total = amountMatch ? Number(amountMatch[0].replace(/,/g, '')) : null;
        if (total && f.recipients.value.length > 0) {
          const perMinor = Math.floor((total * 100) / f.recipients.value.length);
          updated.recipients = { ...updated.recipients, value: f.recipients.value.map((r) => ({ ...r, allocationMinor: perMinor })) };
        }
      }
      return updated;
    });
  };
  const updateRecipientAllocations = (updated: RecipientEntry[]) => {
    setFacts((f) => f ? { ...f, recipients: { ...f.recipients, value: updated } } : f);
  };

  // ─── MANY_TO_MANY fact updaters ───────────────────────────────
  const updateContributionJoinMode = (value: 'invite' | 'share_link') => {
    setFacts((f) => f ? { ...f, contributionJoinMode: confirmFact(f.contributionJoinMode, value) } : f);
  };
  const updateGovernanceMode = (value: 'creator_managed' | 'committee') => {
    setFacts((f) => f ? { ...f, governanceMode: proposeFact(f.governanceMode, value) } : f);
  };

  // ─── Submit to backend ────────────────────────────────────────
  const submit = async () => {
    if (submittingRef.current) return;
    if (!topologySupported) return;

    // Local journey preview: exercise the full creation engine and UI without
    // authentication or backend writes. The next screen hands off to
    // fixture-backed workspace and operational previews.
    if (previewMode) {
      setSubmitError(null);
      setScreen('created');
      return;
    }

    submittingRef.current = true;
    setSubmitError(null);
    setSubmitting(true);

    try {
      if (topology === 'MANY_TO_ONE') {
        await submitManyToOne();
      } else if (topology === 'ONE_TO_MANY') {
        await submitOneToMany();
      } else if (topology === 'MANY_TO_MANY') {
        await submitManyToMany();
      } else {
        await submitOneToOne();
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // ─── Submit: ONE_TO_ONE ───────────────────────────────────────
  const submitOneToOne = async () => {
    const amountMatch = intent.amount.match(/[\d,]+/);
    const parsedAmount = amountMatch ? Number(amountMatch[0].replace(/,/g, '')) : null;
    const hasAmount = parsedAmount !== null && parsedAmount > 0 && Number.isSafeInteger(Math.round(parsedAmount * 100));

    const filledStages = facts.stages.value.filter((s) => s.label.trim());
    const stageDesc = filledStages.length > 0
      ? filledStages.map((s, i) => `${i + 1}. ${s.label.trim()}${s.amount.trim() ? ` (KES ${s.amount.trim()})` : ''}`).join(' · ')
      : null;
    const confirmerDesc = facts.confirmer.value === 'me' ? 'Confirmed by creator' : 'Confirmed by someone else (to be designated)';
    const payerDesc = facts.payerIsCreator.value === true ? 'Creator is the payer' : facts.payerIsCreator.value === false ? 'Counterparty is the payer' : 'Payer to be determined';
    const description = [payerDesc, stageDesc, confirmerDesc].filter(Boolean).join('. ') + '.';

    const result = await createAgreement(
      {
        idempotencyKey: idempotencyKeyRef.current,
        agreementType: 'GENERIC',
        title: intent.what,
        purpose: intent.statement,
        description,
        currency: hasAmount ? 'KES' : undefined,
        proposedAmountMinor: hasAmount ? Math.round(parsedAmount! * 100) : undefined,
        saveAsDraft: false,
      },
      session?.accessToken,
    );

    if (!result.ok || !result.data) {
      setSubmitError(result.error || 'Something went wrong. Please try again.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      createdAgreementId: authorizeFact(f.createdAgreementId, result.data!.id),
      createdPublicReference: authorizeFact(f.createdPublicReference, result.data!.publicReference),
    } : f);

    if (filledStages.length > 0) {
      try {
        const versionsResult = await listAgreementVersions(result.data.id, session?.accessToken);
        const currentVersion = versionsResult.ok && versionsResult.data
          ? versionsResult.data.find((v) => v.versionStatus === 'CURRENT')
          : null;

        if (currentVersion) {
          let saved = 0;
          for (let i = 0; i < filledStages.length; i++) {
            const msResult = await createAgreementMilestone(
              result.data.id,
              currentVersion.id,
              { title: filledStages[i].label.trim(), sequenceOrder: i + 1 },
              session?.accessToken,
            );
            if (msResult.ok) saved++;
          }
          setFacts((f) => f ? {
            ...f,
            milestonesSaved: authorizeFact(f.milestonesSaved, saved),
            milestonesFailed: authorizeFact(f.milestonesFailed, saved < filledStages.length),
          } : f);
        }
      } catch {
        setFacts((f) => f ? { ...f, milestonesFailed: authorizeFact(f.milestonesFailed, true) } : f);
      }
    }

    const trimmedKs = facts.counterpartyKs.value.trim();
    if (trimmedKs) {
      const inviteResult = await issueAgreementInvitation(
        result.data.id,
        { idempotencyKey: crypto.randomUUID(), roleCode: 'COUNTERPARTY', intendedKsNumber: trimmedKs },
        session?.accessToken,
      );
      if (inviteResult.ok && inviteResult.data) {
        setFacts((f) => f ? { ...f, invitationConfirmed: authorizeFact(f.invitationConfirmed, true) } : f);
      }
    }

    setScreen('created');
    clearCreationIntent();
    clearCreationDraft();
  };

  // ─── Submit: MANY_TO_ONE (Group SecureLink) ───────────────────
  const submitManyToOne = async () => {
    const amountMatch = (facts.targetAmount.value || intent.amount).match(/[\d,]+/);
    const parsedAmount = amountMatch ? Number(amountMatch[0].replace(/,/g, '')) : null;
    const hasAmount = parsedAmount !== null && parsedAmount > 0 && Number.isSafeInteger(Math.round(parsedAmount * 100));

    const knownContributors = facts.contributors.value.filter((c) => c.ksNumber.trim());
    const splitDesc = facts.contributionMode.value === 'equal' ? 'Equal split' : 'Custom amounts';
    const freqDesc = facts.frequency.value ? `Frequency: ${facts.frequency.value}` : '';
    const recipientDesc = facts.recipientKs.value.trim() ? `Recipient KS: ${facts.recipientKs.value.trim()}` : 'Recipient to be invited';
    const contributorDesc = knownContributors.length > 0
      ? `Contributors added: ${knownContributors.map((c) => c.ksNumber.trim()).join(', ')}`
      : `Contributors to be invited${facts.contributorCount.value ? ` (${facts.contributorCount.value})` : ''}`;
    const description = [splitDesc, freqDesc, recipientDesc, contributorDesc].filter(Boolean).join('. ') + '.';

    // Step 1: Create the base agreement
    const agreementResult = await createAgreement(
      {
        idempotencyKey: idempotencyKeyRef.current,
        agreementType: 'GENERIC',
        title: intent.what,
        purpose: intent.statement,
        description,
        currency: hasAmount ? 'KES' : undefined,
        proposedAmountMinor: hasAmount ? Math.round(parsedAmount! * 100) : undefined,
        saveAsDraft: false,
      },
      session?.accessToken,
    );

    if (!agreementResult.ok || !agreementResult.data) {
      setSubmitError(agreementResult.error || 'Something went wrong creating the agreement. Please try again.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      createdAgreementId: authorizeFact(f.createdAgreementId, agreementResult.data!.id),
      createdPublicReference: authorizeFact(f.createdPublicReference, agreementResult.data!.publicReference),
    } : f);

    // Step 2: Create the Group SecureLink on top of the agreement
    const groupResult = await createGroupSecureLink(
      agreementResult.data.id,
      {
        groupType: intent.family === 'life' ? 'WELFARE' : 'GENERAL',
        title: intent.what,
        statedPurpose: intent.statement,
        targetType: hasAmount ? 'FIXED_AMOUNT' : 'OPEN_ENDED',
        targetAmountMinor: hasAmount ? Math.round(parsedAmount! * 100) : undefined,
      },
      session?.accessToken,
    );

    if (!groupResult.ok || !groupResult.data) {
      setSubmitError(groupResult.error || 'The agreement was created but the group contribution setup could not be completed. You can finish from the agreement workspace.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      groupSecureLinkId: authorizeFact(f.groupSecureLinkId, groupResult.data!.groupSecureLinkId),
    } : f);

    // Step 3: Issue a public locator (contribution link) if available
    const locatorResult = await issueGroupSecureLinkPublicLocator(
      agreementResult.data.id,
      { idempotencyKey: crypto.randomUUID() },
      session?.accessToken,
    );

    if (locatorResult.ok && locatorResult.data) {
      setFacts((f) => f ? {
        ...f,
        publicLocatorSlug: authorizeFact(f.publicLocatorSlug, locatorResult.data!.slug),
      } : f);
    }

    setScreen('created');
    clearCreationIntent();
    clearCreationDraft();
  };

  // ─── Submit: ONE_TO_MANY (SecureFlow) ─────────────────────────
  const submitOneToMany = async () => {
    const amountMatch = intent.amount.match(/[\d,]+/);
    const parsedAmount = amountMatch ? Number(amountMatch[0].replace(/,/g, '')) : null;
    const hasAmount = parsedAmount !== null && parsedAmount > 0 && Number.isSafeInteger(Math.round(parsedAmount * 100));
    const totalMinor = hasAmount ? Math.round(parsedAmount! * 100) : 0;

    const recipientList = facts.recipients.value.filter((r) => r.label.trim());
    const resolvedRecipients = recipientList.filter(isRecipientResolved);
    const unresolvedRecipients = recipientList.filter((r) => !isRecipientResolved(r));

    const splitDesc = facts.allocationMode.value === 'equal' ? 'Equal split' : 'Custom amounts';
    const recipientDesc = recipientList.map((r) =>
      `${r.label.trim()}${r.ksNumber.trim() ? ` (KS: ${r.ksNumber.trim()})` : ' (identity pending)'}${r.obligation.trim() ? ` — ${r.obligation.trim()}` : ''}`
    ).join('; ');
    const payerDesc = facts.payerIsCreator.value === true ? 'Creator is the payer' : 'Payer to be determined';
    const description = [payerDesc, splitDesc, recipientDesc].filter(Boolean).join('. ') + '.';

    // Step 1: Create the base agreement
    const agreementResult = await createAgreement(
      {
        idempotencyKey: idempotencyKeyRef.current,
        agreementType: 'GENERIC',
        title: intent.what,
        purpose: intent.statement,
        description,
        currency: hasAmount ? 'KES' : undefined,
        proposedAmountMinor: hasAmount ? totalMinor : undefined,
        saveAsDraft: false,
      },
      session?.accessToken,
    );

    if (!agreementResult.ok || !agreementResult.data) {
      setSubmitError(agreementResult.error || 'Something went wrong creating the agreement. Please try again.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      createdAgreementId: authorizeFact(f.createdAgreementId, agreementResult.data!.id),
      createdPublicReference: authorizeFact(f.createdPublicReference, agreementResult.data!.publicReference),
      secureFlowStage: authorizeFact(f.secureFlowStage, 'agreement_created'),
    } : f);

    // If any recipient lacks a KSNumber, stop here.
    // The backend requires a genuine beneficiaryKsNumber for every allocation.
    // We do NOT fabricate placeholders. The agreement exists as a draft;
    // the trader resolves identities from the agreement workspace.
    if (unresolvedRecipients.length > 0) {
      setScreen('created');
      clearCreationIntent();
      clearCreationDraft();
      return;
    }

    // All recipients resolved — proceed to distribution plan.
    const planResult = await createDistributionPlan(
      agreementResult.data.id,
      {
        idempotencyKey: crypto.randomUUID(),
        moneyFlowType: 'SECURE_FLOW',
        distributableAmountMinor: totalMinor,
      },
      session?.accessToken,
    );

    if (!planResult.ok || !planResult.data) {
      setSubmitError(planResult.error || 'The agreement was created but the distribution plan could not be set up. You can finish from the agreement workspace.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      distributionPlanId: authorizeFact(f.distributionPlanId, planResult.data!.plan.id),
      distributionPlanVersionId: authorizeFact(f.distributionPlanVersionId, planResult.data!.version.id),
      secureFlowStage: authorizeFact(f.secureFlowStage, 'plan_created'),
    } : f);

    // Set allocations — all recipients are resolved at this point.
    const allocations = resolvedRecipients.map((r, i) => {
      const amountMinor = r.allocationMinor ?? (facts.allocationMode.value === 'equal' ? Math.floor(totalMinor / resolvedRecipients.length) : 0);
      return {
        allocationReference: `alloc-${i + 1}`,
        sequenceNumber: i + 1,
        allocationMode: 'FIXED_AMOUNT' as const,
        amountMinor,
        beneficiaryKsNumber: r.ksNumber.trim(),
        purposeTitle: r.label.trim(),
        purposeDescription: r.obligation.trim() || r.label.trim(),
      };
    });

    const amendResult = await amendDistributionPlanAllocations(
      agreementResult.data.id,
      planResult.data.plan.id,
      planResult.data.version.planVersion,
      { idempotencyKey: crypto.randomUUID(), allocations },
      session?.accessToken,
    );

    if (!amendResult.ok || !amendResult.data) {
      setSubmitError(amendResult.error || 'The agreement was created but allocations could not be set. You can finish from the agreement workspace.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      secureFlowStage: authorizeFact(f.secureFlowStage, 'allocations_set'),
    } : f);

    // Submit the plan (moves it from draft to submitted)
    const submitResult = await submitDistributionPlan(
      agreementResult.data.id,
      planResult.data.plan.id,
      planResult.data.version.planVersion,
      { idempotencyKey: crypto.randomUUID() },
      session?.accessToken,
    );

    if (submitResult.ok) {
      setFacts((f) => f ? {
        ...f,
        secureFlowStage: authorizeFact(f.secureFlowStage, 'submitted'),
      } : f);
    }

    setScreen('created');
    clearCreationIntent();
    clearCreationDraft();
  };

  // ─── Submit: MANY_TO_MANY (Group SecureFlow) ──────────────────
  //
  // Backend creation sequence for Group SecureFlow:
  //   1. Create agreement (always proceeds — it's the container)
  //   2. Create Group SecureLink (the contribution/join structure)
  //   3. Issue public locator (contribution link) if join_mode is share_link
  //   4. Create distribution plan (SECURE_FLOW moneyFlowType)
  //   5. Set allocations — ONLY if all recipients have genuine KSNumbers
  //   6. Submit distribution plan — only if step 5 succeeded
  //
  // If any recipient lacks a KSNumber, stop after step 2 or 3.
  // The agreement and group structure exist; the distribution plan
  // waits for recipient identities. No placeholder KSNumbers.
  const submitManyToMany = async () => {
    const perPersonMinor = facts.contributionAmountPerPerson.value;
    const expectedTotalMinor = facts.expectedTotalMinor.value;
    const totalMinor = expectedTotalMinor ?? 0;

    const recipientList = facts.recipients.value.filter((r) => r.label.trim());
    const resolvedRecipients = recipientList.filter(isRecipientResolved);
    const unresolvedRecipients = recipientList.filter((r) => !isRecipientResolved(r));

    const contributorDesc = facts.contributorCount.value
      ? `${facts.contributorCount.value} contributors`
      : 'Contributors to be determined';
    const perPersonDesc = perPersonMinor ? `KES ${Math.floor(perPersonMinor / 100).toLocaleString()} per person` : '';
    const joinDesc = facts.contributionJoinMode.value === 'share_link' ? 'Share link' : facts.contributionJoinMode.value === 'invite' ? 'Invite' : '';
    const splitDesc = facts.allocationMode.value === 'equal' ? 'Equal split' : 'Custom amounts';
    const governanceDesc = facts.governanceMode.value === 'creator_managed' ? 'Creator-managed approval' : facts.governanceMode.value === 'committee' ? 'Committee approval' : '';
    const recipientDesc = recipientList.map((r) =>
      `${r.label.trim()}${r.ksNumber.trim() ? ` (KS: ${r.ksNumber.trim()})` : ' (identity pending)'}${r.obligation.trim() ? ` — ${r.obligation.trim()}` : ''}`
    ).join('; ');
    const description = [contributorDesc, perPersonDesc, joinDesc, splitDesc, governanceDesc, recipientDesc].filter(Boolean).join('. ') + '.';

    // Step 1: Create the base agreement
    const agreementResult = await createAgreement(
      {
        idempotencyKey: idempotencyKeyRef.current,
        agreementType: 'GENERIC',
        title: intent.what,
        purpose: intent.statement,
        description,
        currency: totalMinor > 0 ? 'KES' : undefined,
        proposedAmountMinor: totalMinor > 0 ? totalMinor : undefined,
        saveAsDraft: false,
      },
      session?.accessToken,
    );

    if (!agreementResult.ok || !agreementResult.data) {
      setSubmitError(agreementResult.error || 'Something went wrong creating the agreement. Please try again.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      createdAgreementId: authorizeFact(f.createdAgreementId, agreementResult.data!.id),
      createdPublicReference: authorizeFact(f.createdPublicReference, agreementResult.data!.publicReference),
      groupSecureFlowStage: authorizeFact(f.groupSecureFlowStage, 'agreement_created'),
    } : f);

    // Step 2: Create the Group SecureLink (contribution/join structure)
    const groupResult = await createGroupSecureLink(
      agreementResult.data.id,
      {
        groupType: intent.family === 'life' ? 'WELFARE' : 'GENERAL',
        title: intent.what,
        statedPurpose: intent.statement,
        targetType: totalMinor > 0 ? 'FIXED_AMOUNT' : 'OPEN_ENDED',
        targetAmountMinor: totalMinor > 0 ? totalMinor : undefined,
      },
      session?.accessToken,
    );

    if (!groupResult.ok || !groupResult.data) {
      setSubmitError(groupResult.error || 'The agreement was created but the group contribution setup could not be completed. You can finish from the agreement workspace.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      groupSecureLinkId: authorizeFact(f.groupSecureLinkId, groupResult.data!.groupSecureLinkId),
      groupSecureFlowStage: authorizeFact(f.groupSecureFlowStage, 'group_created'),
    } : f);

    // Step 3: Issue public locator (contribution link) if share_link mode
    if (facts.contributionJoinMode.value === 'share_link') {
      const locatorResult = await issueGroupSecureLinkPublicLocator(
        agreementResult.data.id,
        { idempotencyKey: crypto.randomUUID() },
        session?.accessToken,
      );

      if (locatorResult.ok && locatorResult.data) {
        setFacts((f) => f ? {
          ...f,
          publicLocatorSlug: authorizeFact(f.publicLocatorSlug, locatorResult.data!.slug),
        } : f);
      }
    }

    // If any recipient lacks a KSNumber, stop here.
    // The backend requires a genuine beneficiaryKsNumber for every allocation.
    if (unresolvedRecipients.length > 0) {
      setFacts((f) => f ? {
        ...f,
        groupSecureFlowStage: authorizeFact(f.groupSecureFlowStage, 'awaiting_identities'),
      } : f);
      setScreen('created');
      clearCreationIntent();
      clearCreationDraft();
      return;
    }

    // All recipients resolved — proceed to distribution plan.
    const planResult = await createDistributionPlan(
      agreementResult.data.id,
      {
        idempotencyKey: crypto.randomUUID(),
        moneyFlowType: 'SECURE_FLOW',
        distributableAmountMinor: totalMinor,
      },
      session?.accessToken,
    );

    if (!planResult.ok || !planResult.data) {
      setSubmitError(planResult.error || 'The agreement and group were created but the distribution plan could not be set up. You can finish from the agreement workspace.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      distributionPlanId: authorizeFact(f.distributionPlanId, planResult.data!.plan.id),
      distributionPlanVersionId: authorizeFact(f.distributionPlanVersionId, planResult.data!.version.id),
      groupSecureFlowStage: authorizeFact(f.groupSecureFlowStage, 'plan_created'),
    } : f);

    // Step 5: Set allocations — all recipients are resolved at this point.
    const allocations = resolvedRecipients.map((r, i) => {
      const amountMinor = r.allocationMinor ?? (facts.allocationMode.value === 'equal' ? Math.floor(totalMinor / resolvedRecipients.length) : 0);
      return {
        allocationReference: `alloc-${i + 1}`,
        sequenceNumber: i + 1,
        allocationMode: 'FIXED_AMOUNT' as const,
        amountMinor,
        beneficiaryKsNumber: r.ksNumber.trim(),
        purposeTitle: r.label.trim(),
        purposeDescription: r.obligation.trim() || r.label.trim(),
      };
    });

    const amendResult = await amendDistributionPlanAllocations(
      agreementResult.data.id,
      planResult.data.plan.id,
      planResult.data.version.planVersion,
      { idempotencyKey: crypto.randomUUID(), allocations },
      session?.accessToken,
    );

    if (!amendResult.ok || !amendResult.data) {
      setSubmitError(amendResult.error || 'The agreement was created but allocations could not be set. You can finish from the agreement workspace.');
      return;
    }

    setFacts((f) => f ? {
      ...f,
      groupSecureFlowStage: authorizeFact(f.groupSecureFlowStage, 'allocations_set'),
    } : f);

    // Step 6: Submit the plan
    const submitPlanResult = await submitDistributionPlan(
      agreementResult.data.id,
      planResult.data.plan.id,
      planResult.data.version.planVersion,
      { idempotencyKey: crypto.randomUUID() },
      session?.accessToken,
    );

    if (submitPlanResult.ok) {
      setFacts((f) => f ? {
        ...f,
        groupSecureFlowStage: authorizeFact(f.groupSecureFlowStage, 'submitted'),
      } : f);
    }

    setScreen('created');
    clearCreationIntent();
    clearCreationDraft();
  };
  if (previewMode && screen === 'created') {
    const workspaceFixture =
      topology === 'MANY_TO_ONE' ? 'gsl-active'
        : topology === 'ONE_TO_MANY' ? 'sf-identities-missing'
          : topology === 'MANY_TO_MANY' ? 'gsf-link-ready'
            : 'sl-invited';

    const operationalFixture =
      topology === 'MANY_TO_ONE' ? 'ops-gsl-partial'
        : topology === 'ONE_TO_MANY' ? 'ops-sf-multi'
          : topology === 'MANY_TO_MANY' ? 'ops-gsf-payout'
            : 'ops-sl-fund';

    const structureName =
      topology === 'MANY_TO_ONE' ? 'Group SecureLink'
        : topology === 'ONE_TO_MANY' ? 'SecureFlow'
          : topology === 'MANY_TO_MANY' ? 'Group SecureFlow'
            : 'SecureLink';

    return (
      <div className="min-h-screen bg-[#fffdf8] flex flex-col">
        <header className="flex items-center justify-between px-4 h-14 border-b border-[#e9e7e1]">
          <Link to="/preview/home" aria-label="SecurePay home">
            <LivingSecurePayMark state="guiding" size="sm" presence="polite" />
          </Link>
          <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-700">
            Interactive preview · no backend writes
          </span>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-sm space-y-5 text-center">
            <div className="flex justify-center">
              <LivingSecurePayMark state="complete" size="lg" presence="present" label="Agreement creation preview is complete" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#3a7a1f]">{structureName}</p>
              <h1 className="font-display text-2xl font-medium text-[#1a1a1a]">Your agreement is ready to continue</h1>
              <p className="text-sm leading-6 text-[#1a1a1a]/55">
                You have just experienced the real SecurePay creation questions for this type of agreement.
                In preview mode nothing has been written to the backend.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1a1a1a]/8 bg-white p-4 text-left shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/35">What you started with</p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#1a1a1a]/75">{intent.statement}</p>
              <div className="mt-3 grid gap-2 border-t border-[#1a1a1a]/6 pt-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[#1a1a1a]/45">Understood as</span>
                  <span className="text-right font-semibold text-[#1a1a1a]/75">{intent.what}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[#1a1a1a]/45">Amount</span>
                  <span className="text-right font-semibold text-[#3a7a1f]">{intent.amount}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[#1a1a1a]/45">Structure</span>
                  <span className="text-right font-semibold text-[#1a1a1a]/75">{structureName}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to={`/preview/workspace?fixture=${workspaceFixture}`}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-5 text-sm font-semibold text-white hover:bg-[#2d6018]"
              >
                Enter the agreement workspace <ArrowRight size={16} />
              </Link>
              <Link
                to={`/preview/operational?fixture=${operationalFixture}`}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3a7a1f]/20 bg-[#f4f8ef] px-5 text-sm font-semibold text-[#315f1c]"
              >
                Jump ahead to the working journey <ArrowRight size={16} />
              </Link>
              <Link
                to="/preview/journeys"
                className="block w-full rounded-xl border border-[#1a1a1a]/10 py-3 text-sm font-medium text-[#1a1a1a]/60"
              >
                Try another journey
              </Link>
            </div>

            <p className="text-[11px] leading-5 text-[#1a1a1a]/35">
              Preview states are illustrative. Identity, money, Payment Ready, release and settlement truth remain backend-authoritative in the live product.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'created' && facts.createdAgreementId.value) {
    const filledStages = facts.stages.value.filter((s) => s.label.trim());
    const isGroup = topology === 'MANY_TO_ONE';
    const isFlow = topology === 'ONE_TO_MANY';
    const isGroupFlow = topology === 'MANY_TO_MANY';
    const slug = facts.publicLocatorSlug.value;
    const flowStage = facts.secureFlowStage.value;
    const groupFlowStage = facts.groupSecureFlowStage.value;
    const recipientList = facts.recipients.value.filter((r) => r.label.trim());
    const resolvedCount = recipientList.filter(isRecipientResolved).length;
    const unresolvedCount = recipientList.length - resolvedCount;
    const contributionLink = slug ? `${window.location.origin}/group/${slug}` : null;

    const copyLink = () => {
      if (contributionLink) {
        void navigator.clipboard.writeText(contributionLink).then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        });
      }
    };

    return (
      <div className="min-h-screen bg-[#fffdf8] flex flex-col">
        <header className="flex items-center px-4 h-14 border-b border-[#e9e7e1]">
          <Link to="/" aria-label="SecurePay home">
            <LivingSecurePayMark state="guiding" size="sm" presence="polite" />
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
          <div className="w-full max-w-sm space-y-6 text-center">
            <div className="flex justify-center">
              <LivingSecurePayMark state="complete" size="lg" presence="commanding" label="SecurePay confirms the agreement was created" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-medium text-[#1a1a1a]">Agreement created</h1>
              <p className="text-sm font-mono text-[#1a1a1a]/60">{facts.createdPublicReference.value}</p>
            </div>

            <div className="text-left rounded-xl bg-white border border-[#1a1a1a]/8 p-4 space-y-2">
              {isFlow ? (
                <>
                  {flowStage === 'submitted' && (
                    <p className="text-sm text-[#3a7a1f]">
                      Agreement created. Distribution plan submitted.
                      {resolvedCount > 0 && ` ${resolvedCount} recipient${resolvedCount === 1 ? '' : 's'} with SecurePay identity.`}
                    </p>
                  )}
                  {flowStage === 'allocations_set' && (
                    <p className="text-sm text-amber-700">
                      Agreement and distribution plan created. Allocations set but not yet submitted.
                      You can finish from the agreement workspace.
                    </p>
                  )}
                  {flowStage === 'plan_created' && (
                    <p className="text-sm text-amber-700">
                      Agreement and distribution plan created. Allocations not yet set.
                      You can finish from the agreement workspace.
                    </p>
                  )}
                  {flowStage === 'agreement_created' && (
                    <>
                      <p className="text-sm text-[#1a1a1a]/70">
                        Agreement created. Distribution plan is waiting for recipient identities.
                      </p>
                      <div className="pt-2 border-t border-[#1a1a1a]/5 space-y-1.5">
                        {recipientList.map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[#1a1a1a]/70">{r.label.trim()}</span>
                            {isRecipientResolved(r) ? (
                              <span className="text-[#3a7a1f] font-mono text-xs">{r.ksNumber.trim()}</span>
                            ) : (
                              <span className="text-amber-600 text-xs">Needs SecurePay identity</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[#1a1a1a]/45 pt-2 border-t border-[#1a1a1a]/5">
                        Next: Add SecurePay identities for {unresolvedCount} recipient{unresolvedCount === 1 ? '' : 's'} to complete the distribution plan.
                      </p>
                    </>
                  )}
                </>
              ) : isGroupFlow ? (
                <>
                  {groupFlowStage === 'submitted' && (
                    <p className="text-sm text-[#3a7a1f]">
                      Agreement and group created. Distribution plan submitted.
                      {resolvedCount > 0 && ` ${resolvedCount} recipient${resolvedCount === 1 ? '' : 's'} with SecurePay identity.`}
                    </p>
                  )}
                  {groupFlowStage === 'allocations_set' && (
                    <p className="text-sm text-amber-700">
                      Agreement, group and distribution plan created. Allocations set but not yet submitted.
                      You can finish from the agreement workspace.
                    </p>
                  )}
                  {groupFlowStage === 'plan_created' && (
                    <p className="text-sm text-amber-700">
                      Agreement and group created. Distribution plan created but allocations not yet set.
                      You can finish from the agreement workspace.
                    </p>
                  )}
                  {groupFlowStage === 'awaiting_identities' && (
                    <>
                      <p className="text-sm text-[#1a1a1a]/70">
                        Agreement and group created. Distribution plan is waiting for recipient identities.
                      </p>
                      <div className="pt-2 border-t border-[#1a1a1a]/5 space-y-1.5">
                        {recipientList.map((r, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-[#1a1a1a]/70">{r.label.trim()}</span>
                            {isRecipientResolved(r) ? (
                              <span className="text-[#3a7a1f] font-mono text-xs">{r.ksNumber.trim()}</span>
                            ) : (
                              <span className="text-amber-600 text-xs">Needs SecurePay identity</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[#1a1a1a]/45 pt-2 border-t border-[#1a1a1a]/5">
                        Next: Add SecurePay identities for {unresolvedCount} recipient{unresolvedCount === 1 ? '' : 's'} to complete the distribution plan.
                      </p>
                    </>
                  )}
                  {groupFlowStage === 'group_created' && (
                    <p className="text-sm text-amber-700">
                      Agreement and group contribution structure created. Distribution plan not yet set up.
                      You can finish from the agreement workspace.
                    </p>
                  )}
                  {(groupFlowStage === 'agreement_created') && (
                    <p className="text-sm text-amber-700">
                      Agreement created. The group contribution setup could not be completed.
                      You can finish from the agreement workspace.
                    </p>
                  )}
                  {slug && contributionLink && (
                    <div className="pt-2 border-t border-[#1a1a1a]/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-1">Contribution link</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-[#3a7a1f] bg-[#f6faf2] rounded-md px-2 py-1.5 truncate">{contributionLink}</code>
                        <button
                          type="button"
                          onClick={copyLink}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#3a7a1f]/10 text-[#3a7a1f] hover:bg-[#3a7a1f]/20 transition-colors"
                          aria-label="Copy contribution link"
                        >
                          {linkCopied ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : isGroup ? (
                <>
                  <p className="text-sm text-[#1a1a1a]/70">
                    {facts.contributorCount.value ?? 0} contributor{facts.contributorCount.value === 1 ? '' : 's'} can be invited now.
                  </p>
                  {slug && contributionLink && (
                    <div className="pt-2 border-t border-[#1a1a1a]/5">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-1">Contribution link</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-[#3a7a1f] bg-[#f6faf2] rounded-md px-2 py-1.5 truncate">{contributionLink}</code>
                        <button
                          type="button"
                          onClick={copyLink}
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#3a7a1f]/10 text-[#3a7a1f] hover:bg-[#3a7a1f]/20 transition-colors"
                          aria-label="Copy contribution link"
                        >
                          {linkCopied ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>
                  )}
                  {!slug && (
                    <p className="text-sm text-amber-700 pt-2 border-t border-[#1a1a1a]/5">
                      The contribution link could not be generated right now. You can share from the agreement workspace.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {facts.invitationConfirmed.value ? (
                    <p className="text-sm text-[#1a1a1a]/70">
                      An invitation has been sent to {facts.counterpartyKs.value.trim()}.
                    </p>
                  ) : facts.counterpartyKs.value.trim() ? (
                    <p className="text-sm text-amber-700">
                      The invitation to {facts.counterpartyKs.value.trim()} could not be completed right now. You can invite them from the agreement workspace.
                    </p>
                  ) : (
                    <p className="text-sm text-[#1a1a1a]/70">
                      Add or invite the other trader next, from the agreement workspace.
                    </p>
                  )}

                  {filledStages.length > 0 && (
                    <div className="pt-2 border-t border-[#1a1a1a]/5">
                      {facts.milestonesSaved.value > 0 && !facts.milestonesFailed.value && (
                        <p className="text-sm text-[#3a7a1f]">
                          {facts.milestonesSaved.value} milestone{facts.milestonesSaved.value === 1 ? '' : 's'} saved to the agreement.
                        </p>
                      )}
                      {facts.milestonesFailed.value && (
                        <p className="text-sm text-amber-700">
                          Some milestones could not be saved. You can add them from the agreement workspace.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              {isFlow && (
                <Link to={`/agreements/${facts.createdAgreementId.value}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a]/8 hover:bg-[#1a1a1a]/12 text-[#1a1a1a] font-semibold text-sm py-3 rounded-xl transition-all duration-200">
                  Invite recipients <ArrowRight size={16} />
                </Link>
              )}
              {isGroupFlow && slug && contributionLink && (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Join our ${intent.what} on SecurePay: ${contributionLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a]/8 hover:bg-[#1a1a1a]/12 text-[#1a1a1a] font-semibold text-sm py-3 rounded-xl transition-all duration-200"
                >
                  <Share2 size={16} /> Share link
                </a>
              )}
              {isGroup && slug && contributionLink && (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Join our ${intent.what} on SecurePay: ${contributionLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a]/8 hover:bg-[#1a1a1a]/12 text-[#1a1a1a] font-semibold text-sm py-3 rounded-xl transition-all duration-200"
                >
                  <Share2 size={16} /> Share link
                </a>
              )}
              <Link to={`/agreements/${facts.createdAgreementId.value}`}
                className="flex items-center justify-center gap-2 w-full bg-[#3a7a1f] hover:bg-[#2d6018] text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200">
                View agreement <ArrowRight size={16} />
              </Link>
              <Link to="/"
                className="block w-full py-3 rounded-xl border border-[#1a1a1a]/12 text-[#1a1a1a]/70 font-medium text-sm hover:bg-[#1a1a1a]/5 transition-colors text-center">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Screen: Unsupported topology ─────────────────────────────
  if (screen === 'unsupported') {
    return (
      <CreationShell
        markState="caution"
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={() => { window.location.href = '/'; }}
            nextLabel="Back to Home"
            onBack={goBack}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle
            icon={<Info size={20} />}
            title="This agreement type is coming soon"
            subtitle={`${TOPOLOGY_LABELS[topology]} creation isn't available yet.`}
          />
          <div className="rounded-xl bg-white border border-[#1a1a1a]/8 p-4 space-y-2">
            <p className="text-sm text-[#1a1a1a]/70">
              SecurePay understood your intent: <strong>{intent.what}</strong>.
            </p>
            <p className="text-sm text-[#1a1a1a]/70">
              The {TOPOLOGY_LABELS[topology]} structure — {facts.topology.reason.replace(/"/g, '')} —
              will be available in an upcoming release. Your conversation details have been saved
              so you can pick up where you left off.
            </p>
          </div>
          <InfoDisclaimer>
            No agreement has been created. No backend writes were made. This is a safe boundary.
          </InfoDisclaimer>
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Understood ───────────────────────────────────────
  if (screen === 'understood') {
    return (
      <CreationShell
        markState="listening"
        current={pos}
        total={total}
        onBack={undefined}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            nextLabel="Continue"
          />
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#3a7a1f]">SecurePay understood</p>
            <h1 className="font-display text-2xl font-medium leading-tight text-[#1a1a1a]">{intent.what}</h1>
          </div>
          <div className="bg-white rounded-xl border border-[#1a1a1a]/8 shadow-sm p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Amount</span>
              <span className="text-lg font-bold text-[#3a7a1f]">{intent.amount}</span>
            </div>
            {intent.mustHappen && (
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 shrink-0">What must happen</span>
                <span className="text-sm text-[#1a1a1a]/70 text-right">{intent.mustHappen}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 pt-2 border-t border-[#1a1a1a]/5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 shrink-0">Who</span>
              <span className="text-sm text-[#1a1a1a]/70 text-right">{intent.who}</span>
            </div>
          </div>
          <p className="text-sm text-[#1a1a1a]/55 text-center">Is this right?</p>
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Payer ────────────────────────────────────────────
  if (screen === 'payer') {
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            onBack={goBack}
            nextDisabled={facts.payerIsCreator.value === null}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle title="Are you the one paying?" subtitle="This helps SecurePay understand your role." />
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => updatePayerIsCreator(true)}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                facts.payerIsCreator.value === true
                  ? 'border-[#3a7a1f] bg-[#f0f7eb]'
                  : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/30'
              }`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                facts.payerIsCreator.value === true ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'
              }`}>
                <Check size={18} />
              </div>
              <div className="text-left">
                <span className="block font-medium text-sm text-[#1a1a1a]">Yes, I'm paying</span>
                <span className="block text-xs text-[#1a1a1a]/45 mt-0.5">I am the payer</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => updatePayerIsCreator(false)}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
                facts.payerIsCreator.value === false
                  ? 'border-[#3a7a1f] bg-[#f0f7eb]'
                  : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/30'
              }`}
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
                facts.payerIsCreator.value === false ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'
              }`}>
                <User size={18} />
              </div>
              <div className="text-left">
                <span className="block font-medium text-sm text-[#1a1a1a]">No, someone else is paying</span>
                <span className="block text-xs text-[#1a1a1a]/45 mt-0.5">The other person is the payer</span>
              </div>
            </button>
          </div>
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Counterparty ─────────────────────────────────────
  if (screen === 'counterparty') {
    const handleNext = () => {
      confirmCounterparty();
      goNext();
    };
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={handleNext}
            onBack={goBack}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle
            icon={<User size={20} />}
            title={meta.title}
            subtitle="Enter their KSNumber. You can also skip this and add them later."
          />
          <KsnInput
            value={facts.counterpartyKs.value}
            onChange={updateCounterpartyKs}
          />
          <InfoDisclaimer>
            SecurePay doesn't verify this before creating the invitation. Only someone signed in
            with this exact KSNumber can join.
          </InfoDisclaimer>
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Stages ───────────────────────────────────────────
  if (screen === 'stages') {
    const handleNext = () => {
      confirmStages();
      goNext();
    };
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={handleNext}
            onBack={goBack}
          />
        }
      >
        <div className="space-y-3">
          <QuestionTitle
            icon={<Wrench size={20} />}
            title={meta.title}
            subtitle="Optional — you can skip this."
          />
          <CompactStageEditor
            stages={facts.stages.value}
            onChange={updateStages}
          />
          <InfoDisclaimer>
            Stages are saved as milestones on the agreement. They are not release conditions —
            when money moves is decided separately by SecurePay's backend.
          </InfoDisclaimer>
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Confirmer ────────────────────────────────────────
  if (screen === 'confirmer') {
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            onBack={goBack}
            nextDisabled={facts.confirmer.value === null}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle
            title={meta.title}
            subtitle="This is your preference for who should confirm the work is done."
          />
          <ConfirmerChoice
            value={facts.confirmer.value}
            onChange={updateConfirmer}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Contributors (MANY_TO_ONE) ───────────────────────
  if (screen === 'contributors') {
    const handleNext = () => {
      confirmContributors();
      goNext();
    };
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={handleNext}
            onBack={goBack}
          />
        }
      >
        <div className="space-y-3">
          <QuestionTitle
            icon={<Users size={20} />}
            title={meta.title}
            subtitle={facts.contributorCount.value
              ? `${facts.contributorCount.value} contributors understood from your request. Add KSNumbers now or invite later.`
              : 'Add KSNumbers now or invite everyone later.'}
          />
          <ContributorEditor
            contributors={facts.contributors.value}
            onChange={updateContributors}
            knownCount={facts.contributorCount.value}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Split (MANY_TO_ONE) ──────────────────────────────
  if (screen === 'split') {
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            onBack={goBack}
            nextDisabled={facts.contributionMode.value === null}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle
            title={meta.title}
            subtitle="This helps contributors know what to expect."
          />
          <ContributionSplitChoice
            value={facts.contributionMode.value}
            onChange={updateContributionMode}
            totalDisplay={facts.targetAmount.value || intent.amount}
            contributorCount={facts.contributorCount.value}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Recipient (MANY_TO_ONE) ──────────────────────────
  if (screen === 'recipient') {
    const handleNext = () => {
      confirmRecipient();
      goNext();
    };
    const whoLower = intent.who.toLowerCase();
    let recipientWord = 'the recipient';
    if (whoLower.includes('mum')) recipientWord = 'Mum';
    else if (whoLower.includes('guardian')) recipientWord = 'the guardian';
    else if (whoLower.includes('organizer')) recipientWord = 'the organizer';
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={handleNext}
            onBack={goBack}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle
            icon={<User size={20} />}
            title={meta.title}
            subtitle={`Enter ${recipientWord}'s KSNumber. You can also skip this and add them later.`}
          />
          <RecipientInput
            value={facts.recipientKs.value}
            onChange={updateRecipientKs}
            recipientLabel={recipientWord}
          />
          <InfoDisclaimer>
            Adding a KSNumber here sends an invitation. It doesn't mean they've joined or accepted.
            Only the backend can confirm participation.
          </InfoDisclaimer>
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Frequency (MANY_TO_ONE) ──────────────────────────
  if (screen === 'frequency') {
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            onBack={goBack}
            nextDisabled={facts.frequency.value === null}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle
            title={meta.title}
            subtitle="How often should contributions be collected?"
          />
          <FrequencyChoice
            value={facts.frequency.value}
            onChange={updateFrequency}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Recipients (ONE_TO_MANY) ────────────────────────
  if (screen === 'recipients') {
    const handleNext = () => {
      confirmRecipients();
      goNext();
    };
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={handleNext}
            onBack={goBack}
          />
        }
      >
        <div className="space-y-3">
          <QuestionTitle
            icon={<Users size={20} />}
            title={meta.title}
            subtitle={facts.recipientCount.value
              ? `${facts.recipientCount.value} recipients understood from your request. Add KSNumbers now or invite later.`
              : 'Add recipients and their KSNumbers. You can also invite later.'}
          />
          <RecipientListEditor
            recipients={facts.recipients.value}
            onChange={updateRecipients}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Allocation (ONE_TO_MANY) ─────────────────────────
  if (screen === 'allocation') {
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            onBack={goBack}
            nextDisabled={facts.allocationMode.value === null}
          />
        }
      >
        <div className="space-y-4">
          <QuestionTitle
            title={meta.title}
            subtitle="This helps recipients know what to expect."
          />
          <AllocationChoice
            value={facts.allocationMode.value}
            onChange={updateAllocationMode}
            recipients={facts.recipients.value}
            onRecipientAllocationsChange={updateRecipientAllocations}
            totalDisplay={intent.amount}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Obligations (ONE_TO_MANY) ────────────────────────
  if (screen === 'obligations') {
    const handleNext = () => {
      confirmRecipients(); // obligations are part of recipients fact
      goNext();
    };
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={handleNext}
            onBack={goBack}
          />
        }
      >
        <div className="space-y-3">
          <QuestionTitle
            title={meta.title}
            subtitle="What should each person deliver or complete?"
          />
          <ObligationEditor
            recipients={facts.recipients.value}
            onChange={updateRecipientAllocations}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Join mode (MANY_TO_MANY) ─────────────────────────
  if (screen === 'join_mode') {
    const perPersonDisplay = facts.contributionAmountPerPerson.value
      ? `KES ${Math.floor(facts.contributionAmountPerPerson.value / 100).toLocaleString()}`
      : intent.amount;
    const expectedTotalDisplay = facts.expectedTotalMinor.value
      ? `KES ${Math.floor(facts.expectedTotalMinor.value / 100).toLocaleString()}`
      : null;
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            onBack={goBack}
            nextDisabled={facts.contributionJoinMode.value === null}
          />
        }
      >
        <div className="space-y-3">
          <QuestionTitle
            icon={<Users size={20} />}
            title={meta.title}
            subtitle={facts.contributorCount.value
              ? `${facts.contributorCount.value} people understood from your request.`
              : 'How will people join this group?'}
          />
          <ContributionJoinChoice
            value={facts.contributionJoinMode.value}
            onChange={updateContributionJoinMode}
            contributorCount={facts.contributorCount.value}
            perPersonDisplay={perPersonDisplay}
            expectedTotalDisplay={expectedTotalDisplay}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Governance (MANY_TO_MANY) ────────────────────────
  if (screen === 'governance') {
    return (
      <CreationShell
        current={pos}
        total={total}
        onBack={goBack}
        showMemory
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={memoryExpanded}
        onMemoryToggle={() => setMemoryExpanded((v) => !v)}
        bottomAction={
          <CreationBottomAction
            onNext={goNext}
            onBack={goBack}
            nextDisabled={facts.governanceMode.value === null}
          />
        }
      >
        <div className="space-y-3">
          <QuestionTitle
            icon={<ShieldCheck size={20} />}
            title={meta.title}
            subtitle="This is your preference. The backend manages the actual approval policy."
          />
          <GovernanceChoice
            value={facts.governanceMode.value}
            onChange={updateGovernanceMode}
          />
        </div>
      </CreationShell>
    );
  }

  // ─── Screen: Review ───────────────────────────────────────────
  if (screen === 'review') {
    const handleCreate = () => {
      if (topologySupported) {
        void submit();
      } else {
        setScreen('unsupported');
      }
    };
    const isGroup = topology === 'MANY_TO_ONE';
    const isFlow = topology === 'ONE_TO_MANY';
    const isGroupFlow = topology === 'MANY_TO_MANY';
    return (
      <CreationShell
        markState="guiding"
        current={pos}
        total={total}
        onBack={goBack}
        bottomAction={
          <CreationBottomAction
            onNext={handleCreate}
            nextLabel={topologySupported ? 'Create agreement' : 'Continue'}
            onBack={goBack}
            loading={submitting}
            loadingLabel="Creating…"
          />
        }
      >
        <div className="space-y-3">
          <QuestionTitle title={isGroupFlow ? `Your ${intent.what.toLowerCase().includes('school') ? 'school trip' : intent.what.toLowerCase().includes('security') ? 'security' : 'group'} agreement is ready` : isFlow ? 'Your renovation agreement is ready' : isGroup ? 'Your family support agreement is ready' : 'Your agreement is ready'} />
          {isGroupFlow
            ? <CompactGroupFlowReview facts={facts} submitError={submitError} />
            : isFlow
              ? <CompactFlowReview facts={facts} submitError={submitError} />
              : isGroup
                ? <CompactGroupReview facts={facts} submitError={submitError} />
                : <CompactReview facts={facts} submitError={submitError} />}
        </div>
      </CreationShell>
    );
  }

  return null;
}
