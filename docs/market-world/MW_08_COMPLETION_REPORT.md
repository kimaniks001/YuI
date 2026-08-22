# MW-08 — Circles, Cycles & Cooperative Growth

**Date:** 22 August 2026
**Frontend baseline:** `mw-07-communities-privacy-safe-feed` at `a9fd366`
**Classification:** YUI + BACKEND AUTHORITY BOTH COMPLETE — LOCAL CERTIFICATION PASSED

## Purpose

Make small, deliberate cooperation useful: create a Circle, invite the people you've deliberately chosen to work and grow with, run bounded Cycles of activity, log intentions and opportunity shares, and see raw, explainable "fruit and growth" — without ever promising income or inventing a ranking.

Unlike MW-07 (where the Community backend did not yet exist when the YUI foundation was built), **SecurePayAPI's Circle/Cycle backend authority was implemented in this same phase**, so MW-08 YUI binds directly to real, live endpoints rather than fail-closing.

## Community ≠ Circle

Community (MW-07) is "who are my people?" — belonging and discovery, open or approval-gated join. Circle (MW-08) is "who have I deliberately chosen to work and grow with?" — invite-only, small, and deliberate. The two are structurally distinct on the backend (separate schemas, separate ArchUnit isolation rule) and are presented as distinct rooms in YUI: `/community` for belonging, `/circles` for deliberate cooperation, cross-linked but never merged into one concept.

**Community membership never silently creates Circle/Cycle membership, financial authority, agreement participation, payment authority, entitlement, verification, trust/reputation, ranking, or Master status.** Nothing in this phase derives Circle membership from Community activity.

## What YUI now does

- adds `/circles` — "My Circles": active memberships, pending invitations (accept/decline), and a real "Create Circle" form that calls the backend and makes the creator the organiser;
- adds `/circles/:circleId` — Circle detail: name/description/status/member count/caller role, an organiser-only panel (invite by KS Number, pause/resume the circle), a privacy-safe members list, and the current Cycle;
- Cycle view: start a Cycle (organiser), log the caller's own free-text intention or opportunity share, see raw "fruit and growth" counts (active members, intentions, opportunity shares, per-member contribution counts) — explicitly labelled as not a score or ranking, and close the Cycle (organiser);
- cross-links Community → Circles ("Grow with a Circle") so the two rooms are discoverable from one another without being merged;
- states the doctrine inline, in trader-first language, at the exact points where it matters: invitation is not participation, resting is a pause not deletion, an opportunity share is not an agreement, contribution counts are not a ranking;
- adds `check:circle` to YUI certification.

## Authority boundary

Every fact on `/circles` and `/circles/:circleId` comes from `SecurePayAPI` — nothing is simulated, and nothing is invented when a field is absent. All mutations (create, invite, accept, decline, set status, start/close cycle, log intention, log opportunity share) are real `POST` calls against the live Circle backend built in this same phase, gated by the existing `securePayFetch` world-mode guard: a Trainer/Game-prefixed route would refuse to make these calls at all, so nothing here can ever be reached from a simulated context.

The browser never invents Circle membership, organiser status, invitation state, Cycle state, or contribution counts — every one of those is read back from the backend response, never computed locally. `CircleOpportunityShareResponse` is presented explicitly as "not an agreement, claim, or reward" — the same free-text provenance-only shape the backend enforces.

## Validation

Focused guard: `npm run check:circle` — 10/10 checks passed.

Full local certification: `npm run certify` — **passed** (exit code 0), including `typecheck`, `build`, `check:routes` (110 registered routes, all literal internal links resolve), `check:canonical-runtime`, and all eleven visual-constitution batch guards plus `check:play-market`.

`npm run lint` — 11 pre-existing errors / 8 pre-existing warnings, **all in files this phase never touched** (`src/lib/agreementTopology.ts`, `src/lib/creationPersistence.ts`, `src/lib/operationalProjection.ts`, `src/pages/HelpCenter.tsx`, and a few `react-refresh` warnings elsewhere) — confirmed via `git diff --stat a9fd366` showing zero diff on every one of those files. Not repaired here, per "do not repair unrelated historical failures unless this slice caused them or it blocks all validation" — `certify` does not run `lint` as a gate, so this pre-existing lint debt does not block MW-08 certification.

No dedicated unit-test framework exists in this repository (`package.json` has no `test` script); its test methodology is the guard-script + typecheck + build + routes/runtime-audit pipeline described above, matching the convention already established by MW-02 through MW-07.

## Exit status

MW-08 is **complete on both sides**: SecurePayAPI's Circle/Cycle backend authority (migration, domain, doctrine tests, unit/controller tests, PostgreSQL integration tests — see `SecurePayAPI/docs/operations/MW_08_CIRCLE_CYCLE_COOPERATIVE_GROWTH_COMPLETION_REPORT.md`) and this YUI binding are both implemented, tested, and locally certified. Retained gaps (no promote/transfer-organiser, no organiser-initiated remove-member, no invitation push notification) are backend-disclosed and intentionally not papered over in the UI — the interface simply doesn't offer actions the backend doesn't support yet.
