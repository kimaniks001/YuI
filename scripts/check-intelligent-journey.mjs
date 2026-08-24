import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`Intelligent journey check failed: ${message}`);
  process.exitCode = 1;
};

const experience = read('src/lib/creationExperience.ts');
const engine = read('src/lib/creationEngine.ts');
const shell = read('src/components/creation/CreationShell.tsx');
const intent = read('src/lib/creationIntent.ts');
const traderShell = read('src/components/trader/TraderShell.tsx');
const traderHeader = read('src/components/trader/TraderPageHeader.tsx');
const myMarket = read('src/pages/MyMarket.tsx');
const signedInHome = read('src/pages/SecurePayHome.tsx');
const floatingAssistant = read('src/components/FloatingAssistant.tsx');
const publicHome = read('src/pages/Home.tsx');
const createJourney = read('src/pages/CreateJourney.tsx');
const traderContinuity = read('src/trader-public-continuity.css');

for (const requiredKind of [
  'simple_purchase',
  'simple_sale',
  'service',
  'staged_project',
  'funeral',
  'wedding',
  'hardship',
  'dispute',
]) {
  if (!experience.includes(`kind: '${requiredKind}'`)) {
    fail(`missing contextual experience: ${requiredKind}`);
  }
}

if (!experience.includes("kind: 'simple_purchase'\n") || !experience.includes("askStages: false")) {
  fail('simple purchase is not explicitly stage-free');
}
if (!experience.includes("kind: 'staged_project'")) {
  fail('staged project experience is missing');
}
if (!experience.includes("confirmationTitle: 'Who should confirm the item was received?'")) {
  fail('purchase handover confirmation language is missing');
}
if (!experience.includes("openingTitle: 'I’m sorry you’re arranging this at a difficult time.'")) {
  fail('funeral empathy cue is missing');
}
if (!experience.includes("openingTitle: 'This is a happy one — congratulations.'")) {
  fail('wedding celebration cue is missing');
}
if (!experience.includes('suggestionWhy')) {
  fail('protective suggestions do not explain why');
}

if (!engine.includes('if (shouldAskStages(intent))')) {
  fail('question planner is not stage-adaptive');
}
if (!engine.includes('shouldAskContributionFrequency(intent, facts.frequency.value)')) {
  fail('one-off life events are not protected from unnecessary frequency questions');
}
if (engine.includes("questions.push('counterparty');\n    questions.push('stages');\n    questions.push('confirmer');\n    questions.push('review');")) {
  fail('fixed one-to-one milestone wizard has returned');
}

if (!shell.includes('SecurePay suggests')) {
  fail('contextual protection suggestion card is missing');
}
if (!shell.includes('data-emotional-register')) {
  fail('emotional register is not exposed to the journey surface');
}
if (!shell.includes('experience.suggestionWhy')) {
  fail('the UI does not show why SecurePay is making a suggestion');
}

if (!intent.includes("[/fridge|refrigerator/, 'Fridge purchase']")) {
  fail('fridge purchase intent is not recognised');
}
if (!intent.includes('funeral|burial|bereavement')) {
  fail('sensitive life contexts are not recognised by intent parsing');
}

if (!traderShell.includes('SecurePayLogo')) {
  fail('signed-in trader shell is not using the official SecurePay logo');
}
if (!traderShell.includes('hp-atmosphere') || !traderShell.includes('hp-watermark')) {
  fail('signed-in trader shell is missing the signed-out Market atmosphere');
}
if (!traderShell.includes('Start an agreement')) {
  fail('signed-in primary CTA has drifted from agreement-first language');
}
if (!traderHeader.includes('trader-page-title')) {
  fail('signed-in page headers are not using the shared editorial hierarchy');
}
if (!traderContinuity.includes("font-family: 'Cormorant Garamond'")) {
  fail('signed-in continuity stylesheet lost the public editorial type language');
}
if (!myMarket.includes('signed-in-market-hero') || !myMarket.includes('market-start-prompt')) {
  fail('My Market has drifted back to a plain dashboard composition');
}
if (!myMarket.includes('SecurePay is with the agreement')) {
  fail('My Market is missing the living agreement-guide panel');
}

if (!publicHome.includes('saveCreationIntent(displayIntent)') || !publicHome.includes("'/create/journey'")) {
  fail('signed-out Home no longer preserves typed intent into the creation journey');
}
if (!publicHome.includes('handleIntentKeyDown') || !publicHome.includes("event.key === 'Enter' && !event.shiftKey")) {
  fail('signed-out Home no longer supports Enter-to-continue from the typing space');
}
if (!createJourney.includes('InlineAuthGate') || !createJourney.includes('loadCreationIntent()')) {
  fail('signed-out creation no longer preserves intent through the sign-in boundary');
}

for (const [name, source, placeholder] of [
  ['My Market', myMarket, 'What would you like to agree next?'],
  ['signed-in Home', signedInHome, 'What would you like to agree today?'],
]) {
  if (!source.includes('createCreationIntentFromText(statement)') || !source.includes('saveCreationIntent(intent)')) {
    fail(`${name} typing does not use the shared CreationIntent contract`);
  }
  if (!source.includes("navigate('/create/journey', { state: { intent } })")) {
    fail(`${name} typing does not start the agreement journey directly`);
  }
  if (!source.includes('<textarea') || !source.includes('agreementDraft')) {
    fail(`${name} agreement entry has regressed to a fake button`);
  }
  if (!source.includes('market-start-prompt-input') || !source.includes(`placeholder="${placeholder}"`)) {
    fail(`${name} typing control is not visibly presented as the agreement entry surface`);
  }
  if (!source.includes("event.key === 'Enter' && !event.shiftKey")) {
    fail(`${name} no longer supports Enter-to-continue from the typing space`);
  }
}

if (myMarket.includes("dispatchEvent(new Event('open-ask-securepay'))")) {
  fail('My Market agreement entry still opens the Ask SecurePay overlay instead of accepting typed intent');
}
if (signedInHome.includes("dispatchEvent(new Event('open-ask-securepay'))")) {
  fail('signed-in Home agreement entry still opens the Ask SecurePay overlay instead of accepting typed intent');
}
if (!floatingAssistant.includes("location.pathname === '/market'") || !floatingAssistant.includes("location.pathname === '/dashboard'")) {
  fail('floating assistant can still compete with primary agreement-entry fields');
}
if (!floatingAssistant.includes('if (hasPrimaryAgreementEntry) return null')) {
  fail('floating assistant is not suppressed where a primary agreement entry already exists');
}

if (!process.exitCode) {
  console.log('Intelligent adaptive journey, typed agreement entry and signed-in visual continuity guard passed.');
}
