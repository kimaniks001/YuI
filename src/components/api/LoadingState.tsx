import SystemStateRoom from '../SystemStateRoom';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ message = 'SecurePay is bringing this room up to date.', className = '' }: LoadingStateProps) {
  return (
    <SystemStateRoom
      compact
      className={className}
      state="guiding"
      presence="polite"
      eyebrow="SecurePay is checking"
      title={message}
      means="This screen is waiting for the latest source record. Loading does not create or change an agreement or money state."
      next="Stay on this page for a moment. SecurePay will show the next safe action when the check completes."
      money="No money movement is created by loading this page."
    />
  );
}
