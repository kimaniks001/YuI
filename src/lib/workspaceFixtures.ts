// ═══════════════════════════════════════════════════════════════
// WORKSPACE FIXTURES
//
// Representative authoritative state for all four topologies
// across lifecycle states. Used by the preview workspace page.
// No backend writes. No auth required. Clearly PREVIEW.
// ═══════════════════════════════════════════════════════════════

import type { SecurePayAgreement, SecurePayAgreementActivity } from '../api/securepayTypes';
import type { AgreementTopology } from './agreementTopology';
import type { WorkspaceProjectionInput } from './workspaceProjection';

export interface WorkspaceFixture {
  id: string;
  label: string;
  topology: AgreementTopology;
  description: string;
  input: WorkspaceProjectionInput;
}

// ─── Helper: make a minimal agreement ───────────────────────────

let agreementCounter = 0;

function makeAgreement(overrides: Partial<SecurePayAgreement>): SecurePayAgreement {
  agreementCounter++;
  return {
    id: `agr-${agreementCounter}`,
    publicReference: `SP-2026-${String(agreementCounter).padStart(4, '0')}`,
    agreementType: 'GENERIC',
    title: 'Agreement',
    purpose: '',
    description: null,
    currency: 'KES',
    proposedAmountMinor: null,
    status: 'PROPOSED',
    expiresAt: null,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    ...overrides,
  };
}

function makeActivity(type: string, occurredAt: string): SecurePayAgreementActivity {
  return { id: `act-${type}-${occurredAt}`, activityType: type, occurredAt, metadata: {} };
}

// ═══════════════════════════════════════════════════════════════
// ONE_TO_ONE — SecureLink fixtures
// ═══════════════════════════════════════════════════════════════

const securelinkPainterInvited: WorkspaceFixture = {
  id: 'sl-invited',
  label: 'Painter needs invitation',
  topology: 'ONE_TO_ONE',
  description: 'House painting contract. Painter has not been invited yet.',
  input: {
    agreement: makeAgreement({
      title: 'House painting contract',
      purpose: 'Painting the exterior of a house in two stages.',
      proposedAmountMinor: 6000000,
      status: 'PROPOSED',
    }),
    topology: 'ONE_TO_ONE',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CREATOR', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p2', identityId: null, roleCode: 'COUNTERPARTY', participantStatus: 'INVITED', addedAt: '2026-08-20T10:00:00Z' },
    ],
    moneyStatus: null,
    obligations: [],
    milestones: [
      { id: 'm1', agreementId: 'agr-1', agreementVersionId: 'v1', title: 'Preparation', description: 'Surface prep and priming', sequenceOrder: 1, availableFrom: null, dueAt: null, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'm2', agreementId: 'agr-1', agreementVersionId: 'v1', title: 'Final painting', description: 'Two coats of finish paint', sequenceOrder: 2, availableFrom: null, dueAt: null, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
    ],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
    ],
    confirmationStatus: null,
    nextActions: [
      { participantId: 'p1', agreementId: 'agr-1', currentAgreementVersionId: 'v1', actionType: 'INVITE_PARTICIPANT', targetObligationId: null, actionReason: 'The counterparty has not joined yet.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
    groupSecureLink: null,
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

const securelinkWaitingForPainter: WorkspaceFixture = {
  id: 'sl-waiting',
  label: 'Waiting for painter',
  topology: 'ONE_TO_ONE',
  description: 'Painter has been invited but has not joined yet.',
  input: {
    agreement: makeAgreement({
      title: 'House painting contract',
      purpose: 'Painting the exterior of a house in two stages.',
      proposedAmountMinor: 6000000,
      status: 'INVITATION_PENDING',
    }),
    topology: 'ONE_TO_ONE',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CREATOR', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p2', identityId: null, roleCode: 'COUNTERPARTY', participantStatus: 'PENDING', addedAt: '2026-08-20T10:00:00Z' },
    ],
    moneyStatus: null,
    obligations: [],
    milestones: [
      { id: 'm1', agreementId: 'agr-2', agreementVersionId: 'v1', title: 'Preparation', description: 'Surface prep and priming', sequenceOrder: 1, availableFrom: null, dueAt: null, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'm2', agreementId: 'agr-2', agreementVersionId: 'v1', title: 'Final painting', description: 'Two coats of finish paint', sequenceOrder: 2, availableFrom: null, dueAt: null, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
    ],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('INVITATION_ISSUED', '2026-08-20T10:05:00Z'),
    ],
    confirmationStatus: null,
    nextActions: [],
    groupSecureLink: null,
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

const securelinkPaymentReady: WorkspaceFixture = {
  id: 'sl-payment-ready',
  label: 'Payment ready',
  topology: 'ONE_TO_ONE',
  description: 'Painter joined, work confirmed, payment is ready to release.',
  input: {
    agreement: makeAgreement({
      title: 'House painting contract',
      purpose: 'Painting the exterior of a house in two stages.',
      proposedAmountMinor: 6000000,
      status: 'CONFIRMATION_PENDING',
    }),
    topology: 'ONE_TO_ONE',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p2', identityId: 'id-2', roleCode: 'COUNTERPARTY', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T11:00:00Z' },
    ],
    moneyStatus: {
      agreementId: 'agr-3',
      agreementCurrency: 'KES',
      proposedAmountMinor: 6000000,
      evaluatedCurrency: 'KES',
      evaluatedAmountMinor: 6000000,
      paymentReady: true,
      paymentReadyStatus: 'READY',
      outstandingReasons: [],
      evaluatedAt: '2026-08-20T14:00:00Z',
      evaluationId: 'eval-1',
    },
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-3', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Painting payment', description: 'Full payment for painting work', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 6000000, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
    ],
    milestones: [
      { id: 'm1', agreementId: 'agr-3', agreementVersionId: 'v1', title: 'Preparation', description: 'Surface prep and priming', sequenceOrder: 1, availableFrom: null, dueAt: null, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'm2', agreementId: 'agr-3', agreementVersionId: 'v1', title: 'Final painting', description: 'Two coats of finish paint', sequenceOrder: 2, availableFrom: null, dueAt: null, status: 'COMPLETED', createdAt: '2026-08-20T10:00:00Z' },
    ],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('PARTICIPANT_JOINED', '2026-08-20T11:00:00Z'),
      makeActivity('VERSION_CONFIRMED', '2026-08-20T11:30:00Z'),
      makeActivity('OBLIGATION_COMPLETED', '2026-08-20T13:00:00Z'),
    ],
    confirmationStatus: {
      participantId: 'p1',
      identityId: 'id-1',
      roleCode: 'CREATOR',
      participantStatus: 'CONFIRMED',
      confirmedVersionId: 'v1',
      confirmedVersionNumber: 1,
      currentVersionId: 'v1',
      currentVersionNumber: 1,
      confirmationCurrent: true,
      reconfirmationRequired: false,
    },
    nextActions: [
      { participantId: 'p1', agreementId: 'agr-3', currentAgreementVersionId: 'v1', actionType: 'REQUEST_RELEASE', targetObligationId: 'o1', actionReason: 'Payment is ready to be released to the painter.', prerequisiteStatus: null, deadline: null, urgency: 'MEDIUM', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
    groupSecureLink: null,
    paymentIntents: [
      { id: 'pi-1', status: 'CONFIRMED', amountMinor: 6000000, currency: 'KES', latestAttemptStatus: 'ACCEPTED', retryEligible: false, createdAt: '2026-08-20T12:00:00Z', lastStateChangeAt: '2026-08-20T12:05:00Z' },
    ],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// MANY_TO_ONE — Group SecureLink fixtures
// ═══════════════════════════════════════════════════════════════

const groupSecurelinkActive: WorkspaceFixture = {
  id: 'gsl-active',
  label: 'Contribution link ready',
  topology: 'MANY_TO_ONE',
  description: '6 siblings supporting Mum monthly. Group is active, link is ready to share.',
  input: {
    agreement: makeAgreement({
      title: 'Family support for Mum',
      purpose: 'Monthly contributions from 6 siblings for Mum\u2019s upkeep.',
      proposedAmountMinor: 3000000,
      status: 'PARTICIPANTS_JOINING',
    }),
    topology: 'MANY_TO_ONE',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CREATOR', addedAt: '2026-08-20T10:00:00Z' },
    ],
    moneyStatus: null,
    obligations: [],
    milestones: [],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('GROUP_SECURELINK_CREATED', '2026-08-20T10:05:00Z'),
      makeActivity('GROUP_SECURELINK_ACTIVATED', '2026-08-20T10:10:00Z'),
    ],
    confirmationStatus: null,
    nextActions: [
      { participantId: 'p1', agreementId: 'agr-4', currentAgreementVersionId: 'v1', actionType: 'SHARE_CONTRIBUTION_LINK', targetObligationId: null, actionReason: 'The contribution link is ready to share with contributors.', prerequisiteStatus: null, deadline: null, urgency: 'MEDIUM', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
    groupSecureLink: {
      id: 'gsl-1',
      agreementId: 'agr-4',
      agreementReference: 'SP-2026-0004',
      groupType: 'WELFARE',
      title: 'Family support for Mum',
      statedPurpose: 'Monthly contributions from 6 siblings for Mum\u2019s upkeep.',
      targetType: 'FIXED_AMOUNT',
      targetAmountMinor: 3000000,
      currency: 'KES',
      minimumContributionMinor: null,
      maximumContributionMinor: null,
      contributionDeadline: null,
      status: 'ACTIVE',
      activatedAt: '2026-08-20T10:10:00Z',
      expiresAt: null,
      organizers: [],
      governancePolicies: [],
      recordedContributionCount: 2,
      recordedContributionTotalMinor: 1000000,
      confirmedContributionCount: 1,
      confirmedContributionTotalMinor: 500000,
      pendingContributionCount: 1,
      pendingContributionTotalMinor: 500000,
    },
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

const groupSecurelinkContributing: WorkspaceFixture = {
  id: 'gsl-contributing',
  label: 'Contributions coming in',
  topology: 'MANY_TO_ONE',
  description: '3 of 6 siblings have contributed. Link has been shared.',
  input: {
    agreement: makeAgreement({
      title: 'Family support for Mum',
      purpose: 'Monthly contributions from 6 siblings for Mum\u2019s upkeep.',
      proposedAmountMinor: 3000000,
      status: 'PARTICIPANTS_JOINING',
    }),
    topology: 'MANY_TO_ONE',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CREATOR', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p2', identityId: 'id-2', roleCode: 'CONTRIBUTOR', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T11:00:00Z' },
      { id: 'p3', identityId: 'id-3', roleCode: 'CONTRIBUTOR', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T12:00:00Z' },
      { id: 'p4', identityId: 'id-4', roleCode: 'CONTRIBUTOR', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T13:00:00Z' },
    ],
    moneyStatus: null,
    obligations: [],
    milestones: [],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('GROUP_SECURELINK_ACTIVATED', '2026-08-20T10:10:00Z'),
      makeActivity('CONTRIBUTION_RECORDED', '2026-08-20T11:30:00Z'),
      makeActivity('CONTRIBUTION_RECORDED', '2026-08-20T12:30:00Z'),
      makeActivity('CONTRIBUTION_CONFIRMED', '2026-08-20T13:00:00Z'),
    ],
    confirmationStatus: null,
    nextActions: [],
    groupSecureLink: {
      id: 'gsl-2',
      agreementId: 'agr-5',
      agreementReference: 'SP-2026-0005',
      groupType: 'WELFARE',
      title: 'Family support for Mum',
      statedPurpose: 'Monthly contributions from 6 siblings for Mum\u2019s upkeep.',
      targetType: 'FIXED_AMOUNT',
      targetAmountMinor: 3000000,
      currency: 'KES',
      minimumContributionMinor: null,
      maximumContributionMinor: null,
      contributionDeadline: null,
      status: 'ACTIVE',
      activatedAt: '2026-08-20T10:10:00Z',
      expiresAt: null,
      organizers: [],
      governancePolicies: [],
      recordedContributionCount: 3,
      recordedContributionTotalMinor: 1500000,
      confirmedContributionCount: 3,
      confirmedContributionTotalMinor: 1500000,
      pendingContributionCount: 0,
      pendingContributionTotalMinor: 0,
    },
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// ONE_TO_MANY — SecureFlow fixtures
// ═══════════════════════════════════════════════════════════════

const secureflowIdentitiesMissing: WorkspaceFixture = {
  id: 'sf-identities-missing',
  label: 'Two recipient identities missing',
  topology: 'ONE_TO_MANY',
  description: 'Renovation with 3 recipients. Contractor has joined, plumber and electrician need identities.',
  input: {
    agreement: makeAgreement({
      title: 'Renovation',
      purpose: 'Renovation with contractor, plumber and electrician.',
      proposedAmountMinor: 18000000,
      status: 'PARTICIPANTS_JOINING',
    }),
    topology: 'ONE_TO_MANY',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CREATOR', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p2', identityId: 'id-2', roleCode: 'CONTRACTOR', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T11:00:00Z' },
      { id: 'p3', identityId: null, roleCode: 'PLUMBER', participantStatus: 'INVITED', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p4', identityId: null, roleCode: 'ELECTRICIAN', participantStatus: 'INVITED', addedAt: '2026-08-20T10:00:00Z' },
    ],
    moneyStatus: null,
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-6', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Contractor payment', description: 'KES 80,000 for structural work', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 8000000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-6', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Plumber payment', description: 'KES 60,000 for plumbing', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p3', currency: 'KES', amountMinor: 6000000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o3', publicReference: 'obl-3', agreementId: 'agr-6', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Electrician payment', description: 'KES 40,000 for electrical work', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p4', currency: 'KES', amountMinor: 4000000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
    ],
    milestones: [],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('PARTICIPANT_JOINED', '2026-08-20T11:00:00Z'),
    ],
    confirmationStatus: null,
    nextActions: [
      { participantId: 'p1', agreementId: 'agr-6', currentAgreementVersionId: 'v1', actionType: 'INVITE_RECIPIENT', targetObligationId: null, actionReason: '2 recipients still need SecurePay identities.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
    groupSecureLink: null,
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

const secureflowPlanSubmitted: WorkspaceFixture = {
  id: 'sf-plan-submitted',
  label: 'Distribution plan submitted',
  topology: 'ONE_TO_MANY',
  description: 'All 3 recipients joined. Distribution plan has been submitted.',
  input: {
    agreement: makeAgreement({
      title: 'Renovation',
      purpose: 'Renovation with contractor, plumber and electrician.',
      proposedAmountMinor: 18000000,
      status: 'CONFIRMATION_PENDING',
    }),
    topology: 'ONE_TO_MANY',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p2', identityId: 'id-2', roleCode: 'CONTRACTOR', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T11:00:00Z' },
      { id: 'p3', identityId: 'id-3', roleCode: 'PLUMBER', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T12:00:00Z' },
      { id: 'p4', identityId: 'id-4', roleCode: 'ELECTRICIAN', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T13:00:00Z' },
    ],
    moneyStatus: {
      agreementId: 'agr-7',
      agreementCurrency: 'KES',
      proposedAmountMinor: 18000000,
      evaluatedCurrency: 'KES',
      evaluatedAmountMinor: 18000000,
      paymentReady: false,
      paymentReadyStatus: 'NOT_READY',
      outstandingReasons: [{ gateCode: 'FUNDING', reasonCode: 'PAYMENT_NOT_RECEIVED' }],
      evaluatedAt: '2026-08-20T14:00:00Z',
      evaluationId: 'eval-2',
    },
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-7', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Contractor payment', description: 'KES 80,000', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 8000000, status: 'AVAILABLE', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-7', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Plumber payment', description: 'KES 60,000', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p3', currency: 'KES', amountMinor: 6000000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o3', publicReference: 'obl-3', agreementId: 'agr-7', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Electrician payment', description: 'KES 40,000', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p4', currency: 'KES', amountMinor: 4000000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
    ],
    milestones: [],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('PARTICIPANT_JOINED', '2026-08-20T11:00:00Z'),
      makeActivity('PARTICIPANT_JOINED', '2026-08-20T12:00:00Z'),
      makeActivity('PARTICIPANT_JOINED', '2026-08-20T13:00:00Z'),
      makeActivity('DISTRIBUTION_PLAN_SUBMITTED', '2026-08-20T14:00:00Z'),
    ],
    confirmationStatus: {
      participantId: 'p1',
      identityId: 'id-1',
      roleCode: 'CREATOR',
      participantStatus: 'CONFIRMED',
      confirmedVersionId: 'v1',
      confirmedVersionNumber: 1,
      currentVersionId: 'v1',
      currentVersionNumber: 1,
      confirmationCurrent: true,
      reconfirmationRequired: false,
    },
    nextActions: [
      { participantId: 'p1', agreementId: 'agr-7', currentAgreementVersionId: 'v1', actionType: 'FUND_AGREEMENT', targetObligationId: 'o1', actionReason: 'The first payment is ready to be funded.', prerequisiteStatus: null, deadline: null, urgency: 'MEDIUM', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
    groupSecureLink: null,
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// MANY_TO_MANY — Group SecureFlow fixtures
// ═══════════════════════════════════════════════════════════════

const groupSecureflowIdentitiesMissing: WorkspaceFixture = {
  id: 'gsf-identities-missing',
  label: '2 suppliers need identities',
  topology: 'MANY_TO_MANY',
  description: '20 parents contributing for school trip. Bus company joined, caterer and venue need identities.',
  input: {
    agreement: makeAgreement({
      title: 'School trip with multiple suppliers',
      purpose: '20 parents contributing KES 4,000 each to pay bus company, caterer and venue.',
      proposedAmountMinor: 8000000,
      status: 'PARTICIPANTS_JOINING',
    }),
    topology: 'MANY_TO_MANY',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CREATOR', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p2', identityId: 'id-2', roleCode: 'BUS_COMPANY', participantStatus: 'CONFIRMED', addedAt: '2026-08-20T11:00:00Z' },
      { id: 'p3', identityId: null, roleCode: 'CATERER', participantStatus: 'INVITED', addedAt: '2026-08-20T10:00:00Z' },
      { id: 'p4', identityId: null, roleCode: 'VENUE', participantStatus: 'INVITED', addedAt: '2026-08-20T10:00:00Z' },
    ],
    moneyStatus: null,
    obligations: [
      { id: 'o1', publicReference: 'obl-1', agreementId: 'agr-8', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Bus company payment', description: 'Transport', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p2', currency: 'KES', amountMinor: 4000000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o2', publicReference: 'obl-2', agreementId: 'agr-8', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Caterer payment', description: 'Meals', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p3', currency: 'KES', amountMinor: 2500000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
      { id: 'o3', publicReference: 'obl-3', agreementId: 'agr-8', agreementVersionId: 'v1', obligationType: 'MONETARY', title: 'Venue payment', description: 'Venue hire', responsibleParticipantId: 'p1', beneficiaryParticipantId: 'p4', currency: 'KES', amountMinor: 1500000, status: 'PENDING', createdAt: '2026-08-20T10:00:00Z' },
    ],
    milestones: [],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('GROUP_SECURELINK_CREATED', '2026-08-20T10:05:00Z'),
      makeActivity('PARTICIPANT_JOINED', '2026-08-20T11:00:00Z'),
    ],
    confirmationStatus: null,
    nextActions: [
      { participantId: 'p1', agreementId: 'agr-8', currentAgreementVersionId: 'v1', actionType: 'INVITE_RECIPIENT', targetObligationId: null, actionReason: '2 recipients still need SecurePay identities.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
    groupSecureLink: {
      id: 'gsl-3',
      agreementId: 'agr-8',
      agreementReference: 'SP-2026-0008',
      groupType: 'GENERAL',
      title: 'School trip with multiple suppliers',
      statedPurpose: '20 parents contributing KES 4,000 each.',
      targetType: 'FIXED_AMOUNT',
      targetAmountMinor: 8000000,
      currency: 'KES',
      minimumContributionMinor: null,
      maximumContributionMinor: null,
      contributionDeadline: null,
      status: 'ACTIVE',
      activatedAt: '2026-08-20T10:10:00Z',
      expiresAt: null,
      organizers: [],
      governancePolicies: [],
      recordedContributionCount: 5,
      recordedContributionTotalMinor: 2000000,
      confirmedContributionCount: 3,
      confirmedContributionTotalMinor: 1200000,
      pendingContributionCount: 2,
      pendingContributionTotalMinor: 800000,
    },
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

const groupSecureflowLinkReady: WorkspaceFixture = {
  id: 'gsf-link-ready',
  label: 'Contribution link ready to share',
  topology: 'MANY_TO_MANY',
  description: 'School trip group just created. Link is ready, no contributors yet.',
  input: {
    agreement: makeAgreement({
      title: 'School trip with multiple suppliers',
      purpose: '20 parents contributing KES 4,000 each to pay bus company, caterer and venue.',
      proposedAmountMinor: 8000000,
      status: 'PARTICIPANTS_JOINING',
    }),
    topology: 'MANY_TO_MANY',
    participants: [
      { id: 'p1', identityId: 'id-1', roleCode: 'CREATOR', participantStatus: 'CREATOR', addedAt: '2026-08-20T10:00:00Z' },
    ],
    moneyStatus: null,
    obligations: [],
    milestones: [],
    activity: [
      makeActivity('AGREEMENT_CREATED', '2026-08-20T10:00:00Z'),
      makeActivity('GROUP_SECURELINK_CREATED', '2026-08-20T10:05:00Z'),
      makeActivity('GROUP_SECURELINK_ACTIVATED', '2026-08-20T10:10:00Z'),
    ],
    confirmationStatus: null,
    nextActions: [
      { participantId: 'p1', agreementId: 'agr-9', currentAgreementVersionId: 'v1', actionType: 'SHARE_CONTRIBUTION_LINK', targetObligationId: null, actionReason: 'The contribution link is ready to share with parents.', prerequisiteStatus: null, deadline: null, urgency: 'MEDIUM', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
    groupSecureLink: {
      id: 'gsl-4',
      agreementId: 'agr-9',
      agreementReference: 'SP-2026-0009',
      groupType: 'GENERAL',
      title: 'School trip with multiple suppliers',
      statedPurpose: '20 parents contributing KES 4,000 each.',
      targetType: 'FIXED_AMOUNT',
      targetAmountMinor: 8000000,
      currency: 'KES',
      minimumContributionMinor: null,
      maximumContributionMinor: null,
      contributionDeadline: null,
      status: 'ACTIVE',
      activatedAt: '2026-08-20T10:10:00Z',
      expiresAt: null,
      organizers: [],
      governancePolicies: [],
      recordedContributionCount: 0,
      recordedContributionTotalMinor: 0,
      confirmedContributionCount: 0,
      confirmedContributionTotalMinor: 0,
      pendingContributionCount: 0,
      pendingContributionTotalMinor: 0,
    },
    paymentIntents: [],
    releaseStatus: null,
    creatorPerspective: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// Participant perspective fixtures
// ═══════════════════════════════════════════════════════════════

const painterInvitedParticipant: WorkspaceFixture = {
  id: 'sl-participant',
  label: 'Painter perspective — invited',
  topology: 'ONE_TO_ONE',
  description: 'The painter\u2019s view after being invited to the painting contract.',
  input: {
    ...securelinkPainterInvited.input,
    creatorPerspective: false,
    nextActions: [
      { participantId: 'p2', agreementId: 'agr-1', currentAgreementVersionId: 'v1', actionType: 'CONFIRM_VERSION', targetObligationId: null, actionReason: 'You have been invited to join this agreement.', prerequisiteStatus: null, deadline: null, urgency: 'HIGH', requiredEvidenceTypes: [], blockedByObligationIds: [], supportingEvidenceIds: [] },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// All fixtures
// ═══════════════════════════════════════════════════════════════

export const ALL_WORKSPACE_FIXTURES: WorkspaceFixture[] = [
  securelinkPainterInvited,
  securelinkWaitingForPainter,
  securelinkPaymentReady,
  painterInvitedParticipant,
  groupSecurelinkActive,
  groupSecurelinkContributing,
  secureflowIdentitiesMissing,
  secureflowPlanSubmitted,
  groupSecureflowIdentitiesMissing,
  groupSecureflowLinkReady,
];

export function getWorkspaceFixture(id: string): WorkspaceFixture | undefined {
  return ALL_WORKSPACE_FIXTURES.find(f => f.id === id);
}

export const FIXTURES_BY_TOPOLOGY: Record<AgreementTopology, WorkspaceFixture[]> = {
  ONE_TO_ONE: [securelinkPainterInvited, securelinkWaitingForPainter, securelinkPaymentReady, painterInvitedParticipant],
  MANY_TO_ONE: [groupSecurelinkActive, groupSecurelinkContributing],
  ONE_TO_MANY: [secureflowIdentitiesMissing, secureflowPlanSubmitted],
  MANY_TO_MANY: [groupSecureflowIdentitiesMissing, groupSecureflowLinkReady],
};
