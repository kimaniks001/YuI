# MW-06 — Plug / Builder Economy & Trainer Tools — Completion Report

**Classification:** YUI IMPLEMENTED — BACKEND RETENTION REWARD BLOCKED ON AUTHORITATIVE SUBSCRIPTION LIFECYCLE  
**Branch:** `mw-06-plug-builder-economy-trainer-tools`  
**Base:** merged MW-05 `a12950ef3d0a38638abb42a2d8fa492636175928`

## 1. Scope implemented in YUI

MW-06 adds a protected Plug / Builder workspace without creating a second referral or reward authority.

Delivered:

- protected `/plug` route plus `/builders` alias;
- account-menu entry to the Plug / Builder workspace;
- existing backend referral provenance/history reused directly;
- referral code copy/share;
- introduced / activated / backend reward evidence summary;
- referral rows keyed by canonical referred KSNumber;
- existing settlement-backed reward evidence remains backend-only;
- Trainer shortcuts for Plug-led teaching;
- Store-help workflow that keeps the referred trader in control of their own KS identity and Store;
- illustrative month-10 arithmetic clearly separated from real entitlement;
- locked Plug retention and Game Cycle doctrine;
- focused `check:plug` authority guard in the hard YUI certification chain.

## 2. Locked month-10 commercial rule

The approved rule is:

> If a KSNumber introduced by a Plug / Builder completes 10 consecutive successfully paid active subscription months, the SecurePay subscription fee actually collected for month 10 becomes a one-time reward for the originating Plug / Builder.

Important consequences:

- actual month-10 fee collected is the amount source;
- a non-qualifying/unpaid/inactive month breaks the streak;
- identity/account age is not paid-month evidence;
- referral provenance cannot be swapped before month 10;
- qualification must be exactly once;
- no territory, downline, lifetime override or agreement authority is created.

## 3. Backend truth inspected

The merged SecurePayAPI referral implementation already provides:

- immutable/conflict-safe referral provenance;
- canonical referred KSNumber history;
- backend-observed activation;
- settlement-backed KeyContract reward qualification;
- backend commercial-rule reward amount and evidence.

It does **not** provide an authoritative subscription activation / renewal / grace / suspension / paid-cycle lifecycle.

SecurePayAPI's Phase 37 completion report explicitly retains subscription lifecycle as deferred `DR-37-01`. Therefore there is currently no authoritative database event stream from which YUI or referral services can prove ten consecutive successfully paid subscription months.

## 4. Why the UI fails closed

MW-06 deliberately does not:

- calculate ten months from `activatedAt`;
- use account age as paid-month proof;
- assume For You / Business fees were collected merely because a plan exists;
- display a pending month-10 reward;
- create a synthetic reward balance;
- mark a retention reward qualified in browser state.

The new workspace explains the locked rule but states that actual retention reward visibility requires backend subscription payment authority.

## 5. Game Cycle decision

The programme now locks:

- **Turn:** one active player's opportunity to act;
- **Round:** every active player has completed one Turn;
- **Cycle:** one completed Round plus end-of-cycle Market and Life consequences.

One Cycle may represent one simulated Market month for recurring Game concepts.

Referrals remain optional, opportunity-driven actions. Players are never required to refer everybody to everybody. A ten-Cycle retention example is Game-only and cannot create Real Market entitlement.

See `PLUG_RETENTION_AND_GAME_CYCLE_DOCTRINE.md`.

## 6. Authority analysis

| Truth | Authority |
|---|---|
| referral relationship | SecurePayAPI referral domain |
| referred KSNumber | SecurePayAPI identity/referral projection |
| current settlement-backed referral reward | SecurePayAPI commercial + payment-release evidence |
| ten paid subscription months | **No current backend authority — blocked** |
| month-10 retention reward | **Cannot exist until paid-month authority exists** |
| Trainer example | non-authoritative YUI simulation |
| Game Cycle / simulated referral month | future Game-only authority |

## 7. Negative / misuse checks

The phase guard asserts:

- Plug route is authenticated Market UI;
- reward records are backend-sourced;
- month-10 rule says ten consecutive paid months;
- the amount follows the actual month-10 fee;
- identity age cannot substitute for paid-month evidence;
- exactly-once doctrine is recorded;
- no downline/lifetime entitlement is introduced;
- Trainer arithmetic is labelled illustration only;
- Game Turn / Round / Cycle grammar is explicit;
- Game referrals are not compulsory;
- Game cannot create Real Market reward entitlement.

## 8. Responsive treatment

The Plug workspace uses responsive grids and keeps primary actions at touch-safe `min-h-11`. The existing four-item mobile trader navigation is not expanded; the Plug workspace is reached through the account menu so mobile navigation remains stable.

## 9. Exit status

| MW-06 exit item | Status |
|---|---|
| Plug dashboard | PASS |
| referral provenance | PASS — existing backend authority reused |
| activation tracking | PASS — existing backend activation evidence reused |
| settlement-backed reward reporting | PASS |
| Trainer / Store-help tools | PASS |
| illustrative earnings maths separated from entitlement | PASS |
| month-10 commercial rule | PASS — doctrine locked |
| real ten-consecutive-paid-month evidence | **BLOCKED — subscription lifecycle absent** |
| real month-10 reward qualification | **BLOCKED — depends on paid-month evidence** |
| Game Cycle grammar | PASS — doctrine locked for MW-13+ |

## 10. Required backend unblock

Before MW-06 can be classified fully complete, SecurePayAPI needs an authoritative subscription lifecycle capable of proving at least:

1. exact subscription plan/cycle;
2. successful paid-cycle evidence;
3. continuity / streak reset semantics;
4. actual paid amount/currency per cycle;
5. idempotent, exactly-once month-10 retention reward qualification;
6. referral provenance binding;
7. participant-safe reward evidence projection.

That work must reuse existing payment/ledger/commercial authority rather than introduce browser or referral-service financial truth.

**MW-07 should not be used to hide this gap.** The programme may continue only when the dependency policy permits carrying this explicit retained blocker; if MW-06 is treated as a hard dependency requiring full commercial completion, this is the stop gate.
