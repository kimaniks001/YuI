import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Copy, ExternalLink, MessageCircle,
  Package, Printer, Share2, ShieldCheck, Wrench,
} from 'lucide-react';
import { getPublicStoreOffer } from '../api/storeEndpoints';
import type { PublicStoreOfferDetail, PublicStoreAvailabilityState } from '../api/storeTypes';
import type { CreationIntent } from '../lib/creationIntent';
import LocalQrCode from '../components/LocalQrCode';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import LoadingState from '../components/api/LoadingState';
import ErrorState from '../components/api/ErrorState';
import AccountDropdown from '../components/AccountDropdown';

const KS_PATTERN = /^KS\d{3,}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatPrice(detail: PublicStoreOfferDetail) {
  const value = detail.offer.priceMinor;
  if (value === null) return null;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency', currency: detail.offer.currency, maximumFractionDigits: 2,
  }).format(value / 100);
}

function readableState(state: PublicStoreAvailabilityState) {
  return state.replace(/_/g, ' ').toLowerCase().replace(/^./, value => value.toUpperCase());
}

function availableForNewTrade(state: PublicStoreAvailabilityState) {
  return ['AVAILABLE', 'LOW_AVAILABILITY', 'TAKING_WORK', 'LIMITED'].includes(state);
}

function offerIntent(detail: PublicStoreOfferDetail): CreationIntent {
  const price = formatPrice(detail);
  return {
    id: `store-offer-${detail.offer.id}`,
    family: 'trade',
    statement: `I want to discuss ${detail.offer.title} with ${detail.displayName} (${detail.canonicalKsNumber})${price ? ` at the listed price of ${price}` : ''}.`,
    who: `You (proposed buyer/payer role to confirm) → ${detail.displayName} (${detail.canonicalKsNumber}) (proposed seller/recipient role to confirm)`,
    what: detail.offer.title,
    amount: price ?? 'Price to agree',
    mustHappen: detail.offer.kind === 'PRODUCT'
      ? 'Confirm the exact item, quantity, delivery or collection terms, evidence and participant roles before funding'
      : 'Confirm the exact service scope, timing, completion evidence and participant roles before funding',
    nextStep: `Create a proposal with ${detail.canonicalKsNumber} and let both parties confirm the real terms`,
    nextStepShort: 'Confirm the trade terms',
    moneyMoves: 'Only according to a real SecurePay agreement after the parties confirm the required conditions',
  };
}

export default function StoreOfferDetail() {
  const { ksId, offerId } = useParams<{ ksId?: string; offerId?: string }>();
  const ksNumber = (ksId ?? '').trim().toUpperCase();
  const id = (offerId ?? '').trim();
  const [detail, setDetail] = useState<PublicStoreOfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let current = true;
    setDetail(null); setError(null);
    if (!KS_PATTERN.test(ksNumber) || !UUID_PATTERN.test(id)) {
      setLoading(false); setError('This shared Store offer address is not valid.');
      return () => { current = false; };
    }
    setLoading(true);
    void getPublicStoreOffer(ksNumber, id).then(result => {
      if (!current) return;
      if (!result.ok || !result.data) {
        setError('SecurePay could not open this published offer. It may be unavailable, unpublished or no longer reachable.');
      } else if (
        result.data.canonicalKsNumber !== ksNumber ||
        result.data.offer.id !== id ||
        result.data.status !== 'ACTIVE'
      ) {
        setError('SecurePay returned offer data that does not match this Market address. Nothing was inferred.');
      } else {
        setDetail(result.data);
      }
      setLoading(false);
    });
    return () => { current = false; };
  }, [id, ksNumber]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/ks/${ksNumber}/offers/${id}`;
    return new URL(`/ks/${ksNumber}/offers/${id}`, window.location.origin).toString();
  }, [id, ksNumber]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const whatsappUrl = detail
    ? `https://wa.me/?text=${encodeURIComponent(`See ${detail.offer.title} from ${detail.displayName} (${detail.canonicalKsNumber}) on SecurePay: ${shareUrl}`)}`
    : '#';

  return <div className="sp-offer-share-page min-h-screen bg-[#fffdf8] pb-20 text-[#1a1a1a]">
    <header className="sp-offer-no-print sticky top-0 z-50 border-b border-black/7 bg-[#fffdf8]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={KS_PATTERN.test(ksNumber) ? `/ks/${ksNumber}` : '/'} className="inline-flex items-center gap-2 text-sm font-semibold text-black/60"><ArrowLeft size={16} /> Store</Link>
        <LivingSecurePayMark state="resting" size="md" presence="polite" />
        <AccountDropdown />
      </div>
    </header>

    <main className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-[1040px]">
        {loading && <LoadingState message="Opening this exact Store offer from SecurePay…" />}
        {!loading && error && <ErrorState message={error} />}

        {!loading && detail && <>
          <section className="sp-offer-no-print grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[32px] border border-black/8 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#edf6e8] text-[#3a7a1f]">{detail.offer.kind === 'PRODUCT' ? <Package size={22} /> : <Wrench size={22} />}</span>
                <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${availableForNewTrade(detail.offer.availabilityState) ? 'bg-[#edf6e8] text-[#315f1c]' : 'bg-[#f5f1e8] text-black/55'}`}>{readableState(detail.offer.availabilityState)}</span>
              </div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#e6761e]">Published Store offer</p>
              <h1 className="mt-1 font-display text-4xl leading-tight sm:text-5xl">{detail.offer.title}</h1>
              <p className="mt-2 text-sm text-black/52">From <strong>{detail.displayName}</strong> · <span className="font-mono">{detail.canonicalKsNumber}</span></p>
              {detail.offer.description && <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-black/60">{detail.offer.description}</p>}

              <div className="mt-6 grid gap-3 rounded-2xl bg-[#faf9f5] p-4 sm:grid-cols-2">
                <div><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-black/38">Listed price</span><strong className="mt-1 block text-xl">{formatPrice(detail) ?? 'Ask the trader'}</strong></div>
                {detail.offer.kind === 'PRODUCT' && <div><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-black/38">Quantity shown</span><strong className="mt-1 block text-xl">{detail.offer.quantityAvailable ?? 'Not listed'}</strong></div>}
              </div>

              <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-black/58">
                <strong className="text-black/75">This link shows an offer. It has not created a trade.</strong>
                <span className="mt-1 block">Scan/open ≠ reservation ≠ sale ≠ agreement ≠ payment. Availability and participant roles must still be confirmed in the real Market.</span>
              </div>

              <Link to="/create" state={{ intent: offerIntent(detail) }} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173b20] px-5 text-sm font-bold text-white sm:w-auto">
                Start SecureLink proposal <ArrowRight size={16} />
              </Link>
            </div>

            <aside className="rounded-[32px] border border-[#3a7a1f]/15 bg-[#f4f8ef] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#315f1c]"><Share2 size={18} /><strong>Share this exact offer</strong></div>
              <p className="mt-2 text-xs leading-5 text-[#315f1c]/70">The QR is generated on this device. SecurePay does not send this URL to a third-party QR service.</p>
              <div className="mt-5 flex justify-center rounded-3xl bg-white p-4"><LocalQrCode value={shareUrl} size={230} label={`QR code for ${detail.offer.title} from ${detail.canonicalKsNumber}`} /></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <button type="button" onClick={() => void copyLink()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#3a7a1f]/20 bg-white px-4 text-sm font-semibold text-[#315f1c]">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy link'}</button>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#3a7a1f] px-4 text-sm font-semibold text-white"><MessageCircle size={15} /> WhatsApp</a>
                <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black/70"><Printer size={15} /> Print QR</button>
                <a href={shareUrl} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black/70"><ExternalLink size={15} /> Open link</a>
              </div>
            </aside>
          </section>

          <section className="store-share-print mt-8 rounded-[28px] border border-black/10 bg-white p-7 text-center">
            <div className="mx-auto flex max-w-sm flex-col items-center">
              <LivingSecurePayMark state="resting" size="md" presence="present" />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#3a7a1f]">SecurePay Store offer</p>
              <h2 className="mt-1 font-display text-3xl">{detail.offer.title}</h2>
              <p className="mt-1 text-sm text-black/55">{detail.displayName} · {detail.canonicalKsNumber}</p>
              <p className="mt-2 text-lg font-bold">{formatPrice(detail) ?? 'Price to agree'}</p>
              <div className="mt-5"><LocalQrCode value={shareUrl} size={250} /></div>
              <p className="mt-4 break-all text-[10px] leading-4 text-black/45">{shareUrl}</p>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f5f1e8] p-3 text-left text-xs leading-5 text-black/55"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#3a7a1f]" /><span>Scan to view this published offer. Scanning does not reserve, buy or pay. A real agreement must still be created and confirmed.</span></div>
            </div>
          </section>
        </>}
      </div>
    </main>
  </div>;
}
