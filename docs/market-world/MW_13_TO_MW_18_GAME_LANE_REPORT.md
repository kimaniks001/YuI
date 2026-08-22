# MW-13 to MW-18 — Market Game lane checkpoint

Date: 2026-08-22
Branch: `mw-13-18-game-lane`
Base: MW-10 certified YUI `0bd0d3207a3225eb80618a04df8f871e9e79f51d`

## Authority boundary

This lane deliberately does **not** extend SecurePayAPI. Game state is isolated behind `src/game/gameService.ts` and stored under a Game-only browser namespace for this implementation checkpoint. The `GameService` interface is the seam for a later dedicated Game backend.

Hard laws preserved:

- Game Coin != money.
- Game agreement != Real Market agreement.
- Game result != Real Market truth.
- Game Master != Real Market Master.
- Game evidence/confirmation/recovery never creates Payment Ready, release or settlement authority.
- No Game module calls `securePayFetch` or `/api/v1`.

## MW-13 — Game Foundation

Implemented:

- Game profile and persistent history model.
- Yin-Yang Game Health: Trade / Life / Resilience.
- capital/resources.
- Personal Cycle: 5 Cycle Coins.
- Business Cycle: 12 Cycle Coins.
- Cycle renewal and no coin rollover.
- persistent history remains while temporary Cycle Coin balance resets.
- `/game/profile` YUI.

Status: IMPLEMENTED — local typecheck/build still required.

## MW-14 — Card Engine

Implemented:

- versioned scenario schema.
- Trade / Life / Balance / Market families.
- choice consequences and health/capital/resource effects.
- deterministic draw order.
- age-suitability field with fail-closed default draw limited to GENERAL scenarios.
- `/game/cards` YUI.

Status: IMPLEMENTED — local typecheck/build still required.

## MW-15 — Simulated SecurePay Journeys

Implemented:

- Game-only SecureLink.
- Game-only Group SecureLink.
- Game-only SecureFlow.
- Game-only Group SecureFlow.
- evidence and confirmations.
- Game Recovery costs exactly 1 Cycle Coin.
- Game Master Opinion inside Game Recovery.
- no real Payment Ready/release/settlement effect.
- `/game/journeys` YUI.

Status: IMPLEMENTED — local typecheck/build still required.

## MW-16 — Multiplayer Rooms

Implemented in YUI/local Game contract:

- create room.
- room code.
- lobby/readiness.
- member connection-shaped state.
- local round state.
- room chat.
- group-session billing state is explicitly `PAYER_RULE_UNRESOLVED` for 3+ players.
- local testing can proceed without billing.
- `/game/rooms` YUI.

Not claimed:

- real remote synchronization.
- authoritative server reconnect.
- anti-cheat server enforcement.
- production session clock.
- live KES 100/hour billing.

These require a dedicated realtime Game backend and the exact host/room/player payer rule must be locked before live billing.

Status: PARTIAL — genuine Game-service dependency retained.

## MW-17 — Social Missions

Implemented:

- SecureLink challenge.
- QR challenge.
- Store visit challenge.
- opportunity-pass challenge.
- Circle mission.
- Community mission.
- first-completion contribution credit.
- replay count separated from first-completion credit to reduce farming.
- `/game/missions` YUI.

Status: IMPLEMENTED — server-side challenge validation/farming controls remain future Game-service work.

## MW-18 — Balanced Leaderboards / Achievements / Game Masters

Implemented:

- transparent multi-factor Game score.
- 20% economic growth.
- 25% Game Health / balance.
- 15% completed obligations.
- 15% collaboration.
- 10% Circle + Community contribution.
- 10% responsible Game Recovery use.
- 5% productive referrals.
- explainable score breakdown.
- Game Master threshold isolated from Real Market Master.
- persistent achievement/badge presentation.
- `/game/achievements` YUI.

Status: IMPLEMENTED — cross-player authoritative seasons/leaderboard require the dedicated Game backend.

## Routes added

- `/game/profile`
- `/game/cards`
- `/game/journeys`
- `/game/rooms`
- `/game/missions`
- `/game/achievements`

The accepted `/game/market`, `/game/project/:projectId`, and `/game/leaderboard` prototype routes remain available during convergence.

## Focused certification guard

Added:

`npm run check:game-lane`

The guard checks:

- 5/12 Cycle Coin entitlements.
- 1-Coin Game Recovery.
- explicit no-rollover rule.
- no SecurePayAPI call from Game service/pages.
- four card families.
- Game Master separation.
- fail-closed 3+ player billing ambiguity.
- six new canonical Game routes.
- visible non-cash Game-money language.

## Validation still required locally

Because the GitHub-connected environment cannot run the user's local Node/Vite workspace, this checkpoint is not yet marked CERTIFIED. Run:

```bash
npm run check:game-lane
npm run typecheck
npm run build
```

Use focused validation first. Do not run the entire YUI certification universe unless these checks reveal a shared regression.

## Blend plan

The future dedicated Game backend should implement the existing `GameService` contract (or a versioned network equivalent) and replace browser-local authority without allowing Game state to enter SecurePayAPI financial/agreement truth.
