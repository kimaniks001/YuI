import { securePayFetch } from './securepayClient';
import type {
  DeveloperApplicationResponse,
  DeveloperIntegrationCheckResponse,
  IssueApplicationCredentialRequest,
  IssuedApplicationCredentialResponse,
  IssuedSecureCodeResponse,
  IssueSecureCodeRequest,
  RegisterDeveloperApplicationRequest,
} from './r12DeveloperTypes';

export function registerDeveloperApplication(accessToken: string, request: RegisterDeveloperApplicationRequest) {
  return securePayFetch<DeveloperApplicationResponse>('/api/v1/developer/applications', {
    method: 'POST',
    authHeader: accessToken,
    body: request,
  });
}

export function getDeveloperApplication(accessToken: string, applicationId: string) {
  return securePayFetch<DeveloperApplicationResponse>(`/api/v1/developer/applications/${applicationId}`, {
    authHeader: accessToken,
  });
}

export function getDeveloperIntegrationCheck(accessToken: string, applicationId: string) {
  return securePayFetch<DeveloperIntegrationCheckResponse>(
    `/api/v1/developer/applications/${applicationId}/integration-check`,
    { authHeader: accessToken },
  );
}

export function issueSecureCode(accessToken: string, applicationId: string, request: IssueSecureCodeRequest) {
  return securePayFetch<IssuedSecureCodeResponse>(
    `/api/v1/developer/applications/${applicationId}/secure-codes`,
    { method: 'POST', authHeader: accessToken, body: request },
  );
}

export function revokeSecureCode(accessToken: string, secureCodeId: string) {
  return securePayFetch<void>(`/api/v1/developer/applications/secure-codes/${secureCodeId}/revoke`, {
    method: 'POST',
    authHeader: accessToken,
  });
}

export function issueDeveloperCredential(
  accessToken: string,
  applicationId: string,
  request: IssueApplicationCredentialRequest,
) {
  return securePayFetch<IssuedApplicationCredentialResponse>(
    `/api/v1/developer/applications/${applicationId}/credentials`,
    { method: 'POST', authHeader: accessToken, body: request },
  );
}
