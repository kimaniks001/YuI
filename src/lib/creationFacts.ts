// ═══════════════════════════════════════════════════════════════
// CREATION FACTS — explicit classification of every piece of
// information the creation engine tracks.
//
// UNDERSTOOD — carried/inferred from Home intent or deterministic rules
// CONFIRMED — the trader explicitly confirmed this during creation
// PROPOSED  — a selection that requires backend authority later
// AUTHORITATIVE — returned/established by the backend
//
// This boundary makes it easy for future flow implementations to
// know which facts they can write to the backend vs. which are
// merely preferences the backend may or may not honor.
// ═══════════════════════════════════════════════════════════════

import type { AgreementTopology, TopologyProposal } from './agreementTopology';
import type { CreationIntent } from './creationIntent';

export type FactOrigin = 'understood' | 'confirmed' | 'proposed' | 'authoritative';

export interface Fact<T = string> {
  origin: FactOrigin;
  value: T;
  /** Human-readable label for display in review/summary contexts. */
  label: string;
}

// ─── Stage / milestone definition ───────────────────────────────

export interface StageEntry {
  label: string;
  amount: string; // free-text — may be "KES 30,000" or empty
}

// ─── Confirmer preference ───────────────────────────────────────

export type ConfirmerPreference = 'me' | 'someone_else' | null;

// ─── MANY_TO_ONE: Contribution model ────────────────────────────

export type ContributionMode = 'equal' | 'custom' | null;
export type ContributionFrequency = 'once' | 'weekly' | 'monthly' | 'custom' | null;

export interface ContributorEntry {
  ksNumber: string;
  label: string; // display name or placeholder
}

// ─── ONE_TO_MANY: SecureFlow recipient model ────────────────────

export type AllocationMode = 'equal' | 'custom' | null;

export interface RecipientEntry {
  label: string;       // role name, e.g. "Contractor"
  ksNumber: string;    // KSNumber (may be empty — invite later)
  allocationMinor: number | null; // amount in minor units (may be empty for equal split)
  obligation: string;  // what they need to complete (human language)
}

/**
 * Recipient identity resolution state.
 *
 * DESCRIBED     — role/name understood from intent, no identity yet.
 * IDENTIFIED    — a genuine KSNumber has been entered by the trader.
 *                 Allocation submission requires at least IDENTIFIED.
 * INVITED       — invitation confirmed by backend (not used in creation flow yet).
 * PARTICIPATING — backend confirms acceptance (always authoritative).
 *
 * These are model boundaries, not customer-facing labels.
 */
export type RecipientResolution =
  | 'DESCRIBED'
  | 'IDENTIFIED'
  | 'INVITED'
  | 'PARTICIPATING';

export function recipientResolution(r: RecipientEntry): RecipientResolution {
  if (r.ksNumber.trim().length > 0) return 'IDENTIFIED';
  return 'DESCRIBED';
}

/**
 * Whether a recipient is far enough along to be submitted as a
 * beneficiary allocation. The backend requires a genuine KSNumber.
 */
export function isRecipientResolved(r: RecipientEntry): boolean {
  return r.ksNumber.trim().length > 0;
}

export type SecureFlowStage = 'idle' | 'agreement_created' | 'plan_created' | 'allocations_set' | 'submitted' | 'locked' | 'funded' | 'failed';

// ─── MANY_TO_MANY: Group SecureFlow model ───────────────────────

/**
 * How contributors will join the group.
 * INVITE     — organizer invites specific people by KSNumber
 * SHARE_LINK — organizer shares a public contribution link
 * The backend's Group SecureLink public locator is the real
 * share-link mechanism. INVITE is a UI intention only —
 * the backend must confirm any invitation.
 */
export type ContributionJoinMode = 'invite' | 'share_link' | null;

/**
 * Governance mode for payout approvals.
 * CREATOR_MANAGED  — the creator approves payouts alone (simplest)
 * COMMITTEE        — one or more additional approvers are required
 * The backend's governance policy/approval-request system is the
 * real authority. The UI mode is a proposed preference only.
 */
export type GovernanceMode = 'creator_managed' | 'committee' | null;

/**
 * Group SecureFlow lifecycle stage — tracks partial creation state.
 * Mirrors SecureFlowStage but with group-specific steps.
 */
export type GroupSecureFlowStage =
  | 'idle'
  | 'agreement_created'
  | 'group_created'
  | 'plan_created'
  | 'allocations_set'
  | 'awaiting_identities'
  | 'submitted'
  | 'failed';

/**
 * Contributor identity resolution state.
 *
 * DESCRIBED  — known by role/group concept only (e.g. "20 parents")
 * IDENTIFIED — a genuine KSNumber has been entered
 * INVITED    — backend-confirmed invitation
 * JOINED     — backend confirms the contributor has joined the group
 * FUNDED     — backend confirms actual contribution payment
 *
 * The frontend may only produce DESCRIBED or IDENTIFIED.
 * INVITED, JOINED, and FUNDED are backend-only.
 */
export type ContributorResolution =
  | 'DESCRIBED'
  | 'IDENTIFIED'
  | 'INVITED'
  | 'JOINED'
  | 'FUNDED';

export function contributorResolution(c: ContributorEntry): ContributorResolution {
  if (c.ksNumber.trim().length > 0) return 'IDENTIFIED';
  return 'DESCRIBED';
}

export function isContributorResolved(c: ContributorEntry): boolean {
  return c.ksNumber.trim().length > 0;
}

// ─── The full creation state ────────────────────────────────────

export interface CreationFacts {
  // UNDERSTOOD — from Home intent
  intent: CreationIntent;
  topology: TopologyProposal;

  // CONFIRMED — trader explicitly set these (ONE_TO_ONE)
  payerIsCreator: Fact<boolean | null>;
  counterpartyKs: Fact<string>;
  stages: Fact<StageEntry[]>;
  confirmer: Fact<ConfirmerPreference>;

  // CONFIRMED — trader explicitly set these (MANY_TO_ONE)
  contributorCount: Fact<number | null>;
  contributors: Fact<ContributorEntry[]>;
  contributionMode: Fact<ContributionMode>;
  recipientKs: Fact<string>;
  frequency: Fact<ContributionFrequency>;
  targetAmount: Fact<string>; // human-readable, e.g. "KES 30,000"

  // AUTHORITATIVE — set only after backend calls succeed
  createdAgreementId: Fact<string | null>;
  createdPublicReference: Fact<string | null>;
  invitationConfirmed: Fact<boolean>;
  milestonesSaved: Fact<number>;
  milestonesFailed: Fact<boolean>;
  // MANY_TO_ONE authoritative facts
  groupSecureLinkId: Fact<string | null>;
  publicLocatorSlug: Fact<string | null>;

  // CONFIRMED — trader explicitly set these (ONE_TO_MANY / SecureFlow)
  recipientCount: Fact<number | null>;
  recipients: Fact<RecipientEntry[]>;
  allocationMode: Fact<AllocationMode>;
  // AUTHORITATIVE — set only after backend calls succeed
  distributionPlanId: Fact<string | null>;
  distributionPlanVersionId: Fact<string | null>;
  secureFlowStage: Fact<SecureFlowStage>;

  // CONFIRMED — trader explicitly set these (MANY_TO_MANY / Group SecureFlow)
  contributionJoinMode: Fact<ContributionJoinMode>;
  contributionAmountPerPerson: Fact<number | null>; // minor units
  governanceMode: Fact<GovernanceMode>;
  // AUTHORITATIVE — set only after backend calls succeed
  groupSecureFlowStage: Fact<GroupSecureFlowStage>;
  expectedTotalMinor: Fact<number | null>; // advisory only — never authoritative funding
}

// ─── Builder: create initial facts from intent ──────────────────

import { inferTopology, extractParticipantCounts, extractRecipientLabels } from './agreementTopology';
import { creatorIsLikelyPayer, extractStageCount } from './creationIntent';

export function createInitialFacts(intent: CreationIntent): CreationFacts {
  const topology = inferTopology(intent);
  const likelyPayer = creatorIsLikelyPayer(intent);
  const stageCount = extractStageCount(intent);
  const { payerCount, recipientCount: recipientCountVal } = extractParticipantCounts(intent);
  const recipientLabels = extractRecipientLabels(intent);

  // If intent states "we" but doesn't clarify the creator's role, payerIsCreator stays null
  const initialPayer: boolean | null = likelyPayer;

  const initialStages: StageEntry[] =
    stageCount && stageCount > 0
      ? Array.from({ length: stageCount }, () => ({ label: '', amount: '' }))
      : [{ label: '', amount: '' }];

  // MANY_TO_ONE: extract frequency from amount/statement
  const lowerAmt = intent.amount.toLowerCase();
  const lowerStmt = intent.statement.toLowerCase();
  let initialFrequency: ContributionFrequency = null;
  if (lowerAmt.includes('month') || lowerStmt.includes('every month') || lowerStmt.includes('monthly')) {
    initialFrequency = 'monthly';
  } else if (lowerAmt.includes('week') || lowerStmt.includes('every week') || lowerStmt.includes('weekly')) {
    initialFrequency = 'weekly';
  } else if (lowerAmt.includes('once') || lowerStmt.includes('one-time') || lowerStmt.includes('one time')) {
    initialFrequency = 'once';
  }

  // Extract recipient label from "who" field (e.g. "Mum", "Guardian")
  const whoLower = intent.who.toLowerCase();
  let recipientLabel = '';
  const recipientMatch = whoLower.match(/→\s*(.+)$/);
  if (recipientMatch) {
    recipientLabel = recipientMatch[1].replace(/\(.*?\)/g, '').trim();
  }

  // MANY_TO_MANY: extract per-person contribution from amount field
  // e.g. "KES 4,000 per parent" → 400000 minor units
  const perPersonMatch = intent.amount.match(/([\d,]+)\s*(?:per|each)/);
  const perPersonMinor = perPersonMatch
    ? Math.round(Number(perPersonMatch[1].replace(/,/g, '')) * 100)
    : null;
  // Expected total = perPerson × contributorCount (advisory only)
  const expectedTotal = perPersonMinor && payerCount
    ? perPersonMinor * payerCount
    : null;

  return {
    intent,
    topology,
    payerIsCreator: {
      origin: 'understood',
      value: initialPayer,
      label: 'Payer role',
    },
    counterpartyKs: {
      origin: 'understood',
      value: '',
      label: 'Counterparty KSNumber',
    },
    stages: {
      origin: 'understood',
      value: initialStages,
      label: 'Milestones',
    },
    confirmer: {
      origin: 'proposed',
      value: 'me',
      label: 'Preferred confirmer',
    },
    // MANY_TO_ONE facts
    contributorCount: {
      origin: payerCount ? 'understood' : 'understood',
      value: payerCount,
      label: 'Number of contributors',
    },
    contributors: {
      origin: 'understood',
      value: [],
      label: 'Contributors',
    },
    contributionMode: {
      origin: 'understood',
      value: null,
      label: 'Contribution split',
    },
    recipientKs: {
      origin: 'understood',
      value: '',
      label: `Recipient KSNumber${recipientLabel ? ` (${recipientLabel})` : ''}`,
    },
    frequency: {
      origin: initialFrequency ? 'understood' : 'understood',
      value: initialFrequency,
      label: 'Frequency',
    },
    targetAmount: {
      origin: 'understood',
      value: intent.amount,
      label: 'Target amount',
    },
    createdAgreementId: {
      origin: 'authoritative',
      value: null,
      label: 'Agreement ID',
    },
    createdPublicReference: {
      origin: 'authoritative',
      value: null,
      label: 'Public reference',
    },
    invitationConfirmed: {
      origin: 'authoritative',
      value: false,
      label: 'Invitation sent',
    },
    milestonesSaved: {
      origin: 'authoritative',
      value: 0,
      label: 'Milestones saved',
    },
    milestonesFailed: {
      origin: 'authoritative',
      value: false,
      label: 'Milestones failed',
    },
    groupSecureLinkId: {
      origin: 'authoritative',
      value: null,
      label: 'Group SecureLink ID',
    },
    publicLocatorSlug: {
      origin: 'authoritative',
      value: null,
      label: 'Contribution link',
    },
    // ONE_TO_MANY facts
    recipientCount: {
      origin: recipientCountVal ? 'understood' : 'understood',
      value: recipientCountVal,
      label: 'Number of recipients',
    },
    recipients: {
      origin: recipientLabels.length > 0 ? 'understood' : 'understood',
      value: recipientLabels.map((label) => ({
        label,
        ksNumber: '',
        allocationMinor: null,
        obligation: '',
      })),
      label: 'Recipients',
    },
    allocationMode: {
      origin: 'understood',
      value: null,
      label: 'Allocation mode',
    },
    distributionPlanId: {
      origin: 'authoritative',
      value: null,
      label: 'Distribution plan ID',
    },
    distributionPlanVersionId: {
      origin: 'authoritative',
      value: null,
      label: 'Plan version ID',
    },
    secureFlowStage: {
      origin: 'authoritative',
      value: 'idle',
      label: 'SecureFlow stage',
    },
    // MANY_TO_MANY facts
    contributionJoinMode: {
      origin: 'understood',
      value: null,
      label: 'How contributors join',
    },
    contributionAmountPerPerson: {
      origin: perPersonMinor ? 'understood' : 'understood',
      value: perPersonMinor,
      label: 'Contribution per person',
    },
    governanceMode: {
      origin: 'understood',
      value: null,
      label: 'Payout approval',
    },
    groupSecureFlowStage: {
      origin: 'authoritative',
      value: 'idle',
      label: 'Group SecureFlow stage',
    },
    expectedTotalMinor: {
      origin: 'understood',
      value: expectedTotal,
      label: 'Expected total',
    },
  };
}

// ─── Classification helpers ─────────────────────────────────────

/**
 * Returns only facts of a given origin — useful for review rendering
 * to separate confirmed terms from proposed preferences.
 */
export function factsByOrigin(facts: CreationFacts, origin: FactOrigin): Fact<unknown>[] {
  const all: Fact<unknown>[] = [
    facts.payerIsCreator as Fact<unknown>,
    facts.counterpartyKs as Fact<unknown>,
    facts.stages as Fact<unknown>,
    facts.confirmer as Fact<unknown>,
    facts.contributorCount as Fact<unknown>,
    facts.contributors as Fact<unknown>,
    facts.contributionMode as Fact<unknown>,
    facts.recipientKs as Fact<unknown>,
    facts.frequency as Fact<unknown>,
    facts.targetAmount as Fact<unknown>,
    facts.createdAgreementId as Fact<unknown>,
    facts.createdPublicReference as Fact<unknown>,
    facts.invitationConfirmed as Fact<unknown>,
    facts.milestonesSaved as Fact<unknown>,
    facts.milestonesFailed as Fact<unknown>,
    facts.groupSecureLinkId as Fact<unknown>,
    facts.publicLocatorSlug as Fact<unknown>,
    facts.recipientCount as Fact<unknown>,
    facts.recipients as Fact<unknown>,
    facts.allocationMode as Fact<unknown>,
    facts.distributionPlanId as Fact<unknown>,
    facts.distributionPlanVersionId as Fact<unknown>,
    facts.secureFlowStage as Fact<unknown>,
    facts.contributionJoinMode as Fact<unknown>,
    facts.contributionAmountPerPerson as Fact<unknown>,
    facts.governanceMode as Fact<unknown>,
    facts.groupSecureFlowStage as Fact<unknown>,
    facts.expectedTotalMinor as Fact<unknown>,
  ];
  return all.filter((f) => f.origin === origin);
}

/**
 * Whether a fact is settled (has a non-empty / non-null value).
 */
export function isFactSettled<T>(fact: Fact<T>): boolean {
  if (fact.value === null || fact.value === '') return false;
  if (Array.isArray(fact.value)) return fact.value.length > 0 && fact.value.some((s) => (s as StageEntry).label?.trim());
  return true;
}

/**
 * Upgrades a fact's origin when the trader explicitly confirms it.
 */
export function confirmFact<T>(fact: Fact<T>, value: T): Fact<T> {
  return { ...fact, origin: 'confirmed', value };
}

/**
 * Sets a fact as a proposal (the trader selected something but the
 * backend will make the final determination).
 */
export function proposeFact<T>(fact: Fact<T>, value: T): Fact<T> {
  return { ...fact, origin: 'proposed', value };
}

/**
 * Sets an authoritative fact from a backend response.
 */
export function authorizeFact<T>(fact: Fact<T>, value: T): Fact<T> {
  return { ...fact, origin: 'authoritative', value };
}

// ─── Topology helper for the facts model ────────────────────────

export function getTopology(facts: CreationFacts): AgreementTopology {
  return facts.topology.topology;
}

// ─── Payer-count awareness for group topologies ─────────────────

/**
 * For MANY_TO_ONE and MANY_TO_MANY, the "counterparty" concept changes:
 * the counterparty is the recipient, not a single payer. This helper
 * returns the correct label for the counterparty input screen.
 */
export function counterpartyLabelForTopology(
  topology: AgreementTopology,
  intent: CreationIntent,
): string {
  const who = intent.who.toLowerCase();
  if (topology === 'MANY_TO_ONE' || topology === 'MANY_TO_MANY') {
    // The recipient side — "Mum", "Guardian", "Organizer", "Family"
    if (who.includes('mum')) return 'recipient';
    if (who.includes('guardian')) return 'guardian';
    if (who.includes('organizer')) return 'organizer';
    return 'recipient';
  }
  // ONE_TO_ONE or ONE_TO_MANY — counterparty is the worker/seller/supplier
  if (who.includes('painter')) return 'painter';
  if (who.includes('seller')) return 'seller';
  if (who.includes('buyer')) return 'buyer';
  if (who.includes('worker')) return 'worker';
  if (who.includes('client')) return 'client';
  if (who.includes('supplier')) return 'supplier';
  return 'other person';
}
