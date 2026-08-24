import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, Copy, FileCheck2, Gift, Handshake, LayoutGrid, ListChecks, ShieldCheck, UsersRound, WalletCards } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTraderWorkspace } from '../lib/useTraderWorkspace';
import { getMyCircle, getMyReferralHistory } from '../api/r11TraderEndpoints';
import type { CircleProfileResponse, ReferralHistoryResponse } from '../api/r11TraderTypes';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderAgreementCard from '../components/trader/TraderAgreementCard';
import { TraderEmptyState, TraderErrorState, TraderLoadingState, TraderUnavailableState } from '../components/trader/TraderStates';
import { createCreationIntentFromText, saveCreationIntent } from '../lib/creationIntent';

export default function SecurePayHome() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { state, agreements, activity, activityAvailable, retry } = useTraderWorkspace();
  const [circle, setCircle] = useState<CircleProfileResponse | null>(null);
  const [referrals, setReferrals] = useState<ReferralHistoryResponse | null>(null);
  const [agreementDraft, setAgreementDraft] = useState('');

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

  const startAgreement = () => {
    const statement = agreementDraft.trim();
    if (!statement) return;
    const intent = createCreationIntentFromText(statement);
    saveCreationIntent(intent);
    navigate('/create/journey', { state: { intent } });
  };

  return <TraderShell>
    <TraderPageHeader
      eyebrow={name ? `Good to see you, ${name}.` : 'Good to see you.'}
      title={<>Welcome back to <span className="text-green-700">your agreements.</span></>}
      description="Tell SecurePay what you want to do, see what needs you, and follow each agreement from what was promised to what should happen next."
      aside={<div className="signed-in-identity-card"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-green-700">Your KSNumber</p><div className="mt-1 flex items-center gap-2"><span aria-label="KS Number" className="font-mono text-lg font-bold text-ink/80">{user.ksNumber || 'Not available yet'}</span>{user.ksNumber && <button type="button" aria-label="Copy KS Number" onClick={() => void navigator.clipboard.writeText(user.ksNumber!)} className="flex size-10 items-center justify-center rounded-full text-green-700 hover:bg-white"><Copy size={16} /></button>}</div><p className="mt-1 text-xs leading-5 text-ink/45">The SecurePay identity attached to this signed-in view.</p></div>}
    />

    {state === 'loading' && <TraderLoadingState />}
    {state === 'error' && <TraderErrorState title="Your trader workspace could not be loaded" detail="SecurePay could not retrieve your agreements. Nothing was changed. Check your connection and try again." onRetry={retry} />}
    {state === 'ready' && <div className="space-y-7">
      <section className="signed-in-market-hero" aria-labelledby="home-agreement-heading">
        <div className="relative z-[1] min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-700">What are you here to do today?</p>
          <h2 id="home-agreement-heading" className="market-now-heading">Start with the agreement, not the payment.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">Buy something, sell, hire someone, get paid, support family, build or contribute. Say what you are trying to do naturally and SecurePay will ask only the questions that fit.</p>
          <form
            className="market-start-prompt"
            aria-label="Start an agreement from your own words"
            onSubmit={event => {
              event.preventDefault();
              startAgreement();
            }}
          >
            <div className="market-start-prompt-copy">
              <textarea
                value={agreementDraft}
                onChange={event => setAgreementDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    startAgreement();
                  }
                }}
                rows={2}
                maxLength={420}
                aria-label="What would you like to agree today?"
                placeholder="What would you like to agree today?"
                className="market-start-prompt-input block min-h-[42px] w-full resize-none border-0 bg-transparent p-0 font-display text-[21px] italic leading-tight text-ink outline-none placeholder:text-ink/55 focus:border-0 focus:outline-none focus:ring-0"
              />
              <span className="market-start-prompt-help">For example: “I’m buying a fridge for KES 45,000 and it should be delivered on Friday.”</span>
            </div>
            <button
              type="submit"
              disabled={!agreementDraft.trim()}
              className="market-start-prompt-arrow border-0 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Start this agreement"
            >
              <ArrowRight size={22} />
            </button>
          </form>
        </div>

        <aside className="market-guide-card" aria-label="SecurePay agreement guide">
          <span className="market-guide-badge"><ShieldCheck size={14} /> SecurePay is with the agreement</span>
          <h3 className="market-guide-title">Your work stays primary. SecurePay helps keep the agreement clear.</h3>
          <p className="mt-2 text-xs leading-5 text-ink/48">We carry what you already said forward, ask for missing clarity and keep money states tied to backend truth.</p>
          <div className="market-guide-stats">
            <div className="market-guide-stat"><span>Active agreements</span><strong>{active.length}</strong></div>
            <div className="market-guide-stat"><span>Cancelled or expired</span><strong>{closed.length}</strong></div>
            <div className="market-guide-stat"><span>Recent activity</span><strong>{activityAvailable ? activity.length : '—'}</strong></div>
          </div>
        </aside>
      </section>

      <section className="market-section-shell is-attention" aria-labelledby="attention-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="market-section-icon"><ListChecks size={19} /></span>
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-700">Needs your action</p><h2 id="attention-heading" className="market-section-title">What SecurePay needs from you next</h2></div>
          </div>
          <Link to="/actions" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-green-700">Open Action Centre <ArrowRight size={15} /></Link>
        </div>
        <TraderUnavailableState title="Action feed not available yet" detail="SecurePay has not returned a session-wide action feed, so no commands are being guessed from agreement status. Your agreements are unchanged." />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Agreement summary">
        <SummaryCard icon={<Handshake />} value={active.length} label="Active agreements" />
        <SummaryCard icon={<ListChecks />} value="—" label="Needs your action" secondary />
        <SummaryCard icon={<Clock3 />} value="—" label="Under review" secondary />
        <SummaryCard icon={<CheckCircle2 />} value={closed.length} label="Cancelled or expired" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/market" className="market-link-card group">
          <div className="flex gap-3">
            <span className="market-section-icon"><LayoutGrid size={19} /></span>
            <div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-green-700">My Market</p><h2 className="mt-2 font-display text-2xl leading-none">Everything you trade, in one place.</h2><p className="mt-2 text-sm leading-6 text-ink/52">See what needs you, what is waiting, what is moving and the records SecurePay can prove for your agreements.</p></div>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">Open My Market <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
        </Link>
        <Link to="/money" className="market-link-card group">
          <div className="flex gap-3">
            <span className="market-section-icon"><WalletCards size={19} /></span>
            <div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-green-700">Account & settlement</p><h2 className="mt-2 font-display text-2xl leading-none">Keep your Settlement Account ready.</h2><p className="mt-2 text-sm leading-6 text-ink/52">A matured agreement may settle only to a verified destination returned by SecurePay. The UI does not invent one.</p></div>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">View account setup <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
        </Link>
      </section>

      {(circle || referrals) && <section aria-label="Circle and referral context" className="grid gap-4 md:grid-cols-2">
        {circle && <Link to="/community" className="market-link-card group">
          <div className="flex items-center gap-3"><span className="market-section-icon"><UsersRound size={18} /></span><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-green-700">Your Circle</p><p className="mt-2 font-display text-2xl leading-none">{circle.referredTraderCount} referred · {circle.activatedReferredTraderCount} activated</p><p className="mt-2 text-sm text-ink/48">Community context only. It does not change agreement or money authority.</p></div></div><ArrowRight className="text-green-700 transition group-hover:translate-x-1" size={16} />
        </Link>}
        {referrals && <Link to="/referrals" className="market-link-card is-life group">
          <div className="flex items-center gap-3"><span className="market-section-icon"><Gift size={18} /></span><div><p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-orange-700">Referrals</p><p className="mt-2 font-display text-2xl leading-none">{referrals.totalReferred} introduced · {referrals.activatedOrLaterCount} activated or qualified</p><p className="mt-2 text-sm text-ink/48">Rewards appear only when backend evidence says they exist.</p></div></div><ArrowRight className="text-orange-700 transition group-hover:translate-x-1" size={16} />
        </Link>}
      </section>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,.75fr)]">
        <section className="market-section-shell">
          <div className="mb-2 flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-green-700">Your agreements</p><h2 className="market-section-title">Active now</h2></div><Link to="/agreements" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-green-700">See all <ArrowRight size={15} /></Link></div>
          {active.length ? active.slice(0, 5).map(item => <TraderAgreementCard key={item.agreementId} agreement={item} compact />) : <TraderEmptyState title="No active agreements" detail="When an agreement becomes active, it will appear here. Start with what you want to agree whenever you are ready." />}
        </section>
        <section className="market-section-shell"><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-green-700">Recent activity</p><h2 className="market-section-title mt-1">What happened</h2>{!activityAvailable ? <div className="mt-4"><TraderUnavailableState title="Activity unavailable" detail="Recent movement could not be retrieved. Your agreements were not changed." /></div> : activity.length ? <ul className="mt-4 space-y-4">{activity.slice(0, 5).map(item => <li key={item.id} className="flex gap-3 border-b border-green-700/8 pb-4 last:border-0"><span className="mt-1 size-2 shrink-0 rounded-full bg-green-600" /><div><p className="text-sm font-medium">{item.description}</p><time className="mt-1 block text-xs text-ink/40">{new Date(item.timestamp).toLocaleString('en-KE')}</time></div></li>)}</ul> : <div className="mt-4"><TraderEmptyState title="No recent movement" detail="Activity recorded for this account will appear here." /></div>}</section>
      </div>

      <section className="market-section-shell flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div className="flex gap-3"><span className="market-section-icon"><FileCheck2 size={19} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-green-700">Agreement first</p><h2 className="market-section-title mt-1">Your work stays primary.</h2><p className="mt-2 text-sm text-ink/55">Account and financial context only appears when SecurePay can prove it.</p></div></div><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hp-start-btn inline-flex min-h-11 items-center gap-2 px-5 text-sm">Start an agreement <ArrowRight size={15} /></button></section>
    </div>}
  </TraderShell>;
}

function SummaryCard({ icon, value, label, secondary = false }: { icon: React.ReactNode; value: number | string; label: string; secondary?: boolean }) {
  return <div className={`market-link-card min-h-0 p-4 ${secondary ? 'opacity-80' : ''}`}><div className="flex items-center gap-3"><span className="market-section-icon">{icon}</span><div><p className="font-display text-3xl font-semibold leading-none tabular-nums">{value}</p><p className="mt-1 text-xs text-ink/50">{label}</p></div></div></div>;
}
