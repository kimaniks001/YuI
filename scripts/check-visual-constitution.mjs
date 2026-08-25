import fs from 'node:fs';

const failures = [];
const read = (path) => fs.readFileSync(path, 'utf8');
const main = read('src/main.tsx');
const home = read('src/pages/Home.tsx');
const homeCss = read('src/home.css');
const mark = read('src/components/LivingSecurePayMark.tsx');
const constitution = read('src/securepay-visual-constitution.css');
function requireText(source, text, message) { if (!source.includes(text)) failures.push(message); }
requireText(main, "import './securepay-visual-constitution.css';", 'global visual constitution tokens are not loaded');
requireText(main, "import './collect.css';", 'Collect visual master stylesheet is not loaded');
requireText(home, '<SecurePayLogo size="header" />', 'approved signed-out Market entrance wordmark is missing');
requireText(home, 'LivingSecurePayMark', 'Market no longer uses the Living SecurePay Mark');
requireText(home, 'Make the deal.<em>The money follows.</em>', 'Figma-approved editorial Home headline is missing');
requireText(home, 'hp-mobile-understanding', 'mobile agreement understanding no longer sits beside the primary play area');
requireText(mark, "'resting' | 'listening' | 'guiding' | 'success' | 'caution' | 'waiting' | 'review' | 'complete'", 'Living Mark state vocabulary changed without constitution review');
requireText(homeCss, '@media (max-width: 430px) and (max-height: 850px)', 'compact-phone certification rule is missing');
requireText(homeCss, '@media (min-width: 400px) and (max-width: 430px) and (min-height: 880px)', 'modern large-phone certification rule is missing');
requireText(constitution, '--sp-touch-min: 44px;', 'minimum touch target token is missing');
requireText(constitution, '--sp-green: #1f7a22;', 'canonical SecurePay green token is missing');
requireText(constitution, '--sp-orange: #ee7d1a;', 'canonical SecurePay orange token is missing');
console.log('\n=== SecurePay visual constitution guard ===');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL: ${failure}`)); process.exit(1); }
console.log('PASSED: visual constitution, Figma Home master and mobile interaction invariants are present.');
