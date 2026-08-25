import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Copy, MapPin, Package, ShieldCheck, ShoppingBag, Sparkles, Wrench } from 'lucide-react';
import { getPublicStore } from '../api/storeEndpoints';
import type { PublicStore, PublicStoreAvailabilityState, PublicStoreOffer, StorefrontPreset, StorefrontTheme } from '../api/storeTypes';
import { saveCreationIntent, type CreationIntent } from '../lib/creationIntent';
import LoadingState from '../components/api/LoadingState';
import ErrorState from '../components/api/ErrorState';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import AccountDropdown from '../components/AccountDropdown';
import '../ks-store-premium.css';

const KS_PATTERN = /^KS\d{3,}$/;

function readable(value: string): string {
  const normalized = value.replace(/[_-]+/g, ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatPrice(offer: PublicStoreOffer): string | null {
  if (offer.priceMinor === null) return null;
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: offer.currency, maximumFractionDigits: 2 }).format(offer.priceMinor / 100);
}

function availabilityMeaning(state: PublicStoreAvailabilityState): { label: string; available: boolean } {
  switch (state) {
    case 'AVAILABLE': return { label: 'Available', available: true };
    case 'LOW_AVAILABILITY': return { label: 'Low availability', available: true };
    case 'TAKING_WORK': return { label: 'Taking work', available: true };
    case 'LIMITED': return { label: 'Limited capacity', available: true };
    case 'NEEDS_CONFIRMATION': return { label: 'Confirm availability', available: false };
    case 'UNAVAILABLE': return { label: 'Unavailable', available: false };
    case 'FULLY_BOOKED': return { label: 'Fully booked', available: false };
    case 'RESTING': return { label: 'Resting', available: false };
    case 'PAUSED': return { label: 'Paused', available: false };
  }
}

function offerIntent(store: PublicStore, offer: PublicStoreOffer): CreationIntent {
  const price = formatPrice(offer);
  const isProduct = offer.kind === 'PRODUCT';
  return {
    id: `store-${offer.id}`,
    family: 'trade',
    statement: isProduct
      ? `I want to buy ${offer.title} from ${store.displayName} (${store.canonicalKsNumber})${price ? ` for ${price}` : ''}.`
      : `I want ${store.displayName} (${store.canonicalKsNumber}) to provide ${offer.title}${price ? ` for ${price}` : ''}.`,
    who: `You → ${store.displayName} (${store.canonicalKsNumber})`,
    what: offer.title,
    amount: price ?? 'Price to agree',
    mustHappen: isProduct
      ? 'Agree the exact item, quantity or condition where relevant, and the delivery or collection handover.'
      : 'Agree the exact service scope, timing and what will show the work is complete.',
    nextStep: `Agree the trade terms with ${store.displayName}.`,
    nextStepShort: isProduct ? 'Agree item & handover' : 'Agree scope & completion',
    moneyMoves: 'Only according to the agreement both parties confirm in SecurePay.',
  };
}

function storeIntent(store: PublicStore): CreationIntent {
  return {
    id: `store-${store.canonicalKsNumber}`,
    family: 'trade',
    statement: `I want to trade with ${store.displayName} (${store.canonicalKsNumber}).`,
    who: `You → ${store.displayName} (${store.canonicalKsNumber})`,
    what: 'A trade to agree',
    amount: 'Amount to agree',
    mustHappen: 'Both parties agree what is being provided and what completion or handover means.',
    nextStep: `Tell SecurePay what you want from ${store.displayName}.`,
    nextStepShort: 'Describe the trade',
    moneyMoves: 'Only according to the agreement both parties confirm in SecurePay.',
  };
}

function presetClass(preset?: StorefrontPreset) { return `ks-store-preset-${(preset ?? 'SIGNATURE').toLowerCase()}`; }
function themeClass(theme?: StorefrontTheme) { return `ks-store-theme-${(theme ?? 'FOREST').toLowerCase()}`; }

export default function KSProfile() {
  const { ksId } = useParams<{ ksId?: string }>();
  const ksNumber = (ksId ?? '').trim().toUpperCase();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<PublicStore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let current = true;
    setStore(null); setError(null);
    if (!KS_PATTERN.test(ksNumber)) {
      setLoading(false); setError('This Store address is not a valid KSNumber.');
      return () => { current = false; };
    }
    setLoading(true);
    void getPublicStore(ksNumber).then(result => {
      if (!current) return;
      if (!result.ok || !result.data) setError('SecurePay could not open this Store. The KSNumber may be inactive or unavailable right now.');
      else if (result.data.canonicalKsNumber !== ksNumber || result.data.status !== 'ACTIVE') setError('SecurePay could not confirm this active Store address.');
      else setStore(result.data);
      setLoading(false);
    });
    return () => { current = false; };
  }, [ksNumber]);

  const copyAddress = async () => {
    if (!store) return;
    try {
      await navigator.clipboard.writeText(`https://securepay.ke/${store.canonicalKsNumber}`);
      setCopied(true); window.setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  return <div className={`ks-store-premium ${themeClass(store?.profile?.storefrontTheme)} ${presetClass(store?.profile?.storefrontPreset)}`}>
    <header className="ks-store-topbar"><div className="ks-store-topbar-inner">
      <Link to="/" aria-label="SecurePay home" className="flex items-center gap-2"><LivingSecurePayMark state="resting" size="sm" presence="polite" /><span className="ks-store-powered"><span>Store powered by</span> <strong>SecurePay</strong></span></Link>
      <AccountDropdown />
    </div></header>
    <main className="ks-store-wrap">
      {loading && <LoadingState message="Opening this KS Store…" />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && store && <Storefront store={store} copied={copied} onCopy={copyAddress} />}
    </main>
  </div>;
}

function Storefront({ store, copied, onCopy }: { store: PublicStore; copied: boolean; onCopy: () => void }) {
  const profile = store.profile;
  const headline = profile?.heroHeadline || profile?.tagline || `Trade with ${store.displayName}, clearly.`;
  const initials = store.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'KS';
  const address = `securepay.ke/${store.canonicalKsNumber}`;
  const mainIntent = storeIntent(store);

  return <>
    <section className="ks-store-hero"><div className="ks-store-hero-inner">
      <div>
        <button type="button" className="ks-store-address" onClick={onCopy} aria-label={`Copy ${address}`}>{copied ? <Check size={13} /> : <Copy size={13} />} {address}</button>
        <h1 className="ks-store-title">{store.displayName}</h1>
        <p className="ks-store-headline">{headline}</p>
        {profile?.tagline && profile.tagline !== headline && <p className="ks-store-tagline">{profile.tagline}</p>}
        <div className="ks-store-actions">
          {store.offers.length > 0 && <a href="#store-offers" className="ks-store-primary"><ShoppingBag size={16} /> Explore the Store</a>}
          <Link to="/create/journey" state={{ intent: mainIntent }} onClick={() => saveCreationIntent(mainIntent)} className="ks-store-secondary">Start an agreement <ArrowRight size={15} /></Link>
        </div>
      </div>
      <aside className="ks-store-hero-aside"><div className="ks-store-brand-card">
        <span className="ks-store-brand-mark" aria-hidden="true">{initials}</span>
        <p>Public business home for <strong>{store.canonicalKsNumber}</strong>. Products and services shown here are published by this KS identity.</p>
        <div className="ks-store-location"><MapPin size={14} /> {profile?.locationLabel || 'Location available from the trader'}</div>
      </div></aside>
    </div></section>

    <section className="ks-store-trust" aria-label="Store identity and trade context">
      <TrustItem icon={<ShieldCheck size={16} />} label="SecurePay identity" value={`${store.canonicalKsNumber} · Active`} />
      <TrustItem icon={<Sparkles size={16} />} label="Business type" value={readable(store.identityType)} />
      <TrustItem icon={<Check size={16} />} label="How trade starts" value="Agree first, then let money follow" />
    </section>

    <section className="ks-store-section" id="store-offers">
      <div className="ks-store-section-head"><div><p className="ks-store-kicker">Shop · Services · Work</p><h2>What’s on offer</h2></div><p>Only offers this KS Store has chosen to publish appear here. Opening an offer does not reserve it or move money.</p></div>
      <div className="ks-store-offer-grid">
        {store.offers.length === 0 ? <div className="ks-store-empty"><ShoppingBag size={25} className="mx-auto mb-3" /><strong>Nothing is publicly on display yet.</strong><p className="mt-2 text-sm">This Store is active and can add products or services from its owner Studio.</p></div> : store.offers.map(offer => <OfferCard key={offer.id} store={store} offer={offer} />)}
      </div>
    </section>

    <section className="ks-store-section"><div className="ks-store-story">
      <div className="ks-store-story-main"><p className="ks-store-kicker">The business</p><h2>About {store.displayName}</h2><p>{profile?.about || `${store.displayName} has not added a public business story yet. Ask the trader what they do and how they work.`}</p></div>
      <aside className="ks-store-story-side"><p className="ks-store-kicker">The SecurePay difference</p><h3>Turn interest into a clear agreement.</h3><p>Products and services can lead into SecurePay’s agreement journey, where both sides can clarify what is expected before money follows the agreement.</p><p><strong>Listed ≠ reserved ≠ sold.</strong> The real agreement and money state remain separate from this public Store presentation.</p></aside>
    </div></section>

    <section className="ks-store-final"><div><p className="ks-store-kicker">Ready to trade?</p><h2>Tell SecurePay what you want from this Store.</h2><p>Start in your own words. SecurePay will help shape the lightest useful agreement for the trade instead of forcing every purchase or service through the same flow.</p></div><Link to="/create/journey" state={{ intent: mainIntent }} onClick={() => saveCreationIntent(mainIntent)} className="ks-store-primary">Start with {store.displayName} <ArrowRight size={15} /></Link></section>
  </>;
}

function TrustItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="ks-store-trust-item"><span className="ks-store-trust-icon" aria-hidden="true">{icon}</span><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function OfferCard({ store, offer }: { store: PublicStore; offer: PublicStoreOffer }) {
  const availability = availabilityMeaning(offer.availabilityState);
  const price = formatPrice(offer);
  const Icon = offer.kind === 'PRODUCT' ? Package : Wrench;
  const intent = offerIntent(store, offer);
  return <article className="ks-store-offer">
    <div className="ks-store-offer-top"><span className="ks-store-offer-icon"><Icon size={21} /></span><span className="ks-store-state">{availability.label}</span></div>
    <p className="ks-store-offer-kind">{readable(offer.kind)}</p><h3>{offer.title}</h3>{offer.description && <p className="ks-store-offer-description">{offer.description}</p>}
    <div className="ks-store-offer-bottom"><div className="ks-store-price"><span>Listed price</span><strong>{price ?? 'Ask the trader'}</strong></div>{availability.available ? <Link to="/create/journey" state={{ intent }} onClick={() => saveCreationIntent(intent)} className="ks-store-offer-action">{offer.kind === 'PRODUCT' ? 'Buy with an agreement' : 'Agree this service'} <ArrowRight size={13} /></Link> : <span className="text-xs font-semibold opacity-50">Ask before committing</span>}</div>
  </article>;
}
