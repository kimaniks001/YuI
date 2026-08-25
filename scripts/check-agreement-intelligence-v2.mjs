import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`Agreement journey check failed: ${message}`);
  process.exitCode = 1;
};
const pass = (message) => console.log(`PASS ${message}`);

const intelligence = read('src/lib/agreementIntelligence.ts');
const journey = read('src/pages/CreateJourneyMaster.tsx');
const funding = read('src/pages/AgreementFundingStart.tsx');
const main = read('src/main.tsx');

const requireSource = (source, needle, message) => {
  if (!source.includes(needle)) fail(message);
  else pass(message);
};

requireSource(main, "import CreateJourney from './pages/CreateJourneyMaster';", 'live creation routes use the practical master journey');
requireSource(main, '<Route path="/create/journey" element={<CreateJourney />} />', 'public natural-intent creation route remains available');
requireSource(main, '<Route path="/trainer/create" element={<CreateJourney previewMode />} />', 'Trainer uses the same visible journey without Market writes');
requireSource(main, '<Route path="/agreements/:agreementId/fund"', 'immediate agreement funding route is registered');

requireSource(intelligence, "export type AgreementCheckKind = 'PERFORMANCE' | 'EVIDENCE' | 'ACCEPTANCE' | 'CUSTOM';", 'checks separate performance, evidence and acceptance');
requireSource(intelligence, "kind: 'PERFORMANCE'", 'default performance check exists');
requireSource(intelligence, "kind: 'EVIDENCE'", 'default evidence check exists');
requireSource(intelligence, "kind: 'ACCEPTANCE'", 'default acceptance/authority check exists');
requireSource(intelligence, 'blueprint.checks.length >= 2', 'two meaningful checks remain the hard quality minimum');
requireSource(intelligence, '[intent.statement, intent.who, intent.what, intent.amount, intent.mustHappen, intent.nextStep]', 'the trader’s original words remain the starting point');
for (const stage of ['Foundation', 'Walling', 'Roofing', 'Finishing']) {
  requireSource(intelligence, `'${stage}'`, `explicit ${stage.toLowerCase()} stage can be remembered`);
}
requireSource(intelligence, 'stagesExplicitlyUnderstood', 'explicit stage structure is carried into the visible journey');
requireSource(intelligence, 'parseKenyanAmountMinor', 'Kenyan amount language remains understood');
requireSource(intelligence, 'kshs?', 'KSh/KShs language is recognised');
requireSource(intelligence, "(?:m|million)", 'million shorthand is recognised');

for (const step of [
  "'situation'",
  "'you'",
  "'people'",
  "'agreement'",
  "'money'",
  "'checks'",
  "'stages'",
  "'review'",
]) {
  requireSource(journey, step, `master journey retains ${step} step`);
}
requireSource(journey, "const mood = moodFromIntent(intent);", 'live preview responds to the human situation');
requireSource(journey, 'wedding|bride|groom|harusi', 'wedding context has its own visual mood');
requireSource(journey, 'build|house|construction|contractor|fundi', 'construction context has its own visual mood');
requireSource(journey, 'font-display', 'agreement conversation uses authored editorial typography');
requireSource(journey, 'Live preview', 'master journey keeps the live side preview');
requireSource(journey, 'Keep at least two.', 'customer-facing checks make the 3-to-2 protection rule concise');
requireSource(journey, 'current.length > 2', 'journey prevents removing protections below two checks');
requireSource(journey, 'What must happen before money can move?', 'money conditions remain central to the agreement');
requireSource(journey, 'Anything else important?', 'proposer can add important deal details');
requireSource(journey, 'Who helped bring this agreement?', 'referral attribution is part of agreement review');
requireSource(journey, 'Builder / referrer KSNumber', 'referral is KSNumber attribution, not a referral code');
requireSource(journey, 'blueprint.stagesExplicitlyUnderstood', 'already-stated stages are recognised rather than re-asked');
requireSource(journey, "moneyFlowType: topology === 'MANY_TO_MANY' ? 'GROUP_SECURE_FLOW' : 'SECURE_FLOW'", 'SecureFlow and Group SecureFlow keep their backend topology');
requireSource(journey, 'createGroupSecureLink', 'group journeys keep the backend Group SecureLink structure');
requireSource(journey, 'createAgreementMilestone', 'real stages persist as agreement milestones');
requireSource(journey, 'createAgreementObligation', 'one-payer creation prepares backend-owned funding authority rather than inventing it in UI');
requireSource(journey, 'confirmAgreementVersion', 'creator review is recorded through Agreement Core confirmation');
requireSource(journey, "navigate(`/agreements/${agreementId}/fund`", 'one-payer creator moves directly from SecureLink creation to money');
requireSource(journey, "navigate(`/group/${groupSlug}`", 'group creation moves directly to its contribution surface');

requireSource(funding, 'Fund this SecureLink', 'money is the immediate next room after SecureLink creation');
requireSource(funding, 'getAgreementFundingAuthority', 'funding page asks backend who may fund');
requireSource(funding, 'listAgreementFundingOptions', 'funding page shows only backend-eligible rails');
requireSource(funding, 'createAgreementPaymentIntent', 'funding page creates an agreement-bound payment intent');
requireSource(funding, 'createAgreementFundingQuote', 'quoted rails use backend quote authority');
requireSource(funding, 'initiatePaymentIntent', 'funding page initiates through the existing backend payment boundary');
requireSource(funding, "rail === 'MPESA_STK'", 'M-PESA remains a supported eligible rail');
requireSource(funding, "'PESALINK'", 'PesaLink remains supported when the backend offers it');
requireSource(funding, 'waiting for the payment provider to confirm what happened', 'UI does not claim funding from initiation alone');

if (!process.exitCode) console.log('Practical SecurePay agreement journey, topology and immediate-funding guard passed.');
