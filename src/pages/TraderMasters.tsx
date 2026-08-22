import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, Search } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import {
  applyMasterProfile,
  discoverMasters,
  getMasterEvidence,
  getMasterProfile,
  getMyMasterProfiles,
  revokeMasterProfile,
  setMasterAvailability,
  updateMasterRate,
} from '../api/masterEndpoints';
import type { MasterEvidence, MasterProfile } from '../api/masterTypes';
import { formatMinorMoney, parseMajorMoneyToMinor } from '../lib/formatMinorMoney';
import { useAuth } from '../lib/auth';

const RATE_FLOOR_MINOR = 100_000;

/**
 * MW-10: Real Market Masters & Expertise Registry. Category-specific expertise recognition,
 * gated by real backend evidence and a KES 1,000/hour floor. Never a hidden trust score, never
 * universal, never adjudicated.
 */
export default function TraderMasters() {
  return <MasterRegistryHub />;
}

function MasterRegistryHub() {
  const { user, session } = useAuth();
  const [masters, setMasters] = useState<MasterProfile[] | null>(null);
  const [myProfiles, setMyProfiles] = useState<MasterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [applyCategory, setApplyCategory] = useState('');
  const [applyRate, setApplyRate] = useState('1000');
  const [applying, setApplying] = useState(false);
  const [applyNote, setApplyNote] = useState<string | null>(null);

  const load = useCallback(async (filterCategory?: string) => {
    if (!session?.accessToken) return;
    setLoading(true);
    setError(null);
    const [discoverResult, mineResult] = await Promise.all([
      discoverMasters(session.accessToken, filterCategory || undefined),
      getMyMasterProfiles(session.accessToken),
    ]);
    if (!discoverResult.ok || !discoverResult.data) {
      setError(discoverResult.error || 'Masters could not be loaded.');
      setLoading(false);
      return;
    }
    setMasters(discoverResult.data);
    if (mineResult.ok && mineResult.data) setMyProfiles(mineResult.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;

  async function handleApply(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !applyCategory.trim()) return;
    const rateMinor = parseMajorMoneyToMinor('KES', applyRate);
    if (rateMinor === null) {
      setApplyNote('Enter a valid rate.');
      return;
    }
    setApplying(true);
    setApplyNote(null);
    const result = await applyMasterProfile(session.accessToken, { category: applyCategory.trim(), rateMinorPerHour: rateMinor });
    setApplying(false);
    if (!result.ok) {
      setApplyNote(result.error || 'Could not apply.');
      return;
    }
    setApplyNote('Master profile created.');
    setApplyCategory('');
    void load(category);
  }

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Masters"
      title="Experience you can find and understand"
      description="A Master is recognised for a specific category, backed by real evidence you can see — never a hidden trust score, never universal, never adjudicated. Minimum rate: KES 1,000/hour."
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Masters could not be loaded" detail={error} onRetry={() => void load(category)} />}

    {!loading && !error && <div className="space-y-6">
      {myProfiles.length > 0 && <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Your Master profiles</p>
        <ul className="mt-3 space-y-2">
          {myProfiles.map(m => <li key={m.id}>
            <Link to={`/masters/${m.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 bg-white p-3 text-sm">
              <span className="font-semibold text-ink">{m.category}</span>
              <span className="text-ink/45">{m.status === 'ACTIVE' ? (m.available ? 'Available' : 'Not available') : 'Revoked'}</span>
            </Link>
          </li>)}
        </ul>
      </section>}

      <section className="rounded-2xl border border-ink/8 bg-white p-3 shadow-sm">
        <label className="flex min-h-12 items-center gap-3 rounded-xl px-3">
          <Search size={18} className="shrink-0 text-ink/35" />
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            onBlur={() => void load(category)}
            placeholder="Filter by category, e.g. Builder, Electrician"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Discover Masters</p>
        {!masters || masters.length === 0
          ? <p className="mt-3 text-sm text-ink/55">No Masters found for this category yet.</p>
          : <ul className="mt-3 space-y-2">
            {masters.map(m => <li key={m.id}>
              <Link to={`/masters/${m.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-ink/8 p-4 transition hover:border-green-700/30">
                <span className="flex min-w-0 items-center gap-2">
                  <Award size={16} className="shrink-0 text-green-700" />
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">{m.category}</span>
                  <span className="shrink-0 text-xs text-ink/45">{m.ksNumber}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 text-sm text-ink/55">
                  {formatMinorMoney(m.currency, m.rateMinorPerHour)}/hr
                  <ArrowRight size={15} className="text-ink/40" />
                </span>
              </Link>
            </li>)}
          </ul>}
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Apply as a Master</p>
        <p className="mt-1 text-sm text-ink/55">Requires some real backend-provable Market engagement already (a referral, circle, or community relationship) — SecurePay will not let a brand-new account self-declare Master status.</p>
        <form onSubmit={handleApply} className="mt-4 space-y-3">
          <input value={applyCategory} onChange={e => setApplyCategory(e.target.value)} placeholder="Category, e.g. Builder" required
            className="w-full min-h-11 rounded-xl border border-ink/15 px-4 text-sm" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink/55">KES</span>
            <input value={applyRate} onChange={e => setApplyRate(e.target.value)} type="number" min="1000" step="1"
              className="min-h-11 w-32 rounded-xl border border-ink/15 px-4 text-sm" />
            <span className="text-sm text-ink/55">/hour (minimum 1,000)</span>
          </div>
          <button type="submit" disabled={applying || !applyCategory.trim()} className="min-h-11 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">
            {applying ? 'Applying…' : 'Apply'}
          </button>
        </form>
        {applyNote && <p className="mt-2 text-sm text-ink/60">{applyNote}</p>}
      </section>
    </div>}
  </TraderShell>;
}

export function TraderMasterDetail() {
  const { masterId } = useParams<{ masterId: string }>();
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [evidence, setEvidence] = useState<MasterEvidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateInput, setRateInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken || !masterId) return;
    setLoading(true);
    setError(null);
    const profileResult = await getMasterProfile(session.accessToken, masterId);
    if (!profileResult.ok || !profileResult.data) {
      setError(profileResult.error || 'This Master profile could not be shown.');
      setLoading(false);
      return;
    }
    setProfile(profileResult.data);
    setRateInput(String(profileResult.data.rateMinorPerHour / 100));
    const evidenceResult = await getMasterEvidence(session.accessToken, masterId);
    if (evidenceResult.ok && evidenceResult.data) setEvidence(evidenceResult.data);
    setLoading(false);
  }, [session?.accessToken, masterId]);

  useEffect(() => { void load(); }, [load]);

  if (!user || !session) return <Navigate to="/" replace />;
  if (!masterId) return <Navigate to="/masters" replace />;

  const isOwner = profile && user && profile.identityId === user.id;

  async function handleRateUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!session?.accessToken || !masterId) return;
    const rateMinor = parseMajorMoneyToMinor('KES', rateInput);
    if (rateMinor === null || rateMinor < RATE_FLOOR_MINOR) {
      setNote('Rate must be at least KES 1,000/hour.');
      return;
    }
    setBusy(true);
    const result = await updateMasterRate(session.accessToken, masterId, { rateMinorPerHour: rateMinor });
    setBusy(false);
    setNote(result.ok ? 'Rate updated.' : result.error || 'Could not update rate.');
    if (result.ok) void load();
  }

  async function handleToggleAvailability() {
    if (!session?.accessToken || !masterId || !profile) return;
    setBusy(true);
    const result = await setMasterAvailability(session.accessToken, masterId, { available: !profile.available });
    setBusy(false);
    if (result.ok) void load();
  }

  async function handleRevoke() {
    if (!session?.accessToken || !masterId) return;
    setBusy(true);
    const result = await revokeMasterProfile(session.accessToken, masterId);
    setBusy(false);
    if (result.ok) void load();
  }

  return <TraderShell>
    <Link to="/masters" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700"><ArrowLeft size={15} /> Masters</Link>

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="This Master profile could not be shown" detail={error} onRetry={() => void load()} />}

    {!loading && !error && profile && <div className="space-y-6">
      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-green-700"><Award size={18} /><span className="text-xs font-bold uppercase tracking-[0.16em]">Master {profile.category}</span></div>
        <h1 className="mt-2 font-display text-3xl">{profile.ksNumber || 'Trader'}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink/60">
          <span>{formatMinorMoney(profile.currency, profile.rateMinorPerHour)}/hour</span>
          <span>{profile.status === 'REVOKED' ? 'Revoked' : profile.available ? 'Available' : 'Not currently available'}</span>
        </div>
        <p className="mt-4 text-xs leading-5 text-ink/45">Master status is category-specific and self-declared against real, disclosed evidence — it is not an adjudication, not universal, and grants no agreement authority.</p>
        {note && <p className="mt-2 text-sm text-ink/60">{note}</p>}
      </section>

      <section className="rounded-2xl border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Why this person is a Master</p>
        <p className="mt-1 text-sm text-ink/55">Raw, explainable counts from real backend records — never a score or rank.</p>
        {evidence && <div className="mt-3 grid grid-cols-3 gap-3">
          <Fact label="Referrals activated" value={evidence.activatedOrQualifiedReferralCount.toString()} />
          <Fact label="Active circles" value={evidence.activeCircleMembershipCount.toString()} />
          <Fact label="Active communities" value={evidence.activeCommunityMembershipCount.toString()} />
        </div>}
      </section>

      {isOwner && profile.status === 'ACTIVE' && <section className="rounded-2xl border border-green-700/10 bg-green-50/50 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Owner tools</p>
        <form onSubmit={handleRateUpdate} className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink/55">KES</span>
          <input value={rateInput} onChange={e => setRateInput(e.target.value)} type="number" min="1000" className="min-h-11 w-32 rounded-xl border border-ink/15 px-4 text-sm" />
          <span className="text-sm text-ink/55">/hour</span>
          <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50">Update rate</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" onClick={() => void handleToggleAvailability()} disabled={busy} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/65">
            {profile.available ? 'Mark unavailable' : 'Mark available'}
          </button>
          <button type="button" onClick={() => void handleRevoke()} disabled={busy} className="min-h-10 rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/65">Revoke Master status</button>
        </div>
      </section>}
    </div>}
  </TraderShell>;
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-ink/8 bg-[#fbfcf9] p-3">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</p>
    <p className="mt-1 font-display text-lg">{value}</p>
  </div>;
}
