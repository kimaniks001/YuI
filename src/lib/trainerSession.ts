export const TRAINER_SESSION_KEY = 'securepay.trainer.session.v1';

export type TrainerStageId =
  | 'identity-store'
  | 'securelink'
  | 'group-flow'
  | 'evidence-recovery'
  | 'real-market';

export interface TrainerSessionState {
  version: 1;
  role: 'plug' | 'trader' | 'staff' | 'developer' | 'partner';
  completed: TrainerStageId[];
  startedAt: string;
}

export const TRAINER_STAGES: Array<{
  id: TrainerStageId;
  title: string;
  teachingPoint: string;
  demoPath: string;
}> = [
  {
    id: 'identity-store',
    title: 'Who are you and what do you offer?',
    teachingPoint: 'KS Number is identity. KS Store is the Market address. A listing is not a reservation or sale.',
    demoPath: '/trainer/store',
  },
  {
    id: 'securelink',
    title: 'Turn intention into an agreement',
    teachingPoint: 'Start from what the trader wants the money to do. Creator is not automatically payer.',
    demoPath: '/trainer/create',
  },
  {
    id: 'group-flow',
    title: 'See how many people work together',
    teachingPoint: 'Contributions, governance and distribution are separate ideas. Approval is not settlement.',
    demoPath: '/trainer/flows',
  },
  {
    id: 'evidence-recovery',
    title: 'What happens when work or expectations differ?',
    teachingPoint: 'Evidence supports understanding. Recovery & Resolution records a process; SecurePay is not the judge.',
    demoPath: '/trainer/recovery',
  },
  {
    id: 'real-market',
    title: 'Move from learning to real trade safely',
    teachingPoint: 'Only draft intention crosses. Real identity, agreement, consent and money truth must be established again in Market.',
    demoPath: '/trainer/session',
  },
];

function isRole(value: unknown): value is TrainerSessionState['role'] {
  return value === 'plug' || value === 'trader' || value === 'staff' || value === 'developer' || value === 'partner';
}

function isStage(value: unknown): value is TrainerStageId {
  return TRAINER_STAGES.some(stage => stage.id === value);
}

export function newTrainerSession(role: TrainerSessionState['role'] = 'plug'): TrainerSessionState {
  return { version: 1, role, completed: [], startedAt: new Date().toISOString() };
}

export function readTrainerSession(): TrainerSessionState {
  if (typeof window === 'undefined') return newTrainerSession();
  try {
    const raw = window.sessionStorage.getItem(TRAINER_SESSION_KEY);
    if (!raw) return newTrainerSession();
    const parsed = JSON.parse(raw) as Partial<TrainerSessionState>;
    if (parsed.version !== 1 || !isRole(parsed.role) || typeof parsed.startedAt !== 'string' || !Array.isArray(parsed.completed)) {
      return newTrainerSession();
    }
    return {
      version: 1,
      role: parsed.role,
      startedAt: parsed.startedAt,
      completed: parsed.completed.filter(isStage),
    };
  } catch {
    return newTrainerSession();
  }
}

export function saveTrainerSession(state: TrainerSessionState): TrainerSessionState {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(TRAINER_SESSION_KEY, JSON.stringify(state));
  }
  return state;
}

export function setTrainerRole(role: TrainerSessionState['role']): TrainerSessionState {
  const state = { ...readTrainerSession(), role };
  return saveTrainerSession(state);
}

export function toggleTrainerStage(stageId: TrainerStageId): TrainerSessionState {
  const current = readTrainerSession();
  const completed = current.completed.includes(stageId)
    ? current.completed.filter(id => id !== stageId)
    : [...current.completed, stageId];
  return saveTrainerSession({ ...current, completed });
}

export function resetTrainerSession(role: TrainerSessionState['role'] = 'plug'): TrainerSessionState {
  const state = newTrainerSession(role);
  return saveTrainerSession(state);
}
