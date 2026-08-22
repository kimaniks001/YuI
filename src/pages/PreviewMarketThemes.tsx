import { useState } from 'react';
import { Check, Leaf, Moon, Store, Sun } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import MarketOpeningRitual from '../components/MarketOpeningRitual';
import { useMarketAtmosphere } from '../lib/marketAtmosphere';

const THEME_ICONS = {
  'market-day': Sun,
  'green-market': Leaf,
  'town-market': Store,
  'evening-market': Moon,
} as const;

const INVARIANTS = [
  'The official SecurePay icon stays green and unchanged.',
  'Green success and orange caution keep the same meaning.',
  'Agreement, money, quorum, identity and settlement truth do not change with a theme.',
  'Layout priority, buttons and navigation keep the same meaning.',
  'Reduced-motion users get atmosphere without motion-dependent meaning.',
];

export default function PreviewMarketThemes() {
  const { theme, setTheme, themes } = useMarketAtmosphere();
  const [ritualKey, setRitualKey] = useState(0);
  const [showRitual, setShowRitual] = useState(false);

  const replayOpening = () => {
    setRitualKey(value => value + 1);
    setShowRitual(true);
  };

  return (
    <main className="b11-page b11-theme-lab">
      {showRitual && <MarketOpeningRitual key={ritualKey} forceOpen onClose={() => setShowRitual(false)} />}

      <header className="b11-hero">
        <div>
          <p className="b11-kicker">Batch 11 · V17 Market atmosphere</p>
          <h1>The Market has seasons. SecurePay keeps its truth.</h1>
          <p>The atmosphere may change around the trader. The official mark, status language, agreement meaning and financial authority do not.</p>
        </div>
        <LivingSecurePayMark state="resting" size="lg" presence="polite" label="SecurePay remains constant across Market themes" />
      </header>

      <section className="b11-room">
        <div className="b11-room-heading">
          <div><p className="b11-label">Four stable atmospheres</p><h2>Choose the mood around the same Market.</h2></div>
          <button type="button" className="b11-replay" onClick={replayOpening}>Replay Market opening</button>
        </div>

        <div className="b11-theme-grid" aria-label="SecurePay Market atmosphere choices">
          {themes.map(item => {
            const Icon = THEME_ICONS[item.id];
            const active = theme === item.id;
            return (
              <button key={item.id} type="button" className={`b11-theme-card b11-theme-card--${item.id} ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={() => setTheme(item.id)}>
                <span className="b11-theme-card__icon"><Icon size={20} /></span>
                <span className="b11-theme-card__copy"><strong>{item.name}</strong><small>{item.atmosphere}</small><em>{item.description}</em></span>
                {active && <span className="b11-theme-card__check" aria-label="Selected"><Check size={14} /></span>}
              </button>
            );
          })}
        </div>

        <div className="b11-market-specimen" aria-label="Theme specimen">
          <div className="b11-specimen-topline">
            <div><p>Your Market needs you here</p><strong>One clear action. Everything else can wait.</strong></div>
            <LivingSecurePayMark state="guiding" size="md" presence="present" />
          </div>
          <article className="b11-specimen-card">
            <span className="b11-specimen-story"><Store size={21} /></span>
            <div><strong>Generator purchase</strong><p>KES 85,000 · delivery agreed for Saturday</p><small>Next: confirm the inspection step</small></div>
            <span className="b11-specimen-status">Needs you</span>
          </article>
          <div className="b11-specimen-waiting">
            <LivingSecurePayMark state="waiting" size="xs" presence="polite" />
            <div><strong>School trip contribution</strong><span>Waiting peacefully · nothing required from you right now.</span></div>
          </div>
        </div>
      </section>

      <section className="b11-room b11-invariants">
        <div><p className="b11-label">Theme boundary</p><h2>Atmosphere may move. Product meaning may not.</h2></div>
        <div className="b11-invariant-list">
          {INVARIANTS.map(item => <div key={item}><span><Check size={12} /></span><p>{item}</p></div>)}
        </div>
      </section>
    </main>
  );
}
