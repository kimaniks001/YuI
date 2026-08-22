import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BarChart3,
  Crown,
  Trophy,
  Users,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  capitalGrowthPct,
  demoKenyaLeaderboard,
  fairTraderScore,
  levelForXp,
  readLocalLeaderboard,
  readMarketSession,
  type LocalLeaderboardEntry,
} from '../lib/playMarket';

function currentRoomEntries(): LocalLeaderboardEntry[] {
  const session = readMarketSession();
  if (!session) return [];
  return session.players.map(player => ({
    id: player.id,
    name: player.name,
    score: fairTraderScore(player),
    level: levelForXp(player.xp).name,
    growthPct: capitalGrowthPct(player),
    projects: player.projectsCompleted,
    reputation: player.reputation,
    at: session.updatedAt,
  })).sort((a, b) => b.score - a.score);
}

function LeaderTable({ entries, empty }: { entries: LocalLeaderboardEntry[]; empty: string }) {
  if (!entries.length) return <div className="play-market-board-empty">{empty}</div>;
  return <div className="play-market-leader-table">
    <div className="play-market-leader-head"><span>RANK</span><span>TRADER</span><span>SCORE</span><span>GROWTH</span><span>PROJECTS</span><span>REPUTATION</span></div>
    {entries.map((entry, index) => <article key={entry.id} className={index < 3 ? `is-top is-${index + 1}` : ''}>
      <span className="play-market-rank">{index === 0 ? <Crown size={17} /> : index + 1}</span>
      <div><strong>{entry.name}</strong><small>{entry.level}</small></div>
      <strong>{entry.score.toLocaleString()}</strong>
      <span className={entry.growthPct >= 0 ? 'is-positive' : 'is-negative'}>{entry.growthPct >= 0 ? '+' : ''}{entry.growthPct.toFixed(1)}%</span>
      <span>{entry.projects}</span>
      <span>{entry.reputation}/100</span>
    </article>)}
  </div>;
}

export default function PlayMarketLeaderboard() {
  const room = useMemo(() => currentRoomEntries(), []);
  const device = useMemo(() => readLocalLeaderboard(), []);
  const demo = useMemo(() => demoKenyaLeaderboard(), []);

  return (
    <main className="play-market-page play-market-leaderboard-page">
      <header className="play-market-board-head">
        <div><Link to="/play/market" className="play-market-back"><ArrowLeft size={14} /> Back to the Market</Link><p className="play-market-kicker">PLAY THE MARKET · LEADERBOARD</p><h1>Great traders create value people can trust.</h1><p>Starting capital is normalized. The leaderboard rewards capital efficiency, completed projects, reputation, agreement-first decisions and productive trade with other players.</p></div>
        <div className="play-market-turn-mark"><LivingSecurePayMark state="guiding" size="lg" presence="present" /><span>LEADERBOARD LAW</span><strong>Fair beats rich.</strong><small>Capital helps you attempt bigger projects. It does not buy the top rank.</small></div>
      </header>

      <section className="play-market-leader-principles">
        <article><Trophy size={18} /><div><strong>Fair Trader Score</strong><span>XP + reputation + projects + normalized capital growth.</span></div></article>
        <article><Award size={18} /><div><strong>Levels matter</strong><span>Progress comes from repeated decisions, not one lucky result.</span></div></article>
        <article><Users size={18} /><div><strong>Trade together</strong><span>Partner trades reward both sides instead of making every relationship zero-sum.</span></div></article>
        <article><BarChart3 size={18} /><div><strong>Visible learning</strong><span>Compare score, growth, projects and reputation — not wealth alone.</span></div></article>
      </section>

      <section className="play-market-leader-section">
        <div className="play-market-section-head compact"><div><p>THIS MARKET</p><h2>Who is trading best at this table?</h2><span>Live from the current Explorer session on this device.</span></div><Users size={21} /></div>
        <LeaderTable entries={room} empty="Start a Market Room and the table leaderboard will appear here." />
      </section>

      <section className="play-market-leader-section">
        <div className="play-market-section-head compact"><div><p>THIS DEVICE</p><h2>Family & friends test history</h2><span>Best saved Explorer scores from games played in this browser.</span></div><Trophy size={21} /></div>
        <LeaderTable entries={device} empty="Complete a project and your local test score will be recorded here." />
      </section>

      <section className="play-market-leader-section demo-board">
        <div className="play-market-section-head compact"><div><p>DEMO KENYA BOARD · FICTIONAL</p><h2>See what a wider leaderboard could feel like.</h2><span>These are Keyman Village demo characters — not live users, not verified national rankings.</span></div><Crown size={21} /></div>
        <LeaderTable entries={demo} empty="" />
      </section>

      <section className="play-market-project-truth"><LivingSecurePayMark state="resting" size="xs" presence="polite" /><span><strong>Testing rule:</strong> no leaderboard position has cash value and there are no prizes, stakes or cash-outs in Explorer mode.</span></section>
    </main>
  );
}
