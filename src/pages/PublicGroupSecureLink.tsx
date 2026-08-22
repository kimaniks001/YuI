import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Users } from 'lucide-react';
import { getPublicGroupSecureLink } from '../api/securepayEndpoints';
import type { SecurePayPublicGroupSecureLink } from '../api/securepayTypes';
import LoadingState from '../components/api/LoadingState';
import ErrorState from '../components/api/ErrorState';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { formatMinorMoney } from '../lib/formatMinorMoney';
import { groupStatusLabel, groupTargetTypeLabel, groupTypeLabel } from '../lib/groupSecureLinkPresentation';

function safeCount(value: number): string {
  return Number.isSafeInteger(value) && value >= 0 ? value.toLocaleString('en-KE') : 'Unavailable';
}

function safeMoney(currency: string, value: number | null): string | null {
  return value === null || !Number.isSafeInteger(value) || value < 0 ? null : formatMinorMoney(currency, value);
}

export default function PublicGroupSecureLink() {
  const { slug } = useParams<{ slug: string }>();
  const [group, setGroup] = useState<SecurePayPublicGroupSecureLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setLoading(true); setError(null); setGroup(null);
    if (!slug) {
      setError('This Group SecureLink is incomplete.'); setLoading(false);
      return () => { current = false; };
    }
    void getPublicGroupSecureLink(slug).then(result => {
      if (!current) return;
      if (result.ok && result.data) setGroup(result.data);
      else setError(result.status === 404 ? 'This Group SecureLink is not available.' : (result.error ?? 'This Group SecureLink could not be loaded.'));
      setLoading(false);
    });
    return () => { current = false; };
  }, [slug]);

  if (loading) return <main className="min-h-screen bg-[#fffdf8] p-6"><LoadingState message="Opening this Group SecureLink…" /></main>;
  if (error || !group) return <main className="min-h-screen bg-[#fffdf8] p-6"><ErrorState message={error ?? 'This Group SecureLink is not available.'} /></main>;

  const target = safeMoney(group.currency, group.targetAmountMinor);
  const confirmed = safeMoney(group.currency, group.confirmedContributionTotalMinor);
  const intended = safeMoney(group.currency, group.recordedContributionTotalMinor);
  const deadline = group.contributionDeadline ? new Date(group.contributionDeadline) : null;
  const validDeadline = deadline && !Number.isNaN(deadline.getTime());

  return (
    <div className="b5-join-room min-h-screen bg-[#fffdf8] text-[#1a1a1a]">
      <header className="border-b border-black/7 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link>
          <Link to="/situations" className="text-sm font-semibold text-[#3a7a1f]">About Group SecureLink</Link>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-[960px]">
          <div className="rounded-[30px] border border-black/7 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#edf6e8] px-3 py-1 text-xs font-bold text-[#3a7a1f]">Group SecureLink</span>
              <span className="rounded-full bg-[#f5f1e8] px-3 py-1 text-xs font-semibold text-black/55">{groupStatusLabel(group.status)}</span>
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">{group.title || 'Group details unavailable'}</h1>
            <p className="mt-2 text-sm text-black/48">{groupTypeLabel(group.groupType)} · {groupTargetTypeLabel(group.targetType)}</p>

            <section className="mt-7 rounded-2xl bg-[#173b20] p-5 text-white sm:p-6" aria-labelledby="purpose-heading">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">What is happening</p>
              <h2 id="purpose-heading" className="mt-2 font-display text-2xl">{group.statedPurpose || 'The purpose is not available.'}</h2>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/68">
                {target && <span>Target: <strong className="text-white">{target}</strong></span>}
                {validDeadline && <span className="inline-flex items-center gap-2"><CalendarDays size={15} />Contributions close {deadline.toLocaleDateString('en-KE')}</span>}
              </div>
            </section>

            <section className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-black/7 p-5">
                <h2 className="flex items-center gap-2 font-semibold"><Users size={18} className="text-[#3a7a1f]" /> Who is organizing?</h2>
                {group.organizers.length ? <ul className="mt-3 space-y-2 text-sm text-black/55">{group.organizers.map((organizer, index) => <li key={`${organizer.roleCode}-${index}`}>{organizer.roleLabel || 'Organizer role unavailable'}</li>)}</ul> : <p className="mt-3 text-sm text-black/48">No public organizer roles are available.</p>}
              </article>

              <article className="rounded-2xl border border-black/7 p-5">
                <h2 className="flex items-center gap-2 font-semibold"><LivingSecurePayMark state="success" size="xs" presence="polite" label="SecurePay is showing recorded contribution facts" /> What has SecurePay recorded?</h2>
                <div className="mt-4 space-y-4">
                  <div><p className="font-display text-2xl">{confirmed ?? 'Unavailable'}</p><p className="mt-1 text-xs leading-5 text-black/48">Intended amounts linked to backend-confirmed payment intents · {safeCount(group.confirmedContributionCount)} contribution record(s).</p></div>
                  <div className="border-t border-black/7 pt-4"><p className="font-display text-2xl">{intended ?? 'Unavailable'}</p><p className="mt-1 text-xs leading-5 text-black/48">Recorded contribution intentions · {safeCount(group.recordedContributionCount)} pledge(s). This is not proof that money settled.</p></div>
                </div>
              </article>
            </section>

            <section className="mt-5 rounded-2xl border border-[#3a7a1f]/15 bg-[#edf6e8] p-5">
              <h2 className="flex items-center gap-2 font-semibold"><LivingSecurePayMark state="guiding" size="xs" presence="polite" label="SecurePay is explaining what this group state means" /> What it means</h2>
              <p className="mt-2 text-sm leading-6 text-black/58">{group.governanceSummary || 'No public governance summary is available.'}</p>
              <p className="mt-4 text-sm leading-6 text-black/58">{group.contributionInstructions || 'No public contribution instructions are available.'}</p>
            </section>

            {group.status === 'ACTIVE' && <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-black/7 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">What can I do next?</h2><p className="mt-1 text-sm leading-6 text-black/52">Sign in, then return to this exact link. Signing in alone does not record a contribution or move money.</p></div><Link to="/signin" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#3a7a1f] px-5 text-sm font-semibold text-white">Sign in to SecurePay</Link></section>}

            <p className="mt-6 text-xs leading-5 text-black/40">This page is read-only. Opening it does not join the group, record a contribution, approve a decision, or move money.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
