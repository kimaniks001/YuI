import { Link } from 'react-router-dom';
import {
  Shield, CheckCircle, ArrowRight,
  Landmark,
} from 'lucide-react';
import { LegalNav, LegalFooter, FAQAccordion, TrustNote } from '../components/LegalLayout';

const G = '#3a7a1f';

const BANK_COLUMN = [
  'Deposits and withdrawals',
  'Current and savings accounts',
  'Lending and credit',
  'Interest on deposits',
  'Central Bank regulation (banking licence)',
  'Deposit protection coverage',
];

const SP_COLUMN = [
  'Agreements (SecureLinks)',
  'Collections (Group SecureLinks)',
  'KS Number identity',
  'Evidence and reviews',
  'Approvals and governance',
  'Payment Ready and release',
];

const FAQS = [
  {
    q: 'Where does the money sit?',
    a: 'Money sits within the SecurePay Agreement Account structure until it becomes ready for release according to the agreement, collection or applicable process. Banking and payment infrastructure may be provided by regulated financial partners.',
  },
  {
    q: 'Who owns the money?',
    a: "Funds remain the property of the parties entitled to them under the applicable agreement, collection or legal requirements. SecurePay does not claim ownership simply because funds pass through SecurePay systems.",
  },
  {
    q: 'Does SecurePay pay interest?',
    a: 'No. SecurePay is not a savings or investment platform. No participant should use SecurePay expecting interest, investment returns, profits or financial yield unless expressly provided through lawful and approved arrangements.',
  },
  {
    q: 'Does SecurePay guarantee delivery or performance?',
    a: 'No. SecurePay provides tools for agreements, evidence, reviews, approvals and payment readiness, but participants remain responsible for their decisions and actions.',
  },
  {
    q: 'Are funds covered by deposit protection?',
    a: 'No. SecurePay is not a bank. Funds held within SecurePay structures are not deposits and are not covered by bank deposit protection schemes.',
  },
  {
    q: 'Why does SecurePay use banking partners?',
    a: 'To process payments, mobile money and settlement, SecurePay may work with licensed payment and banking infrastructure partners. This does not make SecurePay a bank — it means SecurePay uses regulated payment rails to move money when agreements become Payment Ready.',
  },
];

export default function NotABankPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <LegalNav />

      {/* Hero */}
      <div style={{ background: '#1e4d10' }} className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-white/30" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Not a Bank · SecurePay.ke</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-snug">SecurePay is not a bank.</h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg">
            SecurePay is an agreement-driven payment platform. Its role is to help money follow agreements, collections, evidence, approvals, reviews and payment readiness.
          </p>
          <div className="pt-2 flex items-start gap-2.5 bg-white/8 border border-white/10 rounded-2xl px-4 py-3.5 max-w-lg">
            <Shield size={13} className="text-white/40 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed">
              Banking and payment services may be provided through licensed financial infrastructure partners. SecurePay does not operate as a deposit-taking institution.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-10">

        {/* Comparison */}
        <section>
          <h2 className="text-xl font-black text-[#1a1a1a] mb-5">What each one does</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bank */}
            <div className="bg-white border border-[#1a1a1a]/8 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#1a1a1a]/6 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1a1a1a]/5 flex items-center justify-center">
                  <Landmark size={13} className="text-[#1a1a1a]/40" />
                </div>
                <p className="text-xs font-bold text-[#1a1a1a]/50 uppercase tracking-wider">A traditional bank</p>
              </div>
              <div className="px-5 py-4 space-y-2">
                {BANK_COLUMN.map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle size={12} className="text-[#1a1a1a]/25 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#1a1a1a]/50">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SecurePay */}
            <div className="bg-white border border-[#3a7a1f]/15 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#3a7a1f]/10 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: G + '12' }}>
                  <Shield size={13} style={{ color: G }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: G + 'aa' }}>SecurePay</p>
              </div>
              <div className="px-5 py-4 space-y-2">
                {SP_COLUMN.map(item => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle size={12} style={{ color: G }} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#1a1a1a]/70">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What SecurePay does instead */}
        <section className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-[#1a1a1a]">What SecurePay does instead</h3>
          <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">
            SecurePay connects payment to agreement. When two people agree on terms — delivery, milestones, approvals, evidence — SecurePay creates a structure that keeps the money connected to those terms until they are satisfied.
          </p>
          <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">
            The money does not sit in a "bank account" owned by SecurePay. It moves through payment rails when the agreement reaches Payment Ready status.
          </p>
          <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">
            For Group SecureLinks — rent, school fees, chama, church, estate — SecurePay provides the collection structure, records and visibility. The money is transferred through mobile money or payment infrastructure to the collection owner when the collection process concludes.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-black text-[#1a1a1a] mb-5">Common questions</h2>
          <FAQAccordion items={FAQS} />
        </section>

        {/* Further reading */}
        <section>
          <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-3">Learn more</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: 'Trust & Safety', desc: 'How SecurePay builds trust through identity, evidence and reviews.', to: '/trust' },
              { title: 'Where does the money sit?', desc: 'Plain explanation of how the Agreement Account works.', to: '/help/article/where-does-money-sit' },
              { title: 'Who owns the money?', desc: 'Ownership of funds in SecurePay agreements.', to: '/help/article/who-owns-the-money' },
              { title: 'Compliance', desc: 'How SecurePay supports lawful participation.', to: '/compliance' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="flex items-start gap-3 bg-white border border-[#1a1a1a]/6 rounded-2xl px-4 py-3.5 hover:border-[#3a7a1f]/20 hover:shadow-sm transition-all group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]/75 group-hover:text-[#1a1a1a]">{item.title}</p>
                  <p className="text-[10px] text-[#1a1a1a]/40 mt-0.5 leading-snug">{item.desc}</p>
                </div>
                <ArrowRight size={12} className="text-[#1a1a1a]/20 group-hover:text-[#3a7a1f] flex-shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>
        </section>

      </div>

      <TrustNote text="SecurePay is an agreement-driven payment platform, not a bank, insurer, guarantor or investment platform. Participants remain responsible for their decisions. This explanation is for general information only and does not constitute legal or financial advice." />
      <LegalFooter />
    </div>
  );
}
