# SecurePay Home — Mobile First Interaction v5

Status: approved direction implemented for review
Date: 21 August 2026

## Product intent

On mobile, the trader must see three things in the first interaction:

1. the place to type naturally;
2. visible evidence that SecurePay is interpreting the words as they are typed; and
3. the two main Market families — Work & Trade and Life & Support.

The full SecurePay-understood agreement demo must remain available, but it must not sit between the typing experience and the Market-family choices.

## Implemented mobile order

Welcome -> intention input -> live interpretation strip -> Work & Trade / Life & Support switch -> active quick paths -> full SecurePay-understood demo -> deeper SecurePay journey.

## Live-demo behaviour

- The sample clears on first focus.
- Purpose, amount and next step react as the trader types.
- Lightweight client-side demo inference recognizes common buying, selling, service, family/support and delivery language.
- This is illustrative guidance only; it does not create financial truth or authoritative agreement state.
- Full detail remains in the lower SecurePay-understood card and can continue into the canonical creation journey.

## Mobile family behaviour

- Work & Trade and Life & Support are both visible at all times as the two primary tabs.
- Only the selected family's quick paths expand below the tabs to preserve vertical space.
- Selecting a quick path updates the same demo and typing state.

## Motion rule

Small reactions only: settle, pulse, grow, move. No continuous bouncing. `prefers-reduced-motion` remains authoritative.
