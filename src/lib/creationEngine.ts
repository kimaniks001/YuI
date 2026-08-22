// ═══════════════════════════════════════════════════════════════
// CREATION ENGINE — the shared "ask the minimum question" logic.
//
// The engine determines the NEXT MISSING FACT and produces a question
// screen identifier. It does NOT create a fixed 10-step wizard.
// The number of screens naturally changes according to the agreement.
//
// The flow is:
//   UNDERSTAND → CONFIRM ONLY WHEN NEEDED → ASK ONLY WHAT IS MISSING
//   → REMEMBER → NEXT → REVIEW
// ═══════════════════════════════════════════════════════════════

import type { CreationFacts } from './creationFacts';
import type { CreationIntent } from './creationIntent';
import { creatorIsLikelyPayer } from './creationIntent';
import { isBackendSupported } from './agreementTopology';

// ─── Question identifiers ───────────────────────────────────────

export type QuestionId =
  | 'understood'      // "Is this right?" — only when confidence is low/ambiguous
  | 'payer'           // "Are you the one paying?" — only when payer role is unknown
  // ONE_TO_ONE questions
  | 'counterparty'    // "Who is the [painter/recipient]?"
  | 'stages'          // "What are the stages?"
  | 'confirmer'       // "Who confirms the work?" — proposed info only
  // MANY_TO_ONE questions
  | 'contributors'    // "Who are the family members?" — add/invite
  | 'split'           // "How should KES 30,000 be shared?" — equal/custom
  | 'recipient'       // "Who is Mum?" — KSN lookup / invite
  | 'frequency'       // "How often?" — only if not already known
  // ONE_TO_MANY questions
  | 'recipients'      // "Who are they?" — add KSNumbers to known roles
  | 'allocation'      // "How should KES 180,000 be shared?" — equal/custom
  | 'obligations'     // "What does each person need to complete?"
  // MANY_TO_MANY questions
  | 'join_mode'       // "How will the [parents/shops] join?" — invite / share link
  | 'governance'      // "Who approves the payouts?" — only if needed
  // Shared
  | 'review'          // final review
  | 'unsupported'     // topology not yet backend-backed
  | 'created';        // success

export interface Question {
  id: QuestionId;
  /** Whether this question is part of the progress count. */
  counted: boolean;
}

// ─── Navigation helpers ─────────────────────────────────────────

/**
 * Returns the ordered list of questions that WILL be asked for a given
 * set of facts — used to compute progress bar totals and to drive
 * forward/back navigation.
 *
 * Question planning is TOPOLOGY-AWARE. A MANY_TO_ONE agreement does NOT
 * reuse the ONE_TO_ONE sequence (counterparty → stages → confirmer).
 * It asks its own human questions: contributors, split, recipient,
 * frequency (only if missing).
 */
export function plannedQuestions(facts: CreationFacts): QuestionId[] {
  const intent = facts.intent;
  const topology = facts.topology.topology;
  const questions: QuestionId[] = [];

  // 1. Understood — only if topology confidence is low or payer role is null
  const needsClarificationScreen =
    facts.topology.confidence === 'low' ||
    creatorIsLikelyPayer(intent) === null ||
    facts.topology.missingDimensions.length > 0;

  if (needsClarificationScreen) {
    questions.push('understood');
  }

  // 2. Payer — only if creatorIsLikelyPayer is null
  if (creatorIsLikelyPayer(intent) === null) {
    questions.push('payer');
  }

  // 3. Topology-specific question planning
  if (topology === 'ONE_TO_ONE') {
    questions.push('counterparty');
    questions.push('stages');
    questions.push('confirmer');
    questions.push('review');
    return questions;
  }

  if (topology === 'MANY_TO_ONE') {
    // Contributors — always ask (add KS Numbers or invite later)
    questions.push('contributors');
    // Split — always ask (equal vs custom)
    questions.push('split');
    // Recipient — always ask (who receives)
    questions.push('recipient');
    // Frequency — only if not already understood from Home
    if (!facts.frequency.value) {
      questions.push('frequency');
    }
    // Review
    questions.push('review');
    return questions;
  }

  if (topology === 'ONE_TO_MANY') {
    // Recipients — always ask (add KSNumbers to known roles or invite later)
    questions.push('recipients');
    // Allocation — always ask (equal vs custom amounts per recipient)
    questions.push('allocation');
    // Obligations — always ask (what does each person need to complete)
    questions.push('obligations');
    // Review
    questions.push('review');
    return questions;
  }

  if (topology === 'MANY_TO_MANY') {
    // Contributor join mode — how will contributors join?
    // (contributor count and per-person amount are already known from Home)
    questions.push('join_mode');
    // Recipients — who are the recipients? (reuses ONE_TO_MANY recipient UI)
    questions.push('recipients');
    // Allocation — how should the expected total be distributed?
    questions.push('allocation');
    // Obligations — what is each payment for?
    questions.push('obligations');
    // Governance — who approves payouts? (simple, progressive)
    questions.push('governance');
    // Review
    questions.push('review');
    return questions;
  }

  // MANY_TO_MANY — not yet backend-backed
  if (!isBackendSupported(topology)) {
    questions.push('counterparty');
    questions.push('stages');
    questions.push('confirmer');
    questions.push('unsupported');
    return questions;
  }

  // should not reach here — all topologies handled above
  questions.push('review');
  return questions;
}

/**
 * Computes the current question based on facts and a screen override.
 * If the caller passes a currentScreen that is in the planned list,
 * it is returned. Otherwise, the first unanswered question is returned.
 */
export function currentQuestion(
  facts: CreationFacts,
  currentScreen: QuestionId | null,
): QuestionId {
  const planned = plannedQuestions(facts);

  if (currentScreen && planned.includes(currentScreen)) {
    return currentScreen;
  }

  // Find the first question that hasn't been answered yet
  for (const qid of planned) {
    if (!isQuestionAnswered(qid, facts)) return qid;
  }

  // All questions answered → review
  return 'review';
}

/**
 * Returns the next question after the current one in the planned list.
 * Returns null if there is no next question (end of flow).
 */
export function nextQuestion(facts: CreationFacts, current: QuestionId): QuestionId | null {
  const planned = plannedQuestions(facts);
  const idx = planned.indexOf(current);
  if (idx === -1 || idx === planned.length - 1) return null;
  return planned[idx + 1];
}

/**
 * Returns the previous question before the current one in the planned list.
 * Returns null if there is no previous question (start of flow).
 */
export function previousQuestion(facts: CreationFacts, current: QuestionId): QuestionId | null {
  const planned = plannedQuestions(facts);
  const idx = planned.indexOf(current);
  if (idx <= 0) return null;
  return planned[idx - 1];
}

/**
 * Returns the 1-based position of a question in the planned list,
 * for progress bar rendering. Returns 0 if not in the list.
 */
export function questionPosition(facts: CreationFacts, qid: QuestionId): number {
  const planned = plannedQuestions(facts);
  const idx = planned.indexOf(qid);
  return idx === -1 ? 0 : idx + 1;
}

/**
 * Total number of planned questions (excluding 'created' success state).
 */
export function totalQuestions(facts: CreationFacts): number {
  return plannedQuestions(facts).length;
}

// ─── Per-question answered checks ───────────────────────────────

export function isQuestionAnswered(qid: QuestionId, facts: CreationFacts): boolean {
  switch (qid) {
    case 'understood':
      // The understood screen is a confirmation — it's "answered" once
      // the trader has moved past it. Since we can't track that without
      // state, we consider it answered if topology confidence is not low
      // and payer role is known (the conditions under which it wouldn't
      // appear in the first place).
      return facts.topology.confidence !== 'low' && facts.payerIsCreator.value !== null;

    case 'payer':
      return facts.payerIsCreator.value !== null;

    case 'counterparty':
      // Counterparty can be skipped — it's "answered" once the trader
      // has seen the screen and moved on. We track this via whether the
      // fact origin has been upgraded from 'understood' to 'confirmed'.
      return facts.counterpartyKs.origin === 'confirmed';

    case 'stages':
      // Stages are optional — "answered" once the trader has seen the
      // screen and moved on.
      return facts.stages.origin === 'confirmed';

    case 'confirmer':
      return facts.confirmer.value !== null;

    case 'contributors':
      return facts.contributors.origin === 'confirmed';

    case 'split':
      return facts.contributionMode.value !== null;

    case 'recipient':
      return facts.recipientKs.origin === 'confirmed';

    case 'frequency':
      return facts.frequency.value !== null && facts.frequency.origin === 'confirmed';

    case 'recipients':
      return facts.recipients.origin === 'confirmed';

    case 'allocation':
      return facts.allocationMode.value !== null;

    case 'obligations':
      return facts.recipients.origin === 'confirmed' && facts.recipients.value.every((r) => r.obligation.trim().length > 0);

    case 'join_mode':
      return facts.contributionJoinMode.value !== null;

    case 'governance':
      return facts.governanceMode.value !== null;

    case 'review':
      // Review is never "answered" in the same way — it's the final step.
      return false;

    case 'unsupported':
      return false;

    case 'created':
      return facts.createdAgreementId.value !== null;

    default:
      return false;
  }
}

// ─── Question metadata for UI rendering ─────────────────────────

export interface QuestionMeta {
  id: QuestionId;
  title: string;
  /** Short label for the progress bar / stepper. */
  shortLabel: string;
  /** Whether the trader can skip this question. */
  skippable: boolean;
  /** Whether this question's answer is a proposed preference (not authoritative). */
  proposedOnly: boolean;
}

export function questionMeta(qid: QuestionId, facts: CreationFacts): QuestionMeta {
  const intent = facts.intent;
  const topology = facts.topology.topology;

  switch (qid) {
    case 'understood':
      return {
        id: 'understood',
        title: 'Is this right?',
        shortLabel: 'Confirm',
        skippable: false,
        proposedOnly: false,
      };

    case 'payer':
      return {
        id: 'payer',
        title: 'Are you the one paying?',
        shortLabel: 'Payer',
        skippable: false,
        proposedOnly: false,
      };

    case 'counterparty': {
      const label = counterpartyQuestionLabel(topology, intent);
      return {
        id: 'counterparty',
        title: `Who is the ${label}?`,
        shortLabel: 'Who',
        skippable: true,
        proposedOnly: false,
      };
    }

    case 'stages':
      return {
        id: 'stages',
        title: 'Any milestones or stages?',
        shortLabel: 'Stages',
        skippable: true,
        proposedOnly: false,
      };

    case 'confirmer':
      return {
        id: 'confirmer',
        title: 'Who confirms the work?',
        shortLabel: 'Confirmer',
        skippable: false,
        proposedOnly: true,
      };

    case 'contributors': {
      const who = intent.who.toLowerCase();
      let groupWord = 'contributors';
      if (who.includes('sibling')) groupWord = 'family members';
      else if (who.includes('parent')) groupWord = 'parents';
      else if (who.includes('neighbour') || who.includes('neighbor')) groupWord = 'neighbours';
      else if (who.includes('shop')) groupWord = 'shops';
      else if (who.includes('member')) groupWord = 'members';
      return {
        id: 'contributors',
        title: `Who are the ${groupWord}?`,
        shortLabel: 'Who',
        skippable: true,
        proposedOnly: false,
      };
    }

    case 'split': {
      const amount = facts.targetAmount.value || intent.amount;
      return {
        id: 'split',
        title: `How should ${amount} be shared?`,
        shortLabel: 'Split',
        skippable: false,
        proposedOnly: false,
      };
    }

    case 'recipient': {
      const who = intent.who.toLowerCase();
      let recipientWord = 'the recipient';
      if (who.includes('mum')) recipientWord = 'Mum';
      else if (who.includes('guardian')) recipientWord = 'the guardian';
      else if (who.includes('organizer')) recipientWord = 'the organizer';
      return {
        id: 'recipient',
        title: `Who is ${recipientWord}?`,
        shortLabel: 'Recipient',
        skippable: true,
        proposedOnly: false,
      };
    }

    case 'frequency':
      return {
        id: 'frequency',
        title: 'How often?',
        shortLabel: 'How often',
        skippable: false,
        proposedOnly: false,
      };

    case 'recipients': {
      return {
        id: 'recipients',
        title: 'Who are they?',
        shortLabel: 'Who',
        skippable: true,
        proposedOnly: false,
      };
    }

    case 'allocation': {
      const amount = intent.amount;
      return {
        id: 'allocation',
        title: `How should ${amount} be shared?`,
        shortLabel: 'Share',
        skippable: false,
        proposedOnly: false,
      };
    }

    case 'obligations':
      return {
        id: 'obligations',
        title: 'What does each person need to complete?',
        shortLabel: 'Tasks',
        skippable: true,
        proposedOnly: true,
      };

    case 'join_mode': {
      const who = intent.who.toLowerCase();
      let groupWord = 'contributors';
      if (who.includes('parent')) groupWord = 'parents';
      else if (who.includes('family')) groupWord = 'families';
      else if (who.includes('shop')) groupWord = 'shops';
      else if (who.includes('sibling')) groupWord = 'family members';
      else if (who.includes('neighbour') || who.includes('neighbor')) groupWord = 'neighbours';
      else if (who.includes('member')) groupWord = 'members';
      return {
        id: 'join_mode',
        title: `How will the ${groupWord} join?`,
        shortLabel: 'Join',
        skippable: false,
        proposedOnly: false,
      };
    }

    case 'governance':
      return {
        id: 'governance',
        title: 'Who approves the payouts?',
        shortLabel: 'Approval',
        skippable: true,
        proposedOnly: true,
      };

    case 'review':
      return {
        id: 'review',
        title: 'Your agreement is ready',
        shortLabel: 'Review',
        skippable: false,
        proposedOnly: false,
      };

    case 'unsupported':
      return {
        id: 'unsupported',
        title: 'This agreement type is coming soon',
        shortLabel: 'Soon',
        skippable: false,
        proposedOnly: false,
      };

    case 'created':
      return {
        id: 'created',
        title: 'Agreement created',
        shortLabel: 'Done',
        skippable: false,
        proposedOnly: false,
      };

    default:
      return {
        id: 'review',
        title: 'Review',
        shortLabel: 'Review',
        skippable: false,
        proposedOnly: false,
      };
  }
}

function counterpartyQuestionLabel(
  topology: CreationFacts['topology']['topology'],
  intent: CreationIntent,
): string {
  const who = intent.who.toLowerCase();
  if (topology === 'MANY_TO_ONE' || topology === 'MANY_TO_MANY') {
    if (who.includes('mum')) return 'recipient';
    if (who.includes('guardian')) return 'guardian';
    if (who.includes('organizer')) return 'organizer';
    return 'recipient';
  }
  if (who.includes('painter')) return 'painter';
  if (who.includes('seller')) return 'seller';
  if (who.includes('buyer')) return 'buyer';
  if (who.includes('worker')) return 'worker';
  if (who.includes('client')) return 'client';
  if (who.includes('supplier')) return 'supplier';
  return 'other person';
}
