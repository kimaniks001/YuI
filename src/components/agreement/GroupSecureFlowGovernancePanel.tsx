import { useMemo, useRef, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import {
  distributionPlanGovernanceReference,
  openGroupApprovalRequest,
  submitGroupApprovalDecision,
} from '../../api/secureflowEndpoints';
import LivingSecurePayMark from '../LivingSecurePayMark';
import type {
  SecurePayApprovalDecision,
  SecurePayApprovalRequestSummary,
  SecurePayDistributionPlanDetail,
} from '../../api/secureflowTypes';

export default function GroupSecureFlowGovernancePanel({
  agreementId,
  authHeader,
  detail,
  requests,
  onChanged,
}: {
  agreementId: string;
  authHeader: string;
  detail: SecurePayDistributionPlanDetail;
  requests: SecurePayApprovalRequestSummary[];
  onChanged: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const openKeyRef = useRef(crypto.randomUUID());
  const decisionKeysRef = useRef<Record<string, string>>({});

  const subjectReference = distributionPlanGovernanceReference(detail.plan.id, detail.version.planVersion);
  const planRequests = useMemo(
    () => requests.filter(request =>
      request.governedActionType === 'APPROVE_DISTRIBUTION_PLAN'
      && request.subjectReference === subjectReference,
    ),
    [requests, subjectReference],
  );
  const currentRequest = planRequests.find(request => request.status === 'PENDING')
    ?? planRequests.find(request => request.status === 'APPROVED')
    ?? planRequests[0];

  const openRequest = async () => {
    if (busy || detail.version.lifecycleStatus !== 'SUBMITTED') return;
    setBusy('open'); setError(null);
    const result = await openGroupApprovalRequest(agreementId, {
      idempotencyKey: openKeyRef.current,
      governedActionType: 'APPROVE_DISTRIBUTION_PLAN',
      statedReason: `Approve Group SecureFlow plan version ${detail.version.planVersion}`,
      requestedAmountMinor: detail.version.distributableAmountMinor,
      currency: detail.plan.currency,
      destinationReference: subjectReference,
    }, authHeader);
    if (!result.ok) {
      setError(result.error || 'SecurePay could not open this approval request. Check that an active distribution-plan approval policy exists for the group.');
      setBusy(null);
      return;
    }
    openKeyRef.current = crypto.randomUUID();
    setBusy(null);
    await onChanged();
  };

  const decide = async (request: SecurePayApprovalRequestSummary, decision: SecurePayApprovalDecision) => {
    if (busy || request.status !== 'PENDING' || !request.eligibleApprover || request.decisionSubmittedByCurrentActor) return;
    const key = decisionKeysRef.current[request.requestId] ?? crypto.randomUUID();
    decisionKeysRef.current[request.requestId] = key;
    setBusy(`${decision}:${request.requestId}`); setError(null);
    const result = await submitGroupApprovalDecision(agreementId, request.requestId, {
      idempotencyKey: key,
      decision,
      reason: decision === 'APPROVE' ? 'Approved for this submitted distribution plan version.' : 'Rejected for this submitted distribution plan version.',
    }, authHeader);
    if (!result.ok) {
      setError(result.error || `SecurePay could not record your ${decision === 'APPROVE' ? 'approval' : 'rejection'}.`);
      setBusy(null);
      return;
    }
    decisionKeysRef.current[request.requestId] = crypto.randomUUID();
    setBusy(null);
    await onChanged();
  };

  if (detail.plan.moneyFlowType !== 'GROUP_SECURE_FLOW' || detail.version.lifecycleStatus !== 'SUBMITTED') return null;

  return (
    <div className="rounded-xl border border-[#1a1a1a]/8 bg-[#faf9f5] p-4 space-y-3">
      <div className="flex items-start gap-3">
        <LivingSecurePayMark state={currentRequest?.status === 'APPROVED' ? 'success' : currentRequest?.status === 'REJECTED' || currentRequest?.status === 'EXPIRED' ? 'caution' : 'waiting'} size="sm" presence={currentRequest?.status === 'REJECTED' || currentRequest?.status === 'EXPIRED' ? 'commanding' : 'present'} decorative />
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">Group approval</p>
          <p className="mt-1 text-xs leading-5 text-[#1a1a1a]/50">This approval is bound to this exact plan version. SecurePayAPI decides eligibility, quorum and final status.</p>
        </div>
      </div>

      {!currentRequest ? (
        <button type="button" onClick={() => void openRequest()} disabled={Boolean(busy)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-4 text-sm font-semibold text-white disabled:opacity-40">
          {busy === 'open' && <Loader2 size={15} className="animate-spin" />}
          {busy === 'open' ? 'Opening approval…' : 'Request group approval'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-white p-2.5"><p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/35">Status</p><p className="mt-1 text-sm font-medium">{currentRequest.status}</p></div>
            <div className="rounded-lg bg-white p-2.5"><p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/35">Approvals</p><p className="mt-1 text-sm font-medium">{currentRequest.approvalsReceived} / {currentRequest.requiredApprovalCount}</p></div>
            <div className="rounded-lg bg-white p-2.5"><p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/35">Eligible</p><p className="mt-1 text-sm font-medium">{currentRequest.eligibleApproverCount}</p></div>
            <div className="rounded-lg bg-white p-2.5"><p className="text-[10px] uppercase tracking-wider text-[#1a1a1a]/35">Rejections</p><p className="mt-1 text-sm font-medium">{currentRequest.rejectionsReceived}</p></div>
          </div>

          {currentRequest.status === 'PENDING' && currentRequest.eligibleApprover && !currentRequest.decisionSubmittedByCurrentActor && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void decide(currentRequest, 'APPROVE')} disabled={Boolean(busy)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#3a7a1f] px-4 text-sm font-semibold text-white disabled:opacity-40">
                {busy === `APPROVE:${currentRequest.requestId}` ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Approve
              </button>
              <button type="button" onClick={() => void decide(currentRequest, 'REJECT')} disabled={Boolean(busy)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 disabled:opacity-40">
                {busy === `REJECT:${currentRequest.requestId}` ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject
              </button>
            </div>
          )}

          {currentRequest.decisionSubmittedByCurrentActor && currentRequest.status === 'PENDING' && (
            <p className="text-xs leading-5 text-[#1a1a1a]/50">Your decision is recorded. SecurePay is waiting for the remaining backend-required approvals.</p>
          )}
          {currentRequest.status === 'APPROVED' && <p className="text-xs font-medium text-[#3a7a1f]">The backend has approved this exact plan version. It can now be governance-locked.</p>}
          {currentRequest.status === 'REJECTED' && <p className="text-xs font-medium text-red-700">The backend has rejected this approval request. This request cannot authorize a plan lock.</p>}
          {currentRequest.status === 'EXPIRED' && <p className="text-xs font-medium text-amber-700">This approval request expired. A new request is required if the plan should continue.</p>}
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
