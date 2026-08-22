export type SecurePayDistributionMoneyFlowType = 'SECURE_FLOW' | 'GROUP_SECURE_FLOW';
export type SecurePayDistributionAllocationMode = 'FIXED_AMOUNT' | 'PERCENTAGE';

export interface SecurePayDistributionPlanSummary {
  id: string;
  agreementId: string;
  moneyFlowType: SecurePayDistributionMoneyFlowType;
  currency: string;
  lifecycleStatus: string;
  activeLockedVersionId: string | null;
  groupSecureLinkId: string | null;
}

export interface SecurePayDistributionPlanVersion {
  id: string;
  planVersion: number;
  agreementVersionId: string;
  distributableAmountMinor: number;
  lifecycleStatus: string;
  contentHash: string;
  pricingSnapshotId: string;
  lockedAt: string | null;
}

export interface SecurePayDistributionAllocation {
  id: string;
  allocationReference: string;
  sequenceNumber: number;
  allocationMode: SecurePayDistributionAllocationMode;
  amountMinor: number | null;
  basisPoints: number | null;
  beneficiaryKsNumber: string;
  computedAmountMinor: number;
  purposeTitle: string;
  purposeDescription: string;
}

export interface SecurePayDistributionObligation {
  [key: string]: unknown;
}

export interface SecurePayDistributionPlanDetail {
  plan: SecurePayDistributionPlanSummary;
  version: SecurePayDistributionPlanVersion;
  allocations: SecurePayDistributionAllocation[];
  obligations: SecurePayDistributionObligation[];
}

export interface CreateDistributionPlanRequestBody {
  idempotencyKey: string;
  moneyFlowType: SecurePayDistributionMoneyFlowType;
  distributableAmountMinor: number;
  groupSecureLinkId?: string | null;
}

export interface DistributionAllocationRequestBody {
  allocationReference: string;
  sequenceNumber: number;
  allocationMode: SecurePayDistributionAllocationMode;
  amountMinor?: number | null;
  basisPoints?: number | null;
  beneficiaryKsNumber: string;
  purposeTitle: string;
  purposeDescription: string;
}

export interface AmendDistributionPlanAllocationsRequestBody {
  idempotencyKey: string;
  allocations: DistributionAllocationRequestBody[];
}

export interface SubmitDistributionPlanRequestBody {
  idempotencyKey: string;
}

export interface LockDistributionPlanRequestBody {
  idempotencyKey: string;
}

export interface GovernanceLockDistributionPlanRequestBody {
  governanceRequestId: string;
  idempotencyKey: string;
}

export interface FundDistributionPlanRequestBody {
  securePromptId: string;
  idempotencyKey: string;
}

export interface SecurePayDistributionPoolFundingResponse {
  instructionId: string;
  agreementId: string;
  distributionPlanId: string;
  planVersionId: string;
  amountMinor: number;
  currency: string;
  status: string;
  replayed: boolean;
  obligations: SecurePayDistributionObligation[];
}

export type SecurePayGovernedActionType =
  | 'PROPOSE_RELEASE'
  | 'CHANGE_ORGANIZERS'
  | 'CHANGE_GOVERNANCE'
  | 'CANCEL_GROUP_SECURELINK'
  | 'EXTEND_DEADLINE'
  | 'APPROVE_DISTRIBUTION_PLAN';

export type SecurePayApprovalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type SecurePayApprovalDecision = 'APPROVE' | 'REJECT';

export interface SecurePayApprovalRequestSummary {
  requestId: string;
  governedActionType: SecurePayGovernedActionType;
  status: SecurePayApprovalRequestStatus;
  statedReason: string;
  openedAt: string;
  expiresAt: string | null;
  resolvedAt: string | null;
  requestedByCurrentActor: boolean;
  eligibleApprover: boolean;
  decisionSubmittedByCurrentActor: boolean;
  eligibleApproverCount: number;
  requiredApprovalCount: number;
  approvalsReceived: number;
  rejectionsReceived: number;
  subjectReference: string | null;
}

export interface OpenGroupApprovalRequestBody {
  idempotencyKey: string;
  governedActionType: SecurePayGovernedActionType;
  statedReason: string;
  requestedAmountMinor?: number | null;
  currency?: string | null;
  destinationReference?: string | null;
}

export interface SecurePayOpenApprovalRequestResponse {
  requestId: string;
  governedActionType: SecurePayGovernedActionType;
  status: SecurePayApprovalRequestStatus;
  openedAt: string;
  expiresAt: string | null;
  replayed: boolean;
}

export interface SubmitGroupApprovalDecisionBody {
  idempotencyKey: string;
  decision: SecurePayApprovalDecision;
  reason?: string | null;
}

export interface SecurePayQuorumEvaluation {
  eligibleApproverCount: number;
  requiredApprovalCount: number;
  approvalsReceived: number;
  rejectionsReceived: number;
  quorumReached: boolean;
  approvalThresholdReached: boolean;
  terminalRejectionReached: boolean;
  expired: boolean;
  finalStatus: string;
  blockingReasons: string[];
}

export interface SecurePaySubmitApprovalDecisionResponse {
  decisionId: string;
  decision: SecurePayApprovalDecision;
  quorum: SecurePayQuorumEvaluation;
  replayed: boolean;
}
