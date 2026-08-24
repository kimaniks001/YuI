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
check('Store is task-first instead of one long editor', studio.includes("type StoreView = 'overview' | 'offers' | 'profile'") && studio.includes("setView('offers')") && studio.includes("setView('profile')"));
check('Natural-language quick add remains review-first', studio.includes('interpretStoreWords') && studio.includes('Draft') && studio.includes('Review before saving'));
check('Natural-language draft never auto-publishes', studio.includes('published: false'));
check('Store Health is timestamp-derived', studio.includes('deriveStoreHealth') && studio.includes('availabilityConfirmedAt') && studio.includes('updatedAt'));
check('Store Health freshness thresholds are explicit', studio.includes('oldestAge <= 7') && studio.includes('oldestAge <= 21'));
check('Store Health remains freshness, not trader scoring', studio.includes('Store Health measures freshness only') && studio.includes('not a trust, credit, reputation or financial-strength score'));
check('Resting Store posture is supported', studio.includes("label: 'Resting'") && studio.includes("'RESTING'"));
check('Publishing remains an explicit owner choice', studio.includes('checked={offerDraft.published}') && studio.includes('Show publicly'));
check('Customer preview uses canonical public KS route', studio.includes('Customer view') && studio.includes('/ks/${encodeURIComponent(publicKs)}'));
check('Local atmosphere remains explicitly non-authoritative', studio.includes('local Studio atmosphere only'));
check('Mobile maintenance keeps touch-sized actions', studio.includes('min-h-10') && studio.includes('sm:grid-cols-2'));

if (failures.length) {
  console.error(`Store owner Studio certification failed (${failures.length}).`);
  process.exit(1);
}
console.log('Store owner Studio guard passed.');
