import { SECUREPAY_API_BASE_URL, isForbiddenPath, FORBIDDEN_MESSAGE } from './securepayConfig';
import { SECUREPAY_EXPLORER_MODE } from '../lib/explorerMode';
import { getCurrentWorld, isSimulatedWorldRuntime } from '../lib/worldMode';
import type { SecurePayApiError, SecurePayResult } from './securepayTypes';
import {
  CREATION_AUTH_COMPLETED_EVENT,
  CREATION_AUTH_REQUIRED_EVENT,
  CREATION_TRIAL_ENDED_EVENT,
} from '../lib/creationIntent';

let resumedCreationAccessToken: string | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(CREATION_TRIAL_ENDED_EVENT, () => {
    resumedCreationAccessToken = null;
  });
}

function mapError(
  err: SecurePayApiError | null,
  fallback: string,
  unauthorizedMessage?: string,
): string {
  if (!err) return fallback;
  const { status, code } = err;
  if (code === 'INVALID_OTP' || code === 'WRONG_OTP')
    return 'Verification failed. Please check the code and try again.';
  if (status === 401)
    return unauthorizedMessage ?? fallback;
  if (status === 410 || code === 'EXPIRED' || code === 'CHALLENGE_EXPIRED')
    return 'This verification has expired. Start again.';
  if (status === 429 || code === 'MAX_ATTEMPTS' || code === 'TOO_MANY_ATTEMPTS')
    return 'Too many attempts. Please start again.';
  if (status === 503 || code === 'NOT_CONFIGURED')
    return 'Verification is not available in this environment yet.';
  if (status === 403 || code === 'WRONG_PARTY' || code === 'FORBIDDEN')
    return 'This action is not available for your role.';
  if (code === 'WRONG_SCOPE') return 'This verification does not match the required action.';
  if (status === 409 || code === 'ALREADY_USED')
    return 'This verification has already been used. Start again.';
  return fallback;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  authHeader?: string;
  skipForbiddenCheck?: boolean;
  /**
   * SecurePayAPI deliberately uses generic 401 responses across primary
   * credentials, OTP verification, and bearer-token checks. Callers may
   * provide the safe message for the operation instead of making the client
   * guess which secret or factor failed.
   */
  unauthorizedMessage?: string;
}

function defaultUnauthorizedMessage(path: string): string {
  if (path === '/api/v1/auth/login') {
    return 'KS Number or password could not be verified.';
  }
  if (
    path === '/api/v1/auth/complete'
    || path === '/api/v1/auth/signup/verify'
    || path === '/api/v1/auth/recovery/verify'
  ) {
    return 'Verification failed. Please check the code and try again.';
  }
  return 'Your session could not be verified. Please sign in again.';
}

function isCreationRoute(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/create');
}

function isAgreementCreationRequest(path: string, options: RequestOptions): boolean {
  return path === '/api/v1/agreements' && (options.method ?? 'GET') === 'POST';
}

/**
 * The public Home deliberately allows a visitor to experience the agreement
 * question engine before authentication. The first real Market write is the
 * point at which identity becomes mandatory.
 *
 * Instead of throwing away the completed journey, pause that exact request,
 * reveal CreateJourney's existing inline sign-in gate, and resume with the
 * freshly issued access token. Nothing is written before authentication.
 */
async function waitForCreationAuthentication(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  return new Promise((resolve) => {
    let settled = false;

    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener(CREATION_AUTH_COMPLETED_EVENT, handleCompleted as EventListener);
      resolve(token);
    };

    const handleCompleted = (event: Event) => {
      const detail = (event as CustomEvent<{ accessToken?: string }>).detail;
      const token = detail?.accessToken?.trim() || null;
      if (token) resumedCreationAccessToken = token;
      finish(token);
    };

    window.addEventListener(CREATION_AUTH_COMPLETED_EVENT, handleCompleted as EventListener);

    // Remove the temporary trial identity. CreateJourney remains mounted, so
    // its state survives while its existing InlineAuthGate is rendered.
    window.dispatchEvent(new Event(CREATION_AUTH_REQUIRED_EVENT));

    // Do not leave a network request pending forever if the visitor walks away.
    const timeoutId = window.setTimeout(() => finish(null), 10 * 60 * 1000);
  });
}

export async function securePayFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<SecurePayResult<T>> {
  // Evaluate the world at request time, not module-load time. This matters in
  // a SPA: a user can move from Market to Trainer/Game without a full reload.
  // Simulated routes may render convincing agreement and money states, but
  // they can never call SecurePayAPI and therefore cannot create Market truth.
  if (SECUREPAY_EXPLORER_MODE || isSimulatedWorldRuntime()) {
    const world = getCurrentWorld();
    return {
      ok: false,
      error: `${world === 'game' ? 'SecurePay Game' : 'SecurePay Trainer'} is simulated. Live SecurePay API calls are disabled in this world.`,
    };
  }

  if (!SECUREPAY_API_BASE_URL) {
    return {
      ok: false,
      error: 'SecurePay API base URL is not configured. Set VITE_SECUREPAY_API_BASE_URL.',
    };
  }

  if (!options.skipForbiddenCheck && isForbiddenPath(path)) {
    return { ok: false, error: FORBIDDEN_MESSAGE, forbidden: true };
  }

  let effectiveAuthHeader = options.authHeader;

  // An async submit started while the visitor was still in public trial mode
  // retains the render-time session value (null). After inline sign-in, reuse
  // the just-issued token for the rest of that same creation sequence until
  // React's normal session state is carrying it on subsequent renders.
  if (!effectiveAuthHeader && resumedCreationAccessToken && isCreationRoute()) {
    effectiveAuthHeader = resumedCreationAccessToken;
  }

  if (!effectiveAuthHeader && isAgreementCreationRequest(path, options) && isCreationRoute()) {
    effectiveAuthHeader = (await waitForCreationAuthentication()) ?? undefined;
    if (!effectiveAuthHeader) {
      return {
        ok: false,
        error: 'Sign in is required before SecurePay can create this agreement. Your trial answers are still here.',
      };
    }
  }

  const url = `${SECUREPAY_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };
  if (effectiveAuthHeader) headers.Authorization = `Bearer ${effectiveAuthHeader}`;

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: isFormDataBody
        ? (options.body as FormData)
        : options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 503 || res.status === 501) {
      const body = await res.json().catch(() => ({}));
      if (body.code === 'NOT_CONFIGURED' || body.status === 'NOT_CONFIGURED') {
        return { ok: false, error: 'NOT_CONFIGURED' };
      }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: mapError(
          { status: res.status, code: body.code, message: body.message },
          'Request failed. Please try again.',
          options.unauthorizedMessage ?? defaultUnauthorizedMessage(path),
        ),
      };
    }

    if (res.status === 204) {
      return { ok: true, data: undefined as T };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Could not reach the SecurePay API. Check your connection and try again.' };
  }
}