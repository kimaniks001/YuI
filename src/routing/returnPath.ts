const SAFE_EXACT_PATHS = new Set([
  '/',
  '/dashboard',
  '/profile',
  '/market',
  '/market/flows',
  '/market/statements',
  '/agreements',
  '/actions',
  '/money',
  '/community',
  '/referrals',
  '/settings',
  '/developers',
  '/create',
  '/create/journey',
]);

const SAFE_PREFIXES = [
  '/agreements/',
  '/securelink/join/',
  '/group/',
  '/ks/',
];

export function safeReturnPath(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw) return fallback;
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch { /* keep original */ }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('..') || decoded.includes('\\')) {
    return fallback;
  }
  const pathname = decoded.split('?')[0].split('#')[0];
  if (SAFE_EXACT_PATHS.has(pathname) || SAFE_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return decoded;
  }
  return fallback;
}

export function signInPath(returnTo: string): string {
  return `/signin?returnTo=${encodeURIComponent(safeReturnPath(returnTo))}`;
}
