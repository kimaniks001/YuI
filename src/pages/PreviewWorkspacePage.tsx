// ═══════════════════════════════════════════════════════════════
// PREVIEW AGREEMENT WORKSPACE — V7 VISUAL LOCK
//
// Fixture-backed, no-auth, no-write visual approval surface.
// It reuses the real workspace projection layer and never invents
// production money, release, settlement, confirmation or evidence truth.
// ═══════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  History,
  ListChecks,
  Route,
  UsersRound,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { ALL_WORKSPACE_FIXTURES, FIXTURES_BY_TOPOLOGY, getWorkspaceFixture } from '../lib/workspaceFixtures';
import { buildWorkspaceProjection, type AgreementWorkspaceProjection, type HumanStatusVariant } from '../lib/workspaceProjection';
import { TOPOLOGY_LABELS, TOPOLOGY_PARTICIPANT_LABELS, type AgreementTopology } from '../lib/agreementTopology';
import type { SecurePayAgreementObligation } from '../api/securepayTypes';
import '../batch4-agreement-workspace.css';

type LivingState = 'resting' | 'listening' | 'guiding' | 'success' | 'caution' | 'waiting' | 'review' | 'complete';

function markStateForStatus(variant: HumanStatusVariant): LivingState {
  if (variant === 'complete') return 'complete';
  if (variant === 'attention' || variant === 'blocked' || variant === 'cancelled') return 'caution';
  if (variant === 'waiting') return 'waiting';
  return 'guiding';
}

function roleForProjection(projection: AgreementWorkspaceProjection): string {
  if (projection.creatorPerspective) return 'Creator / proposer';
  const firstResolved = projection.participants.find((participant) => participant.resolved);
  if (!firstResolved) return 'Participant';
  const labels: Record<string, string> = {
    payer: 'Payer',
    contributor: 'Contributor',
    recipient: 'Recipient',
    approver: 'Approver',
    creator: 'Creator / proposer',
    observer: 'Participant',
  };
  return labels[firstResolved.role] ?? 'Participant';
}

function obligationStatusLabel(status: SecurePayAgreementObligation['status']): string {
  const labels: Record<SecurePayAgreementObligation['status'], string> = {
    PENDING: 'Waiting',
    BLOCKED: 'Blocked',
    AVAILABLE: 'Ready to start',
    IN_PROGRESS: 'In progress',
    EVIDENCE_SUBMITTED: 'Evidence submitted',
    COMPLETED: 'Completed',
    REJECTED: 'Needs clarification',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
  };
  return labels[status];
}

function obligationTone(status: SecurePayAgreementObligation['status']): 'calm' | 'active' | 'attention' | 'complete' {
  if (status === 'COMPLETED') return 'complete';
  if (status === 'OVERDUE' || status === 'BLOCKED' || status === 'REJECTED') return 'attention';
  if (status === 'AVAILABLE' || status === 'IN_PROGRESS' || status === 'EVIDENCE_SUBMITTED') return 'active';
  return 'calm';
}

function moneyPosture(projection: AgreementWorkspaceProjection): { state: LivingState; label: string; detail: string } {
  if (projection.money.paymentReady) {
    return {
      state: 'success',
      label: 'Payment Ready',
      detail: 'SecurePay is displaying the backend Payment Ready result for this agreement.',
    };
  }
  if (projection.money.outstandingReasons.length > 0) {
    return {
      state: 'waiting',
      label: 'Not Payment Ready',
      detail: 'There are still backend-reported conditions to satisfy before payment can become ready.',
    };
  }
  return {
    state: 'resting',
    label: 'Money state available here',
    detail: 'Money truth is shown only when SecurePay has an authoritative state to display.',
  };
}

function WorkspaceStory({ projection }: { projection: AgreementWorkspaceProjection }) {
  const markState = markStateForStatus(projection.humanStatus.variant);
  const next = projection.primaryNextAction;

  return (
    <section className="b4-story" data-status={projection.humanStatus.variant} aria-labelledby="b4-agreement-title">
      <div className="b4-story__identity">
        <LivingSecurePayMark state={markState} size="lg" presence={projection.humanStatus.variant === 'attention' || projection.humanStatus.variant === 'blocked' ? 'commanding' : 'present'} />
        <div className="b4-story__heading">
          <div className="b4-story__eyebrow">
            <span>{projection.publicReference}</span>
            <span className="b4-story__dot" aria-hidden="true" />
            <span>{TOPOLOGY_LABELS[projection.topology]}</span>
          </div>
          <h1 id="b4-agreement-title">{projection.title}</h1>
          <div className="b4-story__meta">
            <span className="b4-role-chip">Your role · {roleForProjection(projection)}</span>
            <span className="b4-status-chip" data-variant={projection.humanStatus.variant}>{projection.humanStatus.title}</span>
          </div>
        </div>
      </div>

      <div className="b4-story__three">
        <div className="b4-story-step">
          <span className="b4-story-step__number">01</span>
          <div>
            <p className="b4-kicker">What happened</p>
            <strong>{projection.humanStatus.title}</strong>
          </div>
        </div>
        <div className="b4-story-step">
          <span className="b4-story-step__number">02</span>
          <div>
            <p className="b4-kicker">What it means</p>
            <strong>{projection.humanStatus.explanation}</strong>
          </div>
        </div>
        <div className="b4-story-step b4-story-step--next">
          <span className="b4-story-step__number">03</span>
          <div>
            <p className="b4-kicker">What you can do next</p>
            <strong>{next ? next.label : 'Nothing is needed from you right now.'}</strong>
            {next && <span className="b4-story-step__reason">{next.reason}</span>}
          </div>
        </div>
      </div>

      <p className="b4-story__safety">
        SecurePay shows the agreement state it receives. This page does not create payment, release, settlement or confirmation truth.
      </p>
    </section>
  );
}

function FixtureChooser({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const groups: { topology: AgreementTopology; label: string }[] = [
    { topology: 'ONE_TO_ONE', label: '1 → 1' },
    { topology: 'MANY_TO_ONE', label: 'Many → 1' },
    { topology: 'ONE_TO_MANY', label: '1 → Many' },
    { topology: 'MANY_TO_MANY', label: 'Many → Many' },
  ];

  return (
    <aside className="b4-fixture-panel" aria-label="Preview agreement states">
      <div className="b4-fixture-panel__head">
        <div>
          <p className="b4-kicker">Visual review controls</p>
          <strong>Change the agreement story</strong>
        </div>
        <span><Eye size={13} /> Preview only</span>
      </div>
      <p className="b4-fixture-panel__note">These controls exist only to inspect the workspace. They make no backend calls and perform no writes.</p>
      <div className="b4-fixture-groups">
        {groups.map(({ topology, label }) => {
          const fixtures = FIXTURES_BY_TOPOLOGY[topology];
          if (!fixtures.length) return null;
          return (
            <div className="b4-fixture-group" key={topology}>
              <p>{label}</p>
              <div>
                {fixtures.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-selected={selectedId === item.id}
                    onClick={() => onSelect(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function AgreementNavigation() {
  const links = [
    ['#agreement-thread', 'Agreement'],
    ['#work-and-proof', 'Work & proof'],
    ['#agreement-money', 'Money'],
    ['#agreement-people', 'People'],
    ['#agreement-activity', 'Activity'],
  ];
  return (
    <nav className="b4-workspace-nav" aria-label="Agreement workspace sections">
      {links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
    </nav>
  );
}

function AgreementThread({ projection }: { projection: AgreementWorkspaceProjection }) {
  return (
    <section id="agreement-thread" className="b4-card b4-card--thread">
      <div className="b4-card__head">
        <div className="b4-card__icon"><Route size={17} /></div>
        <div>
          <p className="b4-kicker">The agreement thread</p>
          <h2>See how this trade is moving</h2>
        </div>
      </div>
      {projection.milestones.length ? (
        <ol className="b4-thread-list">
          {projection.milestones.map((milestone, index) => (
            <li key={`${milestone.title}-${index}`} data-status={milestone.humanStatus.toLowerCase().replace(/ /g, '-')}>
              <span className="b4-thread-list__node"><CircleDot size={16} /></span>
              <div>
                <strong>{milestone.title}</strong>
                <span>{milestone.humanStatus}</span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="b4-empty">No milestone steps are recorded for this agreement.</p>
      )}
    </section>
  );
}

function WorkAndProof({ obligations }: { obligations: SecurePayAgreementObligation[] }) {
  return (
    <section id="work-and-proof" className="b4-card">
      <div className="b4-card__head">
        <div className="b4-card__icon"><ListChecks size={17} /></div>
        <div>
          <p className="b4-kicker">What must happen</p>
          <h2>Work, obligations & proof</h2>
        </div>
      </div>

      {obligations.length ? (
        <div className="b4-obligation-list">
          {obligations.map((obligation, index) => {
            const tone = obligationTone(obligation.status);
            return (
              <article key={obligation.id} className="b4-obligation" data-tone={tone}>
                <div className="b4-obligation__number">{String(index + 1).padStart(2, '0')}</div>
                <div className="b4-obligation__body">
                  <div className="b4-obligation__title-row">
                    <strong>{obligation.title}</strong>
                    <span>{obligationStatusLabel(obligation.status)}</span>
                  </div>
                  {obligation.description && <p>{obligation.description}</p>}
                  <div className="b4-obligation__proof">
                    <FileCheck2 size={14} />
                    <span>In the live workspace, evidence belongs to this obligation and is reviewed here. This preview does not invent evidence records.</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="b4-proof-empty">
          <LivingSecurePayMark state="resting" size="sm" presence="polite" decorative />
          <div>
            <strong>No obligations recorded in this fixture.</strong>
            <p>SecurePay will not create tasks or evidence requirements that the agreement does not contain.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function MoneyCard({ projection }: { projection: AgreementWorkspaceProjection }) {
  const posture = moneyPosture(projection);
  return (
    <section id="agreement-money" className="b4-card b4-card--money">
      <div className="b4-card__head b4-card__head--spread">
        <div className="b4-card__head-left">
          <div className="b4-card__icon"><Banknote size={17} /></div>
          <div>
            <p className="b4-kicker">Money follows the agreement</p>
            <h2>Money state</h2>
          </div>
        </div>
        <LivingSecurePayMark state={posture.state} size="sm" presence="polite" />
      </div>

      <div className="b4-money-grid">
        {projection.money.agreementAmountDisplay && (
          <div>
            <span>Agreement amount</span>
            <strong>{projection.money.agreementAmountDisplay}</strong>
          </div>
        )}
        {projection.money.expectedTotalDisplay && (
          <div>
            <span>Expected total</span>
            <strong>{projection.money.expectedTotalDisplay}</strong>
          </div>
        )}
        {projection.money.contributedTotalDisplay && (
          <div>
            <span>Confirmed contributions</span>
            <strong>{projection.money.contributedTotalDisplay}</strong>
          </div>
        )}
        {projection.money.evaluatedAmountDisplay && (
          <div>
            <span>Evaluated amount</span>
            <strong>{projection.money.evaluatedAmountDisplay}</strong>
          </div>
        )}
      </div>

      <div className="b4-money-state" data-ready={projection.money.paymentReady}>
        <strong>{posture.label}</strong>
        <p>{posture.detail}</p>
      </div>
      {projection.money.expectedTotalDisplay && projection.money.contributedTotalDisplay && (
        <p className="b4-card__footnote">Expected total is a target. Confirmed contributions are the backend-observed contribution total in this fixture.</p>
      )}
    </section>
  );
}

function PeopleCard({ projection }: { projection: AgreementWorkspaceProjection }) {
  const participantInfo = TOPOLOGY_PARTICIPANT_LABELS[projection.topology];
  return (
    <section id="agreement-people" className="b4-card">
      <div className="b4-card__head">
        <div className="b4-card__icon"><UsersRound size={17} /></div>
        <div>
          <p className="b4-kicker">People & roles</p>
          <h2>Who is doing what</h2>
        </div>
      </div>
      <p className="b4-role-law">Creating an agreement does not automatically make someone the payer. SecurePay keeps each role explicit.</p>
      <div className="b4-people-list">
        {projection.participants.map((participant, index) => (
          <div className="b4-person" key={`${participant.role}-${index}`}>
            <span className="b4-person__avatar">{participant.label.charAt(0)}</span>
            <div>
              <strong>{participant.label}</strong>
              <span>{participant.resolved ? 'Joined / identified' : participant.status === 'CREATOR' ? 'Created this agreement' : 'Identity still needed'}</span>
            </div>
            <LivingSecurePayMark state={participant.resolved || participant.status === 'CREATOR' ? 'resting' : 'waiting'} size="xs" presence="polite" decorative />
          </div>
        ))}
      </div>
      <p className="b4-card__footnote">{TOPOLOGY_LABELS[projection.topology]} · {participantInfo.payerSide} · {participantInfo.recipientSide}</p>
    </section>
  );
}

function AttentionCard({ projection }: { projection: AgreementWorkspaceProjection }) {
  if (!projection.attentionItems.length) return null;
  return (
    <section className="b4-card b4-card--attention">
      <div className="b4-card__head">
        <LivingSecurePayMark state="caution" size="sm" presence="present" />
        <div>
          <p className="b4-kicker">Your agreement needs you here</p>
          <h2>{projection.attentionItems.length} thing{projection.attentionItems.length === 1 ? '' : 's'} to look at</h2>
        </div>
      </div>
      <div className="b4-attention-list">
        {projection.attentionItems.map((item, index) => (
          <div key={`${item.label}-${index}`} data-severity={item.severity}>
            <ChevronRight size={15} />
            <div><strong>{item.label}</strong><span>{item.reason}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActivityCard({ projection }: { projection: AgreementWorkspaceProjection }) {
  return (
    <section id="agreement-activity" className="b4-card">
      <div className="b4-card__head">
        <div className="b4-card__icon"><History size={17} /></div>
        <div>
          <p className="b4-kicker">Agreement record</p>
          <h2>Recent activity</h2>
        </div>
      </div>
      {projection.recentActivity.length ? (
        <ol className="b4-activity-list">
          {projection.recentActivity.slice(0, 6).map((entry, index) => (
            <li key={`${entry.timestamp}-${index}`}>
              <span className="b4-activity-list__line" aria-hidden="true" />
              <span className="b4-activity-list__node"><Clock3 size={13} /></span>
              <div><strong>{entry.description}</strong><span>{new Date(entry.timestamp).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
            </li>
          ))}
        </ol>
      ) : <p className="b4-empty">No activity has been recorded yet.</p>}
    </section>
  );
}

export default function PreviewWorkspacePage() {
  const [searchParams] = useSearchParams();
  const requestedFixture = searchParams.get('fixture');
  const initialFixtureId = requestedFixture && getWorkspaceFixture(requestedFixture) ? requestedFixture : ALL_WORKSPACE_FIXTURES[0].id;
  const [selectedId, setSelectedId] = useState(initialFixtureId);
  const fixture = getWorkspaceFixture(selectedId) ?? ALL_WORKSPACE_FIXTURES[0];
  const projection = useMemo(() => buildWorkspaceProjection(fixture.input), [fixture]);

  const operationalFixture = fixture.topology === 'MANY_TO_ONE'
    ? 'ops-gsl-partial'
    : fixture.topology === 'ONE_TO_MANY'
      ? 'ops-sf-multi'
      : fixture.topology === 'MANY_TO_MANY'
        ? 'ops-gsf-payout'
        : 'ops-sl-fund';

  return (
    <div className="b4-workspace-room">
      <header className="b4-workspace-header">
        <div className="b4-workspace-header__inner">
          <Link to="/preview/trader-home" className="b4-workspace-header__back">
            <ArrowLeft size={16} /> <span>My Market</span>
          </Link>
          <Link to="/preview/home" className="b4-workspace-header__mark" aria-label="SecurePay Market entrance">
            <LivingSecurePayMark state="resting" size="md" presence="polite" />
          </Link>
          <div className="b4-workspace-header__label">
            <span>Agreement workspace</span>
            <small>Preview</small>
          </div>
        </div>
      </header>

      <main className="b4-workspace-shell">
        <div className="b4-workspace-intro">
          <p className="b4-kicker">One agreement. One working room.</p>
          <strong>Everything about this trade stays together.</strong>
          <span>People, obligations, proof, money state, progress and the next action should never feel like separate systems.</span>
        </div>

        <FixtureChooser selectedId={selectedId} onSelect={setSelectedId} />

        <div className="b4-workspace-content">
          <WorkspaceStory projection={projection} />
          <p className="b4-fixture-description">{fixture.description}</p>
          <AgreementNavigation />

          <div className="b4-workspace-grid">
            <div className="b4-workspace-column b4-workspace-column--main">
              <AttentionCard projection={projection} />
              <AgreementThread projection={projection} />
              <WorkAndProof obligations={fixture.input.obligations} />
              <ActivityCard projection={projection} />
            </div>
            <div className="b4-workspace-column b4-workspace-column--side">
              <MoneyCard projection={projection} />
              <PeopleCard projection={projection} />
              <section className="b4-card b4-card--record">
                <div className="b4-card__head">
                  <div className="b4-card__icon"><FileText size={17} /></div>
                  <div><p className="b4-kicker">Agreement record</p><h2>What SecurePay is preserving</h2></div>
                </div>
                <p>The agreement version, people, obligations, confirmations, evidence and backend money states belong to the same record.</p>
                <p className="b4-card__footnote">Preview fixture · no backend calls · no financial writes.</p>
              </section>
            </div>
          </div>

          <div className="b4-workspace-actions">
            <Link to="/preview/market" className="b4-button b4-button--quiet">Back to My Market</Link>
            <Link to={`/preview/operational?fixture=${operationalFixture}`} className="b4-button b4-button--primary">See operational journey <ArrowRight size={16} /></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
