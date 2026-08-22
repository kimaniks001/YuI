// ═══════════════════════════════════════════════════════════════
// COMPACT REVIEW — replaces the four stacked cards from Slice 1
// with compact grouped rows and an expandable authority section.
//
// The user should not have to read a compliance document before
// creating an agreement. Authority boundaries remain correct but
// visually quiet.
// ═══════════════════════════════════════════════════════════════

import { Check } from 'lucide-react';
import type { CreationFacts } from '../../lib/creationFacts';
import { TOPOLOGY_LABELS, TOPOLOGY_PARTICIPANT_LABELS } from '../../lib/agreementTopology';
import { ExpandableAuthorityHelp } from './QuestionComponents';

export function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 shrink-0">{label}</span>
      <span className="text-sm text-[#1a1a1a]/70 text-right">{value}</span>
    </div>
  );
}

export function CompactReview({
  facts,
  submitError,
}: {
  facts: CreationFacts;
  submitError?: string | null;
}) {
  const { intent, topology, payerIsCreator, counterpartyKs, stages, confirmer } = facts;
  const filledStages = stages.value.filter((s) => s.label.trim());
  const hasCounterparty = counterpartyKs.value.trim().length > 0;
  const whoDisplay = hasCounterparty
    ? `${intent.who.split('→')[0]?.trim()} → ${counterpartyKs.value.trim()}`
    : intent.who;
  const topologyLabel = TOPOLOGY_LABELS[topology.topology];
  const participantInfo = TOPOLOGY_PARTICIPANT_LABELS[topology.topology];

  return (
    <div className="space-y-3">
      {submitError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* ── Agreed terms — compact grouped rows ── */}
      <div className="bg-white rounded-xl border border-[#1a1a1a]/8 shadow-sm px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3a7a1f] mb-1">
          <Check size={12} /> Agreed terms
        </p>
        <div className="divide-y divide-[#1a1a1a]/5">
          <ReviewRow label="What" value={intent.what} />
          <ReviewRow label="Amount" value={intent.amount} />
          <ReviewRow label="Who" value={whoDisplay} />
          {payerIsCreator.value !== null && (
            <ReviewRow label="Payer" value={payerIsCreator.value ? 'You' : 'The other person'} />
          )}
          {filledStages.length > 0 && (
            <div className="py-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-1">Milestones</p>
              <ul className="space-y-0.5">
                {filledStages.map((s, i) => (
                  <li key={i} className="text-sm text-[#1a1a1a]/70">
                    {i + 1}. {s.label.trim()}
                    {s.amount.trim() ? ` — ${s.amount.trim()}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ReviewRow label="Confirmer" value={confirmer.value === 'me' ? 'Me (preference)' : 'Someone else (preference)'} />
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
          'Who pays and who receives',
          'Whether this agreement is Payment Ready',
          'Release, settlement, or dispute outcomes',
          'Confirmation and release authority',
        ]}
      />

      {/* ── Milestone disclaimer — only if milestones were entered ── */}
      {filledStages.length > 0 && (
        <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
          <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
            Milestones describe the stages of work but do not by themselves control when
            money is released.
          </p>
        </div>
      )}
    </div>
  );
}
