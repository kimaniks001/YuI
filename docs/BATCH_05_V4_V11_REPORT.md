# Batch 05 — V4 Invitation & Joining + V11 KS Profile & Digital Store

## Scope
This batch intentionally pairs the two sides of meeting another trader:
- V4: how a person enters somebody else's agreement;
- V11: how a person sees a trader's Market address and begins a new trade from what is on display.

## What changed
- Added `/preview/joining` with invitation, signed-in, joined, confirmed, group and expired states.
- Made the V4 review explicitly separate viewing, identity, joining, participant confirmation and money authority.
- Added `/preview/store` with public and owner views, product/service filtering, local-only owner-edit interactions and a Digital Store → agreement-creation handoff.
- Store offer actions persist a `CreationIntent` and enter `/preview/create`; they do not create an agreement or financial state.
- Updated the canonical `SecureLinkJoin` presentation to use the Living SecurePay Mark as the invitation guide/caution/success language while preserving all existing backend calls and idempotency behavior.
- Updated the canonical public Group SecureLink explanation to use the Living Mark instead of generic SecurePay shields/check decorations.
- Updated canonical `/ks/:ksId` presentation and added an honest Digital Store room explaining that the current public lookup does not expose store inventory.
- Added both Batch 05 rooms to the local Review Gallery.

## Authority preserved
No live Digital Store inventory API was invented. No public inviter identity was invented. No frontend joining, confirmation, contribution, funding, Payment Ready, release, settlement, verification or availability authority was added.

## Review routes
- `/preview/joining`
- `/preview/store`

## Lock gate
Approve V4 when the invitee can understand role, trade, amount, current state and next action before acting, and when viewing / joining / confirming remain visibly distinct.

Approve V11 when a public visitor understands "who this trader is → what they offer → start an agreement" and the owner view feels like arranging a Market display rather than configuring a database.
