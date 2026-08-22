import { securePayFetch } from './securepayClient';
import type {
  OpenRecoveryRequest,
  RecoveryDispositionRequest,
  RecoveryEvidence,
  RecoveryMessage,
  RecoveryMessageRequest,
  RecoveryRoom,
  ResolveRecoveryRequest,
} from './recoveryTypes';

/** MW-12 client seam. Real Market recovery authority always remains backend-owned. */
export function getAgreementRecovery(accessToken: string, agreementId: string) {
  return securePayFetch<RecoveryRoom>(`/api/v1/agreements/${agreementId}/recovery`, { authHeader: accessToken });
}

export function openAgreementRecovery(accessToken: string, agreementId: string, request: OpenRecoveryRequest) {
  return securePayFetch<RecoveryRoom>(`/api/v1/agreements/${agreementId}/recovery`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function listRecoveryMessages(accessToken: string, agreementId: string) {
  return securePayFetch<RecoveryMessage[]>(`/api/v1/agreements/${agreementId}/recovery/messages`, { authHeader: accessToken });
}

export function postRecoveryMessage(accessToken: string, agreementId: string, request: RecoveryMessageRequest) {
  return securePayFetch<RecoveryMessage>(`/api/v1/agreements/${agreementId}/recovery/messages`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function listRecoveryEvidence(accessToken: string, agreementId: string) {
  return securePayFetch<RecoveryEvidence[]>(`/api/v1/agreements/${agreementId}/recovery/evidence`, { authHeader: accessToken });
}

export function recordMasterOpinionDisposition(accessToken: string, agreementId: string, request: RecoveryDispositionRequest) {
  return securePayFetch<RecoveryRoom>(`/api/v1/agreements/${agreementId}/recovery/master-opinion/disposition`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function resolveAgreementRecovery(accessToken: string, agreementId: string, request: ResolveRecoveryRequest) {
  return securePayFetch<RecoveryRoom>(`/api/v1/agreements/${agreementId}/recovery/resolve`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}
