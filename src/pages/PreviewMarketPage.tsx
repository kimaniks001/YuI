import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  HeartHandshake,
  Home,
  LayoutGrid,
  ListChecks,
  Menu,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import type { CurrentUserAgreementSummary, SecurePayActivity } from '../api/securepayTypes';
import { buildMarketProjection, type MarketItem } from '../lib/marketProjection';
import PreviewDeveloperJourney from './PreviewDeveloperJourney';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import '../batch3-market.css';

const agreements: CurrentUserAgreementSummary[] = [
  {
    agreementId: 'preview-painter', publicReference: 'SP-PAINTER', title: 'House painting', purpose: 'Paint the house in two stages', status: 'CONFIRMATION_PENDING', agreementType: 'GENERIC', proposedAmountMinor: '6000000', currency: 'KES', createdAt: '2026-08-18T08:00:00Z', updatedAt: '2026-08-20T07:45:00Z', currentActor: { roleCode: 'PAYER', participantStatus: 'CONFIRMED' }, counterparty: { ksNumber: 'KS-PAINTER', displayName: 'Painter' }, nextDeadline: null, attentionRequired: true, nextActions: [{ actionCode: 'COMPLETE_OBLIGATION', category: 'AGREEMENT', reason: 'Preparation is ready for your confirmation.', deadline: null, attentionClass: 'HIGH' }], currentAgreementVersionId: 'v1',
  },
  {
    agreementId: 'preview-renovation', publicReference: 'SP-RENOVATION', title: 'Renovation', purpose: 'Contractor, plumber and electrician', status: 'PARTICIPANTS_JOINING', agreementType: 'GENERIC', proposedAmountMinor: '18000000', currency: 'KES', createdAt: '2026-08-17T08:00:00Z', updatedAt: '2026-08-20T06:30:00Z', currentActor: { roleCode: 'PAYER', participantStatus: 'CONFIRMED' }, counterparty: null, nextDeadline: null, attentionRequired: true, nextActions: [{ actionCode: 'INVITE_RECIPIENT', category: 'IDENTITY', reason: 'Two recipients still need SecurePay identities.', deadline: null, attentionClass: 'HIGH' }], currentAgreementVersionId: 'v2',
  },
  {
    agreementId: 'preview-family', publicReference: 'SP-FAMILY', title: 'Mum support — August', purpose: 'Monthly family support', status: 'PARTICIPANTS_JOINING', agreementType: 'GENERIC', proposedAmountMinor: '3000000', currency: 'KES', createdAt: '2026-08-15T08:00:00Z', updatedAt: '2026-08-19T10:00:00Z', currentActor: { roleCode: 'ORGANIZER', participantStatus: 'CONFIRMED' }, counterparty: null, nextDeadline: null, attentionRequired: false, nextActions: [], currentAgreementVersionId: 'v3',
  },
  {
    agreementId: 'preview-school', publicReference: 'SP-SCHOOL', title: 'School trip', purpose: 'Transport, meals and venue', status: 'CONFIRMATION_PENDING', agreementType: 'GENERIC', proposedAmountMinor: '8000000', currency: 'KES', createdAt: '2026-08-14T08:00:00Z', updatedAt: '2026-08-20T08:15:00Z', currentActor: { roleCode: 'APPROVER', participantStatus: 'CONFIRMED' }, counterparty: null, nextDeadline: '2026-08-21T16:00:00Z', attentionRequired: true, nextActions: [{ actionCode: 'APPROVE_PAYOUT', category: 'DISTRIBUTION', reason: 'The first supplier payment step is ready for review.', deadline: '2026-08-21T16:00:00Z', attentionClass: 'HIGH' }], currentAgreementVersionId: 'v4',
  },
  {
    agreementId: 'preview-website', publicReference: 'SP-WEBSITE', title: 'Website work', purpose: 'Website design and build', status: 'COMPLETED', agreementType: 'GENERIC', proposedAmountMinor: '8500000', currency: 'KES', createdAt: '2026-07-18T08:00:00Z', updatedAt: '2026-08-16T14:00:00Z', currentActor: { roleCode: 'PAYER', participantStatus: 'CONFIRMED' }, counterparty: { ksNumber: 'KS-DEVELOPER', displayName: 'Developer' }, nextDeadline: null, attentionRequired: false, nextActions: [], currentAgreementVersionId: 'v5',
  },
  {
    agreementId: 'preview-review', publicReference: 'SP-REVIEW', title: 'Generator purchase', purpose: 'Generator purchase and collection', status: 'CONFIRMATION_PENDING', agreementType: 'GENERIC', proposedAmountMinor: '8500000', currency: 'KES', createdAt: '2026-08-19T08:00:00Z', updatedAt: '2026-08-20T08:35:00Z', currentActor: { roleCode: 'PAYER', participantStatus: 'CONFIRMED' }, counterparty: { ksNumber: 'KS-SELLER', displayName: 'Seller' }, nextDeadline: '2026-08-20T17:00:00Z', attentionRequired: true, nextActions: [{ actionCode: 'RESPOND_TO_REVIEW', category: 'REVIEW', reason: 'A response is needed in Agreement Review.', deadline: '2026-08-20T17:00:00Z', attentionClass: 'HIGH' }], currentAgreementVersionId: 'v6',
  },
];

const activity: SecurePayActivity[] = [
  { id: 'a1', type: 'SETTLEMENT', description: 'KES 30,000 settlement recorded — House painting', amount: 30000, currency: 'KES', timestamp: '2026-08-20T07:20:00Z', status: 'SETTLED' },
  { id: 'a2', type: 'PARTICIPANT_JOINED', description: 'Mary joined — Mum support', timestamp: '2026-08-19T16:00:00Z', status: 'CONFIRMED' },
  { id: 'a3', type: 'EVIDENCE_ADDED', description: 'Evidence added — Renovation', timestamp: '2026-08-19T14:00:00Z', status: 'SUBMITTED' },
];

const market = buildMarketProjection(agreements, activity);

function StoryIcon({ item, attention, quiet }: { item: MarketItem; attention?: boolean; quiet?: boolean }) {
  const title = item.title.toLowerCase();
  const Icon = title.includes('generator')
    ? ShoppingBag
    : title.includes('school')
      ? UsersRound
      : title.includes('painting')
        ? Home
        : title.includes('renovation')
          ? Building2
          : title.includes('mum') || title.includes('family')
            ? HeartHandshake
            : CheckCircle2;

  return (
    <span className={`lm-story-icon ${attention ? 'is-attention' : quiet ? 'is-complete' : 'is-waiting'}`} aria-hidden="true">
      <Icon size={21} strokeWidth={1.9} />
      <span className="lm-story-spark" />
    </span>
  );
}

function MarketHeader() {
  const [open, setOpen] = useState(false);
  return <header className="b3-header">
    <div className="b3-header-inner">
      <Link to="/preview/trader-home" className="b3-brand"><LivingSecurePayMark state="resting" size="md" presence="polite" /><span><strong>My Market</strong><small>KS2145</small></span></Link>
      <nav className="b3-nav" aria-label="Trader preview navigation"><Link to="/preview/trader-home">Home</Link><Link className="is-active" to="/preview/market">My Market</Link><Link to="/preview/workspace">Agreements</Link><Link to="/preview/operational">Actions</Link></nav>
      <div className="b3-actions"><span className="b3-head-state"><LivingSecurePayMark state="caution" size="xs" presence="polite" label="Four preview items need attention" />4 need you</span><button aria-label="Notifications"><Bell size={18} /><i>4</i></button><button className="b3-avatar" aria-label="Account menu">JK</button><button className="b3-menu" onClick={() => setOpen(value => !value)} aria-label="Open navigation"><Menu size={21} /></button></div>
    </div>
    {open && <div className="b3-mobile-menu"><Link to="/preview/trader-home">Home</Link><Link to="/preview/market">My Market</Link><Link to="/preview/workspace">Agreements</Link><Link to="/preview/operational">Actions</Link></div>}
  </header>;
}

export default function PreviewMarketPage() {
  const [searchParams] = useSearchParams();
  if (searchParams.get('view') === 'developers') return <PreviewDeveloperJourney />;

  return (
    <main className="lm-page b3-market min-h-screen text-ink">
      <MarketHeader />
      <div className="lm-ambient-mark lm-ambient-mark-a" aria-hidden="true" />
      <div className="lm-ambient-mark lm-ambient-mark-b" aria-hidden="true" />
      <div className="lm-thread" aria-hidden="true"><span /><span /><span /></div>

      <div className="relative z-[1] mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-9">
        <section className="b3-market-hero">
          <div>
            <p className="b3-eyebrow">MY MARKET · EVERYTHING YOU TRADE, IN ONE PLACE</p>
            <h1>Your market is moving.<br /><span>See where you matter next.</span></h1>
            <p className="b3-lead"><strong>{market.attention.length} things need you.</strong> Elsewhere, the next move belongs to someone else or the work is already in your records.</p>
          </div>
          <div className="b3-market-beacon"><LivingSecurePayMark state="guiding" size="lg" presence="present" label="SecurePay is guiding you through your Market" /><p><strong>You do not need to hold everything in your head.</strong><span>SecurePay points to what needs you and lets the quiet parts stay quiet.</span></p></div>
        </section>

        <PreviewSection title="Your market needs you here" eyebrow={`${market.attention.length} things need your attention`} items={market.attention} attention />
        {market.active.length > 0 && <PreviewSection title="In motion" eyebrow="Your trade is moving" items={market.active} />}
        <PreviewSection title="Waiting peacefully" eyebrow="The next move belongs elsewhere" items={market.waiting} />
        <PreviewSection title="Finished and in your records" eyebrow="Settled, completed or closed records" items={market.completed} quiet />

        <section className="b3-activity">
          <div className="b3-section-head"><div className="b3-section-mark"><LivingSecurePayMark state="resting" size="sm" presence="polite" label="SecurePay market activity" /></div><div><p>RECENT ACTIVITY</p><h2>Small signs that your Market is moving.</h2></div><span className="b3-record-label">Preview records</span></div>
          <div className="b3-activity-list">
            {market.recentActivity.map(item => <div key={item.id} className="b3-activity-row"><div><strong>{item.description}</strong><span>{item.detail}</span></div>{item.amountDisplay && <b>{item.amountDisplay}</b>}</div>)}
          </div>
        </section>

        <div className="b3-next-links"><Link to="/preview/workspace">Open an agreement room <ArrowRight size={15} /></Link><Link className="is-strong" to="/preview/operational">Follow an agreement in motion <ArrowRight size={15} /></Link></div>
        <p className="b3-preview-note">PREVIEW · fixture-driven design review · no login, backend writes, payment or authority changes occur here</p>
      </div>

      <nav className="b3-bottom-nav" aria-label="Mobile trader preview navigation"><Link to="/preview/trader-home"><Home size={20} /><span>Home</span></Link><Link className="is-active" to="/preview/market"><LayoutGrid size={20} /><span>My Market</span></Link><Link className="b3-start" to="/preview/journeys"><Sparkles size={20} /><span>Start</span></Link><Link to="/preview/operational"><ListChecks size={20} /><span>Actions</span></Link><Link to="/preview/market"><MessageCircle size={20} /><span>Circle</span></Link></nav>
    </main>
  );
}

function PreviewSection({ title, eyebrow, items, attention = false, quiet = false }: { title: string; eyebrow: string; items: MarketItem[]; attention?: boolean; quiet?: boolean }) {
  const state = attention ? 'caution' : quiet ? 'complete' : 'waiting';
  const label = attention ? 'This Market section needs attention' : quiet ? 'This Market section contains completed records' : 'This Market section is waiting peacefully';
  return (
    <section className={`b3-market-section ${attention ? 'is-attention' : quiet ? 'is-complete' : 'is-waiting'}`}>
      <div className="b3-section-head"><div className="b3-section-mark"><LivingSecurePayMark state={state} size="sm" presence={attention ? 'present' : 'polite'} label={label} /></div><div><p>{eyebrow}</p><h2>{title}</h2></div>{attention && <span className="b3-attention-copy">Start with one. The rest can wait.</span>}</div>
      <div className="b3-market-list">
        {items.map((item, index) => <Link key={item.agreementId} to="/preview/workspace" className="b3-market-card">
          <StoryIcon item={item} attention={attention} quiet={quiet} />
          <div className="b3-market-copy"><div><strong>{item.title}</strong>{item.amountDisplay && <b>{item.amountDisplay}</b>}</div><p>{item.primaryAction ? `Next: ${item.primaryAction.label}` : item.waitingOn || item.humanStatus}</p>{attention && item.primaryAction?.reason && <span>{item.primaryAction.reason}</span>}</div>
          <div className="b3-card-tail">{attention && <i style={{ animationDelay: `${index * 120}ms` }} />}<ArrowRight size={18} /></div>
        </Link>)}
      </div>
    </section>
  );
}
