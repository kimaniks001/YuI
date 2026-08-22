import fs from 'node:fs';

const failures = [];
const read = (p) => fs.readFileSync(p, 'utf8');
const home = read('src/pages/PreviewTraderHome.tsx');
const market = read('src/pages/PreviewMarketPage.tsx');
const projection = read('src/lib/marketProjection.ts');
const css = read('src/batch3-market.css');

function expect(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

expect(home, 'Welcome back to <span>your market.</span>', 'Trader Home lost the signed-in Market welcome');
expect(home, '4 things need your attention.', 'Trader Home no longer surfaces attention immediately');
expect(home, 'LivingSecurePayMark state="caution"', 'Trader Home attention no longer uses the Living SecurePay Mark');
expect(home, 'Your market is working', 'Trader Home lost the in-motion Market section');
expect(home, 'YOUR PLACE IN THE MARKET', 'Trader Home lost KSNumber-as-place framing');
expect(market, 'EVERYTHING YOU TRADE, IN ONE PLACE', 'My Market lost its core positioning');
expect(market, 'Your market needs you here', 'My Market lost the attention lane');
expect(market, 'Waiting peacefully', 'My Market lost the calm waiting lane');
expect(market, 'Finished and in your records', 'My Market lost the completed-record lane');
expect(market, 'SecurePay points to what needs you and lets the quiet parts stay quiet.', 'My Market lost its momentum/reassurance principle');
expect(projection, "RESPOND_TO_REVIEW: 'Respond to the clarification'", 'Review action language became punitive');
expect(projection, "APPROVE_PAYOUT: 'Review the supplier payment step'", 'Distribution action language exposes payout jargon');
expect(css, '.b3-market-card', 'Batch 3 Market room CSS is missing');
expect(css, '@media(max-width:800px)', 'Batch 3 mobile signed-in treatment is missing');

console.log('\n=== SecurePay Batch 03 visual guard ===');
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}
console.log('PASSED: V5 Trader Home and V6 My Market visual-lock invariants are present.');
