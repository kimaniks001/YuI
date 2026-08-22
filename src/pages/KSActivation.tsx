import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  HeartPulse,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

type AccountType = 'personal' | 'business';

const activationAmounts = {
  personal: { reserve: 200, settlementTest: 100, subscription: 100, total: 400 },
  business: { reserve: 200, settlementTest: 100, subscription: 200, total: 500 },
} as const;

export default function KSActivation({ previewMode = false }: { previewMode?: boolean }) {
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const amounts = activationAmounts[accountType];
  const label = accountType === 'personal' ? 'Personal KSNumber' : 'Business KSNumber';
  const monthly = accountType === 'personal' ? 'KES 100/month' : 'KES 200/month';

  const summary = useMemo(() => [
    {
      title: 'Trade Dispute Reserve',
      amount: `KES ${amounts.reserve}`,
      marketTitle: 'If a trade ever needs a fair review',
      detail: 'Sometimes goods arrive differently from what was agreed, work is questioned, or two traders remember the deal differently. This reserve means your KSNumber already has support for the trade-dispute review process when a genuine disagreement comes up.',
      note: 'It is sent to the Keyman Oak pooled Trade Dispute Reserve and is accounted for separately from subscription revenue.',
      icon: ShieldCheck,
    },
    {
      title: 'Settlement Account test',
      amount: `KES ${amounts.settlementTest}`,
      marketTitle: 'Let us first make sure your money can reach you',
      detail: 'Before real trade proceeds can be settled to you, SecurePay sends KES 100 to the Settlement Account you choose. Think of it like confirming the delivery address before sending the valuable package.',
      note: 'The KES 100 is yours. It is not a fee. Your KSNumber becomes active only after SecurePay confirms that the Settlement Account received it.',
      icon: Landmark,
    },
    {
      title: 'Monthly subscription',
      amount: `KES ${amounts.subscription}`,
      marketTitle: 'Keep your place in the market active',
      detail: `This keeps your ${label.toLowerCase()} active for the current month so you can continue using SecurePay to make agreements, trade and build your record in the market.`,
      note: `Your ongoing subscription is ${monthly}. This is the monthly service fee in the activation split.`,
      icon: CircleDollarSign,
    },
  ], [amounts.reserve, amounts.settlementTest, amounts.subscription, label, monthly]);

  return (
    <div className="min-h-screen bg-[#fffdf8] text-ink">
      <header className="border-b border-ink/8 bg-white">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link>
          <Link to={previewMode ? '/preview/trader-home' : '/dashboard'} className="text-sm font-semibold text-green-700">Go to SecurePay</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)] lg:items-start">
          <div>
            <div className="activation-guidance"><LivingSecurePayMark state="guiding" size="md" presence="present" label="SecurePay is guiding activation" /><span>We will explain what each amount does before you choose anything.</span></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-green-700">Activate your KSNumber</p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Welcome to the Market.</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/60">You are the trader. SecurePay is the market. Before you start trading, we put a few important things in place for you: who you are, where your money should reach you, and support if a trade ever needs review.</p>

            <div className="mt-7 rounded-2xl border border-ink/8 bg-white p-2 shadow-sm" role="group" aria-label="Choose KSNumber type">
              <div className="grid grid-cols-2 gap-2">
                {(['personal', 'business'] as AccountType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    aria-pressed={accountType === type}
                    className={`min-h-12 rounded-xl px-4 text-sm font-semibold transition ${accountType === type ? 'bg-green-700 text-white' : 'text-ink/60 hover:bg-green-50'}`}
                  >
                    {type === 'personal' ? 'Personal' : 'Business'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-green-700/10 bg-green-50/60 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">To enter the market today</p>
            <p className="mt-2 font-display text-4xl">KES {amounts.total}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/55">Three amounts, three different jobs. We explain each one before you activate. Only the subscription is a monthly service fee.</p>
          </aside>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Activation payment breakdown">
          {summary.map(({ title, amount, marketTitle, detail, note, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-full bg-green-50 text-green-700"><Icon size={19} /></span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-green-700">{title}</p>
              <p className="mt-1 font-display text-2xl">{amount}</p>
              <h2 className="mt-4 font-display text-xl leading-snug">{marketTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{detail}</p>
              <p className="mt-3 border-t border-ink/8 pt-3 text-xs leading-relaxed text-ink/45">{note}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="settlement-heading">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Where your money should reach you</p>
          <h2 id="settlement-heading" className="mt-1 font-display text-3xl">Choose one trusted Settlement Account.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/60">You may have several places where you can receive money, but SecurePay needs one verified Settlement Account for settled trade proceeds. When an agreement matures and settlement is authorized, the money can go only there.</p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Destination icon={<Building2 size={18} />} title="Bank account" detail="Use an eligible bank account that can receive your settlements." />
            <Destination icon={<Smartphone size={18} />} title="Mobile money" detail="Use an active mobile-money number. Your provider's transaction and account limits still apply." />
            <Destination icon={<WalletCards size={18} />} title="Digital Wallet / current account" detail="Use a personal or current account from Choice Bank or another approved partner after completing that provider's onboarding. The account belongs to you." />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoCard icon={<BadgeCheck size={18} />} title="We test it before real settlements" detail="SecurePay sends KES 100 to the Settlement Account you choose. Once it arrives and SecurePay confirms receipt, we know this is a working place to send your future settled money." />
            <InfoCard icon={<LockKeyhole size={18} />} title="Changing it is protected" detail="Because this is where your trade proceeds go, changing the Settlement Account requires stronger verification. Your current verified account remains the trusted destination until the change is safely completed." />
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-green-700/10 bg-green-50/50 p-5 sm:p-6" aria-labelledby="health-heading">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-green-700 shadow-sm"><HeartPulse size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Your KSNumber health</p>
              <h2 id="health-heading" className="mt-1 font-display text-3xl">Healthy means you are ready to trade.</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              ['Identity', 'People in the market can know who they are dealing with.'],
              ['Settlement Account', 'If money becomes due to you, SecurePay has a verified place it can safely reach you within provider limits.'],
              ['Trade Dispute Reserve', 'If a genuine disagreement comes up, your trade has access to the review process supported by your reserve.'],
              ['Subscription', `Your place in the SecurePay market is current (${monthly}).`],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-xl border border-green-700/10 bg-white p-4">
                <div className="flex items-start gap-3"><LivingSecurePayMark state="success" size="sm" presence="polite" label={`${title} is healthy`} /><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-sm leading-relaxed text-ink/55">{detail}</p></div></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink/45">We only show an item as healthy after SecurePay has confirmed it. We do not guess whether your reserve, settlement account, subscription or activation is okay.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-display text-2xl">Before your first trade</h2>
          <div className="mt-4 space-y-3">
            {[
              ['1', 'Know who is trading', 'Confirm the identity attached to your KSNumber.'],
              ['2', 'Tell us where your money should reach you', 'Choose an eligible bank, mobile-money or partner Digital Wallet/current account as your Settlement Account.'],
              ['3', 'Put your trade protection in place', `KES ${amounts.reserve} supports the trade-dispute review process if a genuine disagreement comes up.`],
              ['4', 'Test your Settlement Account', `KES ${amounts.settlementTest} is sent there so SecurePay can confirm it can receive your money. The money remains yours.`],
              ['5', 'Keep your place in the market active', `Your ${accountType} subscription is KES ${amounts.subscription} for the current month.`],
            ].map(([number, title, detail]) => (
              <div key={number} className="flex gap-3 rounded-xl border border-ink/8 p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">{number}</span>
                <div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-sm text-ink/55">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="activation-caution mt-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <LivingSecurePayMark state="caution" size="md" presence="commanding" label="Activation connection is not available yet" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Activation is not connected yet</p>
            <h2 className="mt-1 font-display text-2xl">You can understand the journey today. We will not pretend the money has moved.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/60">The full destination, KES 100 confirmation, reserve posting and activation workflow still needs backend support. Until that is connected, SecurePay will not fake an STK prompt or tell you that your KSNumber is active.</p>
          </div>
          <Link to={previewMode ? '/preview/trader-home' : '/dashboard'} className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-green-700">Back to SecurePay <ArrowRight size={15} /></Link>
        </section>
      </main>
    </div>
  );
}

function Destination({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <article className="rounded-xl border border-ink/8 bg-green-50/30 p-4"><span className="flex size-10 items-center justify-center rounded-full bg-white text-green-700 shadow-sm">{icon}</span><h3 className="mt-3 font-display text-lg">{title}</h3><p className="mt-1 text-sm leading-relaxed text-ink/55">{detail}</p></article>;
}

function InfoCard({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <article className="rounded-xl border border-ink/8 bg-white p-4"><div className="flex gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">{icon}</span><div><h3 className="font-display text-lg">{title}</h3><p className="mt-1 text-sm leading-relaxed text-ink/55">{detail}</p></div></div></article>;
}
