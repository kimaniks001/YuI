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

if (!process.exitCode) {
  console.log('Intelligent adaptive journey guard passed.');
}
