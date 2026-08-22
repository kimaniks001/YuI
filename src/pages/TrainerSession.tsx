import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Circle, ExternalLink, GraduationCap, RotateCcw, ShieldCheck } from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import {
  readTrainerSession,
  resetTrainerSession,
  toggleTrainerStage,
  TRAINER_STAGES,
  type TrainerSessionState,
  type TrainerStageId,
} from '../lib/trainerSession';
import { marketSignInHref, saveMarketDraftIntent } from '../lib/worldMode';

const guideNotes: Record<TrainerStageId, { say: string; ask: string; truth: string }> = {
  'identity-store': {
    say: 'Your KS Number answers “who am I?” and your KS Store answers “what do I offer?”',
    ask: 'If someone says “go look at my KS”, what should they be able to understand immediately?',
    truth: 'A Store listing is discovery information. It is not reservation, sale, verification or financial strength.',
  },
  securelink: {
    say: 'Do not begin with a product name. Begin with: “What do you want the money to do?”',
    ask: 'Who is paying, who is receiving, what must happen, and what would help both sides understand completion?',
    truth: 'Creator is not automatically payer. Invitation is not acceptance. Evidence is not automatic completion.',
  },
  'group-flow': {
    say: 'When more people are involved, separate contribution, governance and distribution before discussing money movement.',
    ask: 'Is this many people funding one purpose, one person funding many obligations, or both?',
    truth: 'Organizer status does not create funding, Payment Ready, release or settlement authority.',
  },
  'evidence-recovery': {
    say: 'When people disagree, SecurePay helps them return to the agreement, the record and available next actions.',
    ask: 'What happened? What does the agreement say? What evidence is available? What can the parties do next?',
    truth: 'SecurePay is not the judge. A review, Recovery Room or Master Opinion does not become adjudication authority.',
  },
  'real-market': {
    say: 'Learning ends here. Real trade starts only after real authentication and fresh consent in the Market.',
    ask: 'Is the trader ready to turn this learning into a real proposal?',
    truth: 'Only draft intention may cross. Simulated identity, agreement, money, status and results never cross.',
  },
};

function roleLabel(role: TrainerSessionState['role']) {
  if (role === 'plug') return 'Plug / Trainer';
  if (role === 'staff') return 'SecurePay staff';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function TrainerSession() {
  const [session, setSession] = useState<TrainerSessionState>(() => readTrainerSession());
  const location = useLocation();
  const navigate = useNavigate();
  const completedCount = session.completed.length;
  const allComplete = completedCount === TRAINER_STAGES.length;

  const toggle = (stageId: TrainerStageId) => setSession(toggleTrainerStage(stageId));
  const reset = () => setSession(resetTrainerSession(session.role));
  const tryForReal = () => {
    saveMarketDraftIntent('trainer', `${location.pathname}${location.search}`, '/create');
    navigate(marketSignInHref('/create'));
  };

  return (
    <main className="min-h-screen bg-[#f7f6f2] pb-28 text-[#1a1a1a]">
      <header className="border-b border-[#e8e5dc] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/trainer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#315f1c]"><ArrowLeft size={16} /> Trainer home</Link>
          <div className="hidden items-center gap-2 text-xs text-[#1a1a1a]/48 sm:flex"><ShieldCheck size={14} /> SIMULATED · NO MARKET AUTHORITY</div>
          <button type="button" onClick={reset} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#1a1a1a]/10 px-4 text-xs font-semibold text-[#1a1a1a]/60"><RotateCcw size={14} /> Reset</button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="self-start rounded-[30px] border border-[#3a7a1f]/12 bg-[#173b20] p-5 text-white lg:sticky lg:top-6 sm:p-6">
            <div className="flex items-center gap-3"><LivingSecurePayMark state="guiding" size="md" presence="present" /><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#cfe8c3]">Guided session</p><h1 className="font-display text-3xl">Teach SecurePay end to end.</h1></div></div>
            <p className="mt-4 text-sm leading-6 text-white/65">You are presenting as <strong className="text-white">{roleLabel(session.role)}</strong>. Use each stage as a conversation, open the demo room, then mark the teaching point complete.</p>

            <div className="mt-6 rounded-2xl bg-white/8 p-4">
              <div className="flex items-center justify-between text-xs"><span>Session progress</span><strong>{completedCount}/{TRAINER_STAGES.length}</strong></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#b8df9d] transition-all" style={{ width: `${(completedCount / TRAINER_STAGES.length) * 100}%` }} /></div>
              <p className="mt-3 text-xs leading-5 text-white/55">Progress is stored only in this browser session. It creates no SecurePay record.</p>
            </div>

            <div className="mt-5 space-y-2">
              {TRAINER_STAGES.map((stage, index) => {
                const done = session.completed.includes(stage.id);
                return <a key={stage.id} href={`#trainer-stage-${stage.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-white/70 transition hover:bg-white/8 hover:text-white"><span className={`flex size-6 items-center justify-center rounded-full ${done ? 'bg-[#b8df9d] text-[#173b20]' : 'border border-white/20'}`}>{done ? <Check size={13} /> : index + 1}</span><span>{stage.title}</span></a>;
              })}
            </div>
          </aside>

          <div className="space-y-4">
            {TRAINER_STAGES.map((stage, index) => {
              const done = session.completed.includes(stage.id);
              const note = guideNotes[stage.id];
              return (
                <section id={`trainer-stage-${stage.id}`} key={stage.id} className={`scroll-mt-6 rounded-[28px] border bg-white p-5 shadow-sm sm:p-6 ${done ? 'border-[#3a7a1f]/35' : 'border-[#1a1a1a]/9'}`}>
                  <div className="flex items-start gap-4">
                    <button type="button" onClick={() => toggle(stage.id)} aria-label={done ? `Mark ${stage.title} incomplete` : `Mark ${stage.title} complete`} className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full transition ${done ? 'bg-[#3a7a1f] text-white' : 'border border-[#1a1a1a]/15 text-[#1a1a1a]/30 hover:border-[#3a7a1f]/45'}`}>{done ? <Check size={18} /> : <Circle size={17} />}</button>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#e6761e]">Stage {index + 1}</p>
                      <h2 className="mt-1 font-display text-2xl sm:text-3xl">{stage.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-[#1a1a1a]/58">{stage.teachingPoint}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#f4f8ef] p-4"><span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#3a7a1f]">Say</span><p className="mt-2 text-xs leading-5 text-[#1a1a1a]/68">“{note.say}”</p></div>
                    <div className="rounded-2xl bg-[#fff6ed] p-4"><span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#e6761e]">Ask</span><p className="mt-2 text-xs leading-5 text-[#1a1a1a]/68">{note.ask}</p></div>
                    <div className="rounded-2xl bg-[#f7f6f2] p-4"><span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]/45">Truth boundary</span><p className="mt-2 text-xs leading-5 text-[#1a1a1a]/68">{note.truth}</p></div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {stage.id === 'real-market' ? (
                      <button type="button" onClick={tryForReal} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e6761e] px-5 text-sm font-semibold text-white">Try it for real <ArrowRight size={15} /></button>
                    ) : (
                      <Link to={stage.demoPath} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#3a7a1f] px-5 text-sm font-semibold text-white">Open this demo room <ExternalLink size={15} /></Link>
                    )}
                    <button type="button" onClick={() => toggle(stage.id)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold ${done ? 'bg-[#f1f7ed] text-[#315f1c]' : 'border border-[#1a1a1a]/10 text-[#1a1a1a]/58'}`}>{done ? <><Check size={15} /> Teaching point complete</> : <>Mark complete <ArrowRight size={15} /></>}</button>
                  </div>
                </section>
              );
            })}

            <section className={`rounded-[30px] border p-5 sm:p-7 ${allComplete ? 'border-[#3a7a1f]/30 bg-[#edf6e7]' : 'border-[#1a1a1a]/10 bg-white'}`}>
              <div className="flex gap-3"><span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${allComplete ? 'bg-[#3a7a1f] text-white' : 'bg-[#f7f6f2] text-[#1a1a1a]/35'}`}><GraduationCap size={21} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#3a7a1f]">Session close</p><h2 className="mt-1 font-display text-2xl">{allComplete ? 'You can now explain the full SecurePay story.' : 'Complete all five teaching points.'}</h2><p className="mt-2 text-sm leading-6 text-[#1a1a1a]/58">The goal is not memorising screens. It is being able to explain identity, agreement, people, evidence, money state and next action without inventing authority.</p></div></div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link to="/trainer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#1a1a1a]/10 bg-white px-5 text-sm font-semibold">Choose another journey</Link><button type="button" onClick={tryForReal} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173b20] px-5 text-sm font-semibold text-white">Take the intention to Market <ArrowRight size={15} /></button></div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
