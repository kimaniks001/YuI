# SecurePay Market / Trainer / Game Capability Matrix

**Phase:** MW-00  
**Frontend baseline:** YUI `ffd09b8182a0ea52a83d0fa68c2b1be61ef02855`  
**Backend inspected:** SecurePayAPI `main` `764ab3fe1c3222fc1a8f2d147fc9fbd4b3a1cf4b`

This matrix records **current merged/runtime capability**, not aspiration. Open PRs and historical UI code are excluded from authoritative status.

## 1. Core Market capability

| Capability | YUI accepted baseline | SecurePayAPI current main | Status / note |
|---|---|---|---|
| Public signed-out home | Present | N/A | Preserve approved YUI visual system |
| Sign in / sign up / activation routes | Present | Real identity/auth authority exists | Market path retained; Explorer can safely preview |
| KS identity | UI surfaces present | Authoritative | Backend truth only |
| Public KS Store route `/ks/:ksId` | Present; Explorer currently substitutes preview Store | Public Store endpoints merged in PR #146 | **Backend ready; YUI connection scheduled MW-03** |
| Store owner editing | Baseline has Store/profile experience surfaces but no new canonical Market World binding | Self-scoped Store profile/offer contract merged PR #145 | **Backend ready foundation; MW-04 owner studio later** |
| Store offer sharing / QR resolution | Not yet canonical YUI Market flow | Public offer read merged PR #146 | MW-05 YUI work later |
| Agreement creation | Present | Authoritative agreement engine exists | Real Market when Explorer disabled |
| Agreement invitation/joining | Present | Authoritative | invitation ≠ participation |
| Agreement list / actions | Present routes | `/api/v1/me/agreements` and `/api/v1/me/actions` merged PR #132 | Backend-backed Market capability available |
| Agreement obligations / evidence | Present in workspace surfaces | Authoritative | evidence ≠ completion |
| SecureLink / KeyContract | Present | Authoritative | Real Market product |
| Group SecureLink | Present group/join/community surfaces | Governance, capabilities and self-contribution discovery merged | Real Market product |
| SecureFlow | YUI endpoint/types and flow surfaces present | Distribution plan discovery/funding foundation merged PR #135 | Backend authority remains exact and allocation-bound |
| Group SecureFlow | YUI flow surfaces present | Governance completion merged PR #136; group pool funding retains fail-closed boundary | Do not fabricate missing funding authority |
| Funding authority | UI surfaces exist | Payer derived from persisted monetary obligation; funding API merged PR #133 | creator ≠ payer |
| Funding options / quotes | UI can consume | Backend rail discovery and quote merged PR #133 | UI must not invent eligibility/cost |
| Money status | Money workspace present | Participant-safe backend money status merged PR #127 | Read-only projection |
| Money records | Statements/money surfaces present | Agreement money records merged PR #128 | Records are not balances/settlement proof |
| Payment Ready | UI states exist | Backend policy/trigger authority; release enablement merged PR #134 | UI never declares READY itself |
| Release authority | UI can request/display | Backend participant authority merged PR #134 | active payer rule; creator alone insufficient |
| Release/settlement truth | UI surfaces | Backend-controlled | release request ≠ settlement |
| Recovery/Resolution | Review/recovery experience surfaces present | Existing review/dispute foundations | Product language migration and Master integration later MW-12 |

## 2. Market network capability

| Capability | YUI baseline | SecurePayAPI current main | Status / note |
|---|---|---|---|
| Referrals / Plug provenance | `/referrals` route and UI client present | Referral code/relationship + settlement-backed reward qualification merged PRs #138/#139 | Backend reward entitlement only |
| Circle | `/community` and related UI surfaces | Current backend `CircleProfileService` is a read-time composition, not full Circle membership domain | **Partial; full Circles/Cycles scheduled MW-08** |
| Community | UI community surface exists | No full MW-07 membership/feed domain established by the inspected merged work | **Gap; scheduled MW-07** |
| Opportunities | Not canonical | No dedicated opportunity domain established in inspected merged work | **Gap; scheduled MW-09** |
| Real Market Masters | Not canonical | No dedicated Master registry authority established in inspected merged work | **Gap; scheduled MW-10** |
| Master consultation | Not canonical | No dedicated consultation object/billing authority established | **Gap; scheduled MW-11** |
| Trader settings | `/settings` route | self-scoped settings merged PR #138 | Non-financial preferences only |
| My Market multi-identity view | `/market` workspace present | backend-authoritative access and exact-identity statements merged PR #141 | View ≠ super-KSNumber; act-as remains separate |

## 3. Developer capability

| Capability | YUI baseline | SecurePayAPI current main | Status / note |
|---|---|---|---|
| Developer workspace | `/developers` route and developer journey present | Developer platform foundations exist | Real Market/developer lane |
| AI-assisted setup handoff | YUI API client present | short-lived sandbox-only SecureCode + integration check merged PR #140 | SecureCode is not an API credential |
| Production access | UI may describe | controlled/certified only | Never implied by sandbox success |

## 4. Trainer capability

| Capability | YUI accepted baseline | Authority | MW target |
|---|---|---|---|
| Safe Explorer mode | Present; defaults on unless explicitly disabled | YUI local/fixture state only | Becomes Trainer foundation |
| Preview sign-in/signup/activation | Present | Simulated only | MW-02 |
| Guided journey rooms | Present across `/explore` and `/preview` surfaces | Simulated only | Consolidate intentionally in MW-02 |
| Store demonstrations | Present | Simulated only | MW-02 |
| Agreement / Group / Flow demonstrations | Present | Simulated only | MW-02 |
| Recovery demonstrations | Present | Simulated only | MW-02 |
| Plug-led trainer sessions | Not first-class | None | Gap for MW-02/MW-06 |
| Explicit `/trainer` product | Not present | None | Gap for MW-02 |

## 5. Game capability

| Capability | Current YUI prototype | Real authority | MW target |
|---|---|---|---|
| `/play` entry | Present | None | Prototype only |
| Market board | Present | None | Replace/evolve under MW-13+ |
| Projects | Present | None | Simulated only |
| Leaderboard | Present | None | Prototype; not Real Market trust |
| Game profile / Cycle | Not authoritative | None | MW-13 |
| Game Health / Yin–Yang balance | Concept not yet authoritative | None | MW-13 |
| Game Coins ledger | No authoritative separate service | None | MW-13 |
| Four card families | Not built as extensible engine | None | MW-14 |
| Simulated SecurePay agreement engine | Prototype interactions only | None | MW-15 |
| Multiplayer authoritative rooms | Not present | None | MW-16 |
| Social missions / Game Circles | Not present | None | MW-17 |
| Explainable balanced leaderboard / Game Master | Prototype only | None | MW-18 |

## 6. Deployment and operational status

SecurePayAPI has merged production-readiness safeguards, but the inspected repository explicitly distinguishes **development completeness** from **live production activation**. No YUI feature may interpret repository readiness as evidence that a rail is live.

Open SecureVault bridge PRs #142/#143 are not merged and are excluded from current runtime truth.
