export type SecurePayStructuredConditionType = 'TIME' | 'LOCATION';

export type SecurePayConditionEvaluationStatus =
  | 'PENDING'
  | 'SATISFIED'
  | 'NOT_SATISFIED'
  | 'INDETERMINATE'
  | 'EXPIRED';

export interface SecurePayAgreementCondition {
  id: string;
  obligationId: string;
  conditionType: string;
  parameters: Record<string, unknown>;
  evaluatorType: string;
  required: boolean;
  createdAt: string;
}

export interface SecurePayConditionEvaluation {
  id: string;
  conditionId: string;
  status: SecurePayConditionEvaluationStatus;
  evaluationSource: string;
  reason: string | null;
  supportingEvidenceIds: string[];
  evaluatedAt: string;
}

export interface CreateTimeConditionRequestBody {
  conditionType: 'TIME';
  parameters: {
    notBefore?: string;
    notAfter?: string;
    windowStart?: string;
    windowEnd?: string;
  };
  evaluatorType: 'TIME';
  required: boolean;
}

export interface CreateLocationConditionRequestBody {
  conditionType: 'LOCATION';
  parameters: {
    expectedLatitude: number;
    expectedLongitude: number;
    radiusMetres: number;
    accuracyThresholdMetres: number;
    maxAgeSeconds?: number;
    locationLabel?: string;
  };
  evaluatorType: 'LOCATION';
  required: boolean;
}

export type CreateStructuredConditionRequestBody =
  | CreateTimeConditionRequestBody
  | CreateLocationConditionRequestBody;

export interface LocationEvaluationClaim {
  latitude: number;
  longitude: number;
  accuracyMetres: number;
  capturedAt: string;
}

export interface EvaluateConditionRequestBody {
  idempotencyKey: string;
  evaluationSource: string;
  reason?: string;
  supportingEvidenceIds?: string[];
  locationClaim?: LocationEvaluationClaim;
  requestedStatus?: SecurePayConditionEvaluationStatus;
}
