# SecurePay Three-World Constitution

**Programme:** SecurePay Market / Trainer / Game  
**Phase:** MW-00 — YUI Rebaseline & Three-World Constitution  
**Date:** 22 August 2026  
**Status:** Foundational — review-controlled

> Money should follow the agreement.

## 1. Runtime sources of truth

From MW-00 onward the runtime hierarchy is:

1. **Frontend:** `kimaniks001/YuI`, accepted baseline branch `yui-accepted-baseline-2026-08-22`, commit `ffd09b8182a0ea52a83d0fa68c2b1be61ef02855`.
2. **Backend and financial truth:** `kimaniks001/SecurePayAPI` `main`.
3. **Historical/reference frontend only:** `kimaniks001/UIyamwisho`.

UIyamwisho may be mined for requirements, tests, API lessons and edge cases. It must not be treated as a runtime source, copied as YUI architecture, or used to create competing financial or agreement authority.

The accepted YUI baseline is deliberate. Later YUI commits are not inherited unless separately reviewed and intentionally adopted.

## 2. The three worlds

### 2.1 Market — real world

The Market is the only world in which real SecurePay identity, agreements and financial state exist.

It may contain real:

- KS identity;
- Digital Stores;
- Communities, Circles and Cycles;
- opportunities and referrals;
- Masters;
- agreements and SecureLinks;
- SecureFlow and Group SecureFlow;
- Recovery & Resolution;
- funding, Payment Ready, release, settlement and ledger state.

**Law:** the frontend may guide, display and request. It never creates financial truth.

### 2.2 Trainer — guided learning world

The Trainer is the safe learning world evolved from YUI Explorer.

It exists for new traders, Plugs/Builders, SecurePay staff, developers, partners and trainers. It may demonstrate real SecurePay mental models, but it must not create real identity, agreement, funding, Payment Ready, release, settlement or reward entitlement.

Trainer state is instructional state only.

### 2.3 Game — competitive practice world

The Game is a social economic simulation in which players practise trade, consequence and balance.

Game money, Game Coins, Game Health, Game achievements, Game Masters, Game agreements and Game outcomes are simulated. They have no cash value and create no Real Market entitlement, reputation, Master status or financial truth.

The Game may hand a **draft intention** to the Market. The user must then authenticate, re-establish real KS identity and give fresh real consent. Simulated acceptance never crosses that boundary.

## 3. Product grammar

- **KS Number** — Who am I?
- **KS Store** — What do I offer and what does my Market presence look like?
- **Community** — Who are my people?
- **Circle** — Who have I deliberately chosen to work and grow with?
- **Agreement** — What exactly have we agreed to do?
- **Cycle** — A recurring period of deliberate Circle activity.
- **Plug / Connector** — Who helps opportunity reach the right person?
- **Master** — Whose measurable experience can help me think through this?
- **Trainer** — Where do I learn how the Market works?
- **Game** — Where do I practise through consequences?
- **Market** — Where do I do it for real?

People belong to Communities. People work together in Circles. Circles grow through Cycles. Trade happens through Agreements. Masters share experience. Plugs help opportunity travel. The Market records the fruit.

## 4. Hard authority laws

These laws apply to every YUI route, component, backend contract and future Game/Trainer service:

- creator ≠ payer;
- invitation ≠ participation;
- listing ≠ reservation ≠ sale;
- opportunity ≠ agreement;
- evidence ≠ completion;
- completion ≠ release authority;
- release request ≠ settlement;
- Game result ≠ Real Market truth;
- Game Master ≠ Real Market Master;
- Store Health ≠ trust score;
- Game Health ≠ real medical or financial health;
- Community membership ≠ endorsement;
- Master Opinion ≠ adjudication;
- Master participation ≠ agreement authority;
- referral provenance ≠ reward entitlement;
- frontend guidance ≠ backend authority.

SecurePay is not a bank, court, insurer, guarantor, legal representative or adjudicator.

## 5. Financial and commercial truth

Real-market fees, subscriptions, rewards, ledger postings, funding status, Payment Ready, release and settlement remain backend-authoritative. YUI may render returned facts but must not independently calculate or declare authoritative outcomes.

Game economics are isolated simulation rules. Game Coins cannot be withdrawn, redeemed for cash or mapped into real balances or rewards.

## 6. Store truth

The KS Store is the trader's Market address. Store presentation may become expressive, but the following meanings remain fixed:

- KS identity;
- SecurePay mark;
- verification/currentness semantics;
- agreement authority;
- financial authority;
- safety notices.

A Store theme must never imply verification, trust, creditworthiness or financial strength that the backend has not established.

## 7. Master truth

A Real Market Master is category-specific and evidence-based. A Master may advise, ask questions, review scoped material and provide a Master Opinion. A Master may not change an agreement, accept for another trader, declare evidence true, declare Payment Ready, release money, settle a dispute, impose liability or adjudicate.

## 8. Recovery & Resolution truth

Recovery & Resolution is a process and record environment. SecurePay is not the judge. A Master Opinion at stalemate may be adopted, partly adopted or ignored. The final trader decision remains the parties' choice unless an external lawful authority applies.

## 9. Boundary rule for all future phases

Every feature must explicitly state:

1. which world it belongs to;
2. what state it may create;
3. what state it may only display;
4. which backend/service is authoritative;
5. what must never cross between worlds.

If a feature cannot answer these questions clearly, it is not ready to ship.
