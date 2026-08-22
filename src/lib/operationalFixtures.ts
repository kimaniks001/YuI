// ═══════════════════════════════════════════════════════════════
// OPERATIONAL FIXTURES (Slice 7)
//
// Representative authoritative state for the full operational
// lifecycle: payment, evidence, release, settlement, review,
// held exception. Used by the preview operational journeys page.
// ═══════════════════════════════════════════════════════════════

import type {
  SecurePayAgreementPaymentIntentSummary,
  SecurePayAgreementMoneyStatus,
  SecurePayPaymentReleaseSettlementStatus,
  SecurePayAgreementObligation,
  SecurePayAgreementEvidence,
  SecurePayObligationCompletionStatus,
  SecurePayAgreementReviewCaseSummary,
  SecurePayAgreementFundingAuthority,
  SecurePayAgreementReleaseAuthority,
  SecurePayAgreementFundingOption,
  SecurePayAgreementFundingQuote,
} from '../api/securepayTypes';
import type { OperationalProjection, OperationalProjectionInput } from './operationalProjection';
import { buildOperationalProjection } from './operationalProjection';
import { buildWorkspaceProjection, type WorkspaceProjectionInput } from './workspaceProjection';
import { getWorkspaceFixture } from './workspaceFixtures';

// ─── Helper: build operational projection from workspace fixture + overrides ──

export interface OperationalFixture {
  id: string;
  label: string;
  description: string;
  group: string;
  projection: OperationalProjection;
}

function buildOps(
  workspaceFixtureId: string,
  overrides: {
    paymentIntent?: SecurePayAgreementPaymentIntentSummary | null;
    moneyStatus?: SecurePayAgreementMoneyStatus | null;
    settlementStatus?: SecurePayPaymentReleaseSettlementStatus | null;
    obligations?: SecurePayAgreementObligation[];
    obligationCompletions?: Map<string, SecurePayObligationCompletionStatus>;
    obligationEvidence?: Map<string, SecurePayAgreementEvidence[]>;
    reviewCases?: SecurePayAgreementReviewCaseSummary[];
    fundingAuthority?: SecurePayAgreementFundingAuthority | null;
    releaseAuthority?: SecurePayAgreementReleaseAuthority | null;
    fundingOptions?: SecurePayAgreementFundingOption[];
    fundingQuote?: SecurePayAgreementFundingQuote | null;
    myParticipantId?: string | null;
    workspaceOverrides?: Partial<WorkspaceProjectionInput>;
  },
): OperationalProjection {
  const wsFixture = getWorkspaceFixture(workspaceFixtureId);
  if (!wsFixture) throw new Error(`Unknown workspace fixture: ${workspaceFixtureId}`);

  const wsInput = { ...wsFixture.input, ...overrides.workspaceOverrides };
  const workspace = buildWorkspaceProjection(wsInput);

  const opsInput: OperationalProjectionInput = {
    workspace,
    paymentIntent: overrides.paymentIntent ?? null,
    moneyStatus: overrides.moneyStatus ?? wsInput.moneyStatus,
    settlementStatus: overrides.settlementStatus ?? wsInput.releaseStatus,
    obligations: overrides.obligations ?? wsInput.obligations,
    obligationCompletions: overrides.obligationCompletions ?? new Map(),
    obligationEvidence: overrides.obligationEvidence ?? new Map(),
    reviewCases: overrides.reviewCases ?? [],
    reviewCaseDetails: new Map(),
    fundingAuthority: overrides.fundingAuthority ?? null,
    releaseAuthority: overrides.releaseAuthority ?? null,
    fundingOptions: overrides.fundingOptions ?? [],
    fundingQuote: overrides.fundingQuote ?? null,
    myParticipantId: overrides.myParticipantId ?? 'p1',
  };

  return buildOperationalProjection(opsInput);
}

// ═══════════════════════════════════════════════════════════════
// A. SECURELINK — Full painter journey
// ═══════════════════════════════════════════════════════════════

const painterFunding: OperationalFixture = {
  id: 'ops-sl-fund',
  label: 'Fund the agreement',
  description: 'Painter joined. Now ready to fund KES 60,000 via M-Pesa.',
  group: 'SecureLink: Painter journey',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'CREATED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: null, retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:00:00Z',
    },
    fundingAuthority: { authorized: true, reasonCode: 'AUTHORIZED' },
    fundingOptions: [
      { railCode: 'MPESA_STK', displayName: 'M-Pesa', currency: 'KES', minimumAmountMinor: 100, maximumAmountMinor: null, quoteAvailable: false },
      { railCode: 'PESALINK', displayName: 'PesaLink', currency: 'KES', minimumAmountMinor: 100, maximumAmountMinor: null, quoteAvailable: true },
    ],
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Painting payment', description: 'Full payment for painting work', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 6000000, status: 'AVAILABLE', createdAt: '2026-08-20T10:00:00Z' },
    ],
    workspaceOverrides: {
      nextActions: [
        { participantId: 'p1', agreementId: 'agr-3', currentAgreementVersionId: 'v1', actionType: 'FUND_AGREEMENT', targetObligationId: 'o1', actionReason: 'The agreement is ready for funding.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
      ],
    },
  }),
};

const painterMpesaPending: OperationalFixture = {
  id: 'ops-sl-mpesa-pending',
  label: 'M-Pesa request sent',
  description: 'STK push sent. Waiting for the painter to enter their M-PESA PIN.',
  group: 'SecureLink: Painter journey',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'PROVIDER_PENDING', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'ACCEPTED', retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:01:00Z',
    },
    fundingAuthority: { authorized: true, reasonCode: 'AUTHORIZED' },
  }),
};

const painterPaymentConfirmed: OperationalFixture = {
  id: 'ops-sl-payment-confirmed',
  label: 'Payment received',
  description: 'M-Pesa payment confirmed. Work stage begins.',
  group: 'SecureLink: Painter journey',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'CONFIRMED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'ACCEPTED', retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:05:00Z',
    },
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Painting payment', description: 'Full payment for painting work', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 6000000, status: 'IN_PROGRESS', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'WORK', title: 'Preparation', description: 'Surface prep and priming', responsibleParticipantId: 'p2', beneficiaryParticipantId: 'p1', currency: null, amountMinor: null, status: 'IN_PROGRESS', createdAt: '2026-08-20T10:00:00Z' },
    ],
    workspaceOverrides: {
      nextActions: [
        { participantId: 'p2', agreementId: 'agr-3', currentAgreementVersionId: 'v1', actionType: 'SUBMIT_EVIDENCE', targetObligationId: 'o2', actionReason: 'Add evidence for the preparation stage.', prerequisiteStatus: null, deadline: null, urgency: 'MEDIUM', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
      ],
    },
  }),
};

const painterEvidenceSubmitted: OperationalFixture = {
  id: 'ops-sl-evidence',
  label: 'Evidence submitted',
  description: 'Painter submitted photos of completed preparation. Waiting for confirmation.',
  group: 'SecureLink: Painter journey',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'CONFIRMED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'ACCEPTED', retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:05:00Z',
    },
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Painting payment', description: 'Full payment', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 6000000, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'WORK', title: 'Preparation', description: 'Surface prep and priming', responsibleParticipantId: 'p2', beneficiaryParticipantId: 'p1', currency: null, amountMinor: null, status: 'EVIDENCE_SUBMITTED', createdAt: '2026-08-20T10:00:00Z' },
    ],
    obligationCompletions: new Map([
      ['o2', { eligible: true, currentStatus: 'EVIDENCE_SUBMITTED', unmetRequirements: [], satisfiedRequirements: ['EVIDENCE_SUBMITTED'], evidenceIds: ['ev-1'], explanationCodes: [] }],
    ]),
    obligationEvidence: new Map([
      ['o2', [{ id: 'ev-1', obligationId: 'o2', evidenceType: 'IMAGE', status: 'SUBMITTED', description: 'Photos of completed surface preparation', contentType: 'image/jpeg', submittedAt: '2026-08-20T14:00:00Z' }]],
    ]),
    workspaceOverrides: {
      nextActions: [
        { participantId: 'p1', agreementId: 'agr-3', currentAgreementVersionId: 'v1', actionType: 'CONFIRM_VERSION', targetObligationId: 'o2', actionReason: 'Confirm the preparation stage is complete.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
      ],
    },
  }),
};

const painterReleaseRequested: OperationalFixture = {
  id: 'ops-sl-release-requested',
  label: 'Release requested',
  description: 'Work confirmed. Release requested. Waiting for settlement.',
  group: 'SecureLink: Painter journey',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'CONFIRMED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'ACCEPTED', retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:05:00Z',
    },
    settlementStatus: {
      instructionId: 'instr-1', settlementPhase: 'INSTRUCTION_CREATED',
      reservationId: null, executionId: null, exception: null, settledAt: null,
    },
    releaseAuthority: { authorized: true, reasonCode: 'AUTHORIZED', evaluationId: 'eval-1' },
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Painting payment', description: 'Full payment', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 6000000, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'WORK', title: 'Preparation', description: 'Surface prep', responsibleParticipantId: 'p2', beneficiaryParticipantId: 'p1', currency: null, amountMinor: null, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
    ],
  }),
};

const painterSettled: OperationalFixture = {
  id: 'ops-sl-settled',
  label: 'Payment settled',
  description: 'Stage 1 payment settled to the painter. Ready for stage 2.',
  group: 'SecureLink: Painter journey',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'CONFIRMED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'ACCEPTED', retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:05:00Z',
    },
    settlementStatus: {
      instructionId: 'instr-1', settlementPhase: 'SETTLED',
      reservationId: 'res-1', executionId: 'exec-1', exception: null,
      settledAt: '2026-08-20T15:00:00Z',
    },
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Painting payment', description: 'Full payment', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 6000000, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'WORK', title: 'Preparation', description: 'Surface prep', responsibleParticipantId: 'p2', beneficiaryParticipantId: 'p1', currency: null, amountMinor: null, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
    ],
    workspaceOverrides: {
      nextActions: [
        { participantId: 'p2', agreementId: 'agr-3', currentAgreementVersionId: 'v1', actionType: 'START_OBLIGATION', targetObligationId: 'o3', actionReason: 'Stage 2 — Final painting is ready to begin.', prerequisiteStatus: null, deadline: null, urgency: 'MEDIUM', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
      ],
    },
  }),
};

// ═══════════════════════════════════════════════════════════════
// B. SECURELINK — Payment failure
// ═══════════════════════════════════════════════════════════════

const paymentFailed: OperationalFixture = {
  id: 'ops-sl-payment-failed',
  label: 'Payment failed',
  description: 'M-Pesa STK push failed. Retry is available.',
  group: 'SecureLink: Failure states',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'FAILED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'FAILED', retryEligible: true,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:10:00Z',
    },
    fundingAuthority: { authorized: true, reasonCode: 'AUTHORIZED' },
    fundingOptions: [
      { railCode: 'MPESA_STK', displayName: 'M-Pesa', currency: 'KES', minimumAmountMinor: 100, maximumAmountMinor: null, quoteAvailable: false },
    ],
  }),
};

const paymentActionRequired: OperationalFixture = {
  id: 'ops-sl-action-required',
  label: 'Action required',
  description: 'Payment provider needs the user to complete an action.',
  group: 'SecureLink: Failure states',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'ACTION_REQUIRED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'ACTION_REQUIRED', retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:02:00Z',
    },
  }),
};

// ═══════════════════════════════════════════════════════════════
// C. HELD EXCEPTION
// ═══════════════════════════════════════════════════════════════

const heldException: OperationalFixture = {
  id: 'ops-sl-held-exception',
  label: 'Payment held for review',
  description: 'Release encountered an issue and is held for review.',
  group: 'SecureLink: Exception states',
  projection: buildOps('sl-payment-ready', {
    paymentIntent: {
      id: 'pi-1', status: 'CONFIRMED', amountMinor: 6000000, currency: 'KES',
      latestAttemptStatus: 'ACCEPTED', retryEligible: false,
      createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:05:00Z',
    },
    settlementStatus: {
      instructionId: 'instr-1', settlementPhase: 'HELD_EXCEPTION',
      reservationId: null, executionId: null,
      exception: {
        exceptionId: 'exc-1', instructionId: 'instr-1',
        exceptionType: 'HELD_EXCEPTION',
        customerSafeReason: 'Manual review is required before this payment can be released.',
        requiredAction: 'OPERATIONS_REVIEW',
        recordedAt: '2026-08-20T14:30:00Z',
        compensatedOutcome: false,
      },
      settledAt: null,
    },
  }),
};

// ═══════════════════════════════════════════════════════════════
// D. AGREEMENT REVIEW / DISPUTE
// ═══════════════════════════════════════════════════════════════

const reviewIssueRaised: OperationalFixture = {
  id: 'ops-review-open',
  label: 'Issue raised',
  description: 'A dispute has been raised about the preparation work.',
  group: 'Agreement Review',
  projection: buildOps('sl-payment-ready', {
    reviewCases: [
      { reviewCaseId: 'rc-1', agreementId: 'agr-3', agreementVersionId: 'v1', state: 'OPEN', openedAt: '2026-08-20T14:00:00Z', callerRole: 'COUNTERPARTY', subjectType: 'OBLIGATION', subjectId: 'o2', responseDeadlineAt: null, evidenceDeadlineAt: null, terminalOutcome: null, version: 1 },
    ],
    workspaceOverrides: {
      nextActions: [
        { participantId: 'p1', agreementId: 'agr-3', currentAgreementVersionId: 'v1', actionType: 'ACKNOWLEDGE_REVIEW', targetObligationId: null, actionReason: 'A dispute has been raised about the preparation work.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
      ],
    },
  }),
};

// ═══════════════════════════════════════════════════════════════
// E. SECUREFLOW — Multi-recipient
// ═══════════════════════════════════════════════════════════════

const secureflowMultiRecipient: OperationalFixture = {
  id: 'ops-sf-multi',
  label: '3 recipients, mixed states',
  description: 'Contractor work done, plumber in progress, electrician needs identity.',
  group: 'SecureFlow: Multi-recipient',
  projection: buildOps('sf-plan-submitted', {
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-7', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Contractor payment', description: 'KES 80,000', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 8000000, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-7', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Plumber payment', description: 'KES 60,000', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p3', currency: 'KES', amountMinor: 6000000, status: 'IN_PROGRESS', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o3', publicReference: 'obl-3', agreementId: 'agr-7', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Electrician payment', description: 'KES 40,000', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p4', currency: 'KES', amountMinor: 4000000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
    ],
    workspaceOverrides: {
      nextActions: [
        { participantId: 'p1', agreementId: 'agr-7', currentAgreementVersionId: 'v1', actionType: 'REQUEST_RELEASE', targetObligationId: 'o1', actionReason: 'Contractor work is complete. Ready to release payment.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
      ],
    },
  }),
};

// ═══════════════════════════════════════════════════════════════
// F. GROUP SECURELINK — Partial contributions
// ═══════════════════════════════════════════════════════════════

const groupPartialContributions: OperationalFixture = {
  id: 'ops-gsl-partial',
  label: '3 of 6 contributed',
  description: 'Half the siblings have contributed. Expected total ≠ contributed.',
  group: 'Group SecureLink: Contributions',
  projection: buildOps('gsl-contributing', {}),
};

// ═══════════════════════════════════════════════════════════════
// G. GROUP SECUREFLOW — Multi-recipient payout
// ═══════════════════════════════════════════════════════════════

const groupSecureflowPayout: OperationalFixture = {
  id: 'ops-gsf-payout',
  label: 'Ready for first payout',
  description: '15 of 20 parents contributed. Bus company ready for payment.',
  group: 'Group SecureFlow: Payout readiness',
  projection: buildOps('gsf-identities-missing', {
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-8', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Bus company payment', description: 'Transport', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 4000000, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-8', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Caterer payment', description: 'Meals', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p3', currency: 'KES', amountMinor: 2500000, status: 'IN_PROGRESS', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o3', publicReference: 'obl-3', agreementId: 'agr-8', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Venue payment', description: 'Venue hire', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p4', currency: 'KES', amountMinor: 1500000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
    ],
    workspaceOverrides: {
      nextActions: [
        { participantId: 'p1', agreementId: 'agr-8', currentAgreementVersionId: 'v1', actionType: 'REQUEST_RELEASE', targetObligationId: 'o1', actionReason: 'Bus company payment is ready to release.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
      ],
    },
  }),
};

// ═══════════════════════════════════════════════════════════════
// All fixtures
// ═══════════════════════════════════════════════════════════════

export const ALL_OPERATIONAL_FIXTURES: OperationalFixture[] = [
  painterFunding,
  painterMpesaPending,
  painterPaymentConfirmed,
  painterEvidenceSubmitted,
  painterReleaseRequested,
  painterSettled,
  paymentFailed,
  paymentActionRequired,
  heldException,
  reviewIssueRaised,
  secureflowMultiRecipient,
  groupPartialContributions,
  groupSecureflowPayout,
];

export function getOperationalFixture(id: string): OperationalFixture | undefined {
  return ALL_OPERATIONAL_FIXTURES.find(f => f.id === id);
}

export const OPERATIONAL_FIXTURE_GROUPS: string[] = [
  ...new Set(ALL_OPERATIONAL_FIXTURES.map(f => f.group)),
];
