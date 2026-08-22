import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Copy, FileCheck2, Gift, Handshake, LayoutGrid, ListChecks, UsersRound, WalletCards } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTraderWorkspace } from '../lib/useTraderWorkspace';
import { getMyCircle, getMyReferralHistory } from '../api/r11TraderEndpoints';
import type { CircleProfileResponse, ReferralHistoryResponse } from '../api/r11TraderTypes';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderAgreementCard from '../components/trader/TraderAgreementCard';
import { TraderEmptyState, TraderErrorState, TraderLoadingState, TraderUnavailableState } from '../components/trader/TraderStates';

export default function SecurePayHome() {
  const { user, session } = useAuth();
  const { state, agreements, activity, activityAvailable, retry } = useTraderWorkspace();
  const [circle, setCircle] = useState<CircleProfileResponse | null>(null);
  const [referrals, setReferrals] = useState<ReferralHistoryResponse | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    let cancelled = false;
    void Promise.all([
      getMyCircle(session.accessToken),
      getMyReferralHistory(session.accessToken),
    ]).then(([circleResult, referralResult]) => {
      if (cancelled) return;
      if (circleResult.ok && circleResult.data) setCircle(circleResult.data);
      if (referralResult.ok && referralResult.data) setReferrals(referralResult.data);
    });
    return () => { cancelled = true; };
  }, [session?.accessToken]);

  if (!user) return <Navigate to="/" replace />;

  const name = user.displayName?.trim();
  const active = agreements.filter(item => !['CANCELLED', 'EXPIRED'].includes(item.status.toUpperCase()));
  const closed = agreements.filter(item => ['CANCELLED', 'EXPIRED'].includes(item.status.toUpperCase()));

  return <TraderShell>
    <TraderPageHeader
      eyebrow={name ? `Good to see you, ${name}.` : 'Good to see you.'}
      title="Welcome to the Market"
      description="Start a trade, see what needs you, or open My Market to follow everything SecurePay can prove about your trading activity."
      aside={<div className="min-w-[270px] rounded-2xl border border-ink/8 bg-white p-4 shadow-sm"><p className="text-xs text-ink/40">Your KSNumber</p><div className="mt-1 flex items-center gap-2"><span aria-label="KS Number" className="font-mono text-lg font-bold">{user.ksNumber || 'Not available yet'}</span>{user.ksNumber && <button type="button" aria-label="Copy KS Number" onClick={() => void navigator.clipboard.writeText(user.ksNumber!)} className="flex size-11 items-center justify-center rounded-full text-green-700"><Copy size={16} /></button>}</div></div>}
    />

    {state === 'loading' && <TraderLoadingState />}
    {state === 'error' && <TraderErrorState title="Your trader workspace could not be loaded" detail="SecurePay could not retrieve your agreements. Nothing was changed. Check your connection and try again." onRetry={retry} />}
    {state === 'ready' && <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-green-700/10 bg-green-50/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="my-market-heading">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-green-700 shadow-sm"><LayoutGrid size={19} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">My Market</p>
            <h2 id="my-market-heading" className="mt-1 font-display text-xl">Everything you trade, in one place.</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/55">Open your operating view for KSNumbers, Digital Store activity, agreements, account records and statements. Each item keeps the KSNumber that actually owns it.</p>
          </div>
        </div>
        <Link to="/market" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-green-700">Open My Market <ArrowRight size={15} /></Link>
      </section>

      <section aria-labelledby="attention-heading" className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Needs your action</p><h2 id="attention-heading" className="mt-1 font-display text-2xl">Your next legitimate actions</h2></div><Link to="/actions" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-green-700">Open Action Centre <ArrowRight size={15} /></Link></div>
        <TraderUnavailableState title="Action feed not available yet" detail="SecurePay has not returned a session-wide action feed, so no commands are being guessed from agreement status. Your agreements are unchanged." />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={<Handshake />} value={active.length} label="Active agreements" />
        <SummaryCard icon={<ListChecks />} value="—" label="Needs your action" secondary />
        <SummaryCard icon={<Clock3 />} value="—" label="Under review" secondary />
        <SummaryCard icon={<CheckCircle2 />} value={closed.length} label="Cancelled or expired" />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-green-700/10 bg-green-50/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="account-setup-heading">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-green-700 shadow-sm"><WalletCards size={19} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Account & settlement</p>
            <h2 id="account-setup-heading" className="mt-1 font-display text-xl">Keep your Settlement Account ready.</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/55">Your KSNumber virtual account handles SecurePay-side routing. A separate verified Settlement Account — bank, mobile money or partner Digital Wallet/current account — is the only destination a matured agreement may settle to.</p>
          </div>
        </div>
        <Link to="/money" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-green-700">View account setup <ArrowRight size={15} /></Link>
      </section>

      {(circle || referrals) && <section aria-label="Circle and referral context" className="grid gap-3 md:grid-cols-2">
        {circle && <Link to="/community" className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-white p-4 shadow-sm transition hover:border-green-700/20">
          <div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700"><UsersRound size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">Your Circle</p><p className="mt-1 text-sm font-semibold">{circle.referredTraderCount} referred · {circle.activatedReferredTraderCount} activated</p><p className="mt-1 text-xs text-ink/45">Community context only</p></div></div><ArrowRight className="shrink-0 text-green-700" size={16} />
        </Link>}
        {referrals && <Link to="/referrals" className="flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-white p-4 shadow-sm transition hover:border-green-700/20">
          <div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700"><Gift size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">Referrals</p><p className="mt-1 text-sm font-semibold">{referrals.totalReferred} introduced · {referrals.activatedOrLaterCount} activated or qualified</p><p className="mt-1 text-xs text-ink/45">Rewards appear only from backend evidence</p></div></div><ArrowRight className="shrink-0 text-green-700" size={16} />
        </Link>}
      </section>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,.75fr)]">
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-2xl">Active agreements</h2><Link to="/agreements" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-green-700">See all <ArrowRight size={15} /></Link></div>
          {active.length ? active.slice(0, 5).map(item => <TraderAgreementCard key={item.agreementId} agreement={item} compact />) : <TraderEmptyState title="No active agreements" detail="When an agreement becomes active, it will appear here. You can create a SecureLink whenever you are ready." />}
        </section>
        <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6"><h2 className="font-display text-2xl">Recent activity</h2>{!activityAvailable ? <div className="mt-4"><TraderUnavailableState title="Activity unavailable" detail="Recent movement could not be retrieved. Your agreements were not changed." /></div> : activity.length ? <ul className="mt-4 space-y-4">{activity.slice(0, 5).map(item => <li key={item.id} className="flex gap-3 border-b border-ink/8 pb-4 last:border-0"><span className="mt-1 size-2 shrink-0 rounded-full bg-green-600" /><div><p className="text-sm font-medium">{item.description}</p><time className="mt-1 block text-xs text-ink/40">{new Date(item.timestamp).toLocaleString('en-KE')}</time></div></li>)}</ul> : <div className="mt-4"><TraderEmptyState title="No recent movement" detail="Activity recorded for this account will appear here." /></div>}</section>
      </div>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-green-700/10 bg-green-50/60 p-6 sm:flex-row sm:items-center"><div className="flex gap-3"><FileCheck2 className="mt-0.5 text-green-700" /><div><h2 className="font-display text-xl">Trader first. Agreement first.</h2><p className="mt-1 text-sm text-ink/55">Your work stays primary. Account and financial context only appears when SecurePay can prove it.</p></div></div><Link to="/create" className="sp-btn-primary inline-flex min-h-11 items-center px-5 text-sm">Start an agreement</Link></section>
    </div>}
  </TraderShell>;
}

function SummaryCard({ icon, value, label, secondary = false }: { icon: React.ReactNode; value: number | string; label: string; secondary?: boolean }) {
  return <div className={`rounded-2xl border p-4 shadow-sm ${secondary ? 'border-ink/8 bg-white text-ink/55' : 'border-green-700/10 bg-white'}`}><div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">{icon}</span><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-ink/50">{label}</p></div></div></div>;
}
