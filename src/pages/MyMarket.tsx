import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock3, FileCheck2, Search, Sparkles, UsersRound } from 'lucide-react';
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

type MarketView = 'attention' | 'waiting' | 'active' | 'completed';

const viewMeta: Record<MarketView, { label: string; title: string }> = {
  attention: { label: 'Need you', title: 'Needs your attention' },
  waiting: { label: 'Waiting', title: 'Waiting on someone or something' },
  active: { label: 'Active', title: 'In progress' },
  completed: { label: 'Records', title: 'Recent records' },
};

export default function MyMarket() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const { state, agreements, activity, activityAvailable, retry } = useTraderWorkspace();
  const [query, setQuery] = useState('');
  const [agreementDraft, setAgreementDraft] = useState('');
  const [view, setView] = useState<MarketView>('attention');
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
  const normalizedQuery = query.trim().toLowerCase();
  const filter = (items: MarketItem[]) => normalizedQuery
    ? items.filter(item => [item.title, item.purpose, item.counterparty, item.publicReference, item.role]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(normalizedQuery)))
    : items;

  const lists: Record<MarketView, MarketItem[]> = {
    attention: market.attention,
    waiting: market.waiting,
    active: market.active,
    completed: market.completed,
  };
  const visibleItems = filter(lists[view]).slice(0, view === 'completed' ? 8 : 12);

  useEffect(() => {
    if (state !== 'ready') return;
    if (market.attention.length) setView('attention');
    else if (market.waiting.length) setView('waiting');
    else if (market.active.length) setView('active');
    else setView('completed');
  }, [state, market.attention.length, market.waiting.length, market.active.length]);

  const startAgreement = () => {
    const statement = agreementDraft.trim();
    if (!statement) return;
    const intent = createCreationIntentFromText(statement);
    saveCreationIntent(intent);
    navigate('/create/journey', { state: { intent } });
  };

  if (!user || !session) return <Navigate to="/" replace />;

  return (
    <TraderShell actionCount={market.attention.length}>
      <TraderPageHeader
        eyebrow="My Market"
        title={market.attention.length ? <>Your Market <span className="text-orange-700">needs you.</span></> : <>Your Market <span className="text-green-700">at a glance.</span></>}
        description="See what needs you, what is waiting and what is moving. Open only the view you need."
      />

      {state === 'loading' && <TraderLoadingState />}
      {state === 'error' && <TraderErrorState title="My Market could not be loaded" detail="Your agreement workspace is unavailable right now." onRetry={retry} />}

      {state === 'ready' && <div className="space-y-6">
        <section className="trader-home-situation" aria-label="Your Market today">
          <div className="trader-home-situation-copy">
            <p className="trader-home-kicker">Right now</p>
            <h2>{market.attention.length
              ? `${market.attention.length} ${market.attention.length === 1 ? 'agreement needs' : 'agreements need'} your attention.`
              : market.waiting.length
                ? `${market.waiting.length} ${market.waiting.length === 1 ? 'agreement is' : 'agreements are'} waiting.`
                : market.active.length
                  ? `${market.active.length} ${market.active.length === 1 ? 'agreement is' : 'agreements are'} moving.`
                  : 'Your Market is quiet right now.'}</h2>
          </div>
          <div className="trader-home-metrics" aria-label="Market summary">
            {([
              ['attention', 'Need you', market.attention.length],
              ['waiting', 'Waiting', market.waiting.length],
              ['active', 'Active', market.active.length],
              ['completed', 'Records', market.completed.length],
            ] as const).map(([id, label, value]) => (
              <button key={id} type="button" onClick={() => setView(id)} className={`trader-home-metric${view === id ? ' is-active' : ''}${id === 'attention' && value > 0 ? ' is-attention' : ''}`} aria-pressed={view === id}>
                <span>{label}</span><strong>{value}</strong>
              </button>
            ))}
          </div>
        </section>

        <form className="market-start-prompt" aria-label="Start an agreement from your own words" onSubmit={event => { event.preventDefault(); startAgreement(); }}>
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
              rows={1}
              maxLength={420}
              aria-label="What would you like to agree next?"
              placeholder="What would you like to agree next?"
              className="market-start-prompt-input block min-h-[34px] w-full resize-none border-0 bg-transparent p-0 font-display text-[20px] italic leading-tight text-ink outline-none placeholder:text-ink/55 focus:border-0 focus:outline-none focus:ring-0"
            />
            <span className="market-start-prompt-help">Say it naturally.</span>
          </div>
          <button type="submit" disabled={!agreementDraft.trim()} className="market-start-prompt-arrow border-0 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Start this agreement"><ArrowRight size={21} /></button>
        </form>

        <section className="market-search-card" aria-label="Find something in your Market">
          <label className="flex min-h-12 items-center gap-3 rounded-xl px-2">
            <Search size={17} className="shrink-0 text-green-700/45" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find agreement, person, KSNumber or reference" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35" />
          </label>
        </section>

        <section className={`market-section-shell ${view === 'attention' ? 'is-attention' : ''}`} aria-label={viewMeta[view].title}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="market-section-icon">{view === 'attention' ? <Sparkles size={18} /> : view === 'waiting' ? <Clock3 size={18} /> : view === 'active' ? <UsersRound size={18} /> : <FileCheck2 size={18} />}</span>
              <div><p className={`text-[10px] font-extrabold uppercase tracking-[0.14em] ${view === 'attention' ? 'text-orange-700' : 'text-green-700'}`}>{viewMeta[view].label}</p><h2 className="market-section-title">{viewMeta[view].title}</h2></div>
            </div>
            <Link to="/agreements" className="text-xs font-semibold text-green-700">See all</Link>
          </div>
          {visibleItems.length ? <div className="space-y-2">{visibleItems.map(item => <MarketRow key={item.agreementId} item={item} attention={view === 'attention'} quiet={view === 'completed'} />)}</div> : <TraderEmptyState title={`No ${viewMeta[view].label.toLowerCase()} items`} detail={view === 'attention' ? 'Nothing needs your action right now.' : 'Nothing is showing in this view.'} />}
        </section>

        <section className="trader-around-rail" aria-label="More in your Market">
          <Link to="/market/flows"><span>Flows</span><strong>Money shapes</strong><ArrowRight size={14} /></Link>
          <Link to="/market/statements"><span>Statements</span><strong>Posted records</strong><ArrowRight size={14} /></Link>
          <Link to="/opportunities"><span>Opportunities</span><strong>Explore</strong><ArrowRight size={14} /></Link>
        </section>

        <section className="market-section-shell" aria-labelledby="market-activity-heading">
          <div className="flex items-center justify-between gap-4">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-green-700">Recently</p><h2 id="market-activity-heading" className="market-section-title">What happened</h2></div>
            <button type="button" onClick={retry} className="rounded-full border border-green-700/10 bg-white px-3 py-2 text-xs font-semibold text-green-700">Refresh</button>
          </div>
          {!activityAvailable ? <div className="mt-3"><TraderUnavailableState title="Activity unavailable" detail="Your agreements are unchanged." /></div>
            : market.recentActivity.length === 0 ? <div className="mt-3"><TraderEmptyState title="No recent movement" detail="New activity will appear here." /></div>
              : <ul className="mt-2 divide-y divide-green-700/8">{market.recentActivity.slice(0, 2).map(item => <li key={item.id} className="flex items-start justify-between gap-4 py-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink/80">{item.description}</p><p className="mt-0.5 truncate text-xs text-ink/40">{item.detail}</p></div><div className="shrink-0 text-right">{item.amountDisplay && <p className="text-sm font-semibold tabular-nums text-green-800">{item.amountDisplay}</p>}<time className="text-[11px] text-ink/35">{new Date(item.occurredAt).toLocaleDateString('en-KE')}</time></div></li>)}</ul>}
        </section>

        <details className="trader-progressive">
          <summary>Your Market identities</summary>
          <div>
            {!identitiesAvailable ? <TraderUnavailableState title="Other identities unavailable" detail="SecurePay could not confirm additional viewable KSNumbers." />
              : !identities ? <TraderLoadingState />
                : <div className="flex flex-wrap gap-2">{identities.map(identity => <span key={identity.ksNumber} className={`rounded-full border px-3 py-2 text-xs ${identity.current ? 'border-green-700/20 bg-green-50 text-green-900' : 'border-green-700/10 bg-white text-ink/70'}`}><strong>{identity.displayName || identity.ksNumber}</strong><span className="ml-2 text-ink/40">{identity.current ? 'Current' : identity.canAct ? 'Can act' : 'View only'}</span></span>)}</div>}
          </div>
        </details>
      </div>}
    </TraderShell>
  );
}

function MarketRow({ item, attention, quiet }: { item: MarketItem; attention: boolean; quiet: boolean }) {
  const href = item.primaryAction?.href || `/agreements/${encodeURIComponent(item.agreementId)}`;
  return (
    <Link to={href} className={`market-row-living group ${attention ? 'is-attention' : ''} ${quiet ? 'opacity-85' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="truncate text-sm font-bold text-ink/85">{item.title}</h3>{item.amountDisplay && <span className="text-xs font-semibold tabular-nums text-green-800/70">{item.amountDisplay}</span>}</div>
        <p className={`mt-1 text-sm ${attention ? 'font-semibold text-orange-800' : 'text-ink/55'}`}>{item.primaryAction ? `Next: ${item.primaryAction.label}` : item.waitingOn || item.humanStatus}</p>
        <p className="mt-1 truncate text-xs text-ink/35">{[item.counterparty, item.role].filter(Boolean).join(' · ') || item.publicReference}</p>
      </div>
      <ArrowRight size={18} className={`${attention ? 'text-orange-700' : 'text-green-700'} shrink-0 transition group-hover:translate-x-1`} />
    </Link>
  );
}
