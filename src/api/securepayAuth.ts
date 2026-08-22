// ═══════════════════════════════════════════════════════════════
// SECUREPAY AUTH ADAPTER
//
// Matches the CURRENT backend `AuthenticationController`
// (~/SecurePayAPI, services/securepay-core, ke.securepay.core.api.auth,
// base path /api/v1/auth), verified directly against source
// (commit 9dc1038, branch phase-r9-production-activation, 2026-08-11).
// Do not add routes or fields that are not present in that source.
//
// LOGIN IS A TWO-STEP KSNUMBER + PASSWORD + MFA-OTP FLOW. There is no
// single-step login and no email-based login:
//   1. POST /api/v1/auth/login    {ksNumber, password} -> {challengeToken, expiresAt}
//      This ONLY means the password was correct and an OTP was sent.
//      It is NOT authentication — no token exists yet.
//   2. POST /api/v1/auth/complete {challengeToken, otpProof} -> {accessToken,
//      accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt}
//      Authentication succeeds only here.
//   3. POST /api/v1/auth/mfa/resend {challengeToken} -> 204
//   4. POST /api/v1/auth/refresh    {refreshToken} -> new token pair
//      (refresh tokens rotate — replaying a used one revokes the session)
//   5. POST /api/v1/auth/logout | /logout-all  (Authorization: Bearer <token>) -> 204
//   6. POST /api/v1/auth/password   {currentPassword, newPassword} (Bearer) -> 204
//   7. POST /api/v1/auth/recovery/request {ksNumber} -> {recoveryToken, expiresAt}
//      (always 200 regardless of whether the KS Number exists — anti-enumeration)
//   8. POST /api/v1/auth/recovery/verify  {recoveryToken, otpCode} -> {recoveryToken, expiresAt, verified}
//   9. POST /api/v1/auth/recovery/reset   {recoveryToken, newPassword} -> 204
//
// PHASE 2 PUBLIC SIGNUP (ADR-0017, "Public Self-Onboarding Identity
// Bootstrap") is a separate, structurally distinct three-step journey under
// /api/v1/auth/signup, wholly anonymous-public (no KS Number, session, or
// permission is ever required or accepted from the caller):
//   1. POST /api/v1/auth/signup/start  {displayName, channelType, destination,
//      password} -> {signupChallengeToken, expiresAt, maskedDestination,
//      resendAvailableAt}. Hashes the password immediately, sends an OTP.
//      Does NOT create an identity, credential, or session. Returns an
//      identical response whether or not the contact already belongs to an
//      existing identity — a "success" here never confirms the contact was
//      new (anti-enumeration, ADR-0017 §L).
//   2. POST /api/v1/auth/signup/resend {signupChallengeToken} -> 204
//   3. POST /api/v1/auth/signup/verify {signupChallengeToken, otp} ->
//      {ksNumber, accessToken, accessTokenExpiresAt, refreshToken,
//      refreshTokenExpiresAt}. The ONLY call that can create the identity,
//      issue a KSNumber, and produce a session — all inside one backend
//      transaction. ksNumber is server-derived, never client-supplied.
// POST /api/v1/identities (a different, privileged route) still requires an
// already-authenticated trusted actor and is unrelated to this flow.
//
// The backend returns a single generic 401 {code:"INVALID_CREDENTIALS"} for
// wrong password, wrong/expired/consumed challenge, and wrong OTP — by
// design, so the error must not claim to know which factor failed.
//
// Rules:
//   - No production secrets, internal tokens, or provider credentials.
//   - Tokens live only in memory (React state via the auth bridge).
//   - No localStorage / sessionStorage / cookies for tokens.
//   - Does NOT call Supabase auth as SecurePay truth — there is no fallback.
// ═══════════════════════════════════════════════════════════════
import type {
  SecurePayResult,
  SecurePaySession,
  SecurePayUser,
  SecurePayLoginChallenge,
  SecurePaySignupChallenge,
  SecurePaySignupChannelType,
} from './securepayTypes';
import { securePayFetch } from './securepayClient';
import { SECUREPAY_API_BASE_URL } from './securepayConfig';

interface PendingAuthenticationResponse {
  challengeToken: string;
  expiresAt: string;
}

interface CompletedAuthenticationResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface PendingSignupResponse {
  signupChallengeToken: string;
  expiresAt: string;
  maskedDestination: string;
  resendAvailableAt: string;
}

interface CompletedSignupResponse {
  ksNumber: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface RecoveryRequestResponse {
  recoveryToken: string;
  expiresAt: string;
}

interface RecoveryVerificationResponse {
  recoveryToken: string;
  expiresAt: string;
  verified: boolean;
}

// In-memory only. Cleared on reload — sessions are never persisted.
let cachedSession: SecurePaySession | null = null;
// The KS Number submitted to /login, held only until /complete succeeds —
// the backend never echoes identity back to the client, so this is the one
// honest source for SecurePayUser.ksNumber after completion.
let pendingKsNumber: string | null = null;

function persistSession(
  ksNumber: string,
  data: CompletedAuthenticationResponse
): SecurePaySession {
  const user: SecurePayUser = { ksNumber };
  const session: SecurePaySession = {
    accessToken: data.accessToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
    refreshToken: data.refreshToken,
    refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    user,
  };
  cachedSession = session;
  return session;
}

function clearSession() {
  cachedSession = null;
  pendingKsNumber = null;
}

// STEP 1 — POST /api/v1/auth/login
// Returns a pending MFA challenge. Does NOT authenticate the caller.
export async function securePayBeginLogin(
  ksNumber: string,
  password: string
): Promise<SecurePayResult<SecurePayLoginChallenge>> {
  const result = await securePayFetch<PendingAuthenticationResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: { ksNumber, password },
    skipForbiddenCheck: true,
  });
  if (!result.ok || !result.data) return { ok: false, error: result.error ?? 'Invalid KS Number or password.' };
  pendingKsNumber = ksNumber;
  return {
    ok: true,
    data: { challengeToken: result.data.challengeToken, expiresAt: result.data.expiresAt, ksNumber },
  };
}

// STEP 2 — POST /api/v1/auth/complete
// Authentication succeeds only here.
export async function securePayCompleteLogin(
  challengeToken: string,
  otpProof: string
): Promise<SecurePayResult<SecurePaySession>> {
  const result = await securePayFetch<CompletedAuthenticationResponse>('/api/v1/auth/complete', {
    method: 'POST',
    body: { challengeToken, otpProof },
    skipForbiddenCheck: true,
  });
  if (!result.ok || !result.data) {
    return { ok: false, error: result.error ?? 'Verification failed. Please check the code and try again.' };
  }
  const ksNumber = pendingKsNumber ?? '';
  pendingKsNumber = null;
  return { ok: true, data: persistSession(ksNumber, result.data) };
}

// POST /api/v1/auth/mfa/resend
export async function securePayResendLoginOtp(challengeToken: string): Promise<SecurePayResult<void>> {
  return securePayFetch<void>('/api/v1/auth/mfa/resend', {
    method: 'POST',
    body: { challengeToken },
    skipForbiddenCheck: true,
  });
}

// STEP 1 — POST /api/v1/auth/signup/start (ADR-0017 public self-onboarding)
export async function securePayStartSignup(
  displayName: string,
  channelType: SecurePaySignupChannelType,
  destination: string,
  password: string
): Promise<SecurePayResult<SecurePaySignupChallenge>> {
  const result = await securePayFetch<PendingSignupResponse>('/api/v1/auth/signup/start', {
    method: 'POST',
    body: { displayName, channelType, destination, password },
    skipForbiddenCheck: true,
  });
  if (!result.ok || !result.data) return { ok: false, error: result.error ?? 'Could not start signup.' };
  return { ok: true, data: result.data };
}

// POST /api/v1/auth/signup/resend
export async function securePayResendSignupOtp(
  signupChallengeToken: string
): Promise<SecurePayResult<void>> {
  return securePayFetch<void>('/api/v1/auth/signup/resend', {
    method: 'POST',
    body: { signupChallengeToken },
    skipForbiddenCheck: true,
  });
}

// STEP 2 — POST /api/v1/auth/signup/verify. The only call that can create an
// identity, issue a KSNumber, and produce a session. Reuses persistSession()
// so the resulting SecurePaySession shape is identical to a login session.
export async function securePayVerifySignup(
  signupChallengeToken: string,
  otp: string
): Promise<SecurePayResult<SecurePaySession>> {
  const result = await securePayFetch<CompletedSignupResponse>('/api/v1/auth/signup/verify', {
    method: 'POST',
    body: { signupChallengeToken, otp },
    skipForbiddenCheck: true,
  });
  if (!result.ok || !result.data) {
    return { ok: false, error: result.error ?? 'Verification failed. Please check the code and try again.' };
  }
  return { ok: true, data: persistSession(result.data.ksNumber, result.data) };
}

// POST /api/v1/auth/refresh — refresh tokens rotate; always replace both
// cached tokens with the response, never reuse the old refresh token.
export async function securePayRefresh(): Promise<SecurePayResult<SecurePaySession>> {
  if (!cachedSession) return { ok: false, error: 'No session to refresh.' };
  const result = await securePayFetch<CompletedAuthenticationResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken: cachedSession.refreshToken },
    skipForbiddenCheck: true,
  });
  if (!result.ok || !result.data) {
    clearSession();
    return { ok: false, error: result.error ?? 'Session expired.' };
  }
  const ksNumber = cachedSession.user.ksNumber ?? '';
  return { ok: true, data: persistSession(ksNumber, result.data) };
}

// POST /api/v1/auth/logout
export async function securePayLogout(): Promise<SecurePayResult<void>> {
  const token = cachedSession?.accessToken ?? null;
  clearSession();
  if (!token) return { ok: true, data: undefined };
  return securePayFetch<void>('/api/v1/auth/logout', {
    method: 'POST',
    authHeader: token,
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/password — authenticated password change (requires an
// active session). Distinct from the unauthenticated recovery flow below.
export async function securePayChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<SecurePayResult<void>> {
  if (!cachedSession) return { ok: false, error: 'Not signed in.' };
  return securePayFetch<void>('/api/v1/auth/password', {
    method: 'POST',
    authHeader: cachedSession.accessToken,
    body: { currentPassword, newPassword },
    skipForbiddenCheck: true,
  });
}

// POST /api/v1/auth/recovery/request
export async function securePayRequestRecovery(
  ksNumber: string
): Promise<SecurePayResult<{ recoveryToken: string; expiresAt: string }>> {
  const result = await securePayFetch<RecoveryRequestResponse>('/api/v1/auth/recovery/request', {
    method: 'POST',
    body: { ksNumber },
    skipForbiddenCheck: true,
  });
  if (!result.ok || !result.data) return { ok: false, error: result.error ?? 'Could not start password recovery.' };
  return { ok: true, data: result.data };
}

// POST /api/v1/auth/recovery/verify
export async function securePayVerifyRecovery(
  recoveryToken: string,
  otpCode: string
): Promise<SecurePayResult<{ recoveryToken: string; expiresAt: string; verified: boolean }>> {
  const result = await securePayFetch<RecoveryVerificationResponse>('/api/v1/auth/recovery/verify', {
    method: 'POST',
    body: { recoveryToken, otpCode },
    skipForbiddenCheck: true,
  });
  if (!result.ok || !result.data) {
    return { ok: false, error: result.error ?? 'Verification failed. Please check the code and try again.' };
  }
  return { ok: true, data: result.data };
}

// POST /api/v1/auth/recovery/reset — requires a VERIFIED recovery token
// (call securePayVerifyRecovery first).
export async function securePayResetPasswordWithRecovery(
  recoveryToken: string,
  newPassword: string
): Promise<SecurePayResult<void>> {
  return securePayFetch<void>('/api/v1/auth/recovery/reset', {
    method: 'POST',
    body: { recoveryToken, newPassword },
    skipForbiddenCheck: true,
  });
}

// Compatibility name used by the existing reset screen. The supplied token
// must be a backend-verified recovery token; this does not introduce a second
// recovery contract or a client-side reset path.
export const securePayResetPassword = securePayResetPasswordWithRecovery;

// In-memory session getter — no persistence to localStorage.
export function securePayGetSession(): SecurePaySession | null {
  return cachedSession;
}

export function securePayGetAccessToken(): string | null {
  return cachedSession?.accessToken ?? null;
}

export function securePayIsConfigured(): boolean {
  return Boolean(SECUREPAY_API_BASE_URL);
}
