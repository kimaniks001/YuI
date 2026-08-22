import { RefreshCw } from 'lucide-react';
import SystemStateRoom from '../SystemStateRoom';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({ message = 'SecurePay could not complete this check.', onRetry, className = '' }: ErrorStateProps) {
  return (
    <SystemStateRoom
      compact
      className={className}
      role="alert"
      state="caution"
      presence="present"
      eyebrow="This room needs another check"
      title="SecurePay could not load this safely."
      happened={message}
      means="The interface should stop rather than guess. Existing backend records remain the source of truth."
      next={onRetry ? 'Try the check again. If it still fails, leave the current state unchanged.' : 'Return to a known Market room or try again later.'}
      money="A failed screen read is never evidence that money moved."
      action={onRetry ? <button type="button" onClick={onRetry} className="b10-primary"><RefreshCw size={14} /> Try again</button> : undefined}
    />
  );
}
