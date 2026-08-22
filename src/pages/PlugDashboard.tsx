import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight, BookOpenCheck, Calculator, CheckCircle2, Clock3, Copy,
  GraduationCap, Network, Share2, ShoppingBag, Store, Users,
} from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { getMyReferralHistory } from '../api/r11TraderEndpoints';
import type { ReferralHistoryResponse, ReferralRelationshipResponse } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';

function money(minor: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(minor / 100);
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-KE') : null;
}

function addMonths(value: string, months: number) {
  const result = new Date(value);
  result.setMonth(result.getMonth() + months);
  return result;
}

function daysBetween(from: Date, to: Date) {
  return Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
}

function retentionObservation(item: ReferralRelationshipResponse) {
  if (!item.activatedAt) return { label: 'Activation not recorded', note: 'The backend has not recorded activation for this relationship yet.' };
  const milestone = addMonths(item.activatedAt, 10);
  const remaining = daysBetween(new Date(), milestone);
  if (remaining > 0) return {
    label: `10-month mark in ${remaining} day${remaining === 1 ? '' : 's'}`,
    note: `Observation date ${milestone.toLocaleDateString('en-KE')}. This is a timeline marker only, not a promised reward.`,
  };
  return {
    label: '10-month mark reached',
    note: `Reached ${milestone.toLocaleDateString('en-KE')}. The current referral API exposes no separate retention-reward entitlement, so none is claimed here.`,
  };
}

export default function PlugDashboard() {
  const { user, session } = useAuth();
  const [history, setHistory] = useState<ReferralHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [introductions, setIntroductions] = useState(10);
  const [activationRate, setActivationRate] = useState(50);
  const [qualificationRate, setQualificationRate] = useState(20);
  const [exampleReward, setExampleReward] = useState(100);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true); setError(null);
    const result = await getMyReferralHistory(session.accessToken);
    if (!result.ok || !result.data) setError(result.error || 'Your Plug workspace could not load referral evidence.');
    else setHistory(result.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);
  if (!user || !session) return <Navigate to="/signin" replace />;

  const qualified = history?.relationships.filter(item => item.status === 'QUALIFIED') ?? [];
  const recordedRewardMinor = qualified.reduce((sum, item) => sum + (item.rewardAmountMinor ?? 0), 0);
  const recordedRewardCurrencies = new Set(qualified.filter(item => item.rewardAmountMinor != null).map(item => item.rewardCurrency ?? 'KES'));
  const recordedReward = recordedRewardCurrencies.size <= 1 ? money(recordedRewardMinor, [...recordedRewardCurrencies][0] ?? 'KES') : 'Multiple currencies';

  const scenario = useMemo(() => {
    const activated = introductions * Math.max(0, Math.min(100, activationRate)) / 100;
    const qualifiedCount = activated * Math.max(0, Math.min(100, qualificationRate)) / 100;
    return {
      activated,
      qualified: qualifiedCount,
      amount: qualifiedCount * Math.max(0, exampleReward),
    };
  }, [activationRate, exampleReward, introductions, qualificationRate]);

  const copyCode = async () => {
    if (!history?.referralCode) return;
    try {
      await navigator.clipboard.writeText(history.referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  };

  const shareCode = async () => {
    if (!history?.referralCode) return;
    const text = `Join me in the SecurePay Market. My referral code is ${history.referralCode}.`;
    if (navigator.share) await navigator.share({ title: 'SecurePay referral', text });
    else await navigator.clipboard.writeText(text);
  };

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Connect people to the Market"
      title="Plug / Builder workspace"
      description="Help traders understand SecurePay, set up their own Store and enter the Market. Referral relationships and rewards are shown only when SecurePay has backend evidence for them."
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Plug workspace unavailable" detail={error} onRetry={() => void load()} />}

    {!loading && !error && history && <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-green-200 bg-green-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><LivingSecurePayMark state="guiding" size="sm" presence="present" decorative /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Your connection code</p><h2 className="font-display text-2xl">Bring someone into the Market.</h2></div></div>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-3"><span className="min-w-0 flex-1 truncate font-mono text-xl font-bold">{history.referralCode}</span><button type="button" onClick={() => void copyCode()} className="flex size-11 shrink-0 items-center justify-center rounded-full text-green-700" aria-label="Copy referral code">{copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}</button></div>
          <button type="button" onClick={() => void shareCode()} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-700 px-4 text-sm font-semibold text-white"><Share2 size={16} /> Share your code</button>
          <p className="mt-3 text-xs leading-5 text-green-950/60">A code records provenance. It does not guarantee activation, qualification or income. SecurePay rejects self-referral and conflicting referrer relationships at the backend.</p>
        </div>

        <div className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">What SecurePay can prove</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Introduced" value={history.totalReferred.toString()} />
            <Fact label="Activated+" value={history.activatedOrLaterCount.toString()} />
            <Fact label="Qualified" value={qualified.length.toString()} />
            <Fact label="Recorded rewards" value={recordedReward} />
          </div>
          <p className="mt-4 text-xs leading-5 text-ink/50">Recorded rewards are summed only from backend-qualified relationships. This workspace does not estimate pending rewards and does not manufacture a balance.</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Referral provenance</p><h2 className="mt-1 font-display text-2xl">People SecurePay can trace back to your code</h2></div><Link to="/referrals" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">Full referral record <ArrowRight size={15} /></Link></div>
        {history.relationships.length === 0 ? <p className="mt-5 rounded-2xl bg-[#faf9f5] p-5 text-sm text-ink/52">No referral relationships have been recorded yet.</p> : <div className="mt-5 grid gap-3">{history.relationships.map(item => {
          const observation = retentionObservation(item);
          const reward = item.rewardAmountMinor != null ? money(item.rewardAmountMinor, item.rewardCurrency ?? 'KES') : null;
          return <article key={item.relationshipId} className="rounded-2xl border border-ink/8 bg-[#faf9f5] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-sm font-bold">{item.referredKsNumber}</p><p className="mt-1 text-xs text-ink/45">Introduced {date(item.createdAt)}{item.activatedAt ? ` · Activated ${date(item.activatedAt)}` : ''}</p></div><div className="sm:text-right"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-800">{item.status}</span>{reward && <p className="mt-2 text-sm font-semibold">Backend reward {reward}</p>}</div></div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-white p-3 text-xs leading-5 text-ink/55"><Clock3 size={15} className="mt-0.5 shrink-0 text-orange-600" /><span><strong>{observation.label}.</strong> {observation.note}</span></div>
            {item.settlementEvidenceReference && <p className="mt-2 break-all font-mono text-[10px] text-ink/40">Settlement evidence {item.settlementEvidenceReference}</p>}
          </article>;
        })}</div>}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#173b20]/10 bg-[#173b20] p-5 text-white sm:p-6">
          <div className="flex items-center gap-2 text-[#d7f0c8]"><GraduationCap size={19} /><strong>Trainer shortcuts</strong></div>
          <h2 className="mt-2 font-display text-2xl">Teach before you tell someone to transact.</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Use the simulated world to explain the journey. Nothing in Trainer can create real identity, agreement or money truth.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2"><ToolLink to="/trainer/session" label="Guided Plug session" /><ToolLink to="/trainer/store" label="Store demonstration" /><ToolLink to="/trainer/create" label="Agreement demonstration" /><ToolLink to="/trainer/recovery" label="Resolution demonstration" /></div>
        </div>

        <div className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-green-700"><ShoppingBag size={19} /><strong>Store-help workflow</strong></div>
          <h2 className="mt-2 font-display text-2xl">Help a trader build their own Market address.</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-ink/58">
            <li><strong className="text-ink/75">1.</strong> Show the Store in Trainer first.</li>
            <li><strong className="text-ink/75">2.</strong> The trader signs into their own KSNumber. A Plug does not impersonate or edit another trader's Store.</li>
            <li><strong className="text-ink/75">3.</strong> Open <strong>My KS Store</strong> and add truthful products/services and availability.</li>
            <li><strong className="text-ink/75">4.</strong> Publish only what is actually on display.</li>
            <li><strong className="text-ink/75">5.</strong> Share the exact offer link or QR.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-2"><Link to="/store" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-800"><Store size={15} /> My KS Store</Link><Link to="/store/share" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold"><Share2 size={15} /> Store sharing</Link></div>
        </div>
      </section>

      <section className="rounded-[28px] border border-orange-200 bg-orange-50 p-5 sm:p-7">
        <div className="flex items-start gap-3"><Calculator size={21} className="mt-0.5 shrink-0 text-orange-700" /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">Illustrative scenario · not a forecast</p><h2 className="mt-1 font-display text-2xl">Explore the maths without pretending it is money owed.</h2><p className="mt-2 text-sm leading-6 text-ink/58">Enter hypothetical assumptions below. This calculator does not use backend entitlement rules, does not predict conversions and does not create a reward balance.</p></div></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label="Introductions" value={introductions} onChange={setIntroductions} min={0} max={10000} suffix="people" />
          <NumberField label="Hypothetical activation" value={activationRate} onChange={setActivationRate} min={0} max={100} suffix="%" />
          <NumberField label="Hypothetical qualification" value={qualificationRate} onChange={setQualificationRate} min={0} max={100} suffix="% of activated" />
          <NumberField label="Example reward" value={exampleReward} onChange={setExampleReward} min={0} max={1000000} suffix="KES" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><ScenarioFact label="Illustrative activated" value={scenario.activated.toFixed(1)} /><ScenarioFact label="Illustrative qualified" value={scenario.qualified.toFixed(1)} /><ScenarioFact label="Arithmetic result" value={`KES ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(scenario.amount)}`} /></div>
        <p className="mt-4 text-xs leading-5 text-orange-950/60">This is simple multiplication of values you entered. Actual qualification and reward amounts exist only when SecurePay records them from backend commercial rules and settlement evidence.</p>
      </section>

      <section className="rounded-[24px] border border-green-200 bg-green-50 p-5 text-sm leading-6 text-green-950">
        <div className="flex gap-3"><BookOpenCheck size={19} className="mt-0.5 shrink-0" /><div><strong>A Plug connects; the system decides what is provable.</strong><p className="mt-1 text-green-900/65">Referrals are provenance, not hierarchy. Community context does not control money, and a connection never makes the Plug party to the trader's agreement.</p></div></div>
      </section>
    </div>}
  </TraderShell>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[#faf9f5] p-3"><span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/38">{label}</span><strong className="mt-1 block text-xl tabular-nums">{value}</strong></div>;
}

function ToolLink({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="inline-flex min-h-11 items-center justify-between gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 text-sm font-semibold text-white hover:bg-white/12"><span>{label}</span><ArrowRight size={14} /></Link>;
}

function NumberField({ label, value, onChange, min, max, suffix }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; suffix: string }) {
  return <label className="rounded-2xl bg-white p-3 text-xs font-semibold text-ink/55"><span>{label}</span><div className="mt-2 flex items-center gap-2"><input type="number" min={min} max={max} value={value} onChange={event => onChange(Math.max(min, Math.min(max, Number(event.target.value) || 0)))} className="min-h-11 min-w-0 flex-1 rounded-xl border border-ink/12 px-3 text-sm font-semibold text-ink" /><span className="shrink-0 text-[10px] text-ink/38">{suffix}</span></div></label>;
}

function ScenarioFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white p-4"><span className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-700">{label}</span><strong className="mt-1 block text-xl tabular-nums">{value}</strong></div>;
}
