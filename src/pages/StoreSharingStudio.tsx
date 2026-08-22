import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Package, QrCode, Share2, Wrench } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
import { useAuth } from '../lib/auth';
import { listMyStoreOffers } from '../api/storeEndpoints';
import type { StoreOffer } from '../api/storeTypes';

function formatPrice(offer: StoreOffer) {
  if (offer.priceMinor === null) return 'Price not listed';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: offer.currency, maximumFractionDigits: 2 }).format(offer.priceMinor / 100);
}

export default function StoreSharingStudio() {
  const { user, session } = useAuth();
  const [offers, setOffers] = useState<StoreOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true); setError(null);
    const result = await listMyStoreOffers(session.accessToken);
    if (!result.ok || !result.data) setError(result.error || 'Your Store offers could not be loaded.');
    else setOffers(result.data.filter(offer => offer.published));
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { void load(); }, [load]);
  if (!user || !session) return <Navigate to="/signin" replace />;
  const ks = user.ksNumber?.trim().toUpperCase();

  return <TraderShell>
    <TraderPageHeader
      eyebrow="Share what is on display"
      title="Store links & QR"
      description="Every published offer has one exact public address. Sharing that address only opens the offer — it never reserves, sells or starts payment."
      aside={<Link to="/store" className="sp-btn-secondary inline-flex min-h-11 items-center px-4 text-sm">Back to My KS Store</Link>}
    />
    {loading && <TraderLoadingState />}
    {error && <TraderErrorState title="Store sharing could not be opened" detail={error} onRetry={() => void load()} />}
    {!loading && !error && !ks && <TraderErrorState title="KS Number unavailable" detail="SecurePay did not provide a KS Number for this signed-in identity, so a public offer address cannot be formed safely." />}
    {!loading && !error && ks && <div className="space-y-5">
      <section className="rounded-[26px] border border-green-200 bg-green-50 p-5 text-sm leading-6 text-green-950">
        <div className="flex gap-3"><Share2 size={20} className="mt-0.5 shrink-0" /><div><strong>Share the offer, not a payment request.</strong><p className="mt-1 text-green-900/65">The recipient sees backend-published Store facts first. They choose whether to start a SecureLink proposal afterwards.</p></div></div>
      </section>
      {offers.length === 0 ? <section className="rounded-[28px] border border-dashed border-ink/15 bg-white p-7 text-center"><QrCode size={26} className="mx-auto text-green-700/50" /><h2 className="mt-3 font-display text-2xl">No published offers to share.</h2><p className="mt-2 text-sm text-ink/50">Publish a product or service in My KS Store first.</p><Link to="/store" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white">Open My KS Store <ArrowRight size={15} /></Link></section> : <section className="grid gap-4 md:grid-cols-2">{offers.map(offer => {
        const Icon = offer.kind === 'PRODUCT' ? Package : Wrench;
        const href = `/ks/${encodeURIComponent(ks)}/offers/${encodeURIComponent(offer.id)}`;
        return <article key={offer.id} className="rounded-[26px] border border-ink/8 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-2xl bg-green-50 text-green-700"><Icon size={18} /></span><span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-800">PUBLIC</span></div><h2 className="mt-4 font-display text-2xl">{offer.title}</h2><p className="mt-1 text-sm text-ink/50">{formatPrice(offer)}</p><Link to={href} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#173b20] px-4 text-sm font-semibold text-white"><QrCode size={15} /> Share / QR <ArrowRight size={14} /></Link></article>;
      })}</section>}
    </div>}
  </TraderShell>;
}
