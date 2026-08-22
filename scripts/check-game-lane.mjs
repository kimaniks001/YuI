import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const service = read('src/game/gameService.ts');
const types = read('src/game/gameTypes.ts');
const scoring = read('src/game/scoring.ts');
const main = read('src/main.tsx');
const files = [
  'src/pages/GameCyclePage.tsx',
  'src/pages/GameCardsPage.tsx',
  'src/pages/GameJourneysPage.tsx',
  'src/pages/GameRoomsPage.tsx',
  'src/pages/GameMissionsPage.tsx',
  'src/pages/GameAchievementsPage.tsx',
].map(read).join('\n');

function assert(condition, message) {
  if (!condition) throw new Error(`Game lane certification failed: ${message}`);
}

assert(service.includes("PERSONAL: 5") && service.includes("BUSINESS: 12"), 'Personal/Business Cycle Coin entitlements must remain 5/12.');
assert(service.includes("delta: -1") && service.includes('Game Recovery'), 'Formal Game Recovery must spend exactly 1 Cycle Coin.');
assert(files.includes('Coins do not roll over') || service.includes('do not roll over'), 'Cycle Coin non-rollover must be explicit.');
assert(!service.includes('securePayFetch') && !service.includes('/api/v1/'), 'Game service must not call SecurePayAPI.');
assert(!files.includes('securePayFetch(') && !files.includes('/api/v1/'), 'Game pages must not call SecurePayAPI.');
assert(types.includes("GameCardFamily = 'TRADE' | 'LIFE' | 'BALANCE' | 'MARKET'"), 'Four Game card families must remain explicit.');
assert(scoring.includes('gameMaster') && files.includes('Game Master ≠ Real Market Master'), 'Game Master must remain separate from Real Market Master.');
assert(service.includes('PAYER_RULE_UNRESOLVED'), '3+ player billing payer ambiguity must remain fail-closed.');
for (const path of ['/game/profile', '/game/cards', '/game/journeys', '/game/rooms', '/game/missions', '/game/achievements']) {
  assert(main.includes(`path=\"${path}\"`), `Missing canonical Game route ${path}.`);
}
assert(files.includes('no cash value') || files.includes('no cash') || files.includes('No payment is collected'), 'Game money must be visibly non-cash.');

console.log('Game lane guard passed: MW-13–18 authority boundaries and routes are present.');
