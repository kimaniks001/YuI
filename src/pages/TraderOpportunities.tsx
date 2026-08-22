import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Inbox, Send, Sparkles, Target } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import {
  claimOpportunity,
  closeOpportunity,
  createOpportunity,
  getMyMarketConvergence,
  getOpportunity,
  getOpportunityProvenance,
  listOpportunityResponses,
  passOpportunity,
  respondToOpportunity,
} from '../api/opportunityEndpoints';
import type {
  MyMarketConvergenceResponse,
  OpportunityPassResponse,
  OpportunityResponseDto,
  OpportunityResponseRecord,
} from '../api/opportunityTypes';
import { useAuth } from '../lib/auth';

/**
 * MW-09: Opportunities, Connectors & My Market Convergence. An opportunity travels because
 * someone deliberately passed it on — the Plug/Connector role. Every fact here comes from
 * SecurePayAPI. Responding, passing, and claiming never create an agreement, reservation, or
 * sale — opportunity is never the same as agreement.
 */
export default function TraderOpportunities() {
  return <MyMarketConvergenceHub />;
}

function MyMarketConvergenceHub() {
  const { user, session } = useAuth();
  const [data, setData] = useState<MyMarketConvergenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    const result = await getMyMarketConvergence(session.accessToken);
    if (!result.ok || !result.data) {
      setError(result.error || 'Your Market convergence could not be loaded.');
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
    if (!session?.accessToken || !title.trim()) return;
    setCreating(true);
    setError(null);
    const result = await createOpportunity(session.accessToken, { title: title.trim(), description: description.trim() || undefined });
    setCreating(false);
    if (!result.ok || !result.data) {
      setError(result.error || 'The opportunity could not be created.');
      return;
    }
    navigate(`/opportunities/${result.data.id}`);
  }

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Opportunities"
      title="Where work finds the right person"
      description="An opportunity travels because someone deliberately passed it on. Passing, responding, and claiming are all real backend actions — none of them create an agreement, reservation, or sale on their own."
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Opportunities could not be loaded" detail={error} onRetry={() => void load()} />}

    {!loading && !error && data && <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <Fact icon={<Target size={16} />} label="Opportunities you created" value={data.created.length.toString()} />
        <Fact icon={<Inbox size={16} />} label="Waiting in your inbox" value={data.inbox.length.toString()} />
        <Fact icon={<Send size={16} />} label="Opportunities you've claimed" value={data.claimed.length.toString()} />
      </section>

      <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Your connector contribution</p>
        <p className="mt-1 text-sm text-ink/55">Raw counts only — SecurePay does not turn this into a score, rank, or automatic reward. Referral provenance is not the same as reward entitlement.</p>
        <div className="mt-3 flex gap-6">
          <div><p className="font-display text-2xl">{data.connectorContribution.passesMade}</p><p className="text-xs text-ink/45">opportunities you passed on</p></div>
          <div><p className="font-display text-2xl">{data.connectorContribution.passesThatWereClaimed}</p><p className="text-xs text-ink/45">of those were eventually claimed</p></div>
        </div>
      </section>

      {data.inbox.length > 0 && <OpportunityListSection title="Waiting in your inbox" items={data.inbox} />}
      {data.created.length > 0 && <OpportunityListSection title="You created these" items={data.created} />}
      {data.claimed.length > 0 && <OpportunityListSection title="You claimed these" items={data.claimed} />}

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-green-700"><Sparkles size={18} /><span className="text-xs font-bold uppercase tracking-[0.16em]">Post a new opportunity</span></div>
        <form onSubmit={handleCreate} className="mt-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What's the opportunity?" required
            className="w-full min-h-11 rounded-xl border border-ink/15 px-4 text-sm" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Details (optional)"
            className="w-full rounded-xl border border-ink/15 px-4 py-2 text-sm" rows={2} />
          <button type="submit" disabled={creating || !title.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">
            {creating ? 'Posting…' : 'Post opportunity'}
          </button>
        </form>
      </section>
    </div>}
  </TraderShell>;
}

function OpportunityListSection({ title, items }: { title: string; items: OpportunityResponseDto[] }) {
  return <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">{title}</p>
    <ul className="mt-3 space-y-2">
      {items.map(o => <li key={o.id}>
        <Link to={`/opportunities/${o.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 p-4 transition hover:border-green-700/30">
          <span className="min-w-0 truncate text-sm font-semibold text-ink">{o.title}</span>
          <span className="flex shrink-0 items-center gap-3">
            <StatusPill status={o.status} />
            <ArrowRight size={15} className="text-ink/40" />
          </span>
        </Link>
      </li>)}
    </ul>
  </section>;
}

function StatusPill({ status }: { status: string }) {
  const styles = status === 'OPEN' ? 'bg-green-100 text-green-800' : status === 'CLAIMED' ? 'bg-amber-100 text-amber-800' : 'bg-ink/10 text-ink/55';
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles}`}>{status}</span>;
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-ink/8 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2 text-green-700">{icon}<span className="text-[11px] font-bold uppercase tracking-[0.16em]">{label}</span></div>
    <p className="mt-2 font-display text-3xl">{value}</p>
  </div>;
}

export function TraderOpportunityDetail() {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const { user, session } = useAuth();
  const [opportunity, setOpportunity] = useState<OpportunityResponseDto | null>(null);
  const [provenance, setProvenance] = useState<OpportunityPassResponse[]>([]);
  const [responses, setResponses] = useState<OpportunityResponseRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ksNumber, setKsNumber] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken || !opportunityId) return;
    setLoading(true);
    setError(null);
    const opportunityResult = await getOpportunity(session.accessToken, opportunityId);
    if (!opportunityResult.ok || !opportunityResult.data) {
      setError(opportunityResult.error || 'This opportunity could not be shown.');
      setLoading(false);
      return;
    }
    setOpportunity(opportunityResult.data);
    const provenanceResult = await getOpportunityProvenance(session.accessToken, opportunityId);
    if (provenanceResult.ok && provenanceResult.data) setProvenance(provenanceResult.data);
    if (opportunityResult.data.createdByIdentityId === user?.id) {
      const responsesResult = await listOpportunityResponses(session.accessToken, opportunityId);
      if (responsesResult.ok && responsesResult.data) setResponses(responsesResult.data);
    }
    setLoading(false);
  }, [session?.accessToken, opportunityId, user?.id]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;
  if (!opportunityId) return <Navigate to="/opportunities" replace />;

  async function handlePass(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !opportunityId || !ksNumber.trim()) return;
    setBusy(true);
    setNote(null);
    const result = await passOpportunity(session.accessToken, opportunityId, { passedToKsNumber: ksNumber.trim() });
    setBusy(false);
    setNote(result.ok ? 'Opportunity passed on.' : result.error || 'That could not be passed on.');
    if (result.ok) { setKsNumber(''); void load(); }
  }

  async function handleRespond(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !opportunityId || !message.trim()) return;
    setBusy(true);
    setNote(null);
    const result = await respondToOpportunity(session.accessToken, opportunityId, { message: message.trim() });
    setBusy(false);
    setNote(result.ok ? 'Your interest was recorded.' : result.error || 'That could not be sent.');
    if (result.ok) setMessage('');
  }

  async function handleClaim() {
    if (!session?.accessToken || !opportunityId) return;
    setBusy(true);
    const result = await claimOpportunity(session.accessToken, opportunityId);
    setBusy(false);
    if (result.ok) void load();
    else setNote(result.error || 'This could not be claimed.');
  }

  async function handleClose() {
    if (!session?.accessToken || !opportunityId) return;
    setBusy(true);
    const result = await closeOpportunity(session.accessToken, opportunityId);
    setBusy(false);
    if (result.ok) void load();
  }

  const isCreator = opportunity && user && opportunity.createdByIdentityId === user.id;

  return <TraderShell>
    <Link to="/opportunities" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Opportunities</Link>

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="This opportunity could not be shown" detail={error} onRetry={() => void load()} />}

    {!loading && !error && opportunity && <div className="space-y-6">
      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <StatusPill status={opportunity.status} />
            <h1 className="mt-2 font-display text-3xl">{opportunity.title}</h1>
            {opportunity.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">{opportunity.description}</p>}
          </div>
          {isCreator && opportunity.status !== 'CLOSED' && <button type="button" onClick={() => void handleClose()} disabled={busy} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/65">Close</button>}
        </div>
        <p className="mt-4 text-xs leading-5 text-ink/45">Responding, passing, and claiming are never a reservation, offer, sale, or agreement. If this turns into real work, that still happens through its own agreement.</p>
        {note && <p className="mt-3 text-sm text-ink/60">{note}</p>}

        {opportunity.status === 'OPEN' && <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => void handleClaim()} disabled={busy} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">I'm taking this</button>
        </div>}
      </section>

      {opportunity.status === 'OPEN' && <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Pass this on</p>
          <p className="mt-1 text-sm text-ink/55">Help it reach the right person — the connector role.</p>
          <form onSubmit={handlePass} className="mt-3 flex gap-2">
            <input value={ksNumber} onChange={e => setKsNumber(e.target.value)} placeholder="Trader's KS Number" className="min-h-11 flex-1 rounded-xl border border-ink/15 px-4 text-sm" />
            <button type="submit" disabled={busy || !ksNumber.trim()} className="min-h-11 rounded-full bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50">Pass</button>
          </form>
        </div>
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Express interest</p>
          <p className="mt-1 text-sm text-ink/55">Never a reservation or offer — just a message to the creator.</p>
          <form onSubmit={handleRespond} className="mt-3 flex gap-2">
            <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Say something" className="min-h-11 flex-1 rounded-xl border border-ink/15 px-4 text-sm" />
            <button type="submit" disabled={busy || !message.trim()} className="min-h-11 rounded-full bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50">Send</button>
          </form>
        </div>
      </section>}

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">How this opportunity travelled</p>
        {provenance.length === 0
          ? <p className="mt-2 text-sm text-ink/55">Not yet passed to anyone.</p>
          : <ul className="mt-3 space-y-2 text-sm text-ink/70">{provenance.map(p => <li key={p.id}>Passed on {new Date(p.createdAt).toLocaleDateString('en-KE')}</li>)}</ul>}
      </section>

      {isCreator && responses && <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Responses ({responses.length})</p>
        <ul className="mt-3 space-y-2">
          {responses.map(r => <li key={r.id} className="rounded-xl border border-ink/8 p-3 text-sm text-ink/70">{r.message}</li>)}
        </ul>
      </section>}
    </div>}
  </TraderShell>;
}
