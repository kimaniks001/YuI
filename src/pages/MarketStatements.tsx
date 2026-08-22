import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen, RefreshCw } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
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
      if (!result.ok || !result.data) {
        setIdentities(null);
        setLoading(false);
        return;
      }
      const visible = result.data.filter(identity => identity.canView);
      setIdentities(visible);
      const initial = visible.find(identity => identity.current)?.ksNumber || visible[0]?.ksNumber || '';
      setSelectedKsNumber(initial);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session?.accessToken]);

  const loadStatement = async (ksNumber: string) => {
    if (!session?.accessToken || !ksNumber) return;
    setLoading(true);
    const result = await getMarketStatement(session.accessToken, ksNumber);
    if (result.ok && result.data) {
      setStatement(result.data);
      setStatementAvailable(true);
    } else {
      setStatement(null);
      setStatementAvailable(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedKsNumber) void loadStatement(selectedKsNumber);
    // loadStatement is intentionally driven by authenticated identity selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKsNumber, session?.accessToken]);

  if (!user || !session) return <Navigate to="/" replace />;

  return (
    <TraderShell>
      <TraderPageHeader
        eyebrow="My Market · Statements"
        title="A record of what SecurePay actually posted."
        description="Choose a KSNumber SecurePay says you may view. Every statement line stays attached to the ledger account and KSNumber that produced it."
        aside={<div className="min-w-[260px] rounded-2xl border border-green-700/10 bg-green-50/60 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Statement rule</p><p className="mt-1 text-sm font-semibold">No combined Market balance</p><p className="mt-1 text-xs text-ink/50">Separate identities and ledger accounts remain separate.</p></div>}
      />

      {loading && !identities && <TraderLoadingState />}
      {!loading && identities === null && <TraderErrorState title="Statements could not be loaded" detail="SecurePay could not confirm which KSNumbers you may view. No statement was reconstructed in the browser." />}

      {identities && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
            <label htmlFor="market-statement-identity" className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Statement for</label>
            <select id="market-statement-identity" value={selectedKsNumber} onChange={event => setSelectedKsNumber(event.target.value)} className="mt-2 min-h-12 w-full max-w-xl rounded-xl border border-ink/10 bg-white px-4 text-sm font-semibold">
              {identities.map(identity => <option key={identity.ksNumber} value={identity.ksNumber}>{identity.displayName || identity.identityType} · {identity.ksNumber}</option>)}
            </select>
            <p className="mt-2 text-xs text-ink/45">Only backend-authorised viewable identities appear here. This selector does not switch your acting identity.</p>
          </section>

          {loading && <TraderLoadingState />}
          {!loading && !statementAvailable && <TraderUnavailableState title="Statement unavailable" detail={`SecurePay did not return the ledger statement for ${selectedKsNumber}. No activity or balance was inferred.`} />}
          {!loading && statementAvailable && statement && statement.lines.length === 0 && <TraderEmptyState title="No posted ledger activity yet" detail={`SecurePay has no posted ledger entries to show for ${statement.ksNumber}.`} />}

          {!loading && statementAvailable && statement && statement.lines.length > 0 && (
            <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="statement-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">{statement.ksNumber}</p><h2 id="statement-heading" className="mt-1 font-display text-2xl">{statement.displayName || 'Ledger statement'}</h2><p className="mt-1 text-xs text-ink/45">Generated {new Date(statement.generatedAt).toLocaleString('en-KE')}</p></div>
                <button type="button" onClick={() => void loadStatement(selectedKsNumber)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 px-4 text-sm font-semibold"><RefreshCw size={15} /> Refresh</button>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-700/10 bg-green-50/50 p-4 text-sm text-ink/60"><LivingSecurePayMark state="resting" size="sm" presence="polite" /><span>Amounts below are posted ledger entries. Debit and credit are shown exactly as SecurePay recorded them; this page does not reinterpret them as money available to spend.</span></div>

              <ul className="mt-5 divide-y divide-ink/8">
                {statement.lines.map(line => (
                  <li key={line.statementLineId} className="py-4">
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700"><BookOpen size={17} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div><p className="text-sm font-semibold text-ink/85">{line.description || humanize(line.journalType)}</p><p className="mt-0.5 text-xs text-ink/45">{humanize(line.accountPurpose)} · {line.accountCode}</p></div>
                          <div className="text-right"><p className="text-sm font-semibold tabular-nums">{formatMinor(line.amountMinor, line.currency)}</p><p className="mt-0.5 text-xs font-semibold text-ink/45">{line.direction}</p></div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/40"><span className="font-mono">{statement.ksNumber}</span><span>{line.journalReference}</span><time>{new Date(line.postedAt).toLocaleString('en-KE')}</time>{line.memo && <span>{line.memo}</span>}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </TraderShell>
  );
}
