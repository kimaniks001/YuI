import type { ReadinessReasonItem } from '../components/journey/types';

// Compatibility presentation used only by the pre-existing demo journeys.
// The authoritative Phase 6 views below do not consume these legacy fields.
export interface GroupCollectionPresentation {
  purpose: string; organizer_name: string; organizer_ks_number: string | null;
  target_amount: number; total_collected: number; contributor_count: number;
  contribution_rule: 'fixed' | 'open'; per_person_amount: number | null;
  status: string; close_reason: string | null; deadline: string | null;
  collection_mode: 'one_time' | 'recurring'; is_test_mode: boolean; is_reported?: boolean;
}
export type ContributionPhase = 'no_contributions' | 'early_progress' | 'partially_funded' | 'target_reached' | 'over_target' | 'open_amount' | 'closed' | 'under_review' | 'cancelled';
export function deriveContributionPhase(col: GroupCollectionPresentation): { phase: ContributionPhase; label: string; detail: string } {
  if (col.status === 'under_review') return { phase: 'under_review', label: 'Under review', detail: 'Contributions may be paused while a report is reviewed.' };
  if (col.status === 'closed') return col.close_reason === 'target_reached'
    ? { phase: 'target_reached', label: 'Target reached', detail: 'This collection reached its stated target.' }
    : { phase: 'closed', label: 'Collection closed', detail: col.close_reason === 'deadline' ? 'The deadline has passed.' : 'This Group SecureLink is no longer accepting contributions.' };
  if (col.contribution_rule === 'open' && col.target_amount <= 0) return { phase: 'open_amount', label: 'Open collection', detail: 'Contributors may give any amount unless a limit is set elsewhere.' };
  if (col.contributor_count === 0 || col.total_collected <= 0) return { phase: 'no_contributions', label: 'No contributions yet', detail: 'Be the first to contribute when you are ready.' };
  if (col.target_amount > 0 && col.total_collected >= col.target_amount) return { phase: col.total_collected > col.target_amount ? 'over_target' : 'target_reached', label: col.total_collected > col.target_amount ? 'Over target (display)' : 'Target reached (display)', detail: 'Totals are shown from collection records — backend confirms final amounts.' };
  if (col.target_amount > 0 && col.total_collected / col.target_amount < .25) return { phase: 'early_progress', label: 'Early progress', detail: 'The collection is underway.' };
  return { phase: 'partially_funded', label: col.target_amount > 0 ? 'Partially funded' : 'In progress', detail: col.target_amount > 0 ? 'More contributions can still be made until the target or deadline.' : 'Contributions are being recorded.' };
}
export function buildGroupReadinessReasons(col: GroupCollectionPresentation, payoutRule?: string): ReadinessReasonItem[] {
  const reasons: ReadinessReasonItem[] = [
    { id: 'target', label: col.target_amount > 0 ? (col.total_collected >= col.target_amount ? 'Target amount met (per displayed total)' : 'Target not yet met') : 'No fixed target on this collection', status: col.target_amount <= 0 || col.total_collected >= col.target_amount ? 'met' : 'pending' },
    { id: 'contributors', label: col.contributor_count > 0 ? `${col.contributor_count} contributor(s) on record` : 'Waiting for first contribution', status: col.contributor_count > 0 ? 'met' : 'pending' },
    { id: 'governance', label: payoutRule?.trim() ? `Governance rule (display): ${payoutRule}` : 'Governance details not yet available in production view', status: 'pending' },
  ];
  if (col.status === 'under_review') reasons.push({ id: 'review', label: 'Organizer review / report pending', status: 'blocked' });
  if (col.status === 'closed') reasons.push({ id: 'closed', label: 'Collection closed to new contributions', status: 'met' });
  return reasons;
}
export function buildGroupException(col: GroupCollectionPresentation): { variant: 'error' | 'warning' | 'blocked'; title: string; message: string } | null {
  if (col.status === 'under_review') return { variant: 'warning', title: 'Collection under review', message: 'A report was received. Wait for clarification before contributing if you are unsure.' };
  if (col.status === 'closed' && col.close_reason === 'deadline') return { variant: 'warning', title: 'Collection expired', message: 'The deadline for this Group SecureLink has passed.' };
  if (col.is_reported) return { variant: 'warning', title: 'Report on file', message: 'This collection has been reported. Proceed only if you trust the organiser.' };
  return null;
}
export interface OrganizerPresentation { id: string; name: string; role: string; ksNumber?: string; statusLabel?: string }
export function buildOrganizerList(col: GroupCollectionPresentation, team: { name: string; role: string; ks_number: string; status: string }[] = []): OrganizerPresentation[] {
  return [{ id: 'lead', name: col.organizer_name, role: 'Primary organiser', ksNumber: col.organizer_ks_number ?? undefined, statusLabel: 'Active' }, ...team.map((member, index) => ({ id: `gov-${index}`, name: member.name, role: member.role, ksNumber: member.ks_number, statusLabel: member.status === 'accepted' ? 'Active' : member.status === 'pending' ? 'Pending' : member.status }))];
}

// Lifecycle labels are an allowlist. A newly introduced backend state must not
// be guessed into a governance outcome by the client.
export function groupStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'ACTIVE': return 'Open';
    case 'CANCELLED': return 'Cancelled';
    case 'EXPIRED': return 'Expired';
    default: return 'Status unavailable';
  }
}

// R6 — closed backend enum (AppointGroupOrganizerRequest.organizerRole,
// verified directly against the current OpenAPI): PRIMARY_ORGANIZER,
// ORGANIZER, APPROVER, AUDITOR.
export function organizerRoleLabel(role: string): string {
  switch (role) {
    case 'PRIMARY_ORGANIZER': return 'Primary organizer';
    case 'ORGANIZER': return 'Organizer';
    case 'APPROVER': return 'Approver';
    case 'AUDITOR': return 'Auditor';
    default: return 'Organizer role unavailable';
  }
}

// R6 — closed backend enum (AppointGroupOrganizerRequest.authorityScope,
// verified directly against the current OpenAPI): MANAGE, APPROVE, VIEW.
export function organizerAuthorityScopeLabel(scope: string): string {
  switch (scope) {
    case 'MANAGE': return 'Can manage the group';
    case 'APPROVE': return 'Can decide governed-action approvals';
    case 'VIEW': return 'Can view governance detail only';
    default: return 'Authority scope unavailable';
  }
}

export function groupTypeLabel(type: string): string {
  if (type === 'WELFARE') return 'Welfare group';
  if (type === 'GENERAL') return 'General group';
  return 'Group type unavailable';
}

export function groupTargetTypeLabel(type: string): string {
  if (type === 'FIXED_AMOUNT') return 'Fixed target';
  if (type === 'OPEN_ENDED') return 'Open-ended target';
  return 'Target type unavailable';
}

// Closed backend enum, verified directly against
// ke.securepay.agreement.group.model.GovernedActionType (the real Java enum
// the createPolicy/openApprovalRequest controllers parse into via strict
// GovernedActionType.valueOf(...)) — corrected R6 governance-enum-alignment
// fix. The OpenAPI CreateGovernancePolicyRequest schema documents a stale,
// differently-spelled 4-value enum (CHANGE_ORGANIZER, CANCEL_GROUP) that does
// not match this real enum; no alias/fallback is kept for those stale values
// since the backend can never actually accept or return them.
export function governedActionLabel(action: string): string {
  switch (action) {
    case 'PROPOSE_RELEASE': return 'Release proposal';
    case 'CHANGE_ORGANIZERS': return 'Organizer changes';
    case 'CHANGE_GOVERNANCE': return 'Governance changes';
    case 'CANCEL_GROUP_SECURELINK': return 'Group cancellation';
    case 'EXTEND_DEADLINE': return 'Deadline extension';
    case 'APPROVE_DISTRIBUTION_PLAN': return 'Distribution plan approval';
    default: return 'Policy action unavailable';
  }
}

// Real backend enum (governedActionType), scoped to the values a
// governance-policy creation form may offer. Distinct from governedActionLabel's
// broader display fallback because we must not let an organizer create a policy
// against a legacy/stale action code.
export const CREATABLE_GOVERNED_ACTION_TYPES = [
  'PROPOSE_RELEASE',
  'CHANGE_ORGANIZERS',
  'CHANGE_GOVERNANCE',
  'CANCEL_GROUP_SECURELINK',
  'EXTEND_DEADLINE',
  'APPROVE_DISTRIBUTION_PLAN',
] as const;

export function governanceStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'ACTIVE': return 'Active';
    case 'SUPERSEDED': return 'Superseded';
    case 'REVOKED': return 'Revoked';
    default: return 'Status unavailable';
  }
}

type GovernancePolicyState = { governedActionType: string; status: string };

// This mapping deliberately uses only lifecycle state and the backend-returned
// policy state. It never treats an organizer row as current-user authority and
// never derives an approval/quorum outcome from policy terms.
export function groupGovernanceNextStep(
  status: string,
  policies: GovernancePolicyState[],
): string {
  if (status === 'DRAFT') {
    const hasActiveReleasePolicy = policies.some(
      policy => policy.governedActionType === 'PROPOSE_RELEASE' && policy.status === 'ACTIVE',
    );
    return hasActiveReleasePolicy
      ? 'An active approval rule for proposed release is in place. Any activation step remains available only to a backend-authorized group manager.'
      : 'An active approval rule for proposed release is required before this Group SecureLink can be activated.';
  }
  if (status === 'ACTIVE') {
    return 'Approval request and quorum status are not available in this view.';
  }
  if (status === 'CANCELLED') return 'This Group SecureLink is cancelled. No next governance step is available.';
  if (status === 'EXPIRED') return 'This Group SecureLink is expired. No next governance step is available.';
  return 'Governance status unavailable.';
}

const ACTIVATION_BLOCKER_LABELS: Record<string, string> = {
  NOT_DRAFT: 'This group is no longer in draft.',
  MANAGE_PERMISSION_REQUIRED: 'This action is only available to an authorized group manager.',
  MANAGING_ORGANIZER_REQUIRED: 'A managing organizer is needed first.',
  PRIMARY_ORGANIZER_REQUIRED: 'A primary organizer is needed first.',
  ACTIVE_PROPOSE_RELEASE_POLICY_REQUIRED: 'An active approval rule is needed first.',
};

export function activationBlockerLabel(code: string): string {
  return ACTIVATION_BLOCKER_LABELS[code]
    ?? 'SecurePay says this Group SecureLink is not ready for activation yet.';
}
