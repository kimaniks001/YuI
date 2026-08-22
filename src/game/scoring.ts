import type { GameProfile, GameSeasonScore } from './gameTypes';

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function gameBalance(profile: GameProfile) {
  const healthAverage = (profile.health.trade + profile.health.life + profile.health.resilience) / 3;
  const imbalancePenalty = Math.abs(profile.health.trade - profile.health.life) * 0.35;
  return clamp(Math.round(healthAverage - imbalancePenalty));
}

export function scoreGameProfile(profile: GameProfile): GameSeasonScore {
  const economicGrowth = clamp(Math.round(Math.log10(Math.max(1, profile.capital)) * 12));
  const balance = gameBalance(profile);
  const obligations = clamp(profile.obligationsCompleted * 8);
  const collaboration = clamp(profile.collaboration * 7);
  const circleCommunity = clamp((profile.circleContribution + profile.communityContribution) * 6);
  const recovery = clamp(profile.recoveryResponsibility * 10);
  const referrals = clamp(profile.productiveReferrals * 7);
  const total = Math.round(
    economicGrowth * 0.2 +
    balance * 0.25 +
    obligations * 0.15 +
    collaboration * 0.15 +
    circleCommunity * 0.1 +
    recovery * 0.1 +
    referrals * 0.05,
  );
  const gameMaster = total >= 78 && balance >= 70 && collaboration >= 50 && obligations >= 40;
  return {
    playerId: profile.id,
    displayName: profile.displayName,
    economicGrowth,
    balance,
    obligations,
    collaboration,
    circleCommunity,
    recovery,
    referrals,
    total,
    gameMaster,
    explanation: [
      `Economic growth ${economicGrowth}/100 contributes 20%.`,
      `Game Health / Market Balance ${balance}/100 contributes 25%.`,
      `Completed obligations ${obligations}/100 contribute 15%.`,
      `Collaboration ${collaboration}/100 contributes 15%.`,
      `Circle and Community contribution ${circleCommunity}/100 contributes 10%.`,
      `Responsible Recovery use ${recovery}/100 contributes 10%.`,
      `Productive referrals ${referrals}/100 contribute 5%.`,
    ],
  };
}
