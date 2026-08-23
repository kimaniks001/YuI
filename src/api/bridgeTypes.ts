import type { SecurePayAgreement } from './securepayTypes';

export type BridgeSourceWorld = 'TRAINER' | 'GAME';
export type DraftIntentStatus = 'DRAFT' | 'PROMOTED' | 'DISCARDED';

export interface DraftIntent {
  id: string;
  sourceWorld: BridgeSourceWorld;
  agreementType: string;
  title: string;
  purpose?: string | null;
  description?: string | null;
  currency: 'KES';
  suggestedAmountMinor?: number | null;
  status: DraftIntentStatus;
  promotedAgreementId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureDraftIntentRequest {
  sourceWorld: BridgeSourceWorld;
  agreementType: string;
  title: string;
  purpose?: string;
  description?: string;
  suggestedAmountMinor?: number;
}

export interface PromoteDraftIntentRequest { idempotencyKey: string; }
export type PromotedAgreement = SecurePayAgreement;
