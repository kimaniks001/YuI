import { securePayIsConfigured } from '../api/securepayAuth';

export type AuthPathKind = 'securepay_api' | 'unconfigured';

export interface AuthBoundaryMetadata {
  authoritativePath: AuthPathKind;
  securePayConfigured: boolean;
  legacySupabaseFallback: false;
  tokensInMemoryOnly: true;
  demoIdentityAllowed: false;
  sessionUnavailableMessage: string;
}

// SecurePayAPI is the only authentication source in the runtime auth path.
// There is no Supabase fallback — when SecurePay API is not configured,
// sign-in fails closed with a clear message rather than using Supabase.
export function getAuthBoundaryMetadata(): AuthBoundaryMetadata {
  const configured = securePayIsConfigured();

  return {
    authoritativePath: configured ? 'securepay_api' : 'unconfigured',
    securePayConfigured: configured,
    legacySupabaseFallback: false,
    tokensInMemoryOnly: true,
    demoIdentityAllowed: false,
    sessionUnavailableMessage: configured
      ? 'Sign in to continue.'
      : 'Sign-in is not configured in this environment.',
  };
}
