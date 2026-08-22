import fs from 'node:fs';

const page = fs.readFileSync('src/pages/TraderCommunity.tsx', 'utf8');
const endpoints = fs.readFileSync('src/api/r11TraderEndpoints.ts', 'utf8');

const required = [
  'Community is where belonging and discovery become useful',
  'membership is never an endorsement',
  'Community discovery is not authoritative yet',
  'Membership needs its own backend truth',
  'A lively feed must still be privacy-safe',
  'Rules and moderators must be real',
  'Public because you chose to publish it',
  'Master registry and evidence authority are scheduled for MW-10',
];

for (const phrase of required) {
  if (!page.includes(phrase)) throw new Error(`MW-07 community guard missing: ${phrase}`);
}

if (!endpoints.includes("'/api/v1/circle/me'")) {
  throw new Error('MW-07 must preserve the existing self-scoped Circle authority.');
}

const forbiddenClaims = [
  'communityScore',
  'trustScore',
  'reputationScore',
  'communityRanking',
  'memberRank',
];
for (const claim of forbiddenClaims) {
  if (page.includes(claim)) throw new Error(`MW-07 must not invent ${claim}.`);
}

console.log('MW-07 community/privacy guard passed.');
