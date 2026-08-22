# Batch 10 — V15 System & Failure States + V16 Responsive Certification

## Purpose
Batch 10 closes the visual language for exceptional system states and establishes the responsive certification contract for the approved SecurePay Market rooms.

## V15 — System & Failure States
The new system-state grammar requires every exceptional state to answer:

1. What happened?
2. What does it mean?
3. What can I do next?
4. Was money affected?

The reusable `SystemStateRoom` component uses the Living SecurePay Mark as the status carrier. The SecurePay symbol remains unchanged; caution, waiting, review and success are communicated around it.

Covered visual states include loading, empty, offline, retry, forbidden action, expired session, expired invitation, not found, service failure, unavailable payment rail, incomplete identity, missing evidence, waiting on another participant, no activity, no statement entries, and maintenance.

Financial authority is explicitly protected: loading, retry, offline, missing pages and service failure cannot be presented as evidence that money moved. Unknown remains unknown.

## Canonical propagation
- `components/api/LoadingState` and `components/api/ErrorState` now use the common system-state grammar.
- Trader loading, empty, error and unavailable states use the same grammar.
- The canonical 404 room uses intention-first Market language rather than obsolete product-first actions.

## V16 — Responsive certification contract
Certified phone targets:

- 360 × 800 — compact Android
- 390 × 844 — standard iPhone
- 412 × 915 — modern Android
- 430 × 932 — large iPhone

Responsive hardening includes:

- no application-level horizontal scroll;
- minimum 44px touch-target contract;
- mobile form controls at 16px to avoid accidental iOS input zoom;
- safe-area-aware bottom controls;
- reduced-motion support;
- long-name, large-KES-amount, long-intention and many-participant stress specimens;
- exact media-query checkpoints at 430, 412, 390 and 360px;
- layout rules that preserve reading order instead of shrinking desktop.

## Visual review routes
- `/preview/system-states`
- `/preview/responsive`

The responsive page is a certification lab, not a claim that a fixture can replace final physical-device review. Batch approval remains the human visual gate across the four target sizes.

## Product laws reinforced
- The Market leads. SecurePay supports.
- SecurePay is polite by default and commanding only when required.
- No dead end should leave the trader without direction.
- Reassurance must never upgrade financial truth.
- Responsive design preserves hierarchy and meaning; it is not desktop squeezed smaller.
