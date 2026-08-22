# YUI v1 Handover — From Explorer to Production

## What YUI v1 now is

A complete, navigable SecurePay Market in which every major approved visual
room can be experienced without authentication. It is intentionally safe for
training, demonstrations, education and final product walkthroughs.

## What must happen before production mode

1. Baseline this exact YUI v1 source in GitHub.
2. Audit SecurePayAPI against every canonical route in the path matrix.
3. Connect real authentication first and preserve the soft-intent return path.
4. Wire current-user agreement/action projections.
5. Wire Agreement Workspace from backend versions, roles, obligations,
   conditions, evidence and activity.
6. Wire money rooms only from ledger/payment/readiness/settlement authority.
7. Wire SecureFlow/Group SecureFlow from backend allocation/governance truth.
8. Wire KS Profile + Digital Store inventory.
9. Wire Review/Recovery from real review and exception state.
10. Wire Developer Market to sandbox/application/webhook contracts.
11. Run production-like end-to-end certification.
12. Only then set `VITE_SECUREPAY_EXPLORER_MODE=false` in the production build.

## Recommended permanent split

Keep two builds from the same UI source:

- **Production SecurePay:** authenticated, API-backed, financially authoritative
  only through SecurePayAPI.
- **SecurePay Explorer:** fixtures, no authentication, no live API, no money;
  used for demos, training and education.

This avoids losing the safe Market that has been built for explaining SecurePay
while keeping production authority uncompromised.
