import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const routes = read('src/main.tsx');
const endpoints = read('src/api/storeEndpoints.ts');
const types = read('src/api/storeTypes.ts');
const studio = read('src/pages/StoreOwnerStudio.tsx');
const shell = read('src/components/trader/TraderShell.tsx');
const failures = [];
const check = (name, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures.push(name); };

check('My KS Store is a protected Real Market route', routes.includes('<Route path="/store" element={<Protected><StoreOwnerStudio /></Protected>} />'));
check('Trader account navigation exposes My KS Store', shell.includes('to="/store"') && shell.includes('My KS Store'));
check('Owner profile read is self-scoped', endpoints.includes("'/api/v1/store/me/profile'"));
check('Owner profile write uses PUT', endpoints.includes('updateMyStoreProfile') && endpoints.includes("method: 'PUT'"));
check('Owner offers are self-scoped', endpoints.includes("'/api/v1/store/me/offers'"));
check('Owner offer create and update are wired', endpoints.includes('createMyStoreOffer') && endpoints.includes('updateMyStoreOffer'));
check('Availability confirmation is server-recorded', endpoints.includes('/availability-confirmation') && endpoints.includes('confirmMyStoreOfferAvailability'));
check('Owner request types contain no target identity or KS field', !types.includes('targetKsNumber') && !types.includes('targetIdentityId'));
check('Natural-language quick add is review-first', studio.includes('Natural-language quick add') && studio.includes('Draft it') && studio.includes('Review it before saving'));
check('Natural-language draft never auto-publishes', studio.includes('published: false'));
check('Store Health is timestamp-derived', studio.includes('deriveStoreHealth') && studio.includes('availabilityConfirmedAt') && studio.includes('updatedAt'));
check('Store Health freshness thresholds are explicit', studio.includes('oldestAge <= 7') && studio.includes('oldestAge <= 21'));
check('Store Health cannot imply trust or financial strength', studio.includes('freshness only') && studio.includes('not a trust, credit, reputation, financial-strength or trader-ranking score'));
check('Resting Store posture is supported', studio.includes("label: 'Resting'") && studio.includes("'RESTING'"));
check('Publishing preserves listing boundary', studio.includes('Publishing lists it; it does not reserve or sell it.'));
check('Customer preview uses canonical public KS route', studio.includes('Customer view') && studio.includes('/ks/${encodeURIComponent(publicKs)}'));
check('Public theme persistence gap is explicit', studio.includes('device-local Studio preview only') && studio.includes('does not yet persist a public Store theme'));
check('Media persistence gap is explicit and not faked', studio.includes('Backend media support required') && studio.includes('does not yet expose Store media persistence'));
check('Mobile maintenance keeps touch-sized actions', studio.includes('min-h-11') && studio.includes('sm:grid-cols-2'));
check('Store writes stay separate from payment authority', studio.includes('never creates a sale, reservation, agreement, Payment Ready or settlement authority'));

if (failures.length) {
  console.error(`Store owner Studio certification failed (${failures.length}).`);
  process.exit(1);
}
console.log('Store owner Studio guard passed.');
