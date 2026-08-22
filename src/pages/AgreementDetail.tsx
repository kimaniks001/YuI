// ═══════════════════════════════════════════════════════════════
// AGREEMENT DETAIL — Phase 4 UI Slice 1 ("authoritative agreement detail +
// version history depth")
//
// Turns the Phase 3 create → invite → join → confirm journey into a real,
// revisitable agreement record. Every field on this page is read from one
// of the authoritative ~/SecurePayAPI agreement reads (AgreementController.java,
// verified directly against source and contracts/openapi/securepay-api-v1
// .yaml):
//   GET /agreements/{agreementId}                    — core summary
//   GET /agreements/{agreementId}/participants        — participant rows
//   GET /agreements/{agreementId}/versions             — version history
//   GET /agreements/{agreementId}/versions/{versionId} — one version's detail
//   GET /agreements/{agreementId}/confirmations         — confirmation records
//                                                          (listAgreementConfirmations,
//                                                          AgreementController
//                                                          #listConfirmations,
//                                                          now present in
//                                                          contracts/openapi/
//                                                          securepay-api-v1
//                                                          .yaml)
//   GET /agreements/{agreementId}/confirmation-status   — the caller's own
//                                                          confirmation
//                                                          status (self-only
//                                                          despite the array
//                                                          shape — see
//                                                          SecurePayAgreementConfirmationStatus's
//                                                          doc comment)
//   GET /agreements/{agreementId}/activity              — audit timeline
//   GET /agreements/{agreementId}/money-status          — participant-safe,
//                                                          backend-calculated
//                                                          Payment Ready status
//   GET /agreements/{agreementId}/money-records         — participant-safe,
//                                                          instruction-creation
//                                                          facts only
//
// Authorization (AgreementAuthorizationService#requireRead, verified
// directly against source): the creator and any joined participant
// (JOINED_UNCONFIRMED or CONFIRMED) may read every one of these. Both
// confirmation reads additionally require AGREEMENT_CONFIRMATION_READ, which
// ~/SecurePayAPI main commit d11e5b2 ("fix(authz): enable agreement
// confirmation reads", PR #125, ADR-0018 §D.3/§K) grants to the same
// baseline INDIVIDUAL_AGREEMENT_PARTICIPANT role every signed-up identity
// already holds — so a creator or joined participant no longer 403s on
// these two reads. Any other authenticated identity still gets a 403
// (AccessDeniedException → ACCESS_DENIED), and this page fails closed on
// that — no data is rendered, and there is no fallback to the legacy
// /link/:slug page (SecureLinkView.tsx), which is a structurally different,
// Supabase/demo-fixture-backed page for an unrelated data model and is
// never reached from here.
//
// Only fields the backend actually returns are shown. Lifecycle values are
// translated to plain language via src/lib/agreementStateLanguage.ts without
// changing their meaning — nothing here is ever labeled funded, paid,
// complete, enforceable, or final, because none of those states exist on
// this backend yet (Agreement.status has no ACTIVE/FUNDED/ACCEPTED value,
// confirmed directly against the OpenAPI schema).
// ═══════════════════════════════════════════════════════════════
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  ArrowLeft, Loader2, AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle2, Clock, FileText, Users, History, Activity as ActivityIcon, Banknote, Flag,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import {
  getAgreement,
  getAgreementMoneyStatus,
  listAgreementMoneyRecords,
  listAgreementParticipants,
  listAgreementVersions,
  getAgreementVersion,
  listAgreementConfirmations,
  getAgreementConfirmationStatus,
  listAgreementActivity,
  issueAgreementInvitation,
  confirmAgreementVersion,
  getParticipantNextActions,
  listAgreementObligations,
  listAgreementMilestones,
  listAgreementAmendments,
  listAgreementObligationEvidence,
  startObligation,
  completeObligation,
  getObligationCompletionStatus,
  submitAgreementEvidence,
  reviewAgreementEvidence,
  openAgreementReviewCase,
  listAgreementReviewCases,
  getAgreementFundingAuthority,
  createAgreementPaymentIntent,
  listAgreementPaymentIntents,
  listAgreementFundingOptions,
  createAgreementFundingQuote,
  initiatePaymentIntent,
  getAgreementReleaseAuthority,
  listAgreementReleaseInstructions,
  getPaymentReadyEvaluation,
  createPaymentReleaseInstruction,
  getPaymentReleaseSettlementStatus,
  getAgreementReviewCase,
  acknowledgeAgreementReviewCase,
  submitAgreementReviewResponse,
  requestAgreementReviewEscalation,
  listAgreementReviewEvidence,
  submitAgreementReviewEvidence,
} from '../api/securepayEndpoints';
import type {
  SecurePayAgreement,
  SecurePayAgreementParticipant,
  SecurePayAgreementVersion,
  SecurePayAgreementConfirmation,
  SecurePayAgreementConfirmationStatus,
  SecurePayAgreementActivity,
  SecurePayAgreementMoneyStatus,
  SecurePayAgreementMoneyRecord,
  SecurePayParticipantNextAction,
  SecurePayAgreementObligation,
  SecurePayAgreementMilestone,
  SecurePayAgreementAmendment,
  SecurePayAgreementEvidence,
  SecurePayObligationCompletionStatus,
  SecurePayEvidenceType,
  SecurePayAgreementReviewCaseSummary,
  SecurePayAgreementFundingAuthority,
  SecurePayAgreementPaymentIntentSummary,
  SecurePayAgreementFundingOption,
  SecurePayAgreementFundingRailCode,
  SecurePayAgreementFundingQuote,
  SecurePayInitiatePaymentResponse,
  SecurePayAgreementReleaseAuthority,
  SecurePayPaymentReleaseInstruction,
  SecurePayPaymentReleaseSettlementStatus,
  SecurePayPaymentReleaseExceptionProjection,
  SecurePayAgreementReviewCaseDetail,
  SecurePayAgreementReviewResponseType,
  SecurePayAgreementReviewEvidenceType,
  SecurePayAgreementReviewEvidenceItem,
} from '../api/securepayTypes';
import GroupSecureLinkSection from '../components/agreement/GroupSecureLinkSection';
import {
  agreementStatusLabel,
  participantStatusLabel,
  versionStatusLabel,
  confirmationStatusLabel,
  activityTypeLabel,
} from '../lib/agreementStateLanguage';
import { formatDecimalMinorMoney, formatMinorMoney } from '../lib/formatMinorMoney';
import { buildWorkspaceProjection } from '../lib/workspaceProjection';

const COUNTERPARTY_ROLE_CODE = 'COUNTERPARTY';
const INVITABLE_STATUSES = new Set(['PROPOSED', 'INVITATION_PENDING', 'PARTICIPANTS_JOINING']);


function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
}

const PARTICIPANT_REASON_LABELS: Record<string, string> = {
  'FUNDING_SUFFICIENCY:FUNDING_INSUFFICIENT': 'The required payment amount has not yet been confirmed.',
  'AGREEMENT_ACCEPTANCE:AGREEMENT_NOT_ACCEPTED': 'The agreement has not yet been accepted.',
  'AGREEMENT_ACCEPTANCE:AGREEMENT_VERSION_MISMATCH': 'The evaluated agreement version is not the currently accepted version.',
  'CONDITIONS_AND_MILESTONES:CONDITION_UNSATISFIED': 'A required agreement condition is still outstanding.',
  'CONDITIONS_AND_MILESTONES:MILESTONE_INCOMPLETE': 'A required milestone is still incomplete.',
  'EVIDENCE:EVIDENCE_MISSING': 'Required evidence has not yet been submitted.',
  'EVIDENCE:EVIDENCE_UNVERIFIED': 'Required evidence has not yet been verified.',
  'APPROVALS:APPROVAL_MISSING': 'A required approval is still outstanding.',
  'TIME_REQUIREMENTS:COUNTDOWN_NOT_EXPIRED': 'A required time period has not yet ended.',
  'INSTRUCTION_SOURCE_ELIGIBILITY:INSTR_SRC_COUNTDOWN_PENDING': 'A required waiting period has not yet ended.',
  'INSTRUCTION_SOURCE_ELIGIBILITY:INSTR_SRC_REVIEW_UNRESOLVED': 'An Agreement Review is still unresolved.',
  'INSTRUCTION_SOURCE_ELIGIBILITY:INSTR_SRC_NONE_ELIGIBLE': 'No eligible release path has been recorded for this agreement yet.',
  'AGREEMENT_REVIEW_RESTRICTION:REVIEW_RELEASE_RESTRICTED': 'Release for this agreement is restricted while an issue is being resolved.',
  // R4 — closed backend reason vocabulary
  // (ke.securepay.paymentready.gate.PaymentReadyReasonCode, verified directly against
  // source), added for the gates Phase 36A wired to real evaluation logic.
  'COMPLIANCE_RESTRICTION:COMPLIANCE_HOLD_ACTIVE': 'An active compliance hold is recorded for this agreement.',
  'COMPLIANCE_RESTRICTION:COMPLIANCE_NO_HOLD_ON_RECORD': 'SecurePay has not yet confirmed there is no compliance restriction on this agreement.',
  'LEGAL_RESTRICTION:LEGAL_RESTRICTION_ACTIVE': 'An active legal restriction applies to this agreement.',
  'SETTLEMENT_DESTINATION_VALIDITY:DESTINATION_INVALID': 'The recorded settlement destination is not valid.',
  'SETTLEMENT_DESTINATION_VALIDITY:DESTINATION_BLOCKED': 'The recorded settlement destination is currently blocked.',
  'RECONCILIATION:RECONCILIATION_PENDING': 'The payment position for this agreement has not yet been reconciled.',
  'RAIL_ELIGIBILITY:RAIL_INELIGIBLE': 'No eligible payment rail is currently available for this agreement.',
};

function safeOutstandingReasons(status: SecurePayAgreementMoneyStatus): string[] {
  const mapped = status.outstandingReasons.map(reason =>
    PARTICIPANT_REASON_LABELS[`${reason.gateCode}:${reason.reasonCode}`]
  );
  const safe = mapped.filter((reason): reason is string => Boolean(reason));
  if (mapped.some(reason => !reason)) safe.push('Some payment conditions are still outstanding.');
  return [...new Set(safe)];
}

function paymentReadinessLabel(status: SecurePayAgreementMoneyStatus): string | null {
  switch (status.paymentReadyStatus) {
    case 'READY':
      return status.paymentReady ? 'Payment conditions are ready' : null;
    case 'NOT_READY':
      return !status.paymentReady ? 'Payment conditions are not ready yet' : null;
    case 'PARTIALLY_READY':
      return !status.paymentReady ? 'Payment conditions are partially ready' : null;
    case 'BLOCKED':
      return !status.paymentReady ? 'Payment conditions are blocked' : null;
    default:
      return null;
  }
}

function validDateTime(iso: string): string | null {
  if (typeof iso !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(iso);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (year < 1 || calendarDate.getUTCFullYear() !== year
      || calendarDate.getUTCMonth() !== month - 1 || calendarDate.getUTCDate() !== day) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
}

const OBLIGATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Not started', BLOCKED: 'Blocked', AVAILABLE: 'Available to start',
  IN_PROGRESS: 'In progress', EVIDENCE_SUBMITTED: 'Evidence submitted', COMPLETED: 'Completed',
  REJECTED: 'Rejected', OVERDUE: 'Overdue', CANCELLED: 'Cancelled',
};
function obligationStatusLabel(status: string): string {
  return OBLIGATION_STATUS_LABELS[status] ?? status;
}

const AMENDMENT_STATUS_LABELS: Record<string, string> = {
  PROPOSED: 'Proposed', APPLIED: 'Applied', WITHDRAWN: 'Withdrawn',
  REJECTED: 'Rejected', SUPERSEDED: 'Superseded',
};
function amendmentStatusLabel(status: string): string {
  return AMENDMENT_STATUS_LABELS[status] ?? status;
}

const REVIEW_CASE_STATE_LABELS: Record<string, string> = {
  OPENED: 'Opened', AWAITING_RESPONSE: 'Waiting for a response', EVIDENCE_COLLECTION: 'Collecting evidence',
  UNDER_REVIEW: 'Under review', DECISION_PENDING: 'Decision pending', DECIDED: 'Decided',
  CANCELLED: 'Cancelled', EXPIRED: 'Expired', SUPERSEDED: 'Superseded',
};
function reviewCaseStateLabel(state: string): string {
  return REVIEW_CASE_STATE_LABELS[state] ?? state;
}

function reviewLivingMarkState(state: string): 'review' | 'waiting' | 'guiding' | 'caution' | 'success' {
  if (state === 'DECIDED') return 'success';
  if (state === 'CANCELLED' || state === 'EXPIRED' || state === 'SUPERSEDED') return 'caution';
  if (state === 'AWAITING_RESPONSE') return 'waiting';
  if (state === 'EVIDENCE_COLLECTION') return 'guiding';
  return 'review';
}

// R5 — closed backend enums
// (ke.securepay.agreement.review.domain.AgreementReviewParticipantRole/
// AgreementReviewResponseType/AgreementReviewEvidenceType/
// AgreementReviewOutcome/AgreementReviewDecisionReasonCode, verified
// directly against source). Process-driven wording only — SecurePay
// records the process, never frames itself as deciding who is right.
const REVIEW_PARTICIPANT_ROLE_LABELS: Record<string, string> = {
  OPENER: 'You raised this issue.',
  RESPONDENT: 'You are responding to this issue.',
  AFFECTED_BENEFICIARY: 'This issue affects you as a beneficiary of this agreement.',
  AFFECTED_FUNDER: 'This issue affects you as the funder of this agreement.',
};
function reviewParticipantRoleLabel(role: string): string | null {
  return REVIEW_PARTICIPANT_ROLE_LABELS[role] ?? null;
}

// Roles the backend authorizes to submit a structured response
// (AgreementReviewParticipantRole#canRespond, verified directly against
// source) — the opener already stated their position when opening the
// case, so the response control is not offered to them.
const REVIEW_RESPONDABLE_ROLES = new Set(['RESPONDENT', 'AFFECTED_BENEFICIARY', 'AFFECTED_FUNDER']);

// Case states where the backend still accepts an escalation request
// (AgreementReviewCaseState#allowsEscalation, verified directly against
// source).
const REVIEW_ESCALATABLE_STATES = new Set(['UNDER_REVIEW', 'DECISION_PENDING']);

const REVIEW_TERMINAL_STATES = new Set(['DECIDED', 'CANCELLED', 'EXPIRED', 'SUPERSEDED']);

const REVIEW_RESPONSE_TYPES: SecurePayAgreementReviewResponseType[] = [
  'CLARIFICATION', 'DISPUTE_POSITION', 'PARTIAL_ADMISSION', 'ACKNOWLEDGEMENT',
];
const REVIEW_RESPONSE_TYPE_LABELS: Record<SecurePayAgreementReviewResponseType, string> = {
  CLARIFICATION: 'Provide clarification', DISPUTE_POSITION: 'State your position on the issue',
  PARTIAL_ADMISSION: 'Partially agree with the issue', ACKNOWLEDGEMENT: 'Simple acknowledgement',
};

const REVIEW_EVIDENCE_TYPES: SecurePayAgreementReviewEvidenceType[] = [
  'DOCUMENT', 'IMAGE', 'RECEIPT', 'DELIVERY_RECORD', 'AGREEMENT_RECORD',
  'COMMUNICATION', 'IDENTITY_CONFIRMATION', 'LOCATION_CONFIRMATION', 'OTHER',
];
const REVIEW_EVIDENCE_TYPE_LABELS: Record<SecurePayAgreementReviewEvidenceType, string> = {
  DOCUMENT: 'Document', IMAGE: 'Photo', RECEIPT: 'Receipt', DELIVERY_RECORD: 'Delivery record',
  AGREEMENT_RECORD: 'Agreement record', COMMUNICATION: 'Communication record',
  IDENTITY_CONFIRMATION: 'Identity confirmation', LOCATION_CONFIRMATION: 'Location confirmation', OTHER: 'Other',
};

// The review has concluded — plain-language, process-only wording. Never
// "verdict"/"award"/"judgment"/"SecurePay has ruled".
const REVIEW_OUTCOME_LABELS: Record<string, string> = {
  RELEASE_ALLOWED: 'The review concluded that release may proceed.',
  RELEASE_BLOCKED: 'The review concluded that release should not proceed yet.',
  OBLIGATION_SATISFIED: 'The review concluded that the obligation was satisfied.',
  OBLIGATION_NOT_SATISFIED: 'The review concluded that the obligation was not satisfied.',
  CASE_DISMISSED: 'The review was closed without further action.',
  NO_DECISION: 'The review concluded without a decision.',
  MORE_EVIDENCE_REQUIRED: 'More evidence has been requested before this review can conclude.',
  ESCALATED: 'This review has been escalated.',
};
function reviewOutcomeLabel(outcome: string): string {
  return REVIEW_OUTCOME_LABELS[outcome] ?? 'The review has concluded.';
}

const REVIEW_DECISION_REASON_LABELS: Record<string, string> = {
  EVIDENCE_SUPPORTS_RELEASE: 'The evidence on record supported this outcome.',
  EVIDENCE_BLOCKS_RELEASE: 'The evidence on record did not support release.',
  OBLIGATION_MET: 'The obligation was found to have been met.',
  OBLIGATION_NOT_MET: 'The obligation was found not to have been met.',
  INSUFFICIENT_EVIDENCE: 'There was not enough evidence on record to decide otherwise.',
  PROCEDURAL_DISMISSAL: 'This was closed for procedural reasons.',
  INCONCLUSIVE_RECORD: 'The record on file was inconclusive.',
};
function reviewDecisionReasonLabel(reasonCode: string): string | null {
  return REVIEW_DECISION_REASON_LABELS[reasonCode] ?? null;
}

// Deliberately safe/generic — this is a fixed, closed list of backend-owned
// action codes (NextActionType), verified directly against
// ~/SecurePayAPI's ke.securepay.agreement.obligation.model.NextActionType.
// Everything except RECONFIRM_AGREEMENT_VERSION is obligation/milestone
// fulfillment execution, which is out of R1 (Agreement Core Convergence)
// scope — those render as a plain reason/deadline card here, never an
// invented command, and reconfirmation itself is already handled by the
// dedicated "Agreement action" card above using this same backend state.
const NEXT_ACTION_LABELS: Record<string, string> = {
  RECONFIRM_AGREEMENT_VERSION: 'Reconfirm the agreement version',
  START_OBLIGATION: 'An obligation is available to start',
  SUBMIT_EVIDENCE: 'Evidence is needed for an obligation',
  PROVIDE_LOCATION: 'A location is needed for an obligation',
  RECORD_ATTENDANCE: 'Attendance needs to be recorded',
  SUBMIT_DELIVERY: 'A delivery needs to be recorded',
  ACKNOWLEDGE_DELIVERY: 'A delivery needs to be acknowledged',
  REVIEW_EVIDENCE: 'Evidence is awaiting your review',
  PROVIDE_MORE_INFORMATION: 'More information has been requested',
  WAIT_FOR_DEPENDENCY: 'Waiting on another step',
  WAIT_UNTIL_AVAILABLE: 'Not yet available',
  NO_ACTION_REQUIRED: 'No action required',
};
function nextActionLabel(actionType: string): string {
  return NEXT_ACTION_LABELS[actionType] ?? actionType;
}

const EVIDENCE_TYPES: SecurePayEvidenceType[] = [
  'DOCUMENT', 'IMAGE', 'VIDEO_REFERENCE', 'RECEIPT', 'DELIVERY_NOTE',
  'ATTENDANCE_RECORD', 'LOCATION_CLAIM', 'TEXT_STATEMENT', 'OTHER',
];
const EVIDENCE_TYPE_LABELS: Record<SecurePayEvidenceType, string> = {
  DOCUMENT: 'Document', IMAGE: 'Photo', VIDEO_REFERENCE: 'Video reference',
  RECEIPT: 'Receipt', DELIVERY_NOTE: 'Delivery note', ATTENDANCE_RECORD: 'Attendance record',
  LOCATION_CLAIM: 'Location claim', TEXT_STATEMENT: 'Written statement', OTHER: 'Other',
};
const REVIEW_DECISION_LABELS: Record<string, string> = {
  APPROVED: 'Confirm work completed', REJECTED: 'Decline', NEEDS_MORE_INFORMATION: 'Ask for more evidence',
};

// R3.5 — closed backend reason vocabulary
// (ke.securepay.agreement.funding.model, verified directly against source).
// AUTHORIZED never reaches this map — the funding UI only renders it when
// authorized is true.
const FUNDING_AUTHORITY_REASON_LABELS: Record<string, string> = {
  NOT_PARTICIPANT: 'You are not a participant on this agreement.',
  IDENTITY_INACTIVE: 'Your account is not currently active.',
  PARTICIPANT_NOT_CONFIRMED: 'You have not yet confirmed this agreement.',
  NOT_PAYER_FOR_AGREEMENT: 'You are not the participant responsible for funding this agreement.',
  NO_MONETARY_OBLIGATION: 'This agreement has no payment obligation recorded to fund.',
  MULTIPLE_MONETARY_OBLIGATIONS_AMBIGUOUS: 'This agreement has more than one payment obligation, so SecurePay cannot determine what to fund yet.',
  OBLIGATION_NOT_AVAILABLE: 'The payment obligation is not currently available to fund.',
};
function fundingAuthorityReasonLabel(reasonCode: string): string {
  return FUNDING_AUTHORITY_REASON_LABELS[reasonCode] ?? 'You are not currently able to fund this agreement.';
}

// R3.5 — same closed status enum as PaymentIntent.status
// (ke.securepay.core.payment.model, verified directly against source).
const FUNDING_INTENT_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Ready to start', INITIATION_PENDING: 'Starting…', ACTION_REQUIRED: 'Action required',
  PROVIDER_PENDING: 'Waiting on payment provider', CONFIRMATION_PENDING: 'Confirming with provider',
  CONFIRMED: 'Confirmed', FAILED: 'Failed', EXPIRED: 'Expired', CANCELLED: 'Cancelled',
};
function fundingIntentStatusLabel(status: string): string {
  return FUNDING_INTENT_STATUS_LABELS[status] ?? status;
}

const FUNDING_LATEST_ATTEMPT_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted to the payment provider', ACCEPTED: 'Accepted by the payment provider',
  ACTION_REQUIRED: 'Waiting on your action with the payment provider', REJECTED: 'Rejected by the payment provider',
  FAILED: 'The payment provider reported a failure',
};
const FUNDING_ATTEMPT_UNCERTAIN_STATUSES = new Set(['SUBMITTED', 'ACCEPTED', 'ACTION_REQUIRED']);

const FUNDING_TERMINAL_INTENT_STATUSES = new Set(['FAILED', 'EXPIRED', 'CANCELLED']);

// R4.5 — closed backend reason vocabulary
// (ke.securepay.core.paymentrelease.ReleaseAuthorityReasonCode, verified
// directly against source). AUTHORIZED never reaches this map — the
// release UI only renders it when authorized is true.
const RELEASE_AUTHORITY_REASON_LABELS: Record<string, string> = {
  NO_CURRENT_EVALUATION: 'Payment readiness has not been evaluated yet, so release is not available.',
  PAYMENT_READY_NOT_SATISFIED: 'This agreement is not yet Payment Ready, so release is not available.',
  AGREEMENT_NOT_ELIGIBLE: 'This agreement is not currently eligible for release.',
  NOT_AUTHORIZED: 'You are not the participant authorized to request release for this agreement.',
  RELEASE_ALREADY_REQUESTED: 'A release has already been requested for this agreement.',
};
function releaseAuthorityReasonLabel(reasonCode: string): string {
  return RELEASE_AUTHORITY_REASON_LABELS[reasonCode] ?? 'Release is not currently available for this agreement.';
}

// R4.5 — same closed settlementPhase enum as
// PaymentReleaseSettlementStatusResponse (verified directly against
// source). Distinct states, never flattened into "complete/incomplete".
const SETTLEMENT_PHASE_LABELS: Record<string, string> = {
  INSTRUCTION_CREATED: 'Release requested', RESERVED: 'Settlement processing',
  SETTLED: 'Settled', HELD_EXCEPTION: 'Settlement needs attention', COMPENSATED: 'Settlement adjusted',
};
function settlementPhaseLabel(phase: string): string {
  return SETTLEMENT_PHASE_LABELS[phase] ?? phase;
}

const RELEASE_REQUIRED_ACTION_LABELS: Record<string, string> = {
  NO_ACTION_REQUIRED: 'SecurePay is handling this. No action is needed from you.',
  OPERATIONS_REVIEW: 'This is under review by SecurePay. No action is needed from you right now.',
};
// USER_ACTION with no (or blank) customerSafeReason must never fall back to
// NO_ACTION_REQUIRED's "no action needed" copy — that would contradict
// backend authority. This is the only safe, truthful fallback: it says
// action is required without inventing what that action is.
const RELEASE_USER_ACTION_FALLBACK =
  'Action is required before settlement can continue. SecurePay has not provided further instructions yet.';

function releaseExceptionMessage(exception: SecurePayPaymentReleaseExceptionProjection | null): string {
  if (!exception) return RELEASE_REQUIRED_ACTION_LABELS.NO_ACTION_REQUIRED;
  switch (exception.requiredAction) {
    case 'USER_ACTION':
      return exception.customerSafeReason?.trim() ? exception.customerSafeReason : RELEASE_USER_ACTION_FALLBACK;
    case 'OPERATIONS_REVIEW':
      return RELEASE_REQUIRED_ACTION_LABELS.OPERATIONS_REVIEW;
    default:
      return RELEASE_REQUIRED_ACTION_LABELS.NO_ACTION_REQUIRED;
  }
}

// SHA-256 of the reference text itself, computed client-side — this is a
// technical satisfaction of the backend's required contentHash field, not a
// claim about verified file content. There is no file-storage/upload
// endpoint for ordinary obligation evidence, so nothing is hashed except
// the reference string the trader typed.
async function hashReference(reference: string): Promise<string> {
  const bytes = new TextEncoder().encode(reference);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const smallInputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-[#1a1a1a]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a1f]/25';

function RaiseIssueControl({
  agreementId, agreementVersionId, subjectType, subjectId, reasonCode, authHeader, onOpened,
}: {
  agreementId: string;
  agreementVersionId: string | undefined;
  subjectType: 'OBLIGATION' | 'EVIDENCE_ITEM';
  subjectId: string;
  reasonCode: 'PARTICIPANT_DISPUTE_OBLIGATION' | 'PARTICIPANT_DISPUTE_EVIDENCE';
  authHeader?: string;
  onOpened?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState<{ reviewCaseId: string; state: string } | null>(null);
  const keyRef = useRef(crypto.randomUUID());

  const submit = async () => {
    if (!agreementVersionId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await openAgreementReviewCase(
        {
          agreementId, agreementVersionId, subjectType, subjectId,
          openReasonCode: reasonCode,
          narrativeContext: narrative.trim() || undefined,
        },
        keyRef.current,
        authHeader,
      );
      if (!result.ok || !result.data) {
        setError(result.error || 'Could not open a review case. Please try again.');
        return;
      }
      setOpened({ reviewCaseId: result.data.reviewCaseId, state: result.data.state });
      onOpened?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (opened) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold">Review opened</p>
        <p className="mt-0.5">SecurePay has recorded this for formal review ({opened.state.toLowerCase()}). This does not decide the outcome — it hands the question to Agreement Review.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:underline">
        <Flag size={12} /> Raise an issue
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-2.5">
      {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
      <p className="text-xs text-amber-900 leading-relaxed">This opens a formal Agreement Review. SecurePay does not decide who is right — it records the issue for review.</p>
      <textarea value={narrative} onChange={e => setNarrative(e.target.value)} rows={2}
        placeholder="Optional — describe the issue" className={smallInputCls} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#1a1a1a]/50 hover:text-[#1a1a1a]/80">Cancel</button>
        <button type="button" onClick={submit} disabled={submitting}
          className="flex-1 py-2 rounded-lg text-xs font-medium bg-amber-800 text-white disabled:opacity-40">
          {submitting ? 'Opening…' : 'Open review case'}
        </button>
      </div>
    </div>
  );
}

// R5 — the Resolution Room for one Agreement Review case, expanded in place
// (same pattern as ObligationRow/VersionRow — no separate route). Every
// field traces to one of:
//   GET /agreement-reviews/{id}?agreementId=      — case detail (lazy, on expand)
//   GET /agreement-reviews/{id}/evidence           — evidence on record
//   POST .../acknowledgements                      — good-faith acknowledgment
//   POST .../responses                             — structured participant response
//   POST .../evidence                              — real multipart evidence upload
//   POST .../escalations                           — escalation intent
// SecurePay records the process; it never decides who is right. There is no
// participant-safe read of other participants' response text or
// acknowledgement timestamps — only the caller's own callerAcknowledged/
// callerResponded booleans exist, so this room never fabricates a full
// two-way thread (see SECUREPAY_GAP_REGISTER.md).
function ReviewCaseRow({
  agreementId, authHeader, caseSummary, obligations, onChanged,
}: {
  agreementId: string;
  authHeader?: string;
  caseSummary: SecurePayAgreementReviewCaseSummary;
  obligations: SecurePayAgreementObligation[] | null;
  onChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<SecurePayAgreementReviewCaseDetail | null>(null);
  const [evidence, setEvidence] = useState<SecurePayAgreementReviewEvidenceItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [acknowledging, setAcknowledging] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);
  const ackKeyRef = useRef(crypto.randomUUID());

  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseType, setResponseType] = useState<SecurePayAgreementReviewResponseType>('CLARIFICATION');
  const [responseNarrative, setResponseNarrative] = useState('');
  const [respondSubmitting, setRespondSubmitting] = useState(false);
  const [respondError, setRespondError] = useState<string | null>(null);
  const respondKeyRef = useRef(crypto.randomUUID());

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceType, setEvidenceType] = useState<SecurePayAgreementReviewEvidenceType>('DOCUMENT');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNarrative, setEvidenceNarrative] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const evidenceKeyRef = useRef(crypto.randomUUID());

  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [escalateError, setEscalateError] = useState<string | null>(null);
  const escalateKeyRef = useRef(crypto.randomUUID());

  const load = async () => {
    setLoading(true);
    setError(null);
    const [detailResult, evidenceResult] = await Promise.all([
      getAgreementReviewCase(caseSummary.reviewCaseId, agreementId, authHeader),
      listAgreementReviewEvidence(caseSummary.reviewCaseId, agreementId, authHeader),
    ]);
    setLoading(false);
    if (detailResult.ok && detailResult.data) setDetail(detailResult.data);
    if (evidenceResult.ok && evidenceResult.data) setEvidence(evidenceResult.data.items);
    if (!detailResult.ok || !evidenceResult.ok) {
      setError(detailResult.error || evidenceResult.error || 'Could not load this review case.');
    }
  };

  const toggle = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (detail || loading) return;
    await load();
  };

  const acknowledge = async () => {
    if (!detail || acknowledging) return;
    setAcknowledging(true);
    setAckError(null);
    try {
      const result = await acknowledgeAgreementReviewCase(
        detail.reviewCaseId, { agreementId, expectedVersion: detail.version }, ackKeyRef.current, authHeader,
      );
      if (!result.ok) {
        setAckError(result.error || 'Could not record your acknowledgement. Please try again.');
        return;
      }
      ackKeyRef.current = crypto.randomUUID();
      onChanged();
      await load();
    } finally {
      setAcknowledging(false);
    }
  };

  const submitResponse = async () => {
    if (!detail || respondSubmitting) return;
    setRespondSubmitting(true);
    setRespondError(null);
    try {
      const result = await submitAgreementReviewResponse(
        detail.reviewCaseId,
        { agreementId, expectedVersion: detail.version, responseType, narrative: responseNarrative.trim() || undefined },
        respondKeyRef.current,
        authHeader,
      );
      if (!result.ok) {
        setRespondError(result.error || 'Could not submit your response. Please try again.');
        return;
      }
      respondKeyRef.current = crypto.randomUUID();
      setShowResponseForm(false);
      setResponseNarrative('');
      onChanged();
      await load();
    } finally {
      setRespondSubmitting(false);
    }
  };

  const submitEvidence = async () => {
    if (!detail || !evidenceFile || submittingEvidence) return;
    setSubmittingEvidence(true);
    setEvidenceError(null);
    try {
      const result = await submitAgreementReviewEvidence(
        detail.reviewCaseId, agreementId, evidenceType, evidenceFile,
        evidenceKeyRef.current, evidenceNarrative.trim() || undefined, authHeader,
      );
      if (!result.ok) {
        setEvidenceError(result.error || 'Could not submit this evidence. Please try again.');
        return;
      }
      evidenceKeyRef.current = crypto.randomUUID();
      setShowEvidenceForm(false);
      setEvidenceFile(null);
      setEvidenceNarrative('');
      await load();
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const escalate = async () => {
    if (!detail || escalating) return;
    setEscalating(true);
    setEscalateError(null);
    try {
      const result = await requestAgreementReviewEscalation(
        detail.reviewCaseId, { agreementId, expectedVersion: detail.version }, escalateKeyRef.current, authHeader,
      );
      if (!result.ok) {
        setEscalateError(result.error || 'Could not request escalation. Please try again.');
        return;
      }
      escalateKeyRef.current = crypto.randomUUID();
      setShowEscalateConfirm(false);
      onChanged();
      await load();
    } finally {
      setEscalating(false);
    }
  };

  const subjectObligation = caseSummary.subjectType === 'OBLIGATION'
    ? obligations?.find(o => o.id === caseSummary.subjectId) ?? null
    : null;
  // Once the detail read has returned, it is the fresher authoritative case
  // state — the list summary can be stale (a case can change server-side
  // between the list read and the detail read). All action/terminal gating
  // inside the expanded room must follow it; only the collapsed row (before
  // detail is loaded) falls back to the summary.
  const effectiveState = detail?.state ?? caseSummary.state;
  const isTerminal = REVIEW_TERMINAL_STATES.has(effectiveState);

  return (
    <div className="border border-[#1a1a1a]/8 rounded-xl overflow-hidden">
      <button type="button" onClick={toggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#fafaf8] transition-colors">
        <div className="min-w-0 flex items-center gap-3">
          <LivingSecurePayMark
            state={reviewLivingMarkState(effectiveState)}
            size="xs"
            presence={effectiveState === 'EXPIRED' ? 'present' : 'polite'}
            label={`Agreement Review: ${reviewCaseStateLabel(effectiveState)}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1a1a1a]/85 truncate">{reviewCaseStateLabel(effectiveState)}</p>
            <p className="text-xs text-[#1a1a1a]/45 mt-0.5">
              {subjectObligation ? `About: ${subjectObligation.title}` : `Subject: ${caseSummary.subjectType.toLowerCase().replace(/_/g, ' ')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#1a1a1a]/40 shrink-0">
          <span>{formatDateTime(caseSummary.openedAt)}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#1a1a1a]/6 bg-[#fafaf8]">
          <div className="flex items-center gap-2 pt-3">
            <LivingSecurePayMark
              state={reviewLivingMarkState(effectiveState)}
              size="xs"
              presence={effectiveState === 'EXPIRED' ? 'present' : 'polite'}
              decorative
            />
            <p className="text-[10px] font-bold text-[#3a7a1f]/70 uppercase tracking-wider">Agreement Review room</p>
          </div>

          {loading && <SectionLoading />}
          {error && <SectionUnavailable message={error} />}

          {detail && (
            <div className="space-y-4">
              <p className="text-xs leading-relaxed text-[#1a1a1a]/50">
                SecurePay is coordinating this review; it does not decide who is right. While this issue is under review, release for this agreement may be restricted — see Payment readiness below for the current status.
              </p>

              {reviewParticipantRoleLabel(detail.callerRole) && (
                <p className="text-xs text-[#1a1a1a]/45">{reviewParticipantRoleLabel(detail.callerRole)}</p>
              )}

              {detail.responseDeadlineAt && !isTerminal && (
                <Row label="Response due" value={formatDateTime(detail.responseDeadlineAt)} />
              )}

              <div className="pt-1">
                <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Evidence on record</p>
                {evidence && evidence.length === 0 && <p className="text-sm text-[#1a1a1a]/40 mt-1">No evidence submitted yet.</p>}
                {evidence && evidence.length > 0 && (
                  <ul className="space-y-2 mt-1.5">
                    {evidence.map(e => (
                      <li key={e.evidenceId} className="text-sm text-[#1a1a1a]/70 border-b border-[#1a1a1a]/5 pb-2 last:border-0">
                        <div className="flex items-center justify-between gap-2">
                          <span>{REVIEW_EVIDENCE_TYPE_LABELS[e.evidenceType as SecurePayAgreementReviewEvidenceType] ?? e.evidenceType}: {e.originalFilename}</span>
                          <span className="text-xs text-[#1a1a1a]/40">{formatDateTime(e.submittedAt)}</span>
                        </div>
                        <p className="text-xs text-[#1a1a1a]/40 mt-0.5">{e.submittedByCaller ? 'Submitted by you' : 'Submitted by another participant'}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {!isTerminal && (
                  !showEvidenceForm ? (
                    <button type="button" onClick={() => setShowEvidenceForm(true)}
                      className="mt-2 text-xs font-medium text-[#3a7a1f] hover:underline">+ Add evidence</button>
                  ) : (
                    <div className="mt-2 rounded-xl border border-[#3a7a1f]/20 bg-[#f6faf2] p-3.5 space-y-2">
                      {evidenceError && <p className="text-xs text-red-700" role="alert">{evidenceError}</p>}
                      <select value={evidenceType} onChange={e => setEvidenceType(e.target.value as SecurePayAgreementReviewEvidenceType)}
                        className={smallInputCls}>
                        {REVIEW_EVIDENCE_TYPES.map(t => <option key={t} value={t}>{REVIEW_EVIDENCE_TYPE_LABELS[t]}</option>)}
                      </select>
                      <input type="file" onChange={e => setEvidenceFile(e.target.files?.[0] ?? null)}
                        className="w-full text-xs" />
                      <textarea value={evidenceNarrative} onChange={e => setEvidenceNarrative(e.target.value)}
                        rows={2} placeholder="Optional note" className={smallInputCls} />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setShowEvidenceForm(false); setEvidenceError(null); setEvidenceFile(null); }}
                          className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#1a1a1a]/50">Cancel</button>
                        <button type="button" onClick={submitEvidence} disabled={!evidenceFile || submittingEvidence}
                          className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#3a7a1f] text-white disabled:opacity-40">
                          {submittingEvidence ? 'Submitting…' : 'Submit evidence'}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {isTerminal ? (
                <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-3.5 py-3 space-y-1">
                  <p className="text-sm font-medium text-[#1a1a1a]/80">
                    {detail.state === 'DECIDED' && detail.terminalOutcome
                      ? reviewOutcomeLabel(detail.terminalOutcome)
                      : `This review is ${reviewCaseStateLabel(detail.state).toLowerCase()}.`}
                  </p>
                  {detail.decisionReasonCode && reviewDecisionReasonLabel(detail.decisionReasonCode) && (
                    <p className="text-xs text-[#1a1a1a]/50">{reviewDecisionReasonLabel(detail.decisionReasonCode)}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    {detail.callerAcknowledged ? (
                      <p className="text-xs text-[#3a7a1f] font-medium">You've acknowledged this review and are participating in resolving it.</p>
                    ) : (
                      <div>
                        {ackError && <p className="text-xs text-red-700 mb-1.5" role="alert">{ackError}</p>}
                        <button type="button" onClick={acknowledge} disabled={acknowledging}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#3a7a1f] text-white disabled:opacity-40">
                          {acknowledging ? 'Acknowledging…' : "I've seen this issue and I'm participating in resolving it"}
                        </button>
                      </div>
                    )}
                  </div>

                  {REVIEW_RESPONDABLE_ROLES.has(detail.callerRole) && (
                    <div>
                      {detail.callerResponded ? (
                        <p className="text-xs text-[#1a1a1a]/50">You've submitted a response to this review.</p>
                      ) : !showResponseForm ? (
                        <button type="button" onClick={() => setShowResponseForm(true)}
                          className="text-xs font-medium text-[#3a7a1f] hover:underline">Respond to this review</button>
                      ) : (
                        <div className="rounded-xl border border-[#3a7a1f]/20 bg-[#f6faf2] p-3.5 space-y-2">
                          {respondError && <p className="text-xs text-red-700" role="alert">{respondError}</p>}
                          <select value={responseType} onChange={e => setResponseType(e.target.value as SecurePayAgreementReviewResponseType)}
                            className={smallInputCls}>
                            {REVIEW_RESPONSE_TYPES.map(t => <option key={t} value={t}>{REVIEW_RESPONSE_TYPE_LABELS[t]}</option>)}
                          </select>
                          <textarea value={responseNarrative} onChange={e => setResponseNarrative(e.target.value)}
                            rows={3} placeholder="Optional — describe your position" className={smallInputCls} />
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setShowResponseForm(false)}
                              className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#1a1a1a]/50">Cancel</button>
                            <button type="button" onClick={submitResponse} disabled={respondSubmitting}
                              className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#3a7a1f] text-white disabled:opacity-40">
                              {respondSubmitting ? 'Submitting…' : 'Submit response'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {REVIEW_ESCALATABLE_STATES.has(detail.state) && (
                    <div>
                      {!showEscalateConfirm ? (
                        <button type="button" onClick={() => setShowEscalateConfirm(true)}
                          className="text-xs font-medium text-amber-800 hover:underline">Request escalation</button>
                      ) : (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 space-y-2.5">
                          {escalateError && <p className="text-xs text-red-700" role="alert">{escalateError}</p>}
                          <p className="text-xs text-amber-900 leading-relaxed">
                            Escalating moves this issue into SecurePay's next formal process. It preserves the agreement's lifecycle and evidence, and does not mean SecurePay has decided the merits.
                          </p>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setShowEscalateConfirm(false)}
                              className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#1a1a1a]/50">Cancel</button>
                            <button type="button" onClick={escalate} disabled={escalating}
                              className="flex-1 py-2 rounded-lg text-xs font-medium bg-amber-800 text-white disabled:opacity-40">
                              {escalating ? 'Requesting…' : 'Confirm escalation'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ObligationRow({
  agreementId, agreementVersionId, obligation, authHeader, myParticipantId, onChanged,
}: {
  agreementId: string;
  agreementVersionId: string | undefined;
  obligation: SecurePayAgreementObligation;
  authHeader?: string;
  myParticipantId: string | null;
  onChanged: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [evidence, setEvidence] = useState<SecurePayAgreementEvidence[] | null>(null);
  const [completion, setCompletion] = useState<SecurePayObligationCompletionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState<{ evidenceType: SecurePayEvidenceType; description: string; objectReference: string }>({ evidenceType: 'TEXT_STATEMENT', description: '', objectReference: '' });
  const [submittingEvidence, setSubmittingEvidence] = useState(false);
  const [evidenceFormError, setEvidenceFormError] = useState<string | null>(null);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Only the responsible participant may submit evidence (backend-enforced),
  // so whoever submitted it must be that participant — the review list has
  // no submitter field to check directly, so this derives "not the
  // submitter" from that same backend constraint rather than guessing.
  const isResponsible = myParticipantId != null && myParticipantId === obligation.responsibleParticipantId;
  const canReview = myParticipantId != null && !isResponsible;

  const load = async () => {
    setLoading(true);
    setError(null);
    const [evidenceResult, completionResult] = await Promise.all([
      listAgreementObligationEvidence(agreementId, obligation.id, authHeader),
      getObligationCompletionStatus(agreementId, obligation.id, authHeader),
    ]);
    setLoading(false);
    if (evidenceResult.ok && evidenceResult.data) setEvidence(evidenceResult.data);
    if (completionResult.ok && completionResult.data) setCompletion(completionResult.data);
    if (!evidenceResult.ok || !completionResult.ok) {
      setError(evidenceResult.error || completionResult.error || 'Could not load this obligation.');
    }
  };

  const toggle = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (evidence || loading) return;
    await load();
  };

  const startIdempotencyKeyRef = useRef(crypto.randomUUID());
  const start = async () => {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    try {
      const result = await startObligation(agreementId, obligation.id, { idempotencyKey: startIdempotencyKeyRef.current }, authHeader);
      if (!result.ok) {
        setStartError(result.error || 'Could not start this obligation. Please try again.');
        return;
      }
      onChanged();
    } finally {
      setStarting(false);
    }
  };

  const completeIdempotencyKeyRef = useRef(crypto.randomUUID());
  const complete = async () => {
    if (completing) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      const result = await completeObligation(agreementId, obligation.id, { idempotencyKey: completeIdempotencyKeyRef.current }, authHeader);
      if (!result.ok) {
        setCompleteError(result.error || 'Could not mark this obligation complete. Please try again.');
        return;
      }
      onChanged();
      await load();
    } finally {
      setCompleting(false);
    }
  };

  const evidenceIdempotencyKeyRef = useRef(crypto.randomUUID());
  const submitEvidence = async () => {
    if (submittingEvidence || !evidenceForm.objectReference.trim()) return;
    setSubmittingEvidence(true);
    setEvidenceFormError(null);
    try {
      const contentHash = await hashReference(evidenceForm.objectReference.trim());
      const result = await submitAgreementEvidence(
        agreementId, obligation.id,
        {
          idempotencyKey: evidenceIdempotencyKeyRef.current,
          evidenceType: evidenceForm.evidenceType,
          description: evidenceForm.description.trim() || undefined,
          objectReference: evidenceForm.objectReference.trim(),
          contentHash,
          source: 'TRADER_APP_SUBMISSION',
          capturedAt: new Date().toISOString(),
        },
        authHeader,
      );
      if (!result.ok) {
        setEvidenceFormError(result.error || 'Could not submit evidence. Please try again.');
        return;
      }
      evidenceIdempotencyKeyRef.current = crypto.randomUUID();
      setShowEvidenceForm(false);
      setEvidenceForm({ evidenceType: 'TEXT_STATEMENT', description: '', objectReference: '' });
      onChanged();
      await load();
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const reviewKeyRef = useRef(crypto.randomUUID());
  const submitReview = async (evidenceId: string, decision: 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFORMATION') => {
    if (reviewSubmitting) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const result = await reviewAgreementEvidence(
        agreementId, evidenceId,
        { idempotencyKey: reviewKeyRef.current, decision, reason: reviewReason.trim() || undefined },
        authHeader,
      );
      if (!result.ok) {
        setReviewError(result.error || 'Could not record your review. Please try again.');
        return;
      }
      reviewKeyRef.current = crypto.randomUUID();
      setReviewingId(null);
      setReviewReason('');
      onChanged();
      await load();
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="border border-[#1a1a1a]/8 rounded-xl overflow-hidden">
      <button type="button" onClick={toggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#fafaf8] transition-colors">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#1a1a1a]/85 truncate">{obligation.title}</p>
          {obligation.amountMinor != null && obligation.currency && (
            <p className="text-xs text-[#1a1a1a]/45 mt-0.5">
              {formatMinorMoney(obligation.currency, obligation.amountMinor) ?? 'Amount cannot be displayed.'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#1a1a1a]/40 shrink-0">
          <span>{obligationStatusLabel(obligation.status)}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#1a1a1a]/6 bg-[#fafaf8]">
          {obligation.description && <p className="text-xs text-[#1a1a1a]/50 pt-3 whitespace-pre-wrap">{obligation.description}</p>}

          {loading && <SectionLoading />}
          {error && <SectionUnavailable message={error} />}

          {isResponsible && obligation.status === 'AVAILABLE' && (
            <div className="pt-1">
              {startError && <p className="text-xs text-red-700 mb-1.5" role="alert">{startError}</p>}
              <button type="button" onClick={start} disabled={starting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#3a7a1f] text-white disabled:opacity-40">
                {starting ? 'Starting…' : 'Start work'}
              </button>
            </div>
          )}

          <div className="pt-1">
            <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Evidence</p>
            {evidence && evidence.length === 0 && <p className="text-sm text-[#1a1a1a]/40 mt-1">No evidence submitted yet.</p>}
            {evidence && evidence.length > 0 && (
              <ul className="space-y-2 mt-1.5">
                {evidence.map(e => (
                  <li key={e.id} className="text-sm text-[#1a1a1a]/70 space-y-1.5 border-b border-[#1a1a1a]/5 pb-2 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <span>{EVIDENCE_TYPE_LABELS[e.evidenceType as SecurePayEvidenceType] ?? e.evidenceType}</span>
                      <span className="text-xs text-[#1a1a1a]/40">{e.status.toLowerCase().replace(/_/g, ' ')} · {formatDateTime(e.submittedAt)}</span>
                    </div>
                    {e.description && <p className="text-xs text-[#1a1a1a]/50">{e.description}</p>}
                    {canReview && (e.status === 'SUBMITTED' || e.status === 'UNDER_REVIEW') && (
                      reviewingId === e.id ? (
                        <div className="space-y-2">
                          {reviewError && <p className="text-xs text-red-700" role="alert">{reviewError}</p>}
                          <input value={reviewReason} onChange={ev => setReviewReason(ev.target.value)}
                            placeholder="Optional reason" className={smallInputCls} />
                          <div className="flex flex-wrap gap-1.5">
                            {(['APPROVED', 'REJECTED', 'NEEDS_MORE_INFORMATION'] as const).map(decision => (
                              <button key={decision} type="button" disabled={reviewSubmitting}
                                onClick={() => submitReview(e.id, decision)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#1a1a1a]/15 text-[#1a1a1a]/70 disabled:opacity-40 hover:border-[#3a7a1f]/40">
                                {REVIEW_DECISION_LABELS[decision]}
                              </button>
                            ))}
                            <button type="button" onClick={() => setReviewingId(null)}
                              className="px-3 py-1.5 text-xs text-[#1a1a1a]/40">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setReviewingId(e.id)}
                          className="text-xs font-medium text-[#3a7a1f] hover:underline">You need to review this evidence</button>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
            {isResponsible && (obligation.status === 'IN_PROGRESS' || obligation.status === 'EVIDENCE_SUBMITTED') && (
              !showEvidenceForm ? (
                <button type="button" onClick={() => setShowEvidenceForm(true)}
                  className="mt-2 text-xs font-medium text-[#3a7a1f] hover:underline">+ Submit evidence</button>
              ) : (
                <div className="mt-2 rounded-xl border border-[#3a7a1f]/20 bg-[#f6faf2] p-3.5 space-y-2">
                  {evidenceFormError && <p className="text-xs text-red-700" role="alert">{evidenceFormError}</p>}
                  <select value={evidenceForm.evidenceType} onChange={e => setEvidenceForm(f => ({ ...f, evidenceType: e.target.value as SecurePayEvidenceType }))}
                    className={smallInputCls}>
                    {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{EVIDENCE_TYPE_LABELS[t]}</option>)}
                  </select>
                  <input value={evidenceForm.objectReference} onChange={e => setEvidenceForm(f => ({ ...f, objectReference: e.target.value }))}
                    placeholder="Reference (link, receipt number, delivery note) — SecurePay does not store files" className={smallInputCls} />
                  <textarea value={evidenceForm.description} onChange={e => setEvidenceForm(f => ({ ...f, description: e.target.value }))}
                    rows={2} placeholder="Optional note" className={smallInputCls} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setShowEvidenceForm(false); setEvidenceFormError(null); }}
                      className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#1a1a1a]/50">Cancel</button>
                    <button type="button" onClick={submitEvidence} disabled={!evidenceForm.objectReference.trim() || submittingEvidence}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#3a7a1f] text-white disabled:opacity-40">
                      {submittingEvidence ? 'Submitting…' : 'Submit evidence'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {completion && (
            <div className="pt-1">
              {completion.eligible ? (
                <div>
                  {completeError && <p className="text-xs text-red-700 mb-1.5" role="alert">{completeError}</p>}
                  <button type="button" onClick={complete} disabled={completing}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#3a7a1f] text-white disabled:opacity-40">
                    {completing ? 'Confirming…' : 'Confirm work completed'}
                  </button>
                </div>
              ) : obligation.status !== 'COMPLETED' && completion.unmetRequirements.length > 0 ? (
                <p className="text-xs text-[#1a1a1a]/40">No action is needed from you right now — waiting on: {completion.unmetRequirements.join(', ').toLowerCase().replace(/_/g, ' ')}.</p>
              ) : null}
            </div>
          )}

          <div className="pt-1">
            <RaiseIssueControl
              agreementId={agreementId} agreementVersionId={agreementVersionId}
              subjectType="OBLIGATION" subjectId={obligation.id}
              reasonCode="PARTICIPANT_DISPUTE_OBLIGATION" authHeader={authHeader}
              onOpened={onChanged}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MoneyRecord({ record }: { record: unknown }) {
  if (!record || typeof record !== 'object') {
    return <SectionUnavailable message="Money record details cannot be displayed." />;
  }
  const candidate = record as Partial<SecurePayAgreementMoneyRecord>;
  if (typeof candidate.recordType !== 'string' || typeof candidate.status !== 'string'
      || typeof candidate.currency !== 'string' || typeof candidate.amountMinor !== 'string'
      || typeof candidate.occurredAt !== 'string') {
    return <SectionUnavailable message="Money record details cannot be displayed." />;
  }
  const knownCreation = candidate.recordType === 'RELEASE_INSTRUCTION_CREATED'
    && candidate.status === 'INSTRUCTION_CREATED';
  // R3.5 — FUNDING_PAYMENT_INTENT records carry the payment intent's own
  // status value (see SecurePayAgreementPaymentIntentStatus); render the
  // same plain-language mapping the Funding section uses.
  const knownFunding = candidate.recordType === 'FUNDING_PAYMENT_INTENT'
    && FUNDING_INTENT_STATUS_LABELS[candidate.status] != null;
  const amount = formatDecimalMinorMoney(candidate.currency, candidate.amountMinor);
  const occurredAt = validDateTime(candidate.occurredAt);

  if (!amount || !occurredAt) {
    return <SectionUnavailable message="Money record details cannot be displayed." />;
  }

  let title = 'Money record';
  let description = 'This record has a status that is not yet supported for display.';
  if (knownCreation) {
    title = 'Release instruction created';
    description = 'A release instruction was created for this agreement.';
  } else if (knownFunding) {
    title = `Funding — ${fundingIntentStatusLabel(candidate.status).toLowerCase()}`;
    description = 'This reflects a payment intent created to fund this agreement. It is a status record only, separate from Payment Ready and release.';
  }

  return (
    <li className="space-y-2 py-3 border-b border-[#1a1a1a]/5 last:border-0">
      <p className="text-sm font-medium text-[#1a1a1a]/80">{title}</p>
      <p className="text-xs leading-relaxed text-[#1a1a1a]/50">{description}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Row label="Amount" value={amount} />
        <Row label="Occurred" value={occurredAt} />
      </div>
    </li>
  );
}

// R3.5 — funding entry converged into Agreement Detail (not a separate
// wallet-first flow). Every displayed fact traces to one of:
//   GET /agreements/{id}/participants/me/funding-authority — may I fund now
//   GET /agreements/{id}/payment-intents                    — refresh-safe
//     rediscovery of intents already created for this agreement
//   GET /agreements/{id}/funding-options                    — eligible
//     rails only, never the full provider enum
//   POST /agreements/{id}/funding-quotes                    — authoritative
//     rail-specific cost; platformChargeMinor is currently always 0 (a
//     documented backend gap, not "SecurePay charges nothing")
//   POST /agreements/{id}/payment-intents                   — creates an
//     agreement-bound intent; amount/currency/payer are server-derived
//   POST /payment-intents/{id}/initiate (existing)           — the backend
//     re-checks funding authority and rail eligibility here regardless of
//     what an earlier funding-options/funding-quotes read showed
// Creating or initiating a payment intent is never treated as payment
// success, funding, Payment Ready, release, or settlement — Payment Ready
// stays a separate, backend-calculated section below this one.
function FundingSection({
  agreementId, authHeader, fundingAuthority, fundingOptions, paymentIntents, forceBlockedReason, onChanged,
}: {
  agreementId: string;
  authHeader?: string;
  fundingAuthority: SectionState<SecurePayAgreementFundingAuthority>;
  fundingOptions: SectionState<SecurePayAgreementFundingOption[]>;
  paymentIntents: SectionState<SecurePayAgreementPaymentIntentSummary[]>;
  forceBlockedReason?: string;
  onChanged: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createKeyRef = useRef(crypto.randomUUID());

  const [selectedRail, setSelectedRail] = useState<SecurePayAgreementFundingRailCode | null>(null);
  const [quote, setQuote] = useState<SecurePayAgreementFundingQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [initiating, setInitiating] = useState(false);
  const [initiateError, setInitiateError] = useState<string | null>(null);
  const [initiateResult, setInitiateResult] = useState<SecurePayInitiatePaymentResponse | null>(null);
  const initiateKeyRef = useRef(crypto.randomUUID());

  if (forceBlockedReason) {
    return <p className="text-sm leading-relaxed text-[#1a1a1a]/50">{forceBlockedReason}</p>;
  }

  if (fundingAuthority.status === 'loading') return <SectionLoading />;
  if (fundingAuthority.status === 'error') return <SectionUnavailable message={fundingAuthority.error!} />;
  const authority = fundingAuthority.data;
  if (!authority) return <SectionUnavailable message="Funding authority could not be determined." />;

  if (!authority.authorized) {
    return (
      <p className="text-sm leading-relaxed text-[#1a1a1a]/50">
        {fundingAuthorityReasonLabel(authority.reasonCode)}
      </p>
    );
  }

  const intents = paymentIntents.status === 'ok' ? (paymentIntents.data ?? []) : [];
  // Backend orders createdAt DESC, id DESC — the first item is the
  // current/latest intent. Never re-sorted client-side.
  const latest = intents[0] ?? null;
  const canCreateNew = !latest || (FUNDING_TERMINAL_INTENT_STATUSES.has(latest.status) && latest.retryEligible);
  const activeForInitiation = Boolean(latest) && latest!.status === 'CREATED';

  const options = fundingOptions.status === 'ok' ? (fundingOptions.data ?? []) : [];
  const selectedOption = options.find(o => o.railCode === selectedRail) ?? null;
  const canInitiate = Boolean(selectedOption) && (!selectedOption!.quoteAvailable || Boolean(quote));

  const createIntent = async () => {
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createAgreementPaymentIntent(
        agreementId, { idempotencyKey: createKeyRef.current }, authHeader,
      );
      if (!result.ok || !result.data) {
        setCreateError(result.error || 'Could not start funding this agreement. Please try again.');
        return;
      }
      createKeyRef.current = crypto.randomUUID();
      setSelectedRail(null);
      setQuote(null);
      onChanged();
    } finally {
      setCreating(false);
    }
  };

  const resetRailSelection = () => {
    setQuote(null);
    setQuoteError(null);
    setInitiateResult(null);
    setInitiateError(null);
  };

  const requestQuote = async (railCode: SecurePayAgreementFundingRailCode) => {
    setSelectedRail(railCode);
    resetRailSelection();
    setQuoting(true);
    try {
      const result = await createAgreementFundingQuote(agreementId, { railCode }, authHeader);
      if (!result.ok || !result.data) {
        setQuoteError(result.error || 'Could not get a quote for this payment method. Please try again.');
        return;
      }
      setQuote(result.data);
    } finally {
      setQuoting(false);
    }
  };

  const chooseDirectRail = (railCode: SecurePayAgreementFundingRailCode) => {
    setSelectedRail(railCode);
    resetRailSelection();
  };

  const initiate = async () => {
    if (!latest || !selectedOption || !canInitiate || initiating) return;
    setInitiating(true);
    setInitiateError(null);
    try {
      const result = await initiatePaymentIntent(latest.id, {
        idempotencyKey: initiateKeyRef.current,
        providerIdentifier: selectedOption.railCode,
        ...(quote ? { quoteReference: quote.quoteReference } : {}),
      }, authHeader);
      if (!result.ok || !result.data) {
        setInitiateError(result.error || 'Could not start this payment. Please try again.');
        return;
      }
      initiateKeyRef.current = crypto.randomUUID();
      setInitiateResult(result.data);
      onChanged();
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-[#1a1a1a]/45">
        Funding here creates and tracks a payment for this agreement. It is separate from Payment Ready, shown below, and never releases funds by itself.
      </p>

      {intents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Funding attempts</p>
          <ul className="space-y-2">
            {intents.map(i => (
              <li key={i.id} className="border border-[#1a1a1a]/8 rounded-xl px-4 py-3 text-sm space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[#1a1a1a]/80">{fundingIntentStatusLabel(i.status)}</span>
                  <span className="text-xs text-[#1a1a1a]/40">{formatMinorMoney(i.currency, i.amountMinor) ?? 'Amount cannot be displayed.'}</span>
                </div>
                {i.latestAttemptStatus && (
                  <p className="text-xs text-[#1a1a1a]/50">
                    {FUNDING_LATEST_ATTEMPT_LABELS[i.latestAttemptStatus] ?? i.latestAttemptStatus}
                    {FUNDING_ATTEMPT_UNCERTAIN_STATUSES.has(i.latestAttemptStatus) && ' — SecurePay is still checking this with the payment provider. This is not a failure yet.'}
                  </p>
                )}
                <p className="text-[11px] text-[#1a1a1a]/35">Created {formatDateTime(i.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeForInitiation && latest && (
        <div className="space-y-3 pt-1">
          <p className="text-sm text-[#1a1a1a]/60">Choose how to fund this agreement.</p>
          {fundingOptions.status === 'loading' && <SectionLoading />}
          {fundingOptions.status === 'error' && <SectionUnavailable message={fundingOptions.error!} />}
          {fundingOptions.status === 'ok' && options.length === 0 && (
            <p className="text-sm text-[#1a1a1a]/40">No funding methods are currently available.</p>
          )}
          {options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {options.map(o => (
                <button key={o.railCode} type="button"
                  onClick={() => (o.quoteAvailable ? requestQuote(o.railCode) : chooseDirectRail(o.railCode))}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-colors ${
                    selectedRail === o.railCode
                      ? 'border-[#3a7a1f] text-[#3a7a1f] bg-[#3a7a1f]/5'
                      : 'border-[#1a1a1a]/15 text-[#1a1a1a]/70'
                  }`}>
                  {o.displayName}
                </button>
              ))}
            </div>
          )}

          {quoting && <SectionLoading />}
          {quoteError && <p className="text-xs text-red-700" role="alert">{quoteError}</p>}
          {quote && (
            <div className="rounded-xl border border-[#1a1a1a]/8 bg-[#fafaf8] p-3.5 space-y-1.5">
              <Row label="Amount" value={formatMinorMoney(quote.currency, quote.amountMinor) ?? 'Amount cannot be displayed.'} />
              <Row label="Provider charge" value={formatMinorMoney(quote.currency, quote.providerChargeMinor) ?? 'Amount cannot be displayed.'} />
              <Row label="Platform charge" value={formatMinorMoney(quote.currency, quote.platformChargeMinor) ?? 'Amount cannot be displayed.'} />
              <Row label="Total" value={formatMinorMoney(quote.currency, quote.totalChargeMinor) ?? 'Amount cannot be displayed.'} />
              <p className="text-[11px] text-[#1a1a1a]/35">Quote expires {formatDateTime(quote.expiresAt)}</p>
            </div>
          )}
          {selectedOption && !selectedOption.quoteAvailable && (
            <p className="text-xs text-[#1a1a1a]/45">This method does not provide a quote before payment. The amount charged is the agreement's recorded amount.</p>
          )}

          {selectedOption && (
            <div>
              {initiateError && <p className="text-xs text-red-700 mb-1.5" role="alert">{initiateError}</p>}
              <button type="button" onClick={initiate} disabled={!canInitiate || initiating}
                className="px-4 py-2.5 rounded-xl bg-[#3a7a1f] disabled:opacity-40 text-white text-sm font-medium">
                {initiating ? 'Starting…' : `Fund with ${selectedOption.displayName}`}
              </button>
            </div>
          )}

          {initiateResult && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold">Payment started</p>
              <p className="mt-0.5">
                SecurePay is checking this with the payment provider. This does not yet mean the payment is confirmed.
                {initiateResult.metadata?.masked_msisdn ? ` Sent to ${initiateResult.metadata.masked_msisdn}.` : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {canCreateNew && (
        <div className="pt-1">
          {createError && <p className="text-xs text-red-700 mb-1.5" role="alert">{createError}</p>}
          <button type="button" onClick={createIntent} disabled={creating}
            className="px-4 py-2.5 rounded-xl bg-[#3a7a1f] disabled:opacity-40 text-white text-sm font-medium">
            {creating ? 'Starting…' : latest ? 'Try funding again' : 'Start funding this agreement'}
          </button>
        </div>
      )}
    </div>
  );
}

// R4.5 — release entry converged into Agreement Detail (not a separate
// settlement page). Every displayed fact traces to one of:
//   GET /agreements/{id}/participants/me/release-authority — may I request
//     release now (composes the current READY Payment Ready evaluation with
//     the existing release-authorization domain rule; never creator/roleCode
//     inference)
//   GET /agreements/{id}/payment-release/instructions       — refresh-safe
//     rediscovery of release instructions already created for this agreement
//   GET .../instructions/{id}/settlement-status              — authoritative
//     settlement phase for the current instruction, with any held/
//     compensated exception embedded inline
//   POST /agreements/{id}/payment-release/instructions       — creates the
//     release instruction; financial bindings are entirely server-derived
// Requesting release is never treated as settlement, and settlement
// processing is never treated as settled — those stay visually and
// textually distinct below.
function ReleaseSection({
  agreementId, authHeader, releaseAuthority, releaseInstructions, settlementStatus, monetaryObligationId, onChanged,
}: {
  agreementId: string;
  authHeader?: string;
  releaseAuthority: SectionState<SecurePayAgreementReleaseAuthority>;
  releaseInstructions: SectionState<SecurePayPaymentReleaseInstruction[]>;
  settlementStatus: SectionState<SecurePayPaymentReleaseSettlementStatus | null>;
  monetaryObligationId: string | null;
  onChanged: () => void;
}) {
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  if (releaseAuthority.status === 'loading') return <SectionLoading />;
  if (releaseAuthority.status === 'error') return <SectionUnavailable message={releaseAuthority.error!} />;
  const authority = releaseAuthority.data;
  if (!authority) return <SectionUnavailable message="Release authority could not be determined." />;

  const instructions = releaseInstructions.status === 'ok' ? (releaseInstructions.data ?? []) : [];
  // Backend orders createdAt DESC — the first item is the current/latest
  // instruction. Never re-sorted client-side.
  const latest = instructions[0] ?? null;
  const status = settlementStatus.status === 'ok' ? settlementStatus.data : null;

  const requestRelease = async () => {
    if (requesting || !authority.authorized || !authority.evaluationId || !monetaryObligationId) return;
    setRequesting(true);
    setRequestError(null);
    try {
      // Sequence is not exposed by money-status or release-authority; it is
      // read fresh from the dedicated evaluation endpoint immediately before
      // requesting, using the same productType/scopeIdentifiers the backend
      // trigger itself constructs — never guessed or cached client-side.
      const evaluationResult = await getPaymentReadyEvaluation(agreementId, 'AGREEMENT', [monetaryObligationId], authHeader);
      if (!evaluationResult.ok || !evaluationResult.data) {
        setRequestError(evaluationResult.error || 'Could not confirm the current payment readiness. Please try again.');
        return;
      }
      const result = await createPaymentReleaseInstruction(
        agreementId,
        {
          paymentReadyEvaluationId: authority.evaluationId,
          paymentReadyEvaluationSequence: evaluationResult.data.sequence,
          triggerReason: 'Participant requested release from SecurePay.',
        },
        idempotencyKeyRef.current,
        authHeader,
      );
      if (!result.ok) {
        setRequestError(result.error || 'Could not request release. Please try again.');
        return;
      }
      idempotencyKeyRef.current = crypto.randomUUID();
      onChanged();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-[#1a1a1a]/45">
        Requesting release tells SecurePay that money should follow this agreement. It does not move money immediately — settlement happens separately, shown below.
      </p>

      {!authority.authorized && !latest && (
        <p className="text-sm leading-relaxed text-[#1a1a1a]/50">
          {releaseAuthorityReasonLabel(authority.reasonCode)}
        </p>
      )}

      {authority.authorized && (
        <div>
          {requestError && <p className="text-xs text-red-700 mb-1.5" role="alert">{requestError}</p>}
          <button type="button" onClick={requestRelease} disabled={requesting}
            className="px-4 py-2.5 rounded-xl bg-[#3a7a1f] disabled:opacity-40 text-white text-sm font-medium">
            {requesting ? 'Requesting…' : 'Request release'}
          </button>
        </div>
      )}

      {latest && (
        <div className="rounded-xl border border-[#1a1a1a]/8 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#1a1a1a]/85">
              {status ? settlementPhaseLabel(status.settlementPhase) : 'Release requested'}
            </span>
            <span className="text-xs text-[#1a1a1a]/40">{formatDateTime(latest.createdAt)}</span>
          </div>

          {status?.settlementPhase === 'HELD_EXCEPTION' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold">Settlement needs attention</p>
              <p className="mt-0.5">{releaseExceptionMessage(status.exception)}</p>
            </div>
          )}

          {status?.settlementPhase === 'COMPENSATED' && (
            <p className="text-xs leading-relaxed text-[#1a1a1a]/50">
              {status.exception?.customerSafeReason ?? 'SecurePay has recorded a compensating action for this release.'}
            </p>
          )}

          {status?.settlementPhase === 'SETTLED' && (
            <div className="flex items-center gap-2 rounded-xl border border-[#3a7a1f]/20 bg-[#f6faf2] px-3.5 py-2.5">
              <CheckCircle2 size={15} className="text-[#3a7a1f] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">Trade completed</p>
                <p className="text-xs text-[#1a1a1a]/50 leading-relaxed">
                  Settlement for this agreement is complete.
                  {status.settledAt ? ` Settled ${formatDateTime(status.settledAt)}.` : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// A secondary section (participants, versions, confirmations, activity) is
// tracked independently of the core agreement read so that one failing
// section never blocks or fabricates the others — see the module doc above
// and Phase 4 Slice 1's requirement I ("partial read failure").
interface SectionState<T> {
  status: 'loading' | 'ok' | 'error';
  data: T | null;
  error: string | null;
}

const LOADING = <T,>(): SectionState<T> => ({ status: 'loading', data: null, error: null });

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="b4-agreement-card bg-white rounded-2xl border border-[#1a1a1a]/6 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#3a7a1f]/10 flex items-center justify-center text-[#3a7a1f]">
          {icon}
        </div>
        <h2 className="font-display text-base font-medium text-[#1a1a1a]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SectionUnavailable({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

function SectionLoading() {
  return (
    <div className="flex items-center gap-2 py-2 text-sm text-[#1a1a1a]/40">
      <Loader2 size={14} className="animate-spin" /> Loading…
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">{label}</p>
      <div className="text-sm text-[#1a1a1a]/80">{value}</div>
    </div>
  );
}

function VersionRow({
  agreementId, version, authHeader,
}: {
  agreementId: string;
  version: SecurePayAgreementVersion;
  authHeader?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<SecurePayAgreementVersion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (detail || loading) return;
    setLoading(true);
    setError(null);
    // Authoritative single-version read (AgreementController#getVersion) —
    // never derives contentHash or snapshot from the list response, even
    // though the list already carries the same fields, so this stays the
    // one source of truth for "view this exact version".
    const result = await getAgreementVersion(agreementId, version.id, authHeader);
    setLoading(false);
    if (!result.ok || !result.data) {
      setError(result.error || 'Could not load this version.');
      return;
    }
    setDetail(result.data);
  };

  return (
    <div className="border border-[#1a1a1a]/8 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#fafaf8] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-[#1a1a1a]/85">Version {version.versionNumber}</span>
          {version.versionStatus === 'CURRENT' && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3a7a1f] bg-[#3a7a1f]/10 px-2 py-0.5 rounded-full">
              Current
            </span>
          )}
          {version.materialChange && (
            <span className="text-[10px] font-medium text-[#1a1a1a]/40">Material change</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#1a1a1a]/40">
          <span>{formatDateTime(version.createdAt)}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#1a1a1a]/6 bg-[#fafaf8]">
          <p className="text-xs text-[#1a1a1a]/50 pt-3">{versionStatusLabel(version.versionStatus)}</p>
          {loading && <SectionLoading />}
          {error && <SectionUnavailable message={error} />}
          {detail && (
            <div className="space-y-3">
              <Row label="Content hash" value={<span className="font-mono text-xs break-all">{detail.contentHash}</span>} />
              <p className="text-[11px] text-[#1a1a1a]/35 leading-relaxed -mt-2">
                A verification hash for audit purposes — not intended to be read as text.
              </p>
              {detail.amendmentReason && <Row label="Amendment reason" value={detail.amendmentReason} />}
              {detail.parentVersionId && (
                <Row label="Previous version id" value={<span className="font-mono text-xs break-all">{detail.parentVersionId}</span>} />
              )}
              <Row
                label="Recorded content"
                value={
                  <pre className="text-xs font-mono bg-white border border-[#1a1a1a]/8 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(detail.snapshot, null, 2)}
                  </pre>
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AgreementDetail() {
  const { agreementId: rawId } = useParams<{ agreementId?: string }>();
  const agreementId = rawId?.trim() || null;
  const { user, session } = useAuth();

  const [core, setCore] = useState<SectionState<SecurePayAgreement>>(LOADING());
  const [participants, setParticipants] = useState<SectionState<SecurePayAgreementParticipant[]>>(LOADING());
  const [versions, setVersions] = useState<SectionState<SecurePayAgreementVersion[]>>(LOADING());
  const [confirmations, setConfirmations] = useState<SectionState<SecurePayAgreementConfirmation[]>>(LOADING());
  const [confirmationStatus, setConfirmationStatus] = useState<SectionState<SecurePayAgreementConfirmationStatus[]>>(LOADING());
  const [activity, setActivity] = useState<SectionState<SecurePayAgreementActivity[]>>(LOADING());
  const [moneyStatus, setMoneyStatus] = useState<SectionState<SecurePayAgreementMoneyStatus>>(LOADING());
  const [moneyRecords, setMoneyRecords] = useState<SectionState<SecurePayAgreementMoneyRecord[]>>(LOADING());
  const [nextActions, setNextActions] = useState<SectionState<SecurePayParticipantNextAction[]>>(LOADING());
  const [obligations, setObligations] = useState<SectionState<SecurePayAgreementObligation[]>>(LOADING());
  const [milestones, setMilestones] = useState<SectionState<SecurePayAgreementMilestone[]>>(LOADING());
  const [amendments, setAmendments] = useState<SectionState<SecurePayAgreementAmendment[]>>(LOADING());
  const [reviewCases, setReviewCases] = useState<SectionState<SecurePayAgreementReviewCaseSummary[]>>(LOADING());
  const [fundingAuthority, setFundingAuthority] = useState<SectionState<SecurePayAgreementFundingAuthority>>(LOADING());
  const [fundingOptions, setFundingOptions] = useState<SectionState<SecurePayAgreementFundingOption[]>>(LOADING());
  const [paymentIntents, setPaymentIntents] = useState<SectionState<SecurePayAgreementPaymentIntentSummary[]>>(LOADING());
  const [releaseAuthority, setReleaseAuthority] = useState<SectionState<SecurePayAgreementReleaseAuthority>>(LOADING());
  const [releaseInstructions, setReleaseInstructions] = useState<SectionState<SecurePayPaymentReleaseInstruction[]>>(LOADING());
  const [releaseSettlementStatus, setReleaseSettlementStatus] = useState<SectionState<SecurePayPaymentReleaseSettlementStatus | null>>(LOADING());
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteeKsNumber, setInviteeKsNumber] = useState('');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationCreatedWithoutToken, setInvitationCreatedWithoutToken] = useState(false);
  const inviteSubmittingRef = useRef(false);
  const inviteKeyRef = useRef(crypto.randomUUID());
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const confirmSubmittingRef = useRef(false);
  const confirmAttemptRef = useRef<{ target: string; key: string } | null>(null);
  const loadSequenceRef = useRef(0);
  const mountedRef = useRef(true);

  const authHeader = session?.accessToken;

  const load = useCallback(async () => {
    if (!agreementId || !authHeader) return;
    const loadSequence = ++loadSequenceRef.current;
    const isCurrentLoad = () => mountedRef.current && loadSequence === loadSequenceRef.current;

    setCore(LOADING());
    setParticipants(LOADING());
    setVersions(LOADING());
    setConfirmations(LOADING());
    setConfirmationStatus(LOADING());
    setActivity(LOADING());
    setMoneyStatus(LOADING());
    setMoneyRecords(LOADING());
    setNextActions(LOADING());
    setObligations(LOADING());
    setMilestones(LOADING());
    setAmendments(LOADING());
    setReviewCases(LOADING());
    setFundingAuthority(LOADING());
    setFundingOptions(LOADING());
    setPaymentIntents(LOADING());
    setReleaseAuthority(LOADING());
    setReleaseInstructions(LOADING());
    setReleaseSettlementStatus(LOADING());

    const coreResult = await getAgreement(agreementId, authHeader);
    if (!isCurrentLoad()) return;
    if (!coreResult.ok || !coreResult.data || coreResult.data.id !== agreementId) {
      setCore({ status: 'error', data: null, error: coreResult.error || 'Could not load this agreement.' });
      return;
    }
    setCore({ status: 'ok', data: coreResult.data, error: null });

    // Secondary reads only run once the core read has proven this identity
    // may see the agreement at all — never fetched (and never rendered) on
    // a failed/forbidden core read.
    const [p, v, c, cs, a, money, records, actions, obl, mil, amend, reviews, authority, options, intents, relAuthority, relInstructions] = await Promise.all([
      listAgreementParticipants(agreementId, authHeader),
      listAgreementVersions(agreementId, authHeader),
      listAgreementConfirmations(agreementId, authHeader),
      getAgreementConfirmationStatus(agreementId, authHeader),
      listAgreementActivity(agreementId, authHeader),
      getAgreementMoneyStatus(agreementId, authHeader),
      listAgreementMoneyRecords(agreementId, authHeader),
      getParticipantNextActions(agreementId, authHeader),
      listAgreementObligations(agreementId, authHeader),
      listAgreementMilestones(agreementId, authHeader),
      listAgreementAmendments(agreementId, authHeader),
      listAgreementReviewCases(agreementId, authHeader),
      getAgreementFundingAuthority(agreementId, authHeader),
      listAgreementFundingOptions(agreementId, authHeader),
      listAgreementPaymentIntents(agreementId, 0, 20, authHeader),
      getAgreementReleaseAuthority(agreementId, authHeader),
      listAgreementReleaseInstructions(agreementId, authHeader),
    ]);
    if (!isCurrentLoad()) return;

    setParticipants(p.ok && p.data
      ? { status: 'ok', data: p.data, error: null }
      : { status: 'error', data: null, error: p.error || 'Could not load participants.' });
    setVersions(v.ok && v.data
      ? { status: 'ok', data: v.data, error: null }
      : { status: 'error', data: null, error: v.error || 'Could not load version history.' });
    setConfirmations(c.ok && c.data
      ? { status: 'ok', data: c.data, error: null }
      : { status: 'error', data: null, error: c.error || 'Could not load confirmation records.' });
    setConfirmationStatus(cs.ok && cs.data
      ? { status: 'ok', data: cs.data, error: null }
      : { status: 'error', data: null, error: cs.error || 'Could not load your confirmation status.' });
    setActivity(a.ok && a.data
      ? { status: 'ok', data: a.data, error: null }
      : { status: 'error', data: null, error: a.error || 'Could not load activity.' });
    const moneyAmountsAreSafe = money.ok && money.data
      && Number.isSafeInteger(money.data.evaluatedAmountMinor)
      && (money.data.proposedAmountMinor == null || Number.isSafeInteger(money.data.proposedAmountMinor));
    if (money.ok && money.data && money.data.agreementId === agreementId
        && moneyAmountsAreSafe && paymentReadinessLabel(money.data)) {
      setMoneyStatus({ status: 'ok', data: money.data, error: null });
    } else if (money.status === 404) {
      setMoneyStatus({ status: 'error', data: null, error: 'Payment readiness has not been evaluated yet.' });
    } else if (money.status === 409 && money.errorCode === 'PAYMENT_READY_AGREEMENT_SCOPE_AMBIGUOUS') {
      setMoneyStatus({ status: 'error', data: null, error: 'Payment readiness cannot be shown for this agreement yet.' });
    } else {
      setMoneyStatus({ status: 'error', data: null, error: 'Money status is temporarily unavailable.' });
    }
    setMoneyRecords(records.ok && Array.isArray(records.data)
      ? { status: 'ok', data: records.data, error: null }
      : { status: 'error', data: null, error: 'Money records are temporarily unavailable.' });
    setNextActions(actions.ok && actions.data
      ? { status: 'ok', data: actions.data.actions, error: null }
      : { status: 'error', data: null, error: actions.error || 'Could not load your next actions.' });
    setObligations(obl.ok && obl.data
      ? { status: 'ok', data: obl.data, error: null }
      : { status: 'error', data: null, error: obl.error || 'Could not load obligations.' });
    setMilestones(mil.ok && mil.data
      ? { status: 'ok', data: mil.data, error: null }
      : { status: 'error', data: null, error: mil.error || 'Could not load milestones.' });
    setAmendments(amend.ok && amend.data
      ? { status: 'ok', data: amend.data, error: null }
      : { status: 'error', data: null, error: amend.error || 'Could not load amendments.' });
    setReviewCases(reviews.ok && reviews.data
      ? { status: 'ok', data: reviews.data.items, error: null }
      : { status: 'error', data: null, error: reviews.error || 'Could not load review cases.' });
    setFundingAuthority(authority.ok && authority.data
      ? { status: 'ok', data: authority.data, error: null }
      : { status: 'error', data: null, error: authority.error || 'Could not determine whether you can fund this agreement.' });
    setFundingOptions(options.ok && options.data
      ? { status: 'ok', data: options.data.items, error: null }
      : { status: 'error', data: null, error: options.error || 'Could not load available funding methods.' });
    setPaymentIntents(intents.ok && intents.data
      ? { status: 'ok', data: intents.data.items, error: null }
      : { status: 'error', data: null, error: intents.error || 'Could not load funding attempts.' });
    setReleaseAuthority(relAuthority.ok && relAuthority.data
      ? { status: 'ok', data: relAuthority.data, error: null }
      : { status: 'error', data: null, error: relAuthority.error || 'Could not determine whether you can request release.' });
    const releaseInstructionsList = relInstructions.ok && relInstructions.data ? relInstructions.data : null;
    setReleaseInstructions(releaseInstructionsList
      ? { status: 'ok', data: releaseInstructionsList, error: null }
      : { status: 'error', data: null, error: relInstructions.error || 'Could not load release instructions.' });

    // Second stage — the current instruction's settlement status can only
    // be requested once its id is known from the discovery read above.
    if (releaseInstructionsList && releaseInstructionsList.length > 0) {
      const statusResult = await getPaymentReleaseSettlementStatus(agreementId, releaseInstructionsList[0].instructionId, authHeader);
      if (!isCurrentLoad()) return;
      setReleaseSettlementStatus(statusResult.ok && statusResult.data
        ? { status: 'ok', data: statusResult.data, error: null }
        : { status: 'error', data: null, error: statusResult.error || 'Could not load settlement status.' });
    } else {
      setReleaseSettlementStatus({ status: 'ok', data: null, error: null });
    }
  }, [agreementId, authHeader]);

  // A full load() resets every section to 'loading' first, which unmounts
  // and remounts each ObligationRow (losing its expanded/local state) —
  // fine for the initial page load, wrong after an in-place obligation
  // action. This re-fetches only the sections an obligation/evidence/review
  // action can change, in place, without that loading-state flicker.
  const refreshAfterObligationAction = useCallback(async () => {
    if (!agreementId || !authHeader) return;
    const [obl, actions, act, reviews] = await Promise.all([
      listAgreementObligations(agreementId, authHeader),
      getParticipantNextActions(agreementId, authHeader),
      listAgreementActivity(agreementId, authHeader),
      listAgreementReviewCases(agreementId, authHeader),
    ]);
    if (obl.ok && obl.data) setObligations({ status: 'ok', data: obl.data, error: null });
    if (actions.ok && actions.data) setNextActions({ status: 'ok', data: actions.data.actions, error: null });
    if (act.ok && act.data) setActivity({ status: 'ok', data: act.data, error: null });
    if (reviews.ok && reviews.data) setReviewCases({ status: 'ok', data: reviews.data.items, error: null });
  }, [agreementId, authHeader]);

  // Same targeted-refresh reasoning as refreshAfterObligationAction, for the
  // funding sections. Money status/records are included because R3.5's
  // FUNDING_PAYMENT_INTENT money records are additive facts sourced from the
  // same payment intents this refresh re-reads.
  const refreshAfterFundingAction = useCallback(async () => {
    if (!agreementId || !authHeader) return;
    const [authority, options, intents, money, records, actions, act] = await Promise.all([
      getAgreementFundingAuthority(agreementId, authHeader),
      listAgreementFundingOptions(agreementId, authHeader),
      listAgreementPaymentIntents(agreementId, 0, 20, authHeader),
      getAgreementMoneyStatus(agreementId, authHeader),
      listAgreementMoneyRecords(agreementId, authHeader),
      getParticipantNextActions(agreementId, authHeader),
      listAgreementActivity(agreementId, authHeader),
    ]);
    if (authority.ok && authority.data) setFundingAuthority({ status: 'ok', data: authority.data, error: null });
    if (options.ok && options.data) setFundingOptions({ status: 'ok', data: options.data.items, error: null });
    if (intents.ok && intents.data) setPaymentIntents({ status: 'ok', data: intents.data.items, error: null });
    const moneyAmountsAreSafe = money.ok && money.data
      && Number.isSafeInteger(money.data.evaluatedAmountMinor)
      && (money.data.proposedAmountMinor == null || Number.isSafeInteger(money.data.proposedAmountMinor));
    if (money.ok && money.data && money.data.agreementId === agreementId
        && moneyAmountsAreSafe && paymentReadinessLabel(money.data)) {
      setMoneyStatus({ status: 'ok', data: money.data, error: null });
    }
    if (records.ok && Array.isArray(records.data)) setMoneyRecords({ status: 'ok', data: records.data, error: null });
    if (actions.ok && actions.data) setNextActions({ status: 'ok', data: actions.data.actions, error: null });
    if (act.ok && act.data) setActivity({ status: 'ok', data: act.data, error: null });
  }, [agreementId, authHeader]);

  // Same targeted-refresh reasoning as refreshAfterFundingAction, for the
  // release/settlement sections. Money status is refreshed too since a new
  // evaluation may have been produced since the last load.
  const refreshAfterReleaseAction = useCallback(async () => {
    if (!agreementId || !authHeader) return;
    const [authority, instructions, money, actions, act] = await Promise.all([
      getAgreementReleaseAuthority(agreementId, authHeader),
      listAgreementReleaseInstructions(agreementId, authHeader),
      getAgreementMoneyStatus(agreementId, authHeader),
      getParticipantNextActions(agreementId, authHeader),
      listAgreementActivity(agreementId, authHeader),
    ]);
    if (authority.ok && authority.data) setReleaseAuthority({ status: 'ok', data: authority.data, error: null });
    const instructionsList = instructions.ok && instructions.data ? instructions.data : null;
    if (instructionsList) setReleaseInstructions({ status: 'ok', data: instructionsList, error: null });
    if (instructionsList && instructionsList.length > 0) {
      const statusResult = await getPaymentReleaseSettlementStatus(agreementId, instructionsList[0].instructionId, authHeader);
      if (statusResult.ok && statusResult.data) {
        setReleaseSettlementStatus({ status: 'ok', data: statusResult.data, error: null });
      }
    } else if (instructionsList) {
      setReleaseSettlementStatus({ status: 'ok', data: null, error: null });
    }
    const moneyAmountsAreSafe = money.ok && money.data
      && Number.isSafeInteger(money.data.evaluatedAmountMinor)
      && (money.data.proposedAmountMinor == null || Number.isSafeInteger(money.data.proposedAmountMinor));
    if (money.ok && money.data && money.data.agreementId === agreementId
        && moneyAmountsAreSafe && paymentReadinessLabel(money.data)) {
      setMoneyStatus({ status: 'ok', data: money.data, error: null });
    }
    if (actions.ok && actions.data) setNextActions({ status: 'ok', data: actions.data.actions, error: null });
    if (act.ok && act.data) setActivity({ status: 'ok', data: act.data, error: null });
  }, [agreementId, authHeader]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      loadSequenceRef.current += 1;
    };
  }, [load]);

  const changeInvitee = (value: string) => {
    if (value !== inviteeKsNumber) inviteKeyRef.current = crypto.randomUUID();
    setInviteeKsNumber(value);
    setInviteError(null);
    setInvitationToken(null);
    setInvitationCreatedWithoutToken(false);
  };

  const submitInvitation = async () => {
    const intendedKsNumber = inviteeKsNumber.trim();
    if (!agreementId || !intendedKsNumber || inviteSubmittingRef.current || !authHeader) return;
    inviteSubmittingRef.current = true;
    setInviteSubmitting(true);
    setInviteError(null);
    try {
      const result = await issueAgreementInvitation(
        agreementId,
        {
          idempotencyKey: inviteKeyRef.current,
          roleCode: COUNTERPARTY_ROLE_CODE,
          intendedKsNumber,
        },
        authHeader,
      );
      if (!result.ok || !result.data) {
        setInviteError(result.error || 'Could not create the invitation.');
        return;
      }
      if (result.data.invitationToken) {
        setInvitationToken(result.data.invitationToken);
      } else {
        setInvitationCreatedWithoutToken(true);
      }
      await load();
    } finally {
      inviteSubmittingRef.current = false;
      setInviteSubmitting(false);
    }
  };

  const reconfirmationRequired = confirmationStatus.data?.some(status =>
    status.reconfirmationRequired
    && (status.participantStatus === 'JOINED_UNCONFIRMED' || status.participantStatus === 'CONFIRMED')
  ) ?? false;
  const currentVersion = versions.data?.find(version => version.versionStatus === 'CURRENT');
  // The confirmation-status endpoint is represented as an array because one
  // identity can participate in more than one role. For workspace guidance we
  // need one self-status record, not the whole array. Prefer the authenticated
  // identity when available, then fall back to the first backend-returned self
  // record. We never infer "me" from participant ordering or role labels.
  const myConfirmationStatus = confirmationStatus.status === 'ok'
    ? (confirmationStatus.data?.find(status => user?.id && status.identityId === user.id)
      ?? confirmationStatus.data?.[0]
      ?? null)
    : null;
  const myParticipantId = myConfirmationStatus?.participantId ?? null;

  // R3.5 fail-safe: funding-authority is the primary signal for whether the
  // funding UI is exposed, and participants/me/next-actions' FUND_AGREEMENT
  // presence is a secondary, backend-derived signal from the same
  // responsible-participant field. They should always agree; if they ever
  // disagree, fail closed and surface a neutral notice rather than trusting
  // either signal alone or inventing a third client-side rule.
  const nextActionsHasFundAgreement = nextActions.status === 'ok'
    ? (nextActions.data?.some(next => next.actionType === 'FUND_AGREEMENT') ?? false)
    : null;
  const fundingSignalsDisagree = fundingAuthority.status === 'ok' && fundingAuthority.data != null
    && nextActionsHasFundAgreement !== null
    && fundingAuthority.data.authorized !== nextActionsHasFundAgreement;

  // R4.5 — release creation needs the current evaluation's sequence number,
  // read fresh from GET /payment-ready/agreements/{id}/evaluation using this
  // exact real MONETARY obligation id (never a caller-invented value) as its
  // scopeIdentifiers. Only resolved when exactly one exists — the same
  // whole-agreement-only precondition R3.5's funding-authority already
  // requires.
  const monetaryObligations = obligations.data?.filter(o => o.obligationType === 'MONETARY') ?? [];
  const monetaryObligationId = monetaryObligations.length === 1 ? monetaryObligations[0].id : null;

  const reconfirmCurrentVersion = async () => {
    if (!agreementId || !authHeader || !currentVersion || confirmSubmittingRef.current) return;
    const target = `${currentVersion.id}|${currentVersion.versionNumber}|${currentVersion.contentHash}`;
    if (confirmAttemptRef.current?.target !== target) {
      confirmAttemptRef.current = { target, key: crypto.randomUUID() };
    }
    confirmSubmittingRef.current = true;
    setConfirmSubmitting(true);
    setConfirmError(null);
    try {
      const result = await confirmAgreementVersion(agreementId, currentVersion.id, {
        idempotencyKey: confirmAttemptRef.current.key,
        expectedVersionNumber: currentVersion.versionNumber,
        expectedContentHash: currentVersion.contentHash,
      }, authHeader);
      if (!result.ok || !result.data) {
        setConfirmError(result.error || 'Could not confirm this version. Reload the agreement and try again.');
        return;
      }
      await load();
    } finally {
      confirmSubmittingRef.current = false;
      setConfirmSubmitting(false);
    }
  };

  // Fail closed — never render agreement content without a proven SecurePay
  // session, matching CreateSecureLink.tsx / the rest of this app's gating.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!agreementId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <nav className="px-6 md:px-12 py-4 border-b border-[#1a1a1a]/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="sp-living-mark-link" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link>
          <Link to="/dashboard" className="text-sm text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={14} /><span className="hidden sm:inline">Back to SecurePay Home</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 space-y-6">
        {(core.status === 'loading' || (core.status === 'ok' && core.data?.id !== agreementId)) && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="animate-spin text-[#3a7a1f]" />
          </div>
        )}

        {core.status === 'error' && (
          <div className="bg-white rounded-2xl border border-[#1a1a1a]/6 shadow-sm p-8 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <p className="text-sm text-[#1a1a1a]/70">{core.error}</p>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={load}
                className="w-full py-2.5 rounded-xl bg-[#3a7a1f] hover:bg-[#2d6018] text-white text-sm font-medium transition-colors">
                Try again
              </button>
              <Link to="/dashboard" className="text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/60">
                Back to SecurePay Home
              </Link>
            </div>
          </div>
        )}

        {core.status === 'ok' && core.data && core.data.id === agreementId && (
          <>
            <div className="b4-live-agreement-title space-y-1">
              <div className="flex items-center gap-2">
                <LivingSecurePayMark state="resting" size="sm" presence="polite" />
                <span className="text-sm font-medium text-[#3a7a1f]">{core.data.publicReference}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-medium text-[#1a1a1a]">{core.data.title}</h1>
              <p className="inline-flex items-center gap-1.5 text-sm text-[#1a1a1a]/50">
                <Clock size={13} /> {agreementStatusLabel(core.data.status)}
              </p>
            </div>

            {/* ── Primary next action banner (Slice 6 workspace convergence) ── */}
            {(() => {
              const projection = buildWorkspaceProjection({
                agreement: core.data,
                topology: participants.status === 'ok' && participants.data && participants.data.length > 2 ? 'ONE_TO_MANY' : 'ONE_TO_ONE',
                participants: participants.status === 'ok' ? participants.data ?? [] : [],
                moneyStatus: moneyStatus.status === 'ok' ? moneyStatus.data : null,
                obligations: obligations.status === 'ok' ? obligations.data ?? [] : [],
                milestones: milestones.status === 'ok' ? milestones.data ?? [] : [],
                activity: [],
                confirmationStatus: myConfirmationStatus,
                nextActions: nextActions.status === 'ok' ? nextActions.data ?? [] : [],
                groupSecureLink: null,
                paymentIntents: paymentIntents.status === 'ok' ? paymentIntents.data ?? [] : [],
                releaseStatus: releaseSettlementStatus.status === 'ok' ? releaseSettlementStatus.data : null,
                creatorPerspective: true,
              });
              const action = projection.primaryNextAction;
              if (!action) return null;
              const urgencyCls = action.urgency === 'high'
                ? 'border-orange-200 bg-orange-50'
                : 'border-[#3a7a1f]/20 bg-[#f0f7eb]';
              const iconCls = action.urgency === 'high'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-[#3a7a1f]/10 text-[#3a7a1f]';
              return (
                <div className={`b4-live-next-action rounded-xl border-2 ${urgencyCls} px-4 py-3.5`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${iconCls}`}>
                      <LivingSecurePayMark state={action.urgency === 'high' ? 'caution' : 'guiding'} size="sm" presence={action.urgency === 'high' ? 'present' : 'polite'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Next action</p>
                      <p className="font-medium text-sm text-[#1a1a1a] mt-0.5">{action.label}</p>
                      <p className="text-xs text-[#1a1a1a]/55 mt-1">{action.reason}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Human status banner (Slice 6) ── */}
            {(() => {
              const projection = buildWorkspaceProjection({
                agreement: core.data,
                topology: participants.status === 'ok' && participants.data && participants.data.length > 2 ? 'ONE_TO_MANY' : 'ONE_TO_ONE',
                participants: participants.status === 'ok' ? participants.data ?? [] : [],
                moneyStatus: moneyStatus.status === 'ok' ? moneyStatus.data : null,
                obligations: obligations.status === 'ok' ? obligations.data ?? [] : [],
                milestones: milestones.status === 'ok' ? milestones.data ?? [] : [],
                activity: [],
                confirmationStatus: myConfirmationStatus,
                nextActions: nextActions.status === 'ok' ? nextActions.data ?? [] : [],
                groupSecureLink: null,
                paymentIntents: paymentIntents.status === 'ok' ? paymentIntents.data ?? [] : [],
                releaseStatus: releaseSettlementStatus.status === 'ok' ? releaseSettlementStatus.data : null,
                creatorPerspective: true,
              });
              const hs = projection.humanStatus;
              const variantCls = hs.variant === 'attention' || hs.variant === 'blocked'
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : hs.variant === 'complete'
                  ? 'border-[#3a7a1f]/20 bg-[#f0f7eb] text-[#3a7a1f]'
                  : hs.variant === 'cancelled'
                    ? 'border-gray-200 bg-gray-50 text-gray-600'
                    : 'border-[#1a1a1a]/8 bg-white text-[#1a1a1a]/60';
              return (
                <div className={`b4-live-status rounded-xl border ${variantCls} px-4 py-2.5`}>
                  <div className="flex items-start gap-2.5">
                    <LivingSecurePayMark
                      state={hs.variant === 'complete' ? 'complete' : hs.variant === 'attention' || hs.variant === 'blocked' || hs.variant === 'cancelled' ? 'caution' : hs.variant === 'waiting' ? 'waiting' : 'guiding'}
                      size="xs"
                      presence="polite"
                    />
                    <div>
                      <p className="text-sm font-medium">{hs.title}</p>
                      <p className="text-xs mt-0.5 opacity-80">{hs.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {nextActions.status !== 'ok' || (nextActions.data && nextActions.data.length > 0) ? (
              <Card title="Needs your attention" icon={<AlertTriangle size={15} />}>
                {nextActions.status === 'loading' && <SectionLoading />}
                {nextActions.status === 'error' && <SectionUnavailable message={nextActions.error!} />}
                {nextActions.status === 'ok' && nextActions.data && nextActions.data.length > 0 && (
                  <ul className="space-y-2.5">
                    {nextActions.data.map((next, index) => (
                      <li key={index} className="rounded-xl border border-[#1a1a1a]/8 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-[#1a1a1a]/85">{nextActionLabel(next.actionType)}</p>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/40">{next.urgency.toLowerCase()}</span>
                        </div>
                        <p className="text-xs text-[#1a1a1a]/50 mt-1">{next.actionReason}</p>
                        {next.deadline && <p className="text-xs text-[#1a1a1a]/40 mt-1">Due {formatDateTime(next.deadline)}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ) : null}

            <Card title="Agreement summary" icon={<FileText size={15} />}>
              <div className="grid sm:grid-cols-2 gap-4">
                <Row label="What it's for" value={<span className="whitespace-pre-wrap">{core.data.purpose}</span>} />
                {core.data.description && (
                  <Row label="Details" value={<span className="whitespace-pre-wrap">{core.data.description}</span>} />
                )}
                <Row label="Status" value={agreementStatusLabel(core.data.status)} />
                <Row label="Created" value={formatDateTime(core.data.createdAt)} />
                <Row label="Last updated" value={formatDateTime(core.data.updatedAt)} />
                {core.data.expiresAt && <Row label="Expires" value={formatDateTime(core.data.expiresAt)} />}
              </div>
            </Card>

            <Card title="Obligations" icon={<FileText size={15} />}>
              {obligations.status === 'loading' && <SectionLoading />}
              {obligations.status === 'error' && <SectionUnavailable message={obligations.error!} />}
              {obligations.status === 'ok' && obligations.data && (
                obligations.data.length === 0
                  ? <p className="text-sm text-[#1a1a1a]/40">No obligations recorded.</p>
                  : <div className="space-y-2">
                      {obligations.data.map(o => (
                        <ObligationRow
                          key={o.id} agreementId={agreementId} agreementVersionId={currentVersion?.id}
                          obligation={o} authHeader={authHeader} myParticipantId={myParticipantId}
                          onChanged={refreshAfterObligationAction}
                        />
                      ))}
                    </div>
              )}
            </Card>

            <Card title="Milestones" icon={<History size={15} />}>
              {milestones.status === 'loading' && <SectionLoading />}
              {milestones.status === 'error' && <SectionUnavailable message={milestones.error!} />}
              {milestones.status === 'ok' && milestones.data && (
                milestones.data.length === 0
                  ? <p className="text-sm text-[#1a1a1a]/40">No milestones recorded.</p>
                  : <ul className="space-y-2">
                      {milestones.data.map(m => (
                        <li key={m.id} className="border border-[#1a1a1a]/8 rounded-xl px-4 py-3">
                          <p className="text-sm font-medium text-[#1a1a1a]/85">{m.title}</p>
                          {m.description && <p className="text-xs text-[#1a1a1a]/50 mt-1 whitespace-pre-wrap">{m.description}</p>}
                          {m.dueAt && <p className="text-xs text-[#1a1a1a]/40 mt-1">Due {formatDateTime(m.dueAt)}</p>}
                        </li>
                      ))}
                    </ul>
              )}
            </Card>

            <Card title="Funding" icon={<Banknote size={15} />}>
              <FundingSection
                agreementId={agreementId}
                authHeader={authHeader}
                fundingAuthority={fundingAuthority}
                fundingOptions={fundingOptions}
                paymentIntents={paymentIntents}
                forceBlockedReason={fundingSignalsDisagree
                  ? 'Funding availability could not be confirmed consistently right now. Please refresh the page or try again shortly.'
                  : undefined}
                onChanged={refreshAfterFundingAction}
              />
            </Card>

            <Card title="Money status" icon={<Banknote size={15} />}>
              <section aria-labelledby="agreement-terms-heading" className="space-y-3">
                <h3 id="agreement-terms-heading" className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">
                  Agreement terms
                </h3>
                {core.data.currency && <Row label="Agreement currency" value={core.data.currency} />}
                {core.data.proposedAmountMinor != null && core.data.currency ? (
                  <Row
                    label="Proposed / agreed amount"
                    value={formatMinorMoney(core.data.currency, core.data.proposedAmountMinor) ?? 'Amount cannot be displayed.'}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-[#1a1a1a]/50">No proposed amount is recorded in the agreement.</p>
                )}
                <p className="text-xs leading-relaxed text-[#1a1a1a]/45">
                  These are agreement terms only. Payment readiness is shown separately below.
                </p>
              </section>

              <section aria-labelledby="payment-readiness-heading" className="pt-4 border-t border-[#1a1a1a]/6 space-y-3">
                <h3 id="payment-readiness-heading" className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">
                  Payment readiness
                </h3>
                {moneyStatus.status === 'loading' && <SectionLoading />}
                {moneyStatus.status === 'error' && <SectionUnavailable message={moneyStatus.error!} />}
                {moneyStatus.status === 'ok' && moneyStatus.data && (
                  <div className="space-y-3">
                    {moneyStatus.data.paymentReady && (
                      <div className="flex items-center gap-2 rounded-xl border border-[#3a7a1f]/20 bg-[#f6faf2] px-3.5 py-2.5">
                        <CheckCircle2 size={15} className="text-[#3a7a1f] shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a1a]">Payment Ready</p>
                          <p className="text-xs text-[#1a1a1a]/50 leading-relaxed">This means the agreement has reached the backend-defined release-ready state. It does not mean funds have moved, been released, or settled.</p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm font-medium text-[#1a1a1a]/80">
                      {paymentReadinessLabel(moneyStatus.data)}
                    </p>
                    <Row
                      label="Evaluated amount"
                      value={formatMinorMoney(moneyStatus.data.evaluatedCurrency, moneyStatus.data.evaluatedAmountMinor) ?? 'Amount cannot be displayed.'}
                    />
                    {!moneyStatus.data.paymentReady && safeOutstandingReasons(moneyStatus.data).length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed text-[#1a1a1a]/55">
                        {safeOutstandingReasons(moneyStatus.data).map(reason => <li key={reason}>{reason}</li>)}
                      </ul>
                    )}
                    <p className="text-[11px] text-[#1a1a1a]/35">Evaluated {formatDateTime(moneyStatus.data.evaluatedAt)}</p>
                  </div>
                )}
              </section>

              <section aria-labelledby="money-records-heading" className="pt-4 border-t border-[#1a1a1a]/6 space-y-3">
                <h3 id="money-records-heading" className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">
                  Money records
                </h3>
                {moneyRecords.status === 'loading' && <SectionLoading />}
                {moneyRecords.status === 'error' && <SectionUnavailable message={moneyRecords.error!} />}
                {moneyRecords.status === 'ok' && moneyRecords.data && (
                  moneyRecords.data.length === 0
                    ? <p className="text-sm text-[#1a1a1a]/40">No money records yet.</p>
                    : <ul>{moneyRecords.data.map((record, index) => <MoneyRecord key={index} record={record} />)}</ul>
                )}
              </section>
            </Card>

            <Card title="Release & settlement" icon={<CheckCircle2 size={15} />}>
              <ReleaseSection
                agreementId={agreementId}
                authHeader={authHeader}
                releaseAuthority={releaseAuthority}
                releaseInstructions={releaseInstructions}
                settlementStatus={releaseSettlementStatus}
                monetaryObligationId={monetaryObligationId}
                onChanged={refreshAfterReleaseAction}
              />
            </Card>

            <Card title="Group SecureLink" icon={<Users size={15} />}>
              <GroupSecureLinkSection agreementId={agreementId} authHeader={authHeader!} />
            </Card>

            {reconfirmationRequired && currentVersion && (
              <Card title="Agreement action" icon={<CheckCircle2 size={15} />}>
                <div className="space-y-3">
                  <p className="text-sm text-[#1a1a1a]/65">
                    This agreement has changed since your last confirmation. Review version {currentVersion.versionNumber} before confirming it.
                  </p>
                  {confirmError && <SectionUnavailable message={confirmError} />}
                  <button type="button" onClick={reconfirmCurrentVersion} disabled={confirmSubmitting}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#3a7a1f] disabled:opacity-40 text-white text-sm font-medium">
                    {confirmSubmitting ? 'Confirming…' : `Confirm version ${currentVersion.versionNumber}`}
                  </button>
                </div>
              </Card>
            )}

            {!reconfirmationRequired && INVITABLE_STATUSES.has(core.data.status) && (
              <Card title="Agreement action" icon={<Users size={15} />}>
                {!inviteOpen ? (
                  <div className="space-y-3">
                    <p className="text-sm text-[#1a1a1a]/60">
                      The agreement creator can invite another counterparty while invitations are still open.
                    </p>
                    <button type="button" onClick={() => setInviteOpen(true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#3a7a1f] hover:bg-[#2d6018] text-white text-sm font-medium transition-colors">
                      Invite another counterparty
                    </button>
                  </div>
                ) : invitationToken ? (
                  <div className="space-y-3">
                    <p className="text-sm text-[#1a1a1a]/70">Invitation created. Share this one-time join link with the counterparty.</p>
                    <div className="text-xs font-mono break-all bg-[#fafaf8] border border-[#1a1a1a]/8 rounded-xl p-3">
                      {`${window.location.origin}/securelink/join/${encodeURIComponent(invitationToken)}`}
                    </div>
                    <p className="text-xs text-[#1a1a1a]/45">SecurePayAPI returns the token once and does not send it for you.</p>
                  </div>
                ) : invitationCreatedWithoutToken ? (
                  <SectionUnavailable message="The invitation already exists, but its one-time join link cannot be shown again. Check the latest participant activity before taking another action." />
                ) : (
                  <div className="space-y-3">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-[#1a1a1a]/75">Counterparty KS Number</span>
                      <input value={inviteeKsNumber} onChange={e => changeInvitee(e.target.value)}
                        placeholder="KS…" autoComplete="off"
                        className="w-full px-3.5 py-3 rounded-xl border border-[#1a1a1a]/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3a7a1f]/25" />
                    </label>
                    {inviteError && <SectionUnavailable message={inviteError} />}
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                      <button type="button" onClick={() => { setInviteOpen(false); setInviteError(null); }}
                        className="px-4 py-2.5 rounded-xl border border-[#1a1a1a]/10 text-sm text-[#1a1a1a]/60">
                        Back
                      </button>
                      <button type="button" onClick={submitInvitation}
                        disabled={!inviteeKsNumber.trim() || inviteSubmitting}
                        className="px-4 py-2.5 rounded-xl bg-[#3a7a1f] disabled:opacity-40 text-white text-sm font-medium">
                        {inviteSubmitting ? 'Creating invitation…' : 'Create invitation'}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            <Card title="Participants" icon={<Users size={15} />}>
              {participants.status === 'loading' && <SectionLoading />}
              {participants.status === 'error' && <SectionUnavailable message={participants.error!} />}
              {participants.status === 'ok' && participants.data && (
                <ul className="space-y-2">
                  {participants.data.map(p => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#1a1a1a]/5 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]/80">{p.roleCode}</p>
                        <p className="text-xs text-[#1a1a1a]/40">Added {formatDateTime(p.addedAt)}</p>
                      </div>
                      <span className="text-xs text-[#1a1a1a]/60">{participantStatusLabel(p.participantStatus)}</span>
                    </li>
                  ))}
                  {participants.data.length === 0 && (
                    <p className="text-sm text-[#1a1a1a]/40">No participants recorded.</p>
                  )}
                </ul>
              )}
            </Card>

            <Card title="Version history" icon={<History size={15} />}>
              {versions.status === 'loading' && <SectionLoading />}
              {versions.status === 'error' && <SectionUnavailable message={versions.error!} />}
              {versions.status === 'ok' && versions.data && (
                <div className="space-y-2">
                  {[...versions.data]
                    .sort((a, b) => b.versionNumber - a.versionNumber)
                    .map(v => (
                      <VersionRow key={v.id} agreementId={agreementId} version={v} authHeader={authHeader} />
                    ))}
                  {versions.data.length === 0 && (
                    <p className="text-sm text-[#1a1a1a]/40">No versions recorded.</p>
                  )}
                </div>
              )}
            </Card>

            <Card title="Amendments" icon={<History size={15} />}>
              {amendments.status === 'loading' && <SectionLoading />}
              {amendments.status === 'error' && <SectionUnavailable message={amendments.error!} />}
              {amendments.status === 'ok' && amendments.data && (
                amendments.data.length === 0
                  ? <p className="text-sm text-[#1a1a1a]/40">No amendments have been proposed.</p>
                  : <ul className="space-y-2">
                      {amendments.data.map(am => (
                        <li key={am.id} className="border border-[#1a1a1a]/8 rounded-xl px-4 py-3 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[#1a1a1a]/80">{amendmentStatusLabel(am.status)}</span>
                            <span className="text-xs text-[#1a1a1a]/40">{formatDateTime(am.createdAt)}</span>
                          </div>
                          {am.reason && <p className="text-xs text-[#1a1a1a]/50 mt-1 whitespace-pre-wrap">{am.reason}</p>}
                        </li>
                      ))}
                    </ul>
              )}
              <p className="text-xs text-[#1a1a1a]/35 leading-relaxed pt-1">
                Proposing an amendment is not yet available from this workspace.
              </p>
            </Card>

            <Card title="Agreement Review" icon={<Flag size={15} />}>
              {reviewCases.status === 'loading' && <SectionLoading />}
              {reviewCases.status === 'error' && <SectionUnavailable message={reviewCases.error!} />}
              {reviewCases.status === 'ok' && reviewCases.data && (
                reviewCases.data.length === 0
                  ? <p className="text-sm text-[#1a1a1a]/40">No formal review has been opened for this agreement.</p>
                  : <div className="space-y-2">
                      {reviewCases.data.map(rc => (
                        <ReviewCaseRow
                          key={rc.reviewCaseId} agreementId={agreementId} authHeader={authHeader}
                          caseSummary={rc} obligations={obligations.data}
                          onChanged={refreshAfterObligationAction}
                        />
                      ))}
                    </div>
              )}
              <p className="text-xs text-[#1a1a1a]/35 leading-relaxed pt-1">
                SecurePay records and coordinates this process; it does not decide who is right.
              </p>
            </Card>

            <Card title="Confirmations" icon={<CheckCircle2 size={15} />}>
              {confirmations.status === 'loading' && <SectionLoading />}
              {confirmations.status === 'ok' && confirmations.data && (
                <ul className="space-y-2">
                  {confirmations.data.map(c => (
                    <li key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-[#1a1a1a]/5 last:border-0 text-sm">
                      <div>
                        <p className="text-[#1a1a1a]/80">Version {c.versionNumber} — {confirmationStatusLabel(c.status)}</p>
                        <p className="text-xs text-[#1a1a1a]/40">
                          {formatDateTime(c.confirmedAt)} · {c.assuranceMethod}
                        </p>
                      </div>
                    </li>
                  ))}
                  {confirmations.data.length === 0 && (
                    <p className="text-sm text-[#1a1a1a]/40">No one has confirmed a version yet.</p>
                  )}
                </ul>
              )}
              {confirmations.status === 'error' && (
                <SectionUnavailable message={confirmations.error!} />
              )}

              {/* Self-only status — deliberately kept separate from and never
                  merged into the list above, since it reflects only the
                  signed-in participant's own row (see
                  SecurePayAgreementConfirmationStatus's doc comment). */}
              {confirmationStatus.status === 'ok' && confirmationStatus.data && confirmationStatus.data.length > 0 && (
                <div className="pt-2 mt-2 border-t border-[#1a1a1a]/6">
                  <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-1.5">Your confirmation status</p>
                  {confirmationStatus.data.map(cs => (
                    <p key={cs.participantId} className="text-sm text-[#1a1a1a]/70">
                      {cs.confirmedVersionNumber != null
                        ? `You confirmed version ${cs.confirmedVersionNumber}. `
                        : 'You have not confirmed a version yet. '}
                      {cs.confirmationCurrent
                        ? 'This is current with the latest version.'
                        : 'This is out of date with the current version — reconfirmation may be needed.'}
                    </p>
                  ))}
                </div>
              )}
              {confirmationStatus.status === 'error' && confirmations.status !== 'error' && (
                <SectionUnavailable message="Could not load your confirmation status." />
              )}
            </Card>

            <Card title="Activity" icon={<ActivityIcon size={15} />}>
              {activity.status === 'loading' && <SectionLoading />}
              {activity.status === 'error' && <SectionUnavailable message={activity.error!} />}
              {activity.status === 'ok' && activity.data && (
                <ul className="space-y-2.5">
                  {[...activity.data]
                    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                    .map(ev => (
                      <li key={ev.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[#1a1a1a]/75">{activityTypeLabel(ev.activityType)}</span>
                        <span className="text-xs text-[#1a1a1a]/40">{formatDateTime(ev.occurredAt)}</span>
                      </li>
                    ))}
                  {activity.data.length === 0 && (
                    <p className="text-sm text-[#1a1a1a]/40">No activity recorded yet.</p>
                  )}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
