import { SECUREPAY_API_BASE_URL, isForbiddenPath, FORBIDDEN_MESSAGE } from './securepayConfig';
import { SECUREPAY_EXPLORER_MODE } from '../lib/explorerMode';
import { getCurrentWorld, isSimulatedWorldRuntime } from '../lib/worldMode';
import type { SecurePayApiError, SecurePayResult } from './securepayTypes';

function mapError(err: SecurePayApiError | null, fallback: string): string {
  if (!err) return fallback;
  const { status, code } = err;
  if (status === 401 || code === 'INVALID_OTP' || code === 'WRONG_OTP')
    return 'Verification failed. Please check the code and try again.';
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

  const url = `${SECUREPAY_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };
  if (options.authHeader) headers.Authorization = `Bearer ${options.authHeader}`;

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
        error: mapError({ status: res.status, code: body.code, message: body.message }, 'Request failed. Please try again.'),
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
