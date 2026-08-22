import fs from 'node:fs';

const files = {
  main: fs.readFileSync('src/main.tsx', 'utf8'),
  devPreview: fs.readFileSync('src/pages/PreviewDeveloperJourney.tsx', 'utf8'),
  devLive: fs.readFileSync('src/pages/DeveloperJourney.tsx', 'utf8'),
  help: fs.readFileSync('src/pages/HelpCenter.tsx', 'utf8'),
  trust: fs.readFileSync('src/pages/TrustPage.tsx', 'utf8'),
  legal: fs.readFileSync('src/components/LegalLayout.tsx', 'utf8'),
  css: fs.readFileSync('src/batch9-developer-knowledge.css', 'utf8'),
  report: fs.readFileSync('docs/BATCH_09_V13_V14_REPORT.md', 'utf8'),
};

const checks = [
  ['Batch 9 stylesheet loaded', files.main.includes("'./batch9-developer-knowledge.css'")],
  ['Developer preview remains DEV route', files.main.includes('/preview/developers')],
  ['Developer starts from business intent', files.devPreview.includes('What did you build?') && files.devPreview.includes('What should money do?')],
  ['Developer translates topology underneath', files.devPreview.includes('The topology is infrastructure, not homework.')],
  ['Sandbox is visually separate', files.devPreview.includes('SANDBOX · PREVIEW ONLY') && files.devPreview.includes('Production is a separate gate.')],
  ['AI does not certify itself', files.devPreview.includes('Your AI does not certify itself') && files.devLive.includes('SecurePay remains the authority')],
  ['Permanent secret boundary present', files.devPreview.includes('Permanent secrets do not belong in chat') && files.devLive.includes('Permanent secrets stay in a secret manager')],
  ['Financial authority boundary present', files.devPreview.includes('Payment Ready, settlement, release authority')],
  ['Help is intention-first', files.help.includes('What do you want to understand?') && files.help.includes('You do not need the product name.')],
  ['Knowledge uses progressive disclosure', files.help.includes('Short answer') && files.help.includes('Example') && files.help.includes('Full reference')],
  ['Knowledge links formal trust rooms', files.help.includes('Trust & formal knowledge') && files.help.includes('/security') && files.help.includes('/compliance') && files.help.includes('/not-a-bank')],
  ['Living SecurePay Mark guides developer and knowledge', files.devPreview.includes('LivingSecurePayMark') && files.help.includes('LivingSecurePayMark') && files.legal.includes('LivingSecurePayMark')],
  ['Trust hero moved from dark wall to clarity room', files.trust.includes('b9-trust-hero') && files.trust.includes('Trust is built through clarity.')],
  ['Legal knowledge navigation present', files.legal.includes('SecurePay knowledge rooms')],
  ['Mobile targets preserved', files.css.includes('@media(max-width:620px)') && files.css.includes('min-height:44px')],
  ['Reduced motion support', files.css.includes('prefers-reduced-motion:reduce')],
  ['Batch report present', files.report.includes('Batch 9 — V13 Developer Market + V14 Help, Trust & Knowledge')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
