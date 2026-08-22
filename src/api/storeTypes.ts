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
