import { securePayFetch } from './securepayClient';
import type {
  CreateOpportunityRequest,
  MyMarketConvergenceResponse,
  OpportunityPassResponse,
  OpportunityResponseDto,
  OpportunityResponseRecord,
  PassOpportunityRequest,
  RespondToOpportunityRequest,
} from './opportunityTypes';

export function createOpportunity(accessToken: string, request: CreateOpportunityRequest) {
  return securePayFetch<OpportunityResponseDto>('/api/v1/opportunities', {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function getMyMarketConvergence(accessToken: string) {
  return securePayFetch<MyMarketConvergenceResponse>('/api/v1/opportunities/me', { authHeader: accessToken });
}

export function getOpportunity(accessToken: string, opportunityId: string) {
  return securePayFetch<OpportunityResponseDto>(`/api/v1/opportunities/${opportunityId}`, { authHeader: accessToken });
}

export function passOpportunity(accessToken: string, opportunityId: string, request: PassOpportunityRequest) {
  return securePayFetch<OpportunityPassResponse>(`/api/v1/opportunities/${opportunityId}/pass`, {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function getOpportunityProvenance(accessToken: string, opportunityId: string) {
  return securePayFetch<OpportunityPassResponse[]>(`/api/v1/opportunities/${opportunityId}/provenance`, {
    authHeader: accessToken,
  });
}

export function respondToOpportunity(accessToken: string, opportunityId: string, request: RespondToOpportunityRequest) {
  return securePayFetch<OpportunityResponseRecord>(`/api/v1/opportunities/${opportunityId}/respond`, {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function listOpportunityResponses(accessToken: string, opportunityId: string) {
  return securePayFetch<OpportunityResponseRecord[]>(`/api/v1/opportunities/${opportunityId}/responses`, {
    authHeader: accessToken,
  });
}

export function claimOpportunity(accessToken: string, opportunityId: string) {
  return securePayFetch<OpportunityResponseDto>(`/api/v1/opportunities/${opportunityId}/claim`, {
    method: 'POST',
    authHeader: accessToken,
  });
}

export function closeOpportunity(accessToken: string, opportunityId: string) {
  return securePayFetch<OpportunityResponseDto>(`/api/v1/opportunities/${opportunityId}/close`, {
    method: 'POST',
    authHeader: accessToken,
  });
}
