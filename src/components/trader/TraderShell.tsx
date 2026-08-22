import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, FileText, Home, LayoutGrid, ListChecks, Split, Zap } from 'lucide-react';
import LivingSecurePayMark from '../LivingSecurePayMark';
import { useAuth } from '../../lib/auth';
import EnvironmentBadge from './EnvironmentBadge';
import '../../r14-accessibility.css';

const navigation = [
  { to: '/dashboard', label: 'Home', mobileLabel: 'Home', icon: Home },
  { to: '/market', label: 'My Market', mobileLabel: 'My Market', icon: LayoutGrid },
  { to: '/agreements', label: 'Agreements', mobileLabel: 'Agreements', icon: FileText },
  { to: '/actions', label: 'Action Centre', mobileLabel: 'Actions', icon: ListChecks },
];

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
    <div className="min-h-screen bg-[#fbfcf9] text-ink">
      <a href="#trader-main" className="sp-skip-link">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-ink/8 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:px-10">
          <Link to="/dashboard" aria-label="SecurePay home" className="sp-living-mark-link shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2">
            <LivingSecurePayMark state="resting" size="md" presence="polite" />
          </Link>

          <nav aria-label="Trader navigation" className="hidden h-full items-center gap-7 md:flex">
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) => `relative flex h-full items-center rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 ${isActive ? 'text-green-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-green-600' : 'text-ink/60 hover:text-ink'}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <EnvironmentBadge />
            <Link to="/create" aria-label="Start an agreement" className="sp-btn-primary inline-flex min-h-11 min-w-11 items-center gap-2 px-3 text-sm sm:px-5">
              <Zap size={15} aria-hidden="true" /> <span className="hidden sm:inline">Create a SecureLink</span>
            </Link>
            <button type="button" aria-label="Notifications unavailable" disabled className="hidden min-h-11 min-w-11 items-center justify-center rounded-full text-ink/35 lg:inline-flex">
              <Bell size={19} aria-hidden="true" />
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={accountOpen}
                aria-controls="trader-account-menu"
                onClick={() => setAccountOpen(open => !open)}
                className="flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 sm:px-3"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-800" aria-hidden="true">{identity.slice(0, 2).toUpperCase()}</span>
                <span className="hidden max-w-32 truncate text-sm font-semibold text-ink/70 lg:block">{identity}</span>
              </button>
              {accountOpen && <div id="trader-account-menu" aria-label="Account options" className="absolute right-0 top-[calc(100%+8px)] w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink/8 bg-white p-2 shadow-xl">
                <div className="border-b border-ink/8 px-3 py-2"><p className="text-xs text-ink/40">Signed in as</p><p className="mt-0.5 truncate text-sm font-semibold">{identity}</p></div>
                <Link to="/signin" onClick={() => setAccountOpen(false)} className="mt-1 flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Account</Link>
                <Link to="/market" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">My Market</Link>
                <Link to="/market/flows" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"><Split size={15} aria-hidden="true" /> Money flows</Link>
                <Link to="/market/statements" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Statements</Link>
                <Link to="/referrals" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Referrals</Link>
                <Link to="/community" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Your Circle</Link>
                <Link to="/developers" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Build with SecurePay</Link>
                <Link to="/settings" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Settings</Link>
                <Link to="/money" onClick={() => setAccountOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700">Money & settlement</Link>
                <button type="button" onClick={() => void signOut()} className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">Sign out</button>
              </div>}
            </div>
          </div>
        </div>
      </header>

      <main id="trader-main" tabIndex={-1} className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-7 outline-none sm:px-6 md:pb-12 md:pt-9 lg:px-10">
        {children}
      </main>

      <nav aria-label="Mobile trader navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/8 bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(25,60,18,0.08)] md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navigation.map(({ to, mobileLabel, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 ${isActive ? 'text-green-700' : 'text-ink/55'}`}>
              <Icon size={20} aria-hidden="true" /> <span className="max-w-full truncate">{mobileLabel}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
