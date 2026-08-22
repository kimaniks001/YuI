# SecurePay V7 — Agreement Workspace Visual Lock v1

## Purpose
The Agreement Workspace is the trader's working room for one agreement. It is not a dashboard of unrelated backend objects. People, obligations, evidence, milestones, money state, confirmations, review activity and next actions belong to one visible agreement story.

## Governing sentence
**One agreement. One working room. Everything tied to the trade stays together.**

The page must answer, in this order:
1. What happened?
2. What does it mean?
3. What can I do next?
4. What must happen under the agreement?
5. Who is responsible for what?
6. What is the backend-reported money state?
7. What proof and activity belong to the agreement record?

## Visual hierarchy
1. Agreement title and public reference
2. Human status and the trader's role
3. Primary next action
4. Attention requiring the trader
5. Agreement thread / milestones
6. Obligations and evidence
7. Money state
8. People and roles
9. Activity / record

Secondary detail must not compete with the next action.

## Role law
**Creator / proposer is not automatically the payer.**
Roles are shown explicitly. The UI may translate backend roles into customer language, but it may not infer payment authority from creation or ownership of the screen.

## Living SecurePay Mark in the workspace
The official SecurePay symbol remains unchanged.
- resting — orientation / normal record
- guiding — active agreement progress
- waiting — nothing wrong; another condition or person may be pending
- caution — the agreement needs attention
- complete — the specific backend-supported state is complete

The mark never manufactures agreement, payment, release or settlement truth.

## Money law
The workspace may display only backend-authoritative money facts. Agreement amount, expected amount, confirmed contributions, Payment Ready, release and settlement must remain distinct states.

A green visual treatment does not create Payment Ready. Payment Ready is displayed only when the backend projection says `paymentReady=true`.

## Evidence law
Evidence belongs to an obligation or review record. The UI must not invent evidence records for visual completeness. Preview mode therefore explains where evidence appears but does not fabricate an evidence item unless the fixture explicitly contains one.

## Room energy
- attention: warmer orange edge; decisive but not alarming
- active: green guidance and visible progress
- waiting: lower-energy cream/green; communicates that waiting is a valid state
- complete: settled; movement stops
- review: attentive and fair; never courtroom theatre

## Responsive law
Desktop may use a two-column working room: work/story in the main column and money/people in a sticky supporting column. Mobile becomes one linear story without hiding any authority or meaning.

Primary touch targets remain at least 44 px. The section rail may scroll horizontally on mobile.

## Canonical vs preview
`/preview/workspace` is fixture-backed, makes no backend calls and performs no writes.
`/agreements/:agreementId` remains the canonical authenticated workspace and retains all existing backend-owned controls and authority.

V7 presentation changes must not alter agreement, funding, Payment Ready, SecureFlow, release, settlement, governance, review or evidence authority.
