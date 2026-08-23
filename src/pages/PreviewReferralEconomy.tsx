import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Copy,
  GraduationCap,
  Share2,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const previewRelationships = [
  {
    relationshipId: 'preview-1',
    referredKsNumber: 'KS10482',
    status: 'QUALIFIED',
    createdAt: '2026-01-18T10:00:00Z',
    activatedAt: '2026-01-20T10:00:00Z',
    qualifiedAt: '2026-03-04T08:30:00Z',
    rewardAmountMinor: 4200,
    rewardCurrency: 'KES',
    qualificationExplanation: 'Qualifying trade settlement was recorded by SecurePay.',
    pricingVersion: 'pricing-v1',
    referralRuleVersion: 'referral-v1',
    settlementEvidenceReference: 'SETTLEMENT-PREVIEW-10482',
  },
  {
    relationshipId: 'preview-2',
    referredKsNumber: 'KS11807',
    status: 'ACTIVATED',
    createdAt: '2026-04-02T13:00:00Z',
    activatedAt: '2026-04-03T13:00:00Z',
    qualifiedAt: null,
    rewardAmountMinor: null,
    rewardCurrency: null,
    qualificationExplanation: null,
    pricingVersion: null,
    referralRuleVersion: null,
    settlementEvidenceReference: null,
  },
  {
    relationshipId: 'preview-3',
    referredKsNumber: 'KS12641',
    status: 'REFERRED',
    createdAt: '2026-07-11T09:00:00Z',
    activatedAt: null,
    qualifiedAt: null,
    rewardAmountMinor: null,
    rewardCurrency: null,
    qualificationExplanation: null,
    pricingVersion: null,
    referralRuleVersion: null,
    settlementEvidenceReference: null,
  },
] as const;

function money(minor: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(minor / 100);
}

function PreviewBanner({ room }: { room: string }) {
  return <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
    <strong>PREVIEW · SIMULATED</strong>
    <span className="ml-2">{room} uses example data only. No login, API write, reward, agreement or money state is created here.</span>
  </div>;
}

function PreviewShell({ children }: { children: React.ReactNode }) {
  return <main className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>;
}

export function PreviewReferrals() {
  const [copied, setCopied] = useState(false);
  return <PreviewShell>
    <PreviewBanner room="Referral review" />
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">People you introduced</p>
      <h1 className="mt-2 font-display text-4xl">Referrals</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/55">Share your code and see referral relationships SecurePay can prove. Rewards appear only when the backend has authoritative qualification evidence.</p>
    </div>

    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-green-700/10 bg-green-50/60 p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Your referral code</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-700/10 bg-white p-3">
            <span className="min-w-0 flex-1 truncate font-mono text-lg font-bold">KIMANI-MARKET</span>
            <button type="button" aria-label="Preview copy referral code" onClick={() => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} className="flex size-11 items-center justify-center rounded-full text-green-700">
              {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
            </button>
          </div>
          <button type="button" className="sp-btn-primary mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm"><Share2 size={16} /> Share your code</button>
          <p className="mt-3 text-xs text-ink/50">Preview only. The real page never estimates or invents pending earnings.</p>
        </div>

        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Referral summary</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Fact label="Total referred" value="3" />
            <Fact label="Activated or qualified" value="2" />
          </div>
          <p className="mt-4 text-sm text-ink/55">The live page receives status, qualification time, reward and settlement evidence from SecurePayAPI. YUI does not calculate a financial result.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Referral history</p>
        <h2 className="mt-1 font-display text-2xl">Recorded relationships</h2>
        <ul className="mt-5 divide-y divide-ink/8">
          {previewRelationships.map(item => <li key={item.relationshipId} className="py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3"><CircleUserRound className="mt-0.5 text-green-700" size={19} /><div><p className="font-mono text-sm font-semibold">{item.referredKsNumber}</p><p className="mt-1 text-xs text-ink/45">Introduced {new Date(item.createdAt).toLocaleDateString('en-KE')}{item.activatedAt ? ` · Activated ${new Date(item.activatedAt).toLocaleDateString('en-KE')}` : ''}</p></div></div>
              <div className="sm:text-right"><p className="inline-flex items-center gap-2 text-sm font-semibold text-green-800">{item.status === 'QUALIFIED' && <LivingSecurePayMark state="success" size="xs" presence="polite" decorative />}{item.status}</p>{item.rewardAmountMinor != null && <p className="mt-1 text-sm font-semibold">Reward {money(item.rewardAmountMinor, item.rewardCurrency ?? 'KES')}</p>}{item.qualifiedAt && <p className="mt-1 text-xs text-ink/45">Qualified {new Date(item.qualifiedAt).toLocaleString('en-KE')}</p>}</div>
            </div>
            {item.qualificationExplanation && <div className="mt-3 rounded-xl bg-ink/[0.025] p-3 text-xs text-ink/55"><p>{item.qualificationExplanation}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-ink/45"><span>Pricing {item.pricingVersion}</span><span>Rule {item.referralRuleVersion}</span><span>Settlement evidence {item.settlementEvidenceReference}</span></div></div>}
          </li>)}
        </ul>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Were you referred?</p>
        <h2 className="mt-1 font-display text-xl">Apply a referral code</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input readOnly value="EXAMPLE-CODE" className="min-h-11 flex-1 rounded-xl border border-ink/15 bg-white px-4 text-sm" /><button type="button" className="sp-btn-primary min-h-11 px-5 text-sm">Apply code</button></div>
        <p className="mt-3 text-xs text-ink/45">Disabled as a real action in Preview. The live route applies codes through authenticated backend authority.</p>
      </section>
    </div>
  </PreviewShell>;
}

export function PreviewBuilders() {
  const [introductions, setIntroductions] = useState(10);
  const [reachedTen, setReachedTen] = useState(4);
  const [plan, setPlan] = useState<'FOR_YOU' | 'BUSINESS'>('FOR_YOU');
  const illustrativeMinor = Math.min(introductions, reachedTen) * (plan === 'BUSINESS' ? 20_000 : 10_000);
  const recordedRewards = useMemo(() => previewRelationships.filter(item => item.rewardAmountMinor != null), []);

  return <PreviewShell>
    <PreviewBanner room="Builder / Plug review" />
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Connect people to the Market</p>
      <h1 className="mt-2 font-display text-4xl">Plug / Builder workspace</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/55">Help traders learn SecurePay, build their own Store and enter the Market. Proven relationships and rewards come from SecurePayAPI; YUI never manufactures an entitlement.</p>
    </div>

    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-green-200 bg-green-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><LivingSecurePayMark state="guiding" size="sm" presence="present" decorative /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Your connection code</p><h2 className="font-display text-2xl">Bring someone into the Market.</h2></div></div>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-3"><span className="min-w-0 flex-1 truncate font-mono text-xl font-bold">KIMANI-MARKET</span><button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-full text-green-700"><Copy size={17} /></button></div>
          <button type="button" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-green-700 px-4 text-sm font-semibold text-white"><Share2 size={16} /> Share your code</button>
          <p className="mt-3 text-xs leading-5 text-green-950/60">Referral provenance creates no guaranteed income, territory, downline or ownership of the referred trader.</p>
        </div>
        <div className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">What SecurePay can prove</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Fact label="Introduced" value="3" /><Fact label="Activated+" value="2" /><Fact label="Reward records" value={recordedRewards.length.toString()} /><Fact label="Recorded rewards" value={money(4200)} /></div>
          <p className="mt-4 text-xs leading-5 text-ink/50">These are example records in Preview. On the live page they come only from backend-qualified referral evidence.</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-orange-200 bg-orange-50 p-5 sm:p-7">
        <div className="flex items-start gap-3"><Clock3 size={22} className="mt-0.5 shrink-0 text-orange-700" /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">10-month Builder rule</p><h2 className="mt-1 font-display text-2xl">The 10th consecutive paid month belongs to the originating Builder.</h2><p className="mt-2 text-sm leading-6 text-ink/60">SecurePayAPI can now derive ten consecutive paid subscription cycles from backend evidence and create the one-time retention entitlement. Missing a qualifying paid month breaks the streak.</p><p className="mt-3 text-sm leading-6 text-ink/60">YUI still keeps <strong>qualified</strong> separate from <strong>paid</strong>. The retention progress HTTP projection and actual reward posting remain separate boundaries, so this screen must not claim cash has been received until the backend proves that state.</p></div></div>
      </section>

      <section className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Referral provenance</p><h2 className="mt-1 font-display text-2xl">People SecurePay can trace back to your code</h2></div><Link to="/preview/referrals" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">Full referral preview <ArrowRight size={15} /></Link></div>
        <div className="mt-5 grid gap-3">{previewRelationships.map(item => <article key={item.relationshipId} className="rounded-2xl border border-ink/8 bg-[#faf9f5] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-sm font-bold">{item.referredKsNumber}</p><p className="mt-1 text-xs text-ink/45">{item.status}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-800">{item.rewardAmountMinor != null ? `Reward record ${money(item.rewardAmountMinor)}` : 'No reward record yet'}</span></div></article>)}</div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#173b20]/10 bg-[#173b20] p-5 text-white sm:p-6"><div className="flex items-center gap-2 text-[#d7f0c8]"><GraduationCap size={19} /><strong>Trainer shortcuts</strong></div><h2 className="mt-2 font-display text-2xl">Teach before you tell someone to transact.</h2><p className="mt-2 text-sm leading-6 text-white/65">Trainer remains simulated. Nothing learned there creates real identity, agreement or money truth.</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><ToolLink to="/trainer/session" label="Guided Builder session" /><ToolLink to="/trainer/store" label="Store demonstration" /><ToolLink to="/trainer/create" label="Agreement demonstration" /><ToolLink to="/trainer/recovery" label="Resolution demonstration" /></div></div>
        <div className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2 text-green-700"><ShoppingBag size={19} /><strong>Store-help workflow</strong></div><h2 className="mt-2 font-display text-2xl">Help a trader build their own Market address.</h2><ol className="mt-4 space-y-3 text-sm leading-6 text-ink/58"><li><strong>1.</strong> Demonstrate the Store in Trainer.</li><li><strong>2.</strong> The trader signs into their own KSNumber.</li><li><strong>3.</strong> Add truthful products, services and availability.</li><li><strong>4.</strong> Publish only what is actually on display.</li><li><strong>5.</strong> Share the exact offer link or QR.</li></ol><div className="mt-5 flex flex-wrap gap-2"><span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-800"><Store size={15} /> My KS Store</span><span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-sm font-semibold"><Share2 size={15} /> Store sharing</span></div></div>
      </section>

      <section className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3"><Calculator size={21} className="mt-0.5 shrink-0 text-green-700" /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Trainer maths · illustration only</p><h2 className="mt-1 font-display text-2xl">See how the month-10 rule works without calling it money owed.</h2></div></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3"><NumberField label="Introductions" value={introductions} onChange={setIntroductions} max={1000} /><NumberField label="Example traders reaching 10 paid months" value={reachedTen} onChange={setReachedTen} max={introductions} /><label className="rounded-2xl bg-[#faf9f5] p-3 text-xs font-semibold text-ink/55"><span>Example plan</span><select value={plan} onChange={event => setPlan(event.target.value as 'FOR_YOU' | 'BUSINESS')} className="mt-2 min-h-11 w-full rounded-xl border border-ink/12 bg-white px-3 text-sm font-semibold text-ink"><option value="FOR_YOU">For You · KES 100/month</option><option value="BUSINESS">Business · KES 200/month</option></select></label></div>
        <div className="mt-4 rounded-2xl bg-green-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-green-700">Illustrative arithmetic</p><p className="mt-1 font-display text-2xl">{money(illustrativeMinor)}</p><p className="mt-2 text-xs leading-5 text-green-950/60">Illustration only — not an entitlement, forecast, wallet balance or backend reward record.</p></div>
      </section>

      <section className="rounded-[24px] border border-green-200 bg-green-50 p-5 text-sm leading-6 text-green-950"><div className="flex gap-3"><BookOpenCheck size={19} className="mt-0.5 shrink-0" /><div><strong>A Builder connects; SecurePay proves.</strong><p className="mt-1 text-green-900/65">Referral provenance never makes the Builder party to another trader's agreement. Actual rewards require the backend event named by the commercial rule.</p></div></div></section>
    </div>
  </PreviewShell>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-ink/[0.025] p-3"><p className="text-xs text-ink/45">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>;
}

function ToolLink({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="inline-flex min-h-11 items-center justify-between rounded-xl border border-white/12 bg-white/7 px-4 text-sm font-semibold text-white">{label}<ArrowRight size={15} /></Link>;
}

function NumberField({ label, value, onChange, max }: { label: string; value: number; onChange: (value: number) => void; max: number }) {
  return <label className="rounded-2xl bg-[#faf9f5] p-3 text-xs font-semibold text-ink/55"><span>{label}</span><input type="number" min="0" max={Math.max(0, max)} value={value} onChange={event => onChange(Math.max(0, Math.min(Math.max(0, max), Number(event.target.value) || 0)))} className="mt-2 min-h-11 w-full rounded-xl border border-ink/12 bg-white px-3 text-sm font-semibold text-ink" /></label>;
}
