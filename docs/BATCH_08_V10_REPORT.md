# Batch 8 — V10 Reviews, Issues & Recovery

## Purpose

Batch 8 gives SecurePay one coherent visual language for disagreement, clarification, evidence, formal Agreement Review, payment failure and settlement exceptions.

The governing law is: **problems need direction, not panic**.

## Visual model

Agreement Review is presented as a resolution room, not a courtroom. Each state answers:

1. What happened?
2. What does it mean?
3. What can I do next?

SecurePay coordinates the process and record. The interface does not portray SecurePay as a judge, guarantor or adjudicator.

## Review states covered

- Issue raised
- Waiting for participant
- Evidence collection
- Under review
- Decision pending
- Concluded
- Expired

The preview uses the Living SecurePay Mark to vary posture without modifying the official symbol.

## Recovery states covered

- Payment failed
- Provider/customer action required
- Settlement held exception
- Compensating action recorded

The UI preserves the following truth boundaries:

- payment failed != payment confirmed
- payment confirmed != Payment Ready
- release requested != settled
- compensated != automatically settled

## Evidence treatment

Evidence is visually attached to the exact review question and is described as context, never as automatic proof that a participant is right.

## Backend authority

The canonical Agreement Detail already consumes the Agreement Review APIs for open/list/detail, acknowledgement, structured response, evidence submission and escalation. Batch 8 does not replace those API contracts with fixtures. `/preview/review-recovery` is DEV-only visual review.

Financial and review states in production remain backend-owned.

## Responsive

The review room is built for desktop and collapses into one continuous story on small screens. State selectors remain horizontally scrollable and primary controls keep a 44px minimum target on mobile.
