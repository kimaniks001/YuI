import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  Code2,
  FileCheck2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Network,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { marketSignInHref, saveMarketDraftIntent } from '../lib/worldMode';
import { resetTrainerSession, setTrainerRole, type TrainerSessionState } from '../lib/trainerSession';

type RoleId = TrainerSessionState['role'];

const roles: Array<{
  id: RoleId;
  title: string;
  description: string;
  icon: typeof GraduationCap;
}> = [
  { id: 'plug', title: 'Plug / Trainer', description: 'Teach a trader, show the flow, then help them enter the real Market safely.', icon: GraduationCap },
  { id: 'trader', title: 'Trader', description: 'Learn how a buyer, seller or service provider moves from intention to agreement.', icon: ShoppingBag },
  { id: 'staff', title: 'SecurePay staff', description: 'Practise explaining states, boundaries and next actions in human language.', icon: ShieldCheck },
  { id: 'developer', title: 'Developer', description: 'Understand the customer journey before wiring the SecurePay engine underneath.', icon: Code2 },
  { id: 'partner', title: 'Partner', description: 'See how identity, agreements and payment authority stay separate.', icon: Handshake },
];

const journeys = [
  {
    title: 'Buy or sell with a SecureLink',
    structure: 'One payer → one recipient',
    description: 'Start with a familiar trade, make the terms clear, then see what happens next.',
    to: '/trainer/create?intent=I%20want%20to%20buy%20200%20bags%20of%20cement%20and%20have%20them%20delivered%20to%20Ruiru',
    icon: FileCheck2,
  },
  {
    title: 'Collect together for one purpose',
    structure: 'Many contributors → one purpose',
    description: 'See how a family, church, chama or community can organise a shared contribution.',
    to: '/trainer/flows',
    icon: Users,
  },
  {
    title: 'Pay several people clearly',
    structure: 'One payer → many obligations',
    description: 'Walk through a renovation shared between a contractor, plumber and electrician.',
    to: '/trainer/flows',
    icon: Network,
  },
  {
    title: 'Recover when something goes wrong',
    structure: 'Agreement → evidence → Recovery & Resolution',
    description: 'Practise the conversation when people disagree without turning SecurePay into the judge.',
    to: '/trainer/recovery',
    icon: HeartHandshake,
  },
];

const demonstrations = [
  { title: 'KS Store', note: 'Identity, offers and availability — listing is not a sale.', to: '/trainer/store', icon: ShoppingBag },
  { title: 'Agreement', note: 'Who, what, amount, conditions and next action.', to: '/trainer/agreement', icon: FileCheck2 },
  { title: 'Group & SecureFlow', note: 'Contributions, governance and allocations stay distinct.', to: '/trainer/flows', icon: Network },
  { title: 'Money rooms', note: 'Learn the states without creating money truth.', to: '/trainer/money', icon: Store },
  { title: 'Recovery & Resolution', note: 'Evidence and options without adjudication.', to: '/trainer/recovery', icon: HeartHandshake },
  { title: 'Developer view', note: 'Build the experience; SecurePay protects the truth.', to: '/trainer/developers', icon: Code2 },
];

export default function TrainerHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleId>('plug');

  const chooseRole = (nextRole: RoleId) => {
    setRole(nextRole);
    setTrainerRole(nextRole);
  };

  const startGuidedSession = () => {
    resetTrainerSession(role);
    navigate('/trainer/session');
  };

  const tryForReal = () => {
    saveMarketDraftIntent('trainer', `${location.pathname}${location.search}`, '/create');
    navigate(marketSignInHref('/create'));
  };

  return (
    <main className="min-h-screen bg-[#fffdf8] pb-28 text-[#1a1a1a]">
      <section className="border-b border-[#e8e5dc] bg-[radial-gradient(circle_at_top_right,rgba(230,118,30,0.12),transparent_34%),radial-gradient(circle_at_top_left,rgba(58,122,31,0.12),transparent_38%)] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3a7a1f]/15 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#315f1c]">
              <GraduationCap size={14} /> SecurePay Trainer · simulated learning world
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] sm:text-6xl">
              Learn the Market by <span className="text-[#3a7a1f]">doing it.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#1a1a1a]/62 sm:text-base">
              Pick a role, choose a real-life journey and practise the whole SecurePay story. Everything here is simulated: no KS identity, agreement, payment, Payment Ready, release, settlement or reward truth is created.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={startGuidedSession} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#3a7a1f] px-6 text-sm font-semibold text-white shadow-sm">
                <PlayCircle size={18} /> Start guided session
              </button>
              <Link to="/trainer/map" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1a1a1a]/12 bg-white px-6 text-sm font-semibold text-[#1a1a1a]/75">
                Explore all demo rooms <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <aside className="rounded-[30px] border border-[#3a7a1f]/12 bg-white/90 p-5 shadow-[0_18px_60px_rgba(37,70,30,0.10)] sm:p-6">
            <div className="flex items-center gap-3">
              <LivingSecurePayMark state="guiding" size="md" presence="present" />
              <div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#3a7a1f]">A simple teaching promise</p><h2 className="font-display text-2xl">What happened → what it means → what can I do next?</h2></div>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-2xl bg-[#f4f8ef] p-4"><strong>1. Start with intention.</strong><p className="mt-1 text-[#1a1a1a]/58">The trader does not need to know product names first.</p></div>
              <div className="rounded-2xl bg-[#fff6ed] p-4"><strong>2. Show the agreement underneath.</strong><p className="mt-1 text-[#1a1a1a]/58">People, purpose, responsibilities, evidence and money conditions become visible.</p></div>
              <div className="rounded-2xl bg-[#f7f6f2] p-4"><strong>3. Keep authority truthful.</strong><p className="mt-1 text-[#1a1a1a]/58">A demo can explain Payment Ready. It can never declare real Payment Ready.</p></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e6761e]">Choose how you are learning</p><h2 className="mt-1 font-display text-3xl">Whose shoes are you wearing?</h2></div>
          <span className="text-xs text-[#1a1a1a]/45">Your choice changes the teaching emphasis, not Market authority.</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {roles.map(({ id, title, description, icon: Icon }) => (
            <button key={id} type="button" onClick={() => chooseRole(id)} aria-pressed={role === id} className={`min-h-40 rounded-3xl border p-4 text-left transition ${role === id ? 'border-[#3a7a1f] bg-[#f1f7ed] shadow-sm' : 'border-[#1a1a1a]/10 bg-white hover:border-[#3a7a1f]/35'}`}>
              <Icon size={21} className={role === id ? 'text-[#3a7a1f]' : 'text-[#1a1a1a]/38'} />
              <strong className="mt-4 block text-sm">{title}</strong>
              <span className="mt-2 block text-xs leading-5 text-[#1a1a1a]/55">{description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3a7a1f]">Journey picker</p><h2 className="mt-1 font-display text-3xl">Start from a situation people already know.</h2></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {journeys.map(({ title, structure, description, to, icon: Icon }) => (
            <Link key={title} to={to} className="group rounded-[28px] border border-[#1a1a1a]/9 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3a7a1f]/30 hover:shadow-md">
              <div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#f2f7ee] text-[#3a7a1f]"><Icon size={21} /></span><ArrowRight size={17} className="text-[#1a1a1a]/25 transition group-hover:translate-x-1 group-hover:text-[#3a7a1f]" /></div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e6761e]">{structure}</p>
              <h3 className="mt-1 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#1a1a1a]/55">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-[34px] bg-[#173b20] p-5 text-white sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d7f0c8]">Plug-led demonstration shelf</p>
              <h2 className="mt-2 font-display text-3xl">Teach the complete story without leaving Trainer.</h2>
              <p className="mt-3 text-sm leading-6 text-white/65">Open any room independently, or use the guided session when you are teaching someone from beginning to end.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {demonstrations.map(({ title, note, to, icon: Icon }) => (
                <Link key={title} to={to} className="group rounded-2xl border border-white/12 bg-white/7 p-4 transition hover:bg-white/12">
                  <div className="flex items-center justify-between"><Icon size={18} className="text-[#d7f0c8]" /><ArrowRight size={14} className="text-white/40 transition group-hover:translate-x-1" /></div>
                  <strong className="mt-3 block text-sm">{title}</strong>
                  <span className="mt-1 block text-xs leading-5 text-white/58">{note}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col gap-5 rounded-[30px] border border-orange-200 bg-[#fff6ed] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex gap-3"><span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#e6761e]"><BookOpenCheck size={20} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#e6761e]">Ready for the real Market?</p><h2 className="mt-1 font-display text-2xl">Carry the intention, not the simulation.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#1a1a1a]/58">SecurePay will ask you to sign in again. Real KS identity, consent, agreement and money state are re-established from Market authority.</p></div></div>
          <button type="button" onClick={tryForReal} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#e6761e] px-5 text-sm font-semibold text-white">
            Try it for real <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}
