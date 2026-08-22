import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import SystemStateRoom from '../components/SystemStateRoom';

type StateId =
  | 'loading' | 'empty' | 'offline' | 'retry' | 'forbidden' | 'session'
  | 'invite-expired' | 'not-found' | 'server' | 'rail' | 'identity'
  | 'evidence' | 'participant' | 'activity' | 'statements' | 'maintenance';

type StateConfig = {
  id: StateId;
  label: string;
  state: 'resting' | 'guiding' | 'success' | 'caution' | 'waiting' | 'review';
  presence: 'polite' | 'present' | 'commanding';
  eyebrow: string;
  title: string;
  happened?: string;
  means: string;
  next?: string;
  money: string;
  action?: string;
};

const STATES: StateConfig[] = [
  {
    id: 'loading', label: 'Loading', state: 'guiding', presence: 'polite', eyebrow: 'SecurePay is checking',
    title: 'We are bringing this room up to date.',
    happened: 'SecurePay is retrieving the latest records for this view.',
    means: 'The screen is waiting for source truth. A loading animation does not create or change an agreement state.',
    next: 'Stay on this page for a moment. If the check takes too long, SecurePay will offer a safe retry.',
    money: 'No money movement is created by loading this page.',
  },
  {
    id: 'empty', label: 'Nothing here yet', state: 'resting', presence: 'polite', eyebrow: 'A quiet Market is still a valid state',
    title: 'There is nothing to show here yet.',
    happened: 'No records match this room right now.',
    means: 'Nothing is broken. SecurePay should not manufacture sample activity to fill the space.',
    next: 'Start a new agreement when you have something to trade, or return to your Market.',
    money: 'No money state is implied by an empty room.', action: 'Start an agreement',
  },
  {
    id: 'offline', label: 'Offline', state: 'caution', presence: 'present', eyebrow: 'Your connection is offline',
    title: 'SecurePay cannot refresh this room right now.',
    happened: 'This device appears to have lost its network connection.',
    means: 'The last information on screen may no longer be current. SecurePay must not pretend it has checked the backend.',
    next: 'Reconnect, then refresh before making an important agreement or money decision.',
    money: 'No new payment, release or settlement truth can be confirmed while this screen is offline.', action: 'Try again',
  },
  {
    id: 'retry', label: 'Retry', state: 'caution', presence: 'present', eyebrow: 'SecurePay could not complete the check',
    title: 'This request did not complete.',
    happened: 'The latest read failed before SecurePay could return a usable result.',
    means: 'Nothing should be shown as changed unless a later backend read confirms it.',
    next: 'Retry the check. If the result is still unclear, leave the current state unchanged and explain that clearly.',
    money: 'A failed read is never evidence that money moved.', action: 'Retry safely',
  },
  {
    id: 'forbidden', label: 'Not allowed', state: 'caution', presence: 'commanding', eyebrow: 'This action is not available to this identity',
    title: 'Your KSNumber does not have authority for this step.',
    happened: 'SecurePay rejected access to this action for the current authenticated identity or role.',
    means: 'This is an authority boundary, not a technical inconvenience to work around in the browser.',
    next: 'Return to the agreement and check who is expected to act, or sign in with the correct identity.',
    money: 'No money authority is granted by the interface when backend authorization says no.',
  },
  {
    id: 'session', label: 'Session expired', state: 'caution', presence: 'present', eyebrow: 'Please identify yourself again',
    title: 'Your SecurePay session has ended.',
    happened: 'The sign-in session expired before this action could continue.',
    means: 'SecurePay needs to confirm who is acting before showing private records or accepting protected instructions.',
    next: 'Sign in again. Your saved intention or safe return path should be preserved where possible.',
    money: 'Session expiry does not itself change an agreement or money state.', action: 'Sign in again',
  },
  {
    id: 'invite-expired', label: 'Invite expired', state: 'caution', presence: 'commanding', eyebrow: 'This invitation is no longer active',
    title: 'The joining window has ended.',
    happened: 'The invitation reached its backend-recorded expiry time.',
    means: 'The person can no longer join through this invitation. Expiry does not automatically cancel the underlying agreement.',
    next: 'Ask the agreement organizer or creator for the next valid step if one is available.',
    money: 'An expired invitation does not confirm funding, release or settlement.',
  },
  {
    id: 'not-found', label: 'Not found', state: 'caution', presence: 'present', eyebrow: 'SecurePay could not find this room',
    title: 'This page or record is not available at this address.',
    happened: 'The address does not resolve to a current SecurePay page or visible record.',
    means: 'It may have moved, expired, been removed, or simply never existed.',
    next: 'Return to the Market, Help, or the agreement list and continue from a known place.',
    money: 'A missing page says nothing about whether money moved.',
  },
  {
    id: 'server', label: 'Service problem', state: 'caution', presence: 'commanding', eyebrow: 'SecurePay is having trouble reaching this service',
    title: 'This room cannot be completed safely right now.',
    happened: 'A SecurePay service returned an unexpected failure.',
    means: 'The interface should stop rather than guess. Existing records remain the source of truth until a successful read says otherwise.',
    next: 'Try again later or return to your Market. If a payment was already attempted, check its recorded status before retrying.',
    money: 'Unknown is not failed, confirmed, Payment Ready or settled.', action: 'Check again',
  },
  {
    id: 'rail', label: 'Rail unavailable', state: 'caution', presence: 'present', eyebrow: 'This payment method is not available',
    title: 'SecurePay cannot offer this rail for this payment right now.',
    happened: 'The backend has not marked this rail eligible for the current payment context.',
    means: 'The UI must not re-enable it locally or imply that another rail has already been chosen.',
    next: 'Choose another backend-eligible payment method, or return later if the agreement allows it.',
    money: 'No payment is confirmed merely because a rail option was displayed.',
  },
  {
    id: 'identity', label: 'Identity incomplete', state: 'guiding', presence: 'present', eyebrow: 'SecurePay needs one identity step',
    title: 'Your KS identity is not ready for this action yet.',
    happened: 'A required identity or activation step is incomplete.',
    means: 'SecurePay knows who is trying to act, but the current backend rules require another identity step before continuing.',
    next: 'Complete only the missing identity step, then return to this action.',
    money: 'Identity readiness is separate from funding or settlement readiness.', action: 'Continue identity setup',
  },
  {
    id: 'evidence', label: 'Evidence missing', state: 'review', presence: 'present', eyebrow: 'This agreement needs clearer evidence',
    title: 'A required proof record has not been added yet.',
    happened: 'The agreement state shows that evidence expected for this step is still missing.',
    means: 'SecurePay is not deciding whether the work happened; it is showing that the agreed evidence record is incomplete.',
    next: 'Add the requested record, or clarify the agreement if the evidence requirement is wrong.',
    money: 'Missing evidence does not by itself authorize release or settlement.', action: 'Add evidence',
  },
  {
    id: 'participant', label: 'Waiting on someone', state: 'waiting', presence: 'polite', eyebrow: 'Another participant has the next step',
    title: 'Nothing is required from you right now.',
    happened: 'Your part of the current step is complete and the agreement is waiting on another participant.',
    means: 'Waiting is a normal state. SecurePay should make the owner of the next action clear without creating pressure where none is needed.',
    next: 'Continue with your day. SecurePay will surface a new action when one is recorded for you.',
    money: 'Waiting does not automatically mean funds are held, released or delayed.',
  },
  {
    id: 'activity', label: 'No activity', state: 'resting', presence: 'polite', eyebrow: 'No recent Market activity',
    title: 'Your activity record is quiet.',
    happened: 'No recent events are available for this activity view.',
    means: 'The absence of events is not an error and should not be filled with artificial history.',
    next: 'Return to My Market or start a new agreement when you are ready.',
    money: 'No activity entry is not a money status.',
  },
  {
    id: 'statements', label: 'No statements', state: 'resting', presence: 'polite', eyebrow: 'No posted records in this statement period',
    title: 'There are no statement entries to show.',
    happened: 'SecurePay has no posted records for the selected KS identity and period.',
    means: 'A blank statement must not be turned into an invented balance or reconstructed browser ledger.',
    next: 'Change the period or identity if you expected a record, or return to Money & settlement.',
    money: 'No statement entries does not mean a zero wallet balance.',
  },
  {
    id: 'maintenance', label: 'Maintenance', state: 'guiding', presence: 'present', eyebrow: 'This room is temporarily unavailable',
    title: 'SecurePay is maintaining this part of the Market.',
    happened: 'The service has been deliberately taken out of use for maintenance.',
    means: 'The interface should tell traders what is unavailable without implying that agreements or money disappeared.',
    next: 'Use the unaffected parts of SecurePay or return when this room is available again.',
    money: 'Maintenance presentation does not change recorded financial state.',
  },
];

export default function PreviewSystemStates() {
  const [selected, setSelected] = useState<StateId>('loading');
  const current = STATES.find(item => item.id === selected) ?? STATES[0];

  return (
    <main className="b10-page b10-system-preview sp-responsive-guard">
      <header className="b10-hero">
        <div>
          <p className="b10-kicker">Batch 10 · V15 System & failure states</p>
          <h1>No dead ends. No invented certainty.</h1>
          <p>Every unusual state should explain what happened, what it means, what the trader can do next, and whether money was affected. SecurePay stays calm, but it becomes commanding when the trader must stop or verify something.</p>
        </div>
        <LivingSecurePayMark state="guiding" size="lg" presence="present" label="SecurePay is guiding this system state" />
      </header>

      <section className="b10-room">
        <div className="b10-state-selector" aria-label="System state examples">
          {STATES.map(item => (
            <button key={item.id} type="button" className={selected === item.id ? 'is-active' : ''} onClick={() => setSelected(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        <SystemStateRoom
          state={current.state}
          presence={current.presence}
          eyebrow={current.eyebrow}
          title={current.title}
          happened={current.happened}
          means={current.means}
          next={current.next}
          money={current.money}
          role={['offline', 'retry', 'forbidden', 'server'].includes(current.id) ? 'alert' : 'status'}
          action={current.action ? <button type="button" className="b10-primary">{current.action} {current.action.toLowerCase().includes('retry') || current.action.toLowerCase().includes('again') ? <RefreshCw size={14} /> : <ArrowRight size={14} />}</button> : undefined}
        />

        <div className="b10-system-law">
          <LivingSecurePayMark state="resting" size="xs" presence="polite" decorative />
          <p><strong>System-state law:</strong> reassurance must never upgrade financial truth. “We are checking” is not “failed”; “confirmed” is not “Payment Ready”; “release requested” is not “settled”.</p>
        </div>
      </section>
    </main>
  );
}
