import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const MARKET_THEME_IDS = ['market-day', 'green-market', 'town-market', 'evening-market'] as const;
export type MarketThemeId = typeof MARKET_THEME_IDS[number];

export interface MarketThemeDefinition {
  id: MarketThemeId;
  name: string;
  shortName: string;
  description: string;
  atmosphere: string;
}

export const MARKET_THEMES: readonly MarketThemeDefinition[] = [
  { id: 'market-day', name: 'Market Day', shortName: 'Day', description: 'The default SecurePay Market: warm cream, daylight and restrained green movement.', atmosphere: 'Open · familiar · calm' },
  { id: 'green-market', name: 'Green Market', shortName: 'Green', description: 'A fresher, leafy Market atmosphere for community, growth and everyday trade.', atmosphere: 'Fresh · growing · connected' },
  { id: 'town-market', name: 'Town Market', shortName: 'Town', description: 'Warm stone and clay edges around the same SecurePay truth and interaction hierarchy.', atmosphere: 'Grounded · practical · busy' },
  { id: 'evening-market', name: 'Evening Market', shortName: 'Evening', description: 'A quieter deep-green edge treatment for late trade without changing status meaning.', atmosphere: 'Quiet · focused · assured' },
] as const;

const STORAGE_KEY = 'securepay.market.theme.v1';

interface MarketAtmosphereContextValue {
  theme: MarketThemeId;
  setTheme: (theme: MarketThemeId) => void;
  themes: readonly MarketThemeDefinition[];
}

const MarketAtmosphereContext = createContext<MarketAtmosphereContextValue | null>(null);

function isMarketTheme(value: string | null): value is MarketThemeId {
  return Boolean(value && MARKET_THEME_IDS.includes(value as MarketThemeId));
}

function readStoredTheme(): MarketThemeId {
  if (typeof window === 'undefined') return 'market-day';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isMarketTheme(stored) ? stored : 'market-day';
  } catch {
    return 'market-day';
  }
}

export function MarketAtmosphereProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<MarketThemeId>(readStoredTheme);

  const setTheme = useCallback((nextTheme: MarketThemeId) => {
    setThemeState(nextTheme);
    try { window.localStorage.setItem(STORAGE_KEY, nextTheme); } catch { /* visual preference remains in-memory */ }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.spMarketTheme = theme;
    return () => { delete document.documentElement.dataset.spMarketTheme; };
  }, [theme]);

  const value = useMemo<MarketAtmosphereContextValue>(() => ({ theme, setTheme, themes: MARKET_THEMES }), [theme, setTheme]);
  return <MarketAtmosphereContext.Provider value={value}>{children}</MarketAtmosphereContext.Provider>;
}

export function useMarketAtmosphere() {
  const value = useContext(MarketAtmosphereContext);
  if (!value) throw new Error('useMarketAtmosphere must be used inside MarketAtmosphereProvider');
  return value;
}

export function MarketAtmosphereBackdrop() {
  const brandIcon = `${import.meta.env.BASE_URL}assets/brand/securepay_icon_green.png`;

  return (
    <>
      <div className="sp-market-atmosphere" aria-hidden="true">
        <span className="sp-market-atmosphere__wash sp-market-atmosphere__wash--one" />
        <span className="sp-market-atmosphere__wash sp-market-atmosphere__wash--two" />
        <span className="sp-market-atmosphere__trail sp-market-atmosphere__trail--one" />
        <span className="sp-market-atmosphere__trail sp-market-atmosphere__trail--two" />
      </div>

      {/*
        Quiet Market continuity layer.
        The official SecurePay symbol remains unchanged and acts as a faint
        background light/watermark. No beadwork or bracelet motif is rendered.
      */}
      <div className="sp-market-heritage" aria-hidden="true">
        <img className="sp-market-heritage__mark sp-market-heritage__mark--east" src={brandIcon} alt="" />
        <img className="sp-market-heritage__mark sp-market-heritage__mark--southwest" src={brandIcon} alt="" />
      </div>
    </>
  );
}
