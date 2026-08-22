export type RecoveryStatus = 'OPEN' | 'ENGAGED' | 'STALEMATE' | 'RESOLVED' | 'CLOSED';
export type OpinionDisposition = 'ADOPT' | 'PARTIALLY_ADOPT' | 'IGNORE';

export interface RecoveryRoom {
  id: string;
  agreementId: string;
  status: RecoveryStatus;
  summary?: string | null;
  openedAt?: string | null;
  responseDueAt?: string | null;
  formalDisputeFeeMinor?: number | null;
  currency?: string | null;
  masterConsultationId?: string | null;
  masterOpinion?: string | null;
  resolutionRecord?: string | null;
  canInviteMaster?: boolean;
  canResolve?: boolean;
}

export interface RecoveryMessage {
  id: string;
  authorKsNumber?: string | null;
  body: string;
  createdAt: string;
}

export interface RecoveryEvidence {
  id: string;
  label?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface OpenRecoveryRequest { summary: string; }
export interface RecoveryMessageRequest { body: string; }
export interface RecoveryDispositionRequest { disposition: OpinionDisposition; note?: string; }
export interface ResolveRecoveryRequest { resolutionRecord: string; }
