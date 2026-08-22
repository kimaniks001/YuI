// ═══════════════════════════════════════════════════════════════
// AGREEMENT TOPOLOGY — the four money-flow shapes
//
// Topology is system structure. Intent is human meaning.
// The trader never needs to know these names during early creation.
//
// ONE_TO_ONE   → SecureLink        (one payer, one recipient)
// MANY_TO_ONE  → Group SecureLink  (many payers, one recipient)
// ONE_TO_MANY  → SecureFlow        (one payer, many recipients)
// MANY_TO_MANY → Group SecureFlow  (many payers, many recipients)
// ═══════════════════════════════════════════════════════════════

import type { CreationIntent } from './creationIntent';

export type AgreementTopology =
  | 'ONE_TO_ONE'
  | 'MANY_TO_ONE'
  | 'ONE_TO_MANY'
  | 'MANY_TO_MANY';

export const TOPOLOGY_LABELS: Record<AgreementTopology, string> = {
  ONE_TO_ONE: 'SecureLink',
  MANY_TO_ONE: 'Group SecureLink',
  ONE_TO_MANY: 'SecureFlow',
  MANY_TO_MANY: 'Group SecureFlow',
};

export const TOPOLOGY_PARTICIPANT_LABELS: Record<AgreementTopology, {
  payerSide: string;
  recipientSide: string;
}> = {
  ONE_TO_ONE: { payerSide: 'one payer', recipientSide: 'one recipient' },
  MANY_TO_ONE: { payerSide: 'several payers', recipientSide: 'one recipient' },
  ONE_TO_MANY: { payerSide: 'one payer', recipientSide: 'several recipients' },
  MANY_TO_MANY: { payerSide: 'several payers', recipientSide: 'several recipients' },
};

export type TopologyConfidence = 'high' | 'medium' | 'low';

export interface TopologyProposal {
  topology: AgreementTopology;
  confidence: TopologyConfidence;
  /** Human-readable reason explaining the inference — never opaque. */
  reason: string;
  /** Dimensions that remain ambiguous and may need clarification. */
  missingDimensions: TopologyDimension[];
}

export type TopologyDimension = 'payerCount' | 'recipientCount' | 'payerRole';

// ─── Internal parsing helpers ───────────────────────────────────

const MANY_PAYER_PATTERNS =
  /several|siblings|parents|neighbours|neighbors|contributors|members|family|group|^we\b|our\b|\d+\s*(people|parents|siblings|family|members|neighbours)/;
const MANY_RECIPIENT_PATTERNS =
  /several|recipients|suppliers|collaborators|workers|vendors|multiple|two|three|four|five|\d+\s*(suppliers|workers|collaborators|vendors|recipients|providers|trades|contractors)/;

// Role names that indicate distinct recipient parties when found in a comma list.
const RECIPIENT_ROLE_PATTERN =
  /contractor|plumber|electrician|designer|developer|worker|supplier|provider|painter|carpenter|mason|guardian|caregiver|rent|medicine|transport|books|fees/;

// Detects comma-separated lists (3+ items, or 2+ with "and") as multiple recipients.
const COMMA_LIST_PATTERN = /[,/]\s|\band\b/;

function countFromWho(who: string): { payerIsMany: boolean; recipientIsMany: boolean } {
  const lower = who.toLowerCase();
  const [payerPart = '', recipientPart = ''] = lower.split('→');
  return {
    payerIsMany: MANY_PAYER_PATTERNS.test(payerPart) || hasCommaList(payerPart),
    recipientIsMany: MANY_RECIPIENT_PATTERNS.test(recipientPart) || hasCommaList(recipientPart),
  };
}

// A comma-separated list with at least 2 items (comma + "and", or 2+ commas)
// indicates multiple parties on that side of the arrow.
function hasCommaList(text: string): boolean {
  if (!COMMA_LIST_PATTERN.test(text)) return false;
  const parts = text.split(/[,/]|\band\b/).filter((s) => s.trim().length > 0);
  return parts.length >= 2;
}

function extractExplicitCount(text: string): number | null {
  const match = text.match(/(\d+)\s+(?:people|parents|siblings|members|neighbours|neighbors|contributors|suppliers|workers|collaborators|vendors|recipients)/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Main inference function ────────────────────────────────────

export function inferTopology(intent: CreationIntent): TopologyProposal {
  const who = intent.who;
  const stmt = intent.statement.toLowerCase();
  const { payerIsMany, recipientIsMany } = countFromWho(who);

  // Determine confidence
  const hasArrow = who.includes('→');
  let confidence: TopologyConfidence = 'low';
  const missingDimensions: TopologyDimension[] = [];

  if (hasArrow) {
    const [payerPart = '', recipientPart = ''] = who.toLowerCase().split('→');
    const payerClear = /you\b|i\b|me\b|payer|buyer|seller|worker|supplier|creator|contributor|several|siblings|parents|neighbours|neighbors|members|family|we\b|\d+\b/.test(payerPart);
    const recipientClear = /painter|seller|buyer|worker|client|supplier|fund|mum|guardian|organizer|family|recipient|several|suppliers|collaborators|workers|vendors|multiple|\d+\b/.test(recipientPart)
      || RECIPIENT_ROLE_PATTERN.test(recipientPart)
      || hasCommaList(recipientPart);
    if (payerClear && recipientClear) confidence = 'high';
    else if (payerClear || recipientClear) confidence = 'medium';
  } else {
    // Fall back to statement analysis
    if (/i (need|am|want|'m|paying|hiring|buying|selling|delivering|building)/.test(stmt)) confidence = 'medium';
  }

  // Determine topology from parsed counts
  let topology: AgreementTopology;
  if (payerIsMany && recipientIsMany) topology = 'MANY_TO_MANY';
  else if (payerIsMany && !recipientIsMany) topology = 'MANY_TO_ONE';
  else if (!payerIsMany && recipientIsMany) topology = 'ONE_TO_MANY';
  else topology = 'ONE_TO_ONE';

  // Build reason string
  const payerDesc = payerIsMany ? 'multiple payers' : 'a single payer';
  const recipientDesc = recipientIsMany ? 'multiple recipients' : 'a single recipient';
  const reason = `"${who}" suggests ${payerDesc} and ${recipientDesc}.`;

  // Track missing dimensions
  if (confidence === 'low' || !hasArrow) {
    if (!hasArrow) {
      missingDimensions.push('payerCount', 'recipientCount');
    }
  }
  // If we can't determine payer role from the statement, that's a separate dimension
  if (/^we\b|our\b/.test(stmt) && !/i\b/.test(stmt)) {
    // The statement starts with "we" — the creator's own payer role is ambiguous
    if (!missingDimensions.includes('payerRole')) missingDimensions.push('payerRole');
  }

  return { topology, confidence, reason, missingDimensions };
}

// ─── Backend support boundary ───────────────────────────────────

/**
 * Only ONE_TO_ONE (SecureLink) has a backend-backed creation path today.
 * The other three topologies reach a safe boundary in the engine and
 * inform the trader that full implementation arrives in later slices.
 */
export function isBackendSupported(topology: AgreementTopology): boolean {
  return topology === 'ONE_TO_ONE' || topology === 'MANY_TO_ONE' || topology === 'ONE_TO_MANY' || topology === 'MANY_TO_MANY';
}

/**
 * Extracts an approximate participant count from the intent, useful for
 * UI display and to inform group-size questions.
 */
export function extractParticipantCounts(intent: CreationIntent): {
  payerCount: number | null;
  recipientCount: number | null;
} {
  const who = intent.who;
  const [payerPart = '', recipientPart = ''] = who.split('→');
  const payerCount = extractExplicitCount(payerPart);
  let recipientCount = extractExplicitCount(recipientPart);

  // If no explicit count, try counting comma-list items in the recipient side.
  // e.g. "Contractor, Plumber and Electrician" → 3
  if (recipientCount === null && hasCommaList(recipientPart)) {
    const parts = recipientPart.split(/[,/]|\band\b/).filter((s) => s.trim().length > 0);
    recipientCount = parts.length;
  }

  // Also check the statement for explicit counts like "five casual workers"
  if (recipientCount === null) {
    const stmtLower = intent.statement.toLowerCase();
    const wordMatch = stmtLower.match(/(two|three|four|five|six|seven|eight|nine|ten)\s+(?:workers|recipients|suppliers|trades|providers|casual)/);
    if (wordMatch) {
      const wordNums: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
      recipientCount = wordNums[wordMatch[1]] ?? null;
    }
  }

  return { payerCount, recipientCount };
}

/**
 * Extracts recipient role labels from the intent's `who` field.
 * e.g. "You (Payer) → Contractor, Plumber and Electrician" →
 *   ["Contractor", "Plumber", "Electrician"]
 */
export function extractRecipientLabels(intent: CreationIntent): string[] {
  const who = intent.who;
  const recipientPart = who.split('→')[1] ?? '';
  if (!recipientPart.trim()) return [];
  const cleaned = recipientPart.replace(/\(.*?\)/g, '').trim();
  const parts = cleaned.split(/[,/]|\band\b/).map((s) => s.trim()).filter((s) => s.length > 0);
  return parts;
}
