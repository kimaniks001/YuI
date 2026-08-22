# Bolt preservation report

The clean YuI rebuild does not reinterpret the approved Bolt convergence work from memory. It uses the saved Bolt source and design pack as the baseline.

## Directly preserved canonical code

The following production files are byte-for-byte identical to the saved Bolt source used for this rebuild:

- `src/pages/MyMarket.tsx`
- `src/pages/MarketFlows.tsx`
- `src/pages/MarketStatements.tsx`
- `src/pages/DeveloperJourney.tsx`
- `src/pages/SecurePayHome.tsx`
- `src/pages/TraderAgreements.tsx`
- `src/pages/TraderActionCentre.tsx`
- `src/pages/MoneySpace.tsx`
- `src/pages/TraderCommunity.tsx`
- `src/pages/TraderSettings.tsx`
- `src/pages/AgreementDetailWorkspace.tsx`
- `src/pages/AgreementDetail.tsx`
- `src/pages/SecureLinkJoin.tsx`
- `src/pages/KSActivation.tsx`
- `src/pages/Signup.tsx`
- `src/lib/creationEngine.ts`
- `src/lib/creationFacts.ts`
- `src/lib/creationIntent.ts`
- `src/lib/creationPersistence.ts`
- `src/lib/agreementTopology.ts`
- `src/lib/marketProjection.ts`
- `src/lib/workspaceProjection.ts`
- `src/lib/operationalProjection.ts`
- `src/lib/developerJourney.ts`

## Signed-out Home

`src/pages/Home.tsx` is the approved Bolt `HomePreview.tsx` promoted to the real `/` route. The intentional changes are only runtime corrections:

- Sign in goes to `/signin`, not the create route.
- old preview footer links are removed from the production Home.
- Home creation continues into `/create/journey` while preserving the selected intention.

The interaction, Trade/Life intent families, illustrative agreement, responsive layout and Bolt visual language are preserved.

## Create journey

`CreateJourney.tsx` differs from the saved Bolt file only where old `/preview/home` links were converted to the production `/` Home. The creation engine and four-topology journey remain the Bolt convergence implementation.

## Public Group SecureLink

Two stale legacy destinations were corrected without changing the visual page:

- old `/collection-link` education link → current `/situations` guidance;
- sign-in action `/` → `/signin`.

## Preview work restored

The rebuild restores the fixture-only Bolt review work that was lost during the earlier aggressive cleanup:

- `PreviewWorkspacePage.tsx`
- `PreviewOperationalPage.tsx`
- `PreviewMarketPage.tsx`
- `PreviewDeveloperJourney.tsx`
- `workspaceFixtures.ts`
- `operationalFixtures.ts`

These are local visual-review surfaces, not production financial authority.

## Design references retained

`docs/visual-reference/` contains the saved Bolt direction note plus the signed-out desktop/mobile masters and the two reference boards used to guide the approved Home.

## Clean-boundary changes made by the rebuild

These are structural repairs, not redesigns:

- one canonical route tree;
- router-level authentication for signed-in pages;
- safe return to the originally requested page after OTP sign-in;
- no Supabase runtime/environment dependency in canonical YuI;
- no retired UI families in the repository;
- local-only visual review gallery;
- automated route, legacy-UI and canonical-runtime guards.
