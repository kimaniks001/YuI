import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, HelpCircle, Home, UsersRound } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import SystemStateRoom from '../components/SystemStateRoom';

const G = '#3a7a1f';
const DIRECT_KS_STORE = /^\/KS\d{3,}$/i;

export default function NotFoundPage() {
  const location = useLocation();

  // securepay.ke/KS005 is the human-facing Store address. The existing
  // /ks/KS005 route remains the canonical SPA implementation so older links,
  // tests and deep links keep working while the short public address resolves.
  if (DIRECT_KS_STORE.test(location.pathname)) {
    const canonicalKs = location.pathname.slice(1).toUpperCase();
    return <Navigate to={`/ks/${canonicalKs}`} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fafaf8' }}>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#1a1a1a]/6 px-4 md:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="sp-living-mark-link" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="sm" presence="polite" /></Link>
          <Link to="/" className="text-xs text-[#1a1a1a]/40 hover:text-[#3a7a1f] transition-colors">SecurePay.ke</Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <SystemStateRoom
            state="caution"
            presence="present"
            eyebrow="Page not found"
            title="This address does not lead to a current SecurePay room."
            happened="The page may have moved, expired, been removed, or the address may be incomplete."
            means="A missing page is not evidence that an agreement, invitation or money record disappeared."
            next="Continue from a known place in the Market."
            money="This page status says nothing about whether money moved."
          />

          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { icon: Home, label: 'Return to the Market', to: '/', color: G },
              { icon: ArrowRight, label: 'Start an agreement', to: '/create', color: '#e87c1e' },
              { icon: UsersRound, label: 'See real-life situations', to: '/situations', color: G },
              { icon: HelpCircle, label: 'Help Center', to: '/help', color: G },
            ].map(item => (
              <Link key={`${item.to}-${item.label}`} to={item.to}
                className="flex min-h-24 flex-col items-center justify-center gap-2 bg-white border border-[#1a1a1a]/6 rounded-2xl px-4 py-4 hover:border-[#3a7a1f]/20 hover:shadow-sm transition-all group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.color + '12' }}>
                  <item.icon size={16} style={{ color: item.color }} />
                </div>
                <p className="text-xs font-semibold text-[#1a1a1a]/65 group-hover:text-[#1a1a1a] text-center leading-snug">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-[#1a1a1a]/5 px-4 py-4 text-center">
        <p className="text-[10px] text-[#1a1a1a]/25">© {new Date().getFullYear()} Keyman Oak Limited. SecurePay is not a bank.</p>
      </footer>
    </div>
  );
}
