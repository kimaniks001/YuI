# MW-10 — Real Market Masters & Expertise Registry

**Date:** 22 August 2026
**Frontend baseline:** `mw-09-opportunities-connectors-my-market-convergence` at `dc838e9`
**Classification:** YUI + BACKEND AUTHORITY BOTH COMPLETE — LOCAL CERTIFICATION PASSED

## Purpose

Recognise measurable practical expertise, per category, without ever collapsing it into an opaque trust score — and let a trader discover, understand, and (if they have real backend-provable Market engagement) apply for Master status themselves.

Like MW-07 through MW-09, SecurePayAPI's Master backend authority was implemented in this same phase, so this YUI binds directly to real, live endpoints.

## Never a hidden trust score, never universal, never adjudicated

Every point in this UI where Master status is shown or explained states, in trader-first language, what Master status is *not*: not a score or rank, not a platform-wide credential, not an adjudication, not agreement authority. The evidence view is always the same three raw counts the backend actually computed — never a summarised "trust level."

## What YUI now does

- adds `/masters` — discovery (with a category filter), the caller's own Master profiles, and an "Apply as a Master" form that states the real anti-manipulation floor plainly (a brand-new account cannot self-declare Master status);
- adds `/masters/:masterId` — profile detail, the "Why this person is a Master" evidence breakdown, and (owner-only) rate/availability/revoke controls;
- updates the existing Community "Masters" panel (previously a fail-closed placeholder from MW-07, since the backend didn't exist yet) to a real cross-link into `/masters`, now that the backend does exist — and updates `check:community`'s required-phrase guard to match, since the old placeholder text ("scheduled for MW-10") was true when MW-07 was written and is now stale;
- adds `check:master` to YUI certification.

## Authority boundary

Every fact on `/masters` and `/masters/:masterId` comes from `SecurePayAPI` — nothing is simulated. All mutations (apply, rate update, availability toggle, revoke) are real `POST` calls, gated by the existing world-mode guard. The browser never computes evidence counts, never decides Master eligibility, and never invents a score — every one of those is read back from the backend response exactly as it composed it from real Referral/Circle/Community data.

## Validation

Focused guard: `npm run check:master` — 10/10 checks passed. `npm run check:community` also re-verified passing after its guard update.

Full local certification: `npm run certify` — **passed** (exit code 0), including `typecheck`, `build`, `check:routes`, `check:canonical-runtime`, and all eleven visual-constitution batch guards.

`npm run lint` — same 11 pre-existing errors / 8 pre-existing warnings as MW-08/MW-09, in the same untouched files. Not repaired here, same rationale as prior reports.

## Exit status

MW-10 is **complete on both sides**: SecurePayAPI's Master backend authority (migration, domain, doctrine tests, unit/controller tests, PostgreSQL integration tests proving a real cross-module evidence composition against the Referral module — see `SecurePayAPI/docs/operations/MW_10_MASTER_EXPERTISE_REGISTRY_COMPLETION_REPORT.md`) and this YUI binding are both implemented, tested, and locally certified. The backend's disclosed retained gap most visible here: evidence is currently limited to Referral/Circle/Community signals — completed-Agreement evidence is not yet integrated, so the "Why this person is a Master" panel shows fewer signal types than the roadmap's full illustrative list. The UI does not paper over this; it shows exactly the three counts the backend actually provides.
