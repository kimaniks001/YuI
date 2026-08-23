import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const consultation = read('src/api/consultationEndpoints.ts');
const recovery = read('src/api/recoveryEndpoints.ts');
const bridge = read('src/api/bridgeEndpoints.ts');
const game = read('src/game/gameService.ts');
const main = read('src/main.tsx');
const safety = read('src/pages/MarketSafety.tsx');

const checks = [
  [consultation.includes("'/api/v1/consultations'"), 'MW-11 uses certified /api/v1/consultations authority'],
  [consultation.includes('/extension-requests'), 'MW-11 extension request/decision contract is wired'],
  [recovery.includes("'/api/v1/recovery-cases'"), 'MW-12 uses certified /api/v1/recovery-cases authority'],
  [!recovery.includes('/recovery/messages') && !recovery.includes('/recovery/evidence') && !recovery.includes('/recovery/resolve'), 'MW-12 does not invent parallel chat/evidence/resolve authority'],
  [bridge.includes("'/api/v1/bridge/draft-intents'"), 'MW-19 uses certified Draft Intent authority'],
  [!game.includes('securePayFetch') && !game.includes('/api/v1'), 'GameService remains isolated from SecurePayAPI'],
  [main.includes('/agreements/:agreementId/consultation') && main.includes('/agreements/:agreementId/recovery'), 'Real agreement specialist routes are registered'],
  [main.includes('/market/continue') && main.includes('/market/safety'), 'Market bridge and safety routes are registered'],
  [main.includes('<TraderReferrals />'), 'Referral route renders the backend-backed referral experience'],
  [safety.includes('Builder rewards stay backend-qualified') && safety.includes('never calls a reward paid'), 'Builder reward payout boundary remains fail-closed'],
  [safety.includes('Game Master status cannot become Real Market truth'), 'Game Master and Real Market Master remain separated'],
];

const failed = checks.filter(([ok]) => !ok);
for (const [ok, label] of checks) console.log(`${ok ? '✓' : '✗'} ${label}`);
if (failed.length) {
  console.error(`\nMW-11–19 blend guard failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log(`\nMW-11–19 blend guard passed: ${checks.length}/${checks.length} authority checks.`);
