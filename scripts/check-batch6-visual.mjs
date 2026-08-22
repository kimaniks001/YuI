import fs from 'node:fs';

const failures = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const preview = read('src/pages/PreviewMoneyRooms.tsx');
const money = read('src/pages/MoneySpace.tsx');
const statements = read('src/pages/MarketStatements.tsx');
const shell = read('src/components/trader/TraderShell.tsx');
const routes = read('src/main.tsx');
const gallery = read('src/review/ReviewGallery.tsx');
const css = read('src/batch6-money-rooms.css');
const doc = read('docs/design/MONEY_ROOMS_VISUAL_LOCK_V1.md');

function expect(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

expect(routes, '/preview/money', 'V8 visual review route is missing');
expect(routes, "import './batch6-money-rooms.css'", 'V8 money CSS is not registered');
expect(gallery, 'Money rooms', 'Review Gallery does not expose the Money Rooms');
expect(preview, "id: 'payment-ready'", 'Money preview is missing explicit Payment Ready state');
expect(preview, "id: 'settling'", 'Money preview is missing settlement-in-progress state');
expect(preview, "id: 'settled'", 'Money preview is missing settled state');
expect(preview, "id: 'attention'", 'Money preview is missing attention/failure state');
expect(preview, 'This is not yet proof that money was received.', 'Provider-pending safety wording is missing');
expect(preview, 'The browser never calculates it.', 'Payment Ready backend-authority wording is missing');
expect(preview, 'Instruction creation is not settlement.', 'Release-instruction vs settlement distinction is missing');
expect(preview, 'Your KSNumber is not a bank account.', 'KSNumber vs bank account boundary is missing');
expect(preview, 'not a reconstruction of a wallet balance', 'Statement vs wallet-balance boundary is missing');
expect(preview, 'Visual fixture only', 'Money preview no-write labelling is missing');
expect(money, 'My Market · Money & settlement', 'Canonical MoneySpace did not receive V8 language');
expect(money, 'not a wallet or bank balance', 'Canonical MoneySpace lost no-wallet boundary');
expect(money, 'LivingSecurePayMark', 'Canonical MoneySpace does not use Living SecurePay Mark');
expect(statements, 'does not reinterpret them as money available to spend', 'Statement spendability boundary is missing');
expect(shell, 'Money & settlement', 'Trader account menu did not adopt V8 naming');
expect(css, '.sp-money-path', 'V8 visual money path is missing');
expect(css, '@media(max-width:780px)', 'V8 mobile treatment is missing');
expect(doc, 'Payment confirmed does not mean Payment Ready.', 'V8 state-separation law is missing');
expect(doc, 'The KES 100 activation/Settlement Account test is the holder\'s money', 'KES 100 test-money boundary is missing');

console.log('\n=== SecurePay Batch 06 visual guard ===');
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}
console.log('PASSED: V8 Money Rooms visual-lock invariants are present.');
