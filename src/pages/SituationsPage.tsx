import { Link } from 'react-router-dom';
import { ArrowRight, Building2, HardHat, Heart, Package, ShoppingBag, Store, Users } from 'lucide-react';
import AccountDropdown from '../components/AccountDropdown';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const situations = [
  {
    icon: HardHat, title: 'I am paying someone for work', tool: 'SecureLink', tone: 'One → one',
    what: 'You and the fundi or contractor need one clear record of the job, amount, timing and evidence.',
    means: 'The agreement can record obligations, milestones and proof. Creating it does not itself authorize funding or release.',
    next: 'Create the agreement. SecurePay will show the money action only when the backend says the signed-in participant may take it.',
    href: '/create/trade', action: 'Start the agreement',
  },
  {
    icon: ShoppingBag, title: 'I am buying or selling something', tool: 'SecureLink', tone: 'One → one',
    what: 'Two traders need to agree on the item, amount, delivery or collection and what counts as completion.',
    means: 'Both sides can work from the same agreement record instead of relying on chat messages alone.',
    next: 'Set up the SecureLink, invite the other trader and confirm the exact version you agree to.',
    href: '/create/trade', action: 'Create a SecureLink',
  },
  {
    icon: Package, title: 'I am supplying goods', tool: 'KeyContract', tone: 'Higher-value / structured',
    what: 'The trade may need delivery stages, documents, inspection, milestones or several obligations.',
    means: 'A stronger agreement record keeps the commercial terms and evidence together. Higher value never gives the browser more authority.',
    next: 'Start the agreement and use the structured conditions the backend makes available for that trade.',
    href: '/keycontract', action: 'Understand KeyContract',
  },
  {
    icon: Users, title: 'Many people are contributing to one purpose', tool: 'Group SecureLink', tone: 'Many → one',
    what: 'A group needs one stated purpose, organizers and contribution records.',
    means: 'Organizer status and contribution intentions are recorded separately from confirmed money and settlement.',
    next: 'Begin from the agreement that the Group SecureLink belongs to. Governance stays attached to that exact agreement.',
    href: '/situations', action: 'Understand Group SecureLink',
  },
  {
    icon: Heart, title: 'We are raising welfare or family support', tool: 'Group SecureLink', tone: 'Many → one',
    what: 'Contributors need to understand the purpose and who is organizing the support.',
    means: 'SecurePay can show the group record without pretending a pledge is a paid contribution.',
    next: 'Create the agreement context first, then operate the Group SecureLink under the supported governance.',
    href: '/situations', action: 'See the group journey',
  },
  {
    icon: Store, title: 'I need to pay several people from one agreement', tool: 'SecureFlow', tone: 'One → many',
    what: 'One trade needs a distribution plan with more than one beneficiary.',
    means: 'SecureFlow records who should receive what. The plan is not settlement and does not create money authority by itself.',
    next: 'Start or sign in to the relevant agreement. SecureFlow is available inside that exact agreement workspace where the backend supports it.',
    href: '/create', action: 'Start from the agreement',
  },
  {
    icon: Building2, title: 'A governed group must distribute to several people', tool: 'Group SecureFlow', tone: 'Many → many',
    what: 'The agreement combines group governance with a multi-beneficiary distribution plan.',
    means: 'The exact plan version and backend governance approval remain separate from settlement.',
    next: 'Start or sign in to the relevant agreement. Group SecureFlow appears inside its SecureFlow and governance workspace when supported.',
    href: '/create', action: 'Start from the agreement',
  },
];

export default function SituationsPage() {
  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#1a1a1a]">
      <header className="sticky top-0 z-50 border-b border-black/7 bg-[#fffdf8]/95 backdrop-blur-md"><div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8"><Link to="/" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link><div className="flex items-center gap-4"><Link to="/help" className="hidden text-sm font-medium text-black/55 hover:text-[#3a7a1f] sm:inline">Pricing</Link><AccountDropdown /></div></div></header>

      <main>
        <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto max-w-[980px] text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3a7a1f]">Start with your situation</p><h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">What are you trying to do in the Market?</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-black/56">You do not need to know SecurePay’s architecture. Find the trade that sounds like yours, then SecurePay takes you to the agreement or flow that fits.</p></div></section>

        <section className="px-4 py-12 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-[1120px] gap-4 md:grid-cols-2">{situations.map(({ icon: Icon, title, tool, tone, what, means, next, href, action }) => <article key={title} className="flex flex-col rounded-[26px] border border-black/7 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#edf6e8] text-[#3a7a1f]"><Icon size={21} /></span><span className="rounded-full bg-[#f5f1e8] px-3 py-1 text-[11px] font-bold text-black/48">{tone}</span></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#3a7a1f]">{tool}</p><h2 className="mt-1 font-display text-2xl">{title}</h2><dl className="mt-5 space-y-4 text-sm leading-6"><div><dt className="font-semibold text-black/80">What is happening</dt><dd className="mt-1 text-black/52">{what}</dd></div><div><dt className="font-semibold text-black/80">What it means</dt><dd className="mt-1 text-black/52">{means}</dd></div><div><dt className="font-semibold text-black/80">What you can do next</dt><dd className="mt-1 text-black/52">{next}</dd></div></dl><Link to={href} className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-[#3a7a1f]">{action}<ArrowRight size={15} /></Link></article>)}</div></section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1120px] flex-col gap-5 rounded-[28px] bg-[#173b20] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/48">Still not sure?</p><h2 className="mt-2 font-display text-2xl">Tell SecurePay what you want to trade.</h2><p className="mt-2 text-sm text-white/65">The agreement comes first. Sensitive and authority-bearing details are still enforced by the backend.</p></div><Link to="/create" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#173b20]">Start here<ArrowRight size={16} /></Link></div></section>
      </main>
    </div>
  );
}
