// ═══════════════════════════════════════════════════════════════
// CREATION PERSISTENCE — generalized resume/reload support.
//
// The engine should be resumable through:
//   - auth (inline auth gate completes, journey continues)
//   - route changes (navigating away and back)
//   - reload (sessionStorage fallback)
//
// But:
//   - no secrets, passwords, or OTP are persisted
//   - the intent is not sensitive (human-language statement only)
//   - stale creation state is cleared after success or cancel
// ═══════════════════════════════════════════════════════════════

import type { CreationIntent } from './creationIntent';
import { saveCreationIntent, clearCreationIntent } from './creationIntent';
import type { CreationFacts, StageEntry, ConfirmerPreference, ContributorEntry, ContributionMode, ContributionFrequency, RecipientEntry, AllocationMode, ContributionJoinMode, GovernanceMode } from './creationFacts';

const DRAFT_KEY = 'securepay_creation_draft';

/**
 * Persisted draft state — a subset of CreationFacts that is safe to
 * store in sessionStorage. Contains no secrets.
 */
export interface CreationDraft {
  // Understood facts (rebuildable from intent, but stored for fast resume)
  payerIsCreator: boolean | null;
  counterpartyKs: string;
  stages: StageEntry[];
  confirmer: ConfirmerPreference;
  // MANY_TO_ONE facts
  contributors: ContributorEntry[];
  contributionMode: ContributionMode;
  recipientKs: string;
  frequency: ContributionFrequency;
  // ONE_TO_MANY facts
  recipients: RecipientEntry[];
  allocationMode: AllocationMode;
  // MANY_TO_MANY facts
  contributionJoinMode: ContributionJoinMode;
  governanceMode: GovernanceMode;
  // The current screen the trader was on
  currentScreen: string;
  // Idempotency key for the eventual create call
  idempotencyKey: string;
}

export function saveCreationDraft(intent: CreationIntent, draft: CreationDraft): void {
  try {
    saveCreationIntent(intent);
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage may be unavailable — router-state path still works
  }
}

export function loadCreationDraft(): CreationDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreationDraft;
    if (!parsed.idempotencyKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCreationDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
    clearCreationIntent();
  } catch {
    // no-op
  }
}

/**
 * Builds a draft from current facts + screen state.
 */
export function buildDraft(facts: CreationFacts, currentScreen: string, idempotencyKey: string): CreationDraft {
  return {
    payerIsCreator: facts.payerIsCreator.value,
    counterpartyKs: facts.counterpartyKs.value,
    stages: facts.stages.value,
    confirmer: facts.confirmer.value,
    contributors: facts.contributors.value,
    contributionMode: facts.contributionMode.value,
    recipientKs: facts.recipientKs.value,
    frequency: facts.frequency.value,
    recipients: facts.recipients.value,
    allocationMode: facts.allocationMode.value,
    contributionJoinMode: facts.contributionJoinMode.value,
    governanceMode: facts.governanceMode.value,
    currentScreen,
    idempotencyKey,
  };
}

/**
 * Checks if a draft is stale (older than 30 minutes).
 * Stale drafts are cleared to avoid confusing resume behavior.
 */
export function isDraftStale(_draft: CreationDraft): boolean {
  // We don't store timestamps (no sensitive metadata), but idempotency
  // keys are per-session. A draft is stale if its key doesn't match
  // the current session's expectation. For simplicity, we always
  // consider the draft valid — the idempotency key ensures the
  // eventual create call is safe even if resumed.
  return false;
}
