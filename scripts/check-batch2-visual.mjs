import fs from 'node:fs';

const failures = [];
const read = (p) => fs.readFileSync(p, 'utf8');
const main = read('src/main.tsx');
const signin = read('src/pages/SignIn.tsx');
const signup = read('src/pages/Signup.tsx');
const activation = read('src/pages/KSActivation.tsx');
const shell = read('src/components/creation/CreationShell.tsx');
const create = read('src/pages/CreateJourney.tsx');
const css = read('src/batch2-identity-journey.css');

function expect(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

expect(main, '<SignIn previewMode />', 'preview sign-in is not isolated from production authentication');
expect(main, '<Signup previewMode />', 'preview signup is not isolated from production signup writes');
expect(main, '<KSActivation previewMode />', 'preview activation route is not marked as visual review');
expect(signin, 'identity-doorway', 'sign-in no longer uses the Identity Doorway visual language');
expect(signup, 'Create your KSNumber', 'signup lost KSNumber-first identity language');
expect(signup, 'Nothing here moves money.', 'signup lost its non-financial reassurance');
expect(activation, 'We will explain what each amount does before you choose anything.', 'activation lost amount-purpose guidance');
expect(activation, 'state="caution"', 'activation caution is not carried by the Living SecurePay Mark');
expect(shell, 'You can change an answer before you create the agreement.', 'creation rooms lost correction reassurance');
expect(create, 'markState="listening"', 'creation understood state no longer uses listening posture');
expect(create, 'markState="caution"', 'unsupported creation state no longer uses caution posture');
expect(create, 'Agreement creation preview is complete', 'preview completion no longer distinguishes agreement creation from money truth');
expect(css, '.identity-doorway__layout', 'Identity Doorway responsive layout CSS is missing');
expect(css, '.journey-phase-label', 'creation phase-label visual rule is missing');

console.log('\n=== SecurePay Batch 02 visual guard ===');
if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log('PASSED: V2 Identity Doorway and V3 creation visual-lock invariants are present.');
