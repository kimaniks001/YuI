import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Clock3, FileCheck2, Search, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState, TraderUnavailableState } from '../components/trader/TraderStates';
import { getMyMarketIdentities } from '../api/r13MarketEndpoints';
import type { SecurePayMarketIdentity } from '../api/r13MarketTypes';
import { useAuth } from '../lib/auth';
import { useTraderWorkspace } from '../lib/useTraderWorkspace';
import { buildMarketProjection, type MarketItem } from '../lib/marketProjection';
import { createCreationIntentFromText, saveCreationIntent } from '../lib/creationIntent';

export default function MyMarket() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { state, agreements, activity, activityAvailable, retry } = useTraderWorkspace();
  const [query, setQuery] = useState('');
  const [agreementDraft, setAgreementDraft] = useState('');
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

  const startAgreement = () => {
    const statement = agreementDraft.trim();
    if (!statement) return;
    const intent = createCreationIntentFromText(statement);
    saveCreationIntent(intent);
    navigate('/create/journey', { state: { intent } });
  };

  if (!user || !session) return <Navigate to="/" replace />;

  return (
    <TraderShell>
      <TraderPageHeader
        eyebrow="Welcome to your Market"
        title={<>Everything you trade, <span className="text-green-700">in one place.</span></>}
        description={<>See what needs you, what you are waiting for and what has just happened. SecurePay keeps each action attached to the exact agreement and KSNumber that returned it.</>}
        aside={currentKsNumber ? (
          <div className="signed-in-identity-card">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-green-700">You are here as</p>
            <p className="mt-1 font-mono text-base font-bold text-ink/80">{currentKsNumber}</p>
            <p className="mt-1 text-xs leading-5 text-ink/45">Your authenticated SecurePay identity for this view.</p>
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
          <section className="signed-in-market-hero" aria-labelledby="market-now-heading">
            <div className="relative z-[1] min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-700">What needs you right now?</p>
              <h2 id="market-now-heading" className="market-now-heading">
                {market.attention.length > 0
                  ? `${market.attention.length} ${market.attention.length === 1 ? 'agreement needs' : 'agreements need'} your attention.`
                  : 'Nothing urgent needs you right now.'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">
                {market.attention.length > 0
                  ? 'These are the next actions SecurePay received with your agreements. Open one and we’ll continue from what was actually agreed.'
                  : 'Good. There is nothing SecurePay needs you to act on at this moment. You can review what is moving, or start a new agreement.'}
              </p>

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
                    aria-label="What would you like to agree next?"
                    placeholder="What would you like to agree next?"
                    className="market-start-prompt-input"
                  />
                  <span className="market-start-prompt-help">Buy, sell, hire, get paid, support someone, build or contribute — say it naturally.</span>
                </div>
                <button
                  type="submit"
                  disabled={!agreementDraft.trim()}
                  className="market-start-prompt-arrow"
                  aria-label="Start this agreement"
                >
                  <ArrowRight size={22} />
                </button>
              </form>
            </div>

            <aside className="market-guide-card" aria-label="SecurePay agreement guide summary">
              <span className="market-guide-badge"><ShieldCheck size={14} /> SecurePay is with the agreement</span>
              <h3 className="market-guide-title">Here’s what your agreements are saying today.</h3>
              <p className="mt-2 text-xs leading-5 text-ink/48">This is a view of backend-returned agreement activity — not a second wallet, priority engine or release authority.</p>
              <div className="market-guide-stats">
                <div className="market-guide-stat"><span>Needs you</span><strong>{market.attention.length}</strong></div>
                <div className="market-guide-stat"><span>Waiting</span><strong>{market.waiting.length}</strong></div>
                <div className="market-guide-stat"><span>In progress</span><strong>{market.active.length}</strong></div>
                <div className="market-guide-stat"><span>Recent records</span><strong>{market.completed.length}</strong></div>
              </div>
            </aside>
          </section>

          <section className="market-search-card" aria-label="Find something in your Market">
            <label className="flex min-h-14 items-center gap-3 rounded-xl px-3">
              <Search size={19} className="shrink-0 text-green-700/45" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Find an agreement, person, KSNumber or reference"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35"
              />
            </label>
          </section>

          <MarketSection eyebrow="Needs your attention" title="Do these next" icon={<Sparkles size={19} />} items={filter(market.attention)} empty="No agreement needs an action from you right now." attention />
          <MarketSection eyebrow="Waiting" title="SecurePay is waiting on someone or something else" icon={<Clock3 size={19} />} items={filter(market.waiting)} empty="Nothing is currently waiting." />
          {filter(market.active).length > 0 && <MarketSection eyebrow="Active" title="In progress" icon={<UsersRound size={19} />} items={filter(market.active)} empty="No other active agreements." />}
          <MarketSection eyebrow="Recently completed" title="Your recent records" icon={<FileCheck2 size={19} />} items={filter(market.completed).slice(0, 6)} empty="Completed agreements will stay available here as records." quiet />

          <section className="grid gap-4 md:grid-cols-3" aria-label="Market records, money flows and opportunities">
            <Link to="/market/flows" className="market-link-card group">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-green-700">Money Flows</p>
                <h2 className="mt-2 font-display text-2xl leading-none">How the agreement moves money</h2>
                <p className="mt-2 text-sm leading-6 text-ink/52">See how the four agreement money shapes fit together without changing your current trade.</p>
              </div>
              <ArrowRight size={18} className="text-green-700 transition group-hover:translate-x-1" />
            </Link>
            <Link to="/opportunities" className="market-link-card is-life group">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-orange-700">Opportunities</p>
                <h2 className="mt-2 font-display text-2xl leading-none">What may be worth exploring</h2>
                <p className="mt-2 text-sm leading-6 text-ink/52">See what is waiting for you, what you passed on and what you claimed. An opportunity is never the same as an agreement.</p>
              </div>
              <ArrowRight size={18} className="text-orange-700 transition group-hover:translate-x-1" />
            </Link>
            <Link to="/market/statements" className="market-link-card group">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-green-700">Statements</p>
                <h2 className="mt-2 font-display text-2xl leading-none">The record behind the activity</h2>
                <p className="mt-2 text-sm leading-6 text-ink/52">Open the backend-posted record for an authorised KSNumber without creating a combined wallet.</p>
              </div>
              <ArrowRight size={18} className="text-green-700 transition group-hover:translate-x-1" />
            </Link>
          </section>

          <section className="market-section-shell" aria-labelledby="market-activity-heading">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-green-700">Recent activity</p>
                <h2 id="market-activity-heading" className="market-section-title">What happened</h2>
              </div>
              <button type="button" onClick={retry} className="rounded-full border border-green-700/10 bg-white px-3 py-2 text-xs font-semibold text-green-700">Refresh</button>
            </div>
            {!activityAvailable ? (
              <div className="mt-4"><TraderUnavailableState title="Activity unavailable" detail="SecurePay did not return recent activity, so My Market is not substituting demo transactions." /></div>
            ) : market.recentActivity.length === 0 ? (
              <div className="mt-4"><TraderEmptyState title="No recorded activity yet" detail="Backend-recorded activity will appear here." /></div>
            ) : (
              <ul className="mt-4 divide-y divide-green-700/8">
                {market.recentActivity.map(item => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink/80">{item.description}</p>
                      <p className="mt-0.5 text-xs capitalize text-ink/40">{item.detail}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {item.amountDisplay && <p className="text-sm font-semibold tabular-nums text-green-800">{item.amountDisplay}</p>}
                      <time className="text-[11px] text-ink/35">{new Date(item.occurredAt).toLocaleDateString('en-KE')}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="market-section-shell" aria-label="Your SecurePay identities">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-green-700">Your place in the Market</p>
            <h2 className="market-section-title mt-1">The identities you can see here</h2>
            {!identitiesAvailable ? (
              <div className="mt-4"><TraderUnavailableState title="Other Market identities are unavailable" detail="SecurePay could not confirm additional viewable KSNumbers. This page will not create one locally." /></div>
            ) : !identities ? (
              <div className="mt-4"><TraderLoadingState /></div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {identities.map(identity => (
                  <span key={identity.ksNumber} className={`rounded-full border px-3.5 py-2 text-xs shadow-sm ${identity.current ? 'border-green-700/20 bg-green-50 text-green-900' : 'border-green-700/10 bg-white text-ink/70'}`}>
                    <strong>{identity.displayName || identity.ksNumber}</strong>
                    <span className="ml-2 text-ink/40">{identity.current ? 'Current' : identity.canAct ? 'Can act' : 'View only'}</span>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 max-w-3xl text-xs leading-5 text-ink/45">My Market is a view, not a super-KSNumber. Agreements, money and authority keep their exact backend identity.</p>
          </section>
        </div>
      )}
    </TraderShell>
  );
}

function MarketSection({ eyebrow, title, icon, items, empty, attention = false, quiet = false }: { eyebrow: string; title: string; icon: ReactNode; items: MarketItem[]; empty: string; attention?: boolean; quiet?: boolean }) {
  return (
    <section aria-label={eyebrow} className={`market-section-shell ${attention ? 'is-attention' : ''}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="market-section-icon">{icon}</span>
        <div>
          <p className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${attention ? 'text-orange-700' : 'text-green-700'}`}>{eyebrow}</p>
          <h2 className="market-section-title">{title}</h2>
        </div>
      </div>
      {items.length === 0 ? (
        <div className={`rounded-2xl border px-4 py-5 text-sm leading-6 ${quiet ? 'border-ink/8 bg-white/70 text-ink/45' : attention ? 'border-orange-200/60 bg-white/65 text-ink/55' : 'border-green-700/10 bg-white/65 text-ink/55'}`}>{empty}</div>
      ) : (
        <div className="space-y-2.5">{items.map(item => <MarketRow key={item.agreementId} item={item} attention={attention} quiet={quiet} />)}</div>
      )}
    </section>
  );
}

function MarketRow({ item, attention, quiet }: { item: MarketItem; attention: boolean; quiet: boolean }) {
  const href = item.primaryAction?.href || `/agreements/${encodeURIComponent(item.agreementId)}`;
  return (
    <Link to={href} className={`market-row-living group ${attention ? 'is-attention' : ''} ${quiet ? 'opacity-85' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate text-sm font-bold text-ink/85">{item.title}</h3>
          {item.amountDisplay && <span className="text-xs font-semibold tabular-nums text-green-800/70">{item.amountDisplay}</span>}
        </div>
        <p className={`mt-1 text-sm ${attention ? 'font-semibold text-orange-800' : 'text-ink/55'}`}>{item.primaryAction ? `Next: ${item.primaryAction.label}` : item.waitingOn || item.humanStatus}</p>
        <p className="mt-1 truncate text-xs text-ink/35">{[item.counterparty, item.role].filter(Boolean).join(' · ') || item.publicReference}</p>
      </div>
      <ArrowRight size={18} className={`${attention ? 'text-orange-700' : 'text-green-700'} shrink-0 transition group-hover:translate-x-1`} />
    </Link>
  );
}
