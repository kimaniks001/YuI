# SecurePay YUI v1 — Canonical Path Matrix

YUI v1 deliberately keeps the **real customer URLs** while substituting
fixture-backed experience rooms where authentication/API authority would
otherwise be required. This lets every navigation path be rehearsed before the
production tap is connected.

| Canonical path | YUI v1 experience | Live authority in Explorer? | Future production source |
|---|---|---:|---|
| `/` | Signed-out Market Home | No writes | Public UI |
| `/signin` | Sign-in / OTP training | No | SecurePay authentication |
| `/signup` | KSNumber onboarding training | No | Identity/authentication API |
| `/activate` | Activation journey training | No | Activation/identity API |
| `/create` | Adaptive agreement creation | No | Agreement engine |
| `/securelink/join/:token` | Invitation/joining room | No | Invitation + participant API |
| `/group/:slug` | Group invitation/governance story | No | Group SecureLink API |
| `/dashboard` | Trader Home fixture | No | Current-user projections |
| `/market` | My Market fixture | No | Agreement/action projections |
| `/agreements` | Market agreement index fixture | No | Current-user agreement list |
| `/agreements/:agreementId` | Agreement Workspace fixture | No | Agreement/version/obligation/evidence APIs |
| `/actions` | Operational action journey | No | Cross-agreement action feed |
| `/money` | Money state room | No | Ledger/payment/readiness/settlement truth |
| `/market/flows` | SecureFlow / Group SecureFlow | No | Distribution/governance APIs |
| `/market/statements` | Statement/money preview | No | Ledger statement API |
| `/community` | Circle & growth | No | Community/referral APIs |
| `/referrals` | Circle & growth | No | Referral API |
| `/ks/:ksId` | KS Profile / Digital Store | No | KS profile + store inventory APIs |
| `/developers` | Developer Market / sandbox journey | No | Developer platform API |
| `/settings` | Local Explorer/theme settings | No | Trader settings API after auth |
| `/help` | Help Center | Static | Approved knowledge content |
| `/trust` | Trust room | Static | Approved public doctrine/content |
| `/terms` | Terms | Static | Approved legal content |
| `/privacy` | Privacy | Static | Approved legal content |
| `/security` | Security | Static | Approved public security content |
| `/compliance` | Compliance | Static | Approved public compliance content |
| `/not-a-bank` | Role/boundary explanation | Static | Approved public doctrine/content |
| `/explore` | YUI v1 complete journey map | No | Training-only |
| `/review` | Visual review gallery | No | Training/review-only |

## Safety law

Explorer routes can display illustrative states so people can learn the
experience, but they cannot declare production identity, payment, Payment Ready,
quorum, release, settlement, verification, balance, reward or financial truth.

The browser-side SecurePay API client refuses live calls while Explorer mode is
on, and every frontend money-action feature flag is forced false.
