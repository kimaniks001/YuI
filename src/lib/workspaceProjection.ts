// ═══════════════════════════════════════════════════════════════
// WORKSPACE PROJECTION LAYER
//
// Converts authoritative backend agreement state into customer-facing
// workspace state. Never manufactures backend truth — only translates
// existing truth into understandable language.
//
// Used by:
//   - AgreementDetail (canonical workspace)
//   - Preview workspace page (fixture-based)
//   - Future developer integrations
// ═══════════════════════════════════════════════════════════════

import type {
  SecurePayAgreement,
  SecurePayAgreementParticipant,
  SecurePayAgreementMoneyStatus,
  SecurePayAgreementObligation,
  SecurePayAgreementMilestone,
  SecurePayAgreementActivity,
  SecurePayAgreementConfirmationStatus,
  SecurePayParticipantNextAction,
  SecurePayPrivateGroupSecureLink,
  SecurePayAgreementPaymentIntentSummary,
  SecurePayPaymentReleaseSettlementStatus,
} from '../api/securepayTypes';
import type { AgreementTopology } from './agreementTopology';

// ─── Projection types ───────────────────────────────────────────

export type WorkspaceRole = 'creator' | 'payer' | 'contributor' | 'recipient' | 'approver' | 'observer';

export type HumanStatusVariant = 'active' | 'waiting' | 'attention' | 'blocked' | 'complete' | 'cancelled';

export interface HumanStatus {
  title: string;
  explanation: string;
  variant: HumanStatusVariant;
}

export interface PrimaryNextAction {
  label: string;
  reason: string;
  href: string | null;
  actionCode: string;
  urgency: 'high' | 'medium' | 'low' | 'none';
}

export interface ParticipantSummary {
  role: WorkspaceRole;
  label: string;
  status: string;
  resolved: boolean;
}

export interface MoneySummary {
  agreementAmountDisplay: string | null;
  evaluatedAmountDisplay: string | null;
  paymentReady: boolean;
  paymentReadyStatus: string;
  outstandingReasons: string[];
  contributedTotalDisplay: string | null;
  expectedTotalDisplay: string | null;
}

export interface AttentionItem {
  label: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface MilestoneProgress {
  title: string;
  status: string;
  humanStatus: string;
}

export interface ActivityEntry {
  description: string;
  timestamp: string;
  type: string;
}

export interface AgreementWorkspaceProjection {
  agreementId: string;
  publicReference: string;
  title: string;
  topology: AgreementTopology;
  humanStatus: HumanStatus;
  primaryNextAction: PrimaryNextAction | null;
  participants: ParticipantSummary[];
  money: MoneySummary;
  attentionItems: AttentionItem[];
  milestones: MilestoneProgress[];
  recentActivity: ActivityEntry[];
  creatorPerspective: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────

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

function translateAgreementStatus(status: SecurePayAgreement['status']): HumanStatus {
  switch (status) {
    case 'DRAFT':
      return { title: 'Draft agreement', explanation: 'This agreement has not been sent yet.', variant: 'waiting' };
    case 'PROPOSED':
      return { title: 'Agreement sent', explanation: 'Waiting for the other person to join.', variant: 'waiting' };
    case 'INVITATION_PENDING':
      return { title: 'Invitation sent', explanation: 'Waiting for a response to the invitation.', variant: 'waiting' };
    case 'PARTICIPANTS_JOINING':
      return { title: 'People are joining', explanation: 'Participants are accepting the agreement.', variant: 'active' };
    case 'CONFIRMATION_PENDING':
      return { title: 'Ready to confirm', explanation: 'Participants need to confirm the agreement terms.', variant: 'attention' };
    case 'CANCELLED':
      return { title: 'Cancelled', explanation: 'This agreement has been cancelled.', variant: 'cancelled' };
    case 'EXPIRED':
      return { title: 'Expired', explanation: 'This agreement expired before completion.', variant: 'cancelled' };
    default:
      return { title: 'Agreement', explanation: 'Status unavailable.', variant: 'waiting' };
  }
}

function translateMilestoneStatus(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes('complete') || lower.includes('done')) return 'Completed';
  if (lower.includes('progress') || lower.includes('active')) return 'In progress';
  if (lower.includes('available') || lower.includes('ready')) return 'Ready';
  if (lower.includes('blocked') || lower.includes('wait')) return 'Waiting';
  return 'Not started';
}

function translateActionCode(actionCode: string): { label: string; reason: string } | null {
  const map: Record<string, { label: string; reason: string }> = {
    'INVITE_PARTICIPANT': { label: 'Invite the other person', reason: 'The agreement needs the other participant to join.' },
    'INVITE_RECIPIENT': { label: 'Add recipient identities', reason: 'Some recipients still need SecurePay identities.' },
    'SHARE_CONTRIBUTION_LINK': { label: 'Share the contribution link', reason: 'Contributors can join through the contribution link.' },
    'CONFIRM_VERSION': { label: 'Confirm the agreement', reason: 'You need to confirm the current agreement version.' },
    'START_OBLIGATION': { label: 'Start the next task', reason: 'There is work ready to begin.' },
    'SUBMIT_EVIDENCE': { label: 'Submit evidence', reason: 'Evidence is needed to complete a task.' },
    'REVIEW_DISTRIBUTION_PLAN': { label: 'Review the distribution plan', reason: 'The distribution plan is ready for review.' },
    'FUND_AGREEMENT': { label: 'Make payment', reason: 'The agreement is ready for funding.' },
    'REQUEST_RELEASE': { label: 'Request release', reason: 'Payment is ready to be released.' },
    'ACKNOWLEDGE_REVIEW': { label: 'Review the dispute', reason: 'A dispute has been raised that needs your attention.' },
    'APPROVE_PAYOUT': { label: 'Approve the payout', reason: 'A payout is waiting for approval.' },
  };
  return map[actionCode] || null;
}

function participantResolved(p: SecurePayAgreementParticipant): boolean {
  return p.participantStatus === 'CONFIRMED' || p.participantStatus === 'JOINED_UNCONFIRMED';
}

function participantRole(p: SecurePayAgreementParticipant): WorkspaceRole {
  if (p.participantStatus === 'CREATOR') return 'creator';
  const role = p.roleCode.toUpperCase();
  if (role.includes('PAYER')) return 'payer';
  if (role.includes('CONTRIBUTOR')) return 'contributor';
  if (role.includes('RECIPIENT') || role.includes('BENEFICIARY')) return 'recipient';
  if (role.includes('APPROVER')) return 'approver';
  if (role.includes('COUNTERPARTY')) return 'recipient';
  return 'observer';
}

function participantLabel(p: SecurePayAgreementParticipant): string {
  const role = participantRole(p);
  const labels: Record<WorkspaceRole, string> = {
    creator: 'Creator',
    payer: 'Payer',
    contributor: 'Contributor',
    recipient: 'Recipient',
    approver: 'Approver',
    observer: 'Participant',
  };
  return labels[role];
}

// ─── Main projection builder ────────────────────────────────────

export interface WorkspaceProjectionInput {
  agreement: SecurePayAgreement;
  topology: AgreementTopology;
  participants: SecurePayAgreementParticipant[];
  moneyStatus: SecurePayAgreementMoneyStatus | null;
  obligations: SecurePayAgreementObligation[];
  milestones: SecurePayAgreementMilestone[];
  activity: SecurePayAgreementActivity[];
  confirmationStatus: SecurePayAgreementConfirmationStatus | null;
  nextActions: SecurePayParticipantNextAction[];
  groupSecureLink: SecurePayPrivateGroupSecureLink | null;
  paymentIntents: SecurePayAgreementPaymentIntentSummary[];
  releaseStatus: SecurePayPaymentReleaseSettlementStatus | null;
  creatorPerspective: boolean;
}

export function buildWorkspaceProjection(input: WorkspaceProjectionInput): AgreementWorkspaceProjection {
  const { agreement, topology, participants, moneyStatus, obligations, milestones, activity, confirmationStatus, nextActions, groupSecureLink, paymentIntents, releaseStatus, creatorPerspective } = input;

  // ── Human status ──
  const baseStatus = translateAgreementStatus(agreement.status);
  let humanStatus = baseStatus;

  // Override with more specific status when available
  if (releaseStatus) {
    if (releaseStatus.settlementPhase === 'SETTLED') {
      humanStatus = { title: 'Payment settled', explanation: 'Funds have been released and settled.', variant: 'complete' };
    } else if (releaseStatus.settlementPhase === 'RESERVED') {
      humanStatus = { title: 'Payment being processed', explanation: 'Funds are reserved and being processed for release.', variant: 'active' };
    } else if (releaseStatus.settlementPhase === 'HELD_EXCEPTION') {
      humanStatus = { title: 'Payment held for review', explanation: 'The release encountered an issue and is being reviewed.', variant: 'attention' };
    }
  } else if (moneyStatus?.paymentReady) {
    humanStatus = { title: 'Payment ready', explanation: 'All conditions have been met. Payment can be released.', variant: 'active' };
  } else if (paymentIntents.some(pi => pi.status === 'CONFIRMED')) {
    humanStatus = { title: 'Payment received', explanation: 'Funding has been confirmed. Waiting for release conditions.', variant: 'active' };
  } else if (paymentIntents.some(pi => pi.status === 'ACTION_REQUIRED')) {
    humanStatus = { title: 'Action needed for payment', explanation: 'The payment provider needs you to complete an action.', variant: 'attention' };
  } else if (confirmationStatus && !confirmationStatus.confirmationCurrent) {
    humanStatus = { title: 'Ready to confirm', explanation: 'The agreement has been updated. You need to confirm the new version.', variant: 'attention' };
  }

  // ── Primary next action ──
  let primaryNextAction: PrimaryNextAction | null = null;

  // Use backend next-actions if available (authoritative)
  const highUrgencyAction = nextActions.find(a => a.urgency === 'HIGH');
  const anyAction = nextActions[0];

  if (highUrgencyAction || anyAction) {
    const action = highUrgencyAction || anyAction;
    const translated = translateActionCode(action.actionType);
    if (translated) {
      primaryNextAction = {
        label: translated.label,
        reason: translated.reason || action.actionReason,
        href: null,
        actionCode: action.actionType,
        urgency: action.urgency === 'HIGH' ? 'high' : action.urgency === 'MEDIUM' ? 'medium' : 'low',
      };
    } else {
      primaryNextAction = {
        label: action.actionReason || 'Action needed',
        reason: action.actionReason,
        href: null,
        actionCode: action.actionType,
        urgency: action.urgency === 'HIGH' ? 'high' : action.urgency === 'MEDIUM' ? 'medium' : 'low',
      };
    }
  }

  // Fallback: derive from state when backend doesn't provide next-actions
  if (!primaryNextAction) {
    if (agreement.status === 'PROPOSED' || agreement.status === 'INVITATION_PENDING') {
      const hasUninvited = participants.some(p => p.participantStatus === 'INVITED' || p.participantStatus === 'PENDING');
      if (hasUninvited && creatorPerspective) {
        primaryNextAction = {
          label: 'Invite the other person',
          reason: 'The agreement needs the other participant to join.',
          href: null,
          actionCode: 'INVITE_PARTICIPANT',
          urgency: 'high',
        };
      } else if (!creatorPerspective) {
        primaryNextAction = {
          label: 'Review the agreement',
          reason: 'You have been invited to join this agreement.',
          href: null,
          actionCode: 'CONFIRM_VERSION',
          urgency: 'high',
        };
      }
    } else if (confirmationStatus && !confirmationStatus.confirmationCurrent) {
      primaryNextAction = {
        label: 'Confirm the agreement',
        reason: 'The agreement has been updated. You need to confirm the new version.',
        href: null,
        actionCode: 'CONFIRM_VERSION',
        urgency: 'high',
      };
    } else if (moneyStatus?.paymentReady && !releaseStatus) {
      primaryNextAction = {
        label: 'Request release',
        reason: 'Payment is ready to be released.',
        href: null,
        actionCode: 'REQUEST_RELEASE',
        urgency: 'medium',
      };
    } else if (groupSecureLink && groupSecureLink.status === 'ACTIVE' && creatorPerspective) {
      primaryNextAction = {
        label: 'Share the contribution link',
        reason: 'Contributors can join through the contribution link.',
        href: null,
        actionCode: 'SHARE_CONTRIBUTION_LINK',
        urgency: 'medium',
      };
    }
  }

  // ── Participants ──
  const participantSummaries: ParticipantSummary[] = participants.map(p => ({
    role: participantRole(p),
    label: participantLabel(p),
    status: p.participantStatus,
    resolved: participantResolved(p),
  }));

  // ── Money summary ──
  const money: MoneySummary = {
    agreementAmountDisplay: formatMinor(agreement.proposedAmountMinor, agreement.currency),
    evaluatedAmountDisplay: moneyStatus ? formatMinor(moneyStatus.evaluatedAmountMinor, moneyStatus.evaluatedCurrency) : null,
    paymentReady: moneyStatus?.paymentReady ?? false,
    paymentReadyStatus: moneyStatus?.paymentReadyStatus ?? 'NOT_READY',
    outstandingReasons: moneyStatus?.outstandingReasons.map(r => r.reasonCode) ?? [],
    contributedTotalDisplay: groupSecureLink ? formatMinor(groupSecureLink.confirmedContributionTotalMinor, groupSecureLink.currency) : null,
    expectedTotalDisplay: groupSecureLink ? formatMinor(groupSecureLink.targetAmountMinor, groupSecureLink.currency) : null,
  };

  // ── Attention items ──
  const attentionItems: AttentionItem[] = [];

  // Unresolved participants
  const unresolvedParticipants = participants.filter(p => !participantResolved(p) && p.participantStatus !== 'CREATOR');
  if (unresolvedParticipants.length > 0) {
    attentionItems.push({
      label: `${unresolvedParticipants.length} participant${unresolvedParticipants.length === 1 ? '' : 's'} need SecurePay identities`,
      reason: 'These people have been invited but have not joined yet.',
      severity: 'medium',
    });
  }

  // Outstanding payment reasons
  if (moneyStatus && !moneyStatus.paymentReady && moneyStatus.outstandingReasons.length > 0) {
    attentionItems.push({
      label: 'Payment not ready',
      reason: moneyStatus.outstandingReasons.map(r => r.reasonCode).join(', '),
      severity: 'medium',
    });
  }

  // Overdue obligations
  const overdueObligations = obligations.filter(o => o.status === 'OVERDUE');
  if (overdueObligations.length > 0) {
    attentionItems.push({
      label: `${overdueObligations.length} task${overdueObligations.length === 1 ? '' : 's'} overdue`,
      reason: overdueObligations.map(o => o.title).join(', '),
      severity: 'high',
    });
  }

  // Held exception
  if (releaseStatus?.settlementPhase === 'HELD_EXCEPTION') {
    attentionItems.push({
      label: 'Payment held for review',
      reason: releaseStatus.exception?.customerSafeReason || 'The release encountered an issue.',
      severity: 'high',
    });
  }

  // Action required for payment
  if (paymentIntents.some(pi => pi.status === 'ACTION_REQUIRED')) {
    attentionItems.push({
      label: 'Payment action required',
      reason: 'The payment provider needs you to complete an action.',
      severity: 'high',
    });
  }

  // ── Milestones ──
  const milestoneProgress: MilestoneProgress[] = milestones
    .sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0))
    .map(m => ({
      title: m.title,
      status: m.status,
      humanStatus: translateMilestoneStatus(m.status),
    }));

  // ── Activity ──
  const recentActivity: ActivityEntry[] = activity
    .slice()
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 10)
    .map(a => ({
      description: a.activityType.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()),
      timestamp: a.occurredAt,
      type: a.activityType,
    }));

  return {
    agreementId: agreement.id,
    publicReference: agreement.publicReference,
    title: agreement.title,
    topology,
    humanStatus,
    primaryNextAction,
    participants: participantSummaries,
    money,
    attentionItems,
    milestones: milestoneProgress,
    recentActivity,
    creatorPerspective,
  };
}

// ─── Status-only projection (for list views, preview cards) ─────

export interface WorkspaceStatusCard {
  agreementId: string;
  publicReference: string;
  title: string;
  topology: AgreementTopology;
  humanStatus: HumanStatus;
  primaryNextAction: PrimaryNextAction | null;
  attentionRequired: boolean;
  amountDisplay: string | null;
}

export function buildStatusCard(
  agreement: Pick<SecurePayAgreement, 'id' | 'publicReference' | 'title' | 'status' | 'proposedAmountMinor' | 'currency'>,
  topology: AgreementTopology,
  nextActions: SecurePayParticipantNextAction[],
  attentionRequired: boolean,
): WorkspaceStatusCard {
  const humanStatus = translateAgreementStatus(agreement.status);
  let primaryNextAction: PrimaryNextAction | null = null;

  const action = nextActions.find(a => a.urgency === 'HIGH') || nextActions[0];
  if (action) {
    const translated = translateActionCode(action.actionType);
    if (translated) {
      primaryNextAction = {
        label: translated.label,
        reason: translated.reason,
        href: null,
        actionCode: action.actionType,
        urgency: action.urgency === 'HIGH' ? 'high' : 'medium',
      };
    }
  }

  return {
    agreementId: agreement.id,
    publicReference: agreement.publicReference,
    title: agreement.title,
    topology,
    humanStatus,
    primaryNextAction,
    attentionRequired,
    amountDisplay: formatMinor(agreement.proposedAmountMinor, agreement.currency),
  };
}
