import { securePayFetch } from './securepayClient';
import type {
  CreateLocationConditionRequestBody,
  CreateTimeConditionRequestBody,
  LocationEvaluationClaim,
  SecurePayAgreementCondition,
  SecurePayConditionEvaluation,
} from './agreementConditionTypes';

function agreementPath(agreementId: string): string {
  return `/api/v1/agreements/${encodeURIComponent(agreementId)}`;
}

function conditionPath(agreementId: string, conditionId: string): string {
  return `${agreementPath(agreementId)}/conditions/${encodeURIComponent(conditionId)}`;
}

export async function listAgreementConditions(agreementId: string, authHeader?: string) {
  return securePayFetch<SecurePayAgreementCondition[]>(`${agreementPath(agreementId)}/conditions`, {
    authHeader,
  });
}

export async function createTimeCondition(
  agreementId: string,
  obligationId: string,
  parameters: CreateTimeConditionRequestBody['parameters'],
  required: boolean,
  authHeader?: string
) {
  const body: CreateTimeConditionRequestBody = {
    conditionType: 'TIME',
    parameters,
    evaluatorType: 'TIME',
    required,
  };
  return securePayFetch<SecurePayAgreementCondition>(
    `${agreementPath(agreementId)}/obligations/${encodeURIComponent(obligationId)}/conditions`,
    { method: 'POST', body, authHeader }
  );
}

export async function createLocationCondition(
  agreementId: string,
  obligationId: string,
  parameters: CreateLocationConditionRequestBody['parameters'],
  required: boolean,
  authHeader?: string
) {
  const body: CreateLocationConditionRequestBody = {
    conditionType: 'LOCATION',
    parameters,
    evaluatorType: 'LOCATION',
    required,
  };
  return securePayFetch<SecurePayAgreementCondition>(
    `${agreementPath(agreementId)}/obligations/${encodeURIComponent(obligationId)}/conditions`,
    { method: 'POST', body, authHeader }
  );
}

/**
 * TIME conditions are evaluated against the backend Clock. No browser timestamp
 * or caller-selected status is sent, so the client cannot declare that a time
 * window has been reached.
 */
export async function evaluateTimeCondition(
  agreementId: string,
  conditionId: string,
  idempotencyKey: string,
  authHeader?: string
) {
  const body = {
    idempotencyKey,
    evaluationSource: 'SECUREPAY_SERVER_TIME',
  };
  return securePayFetch<SecurePayConditionEvaluation>(`${conditionPath(agreementId, conditionId)}/evaluate`, {
    method: 'POST',
    body,
    authHeader,
  });
}

/**
 * Browser geolocation is submitted as a claim only. The backend owns accuracy,
 * freshness and distance evaluation and returns the authoritative status.
 */
export async function evaluateLocationCondition(
  agreementId: string,
  conditionId: string,
  idempotencyKey: string,
  locationClaim: LocationEvaluationClaim,
  authHeader?: string
) {
  const body = {
    idempotencyKey,
    evaluationSource: 'BROWSER_GEOLOCATION_CLAIM',
    locationClaim,
  };
  return securePayFetch<SecurePayConditionEvaluation>(`${conditionPath(agreementId, conditionId)}/evaluate`, {
    method: 'POST',
    body,
    authHeader,
  });
}
