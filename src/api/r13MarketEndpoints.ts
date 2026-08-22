import { securePayFetch } from './securepayClient';
import type { SecurePayMarketIdentity, SecurePayMarketStatement } from './r13MarketTypes';

export function getMyMarketIdentities(accessToken: string) {
  return securePayFetch<SecurePayMarketIdentity[]>('/api/v1/identities/me/market-identities', {
    authHeader: accessToken,
  });
}

export function getMarketStatement(accessToken: string, ksNumber: string, limit = 100) {
  return securePayFetch<SecurePayMarketStatement>(
    `/api/v1/ledger/me/market-identities/${encodeURIComponent(ksNumber)}/statement?limit=${limit}`,
    { authHeader: accessToken },
  );
}
