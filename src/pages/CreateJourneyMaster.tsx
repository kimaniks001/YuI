import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { inputCls } from '../components/creation';
import { useAuth } from '../lib/auth';
import { clearCreationIntent, loadCreationIntent, type CreationIntent } from '../lib/creationIntent';
import {
  buildAgreementBlueprint,
  parseKenyanAmountMinor,
  type AgreementBlueprint,
  type AgreementCheck,
  type AgreementStage,
} from '../lib/agreementIntelligence';
import type { AgreementTopology } from '../lib/agreementTopology';
import {
  confirmAgreementVersion,
  createAgreement,
  createAgreementMilestone,
  createAgreementObligation,
  createGroupSecureLink,
  issueAgreementInvitation,
  issueGroupSecureLinkPublicLocator,
  listAgreementParticipants,
  listAgreementVersions,
} from '../api/securepayEndpoints';
import {
  amendDistributionPlanAllocations,
  createDistributionPlan,
  submitDistributionPlan,
} from '../api/secureflowEndpoints';
import type { DistributionAllocationRequestBody } from '../api/secureflowTypes';

interface CreateJourneyMasterProps {
  previewMode?: boolean;
}

type StepId = 'situation' | 'you' | 'people' | 'agreement' | 'money' | 'checks' | 'stages' | 'review';

type GovernanceMode = 'ORGANISER' | 'COMMITTEE';

type RecipientDraft = {
  id: string;
  label: string;
  ksNumber: string;
  amountText: string;
  obligation: string;
};

type Mood = {
  panel: string;
  accent: string;
  soft: string;
  name: string;
};

const STEP_LABELS: Record<StepId, string> = {
  situation: 'Situation',
  you: 'You',
  people: 'People',
  agreement: 'Agreement',
  money: 'Amount',
  checks: 'Before payment',
  stages: 'Stages',
  review: 'Review',
};

function topologyFromCounts(payers: number, recipients: number): AgreementTopology {
  if (payers > 1 && recipients > 1) return 'MANY_TO_MANY';
  if (payers > 1) return 'MANY_TO_ONE';
  if (recipients > 1) return 'ONE_TO_MANY';
  return 'ONE_TO_ONE';
}

function structureName(topology: AgreementTopology): string {
  if (topology === 'MANY_TO_ONE') return 'Group SecureLink';
  if (topology === 'ONE_TO_MANY') return 'SecureFlow';
  if (topology === 'MANY_TO_MANY') return 'Group SecureFlow';
  return 'SecureLink';
}

function flowLine(topology: AgreementTopology): string {
  if (topology === 'MANY_TO_ONE') return 'Several people contribute to one purpose.';
  if (topology === 'ONE_TO_MANY') return 'One payer funds several recipients.';
  if (topology === 'MANY_TO_MANY') return 'A group contributes and money is distributed to several recipients.';
  return 'One payer and one counterparty.';
}

function moodFromIntent(intent: CreationIntent): Mood {
  const text = `${intent.statement} ${intent.what} ${intent.who}`.toLowerCase();
  if (/wedding|bride|groom|harusi/.test(text)) {
    return { panel: 'border-[#efc5d1] bg-[#fff1f5]', accent: 'text-[#a93b62]', soft: 'bg-[#f8dfe7]', name: 'Wedding' };
  }
  if (/school|fees|tuition|student/.test(text)) {
    return { panel: 'border-[#cbdcf4] bg-[#f0f6ff]', accent: 'text-[#355d91]', soft: 'bg-[#dce9fb]', name: 'School' };
  }
  if (/medical|hospital|health|treatment|surgery/.test(text)) {
    return { panel: 'border-[#efcbc2] bg-[#fff4f1]', accent: 'text-[#9d4e3e]', soft: 'bg-[#f6dfd8]', name: 'Medical' };
  }
  if (/funeral|burial|bereavement/.test(text)) {
    return { panel: 'border-[#d6d1c9] bg-[#f6f3ee]', accent: 'text-[#5f584f]', soft: 'bg-[#e7e1d9]', name: 'Support' };
  }
  if (/build|house|construction|contractor|fundi|roof|wall|foundation/.test(text)) {
    return { panel: 'border-[#ddcfb5] bg-[#f8f2e7]', accent: 'text-[#7c5a27]', soft: 'bg-[#eadfc9]', name: 'Project' };
  }
  if (/travel|trip|transport/.test(text)) {
    return { panel: 'border-[#c8dfe0] bg-[#eff8f7]', accent: 'text-[#276a68]', soft: 'bg-[#d9eeec]', name: 'Travel' };
  }
  return { panel: 'border-[#cfe2c2] bg-[#f3f8ef]', accent: 'text-[#315f1c]', soft: 'bg-[#e3efda]', name: 'Agreement' };
}

function initialRecipients(count: number): RecipientDraft[] {
  return Array.from({ length: Math.max(1, count) }, (_, index) => ({
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

function InlineAuthGate({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const { signIn, completeSignIn, resendChallenge, cancelChallenge, challenge } = useAuth();
  const [ksNumber, setKsNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const credentials = async () => {
    if (!ksNumber.trim() || !password || busy) return;
    setBusy(true); setError('');
    const result = await signIn(ksNumber.trim(), password);
    setBusy(false);
    if (result) setError(result);
  };

  const verify = async () => {
    if (!otp.trim() || busy) return;
    setBusy(true); setError('');
    const result = await completeSignIn(otp.trim());
    setBusy(false);
    if (result) setError(result); else onDone();
  };

  return (
    <div className="min-h-screen bg-[#fffdf8] px-4 py-8">
      <div className="mx-auto max-w-md rounded-[28px] border border-[#1a1a1a]/10 bg-white p-6 shadow-sm">
        <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[#1a1a1a]/50"><ArrowLeft size={15} /> Back</button>
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f0df] text-[#315f1c]"><LockKeyhole size={18} /></div>
        <h1 className="font-display text-3xl font-medium text-[#1d3925]">{challenge ? 'Enter your code' : 'Sign in to create it'}</h1>
        <p className="mt-1 text-sm text-[#1a1a1a]/48">Your agreement stays exactly as you shaped it.</p>
        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {!challenge ? (
          <div className="mt-5 space-y-3">
            <input className={inputCls} placeholder="KSNumber" value={ksNumber} onChange={(e) => setKsNumber(e.target.value.toUpperCase())} />
            <div className="relative">
              <input className={`${inputCls} pr-11`} placeholder="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void credentials()} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a1a1a]/35" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <button type="button" onClick={() => void credentials()} disabled={busy || !ksNumber.trim() || !password} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315f1c] px-5 text-sm font-semibold text-white disabled:opacity-40">Continue <ArrowRight size={16} /></button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <input className={`${inputCls} text-center tracking-[0.25em]`} placeholder="Code" value={otp} onChange={(e) => setOtp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void verify()} />
            <button type="button" onClick={() => void verify()} disabled={busy || !otp.trim()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315f1c] px-5 text-sm font-semibold text-white disabled:opacity-40"><ShieldCheck size={16} /> Verify</button>
            <div className="flex justify-between text-xs"><button type="button" onClick={() => { cancelChallenge(); setOtp(''); }} className="text-[#1a1a1a]/45">Use another sign-in</button><button type="button" onClick={() => void resendChallenge()} className="font-semibold text-[#315f1c]">Resend code</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel = 'Continue', disabled = false, busy = false }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean; busy?: boolean }) {
  return (
    <div className="mt-7 flex items-center justify-between border-t border-[#1a1a1a]/8 pt-5">
      {onBack ? <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a]/48"><ArrowLeft size={15} /> Back</button> : <span />}
      <button type="button" onClick={onNext} disabled={disabled || busy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#173d27] px-5 text-sm font-semibold text-white disabled:opacity-35">{busy ? 'Creating…' : nextLabel} {!busy && <ArrowRight size={15} />}</button>
    </div>
  );
}

function Title({ title, hint }: { title: string; hint?: string }) {
  return <div className="mb-5"><h1 className="font-display text-[34px] font-medium leading-[1.05] text-[#173d27] sm:text-[42px]">{title}</h1>{hint && <p className="mt-2 max-w-xl text-sm leading-5 text-[#1a1a1a]/48">{hint}</p>}</div>;
}

export default function CreateJourneyMaster({ previewMode = false }: CreateJourneyMasterProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [intent] = useState<CreationIntent | null>(() => (location.state as { intent?: CreationIntent } | null)?.intent ?? loadCreationIntent());
  const [blueprint, setBlueprint] = useState<AgreementBlueprint | null>(() => intent ? buildAgreementBlueprint(intent) : null);
  const [step, setStep] = useState<StepId>('situation');
  const [payerIsCreator, setPayerIsCreator] = useState<boolean | null>(null);
  const [counterpartyKs, setCounterpartyKs] = useState('');
  const [mainObligation, setMainObligation] = useState(() => intent?.mustHappen && !/SecurePay will ask/i.test(intent.mustHappen) ? intent.mustHappen : '');
  const [stagesEnabled, setStagesEnabled] = useState(() => Boolean(blueprint?.stagesExplicitlyUnderstood && blueprint.stages.length));
  const [selectedChecks, setSelectedChecks] = useState<string[]>(() => blueprint?.checks.map((check) => check.id) ?? []);
  const [recipientDrafts, setRecipientDrafts] = useState<RecipientDraft[]>(() => initialRecipients(Math.max(1, blueprint?.recipientCount ?? 1)));
  const [governanceMode, setGovernanceMode] = useState<GovernanceMode>('ORGANISER');
  const [referrerKs, setReferrerKs] = useState('');
  const [authGate, setAuthGate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitKey = useRef(crypto.randomUUID());

  if (!intent || !blueprint) {
    return <div className="min-h-screen bg-[#fffdf8] px-4 py-24 text-center"><LivingSecurePayMark state="guiding" size="md" presence="polite" /><h1 className="mt-5 font-display text-3xl text-[#173d27]">What would you like to agree?</h1><Link to={previewMode ? '/preview/home' : '/'} className="mt-5 inline-flex text-sm font-semibold text-[#315f1c]">Start from Home</Link></div>;
  }

  const topology = blueprint.topology;
  const isGroup = topology === 'MANY_TO_ONE' || topology === 'MANY_TO_MANY';
  const isFlow = topology === 'ONE_TO_MANY' || topology === 'MANY_TO_MANY';
  const steps = useMemo<StepId[]>(() => ['situation', 'you', 'people', 'agreement', 'money', 'checks', 'stages', 'review'], []);
  const index = steps.indexOf(step);
  const mood = moodFromIntent(intent);
  const activeChecks = blueprint.checks.filter((check) => selectedChecks.includes(check.id));
  const amountReady = Boolean(blueprint.amountMinor && blueprint.amountMinor > 0);
  const peopleReady = isGroup ? blueprint.payerCount > 1 : payerIsCreator !== null;
  const agreementReady = mainObligation.trim().length >= 6;
  const checksReady = activeChecks.length >= 2 && activeChecks.every((check) => check.condition.trim() && check.evidence.trim() && check.confirmer.trim());
  const reviewReady = amountReady && peopleReady && agreementReady && checksReady;

  const go = (delta: 1 | -1) => {
    const next = steps[index + delta];
    if (next) setStep(next);
  };

  const updateCounts = (field: 'payerCount' | 'recipientCount', raw: string) => {
    const value = Math.max(1, Math.min(50, Number.parseInt(raw || '1', 10) || 1));
    setBlueprint((current) => {
      if (!current) return current;
      const next = { ...current, [field]: value };
      next.topology = topologyFromCounts(next.payerCount, next.recipientCount);
      return next;
    });
    if (field === 'recipientCount') setRecipientDrafts((current) => resizeRecipients(current, value));
  };

  const updateCheck = (id: string, patch: Partial<AgreementCheck>) => setBlueprint((current) => current ? { ...current, checks: current.checks.map((check) => check.id === id ? { ...check, ...patch } : check) } : current);
  const updateStage = (id: string, patch: Partial<AgreementStage>) => setBlueprint((current) => current ? { ...current, stages: current.stages.map((stage) => stage.id === id ? { ...stage, ...patch } : stage) } : current);
  const addStage = () => { setStagesEnabled(true); setBlueprint((current) => current ? { ...current, stages: [...current.stages, { id: crypto.randomUUID(), label: '', amountText: '', dueDate: '', completionEvidence: '' }] } : current); };
  const updateRecipient = (id: string, patch: Partial<RecipientDraft>) => setRecipientDrafts((current) => current.map((recipient) => recipient.id === id ? { ...recipient, ...patch } : recipient));

  const prepareMoneyAuthority = async (agreementId: string, versionId: string, versionNumber: number, contentHash: string) => {
    if (!blueprint.amountMinor || blueprint.payerCount !== 1 || payerIsCreator !== true) return;
    const participants = await listAgreementParticipants(agreementId, session?.accessToken);
    if (!participants.ok || !participants.data) return;
    const creator = participants.data.find((participant) => participant.participantStatus === 'CREATOR');
    const counterparty = participants.data.find((participant) => participant.roleCode === 'COUNTERPARTY');
    if (!creator) return;

    await createAgreementObligation(
      agreementId,
      versionId,
      {
        idempotencyKey: crypto.randomUUID(),
        obligationType: 'MONETARY',
        title: `Fund ${structureName(topology)}`,
        description: `Funding for: ${intent.what}`,
        responsibleParticipantId: creator.id,
        beneficiaryParticipantId: counterparty?.id,
        currency: 'KES',
        amountMinor: blueprint.amountMinor,
        sequenceOrder: 1,
      },
      session?.accessToken,
    );

    await confirmAgreementVersion(
      agreementId,
      versionId,
      { idempotencyKey: crypto.randomUUID(), expectedVersionNumber: versionNumber, expectedContentHash: contentHash },
      session?.accessToken,
    );
  };

  const description = () => {
    const checks = activeChecks.map((check, i) => `${i + 1}. ${check.condition.trim()} | Evidence: ${check.evidence.trim()} | Confirmation: ${check.confirmer.trim()}`).join('\n');
    const stages = stagesEnabled && blueprint.stages.length ? blueprint.stages.map((stage, i) => `${i + 1}. ${stage.label || `Stage ${i + 1}`}${stage.amountText ? ` — ${stage.amountText}` : ''}${stage.completionEvidence ? ` | Evidence: ${stage.completionEvidence}` : ''}`).join('\n') : 'Simple agreement — no staged payment structure proposed.';
    const recipients = isFlow ? recipientDrafts.slice(0, blueprint.recipientCount).map((recipient, i) => `${i + 1}. ${recipient.label}${recipient.ksNumber ? ` (${recipient.ksNumber})` : ''}${recipient.amountText ? ` — ${recipient.amountText}` : ''} | ${recipient.obligation || 'Purpose to be completed'}`).join('\n') : '';
    return [
      `Money flow: ${flowLine(topology)}`,
      `Parties / roles: ${blueprint.parties || intent.who}`,
      `Main obligation: ${mainObligation.trim()}`,
      `Start: ${blueprint.startDate || 'To be agreed'}${blueprint.targetDate ? ` | Target: ${blueprint.targetDate}` : ''}`,
      `Checks before money can move:\n${checks}`,
      `Stages:\n${stages}`,
      isGroup ? `Governance preference: ${governanceMode === 'COMMITTEE' ? 'Committee approval' : 'Lead organiser'}` : '',
      recipients ? `Recipients / allocations:\n${recipients}` : '',
      blueprint.additionalDetails.trim() ? `Additional details: ${blueprint.additionalDetails.trim()}` : '',
      referrerKs.trim() ? `Builder / referrer KSNumber: ${referrerKs.trim().toUpperCase()}` : '',
    ].filter(Boolean).join('\n\n');
  };

  const submit = async () => {
    if (!reviewReady || submitting) return;
    if (previewMode) { navigate('/preview/workspace'); return; }
    if (!session?.accessToken) { setAuthGate(true); return; }

    setSubmitting(true); setError(null);
    try {
      const created = await createAgreement({
        idempotencyKey: submitKey.current,
        agreementType: 'GENERIC',
        title: intent.what,
        purpose: intent.statement,
        description: description(),
        currency: 'KES',
        proposedAmountMinor: blueprint.amountMinor!,
        saveAsDraft: false,
      }, session.accessToken);
      if (!created.ok || !created.data) { setError(created.error ?? 'SecurePay could not create this agreement.'); return; }

      const agreementId = created.data.id;

      if (topology === 'ONE_TO_ONE' && counterpartyKs.trim()) {
        await issueAgreementInvitation(agreementId, { idempotencyKey: crypto.randomUUID(), roleCode: 'COUNTERPARTY', intendedKsNumber: counterpartyKs.trim().toUpperCase() }, session.accessToken);
      }

      const versions = await listAgreementVersions(agreementId, session.accessToken);
      const currentVersion = versions.ok && versions.data ? versions.data.find((version) => version.versionStatus === 'CURRENT') ?? versions.data[0] : null;

      if (currentVersion && stagesEnabled) {
        for (let i = 0; i < blueprint.stages.length; i += 1) {
          const stage = blueprint.stages[i];
          if (!stage.label.trim()) continue;
          await createAgreementMilestone(agreementId, currentVersion.id, {
            title: stage.label.trim(),
            description: [stage.amountText && `Amount: ${stage.amountText}`, stage.dueDate && `Due: ${stage.dueDate}`, stage.completionEvidence && `Evidence: ${stage.completionEvidence}`].filter(Boolean).join('. '),
            sequenceOrder: i + 1,
          }, session.accessToken);
        }
      }

      let groupSlug: string | null = null;
      let groupSecureLinkId: string | null = null;
      if (isGroup) {
        const group = await createGroupSecureLink(agreementId, {
          groupType: intent.family === 'life' ? 'WELFARE' : 'GENERAL',
          title: intent.what,
          statedPurpose: intent.statement,
          targetType: blueprint.amountMinor ? 'FIXED_AMOUNT' : 'OPEN_ENDED',
          targetAmountMinor: blueprint.amountMinor ?? undefined,
        }, session.accessToken);
        if (group.ok && group.data) {
          groupSecureLinkId = group.data.groupSecureLinkId;
          const locator = await issueGroupSecureLinkPublicLocator(agreementId, { idempotencyKey: crypto.randomUUID() }, session.accessToken);
          if (locator.ok && locator.data) groupSlug = locator.data.slug;
        }
      }

      if (isFlow && blueprint.amountMinor) {
        const recipients = recipientDrafts.slice(0, blueprint.recipientCount);
        const amounts = recipients.map((recipient) => parseKenyanAmountMinor(recipient.amountText));
        const allKnown = recipients.every((recipient) => /^KS\d{3,}$/i.test(recipient.ksNumber.trim())) && amounts.every((amount) => amount !== null);
        const total = amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
        if (allKnown && total === blueprint.amountMinor) {
          const plan = await createDistributionPlan(agreementId, {
            idempotencyKey: crypto.randomUUID(),
            moneyFlowType: topology === 'MANY_TO_MANY' ? 'GROUP_SECURE_FLOW' : 'SECURE_FLOW',
            distributableAmountMinor: blueprint.amountMinor,
            groupSecureLinkId: topology === 'MANY_TO_MANY' ? groupSecureLinkId : undefined,
          }, session.accessToken);
          if (plan.ok && plan.data) {
            const allocations: DistributionAllocationRequestBody[] = recipients.map((recipient, i) => ({
              allocationReference: `recipient-${i + 1}`,
              sequenceNumber: i + 1,
              allocationMode: 'FIXED_AMOUNT',
              amountMinor: amounts[i]!,
              beneficiaryKsNumber: recipient.ksNumber.trim().toUpperCase(),
              purposeTitle: recipient.label.trim(),
              purposeDescription: recipient.obligation.trim() || recipient.label.trim(),
            }));
            const amended = await amendDistributionPlanAllocations(agreementId, plan.data.plan.id, plan.data.version.planVersion, { idempotencyKey: crypto.randomUUID(), allocations }, session.accessToken);
            if (amended.ok && amended.data) await submitDistributionPlan(agreementId, plan.data.plan.id, plan.data.version.planVersion, { idempotencyKey: crypto.randomUUID() }, session.accessToken);
          }
        }
      }

      if (currentVersion) await prepareMoneyAuthority(agreementId, currentVersion.id, currentVersion.versionNumber, currentVersion.contentHash);

      clearCreationIntent();

      if (isGroup && groupSlug) {
        navigate(`/group/${groupSlug}`, { replace: true, state: { justCreated: true, agreementId } });
      } else if (blueprint.payerCount === 1 && payerIsCreator === true) {
        navigate(`/agreements/${agreementId}/fund`, { replace: true, state: { justCreated: true } });
      } else {
        navigate(`/agreements/${agreementId}`, { replace: true });
      }
    } catch {
      setError('SecurePay could not finish creating this agreement. Your answers are still here.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authGate) return <InlineAuthGate onBack={() => setAuthGate(false)} onDone={() => setAuthGate(false)} />;

  const nextDisabled = (() => {
    if (step === 'you') return !peopleReady;
    if (step === 'agreement') return !agreementReady;
    if (step === 'money') return !amountReady;
    if (step === 'checks') return !checksReady;
    if (step === 'review') return !reviewReady;
    return false;
  })();

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#1a1a1a]">
      <header className="border-b border-[#1a1a1a]/8 bg-[#fffdf8]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to={previewMode ? '/preview/home' : '/'} className="inline-flex items-center gap-2"><LivingSecurePayMark state="guiding" size="sm" presence="polite" /><span className="font-display text-lg font-medium text-[#173d27]">SecurePay</span></Link>
          <div className="flex items-center gap-2 text-xs text-[#1a1a1a]/38"><span>{index + 1} of {steps.length}</span><div className="flex gap-1">{steps.map((item, i) => <span key={item} className={`h-1.5 rounded-full ${i <= index ? 'w-5 bg-[#315f1c]' : 'w-3 bg-[#1a1a1a]/10'}`} />)}</div></div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:py-10">
        <section className="rounded-[28px] border border-[#1a1a1a]/9 bg-white p-5 shadow-[0_10px_35px_rgba(25,45,30,0.05)] sm:p-8">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#315f1c]">{STEP_LABELS[step]}</p>

          {step === 'situation' && <>
            <Title title={intent.what} />
            <div className="rounded-2xl border border-[#1a1a1a]/8 bg-[#faf9f5] p-4"><p className="font-display text-xl leading-7 text-[#2a392e]">“{intent.statement}”</p></div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-[#f5f8f2] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/35">Money</span><strong className="mt-1 block text-sm text-[#315f1c]">{blueprint.amountText || 'To confirm'}</strong></div><div className="rounded-xl bg-[#f5f8f2] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/35">People</span><strong className="mt-1 block text-sm text-[#173d27]">{blueprint.payerCount} paying · {blueprint.recipientCount} receiving</strong></div><div className="rounded-xl bg-[#f5f8f2] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/35">Structure</span><strong className="mt-1 block text-sm text-[#173d27]">{structureName(topology)}</strong></div></div>
            {blueprint.stagesExplicitlyUnderstood && blueprint.stages.length > 0 && <div className="mt-4 rounded-xl border border-[#315f1c]/12 bg-[#f3f8ef] px-4 py-3 text-sm text-[#315f1c]"><strong>Stages understood:</strong> {blueprint.stages.map((stage) => stage.label).join(' → ')}</div>}
          </>}

          {step === 'you' && <>
            <Title title={isGroup ? 'Who is organising this?' : 'Who is paying?'} />
            {isGroup ? <div className="space-y-4"><div className="rounded-2xl border border-[#315f1c]/15 bg-[#f3f8ef] p-4"><p className="text-sm font-semibold text-[#173d27]">Your signed-in KSNumber is the lead organiser.</p></div><label className="block text-sm font-semibold text-[#173d27]">How many people will contribute?<input type="number" min={2} max={50} className={`${inputCls} mt-1.5`} value={blueprint.payerCount} onChange={(e) => updateCounts('payerCount', e.target.value)} /></label></div> : <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setPayerIsCreator(true)} className={`rounded-2xl border-2 p-4 text-left ${payerIsCreator === true ? 'border-[#315f1c] bg-[#f3f8ef]' : 'border-[#1a1a1a]/9'}`}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5efdf] text-[#315f1c]"><Check size={16} /></span><strong className="mt-3 block">I am paying</strong></button><button type="button" onClick={() => setPayerIsCreator(false)} className={`rounded-2xl border-2 p-4 text-left ${payerIsCreator === false ? 'border-[#315f1c] bg-[#f3f8ef]' : 'border-[#1a1a1a]/9'}`}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f0ec] text-[#1a1a1a]/55"><Users size={16} /></span><strong className="mt-3 block">The other party is paying</strong></button></div>}
          </>}

          {step === 'people' && <>
            <Title title={isFlow ? 'Who should receive the money?' : isGroup ? 'Who or what is being supported?' : 'Who is the other party?'} />
            {!isFlow && <><label className="block text-sm font-semibold text-[#173d27]">People / roles<textarea className={`${inputCls} mt-1.5 min-h-24 resize-y`} value={blueprint.parties} onChange={(e) => setBlueprint({ ...blueprint, parties: e.target.value })} placeholder="Name, business or role" /></label>{topology === 'ONE_TO_ONE' && <label className="mt-4 block text-sm font-semibold text-[#173d27]">Other party KSNumber <span className="font-normal text-[#1a1a1a]/38">optional until sharing</span><input className={`${inputCls} mt-1.5`} value={counterpartyKs} onChange={(e) => setCounterpartyKs(e.target.value.toUpperCase())} placeholder="KS1234" /></label>}</>}
            {isFlow && <div className="space-y-3">{recipientDrafts.slice(0, blueprint.recipientCount).map((recipient, i) => <div key={recipient.id} className="rounded-2xl border border-[#1a1a1a]/9 p-4"><div className="mb-3 text-xs font-bold uppercase tracking-wider text-[#315f1c]">Recipient {i + 1}</div><div className="grid gap-2 sm:grid-cols-2"><input className={inputCls} value={recipient.label} onChange={(e) => updateRecipient(recipient.id, { label: e.target.value })} placeholder="Name / role" /><input className={inputCls} value={recipient.ksNumber} onChange={(e) => updateRecipient(recipient.id, { ksNumber: e.target.value.toUpperCase() })} placeholder="KSNumber" /></div><input className={`${inputCls} mt-2`} value={recipient.obligation} onChange={(e) => updateRecipient(recipient.id, { obligation: e.target.value })} placeholder="What is this payment for?" /></div>)}</div>}
          </>}

          {step === 'agreement' && <>
            <Title title="What is being agreed?" />
            <label className="block text-sm font-semibold text-[#173d27]">What must happen?<textarea className={`${inputCls} mt-1.5 min-h-28 resize-y`} value={mainObligation} onChange={(e) => setMainObligation(e.target.value)} placeholder="The item, work, service or outcome that matters" /></label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-[#173d27]">Starts<input type="date" className={`${inputCls} mt-1.5`} value={blueprint.startDate} onChange={(e) => setBlueprint({ ...blueprint, startDate: e.target.value })} /></label><label className="text-sm font-semibold text-[#173d27]">Expected by <span className="font-normal text-[#1a1a1a]/38">optional</span><input type="date" className={`${inputCls} mt-1.5`} value={blueprint.targetDate} onChange={(e) => setBlueprint({ ...blueprint, targetDate: e.target.value })} /></label></div>
          </>}

          {step === 'money' && <>
            <Title title={isGroup ? 'How much are you collecting?' : 'How much is involved?'} />
            <label className="block text-sm font-semibold text-[#173d27]">Amount<input className={`${inputCls} mt-1.5 text-lg font-semibold`} value={blueprint.amountText} onChange={(e) => { const amountText = e.target.value; setBlueprint({ ...blueprint, amountText, amountMinor: parseKenyanAmountMinor(amountText) }); }} placeholder="KES 80,000" /></label>
            {isFlow && <div className="mt-4 space-y-2"><p className="text-sm font-semibold text-[#173d27]">Allocation</p>{recipientDrafts.slice(0, blueprint.recipientCount).map((recipient) => <div key={recipient.id} className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-sm text-[#1a1a1a]/60">{recipient.label}</span><input className={`${inputCls} max-w-[190px]`} value={recipient.amountText} onChange={(e) => updateRecipient(recipient.id, { amountText: e.target.value })} placeholder="KES 0" /></div>)}</div>}
            {isGroup && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#f6f7f3] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/35">Contributors</span><strong className="mt-1 block">{blueprint.payerCount}</strong></div><div className="rounded-xl bg-[#f6f7f3] p-3"><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/35">Target</span><strong className="mt-1 block text-[#315f1c]">{blueprint.amountText || 'Open'}</strong></div></div>}
          </>}

          {step === 'checks' && <>
            <Title title="What must happen before money can move?" hint="SecurePay starts with three checks. Keep at least two." />
            <div className="space-y-3">{blueprint.checks.map((check, i) => { const selected = selectedChecks.includes(check.id); return <div key={check.id} className={`rounded-2xl border p-4 ${selected ? 'border-[#315f1c]/20 bg-[#f8fbf5]' : 'border-[#1a1a1a]/8 bg-white opacity-60'}`}><button type="button" onClick={() => setSelectedChecks((current) => selected ? (current.length > 2 ? current.filter((id) => id !== check.id) : current) : [...current, check.id])} className="flex w-full items-center gap-3 text-left"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-[#315f1c] text-white' : 'bg-[#1a1a1a]/8 text-[#1a1a1a]/35'}`}>{selected ? <Check size={14} /> : i + 1}</span><strong className="text-sm text-[#173d27]">{check.title}</strong></button>{selected && <div className="mt-3 grid gap-2"><input className={inputCls} value={check.condition} onChange={(e) => updateCheck(check.id, { condition: e.target.value })} placeholder="Condition" /><input className={inputCls} value={check.evidence} onChange={(e) => updateCheck(check.id, { evidence: e.target.value })} placeholder="Evidence" /><input className={inputCls} value={check.confirmer} onChange={(e) => updateCheck(check.id, { confirmer: e.target.value })} placeholder="Who confirms / approves?" /></div>}</div>; })}</div>
          </>}

          {step === 'stages' && <>
            <Title title={blueprint.stagesExplicitlyUnderstood ? 'Your stages' : 'Do you want to break this into stages?'} />
            {!blueprint.stagesExplicitlyUnderstood && <div className="mb-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setStagesEnabled(false)} className={`rounded-2xl border-2 p-4 text-left ${!stagesEnabled ? 'border-[#315f1c] bg-[#f3f8ef]' : 'border-[#1a1a1a]/9'}`}><strong>Simple agreement</strong><span className="mt-1 block text-xs text-[#1a1a1a]/45">One overall completion point</span></button><button type="button" onClick={() => { setStagesEnabled(true); if (!blueprint.stages.length) addStage(); }} className={`rounded-2xl border-2 p-4 text-left ${stagesEnabled ? 'border-[#315f1c] bg-[#f3f8ef]' : 'border-[#1a1a1a]/9'}`}><strong>Use stages</strong><span className="mt-1 block text-xs text-[#1a1a1a]/45">Progress and payment points</span></button></div>}
            {stagesEnabled && <div className="space-y-3">{blueprint.stages.map((stage, i) => <div key={stage.id} className="rounded-2xl border border-[#1a1a1a]/9 p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#315f1c]">Stage {i + 1}</span>{blueprint.stages.length > 1 && <button type="button" onClick={() => setBlueprint({ ...blueprint, stages: blueprint.stages.filter((item) => item.id !== stage.id) })} className="text-[#1a1a1a]/30"><Trash2 size={15} /></button>}</div><div className="mt-3 grid gap-2 sm:grid-cols-2"><input className={inputCls} value={stage.label} onChange={(e) => updateStage(stage.id, { label: e.target.value })} placeholder="Stage name" /><input className={inputCls} value={stage.amountText} onChange={(e) => updateStage(stage.id, { amountText: e.target.value })} placeholder="Amount, optional" /></div><input className={`${inputCls} mt-2`} value={stage.completionEvidence} onChange={(e) => updateStage(stage.id, { completionEvidence: e.target.value })} placeholder="What proves this stage is complete?" /></div>)}<button type="button" onClick={addStage} className="inline-flex items-center gap-2 rounded-xl border border-[#315f1c]/18 bg-[#f6faf2] px-4 py-2 text-sm font-semibold text-[#315f1c]"><Plus size={15} /> Add stage</button></div>}
          </>}

          {step === 'review' && <>
            <Title title="Review your agreement" />
            <div className="space-y-2 rounded-2xl border border-[#1a1a1a]/8 bg-[#faf9f5] p-4 text-sm"><div className="flex justify-between gap-4"><span className="text-[#1a1a1a]/45">Structure</span><strong>{structureName(topology)}</strong></div><div className="flex justify-between gap-4"><span className="text-[#1a1a1a]/45">Amount</span><strong className="text-[#315f1c]">{blueprint.amountText}</strong></div><div className="flex justify-between gap-4"><span className="text-[#1a1a1a]/45">Checks before money</span><strong>{activeChecks.length}</strong></div><div className="flex justify-between gap-4"><span className="text-[#1a1a1a]/45">Stages</span><strong>{stagesEnabled ? blueprint.stages.length : 'Simple'}</strong></div></div>
            <label className="mt-4 block text-sm font-semibold text-[#173d27]">Anything else important? <span className="font-normal text-[#1a1a1a]/38">optional</span><textarea className={`${inputCls} mt-1.5 min-h-24 resize-y`} value={blueprint.additionalDetails} onChange={(e) => setBlueprint({ ...blueprint, additionalDetails: e.target.value })} placeholder="Extra scope, expectations or protection you want recorded" /></label>
            {isGroup && <div className="mt-4"><p className="mb-2 text-sm font-semibold text-[#173d27]">Who approves group payouts?</p><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setGovernanceMode('ORGANISER')} className={`rounded-xl border p-3 text-sm font-semibold ${governanceMode === 'ORGANISER' ? 'border-[#315f1c] bg-[#f3f8ef]' : 'border-[#1a1a1a]/9'}`}>Lead organiser</button><button type="button" onClick={() => setGovernanceMode('COMMITTEE')} className={`rounded-xl border p-3 text-sm font-semibold ${governanceMode === 'COMMITTEE' ? 'border-[#315f1c] bg-[#f3f8ef]' : 'border-[#1a1a1a]/9'}`}>Committee</button></div></div>}
            <label className="mt-4 block text-sm font-semibold text-[#173d27]">Who helped bring this agreement? <span className="font-normal text-[#1a1a1a]/38">optional</span><input className={`${inputCls} mt-1.5`} value={referrerKs} onChange={(e) => setReferrerKs(e.target.value.toUpperCase())} placeholder="Builder / referrer KSNumber" /></label>
            <div className="mt-4 rounded-xl border border-[#315f1c]/12 bg-[#f3f8ef] px-4 py-3 text-sm text-[#315f1c]"><strong>Next:</strong> {isGroup ? 'open the contribution link' : payerIsCreator ? `fund this ${structureName(topology)}` : 'share the agreement with the payer'}.</div>
            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          </>}

          <Nav onBack={index > 0 ? () => go(-1) : undefined} onNext={step === 'review' ? () => void submit() : () => go(1)} nextLabel={step === 'review' ? `Create ${structureName(topology)}` : 'Continue'} disabled={nextDisabled} busy={submitting} />
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className={`overflow-hidden rounded-[28px] border ${mood.panel} shadow-[0_16px_40px_rgba(30,40,30,0.06)]`}>
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${mood.soft} ${mood.accent}`}>{mood.name}</span><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/30">Live preview</span></div>
              <h2 className="mt-5 font-display text-3xl font-medium leading-[1.05] text-[#263529]">{intent.what}</h2>
              <p className="mt-3 text-sm leading-5 text-[#1a1a1a]/55">{intent.statement}</p>
              <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur"><span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1a1a1a]/35">Amount</span><div className={`mt-1 text-2xl font-semibold ${mood.accent}`}>{blueprint.amountText || 'To confirm'}</div></div>
              <dl className="mt-4 divide-y divide-[#1a1a1a]/7 text-sm"><div className="flex justify-between gap-4 py-3"><dt className="text-[#1a1a1a]/42">Structure</dt><dd className="text-right font-semibold text-[#263529]">{structureName(topology)}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-[#1a1a1a]/42">People</dt><dd className="text-right font-semibold text-[#263529]">{blueprint.payerCount} → {blueprint.recipientCount}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-[#1a1a1a]/42">Before money moves</dt><dd className="text-right font-semibold text-[#263529]">{activeChecks.length} checks</dd></div>{stagesEnabled && <div className="flex justify-between gap-4 py-3"><dt className="text-[#1a1a1a]/42">Stages</dt><dd className="text-right font-semibold text-[#263529]">{blueprint.stages.length}</dd></div>}</dl>
              <p className="mt-5 border-t border-[#1a1a1a]/8 pt-4 font-display text-lg italic text-[#263529]/75">Money should follow the agreement.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
