// ═══════════════════════════════════════════════════════════════
// MANY_TO_MANY (Group SecureFlow) question components.
//
// Mobile-first, one-decision-one-screen, compact.
// Contributor join mode, governance mode, and review.
// ═══════════════════════════════════════════════════════════════

import { Check, AlertCircle, Users, Share2, UserCheck, Scale } from 'lucide-react';
import type { CreationFacts, ContributionJoinMode, GovernanceMode } from '../../lib/creationFacts';
import { isRecipientResolved } from '../../lib/creationFacts';
import { TOPOLOGY_LABELS, TOPOLOGY_PARTICIPANT_LABELS } from '../../lib/agreementTopology';
import { ExpandableAuthorityHelp, InfoDisclaimer } from './QuestionComponents';

// ─── Contributor join mode choice ───────────────────────────────

export function ContributionJoinChoice({
  value,
  onChange,
  contributorCount,
  perPersonDisplay,
  expectedTotalDisplay,
}: {
  value: ContributionJoinMode;
  onChange: (value: 'invite' | 'share_link') => void;
  contributorCount: number | null;
  perPersonDisplay: string;
  expectedTotalDisplay: string | null;
}) {
  return (
    <div className="space-y-3">
      {contributorCount && expectedTotalDisplay && (
        <div className="rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2.5 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Contributors</span>
            <span className="text-sm font-medium text-[#1a1a1a]/70">{contributorCount} people × {perPersonDisplay}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Expected total</span>
            <span className="text-sm font-semibold text-[#3a7a1f]">{expectedTotalDisplay}</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onChange('share_link')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
            value === 'share_link'
              ? 'border-[#3a7a1f] bg-[#f0f7eb]'
              : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/30'
          }`}
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
            value === 'share_link' ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'
          }`}>
            <Share2 size={18} />
          </div>
          <div className="text-left">
            <span className="block font-medium text-sm text-[#1a1a1a]">Share a contribution link</span>
            <span className="block text-xs text-[#1a1a1a]/45 mt-0.5">Anyone with the link can join and contribute</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('invite')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
            value === 'invite'
              ? 'border-[#3a7a1f] bg-[#f0f7eb]'
              : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/30'
          }`}
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
            value === 'invite' ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'
          }`}>
            <Users size={18} />
          </div>
          <div className="text-left">
            <span className="block font-medium text-sm text-[#1a1a1a]">Invite specific people</span>
            <span className="block text-xs text-[#1a1a1a]/45 mt-0.5">Add KSNumbers for people you know</span>
          </div>
        </button>
      </div>

      <InfoDisclaimer>
        Choosing how people join doesn't mean anyone has joined or contributed yet.
        Only the backend can confirm participation and payment. The expected total is
        for your reference — actual funding depends on real contributions.
      </InfoDisclaimer>
    </div>
  );
}

// ─── Governance mode choice ─────────────────────────────────────

export function GovernanceChoice({
  value,
  onChange,
}: {
  value: GovernanceMode;
  onChange: (value: 'creator_managed' | 'committee') => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onChange('creator_managed')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
            value === 'creator_managed'
              ? 'border-[#3a7a1f] bg-[#f0f7eb]'
              : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/30'
          }`}
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
            value === 'creator_managed' ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'
          }`}>
            <UserCheck size={18} />
          </div>
          <div className="text-left">
            <span className="block font-medium text-sm text-[#1a1a1a]">Just me</span>
            <span className="block text-xs text-[#1a1a1a]/45 mt-0.5">You approve payouts as the organizer</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('committee')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
            value === 'committee'
              ? 'border-[#3a7a1f] bg-[#f0f7eb]'
              : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/30'
          }`}
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
            value === 'committee' ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'
          }`}>
            <Scale size={18} />
          </div>
          <div className="text-left">
            <span className="block font-medium text-sm text-[#1a1a1a]">Add another approver</span>
            <span className="block text-xs text-[#1a1a1a]/45 mt-0.5">One or more people must approve payouts</span>
          </div>
        </button>
      </div>

      <InfoDisclaimer>
        This is your preference for how payouts are approved. SecurePay's backend
        manages the actual approval policy — you can change this later from the
        agreement workspace. Choosing "Just me" does not prevent the backend from
        requiring additional approval based on the agreement's governance rules.
      </InfoDisclaimer>
    </div>
  );
}

// ─── Compact Group SecureFlow review ────────────────────────────

export function GroupFlowReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 shrink-0">{label}</span>
      <span className="text-sm text-[#1a1a1a]/70 text-right">{value}</span>
    </div>
  );
}

export function CompactGroupFlowReview({
  facts,
  submitError,
}: {
  facts: CreationFacts;
  submitError?: string | null;
}) {
  const { intent, topology, contributorCount, contributionAmountPerPerson, expectedTotalMinor, contributionJoinMode, recipients, allocationMode, governanceMode } = facts;
  const topologyLabel = TOPOLOGY_LABELS[topology.topology];
  const participantInfo = TOPOLOGY_PARTICIPANT_LABELS[topology.topology];

  const recipientList = recipients.value.filter((r) => r.label.trim());
  const resolvedCount = recipientList.filter(isRecipientResolved).length;
  const unresolvedCount = recipientList.length - resolvedCount;

  const perPersonDisplay = contributionAmountPerPerson.value
    ? `KES ${Math.floor(contributionAmountPerPerson.value / 100).toLocaleString()}`
    : 'Not specified';

  const expectedTotalDisplay = expectedTotalMinor.value
    ? `KES ${Math.floor(expectedTotalMinor.value / 100).toLocaleString()}`
    : null;

  const joinDisplay = contributionJoinMode.value === 'share_link' ? 'Share link' : contributionJoinMode.value === 'invite' ? 'Invite people' : 'Not specified';
  const governanceDisplay = governanceMode.value === 'creator_managed' ? 'Just me' : governanceMode.value === 'committee' ? 'Committee' : 'Not specified';
  const splitDisplay = allocationMode.value === 'equal' ? 'Equal' : allocationMode.value === 'custom' ? 'Different amounts' : 'Not specified';

  return (
    <div className="space-y-3">
      {submitError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* ── Human agreement summary ── */}
      <div className="bg-white rounded-xl border border-[#1a1a1a]/8 shadow-sm px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3a7a1f] mb-1">
          <Check size={12} /> {intent.what}
        </p>
        <div className="divide-y divide-[#1a1a1a]/5">
          <GroupFlowReviewRow label="Contributors" value={contributorCount.value ? `${contributorCount.value} people` : 'To be determined'} />
          <GroupFlowReviewRow label="Each" value={perPersonDisplay} />
          {expectedTotalDisplay && <GroupFlowReviewRow label="Expected total" value={expectedTotalDisplay} />}
          <GroupFlowReviewRow label="How they join" value={joinDisplay} />
          <GroupFlowReviewRow label="How shared" value={splitDisplay} />
          <GroupFlowReviewRow label="Approval" value={governanceDisplay} />
        </div>
      </div>

      {/* ── Recipients with resolution status ── */}
      {recipientList.length > 0 && (
        <div className="bg-white rounded-xl border border-[#1a1a1a]/8 shadow-sm px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-2">Recipients</p>
          <ul className="space-y-1.5">
            {recipientList.map((r, i) => {
              const resolved = isRecipientResolved(r);
              return (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {resolved ? (
                    <Check size={12} className="text-[#3a7a1f] shrink-0" />
                  ) : (
                    <AlertCircle size={12} className="text-amber-500 shrink-0" />
                  )}
                  <span className="font-medium text-[#1a1a1a]/70 flex-1">{r.label.trim()}</span>
                  {r.allocationMinor ? (
                    <span className="text-xs text-[#1a1a1a]/45">KES {Math.floor(r.allocationMinor / 100).toLocaleString()}</span>
                  ) : null}
                  {resolved ? (
                    <span className="text-xs text-[#3a7a1f] font-mono">{r.ksNumber.trim()}</span>
                  ) : (
                    <span className="text-xs text-amber-600">Needs identity</span>
                  )}
                </li>
              );
            })}
          </ul>
          {unresolvedCount > 0 && (
            <p className="text-xs text-amber-600 mt-2 pt-2 border-t border-[#1a1a1a]/5">
              {unresolvedCount} of {recipientList.length} recipients need a SecurePay identity before the distribution plan can be submitted.
            </p>
          )}
        </div>
      )}

      {/* ── Topology info ── */}
      <div className="rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">SecurePay structure</p>
        <p className="text-sm text-[#1a1a1a]/55">
          {topologyLabel} — {participantInfo.payerSide}, {participantInfo.recipientSide}.
        </p>
      </div>

      {/* ── Authority boundaries ── */}
      <ExpandableAuthorityHelp
        items={[
          'Who contributes and how much they actually pay',
          'Whether the expected total has been reached',
          'When payouts are approved and released',
          'Organizer and approver authority',
          'Recipient participation and acceptance',
        ]}
      />

      <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
          The expected total is a convenience calculation. It does not mean all
          contributors have paid or that the target has been reached. Funding and
          distribution are confirmed separately by the backend.
        </p>
      </div>
    </div>
  );
}
