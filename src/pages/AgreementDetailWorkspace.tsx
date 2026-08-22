import { ArrowLeft, Split } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AgreementConditionsRouteSection from '../components/agreement/AgreementConditionsRouteSection';
import SecureFlowSection from '../components/agreement/SecureFlowSection';
import TraderShell from '../components/trader/TraderShell';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { useAuth } from '../lib/auth';
import AgreementDetail from './AgreementDetail';
import '../market-convergence.css';
import '../batch4-agreement-workspace.css';

/**
 * R14.5 route-level convergence for the authoritative agreement workspace.
 * The existing AgreementDetail keeps all backend-owned R1-R6 authority;
 * R7 SecureFlow and R8 structured location/time remain composed onto the same
 * /agreements/:agreementId route. R14.5 changes navigation/presentation only.
 */
export default function AgreementDetailWorkspace() {
  const { agreementId: rawAgreementId } = useParams<{ agreementId?: string }>();
  const agreementId = rawAgreementId?.trim() || null;
  const { session } = useAuth();
  const authHeader = session?.accessToken;

  return (
    <TraderShell>
      <div className="b4-live-workspace-guide">
        <LivingSecurePayMark state="guiding" size="md" presence="polite" />
        <div>
          <strong>Your agreement workspace</strong>
          <span>Everything tied to this agreement stays together — people, work, proof, money state and the next action.</span>
        </div>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white px-4 py-3 shadow-sm sm:px-5">
        <Link to="/agreements" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink/60 hover:text-green-700">
          <ArrowLeft size={15} aria-hidden="true" /> All agreements
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/market/flows" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-700/15 px-4 text-sm font-semibold text-green-700 hover:bg-green-50">
            <Split size={15} aria-hidden="true" /> How money moves
          </Link>
          {agreementId && authHeader && (
            <a href="#agreement-money-flow" className="inline-flex min-h-11 items-center rounded-full bg-green-700 px-4 text-sm font-semibold text-white hover:bg-green-800">
              SecureFlow
            </a>
          )}
        </div>
      </div>

      <div className="sp-market-agreement-workspace">
        <AgreementDetail />
        {agreementId && authHeader && (
          <div className="mx-auto -mt-4 max-w-4xl space-y-6 pb-10">
            <AgreementConditionsRouteSection agreementId={agreementId} authHeader={authHeader} />
            <div id="agreement-money-flow" className="sp-market-flow-anchor">
              <SecureFlowSection agreementId={agreementId} authHeader={authHeader} />
            </div>
          </div>
        )}
      </div>
    </TraderShell>
  );
}
