// ═══════════════════════════════════════════════════════════════
// ONE_TO_MANY (SecureFlow) question components.
//
// Mobile-first, one-decision-one-screen, compact single-line rows.
// Supports tap-to-expand for individual recipient editing.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Info } from 'lucide-react';
import type { RecipientEntry, AllocationMode } from '../../lib/creationFacts';
import { inputCls, InfoDisclaimer } from './QuestionComponents';

// ─── Recipient list editor ──────────────────────────────────────
// Shows compact rows for each known recipient role.
// Each row: role label + optional KSNumber input + tap-to-expand.

export function RecipientListEditor({
  recipients,
  onChange,
}: {
  recipients: RecipientEntry[];
  onChange: (recipients: RecipientEntry[]) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const update = (i: number, field: keyof RecipientEntry, val: string | number | null) => {
    onChange(recipients.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  };

  const remove = (i: number) => {
    if (recipients.length <= 1) return;
    onChange(recipients.filter((_, idx) => idx !== i));
    if (expandedIdx === i) setExpandedIdx(null);
  };

  return (
    <div className="space-y-2">
      {recipients.map((recipient, i) => {
        const isOpen = expandedIdx === i;
        const hasKs = recipient.ksNumber.trim().length > 0;
        return (
          <div key={i} className="rounded-lg border border-[#1a1a1a]/10 bg-white px-3 py-2">
            <button
              type="button"
              onClick={() => setExpandedIdx(isOpen ? null : i)}
              className="flex w-full items-center gap-2"
              aria-expanded={isOpen}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#3a7a1f]/10 text-[#10px] font-bold text-[#3a7a1f] shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-left text-sm font-medium text-[#1a1a1a] truncate">
                {recipient.label || `Recipient ${i + 1}`}
              </span>
              {hasKs && (
                <span className="text-xs text-[#3a7a1f] font-mono">{recipient.ksNumber.trim()}</span>
              )}
              {!hasKs && (
                <span className="text-xs text-amber-600">Needs SecurePay identity</span>
              )}
              {isOpen ? <ChevronUp size={14} className="text-[#1a1a1a]/30" /> : <ChevronDown size={14} className="text-[#1a1a1a]/30" />}
            </button>
            {isOpen && (
              <div className="mt-2 pt-2 border-t border-[#1a1a1a]/5 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Role / name (e.g. Contractor)"
                    value={recipient.label}
                    onChange={(e) => update(i, 'label', e.target.value)}
                    aria-label={`Recipient ${i + 1} role`}
                  />
                </div>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="KSNumber (optional — you can invite later)"
                  value={recipient.ksNumber}
                  onChange={(e) => update(i, 'ksNumber', e.target.value)}
                  aria-label={`Recipient ${i + 1} KSNumber`}
                />
                {recipients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="flex items-center gap-1 text-xs text-red-500/70 hover:text-red-500"
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...recipients, { label: '', ksNumber: '', allocationMinor: null, obligation: '' }])}
        className="flex items-center gap-1 text-xs font-medium text-[#3a7a1f] hover:underline"
      >
        <Plus size={13} /> Add another recipient
      </button>
      <InfoDisclaimer>
        Each recipient needs a SecurePay identity (KSNumber) before the distribution plan can be submitted.
        You can add identities now or skip this step and resolve them from the agreement workspace later.
        Adding a KSNumber here does not mean the person has joined or accepted — only the backend can confirm participation.
      </InfoDisclaimer>
    </div>
  );
}

// ─── Allocation choice ──────────────────────────────────────────
// Equal vs Different amounts with computed display and remaining tracker.

export function AllocationChoice({
  value,
  onChange,
  recipients,
  onRecipientAllocationsChange,
  totalDisplay,
}: {
  value: AllocationMode;
  onChange: (value: 'equal' | 'custom') => void;
  recipients: RecipientEntry[];
  onRecipientAllocationsChange: (recipients: RecipientEntry[]) => void;
  totalDisplay: string;
}) {
  const count = recipients.length;
  const totalMatch = totalDisplay.match(/[\d,]+/);
  const totalNum = totalMatch ? Number(totalMatch[0].replace(/,/g, '')) : null;

  const perPerson = (() => {
    if (!count || count <= 0 || !totalNum) return null;
    const per = Math.floor(totalNum / count);
    return `KES ${per.toLocaleString()}`;
  })();

  const allocatedTotal = recipients.reduce((sum, r) => {
    const v = r.allocationMinor;
    return sum + (v !== null && v > 0 ? v : 0);
  }, 0);
  const allocatedDisplay = `KES ${Math.floor(allocatedTotal / 100).toLocaleString()}`;
  const remaining = totalNum ? totalNum * 100 - allocatedTotal : null;
  const remainingDisplay = remaining !== null ? `KES ${Math.floor(remaining / 100).toLocaleString()}` : null;
  const isMatch = remaining !== null && remaining === 0;

  const updateAllocation = (i: number, val: string) => {
    const parsed = val.match(/[\d,]+/);
    const minor = parsed ? Math.round(Number(parsed[0].replace(/,/g, '')) * 100) : null;
    onRecipientAllocationsChange(recipients.map((r, idx) => (idx === i ? { ...r, allocationMinor: minor } : r)) as RecipientEntry[]);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('equal')}
          className={`px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
            value === 'equal'
              ? 'border-[#3a7a1f] bg-[#f0f7eb] text-[#3a7a1f]'
              : 'border-[#1a1a1a]/10 bg-white text-[#1a1a1a]/70 hover:border-[#3a7a1f]/30'
          }`}
        >
          Equal
        </button>
        <button
          type="button"
          onClick={() => onChange('custom')}
          className={`px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
            value === 'custom'
              ? 'border-[#3a7a1f] bg-[#f0f7eb] text-[#3a7a1f]'
              : 'border-[#1a1a1a]/10 bg-white text-[#1a1a1a]/70 hover:border-[#3a7a1f]/30'
          }`}
        >
          Different amounts
        </button>
      </div>

      {value === 'equal' && perPerson && (
        <p className="text-xs text-[#1a1a1a]/45 text-center">
          That's about <span className="font-semibold text-[#3a7a1f]">{perPerson}</span> per recipient.
          This is for your reference — actual allocations are confirmed by the backend.
        </p>
      )}

      {value === 'custom' && (
        <div className="space-y-2">
          {recipients.map((r, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-[#1a1a1a]/10 bg-white px-3 py-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3a7a1f]/10 text-[10px] font-bold text-[#3a7a1f] shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-[#1a1a1a] truncate">{r.label || `Recipient ${i + 1}`}</span>
              <input
                type="text"
                className="w-28 px-2 py-1.5 rounded-md border border-[#1a1a1a]/10 bg-[#fafaf8] text-sm text-right text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/40"
                placeholder="KES 0"
                value={r.allocationMinor ? `${Math.floor(r.allocationMinor / 100).toLocaleString()}` : ''}
                onChange={(e) => updateAllocation(i, e.target.value)}
                aria-label={`${r.label || `Recipient ${i + 1}`} amount`}
              />
            </div>
          ))}
          {totalNum && (
            <div className="flex items-center justify-between rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">
                {isMatch ? 'Allocated' : 'Allocated / Remaining'}
              </span>
              <span className={`text-sm font-semibold ${isMatch ? 'text-[#3a7a1f]' : 'text-[#1a1a1a]/70'}`}>
                {allocatedDisplay}{remainingDisplay ? ` / ${remainingDisplay}` : ''}
              </span>
            </div>
          )}
          {!isMatch && totalNum && (
            <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <Info size={13} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Amounts don't need to match the total right now. The backend validates
                allocations when the distribution plan is submitted.
              </p>
            </div>
          )}
        </div>
      )}

      <InfoDisclaimer>
        The allocation describes how you'd like payments shared. SecurePay records allocations
        as a distribution plan — actual payment and release are confirmed separately by the backend.
      </InfoDisclaimer>
    </div>
  );
}

// ─── Obligation editor ──────────────────────────────────────────
// Compact rows: role label + free-text obligation.
// Prefilled from intent if available.

export function ObligationEditor({
  recipients,
  onChange,
}: {
  recipients: RecipientEntry[];
  onChange: (recipients: RecipientEntry[]) => void;
}) {
  const update = (i: number, val: string) => {
    onChange(recipients.map((r, idx) => (idx === i ? { ...r, obligation: val } : r)));
  };

  return (
    <div className="space-y-2">
      {recipients.map((r, i) => (
        <div key={i} className="rounded-lg border border-[#1a1a1a]/10 bg-white px-3 py-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3a7a1f]/10 text-[10px] font-bold text-[#3a7a1f] shrink-0">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-[#1a1a1a] truncate">{r.label || `Recipient ${i + 1}`}</span>
          </div>
          <input
            type="text"
            className={inputCls}
            placeholder={`What does ${r.label || `recipient ${i + 1}`} need to complete?`}
            value={r.obligation}
            onChange={(e) => update(i, e.target.value)}
            aria-label={`${r.label || `Recipient ${i + 1}`} obligation`}
          />
        </div>
      ))}
      <InfoDisclaimer>
        Obligations describe what each person needs to do. They are not the same as release
        conditions — SecurePay's backend determines when money is released based on confirmation
        and distribution plan status, not just the obligation text.
      </InfoDisclaimer>
    </div>
  );
}
