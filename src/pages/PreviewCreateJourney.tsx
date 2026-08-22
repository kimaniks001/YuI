import { useMemo, useState } from 'react';
import { Check, User, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CompactReview,
  CreationBottomAction,
  CreationShell,
  KsnInput,
  QuestionTitle,
} from '../components/creation';
import { createInitialFacts } from '../lib/creationFacts';
import type { CreationIntent } from '../lib/creationIntent';

const defaultIntent: CreationIntent = {
  id: 'hire',
  family: 'trade',
  statement: 'I need a painter for KES 60,000, paid in 2 stages.',
  who: 'You (Payer) → Painter (Worker)',
  what: 'House painting contract',
  amount: 'KES 60,000 · 2 stages',
  mustHappen: 'Preparation complete → final work complete',
  nextStep: 'Stage 1 after preparation, Stage 2 after completion',
  nextStepShort: 'Add the painter',
  moneyMoves: 'After each agreed stage is confirmed',
};

type Step = 0 | 1 | 2 | 3;

export default function PreviewCreateJourney() {
  const location = useLocation();
  const navigate = useNavigate();
  const routedIntent = (location.state as { intent?: CreationIntent } | null)?.intent;
  const intent = routedIntent ?? defaultIntent;
  const [step, setStep] = useState<Step>(0);
  const [payer, setPayer] = useState<boolean | null>(true);
  const [ksNumber, setKsNumber] = useState('KS4821');
  const facts = useMemo(() => {
    const initial = createInitialFacts(intent);
    initial.payerIsCreator = { ...initial.payerIsCreator, value: payer, origin: payer !== null ? 'confirmed' : 'understood' };
    initial.counterpartyKs = { ...initial.counterpartyKs, value: ksNumber, origin: ksNumber.trim() ? 'confirmed' : 'understood' };
    return initial;
  }, [payer, ksNumber, intent]);

  const back = () => {
    if (step > 0) setStep((step - 1) as Step);
    else navigate('/preview/home');
  };
  const next = () => setStep(Math.min(3, step + 1) as Step);

  return (
    <div className="relative">
      <div className="fixed right-3 top-14 z-50 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-800 shadow-sm">Preview · no backend writes</div>
      <CreationShell
        current={step}
        total={4}
        onBack={back}
        showMemory={step > 0 && step < 3}
        memoryWhat={intent.what}
        memoryAmount={intent.amount}
        memoryWho={intent.who}
        memoryExpanded={false}
        onMemoryToggle={() => {}}
        bottomAction={step < 3 ? <CreationBottomAction onNext={next} onBack={back} nextDisabled={step === 1 && payer === null} /> : undefined}
      >
        {step === 0 && <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#3a7a1f]">SecurePay understood</p>
          <h1 className="font-display text-2xl font-medium leading-tight text-[#1a1a1a]">{intent.what}</h1>
          <div className="rounded-xl border border-[#1a1a1a]/8 bg-white p-4 shadow-sm">
            <div className="flex items-baseline justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Amount</span><span className="text-lg font-bold text-[#3a7a1f]">{intent.amount}</span></div>
            <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-[#1a1a1a]/5 pt-3"><span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">What must happen</span><span className="text-right text-sm text-[#1a1a1a]/70">{intent.mustHappen}</span></div>
            <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-[#1a1a1a]/5 pt-3"><span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Who</span><span className="text-right text-sm text-[#1a1a1a]/70">{intent.who}</span></div>
          </div>
          <p className="text-center text-sm text-[#1a1a1a]/55">Is this right?</p>
        </div>}

        {step === 1 && <div className="space-y-4">
          <QuestionTitle title="Are you the one paying?" subtitle="This helps SecurePay understand your role." />
          {[{ value: true, title: "Yes, I'm paying", detail: 'I am the payer' }, { value: false, title: 'No, someone else is paying', detail: 'I am setting this up' }].map(option => (
            <button key={String(option.value)} type="button" onClick={() => setPayer(option.value)} className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition ${payer === option.value ? 'border-[#3a7a1f] bg-[#f0f7eb]' : 'border-[#1a1a1a]/10 bg-white'}`}>
              <span className={`flex size-9 items-center justify-center rounded-full ${payer === option.value ? 'bg-[#3a7a1f] text-white' : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/40'}`}><Check size={18} /></span>
              <span className="text-left"><span className="block text-sm font-medium">{option.title}</span><span className="mt-0.5 block text-xs text-[#1a1a1a]/45">{option.detail}</span></span>
            </button>
          ))}
        </div>}

        {step === 2 && <div className="space-y-4">
          <QuestionTitle icon={<User size={20} />} title="Who are you working with?" subtitle="Enter the painter's KSNumber. In the real journey you can also invite them later." />
          <KsnInput value={ksNumber} onChange={setKsNumber} label="Painter's KSNumber" />
          <div className="rounded-xl bg-[#f7f4ec] p-3 text-xs leading-5 text-[#1a1a1a]/55"><Users size={14} className="mr-1 inline text-[#3a7a1f]" /> Adding a KSNumber is an invitation. Participation is confirmed only by the backend.</div>
        </div>}

        {step === 3 && <div className="space-y-3">
          <QuestionTitle title="Your agreement is ready" />
          <CompactReview facts={facts} submitError={null} />
          <div className="space-y-2 pt-2">
            <button type="button" onClick={() => navigate('/preview/workspace')} className="w-full rounded-xl bg-[#3a7a1f] py-3 text-sm font-semibold text-white">Create agreement preview</button>
            <Link to="/review" className="block w-full rounded-xl border border-[#1a1a1a]/12 py-3 text-center text-sm font-medium text-[#1a1a1a]/70">Back to visual review</Link>
          </div>
          <p className="text-center text-[11px] leading-5 text-[#1a1a1a]/35">Preview only. This continues to a fixture-backed agreement workspace and does not write to the backend.</p>
        </div>}
      </CreationShell>
    </div>
  );
}
