import fs from 'node:fs';

const required = [
  'public/assets/brand/securepay_market_handshake.mp4',
  'src/components/MarketOpeningRitual.tsx',
  'src/routing/RequireAuth.tsx',
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Handshake welcome missing: ${file}`);
}
const component = fs.readFileSync('src/components/MarketOpeningRitual.tsx', 'utf8');
const auth = fs.readFileSync('src/routing/RequireAuth.tsx', 'utf8');
const home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
for (const token of ['securepay_market_handshake.mp4', 'autoPlay', 'muted', 'playsInline', 'Skip', '45 * 24 * 60 * 60 * 1000', '!forceOpen && prefersReducedMotion()', 'import.meta.env.BASE_URL']) {
  if (!component.includes(token)) throw new Error(`Handshake welcome guard missing token: ${token}`);
}
if (!auth.includes('<MarketOpeningRitual authenticatedEntry traderKey={user.ksNumber} />')) throw new Error('Handshake is not mounted at authenticated Market boundary.');
if (home.includes('<MarketOpeningRitual')) throw new Error('Handshake must not autoplay on the signed-out Home.');
console.log('Handshake welcome guard passed.');
