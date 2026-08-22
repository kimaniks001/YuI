import { useState } from 'react';
import AgreementConditionsSection from './AgreementConditionsSection';
import StructuredConditionBuilder from './StructuredConditionBuilder';

interface Props {
  agreementId: string;
  obligationId: string;
  authHeader?: string;
}

export default function AgreementConditionWorkspace({ agreementId, obligationId, authHeader }: Props) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-3">
      <AgreementConditionsSection
        key={refreshKey}
        agreementId={agreementId}
        obligationId={obligationId}
        authHeader={authHeader}
      />

      {!showBuilder ? (
        <button
          type="button"
          onClick={() => setShowBuilder(true)}
          className="text-xs font-medium text-[#3a7a1f] hover:underline"
        >
          + Add where or when
        </button>
      ) : (
        <div className="space-y-2">
          <StructuredConditionBuilder
            agreementId={agreementId}
            obligationId={obligationId}
            authHeader={authHeader}
            onCreated={() => setRefreshKey(value => value + 1)}
          />
          <button
            type="button"
            onClick={() => setShowBuilder(false)}
            className="text-xs text-[#1a1a1a]/45 hover:text-[#1a1a1a]/70"
          >
            Close condition builder
          </button>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-[#1a1a1a]/35">
        SecurePay checks permission on the server when a condition is saved. Seeing this control does not mean you have authority to change the agreement.
      </p>
    </div>
  );
}
