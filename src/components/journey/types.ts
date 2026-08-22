/**
 * Presentation-only journey types. Do not use for backend state machines or financial authority.
 */

import type { ReactNode } from 'react';

export type JourneySemanticStatus =
  | 'neutral'
  | 'informational'
  | 'pending'
  | 'ready'
  | 'success'
  | 'warning'
  | 'blocked'
  | 'error';

export type JourneyStepState = 'completed' | 'current' | 'upcoming' | 'blocked' | 'error';

export interface JourneyStepItem {
  id: string;
  label: string;
  description?: string;
  state: JourneyStepState;
}

export type ParticipantRoleLabel =
  | 'Sender'
  | 'Recipient'
  | 'Buyer'
  | 'Seller'
  | 'Contributor'
  | 'Organizer'
  | 'Beneficiary'
  | 'Approver'
  | 'Reviewer'
  | string;

export interface ParticipantSummary {
  id: string;
  name: string;
  role: ParticipantRoleLabel;
  ksNumber?: string;
  statusLabel?: string;
  pendingAction?: string;
}

export interface ReadinessReasonItem {
  id: string;
  label: string;
  status: 'met' | 'pending' | 'blocked';
}

export interface JourneyStatusCard {
  id: string;
  label: string;
  children: ReactNode;
  urgent?: boolean;
}

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: JourneySemanticStatus;
}

export interface AmountLine {
  label: string;
  amount: number;
  currency?: string;
  emphasis?: boolean;
  muted?: boolean;
}

export interface EvidenceSummaryItem {
  id: string;
  label: string;
  status: 'attached' | 'missing' | 'review' | 'accepted' | 'rejected';
}
