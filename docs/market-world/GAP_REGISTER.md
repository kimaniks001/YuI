# SecurePay Market / Trainer / Game Gap Register

**Phase:** MW-00  
**Status:** Living register; gaps are not permission to invent behavior.

| ID | Gap | Evidence at MW-00 | Authority risk | Planned owner |
|---|---|---|---|---|
| MW00-G01 | No explicit three-world selector/boundary | YUI uses one `VITE_SECUREPAY_EXPLORER_MODE` flag to switch real/fixture behavior; Game routes also sit under Explorer mode | User could confuse learning/practice with Market | MW-01 |
| MW00-G02 | Trainer is not a first-class product | Explorer/preview rooms exist, but there is no canonical `/trainer` journey | Training remains a development-mode concept rather than product grammar | MW-02 |
| MW00-G03 | Game has no separate authoritative domain/session | `/play*` is a YUI prototype only | Game state could be mistaken for real if promoted carelessly | MW-13–MW-18 |
| MW00-G04 | Public Store backend is ahead of accepted YUI binding | SecurePayAPI PR #146 is merged; `/ks/:ksId` in Explorer still renders `PreviewDigitalStore` | YUI must not fabricate public Store truth | MW-03 |
| MW00-G05 | Store owner studio/personality is incomplete | Backend self-scoped Store contract exists via PR #145; YUI Market World owner studio/theme/media workflow is not yet canonical | Cosmetic state must not imply trust/verification | MW-04 |
| MW00-G06 | Store sharing/QR trade entry not wired in YUI | Public offer read exists via PR #146 | Share/QR must create proposal intent only, not reservation/sale/payment | MW-05 |
| MW00-G07 | Plug experience is incomplete | Referral/reward backend exists, but full Plug dashboard, Trainer shortcuts and illustrative earning distinction are not yet first-class | Referral provenance could be mistaken for guaranteed reward/income | MW-06 |
| MW00-G08 | No full Community membership/feed domain identified in current merged backend work | YUI has Community surfaces; inspected merged PRs do not establish MW-07 membership/moderation/feed authority | Membership/privacy/endorsement ambiguity | MW-07 |
| MW00-G09 | Circle backend is only partial for future product vision | Current Circle projection composes verification/referral facts; no full Circle/Cycle domain in inspected merged work | UI must not invent membership, organiser authority or economic outcomes | MW-08 |
| MW00-G10 | No dedicated opportunity domain identified | No current merged opportunity contract found in inspected capability set | Opportunity must not become agreement by UI implication | MW-09 |
| MW00-G11 | Real Market Masters not established | No category-specific Master registry/evidence/rate-floor authority identified | UI cannot self-award Master status | MW-10 |
| MW00-G12 | Master consultation not established | No consultation object, scoped access, rate snapshot or billing authority identified | Master must never gain agreement/payment authority | MW-11 |
| MW00-G13 | Recovery & Resolution needs new product language and stalemate Master Opinion model | Existing review/recovery surfaces exist; future Master linkage/adoption choices are not yet authoritative | SecurePay/Master could be mistaken for adjudicator | MW-12 |
| MW00-G14 | Group SecureFlow pool funding remains intentionally fail-closed where authority is unresolved | SecurePayAPI PRs #135/#136 explicitly retain group pool-funding separation | Never infer organizer-as-funder | Future Market integration as required; no invention |
| MW00-G15 | Game cycle/coin rules are not implemented in a separate service | Roadmap rules exist only as product doctrine | Simulated coins must never mix with real money | MW-13 |
| MW00-G16 | Extensible scenario/card engine absent | Product design defines Trade/Life/Balance/Market cards; no authoritative engine yet | Hard-coded UI decisions would be fragile and unauditable | MW-14 |
| MW00-G17 | No Game-only SecurePay agreement/maths engine | Current Game is prototype presentation | Real API must not be reused in a way that creates real state | MW-15 |
| MW00-G18 | Multiplayer room authority absent | No authoritative room/session/reconnect/anti-cheat service | Client cannot be banker/scorekeeper for competitive state | MW-16 |
| MW00-G19 | Social Game missions/Circles absent | Not implemented | Farming/validation risks | MW-17 |
| MW00-G20 | Balanced leaderboard/Game Master model absent | Existing `/play/leaderboard` is prototype only | Wealth-only score or Game Master could imply real trust | MW-18 |
| MW00-G21 | Trainer/Game → Market bridge absent | No explicit fresh-auth draft-intent bridge exists | Simulated consent/state must not cross into Market authority | MW-19 |
| MW00-G22 | Group Game billing payer rule unresolved | Roadmap preserves KES 100/hour 3+ player concept but host/room/player payer model is intentionally not locked | Live billing cannot be implemented until doctrine is decided | Before MW-16 live billing |
| MW00-G23 | Youth/minor rules not yet defined for Game launch | Explicit launch dependency in roadmap, not resolved in MW-00 | Safety/privacy risk | MW-19 |
| MW00-G24 | Open competing Store PR exists in backend | SecurePayAPI PR #144 remains open while merged #145/#146 define current Store authority | Open PR must not be treated as runtime truth or mixed into new Store model | Keep excluded unless separately reconciled |
| MW00-G25 | Historical YUI batch/review documentation may look current without reset context | Accepted baseline contains pre-reset batch reports and Explorer language | Future contributors may mistake historical implementation notes for roadmap authority | MW-00 constitution/roadmap supersession note |
| MW00-G26 | UIyamwisho may still contain useful but non-canonical work | Historical repo exists | Copying its shell/architecture could recreate competing frontend truth | Requirements/tests may be mined only, phase by phase |
| MW00-G27 | Production-readiness code does not equal live production rails | SecurePayAPI R9 explicitly separates development readiness from deployment/live status | UI must not display “live” from code-readiness alone | Cross-cutting; certify in MW-19 |

## Register discipline

- A gap is a reason to fail closed, defer, or design explicitly.
- A gap is never permission for YUI to calculate missing financial truth.
- Closing a gap requires evidence in the relevant phase completion report.
- New gaps discovered during implementation are appended here with an owning phase; they are not silently absorbed into unrelated work.
