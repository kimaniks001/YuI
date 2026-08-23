import { securePayFetch } from './securepayClient';
import type {
  ConsultationExtensionRequest,
  ConsultationExtensionRequestRecord,
  ConsultationMessage,
  ConsultationMessageRequest,
  ConsultationOpinion,
  ConsultationOpinionRequest,
  CreateConsultationRequest,
  MasterConsultation,
  ScopedAgreementContext,
} from './consultationTypes';

const base = '/api/v1/consultations';

export async function listAgreementConsultations(accessToken: string, agreementId: string) {
  const result = await securePayFetch<MasterConsultation[]>(`${base}/me`, { authHeader: accessToken });
  if (!result.ok || !result.data) return result;
  return { ...result, data: result.data.filter(item => item.agreementId === agreementId) };
}

export function createAgreementConsultation(accessToken: string, request: CreateConsultationRequest) {
  return securePayFetch<MasterConsultation>(base, { method: 'POST', authHeader: accessToken, body: request });
}

export function getConsultation(accessToken: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`${base}/${consultationId}`, { authHeader: accessToken });
}

export function getConsultationContext(accessToken: string, consultationId: string) {
  return securePayFetch<ScopedAgreementContext>(`${base}/${consultationId}/context`, { authHeader: accessToken });
}

export function acceptConsultation(accessToken: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`${base}/${consultationId}/accept`, { method: 'POST', authHeader: accessToken });
}

export function declineConsultation(accessToken: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`${base}/${consultationId}/decline`, { method: 'POST', authHeader: accessToken });
}

export function closeConsultation(accessToken: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`${base}/${consultationId}/close`, { method: 'POST', authHeader: accessToken });
}

export function revokeConsultation(accessToken: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`${base}/${consultationId}/revoke`, { method: 'POST', authHeader: accessToken });
}

export function listConsultationMessages(accessToken: string, consultationId: string) {
  return securePayFetch<ConsultationMessage[]>(`${base}/${consultationId}/messages`, { authHeader: accessToken });
}

export function postConsultationMessage(accessToken: string, consultationId: string, request: ConsultationMessageRequest) {
  return securePayFetch<ConsultationMessage>(`${base}/${consultationId}/messages`, { method: 'POST', authHeader: accessToken, body: request });
}

export function getConsultationOpinion(accessToken: string, consultationId: string) {
  return securePayFetch<ConsultationOpinion>(`${base}/${consultationId}/opinion`, { authHeader: accessToken });
}

export function submitConsultationOpinion(accessToken: string, consultationId: string, request: ConsultationOpinionRequest) {
  return securePayFetch<ConsultationOpinion>(`${base}/${consultationId}/opinion`, { method: 'POST', authHeader: accessToken, body: request });
}

export function listConsultationExtensionRequests(accessToken: string, consultationId: string) {
  return securePayFetch<ConsultationExtensionRequestRecord[]>(`${base}/${consultationId}/extension-requests`, { authHeader: accessToken });
}

export function requestConsultationExtension(accessToken: string, consultationId: string, request: ConsultationExtensionRequest) {
  return securePayFetch<ConsultationExtensionRequestRecord>(`${base}/${consultationId}/extension-requests`, { method: 'POST', authHeader: accessToken, body: request });
}

export function approveConsultationExtension(accessToken: string, consultationId: string, requestId: string) {
  return securePayFetch<ConsultationExtensionRequestRecord>(`${base}/${consultationId}/extension-requests/${requestId}/approve`, { method: 'POST', authHeader: accessToken });
}

export function rejectConsultationExtension(accessToken: string, consultationId: string, requestId: string) {
  return securePayFetch<ConsultationExtensionRequestRecord>(`${base}/${consultationId}/extension-requests/${requestId}/reject`, { method: 'POST', authHeader: accessToken });
}
