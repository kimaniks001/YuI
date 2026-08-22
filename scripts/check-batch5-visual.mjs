import fs from 'node:fs';

const failures = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const joining = read('src/pages/PreviewJoiningPage.tsx');
const store = read('src/pages/PreviewDigitalStore.tsx');
const joinLive = read('src/pages/SecureLinkJoin.tsx');
const groupLive = read('src/pages/PublicGroupSecureLink.tsx');
const profile = read('src/pages/KSProfile.tsx');
const routes = read('src/main.tsx');
const css = read('src/batch5-invitation-store.css');
const joinDoc = read('docs/design/INVITATION_JOINING_VISUAL_LOCK_V1.md');
const storeDoc = read('docs/design/KS_DIGITAL_STORE_VISUAL_LOCK_V1.md');

function expect(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

expect(routes, '/preview/joining', 'V4 visual review route is missing');
expect(routes, '/preview/store', 'V11 Digital Store review route is missing');
expect(joining, 'What happened', 'Invitation doorway lost what-happened framing');
expect(joining, 'What it means', 'Invitation doorway lost meaning framing');
expect(joining, 'What can I do next?', 'Invitation doorway lost next-action framing');
expect(joining, 'Joined is not the same as confirmed.', 'Join vs confirmation boundary is missing');
expect(joining, 'does not expose the inviter identity', 'Invitation preview backend limitation is not disclosed');
expect(joining, "state === 'expired'", 'Expired invitation posture is missing');
expect(joinLive, 'b5-join-room', 'Canonical SecureLinkJoin does not receive Batch 05 doorway treatment');
expect(joinLive, 'LivingSecurePayMark state="caution"', 'Canonical invitation errors no longer use Living SecurePay caution');
expect(groupLive, 'What has SecurePay recorded?', 'Public Group SecureLink record explanation changed unexpectedly');
expect(groupLive, 'LivingSecurePayMark state="success"', 'Public Group SecureLink lost Living Mark record posture');
expect(store, "saveCreationIntent(offer.intent)", 'Digital Store no longer hands an offer to creation as intention');
expect(store, "navigate('/preview/create'", 'Digital Store no longer continues into creation preview');
expect(store, 'Public view', 'Digital Store public view is missing');
expect(store, 'Owner view', 'Digital Store owner view is missing');
expect(store, 'does not create Digital Store inventory in the backend', 'Owner preview safety wording is missing');
expect(profile, 'KS Store · Real Market', 'Canonical KS Profile is not presenting the authoritative Store surface');
expect(profile, 'Only offers this Store explicitly published are shown.', 'Canonical KS Store lost published-only truth wording');
expect(profile, 'Listed ≠ reserved ≠ sold.', 'Canonical KS Store lost listing/reservation/sale boundary');
expect(css, '.b5-door-grid', 'V4 doorway visual grid is missing');
expect(css, '.b5-offer-grid', 'V11 offer grid is missing');
expect(css, '@media(max-width:600px)', 'Batch 05 mobile treatment is missing');
expect(joinDoc, 'Creator / proposer is not automatically the payer.', 'V4 creator ≠ payer law is missing');
expect(storeDoc, 'KSNumber = the trader\'s address in the Market.', 'V11 KSNumber Market-address law is missing');

console.log('\n=== SecurePay Batch 05 visual guard ===');
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}
console.log('PASSED: V4 Invitation & Joining and V11 KS Digital Store visual-lock invariants are present.');
