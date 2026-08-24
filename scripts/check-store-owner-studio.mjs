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
check('Store Studio is task-first', studio.includes("type StoreView = 'overview' | 'design' | 'offers' | 'profile'") && studio.includes("setView('design')") && studio.includes("setView('offers')") && studio.includes("setView('profile')"));
check('Owner can copy and preview proud Store address', studio.includes('securepay.ke/${publicKs}') && studio.includes('Customer view') && studio.includes('copyAddress'));
check('Store design is backend profile data, not local-only theme state', studio.includes('storefrontPreset') && studio.includes('storefrontTheme') && studio.includes('heroHeadline') && studio.includes('updateMyStoreProfile'));
check('Curated Store styles are available', studio.includes("id: 'MERCHANT'") && studio.includes("id: 'SERVICE_PRO'") && studio.includes("id: 'BOUTIQUE'") && studio.includes("id: 'BUILDER'"));
check('Curated colour moods are available', studio.includes("id: 'FOREST'") && studio.includes("id: 'SUNSET'") && studio.includes("id: 'MIDNIGHT'") && studio.includes("id: 'OCEAN'"));
check('Natural-language quick add remains review-first', studio.includes('interpretStoreWords') && studio.includes('Drafted below. Review before saving.'));
check('Natural-language draft never auto-publishes', studio.includes('published: false'));
check('Store Health remains timestamp-derived freshness', studio.includes('deriveStoreHealth') && studio.includes('availabilityConfirmedAt') && studio.includes('updatedAt') && studio.includes('Store Health measures freshness only'));
check('Publishing remains an explicit owner choice', studio.includes('checked={offerDraft.published}') && studio.includes('Show publicly'));
check('Mobile maintenance keeps touch-sized actions', studio.includes('min-h-10') && studio.includes('overflow-x-auto'));

if (failures.length) {
  console.error(`Store owner Studio certification failed (${failures.length}).`);
  process.exit(1);
}
console.log('Premium Store owner Studio guard passed.');
