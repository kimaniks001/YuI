import type { CreationIntent } from './creationIntent';
import { inferTopology, type AgreementTopology } from './agreementTopology';

export type AgreementCheckKind = 'PERFORMANCE' | 'EVIDENCE' | 'ACCEPTANCE' | 'CUSTOM';

export interface AgreementCheck {
  id: string;
  kind: AgreementCheckKind;
  title: string;
  condition: string;
  evidence: string;
  confirmer: string;
}

export interface AgreementStage {
  id: string;
  label: string;
  amountText: string;
  dueDate: string;
  completionEvidence: string;
}

export interface AgreementBlueprint {
  topology: AgreementTopology;
  topologyReason: string;
  payerCount: number;
  recipientCount: number;
  parties: string;
  amountText: string;
  amountMinor: number | null;
  currency: 'KES';
  startDate: string;
  targetDate: string;
  stages: AgreementStage[];
  stagesExplicitlyUnderstood: boolean;
  checks: AgreementCheck[];
  additionalDetails: string;
}

export interface AgreementQualityResult {
  blocking: string[];
  warnings: string[];
  ready: boolean;
  completedCoreAreas: number;
  totalCoreAreas: number;
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const STAGE_CANONICAL: Array<[RegExp, string]> = [
  [/\bfoundation\b/i, 'Foundation'],
  [/\bwalling\b|\bwalls?\b/i, 'Walling'],
  [/\broofing\b|\broof\b/i, 'Roofing'],
  [/\bplaster(?:ing)?\b/i, 'Plastering'],
  [/\belectrical(?:s)?\b|\bwiring\b/i, 'Electrical'],
  [/\bplumbing\b/i, 'Plumbing'],
  [/\bpainting\b/i, 'Painting'],
  [/\bfinishing\b|\bfinishes\b/i, 'Finishing'],
  [/\btesting\b/i, 'Testing'],
  [/\bdeployment\b/i, 'Deployment'],
  [/\bhandover\b/i, 'Handover'],
];

function allIntentText(intent: CreationIntent): string {
  return [intent.statement, intent.who, intent.what, intent.amount, intent.mustHappen, intent.nextStep]
    .filter(Boolean)
    .join(' ');
}

function normaliseMoneyText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/kshs?/gi, 'KES')
    .replace(/ksh/gi, 'KES')
    .trim();
}

/**
 * Parses ordinary Kenyan money language conservatively. The parsed amount is
 * only a proposed agreement fact; the backend remains authoritative for all
 * financial state and money movement.
 */
export function parseKenyanAmountMinor(raw: string): number | null {
  if (!raw) return null;
  const text = raw.trim().toLowerCase().replace(/,/g, '');

  const million = text.match(/(?:kes|kshs?|shillings?|bob)?\s*(\d+(?:\.\d+)?)\s*(?:m|million)\b/)
    ?? text.match(/\b(\d+(?:\.\d+)?)\s*(?:m|million)\s*(?:kes|kshs?|shillings?|bob)?\b/);
  if (million) {
    const value = Number(million[1]) * 1_000_000;
    return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
  }

  const thousand = text.match(/(?:kes|kshs?|shillings?|bob)?\s*(\d+(?:\.\d+)?)\s*k\b/)
    ?? text.match(/\b(\d+(?:\.\d+)?)\s*k\s*(?:kes|kshs?|shillings?|bob)?\b/);
  if (thousand) {
    const value = Number(thousand[1]) * 1_000;
    return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
  }

  const explicit = text.match(/(?:kes|kshs?|shillings?|bob)\s*(\d+(?:\.\d+)?)/)
    ?? text.match(/\b(\d+(?:\.\d+)?)\s*(?:kes|kshs?|shillings?|bob)\b/)
    ?? text.match(/\b(\d{3,}(?:\.\d+)?)\s*\/?-?\b/);

  if (!explicit) return null;
  const value = Number(explicit[1]);
  return Number.isFinite(value) && value > 0 && Number.isSafeInteger(Math.round(value * 100))
    ? Math.round(value * 100)
    : null;
}

export function formatAmountFromMinor(amountMinor: number | null): string {
  if (!amountMinor) return '';
  return `KES ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 2 }).format(amountMinor / 100)}`;
}

function extractStageCount(text: string): number | null {
  const match = text.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:stages?|phases?|milestones?)\b/i);
  if (!match) return null;
  const numeric = Number(match[1]);
  if (Number.isFinite(numeric)) return numeric;
  return NUMBER_WORDS[match[1].toLowerCase()] ?? null;
}

function cleanStageCandidate(raw: string): string {
  return raw
    .replace(/^\s*(?:then|namely|being|are|as|include|including|:|-)+\s*/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[.;:]+$/g, '')
    .trim();
}

function titleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : part)
    .join(' ');
}

/**
 * Extracts explicit stage names from the trader's own words. If the trader has
 * already said "foundation, walling, roofing and finishing", the journey must
 * remember that structure instead of asking whether stages would help.
 */
export function extractExplicitStages(intent: CreationIntent): { labels: string[]; explicit: boolean } {
  const text = allIntentText(intent);
  const count = extractStageCount(text);
  const labels: string[] = [];

  for (const [pattern, label] of STAGE_CANONICAL) {
    if (pattern.test(text) && !labels.includes(label)) labels.push(label);
  }

  const listMatch = text.match(/\b(?:stages?|phases?|milestones?)\b\s*(?:are|being|include|including|namely|:|-|then)?\s*([^.!?]{3,180})/i);
  if (listMatch) {
    const rawList = cleanStageCandidate(listMatch[1]);
    const parts = rawList
      .split(/,|\band\b|\bthen\b|\/|→/i)
      .map(cleanStageCandidate)
      .filter((part) => part.length >= 2 && part.length <= 60)
      .filter((part) => !/\b(?:payment|money|amount|kes|ksh|confirm|agreement)\b/i.test(part));

    if (parts.length >= 2) {
      for (const part of parts) {
        const canonical = STAGE_CANONICAL.find(([pattern]) => pattern.test(part))?.[1] ?? titleCase(part);
        if (!labels.includes(canonical)) labels.push(canonical);
      }
    }
  }

  const explicitSignal = labels.length >= 2 || count !== null || /\b(stage|stages|phase|phases|milestone|milestones|progress payment)\b/i.test(text);

  if (count && count > labels.length) {
    for (let i = labels.length; i < count; i += 1) labels.push(`Stage ${i + 1}`);
  }

  return { labels, explicit: explicitSignal };
}

function isComplexWork(intent: CreationIntent): boolean {
  const text = allIntentText(intent).toLowerCase();
  return /\b(build|building|construction|construct|renovation|renovate|house|borehole|software project|website development|manufactur|installation project|major repair)\b/.test(text);
}

function defaultChecksFor(topology: AgreementTopology, intent: CreationIntent): AgreementCheck[] {
  const text = allIntentText(intent).toLowerCase();
  const purchase = /\b(buy|purchase|seller|item|goods|deliver|delivery)\b/.test(text);
  const work = /\b(build|construction|hire|contractor|fundi|service|work|repair|install|paint|plumb|develop)\b/.test(text);

  if (topology === 'MANY_TO_ONE') {
    return [
      {
        id: crypto.randomUUID(), kind: 'PERFORMANCE', title: 'Purpose check',
        condition: 'The collection purpose and intended recipient still match what the contributors agreed.',
        evidence: 'The agreed purpose, target and recipient are visible in the agreement record.',
        confirmer: 'The organiser or person responsible for the collection confirms this point.',
      },
      {
        id: crypto.randomUUID(), kind: 'EVIDENCE', title: 'Contribution record',
        condition: 'The contributions relevant to this money movement have been recorded against the agreement.',
        evidence: 'SecurePay contribution records or other agreed contribution evidence.',
        confirmer: 'SecurePay records the contribution facts; the UI does not infer funding truth.',
      },
      {
        id: crypto.randomUUID(), kind: 'ACCEPTANCE', title: 'Governance check',
        condition: 'Any approval or organiser action required by the agreement has been completed.',
        evidence: 'The required organiser or governance decision is recorded.',
        confirmer: 'Only the backend-authorised organiser or governance structure can satisfy this check.',
      },
    ];
  }

  if (topology === 'ONE_TO_MANY') {
    return [
      {
        id: crypto.randomUUID(), kind: 'PERFORMANCE', title: 'Recipient obligation',
        condition: 'Each recipient has completed the obligation that makes their allocation eligible.',
        evidence: 'Evidence linked to the relevant recipient obligation.',
        confirmer: 'The participant authorised by the agreement reviews the completed obligation.',
      },
      {
        id: crypto.randomUUID(), kind: 'EVIDENCE', title: 'Evidence check',
        condition: 'The evidence required for each allocation is present and reviewable.',
        evidence: 'Document, image, receipt, delivery note, statement or other agreed evidence.',
        confirmer: 'The agreement record shows the evidence and any backend-authorised review outcome.',
      },
      {
        id: crypto.randomUUID(), kind: 'ACCEPTANCE', title: 'Allocation authority',
        condition: 'The agreed approval conditions for the allocation have been satisfied.',
        evidence: 'The relevant approval or completion record is present.',
        confirmer: 'SecurePay backend authority determines whether the allocation is actually eligible to move.',
      },
    ];
  }

  if (topology === 'MANY_TO_MANY') {
    return [
      {
        id: crypto.randomUUID(), kind: 'PERFORMANCE', title: 'Distribution purpose',
        condition: 'The proposed distribution still matches the purpose the group agreed.',
        evidence: 'The allocation plan and participant obligations are visible in the agreement record.',
        confirmer: 'The responsible organisers or participants confirm the factual work or purpose.',
      },
      {
        id: crypto.randomUUID(), kind: 'EVIDENCE', title: 'Evidence and allocation check',
        condition: 'The evidence supporting the proposed recipients and allocations is recorded.',
        evidence: 'Allocation records plus the evidence required by the agreement.',
        confirmer: 'The evidence is reviewed under the agreement rules; the UI does not declare it sufficient.',
      },
      {
        id: crypto.randomUUID(), kind: 'ACCEPTANCE', title: 'Group authority',
        condition: 'The required group approval or quorum has been reached for this distribution.',
        evidence: 'Backend-recorded approval decisions and quorum evaluation.',
        confirmer: 'Only the backend-authorised group governance can satisfy this check.',
      },
    ];
  }

  if (work || isComplexWork(intent)) {
    return [
      {
        id: crypto.randomUUID(), kind: 'PERFORMANCE', title: 'Work completed',
        condition: 'The work due at this payment point has been completed to the agreed scope.',
        evidence: 'The agreed proof of completed work is recorded.',
        confirmer: 'The customer or agreed checker confirms the factual completion point.',
      },
      {
        id: crypto.randomUUID(), kind: 'EVIDENCE', title: 'Evidence recorded',
        condition: 'The evidence required for this payment point is available for both sides to review.',
        evidence: 'Photos, documents, delivery records, inspection record or other agreed evidence.',
        confirmer: 'The agreement record shows the evidence and any authorised review outcome.',
      },
      {
        id: crypto.randomUUID(), kind: 'ACCEPTANCE', title: 'Completion accepted',
        condition: 'The person or role agreed to accept this work has accepted the completion point.',
        evidence: 'A recorded acceptance or other agreement-defined approval.',
        confirmer: 'The agreed participant or governance role acts; SecurePay does not invent acceptance.',
      },
    ];
  }

  if (purchase) {
    return [
      {
        id: crypto.randomUUID(), kind: 'PERFORMANCE', title: 'Correct item handed over',
        condition: 'The agreed item, quantity, model or condition has been delivered or handed over as agreed.',
        evidence: 'Delivery note, receipt, photo, collection record or other agreed handover evidence.',
        confirmer: 'The receiving party confirms the factual handover.',
      },
      {
        id: crypto.randomUUID(), kind: 'EVIDENCE', title: 'Handover evidence',
        condition: 'The agreed handover evidence has been recorded and can be reviewed.',
        evidence: 'The evidence named in this agreement.',
        confirmer: 'The agreement record shows the evidence; SecurePay does not infer delivery from a screen view.',
      },
      {
        id: crypto.randomUUID(), kind: 'ACCEPTANCE', title: 'Receipt accepted',
        condition: 'The person authorised by the agreement has accepted the handover point.',
        evidence: 'Recorded acceptance or other agreed acknowledgement.',
        confirmer: 'The agreed recipient or authorised checker confirms acceptance.',
      },
    ];
  }

  return [
    {
      id: crypto.randomUUID(), kind: 'PERFORMANCE', title: 'What was promised happened',
      condition: 'The main thing promised in the agreement has happened at this money-movement point.',
      evidence: 'The agreed proof of performance is recorded.',
      confirmer: 'The participant responsible for checking performance confirms the factual point.',
    },
    {
      id: crypto.randomUUID(), kind: 'EVIDENCE', title: 'Evidence is available',
      condition: 'The evidence required by the agreement is present and reviewable.',
      evidence: 'Document, image, receipt, delivery note, statement or another agreed proof.',
      confirmer: 'The agreement record shows the evidence and any authorised review outcome.',
    },
    {
      id: crypto.randomUUID(), kind: 'ACCEPTANCE', title: 'Agreement authority is satisfied',
      condition: 'The person or governance structure named by the agreement has accepted this point.',
      evidence: 'The required acceptance or approval is recorded.',
      confirmer: 'Only the authorised participant or governance structure can satisfy this check.',
    },
  ];
}

function initialParticipantCounts(topology: AgreementTopology): { payerCount: number; recipientCount: number } {
  switch (topology) {
    case 'ONE_TO_ONE': return { payerCount: 1, recipientCount: 1 };
    case 'MANY_TO_ONE': return { payerCount: 2, recipientCount: 1 };
    case 'ONE_TO_MANY': return { payerCount: 1, recipientCount: 2 };
    case 'MANY_TO_MANY': return { payerCount: 2, recipientCount: 2 };
  }
}

export function buildAgreementBlueprint(intent: CreationIntent): AgreementBlueprint {
  const topology = inferTopology(intent);
  const stageExtraction = extractExplicitStages(intent);
  const amountMinor = parseKenyanAmountMinor(`${intent.amount} ${intent.statement}`);
  const counts = initialParticipantCounts(topology.topology);

  const stages = stageExtraction.labels.map((label) => ({
    id: crypto.randomUUID(),
    label,
    amountText: '',
    dueDate: '',
    completionEvidence: `Evidence that ${label.toLowerCase()} is complete to the agreed scope.`,
  }));

  if (!stageExtraction.explicit && isComplexWork(intent)) {
    stages.push({
      id: crypto.randomUUID(),
      label: '',
      amountText: '',
      dueDate: '',
      completionEvidence: '',
    });
  }

  return {
    topology: topology.topology,
    topologyReason: topology.reason,
    payerCount: counts.payerCount,
    recipientCount: counts.recipientCount,
    parties: intent.who || '',
    amountText: amountMinor ? formatAmountFromMinor(amountMinor) : normaliseMoneyText(intent.amount === 'To be confirmed' ? '' : intent.amount),
    amountMinor,
    currency: 'KES',
    startDate: '',
    targetDate: '',
    stages,
    stagesExplicitlyUnderstood: stageExtraction.explicit,
    checks: defaultChecksFor(topology.topology, intent),
    additionalDetails: '',
  };
}

export function agreementQuality(blueprint: AgreementBlueprint): AgreementQualityResult {
  const blocking: string[] = [];
  const warnings: string[] = [];
  const core = {
    people: blueprint.payerCount > 0 && blueprint.recipientCount > 0 && blueprint.parties.trim().length >= 3,
    money: blueprint.amountMinor !== null && blueprint.amountMinor > 0,
    timing: blueprint.startDate.trim().length > 0,
    checks: blueprint.checks.length >= 2 && blueprint.checks.every((check) =>
      check.condition.trim().length >= 6 && check.evidence.trim().length >= 3 && check.confirmer.trim().length >= 3),
    stages: blueprint.stages.length === 0 || blueprint.stages.every((stage) =>
      stage.label.trim().length >= 2 && stage.completionEvidence.trim().length >= 3),
  };

  if (!core.people) blocking.push('Say who is trading and how many people are on each side.');
  if (!core.money) blocking.push('Confirm how much money this agreement is about.');
  if (!core.timing) blocking.push('Confirm when this agreement starts.');
  if (!core.checks) blocking.push('Keep at least two meaningful checks, each with a condition, evidence and confirmer.');
  if (!core.stages) blocking.push('Complete the stage names and what will show each stage is complete.');

  if (!blueprint.targetDate.trim()) warnings.push('Add a target, handover, closing or completion date where one can reasonably be agreed.');
  if (blueprint.checks.length === 2) warnings.push('Two checks is the hard minimum. SecurePay normally recommends three independent checks.');
  if (blueprint.checks.length >= 3) {
    const kinds = new Set(blueprint.checks.map((check) => check.kind));
    if (!kinds.has('PERFORMANCE') || !kinds.has('EVIDENCE') || !kinds.has('ACCEPTANCE')) {
      warnings.push('Strong agreements normally cover performance, evidence and acceptance/authority as separate checks.');
    }
  }

  const completedCoreAreas = Object.values(core).filter(Boolean).length;
  return {
    blocking,
    warnings,
    ready: blocking.length === 0,
    completedCoreAreas,
    totalCoreAreas: Object.keys(core).length,
  };
}

function topologyPlainLanguage(topology: AgreementTopology): string {
  switch (topology) {
    case 'ONE_TO_ONE': return 'one payer → one recipient';
    case 'MANY_TO_ONE': return 'several payers → one recipient';
    case 'ONE_TO_MANY': return 'one payer → several recipients';
    case 'MANY_TO_MANY': return 'several payers → several recipients';
  }
}

/**
 * Serialises the trader-confirmed agreement intelligence into the existing
 * Agreement Core description field. This preserves the richer proposal today
 * without pretending the frontend created backend release authority. Milestones
 * are also persisted separately where the backend supports them.
 */
export function serializeAgreementDescription(intent: CreationIntent, blueprint: AgreementBlueprint): string {
  const lines: string[] = [
    'SECUREPAY AGREEMENT INTELLIGENCE',
    `Intent: ${intent.statement}`,
    `People: ${blueprint.parties} (${blueprint.payerCount} payer${blueprint.payerCount === 1 ? '' : 's'}; ${blueprint.recipientCount} recipient${blueprint.recipientCount === 1 ? '' : 's'})`,
    `Money flow: ${topologyPlainLanguage(blueprint.topology)}`,
    `Amount: ${blueprint.amountText || 'To be agreed'}`,
    `Starts: ${blueprint.startDate || 'To be agreed'}`,
    `Target / handover: ${blueprint.targetDate || 'Not specified'}`,
  ];

  if (blueprint.stages.length > 0) {
    lines.push('Stages:');
    blueprint.stages.forEach((stage, index) => {
      lines.push(`${index + 1}. ${stage.label}${stage.amountText ? ` — ${stage.amountText}` : ''}${stage.dueDate ? ` — due ${stage.dueDate}` : ''}`);
      lines.push(`   Completion evidence: ${stage.completionEvidence}`);
    });
  }

  lines.push('Checks before money should move:');
  blueprint.checks.forEach((check, index) => {
    lines.push(`${index + 1}. ${check.title}: ${check.condition}`);
    lines.push(`   Evidence: ${check.evidence}`);
    lines.push(`   Confirmation / authority: ${check.confirmer}`);
  });

  if (blueprint.additionalDetails.trim()) {
    lines.push(`Additional terms from proposer: ${blueprint.additionalDetails.trim()}`);
  }

  lines.push('Authority boundary: these are proposed agreement terms and checks. SecurePay backend authority determines actual eligibility, Payment Ready, release and settlement state.');
  return lines.join('\n');
}
