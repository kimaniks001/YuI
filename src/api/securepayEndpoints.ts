import type {
  SecurePayResult,
  SecurePaySecureLink,
  SecurePaySecureLinkListItem,
  SecurePayKSProfile,
  SecurePayPaymentReadiness,
  SecurePayAccountReadiness,
  SecurePayActivity,
  SecurePayEvidence,
  SecurePayHelpArticle,
  SecurePayKnowledgeDocument,
  SecurePayGroupSecureLink,
  SecurePayActionTokenChallenge,
  SecurePayActionTokenVerify,
  SecurePayReleaseResponse,
  SecurePayUser,
  SecurePaySession,
  SecurePayAgreement,
  CreateAgreementRequestBody,
  IssueAgreementInvitationRequestBody,
  SecurePayIssuedAgreementInvitation,
  SecurePayAgreementParticipant,
  SecurePayInvitationView,
  JoinAgreementRequestBody,
  SecurePayJoinedAgreement,
  SecurePayAgreementVersion,
  ConfirmAgreementVersionRequestBody,
  SecurePayAgreementConfirmation,
  SecurePayAgreementActivity,
  SecurePayAgreementConfirmationStatus,
  SecurePayAgreementMoneyStatus,
  SecurePayAgreementMoneyRecord,
  SecurePayPublicGroupSecureLink,
  SecurePayPrivateGroupSecureLink,
  SecurePayCreateGroupSecureLinkResponse,
  CreateGroupSecureLinkRequestBody,
  SecurePayGroupSecureLinkCapabilities,
  SecurePayActivateGroupSecureLinkResponse,
  CancelGroupSecureLinkRequestBody,
  SecurePayCancelGroupSecureLinkResponse,
  SecurePayCurrentUserContributionPage,
  RecordGroupContributionIntentRequestBody,
  SecurePayRecordGroupContributionIntentResponse,
  SecurePayRetrievedIdentity,
  AppointGroupOrganizerRequestBody,
  SecurePayAppointGroupOrganizerResponse,
  RevokeGroupOrganizerRequestBody,
  SecurePayRevokeGroupOrganizerResponse,
  CancelGroupContributorRequestBody,
  SecurePayGroupContributorDetail,
  CreateGovernancePolicyRequestBody,
  SecurePayCreateGovernancePolicyResponse,
  SecurePayActivateGovernancePolicyResponse,
  IssueGroupPublicLocatorRequestBody,
  SecurePayIssueGroupPublicLocator,
  CurrentUserAgreementListResponse,
  CurrentUserActionListResponse,
  SecurePayParticipantNextActionsResponse,
  CreateAgreementObligationRequestBody,
  SecurePayAgreementObligation,
  CreateAgreementMilestoneRequestBody,
  SecurePayAgreementMilestone,
  SecurePayAgreementEvidence,
  SecurePayAgreementAmendment,
  StartObligationRequestBody,
  CompleteObligationRequestBody,
  SecurePayObligationCompletionStatus,
  SubmitAgreementEvidenceRequestBody,
  ReviewAgreementEvidenceRequestBody,
  OpenAgreementReviewCaseRequestBody,
  SecurePayAgreementReviewOpenCaseResponse,
  SecurePayAgreementReviewCaseListResponse,
  SecurePayAgreementFundingAuthority,
  CreateAgreementPaymentIntentRequestBody,
  SecurePayAgreementPaymentIntentCreateResponse,
  SecurePayAgreementPaymentIntentListResponse,
  SecurePayAgreementFundingOptionListResponse,
  CreateAgreementFundingQuoteRequestBody,
  SecurePayAgreementFundingQuote,
  InitiatePaymentRequestBody,
  SecurePayInitiatePaymentResponse,
  SecurePayAgreementReleaseAuthority,
  SecurePayPaymentReleaseInstruction,
  SecurePayPaymentReadyEvaluation,
  CreatePaymentReleaseInstructionRequestBody,
  SecurePayPaymentReleaseSettlementStatus,
  SecurePayAgreementReviewCaseDetail,
  AcknowledgeAgreementReviewCaseRequestBody,
  SubmitAgreementReviewResponseRequestBody,
  RequestAgreementReviewEscalationRequestBody,
  SecurePayAgreementReviewActionResponse,
  SecurePayAgreementReviewEvidenceListResponse,
  SecurePayAgreementReviewEvidenceItem,
} from './securepayTypes';
import { securePayFetch } from './securepayClient';
import {
  SECUREPAY_ENABLE_RELEASE_ACTIONS,
  RELEASE_DISABLED_MESSAGE,
} from './securepayConfig';
import { securePayIsConfigured } from './securepayAuth';

export { securePayIsConfigured };

// ═══════════════════════════════════════════════════════════════
// ENDPOINT CATALOG — Confirmed from service-level OpenAPI specs
// Specs: https://securepay.ke/docs/{service}/api-docs (11 services)
// See docs/SECUREPAY_SWAGGER_CONFIRMATION_REPORT.md for full details
// ═══════════════════════════════════════════════════════════════

// Confirmed safe read endpoints (verified in OpenAPI specs)
export const confirmedReadEndpoints = [
  // Auth
  'GET /api/v1/auth/jwks',
  // Users
  'GET /api/v1/users/me',
  'GET /api/v1/users/me/sme-account',
  'GET /api/v1/users/me/products',
  'GET /api/v1/users/me/collector-profile',
  'GET /api/v1/users/me/trader-dashboard',
  'GET /api/v1/users/me/account-details',
  'GET /api/v1/users/me/activation/pay/{paymentId}/status',
  'GET /api/v1/users/public/ks/{ksNumber}',
  'GET /api/v1/users/by-ks/{ksNumber}',
  // Agreements — R0.5 current-user workspace projections
  'GET /api/v1/me/agreements',
  'GET /api/v1/me/actions',
  // Agreements — R1 obligations/milestones/evidence/amendments/next-actions
  'GET /api/v1/agreements/{agreementId}/obligations',
  'GET /api/v1/agreements/{agreementId}/milestones',
  'GET /api/v1/agreements/{agreementId}/obligations/{obligationId}/evidence',
  'GET /api/v1/agreements/{agreementId}/amendments',
  'GET /api/v1/agreements/{agreementId}/participants/me/next-actions',
  // Agreements — R2 obligation actions, evidence, formal Review handoff
  'GET /api/v1/agreements/{agreementId}/obligations/{obligationId}/completion-status',
  'GET /api/v1/agreement-reviews',
  // Payments — SecureLinks
  'GET /api/v1/secure-links',
  'GET /api/v1/secure-links/{slug}',
  'GET /api/v1/secure-links/{slug}/checkout',
  'GET /api/v1/secure-links/{slug}/evidence',
  'GET /api/v1/secure-links/me/starter-limits',
  'GET /api/v1/secure-links/{slug}/collection-ledger-posting-plan',
  // Payments — Charges
  'GET /api/v1/charges',
  'GET /api/v1/charges/{id}',
  // Payments — Payments
  'GET /api/v1/payments',
  'GET /api/v1/payments/{id}',
  'GET /api/v1/payments/pesalink/banks',
  // Payments — PaymentRequests
  'GET /api/v1/payment-requests',
  'GET /api/v1/payment-requests/{id}',
  // Contracts
  'GET /api/v1/contracts',
  'GET /api/v1/contracts/{id}',
  'GET /api/v1/contracts/{contractId}/pending-actions',
  'GET /api/v1/contract-actions/{token}',
  // Notifications
  'GET /api/v1/notifications/deliveries',
  'GET /api/v1/notifications/deliveries/{id}',
  // Disputes
  'GET /api/v1/disputes',
  'GET /api/v1/disputes/{id}',
  'GET /api/v1/disputes/lookup',
  'GET /api/v1/disputes/links/{slug}/proposals',
  'GET /api/v1/disputes/links/{slug}/messages',
  // Audit
  'GET /api/v1/audit/logs',
  'GET /api/v1/audit/logs/{id}',
  'GET /api/v1/audit/resources/{type}/{id}',
  // Secure API — External collectors
  'GET /api/v1/external/collector/clients',
  'GET /api/v1/external/collector/clients/{clientId}',
  'GET /api/v1/external/checkout/{sessionId}',
  'GET /api/v1/external/checkout/{sessionId}/status',
  'GET /api/v1/external/assets/logos/{clientId}',
] as const;

// Confirmed action-token endpoints (release flow — feature-flagged)
export const confirmedActionTokenEndpoints = [
  'POST /api/v1/secure-links/{slug}/action-token-challenges',
  'POST /api/v1/secure-links/{slug}/action-token-challenges/{challengeId}/verify',
  'POST /api/v1/secure-links/{slug}/workflow/release',
] as const;

// Confirmed auth endpoints (login, logout, challenge, refresh)
export const confirmedAuthEndpoints = [
  'POST /api/v1/auth/login',
  'POST /api/v1/auth/logout',
  'POST /api/v1/auth/register',
  'POST /api/v1/auth/refresh',
  'POST /api/v1/auth/password/forgot',
  'POST /api/v1/auth/password/reset',
  'POST /api/v1/auth/challenge/verify',
  'POST /api/v1/auth/challenge/resend',
] as const;

// Future draft-write endpoints (confirmed in specs, not yet activated)
export const futureWriteEndpoints = [
  'POST /api/v1/secure-links (create SecureLink)',
  'PATCH /api/v1/secure-links/{slug} (update SecureLink)',
  'POST /api/v1/secure-links/{slug}/evidence (add evidence)',
  'POST /api/v1/contracts (create contract)',
  'PUT /api/v1/users/me (update profile)',
  'PUT /api/v1/users/me/store-profile',
  'PUT /api/v1/users/me/sme-account',
  'POST /api/v1/users/me/products',
  'PUT /api/v1/users/me/products/{productId}',
  'POST /api/v1/users/me/collector-profile',
  'POST /api/v1/secure-links/{slug}/workflow/progress',
  'POST /api/v1/secure-links/{slug}/workflow/complete',
  'POST /api/v1/secure-links/{slug}/workflow/approve',
  'POST /api/v1/secure-links/{slug}/workflow/accept',
  'POST /api/v1/secure-links/{slug}/fund',
  'POST /api/v1/secure-links/cart-checkout',
] as const;

// Endpoints NOT found in any OpenAPI spec — remain unconfirmed
export const unconfirmedEndpoints = [
  'GET /api/v1/help/articles — NOT FOUND in any spec',
  'GET /api/v1/knowledge/documents — NOT FOUND in any spec',
] as const;

// Forbidden endpoints (confirmed in specs as backend-only)
export const forbiddenEndpoints = [
  'POST /api/v1/*/webhook-complete',
  'POST /api/v1/users/internal/activation/payment-complete',
  'POST /api/v1/webhooks/payment-provider',
  'POST /api/v1/webhooks/choice-bank',
  'POST /api/v1/ledger/entries',
  'POST /api/v1/ledger/entries/reversal',
  'POST /api/v1/ledger/accounts',
  'POST /api/v1/payments/{id}/release',
  'POST /api/v1/payments/{id}/refund',
  'POST /api/v1/payments/{id}/fund',
  'POST /api/v1/payments/{id}/dispute',
  'POST /api/v1/contracts/{id}/release-requests/{rid}/execute',
  'POST /api/v1/contract-payout-orders/{id}/success',
  'POST /api/v1/contract-payout-orders/{id}/failure',
  'POST /api/v1/contract-disputes/{id}/resolve',
  'POST /api/v1/payouts/disburse',
  'POST /api/v1/payouts/internal/disbursements/webhook-complete',
  'POST /api/v1/payout-accounts',
  'POST /api/v1/payout-accounts/{id}/validate',
  'POST /api/v1/audit/entries',
  'POST /api/v1/notifications/send',
  'POST /api/v1/notifications/internal/send-sms',
  'POST /api/v1/notifications/internal/send-email',
  'POST /api/v1/external/payments',
  'POST /api/v1/external/payments/{id}/ipn',
  'POST /api/v1/external/internal/webhook-complete',
  'POST /api/v1/external/internal/checkout-sessions',
  '*/internal/* (all internal routes)',
] as const;

// ═══════════════════════════════════════════════════════════════
// CONFIRMED READ ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// GET /api/v1/secure-links/{slug} — SecureLink detail (Payments service)
export async function getSecureLink(slug: string, authHeader?: string) {
  return securePayFetch<SecurePaySecureLink>(`/api/v1/secure-links/${encodeURIComponent(slug)}`, { authHeader });
}

// GET /api/v1/secure-links — list my secure links (Payments service)
export async function listSecureLinks(authHeader?: string) {
  return securePayFetch<SecurePaySecureLinkListItem[]>('/api/v1/secure-links', { authHeader });
}

// GET /api/v1/secure-links/{slug}/evidence — evidence list (Payments service)
export async function getEvidenceList(slug: string, authHeader?: string) {
  return securePayFetch<SecurePayEvidence[]>(`/api/v1/secure-links/${encodeURIComponent(slug)}/evidence`, { authHeader });
}

// GET /api/v1/secure-links/{slug}/checkout — checkout/payment readiness (Payments service)
export async function getPaymentReadiness(slug: string, authHeader?: string) {
  return securePayFetch<SecurePayPaymentReadiness>(`/api/v1/secure-links/${encodeURIComponent(slug)}/checkout`, { authHeader });
}

// GET /api/v1/secure-links/me/starter-limits — starter limits (Payments service)
export async function getStarterLimits(authHeader?: string) {
  return securePayFetch<unknown>('/api/v1/secure-links/me/starter-limits', { authHeader });
}

// GET /api/v1/users/me — current user profile (Users service)
export async function getCurrentUser(authHeader?: string) {
  return securePayFetch<SecurePayUser>('/api/v1/users/me', { authHeader });
}

// GET /api/v1/users/me — KS profile (Users service — same endpoint, different mapping)
export async function getKSProfile(authHeader?: string) {
  return securePayFetch<SecurePayKSProfile>('/api/v1/users/me', { authHeader });
}

// GET /api/v1/users/me/account-details — account readiness (Users service)
export async function getAccountReadiness(authHeader?: string) {
  return securePayFetch<SecurePayAccountReadiness>('/api/v1/users/me/account-details', { authHeader });
}

// GET /api/v1/users/me/trader-dashboard — activity history (Users service)
export async function getActivityHistory(authHeader?: string) {
  return securePayFetch<SecurePayActivity[]>('/api/v1/users/me/trader-dashboard', { authHeader });
}

// GET /api/v1/users/public/ks/{ksNumber} — public KS lookup (Users service)
export async function lookupKSNumber(ksNumber: string) {
  return securePayFetch<unknown>(`/api/v1/users/public/ks/${encodeURIComponent(ksNumber)}`);
}

// GET /api/v1/users/by-ks/{ksNumber} — KS lookup (Users service)
export async function lookupKSNumberByKs(ksNumber: string, authHeader?: string) {
  return securePayFetch<unknown>(`/api/v1/users/by-ks/${encodeURIComponent(ksNumber)}`, { authHeader });
}

// GET /api/v1/contracts — list contracts (Contracts service)
export async function listContracts(authHeader?: string) {
  return securePayFetch<unknown[]>('/api/v1/contracts', { authHeader });
}

// GET /api/v1/contracts/{id} — contract detail (Contracts service)
export async function getContract(id: string, authHeader?: string) {
  return securePayFetch<unknown>(`/api/v1/contracts/${encodeURIComponent(id)}`, { authHeader });
}

// GET /api/v1/notifications/deliveries — list notifications (Notifications service)
export async function listNotifications(authHeader?: string) {
  return securePayFetch<unknown[]>('/api/v1/notifications/deliveries', { authHeader });
}

// GET /api/v1/disputes — list disputes (Disputes service)
export async function listDisputes(authHeader?: string) {
  return securePayFetch<unknown[]>('/api/v1/disputes', { authHeader });
}

// GET /api/v1/disputes/{id} — dispute detail (Disputes service)
export async function getDispute(id: string, authHeader?: string) {
  return securePayFetch<unknown>(`/api/v1/disputes/${encodeURIComponent(id)}`, { authHeader });
}

// Group SecureLink — no separate group endpoint in specs; uses same /secure-links/{slug}
export async function getGroupSecureLink(slug: string, authHeader?: string) {
  return securePayFetch<SecurePayGroupSecureLink>(`/api/v1/secure-links/${encodeURIComponent(slug)}`, { authHeader });
}

// Public, read-only Group SecureLink projection resolved exclusively through
// the backend-issued opaque locator. This endpoint neither joins the group nor
// authorizes a contribution or any governance action.
export async function getPublicGroupSecureLink(slug: string) {
  return securePayFetch<SecurePayPublicGroupSecureLink>(
    `/api/v1/public/group-securelinks/${encodeURIComponent(slug)}`,
  );
}

export async function getPrivateGroupSecureLink(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayPrivateGroupSecureLink>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink`,
    { authHeader },
  );
}

export async function createGroupSecureLink(
  agreementId: string,
  body: CreateGroupSecureLinkRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayCreateGroupSecureLinkResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink`,
    { method: 'POST', body, authHeader },
  );
}

export async function getGroupSecureLinkCapabilities(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayGroupSecureLinkCapabilities>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/capabilities`,
    { authHeader },
  );
}

// The backend contract has no request body or idempotency field for activation.
export async function activateGroupSecureLink(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayActivateGroupSecureLinkResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/activation`,
    { method: 'POST', authHeader },
  );
}

export async function cancelGroupSecureLink(
  agreementId: string,
  body: CancelGroupSecureLinkRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayCancelGroupSecureLinkResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/cancellation`,
    { method: 'POST', body, authHeader },
  );
}

export async function getMyGroupContributions(
  agreementId: string,
  page = 0,
  size = 20,
  authHeader?: string,
) {
  return securePayFetch<SecurePayCurrentUserContributionPage>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/contributions/me?page=${page}&size=${size}`,
    { authHeader },
  );
}

export async function recordGroupContributionIntent(
  agreementId: string,
  body: RecordGroupContributionIntentRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayRecordGroupContributionIntentResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/contributors`,
    { method: 'POST', body, authHeader },
  );
}

// GET /api/v1/identities/by-ksnumber/{canonicalKsNumber}. Distinct from and
// unrelated to the stale /api/v1/users/by-ks/{ksNumber} lookup above — this
// is the current, real identity-service lookup, scoped here to resolving a
// KS number before appointing a Group SecureLink organizer.
export async function getIdentityByKsNumber(ksNumber: string, authHeader?: string) {
  return securePayFetch<SecurePayRetrievedIdentity>(
    `/api/v1/identities/by-ksnumber/${encodeURIComponent(ksNumber)}`,
    { authHeader },
  );
}

// The backend contract has no idempotency field or header for organizer
// appointment.
export async function appointGroupSecureLinkOrganizer(
  agreementId: string,
  body: AppointGroupOrganizerRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAppointGroupOrganizerResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/organizers`,
    { method: 'POST', body, authHeader },
  );
}

export async function revokeGroupSecureLinkOrganizer(
  agreementId: string,
  organizerId: string,
  body: RevokeGroupOrganizerRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayRevokeGroupOrganizerResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/organizers/${encodeURIComponent(organizerId)}/revocation`,
    { method: 'POST', body, authHeader },
  );
}

export async function cancelGroupSecureLinkContributor(
  agreementId: string,
  contributorId: string,
  body: CancelGroupContributorRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayGroupContributorDetail>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/contributors/${encodeURIComponent(contributorId)}/cancellation`,
    { method: 'POST', body, authHeader },
  );
}

// The backend contract has no idempotency field or header for governance
// policy creation.
export async function createGroupGovernancePolicy(
  agreementId: string,
  body: CreateGovernancePolicyRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayCreateGovernancePolicyResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/governance/policies`,
    { method: 'POST', body, authHeader },
  );
}

// The backend contract has no request body or idempotency field for policy
// activation.
export async function activateGroupGovernancePolicy(
  agreementId: string,
  policyId: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayActivateGovernancePolicyResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/governance/policies/${encodeURIComponent(policyId)}/activation`,
    { method: 'POST', authHeader },
  );
}

// slug is returned once at issuance only; there is no re-fetch endpoint, so
// callers must hold it in local state for the remainder of the session.
export async function issueGroupSecureLinkPublicLocator(
  agreementId: string,
  body: IssueGroupPublicLocatorRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayIssueGroupPublicLocator>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/group-securelink/public-locators`,
    { method: 'POST', body, authHeader },
  );
}

// ═══════════════════════════════════════════════════════════════
// CONFIRMED AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// POST /api/v1/auth/login — sign in (Auth service)
export async function signIn(email: string, password: string) {
  return securePayFetch<SecurePaySession>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/logout — sign out (Auth service)
export async function signOut(authHeader?: string) {
  return securePayFetch<void>('/api/v1/auth/logout', { method: 'POST', authHeader });
}

// POST /api/v1/auth/register — register (Auth service)
export async function register(email: string, password: string, displayName?: string) {
  return securePayFetch<unknown>('/api/v1/auth/register', {
    method: 'POST',
    body: { email, password, ...(displayName ? { displayName } : {}) },
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/refresh — refresh token (Auth service)
export async function refreshToken(refreshTokenValue: string) {
  return securePayFetch<SecurePaySession>('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken: refreshTokenValue },
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/password/forgot — forgot password (Auth service)
export async function forgotPassword(email: string) {
  return securePayFetch<void>('/api/v1/auth/password/forgot', {
    method: 'POST',
    body: { email },
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/password/reset — reset password (Auth service)
export async function resetPassword(token: string, newPassword: string) {
  return securePayFetch<void>('/api/v1/auth/password/reset', {
    method: 'POST',
    body: { token, newPassword },
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/challenge/verify — verify OTP challenge (Auth service)
export async function verifyAuthChallenge(challengeId: string, code: string) {
  return securePayFetch<unknown>('/api/v1/auth/challenge/verify', {
    method: 'POST',
    body: { challengeId, code },
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/challenge/resend — resend OTP challenge (Auth service)
export async function resendAuthChallenge(challengeId: string) {
  return securePayFetch<unknown>('/api/v1/auth/challenge/resend', {
    method: 'POST',
    body: { challengeId },
    skipForbiddenCheck: true,
  });
}

// GET /api/v1/auth/jwks — public keys (Auth service)
export async function getJwks() {
  return securePayFetch<unknown>('/api/v1/auth/jwks');
}

// ═══════════════════════════════════════════════════════════════
// CONFIRMED ACTION-TOKEN ENDPOINTS (release flow — feature-flagged)
// ═══════════════════════════════════════════════════════════════

// POST /api/v1/secure-links/{slug}/action-token-challenges — create challenge
export async function createActionTokenChallenge(
  slug: string,
  scope: string,
  partyRole: string,
  authHeader?: string
) {
  return securePayFetch<SecurePayActionTokenChallenge>(
    `/api/v1/secure-links/${encodeURIComponent(slug)}/action-token-challenges`,
    {
      method: 'POST',
      body: { requestedScope: scope, ...(partyRole ? { partyRole } : {}) },
      authHeader,
    }
  );
}

// POST /api/v1/secure-links/{slug}/action-token-challenges/{challengeId}/verify — verify OTP
export async function verifyActionTokenChallenge(
  slug: string,
  challengeId: string,
  otp: string,
  authHeader?: string
) {
  return securePayFetch<SecurePayActionTokenVerify>(
    `/api/v1/secure-links/${encodeURIComponent(slug)}/action-token-challenges/${encodeURIComponent(challengeId)}/verify`,
    {
      method: 'POST',
      body: { otp },
      authHeader,
    }
  );
}

// POST /api/v1/secure-links/{slug}/workflow/release — release with action token
// FEATURE-FLAGGED: disabled by default unless VITE_SECUREPAY_ENABLE_RELEASE_ACTIONS=true
// Even when enabled, requires backend action-token flow — no frontend-only release.
export async function releaseSecureLinkWithActionToken(
  slug: string,
  actionToken: string,
  authHeader?: string
): Promise<SecurePayResult<SecurePayReleaseResponse> & { disabled?: boolean }> {
  if (!SECUREPAY_ENABLE_RELEASE_ACTIONS) {
    return { ok: false, error: RELEASE_DISABLED_MESSAGE, disabled: true };
  }
  return securePayFetch<SecurePayReleaseResponse>(
    `/api/v1/secure-links/${encodeURIComponent(slug)}/workflow/release`,
    {
      method: 'POST',
      headers: { 'X-SecureLink-Action-Token': actionToken },
      body: {},
      authHeader,
      skipForbiddenCheck: true,
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// UNCONFIRMED ENDPOINTS (NOT FOUND in any OpenAPI spec)
// ═══════════════════════════════════════════════════════════════

// Help articles and knowledge documents do not appear in any of the 11 service specs.
// These remain unconfirmed and will return errors if called.
export async function getHelpArticles() {
  return securePayFetch<SecurePayHelpArticle[]>('/api/v1/help/articles');
}

export async function getKnowledgeDocuments() {
  return securePayFetch<SecurePayKnowledgeDocument[]>('/api/v1/knowledge/documents');
}

// Authoritative agreement proposal endpoints from the pinned SecurePayAPI
// AgreementController contract. Creation records a proposal only.
export async function createAgreement(body: CreateAgreementRequestBody, authHeader?: string) {
  return securePayFetch<SecurePayAgreement>('/api/v1/agreements', {
    method: 'POST', body, authHeader,
  });
}

export async function getAgreement(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreement>(`/api/v1/agreements/${encodeURIComponent(agreementId)}`, { authHeader });
}

// GET /api/v1/agreements/{agreementId}/money-status — authoritative,
// participant-safe Payment Ready projection for the agreement's current
// version. This is a read only; readiness remains backend-calculated.
export async function getAgreementMoneyStatus(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementMoneyStatus>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/money-status`,
    { authHeader }
  );
}

// GET /api/v1/agreements/{agreementId}/money-records — authoritative ordered
// participant-safe record list. The server owns ordering and scope discovery.
export async function listAgreementMoneyRecords(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementMoneyRecord[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/money-records`,
    { authHeader }
  );
}

export async function listAgreementParticipants(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementParticipant[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/participants`,
    { authHeader }
  );
}

export async function issueAgreementInvitation(
  agreementId: string,
  body: IssueAgreementInvitationRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayIssuedAgreementInvitation>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/invitations`,
    { method: 'POST', body, authHeader }
  );
}

export async function viewAgreementInvitation(token: string) {
  return securePayFetch<SecurePayInvitationView>(
    `/api/v1/agreement-invitations/${encodeURIComponent(token)}`
  );
}

export async function joinAgreementInvitation(
  token: string,
  body: JoinAgreementRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayJoinedAgreement>(
    `/api/v1/agreement-invitations/${encodeURIComponent(token)}/join`,
    { method: 'POST', body, authHeader }
  );
}

export async function getAgreementVersion(agreementId: string, versionId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementVersion>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/versions/${encodeURIComponent(versionId)}`,
    { authHeader }
  );
}

export async function confirmAgreementVersion(
  agreementId: string,
  versionId: string,
  body: ConfirmAgreementVersionRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementConfirmation>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/versions/${encodeURIComponent(versionId)}/confirm`,
    { method: 'POST', body, authHeader }
  );
}

export async function listAgreementVersions(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementVersion[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/versions`, { authHeader }
  );
}

export async function listAgreementConfirmations(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementConfirmation[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/confirmations`, { authHeader }
  );
}

export async function getAgreementConfirmationStatus(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementConfirmationStatus[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/confirmation-status`, { authHeader }
  );
}

// R1 — GET /agreements/{id}/participants/me/next-actions. Backend state
// determines what needs attention; the frontend invents no priority model.
export async function getParticipantNextActions(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayParticipantNextActionsResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/participants/me/next-actions`, { authHeader }
  );
}

export async function listAgreementActivity(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementActivity[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/activity`, { authHeader }
  );
}

// R1 — obligations. Bound to one immutable agreement version.
export async function createAgreementObligation(
  agreementId: string,
  versionId: string,
  body: CreateAgreementObligationRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementObligation>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/versions/${encodeURIComponent(versionId)}/obligations`,
    { method: 'POST', body, authHeader }
  );
}

export async function listAgreementObligations(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementObligation[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/obligations`, { authHeader }
  );
}

// R1 — milestones. No participant dependency.
export async function createAgreementMilestone(
  agreementId: string,
  versionId: string,
  body: CreateAgreementMilestoneRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementMilestone>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/versions/${encodeURIComponent(versionId)}/milestones`,
    { method: 'POST', body, authHeader }
  );
}

export async function listAgreementMilestones(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementMilestone[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/milestones`, { authHeader }
  );
}

export async function listAgreementObligationEvidence(
  agreementId: string,
  obligationId: string,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementEvidence[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/obligations/${encodeURIComponent(obligationId)}/evidence`,
    { authHeader }
  );
}

// R1 — amendments, read-only. Proposing/applying is not built in R1: see
// SECUREPAY_GAP_REGISTER.md (ProposeAgreementAmendmentRequest.proposedTerms
// has no documented amendable-field contract).
export async function listAgreementAmendments(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementAmendment[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/amendments`, { authHeader }
  );
}

// R2 — obligation actions. The backend enforces who may start (the
// responsible participant) and completion eligibility server-side.
export async function startObligation(
  agreementId: string,
  obligationId: string,
  body: StartObligationRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementObligation>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/obligations/${encodeURIComponent(obligationId)}/start`,
    { method: 'POST', body, authHeader }
  );
}

export async function completeObligation(
  agreementId: string,
  obligationId: string,
  body: CompleteObligationRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementObligation>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/obligations/${encodeURIComponent(obligationId)}/complete`,
    { method: 'POST', body, authHeader }
  );
}

export async function getObligationCompletionStatus(
  agreementId: string,
  obligationId: string,
  authHeader?: string
) {
  return securePayFetch<SecurePayObligationCompletionStatus>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/obligations/${encodeURIComponent(obligationId)}/completion-status`,
    { authHeader }
  );
}

// R2 — evidence submission. objectReference/contentHash are a reference to
// evidence the trader already holds elsewhere (a link, receipt number, or
// delivery note) — there is no file-storage/upload endpoint for ordinary
// obligation evidence, so this never claims to store a binary file.
export async function submitAgreementEvidence(
  agreementId: string,
  obligationId: string,
  body: SubmitAgreementEvidenceRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementEvidence>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/obligations/${encodeURIComponent(obligationId)}/evidence`,
    { method: 'POST', body, authHeader }
  );
}

// R2 — evidence review. The backend rejects self-review (submitter cannot
// review their own evidence) and only accepts the closed decision enum.
export async function reviewAgreementEvidence(
  agreementId: string,
  evidenceId: string,
  body: ReviewAgreementEvidenceRequestBody,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementEvidence>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/evidence/${encodeURIComponent(evidenceId)}/review`,
    { method: 'POST', body, authHeader }
  );
}

// R2 — formal Agreement Review handoff. Open + read (list) only; this is
// deliberately not the Resolution Room — no acknowledge/respond/evidence
// submission/escalation UI is built on top of this adapter surface.
// Idempotency travels via the Idempotency-Key header for this endpoint
// family (verified against the OpenAPI parameters block), not a body field.
export async function openAgreementReviewCase(
  body: OpenAgreementReviewCaseRequestBody,
  idempotencyKey: string,
  authHeader?: string
) {
  return securePayFetch<SecurePayAgreementReviewOpenCaseResponse>(
    '/api/v1/agreement-reviews/open',
    { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey }, authHeader }
  );
}

export async function listAgreementReviewCases(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementReviewCaseListResponse>(
    `/api/v1/agreement-reviews?agreementId=${encodeURIComponent(agreementId)}`,
    { authHeader }
  );
}

// R5 — GET /agreement-reviews/{reviewCaseId}?agreementId=. Participant-safe
// case detail powering the Resolution Room; fails closed (404) if the case
// is not visible to the caller.
export async function getAgreementReviewCase(
  reviewCaseId: string,
  agreementId: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementReviewCaseDetail>(
    `/api/v1/agreement-reviews/${encodeURIComponent(reviewCaseId)}?agreementId=${encodeURIComponent(agreementId)}`,
    { authHeader }
  );
}

// R5 — good-faith acknowledgment. Idempotency-Key header, same convention
// as openAgreementReviewCase; expectedVersion must be the exact version
// from the most recently read case state (optimistic concurrency).
export async function acknowledgeAgreementReviewCase(
  reviewCaseId: string,
  body: AcknowledgeAgreementReviewCaseRequestBody,
  idempotencyKey: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementReviewActionResponse>(
    `/api/v1/agreement-reviews/${encodeURIComponent(reviewCaseId)}/acknowledgements`,
    { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey }, authHeader }
  );
}

// R5 — structured participant response (no free-form live chat; the
// backend only supports this closed responseType vocabulary plus an
// optional narrative). There is no read for other participants' response
// text — see the gap register.
export async function submitAgreementReviewResponse(
  reviewCaseId: string,
  body: SubmitAgreementReviewResponseRequestBody,
  idempotencyKey: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementReviewActionResponse>(
    `/api/v1/agreement-reviews/${encodeURIComponent(reviewCaseId)}/responses`,
    { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey }, authHeader }
  );
}

// R5 — escalation intent only. The case's own state after submission is
// the only source of truth; the UI never renders "escalated" until the
// backend confirms it.
export async function requestAgreementReviewEscalation(
  reviewCaseId: string,
  body: RequestAgreementReviewEscalationRequestBody,
  idempotencyKey: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementReviewActionResponse>(
    `/api/v1/agreement-reviews/${encodeURIComponent(reviewCaseId)}/escalations`,
    { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey }, authHeader }
  );
}

// R5 — participant-safe evidence read; submittedByCaller is server-computed
// against the caller's own identity.
export async function listAgreementReviewEvidence(
  reviewCaseId: string,
  agreementId: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementReviewEvidenceListResponse>(
    `/api/v1/agreement-reviews/${encodeURIComponent(reviewCaseId)}/evidence?agreementId=${encodeURIComponent(agreementId)}`,
    { authHeader }
  );
}

// R5 — real multipart file upload (unlike ordinary obligation evidence,
// which is reference-only). evidenceType/agreementId/narrativeDescription
// travel as query parameters per the OpenAPI contract; only the file itself
// is the multipart body.
export async function submitAgreementReviewEvidence(
  reviewCaseId: string,
  agreementId: string,
  evidenceType: string,
  file: File,
  idempotencyKey: string,
  narrativeDescription?: string,
  authHeader?: string,
) {
  const query = new URLSearchParams({ agreementId, evidenceType });
  if (narrativeDescription) query.set('narrativeDescription', narrativeDescription);
  const formData = new FormData();
  formData.append('file', file);
  return securePayFetch<SecurePayAgreementReviewEvidenceItem>(
    `/api/v1/agreement-reviews/${encodeURIComponent(reviewCaseId)}/evidence?${query.toString()}`,
    { method: 'POST', body: formData, headers: { 'Idempotency-Key': idempotencyKey }, authHeader }
  );
}

// GET /api/v1/me/agreements — R0.5 CurrentUserAgreementWorkspaceController.
// Server-derived identity; no KS Number/identity query parameter. Ordered
// updatedAt DESC, then agreementId DESC by the backend.
export async function listMyAgreements(page = 0, size = 20, authHeader?: string) {
  return securePayFetch<CurrentUserAgreementListResponse>(
    `/api/v1/me/agreements?page=${page}&size=${size}`,
    { authHeader }
  );
}

// GET /api/v1/me/actions — flattens the same nextActions collection returned
// by /me/agreements; the backend computes no separate cross-agreement
// priority model.
export async function listMyActions(page = 0, size = 20, authHeader?: string) {
  return securePayFetch<CurrentUserActionListResponse>(
    `/api/v1/me/actions?page=${page}&size=${size}`,
    { authHeader }
  );
}

// R3.5 — GET /agreements/{id}/participants/me/funding-authority. Fail-closed
// {authorized, reasonCode} projection; authorized is derived exclusively
// from the agreement's own persisted MONETARY obligation, never from
// creator identity or participant ordering.
export async function getAgreementFundingAuthority(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementFundingAuthority>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/participants/me/funding-authority`,
    { authHeader }
  );
}

// R3.5 — POST /agreements/{id}/payment-intents. No amount, currency, payer,
// recipient, or account field is ever caller-supplied; the backend derives
// all of them from the agreement's MONETARY obligation and requires
// AUTHORIZED funding authority. Sandbox/staging-safe only.
export async function createAgreementPaymentIntent(
  agreementId: string,
  body: CreateAgreementPaymentIntentRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementPaymentIntentCreateResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/payment-intents`,
    { method: 'POST', body, authHeader }
  );
}

// R3.5 — GET /agreements/{id}/payment-intents. Refresh-safe discovery of
// payment intents bound to this agreement; visible to any current
// participant with agreement read access.
export async function listAgreementPaymentIntents(
  agreementId: string,
  page = 0,
  size = 20,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementPaymentIntentListResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/payment-intents?page=${page}&size=${size}`,
    { authHeader }
  );
}

// R3.5 — GET /agreements/{id}/funding-options. Returns only rails actually
// eligible now, never the full provider enum; empty (not an error) when
// funding authority is not AUTHORIZED.
export async function listAgreementFundingOptions(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementFundingOptionListResponse>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/funding-options`,
    { authHeader }
  );
}

// R3.5 — POST /agreements/{id}/funding-quotes. railCode only; amount and
// currency are always server-derived from the obligation. platformChargeMinor
// is currently always 0 on this backend — a documented current gap, not a
// permanent commercial doctrine statement (see SecurePayAgreementFundingQuote).
export async function createAgreementFundingQuote(
  agreementId: string,
  body: CreateAgreementFundingQuoteRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayAgreementFundingQuote>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/funding-quotes`,
    { method: 'POST', body, authHeader }
  );
}

// Existing generic payment-intent initiation (POST /payment-intents/{id}/initiate).
// R3.5: when the target intent is agreement-bound, the backend re-checks
// funding authority and rail eligibility here — never trusted from an
// earlier funding-options/funding-quotes read, so a caller cannot bypass
// rail discovery by posting an ineligible providerIdentifier directly.
export async function initiatePaymentIntent(
  paymentIntentId: string,
  body: InitiatePaymentRequestBody,
  authHeader?: string,
) {
  return securePayFetch<SecurePayInitiatePaymentResponse>(
    `/api/v1/payment-intents/${encodeURIComponent(paymentIntentId)}/initiate`,
    { method: 'POST', body, authHeader }
  );
}

// R4.5 — GET /agreements/{id}/participants/me/release-authority. Fail-closed
// {authorized, reasonCode, evaluationId} projection; authorized composes the
// current Payment Ready evaluation (must be READY) with the existing
// release-authorization domain rule, never reimplemented client-side. These
// paths contain "release"/"settlement" and would otherwise match the
// generic FORBIDDEN_PATH_PATTERNS substring guard — skipForbiddenCheck is
// used here (same pattern as releaseSecureLinkWithActionToken) only after
// a full contract audit confirmed these are real, vetted, participant-safe
// R4.5 reads/commands.
export async function getAgreementReleaseAuthority(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementReleaseAuthority>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/participants/me/release-authority`,
    { authHeader, skipForbiddenCheck: true }
  );
}

// R4.5 — GET /agreements/{id}/payment-release/instructions. Refresh-safe
// discovery of release instructions bound to this agreement, deterministic
// (createdAt DESC). Returns the array directly (no page/size wrapper).
export async function listAgreementReleaseInstructions(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayPaymentReleaseInstruction[]>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/payment-release/instructions`,
    { authHeader, skipForbiddenCheck: true }
  );
}

// GET /payment-ready/agreements/{id}/evaluation — read the current
// evaluation's sequence number using the exact same productType/
// scopeIdentifiers the backend trigger itself constructs for an ordinary
// (non-SecureLink/KeyContract) agreement: productType=AGREEMENT,
// scopeIdentifiers=[the agreement's sole MONETARY obligation id] — both
// values are real, already-participant-safe facts (PaymentReadyProductType
// .AGREEMENT is the closed enum value for an unclassified agreement; the
// obligation id comes from the existing obligations read), never guessed.
export async function getPaymentReadyEvaluation(
  agreementId: string,
  productType: string,
  scopeIdentifiers: string[],
  authHeader?: string,
) {
  const query = new URLSearchParams({ productType });
  for (const id of scopeIdentifiers) query.append('scopeIdentifiers', id);
  return securePayFetch<SecurePayPaymentReadyEvaluation>(
    `/api/v1/payment-ready/agreements/${encodeURIComponent(agreementId)}/evaluation?${query.toString()}`,
    { authHeader }
  );
}

// R4.5 — POST /agreements/{id}/payment-release/instructions. Financial
// bindings (pricing, settlement destination, recipient) are resolved
// entirely server-side from the agreement's own MONETARY obligation; the
// caller supplies only the current Payment Ready evaluation reference and a
// customer-safe triggerReason.
export async function createPaymentReleaseInstruction(
  agreementId: string,
  body: CreatePaymentReleaseInstructionRequestBody,
  idempotencyKey: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayPaymentReleaseInstruction>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/payment-release/instructions`,
    { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey }, authHeader, skipForbiddenCheck: true }
  );
}

// GET .../instructions/{instructionId}/settlement-status — authoritative
// settlement polling read; exception (when present) is embedded inline, so
// this is the sole source needed for both settlement-phase and held-
// exception display.
export async function getPaymentReleaseSettlementStatus(
  agreementId: string,
  instructionId: string,
  authHeader?: string,
) {
  return securePayFetch<SecurePayPaymentReleaseSettlementStatus>(
    `/api/v1/agreements/${encodeURIComponent(agreementId)}/payment-release/instructions/${encodeURIComponent(instructionId)}/settlement-status`,
    { authHeader, skipForbiddenCheck: true }
  );
}
