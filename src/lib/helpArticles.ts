export interface HelpSection {
  heading?: string;
  body: string;
}

export interface HelpAction {
  label: string;
  to: string;
  color?: string;
}

export interface HelpArticle {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  shortAnswer: string;
  sections: HelpSection[];
  example?: string;
  summary: string;
  relatedSlugs: string[];
  actions: HelpAction[];
}

export const HELP_CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', description: 'Understand what SecurePay is and why it exists.' },
  { id: 'ks-numbers', label: 'KS Numbers & Activation', description: 'Your SecurePay identity and how it works.' },
  { id: 'securelinks', label: 'SecureLinks', description: 'Agreement-backed payment links for one-to-one transactions.' },
  { id: 'collection-links', label: 'Group SecureLinks', description: 'Collect money from many people toward one purpose.' },
  { id: 'evidence-reviews', label: 'Evidence & Reviews', description: 'Proof, photos, and what happens when there is a question.' },
  { id: 'money-accounts', label: 'Money, Accounts & Releases', description: 'Where money sits and how it moves.' },
  { id: 'organizations', label: 'Organizations, Governance & Approvals', description: 'How groups, churches, schools and estates use SecurePay.' },
  { id: 'safety-trust', label: 'Safety, Trust & Platform Rules', description: 'How SecurePay protects participants.' },
] as const;

export const HELP_ARTICLES: HelpArticle[] = [
  // ── GETTING STARTED ────────────────────────────────────────────────────────

  {
    slug: 'what-is-securepay',
    title: 'What is SecurePay?',
    category: 'getting-started',
    tags: ['getting-started', 'agreement', 'money-should-follow-the-agreement', 'overview'],
    shortAnswer:
      'SecurePay is an agreement-driven payment platform that helps money follow the agreement — not just the person who sent it.',
    sections: [
      {
        body: 'SecurePay helps two or more people structure a payment so that money only moves when agreed conditions are met. Instead of sending money and hoping the other side delivers, you attach the payment to the agreement itself.',
      },
      {
        heading: 'How it works',
        body: 'You create a SecureLink (for one-to-one payments) or a Group SecureLink (for many contributors to one purpose). The link holds the agreement details, what evidence is needed, and when money should move. Both sides stay in the picture.',
      },
      {
        heading: 'Who uses SecurePay?',
        body: 'Landlords and tenants. Fundis and clients. Chamas and members. Churches and congregations. Schools and parents. Contractors and developers. Diaspora investors and local builders. Anyone who needs money to follow an agreement.',
      },
      {
        heading: 'What SecurePay is not',
        body: 'SecurePay is not a bank, insurer, guarantor, court or investment platform. Banking and payment services may be provided through licensed financial infrastructure partners. SecurePay helps structure agreements and payment conditions — participants remain responsible for their own decisions.',
      },
    ],
    example:
      'James needs to pay a plumber KES 15,000 to fix his roof. Instead of sending money directly, James creates a SecureLink. The plumber accepts the link. When the work is done and James is satisfied, money becomes Payment Ready and moves to the plumber.',
    summary: 'SecurePay structures payments around agreements so money follows the agreement, not just trust.',
    relatedSlugs: ['why-not-just-send-money', 'is-securepay-a-bank', 'what-is-a-securelink', 'money-should-follow-agreement'],
    actions: [
      { label: 'Create a SecureLink', to: '/create', color: '#3a7a1f' },
      { label: 'Create a Group SecureLink', to: '/create', color: '#0891b2' },
      { label: 'Get a KS Number', to: '/ks-number', color: '#e87c1e' },
    ],
  },

  {
    slug: 'money-should-follow-agreement',
    title: 'What does "Money should follow the agreement" mean?',
    category: 'getting-started',
    tags: ['getting-started', 'agreement', 'money-should-follow-the-agreement', 'principle'],
    shortAnswer:
      '"Money should follow the agreement" means that payment should be connected to what was agreed — not sent in advance and hoped for.',
    sections: [
      {
        body: 'In many everyday transactions, money is sent before the work is done or goods are delivered. This creates risk for the payer. Or money is only paid after everything is done, creating risk for the worker. Both situations can lead to disagreement.',
      },
      {
        heading: 'The SecurePay principle',
        body: 'SecurePay structures the payment so it stays attached to the agreement. If the agreement says "pay when the roof is finished and inspected," the money waits until those conditions are confirmed. The payer does not lose money to someone who does not deliver. The worker is assured payment when they do.',
      },
      {
        heading: 'Why this matters in Kenya',
        body: 'Construction delays, incomplete delivery, unpaid workers and lost contributions are common. SecurePay does not eliminate all risk, but it gives both sides a clear record of what was agreed, what was delivered, and when money should move.',
      },
    ],
    example:
      'A church agrees to pay KES 500,000 for a new roof. The contractor wants the money before starting. The church wants to pay only after completion. With SecurePay, the payment is connected to milestones — foundation done, structure up, roofing complete. Both sides agree upfront. Money follows each milestone.',
    summary: 'Money should follow the agreement means payment is attached to delivery, not sent on hope.',
    relatedSlugs: ['what-is-securepay', 'why-not-just-send-money', 'what-is-payment-ready', 'what-is-evidence'],
    actions: [
      { label: 'Create a SecureLink', to: '/create', color: '#3a7a1f' },
      { label: 'Learn about Payment Ready', to: '/help/article/what-is-payment-ready', color: '#6b7280' },
    ],
  },

  {
    slug: 'why-not-just-send-money',
    title: 'Why not just send money?',
    category: 'getting-started',
    tags: ['getting-started', 'trust', 'risk', 'payment', 'mpesa'],
    shortAnswer:
      'Sending money without an agreement creates risk for both sides. SecurePay keeps the agreement, payment and proof together.',
    sections: [
      {
        body: 'Sending money directly — by M-Pesa or bank transfer — is fast and simple for small personal transactions. But when money is tied to work, delivery, approvals or shared contributions, sending it without structure creates problems.',
      },
      {
        heading: 'What can go wrong',
        body: 'The payer sends money and the goods or service never arrives. Or the worker completes the job but never gets paid. Contributions disappear without records. There is no agreed standard for what counts as "done." When a disagreement arises, there is no shared record to refer to.',
      },
      {
        heading: 'What SecurePay adds',
        body: 'SecurePay adds a structured layer on top of normal payment. You still pay by M-Pesa or normal channels. But the agreement, evidence, conditions and payment release are held together — so both sides know exactly what was agreed, what counts as proof, and when money should move.',
      },
      {
        heading: 'When direct payment is fine',
        body: 'SecurePay is not for every transaction. Buying a mandazi or paying a bodaboda driver does not need a SecureLink. SecurePay is most useful when the amount is significant, the outcome is uncertain, or both parties need a clear shared record.',
      },
    ],
    example:
      'Mary hires a painter for KES 30,000. She sends half upfront over M-Pesa. The painter does poor work and disappears. There is no agreement, no proof, no way to resolve it. With SecurePay, the agreement, payment and evidence are attached to one link both sides can refer to.',
    summary: 'SecurePay protects both sides by keeping the agreement, payment and proof together in one place.',
    relatedSlugs: ['what-is-securepay', 'money-should-follow-agreement', 'what-is-a-securelink', 'what-is-evidence'],
    actions: [
      { label: 'Create a SecureLink', to: '/create', color: '#3a7a1f' },
      { label: 'Check a link you received', to: '/trust', color: '#0891b2' },
    ],
  },

  {
    slug: 'is-securepay-a-bank',
    title: 'Is SecurePay a bank?',
    category: 'getting-started',
    tags: ['not-a-bank', 'financial-partners', 'trust', 'compliance'],
    shortAnswer:
      'No. SecurePay is not a bank, insurer, guarantor or financial institution. It is an agreement-driven payment platform.',
    sections: [
      {
        body: 'SecurePay does not take deposits, offer loans, pay interest or provide investment services. These are regulated activities that require a banking licence.',
      },
      {
        heading: 'What SecurePay does',
        body: 'SecurePay structures payment agreements between participants and tracks evidence, conditions and approval before money moves. Banking and payment infrastructure may be provided through licensed financial partners.',
      },
      {
        heading: 'What this means for you',
        body: 'SecurePay is not covered by deposit protection schemes. SecurePay does not guarantee payment outcomes. SecurePay helps structure the conditions under which money moves — but participants are responsible for their own decisions.',
      },
      {
        heading: 'Regulated partners',
        body: 'Where SecurePay uses licensed payment infrastructure, it will be disclosed. The platform operates within applicable Kenyan law and cooperates with lawful requests.',
      },
    ],
    summary: 'SecurePay is a payment structuring platform, not a bank. It does not hold deposits or guarantee outcomes.',
    relatedSlugs: ['where-does-money-sit', 'who-owns-the-money', 'does-securepay-pay-interest', 'what-is-securepay'],
    actions: [
      { label: 'Read the Terms', to: '/terms', color: '#6b7280' },
      { label: 'Learn about SecurePay', to: '/help/article/what-is-securepay', color: '#3a7a1f' },
    ],
  },

  // ── KS NUMBERS ─────────────────────────────────────────────────────────────

  {
    slug: 'what-is-ks-number',
    title: 'What is a KS Number?',
    category: 'ks-numbers',
    tags: ['ks-number', 'identity', 'profile', 'activation', 'account'],
    shortAnswer:
      'A KS Number is your SecurePay identity. It connects your agreements, collections, approvals and reputation to one permanent profile.',
    sections: [
      {
        body: 'KS stands for Key Store — your identity in the SecurePay network. A KS Number identifies you when creating SecureLinks, organizing collections, approving transactions, or building your reputation on the platform.',
      },
      {
        heading: 'What a KS Number lets you do',
        body: 'With a KS Number you can create SecureLinks, create Group SecureLinks, receive money through agreements, appear as an approver for organizations, build a verifiable trust profile, and be found by others on the platform.',
      },
      {
        heading: 'Individual, Business and Organization',
        body: 'You can create an Individual KS Number (for personal use), a Business KS Number (for a registered business or trader), or an Organization KS Number (for a church, school, chama or estate).',
      },
      {
        heading: 'Activation',
        body: 'A KS Number starts as a Starter account with limited access. Activation keeps your KS Number ready to participate fully in SecurePay services. Activation has a small periodic fee. Details are shown before any payment is made.',
      },
    ],
    example:
      'Samuel runs a hardware shop. He creates a Business KS Number. His customers can now create SecureLinks that reference his KS Number, send payments for materials, and leave reviews on his trust profile. Samuel can be found on SecurePay and his reputation grows with each completed agreement.',
    summary: 'A KS Number is your permanent SecurePay identity — used for agreements, collections, approvals and reputation.',
    relatedSlugs: ['what-is-securepay', 'what-is-governance', 'who-are-approvers'],
    actions: [
      { label: 'Create a KS Number', to: '/ks-number', color: '#3a7a1f' },
      { label: 'Go to Dashboard', to: '/dashboard', color: '#6b7280' },
    ],
  },

  // ── SECURELINKS ─────────────────────────────────────────────────────────────

  {
    slug: 'what-is-a-securelink',
    title: 'What is a SecureLink?',
    category: 'securelinks',
    tags: ['securelink', 'agreement', 'evidence', 'payment-ready', 'agreement-link'],
    shortAnswer:
      'A SecureLink is an agreement-backed payment link that holds the agreement, money conditions and evidence together in one place.',
    sections: [
      {
        body: 'A SecureLink lets two people — or two organizations — structure a payment around a real agreement. Instead of just sending money, you attach the agreement terms, what evidence is needed, and when the money should be released.',
      },
      {
        heading: 'What a SecureLink contains',
        body: 'A SecureLink holds the agreement description, the names of both parties, the amount, any milestones, what evidence is required for completion, and who needs to approve before money becomes Payment Ready.',
      },
      {
        heading: 'How payment moves',
        body: 'Payment does not happen automatically. When conditions are met — delivery confirmed, evidence submitted, milestones approved — the creator marks the agreement as Payment Ready. Money then moves according to the agreed process.',
      },
      {
        heading: 'Categories of SecureLinks',
        body: 'SecureLinks support many types of agreement: trade and goods, construction, service delivery, professional services, land transactions and more. Choose the category that fits your situation.',
      },
    ],
    example:
      'Grace orders 50 bags of cement from a hardware shop for KES 24,000. She creates a SecureLink with the hardware owner. The link holds the agreement (50 bags), the amount (KES 24,000) and the delivery condition. When cement arrives and Grace confirms delivery, the agreement becomes Payment Ready.',
    summary: 'A SecureLink keeps the agreement, payment and proof together so money follows the agreement.',
    relatedSlugs: ['when-to-use-securelink', 'what-is-evidence', 'what-is-payment-ready', 'what-is-agreement-review'],
    actions: [
      { label: 'Create a SecureLink', to: '/create', color: '#3a7a1f' },
      { label: 'Check a link you received', to: '/trust', color: '#0891b2' },
    ],
  },

  {
    slug: 'when-to-use-securelink',
    title: 'When should I use a SecureLink?',
    category: 'securelinks',
    tags: ['securelink', 'use-case', 'contractor', 'fundi', 'goods', 'land'],
    shortAnswer:
      'Use a SecureLink when money depends on work, delivery, evidence or approval between two specific parties.',
    sections: [
      {
        body: 'SecureLinks are best when there is a one-to-one agreement — one payer and one recipient — and the payment should be tied to delivery or conditions.',
      },
      {
        heading: 'Good situations for a SecureLink',
        body: 'Paying a contractor or fundi. Buying building materials. Hiring a freelancer. Paying a supplier. Buying land. Any situation where you want a shared record of what was agreed, what was delivered and when money should move.',
      },
      {
        heading: 'When a Group SecureLink might be better',
        body: 'If more than one person needs to contribute money toward the same purpose — school fees from many parents, rent from tenants, chama contributions — use a Group SecureLink instead.',
      },
      {
        heading: 'When neither is needed',
        body: 'For very small amounts, immediate exchanges or fully trusted personal payments, direct M-Pesa is fine. SecurePay is most useful when amounts are significant, delivery is uncertain, or a shared record matters.',
      },
    ],
    example:
      'Peter is building a house. He needs to pay a fundis group KES 120,000 in three stages: foundation, walls, roof. He creates one SecureLink with three milestones. Each milestone has an evidence requirement (photo confirmation). Payment is released per milestone when both sides confirm.',
    summary: 'Use a SecureLink when money depends on work, delivery, evidence or approval between two parties.',
    relatedSlugs: ['what-is-a-securelink', 'when-to-use-collection-link', 'what-is-evidence', 'what-is-payment-ready'],
    actions: [
      { label: 'Create a SecureLink', to: '/create', color: '#3a7a1f' },
      { label: 'Compare SecureLink vs Group SecureLink', to: '/help/article/when-to-use-collection-link', color: '#0891b2' },
    ],
  },

  // ── COLLECTION LINKS ────────────────────────────────────────────────────────

  {
    slug: 'what-is-a-collection-link',
    title: 'What is a Group SecureLink?',
    category: 'collection-links',
    tags: ['collection-link', 'welfare', 'rent', 'school-fees', 'church', 'estate', 'chama', 'harambee', 'mchango'],
    shortAnswer:
      'A Group SecureLink is a shared payment link that lets many people contribute toward one purpose — with clear records for everyone.',
    sections: [
      {
        body: 'A Group SecureLink is used when multiple people need to pay or contribute toward the same goal. The collection owner creates the link, sets the purpose, amount and rules, then shares it with contributors.',
      },
      {
        heading: 'What a Group SecureLink covers',
        body: 'Rent collection from multiple tenants. School fees from many parents. Church tithes or building fund contributions. Chama monthly contributions. Estate levies. Welfare or harambee fundraisers. Medical appeals. Funeral contributions.',
      },
      {
        heading: 'Types of collections',
        body: 'Welfare Collections (KES 10 per payment): for fundraisers, harambees, welfare contributions and medical appeals. General Collections (KES 20 per payment): for rent, school fees, chama contributions, estate levies and business collections.',
      },
      {
        heading: 'Visibility options',
        body: 'The collection owner can choose who sees contributor names and amounts. Options include fully visible (names and amounts shown), names only, amounts only, or private (only the owner sees details).',
      },
    ],
    example:
      'A school bursar creates a Group SecureLink for Term 2 fees. Each parent pays KES 15,000 through the link. The bursar can track who has paid and who has not. Parents see a clear record of their payment. No WhatsApp confusion, no lost receipts.',
    summary: 'A Group SecureLink collects money from many people toward one purpose, with records for all sides.',
    relatedSlugs: ['when-to-use-collection-link', 'can-contributors-see-who-paid', 'what-is-a-securelink'],
    actions: [
      { label: 'Create a Group SecureLink', to: '/create', color: '#0891b2' },
      { label: 'View Group SecureLink examples', to: '/situations', color: '#6b7280' },
    ],
  },

  {
    slug: 'when-to-use-collection-link',
    title: 'When should I use a Group SecureLink?',
    category: 'collection-links',
    tags: ['collection-link', 'rent', 'school-fees', 'chama', 'church', 'welfare', 'harambee', 'mchango'],
    shortAnswer:
      'Use a Group SecureLink when many people need to contribute to the same purpose — such as rent, school fees, chama, church or welfare.',
    sections: [
      {
        body: 'Group SecureLinks are designed for situations where one organizer needs to collect from many contributors. The link is shared and each person pays toward the same goal.',
      },
      {
        heading: 'Great uses for Group SecureLinks',
        body: 'Rent collection from a block of tenants. School fee payments from parents. Chama monthly contributions. Church tithe or building fund. Estate levies from homeowners. Harambee or medical fundraiser. Funeral contributions. Event ticket sales.',
      },
      {
        heading: 'When a SecureLink is better',
        body: 'If you have a one-to-one agreement — paying one contractor, one supplier or one service provider — use a SecureLink instead. Group SecureLinks are for many contributors to one purpose.',
      },
      {
        heading: 'Welfare vs General',
        body: 'If you are collecting for a welfare reason (medical, funeral, harambee), choose Welfare Collection — it has a lower fee. For business or regular collections (rent, fees, chama), choose General Collection.',
      },
    ],
    example:
      'The Greenvale Estate chairman creates a Group SecureLink for the annual security levy of KES 5,000 per household. All 40 homeowners receive the link. Each pays at their own time. The chairman tracks completion from the dashboard without chasing anyone individually.',
    summary: 'Use a Group SecureLink when collecting from many people toward one shared purpose.',
    relatedSlugs: ['what-is-a-collection-link', 'when-to-use-securelink', 'can-contributors-see-who-paid'],
    actions: [
      { label: 'Create a Group SecureLink', to: '/create', color: '#0891b2' },
      { label: 'Create a SecureLink instead', to: '/create', color: '#3a7a1f' },
    ],
  },

  {
    slug: 'can-contributors-see-who-paid',
    title: 'Can contributors see who has paid?',
    category: 'collection-links',
    tags: ['collection-link', 'contributor-visibility', 'privacy', 'transparency'],
    shortAnswer:
      'It depends on the visibility setting chosen by the collection owner when creating the link.',
    sections: [
      {
        body: 'When a collection owner creates a Group SecureLink, they choose a contributor visibility setting. This controls what contributors and viewers can see.',
      },
      {
        heading: 'Visibility options',
        body: 'Names and amounts visible: contributors can see everyone\'s name and contribution amount. Names only: contributors can see who has paid, but not how much. Amounts only: contributors can see amounts, but names are hidden. Private: only the collection owner sees contributor details.',
      },
      {
        heading: 'Why visibility choices matter',
        body: 'For some collections — like chama contributions — transparency builds accountability. For medical or welfare contributions, privacy may be more respectful. The collection owner chooses what works for their community.',
      },
      {
        heading: 'The collection owner always sees everything',
        body: 'Regardless of visibility setting, the collection owner can always see all contributor details. Visibility settings only affect what others can see.',
      },
    ],
    summary: 'Visibility is set by the collection owner. Contributors may see names, amounts, both or neither — depending on the setting chosen.',
    relatedSlugs: ['what-is-a-collection-link', 'when-to-use-collection-link'],
    actions: [
      { label: 'Create a Group SecureLink', to: '/create', color: '#0891b2' },
    ],
  },

  // ── EVIDENCE & REVIEWS ─────────────────────────────────────────────────────

  {
    slug: 'what-is-evidence',
    title: 'What is evidence?',
    category: 'evidence-reviews',
    tags: ['evidence', 'proof', 'photo', 'document', 'delivery-note', 'gps', 'confirmation'],
    shortAnswer:
      'Evidence is any proof that helps confirm what happened — photos, documents, GPS location, delivery notes or written confirmations.',
    sections: [
      {
        body: 'When a SecureLink involves work or delivery, evidence helps both sides confirm that conditions have been met. Evidence is submitted through SecurePay and stored with the agreement.',
      },
      {
        heading: 'Types of evidence',
        body: 'Photos of completed work or delivered goods. Signed delivery notes. Documents such as invoices or receipts. GPS location stamps. Written statements. Video recordings (where supported). Any combination of the above.',
      },
      {
        heading: 'Why evidence matters',
        body: 'Without evidence, disagreements become one person\'s word against another. Evidence creates a shared record that both sides agreed to. When evidence is submitted and accepted, the agreement can move toward Payment Ready.',
      },
      {
        heading: 'Who submits evidence?',
        body: 'Either party can submit evidence. Usually the person delivering the work or goods submits proof of completion. The other party reviews and confirms. If both agree, the agreement becomes Payment Ready.',
      },
    ],
    example:
      'A tiler completes bathroom work in an apartment. He takes photos of the finished tiles, uploads them to the SecureLink, and marks the work as complete. The apartment owner reviews the photos, confirms, and the agreement becomes Payment Ready. Both have a permanent record.',
    summary: 'Evidence is proof that conditions were met. It protects both sides and helps money follow the agreement.',
    relatedSlugs: ['what-is-agreement-review', 'what-is-payment-ready', 'what-if-someone-disagrees'],
    actions: [
      { label: 'Create a SecureLink', to: '/create', color: '#3a7a1f' },
      { label: 'Learn about Agreement Review', to: '/help/article/what-is-agreement-review', color: '#0891b2' },
    ],
  },

  {
    slug: 'what-is-agreement-review',
    title: 'What is an Agreement Review?',
    category: 'evidence-reviews',
    tags: ['review', 'evidence', 'disagreement', 'payment-ready', 'dispute'],
    shortAnswer:
      'An Agreement Review is a process used when there is a question about whether conditions were met before money is released.',
    sections: [
      {
        body: 'Not every agreement completes without a question. Sometimes the payer believes conditions were not met. Sometimes evidence is missing or disputed. An Agreement Review is requested when there is a genuine question about the state of the agreement.',
      },
      {
        heading: 'What happens during a review',
        body: 'Both parties are given the opportunity to submit their view and any additional evidence. SecurePay does not decide the outcome — it provides the structured process and record. The outcome depends on the evidence presented and the agreement terms originally agreed.',
      },
      {
        heading: 'What Agreement Review is not',
        body: 'An Agreement Review is not a court. It is not legal arbitration. It is not a guarantee of any outcome. It is a structured process within the SecurePay platform for resolving questions about agreement conditions.',
      },
      {
        heading: 'Agreement Review Reserve',
        body: 'A small portion of applicable transaction fees may be allocated to support the Agreement Review process. Details are shown before payments are made.',
      },
    ],
    example:
      'A landlord receives a Group SecureLink payment but the tenant believes the amount was wrong. The tenant requests an Agreement Review. Both submit their records. The process gives both sides a fair chance to be heard within the platform.',
    summary: 'An Agreement Review is a structured process within SecurePay for resolving genuine questions before money moves.',
    relatedSlugs: ['what-is-evidence', 'what-if-someone-disagrees', 'what-is-payment-ready'],
    actions: [
      { label: 'Learn about evidence', to: '/help/article/what-is-evidence', color: '#0891b2' },
      { label: 'Learn about Payment Ready', to: '/help/article/what-is-payment-ready', color: '#3a7a1f' },
    ],
  },

  {
    slug: 'what-if-someone-disagrees',
    title: 'What happens if someone disagrees?',
    category: 'evidence-reviews',
    tags: ['review', 'disagreement', 'dispute', 'evidence', 'complaint'],
    shortAnswer:
      'If there is a disagreement, either party can request an Agreement Review. SecurePay provides a structured process — not a legal decision.',
    sections: [
      {
        body: 'Disagreements can happen in any transaction. SecurePay provides a structured way to raise a concern when there is a genuine question about whether conditions were met.',
      },
      {
        heading: 'Steps when there is a disagreement',
        body: 'Either party can initiate an Agreement Review through the SecureLink. Both sides are given a chance to submit their evidence and explanation. The platform records everything. The process aims to help both sides resolve the question using the original agreement terms and submitted evidence.',
      },
      {
        heading: 'What SecurePay cannot do',
        body: 'SecurePay cannot force payment or non-payment. It cannot make legal judgments. It cannot guarantee any outcome. If a disagreement cannot be resolved within the platform, participants may need to seek appropriate legal or mediation support.',
      },
      {
        heading: 'Prevention is better than resolution',
        body: 'The best way to avoid disagreements is to create a clear agreement upfront. Describe the work precisely. Agree on what evidence counts. Set clear milestones. Both sides should understand what "done" looks like before payment is made.',
      },
    ],
    summary: 'SecurePay provides a structured Agreement Review process. It is not a court — clear agreements and evidence prevent most disagreements.',
    relatedSlugs: ['what-is-agreement-review', 'what-is-evidence', 'does-securepay-replace-courts'],
    actions: [
      { label: 'Learn about evidence', to: '/help/article/what-is-evidence', color: '#0891b2' },
      { label: 'Create a clear SecureLink', to: '/create', color: '#3a7a1f' },
    ],
  },

  // ── MONEY, ACCOUNTS & RELEASES ─────────────────────────────────────────────

  {
    slug: 'where-does-money-sit',
    title: 'Where does the money sit?',
    category: 'money-accounts',
    tags: ['agreement-account', 'funds', 'release', 'payment-ready', 'not-a-bank'],
    shortAnswer:
      'Money connected to a SecureLink sits within the Agreement Account structure until the agreement reaches Payment Ready status.',
    sections: [
      {
        body: 'When a payment is made through a SecureLink, it is connected to the agreement — not sent directly to the recipient immediately. This connection is what makes the payment follow the agreement, not just the sender\'s goodwill.',
      },
      {
        heading: 'Agreement Account',
        body: 'The Agreement Account is the structure used to keep money connected to an agreement. It is not a savings account. It is not an investment account. It does not earn interest. It is simply the mechanism that holds the payment attached to agreement conditions.',
      },
      {
        heading: 'When money moves',
        body: 'Money moves when the agreement reaches Payment Ready status — meaning conditions have been met, evidence has been submitted, and all required approvals are given. At that point, money moves to the recipient through the agreed payment method.',
      },
      {
        heading: 'SecurePay is not a bank',
        body: 'The Agreement Account is not a bank deposit. SecurePay is not a licensed bank. It does not pay interest, offer loans or provide financial services. Any banking infrastructure used is provided through licensed partners.',
      },
    ],
    example:
      'David pays KES 80,000 through a SecureLink for a completed fence. The money is connected to the agreement. The contractor marks the work done and submits photos. David confirms. The agreement becomes Payment Ready. Money moves to the contractor through M-Pesa.',
    summary: 'Money sits connected to the agreement until Payment Ready. It is not a bank deposit and does not earn interest.',
    relatedSlugs: ['what-is-payment-ready', 'who-owns-the-money', 'does-securepay-pay-interest', 'is-securepay-a-bank'],
    actions: [
      { label: 'Learn about Payment Ready', to: '/help/article/what-is-payment-ready', color: '#3a7a1f' },
      { label: 'Read about accounts', to: '/wallet', color: '#0891b2' },
    ],
  },

  {
    slug: 'what-is-payment-ready',
    title: 'What is Payment Ready?',
    category: 'money-accounts',
    tags: ['payment-ready', 'release', 'evidence', 'approval', 'ready-to-pay', 'funds-release'],
    shortAnswer:
      'Payment Ready means the agreement conditions have been met and money is eligible to move to the recipient.',
    sections: [
      {
        body: 'Payment Ready is the stage where an agreement has been confirmed as complete. Evidence has been submitted. Conditions have been verified. Required approvals have been given. At this point, money is eligible to move.',
      },
      {
        heading: 'How Payment Ready is reached',
        body: 'For a basic SecureLink: the delivering party submits evidence, the paying party reviews and confirms. For agreements with milestones: each milestone can become Payment Ready separately. For agreements with approvers: the approval chain must be completed before Payment Ready is confirmed.',
      },
      {
        heading: 'What happens after Payment Ready',
        body: 'Once an agreement is Payment Ready, money moves to the recipient through the agreed payment method — typically M-Pesa or a linked account. The timing depends on the agreement structure and applicable payment processes.',
      },
      {
        heading: 'Why Payment Ready is not instant',
        body: 'SecurePay does not release money automatically on a timer. Payment Ready requires conscious confirmation from the relevant parties. This protects both sides from automatic releases that either party has not agreed to.',
      },
    ],
    example:
      'A plumber fixes a water system. He marks the job complete and uploads three photos. The homeowner reviews, confirms the fix is good, and approves. The SecureLink becomes Payment Ready. Money moves to the plumber\'s M-Pesa within the processing timeframe.',
    summary: 'Payment Ready means all conditions are confirmed. Money is then eligible to move to the recipient.',
    relatedSlugs: ['where-does-money-sit', 'what-is-evidence', 'who-owns-the-money'],
    actions: [
      { label: 'Create a SecureLink', to: '/create', color: '#3a7a1f' },
      { label: 'Learn about evidence', to: '/help/article/what-is-evidence', color: '#0891b2' },
    ],
  },

  {
    slug: 'who-owns-the-money',
    title: 'Who owns the money?',
    category: 'money-accounts',
    tags: ['agreement-account', 'funds', 'release', 'payment-ready', 'ownership'],
    shortAnswer:
      'Money paid toward an agreement belongs to the parties according to the agreement terms. SecurePay does not claim ownership of funds.',
    sections: [
      {
        body: 'When money is paid toward a SecureLink or Group SecureLink, it belongs to the parties of that agreement — not to SecurePay. SecurePay provides the platform and structure, but does not take ownership of funds.',
      },
      {
        heading: 'Before Payment Ready',
        body: 'Before conditions are met, the situation is governed by the agreement terms both parties accepted when creating or joining the SecureLink. SecurePay\'s terms and any applicable legal framework determine what happens if the agreement cannot be completed.',
      },
      {
        heading: 'After Payment Ready',
        body: 'Once Payment Ready status is confirmed, money belongs to the recipient and moves through the normal payment process.',
      },
      {
        heading: 'Important note',
        body: 'SecurePay is not a bank or legal entity that holds money in a personal capacity. Any underlying payment infrastructure is provided through licensed partners. Consult SecurePay\'s terms of service for the full legal position.',
      },
    ],
    summary: 'The money belongs to the agreement parties — SecurePay provides the structure and platform, not ownership.',
    relatedSlugs: ['where-does-money-sit', 'what-is-payment-ready', 'is-securepay-a-bank', 'does-securepay-pay-interest'],
    actions: [
      { label: 'Read the Terms', to: '/terms', color: '#6b7280' },
    ],
  },

  {
    slug: 'does-securepay-pay-interest',
    title: 'Does SecurePay pay interest?',
    category: 'money-accounts',
    tags: ['not-a-bank', 'agreement-account', 'interest', 'investment'],
    shortAnswer:
      'No. SecurePay does not pay interest. The Agreement Account is not a savings or investment account.',
    sections: [
      {
        body: 'SecurePay structures agreement-based payments. It is not a financial institution and does not offer interest, returns, or investment services on money held within agreement structures.',
      },
      {
        heading: 'Why not?',
        body: 'The Agreement Account is designed to hold money connected to a specific agreement, not to earn returns. Offering interest on held funds would require banking and financial services licences that SecurePay does not hold.',
      },
      {
        heading: 'What this means for you',
        body: 'If you pay into a SecureLink, the amount you paid is the amount that moves when the agreement becomes Payment Ready — no more, no less. SecurePay fees are disclosed before payment and deducted from the transaction, not added as interest.',
      },
    ],
    summary: 'SecurePay does not pay interest. The Agreement Account is not a savings account.',
    relatedSlugs: ['is-securepay-a-bank', 'where-does-money-sit', 'who-owns-the-money'],
    actions: [
      { label: 'Read the Terms', to: '/terms', color: '#6b7280' },
      { label: 'Learn about fees', to: '/help', color: '#0891b2' },
    ],
  },

  // ── ORGANIZATIONS & GOVERNANCE ─────────────────────────────────────────────

  {
    slug: 'what-is-governance',
    title: 'What is governance?',
    category: 'organizations',
    tags: ['organization', 'approvers', 'church', 'school', 'estate', 'chama', 'governance'],
    shortAnswer:
      'Governance describes how an organization decides who has authority to act on its behalf on SecurePay.',
    sections: [
      {
        body: 'When an organization — a church, school, chama, estate or company — uses SecurePay, it needs a way to define who can approve payments, collections and releases. This is governance.',
      },
      {
        heading: 'Why governance matters',
        body: 'Without governance, one person can control a large organization\'s funds without any oversight. Governance allows organizations to require that multiple people approve significant actions — protecting the organization from misuse.',
      },
      {
        heading: 'What a Governance Profile includes',
        body: 'A Governance Profile defines the organization\'s leadership roles, which actions require approval, how many approvers are needed, and who fills those roles. Approvers must have valid KS Numbers.',
      },
      {
        heading: 'Different actions, different approvals',
        body: 'An organization can set different approval requirements for different types of actions. Releasing KES 500,000 might require three approvers. A routine KES 5,000 collection expense might only require one. Governance is flexible.',
      },
    ],
    example:
      'Blessed Community Church uses SecurePay for its building fund. The Governance Profile requires that any release above KES 50,000 must be approved by the Senior Pastor AND the Church Treasurer. This ensures no single person can release large amounts alone.',
    summary: 'Governance defines who has authority in an organization. It protects funds and ensures collective oversight.',
    relatedSlugs: ['who-are-approvers', 'what-is-ks-number', 'what-is-a-collection-link'],
    actions: [
      { label: 'Create an Organization KS Number', to: '/ks-number', color: '#3a7a1f' },
      { label: 'Learn about approvers', to: '/help/article/who-are-approvers', color: '#0891b2' },
    ],
  },

  {
    slug: 'who-are-approvers',
    title: 'Who are approvers?',
    category: 'organizations',
    tags: ['organization', 'approvers', 'church', 'school', 'estate', 'governance', 'approval-chain'],
    shortAnswer:
      'Approvers are individuals authorized to approve specific actions on behalf of an organization — such as releasing payments or confirming collections.',
    sections: [
      {
        body: 'In an organization using SecurePay, approvers are the designated people who must confirm before certain actions happen. They provide a layer of collective oversight for organizational funds.',
      },
      {
        heading: 'Why approvers need KS Numbers',
        body: 'Approvers must have valid KS Numbers because each approval is tied to a verified identity. This prevents someone from approving under a false name and creates an audit trail. If leadership changes, the Governance Profile is updated with new KS Numbers.',
      },
      {
        heading: 'What approvers can do',
        body: 'Approvers can approve Payment Ready status. They can approve collection releases. They can confirm agreement completions. Their specific permissions depend on the Governance Profile the organization sets up.',
      },
      {
        heading: 'Leadership changes',
        body: 'When an approver leaves or changes role, the organization updates the Governance Profile with the new person\'s KS Number. Previous approvals remain in the record — they are not changed or deleted.',
      },
    ],
    example:
      'An estate management committee has three trustees. The Governance Profile requires two of the three to approve any release. If Trustee A is unavailable, Trustees B and C can still approve. No single trustee can release funds alone.',
    summary: 'Approvers are the authorized individuals who confirm actions for an organization. They must have KS Numbers.',
    relatedSlugs: ['what-is-governance', 'what-is-ks-number', 'what-is-a-collection-link'],
    actions: [
      { label: 'Create an Organization KS Number', to: '/ks-number', color: '#3a7a1f' },
      { label: 'Learn about governance', to: '/help/article/what-is-governance', color: '#0891b2' },
    ],
  },

  // ── SAFETY & TRUST ─────────────────────────────────────────────────────────

  {
    slug: 'does-securepay-replace-courts',
    title: 'Does SecurePay replace the courts?',
    category: 'safety-trust',
    tags: ['review', 'legal', 'courts', 'not-a-court', 'dispute', 'platform-rules'],
    shortAnswer:
      'No. SecurePay is not a court. It provides a structured process within the platform, but cannot make legal decisions.',
    sections: [
      {
        body: 'SecurePay provides Agreement Reviews as a structured way to handle questions about whether conditions were met. This is a platform process — not a legal proceeding, arbitration or court order.',
      },
      {
        heading: 'What SecurePay can do',
        body: 'SecurePay can provide the agreement record, the submitted evidence, and the platform history of an agreement. It can structure the review process. It can help both sides see what was agreed and what was delivered.',
      },
      {
        heading: 'What SecurePay cannot do',
        body: 'SecurePay cannot force payment or withhold money by legal authority. It cannot arrest or prosecute anyone. It cannot make binding legal judgments. It cannot guarantee any outcome from an Agreement Review.',
      },
      {
        heading: 'When you may need legal support',
        body: 'If an agreement cannot be resolved within SecurePay and the amounts are significant, participants may need to consult a lawyer, the Dispute Resolution Centre of Kenya, or the courts. SecurePay records can be useful evidence in such proceedings.',
      },
      {
        heading: 'This is general guidance, not legal advice',
        body: 'SecurePay can explain how the platform works, but it cannot provide legal advice. Please consult a qualified legal professional for legal decisions.',
      },
    ],
    summary: 'SecurePay provides a structured review process, not a court. For serious disputes, seek appropriate legal support.',
    relatedSlugs: ['what-is-agreement-review', 'what-if-someone-disagrees', 'is-securepay-a-bank'],
    actions: [
      { label: 'Learn about Agreement Review', to: '/help/article/what-is-agreement-review', color: '#0891b2' },
      { label: 'Read the Terms', to: '/terms', color: '#6b7280' },
    ],
  },
];

// ── Utilities ──────────────────────────────────────────────────────────────────

export const SYNONYMS: Record<string, string[]> = {
  'secure link': ['securelink'],
  'payment link': ['securelink'],
  'agreement link': ['securelink'],
  'pay safely': ['securelink'],
  'securelink': ['securelink'],
  'collection': ['collection-link'],
  'mchango': ['collection-link', 'collection-links', 'harambee'],
  'harambee': ['collection-link', 'collection-links', 'welfare'],
  'rent': ['collection-link', 'collection-links', 'rent'],
  'school fees': ['collection-link', 'collection-links', 'school-fees'],
  'welfare': ['collection-link', 'collection-links', 'welfare'],
  'church': ['collection-link', 'church', 'organizations'],
  'chama': ['collection-link', 'collection-links', 'chama'],
  'estate': ['collection-link', 'estate', 'organizations'],
  'ks number': ['ks-number'],
  'account': ['ks-number', 'agreement-account'],
  'identity': ['ks-number'],
  'profile': ['ks-number'],
  'key store': ['ks-number'],
  'payment ready': ['payment-ready'],
  'release': ['payment-ready', 'release'],
  'ready to pay': ['payment-ready'],
  'funds release': ['payment-ready'],
  'evidence': ['evidence', 'proof'],
  'proof': ['evidence'],
  'photo': ['evidence'],
  'dispute': ['review', 'disagreement'],
  'disagreement': ['review'],
  'complaint': ['review'],
  'bank': ['not-a-bank'],
  'interest': ['not-a-bank'],
  'savings': ['not-a-bank', 'agreement-account'],
  'fundi': ['securelink', 'contractor'],
  'contractor': ['securelink'],
  'land': ['securelink'],
  'building': ['securelink', 'construction'],
  'cement': ['securelink', 'goods'],
};

export function searchArticles(query: string): HelpArticle[] {
  if (!query.trim()) return HELP_ARTICLES;
  const q = query.toLowerCase().trim();

  // Expand synonyms
  const expandedTerms = [q];
  for (const [syn, replacements] of Object.entries(SYNONYMS)) {
    if (q.includes(syn)) {
      expandedTerms.push(...replacements);
    }
  }

  return HELP_ARTICLES.filter(a => {
    const haystack = [
      a.title, a.shortAnswer, a.summary,
      a.tags.join(' '), a.category,
      ...a.sections.map(s => `${s.heading ?? ''} ${s.body}`),
    ].join(' ').toLowerCase();

    return expandedTerms.some(term => haystack.includes(term));
  });
}

export function getArticlesByCategory(category: string): HelpArticle[] {
  return HELP_ARTICLES.filter(a => a.category === category);
}

export function getArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find(a => a.slug === slug);
}

export function getRelatedArticles(slugs: string[]): HelpArticle[] {
  return slugs.map(s => getArticle(s)).filter(Boolean) as HelpArticle[];
}
