import { ArrowRight, FileText, Split, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderShell from '../components/trader/TraderShell';
import { useAuth } from '../lib/auth';

interface FlowCardProps {
  direction: string;
  name: string;
  plain: string;
  example: string;
  icon: React.ReactNode;
  actionTo: string;
  actionLabel: string;
}

export default function MarketFlows() {
  const { user, session } = useAuth();
  if (!user || !session) return <Navigate to="/" replace />;

  return <TraderShell>
    <TraderPageHeader eyebrow="Money flows" title={<>Choose the <span className="text-green-700">shape.</span></>} description="Start from the trade. The agreement keeps the people, conditions and money path together." />

    <div className="mb-4 rounded-2xl border border-green-700/10 bg-[#173b20] px-4 py-3 text-white"><strong className="font-display text-xl">Money should follow the agreement.</strong></div>

    <section className="grid gap-3 sm:grid-cols-2" aria-label="SecurePay money flows">
      <FlowCard direction="One → one" name="SecureLink" plain="One trader pays one trader" example="Buying a generator from one supplier." icon={<FileText size={19} />} actionTo="/dashboard#start-agreement" actionLabel="Start an agreement" />
      <FlowCard direction="Many → one" name="Group SecureLink" plain="Many people contribute to one" example="Family or group contributing to one purpose." icon={<Users size={19} />} actionTo="/agreements" actionLabel="Choose agreement" />
      <FlowCard direction="One → many" name="SecureFlow" plain="One agreement pays several" example="One buyer paying several suppliers." icon={<Split size={19} />} actionTo="/agreements" actionLabel="Choose agreement" />
      <FlowCard direction="Many → many" name="Group SecureFlow" plain="A group distributes to several" example="Governed contributions distributed to several recipients." icon={<Users size={19} />} actionTo="/agreements" actionLabel="Choose agreement" />
    </section>

    <details className="trader-progressive mt-4">
      <summary>How these flows work</summary>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-green-700/10 bg-white p-3"><strong className="text-sm">The agreement stays in charge</strong><p className="mt-1 text-xs leading-5 text-ink/50">Funding, conditions, evidence, Payment Ready, release and settlement remain attached to the exact agreement and backend authority.</p></div>
        <div className="rounded-xl border border-green-700/10 bg-white p-3"><strong className="text-sm">Identities stay separate</strong><p className="mt-1 text-xs leading-5 text-ink/50">A flow never merges traders, KSNumbers or ledger authority into a super-wallet.</p></div>
      </div>
    </details>
  </TraderShell>;
}

function FlowCard({ direction, name, plain, example, icon, actionTo, actionLabel }: FlowCardProps) {
  return <article className="market-link-card">
    <div className="flex items-start gap-3"><span className="market-section-icon">{icon}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">{plain}</p><span className="shrink-0 rounded-full bg-ink/[0.04] px-2 py-1 text-[10px] font-bold text-ink/50">{direction}</span></div><h2 className="mt-1 font-display text-2xl">{name}</h2><p className="mt-1 text-sm text-ink/55">{example}</p></div></div>
    <Link to={actionTo} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-green-700">{actionLabel} <ArrowRight size={14} /></Link>
  </article>;
}
