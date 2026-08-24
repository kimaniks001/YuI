import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen, RefreshCw } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState, TraderUnavailableState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { getMarketStatement, getMyMarketIdentities } from '../api/r13MarketEndpoints';
import type { SecurePayMarketIdentity, SecurePayMarketStatement } from '../api/r13MarketTypes';

function formatMinor(amountMinor: number, currency: string) {
  return `${currency} ${(amountMinor / 100).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function humanize(value: string) {
  const normalized = value.toLowerCase().replace(/[_-]+/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function MarketStatements() {
  const { user, session } = useAuth();
  const [identities, setIdentities] = useState<SecurePayMarketIdentity[] | null>(null);
  const [selectedKsNumber, setSelectedKsNumber] = useState('');
  const [statement, setStatement] = useState<SecurePayMarketStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [statementAvailable, setStatementAvailable] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;
    let cancelled = false;
    setLoading(true);
    void getMyMarketIdentities(session.accessToken).then(result => {
      if (cancelled) return;
      if (!result.ok || !result.data) { setIdentities(null); setLoading(false); return; }
      const visible = result.data.filter(identity => identity.canView);
      setIdentities(visible);
      setSelectedKsNumber(visible.find(identity => identity.current)?.ksNumber || visible[0]?.ksNumber || '');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session?.accessToken]);

  const loadStatement = async (ksNumber: string) => {
    if (!session?.accessToken || !ksNumber) return;
    setLoading(true);
    const result = await getMarketStatement(session.accessToken, ksNumber);
    if (result.ok && result.data) { setStatement(result.data); setStatementAvailable(true); }
    else { setStatement(null); setStatementAvailable(false); }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedKsNumber) void loadStatement(selectedKsNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKsNumber, session?.accessToken]);

  if (!user || !session) return <Navigate to="/" replace />;

  return <TraderShell>
    <TraderPageHeader eyebrow="Statements" title={<>Posted <span className="text-green-700">records</span></>} description="Choose a KSNumber and read only the ledger entries SecurePay returned." />

    {loading && !identities && <TraderLoadingState label="Loading statements…" />}
    {!loading && identities === null && <TraderErrorState title="Statements could not be loaded" detail="Viewable KSNumbers are unavailable right now." />}

    {identities && <div className="space-y-5">
      <section className="market-search-card">
        <label htmlFor="market-statement-identity" className="sr-only">Statement for</label>
        <select id="market-statement-identity" value={selectedKsNumber} onChange={event => setSelectedKsNumber(event.target.value)} className="min-h-12 w-full rounded-xl border-0 bg-transparent px-3 text-sm font-semibold outline-none">
          {identities.map(identity => <option key={identity.ksNumber} value={identity.ksNumber}>{identity.displayName || identity.identityType} · {identity.ksNumber}</option>)}
        </select>
      </section>

      {loading && <TraderLoadingState label="Loading record…" />}
      {!loading && !statementAvailable && <TraderUnavailableState title="Statement unavailable" detail={`${selectedKsNumber} did not return a statement.`} />}
      {!loading && statementAvailable && statement && statement.lines.length === 0 && <TraderEmptyState title="No posted activity" detail={`No ledger entries are showing for ${statement.ksNumber}.`} />}

      {!loading && statementAvailable && statement && statement.lines.length > 0 && <section className="market-section-shell" aria-labelledby="statement-heading">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">{statement.ksNumber}</p><h2 id="statement-heading" className="market-section-title">{statement.displayName || 'Statement'}</h2><p className="mt-1 text-[11px] text-ink/40">Updated {new Date(statement.generatedAt).toLocaleString('en-KE')}</p></div><button type="button" onClick={() => void loadStatement(selectedKsNumber)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/10 px-3 text-xs font-semibold"><RefreshCw size={14} /> Refresh</button></div>

        <ul className="mt-3 divide-y divide-ink/8">{statement.lines.map(line => <li key={line.statementLineId} className="py-3"><div className="flex gap-3"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700"><BookOpen size={15} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{line.description || humanize(line.journalType)}</p><p className="mt-0.5 truncate text-xs text-ink/40">{humanize(line.accountPurpose)} · {new Date(line.postedAt).toLocaleDateString('en-KE')}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold tabular-nums">{formatMinor(line.amountMinor, line.currency)}</p><p className="text-[10px] font-semibold text-ink/40">{line.direction}</p></div></div><details className="trader-progressive"><summary>Record details</summary><div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-ink/45"><span>{line.accountCode}</span><span>{line.journalReference}</span>{line.memo && <span>{line.memo}</span>}</div></details></div></div></li>)}</ul>
      </section>}

      <details className="trader-progressive"><summary>How to read this statement</summary><div className="rounded-xl border border-green-700/10 bg-white p-3 text-xs leading-5 text-ink/52">These are posted ledger entries for the selected KSNumber. Debit and credit remain exactly as SecurePay recorded them; this view does not combine identities or turn the entries into an available balance.</div></details>
    </div>}
  </TraderShell>;
}
