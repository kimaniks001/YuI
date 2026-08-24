import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Banknote, Clock3, Landmark, RefreshCw, ShieldCheck } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState, TraderUnavailableState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { getAccountReadiness, getActivityHistory } from '../api/securepayEndpoints';
import type { SecurePayAccountReadiness, SecurePayActivity } from '../api/securepayTypes';

type LoadState = 'loading' | 'ready' | 'error';

function formatMoney(amount: number, currency = 'KES') {
  return `${currency} ${Math.abs(amount).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}
function activityAmount(activity: SecurePayActivity) {
  if (typeof activity.amount !== 'number') return null;
  return `${activity.amount > 0 ? '+' : activity.amount < 0 ? '−' : ''}${formatMoney(activity.amount, activity.currency || 'KES')}`;
}
function readableActivityType(type: string) {
  const normalized = type.trim().toLowerCase().replace(/[_-]+/g, ' ');
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Account activity';
}

export default function MoneySpace() {
  const { user, session } = useAuth();
  const [state, setState] = useState<LoadState>('loading');
  const [readiness, setReadiness] = useState<SecurePayAccountReadiness | null>(null);
  const [activity, setActivity] = useState<SecurePayActivity[]>([]);
  const [activityAvailable, setActivityAvailable] = useState(true);

  const load = async () => {
    if (!session?.accessToken) return;
    setState('loading');
    const [readinessResult, activityResult] = await Promise.all([getAccountReadiness(session.accessToken), getActivityHistory(session.accessToken)]);
    if (!readinessResult.ok || !readinessResult.data) { setState('error'); return; }
    setReadiness(readinessResult.data);
    setActivity(activityResult.ok && activityResult.data ? activityResult.data : []);
    setActivityAvailable(activityResult.ok);
    setState('ready');
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [session?.accessToken]);

  const setupLabel = useMemo(() => {
    if (!readiness) return 'Checking';
    if (readiness.ready) return 'Ready';
    if (readiness.missingSteps.length) return 'Needs attention';
    return 'Not ready';
  }, [readiness]);

  if (!user || !session) return <Navigate to="/" replace />;

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Money & settlement"
      title={readiness?.ready ? <>Account setup <span className="text-green-700">ready.</span></> : <>Account setup <span className="text-orange-700">{setupLabel.toLowerCase()}.</span></>}
      description="See your settlement readiness and recent recorded activity."
      aside={<div className="signed-in-identity-card"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-green-700">Setup</p><div className="mt-1 flex items-center gap-2"><LivingSecurePayMark state={readiness?.ready ? 'success' : 'guiding'} size="xs" presence="polite" /><strong className="font-display text-xl">{setupLabel}</strong></div></div>}
    />

    {state === 'loading' && <TraderLoadingState label="Checking account setup…" />}
    {state === 'error' && <TraderErrorState title="Account setup could not be loaded" detail="Your current readiness is unavailable." onRetry={() => void load()} />}

    {state === 'ready' && readiness && <div className="space-y-6">
      <section className="trader-home-situation" aria-label="Money and settlement situation">
        <div className="trader-home-situation-copy"><p className="trader-home-kicker">Right now</p><h2>{readiness.ready ? 'Your account setup is ready.' : readiness.missingSteps.length ? `${readiness.missingSteps.length} ${readiness.missingSteps.length === 1 ? 'step needs' : 'steps need'} your attention.` : 'Your setup is not ready yet.'}</h2></div>
        <div className="trader-home-metrics">
          <div className={`trader-home-metric ${readiness.verified ? 'is-active' : 'is-attention'}`}><span>Identity</span><strong>{readiness.verified ? '✓' : '!'}</strong></div>
          <div className={`trader-home-metric ${readiness.ksActive ? 'is-active' : 'is-attention'}`}><span>KS active</span><strong>{readiness.ksActive ? '✓' : '!'}</strong></div>
          <div className={`trader-home-metric ${readiness.missingSteps.length ? 'is-attention' : 'is-active'}`}><span>Steps</span><strong>{readiness.missingSteps.length}</strong></div>
          <div className="trader-home-metric"><span>Recent</span><strong>{activityAvailable ? activity.length : '—'}</strong></div>
        </div>
      </section>

      {readiness.missingSteps.length > 0 && <section className="market-section-shell is-attention" aria-labelledby="account-next-heading"><div className="mb-3 flex items-center gap-3"><span className="market-section-icon"><AlertTriangle size={18} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-700">Need you</p><h2 id="account-next-heading" className="market-section-title">Finish these</h2></div></div><ul className="space-y-2">{readiness.missingSteps.map(step => <li key={step} className="rounded-xl border border-orange-200/70 bg-white px-3 py-2.5 text-sm text-ink/75">{step}</li>)}</ul></section>}

      <section className="market-section-shell" aria-labelledby="account-activity-heading">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-green-700">Recently</p><h2 id="account-activity-heading" className="market-section-title">Recorded activity</h2></div><button type="button" onClick={() => void load()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-3 text-xs font-semibold"><RefreshCw size={14} /> Refresh</button></div>
        {!activityAvailable ? <div className="mt-3"><TraderUnavailableState title="Activity unavailable" detail="Your account setup is unchanged." /></div>
          : activity.length === 0 ? <div className="mt-3"><TraderEmptyState title="No recent account activity" detail="Recorded activity will appear here." /></div>
            : <ul className="mt-2 divide-y divide-ink/8">{activity.slice(0, 4).map(item => { const amount = activityAmount(item); return <li key={item.id} className="flex items-center gap-3 py-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700"><Banknote size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.description || readableActivityType(item.type)}</p><p className="mt-0.5 text-xs text-ink/40">{readableActivityType(item.type)} · {new Date(item.timestamp).toLocaleDateString('en-KE')}</p></div>{amount && <strong className="shrink-0 text-sm tabular-nums">{amount}</strong>}</li>; })}</ul>}
      </section>

      <section className="trader-around-rail" aria-label="Money tools"><Link to="/market/statements"><span>Statements</span><strong>Posted records</strong><ArrowRight size={14} /></Link><Link to="/agreements"><span>Agreements</span><strong>Money context</strong><ArrowRight size={14} /></Link></section>

      <details className="trader-progressive">
        <summary><Landmark size={14} /> How settlement accounts work</summary>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoPanel icon={<Landmark size={17} />} title="KSNumber virtual account" detail="SecurePay uses it to route agreement money. It is not the destination where matured settlement is ultimately received." />
          <InfoPanel icon={<ShieldCheck size={17} />} title="Settlement Account" detail="One eligible destination must be verified as the account that receives matured settlement." />
        </div>
      </details>

      <details className="trader-progressive">
        <summary><Clock3 size={14} /> What is not available here yet</summary>
        <div className="grid gap-2 md:grid-cols-2">
          <InfoPanel title="KES 100 account test" detail="This UI does not yet expose the authoritative test workflow." />
          <InfoPanel title="Change Settlement Account" detail="The elevated verification workflow is not exposed here yet." />
          <InfoPanel title="Review Reserve health" detail="No backend reserve-health projection is returned here yet." />
          <InfoPanel title="Renewal timing" detail="No renewal date is currently returned here." />
        </div>
      </details>
    </div>}
  </TraderShell>;
}

function InfoPanel({ icon, title, detail }: { icon?: React.ReactNode; title: string; detail: string }) {
  return <article className="rounded-xl border border-green-700/10 bg-white p-3"><div className="flex items-start gap-2">{icon && <span className="mt-0.5 text-green-700">{icon}</span>}<div><h3 className="font-semibold text-sm">{title}</h3><p className="mt-1 text-xs leading-5 text-ink/50">{detail}</p></div></div></article>;
}
