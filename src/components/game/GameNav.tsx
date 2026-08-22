import { Link, useLocation } from 'react-router-dom';
import { Coins, Gamepad2, Layers3, Link2, Medal, Users } from 'lucide-react';

const items = [
  { to: '/game/profile', label: 'Cycle', icon: Coins },
  { to: '/game/cards', label: 'Cards', icon: Layers3 },
  { to: '/game/journeys', label: 'Journeys', icon: Link2 },
  { to: '/game/rooms', label: 'Rooms', icon: Users },
  { to: '/game/missions', label: 'Missions', icon: Gamepad2 },
  { to: '/game/achievements', label: 'Results', icon: Medal },
];

export default function GameNav() {
  const location = useLocation();
  return <>
    <section className="mx-auto mb-5 max-w-6xl rounded-2xl border border-amber-700/20 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm">
      <strong>MARKET GAME · SIMULATED</strong>
      <span className="ml-2 text-amber-900/70">Game Coins have no cash value. Game agreements, rankings and Game Master status never create Real Market truth.</span>
    </section>
    <nav className="mx-auto mb-6 flex max-w-6xl gap-2 overflow-x-auto pb-1" aria-label="Market Game">
      {items.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to || (to === '/game/profile' && location.pathname === '/game');
        return <Link key={to} to={to} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${active ? 'border-amber-700 bg-amber-700 text-white' : 'border-ink/10 bg-white text-ink/60 hover:border-amber-700/30'}`}>
          <Icon size={15} aria-hidden="true" /> {label}
        </Link>;
      })}
    </nav>
  </>;
}
