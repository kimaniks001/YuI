import { describe, expect, it } from 'vitest';
import {
  agreementQuality,
  buildAgreementBlueprint,
  extractExplicitStages,
  parseKenyanAmountMinor,
} from './agreementIntelligence';
import type { CreationIntent } from './creationIntent';

function intent(statement: string, overrides: Partial<CreationIntent> = {}): CreationIntent {
  return {
    id: 'test',
    family: 'trade',
    statement,
    who: 'You (Payer) → Contractor to be confirmed',
    what: 'Building work',
    amount: 'KES 6,000,000',
    mustHappen: 'The agreed work is completed before money follows the agreement.',
    nextStep: 'Confirm the contractor, work and conditions.',
    nextStepShort: 'Confirm agreement',
    moneyMoves: 'Only according to the agreement.',
    ...overrides,
  };
}

describe('agreement intelligence', () => {
  it('parses common Kenyan amount forms including the previously missed suffix form', () => {
    expect(parseKenyanAmountMinor('4000ksh')).toBe(400_000);
    expect(parseKenyanAmountMinor('4,000 KSh')).toBe(400_000);
    expect(parseKenyanAmountMinor('KSh 4,000')).toBe(400_000);
    expect(parseKenyanAmountMinor('KES 4,000')).toBe(400_000);
    expect(parseKenyanAmountMinor('4k')).toBe(400_000);
    expect(parseKenyanAmountMinor('6m')).toBe(600_000_000);
  });

  it('remembers explicit house stages instead of asking whether stages would help', () => {
    const house = intent('I want someone to build for me a house for KES 6m. It will have 4 stages: foundation, walling, roofing and finishing.');
    const stages = extractExplicitStages(house);

    expect(stages.explicit).toBe(true);
    expect(stages.labels).toEqual(['Foundation', 'Walling', 'Roofing', 'Finishing']);

    const blueprint = buildAgreementBlueprint(house);
    expect(blueprint.stagesExplicitlyUnderstood).toBe(true);
    expect(blueprint.stages.map((stage) => stage.label)).toEqual(['Foundation', 'Walling', 'Roofing', 'Finishing']);
    expect(blueprint.checks).toHaveLength(3);
  });

  it('uses three independent checks as the standard starting point', () => {
    const blueprint = buildAgreementBlueprint(intent('I want a contractor to build my house for KES 6m.'));
    expect(blueprint.checks.map((check) => check.kind)).toEqual(['PERFORMANCE', 'EVIDENCE', 'ACCEPTANCE']);
  });

  it('blocks an agreement with fewer than two meaningful checks', () => {
    const blueprint = buildAgreementBlueprint(intent('I want to buy a fridge for KES 80,000.', {
      who: 'You (Buyer/Payer) → Seller to be confirmed',
      what: 'Fridge purchase',
      amount: 'KES 80,000',
    }));
    blueprint.startDate = '2026-08-25';
    blueprint.checks = blueprint.checks.slice(0, 1);

    const quality = agreementQuality(blueprint);
    expect(quality.ready).toBe(false);
    expect(quality.blocking.join(' ')).toContain('at least two meaningful checks');
  });

  it('allows two checks only as a warned hard minimum and treats three as the standard', () => {
    const blueprint = buildAgreementBlueprint(intent('I want to buy a fridge for KES 80,000.', {
      who: 'You (Buyer/Payer) → Seller to be confirmed',
      what: 'Fridge purchase',
      amount: 'KES 80,000',
    }));
    blueprint.startDate = '2026-08-25';
    blueprint.stages = [];
    blueprint.checks = blueprint.checks.slice(0, 2);

    const quality = agreementQuality(blueprint);
    expect(quality.ready).toBe(true);
    expect(quality.warnings.join(' ')).toContain('hard minimum');
  });
});
