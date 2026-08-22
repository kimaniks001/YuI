import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BookOpenCheck, Gamepad2, Scale, ShieldCheck } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';

/** MW-19B — final three-world boundary and launch-integration guidance. */
export default function MarketSafety() {
  return <TraderShell>
    <div className="mx-auto max-w-4xl space-y-6 py-4 sm:py-8">
      <section className="rounded-3xl border border-green-700/12 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-green-700"><ShieldCheck size={20} /><span className="text-xs font-bold uppercase tracking-[0.18em]">Three-world safety</span></div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">One SecurePay. Three clearly different worlds.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/60">The Market is real. Trainer teaches safely. Game simulates trade and life through consequences. The experience should feel familiar across all three, but their authority must never blur.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <World icon={<BadgeCheck size={19} />} title="Market" label="REAL" body="Authenticated SecurePayAPI truth. Real identity, agreements, money, evidence, consultation and recovery state live here." to="/" action="Enter Market" />
        <World icon={<BookOpenCheck size={19} />} title="Trainer" label="SIMULATED" body="Guided learning. It can demonstrate SecurePay journeys but securePayFetch blocks live API authority in this world." to="/trainer" action="Open Trainer" />
        <World icon={<Gamepad2 size={19} />} title="Game" label="SIMULATED" body="Practice economy, scenarios and competition. Game resources and rankings can never become Real Market financial or expertise truth." to="/game" action="Open Game" />
      </div>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-green-700"><Scale size={16} /> Launch boundary promises</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Promise title="Clients request. Backend decides." body="YUI may explain, guide and request actions. It cannot declare agreement authority, Payment Ready, release, settlement, consultation billing, Recovery outcome or real Master status." />
          <Promise title="Simulation stays simulation." body="Trainer and Game can carry only safe draft intent toward Market. Real identity, parties, payer, terms and financial authority are established again after authentication." />
          <Promise title="Masters advise. Parties decide." body="Real Market Master status is category-specific. Consultation and Recovery opinions do not create adjudication or financial authority." />
          <Promise title="Recovery is a process, not a verdict." body="Recovery & Resolution brings evidence, conversation and next actions together. SecurePay records the process without pretending to be a court or adjudicator." />
        </div>
      </section>

      <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Before Real Market action</p>
        <p className="mt-2 text-sm leading-6 text-ink/60">Check the world label, confirm who is acting, review the agreement terms, and rely on SecurePayAPI for the authoritative state. Money should follow the agreement.</p>
        <Link to="/market/continue" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Review Real Market bridge <ArrowRight size={15} /></Link>
      </section>
    </div>
  </TraderShell>;
}

function World({ icon, title, label, body, to, action }: { icon: React.ReactNode; title: string; label: string; body: string; to: string; action: string }) {
  return <article className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-green-700">{icon}<strong>{title}</strong></div><span className="rounded-full bg-[#f4f5f1] px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink/45">{label}</span></div><p className="mt-3 min-h-24 text-sm leading-6 text-ink/55">{body}</p><Link to={to} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-green-700">{action} <ArrowRight size={14} /></Link></article>;
}

function Promise({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl border border-ink/8 bg-[#fbfcf9] p-4"><strong className="text-sm text-ink">{title}</strong><p className="mt-1 text-xs leading-5 text-ink/50">{body}</p></div>;
}
