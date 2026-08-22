# MW-04 Completion Report — Store Owner Studio, Health & Personality

**Roadmap phase:** MW-04  
**Purpose:** make Store maintenance easy and expressive.  
**Exit target:** a trader can maintain a personal current Store without altering SecurePay truth semantics.  
**YUI base:** merged MW-03 at `1c0bed89a89acc87a4ac1bd8c4f1f95e8653da95`  
**SecurePayAPI authority inspected:** merged Store owner/public Store contracts on `main`.

## 1. Delivered

### My KS Store owner workspace

A protected `/store` route now provides an authenticated owner Studio using the merged self-scoped Store APIs.

The trader can:

- edit Store tagline, about text and location;
- create products and services;
- edit saved offers;
- set price and product quantity;
- choose type-appropriate availability;
- publish/unpublish an offer;
- confirm the current availability of one offer;
- check in all published offers;
- open the real public customer view at `/ks/{KSNumber}`.

All owner writes remain session-authenticated and self-scoped. YUI never supplies a target identity ID or arbitrary KS Number to a Store mutation.

### Natural-language maintenance

The Studio accepts ordinary trade language such as:

`Add cement at KES 850, stock 20`

YUI deterministically drafts editable Store fields from those words. Drafting does not save, publish, reserve or sell anything. The trader reviews the fields and explicitly saves them.

### Store Health

Store Health is implemented as a transparent maintenance/freshness guide derived only from backend Store timestamps already returned by the merged contract:

- profile `updatedAt`;
- published-offer `availabilityConfirmedAt`.

Current YUI thresholds:

- **Current:** oldest public information checked within 7 days;
- **Check-in due:** 8–21 days;
- **Needs attention:** older than 21 days or no usable freshness evidence;
- **Resting:** public offers are intentionally in resting/paused/unavailable/fully-booked postures.

The oldest published truth is used so one stale public offer cannot be hidden by a newer unrelated update.

**Store Health is not a trust score, reputation score, credit score, verification state, financial-strength measure or trader ranking.**

### Personality / atmosphere

The existing YUI Market atmosphere selector is available in the Store Studio as a device-local maintenance mood preview.

SecurePayAPI does not currently persist a public Store theme/personality preference. The Studio therefore explicitly tells the trader that the selected atmosphere is local-only and does not present it to customers as backend Store truth.

### Gallery/media

The current merged Store contract does not expose image/video persistence or object-storage authority.

MW-04 does not create fake browser-only gallery truth. The gallery/media area is present as an explicit retained capability gap and remains disabled until backend media support exists.

## 2. Backend authority reused

The merged SecurePayAPI Store contract provides the owner surfaces required for the operational Studio:

- `GET /api/v1/store/me/profile`
- `PUT /api/v1/store/me/profile`
- `GET /api/v1/store/me/offers`
- `POST /api/v1/store/me/offers`
- `PUT /api/v1/store/me/offers/{offerId}`
- `POST /api/v1/store/me/offers/{offerId}/availability-confirmation`

Public customer preview continues to use the merged published-only Store reads from MW-03.

No SecurePayAPI mutation is required in this YUI phase.

## 3. Competing backend implementation not adopted

SecurePayAPI PR #144 remains an older competing Store/Health implementation and was not merged into the canonical backend. Later merged Store PRs deliberately established the current Store contract without reviving that implementation.

MW-04 therefore does not depend on or silently import PR #144's alternative Store persistence or health authority.

## 4. Authority analysis

| Concern | Authority after MW-04 |
|---|---|
| Owner identity | SecurePayAPI authentication/session |
| Store ownership scope | SecurePayAPI self-scoped `/store/me` contract |
| Profile persistence | SecurePayAPI |
| Offer persistence | SecurePayAPI |
| Publication state | SecurePayAPI |
| Availability state | SecurePayAPI |
| Availability confirmation timestamp | SecurePayAPI |
| Store Health label | YUI deterministic freshness guidance from backend timestamps |
| Public customer Store | SecurePayAPI public Store contract |
| Natural-language offer draft | YUI non-authoritative editable draft |
| Studio atmosphere | device-local YUI preference only |
| Public Store theme/personality | retained backend gap; not asserted |
| Store media/gallery | retained backend gap; not asserted |
| Reservation / sale / agreement | not created by Store Studio |
| Payment / Payment Ready / release / settlement | SecurePayAPI financial authority only |

## 5. Negative / misuse cases

MW-04 explicitly protects against:

1. editing another trader's Store by client-supplied KS Number or identity ID;
2. natural-language input silently publishing an offer;
3. publishing being represented as reservation or sale;
4. Store check-in being represented as stock reservation or customer commitment;
5. Store Health becoming a hidden trust/reputation/credit score;
6. a recently updated profile hiding stale published-offer availability;
7. a local atmosphere preference masquerading as a persisted public Store theme;
8. browser-only image selection masquerading as saved public Store media;
9. Store ownership implying payer, release or settlement authority;
10. Store maintenance creating Payment Ready or other financial truth.

## 6. Responsive / mobile treatment

The Studio keeps the accepted YUI mobile posture:

- primary trader bottom navigation remains four items rather than adding another crowded slot;
- My KS Store is reachable from the account menu;
- profile and offer editors collapse to one column on narrow screens;
- owner actions retain minimum touch heights;
- offer cards collapse from two columns to one;
- customer preview remains directly accessible;
- no maintenance action depends on hover.

## 7. Retained backend gaps

### MW04-GAP-01 — Store media persistence

No canonical merged backend contract currently stores/serves Store gallery images or video. The YUI gallery remains an explicit disabled gap.

### MW04-GAP-02 — public Store theme/personality persistence

No canonical merged backend contract currently persists a Store-specific public visual theme/personality. Existing YUI atmosphere remains device-local and cosmetic only.

These gaps do not block the core phase exit because the trader can maintain the authoritative profile, offer catalogue and availability today, while unsupported decorative surfaces remain honestly unavailable.

## 8. Validation

A focused `check:store-owner` certification validates:

- protected owner route;
- self-scoped owner APIs;
- profile/offer writes;
- availability confirmation;
- review-before-save natural-language drafting;
- freshness-only Health semantics and thresholds;
- customer preview;
- publication/reservation boundary;
- explicit media/theme gaps;
- responsive/touch treatment;
- separation from payment authority.

The guard is part of the repository's hard `npm run certify` chain alongside the three-world, Trainer, public Store, typecheck, production build, route-integrity, canonical-runtime and accepted visual guards.

## 9. Files in scope

- `src/api/storeTypes.ts`
- `src/api/storeEndpoints.ts`
- `src/pages/StoreOwnerStudio.tsx`
- `src/components/trader/TraderShell.tsx`
- `src/main.tsx`
- `scripts/check-store-owner-studio.mjs`
- `package.json`
- this report

## 10. Exit assessment

The trader now has a real **My KS Store** operating room for keeping profile, products/services and availability current against SecurePayAPI truth, with a truthful customer preview and an explainable freshness indicator.

**MW-04 exit condition:** implemented with explicit non-blocking media/theme backend gaps; final closure requires green PR certification and merge.
