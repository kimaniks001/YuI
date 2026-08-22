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
import LivingSecurePayMark from '../components/LivingSecurePayMark';

type CommunityRoom = 'home' | 'discover' | 'members' | 'feed' | 'rules';

const rooms: Array<{ id: CommunityRoom; label: string }> = [
  { id: 'home', label: 'My people' },
  { id: 'discover', label: 'Discover' },
  { id: 'members', label: 'Members' },
  { id: 'feed', label: 'Market feed' },
  { id: 'rules', label: 'Rules' },
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
    setLoading(true);
    setError(null);
    const result = await getMyCircle(session.accessToken);
    if (!result.ok || !result.data) {
      setError(result.error || 'Your proven Market relationships could not be loaded.');
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
      eyebrow="Community"
      title="Your people in the Market"
      description="Community is where belonging and discovery become useful. SecurePay only shows relationship facts the backend can prove; membership is never an endorsement and private trade stays private."
    />

    <div className="mb-5 flex gap-2 overflow-x-auto pb-1" aria-label="Community rooms">
      {rooms.map(item => <button
        key={item.id}
        type="button"
        onClick={() => setRoom(item.id)}
        className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${room === item.id ? 'border-green-700 bg-green-700 text-white' : 'border-ink/10 bg-white text-ink/65 hover:border-green-700/30'}`}
      >{item.label}</button>)}
    </div>

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Community context could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && circle && room === 'home' && <CommunityHome circle={circle} />}
    {!loading && !error && room === 'discover' && <AuthorityGate icon={<Compass size={20} />} title="Community discovery is not authoritative yet" detail="SecurePayAPI does not yet expose a Community directory with visibility rules. YUI will not manufacture nearby groups, popularity, rankings or recommendations. Discovery activates when the Community backend contract exists." />}
    {!loading && !error && room === 'members' && <AuthorityGate icon={<Users size={20} />} title="Membership needs its own backend truth" detail="The current Circle projection is relationship context, not a Community membership register. Join, request, approve, leave, moderator and member-list actions remain unavailable until the backend owns them." />}
    {!loading && !error && room === 'feed' && <AuthorityGate icon={<Network size={20} />} title="A lively feed must still be privacy-safe" detail="There is no authoritative Community feed event stream yet. Private agreements, amounts, counterparties and recovery activity will never be turned into social posts by the browser. Publication must be explicit and backend-governed." />}
    {!loading && !error && room === 'rules' && <AuthorityGate icon={<ShieldCheck size={20} />} title="Rules and moderators must be real" detail="Community rules, visibility and moderator authority are not stored by the current backend. Until they are, SecurePay will not display invented rules or imply that any trader moderates another trader." />}
  </TraderShell>;
}

function CommunityHome({ circle }: { circle: CircleProfileResponse }) {
  return <div className="space-y-6">
    <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <LivingSecurePayMark state="resting" size="md" presence="polite" decorative />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Proven relationship context</p>
          <h2 className="mt-1 font-display text-2xl">{circle.displayName || circle.canonicalKsNumber}</h2>
          <p className="mt-1 font-mono text-sm text-ink/55">{circle.canonicalKsNumber}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label="Verification" value={circle.verificationStatus} />
        <Fact label="In the Market since" value={new Date(circle.memberSince).toLocaleDateString('en-KE')} />
        <Fact label="Traders referred" value={circle.referredTraderCount.toString()} />
        <Fact label="Activated referred" value={circle.activatedReferredTraderCount.toString()} />
      </div>
      <p className="mt-4 text-xs leading-5 text-ink/45">These are backend-provided identity/referral facts. They are not Community size, reputation, a trust score, a ranking or an endorsement.</p>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-green-700/10 bg-green-50/60 p-5 shadow-sm sm:p-6">
        <div className="flex gap-3">
          <LivingSecurePayMark state="guiding" size="sm" presence="present" decorative />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Connection, not ranking</p>
            <h2 className="mt-1 font-display text-xl">Belonging should help opportunity travel.</h2>
            <p className="mt-2 text-sm leading-6 text-ink/55">Your KSNumber is your Market identity. Your Store shows what you offer. Community should help the right people find one another without exposing private trade or turning connection into a score.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link to={`/ks/${encodeURIComponent(circle.canonicalKsNumber)}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">Open your KS Store <ArrowRight size={15} /></Link>
          <Link to="/referrals" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700">See referral provenance <ArrowRight size={15} /></Link>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-green-700"><Crown size={18} /><span className="text-xs font-bold uppercase tracking-[0.16em]">Masters</span></div>
        <h2 className="mt-2 font-display text-xl">Find experience without inventing authority.</h2>
        <p className="mt-2 text-sm leading-6 text-ink/55">Community will become one route into category-specific Master discovery. Real Market Master status, evidence and rates are not yet authoritative, so no trader is labelled a Master here today.</p>
        <p className="mt-4 text-xs font-semibold text-ink/40">Master registry and evidence authority are scheduled for MW-10.</p>
      </div>
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
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Privacy law of the Market</p>
        <h2 className="mt-1 font-display text-2xl">Public because you chose to publish it — not because SecurePay knows it.</h2>
        <p className="mt-2 text-sm leading-6 text-ink/55">A future Community feed may show explicitly publishable Community events. Agreement details, amounts, payment state, evidence, Recovery & Resolution and private participant identity stay outside the feed unless a future backend contract explicitly makes a safe item publishable.</p>
      </div>
    </section>
  </div>;
}

function AuthorityGate({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-amber-700">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Backend authority required</p>
        <h2 className="mt-1 font-display text-2xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/60">{detail}</p>
      </div>
    </div>
  </section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-ink/[0.025] p-3"><p className="text-xs text-ink/45">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}
