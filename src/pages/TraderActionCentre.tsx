import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Clock3, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { listMyActions } from '../api/securepayEndpoints';
import type { CurrentUserAction } from '../api/securepayTypes';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';

type LoadState = 'loading' | 'ready' | 'error';
const PAGE_SIZE = 20;
const MAPPED_ACTION_LABELS: Record<string, string> = { RECONFIRM_AGREEMENT_VERSION: 'Review and reconfirm' };

export default function TraderActionCentre() {
  const { user, session } = useAuth();
  const [state, setState] = useState<LoadState>('loading');
  const [actions, setActions] = useState<CurrentUserAction[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(async (targetPage: number) => {
    if (!session?.accessToken) return;
    setState('loading');
    const result = await listMyActions(targetPage, PAGE_SIZE, session.accessToken);
    if (!result.ok || !result.data) { setActions([]); setState('error'); return; }
    setActions(result.data.items); setPage(result.data.page); setTotalElements(result.data.totalElements); setState('ready');
  }, [session?.accessToken]);

  useEffect(() => { void load(0); }, [load]);
  if (!user) return <Navigate to="/" replace />;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  return <TraderShell actionCount={totalElements}>
    <TraderPageHeader eyebrow="Actions" title={actions.length ? <><span className="text-orange-700">{totalElements}</span> need you</> : <>What <span className="text-green-700">needs you</span></>} description="Only actions returned by SecurePay appear here." />

    <section className="market-section-shell is-attention">
      <div className="mb-3 flex items-center gap-3"><span className="market-section-icon"><Sparkles size={18} /></span><div><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-700">Next</p><h2 className="market-section-title">Do these next</h2></div></div>
      {state === 'loading' && <TraderLoadingState label="Loading actions…" />}
      {state === 'error' && <TraderErrorState title="Actions could not be loaded" detail="Your action list is unavailable right now." onRetry={() => void load(page)} />}
      {state === 'ready' && (actions.length ? <ul className="space-y-2">{actions.map((action, index) => {
        const mappedLabel = MAPPED_ACTION_LABELS[action.actionCode];
        return <li key={`${action.agreementId}-${action.actionCode}-${index}`} className="market-row-living is-attention flex-col items-stretch sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-orange-700">{action.agreementReference}</p>{action.deadline && <span className="inline-flex items-center gap-1 text-[10px] text-ink/40"><Clock3 size={11} /> {new Date(action.deadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</span>}</div>
            <h3 className="mt-1 truncate font-display text-xl font-semibold leading-none text-ink">{action.agreementTitle}</h3>
            <p className="mt-1 text-sm text-ink/58">{action.reason}</p>
          </div>
          <Link to={`/agreements/${encodeURIComponent(action.agreementId)}`} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-green-700/15 bg-white px-4 text-sm font-semibold text-green-700 shadow-sm">{mappedLabel ?? 'Open'} <ArrowRight size={14} /></Link>
        </li>;
      })}</ul> : <TraderEmptyState title="Nothing needs you right now" detail="You are up to date." />)}
    </section>

    {state === 'ready' && totalElements > PAGE_SIZE && <div className="mt-3 flex items-center justify-between text-sm"><button type="button" disabled={page <= 0} onClick={() => void load(page - 1)} className="min-h-10 rounded-full border border-green-700/10 bg-white/80 px-4 disabled:opacity-40">Previous</button><span className="text-xs text-ink/45">{page + 1} / {totalPages}</span><button type="button" disabled={page + 1 >= totalPages} onClick={() => void load(page + 1)} className="min-h-10 rounded-full border border-green-700/10 bg-white/80 px-4 disabled:opacity-40">Next</button></div>}
  </TraderShell>;
}
