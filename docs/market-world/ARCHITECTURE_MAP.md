# SecurePay YUI Architecture Map

**Phase:** MW-00  
**Frontend baseline:** `ffd09b8182a0ea52a83d0fa68c2b1be61ef02855`  
**Backend inspected:** `SecurePayAPI/main` at `764ab3fe1c3222fc1a8f2d147fc9fbd4b3a1cf4b`

## 1. System shape

```text
                           SECUREPAY
                              |
          +-------------------+-------------------+
          |                   |                   |
       MARKET              TRAINER               GAME
     real state          learning state       simulated state
          |                   |                   |
          |              YUI-native UI        YUI Game UI
          |                   |                   |
          |              isolated trainer     future Game service
          |                   |                   |
          +-------------------+-------------------+
                              |
                     explicit bridge only
                              |
                  fresh Market authentication
                              |
                      SecurePayAPI main
                              |
       identity / agreement / ledger / policy / settlement
```

## 2. Canonical runtime ownership

| Concern | Canonical owner | MW-00 rule |
|---|---|---|
| Browser experience | `kimaniks001/YuI` | Build from accepted baseline only |
| Real identity and auth | `SecurePayAPI` | Market-only authority |
| Agreements and obligations | `SecurePayAPI` | Never simulated into real state |
| Funding and provider events | `SecurePayAPI` | Backend authoritative |
| Payment Ready | `SecurePayAPI` policy | UI cannot declare it |
| Release / settlement | `SecurePayAPI` | Provider-confirmed backend truth |
| Trainer state | YUI now; dedicated isolation as evolved | Never real state |
| Game state | Prototype in YUI; future Game service | No Real Market effect |
| Historical UI requirements | `UIyamwisho` reference only | No runtime authority |

## 3. Accepted YUI runtime map

The accepted baseline is a React/Vite application using React Router. `src/main.tsx` is the canonical route registry.

### Public Market entrance

- `/`
- `/signin`
- `/signup`
- `/activate`
- `/activation`
- `/verify`
- `/ks/:ksId`

### Creation and joining

- `/create`
- `/create/journey`
- `/securelink/join`
- `/securelink/join/:token`
- `/group/:slug`

### Signed-in Market workspace

- `/dashboard`
- `/profile`
- `/market`
- `/market/flows`
- `/market/statements`
- `/agreements`
- `/agreements/:agreementId`
- `/actions`
- `/money`
- `/community`
- `/referrals`
- `/settings`
- `/developers`

When Explorer mode is disabled, these routes use real auth gates and Market pages. The accepted baseline therefore already contains the real Market journey skeleton that must be preserved.

### Public guidance and trust

- `/situations`
- `/help`
- `/help/articles`
- `/help/article/:slug`
- `/ask-securepay`
- `/ask`
- `/trust`
- `/terms`
- `/privacy`
- `/legal`
- `/security`
- `/compliance`
- `/not-a-bank`

### Existing Explorer / training surfaces

When `VITE_SECUREPAY_EXPLORER_MODE` is enabled:

- `/explore`
- `/explore/journeys`
- `/explore/review`
- `/explore/system`
- `/explore/responsive`
- `/explore/themes`
- `/explore/certification`

The current `SECUREPAY_EXPLORER_MODE` defaults on unless explicitly set to `false`. Its message states that it performs no authentication, live API calls or real-money actions.

### Existing Game prototype

When Explorer mode is enabled:

- `/play`
- `/play/market`
- `/play/project/:projectId`
- `/play/leaderboard`

These are prototypes beside the Market. They are not the future Game authority and must not be promoted into real financial or agreement state.

### Review/preview surfaces

The baseline also contains `/review` and `/preview/*` fixture-backed visual-review rooms. They remain development/training aids, not Market truth.

## 4. Current boundary problem MW-01 will solve

Today one environment flag (`VITE_SECUREPAY_EXPLORER_MODE`) multiplexes several concerns:

- real Market route rendering;
- fixture-backed Explorer training;
- Game prototype availability;
- preview/review behavior.

That is safe enough for the accepted training baseline because Explorer mode prevents live auth/API use, but it is not the final three-world product architecture.

MW-01 must replace this ambiguity with explicit Market / Trainer / Game world identity and persistent mode treatment while preserving the Market as the default real world.

## 5. Backend architecture already available

At the inspected `SecurePayAPI/main` SHA, merged backend capabilities include:

- authenticated KS identity and actor boundaries;
- agreement creation/invitation/versioning/obligations;
- SecureLink / KeyContract;
- Group SecureLink governance and contributor surfaces;
- SecureFlow distribution-plan discovery/funding foundations;
- Group SecureFlow governance completion while group pool funding remains fail-closed where authority is unresolved;
- agreement funding authority, payment intents, rail discovery and quotes;
- backend Payment Ready triggering and participant release authority;
- agreement money-status and money-record reads;
- referrals with settlement-backed reward qualification;
- Circle read composition and trader settings;
- developer SecureCode sandbox handoff and integration check;
- My Market identity-access and exact-identity ledger statement reads;
- self-scoped KS Store profile/offers;
- public KS Store and published-offer reads for share/QR entry.

Production activation remains explicitly controlled and does not mean live rails are automatically enabled.

## 6. Non-authoritative or excluded state

- Open/unmerged backend PRs are not runtime truth.
- In particular, the competing open Store implementation PR #144 is not canonical; merged PRs #145 and #146 define the current Store authority.
- UIyamwisho routes/components are not part of the YUI architecture map.
- YUI fixture/review/Game state is never evidence that backend state exists.

## 7. Architectural invariant

```text
UI intention -> SecurePayAPI request -> backend authority -> returned fact -> UI display
```

Never:

```text
UI state -> assumed financial/agreement truth
```
