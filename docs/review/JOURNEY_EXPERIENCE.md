# SecurePay Journey Experience — Local Review

This local-development review flow exists so the SecurePay team can experience the product journeys before live API integration.

## Entry points

- `/preview/home` — start from the approved signed-out Market and type a real intention.
- `/preview/journeys` — choose one of four canonical money-flow stories.
- `/preview/create` — full creation-question engine in preview mode; no login and no backend writes.
- `/preview/workspace?fixture=...` — fixture-backed agreement workspace.
- `/preview/operational?fixture=...` — fixture-backed operational lifecycle.

## Four canonical stories

1. Buy sofas and arrange delivery — one payer to one recipient / SecureLink shape.
2. Family support — many contributors to one purpose / Group SecureLink shape.
3. Renovation with several trades — one payer to many recipients / SecureFlow shape.
4. School trip with parents and suppliers — many contributors to many recipients / Group SecureFlow shape.

## Safety boundary

Preview mode may interpret and display illustrative states, but it must never claim backend financial truth. It performs no live identity, payment, Payment Ready, release, settlement, governance or agreement writes.

The live UI remains an API consumer. Backend policy is authoritative for all financial and lifecycle truth.
