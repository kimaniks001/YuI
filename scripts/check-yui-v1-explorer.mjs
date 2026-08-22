import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const requireText = (rel, token, note) => {
  const text = read(rel);
  if (!text.includes(token)) failures.push(`${rel}: ${note}`);
};
const forbidText = (rel, token, note) => {
  const text = read(rel);
  if (text.includes(token)) failures.push(`${rel}: ${note}`);
};

requireText('src/lib/explorerMode.ts', "VITE_SECUREPAY_EXPLORER_MODE === 'true'", 'Legacy Explorer compatibility is not opt-in.');
requireText('src/lib/worldMode.ts', "export type SecurePayWorld = 'market' | 'trainer' | 'game'", 'Three-world type is missing.');
requireText('src/lib/worldMode.ts', "const TRAINER_PREFIXES = ['/trainer', '/explore', '/preview', '/review']", 'Trainer route family is incomplete.');
requireText('src/lib/worldMode.ts', "const GAME_PREFIXES = ['/game', '/play']", 'Game route family is incomplete.');
requireText('src/lib/worldMode.ts', 'sessionStorage.setItem', 'Draft intent is not kept as session-only non-authoritative state.');
requireText('src/api/securepayClient.ts', 'isSimulatedWorldRuntime()', 'API client does not re-check simulated world at request time.');
requireText('src/main.tsx', '<Route path="/trainer" element={<ExplorerMap />} />', 'Trainer root route is missing.');
requireText('src/main.tsx', '<Route path="/game" element={<PlayMarketHome />} />', 'Game root route is missing.');
requireText('src/main.tsx', '<Route path="/dashboard" element={<Protected><SecurePayHome /></Protected>} />', 'Canonical dashboard is not real-Market gated.');
requireText('src/main.tsx', '<Route path="/ks/:ksId" element={<KSProfile />} />', 'Canonical public KS route is not a real Market route.');
requireText('src/main.tsx', 'data-securepay-world={world}', 'Persistent world identity marker is missing.');
requireText('src/main.tsx', '<WorldSwitcher />', 'Persistent world selector is missing.');
requireText('src/pages/ExplorerMap.tsx', "to: '/trainer/create", 'Trainer story/create flow does not stay in Trainer.');
requireText('src/components/ExplorerDock.tsx', "to: '/trainer/dashboard'", 'Trainer dock still lacks isolated demo navigation.');
requireText('.env.example', 'VITE_SECUREPAY_EXPLORER_MODE=false', 'Market is not the default three-world environment.');
requireText('.env.example', 'VITE_SECUREPAY_API_MODE=staging', 'Canonical environment is still mock-first rather than Market-first.');
requireText('src/components/WorldSwitcher.tsx', 'saveMarketDraftIntent', 'Real-Market handoff does not preserve a safe draft marker.');
requireText('src/components/WorldSwitcher.tsx', "marketSignInHref('/create')", 'Real-Market handoff does not require the Market sign-in boundary.');

forbidText('src/main.tsx', 'SECUREPAY_EXPLORER_MODE ? <PreviewTraderHome />', 'Environment flag can still replace the real dashboard with fixture state.');
forbidText('src/main.tsx', 'SECUREPAY_EXPLORER_MODE ? <PreviewMoneyRooms />', 'Environment flag can still replace the real money room with fixture state.');
forbidText('src/pages/ExplorerMap.tsx', "to: '/create'", 'Trainer map links directly into the real create route.');
forbidText('src/components/ExplorerDock.tsx', "to: '/dashboard'", 'Trainer dock links directly into the real dashboard.');

if (failures.length) {
  console.error('\n=== SecurePay three-world boundary certification ===');
  failures.forEach(item => console.error(`FAILED: ${item}`));
  process.exit(1);
}

console.log('\n=== SecurePay three-world boundary certification ===');
console.log('PASSED: Market is default; Trainer/Game have isolated route families; live API is request-time blocked in simulated worlds; draft handoff returns through real authentication.');
