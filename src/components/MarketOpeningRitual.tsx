import { useCallback, useEffect, useState } from 'react';
import LivingSecurePayMark from './LivingSecurePayMark';

const SEEN_KEY = 'securepay.market.opening.seen.v1';

interface MarketOpeningRitualProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldShowOpening() {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SEEN_KEY) !== 'seen';
  } catch {
    // Visual memory is optional. If session storage is unavailable, showing
    // the welcome is safer than silently making the opening unreachable.
    return true;
  }
}

function rememberOpening() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, 'seen');
  } catch {
    // No identity, authentication or financial truth is stored here.
  }
}

/**
 * The Market opening is a signed-out orientation ritual only.
 *
 * Normal Home use shows it once per browser session. `forceOpen` exists only
 * for explicit replay on the visual-review surface. Neither path is evidence
 * of identity, agreement, payment, release, settlement, quorum or any other
 * backend-owned truth.
 */
export default function MarketOpeningRitual({
  forceOpen = false,
  onClose,
}: MarketOpeningRitualProps) {
  const [visible, setVisible] = useState(() => forceOpen || shouldShowOpening());
  const [mediaFailed, setMediaFailed] = useState(false);

  // An explicit Replay click is consent to view the motion, so the theme-lab
  // replay can play even when the device prefers reduced motion. Automatic
  // signed-out welcomes still respect the OS accessibility setting.
  const [staticWelcome] = useState(() => !forceOpen && prefersReducedMotion());

  const close = useCallback(() => {
    setVisible(false);
    if (!forceOpen) rememberOpening();
    onClose?.();
  }, [forceOpen, onClose]);

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
