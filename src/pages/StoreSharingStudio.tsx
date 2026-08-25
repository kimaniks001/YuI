import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Package, QrCode, Share2, Wrench } from 'lucide-react';
import TraderShell from '../components/trader/TraderShell';
import TraderPageHeader from '../components/trader/TraderPageHeader';
import { TraderEmptyState, TraderErrorState, TraderLoadingState } from '../components/trader/TraderStates';
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
    <TraderPageHeader eyebrow="Store sharing" title={<>Share what is <span className="text-green-700">on display</span></>} description="Open a published offer and share its exact public link or QR." aside={<Link to="/store" className="sp-btn-secondary inline-flex min-h-10 items-center px-4 text-sm">My Store</Link>} />
    {loading && <TraderLoadingState label="Loading published offers…" />}
    {error && <TraderErrorState title="Store sharing could not be opened" detail={error} onRetry={() => void load()} />}
    {!loading && !error && !ks && <TraderErrorState title="KSNumber unavailable" detail="A public offer address cannot be formed yet." />}
    {!loading && !error && ks && <div className="space-y-4">
      {offers.length === 0 ? <TraderEmptyState title="Nothing published yet" detail="Publish a product or service in My KS Store first." /> : <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{offers.map(offer => {
        const Icon = offer.kind === 'PRODUCT' ? Package : Wrench;
        const href = `/ks/${encodeURIComponent(ks)}/offers/${encodeURIComponent(offer.id)}`;
        return <article key={offer.id} className="market-link-card"><div className="flex items-start gap-3"><span className="market-section-icon"><Icon size={17} /></span><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-green-700">Published</p><h2 className="mt-1 truncate font-display text-xl">{offer.title}</h2><p className="mt-1 text-sm text-ink/50">{formatPrice(offer)}</p></div></div><Link to={href} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-green-700"><QrCode size={15} /> Share / QR <ArrowRight size={14} /></Link></article>;
      })}</section>}
      <details className="trader-progressive"><summary><Share2 size={14} /> What sharing does</summary><div className="rounded-xl border border-green-700/10 bg-white p-3 text-xs leading-5 text-ink/50">Sharing opens the published offer. It does not reserve, sell, create an agreement or move money.</div></details>
    </div>}
  </TraderShell>;
}
