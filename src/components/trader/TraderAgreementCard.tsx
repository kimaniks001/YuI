import { ArrowRight, CalendarDays, Handshake } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CurrentUserAgreementSummary } from '../../api/securepayTypes';
import { agreementStatusLabel } from '../../lib/agreementStateLanguage';
import { formatDecimalMinorMoney } from '../../lib/formatMinorMoney';

export default function TraderAgreementCard({ agreement, compact = false }: { agreement: CurrentUserAgreementSummary; compact?: boolean }) {
  const date = agreement.updatedAt || agreement.createdAt;
  const amount = agreement.proposedAmountMinor != null && agreement.currency != null
    ? formatDecimalMinorMoney(agreement.currency, agreement.proposedAmountMinor)
    : null;
  const role = agreement.currentActor?.roleCode ?? null;
  return (
    <Link to={`/agreements/${encodeURIComponent(agreement.agreementId)}`} className="market-row-living group my-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
      <article className={`grid w-full gap-4 ${compact ? 'sm:grid-cols-[1fr_auto]' : 'md:grid-cols-[minmax(0,1.6fr)_minmax(130px,.7fr)_minmax(150px,.8fr)_auto]'}`}>
        <div className="flex min-w-0 items-start gap-3">
          <span className="market-section-icon mt-0.5"><Handshake size={18} /></span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-ink">{agreement.title}</h3>
            <p className="mt-1 truncate font-mono text-xs text-ink/40">{agreement.publicReference}</p>
          </div>
        </div>
        {!compact && <div><p className="text-[11px] uppercase tracking-wider text-ink/35">Your role</p><p className="mt-1 text-sm text-ink/55">{role ?? 'Not provided'}</p></div>}
        <div>
          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">{agreementStatusLabel(agreement.status)}</span>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/45"><CalendarDays size={13} /> {new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="font-semibold tabular-nums text-green-900">{amount ?? 'Amount unavailable'}</p>
          <span aria-hidden="true" className="text-green-700 transition group-hover:translate-x-1"><ArrowRight size={17} /></span>
        </div>
      </article>
    </Link>
  );
}
