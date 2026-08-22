export type GameCyclePlan = 'PERSONAL' | 'BUSINESS';
export type GameCardFamily = 'TRADE' | 'LIFE' | 'BALANCE' | 'MARKET';
export type GameAgreementKind = 'SECURELINK' | 'GROUP_SECURELINK' | 'SECUREFLOW' | 'GROUP_SECUREFLOW';
export type GameAgreementStatus = 'DRAFT' | 'ACTIVE' | 'EVIDENCE_ADDED' | 'CONFIRMED' | 'RECOVERY' | 'RESOLVED';
export type GameRoomStatus = 'LOBBY' | 'ACTIVE' | 'COMPLETE';
export type GameChallengeKind = 'SECURELINK' | 'QR' | 'STORE_VISIT' | 'OPPORTUNITY_PASS' | 'CIRCLE' | 'COMMUNITY';

export interface GameHealth {
  trade: number;
  life: number;
  resilience: number;
}

export interface GameCoinEntry {
  id: string;
  at: string;
  delta: number;
  reason: string;
  cycleId: string;
}

export interface GameCycle {
  id: string;
  plan: GameCyclePlan;
  startedAt: string;
  endsAt: string;
  initialCoins: number;
  coinBalance: number;
  closedAt?: string;
}

export interface GameAchievement {
  id: string;
  label: string;
  earnedAt: string;
  detail: string;
}

export interface GameHistoryEntry {
  id: string;
  at: string;
  title: string;
  detail: string;
  family?: GameCardFamily;
}

export interface GameProfile {
  id: string;
  displayName: string;
  capital: number;
  resources: number;
  health: GameHealth;
  cycle?: GameCycle;
  coinLedger: GameCoinEntry[];
  achievements: GameAchievement[];
  history: GameHistoryEntry[];
  collaboration: number;
  circleContribution: number;
  communityContribution: number;
  obligationsCompleted: number;
  productiveReferrals: number;
  recoveryResponsibility: number;
}

export interface GameScenarioChoice {
  id: string;
  label: string;
  consequence: string;
  capitalDelta: number;
  resourcesDelta: number;
  tradeDelta: number;
  lifeDelta: number;
  resilienceDelta: number;
}

export interface GameScenario {
  id: string;
  version: number;
  family: GameCardFamily;
  title: string;
  context: string;
  ageBand: 'GENERAL' | '16+' | '18+';
  choices: GameScenarioChoice[];
}

export interface GameAgreement {
  id: string;
  kind: GameAgreementKind;
  title: string;
  amount: number;
  status: GameAgreementStatus;
  createdAt: string;
  evidence: string[];
  confirmations: string[];
  recoveryOpenedAt?: string;
  masterOpinion?: string;
}

export interface GameRoomMember {
  id: string;
  name: string;
  ready: boolean;
  connected: boolean;
}

export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  name: string;
  status: GameRoomStatus;
  members: GameRoomMember[];
  round: number;
  createdAt: string;
  updatedAt: string;
  chat: Array<{ id: string; memberId: string; body: string; at: string }>;
  groupSessionBillingState: 'NOT_APPLICABLE' | 'PAYER_RULE_UNRESOLVED' | 'READY';
}

export interface GameChallenge {
  id: string;
  kind: GameChallengeKind;
  title: string;
  detail: string;
  completedAt?: string;
  replayCount: number;
}

export interface GameSeasonScore {
  playerId: string;
  displayName: string;
  economicGrowth: number;
  balance: number;
  obligations: number;
  collaboration: number;
  circleCommunity: number;
  recovery: number;
  referrals: number;
  total: number;
  explanation: string[];
  gameMaster: boolean;
}

export interface GameSnapshot {
  version: 1;
  profile: GameProfile;
  agreements: GameAgreement[];
  room?: GameRoom;
  challenges: GameChallenge[];
  scenarioHistory: string[];
}
