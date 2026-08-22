// ═══════════════════════════════════════════════════════════════
// SHARED CREATION QUESTION COMPONENTS
//
// Reusable mobile-first question patterns for the creation engine.
// Compact, one-decision-one-screen, no unnecessary scrolling.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Info, Plus, X } from 'lucide-react';
import type { StageEntry, ContributorEntry, ContributionMode } from '../../lib/creationFacts';

// ─── Shared input class ─────────────────────────────────────────

export const inputCls =
  'w-full px-4 py-3 rounded-xl border border-[#1a1a1a]/10 bg-white text-[#1a1a1a] text-sm placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/60 focus:ring-2 focus:ring-[#3a7a1f]/10 transition-all duration-200';

// ─── A. Binary icon choice ──────────────────────────────────────

export function BinaryIconChoice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; sublabel?: string; icon: React.ReactNode }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 ${
            value === opt.value
              ? 'border-[#3a7a1f] bg-[#f0f7eb]'
              : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/30'
          }`}
        >
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
              value === opt.value ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'
            }`}
          >
            {opt.icon}
          </div>
          <div className="text-left">
            <span className="block font-medium text-sm text-[#1a1a1a]">{opt.label}</span>
            {opt.sublabel && <span className="block text-xs text-[#1a1a1a]/45 mt-0.5">{opt.sublabel}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── B. Person / KSN input ──────────────────────────────────────

export function KsnInput({
  value,
  onChange,
  placeholder = 'e.g. KS100234',
  label = 'Their KSNumber',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      <input
        type="text"
        className={inputCls}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </div>
  );
}

// ─── C. Amount input ────────────────────────────────────────────

export function AmountInput({
  value,
  onChange,
  placeholder = 'KES 0',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      className={inputCls}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Amount"
    />
  );
}

// ─── D. Frequency choice ────────────────────────────────────────

export type Frequency = 'once' | 'weekly' | 'monthly' | 'custom';

export function FrequencyChoice({
  value,
  onChange,
}: {
  value: Frequency | null;
  onChange: (value: Frequency) => void;
}) {
  const options: { value: Frequency; label: string }[] = [
    { value: 'once', label: 'Once' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
            value === opt.value
              ? 'border-[#3a7a1f] bg-[#f0f7eb] text-[#3a7a1f]'
              : 'border-[#1a1a1a]/10 bg-white text-[#1a1a1a]/70 hover:border-[#3a7a1f]/30'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── E. Split choice ────────────────────────────────────────────

export type SplitMode = 'equal' | 'different';

export function SplitChoice({
  value,
  onChange,
}: {
  value: SplitMode | null;
  onChange: (value: SplitMode) => void;
}) {
  return (
    <BinaryIconChoice
      value={value}
      onChange={onChange}
      options={[
        { value: 'equal', label: 'Equal split', sublabel: 'Everyone pays the same', icon: <Check size={18} /> },
        { value: 'different', label: 'Different amounts', sublabel: 'Each person pays their own', icon: <Check size={18} /> },
      ]}
    />
  );
}

// ─── F. Compact stage editor ────────────────────────────────────
// Improved density: compact rows, optional amounts revealed only
// when a label is entered.

export function CompactStageEditor({
  stages,
  onChange,
}: {
  stages: StageEntry[];
  onChange: (stages: StageEntry[]) => void;
}) {
  const update = (i: number, field: keyof StageEntry, val: string) => {
    onChange(stages.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const remove = (i: number) => {
    if (stages.length <= 1) return;
    onChange(stages.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const hasLabel = stage.label.trim().length > 0;
        return (
          <div key={i} className="rounded-lg border border-[#1a1a1a]/10 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3a7a1f]/10 text-[10px] font-bold text-[#3a7a1f] shrink-0">
                {i + 1}
              </span>
              <input
                type="text"
                className="flex-1 px-2 py-1.5 rounded-md border border-transparent bg-transparent text-sm text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/40 focus:bg-white"
                placeholder={`Stage ${i + 1} name`}
                value={stage.label}
                onChange={(e) => update(i, 'label', e.target.value)}
                aria-label={`Stage ${i + 1} name`}
              />
              {stages.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-[#1a1a1a]/30 hover:text-red-500 transition-colors p-1"
                  aria-label={`Remove stage ${i + 1}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {hasLabel && (
              <input
                type="text"
                className="w-full mt-1.5 px-2 py-1.5 rounded-md border border-[#1a1a1a]/8 bg-[#fafaf8] text-xs text-[#1a1a1a]/70 placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/40"
                placeholder="Amount (optional, e.g. KES 30,000)"
                value={stage.amount}
                onChange={(e) => update(i, 'amount', e.target.value)}
                aria-label={`Stage ${i + 1} amount`}
              />
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...stages, { label: '', amount: '' }])}
        className="flex items-center gap-1 text-xs font-medium text-[#3a7a1f] hover:underline"
      >
        <Plus size={13} /> Add another stage
      </button>
    </div>
  );
}

// ─── G. Date input ──────────────────────────────────────────────

export function DateInput({
  value,
  onChange,
  label = 'When should this happen?',
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      <input
        type="date"
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
    </div>
  );
}

// ─── H. Confirmer choice (proposed only) ────────────────────────

export function ConfirmerChoice({
  value,
  onChange,
}: {
  value: 'me' | 'someone_else' | null;
  onChange: (value: 'me' | 'someone_else') => void;
}) {
  return (
    <div className="space-y-2">
      <BinaryIconChoice
        value={value}
        onChange={onChange}
        options={[
          { value: 'me', label: 'Me', icon: <Check size={18} /> },
          { value: 'someone_else', label: 'Someone else', icon: <Check size={18} /> },
        ]}
      />
      <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <Info size={13} className="text-[#1a1a1a]/30 shrink-0 mt-0.5" />
        <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
          This is a preference, not an authority assignment. SecurePay's backend
          determines who has confirmation and release authority.
        </p>
      </div>
    </div>
  );
}

// ─── Collapsible memory bar ─────────────────────────────────────

export function MemoryBar({
  what,
  amount,
  who,
  expanded,
  onToggle,
}: {
  what: string;
  amount: string;
  who: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#d4e6c5] bg-[#f6faf2] px-3 py-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3a7a1f]">
          <Check size={12} /> SecurePay understood
        </span>
        {expanded ? (
          <ChevronUp size={13} className="text-[#3a7a1f]/50" />
        ) : (
          <ChevronDown size={13} className="text-[#3a7a1f]/50" />
        )}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-0.5 text-sm">
          <p className="font-medium text-[#1a1a1a]">{what}</p>
          <p className="text-[#3a7a1f] font-bold text-xs">{amount}</p>
          <p className="text-xs text-[#1a1a1a]/55">{who}</p>
        </div>
      )}
    </div>
  );
}

// ─── Compact info disclaimer ────────────────────────────────────

export function InfoDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
      <Info size={13} className="text-[#1a1a1a]/30 shrink-0 mt-0.5" />
      <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Expandable authority help (for review screen) ──────────────

export function ExpandableAuthorityHelp({
  items,
}: {
  items: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5">
          <Info size={12} /> Decided by SecurePay, not this form
        </span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <ul className="list-disc pl-5 mt-1.5 text-xs leading-relaxed text-[#1a1a1a]/55 space-y-0.5">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── MANY_TO_ONE: Contributor editor ────────────────────────────
// Progressive addition — don't require entering six full people records
// on one screen. Support "add now" or "invite/share later".

export function ContributorEditor({
  contributors,
  onChange,
  knownCount,
}: {
  contributors: ContributorEntry[];
  onChange: (contributors: ContributorEntry[]) => void;
  knownCount: number | null;
}) {
  const update = (i: number, field: keyof ContributorEntry, val: string) => {
    onChange(contributors.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  };

  const remove = (i: number) => {
    if (contributors.length <= 0) return;
    onChange(contributors.filter((_, idx) => idx !== i));
  };

  const slotsToShow = Math.max(contributors.length, knownCount ?? 0, 1);

  return (
    <div className="space-y-2">
      {Array.from({ length: slotsToShow }).map((_, i) => {
    const contributor = contributors[i] || { ksNumber: '', label: '' };
        return (
          <div key={i} className="rounded-lg border border-[#1a1a1a]/10 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#3a7a1f]/10 text-[10px] font-bold text-[#3a7a1f] shrink-0">
                {i + 1}
              </span>
              <input
                type="text"
                className="flex-1 px-2 py-1.5 rounded-md border border-transparent bg-transparent text-sm text-[#1a1a1a] placeholder-[#1a1a1a]/30 focus:outline-none focus:border-[#3a7a1f]/40 focus:bg-white"
                placeholder="KSNumber (optional)"
                value={contributor.ksNumber}
                onChange={(e) => {
                  if (!contributors[i]) {
                    onChange([...contributors.slice(0, i), { ksNumber: e.target.value, label: '' }, ...contributors.slice(i + 1)]);
                  } else {
                    update(i, 'ksNumber', e.target.value);
                  }
                }}
                aria-label={`Contributor ${i + 1} KSNumber`}
              />
              {contributors[i] && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-[#1a1a1a]/30 hover:text-red-500 transition-colors p-1"
                  aria-label={`Remove contributor ${i + 1}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...contributors, { ksNumber: '', label: '' }])}
        className="flex items-center gap-1 text-xs font-medium text-[#3a7a1f] hover:underline"
      >
        <Plus size={13} /> Add another
      </button>
      <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <Info size={13} className="text-[#1a1a1a]/30 shrink-0 mt-0.5" />
        <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
          You can add KSNumbers now or invite everyone later. Adding someone here
          doesn't mean they've joined or paid — that's confirmed by the backend.
        </p>
      </div>
    </div>
  );
}

// ─── MANY_TO_ONE: Contribution split with computed display ──────

export function ContributionSplitChoice({
  value,
  onChange,
  totalDisplay,
  contributorCount,
}: {
  value: ContributionMode;
  onChange: (value: 'equal' | 'custom') => void;
  totalDisplay: string;
  contributorCount: number | null;
}) {
  const perPerson = (() => {
    if (!contributorCount || contributorCount <= 0) return null;
    const match = totalDisplay.match(/[\d,]+/);
    if (!match) return null;
    const total = Number(match[0].replace(/,/g, ''));
    if (!total || !Number.isFinite(total)) return null;
    const per = Math.floor(total / contributorCount);
    return `KES ${per.toLocaleString()}`;
  })();

  return (
    <div className="space-y-2">
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
          That's about <span className="font-semibold text-[#3a7a1f]">{perPerson}</span> per contributor.
          This is for your reference — actual contributions are confirmed by the backend.
        </p>
      )}
      <div className="flex gap-2 rounded-lg bg-[#fafaf8] border border-[#1a1a1a]/8 px-3 py-2">
        <Info size={13} className="text-[#1a1a1a]/30 shrink-0 mt-0.5" />
        <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
          The split describes how you'd like contributions shared. SecurePay records
          contribution intents — actual payment is confirmed separately by the backend.
        </p>
      </div>
    </div>
  );
}

// ─── MANY_TO_ONE: Recipient input ───────────────────────────────

export function RecipientInput({
  value,
  onChange,
  recipientLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  recipientLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <input
        type="text"
        className={inputCls}
        placeholder="KSNumber (optional — you can invite later)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${recipientLabel ?? 'Recipient'} KSNumber`}
      />
    </div>
  );
}
