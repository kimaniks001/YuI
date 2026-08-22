import { ArrowLeft, MessageSquareText, Split, TriangleAlert } from 'lucide-react';
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
 * Authoritative agreement workspace. Existing agreement and money authority is
 * unchanged. MW-11/12 add navigation into consultation and recovery rooms; those
 * surfaces still depend on SecurePayAPI for every real state transition.
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
          {agreementId && <>
            <Link to={`/agreements/${agreementId}/consultation`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-700/15 px-4 text-sm font-semibold text-green-700 hover:bg-green-50">
              <MessageSquareText size={15} aria-hidden="true" /> Ask a Master
            </Link>
            <Link to={`/agreements/${agreementId}/recovery`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-700/15 px-4 text-sm font-semibold text-amber-800 hover:bg-amber-50">
              <TriangleAlert size={15} aria-hidden="true" /> Recovery & Resolution
            </Link>
          </>}
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
