import fs from 'node:fs';

const required = [
  'public/assets/brand/securepay_market_handshake.mp4',
  'src/components/MarketOpeningRitual.tsx',
  'src/pages/Home.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Handshake welcome missing: ${file}`);
}

const component = fs.readFileSync('src/components/MarketOpeningRitual.tsx', 'utf8');
const home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

for (const token of [
  'securepay_market_handshake.mp4',
  'autoPlay',
  'muted',
  'playsInline',
  'Skip',
  'sessionStorage',
  'securepay.market.opening.seen.v1',
  '!forceOpen && prefersReducedMotion()',
  'import.meta.env.BASE_URL',
]) {
  if (!component.includes(token)) throw new Error(`Handshake welcome guard missing token: ${token}`);
}

if (!home.includes('<MarketOpeningRitual />')) {
  throw new Error('Handshake must be mounted on the real signed-out Home.');
}

if (component.includes('authenticatedEntry') || component.includes('45 * 24 * 60 * 60 * 1000')) {
  throw new Error('Signed-out opening must not depend on authenticated-entry or long-return timing.');
}

console.log('Handshake welcome guard passed.');
