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
 * Turns the trader's free-text Market request into the same portable intent
 * contract used by Home. This is deliberately conservative: it proposes a
 * human-readable structure only. It never assigns authoritative participants,
 * payer identity, release authority, Payment Ready, or any money state.
 *
 * This helper exists so every Market entry point (Home, Ask SecurePay, header
 * CTA, keyboard Enter) can hand the same intent into CreateJourney rather than
 * navigating to `/create` with an orphan `?q=` that CreateJourney cannot use.
 */
export function createCreationIntentFromText(rawStatement: string): CreationIntent {
  const statement = rawStatement.trim();
  const lower = statement.toLowerCase();

  const amountMatch = statement.match(/\bKES\s*([\d,]+(?:\.\d+)?)\b/i)
    ?? statement.match(/\b(?:budget(?:\s+(?:of|is))?|price(?:d)?(?:\s+at)?|cost(?:ing)?|pay(?:ing)?|for)\s+(?:KES\s*)?([\d,]{4,}(?:\.\d+)?)\b/i);
  const numericAmount = amountMatch?.[1] ? Number(amountMatch[1].replace(/,/g, '')) : null;
  const amount = numericAmount && Number.isFinite(numericAmount) && numericAmount > 0
    ? `KES ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 2 }).format(numericAmount)}`
    : 'To be confirmed';

  // "life" is about the human context, not the money topology. A wedding vendor
  // can still be a one-to-one trade while the journey remains appropriately warm;
  // funeral, medical and family arrangements should not sound like generic commerce.
  const family: IntentFamily = /family|mum|mom|mother|school|fees|support|help|welfare|church|neighbour|neighbor|funeral|burial|bereavement|memorial|wedding|ruracio|marriage|hospital|medical|medicine|treatment|emergency/.test(lower)
    ? 'life'
    : 'trade';

  const subjectPatterns: Array<[RegExp, string]> = [
    [/land|plot|property/, 'Land purchase'],
    [/fridge|refrigerator/, 'Fridge purchase'],
    [/sofa|couch|seat set/, 'Sofa purchase'],
    [/generator/, 'Generator purchase'],
    [/cement/, 'Cement supply'],
    [/motorbike|motorcycle|boda/, 'Motorcycle'],
    [/bike|bicycle/, 'Bicycle'],
    [/phone|iphone|samsung/, 'Phone'],
    [/laptop|computer/, 'Computer'],
    [/furniture/, 'Furniture'],
    [/car|vehicle/, 'Vehicle'],
    [/funeral|burial|memorial|bereavement/, 'Funeral support'],
    [/wedding|ruracio|marriage/, 'Wedding arrangement'],
    [/hospital|medical|medicine|treatment/, 'Medical support'],
    [/paint|painting|painter/, 'Painting work'],
    [/plumb|plumber/, 'Plumbing work'],
    [/build|builder|construction|contractor/, 'Building work'],
    [/school|fees|tuition/, 'School support'],
    [/rent|medicine|caregiver|mum|mom|mother|parent/, 'Family support'],
    [/church/, 'Church contribution'],
    [/estate/, 'Estate contribution'],
    [/welfare/, 'Welfare contribution'],
  ];
  const subject = subjectPatterns.find(([pattern]) => pattern.test(lower))?.[1];

  if (/collect|contribution|contributors|contribute|fundrais|harambee|welfare|church contribution|estate contribution/.test(lower)) {
    return {
      id: 'custom',
      family,
      statement,
      who: 'Contributors to be confirmed → Recipient or purpose to be confirmed',
      what: subject ?? 'Group contribution',
      amount,
      mustHappen: 'The purpose, contributors and recipient are agreed before the contribution arrangement is used.',
      nextStep: 'Confirm who is contributing, who receives and how the contribution should work.',
      nextStepShort: 'Confirm contributors & recipient',
      moneyMoves: 'Only according to the contribution arrangement the participants agree.',
    };
  }

  if (/sell|selling/.test(lower)) {
    return {
      id: 'custom',
      family,
      statement,
      who: 'You (Seller) → Buyer to be confirmed',
      what: subject ? `${subject.replace(/ purchase$| work$/, '')} sale` : 'Sale agreement',
      amount,
      mustHappen: 'The buyer receives what was agreed and the handover is confirmed.',
      nextStep: 'Confirm the buyer, item, price and handover conditions.',
      nextStepShort: 'Confirm buyer & handover',
      moneyMoves: 'Only according to the handover conditions the parties agree.',
    };
  }

  if (/hire|hiring|contractor|fundi|painter|plumber|electrician|developer|repair|fix/.test(lower)) {
    return {
      id: 'custom',
      family,
      statement,
      who: 'You (Payer) → Service provider to be confirmed',
      what: subject ?? 'Service agreement',
      amount,
      mustHappen: 'The agreed work is completed and the required proof or confirmation is provided.',
      nextStep: 'Confirm the provider, scope, timing and what will show the work is complete.',
      nextStepShort: 'Confirm provider & scope',
      moneyMoves: 'Only according to the work conditions the parties agree.',
    };
  }

  if (/support|help|family|mum|mom|mother|school|fees|rent|medicine|caregiver|hospital|medical|treatment|emergency/.test(lower)) {
    return {
      id: 'custom',
      family: 'life',
      statement,
      who: /we\b|our\b|siblings|parents|family|contributors/.test(lower)
        ? 'Contributors to be confirmed → Recipient to be confirmed'
        : 'You → Recipient to be confirmed',
      what: subject ?? 'Support arrangement',
      amount,
      mustHappen: 'The purpose, people involved and each responsibility are made clear.',
      nextStep: 'Confirm who is involved, the purpose and how the support should be organised.',
      nextStepShort: 'Confirm people & purpose',
      moneyMoves: 'Only according to the support arrangement the participants agree.',
    };
  }

  if (/buy|buying|purchase|purchasing|order|ordering|pay after delivery|paying after delivery/.test(lower)) {
    return {
      id: 'custom',
      family,
      statement,
      who: 'You (Buyer/Payer) → Seller to be confirmed',
      what: subject ?? 'Purchase agreement',
      amount,
      mustHappen: 'The agreed item is provided and the handover or delivery is confirmed.',
      nextStep: 'Confirm the seller, item details and the conditions that must happen.',
      nextStepShort: 'Confirm seller & item',
      moneyMoves: 'Only according to the receipt or handover conditions the parties agree.',
    };
  }

  return {
    id: 'custom',
    family,
    statement,
    who: 'You → Counterparty to be confirmed',
    what: subject ?? 'Agreement to be clarified',
    amount,
    mustHappen: 'SecurePay will ask what must happen before money should move.',
    nextStep: 'Answer a few questions so the agreement can be structured clearly.',
    nextStepShort: 'Clarify the agreement',
    moneyMoves: 'Only according to the conditions the parties agree.',
  };
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
