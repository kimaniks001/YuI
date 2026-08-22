import { useState } from 'react';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { LegalNav, LegalFooter, TrustNote, FAQAccordion, WarnNote } from '../components/LegalLayout';

const G = '#3a7a1f';

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `This Compliance page explains how SecurePay supports lawful participation, meets regulatory obligations and cooperates with legal and governmental processes. SecurePay is operated by Keyman Oak Limited and operates under the laws of Kenya.

Compliance is not a constraint on honest participants. It is the framework that makes SecurePay a trustworthy platform for agreements, collections and payment.`,
  },
  {
    id: 'governing-law',
    title: '2. Governing Law',
    content: `SecurePay operates under the laws of Kenya. All platform activity, agreements, collections, records and participant conduct are subject to Kenyan law.

Platform use and all disputes arising from it are governed by Kenyan law and subject to the jurisdiction of Kenyan courts, unless applicable law requires otherwise.`,
  },
  {
    id: 'kyc-aml',
    title: '3. Know Your Customer (KYC) and Anti-Money Laundering (AML)',
    content: `SecurePay takes its KYC and AML obligations seriously. These obligations exist to prevent SecurePay from being used for money laundering, terrorism financing, fraud or other financial crimes.

Know Your Customer (KYC): SecurePay may require participants to provide identity information, identification documents or other verification materials as part of KS Number registration or platform activity. This information is used to verify identity and meet regulatory requirements.

Anti-Money Laundering (AML): SecurePay monitors platform activity for patterns associated with money laundering, suspicious transactions and financial crime. SecurePay may report suspicious activity to relevant authorities as required by Kenyan law.

Enhanced due diligence: For certain account types, transaction volumes or risk profiles, SecurePay may require additional verification or documentation.

Transaction monitoring: SecurePay monitors transactions for patterns that may indicate financial crime, fraud or regulatory risk.

Participants who provide false identity information, attempt to circumvent KYC requirements or use SecurePay for illegal purposes may have their accounts suspended or terminated and may be reported to relevant authorities.`,
  },
  {
    id: 'court-orders',
    title: '4. Court Orders and Legal Process',
    content: `SecurePay cooperates with lawful court orders, regulatory directions and legal processes affecting platform accounts, records or funds:

Freezing orders: Where a court of competent jurisdiction issues a valid freezing order affecting a SecurePay account or funds, SecurePay will give effect to that order as required by law.

Disclosure orders: Where SecurePay receives a valid court order or regulatory direction requiring disclosure of records or information, SecurePay will comply as required by law.

Enforcement: Where an enforcement order is issued against a participant's account or funds held in SecurePay structures, SecurePay will cooperate with the enforcement process as required by law.

Participants cannot use SecurePay to evade, delay or obstruct lawful legal process. Attempting to do so is a violation of the Terms and Conditions and may constitute a criminal offence.

To serve legal process on SecurePay, contact SecurePay through the platform's designated legal process channel. SecurePay will not comply with informal demands that do not constitute valid legal process.`,
  },
  {
    id: 'taxation',
    title: '5. Taxation',
    content: `SecurePay is not a tax advisor and this page does not constitute tax advice.

Participants are responsible for their own tax obligations arising from agreements, collections, income and transactions processed through SecurePay.

Where SecurePay is required by law to report transaction information to tax authorities, SecurePay will do so.

Participants should consult qualified tax advisors about their obligations in relation to platform activity.`,
  },
  {
    id: 'data-protection',
    title: '6. Data Protection',
    content: `SecurePay operates under the Kenya Data Protection Act, 2019 and related regulations. SecurePay takes reasonable steps to handle participant personal information in compliance with applicable data protection law.

See the SecurePay Privacy Notice at securepay.ke/privacy for a full explanation of how SecurePay handles participant information.

Participants who believe their data protection rights have been violated may contact SecurePay through the platform support channel and may have recourse to the Office of the Data Protection Commissioner of Kenya.`,
  },
  {
    id: 'prohibited-uses',
    title: '7. Prohibited Uses',
    content: `SecurePay prohibits the use of the platform for:

Money laundering: Using SecurePay to launder proceeds of crime, conceal the source of funds or integrate illegally obtained money into the financial system.

Terrorism financing: Using SecurePay to fund or support terrorism or terrorist organisations.

Fraud and deception: Using SecurePay to defraud other participants, create false agreements, submit false evidence or impersonate others.

Sanctioned activities: Using SecurePay in violation of applicable sanctions, trade restrictions or embargo laws.

Tax evasion: Using SecurePay to evade tax obligations or facilitate others' tax evasion.

Illegal purposes: Using SecurePay for any purpose that is illegal under Kenyan law or applicable international law.

Participants who use or attempt to use SecurePay for prohibited purposes will have their accounts suspended or terminated and may be reported to relevant law enforcement or regulatory authorities.`,
  },
  {
    id: 'sanctions',
    title: '8. Sanctions',
    content: `SecurePay does not knowingly facilitate transactions involving individuals or entities subject to applicable international or Kenyan sanctions. SecurePay takes reasonable steps to screen participants against applicable sanctions lists.

If a participant is or becomes subject to applicable sanctions, their account may be suspended and the matter referred to relevant authorities as required by law.`,
  },
  {
    id: 'regulatory-status',
    title: '9. Regulatory Status',
    content: `SecurePay is operated by Keyman Oak Limited as an agreement-driven payment platform.

SecurePay is not a bank, deposit-taking institution, licensed investment manager or financial institution subject to banking regulation. Banking and payment processing may be provided through licensed financial infrastructure partners where required.

SecurePay does not claim any regulatory authorisation or certification that it does not hold. Participants should not assume that SecurePay's platform status means that their funds are covered by banking deposit protection, investment protection or similar schemes.

If you have questions about SecurePay's regulatory position, contact SecurePay through the platform support channel.`,
  },
  {
    id: 'reporting',
    title: '10. Reporting Concerns',
    content: `Participants and third parties who have concerns about compliance, potential financial crime, fraud or illegal activity on SecurePay should report them through the platform support channel at securepay.ke/help.

SecurePay will investigate reported concerns in good faith and take appropriate action, including referral to law enforcement or regulators where required.`,
  },
  {
    id: 'updates',
    title: '11. Updates to This Page',
    content: `SecurePay may update this Compliance page as its regulatory environment or obligations change. Material changes will be communicated through the platform. The current version is available at securepay.ke/compliance.`,
  },
];

const FAQS = [
  {
    q: 'Does SecurePay report suspicious transactions?',
    a: 'Yes. SecurePay monitors for suspicious activity and is required by law to report certain suspicious transactions to relevant Kenyan authorities.',
  },
  {
    q: 'Will SecurePay comply with a court order?',
    a: 'Yes. SecurePay cooperates with valid court orders, including freezing orders, disclosure orders and enforcement orders issued by courts of competent jurisdiction.',
  },
  {
    q: 'What happens if I use SecurePay for illegal purposes?',
    a: 'Your account will be suspended or terminated and you may be reported to relevant law enforcement or regulatory authorities. Using SecurePay for illegal purposes is a serious violation of the Terms and Conditions.',
  },
  {
    q: 'Is SecurePay a licensed financial institution?',
    a: 'No. SecurePay is an agreement-driven payment platform operated by Keyman Oak Limited. It is not a bank, deposit-taking institution or licensed investment manager. Banking and payment infrastructure may be provided through licensed partners.',
  },
  {
    q: 'Do I need to verify my identity to use SecurePay?',
    a: 'SecurePay may require identity verification as part of KS Number registration or for certain account types and transaction levels. This is part of SecurePay\'s KYC obligations.',
  },
  {
    q: 'Am I responsible for my own taxes on SecurePay transactions?',
    a: 'Yes. Participants are responsible for their own tax obligations. SecurePay is not a tax advisor. Consult a qualified tax advisor about your obligations.',
  },
];

const PRINCIPLES = [
  { label: 'Kenyan law', text: 'All platform activity governed by the laws of Kenya.' },
  { label: 'KYC & AML', text: 'Identity verification and transaction monitoring to prevent financial crime.' },
  { label: 'Court orders', text: 'Full cooperation with valid court orders and legal process.' },
  { label: 'Data protection', text: 'Compliance with the Kenya Data Protection Act, 2019.' },
  { label: 'No prohibited uses', text: 'Money laundering, fraud, terrorism financing and sanctions violations are prohibited.' },
  { label: 'Honest status', text: 'SecurePay does not claim regulatory authorisations it does not hold.' },
];

export default function CompliancePage() {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <LegalNav />

      <div style={{ background: '#1e4d10' }} className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={12} className="text-white/30" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Compliance · SecurePay.ke</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-snug">Compliance</h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg">
            How SecurePay supports lawful participation, KYC, AML, court orders and regulatory obligations.
          </p>
        </div>
      </div>

      {/* Principles strip */}
      <div className="border-b border-[#1a1a1a]/5 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: G }} />
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]/70">{p.label}</p>
                  <p className="text-[11px] text-[#1a1a1a]/45 mt-0.5 leading-snug">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <WarnNote text="This page is for general information about SecurePay's compliance position. It does not constitute legal or compliance advice. Participants with specific legal or regulatory questions should consult qualified advisors." />
        </div>

        <div className="md:grid md:grid-cols-[220px_1fr] md:gap-8 md:items-start">

          <aside className="hidden md:block sticky top-20">
            <p className="text-[10px] font-bold text-[#1a1a1a]/35 uppercase tracking-wider mb-3">Contents</p>
            <nav className="space-y-0.5">
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`}
                  className="block text-xs text-[#1a1a1a]/50 hover:text-[#3a7a1f] py-1 leading-snug transition-colors">
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="md:hidden mb-6 bg-white border border-[#1a1a1a]/6 rounded-2xl overflow-hidden">
            <button
              onClick={() => setTocOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-[#1a1a1a]/70">
              Contents
              <ChevronDown size={14} className={`transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
            </button>
            {tocOpen && (
              <div className="px-4 pb-4 space-y-1 border-t border-[#1a1a1a]/5">
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    onClick={() => setTocOpen(false)}
                    className="block text-xs text-[#1a1a1a]/50 hover:text-[#3a7a1f] py-1 leading-snug">
                    {s.title}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-10">
            {SECTIONS.map(s => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-base font-bold text-[#1a1a1a] mb-3">{s.title}</h2>
                <div className="space-y-3">
                  {s.content.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-[#1a1a1a]/60 leading-relaxed">{para}</p>
                  ))}
                </div>
              </section>
            ))}

            <section>
              <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Common questions</h2>
              <FAQAccordion items={FAQS} />
            </section>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-10">
        <TrustNote text="SecurePay operates under Kenyan law and cooperates with lawful legal and regulatory processes. This page is for general information. It does not constitute legal or compliance advice." />
      </div>

      <LegalFooter />
    </div>
  );
}
