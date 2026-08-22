import { Link } from 'react-router-dom';
import {
  Shield, Lock, FileText, Eye, CheckCircle, ArrowRight,
} from 'lucide-react';
import { LegalNav, LegalFooter, LegalHero, TrustNote } from '../components/LegalLayout';

const G = '#3a7a1f';
const C = '#0891b2';

const LEGAL_CARDS = [
  {
    icon: FileText, color: G,
    title: 'Terms and Conditions',
    desc: 'SecurePay rules for KS Numbers, SecureLinks, Group SecureLinks, reviews, approvals, funds and platform use.',
    cta: 'Read Terms', to: '/terms',
  },
  {
    icon: Eye, color: C,
    title: 'Privacy',
    desc: 'How SecurePay handles information, visibility, records and user permissions.',
    cta: 'Read Privacy', to: '/privacy',
  },
  {
    icon: Lock, color: '#d97706',
    title: 'Security',
    desc: 'How SecurePay protects accounts, records, systems and participation.',
    cta: 'Read Security', to: '/security',
  },
  {
    icon: CheckCircle, color: '#7c3aed',
    title: 'Compliance',
    desc: 'How SecurePay supports lawful participation, KYC, AML, court orders and regulatory obligations.',
    cta: 'Read Compliance', to: '/compliance',
  },
  {
    icon: Shield, color: G,
    title: 'Not a Bank',
    desc: "SecurePay's role as an agreement-driven payment platform, not a deposit-taking institution.",
    cta: 'Read Explanation', to: '/not-a-bank',
  },
  {
    icon: CheckCircle, color: '#e87c1e',
    title: 'Trust and Safety',
    desc: 'How SecurePay builds trust through identity, evidence, reviews and transparency.',
    cta: 'Read Trust Page', to: '/trust',
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <LegalNav />

      <LegalHero
        eyebrow="Legal · SecurePay.ke"
        title="Legal and platform information"
        subtitle="Understand SecurePay's terms, privacy, compliance position, platform role and participant responsibilities."
        dark
      />

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-10">

        {/* Legal nav cards */}
        <section>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {LEGAL_CARDS.map(card => (
              <div key={card.to} className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-5 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: card.color + '12' }}>
                  <card.icon size={18} style={{ color: card.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">{card.title}</p>
                  <p className="text-xs text-[#1a1a1a]/50 mt-1 leading-relaxed">{card.desc}</p>
                </div>
                <Link to={card.to}
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: card.color }}>
                  {card.cta} <ArrowRight size={10} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Key principles */}
        <section className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-[#1a1a1a]">SecurePay's core legal position</h2>
          <div className="space-y-3">
            {[
              { label: 'What SecurePay is', text: 'An agreement-driven payment platform helping money follow agreements through SecureLinks, Group SecureLinks, KS Numbers, evidence, reviews, approvals and Payment Ready status.' },
              { label: 'What SecurePay is not', text: 'A bank, deposit-taking institution, insurer, guarantor, court, investment platform or legal representative.' },
              { label: 'Participant responsibility', text: 'Participants are responsible for their agreements, evidence, contributions, conduct and decisions. SecurePay provides tools, not guarantees.' },
              { label: 'Governing law', text: 'SecurePay operates under the laws of Kenya. Disputes are governed by Kenyan law.' },
              { label: 'Banking partners', text: 'Banking and payment services where offered may be provided through licensed financial infrastructure partners.' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 py-3 border-b border-[#1a1a1a]/5 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: G }} />
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]/60 mb-0.5">{item.label}</p>
                  <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="bg-white border border-[#1a1a1a]/6 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1a1a1a]/5">
            <p className="text-xs font-bold text-[#1a1a1a]/35 uppercase tracking-wider">Quick links</p>
          </div>
          <div className="divide-y divide-[#1a1a1a]/5">
            {[
              { label: 'Pricing', sub: 'View SecurePay fees and how they work', to: '/help' },
              { label: 'Help Center', sub: 'Plain-language guides about how SecurePay works', to: '/help' },
              { label: 'Ask SecurePay', sub: 'Search for answers about SecurePay', to: '/ask-securepay' },
              { label: 'Check a Link', sub: 'Verify any SecurePay link before you pay', to: '/trust' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="flex items-center justify-between px-5 py-4 hover:bg-[#fafaf8] transition-colors group">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]/70 group-hover:text-[#1a1a1a]">{item.label}</p>
                  <p className="text-[10px] text-[#1a1a1a]/35 mt-0.5">{item.sub}</p>
                </div>
                <ArrowRight size={12} className="text-[#1a1a1a]/20 group-hover:text-[#3a7a1f] transition-colors" />
              </Link>
            ))}
          </div>
        </section>

      </div>

      <TrustNote text="SecurePay is not a bank, insurer, guarantor, court, investment platform or legal representative. Banking and payment services may be provided through licensed financial infrastructure partners. All platform use is governed by the Terms and Conditions and applicable Kenyan law." />
      <LegalFooter />
    </div>
  );
}
