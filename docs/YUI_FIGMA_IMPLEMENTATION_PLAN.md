# YUI — Figma Master Implementation Plan

## Starting point

Implementation branch: `yui/figma-master-implementation`

Base code state: `7e34854eaafa78966fb22bd11cfc1754fd1ad9f0` — rejected visual port reverted, product/intelligence work retained.

Design authority: approved SecurePay Figma master through Phase 16 and the final living-mark/status-language amendment.

## Implementation order

The work will proceed in vertical, testable slices rather than a single visual rewrite:

1. **Foundation / visual language** — official logo, cream/green palette behaviour, living SecurePay icon + orbit, tick/waiting/caution/failure/checking/action-needed states, typography, shared layout primitives, responsive shell.
2. **Public Home + identity continuity** — signed-out Home, intent-first entry, sign-in/activation continuity.
3. **Direct agreement creation + counterpart** — SecureLink/SecureFlow family, live agreement understanding, review/join perspectives.
4. **Group creation + counterpart** — Group SecureLink/Group SecureFlow family.
5. **Funding** — payer-authorised funding, provider wait/unknown states, authoritative funded truth.
6. **Living agreement** — current moment, next action, human event history.
7. **Evidence + confirmation** — evidence provenance, acceptance authority, stage completion.
8. **Release + settlement** — readiness, authority, processing, settlement and recovery handoff.
9. **Resolution** — issue entry, Secure Resolution Room, factual escalation record.
10. **Signed-in Market Home** — What Needs Me, coming up, Store/Circle/Builder presence.
11. **Digital Store** — public Store, owner Studio, availability truth, QR/SecureLink continuity.
12. **Community + funded demand** — funded Community Request gate, Community selection, provider response, provider selection.
13. **Circle referrals + Builder** — opt-in referral delivery, referral provenance, Builder attribution/qualification/issuance separation.
14. **SecurePay Plug** — no-code, AI-builder handoff, developer mode, test/live boundaries.
15. **Settings/help/recovery** — identity controls, privacy, renewal, trust explanations and difficult states.
16. **End-to-end certification** — desktop/mobile golden paths, accessibility, privacy, authority and money-truth audits.

## Non-negotiable implementation constraints

- No visual reinterpretation outside the approved master without reopening design.
- SecurePayAPI remains authoritative for agreement, participant, funding, release, settlement, verification and reward truth.
- No browser-created financial truth.
- Creator ≠ payer by default.
- Funded Community Request ≠ provider entitlement.
- Store availability must remain current; stale Store links/QR must not produce a false buy path.
- Circle referral requires recipient opt-in.
- Referral activity ≠ Builder attribution ≠ reward qualification ≠ reward issuance.
- Living SecurePay mark must survive implementation simplification.
- White icon/orbit on green; green icon/orbit on cream.
- Status signs always pair with precise human language.

## Working method

For each slice:

1. Inspect current YUI + SecurePayAPI authority before changing runtime behaviour.
2. Implement only the slice.
3. Add/adjust focused guards/tests.
4. Run typecheck/build/focused tests locally or in CI where available.
5. Commit the completed slice.
6. Continue only after the slice is internally coherent.

The end state is a faithful implementation of the frozen Figma master, not a new design exercise.