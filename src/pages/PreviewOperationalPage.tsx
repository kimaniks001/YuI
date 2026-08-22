// ═══════════════════════════════════════════════════════════════
// PREVIEW OPERATIONAL JOURNEYS PAGE (Slice 7)
//
// Fixture-based, no-auth, no-writes preview of the full agreement
// operational lifecycle: payment, evidence, confirmation, release,
// settlement, review, held exception.
//
// Reuses real projection + fixture layers. Lets the user click
// through representative journeys.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, AlertCircle, CheckCircle2, Clock,
  Eye, ShieldAlert, ArrowLeft, Camera,
} from 'lucide-react';
import LivingSecurePayMark from '../components/LivingSecurePayMark';
import { ALL_OPERATIONAL_FIXTURES, OPERATIONAL_FIXTURE_GROUPS, getOperationalFixture } from '../lib/operationalFixtures';
import type { OperationalProjection, OperationalObligation, HumanPaymentState, HumanSettlementState } from '../lib/operationalProjection';
import { railDisplayName } from '../lib/operationalProjection';

// ─── Variant styling ────────────────────────────────────────────

function variantClasses(variant: string): { bg: string; text: string; border: string } {
  switch (variant) {
    case 'confirmed':
    case 'settled':
    case 'completed':
    case 'approved':
      return { bg: 'bg-[#f0f7eb]', text: 'text-[#3a7a1f]', border: 'border-[#3a7a1f]/20' };
    case 'pending':
    case 'requested':
    case 'processing':
    case 'in_progress':
    case 'submitted':
    case 'under_review':
    case 'available':
    case 'active':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'failed':
    case 'held':
    case 'blocked':
    case 'overdue':
    case 'rejected':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'action_required':
    case 'needs_more':
    case 'attention':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case 'expired':
    case 'cancelled':
    case 'not_started':
    case 'idle':
    case 'waiting':
      return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  }
}

function VariantIcon({ variant }: { variant: string }) {
  if (variant === 'confirmed' || variant === 'settled' || variant === 'completed' || variant === 'approved') return <CheckCircle2 size={16} />;
  if (variant === 'failed' || variant === 'held' || variant === 'blocked' || variant === 'overdue' || variant === 'rejected') return <ShieldAlert size={16} />;
  if (variant === 'action_required' || variant === 'needs_more' || variant === 'attention') return <AlertCircle size={16} />;
  return <Clock size={16} />;
}

// ─── Payment state card ─────────────────────────────────────────

function PaymentStateCard({ state, amount }: { state: HumanPaymentState; amount: string | null }) {
  const cls = variantClasses(state.variant);
  return (
    <div className={`rounded-xl border ${cls.border} ${cls.bg} px-4 py-3`}>
      <div className="flex items-start gap-2.5">
        <div className={cls.text}><VariantIcon variant={state.variant} /></div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${cls.text}`}>{state.title}</p>
          <p className="text-xs text-[#1a1a1a]/55 mt-0.5">{state.explanation}</p>
          {amount && <p className="text-xs font-mono text-[#1a1a1a]/40 mt-1">{amount}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Settlement state card ──────────────────────────────────────

function SettlementStateCard({ state }: { state: HumanSettlementState }) {
  const cls = variantClasses(state.variant);
  return (
    <div className={`rounded-xl border ${cls.border} ${cls.bg} px-4 py-3`}>
      <div className="flex items-start gap-2.5">
        <div className={cls.text}><VariantIcon variant={state.variant} /></div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${cls.text}`}>{state.title}</p>
          <p className="text-xs text-[#1a1a1a]/55 mt-0.5">{state.explanation}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Obligation card ────────────────────────────────────────────

function ObligationCard({ obligation, index }: { obligation: OperationalObligation; index: number }) {
  const cls = variantClasses(obligation.humanState.variant);
  return (
    <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs font-bold text-[#1a1a1a]/30">{index + 1}</span>
          <p className="text-sm font-medium text-[#1a1a1a]/80 truncate">{obligation.title}</p>
        </div>
        <span className={`text-xs font-medium ${cls.text} flex items-center gap-1 shrink-0`}>
          <VariantIcon variant={obligation.humanState.variant} />
          {obligation.humanState.title}
        </span>
      </div>
      <p className="text-xs text-[#1a1a1a]/45 mt-1">{obligation.humanState.explanation}</p>
      {obligation.amountDisplay && (
        <p className="text-xs font-mono text-[#1a1a1a]/40 mt-1">{obligation.amountDisplay}</p>
      )}
      {obligation.evidence.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#1a1a1a]/5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/30 mb-1">Evidence</p>
          {obligation.evidence.map(ev => (
            <div key={ev.id} className="flex items-center justify-between text-xs">
              <span className="text-[#1a1a1a]/60 flex items-center gap-1">
                <Camera size={11} /> {ev.type}
              </span>
              <span className={variantClasses(ev.humanState.variant).text}>{ev.humanState.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Action sequence card ───────────────────────────────────────

function ActionSequenceCard({ projection }: { projection: OperationalProjection }) {
  const seq = projection.activeActionSequence;
  if (!seq) {
    return (
      <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-4 py-3.5">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={20} className="text-[#3a7a1f] shrink-0" />
          <p className="text-sm text-[#1a1a1a]/60">Nothing needed from you right now.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border-2 border-[#3a7a1f]/20 bg-[#f0f7eb] px-4 py-3.5">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-[#3a7a1f]/10 text-[#3a7a1f]">
          <ArrowRight size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40">Next action</p>
          <p className="font-medium text-sm text-[#1a1a1a] mt-0.5">{seq.title}</p>
          {seq.steps.length > 1 && (
            <div className="mt-2 space-y-1">
              {seq.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    i < seq.currentStep ? 'bg-[#3a7a1f] text-white' :
                    i === seq.currentStep ? 'bg-[#3a7a1f]/20 text-[#3a7a1f]' :
                    'bg-[#1a1a1a]/8 text-[#1a1a1a]/30'
                  }`}>
                    {i < seq.currentStep ? <CheckCircle2 size={8} /> : i + 1}
                  </div>
                  <span className={i === seq.currentStep ? 'text-[#1a1a1a]/80 font-medium' : 'text-[#1a1a1a]/40'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fee summary card ───────────────────────────────────────────

function FeeSummaryCard({ projection }: { projection: OperationalProjection }) {
  const fees = projection.feeSummary;
  if (!fees) return null;
  return (
    <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-2">Payment breakdown</p>
      <div className="space-y-1.5">
        {fees.agreementAmountDisplay && (
          <div className="flex justify-between text-sm">
            <span className="text-[#1a1a1a]/50">Agreement amount</span>
            <span className="font-semibold text-[#1a1a1a]">{fees.agreementAmountDisplay}</span>
          </div>
        )}
        {fees.providerChargeDisplay && (
          <div className="flex justify-between text-sm">
            <span className="text-[#1a1a1a]/50">{railDisplayName(fees.railCode ?? '')} fee</span>
            <span className="text-[#1a1a1a]/70">{fees.providerChargeDisplay}</span>
          </div>
        )}
        {fees.platformChargeDisplay && (
          <div className="flex justify-between text-sm">
            <span className="text-[#1a1a1a]/50">SecurePay fee</span>
            <span className="text-[#1a1a1a]/70">{fees.platformChargeDisplay}</span>
          </div>
        )}
        {fees.totalChargeDisplay && (
          <div className="flex justify-between text-sm pt-1.5 border-t border-[#1a1a1a]/5">
            <span className="font-medium text-[#1a1a1a]/70">Total</span>
            <span className="font-bold text-[#1a1a1a]">{fees.totalChargeDisplay}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Funding options card ───────────────────────────────────────

function FundingOptionsCard({ projection }: { projection: OperationalProjection }) {
  if (!projection.fundingAuthority?.authorized) return null;
  const intent = projection.paymentState;
  if (!intent || intent.variant !== 'idle') return null;
  return (
    <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-2">How would you like to pay?</p>
      <p className="text-xs text-[#1a1a1a]/45 mb-3">Available payment methods will appear here from the backend.</p>
      <div className="flex gap-2">
        <button type="button" disabled className="flex-1 py-2.5 rounded-xl border border-[#3a7a1f]/20 bg-[#f0f7eb] text-[#3a7a1f] text-sm font-medium opacity-60 cursor-not-allowed">
          M-Pesa
        </button>
        <button type="button" disabled className="flex-1 py-2.5 rounded-xl border border-[#1a1a1a]/10 bg-white text-[#1a1a1a]/50 text-sm font-medium opacity-60 cursor-not-allowed">
          PesaLink
        </button>
      </div>
      <p className="text-xs text-[#1a1a1a]/30 mt-2">Preview only — no payment will be processed.</p>
    </div>
  );
}

// ─── Review case card ───────────────────────────────────────────

function ReviewCaseCard({ projection }: { projection: OperationalProjection }) {
  if (projection.reviewCases.length === 0) return null;
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-2">Agreement Review</p>
      {projection.reviewCases.map(rc => (
        <div key={rc.reviewCaseId} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-800">{rc.humanState.title}</p>
            <p className="text-xs text-orange-700/70 mt-0.5">{rc.humanState.explanation}</p>
          </div>
          {!rc.isTerminal && !rc.callerAcknowledged && (
            <span className="text-xs font-medium text-orange-700 bg-white px-2 py-1 rounded-full border border-orange-200">
              Needs your response
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main projection view ───────────────────────────────────────

function OperationalView({ projection }: { projection: OperationalProjection }) {
  const ws = projection.workspace;
  return (
    <div className="space-y-3">
      {/* Title + status */}
      <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-4 py-3.5">
        <h2 className="font-display text-lg font-medium text-[#1a1a1a] leading-tight">{ws.title}</h2>
        <p className="text-sm font-medium text-[#1a1a1a]/60 mt-0.5">{ws.humanStatus.title}</p>
        <p className="text-xs text-[#1a1a1a]/45 mt-1">{ws.humanStatus.explanation}</p>
        <p className="text-xs font-mono text-[#1a1a1a]/30 mt-2 pt-2 border-t border-[#1a1a1a]/5">{ws.publicReference}</p>
      </div>

      {/* Primary action */}
      <ActionSequenceCard projection={projection} />

      {/* Payment state */}
      {projection.paymentState && (
        <PaymentStateCard
          state={projection.paymentState}
          amount={ws.money.agreementAmountDisplay}
        />
      )}

      {/* Funding options (when idle) */}
      <FundingOptionsCard projection={projection} />

      {/* Fee summary */}
      <FeeSummaryCard projection={projection} />

      {/* Settlement state */}
      {projection.settlementState.variant !== 'idle' && (
        <SettlementStateCard state={projection.settlementState} />
      )}

      {/* Obligations */}
      {projection.obligations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 px-1">Work & payments</p>
          {projection.obligations.map((o, i) => (
            <ObligationCard key={o.id} obligation={o} index={i} />
          ))}
        </div>
      )}

      {/* Review cases */}
      <ReviewCaseCard projection={projection} />

      {/* Money context */}
      {(ws.money.expectedTotalDisplay || ws.money.contributedTotalDisplay) && (
        <div className="rounded-xl border border-[#1a1a1a]/8 bg-white px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-2">Contributions</p>
          {ws.money.expectedTotalDisplay && (
            <div className="flex justify-between text-sm">
              <span className="text-[#1a1a1a]/50">Expected</span>
              <span className="text-[#1a1a1a]/70">{ws.money.expectedTotalDisplay}</span>
            </div>
          )}
          {ws.money.contributedTotalDisplay && (
            <div className="flex justify-between text-sm">
              <span className="text-[#1a1a1a]/50">Contributed (confirmed)</span>
              <span className="font-semibold text-[#3a7a1f]">{ws.money.contributedTotalDisplay}</span>
            </div>
          )}
          <p className="text-xs text-[#1a1a1a]/35 mt-2 pt-2 border-t border-[#1a1a1a]/5">
            Expected total is a target, not money received.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────

export default function PreviewOperationalPage() {
  const [searchParams] = useSearchParams();
  const requestedFixture = searchParams.get('fixture');
  const initialFixtureId = requestedFixture && getOperationalFixture(requestedFixture) ? requestedFixture : ALL_OPERATIONAL_FIXTURES[0].id;
  const [selectedId, setSelectedId] = useState<string>(initialFixtureId);
  const fixture = getOperationalFixture(selectedId) ?? ALL_OPERATIONAL_FIXTURES[0];

  return (
    <div className="journey-operational-room min-h-screen bg-[#fffdf8] flex flex-col">
      <header className="flex items-center justify-between px-4 h-14 border-b border-[#e9e7e1] sticky top-0 bg-[#fffdf8] z-10">
        <Link to="/preview/home" aria-label="SecurePay home">
          <LivingSecurePayMark state="resting" size="md" presence="polite" />
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/preview/workspace" className="text-xs text-[#1a1a1a]/40 hover:text-[#1a1a1a]/60 flex items-center gap-1">
            <ArrowLeft size={12} /> Workspace
          </Link>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            <Eye size={12} /> Preview
          </span>
        </div>
      </header>

      <div className="journey-room-affirmation mx-4 mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <strong>You do not have to remember every detail.</strong> Follow what happened, what it means, and what comes next.
      </div>

      {/* Fixture selector */}
      <div className="border-b border-[#e9e7e1] bg-white px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]/40 mb-2">
          Operational journeys — fixture-based, no backend writes
        </p>
        <div className="space-y-3">
          {OPERATIONAL_FIXTURE_GROUPS.map(group => {
            const fixtures = ALL_OPERATIONAL_FIXTURES.filter(f => f.group === group);
            return (
              <div key={group}>
                <p className="text-xs font-medium text-[#1a1a1a]/50 mb-1.5">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {fixtures.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedId(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedId === f.id
                          ? 'bg-[#3a7a1f] text-white'
                          : 'bg-[#1a1a1a]/5 text-[#1a1a1a]/60 hover:bg-[#1a1a1a]/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-[#1a1a1a]/45 italic">{fixture.description}</p>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="max-w-sm mx-auto">
          <OperationalView projection={fixture.projection} />

          <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2.5">
            <p className="text-xs text-orange-700 leading-relaxed">
              This is a preview of the agreement operational lifecycle using representative fixture data.
              No backend calls are made. No data is written. The payment, evidence, release, and settlement
              states shown here reflect what a real agreement would display given this backend state.
            </p>
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              to="/preview/workspace"
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a]/8 hover:bg-[#1a1a1a]/12 text-[#1a1a1a] font-semibold text-sm py-3 rounded-xl transition-all duration-200"
            >
              Back to workspace
            </Link>
            <Link
              to="/preview/home"
              className="flex-1 flex items-center justify-center gap-2 bg-[#3a7a1f] hover:bg-[#2d6018] text-white font-semibold text-sm py-3 rounded-xl transition-all duration-200"
            >
              Home <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
