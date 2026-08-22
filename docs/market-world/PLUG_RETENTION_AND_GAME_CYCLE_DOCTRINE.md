# Plug Retention Reward & Game Cycle Doctrine

**Decision date:** 2026-08-22  
**Programme:** SecurePay Market / Trainer / Game  
**Status:** LOCKED PRODUCT DOCTRINE — implementation authority remains world-specific

This decision refines MW-06 and the later Game phases without changing the Three-World authority boundary.

## 1. Real Market — month-10 Plug / Builder reward

A referral establishes provenance only. It does not by itself create a reward.

The locked retention rule is:

> If a KSNumber introduced by a Plug / Builder completes **10 consecutive successfully paid active subscription months**, the **SecurePay subscription fee actually collected for month 10** becomes a one-time reward entitlement for the originating Plug / Builder.

### 1.1 Amount

- **For You:** current plan price KES 100/month → if KES 100 is actually and successfully collected for qualifying month 10, the month-10 reward is KES 100.
- **Business:** current plan price KES 200/month → if KES 200 is actually and successfully collected for qualifying month 10, the month-10 reward is KES 200.
- The backend should use the **actual successfully collected month-10 subscription fee**, not duplicate a hard-coded reward amount. This keeps historical evidence correct if plan pricing changes later.

### 1.2 Consecutive means consecutive

A qualifying streak requires ten consecutive successfully paid active subscription months.

A missed, unpaid, cancelled, suspended or otherwise non-qualifying subscription month breaks that streak. A later new streak may begin according to the authoritative subscription lifecycle.

Identity age, account creation date, referral age or an `ACTIVE` identity flag alone must never be used as proof of ten paid months.

### 1.3 Exactly once

For one referral relationship and one qualifying ten-month streak:

- the month-10 retention reward may be recorded only once;
- retries and concurrent evaluation must converge on the same entitlement;
- pricing/payment evidence must be retained with the entitlement;
- a Plug cannot replace another Plug immediately before month 10;
- referral provenance remains first-valid-relationship / conflict-safe according to backend referral doctrine.

### 1.4 No lifetime override

The month-10 reward is a defined retention milestone, not permanent ownership of a referred trader.

It creates:

- no downline;
- no territory;
- no perpetual commission;
- no claim on the trader's future agreements;
- no authority over the trader's KS Store, identity, money or agreements.

Separate paid work by the Plug / Builder remains a normal trader-to-trader agreement.

### 1.5 Backend authority gate

The UI must not calculate or claim this reward from elapsed calendar time.

A real entitlement requires backend evidence of:

1. immutable referral provenance;
2. authoritative subscription plan and billing-cycle identity;
3. ten consecutive qualifying paid cycles;
4. successful month-10 subscription payment evidence;
5. actual fee amount and currency collected for month 10;
6. exactly-once retention reward qualification and evidence persistence.

At the decision date, SecurePayAPI explicitly retains the subscription lifecycle (activation / renewal / grace / suspension / access enforcement) as an unbuilt/deferred area. Therefore the commercial rule is locked, but the real month-10 reward remains **implementation-blocked until subscription payment authority exists**. The frontend must fail closed in the meantime.

---

## 2. Game — Turn, Round and Cycle

Referrals are not compulsory actions and the Game must not teach players to refer everybody to everybody.

The locked temporal grammar is:

### Turn

A **Turn** is one active player's opportunity to act.

A player may trade, negotiate, maintain a Store, respond to a Life event, collaborate, refer a genuine opportunity, use Recovery & Resolution, consult a Game Master, save, spend or choose to take no Market action where the rules permit.

### Round

A **Round** is complete when every active player has completed one Turn.

### Cycle

A **Cycle** is one completed Round **plus the end-of-cycle Market and Life consequences**.

The engine closes the Cycle only after all active players have taken their Turn and the Cycle-resolution step has applied the relevant recurring consequences.

## 3. Cycle as simulated Market time

For recurring concepts, one Game Cycle may represent one simulated Market month.

Cycle close may therefore advance simulated concepts such as:

- subscription renewal;
- Store freshness;
- recurring obligations;
- referral active-month progress;
- Life commitments;
- Circle / Community missions;
- Game-only Recovery consequences;
- temporary Cycle Coin reset/refresh;
- persistent achievement/history progression.

This is **Game-only simulation**. A simulated month, payment or reward can never create Real Market financial entitlement.

## 4. Referrals inside the Game

A referral is an optional Market action arising from a genuine opportunity match.

The Game should reward useful connection quality and resulting healthy Market activity, not raw compulsory referral volume.

Therefore:

- players are never required to refer every other player;
- reciprocal referral loops do not automatically create value;
- one simulated referral may progress across later Cycles if the simulated referred trader remains active under Game rules;
- the Game may demonstrate the ten-Cycle analogue of the Real Market month-10 rule, but the result is Game-only;
- Game Coins / points have no cash value and cannot be withdrawn or converted into Real Market reward entitlement.

## 5. Three-World boundary

**Market:** real referral provenance, real paid subscription evidence and real reward entitlement are backend authority.  
**Trainer:** may explain and calculate examples, clearly labelled as illustrations.  
**Game:** may simulate Turn → Round → Cycle and a ten-Cycle retention scenario using Game-only state.

No Trainer or Game event may be copied, promoted or interpreted as proof of a Real Market paid month or Plug reward.
