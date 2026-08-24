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
  const visible = useMemo(() => agreements.filter(item => {
    const status = item.status.toUpperCase();
    if (filter === 'active') return !CLOSED_STATUSES.has(status);
    if (filter === 'completed') return CLOSED_STATUSES.has(status);
    return true;
  }), [agreements, filter]);
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  if (!user) return <Navigate to="/" replace />;

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Your agreements"
      title={<>Every agreement, <span className="text-green-700">still connected to what was agreed.</span></>}
      description="One clear place for every agreement you take part in, whatever your role. Open one to see what happened, what it means and what comes next."
    />
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Agreement filters">
      {(['active', 'all', 'completed'] as const).map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`min-h-11 whitespace-nowrap rounded-full px-5 text-sm font-semibold capitalize transition ${filter === item ? 'bg-green-700 text-white shadow-sm' : 'border border-green-700/10 bg-white/80 text-ink/60 hover:border-green-700/25 hover:text-green-800'}`}>{item}</button>)}
    </div>
    {state === 'loading' && <TraderLoadingState label="Loading your agreements…" />}
    {state === 'error' && <TraderErrorState title="Agreements could not be loaded" detail="SecurePay could not retrieve this list. Nothing was changed. Check your connection and try again." onRetry={retry} />}
    {state === 'ready' && <section className="market-section-shell">
      <div className="mb-4 hidden grid-cols-[minmax(0,1.6fr)_minmax(130px,.7fr)_minmax(150px,.8fr)_auto] gap-4 px-4 text-[10px] font-extrabold uppercase tracking-[0.15em] text-green-800/45 md:grid"><span>Agreement</span><span>Your role</span><span>Status</span><span className="text-right">Amount</span></div>
      {visible.length ? visible.map(item => <TraderAgreementCard key={item.agreementId} agreement={item} />) : <TraderEmptyState title={filter === 'active' ? 'No active agreements' : 'Nothing here yet'} detail={filter === 'active' ? 'You have no active agreements right now. Start with what you want to agree whenever you are ready.' : 'Agreements matching this view will appear here.'} />}
    </section>}
    {state === 'ready' && totalElements > pageSize && <div className="mt-4 flex items-center justify-between text-sm">
      <button type="button" disabled={page <= 0} onClick={() => void goToPage(page - 1)} className="min-h-11 rounded-full border border-green-700/10 bg-white/80 px-4 disabled:opacity-40">Previous</button>
      <span className="text-ink/50">Page {page + 1} of {totalPages}</span>
      <button type="button" disabled={page + 1 >= totalPages} onClick={() => void goToPage(page + 1)} className="min-h-11 rounded-full border border-green-700/10 bg-white/80 px-4 disabled:opacity-40">Next</button>
    </div>}
    <p className="mt-5 max-w-3xl text-xs leading-5 text-ink/40">Role, counterparty and next-action fields are only shown when the backend provides them. SecurePay does not infer them from who created the agreement.</p>
  </TraderShell>;
}
