import { securePayFetch } from './securepayClient';
import type { MasterConsultation } from './consultationTypes';
import type {
  InviteRecoveryMasterRequest,
  OpenRecoveryRequest,
  RecoveryCase,
  RecoveryDisposition,
  RecoveryDispositionRequest,
  RecoveryRoom,
} from './recoveryTypes';

const base = '/api/v1/recovery-cases';

export function openRecoveryCase(accessToken: string, request: OpenRecoveryRequest) {
  return securePayFetch<RecoveryCase>(base, { method: 'POST', authHeader: accessToken, body: request });
}

export function getRecoveryCase(accessToken: string, recoveryCaseId: string) {
  return securePayFetch<RecoveryCase>(`${base}/${recoveryCaseId}`, { authHeader: accessToken });
}

export function getRecoveryRoom(accessToken: string, recoveryCaseId: string) {
  return securePayFetch<RecoveryRoom>(`${base}/${recoveryCaseId}/room`, { authHeader: accessToken });
}

export function closeRecoveryCase(accessToken: string, recoveryCaseId: string) {
  return securePayFetch<RecoveryCase>(`${base}/${recoveryCaseId}/close`, { method: 'POST', authHeader: accessToken });
}

export function inviteRecoveryMaster(accessToken: string, recoveryCaseId: string, request: InviteRecoveryMasterRequest) {
  return securePayFetch<MasterConsultation>(`${base}/${recoveryCaseId}/master-invitation`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function listRecoveryDispositions(accessToken: string, recoveryCaseId: string) {
  return securePayFetch<RecoveryDisposition[]>(`${base}/${recoveryCaseId}/dispositions`, { authHeader: accessToken });
}

export function recordRecoveryDisposition(accessToken: string, recoveryCaseId: string, request: RecoveryDispositionRequest) {
  return securePayFetch<RecoveryDisposition>(`${base}/${recoveryCaseId}/dispositions`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}
