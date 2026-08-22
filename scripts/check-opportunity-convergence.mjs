import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const page = fs.readFileSync('src/pages/TraderOpportunities.tsx', 'utf8');
const endpoints = fs.readFileSync('src/api/opportunityEndpoints.ts', 'utf8');
const myMarket = fs.readFileSync('src/pages/MyMarket.tsx', 'utf8');

const checks = [
  ['Opportunities route is protected Real Market', main.includes('path="/opportunities"') && main.includes('<Protected><TraderOpportunities /></Protected>')],
  ['Opportunity detail route is protected Real Market', main.includes('path="/opportunities/:opportunityId"') && main.includes('<Protected><TraderOpportunityDetail /></Protected>')],
  ['My Market cross-links to Opportunities (convergence)', myMarket.includes("to=\"/opportunities\"")],
  ['Page states opportunity is not the same as agreement', page.includes('opportunity is never the same as agreement') || page.includes('never create an agreement, reservation, or sale')],
  ['Page states responses are never a reservation/offer', page.includes('Never a reservation or offer')],
  ['Page never turns connector contribution into a score/rank/reward', page.includes('does not turn this into a score, rank, or automatic reward')],
  ['Endpoints call the real Opportunities API', endpoints.includes("'/api/v1/opportunities'") && endpoints.includes('/api/v1/opportunities/${opportunityId}')],
  ['Pass/respond/claim/close mutations are all real POSTs, not simulated', endpoints.includes("method: 'POST'")],
  ['Provenance is read from the real backend, not invented locally', endpoints.includes('/provenance')],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error('Opportunity/Convergence guard failed.');
  process.exit(1);
}

console.log('MW-09 Opportunity/Convergence guard passed.');
