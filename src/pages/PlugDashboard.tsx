import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Calculator, CheckCircle2, Copy, GraduationCap, Share2, Store } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { getMyReferralHistory } from '../api/r11TraderEndpoints';
import type { ReferralHistoryResponse } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';

type PlugView = 'overview' | 'people' | 'help';
function money(minor: number, currency = 'KES') { return new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(minor / 100); }
function date(value: string | null) { return value ? new Date(value).toLocaleDateString('en-KE') : null; }

export default function PlugDashboard() {
  const { user, session } = useAuth();
  const [view, setView] = useState<PlugView>('overview');
  const [history, setHistory] = useState<ReferralHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exampleIntroductions, setExampleIntroductions] = useState(10);
  const [exampleActiveTenMonths, setExampleActiveTenMonths] = useState(4);
  const [examplePlan, setExamplePlan] = useState<'FOR_YOU' | 'BUSINESS'>('FOR_YOU');

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true); setError(null);
    const result = await getMyReferralHistory(session.accessToken);
    if (!result.ok || !result.data) setError(result.error || 'Your Plug workspace could not load referral evidence.');
    else setHistory(result.data);
    setLoading(false);
  }, [session?.accessToken]);
  useEffect(() => { void load(); }, [load]);

  const recordedRewards = useMemo(() => {
    if (!history) return { count: 0, value: 'KES 0' };
    const rows = history.relationships.filter(item => item.rewardAmountMinor != null);
    const currencies = new Set(rows.map(item => item.rewardCurrency ?? 'KES'));
    const totalMinor = rows.reduce((sum, item) => sum + (item.rewardAmountMinor ?? 0), 0);
    return { count: rows.length, value: currencies.size <= 1 ? money(totalMinor, [...currencies][0] ?? 'KES') : 'Multiple currencies' };
  }, [history]);

  if (!user || !session) return <Navigate to="/signin" replace />;
  const copyCode = async () => { if (!history?.referralCode) return; try { await navigator.clipboard.writeText(history.referralCode); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } };
  const shareCode = async () => { if (!history?.referralCode) return; const text = `Join me in the SecurePay Market. My referral code is ${history.referralCode}.`; if (navigator.share) await navigator.share({ title: 'SecurePay referral', text }); else await navigator.clipboard.writeText(text); };
  const subscriptionMinor = examplePlan === 'BUSINESS' ? 20_000 : 10_000;
  const illustrationMinor = Math.max(0, Math.min(exampleIntroductions, exampleActiveTenMonths)) * subscriptionMinor;

  return <TraderShell>
    <TraderPageHeader eyebrow="Plug / Builder" title={<>Grow the <span className="text-green-700">Market</span></>} description="Introduce traders, help them learn, and see only relationships and rewards SecurePay can prove." />
    {loading && <TraderLoadingState label="Loading builder workspace…" />}
    {error && <TraderErrorState title="Builder workspace unavailable" detail={error} onRetry={() => void load()} />}

    {!loading && !error && history && <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Builder workspace">{(['overview','people','help'] as const).map(item => <button key={item} type="button" onClick={() => setView(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold capitalize ${view === item ? 'bg-green-700 text-white' : 'border border-green-700/10 bg-white text-ink/60'}`}>{item}</button>)}</div>

      {view === 'overview' && <>
        <section className="trader-home-situation"><div className="trader-home-situation-copy"><p className="trader-home-kicker">Your connection code</p><div className="mt-2 flex max-w-sm items-center gap-2 rounded-xl border border-green-700/10 bg-white p-2"><strong className="min-w-0 flex-1 truncate font-mono text-lg">{history.referralCode}</strong><button type="button" onClick={() => void copyCode()} className="flex size-9 items-center justify-center rounded-full text-green-700">{copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}</button><button type="button" onClick={() => void shareCode()} className="flex size-9 items-center justify-center rounded-full bg-green-700 text-white"><Share2 size={16} /></button></div></div><div className="trader-home-metrics"><div className="trader-home-metric is-active"><span>Introduced</span><strong>{history.totalReferred}</strong></div><div className="trader-home-metric"><span>Activated+</span><strong>{history.activatedOrLaterCount}</strong></div><div className="trader-home-metric"><span>Reward records</span><strong>{recordedRewards.count}</strong></div></div></section>
        <section className="trader-around-rail"><button type="button" onClick={() => setView('people')}><span>People</span><strong>Referral record</strong><ArrowRight size={14} /></button><Link to="/trainer/session"><span>Trainer</span><strong>Teach first</strong><GraduationCap size={14} /></Link><Link to="/store"><span>Store</span><strong>Help with offers</strong><Store size={14} /></Link><Link to="/referrals"><span>Referrals</span><strong>Full record</strong><ArrowRight size={14} /></Link></section>
        <details className="trader-progressive"><summary>Month-10 builder rule</summary><div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-5 text-ink/55"><strong>The 10th consecutive paid subscription month belongs to the originating Plug when the backend qualifies it.</strong> Qualified and paid remain separate states; this screen does not claim money received without backend evidence.</div></details>
      </>}

      {view === 'people' && <section className="market-section-shell"><div className="mb-2 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Referral provenance</p><h2 className="market-section-title">People linked to your code</h2></div><Link to="/referrals" className="text-xs font-semibold text-green-700">Full record</Link></div>{history.relationships.length === 0 ? <TraderEmptyState title="No referrals yet" detail="Share your code when you are ready." /> : <div className="space-y-2">{history.relationships.map(item => { const reward = item.rewardAmountMinor != null ? money(item.rewardAmountMinor, item.rewardCurrency ?? 'KES') : null; return <article key={item.relationshipId} className="market-row-living"><div className="min-w-0 flex-1"><p className="font-mono text-sm font-bold">{item.referredKsNumber}</p><p className="mt-1 text-xs text-ink/40">Introduced {date(item.createdAt)}{item.activatedAt ? ` · Activated ${date(item.activatedAt)}` : ''}</p></div><div className="shrink-0 text-right"><span className="text-xs font-bold text-green-800">{item.status}</span>{reward && <p className="mt-1 text-sm font-semibold">{reward}</p>}</div></article>; })}</div>}</section>}

      {view === 'help' && <div className="space-y-4"><section className="grid gap-3 sm:grid-cols-2"><Link to="/trainer/session" className="market-link-card"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Trainer</p><h2 className="mt-1 font-display text-2xl">Teach SecurePay</h2></div><span className="text-sm font-semibold text-green-700">Open Trainer →</span></Link><Link to="/store" className="market-link-card"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Store help</p><h2 className="mt-1 font-display text-2xl">Help a trader get visible</h2></div><span className="text-sm font-semibold text-green-700">My KS Store →</span></Link></section><details className="trader-progressive"><summary><Calculator size={14} /> Month-10 illustration</summary><div className="grid gap-3 sm:grid-cols-3"><NumberField label="Introductions" value={exampleIntroductions} onChange={setExampleIntroductions} max={1000} /><NumberField label="Reach 10 paid months" value={exampleActiveTenMonths} onChange={setExampleActiveTenMonths} max={exampleIntroductions} /><label className="rounded-xl bg-[#faf9f5] p-3 text-xs font-semibold">Plan<select value={examplePlan} onChange={event => setExamplePlan(event.target.value as 'FOR_YOU' | 'BUSINESS')} className="mt-2 min-h-10 w-full rounded-xl border border-ink/12 bg-white px-3 text-sm"><option value="FOR_YOU">For You · KES 100</option><option value="BUSINESS">Business · KES 200</option></select></label></div><div className="mt-3 rounded-xl bg-green-50 p-3"><strong className="font-display text-xl">{money(illustrationMinor)}</strong><p className="mt-1 text-xs text-green-950/55">Illustration only — not entitlement, forecast or wallet balance.</p></div></details></div>}
    </div>}
  </TraderShell>;
}

function NumberField({ label, value, onChange, max }: { label: string; value: number; onChange: (value: number) => void; max: number }) {
  return <label className="rounded-xl bg-[#faf9f5] p-3 text-xs font-semibold"><span>{label}</span><input type="number" min="0" max={Math.max(0, max)} value={value} onChange={event => onChange(Math.max(0, Number(event.target.value) || 0))} className="mt-2 min-h-10 w-full rounded-xl border border-ink/12 bg-white px-3 text-sm" /></label>;
}
