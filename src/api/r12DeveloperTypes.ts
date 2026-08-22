export type DeveloperEnvironment = 'SANDBOX' | 'PRODUCTION';
export type DeveloperApplicationStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | string;
export type DeveloperApiScope = 'SANDBOX_SIMULATE' | 'WEBHOOKS_MANAGE';

export interface RegisterDeveloperApplicationRequest {
  name: string;
  ownerBusinessKsNumber: string;
  environment: DeveloperEnvironment;
  idempotencyKey: string;
}

export interface DeveloperApplicationResponse {
  id: string;
  name: string;
  ownerBusinessKsNumber: string;
  environment: DeveloperEnvironment;
  status: DeveloperApplicationStatus;
  productionAccessState: 'NOT_REQUESTED' | 'PENDING_CERTIFICATION' | 'DISABLED' | string;
  createdAt: string;
}

export interface IssueSecureCodeRequest {
  buildType: string;
  moneyFlow: string;
  appLocation: string | null;
  aiTool: string | null;
}

export interface IssuedSecureCodeResponse {
  id: string;
  applicationId: string;
  secureCode: string;
  expiresAt: string;
}

export interface DeveloperIntegrationCheckResponse {
  applicationId: string;
  applicationName: string;
  businessKsNumber: string;
  environment: DeveloperEnvironment | string;
  applicationConnected: boolean;
  identityConnected: boolean;
  credentialsWorking: boolean;
  statusUpdatesConnected: boolean;
  callbacksConnected: boolean;
  readyToTestTrade: boolean;
  checkedAt: string;
}

export interface IssueApplicationCredentialRequest {
  scopes: DeveloperApiScope[];
  idempotencyKey: string;
}

export interface IssuedApplicationCredentialResponse {
  id: string;
  clientId: string;
  secret: string;
  scopes: string[];
  status: string;
}
