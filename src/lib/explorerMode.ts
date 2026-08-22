// Legacy Explorer compatibility flag.
//
// MW-01 makes route namespaces the primary world boundary: Market routes are
// real by default, while /trainer, /game, /explore, /play, /preview and
// /review are simulated. This flag is therefore opt-in rather than the app
// default and remains only for dedicated legacy review/training deployments.
export const SECUREPAY_EXPLORER_MODE =
  import.meta.env.VITE_SECUREPAY_EXPLORER_MODE === 'true';

export const SECUREPAY_EXPLORER_LABEL = 'SecurePay Trainer';

export const SECUREPAY_EXPLORER_MESSAGE =
  'Training and education mode. No authentication, live API calls or real-money actions are performed.';

export const SECUREPAY_EXPLORER_KSNUMBER = 'KS2145';

export function explorerHref(path: string) {
  return path;
}
