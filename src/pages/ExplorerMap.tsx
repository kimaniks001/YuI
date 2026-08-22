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
    title: 'Enter the Market',
    description: 'See what SecurePay can do before learning product names.',
    links: [
      { to: '/', label: 'Signed-out Market', note: 'Possibility first', icon: Home },
      { to: '/create', label: 'Create an agreement', note: 'Natural intention → clear structure', icon: Sparkles },
      { to: '/signin', label: 'Identity doorway', note: 'Training-only sign-in journey', icon: KeyRound },
      { to: '/securelink/join/demo', label: 'Join an invitation', note: 'Invitation → join → confirm', icon: UserPlus },
    ],
  },
  {
    eyebrow: '02 · OPERATE',
    title: 'Run your Market',
    description: 'Follow what needs you, what is moving and what is already in your records.',
    links: [
      { to: '/dashboard', label: 'Trader Home', note: 'Your front desk', icon: Store },
      { to: '/market', label: 'My Market', note: 'Everything you trade, in one place', icon: LayoutGrid },
      { to: '/agreements/demo', label: 'Agreement Workspace', note: 'One agreement, one working room', icon: FileCheck2 },
      { to: '/actions', label: 'Actions', note: 'What needs you next', icon: ArrowRight },
    ],
  },
  {
    eyebrow: '03 · MONEY & PEOPLE',
    title: 'Understand the flow',
    description: 'Experience money states and multi-party structures without creating financial truth.',
    links: [
      { to: '/money', label: 'Money rooms', note: 'Funding → Payment Ready → settlement', icon: Banknote },
      { to: '/market/flows', label: 'SecureFlow', note: 'One-to-many and many-to-many', icon: Network },
      { to: '/community', label: 'Circle & growth', note: 'Relationships, not rankings', icon: HeartHandshake },
      { to: '/explore/review', label: 'Review & recovery', note: 'Problems need direction, not panic', icon: MessageCircle },
    ],
  },
  {
    eyebrow: '04 · IDENTITY & ECOSYSTEM',
    title: 'See the wider Market',
    description: 'Explore the trader’s address, store, developer experience and learning rooms.',
    links: [
      { to: '/ks/KS2145', label: 'KS Profile & Digital Store', note: 'Identity → offer → agreement', icon: ShoppingBag },
      { to: '/developers', label: 'Developer Market', note: 'Build the experience, use the engine', icon: Code2 },
      { to: '/help', label: 'Help & knowledge', note: 'Plain-language learning', icon: BookOpen },
      { to: '/settings', label: 'Explorer settings', note: 'Atmosphere and training state', icon: Settings },
    ],
  },
];

const stories = [
  { to: '/create?intent=I%20want%20to%20buy%20sofas%20and%20have%20them%20delivered%20to%20Ruiru', title: 'Buy sofas + delivery', type: 'Trade' },
  { to: '/create?intent=Five%20siblings%20want%20to%20support%20Mum%20every%20month', title: 'Support Mum monthly', type: 'Life' },
  { to: '/create?intent=I%20am%20renovating%20a%20house%20with%20a%20painter%20plumber%20and%20electrician', title: 'Renovation with 3 suppliers', type: 'SecureFlow' },
  { to: '/create?intent=Parents%20are%20funding%20a%20school%20trip%20with%20transport%20meals%20and%20activities', title: 'School trip', type: 'Group' },
];

export default function ExplorerMap() {
  return (
    <main className="yui-map-page">
      <section className="yui-map-hero">
        <div>
          <p className="yui-map-kicker">SECUREPAY YUI v1 · TRAINING / EDUCATION</p>
          <h1>The whole Market is open.<br /><span>Explore without authentication.</span></h1>
          <p>Every room here is safe to experience. Fixture-backed screens can demonstrate agreement, money and operational states, but they cannot create live identity, payment, release, settlement, quorum or verification truth.</p>
        </div>
        <div className="yui-map-beacon"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><p><strong>No live-money tap is connected.</strong><span>This is the visual and journey baseline we can use for training even after production is activated.</span></p></div>
      </section>


      <section className="yui-play-market-banner">
        <div className="yui-play-market-banner__mark"><LivingSecurePayMark state="guiding" size="sm" presence="present" /></div>
        <div><p>NEW · LEARN BY PLAYING</p><h2>Play the Market</h2><span>Choose Demo Capital, finish Kenyan projects, trade with family or friends, earn levels and climb a fair-trader leaderboard.</span></div>
        <div className="yui-play-market-banner__facts"><small>Solo · FREE</small><small>2 players · FREE</small><small>3–6 · Market Pass test</small></div>
        <Link to="/play">Start playing <Trophy size={15} /><ArrowRight size={15} /></Link>
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
        <div><strong>YUI v1 is an experience baseline, not a financial authority.</strong><p>When the real API/authentication layer is connected, the production application will use backend truth. This Explorer can remain available separately for onboarding, staff training, demonstrations and education.</p></div>
        <Link to="/explore/certification">Open certification room <ArrowRight size={14} /></Link>
      </section>
    </main>
  );
}
