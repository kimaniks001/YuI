import { useState } from 'react';
import { CircleDot, QrCode, RefreshCw, Store, Users2 } from 'lucide-react';
import GameNav from '../components/game/GameNav';
import { browserGameService } from '../game/gameService';
import type { GameChallengeKind, GameSnapshot } from '../game/gameTypes';

const icons: Record<GameChallengeKind, typeof Store> = {
  SECURELINK: CircleDot,
  QR: QrCode,
  STORE_VISIT: Store,
  OPPORTUNITY_PASS: RefreshCw,
  CIRCLE: Users2,
  COMMUNITY: Users2,
};

export default function GameMissionsPage() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => browserGameService.getSnapshot());
  const [note, setNote] = useState<string | null>(null);

  const run = (fn: () => GameSnapshot, message: string) => {
    try { setSnapshot(fn()); setNote(message); } catch (error) { setNote(error instanceof Error ? error.message : 'Mission action failed.'); }
  };

  return <main className="min-h-screen bg-[#f6f4ed] px-4 py-6 sm:px-6">
    <GameNav />
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-[#40321f] p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">MW-17 · Social Missions</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">Learn the Market through one another.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">Challenges rehearse sharing, QR, Store discovery, opportunity passing, Circles and Community contribution. Game validation creates Game history only and never a real reward entitlement.</p></header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {snapshot.challenges.map(challenge => {
          const Icon = icons[challenge.kind];
          return <article key={challenge.id} className={`rounded-2xl border p-5 shadow-sm ${challenge.completedAt ? 'border-green-700/15 bg-green-50' : 'border-ink/8 bg-white'}`}>
            <Icon size={21} className={challenge.completedAt ? 'text-green-700' : 'text-amber-800'} />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-ink/40">{challenge.kind.replaceAll('_', ' ')}</p>
            <h2 className="mt-1 font-display text-xl text-ink">{challenge.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">{challenge.detail}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {!challenge.completedAt ? <button onClick={() => run(() => browserGameService.completeChallenge(challenge.id), 'Mission completed in Game history.')} className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white">Complete mission</button> : <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-green-800">Completed</span>}
              <button onClick={() => run(() => browserGameService.replayChallenge(challenge.id), 'Replay recorded without duplicating first-completion credit.')} className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/60"><RefreshCw size={13} /> Replay {challenge.replayCount ? `(${challenge.replayCount})` : ''}</button>
            </div>
          </article>;
        })}
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        <Metric label="Collaboration" value={snapshot.profile.collaboration} />
        <Metric label="Circle contribution" value={snapshot.profile.circleContribution} />
        <Metric label="Community contribution" value={snapshot.profile.communityContribution} />
        <Metric label="Productive referrals" value={snapshot.profile.productiveReferrals} />
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 text-sm text-ink/55 shadow-sm"><strong className="text-ink">Farming control:</strong> first completion earns contribution credit; replay is recorded separately so repeatedly pressing the same challenge cannot endlessly manufacture leaderboard value.</section>
      {note && <p className="rounded-xl bg-white p-3 text-sm text-ink/60 shadow-sm">{note}</p>}
    </div>
  </main>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</span><strong className="mt-1 block text-2xl text-ink">{value}</strong></div>; }
