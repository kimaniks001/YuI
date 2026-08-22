import { securePayFetch } from './securepayClient';
import type {
  CircleCycleMetricsResponse,
  CircleIntentionResponse,
  CircleInvitationResponse,
  CircleMemberResponse,
  CircleOpportunityShareResponse,
  CircleResponse,
  CreateCircleRequest,
  CycleResponse,
  InviteToCircleRequest,
  LogCircleTextRequest,
  MyCirclesResponse,
  SetCircleStatusRequest,
} from './circleTypes';

export function createCircle(accessToken: string, request: CreateCircleRequest) {
  return securePayFetch<CircleResponse>('/api/v1/circles', { method: 'POST', authHeader: accessToken, body: request });
}

export function getMyCircles(accessToken: string) {
  return securePayFetch<MyCirclesResponse>('/api/v1/circles/me', { authHeader: accessToken });
}

export function getCircle(accessToken: string, circleId: string) {
  return securePayFetch<CircleResponse>(`/api/v1/circles/${circleId}`, { authHeader: accessToken });
}

export function listCircleMembers(accessToken: string, circleId: string) {
  return securePayFetch<CircleMemberResponse[]>(`/api/v1/circles/${circleId}/members`, { authHeader: accessToken });
}

export function inviteToCircle(accessToken: string, circleId: string, request: InviteToCircleRequest) {
  return securePayFetch<CircleInvitationResponse>(`/api/v1/circles/${circleId}/invitations`, {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function acceptCircleInvitation(accessToken: string, circleId: string, invitationId: string) {
  return securePayFetch<CircleInvitationResponse>(
    `/api/v1/circles/${circleId}/invitations/${invitationId}/accept`,
    { method: 'POST', authHeader: accessToken }
  );
}

export function declineCircleInvitation(accessToken: string, circleId: string, invitationId: string) {
  return securePayFetch<CircleInvitationResponse>(
    `/api/v1/circles/${circleId}/invitations/${invitationId}/decline`,
    { method: 'POST', authHeader: accessToken }
  );
}

export function setCircleStatus(accessToken: string, circleId: string, request: SetCircleStatusRequest) {
  return securePayFetch<CircleResponse>(`/api/v1/circles/${circleId}/status`, {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function leaveCircle(accessToken: string, circleId: string) {
  return securePayFetch<void>(`/api/v1/circles/${circleId}/leave`, { method: 'POST', authHeader: accessToken });
}

export function listCycles(accessToken: string, circleId: string) {
  return securePayFetch<CycleResponse[]>(`/api/v1/circles/${circleId}/cycles`, { authHeader: accessToken });
}

export function startCycle(accessToken: string, circleId: string) {
  return securePayFetch<CycleResponse>(`/api/v1/circles/${circleId}/cycles`, { method: 'POST', authHeader: accessToken });
}

export function closeCycle(accessToken: string, circleId: string, cycleId: string) {
  return securePayFetch<CycleResponse>(`/api/v1/circles/${circleId}/cycles/${cycleId}/close`, {
    method: 'POST',
    authHeader: accessToken,
  });
}

export function listCircleIntentions(accessToken: string, circleId: string, cycleId: string) {
  return securePayFetch<CircleIntentionResponse[]>(`/api/v1/circles/${circleId}/cycles/${cycleId}/intentions`, {
    authHeader: accessToken,
  });
}

export function logCircleIntention(accessToken: string, circleId: string, cycleId: string, request: LogCircleTextRequest) {
  return securePayFetch<CircleIntentionResponse>(`/api/v1/circles/${circleId}/cycles/${cycleId}/intentions`, {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function listCircleOpportunityShares(accessToken: string, circleId: string, cycleId: string) {
  return securePayFetch<CircleOpportunityShareResponse[]>(
    `/api/v1/circles/${circleId}/cycles/${cycleId}/opportunities`,
    { authHeader: accessToken }
  );
}

export function logCircleOpportunityShare(
  accessToken: string,
  circleId: string,
  cycleId: string,
  request: LogCircleTextRequest
) {
  return securePayFetch<CircleOpportunityShareResponse>(
    `/api/v1/circles/${circleId}/cycles/${cycleId}/opportunities`,
    { method: 'POST', authHeader: accessToken, body: request }
  );
}

export function getCircleCycleMetrics(accessToken: string, circleId: string, cycleId: string) {
  return securePayFetch<CircleCycleMetricsResponse>(`/api/v1/circles/${circleId}/cycles/${cycleId}/metrics`, {
    authHeader: accessToken,
  });
}
