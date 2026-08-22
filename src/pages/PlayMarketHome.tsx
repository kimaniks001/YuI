import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Handshake,
  Lock,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  MARKET_PASS_MONTHLY_KES,
  STARTING_CAPITAL_OPTIONS,
  clearMarketSession,
  createSession,
  formatDemoKes,
  readMarketSession,
  writeMarketSession,
  type MarketGameMode,
} from '../lib/playMarket';

type SetupPlayer = { name: string; startingCapital: number };

const initialNames = ['You', 'Wanjiku', 'Sam', 'Kamau', 'Zuri', 'Fundi Fred'];

function playerCountForMode(mode: MarketGameMode) {
  if (mode === 'solo') return 1;
  if (mode === 'duo') return 2;
  return 3;
}

export default function PlayMarketHome() {
  const navigate = useNavigate();
  const saved = useMemo(() => readMarketSession(), []);
  const [mode, setMode] = useState<MarketGameMode>('solo');
  const [roomName, setRoomName] = useState('Friday Night Market');
  const [testPass, setTestPass] = useState(false);
  const [players, setPlayers] = useState<SetupPlayer[]>([
    { name: 'You', startingCapital: 100_000 },
  ]);

  const switchMode = (next: MarketGameMode) => {
    setMode(next);
    const count = playerCountForMode(next);
    setPlayers(current => Array.from({ length: count }, (_, index) => current[index] ?? {
      name: initialNames[index],
      startingCapital: 100_000,
    }));
    if (next !== 'room') setTestPass(false);
  };

  const updatePlayer = (index: number, patch: Partial<SetupPlayer>) => {
    setPlayers(current => current.map((player, playerIndex) => playerIndex === index ? { ...player, ...patch } : player));
  };

  const addPlayer = () => {
    setPlayers(current => current.length >= 6 ? current : [...current, {
      name: initialNames[current.length] ?? `Trader ${current.length + 1}`,
      startingCapital: 100_000,
    }]);
  };

  const removePlayer = (index: number) => {
    setPlayers(current => current.length <= 3 ? current : current.filter((_, playerIndex) => playerIndex !== index));
  };

  const start = () => {
    if (mode === 'room' && players.length > 2 && !testPass) return;
    const session = createSession({
      roomName,
      mode,
      players: players.map(player => ({
        name: player.name.trim() || 'Trader',
        startingCapital: Math.max(5_000, Math.round(Number(player.startingCapital) || 100_000)),
      })),
      marketPassTestUnlocked: mode === 'room' && testPass,
    });
    clearMarketSession();
    writeMarketSession(session);
    navigate('/play/market');
  };

  return (
    <main className="play-market-page play-market-start">
      <header className="play-market-hero">
        <Link to="/explore" className="play-market-back">← YUI v1 Explorer</Link>
        <div className="play-market-hero-copy">
          <p className="play-market-kicker">PLAY THE MARKET · EXPLORER GAME</p>
          <h1>Build. Trade. Finish projects.<br /><span>Become a great fair trader.</span></h1>
          <p>Choose your Demo Capital, make commercial decisions, work with other players and climb the leaderboard. Every shilling here is fictional training money.</p>
          <div className="play-market-safety"><LivingSecurePayMark state="guiding" size="sm" presence="present" /><span><strong>Explorer Money</strong><small>No real monetary value · no M-PESA · no bank rail · no cash-out</small></span></div>
        </div>
        <div className="play-market-hero-mark"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><strong>Money should follow the agreement.</strong><span>Even when the money is only for practice.</span></div>
      </header>

      <section className="play-market-mode-grid" aria-label="Choose game mode">
        <button type="button" className={mode === 'solo' ? 'is-selected' : ''} onClick={() => switchMode('solo')}>
          <Sparkles size={22} /><strong>Solo Market</strong><span>Learn at your own pace.</span><small>FREE</small>
        </button>
        <button type="button" className={mode === 'duo' ? 'is-selected' : ''} onClick={() => switchMode('duo')}>
          <Handshake size={22} /><strong>Two Traders</strong><span>Pass & play together.</span><small>FREE</small>
        </button>
        <button type="button" className={mode === 'room' ? 'is-selected' : ''} onClick={() => switchMode('room')}>
          <Users size={22} /><strong>Market Room</strong><span>3–6 family or friends.</span><small>MARKET PASS</small>
        </button>
      </section>

      <div className="play-market-setup-grid">
        <section className="play-market-panel">
          <div className="play-market-panel-heading"><Banknote size={20} /><div><p>STARTING CAPITAL</p><h2>How much would you like to start with?</h2></div></div>
          <p className="play-market-panel-note">Each trader chooses their own starting capital. The leaderboard normalizes capital growth so starting rich does not automatically make you the best trader.</p>

          {mode !== 'solo' && <label className="play-market-field"><span>Market room name</span><input value={roomName} onChange={event => setRoomName(event.target.value)} maxLength={38} /></label>}

          <div className="play-market-player-list">
            {players.map((player, index) => (
              <article className="play-market-player-setup" key={index}>
                <div className="play-market-player-number">{index + 1}</div>
                <label><span>Trader name</span><input value={player.name} onChange={event => updatePlayer(index, { name: event.target.value })} maxLength={24} /></label>
                <label><span>Demo Capital · type any amount</span><input type="number" min="5000" step="5000" list={`capital-options-${index}`} value={player.startingCapital} onChange={event => updatePlayer(index, { startingCapital: Number(event.target.value) })} />
                  <datalist id={`capital-options-${index}`}>{STARTING_CAPITAL_OPTIONS.map(amount => <option value={amount} key={amount}>{formatDemoKes(amount)}</option>)}</datalist>
                </label>
                {mode === 'room' && players.length > 3 && <button type="button" className="play-market-remove" onClick={() => removePlayer(index)}>Remove</button>}
              </article>
            ))}
          </div>

          {mode === 'room' && players.length < 6 && <button type="button" className="play-market-add-player" onClick={addPlayer}>+ Add another trader</button>}
        </section>

        <aside className="play-market-side-stack">
          {mode === 'room' ? <section className={`play-market-pass ${testPass ? 'is-unlocked' : ''}`}>
            <div className="play-market-pass-icon">{testPass ? <CheckCircle2 size={24} /> : <Lock size={22} />}</div>
            <p>MARKET PASS</p>
            <h2>KES {MARKET_PASS_MONTHLY_KES} / month</h2>
            <span>Unlocks Market Rooms for 3–6 players. The pass is an access subscription — never a stake, wager or prize.</span>
            <button type="button" onClick={() => setTestPass(true)} disabled={testPass}>{testPass ? 'Test pass active' : 'Activate test pass'}</button>
            <small>Explorer test build: no payment is collected. This tests the future commercial gate only.</small>
          </section> : <section className="play-market-free-card">
            <Handshake size={26} /><p>FREE TO LEARN</p><h2>{mode === 'solo' ? 'Your own Market.' : 'Two traders, one table.'}</h2><span>Solo and two-player play stay open so anyone can learn the rhythm of fair trade.</span>
          </section>}

          <section className="play-market-why">
            <Trophy size={21} /><div><strong>Richest does not automatically win.</strong><span>Your score rewards capital efficiency, projects completed, reliability, agreement-first decisions and fair trade with other players.</span></div>
          </section>
        </aside>
      </div>

      <section className="play-market-start-actions">
        {saved && <button type="button" className="play-market-secondary" onClick={() => navigate('/play/market')}>Resume {saved.roomName} <ArrowRight size={16} /></button>}
        <button type="button" className="play-market-primary" disabled={mode === 'room' && players.length > 2 && !testPass} onClick={start}>Start the Market <ArrowRight size={17} /></button>
        <Link to="/play/leaderboard" className="play-market-text-link">See leaderboard</Link>
      </section>
    </main>
  );
}
