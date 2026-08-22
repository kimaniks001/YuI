# Batch 04 — V7 Agreement Workspace

## Scope
Batch 04 is intentionally a single complex visual phase: V7 Agreement Workspace.

## What changed
- Rebuilt `/preview/workspace` as one coherent agreement room rather than a vertical stack of system cards.
- Established the workspace story: what happened → what it means → what you can do next.
- Added explicit `Your role` framing and preserved the rule creator/proposer ≠ payer.
- Added an agreement-thread treatment for milestones.
- Added a dedicated obligations-and-proof room without inventing preview evidence records.
- Added backend-safe money-state treatment where Payment Ready appears only from the projection.
- Added people/role presentation and agreement activity timeline.
- Added a sticky section rail and a two-column desktop / one-column mobile workspace.
- Applied the Living SecurePay Mark as a status/orientation system instead of a generic shield/check decoration.
- Added the same visual room language around the canonical `/agreements/:agreementId` workspace without changing backend actions.
- Removed one duplicate rendering of `next.actionReason` in the canonical agreement page.

## Authority preserved
No frontend financial, release, settlement, evidence, role or confirmation authority was added. Preview remains fixture-backed with no writes. Canonical AgreementDetail continues to use existing SecurePay endpoints and backend truth.

## Review route
`/preview/workspace`

Recommended fixture review:
- SecureLink invited / waiting
- SecureLink Payment Ready
- Group SecureLink contributing
- SecureFlow identities missing
- SecureFlow plan submitted
- Group SecureFlow identities missing

## Lock gate
Approve only when:
- the agreement feels like one room, not separate systems;
- the trader can immediately see current state and next action;
- roles are clear;
- work/evidence and money are visually distinct but connected;
- waiting is calm and attention is purposeful;
- mobile remains understandable without horizontal page overflow.
