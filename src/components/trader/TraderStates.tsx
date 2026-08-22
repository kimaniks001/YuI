import { RefreshCw } from 'lucide-react';
import SystemStateRoom from '../SystemStateRoom';

interface StateProps {
  title: string;
  detail: string;
  onRetry?: () => void;
}

export function TraderLoadingState({ label = 'Bringing your Market up to date…' }: { label?: string }) {
  return <SystemStateRoom compact state="guiding" presence="polite" eyebrow="SecurePay is checking" title={label} means="SecurePay is retrieving the latest trader records. This loading state does not change any agreement." next="Stay here for a moment while the room catches up." money="No money movement is created by loading your Market." />;
}

export function TraderEmptyState({ title, detail }: StateProps) {
  return <SystemStateRoom compact state="resting" presence="polite" eyebrow="A quiet Market is okay" title={title} means={detail} next="Start or return to an agreement when you have something to do. SecurePay will not invent activity to fill this room." money="An empty room is not a balance or payment state." />;
}

export function TraderErrorState({ title, detail, onRetry }: StateProps) {
  return <SystemStateRoom compact role="alert" state="caution" presence="present" eyebrow="SecurePay could not refresh this room" title={title} happened={detail} means="The screen has stopped rather than guessing what changed." next={onRetry ? 'Retry the read. If it still fails, keep the last confirmed state.' : 'Return to a known Market room or try again later.'} money="A failed read does not confirm a payment, release or settlement." action={onRetry ? <button type="button" onClick={onRetry} className="b10-primary"><RefreshCw size={14} /> Try again</button> : undefined} />;
}

export function TraderUnavailableState({ title, detail }: StateProps) {
  return <SystemStateRoom compact state="waiting" presence="polite" eyebrow="This room is not available right now" title={title} happened={detail} means="Unavailable is a system state, not a judgement about the agreement." next="Use the parts of your Market that remain available or return later." money="This presentation does not change recorded money state." />;
}
