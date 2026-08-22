import { securePayFetch } from './securepayClient';
import type {
  AmendDistributionPlanAllocationsRequestBody,
  CreateDistributionPlanRequestBody,
  FundDistributionPlanRequestBody,
  GovernanceLockDistributionPlanRequestBody,
  LockDistributionPlanRequestBody,
  OpenGroupApprovalRequestBody,
  SecurePayApprovalRequestSummary,
  SecurePayDistributionPlanDetail,
  SecurePayDistributionPlanSummary,
  SecurePayDistributionPlanVersion,
  SecurePayDistributionPoolFundingResponse,
  SecurePayOpenApprovalRequestResponse,
  SecurePayQuorumEvaluation,
  SecurePaySubmitApprovalDecisionResponse,
  SubmitDistributionPlanRequestBody,
  SubmitGroupApprovalDecisionBody,
} from './secureflowTypes';

function agreementPath(agreementId: string): string {
  return `/api/v1/agreements/${encodeURIComponent(agreementId)}`;
}

function planPath(agreementId: string, planId: string): string {
  return `${agreementPath(agreementId)}/distribution-plans/${encodeURIComponent(planId)}`;
}

function groupApprovalPath(agreementId: string): string {
  return `${agreementPath(agreementId)}/group-securelink/approval-requests`;
}

export function distributionPlanGovernanceReference(planId: string, planVersion: number): string {
  return `${planId}|v${planVersion}`;
}

export async function listDistributionPlans(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayDistributionPlanSummary[]>(
    `${agreementPath(agreementId)}/distribution-plans`,
    { authHeader }
  );
}

export async function getDistributionPlan(agreementId: string, planId: string, authHeader?: string) {
  return securePayFetch<SecurePayDistributionPlanDetail>(planPath(agreementId, planId), { authHeader });
}

export async function createDistributionPlan(
  agreementId: string,
  body: CreateDistributionPlanRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayDistributionPlanDetail>(`${agreementPath(agreementId)}/distribution-plans`, {
    method: 'POST',
    body,
    authHeader,
  });
}

export async function amendDistributionPlanAllocations(
  agreementId: string,
  planId: string,
  planVersion: number,
  body: AmendDistributionPlanAllocationsRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayDistributionPlanDetail>(
    `${planPath(agreementId, planId)}/versions/${planVersion}/allocations`,
    { method: 'POST', body, authHeader }
  );
}

export async function submitDistributionPlan(
  agreementId: string,
  planId: string,
  planVersion: number,
  body: SubmitDistributionPlanRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayDistributionPlanVersion>(
    `${planPath(agreementId, planId)}/versions/${planVersion}/submit`,
    { method: 'POST', body, authHeader }
  );
}

export async function lockDistributionPlan(
  agreementId: string,
  planId: string,
  planVersion: number,
  body: LockDistributionPlanRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayDistributionPlanDetail>(
    `${planPath(agreementId, planId)}/versions/${planVersion}/lock`,
    { method: 'POST', body, authHeader }
  );
}

export async function governanceLockDistributionPlan(
  agreementId: string,
  planId: string,
  planVersion: number,
  body: GovernanceLockDistributionPlanRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayDistributionPlanDetail>(
    `${planPath(agreementId, planId)}/versions/${planVersion}/governance-lock`,
    { method: 'POST', body, authHeader }
  );
}

export async function fundDistributionPlan(
  agreementId: string,
  planId: string,
  body: FundDistributionPlanRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayDistributionPoolFundingResponse>(
    `${planPath(agreementId, planId)}/funding`,
    { method: 'POST', body, authHeader }
  );
}

export async function listGroupApprovalRequests(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayApprovalRequestSummary[]>(groupApprovalPath(agreementId), { authHeader });
}

export async function openGroupApprovalRequest(
  agreementId: string,
  body: OpenGroupApprovalRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayOpenApprovalRequestResponse>(groupApprovalPath(agreementId), {
    method: 'POST', body, authHeader,
  });
}

export async function submitGroupApprovalDecision(
  agreementId: string,
  requestId: string,
  body: SubmitGroupApprovalDecisionBody,
  authHeader?: string
) {
  return securePayFetch<SecurePaySubmitApprovalDecisionResponse>(
    `${groupApprovalPath(agreementId)}/${encodeURIComponent(requestId)}/decisions`,
    { method: 'POST', body, authHeader }
  );
}

export async function getGroupApprovalQuorum(
  agreementId: string,
  requestId: string,
  authHeader?: string
) {
  return securePayFetch<SecurePayQuorumEvaluation>(
    `${groupApprovalPath(agreementId)}/${encodeURIComponent(requestId)}/quorum`,
    { authHeader }
  );
}
