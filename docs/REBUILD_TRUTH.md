# YuI — SecurePay clean rebuild truth

This repository is the clean SecurePay frontend rebuild. It is deliberately based on the approved Bolt-era visual and journey work while removing the legacy presentation families that accumulated in the older UI repository.

## Product law retained

- SecurePay: **The Market**.
- Signed-out home: show **possibility**.
- Signed-in experience: create **fluency in trade**.
- My Market: **Everything you trade, in one place.**
- Guiding principle: **Money should follow the agreement.**
- Intention comes before product terminology.
- Creator is not automatically payer.
- Frontend never invents Payment Ready, settlement, release authority, quorum, verification, fee truth, or balance truth.
- SecurePay API is the production authority boundary.

## Canonical production journeys

| Journey | Route | Implementation |
| --- | --- | --- |
| Signed-out possibility | `/` | `Home.tsx` (approved Bolt HomePreview promoted to canonical Home) |
| Sign in | `/signin` | `SignIn.tsx` |
| Signup / KS identity | `/signup` | `Signup.tsx` |
| Activation / verification | `/activate` | `KSActivation.tsx` |
| Agreement creation | `/create`, `/create/journey` | `CreateJourney.tsx` |
| Invitation join | `/securelink/join/:token` | `SecureLinkJoin.tsx` |
| Agreement workspace | `/agreements/:agreementId` | `AgreementDetailWorkspace.tsx` |
| My Market | `/market` | `MyMarket.tsx` |
| Money flows | `/market/flows` | `MarketFlows.tsx` |
| Statements | `/market/statements` | `MarketStatements.tsx` |
| Signed-in home | `/dashboard` | `SecurePayHome.tsx` |
| Agreements | `/agreements` | `TraderAgreements.tsx` |
| Actions | `/actions` | `TraderActionCentre.tsx` |
| Money/account setup | `/money` | `MoneySpace.tsx` |
| Community | `/community` | `TraderCommunity.tsx` |
| Settings | `/settings` | `TraderSettings.tsx` |
| Developer journey | `/developers` | `DeveloperJourney.tsx` |
| Public Group SecureLink | `/group/:slug` | `PublicGroupSecureLink.tsx` |

## What from Bolt was deliberately preserved

- exact approved signed-out Home interaction and visual language;
- Trade + Life Around the Trade intent families;
- natural-language intent persistence into the shared creation engine;
- four topology creation model;
- agreement workspace projection;
- operational lifecycle projection;
- My Market attention-first projection;
- developer business-intent journey;
- warm cream / SecurePay green / orange / charcoal visual system;
- fixture-only visual review surfaces from the Bolt convergence work.

## What was deliberately not restored

Old builders, collection dashboards, duplicate SecureLink screens, Supabase/Bolt trader builders, old payment/dispute/mediation presentation, admin/RestOrder UI, and other replaced presentation families are not part of this clean frontend.

## Authentication rule

Production signed-in routes are guarded at the router boundary. When a signed-out trader opens a protected route, SecurePay sends them to `/signin` with a safe internal `returnTo` value. After OTP succeeds, they return to the page they originally requested.

`CreateJourney` remains a soft-auth journey because the customer's stated intention must survive the authentication handoff.

## Local visual approval room

During `npm run dev` only:

- `/review` — review gallery
- `/preview/home` — exact signed-out Home
- `/preview/create` — no-write creation fixture
- `/preview/market` — fixture-only My Market
- `/preview/workspace` — fixture-only agreement workspace across topologies/states
- `/preview/operational` — fixture-only operational lifecycle
- `/preview/market?view=developers` — fixture-only developer journey

These routes are not registered in production builds.
