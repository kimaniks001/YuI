import { securePayFetch } from './securepayClient';
import type {
  CircleProfileResponse,
  RedeemReferralCodeResponse,
  ReferralCodeResponse,
  ReferralHistoryResponse,
  TraderSettingsResponse,
  UpdateTraderSettingsRequest,
} from './r11TraderTypes';

export function getMyReferralCode(accessToken: string) {
  return securePayFetch<ReferralCodeResponse>('/api/v1/referrals/me/code', { authHeader: accessToken });
}

export function getMyReferralHistory(accessToken: string) {
  return securePayFetch<ReferralHistoryResponse>('/api/v1/referrals/me/history', { authHeader: accessToken });
}

export function redeemReferralCode(accessToken: string, code: string) {
  return securePayFetch<RedeemReferralCodeResponse>('/api/v1/referrals/redeem', {
    method: 'POST',
    authHeader: accessToken,
    body: { code: code.trim() },
  });
}

export function getMyCircle(accessToken: string) {
  return securePayFetch<CircleProfileResponse>('/api/v1/circle/me', { authHeader: accessToken });
}

export function getMyTraderSettings(accessToken: string) {
  return securePayFetch<TraderSettingsResponse>('/api/v1/settings/me', { authHeader: accessToken });
}

export function updateMyTraderSettings(accessToken: string, request: UpdateTraderSettingsRequest) {
  return securePayFetch<TraderSettingsResponse>('/api/v1/settings/me', {
    method: 'PUT',
    authHeader: accessToken,
    body: request,
  });
}
