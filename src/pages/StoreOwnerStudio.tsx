import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, CheckCircle2, Eye, Image, Package,
  Plus, RefreshCw, Save, Sparkles, Store, Wrench,
} from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { useMarketAtmosphere } from '../lib/marketAtmosphere';
import {
  confirmMyStoreOfferAvailability,
  createMyStoreOffer,
  getMyStoreProfile,
  listMyStoreOffers,
  updateMyStoreOffer,
  updateMyStoreProfile,
} from '../api/storeEndpoints';
import type {
  PublicStoreAvailabilityState,
  PublicStoreOfferKind,
  StoreOffer,
  StoreProfile,
  UpdateStoreProfileRequest,
  UpsertStoreOfferRequest,
} from '../api/storeTypes';

type StoreHealth = {
  label: 'Current' | 'Check-in due' | 'Needs attention' | 'Resting';
  note: string;
  ageDays: number | null;
  tone: 'good' | 'watch' | 'attention' | 'resting';
};

const PRODUCT_STATES: PublicStoreAvailabilityState[] = [
  'AVAILABLE', 'LOW_AVAILABILITY', 'NEEDS_CONFIRMATION', 'UNAVAILABLE', 'PAUSED',
];
const SERVICE_STATES: PublicStoreAvailabilityState[] = [
  'TAKING_WORK', 'LIMITED', 'NEEDS_CONFIRMATION', 'FULLY_BOOKED', 'RESTING', 'PAUSED',
];
const RESTING_STATES: PublicStoreAvailabilityState[] = ['RESTING', 'PAUSED', 'UNAVAILABLE', 'FULLY_BOOKED'];

const blankOffer = (): UpsertStoreOfferRequest => ({
  kind: 'PRODUCT', title: '', description: null, priceMinor: null,
  quantityAvailable: null, availabilityState: 'AVAILABLE', published: false,
});

function daysSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}

function deriveStoreHealth(profile: StoreProfile | null, offers: StoreOffer[]): StoreHealth {
  const published = offers.filter(offer => offer.published);
  if (published.length > 0 && published.every(offer => RESTING_STATES.includes(offer.availabilityState))) {
    return { label: 'Resting', note: 'Your public offers are intentionally not taking new trade right now.', ageDays: null, tone: 'resting' };
  }
  const ages = [daysSince(profile?.updatedAt), ...published.map(offer => daysSince(offer.availabilityConfirmedAt))]
    .filter((age): age is number => age !== null);
  if (!ages.length) return { label: 'Needs attention', note: 'Confirm your profile and offer availability so visitors know what is current.', ageDays: null, tone: 'attention' };
  const oldestAge = Math.max(...ages);
  if (oldestAge <= 7) return { label: 'Current', note: 'Your public Store information has been checked recently.', ageDays: oldestAge, tone: 'good' };
  if (oldestAge <= 21) return { label: 'Check-in due', note: 'A quick Store check-in will keep your public information fresh.', ageDays: oldestAge, tone: 'watch' };
  return { label: 'Needs attention', note: 'One or more public Store details have not been confirmed recently.', ageDays: oldestAge, tone: 'attention' };
}

function displayState(value: PublicStoreAvailabilityState) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/^./, char => char.toUpperCase());
}

function formatPriceMinor(value: number | null) {
  if (value === null) return 'Price not listed';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(value / 100);
}

function toOfferRequest(offer: StoreOffer): UpsertStoreOfferRequest {
  return {
    kind: offer.kind, title: offer.title, description: offer.description,
    priceMinor: offer.priceMinor, quantityAvailable: offer.quantityAvailable,
    availabilityState: offer.availabilityState, published: offer.published,
  };
}

function interpretStoreWords(text: string): UpsertStoreOfferRequest | null {
  const words = text.trim();
  if (!words) return null;
  const lower = words.toLowerCase();
  const kind: PublicStoreOfferKind = /service|repair|install|consult|design|build|paint|plumb|work/.test(lower) ? 'SERVICE' : 'PRODUCT';
  const priceMatch = words.match(/(?:KES|Kshs?|price\s*(?:is|at)?|at)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const qtyMatch = words.match(/(?:qty|quantity|stock|have)\s*(?:of\s*)?(\d+)/i);
  const parsedPrice = priceMatch ? Math.round(Number(priceMatch[1].replace(/,/g, '')) * 100) : null;
  const title = words
    .replace(/^\s*(?:add|list|offer|sell|provide|i\s+(?:sell|offer|provide))\s+/i, '')
    .replace(/(?:for|at|price\s*(?:is|at)?)\s*(?:KES|Kshs?)?\s*[\d,]+(?:\.\d{1,2})?.*$/i, '')
    .trim();
  if (!title) return null;
  return {
    kind,
    title: title.slice(0, 160),
    description: null,
    priceMinor: parsedPrice !== null && Number.isFinite(parsedPrice) ? parsedPrice : null,
    quantityAvailable: kind === 'PRODUCT' && qtyMatch ? Number(qtyMatch[1]) : null,
    availabilityState: kind === 'SERVICE' ? 'TAKING_WORK' : 'AVAILABLE',
    published: false,
  };
}

export default function StoreOwnerStudio() {
  const { user, session } = useAuth();
  const { theme, setTheme, themes } = useMarketAtmosphere();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<UpdateStoreProfileRequest>({ tagline: null, about: null, locationLabel: null });
  const [offers, setOffers] = useState<StoreOffer[]>([]);
  const [offerDraft, setOfferDraft] = useState<UpsertStoreOfferRequest>(blankOffer());
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [quickWords, setQuickWords] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true); setError(null);
    const [profileResult, offersResult] = await Promise.all([
      getMyStoreProfile(session.accessToken), listMyStoreOffers(session.accessToken),
    ]);
    if (!profileResult.ok || !profileResult.data) {
      setError(profileResult.error || 'Your Store profile could not be loaded.'); setLoading(false); return;
    }
    if (!offersResult.ok || !offersResult.data) {
      setError(offersResult.error || 'Your Store offers could not be loaded.'); setLoading(false); return;
    }
    const savedProfile = profileResult.data;
    setProfile(savedProfile);
    setProfileDraft({ tagline: savedProfile.tagline, about: savedProfile.about, locationLabel: savedProfile.locationLabel });
    setOffers(offersResult.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);
  const health = useMemo(() => deriveStoreHealth(profile, offers), [profile, offers]);

  if (!user || !session) return <Navigate to="/signin" replace />;

  const saveProfile = async () => {
    setSavingProfile(true); setNotice(null);
    const result = await updateMyStoreProfile(session.accessToken, profileDraft);
    setSavingProfile(false);
    if (!result.ok || !result.data) { setNotice(result.error || 'Your Store profile was not changed.'); return; }
    const saved = result.data;
    setProfile(saved);
    setProfileDraft({ tagline: saved.tagline, about: saved.about, locationLabel: saved.locationLabel });
    setNotice('Store profile saved.');
  };

  const saveOffer = async () => {
    if (!offerDraft.title.trim()) { setNotice('Give this product or service a clear name first.'); return; }
    setSavingOffer(true); setNotice(null);
    const request = { ...offerDraft, title: offerDraft.title.trim(), description: offerDraft.description?.trim() || null };
    const result = editingOfferId
      ? await updateMyStoreOffer(session.accessToken, editingOfferId, request)
      : await createMyStoreOffer(session.accessToken, request);
    setSavingOffer(false);
    if (!result.ok || !result.data) { setNotice(result.error || 'This Store offer was not saved.'); return; }
    const saved = result.data;
    setOffers(current => editingOfferId ? current.map(offer => offer.id === editingOfferId ? saved : offer) : [saved, ...current]);
    setEditingOfferId(null); setOfferDraft(blankOffer()); setQuickWords(''); setNotice('Store offer saved.');
  };

  const beginEdit = (offer: StoreOffer) => {
    setEditingOfferId(offer.id); setOfferDraft(toOfferRequest(offer)); setQuickWords('');
    document.getElementById('store-offer-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const interpretWords = () => {
    const interpreted = interpretStoreWords(quickWords);
    if (!interpreted) { setNotice('I could not turn those words into a Store offer yet. Try: “Add cement at KES 850, stock 20”.'); return; }
    setEditingOfferId(null); setOfferDraft(interpreted);
    setNotice('I drafted the offer below. Review it before saving — nothing has been published yet.');
  };

  const confirmOne = async (offer: StoreOffer) => {
    const result = await confirmMyStoreOfferAvailability(session.accessToken, offer.id);
    if (!result.ok || !result.data) { setNotice(result.error || 'Availability was not confirmed.'); return; }
    const saved = result.data;
    setOffers(current => current.map(item => item.id === offer.id ? saved : item));
    setNotice(`${offer.title} availability confirmed.`);
  };

  const checkIn = async () => {
    const candidates = offers.filter(offer => offer.published);
    if (!candidates.length) { setNotice('Publish at least one offer before doing a public Store check-in.'); return; }
    setCheckingIn(true); setNotice(null);
    const refreshed: StoreOffer[] = [];
    for (const offer of candidates) {
      const result = await confirmMyStoreOfferAvailability(session.accessToken, offer.id);
      if (!result.ok || !result.data) {
        setCheckingIn(false); setNotice(result.error || `Could not confirm ${offer.title}. Nothing was inferred.`); return;
      }
      refreshed.push(result.data);
    }
    setOffers(current => current.map(offer => refreshed.find(item => item.id === offer.id) ?? offer));
    setCheckingIn(false);
    setNotice('Public offer availability checked in. This confirms your current Store statement; it does not reserve or sell anything.');
  };

  const states = offerDraft.kind === 'PRODUCT' ? PRODUCT_STATES : SERVICE_STATES;
  const publicKs = user.ksNumber?.trim().toUpperCase();

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Your Market address"
      title="My KS Store"
      description="Keep what customers see current. Store content can describe what you offer; it never creates a sale, reservation, agreement, Payment Ready or settlement authority."
      aside={publicKs ? <Link to={`/ks/${encodeURIComponent(publicKs)}`} className="sp-btn-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm"><Eye size={16} /> Customer view</Link> : undefined}
    />

    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Your Store could not be opened" detail={error} onRetry={() => void load()} />}

    {!loading && !error && <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className={`rounded-[26px] border p-5 shadow-sm ${health.tone === 'attention' ? 'border-amber-200 bg-amber-50' : health.tone === 'watch' ? 'border-orange-200 bg-orange-50' : health.tone === 'resting' ? 'border-ink/10 bg-[#f5f1e8]' : 'border-green-200 bg-green-50'}`}>
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">Store Health · maintenance only</p><h2 className="mt-2 font-display text-3xl">{health.label}</h2></div><span className="flex size-11 items-center justify-center rounded-2xl bg-white/70 text-green-800"><Activity size={21} /></span></div>
          <p className="mt-3 text-sm leading-6 text-ink/60">{health.note}</p>
          {health.ageDays !== null && <p className="mt-2 text-xs text-ink/45">Oldest public information checked {health.ageDays === 0 ? 'today' : `${health.ageDays} day${health.ageDays === 1 ? '' : 's'} ago`}.</p>}
          <p className="mt-4 rounded-xl bg-white/65 p-3 text-xs leading-5 text-ink/55">Store Health measures freshness only. It is not a trust, credit, reputation, financial-strength or trader-ranking score.</p>
          <button type="button" onClick={() => void checkIn()} disabled={checkingIn} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#173b20] px-4 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={15} /> {checkingIn ? 'Checking…' : 'Check in public offers'}</button>
        </div>

        <div className="rounded-[26px] border border-ink/8 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Store personality</p><h2 className="mt-1 font-display text-2xl">Make maintenance feel like your space.</h2></div><Sparkles size={20} className="text-orange-600" /></div>
          <p className="mt-2 text-sm leading-6 text-ink/55">The atmosphere below is a device-local Studio preview only. SecurePayAPI does not yet persist a public Store theme, so customers are not told this mood is part of your Store.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{themes.map(item => <button key={item.id} type="button" aria-pressed={theme === item.id} onClick={() => setTheme(item.id)} className={`min-h-16 rounded-2xl border p-3 text-left ${theme === item.id ? 'border-green-700 bg-green-50' : 'border-ink/10 bg-[#faf9f5]'}`}><strong className="block text-sm">{item.name}</strong><span className="mt-1 block text-xs text-ink/48">{item.atmosphere}</span></button>)}</div>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex gap-3"><Store className="mt-0.5 text-green-700" /><div><h2 className="font-display text-2xl">How your Store introduces you</h2><p className="mt-1 text-sm text-ink/52">These fields are saved to the authenticated KS Store profile.</p></div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">Tagline<input value={profileDraft.tagline ?? ''} onChange={event => setProfileDraft(current => ({ ...current, tagline: event.target.value || null }))} maxLength={160} placeholder="What should customers remember?" className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm font-normal" /></label>
          <label className="text-sm font-semibold">Location<input value={profileDraft.locationLabel ?? ''} onChange={event => setProfileDraft(current => ({ ...current, locationLabel: event.target.value || null }))} maxLength={160} placeholder="e.g. Ruiru, Kiambu" className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-sm font-normal" /></label>
          <label className="text-sm font-semibold md:col-span-2">About your work<textarea value={profileDraft.about ?? ''} onChange={event => setProfileDraft(current => ({ ...current, about: event.target.value || null }))} maxLength={4000} rows={4} placeholder="Tell customers what you do and how you work." className="mt-2 w-full rounded-xl border border-ink/15 p-3 text-sm font-normal" /></label>
        </div>
        <button type="button" onClick={() => void saveProfile()} disabled={savingProfile} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} /> {savingProfile ? 'Saving…' : 'Save profile'}</button>
      </section>

      <section id="store-offer-editor" className="scroll-mt-24 rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">Natural-language quick add</p><h2 className="mt-1 font-display text-2xl">Tell your Store what changed.</h2><p className="mt-1 text-sm text-ink/52">SecurePay drafts the fields; you review and save them yourself.</p></div>{editingOfferId && <button type="button" onClick={() => { setEditingOfferId(null); setOfferDraft(blankOffer()); }} className="text-sm font-semibold text-green-700">Cancel edit</button>}</div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={quickWords} onChange={event => setQuickWords(event.target.value)} placeholder="Try: Add cement at KES 850, stock 20" className="min-h-12 flex-1 rounded-xl border border-ink/15 px-4 text-sm" /><button type="button" onClick={interpretWords} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#173b20] px-5 text-sm font-semibold text-white"><Sparkles size={16} /> Draft it</button></div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">Type<select value={offerDraft.kind} onChange={event => { const kind = event.target.value as PublicStoreOfferKind; setOfferDraft(current => ({ ...current, kind, quantityAvailable: kind === 'SERVICE' ? null : current.quantityAvailable, availabilityState: kind === 'SERVICE' ? 'TAKING_WORK' : 'AVAILABLE' })); }} className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 font-normal"><option value="PRODUCT">Product</option><option value="SERVICE">Service</option></select></label>
          <label className="text-sm font-semibold">Name<input value={offerDraft.title} onChange={event => setOfferDraft(current => ({ ...current, title: event.target.value }))} maxLength={160} className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label>
          <label className="text-sm font-semibold">Price in KES<input type="number" min="0" step="0.01" value={offerDraft.priceMinor === null ? '' : offerDraft.priceMinor / 100} onChange={event => setOfferDraft(current => ({ ...current, priceMinor: event.target.value === '' ? null : Math.round(Number(event.target.value) * 100) }))} className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label>
          {offerDraft.kind === 'PRODUCT' && <label className="text-sm font-semibold">Quantity available<input type="number" min="0" value={offerDraft.quantityAvailable ?? ''} onChange={event => setOfferDraft(current => ({ ...current, quantityAvailable: event.target.value === '' ? null : Number(event.target.value) }))} className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label>}
          <label className="text-sm font-semibold">Availability<select value={offerDraft.availabilityState} onChange={event => setOfferDraft(current => ({ ...current, availabilityState: event.target.value as PublicStoreAvailabilityState }))} className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 font-normal">{states.map(state => <option key={state} value={state}>{displayState(state)}</option>)}</select></label>
          <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-ink/10 bg-[#faf9f5] px-3 text-sm"><input type="checkbox" checked={offerDraft.published} onChange={event => setOfferDraft(current => ({ ...current, published: event.target.checked }))} /><span><strong>Show publicly</strong><span className="block text-xs text-ink/45">Publishing lists it; it does not reserve or sell it.</span></span></label>
          <label className="text-sm font-semibold md:col-span-2">Description<textarea value={offerDraft.description ?? ''} onChange={event => setOfferDraft(current => ({ ...current, description: event.target.value || null }))} maxLength={4000} rows={3} className="mt-2 w-full rounded-xl border border-ink/15 p-3 font-normal" /></label>
        </div>
        <button type="button" onClick={() => void saveOffer()} disabled={savingOffer} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-50">{editingOfferId ? <Save size={15} /> : <Plus size={15} />} {savingOffer ? 'Saving…' : editingOfferId ? 'Save changes' : 'Add to Store'}</button>
      </section>

      <section className="rounded-[28px] border border-ink/8 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-green-700">Your display</p><h2 className="mt-1 font-display text-2xl">Products & services</h2></div><span className="text-xs text-ink/45">{offers.length} saved</span></div>
        {offers.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-ink/15 p-6 text-center"><Package size={22} className="mx-auto text-green-700/50" /><p className="mt-2 text-sm text-ink/55">Nothing saved yet. Add your first product or service above.</p></div> : <div className="mt-5 grid gap-3 md:grid-cols-2">{offers.map(offer => {
          const Icon = offer.kind === 'PRODUCT' ? Package : Wrench;
          return <article key={offer.id} className="rounded-2xl border border-ink/8 bg-[#faf9f5] p-4"><div className="flex items-start justify-between gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-white text-green-700"><Icon size={17} /></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${offer.published ? 'bg-green-100 text-green-800' : 'bg-ink/8 text-ink/50'}`}>{offer.published ? 'PUBLIC' : 'PRIVATE'}</span></div><h3 className="mt-3 font-semibold">{offer.title}</h3><p className="mt-1 text-sm text-ink/55">{formatPriceMinor(offer.priceMinor)} · {displayState(offer.availabilityState)}</p><p className="mt-2 text-xs text-ink/42">Availability last confirmed {daysSince(offer.availabilityConfirmedAt) ?? '—'} day(s) ago.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => beginEdit(offer)} className="min-h-10 rounded-full border border-ink/12 bg-white px-4 text-xs font-semibold">Edit</button><button type="button" onClick={() => void confirmOne(offer)} className="min-h-10 rounded-full border border-green-200 bg-green-50 px-4 text-xs font-semibold text-green-800">Confirm availability</button></div></article>;
        })}</div>}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-dashed border-ink/15 bg-[#f7f6f2] p-5"><div className="flex gap-3"><Image className="text-ink/35" /><div><h2 className="font-semibold">Gallery & media</h2><p className="mt-1 text-sm leading-6 text-ink/52">SecurePayAPI does not yet expose Store media persistence. Upload controls stay disabled so a browser-only image cannot masquerade as your saved public Store.</p></div></div><div className="mt-4 inline-flex min-h-10 items-center rounded-full bg-white px-4 text-xs font-semibold text-ink/40">Backend media support required</div></div>
        <div className="rounded-[24px] border border-ink/8 bg-white p-5"><div className="flex gap-3"><AlertTriangle className="text-orange-600" /><div><h2 className="font-semibold">What Store Health does not mean</h2><p className="mt-1 text-sm leading-6 text-ink/52">Health is about whether your listing is current. It never says you are trustworthy, wealthy, verified, highly rated or financially safe.</p></div></div><div className="mt-4 flex items-center gap-2 text-xs text-ink/48"><CheckCircle2 size={14} className="text-green-700" /> Freshness can be checked. Trust must not be invented.</div></div>
      </section>

      {notice && <div role="status" className="sticky bottom-20 z-20 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 shadow-sm md:bottom-4">{notice}</div>}
    </div>}
  </TraderShell>;
}
