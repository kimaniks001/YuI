import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  CircleDollarSign,
  Clock,
  FileCheck,
  HandHeart,
  Handshake,
  Hammer,
  HeartHandshake,
  Lock,
  Menu,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
  TreePine,
  Truck,
  User,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import SecurePayLogo from '../components/SecurePayLogo';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import MarketOpeningRitual from '../components/MarketOpeningRitual';
import { saveCreationIntent } from '../lib/creationIntent';

type IntentFamily = 'trade' | 'life';

interface Intent {
  id: string;
  label: string;
  icon: typeof ShoppingCart;
  family: IntentFamily;
  statement: string;
  who: string;
  what: string;
  amount: string;
  mustHappen: string;
  nextStep: string;
  nextStepShort: string;
  moneyMoves: string;
}

const TRADE_INTENTS: Intent[] = [
  {
    id: 'buy',
    label: 'Buy goods',
    icon: ShoppingCart,
    family: 'trade',
    statement: "I'm buying a generator for KES 85,000 and collecting it on Saturday.",
    who: 'You (Buyer) → PowerGen Ltd (Seller)',
    what: 'Generator purchase',
    amount: 'KES 85,000',
    mustHappen: 'Seller delivers, you inspect and confirm',
    nextStep: 'Add the seller and agree the delivery terms',
    nextStepShort: 'Add the seller',
    moneyMoves: 'After the agreed receipt confirmation',
  },
  {
    id: 'sell',
    label: 'Sell goods',
    icon: Store,
    family: 'trade',
    statement: "I'm selling office furniture for KES 120,000 to a new client.",
    who: 'You (Seller) → Acme Ltd (Buyer)',
    what: 'Office furniture sale',
    amount: 'KES 120,000',
    mustHappen: 'Buyer inspects and confirms delivery',
    nextStep: 'Add the buyer and agree the handover terms',
    nextStepShort: 'Add the buyer',
    moneyMoves: 'After the agreed delivery confirmation',
  },
  {
    id: 'hire',
    label: 'Hire',
    icon: Wrench,
    family: 'trade',
    statement: 'I need a painter for KES 60,000, paid in 2 stages.',
    who: 'You (Payer) → Painter (Worker)',
    what: 'House painting contract',
    amount: 'KES 60,000 · 2 stages',
    mustHappen: 'Preparation complete → final work complete',
    nextStep: 'Define each stage and invite the painter',
    nextStepShort: 'Add the painter',
    moneyMoves: 'After each agreed stage is confirmed',
  },
  {
    id: 'getpaid',
    label: 'Get paid',
    icon: Wallet,
    family: 'trade',
    statement: 'I completed a website for KES 85,000 and need the client to confirm delivery.',
    who: 'You (Worker) → Client (Payer)',
    what: 'Website project delivery',
    amount: 'KES 85,000',
    mustHappen: 'Client reviews and confirms the agreed delivery',
    nextStep: 'Invite the client to review the agreement',
    nextStepShort: 'Add the client',
    moneyMoves: 'According to the agreed confirmation conditions',
  },
  {
    id: 'supply',
    label: 'Supply',
    icon: Truck,
    family: 'trade',
    statement: "I'm delivering 200 bags of cement to Ruiru on Friday.",
    who: 'You (Supplier) → Site Manager (Buyer)',
    what: 'Cement supply, 200 bags',
    amount: 'KES 180,000',
    mustHappen: 'Delivery to Ruiru site and receipt confirmation',
    nextStep: 'Add the buyer and delivery evidence requirements',
    nextStepShort: 'Add the buyer',
    moneyMoves: 'After the agreed delivery conditions are confirmed',
  },
  {
    id: 'build',
    label: 'Build',
    icon: Sparkles,
    family: 'trade',
    statement: 'I am building a prototype and need two collaborators paid on milestones.',
    who: 'You (Creator) → 2 Collaborators',
    what: 'Prototype build, milestone payments',
    amount: 'KES 45,000 per milestone',
    mustHappen: 'Each milestone is reviewed against the agreement',
    nextStep: 'Add collaborators and define milestone evidence',
    nextStepShort: 'Add collaborators',
    moneyMoves: 'After each milestone meets the agreed conditions',
  },
  {
    id: 'renovate',
    label: 'Renovate',
    icon: Hammer,
    family: 'trade',
    statement: 'I am paying a contractor, plumber and electrician KES 180,000 for this renovation.',
    who: 'You (Payer) → Contractor, Plumber and Electrician',
    what: 'Renovation with multiple trades',
    amount: 'KES 180,000',
    mustHappen: 'Each tradesperson completes their agreed scope',
    nextStep: 'Set up allocations and invite each tradesperson',
    nextStepShort: 'Add tradespeople',
    moneyMoves: 'After each agreed scope is confirmed',
  },
  {
    id: 'security',
    label: 'Security',
    icon: ShieldCheck,
    family: 'trade',
    statement: 'Ten shops are contributing KES 2,500 each to pay security guards and a response company.',
    who: '10 shops (Contributors) → Guards and response company',
    what: 'Shared security for the block',
    amount: 'KES 2,500 per shop',
    mustHappen: 'Contributions and governed supplier obligations are agreed',
    nextStep: 'Set up the group and invite the shops',
    nextStepShort: 'Start the group',
    moneyMoves: 'According to the group agreement and approvals',
  },
];

const LIFE_INTENTS: Intent[] = [
  {
    id: 'family',
    label: 'Support family',
    icon: HandHeart,
    family: 'life',
    statement: 'My siblings and I support Mum every month.',
    who: '4 siblings (Contributors) → Mum (Recipient)',
    what: 'Monthly family support',
    amount: 'KES 15,000 / month',
    mustHappen: 'Each person contributes their agreed share',
    nextStep: 'Invite family members and agree the monthly plan',
    nextStepShort: 'Invite family',
    moneyMoves: 'According to the agreed family support plan',
  },
  {
    id: 'contribute',
    label: 'Contribute',
    icon: Users,
    family: 'life',
    statement: '20 parents are contributing KES 4,000 each to pay a bus company, caterer and venue for the school trip.',
    who: '20 parents (Contributors) → Bus, Caterer and Venue',
    what: 'School trip with multiple suppliers',
    amount: 'KES 4,000 per parent',
    mustHappen: 'Contributions and supplier obligations are clearly agreed',
    nextStep: 'Set up the group and invite parents',
    nextStepShort: 'Start the group',
    moneyMoves: 'According to the agreed contribution and supplier plan',
  },
  {
    id: 'school',
    label: 'School',
    icon: BookOpen,
    family: 'life',
    statement: "We're collecting school fees together for our niece this term.",
    who: '3 family members (Contributors) → School fees purpose',
    what: 'School fees contribution',
    amount: 'KES 18,000 per term',
    mustHappen: 'Each member contributes their agreed share',
    nextStep: 'Agree the school-fee purpose and invite contributors',
    nextStepShort: 'Invite contributors',
    moneyMoves: 'According to the agreed school-fee arrangement',
  },
  {
    id: 'help',
    label: 'Help someone',
    icon: HeartHandshake,
    family: 'life',
    statement: 'A few of us are supporting our neighbour after a difficult time.',
    who: '5 neighbours (Contributors) → Family (Recipient)',
    what: 'Community support',
    amount: 'KES 3,000 each',
    mustHappen: 'Each person contributes what they agreed',
    nextStep: 'Invite supporters and make the purpose clear',
    nextStepShort: 'Invite supporters',
    moneyMoves: 'According to the agreed support arrangement',
  },
  {
    id: 'caresplit',
    label: 'Care split',
    icon: HandHeart,
    family: 'life',
    statement: "I am supporting Mum's rent, medicine and caregiver separately.",
    who: 'You (Payer) → Landlord, Pharmacy and Caregiver',
    what: "Mum's care expenses",
    amount: 'KES 45,000',
    mustHappen: 'Each provider has a clear agreed allocation',
    nextStep: 'Set up allocations and invite each provider',
    nextStepShort: 'Add providers',
    moneyMoves: 'According to each agreed allocation condition',
  },
];

const ALL_INTENTS = [...TRADE_INTENTS, ...LIFE_INTENTS];

function inferAmountFromStatement(statement: string): string | null {
  const kesMatch = statement.match(/\bKES\s*([\d,]+(?:\.\d+)?)\b/i);
  const budgetMatch = statement.match(/\b(?:budget(?:\s+(?:of|is))?|price(?:d)?(?:\s+at)?|cost(?:ing)?|pay(?:ing)?|for)\s+(?:KES\s*)?([\d,]{4,}(?:\.\d+)?)\b/i);
  const raw = kesMatch?.[1] ?? budgetMatch?.[1];
  if (!raw) return null;

  const numeric = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  return `KES ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 2 }).format(numeric)}`;
}

function inferCustomPurpose(statement: string): string {
  const value = statement.toLowerCase();
  const delivery = /deliver|delivery|transport|ship|collect|pickup|pick up|bring|send/.test(value);

  const subjects: Array<[RegExp, string]> = [
    [/sofa|couch|seat set/, 'Sofa'],
    [/generator/, 'Generator'],
    [/cement/, 'Cement'],
    [/motorbike|motorcycle|boda/, 'Motorcycle'],
    [/bike|bicycle/, 'Bicycle'],
    [/phone|iphone|samsung/, 'Phone'],
    [/laptop|computer/, 'Computer'],
    [/furniture/, 'Furniture'],
    [/car|vehicle/, 'Vehicle'],
    [/paint|painting|painter/, 'Painting'],
    [/plumb|plumber/, 'Plumbing'],
    [/build|builder|construction/, 'Building work'],
    [/school|fees|tuition/, 'School support'],
    [/rent|medicine|caregiver|mum|mom|mother|parent/, 'Family support'],
  ];
  const subject = subjects.find(([pattern]) => pattern.test(value))?.[1];

  if (/buy|buying|purchase|purchasing|order|ordering|get some|getting/.test(value)) {
    return `${subject ?? 'Purchase'}${delivery ? ' & delivery' : subject ? ' purchase' : ''}`;
  }
  if (/sell|selling/.test(value)) return `${subject ?? 'Item'} sale`;
  if (/hire|hiring|fundi|contractor|painter|plumber|electrician|developer/.test(value)) return subject ?? 'Service agreement';
  if (/support|help|contribute|contribution|family|mum|mom|mother|school/.test(value)) return subject ?? 'Support arrangement';
  if (/build|renovate|repair|fix/.test(value)) return subject ?? 'Work agreement';
  return subject ?? 'Agreement to be clarified';
}

function inferCustomGuidance(statement: string, active: Intent): Pick<Intent, 'who' | 'what' | 'mustHappen' | 'nextStep' | 'nextStepShort' | 'moneyMoves'> {
  const value = statement.toLowerCase();
  const purpose = inferCustomPurpose(statement);
  const delivery = /deliver|delivery|transport|ship|collect|pickup|pick up|bring|send/.test(value);

  if (/buy|buying|purchase|purchasing|order|ordering|get some|getting/.test(value)) {
    return {
      who: 'You (Buyer) → Seller to be confirmed',
      what: purpose,
      mustHappen: delivery ? 'The agreed item is provided and the handover or delivery is confirmed.' : 'The agreed item and handover conditions are confirmed.',
      nextStep: delivery ? 'Confirm the seller, item details, destination and handover conditions.' : 'Confirm the seller, item details and handover conditions.',
      nextStepShort: delivery ? 'Confirm seller & delivery' : 'Confirm seller & item',
      moneyMoves: 'Only according to the receipt or handover conditions the parties agree.',
    };
  }

  if (/sell|selling/.test(value)) {
    return {
      who: 'You (Seller) → Buyer to be confirmed',
      what: purpose,
      mustHappen: 'The buyer receives what was agreed and the handover is confirmed.',
      nextStep: 'Confirm the buyer, item, price and handover conditions.',
      nextStepShort: 'Confirm buyer & handover',
      moneyMoves: 'Only according to the handover conditions the parties agree.',
    };
  }

  if (/hire|hiring|fundi|contractor|painter|plumber|electrician|developer|repair|fix/.test(value)) {
    return {
      who: 'You (Client/Payer) → Service provider to be confirmed',
      what: purpose,
      mustHappen: 'The agreed work is completed and the required proof or confirmation is provided.',
      nextStep: 'Confirm the provider, scope, timing and what will show the work is complete.',
      nextStepShort: 'Confirm provider & scope',
      moneyMoves: 'Only according to the work conditions the parties agree.',
    };
  }

  if (/support|help|contribute|contribution|family|mum|mom|mother|school|fees|rent|medicine|caregiver/.test(value)) {
    return {
      who: /we|our|siblings|parents|family|contributors/.test(value) ? 'Contributors and recipient(s) to be confirmed' : 'You and recipient(s) to be confirmed',
      what: purpose,
      mustHappen: 'The purpose, people involved and each responsibility are made clear.',
      nextStep: 'Confirm who is involved, the purpose and how the support should be organised.',
      nextStepShort: 'Confirm people & purpose',
      moneyMoves: 'Only according to the support arrangement the participants agree.',
    };
  }

  return {
    who: active.who === 'To be confirmed' ? active.who : 'To be confirmed',
    what: purpose,
    mustHappen: 'SecurePay will ask what must happen before money should move.',
    nextStep: 'Answer a few questions so the agreement can be structured clearly.',
    nextStepShort: 'Clarify the agreement',
    moneyMoves: 'Only according to the conditions the parties agree.',
  };
}

interface HomeProps {
  reviewMode?: boolean;
}

const featureItems = [
  { icon: ShieldCheck, title: 'Clear agreements', text: 'Everyone sees what was agreed.' },
  { icon: Scale, title: 'Fair & transparent', text: 'Responsibilities stay visible.' },
  { icon: Clock, title: 'Built for real life', text: 'Simple steps, practical timing.' },
  { icon: Users, title: 'For everyone', text: 'Traders, families and communities.' },
];

export default function Home({ reviewMode = false }: HomeProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>('buy');
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedTrade, setExpandedTrade] = useState(false);
  const [expandedLife, setExpandedLife] = useState(false);
  const [draftStatement, setDraftStatement] = useState(TRADE_INTENTS[0].statement);
  const [inputTouched, setInputTouched] = useState(false);
  const [mobileFamily, setMobileFamily] = useState<IntentFamily>('trade');

  const active = ALL_INTENTS.find((intent) => intent.id === selected) ?? TRADE_INTENTS[0];

  const displayIntent = useMemo<Intent>(() => {
    const statement = draftStatement.trim() || active.statement;
    if (statement === active.statement) return active;

    const inferredAmount = inferAmountFromStatement(statement);
    const guidance = inferCustomGuidance(statement, active);
    return {
      ...active,
      ...guidance,
      id: 'custom',
      statement,
      amount: inferredAmount ?? 'To be confirmed',
    };
  }, [active, draftStatement]);

  const chooseIntent = (intent: Intent) => {
    setSelected(intent.id);
    setDraftStatement(intent.statement);
    setInputTouched(false);
    setMobileFamily(intent.family);
  };

  const prepareIntentInput = () => {
    if (!inputTouched && draftStatement === active.statement) {
      setDraftStatement('');
    }
    setInputTouched(true);
  };

  const scrollToLearnMore = () => {
    document.getElementById('discover-securepay')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goCreate = () => {
    if (inputTouched && !draftStatement.trim()) return;
    saveCreationIntent(displayIntent);
    navigate(reviewMode ? '/preview/create' : '/create/journey', { state: { intent: displayIntent } });
  };

  const handleIntentKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      goCreate();
    }
  };

  const popularTrade = expandedTrade ? TRADE_INTENTS : TRADE_INTENTS.slice(0, 4);
  const popularLife = expandedLife ? LIFE_INTENTS : LIFE_INTENTS.slice(0, 4);
  const understoodTitle = displayIntent.id === 'custom' ? displayIntent.what : displayIntent.what;
  const mobileFamilyIntents = mobileFamily === 'trade' ? popularTrade : popularLife;
  const mobileFamilyExpanded = mobileFamily === 'trade' ? expandedTrade : expandedLife;
  const setMobileFamilyExpanded = () => {
    if (mobileFamily === 'trade') setExpandedTrade((value) => !value);
    else setExpandedLife((value) => !value);
  };
  const waitingForWords = inputTouched && !draftStatement.trim();

  const intentGrid = (intents: Intent[], family: IntentFamily) => (
    <div className={`hp-choice-grid hp-choice-grid-${family}`}>
      {intents.map((intent) => {
        const Icon = intent.icon;
        const isActive = selected === intent.id && draftStatement === intent.statement;
        return (
          <button
            type="button"
            key={intent.id}
            onClick={() => chooseIntent(intent)}
            className={`hp-choice hp-choice-${family} hp-choice-${intent.id} ${isActive ? 'is-active' : ''}`}
            aria-pressed={isActive}
          >
            <span className="hp-choice-icon"><Icon size={23} strokeWidth={1.9} /></span>
            <span>{intent.label}</span>
          </button>
        );
      })}
    </div>
  );

  const mobileLivePreview = () => (
    <section className={`hp-mobile-live ${inputTouched ? 'is-listening' : ''}`} aria-label="Live SecurePay demo interpretation">
      <div className="hp-mobile-live-top">
        <div className="hp-mobile-live-label">
          <LivingSecurePayMark
            key={draftStatement}
            state={waitingForWords || inputTouched ? 'listening' : 'guiding'}
            size="xs"
            presence={inputTouched ? 'present' : 'polite'}
            className="hp-mobile-live-mark"
            label={waitingForWords ? 'SecurePay is listening' : inputTouched ? 'SecurePay is understanding' : 'SecurePay understood the demo'}
          />
          <span>{waitingForWords ? 'SecurePay is listening…' : inputTouched ? 'SecurePay is understanding…' : 'SecurePay understood'}</span>
        </div>
        <span className="hp-mobile-live-demo">Live demo</span>
      </div>

      <div className="hp-mobile-live-grid">
        <div>
          <span>Purpose</span>
          <strong key={`purpose-${displayIntent.what}`}>{waitingForWords ? 'Start typing…' : displayIntent.what}</strong>
        </div>
        <div>
          <span>Amount</span>
          <strong key={`amount-${displayIntent.amount}`} className="hp-mobile-live-amount">{waitingForWords ? '—' : displayIntent.amount}</strong>
        </div>
        <div className="hp-mobile-live-wide">
          <span>Next</span>
          <strong key={`next-${displayIntent.nextStepShort}`}>{waitingForWords ? 'Tell us what you want to do' : displayIntent.nextStepShort}</strong>
        </div>
      </div>
      <p>{waitingForWords ? 'Your words will shape the demo as you type.' : 'Keep typing — watch the agreement take shape.'}</p>
    </section>
  );

  const understoodCard = (mobile = false) => (
    <section className={`hp-understood-card ${mobile ? 'hp-understood-mobile' : ''}`} aria-label="SecurePay understood demo">
      <div className="hp-understood-header">
        <div>
          <div className="hp-understood-kicker-row">
            <span className="hp-understood-kicker">SecurePay understood</span>
            <span className="hp-demo-pill">Demo</span>
          </div>
          <p className="hp-understood-caption">Here’s a demo of your agreement</p>
          <h2>{understoodTitle}</h2>
        </div>
        {mobile ? (
          <LivingSecurePayMark
            state={inputTouched ? 'guiding' : 'resting'}
            size="md"
            presence="present"
            className="hp-understood-mark"
            label="SecurePay is guiding this demonstration"
          />
        ) : (
          <div className="hp-understood-shield" aria-hidden="true"><ShieldCheck size={34} /></div>
        )}
      </div>

      <dl className="hp-understood-fields">
        <div className="hp-understood-row">
          <dt><span className="hp-field-icon hp-field-icon-green"><User size={18} /></span><span>Who’s involved</span></dt>
          <dd key={`who-${displayIntent.who}`}>{displayIntent.who}</dd>
        </div>
        <div className="hp-understood-row">
          <dt><span className="hp-field-icon hp-field-icon-orange"><Target size={18} /></span><span>Purpose</span></dt>
          <dd key={`what-${displayIntent.what}`}>{displayIntent.what}</dd>
        </div>
        <div className="hp-understood-row hp-understood-amount-row">
          <dt><span className="hp-field-icon hp-field-icon-lime"><CircleDollarSign size={18} /></span><span>Amount</span></dt>
          <dd key={`amount-${displayIntent.amount}`}>{displayIntent.amount}</dd>
        </div>
        <div className="hp-understood-row">
          <dt><span className="hp-field-icon hp-field-icon-orange"><FileCheck size={18} /></span><span>What must happen</span></dt>
          <dd key={`must-${displayIntent.mustHappen}`}>{displayIntent.mustHappen}</dd>
        </div>
        <div className="hp-understood-row">
          <dt><span className="hp-field-icon hp-field-icon-green"><ArrowRight size={18} /></span><span>What happens next</span></dt>
          <dd key={`next-${displayIntent.nextStep}`}>{displayIntent.nextStep}</dd>
        </div>
        <div className="hp-understood-row hp-understood-money-row">
          <dt><span className="hp-field-icon hp-field-icon-orange"><Wallet size={18} /></span><span>When money moves</span></dt>
          <dd key={`money-${displayIntent.moneyMoves}`}>{displayIntent.moneyMoves}</dd>
        </div>
      </dl>

      <div className="hp-understood-footer">
        <span className="hp-understood-footer-icon"><Lock size={17} /></span>
        <div>
          <strong>Money should follow the agreement.</strong>
          <span>Illustrative only — live money states come from SecurePay.</span>
        </div>
      </div>

      <div className="hp-understood-continue-wrap">
        <button type="button" className="hp-understood-continue" onClick={goCreate}>
          Use this information to continue <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );

  return (
    <div className="hp-page">
      {!reviewMode && <MarketOpeningRitual />}
      <div className="hp-atmosphere" aria-hidden="true">
        <img src="/assets/brand/securepay_icon_green.png" alt="" className="hp-watermark" />
        <span className="hp-light hp-light-one" />
        <span className="hp-light hp-light-two" />
        <span className="hp-light hp-light-three" />
      </div>

      <header className="hp-header">
        <Link to={reviewMode ? '/preview/home' : '/'} className="hp-logo" aria-label="SecurePay home">
          <SecurePayLogo size="header" />
        </Link>

        <nav className="hp-nav" aria-label="Primary navigation">
          <Link to={reviewMode ? '/preview/help' : '/situations'}>How it works</Link>
          <Link to={reviewMode ? '/preview/create' : '/situations'}>Examples</Link>
          <Link to={reviewMode ? '/preview/help' : '/help'}>Help</Link>
          <Link to={reviewMode ? '/preview/trust' : '/trust'}>About SecurePay</Link>
        </nav>

        <div className="hp-actions">
          <Link to={reviewMode ? '/preview/signin' : '/signin'} className="hp-signin">Sign in</Link>
          <button type="button" onClick={goCreate} className="hp-start-btn">Start an agreement <ArrowRight size={16} /></button>
          <button
            type="button"
            className="hp-menu-btn"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="hp-mobile-menu" aria-label="Mobile navigation">
          <Link to={reviewMode ? '/preview/help' : '/situations'} onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link to={reviewMode ? '/preview/create' : '/situations'} onClick={() => setMenuOpen(false)}>Examples</Link>
          <Link to={reviewMode ? '/preview/help' : '/help'} onClick={() => setMenuOpen(false)}>Help</Link>
          <Link to={reviewMode ? '/preview/trust' : '/trust'} onClick={() => setMenuOpen(false)}>About SecurePay</Link>
          <button type="button" onClick={() => { setMenuOpen(false); goCreate(); }}>Start an agreement <ArrowRight size={16} /></button>
        </nav>
      )}

      <main className="hp-main">
        <section className="hp-desktop-layout">
          <div className="hp-market-side">
            <h1 className="hp-welcome">Welcome to the <span>market.</span></h1>
            <h2 className="hp-question">What are you here to do today?</h2>
            <p className="hp-question-support">Buy, sell, hire, get paid, support family, build or contribute.</p>

            <div className="hp-intent-box">
              <textarea
                value={draftStatement}
                onFocus={prepareIntentInput}
                onChange={(event) => { setInputTouched(true); setDraftStatement(event.target.value); }}
                onKeyDown={handleIntentKeyDown}
                aria-label="Tell SecurePay what you are trying to do"
                placeholder="Tell us what you want to do…"
                rows={2}
                maxLength={420}
              />
              <button type="button" onClick={goCreate} disabled={waitingForWords} aria-label="Continue with this intention"><ArrowRight size={24} /></button>
            </div>
            <p className="hp-typing-hint">Press Enter or the arrow to continue. Shift+Enter adds a new line.</p>
            <p className="hp-option-intro">Or choose a popular option to get started</p>

            <div className="hp-family-cards">
              <section className="hp-family-card hp-family-trade">
                <div className="hp-family-card-head">
                  <div><h3>Trade</h3><p>Buy, sell or deal with confidence.</p></div>
                  <span className="hp-family-symbol hp-family-symbol-trade"><Handshake size={31} /></span>
                </div>
                {intentGrid(popularTrade, 'trade')}
                <button type="button" className="hp-explore hp-explore-trade" onClick={() => setExpandedTrade((value) => !value)}>
                  {expandedTrade ? 'Show popular trade options' : 'Explore trade options'} <ArrowRight size={17} />
                </button>
              </section>

              <section className="hp-family-card hp-family-life">
                <div className="hp-family-card-head">
                  <div><h3>Life &amp; support</h3><p>Handle life moments with peace of mind.</p></div>
                  <span className="hp-family-symbol hp-family-symbol-life"><TreePine size={31} /></span>
                </div>
                {intentGrid(popularLife, 'life')}
                <button type="button" className="hp-explore hp-explore-life" onClick={() => setExpandedLife((value) => !value)}>
                  {expandedLife ? 'Show popular life options' : 'Explore life options'} <ArrowRight size={17} />
                </button>
              </section>
            </div>

            <button type="button" className="hp-learn-cue" onClick={scrollToLearnMore} aria-label="Learn more about how SecurePay works">
              <span>Want to understand SecurePay?</span>
              <ChevronDown size={17} />
            </button>
          </div>

          <aside className="hp-demo-side">
            {understoodCard(false)}
          </aside>
        </section>

        <section className="hp-mobile-layout" aria-label="SecurePay Market">
          <h1 className="hp-mobile-welcome">Welcome to the <span>market.</span></h1>
          <h2 className="hp-mobile-question">What are you here to do today?</h2>

          <div className="hp-mobile-intent-box">
            <textarea
              value={draftStatement}
              onFocus={prepareIntentInput}
              onChange={(event) => { setInputTouched(true); setDraftStatement(event.target.value); }}
              onKeyDown={handleIntentKeyDown}
              aria-label="Tell SecurePay what you are trying to do"
              placeholder="Tell us what you want to do…"
              rows={2}
              maxLength={420}
            />
            <button type="button" onClick={goCreate} disabled={waitingForWords} aria-label="Continue with this intention"><ArrowRight size={23} /></button>
          </div>
          <p className="hp-mobile-example">Press Enter or the arrow to continue · Shift+Enter for a new line</p>

          {mobileLivePreview()}

          <section className="hp-mobile-paths" aria-label="Start from a familiar path">
            <div className="hp-mobile-family-switch" role="tablist" aria-label="Trade or life and support">
              <button
                type="button"
                role="tab"
                aria-selected={mobileFamily === 'trade'}
                className={mobileFamily === 'trade' ? 'is-active' : ''}
                onClick={() => setMobileFamily('trade')}
              >
                <Handshake size={20} />
                <span><strong>Work &amp; Trade</strong><small>Buy · sell · hire · get paid</small></span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileFamily === 'life'}
                className={mobileFamily === 'life' ? 'is-active is-life' : 'is-life'}
                onClick={() => setMobileFamily('life')}
              >
                <TreePine size={20} />
                <span><strong>Life &amp; Support</strong><small>Family · school · contribute</small></span>
              </button>
            </div>

            <div className={`hp-mobile-path-panel hp-mobile-path-${mobileFamily}`} role="tabpanel">
              <div className="hp-mobile-path-heading">
                <span>{mobileFamily === 'trade' ? 'Popular market paths' : 'Life around the trade'}</span>
                <em>{mobileFamily === 'trade' ? 'Choose one or keep typing above.' : 'The trader is human too.'}</em>
              </div>
              {intentGrid(mobileFamilyIntents, mobileFamily)}
              <button
                type="button"
                className={`hp-explore ${mobileFamily === 'trade' ? 'hp-explore-trade' : 'hp-explore-life'}`}
                onClick={setMobileFamilyExpanded}
              >
                {mobileFamilyExpanded ? 'Show popular options' : mobileFamily === 'trade' ? 'Explore trade options' : 'Explore life options'} <ArrowRight size={17} />
              </button>
            </div>
          </section>

          <div className="hp-mobile-full-demo-heading">
            <span>See the full demo</span>
            <strong>SecurePay understood</strong>
          </div>
          {understoodCard(true)}

          <button type="button" className="hp-learn-cue hp-mobile-learn-cue" onClick={scrollToLearnMore} aria-label="Learn more about how SecurePay works">
            <span>Want to understand SecurePay?</span>
            <ChevronDown size={17} />
          </button>
        </section>

        <section id="discover-securepay" className="hp-discover" aria-labelledby="discover-securepay-title">
          <div className="hp-discover-copy">
            <span className="hp-discover-kicker">If you want to go deeper</span>
            <h2 id="discover-securepay-title">The agreement leads. SecurePay helps keep the journey clear.</h2>
            <p>You describe what you are trying to do. SecurePay helps structure the people, purpose, responsibilities and conditions — while live agreement and money states remain backend truth.</p>
          </div>
          <div className="hp-discover-steps">
            <article><span>1</span><div><strong>Say what you’re doing</strong><p>Start in ordinary language, not product terminology.</p></div></article>
            <article><span>2</span><div><strong>Make the agreement clear</strong><p>Confirm who is involved, what must happen and what evidence matters.</p></div></article>
            <article><span>3</span><div><strong>Follow what was agreed</strong><p>SecurePay shows the next action and, when connected, authoritative money state from the API.</p></div></article>
          </div>
          <div className="hp-discover-features">
            {featureItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="hp-discover-feature">
                <span><Icon size={19} /></span>
                <div><strong>{title}</strong><p>{text}</p></div>
              </div>
            ))}
          </div>
          <Link to={reviewMode ? '/preview/help' : '/situations'} className="hp-discover-link">See SecurePay in real situations <ArrowRight size={16} /></Link>
        </section>
      </main>

      {reviewMode && <span className="hp-preview-badge">Interactive preview</span>}
    </div>
  );
}
