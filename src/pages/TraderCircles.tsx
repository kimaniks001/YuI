import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Crown, Sparkles, Users } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import SystemStateRoom from '../components/SystemStateRoom';
import {
  acceptCircleInvitation,
  closeCycle,
  createCircle,
  declineCircleInvitation,
  getCircle,
  getCircleCycleMetrics,
  getMyCircles,
  inviteToCircle,
  leaveCircle,
  listCircleIntentions,
  listCircleMembers,
  listCircleOpportunityShares,
  listCycles,
  logCircleIntention,
  logCircleOpportunityShare,
  setCircleStatus,
  startCycle,
} from '../api/circleEndpoints';
import type {
  CircleCycleMetricsResponse,
  CircleIntentionResponse,
  CircleMemberResponse,
  CircleMembershipResponse,
  CircleOpportunityShareResponse,
  CircleResponse,
  CycleResponse,
  MyCirclesResponse,
} from '../api/circleTypes';
import { useAuth } from '../lib/auth';

/**
 * MW-08: Circles & Cycles. A Circle is "who have I deliberately chosen to work and grow with?" —
 * distinct from a Community ("who are my people?", MW-07). Every fact on this page comes from
 * SecurePayAPI; nothing here is simulated. Membership is invite-only: there is no public join.
 */
export default function TraderCircles() {
  return <MyCirclesHub />;
}

function MyCirclesHub() {
  const { user, session } = useAuth();
  const [data, setData] = useState<MyCirclesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    const result = await getMyCircles(session.accessToken);
    if (!result.ok || !result.data) {
      setError(result.error || 'Your circles could not be loaded.');
      setLoading(false);
      return;
    }
    setData(result.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !name.trim()) return;
    setCreating(true);
    setError(null);
    const result = await createCircle(session.accessToken, { name: name.trim(), description: description.trim() || undefined });
    setCreating(false);
    if (!result.ok || !result.data) {
      setError(result.error || 'The circle could not be created.');
      return;
    }
    navigate(`/circles/${result.data.id}`);
  }

  async function handleDecide(circleId: string, invitationId: string, accept: boolean) {
    if (!session?.accessToken) return;
    const action = accept ? acceptCircleInvitation : declineCircleInvitation;
    const result = await action(session.accessToken, circleId, invitationId);
    if (result.ok) void load();
  }

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Circles"
      title="Who you've deliberately chosen to grow with"
      description="A Circle is a small, deliberate group for working and growing together — different from Community, which is simply belonging. Circles are invite-only: nobody joins a Circle without an organiser choosing them."
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Circles could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && data && <div className="space-y-6">
      {data.pendingInvitations.length > 0 && <section className="rounded-2xl border border-green-700/15 bg-green-50/60 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Invitations waiting for you</p>
        <p className="mt-1 text-sm text-ink/55">An organiser chose to invite you. Invitation is not participation — nothing changes until you accept.</p>
        <ul className="mt-4 space-y-3">
          {data.pendingInvitations.map(invite => <li key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/8 bg-white p-4">
            <span className="text-sm text-ink/70">Circle invitation, sent {new Date(invite.createdAt).toLocaleDateString('en-KE')}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => void handleDecide(invite.circleId, invite.id, true)} className="min-h-10 rounded-full bg-green-700 px-4 text-sm font-semibold text-white">Accept</button>
              <button type="button" onClick={() => void handleDecide(invite.circleId, invite.id, false)} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/65">Decline</button>
            </div>
          </li>)}
        </ul>
      </section>}

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">My Circles</p>
        {data.memberships.length === 0
          ? <p className="mt-2 text-sm leading-6 text-ink/55">You are not part of a Circle yet. Start one below, or wait for an organiser to invite you.</p>
          : <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.memberships.map(m => <CircleCard key={m.circleId} membership={m} />)}
          </ul>}
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-green-700"><Sparkles size={18} /><span className="text-xs font-bold uppercase tracking-[0.16em]">Start a new Circle</span></div>
        <p className="mt-2 text-sm text-ink/55">You become the organiser. Invite the people you want to grow with once it exists.</p>
        <form onSubmit={handleCreate} className="mt-4 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Circle name" required
            className="w-full min-h-11 rounded-xl border border-ink/15 px-4 text-sm" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this Circle for? (optional)"
            className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm" rows={2} />
          <button type="submit" disabled={creating || !name.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">
            {creating ? 'Creating…' : 'Create Circle'}
          </button>
        </form>
      </section>
    </div>}
  </TraderShell>;
}

function CircleCard({ membership }: { membership: CircleMembershipResponse }) {
  return <li>
    <Link to={`/circles/${membership.circleId}`} className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 p-4 transition hover:border-green-700/30">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        {membership.role === 'ORGANISER' ? <Crown size={16} className="text-green-700" /> : <Users size={16} className="text-ink/40" />}
        {membership.role === 'ORGANISER' ? 'You organise this circle' : 'You are a member'}
      </span>
      <ArrowRight size={16} className="text-ink/40" />
    </Link>
  </li>;
}

export function TraderCircleDetail() {
  const { circleId } = useParams<{ circleId: string }>();
  const { user, session } = useAuth();
  const [circle, setCircle] = useState<CircleResponse | null>(null);
  const [members, setMembers] = useState<CircleMemberResponse[]>([]);
  const [cycles, setCycles] = useState<CycleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!session?.accessToken || !circleId) return;
    setLoading(true);
    setError(null);
    const [circleResult, membersResult, cyclesResult] = await Promise.all([
      getCircle(session.accessToken, circleId),
      listCircleMembers(session.accessToken, circleId),
      listCycles(session.accessToken, circleId),
    ]);
    if (!circleResult.ok || !circleResult.data) {
      setError(circleResult.error || 'This circle could not be loaded.');
      setLoading(false);
      return;
    }
    setCircle(circleResult.data);
    if (membersResult.ok && membersResult.data) setMembers(membersResult.data);
    if (cyclesResult.ok && cyclesResult.data) setCycles(cyclesResult.data);
    setLoading(false);
  }, [session?.accessToken, circleId]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;
  if (!circleId) return <Navigate to="/circles" replace />;

  async function handleLeave() {
    if (!session?.accessToken || !circleId) return;
    const result = await leaveCircle(session.accessToken, circleId);
    if (result.ok) navigate('/circles');
  }

  const activeCycle = cycles.find(c => c.status === 'ACTIVE') ?? null;
  const isOrganiser = circle?.callerRole === 'ORGANISER';

  return <TraderShell>
    <Link to="/circles" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> My Circles</Link>

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="This circle could not be shown" detail={error} onRetry={() => void load()} />}

    {!loading && !error && circle && <div className="space-y-6">
      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">{circle.status === 'ACTIVE' ? 'Active circle' : 'Resting circle'}</p>
            <h1 className="mt-1 font-display text-3xl">{circle.name}</h1>
            {circle.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">{circle.description}</p>}
          </div>
          <div className="text-right text-sm text-ink/55">
            <p>{circle.memberCount} active {circle.memberCount === 1 ? 'member' : 'members'}</p>
            <p className="mt-1 font-semibold text-ink/70">{isOrganiser ? 'You organise this circle' : 'You are a member'}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => void handleLeave()} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/65">Leave circle</button>
        </div>
      </section>

      {isOrganiser && <OrganiserPanel circleId={circleId} circleStatus={circle.status} onChanged={() => void load()} />}

      <MembersPanel members={members} />

      {activeCycle
        ? <CyclePanel circleId={circleId} cycle={activeCycle} isOrganiser={isOrganiser} onChanged={() => void load()} />
        : <NoActiveCyclePanel circleId={circleId} isOrganiser={isOrganiser} onChanged={() => void load()} />}
    </div>}
  </TraderShell>;
}

function OrganiserPanel({ circleId, circleStatus, onChanged }: { circleId: string; circleStatus: 'ACTIVE' | 'RESTING'; onChanged: () => void }) {
  const { session } = useAuth();
  const [ksNumber, setKsNumber] = useState('');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !ksNumber.trim()) return;
    setInviting(true);
    setMessage(null);
    const result = await inviteToCircle(session.accessToken, circleId, { invitedKsNumber: ksNumber.trim() });
    setInviting(false);
    setMessage(result.ok ? 'Invitation sent.' : result.error || 'The invitation could not be sent.');
    if (result.ok) setKsNumber('');
  }

  async function handleToggleStatus() {
    if (!session?.accessToken) return;
    const next = circleStatus === 'ACTIVE' ? 'RESTING' : 'ACTIVE';
    const result = await setCircleStatus(session.accessToken, circleId, { status: next });
    if (result.ok) onChanged();
  }

  return <section className="rounded-2xl border border-green-700/15 bg-green-50/50 p-5 shadow-sm sm:p-6">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Organiser tools</p>
    <p className="mt-1 text-sm text-ink/55">Only you can invite people, and only you can pause or resume this circle.</p>
    <form onSubmit={handleInvite} className="mt-4 flex flex-wrap gap-2">
      <input value={ksNumber} onChange={e => setKsNumber(e.target.value)} placeholder="Trader's KS Number (e.g. KS000123)" required
        className="min-h-11 flex-1 min-w-[220px] rounded-xl border border-ink/15 px-4 text-sm" />
      <button type="submit" disabled={inviting || !ksNumber.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">
        {inviting ? 'Sending…' : 'Send invitation'}
      </button>
    </form>
    {message && <p className="mt-2 text-sm text-ink/60">{message}</p>}
    <div className="mt-4 border-t border-green-700/10 pt-4">
      <button type="button" onClick={() => void handleToggleStatus()} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/65">
        {circleStatus === 'ACTIVE' ? 'Rest this circle' : 'Reactivate this circle'}
      </button>
      <p className="mt-2 text-xs text-ink/45">Resting is a deliberate pause, not deletion — nothing here is deleted or lost.</p>
    </div>
  </section>;
}

function MembersPanel({ members }: { members: CircleMemberResponse[] }) {
  return <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Members</p>
    <ul className="mt-3 space-y-2">
      {members.map(m => <li key={m.identityId} className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-ink/70">
          {m.role === 'ORGANISER' ? <Crown size={14} className="text-green-700" /> : <Users size={14} className="text-ink/35" />}
          {m.role === 'ORGANISER' ? 'Organiser' : 'Member'}
        </span>
        <span className="text-ink/45">since {new Date(m.joinedAt).toLocaleDateString('en-KE')}</span>
      </li>)}
    </ul>
  </section>;
}

function NoActiveCyclePanel({ circleId, isOrganiser, onChanged }: { circleId: string; isOrganiser: boolean; onChanged: () => void }) {
  const { session } = useAuth();
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    if (!session?.accessToken) return;
    setStarting(true);
    const result = await startCycle(session.accessToken, circleId);
    setStarting(false);
    if (result.ok) onChanged();
  }

  return <SystemStateRoom
    state="resting"
    eyebrow="No active Cycle"
    title="This circle has no open Cycle right now"
    means="A Cycle is a bounded period of deliberate activity — intentions and opportunity shares only count inside one."
    next={isOrganiser
      ? 'Start a new Cycle when the circle is ready to work together again.'
      : 'Wait for the organiser to start the next Cycle.'}
    money="Starting or closing a Cycle never moves money — it only tracks free-text intentions and shares."
    action={isOrganiser
      ? <button type="button" onClick={() => void handleStart()} disabled={starting} className="b10-primary">{starting ? 'Starting…' : 'Start a Cycle'}</button>
      : undefined}
  />;
}

function CyclePanel({ circleId, cycle, isOrganiser, onChanged }: { circleId: string; cycle: CycleResponse; isOrganiser: boolean; onChanged: () => void }) {
  const { session } = useAuth();
  const [intentions, setIntentions] = useState<CircleIntentionResponse[]>([]);
  const [shares, setShares] = useState<CircleOpportunityShareResponse[]>([]);
  const [metrics, setMetrics] = useState<CircleCycleMetricsResponse | null>(null);
  const [intentionText, setIntentionText] = useState('');
  const [shareText, setShareText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    const [intentionsResult, sharesResult, metricsResult] = await Promise.all([
      listCircleIntentions(session.accessToken, circleId, cycle.id),
      listCircleOpportunityShares(session.accessToken, circleId, cycle.id),
      getCircleCycleMetrics(session.accessToken, circleId, cycle.id),
    ]);
    if (intentionsResult.ok && intentionsResult.data) setIntentions(intentionsResult.data);
    if (sharesResult.ok && sharesResult.data) setShares(sharesResult.data);
    if (metricsResult.ok && metricsResult.data) setMetrics(metricsResult.data);
  }, [session?.accessToken, circleId, cycle.id]);

  useEffect(() => { void load(); }, [load]);

  async function handleLogIntention(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !intentionText.trim()) return;
    setBusy(true);
    const result = await logCircleIntention(session.accessToken, circleId, cycle.id, { description: intentionText.trim() });
    setBusy(false);
    if (result.ok) { setIntentionText(''); void load(); }
  }

  async function handleLogShare(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !shareText.trim()) return;
    setBusy(true);
    const result = await logCircleOpportunityShare(session.accessToken, circleId, cycle.id, { description: shareText.trim() });
    setBusy(false);
    if (result.ok) { setShareText(''); void load(); }
  }

  async function handleClose() {
    if (!session?.accessToken) return;
    const result = await closeCycle(session.accessToken, circleId, cycle.id);
    if (result.ok) onChanged();
  }

  return <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Current Cycle</p>
        <p className="mt-1 text-sm text-ink/55">Open since {new Date(cycle.startedAt).toLocaleDateString('en-KE')}</p>
      </div>
      {isOrganiser && <button type="button" onClick={() => void handleClose()} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/65">Close this Cycle</button>}
    </div>

    {metrics && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Fact label="Active members" value={metrics.activeMemberCount.toString()} />
      <Fact label="Intentions" value={metrics.intentionCount.toString()} />
      <Fact label="Opportunities shared" value={metrics.opportunityShareCount.toString()} />
      <Fact label="Your contribution" value={`${metrics.contributions.length} member${metrics.contributions.length === 1 ? '' : 's'} tracked`} />
    </div>}
    <p className="mt-2 text-xs leading-5 text-ink/45">These are raw counts, not a score or ranking — SecurePay does not rank Circle members against one another.</p>

    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Intentions this Cycle</p>
        <form onSubmit={handleLogIntention} className="mt-3 flex gap-2">
          <input value={intentionText} onChange={e => setIntentionText(e.target.value)} placeholder="What are you working toward?" className="min-h-11 flex-1 rounded-xl border border-ink/15 px-4 text-sm" />
          <button type="submit" disabled={busy || !intentionText.trim()} className="min-h-11 rounded-full bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50">Log</button>
        </form>
        <ul className="mt-3 space-y-2">
          {intentions.map(i => <li key={i.id} className="rounded-xl border border-ink/8 p-3 text-sm text-ink/70">{i.description}</li>)}
        </ul>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Opportunities shared this Cycle</p>
        <form onSubmit={handleLogShare} className="mt-3 flex gap-2">
          <input value={shareText} onChange={e => setShareText(e.target.value)} placeholder="What opportunity did you pass on?" className="min-h-11 flex-1 rounded-xl border border-ink/15 px-4 text-sm" />
          <button type="submit" disabled={busy || !shareText.trim()} className="min-h-11 rounded-full bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50">Log</button>
        </form>
        <ul className="mt-3 space-y-2">
          {shares.map(s => <li key={s.id} className="rounded-xl border border-ink/8 p-3 text-sm text-ink/70">{s.description}</li>)}
        </ul>
        <p className="mt-2 text-xs leading-5 text-ink/45">This is a record that an opportunity was shared, not an agreement, claim, or reward — opportunity is never the same as agreement.</p>
      </div>
    </div>
  </section>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-ink/8 bg-[#fbfcf9] p-3">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</p>
    <p className="mt-1 font-display text-lg">{value}</p>
  </div>;
}
