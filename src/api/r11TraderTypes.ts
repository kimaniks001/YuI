export type ReferralRelationshipStatus = 'PENDING' | 'ACTIVATED' | 'QUALIFIED';

export interface ReferralCodeResponse {
  code: string;
  issuedAt: string;
}

export interface ReferralRelationshipResponse {
  relationshipId: string;
  referredKsNumber: string;
  status: ReferralRelationshipStatus | string;
  createdAt: string;
  activatedAt: string | null;
  qualifiedAt: string | null;
  rewardAmountMinor: number | null;
  rewardCurrency: string | null;
  pricingVersion: string | null;
  referralRuleVersion: string | null;
  qualificationExplanation: string | null;
  settlementEvidenceReference: string | null;
}

export interface ReferralHistoryResponse {
  referralCode: string;
  totalReferred: number;
  activatedOrLaterCount: number;
  relationships: ReferralRelationshipResponse[];
}

export interface RedeemReferralCodeResponse {
  relationshipId: string;
  status: ReferralRelationshipStatus | string;
  createdAt: string;
}

export interface CircleProfileResponse {
  canonicalKsNumber: string;
  displayName: string | null;
  verificationStatus: string;
  memberSince: string;
  referredTraderCount: number;
  activatedReferredTraderCount: number;
}

export type TraderProfileVisibility = 'PUBLIC' | 'PRIVATE';

export interface TraderSettingsResponse {
  notifyEmail: boolean;
  notifySms: boolean;
  notifyPush: boolean;
  marketingOptIn: boolean;
  profileVisibility: TraderProfileVisibility;
  saved: boolean;
}

export interface UpdateTraderSettingsRequest {
  notifyEmail: boolean;
  notifySms: boolean;
  notifyPush: boolean;
  marketingOptIn: boolean;
  profileVisibility: TraderProfileVisibility;
}
