import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  BookOpen,
  Code2,
  FileCheck2,
  GraduationCap,
  Home,
  LayoutGrid,
  Menu,
  MessageCircle,
  Network,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Trophy,
  UserPlus,
  X,
} from 'lucide-react';
import LivingSecurePayMark from './LivingSecurePayMark';

const groups = [
  {
    label: 'Enter the Market',
    items: [
      { to: '/', label: 'Market entrance', icon: Home },
      { to: '/create', label: 'Start an agreement', icon: Sparkles },
      { to: '/signin', label: 'Sign-in journey', icon: UserPlus },
      { to: '/ks/KS2145', label: 'Digital Store', icon: ShoppingBag },
    ],
  },
  {
    label: 'Run your Market',
    items: [
      { to: '/dashboard', label: 'Trader Home', icon: Store },
      { to: '/market', label: 'My Market', icon: LayoutGrid },
      { to: '/agreements/demo', label: 'Agreement room', icon: FileCheck2 },
      { to: '/actions', label: 'Actions', icon: ArrowRight },
    ],
  },
  {
    label: 'Money & people',
    items: [
      { to: '/money', label: 'Money rooms', icon: Banknote },
      { to: '/market/flows', label: 'SecureFlow', icon: Network },
      { to: '/community', label: 'Circle & growth', icon: Network },
      { to: '/explore/review', label: 'Review & recovery', icon: MessageCircle },
    ],
  },
  {
    label: 'Learn & build',
    items: [
      { to: '/play', label: 'Play the Market', icon: Trophy },
      { to: '/developers', label: 'Developer Market', icon: Code2 },
      { to: '/help', label: 'Help & knowledge', icon: BookOpen },
      { to: '/settings', label: 'Explorer settings', icon: Settings },
      { to: '/explore', label: 'All rooms', icon: GraduationCap },
    ],
  },
];

export default function ExplorerDock() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className="yui-explorer-pill"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-controls="yui-explorer-drawer"
      >
        <LivingSecurePayMark state="guiding" size="xs" presence="polite" decorative />
        <span><strong>YUI v1</strong><small>Explorer</small></span>
        <Menu size={15} />
      </button>

      {open && <div className="yui-explorer-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside id="yui-explorer-drawer" className={`yui-explorer-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="yui-explorer-head">
          <div className="yui-explorer-title">
            <LivingSecurePayMark state="guiding" size="sm" presence="present" decorative />
            <div><p>SECUREPAY YUI v1</p><h2>Explore the whole Market</h2></div>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close explorer"><X size={18} /></button>
        </div>

        <div className="yui-explorer-safety">
          <strong>Training mode</strong>
          <span>No authentication · no live API · no real money</span>
        </div>

        <div className="yui-explorer-groups">
          {groups.map(group => (
            <section key={group.label}>
              <p>{group.label}</p>
              <div>
                {group.items.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className={location.pathname === to ? 'is-current' : ''}>
                    <Icon size={16} /><span>{label}</span><ArrowRight size={13} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="yui-explorer-foot">
          <Link to="/explore">Open journey map <ArrowRight size={14} /></Link>
          <span>When real authentication and money are connected, this mode can remain as a separate training environment.</span>
        </div>
      </aside>
    </>
  );
}
