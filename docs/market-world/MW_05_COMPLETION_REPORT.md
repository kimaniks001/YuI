# MW-05 Completion Report — Store SecureLinks, Sharing & QR

**Roadmap phase:** MW-05  
**Purpose:** turn every published Store offer into an easy proposed-trade entry point.  
**Exit target:** scan/share begins a proposed trade, never reservation/sale/payment.  
**YUI base:** merged MW-04 at `3b314fbf2412725fabf6e45091c7d9a4cbb356d7`  
**SecurePayAPI authority inspected:** merged public Store exact-offer read on `main`.

## 1. Delivered

### Exact public offer deep links

Every published Store offer can be addressed as:

`/ks/{KSNumber}/offers/{offerId}`

The page resolves the exact offer using the merged SecurePayAPI public Store offer read. It validates both the canonical KS Number and UUID-shaped offer ID, then verifies that the returned active Store/offer exactly matches the requested route.

### Exact Store truth

The shared offer page displays only backend-provided public Store facts:

- seller display name;
- seller KS Number;
- offer title/description;
- product/service kind;
- exact listed price when present;
- product quantity when present;
- current availability state.

No share URL creates or mutates Store, agreement or financial state.

### Proposed SecureLink entry

`Start SecureLink proposal` carries a `CreationIntent` into the real `/create` journey.

The proposed context preserves:

- exact backend-listed money where present;
- seller KS Number;
- product/service identity;
- product/service-specific conditions to clarify.

Participant roles remain explicitly **to confirm**. Store owner is not automatically payer, recipient or release authority merely because the offer came from their Store.

### Copy and WhatsApp

The public offer page supports:

- Copy link using the browser clipboard;
- WhatsApp sharing through a user-initiated share URL.

WhatsApp receives the already-public offer URL and short descriptive text only after the user explicitly selects the action.

### Local QR

MW-05 introduces a dependency-free browser-side QR encoder and SVG renderer.

Characteristics:

- byte-mode QR;
- error-correction level L;
- supported QR versions 1–9;
- Reed-Solomon error-correction generation inside YUI;
- four-module quiet zone;
- crisp SVG module rendering;
- no network call, external QR image URL or third-party QR service.

The public Store URL therefore stays on-device during QR generation.

### Printable QR

The shared-offer page includes a print-specific card containing:

- SecurePay mark;
- offer title;
- seller name and KS Number;
- listed price where present;
- local QR;
- plain-text URL;
- explicit notice that scanning does not reserve, buy or pay.

Print CSS removes interactive application chrome and leaves the printable offer card.

### Owner sharing studio

Signed-in Store owners can open protected `/store/share` from the account menu.

The room:

- loads the owner Store through the authenticated self-scoped offer API;
- exposes **published offers only**;
- generates the exact public deep link for each offer;
- hands the trader into the public offer's Share / QR room.

Private/unpublished offers are not exposed through the sharing studio.

## 2. Backend authority reused

SecurePayAPI already exposes:

`GET /api/v1/stores/{canonicalKsNumber}/offers/{offerId}`

The endpoint is public read-only and resolves only an exact published offer belonging to an active Store.

No SecurePayAPI mutation is required for MW-05.

## 3. Authority analysis

| Concern | Authority after MW-05 |
|---|---|
| Store identity | SecurePayAPI |
| Published offer existence/content | SecurePayAPI |
| Listed price/quantity | SecurePayAPI |
| Availability | SecurePayAPI |
| Public offer URL | YUI deterministic route over backend IDs |
| QR representation | YUI local rendering of that public URL |
| WhatsApp distribution | user-initiated external share of public URL |
| Proposal draft | YUI non-authoritative CreationIntent |
| Buyer/payer role | must be confirmed in real agreement |
| Seller/recipient role | must be confirmed in real agreement |
| Reservation / sale | not created by Store link/share/scan |
| Agreement consent | SecurePayAPI agreement lifecycle |
| Payment / Payment Ready / release / settlement | SecurePayAPI financial authority |

## 4. Negative / misuse cases

MW-05 explicitly protects against:

1. sharing an unpublished offer through the owner sharing room;
2. a shared route resolving a different KS Number or offer ID than requested;
3. QR generation sending Store URLs to a third-party QR service;
4. scan/open being presented as stock reservation;
5. scan/open being presented as sale acceptance;
6. scan/open creating an agreement;
7. share/scan initiating payment;
8. Store owner being silently assigned payer/recipient/release roles;
9. a browser-calculated price replacing the exact backend-listed price;
10. a printed QR implying that scanning buys or pays;
11. WhatsApp sharing happening without an explicit user action;
12. QR/share pages invoking payment-initiation or Payment Ready APIs.

## 5. Responsive and print treatment

- share actions retain touch-sized controls;
- offer/QR columns stack on narrow screens;
- QR SVG scales to its container without raster blurring;
- printable QR card is separate from application chrome;
- public URL is printed as fallback alongside the QR;
- mobile bottom navigation remains unchanged rather than gaining a crowded fifth Store-share item.

## 6. Validation

`check:store-share` is included in the hard `npm run certify` chain and validates:

- canonical exact-offer route;
- protected owner sharing room;
- exact public backend read;
- published-only owner sharing;
- exact KS/offer URL formation;
- route/response identity matching;
- exact money preservation;
- seller KS proposal context;
- participant-role re-confirmation;
- non-reservation/sale/payment boundary;
- Copy, WhatsApp and print actions;
- local/no-network QR implementation;
- QR quiet zone/crisp rendering;
- printed safety notice.

Final closure requires green PR CI and merge.

## 7. Files in scope

- `src/lib/localQr.ts`
- `src/components/LocalQrCode.tsx`
- `src/pages/StoreOfferDetail.tsx`
- `src/pages/StoreSharingStudio.tsx`
- `src/components/trader/TraderShell.tsx`
- `src/main.tsx`
- `src/store-sharing.css`
- `scripts/check-store-sharing.mjs`
- `package.json`
- this report

## 8. Exit assessment

A trader can now share or print one exact published Store offer. A customer can scan/open it, see SecurePayAPI Store truth and choose to start a real SecureLink proposal carrying the listed amount and seller KS context.

**The share/scan path remains read-only until the customer deliberately enters the real agreement-creation journey.**

**MW-05 exit condition:** implemented; final closure requires green full certification and merge.
