// ═══════════════════════════════════════════════════════════════
// COMPACT GROUP REVIEW — MANY_TOONE review screen.
//
// Answers the human questions:
//   WHO IS CONTRIBUTING?
//   WHO RECEIVES?
//   HOW MUCH?
//   HOW OFTEN?
//   HOW IS IT SHARED?
//   WHAT IS IT FOR?
//
// Secondary: SecurePay structure: Group SecureLink
// ═══════════════════════════════════════════════════════════════

import { Check } from 'lucide-react';
import type { CreationFacts } from '../../lib/creationFacts';
import { TOPOLOGY_LABELS, TOPOLOGY_PARTICIPANT_LABELS } from '../../lib/agreementTopology';
import { ExpandableAuthorityHelp } from './QuestionComponents';

export function GroupReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 shrink-0">{label}</span>
      <span className="text-sm text-[#1a1a1a]/70 text-right">{value}</span>
    </div>
  );
}

export function CompactGroupReview({
  facts,
  submitError,
}: {
  facts: CreationFacts;
  submitError?: string | null;
}) {
  const { intent, topology, contributorCount, contributors, contributionMode, recipientKs, frequency, targetAmount } = facts;
  const topologyLabel = TOPOLOGY_LABELS[topology.topology];
  const participantInfo = TOPOLOGY_PARTICIPANT_LABELS[topology.topology];

  const knownContributors = contributors.value.filter((c) => c.ksNumber.trim());
  const contributorDisplay = contributorCount.value
    ? `${contributorCount.value} ${contributorCount.value === 1 ? 'contributor' : 'contributors'}`
    : knownContributors.length > 0
      ? `${knownContributors.length} added`
      : 'To be invited';

  const whoLower = intent.who.toLowerCase();
  let recipientWord = 'Recipient';
  if (whoLower.includes('mum')) recipientWord = 'Mum';
  else if (whoLower.includes('guardian')) recipientWord = 'Guardian';
  else if (whoLower.includes('organizer')) recipientWord = 'Organizer';

  const recipientDisplay = recipientKs.value.trim()
    ? recipientKs.value.trim()
    : `${recipientWord} (to be invited)`;

  const freqDisplay = frequency.value
    ? frequency.value === 'monthly' ? 'Monthly' : frequency.value === 'weekly' ? 'Weekly' : frequency.value === 'once' ? 'Once' : 'Custom'
    : 'Not specified';

  const splitDisplay = contributionMode.value === 'equal' ? 'Equal' : contributionMode.value === 'custom' ? 'Different amounts' : 'Not specified';

  return (
    <div className="space-y-3">
      {submitError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* ── Human agreement summary — compact grouped rows ── */}
      <div className="bg-white rounded-xl border border-[#1a1a1a]/8 shadow-sm px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3a7a1f] mb-1">
          <Check size={12} /> {intent.what}
        </p>
        <div className="divide-y divide-[#1a1a1a]/5">
          <GroupReviewRow label="Contributing" value={contributorDisplay} />
          <GroupReviewRow label="Receives" value={recipientDisplay} />
          <GroupReviewRow label="Amount" value={targetAmount.value || intent.amount} />
          <GroupReviewRow label="How often" value={freqDisplay} />
          <GroupReviewRow label="How shared" value={splitDisplay} />
          <GroupReviewRow label="What for" value={intent.what} />
        </div>
      </div>

      {/* ── Topology info — one compact line ── */}
      <div className="rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">SecurePay structure</p>
        <p className="text-sm text-[#1a1a1a]/55">
          {topologyLabel} — {participantInfo.payerSide}, {participantInfo.recipientSide}.
        </p>
      </div>

      {/* ── Authority boundaries — expandable, collapsed by default ── */}
      <ExpandableAuthorityHelp
        items={[
          'Who contributes and how much',
          'Whether contributions have been paid',
          'Release, settlement, or dispute outcomes',
          'Organizer and approver authority',
        ]}
      />

      {/* ── Contributor disclaimer ── */}
      <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
          Adding contributors here sends invitations only. No one has joined or paid
          until the backend confirms their participation.
        </p>
      </div>
    </div>
  );
}
