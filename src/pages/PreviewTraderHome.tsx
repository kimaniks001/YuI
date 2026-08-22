import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  Gift,
  HandCoins,
  Handshake,
  HeartHandshake,
  Home,
  LayoutGrid,
  ListChecks,
  Menu,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Store,
  UsersRound,
  WalletCards,
  Wrench,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import '../trader-home-preview.css';

const attention = [
  {
    title: 'House painting',
    detail: 'Preparation is ready for your confirmation.',
    meta: 'You · Payer',
    amount: 'KES 60,000',
    icon: Wrench,
  },
  {
    title: 'School trip',
    detail: 'The first supplier payment step is ready for review.',
    meta: 'You · Approver · due 4:00 PM',
    amount: 'KES 80,000',
    icon: ListChecks,
  },
];

const moving = [
  {
    title: 'Mum support — August',
    detail: '3 of 6 siblings have contributed.',
    meta: 'You · Organizer',
    amount: 'KES 15,000 of 30,000',
    icon: HeartHandshake,
  },
  {
    title: 'Renovation',
    detail: 'Waiting for two recipients to join.',
    meta: 'You · Payer',
    amount: 'KES 180,000',
    icon: PackageCheck,
  },
];

const activity = [
  { label: 'House painting', text: 'KES 30,000 settlement recorded after stage confirmation', time: 'Today · 10:22', icon: HandCoins },
  { label: 'Mum support', text: 'Mary joined the agreement', time: 'Yesterday · 19:04', icon: UsersRound },
  { label: 'Website work', text: 'Agreement completed and added to your records', time: '16 Aug', icon: FileCheck2 },
];

const quickStarts = [
  { label: 'Buy', icon: Store, example: 'I want to buy something and agree when payment should move.' },
  { label: 'Hire', icon: Wrench, example: 'I want to hire someone and pay after agreed work is done.' },
  { label: 'Get paid', icon: HandCoins, example: 'I want to get paid for work I am doing.' },
  { label: 'Support family', icon: HeartHandshake, example: 'I want to organize support for my family.' },
];

export default function PreviewTraderHome() {
  const [intent, setIntent] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showDepth, setShowDepth] = useState(false);

  const listening = intent.trim().length > 0;
  const interpretation = useMemo(() => {
    const value = intent.trim().toLowerCase();
    if (!value) return 'Tell SecurePay what you want to do next.';
    if (/(family|mum|mother|school|contribut|support|help)/.test(value)) return 'SecurePay is hearing a Life & Support intention.';
    if (/(buy|sell|hire|work|supply|build|renovat|paid|service)/.test(value)) return 'SecurePay is hearing a Work & Trade intention.';
    return 'SecurePay is listening. Keep describing it naturally.';
  }, [intent]);

  return (
    <main className="tm-page">
      <header className="tm-header">
        <div className="tm-header-inner">
          <Link to="/preview/trader-home" className="tm-brand" aria-label="SecurePay trader home">
            <LivingSecurePayMark state="resting" size="md" presence="polite" />
            <div><strong>My Market</strong><span>KS2145</span></div>
          </Link>
          <nav className="tm-nav" aria-label="Trader preview navigation">
            <Link className="is-active" to="/preview/trader-home">Home</Link>
            <Link to="/preview/market">My Market</Link>
            <Link to="/preview/workspace">Agreements</Link>
            <Link to="/preview/operational">Actions</Link>
          </nav>
          <div className="tm-head-actions">
            <span className="tm-status-pill"><LivingSecurePayMark state="success" size="xs" presence="polite" label="Preview reserve status is healthy" /><span>Review reserve</span><strong>Healthy</strong></span>
            <button className="tm-icon-button" aria-label="Notifications"><Bell size={19} /><i>4</i></button>
            <button className="tm-avatar" aria-label="Account menu">JK</button>
            <button className="tm-menu" aria-label="Open navigation" onClick={() => setMobileMenu(open => !open)}><Menu size={23} /></button>
          </div>
        </div>
        {mobileMenu && <div className="tm-mobile-menu">
          <Link to="/preview/trader-home">Home</Link><Link to="/preview/market">My Market</Link><Link to="/preview/workspace">Agreements</Link><Link to="/preview/operational">Actions</Link>
        </div>}
      </header>

      <section className="tm-hero">
        <div className="tm-watermark" aria-hidden="true" />
        <div className="tm-hero-copy">
          <div className="tm-hero-guidelight"><LivingSecurePayMark state={listening ? 'listening' : 'guiding'} size="sm" presence="polite" decorative /></div>
          <p className="tm-kicker">YOUR TRADER SPACE</p>
          <h1>Welcome back to <span>your market.</span></h1>
          <p className="tm-hero-lead"><strong>4 things need your attention.</strong> Two are closest to you here; the rest are waiting in My Market.</p>
          <div className={`tm-intent ${listening ? 'is-listening' : ''}`}>
            <div>
              <label htmlFor="trader-intent">What do you want to do next?</label>
              <textarea id="trader-intent" value={intent} onChange={event => setIntent(event.target.value)} placeholder="Tell SecurePay naturally… buy, sell, hire, get paid, support family…" rows={2} />
              <p>{interpretation}</p>
            </div>
            <Link to={intent.trim() ? `/preview/create?intent=${encodeURIComponent(intent.trim())}` : '/preview/journeys'} className="tm-go" aria-label="Continue"><ArrowRight size={24} /></Link>
          </div>
          <div className="tm-quickstarts" aria-label="Quick starts">
            {quickStarts.map(({ label, icon: Icon, example }) => <button key={label} onClick={() => setIntent(example)}><Icon size={17} /><span>{label}</span></button>)}
          </div>
        </div>

        <aside className="tm-today" aria-labelledby="today-heading">
          <div className="tm-card-head">
            <div><p>YOUR MARKET NEEDS YOU</p><h2 id="today-heading">Start here</h2></div>
            <div className="tm-needs-mark"><LivingSecurePayMark state="caution" size="sm" presence="present" label="Four preview items need your attention" /><span className="tm-count">4</span></div>
          </div>
          <div className="tm-attention-list">
            {attention.map(({ title, detail, meta, amount, icon: Icon }) => <Link key={title} to="/preview/workspace" className="tm-attention-row">
              <span className="tm-story-icon tm-orange"><Icon size={18} /></span>
              <div><strong>{title}</strong><p>{detail}</p><small>{meta}</small></div>
              <div className="tm-row-right"><b>{amount}</b><ArrowRight size={16} /></div>
            </Link>)}
          </div>
          <div className="tm-today-foot"><LivingSecurePayMark state="guiding" size="xs" presence="polite" decorative /><span>Two more items are waiting in</span><Link to="/preview/market">My Market <ArrowRight size={13} /></Link></div>
        </aside>
      </section>

      <section className="tm-strip" aria-label="Trader readiness preview">
        <div><span className="tm-mini-mark"><LivingSecurePayMark state="success" size="xs" presence="polite" label="Preview trade readiness complete" /></span><p><small>Trade readiness</small><strong>Ready to participate</strong></p></div>
        <div><span className="tm-mini-icon"><WalletCards size={17} /></span><p><small>Settlement</small><strong>Destination confirmed</strong></p></div>
        <div><span className="tm-mini-mark"><LivingSecurePayMark state="waiting" size="xs" presence="polite" label="Preview renewal is approaching" /></span><p><small>Renewal</small><strong>18 days remaining</strong></p></div>
        <div><span className="tm-mini-icon"><UsersRound size={17} /></span><p><small>Your circle</small><strong>8 traders · 5 active</strong></p></div>
      </section>

      <section className="tm-dashboard">
        <div className="tm-main-column">
          <div className="tm-section-title"><div><p>IN MOTION</p><h2>Your market is working</h2></div><Link to="/preview/market">Open My Market <ArrowRight size={14} /></Link></div>
          <div className="tm-moving-grid">
            {moving.map(({ title, detail, meta, amount, icon: Icon }) => <Link to="/preview/market" key={title} className="tm-moving-card">
              <span className="tm-story-icon"><Icon size={20} /></span>
              <div className="tm-moving-copy"><strong>{title}</strong><p>{detail}</p><small>{meta}</small></div>
              <b>{amount}</b>
              <span className="tm-motion-line"><i /></span>
            </Link>)}
          </div>

          <div className="tm-section-title tm-lower-title"><div><p>RECENTLY</p><h2>What happened</h2></div><span className="tm-calm-label"><LivingSecurePayMark state="resting" size="xs" presence="polite" decorative /> Your records</span></div>
          <div className="tm-activity-card">
            {activity.map(({ label, text, time, icon: Icon }) => <div className="tm-activity-row" key={label}>
              <span className="tm-story-icon"><Icon size={18} /></span><div><strong>{label}</strong><p>{text}</p></div><time>{time}</time>
            </div>)}
          </div>
        </div>

        <aside className="tm-side-column">
          <section className="tm-place-card">
            <div className="tm-place-title"><span className="tm-market-stall"><Store size={22} /></span><div><p>YOUR PLACE IN THE MARKET</p><h2>Trader · KS2145</h2></div></div>
            <div className="tm-place-grid">
              <Link to="/preview/market"><LayoutGrid size={19} /><span><strong>6</strong><small>Agreements</small></span></Link>
              <Link to="/preview/operational"><ListChecks size={19} /><span><strong>4</strong><small>Need you</small></span></Link>
              <Link to="/preview/market"><CircleDollarSign size={19} /><span><strong>1</strong><small>Settled today</small></span></Link>
              <Link to="/preview/market"><Store size={19} /><span><strong>3</strong><small>Store offers</small></span></Link>
            </div>
          </section>

          <section className="tm-circle-card">
            <div><p>YOUR CIRCLE</p><h2>You trade among people.</h2><span>5 of 8 traders in your circle are active this month.</span></div>
            <div className="tm-people"><i>MK</i><i>FM</i><i>JM</i><i>AN</i><i>+4</i></div>
            <Link to="/preview/market">See your circle <ArrowRight size={14} /></Link>
          </section>

          <section className="tm-medal-card"><span><Gift size={22} /></span><div><p>BUILDER MEDAL</p><h3>3 traders introduced</h3><small>Referral rewards only appear from confirmed SecurePay records.</small></div></section>
        </aside>
      </section>

      <section className="tm-depth">
        <button onClick={() => setShowDepth(open => !open)} aria-expanded={showDepth}><span>See more of your Market</span><ChevronDown size={18} className={showDepth ? 'is-open' : ''} /></button>
        {showDepth && <div className="tm-depth-grid">
          <Link to="/preview/market"><LayoutGrid /><strong>My Market</strong><span>Everything you trade, in one place.</span></Link>
          <Link to="/preview/workspace"><Handshake /><strong>Agreements</strong><span>Open the exact agreement and its next legitimate action.</span></Link>
          <Link to="/preview/operational"><ListChecks /><strong>Action Centre</strong><span>What needs you, what it means and what to do next.</span></Link>
          <Link to="/preview/developers"><Sparkles /><strong>Build with SecurePay</strong><span>Connect your own business application to the agreement engine.</span></Link>
        </div>}
      </section>

      <div className="tm-preview-note">PREVIEW · fixture-backed trader experience · no login · no live money or authority</div>

      <nav className="tm-bottom-nav" aria-label="Mobile trader preview navigation">
        <Link className="is-active" to="/preview/trader-home"><Home size={20} /><span>Home</span></Link>
        <Link to="/preview/market"><LayoutGrid size={20} /><span>My Market</span></Link>
        <Link className="tm-create-nav" to="/preview/journeys"><Sparkles size={20} /><span>Start</span></Link>
        <Link to="/preview/operational"><ListChecks size={20} /><span>Actions</span></Link>
        <Link to="/preview/market"><MessageCircle size={20} /><span>Circle</span></Link>
      </nav>
    </main>
  );
}
