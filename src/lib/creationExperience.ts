import type { CreationIntent } from './creationIntent';

export type AgreementExperienceKind =
  | 'simple_purchase'
  | 'simple_sale'
  | 'service'
  | 'staged_project'
  | 'funeral'
  | 'wedding'
  | 'hardship'
  | 'dispute'
  | 'group_support'
  | 'general';

export type EmotionalRegister =
  | 'commercial'
  | 'celebratory'
  | 'compassionate'
  | 'sensitive'
  | 'calm'
  | 'supportive';

export interface CreationExperience {
  kind: AgreementExperienceKind;
  register: EmotionalRegister;
  askStages: boolean;
  stageTitle: string;
  confirmationTitle: string;
  confirmationShortLabel: string;
  openingTitle: string;
  openingBody: string;
  finalTitle: string;
  finalBody: string;
  suggestionTitle: string;
  suggestionBody: string;
  suggestionWhy: string;
}

function textFor(intent: CreationIntent): string {
  return [intent.statement, intent.what, intent.mustHappen, intent.nextStep]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function hasExplicitStageSignal(text: string): boolean {
  return /\b(stage|stages|milestone|milestones|phase|phases|progress payment|progress payments|instalment|installment|foundation|roofing|walling|finishes)\b/.test(text);
}

function isComplexProject(text: string): boolean {
  return /\b(build|building|construction|renovation|renovate|borehole|house project|construction project|major repair|roofing project|software project|website development)\b/.test(text);
}

function isPurchase(text: string): boolean {
  return /\b(buy|buying|purchase|purchasing|order|ordering|buyer|purchase agreement)\b/.test(text);
}

function isSale(text: string): boolean {
  return /\b(sell|selling|seller|sale agreement)\b/.test(text);
}

function isService(text: string): boolean {
  return /\b(hire|hiring|fundi|painter|plumber|electrician|contractor|repair|fix|service agreement|work agreement)\b/.test(text);
}

export function isNaturallyOneOffLifeEvent(intent: CreationIntent): boolean {
  const text = textFor(intent);
  if (/\b(every month|monthly|every week|weekly|recurring|each month|each week)\b/.test(text)) return false;
  return /\b(funeral|burial|memorial|bereavement|wedding|ruracio|dowry|marriage ceremony|harambee)\b/.test(text);
}

export function getCreationExperience(intent: CreationIntent): CreationExperience {
  const text = textFor(intent);

  if (/\b(funeral|burial|memorial|bereavement|condolence|passed away|loss of a loved one)\b/.test(text)) {
    return {
      kind: 'funeral',
      register: 'compassionate',
      askStages: false,
      stageTitle: 'Would stages help here?',
      confirmationTitle: 'Who should confirm this support arrangement is correct?',
      confirmationShortLabel: 'Confirm',
      openingTitle: 'I’m sorry you’re arranging this at a difficult time.',
      openingBody: 'I’ll keep this simple and respectful. We only need enough clarity for contributors and the family to understand the purpose, recipient and what happens next.',
      finalTitle: 'Everything is set out clearly.',
      finalBody: 'Please check the people, purpose and amount once. Clear records can reduce extra questions for the family during a difficult time.',
      suggestionTitle: 'Keep the support purpose and recipient unmistakably clear',
      suggestionBody: 'Name what the contribution is for, who should receive it and any date contributors should know about.',
      suggestionWhy: 'Why: during bereavement, fewer unanswered money questions means less burden on the family and contributors.',
    };
  }

  if (/\b(wedding|ruracio|dowry|bride|groom|marriage ceremony)\b/.test(text)) {
    return {
      kind: 'wedding',
      register: 'celebratory',
      askStages: false,
      stageTitle: 'Would stages help here?',
      confirmationTitle: 'Who should confirm the contribution arrangement?',
      confirmationShortLabel: 'Confirm',
      openingTitle: 'This is a happy one — congratulations.',
      openingBody: 'Let’s make the contribution clear so people can support the celebration without confusion about the purpose, target or timing.',
      finalTitle: 'Your celebration agreement is nearly ready.',
      finalBody: 'Check the purpose, people and amount once more, then you can share it with confidence.',
      suggestionTitle: 'Agree the purpose, target and date early',
      suggestionBody: 'Make it clear what people are contributing toward, the target amount if there is one, and the date the contribution should close.',
      suggestionWhy: 'Why: everyone can celebrate the same goal without different expectations about what the money is meant to cover.',
    };
  }

  if (/\b(dispute|complaint|refund|not delivered|did not deliver|didn’t deliver|failed to deliver|problem with|issue with|conflict)\b/.test(text)) {
    return {
      kind: 'dispute',
      register: 'calm',
      askStages: false,
      stageTitle: 'Would stages help here?',
      confirmationTitle: 'Who should confirm the agreed resolution?',
      confirmationShortLabel: 'Confirm',
      openingTitle: 'Let’s keep this calm and factual.',
      openingBody: 'We’ll separate what was agreed, what happened and what still needs to be resolved. SecurePay should not take sides; the record should stay clear for everyone.',
      finalTitle: 'The facts are now easier to compare.',
      finalBody: 'Check that the agreement says what both sides can actually verify before you continue.',
      suggestionTitle: 'Keep evidence and expectations separate',
      suggestionBody: 'Record what was promised, what was delivered, dates and any evidence that can be checked by both sides.',
      suggestionWhy: 'Why: clear facts reduce argument about memory and help both traders focus on the actual agreement.',
    };
  }

  if (/\b(hospital|medical|medicine|treatment|emergency|rent arrears|school fees|caregiver|hardship|urgent support)\b/.test(text)) {
    return {
      kind: 'hardship',
      register: 'sensitive',
      askStages: false,
      stageTitle: 'Would stages help here?',
      confirmationTitle: 'Who should confirm this support arrangement?',
      confirmationShortLabel: 'Confirm',
      openingTitle: 'We’ll keep this clear and gentle.',
      openingBody: 'This may be a difficult payment. SecurePay will focus on the amount, purpose, people and timing without adding unnecessary steps.',
      finalTitle: 'You’ve made the arrangement clearer.',
      finalBody: 'Check the amount, purpose and responsibilities once so nobody has to guess later.',
      suggestionTitle: 'Make dates and responsibilities explicit',
      suggestionBody: 'Record what is due, when it is needed and who is responsible for each next step.',
      suggestionWhy: 'Why: when pressure is already high, clarity can prevent an urgent payment from creating a second problem.',
    };
  }

  const explicitStages = hasExplicitStageSignal(text);
  if (explicitStages || isComplexProject(text)) {
    return {
      kind: 'staged_project',
      register: 'commercial',
      askStages: true,
      stageTitle: 'Would splitting this work into stages help?',
      confirmationTitle: 'Who should confirm the work is complete?',
      confirmationShortLabel: 'Completion',
      openingTitle: 'Good — let’s shape this job around how the work will actually happen.',
      openingBody: 'Because this looks like work that progresses over time, SecurePay can help you make each important stage visible instead of treating the whole job as one moment.',
      finalTitle: 'The job now has a clearer path from agreement to completion.',
      finalBody: 'Check that the stages match the real work before you create the agreement.',
      suggestionTitle: 'Let progress and payment follow clear stages',
      suggestionBody: 'Use stages only where they represent meaningful progress — for example foundation, roofing or final completion.',
      suggestionWhy: 'Why: both traders can see what “done so far” means instead of arguing about a percentage later.',
    };
  }

  if (isPurchase(text)) {
    return {
      kind: 'simple_purchase',
      register: 'commercial',
      askStages: false,
      stageTitle: 'Would stages help this purchase?',
      confirmationTitle: 'Who should confirm the item was received?',
      confirmationShortLabel: 'Handover',
      openingTitle: 'Nice — let’s make this purchase clear without overcomplicating it.',
      openingBody: 'For a normal purchase, you should not have to invent project stages. We’ll focus on the seller, the item and a clear handover point.',
      finalTitle: 'This purchase now has a clear handover point.',
      finalBody: 'Check the item, amount and who confirms receipt. If those are right, the agreement is ready to create.',
      suggestionTitle: 'Agree the exact item and handover',
      suggestionBody: 'Be clear about the model or condition where it matters, where delivery or collection happens, and who confirms receipt.',
      suggestionWhy: 'Why: both traders then know the simple moment that shows the purchase agreement has been met.',
    };
  }

  if (isSale(text)) {
    return {
      kind: 'simple_sale',
      register: 'commercial',
      askStages: false,
      stageTitle: 'Would stages help this sale?',
      confirmationTitle: 'Who should confirm the handover?',
      confirmationShortLabel: 'Handover',
      openingTitle: 'Good — let’s make this sale easy for both traders to understand.',
      openingBody: 'A straightforward sale usually needs a clear buyer, item, amount and handover — not project stages.',
      finalTitle: 'The sale has a clear handover point.',
      finalBody: 'Check that the buyer, item, amount and handover match what you mean before you create it.',
      suggestionTitle: 'Make the item and handover unambiguous',
      suggestionBody: 'Record what is being sold, its agreed condition where relevant, and how the buyer confirms receipt.',
      suggestionWhy: 'Why: a clear handover protects both seller and buyer from different memories of what “delivered” meant.',
    };
  }

  if (isService(text)) {
    return {
      kind: 'service',
      register: 'commercial',
      askStages: explicitStages,
      stageTitle: 'Would splitting this work into stages help?',
      confirmationTitle: 'Who should confirm the work is complete?',
      confirmationShortLabel: 'Completion',
      openingTitle: 'Let’s make the work clear before anyone has to rely on memory.',
      openingBody: 'We’ll focus on the provider, scope and what will show that the work is complete. Stages only appear if the job genuinely needs them.',
      finalTitle: 'The work now has a clearer finish line.',
      finalBody: 'Check that the scope and completion point match what you expect from the service provider.',
      suggestionTitle: 'Define the scope and the finish line',
      suggestionBody: 'Say what the provider is responsible for and what evidence or confirmation will show that the work is complete.',
      suggestionWhy: 'Why: a clear finish line protects the customer from incomplete work and the provider from endless extra expectations.',
    };
  }

  if (intent.family === 'life') {
    return {
      kind: 'group_support',
      register: 'supportive',
      askStages: false,
      stageTitle: 'Would stages help here?',
      confirmationTitle: 'Who should confirm this arrangement?',
      confirmationShortLabel: 'Confirm',
      openingTitle: 'Let’s make the support simple for everyone involved.',
      openingBody: 'SecurePay will keep the purpose, people, amount and timing visible so nobody has to guess what the arrangement means.',
      finalTitle: 'The support arrangement is now clearer.',
      finalBody: 'Check the people, purpose and amount once before you create it.',
      suggestionTitle: 'Keep purpose, people and timing visible',
      suggestionBody: 'Record who is contributing, who receives, what the support is for and whether it is one-off or recurring.',
      suggestionWhy: 'Why: support works better when generosity is not weakened by uncertainty about the arrangement.',
    };
  }

  return {
    kind: 'general',
    register: 'supportive',
    askStages: explicitStages,
    stageTitle: 'Would stages genuinely help this agreement?',
    confirmationTitle: 'Who should confirm the agreement is complete?',
    confirmationShortLabel: 'Confirm',
    openingTitle: 'Tell me enough to make the agreement clear — no more than that.',
    openingBody: 'SecurePay should ask only what helps the parties understand what must happen before the agreement is complete.',
    finalTitle: 'The agreement is ready for one final check.',
    finalBody: 'Read it once from top to bottom and change anything that does not match what you mean.',
    suggestionTitle: 'Make the completion point easy to recognise',
    suggestionBody: 'Record the people, amount and the event or evidence that tells both sides the agreement has been met.',
    suggestionWhy: 'Why: money can only follow the agreement reliably when the agreement itself has a clear finish line.',
  };
}

export function shouldAskStages(intent: CreationIntent): boolean {
  return getCreationExperience(intent).askStages;
}

export function shouldAskContributionFrequency(intent: CreationIntent, knownFrequency: string | null): boolean {
  if (knownFrequency) return false;
  return !isNaturallyOneOffLifeEvent(intent);
}
