// MW-10 — Real Market Masters & Expertise Registry. Category-specific expertise recognition,
// gated by real backend evidence and a KES 1,000/hour rate floor. Never universal, never
// adjudicated, never a hidden trust score.

export type MasterProfileStatus = 'ACTIVE' | 'REVOKED';

export interface MasterProfile {
  id: string;
  identityId: string;
  ksNumber: string | null;
  category: string;
  status: MasterProfileStatus;
  rateMinorPerHour: number;
  currency: 'KES';
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MasterEvidence {
  activatedOrQualifiedReferralCount: number;
  activeCircleMembershipCount: number;
  activeCommunityMembershipCount: number;
}

export interface ApplyMasterProfileRequest {
  category: string;
  rateMinorPerHour: number;
}

export interface UpdateMasterRateRequest {
  rateMinorPerHour: number;
}

export interface SetMasterAvailabilityRequest {
  available: boolean;
}
