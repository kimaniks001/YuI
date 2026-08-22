export const SECUREPAY_EXPLORER_MODE =
  import.meta.env.VITE_SECUREPAY_EXPLORER_MODE !== 'false';

export const SECUREPAY_EXPLORER_LABEL = 'YUI v1 Explorer';

export const SECUREPAY_EXPLORER_MESSAGE =
  'Training and education mode. No authentication, live API calls or real-money actions are performed.';

export const SECUREPAY_EXPLORER_KSNUMBER = 'KS2145';

export function explorerHref(path: string) {
  return path;
}
