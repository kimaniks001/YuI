# SecurePay V11 — KS Profile & Digital Store Visual Lock v1

## Product model
**KSNumber = the trader's address in the Market.**
**Digital Store = what that trader has on display from that address.**

The Digital Store is not a separate marketplace identity and SecurePay is not the seller. The trader owns the display; SecurePay supplies the agreement infrastructure around the trade.

## Public view must answer
- Who is this KS identity?
- What do they publicly offer?
- What does the offer say about price / scope?
- Where do they operate, if this is public data?
- How do I begin an agreement with them?

## Owner view must answer
- What am I currently showing publicly?
- Can I add / edit / hide an offer?
- What wording will a visitor see?
- How does a visitor move from an offer into agreement creation?

## Agreement handoff
Selecting an offer creates only a customer **intention** for the creation journey. It does not create an agreement, payment request, availability promise, seller acceptance, funding authority or money state.

The creation journey may carry forward the item / service, display price wording and trader identity only as input facts to be confirmed or corrected.

## Truth boundary
The current canonical KS Profile backend response does not expose Digital Store inventory. The live `/ks/:ksId` page must therefore not invent store items, availability, prices or reputation. It may reserve and explain the Digital Store room until an authoritative backend contract exists.

`/preview/store` is fixture-only visual review and is labelled as such.

## Visual law
- The trader is the hero; SecurePay is the quiet light around the trade.
- Product/service story icons describe the offer.
- The SecurePay mark communicates SecurePay posture, not the product category.
- Public view is inviting and uncluttered.
- Owner view feels like arranging a market display, not administering a database.
