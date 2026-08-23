import { securePayFetch } from './securepayClient';
import type {
  CaptureDraftIntentRequest,
  DraftIntent,
  PromoteDraftIntentRequest,
  PromotedAgreement,
} from './bridgeTypes';

const base = '/api/v1/bridge/draft-intents';

export function captureDraftIntent(accessToken: string, request: CaptureDraftIntentRequest) {
  return securePayFetch<DraftIntent>(base, { method: 'POST', authHeader: accessToken, body: request });
}

export function getMyDraftIntents(accessToken: string) {
  return securePayFetch<DraftIntent[]>(`${base}/me`, { authHeader: accessToken });
}

export function getDraftIntent(accessToken: string, draftIntentId: string) {
  return securePayFetch<DraftIntent>(`${base}/${draftIntentId}`, { authHeader: accessToken });
}

export function discardDraftIntent(accessToken: string, draftIntentId: string) {
  return securePayFetch<DraftIntent>(`${base}/${draftIntentId}/discard`, { method: 'POST', authHeader: accessToken });
}

export function promoteDraftIntent(accessToken: string, draftIntentId: string, request: PromoteDraftIntentRequest) {
  return securePayFetch<PromotedAgreement>(`${base}/${draftIntentId}/promote`, {
    method: 'POST', authHeader: accessToken, body: request,
  });
}
