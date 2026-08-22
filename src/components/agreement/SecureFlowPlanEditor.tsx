import { useMemo, useRef, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { amendDistributionPlanAllocations } from '../../api/secureflowEndpoints';
import type {
  DistributionAllocationRequestBody,
  SecurePayDistributionAllocation,
  SecurePayDistributionPlanDetail,
} from '../../api/secureflowTypes';

type DraftRow = {
  allocationReference: string;
  beneficiaryKsNumber: string;
  purposeTitle: string;
  purposeDescription: string;
  amountKes: string;
};

function fromAllocation(allocation: SecurePayDistributionAllocation): DraftRow {
  return {
    allocationReference: allocation.allocationReference,
    beneficiaryKsNumber: allocation.beneficiaryKsNumber,
    purposeTitle: allocation.purposeTitle,
    purposeDescription: allocation.purposeDescription,
    amountKes: allocation.amountMinor == null ? '' : (allocation.amountMinor / 100).toFixed(2),
  };
}

function blankRow(index: number): DraftRow {
  return {
    allocationReference: `recipient-${index + 1}`,
    beneficiaryKsNumber: '',
    purposeTitle: '',
    purposeDescription: '',
    amountKes: '',
  };
}

function toMinor(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const minor = Math.round(amount * 100);
  return Number.isSafeInteger(minor) ? minor : null;
}

export default function SecureFlowPlanEditor({
  agreementId,
  authHeader,
  detail,
  onSaved,
}: {
  agreementId: string;
  authHeader?: string;
  detail: SecurePayDistributionPlanDetail;
  onSaved: () => void | Promise<void>;
}) {
  const [rows, setRows] = useState<DraftRow[]>(() =>
    detail.allocations.length ? detail.allocations.map(fromAllocation) : [blankRow(0)],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  const editable = detail.version.lifecycleStatus === 'DRAFT';
  const totalMinor = useMemo(() => rows.reduce((sum, row) => sum + (toMinor(row.amountKes) ?? 0), 0), [rows]);
  const targetMinor = detail.version.distributableAmountMinor;
  const balanced = totalMinor === targetMinor;

  if (!editable) return null;

  const update = (index: number, patch: Partial<DraftRow>) => {
    setRows(current => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
    setError(null);
  };

  const add = () => setRows(current => [...current, blankRow(current.length)]);
  const remove = (index: number) => setRows(current => current.filter((_, rowIndex) => rowIndex !== index));

  const save = async () => {
    if (!authHeader || saving) return;
    const allocations: DistributionAllocationRequestBody[] = [];
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const amountMinor = toMinor(row.amountKes);
      if (!row.beneficiaryKsNumber.trim() || !row.purposeTitle.trim() || !row.purposeDescription.trim() || amountMinor == null) {
        setError('Complete the KS Number, purpose and amount for every recipient.');
        return;
      }
      allocations.push({
        allocationReference: row.allocationReference || `recipient-${index + 1}`,
        sequenceNumber: index + 1,
        allocationMode: 'FIXED_AMOUNT',
        amountMinor,
        basisPoints: null,
        beneficiaryKsNumber: row.beneficiaryKsNumber.trim(),
        purposeTitle: row.purposeTitle.trim(),
        purposeDescription: row.purposeDescription.trim(),
      });
    }
    if (!allocations.length) {
      setError('Add at least one recipient.');
      return;
    }
    if (!balanced) {
      setError('Recipient amounts must add up exactly to the plan amount before you continue.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await amendDistributionPlanAllocations(
        agreementId,
        detail.plan.id,
        detail.version.planVersion,
        { idempotencyKey: idempotencyKeyRef.current, allocations },
        authHeader,
      );
      if (!result.ok) {
        setError(result.error || 'SecurePay could not save these recipients. Nothing was changed locally.');
        return;
      }
      idempotencyKeyRef.current = crypto.randomUUID();
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-[#1a1a1a]/8 bg-[#faf9f5] p-4">
      <div>
        <h4 className="text-sm font-semibold text-[#1a1a1a]">Recipients</h4>
        <p className="mt-1 text-xs leading-5 text-[#1a1a1a]/45">Add each KS Number and the exact amount that person should receive. SecurePay calculates the final allocation from the complete list you save.</p>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={`${row.allocationReference}-${index}`} className="rounded-xl border border-[#1a1a1a]/8 bg-white p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/35">Recipient {index + 1}</p>
              {rows.length > 1 && <button type="button" onClick={() => remove(index)} aria-label={`Remove recipient ${index + 1}`} className="rounded-full p-2 text-[#1a1a1a]/45 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1"><span className="text-xs font-medium text-[#1a1a1a]/60">KS Number</span><input value={row.beneficiaryKsNumber} onChange={event => update(index, { beneficiaryKsNumber: event.target.value })} placeholder="KS…" className="w-full rounded-lg border border-[#1a1a1a]/12 px-3 py-2.5 text-sm" /></label>
              <label className="space-y-1"><span className="text-xs font-medium text-[#1a1a1a]/60">Amount (KES)</span><input inputMode="decimal" value={row.amountKes} onChange={event => update(index, { amountKes: event.target.value })} placeholder="0.00" className="w-full rounded-lg border border-[#1a1a1a]/12 px-3 py-2.5 text-sm" /></label>
            </div>
            <label className="block space-y-1"><span className="text-xs font-medium text-[#1a1a1a]/60">Purpose</span><input value={row.purposeTitle} onChange={event => update(index, { purposeTitle: event.target.value })} placeholder="e.g. Transport" className="w-full rounded-lg border border-[#1a1a1a]/12 px-3 py-2.5 text-sm" /></label>
            <label className="block space-y-1"><span className="text-xs font-medium text-[#1a1a1a]/60">What is this payment for?</span><textarea value={row.purposeDescription} onChange={event => update(index, { purposeDescription: event.target.value })} rows={2} className="w-full rounded-lg border border-[#1a1a1a]/12 px-3 py-2.5 text-sm" /></label>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#1a1a1a]/10 bg-white px-3.5 text-xs font-semibold text-[#1a1a1a]/65"><Plus size={14} /> Add recipient</button>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[#1a1a1a]/55">Allocated: KES {(totalMinor / 100).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span className={balanced ? 'font-semibold text-[#3a7a1f]' : 'font-medium text-amber-700'}>{balanced ? 'Matches plan amount' : 'Must match plan amount'}</span>
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="button" onClick={() => void save()} disabled={saving || !balanced} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] px-4 text-sm font-semibold text-white disabled:opacity-40">{saving && <Loader2 size={15} className="animate-spin" />}{saving ? 'Saving…' : 'Save recipients'}</button>
    </div>
  );
}
