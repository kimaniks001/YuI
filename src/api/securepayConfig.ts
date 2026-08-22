import { SECUREPAY_EXPLORER_MODE } from '../lib/explorerMode';
// SecurePay API base URL — must come from VITE_SECUREPAY_API_BASE_URL.
// Supabase URL is NEVER used as a SecurePay API fallback.
// When unset, the adapter returns safe errors and pages show empty/loading states.
export const SECUREPAY_API_BASE_URL =
  import.meta.env.VITE_SECUREPAY_API_BASE_URL || '';

// API mode — 'mock' disables real calls and shows safe placeholders (dev only)
export const SECUREPAY_API_MODE =
  (import.meta.env.VITE_SECUREPAY_API_MODE as 'staging' | 'production' | 'mock') || 'staging';

// True when the SecurePay API is intentionally not configured (dev/mock mode).
// Pages should show safe empty states rather than treating this as an error.
export const SECUREPAY_API_NOT_CONFIGURED = !SECUREPAY_API_BASE_URL && SECUREPAY_API_MODE === 'mock';

// ─── Money-action feature flags (all default false) ───
// These control whether the frontend is allowed to even attempt money-action calls.
// Even when true, the backend action-token flow is still required.
// These must remain false in production unless explicitly backend-approved.
export const SECUREPAY_ENABLE_MONEY_ACTIONS =
  !SECUREPAY_EXPLORER_MODE && import.meta.env.VITE_SECUREPAY_ENABLE_MONEY_ACTIONS === 'true';

export const SECUREPAY_ENABLE_RELEASE_ACTIONS =
  !SECUREPAY_EXPLORER_MODE && import.meta.env.VITE_SECUREPAY_ENABLE_RELEASE_ACTIONS === 'true';

export const SECUREPAY_ENABLE_PAYMENT_CONFIRMATION =
  !SECUREPAY_EXPLORER_MODE && import.meta.env.VITE_SECUREPAY_ENABLE_PAYMENT_CONFIRMATION === 'true';

export const SECUREPAY_ENABLE_WITHDRAWAL_ACTIONS =
  !SECUREPAY_EXPLORER_MODE && import.meta.env.VITE_SECUREPAY_ENABLE_WITHDRAWAL_ACTIONS === 'true';

export const SECUREPAY_ENABLE_PAYOUT_ACTIONS =
  !SECUREPAY_EXPLORER_MODE && import.meta.env.VITE_SECUREPAY_ENABLE_PAYOUT_ACTIONS === 'true';

export const SECUREPAY_ENABLE_LEDGER_ACTIONS =
  !SECUREPAY_EXPLORER_MODE && import.meta.env.VITE_SECUREPAY_ENABLE_LEDGER_ACTIONS === 'true';

export const RELEASE_DISABLED_MESSAGE =
  'Release is controlled by SecurePay backend and is not enabled from this frontend build.';

export const FORBIDDEN_PATH_PATTERNS = [
  'webhook-complete',
  'payment-complete',
  'provider-confirm',
  'provider-confirmation',
  'ledger-posting',
  'ledger/entries',
  'ledger/accounts',
  'release',
  'withdrawal',
  'payout',
  'disburse',
  'settlement',
  'auto-payout',
  'choice-transfer',
  'choice-bank',
  'internal',
  'refund',
] as const;

export const FORBIDDEN_MESSAGE =
  'This action is controlled by SecurePay backend and is not available from the frontend.';

export function isForbiddenPath(path: string): boolean {
  const normalized = path.toLowerCase();
  return FORBIDDEN_PATH_PATTERNS.some((p) => normalized.includes(p));
}

// Convenience: is any money-action flag enabled?
export function isAnyMoneyActionEnabled(): boolean {
  return (
    SECUREPAY_ENABLE_RELEASE_ACTIONS ||
    SECUREPAY_ENABLE_PAYMENT_CONFIRMATION ||
    SECUREPAY_ENABLE_WITHDRAWAL_ACTIONS ||
    SECUREPAY_ENABLE_PAYOUT_ACTIONS ||
    SECUREPAY_ENABLE_LEDGER_ACTIONS
  );
}
