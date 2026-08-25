import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { useAuth } from '../lib/auth';
import { formatMinorMoney } from '../lib/formatMinorMoney';
import {
  createAgreementFundingQuote,
  createAgreementPaymentIntent,
  getAgreement,
  getAgreementFundingAuthority,
  initiatePaymentIntent,
  listAgreementFundingOptions,
  listAgreementPaymentIntents,
} from '../api/securepayEndpoints';
import type {
  SecurePayAgreement,
  SecurePayAgreementFundingAuthority,
  SecurePayAgreementFundingOption,
  SecurePayAgreementFundingRailCode,
  SecurePayAgreementPaymentIntentSummary,
  SecurePayInitiatePaymentResponse,
} from '../api/securepayTypes';

type Mood = { panel: string; accent: string; soft: string; label: string };

function moodFromAgreement(agreement: SecurePayAgreement | null): Mood {
  const text = `${agreement?.title ?? ''} ${agreement?.purpose ?? ''}`.toLowerCase();
  if (/wedding|bride|groom|harusi/.test(text)) return { panel: 'border-[#efc5d1] bg-[#fff1f5]', accent: 'text-[#a93b62]', soft: 'bg-[#f8dfe7]', label: 'Wedding' };
  if (/school|fees|tuition|student/.test(text)) return { panel: 'border-[#cbdcf4] bg-[#f0f6ff]', accent: 'text-[#355d91]', soft: 'bg-[#dce9fb]', label: 'School' };
  if (/medical|hospital|health|treatment|surgery/.test(text)) return { panel: 'border-[#efcbc2] bg-[#fff4f1]', accent: 'text-[#9d4e3e]', soft: 'bg-[#f6dfd8]', label: 'Medical' };
  if (/build|house|construction|contractor|fundi|roof|wall|foundation/.test(text)) return { panel: 'border-[#ddcfb5] bg-[#f8f2e7]', accent: 'text-[#7c5a27]', soft: 'bg-[#eadfc9]', label: 'Project' };
  return { panel: 'border-[#cfe2c2] bg-[#f3f8ef]', accent: 'text-[#315f1c]', soft: 'bg-[#e3efda]', label: 'SecureLink' };
}

function authorityMessage(authority: SecurePayAgreementFundingAuthority | null): string {
  if (!authority) return 'Checking who can fund this agreement.';
  if (authority.authorized) return 'You can fund this agreement now.';
  switch (authority.reasonCode) {
    case 'PARTICIPANT_NOT_CONFIRMED': return 'Confirm the agreement first, then funding opens.';
    case 'NOT_PAYER_FOR_AGREEMENT': return 'The payer named by the agreement needs to fund it.';
    case 'NO_MONETARY_OBLIGATION': return 'The agreement does not yet have a funding obligation.';
    case 'OBLIGATION_NOT_AVAILABLE': return 'The funding obligation is not available yet.';
    case 'IDENTITY_INACTIVE': return 'Your SecurePay identity needs to be active before funding.';
    default: return 'Funding is not available for this participant yet.';
  }
}

function railIcon(rail: SecurePayAgreementFundingRailCode) {
  return rail === 'MPESA_STK' ? <Smartphone size={19} /> : <Banknote size={19} />;
}

export default function AgreementFundingStart() {
  const { agreementId: rawAgreementId } = useParams<{ agreementId?: string }>();
  const agreementId = rawAgreementId?.trim() ?? '';
  const location = useLocation();
  const { session } = useAuth();
  const [agreement, setAgreement] = useState<SecurePayAgreement | null>(null);
  const [authority, setAuthority] = useState<SecurePayAgreementFundingAuthority | null>(null);
  const [options, setOptions] = useState<SecurePayAgreementFundingOption[]>([]);
  const [intents, setIntents] = useState<SecurePayAgreementPaymentIntentSummary[]>([]);
  const [selectedRail, setSelectedRail] = useState<SecurePayAgreementFundingRailCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initiated, setInitiated] = useState<SecurePayInitiatePaymentResponse | null>(null);

  const load = useCallback(async () => {
    if (!agreementId || !session?.accessToken) return;
    setLoading(true); setError(null);
    const [agreementResult, authorityResult, optionResult, intentResult] = await Promise.all([
      getAgreement(agreementId, session.accessToken),
      getAgreementFundingAuthority(agreementId, session.accessToken),
      listAgreementFundingOptions(agreementId, session.accessToken),
      listAgreementPaymentIntents(agreementId, session.accessToken),
    ]);
    if (agreementResult.ok && agreementResult.data) setAgreement(agreementResult.data);
    if (authorityResult.ok && authorityResult.data) setAuthority(authorityResult.data);
    if (optionResult.ok && optionResult.data) {
      setOptions(optionResult.data.items);
      setSelectedRail((current) => current ?? optionResult.data!.items[0]?.railCode ?? null);
    }
    if (intentResult.ok && intentResult.data) setIntents(intentResult.data.items);
    if (!agreementResult.ok) setError(agreementResult.error ?? 'SecurePay could not open this agreement.');
    setLoading(false);
  }, [agreementId, session?.accessToken]);

  useEffect(() => { void load(); }, [load]);

  const selectedOption = options.find((option) => option.railCode === selectedRail) ?? null;
  const latestIntent = intents[0] ?? null;
  const mood = useMemo(() => moodFromAgreement(agreement), [agreement]);
  const justCreated = Boolean((location.state as { justCreated?: boolean } | null)?.justCreated);

  const fund = async () => {
    if (!agreementId || !session?.accessToken || !selectedOption || busy || !authority?.authorized) return;
    setBusy(true); setError(null); setInitiated(null);
    try {
      let paymentIntentId = latestIntent?.status === 'CREATED' ? latestIntent.paymentIntentId : null;
      if (!paymentIntentId) {
        const created = await createAgreementPaymentIntent(agreementId, { idempotencyKey: crypto.randomUUID() }, session.accessToken);
        if (!created.ok || !created.data) { setError(created.error ?? 'SecurePay could not prepare this payment.'); return; }
        paymentIntentId = created.data.paymentIntentId;
      }

      let quoteReference: string | undefined;
      if (selectedOption.quoteAvailable) {
        const quote = await createAgreementFundingQuote(agreementId, { railCode: selectedOption.railCode }, session.accessToken);
        if (!quote.ok || !quote.data) { setError(quote.error ?? 'SecurePay could not get the current rail quote.'); return; }
        quoteReference = quote.data.quoteReference;
      }

      const result = await initiatePaymentIntent(paymentIntentId, {
        idempotencyKey: crypto.randomUUID(),
        providerIdentifier: selectedOption.railCode,
        quoteReference,
      }, session.accessToken);

      if (!result.ok || !result.data) { setError(result.error ?? 'SecurePay could not start this payment.'); return; }
      setInitiated(result.data);
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!agreementId) return null;

  return (
    <div className="min-h-screen bg-[#fffdf8] text-[#1a1a1a]">
      <header className="border-b border-[#1a1a1a]/8 bg-[#fffdf8]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between"><Link to={`/agreements/${agreementId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#173d27]"><ArrowLeft size={15} /> Agreement</Link><div className="inline-flex items-center gap-2"><LivingSecurePayMark state="guiding" size="sm" presence="polite" /><span className="font-display text-lg font-medium text-[#173d27]">SecurePay</span></div></div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:py-10">
        <section className="rounded-[28px] border border-[#1a1a1a]/9 bg-white p-5 shadow-[0_10px_35px_rgba(25,45,30,0.05)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#315f1c]">Money</p>
          <h1 className="mt-3 font-display text-[38px] font-medium leading-[1.02] text-[#173d27] sm:text-[48px]">Fund this SecureLink</h1>
          <p className="mt-2 text-sm text-[#1a1a1a]/48">{justCreated ? 'The agreement is set. Money comes next.' : 'Choose an available funding method.'}</p>

          {loading ? <div className="mt-8 flex items-center gap-2 text-sm text-[#1a1a1a]/45"><Loader2 size={17} className="animate-spin" /> Checking funding…</div> : <>
            {agreement?.proposedAmountMinor && <div className="mt-7"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1a1a1a]/35">Amount to fund</span><div className="mt-1 text-4xl font-semibold tracking-tight text-[#173d27]">{formatMinorMoney(agreement.proposedAmountMinor, agreement.currency ?? 'KES')}</div></div>}

            {!authority?.authorized ? <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm font-semibold text-amber-900">{authorityMessage(authority)}</p><Link to={`/agreements/${agreementId}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-800">Open agreement <ArrowRight size={15} /></Link></div> : <>
              <div className="mt-7"><p className="mb-3 text-sm font-semibold text-[#173d27]">How do you want to fund it?</p><div className="grid gap-3 sm:grid-cols-2">{options.map((option) => <button key={option.railCode} type="button" onClick={() => setSelectedRail(option.railCode)} className={`rounded-2xl border-2 p-4 text-left transition ${selectedRail === option.railCode ? 'border-[#315f1c] bg-[#f3f8ef]' : 'border-[#1a1a1a]/9 bg-white'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-full ${selectedRail === option.railCode ? 'bg-[#315f1c] text-white' : 'bg-[#1a1a1a]/6 text-[#1a1a1a]/50'}`}>{railIcon(option.railCode)}</span><strong className="mt-3 block text-sm text-[#173d27]">{option.displayName}</strong>{option.quoteAvailable && <span className="mt-1 block text-xs text-[#1a1a1a]/42">Current rail quote checked before you continue</span>}</button>)}</div></div>
              {options.length === 0 && <div className="mt-6 rounded-xl bg-[#f6f7f3] px-4 py-3 text-sm text-[#1a1a1a]/55">No funding method is currently available for this agreement.</div>}
              {selectedOption && <button type="button" onClick={() => void fund()} disabled={busy} className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173d27] px-5 text-sm font-semibold text-white disabled:opacity-45">{busy ? <><Loader2 size={16} className="animate-spin" /> Starting payment…</> : <>Continue with {selectedOption.displayName} <ArrowRight size={16} /></>}</button>}
            </>}

            {initiated && <div className="mt-6 rounded-2xl border border-[#cfe2c2] bg-[#f3f8ef] p-4"><div className="flex items-start gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#315f1c] text-white"><CheckCircle2 size={17} /></span><div><p className="text-sm font-semibold text-[#173d27]">Payment started</p><p className="mt-1 text-xs leading-5 text-[#1a1a1a]/50">SecurePay is waiting for the payment provider to confirm what happened. This screen does not mark the agreement funded by itself.</p></div></div></div>}
            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          </>}
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className={`overflow-hidden rounded-[28px] border ${mood.panel} shadow-[0_16px_40px_rgba(30,40,30,0.06)]`}><div className="p-6"><div className="flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${mood.soft} ${mood.accent}`}>{mood.label}</span><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/30">SecureLink</span></div><h2 className="mt-5 font-display text-3xl font-medium leading-[1.05] text-[#263529]">{agreement?.title ?? 'Your agreement'}</h2><p className="mt-3 text-sm leading-5 text-[#1a1a1a]/55">{agreement?.purpose}</p>{agreement?.publicReference && <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-4"><span className="text-[10px] font-bold uppercase tracking-wider text-[#1a1a1a]/35">Reference</span><strong className="mt-1 block text-sm text-[#263529]">{agreement.publicReference}</strong></div>}<p className="mt-5 border-t border-[#1a1a1a]/8 pt-4 font-display text-lg italic text-[#263529]/75">Money should follow the agreement.</p></div></div>
        </aside>
      </main>
    </div>
  );
}
