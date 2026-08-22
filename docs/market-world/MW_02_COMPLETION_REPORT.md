# MW-02 Completion Report — Trainer Foundation

**Roadmap phase:** MW-02  
**Status:** IMPLEMENTED — repository certification required before merge  
**Starting YUI SHA:** `4f8a34a8f985e5393308483902bb0eeea0ef2d54`  
**Backend change:** none — Trainer remains YUI simulation only

## 1. Purpose

Turn the accepted YUI Explorer rooms into an intentional SecurePay Trainer that a Plug, staff member, developer, partner or trader can use to teach and learn the full SecurePay mental model without creating Real Market state.

The phase exit is practical: a Plug must be able to teach SecurePay end to end without creating real identity, agreement or financial truth.

## 2. Delivered

### Intentional Trainer home

`/trainer` now opens `TrainerHome`, not the old room map. It explains the learning-world boundary first, then offers:

- a role picker;
- a real-life journey picker;
- a guided Plug session;
- direct Store, agreement, group/flow, money, Recovery & Resolution and developer demonstrations;
- a safe **Try it for real** handoff.

The accepted Explorer map remains available at `/trainer/map` as the broad demo-room library.

### Role demonstrations

The Trainer can be entered as:

- Plug / Trainer;
- Trader;
- SecurePay staff;
- Developer;
- Partner.

Role selection changes teaching emphasis only. It does not create or impersonate a KS identity and does not grant Market authority.

### Journey picker

The Trainer starts from ordinary situations rather than requiring product terminology:

1. one payer → one recipient — SecureLink-style trade;
2. many contributors → one purpose — group contribution;
3. one payer → many obligations — SecureFlow-style structure;
4. disagreement → evidence → Recovery & Resolution.

### Plug-led guided session

`/trainer/session` provides a five-stage teaching flow:

1. **Identity & Store** — KS Number is identity; Store is the Market address; listing is not reservation or sale.
2. **SecureLink / agreement** — intention first; creator is not automatically payer; invitation is not acceptance.
3. **Group / SecureFlow** — contribution, governance and distribution are distinct; organizer status is not money authority.
4. **Evidence / Recovery** — evidence supports understanding; SecurePay is not the judge.
5. **Real Market handoff** — only draft intention crosses; real identity, consent, agreement and money truth are re-established in Market.

Each stage gives a trainer three prompts: **Say / Ask / Truth boundary**.

### Session-only learning progress

Trainer role and completion progress use `sessionStorage` under `securepay.trainer.session.v1`. This state:

- has no backend write;
- is not authentication;
- is not KS identity;
- is not agreement state;
- is not payment or ledger state;
- has no reward or commercial entitlement.

### Try It For Real

The Trainer uses the MW-01 handoff boundary:

1. save only a session-scoped draft-intent marker;
2. route through `/signin`;
3. return to Real Market creation only after real authentication.

No simulated result, role, money state or authority crosses the boundary.

## 3. Files in scope

- `src/lib/trainerSession.ts`
- `src/pages/TrainerHome.tsx`
- `src/pages/TrainerSession.tsx`
- `src/main.tsx`
- `src/components/ExplorerDock.tsx`
- `scripts/check-yui-v1-explorer.mjs`
- `scripts/check-trainer-foundation.mjs`
- `package.json`
- this report

No SecurePayAPI file is changed in MW-02.

## 4. Authority analysis

| Concern | Authority after MW-02 |
|---|---|
| Real authentication | SecurePayAPI / Market only |
| Real KS identity | SecurePayAPI |
| Agreement truth | SecurePayAPI |
| Funding / ledger | SecurePayAPI |
| Payment Ready | SecurePayAPI policy |
| Release / settlement | SecurePayAPI |
| Trainer role | browser-session teaching preference only |
| Trainer progress | browser-session learning state only |
| Trainer demo screens | fixture / preview state only |
| Market handoff | draft intention only; real auth required |

## 5. Negative / misuse cases

MW-02 explicitly protects against:

1. a Plug role being mistaken for authenticated Market identity;
2. completing a Trainer stage being treated as a Market completion event;
3. demo evidence becoming real evidence;
4. demo Payment Ready becoming real Payment Ready;
5. Trainer Store content being treated as a real Store publication;
6. organizer demonstration implying payer or release authority;
7. Recovery & Resolution demo becoming adjudication;
8. Trainer progress creating referral or Plug reward entitlement;
9. a Trainer page calling live SecurePayAPI;
10. simulated state crossing the Real Market handoff.

## 6. Responsive / mobile checks

The new Trainer surfaces use the accepted responsive system and explicitly support:

- stacked mobile hero/actions;
- two-column journey cards at medium widths;
- role grid collapsing from five columns;
- guided session collapsing from sticky two-column desktop to one-column mobile;
- touch-sized action controls;
- world switcher and simulated-world boundary retained from MW-01.

## 7. Tests / certification

`check:trainer` runs `scripts/check-trainer-foundation.mjs` and asserts:

- intentional Trainer root;
- guided Plug session;
- role demonstrations;
- Store / SecureLink / group-flow / Recovery demonstrations;
- safe Try It For Real reauthentication;
- all five teaching stages;
- session-only progress;
- authority-law teaching;
- simulated-state boundary;
- request-time live API block;
- responsive layout markers.

`check:trainer` is part of the hard `npm run certify` chain alongside typecheck, production build, route integrity, canonical-runtime checks and all accepted visual guards.

The existing lint step remains an informational baseline-debt report, as documented in MW-01. No new lint debt is intentionally accepted by this phase.

## 8. Exit gate

MW-02 may close only when the pull-request workflow proves `npm run certify` green.

**Exit statement:** A Plug can teach SecurePay from identity and Store through agreement, multi-party flow, evidence/recovery and safe Real Market handoff without creating real state.
