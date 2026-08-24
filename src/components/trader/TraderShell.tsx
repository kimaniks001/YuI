import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, FileText, Home, LayoutGrid, ListChecks, Share2, Split, Store, Zap } from 'lucide-react';
import SecurePayLogo from '../SecurePayLogo';
import { useAuth } from '../../lib/auth';
import EnvironmentBadge from './EnvironmentBadge';
import '../../r14-accessibility.css';
import '../../trader-public-continuity.css';

const navigation = [
  { to: '/dashboard', label: 'Home', mobileLabel: 'Home', icon: Home },
  { to: '/market', label: 'My Market', mobileLabel: 'My Market', icon: LayoutGrid },
  { to: '/agreements', label: 'Agreements', mobileLabel: 'Agreements', icon: FileText },
  { to: '/actions', label: 'Action Centre', mobileLabel: 'Actions', icon: ListChecks },
];

function openAgreementPrompt() {
  window.dispatchEvent(new Event('open-ask-securepay'));
}

export default function TraderShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const identity = user?.displayName?.trim() || user?.ksNumber || 'Account';

  useEffect(() => {
    if (!accountOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [accountOpen]);

  return (
    <div className="hp-page trader-public-shell">
      <a href="#trader-main" className="sp-skip-link">Skip to main content</a>

      <div className="hp-atmosphere" aria-hidden="true">
        <img src="/assets/brand/securepay_icon_green.png" alt="" className="hp-watermark" />
        <span className="hp-light hp-light-one" />
        <span className="hp-light hp-light-two" />
        <span className="hp-light hp-light-three" />
      </div>

      <header className="trader-master-header">
        <Link
          to="/dashboard"
          aria-label="SecurePay home"
          className="trader-master-logo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
        >
          <SecurePayLogo size="header" />
        </Link>

        <nav aria-label="Trader navigation" className="trader-master-nav">
          {navigation.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `${isActive ? 'is-active' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="trader-master-actions">
          <div className="trader-environment-wrap"><EnvironmentBadge /></div>
          <button type="button" onClick={openAgreementPrompt} aria-label="Start an agreement" className="hp-start-btn">
            <Zap size={15} aria-hidden="true" /> <span className="trader-master-start-copy">Start an agreement</span>
          </button>
          <button type="button" aria-label="Notifications unavailable" disabled className="hidden min-h-11 min-w-11 items-center justify-center rounded-full text-ink/30 xl:inline-flex">
            <Bell size={19} aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={accountOpen}
              aria-controls="trader-account-menu"
              onClick={() => setAccountOpen(open => !open)}
              className="trader-account-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              <span className="trader-account-avatar" aria-hidden="true">{identity.slice(0, 2).toUpperCase()}</span>
              <span className="trader-account-name hidden max-w-32 truncate text-sm font-semibold lg:block">{identity}</span>
            </button>
            {accountOpen && (
              <div id="trader-account-menu" aria-label="Account options" className="absolute right-0 top-[calc(100%+8px)] z-[70] w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-green-700/10 bg-[#fffefb] p-2 shadow-xl">
                <div className="border-b border-green-700/10 px-3 py-2">
                  <p className="text-xs text-ink/40">Signed in as</p>
                  <p className="mt-0.5 truncate text-sm font-semibold">{identity}</p>
                </div>
                <Link to="/signin" onClick={() => setAccountOpen(false)} className="mt-1 flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Account</Link>
                <Link to="/store" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"><Store size={15} aria-hidden="true" /> My KS Store</Link>
                <Link to="/store/share" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"><Share2 size={15} aria-hidden="true" /> Share Store offers</Link>
                <Link to="/market" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">My Market</Link>
                <Link to="/market/flows" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"><Split size={15} aria-hidden="true" /> Money flows</Link>
                <Link to="/market/statements" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Statements</Link>
                <Link to="/referrals" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Referrals</Link>
                <Link to="/plug" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-green-800 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Plug / Builder workspace</Link>
                <Link to="/community" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Your Circle</Link>
                <Link to="/developers" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Build with SecurePay</Link>
                <Link to="/settings" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Settings</Link>
                <Link to="/money" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Money & settlement</Link>
                <button type="button" onClick={() => void signOut()} className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="trader-main" tabIndex={-1} className="trader-master-main outline-none">
        {children}
      </main>

      <nav aria-label="Mobile trader navigation" className="trader-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-green-700/10 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(25,60,18,0.08)] md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navigation.map(({ to, mobileLabel, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${isActive ? 'bg-green-50/70 text-green-700' : 'text-ink/55'}`}>
              <Icon size={20} aria-hidden="true" /> <span className="max-w-full truncate">{mobileLabel}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
