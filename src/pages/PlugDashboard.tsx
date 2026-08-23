import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Clock3,
  Copy,
  GraduationCap,
  Share2,
  ShoppingBag,
  Store,
} from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { getMyReferralHistory } from '../api/r11TraderEndpoints';
import type { ReferralHistoryResponse } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';

function money(minor: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

function date(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-KE') : null;
}

export default function PlugDashboard() {
  const { user, session } = useAuth();
  const [history, setHistory] = useState<ReferralHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exampleIntroductions, setExampleIntroductions] = useState(10);
  const [exampleActiveTenMonths, setExampleActiveTenMonths] = useState(4);
  const [examplePlan, setExamplePlan] = useState<'FOR_YOU' | 'BUSINESS'>('FOR_YOU');

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    const result = await getMyReferralHistory(session.accessToken);
    if (!result.ok || !result.data) {
      setError(result.error || 'Your Plug workspace could not load referral evidence.');
    } else {
      setHistory(result.data);
    }
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);

  const recordedRewards = useMemo(() => {
    if (!history) return { count: 0, value: 'KES 0' };
    const rows = history.relationships.filter(item => item.rewardAmountMinor != null);
    const currencies = new Set(rows.map(item => item.rewardCurrency ?? 'KES'));
    const totalMinor = rows.reduce((sum, item) => sum + (item.rewardAmountMinor ?? 0), 0);
    return {
      count: rows.length,
      value: currencies.size <= 1 ? money(totalMinor, [...currencies][0] ?? 'KES') : 'Multiple currencies',
    };
  }, [history]);

  if (!user || !session) return <Navigate to="/signin" replace />;

  const copyCode = async () => {
    if (!history?.referralCode) return;
    try {
      await navigator.clipboard.writeText(history.referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const shareCode = async () => {
    if (!history?.referralCode) return;
    const text = `Join me in the SecurePay Market. My referral code is ${history.referralCode}.`;
    if (navigator.share) await navigator.share({ title: 'SecurePay referral', text });
    else await navigator.clipboard.writeText(text);
  };

  const subscriptionMinor = examplePlan === 'BUSINESS' ? 20_000 : 10_000;
  const cappedTenMonthCount = Math.max(0, Math.min(exampleIntroductions, exampleActiveTenMonths));
  const illustrationMinor = cappedTenMonthCount * subscriptionMinor;

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Connect people to the Market"
      title="Plug / Builder workspace"
      description="Help traders learn SecurePay, build their own Store and enter the Market. Proven relationships and rewards come from SecurePayAPI; the browser never manufactures an entitlement."
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Plug workspace unavailable" detail={error} onRetry={() => void load()} />}

    {!loading && !error && history && <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-green-200 bg-green-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <LivingSecurePayMark state="guiding" size="sm" presence="present" decorative />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Your connection code</p>
              <h2 className="font-display text-2xl">Bring someone into the Market.</h2>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-3">
            <span className="min-w-0 flex-1 truncate font-mono text-xl font-bold">{history.referralCode}</span>
            <button type="button" onClick={() => void copyCode()} className="flex size-11 shrink-0 items-center justify-center rounded-full text-green-700" aria-label="Copy referral code">
              {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
            </button>
          </div>
          <button type="button" onClick={() => void shareCode()} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-700 px-4 text-sm font-semibold text-white">
            <Share2 size={16} /> Share your code
          </button>
          <p className="mt-3 text-xs leading-5 text-green-950/60">The first valid referral relationship fixes provenance. It creates no guaranteed income, territory, downline or ownership of the referred trader.</p>
        </div>

        <div className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">What SecurePay can prove today</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Introduced" value={history.totalReferred.toString()} />
            <Fact label="Activated+" value={history.activatedOrLaterCount.toString()} />
            <Fact label="Reward records" value={recordedRewards.count.toString()} />
            <Fact label="Recorded rewards" value={recordedRewards.value} />
          </div>
          <p className="mt-4 text-xs leading-5 text-ink/50">These reward figures come only from backend-qualified referral records and settlement evidence. They are not a wallet balance or a forecast.</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-orange-200 bg-orange-50 p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <Clock3 size={22} className="mt-0.5 shrink-0 text-orange-700" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">Locked commercial rule · backend-qualified</p>
            <h2 className="mt-1 font-display text-2xl">The 10th consecutive paid month belongs to the originating Plug.</h2>
            <p className="mt-2 text-sm leading-6 text-ink/60">When a referred KSNumber completes ten consecutive successfully paid active subscription months, the SecurePay subscription fee actually collected for month 10 becomes a one-time Plug / Builder retention entitlement. A missed qualifying month breaks that streak, and the same relationship cannot earn the same month-10 entitlement twice.</p>
            <p className="mt-3 text-sm leading-6 text-ink/60">SecurePayAPI can now prove the consecutive paid-cycle qualification and create the one-time entitlement. YUI still keeps <strong>qualified</strong> separate from <strong>paid</strong>: the participant-facing progress projection and actual reward posting are separate boundaries, so this screen must not claim cash has been received until the backend exposes and proves that state.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Referral provenance</p>
            <h2 className="mt-1 font-display text-2xl">People SecurePay can trace back to your code</h2>
          </div>
          <Link to="/referrals" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">Full referral record <ArrowRight size={15} /></Link>
        </div>
        {history.relationships.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-[#faf9f5] p-5 text-sm text-ink/52">No referral relationships have been recorded yet.</p>
        ) : (
          <div className="mt-5 grid gap-3">
            {history.relationships.map(item => {
              const reward = item.rewardAmountMinor != null ? money(item.rewardAmountMinor, item.rewardCurrency ?? 'KES') : null;
              return <article key={item.relationshipId} className="rounded-2xl border border-ink/8 bg-[#faf9f5] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold">{item.referredKsNumber}</p>
                    <p className="mt-1 text-xs text-ink/45">Introduced {date(item.createdAt)}{item.activatedAt ? ` · Activated ${date(item.activatedAt)}` : ''}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-800">{item.status}</span>
                    {reward && <p className="mt-2 text-sm font-semibold">Backend reward {reward}</p>}
                  </div>
                </div>
                {item.settlementEvidenceReference && <p className="mt-2 break-all font-mono text-[10px] text-ink/40">Settlement evidence {item.settlementEvidenceReference}</p>}
              </article>;
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#173b20]/10 bg-[#173b20] p-5 text-white sm:p-6">
          <div className="flex items-center gap-2 text-[#d7f0c8]"><GraduationCap size={19} /><strong>Trainer shortcuts</strong></div>
          <h2 className="mt-2 font-display text-2xl">Teach before you tell someone to transact.</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Use Trainer to explain the journey. Nothing learned or simulated there can create real identity, agreement or money truth.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <ToolLink to="/trainer/session" label="Guided Plug session" />
            <ToolLink to="/trainer/store" label="Store demonstration" />
            <ToolLink to="/trainer/create" label="Agreement demonstration" />
            <ToolLink to="/trainer/recovery" label="Resolution demonstration" />
          </div>
        </div>

        <div className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-green-700"><ShoppingBag size={19} /><strong>Store-help workflow</strong></div>
          <h2 className="mt-2 font-display text-2xl">Help a trader build their own Market address.</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-ink/58">
            <li><strong className="text-ink/75">1.</strong> Demonstrate the Store in Trainer.</li>
            <li><strong className="text-ink/75">2.</strong> The trader signs into their own KSNumber; the Plug does not impersonate them.</li>
            <li><strong className="text-ink/75">3.</strong> Add truthful products, services and availability in My KS Store.</li>
            <li><strong className="text-ink/75">4.</strong> Publish only what is actually on display.</li>
            <li><strong className="text-ink/75">5.</strong> Share the exact offer link or QR.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/store" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-800"><Store size={15} /> My KS Store</Link>
            <Link to="/store/share" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold"><Share2 size={15} /> Store sharing</Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <Calculator size={21} className="mt-0.5 shrink-0 text-green-700" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Trainer maths · illustration only</p>
            <h2 className="mt-1 font-display text-2xl">See how the month-10 rule works without calling it money owed.</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <NumberField label="Introductions" value={exampleIntroductions} onChange={setExampleIntroductions} max={1000} />
          <NumberField label="Example traders reaching 10 paid months" value={exampleActiveTenMonths} onChange={setExampleActiveTenMonths} max={exampleIntroductions} />
          <label className="rounded-2xl bg-[#faf9f5] p-3 text-xs font-semibold text-ink/55">
            <span>Example plan</span>
            <select value={examplePlan} onChange={event => setExamplePlan(event.target.value as 'FOR_YOU' | 'BUSINESS')} className="mt-2 min-h-11 w-full rounded-xl border border-ink/12 bg-white px-3 text-sm font-semibold text-ink">
              <option value="FOR_YOU">For You · KES 100/month</option>
              <option value="BUSINESS">Business · KES 200/month</option>
            </select>
          </label>
        </div>
        <div className="mt-4 rounded-2xl bg-green-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-green-700">Illustrative arithmetic</p>
          <p className="mt-1 font-display text-2xl">{money(illustrationMinor)}</p>
          <p className="mt-2 text-xs leading-5 text-green-950/60">This multiplies your example count by the current commercial plan price only. It is not an entitlement, forecast, wallet balance or backend reward record.</p>
        </div>
      </section>

      <section className="rounded-[24px] border border-green-200 bg-green-50 p-5 text-sm leading-6 text-green-950">
        <div className="flex gap-3"><BookOpenCheck size={19} className="mt-0.5 shrink-0" /><div><strong>A Plug connects; SecurePay proves.</strong><p className="mt-1 text-green-900/65">Referral provenance never makes the Plug party to another trader's agreement. Actual rewards require the exact backend event named by the commercial rule.</p></div></div>
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

function NumberField({ label, value, onChange, max }: { label: string; value: number; onChange: (value: number) => void; max: number }) {
  return <label className="rounded-2xl bg-[#faf9f5] p-3 text-xs font-semibold text-ink/55"><span>{label}</span><input type="number" min={0} max={Math.max(0, max)} value={value} onChange={event => onChange(Math.max(0, Math.min(Math.max(0, max), Number(event.target.value) || 0)))} className="mt-2 min-h-11 w-full rounded-xl border border-ink/12 bg-white px-3 text-sm font-semibold text-ink" /></label>;
}
