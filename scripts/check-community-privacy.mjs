import fs from 'node:fs';

const page = fs.readFileSync('src/pages/TraderCommunity.tsx', 'utf8');
const endpoints = fs.readFileSync('src/api/r11TraderEndpoints.ts', 'utf8');

const required = [
  'See proven connections without exposing private trade',
  'Discovery is not available yet',
  'Membership is not available yet',
  'Community feed is not available yet',
  'Community rules are not available yet',
  'Connection, not ranking',
  'Private stays private',
];
for (const phrase of required) {
  if (!page.includes(phrase)) throw new Error(`MW-07 community guard missing: ${phrase}`);
}

if (!page.includes("title={<>Your <span className=\"text-green-700\">people</span></>}")) throw new Error('Community page lost its concise Your people identity.');
if (!endpoints.includes("'/api/v1/circle/me'")) throw new Error('MW-07 must preserve the self-scoped Circle authority.');
if (!page.includes('TraderPageHeader') || !page.includes('TraderShell')) throw new Error('Community must stay inside the signed-in Market identity.');
if (!page.includes("room === 'discover'") || !page.includes("room === 'members'") || !page.includes("room === 'feed'") || !page.includes("room === 'rules'")) throw new Error('Unavailable community rooms must fail closed rather than being invented.');

for (const claim of ['communityScore','trustScore','reputationScore','communityRanking','memberRank']) {
  if (page.includes(claim)) throw new Error(`MW-07 must not invent ${claim}.`);
}

console.log('MW-07 community/privacy guard passed.');
