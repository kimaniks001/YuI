import { useState } from 'react';
import { Eye } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { LegalNav, LegalFooter, TrustNote, FAQAccordion } from '../components/LegalLayout';

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `This Privacy Notice explains how SecurePay (operated by Keyman Oak Limited, "SecurePay", "we", "us") handles information related to your use of SecurePay services, including the SecurePay platform, SecureLinks, Group SecureLinks, KS Numbers, evidence submissions, approvals, reviews and related features.

By using SecurePay, you acknowledge that you have read and understood this Privacy Notice. If you do not agree with how SecurePay handles information as described here, you should not use the platform.

This Notice is part of the SecurePay Terms and Conditions.`,
  },
  {
    id: 'information-collected',
    title: '2. Information SecurePay Collects',
    content: `SecurePay collects information in the following categories:

Registration and identity information: When you register for a KS Number or SecurePay account, we collect your name, phone number, email address, identification details (where provided) and business or organisation details (where applicable).

Platform activity: We collect records of your SecureLink agreements, Group SecureLinks, contributions, approvals, reviews, evidence submissions, payment readiness confirmations and related platform activity.

Communication records: Where you communicate through SecurePay systems (messages, review submissions, support requests), those records are retained as part of your account and activity history.

Device and access information: We collect information about how you access and use SecurePay, including device type, operating system, browser, IP address and session data, for security and operational purposes.

Payment-related information: Where payments are processed through SecurePay or its infrastructure partners, relevant payment records are associated with your account.

Evidence and uploads: Photos, documents, GPS records and other content you upload as evidence within SecurePay are stored and associated with the relevant agreement or collection record.

Third-party and partner information: Where SecurePay works with banking, mobile money or payment infrastructure partners, information may be exchanged with those partners to the extent necessary to process payments or meet legal requirements.`,
  },
  {
    id: 'how-information-used',
    title: '3. How SecurePay Uses Information',
    content: `SecurePay uses the information it collects to:

Operate the platform: Process SecureLink agreements, Group SecureLinks, KS Number registrations, contributions, approvals, reviews and payment readiness determinations.

Verify identity: Confirm that participants are who they say they are and that activity is connected to identifiable individuals, businesses or organisations.

Facilitate payments: Enable money to move through SecurePay infrastructure and partner payment rails when agreements reach Payment Ready status.

Maintain records: Keep accurate records of agreements, collections, evidence, approvals, reviews and payment history for participants and as required by law.

Manage security: Detect fraud, abuse, impersonation, unauthorised access and other security risks.

Comply with legal obligations: Respond to lawful court orders, regulatory requirements, tax authority requests and other binding legal obligations.

Improve the platform: Understand how participants use SecurePay and improve platform features, security, reliability and user experience.

Communicate with participants: Send important account notices, agreement updates, Group SecureLink activity, security alerts and platform communications.

Support dispute resolution: Provide records, evidence and context relevant to reviews or disputes when required.`,
  },
  {
    id: 'visibility',
    title: '4. Visibility and Sharing Between Participants',
    content: `SecurePay is designed so that participants can see information relevant to their agreements and collections. Understand what is visible:

SecureLink parties: Both parties to a SecureLink can see the agreement terms, evidence, payment status, approvals, reviews and payment readiness status.

Group SecureLink contributors: Contributors to a Group SecureLink can see the collection purpose, target (if set), progress, their own contribution records, and the collection organiser's KS Number or name as shown on the Group SecureLink.

Group SecureLink organisers: Organisers can see contributor activity, total collected amounts, collection progress and governance-related information.

KS Numbers: A KS Number is a platform identity. The name or display details associated with a KS Number may be visible to participants who interact with that KS Number through a SecureLink or Group SecureLink.

Approvers and governance roles: Participants with governance or approver roles within an organisation's SecurePay structure can see the information relevant to their approval responsibilities.

Review participants: Where an agreement review is initiated, review-related information is visible to the relevant parties as part of the review process.

SecurePay does not make your information publicly searchable by default. Visibility is governed by the relationships and roles you participate in within the platform.`,
  },
  {
    id: 'information-sharing',
    title: '5. Information SecurePay Shares with Third Parties',
    content: `SecurePay shares information with third parties only in the following circumstances:

Payment and banking infrastructure partners: To process payments, mobile money transfers and settlement, SecurePay may share relevant payment information with licensed financial infrastructure partners. This is necessary to operate the payment function.

Legal and regulatory authorities: SecurePay will disclose information in response to valid court orders, regulatory requirements, law enforcement requests and other binding legal obligations, to the extent required by law.

KYC and AML service providers: SecurePay may use identity verification, Know Your Customer (KYC) and Anti-Money Laundering (AML) service providers to verify participant identity and meet compliance obligations.

Security and fraud service providers: SecurePay may use third-party services to detect and prevent fraud, abuse, impersonation and security threats.

Professional advisors: SecurePay may share information with legal advisors, accountants or auditors under appropriate confidentiality arrangements.

Successor entities: If SecurePay or any part of its business is acquired, merged or transferred, participant information may be transferred as part of that transaction.

SecurePay does not sell participant information to third parties for marketing purposes.`,
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    content: `SecurePay retains information for as long as is necessary to:

Operate your account and provide platform services while your account is active.

Maintain records of agreements, collections, evidence, reviews and payment history as required for platform integrity and dispute resolution.

Comply with legal, regulatory, tax and audit obligations, which may require retention for specified periods after account closure or transaction completion.

Support security and fraud prevention investigations.

When information is no longer required for these purposes, SecurePay will take reasonable steps to delete or anonymise it in accordance with applicable law. Some records may be retained in anonymised or aggregated form even after your account is closed.`,
  },
  {
    id: 'security',
    title: '7. How SecurePay Protects Information',
    content: `SecurePay takes reasonable technical and organisational measures to protect information against unauthorised access, disclosure, alteration or loss. These measures include access controls, encryption where appropriate, audit logging and security monitoring.

No system is completely secure. SecurePay does not guarantee that information will be free from all possible security risks. Participants should also take responsibility for protecting their own account credentials and access.

See the SecurePay Security page for more information about platform security practices.`,
  },
  {
    id: 'participant-rights',
    title: '8. Participant Rights',
    content: `Subject to applicable law, you may have rights in relation to the personal information SecurePay holds about you. These may include:

Access: Requesting a copy of information SecurePay holds about you.

Correction: Requesting correction of inaccurate information.

Deletion: Requesting deletion of information, subject to legal and operational retention requirements.

Objection: Objecting to certain uses of your information.

The exercise of these rights may be limited where SecurePay is required to retain information by law, for security purposes, or to maintain the integrity of platform records. To make a request relating to your information, contact SecurePay through the platform support channel.`,
  },
  {
    id: 'cookies',
    title: '9. Cookies and Tracking',
    content: `SecurePay uses cookies and similar technologies to operate the platform, maintain session state, support security, and understand how participants use the platform. These may include:

Essential cookies: Required for the platform to function, including session management and security features.

Analytics cookies: Used to understand how participants navigate and use SecurePay, to improve the platform experience. These are used in aggregate and are not used to identify individual participants for marketing.

SecurePay does not use tracking technologies for third-party advertising purposes.`,
  },
  {
    id: 'minors',
    title: '10. Minors',
    content: `SecurePay is not intended for use by persons under the age of 18. If you are under 18, you should not register for a KS Number or use SecurePay independently. Where a minor's school fees, welfare or other interests are the subject of a Group SecureLink or SecureLink, the account and responsibility must be held by an adult.

If SecurePay becomes aware that a minor has registered an account without appropriate authority, SecurePay may suspend or close that account.`,
  },
  {
    id: 'updates',
    title: '11. Updates to This Notice',
    content: `SecurePay may update this Privacy Notice from time to time. When material changes are made, SecurePay will notify participants through the platform or by other appropriate means. Continued use of SecurePay after notice of changes constitutes acceptance of the updated Privacy Notice.

The current version of this Privacy Notice is always available at securepay.ke/privacy.`,
  },
  {
    id: 'governing-law',
    title: '12. Governing Law',
    content: `This Privacy Notice is governed by the laws of Kenya, including the Kenya Data Protection Act, 2019 and any regulations made under it. Any disputes regarding this Notice are subject to Kenyan jurisdiction.`,
  },
  {
    id: 'contact',
    title: '13. Contact',
    content: `For privacy-related questions, requests or concerns, contact SecurePay through the platform support channel at securepay.ke/help. SecurePay will respond to requests in accordance with applicable law and platform procedures.`,
  },
];

const FAQS = [
  {
    q: 'Can other people see my name on SecurePay?',
    a: 'Your name or KS Number display details may be visible to participants who interact with you through a SecureLink or Group SecureLink. SecurePay does not make your information publicly searchable by default.',
  },
  {
    q: 'Can collection contributors see who else contributed?',
    a: 'Visibility of individual contributor identities on a Group SecureLink depends on the collection settings. Organisers can see contributor activity. Whether contributors can see each other depends on the collection configuration.',
  },
  {
    q: 'Does SecurePay share my data with banks?',
    a: 'SecurePay may share relevant payment information with licensed financial infrastructure partners to process payments. SecurePay does not sell your information to third parties for marketing.',
  },
  {
    q: 'Can I request deletion of my data?',
    a: 'Subject to applicable law, you may request deletion of information SecurePay holds about you. Deletion may be limited where SecurePay is required to retain records by law or for platform integrity.',
  },
  {
    q: 'Does SecurePay comply with the Kenya Data Protection Act?',
    a: "SecurePay operates under Kenyan law, including the Kenya Data Protection Act, 2019. This Privacy Notice reflects SecurePay's obligations under applicable law.",
  },
];

export default function PrivacyPage() {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <LegalNav />

      <div style={{ background: '#1e4d10' }} className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-white/30" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Privacy · SecurePay.ke</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-snug">Privacy Notice</h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg">
            How SecurePay handles participant information, visibility, records and permissions.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-white/30">Effective: January 2025</span>
            <span className="text-white/15">·</span>
            <span className="text-[10px] text-white/30">Governing law: Kenya</span>
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
        <TrustNote text="This Privacy Notice governs how SecurePay handles participant information. SecurePay is not a bank. This Notice does not constitute legal advice. For questions, contact SecurePay through the platform support channel." />
      </div>

      <LegalFooter />
    </div>
  );
}
