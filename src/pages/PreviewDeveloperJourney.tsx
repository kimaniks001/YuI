import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Code2, Copy,
  HelpCircle, KeyRound, LockKeyhole, Package, Search,
  ShoppingBag, Store, Users, Wrench, Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  DEVELOPER_BUILD_OPTIONS,
  DEVELOPER_CONNECTION_METHODS,
  DEVELOPER_MONEY_FLOWS,
  developerStructureLabel,
  type DeveloperConnectionMethod,
} from '../lib/developerJourney';

const AI_OPTIONS = ['ChatGPT', 'Claude', 'Codex', 'Cursor', 'Lovable', 'Replit', 'Other'] as const;
type Step = 0 | 1 | 2 | 3 | 4;

const STEP_LABELS = ['Your build', 'Money shape', 'Connection', 'Sandbox', 'Ready to test'];

const BUILD_ICONS = [Store, Wrench, ShoppingBag, Users, Package, Code2];

export default function PreviewDeveloperJourney() {
  const [step, setStep] = useState<Step>(0);
  const [appName, setAppName] = useState('My Store');
  const [buildType, setBuildType] = useState<(typeof DEVELOPER_BUILD_OPTIONS)[number]>('Online shop or digital store');
  const [moneyFlowId, setMoneyFlowId] = useState('one-one');
  const [connectionMethod, setConnectionMethod] = useState<DeveloperConnectionMethod>('AI_HANDOFF');
  const [aiTool, setAiTool] = useState<(typeof AI_OPTIONS)[number]>('ChatGPT');
  const [site, setSite] = useState('still building');
  const [secureCodeShown, setSecureCodeShown] = useState(false);
  const [checked, setChecked] = useState(false);

  const moneyFlow = DEVELOPER_MONEY_FLOWS.find(option => option.id === moneyFlowId) ?? DEVELOPER_MONEY_FLOWS[0];
  const structure = developerStructureLabel(moneyFlow.topology);
  const secureCode = 'SP-DEMO-7Q4K-92MX';

  const aiInstruction = useMemo(() => (
    `Connect ${appName || 'my application'} to SecurePay using SecureCode ${secureCode}. Preserve the app's existing logic. Use only SecurePay capabilities returned by the sandbox. Never calculate or invent Payment Ready, settlement, release authority, agreement authority or fee truth in the client.`
  ), [appName]);

  const markState = step === 3 ? 'listening' : step === 4 && checked ? 'success' : 'guiding';

  return (
    <main className="b9-dev-page">
      <header className="b9-dev-topbar">
        <Link to="/preview/market" className="b9-dev-brand" aria-label="Return to Market preview">
          <LivingSecurePayMark state="resting" size="sm" presence="polite" />
          <span>Developer Market</span>
        </Link>
        <div className="b9-dev-toplinks">
          <Link to="/preview/help"><HelpCircle size={14} /> Help</Link>
          <Link to="/preview/trust"><BookOpen size={14} /> Trust & boundaries</Link>
        </div>
      </header>

      <section className="b9-dev-hero">
        <div>
          <p className="b9-kicker">Build with SecurePay</p>
          <h1>Bring what you built into the Market.</h1>
          <p>Start with the business outcome, not API vocabulary. SecurePay translates the money movement underneath and shows the safest supported way to connect.</p>
        </div>
        <div className="b9-dev-lighthouse" aria-label="SecurePay is guiding this setup">
          <LivingSecurePayMark state={markState} size="lg" presence={step === 4 ? 'commanding' : 'present'} />
          <span>{step === 4 ? 'SecurePay checks the connection' : 'SecurePay guides the connection'}</span>
        </div>
      </section>

      <section className="b9-dev-shell">
        <aside className="b9-dev-rail">
          <div className="b9-dev-steps" aria-label="Developer setup progress">
            {STEP_LABELS.map((label, index) => (
              <button key={label} type="button" onClick={() => index <= step && setStep(index as Step)} className={index === step ? 'is-current' : index < step ? 'is-done' : ''}>
                <span>{index < step ? <CheckCircle2 size={15} /> : index + 1}</span>
                <strong>{label}</strong>
              </button>
            ))}
          </div>

          <div className="b9-dev-summary">
            <p className="b9-label">SecurePay understood</p>
            <SummaryLine label="Build" value={appName || 'Not named yet'} />
            <SummaryLine label="Type" value={buildType} />
            <SummaryLine label="Money" value={moneyFlow.label} />
            <SummaryLine label="Structure" value={structure} strong />
            <SummaryLine label="Connect" value={DEVELOPER_CONNECTION_METHODS.find(item => item.id === connectionMethod)?.label ?? connectionMethod} />
          </div>
        </aside>

        <section className="b9-dev-room">
          <div className="b9-dev-room-head">
            <LivingSecurePayMark state={markState} size="sm" presence="polite" />
            <div>
              <p className="b9-label">Step {step + 1} of 5 · {STEP_LABELS[step]}</p>
              <p className="b9-dev-reassurance">You do not need to know SecurePay terminology first.</p>
            </div>
          </div>

          {step === 0 && (
            <div className="b9-dev-step-content">
              <h2>What did you build?</h2>
              <p>Give SecurePay the name and the closest everyday description. Technical details can come later.</p>
              <label className="b9-field-label" htmlFor="b9-app-name">What should we call it?</label>
              <input id="b9-app-name" value={appName} onChange={event => setAppName(event.target.value)} placeholder="e.g. Mtaa Furnitures" className="b9-input b9-input--large" />
              <label className="b9-field-label" htmlFor="b9-site">Where is it?</label>
              <input id="b9-site" value={site} onChange={event => setSite(event.target.value)} placeholder="Website, GitHub repo, Lovable project, or 'still building'" className="b9-input" />
              <div className="b9-build-grid">
                {DEVELOPER_BUILD_OPTIONS.map((option, index) => {
                  const Icon = BUILD_ICONS[index] ?? Code2;
                  return <Choice key={option} selected={buildType === option} onClick={() => setBuildType(option)} title={option} icon={<Icon size={17} />} />;
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="b9-dev-step-content">
              <h2>What should money do?</h2>
              <p>Describe who pays and who should receive. SecurePay maps that to the right agreement structure underneath.</p>
              <div className="b9-flow-choices">
                {DEVELOPER_MONEY_FLOWS.map(option => (
                  <Choice key={option.id} selected={moneyFlowId === option.id} onClick={() => setMoneyFlowId(option.id)} title={option.label} detail={option.description} />
                ))}
              </div>
              <div className="b9-understood-card">
                <LivingSecurePayMark state="guiding" size="sm" presence="polite" />
                <div><span>SecurePay maps this to</span><strong>{structure}</strong><p>The customer-facing experience can still use natural language. The topology is infrastructure, not homework.</p></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="b9-dev-step-content">
              <h2>How do you want to connect?</h2>
              <p>Choose the route that matches how you already build. SecurePay should adapt to the builder, not force every builder into the API console.</p>
              <div className="b9-connection-grid">
                {DEVELOPER_CONNECTION_METHODS.map(option => (
                  <Choice key={option.id} selected={connectionMethod === option.id} onClick={() => setConnectionMethod(option.id)} title={option.label} detail={option.description} icon={connectionIcon(option.id)} />
                ))}
              </div>
              {connectionMethod === 'AI_HANDOFF' && (
                <div className="b9-ai-strip">
                  <p>Which builder are you using?</p>
                  <div>{AI_OPTIONS.map(option => <button key={option} type="button" onClick={() => setAiTool(option)} className={aiTool === option ? 'is-selected' : ''}>{option}</button>)}</div>
                </div>
              )}
              {['HOSTED_PAGE', 'PLUGIN'].includes(connectionMethod) && <div className="b9-boundary-note"><LivingSecurePayMark state="caution" size="xs" presence="present" /><p>This route is part of the intended developer experience, but this preview does not claim a production connector exists before SecurePay exposes one.</p></div>}
            </div>
          )}

          {step === 3 && (
            <div className="b9-dev-step-content">
              <h2>Try the connection safely first.</h2>
              <p>The sandbox is the rehearsal room. Test the journey, events and callbacks before any production credential is involved.</p>
              <div className="b9-sandbox-card">
                <div className="b9-sandbox-title"><span><Zap size={17} /></span><div><strong>{appName || 'My application'}</strong><p>SANDBOX · PREVIEW ONLY · {structure}</p></div></div>
                {connectionMethod === 'AI_HANDOFF' ? (
                  <>
                    {!secureCodeShown ? <button type="button" onClick={() => setSecureCodeShown(true)} className="b9-primary"><LockKeyhole size={16} /> Preview one-time SecureCode</button> : (
                      <div className="b9-code-panel">
                        <div><p className="b9-label">Demo one-time SecureCode</p><code>{secureCode}</code><button type="button" aria-label="Copy demo SecureCode" onClick={() => void navigator.clipboard.writeText(secureCode)}><Copy size={16} /></button></div>
                        <article><strong>Give this to {aiTool}</strong><p>{aiInstruction}</p></article>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="b9-boundary-note"><LivingSecurePayMark state="guiding" size="xs" presence="polite" /><p>SecurePay will show only connection methods actually available for this environment. This preview does not create credentials or callbacks.</p></div>
                )}
              </div>
              <div className="b9-secret-law"><KeyRound size={17} /><div><strong>Permanent secrets do not belong in chat.</strong><p>Short-lived handoff can guide an AI builder. Long-lived credentials belong in your application secret manager.</p></div></div>
            </div>
          )}

          {step === 4 && (
            <div className="b9-dev-step-content">
              <h2>SecurePay checks. Your AI does not certify itself.</h2>
              <p>The integration becomes ready because SecurePay can observe the required connection facts — not because a coding agent says “done”.</p>
              <div className="b9-integration-workbench">
                <div className="b9-check-card">
                  <div className="b9-check-head"><LivingSecurePayMark state={checked ? 'success' : 'guiding'} size="sm" presence={checked ? 'commanding' : 'present'} /><div><strong>Integration Check</strong><p>Preview only — no backend call.</p></div></div>
                  <button type="button" onClick={() => setChecked(true)} className="b9-primary">Run preview check <ArrowRight size={15} /></button>
                  <div className="b9-check-grid">
                    <Check label="Sandbox application" ok={checked} />
                    <Check label="SecurePay identity" ok={checked} />
                    <Check label="Scoped credential" ok={checked} />
                    <Check label="Status events" ok={checked} />
                    <Check label="Callback endpoint" ok={checked} optional />
                    <Check label="Test agreement journey" ok={checked} />
                  </div>
                </div>
                <div className="b9-event-card">
                  <p className="b9-label">Example sandbox event</p>
                  <div className="b9-event-line"><span>event</span><strong>agreement.updated</strong></div>
                  <div className="b9-event-line"><span>environment</span><strong>SANDBOX</strong></div>
                  <div className="b9-event-line"><span>authority</span><strong>SecurePay API</strong></div>
                  <p className="b9-event-note">Your application can react to a SecurePay event. It must not manufacture Payment Ready, settlement, release authority or fee truth.</p>
                </div>
              </div>
              <div className="b9-production-gate"><LivingSecurePayMark state="caution" size="xs" presence="present" /><div><strong>Production is a separate gate.</strong><p>Passing a sandbox demonstration is not production approval. SecurePay must expose and verify the production capabilities before this application can rely on them.</p></div></div>
            </div>
          )}

          <div className="b9-dev-actions">
            <button type="button" onClick={() => setStep(Math.max(0, step - 1) as Step)} disabled={step === 0} className="b9-secondary"><ArrowLeft size={15} /> Back</button>
            {step < 4 && <button type="button" onClick={() => setStep((step + 1) as Step)} disabled={step === 0 && !appName.trim()} className="b9-primary">{step === 3 ? 'Open integration check' : 'Continue'} <ArrowRight size={15} /></button>}
          </div>
        </section>
      </section>

      <section className="b9-dev-bottom-law">
        <LivingSecurePayMark state="resting" size="xs" presence="polite" />
        <p><strong>Developer law:</strong> the integration may display SecurePay truth and request actions; it does not become the authority that decides financial truth.</p>
        <Link to="/preview/help"><Search size={14} /> Learn how SecurePay works</Link>
      </section>
    </main>
  );
}

function SummaryLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="b9-summary-line"><span>{label}</span><strong className={strong ? 'is-strong' : ''}>{value}</strong></div>;
}

function Choice({ selected, onClick, title, detail, icon }: { selected: boolean; onClick: () => void; title: string; detail?: string; icon?: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`b9-choice ${selected ? 'is-selected' : ''}`}>{icon && <span className="b9-choice-icon">{icon}</span>}<span><strong>{title}</strong>{detail && <small>{detail}</small>}</span>{selected && <CheckCircle2 size={16} className="b9-choice-check" />}</button>;
}

function Check({ label, ok, optional = false }: { label: string; ok: boolean; optional?: boolean }) {
  return <div className={ok ? 'is-ok' : ''}><span>{ok ? <CheckCircle2 size={14} /> : '·'}</span><p>{label}{optional ? ' (when used)' : ''}</p></div>;
}

function connectionIcon(id: DeveloperConnectionMethod) {
  if (id === 'AI_HANDOFF') return <Zap size={17} />;
  if (id === 'HOSTED_PAGE') return <Store size={17} />;
  if (id === 'PLUGIN') return <Package size={17} />;
  return <Code2 size={17} />;
}
