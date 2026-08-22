import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, KeyRound, LockKeyhole, RefreshCw } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { useAuth } from '../lib/auth';
import {
  getDeveloperIntegrationCheck,
  issueDeveloperCredential,
  issueSecureCode,
  registerDeveloperApplication,
} from '../api/r12DeveloperEndpoints';
import type {
  DeveloperApplicationResponse,
  DeveloperIntegrationCheckResponse,
  IssuedApplicationCredentialResponse,
  IssuedSecureCodeResponse,
} from '../api/r12DeveloperTypes';
import {
  DEVELOPER_BUILD_OPTIONS,
  DEVELOPER_CONNECTION_METHODS,
  DEVELOPER_MONEY_FLOWS,
  developerStructureLabel,
  type DeveloperConnectionMethod,
} from '../lib/developerJourney';

const AI_OPTIONS = ['ChatGPT', 'Claude', 'Codex', 'Cursor', 'Lovable', 'Replit', 'Other'] as const;

type Step = 0 | 1 | 2 | 3 | 4;

function newKey(prefix: string) {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

export default function DeveloperJourney() {
  const { user, session } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [appName, setAppName] = useState('');
  const [buildType, setBuildType] = useState<(typeof DEVELOPER_BUILD_OPTIONS)[number]>('Online shop or digital store');
  const [moneyFlowId, setMoneyFlowId] = useState('one-one');
  const [connectionMethod, setConnectionMethod] = useState<DeveloperConnectionMethod>('AI_HANDOFF');
  const [aiTool, setAiTool] = useState<(typeof AI_OPTIONS)[number]>('ChatGPT');
  const [site, setSite] = useState('');
  const [application, setApplication] = useState<DeveloperApplicationResponse | null>(null);
  const [secureCode, setSecureCode] = useState<IssuedSecureCodeResponse | null>(null);
  const [credential, setCredential] = useState<IssuedApplicationCredentialResponse | null>(null);
  const [integrationCheck, setIntegrationCheck] = useState<DeveloperIntegrationCheckResponse | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moneyFlow = DEVELOPER_MONEY_FLOWS.find(option => option.id === moneyFlowId) ?? DEVELOPER_MONEY_FLOWS[0];
  const structure = developerStructureLabel(moneyFlow.topology);
  const progress = Math.round(((step + 1) / 5) * 100);

  const aiInstruction = useMemo(() => {
    if (!secureCode) return '';
    return `Connect my application to SecurePay using SecureCode ${secureCode.secureCode}. I am building: ${buildType}. The money flow I described is: ${moneyFlow.label}. My preferred connection style is: ${connectionMethod}. Redeem this one-time SecureCode only through SecurePay's official handoff. Preserve my existing application and business logic. Use only the capabilities and environment returned by SecurePay. Never calculate or invent Payment Ready, settlement, release authority, participant authority, agreement authority, fee truth, or financial state in the client. Do not ask me to paste permanent SecurePay credentials into chat. When code changes are complete, tell me what belongs in a secret manager and tell me to return to SecurePay and run Integration Check. Do not claim the integration is connected yourself.`;
  }, [secureCode, buildType, moneyFlow.label, connectionMethod]);

  if (!user || !session) return <Navigate to="/" replace />;

  const prepareApplication = async () => {
    if (!user.ksNumber || !appName.trim()) return;
    setWorking(true); setError(null);
    const result = await registerDeveloperApplication(session.accessToken, {
      name: appName.trim(), ownerBusinessKsNumber: user.ksNumber, environment: 'SANDBOX', idempotencyKey: newKey('developer-register'),
    });
    setWorking(false);
    if (!result.ok || !result.data) {
      setError(result.error || 'SecurePay could not prepare this sandbox application. A Business KSNumber is required.');
      return;
    }
    setApplication(result.data);
    setStep(4);
  };

  const makeSecureCode = async () => {
    if (!application) return;
    setWorking(true); setError(null);
    const result = await issueSecureCode(session.accessToken, application.id, {
      buildType,
      moneyFlow: moneyFlow.label,
      appLocation: site.trim() || null,
      aiTool: connectionMethod === 'AI_HANDOFF' ? aiTool : connectionMethod,
    });
    setWorking(false);
    if (!result.ok || !result.data) {
      setError(result.error || 'SecurePay could not create the one-time SecureCode.');
      return;
    }
    setSecureCode(result.data);
  };

  const makeCredential = async () => {
    if (!application) return;
    setWorking(true); setError(null);
    const result = await issueDeveloperCredential(session.accessToken, application.id, {
      scopes: ['SANDBOX_SIMULATE', 'WEBHOOKS_MANAGE'], idempotencyKey: newKey('developer-credential'),
    });
    setWorking(false);
    if (!result.ok || !result.data) {
      setError(result.error || 'SecurePay could not issue a sandbox credential.');
      return;
    }
    setCredential(result.data);
  };

  const checkConnection = async () => {
    if (!application) return;
    setWorking(true); setError(null);
    const result = await getDeveloperIntegrationCheck(session.accessToken, application.id);
    setWorking(false);
    if (!result.ok || !result.data) {
      setError(result.error || 'SecurePay could not verify this connection yet.');
      return;
    }
    setIntegrationCheck(result.data);
  };

  return (
    <TraderShell>
      <TraderPageHeader
        eyebrow="Build with SecurePay"
        title="Bring what you built into the Market."
        description="Start with the business outcome, not API vocabulary. SecurePay maps the money movement underneath and shows the safest supported way to connect."
      />

      <div className="b9-live-developer mx-auto max-w-3xl">
        <div className="b9-live-developer-guide"><LivingSecurePayMark state={step === 4 && integrationCheck?.readyToTestTrade ? 'success' : 'guiding'} size="sm" presence="present" /><div><strong>SecurePay guides the connection.</strong><p>Your builder can implement the integration. SecurePay remains the authority that checks the connection and financial state.</p></div></div>
        <div className="mb-5 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-green-700 transition-all" style={{ width: `${progress}%` }} /></div>
          <span className="text-xs font-semibold text-ink/40">{step + 1}/5</span>
        </div>

        {error && <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <section className="b9-live-developer-room rounded-3xl border border-green-700/10 bg-white p-5 shadow-sm sm:p-7">
          {step === 0 && <>
            <Eyebrow>Start with the app</Eyebrow>
            <h2 className="mt-1 font-display text-3xl">What should we call what you are building?</h2>
            <input value={appName} onChange={event => setAppName(event.target.value)} placeholder="e.g. My Store" className="mt-6 min-h-14 w-full rounded-2xl border border-ink/15 px-4 text-base outline-none focus:border-green-600" />
            <input value={site} onChange={event => setSite(event.target.value)} placeholder="Website, GitHub repo, or 'still building' — optional" className="mt-3 min-h-12 w-full rounded-2xl border border-ink/10 px-4 text-sm outline-none focus:border-green-600" />
          </>}

          {step === 1 && <>
            <Eyebrow>What are you building?</Eyebrow>
            <h2 className="mt-1 font-display text-3xl">Choose the closest fit.</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">{DEVELOPER_BUILD_OPTIONS.map(option => <Choice key={option} selected={buildType === option} onClick={() => setBuildType(option)} title={option} />)}</div>
          </>}

          {step === 2 && <>
            <Eyebrow>How should money move?</Eyebrow>
            <h2 className="mt-1 font-display text-3xl">Describe the shape, not the API.</h2>
            <div className="mt-5 space-y-2">{DEVELOPER_MONEY_FLOWS.map(option => <Choice key={option.id} selected={moneyFlowId === option.id} onClick={() => setMoneyFlowId(option.id)} title={option.label} detail={option.description} />)}</div>
            <div className="mt-5 rounded-2xl bg-green-50/70 p-4 text-sm"><span className="font-semibold text-green-800">SecurePay understood:</span> <span className="text-ink/60">{structure}</span></div>
          </>}

          {step === 3 && <>
            <Eyebrow>How do you want to connect?</Eyebrow>
            <h2 className="mt-1 font-display text-3xl">Use the path that matches how you build.</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">{DEVELOPER_CONNECTION_METHODS.map(option => <Choice key={option.id} selected={connectionMethod === option.id} onClick={() => setConnectionMethod(option.id)} title={option.label} detail={option.description} />)}</div>
            {connectionMethod === 'AI_HANDOFF' && <div className="mt-5"><p className="mb-2 text-sm font-semibold">Which AI are you using?</p><div className="flex flex-wrap gap-2">{AI_OPTIONS.map(option => <button key={option} type="button" onClick={() => setAiTool(option)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${aiTool === option ? 'border-green-700 bg-green-50 text-green-800' : 'border-ink/10 bg-white text-ink/55'}`}>{option}</button>)}</div></div>}
          </>}

          {step === 4 && <>
            <Eyebrow>Your sandbox connection</Eyebrow>
            <h2 className="mt-1 font-display text-3xl">Get to a first test without exposing permanent secrets.</h2>
            {!application ? <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">The sandbox application has not been prepared yet.</div> : <div className="mt-6 rounded-2xl border border-green-700/10 bg-green-50/60 p-4"><p className="font-semibold">{application.name}</p><p className="mt-1 text-sm text-ink/50">{application.environment} · {application.status}</p><p className="mt-3 text-sm text-ink/55">Planned money structure: {structure}</p></div>}

            {application && connectionMethod === 'AI_HANDOFF' && !secureCode && <button type="button" onClick={() => void makeSecureCode()} disabled={working} className="sp-btn-primary mt-5 inline-flex min-h-12 items-center gap-2 px-5 text-sm disabled:opacity-50"><LockKeyhole size={16} /> {working ? 'Creating…' : 'Create one-time SecureCode'}</button>}
            {secureCode && <div className="mt-5 rounded-2xl border border-green-700/10 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">SecureCode</p><div className="mt-2 flex items-center gap-2 rounded-xl bg-green-50/70 p-3"><code className="min-w-0 flex-1 break-all text-sm font-bold">{secureCode.secureCode}</code><button type="button" aria-label="Copy SecureCode" onClick={() => void navigator.clipboard.writeText(secureCode.secureCode)} className="flex size-10 items-center justify-center rounded-full text-green-700"><Copy size={16} /></button></div><div className="mt-4 rounded-xl bg-ink/[0.025] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Give this instruction to {aiTool}</p><button type="button" aria-label="Copy AI instruction" onClick={() => void navigator.clipboard.writeText(aiInstruction)} className="flex size-10 items-center justify-center rounded-full text-green-700"><Copy size={16} /></button></div><p className="mt-2 line-clamp-4 text-xs leading-5 text-ink/50">{aiInstruction}</p></div></div>}

            {application && connectionMethod === 'API_SDK' && !credential && <button type="button" onClick={() => void makeCredential()} disabled={working} className="sp-btn-primary mt-5 inline-flex min-h-12 items-center gap-2 px-5 text-sm disabled:opacity-50"><KeyRound size={16} /> {working ? 'Issuing…' : 'Create sandbox credential'}</button>}
            {credential && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Credential issued once.</p><p className="mt-1">Store it in your app's secret manager. Do not paste permanent credentials into an AI conversation.</p><code className="mt-3 block break-all rounded-xl bg-white/70 p-3 text-xs">Client ID: {credential.clientId}</code></div>}

            {application && ['HOSTED_PAGE', 'PLUGIN'].includes(connectionMethod) && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">This connection preference is captured for the journey, but SecurePay has not returned a dedicated production connector for it on this backend yet. No fake connector is created.</div>}

            {application && <div className="mt-6 rounded-2xl border border-ink/8 bg-white p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">SecurePay Integration Check</p><p className="mt-1 text-xs text-ink/45">SecurePay — not your AI — decides when the sandbox connection is ready to test.</p></div><button type="button" onClick={() => void checkConnection()} disabled={working} className="flex size-11 items-center justify-center rounded-full text-green-700 disabled:opacity-50"><RefreshCw size={17} /></button></div>{integrationCheck && <div className="mt-4 grid gap-2 sm:grid-cols-2"><Check label="Application" ok={integrationCheck.applicationConnected} /><Check label="Identity" ok={integrationCheck.identityConnected} /><Check label="Credentials" ok={integrationCheck.credentialsWorking} /><Check label="Status updates" ok={integrationCheck.statusUpdatesConnected} /><Check label="Callbacks" ok={integrationCheck.callbacksConnected} /><Check label="Ready to test trade" ok={integrationCheck.readyToTestTrade} /></div>}</div>}
          </>}

          {step < 4 && <div className="mt-7 flex items-center justify-between gap-3"><button type="button" onClick={() => setStep(Math.max(0, step - 1) as Step)} disabled={step === 0} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink/50 disabled:opacity-0"><ArrowLeft size={16} /> Back</button>{step === 3 ? <button type="button" onClick={() => void prepareApplication()} disabled={working || !appName.trim() || !user.ksNumber} className="sp-btn-primary inline-flex min-h-12 items-center gap-2 px-5 text-sm disabled:opacity-50"><LockKeyhole size={16} /> {working ? 'Preparing…' : 'Prepare sandbox'} </button> : <button type="button" onClick={() => setStep((step + 1) as Step)} disabled={step === 0 && !appName.trim()} className="sp-btn-primary inline-flex min-h-12 items-center gap-2 px-5 text-sm disabled:opacity-50">Next <ArrowRight size={16} /></button>}</div>}
        </section>
        <div className="b9-live-developer-law"><LivingSecurePayMark state="resting" size="xs" presence="polite" /><p>Permanent secrets stay in a secret manager. Payment Ready, settlement, release authority, fees and financial state remain SecurePay backend truth.</p></div>
      </div>
    </TraderShell>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">{children}</p>; }
function Choice({ selected, onClick, title, detail }: { selected: boolean; onClick: () => void; title: string; detail?: string }) { return <button type="button" onClick={onClick} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-green-700 bg-green-50/70 shadow-sm' : 'border-ink/10 bg-white hover:border-green-700/30'}`}><p className="text-sm font-bold text-ink/80">{title}</p>{detail && <p className="mt-1 text-xs leading-5 text-ink/45">{detail}</p>}</button>; }
function Check({ label, ok }: { label: string; ok: boolean }) { return <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${ok ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>{ok ? <CheckCircle2 size={15} /> : <span className="size-3.5 rounded-full border border-current" />}<span>{label}</span></div>; }
