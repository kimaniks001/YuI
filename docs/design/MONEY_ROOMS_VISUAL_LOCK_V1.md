# SecurePay V8 — Money Rooms Visual Lock v1

## Governing idea
**Money should follow the agreement.**

The money UI explains authoritative agreement-bound facts. It does not collapse every financial event into one generic wallet or balance.

## Visual sequence
Where the backend supports the state, the customer may see the agreement move through:

1. eligible to fund / choose a rail;
2. payment request initiated;
3. payment intent confirmed;
4. Payment Ready evaluation;
5. release instruction / settlement in progress;
6. settled.

These are separate states. The UI must never visually imply that one automatically proves the next.

## Living SecurePay Mark
- **guiding** — eligible choice or explanation;
- **waiting** — provider or settlement result still pending;
- **success** — a specific backend fact is confirmed;
- **commanding success** — only for a genuinely important confirmed state such as backend Payment Ready;
- **caution** — the backend reports failure, exception or customer action required;
- **complete** — settlement execution is confirmed.

The official SecurePay symbol itself never changes. Status attaches to the mark.

## Customer language law
Every uncertain or important state should answer:
- What happened?
- What does it mean?
- What can I do next?

Provider-pending does not mean payment confirmed. Payment confirmed does not mean Payment Ready. Payment Ready does not mean released. A release instruction does not mean settled.

## Settlement Account law
The KSNumber virtual account and Settlement Account are distinct concepts:
- the KSNumber virtual account is SecurePay routing infrastructure;
- the Settlement Account is the verified customer destination for matured settlement;
- neither is presented as a combined spendable wallet balance.

The KES 100 activation/Settlement Account test is the holder's money and is separate from platform fees.

## Fees and rail choice
The browser must not calculate or remember commercial fees as financial truth. Eligible rails, provider charges, platform charges, quote expiry and total charge must come from the current backend contract/provider result.

## Statements
Statements show posted ledger records for one authorised KS identity at a time. Debit and credit are rendered as recorded. The UI does not convert statement entries into a combined Market balance or imply spendability.

## Preview boundary
`/preview/money` is a local fixture-only visual approval room. It performs no payment, quote, release, settlement, destination or ledger write.

## Canonical surfaces covered
- `/money`
- `/market/statements`
- agreement-bound funding / payment / release / settlement surfaces already governed by the Agreement Workspace and Operational projections.
