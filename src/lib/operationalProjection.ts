// ═══════════════════════════════════════════════════════════════
// OPERATIONAL PROJECTION LAYER (Slice 7)
//
// Extends the Slice 6 workspace projection with:
// - Multi-step action sequences (fund → evidence → confirm → release → settle)
// - Payment state humanization
// - Endpoint bindings for each action
// - Obligation/work progress projection
// - Release/settlement state projection
// - Agreement Review state projection
//
// Never manufactures backend truth. Translates authoritative state
// into human actions and sequences.
// ═══════════════════════════════════════════════════════════════

import type {
  SecurePayAgreementFundingOption,
  SecurePayAgreementFundingQuote,
  SecurePayAgreementPaymentIntentSummary,
  SecurePayAgreementMoneyStatus,
  SecurePayPaymentReleaseSettlementStatus,
  SecurePayPaymentReleaseSettlementPhase,
  SecurePayAgreementObligation,
  SecurePayAgreementEvidence,
  SecurePayObligationCompletionStatus,
  SecurePayAgreementReviewCaseSummary,
  SecurePayAgreementReviewCaseDetail,
  SecurePayAgreementFundingAuthority,
  SecurePayAgreementReleaseAuthority,
} from '../api/securepayTypes';
import type { AgreementWorkspaceProjection, PrimaryNextAction } from './workspaceProjection';

// ─── Payment intent state humanization ──────────────────────────

export type HumanPaymentState = {
  title: string;
  explanation: string;
  variant: 'idle' | 'requested' | 'pending' | 'confirmed' | 'failed' | 'action_required' | 'expired';
};

export function humanizePaymentIntentState(
  status: SecurePayAgreementPaymentIntentSummary['status'],
  retryEligible: boolean,
): HumanPaymentState {
  switch (status) {
    case 'CREATED':
      return { title: 'Ready to pay', explanation: 'Choose a payment method to continue.', variant: 'idle' };
    case 'INITIATION_PENDING':
      return { title: 'Payment starting', explanation: 'The payment request is being sent.', variant: 'requested' };
    case 'ACTION_REQUIRED':
      return { title: 'One more step needed', explanation: 'The payment provider needs you to complete an action.', variant: 'action_required' };
    case 'PROVIDER_PENDING':
      return { title: 'Waiting for confirmation', explanation: 'The payment provider is processing your payment.', variant: 'pending' };
    case 'CONFIRMATION_PENDING':
      return { title: 'Waiting for confirmation', explanation: 'The payment provider is confirming your payment.', variant: 'pending' };
    case 'CONFIRMED':
      return { title: 'Payment received', explanation: 'Your payment has been confirmed.', variant: 'confirmed' };
    case 'FAILED':
      return {
        title: 'Payment did not go through',
        explanation: retryEligible
          ? 'You can try again with a new payment.'
          : 'This payment cannot be retried. Contact support if you need help.',
        variant: 'failed',
      };
    case 'EXPIRED':
      return { title: 'Payment expired', explanation: 'The payment window has passed. Start a new payment to continue.', variant: 'expired' };
    case 'CANCELLED':
      return { title: 'Payment cancelled', explanation: 'This payment was cancelled.', variant: 'expired' };
    default:
      return { title: 'Payment', explanation: 'Status unavailable.', variant: 'idle' };
  }
}

// ─── Settlement state humanization ──────────────────────────────

export type HumanSettlementState = {
  title: string;
  explanation: string;
  variant: 'idle' | 'requested' | 'processing' | 'settled' | 'held' | 'compensated';
};

export function humanizeSettlementState(
  phase: SecurePayPaymentReleaseSettlementPhase | null,
  exception: { customerSafeReason: string; requiredAction: string } | null,
): HumanSettlementState {
  if (!phase) {
    return { title: 'Not requested', explanation: 'Payment has not been released yet.', variant: 'idle' };
  }
  switch (phase) {
    case 'INSTRUCTION_CREATED':
      return { title: 'Release requested', explanation: 'The release request has been submitted.', variant: 'requested' };
    case 'RESERVED':
      return { title: 'Payment being sent', explanation: 'Funds are being processed for release to the recipient.', variant: 'processing' };
    case 'SETTLED':
      return { title: 'Payment settled', explanation: 'Funds have been released and settled to the recipient.', variant: 'settled' };
    case 'HELD_EXCEPTION':
      return {
        title: 'Payment needs review',
        explanation: exception?.customerSafeReason || 'Something needs to be resolved before this payment can continue.',
        variant: 'held',
      };
    case 'COMPENSATED':
      return {
        title: 'Payment adjusted',
        explanation: exception?.customerSafeReason || 'A compensating action was applied to this payment.',
        variant: 'compensated',
      };
    default:
      return { title: 'Payment', explanation: 'Status unavailable.', variant: 'idle' };
  }
}

// ─── Obligation state humanization ──────────────────────────────

export type HumanObligationState = {
  title: string;
  explanation: string;
  variant: 'not_started' | 'available' | 'in_progress' | 'evidence_submitted' | 'completed' | 'blocked' | 'overdue' | 'cancelled';
};

export function humanizeObligationState(
  status: SecurePayAgreementObligation['status'],
  completion: SecurePayObligationCompletionStatus | null,
): HumanObligationState {
  switch (status) {
    case 'PENDING':
      return { title: 'Not started', explanation: 'This task has not started yet.', variant: 'not_started' };
    case 'AVAILABLE':
      return { title: 'Ready to start', explanation: 'This task is ready to begin.', variant: 'available' };
    case 'IN_PROGRESS':
      return { title: 'In progress', explanation: 'Work is underway.', variant: 'in_progress' };
    case 'EVIDENCE_SUBMITTED':
      return {
        title: 'Evidence submitted',
        explanation: completion?.eligible
          ? 'Ready to be confirmed as complete.'
          : 'Waiting for review of the submitted evidence.',
        variant: 'evidence_submitted',
      };
    case 'COMPLETED':
      return { title: 'Completed', explanation: 'This task has been confirmed as complete.', variant: 'completed' };
    case 'BLOCKED':
      return { title: 'Waiting', explanation: 'This task is waiting on something else.', variant: 'blocked' };
    case 'OVERDUE':
      return { title: 'Overdue', explanation: 'This task was due and has not been completed.', variant: 'overdue' };
    case 'REJECTED':
      return { title: 'Rejected', explanation: 'The submitted evidence was not accepted.', variant: 'blocked' };
    case 'CANCELLED':
      return { title: 'Cancelled', explanation: 'This task has been cancelled.', variant: 'cancelled' };
    default:
      return { title: 'Task', explanation: 'Status unavailable.', variant: 'not_started' };
  }
}

// ─── Evidence state humanization ────────────────────────────────

export type HumanEvidenceState = {
  title: string;
  variant: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_more';
};

export function humanizeEvidenceState(status: SecurePayAgreementEvidence['status']): HumanEvidenceState {
  switch (status) {
    case 'SUBMITTED':
      return { title: 'Submitted', variant: 'submitted' };
    case 'UNDER_REVIEW':
      return { title: 'Under review', variant: 'under_review' };
    case 'APPROVED':
      return { title: 'Approved', variant: 'approved' };
    case 'REJECTED':
      return { title: 'Not accepted', variant: 'rejected' };
    case 'NEEDS_MORE_INFORMATION':
      return { title: 'More information needed', variant: 'needs_more' };
    default:
      return { title: 'Submitted', variant: 'submitted' };
  }
}

// ─── Agreement Review state humanization ────────────────────────

export type HumanReviewState = {
  title: string;
  explanation: string;
  variant: 'open' | 'acknowledged' | 'responded' | 'escalated' | 'terminal';
};

export function humanizeReviewState(
  state: string,
  _callerAcknowledged: boolean,
  _callerResponded: boolean,
  terminalOutcome: string | null,
): HumanReviewState {
  if (terminalOutcome) {
    return { title: 'Resolved', explanation: 'This issue has been resolved.', variant: 'terminal' };
  }
  switch (state.toUpperCase()) {
    case 'OPEN':
      return { title: 'Issue raised', explanation: 'The other participant has been notified.', variant: 'open' };
    case 'ACKNOWLEDGED':
      return { title: 'Acknowledged', explanation: 'The issue has been acknowledged.', variant: 'acknowledged' };
    case 'RESPONDED':
      return { title: 'Response submitted', explanation: 'A response has been submitted.', variant: 'responded' };
    case 'ESCALATED':
      return { title: 'Escalated', explanation: 'This issue has been escalated for further review.', variant: 'escalated' };
    case 'DECIDED':
      return { title: 'Decision made', explanation: 'A decision has been made on this issue.', variant: 'terminal' };
    case 'CLOSED':
      return { title: 'Closed', explanation: 'This issue has been closed.', variant: 'terminal' };
    default:
      return { title: 'Issue', explanation: 'Status unavailable.', variant: 'open' };
  }
}

// ─── Action sequence model ──────────────────────────────────────

export type ActionStepType =
  | 'SELECT_RAIL'
  | 'GET_QUOTE'
  | 'INITIATE_PAYMENT'
  | 'SUBMIT_EVIDENCE'
  | 'MARK_COMPLETE'
  | 'REVIEW_EVIDENCE'
  | 'CONFIRM_COMPLETION'
  | 'REQUEST_RELEASE'
  | 'POLL_SETTLEMENT'
  | 'OPEN_REVIEW_CASE'
  | 'ACKNOWLEDGE_REVIEW'
  | 'RESPOND_TO_REVIEW'
  | 'SUBMIT_REVIEW_EVIDENCE'
  | 'ESCALATE_REVIEW'
  | 'CONTINUE_NEXT_STAGE'
  | 'WAIT';

export interface ActionStep {
  type: ActionStepType;
  label: string;
  description: string;
  required: boolean;
  preconditions: string[];
}

export interface ActionSequence {
  actionCode: string;
  title: string;
  steps: ActionStep[];
  currentStep: number;
  complete: boolean;
}

// ─── Operational projection (extends workspace projection) ──────

export interface OperationalProjection {
  workspace: AgreementWorkspaceProjection;
  paymentState: HumanPaymentState | null;
  settlementState: HumanSettlementState;
  obligations: OperationalObligation[];
  reviewCases: OperationalReviewCase[];
  fundingAuthority: { authorized: boolean; reasonCode: string } | null;
  releaseAuthority: { authorized: boolean; reasonCode: string } | null;
  activeActionSequence: ActionSequence | null;
  feeSummary: FeeSummary | null;
}

export interface OperationalObligation {
  id: string;
  title: string;
  humanState: HumanObligationState;
  completionEligible: boolean;
  evidence: OperationalEvidence[];
  isResponsible: boolean;
  canReview: boolean;
  beneficiaryLabel: string | null;
  amountDisplay: string | null;
}

export interface OperationalEvidence {
  id: string;
  type: string;
  description: string | null;
  humanState: HumanEvidenceState;
  submittedAt: string;
  submittedByCaller: boolean;
}

export interface OperationalReviewCase {
  reviewCaseId: string;
  state: string;
  humanState: HumanReviewState;
  callerAcknowledged: boolean;
  callerResponded: boolean;
  isTerminal: boolean;
  version: number;
}

export interface FeeSummary {
  agreementAmountDisplay: string | null;
  providerChargeDisplay: string | null;
  platformChargeDisplay: string | null;
  totalChargeDisplay: string | null;
  railCode: string | null;
}

// ─── Builder ────────────────────────────────────────────────────

export interface OperationalProjectionInput {
  workspace: AgreementWorkspaceProjection;
  paymentIntent: SecurePayAgreementPaymentIntentSummary | null;
  moneyStatus: SecurePayAgreementMoneyStatus | null;
  settlementStatus: SecurePayPaymentReleaseSettlementStatus | null;
  obligations: SecurePayAgreementObligation[];
  obligationCompletions: Map<string, SecurePayObligationCompletionStatus>;
  obligationEvidence: Map<string, SecurePayAgreementEvidence[]>;
  reviewCases: SecurePayAgreementReviewCaseSummary[];
  reviewCaseDetails: Map<string, SecurePayAgreementReviewCaseDetail>;
  fundingAuthority: SecurePayAgreementFundingAuthority | null;
  releaseAuthority: SecurePayAgreementReleaseAuthority | null;
  fundingOptions: SecurePayAgreementFundingOption[];
  fundingQuote: SecurePayAgreementFundingQuote | null;
  myParticipantId: string | null;
}

function formatMinor(minor: number | string | null, currency: string | null): string | null {
  if (minor === null || minor === undefined) return null;
  const n = typeof minor === 'string' ? Number(minor) : minor;
  if (!Number.isFinite(n)) return null;
  const major = Math.floor(n / 100);
  const cents = n % 100;
  const curr = currency || 'KES';
  if (cents === 0) return `${curr} ${major.toLocaleString()}`;
  return `${curr} ${major.toLocaleString()}.${String(cents).padStart(2, '0')}`;
}

export function buildOperationalProjection(input: OperationalProjectionInput): OperationalProjection {
  const { workspace, paymentIntent, settlementStatus, obligations, obligationCompletions, obligationEvidence, reviewCases, reviewCaseDetails, fundingAuthority, releaseAuthority, fundingQuote, myParticipantId } = input;

  // ── Payment state ──
  const paymentState = paymentIntent
    ? humanizePaymentIntentState(paymentIntent.status, paymentIntent.retryEligible)
    : null;

  // ── Settlement state ──
  const settlementState = humanizeSettlementState(
    settlementStatus?.settlementPhase ?? null,
    settlementStatus?.exception
      ? { customerSafeReason: settlementStatus.exception.customerSafeReason, requiredAction: settlementStatus.exception.requiredAction }
      : null,
  );

  // ── Obligations ──
  const operationalObligations: OperationalObligation[] = obligations.map(o => {
    const completion = obligationCompletions.get(o.id) ?? null;
    const evidence = obligationEvidence.get(o.id) ?? [];
    const isResponsible = myParticipantId === o.responsibleParticipantId;
    const canReview = !isResponsible;
    return {
      id: o.id,
      title: o.title,
      humanState: humanizeObligationState(o.status, completion),
      completionEligible: completion?.eligible ?? false,
      evidence: evidence.map(e => ({
        id: e.id,
        type: e.evidenceType,
        description: e.description ?? null,
        humanState: humanizeEvidenceState(e.status),
        submittedAt: e.submittedAt,
        submittedByCaller: false,
      })),
      isResponsible,
      canReview,
      beneficiaryLabel: null,
      amountDisplay: o.amountMinor != null ? formatMinor(o.amountMinor, o.currency) : null,
    };
  });

  // ── Review cases ──
  const operationalReviewCases: OperationalReviewCase[] = reviewCases.map(rc => {
    const detail = reviewCaseDetails.get(rc.reviewCaseId);
    const state = detail?.state ?? rc.state;
    const callerAcknowledged = detail?.callerAcknowledged ?? false;
    const callerResponded = detail?.callerResponded ?? false;
    const terminalOutcome = detail?.terminalOutcome ?? null;
    const isTerminal = terminalOutcome !== null;
    return {
      reviewCaseId: rc.reviewCaseId,
      state,
      humanState: humanizeReviewState(state, callerAcknowledged, callerResponded, terminalOutcome),
      callerAcknowledged,
      callerResponded,
      isTerminal,
      version: detail?.version ?? 0,
    };
  });

  // ── Active action sequence ──
  const activeActionSequence = deriveActionSequence(
    workspace.primaryNextAction,
    paymentState,
    settlementState,
    operationalObligations,
    operationalReviewCases,
    fundingAuthority,
    releaseAuthority,
  );

  // ── Fee summary ──
  const feeSummary: FeeSummary | null = fundingQuote
    ? {
        agreementAmountDisplay: formatMinor(fundingQuote.amountMinor, fundingQuote.currency),
        providerChargeDisplay: formatMinor(fundingQuote.providerChargeMinor, fundingQuote.currency),
        platformChargeDisplay: formatMinor(fundingQuote.platformChargeMinor, fundingQuote.currency),
        totalChargeDisplay: formatMinor(fundingQuote.totalChargeMinor, fundingQuote.currency),
        railCode: fundingQuote.railCode,
      }
    : null;

  return {
    workspace,
    paymentState,
    settlementState,
    obligations: operationalObligations,
    reviewCases: operationalReviewCases,
    fundingAuthority: fundingAuthority
      ? { authorized: fundingAuthority.authorized, reasonCode: fundingAuthority.reasonCode }
      : null,
    releaseAuthority: releaseAuthority
      ? { authorized: releaseAuthority.authorized, reasonCode: releaseAuthority.reasonCode }
      : null,
    activeActionSequence,
    feeSummary,
  };
}

// ─── Action sequence derivation ─────────────────────────────────

function deriveActionSequence(
  primaryAction: PrimaryNextAction | null,
  _paymentState: HumanPaymentState | null,
  _settlementState: HumanSettlementState,
  _obligations: OperationalObligation[],
  _reviewCases: OperationalReviewCase[],
  _fundingAuthority: { authorized: boolean } | null,
  _releaseAuthority: { authorized: boolean } | null,
): ActionSequence | null {
  if (!primaryAction) return null;
  const code = primaryAction.actionCode;

  switch (code) {
    case 'FUND_AGREEMENT':
      return {
        actionCode: code,
        title: 'Fund this agreement',
        currentStep: 0,
        complete: false,
        steps: [
          { type: 'SELECT_RAIL', label: 'Choose payment method', description: 'Select how you want to pay.', required: true, preconditions: ['fundingAuthority.authorized'] },
          { type: 'GET_QUOTE', label: 'Review fees', description: 'See the total cost before you commit.', required: false, preconditions: ['railQuoteAvailable'] },
          { type: 'INITIATE_PAYMENT', label: 'Send payment request', description: 'Authorize the payment through your chosen method.', required: true, preconditions: ['railSelected'] },
        ],
      };

    case 'SUBMIT_EVIDENCE':
      return {
        actionCode: code,
        title: 'Show the work',
        currentStep: 0,
        complete: false,
        steps: [
          { type: 'SUBMIT_EVIDENCE', label: 'Add evidence', description: 'Upload a photo, document, or note to confirm the work.', required: true, preconditions: ['isResponsible'] },
        ],
      };

    case 'START_OBLIGATION':
      return {
        actionCode: code,
        title: 'Start the work',
        currentStep: 0,
        complete: false,
        steps: [
          { type: 'MARK_COMPLETE', label: 'Begin work', description: 'Start the task and add evidence when done.', required: true, preconditions: ['isResponsible', 'obligationAvailable'] },
        ],
      };

    case 'REQUEST_RELEASE':
      return {
        actionCode: code,
        title: 'Release payment',
        currentStep: 0,
        complete: false,
        steps: [
          { type: 'REQUEST_RELEASE', label: 'Review and release', description: 'Review the amount and recipient before releasing payment.', required: true, preconditions: ['releaseAuthority.authorized', 'paymentReady'] },
          { type: 'POLL_SETTLEMENT', label: 'Wait for settlement', description: 'SecurePay processes the release to the recipient.', required: true, preconditions: ['releaseRequested'] },
        ],
      };

    case 'ACKNOWLEDGE_REVIEW':
      return {
        actionCode: code,
        title: 'Review the issue',
        currentStep: 0,
        complete: false,
        steps: [
          { type: 'ACKNOWLEDGE_REVIEW', label: 'Acknowledge the issue', description: 'Confirm you have seen the issue raised.', required: true, preconditions: ['!callerAcknowledged', '!isTerminal'] },
          { type: 'RESPOND_TO_REVIEW', label: 'Share your side', description: 'Describe what happened from your perspective.', required: false, preconditions: ['!callerResponded', '!isTerminal'] },
          { type: 'SUBMIT_REVIEW_EVIDENCE', label: 'Add evidence', description: 'Upload documents or photos to support your response.', required: false, preconditions: ['!isTerminal'] },
        ],
      };

    case 'CONFIRM_VERSION':
      return {
        actionCode: code,
        title: 'Confirm the agreement',
        currentStep: 0,
        complete: false,
        steps: [
          { type: 'CONFIRM_COMPLETION', label: 'Review and confirm', description: 'Review the agreement terms and confirm your participation.', required: true, preconditions: ['!confirmationCurrent'] },
        ],
      };

    default:
      return null;
  }
}

// ─── Rail display helpers ───────────────────────────────────────

export function railDisplayName(railCode: string): string {
  switch (railCode) {
    case 'MPESA_STK': return 'M-Pesa';
    case 'PESALINK': return 'PesaLink';
    default: return railCode;
  }
}

export function railInstructions(railCode: string): { label: string; placeholder: string } {
  switch (railCode) {
    case 'MPESA_STK':
      return { label: 'Phone number', placeholder: '07XX XXX XXX' };
    case 'PESALINK':
      return { label: 'Bank account or phone', placeholder: 'Enter account or phone' };
    default:
      return { label: 'Reference', placeholder: 'Enter reference' };
  }
}
