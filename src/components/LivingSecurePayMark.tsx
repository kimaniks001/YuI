import { AlertTriangle, Check, Clock3, MessageCircleMore } from 'lucide-react';

type MarkState = 'resting' | 'listening' | 'guiding' | 'success' | 'caution' | 'waiting' | 'review' | 'complete';
type MarkSize = 'xs' | 'sm' | 'md' | 'lg';
type MarkPresence = 'polite' | 'present' | 'commanding';

interface LivingSecurePayMarkProps {
  state?: MarkState;
  size?: MarkSize;
  presence?: MarkPresence;
  label?: string;
  className?: string;
  decorative?: boolean;
}

const DEFAULT_LABEL: Record<MarkState, string> = {
  resting: 'SecurePay',
  listening: 'SecurePay is listening',
  guiding: 'SecurePay is guiding this step',
  success: 'SecurePay confirmed',
  caution: 'SecurePay needs your attention',
  waiting: 'SecurePay is waiting',
  review: 'SecurePay is helping clarify this',
  complete: 'SecurePay completed',
};

function Badge({ state }: { state: MarkState }) {
  if (state === 'success' || state === 'complete') return <Check size={11} strokeWidth={3} aria-hidden="true" />;
  if (state === 'caution') return <AlertTriangle size={11} strokeWidth={2.7} aria-hidden="true" />;
  if (state === 'waiting') return <Clock3 size={11} strokeWidth={2.5} aria-hidden="true" />;
  if (state === 'review') return <MessageCircleMore size={11} strokeWidth={2.5} aria-hidden="true" />;
  return null;
}

export default function LivingSecurePayMark({
  state = 'resting',
  size = 'md',
  presence = 'polite',
  label,
  className = '',
  decorative = false,
}: LivingSecurePayMarkProps) {
  const hasBadge = ['success', 'caution', 'waiting', 'review', 'complete'].includes(state);
  return (
    <span
      className={`sp-living-mark sp-living-mark--${state} sp-living-mark--${size} sp-living-mark--${presence} ${className}`.trim()}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : (label ?? DEFAULT_LABEL[state])}
      data-state={state}
    >
      <span className="sp-living-mark__halo" aria-hidden="true" />
      <span className="sp-living-mark__orbit" aria-hidden="true"><i /></span>
      <img src="/assets/logos/securepay_icon_green.png" alt="" className="sp-living-mark__symbol" draggable={false} />
      {hasBadge && <span className="sp-living-mark__badge" aria-hidden="true"><Badge state={state} /></span>}
    </span>
  );
}
