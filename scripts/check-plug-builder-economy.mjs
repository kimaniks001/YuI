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
  ['Plug workspace is task-first', dashboard.includes("type PlugView = 'overview' | 'people' | 'help'")],
  ['Reward UI remains backend evidence only', dashboard.includes('rewardAmountMinor') && dashboard.includes('Reward records')],
  ['Month-10 qualification remains backend-owned in UI', dashboard.includes('Month-10 builder rule') && dashboard.includes('backend qualifies it') && dashboard.includes('Qualified and paid remain separate states')],
  ['Ten consecutive paid months remain locked doctrine', doctrine.includes('10 consecutive') || doctrine.includes('ten consecutive')],
  ['Actual month-10 fee remains locked doctrine', doctrine.includes('month 10') && doctrine.includes('subscription fee')],
  ['Identity age is not used as paid-month evidence', doctrine.includes('Identity age, account creation date, referral age or an `ACTIVE` identity flag alone must never be used as proof')],
  ['Exactly-once retention reward is locked', doctrine.includes('the month-10 retention reward may be recorded only once')],
  ['No lifetime/downline entitlement', doctrine.includes('no downline') && doctrine.includes('no perpetual commission')],
  ['Trainer maths remains explicitly illustrative', dashboard.includes('Month-10 illustration') && dashboard.includes('Illustration only') && dashboard.includes('not entitlement, forecast or wallet balance')],
  ['Game Turn is defined', doctrine.includes('A **Turn** is one active player\'s opportunity to act')],
  ['Game Round is defined', doctrine.includes('A **Round** is complete when every active player has completed one Turn')],
  ['Game Cycle closes after Round consequences', doctrine.includes('A **Cycle** is one completed Round **plus the end-of-cycle Market and Life consequences**')],
  ['Game referrals are optional, not compulsory', doctrine.includes('players are never required to refer every other player')],
  ['Game cannot create real reward entitlement', doctrine.includes('can never create Real Market financial entitlement')],
  ['Touch-sized actions retained', dashboard.includes('min-h-10')],
];

let failed = false;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed = true; }
if (failed) { console.error('Plug / Builder economy guard failed.'); process.exit(1); }
console.log('Plug / Builder economy guard passed.');
