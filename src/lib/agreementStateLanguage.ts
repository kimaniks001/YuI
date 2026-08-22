// ═══════════════════════════════════════════════════════════════
// AGREEMENT STATE LANGUAGE — Phase 4 UI Slice 1. One centralized place that
// translates the backend's exact Agreement/participant/version/confirmation
// enum values into simple language for the agreement-detail journey.
//
// Every label here maps 1:1 to a real backend enum value (Agreement.status,
// AgreementParticipant.participantStatus, AgreementVersion.versionStatus,
// AgreementConfirmation.status, AgreementActivity.activityType — all
// verified directly against contracts/openapi/securepay-api-v1.yaml and the
// ~/SecurePayAPI Java source). No value is merged, renamed to imply a
// different meaning, or invented — the wording is simplified, but the
// distinction the backend makes is always preserved (e.g. INVITATION_PENDING
// vs PARTICIPANTS_JOINING stay two different labels, not one "in progress").
//
// This module is intentionally scoped to the new agreement-detail journey
// (AgreementDetail.tsx). CreateSecureLink.tsx and SecureLinkJoin.tsx keep
// their own existing, already-shipped label functions rather than being
// migrated onto this one — those carry step-specific wording (e.g. "You
// (creator)", which is only true because of who is looking at that specific
// page) that doesn't belong in a page-agnostic mapping, and Phase 4 Slice 1
// does not redesign the Phase 3 create/join flows.
// ═══════════════════════════════════════════════════════════════

import type {
  SecurePayAgreement,
  SecurePayAgreementParticipant,
  SecurePayAgreementVersion,
  SecurePayAgreementActivity,
} from '../api/securepayTypes';

export function agreementStatusLabel(status: SecurePayAgreement['status'] | string): string {
  switch (status) {
    case 'DRAFT': return 'Saved as a draft';
    case 'PROPOSED': return 'Proposed';
    case 'INVITATION_PENDING': return 'Invitation sent — waiting for the other person';
    case 'PARTICIPANTS_JOINING': return 'Waiting for participants to join';
    case 'CONFIRMATION_PENDING': return 'Waiting for confirmation';
    case 'CANCELLED': return 'Cancelled';
    case 'EXPIRED': return 'Expired';
    default: return status;
  }
}

export function participantStatusLabel(status: SecurePayAgreementParticipant['participantStatus']): string {
  switch (status) {
    case 'CREATOR': return 'Creator';
    case 'INVITED': return 'Invited — hasn’t joined yet';
    case 'PENDING': return 'Pending';
    case 'JOINED_UNCONFIRMED': return 'Joined — waiting for confirmation';
    case 'CONFIRMED': return 'Confirmed';
    default: return status;
  }
}

export function versionStatusLabel(status: SecurePayAgreementVersion['versionStatus']): string {
  switch (status) {
    case 'CURRENT': return 'Current version';
    case 'SUPERSEDED': return 'Replaced by a later version';
    default: return status;
  }
}

// AgreementConfirmation.status is typed as `string` on the backend record
// (no Java enum on the wire type), but AgreementConfirmationService only
// ever sets CONFIRMED, INVALIDATED, or WITHDRAWN (confirmed directly against
// ke.securepay.agreement.model.ConfirmationStatus) — those three are the
// only values handled by name; anything else falls back to the raw value
// rather than being silently mislabeled.
export function confirmationStatusLabel(status: string): string {
  switch (status) {
    case 'CONFIRMED': return 'Confirmed';
    case 'INVALIDATED': return 'No longer valid — the agreement changed since this confirmation';
    case 'WITHDRAWN': return 'Withdrawn';
    default: return status;
  }
}

export function activityTypeLabel(activityType: SecurePayAgreementActivity['activityType']): string {
  switch (activityType) {
    case 'AGREEMENT_CREATED': return 'Agreement created';
    case 'AGREEMENT_PROPOSED': return 'Agreement proposed';
    case 'PARTICIPANT_ADDED': return 'Participant added';
    case 'PARTICIPANT_REMOVED': return 'Participant removed';
    case 'INVITATION_ISSUED': return 'Invitation sent';
    case 'INVITATION_VIEWED': return 'Invitation viewed';
    case 'INVITATION_REVOKED': return 'Invitation withdrawn';
    case 'INVITATION_EXPIRED': return 'Invitation expired';
    case 'INVITATION_JOINED': return 'Invitation accepted';
    case 'PARTICIPANT_JOINED': return 'Participant joined';
    case 'AGREEMENT_VERSION_CONFIRMED': return 'Version confirmed';
    case 'AGREEMENT_CANCELLED': return 'Agreement cancelled';
    case 'AGREEMENT_EXPIRED': return 'Agreement expired';
    // R2 — fulfillment, evidence, and formal review activity types
    // (ke.securepay.agreement.model.AgreementActivityType, verified
    // directly against source).
    case 'OBLIGATION_CREATED': return 'Obligation added';
    case 'OBLIGATION_AVAILABLE': return 'Obligation available to start';
    case 'OBLIGATION_STARTED': return 'Work started';
    case 'OBLIGATION_BLOCKED': return 'Obligation blocked';
    case 'OBLIGATION_EVIDENCE_SUBMITTED': return 'Evidence submitted';
    case 'OBLIGATION_COMPLETED': return 'Work confirmed complete';
    case 'OBLIGATION_REJECTED': return 'Obligation rejected';
    case 'OBLIGATION_OVERDUE': return 'Obligation overdue';
    case 'MILESTONE_CREATED': return 'Milestone added';
    case 'MILESTONE_COMPLETED': return 'Milestone completed';
    case 'EVIDENCE_SUBMITTED': return 'Evidence submitted';
    case 'EVIDENCE_APPROVED': return 'Evidence approved';
    case 'EVIDENCE_REJECTED': return 'Evidence declined';
    case 'AGREEMENT_REVIEW_CASE_OPENED': return 'Review opened';
    case 'AGREEMENT_REVIEW_ACKNOWLEDGED': return 'Review acknowledged';
    case 'AGREEMENT_REVIEW_RESPONSE_SUBMITTED': return 'Review response submitted';
    case 'AGREEMENT_REVIEW_EVIDENCE_SUBMITTED': return 'Review evidence submitted';
    case 'AGREEMENT_REVIEW_ESCALATION_REQUESTED': return 'Review escalation requested';
    case 'AGREEMENT_REVIEW_DECISION_PROPOSED': return 'Review decision proposed';
    case 'AGREEMENT_REVIEW_DECISION_APPROVED': return 'Review decision approved';
    case 'AGREEMENT_REVIEW_DECISION_REJECTED': return 'Review decision rejected';
    case 'AGREEMENT_REVIEW_MORE_EVIDENCE_REQUIRED': return 'Review needs more evidence';
    // Falls through for any of the ~60 other real backend activity types
    // (distribution, group governance, pricing, product — all explicitly
    // out of scope for this slice). Shown as-is rather than guessed at or
    // hidden: the raw type name is honest, backend-proven text, never a
    // fabricated label.
    default: return activityType;
  }
}
