# MW-01 Completion Report — Mode, Identity & Safe World Switching

**Roadmap phase:** MW-01  
**Status:** IMPLEMENTED — repository certification required before merge  
**Starting YUI SHA:** `ff2b670cf5a7630265c8b23426f680e02c0c9646`  
**Backend authority inspected for programme baseline:** `SecurePayAPI/main` remains the Real Market authority.

## 1. Purpose

Make Market, Trainer and Game unmistakable and safely switchable without allowing simulated state to create or masquerade as Real Market identity, agreement or financial truth.

## 2. Delivered

### Explicit world model

`src/lib/worldMode.ts` defines exactly three worlds:

- `market`
- `trainer`
- `game`

World identity is resolved from route namespace. Market is the fallback/default.

### Market is now canonical by default

The old Explorer environment flag no longer replaces canonical Market routes with fixtures. `VITE_SECUREPAY_EXPLORER_MODE` is opt-in compatibility only.

The canonical routes such as `/signin`, `/ks/:ksId`, `/create`, `/dashboard`, `/agreements`, `/money` and `/market` now always render their Real Market components and auth gates.

### Trainer isolation

Trainer has a dedicated `/trainer/*` namespace. Trainer pages are fixture-backed or explicit preview-mode components. Legacy `/explore/*` routes redirect into Trainer.

The Trainer map and navigation dock were rewritten so routine learning navigation remains inside `/trainer/*` rather than accidentally entering Real Market commands.

### Game isolation

Game has a dedicated `/game/*` namespace while the existing `/play/*` prototype remains a simulated legacy alias. Both route families are classified as Game by the runtime boundary.

### Request-time API kill boundary

`securePayFetch()` calls `isSimulatedWorldRuntime()` for every request. This is deliberately evaluated at request time rather than module load so a single-page navigation from Market into Trainer or Game immediately loses live API access without requiring a reload.

### Persistent world treatment

`WorldSwitcher` is visible across ordinary product surfaces and identifies the current context as:

- `REAL MARKET — Backend truth applies`
- `TRAINER · SIMULATED — No real financial or agreement authority`
- `GAME · SIMULATED — No real financial or agreement authority`

Trainer and Game also receive a persistent visual boundary treatment.

### Safe Real Market handoff

From Trainer or Game, **Do this for real**:

1. stores only a session-scoped draft-intent marker;
2. stores no token, financial state, payment state, agreement authority or simulated result;
3. sends the user through the real `/signin` boundary with an internal `/create` return path.

Real authentication must therefore be re-established before Real Market commands are available.

## 3. Authority analysis

| Concern | Authority after MW-01 |
|---|---|
| Real authentication | SecurePayAPI via Market auth only |
| Real KS identity | SecurePayAPI |
| Agreement truth | SecurePayAPI |
| Payment / ledger truth | SecurePayAPI |
| Payment Ready | SecurePayAPI policy |
| Release / settlement | SecurePayAPI |
| Trainer state | YUI fixture/preview state only |
| Game prototype state | YUI Game prototype only |
| World classification | YUI route boundary |
| Draft handoff | Session-only non-authoritative browser intent |

## 4. Negative / misuse cases

MW-01 explicitly protects against:

1. Explorer flag silently replacing `/dashboard` with fixture state.
2. Explorer flag silently replacing `/money` with fixture state.
3. Trainer navigation linking directly to `/create` or `/dashboard`.
4. Game or Trainer code calling `securePayFetch()` after SPA navigation from a Real Market route.
5. simulated state being treated as authenticated state.
6. simulated state being treated as payment, Payment Ready, release, settlement or reward truth.
7. open-redirect style Real Market handoff through unsafe external paths.
8. draft handoff carrying auth tokens or backend authority.
9. legacy `/explore` and `/play` routes escaping simulation classification.

## 5. Responsive / mobile treatment

The world selector has responsive states at 760px and 420px:

- mode remains visually identifiable;
- navigation icons remain touch-sized;
- long secondary status copy collapses;
- simulated-world Real Market handoff remains available;
- a viewport-edge world boundary remains visible.

## 6. Validation

A new repository workflow `.github/workflows/yui-validation.yml` runs on pull requests and performs:

1. `npm ci`
2. `npm run lint` as an **informational baseline-debt report** (`continue-on-error: true`)
3. `npm run certify` as the **hard merge gate**

The first workflow run exposed 11 pre-existing lint errors in accepted-baseline files outside the MW-01 diff (`agreementTopology.ts`, `creationPersistence.ts`, `operationalProjection.ts`, `HelpCenter.tsx`) plus existing warnings. MW-01 deliberately does not widen its scope to rewrite unrelated accepted-baseline code. That debt remains visible in CI rather than being hidden.

The repository's `certify` suite remains authoritative for this phase because it runs the typecheck, production build, route integrity, canonical runtime, no-legacy-UI, brand/visual checks and the upgraded three-world boundary certification.

The existing `check:yui-v1` script has been upgraded into a three-world boundary certification that asserts Market-default routing, route-family isolation, request-time API blocking, safe draft handoff and Trainer-contained navigation.

Final `npm run certify` must be green before merge.

## 7. Files in scope

- `.env.example`
- `.github/workflows/yui-validation.yml`
- `scripts/check-yui-v1-explorer.mjs`
- `src/api/securepayClient.ts`
- `src/components/ExplorerDock.tsx`
- `src/components/WorldSwitcher.tsx`
- `src/lib/explorerMode.ts`
- `src/lib/worldMode.ts`
- `src/main.tsx`
- `src/pages/ExplorerMap.tsx`
- `src/world-switcher.css`
- this report

No SecurePayAPI mutation is required for MW-01.

## 8. Exit gate

MW-01 may close when CI proves `npm run certify` is green.

**Doctrine result:** simulated action cannot create Real Market financial/agreement truth through the YUI API boundary.
