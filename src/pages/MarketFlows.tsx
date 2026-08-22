import { ArrowRight, FileText, Split, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import TraderShell from '../components/trader/TraderShell';
import { useAuth } from '../lib/auth';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

interface FlowCardProps {
  direction: string;
  name: string;
  plain: string;
  example: string;
  detail: string;
  icon: React.ReactNode;
  actionLabel: string;
  actionTo: string;
  note?: string;
}

export default function MarketFlows() {
  const { user, session } = useAuth();

  if (!user || !session) return <Navigate to="/" replace />;

  return (
    <TraderShell>
      <TraderPageHeader
        eyebrow="My Market · Money flows"
        title="How should the money move?"
        description="Start with the trading situation, not a product name. SecurePay uses the agreement to keep who pays, who receives, what must happen and what comes next clear."
      />

      <section className="rounded-3xl border border-green-700/10 bg-[#173b20] p-5 text-white shadow-sm sm:p-7" aria-labelledby="flow-principle">
        <div className="flex items-start gap-3">
          <LivingSecurePayMark state="guiding" size="md" presence="present" decorative />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">The Market principle</p>
            <h2 id="flow-principle" className="mt-1 font-display text-2xl sm:text-3xl">Money should follow the agreement.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">The four flows below describe direction only. Read them as paths through an agreement — never as proof that money has moved. Funding, Payment Ready, release and settlement remain backend-authoritative steps inside the exact agreement.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2" aria-label="SecurePay money flows">
        <FlowCard
          direction="One → one"
          name="SecureLink"
          plain="One trader pays one trader"
          example="You are buying a generator from one supplier."
          detail="Use a SecureLink to agree the amount, terms and what must happen before money follows the agreement."
          icon={<FileText size={21} aria-hidden="true" />}
          actionLabel="Start a SecureLink"
          actionTo="/create"
        />
        <FlowCard
          direction="Many → one"
          name="Group SecureLink"
          plain="Many people contribute to one agreement"
          example="Several people are contributing towards one purpose or supplier."
          detail="Group SecureLink governance lives inside the agreement workspace so organisers, contributors and approvals stay attached to the exact trade."
          icon={<Users size={21} aria-hidden="true" />}
          actionLabel="Open an agreement"
          actionTo="/agreements"
          note="Choose the agreement, then open Group SecureLink."
        />
        <FlowCard
          direction="One → many"
          name="SecureFlow"
          plain="One agreement pays several people"
          example="A buyer needs to pay three suppliers from the same agreement."
          detail="SecureFlow creates the distribution plan under the agreement: who should receive what, for what purpose, and which plan version is current."
          icon={<Split size={21} aria-hidden="true" />}
          actionLabel="Choose an agreement"
          actionTo="/agreements"
          note="SecureFlow is available inside the agreement workspace."
        />
        <FlowCard
          direction="Many → many"
          name="Group SecureFlow"
          plain="A governed group distributes to several people"
          example="A group contributes under agreed governance and the agreement distributes to multiple recipients."
          detail="Group SecureFlow keeps the distribution plan and the exact governance approval together. The browser does not decide quorum or funding authority."
          icon={<Users size={21} aria-hidden="true" />}
          actionLabel="Choose an agreement"
          actionTo="/agreements"
          note="A Group SecureLink and backend-authorised governance are required where the flow calls for them."
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Where the work happens</p>
          <h2 className="mt-1 font-display text-2xl">The agreement is the operating room for the trade.</h2>
          <p className="mt-3 text-sm leading-6 text-ink/55">Funding, Where & When conditions, evidence, Group SecureLink, SecureFlow, Agreement Review, Payment Ready, release and settlement all belong to the agreement they affect. R14.5 brings that workspace into the same Market shell instead of presenting it like a separate legacy application.</p>
          <Link to="/agreements" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-green-700/20 px-4 text-sm font-semibold text-green-700 hover:bg-green-50">
            Go to my agreements <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Keep identities separate</p>
          <h2 className="mt-1 font-display text-xl">A flow never becomes a super-wallet.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">Every agreement, payer, recipient, KSNumber, approval and ledger record keeps its own backend authority. My Market improves visibility and navigation; it does not merge money or identities.</p>
        </div>
      </section>
    </TraderShell>
  );
}

function FlowCard({ direction, name, plain, example, detail, icon, actionLabel, actionTo, note }: FlowCardProps) {
  return (
    <article className="flex min-h-[300px] flex-col rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">{icon}</span>
        <span className="rounded-full bg-ink/[0.04] px-3 py-1 text-xs font-bold text-ink/55">{direction}</span>
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-green-700">{plain}</p>
      <h2 className="mt-1 font-display text-2xl">{name}</h2>
      <p className="mt-2 text-sm font-medium text-ink/75">{example}</p>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink/55">{detail}</p>
      {note && <p className="mt-3 rounded-xl bg-[#f8f5ed] p-3 text-xs leading-5 text-ink/50">{note}</p>}
      <Link to={actionTo} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">
        {actionLabel} <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}
