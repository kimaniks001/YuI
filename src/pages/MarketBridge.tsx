import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { captureDraftIntent, discardDraftIntent, promoteDraftIntent } from '../api/bridgeEndpoints';
import type { BridgeSourceWorld, DraftIntent } from '../api/bridgeTypes';
import TraderShell from '../components/trader/TraderShell';
import { useAuth } from '../lib/auth';
import { formatMinorMoney, parseMajorMoneyToMinor } from '../lib/formatMinorMoney';
import { clearMarketDraftIntent, marketSignInHref, readMarketDraftIntent } from '../lib/worldMode';

const AGREEMENT_TYPES = ['SECURELINK', 'GROUP_SECURELINK', 'SECUREFLOW', 'GROUP_SECUREFLOW'] as const;

/** MW-19: local simulation context stops at this screen; authenticated API DraftIntent is the first real record. */
export default function MarketBridge() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const local = useMemo(() => readMarketDraftIntent(), []);
  const [sourceWorld, setSourceWorld] = useState<BridgeSourceWorld>(local?.sourceWorld === 'game' ? 'GAME' : 'TRAINER');
  const [agreementType, setAgreementType] = useState<string>('SECURELINK');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [draft, setDraft] = useState<DraftIntent | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!title && local) setTitle(local.sourceWorld === 'game' ? 'Continue a Game idea in the Real Market' : 'Continue a Trainer idea in the Real Market');
  }, [local, title]);

  async function capture(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !title.trim()) return;
    const suggestedAmountMinor = amount.trim() ? parseMajorMoneyToMinor('KES', amount) : undefined;
    if (amount.trim() && suggestedAmountMinor === null) { setMessage('Enter a valid KES amount, or leave it blank.'); return; }
    setBusy(true); setMessage(null);
    const result = await captureDraftIntent(session.accessToken, {
      sourceWorld,
      agreementType,
      title: title.trim(),
      purpose: purpose.trim() || undefined,
      description: description.trim() || undefined,
      suggestedAmountMinor: suggestedAmountMinor ?? undefined,
    });
    setBusy(false);
    if (!result.ok || !result.data) { setMessage(result.error || 'The Real Market draft could not be captured.'); return; }
    setDraft(result.data); clearMarketDraftIntent();
  }

  async function promote() {
    if (!session?.accessToken || !draft) return;
    setBusy(true); setMessage(null);
    const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `market-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const result = await promoteDraftIntent(session.accessToken, draft.id, { idempotencyKey });
    setBusy(false);
    if (!result.ok || !result.data) { setMessage(result.error || 'This draft could not be promoted into a real agreement.'); return; }
    navigate(`/agreements/${result.data.id}`);
  }

  async function discard() {
    if (!session?.accessToken || !draft) return;
    setBusy(true); setMessage(null);
    const result = await discardDraftIntent(session.accessToken, draft.id); setBusy(false);
    if (!result.ok) setMessage(result.error || 'The draft could not be discarded.'); else setDraft(result.data || null);
  }

  const backTo = local?.sourceWorld === 'game' ? '/game' : '/trainer';
  const backLabel = local?.sourceWorld === 'game' ? 'Game' : 'Trainer';

  return <TraderShell><div className="mx-auto max-w-3xl space-y-5 py-4 sm:py-8">
    <Link to={backTo} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Back to {backLabel}</Link>
    <section className="rounded-3xl border border-green-700/12 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2 text-green-700"><ShieldCheck size={19} /><span className="text-xs font-bold uppercase tracking-[0.18em]">Real Market boundary</span></div>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Do this for real — after you review it.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">Trainer and Game can inspire a draft. They cannot carry Game Coins, rankings, simulated payer, Payment Ready, release, settlement or Master authority into the Market. Real authority starts again from authenticated SecurePayAPI truth.</p>
    </section>

    {!user || !session ? <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Authentication required</p><h2 className="mt-2 font-display text-2xl">Enter the Market as your real KS identity.</h2><p className="mt-2 text-sm leading-6 text-ink/60">Nothing from the simulation has created a real agreement. Sign in, then review the plain draft intent yourself.</p><Link to={marketSignInHref('/market/continue')} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Sign in to continue <ArrowRight size={15} /></Link>
    </section> : !draft ? <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Safe draft intent</p><p className="mt-2 text-sm text-ink/55">Review these fields. YUI does not infer counterparties, payer, funding, conditions or financial authority from the simulation.</p>
      <form onSubmit={capture} className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-ink/55">Came from<select value={sourceWorld} onChange={event => setSourceWorld(event.target.value as BridgeSourceWorld)} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm"><option value="TRAINER">Trainer</option><option value="GAME">Game</option></select></label><label className="text-xs font-semibold text-ink/55">Real agreement shape<select value={agreementType} onChange={event => setAgreementType(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm">{AGREEMENT_TYPES.map(type => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}</select></label></div>
        <label className="block text-xs font-semibold text-ink/55">Title<input value={title} onChange={event => setTitle(event.target.value)} required className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm" placeholder="What do you want to do for real?" /></label>
        <label className="block text-xs font-semibold text-ink/55">Purpose<input value={purpose} onChange={event => setPurpose(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm" /></label>
        <label className="block text-xs font-semibold text-ink/55">Description<textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-ink/15 p-3 text-sm" placeholder="Plain context only — no simulated authority crosses." /></label>
        <label className="block text-xs font-semibold text-ink/55">Suggested amount in KES · optional<input value={amount} onChange={event => setAmount(event.target.value)} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm" placeholder="e.g. 2500" /><span className="mt-1 block font-normal text-ink/40">A suggestion is not funding, Payment Ready or settlement.</span></label>
        <button disabled={busy} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">Capture Real Market draft</button>
      </form>
    </section> : <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Backend draft · {draft.status}</p><h2 className="mt-2 font-display text-2xl">{draft.title}</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><Fact label="Source" value={draft.sourceWorld} /><Fact label="Agreement shape" value={draft.agreementType} /><Fact label="Purpose" value={draft.purpose || 'Not stated'} /><Fact label="Suggested amount" value={draft.suggestedAmountMinor == null ? 'Not stated' : formatMinorMoney('KES', draft.suggestedAmountMinor) || 'Amount unavailable'} /></dl>
      <p className="mt-4 text-xs leading-5 text-ink/50">Promotion enters the ordinary SecurePay agreement-creation authority. Real payer, participants, funding, Payment Ready, release and settlement are established there — never by Game or Trainer.</p>
      {draft.status === 'DRAFT' && <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} onClick={() => void promote()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Create real agreement <ArrowRight size={15} className="ml-1 inline" /></button><button disabled={busy} onClick={() => void discard()} className="min-h-11 rounded-full border border-ink/15 bg-white px-5 text-sm font-semibold">Discard draft</button></div>}
      {draft.status === 'DISCARDED' && <p className="mt-4 text-sm font-semibold text-ink/55">This draft was discarded. It created no real agreement.</p>}
    </section>}
    {message && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    <Link to="/market/safety" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">Review three-world safety <ArrowRight size={14} /></Link>
  </div></TraderShell>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white p-3"><dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">{label}</dt><dd className="mt-1 font-semibold text-ink/75">{value}</dd></div>;
}
