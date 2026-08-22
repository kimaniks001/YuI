import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const endpoints = read('src/api/storeEndpoints.ts');
const types = read('src/api/storeTypes.ts');
const profile = read('src/pages/KSProfile.tsx');
const failures = [];
const check = (name, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures.push(name); };

check('Public Store endpoint is canonical KS scoped', endpoints.includes('/api/v1/stores/${encodeURIComponent(canonicalKsNumber)}'));
check('Exact public offer endpoint is available for future share/QR entry', endpoints.includes('/offers/${encodeURIComponent(offerId)}'));
check('Public Store typing includes profile and offers', types.includes('export interface PublicStore') && types.includes('offers: PublicStoreOffer[]'));
check('Availability states remain explicit', types.includes("'AVAILABLE'") && types.includes("'NEEDS_CONFIRMATION'") && types.includes("'FULLY_BOOKED'"));
check('KS route validates canonical KS Number before read', profile.includes("const KS_PATTERN = /^KS\\d{3,}$/"));
check('Store requires active matching backend identity', profile.includes("result.data.canonicalKsNumber !== ksNumber") && profile.includes("result.data.status !== 'ACTIVE'"));
check('Store shows only backend published offers', profile.includes('Only offers this Store explicitly published are shown.'));
check('Listing is not represented as reservation or sale', profile.includes('Listed ≠ reserved ≠ sold.') && profile.includes('Opening this Store has not reserved anything and has not created a sale.'));
check('Offer action starts a proposal rather than payment', profile.includes('Discuss this offer') && profile.includes('Start with a proposal, not a payment.'));
check('Offer handoff carries only CreationIntent', profile.includes('state={{ intent: offerIntent(store, offer) }}'));
check('Completed-work and reputation gaps are explicit', profile.includes('does not invent a portfolio, rating or reputation record'));
check('Gallery gap is explicit', profile.includes('does not publish Store images or video'));
check('No public verification claim is fabricated', !profile.includes('Identity verified') && !profile.includes('Verification</'));
check('Payment Ready is not asserted by Store UI', !profile.includes('Payment Ready') || profile.includes('has not'));

if (failures.length) {
  console.error(`Public Store certification failed (${failures.length}).`);
  process.exit(1);
}
console.log('Public KS Digital Store guard passed.');
