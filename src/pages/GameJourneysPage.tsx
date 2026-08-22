import { useMemo, useState } from 'react';
import { FileCheck2, Flag, MessageCircleQuestion, Plus, ShieldCheck } from 'lucide-react';
import GameNav from '../components/game/GameNav';
import { browserGameService } from '../game/gameService';
import type { GameAgreementKind, GameSnapshot } from '../game/gameTypes';

const kinds: Array<{ id: GameAgreementKind; label: string; note: string }> = [
  { id: 'SECURELINK', label: 'SecureLink', note: 'One → one simulated agreement.' },
  { id: 'GROUP_SECURELINK', label: 'Group SecureLink', note: 'Many → one simulated contribution.' },
  { id: 'SECUREFLOW', label: 'SecureFlow', note: 'One → many simulated distribution.' },
  { id: 'GROUP_SECUREFLOW', label: 'Group SecureFlow', note: 'Many → many simulated governed flow.' },
];

export default function GameJourneysPage() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => browserGameService.getSnapshot());
  const [kind, setKind] = useState<GameAgreementKind>('SECURELINK');
  const [title, setTitle] = useState('Deliver 20 bags of cement');
  const [amount, setAmount] = useState('20000');
  const [note, setNote] = useState<string | null>(null);

  const active = useMemo(() => snapshot.agreements[0], [snapshot]);
  const coins = snapshot.profile.cycle?.coinBalance ?? 0;

  const create = () => {
    setSnapshot(browserGameService.createAgreement(kind, title, Number(amount) || 0));
    setNote('Simulated agreement created. No real SecurePay state exists.');
  };

  const act = (fn: () => GameSnapshot, success: string) => {
    try { setSnapshot(fn()); setNote(success); } catch (error) { setNote(error instanceof Error ? error.message : 'Game action could not be completed.'); }
  };

  return <main className="min-h-screen bg-[#f6f4ed] px-4 py-6 sm:px-6">
    <GameNav />
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl bg-[#152f25] p-6 text-white shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">MW-15 · Simulated SecurePay Journeys</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">Practise the same mental model. Keep the maths in the Game.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">Game agreements rehearse obligations, evidence, confirmations and Recovery. They never create real agreements, Payment Ready, release or settlement authority.</p></header>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Create a Game agreement</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">{kinds.map(item => <button key={item.id} onClick={() => setKind(item.id)} className={`rounded-xl border p-3 text-left ${kind === item.id ? 'border-green-700 bg-green-50' : 'border-ink/10'}`}><strong className="text-sm text-ink">{item.label}</strong><span className="mt-1 block text-xs text-ink/45">{item.note}</span></button>)}</div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]"><input value={title} onChange={e => setTitle(e.target.value)} className="min-h-11 rounded-xl border border-ink/15 px-3 text-sm" placeholder="What are you agreeing to do?" /><input value={amount} onChange={e => setAmount(e.target.value)} type="number" className="min-h-11 rounded-xl border border-ink/15 px-3 text-sm" placeholder="Game amount" /><button onClick={create} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white"><Plus size={15} /> Create</button></div>
      </section>

      {active ? <section className="rounded-2xl border border-amber-700/15 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">{active.kind.replace(/_/g, ' ')} · {active.status}</p><h2 className="mt-1 font-display text-2xl text-ink">{active.title}</h2><p className="mt-1 text-sm text-ink/55">Game amount: KES {active.amount.toLocaleString()}</p></div><ShieldCheck size={24} className="text-amber-800" /></div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <button onClick={() => act(() => browserGameService.addAgreementEvidence(active.id, 'Delivery photo + location'), 'Evidence added to the Game agreement.')} className="rounded-xl border border-ink/10 p-3 text-left"><FileCheck2 size={18} className="text-green-700" /><strong className="mt-2 block text-sm">Add evidence</strong><span className="mt-1 block text-xs text-ink/45">Evidence supports understanding; it does not itself declare completion.</span></button>
          <button onClick={() => act(() => browserGameService.confirmAgreement(active.id, 'Counterparty confirmation'), 'Game confirmation recorded.')} className="rounded-xl border border-ink/10 p-3 text-left"><ShieldCheck size={18} className="text-green-700" /><strong className="mt-2 block text-sm">Confirm</strong><span className="mt-1 block text-xs text-ink/45">A Game confirmation changes only this simulated agreement.</span></button>
          <button onClick={() => act(() => browserGameService.openGameRecovery(active.id), 'Game Recovery opened and 1 Cycle Coin spent.')} className="rounded-xl border border-ink/10 p-3 text-left"><MessageCircleQuestion size={18} className="text-amber-800" /><strong className="mt-2 block text-sm">Open Game Recovery</strong><span className="mt-1 block text-xs text-ink/45">Costs 1 Cycle Coin. Current balance: {coins}.</span></button>
          <button onClick={() => act(() => browserGameService.resolveAgreement(active.id), 'Game agreement marked resolved by the simulation.')} className="rounded-xl border border-ink/10 p-3 text-left"><Flag size={18} className="text-green-700" /><strong className="mt-2 block text-sm">Resolve in Game</strong><span className="mt-1 block text-xs text-ink/45">This is not a real release or settlement.</span></button>
        </div>
        {active.status === 'RECOVERY' && <div className="mt-4 rounded-xl bg-amber-50 p-4"><strong className="text-sm text-amber-950">Game Recovery Room</strong><p className="mt-1 text-sm text-amber-950/70">A simulated Master may give an advisory opinion. The Game Master cannot adjudicate or create Real Market authority.</p><button onClick={() => act(() => browserGameService.addGameMasterOpinion(active.id, 'Clarify delivery evidence, then let both players decide whether to adopt the recommendation.'), 'Game Master Opinion recorded.')} className="mt-3 rounded-full border border-amber-700/20 px-4 py-2 text-sm font-semibold text-amber-900">Add Game Master Opinion</button>{active.masterOpinion && <p className="mt-3 rounded-lg bg-white p-3 text-sm text-ink/60"><strong>Opinion:</strong> {active.masterOpinion}</p>}</div>}
        {note && <p className="mt-4 rounded-xl bg-[#f7f8f4] p-3 text-sm text-ink/60">{note}</p>}
      </section> : <p className="rounded-xl bg-white p-4 text-sm text-ink/50">Create a Game agreement to practise the journey.</p>}

      <section className="rounded-2xl border border-ink/8 bg-white p-5 text-sm text-ink/55 shadow-sm"><strong className="text-ink">Market mathematics rule:</strong> every simulated amount, coin spend, confirmation and recovery state is kept inside the isolated Game service. No call to SecurePayAPI is made from this Game domain.</section>
    </div>
  </main>;
}
