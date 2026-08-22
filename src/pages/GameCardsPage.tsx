import { useMemo, useState } from 'react';
import { ArrowRight, HeartHandshake, RefreshCw, Scale, Store, WalletCards } from 'lucide-react';
import GameNav from '../components/game/GameNav';
import { browserGameService } from '../game/gameService';
import type { GameCardFamily, GameScenario, GameSnapshot } from '../game/gameTypes';

const families: Array<{ id: GameCardFamily; label: string; icon: typeof Store; note: string }> = [
  { id: 'TRADE', label: 'Trade', icon: Store, note: 'Work, customers, suppliers and growth.' },
  { id: 'LIFE', label: 'Life', icon: HeartHandshake, note: 'Family, obligations, care and meaning.' },
  { id: 'BALANCE', label: 'Balance', icon: Scale, note: 'Rest, resilience and healthy trade-offs.' },
  { id: 'MARKET', label: 'Market', icon: WalletCards, note: 'Rules, shocks, community and opportunity.' },
];

export default function GameCardsPage() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => browserGameService.getSnapshot());
  const [family, setFamily] = useState<GameCardFamily | undefined>();
  const [card, setCard] = useState<GameScenario>(() => browserGameService.drawScenario());
  const [lastChoice, setLastChoice] = useState<string | null>(null);

  const familyMeta = useMemo(() => families.find(item => item.id === card.family), [card.family]);

  const draw = (nextFamily?: GameCardFamily) => {
    setFamily(nextFamily);
    setCard(browserGameService.drawScenario(nextFamily));
    setLastChoice(null);
  };

  const choose = (choiceId: string) => {
    setSnapshot(browserGameService.chooseScenario(card.id, card.version, choiceId));
    const choice = card.choices.find(item => item.id === choiceId);
    setLastChoice(choice?.consequence ?? 'Choice recorded.');
  };

  return <main className="min-h-screen bg-[#f6f4ed] px-4 py-6 sm:px-6">
    <GameNav />
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-[#302b20] p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">MW-14 · Card Engine</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">Trade and life arrive together.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">Cards teach through consequences, not static quizzes. The schema is versioned so new scenarios can be added without rewriting the Game.</p></header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {families.map(({ id, label, icon: Icon, note }) => <button key={id} type="button" onClick={() => draw(id)} className={`rounded-2xl border p-4 text-left shadow-sm ${family === id ? 'border-amber-700 bg-amber-50' : 'border-ink/8 bg-white'}`}><Icon size={20} className="text-amber-800" /><strong className="mt-3 block text-ink">{label} Cards</strong><span className="mt-1 block text-sm text-ink/50">{note}</span></button>)}
      </section>

      <section className="rounded-3xl border border-amber-700/15 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">{familyMeta?.label ?? card.family} CARD · v{card.version}</p><h2 className="mt-2 font-display text-3xl text-ink">{card.title}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-ink/60">{card.context}</p></div><button onClick={() => draw(family)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-4 text-sm font-semibold text-ink/60"><RefreshCw size={15} /> Draw another</button></div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">{card.choices.map(choice => <article key={choice.id} className="rounded-2xl border border-ink/8 bg-[#fbfcf9] p-5"><h3 className="font-display text-xl text-ink">{choice.label}</h3><p className="mt-2 text-sm leading-6 text-ink/55">{choice.consequence}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink/55 sm:grid-cols-3"><Impact label="Capital" value={choice.capitalDelta} /><Impact label="Trade" value={choice.tradeDelta} /><Impact label="Life" value={choice.lifeDelta} /><Impact label="Resilience" value={choice.resilienceDelta} /><Impact label="Resources" value={choice.resourcesDelta} /></div><button onClick={() => choose(choice.id)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-800 px-5 text-sm font-semibold text-white">Choose this path <ArrowRight size={15} /></button></article>)}</div>
        {lastChoice && <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-900"><strong>Consequence recorded:</strong> {lastChoice}</p>}
      </section>

      <section className="grid gap-3 sm:grid-cols-4"><Metric label="Capital" value={`KES ${snapshot.profile.capital.toLocaleString()}`} /><Metric label="Trade" value={`${snapshot.profile.health.trade}/100`} /><Metric label="Life" value={`${snapshot.profile.health.life}/100`} /><Metric label="Resilience" value={`${snapshot.profile.health.resilience}/100`} /></section>
      <p className="text-center text-xs text-ink/40">Scenario outcomes are Game rules, not predictions about real trade or life.</p>
    </div>
  </main>;
}

function Impact({ label, value }: { label: string; value: number }) { return <span className="rounded-lg bg-white px-2 py-1.5"><strong>{label}</strong> {value > 0 ? '+' : ''}{value}</span>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</span><strong className="mt-1 block text-lg text-ink">{value}</strong></div>; }
