import { securePayFetch } from './securepayClient';
import type {
  PublicStore,
  PublicStoreOfferDetail,
  StoreOffer,
  StoreProfile,
  UpdateStoreProfileRequest,
  UpsertStoreOfferRequest,
} from './storeTypes';

export function getPublicStore(canonicalKsNumber: string) {
  return securePayFetch<PublicStore>(`/api/v1/stores/${encodeURIComponent(canonicalKsNumber)}`);
}

export function getPublicStoreOffer(canonicalKsNumber: string, offerId: string) {
  return securePayFetch<PublicStoreOfferDetail>(
    `/api/v1/stores/${encodeURIComponent(canonicalKsNumber)}/offers/${encodeURIComponent(offerId)}`,
  );
}

export function getMyStoreProfile(accessToken: string) {
  return securePayFetch<StoreProfile>('/api/v1/store/me/profile', { authHeader: accessToken });
}

export function updateMyStoreProfile(accessToken: string, request: UpdateStoreProfileRequest) {
  return securePayFetch<StoreProfile>('/api/v1/store/me/profile', {
    method: 'PUT',
    authHeader: accessToken,
    body: request,
  });
}

export function listMyStoreOffers(accessToken: string) {
  return securePayFetch<StoreOffer[]>('/api/v1/store/me/offers', { authHeader: accessToken });
}

export function createMyStoreOffer(accessToken: string, request: UpsertStoreOfferRequest) {
  return securePayFetch<StoreOffer>('/api/v1/store/me/offers', {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function updateMyStoreOffer(accessToken: string, offerId: string, request: UpsertStoreOfferRequest) {
  return securePayFetch<StoreOffer>(`/api/v1/store/me/offers/${encodeURIComponent(offerId)}`, {
    method: 'PUT',
    authHeader: accessToken,
    body: request,
  });
}

export function confirmMyStoreOfferAvailability(accessToken: string, offerId: string) {
  return securePayFetch<StoreOffer>(
    `/api/v1/store/me/offers/${encodeURIComponent(offerId)}/availability-confirmation`,
    { method: 'POST', authHeader: accessToken },
  );
}
