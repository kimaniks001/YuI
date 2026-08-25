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
const auth = read('src/lib/auth.tsx');
const apiClient = read('src/api/securepayClient.ts');
const requireAuth = read('src/routing/RequireAuth.tsx');
const traderShell = read('src/components/trader/TraderShell.tsx');
const traderHeader = read('src/components/trader/TraderPageHeader.tsx');
const myMarket = read('src/pages/MyMarket.tsx');
const signedInHome = read('src/pages/SecurePayHome.tsx');
const comingUp = read('src/components/trader/TraderComingUp.tsx');
const planning = read('src/lib/traderPlanning.ts');
const traderHomeCss = read('src/trader-home.css');
const floatingAssistant = read('src/components/FloatingAssistant.tsx');
const publicHome = read('src/pages/Home.tsx');
const createJourney = read('src/pages/CreateJourney.tsx');
const main = read('src/main.tsx');
const traderContinuity = read('src/trader-public-continuity.css');

for (const requiredKind of [
  'simple_purchase', 'simple_sale', 'service', 'staged_project',
  'funeral', 'wedding', 'hardship', 'dispute',
]) {
  if (!experience.includes(`kind: '${requiredKind}'`)) fail(`missing contextual experience: ${requiredKind}`);
}

// Protect behaviour, not formatting. A simple purchase must explicitly return
// askStages:false, while a staged project must explicitly return true.
if (!/kind:\s*'simple_purchase'[\s\S]{0,180}?askStages:\s*false/.test(experience)) {
  fail('simple purchase is not explicitly stage-free');
}
if (!/kind:\s*'staged_project'[\s\S]{0,180}?askStages:\s*true/.test(experience)) {
  fail('staged project experience is not explicitly stage-aware');
}
if (!experience.includes("confirmationTitle: 'Who should confirm the item was received?'")) fail('purchase handover confirmation language is missing');
if (!experience.includes("openingTitle: 'I’m sorry you’re arranging this at a difficult time.'")) fail('funeral empathy cue is missing');
if (!experience.includes("openingTitle: 'This is a happy one — congratulations.'")) fail('wedding celebration cue is missing');
if (!experience.includes('suggestionWhy')) fail('protective suggestions do not explain why');

if (!engine.includes('if (shouldAskStages(intent))')) fail('question planner is not stage-adaptive');
if (!engine.includes('shouldAskContributionFrequency(intent, facts.frequency.value)')) fail('one-off life events are not protected from unnecessary frequency questions');
if (engine.includes("questions.push('counterparty');\n    questions.push('stages');\n    questions.push('confirmer');\n    questions.push('review');")) fail('fixed one-to-one milestone wizard has returned');

if (!shell.includes('SecurePay suggests')) fail('contextual protection suggestion card is missing');
if (!shell.includes('data-emotional-register')) fail('emotional register is not exposed to the journey surface');
if (!shell.includes('experience.suggestionWhy')) fail('the UI does not show why SecurePay is making a suggestion');

if (!intent.includes("[/fridge|refrigerator/, 'Fridge purchase']")) fail('fridge purchase intent is not recognised');
if (!intent.includes('funeral|burial|bereavement')) fail('sensitive life contexts are not recognised by intent parsing');

// Public try-before-sign-in contract. A saved intent may unlock only the
// creation question engine; protected Market rooms still require a real session.
if (!intent.includes('CREATION_TRIAL_STARTED_EVENT') || !intent.includes('CREATION_AUTH_REQUIRED_EVENT')) fail('creation intent no longer opens the public trial/auth boundary');
if (!auth.includes("id: 'securepay-public-trial'") || !auth.includes('trialMode')) fail('AuthProvider no longer exposes the non-authoritative creation trial identity');
if (!auth.includes('CREATION_AUTH_COMPLETED_EVENT') || !auth.includes('detail: { accessToken: result.data.accessToken }')) fail('completed inline authentication no longer resumes a waiting create request');
if (!requireAuth.includes('if (!session)')) fail('protected Market routes are not requiring a genuine backend session');
if (!apiClient.includes('waitForCreationAuthentication') || !apiClient.includes('CREATION_AUTH_REQUIRED_EVENT')) fail('agreement creation no longer pauses for authentication at the write boundary');
if (!apiClient.includes("path === '/api/v1/agreements'") || !apiClient.includes('resumedCreationAccessToken')) fail('public trial cannot safely resume the exact agreement create request after sign-in');
if (!main.includes('<Route path="/create/journey" element={<CreateJourney />} />')) fail('/create/journey is no longer a public trial route');
if (main.includes('<Route path="/create/journey" element={<Protected>')) fail('/create/journey was incorrectly put behind route-level authentication');

// Signed-out Home interaction contract. Only the serializable CreationIntent
// may cross browser history; Home's visual icon components must stay local.
if (!publicHome.includes('function toCreationIntent(intent: Intent): CreationIntent')) fail('Home no longer strips visual-only fields before route navigation');
if (!publicHome.includes('const creationIntent = toCreationIntent(displayIntent)')) fail('Home does not build a serializable creation intent before continuing');
if (!publicHome.includes('saveCreationIntent(creationIntent)')) fail('signed-out Home no longer preserves its serializable intent');
if (!publicHome.includes("navigate(reviewMode ? '/preview/create' : '/create/journey', { state: { intent: creationIntent } })")) fail('signed-out Home no longer sends the serializable intent into the journey');
if (publicHome.includes('state: { intent: displayIntent }')) fail('Home is passing the visual Intent into browser history');
if (!publicHome.includes('handleIntentKeyDown') || !publicHome.includes("event.key === 'Enter' && !event.shiftKey")) fail('signed-out Home no longer supports Enter-to-continue');
if ((publicHome.match(/onClick={goCreate}/g) ?? []).length < 3) fail('Home create actions are no longer consistently wired to goCreate');
if (!publicHome.includes('onClick={() => chooseIntent(intent)}')) fail('popular Home choices no longer update the selected agreement intent');
if (!publicHome.includes('setExpandedTrade') || !publicHome.includes('setExpandedLife')) fail('Home Explore controls are not wired');
if (!publicHome.includes("document.getElementById('discover-securepay')?.scrollIntoView")) fail('Home learn-more control is not wired');
for (const route of ['/signin', '/situations', '/help', '/trust']) {
  if (!publicHome.includes(`'${route}'`) && !publicHome.includes(`"${route}"`)) fail(`Home is missing its ${route} navigation`);
  if (!main.includes(`path="${route}"`)) fail(`Home points to ${route}, but the route is not registered`);
}
if (!publicHome.includes('id="discover-securepay"')) fail('Home learn-more destination has disappeared');
if (!publicHome.includes('Use this information to continue')) fail('Home demo card has lost its continue action');
if (!createJourney.includes('InlineAuthGate') || !createJourney.includes('loadCreationIntent()')) fail('creation no longer preserves intent through the inline sign-in boundary');

// Shared signed-in identity and action entry.
if (!traderShell.includes('SecurePayLogo')) fail('signed-in trader shell is not using the official SecurePay logo');
if (!traderShell.includes('hp-atmosphere') || !traderShell.includes('hp-watermark')) fail('signed-in trader shell is missing the signed-out Market atmosphere');
if (!traderShell.includes('Start an agreement')) fail('signed-in primary CTA has drifted from agreement-first language');
if (!traderShell.includes('/dashboard#start-agreement')) fail('signed-in header start action is not connected to Home agreement entry');
if (!traderShell.includes('actionCount') || !traderShell.includes('trader-mobile-nav-badge')) fail('mobile Action Centre no longer surfaces backend attention count');
if (!traderHeader.includes('trader-page-title')) fail('signed-in page headers are not using the shared editorial hierarchy');
if (!traderContinuity.includes("font-family: 'Cormorant Garamond'")) fail('signed-in continuity stylesheet lost the public editorial type language');

// My Market is now intentionally situation-first rather than a second hero page.
for (const required of [
  "type MarketView = 'attention' | 'waiting' | 'active' | 'completed'",
  'trader-home-situation',
  'trader-home-metrics',
  'market-start-prompt',
  'setView(id)',
  'visibleItems',
]) {
  if (!myMarket.includes(required)) fail(`My Market is missing its situation-first behaviour: ${required}`);
}
if (myMarket.includes('signed-in-market-hero') || myMarket.includes('SecurePay is with the agreement')) {
  fail('My Market has regressed to the old explanatory hero/guide layout');
}

// Signed-in Home reports the trader's situation rather than re-explaining SecurePay.
for (const required of [
  'trader-home-today', 'trader-home-situation-strip', 'trader-home-focus',
  'trader-home-agreement-entry', 'TraderComingUp', 'attentionRequired',
  'countComingUpThisWeek',
]) {
  if (!signedInHome.includes(required)) fail(`signed-in Home is missing ${required}`);
}
if (!signedInHome.includes('createCreationIntentFromText(statement)') || !signedInHome.includes('saveCreationIntent(intent)')) fail('signed-in Home typing does not use the shared CreationIntent contract');
if (!signedInHome.includes("navigate('/create/journey', { state: { intent } })")) fail('signed-in Home typing does not start the agreement journey directly');
if (!signedInHome.includes('id="signed-in-agreement-entry"') || !signedInHome.includes("event.key === 'Enter' && !event.shiftKey")) fail('signed-in Home natural-language entry is not a real Enter-enabled textarea');
if (!signedInHome.includes('slice(0, 2).map(item => <TraderAgreementCard')) fail('signed-in Home is showing too many agreement cards before See all');
if (!signedInHome.includes('activity.slice(0, 2)')) fail('signed-in Home is showing too much recent activity');
for (const removedCopy of [
  'Start with the agreement, not the payment.',
  'Your work stays primary. SecurePay helps keep the agreement clear.',
  'The SecurePay identity attached to this signed-in view.',
]) {
  if (signedInHome.includes(removedCopy)) fail(`signed-in Home has regressed to explanatory dashboard copy: ${removedCopy}`);
}

// Planning strip is derived only from backend-returned agreement dates/actions.
for (const required of ['agreement.nextActions', 'agreement.nextDeadline', 'collectTraderPlannerEvents', 'buildTraderPlanningWeek']) {
  if (!planning.includes(required)) fail(`planning projection is missing backend-derived behaviour: ${required}`);
}
for (const required of ['Agreement dates only', 'No SecurePay agreement commitments are recorded for this day.', 'Plan on this day']) {
  if (!comingUp.includes(required)) fail(`Coming up UI is missing truthful planning language: ${required}`);
}
if (comingUp.includes('You are free') || comingUp.includes('Available all day') || planning.includes('You are free')) fail('Coming up planner is claiming availability that SecurePay cannot prove');
if (!traderHomeCss.includes('@media(max-width:760px)') || !traderHomeCss.includes('trader-home-around-rail') || !traderHomeCss.includes('trader-coming-up-days')) fail('signed-in Home is missing its mobile-first compact planning/around-you layout');

for (const [name, source] of [['My Market', myMarket], ['signed-in Home', signedInHome]]) {
  if (!source.includes('createCreationIntentFromText(statement)') || !source.includes('saveCreationIntent(intent)')) fail(`${name} typing does not use the shared CreationIntent contract`);
  if (!source.includes("navigate('/create/journey', { state: { intent } })")) fail(`${name} typing does not start the agreement journey directly`);
  if (!source.includes('<textarea') || !source.includes('agreementDraft')) fail(`${name} agreement entry has regressed to a fake button`);
  if (!source.includes("event.key === 'Enter' && !event.shiftKey")) fail(`${name} no longer supports Enter-to-continue`);
}
if (myMarket.includes("dispatchEvent(new Event('open-ask-securepay'))")) fail('My Market entry still opens Ask SecurePay instead of accepting typed intent');
if (signedInHome.includes("dispatchEvent(new Event('open-ask-securepay'))")) fail('signed-in Home entry still opens Ask SecurePay instead of accepting typed intent');
if (!floatingAssistant.includes("location.pathname === '/market'") || !floatingAssistant.includes("location.pathname === '/dashboard'")) fail('floating assistant can still compete with primary agreement-entry fields');
if (!floatingAssistant.includes('if (hasPrimaryAgreementEntry) return null')) fail('floating assistant is not suppressed where a primary agreement entry exists');

if (!process.exitCode) console.log('Intelligent journey, public trial, situation-first signed-in Home/Market and truthful planning guard passed.');
