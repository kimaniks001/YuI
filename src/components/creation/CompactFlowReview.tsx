// ═══════════════════════════════════════════════════════════════
// COMPACT FLOW REVIEW — ONE_TO_MANY (SecureFlow) review screen.
//
// Shows payer, total, recipient rows with allocation + obligation,
// topology label, and expandable authority boundaries.
// ═══════════════════════════════════════════════════════════════

import { Check, AlertCircle } from 'lucide-react';
import type { CreationFacts } from '../../lib/creationFacts';
import { isRecipientResolved } from '../../lib/creationFacts';
import { TOPOLOGY_LABELS, TOPOLOGY_PARTICIPANT_LABELS } from '../../lib/agreementTopology';
import { ExpandableAuthorityHelp } from './QuestionComponents';

export function FlowReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 shrink-0">{label}</span>
      <span className="text-sm text-[#1a1a1a]/70 text-right">{value}</span>
    </div>
  );
}

export function CompactFlowReview({
  facts,
  submitError,
}: {
  facts: CreationFacts;
  submitError?: string | null;
}) {
  const { intent, topology, payerIsCreator, recipients, allocationMode } = facts;
  const topologyLabel = TOPOLOGY_LABELS[topology.topology];
  const participantInfo = TOPOLOGY_PARTICIPANT_LABELS[topology.topology];

  const recipientList = recipients.value.filter((r) => r.label.trim());
  const resolvedCount = recipientList.filter(isRecipientResolved).length;
  const unresolvedCount = recipientList.length - resolvedCount;
  const splitDisplay = allocationMode.value === 'equal' ? 'Equal' : allocationMode.value === 'custom' ? 'Different amounts' : 'Not specified';
  const payerDisplay = payerIsCreator.value === true ? 'You' : payerIsCreator.value === false ? 'Someone else' : 'To be determined';

  return (
    <div className="space-y-3">
      {submitError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#1a1a1a]/8 shadow-sm px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3a7a1f] mb-1">
          <Check size={12} /> {intent.what}
        </p>
        <div className="divide-y divide-[#1a1a1a]/5">
          <FlowReviewRow label="Payer" value={payerDisplay} />
          <FlowReviewRow label="Total" value={intent.amount} />
          <FlowReviewRow label="How shared" value={splitDisplay} />
          {recipientList.length > 0 && (
            <div className="py-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-1">Recipients</p>
              <ul className="space-y-1">
                {recipientList.map((r, i) => {
                  const resolved = isRecipientResolved(r);
                  return (
                    <li key={i} className="text-sm text-[#1a1a1a]/70">
                      <div className="flex items-center gap-1.5">
                        {resolved ? (
                          <Check size={12} className="text-[#3a7a1f] shrink-0" />
                        ) : (
                          <AlertCircle size={12} className="text-amber-500 shrink-0" />
                        )}
                        <span className="font-medium">{r.label.trim()}</span>
                        {resolved && (
                          <span className="text-xs text-[#3a7a1f] font-mono">{r.ksNumber.trim()}</span>
                        )}
                        {!resolved && (
                          <span className="text-xs text-amber-600">Needs SecurePay identity</span>
                        )}
                      </div>
                      {r.allocationMinor ? (
                        <span className="block text-xs text-[#1a1a1a]/45 ml-4.5">KES {Math.floor(r.allocationMinor / 100).toLocaleString()}</span>
                      ) : null}
                      {r.obligation.trim() ? <span className="block text-xs text-[#1a1a1a]/45 ml-4.5 mt-0.5">{r.obligation.trim()}</span> : null}
                    </li>
                  );
                })}
              </ul>
              {unresolvedCount > 0 && (
                <p className="text-xs text-amber-600 mt-1.5">
                  {unresolvedCount} of {recipientList.length} recipients need a SecurePay identity before the distribution plan can be submitted.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">SecurePay structure</p>
        <p className="text-sm text-[#1a1a1a]/55">
          {topologyLabel} — {participantInfo.payerSide}, {participantInfo.recipientSide}.
        </p>
      </div>

      <ExpandableAuthorityHelp
        items={[
          'Whether allocations are valid and balanced',
          'Whether recipients have accepted or joined',
          'Payment Ready, release, and settlement outcomes',
          'Distribution plan locking, submission, and funding',
        ]}
      />

      <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
          Obligations describe what each person should do but don't control when money is released.
          SecurePay's backend manages release through the distribution plan lifecycle.
        </p>
      </div>
    </div>
  );
}
