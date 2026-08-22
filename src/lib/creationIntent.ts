// ═══════════════════════════════════════════════════════════════
// CREATION INTENT — shared contract between Home and Create Journey
//
// HomePreview builds a rich Intent object describing what the user
// wants to accomplish. This module defines the portable shape and
// a sessionStorage persistence layer so the intent survives:
//   1. Router navigation (via location.state — primary path)
//   2. Page reload / auth re-entry (via sessionStorage — fallback)
//
// The intent is NOT sensitive — it contains no tokens, passwords,
// KS numbers, or personal data beyond a human-language statement.
// It is a description of what the user wants, nothing more.
//
// Authority boundaries:
//   - The intent may SUGGEST a likely topology and payer role, but
//     it never asserts participant authority, payer identity, or
//     release authority. Those are backend-authoritative.
//   - "I am paying" in the statement deterministically sets
//     creatorIsLikelyPayer=true, but this is a hypothesis the user
//     may still confirm or correct — not a backend assignment.
// ═══════════════════════════════════════════════════════════════

export type IntentFamily = 'trade' | 'life';

export type InferredStructure = 'securelink' | 'group-securelink' | 'secureflow' | 'group-secureflow' | 'unknown';

/**
 * Confidence level for the inferred topology. Determined by
 * deterministic rules from the intent fields, not probabilistic.
 *
 * - HIGH: the `who` field clearly states both sides (e.g. "You (Payer) → Painter")
 * - MEDIUM: only one side is clear
 * - LOW: topology is ambiguous or the `who` field is generic
 */
export type TopologyConfidence = 'high' | 'medium' | 'low';

export interface CreationIntent {
  id: string;
  family: IntentFamily;
  statement: string;
  who: string;
  what: string;
  amount: string;
  mustHappen: string;
  nextStep: string;
  nextStepShort: string;
  moneyMoves: string;
}

const STORAGE_KEY = 'securepay_creation_intent';

export function saveCreationIntent(intent: CreationIntent): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // sessionStorage may be unavailable (private mode, disabled) —
    // the router-state path still works without it.
  }
}

export function loadCreationIntent(): CreationIntent | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreationIntent;
    if (!parsed.id || !parsed.statement) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCreationIntent(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

/**
 * Infers the SecurePay agreement structure from the intent's `who`
 * field. The `who` string uses arrows like "You (Payer) → Painter"
 * or "4 siblings → Mum". This is a heuristic — the frontend proposes,
 * the backend confirms.
 */
export function inferStructure(intent: CreationIntent): InferredStructure {
  const who = intent.who.toLowerCase();

  const payerPart = who.split('→')[0] ?? '';
  const recipientPart = who.split('→')[1] ?? '';

  const payerIsMany = /several|siblings|parents|neighbours|neighbors|contributors|members|family|group|we\b|our\b/.test(payerPart);
  const recipientIsMany = /several|recipients|suppliers|collaborators|workers|vendors|multiple/.test(recipientPart);

  if (payerIsMany && recipientIsMany) return 'group-secureflow';
  if (payerIsMany && !recipientIsMany) return 'group-securelink';
  if (!payerIsMany && recipientIsMany) return 'secureflow';
  if (!payerIsMany && !recipientIsMany) return 'securelink';
  return 'unknown';
}

/**
 * Determines the confidence level of the topology inference.
 * Uses deterministic rules — no probabilistic claims.
 */
export function topologyConfidence(intent: CreationIntent): TopologyConfidence {
  const who = intent.who.toLowerCase();

  // If `who` contains an arrow, both sides are named
  if (who.includes('→')) {
    const payerPart = who.split('→')[0] ?? '';
    const recipientPart = who.split('→')[1] ?? '';
    const payerClear = /you\b|i\b|me\b|payer|buyer|seller|worker|supplier|creator|contributor/.test(payerPart);
    const recipientClear = /painter|seller|buyer|worker|client|supplier|fund|mum|guardian|organizer|family|recipient/.test(recipientPart);
    if (payerClear && recipientClear) return 'high';
    if (payerClear || recipientClear) return 'medium';
  }

  // Fall back to statement analysis
  const stmt = intent.statement.toLowerCase();
  if (/i (need|am|want|'m|paying|hiring|buying|selling|delivering|building)/.test(stmt)) return 'medium';

  return 'low';
}

/**
 * Determines whether the signed-in creator is likely the payer,
 * based on deterministic parsing of the statement.
 *
 * "I need a painter" → creator is paying (payer)
 * "I completed a website" → creator is receiving (not payer)
 * "I'm selling" → creator is receiving (not payer)
 *
 * Returns:
 *   - true: creator likely IS the payer
 *   - false: creator likely is NOT the payer
 *   - null: ambiguous — the UI should ask
 */
export function creatorIsLikelyPayer(intent: CreationIntent): boolean | null {
  const stmt = intent.statement.toLowerCase();
  const who = intent.who.toLowerCase();

  // Explicit "I am paying" / "I need" / "I'm buying" → payer
  if (/i (need|'m paying|am paying|paying|'m buying|am buying|buying|hiring|'m hiring)/.test(stmt)) return true;

  // Explicit "I completed" / "I'm selling" / "I delivered" → not payer
  if (/i (completed|'m selling|am selling|selling|delivered|'m delivering|am delivering)/.test(stmt)) return false;

  // Check the `who` field — if it says "You (Payer)" that's a strong signal
  if (/you \(payer\)|you.*payer/.test(who)) return true;
  if (/you \(seller\)|you \(worker\)|you \(supplier\)/.test(who)) return false;

  // Ambiguous
  return null;
}

/**
 * For the 1→1 SecureLink path, determines whether the topology is
 * strongly implied (so we can skip the confirmation screen and go
 * straight to the first missing question) or ambiguous (so we must
 * show a confirmation/clarification screen first).
 *
 * Deterministic rules only.
 */
export function needsClarification(intent: CreationIntent): boolean {
  const confidence = topologyConfidence(intent);
  if (confidence === 'low') return true;

  // If we can't determine creator payer role, we need to ask
  if (creatorIsLikelyPayer(intent) === null) return true;

  // If structure is unknown, we need to clarify
  if (inferStructure(intent) === 'unknown') return true;

  return false;
}

/**
 * Extracts the number of stages from the intent, if mentioned.
 * "2 stages" → 2
 * Returns null if no stage count is found.
 */
export function extractStageCount(intent: CreationIntent): number | null {
  const match = intent.amount.match(/(\d+)\s*stage/) || intent.mustHappen.match(/(\d+)\s*stage/);
  if (match) return parseInt(match[1], 10);
  return null;
}
