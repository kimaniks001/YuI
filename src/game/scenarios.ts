import type { GameScenario } from './gameTypes';

export const GAME_SCENARIOS: GameScenario[] = [
  {
    id: 'trade-supplier-discount', version: 1, family: 'TRADE', ageBand: 'GENERAL',
    title: 'Supplier discount with a catch',
    context: 'A supplier offers a strong discount if you commit today, but the delivery terms are vague.',
    choices: [
      { id: 'clarify', label: 'Clarify quantity, delivery and evidence first', consequence: 'You lose a little speed but protect the trade.', capitalDelta: 3500, resourcesDelta: 1, tradeDelta: 8, lifeDelta: 0, resilienceDelta: 5 },
      { id: 'rush', label: 'Take the discount immediately', consequence: 'The delivery mismatch consumes time and margin.', capitalDelta: -5000, resourcesDelta: -1, tradeDelta: -6, lifeDelta: -2, resilienceDelta: -4 },
    ],
  },
  {
    id: 'life-school-fees', version: 1, family: 'LIFE', ageBand: 'GENERAL',
    title: 'School fees week',
    context: 'A family obligation arrives in the same week as a profitable stock opportunity.',
    choices: [
      { id: 'protect-family', label: 'Meet the family obligation and take a smaller trade', consequence: 'Growth is slower, but your Life side stays strong.', capitalDelta: -2500, resourcesDelta: 0, tradeDelta: -1, lifeDelta: 9, resilienceDelta: 5 },
      { id: 'ignore', label: 'Put everything into stock', consequence: 'Capital grows, but family strain weakens your balance.', capitalDelta: 5000, resourcesDelta: 1, tradeDelta: 6, lifeDelta: -9, resilienceDelta: -4 },
    ],
  },
  {
    id: 'balance-rest-week', version: 1, family: 'BALANCE', ageBand: 'GENERAL',
    title: 'Take a rest week?',
    context: 'You have been growing quickly, but your energy and family time are falling.',
    choices: [
      { id: 'rest', label: 'Take the rest week', consequence: 'You sacrifice some immediate income and rebuild resilience.', capitalDelta: -1200, resourcesDelta: 1, tradeDelta: -2, lifeDelta: 8, resilienceDelta: 10 },
      { id: 'push', label: 'Push through another week', consequence: 'You earn more now but become more fragile.', capitalDelta: 3200, resourcesDelta: -1, tradeDelta: 5, lifeDelta: -5, resilienceDelta: -8 },
    ],
  },
  {
    id: 'market-license-renewal', version: 1, family: 'MARKET', ageBand: 'GENERAL',
    title: 'Business licence renewal',
    context: 'A statutory renewal is due while cash is tight.',
    choices: [
      { id: 'renew', label: 'Renew before taking the next large job', consequence: 'Cash tightens, but the business remains ready for the next opportunity.', capitalDelta: -3000, resourcesDelta: 0, tradeDelta: 2, lifeDelta: 0, resilienceDelta: 7 },
      { id: 'delay', label: 'Delay and hope the next job covers it', consequence: 'The risk follows you into the next round.', capitalDelta: 1500, resourcesDelta: 0, tradeDelta: -4, lifeDelta: -1, resilienceDelta: -6 },
    ],
  },
  {
    id: 'market-community-request', version: 1, family: 'MARKET', ageBand: 'GENERAL',
    title: 'Community support request',
    context: 'Your Community asks members to support a shared project while you are building your own Store.',
    choices: [
      { id: 'support', label: 'Contribute within your means', consequence: 'You give up a little capital and strengthen collaboration.', capitalDelta: -1800, resourcesDelta: 0, tradeDelta: 0, lifeDelta: 4, resilienceDelta: 3 },
      { id: 'decline', label: 'Decline respectfully this Cycle', consequence: 'You protect capital but gain no Community contribution this round.', capitalDelta: 0, resourcesDelta: 0, tradeDelta: 1, lifeDelta: 0, resilienceDelta: 1 },
    ],
  },
];

export function scenariosForFamily(
  family?: GameScenario['family'],
  allowedAgeBands: GameScenario['ageBand'][] = ['GENERAL'],
) {
  return GAME_SCENARIOS.filter(card => (!family || card.family === family) && allowedAgeBands.includes(card.ageBand));
}

export function deterministicScenario(
  history: string[],
  family?: GameScenario['family'],
  allowedAgeBands: GameScenario['ageBand'][] = ['GENERAL'],
): GameScenario {
  const pool = scenariosForFamily(family, allowedAgeBands);
  if (!pool.length) throw new Error('No age-suitable Game scenarios are available for that context.');
  const unseen = pool.filter(card => !history.includes(`${card.id}@${card.version}`));
  return (unseen.length ? unseen : pool)[history.length % (unseen.length || pool.length)];
}
