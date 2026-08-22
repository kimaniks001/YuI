# YUI v1 Play the Market — Build Fix 2

Repairs two build blockers found during local validation:

1. Restores `src/lib/explorerMode.ts`, required by `src/main.tsx`.
2. Fixes `AgreementDetail.tsx` so the workspace projection receives one authenticated participant confirmation-status record rather than the endpoint's array response.

This does not change the Explorer safety boundary, game rules, visual design, routes, or financial authority.

Apply over the current `~/Downloads/YuI`, then rerun typecheck/build.
