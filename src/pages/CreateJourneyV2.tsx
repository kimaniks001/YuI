import { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  clearCreationIntent,
  loadCreationIntent,
  type CreationIntent,
} from '../lib/creationIntent';
import {
  agreementQuality,
  buildAgreementBlueprint,
  formatAmountFromMinor,
  parseKenyanAmountMinor,
  serializeAgreementDescription,
  type AgreementBlueprint,
  type AgreementCheck,
  type AgreementCheckKind,
  type AgreementStage,
} from '../lib/agreementIntelligence';
import type { AgreementTopology } from '../lib/agreementTopology';
import {
  createAgreement,
  createAgreementMilestone,
  createGroupSecureLink,
  issueAgreementInvitation,
  listAgreementVersions,
} from '../api/securepayEndpoints';
import {
  amendDistributionPlanAllocations,
  createDistributionPlan,
  submitDistributionPlan,
} from '../api/secureflowEndpoints';
import type { DistributionAllocationRequestBody } from '../api/secureflowTypes';
import { inputCls } from '../components/creation';

// Agreement Intelligence V2
// -------------------------
// This journey is deliberately not a checkout. It helps a trader turn intent
// into a sufficiently clear agreement proposal before any later money action.
// The frontend never declares Payment Ready, release, settlement, quorum or
// financial truth. Those remain backend-authoritative.

interface CreateJourneyV2Props {
  previewMode?: boolean;
}

type StepId = 'understood' | 'people' | 'deal' | 'timing' | 'stages' | 'checks' | 'details' | 'review' | 'created';

interface RecipientDraft {
  id: string;
  label: string;
  ksNumber: string;
  amountText: string;
  obligation: string;
}

interface CreatedResult {
  agreementId: string | null;
  publicReference: string | null;
  milestonesSaved: number;
  groupStructureCreated: boolean;
  distributionPlanCreated: boolean;
  warnings: string[];
  preview: boolean;
}

function topologyFromCounts(payers: number, recipients: number): AgreementTopology {
  if (payers > 1 && recipients > 1) return 'MANY_TO_MANY';
  if (payers > 1) return 'MANY_TO_ONE';
  if (recipients > 1) return 'ONE_TO_MANY';
  return 'ONE_TO_ONE';
}

function topologySentence(topology: AgreementTopology): string {
  switch (topology) {
    case 'ONE_TO_ONE': return 'One person pays one person.';
    case 'MANY_TO_ONE': return 'Several people contribute toward one recipient or purpose.';
    case 'ONE_TO_MANY': return 'One payer will distribute money to several recipients.';
    case 'MANY_TO_MANY': return 'Several people contribute and the agreement distributes money to several recipients.';
  }
}

function topologyShort(topology: AgreementTopology): string {
  switch (topology) {
    case 'ONE_TO_ONE': return '1 → 1';
    case 'MANY_TO_ONE': return 'many → 1';
    case 'ONE_TO_MANY': return '1 → many';
    case 'MANY_TO_MANY': return 'many → many';
  }
}

function checkKindLabel(kind: AgreementCheckKind): string {
  switch (kind) {
    case 'PERFORMANCE': return '1 · What happened';
    case 'EVIDENCE': return '2 · What proves it';
    case 'ACCEPTANCE': return '3 · Who can accept it';
    case 'CUSTOM': return 'Extra check';
  }
}

function toIsoDateOnly(date: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  // Agreement Core currently accepts Instants for milestone timing while the
  // customer gives us a date, not a timezone-specific clock time. Keep the
  // customer date in the milestone description and do not fabricate an exact
  // hour here. A future date-only backend field can carry it precisely.
  return undefined;
}

function initialRecipients(count: number): RecipientDraft[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    id: crypto.randomUUID(),
    label: `Recipient ${index + 1}`,
    ksNumber: '',
    amountText: '',
    obligation: '',
  }));
}

function resizeRecipients(current: RecipientDraft[], count: number): RecipientDraft[] {
  if (count <= current.length) return current.slice(0, count);
  return [
    ...current,
    ...Array.from({ length: count - current.length }, (_, index) => ({
      id: crypto.randomUUID(),
      label: `Recipient ${current.length + index + 1}`,
      ksNumber: '',
      amountText: '',
      obligation: '',
    })),
  ];
}

function InlineAuthGate({ onAuthed, onCancel }: { onAuthed: () => void; onCancel: () => void }) {
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
    <div className="rounded-3xl border border-[#1a1a1a]/10 bg-white p-5 sm:p-7 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#3a7a1f]/10 text-[#3a7a1f]">
            <LockKeyhole size={19} />
          </div>
          <h2 className="font-display text-2xl font-medium text-[#1a1a1a]">{otpStep ? 'Enter your code' : 'Your agreement is still here'}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#1a1a1a]/55">
            {otpStep
              ? 'Complete sign-in. Nothing you agreed in this journey will be thrown away.'
              : 'SecurePay only asks you to identify yourself when the real agreement proposal is about to be recorded.'}
          </p>
        </div>
        <button type="button" onClick={onCancel} className="text-xs font-semibold text-[#1a1a1a]/45 hover:text-[#1a1a1a]">Back to review</button>
      </div>

      {error && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-3 rounded-xl border border-[#3a7a1f]/15 bg-[#f4f8ef] px-3 py-2.5 text-sm text-[#315f1c]">{notice}</div>}

      {!otpStep ? (
        <div className="space-y-3">
          <input className={inputCls} aria-label="KSNumber" placeholder="KSNumber, e.g. KS2145" value={ksNumber} onChange={(event) => setKsNumber(event.target.value)} autoComplete="username" />
          <div className="relative">
            <input className={`${inputCls} pr-11`} aria-label="Password" placeholder="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void submitCredentials()} autoComplete="current-password" />
            <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a1a]/35">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="button" onClick={() => void submitCredentials()} disabled={loading || !ksNumber.trim() || !password} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-5 text-sm font-semibold text-white disabled:opacity-40">
            Continue <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input className={`${inputCls} text-center font-mono tracking-[0.3em]`} aria-label="Verification code" placeholder="Code" value={otp} onChange={(event) => setOtp(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void verify()} autoComplete="one-time-code" />
          <button type="button" onClick={() => void verify()} disabled={loading || !otp.trim()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-5 text-sm font-semibold text-white disabled:opacity-40">
            <ShieldCheck size={16} /> Verify & return to agreement
          </button>
          <div className="flex items-center justify-between text-xs">
            <button type="button" onClick={() => { cancelChallenge(); setOtp(''); setError(''); setNotice(''); }} className="text-[#1a1a1a]/45 hover:text-[#1a1a1a]">Use different sign-in</button>
            <button type="button" onClick={async () => { setLoading(true); const err = await resendChallenge(); setLoading(false); if (err) setError(err); else setNotice('A new code has been sent.'); }} className="font-semibold text-[#3a7a1f] hover:underline">Resend code</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3a7a1f]">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-medium leading-tight text-[#173d27] sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#1a1a1a]/58 sm:text-[15px]">{body}</p>
    </div>
  );
}

function Notice({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' }) {
  const cls = tone === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : 'border-[#cfe2c2] bg-[#f5f9f1] text-[#315f1c]';
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${cls}`}>{children}</div>;
}

function BottomNav({ back, next, nextLabel = 'Continue', disabled = false }: { back?: () => void; next: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#1a1a1a]/8 pt-5">
      {back ? <button type="button" onClick={back} className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-[#1a1a1a]/55 hover:text-[#1a1a1a]"><ArrowLeft size={15} /> Back</button> : <span />}
      <button type="button" onClick={next} disabled={disabled} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173d27] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35">
        {nextLabel} <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default function CreateJourneyV2({ previewMode = false }: CreateJourneyV2Props) {
  const location = useLocation();
  const { session } = useAuth();
  const [intent] = useState<CreationIntent | null>(() => {
    const routeIntent = (location.state as { intent?: CreationIntent } | null)?.intent ?? null;
    return routeIntent ?? loadCreationIntent();
  });
  const [blueprint, setBlueprint] = useState<AgreementBlueprint | null>(() => intent ? buildAgreementBlueprint(intent) : null);
  const [obligationSummary, setObligationSummary] = useState(() => intent?.mustHappen && !/SecurePay will ask/i.test(intent.mustHappen) ? intent.mustHappen : '');
  const [exceptionPlan, setExceptionPlan] = useState('If a required condition is not met or the evidence is disputed, this payment point stays incomplete while the parties record what happened and use the agreement issue/review process.');
  const [primaryCounterpartyKs, setPrimaryCounterpartyKs] = useState('');
  const [recipientDrafts, setRecipientDrafts] = useState<RecipientDraft[]>(() => blueprint && blueprint.recipientCount > 1 ? initialRecipients(blueprint.recipientCount) : []);
  const [step, setStep] = useState<StepId>('understood');
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [authGate, setAuthGate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const idempotencyKey = useRef(crypto.randomUUID());

  const hasStages = !!blueprint && blueprint.stages.length > 0;
  const steps = useMemo<StepId[]>(() => [
    'understood', 'people', 'deal', 'timing',
    ...(hasStages ? ['stages' as StepId] : []),
    'checks', 'details', 'review',
  ], [hasStages]);
  const stepIndex = Math.max(0, steps.indexOf(step));

  if (!intent || !blueprint) {
    return (
      <div className="min-h-screen bg-[#fffdf8] px-4 py-20 text-center">
        <LivingSecurePayMark state="guiding" size="md" presence="polite" />
        <h1 className="mt-5 font-display text-2xl text-[#173d27]">Tell SecurePay what you want to agree first.</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#1a1a1a]/55">The agreement journey works from your real intent rather than starting with an empty form.</p>
        <Link to={previewMode ? '/preview/home' : '/'} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#3a7a1f]">Go to Home <ArrowRight size={14} /></Link>
      </div>
    );
  }

  const quality = agreementQuality(blueprint);
  const extraBlocking = [
    ...(obligationSummary.trim().length < 8 ? ['Describe the main work, delivery, responsibility or purpose that must be completed.'] : []),
    ...(exceptionPlan.trim().length < 12 ? ['Say what should happen when a required condition is not met or is disputed.'] : []),
    ...((blueprint.recipientCount > 1 && recipientDrafts.some((recipient) => recipient.label.trim().length < 2 || recipient.obligation.trim().length < 5))
      ? ['For each recipient, say who they are and what their allocation is for.'] : []),
  ];
  const allBlocking = [...quality.blocking, ...extraBlocking];
  const qualityReady = allBlocking.length === 0;

  const updateCounts = (field: 'payerCount' | 'recipientCount', raw: string) => {
    const value = Math.max(1, Math.min(50, Number.parseInt(raw || '1', 10) || 1));
    setBlueprint((current) => {
      if (!current) return current;
      const next = { ...current, [field]: value };
      next.topology = topologyFromCounts(next.payerCount, next.recipientCount);
      return next;
    });
    if (field === 'recipientCount') {
      setRecipientDrafts((current) => value > 1 ? resizeRecipients(current, value) : []);
    }
  };

  const updateStage = (id: string, patch: Partial<AgreementStage>) => {
    setBlueprint((current) => current ? { ...current, stages: current.stages.map((stage) => stage.id === id ? { ...stage, ...patch } : stage) } : current);
  };

  const addStage = () => {
    setBlueprint((current) => current ? {
      ...current,
      stages: [...current.stages, { id: crypto.randomUUID(), label: '', amountText: '', dueDate: '', completionEvidence: '' }],
    } : current);
  };

  const removeStage = (id: string) => {
    setBlueprint((current) => current ? { ...current, stages: current.stages.filter((stage) => stage.id !== id) } : current);
  };

  const updateCheck = (id: string, patch: Partial<AgreementCheck>) => {
    setBlueprint((current) => current ? { ...current, checks: current.checks.map((check) => check.id === id ? { ...check, ...patch } : check) } : current);
  };

  const addCheck = () => {
    setBlueprint((current) => current ? {
      ...current,
      checks: [...current.checks, {
        id: crypto.randomUUID(),
        kind: 'CUSTOM',
        title: 'Additional agreement check',
        condition: '',
        evidence: '',
        confirmer: '',
      }],
    } : current);
  };

  const removeCheck = (id: string) => {
    setBlueprint((current) => {
      if (!current || current.checks.length <= 2) return current;
      return { ...current, checks: current.checks.filter((check) => check.id !== id) };
    });
  };

  const updateRecipient = (id: string, patch: Partial<RecipientDraft>) => {
    setRecipientDrafts((current) => current.map((recipient) => recipient.id === id ? { ...recipient, ...patch } : recipient));
  };

  const go = (direction: 1 | -1) => {
    const index = steps.indexOf(step);
    const target = steps[index + direction];
    if (target) setStep(target);
  };

  const ensureStageScreen = () => {
    if (blueprint.stages.length === 0) {
      setBlueprint({
        ...blueprint,
        stages: [{ id: crypto.randomUUID(), label: '', amountText: '', dueDate: '', completionEvidence: '' }],
      });
    }
  };

  const descriptionForSubmit = () => {
    const recipientText = recipientDrafts.length > 0
      ? `\nRecipients / allocations proposed:\n${recipientDrafts.map((recipient, index) => `${index + 1}. ${recipient.label}${recipient.ksNumber.trim() ? ` (${recipient.ksNumber.trim().toUpperCase()})` : ' (identity to be confirmed)'}${recipient.amountText.trim() ? ` — ${recipient.amountText.trim()}` : ''}\n   Obligation/purpose: ${recipient.obligation.trim() || 'To be clarified'}`).join('\n')}`
      : '';
    return `${serializeAgreementDescription(intent, blueprint)}\nMain obligation / purpose: ${obligationSummary.trim()}\nIf a required condition is not met: ${exceptionPlan.trim()}${recipientText}`;
  };

  const tryCreateDistributionPlan = async (
    agreementId: string,
    groupSecureLinkId: string | null,
    warnings: string[],
  ): Promise<boolean> => {
    if (blueprint.topology !== 'ONE_TO_MANY' && blueprint.topology !== 'MANY_TO_MANY') return false;
    if (!blueprint.amountMinor) {
      warnings.push('Distribution plan was not created because the total amount is not yet clear. The agreement proposal was still recorded.');
      return false;
    }
    if (recipientDrafts.length === 0 || recipientDrafts.some((recipient) => !/^KS\d{3,}$/i.test(recipient.ksNumber.trim()))) {
      warnings.push('Distribution plan was not created yet because every recipient needs a real KSNumber. The agreement proposal keeps the intended recipients and obligations for later completion.');
      return false;
    }

    const recipientAmounts = recipientDrafts.map((recipient) => parseKenyanAmountMinor(recipient.amountText));
    if (recipientAmounts.some((amount) => amount === null)) {
      warnings.push('Distribution plan was not created yet because each recipient needs an agreed allocation amount. The agreement proposal was still recorded.');
      return false;
    }
    const totalAllocations = recipientAmounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
    if (totalAllocations !== blueprint.amountMinor) {
      warnings.push('Distribution plan was not created because the recipient allocations do not yet add up to the agreement amount. Nothing was guessed.');
      return false;
    }

    const planResult = await createDistributionPlan(
      agreementId,
      {
        idempotencyKey: crypto.randomUUID(),
        moneyFlowType: blueprint.topology === 'MANY_TO_MANY' ? 'GROUP_SECURE_FLOW' : 'SECURE_FLOW',
        distributableAmountMinor: blueprint.amountMinor,
        groupSecureLinkId: blueprint.topology === 'MANY_TO_MANY' ? groupSecureLinkId : undefined,
      },
      session?.accessToken,
    );
    if (!planResult.ok || !planResult.data) {
      warnings.push('The agreement was recorded, but SecurePay could not create its distribution plan yet. No allocation was treated as funded or payable.');
      return false;
    }

    const allocations: DistributionAllocationRequestBody[] = recipientDrafts.map((recipient, index) => ({
      allocationReference: `recipient-${index + 1}`,
      sequenceNumber: index + 1,
      allocationMode: 'FIXED_AMOUNT',
      amountMinor: recipientAmounts[index]!,
      beneficiaryKsNumber: recipient.ksNumber.trim().toUpperCase(),
      purposeTitle: recipient.label.trim(),
      purposeDescription: recipient.obligation.trim(),
    }));

    const amendResult = await amendDistributionPlanAllocations(
      agreementId,
      planResult.data.plan.id,
      planResult.data.version.planVersion,
      { idempotencyKey: crypto.randomUUID(), allocations },
      session?.accessToken,
    );
    if (!amendResult.ok || !amendResult.data) {
      warnings.push('The agreement was recorded, but its proposed allocations could not yet be saved to the distribution plan.');
      return false;
    }

    const submitResult = await submitDistributionPlan(
      agreementId,
      amendResult.data.plan.id,
      amendResult.data.version.planVersion,
      { idempotencyKey: crypto.randomUUID() },
      session?.accessToken,
    );
    if (!submitResult.ok) {
      warnings.push('The distribution plan exists but was not submitted. SecurePay has not treated it as locked, funded or ready to pay.');
      return false;
    }
    return true;
  };

  const submit = async () => {
    setSubmitError(null);
    if (!qualityReady || !reviewConfirmed || submitting) return;

    if (previewMode) {
      setCreated({ agreementId: null, publicReference: 'TRAINER PREVIEW', milestonesSaved: 0, groupStructureCreated: false, distributionPlanCreated: false, warnings: ['Trainer/preview mode created no Market record and moved no money.'], preview: true });
      setStep('created');
      return;
    }

    if (!session?.accessToken) {
      setAuthGate(true);
      return;
    }

    setSubmitting(true);
    const warnings: string[] = [];
    try {
      const result = await createAgreement({
        idempotencyKey: idempotencyKey.current,
        agreementType: 'GENERIC',
        title: intent.what,
        purpose: intent.statement,
        description: descriptionForSubmit(),
        currency: blueprint.amountMinor ? blueprint.currency : undefined,
        proposedAmountMinor: blueprint.amountMinor ?? undefined,
        saveAsDraft: false,
      }, session.accessToken);

      if (!result.ok || !result.data) {
        setSubmitError(result.error ?? 'SecurePay could not record this agreement proposal. Your answers are still here.');
        return;
      }

      let milestonesSaved = 0;
      if (blueprint.stages.length > 0) {
        const versions = await listAgreementVersions(result.data.id, session.accessToken);
        const currentVersion = versions.ok && versions.data
          ? versions.data.find((version) => version.versionStatus === 'CURRENT') ?? versions.data[0]
          : null;

        if (!currentVersion) {
          warnings.push('The agreement was recorded, but its stages could not yet be attached as milestones.');
        } else {
          for (let index = 0; index < blueprint.stages.length; index += 1) {
            const stage = blueprint.stages[index];
            const milestone = await createAgreementMilestone(
              result.data.id,
              currentVersion.id,
              {
                title: stage.label.trim(),
                description: [
                  stage.amountText.trim() ? `Proposed stage amount: ${stage.amountText.trim()}` : '',
                  stage.dueDate ? `Trader-agreed date: ${stage.dueDate}` : '',
                  `Completion evidence: ${stage.completionEvidence.trim()}`,
                ].filter(Boolean).join('. '),
                sequenceOrder: index + 1,
                availableFrom: toIsoDateOnly(blueprint.startDate),
                dueAt: toIsoDateOnly(stage.dueDate || blueprint.targetDate),
              },
              session.accessToken,
            );
            if (milestone.ok) milestonesSaved += 1;
          }
          if (milestonesSaved < blueprint.stages.length) warnings.push('Some stages were preserved in the agreement text but could not yet be attached as backend milestones.');
        }
      }

      if (blueprint.topology === 'ONE_TO_ONE' && /^KS\d{3,}$/i.test(primaryCounterpartyKs.trim())) {
        const invitation = await issueAgreementInvitation(
          result.data.id,
          { idempotencyKey: crypto.randomUUID(), roleCode: 'COUNTERPARTY', intendedKsNumber: primaryCounterpartyKs.trim().toUpperCase() },
          session.accessToken,
        );
        if (!invitation.ok) warnings.push('The agreement was recorded, but the counterparty invitation was not issued yet.');
      }

      let groupStructureCreated = false;
      let groupSecureLinkId: string | null = null;
      if (blueprint.topology === 'MANY_TO_ONE' || blueprint.topology === 'MANY_TO_MANY') {
        const group = await createGroupSecureLink(
          result.data.id,
          {
            groupType: intent.family === 'life' ? 'WELFARE' : 'GENERAL',
            title: intent.what,
            statedPurpose: intent.statement,
            targetType: blueprint.amountMinor ? 'FIXED_AMOUNT' : 'OPEN_ENDED',
            targetAmountMinor: blueprint.amountMinor ?? undefined,
          },
          session.accessToken,
        );
        if (group.ok && group.data) {
          groupStructureCreated = true;
          groupSecureLinkId = group.data.groupSecureLinkId;
        } else {
          warnings.push('The agreement was recorded, but its group contribution structure could not yet be created. No contribution link or funding truth was invented.');
        }
      }

      const distributionPlanCreated = await tryCreateDistributionPlan(result.data.id, groupSecureLinkId, warnings);

      clearCreationIntent();
      setCreated({
        agreementId: result.data.id,
        publicReference: result.data.publicReference,
        milestonesSaved,
        groupStructureCreated,
        distributionPlanCreated,
        warnings,
        preview: false,
      });
      setStep('created');
    } catch {
      setSubmitError('SecurePay could not finish recording this proposal. Your answers remain on this screen; no successful payment or release should be inferred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'created' && created) {
    return (
      <div className="min-h-screen bg-[#fffdf8] px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <Link to={previewMode ? '/preview/home' : '/'} className="inline-flex items-center gap-2 text-sm font-semibold text-[#3a7a1f]"><LivingSecurePayMark state="resting" size="sm" presence="polite" /> SecurePay</Link>
          <div className="mt-8 rounded-3xl border border-[#cfe2c2] bg-white p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4e2] text-[#3a7a1f]"><CheckCircle2 size={23} /></div>
            <h1 className="mt-5 font-display text-3xl font-medium text-[#173d27]">{created.preview ? 'Strong agreement review complete.' : 'Agreement proposal recorded.'}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#1a1a1a]/58">
              {created.preview
                ? 'This was a simulated journey. It shows how SecurePay should shape the agreement without creating Market truth.'
                : 'SecurePay has recorded what you proposed. That does not mean money is funded, Payment Ready, released or settled. Those states come only from backend-authorised agreement and money events.'}
            </p>
            {created.publicReference && <div className="mt-5 rounded-2xl bg-[#f7f8f4] px-4 py-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/40">Agreement reference</span><strong className="mt-1 block text-[#173d27]">{created.publicReference}</strong></div>}
            {!created.preview && blueprint.stages.length > 0 && <p className="mt-4 text-sm text-[#1a1a1a]/60">{created.milestonesSaved} of {blueprint.stages.length} stage{blueprint.stages.length === 1 ? '' : 's'} attached as backend milestones.</p>}
            {created.warnings.length > 0 && <div className="mt-5 space-y-2">{created.warnings.map((warning) => <Notice key={warning} tone="amber">{warning}</Notice>)}</div>}
            <div className="mt-6 flex flex-wrap gap-3">
              {!created.preview && created.agreementId && <Link to={`/agreements/${created.agreementId}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#173d27] px-5 text-sm font-semibold text-white">Open agreement <ArrowRight size={15} /></Link>}
              <Link to={previewMode ? '/preview/home' : '/'} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#1a1a1a]/10 bg-white px-5 text-sm font-semibold text-[#1a1a1a]/70">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authGate) {
    return (
      <div className="min-h-screen bg-[#fffdf8] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <InlineAuthGate onCancel={() => setAuthGate(false)} onAuthed={() => { setAuthGate(false); setSubmitError('Sign-in is complete. Your agreement is unchanged — confirm once more to record it.'); }} />
        </div>
      </div>
    );
  }

  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#1a1a1a]">
      <header className="border-b border-[#1a1a1a]/8 bg-[#fffdf8]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link to={previewMode ? '/preview/home' : '/'} className="inline-flex items-center gap-2 text-sm font-semibold text-[#173d27]"><LivingSecurePayMark state="guiding" size="sm" presence="polite" /> SecurePay</Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-[#1a1a1a]/45 sm:inline">Agreement strength, not checkout speed</span>
            <span className="rounded-full bg-[#eef5e8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3a7a1f]">{topologyShort(blueprint.topology)}</span>
          </div>
        </div>
        <div className="mx-auto mt-3 h-1 max-w-3xl overflow-hidden rounded-full bg-[#1a1a1a]/7"><div className="h-full rounded-full bg-[#3a7a1f] transition-all" style={{ width: `${progress}%` }} /></div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-7 sm:py-10">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-[#1a1a1a]/48">
          <span className="rounded-full border border-[#1a1a1a]/8 bg-white px-3 py-1.5">{blueprint.amountText || 'Amount to confirm'}</span>
          <span className="rounded-full border border-[#1a1a1a]/8 bg-white px-3 py-1.5">{blueprint.payerCount + blueprint.recipientCount} people/roles currently expected</span>
          <span className="rounded-full border border-[#1a1a1a]/8 bg-white px-3 py-1.5">{blueprint.checks.length} checks before money should move</span>
        </div>

        {step === 'understood' && <>
          <SectionTitle eyebrow="SecurePay understood" title="Start with the deal you actually described." body="I will keep what you already told me, then ask only for the missing facts needed to make this a strong agreement." />
          <div className="rounded-3xl border border-[#cfe2c2] bg-[#f7fbf4] p-5 sm:p-6">
            <p className="text-lg font-medium leading-relaxed text-[#173d27]">“{intent.statement}”</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Fact icon={<Users size={17} />} label="People" value={intent.who} />
              <Fact icon={<Banknote size={17} />} label="Money" value={blueprint.amountText || 'Still to confirm'} />
              <Fact icon={<ClipboardCheck size={17} />} label="Flow" value={topologySentence(blueprint.topology)} />
            </div>
          </div>
          {blueprint.stagesExplicitlyUnderstood && blueprint.stages.length > 0 && <div className="mt-4"><Notice><strong>You already gave the stages.</strong> SecurePay is using {blueprint.stages.map((stage) => stage.label).join(' → ')}. I will not ask whether stages would help; I’ll help you make each stage clear.</Notice></div>}
          <div className="mt-4"><Notice>Money does not move because this screen looks complete. We are shaping the agreement first; backend authority later decides which money actions are actually available.</Notice></div>
          <BottomNav next={() => go(1)} nextLabel="Build the agreement" />
        </>}

        {step === 'people' && <>
          <SectionTitle eyebrow="1 · People" title="Who is actually trading?" body="A safe agreement should be clear about the people and roles on both sides. Names, business roles and KSNumbers can be added where you know them." />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-[#173d27]">How many are paying/contributing?<input type="number" min={1} max={50} className={inputCls} value={blueprint.payerCount} onChange={(event) => updateCounts('payerCount', event.target.value)} /></label>
            <label className="space-y-1.5 text-sm font-semibold text-[#173d27]">How many receive money/value?<input type="number" min={1} max={50} className={inputCls} value={blueprint.recipientCount} onChange={(event) => updateCounts('recipientCount', event.target.value)} /></label>
          </div>
          <label className="mt-4 block space-y-1.5 text-sm font-semibold text-[#173d27]">People, businesses and roles<textarea className={`${inputCls} min-h-28 resize-y`} value={blueprint.parties} onChange={(event) => setBlueprint({ ...blueprint, parties: event.target.value })} placeholder="e.g. Me (homeowner/payer) → ABC Builders (contractor). Quantity surveyor will inspect stage completion." /></label>
          {blueprint.topology === 'ONE_TO_ONE' && <label className="mt-4 block space-y-1.5 text-sm font-semibold text-[#173d27]">Counterparty KSNumber <span className="font-normal text-[#1a1a1a]/40">(if already known)</span><input className={inputCls} value={primaryCounterpartyKs} onChange={(event) => setPrimaryCounterpartyKs(event.target.value.toUpperCase())} placeholder="e.g. KS1234" /></label>}
          {(blueprint.topology === 'ONE_TO_MANY' || blueprint.topology === 'MANY_TO_MANY') && <div className="mt-5 space-y-3">
            <div><h3 className="font-semibold text-[#173d27]">Who are the recipients?</h3><p className="mt-1 text-xs leading-relaxed text-[#1a1a1a]/48">SecurePay can record the agreement before every KSNumber is known. A real distribution plan is only submitted when recipient identities and allocation amounts are complete; nothing is guessed.</p></div>
            {recipientDrafts.map((recipient, index) => <div key={recipient.id} className="rounded-2xl border border-[#1a1a1a]/9 bg-white p-4">
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#3a7a1f]">Recipient {index + 1}</div>
              <div className="grid gap-2 sm:grid-cols-2"><input className={inputCls} value={recipient.label} onChange={(event) => updateRecipient(recipient.id, { label: event.target.value })} placeholder="Name / role" /><input className={inputCls} value={recipient.ksNumber} onChange={(event) => updateRecipient(recipient.id, { ksNumber: event.target.value.toUpperCase() })} placeholder="KSNumber if known" /></div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2"><input className={inputCls} value={recipient.amountText} onChange={(event) => updateRecipient(recipient.id, { amountText: event.target.value })} placeholder="Allocation, e.g. KES 50,000" /><input className={inputCls} value={recipient.obligation} onChange={(event) => updateRecipient(recipient.id, { obligation: event.target.value })} placeholder="What is this allocation for?" /></div>
            </div>)}
          </div>}
          <div className="mt-4"><Notice><strong>{topologySentence(blueprint.topology)}</strong> If those counts are wrong, change them here and SecurePay changes the money-flow structure quietly.</Notice></div>
          <BottomNav back={() => go(-1)} next={() => go(1)} />
        </>}

        {step === 'deal' && <>
          <SectionTitle eyebrow="2 · Deal" title="What is the money for, and how much is at stake?" body="This is where the agreement becomes specific. SecurePay should know the value involved and the main obligation before asking how completion will be checked." />
          <label className="block space-y-1.5 text-sm font-semibold text-[#173d27]">Agreement amount<input className={inputCls} value={blueprint.amountText} onChange={(event) => { const amountText = event.target.value; setBlueprint({ ...blueprint, amountText, amountMinor: parseKenyanAmountMinor(amountText) }); }} placeholder="e.g. KES 6,000,000 or 4000ksh" /></label>
          {blueprint.amountText && !blueprint.amountMinor && <p className="mt-2 text-xs font-medium text-amber-700">I can’t safely read that amount yet. Write the currency and amount clearly; I won’t guess.</p>}
          <label className="mt-5 block space-y-1.5 text-sm font-semibold text-[#173d27]">What must the other side / participants actually do?<textarea className={`${inputCls} min-h-32 resize-y`} value={obligationSummary} onChange={(event) => setObligationSummary(event.target.value)} placeholder="Describe the item, work, service, contribution purpose, quantity, quality or responsibility that matters." /></label>
          {!hasStages && <button type="button" onClick={ensureStageScreen} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#3a7a1f]/20 bg-[#f6faf2] px-4 py-2.5 text-sm font-semibold text-[#315f1c]"><Plus size={15} /> This agreement should use stages</button>}
          <div className="mt-4"><Notice>The amount and obligations are agreement proposals. A proposed amount is not evidence that money has been funded, reserved, released or settled.</Notice></div>
          <BottomNav back={() => go(-1)} next={() => go(1)} disabled={!blueprint.amountMinor || obligationSummary.trim().length < 8} />
        </>}

        {step === 'timing' && <>
          <SectionTitle eyebrow="3 · Timing" title="When does this agreement begin?" body="Dates turn ‘soon’ and ‘later’ into something both sides can recognise. Start is required; add the handover, completion or closing date whenever it can reasonably be agreed." />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-[#173d27]">Agreement starts<input type="date" className={inputCls} value={blueprint.startDate} onChange={(event) => setBlueprint({ ...blueprint, startDate: event.target.value })} /></label>
            <label className="space-y-1.5 text-sm font-semibold text-[#173d27]">Target / handover / completion<input type="date" className={inputCls} value={blueprint.targetDate} onChange={(event) => setBlueprint({ ...blueprint, targetDate: event.target.value })} /></label>
          </div>
          {!blueprint.targetDate && <div className="mt-4"><Notice tone="amber">SecurePay recommends a meaningful target date when the deal has one. If this arrangement is genuinely open-ended, you can leave it blank and the final review will show that clearly.</Notice></div>}
          <BottomNav back={() => go(-1)} next={() => go(1)} disabled={!blueprint.startDate} />
        </>}

        {step === 'stages' && <>
          <SectionTitle eyebrow="4 · Progress" title={blueprint.stagesExplicitlyUnderstood ? 'These are the stages you already gave SecurePay.' : 'Make each stage recognisable.'} body={blueprint.stagesExplicitlyUnderstood ? 'I remembered the structure. Now add only what is still missing: stage amount, timing and what will show the stage is genuinely complete.' : 'Stages should represent real progress, not paperwork. Each one needs a clear finish point before stage money should move.'} />
          <div className="space-y-3">
            {blueprint.stages.map((stage, index) => <div key={stage.id} className="rounded-2xl border border-[#1a1a1a]/9 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-[#3a7a1f]">Stage {index + 1}</span><button type="button" onClick={() => removeStage(stage.id)} className="p-1 text-[#1a1a1a]/28 hover:text-red-600" aria-label={`Remove stage ${index + 1}`}><Trash2 size={15} /></button></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><input className={inputCls} value={stage.label} onChange={(event) => updateStage(stage.id, { label: event.target.value })} placeholder="Stage name" /><input className={inputCls} value={stage.amountText} onChange={(event) => updateStage(stage.id, { amountText: event.target.value })} placeholder="Stage amount, if applicable" /></div>
              <input type="date" className={`${inputCls} mt-2`} value={stage.dueDate} onChange={(event) => updateStage(stage.id, { dueDate: event.target.value })} aria-label={`Stage ${index + 1} target date`} />
              <textarea className={`${inputCls} mt-2 min-h-24 resize-y`} value={stage.completionEvidence} onChange={(event) => updateStage(stage.id, { completionEvidence: event.target.value })} placeholder="What evidence or result will show this stage is complete?" />
            </div>)}
          </div>
          <button type="button" onClick={addStage} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#3a7a1f]"><Plus size={15} /> Add another real stage</button>
          <BottomNav back={() => go(-1)} next={() => go(1)} disabled={blueprint.stages.some((stage) => stage.label.trim().length < 2 || stage.completionEvidence.trim().length < 3)} />
        </>}

        {step === 'checks' && <>
          <SectionTitle eyebrow="5 · Before money moves" title="What must be true before money should move?" body="SecurePay starts with three independent checks: performance, evidence and acceptance/authority. Two is the hard minimum. You can strengthen, edit or add checks to match this exact agreement." />
          {blueprint.checks.length === 2 && <div className="mb-4"><Notice tone="amber"><strong>Two checks is the minimum, not the standard.</strong> Add a third independent check unless this deal is genuinely simple enough that two strong checks cover what both sides care about.</Notice></div>}
          <div className="space-y-4">
            {blueprint.checks.map((check, index) => <div key={check.id} className="rounded-2xl border border-[#1a1a1a]/9 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3"><div><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3a7a1f]">{checkKindLabel(check.kind)}</span><input className="mt-1 block w-full border-0 bg-transparent p-0 text-lg font-semibold text-[#173d27] outline-none" value={check.title} onChange={(event) => updateCheck(check.id, { title: event.target.value })} /></div><button type="button" disabled={blueprint.checks.length <= 2} onClick={() => removeCheck(check.id)} className="p-1 text-[#1a1a1a]/28 hover:text-red-600 disabled:opacity-15" aria-label={`Remove check ${index + 1}`}><Trash2 size={15} /></button></div>
              <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Condition<textarea className={`${inputCls} mt-1 min-h-20 resize-y normal-case tracking-normal`} value={check.condition} onChange={(event) => updateCheck(check.id, { condition: event.target.value })} placeholder="What must actually have happened?" /></label>
              <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Evidence<textarea className={`${inputCls} mt-1 min-h-20 resize-y normal-case tracking-normal`} value={check.evidence} onChange={(event) => updateCheck(check.id, { evidence: event.target.value })} placeholder="What proof should exist?" /></label>
              <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Confirmation / authority<textarea className={`${inputCls} mt-1 min-h-20 resize-y normal-case tracking-normal`} value={check.confirmer} onChange={(event) => updateCheck(check.id, { confirmer: event.target.value })} placeholder="Who or what should be entitled to confirm this point?" /></label>
            </div>)}
          </div>
          <button type="button" onClick={addCheck} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#3a7a1f]"><Plus size={15} /> Add another protection</button>
          <div className="mt-4"><Notice>These checks define what the parties want the agreement to require. They do not let this page declare Payment Ready or release money. Backend agreement authority still evaluates the real state later.</Notice></div>
          <BottomNav back={() => go(-1)} next={() => go(1)} disabled={blueprint.checks.length < 2 || blueprint.checks.some((check) => check.condition.trim().length < 6 || check.evidence.trim().length < 3 || check.confirmer.trim().length < 3)} />
        </>}

        {step === 'details' && <>
          <SectionTitle eyebrow="6 · Your details" title="What else matters to this deal?" body="You are the proposer. If something matters enough that you would be unhappy to rely on memory later, put it into the agreement now." />
          <label className="block space-y-1.5 text-sm font-semibold text-[#173d27]">Anything else important?<textarea className={`${inputCls} min-h-40 resize-y`} value={blueprint.additionalDetails} onChange={(event) => setBlueprint({ ...blueprint, additionalDetails: event.target.value })} placeholder="Specifications, quality expectations, place of delivery, access arrangements, materials, warranties, documents, communications, exclusions, who supplies what…" /></label>
          <label className="mt-5 block space-y-1.5 text-sm font-semibold text-[#173d27]">If a required condition is not met or is disputed<textarea className={`${inputCls} min-h-32 resize-y`} value={exceptionPlan} onChange={(event) => setExceptionPlan(event.target.value)} /></label>
          <div className="mt-4"><Notice>SecurePay keeps the record and can support an issue/review path; it does not become judge, guarantor or contracting party.</Notice></div>
          <BottomNav back={() => go(-1)} next={() => go(1)} nextLabel="Review the real agreement" disabled={exceptionPlan.trim().length < 12} />
        </>}

        {step === 'review' && <>
          <SectionTitle eyebrow="7 · Agreement quality gate" title="Read the deal, not a checkout summary." body="Before this proposal is recorded, check the people, money, dates, obligations, conditions, evidence and what happens if a condition is not met." />
          <div className="grid gap-3 sm:grid-cols-3">
            <ReviewFact icon={<Users size={16} />} label="People" value={`${blueprint.payerCount} payer${blueprint.payerCount === 1 ? '' : 's'} · ${blueprint.recipientCount} recipient${blueprint.recipientCount === 1 ? '' : 's'}`} />
            <ReviewFact icon={<Banknote size={16} />} label="Money" value={blueprint.amountText || 'Not clear'} />
            <ReviewFact icon={<CalendarDays size={16} />} label="Starts" value={blueprint.startDate || 'Not clear'} />
          </div>

          <ReviewSection title="Who is involved"><p className="whitespace-pre-wrap">{blueprint.parties}</p></ReviewSection>
          <ReviewSection title="What must happen"><p className="whitespace-pre-wrap">{obligationSummary}</p></ReviewSection>
          {blueprint.targetDate && <ReviewSection title="Target / handover"><p>{blueprint.targetDate}</p></ReviewSection>}
          {blueprint.stages.length > 0 && <ReviewSection title="Stages">{blueprint.stages.map((stage, index) => <div key={stage.id} className="border-b border-[#1a1a1a]/7 py-3 last:border-b-0"><strong>{index + 1}. {stage.label}</strong><p className="mt-1 text-xs text-[#1a1a1a]/55">{[stage.amountText, stage.dueDate].filter(Boolean).join(' · ') || 'Amount/date not separately stated'}</p><p className="mt-1 text-sm">Complete when: {stage.completionEvidence}</p></div>)}</ReviewSection>}
          <ReviewSection title={`Checks before money should move · ${blueprint.checks.length}`}>{blueprint.checks.map((check, index) => <div key={check.id} className="border-b border-[#1a1a1a]/7 py-3 last:border-b-0"><strong>{index + 1}. {check.title}</strong><p className="mt-1">{check.condition}</p><p className="mt-1 text-xs text-[#1a1a1a]/55"><b>Evidence:</b> {check.evidence}</p><p className="mt-1 text-xs text-[#1a1a1a]/55"><b>Confirmation:</b> {check.confirmer}</p></div>)}</ReviewSection>
          {recipientDrafts.length > 0 && <ReviewSection title="Recipients and intended allocations">{recipientDrafts.map((recipient, index) => <div key={recipient.id} className="border-b border-[#1a1a1a]/7 py-3 last:border-b-0"><strong>{index + 1}. {recipient.label}</strong><p className="mt-1 text-xs text-[#1a1a1a]/55">{recipient.ksNumber || 'KSNumber to be confirmed'} · {recipient.amountText || 'Allocation to be confirmed'}</p><p className="mt-1 text-sm">{recipient.obligation}</p></div>)}</ReviewSection>}
          {blueprint.additionalDetails.trim() && <ReviewSection title="Additional proposer terms"><p className="whitespace-pre-wrap">{blueprint.additionalDetails}</p></ReviewSection>}
          <ReviewSection title="If something is not met"><p className="whitespace-pre-wrap">{exceptionPlan}</p></ReviewSection>

          <div className="mt-5 rounded-2xl border border-[#1a1a1a]/9 bg-white p-4">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#3a7a1f]">Agreement quality</p><strong className="mt-1 block text-lg text-[#173d27]">{qualityReady ? 'Strong enough to propose' : 'Still missing important clarity'}</strong></div><span className="text-2xl font-semibold text-[#173d27]">{quality.completedCoreAreas}/{quality.totalCoreAreas}</span></div>
            {allBlocking.length > 0 && <div className="mt-4 space-y-2">{allBlocking.map((item) => <div key={item} className="flex gap-2 text-sm text-red-700"><AlertTriangle size={15} className="mt-0.5 shrink-0" /> {item}</div>)}</div>}
            {quality.warnings.length > 0 && <div className="mt-4 space-y-2">{quality.warnings.map((item) => <div key={item} className="flex gap-2 text-sm text-amber-800"><AlertTriangle size={15} className="mt-0.5 shrink-0" /> {item}</div>)}</div>}
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#1a1a1a]/9 bg-[#f8f8f5] p-4">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-[#3a7a1f]" checked={reviewConfirmed} onChange={(event) => setReviewConfirmed(event.target.checked)} />
            <span className="text-sm leading-relaxed text-[#1a1a1a]/68"><strong className="text-[#173d27]">This is the agreement I want to propose.</strong><br />I understand this records a proposal. It does not itself prove performance, fund money, establish Payment Ready, release money or settle anything.</span>
          </label>

          {submitError && <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${submitError.startsWith('Sign-in is complete') ? 'border-[#cfe2c2] bg-[#f5f9f1] text-[#315f1c]' : 'border-red-200 bg-red-50 text-red-700'}`}>{submitError}</div>}
          <div className="mt-7 flex items-center justify-between gap-3 border-t border-[#1a1a1a]/8 pt-5">
            <button type="button" onClick={() => go(-1)} className="inline-flex items-center gap-1.5 px-2 py-2 text-sm font-semibold text-[#1a1a1a]/55"><ArrowLeft size={15} /> Back</button>
            <button type="button" disabled={!qualityReady || !reviewConfirmed || submitting} onClick={() => void submit()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"><ShieldCheck size={16} /> {submitting ? 'Recording proposal…' : previewMode ? 'Complete preview' : session?.accessToken ? 'Record agreement proposal' : 'Sign in & record proposal'}</button>
          </div>
        </>}
      </main>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/70 p-3"><div className="flex items-center gap-2 text-[#3a7a1f]">{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div><p className="mt-2 text-sm leading-relaxed text-[#173d27]">{value}</p></div>;
}

function ReviewFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-[#1a1a1a]/8 bg-white p-4"><div className="flex items-center gap-2 text-[#3a7a1f]">{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div><strong className="mt-2 block text-sm text-[#173d27]">{value}</strong></div>;
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-4 rounded-2xl border border-[#1a1a1a]/8 bg-white p-4 sm:p-5"><h2 className="text-xs font-bold uppercase tracking-[0.13em] text-[#3a7a1f]">{title}</h2><div className="mt-3 text-sm leading-relaxed text-[#1a1a1a]/68">{children}</div></section>;
}
