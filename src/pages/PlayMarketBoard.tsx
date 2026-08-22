import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Banknote,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Handshake,
  Home,
  RefreshCw,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  MARKET_PROJECTS,
  badgeLabel,
  capitalGrowthPct,
  fairTraderScore,
  formatDemoKes,
  levelForXp,
  nextLevelForXp,
  readMarketSession,
  writeMarketSession,
  type MarketGamePlayer,
  type MarketGameSession,
} from '../lib/playMarket';

function taskRows(player: MarketGamePlayer) {
  return [
    { label: 'Complete one agreement-first project', done: player.agreementFirstWins >= 1, note: 'Clarity before commitment.' },
    { label: 'Complete three projects', done: player.projectsCompleted >= 3, note: 'Build a repeatable operating rhythm.' },
    { label: 'Trade with another player', done: player.partnerTrades >= 1, note: 'Markets grow through relationships.' },
    { label: 'Reach reputation 80', done: player.reputation >= 80, note: 'Consistency becomes a visible asset.' },
  ];
}

export default function PlayMarketBoard() {
  const [session, setSession] = useState<MarketGameSession | null>(() => readMarketSession());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (session) writeMarketSession(session);
  }, [session]);

  const player = session?.players[session.activePlayerIndex];
  const availableProjects = useMemo(() => {
    if (!player) return [];
    const projects = MARKET_PROJECTS.filter(project => !player.completedProjectIds.includes(project.id));
    return showAll ? projects : projects.slice(0, 6);
  }, [player, showAll]);

  if (!session || !player) {
    return <main className="play-market-page"><section className="play-market-empty"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><h1>No Market is running yet.</h1><p>Choose your Demo Capital and start a safe Explorer game.</p><Link to="/play" className="play-market-primary">Set up the Market <ArrowRight size={16} /></Link></section></main>;
  }

  const level = levelForXp(player.xp);
  const nextLevel = nextLevelForXp(player.xp);
  const progress = nextLevel ? Math.max(0, Math.min(100, ((player.xp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100)) : 100;
  const growth = capitalGrowthPct(player);
  const tasks = taskRows(player);

  return (
    <main className="play-market-page play-market-board">
      <header className="play-market-board-head">
        <div>
          <Link to="/play" className="play-market-back">← Play the Market</Link>
          <p className="play-market-kicker">{session.roomName.toUpperCase()} · ROUND {session.round}</p>
          <h1>{session.players.length > 1 ? `${player.name}, your turn.` : `Welcome, ${player.name}.`}</h1>
          <p>Pick a project, protect your working capital and make choices you could proudly explain to the other side of the trade.</p>
        </div>
        <div className="play-market-turn-mark"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><span>ACTIVE TRADER</span><strong>{player.name}</strong>{session.players.length > 1 && <small>{session.activePlayerIndex + 1} of {session.players.length}</small>}</div>
      </header>

      <section className="play-market-stat-grid">
        <article><Banknote size={19} /><div><span>DEMO CAPITAL</span><strong>{formatDemoKes(player.capital)}</strong><small className={growth >= 0 ? 'is-positive' : 'is-negative'}>{growth >= 0 ? '+' : ''}{growth.toFixed(1)}% from start</small></div></article>
        <article><Trophy size={19} /><div><span>FAIR TRADER SCORE</span><strong>{fairTraderScore(player).toLocaleString()}</strong><small>Normalized for starting capital</small></div></article>
        <article><Award size={19} /><div><span>LEVEL {level.level}</span><strong>{level.name}</strong><small>{player.xp.toLocaleString()} XP</small></div></article>
        <article><Handshake size={19} /><div><span>REPUTATION</span><strong>{player.reputation}/100</strong><small>{player.projectsCompleted} projects · {player.partnerTrades} partner trades</small></div></article>
      </section>

      <section className="play-market-level-card">
        <div><p>NEXT LEVEL</p><h2>{nextLevel ? nextLevel.name : 'Master Trader'}</h2><span>{nextLevel ? `${nextLevel.minXp - player.xp} XP to go` : 'You reached the top Explorer level.'}</span></div>
        <div className="play-market-level-track"><i style={{ width: `${progress}%` }} /></div>
        <small>{level.note}</small>
      </section>

      {session.players.length > 1 && <section className="play-market-room-strip">
        <div className="play-market-room-strip-title"><Users size={19} /><div><p>THIS MARKET</p><strong>Pass & play · {session.mode === 'room' ? 'Market Pass test room' : 'free two-trader room'}</strong></div></div>
        <div className="play-market-room-players">
          {session.players.map((item, index) => <article className={index === session.activePlayerIndex ? 'is-active' : ''} key={item.id}><span>{index + 1}</span><div><strong>{item.name}</strong><small>{formatDemoKes(item.capital)} · {levelForXp(item.xp).name}</small></div></article>)}
        </div>
      </section>}

      <div className="play-market-board-grid">
        <section className="play-market-projects">
          <div className="play-market-section-head"><div><p>PROJECT BOARD</p><h2>What will you take on?</h2><span>You must have enough Demo Capital to carry the project. Completing it changes capital, XP and reputation.</span></div><Target size={23} /></div>
          <div className="play-market-project-grid">
            {availableProjects.map(project => {
              const canAfford = player.capital >= project.commitment;
              return <article className={`play-market-project-card ${!canAfford ? 'is-locked' : ''}`} key={project.id}>
                <div className="play-market-project-meta"><span>{project.category}</span><small>{project.place} · Difficulty {project.difficulty}/5</small></div>
                <h3>{project.title}</h3>
                <p>{project.brief}</p>
                <div className="play-market-project-foot"><div><small>CAPITAL NEEDED</small><strong>{formatDemoKes(project.commitment)}</strong></div>{canAfford ? <Link to={`/play/project/${project.id}`}>Take project <ArrowRight size={15} /></Link> : <span className="play-market-cant-afford"><AlertCircle size={14} /> Need more capital</span>}</div>
              </article>;
            })}
          </div>
          {MARKET_PROJECTS.filter(project => !player.completedProjectIds.includes(project.id)).length > 6 && <button type="button" className="play-market-show-all" onClick={() => setShowAll(value => !value)}>{showAll ? 'Show fewer projects' : 'Show all projects'} <ArrowRight size={14} /></button>}
          {availableProjects.length === 0 && <div className="play-market-complete-box"><CheckCircle2 size={22} /><div><strong>You cleared every project in this test deck.</strong><span>That is a good point to compare scores, reset, or let another tester start a fresh Market.</span></div></div>}
        </section>

        <aside className="play-market-board-side">
          <section className="play-market-task-card">
            <div className="play-market-section-head compact"><div><p>MARKET TASKS</p><h2>Level up by trading well.</h2></div><BarChart3 size={20} /></div>
            <div className="play-market-tasks">
              {tasks.map(task => <article className={task.done ? 'is-done' : ''} key={task.label}>{task.done ? <CheckCircle2 size={17} /> : <Target size={17} />}<div><strong>{task.label}</strong><span>{task.note}</span></div></article>)}
            </div>
          </section>

          <section className="play-market-badge-card">
            <p>BADGES</p><h2>{player.badges.length ? `${player.badges.length} earned` : 'Your first badge is close.'}</h2>
            <div>{player.badges.length ? player.badges.map(id => <span key={id}><Award size={14} /> {badgeLabel(id)}</span>) : <small>Choose an agreement-first project to earn “Agreement First”.</small>}</div>
          </section>

          <section className="play-market-history-card">
            <p>RECENT MARKET LIFE</p>
            {player.history.slice(0, 5).length ? player.history.slice(0, 5).map(entry => <article key={entry.id}><div><strong>{entry.title}</strong><span>{entry.detail}</span></div><small className={entry.capitalDelta >= 0 ? 'is-positive' : 'is-negative'}>{entry.capitalDelta ? `${entry.capitalDelta > 0 ? '+' : ''}${formatDemoKes(entry.capitalDelta)}` : `+${entry.xpDelta} XP`}</small></article>) : <div className="play-market-no-history">Your choices will appear here.</div>}
          </section>
        </aside>
      </div>

      <footer className="play-market-board-footer">
        <Link to="/play/leaderboard"><Trophy size={16} /> Leaderboard</Link>
        <Link to="/explore"><Home size={16} /> Back to Explorer</Link>
        <button type="button" onClick={() => setSession(readMarketSession())}><RefreshCw size={15} /> Refresh local game</button>
        <span>DEMO MONEY · NO REAL MONETARY VALUE</span>
      </footer>
    </main>
  );
}
