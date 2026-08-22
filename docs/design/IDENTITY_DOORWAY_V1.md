# SecurePay Identity Doorway v1

## Purpose
Identity should feel like entering the Market as yourself, not completing an institutional form.

## Visual hierarchy
1. Trader identity
2. Current identity action
3. Meaning of the action
4. SecurePay guidance

## Living Mark behaviour
- Resting: normal identity entry.
- Guiding: OTP / verification step.
- Complete: KSNumber identity created.
- Caution: activation or verification cannot safely continue.

The official SecurePay symbol remains unchanged. Status attaches to it; the symbol is never redrawn.

## Language rules
- KSNumber is SecurePay identity, not a bank account.
- OTP confirms access to the chosen contact channel; it does not activate financial features.
- Account creation does not move money.
- Activation amounts must explain their separate purposes.
- Backend confirmation remains authoritative for identity, settlement-account verification, reserve, subscription and activation truth.

## Review routes
- `/preview/signin`
- `/preview/signup`
- `/preview/activate`

Preview flows must not write authentication, activation or financial truth to the backend.
