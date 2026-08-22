import { securePayFetch } from './securepayClient';
import type { PublicStore, PublicStoreOfferDetail } from './storeTypes';

export function getPublicStore(canonicalKsNumber: string) {
  return securePayFetch<PublicStore>(`/api/v1/stores/${encodeURIComponent(canonicalKsNumber)}`);
}

export function getPublicStoreOffer(canonicalKsNumber: string, offerId: string) {
  return securePayFetch<PublicStoreOfferDetail>(
    `/api/v1/stores/${encodeURIComponent(canonicalKsNumber)}/offers/${encodeURIComponent(offerId)}`,
  );
}
