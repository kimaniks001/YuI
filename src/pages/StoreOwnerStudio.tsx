import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Activity, Eye, Package, Plus, RefreshCw, Save, Sparkles, Store, Wrench } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { useMarketAtmosphere } from '../lib/marketAtmosphere';
import { confirmMyStoreOfferAvailability, createMyStoreOffer, getMyStoreProfile, listMyStoreOffers, updateMyStoreOffer, updateMyStoreProfile } from '../api/storeEndpoints';
import type { PublicStoreAvailabilityState, PublicStoreOfferKind, StoreOffer, StoreProfile, UpdateStoreProfileRequest, UpsertStoreOfferRequest } from '../api/storeTypes';

type StoreHealth = { label: 'Current' | 'Check-in due' | 'Needs attention' | 'Resting'; note: string; ageDays: number | null; tone: 'good' | 'watch' | 'attention' | 'resting' };
type StoreView = 'overview' | 'offers' | 'profile';
const PRODUCT_STATES: PublicStoreAvailabilityState[] = ['AVAILABLE', 'LOW_AVAILABILITY', 'NEEDS_CONFIRMATION', 'UNAVAILABLE', 'PAUSED'];
const SERVICE_STATES: PublicStoreAvailabilityState[] = ['TAKING_WORK', 'LIMITED', 'NEEDS_CONFIRMATION', 'FULLY_BOOKED', 'RESTING', 'PAUSED'];
const RESTING_STATES: PublicStoreAvailabilityState[] = ['RESTING', 'PAUSED', 'UNAVAILABLE', 'FULLY_BOOKED'];
const blankOffer = (): UpsertStoreOfferRequest => ({ kind: 'PRODUCT', title: '', description: null, priceMinor: null, quantityAvailable: null, availabilityState: 'AVAILABLE', published: false });

function daysSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
}
function deriveStoreHealth(profile: StoreProfile | null, offers: StoreOffer[]): StoreHealth {
  const published = offers.filter(offer => offer.published);
  if (published.length > 0 && published.every(offer => RESTING_STATES.includes(offer.availabilityState))) return { label: 'Resting', note: 'Your public offers are intentionally not taking new trade.', ageDays: null, tone: 'resting' };
  const ages = [daysSince(profile?.updatedAt), ...published.map(offer => daysSince(offer.availabilityConfirmedAt))].filter((age): age is number => age !== null);
  if (!ages.length) return { label: 'Needs attention', note: 'Confirm your Store information.', ageDays: null, tone: 'attention' };
  const oldestAge = Math.max(...ages);
  if (oldestAge <= 7) return { label: 'Current', note: 'Your public Store was checked recently.', ageDays: oldestAge, tone: 'good' };
  if (oldestAge <= 21) return { label: 'Check-in due', note: 'A quick check-in will keep your Store current.', ageDays: oldestAge, tone: 'watch' };
  return { label: 'Needs attention', note: 'Some public information has not been confirmed recently.', ageDays: oldestAge, tone: 'attention' };
}
function displayState(value: PublicStoreAvailabilityState) { return value.replace(/_/g, ' ').toLowerCase().replace(/^./, char => char.toUpperCase()); }
function formatPriceMinor(value: number | null) { return value === null ? 'Price not listed' : new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(value / 100); }
function toOfferRequest(offer: StoreOffer): UpsertStoreOfferRequest { return { kind: offer.kind, title: offer.title, description: offer.description, priceMinor: offer.priceMinor, quantityAvailable: offer.quantityAvailable, availabilityState: offer.availabilityState, published: offer.published }; }
function interpretStoreWords(text: string): UpsertStoreOfferRequest | null {
  const words = text.trim(); if (!words) return null;
  const lower = words.toLowerCase();
  const kind: PublicStoreOfferKind = /service|repair|install|consult|design|build|paint|plumb|work/.test(lower) ? 'SERVICE' : 'PRODUCT';
  const priceMatch = words.match(/(?:KES|Kshs?|price\s*(?:is|at)?|at)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const qtyMatch = words.match(/(?:qty|quantity|stock|have)\s*(?:of\s*)?(\d+)/i);
  const parsedPrice = priceMatch ? Math.round(Number(priceMatch[1].replace(/,/g, '')) * 100) : null;
  const title = words.replace(/^\s*(?:add|list|offer|sell|provide|i\s+(?:sell|offer|provide))\s+/i, '').replace(/(?:for|at|price\s*(?:is|at)?)\s*(?:KES|Kshs?)?\s*[\d,]+(?:\.\d{1,2})?.*$/i, '').trim();
  if (!title) return null;
  return { kind, title: title.slice(0, 160), description: null, priceMinor: parsedPrice !== null && Number.isFinite(parsedPrice) ? parsedPrice : null, quantityAvailable: kind === 'PRODUCT' && qtyMatch ? Number(qtyMatch[1]) : null, availabilityState: kind === 'SERVICE' ? 'TAKING_WORK' : 'AVAILABLE', published: false };
}

export default function StoreOwnerStudio() {
  const { user, session } = useAuth();
  const { theme, setTheme, themes } = useMarketAtmosphere();
  const [view, setView] = useState<StoreView>('overview');
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
    const [profileResult, offersResult] = await Promise.all([getMyStoreProfile(session.accessToken), listMyStoreOffers(session.accessToken)]);
    if (!profileResult.ok || !profileResult.data) { setError(profileResult.error || 'Your Store profile could not be loaded.'); setLoading(false); return; }
    if (!offersResult.ok || !offersResult.data) { setError(offersResult.error || 'Your Store offers could not be loaded.'); setLoading(false); return; }
    setProfile(profileResult.data); setProfileDraft({ tagline: profileResult.data.tagline, about: profileResult.data.about, locationLabel: profileResult.data.locationLabel }); setOffers(offersResult.data); setLoading(false);
  }, [session?.accessToken]);
  useEffect(() => { void load(); }, [load]);
  const health = useMemo(() => deriveStoreHealth(profile, offers), [profile, offers]);
  if (!user || !session) return <Navigate to="/signin" replace />;

  const saveProfile = async () => {
    setSavingProfile(true); setNotice(null);
    const result = await updateMyStoreProfile(session.accessToken, profileDraft); setSavingProfile(false);
    if (!result.ok || !result.data) { setNotice(result.error || 'Your Store profile was not changed.'); return; }
    setProfile(result.data); setProfileDraft({ tagline: result.data.tagline, about: result.data.about, locationLabel: result.data.locationLabel }); setNotice('Store profile saved.');
  };
  const saveOffer = async () => {
    if (!offerDraft.title.trim()) { setNotice('Give this product or service a clear name first.'); return; }
    setSavingOffer(true); setNotice(null);
    const request = { ...offerDraft, title: offerDraft.title.trim(), description: offerDraft.description?.trim() || null };
    const result = editingOfferId ? await updateMyStoreOffer(session.accessToken, editingOfferId, request) : await createMyStoreOffer(session.accessToken, request); setSavingOffer(false);
    if (!result.ok || !result.data) { setNotice(result.error || 'This Store offer was not saved.'); return; }
    setOffers(current => editingOfferId ? current.map(offer => offer.id === editingOfferId ? result.data! : offer) : [result.data!, ...current]); setEditingOfferId(null); setOfferDraft(blankOffer()); setQuickWords(''); setNotice('Store offer saved.');
  };
  const beginEdit = (offer: StoreOffer) => { setView('offers'); setEditingOfferId(offer.id); setOfferDraft(toOfferRequest(offer)); setQuickWords(''); };
  const interpretWords = () => { const interpreted = interpretStoreWords(quickWords); if (!interpreted) { setNotice('Try something like “Add cement at KES 850, stock 20”.'); return; } setEditingOfferId(null); setOfferDraft(interpreted); setNotice('Drafted below. Review before saving.'); };
  const confirmOne = async (offer: StoreOffer) => { const result = await confirmMyStoreOfferAvailability(session.accessToken, offer.id); if (!result.ok || !result.data) { setNotice(result.error || 'Availability was not confirmed.'); return; } setOffers(current => current.map(item => item.id === offer.id ? result.data! : item)); setNotice(`${offer.title} availability confirmed.`); };
  const checkIn = async () => {
    const candidates = offers.filter(offer => offer.published); if (!candidates.length) { setNotice('Publish at least one offer before checking in.'); return; }
    setCheckingIn(true); setNotice(null); const refreshed: StoreOffer[] = [];
    for (const offer of candidates) { const result = await confirmMyStoreOfferAvailability(session.accessToken, offer.id); if (!result.ok || !result.data) { setCheckingIn(false); setNotice(result.error || `Could not confirm ${offer.title}.`); return; } refreshed.push(result.data); }
    setOffers(current => current.map(offer => refreshed.find(item => item.id === offer.id) ?? offer)); setCheckingIn(false); setNotice('Public offer availability checked in.');
  };

  const states = offerDraft.kind === 'PRODUCT' ? PRODUCT_STATES : SERVICE_STATES;
  const publicKs = user.ksNumber?.trim().toUpperCase();
  const publishedCount = offers.filter(offer => offer.published).length;

  return <TraderShell>
    <TraderPageHeader eyebrow="My KS Store" title={<>Your Store <span className="text-green-700">today</span></>} description="Keep what customers see current." aside={publicKs ? <Link to={`/ks/${encodeURIComponent(publicKs)}`} className="sp-btn-secondary inline-flex min-h-10 items-center gap-2 px-4 text-sm"><Eye size={15} /> Customer view</Link> : undefined} />
    {loading && <TraderLoadingState label="Opening your Store…" />}
    {error && <TraderErrorState title="Your Store could not be opened" detail={error} onRetry={() => void load()} />}

    {!loading && !error && <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Store workspace">
        {(['overview','offers','profile'] as const).map(item => <button key={item} type="button" role="tab" aria-selected={view === item} onClick={() => setView(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold capitalize ${view === item ? 'bg-green-700 text-white' : 'border border-green-700/10 bg-white text-ink/60'}`}>{item}{item === 'offers' ? ` · ${offers.length}` : ''}</button>)}
      </div>

      {view === 'overview' && <>
        <section className="trader-home-situation">
          <div className="trader-home-situation-copy"><p className="trader-home-kicker">Store health</p><h2>{health.label}</h2><p className="mt-1 text-sm text-ink/52">{health.note}</p></div>
          <div className="trader-home-metrics"><div className={`trader-home-metric ${health.tone === 'attention' ? 'is-attention' : 'is-active'}`}><span>Health</span><strong><Activity size={17} /></strong></div><div className="trader-home-metric"><span>Offers</span><strong>{offers.length}</strong></div><div className="trader-home-metric"><span>Public</span><strong>{publishedCount}</strong></div></div>
        </section>
        <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setView('offers')} className="market-link-card text-left"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Products & services</p><h2 className="mt-1 font-display text-2xl">Update what you offer</h2></div><span className="text-sm font-semibold text-green-700">Open offers →</span></button><button type="button" onClick={() => setView('profile')} className="market-link-card text-left"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Store profile</p><h2 className="mt-1 font-display text-2xl">Update how you appear</h2></div><span className="text-sm font-semibold text-green-700">Open profile →</span></button></div>
        <button type="button" onClick={() => void checkIn()} disabled={checkingIn} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#173b20] px-4 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={15} /> {checkingIn ? 'Checking…' : 'Check in public offers'}</button>
        <details className="trader-progressive"><summary>What Store Health means</summary><div className="rounded-xl border border-green-700/10 bg-white p-3 text-xs leading-5 text-ink/50">Store Health measures freshness only. It is not a trust, credit, reputation or financial-strength score.</div></details>
      </>}

      {view === 'offers' && <>
        <section className="market-section-shell">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-orange-600">Quick add</p><h2 className="market-section-title">Tell your Store what changed</h2></div>{editingOfferId && <button type="button" onClick={() => { setEditingOfferId(null); setOfferDraft(blankOffer()); }} className="text-xs font-semibold text-green-700">Cancel edit</button>}</div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={quickWords} onChange={event => setQuickWords(event.target.value)} placeholder="Add cement at KES 850, stock 20" className="min-h-11 flex-1 rounded-xl border border-ink/15 px-3 text-sm" /><button type="button" onClick={interpretWords} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173b20] px-4 text-sm font-semibold text-white"><Sparkles size={15} /> Draft</button></div>
          <details className="trader-progressive" open={Boolean(editingOfferId || offerDraft.title)}><summary>{editingOfferId ? 'Edit offer details' : 'Offer details'}</summary><div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-semibold">Type<select value={offerDraft.kind} onChange={event => { const kind = event.target.value as PublicStoreOfferKind; setOfferDraft(current => ({ ...current, kind, quantityAvailable: kind === 'SERVICE' ? null : current.quantityAvailable, availabilityState: kind === 'SERVICE' ? 'TAKING_WORK' : 'AVAILABLE' })); }} className="mt-1 min-h-10 w-full rounded-xl border border-ink/15 bg-white px-3 font-normal"><option value="PRODUCT">Product</option><option value="SERVICE">Service</option></select></label>
            <label className="text-sm font-semibold">Name<input value={offerDraft.title} onChange={event => setOfferDraft(current => ({ ...current, title: event.target.value }))} maxLength={160} className="mt-1 min-h-10 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label>
            <label className="text-sm font-semibold">Price in KES<input type="number" min="0" step="0.01" value={offerDraft.priceMinor === null ? '' : offerDraft.priceMinor / 100} onChange={event => setOfferDraft(current => ({ ...current, priceMinor: event.target.value === '' ? null : Math.round(Number(event.target.value) * 100) }))} className="mt-1 min-h-10 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label>
            {offerDraft.kind === 'PRODUCT' && <label className="text-sm font-semibold">Quantity<input type="number" min="0" value={offerDraft.quantityAvailable ?? ''} onChange={event => setOfferDraft(current => ({ ...current, quantityAvailable: event.target.value === '' ? null : Number(event.target.value) }))} className="mt-1 min-h-10 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label>}
            <label className="text-sm font-semibold">Availability<select value={offerDraft.availabilityState} onChange={event => setOfferDraft(current => ({ ...current, availabilityState: event.target.value as PublicStoreAvailabilityState }))} className="mt-1 min-h-10 w-full rounded-xl border border-ink/15 bg-white px-3 font-normal">{states.map(state => <option key={state} value={state}>{displayState(state)}</option>)}</select></label>
            <label className="flex min-h-10 items-center gap-2 rounded-xl border border-ink/10 bg-[#faf9f5] px-3 text-sm"><input type="checkbox" checked={offerDraft.published} onChange={event => setOfferDraft(current => ({ ...current, published: event.target.checked }))} /><strong>Show publicly</strong></label>
            <label className="text-sm font-semibold md:col-span-2">Description<textarea value={offerDraft.description ?? ''} onChange={event => setOfferDraft(current => ({ ...current, description: event.target.value || null }))} maxLength={4000} rows={2} className="mt-1 w-full rounded-xl border border-ink/15 p-3 font-normal" /></label>
            <button type="button" onClick={() => void saveOffer()} disabled={savingOffer} className="inline-flex min-h-10 w-max items-center gap-2 rounded-full bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50">{editingOfferId ? <Save size={14} /> : <Plus size={14} />} {savingOffer ? 'Saving…' : editingOfferId ? 'Save changes' : 'Add to Store'}</button>
          </div></details>
        </section>

        <section className="market-section-shell"><div className="mb-2 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Your display</p><h2 className="market-section-title">Products & services</h2></div><span className="text-xs text-ink/45">{offers.length}</span></div>{offers.length === 0 ? <TraderEmptyState title="Nothing saved yet" detail="Add your first product or service above." /> : <div className="grid gap-2 md:grid-cols-2">{offers.map(offer => { const Icon = offer.kind === 'PRODUCT' ? Package : Wrench; return <article key={offer.id} className="market-link-card"><div className="flex items-start gap-3"><span className="market-section-icon"><Icon size={16} /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="truncate font-semibold">{offer.title}</h3><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${offer.published ? 'bg-green-100 text-green-800' : 'bg-ink/8 text-ink/50'}`}>{offer.published ? 'PUBLIC' : 'PRIVATE'}</span></div><p className="mt-1 text-sm text-ink/52">{formatPriceMinor(offer.priceMinor)} · {displayState(offer.availabilityState)}</p></div></div><div className="flex gap-2"><button type="button" onClick={() => beginEdit(offer)} className="min-h-9 rounded-full border border-ink/12 bg-white px-3 text-xs font-semibold">Edit</button><button type="button" onClick={() => void confirmOne(offer)} className="min-h-9 rounded-full border border-green-200 bg-green-50 px-3 text-xs font-semibold text-green-800">Confirm</button></div></article>; })}</div>}</section>
      </>}

      {view === 'profile' && <>
        <section className="market-section-shell"><div className="flex items-center gap-3"><span className="market-section-icon"><Store size={17} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-green-700">Profile</p><h2 className="market-section-title">How your Store introduces you</h2></div></div><div className="mt-3 grid gap-3 md:grid-cols-2"><label className="text-sm font-semibold">Tagline<input value={profileDraft.tagline ?? ''} onChange={event => setProfileDraft(current => ({ ...current, tagline: event.target.value || null }))} maxLength={160} className="mt-1 min-h-10 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label><label className="text-sm font-semibold">Location<input value={profileDraft.locationLabel ?? ''} onChange={event => setProfileDraft(current => ({ ...current, locationLabel: event.target.value || null }))} maxLength={160} className="mt-1 min-h-10 w-full rounded-xl border border-ink/15 px-3 font-normal" /></label><label className="text-sm font-semibold md:col-span-2">About<textarea value={profileDraft.about ?? ''} onChange={event => setProfileDraft(current => ({ ...current, about: event.target.value || null }))} maxLength={4000} rows={3} className="mt-1 w-full rounded-xl border border-ink/15 p-3 font-normal" /></label></div><button type="button" onClick={() => void saveProfile()} disabled={savingProfile} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-green-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><Save size={14} /> {savingProfile ? 'Saving…' : 'Save profile'}</button></section>
        <details className="trader-progressive"><summary>Store atmosphere</summary><div><div className="grid gap-2 sm:grid-cols-2">{themes.map(item => <button key={item.id} type="button" aria-pressed={theme === item.id} onClick={() => setTheme(item.id)} className={`min-h-14 rounded-xl border p-3 text-left ${theme === item.id ? 'border-green-700 bg-green-50' : 'border-ink/10 bg-white'}`}><strong className="block text-sm">{item.name}</strong><span className="text-xs text-ink/45">{item.atmosphere}</span></button>)}</div><p className="mt-2 text-xs text-ink/45">This changes your local Studio atmosphere only.</p></div></details>
      </>}

      {notice && <div role="status" className="sticky bottom-20 z-20 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-900 shadow-sm md:bottom-4">{notice}</div>}
    </div>}
  </TraderShell>;
}
