import { Award, Crown, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import GameNav from '../components/game/GameNav';
import { browserGameService } from '../game/gameService';

export default function GameAchievementsPage() {
  const score = browserGameService.score();
  const snapshot = browserGameService.getSnapshot();

  return <main className="min-h-screen bg-[#f6f4ed] px-4 py-6 sm:px-6">
    <GameNav />
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-[#241f2f] p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">MW-18 · Balanced Leaderboards</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">The richest player is not automatically the strongest player.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">The Game score is transparent and multi-dimensional: growth, balance, obligations, collaboration, Circle/Community contribution, Recovery behaviour and productive referrals.</p></header>

      <section className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
        <article className={`rounded-3xl border p-6 shadow-sm ${score.gameMaster ? 'border-violet-700/20 bg-violet-50' : 'border-ink/8 bg-white'}`}>
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Season score</p><strong className="mt-2 block font-display text-6xl text-ink">{score.total}</strong><span className="text-sm text-ink/45">out of 100</span></div>{score.gameMaster ? <Crown size={42} className="text-violet-700" /> : <Trophy size={42} className="text-violet-700/60" />}</div>
          <div className="mt-5 rounded-2xl bg-white/80 p-4"><strong className="text-sm text-ink">{score.gameMaster ? 'Game Master threshold reached' : 'Keep building balance and contribution'}</strong><p className="mt-1 text-sm leading-6 text-ink/55">{score.gameMaster ? 'This is Game-only recognition for explainable performance.' : 'Game Master requires a strong overall score plus healthy balance, collaboration and completed obligations.'}</p></div>
          <p className="mt-4 text-xs leading-5 text-ink/45">Game Master ≠ Real Market Master. This status does not imply expertise, trustworthiness, verification, financial strength or authority in SecurePay.</p>
        </article>

        <article className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-violet-700"><ShieldCheck size={20} /><p className="text-xs font-bold uppercase tracking-[0.16em]">Why this score</p></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><ScoreRow label="Economic growth" value={score.economicGrowth} weight="20%" /><ScoreRow label="Game Health / Balance" value={score.balance} weight="25%" /><ScoreRow label="Completed obligations" value={score.obligations} weight="15%" /><ScoreRow label="Collaboration" value={score.collaboration} weight="15%" /><ScoreRow label="Circle + Community" value={score.circleCommunity} weight="10%" /><ScoreRow label="Responsible Recovery" value={score.recovery} weight="10%" /><ScoreRow label="Productive referrals" value={score.referrals} weight="5%" /></div>
          <div className="mt-5 space-y-1">{score.explanation.map(line => <p key={line} className="text-xs text-ink/45">• {line}</p>)}</div>
        </article>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2 text-violet-700"><Award size={20} /><p className="text-xs font-bold uppercase tracking-[0.16em]">Achievements & persistent history</p></div><p className="mt-2 text-sm text-ink/55">Cycle Coins reset; persistent Game achievements and history survive the Cycle. This is deliberate: temporary resources teach renewal while learning history compounds.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><Badge label="Agreement practice" active={snapshot.profile.obligationsCompleted > 0} /><Badge label="Community contributor" active={snapshot.profile.communityContribution > 0} /><Badge label="Circle collaborator" active={snapshot.profile.circleContribution > 0} /><Badge label="Recovery learner" active={snapshot.profile.recoveryResponsibility > 0} /><Badge label="Opportunity connector" active={snapshot.profile.productiveReferrals > 0} /><Badge label="Balanced trader" active={score.balance >= 70} /></div></section>

      <section className="rounded-2xl border border-violet-700/15 bg-violet-50 p-5 text-sm text-violet-950"><div className="flex gap-3"><Sparkles size={20} className="mt-0.5 shrink-0" /><div><strong>Leaderboard law</strong><p className="mt-1 leading-6 text-violet-950/70">Every Game ranking must remain explainable, Game-only, non-cash and non-transferable. There are no loot boxes, cash redemption, gambling outcomes or hidden pay-to-win authority.</p></div></div></section>
    </div>
  </main>;
}

function ScoreRow({ label, value, weight }: { label: string; value: number; weight: string }) { return <div className="rounded-xl bg-[#f7f8f4] p-3"><div className="flex items-center justify-between gap-3 text-sm"><strong>{label}</strong><span>{value}/100</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/8"><i className="block h-full rounded-full bg-violet-700" style={{ width: `${value}%` }} /></div><small className="mt-1 block text-ink/40">Weight {weight}</small></div>; }
function Badge({ label, active }: { label: string; active: boolean }) { return <div className={`rounded-xl border p-3 ${active ? 'border-violet-700/20 bg-violet-50' : 'border-ink/8 bg-[#f7f8f4]'}`}><Award size={17} className={active ? 'text-violet-700' : 'text-ink/25'} /><strong className="mt-2 block text-sm text-ink">{label}</strong><span className="mt-1 block text-xs text-ink/40">{active ? 'Earned in this Game history' : 'Not earned yet'}</span></div>; }
