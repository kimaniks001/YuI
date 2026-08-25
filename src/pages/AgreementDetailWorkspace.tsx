import { ArrowLeft, LifeBuoy, Split, UserRoundSearch } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import AgreementConditionsRouteSection from '../components/agreement/AgreementConditionsRouteSection';
import SecureFlowSection from '../components/agreement/SecureFlowSection';
import TraderShell from '../components/trader/TraderShell';
import { useAuth } from '../lib/auth';
import AgreementDetail from './AgreementDetail';
import '../market-convergence.css';
import '../batch4-agreement-workspace.css';

export default function AgreementDetailWorkspace() {
  const { agreementId: rawAgreementId } = useParams<{ agreementId?: string }>();
  const agreementId = rawAgreementId?.trim() || null;
  const { session } = useAuth();
  const authHeader = session?.accessToken;

  return <TraderShell>
    <div className="mb-3 flex items-center justify-between gap-3"><Link to="/agreements" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Agreements</Link><span className="hidden text-xs text-ink/40 sm:block">Everything here belongs to this agreement.</span></div>

    <div className="trader-workspace-actions mb-3 flex gap-2 overflow-x-auto pb-1">
      {agreementId && authHeader && <><Link to={`/agreements/${agreementId}/consultation`} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-green-700/15 bg-white px-3 text-xs font-semibold text-green-700"><UserRoundSearch size={14} /> Ask a Master</Link><Link to={`/agreements/${agreementId}/recovery`} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-amber-700/15 bg-white px-3 text-xs font-semibold text-amber-800"><LifeBuoy size={14} /> Recovery</Link></>}
      <Link to="/market/flows" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-green-700/15 bg-white px-3 text-xs font-semibold text-green-700"><Split size={14} /> Money flow</Link>
      {agreementId && authHeader && <a href="#agreement-money-flow" className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-green-700 px-3 text-xs font-semibold text-white">SecureFlow</a>}
    </div>

    <div className="sp-market-agreement-workspace">
      <AgreementDetail />
      {agreementId && authHeader && <div className="mx-auto -mt-4 max-w-4xl space-y-4 pb-10"><AgreementConditionsRouteSection agreementId={agreementId} authHeader={authHeader} /><div id="agreement-money-flow" className="sp-market-flow-anchor"><SecureFlowSection agreementId={agreementId} authHeader={authHeader} /></div></div>}
    </div>
  </TraderShell>;
}
