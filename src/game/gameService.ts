import { deterministicScenario, GAME_SCENARIOS } from './scenarios';
import { scoreGameProfile } from './scoring';
import type {
  GameAgreement,
  GameAgreementKind,
  GameCardFamily,
  GameChallenge,
  GameChallengeKind,
  GameCyclePlan,
  GameRoom,
  GameScenario,
  GameScenarioChoice,
  GameSeasonScore,
  GameSnapshot,
} from './gameTypes';

const STORAGE_KEY = 'securepay.market-game.authority.v1';
const CYCLE_DAYS = 30;
const INITIAL_COINS: Record<GameCyclePlan, number> = { PERSONAL: 5, BUSINESS: 12 };

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
  return new Date().toISOString();
}

function clampHealth(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function defaultSnapshot(name = 'Trader'): GameSnapshot {
  return {
    version: 1,
    profile: {
      id: id('player'),
      displayName: name,
      capital: 100_000,
      resources: 5,
      health: { trade: 70, life: 70, resilience: 70 },
      coinLedger: [],
      achievements: [],
      history: [],
      collaboration: 0,
      circleContribution: 0,
      communityContribution: 0,
      obligationsCompleted: 0,
      productiveReferrals: 0,
      recoveryResponsibility: 0,
    },
    agreements: [],
    challenges: defaultChallenges(),
    scenarioHistory: [],
  };
}

function defaultChallenges(): GameChallenge[] {
  const rows: Array<[GameChallengeKind, string, string]> = [
    ['SECURELINK', 'Send a simulated SecureLink', 'Practise stating the parties, amount, obligation and evidence before commitment.'],
    ['QR', 'Use a Game Store QR', 'Follow a simulated offer entry without creating a real reservation, sale or payment.'],
    ['STORE_VISIT', 'Visit another Game Store', 'Look at availability and context before choosing to trade.'],
    ['OPPORTUNITY_PASS', 'Pass an opportunity', 'Help work reach another player without claiming an automatic reward.'],
    ['CIRCLE', 'Complete a Circle mission', 'Coordinate a small team around one explicit Game intention.'],
    ['COMMUNITY', 'Support a Community mission', 'Contribute to a shared Game outcome without implying endorsement.'],
  ];
  return rows.map(([kind, title, detail], index) => ({ id: `challenge-${index + 1}`, kind, title, detail, replayCount: 0 }));
}

function save(snapshot: GameSnapshot) {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

function load(): GameSnapshot {
  if (typeof window === 'undefined') return defaultSnapshot();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return save(defaultSnapshot());
  try {
    const parsed = JSON.parse(raw) as GameSnapshot;
    if (parsed?.version !== 1 || !parsed.profile) throw new Error('bad snapshot');
    return parsed;
  } catch {
    return save(defaultSnapshot());
  }
}

function mutate(fn: (snapshot: GameSnapshot) => void): GameSnapshot {
  const snapshot = load();
  fn(snapshot);
  return save(snapshot);
}

export interface GameService {
  getSnapshot(): GameSnapshot;
  reset(name?: string): GameSnapshot;
  rename(displayName: string): GameSnapshot;
  startCycle(plan: GameCyclePlan): GameSnapshot;
  drawScenario(family?: GameCardFamily): GameScenario;
  chooseScenario(scenarioId: string, version: number, choiceId: string): GameSnapshot;
  createAgreement(kind: GameAgreementKind, title: string, amount: number): GameSnapshot;
  addAgreementEvidence(agreementId: string, evidence: string): GameSnapshot;
  confirmAgreement(agreementId: string, confirmation: string): GameSnapshot;
  openGameRecovery(agreementId: string): GameSnapshot;
  addGameMasterOpinion(agreementId: string, opinion: string): GameSnapshot;
  resolveAgreement(agreementId: string): GameSnapshot;
  createRoom(name: string, memberNames: string[]): GameSnapshot;
  setRoomReady(memberId: string, ready: boolean): GameSnapshot;
  startRoom(): GameSnapshot;
  addRoomChat(memberId: string, body: string): GameSnapshot;
  completeChallenge(challengeId: string): GameSnapshot;
  replayChallenge(challengeId: string): GameSnapshot;
  score(): GameSeasonScore;
}

export const browserGameService: GameService = {
  getSnapshot: load,

  reset(name) {
    return save(defaultSnapshot(name));
  },

  rename(displayName) {
    return mutate(snapshot => { snapshot.profile.displayName = displayName.trim() || 'Trader'; });
  },

  startCycle(plan) {
    return mutate(snapshot => {
      const coins = INITIAL_COINS[plan];
      const startedAt = now();
      const endsAt = new Date(Date.now() + CYCLE_DAYS * 86_400_000).toISOString();
      if (snapshot.profile.cycle && !snapshot.profile.cycle.closedAt) snapshot.profile.cycle.closedAt = startedAt;
      const cycleId = id('cycle');
      snapshot.profile.cycle = { id: cycleId, plan, startedAt, endsAt, initialCoins: coins, coinBalance: coins };
      snapshot.profile.coinLedger.push({ id: id('coin'), at: startedAt, delta: coins, reason: `${plan} Game Cycle entitlement`, cycleId });
      snapshot.profile.history.unshift({ id: id('history'), at: startedAt, title: `${plan === 'PERSONAL' ? 'Personal' : 'Business'} Game Cycle started`, detail: `${coins} Cycle Coins issued. Previous Cycle Coins do not roll over.` });
    });
  },

  drawScenario(family) {
    return deterministicScenario(load().scenarioHistory, family);
  },

  chooseScenario(scenarioId, version, choiceId) {
    return mutate(snapshot => {
      const scenario = GAME_SCENARIOS.find(item => item.id === scenarioId && item.version === version);
      if (!scenario) throw new Error('That Game card version is not available.');
      const choice: GameScenarioChoice | undefined = scenario.choices.find(item => item.id === choiceId);
      if (!choice) throw new Error('That Game choice is not available.');
      snapshot.profile.capital = Math.max(0, snapshot.profile.capital + choice.capitalDelta);
      snapshot.profile.resources = Math.max(0, snapshot.profile.resources + choice.resourcesDelta);
      snapshot.profile.health.trade = clampHealth(snapshot.profile.health.trade + choice.tradeDelta);
      snapshot.profile.health.life = clampHealth(snapshot.profile.health.life + choice.lifeDelta);
      snapshot.profile.health.resilience = clampHealth(snapshot.profile.health.resilience + choice.resilienceDelta);
      snapshot.scenarioHistory.push(`${scenario.id}@${scenario.version}`);
      snapshot.profile.history.unshift({ id: id('history'), at: now(), title: scenario.title, detail: `${choice.label}: ${choice.consequence}`, family: scenario.family });
    });
  },

  createAgreement(kind, title, amount) {
    return mutate(snapshot => {
      snapshot.agreements.unshift({ id: id('agreement'), kind, title: title.trim() || 'Game agreement', amount: Math.max(0, Math.round(amount)), status: 'ACTIVE', createdAt: now(), evidence: [], confirmations: [] });
    });
  },

  addAgreementEvidence(agreementId, evidence) {
    return mutate(snapshot => {
      const agreement = snapshot.agreements.find(item => item.id === agreementId);
      if (!agreement) throw new Error('Game agreement not found.');
      agreement.evidence.push(evidence.trim() || 'Evidence added');
      agreement.status = 'EVIDENCE_ADDED';
    });
  },

  confirmAgreement(agreementId, confirmation) {
    return mutate(snapshot => {
      const agreement = snapshot.agreements.find(item => item.id === agreementId);
      if (!agreement) throw new Error('Game agreement not found.');
      agreement.confirmations.push(confirmation.trim() || 'Confirmed');
      agreement.status = 'CONFIRMED';
      snapshot.profile.obligationsCompleted += 1;
    });
  },

  openGameRecovery(agreementId) {
    return mutate(snapshot => {
      const agreement = snapshot.agreements.find(item => item.id === agreementId);
      const cycle = snapshot.profile.cycle;
      if (!agreement) throw new Error('Game agreement not found.');
      if (!cycle || cycle.coinBalance < 1) throw new Error('A Game Recovery action costs 1 Cycle Coin. Start or renew a Cycle first.');
      cycle.coinBalance -= 1;
      snapshot.profile.coinLedger.push({ id: id('coin'), at: now(), delta: -1, reason: `Game Recovery for ${agreement.title}`, cycleId: cycle.id });
      snapshot.profile.recoveryResponsibility += 1;
      agreement.status = 'RECOVERY';
      agreement.recoveryOpenedAt = now();
    });
  },

  addGameMasterOpinion(agreementId, opinion) {
    return mutate(snapshot => {
      const agreement = snapshot.agreements.find(item => item.id === agreementId);
      if (!agreement || agreement.status !== 'RECOVERY') throw new Error('A Game Master Opinion belongs inside an active Game Recovery.');
      if (agreement.masterOpinion) throw new Error('The Game Master Opinion is already recorded for this recovery.');
      agreement.masterOpinion = opinion.trim() || 'Game Master Opinion recorded.';
    });
  },

  resolveAgreement(agreementId) {
    return mutate(snapshot => {
      const agreement = snapshot.agreements.find(item => item.id === agreementId);
      if (!agreement) throw new Error('Game agreement not found.');
      agreement.status = 'RESOLVED';
    });
  },

  createRoom(name, memberNames) {
    return mutate(snapshot => {
      const members = (memberNames.length ? memberNames : [snapshot.profile.displayName]).slice(0, 8).map((memberName, index) => ({ id: id('member'), name: memberName.trim() || `Trader ${index + 1}`, ready: index === 0, connected: true }));
      const room: GameRoom = { id: id('room'), code: Math.random().toString(36).slice(2, 8).toUpperCase(), hostId: members[0].id, name: name.trim() || 'Market Room', status: 'LOBBY', members, round: 0, createdAt: now(), updatedAt: now(), chat: [], groupSessionBillingState: members.length > 2 ? 'PAYER_RULE_UNRESOLVED' : 'NOT_APPLICABLE' };
      snapshot.room = room;
    });
  },

  setRoomReady(memberId, ready) {
    return mutate(snapshot => {
      if (!snapshot.room) throw new Error('No Game room exists.');
      const member = snapshot.room.members.find(item => item.id === memberId);
      if (!member) throw new Error('Room member not found.');
      member.ready = ready;
      snapshot.room.updatedAt = now();
    });
  },

  startRoom() {
    return mutate(snapshot => {
      if (!snapshot.room) throw new Error('No Game room exists.');
      if (snapshot.room.members.length > 2 && snapshot.room.groupSessionBillingState === 'PAYER_RULE_UNRESOLVED') throw new Error('Group Game billing payer rule is not locked yet. The room can be tested locally but live paid session billing stays disabled.');
      if (!snapshot.room.members.every(member => member.ready)) throw new Error('Everyone must be ready before the room starts.');
      snapshot.room.status = 'ACTIVE';
      snapshot.room.round = 1;
      snapshot.room.updatedAt = now();
    });
  },

  addRoomChat(memberId, body) {
    return mutate(snapshot => {
      if (!snapshot.room) throw new Error('No Game room exists.');
      if (!snapshot.room.members.some(member => member.id === memberId)) throw new Error('Room member not found.');
      snapshot.room.chat.push({ id: id('chat'), memberId, body: body.trim(), at: now() });
      snapshot.room.updatedAt = now();
    });
  },

  completeChallenge(challengeId) {
    return mutate(snapshot => {
      const challenge = snapshot.challenges.find(item => item.id === challengeId);
      if (!challenge) throw new Error('Challenge not found.');
      if (challenge.completedAt) return;
      challenge.completedAt = now();
      if (challenge.kind === 'CIRCLE') snapshot.profile.circleContribution += 1;
      if (challenge.kind === 'COMMUNITY') snapshot.profile.communityContribution += 1;
      if (challenge.kind === 'OPPORTUNITY_PASS') snapshot.profile.productiveReferrals += 1;
      snapshot.profile.collaboration += ['STORE_VISIT', 'QR', 'SECURELINK'].includes(challenge.kind) ? 1 : 2;
      snapshot.profile.history.unshift({ id: id('history'), at: challenge.completedAt, title: challenge.title, detail: 'Game challenge completed. This creates Game history only.' });
    });
  },

  replayChallenge(challengeId) {
    return mutate(snapshot => {
      const challenge = snapshot.challenges.find(item => item.id === challengeId);
      if (!challenge) throw new Error('Challenge not found.');
      challenge.replayCount += 1;
    });
  },

  score() {
    return scoreGameProfile(load().profile);
  },
};
