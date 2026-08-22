# YUI-11 / YUI-12 / YUI-19 Experience Lane Report

Date: 2026-08-22
Baseline: `0bd0d3207a3225eb80618a04df8f871e9e79f51d` (`mw-10-yui-local-complete`)
Branch: `yui-11-12-19-experience-lane`
Status: IMPLEMENTED — STATIC/DIFF REVIEW COMPLETE — LOCAL BUILD + FINAL API BLEND PENDING

## YUI-11 — Master Consultation

Delivered:
- `/agreements/:agreementId/consultation`
- `Ask a Master` entry from the agreement workspace
- visible inviter/fee-bearer doctrine
- available-Master selection
- requested hours and consultation scope
- backend rate snapshot expectation
- consultation list/detail
- scoped joint chat
- timer/extension controls
- immutable Master Opinion presentation/submission
- close/revoke controls
- explicit statement that Master advice gives no agreement, Payment Ready, release or settlement authority

Client seam:
- `src/api/consultationTypes.ts`
- `src/api/consultationEndpoints.ts`

The endpoint paths are an integration seam only and must be reconciled against Claude's final SecurePayAPI MW-11 contract during the blend pass. Real Market state is never simulated.

## YUI-12 — Recovery & Resolution

Delivered:
- `/agreements/:agreementId/recovery`
- `Recovery & Resolution` entry from agreement workspace
- trader-first `what happened → what it means → what can I do next` framing
- open-recovery form
- Recovery Room status and backend-owned formal dispute fee display
- scoped recovery conversation
- evidence list
- stalemate Master Opinion presentation
- `Adopt / Partially Adopt / Ignore` party disposition actions
- resolution-record form
- clear non-adjudication language

Client seam:
- `src/api/recoveryTypes.ts`
- `src/api/recoveryEndpoints.ts`

## YUI-19A — Trainer/Game → Real Market bridge

Delivered:
- `/market/continue`
- `Do this for real` now exits Trainer/Game through the explicit bridge instead of jumping directly to creation
- existing session-storage `MarketDraftIntent` is used as safe navigation intent only
- unauthenticated users are sent through sign-in before Real Market continuation
- explicit allow/deny list for what can and cannot cross worlds
- Game coins, Game balances, simulated agreements, simulated financial state, Game Master and leaderboard truth are prohibited from crossing
- draft intent is discarded before entering the Real Market target

## YUI-19B — Safety / boundary / launch integration polish

Delivered:
- `/market/safety`
- visible Market / Trainer / Game authority explanation
- `Clients request. Backend decides.` launch boundary
- `Simulation stays simulation.` boundary
- Master and Recovery non-adjudication reminders
- Market world switcher links to world-safety guidance

## Authority boundaries

Locked in UI copy and structure:
- YUI never declares Payment Ready, release or settlement truth.
- Master Consultation is advisory only.
- Master Opinion is not adjudication.
- Recovery is structured process and record, not a SecurePay verdict.
- Trainer/Game cannot call SecurePayAPI because `securePayFetch` already blocks simulated-world runtime.
- Only safe draft navigation intent crosses into Market; all real authority is re-established after authentication.

## Diff review

Compared against MW-10 baseline:
- 11 commits ahead
- 0 commits behind
- 11 changed files at first full diff review
- no MW-10 baseline rewrite; certified branch was restored to exact baseline after an initial planning-commit branch-selection mistake

## Pending blend/certification

When Claude completes the corresponding backend authority:
1. compare final OpenAPI endpoint names and payloads with the two new client seams;
2. update only adapters/types where contract names differ;
3. run `npm run certify` locally;
4. run focused consultation/recovery route tests;
5. verify responsive/mobile presentation;
6. confirm sign-in `returnTo` behaviour for `/market/continue`;
7. then perform the final Market/Trainer/Game end-to-end boundary test.

No Game economy/service authority was implemented here.
