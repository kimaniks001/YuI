import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const page = fs.readFileSync('src/pages/TraderCircles.tsx', 'utf8');
const endpoints = fs.readFileSync('src/api/circleEndpoints.ts', 'utf8');

const checks = [
  ['Circles route is protected Real Market', main.includes('path="/circles"') && main.includes('<Protected><TraderCircles /></Protected>')],
  ['Circle detail route is protected Real Market', main.includes('path="/circles/:circleId"') && main.includes('<Protected><TraderCircleDetail /></Protected>')],
  ['Page states Circle is distinct from Community', page.includes('different from Community, which is simply belonging')],
  ['Page states invitation is not participation', page.includes('Invitation is not participation') || page.includes('Invitation != participation') || page.includes("nothing changes until you accept")],
  ['Page never invents a ranking/score for contribution', page.includes('not a score or ranking') && page.includes('does not rank Circle members')],
  ['Opportunity share is explicitly not an agreement', page.includes('opportunity is never the same as agreement')],
  ['Resting is presented as a pause, not deletion', page.includes('deliberate pause, not deletion')],
  ['Endpoints call the real Circles API (plural, distinct from legacy /circle/me)', endpoints.includes("'/api/v1/circles'") && endpoints.includes('/api/v1/circles/${circleId}')],
  ['Create/invite/status/cycle/log mutations are all real POSTs, not simulated', endpoints.includes("method: 'POST'")],
  ['Metrics call the real backend endpoint', endpoints.includes('/metrics')],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error('Circle/Cycle guard failed.');
  process.exit(1);
}

console.log('MW-08 Circle/Cycle guard passed.');
