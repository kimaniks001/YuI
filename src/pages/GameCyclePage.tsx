import { useState } from 'react';
import { Coins, HeartPulse, History, RefreshCw, Store } from 'lucide-react';
import GameNav from '../components/game/GameNav';
import { browserGameService } from '../game/gameService';
import type { GameSnapshot } from '../game/gameTypes';

function fmt(value: number) { return `KES ${Math.round(value).toLocaleString()}`; }

export default function GameCyclePage() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => browserGameService.getSnapshot());
  const [name, setName] = useState(snapshot.profile.displayName);
  const profile = snapshot.profile;
  const cycle = profile.cycle;

  const startCycle = (plan: 'PERSONAL' | 'BUSINESS') => setSnapshot(browserGameService.startCycle(plan));
  const rename = () => setSnapshot(browserGameService.rename(name));

  return <main className="min-h-screen bg-[#f6f4ed] px-4 py-6 sm:px-6">
    <GameNav />
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-[#18392c] p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">MW-13 · Game Foundation</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Grow money without losing the life it should support.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">Your Game profile keeps Trade, Life and resilience visible beside capital. Cycle Coins are temporary practice resources only; achievements and history survive Cycle renewal.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Game profile</p><h2 className="mt-1 font-display text-2xl">{profile.displayName}</h2></div>
            <Store size={24} className="text-green-700" />
          </div>
          <div className="mt-4 flex gap-2"><input value={name} onChange={event => setName(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-ink/15 px-3 text-sm" /><button onClick={rename} className="rounded-full bg-green-700 px-4 text-sm font-semibold text-white">Save name</button></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Capital" value={fmt(profile.capital)} />
            <Fact label="Resources" value={String(profile.resources)} />
            <Fact label="Achievements" value={String(profile.achievements.length)} />
            <Fact label="History" value={String(profile.history.length)} />
          </div>
        </article>

        <article className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-green-700"><HeartPulse size={20} /><p className="text-xs font-bold uppercase tracking-[0.16em]">Yin–Yang Game Health</p></div>
          <div className="mt-4 space-y-3">
            <Health label="Trade" value={profile.health.trade} note="Work, capital, customers and enterprise." />
            <Health label="Life" value={profile.health.life} note="Family, rest, community and meaning." />
            <Health label="Resilience" value={profile.health.resilience} note="Capacity to absorb shocks across Cycles." />
          </div>
          <p className="mt-4 text-xs leading-5 text-ink/45">Game Health is a simulation metric. It is not medical health, financial health, creditworthiness or a Real Market trust score.</p>
        </article>
      </section>

      <section className="rounded-2xl border border-amber-700/15 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-amber-800"><Coins size={21} /><p className="text-xs font-bold uppercase tracking-[0.16em]">Game Cycle & Cycle Coins</p></div>
        {cycle ? <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div><h2 className="font-display text-2xl">{cycle.plan === 'PERSONAL' ? 'Personal' : 'Business'} Game Cycle</h2><p className="mt-1 text-sm text-ink/55">Started {new Date(cycle.startedAt).toLocaleDateString()} · renews {new Date(cycle.endsAt).toLocaleDateString()}</p><p className="mt-3 text-3xl font-bold text-amber-800">{cycle.coinBalance} <span className="text-base font-semibold">Cycle Coins</span></p><p className="mt-1 text-sm text-ink/50">Started with {cycle.initialCoins}. Coins do not roll over to the next Cycle.</p></div>
          <button type="button" onClick={() => startCycle(cycle.plan)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-700/20 px-4 text-sm font-semibold text-amber-900"><RefreshCw size={15} /> Renew same Cycle</button>
        </div> : <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button onClick={() => startCycle('PERSONAL')} className="rounded-2xl border border-amber-700/20 p-4 text-left hover:bg-amber-50"><strong>Personal Game Cycle</strong><span className="mt-1 block text-sm text-ink/55">KES 100 concept → 5 Cycle Coins</span></button>
          <button onClick={() => startCycle('BUSINESS')} className="rounded-2xl border border-amber-700/20 p-4 text-left hover:bg-amber-50"><strong>Business Game Cycle</strong><span className="mt-1 block text-sm text-ink/55">KES 200 concept → 12 Cycle Coins</span></button>
        </div>}
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950/75">No payment is collected in this browser Game build. Game Coins have no cash value, cannot be withdrawn and never create a Real Market entitlement.</p>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-green-700"><History size={20} /><p className="text-xs font-bold uppercase tracking-[0.16em]">Deterministic Game history</p></div>
        <div className="mt-3 space-y-2">{profile.history.slice(0, 8).length ? profile.history.slice(0, 8).map(entry => <article key={entry.id} className="rounded-xl border border-ink/8 p-3"><strong className="text-sm text-ink">{entry.title}</strong><p className="mt-1 text-sm text-ink/55">{entry.detail}</p><small className="text-ink/35">{new Date(entry.at).toLocaleString()}</small></article>) : <p className="text-sm text-ink/50">Your Game decisions will create persistent history here.</p>}</div>
      </section>
    </div>
  </main>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#f7f8f4] p-3"><span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</span><strong className="mt-1 block text-sm text-ink">{value}</strong></div>; }
function Health({ label, value, note }: { label: string; value: number; note: string }) { return <div><div className="flex justify-between text-sm"><strong>{label}</strong><span>{value}/100</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/8"><i className="block h-full rounded-full bg-green-700" style={{ width: `${value}%` }} /></div><small className="text-ink/40">{note}</small></div>; }
