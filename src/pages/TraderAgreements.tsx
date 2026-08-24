import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTraderWorkspace } from '../lib/useTraderWorkspace';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderAgreementCard from '../components/trader/TraderAgreementCard';
import { TraderEmptyState, TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';

type AgreementFilter = 'active' | 'all' | 'completed';
const CLOSED_STATUSES = new Set(['CANCELLED', 'EXPIRED']);

export default function TraderAgreements() {
  const { user } = useAuth();
  const { state, agreements, page, pageSize, totalElements, goToPage, retry } = useTraderWorkspace();
  const [filter, setFilter] = useState<AgreementFilter>('active');
  const activeCount = agreements.filter(item => !CLOSED_STATUSES.has(item.status.toUpperCase())).length;
  const completedCount = agreements.filter(item => CLOSED_STATUSES.has(item.status.toUpperCase())).length;
  const visible = useMemo(() => agreements.filter(item => {
    const status = item.status.toUpperCase();
    if (filter === 'active') return !CLOSED_STATUSES.has(status);
    if (filter === 'completed') return CLOSED_STATUSES.has(status);
    return true;
  }), [agreements, filter]);
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  if (!user) return <Navigate to="/" replace />;

  const counts: Record<AgreementFilter, number> = { active: activeCount, all: agreements.length, completed: completedCount };

  return <TraderShell>
    <TraderPageHeader eyebrow="Agreements" title={<>Your <span className="text-green-700">agreements</span></>} description="Open an agreement to see its current state and next action." />

    <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Agreement filters">
      {(['active', 'all', 'completed'] as const).map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold capitalize transition ${filter === item ? 'bg-green-700 text-white shadow-sm' : 'border border-green-700/10 bg-white/80 text-ink/60 hover:border-green-700/25 hover:text-green-800'}`}>{item}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === item ? 'bg-white/18' : 'bg-green-50 text-green-800'}`}>{counts[item]}</span></button>)}
    </div>

    {state === 'loading' && <TraderLoadingState label="Loading agreements…" />}
    {state === 'error' && <TraderErrorState title="Agreements could not be loaded" detail="This list is unavailable right now." onRetry={retry} />}
    {state === 'ready' && <section className="market-section-shell">
      <div className="mb-3 hidden grid-cols-[minmax(0,1.6fr)_minmax(130px,.7fr)_minmax(150px,.8fr)_auto] gap-4 px-4 text-[10px] font-extrabold uppercase tracking-[0.15em] text-green-800/45 md:grid"><span>Agreement</span><span>Your role</span><span>Status</span><span className="text-right">Amount</span></div>
      {visible.length ? visible.map(item => <TraderAgreementCard key={item.agreementId} agreement={item} />) : <TraderEmptyState title={filter === 'active' ? 'No active agreements' : 'Nothing here'} detail={filter === 'active' ? 'Start an agreement whenever you are ready.' : 'No agreements match this view.'} />}
    </section>}

    {state === 'ready' && totalElements > pageSize && <div className="mt-3 flex items-center justify-between text-sm"><button type="button" disabled={page <= 0} onClick={() => void goToPage(page - 1)} className="min-h-10 rounded-full border border-green-700/10 bg-white/80 px-4 disabled:opacity-40">Previous</button><span className="text-xs text-ink/45">{page + 1} / {totalPages}</span><button type="button" disabled={page + 1 >= totalPages} onClick={() => void goToPage(page + 1)} className="min-h-10 rounded-full border border-green-700/10 bg-white/80 px-4 disabled:opacity-40">Next</button></div>}
  </TraderShell>;
}
