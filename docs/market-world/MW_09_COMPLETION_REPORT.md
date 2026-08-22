# MW-09 — Opportunities, Connectors & My Market Convergence

**Date:** 22 August 2026
**Frontend baseline:** `mw-08-circles-cycles-cooperative-growth` at `b964be2`
**Classification:** YUI + BACKEND AUTHORITY BOTH COMPLETE — LOCAL CERTIFICATION PASSED

## Purpose

Make opportunity travel to the right person, and let a trader see it all converge in one place: what's waiting for them, what they created, what they've claimed, and how their own connector passes have played out — all as raw, explainable facts, never a score or automatic reward.

Like MW-08, SecurePayAPI's Opportunity backend authority was implemented in this same phase, so this YUI binds directly to real, live endpoints.

## Opportunity ≠ agreement

Responding to, passing, or claiming an opportunity is explicitly presented, at every point in the UI where it matters, as **not** an agreement, reservation, sale, or offer. If real work follows, it happens through its own separately-created agreement — nothing on this page can create one. Referral provenance is likewise explicitly presented as distinct from reward entitlement: connector contribution is shown as two raw numbers, never a score or automatic payout.

## What YUI now does

- adds `/opportunities` — "My Market convergence": created/inbox/claimed counts, raw connector-contribution counts, a create form, and three lists (inbox, created, claimed);
- adds `/opportunities/:opportunityId` — detail: pass to another trader by KS Number, express interest, claim ("I'm taking this"), the full pass provenance chain, and (creator-only) the list of responses;
- cross-links from the existing `/market` (My Market) operating room with a new "Opportunities" card, satisfying the roadmap's "unify ... discovery in the trader operating room" purpose without restructuring the existing agreement-focused page;
- states the doctrine inline, in trader-first language, at the exact points where it matters: opportunity is never the same as agreement, a response is never a reservation or offer, contribution counts are never a score/rank/reward;
- adds `check:opportunity` to YUI certification.

## Authority boundary

Every fact on `/opportunities` and `/opportunities/:opportunityId` comes from `SecurePayAPI` — nothing is simulated. All mutations (create, pass, respond, claim, close) are real `POST` calls, gated by the existing world-mode guard so nothing here is reachable from a simulated Trainer/Game context. The browser never invents opportunity visibility, provenance, or contribution counts — every one is read back from the backend response.

## Validation

Focused guard: `npm run check:opportunity` — 9/9 checks passed.

Full local certification: `npm run certify` — **passed** (exit code 0), including `typecheck`, `build`, `check:routes`, `check:canonical-runtime`, and all eleven visual-constitution batch guards.

`npm run lint` — same 11 pre-existing errors / 8 pre-existing warnings as MW-08, in the same untouched files (confirmed via `git diff --stat` showing zero diff on each). Not repaired here, same rationale as MW-08's report: `certify` does not gate on `lint`.

## Exit status

MW-09 is **complete on both sides**: SecurePayAPI's Opportunity backend authority (migration, domain, doctrine tests, unit/controller tests, PostgreSQL integration tests — see `SecurePayAPI/docs/operations/MW_09_OPPORTUNITY_CONNECTOR_CONVERGENCE_COMPLETION_REPORT.md`) and this YUI binding are both implemented, tested, and locally certified. The retained backend gap that most affects this UI is disclosed there: opportunities are not yet automatically surfaced through Community feed posts or Circle opportunity-shares — only direct KS-Number-to-KS-Number passing exists in this phase. The UI does not paper over that; it only offers the pass mechanism the backend actually supports.
