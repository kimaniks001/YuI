import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, ShieldCheck, ShoppingBag, UserRound } from 'lucide-react';
import { lookupKSNumber } from '../api/securepayEndpoints';
import LoadingState from '../components/api/LoadingState';
import ErrorState from '../components/api/ErrorState';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import AccountDropdown from '../components/AccountDropdown';

type PublicIdentity = {
  ksNumber: string;
  displayName: string | null;
  identityType: string | null;
  status: string | null;
  verified: boolean | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function firstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function parsePublicIdentity(value: unknown, requestedKsNumber: string): PublicIdentity | null {
  const root = asRecord(value);
  if (!root) return null;
  const nested = asRecord(root.data) ?? root;
  const returnedKsNumber = firstString(nested, ['ksNumber', 'ks_number', 'canonicalKsNumber', 'canonical_ks_number']);
  if (!returnedKsNumber || returnedKsNumber.toUpperCase() !== requestedKsNumber.toUpperCase()) return null;

  const verifiedRaw = nested.verified ?? nested.isVerified ?? nested.is_verified;
  return {
    ksNumber: returnedKsNumber,
    displayName: firstString(nested, ['displayName', 'display_name', 'name', 'legalName', 'legal_name']),
    identityType: firstString(nested, ['identityType', 'identity_type', 'type']),
    status: firstString(nested, ['status', 'identityStatus', 'identity_status']),
    verified: typeof verifiedRaw === 'boolean' ? verifiedRaw : null,
  };
}

function readable(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace(/[_-]+/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function KSProfile() {
  const { ksId } = useParams<{ ksId?: string }>();
  const ksNumber = (ksId ?? '').trim().toUpperCase();
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<PublicIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setIdentity(null); setError(null);
    if (!ksNumber) {
      setLoading(false); setError('This KS Profile does not include a KSNumber.');
      return () => { current = false; };
    }
    setLoading(true);
    void lookupKSNumber(ksNumber).then(result => {
      if (!current) return;
      if (!result.ok || !result.data) {
        setError(result.status === 404 ? 'SecurePay could not find this KSNumber.' : (result.error ?? 'SecurePay could not confirm this KS Profile.'));
      } else {
        const parsed = parsePublicIdentity(result.data, ksNumber);
        if (parsed) setIdentity(parsed);
        else setError('SecurePay returned a profile response that this page cannot safely display yet. No identity details were inferred.');
      }
      setLoading(false);
    });
    return () => { current = false; };
  }, [ksNumber]);

  return (
    <div className="b5-ks-profile-room min-h-screen bg-[#fffdf8] text-[#1a1a1a]">
      <header className="sticky top-0 z-50 border-b border-black/7 bg-[#fffdf8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link>
          <AccountDropdown />
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-[820px]">
          {loading && <LoadingState message="Checking this KSNumber with SecurePay…" />}
          {!loading && error && <ErrorState message={error} />}

          {!loading && identity && (
            <>
              <section className="b5-profile-identity-card overflow-hidden rounded-[30px] border border-black/7 bg-white shadow-sm">
                <div className="bg-[#173b20] px-6 py-7 text-white sm:px-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/48">KS Profile</p>
                  <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10"><UserRound size={25} /></span>
                      <div>
                        <h1 className="font-display text-3xl font-semibold">{identity.displayName || 'SecurePay trader'}</h1>
                        <p className="mt-1 font-mono text-sm text-white/65">{identity.ksNumber}</p>
                      </div>
                    </div>
                    {identity.verified === true && <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold sm:self-auto"><LivingSecurePayMark state="success" size="xs" presence="polite" label="SecurePay backend confirms this identity is verified" /> Identity verified</span>}
                  </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                  <Fact icon={ShieldCheck} label="Identity in the Market" value={identity.ksNumber} />
                  <Fact icon={Building2} label="Identity type" value={readable(identity.identityType) ?? 'Not publicly provided'} />
                  <Fact icon={ShieldCheck} label="Status" value={readable(identity.status) ?? 'Not publicly provided'} />
                  <Fact icon={BadgeCheck} label="Verification" value={identity.verified === true ? 'Confirmed' : identity.verified === false ? 'Not confirmed' : 'Not publicly provided'} />
                </div>
              </section>

              <section className="mt-5 rounded-2xl border border-[#3a7a1f]/15 bg-[#edf6e8] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3a7a1f]">What this means</p>
                <h2 className="mt-2 font-display text-2xl">This is the identity SecurePay could confirm publicly.</h2>
                <p className="mt-2 text-sm leading-6 text-black/56">This page does not invent a balance, Trade Dispute Reserve, reputation score, Digital Store inventory, collections, settlement status or trading authority from browser data. Those details appear only where SecurePay has a current backend contract for them.</p>
              </section>

              <section className="b5-profile-store-unavailable">
                <div className="b5-profile-store-unavailable__head">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf6e8] text-[#3a7a1f]"><ShoppingBag size={18} /></span>
                  <div><strong>Digital Store</strong><span>What this KSNumber has on display in the Market</span></div>
                </div>
                <p>The current public KS lookup does not return a Digital Store contract, so this live profile will not invent products, services, availability or prices. When that backend surface exists, the store will sit here as part of this trader's Market address.</p>
              </section>

              <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-black/7 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div><h2 className="font-semibold">Want to trade with this KSNumber?</h2><p className="mt-1 text-sm leading-6 text-black/52">Start with an agreement. Entering a KSNumber never makes that person the payer or confirms they accepted a trade.</p></div>
                <Link to="/create" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#3a7a1f] px-5 text-sm font-bold text-white">Start an agreement<ArrowRight size={15} /></Link>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return <div className="rounded-2xl bg-[#f5f1e8] p-4"><Icon size={18} className="text-[#3a7a1f]" /><p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-black/38">{label}</p><p className="mt-1 text-sm font-semibold text-black/72">{value}</p></div>;
}
