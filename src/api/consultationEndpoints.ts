import { securePayFetch } from './securepayClient';
import type {
  ConsultationExtensionRequest,
  ConsultationMessage,
  ConsultationMessageRequest,
  ConsultationOpinionRequest,
  CreateConsultationRequest,
  MasterConsultation,
} from './consultationTypes';

/**
 * MW-11 client seam. These calls intentionally fail closed until SecurePayAPI
 * exposes the final consultation contract. The blend pass reconciles paths and
 * payload details; YUI never manufactures consultation authority locally.
 */
export function listAgreementConsultations(accessToken: string, agreementId: string) {
  return securePayFetch<MasterConsultation[]>(`/api/v1/agreements/${agreementId}/consultations`, { authHeader: accessToken });
}

export function createAgreementConsultation(accessToken: string, agreementId: string, request: CreateConsultationRequest) {
  return securePayFetch<MasterConsultation>(`/api/v1/agreements/${agreementId}/consultations`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function getConsultation(accessToken: string, agreementId: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`/api/v1/agreements/${agreementId}/consultations/${consultationId}`, { authHeader: accessToken });
}

export function listConsultationMessages(accessToken: string, agreementId: string, consultationId: string) {
  return securePayFetch<ConsultationMessage[]>(`/api/v1/agreements/${agreementId}/consultations/${consultationId}/messages`, { authHeader: accessToken });
}

export function postConsultationMessage(accessToken: string, agreementId: string, consultationId: string, request: ConsultationMessageRequest) {
  return securePayFetch<ConsultationMessage>(`/api/v1/agreements/${agreementId}/consultations/${consultationId}/messages`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function submitConsultationOpinion(accessToken: string, agreementId: string, consultationId: string, request: ConsultationOpinionRequest) {
  return securePayFetch<MasterConsultation>(`/api/v1/agreements/${agreementId}/consultations/${consultationId}/opinion`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function extendConsultation(accessToken: string, agreementId: string, consultationId: string, request: ConsultationExtensionRequest) {
  return securePayFetch<MasterConsultation>(`/api/v1/agreements/${agreementId}/consultations/${consultationId}/extend`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}

export function closeConsultation(accessToken: string, agreementId: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`/api/v1/agreements/${agreementId}/consultations/${consultationId}/close`, {
    method: 'POST', authHeader: accessToken,
  });
}

export function revokeConsultation(accessToken: string, agreementId: string, consultationId: string) {
  return securePayFetch<MasterConsultation>(`/api/v1/agreements/${agreementId}/consultations/${consultationId}/revoke`, {
    method: 'POST', authHeader: accessToken,
  });
}
