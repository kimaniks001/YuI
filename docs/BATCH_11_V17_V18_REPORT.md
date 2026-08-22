# Batch 11 — V17 Market Atmosphere + V18 Full Visual Certification

## V17 — Market Atmosphere
Batch 11 implements four stable atmospheres: Market Day, Green Market, Town Market and Evening Market. They change canvas/background atmosphere only and do not override SecurePay green/orange, Living Mark states, status meaning, product hierarchy or backend authority.

A device-local Market Atmosphere setting is exposed separately from backend settings.

The real signed-in Market gains a short opening ritual after a successful authenticated entry. Two participant points meet, an agreement path becomes visible, and the official Living SecurePay Mark appears as guide. It is skippable and reduced-motion aware. Its display preference is device-local, scoped by the trader's KS identity when available, and may replay after a long return; this preference stores no authentication or financial state and does not alter the approved Market layout after dismissal.

Review: `/preview/themes`.

## V18 — Full Visual Certification
A final certification room maps all 11 visual batches and 19 phases and links back to review surfaces. Review: `/preview/certification`.

This package is a **visual certification candidate**, not an automatic production certification. Final lock requires Batch 11 human approval, successful local `npm run certify`, responsive review on the four certified phone targets, and no authority/truth contradiction discovered during that gate.

## Guards
- `check:batch11-visual` validates theme/opening/final-matrix invariants.
- `check:visual-certification` hash-locks official brand masters and checks all batch reports, design locks and final review-route coverage.
