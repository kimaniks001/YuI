import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import MarketOpeningRitual from '../components/MarketOpeningRitual';
import { signInPath } from './returnPath';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center px-4">
        <p className="text-sm text-[#1a1a1a]/50">Opening your Market…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={signInPath(`${location.pathname}${location.search}`)} replace />;
  }

  return <>
    <MarketOpeningRitual authenticatedEntry traderKey={user.ksNumber} />
    {children}
  </>;
}
