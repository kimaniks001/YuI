export type SecurePayWorld = 'market' | 'trainer' | 'game';

const TRAINER_PREFIXES = ['/trainer', '/explore', '/preview', '/review'];
const GAME_PREFIXES = ['/game', '/play'];
const DRAFT_INTENT_KEY = 'securepay.marketDraftIntent.v1';

export interface MarketDraftIntent {
  version: 1;
  sourceWorld: 'trainer' | 'game';
  sourcePath: string;
  targetPath: string;
  createdAt: string;
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function safeInternalPath(path: string, fallback: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) return fallback;
  return trimmed;
}

export function getWorldFromPath(pathname: string): SecurePayWorld {
  if (TRAINER_PREFIXES.some(prefix => matchesPrefix(pathname, prefix))) return 'trainer';
  if (GAME_PREFIXES.some(prefix => matchesPrefix(pathname, prefix))) return 'game';
  return 'market';
}

export function getCurrentWorld(): SecurePayWorld {
  if (typeof window === 'undefined') return 'market';
  return getWorldFromPath(window.location.pathname);
}

export function isSimulatedWorldPath(pathname: string): boolean {
  return getWorldFromPath(pathname) !== 'market';
}

export function isSimulatedWorldRuntime(): boolean {
  return getCurrentWorld() !== 'market';
}

export function saveMarketDraftIntent(
  sourceWorld: 'trainer' | 'game',
  sourcePath: string,
  targetPath = '/create',
): MarketDraftIntent | null {
  if (typeof window === 'undefined') return null;
  const intent: MarketDraftIntent = {
    version: 1,
    sourceWorld,
    sourcePath: safeInternalPath(sourcePath, sourceWorld === 'trainer' ? '/trainer' : '/game'),
    targetPath: safeInternalPath(targetPath, '/create'),
    createdAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(DRAFT_INTENT_KEY, JSON.stringify(intent));
  return intent;
}

export function readMarketDraftIntent(): MarketDraftIntent | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(DRAFT_INTENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MarketDraftIntent>;
    if (
      parsed.version !== 1 ||
      (parsed.sourceWorld !== 'trainer' && parsed.sourceWorld !== 'game') ||
      typeof parsed.sourcePath !== 'string' ||
      typeof parsed.targetPath !== 'string' ||
      typeof parsed.createdAt !== 'string'
    ) {
      window.sessionStorage.removeItem(DRAFT_INTENT_KEY);
      return null;
    }
    return {
      version: 1,
      sourceWorld: parsed.sourceWorld,
      sourcePath: safeInternalPath(parsed.sourcePath, '/trainer'),
      targetPath: safeInternalPath(parsed.targetPath, '/create'),
      createdAt: parsed.createdAt,
    };
  } catch {
    window.sessionStorage.removeItem(DRAFT_INTENT_KEY);
    return null;
  }
}

export function clearMarketDraftIntent(): void {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(DRAFT_INTENT_KEY);
}

export function marketSignInHref(targetPath = '/create'): string {
  const safeTarget = safeInternalPath(targetPath, '/create');
  return `/signin?returnTo=${encodeURIComponent(safeTarget)}`;
}
