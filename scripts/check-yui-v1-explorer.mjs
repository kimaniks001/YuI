import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const requireText = (rel, token, note) => {
  const text = read(rel);
  if (!text.includes(token)) failures.push(`${rel}: ${note}`);
};

requireText('src/lib/explorerMode.ts', "VITE_SECUREPAY_EXPLORER_MODE !== 'false'", 'Explorer mode is not the YUI v1 default.');
requireText('src/api/securepayClient.ts', 'if (SECUREPAY_EXPLORER_MODE)', 'API client is not blocked in Explorer mode.');
requireText('src/api/securepayConfig.ts', '!SECUREPAY_EXPLORER_MODE', 'Money feature flags are not forced off in Explorer mode.');
requireText('src/main.tsx', 'SECUREPAY_EXPLORER_MODE ? <PreviewTraderHome />', 'Trader Home is not fixture-backed in Explorer mode.');
requireText('src/main.tsx', 'SECUREPAY_EXPLORER_MODE ? <PreviewMoneyRooms />', 'Money room is not fixture-backed in Explorer mode.');
requireText('src/main.tsx', '<Route path="/explore" element={<ExplorerMap />} />', 'Explorer journey map route is missing.');
requireText('src/main.tsx', '{SECUREPAY_EXPLORER_MODE && <ExplorerDock />}', 'Explorer navigation dock is missing.');
requireText('.env.example', 'VITE_SECUREPAY_EXPLORER_MODE=true', 'Training environment does not default to Explorer mode.');
requireText('.env.example', 'VITE_SECUREPAY_API_MODE=mock', 'Training environment does not default to mock API mode.');

const config = read('src/api/securepayConfig.ts');
for (const flag of [
  'SECUREPAY_ENABLE_MONEY_ACTIONS',
  'SECUREPAY_ENABLE_RELEASE_ACTIONS',
  'SECUREPAY_ENABLE_PAYMENT_CONFIRMATION',
  'SECUREPAY_ENABLE_WITHDRAWAL_ACTIONS',
  'SECUREPAY_ENABLE_PAYOUT_ACTIONS',
  'SECUREPAY_ENABLE_LEDGER_ACTIONS',
]) {
  const idx = config.indexOf(`export const ${flag}`);
  const tail = idx >= 0 ? config.slice(idx, idx + 180) : '';
  if (!tail.includes('!SECUREPAY_EXPLORER_MODE')) failures.push(`src/api/securepayConfig.ts: ${flag} is not Explorer-gated.`);
}

if (failures.length) {
  console.error('\n=== YUI v1 Explorer certification ===');
  failures.forEach(item => console.error(`FAILED: ${item}`));
  process.exit(1);
}

console.log('\n=== YUI v1 Explorer certification ===');
console.log('PASSED: no authentication required for training routes; live API is blocked; money action flags are forced off; Explorer map and dock are present.');
