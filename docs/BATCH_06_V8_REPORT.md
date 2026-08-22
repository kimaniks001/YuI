# Batch 06 — V8 Money Rooms

## Scope
V8 gives SecurePay a single visual language for money without turning SecurePay into a bank dashboard or allowing the browser to manufacture financial truth.

## What changed
- Added `/preview/money`, a no-auth, no-write visual approval room covering:
  - eligible rail choice;
  - provider waiting;
  - confirmed payment intent;
  - backend Payment Ready;
  - settlement in progress;
  - settled;
  - failed/attention state;
  - Settlement Account explanation;
  - posted statement view.
- Added a visible money path that deliberately separates payment, Payment Ready and settlement stages.
- Applied Living SecurePay Mark states to money semantics instead of generic success/shield decoration.
- Refined canonical `/money` language around routing infrastructure, Settlement Account and backend readiness.
- Replaced canonical account-readiness success/caution decoration with the Living SecurePay Mark.
- Refined canonical `/market/statements` guidance so ledger entries are explicitly not presented as a spendable wallet balance.
- Renamed the trader account-menu destination from `Account setup` to `Money & settlement`.
- Added Money Rooms to the local Review Gallery.

## Authority preserved
No frontend computation or invention was added for funding authority, rail eligibility, quote amount, provider charge, platform fee, Payment Ready, release authority, settlement destination, settlement status, Review Reserve health, renewal date, balance or statement lines.

## Review route
- `/preview/money`

## Lock gate
Approve V8 when a trader can distinguish:
- no payment yet;
- a payment request waiting for provider truth;
- payment confirmation;
- Payment Ready;
- settlement in progress;
- settlement completed;
- a payment that needs attention;
- the KSNumber virtual account from the Settlement Account;
- a posted statement from a wallet balance.
