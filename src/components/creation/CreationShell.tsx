// ═══════════════════════════════════════════════════════════════
// CREATION SHELL — one consistent mobile-first creation shell.
// The journey should feel guided and alive, never like an exam room.
// ═══════════════════════════════════════════════════════════════

import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import LivingSecurePayMark from '../LivingSecurePayMark';
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
          {loading ? loadingLabel : nextLabel}
          {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}

function encouragementFor(current: number, total: number) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
  if (ratio < 0.25) return {
    title: 'Good start — we already have the thread.',
    body: 'There is no perfect answer. Use your normal words and SecurePay will help make the agreement clearer.',
  };
  if (ratio < 0.7) return {
    title: 'You’re doing well. Keep going one clear choice at a time.',
    body: 'SecurePay is carrying forward what you already told us, so you do not have to start over on every screen.',
  };
  return {
    title: 'Almost there — the important parts are taking shape.',
    body: 'You can still go back and change an answer before you create the agreement.',
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
  const ratio = total > 0 ? Math.max(0, Math.min(1, current / total)) : 0;
  const resolvedState = markState ?? (ratio < .18 ? 'listening' : 'guiding');
  const phaseLabel = resolvedState === 'listening' ? 'Understanding' : resolvedState === 'caution' ? 'Needs a check' : ratio > .82 ? 'Ready to review' : 'Shaping the agreement';

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

          <div className="journey-safety-line">
            <LivingSecurePayMark state="resting" size="xs" presence="polite" label="SecurePay safety reminder" />
            <span>Answering these questions does not move money. We are only shaping the agreement.</span>
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
            <div className="journey-change-note"><LivingSecurePayMark state="resting" size="xs" presence="polite" decorative /><span>You can change an answer before you create the agreement.</span></div>
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
