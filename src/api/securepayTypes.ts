export interface SecurePayApiError {
  status: number;
  code?: string;
  message?: string;
}

export interface SecurePayResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  forbidden?: boolean;
  status?: number;
  errorCode?: string;
}

export interface SecurePayUser {
  ksNumber?: string;
  id?: string;
  email?: string;
  displayName?: string;
  phone?: string;
}

export interface SecurePayLoginChallenge {
  challengeToken: string;
  expiresAt: string;
  ksNumber: string;
}

export type SecurePaySignupChannelType = 'EMAIL' | 'SMS';

export interface SecurePaySignupChallenge {
  signupChallengeToken: string;
  expiresAt: string;
  maskedDestination: string;
  resendAvailableAt: string;
}

export interface SecurePaySession {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: SecurePayUser;
}

export interface SecurePayKSProfile {
  ksNumber: string;
  displayName: string;
  status: 'active' | 'inactive' | 'pending';
  type?: string;
  verified: boolean;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  products?: SecurePayProduct[];
}

export interface SecurePayProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
}

export interface SecurePaySecureLink {
  slug: string;
  title: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'funded' | 'released' | 'disputed' | 'cancelled' | 'completed';
  escrowStatus?: 'pending' | 'funded' | 'released' | 'disputed';
  paymentStatus?: 'pending' | 'initiated' | 'provider_confirmed' | 'paid' | 'partial' | 'failed' | 'reversed' | 'unknown';
  workflowStatus?: string;
  creatorName: string;
  counterpartName?: string;
  creatorId?: string;
  counterpartId?: string;
  createdAt: string;
  updatedAt?: string;
  releasedAt?: string;
  totalReleased?: number;
  autoReleaseTriggered?: boolean;
  buyerRespondedAt?: string;
  description?: string;
  terms?: string;
  evidence?: SecurePayEvidence[];
  [key: string]: unknown;
}

export interface SecurePaySecureLinkListItem {
  slug: string;
  title: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SecurePayGroupSecureLink extends SecurePaySecureLink {
  groupMembers?: SecurePayGroupMember[];
  totalContributed?: number;
  contributionGoal?: number;
}

export interface SecurePayGroupMember {
  id: string;
  name: string;
  role: 'organizer' | 'contributor';
  contributedAmount?: number;
  status: 'pending' | 'contributed' | 'declined';
}

export interface SecurePayPaymentReadiness {
  ready: boolean;
  reasons: string[];
  requirements: string[];
}

export interface SecurePayAccountReadiness {
  ready: boolean;
  missingSteps: string[];
  verified: boolean;
  ksActive: boolean;
}

export interface SecurePayActivity {
  id: string;
  type: string;
  description: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  status?: string;
}

export interface SecurePayEvidence {
  id: string;
  type: string;
  url?: string;
  description?: string;
  submittedAt: string;
  submittedBy?: string;
  status?: string;
}

export interface SecurePayHelpArticle {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  content?: string;
  updatedAt?: string;
}

export interface SecurePayKnowledgeDocument {
  id: string;
  title: string;
  category: string;
  content?: string;
  url?: string;
  updatedAt?: string;
}

export interface SecurePayActionTokenChallenge {
  challengeId: string;
  maskedContact?: string;
  status: 'CODE_SENT' | 'NOT_CONFIGURED' | 'ALREADY_VERIFIED';
  expiresIn?: number;
}

export interface SecurePayActionTokenVerify {
  actionToken: string;
  scope: string;
  expiresIn: number;
}

export interface SecurePayReleaseResponse {
  accepted: boolean;
  status: string;
}

// Agreement proposal read model from the pinned SecurePayAPI contract.
// publicReference is display-safe but is not a public sharing URL.
export interface SecurePayAgreement {
  id: string;
  publicReference: string;
  agreementType: string;
  title: string;
  purpose: string;
  description: string | null;
  currency: string | null;
  proposedAmountMinor: number | null;
  status: 'DRAFT' | 'PROPOSED' | 'INVITATION_PENDING' | 'PARTICIPANTS_JOINING' | 'CONFIRMATION_PENDING' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Exact subset used by the Phase 8D creator journey. Idempotency is a body
// field on this endpoint; the contract has no structured location,
// condition/evidence, milestone, payer, or recipient fields.
export interface CreateAgreementRequestBody {
  idempotencyKey: string;
  agreementType: string;
  title: string;
  purpose: string;
  description?: string;
  currency?: string;
  proposedAmountMinor?: number;
  saveAsDraft: boolean;
}

export interface IssueAgreementInvitationRequestBody {
  idempotencyKey: string;
  roleCode: string;
  intendedKsNumber?: string;
}

export interface SecurePayIssuedAgreementInvitation {
  invitationId: string;
  status: 'ISSUED' | 'VIEWED' | 'JOINED' | 'REVOKED' | 'EXPIRED';
  invitationToken: string | null;
  replayed: boolean;
}

export interface SecurePayAgreementParticipant {
  id: string;
  identityId: string | null;
  roleCode: string;
  participantStatus: 'CREATOR' | 'INVITED' | 'PENDING' | 'JOINED_UNCONFIRMED' | 'CONFIRMED';
  addedAt: string;
}

// Public invitation preview. The contract deliberately exposes neither the
// inviter's identity nor the intended KS Number, so the UI must describe the
// inviter as unavailable rather than infer a person.
export interface SecurePayInvitationView {
  publicReference: string;
  title: string;
  purpose: string;
  intendedRole: string;
  currency: string | null;
  proposedAmountMinor: number | null;
  invitationExpiresAt: string;
  proposalVersionNumber: number;
  notice: string;
}

export interface JoinAgreementRequestBody {
  idempotencyKey: string;
}

// Joining establishes participation only. Confirmation is a separate action.
export interface SecurePayJoinedAgreement {
  agreementId: string;
  publicReference: string;
  participantId: string;
  role: string;
  participantStatus: 'CREATOR' | 'INVITED' | 'PENDING' | 'JOINED_UNCONFIRMED' | 'CONFIRMED';
  joinedVersionId: string;
  joinedVersionNumber: number;
  confirmationRequired: boolean;
  joinedAt: string;
  notice: string;
}

export interface SecurePayAgreementVersion {
  id: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  contentHash: string;
  parentVersionId: string | null;
  amendmentReason: string | null;
  materialChange: boolean;
  versionStatus: 'CURRENT' | 'SUPERSEDED';
  createdAt: string;
}

export interface ConfirmAgreementVersionRequestBody {
  idempotencyKey: string;
  expectedVersionNumber: number;
  expectedContentHash: string;
}

export interface SecurePayAgreementConfirmation {
  id: string;
  agreementVersionId: string;
  participantId: string;
  versionNumber: number;
  versionContentHash: string;
  status: string;
  assuranceMethod: string;
  confirmedAt: string;
  confirmationCurrent: boolean;
  reconfirmationRequired: boolean;
}

export interface SecurePayAgreementActivity {
  id: string;
  activityType: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

// Self-only confirmation status for the authenticated participant.
export interface SecurePayAgreementConfirmationStatus {
  participantId: string;
  identityId: string;
  roleCode: string;
  participantStatus: string;
  confirmedVersionId: string | null;
  confirmedVersionNumber: number | null;
  currentVersionId: string;
  currentVersionNumber: number;
  confirmationCurrent: boolean;
  reconfirmationRequired: boolean;
}

// R1 — GET /agreements/{id}/participants/me/next-actions. Backend state
// determines next required actions; no payment or settlement claims.
export interface SecurePayParticipantNextAction {
  participantId: string;
  agreementId: string;
  currentAgreementVersionId: string;
  actionType: string;
  targetObligationId: string | null;
  actionReason: string;
  prerequisiteStatus: string | null;
  deadline: string | null;
  urgency: string;
  requiredEvidenceTypes: string[];
  blockedByObligationIds: string[];
  supportingEvidenceIds: string[];
}

export interface SecurePayParticipantNextActionsResponse {
  actions: SecurePayParticipantNextAction[];
}

// R1 — obligations, milestones, evidence (read), amendments (read).
// POST /agreements/{id}/versions/{versionId}/obligations. Monetary
// obligations describe required value movement; they do not move money.
export interface CreateAgreementObligationRequestBody {
  idempotencyKey: string;
  obligationType: 'MONETARY' | 'NON_MONETARY';
  title: string;
  description?: string;
  responsibleParticipantId: string;
  beneficiaryParticipantId?: string;
  currency?: string;
  amountMinor?: number;
  sequenceOrder?: number;
  prerequisiteObligationId?: string;
  dependencyReason?: string;
}

export type SecurePayAgreementObligationStatus =
  | 'PENDING' | 'BLOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'EVIDENCE_SUBMITTED'
  | 'COMPLETED' | 'REJECTED' | 'OVERDUE' | 'CANCELLED';

export interface SecurePayAgreementObligation {
  id: string;
  publicReference: string;
  agreementId: string;
  agreementVersionId: string;
  obligationType: string;
  title: string;
  description: string | null;
  responsibleParticipantId: string;
  beneficiaryParticipantId: string | null;
  currency: string | null;
  amountMinor: number | null;
  status: SecurePayAgreementObligationStatus;
  createdAt: string;
}

// POST /agreements/{id}/versions/{versionId}/milestones. No participant
// dependency — milestones may be structured before a counterparty exists.
export interface CreateAgreementMilestoneRequestBody {
  title: string;
  description?: string;
  sequenceOrder?: number;
  availableFrom?: string;
  dueAt?: string;
  obligationIds?: string[];
}

export interface SecurePayAgreementMilestone {
  id: string;
  agreementId: string;
  agreementVersionId: string;
  title: string;
  description: string | null;
  sequenceOrder: number | null;
  availableFrom: string | null;
  dueAt: string | null;
  status: string;
  createdAt: string;
}

// GET /agreements/{id}/obligations/{obligationId}/evidence — read; R2 adds
// submission (below).
export interface SecurePayAgreementEvidence {
  id: string;
  obligationId: string;
  evidenceType: string;
  description: string | null;
  contentType: string | null;
  status: string;
  submittedAt: string;
}

// R2 — obligation actions. POST .../obligations/{id}/start|complete send
// only an idempotencyKey; the backend enforces who may start (the
// responsible participant) and whether completion is currently eligible
// (verified directly against ObligationService.java — completion is
// rejected server-side with the unmet requirements if not eligible).
export interface StartObligationRequestBody {
  idempotencyKey: string;
}

export interface CompleteObligationRequestBody {
  idempotencyKey: string;
}

// GET .../obligations/{id}/completion-status — read-only eligibility
// projection; the frontend never computes this locally.
export interface SecurePayObligationCompletionStatus {
  eligible: boolean;
  currentStatus: string;
  unmetRequirements: string[];
  satisfiedRequirements: string[];
  evidenceIds: string[];
  explanationCodes: string[];
}

// R2 — POST .../obligations/{id}/evidence. objectReference/contentHash are
// required by the backend but there is no file-storage/upload endpoint for
// ordinary obligation evidence (only Agreement Review case evidence has a
// multipart upload contract — see SecurePayReviewEvidence below). This is
// therefore a reference submission (a link, receipt number, or delivery
// note the trader already holds elsewhere), never a fabricated file
// upload. evidenceType is the exact closed backend enum
// (ke.securepay.agreement.evidence.model.EvidenceType, verified directly
// against source).
export type SecurePayEvidenceType =
  | 'DOCUMENT' | 'IMAGE' | 'VIDEO_REFERENCE' | 'RECEIPT' | 'DELIVERY_NOTE'
  | 'ATTENDANCE_RECORD' | 'LOCATION_CLAIM' | 'TEXT_STATEMENT' | 'OTHER';

export interface SubmitAgreementEvidenceRequestBody {
  idempotencyKey: string;
  evidenceType: SecurePayEvidenceType;
  description?: string;
  objectReference: string;
  contentHash: string;
  source: string;
  capturedAt?: string;
  contentType?: string;
  originalFilename?: string;
  sizeBytes?: number;
  supersedesEvidenceId?: string;
}

// R2 — POST /agreements/{id}/evidence/{evidenceId}/review. decision is the
// exact closed backend enum (EvidenceReviewDecision, verified directly
// against the OpenAPI schema and EvidenceService.java, which also
// prohibits self-review server-side).
export type SecurePayEvidenceReviewDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFORMATION';

export interface ReviewAgreementEvidenceRequestBody {
  idempotencyKey: string;
  decision: SecurePayEvidenceReviewDecision;
  reason?: string;
}

// R2 — formal Agreement Review handoff. Read (list) and open only — no
// acknowledge/respond/evidence-submit/escalate UI is built (that is
// Resolution Room functionality, explicitly out of R2 scope). subjectType
// and openReasonCode are exact closed backend enums
// (AgreementReviewSubjectType, AgreementReviewOpenReasonCode, verified
// directly against ke.securepay.agreement.review.domain source).
export type SecurePayAgreementReviewSubjectType =
  | 'AGREEMENT' | 'AGREEMENT_VERSION' | 'OBLIGATION' | 'DISTRIBUTION_OBLIGATION'
  | 'ALLOCATION' | 'EVIDENCE_ITEM' | 'RELEASE_INSTRUCTION' | 'SECUREPROMPT_DECISION';

export type SecurePayAgreementReviewOpenReasonCode =
  | 'PARTICIPANT_DISPUTE_OBLIGATION' | 'PARTICIPANT_DISPUTE_EVIDENCE'
  | 'PARTICIPANT_DISPUTE_RELEASE_REQUIREMENT' | 'PARTICIPANT_DISPUTE_CONDITION';

// Unlike agreement/obligation/evidence mutations, this endpoint family takes
// idempotency via the Idempotency-Key HEADER, not a body field (verified
// against the OpenAPI parameters block) — passed separately by the caller.
export interface OpenAgreementReviewCaseRequestBody {
  agreementId: string;
  agreementVersionId: string;
  subjectType: SecurePayAgreementReviewSubjectType;
  subjectId: string;
  openReasonCode: SecurePayAgreementReviewOpenReasonCode;
  narrativeContext?: string;
}

export interface SecurePayAgreementReviewOpenCaseResponse {
  reviewCaseId: string;
  agreementId: string;
  agreementVersionId: string;
  state: string;
  subjectType: string;
  subjectId: string;
  openedAt: string;
  version: number;
  idempotentReplay: boolean;
}

export interface SecurePayAgreementReviewCaseSummary {
  reviewCaseId: string;
  agreementId: string;
  agreementVersionId: string;
  subjectType: string;
  subjectId: string;
  callerRole: string | null;
  state: string;
  openedAt: string;
  responseDeadlineAt: string | null;
  evidenceDeadlineAt: string | null;
  terminalOutcome: string | null;
  version: number;
}

export interface SecurePayAgreementReviewCaseListResponse {
  items: SecurePayAgreementReviewCaseSummary[];
  page: number;
  size: number;
  totalElements: number;
}

// R5 — GET /agreement-reviews/{reviewCaseId}?agreementId=. Participant-safe
// case detail: adds decisionReasonCode and the caller's own
// acknowledged/responded booleans over the list summary. Never exposes
// reviewer/assignment identity or operational notes — those live only on
// the separate /operations/agreement-reviews/* surface, never reused here.
export interface SecurePayAgreementReviewCaseDetail {
  reviewCaseId: string;
  agreementId: string;
  agreementVersionId: string;
  subjectType: string;
  subjectId: string;
  callerRole: string;
  state: string;
  openedAt: string;
  responseDeadlineAt: string | null;
  evidenceDeadlineAt: string | null;
  terminalOutcome: string | null;
  decisionReasonCode: string | null;
  callerAcknowledged: boolean;
  callerResponded: boolean;
  version: number;
}

// POST /agreement-reviews/{reviewCaseId}/acknowledgements. expectedVersion
// is optimistic-concurrency — always the exact version from the most
// recently read case state, never invented.
export interface AcknowledgeAgreementReviewCaseRequestBody {
  agreementId: string;
  expectedVersion: number;
}

// R5 — closed backend enum (ke.securepay.agreement.review.domain
// .AgreementReviewResponseType, verified directly against source).
export type SecurePayAgreementReviewResponseType =
  'ACKNOWLEDGEMENT' | 'DISPUTE_POSITION' | 'CLARIFICATION' | 'PARTIAL_ADMISSION';

// POST /agreement-reviews/{reviewCaseId}/responses. There is no participant
// read for other parties' response narrative text — only whether the
// caller themselves has responded (SecurePayAgreementReviewCaseDetail
// .callerResponded); see the R5 gap register entry for this retained gap.
export interface SubmitAgreementReviewResponseRequestBody {
  agreementId: string;
  expectedVersion: number;
  responseType: SecurePayAgreementReviewResponseType;
  narrative?: string;
  supersedesResponseId?: string;
}

// POST /agreement-reviews/{reviewCaseId}/escalations — intent only; the
// case's own state after submission is the only truth, never a
// client-invented "escalated" label.
export interface RequestAgreementReviewEscalationRequestBody {
  agreementId: string;
  expectedVersion: number;
}

// Shared response shape for acknowledge/respond/escalate (all idempotent
// participant actions on a case).
export interface SecurePayAgreementReviewActionResponse {
  reviewCaseId: string;
  state: string;
  version: number;
  idempotentReplay: boolean;
  responseId: string | null;
  responseType: string | null;
  acknowledgedAt: string | null;
  submittedAt: string | null;
  slice8DecisionDeferred: boolean | null;
}

// R5 — closed backend enum (ke.securepay.agreement.review.domain
// .AgreementReviewEvidenceType, verified directly against source).
// Deliberately distinct from ordinary obligation evidence's
// SecurePayEvidenceType — Agreement Review evidence has its own real
// multipart file-upload contract (unlike obligation evidence, which is
// reference-only), so this is a genuine file upload, not a reference.
export type SecurePayAgreementReviewEvidenceType =
  | 'DOCUMENT' | 'IMAGE' | 'RECEIPT' | 'DELIVERY_RECORD' | 'AGREEMENT_RECORD'
  | 'COMMUNICATION' | 'IDENTITY_CONFIRMATION' | 'LOCATION_CONFIRMATION' | 'OTHER';

export interface SecurePayAgreementReviewEvidenceItem {
  evidenceId: string;
  evidenceType: string;
  originalFilename: string;
  mediaType: string;
  contentLength: number;
  submittedAt: string;
  // Server-computed against the caller's own identity — never inferred
  // client-side.
  submittedByCaller: boolean;
}

export interface SecurePayAgreementReviewEvidenceListResponse {
  items: SecurePayAgreementReviewEvidenceItem[];
}

// GET /agreements/{id}/amendments — read only in R1; ProposeAgreementAmendmentRequest's
// proposedTerms is an untyped free-form object with no documented amendable-field
// contract, so R1 does not build a "propose amendment" UI (see gap register).
export type SecurePayAgreementAmendmentStatus =
  | 'PROPOSED' | 'APPLIED' | 'WITHDRAWN' | 'REJECTED' | 'SUPERSEDED';

export interface SecurePayAgreementAmendment {
  id: string;
  sourceVersionId: string;
  proposedTerms: Record<string, unknown>;
  reason: string | null;
  status: SecurePayAgreementAmendmentStatus;
  appliedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

// R0.5 GET /api/v1/me/agreements — participant-safe, current-user agreement
// workspace projection (CurrentUserAgreementWorkspaceController). Ambiguous
// role or multi-party counterparty is null; there is no client-side
// inference from creator, timestamps, or status.
export interface CurrentUserAgreementActor {
  roleCode: string;
  participantStatus: 'CREATOR' | 'JOINED_UNCONFIRMED' | 'CONFIRMED';
}

export interface SafeAgreementCounterparty {
  ksNumber: string;
  displayName: string;
}

export interface WorkspaceNextAction {
  actionCode: string;
  category: string;
  reason: string;
  deadline: string | null;
  attentionClass: string;
}

export interface CurrentUserAgreementSummary {
  agreementId: string;
  publicReference: string;
  title: string;
  purpose: string | null;
  status: string;
  agreementType: string;
  // Lossless base-10 minor-unit amount from the agreement proposal; never
  // evaluated financial truth, Payment Ready, released, or settled.
  proposedAmountMinor: string | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
  currentActor: CurrentUserAgreementActor | null;
  counterparty: SafeAgreementCounterparty | null;
  nextDeadline: string | null;
  // True only when an authoritative next action has HIGH urgency.
  attentionRequired: boolean;
  nextActions: WorkspaceNextAction[];
  currentAgreementVersionId: string | null;
}

export interface CurrentUserAgreementListResponse {
  items: CurrentUserAgreementSummary[];
  page: number;
  size: number;
  totalElements: number;
}

// R0.5 GET /api/v1/me/actions — flattens the same safe nextActions collection
// returned within /me/agreements; the backend computes no second, priority
// model and the frontend must not invent one either.
export interface CurrentUserAction {
  agreementId: string;
  agreementReference: string;
  agreementTitle: string;
  actionCode: string;
  category: string;
  reason: string;
  deadline: string | null;
  attentionClass: string;
}

export interface CurrentUserActionListResponse {
  items: CurrentUserAction[];
  page: number;
  size: number;
  totalElements: number;
}

export type SecurePayPaymentReadyStatus = 'READY' | 'NOT_READY' | 'PARTIALLY_READY' | 'BLOCKED';

export interface SecurePayAgreementMoneyOutstandingReason {
  gateCode: string;
  reasonCode: string;
}

// GET /api/v1/agreements/{agreementId}/money-status — participant-safe,
// read-only projection. Deliberately contains none of the evaluator, ledger,
// payment-intent, release, settlement, destination, product, or scope IDs
// except (R4.5) evaluationId — the one identifier the release-request
// contract itself requires a participant-safe read to expose.
export interface SecurePayAgreementMoneyStatus {
  agreementId: string;
  agreementCurrency: string;
  proposedAmountMinor: number | null;
  evaluatedCurrency: string;
  evaluatedAmountMinor: number;
  paymentReady: boolean;
  paymentReadyStatus: SecurePayPaymentReadyStatus;
  outstandingReasons: SecurePayAgreementMoneyOutstandingReason[];
  evaluatedAt: string;
  // R4.5. The current Payment Ready evaluation's own id. Never rendered as a
  // raw UUID in the UI — used only internally to request release.
  evaluationId: string | null;
}

// GET /api/v1/agreements/{agreementId}/money-records — participant-safe,
// read-only facts. RELEASE_INSTRUCTION_CREATED proves instruction creation
// only; FUNDING_PAYMENT_INTENT (R3.5) proves an agreement-bound payment
// intent's own current status only. Neither is proof of payment, funding,
// reservation, execution, payout, settlement, or receipt. No internal
// identifier or customer/provider reference is exposed.
export interface SecurePayAgreementMoneyRecord {
  // OpenAPI currently enumerates RELEASE_INSTRUCTION_CREATED and (R3.5)
  // FUNDING_PAYMENT_INTENT. Keep the transport field open so a future server
  // value reaches the runtime safety mapping instead of being falsely
  // treated as today's known semantic state.
  recordType: string;
  occurredAt: string;
  // INSTRUCTION_CREATED for RELEASE_INSTRUCTION_CREATED records. For
  // FUNDING_PAYMENT_INTENT records (R3.5) this is the payment intent's own
  // status value (see SecurePayAgreementPaymentIntentStatus below); unknown
  // future values are deliberately rendered generically by Agreement Detail.
  status: string;
  currency: string;
  amountMinor: string;
}

// R3.5 — GET /agreements/{agreementId}/participants/me/funding-authority.
// Fail-closed, participant-safe projection. authorized is derived
// exclusively from the agreement's own persisted MONETARY obligation
// (responsibleParticipantId) — never from creator identity, participant
// ordering, or roleCode text. AUTHORIZED is the only reasonCode that
// accompanies authorized: true.
export type SecurePayAgreementFundingAuthorityReasonCode =
  | 'AUTHORIZED' | 'NOT_PARTICIPANT' | 'IDENTITY_INACTIVE' | 'PARTICIPANT_NOT_CONFIRMED'
  | 'NOT_PAYER_FOR_AGREEMENT' | 'NO_MONETARY_OBLIGATION'
  | 'MULTIPLE_MONETARY_OBLIGATIONS_AMBIGUOUS' | 'OBLIGATION_NOT_AVAILABLE';

export interface SecurePayAgreementFundingAuthority {
  authorized: boolean;
  reasonCode: SecurePayAgreementFundingAuthorityReasonCode;
}

export type SecurePayAgreementPaymentIntentStatus =
  | 'CREATED' | 'INITIATION_PENDING' | 'ACTION_REQUIRED' | 'PROVIDER_PENDING'
  | 'CONFIRMATION_PENDING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

// R3.5 — POST /agreements/{agreementId}/payment-intents. Deliberately
// excludes amount, currency, payer, recipient, and account fields — all are
// server-derived from the agreement's own MONETARY obligation.
export interface CreateAgreementPaymentIntentRequestBody {
  idempotencyKey: string;
  externalReference?: string;
}

export interface SecurePayAgreementPaymentIntentCreateResponse {
  paymentIntentId: string;
  agreementId: string;
  obligationId: string;
  amountMinor: number;
  currency: string;
  status: SecurePayAgreementPaymentIntentStatus;
  createdAt: string;
  replayed: boolean;
}

// R3.5 — GET /agreements/{agreementId}/payment-intents. Refresh-safe
// discovery: visible to any current participant with agreement read access
// (same boundary as .../money-status). Destination/account internals stay
// behind the existing owner-only GET /payment-intents/{id}, not reused here.
export type SecurePayAgreementPaymentIntentLatestAttemptStatus =
  'SUBMITTED' | 'ACCEPTED' | 'ACTION_REQUIRED' | 'REJECTED' | 'FAILED';

export interface SecurePayAgreementPaymentIntentSummary {
  id: string;
  status: SecurePayAgreementPaymentIntentStatus;
  amountMinor: number;
  currency: string;
  latestAttemptStatus: SecurePayAgreementPaymentIntentLatestAttemptStatus | null;
  // This exact intent reached a terminal, unsuccessful state. Retry means
  // creating a new agreement-bound payment intent — the state machine never
  // allows re-initiating this same intent.
  retryEligible: boolean;
  createdAt: string;
  lastStateChangeAt: string;
}

export interface SecurePayAgreementPaymentIntentListResponse {
  items: SecurePayAgreementPaymentIntentSummary[];
  page: number;
  size: number;
  totalElements: number;
}

// R3.5 — the two known inbound-collection rails. Deliberately not the full
// provider enum; funding-options/funding-quotes only ever return these.
export type SecurePayAgreementFundingRailCode = 'MPESA_STK' | 'PESALINK';

// GET /agreements/{agreementId}/funding-options — only rails currently
// eligible, never the full provider registry. Empty (not an error) when
// funding authority is not AUTHORIZED.
export interface SecurePayAgreementFundingOption {
  railCode: SecurePayAgreementFundingRailCode;
  displayName: string;
  currency: string;
  minimumAmountMinor: number | null;
  maximumAmountMinor: number | null;
  // false for rails whose adapter does not implement quoting yet (currently
  // MPESA_STK) — proceed straight to initiation for those.
  quoteAvailable: boolean;
}

export interface SecurePayAgreementFundingOptionListResponse {
  items: SecurePayAgreementFundingOption[];
}

// POST /agreements/{agreementId}/funding-quotes — railCode only; amount and
// currency are always server-derived from the obligation.
export interface CreateAgreementFundingQuoteRequestBody {
  railCode: SecurePayAgreementFundingRailCode;
}

// platformChargeMinor is currently always 0 on this backend — a documented,
// current gap (CommercialRulesEngine has no ordinary-agreement platform fee
// model yet), not a permanent "SecurePay charges nothing" doctrine
// statement. Never replace it with a locally computed or remembered fee.
export interface SecurePayAgreementFundingQuote {
  quoteReference: string;
  agreementId: string;
  railCode: SecurePayAgreementFundingRailCode;
  amountMinor: number;
  currency: string;
  providerChargeMinor: number;
  platformChargeMinor: number;
  totalChargeMinor: number;
  expiresAt: string;
}

// POST /payment-intents/{paymentIntentId}/initiate (existing endpoint).
// providerIdentifier is the exact closed rail enum. quoteReference is R3.5
// additive and only meaningful when the target intent is agreement-bound —
// required for rails that support quoting (currently PESALINK) at
// initiation, ignored otherwise.
export interface InitiatePaymentRequestBody {
  idempotencyKey: string;
  providerIdentifier: SecurePayAgreementFundingRailCode;
  quoteReference?: string;
}

export type SecurePayRailPaymentAttemptState =
  | 'CREATED' | 'INITIATION_CLAIMED' | 'PROVIDER_ACCEPTED' | 'CUSTOMER_ACTION_PENDING'
  | 'PAYMENT_CONFIRMED' | 'PAYMENT_REJECTED' | 'CANCELLED' | 'TIMED_OUT_UNRESOLVED'
  | 'QUERY_PENDING' | 'RECONCILIATION_REQUIRED' | 'REVERSED' | 'FAILED_FINAL';

export interface SecurePayInitiatePaymentResponse {
  paymentIntentId: string;
  status: string;
  attemptId: string;
  providerIdentifier: string;
  initiationStatus: string;
  redirectUrl: string | null;
  replayed: boolean;
  metadata?: {
    masked_msisdn?: string;
    checkout_request_id?: string | null;
    attempt_state?: SecurePayRailPaymentAttemptState;
  };
}

// R4.5 — GET /agreements/{agreementId}/participants/me/release-authority.
// Fail-closed, participant-safe projection composing the current Payment
// Ready evaluation (must be READY) with the existing release-authorization
// domain rule (the agreement's active payer, never creator alone) — never
// reimplemented client-side.
export type SecurePayReleaseAuthorityReasonCode =
  | 'AUTHORIZED' | 'NO_CURRENT_EVALUATION' | 'PAYMENT_READY_NOT_SATISFIED'
  | 'AGREEMENT_NOT_ELIGIBLE' | 'NOT_AUTHORIZED' | 'RELEASE_ALREADY_REQUESTED';

export interface SecurePayAgreementReleaseAuthority {
  authorized: boolean;
  reasonCode: SecurePayReleaseAuthorityReasonCode;
  // Populated only when authorized is true; the id to supply to
  // POST .../payment-release/instructions. Never rendered as a raw UUID.
  evaluationId: string | null;
}

// GET /payment-ready/agreements/{agreementId}/evaluation — read only to
// obtain the current evaluation's sequence number for release creation
// (neither money-status nor release-authority expose it); never used to
// compute Payment Ready locally.
export interface SecurePayPaymentReadyEvaluation {
  outcome: string;
  satisfiedGates: string[];
  outstandingGates: SecurePayAgreementMoneyOutstandingReason[];
  agreementVersionEvaluated: string;
  evaluatedAt: string;
  sequence: number;
}

// POST /agreements/{agreementId}/payment-release/instructions. Idempotency
// travels via the Idempotency-Key header (verified against the OpenAPI
// parameters block), not a body field — same convention as Agreement
// Review. Pricing, settlement destination, and recipient are all resolved
// server-side from the agreement's own MONETARY obligation.
export interface CreatePaymentReleaseInstructionRequestBody {
  paymentReadyEvaluationId: string;
  paymentReadyEvaluationSequence: number;
  triggerReason: string;
}

export interface SecurePayPaymentReleaseInstruction {
  instructionId: string;
  paymentReadyEvaluationId: string;
  paymentReadyEvaluationSequence: number;
  productType: string;
  agreementId: string;
  agreementVersion: string;
  scopeIdentifiers: string[];
  recipientKsNumber: string;
  pricingSnapshotId: string;
  settlementDestinationId: string;
  settlementDestinationMaskedDisplay: string;
  sequence: number;
  createdAt: string;
}

// GET .../instructions/{instructionId}/settlement-status — terminal and
// non-terminal phases for UI polling; distinct states, never flattened.
export type SecurePayPaymentReleaseSettlementPhase =
  'INSTRUCTION_CREATED' | 'RESERVED' | 'SETTLED' | 'HELD_EXCEPTION' | 'COMPENSATED';

export type SecurePayPaymentReleaseExceptionRequiredAction =
  'NO_ACTION_REQUIRED' | 'OPERATIONS_REVIEW' | 'USER_ACTION';

// GET .../instructions/{instructionId}/exception — participant-safe held/
// compensated exception projection. Embedded inline on
// SecurePayPaymentReleaseSettlementStatus.exception when relevant, so this
// shape is read from there rather than a separate round-trip.
export interface SecurePayPaymentReleaseExceptionProjection {
  exceptionId: string;
  instructionId: string;
  exceptionType: 'HELD_EXCEPTION' | 'COMPENSATED';
  customerSafeReason: string;
  requiredAction: SecurePayPaymentReleaseExceptionRequiredAction;
  recordedAt: string;
  compensatedOutcome: boolean;
}

export interface SecurePayPaymentReleaseSettlementStatus {
  instructionId: string;
  settlementPhase: SecurePayPaymentReleaseSettlementPhase;
  reservationId: string | null;
  executionId: string | null;
  exception: SecurePayPaymentReleaseExceptionProjection | null;
  settledAt: string | null;
}

export interface SecurePayPublicGroupOrganizer {
  roleLabel: string;
  roleCode: string;
}

export interface SecurePayPublicGroupSecureLink {
  groupType: string;
  title: string;
  statedPurpose: string;
  targetType: string;
  targetAmountMinor: number | null;
  currency: string;
  contributionDeadline: string | null;
  status: string;
  organizers: SecurePayPublicGroupOrganizer[];
  // Recorded values are pledges/intents only. They are never presented as money received.
  recordedContributionCount: number;
  recordedContributionTotalMinor: number;
  // Confirmed values are backed by backend-observed payment-intent state.
  confirmedContributionCount: number;
  confirmedContributionTotalMinor: number;
  contributionInstructions: string;
  governanceSummary: string;
}

// POST/GET /api/v1/agreements/{agreementId}/group-securelink. Creation has
// no idempotency field/header in the current backend contract.
export interface CreateGroupSecureLinkRequestBody {
  groupType: 'WELFARE' | 'GENERAL';
  title: string;
  statedPurpose: string;
  targetType: 'FIXED_AMOUNT' | 'OPEN_ENDED';
  targetAmountMinor?: number;
  minimumContributionMinor?: number;
  maximumContributionMinor?: number;
  contributionDeadline?: string;
  expiresAt?: string;
  visibility?: string;
  contributorDisplayPolicy?: string;
}

export interface SecurePayCreateGroupSecureLinkResponse {
  groupSecureLinkId: string;
  status: string;
  primaryOrganizerId: string;
  replayed: boolean;
}

export interface SecurePayGroupOrganizerAssignment {
  id: string;
  organizerIdentityId: string;
  organizerRole: string;
  authorityScope: string;
  status: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
}

export interface SecurePayGroupGovernancePolicy {
  id: string;
  governedActionType: string;
  minimumApprovalCount: number;
  quorumPercentage: number | null;
  rejectionTerminal: boolean;
  approvalExpiryHours: number | null;
  makerCheckerRequired: boolean;
  status: string;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
}

export interface SecurePayPrivateGroupSecureLink {
  id: string;
  agreementId: string;
  agreementReference: string;
  groupType: string;
  title: string;
  statedPurpose: string;
  targetType: string;
  targetAmountMinor: number | null;
  currency: string;
  minimumContributionMinor: number | null;
  maximumContributionMinor: number | null;
  contributionDeadline: string | null;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
  organizers: SecurePayGroupOrganizerAssignment[];
  governancePolicies: SecurePayGroupGovernancePolicy[];
  recordedContributionCount: number;
  recordedContributionTotalMinor: number;
  confirmedContributionCount: number;
  confirmedContributionTotalMinor: number;
  pendingContributionCount: number;
  pendingContributionTotalMinor: number;
}

// GET /api/v1/agreements/{agreementId}/group-securelink/capabilities.
// This is point-in-time UI guidance only; every mutation re-authorizes.
export interface SecurePayGroupSecureLinkCapabilities {
  canActivate: boolean;
  canCancel: boolean;
  canManageOrganizers: boolean;
  canManageGovernance: boolean;
  canCreateApprovalRequest: boolean;
  canDecideApproval: boolean;
  canRecordContributionIntent: boolean;
  canReadOwnContribution: boolean;
  canManagePublicLocator: boolean;
  activation: {
    allowedNow: boolean;
    blockingReasonCodes: string[];
  };
}

export interface SecurePayActivateGroupSecureLinkResponse {
  groupSecureLinkId: string;
  status: string;
  replayed: boolean;
}

export interface CancelGroupSecureLinkRequestBody {
  idempotencyKey: string;
  reason?: string;
}

export interface SecurePayCancelGroupSecureLinkResponse {
  groupSecureLinkId: string;
  status: string;
  cancelledAt: string;
  replayed: boolean;
}

export type SecurePayContributionStatus =
  | 'RECORDED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface SecurePayCurrentUserContribution {
  contributionRecordId: string;
  status: SecurePayContributionStatus;
  amountMinor: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  expiredAt: string | null;
  paymentIntentLinked: boolean;
}

export interface SecurePayCurrentUserContributionPage {
  items: SecurePayCurrentUserContribution[];
  page: number;
  size: number;
  totalElements: number;
}

export interface RecordGroupContributionIntentRequestBody {
  idempotencyKey: string;
  intendedAmountMinor: number;
}

export interface SecurePayRecordGroupContributionIntentResponse {
  contributorRecordId: string;
  contributorReference: string;
  status: 'RECORDED';
  replayed: boolean;
}

// GET /api/v1/identities/by-ksnumber/{canonicalKsNumber}. Used only to
// resolve a KS number to an identity id before appointing an organizer.
export interface SecurePayRetrievedIdentity {
  identityId: string;
  canonicalKsNumber: string;
  sequenceNumber: number;
  identityType: string;
  status: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

// POST /api/v1/agreements/{agreementId}/group-securelink/organizers.
// No idempotency field/header in the current backend contract; duplicate
// submission is guarded client-side only.
export interface AppointGroupOrganizerRequestBody {
  organizerIdentityId: string;
  organizerRole: 'PRIMARY_ORGANIZER' | 'ORGANIZER' | 'APPROVER' | 'AUDITOR';
  authorityScope: 'MANAGE' | 'APPROVE' | 'VIEW';
}

export interface SecurePayAppointGroupOrganizerResponse {
  organizerId: string;
  organizerRole: string;
  status: string;
  replayed: boolean;
}

// POST .../organizers/{organizerId}/revocation.
export interface RevokeGroupOrganizerRequestBody {
  idempotencyKey: string;
  reason?: string;
}

export interface SecurePayRevokeGroupOrganizerResponse {
  organizerId: string;
  status: string;
  effectiveUntil: string | null;
  replayed: boolean;
}

// POST .../contributors/{contributorId}/cancellation. Self-cancel an
// unlinked RECORDED pledge only.
export interface CancelGroupContributorRequestBody {
  idempotencyKey: string;
}

export interface SecurePayGroupContributorDetail {
  contributorRecordId: string;
  status: SecurePayContributionStatus;
  amountMinor: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  expiredAt: string | null;
  paymentIntentLinked: boolean;
}

// POST .../governance/policies. No idempotency field/header in the current
// backend contract; duplicate submission is guarded client-side only.
//
// governedActionType is the real backend enum (ke.securepay.agreement.group.model
// .GovernedActionType), verified directly against source and against the strict
// GovernedActionType.valueOf(...) parsing in GroupSecureLinkResponseMapper that
// the createPolicy controller method actually reaches. The OpenAPI spec's
// CreateGovernancePolicyRequest schema documents a stale, narrower, differently
// -spelled 4-value enum (PROPOSE_RELEASE, EXTEND_DEADLINE, CHANGE_ORGANIZER,
// CANCEL_GROUP) that does not match this real enum — CHANGE_ORGANIZER and
// CANCEL_GROUP are not valid Java constants and would fail valueOf(...) if
// submitted. Confirmed backend contract/spec discrepancy; tracked for R7.5
// backend cleanup, not fixed here. Use only the real values below.
export interface CreateGovernancePolicyRequestBody {
  governedActionType:
    | 'PROPOSE_RELEASE'
    | 'CHANGE_ORGANIZERS'
    | 'CHANGE_GOVERNANCE'
    | 'CANCEL_GROUP_SECURELINK'
    | 'EXTEND_DEADLINE'
    | 'APPROVE_DISTRIBUTION_PLAN';
  minimumApprovalCount: number;
  quorumPercentage?: number;
  approvalExpiryHours?: number;
  makerCheckerRequired?: boolean;
  approverIdentityIds: string[];
}

export interface SecurePayCreateGovernancePolicyResponse {
  policyId: string;
  governedActionType: string;
  status: string;
  replayed: boolean;
}

// POST .../governance/policies/{policyId}/activation. No request body.
export interface SecurePayActivateGovernancePolicyResponse {
  policyId: string;
  status: string;
  replayed: boolean;
}

// POST .../public-locators. slug is returned once at issuance and cannot be
// re-fetched afterward (only a digest is stored server-side).
export interface IssueGroupPublicLocatorRequestBody {
  idempotencyKey: string;
}

export interface SecurePayIssueGroupPublicLocator {
  locatorId: string;
  pathClass: string;
  status: string;
  slug: string;
  replayed: boolean;
}
