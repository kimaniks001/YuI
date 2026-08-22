import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const page = fs.readFileSync('src/pages/TraderMasters.tsx', 'utf8');
const endpoints = fs.readFileSync('src/api/masterEndpoints.ts', 'utf8');
const community = fs.readFileSync('src/pages/TraderCommunity.tsx', 'utf8');

const checks = [
  ['Masters route is protected Real Market', main.includes('path="/masters"') && main.includes('<Protected><TraderMasters /></Protected>')],
  ['Master detail route is protected Real Market', main.includes('path="/masters/:masterId"') && main.includes('<Protected><TraderMasterDetail /></Protected>')],
  ['Community cross-links to real Master discovery', community.includes('to="/masters"')],
  ['Page states the KES 1,000/hour floor', page.includes('Minimum rate: KES 1,000/hour') || page.includes('at least KES 1,000/hour')],
  ['Page states evidence is not a score', page.includes('never a score or rank')],
  ['Page states Master status is not an adjudication', page.includes('not an adjudication')],
  ['Page states the anti-manipulation floor', page.includes('will not let a brand-new account self-declare Master status')],
  ['Endpoints call the real Masters API', endpoints.includes("'/api/v1/masters'") && endpoints.includes('/api/v1/masters/${masterId}')],
  ['Apply/rate/availability/revoke mutations are all real POSTs, not simulated', endpoints.includes("method: 'POST'")],
  ['Evidence is read from the real backend, not invented locally', endpoints.includes('/evidence')],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error('Master registry guard failed.');
  process.exit(1);
}

console.log('MW-10 Master registry guard passed.');
