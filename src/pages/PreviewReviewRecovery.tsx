import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock3,
  FileText,
  MessageCircle,
  RefreshCw,
  Scale,
  Upload,
  UsersRound,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

type ReviewState = 'raised' | 'waiting' | 'evidence' | 'reviewing' | 'decision' | 'resolved' | 'expired';
type RecoveryState = 'failed' | 'action' | 'held' | 'compensated';

const reviewStates: Array<{ id: ReviewState; label: string }> = [
  { id: 'raised', label: 'Issue raised' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'reviewing', label: 'Under review' },
  { id: 'decision', label: 'Decision pending' },
  { id: 'resolved', label: 'Concluded' },
  { id: 'expired', label: 'Expired' },
];

const recoveryStates: Array<{ id: RecoveryState; label: string }> = [
  { id: 'failed', label: 'Payment failed' },
  { id: 'action', label: 'Action required' },
  { id: 'held', label: 'Settlement needs attention' },
  { id: 'compensated', label: 'Adjusted' },
];

const reviewCopy: Record<ReviewState, {
  mark: 'review' | 'waiting' | 'guiding' | 'caution' | 'success';
  presence: 'polite' | 'present' | 'commanding';
  eyebrow: string;
  title: string;
  happened: string;
  means: string;
  next: string;
  action?: string;
  deadline?: string;
}> = {
  raised: {
    mark: 'review', presence: 'present', eyebrow: 'Agreement Review opened',
    title: 'A question about the preparation work is now on record.',
    happened: 'James asked SecurePay to record a concern about whether the preparation work matches the agreement.',
    means: 'The agreement is still the agreement. SecurePay is coordinating the review process; it has not decided who is right.',
    next: 'The other participant can acknowledge the review, respond and add relevant evidence.',
    action: 'See what was raised', deadline: 'Response window: 48 hours',
  },
  waiting: {
    mark: 'waiting', presence: 'polite', eyebrow: 'Waiting for another participant',
    title: 'Nothing is required from you right now.',
    happened: 'You acknowledged the review and submitted your response.',
    means: 'SecurePay is waiting for the other participant or the next backend-recorded review event. Waiting is not a negative outcome.',
    next: 'You can continue with your day. SecurePay will surface the next action when one exists.',
    deadline: 'Response due: 22 Aug · 2:00 PM',
  },
  evidence: {
    mark: 'guiding', presence: 'present', eyebrow: 'Evidence collection',
    title: 'The review needs clearer records before it can move forward.',
    happened: 'The review record shows that additional supporting information is needed.',
    means: 'Photos, receipts, delivery records, messages or agreement records can help clarify what happened. Evidence does not automatically prove either side.',
    next: 'Add only records that are relevant to this agreement and this specific question.',
    action: 'Add evidence', deadline: 'Evidence due: 23 Aug · 4:00 PM',
  },
  reviewing: {
    mark: 'review', presence: 'present', eyebrow: 'Under review',
    title: 'The record is being considered.',
    happened: 'Responses and evidence have been recorded for this review.',
    means: 'SecurePay keeps the process and record together. It does not present the review room as a court or promise an outcome.',
    next: 'No new action is currently shown for you. If more information is needed, SecurePay will make that explicit.',
  },
  decision: {
    mark: 'caution', presence: 'present', eyebrow: 'Decision pending',
    title: 'A formal review step is still outstanding.',
    happened: 'The review has reached a state where the next formal decision has not yet been recorded.',
    means: 'This is an important state, but it is not yet a verdict, release instruction, Payment Ready state or settlement.',
    next: 'Wait for the backend-recorded outcome. Do not act on visual colour alone.',
  },
  resolved: {
    mark: 'success', presence: 'present', eyebrow: 'Review concluded',
    title: 'This review is finished and its outcome is now part of the agreement record.',
    happened: 'The review concluded with a recorded outcome.',
    means: 'The outcome applies to this review process only. Any money movement still follows the agreement and the separate payment/release state.',
    next: 'Return to the Agreement Workspace to see what action, if any, is now available.',
    action: 'Return to agreement',
  },
  expired: {
    mark: 'caution', presence: 'commanding', eyebrow: 'Review expired',
    title: 'This review window ended without the required step being completed.',
    happened: 'The backend-recorded review state reached expiry.',
    means: 'SecurePay should explain the consequence without pretending that expiry automatically decides the underlying disagreement.',
    next: 'Return to the agreement and follow the next action SecurePay makes available.',
    action: 'See agreement status',
  },
};

const recoveryCopy: Record<RecoveryState, {
  mark: 'caution' | 'waiting' | 'review' | 'success';
  title: string;
  happened: string;
  means: string;
  next: string;
  action?: string;
}> = {
  failed: {
    mark: 'caution', title: 'The payment attempt did not complete.',
    happened: 'The latest payment attempt is recorded as failed.',
    means: 'This attempt did not confirm the agreement payment. It should never be shown as money received or as Payment Ready.',
    next: 'If the backend says retry is eligible, start a new agreement-bound payment attempt.',
    action: 'Try payment again',
  },
  action: {
    mark: 'caution', title: 'The provider needs something from you.',
    happened: 'The payment attempt is recorded as action required.',
    means: 'SecurePay is waiting for a provider/customer step. The payment is not confirmed yet.',
    next: 'Follow the exact provider instruction shown for this attempt. If the state changes, SecurePay will update the room.',
    action: 'See required action',
  },
  held: {
    mark: 'review', title: 'Settlement needs attention before it can continue.',
    happened: 'A release instruction encountered a backend-recorded held exception.',
    means: 'The agreement payment may already be confirmed, but settlement has not completed. SecurePay should show the customer-safe reason and required action, not invent a cause.',
    next: 'SecurePay Operations handles the recorded exception process. The trader should only be asked to act when the backend exposes a user action.',
  },
  compensated: {
    mark: 'success', title: 'SecurePay recorded an adjustment to the interrupted settlement.',
    happened: 'A compensating action is now recorded against the settlement exception.',
    means: 'Compensated is not the same word as settled. The exact final money state still comes from the settlement projection.',
    next: 'Check the agreement money room for the current settlement status and records.',
    action: 'Open money status',
  },
};

const evidence = [
  { type: 'Photo', name: 'wall-preparation.jpg', owner: 'Submitted by James', time: 'Today · 10:24 AM' },
  { type: 'Communication', name: 'site-message.pdf', owner: 'Submitted by another participant', time: 'Today · 11:06 AM' },
  { type: 'Agreement record', name: 'Preparation milestone', owner: 'SecurePay record', time: 'Agreement version 3' },
];

export default function PreviewReviewRecovery() {
  const [reviewState, setReviewState] = useState<ReviewState>('raised');
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('failed');
  const copy = reviewCopy[reviewState];
  const recovery = recoveryCopy[recoveryState];
  const reviewMarkState = copy.mark;

  const timeline = useMemo(() => [
    { label: 'Issue recorded', done: true },
    { label: 'Participant response', done: reviewState !== 'raised' },
    { label: 'Evidence', done: ['reviewing', 'decision', 'resolved'].includes(reviewState), active: reviewState === 'evidence' },
    { label: 'Review', done: ['decision', 'resolved'].includes(reviewState), active: reviewState === 'reviewing' },
    { label: 'Outcome', done: reviewState === 'resolved', active: reviewState === 'decision' },
  ], [reviewState]);

  return (
    <main className="b8-page">
      <header className="b8-preview-banner">
        <div>
          <p className="b8-kicker">Batch 8 visual review · fixture only</p>
          <h1>When something is unclear, the Market stays calm.</h1>
          <p>This room demonstrates Agreement Review and recovery language only. It does not decide a dispute, move money, create a release instruction or invent settlement truth.</p>
        </div>
        <LivingSecurePayMark state="review" size="lg" presence="present" label="SecurePay is helping clarify this review" />
      </header>

      <section className="b8-room" aria-labelledby="b8-review-title">
        <div className="b8-room-heading">
          <div>
            <p className="b8-kicker">V10 · Reviews & issues</p>
            <h2 id="b8-review-title">A resolution room, not a courtroom.</h2>
            <p>The trader should always know what was recorded, what it means, what SecurePay is doing, and whether anything is required from them.</p>
          </div>
        </div>

        <div className="b8-state-strip" aria-label="Agreement Review preview states">
          {reviewStates.map(state => (
            <button key={state.id} className={reviewState === state.id ? 'is-active' : ''} onClick={() => setReviewState(state.id)}>{state.label}</button>
          ))}
        </div>

        <div className="b8-review-layout">
          <article className={`b8-review-primary b8-review-primary--${reviewState}`}>
            <div className="b8-review-hero">
              <LivingSecurePayMark state={reviewMarkState} size="lg" presence={copy.presence} label={copy.eyebrow} />
              <div>
                <p className="b8-label">{copy.eyebrow}</p>
                <h3>{copy.title}</h3>
                {copy.deadline && <span className="b8-deadline"><Clock3 size={13} /> {copy.deadline}</span>}
              </div>
            </div>

            <div className="b8-meaning-grid">
              <Meaning icon={MessageCircle} title="What happened" body={copy.happened} />
              <Meaning icon={Scale} title="What it means" body={copy.means} />
              <Meaning icon={ArrowRight} title="What you can do next" body={copy.next} />
            </div>

            {copy.action && <button className="b8-primary-action">{copy.action} <ArrowRight size={16} /></button>}

            <div className="b8-safety-line">
              <LivingSecurePayMark state={reviewState === 'expired' ? 'caution' : 'resting'} size="xs" presence="polite" decorative />
              <p><strong>SecurePay keeps the process.</strong> It does not decide who is right, and this review screen cannot manufacture Payment Ready, release or settlement.</p>
            </div>
          </article>

          <aside className="b8-review-side">
            <div className="b8-side-card">
              <p className="b8-label">This review</p>
              <h4>House painting · preparation stage</h4>
              <dl>
                <div><dt>Agreement</dt><dd>SP-AGR-3048</dd></div>
                <div><dt>Your role</dt><dd>Affected funder</dd></div>
                <div><dt>Subject</dt><dd>Preparation obligation</dd></div>
              </dl>
            </div>

            <div className="b8-side-card">
              <p className="b8-label">Review thread</p>
              <div className="b8-thread">
                {timeline.map((item, index) => (
                  <div className={`b8-thread-item ${item.done ? 'is-done' : ''} ${item.active ? 'is-active' : ''}`} key={item.label}>
                    <span>{item.done ? <Check size={12} /> : index + 1}</span>
                    <p>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="b8-evidence-room">
          <div className="b8-evidence-heading">
            <div>
              <p className="b8-label">Evidence on record</p>
              <h3>Records stay attached to the exact question.</h3>
              <p>Evidence is context. The interface must not visually imply that one file automatically proves a participant right.</p>
            </div>
            <button><Upload size={15} /> Add evidence</button>
          </div>
          <div className="b8-evidence-list">
            {evidence.map(item => (
              <div className="b8-evidence-item" key={item.name}>
                <span className="b8-story-icon"><FileText size={17} /></span>
                <div><strong>{item.name}</strong><p>{item.type} · {item.owner}</p></div>
                <small>{item.time}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="b8-room" aria-labelledby="b8-recovery-title">
        <div className="b8-room-heading">
          <div>
            <p className="b8-kicker">V10 · Recovery & exceptions</p>
            <h2 id="b8-recovery-title">Problems need direction, not panic.</h2>
            <p>When a payment or settlement does not follow the happy path, SecurePay should explain the interruption without changing the underlying financial state.</p>
          </div>
        </div>

        <div className="b8-recovery-tabs" aria-label="Recovery preview states">
          {recoveryStates.map(state => <button key={state.id} className={recoveryState === state.id ? 'is-active' : ''} onClick={() => setRecoveryState(state.id)}>{state.label}</button>)}
        </div>

        <div className="b8-recovery-layout">
          <article className="b8-recovery-card">
            <div className="b8-recovery-mark">
              <LivingSecurePayMark state={recovery.mark} size="lg" presence={recoveryState === 'held' ? 'commanding' : 'present'} />
            </div>
            <div className="b8-recovery-copy">
              <p className="b8-label">Current recorded state</p>
              <h3>{recovery.title}</h3>
              <div className="b8-recovery-meaning">
                <p><strong>What happened</strong>{recovery.happened}</p>
                <p><strong>What it means</strong>{recovery.means}</p>
                <p><strong>What happens next</strong>{recovery.next}</p>
              </div>
              {recovery.action && <button className="b8-secondary-action">{recovery.action} <ArrowRight size={15} /></button>}
            </div>
          </article>

          <aside className="b8-recovery-truth">
            <div className="b8-truth-title"><AlertTriangle size={18} /><div><p className="b8-label">Truth boundary</p><h4>The UI may explain. It may not upgrade the state.</h4></div></div>
            <ul>
              <li><Check size={13} /> Payment failed ≠ payment confirmed</li>
              <li><Check size={13} /> Payment confirmed ≠ Payment Ready</li>
              <li><Check size={13} /> Release requested ≠ settled</li>
              <li><Check size={13} /> Compensated ≠ automatically settled</li>
            </ul>
            <div className="b8-recovery-path" aria-label="Illustrative recovery path">
              <span><RefreshCw size={15} /> Detect</span><ArrowRight size={14} />
              <span><MessageCircle size={15} /> Explain</span><ArrowRight size={14} />
              <span><UsersRound size={15} /> Act</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="b8-laws">
        <Law number="01" title="Calm before colour" body="Caution should attract the right amount of attention without making every interruption feel catastrophic." />
        <Law number="02" title="Process before verdict" body="SecurePay coordinates the record, evidence and next steps. The UI does not frame SecurePay as a judge." />
        <Law number="03" title="Recovery keeps financial truth intact" body="Failure and exception screens explain what is known and preserve the distinction between attempted, confirmed, ready, settling and settled." />
      </section>
    </main>
  );
}

function Meaning({ icon: Icon, title, body }: { icon: typeof MessageCircle; title: string; body: string }) {
  return <div className="b8-meaning-card"><span><Icon size={16} /></span><div><strong>{title}</strong><p>{body}</p></div></div>;
}

function Law({ number, title, body }: { number: string; title: string; body: string }) {
  return <article><span>{number}</span><div><strong>{title}</strong><p>{body}</p></div></article>;
}
