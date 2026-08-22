# Batch 7 — V9 SecureFlow / Group SecureFlow + V12 Community & Growth

**Visual programme status:** implementation candidate for user review
**Date:** 21 August 2026

## Purpose

Batch 7 makes two visually complex areas legible without allowing the frontend to invent authority.

### V9 — SecureFlow / Group SecureFlow
The visual grammar is:

> **source → governed agreement purpose → clear allocation branches**

For Group SecureFlow the grammar adds the group/governance layer before distribution. Visuals may explain recorded decisions but never calculate eligibility, quorum, plan lock authority, Payment Ready or settlement.

The review surface demonstrates:
- one payer → several recipients
- several contributors → governed purpose → several recipients
- recipient identity, amount, purpose and local state kept distinct
- governance presented as a boundary rather than a decorative badge
- explicit fixture / non-authoritative language

Canonical surfaces keep all SecurePayAPI authority intact.

### V12 — Community & Growth
The visual grammar is:

> **connection, not ranking**

The community room treats a KSNumber as a trader's place in the Market and relationships as context around it. The UI must not invent Circle scores, rankings, reputation guarantees or unverified medals.

Referral growth is visualised as branching relationships rather than a leaderboard. Qualification and reward remain backend-evidenced facts only.

## New visual-review route

- `/preview/flows-community`

The route is fixture-backed and DEV-only.

## Doctrine boundaries preserved

- Community never decides Payment Ready, release, settlement or dispute outcome.
- Group SecureFlow quorum remains backend-authoritative.
- A contribution intention is not a payment.
- A distribution preview is not evidence that money is funded or moving.
- No estimated referral earnings are shown.
- No reputation score or community ranking is invented.
