import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const shell = fs.readFileSync('src/components/trader/TraderShell.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/PlugDashboard.tsx', 'utf8');
const doctrine = fs.readFileSync('docs/market-world/PLUG_RETENTION_AND_GAME_CYCLE_DOCTRINE.md', 'utf8');

const checks = [
  ['Plug route is protected Real Market', main.includes('path="/plug"') && main.includes('<Protected><PlugDashboard /></Protected>')],
  ['Builder alias uses same protected authority', main.includes('path="/builders"')],
  ['Trader account exposes Plug workspace', shell.includes('to="/plug"') && shell.includes('Plug / Builder workspace')],
  ['Referral history remains backend source', dashboard.includes('getMyReferralHistory')],
  ['Existing reward UI remains backend-only', dashboard.includes('backend-qualified referral records') && dashboard.includes('not a wallet balance or a forecast')],
  ['Month-10 rule requires ten consecutive paid months', dashboard.includes('ten consecutive successfully paid active subscription months')],
  ['Month-10 amount follows actual collected fee', dashboard.includes('subscription fee actually collected for month 10')],
  ['Missing subscription authority is fail-closed', dashboard.includes('no subscription activation / renewal / grace / suspension payment lifecycle')],
  ['Identity age is not used as paid-month evidence', doctrine.includes('Identity age, account creation date, referral age or an `ACTIVE` identity flag alone must never be used as proof')],
  ['Exactly-once retention reward is locked', doctrine.includes('the month-10 retention reward may be recorded only once')],
  ['No lifetime/downline entitlement', doctrine.includes('no downline') && doctrine.includes('no perpetual commission')],
  ['Trainer maths is explicitly illustrative', dashboard.includes('Trainer maths · illustration only') && dashboard.includes('It is not an entitlement, forecast, wallet balance or backend reward record')],
  ['Game Turn is defined', doctrine.includes('A **Turn** is one active player\'s opportunity to act')],
  ['Game Round is defined', doctrine.includes('A **Round** is complete when every active player has completed one Turn')],
  ['Game Cycle closes after Round consequences', doctrine.includes('A **Cycle** is one completed Round **plus the end-of-cycle Market and Life consequences**')],
  ['Game referrals are optional, not compulsory', doctrine.includes('players are never required to refer every other player')],
  ['Game cannot create real reward entitlement', doctrine.includes('can never create Real Market financial entitlement')],
  ['Responsive/touch-sized primary actions retained', dashboard.includes('min-h-11')],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error('Plug / Builder economy guard failed.');
  process.exit(1);
}

console.log('Plug / Builder economy guard passed.');
