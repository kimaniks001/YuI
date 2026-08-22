import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, Loader2, MapPin } from 'lucide-react';
import {
  evaluateLocationCondition,
  evaluateTimeCondition,
  listAgreementConditions,
} from '../../api/agreementConditionEndpoints';
import type {
  SecurePayAgreementCondition,
  SecurePayConditionEvaluation,
  SecurePayConditionEvaluationStatus,
} from '../../api/agreementConditionTypes';

interface Props {
  agreementId: string;
  obligationId: string;
  authHeader?: string;
}

const STATUS_COPY: Record<SecurePayConditionEvaluationStatus, string> = {
  PENDING: 'Not checked yet',
  SATISFIED: 'Condition satisfied',
  NOT_SATISFIED: 'Condition not satisfied',
  INDETERMINATE: 'SecurePay could not determine this condition',
  EXPIRED: 'The agreed time condition has expired',
};

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function formatBackendTime(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
}

function conditionDescription(condition: SecurePayAgreementCondition): string {
  if (condition.conditionType === 'LOCATION') {
    const label = asString(condition.parameters.locationLabel);
    const radius = asFiniteNumber(condition.parameters.radiusMetres);
    const accuracy = asFiniteNumber(condition.parameters.accuracyThresholdMetres);
    const parts = [
      label ? `At ${label}` : 'At the agreed location',
      radius != null ? `within ${radius} m` : null,
      accuracy != null ? `GPS accuracy ${accuracy} m or better` : null,
    ].filter((part): part is string => Boolean(part));
    return parts.join(' · ');
  }

  if (condition.conditionType === 'TIME') {
    const start = formatBackendTime(condition.parameters.windowStart ?? condition.parameters.notBefore);
    const end = formatBackendTime(condition.parameters.windowEnd ?? condition.parameters.notAfter);
    if (start && end) return `From ${start} to ${end}`;
    if (start) return `Not before ${start}`;
    if (end) return `By ${end}`;
    return 'Agreed time condition';
  }

  return 'Agreement condition';
}

function EvaluationResult({ evaluation }: { evaluation: SecurePayConditionEvaluation }) {
  const known = STATUS_COPY[evaluation.status] ?? 'Condition checked';
  return (
    <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-3 py-2.5" role="status">
      <p className="text-xs font-semibold text-[#1a1a1a]/75">{known}</p>
      <p className="text-[11px] text-[#1a1a1a]/45 mt-0.5">
        Checked {new Date(evaluation.evaluatedAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
    </div>
  );
}

function ConditionRow({
  agreementId,
  condition,
  authHeader,
}: {
  agreementId: string;
  condition: SecurePayAgreementCondition;
  authHeader?: string;
}) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<SecurePayConditionEvaluation | null>(null);
  const keyRef = useRef(crypto.randomUUID());

  const checkTime = async () => {
    if (checking) return;
    setChecking(true);
    setError(null);
    try {
      const result = await evaluateTimeCondition(agreementId, condition.id, keyRef.current, authHeader);
      if (!result.ok || !result.data) {
        setError(result.error || 'SecurePay could not check this time condition.');
        return;
      }
      keyRef.current = crypto.randomUUID();
      setEvaluation(result.data);
    } finally {
      setChecking(false);
    }
  };

  const checkLocation = () => {
    if (checking) return;
    if (!navigator.geolocation) {
      setError('This device cannot provide location. Try from a device with location services.');
      return;
    }
    setChecking(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const result = await evaluateLocationCondition(
            agreementId,
            condition.id,
            keyRef.current,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracyMetres: position.coords.accuracy,
              capturedAt: new Date(position.timestamp).toISOString(),
            },
            authHeader,
          );
          if (!result.ok || !result.data) {
            setError(result.error || 'SecurePay could not check this location condition.');
            return;
          }
          keyRef.current = crypto.randomUUID();
          setEvaluation(result.data);
        } finally {
          setChecking(false);
        }
      },
      () => {
        setChecking(false);
        setError('Location permission was not granted. Allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const supported = condition.conditionType === 'TIME' || condition.conditionType === 'LOCATION';
  const Icon = condition.conditionType === 'LOCATION' ? MapPin : Clock3;

  return (
    <div className="rounded-xl border border-[#1a1a1a]/8 bg-[#fafaf8] p-3.5 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 w-7 h-7 rounded-lg bg-[#3a7a1f]/8 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-[#3a7a1f]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#1a1a1a]/80">
            {condition.conditionType === 'LOCATION' ? 'Where this must happen' : condition.conditionType === 'TIME' ? 'When this must happen' : 'Agreement condition'}
            {condition.required ? ' · required' : ''}
          </p>
          <p className="text-xs text-[#1a1a1a]/50 mt-0.5 leading-relaxed">{conditionDescription(condition)}</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
      {evaluation && <EvaluationResult evaluation={evaluation} />}

      {supported && (
        <button
          type="button"
          disabled={checking}
          onClick={condition.conditionType === 'LOCATION' ? checkLocation : checkTime}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#3a7a1f] text-white disabled:opacity-40"
        >
          {checking && <Loader2 size={12} className="animate-spin" />}
          {checking
            ? 'Checking…'
            : condition.conditionType === 'LOCATION'
              ? 'Check my location'
              : 'Check time'}
        </button>
      )}

      {condition.conditionType === 'LOCATION' && (
        <p className="text-[11px] text-[#1a1a1a]/40 leading-relaxed">
          Your device location is sent as a claim. SecurePay checks distance, GPS accuracy and freshness on the server.
        </p>
      )}
      {condition.conditionType === 'TIME' && (
        <p className="text-[11px] text-[#1a1a1a]/40 leading-relaxed">
          SecurePay checks this using server time; your device clock does not decide the result.
        </p>
      )}
    </div>
  );
}

export default function AgreementConditionsSection({ agreementId, obligationId, authHeader }: Props) {
  const [conditions, setConditions] = useState<SecurePayAgreementCondition[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAgreementConditions(agreementId, authHeader);
      if (!result.ok || !result.data) {
        setError(result.error || 'Agreement conditions could not be loaded.');
        return;
      }
      setConditions(result.data);
    } finally {
      setLoading(false);
    }
  }, [agreementId, authHeader]);

  useEffect(() => { void load(); }, [load]);

  const obligationConditions = useMemo(
    () => (conditions ?? []).filter(condition => condition.obligationId === obligationId),
    [conditions, obligationId],
  );

  return (
    <div className="pt-1 space-y-2.5">
      <div>
        <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Where & when</p>
        <p className="text-xs text-[#1a1a1a]/45 mt-0.5">Structured agreement conditions recorded by SecurePay.</p>
      </div>

      {loading && <p className="text-xs text-[#1a1a1a]/45">Loading conditions…</p>}
      {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
      {!loading && !error && obligationConditions.length === 0 && (
        <p className="text-xs text-[#1a1a1a]/40">No location or time condition is recorded for this obligation yet.</p>
      )}
      {obligationConditions.map(condition => (
        <ConditionRow key={condition.id} agreementId={agreementId} condition={condition} authHeader={authHeader} />
      ))}
    </div>
  );
}
