import { useCallback, useEffect, useState } from 'react';
import { getActivityHistory, listMyAgreements } from '../api/securepayEndpoints';
import type { SecurePayActivity, CurrentUserAgreementSummary } from '../api/securepayTypes';
import { useAuth } from './auth';

export type TraderLoadState = 'loading' | 'ready' | 'error';

export const TRADER_WORKSPACE_PAGE_SIZE = 20;

// Backed by GET /api/v1/me/agreements — the R0.5 current-user Agreement Core
// projection. Role, counterparty, and deadline are shown only when the
// backend returns them; nothing here is inferred from creator, timestamps,
// or status.
export function useTraderWorkspace() {
  const { session } = useAuth();
  const [state, setState] = useState<TraderLoadState>('loading');
  const [agreements, setAgreements] = useState<CurrentUserAgreementSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activity, setActivity] = useState<SecurePayActivity[]>([]);
  const [activityAvailable, setActivityAvailable] = useState(true);

  const load = useCallback(async (targetPage = 0) => {
    if (!session?.accessToken) return;
    setState('loading');
    const [agreementResult, activityResult] = await Promise.all([
      listMyAgreements(targetPage, TRADER_WORKSPACE_PAGE_SIZE, session.accessToken),
      getActivityHistory(session.accessToken),
    ]);
    if (!agreementResult.ok || !agreementResult.data) {
      setAgreements([]);
      setPage(0);
      setTotalElements(0);
      setActivity([]);
      setActivityAvailable(false);
      setState('error');
      return;
    }
    setAgreements(agreementResult.data.items);
    setPage(agreementResult.data.page);
    setTotalElements(agreementResult.data.totalElements);
    setActivity(activityResult.ok && activityResult.data ? activityResult.data : []);
    setActivityAvailable(activityResult.ok);
    setState('ready');
  }, [session?.accessToken]);

  useEffect(() => { void load(0); }, [load]);

  return {
    state,
    agreements,
    page,
    pageSize: TRADER_WORKSPACE_PAGE_SIZE,
    totalElements,
    goToPage: load,
    activity,
    activityAvailable,
    retry: () => load(page),
  };
}
