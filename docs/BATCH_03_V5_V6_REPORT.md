# SecurePay YuI — Batch 03 Visual Report

**Batch:** V5 Trader Home + V6 My Market  
**Date:** 2026-08-21  
**Review mode:** fixture-backed preview routes; no authentication, payment, backend write, authority or settlement decision is performed by these preview screens.

## Purpose

Batch 03 establishes the signed-in Market as a living operating space rather than a quiet dashboard.

The governing distinction is:

> **The Market entrance creates curiosity. My Market creates momentum.**

The trader should immediately understand what needs them, what is moving, what is waiting elsewhere and what has already become part of their record.

## V5 — Trader Home

The signed-in home now prioritizes:

1. a clear return to **your Market**;
2. immediate attention count;
3. natural-language next-intention entry;
4. a small number of closest actions;
5. agreements already in motion;
6. recent records;
7. KSNumber as the trader's place in the Market;
8. circle and builder context without turning the page into a social feed.

The Living SecurePay Mark remains polite in the shell and becomes more present only around attention, guidance and state communication.

## V6 — My Market

My Market is organized by human meaning, not backend status vocabulary:

- **Your market needs you here** — the most active lane;
- **In motion** — shown when projection data supports it;
- **Waiting peacefully** — nothing is wrong and the next move belongs elsewhere;
- **Finished and in your records** — completed/closed work rests rather than continuing to demand attention.

The page shares the same signed-in shell and mobile bottom navigation as Trader Home.

## Language corrections

The shared market projection now avoids unnecessarily adjudicative or banking-style action labels:

- `RESPOND_TO_REVIEW` → **Respond to the clarification**
- `ACKNOWLEDGE_REVIEW` → **Review the clarification**
- `REQUEST_RELEASE` → **Review the payment step**
- `APPROVE_PAYOUT` → **Review the supplier payment step**

Backend action codes remain unchanged; only customer-facing labels are softened.

## Brand / visual rules carried forward

- official SecurePay symbol only; no regenerated logo;
- semantic task icons remain useful for the story of the trade;
- Living SecurePay Mark carries SecurePay's status/body language;
- attention uses purposeful orange and motion;
- waiting is calm green/cream;
- completed records are visually settled;
- reduced-motion preferences disable non-essential motion;
- no preview visual is authority for live money state.

## Review routes

- `/preview/trader-home`
- `/preview/market`

## Exit gate

Batch 03 can be locked when both routes answer, within seconds:

- What needs me?
- What is moving?
- What is waiting on someone else?
- What has already happened?
- What should I do next?

and when the signed-in world feels like one Market rather than two unrelated dashboards.


## Approval status
**APPROVED / LOCKED — 2026-08-21.** Reopen only for a real usability, accessibility, backend-truth or functional defect.
