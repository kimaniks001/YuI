import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Clock3, FileCheck2, Search, Sparkles, UsersRound } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState, TraderUnavailableState } from '../components/trader/TraderStates';
import { getMyMarketIdentities } from '../api/r13MarketEndpoints';
import type { SecurePayMarketIdentity } from '../api/r13MarketTypes';
import { useAuth } from '../lib/auth';
import { useTraderWorkspace } from '../lib/useTraderWorkspace';
import { buildMarketProjection, type MarketItem } from '../lib/marketProjection';

export default function MyMarket() {
  const { user, session } = useAuth();
  const { state, agreements, activity, activityAvailable, retry } = useTraderWorkspace();
  const [query, setQuery] = useState('');
  const [identities, setIdentities] = useState<SecurePayMarketIdentity[] | null>(null);
  const [identitiesAvailable, setIdentitiesAvailable] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;
    let cancelled = false;
    void getMyMarketIdentities(session.accessToken).then(result => {
      if (cancelled) return;
      if (result.ok && result.data) {
        setIdentities(result.data.filter(identity => identity.canView));
        setIdentitiesAvailable(true);
      } else {
        setIdentities(null);
        setIdentitiesAvailable(false);
      }
    });
    return () => { cancelled = true; };
  }, [session?.accessToken]);

  const market = useMemo(() => buildMarketProjection(agreements, activity), [agreements, activity]);
  const currentIdentity = identities?.find(identity => identity.current) ?? null;
  const currentKsNumber = currentIdentity?.ksNumber || user?.ksNumber || '';
  const normalizedQuery = query.trim().toLowerCase();
  const filter = (items: MarketItem[]) => normalizedQuery
    ? items.filter(item => [item.title, item.purpose, item.counterparty, item.publicReference, item.role]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(normalizedQuery)))
    : items;

  if (!user || !session) return <Navigate to="/" replace />;

  return (
    <TraderShell>
      <TraderPageHeader
        eyebrow="Welcome to the Market"
        title="Everything you trade, in one place."
        description="See what needs you, what you are waiting for, and what has just happened. Every action still belongs to the exact agreement and KSNumber that SecurePay returned."
        aside={currentKsNumber ? (
          <div className="min-w-[220px] rounded-2xl border border-green-700/10 bg-green-50/60 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-green-700">Acting identity</p>
            <p className="mt-1 font-mono text-base font-bold text-ink/80">{currentKsNumber}</p>
            <p className="mt-1 text-xs text-ink/45">Exact authenticated KSNumber.</p>
          </div>
        ) : undefined}
      />

      {state === 'loading' && <TraderLoadingState />}
      {state === 'error' && (
        <TraderErrorState
          title="My Market could not be loaded"
          detail="SecurePay could not retrieve your current agreement workspace. Nothing was inferred locally."
          onRetry={retry}
        />
      )}

      {state === 'ready' && (
        <div className="space-y-7">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">What needs you right now?</p>
              <h2 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
                {market.attention.length > 0
                  ? `${market.attention.length} ${market.attention.length === 1 ? 'agreement needs' : 'agreements need'} your attention.`
                  : 'Nothing urgent needs you right now.'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">
                SecurePay uses the backend-owned next actions already attached to your agreements. It does not create a second priority system in the browser.
              </p>
            </div>
            <Link to="/create/journey" className="sp-btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">
              <Sparkles size={16} /> Start something new
            </Link>
          </section>

          <section className="rounded-2xl border border-ink/8 bg-white p-3 shadow-sm">
            <label className="flex min-h-12 items-center gap-3 rounded-xl px-3">
              <Search size={18} className="shrink-0 text-ink/35" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Find an agreement, person, KSNumber or reference"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35"
              />
            </label>
          </section>

          <MarketSection eyebrow="Needs your attention" title="Do these next" icon={<Sparkles size={18} />} items={filter(market.attention)} empty="No agreement needs an action from you right now." attention />
          <MarketSection eyebrow="Waiting" title="SecurePay is waiting on someone or something else" icon={<Clock3 size={18} />} items={filter(market.waiting)} empty="Nothing is currently waiting." />
          {filter(market.active).length > 0 && <MarketSection eyebrow="Active" title="In progress" icon={<UsersRound size={18} />} items={filter(market.active)} empty="No other active agreements." />}
          <MarketSection eyebrow="Recently completed" title="Your recent records" icon={<FileCheck2 size={18} />} items={filter(market.completed).slice(0, 6)} empty="Completed agreements will stay available here as records." quiet />

          <section className="grid gap-3 sm:grid-cols-2" aria-label="Market records and money flows">
            <Link to="/market/flows" className="group flex items-center gap-4 rounded-2xl border border-green-700/10 bg-white p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Money Flows</p>
                <p className="mt-1 text-sm text-ink/55">See how the four agreement money shapes fit together without changing your current trade.</p>
              </div>
              <ArrowRight size={17} className="shrink-0 text-green-700 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/market/statements" className="group flex items-center gap-4 rounded-2xl border border-green-700/10 bg-white p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Statements</p>
                <p className="mt-1 text-sm text-ink/55">Open the backend-posted record for an authorised KSNumber without creating a combined wallet.</p>
              </div>
              <ArrowRight size={17} className="shrink-0 text-green-700 transition group-hover:translate-x-0.5" />
            </Link>
          </section>

          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="market-activity-heading">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Recent activity</p>
                <h2 id="market-activity-heading" className="mt-1 font-display text-2xl">What happened</h2>
              </div>
              <button type="button" onClick={retry} className="text-sm font-semibold text-green-700">Refresh</button>
            </div>
            {!activityAvailable ? (
              <div className="mt-4"><TraderUnavailableState title="Activity unavailable" detail="SecurePay did not return recent activity, so My Market is not substituting demo transactions." /></div>
            ) : market.recentActivity.length === 0 ? (
              <div className="mt-4"><TraderEmptyState title="No recorded activity yet" detail="Backend-recorded activity will appear here." /></div>
            ) : (
              <ul className="mt-4 divide-y divide-ink/8">
                {market.recentActivity.map(item => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink/80">{item.description}</p>
                      <p className="mt-0.5 text-xs capitalize text-ink/40">{item.detail}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {item.amountDisplay && <p className="text-sm font-semibold tabular-nums text-ink/70">{item.amountDisplay}</p>}
                      <time className="text-[11px] text-ink/35">{new Date(item.occurredAt).toLocaleDateString('en-KE')}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-green-700/10 bg-green-50/60 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Your place in the Market</p>
            {!identitiesAvailable ? (
              <div className="mt-3"><TraderUnavailableState title="Other Market identities are unavailable" detail="SecurePay could not confirm additional viewable KSNumbers. This page will not create one locally." /></div>
            ) : !identities ? (
              <div className="mt-3"><TraderLoadingState /></div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {identities.map(identity => (
                  <span key={identity.ksNumber} className="rounded-full border border-green-700/10 bg-white px-3 py-2 text-xs">
                    <strong>{identity.displayName || identity.ksNumber}</strong>
                    <span className="ml-2 text-ink/40">{identity.current ? 'Current' : identity.canAct ? 'Can act' : 'View only'}</span>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs leading-5 text-ink/45">My Market is a view, not a super-KSNumber. Agreements, money and authority keep their exact backend identity.</p>
          </section>
        </div>
      )}
    </TraderShell>
  );
}

function MarketSection({ eyebrow, title, icon, items, empty, attention = false, quiet = false }: { eyebrow: string; title: string; icon: ReactNode; items: MarketItem[]; empty: string; attention?: boolean; quiet?: boolean }) {
  return (
    <section aria-label={eyebrow}>
      <div className="mb-3 flex items-center gap-2">
        <span className={attention ? 'text-orange-600' : 'text-green-700'}>{icon}</span>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${attention ? 'text-orange-700' : 'text-green-700'}`}>{eyebrow}</p>
          <h2 className="font-display text-2xl">{title}</h2>
        </div>
      </div>
      {items.length === 0 ? (
        <div className={`rounded-2xl border p-5 text-sm ${quiet ? 'border-ink/8 bg-white text-ink/45' : 'border-green-700/10 bg-green-50/40 text-ink/55'}`}>{empty}</div>
      ) : (
        <div className="space-y-2">{items.map(item => <MarketRow key={item.agreementId} item={item} attention={attention} quiet={quiet} />)}</div>
      )}
    </section>
  );
}

function MarketRow({ item, attention, quiet }: { item: MarketItem; attention: boolean; quiet: boolean }) {
  const href = item.primaryAction?.href || `/agreements/${encodeURIComponent(item.agreementId)}`;
  return (
    <Link to={href} className={`group flex min-h-[82px] items-center gap-4 rounded-2xl border px-4 py-3 shadow-sm transition hover:-translate-y-px hover:shadow-md ${attention ? 'border-orange-200 bg-orange-50/45' : quiet ? 'border-ink/8 bg-white' : 'border-green-700/10 bg-white'}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-sm font-bold text-ink/85">{item.title}</h3>
          {item.amountDisplay && <span className="text-xs font-semibold tabular-nums text-ink/50">{item.amountDisplay}</span>}
        </div>
        <p className={`mt-1 text-sm ${attention ? 'font-semibold text-orange-800' : 'text-ink/55'}`}>{item.primaryAction ? `Next: ${item.primaryAction.label}` : item.waitingOn || item.humanStatus}</p>
        <p className="mt-1 truncate text-xs text-ink/35">{[item.counterparty, item.role].filter(Boolean).join(' · ') || item.publicReference}</p>
      </div>
      <ArrowRight size={18} className="shrink-0 text-green-700 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
