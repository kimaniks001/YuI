import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Clock3 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { listMyActions } from '../api/securepayEndpoints';
import type { CurrentUserAction } from '../api/securepayTypes';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';

type LoadState = 'loading' | 'ready' | 'error';

const PAGE_SIZE = 20;

// The only current backend action code with an already-built destination in
// this phase: the existing Agreement Detail confirmation engine. Every other
// current or future actionCode fails closed to a safe informative card with
// no invented command — R0.5 does not build obligations/milestones UX.
const MAPPED_ACTION_LABELS: Record<string, string> = {
  RECONFIRM_AGREEMENT_VERSION: 'Review and reconfirm',
};

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
    if (!result.ok || !result.data) {
      setActions([]);
      setState('error');
      return;
    }
    setActions(result.data.items);
    setPage(result.data.page);
    setTotalElements(result.data.totalElements);
    setState('ready');
  }, [session?.accessToken]);

  useEffect(() => { void load(0); }, [load]);

  if (!user) return <Navigate to="/" replace />;

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  return <TraderShell>
    <TraderPageHeader eyebrow="Needs your action" title="Action Centre" description="Every supported next action across every agreement you take part in, in the order SecurePay's backend already ranks them." />
    <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
      {state === 'loading' && <TraderLoadingState label="Loading your actions…" />}
      {state === 'error' && <TraderErrorState title="Your action feed could not be loaded" detail="SecurePay could not retrieve your actions. Nothing was changed. Check your connection and try again." onRetry={() => void load(page)} />}
      {state === 'ready' && (actions.length
        ? <ul className="divide-y divide-ink/8">
            {actions.map((action, index) => {
              const mappedLabel = MAPPED_ACTION_LABELS[action.actionCode];
              return (
                <li key={`${action.agreementId}-${action.actionCode}-${index}`} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">{action.agreementReference}</p>
                    <h3 className="mt-1 truncate font-semibold text-ink">{action.agreementTitle}</h3>
                    <p className="mt-1 text-sm text-ink/60">{action.reason}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink/40">
                      <span className="inline-flex items-center rounded-full bg-ink/5 px-2 py-0.5 font-medium capitalize">{action.attentionClass.toLowerCase()} priority</span>
                      {action.deadline && <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {new Date(action.deadline).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    </div>
                  </div>
                  <Link to={`/agreements/${encodeURIComponent(action.agreementId)}`} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-green-700/20 px-4 text-sm font-semibold text-green-700">
                    {mappedLabel ?? 'View agreement'} <ArrowRight size={14} />
                  </Link>
                </li>
              );
            })}
          </ul>
        : <TraderEmptyState title="Nothing needs your attention right now" detail="When an agreement you take part in has a supported next action, it will appear here." />)}
    </section>
    {state === 'ready' && totalElements > PAGE_SIZE && <div className="mt-4 flex items-center justify-between text-sm">
      <button type="button" disabled={page <= 0} onClick={() => void load(page - 1)} className="min-h-11 rounded-full border border-ink/10 px-4 disabled:opacity-40">Previous</button>
      <span className="text-ink/50">Page {page + 1} of {totalPages}</span>
      <button type="button" disabled={page + 1 >= totalPages} onClick={() => void load(page + 1)} className="min-h-11 rounded-full border border-ink/10 px-4 disabled:opacity-40">Next</button>
    </div>}
  </TraderShell>;
}
