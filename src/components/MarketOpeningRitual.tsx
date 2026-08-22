import { useCallback, useEffect, useState } from 'react';
import LivingSecurePayMark from './LivingSecurePayMark';

const SEEN_KEY = 'securepay.market.handshake.seen.v2';
const LAST_SHOWN_KEY = 'securepay.market.handshake.lastShown.v2';
const LONG_RETURN_INTERVAL_MS = 45 * 24 * 60 * 60 * 1000;

interface MarketOpeningRitualProps {
  forceOpen?: boolean;
  authenticatedEntry?: boolean;
  traderKey?: string | null;
  onClose?: () => void;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function preferenceKey(base: string, traderKey?: string | null) {
  const safeTraderKey = traderKey?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  return safeTraderKey ? `${base}.${safeTraderKey}` : base;
}

function shouldWelcomeAuthenticatedTrader(traderKey?: string | null) {
  if (typeof window === 'undefined') return false;
  try {
    const seen = window.localStorage.getItem(preferenceKey(SEEN_KEY, traderKey)) === 'seen';
    if (!seen) return true;

    const lastShown = Number(window.localStorage.getItem(preferenceKey(LAST_SHOWN_KEY, traderKey)));
    return Number.isFinite(lastShown)
      && lastShown > 0
      && Date.now() - lastShown >= LONG_RETURN_INTERVAL_MS;
  } catch {
    // If a browser blocks visual-preference storage, a successful login may
    // still receive the welcome. No auth or financial data is stored here.
    return true;
  }
}

function rememberWelcome(traderKey?: string | null) {
  try {
    window.localStorage.setItem(preferenceKey(SEEN_KEY, traderKey), 'seen');
    window.localStorage.setItem(preferenceKey(LAST_SHOWN_KEY, traderKey), String(Date.now()));
  } catch {
    // Visual memory is optional; authentication state is never persisted here.
  }
}

/**
 * The Market handshake is an orientation ritual only.
 *
 * Normal product use:
 *   authenticatedEntry -> first successful signed-in Market entry on this
 *   device for that KS identity, then only on a long return (45+ days).
 *
 * `forceOpen` exists for an explicit replay/special Market welcome. It must
 * never be used as evidence of payment, release, settlement, quorum or any
 * other financial/agreement truth.
 */
export default function MarketOpeningRitual({
  forceOpen = false,
  authenticatedEntry = false,
  traderKey = null,
  onClose,
}: MarketOpeningRitualProps) {
  const [visible, setVisible] = useState(() => (
    forceOpen || (authenticatedEntry && shouldWelcomeAuthenticatedTrader(traderKey))
  ));
  const [mediaFailed, setMediaFailed] = useState(false);
  // An explicit Replay click is itself consent to view the motion, so the
  // theme-lab replay plays the film even when the device prefers reduced motion.
  // Automatic first-login welcomes still respect the OS accessibility setting.
  const [staticWelcome] = useState(() => !forceOpen && prefersReducedMotion());

  const close = useCallback(() => {
    setVisible(false);
    if (!forceOpen && authenticatedEntry) rememberWelcome(traderKey);
    onClose?.();
  }, [authenticatedEntry, forceOpen, onClose, traderKey]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, visible]);

  if (!visible) return null;

  return (
    <div
      className="sp-opening-ritual sp-opening-ritual--video"
      role="dialog"
      aria-label="Welcome to your SecurePay Market"
      aria-modal="true"
    >
      <button type="button" className="sp-opening-ritual__skip" onClick={close}>
        Skip
      </button>

      <div className="sp-opening-ritual__video-shell">
        {mediaFailed || staticWelcome ? (
          <div className="sp-opening-ritual__fallback" role="status">
            <LivingSecurePayMark state="guiding" size="lg" presence="present" decorative />
            <strong>Welcome to your Market.</strong>
            <span>Money should follow the agreement.</span>
          </div>
        ) : (
          <video
            className="sp-opening-ritual__video"
            src={`${import.meta.env.BASE_URL}assets/brand/securepay_market_handshake.mp4`}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={close}
            onError={() => setMediaFailed(true)}
          />
        )}
      </div>

      <p className="sp-opening-ritual__hint">Welcome to your Market.</p>
    </div>
  );
}
