import { securePayFetch } from './securepayClient';
import type {
  ApplyMasterProfileRequest,
  MasterEvidence,
  MasterProfile,
  SetMasterAvailabilityRequest,
  UpdateMasterRateRequest,
} from './masterTypes';

export function applyMasterProfile(accessToken: string, request: ApplyMasterProfileRequest) {
  return securePayFetch<MasterProfile>('/api/v1/masters', { method: 'POST', authHeader: accessToken, body: request });
}

export function discoverMasters(accessToken: string, category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return securePayFetch<MasterProfile[]>(`/api/v1/masters${query}`, { authHeader: accessToken });
}

export function getMyMasterProfiles(accessToken: string) {
  return securePayFetch<MasterProfile[]>('/api/v1/masters/me', { authHeader: accessToken });
}

export function getMasterProfile(accessToken: string, masterId: string) {
  return securePayFetch<MasterProfile>(`/api/v1/masters/${masterId}`, { authHeader: accessToken });
}

export function getMasterEvidence(accessToken: string, masterId: string) {
  return securePayFetch<MasterEvidence>(`/api/v1/masters/${masterId}/evidence`, { authHeader: accessToken });
}

export function updateMasterRate(accessToken: string, masterId: string, request: UpdateMasterRateRequest) {
  return securePayFetch<MasterProfile>(`/api/v1/masters/${masterId}/rate`, {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function setMasterAvailability(accessToken: string, masterId: string, request: SetMasterAvailabilityRequest) {
  return securePayFetch<MasterProfile>(`/api/v1/masters/${masterId}/availability`, {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function revokeMasterProfile(accessToken: string, masterId: string) {
  return securePayFetch<MasterProfile>(`/api/v1/masters/${masterId}/revoke`, { method: 'POST', authHeader: accessToken });
}
