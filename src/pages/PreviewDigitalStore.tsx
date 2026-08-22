import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Box, Check, Edit3, MapPin, Plus, Settings2, ShoppingBag, Truck, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { saveCreationIntent, type CreationIntent } from '../lib/creationIntent';

type StoreMode = 'public' | 'owner';
type OfferKind = 'product' | 'service';

type Offer = {
  id: string;
  kind: OfferKind;
  name: string;
  description: string;
  price: string;
  detail: string;
  icon: typeof ShoppingBag;
  intent: CreationIntent;
};

const offers: Offer[] = [
  {
    id: 'sofa',
    kind: 'product',
    name: '3-seater sofa set',
    description: 'Fabric sofa set prepared for Nairobi and Kiambu deliveries.',
    price: 'KES 35,000',
    detail: 'Delivery can be included in the agreement.',
    icon: ShoppingBag,
    intent: {
      id: 'store-sofa', family: 'trade',
      statement: 'I want to buy a 3-seater sofa set from Mwangaza Furnishings for KES 35,000 and arrange delivery.',
      who: 'You (Payer) → Mwangaza Furnishings (Seller)', what: '3-seater sofa purchase', amount: 'KES 35,000',
      mustHappen: 'Sofa details agreed → delivery terms agreed → agreed condition confirmed',
      nextStep: 'Confirm delivery details and seller KSNumber', nextStepShort: 'Confirm delivery',
      moneyMoves: 'Only according to the conditions the parties agree',
    },
  },
  {
    id: 'delivery',
    kind: 'service',
    name: 'Furniture delivery',
    description: 'Delivery planning for Nairobi and nearby Kiambu destinations.',
    price: 'From KES 2,500',
    detail: 'Final amount depends on the agreed route and load.',
    icon: Truck,
    intent: {
      id: 'store-delivery', family: 'trade',
      statement: 'I want Mwangaza Furnishings to arrange furniture delivery to my location, starting from KES 2,500.',
      who: 'You (Payer) → Mwangaza Furnishings (Supplier)', what: 'Furniture delivery service', amount: 'From KES 2,500',
      mustHappen: 'Pickup, destination and delivery condition agreed', nextStep: 'Confirm route and final delivery amount', nextStepShort: 'Confirm route',
      moneyMoves: 'Only according to the delivery conditions the parties agree',
    },
  },
  {
    id: 'upholstery',
    kind: 'service',
    name: 'Custom upholstery',
    description: 'Choose fabric, finish and scope before a price is agreed.',
    price: 'Agree after scope',
    detail: 'SecurePay asks for the scope before money terms are finalized.',
    icon: Wrench,
    intent: {
      id: 'store-upholstery', family: 'trade',
      statement: 'I want custom upholstery work from Mwangaza Furnishings and need to agree the scope and price first.',
      who: 'You (Payer) → Mwangaza Furnishings (Worker)', what: 'Custom upholstery work', amount: 'To be agreed',
      mustHappen: 'Fabric, dimensions, finish and completion condition agreed', nextStep: 'Describe the upholstery work', nextStepShort: 'Describe the work',
      moneyMoves: 'After the parties agree the amount and completion conditions',
    },
  },
];

export default function PreviewDigitalStore() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<StoreMode>('public');
  const [category, setCategory] = useState<'all' | OfferKind>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [addedDemo, setAddedDemo] = useState(false);

  const visibleOffers = useMemo(() => category === 'all' ? offers : offers.filter(offer => offer.kind === category), [category]);

  const beginAgreement = (offer: Offer) => {
    saveCreationIntent(offer.intent);
    navigate('/preview/create', { state: { intent: offer.intent } });
  };

  return (
    <div className="b5-store-room">
      <header className="b5-store-header">
        <div className="b5-store-header__inner">
          <Link to="/review" className="b5-door-back"><ArrowLeft size={15} /> Review room</Link>
          <LivingSecurePayMark state="resting" size="md" presence="polite" label="SecurePay Market" />
          <span className="b5-preview-pill">Preview · fixture store</span>
        </div>
      </header>

      <main className="b5-store-shell">
        <section className="b5-store-view-switch" aria-label="Digital Store view">
          <div><p className="b5-kicker">V11 · KS identity + Digital Store</p><strong>The trader's address, and what they have on display.</strong></div>
          <div className="b5-segmented"><button type="button" data-selected={mode === 'public'} onClick={() => setMode('public')}>Public view</button><button type="button" data-selected={mode === 'owner'} onClick={() => setMode('owner')}>Owner view</button></div>
        </section>

        <section className="b5-store-hero">
          <div className="b5-store-identity">
            <div className="b5-store-avatar">MF</div>
            <div>
              <div className="b5-store-title-row"><h1>Mwangaza Furnishings</h1><span><Check size={12} /> Identity fixture</span></div>
              <p className="b5-store-ks">KS7314 · Furniture & home services</p>
              <p className="b5-store-about">Sofas, upholstery and delivery arrangements. Start with what you want; SecurePay turns the trade into an agreement.</p>
              <div className="b5-store-location"><MapPin size={14} /> Nairobi · serves nearby Kiambu</div>
            </div>
          </div>
          <div className="b5-store-light"><LivingSecurePayMark state={mode === 'owner' ? 'guiding' : 'resting'} size="lg" presence="polite" decorative /><span>{mode === 'owner' ? 'SecurePay helps you keep your display clear.' : 'SecurePay is the quiet light around the trade.'}</span></div>
        </section>

        <section className="b5-store-toolbar">
          <div className="b5-segmented b5-segmented--quiet"><button type="button" data-selected={category === 'all'} onClick={() => setCategory('all')}>Everything</button><button type="button" data-selected={category === 'product'} onClick={() => setCategory('product')}>Products</button><button type="button" data-selected={category === 'service'} onClick={() => setCategory('service')}>Services</button></div>
          {mode === 'owner' && <button type="button" className="b5-owner-add" onClick={() => setAddedDemo(true)}><Plus size={15} /> Add an offer</button>}
        </section>

        {addedDemo && mode === 'owner' && <section className="b5-owner-demo-note"><LivingSecurePayMark state="success" size="sm" presence="polite" label="Offer draft created in preview" /><div><strong>New offer draft opened</strong><span>Visual preview only — this does not create Digital Store inventory in the backend.</span></div><button type="button" onClick={() => setAddedDemo(false)}>Close</button></section>}

        <section className="b5-offer-grid">
          {visibleOffers.map(offer => {
            const Icon = offer.icon;
            const isEditing = editing === offer.id && mode === 'owner';
            return <article key={offer.id} className="b5-offer-card">
              <div className="b5-offer-card__top"><span className="b5-offer-icon"><Icon size={20} /></span><span className="b5-offer-kind">{offer.kind}</span></div>
              <h2>{offer.name}</h2>
              <p>{offer.description}</p>
              <div className="b5-offer-price"><strong>{offer.price}</strong><span>{offer.detail}</span></div>
              {isEditing && <div className="b5-owner-editor"><label>Display title<input defaultValue={offer.name} /></label><label>Public price wording<input defaultValue={offer.price} /></label><p>Preview fields only. No backend writes.</p></div>}
              <div className="b5-offer-actions">
                {mode === 'public' ? <button type="button" className="b5-primary-action" onClick={() => beginAgreement(offer)}>Start an agreement <ArrowRight size={15} /></button> : <button type="button" className="b5-secondary-action" onClick={() => setEditing(isEditing ? null : offer.id)}><Edit3 size={14} /> {isEditing ? 'Close editor' : 'Edit display'}</button>}
              </div>
            </article>;
          })}
        </section>

        <section className="b5-store-law">
          <div><Box size={18} /><strong>The Store shows possibility</strong><span>Seeing an offer is not an agreement, payment request or guarantee of availability.</span></div>
          <div><Settings2 size={18} /><strong>The owner controls the display</strong><span>Products and services belong to the trader's Market presence, not to SecurePay.</span></div>
          <div><LivingSecurePayMark state="guiding" size="sm" presence="polite" decorative /><strong>The agreement carries the trade</strong><span>Choosing an offer starts intention capture. Money still follows the agreement.</span></div>
        </section>

        <p className="b5-source-note b5-source-note--center">All store inventory, availability, price wording and identity details on this page are visual fixtures. The current canonical KS Profile remains backend-limited and does not invent Digital Store data.</p>
      </main>
    </div>
  );
}
