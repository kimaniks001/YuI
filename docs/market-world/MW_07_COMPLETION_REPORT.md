# MW-07 — Communities & Privacy-Safe Market Feed

**Date:** 22 August 2026  
**Frontend baseline:** `yui-accepted-baseline-2026-08-22` at `98fd6217092ee0dd236ffdefb7ede965f18b9e9c`  
**Classification:** YUI FOUNDATION COMPLETE — BACKEND COMMUNITY AUTHORITY REQUIRED

## Purpose

Make belonging and discovery useful without leaking private trade or turning Community membership into endorsement, ranking or financial authority.

## What YUI now does

- keeps `/community` as the protected Real Market Community room;
- retains the only currently authoritative relationship projection, `GET /api/v1/circle/me`;
- presents backend-provided identity/referral facts explicitly as relationship context, not Community membership or reputation;
- adds clear Community rooms for My people, Discover, Members, Market feed and Rules;
- fail-closes Discover because no authoritative Community directory/visibility contract exists;
- fail-closes join/request/leave/member/moderator behavior because no Community membership authority exists;
- fail-closes the social feed because no backend-governed publishable Community event stream exists;
- states the publication rule: public because the trader/Community chose to publish it, not merely because SecurePay knows it;
- protects private agreements, amounts, payment state, evidence, Recovery & Resolution and participant identity from social-feed inference;
- adds the roadmap Master-discovery entry without labelling anyone a Real Market Master before MW-10 authority exists;
- preserves Store and referral provenance links as useful current Market journeys;
- adds `check:community` to YUI certification.

## Authority boundary

Community membership ≠ endorsement.

The browser does not invent Community membership, member counts, moderators, rules, rankings, medals, reputation, popularity, recommendations or feed events. It also does not derive Community posts from private agreement/payment/recovery data.

The existing `/api/v1/circle/me` response remains what it already is: a self-scoped relationship/referral projection. It is not relabelled as a persisted Community domain.

## Backend bridge required to finish MW-07

SecurePayAPI still needs an explicit Community domain with at least:

1. Community identity and visibility policy;
2. discoverable/public vs private Community rules;
3. membership lifecycle: request/join/approve/leave/remove;
4. moderator/organiser authority;
5. participant-safe member projection;
6. explicit publication controls;
7. privacy-safe Community feed events;
8. object-level authorization and anti-enumeration;
9. audit/idempotency for mutations;
10. tests proving private agreement/payment/recovery data cannot leak into Community surfaces.

Until that exists, the corresponding YUI rooms remain informative authority gates rather than fake interactive features.

## Master discovery

MW-07 creates the entry concept only. Real category-specific Master registry/evidence/rate authority remains MW-10. No Master status is inferred from Community activity, referral counts, Store Health or Circle context.

## Validation

Focused guard: `npm run check:community`.

Full local certification remains required before merge: `npm run lint && npm run certify`.

## Exit status

The privacy-safe Community experience foundation exists and makes the missing backend authority explicit. **MW-07 is not commercially/functionally complete until the Community backend bridge is implemented and the gated rooms can bind to authoritative contracts.**
