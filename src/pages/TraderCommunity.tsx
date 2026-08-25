import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Compass, Crown, Network, ShieldCheck, Users } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { getMyCircle } from '../api/r11TraderEndpoints';
import type { CircleProfileResponse } from '../api/r11TraderTypes';
import { useAuth } from '../lib/auth';
import TraderReferrals from './TraderReferrals';

type CommunityRoom = 'home' | 'discover' | 'members' | 'feed' | 'rules';
const rooms: Array<{ id: CommunityRoom; label: string }> = [
  { id: 'home', label: 'My people' }, { id: 'discover', label: 'Discover' }, { id: 'members', label: 'Members' }, { id: 'feed', label: 'Feed' }, { id: 'rules', label: 'Rules' },
];

export default function TraderCommunity() {
  const location = useLocation();
  if (location.pathname === '/referrals') return <TraderReferrals />;
  return <CommunityWorkspace />;
}

function CommunityWorkspace() {
  const { user, session } = useAuth();
  const [circle, setCircle] = useState<CircleProfileResponse | null>(null);
  const [room, setRoom] = useState<CommunityRoom>('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true); setError(null);
    const result = await getMyCircle(session.accessToken);
    if (!result.ok || !result.data) setError(result.error || 'Your community context could not be loaded.');
    else setCircle(result.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);
  if (!user || !session) return <Navigate to="/" replace />;

  return <TraderShell>
    <TraderPageHeader eyebrow="Community" title={<>Your <span className="text-green-700">people</span></>} description="See proven connections without exposing private trade." />

    <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Community rooms">{rooms.map(item => <button key={item.id} type="button" onClick={() => setRoom(item.id)} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold ${room === item.id ? 'border-green-700 bg-green-700 text-white' : 'border-ink/10 bg-white text-ink/65'}`}>{item.label}</button>)}</div>

    {loading && <TraderLoadingState label="Loading community…" />}
    {error && <TraderErrorState title="Community could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && circle && room === 'home' && <CommunityHome circle={circle} />}
    {!loading && !error && room === 'discover' && <AuthorityGate icon={<Compass size={19} />} title="Discovery is not available yet" detail="SecurePay does not yet return a privacy-governed community directory." />}
    {!loading && !error && room === 'members' && <AuthorityGate icon={<Users size={19} />} title="Membership is not available yet" detail="The current Circle projection is relationship context, not a membership register." />}
    {!loading && !error && room === 'feed' && <AuthorityGate icon={<Network size={19} />} title="Community feed is not available yet" detail="SecurePay does not publish private agreement activity into a social feed." />}
    {!loading && !error && room === 'rules' && <AuthorityGate icon={<ShieldCheck size={19} />} title="Community rules are not available yet" detail="Rules and moderator authority will appear only when the backend owns them." />}
  </TraderShell>;
}

function CommunityHome({ circle }: { circle: CircleProfileResponse }) {
  return <div className="space-y-5">
    <section className="trader-home-situation">
      <div className="trader-home-situation-copy"><p className="trader-home-kicker">Your community context</p><h2>{circle.displayName || circle.canonicalKsNumber}</h2><p className="mt-1 font-mono text-xs text-ink/45">{circle.canonicalKsNumber}</p></div>
      <div className="trader-home-metrics">
        <div className="trader-home-metric is-active"><span>Verified</span><strong>{circle.verificationStatus}</strong></div>
        <div className="trader-home-metric"><span>Referred</span><strong>{circle.referredTraderCount}</strong></div>
        <div className="trader-home-metric"><span>Activated</span><strong>{circle.activatedReferredTraderCount}</strong></div>
      </div>
    </section>

    <section className="trader-around-rail" aria-label="Community shortcuts">
      <Link to={`/ks/${encodeURIComponent(circle.canonicalKsNumber)}`}><span>Your Store</span><strong>Public profile</strong><ArrowRight size={14} /></Link>
      <Link to="/referrals"><span>Referrals</span><strong>Introductions</strong><ArrowRight size={14} /></Link>
      <Link to="/circles"><span>Circles</span><strong>Grow together</strong><ArrowRight size={14} /></Link>
      <Link to="/masters"><span>Masters</span><strong>Find experience</strong><Crown size={14} /></Link>
    </section>

    <details className="trader-progressive"><summary>Privacy and community boundaries</summary><div className="grid gap-3 md:grid-cols-2"><Info title="Connection, not ranking" text="Referral and identity facts are not a trust score, ranking or endorsement." /><Info title="Private stays private" text="Agreement details, amounts, evidence and recovery activity stay outside community publication unless a future backend contract explicitly makes a safe item publishable." /></div></details>
  </div>;
}

function AuthorityGate({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <section className="trader-compact-state trader-compact-state--waiting"><span className="trader-compact-state-icon">{icon}</span><div><p className="trader-compact-state-eyebrow">Backend required</p><h2>{title}</h2><p>{detail}</p></div></section>;
}
function Info({ title, text }: { title: string; text: string }) {
  return <div className="rounded-xl border border-green-700/10 bg-white p-3"><strong className="text-sm">{title}</strong><p className="mt-1 text-xs leading-5 text-ink/50">{text}</p></div>;
}
