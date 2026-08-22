import type { AgreementTopology } from './agreementTopology';

export type DeveloperConnectionMethod = 'AI_HANDOFF' | 'HOSTED_PAGE' | 'PLUGIN' | 'API_SDK';

export interface DeveloperMoneyFlowOption {
  id: string;
  label: string;
  description: string;
  topology: AgreementTopology | null;
}

export const DEVELOPER_BUILD_OPTIONS = [
  'Online shop or digital store',
  'Service or contractor app',
  'Booking or reservation app',
  'Contribution or community app',
  'Marketplace',
  'Something else',
] as const;

export const DEVELOPER_MONEY_FLOWS: DeveloperMoneyFlowOption[] = [
  { id: 'one-one', label: 'One person pays one person', description: 'A customer pays one business, worker or seller.', topology: 'ONE_TO_ONE' },
  { id: 'many-one', label: 'Many people contribute to one purpose', description: 'A family, group or community contributes together.', topology: 'MANY_TO_ONE' },
  { id: 'one-many', label: 'One payer pays several people', description: 'One agreement distributes money across several recipients or obligations.', topology: 'ONE_TO_MANY' },
  { id: 'many-many', label: 'Many contribute and several receive', description: 'A governed group collects and distributes across several recipients.', topology: 'MANY_TO_MANY' },
  { id: 'unsure', label: 'I am not sure yet', description: 'SecurePay can help you describe the money movement first.', topology: null },
];

export const DEVELOPER_CONNECTION_METHODS: { id: DeveloperConnectionMethod; label: string; description: string }[] = [
  { id: 'AI_HANDOFF', label: 'Use my AI builder', description: 'Get a short-lived SecureCode and give it to ChatGPT, Claude, Codex or another coding agent.' },
  { id: 'HOSTED_PAGE', label: 'Hosted SecurePay journey', description: 'Let SecurePay host the agreement experience while your app links into it.' },
  { id: 'PLUGIN', label: 'Plugin / copy-paste', description: 'Use a future packaged integration where the supported connector is available.' },
  { id: 'API_SDK', label: 'API / SDK', description: 'Use sandbox credentials and the SecurePay API directly.' },
];

export function developerStructureLabel(topology: AgreementTopology | null): string {
  if (!topology) return 'SecurePay will clarify the money flow during integration.';
  const labels: Record<AgreementTopology, string> = {
    ONE_TO_ONE: 'SecureLink',
    MANY_TO_ONE: 'Group SecureLink',
    ONE_TO_MANY: 'SecureFlow',
    MANY_TO_MANY: 'Group SecureFlow',
  };
  return labels[topology];
}
