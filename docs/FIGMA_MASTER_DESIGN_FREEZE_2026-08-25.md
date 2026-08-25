# SecurePay Figma Master — Design Freeze

**Status:** FROZEN — IMPLEMENTATION AUTHORITY  
**Freeze date:** 2026-08-25  
**Approved through:** Phase 16 + final living-mark/status-language amendment  
**Figma Make master:** `NPeRzcPxd6tZbterZFoHbl`

## Decision

The SecurePay Figma master programme is complete and frozen after final human approval. No further visual discovery or redesign is authorised during YUI implementation unless the design is explicitly reopened.

The approved Figma master is the visual and interaction authority for YUI. YUI must implement it faithfully while wiring real SecurePayAPI state and preserving backend authority.

## Locked product doctrine

- SecurePay is the agreement layer of the Market.
- SecurePay helps ordinary people make better agreements and helps money faithfully follow them.
- `Money should follow the agreement.`
- Natural-language intent is the front door; topology stays mostly behind the curtain.
- Known context must be remembered and reused rather than re-asked.
- Creator, payer, recipient, confirmer, release authority and beneficiary are distinct unless backend truth says otherwise.
- Store = current supply.
- Funded Community Request = credible funded demand.
- Community lives inside the authenticated KSNumber-owner Market.
- No live Community Request without authoritative funding confirmation.
- Community response does not create provider entitlement or an agreement.
- Circle referrals are permissioned and may connect to Builder attribution.
- Referral activity, Builder attribution, reward qualification and reward issuance are separate states.
- No cascading MLM/downline reward model.
- Rewards remain backend-qualified only.

## Locked living SecurePay mark

The living SecurePay mark is part of the product language and must not be removed during implementation simplification.

- On deep green/dark SecurePay surfaces: **white SecurePay icon + white orbit**.
- On cream/light surfaces: **SecurePay green icon + SecurePay green orbit**.
- Restore and preserve status signs: confirmed/tick, waiting, caution/attention, failed, checking/verifying, action needed, active/current and restricted where appropriate.
- Orbit + status sign + human sentence form one system.
- The orbit is not a generic spinner.
- A status sign never substitutes for precise human state language.
- A tick confirms only the exact thing beside it and must never imply unrelated financial truth.

## Locked financial distinctions

The YUI implementation must not visually collapse:

- Request funded ≠ provider entitled.
- Request funded ≠ final agreement funded where backend models them separately.
- Payment initiated ≠ funded.
- Funded ≠ released.
- Release authorised ≠ settled.
- Evidence added ≠ performance confirmed.
- Performance confirmed ≠ settlement confirmed.
- Community response ≠ agreement formed.
- Referral ≠ Builder attribution.
- Builder attribution ≠ reward qualified.
- Reward qualified ≠ reward issued.

## Implementation rule

Implementation may adapt for real backend data, accessibility mechanics, responsive browser constraints and technical feasibility, but must not casually reinterpret the approved visual hierarchy, language, interaction philosophy or journeys.

The design is now closed. YUI implementation begins from the preserved pre-rejected-port code state.