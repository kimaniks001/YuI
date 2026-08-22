import { Link } from 'react-router-dom';
import { ArrowRight, Banknote, Code2, FileCheck2, HeartHandshake, Home, KeyRound, LayoutGrid, ListChecks, MessageCircle, Network, ShieldCheck, ShoppingBag, Sparkles, Sun, UserPlus } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const reviewItems = [
  { to: '/preview/home', title: 'Signed-out Home', note: 'Approved Bolt direction · possibility first', icon: Home },
  { to: '/preview/journeys', title: 'Experience journeys', note: 'Four market stories · full creation logic · no login', icon: Sparkles },
  { to: '/preview/trader-home', title: 'Signed-in Trader Home', note: 'Your market · needs you · moving · circle', icon: Home },
  { to: '/preview/market', title: 'My Market', note: 'Attention-first trader operating space', icon: LayoutGrid },
  { to: '/preview/workspace', title: 'Agreement workspace', note: 'All four topologies and lifecycle states', icon: FileCheck2 },
  { to: '/preview/joining', title: 'Invitation & joining', note: 'Invitation → identity → join → confirm', icon: UserPlus },
  { to: '/preview/store', title: 'KS Digital Store', note: 'Public identity → offers → agreement', icon: ShoppingBag },
  { to: '/preview/money', title: 'Money rooms', note: 'Funding → confirmation → Payment Ready → settlement', icon: Banknote },
  { to: '/preview/flows-community', title: 'Flows & community', note: 'SecureFlow paths · Group governance · Circle · growth', icon: Network },
  { to: '/preview/review-recovery', title: 'Reviews & recovery', note: 'Questions · evidence · resolution · payment exceptions', icon: MessageCircle },
  { to: '/preview/operational', title: 'Operational journey', note: 'Payment, evidence, confirmation, release and review states', icon: ListChecks },
  { to: '/preview/developers', title: 'Developer journey', note: 'Business intent → sandbox connection', icon: Code2 },
  { to: '/preview/signin', title: 'Sign in', note: 'KSNumber + password + OTP', icon: KeyRound },
  { to: '/preview/signup', title: 'Create KSNumber', note: 'Public onboarding journey', icon: ShieldCheck },
  { to: '/preview/help', title: 'Help', note: 'Customer language and guidance', icon: HeartHandshake },
  { to: '/preview/trust', title: 'Trust', note: 'Product boundaries and confidence', icon: ShieldCheck },
  { to: '/preview/themes', title: 'Market atmosphere', note: 'Four stable themes · opening ritual · invariant truth', icon: Sun },
  { to: '/preview/certification', title: 'Visual certification', note: 'All 11 batches · final visual gate', icon: ListChecks },
];

export default function ReviewGallery() {
  return (
    <main className="min-h-screen bg-[#f7f4ec] text-ink">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-5 border-b border-ink/8 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <LivingSecurePayMark state="resting" size="md" presence="polite" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-green-700">Local visual approval room</p>
            <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">One screen at a time.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/55">These are fixture-backed or public YUI v1 training surfaces. They do not create payment, settlement, release, identity, verification or agreement truth. Explorer mode intentionally requires no authentication and blocks live API calls.</p>
          </div>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-green-700/15 bg-white px-4 text-sm font-semibold text-green-700">Open Market Home <ArrowRight size={15} /></Link>
        </div>

        <div className="grid gap-3 py-7 sm:grid-cols-2 lg:grid-cols-3">
          {reviewItems.map(({ to, title, note, icon: Icon }) => (
            <Link key={to} to={to} className="group rounded-3xl border border-ink/8 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-700/20 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-green-50 text-green-700"><Icon size={20} /></span>
                <ArrowRight size={17} className="mt-1 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-green-700" />
              </div>
              <h2 className="mt-5 text-base font-bold text-ink/80">{title}</h2>
              <p className="mt-1 text-sm leading-5 text-ink/45">{note}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          In YUI v1 Explorer this review room is available for training and education. When the real authenticated application is certified, Explorer mode can remain as a separate non-money training environment.
        </div>
      </div>
    </main>
  );
}
