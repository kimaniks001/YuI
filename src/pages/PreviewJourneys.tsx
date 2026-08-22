import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Hammer,
  HandHeart,
  ShoppingCart,
  Users,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import type { CreationIntent } from '../lib/creationIntent';

const JOURNEYS: Array<{
  id: string;
  title: string;
  structure: string;
  description: string;
  icon: typeof ShoppingCart;
  accent: 'green' | 'orange';
  intent: CreationIntent;
}> = [
  {
    id: 'buy-sofas',
    title: 'Buy something',
    structure: 'One payer → one recipient',
    description: 'Buy sofas, agree delivery to Ruiru, and make the handover clear.',
    icon: ShoppingCart,
    accent: 'green',
    intent: {
      id: 'buy',
      family: 'trade',
      statement: 'I want to buy nice sofas from Gikomba for KES 35,000 and have them transported to Ruiru.',
      who: 'You (Buyer) → Furniture seller',
      what: 'Sofa purchase and delivery',
      amount: 'KES 35,000',
      mustHappen: 'Seller provides the sofas and the agreed delivery is confirmed',
      nextStep: 'Add the seller and agree the delivery terms',
      nextStepShort: 'Add the seller',
      moneyMoves: 'According to the agreed receipt and delivery conditions',
    },
  },
  {
    id: 'family-support',
    title: 'Support family together',
    structure: 'Many contributors → one purpose',
    description: 'Siblings contribute each month toward Mum’s support.',
    icon: HandHeart,
    accent: 'orange',
    intent: {
      id: 'family',
      family: 'life',
      statement: 'My four siblings and I support Mum every month with KES 15,000.',
      who: '5 siblings (Contributors) → Mum (Recipient)',
      what: 'Monthly family support',
      amount: 'KES 15,000 / month',
      mustHappen: 'Each person contributes their agreed share',
      nextStep: 'Invite family members and agree the monthly plan',
      nextStepShort: 'Invite family',
      moneyMoves: 'According to the agreed family support plan',
    },
  },
  {
    id: 'renovation',
    title: 'Pay several people',
    structure: 'One payer → many recipients',
    description: 'A renovation shared between a contractor, plumber and electrician.',
    icon: Hammer,
    accent: 'green',
    intent: {
      id: 'renovate',
      family: 'trade',
      statement: 'I am paying a contractor, plumber and electrician KES 180,000 for this renovation.',
      who: 'You (Payer) → Contractor, Plumber and Electrician',
      what: 'Renovation with multiple trades',
      amount: 'KES 180,000',
      mustHappen: 'Each tradesperson completes their agreed scope',
      nextStep: 'Set up allocations and invite each tradesperson',
      nextStepShort: 'Add tradespeople',
      moneyMoves: 'After each agreed scope is confirmed',
    },
  },
  {
    id: 'school-trip',
    title: 'Contribute and pay several suppliers',
    structure: 'Many contributors → many recipients',
    description: 'Parents contribute for a school trip that pays transport, food and venue providers.',
    icon: Users,
    accent: 'orange',
    intent: {
      id: 'contribute',
      family: 'life',
      statement: '20 parents are contributing KES 4,000 each to pay a bus company, caterer and venue for the school trip.',
      who: '20 parents (Contributors) → Bus, Caterer and Venue',
      what: 'School trip with multiple suppliers',
      amount: 'KES 4,000 per parent',
      mustHappen: 'Contributions and supplier obligations are clearly agreed',
      nextStep: 'Set up the group and invite parents',
      nextStepShort: 'Start the group',
      moneyMoves: 'According to the agreed contribution and supplier plan',
    },
  },
];

export default function PreviewJourneys() {
  return (
    <main className="journey-gallery-room min-h-screen bg-[#fffdf8] text-[#1a1a1a]">
      <header className="border-b border-[#e8e5dc] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/preview/home" aria-label="SecurePay preview home">
            <LivingSecurePayMark state="resting" size="md" presence="polite" />
          </Link>
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-orange-700">
            Journey experience · local only
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3a7a1f]">Experience SecurePay</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-6xl">Choose a market story and live the journey.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#1a1a1a]/55 sm:text-base">
            Pick a real market story and follow it at your own pace. There is no exam here — SecurePay adapts to what you are trying to do and carries your answers forward.
          </p>
          <div className="journey-gallery-affirmation mt-5">You bring the intention. SecurePay helps make the agreement clearer.</div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {JOURNEYS.map(({ id, title, structure, description, icon: Icon, accent, intent }) => {
            const orange = accent === 'orange';
            return (
              <Link
                key={id}
                to="/preview/create"
                state={{ intent }}
                className={`group rounded-[28px] border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${orange ? 'border-orange-200' : 'border-[#3a7a1f]/15'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`flex size-12 items-center justify-center rounded-2xl ${orange ? 'bg-orange-50 text-orange-600' : 'bg-[#edf6e7] text-[#2f7d20]'}`}>
                    <Icon size={23} strokeWidth={2} />
                  </span>
                  <ArrowRight size={18} className="mt-2 text-[#1a1a1a]/25 transition group-hover:translate-x-1 group-hover:text-[#3a7a1f]" />
                </div>
                <p className={`mt-5 text-[11px] font-bold uppercase tracking-[0.13em] ${orange ? 'text-orange-600' : 'text-[#3a7a1f]'}`}>{structure}</p>
                <h2 className="mt-1 font-display text-2xl leading-tight">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#1a1a1a]/55">{description}</p>
                <p className="mt-4 rounded-2xl bg-[#faf9f5] px-3.5 py-3 text-sm italic leading-5 text-[#1a1a1a]/60">“{intent.statement}”</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-[#3a7a1f]/10 bg-[#f4f8ef] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[#315f1c]">Or start with your own words.</p>
            <p className="mt-1 text-sm text-[#315f1c]/65">Return to the Market and type any real situation you want SecurePay to understand.</p>
          </div>
          <Link to="/preview/home" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#3a7a1f] px-5 text-sm font-semibold text-white">
            Go to the Market <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
