import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircleUserRound, Copy, Share2 } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { getMyReferralHistory, redeemReferralCode } from '../api/r11TraderEndpoints';
import type { ReferralHistoryResponse, ReferralRelationshipResponse } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';

function money(minor: number | null, currency: string | null) {
  if (minor == null || !currency) return null;
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(minor / 100);
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
    setLoading(true); setError(null);
    const result = await getMyReferralHistory(session.accessToken);
    if (!result.ok || !result.data) setError(result.error || 'Your referral history could not be loaded.');
    else setHistory(result.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);
  if (!user || !session) return <Navigate to="/" replace />;

  const copyCode = async () => { if (history?.referralCode) await navigator.clipboard.writeText(history.referralCode); };
  const shareCode = async () => {
    if (!history?.referralCode) return;
    const text = `Join me on SecurePay. Use referral code ${history.referralCode}.`;
    if (navigator.share) await navigator.share({ title: 'SecurePay referral', text });
    else await navigator.clipboard.writeText(text);
  };
  const submitRedeem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeeming(true); setRedeemMessage(null);
    const result = await redeemReferralCode(session.accessToken, redeemCode);
    setRedeeming(false);
    if (!result.ok) { setRedeemMessage(result.error || 'That referral code could not be applied.'); return; }
    setRedeemCode(''); setRedeemMessage('Referral code applied.'); await load();
  };

  return <TraderShell>
    <TraderPageHeader eyebrow="Referrals" title={<>People you <span className="text-green-700">introduced</span></>} description="Share your code and see relationships SecurePay can prove." />

    {loading && <TraderLoadingState label="Loading referrals…" />}
    {error && <TraderErrorState title="Referrals could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && history && <div className="space-y-5">
      <section className="trader-home-situation">
        <div className="trader-home-situation-copy"><p className="trader-home-kicker">Your code</p><div className="mt-2 flex max-w-sm items-center gap-2 rounded-xl border border-green-700/10 bg-white p-2"><strong className="min-w-0 flex-1 truncate font-mono text-lg">{history.referralCode}</strong><button type="button" aria-label="Copy referral code" onClick={() => void copyCode()} className="flex size-9 items-center justify-center rounded-full text-green-700"><Copy size={16} /></button><button type="button" aria-label="Share referral code" onClick={() => void shareCode()} className="flex size-9 items-center justify-center rounded-full bg-green-700 text-white"><Share2 size={16} /></button></div></div>
        <div className="trader-home-metrics"><div className="trader-home-metric is-active"><span>Referred</span><strong>{history.totalReferred}</strong></div><div className="trader-home-metric"><span>Activated+</span><strong>{history.activatedOrLaterCount}</strong></div></div>
      </section>

      <section className="market-section-shell"><div className="mb-2"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">History</p><h2 className="market-section-title">Recorded relationships</h2></div>{history.relationships.length === 0 ? <p className="rounded-xl bg-ink/[0.025] p-3 text-sm text-ink/50">No referrals recorded yet.</p> : <ul className="divide-y divide-ink/8">{history.relationships.slice(0, 10).map(item => <ReferralRow key={item.relationshipId} item={item} />)}</ul>}</section>

      <details className="trader-progressive"><summary>Apply a referral code</summary><div><form onSubmit={submitRedeem} className="flex flex-col gap-2 sm:flex-row"><input value={redeemCode} onChange={e => setRedeemCode(e.target.value)} placeholder="Referral code" className="min-h-10 flex-1 rounded-xl border border-ink/15 bg-white px-3 text-sm outline-none" /><button type="submit" disabled={redeeming || !redeemCode.trim()} className="sp-btn-primary min-h-10 px-4 text-sm disabled:opacity-50">{redeeming ? 'Applying…' : 'Apply'}</button></form>{redeemMessage && <p className="mt-2 text-xs text-ink/55">{redeemMessage}</p>}</div></details>

      <details className="trader-progressive"><summary>How rewards appear</summary><div className="rounded-xl border border-green-700/10 bg-white p-3 text-xs leading-5 text-ink/50">SecurePay shows a reward only when backend qualification and settlement evidence exist. This page does not estimate earnings or create entitlement.</div></details>
    </div>}
  </TraderShell>;
}

function ReferralRow({ item }: { item: ReferralRelationshipResponse }) {
  const reward = money(item.rewardAmountMinor, item.rewardCurrency);
  return <li className="py-3"><div className="flex items-start gap-3"><CircleUserRound className="mt-0.5 shrink-0 text-green-700" size={18} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{item.referredKsNumber}</p><p className="mt-0.5 text-xs text-ink/40">Introduced {new Date(item.createdAt).toLocaleDateString('en-KE')}</p></div><div className="text-right"><p className="text-xs font-semibold text-green-800">{item.status}</p>{reward && <p className="mt-1 text-sm font-semibold">{reward}</p>}</div></div>{(item.qualificationExplanation || item.settlementEvidenceReference || item.pricingVersion || item.referralRuleVersion) && <details className="trader-progressive"><summary>Qualification details</summary><div className="text-xs text-ink/50">{item.qualificationExplanation && <p>{item.qualificationExplanation}</p>}<div className="mt-1 flex flex-wrap gap-2 font-mono text-[10px]">{item.pricingVersion && <span>Pricing {item.pricingVersion}</span>}{item.referralRuleVersion && <span>Rule {item.referralRuleVersion}</span>}{item.settlementEvidenceReference && <span>Evidence {item.settlementEvidenceReference}</span>}</div></div></details>}</div></div></li>;
}
