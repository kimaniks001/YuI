import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const requireText = (rel, token, note) => {
  const text = read(rel);
  if (!text.includes(token)) failures.push(`${rel}: ${note}`);
};

for (const rel of [
  'src/pages/PlayMarketHome.tsx',
  'src/pages/PlayMarketBoard.tsx',
  'src/pages/PlayMarketProject.tsx',
  'src/pages/PlayMarketLeaderboard.tsx',
  'src/lib/playMarket.ts',
  'src/play-market.css',
]) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`${rel}: missing.`);
}

requireText('src/main.tsx', '<Route path="/play" element={<PlayMarketHome />} />', 'Play the Market entry route is missing.');
requireText('src/main.tsx', '<Route path="/play/project/:projectId" element={<PlayMarketProject />} />', 'Project decision route is missing.');
requireText('src/main.tsx', '<Route path="/play/leaderboard" element={<PlayMarketLeaderboard />} />', 'Leaderboard route is missing.');
requireText('src/pages/PlayMarketHome.tsx', 'KES {MARKET_PASS_MONTHLY_KES} / month', 'KES 100/month Market Pass concept is missing.');
requireText('src/pages/PlayMarketHome.tsx', 'no payment is collected', 'Explorer test-pass safety copy is missing.');
requireText('src/pages/PlayMarketHome.tsx', "mode === 'room' && players.length > 2 && !testPass", '3+ player Market Pass gate is missing.');
requireText('src/lib/playMarket.ts', 'MARKET_PASS_MONTHLY_KES = 100', 'Market Pass is not locked to the KES 100 concept.');
requireText('src/lib/playMarket.ts', 'fairTraderScore', 'Fair Trader Score is missing.');
requireText('src/lib/playMarket.ts', 'startingCapital', 'Starting-capital normalization inputs are missing.');
requireText('src/lib/playMarket.ts', 'partnerTrades', 'Player-to-player trade tracking is missing.');
requireText('src/pages/PlayMarketLeaderboard.tsx', 'DEMO KENYA BOARD · FICTIONAL', 'Fictional demo leaderboard is not explicitly labelled.');
requireText('src/pages/PlayMarketProject.tsx', 'does not create an agreement, move money or declare real SecurePay financial truth', 'Game/result financial-truth safety boundary is missing.');

const combined = [
  read('src/pages/PlayMarketHome.tsx'), read('src/pages/PlayMarketBoard.tsx'),
  read('src/pages/PlayMarketProject.tsx'), read('src/pages/PlayMarketLeaderboard.tsx'), read('src/lib/playMarket.ts'),
].join('\n');
for (const forbidden of ['fetch(', 'axios', 'securepayClient', 'initiatePayment', 'withdraw', 'payout(']) {
  if (combined.includes(forbidden)) failures.push(`Play the Market contains forbidden live integration token: ${forbidden}`);
}

if (failures.length) {
  console.error('\n=== Play the Market certification ===');
  failures.forEach(item => console.error(`FAILED: ${item}`));
  process.exit(1);
}

console.log('\n=== Play the Market certification ===');
console.log('PASSED: Explorer-only game has capital choice, projects, levels, local leaderboards, pass-and-play multiplayer, KES 100 Market Pass test gate for 3–6 players, and no live financial integration.');
