# SecurePay Three-World Authority Matrix

**Phase:** MW-00

The matrix answers one question: **who is allowed to say this is true?**

| Truth / action | Market | Trainer | Game | YUI rule |
|---|---|---|---|---|
| Real KS identity | SecurePayAPI identity/auth authority | May simulate a teaching identity only | May use Game profile identity only | Never map simulated identity to real KS authority |
| Authentication | SecurePayAPI | No real authentication required for training state | Separate Game session/auth model when introduced | Market auth must be fresh at the real-world boundary |
| Store profile truth | SecurePayAPI Store domain | Fixture/demo only | Game Store only | A demo/Game Store cannot appear as real Store truth |
| Store availability/currentness | SecurePayAPI | Simulated | Simulated | Store Health/currentness is not trust/credit |
| Store listing | SecurePayAPI Store domain | Demonstration only | Simulated | listing ≠ reservation ≠ sale |
| Opportunity | Future backend opportunity domain | Simulated teaching scenario | Game challenge/opportunity domain | opportunity ≠ agreement |
| Community membership | Future backend Community domain | Simulated | Game community/team state | membership ≠ endorsement |
| Circle membership / Cycle | Future backend Circle/Cycle domain | Simulated | Game Circle/team state | no guaranteed-income implication |
| Referral provenance | SecurePayAPI referral domain | Illustrative only | Game referral event | provenance ≠ reward entitlement |
| Real referral reward | SecurePayAPI commercial + settlement-backed qualification | Never | Never | UI displays backend entitlement only |
| Real Master status | Future backend Master registry | May demonstrate role | Game Master is separate | Game Master ≠ Real Market Master |
| Master rate | Future backend Master registry / consultation snapshot | Illustrative | Game-only rule | real minimum KES 1,000/hour must be backend-enforced |
| Master Opinion | Future backend consultation/recovery record | Simulated | Game opinion | opinion ≠ adjudication |
| Agreement creation | SecurePayAPI | Simulated | Game-only agreement engine later | simulation never writes real agreement |
| Agreement participant status | SecurePayAPI | Simulated | Game state | invitation ≠ participation |
| Payer authority | SecurePayAPI obligation/authorization rules | Simulated | Game rules | creator ≠ payer |
| Evidence record | SecurePayAPI | Simulated | Game evidence | evidence ≠ completion |
| Completion state | SecurePayAPI | Simulated | Game rules | completion ≠ release authority |
| Funding existence | SecurePayAPI provider-event + ledger truth | Simulated | Game coin/ledger truth | UI never converts initiation/request into confirmed money |
| Rail eligibility/quote | SecurePayAPI rail adapters/rules | Simulated | Game rules | UI never invents provider eligibility/cost |
| Payment Ready | SecurePayAPI deterministic policy | Simulated demonstration | Game readiness rule only | no client-side authority |
| Release request | SecurePayAPI command record | Simulated | Game action | release request ≠ settlement |
| Settlement | SecurePayAPI execution/provider confirmation | Never | Game settlement only | only backend may state real settlement |
| Ledger balance | SecurePayAPI ledger | Never | Game ledger only | provider balance alone does not define agreement availability |
| Recovery & Resolution state | SecurePayAPI recovery/dispute domain | Simulated | Game recovery domain | SecurePay is process/record platform, not judge |
| Real dispute fee | SecurePayAPI commercial/recovery rules | Never charged | Game 1-coin rule only | currencies and economies must never mix |
| Game Coins | None | None | Future Game service | no cash value; cannot be withdrawn |
| Game Health | None | None | Future Game service | must never imply real medical/financial health |
| Leaderboard | None | None | Future Game service | ranking cannot imply real trust/reputation |
| Bridge to Market | SecurePayAPI after fresh authentication/consent | May pass draft intent only | May pass draft intent only | only non-authoritative draft data crosses |

## Frontend authority boundary

YUI is authoritative for:

- rendering;
- navigation;
- local presentation state;
- form drafts before submission;
- world labels and safety treatment;
- explaining backend-returned facts;
- safe Trainer fixture state;
- Game presentation state until a dedicated Game service becomes authoritative.

YUI is **not** authoritative for:

- identity validity;
- participant authority;
- payer identity;
- governance/quorum;
- funds existence;
- balances;
- fee/reward entitlement;
- Payment Ready;
- release;
- settlement;
- real Master eligibility;
- real dispute outcome.

## Anti-confusion rule

Whenever a screen shows a simulated version of a concept that also exists in the Market, the screen must make the world unmistakable before the user can act.

MW-01 is responsible for turning this rule into runtime mode/identity behavior.
