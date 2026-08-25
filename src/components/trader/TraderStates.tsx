import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Loader2, RefreshCw } from 'lucide-react';

interface StateProps {
  title: string;
  detail: string;
  onRetry?: () => void;
}

function CompactState({ icon, tone, eyebrow, title, detail, action, role }: {
  icon: ReactNode;
  tone: 'quiet' | 'waiting' | 'caution' | 'loading';
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
  role?: 'alert' | 'status';
}) {
  return <section className={`trader-compact-state trader-compact-state--${tone}`} role={role}>
    <span className="trader-compact-state-icon" aria-hidden="true">{icon}</span>
    <div className="min-w-0 flex-1"><p className="trader-compact-state-eyebrow">{eyebrow}</p><h2>{title}</h2>{detail && <p>{detail}</p>}</div>
    {action}
  </section>;
}

export function TraderLoadingState({ label = 'Updating your Market…' }: { label?: string }) {
  return <CompactState icon={<Loader2 size={17} className="animate-spin" />} tone="loading" eyebrow="Checking" title={label} role="status" />;
}
export function TraderEmptyState({ title, detail }: StateProps) {
  return <CompactState icon={<CheckCircle2 size={17} />} tone="quiet" eyebrow="All clear" title={title} detail={detail} />;
}
export function TraderErrorState({ title, detail, onRetry }: StateProps) {
  return <CompactState icon={<AlertTriangle size={17} />} tone="caution" eyebrow="Could not refresh" title={title} detail={detail} role="alert" action={onRetry ? <button type="button" onClick={onRetry} className="trader-compact-state-action"><RefreshCw size={14} /> Retry</button> : undefined} />;
}
export function TraderUnavailableState({ title, detail }: StateProps) {
  return <CompactState icon={<Clock3 size={17} />} tone="waiting" eyebrow="Not available" title={title} detail={detail} />;
}
