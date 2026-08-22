import { BookOpen, Gamepad2, Globe2, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  getWorldFromPath,
  saveMarketDraftIntent,
  type SecurePayWorld,
} from '../lib/worldMode';

const worlds: Array<{ id: SecurePayWorld; label: string; to: string; icon: typeof Globe2 }> = [
  { id: 'market', label: 'Market', to: '/', icon: Globe2 },
  { id: 'trainer', label: 'Trainer', to: '/trainer', icon: BookOpen },
  { id: 'game', label: 'Game', to: '/game', icon: Gamepad2 },
];

export default function WorldSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const world = getWorldFromPath(location.pathname);
  const simulated = world !== 'market';

  const goReal = () => {
    if (!simulated) return;
    saveMarketDraftIntent(world, `${location.pathname}${location.search}`, '/create');
    navigate('/market/continue');
  };

  return (
    <div className={`sp-world-switcher sp-world-switcher--${world}`} role="region" aria-label="SecurePay world selector">
      <div className="sp-world-switcher__status">
        <ShieldCheck size={14} aria-hidden="true" />
        <span>
          <strong>{world === 'market' ? 'REAL MARKET' : world === 'trainer' ? 'TRAINER · SIMULATED' : 'GAME · SIMULATED'}</strong>
          <small>{world === 'market' ? 'Backend truth applies' : 'No real financial or agreement authority'}</small>
        </span>
      </div>

      <nav className="sp-world-switcher__nav" aria-label="Switch SecurePay world">
        {worlds.map(({ id, label, to, icon: Icon }) => (
          <Link key={id} to={to} className={world === id ? 'is-current' : ''} aria-current={world === id ? 'page' : undefined}>
            <Icon size={14} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {simulated && (
        <button type="button" className="sp-world-switcher__real" onClick={goReal}>
          Do this for real
        </button>
      )}
      {world === 'market' && (
        <Link to="/market/safety" className="sp-world-switcher__real">
          World safety
        </Link>
      )}
    </div>
  );
}
