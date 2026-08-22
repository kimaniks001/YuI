import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Loader2, RefreshCw, Split, Users } from 'lucide-react';
import { getPrivateGroupSecureLink } from '../../api/securepayEndpoints';
import {
  createDistributionPlan,
  distributionPlanGovernanceReference,
  getDistributionPlan,
  governanceLockDistributionPlan,
  listDistributionPlans,
  listGroupApprovalRequests,
  lockDistributionPlan,
  submitDistributionPlan,
} from '../../api/secureflowEndpoints';
import type {
  SecurePayApprovalRequestSummary,
  SecurePayDistributionPlanDetail,
  SecurePayDistributionPlanSummary,
  SecurePayDistributionMoneyFlowType,
} from '../../api/secureflowTypes';
import { formatMinorMoney } from '../../lib/formatMinorMoney';
import GroupSecureFlowGovernancePanel from './GroupSecureFlowGovernancePanel';
import SecureFlowPlanEditor from './SecureFlowPlanEditor';

type LoadState = 'loading' | 'ready' | 'error';

type PlanAction = { planId: string; action: 'submit' | 'lock' } | null;

function flowLabel(flow: SecurePayDistributionMoneyFlowType) {
  return flow === 'GROUP_SECURE_FLOW' ? 'Group SecureFlow' : 'SecureFlow';
}

function lifecycleLabel(value: string) {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    LOCKED: 'Locked',
    SUPERSEDED: 'Superseded',
    CANCELLED: 'Cancelled',
  };
  const normalized = value.split('_').join(' ').toLowerCase();
  return labels[value] ?? normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function positiveMinor(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const minor = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}

export default function SecureFlowSection({
  agreementId,
  authHeader,
  groupSecureLinkId,
}: {
  agreementId: string;
  authHeader?: string;
  groupSecureLinkId?: string | null;
}) {
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<SecurePayDistributionPlanSummary[]>([]);
  const [details, setDetails] = useState<Record<string, SecurePayDistributionPlanDetail>>({});
  const [approvals, setApprovals] = useState<SecurePayApprovalRequestSummary[]>([]);
  const [resolvedGroupSecureLinkId, setResolvedGroupSecureLinkId] = useState<string | null>(groupSecureLinkId ?? null);
  const [creating, setCreating] = useState<SecurePayDistributionMoneyFlowType | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [amountKes, setAmountKes] = useState('');
  const [planAction, setPlanAction] = useState<PlanAction>(null);
  const [planActionError, setPlanActionError] = useState<Record<string, string>>({});
  const createKeyRef = useRef(crypto.randomUUID());
  const actionKeyRef = useRef<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!authHeader) return;
    setState('loading');
    setError(null);
    const planResult = await listDistributionPlans(agreementId, authHeader);
    if (!planResult.ok || !planResult.data) {
      setState('error');
      setError(planResult.error || 'SecurePay could not load the distribution plans for this agreement.');
      return;
    }

    setPlans(planResult.data);

    const groupIdFromPlan = planResult.data.find(plan => plan.moneyFlowType === 'GROUP_SECURE_FLOW')?.groupSecureLinkId ?? null;
    if (groupSecureLinkId) {
      setResolvedGroupSecureLinkId(groupSecureLinkId);
    } else if (groupIdFromPlan) {
      setResolvedGroupSecureLinkId(groupIdFromPlan);
    } else {
      const groupResult = await getPrivateGroupSecureLink(agreementId, authHeader);
      setResolvedGroupSecureLinkId(
        groupResult.ok && groupResult.data && groupResult.data.agreementId === agreementId
          ? groupResult.data.id
          : null,
      );
    }

    const detailResults = await Promise.all(
      planResult.data.map(plan => getDistributionPlan(agreementId, plan.id, authHeader)),
    );
    const nextDetails: Record<string, SecurePayDistributionPlanDetail> = {};
    detailResults.forEach((result, index) => {
      if (result.ok && result.data) nextDetails[planResult.data![index].id] = result.data;
    });
    setDetails(nextDetails);

    if (planResult.data.some(plan => plan.moneyFlowType === 'GROUP_SECURE_FLOW')) {
      const approvalResult = await listGroupApprovalRequests(agreementId, authHeader);
      setApprovals(approvalResult.ok && approvalResult.data ? approvalResult.data : []);
    } else {
      setApprovals([]);
    }
    setState('ready');
  }, [agreementId, authHeader, groupSecureLinkId]);

  useEffect(() => { void load(); }, [load]);

  const existingTypes = useMemo(() => new Set(plans.map(plan => plan.moneyFlowType)), [plans]);
  const createAmountMinor = positiveMinor(amountKes);

  const createPlan = async (moneyFlowType: SecurePayDistributionMoneyFlowType) => {
    if (!authHeader || creating || createAmountMinor == null) return;
    if (moneyFlowType === 'GROUP_SECURE_FLOW' && !resolvedGroupSecureLinkId) {
      setCreateError('A Group SecureLink must exist before a Group SecureFlow plan can be created.');
      return;
    }
    setCreating(moneyFlowType);
    setCreateError(null);
    const result = await createDistributionPlan(agreementId, {
      idempotencyKey: createKeyRef.current,
      moneyFlowType,
      distributableAmountMinor: createAmountMinor,
      ...(moneyFlowType === 'GROUP_SECURE_FLOW' ? { groupSecureLinkId: resolvedGroupSecureLinkId } : {}),
    }, authHeader);
    if (!result.ok) {
      setCreateError(result.error || 'SecurePay could not start this distribution plan.');
      setCreating(null);
      return;
    }
    createKeyRef.current = crypto.randomUUID();
    setAmountKes('');
    setCreating(null);
    await load();
  };

  const keyFor = (planId: string) => {
    if (!actionKeyRef.current[planId]) actionKeyRef.current[planId] = crypto.randomUUID();
    return actionKeyRef.current[planId];
  };

  const submitPlan = async (detail: SecurePayDistributionPlanDetail) => {
    if (!authHeader || planAction) return;
    if (!detail.allocations.length) {
      setPlanActionError(current => ({ ...current, [detail.plan.id]: 'Add and save at least one recipient before submitting this plan.' }));
      return;
    }
    setPlanAction({ planId: detail.plan.id, action: 'submit' });
    setPlanActionError(current => ({ ...current, [detail.plan.id]: '' }));
    const result = await submitDistributionPlan(
      agreementId,
      detail.plan.id,
      detail.version.planVersion,
      { idempotencyKey: keyFor(detail.plan.id) },
      authHeader,
    );
    if (!result.ok) {
      setPlanActionError(current => ({ ...current, [detail.plan.id]: result.error || 'SecurePay could not submit this plan.' }));
      setPlanAction(null);
      return;
    }
    actionKeyRef.current[detail.plan.id] = crypto.randomUUID();
    setPlanAction(null);
    await load();
  };

  const lockPlan = async (detail: SecurePayDistributionPlanDetail, approvedRequest?: SecurePayApprovalRequestSummary) => {
    if (!authHeader || planAction) return;
    setPlanAction({ planId: detail.plan.id, action: 'lock' });
    setPlanActionError(current => ({ ...current, [detail.plan.id]: '' }));
    const key = keyFor(detail.plan.id);
    const result = detail.plan.moneyFlowType === 'GROUP_SECURE_FLOW'
      ? approvedRequest
        ? await governanceLockDistributionPlan(
            agreementId,
            detail.plan.id,
            detail.version.planVersion,
            { governanceRequestId: approvedRequest.requestId, idempotencyKey: key },
            authHeader,
          )
        : { ok: false as const, error: 'An approved Group SecureFlow governance request is required before locking.' }
      : await lockDistributionPlan(
          agreementId,
          detail.plan.id,
          detail.version.planVersion,
          { idempotencyKey: key },
          authHeader,
        );
    if (!result.ok) {
      setPlanActionError(current => ({ ...current, [detail.plan.id]: result.error || 'SecurePay could not lock this plan.' }));
      setPlanAction(null);
      return;
    }
    actionKeyRef.current[detail.plan.id] = crypto.randomUUID();
    setPlanAction(null);
    await load();
  };

  if (!authHeader) return null;

  return (
    <section aria-labelledby="secureflow-heading" className="rounded-2xl border border-[#1a1a1a]/8 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#3a7a1f]">Pay more than one person</p>
          <h2 id="secureflow-heading" className="mt-1 font-display text-2xl font-semibold text-[#1a1a1a]">SecureFlow</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1a1a1a]/55">Define who should receive what from this agreement. SecurePay keeps the plan, approvals and money movement separate so each step stays clear.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={state === 'loading'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#1a1a1a]/10 px-4 text-sm font-semibold text-[#1a1a1a]/65 disabled:opacity-50">
          <RefreshCw size={15} className={state === 'loading' ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {state === 'loading' && <div className="mt-6 flex items-center gap-2 text-sm text-[#1a1a1a]/45"><Loader2 size={16} className="animate-spin" /> Loading distribution plans…</div>}
      {state === 'error' && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {state === 'ready' && (
        <div className="mt-6 space-y-5">
          {plans.length === 0 && (
            <div className="rounded-xl bg-[#f8f5ed] p-4 text-sm leading-6 text-[#1a1a1a]/60">No distribution plan has been created for this agreement yet.</div>
          )}

          {plans.map(plan => {
            const detail = details[plan.id];
            const amount = detail ? formatMinorMoney(detail.plan.currency, detail.version.distributableAmountMinor) : null;
            const relevantApprovals = plan.moneyFlowType === 'GROUP_SECURE_FLOW' && detail
              ? approvals.filter(item =>
                  item.governedActionType === 'APPROVE_DISTRIBUTION_PLAN'
                  && item.subjectReference === distributionPlanGovernanceReference(plan.id, detail.version.planVersion),
                )
              : [];
            const approvedRequest = relevantApprovals.find(item => item.status === 'APPROVED');
            const busy = planAction?.planId === plan.id;
            return (
              <article key={plan.id} className="rounded-2xl border border-[#1a1a1a]/8 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edf6e8] text-[#3a7a1f]">
                      {plan.moneyFlowType === 'GROUP_SECURE_FLOW' ? <Users size={18} /> : <Split size={18} />}
                    </span>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a]">{flowLabel(plan.moneyFlowType)}</h3>
                      <p className="mt-1 text-xs text-[#1a1a1a]/45">{lifecycleLabel(plan.lifecycleStatus)}</p>
                    </div>
                  </div>
                  {amount && <p className="font-semibold tabular-nums text-[#1a1a1a]">{amount}</p>}
                </div>

                {detail ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl bg-[#faf9f5] p-3"><p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/35">Version</p><p className="mt-1 text-sm font-medium">{detail.version.planVersion}</p></div>
                      <div className="rounded-xl bg-[#faf9f5] p-3"><p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/35">Recipients</p><p className="mt-1 text-sm font-medium">{detail.allocations.length}</p></div>
                      <div className="rounded-xl bg-[#faf9f5] p-3"><p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/35">Plan state</p><p className="mt-1 text-sm font-medium">{lifecycleLabel(detail.version.lifecycleStatus)}</p></div>
                    </div>
                    {detail.allocations.length > 0 && (
                      <ul className="divide-y divide-[#1a1a1a]/8 rounded-xl border border-[#1a1a1a]/8">
                        {detail.allocations.map(allocation => (
                          <li key={allocation.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div><p className="text-sm font-medium text-[#1a1a1a]">{allocation.purposeTitle}</p><p className="text-xs text-[#1a1a1a]/45">{allocation.beneficiaryKsNumber}</p></div>
                            <p className="text-sm font-semibold tabular-nums text-[#1a1a1a]">{formatMinorMoney(detail.plan.currency, allocation.computedAmountMinor) ?? 'Amount unavailable'}</p>
                          </li>
                        ))}
                      </ul>
                    )}

                    <SecureFlowPlanEditor agreementId={agreementId} authHeader={authHeader} detail={detail} onSaved={load} />

                    {detail.version.lifecycleStatus === 'DRAFT' && (
                      <button type="button" onClick={() => void submitPlan(detail)} disabled={busy || !detail.allocations.length} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-4 text-sm font-semibold text-white disabled:opacity-40">
                        {busy && planAction?.action === 'submit' && <Loader2 size={15} className="animate-spin" />}
                        {busy && planAction?.action === 'submit' ? 'Submitting…' : 'Submit plan'}
                      </button>
                    )}

                    {plan.moneyFlowType === 'GROUP_SECURE_FLOW' && detail.version.lifecycleStatus === 'SUBMITTED' && (
                      <GroupSecureFlowGovernancePanel
                        agreementId={agreementId}
                        authHeader={authHeader}
                        detail={detail}
                        requests={approvals}
                        onChanged={load}
                      />
                    )}

                    {detail.version.lifecycleStatus === 'SUBMITTED' && (
                      <div className="space-y-2">
                        {plan.moneyFlowType === 'GROUP_SECURE_FLOW' && !approvedRequest && (
                          <p className="text-xs leading-5 text-amber-700">This plan is waiting for backend approval of this exact Group SecureFlow plan version before it can be locked.</p>
                        )}
                        <button type="button" onClick={() => void lockPlan(detail, approvedRequest)} disabled={busy || (plan.moneyFlowType === 'GROUP_SECURE_FLOW' && !approvedRequest)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-4 text-sm font-semibold text-white disabled:opacity-40">
                          {busy && planAction?.action === 'lock' && <Loader2 size={15} className="animate-spin" />}
                          {busy && planAction?.action === 'lock' ? 'Locking…' : plan.moneyFlowType === 'GROUP_SECURE_FLOW' ? 'Lock approved group plan' : 'Lock plan'}
                        </button>
                      </div>
                    )}

                    {planActionError[plan.id] && <p role="alert" className="text-sm text-red-700">{planActionError[plan.id]}</p>}

                    {plan.moneyFlowType === 'GROUP_SECURE_FLOW' && (
                      <p className="text-xs leading-5 text-[#1a1a1a]/45">Governance requests visible to you for this exact version: {relevantApprovals.length}. Approval and quorum state comes from SecurePayAPI.</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#1a1a1a]/45">Plan details are temporarily unavailable.</p>
                )}
              </article>
            );
          })}

          {(!existingTypes.has('SECURE_FLOW') || !existingTypes.has('GROUP_SECURE_FLOW')) && (
            <div className="space-y-3 rounded-xl border border-[#1a1a1a]/8 bg-[#faf9f5] p-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-[#1a1a1a]/70">Total amount to distribute (KES)</span>
                <input inputMode="decimal" value={amountKes} onChange={event => { setAmountKes(event.target.value); setCreateError(null); }} placeholder="0.00" className="w-full max-w-xs rounded-xl border border-[#1a1a1a]/12 bg-white px-3.5 py-3 text-sm" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {!existingTypes.has('SECURE_FLOW') && (
                  <button type="button" onClick={() => void createPlan('SECURE_FLOW')} disabled={Boolean(creating) || createAmountMinor == null} className="flex min-h-12 items-center justify-between rounded-xl border border-[#3a7a1f]/25 bg-[#f4faef] px-4 text-left text-sm font-semibold text-[#2f6819] disabled:opacity-50">
                    <span>Start a SecureFlow plan</span>{creating === 'SECURE_FLOW' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  </button>
                )}
                {!existingTypes.has('GROUP_SECURE_FLOW') && (
                  <button type="button" onClick={() => void createPlan('GROUP_SECURE_FLOW')} disabled={Boolean(creating) || !resolvedGroupSecureLinkId || createAmountMinor == null} className="flex min-h-12 items-center justify-between rounded-xl border border-[#1a1a1a]/10 px-4 text-left text-sm font-semibold text-[#1a1a1a]/65 disabled:opacity-40">
                    <span>{resolvedGroupSecureLinkId ? 'Start a Group SecureFlow plan' : 'Group SecureFlow needs a Group SecureLink'}</span>{creating === 'GROUP_SECURE_FLOW' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  </button>
                )}
              </div>
            </div>
          )}
          {createError && <p role="alert" className="text-sm text-red-700">{createError}</p>}
          <p className="text-xs leading-5 text-[#1a1a1a]/40">Creating, submitting or locking a plan does not itself mean money has moved. Funding, release and settlement remain backend-authoritative states.</p>
        </div>
      )}
    </section>
  );
}
