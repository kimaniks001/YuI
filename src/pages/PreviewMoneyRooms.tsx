import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BookOpen,
  Building2,
  Clock3,
  Landmark,
  ReceiptText,
  RefreshCw,
  Smartphone,
  WalletCards,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

type MoneyStage =
  | 'ready'
  | 'request-sent'
  | 'confirmed'
  | 'payment-ready'
  | 'settling'
  | 'settled'
  | 'attention'
  | 'account'
  | 'statement';

type StageConfig = {
  id: MoneyStage;
  short: string;
  title: string;
  strap: string;
  mark: 'guiding' | 'waiting' | 'success' | 'complete' | 'caution' | 'resting';
  presence: 'polite' | 'present' | 'commanding';
  tone: 'green' | 'cream' | 'orange';
};

const stages: StageConfig[] = [
  { id: 'ready', short: 'Ready to pay', title: 'Choose how this agreement should be funded.', strap: 'The backend says you are authorised to fund this agreement. No payment has been initiated yet.', mark: 'guiding', presence: 'present', tone: 'green' },
  { id: 'request-sent', short: 'Request sent', title: 'The payment request is out. SecurePay is waiting for the provider.', strap: 'A payment request has been initiated. This is not yet proof that money was received.', mark: 'waiting', presence: 'present', tone: 'cream' },
  { id: 'confirmed', short: 'Payment confirmed', title: 'SecurePay has confirmation for this payment intent.', strap: 'The provider result has been normalised into SecurePay payment truth. That still does not automatically mean the agreement is ready for release.', mark: 'success', presence: 'present', tone: 'green' },
  { id: 'payment-ready', short: 'Payment Ready', title: 'The agreement has reached Payment Ready.', strap: 'This state is shown only because the backend evaluation says READY. The browser never calculates it.', mark: 'success', presence: 'commanding', tone: 'green' },
  { id: 'settling', short: 'Settling', title: 'A release instruction exists. Settlement is still in progress.', strap: 'Instruction creation is not settlement. SecurePay keeps the trader in a waiting state until execution truth is known.', mark: 'waiting', presence: 'present', tone: 'cream' },
  { id: 'settled', short: 'Settled', title: 'Settlement is complete for this agreement stage.', strap: 'SecurePay can now show a settled state because execution has been confirmed by the backend.', mark: 'complete', presence: 'present', tone: 'green' },
  { id: 'attention', short: 'Needs attention', title: 'The payment did not complete. Nothing should be guessed.', strap: 'SecurePay explains what happened, whether another action is available, and avoids turning uncertainty into a false success or failure claim.', mark: 'caution', presence: 'commanding', tone: 'orange' },
  { id: 'account', short: 'Settlement account', title: 'Know where matured agreement money may settle.', strap: 'Your Settlement Account is separate from the KSNumber virtual account used inside SecurePay. This room does not present either as a wallet balance.', mark: 'guiding', presence: 'present', tone: 'green' },
  { id: 'statement', short: 'Statement', title: 'See what SecurePay actually posted.', strap: 'Statement lines remain attached to the exact KSNumber and ledger account that produced them. No combined Market balance is invented.', mark: 'resting', presence: 'polite', tone: 'cream' },
];

const statementLines = [
  { label: 'Agreement funding confirmed', detail: 'Generator purchase · KS2145', amount: 'KES 85,000.00', side: 'CREDIT', time: '21 Aug · 10:42' },
  { label: 'Settlement instruction posted', detail: 'Website work · KS2145', amount: 'KES 85,000.00', side: 'DEBIT', time: '20 Aug · 16:08' },
  { label: 'Settlement completed', detail: 'Website work · KS2145', amount: 'KES 85,000.00', side: 'DEBIT', time: '20 Aug · 16:11' },
];

function MoneyPath({ active }: { active: MoneyStage }) {
  const steps: Array<{ id: MoneyStage; label: string }> = [
    { id: 'ready', label: 'Choose rail' },
    { id: 'request-sent', label: 'Provider' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'payment-ready', label: 'Payment Ready' },
    { id: 'settling', label: 'Settlement' },
    { id: 'settled', label: 'Settled' },
  ];
  const activeIndex = steps.findIndex(step => step.id === active);
  if (activeIndex < 0) return null;

  return (
    <div className="sp-money-path" aria-label="Illustrative money journey">
      {steps.map((step, index) => (
        <div key={step.id} className={`sp-money-path__step ${index < activeIndex ? 'is-past' : ''} ${index === activeIndex ? 'is-current' : ''}`}>
          <span className="sp-money-path__dot" aria-hidden="true" />
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function TruthStrip({ stage }: { stage: MoneyStage }) {
  if (stage === 'account') {
    return (
      <div className="sp-money-truth-strip">
        <TruthFact eyebrow="SecurePay side" value="KSNumber virtual account" note="Used inside SecurePay to receive and route agreement money." />
        <TruthFact eyebrow="Your destination" value="Settlement Account" note="Exactly one verified destination receives matured settlement." />
        <TruthFact eyebrow="Important" value="Not a combined wallet" note="SecurePay does not merge identities, agreements or ledger accounts into one spendable balance." />
      </div>
    );
  }

  if (stage === 'statement') {
    return (
      <div className="sp-money-truth-strip">
        <TruthFact eyebrow="Statement for" value="KS2145" note="One backend-authorised identity at a time." />
        <TruthFact eyebrow="Entries" value="Posted ledger facts" note="Debit and credit are shown as recorded, not reinterpreted as spendable money." />
        <TruthFact eyebrow="Combined balance" value="Not shown" note="Separate ledger accounts remain separate." />
      </div>
    );
  }

  return (
    <div className="sp-money-truth-strip">
      <TruthFact eyebrow="Agreement" value="House painting" note="Agreement amount: KES 60,000" />
      <TruthFact eyebrow="Payer" value="You · KS2145" note="Funding authority is backend-derived from the agreement." />
      <TruthFact eyebrow="Recipient" value="Kamau Decorators · KS8814" note="Recipient identity stays distinct from creator and payer." />
    </div>
  );
}

function TruthFact({ eyebrow, value, note }: { eyebrow: string; value: string; note: string }) {
  return (
    <div className="sp-money-truth-fact">
      <p>{eyebrow}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}

function RailChoice() {
  return (
    <section className="sp-money-panel sp-money-panel--focus" aria-labelledby="rail-heading">
      <div className="sp-money-panel__heading">
        <div>
          <p className="sp-money-kicker">How would you like to pay?</p>
          <h2 id="rail-heading">Choose an eligible payment method.</h2>
          <p>Only rails returned by SecurePay for this agreement belong here.</p>
        </div>
        <LivingSecurePayMark state="guiding" size="md" presence="present" />
      </div>
      <div className="sp-money-rails">
        <button type="button" className="sp-money-rail is-selected">
          <span className="sp-money-rail__icon"><Smartphone size={20} /></span>
          <span><strong>M-Pesa</strong><small>Pay by STK request</small></span>
          <span className="sp-money-rail__meta">Eligible</span>
        </button>
        <button type="button" className="sp-money-rail">
          <span className="sp-money-rail__icon"><Landmark size={20} /></span>
          <span><strong>PesaLink</strong><small>Quote available before initiation</small></span>
          <span className="sp-money-rail__meta">Eligible</span>
        </button>
      </div>
      <div className="sp-money-breakdown">
        <div><span>Agreement amount</span><strong>KES 60,000</strong></div>
        <div><span>Provider charge</span><strong>Shown from quote/provider truth</strong></div>
        <div><span>SecurePay charge</span><strong>Backend commercial rule only</strong></div>
        <div className="sp-money-breakdown__total"><span>Total you will authorise</span><strong>Confirmed before payment</strong></div>
      </div>
      <button type="button" className="sp-money-primary" disabled>Continue with selected method</button>
      <p className="sp-money-preview-note">Visual fixture only — this review room never initiates payment.</p>
    </section>
  );
}

function ProviderWaiting() {
  return (
    <section className="sp-money-panel sp-money-panel--waiting">
      <div className="sp-money-panel__heading">
        <div><p className="sp-money-kicker">Payment request</p><h2>Waiting for the provider result.</h2><p>The request exists, but SecurePay has not yet received authoritative confirmation.</p></div>
        <LivingSecurePayMark state="waiting" size="lg" presence="present" />
      </div>
      <div className="sp-money-event-card">
        <Smartphone size={20} />
        <div><strong>M-Pesa request sent</strong><span>Request sent to the payment rail. Complete the action on your phone if prompted.</span></div>
        <span className="sp-money-status-pill">Waiting</span>
      </div>
      <div className="sp-money-meaning"><strong>What this means</strong><p>SecurePay has initiated a payment attempt. It does not yet describe the agreement as funded or the money as received.</p></div>
    </section>
  );
}

function ConfirmedPanel({ paymentReady }: { paymentReady: boolean }) {
  return (
    <section className="sp-money-panel sp-money-panel--success">
      <div className="sp-money-panel__heading">
        <div>
          <p className="sp-money-kicker">{paymentReady ? 'Agreement money state' : 'Payment confirmation'}</p>
          <h2>{paymentReady ? 'Payment Ready is true.' : 'This payment intent is confirmed.'}</h2>
          <p>{paymentReady ? 'The backend evaluation has satisfied the conditions required for Payment Ready.' : 'Payment confirmation is one fact in the agreement. Release readiness remains a separate evaluation.'}</p>
        </div>
        <LivingSecurePayMark state="success" size="lg" presence={paymentReady ? 'commanding' : 'present'} />
      </div>
      <div className="sp-money-two-col">
        <div className="sp-money-metric"><span>Agreement amount</span><strong>KES 60,000</strong><small>Exact agreement context</small></div>
        <div className="sp-money-metric"><span>{paymentReady ? 'Payment Ready' : 'Payment intent'}</span><strong>{paymentReady ? 'READY' : 'CONFIRMED'}</strong><small>{paymentReady ? 'Backend evaluation only' : 'Provider-normalised payment state'}</small></div>
      </div>
      <div className="sp-money-meaning"><strong>What happens next</strong><p>{paymentReady ? 'An authorised payer may review the exact release step. The UI does not release automatically.' : 'SecurePay continues evaluating the agreement conditions. A confirmed payment does not by itself authorise release.'}</p></div>
    </section>
  );
}

function SettlementPanel({ settled }: { settled: boolean }) {
  return (
    <section className={`sp-money-panel ${settled ? 'sp-money-panel--success' : 'sp-money-panel--waiting'}`}>
      <div className="sp-money-panel__heading">
        <div><p className="sp-money-kicker">Settlement</p><h2>{settled ? 'Settlement confirmed.' : 'Settlement is still in progress.'}</h2><p>{settled ? 'Execution truth confirms this agreement stage has settled.' : 'A release instruction exists. SecurePay is still waiting for the settlement execution result.'}</p></div>
        <LivingSecurePayMark state={settled ? 'complete' : 'waiting'} size="lg" presence="present" />
      </div>
      <div className="sp-money-settlement-route">
        <div><span className="sp-money-route-icon"><Banknote size={18} /></span><strong>Agreement</strong><small>House painting</small></div>
        <ArrowRight size={18} className="sp-money-route-arrow" />
        <div><span className="sp-money-route-icon"><Landmark size={18} /></span><strong>Verified destination</strong><small>Recipient Settlement Account</small></div>
      </div>
      <div className="sp-money-meaning"><strong>{settled ? 'What this means' : 'While you wait'}</strong><p>{settled ? 'SecurePay may now show the agreement stage as settled. This does not create a general wallet balance.' : 'Nothing else is required from you unless SecurePay reports an exception or another action.'}</p></div>
    </section>
  );
}

function AttentionPanel() {
  return (
    <section className="sp-money-panel sp-money-panel--attention">
      <div className="sp-money-panel__heading">
        <div><p className="sp-money-kicker">Needs your attention</p><h2>The payment attempt did not complete.</h2><p>SecurePay has a failed attempt state and says another attempt may be available.</p></div>
        <LivingSecurePayMark state="caution" size="lg" presence="commanding" />
      </div>
      <div className="sp-money-meaning sp-money-meaning--attention"><strong>What happened</strong><p>The provider did not confirm this payment attempt.</p></div>
      <div className="sp-money-meaning"><strong>What it means</strong><p>No success state is shown. SecurePay keeps this attempt separate from any future retry.</p></div>
      <div className="sp-money-meaning"><strong>What you can do next</strong><p>Where the backend says retry is eligible, create a new payment attempt using the agreement's current funding options.</p></div>
      <button type="button" className="sp-money-secondary" disabled><RefreshCw size={16} /> Try again</button>
      <p className="sp-money-preview-note">Preview only — the retry button is intentionally disabled.</p>
    </section>
  );
}

function AccountPanel() {
  return (
    <div className="sp-money-account-layout">
      <section className="sp-money-panel sp-money-panel--focus">
        <div className="sp-money-panel__heading">
          <div><p className="sp-money-kicker">Your Settlement Account</p><h2>One verified destination for matured settlement.</h2><p>SecurePay keeps the destination separate from the KSNumber virtual account used inside the agreement network.</p></div>
          <LivingSecurePayMark state="guiding" size="lg" presence="present" />
        </div>
        <div className="sp-money-destination-card">
          <span className="sp-money-route-icon"><Landmark size={20} /></span>
          <div><small>Verified destination</small><strong>Bank account · ending 4512</strong><span>Illustrative display only — production reads the verified destination from backend authority.</span></div>
          <span className="sp-money-status-pill sp-money-status-pill--good">Verified</span>
        </div>
        <div className="sp-money-destination-grid">
          <Destination icon={<Building2 size={18} />} title="Bank account" detail="Eligible verified bank destination." />
          <Destination icon={<Smartphone size={18} />} title="Mobile money" detail="Eligible mobile-money destination, subject to provider limits." />
          <Destination icon={<WalletCards size={18} />} title="Partner account" detail="An approved partner current/digital account where supported." />
        </div>
      </section>
      <aside className="sp-money-panel sp-money-panel--quiet">
        <p className="sp-money-kicker">Important distinction</p>
        <h2>Your KSNumber is not a bank account.</h2>
        <p>The virtual account is SecurePay infrastructure for routing agreement money. Your Settlement Account is the verified destination where matured settlement may be sent.</p>
        <div className="sp-money-small-rule"><strong>KES 100 test</strong><span>The activation test is the holder's money and is separate from platform fees.</span></div>
        <div className="sp-money-small-rule"><strong>Changing destination</strong><span>Security-sensitive. The UI must not offer an instant switch unless the backend exposes the required verification flow.</span></div>
      </aside>
    </div>
  );
}

function Destination({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="sp-money-destination-type"><span>{icon}</span><strong>{title}</strong><small>{detail}</small></div>;
}

function StatementPanel() {
  return (
    <section className="sp-money-panel sp-money-panel--statement">
      <div className="sp-money-panel__heading">
        <div><p className="sp-money-kicker">KS2145 · Statement</p><h2>A record of what SecurePay actually posted.</h2><p>Entries are ledger records, not a reconstruction of a wallet balance.</p></div>
        <LivingSecurePayMark state="resting" size="lg" presence="polite" />
      </div>
      <div className="sp-money-statement-rule"><BookOpen size={17} /><span>Debit and credit are shown exactly as recorded. This page does not reinterpret them as money available to spend.</span></div>
      <div className="sp-money-statement-lines">
        {statementLines.map(line => (
          <div key={`${line.label}-${line.time}`} className="sp-money-statement-line">
            <span className="sp-money-route-icon"><ReceiptText size={17} /></span>
            <div className="sp-money-statement-copy"><strong>{line.label}</strong><span>{line.detail}</span><small><Clock3 size={11} /> {line.time}</small></div>
            <div className="sp-money-statement-amount"><strong>{line.amount}</strong><span>{line.side}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StageBody({ stage }: { stage: MoneyStage }) {
  switch (stage) {
    case 'ready': return <RailChoice />;
    case 'request-sent': return <ProviderWaiting />;
    case 'confirmed': return <ConfirmedPanel paymentReady={false} />;
    case 'payment-ready': return <ConfirmedPanel paymentReady />;
    case 'settling': return <SettlementPanel settled={false} />;
    case 'settled': return <SettlementPanel settled />;
    case 'attention': return <AttentionPanel />;
    case 'account': return <AccountPanel />;
    case 'statement': return <StatementPanel />;
    default: return null;
  }
}

export default function PreviewMoneyRooms() {
  const [stage, setStage] = useState<MoneyStage>('ready');
  const current = useMemo(() => stages.find(item => item.id === stage) ?? stages[0], [stage]);

  return (
    <main className="sp-money-review">
      <div className="sp-money-review__ambient" aria-hidden="true"><LivingSecurePayMark state="resting" size="lg" presence="polite" decorative /></div>
      <div className="sp-money-review__shell">
        <header className="sp-money-review__topbar">
          <Link to="/review" className="sp-money-back"><ArrowLeft size={16} /> Review room</Link>
          <span className="sp-money-review__badge">V8 · Money Rooms · fixture only</span>
        </header>

        <section className={`sp-money-hero sp-money-hero--${current.tone}`}>
          <div>
            <p className="sp-money-kicker">My Market · Money</p>
            <h1>{current.title}</h1>
            <p>{current.strap}</p>
          </div>
          <LivingSecurePayMark state={current.mark} size="lg" presence={current.presence} />
        </section>

        <div className="sp-money-stage-tabs" role="tablist" aria-label="Money room states">
          {stages.map(item => (
            <button key={item.id} type="button" role="tab" aria-selected={stage === item.id} onClick={() => setStage(item.id)} className={stage === item.id ? 'is-active' : ''}>{item.short}</button>
          ))}
        </div>

        <TruthStrip stage={stage} />
        <MoneyPath active={stage} />
        <StageBody stage={stage} />

        <section className="sp-money-law">
          <LivingSecurePayMark state="resting" size="sm" presence="polite" />
          <div><strong>Money should follow the agreement.</strong><span>These visual states explain backend truth. They never create funding, Payment Ready, release, settlement, balance, fee or destination truth in the browser.</span></div>
        </section>
      </div>
    </main>
  );
}
