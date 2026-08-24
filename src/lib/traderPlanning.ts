import type { CurrentUserAgreementSummary } from '../api/securepayTypes';

export interface TraderPlannerEvent {
  agreementId: string;
  title: string;
  deadline: Date;
  reason: string;
  attention: boolean;
}

export interface TraderPlannerDay {
  key: string;
  date: Date;
  events: TraderPlannerEvent[];
}

function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDeadline(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function collectTraderPlannerEvents(agreements: CurrentUserAgreementSummary[]): TraderPlannerEvent[] {
  const seen = new Set<string>();
  const events: TraderPlannerEvent[] = [];

  for (const agreement of agreements) {
    const datedActions = agreement.nextActions.flatMap(action => {
      const deadline = parseDeadline(action.deadline);
      return deadline ? [{ action, deadline }] : [];
    });

    if (datedActions.length) {
      for (const { action, deadline } of datedActions) {
        const key = `${agreement.agreementId}:${deadline.toISOString()}:${action.actionCode}`;
        if (seen.has(key)) continue;
        seen.add(key);
        events.push({
          agreementId: agreement.agreementId,
          title: agreement.title,
          deadline,
          reason: action.reason || 'Agreement action due',
          attention: agreement.attentionRequired || action.attentionClass.toUpperCase() === 'HIGH',
        });
      }
      continue;
    }

    const deadline = parseDeadline(agreement.nextDeadline);
    if (!deadline) continue;
    const key = `${agreement.agreementId}:${deadline.toISOString()}:agreement`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      agreementId: agreement.agreementId,
      title: agreement.title,
      deadline,
      reason: 'Agreement deadline',
      attention: agreement.attentionRequired,
    });
  }

  return events.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
}

export function buildTraderPlanningWeek(events: TraderPlannerEvent[]): TraderPlannerDay[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = localDayKey(date);
    return {
      key,
      date,
      events: events.filter(event => localDayKey(event.deadline) === key),
    };
  });
}

export function countComingUpThisWeek(agreements: CurrentUserAgreementSummary[]): number {
  const events = collectTraderPlannerEvents(agreements);
  return buildTraderPlanningWeek(events).reduce((total, day) => total + day.events.length, 0);
}
