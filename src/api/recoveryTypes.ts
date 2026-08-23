import type { MasterConsultation, ConsultationOpinion } from './consultationTypes';

export type RecoveryCaseStatus = 'OPEN' | 'MASTER_INVITED' | 'CLOSED';
export type OpinionDisposition = 'ADOPT' | 'PARTIALLY_ADOPT' | 'IGNORE';

export interface RecoveryCase {
  id: string;
  reviewCaseId: string;
  agreementId: string;
  openedByIdentityId: string;
  formalDisputeFeeMinor: number;
  status: RecoveryCaseStatus;
  consultationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryDisposition {
  id: string;
  identityId: string;
  disposition: OpinionDisposition;
  note?: string | null;
  recordedAt: string;
}

export interface RecoveryRoom {
  recoveryCase: RecoveryCase;
  consultation?: MasterConsultation | null;
  opinion?: ConsultationOpinion | null;
  dispositions: RecoveryDisposition[];
}

export interface OpenRecoveryRequest {
  reviewCaseId: string;
  agreementId: string;
}

export interface InviteRecoveryMasterRequest {
  masterProfileId: string;
  requestedMinutes: number;
  briefingNotes: string;
}

export interface RecoveryDispositionRequest {
  disposition: OpinionDisposition;
  note?: string;
}
