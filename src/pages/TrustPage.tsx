import { Link } from 'react-router-dom';
import {
  Shield, Lock, Package, FileText, CheckCircle,
  Search, ArrowRight, XCircle, AlertCircle,
} from 'lucide-react';
import { LegalNav, LegalFooter, FAQAccordion, TrustNote } from '../components/LegalLayout';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

const G = '#3a7a1f';
const C = '#0891b2';

const TRUST_PILLARS = [
  {
    icon: Shield, color: G,
    title: 'Identity through KS Numbers',
    desc: 'Participants use KS Numbers so activity can be connected to identifiable individuals, businesses or organizations.',
  },
  {
    icon: Lock, color: G,
    title: 'Clear agreements',
    desc: 'SecureLinks help participants define parties, scope, deliverables, timelines, evidence, approvals and release conditions.',
  },
  {
    icon: Package, color: C,
    title: 'Shared-purpose contributions',
    desc: 'Group SecureLinks help contributors understand why money is being collected, who is collecting it and how the collection is progressing.',
  },
  {
    icon: FileText, color: '#d97706',
    title: 'Evidence',
    desc: 'Photos, documents, notes, GPS records and approvals can help participants understand what happened.',
  },
  {
    icon: AlertCircle, color: '#7c3aed',
    title: 'Agreement Reviews',
    desc: 'When questions arise, reviews help examine agreement terms, evidence and approvals before payment readiness is confirmed.',
  },
  {
    icon: CheckCircle, color: G,
    title: 'Payment Ready',
    desc: 'Money becomes eligible to move when agreement conditions have been satisfied according to the SecureLink or process.',
  },
];

const IS_LIST = [
  'An agreement-driven payment platform',
  'A SecureLink creator',
  'A Group SecureLink platform',
  'A KS Number identity layer',
  'A tool for evidence, reviews and approvals',
  'A platform for structured payment readiness',
  'A trust and records system',
];

const NOT_LIST = [
  'A bank',
  'A deposit-taking institution',
  'A savings platform',
  'An investment platform',
  'An insurer',
  'A guarantor',
  'A court',
  'A legal representative',
  'A promise that every participant will perform perfectly',
];

const TRUST_FAQS = [
  {
    q: 'Is SecurePay a bank?',
    a: 'No. SecurePay is an agreement-driven payment platform. Banking and payment services may be provided through licensed financial infrastructure partners.',
  },
  {
    q: 'Does SecurePay guarantee that everyone will perform?',
    a: 'No. SecurePay provides tools for clarity, evidence, reviews, approvals and records, but participants remain responsible for their decisions.',
  },
  {
    q: 'Does SecurePay replace the courts?',
    a: 'No. SecurePay reviews help clarify agreement status, but participants retain their legal rights and lawful remedies.',
  },
  {
    q: 'Who owns funds processed through SecurePay?',
    a: 'Funds remain the property of the parties entitled to them under the agreement, collection or legal requirements.',
  },
  {
    q: 'When does money become ready to move?',
    a: 'Money becomes Payment Ready when the agreement conditions have been satisfied.',
  },
  {
    q: 'Can SecurePay suspend a KS Number?',
    a: 'Yes, where there are reasonable concerns involving fraud, abuse, false information, security risks, regulatory requirements or legal obligations.',
  },
  {
    q: 'Can organizations use approvals?',
    a: 'Yes. Schools, churches, estates, chamas, welfare groups, companies and other organizations may use governance structures and approvers where supported.',
  },
];

export default function TrustPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <LegalNav />

      {/* V14 knowledge hero — clarity before legal density. */}
      <div className="b9-trust-hero px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="flex items-center gap-2"><LivingSecurePayMark state="resting" size="xs" presence="polite" /><span className="b9-label">Trust & boundaries · SecurePay.ke</span></div>
            <h1 className="mt-4 font-black leading-snug">Trust is built through clarity.</h1>
            <p className="mt-4 text-sm leading-relaxed max-w-xl">SecurePay helps people keep the agreement, payment state, evidence, approvals, reviews and records in one understandable story.</p>
            <p className="mt-2 text-xs leading-relaxed max-w-lg">SecurePay does not replace judgment or guarantee performance. It gives participants clearer information and structured actions while backend authority remains the source of financial truth.</p>
            <div className="b9-trust-actions flex flex-wrap gap-3 pt-5">
              <Link to="/help" className="inline-flex min-h-11 items-center gap-2 font-bold text-sm px-5 rounded-full transition-colors"><Search size={13} /> Ask a trust question</Link>
              <Link to="/help/article/what-is-securepay" className="inline-flex min-h-11 items-center gap-2 font-semibold text-sm px-5 rounded-full border transition-colors">Learn how SecurePay works <ArrowRight size={12} /></Link>
            </div>
          </div>
          <div className="b9-trust-mark-panel"><div><LivingSecurePayMark state="guiding" size="lg" presence="present" /></div><span>Present when guidance matters. Quiet when the facts can speak for themselves.</span></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-12">

        {/* How SecurePay builds trust */}
        <section>
          <h2 className="text-xl font-black text-[#1a1a1a] mb-6">How SecurePay builds trust</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TRUST_PILLARS.map((p, i) => (
              <div key={i} className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: p.color + '12' }}>
                  <p.icon size={18} style={{ color: p.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{p.title}</p>
                  <p className="text-xs text-[#1a1a1a]/55 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What SecurePay is / is not */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#3a7a1f]/12 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: G + '12' }}>
                <CheckCircle size={15} style={{ color: G }} />
              </div>
              <h3 className="font-bold text-[#1a1a1a]">SecurePay is</h3>
            </div>
            <div className="space-y-2">
              {IS_LIST.map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <CheckCircle size={13} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#1a1a1a]/65">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#1a1a1a]/8 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1a1a1a]/5">
                <XCircle size={15} className="text-[#1a1a1a]/40" />
              </div>
              <h3 className="font-bold text-[#1a1a1a]">SecurePay is not</h3>
            </div>
            <div className="space-y-2">
              {NOT_LIST.map(item => (
                <div key={item} className="flex items-start gap-2.5">
                  <XCircle size={13} className="text-[#1a1a1a]/30 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#1a1a1a]/55">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#1a1a1a]/5">
              <p className="text-xs text-[#1a1a1a]/45 leading-relaxed">
                SecurePay provides tools that support clarity and accountability. Participants remain responsible for their choices, agreements, evidence, collections and conduct.
              </p>
            </div>
          </div>
        </section>

        {/* Not a bank callout */}
        <section>
          <div className="bg-[#fafaf8] border border-[#1a1a1a]/6 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G + '12' }}>
              <Shield size={18} style={{ color: G }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#1a1a1a] mb-1">Not a bank</p>
              <p className="text-sm text-[#1a1a1a]/55 leading-relaxed">
                SecurePay is not a deposit-taking institution, bank, insurer, guarantor, court or investment platform. Banking and payment services may be provided through licensed financial infrastructure partners.
              </p>
              <Link to="/not-a-bank" className="inline-flex items-center gap-1 text-xs font-bold mt-2.5 hover:underline" style={{ color: G }}>
                Read the full explanation <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </section>

        {/* Trust FAQ */}
        <section>
          <h2 className="text-xl font-black text-[#1a1a1a] mb-5">Common questions</h2>
          <FAQAccordion items={TRUST_FAQS} />
        </section>

        {/* CTA */}
        <section>
          <div className="bg-white border border-[#3a7a1f]/12 rounded-3xl p-6 md:p-8">
            <div className="max-w-lg">
              <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-3">Build with confidence</p>
              <h3 className="text-xl font-black text-[#1a1a1a] mb-2">Ready to create your first agreement?</h3>
              <p className="text-sm text-[#1a1a1a]/50 leading-relaxed mb-5">
                Start with what you want to do. SecurePay will help shape the right agreement structure underneath.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/create" className="inline-flex items-center gap-2 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#2d6018] transition-colors" style={{ background: G }}>
                  <Lock size={13} /> Start an agreement
                </Link>
                <Link to="/create" className="inline-flex items-center gap-2 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#0782a0] transition-colors" style={{ background: C }}>
                  <Package size={13} /> Start a group agreement
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>

      <TrustNote text="SecurePay is not a bank, insurer, guarantor, court, investment platform or legal representative. Banking and payment services may be provided through licensed financial infrastructure partners. Participants remain responsible for their decisions." />
      <LegalFooter />
    </div>
  );
}
