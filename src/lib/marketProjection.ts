import type { CurrentUserAgreementSummary, SecurePayActivity, WorkspaceNextAction } from '../api/securepayTypes';

export type MarketLane = 'attention' | 'waiting' | 'active' | 'completed';
export type MarketUrgency = 'high' | 'medium' | 'low' | 'none';

export interface MarketPrimaryAction {
  label: string;
  reason: string;
  actionCode: string;
  urgency: MarketUrgency;
  href: string;
  deadline: string | null;
}

export interface MarketItem {
  agreementId: string;
  publicReference: string;
  title: string;
  purpose: string | null;
  status: string;
  role: string | null;
  counterparty: string | null;
  amountDisplay: string | null;
  humanStatus: string;
  lane: MarketLane;
  primaryAction: MarketPrimaryAction | null;
  waitingOn: string | null;
  deadline: string | null;
  updatedAt: string;
}

export interface MarketActivityItem {
  id: string;
  description: string;
  detail: string;
  amountDisplay: string | null;
  occurredAt: string;
}

export interface MarketProjection {
  attention: MarketItem[];
  waiting: MarketItem[];
  active: MarketItem[];
  completed: MarketItem[];
  actions: MarketPrimaryAction[];
  recentActivity: MarketActivityItem[];
}

const COMPLETE_STATUSES = new Set(['COMPLETED', 'SETTLED']);
const CLOSED_STATUSES = new Set(['CANCELLED', 'EXPIRED']);

function money(minor: string | null, currency: string | null): string | null {
  if (minor == null) return null;
  const parsed = Number(minor);
  if (!Number.isFinite(parsed)) return null;
  const major = parsed / 100;
  return `${currency || 'KES'} ${major.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}

function urgency(action: WorkspaceNextAction): MarketUrgency {
  const raw = action.attentionClass.toUpperCase();
  if (raw.includes('HIGH') || raw.includes('URGENT') || raw.includes('CRITICAL')) return 'high';
  if (raw.includes('MEDIUM')) return 'medium';
  if (raw.includes('LOW')) return 'low';
  return 'none';
}

function actionLabel(code: string, reason: string): string {
  const labels: Record<string, string> = {
    INVITE_PARTICIPANT: 'Invite the other person',
    INVITE_RECIPIENT: 'Add recipient identities',
    SHARE_CONTRIBUTION_LINK: 'Share contribution link',
    CONFIRM_VERSION: 'Confirm the agreement',
    START_OBLIGATION: 'Start the next task',
    SUBMIT_EVIDENCE: 'Add evidence',
    REVIEW_EVIDENCE: 'Review the evidence',
    COMPLETE_OBLIGATION: 'Confirm the work',
    FUND_AGREEMENT: 'Make payment',
    REQUEST_RELEASE: 'Review the payment step',
    ACKNOWLEDGE_REVIEW: 'Review the clarification',
    RESPOND_TO_REVIEW: 'Respond to the clarification',
    APPROVE_PAYOUT: 'Review the supplier payment step',
    REVIEW_DISTRIBUTION_PLAN: 'Review distribution',
  };
  return labels[code] || reason || 'Open agreement';
}

function humanStatus(item: CurrentUserAgreementSummary): string {
  const status = item.status.toUpperCase();
  if (COMPLETE_STATUSES.has(status)) return 'Completed';
  if (status === 'CANCELLED') return 'Cancelled';
  if (status === 'EXPIRED') return 'Expired';
  if (item.attentionRequired) return 'Needs your attention';
  if (item.nextActions.length === 0) return 'Nothing needed from you right now';
  if (status.includes('INVITATION')) return 'Waiting for a response';
  if (status.includes('JOINING')) return 'People are joining';
  if (status.includes('CONFIRMATION')) return 'Confirmation is needed';
  if (status === 'PROPOSED') return 'Agreement sent';
  if (status === 'DRAFT') return 'Draft agreement';
  return 'In progress';
}

function waitingText(item: CurrentUserAgreementSummary): string | null {
  if (item.attentionRequired) return null;
  const status = item.status.toUpperCase();
  if (status.includes('INVITATION') || status === 'PROPOSED') return 'Waiting for the other participant';
  if (status.includes('JOINING')) return 'Waiting for participants';
  if (item.nextActions.length === 0 && !COMPLETE_STATUSES.has(status) && !CLOSED_STATUSES.has(status)) return 'No action needed from you';
  return null;
}

function projectItem(item: CurrentUserAgreementSummary): MarketItem {
  const backendAction = item.nextActions[0] ?? null;
  const primaryAction = backendAction ? {
    label: actionLabel(backendAction.actionCode, backendAction.reason),
    reason: backendAction.reason,
    actionCode: backendAction.actionCode,
    urgency: urgency(backendAction),
    href: `/agreements/${encodeURIComponent(item.agreementId)}`,
    deadline: backendAction.deadline,
  } satisfies MarketPrimaryAction : null;

  const status = item.status.toUpperCase();
  const waitingOn = waitingText(item);
  let lane: MarketLane = 'active';
  if (COMPLETE_STATUSES.has(status) || CLOSED_STATUSES.has(status)) lane = 'completed';
  else if (item.attentionRequired) lane = 'attention';
  else if (waitingOn) lane = 'waiting';

  return {
    agreementId: item.agreementId,
    publicReference: item.publicReference,
    title: item.title,
    purpose: item.purpose,
    status: item.status,
    role: item.currentActor?.roleCode ?? null,
    counterparty: item.counterparty?.displayName || item.counterparty?.ksNumber || null,
    amountDisplay: money(item.proposedAmountMinor, item.currency),
    humanStatus: humanStatus(item),
    lane,
    primaryAction,
    waitingOn,
    deadline: item.nextDeadline,
    updatedAt: item.updatedAt,
  };
}

function activityItem(item: SecurePayActivity): MarketActivityItem {
  const amountDisplay = typeof item.amount === 'number'
    ? `${item.currency || 'KES'} ${Math.abs(item.amount).toLocaleString('en-KE', { maximumFractionDigits: 2 })}`
    : null;
  const detail = item.status
    ? item.status.replace(/[_-]+/g, ' ').toLowerCase()
    : item.type.replace(/[_-]+/g, ' ').toLowerCase();
  return {
    id: item.id,
    description: item.description || item.type.replace(/[_-]+/g, ' '),
    detail,
    amountDisplay,
    occurredAt: item.timestamp,
  };
}

export function buildMarketProjection(
  agreements: CurrentUserAgreementSummary[],
  activity: SecurePayActivity[],
): MarketProjection {
  const items = agreements.map(projectItem);
  const sortRecent = (a: MarketItem, b: MarketItem) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  const attention = items.filter(item => item.lane === 'attention').sort(sortRecent);
  const waiting = items.filter(item => item.lane === 'waiting').sort(sortRecent);
  const active = items.filter(item => item.lane === 'active').sort(sortRecent);
  const completed = items.filter(item => item.lane === 'completed').sort(sortRecent);
  const actions = attention
    .map(item => item.primaryAction)
    .filter((action): action is MarketPrimaryAction => Boolean(action));
  const recentActivity = [...activity]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 10)
    .map(activityItem);

  return { attention, waiting, active, completed, actions, recentActivity };
}
