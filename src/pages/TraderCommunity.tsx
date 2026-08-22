import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Network } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { getMyCircle } from '../api/r11TraderEndpoints';
import type { CircleProfileResponse } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';
import TraderReferrals from './TraderReferrals';
import LivingSecurePayMark from '../components/LivingSecurePayMark';

export default function TraderCommunity() {
  const location = useLocation();
  if (location.pathname === '/referrals') return <TraderReferrals />;
  return <CircleWorkspace />;
}

function CircleWorkspace() {
  const { user, session } = useAuth();
  const [circle, setCircle] = useState<CircleProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    const result = await getMyCircle(session.accessToken);
    if (!result.ok || !result.data) {
      setError(result.error || 'Your Circle could not be loaded.');
      setLoading(false);
      return;
    }
    setCircle(result.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Your place in the Market"
      title="Your Circle"
      description="Your Circle shows the community around your KSNumber. It is trust context only — it never decides Payment Ready, settlement, release, disputes or money movement."
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Your Circle could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && circle && <div className="space-y-6">
      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <LivingSecurePayMark state="resting" size="md" presence="polite" decorative />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Your Circle profile</p>
            <h2 className="mt-1 font-display text-2xl">{circle.displayName || circle.canonicalKsNumber}</h2>
            <p className="mt-1 font-mono text-sm text-ink/55">{circle.canonicalKsNumber}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact label="Verification" value={circle.verificationStatus} />
          <Fact label="Member since" value={new Date(circle.memberSince).toLocaleDateString('en-KE')} />
          <Fact label="Traders referred" value={circle.referredTraderCount.toString()} />
          <Fact label="Activated referred" value={circle.activatedReferredTraderCount.toString()} />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-green-700/10 bg-green-50/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex gap-3">
          <LivingSecurePayMark state="guiding" size="sm" presence="present" decorative />
          <div>
            <h2 className="font-display text-xl">Community context, not financial authority.</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/55">SecurePay currently exposes no Circle ranking, medal, reputation score or community score. None is invented here. The agreement remains how a trade begins.</p>
          </div>
        </div>
        <Link to="/referrals" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-green-700">See your referrals <ArrowRight size={15} /></Link>
      </section>

      <section className="b7-live-community-card rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="b7-live-community-visual" aria-hidden="true">
          <span className="b7-live-community-ring" />
          <span className="b7-live-community-ring b7-live-community-ring--outer" />
          <div className="b7-live-community-center"><Network size={18} /><strong>{circle.canonicalKsNumber}</strong></div>
          <i className="b7-live-dot b7-live-dot--one" />
          <i className="b7-live-dot b7-live-dot--two" />
          <i className="b7-live-dot b7-live-dot--three" />
          <i className="b7-live-dot b7-live-dot--four" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Connection, not ranking</p>
          <h2 className="mt-1 font-display text-2xl">Your KSNumber is your identity in the Market.</h2>
          <p className="mt-2 text-sm leading-6 text-ink/55">Your KS Profile is your place in the Market. Your Digital Store is what you offer there. Your Circle shows relationships SecurePay can prove around you. It is not a score or a guarantee. The agreement is still how a trade begins.</p>
        </div>
      </section>
    </div>}
  </TraderShell>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-ink/[0.025] p-3"><p className="text-xs text-ink/45">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
