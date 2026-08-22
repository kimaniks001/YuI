import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown } from 'lucide-react';
import { LegalNav, LegalFooter, TrustNote } from '../components/LegalLayout';

const G = '#3a7a1f';

const SECTIONS = [
  {
    id: 'introduction', title: '1. Introduction',
    content: `These Terms and Conditions ("Terms") govern your use of SecurePay.ke, operated by Keyman Oak Limited ("SecurePay", "we", "our" or "us"), a company incorporated in Kenya. By creating an account, using SecurePay services, creating a KS Number, creating a SecureLink, creating a Group SecureLink, contributing to a collection or accessing the platform in any way, you agree to be bound by these Terms.

If you do not agree to these Terms, you should not use SecurePay.`,
  },
  {
    id: 'guiding-principle', title: '2. Guiding Principle',
    content: `SecurePay's guiding principle is: Money should follow the agreement.

This means SecurePay is designed to help money move according to what participants agreed — based on work done, delivery confirmed, evidence submitted, approvals given and conditions satisfied. SecurePay provides tools for structuring this process. It does not guarantee outcomes.`,
  },
  {
    id: 'securepay-role', title: '3. SecurePay\'s Role',
    content: `SecurePay is an agreement-driven payment platform. SecurePay is not a bank, deposit-taking institution, insurer, guarantor, court of law, legal representative or investment platform.

Banking and payment services where offered may be provided through licensed financial infrastructure partners. SecurePay's role is to help structure agreements, collections, evidence, reviews, approvals and payment readiness — not to guarantee the conduct or performance of participants.`,
  },
  {
    id: 'definitions', title: '4. Definitions',
    content: `"SecurePay" or "Platform" means the SecurePay.ke platform operated by Keyman Oak Limited.
"KS Number" means a unique SecurePay identity assigned to a registered participant.
"SecureLink" means an agreement-backed payment link created through the platform.
"Group SecureLink" means a shared-purpose payment collection link created through the platform.
"Agreement Account" means the structure used to keep payment connected to an agreement until Payment Ready status is reached.
"Payment Ready" means the status at which agreement conditions have been satisfied and funds are eligible to move.
"Evidence" means photos, documents, GPS records, written confirmations or other materials submitted to support agreement status.
"Agreement Review" means a structured process to examine an agreement when a question arises before Payment Ready status is confirmed.
"Approver" means a participant authorized to approve specific actions on behalf of an organization.
"Governance" means the way an organization defines authority, approvers and approval processes within SecurePay.
"Participant" means any individual, business or organization using the platform.`,
  },
  {
    id: 'ks-number-registration', title: '5. KS Number Registration',
    content: `To access full SecurePay services, participants must register a KS Number. KS Numbers may be individual, business or organization type. Participants must provide accurate, complete and current information. Impersonation, false registration or misrepresentation of identity is prohibited and may result in suspension or termination. Participants are responsible for maintaining the confidentiality of their login credentials.`,
  },
  {
    id: 'verification', title: '6. Verification',
    content: `SecurePay may request identity verification to support KYC requirements, banking partner obligations, legal compliance or platform integrity. Verification helps confirm identity but does not guarantee conduct, performance or honesty. Verification documents submitted must be genuine. Submitting false documents constitutes a breach of these Terms.`,
  },
  {
    id: 'activation', title: '7. Activation',
    content: `Activation keeps a KS Number ready to participate fully in SecurePay services. Activation may require a periodic fee. Applicable fees are shown before payment is completed. A KS Number that is not activated may have limited access to platform services. Activation fees and applicable terms are shown within the platform and may be updated from time to time.`,
  },
  {
    id: 'agreement-review-reserve', title: '8. Agreement Review Reserve',
    content: `A portion of applicable activation fees may be allocated as an Agreement Review Reserve. This reserve may be used to support the cost of Agreement Review processes where applicable. Participants should not treat the Agreement Review Reserve as a savings deposit, an investment or a refundable amount under all circumstances. Terms governing the reserve are set within the platform.`,
  },
  {
    id: 'account-security', title: '9. Account Security',
    content: `Participants are responsible for maintaining the confidentiality of their login credentials and for all activity under their accounts. Suspected unauthorized access should be reported immediately. SecurePay is not liable for loss resulting from unauthorized account access where the participant failed to take reasonable security precautions.`,
  },
  {
    id: 'ks-profiles', title: '10. KS Profiles',
    content: `A KS Profile is the public-facing identity associated with a KS Number. Participants may control what information appears on their public profile within available platform settings. Profiles must be truthful. Misrepresentation on a KS Profile breaches these Terms.`,
  },
  {
    id: 'securelinks', title: '11. SecureLinks',
    content: `SecureLinks are agreement-backed payment links created by a participant (creator) for a specific counterpart or purpose. Both parties are responsible for the accuracy of agreement terms, the quality of evidence submitted and their conduct under the agreement. SecurePay records the SecureLink and its activity but does not guarantee delivery, performance or payment.`,
  },
  {
    id: 'agreement-responsibility', title: '12. Agreement Responsibility',
    content: `Participants who create or accept SecureLinks accept responsibility for their conduct under the agreement. SecurePay does not mediate, arbitrate or guarantee agreement outcomes. Participants retain their lawful rights to pursue remedies outside the platform.`,
  },
  {
    id: 'evidence', title: '13. Evidence',
    content: `Participants may submit evidence — photos, documents, notes, GPS records, confirmations — to support agreement completion. Evidence must be genuine and relevant to the agreement. Submitting false, manipulated or misleading evidence is prohibited and may result in account restrictions. SecurePay stores submitted evidence as part of the agreement record.`,
  },
  {
    id: 'agreement-reviews', title: '14. Agreement Reviews',
    content: `Either party may request an Agreement Review when a genuine question arises about whether agreement conditions have been met. Agreement Reviews are a structured platform process — they are not legal proceedings, binding arbitration or court decisions. SecurePay does not determine liability. Participants retain lawful remedies outside the platform.`,
  },
  {
    id: 'payment-ready', title: '15. Payment Ready',
    content: `Payment Ready status is reached when agreement conditions are confirmed as satisfied — evidence submitted, approvals given and conditions verified. Only when an agreement is Payment Ready can funds move. Payment Ready status requires conscious confirmation from relevant parties and is not automatic.`,
  },
  {
    id: 'release-of-funds', title: '16. Release of Funds',
    content: `Upon reaching Payment Ready status, funds move to the recipient through the agreed payment method. Release timing depends on the agreement structure and applicable payment processes. SecurePay does not guarantee release timing where infrastructure or external factors cause delays. SecurePay is not liable for payment processing delays by third-party payment partners.`,
  },
  {
    id: 'collection-links', title: '17. Group SecureLinks',
    content: `Group SecureLinks allow a collection owner to collect funds from multiple contributors toward a stated purpose. Collection owners are responsible for the accuracy of the stated purpose, the management of collected funds and compliance with applicable law. Contributors participate based on the stated purpose and collection terms. SecurePay provides the collection structure and records but does not guarantee the use of collected funds.`,
  },
  {
    id: 'collection-responsibility', title: '18. Collection Responsibility',
    content: `Collection owners must use collected funds for the stated purpose. Misappropriation of collection funds, false collection purposes or fraudulent collection activity breaches these Terms and may be reported to law enforcement. Contributors are responsible for their own decision to contribute.`,
  },
  {
    id: 'organizations', title: '19. Organization Accounts',
    content: `Organizations including schools, churches, estates, chamas, welfare groups and companies may create organization KS Numbers. Organizations are responsible for maintaining accurate governance records, approver information and leadership updates within the platform.`,
  },
  {
    id: 'approvers', title: '20. Approvers',
    content: `Approvers are individuals authorized by an organization to approve specific platform actions. Approvers must have valid KS Numbers. Approvers are responsible for acting in accordance with the organization's governance requirements. SecurePay records approver actions but does not verify the internal authority of approvers beyond platform registration.`,
  },
  {
    id: 'agreement-accounts', title: '21. Agreement Accounts',
    content: `The Agreement Account is the structure used to keep payment connected to an agreement until Payment Ready status is reached. The Agreement Account is not a bank account, savings account or investment account. It does not earn interest. It is a payment structuring mechanism within the platform.`,
  },
  {
    id: 'ownership-of-funds', title: '22. Ownership of Funds',
    content: `Funds processed through SecurePay remain the property of the parties entitled to them under the applicable agreement, collection or legal requirements. SecurePay does not claim ownership of funds. SecurePay is not a custodian, trustee or bank for participant funds.`,
  },
  {
    id: 'no-interest', title: '23. No Interest Expectation',
    content: `Participants should not use SecurePay expecting interest, investment returns, profits or financial yield on funds processed through the platform. SecurePay is not an investment platform and does not offer savings products.`,
  },
  {
    id: 'fees', title: '24. Fees',
    content: `SecurePay may charge fees for activation, SecureLinks, Group SecureLinks, reviews, verification, wallet services, business account services and other platform services. Applicable fees should be displayed before payment is completed. Fees are subject to change. Current fees are displayed within the platform. Where third-party payment or banking infrastructure fees apply, they should be shown where technically available.`,
  },
  {
    id: 'prohibited-activities', title: '25. Prohibited Activities',
    content: `You must not use SecurePay for fraud, identity abuse, money laundering, terrorist financing, false evidence, misrepresentation, illegal activity, unauthorized collection activities, platform abuse or circumvention of controls. Violations may result in immediate suspension, termination and referral to law enforcement.`,
  },
  {
    id: 'compliance', title: '26. Compliance',
    content: `SecurePay may apply KYC and AML measures in compliance with applicable Kenyan law and banking partner requirements. SecurePay may comply with valid court orders, regulatory directives, banking requirements and other legal obligations under Kenyan law. Records may be maintained as required by law or platform operations.`,
  },
  {
    id: 'suspension-termination', title: '27. Suspension and Termination',
    content: `SecurePay may suspend, restrict or terminate a KS Number or account where there are reasonable concerns involving fraud, abuse, false information, security risks, regulatory requirements or legal obligations. Participants may appeal suspension in accordance with platform procedures where available.`,
  },
  {
    id: 'governing-law', title: '28. Governing Law',
    content: `These Terms are governed by the laws of Kenya. Any disputes arising from or relating to these Terms or the use of SecurePay are subject to the jurisdiction of Kenyan courts unless otherwise agreed in writing.`,
  },
  {
    id: 'dispute-resolution', title: '29. Dispute Resolution',
    content: `SecurePay provides Agreement Review tools as a structured platform process. These are not binding arbitration and do not constitute legal proceedings. Participants retain their lawful rights to pursue disputes through the courts or lawful mediation processes under Kenyan law. SecurePay records may be available as evidence where legally required.`,
  },
  {
    id: 'no-guarantee', title: '30. No Guarantee of Outcomes',
    content: `SecurePay does not guarantee agreement performance, delivery, payment, collection success, review outcomes or any other outcome for any participant. The platform provides tools and records. Participants remain responsible for their decisions, agreements, conduct and results.`,
  },
  {
    id: 'limitation-of-liability', title: '31. Limitation of Liability',
    content: `To the maximum extent permitted by Kenyan law, Keyman Oak Limited is not liable for losses arising from the actions or inaction of third parties, payment failures outside our reasonable control, disputes between participants, reliance on platform records as legal evidence, unauthorized account access where reasonable security precautions were not taken, or any indirect, consequential or incidental loss. SecurePay records agreements — it does not guarantee their fulfilment.`,
  },
  {
    id: 'records', title: '32. Records',
    content: `SecurePay maintains records of platform activity including agreements, collections, evidence, reviews, approvals and payment activity. Records are maintained as part of normal platform operations and in accordance with applicable legal and regulatory requirements. Participants may access records relating to their own activity within the platform.`,
  },
  {
    id: 'changes-to-terms', title: '33. Changes to Terms',
    content: `SecurePay may update these Terms from time to time. Material changes will be communicated through the platform or by email where possible. Continued use of SecurePay after changes constitutes acceptance of the updated Terms.`,
  },
  {
    id: 'severability', title: '34. Severability',
    content: `If any provision of these Terms is found to be invalid, illegal or unenforceable, the remaining provisions shall continue to apply to the fullest extent permitted by law.`,
  },
  {
    id: 'entire-agreement', title: '35. Entire Agreement',
    content: `These Terms, together with SecurePay's Privacy Policy and any additional terms applicable to specific services, constitute the entire agreement between you and SecurePay regarding your use of the platform.`,
  },
  {
    id: 'final-principle', title: '36. Final Principle',
    content: `Money should follow the agreement. SecurePay exists to help make that happen — through identity, structure, evidence, reviews, approvals and clear records. Participants who use the platform in good faith, honestly and in accordance with these Terms are contributing to a more trustworthy way of doing business in Kenya.`,
  },
];

function TocItem({ id, title }: { id: string; title: string }) {
  return (
    <a href={`#${id}`}
      className="block text-xs text-[#1a1a1a]/50 hover:text-[#3a7a1f] transition-colors py-0.5 leading-relaxed">
      {title}
    </a>
  );
}

function Section({ id, title, content }: { id: string; title: string; content: string }) {
  return (
    <div id={id} className="pt-2">
      <h2 className="text-base font-bold text-[#1a1a1a] mb-2">{title}</h2>
      <div className="text-sm text-[#1a1a1a]/65 leading-relaxed space-y-2">
        {content.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}

export default function TermsPage() {
  const [tocOpen, setTocOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#fafaf8' }}>
      <LegalNav />

      {/* Header banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 md:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-start gap-2.5">
          <span className="text-amber-500 font-bold text-sm flex-shrink-0">!</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            These Terms govern the use of SecurePay. If you do not agree, you should not use SecurePay.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Title block */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: G + '12' }}>
            <Shield size={20} style={{ color: G }} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">Terms and Conditions</h1>
            <p className="text-xs text-[#1a1a1a]/40 mt-1">SecurePay.ke · Keyman Oak Limited · Last updated: July 2026 · Version 1.0</p>
          </div>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
          {/* TOC — sticky on desktop */}
          <div className="md:sticky md:top-20 space-y-2">
            <button onClick={() => setTocOpen(v => !v)}
              className="md:hidden flex items-center justify-between w-full bg-white border border-[#1a1a1a]/8 rounded-2xl px-4 py-3 text-sm font-semibold text-[#1a1a1a]/60">
              Table of Contents
              <ChevronDown size={14} className={`transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`bg-white border border-[#1a1a1a]/6 rounded-2xl p-4 space-y-0.5 ${tocOpen ? 'block' : 'hidden md:block'}`}>
              <p className="text-[9px] font-bold text-[#1a1a1a]/30 uppercase tracking-wider mb-2">Contents</p>
              {SECTIONS.slice(0, 18).map(s => <TocItem key={s.id} id={s.id} title={s.title} />)}
              <p className="text-[9px] font-bold text-[#1a1a1a]/20 uppercase tracking-wider mt-3 mb-1">Continued</p>
              {SECTIONS.slice(18).map(s => <TocItem key={s.id} id={s.id} title={s.title} />)}
            </div>
          </div>

          {/* Terms body */}
          <div className="bg-white border border-[#1a1a1a]/6 rounded-2xl p-6 md:p-8 space-y-6 divide-y divide-[#1a1a1a]/5">
            {SECTIONS.map(s => (
              <div key={s.id} className="pt-6 first:pt-0">
                <Section {...s} />
              </div>
            ))}

            {/* Contact */}
            <div className="pt-6">
              <h2 className="text-base font-bold text-[#1a1a1a] mb-2">Contact</h2>
              <p className="text-sm text-[#1a1a1a]/55 leading-relaxed">
                For queries about these Terms, contact us through the{' '}
                <Link to="/help" className="hover:underline" style={{ color: G }}>Help Center</Link> or{' '}
                <Link to="/ask-securepay" className="hover:underline" style={{ color: G }}>Ask SecurePay</Link>.
                Support contact details will be added before launch.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TrustNote text="These Terms are provided for general information. They are subject to update. Continued use of SecurePay constitutes acceptance of the current Terms. This is not legal advice." />
      <LegalFooter />
    </div>
  );
}
