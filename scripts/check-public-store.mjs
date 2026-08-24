import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const endpoints = read('src/api/storeEndpoints.ts');
const types = read('src/api/storeTypes.ts');
const profile = read('src/pages/KSProfile.tsx');
const studio = read('src/pages/StoreOwnerStudio.tsx');
const signup = read('src/pages/Signup.tsx');
const css = read('src/ks-store-premium.css');
const notFound = read('src/pages/NotFoundPage.tsx');
const failures = [];
const check = (name, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures.push(name); };

check('Public Store endpoint is canonical KS scoped', endpoints.includes('/api/v1/stores/${encodeURIComponent(canonicalKsNumber)}'));
check('Exact public offer endpoint remains available', endpoints.includes('/offers/${encodeURIComponent(offerId)}'));
check('Public Store typing includes published offers', types.includes('export interface PublicStore') && types.includes('offers: PublicStoreOffer[]'));
check('Persisted storefront presentation is typed', types.includes('StorefrontPreset') && types.includes('StorefrontTheme') && types.includes('heroHeadline'));
check('Curated Store personalities are available', types.includes("'MERCHANT'") && types.includes("'SERVICE_PRO'") && types.includes("'BOUTIQUE'") && types.includes("'BUILDER'"));
check('KS route validates canonical KSNumber before read', profile.includes("const KS_PATTERN = /^KS\\d{3,}$/"));
check('Store requires active matching backend identity', profile.includes('result.data.canonicalKsNumber !== ksNumber') && profile.includes("result.data.status !== 'ACTIVE'"));
check('Public presentation reads persisted theme and preset', profile.includes('storefrontTheme') && profile.includes('storefrontPreset') && profile.includes('heroHeadline'));
check('Storefront is business-first rather than metadata-card-first', profile.includes('What’s on offer') && profile.includes('About {store.displayName}') && !profile.includes('Store profile updated'));
check('Store exposes proud share address', profile.includes('securepay.ke/${store.canonicalKsNumber}') && profile.includes('Copy'));
check('Direct securepay.ke/KSNumber address resolves', notFound.includes('DIRECT_KS_STORE') && notFound.includes('/ks/${canonicalKs}'));
check('Offer actions enter agreement journey, not direct payment', profile.includes("to=\"/create/journey\"") && profile.includes('saveCreationIntent(intent)'));
check('Product and service actions are contextual', profile.includes('Buy with an agreement') && profile.includes('Agree this service'));
check('Listing is not represented as reservation or sale', profile.includes('Listed ≠ reserved ≠ sold.') && profile.includes('does not reserve it or move money'));
check('Public Store keeps active identity language truthful', profile.includes('Active') && !profile.includes('Identity verified'));
check('Premium Store has responsive visual system', css.includes('.ks-store-hero') && css.includes('.ks-store-offer-grid') && css.includes('@media(max-width:760px)'));
check('Theme system produces visibly different Stores', css.includes('.ks-store-theme-sunset') && css.includes('.ks-store-theme-midnight') && css.includes('.ks-store-theme-ocean'));
check('Owner Studio controls the persisted public Store look', studio.includes("type StoreView = 'overview' | 'design' | 'offers' | 'profile'") && studio.includes('storefrontPreset') && studio.includes('storefrontTheme'));
check('Signup explains Digital Store before account completion', signup.includes('Your Digital Store') && signup.includes('More than a login') && signup.includes('securepay.ke/KS…'));
check('Signup completion reveals the user Store address', signup.includes('Your Digital Store address') && signup.includes('securepay.ke/{ksNumber}'));
check('Signup does not imply KSNumber itself moves money', signup.includes('does not itself move money') && signup.includes('not a bank account'));

if (failures.length) {
  console.error(`Public Store certification failed (${failures.length}).`);
  process.exit(1);
}
console.log('Premium public KS Digital Store and signup value guard passed.');
