# SecurePay YuI — Batch 02 Visual Report

## Scope

Batch 02 contains the locked visual programme pair:

- **V2 — Identity Doorway**
- **V3 — Agreement Creation visual lock**

## V2 — Identity Doorway

The identity experience is now treated as entering the Market, not as a compliance form. The official SecurePay icon is the recurring guide. It stays polite in normal entry states, becomes present during verification, and becomes commanding only for genuine caution.

Implemented changes:

- sign-in receives the shared Identity Doorway atmosphere and Living SecurePay Mark guidance;
- local visual-review sign-in can progress through the OTP state without calling production authentication;
- signup can be experienced end-to-end in `/preview/signup` without backend writes;
- the signup stepper uses the SecurePay mark as the trail marker for current/completed steps rather than generic check-circle branding;
- completion explicitly describes the KSNumber as SecurePay identity, not a bank account;
- activation uses the Living Mark for guidance, health confirmation and caution;
- semantic destination icons remain semantic (bank, phone, wallet) so brand presence does not erase meaning;
- preview activation never invents activation, settlement, reserve or payment truth.

## V3 — Agreement Creation

The already-approved creation structure is preserved. Batch 02 strengthens the visual grammar rather than redesigning it.

Implemented changes:

- the Living SecurePay Mark now changes posture across understanding, shaping, review and caution states;
- desktop receives a small phase label while mobile keeps the room quiet;
- every question room reminds the trader that answers can be changed before creation;
- the opening interpretation state uses `listening`; review uses `review`; unsupported paths use `caution`;
- completed preview creation uses a clearly labelled completion mark for agreement creation only — never for funding, Payment Ready, release or settlement.

## Visual law retained

> **The Market leads. SecurePay supports.**

> **The SecurePay mark is the light. What surrounds it tells you what is happening.**

The approved signed-out desktop Market Home is not redesigned in this batch.
