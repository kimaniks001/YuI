/**
 * Immutable runtime environment contract — parsed once at module load.
 */

import {
  SECUREPAY_API_BASE_URL,
  SECUREPAY_API_MODE,
  SECUREPAY_API_NOT_CONFIGURED,
  SECUREPAY_ENABLE_RELEASE_ACTIONS,
  SECUREPAY_ENABLE_PAYMENT_CONFIRMATION,
  SECUREPAY_ENABLE_WITHDRAWAL_ACTIONS,
  SECUREPAY_ENABLE_MONEY_ACTIONS,
} from '../api/securepayConfig';

export type IntegrationEnvironmentMode = 'production' | 'sandbox' | 'mock' | 'demo';

export interface IntegrationEnvironmentContract {
  mode: IntegrationEnvironmentMode;
  apiBaseUrlConfigured: boolean;
  apiNotConfiguredSafeEmpty: boolean;
  releaseActionsEnabled: boolean;
  paymentConfirmationEnabled: boolean;
  withdrawalActionsEnabled: boolean;
  moneyActionsEnabled: boolean;
  integrationTraceEnabled: boolean;
  invalidConfigurationWarnings: string[];
}

const rawMode = import.meta.env.VITE_SECUREPAY_API_MODE as string | undefined;
const validModes = new Set(['production', 'staging', 'mock']);

function resolveMode(): IntegrationEnvironmentMode {
  if (rawMode === 'production') return 'production';
  if (rawMode === 'mock' || SECUREPAY_API_NOT_CONFIGURED) return 'mock';
  if (rawMode === 'staging' || !rawMode) return 'sandbox';
  return 'sandbox';
}

function buildContract(): IntegrationEnvironmentContract {
  const warnings: string[] = [];
  if (rawMode && !validModes.has(rawMode) && rawMode !== 'production') {
    warnings.push(`Unsupported VITE_SECUREPAY_API_MODE "${rawMode}" — treated as sandbox.`);
  }
  if (SECUREPAY_API_MODE === 'production' && !SECUREPAY_API_BASE_URL) {
    warnings.push('Production API mode without VITE_SECUREPAY_API_BASE_URL — API reads will fail safely.');
  }
  return {
    mode: resolveMode(),
    apiBaseUrlConfigured: Boolean(SECUREPAY_API_BASE_URL),
    apiNotConfiguredSafeEmpty: SECUREPAY_API_NOT_CONFIGURED,
    releaseActionsEnabled: SECUREPAY_ENABLE_RELEASE_ACTIONS,
    paymentConfirmationEnabled: SECUREPAY_ENABLE_PAYMENT_CONFIRMATION,
    withdrawalActionsEnabled: SECUREPAY_ENABLE_WITHDRAWAL_ACTIONS,
    moneyActionsEnabled: SECUREPAY_ENABLE_MONEY_ACTIONS,
    integrationTraceEnabled:
      import.meta.env.DEV === true ||
      import.meta.env.VITE_INTEGRATION_TRACE === 'true',
    invalidConfigurationWarnings: warnings,
  };
}

export const INTEGRATION_ENV: IntegrationEnvironmentContract = Object.freeze(buildContract());

export function getIntegrationEnvironment(): IntegrationEnvironmentContract {
  return INTEGRATION_ENV;
}
