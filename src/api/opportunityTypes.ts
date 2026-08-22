// MW-09 — Opportunities, Connectors & My Market Convergence. An opportunity travels by being
// deliberately passed from person to person. Opportunity != agreement: responding, passing, or
// claiming never creates an agreement, reservation, or sale. Referral provenance != reward
// entitlement: a connector's pass is visibility-only.

export type OpportunityStatus = 'OPEN' | 'CLAIMED' | 'CLOSED';

export interface OpportunityResponseDto {
  id: string;
  title: string;
  description: string;
  status: OpportunityStatus;
  createdByIdentityId: string;
  claimedByIdentityId: string | null;
  claimedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityPassResponse {
  id: string;
  opportunityId: string;
  passedByIdentityId: string;
  passedToIdentityId: string;
  createdAt: string;
}

export interface OpportunityResponseRecord {
  id: string;
  opportunityId: string;
  respondingIdentityId: string;
  message: string;
  createdAt: string;
}

export interface ConnectorContribution {
  passesMade: number;
  passesThatWereClaimed: number;
}

export interface MyMarketConvergenceResponse {
  created: OpportunityResponseDto[];
  inbox: OpportunityResponseDto[];
  claimed: OpportunityResponseDto[];
  connectorContribution: ConnectorContribution;
}

export interface CreateOpportunityRequest {
  title: string;
  description?: string;
}

export interface PassOpportunityRequest {
  passedToKsNumber: string;
}

export interface RespondToOpportunityRequest {
  message: string;
}
