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
  PlayCircle,
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
    label: 'Learn the Market',
    items: [
      { to: '/trainer', label: 'Trainer home', icon: GraduationCap },
      { to: '/trainer/session', label: 'Guided Plug session', icon: PlayCircle },
      { to: '/trainer/home', label: 'Market entrance demo', icon: Home },
      { to: '/trainer/create', label: 'Start an agreement demo', icon: Sparkles },
      { to: '/trainer/signin', label: 'Sign-in demo', icon: UserPlus },
      { to: '/trainer/store', label: 'Digital Store demo', icon: ShoppingBag },
    ],
  },
  {
    label: 'Run your demo Market',
    items: [
      { to: '/trainer/dashboard', label: 'Trader Home', icon: Store },
      { to: '/trainer/market', label: 'My Market', icon: LayoutGrid },
      { to: '/trainer/agreement', label: 'Agreement room', icon: FileCheck2 },
      { to: '/trainer/actions', label: 'Actions', icon: ArrowRight },
    ],
  },
  {
    label: 'Money & people demos',
    items: [
      { to: '/trainer/money', label: 'Money rooms', icon: Banknote },
      { to: '/trainer/flows', label: 'SecureFlow', icon: Network },
      { to: '/trainer/community', label: 'Circle & growth', icon: Network },
      { to: '/trainer/recovery', label: 'Recovery & Resolution', icon: MessageCircle },
    ],
  },
  {
    label: 'Learn & build',
    items: [
      { to: '/game', label: 'Enter the Game', icon: Trophy },
      { to: '/trainer/developers', label: 'Developer demo', icon: Code2 },
      { to: '/trainer/help', label: 'Help & knowledge', icon: BookOpen },
      { to: '/trainer/settings', label: 'Trainer settings', icon: Settings },
      { to: '/trainer/map', label: 'All demo rooms', icon: LayoutGrid },
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
        <span><strong>SecurePay</strong><small>Trainer</small></span>
        <Menu size={15} />
      </button>

      {open && <div className="yui-explorer-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside id="yui-explorer-drawer" className={`yui-explorer-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="yui-explorer-head">
          <div className="yui-explorer-title">
            <LivingSecurePayMark state="guiding" size="sm" presence="present" decorative />
            <div><p>SECUREPAY TRAINER</p><h2>Learn the whole Market</h2></div>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close Trainer"><X size={18} /></button>
        </div>

        <div className="yui-explorer-safety">
          <strong>Simulated learning world</strong>
          <span>No live API · no real identity · no real money</span>
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
          <Link to="/trainer/map">Open all demo rooms <ArrowRight size={14} /></Link>
          <span>Trainer screens can look realistic, but they never create Market identity, agreement, payment, Payment Ready, release or settlement truth.</span>
        </div>
      </aside>
    </>
  );
}
