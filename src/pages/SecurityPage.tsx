import { useState } from 'react';
import { Lock, Shield, AlertTriangle, ChevronDown } from 'lucide-react';
import { LegalNav, LegalFooter, TrustNote, FAQAccordion } from '../components/LegalLayout';

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `This Security page explains how SecurePay takes reasonable steps to protect accounts, records, systems and participation. Security is a shared responsibility: SecurePay takes platform-level measures and participants are responsible for protecting their own access credentials and account activity.

This page provides plain-language information about SecurePay's security approach. It does not constitute a binding security warranty or guarantee.`,
  },
  {
    id: 'account-security',
    title: '2. Account and KS Number Security',
    content: `KS Numbers are the identity layer of SecurePay. SecurePay takes the following measures to protect KS Number accounts:

Authentication: Access to KS Number accounts requires authentication. SecurePay uses phone number verification and session controls to limit unauthorised access.

Session management: Sessions expire after periods of inactivity. Logging out ends the active session.

KS Number suspension: SecurePay may suspend a KS Number where there are reasonable concerns involving fraud, impersonation, abuse, security risks, regulatory requirements or court orders.

Participant responsibility: You are responsible for keeping your login credentials, phone number access and account information secure. Do not share your account access with others. If you believe your account has been compromised, contact SecurePay immediately through the support channel.`,
  },
  {
    id: 'platform-security',
    title: '3. Platform and System Security',
    content: `SecurePay takes reasonable technical measures to protect the platform, including:

Access controls: Internal access to SecurePay systems is restricted to authorised personnel with appropriate authentication and permissions.

Encryption: Sensitive data is encrypted in transit using industry-standard protocols. SecurePay takes reasonable steps to protect data at rest.

Audit logging: SecurePay maintains logs of access and activity on platform systems for security monitoring and incident investigation purposes.

Infrastructure security: SecurePay uses infrastructure security practices appropriate to the scale and risk profile of the platform.

No system is completely secure. SecurePay does not guarantee that the platform will be free from all possible security vulnerabilities, attacks or incidents.`,
  },
  {
    id: 'records-integrity',
    title: '4. Records and Agreement Integrity',
    content: `SecurePay takes measures to protect the integrity of agreement records, Group SecureLink records, evidence, approvals and payment history:

Immutable records: Once created, core agreement terms and key event records (payments made, approvals given, evidence submitted) are not retroactively deletable by participants.

Evidence protection: Evidence submitted within SecurePay is stored and associated with the relevant record. Evidence cannot be deleted by the submitting party after submission.

Audit trail: SecurePay maintains an audit trail of key actions (agreement creation, contributions, approvals, status changes) to support accountability and dispute resolution.

These measures exist to protect participants from fraudulent alterations to agreement records after the fact.`,
  },
  {
    id: 'payment-security',
    title: '5. Payment Security',
    content: `SecurePay connects payment to agreement and only releases funds when Payment Ready conditions are met. This structure provides security for participants:

Payment readiness gate: Money does not move simply because it was sent. The SecureLink or Group SecureLink process governs when funds become eligible for release.

Approval requirements: Where agreements have approval requirements, funds do not become Payment Ready until those approvals are provided.

Partner infrastructure: Where payments are processed through banking or mobile money infrastructure partners, those partners maintain their own payment security standards.

Participants should verify that a SecureLink or Group SecureLink is genuine before contributing or making payment. Use the Check a Link feature at securepay.ke/trust to verify any SecurePay link.`,
  },
  {
    id: 'fraud-prevention',
    title: '6. Fraud Prevention and Abuse',
    content: `SecurePay takes reasonable steps to detect and prevent fraud, impersonation and abuse on the platform:

Identity verification: KS Number registration requires identity information that reduces anonymity and supports accountability.

Fraud signals: SecurePay monitors for activity patterns associated with fraud, impersonation, false information and abuse.

Suspension and termination: SecurePay may suspend or terminate accounts involved in fraud, abuse, impersonation or harmful activity.

Reporting: Participants who suspect fraud, impersonation or abuse on SecurePay should report it through the platform support channel.

SecurePay cannot guarantee detection of all fraudulent activity. Participants should exercise their own judgment and caution before entering agreements or making contributions.`,
  },
  {
    id: 'incident-response',
    title: '7. Security Incidents',
    content: `In the event of a security incident affecting participant data or platform integrity, SecurePay will:

Investigate promptly: Take reasonable steps to investigate and contain the incident.

Notify affected participants: Notify affected participants where required by law or where it is appropriate to do so given the nature of the incident.

Take remedial action: Take appropriate technical and operational steps to address identified vulnerabilities.

SecurePay's ability to respond to and recover from security incidents depends on the nature and scale of the incident. SecurePay does not guarantee full recovery or prevention of harm in all cases.`,
  },
  {
    id: 'participant-responsibilities',
    title: '8. Participant Security Responsibilities',
    content: `Security on SecurePay is a shared responsibility. Participants are responsible for:

Protecting account credentials: Keep your phone number, login credentials and account access secure. Do not share account access with others.

Verifying links: Before contributing to a Group SecureLink or entering a SecureLink agreement, verify the link is genuine using securepay.ke/trust.

Reporting suspicious activity: If you see suspicious activity, impersonation or fraud, report it to SecurePay through the support channel.

Using strong evidence: Protect your interests in agreements by submitting clear, accurate evidence before payments are released.

Not sharing false information: Submitting false information, false evidence, impersonating others or manipulating agreements is a violation of SecurePay Terms and Conditions and may constitute a criminal offence under Kenyan law.`,
  },
  {
    id: 'disclosure',
    title: '9. Responsible Disclosure',
    content: `If you discover a security vulnerability in the SecurePay platform, please report it to SecurePay through the platform support channel rather than exploiting it or disclosing it publicly without giving SecurePay reasonable notice.

SecurePay will investigate reported vulnerabilities in good faith and take appropriate remedial action. SecurePay does not operate a public bug bounty programme at this time.`,
  },
  {
    id: 'updates',
    title: '10. Updates to This Page',
    content: `SecurePay may update this Security page as its security practices evolve. Material changes will be communicated through the platform. The current version is available at securepay.ke/security.`,
  },
];

const FAQS = [
  {
    q: 'Can someone else access my SecurePay account?',
    a: "Only you should have access to your account. If you suspect unauthorised access, contact SecurePay through the support channel immediately. You are responsible for keeping your credentials secure.",
  },
  {
    q: 'Can someone alter a SecureLink after it is created?',
    a: 'Core agreement terms and key event records are protected from retroactive alteration. Evidence submitted cannot be deleted by the submitting party after submission.',
  },
  {
    q: 'How do I know a Group SecureLink is genuine?',
    a: 'Use the Check a Link feature at securepay.ke/trust to verify any SecurePay link before contributing or paying.',
  },
  {
    q: 'What happens if someone impersonates me on SecurePay?',
    a: 'Report impersonation to SecurePay through the support channel. SecurePay may suspend the impersonating account and take appropriate action. Impersonation may constitute a criminal offence under Kenyan law.',
  },
  {
    q: 'Does SecurePay use encryption?',
    a: 'Yes. Data is encrypted in transit using industry-standard protocols. SecurePay takes reasonable steps to protect data at rest.',
  },
];

const PILLARS = [
  { icon: Lock, title: 'Account protection', desc: 'Authentication, session controls and KS Number security.' },
  { icon: Shield, title: 'Records integrity', desc: 'Immutable agreement records and audit trail.' },
  { icon: AlertTriangle, title: 'Fraud prevention', desc: 'Identity accountability and activity monitoring.' },
];

export default function SecurityPage() {
  const [tocOpen, setTocOpen] = useState(false);
  const G = '#3a7a1f';

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <LegalNav />

      <div style={{ background: '#1e4d10' }} className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-white/30" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Security · SecurePay.ke</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-snug">Security</h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg">
            How SecurePay protects accounts, records, systems and participation.
          </p>
        </div>
      </div>

      {/* Pillars strip */}
      <div className="border-b border-[#1a1a1a]/5 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {PILLARS.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: G + '12' }}>
                  <p.icon size={15} style={{ color: G }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{p.title}</p>
                  <p className="text-xs text-[#1a1a1a]/50 mt-0.5 leading-snug">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
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
        <TrustNote text="Security is a shared responsibility. SecurePay takes reasonable platform-level measures, but participants are responsible for protecting their own access credentials and account activity. This page is for general information and does not constitute a security warranty." />
      </div>

      <LegalFooter />
    </div>
  );
}
