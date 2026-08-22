import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelGroupSecureLinkContributor, getMyGroupContributions, recordGroupContributionIntent } from '../../api/securepayEndpoints';
import type { SecurePayContributionStatus, SecurePayCurrentUserContribution, SecurePayCurrentUserContributionPage } from '../../api/securepayTypes';
import { formatDecimalMinorMoney, parseMajorMoneyToMinor } from '../../lib/formatMinorMoney';

const PAGE_SIZE = 20;
const STATUSES = new Set<SecurePayContributionStatus>(['RECORDED', 'PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const currencySupported = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^[A-Z]{3}$/.test(value)) return false;
  const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: 'currency') => string[] }).supportedValuesOf;
  return Boolean(supportedValuesOf?.('currency').includes(value));
};
const timestamp = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:(?:0\d|1[0-7]):[0-5]\d|18:00))$/.exec(value);
  if (!match || Number.isNaN(Date.parse(value))) return false;
  const year = Number(match[1]); const month = Number(match[2]); const day = Number(match[3]);
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

function isCurrentUserContributionPage(value: unknown): value is SecurePayCurrentUserContributionPage {
  if (!value || typeof value !== 'object') return false;
  const page = value as Record<string, unknown>;
  if (!Number.isSafeInteger(page.page) || (page.page as number) < 0
    || !Number.isSafeInteger(page.size) || (page.size as number) < 1 || (page.size as number) > 100
    || !Number.isSafeInteger(page.totalElements) || (page.totalElements as number) < 0
    || !Array.isArray(page.items) || page.items.length > (page.size as number)) return false;
  const ids = new Set<string>();
  return page.items.every(item => {
    if (!item || typeof item !== 'object') return false;
    const record = item as Record<string, unknown>;
    if (typeof record.contributionRecordId !== 'string' || !UUID.test(record.contributionRecordId)
      || ids.has(record.contributionRecordId)) return false;
    ids.add(record.contributionRecordId);
    return typeof record.status === 'string' && STATUSES.has(record.status as SecurePayContributionStatus)
      && typeof record.amountMinor === 'string' && /^[0-9]+$/.test(record.amountMinor)
      && currencySupported(record.currency)
      && timestamp(record.createdAt) && timestamp(record.updatedAt)
      && (record.cancelledAt == null || timestamp(record.cancelledAt))
      && (record.expiredAt == null || timestamp(record.expiredAt))
      && typeof record.paymentIntentLinked === 'boolean';
  });
}

const statusText: Record<SecurePayContributionStatus, string> = {
  RECORDED: 'My contribution intention is recorded.',
  PAYMENT_PENDING: 'A linked payment-intent process is pending for this contribution.',
  CONFIRMED: 'SecurePay has confirmed the linked payment-intent stage for this contribution.',
  CANCELLED: 'The contribution intention was cancelled.',
  EXPIRED: 'The contribution intention expired.',
};

export default function GroupContributionPanel({ agreementId, authHeader, canRead = true, canRecord, currency, groupStatus }: {
  agreementId: string; authHeader: string; canRead?: boolean; canRecord: boolean; currency: string; groupStatus: string;
}) {
  const [items, setItems] = useState<SecurePayCurrentUserContribution[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [readState, setReadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [amount, setAmount] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createNotice, setCreateNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelErrors, setCancelErrors] = useState<Record<string, string>>({});
  const cancellingRef = useRef(false);
  const cancelKeysRef = useRef<Map<string, string>>(new Map());
  const mounted = useRef(true);
  const itemsRef = useRef<SecurePayCurrentUserContribution[]>([]);
  const request = useRef(0);
  const lastPage = useRef(0);
  const loadingMoreRef = useRef(false);
  const submittingRef = useRef(false);
  const attempt = useRef<{ key: string; amountMinor: number } | null>(null);
  const context = useRef(`${agreementId}|${authHeader}`);
  context.current = `${agreementId}|${authHeader}`;

  const load = useCallback(async (page: number, append = false) => {
    if (append && loadingMoreRef.current) return false;
    if (append) loadingMoreRef.current = true;
    const currentRequest = ++request.current;
    if (append) setLoadingMore(true); else setReadState('loading');
    const result = await getMyGroupContributions(agreementId, page, PAGE_SIZE, authHeader);
    if (!mounted.current || currentRequest !== request.current) return false;
    const data = result.data;
    if (result.ok && isCurrentUserContributionPage(data) && data.page === page && data.size === PAGE_SIZE) {
      const previous = itemsRef.current;
      const next = append
        ? [...previous, ...data.items.filter(item => !previous.some(existing => existing.contributionRecordId === item.contributionRecordId))]
        : data.items;
      itemsRef.current = next;
      setItems(next);
      setHasMore(data.items.length > 0 && next.length < data.totalElements);
      lastPage.current = page;
      setTotal(data.totalElements);
      setReadState('ready');
      setLoadingMore(false);
      loadingMoreRef.current = false;
      return true;
    }
    setReadState('error');
    setLoadingMore(false);
    loadingMoreRef.current = false;
    itemsRef.current = [];
    return false;
  }, [agreementId, authHeader]);

  useEffect(() => {
    mounted.current = true;
    request.current += 1;
    submittingRef.current = false;
    attempt.current = null;
    lastPage.current = 0;
    loadingMoreRef.current = false;
    setItems([]); setTotal(0); setHasMore(false); setCreateError(null); setCreateNotice(null); setSubmitting(false);
    cancellingRef.current = false; cancelKeysRef.current = new Map();
    setCancellingId(null); setCancelErrors({});
    if (canRead) void load(0); else setReadState('ready');
    return () => { mounted.current = false; request.current += 1; };
  }, [load, canRead]);

  const amountMinor = parseMajorMoneyToMinor(currency, amount);
  const submit = async () => {
    if (submittingRef.current || amountMinor == null || !canRecord || groupStatus !== 'ACTIVE') return;
    if (!attempt.current || attempt.current.amountMinor !== amountMinor) {
      attempt.current = { key: crypto.randomUUID(), amountMinor };
    }
    const submittedContext = `${agreementId}|${authHeader}`;
    const frozen = attempt.current;
    submittingRef.current = true; setSubmitting(true); setCreateError(null); setCreateNotice(null);
    const result = await recordGroupContributionIntent(agreementId, {
      idempotencyKey: frozen.key, intendedAmountMinor: frozen.amountMinor,
    }, authHeader);
    if (!mounted.current || context.current !== submittedContext) return;
    if (result.ok) {
      if (!canRead) {
        setAmount(''); attempt.current = null;
        setCreateNotice('SecurePay accepted the contribution intention. Contribution history is not available with your current permissions.');
        submittingRef.current = false; setSubmitting(false);
        return;
      }
      const refreshed = await load(0);
      if (refreshed) {
        setAmount(''); attempt.current = null;
        setCreateNotice('Your contribution intention was recorded and refreshed from SecurePay.');
      } else {
        setCreateNotice('SecurePay accepted the intention, but the latest contribution history is unavailable. Try refreshing the history.');
      }
    } else {
      setCreateError(result.status === 403 ? 'You are no longer authorized to record a contribution intention.'
        : result.status === 409 ? 'This attempt conflicts with an earlier request. Check your contribution history before starting a new attempt.'
          : result.status === 422 ? 'SecurePay rejected this amount or the group is no longer accepting contribution intentions.'
            : 'The request may not have completed. Retry without changing the amount, or edit the amount to start a new attempt.');
    }
    if (mounted.current && context.current === submittedContext) {
      submittingRef.current = false; setSubmitting(false);
    }
  };

  const cancelContribution = async (contributionRecordId: string) => {
    if (cancellingRef.current) return;
    cancellingRef.current = true;
    setCancellingId(contributionRecordId);
    setCancelErrors(previous => { const next = { ...previous }; delete next[contributionRecordId]; return next; });
    const submittedContext = `${agreementId}|${authHeader}`;
    let key = cancelKeysRef.current.get(contributionRecordId);
    if (!key) { key = crypto.randomUUID(); cancelKeysRef.current.set(contributionRecordId, key); }
    const result = await cancelGroupSecureLinkContributor(agreementId, contributionRecordId, { idempotencyKey: key }, authHeader);
    if (!mounted.current || context.current !== submittedContext) return;
    if (result.ok) {
      cancelKeysRef.current.delete(contributionRecordId);
      await load(0);
    } else {
      setCancelErrors(previous => ({ ...previous, [contributionRecordId]: result.status === 403
        ? 'You are no longer authorized to cancel this contribution intention.'
        : result.status === 422
          ? 'This contribution intention can no longer be cancelled. It may already have a payment intent linked.'
          : result.status === 404
            ? 'This contribution intention is no longer available.'
            : 'Cancelling this contribution intention is unavailable right now. Please try again.' }));
    }
    if (mounted.current && context.current === submittedContext) {
      cancellingRef.current = false;
      setCancellingId(null);
    }
  };

  return <section aria-labelledby="my-contributions-heading" className="rounded-xl border border-[#1a1a1a]/10 p-4">
    <h3 id="my-contributions-heading" className="text-sm font-semibold">My contribution intentions</h3>
    <p className="mt-1 text-xs text-[#1a1a1a]/50">These records describe intention and payment-intent lifecycle only. They are not proof that money is held or settled.</p>
    {canRecord && groupStatus === 'ACTIVE' && <form className="mt-4 space-y-2" onSubmit={event => { event.preventDefault(); void submit(); }}>
      <label className="block text-sm">Amount ({currency})<input aria-label={`Contribution amount in ${currency}`} aria-invalid={amount !== '' && amountMinor == null} aria-describedby={amount !== '' && amountMinor == null ? 'contribution-amount-error' : undefined} inputMode="decimal" value={amount} onChange={event => { setAmount(event.target.value); if (attempt.current && parseMajorMoneyToMinor(currency, event.target.value) !== attempt.current.amountMinor) attempt.current = null; }} placeholder="0.00" className="mt-1 block w-full rounded-xl border p-2.5" /></label>
      {amount && amountMinor == null && <p id="contribution-amount-error" role="alert" className="text-sm text-red-600">Enter a positive {currency} amount with no more than two decimal places.</p>}
      <button type="submit" disabled={submitting || amountMinor == null} className="rounded-xl bg-[#3a7a1f] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{submitting ? 'Recording…' : 'Record my contribution intention'}</button>
      {createError && <p role="alert" className="text-sm text-red-600">{createError}</p>}
      {createNotice && <p role="status" className="text-sm text-[#1a1a1a]/65">{createNotice}</p>}
    </form>}
    <div className="mt-4">
      {canRead && readState === 'loading' && <p className="text-sm text-[#1a1a1a]/50">Loading contribution intentions…</p>}
      {canRead && readState === 'error' && <div><p className="text-sm text-[#1a1a1a]/55">Your contribution history is temporarily unavailable.</p><button type="button" onClick={() => void load(0)} className="mt-1 text-sm font-medium text-[#3a7a1f]">Try history again</button></div>}
      {canRead && readState === 'ready' && items.length === 0 && <p className="text-sm text-[#1a1a1a]/55">You have not recorded a contribution intention for this group.</p>}
      {items.length > 0 && <ul className="space-y-3">{items.map(item => <li key={item.contributionRecordId} className="rounded-lg bg-[#fafaf8] p-3 text-sm">
        <p className="font-semibold">{formatDecimalMinorMoney(item.currency, item.amountMinor) ?? 'Amount unavailable'}</p>
        <p className="text-[#1a1a1a]/65">{statusText[item.status]}</p>
        {item.paymentIntentLinked && <p className="text-xs text-[#1a1a1a]/50">A payment intent is associated with this record.</p>}
        <p className="mt-1 text-xs text-[#1a1a1a]/45">Recorded {new Date(item.createdAt).toLocaleString('en-KE')}</p>
        {canRecord && item.status === 'RECORDED' && !item.paymentIntentLinked && <button type="button" disabled={cancellingId === item.contributionRecordId} onClick={() => void cancelContribution(item.contributionRecordId)} className="mt-2 text-xs font-medium text-red-700 disabled:opacity-40">{cancellingId === item.contributionRecordId ? 'Cancelling…' : 'Cancel this contribution intention'}</button>}
        {cancelErrors[item.contributionRecordId] && <p role="alert" className="mt-1 text-xs text-red-600">{cancelErrors[item.contributionRecordId]}</p>}
      </li>)}</ul>}
      {canRead && readState === 'ready' && hasMore && items.length < total && <button type="button" disabled={loadingMore} onClick={() => void load(lastPage.current + 1, true)} className="mt-3 text-sm font-medium text-[#3a7a1f]">{loadingMore ? 'Loading…' : 'Show more'}</button>}
    </div>
  </section>;
}
