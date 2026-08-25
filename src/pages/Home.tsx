import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  HandHeart,
  Handshake,
  Menu,
  ShoppingCart,
  Store,
  Wrench,
  X,
} from 'lucide-react';
import SecurePayLogo from '../components/SecurePayLogo';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  createCreationIntentFromText,
  saveCreationIntent,
  type CreationIntent,
} from '../lib/creationIntent';

interface HomeProps {
  reviewMode?: boolean;
}

type IntentOption = {
  label: string;
  prompt: string;
  icon: typeof ShoppingCart;
};

type Door = {
  family: 'trade' | 'life';
  eyebrow: string;
  title: string;
  blurb: string;
  options: IntentOption[];
};

const DEFAULT_EXAMPLE = "I'm buying a generator for KES 85,000 and collecting it on Saturday.";

const DOORS: Door[] = [
  {
    family: 'trade',
    eyebrow: 'Trade',
    title: 'Buy, sell and hire with confidence.',
    blurb: 'Practical deals between people who need one clear agreement.',
    options: [
      { label: 'Buy goods', prompt: DEFAULT_EXAMPLE, icon: ShoppingCart },
      { label: 'Hire a fundi', prompt: "I'm hiring James to tile my shop for KES 40,000, half now and half when the work is complete.", icon: Wrench },
      { label: 'Sell goods', prompt: "I'm selling 20 bags of cement at KES 850 each and the buyer collects tomorrow.", icon: Store },
      { label: 'Get paid for work', prompt: 'I designed a logo for KES 25,000, to be paid once the client confirms the agreed work is complete.', icon: Handshake },
    ],
  },
  {
    family: 'life',
    eyebrow: 'Life & Support',
    title: 'Support the people you care about.',
    blurb: 'Family, school and community arrangements handled with dignity and clear intent.',
    options: [
      { label: 'School fees', prompt: "We're contributing towards our niece's school fees this term.", icon: BookOpen },
      { label: 'Support family', prompt: 'I want to support my mother with KES 10,000 for her monthly shopping.', icon: HandHeart },
      { label: 'Contribute together', prompt: "We are contributing KES 20,000 each towards Lucy's wedding.", icon: Handshake },
      { label: 'Help someone', prompt: 'I want to help a friend with KES 8,000 for a hospital bill this week.', icon: HandHeart },
    ],
  },
];

function toCreationIntent(intent: CreationIntent): CreationIntent {
  return {
    id: intent.id,
    family: intent.family,
    statement: intent.statement,
    who: intent.who,
    what: intent.what,
    amount: intent.amount,
    mustHappen: intent.mustHappen,
    nextStep: intent.nextStep,
    nextStepShort: intent.nextStepShort,
    moneyMoves: intent.moneyMoves,
  };
}

export default function Home({ reviewMode = false }: HomeProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [draftStatement, setDraftStatement] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const source = draftStatement.trim() || DEFAULT_EXAMPLE;
  const isExample = !draftStatement.trim();
  const displayIntent = useMemo(() => createCreationIntentFromText(source), [source]);

  const focusInput = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goCreate = () => {
    const statement = draftStatement.trim();
    if (!statement) {
      focusInput();
      return;
    }
    const creationIntent = toCreationIntent(createCreationIntentFromText(statement));
    saveCreationIntent(creationIntent);
    navigate(reviewMode ? '/preview/create' : '/create/journey', { state: { intent: creationIntent } });
  };

  const handleIntentKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      goCreate();
    }
  };

  const chooseIntent = (option: IntentOption) => {
    setDraftStatement(option.prompt);
    window.setTimeout(() => {
      if (window.innerWidth < 1024) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  };

  const scrollToLearnMore = () => {
    document.getElementById('discover-securepay')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const markState = inputFocused ? 'listening' : isExample ? 'resting' : 'guiding';

  return (
    <div className="hp-page">
      <div className="hp-paper-deep" aria-hidden="true" />
      <div className="hp-atmosphere" aria-hidden="true" />

      <header className="hp-header">
        <Link to={reviewMode ? '/preview/home' : '/'} className="hp-logo" aria-label="SecurePay home">
          <SecurePayLogo size="header" />
        </Link>

        <nav className="hp-nav" aria-label="Primary navigation">
          <button type="button" onClick={scrollToLearnMore}>How it works</button>
          <Link to={reviewMode ? '/preview/create' : '/situations'}>Examples</Link>
          <Link to={reviewMode ? '/preview/help' : '/help'}>Help</Link>
          <Link to={reviewMode ? '/preview/trust' : '/trust'}>About</Link>
        </nav>

        <div className="hp-actions">
          <Link to={reviewMode ? '/preview/signin' : '/signin'} className="hp-signin">Sign in</Link>
          <button type="button" className="hp-start-btn" onClick={goCreate}>
            Start an agreement <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="hp-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(value => !value)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="hp-mobile-menu" aria-label="Mobile navigation">
          <button type="button" onClick={() => { setMenuOpen(false); scrollToLearnMore(); }}>How it works</button>
          <Link to={reviewMode ? '/preview/create' : '/situations'} onClick={() => setMenuOpen(false)}>Examples</Link>
          <Link to={reviewMode ? '/preview/help' : '/help'} onClick={() => setMenuOpen(false)}>Help</Link>
          <Link to={reviewMode ? '/preview/trust' : '/trust'} onClick={() => setMenuOpen(false)}>About</Link>
          <Link to={reviewMode ? '/preview/signin' : '/signin'} onClick={() => setMenuOpen(false)}>Sign in</Link>
        </nav>
      )}

      <main className="hp-main">
        <section className="hp-master-grid">
          <div className="hp-hero">
            <span className="hp-kicker">SecurePay — the agreement platform</span>
            <h1>
              Make the deal.
              <br />
              <em>The money follows.</em>
            </h1>
            <p className="hp-support">
              Tell SecurePay what you want to do, in your own words. It helps shape the agreement — then the money follows what was agreed.
            </p>

            <div className={`hp-intent-box ${inputFocused ? 'is-focused' : ''}`}>
              <span className="hp-intent-label">Describe your situation</span>
              <div className="hp-intent-row">
                <textarea
                  ref={inputRef}
                  value={draftStatement}
                  onChange={event => setDraftStatement(event.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={handleIntentKeyDown}
                  placeholder="I'm buying a generator for KES 85,000 and collecting it on Saturday…"
                  aria-label="Tell SecurePay what you want to do"
                  rows={2}
                  maxLength={520}
                />
                <button type="button" onClick={goCreate} aria-label="Continue with this situation">
                  <ArrowRight size={25} />
                </button>
              </div>
            </div>
            <p className="hp-input-hint">Press Enter — or pick an example below.</p>
          </div>

          <aside ref={panelRef} className="hp-understanding" aria-label="SecurePay understanding">
            <div className="hp-understanding-atmosphere" aria-hidden="true" />
            <div className="hp-understanding-inner">
              <div className="hp-understanding-status">
                <LivingSecurePayMark
                  state={markState}
                  size="md"
                  presence="present"
                  surface="dark"
                  label={inputFocused ? 'SecurePay is listening' : isExample ? 'SecurePay example' : 'SecurePay understood your situation'}
                />
                <div>
                  <span>{inputFocused ? 'SecurePay is listening' : isExample ? 'Example' : 'SecurePay understood'}</span>
                  <strong>{isExample ? 'Try your own situation on the left.' : 'Your words are shaping the agreement.'}</strong>
                </div>
              </div>

              <div className="hp-source-quote">
                <span>{isExample ? 'As an example' : 'From your words'}</span>
                <p>“{source}”</p>
              </div>

              <div className="hp-understood-title">
                <span>Understood as</span>
                <h2>{displayIntent.what}</h2>
              </div>

              <dl className="hp-understood-details">
                <div>
                  <dt>The parties</dt>
                  <dd>{displayIntent.who}</dd>
                </div>
                <div className="hp-understood-amount">
                  <dt>Amount</dt>
                  <dd>{displayIntent.amount}</dd>
                </div>
                <div>
                  <dt>What must happen</dt>
                  <dd>{displayIntent.mustHappen}</dd>
                </div>
                <div>
                  <dt>What happens next</dt>
                  <dd>{displayIntent.nextStep}</dd>
                </div>
              </dl>

              <div className="hp-money-principle">
                <strong>Money should follow the agreement.</strong>
                <span>This is a preview. Live money states come from SecurePay once you continue.</span>
              </div>

              {isExample ? (
                <button type="button" className="hp-panel-secondary" onClick={focusInput}>
                  Describe your own situation <ArrowRight size={17} />
                </button>
              ) : (
                <button type="button" className="hp-panel-primary" onClick={goCreate}>
                  Continue to the agreement <ArrowRight size={17} />
                </button>
              )}
            </div>
          </aside>

          <section className="hp-doors" aria-labelledby="hp-two-ways">
            <div className="hp-doors-head">
              <h2 id="hp-two-ways">Two ways in.</h2>
              <span>Or describe it above</span>
            </div>
            <div className="hp-door-grid">
              {DOORS.map(door => (
                <article key={door.family} className={`hp-door hp-door-${door.family}`}>
                  <div className="hp-door-heading">
                    <span>{door.eyebrow}</span>
                    <h3>{door.title}</h3>
                    <p>{door.blurb}</p>
                  </div>
                  <div className="hp-door-options">
                    {door.options.map(option => {
                      const Icon = option.icon;
                      return (
                        <button type="button" key={option.label} onClick={() => chooseIntent(option)}>
                          <span className="hp-door-option-icon"><Icon size={16} /></span>
                          <span>{option.label}</span>
                          <ArrowRight size={14} />
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section id="discover-securepay" className="hp-discover">
          <span className="hp-kicker">How SecurePay works</span>
          <h2>The agreement stays at the centre.</h2>
          <div className="hp-discover-grid">
            <div><strong>1. Say the deal normally.</strong><p>SecurePay turns the situation into a clearer proposed agreement without making you learn product jargon.</p></div>
            <div><strong>2. Agree what must happen.</strong><p>The people, amount, conditions and confirmations stay visible to the people who need them.</p></div>
            <div><strong>3. Let the money follow it.</strong><p>Funding, release and settlement remain distinct and are shown only when SecurePay has authoritative truth.</p></div>
          </div>
          <Link to={reviewMode ? '/preview/help' : '/situations'} className="hp-discover-link">
            See SecurePay in real situations <ArrowRight size={16} />
          </Link>
        </section>
      </main>

      {reviewMode && <span className="hp-preview-badge">Interactive preview</span>}
    </div>
  );
}
