# MW-03 Completion Report — Public KS Digital Store

**Roadmap phase:** MW-03  
**Purpose:** make the KS Store the universal Market address.  
**Exit target:** “Go look at my KS” gives a useful truthful Market presence.  
**YUI base:** merged MW-02 at `96be78194629a29197aa9a185a620ddea078b2c2`  
**SecurePayAPI authority inspected:** `main` public Store contract at `contracts/openapi/market-store-v1.yaml`.

## 1. Delivered

### Authoritative public Store read

`/ks/:ksId` now uses the merged SecurePayAPI public Store authority rather than the older public-identity-only lookup.

The page reads:

- canonical KS Number;
- display name;
- identity type;
- active identity status;
- public Store tagline/about/location;
- explicitly published products and services;
- backend-provided price;
- backend-provided product quantity where present;
- availability state;
- availability confirmation timestamp.

### Truthful Store gaps

The current public Store contract does not publish a gallery/media collection, completed-work history, ratings, reputation score or verification result. MW-03 therefore does not invent them.

The Store explicitly states the completed-work/history and gallery gaps instead of filling them with fixture/browser data.

### Availability language

Product and service availability remains descriptive Store state only. The UI preserves the backend states including AVAILABLE, LOW_AVAILABILITY, NEEDS_CONFIRMATION, UNAVAILABLE, PAUSED, TAKING_WORK, LIMITED, FULLY_BOOKED and RESTING.

The customer is reminded that listed availability may change before agreement confirmation.

### Trade entry

A Store or Store offer may begin an agreement proposal by carrying a `CreationIntent` into `/create`.

The handoff does not create:

- reservation;
- sale;
- agreement acceptance;
- payer assignment;
- payment initiation;
- Payment Ready;
- release;
- settlement;
- referral reward.

The seller KS Number is included in the proposed counterparty context but the real agreement flow must still establish roles, consent and authoritative state.

## 2. Backend contract reused

SecurePayAPI already exposes:

- `GET /api/v1/stores/{canonicalKsNumber}`
- `GET /api/v1/stores/{canonicalKsNumber}/offers/{offerId}`

Those reads expose active Store identity and published Store content only. No backend mutation was required for MW-03.

## 3. Authority analysis

| Concern | Authority after MW-03 |
|---|---|
| KS identity/status | SecurePayAPI |
| Public profile | SecurePayAPI Store contract |
| Published offers | SecurePayAPI Store contract |
| Offer price/quantity | SecurePayAPI Store contract |
| Availability state/confirmation | SecurePayAPI Store contract |
| Gallery/media | Not available in current public contract; not invented |
| Completed-work/reputation | Not available in current public contract; not invented |
| Verification | Not asserted by Store UI |
| Proposal draft | YUI non-authoritative CreationIntent |
| Agreement/participant roles | SecurePayAPI agreement authority |
| Payment / Payment Ready / release / settlement | SecurePayAPI financial authority |

## 4. Negative / misuse cases

MW-03 explicitly protects against:

1. invalid/non-canonical KS route values being sent as trusted Store identity;
2. mismatched or inactive Store responses being displayed as the requested trader;
3. unpublished browser-side offers being shown as public Store truth;
4. a listed product being presented as reserved or sold;
5. availability being presented as a guarantee;
6. Store selection directly initiating payment;
7. Store owner automatically becoming payer;
8. Store selection implying agreement consent;
9. invented verification, rating, reputation, portfolio or gallery data;
10. Store UI claiming Payment Ready, release or settlement authority.

## 5. Responsive/mobile treatment

The public Store uses the accepted responsive YUI primitives:

- stacked identity/header treatment on narrow screens;
- offer cards collapse to one column before desktop two-column layout;
- minimum-height proposal actions remain touch-friendly;
- long descriptions and Store about text wrap without horizontal application scroll;
- availability/price/quantity remain visible without hover-only disclosure.

## 6. Validation

A focused `check:store` certification validates the public Store contract boundary and is included in the repository’s hard `npm run certify` chain.

The phase may merge only after CI passes:

1. three-world boundary guard;
2. Trainer guard;
3. public Store guard;
4. TypeScript typecheck;
5. production build;
6. route integrity;
7. canonical runtime isolation;
8. accepted visual and brand guards.

## 7. Files in scope

- `src/api/storeEndpoints.ts`
- `src/api/storeTypes.ts`
- `src/pages/KSProfile.tsx`
- `scripts/check-public-store.mjs`
- `package.json`
- this report

## 8. Exit assessment

The user-facing phrase **“Go look at my KS”** now resolves to a useful Real Market presence backed by SecurePayAPI Store truth: who the trader is, what they have publicly on display, the currently reported availability and a safe route to begin a proposed trade.

**MW-03 exit condition:** implemented; final closure requires green PR certification and merge.
