export type ConsultationStatus = 'INVITED' | 'ACTIVE' | 'OPINION_SUBMITTED' | 'CLOSED' | 'REVOKED' | 'EXPIRED';

export interface MasterConsultation {
  id: string;
  agreementId: string;
  masterProfileId: string;
  masterKsNumber?: string | null;
  category?: string | null;
  status: ConsultationStatus;
  currency: string;
  rateMinorPerHour: number;
  feeBearerKsNumber?: string | null;
  startedAt?: string | null;
  expiresAt?: string | null;
  opinionSubmittedAt?: string | null;
  opinion?: string | null;
  scopeSummary?: string | null;
  canExtend?: boolean;
  canRevoke?: boolean;
  canSubmitOpinion?: boolean;
  canMessage?: boolean;
}

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  authorKsNumber?: string | null;
  body: string;
  createdAt: string;
}

export interface CreateConsultationRequest {
  masterProfileId: string;
  requestedHours: number;
  scopeSummary: string;
}

export interface ConsultationMessageRequest { body: string; }
export interface ConsultationOpinionRequest { opinion: string; }
export interface ConsultationExtensionRequest { additionalMinutes: number; }
