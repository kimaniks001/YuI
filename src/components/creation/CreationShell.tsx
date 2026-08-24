// ═══════════════════════════════════════════════════════════════
// CREATION SHELL — one consistent mobile-first creation shell.
// The journey should feel guided and alive, never like an exam room.
// ═══════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import LivingSecurePayMark from '../LivingSecurePayMark';
import { loadCreationIntent } from '../../lib/creationIntent';
import { MemoryBar } from './QuestionComponents';

export function CompactProgress({ current, total }: { current: number; total: number }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-1" aria-label={`Journey progress ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-200 ${
            i < current ? 'w-5 bg-[#3a7a1f]' : i === current ? 'w-7 bg-[#3a7a1f]/60' : 'w-3 bg-[#1a1a1a]/10'
          }`}
        />
      ))}
    </div>
  );
}

export function CreationHeader({
  current,
  total,
  onBack,
  showProgress = true,
  markState = 'guiding',
  phaseLabel,
}: {
  current: number;
  total: number;
  onBack?: () => void;
  showProgress?: boolean;
  markState?: 'resting' | 'listening' | 'guiding' | 'caution' | 'review' | 'complete';
  phaseLabel?: string;
}) {
  return (
    <header className="journey-room-header sticky top-0 z-30 border-b border-[#dfe9d8]/80 bg-[#fffdf8]/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Link to="/" aria-label="SecurePay home" className="sp-living-mark-link">
            <LivingSecurePayMark state={markState} size="sm" presence={markState === 'caution' ? 'commanding' : 'polite'} />
          </Link>
          {onBack && (
            <button type="button" onClick={onBack} className="flex h-8 items-center gap-1.5 rounded-full border border-[#3a7a1f]/10 bg-white/80 px-2.5 text-xs font-medium text-[#1a1a1a]/48 transition-colors hover:bg-[#f0f7eb] hover:text-[#3a7a1f]" aria-label="Go back">
              <ArrowLeft size={15} /> Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">{phaseLabel && <span className="journey-phase-label">{phaseLabel}</span>}{showProgress && <CompactProgress current={current} total={total} />}</div>
      </div>
    </header>
  );
}

export function CreationBottomAction({
  onNext,
  nextLabel = 'Next',
  onBack,
  nextDisabled,
  loading,
  loadingLabel = 'Creating…',
}: {
  onNext: () => void;
  nextLabel?: string;
  onBack?: () => void;
  nextDisabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}) {
  const visibleNextLabel = nextLabel === 'Create agreement' ? 'Yes, create this agreement' : nextLabel;

  return (
    <div className="journey-bottom-action fixed bottom-0 left-0 right-0 z-30 border-t border-[#dfe9d8]/80 bg-white/92 px-4 py-2.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="rounded-xl px-3 py-3 text-sm font-medium text-[#1a1a1a]/50 transition-colors hover:text-[#1a1a1a]/80 disabled:opacity-40"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className="journey-primary-action flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3a7a1f] py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#2d6018] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? loadingLabel : visibleNextLabel}
          {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}

function encouragementFor(current: number, total: number) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
  if (current <= 1 && total > 1) return {
    title: 'This is what I get right now.',
    body: 'I’ll carry what you said forward. I only need a few more answers so we can lock in a clear agreement before anything is created.',
  };
  if (ratio < 0.7) return {
    title: 'I’m carrying your answers forward.',
    body: 'We are building the agreement one clear detail at a time. You do not need to repeat what you already told SecurePay.',
  };
  if (current < total) return {
    title: 'We’re nearly ready to check the whole agreement.',
    body: 'A few final details remain. You can still go back and change any answer before anything is created.',
  };
  return {
    title: 'This is the agreement I have from everything you told me.',
    body: 'Read it once from top to bottom. If it matches what you mean, confirm it below. Nothing is created until you do.',
  };
}

export function CreationShell({
  current,
  total,
  onBack,
  showProgress = true,
  showMemory = false,
  memoryWhat,
  memoryAmount,
  memoryWho,
  memoryExpanded,
  onMemoryToggle,
  children,
  bottomAction,
  markState,
}: {
  current: number;
  total: number;
  onBack?: () => void;
  showProgress?: boolean;
  showMemory?: boolean;
  memoryWhat?: string;
  memoryAmount?: string;
  memoryWho?: string;
  memoryExpanded?: boolean;
  onMemoryToggle?: () => void;
  children: React.ReactNode;
  bottomAction?: React.ReactNode;
  markState?: 'resting' | 'listening' | 'guiding' | 'caution' | 'review' | 'complete';
}) {
  const encouragement = encouragementFor(current, total);
  const isOpeningStep = current <= 1 && total > 1;
  const isFinalStep = total > 0 && current >= total;
  const resolvedState = markState ?? (isOpeningStep ? 'listening' : 'guiding');
  const phaseLabel = resolvedState === 'caution'
    ? 'Needs a check'
    : isOpeningStep
      ? 'What I heard'
      : isFinalStep
        ? 'Final check'
        : 'Shaping the agreement';

  // Creation intent contains only proposed, human-entered journey context.
  // Reading it here is for conversational continuity only; it never grants
  // payer, participant, funding, release, settlement or other backend authority.
  const rememberedIntent = loadCreationIntent();
  const showOpeningEcho = isOpeningStep && Boolean(rememberedIntent?.statement?.trim());
  const showFinalEcho = isFinalStep && Boolean(rememberedIntent?.statement?.trim());

  return (
    <div className="journey-room-shell min-h-screen bg-[#fffdf8] flex flex-col">
      <div className="journey-wall-mark journey-wall-mark-a" aria-hidden="true" />
      <div className="journey-wall-mark journey-wall-mark-b" aria-hidden="true" />
      <div className="journey-wall-trail" aria-hidden="true"><span /><span /></div>
      <div className="journey-guidelight journey-guidelight-a" aria-hidden="true"><LivingSecurePayMark state="guiding" size="sm" presence="polite" decorative /></div>
      <div className="journey-guidelight journey-guidelight-b" aria-hidden="true"><LivingSecurePayMark state="waiting" size="xs" presence="polite" decorative /></div>

      <CreationHeader current={current} total={total} onBack={onBack} showProgress={showProgress} markState={resolvedState} phaseLabel={phaseLabel} />
      <main className="relative z-[1] flex-1 px-4 py-4 pb-24 sm:py-7">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="journey-cheer-card">
            <LivingSecurePayMark state={resolvedState} size="sm" presence="present" className="journey-cheer-mark" label={`SecurePay: ${phaseLabel}`} />
            <div className="min-w-0 flex-1">
              <p className="journey-cheer-title">{encouragement.title}</p>
              <p className="journey-cheer-copy">{encouragement.body}</p>
            </div>
          </div>

          {(showOpeningEcho || showFinalEcho) && rememberedIntent && (
            <section className="rounded-2xl border border-[#3a7a1f]/12 bg-[#f4f8ef] p-4 shadow-sm" aria-label={showFinalEcho ? 'Original agreement request' : 'What you told SecurePay'}>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3a7a1f]">
                {showFinalEcho ? 'You started by saying' : 'You said'}
              </p>
              <p className="mt-2 text-[15px] font-medium leading-6 text-[#1a1a1a]/80">“{rememberedIntent.statement.trim()}”</p>

              <div className="mt-4 rounded-xl border border-[#3a7a1f]/10 bg-white/75 px-3.5 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/40">
                  {showFinalEcho ? 'What the agreement now says' : 'This is what I get right now'}
                </p>
                <dl className="mt-2 divide-y divide-[#1a1a1a]/5 text-sm">
                  <div className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-[#1a1a1a]/45">What</dt>
                    <dd className="text-right font-semibold text-[#1a1a1a]/75">{rememberedIntent.what}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-[#1a1a1a]/45">Amount</dt>
                    <dd className="text-right font-semibold text-[#3a7a1f]">{rememberedIntent.amount}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-[#1a1a1a]/45">Who</dt>
                    <dd className="text-right font-semibold text-[#1a1a1a]/75">{rememberedIntent.who}</dd>
                  </div>
                  {rememberedIntent.mustHappen && (
                    <div className="flex items-start justify-between gap-4 py-2">
                      <dt className="text-[#1a1a1a]/45">What must happen</dt>
                      <dd className="max-w-[68%] text-right font-medium text-[#1a1a1a]/65">{rememberedIntent.mustHappen}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <p className="mt-3 border-t border-[#3a7a1f]/10 pt-3 text-xs leading-5 text-[#1a1a1a]/55">
                {showFinalEcho
                  ? 'Is this correct? Compare your original words with the full agreement below. If something is wrong, go back and change it before creating anything.'
                  : 'Now I need to ask you a few more questions so we can lock in the people, responsibilities and conditions. I will keep carrying these details forward.'}
              </p>
            </section>
          )}

          <div className="journey-safety-line">
            <LivingSecurePayMark state="resting" size="xs" presence="polite" label="SecurePay safety reminder" />
            <span>{isFinalStep ? 'Nothing is created until you confirm the final agreement below.' : 'Answering these questions does not move money. We are only shaping the agreement.'}</span>
          </div>

          {showMemory && memoryWhat && memoryAmount && memoryWho && onMemoryToggle && (
            <MemoryBar
              what={memoryWhat}
              amount={memoryAmount}
              who={memoryWho}
              expanded={memoryExpanded ?? false}
              onToggle={onMemoryToggle}
            />
          )}

          <div className="journey-question-room" data-journey-state={resolvedState}>
            <div className="journey-change-note"><LivingSecurePayMark state="resting" size="xs" presence="polite" decorative /><span>{isFinalStep ? 'Is this correct? Go back if you need to change anything.' : 'You can change an answer before you create the agreement.'}</span></div>
            {children}
          </div>
        </div>
      </main>
      {bottomAction}
    </div>
  );
}

export function QuestionTitle({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="journey-question-title space-y-1">
      {icon && <div className="flex items-center gap-2 text-[#3a7a1f]">{icon}</div>}
      <h1 className="font-display text-2xl font-medium leading-tight text-[#1a1a1a]">{title}</h1>
      {subtitle && <p className="text-sm leading-5 text-[#1a1a1a]/52">{subtitle}</p>}
    </div>
  );
}
