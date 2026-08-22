import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LivingSecurePayMark from './LivingSecurePayMark';

export function LegalNav({ backTo = '/', backLabel = 'SecurePay.ke' }: { backTo?: string; backLabel?: string }) {
  return (
    <nav className="b9-legal-nav sticky top-0 z-40 px-4 md:px-8 py-3">
      <div className="b9-legal-nav-inner max-w-4xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="sp-living-mark-link" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="sm" presence="polite" /></Link>
        <div className="b9-legal-market-links" aria-label="SecurePay knowledge rooms">
          <Link to="/help">Help</Link><Link to="/trust">Trust</Link><Link to="/security">Security</Link><Link to="/compliance">Compliance</Link><Link to="/not-a-bank">Not a bank</Link><Link to="/legal">Legal</Link>
        </div>
        <Link to={backTo} className="flex items-center gap-1.5 text-xs text-[#1a1a1a]/40 hover:text-[#3a7a1f] transition-colors"><ArrowLeft size={12} /> {backLabel}</Link>
      </div>
    </nav>
  );
}

export function LegalFooter() {
  return (
    <>
      <div className="border-t border-[#1a1a1a]/6 bg-[#fafaf8] px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="b9-legal-footer-mark">
            <LivingSecurePayMark state="resting" size="xs" presence="polite" />
            <p className="text-xs text-[#1a1a1a]/50 leading-relaxed">SecurePay helps people keep agreements, payment state, evidence, reviews, approvals and records connected. The interface explains these facts; it does not manufacture them.</p>
          </div>
          <p className="text-[10px] text-[#1a1a1a]/35 leading-relaxed">SecurePay is not a bank, insurer, guarantor, court, investment platform or legal representative. Banking and payment services may be provided through licensed financial infrastructure partners.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
            {[{ label: 'Trust', to: '/trust' },{ label: 'Legal', to: '/legal' },{ label: 'Terms', to: '/terms' },{ label: 'Privacy', to: '/privacy' },{ label: 'Security', to: '/security' },{ label: 'Compliance', to: '/compliance' },{ label: 'Help', to: '/help' },{ label: 'Ask SecurePay', to: '/ask-securepay' }].map(l => <Link key={l.to} to={l.to} className="text-[10px] text-[#1a1a1a]/35 hover:text-[#3a7a1f] transition-colors">{l.label}</Link>)}
          </div>
        </div>
      </div>
      <footer className="bg-white border-t border-[#1a1a1a]/5 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2"><LivingSecurePayMark state="resting" size="xs" presence="polite" /><span className="text-xs font-semibold text-[#1a1a1a]/40">SecurePay · Keyman Oak Limited</span></Link>
          <p className="text-[10px] text-[#1a1a1a]/25">© {new Date().getFullYear()} Keyman Oak Limited. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

interface LegalHeroProps { eyebrow?: string; title: string; subtitle?: string; dark?: boolean; }
export function LegalHero({ eyebrow, title, subtitle }: LegalHeroProps) {
  return (
    <div className="b9-legal-hero px-4 md:px-8 py-12 md:py-16">
      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div className="space-y-3">
          {eyebrow && <div className="flex items-center gap-2"><LivingSecurePayMark state="resting" size="xs" presence="polite" /><span className="b9-label">{eyebrow}</span></div>}
          <h1 className="text-3xl md:text-4xl font-black leading-snug">{title}</h1>
          {subtitle && <p className="text-sm leading-relaxed max-w-xl">{subtitle}</p>}
        </div>
        <div className="hidden md:grid w-24 h-24 place-items-center rounded-full bg-[#eef7e9]"><LivingSecurePayMark state="guiding" size="md" presence="polite" /></div>
      </div>
    </div>
  );
}

interface FAQItem { q: string; a: string; }
export function FAQAccordion({ items }: { items: FAQItem[] }) {
  return <div className="space-y-2">{items.map((item, i) => <details key={i} className="bg-white border border-[#1a1a1a]/6 rounded-2xl overflow-hidden group"><summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-[#fafaf8] transition-colors"><span className="text-sm font-semibold text-[#1a1a1a]/80 pr-4">{item.q}</span><span className="text-[#1a1a1a]/30 flex-shrink-0 text-lg leading-none select-none">+</span></summary><div className="px-5 pb-4"><p className="text-sm text-[#1a1a1a]/55 leading-relaxed">{item.a}</p></div></details>)}</div>;
}

export function TrustNote({ text }: { text: string }) {
  return <div className="b9-trust-note flex items-start gap-2.5 rounded-2xl px-4 py-3.5"><LivingSecurePayMark state="resting" size="xs" presence="polite" /><p className="text-xs text-[#1a1a1a]/55 leading-relaxed">{text}</p></div>;
}

export function WarnNote({ text }: { text: string }) {
  return <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200/60 rounded-2xl px-4 py-3.5"><LivingSecurePayMark state="caution" size="xs" presence="present" /><p className="text-xs text-amber-800 leading-relaxed">{text}</p></div>;
}
