export type ConsultationStatus = 'INVITED' | 'DECLINED' | 'ACTIVE' | 'CLOSED' | 'REVOKED';

export interface MasterConsultation {
  id: string;
  agreementId: string;
  masterProfileId: string;
  masterIdentityId: string;
  invitedByIdentityId: string;
  status: ConsultationStatus;
  rateMinorPerHourSnapshot: number;
  currency: 'KES';
  requestedMinutes: number;
  additionalMinutesGranted: number;
  feeMinorForRequestedMinutes: number;
  briefingNotes: string;
  paymentIntentId?: string | null;
  accessExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScopedAgreementContext {
  agreementId: string;
  title: string;
  purpose: string;
  status: string;
}

export interface ConsultationMessage {
  id: string;
  authorIdentityId: string;
  body: string;
  createdAt: string;
}

export interface ConsultationOpinion {
  id: string;
  masterIdentityId: string;
  opinionText: string;
  submittedAt: string;
}

export type ConsultationExtensionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface ConsultationExtensionRequestRecord {
  id: string;
  consultationId: string;
  additionalMinutes: number;
  status: ConsultationExtensionStatus;
  createdAt: string;
  decidedAt?: string | null;
}

export interface CreateConsultationRequest {
  agreementId: string;
  masterProfileId: string;
  requestedMinutes: number;
  briefingNotes: string;
}

export interface ConsultationMessageRequest { body: string; }
export interface ConsultationOpinionRequest { opinionText: string; }
export interface ConsultationExtensionRequest { additionalMinutes: number; }
