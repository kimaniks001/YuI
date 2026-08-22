export type MarketIdentityAccessSource = 'CURRENT_IDENTITY' | string;

export interface SecurePayMarketIdentity {
  ksNumber: string;
  identityType: string;
  displayName: string | null;
  current: boolean;
  canView: boolean;
  canAct: boolean;
  accessSource: MarketIdentityAccessSource;
}

export interface SecurePayMarketStatementLine {
  statementLineId: string;
  journalId: string;
  journalReference: string;
  journalType: string;
  journalStatus: string;
  effectiveAt: string;
  postedAt: string;
  description: string | null;
  accountId: string;
  accountCode: string;
  accountPurpose: string;
  accountCategory: string;
  normalBalance: 'DEBIT' | 'CREDIT' | string;
  direction: 'DEBIT' | 'CREDIT' | string;
  amountMinor: number;
  currency: string;
  memo: string | null;
}

export interface SecurePayMarketStatement {
  ksNumber: string;
  displayName: string | null;
  identityType: string;
  generatedAt: string;
  limit: number;
  lines: SecurePayMarketStatementLine[];
}
