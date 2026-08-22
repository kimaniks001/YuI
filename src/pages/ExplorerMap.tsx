import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  BookOpen,
  Code2,
  FileCheck2,
  HeartHandshake,
  Home,
  KeyRound,
  LayoutGrid,
  MessageCircle,
  Network,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Trophy,
  UserPlus,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const areas = [
  {
    eyebrow: '01 · DISCOVER',
    title: 'Learn how the Market begins',
    description: 'See what SecurePay can do before learning product names.',
    links: [
      { to: '/trainer/home', label: 'Signed-out Market demo', note: 'Possibility first', icon: Home },
      { to: '/trainer/create', label: 'Create an agreement demo', note: 'Natural intention → clear structure', icon: Sparkles },
      { to: '/trainer/signin', label: 'Identity doorway demo', note: 'No real authentication', icon: KeyRound },
      { to: '/trainer/join', label: 'Join an invitation demo', note: 'Invitation → join → confirm', icon: UserPlus },
    ],
  },
  {
    eyebrow: '02 · OPERATE',
    title: 'Practise running your Market',
    description: 'Follow what needs you, what is moving and what is already in your records.',
    links: [
      { to: '/trainer/dashboard', label: 'Trader Home demo', note: 'Your front desk', icon: Store },
      { to: '/trainer/market', label: 'My Market demo', note: 'Everything you trade, in one place', icon: LayoutGrid },
      { to: '/trainer/agreement', label: 'Agreement Workspace demo', note: 'One agreement, one working room', icon: FileCheck2 },
      { to: '/trainer/actions', label: 'Actions demo', note: 'What needs you next', icon: ArrowRight },
    ],
  },
  {
    eyebrow: '03 · MONEY & PEOPLE',
    title: 'Understand the flow',
    description: 'Experience money states and multi-party structures without creating financial truth.',
    links: [
      { to: '/trainer/money', label: 'Money rooms demo', note: 'Funding → Payment Ready → settlement', icon: Banknote },
      { to: '/trainer/flows', label: 'SecureFlow demo', note: 'One-to-many and many-to-many', icon: Network },
      { to: '/trainer/community', label: 'Circle & growth demo', note: 'Relationships, not rankings', icon: HeartHandshake },
      { to: '/trainer/recovery', label: 'Recovery & Resolution demo', note: 'Problems need direction, not panic', icon: MessageCircle },
    ],
  },
  {
    eyebrow: '04 · IDENTITY & ECOSYSTEM',
    title: 'See the wider Market',
    description: 'Explore the trader’s address, Store, developer experience and learning rooms.',
    links: [
      { to: '/trainer/store', label: 'KS Store demo', note: 'Identity → offer → agreement', icon: ShoppingBag },
      { to: '/trainer/developers', label: 'Developer demo', note: 'Build the experience, use the engine', icon: Code2 },
      { to: '/trainer/help', label: 'Help & knowledge', note: 'Plain-language learning', icon: BookOpen },
      { to: '/trainer/settings', label: 'Trainer settings', note: 'Atmosphere and learning state', icon: Settings },
    ],
  },
];

const stories = [
  { to: '/trainer/create?intent=I%20want%20to%20buy%20sofas%20and%20have%20them%20delivered%20to%20Ruiru', title: 'Buy sofas + delivery', type: 'Trade' },
  { to: '/trainer/create?intent=Five%20siblings%20want%20to%20support%20Mum%20every%20month', title: 'Support Mum monthly', type: 'Life' },
  { to: '/trainer/create?intent=I%20am%20renovating%20a%20house%20with%20a%20painter%20plumber%20and%20electrician', title: 'Renovation with 3 suppliers', type: 'SecureFlow' },
  { to: '/trainer/create?intent=Parents%20are%20funding%20a%20school%20trip%20with%20transport%20meals%20and%20activities', title: 'School trip', type: 'Group' },
];

export default function ExplorerMap() {
  return (
    <main className="yui-map-page">
      <section className="yui-map-hero">
        <div>
          <p className="yui-map-kicker">SECUREPAY TRAINER · GUIDED LEARNING WORLD</p>
          <h1>Learn the whole Market.<br /><span>Nothing here is real trade.</span></h1>
          <p>Every room here is safe to experience. Demo screens can show agreement, money and operational states, but they cannot create live identity, payment, release, settlement, quorum, reward or verification truth.</p>
        </div>
        <div className="yui-map-beacon"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><p><strong>The real Market is separate.</strong><span>When you are ready, use “Do this for real” to authenticate again and start from a draft intention—not simulated authority.</span></p></div>
      </section>

      <section className="yui-play-market-banner">
        <div className="yui-play-market-banner__mark"><LivingSecurePayMark state="guiding" size="sm" presence="present" /></div>
        <div><p>SEPARATE WORLD · PRACTISE THROUGH CONSEQUENCES</p><h2>Enter the Market Game</h2><span>The Game is competitive simulation. It is different from the Trainer and different from real trade.</span></div>
        <div className="yui-play-market-banner__facts"><small>SIMULATED</small><small>NO CASH VALUE</small><small>NO MARKET AUTHORITY</small></div>
        <Link to="/game">Enter Game <Trophy size={15} /><ArrowRight size={15} /></Link>
      </section>

      <section className="yui-story-strip" aria-label="Try a story">
        <div><p>TRY A STORY</p><h2>Start with something human.</h2></div>
        <div className="yui-story-links">
          {stories.map(story => <Link key={story.title} to={story.to}><small>{story.type}</small><strong>{story.title}</strong><ArrowRight size={14} /></Link>)}
        </div>
      </section>

      <div className="yui-map-grid">
        {areas.map(area => (
          <section key={area.title} className="yui-map-room">
            <p>{area.eyebrow}</p>
            <h2>{area.title}</h2>
            <span>{area.description}</span>
            <div>
              {area.links.map(({ to, label, note, icon: Icon }) => (
                <Link key={to} to={to}>
                  <i><Icon size={18} /></i>
                  <b><strong>{label}</strong><small>{note}</small></b>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="yui-map-bottom">
        <LivingSecurePayMark state="resting" size="sm" presence="polite" />
        <div><strong>The Trainer teaches the Market; it is not the Market.</strong><p>Trainer state is deliberately isolated. Only the real Market can authenticate a KS identity or create authoritative agreement and financial state.</p></div>
        <Link to="/trainer/certification">Open certification room <ArrowRight size={14} /></Link>
      </section>
    </main>
  );
}
