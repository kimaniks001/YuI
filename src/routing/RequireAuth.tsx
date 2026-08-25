import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import MarketOpeningRitual from '../components/MarketOpeningRitual';
import { signInPath } from './returnPath';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center px-4">
        <p className="text-sm text-[#1a1a1a]/50">Opening your Market…</p>
      </div>
    );
  }

  // Protected Market routes require a genuine backend-issued session.
  // A public creation trial may expose a placeholder `user` so the question
  // engine can render, but it must never satisfy this boundary.
  if (!session) {
    return <Navigate to={signInPath(`${location.pathname}${location.search}`)} replace />;
  }

  return <>
    <MarketOpeningRitual authenticatedEntry traderKey={session.user.ksNumber} />
    {children}
  </>;
}