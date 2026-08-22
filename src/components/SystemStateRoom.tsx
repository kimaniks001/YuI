import type { ReactNode } from 'react';
import LivingSecurePayMark from './LivingSecurePayMark';

type MarkState = 'resting' | 'listening' | 'guiding' | 'success' | 'caution' | 'waiting' | 'review' | 'complete';
type Presence = 'polite' | 'present' | 'commanding';

interface SystemStateRoomProps {
  state?: MarkState;
  presence?: Presence;
  eyebrow?: string;
  title: string;
  happened?: string;
  means: string;
  next?: string;
  money?: string;
  action?: ReactNode;
  role?: 'status' | 'alert';
  compact?: boolean;
  className?: string;
}

export default function SystemStateRoom({
  state = 'guiding',
  presence = 'present',
  eyebrow = 'SecurePay status',
  title,
  happened,
  means,
  next,
  money,
  action,
  role = 'status',
  compact = false,
  className = '',
}: SystemStateRoomProps) {
  return (
    <section
      className={`b10-system-state ${compact ? 'b10-system-state--compact' : ''} b10-system-state--${state} ${className}`.trim()}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      <div className="b10-system-state__mark">
        <LivingSecurePayMark state={state} size={compact ? 'sm' : 'md'} presence={presence} label={eyebrow} />
      </div>
      <div className="b10-system-state__body">
        <p className="b10-system-state__eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <div className="b10-system-state__facts">
          {happened && <p><strong>What happened</strong><span>{happened}</span></p>}
          <p><strong>What it means</strong><span>{means}</span></p>
          {next && <p><strong>What you can do next</strong><span>{next}</span></p>}
          {money && <p className="b10-system-state__money"><strong>Money</strong><span>{money}</span></p>}
        </div>
        {action && <div className="b10-system-state__action">{action}</div>}
      </div>
    </section>
  );
}
