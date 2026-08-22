# SecurePay YUI v1 — Explorer Baseline

**Version:** 1.0.0  
**Mode:** Explorer / Training / Education  
**Authentication:** intentionally not required  
**Live SecurePay API:** blocked by the frontend boundary  
**Real-money actions:** disabled

## Purpose

YUI v1 is the complete SecurePay experience baseline. It ties the approved
visual batches together so a trader, trainer, partner, developer or reviewer can
walk the Market end to end before the certified authentication and live-money
layer is connected.

This is not a fake production environment. It is a deliberate experience mode:

- public Home remains the approved Market entrance;
- canonical signed-in URLs open fixture-backed rooms;
- creation, joining, money, review, SecureFlow and developer journeys can be
  explored without login;
- all SecurePay API calls are blocked while Explorer mode is enabled;
- every money/action feature flag is forced off;
- a persistent **YUI v1 Explorer** dock exposes the full Market map.

## Start

```bash
npm run dev
```

Then open:

- `/` — Market entrance
- `/explore` — complete journey map
- `/dashboard` — Trader Home
- `/market` — My Market
- `/agreements/demo` — Agreement Workspace
- `/money` — Money Rooms
- `/market/flows` — SecureFlow / Group SecureFlow
- `/community` — Circle & Growth
- `/explore/review` — Review & Recovery
- `/ks/KS2145` — Digital Store
- `/developers` — Developer Market
- `/help` — Help / Knowledge

## Safety boundary

Explorer mode is controlled by:

```env
VITE_SECUREPAY_EXPLORER_MODE=true
```

While true:

1. canonical training routes use fixture-backed experience pages;
2. `securePayFetch()` refuses live API calls;
3. frontend money-action flags are forced false;
4. no authentication token is required to explore the Market.

Do not turn Explorer mode off simply to make a page work. The future production
switch happens only after real authentication/API integration and end-to-end
certification are complete.

## Future production split

The preferred future arrangement is:

- **SecurePay Production:** `VITE_SECUREPAY_EXPLORER_MODE=false`, certified auth,
  backend truth, approved rails and controlled live-money capabilities.
- **SecurePay Training:** Explorer mode remains true, with the same visual/journey
  language but no authority to move money or create production state.

That lets SecurePay keep this version permanently useful for onboarding,
demonstrations, staff training, education and partner walkthroughs.

## Play the Market — family test extension

YUI v1 Explorer now includes `/play`, an Explorer-only learning game with selectable Demo Capital, levels, Kenyan projects, fair-trader scoring, local leaderboards and pass-and-play multiplayer.

- Solo: free.
- Two traders: free.
- 3–6 traders: Market Pass concept, KES 100/month; Explorer uses a test unlock and collects no payment.
- Multiplayer before API integration is intentionally one-device pass-and-play. Remote identity/room authority belongs to the later real API/session layer.
- Game state is stored only in browser localStorage and has no monetary value.

Tester guide: `docs/PLAY_THE_MARKET_FAMILY_TEST.md`.
