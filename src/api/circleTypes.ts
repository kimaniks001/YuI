// MW-08 — Circles & Cycles. A Circle is "who have I deliberately chosen to work and grow with?",
// distinct from a Community ("who are my people?" — MW-07). All shapes mirror SecurePayAPI
// exactly; YUI never invents a field the backend does not return.

export type CircleMembershipRole = 'MEMBER' | 'ORGANISER';
export type CircleStatus = 'ACTIVE' | 'RESTING';
export type CircleMembershipStatus = 'ACTIVE' | 'LEFT';
export type CircleInvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';
export type CycleStatus = 'ACTIVE' | 'CLOSED';

export interface CircleResponse {
  id: string;
  name: string;
  description: string;
  status: CircleStatus;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  callerRole: CircleMembershipRole | null;
}

export interface CircleMemberResponse {
  identityId: string;
  role: CircleMembershipRole;
  joinedAt: string;
}

export interface CircleMembershipResponse {
  circleId: string;
  role: CircleMembershipRole;
  status: CircleMembershipStatus;
  joinedAt: string;
}

export interface CircleInvitationResponse {
  id: string;
  circleId: string;
  status: CircleInvitationStatus;
  createdAt: string;
  decidedAt: string | null;
}

export interface MyCirclesResponse {
  memberships: CircleMembershipResponse[];
  pendingInvitations: CircleInvitationResponse[];
}

export interface CycleResponse {
  id: string;
  circleId: string;
  status: CycleStatus;
  startedAt: string;
  closedAt: string | null;
}

export interface CircleIntentionResponse {
  id: string;
  cycleId: string;
  identityId: string;
  description: string;
  createdAt: string;
}

export interface CircleOpportunityShareResponse {
  id: string;
  cycleId: string;
  identityId: string;
  description: string;
  createdAt: string;
}

export interface CircleMemberContributionResponse {
  identityId: string;
  intentionCount: number;
  opportunityShareCount: number;
}

export interface CircleCycleMetricsResponse {
  cycleId: string;
  circleId: string;
  activeMemberCount: number;
  intentionCount: number;
  opportunityShareCount: number;
  contributions: CircleMemberContributionResponse[];
}

export interface CreateCircleRequest {
  name: string;
  description?: string;
}

export interface InviteToCircleRequest {
  invitedKsNumber: string;
}

export interface SetCircleStatusRequest {
  status: CircleStatus;
}

export interface LogCircleTextRequest {
  description: string;
}
