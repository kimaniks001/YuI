import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`Agreement Intelligence V2 check failed: ${message}`);
  process.exitCode = 1;
};
const pass = (message) => console.log(`PASS ${message}`);

const intelligence = read('src/lib/agreementIntelligence.ts');
const journey = read('src/pages/CreateJourneyV2.tsx');
const main = read('src/main.tsx');

const requireSource = (source, needle, message) => {
  if (!source.includes(needle)) fail(message);
  else pass(message);
};

requireSource(main, "import CreateJourney from './pages/CreateJourneyV2';", 'live creation routes use Agreement Intelligence V2');
requireSource(main, '<Route path="/create/journey" element={<CreateJourney />} />', 'public creation route remains available before sign-in');
requireSource(main, '<Route path="/trainer/create" element={<CreateJourney previewMode />} />', 'Trainer uses the same intelligent spine without Market writes');

requireSource(intelligence, "export type AgreementCheckKind = 'PERFORMANCE' | 'EVIDENCE' | 'ACCEPTANCE' | 'CUSTOM';", 'checks separate performance, evidence and acceptance');
requireSource(intelligence, "kind: 'PERFORMANCE'", 'default performance check exists');
requireSource(intelligence, "kind: 'EVIDENCE'", 'default evidence check exists');
requireSource(intelligence, "kind: 'ACCEPTANCE'", 'default acceptance/authority check exists');
requireSource(intelligence, 'blueprint.checks.length >= 2', 'two meaningful checks are the hard quality minimum');
requireSource(intelligence, 'Two checks is the hard minimum. SecurePay normally recommends three independent checks.', 'two-vs-three doctrine is explicit');

requireSource(intelligence, '[intent.statement, intent.who, intent.what, intent.amount, intent.mustHappen, intent.nextStep]', 'intelligence reuses the trader’s original intent instead of asking from zero');
for (const stage of ['Foundation', 'Walling', 'Roofing', 'Finishing']) {
  requireSource(intelligence, `'${stage}'`, `explicit ${stage.toLowerCase()} stage can be remembered`);
}
requireSource(intelligence, 'stagesExplicitlyUnderstood', 'explicit stage structure is carried into the journey');
requireSource(intelligence, 'parseKenyanAmountMinor', 'Kenyan amount parser is part of agreement intelligence');
requireSource(intelligence, 'kshs?', 'KSh/KShs money language is recognised');
requireSource(intelligence, "(?:m|million)", 'million shorthand is recognised');

for (const customerRequirement of [
  'Who is actually trading?',
  'Agreement amount',
  'When does this agreement begin?',
  'What must be true before money should move?',
  'Anything else important?',
  'If a required condition is not met or is disputed',
  'Agreement quality gate',
  'This is the agreement I want to propose.',
]) {
  requireSource(journey, customerRequirement, `journey asks: ${customerRequirement}`);
}

requireSource(journey, 'How many are paying/contributing?', 'journey asks payer/contributor count');
requireSource(journey, 'How many receive money/value?', 'journey asks recipient count');
requireSource(journey, 'blueprint.checks.length <= 2', 'journey prevents reducing protections below two checks');
requireSource(journey, 'Add another protection', 'proposer can strengthen the agreement with more checks');
requireSource(journey, 'additionalDetails', 'proposer has a place for additional deal details');
requireSource(journey, 'serializeAgreementDescription', 'rich agreement intelligence is preserved in the Agreement Core proposal');
requireSource(journey, 'createAgreementMilestone', 'staged agreements persist real stages as backend milestones when supported');
requireSource(journey, 'createGroupSecureLink', 'many-payer agreements retain backend group structure');
requireSource(journey, "moneyFlowType: blueprint.topology === 'MANY_TO_MANY' ? 'GROUP_SECURE_FLOW' : 'SECURE_FLOW'", 'one-to-many and many-to-many retain distribution-plan topology');
requireSource(journey, 'recipient allocations do not yet add up to the agreement amount. Nothing was guessed.', 'distribution allocations fail closed instead of guessing');
requireSource(journey, 'does not itself prove performance, fund money, establish Payment Ready, release money or settle anything.', 'review preserves backend financial authority');
requireSource(journey, 'Trainer/preview mode created no Market record and moved no money.', 'preview mode remains simulation-only');

if (!process.exitCode) console.log('Agreement Intelligence V2 quality, topology and authority guard passed.');
