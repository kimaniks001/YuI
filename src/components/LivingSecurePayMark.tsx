import {
  AlertTriangle,
  Ban,
  Check,
  CircleDot,
  Clock3,
  LoaderCircle,
  MessageCircleMore,
  RotateCcw,
  X,
  Zap,
} from 'lucide-react';

export type MarkState =
  | 'resting'
  | 'listening'
  | 'guiding'
  | 'checking'
  | 'active'
  | 'action'
  | 'success'
  | 'caution'
  | 'waiting'
  | 'review'
  | 'failure'
  | 'restricted'
  | 'recovering'
  | 'complete';

export type MarkSize = 'xs' | 'sm' | 'md' | 'lg';
export type MarkPresence = 'polite' | 'present' | 'commanding';
export type MarkSurface = 'auto' | 'light' | 'dark';

interface LivingSecurePayMarkProps {
  state?: MarkState;
  size?: MarkSize;
  presence?: MarkPresence;
  surface?: MarkSurface;
  label?: string;
  className?: string;
  decorative?: boolean;
}

const DEFAULT_LABEL: Record<MarkState, string> = {
  resting: 'SecurePay',
  listening: 'SecurePay is listening',
  guiding: 'SecurePay is guiding this step',
  checking: 'SecurePay is checking the latest truth',
  active: 'SecurePay is current',
  action: 'SecurePay needs an action',
  success: 'SecurePay confirmed this state',
  caution: 'SecurePay needs your attention',
  waiting: 'SecurePay is waiting',
  review: 'SecurePay is helping clarify this',
  failure: 'This SecurePay action could not complete',
  restricted: 'This SecurePay action is not available',
  recovering: 'SecurePay is recovering the current state',
  complete: 'SecurePay confirmed this is complete',
};

function Badge({ state }: { state: MarkState }) {
  if (state === 'success' || state === 'complete') return <Check size={11} strokeWidth={3} aria-hidden="true" />;
  if (state === 'caution') return <AlertTriangle size={11} strokeWidth={2.7} aria-hidden="true" />;
  if (state === 'waiting') return <Clock3 size={11} strokeWidth={2.5} aria-hidden="true" />;
  if (state === 'review') return <MessageCircleMore size={11} strokeWidth={2.5} aria-hidden="true" />;
  if (state === 'checking') return <LoaderCircle size={11} strokeWidth={2.6} aria-hidden="true" />;
  if (state === 'action') return <Zap size={11} strokeWidth={2.7} aria-hidden="true" />;
  if (state === 'active') return <CircleDot size={11} strokeWidth={2.7} aria-hidden="true" />;
  if (state === 'failure') return <X size={11} strokeWidth={3} aria-hidden="true" />;
  if (state === 'restricted') return <Ban size={11} strokeWidth={2.6} aria-hidden="true" />;
  if (state === 'recovering') return <RotateCcw size={11} strokeWidth={2.6} aria-hidden="true" />;
  return null;
}

export default function LivingSecurePayMark({
  state = 'resting',
  size = 'md',
  presence = 'polite',
  surface = 'auto',
  label,
  className = '',
  decorative = false,
}: LivingSecurePayMarkProps) {
  const hasBadge = [
    'success',
    'caution',
    'waiting',
    'review',
    'checking',
    'action',
    'active',
    'failure',
    'restricted',
    'recovering',
    'complete',
  ].includes(state);

  return (
    <span
      className={`sp-living-mark sp-living-mark--${state} sp-living-mark--${size} sp-living-mark--${presence} sp-living-mark--surface-${surface} ${className}`.trim()}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : (label ?? DEFAULT_LABEL[state])}
      data-state={state}
      data-surface={surface}
    >
      <span className="sp-living-mark__halo" aria-hidden="true" />
      <span className="sp-living-mark__orbit" aria-hidden="true"><i /></span>
      <img
        src="/assets/logos/securepay_icon_green.png"
        alt=""
        className="sp-living-mark__symbol"
        draggable={false}
      />
      {hasBadge && <span className="sp-living-mark__badge" aria-hidden="true"><Badge state={state} /></span>}
    </span>
  );
}
