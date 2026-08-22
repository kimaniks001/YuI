import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  Clock3,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from 'lucide-react';
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
  if (!normalized) return 'Account activity';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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
    const [readinessResult, activityResult] = await Promise.all([
      getAccountReadiness(session.accessToken),
      getActivityHistory(session.accessToken),
    ]);

    if (!readinessResult.ok || !readinessResult.data) {
      setState('error');
      return;
    }

    setReadiness(readinessResult.data);
    if (activityResult.ok && activityResult.data) {
      setActivity(activityResult.data);
      setActivityAvailable(true);
    } else {
      setActivity([]);
      setActivityAvailable(false);
    }
    setState('ready');
  };

  useEffect(() => {
    void load();
    // load is intentionally tied to the authenticated access token only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken]);

  const setupLabel = useMemo(() => {
    if (!readiness) return 'Not loaded';
    if (readiness.ready) return 'Ready';
    if (readiness.missingSteps.length) return 'Needs attention';
    return 'Not ready yet';
  }, [readiness]);

  if (!user || !session) return <Navigate to="/" replace />;

  return (
    <TraderShell>
      <TraderPageHeader
        eyebrow="My Market · Money & settlement"
        title="Know what money state you are looking at."
        description="SecurePay keeps agreement money, settlement readiness, destination accounts and posted records distinct. Your KSNumber virtual account is routing infrastructure; your verified Settlement Account is the destination for matured settlement."
        aside={
          <div className="min-w-[260px] rounded-2xl border border-green-700/10 bg-green-50/60 p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Account setup</p>
            <p className="mt-1 font-display text-2xl">{setupLabel}</p>
            <div className="mt-2 flex items-center gap-2"><LivingSecurePayMark state={readiness?.ready ? 'success' : 'guiding'} size="xs" presence="polite" /><p className="text-xs text-ink/50">Backend readiness only — not a wallet or bank balance.</p></div>
          </div>
        }
      />

      {state === 'loading' && <TraderLoadingState />}
      {state === 'error' && (
        <TraderErrorState
          title="We couldn't load your account setup"
          detail="SecurePay could not retrieve your account readiness. Nothing was changed and no money action was taken."
          onRetry={() => void load()}
        />
      )}

      {state === 'ready' && readiness && (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-3" aria-label="Account setup overview">
            <TruthCard
              icon={<LivingSecurePayMark state={readiness.verified ? 'success' : 'caution'} size="sm" presence="polite" />}
              eyebrow="SecurePay identity"
              title={readiness.verified ? 'Identity confirmed' : 'Identity still needs confirmation'}
              detail={readiness.verified
                ? 'SecurePay reports your identity as verified.'
                : 'Your account readiness says identity verification is not complete yet.'}
              tone={readiness.verified ? 'good' : 'attention'}
            />
            <TruthCard
              icon={<LivingSecurePayMark state={readiness.ksActive ? 'success' : 'caution'} size="sm" presence="polite" />}
              eyebrow="KSNumber"
              title={readiness.ksActive ? 'KSNumber active' : 'KSNumber not active yet'}
              detail={readiness.ksActive
                ? 'SecurePay reports your KSNumber as active. This screen does not infer which verification steps produced that state.'
                : 'SecurePay has not reported your KSNumber as active yet.'}
              tone={readiness.ksActive ? 'good' : 'attention'}
            />
            <TruthCard
              icon={<Landmark size={20} />}
              eyebrow="Settlement Account"
              title="Verified destination required"
              detail="One destination account must be verified and designated as your Settlement Account. The current UI contract does not yet expose which account that is, so SecurePay will not guess."
              tone="neutral"
            />
          </section>

          {readiness.missingSteps.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6" aria-labelledby="account-next-heading">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Needs your attention</p>
                  <h2 id="account-next-heading" className="mt-1 font-display text-2xl">Finish what SecurePay is asking for</h2>
                  <p className="mt-2 text-sm text-ink/60">These steps come directly from your account-readiness response.</p>
                  <ul className="mt-4 space-y-2">
                    {readiness.missingSteps.map(step => (
                      <li key={step} className="rounded-xl border border-amber-200/70 bg-white px-4 py-3 text-sm text-ink/75">{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-2">
            <AccountPanel
              icon={<Landmark size={18} />}
              eyebrow="SecurePay side"
              title="KSNumber virtual account"
              detail="This virtual account is attached to your KSNumber and is used inside SecurePay to receive and route agreement money. It is different from the destination account where settlement is ultimately sent."
            />
            <AccountPanel
              icon={<ShieldCheck size={18} />}
              eyebrow="Required for activation & settlement"
              title="Your Settlement Account"
              detail="Exactly one eligible destination must be verified as your Settlement Account. The KES 100 activation test must be received there before KSNumber activation, and matured-agreement settlement may only go to this verified account."
            />
          </section>

          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="destination-heading">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Destination accounts</p>
            <h2 id="destination-heading" className="mt-1 font-display text-2xl">Choose how you can receive settlement.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/55">A KS holder may register eligible destinations. One of them becomes the verified Settlement Account. Provider limits still apply and must be checked by SecurePay at the backend.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <DestinationType icon={<Building2 size={18} />} title="Bank account" detail="A bank account in your name or otherwise eligible under backend verification rules." />
              <DestinationType icon={<Smartphone size={18} />} title="Mobile money" detail="An active mobile-money number. Provider transaction and account limits must be respected." />
              <DestinationType icon={<WalletCards size={18} />} title="Digital Wallet / current account" detail="An optional personal or current account from Choice Bank or another approved partner. Provider limits apply. The account belongs to you; Keyman has no ownership or beneficial right over it." />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <UnavailablePanel
              title="KES 100 Settlement Account test"
              detail="SecurePay must send the backend-authoritative KES 100 test to the selected Settlement Account and confirm it was received before KSNumber activation. The current UI contract does not yet expose this workflow, so no test result is being fabricated here."
            />
            <UnavailablePanel
              title="Changing your Settlement Account"
              detail="Changing the account that receives settlement is security-sensitive. The current UI contract does not yet expose the required elevated verification workflow, so there is no instant account-switch control here."
            />
            <UnavailablePanel
              title="Review Reserve health"
              detail="The current frontend contract does not return Review Reserve balance or health. SecurePay will not invent a reserve status in the browser."
            />
            <UnavailablePanel
              title="Activation and renewal"
              detail="Commercial renewal timing is separate from KSNumber activation. SecurePay does not currently return a renewal date here, so no countdown is being guessed."
            />
          </section>

          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="account-activity-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Account activity</p>
                <h2 id="account-activity-heading" className="mt-1 font-display text-2xl">What SecurePay has recorded</h2>
              </div>
              <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 px-4 text-sm font-semibold text-ink/65 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">
                <RefreshCw size={15} /> Refresh
              </button>
            </div>

            {!activityAvailable ? (
              <div className="mt-5"><TraderUnavailableState title="Account activity unavailable" detail="SecurePay could not retrieve recent activity. Nothing was changed and no demo transactions were substituted." /></div>
            ) : activity.length === 0 ? (
              <div className="mt-5"><TraderEmptyState title="No account activity yet" detail="When SecurePay records account activity for you, it will appear here." /></div>
            ) : (
              <ul className="mt-5 divide-y divide-ink/8">
                {activity.slice(0, 12).map(item => {
                  const amount = activityAmount(item);
                  return (
                    <li key={item.id} className="flex min-h-16 items-start gap-3 py-4">
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700"><Banknote size={17} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                          <div>
                            <p className="text-sm font-semibold text-ink/85">{item.description || readableActivityType(item.type)}</p>
                            <p className="mt-0.5 text-xs text-ink/45">{readableActivityType(item.type)}{item.status ? ` · ${item.status.replace(/[_-]+/g, ' ').toLowerCase()}` : ''}</p>
                          </div>
                          {amount && <p className="text-sm font-semibold tabular-nums text-ink/75">{amount}</p>}
                        </div>
                        <time className="mt-2 inline-flex items-center gap-1 text-xs text-ink/40"><Clock3 size={12} /> {new Date(item.timestamp).toLocaleString('en-KE')}</time>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-green-700/10 bg-green-50/60 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <div className="flex items-start gap-3"><LivingSecurePayMark state="resting" size="sm" presence="polite" /><div><h2 className="font-display text-xl">Money still follows the agreement.</h2>
              <p className="mt-1 max-w-2xl text-sm text-ink/55">SecurePay explains the exact money state it received from the backend. It does not turn account readiness, a payment attempt, Payment Ready, a release instruction or settlement into the same thing.</p></div></div>
            </div>
            <div className="flex flex-wrap gap-3"><Link to="/market/statements" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">See statements <ArrowRight size={15} /></Link><Link to="/agreements" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">See agreements <ArrowRight size={15} /></Link></div>
          </section>
        </div>
      )}
    </TraderShell>
  );
}

function TruthCard({ icon, eyebrow, title, detail, tone }: { icon: React.ReactNode; eyebrow: string; title: string; detail: string; tone: 'good' | 'attention' | 'neutral' }) {
  const toneClass = tone === 'good'
    ? 'border-green-700/10 bg-white'
    : tone === 'attention'
      ? 'border-amber-200 bg-amber-50/60'
      : 'border-ink/8 bg-white';
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <span className="flex size-11 items-center justify-center rounded-full bg-green-50 text-green-700">{icon}</span>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-green-700">{eyebrow}</p>
      <h2 className="mt-1 font-display text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/55">{detail}</p>
    </article>
  );
}

function AccountPanel({ icon, eyebrow, title, detail }: { icon: React.ReactNode; eyebrow: string; title: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-green-700/10 bg-white p-5 shadow-sm">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">{icon}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700">{eyebrow}</p>
          <h2 className="mt-1 font-display text-xl">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/55">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function DestinationType({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-ink/8 bg-green-50/30 p-4">
      <span className="flex size-10 items-center justify-center rounded-full bg-white text-green-700 shadow-sm">{icon}</span>
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink/55">{detail}</p>
    </article>
  );
}

function UnavailablePanel({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-ink/8 bg-white p-5">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50/60 text-ink/45"><Clock3 size={17} /></span>
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/55">{detail}</p>
        </div>
      </div>
    </article>
  );
}
