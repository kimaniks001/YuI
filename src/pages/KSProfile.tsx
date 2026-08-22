import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Wrench,
} from 'lucide-react';
import { getPublicStore } from '../api/storeEndpoints';
import type { PublicStore, PublicStoreAvailabilityState, PublicStoreOffer } from '../api/storeTypes';
import type { CreationIntent } from '../lib/creationIntent';
import LoadingState from '../components/api/LoadingState';
import ErrorState from '../components/api/ErrorState';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import AccountDropdown from '../components/AccountDropdown';

const KS_PATTERN = /^KS\d{3,}$/;

function readable(value: string): string {
  const normalized = value.replace(/[_-]+/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatPrice(offer: PublicStoreOffer): string | null {
  if (offer.priceMinor === null) return null;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: offer.currency,
    maximumFractionDigits: 2,
  }).format(offer.priceMinor / 100);
}

function formatWhen(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' }).format(parsed);
}

function availabilityMeaning(state: PublicStoreAvailabilityState): { label: string; note: string; available: boolean } {
  switch (state) {
    case 'AVAILABLE': return { label: 'Available', note: 'The trader last confirmed this as available.', available: true };
    case 'LOW_AVAILABILITY': return { label: 'Low availability', note: 'The trader reports limited product availability.', available: true };
    case 'NEEDS_CONFIRMATION': return { label: 'Needs confirmation', note: 'Availability is not current enough to present as confirmed.', available: false };
    case 'TAKING_WORK': return { label: 'Taking work', note: 'The trader is currently accepting this kind of service work.', available: true };
    case 'LIMITED': return { label: 'Limited', note: 'The trader reports limited service capacity.', available: true };
    case 'UNAVAILABLE': return { label: 'Unavailable', note: 'The trader has marked this product unavailable.', available: false };
    case 'FULLY_BOOKED': return { label: 'Fully booked', note: 'The trader is not currently taking more of this service work.', available: false };
    case 'RESTING': return { label: 'Resting', note: 'This service is temporarily resting.', available: false };
    case 'PAUSED': return { label: 'Paused', note: 'This offer is currently paused.', available: false };
  }
}

function offerIntent(store: PublicStore, offer: PublicStoreOffer): CreationIntent {
  const price = formatPrice(offer);
  return {
    id: `store-${offer.id}`,
    family: 'trade',
    statement: `I want to discuss ${offer.title} with ${store.displayName} (${store.canonicalKsNumber}).`,
    who: `You (Buyer) → ${store.displayName} (${store.canonicalKsNumber})`,
    what: offer.title,
    amount: price ?? 'Price to agree',
    mustHappen: offer.kind === 'PRODUCT'
      ? 'Agree the exact product, quantity, delivery or collection terms and evidence before funding'
      : 'Agree the exact service scope, timing, evidence and completion conditions before funding',
    nextStep: `Review the offer with ${store.displayName} and agree the trade terms`,
    nextStepShort: 'Agree the terms',
    moneyMoves: 'Only according to the agreement both parties confirm in the real Market',
  };
}

function storeIntent(store: PublicStore): CreationIntent {
  return {
    id: `store-${store.canonicalKsNumber}`,
    family: 'trade',
    statement: `I want to start a trade discussion with ${store.displayName} (${store.canonicalKsNumber}).`,
    who: `You → ${store.displayName} (${store.canonicalKsNumber})`,
    what: 'A trade to agree',
    amount: 'Amount to agree',
    mustHappen: 'Both parties agree the exact product or service, responsibilities, evidence and payment conditions',
    nextStep: `Tell SecurePay what you want to trade with ${store.displayName}`,
    nextStepShort: 'Describe the trade',
    moneyMoves: 'Only after the parties create and confirm a real agreement',
  };
}

export default function KSProfile() {
  const { ksId } = useParams<{ ksId?: string }>();
  const ksNumber = (ksId ?? '').trim().toUpperCase();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<PublicStore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setStore(null);
    setError(null);

    if (!KS_PATTERN.test(ksNumber)) {
      setLoading(false);
      setError('This Market address is not a valid canonical KS Number.');
      return () => { current = false; };
    }

    setLoading(true);
    void getPublicStore(ksNumber).then(result => {
      if (!current) return;
      if (!result.ok || !result.data) {
        setError('SecurePay could not open this public Store. The KS Number may be unavailable, inactive or not reachable right now.');
      } else if (result.data.canonicalKsNumber !== ksNumber || result.data.status !== 'ACTIVE') {
        setError('SecurePay returned Store data that does not match this active Market address. Nothing was inferred.');
      } else {
        setStore(result.data);
      }
      setLoading(false);
    });

    return () => { current = false; };
  }, [ksNumber]);

  return (
    <div className="b5-ks-profile-room min-h-screen bg-[#fffdf8] pb-24 text-[#1a1a1a]">
      <header className="sticky top-0 z-50 border-b border-black/7 bg-[#fffdf8]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="SecurePay home"><LivingSecurePayMark state="resting" size="md" presence="polite" /></Link>
          <AccountDropdown />
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-[1120px]">
          {loading && <LoadingState message="Opening this KS Store from SecurePay…" />}
          {!loading && error && <ErrorState message={error} />}

          {!loading && store && (
            <>
              <section className="overflow-hidden rounded-[32px] border border-black/7 bg-white shadow-sm">
                <div className="bg-[#173b20] px-6 py-8 text-white sm:px-8 sm:py-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/48">KS Store · Real Market</p>
                  <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-start gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10"><UserRound size={25} /></span>
                      <div>
                        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{store.displayName}</h1>
                        <p className="mt-1 font-mono text-sm text-white/65">{store.canonicalKsNumber}</p>
                        {store.profile?.tagline && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">{store.profile.tagline}</p>}
                      </div>
                    </div>
                    <span className="inline-flex self-start items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold md:self-auto">
                      <ShieldCheck size={14} /> Active KS identity
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
                  <Fact icon={ShieldCheck} label="Market address" value={store.canonicalKsNumber} />
                  <Fact icon={Building2} label="Identity type" value={readable(store.identityType)} />
                  <Fact icon={MapPin} label="Location" value={store.profile?.locationLabel ?? 'Not publicly listed'} />
                  <Fact icon={Clock} label="Store profile updated" value={formatWhen(store.profile?.updatedAt ?? null) ?? 'Not publicly provided'} />
                </div>
              </section>

              {store.profile?.about && (
                <section className="mt-5 rounded-[26px] border border-black/7 bg-white p-5 sm:p-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3a7a1f]">About this Store</p>
                  <p className="mt-3 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-black/62">{store.profile.about}</p>
                </section>
              )}

              <section className="mt-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e6761e]">On display now</p>
                    <h2 className="mt-1 font-display text-3xl">Products & services</h2>
                  </div>
                  <span className="text-xs text-black/45">Only offers this Store explicitly published are shown.</span>
                </div>

                {store.offers.length === 0 ? (
                  <div className="mt-5 rounded-[28px] border border-dashed border-black/12 bg-white p-7 text-center">
                    <ShoppingBag size={25} className="mx-auto text-[#3a7a1f]/55" />
                    <h3 className="mt-3 font-display text-2xl">Nothing is publicly on display yet.</h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-black/52">The KS identity is active, but this Store has not published products or services through the current public Store contract.</p>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {store.offers.map(offer => <OfferCard key={offer.id} store={store} offer={offer} />)}
                  </div>
                )}
              </section>

              <section className="mt-8 grid gap-4 md:grid-cols-2">
                <TruthGap title="Completed-work history" description="SecurePay's current public Store contract does not publish completed-agreement history here. This Store therefore does not invent a portfolio, rating or reputation record." />
                <TruthGap title="Gallery & media" description="The current public Store contract does not publish Store images or video. No browser-supplied gallery is presented as backend-authoritative Store content." />
              </section>

              <section className="mt-8 flex flex-col gap-5 rounded-[28px] border border-[#3a7a1f]/15 bg-[#edf6e8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3a7a1f]">Want to trade with this Store?</p>
                  <h2 className="mt-1 font-display text-2xl">Start with a proposal, not a payment.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/56">Opening this Store has not reserved anything and has not created a sale. Start an agreement to define what you want, who is responsible and what should happen before money moves.</p>
                </div>
                <Link
                  to="/create"
                  state={{ intent: storeIntent(store) }}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#3a7a1f] px-5 text-sm font-bold text-white"
                >
                  Start a proposal <ArrowRight size={15} />
                </Link>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return <div className="rounded-2xl bg-[#f5f1e8] p-4"><Icon size={18} className="text-[#3a7a1f]" /><p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-black/38">{label}</p><p className="mt-1 text-sm font-semibold text-black/72">{value}</p></div>;
}

function OfferCard({ store, offer }: { store: PublicStore; offer: PublicStoreOffer }) {
  const availability = availabilityMeaning(offer.availabilityState);
  const price = formatPrice(offer);
  const confirmed = formatWhen(offer.availabilityConfirmedAt);
  const Icon = offer.kind === 'PRODUCT' ? Package : Wrench;

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-black/8 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf6e8] text-[#3a7a1f]"><Icon size={20} /></span>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${availability.available ? 'bg-[#edf6e8] text-[#315f1c]' : 'bg-[#f5f1e8] text-black/55'}`}>{availability.label}</span>
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e6761e]">{readable(offer.kind)}</p>
      <h3 className="mt-1 font-display text-2xl">{offer.title}</h3>
      {offer.description && <p className="mt-2 text-sm leading-6 text-black/55">{offer.description}</p>}
      <div className="mt-4 grid gap-2 rounded-2xl bg-[#faf9f5] p-4 text-xs text-black/58">
        <div className="flex items-center justify-between gap-3"><span>Listed price</span><strong className="text-black/75">{price ?? 'Ask the trader'}</strong></div>
        {offer.kind === 'PRODUCT' && offer.quantityAvailable !== null && <div className="flex items-center justify-between gap-3"><span>Quantity shown</span><strong className="text-black/75">{offer.quantityAvailable}</strong></div>}
        <div><span>{availability.note}</span>{confirmed && <span className="mt-1 block text-black/42">Availability last confirmed {confirmed}.</span>}</div>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-black/42">Listed ≠ reserved ≠ sold. Availability may change before an agreement is confirmed.</p>
      <Link
        to="/create"
        state={{ intent: offerIntent(store, offer) }}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173b20] px-4 text-sm font-semibold text-white"
      >
        Discuss this offer <ArrowRight size={14} />
      </Link>
    </article>
  );
}

function TruthGap({ title, description }: { title: string; description: string }) {
  return <div className="rounded-[24px] border border-black/7 bg-[#f7f6f2] p-5"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/38">Not published by current Store API</p><h3 className="mt-2 font-display text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-black/52">{description}</p></div>;
}
