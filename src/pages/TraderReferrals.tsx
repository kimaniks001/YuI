import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircleUserRound, Copy, Share2 } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { getMyReferralHistory, redeemReferralCode } from '../api/r11TraderEndpoints';
import type { ReferralHistoryResponse, ReferralRelationshipResponse } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

function money(minor: number | null, currency: string | null) {
  if (minor == null || !currency) return null;
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(minor / 100);
}

function dateTime(value: string | null) {
  return value ? new Date(value).toLocaleString('en-KE') : null;
}

export default function TraderReferrals() {
  const { user, session } = useAuth();
  const [history, setHistory] = useState<ReferralHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    const result = await getMyReferralHistory(session.accessToken);
    if (!result.ok || !result.data) {
      setError(result.error || 'Your referral history could not be loaded.');
      setLoading(false);
      return;
    }
    setHistory(result.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;

  const copyCode = async () => {
    if (history?.referralCode) await navigator.clipboard.writeText(history.referralCode);
  };

  const shareCode = async () => {
    if (!history?.referralCode) return;
    const text = `Join me on SecurePay. Use referral code ${history.referralCode}.`;
    if (navigator.share) await navigator.share({ title: 'SecurePay referral', text });
    else await navigator.clipboard.writeText(text);
  };

  const submitRedeem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    setRedeemMessage(null);
    const result = await redeemReferralCode(session.accessToken, redeemCode);
    setRedeeming(false);
    if (!result.ok) {
      setRedeemMessage(result.error || 'That referral code could not be applied.');
      return;
    }
    setRedeemCode('');
    setRedeemMessage('Referral code applied. Qualification and reward will appear only when SecurePay has authoritative backend evidence.');
    await load();
  };

  return <TraderShell>
    <TraderPageHeader
      eyebrow="People you introduced"
      title="Referrals"
      description="Share your code and see referral relationships SecurePay can prove. Rewards are shown only when the backend has recorded qualifying settlement evidence."
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Your referrals could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && history && <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-green-700/10 bg-green-50/60 p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Your referral code</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-700/10 bg-white p-3">
            <span className="min-w-0 flex-1 truncate font-mono text-lg font-bold">{history.referralCode}</span>
            <button type="button" aria-label="Copy referral code" onClick={() => void copyCode()} className="flex size-11 items-center justify-center rounded-full text-green-700"><Copy size={17} /></button>
          </div>
          <button type="button" onClick={() => void shareCode()} className="sp-btn-primary mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm"><Share2 size={16} /> Share your code</button>
          <p className="mt-3 text-xs text-ink/50">SecurePay does not show estimated or pending earnings. A reward appears here only after backend qualification.</p>
        </div>

        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Referral summary</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Fact label="Total referred" value={history.totalReferred.toString()} />
            <Fact label="Activated or qualified" value={history.activatedOrLaterCount.toString()} />
          </div>
          <p className="mt-4 text-sm text-ink/55">Status, qualification time, reward and settlement evidence come directly from SecurePay's referral history. This page does not calculate any financial result.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Referral history</p><h2 className="mt-1 font-display text-2xl">Recorded relationships</h2></div>
        {history.relationships.length === 0 ? <p className="mt-5 rounded-xl bg-ink/[0.025] p-4 text-sm text-ink/55">No referral relationships have been recorded yet.</p> : <ul className="mt-5 divide-y divide-ink/8">
          {history.relationships.map(item => <ReferralRow key={item.relationshipId} item={item} />)}
        </ul>}
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Were you referred?</p>
        <h2 className="mt-1 font-display text-xl">Apply a referral code</h2>
        <form onSubmit={submitRedeem} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="referral-code">Referral code</label>
          <input id="referral-code" value={redeemCode} onChange={e => setRedeemCode(e.target.value)} placeholder="Enter referral code" className="min-h-11 flex-1 rounded-xl border border-ink/15 bg-white px-4 text-sm outline-none focus:border-green-600" />
          <button type="submit" disabled={redeeming || !redeemCode.trim()} className="sp-btn-primary min-h-11 px-5 text-sm disabled:opacity-50">{redeeming ? 'Applying…' : 'Apply code'}</button>
        </form>
        {redeemMessage && <p className="mt-3 text-sm text-ink/60">{redeemMessage}</p>}
      </section>
    </div>}
  </TraderShell>;
}

function ReferralRow({ item }: { item: ReferralRelationshipResponse }) {
  const reward = money(item.rewardAmountMinor, item.rewardCurrency);
  const qualified = dateTime(item.qualifiedAt);
  return <li className="py-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <CircleUserRound className="mt-0.5 text-green-700" size={19} />
        <div>
          <p className="font-mono text-sm font-semibold">{item.referredKsNumber}</p>
          <p className="mt-1 text-xs text-ink/45">Introduced {new Date(item.createdAt).toLocaleDateString('en-KE')}</p>
          {item.activatedAt && <p className="mt-1 text-xs text-ink/45">Activated {new Date(item.activatedAt).toLocaleDateString('en-KE')}</p>}
        </div>
      </div>
      <div className="sm:text-right">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-800">{item.status === 'QUALIFIED' && <LivingSecurePayMark state="success" size="xs" presence="polite" decorative />}{item.status}</p>
        {reward && <p className="mt-1 text-sm font-semibold">Reward {reward}</p>}
        {qualified && <p className="mt-1 text-xs text-ink/45">Qualified {qualified}</p>}
      </div>
    </div>
    {(item.qualificationExplanation || item.settlementEvidenceReference || item.pricingVersion || item.referralRuleVersion) && <div className="mt-3 rounded-xl bg-ink/[0.025] p-3 text-xs text-ink/55">
      {item.qualificationExplanation && <p>{item.qualificationExplanation}</p>}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink/45">
        {item.pricingVersion && <span>Pricing {item.pricingVersion}</span>}
        {item.referralRuleVersion && <span>Rule {item.referralRuleVersion}</span>}
        {item.settlementEvidenceReference && <span>Settlement evidence {item.settlementEvidenceReference}</span>}
      </div>
    </div>}
  </li>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-ink/[0.025] p-3"><p className="text-xs text-ink/45">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>;
}
