import { useCallback, useEffect, useState } from 'react';
import { Clock3, Loader2, MapPin } from 'lucide-react';
import { listAgreementObligations } from '../../api/securepayEndpoints';
import type { SecurePayAgreementObligation } from '../../api/securepayTypes';
import AgreementConditionWorkspace from './AgreementConditionWorkspace';

interface Props {
  agreementId: string;
  authHeader: string;
}

export default function AgreementConditionsRouteSection({ agreementId, authHeader }: Props) {
  const [obligations, setObligations] = useState<SecurePayAgreementObligation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAgreementObligations(agreementId, authHeader);
      if (!result.ok || !result.data) {
        setError(result.error || 'Could not load the agreement obligations for location and time conditions.');
        return;
      }
      setObligations(result.data);
    } finally {
      setLoading(false);
    }
  }, [agreementId, authHeader]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="rounded-2xl border border-[#1a1a1a]/6 bg-white p-6 shadow-sm" aria-labelledby="where-when-heading">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3a7a1f]/10 text-[#3a7a1f]">
          <MapPin size={15} />
        </div>
        <div>
          <h2 id="where-when-heading" className="font-display text-base font-medium text-[#1a1a1a]">Where & when</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-[#1a1a1a]/45">
            Location and time conditions belong to a specific agreement obligation. SecurePay records the agreed condition here and evaluates it separately when a participant checks it.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-3 text-sm text-[#1a1a1a]/40">
          <Loader2 size={14} className="animate-spin" /> Loading agreement obligations…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && obligations && obligations.length === 0 && (
        <p className="text-sm text-[#1a1a1a]/40">No obligations are recorded yet, so there is nothing to attach a location or time condition to.</p>
      )}

      {!loading && !error && obligations && obligations.length > 0 && (
        <div className="space-y-4">
          {obligations.map(obligation => (
            <div key={obligation.id} className="rounded-xl border border-[#1a1a1a]/8 bg-[#fafaf8] p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]/80">{obligation.title}</p>
                  {obligation.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-[#1a1a1a]/45">{obligation.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1 text-[11px] text-[#1a1a1a]/35">
                  <Clock3 size={11} /> {obligation.status.toLowerCase().replace(/_/g, ' ')}
                </div>
              </div>
              <AgreementConditionWorkspace
                agreementId={agreementId}
                obligationId={obligation.id}
                authHeader={authHeader}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
