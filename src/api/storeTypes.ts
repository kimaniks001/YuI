export type PublicStoreOfferKind = 'PRODUCT' | 'SERVICE';

export type PublicStoreAvailabilityState =
  | 'AVAILABLE'
  | 'LOW_AVAILABILITY'
  | 'NEEDS_CONFIRMATION'
  | 'UNAVAILABLE'
  | 'PAUSED'
  | 'TAKING_WORK'
  | 'LIMITED'
  | 'FULLY_BOOKED'
  | 'RESTING';

export interface PublicStoreProfile {
  tagline: string | null;
  about: string | null;
  locationLabel: string | null;
  updatedAt: string | null;
}

export interface PublicStoreOffer {
  id: string;
  kind: PublicStoreOfferKind;
  title: string;
  description: string | null;
  priceMinor: number | null;
  currency: 'KES';
  quantityAvailable: number | null;
  availabilityState: PublicStoreAvailabilityState;
  availabilityConfirmedAt: string | null;
  updatedAt: string | null;
}

export interface PublicStore {
  canonicalKsNumber: string;
  displayName: string;
  identityType: string;
  status: 'ACTIVE';
  profile: PublicStoreProfile | null;
  offers: PublicStoreOffer[];
}

export interface PublicStoreOfferDetail {
  canonicalKsNumber: string;
  displayName: string;
  identityType: string;
  status: 'ACTIVE';
  profile: PublicStoreProfile | null;
  offer: PublicStoreOffer;
}

// Authenticated owner contract. All ownership is server-derived from the
// current session; callers never supply an identity id or target KS Number.
export interface StoreProfile {
  identityId: string;
  tagline: string | null;
  about: string | null;
  locationLabel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateStoreProfileRequest {
  tagline: string | null;
  about: string | null;
  locationLabel: string | null;
}

export interface StoreOffer {
  id: string;
  kind: PublicStoreOfferKind;
  title: string;
  description: string | null;
  priceMinor: number | null;
  currency: 'KES';
  quantityAvailable: number | null;
  availabilityState: PublicStoreAvailabilityState;
  availabilityConfirmedAt: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertStoreOfferRequest {
  kind: PublicStoreOfferKind;
  title: string;
  description: string | null;
  priceMinor: number | null;
  quantityAvailable: number | null;
  availabilityState: PublicStoreAvailabilityState;
  published: boolean;
}
