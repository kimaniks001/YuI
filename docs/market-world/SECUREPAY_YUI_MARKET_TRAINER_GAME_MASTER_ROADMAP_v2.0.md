# SecurePay YUI + SecurePayAPI — Market / Trainer / Game Master Roadmap v2.0

**Date:** 22 August 2026  
**Status:** BUILD ROADMAP  
**Canonical frontend:** `kimaniks001/YuI`  
**Accepted YUI baseline:** `yui-accepted-baseline-2026-08-22` → `ffd09b8182a0ea52a83d0fa68c2b1be61ef02855`  
**Canonical backend:** `kimaniks001/SecurePayAPI` `main`  
**Historical/reference frontend only:** `kimaniks001/UIyamwisho`  
**Programme:** 20 phases, MW-00 through MW-19

> **The Market is where I trade.**  
> **The Trainer is where I learn.**  
> **The Game is where I practise, compete and experiment.**  
> **My KS Store is my address across the Market.**

---

## 1. Reset and source-of-truth decision

This roadmap supersedes the previous Market World implementation assumption that used `UIyamwisho + SecurePayAPI`.

From this point:

- **YuI is the authoritative SecurePay frontend.**
- **SecurePayAPI is the authoritative backend and financial truth source.**
- **UIyamwisho is reference material only.**
- Do not continue Market World runtime development in UIyamwisho.
- Do not copy UIyamwisho's shell or architecture into YUI.
- Useful UIyamwisho work may be mined for requirements, tests, API lessons and discovered edge cases.
- The accepted YUI baseline is `ffd09b8`. Later YUI repair commits are not automatically inherited.
- Existing SecurePayAPI Store/public Store work already merged remains valid unless a fresh defect is proven.

The accepted YUI baseline already preserves the real SecurePay Market journeys. The current `/play` experience is a prototype beside that Market, not a replacement for it.

---

# 2. The three SecurePay worlds

## 2.1 THE MARKET — real world

The Market is SecurePay production.

It contains real KS identity, Digital Stores, Communities, Circles and Cycles, opportunities and referrals, Masters, agreements, SecureLinks, SecureFlow / Group SecureFlow, Recovery & Resolution and backend-authoritative financial state.

**Rule:** frontend guidance never creates financial authority.

## 2.2 THE TRAINER — guided learning world

The Trainer evolves the safe YUI Explorer/tutorial experience into an intentional product for Plugs / Builders, SecurePay staff, developers, trainers, partners, new traders and anyone who wants to learn SecurePay without creating real state.

Trainer capabilities should eventually include guided journeys, role demonstrations, Store demonstrations, SecureLink/group/flow demonstrations, Recovery & Resolution demonstrations, Plug earning simulations, Master consultation demonstrations, trainer-led sessions, a scenario library and safe handoff into the real Market.

**No Trainer state may create real identity, agreement, payment, Payment Ready, release, settlement or reward truth.**

No competitive coin economy or leaderboard is required in Trainer mode.

## 2.3 THE MARKET GAME — competitive practice world

The Game is a social economic simulation.

Its objective is not merely to become richest:

> **Grow money without destroying the life that money is meant to support.**

The Game teaches the Yin–Yang relationship between **Trade** — enterprise, work, capital, opportunity and growth — and **Life** — rest, family, community, obligations, wellbeing and meaning.

Players maintain **Game Health / Market Balance** while building economic value.

Game outcomes never create Real Market financial truth or Real Market Master status.

At any point a player may choose **Take me to the real Market**. The user then authenticates and re-establishes real KS identity and consent. Only a draft intention/proposal may cross the boundary.

---

# 3. Core product grammar

- **KS Number** — Who am I?
- **KS Store** — What do I offer and what does my Market presence look like?
- **Community** — Who are my people?
- **Circle** — Who have I deliberately chosen to work and grow with?
- **Agreement** — What exactly have we agreed to do?
- **Cycle** — A recurring period of deliberate Circle activity.
- **Plug / Connector** — Who helps opportunity reach the right person?
- **Master** — Whose measurable experience can help me think through this?
- **Trainer** — Where do I learn how the Market works?
- **Game** — Where do I practise through consequences?
- **Market** — Where do I do it for real?

> People belong to Communities.  
> People work together in Circles.  
> Circles grow through Cycles.  
> Trade happens through Agreements.  
> Masters share experience.  
> Plugs help opportunity travel.  
> The Market records the fruit.

---

# 4. Hard authority laws

These apply to every phase:

- creator ≠ payer;
- invitation ≠ participation;
- listing ≠ reservation ≠ sale;
- opportunity ≠ agreement;
- evidence ≠ completion;
- completion ≠ release authority;
- release request ≠ settlement;
- Game result ≠ Real Market truth;
- Game Master ≠ Real Market Master;
- Store Health ≠ trust score;
- Game Health ≠ real medical/financial health;
- Community membership ≠ endorsement;
- Master Opinion ≠ adjudication;
- Master participation ≠ agreement authority;
- referral provenance ≠ reward entitlement;
- frontend guidance ≠ backend authority.

SecurePay is not a bank, court, insurer, guarantor, legal representative or adjudicator.

---

# 5. Existing financial/commercial rules to preserve

## Real SecurePay

- SecureLink up to KES 20,000: KES 20.
- KeyContract above KES 20,000: KES 20 + 1% of the amount above KES 20,000.
- Welfare Group SecureLink: KES 10 per successful contribution.
- General Group SecureLink: KES 20 per successful contribution.
- Formal real Recovery/Resolution dispute fee: KES 100.
- For You: KES 100/month.
- For Business: KES 200/month.
- Qualifying KeyContract referral reward: **10% of SecurePay's agreement fee**, not 10% of trade value and not an additional charge to the customer.
- Builder/Plug activation reward: KES 100 For You / KES 200 Business when qualifying rules are met.
- Retention reward after 10 active months: same qualifying reward again.
- No guaranteed Plug income.
- No MLM, territory ownership or passive lifetime overrides.
- Payment Ready, release, settlement, ledger and reward entitlement remain backend authority.

## Game economy

- **Personal Game Cycle:** KES 100 → 5 Cycle Coins.
- **Business Game Cycle:** KES 200 → 12 Cycle Coins.
- Cycle Coins **do not roll over**.
- Formal Game Recovery/Resolution action: **1 Game Coin**.
- Game Coins have **no cash value**, cannot be withdrawn and cannot create Real Market financial entitlement.
- Persistent achievement/history survives Cycle reset; temporary Cycle Coins do not.
- Group Game for more than 2 players: **KES 100/hour group-session concept**. Exact payer model (host/room/player) must be locked before live billing is implemented.
- No gambling, loot boxes, cash redemption or pay-to-win authority.

---

# 6. The KS Digital Store vision

A KS Store should eventually make **“Go and look at my KS.”** sufficient for discovery.

A good Store may contain official KS identity, trader/business name, photo/logo, location, Store Health/currentness, last availability check, products, services, listed price, availability, previous work, gallery/media, authorised evidence-backed completed-work history, active SecureLinks/offers, shareable offer links, WhatsApp-ready sharing, QR codes, printable QR, explicitly public Communities/Circles, relevant Master status, safely publishable real Market history and a clear route to start an agreement.

SecurePay truth stays fixed, but Store personality may vary through controlled typography families, layout emphasis, banner, gallery treatment, market atmosphere, featured work, products-first/services-first emphasis and approved cosmetic treatments.

Fixed elements remain fixed: KS identity, SecurePay mark, truth/status meaning, financial authority, agreement authority and safety notices.

Store themes must never make a Store appear verified, more trustworthy or financially stronger than backend evidence supports.

---

# 7. Plug / Builder economy

The Plug Economy turns informal connection into structured opportunity.

A Plug may evolve through several useful roles: Market guide, SecurePay Trainer, Store setup helper, Connector, opportunity finder, Circle catalyst, customer-success helper and independent service provider.

Platform rewards are only backend-authoritative entitlements. Independent work such as Store setup, photography, product descriptions, administration, marketing support or project reporting is a separate agreement between the Plug and trader.

Core rules:

- no guaranteed income;
- no territory ownership;
- no passive lifetime entitlement;
- no pyramid/downline model;
- referral reward follows qualifying real activity;
- qualifying KeyContract referral reward = 10% of SecurePay's platform agreement fee;
- activation/retention rewards follow commercial doctrine;
- Trainer should allow a Plug to simulate earnings while making the difference between illustration and entitlement unmistakable.

---

# 8. Masters

A **Real Market Master** is a person whose measurable real Market activity demonstrates meaningful experience in a specific trade, industry or Market practice. Master status is category-specific, not universal.

Examples include Master Builder, Master Electrician, Master Retailer, Master Supplier, Master Grower, Master Connector and Master Community Organiser.

Master evidence should be transparent, explainable and backend-derived where possible. Do not collapse it into one opaque trust score.

## Real Master consultation rule

Inside a real active agreement:

- either trader may choose **Ask a Master**;
- the inviting trader pays;
- minimum Master rate is **KES 1,000/hour**;
- a Master may set a higher hourly rate but never lower;
- price and time must be visible before invitation;
- Master must accept before paid time begins;
- extensions require explicit approval;
- Master receives only the agreement/chat/evidence access explicitly authorised for the consultation.

A Master may ask questions, give a second opinion, review scoped material, explain industry practice and provide a written **Master Opinion**.

A Master may not change the agreement, accept on behalf of a trader, declare evidence true, declare Payment Ready, release money, settle a dispute, impose liability or adjudicate.

---

# 9. Recovery & Resolution

User-facing dispute/recovery experience should use **Recovery & Resolution** language.

Suggested structure:

- **Recovery & Resolution** — umbrella journey;
- **Recovery Room** — joint trader conversation/evidence room;
- **Resolution record** — what the parties chose;
- **Master Opinion** — optional advisory opinion where appropriate.

SecurePay remains a process/record platform, not the judge.

If traders reach stalemate, either side may invite an industry-relevant Master at the inviter's KES 1,000+/hour rate. The Master may join the shared Recovery Room and register a Master Opinion. Parties may **adopt it, partially adopt it, or ignore it**. Ignoring it creates no automatic penalty. Adopting it does not make the Master the adjudicator.

---

# 10. The Game design

## 10.1 Game Health / Market Balance

Players balance Trade — money/capital, customers, work, agreements, referrals, Store, projects, business growth, suppliers and Circle opportunities — with Life — rest week, family holiday, Christmas, family support, community support, personal commitments, time, energy and resilience.

A player can become wealthy but unhealthy. A player can be comfortable but economically unsustainable. The strongest player maintains a resilient balance.

## 10.2 Four card families

- **Trade Cards:** customers, suppliers, jobs, stock, negotiation, referrals, SecureLink and Circle opportunities.
- **Life Cards:** family support, school fees, care responsibility, emergencies, home obligations, celebrations.
- **Balance Cards:** rest, vacation, Christmas break, recovery, recreation, time with family, lower-return choices that protect balance.
- **Market Cards:** licences, statutory obligations, supplier shocks, Community requests, Circle opportunities, disputes, rules, customers, referrals and competitor change.

Cards teach through consequences rather than static quizzes.

## 10.3 Game actions mirror the real Market

Game missions rehearse real SecurePay mental models: simulated SecureLinks, review/negotiation, contribution, delivery, evidence, Recovery & Resolution, Master advice, Circle opportunity passing, Community support, Store visits, QR use, Store maintenance and Cycle renewal.

## 10.4 Multiplayer

The mature Game supports solo, two players, online group rooms, reconnect/resume, authoritative server state, timers/rounds/Cycles, chat, offers, simulated player-to-player trade, Circle/team play, session math, anti-cheat and results/replay.

The Game engine acts as banker, scorekeeper, rules engine, scenario engine, Game-only event ledger and arithmetic layer.

## 10.5 Game leaderboard

Leaderboard is not “who has most cash.” It should visibly combine economic growth, Game Health/Market Balance, decision quality, completed obligations, collaboration, Circle/Community contribution, responsible Recovery & Resolution use, productive referrals and resilience across Cycles.

Game Masters remain separate from Real Market Masters.

---

# 11. 20-phase master roadmap

## MW-00 — YUI Rebaseline & Three-World Constitution
**Purpose:** make the accepted YUI build and SecurePayAPI current main the only runtime sources of truth.  
**YUI:** branch from accepted baseline; preserve approved visual system; document Market/Trainer/Game; inventory canonical routes; record UIyamwisho as historical only.  
**SecurePayAPI:** inventory current real capabilities and authority.  
**Exit:** approved architecture map, authority matrix, gap register and dependency graph.

## MW-01 — Mode, Identity & Safe World Switching
**Purpose:** make Market, Trainer and Game unmistakable and safely switchable.  
**YUI:** visible world selector; Market default; Trainer/Game entry; persistent mode treatment; “Go to real Market”; preserve draft intent across auth without simulated authority.  
**Backend:** real auth remains Market authority; define Game/Trainer session isolation.  
**Exit:** no simulated action can create real financial/agreement truth.

## MW-02 — Trainer Foundation
**Purpose:** turn YUI Explorer into an intentional guided learning product.  
**YUI:** `/trainer`; guided tours; journey picker; role demos; Plug-led session flow; Store/SecureLink/group/Recovery demos; Try It For Real.  
**Exit:** a Plug can teach SecurePay end to end without real state.

## MW-03 — Public KS Digital Store
**Purpose:** make the KS Store the universal Market address.  
**YUI:** connect `/ks/:ksId` to authoritative Store APIs; identity; products/services; availability; truthful history/gallery surfaces; trade entry.  
**Backend:** reuse merged Store/public Store authority.  
**Exit:** “Go look at my KS” gives a useful truthful Market presence.

## MW-04 — Store Owner Studio, Health & Personality
**Purpose:** make Store maintenance easy and expressive.  
**YUI:** My KS Store; natural-language add/edit; availability; Store Health; customer preview; gallery/media; controlled themes/moods; mobile maintenance.  
**Backend:** Store writes, media, theme/profile preferences where missing.  
**Exit:** trader can maintain a personal current Store without altering SecurePay truth semantics.

## MW-05 — Store SecureLinks, Sharing & QR
**Purpose:** turn every published offer into an easy trade entry point.  
**YUI:** offer deep links; Copy; WhatsApp; local QR; printable QR; Store→creation proposal; exact money; seller KS proposal.  
**Backend:** reuse public Store offer endpoints.  
**Exit:** scan/share begins a proposed trade, never reservation/sale/payment.

## MW-06 — Plug / Builder Economy & Trainer Tools
**Purpose:** make connection a visible useful Market role.  
**YUI:** Plug dashboard; provenance; activation/retention; backend reward visibility; Trainer shortcuts; Store-help workflow; illustrative earnings simulator.  
**Backend:** referral/reward entitlement; fraud controls; reporting.  
**Exit:** Plug can understand and grow value without guaranteed-income or MLM ambiguity.

## MW-07 — Communities & Privacy-Safe Market Feed
**Purpose:** make belonging and discovery useful.  
**YUI:** discovery; join/request/leave; members; rules/moderators; feed; publication controls; Master discovery entry.  
**Backend:** Community membership, moderation, visibility and feed events.  
**Exit:** lively Community without leaking private trade or implying endorsement.

## MW-08 — Circles, Cycles & Cooperative Growth
**Purpose:** create small deliberate groups that help opportunity circulate.  
**YUI:** create Circle; organiser; invites; active/resting; Cycle; intentions; opportunities; fruit/growth; contribution view.  
**Backend:** Circle/Cycle domain, membership, organiser authority, metrics.  
**Exit:** Circle can show useful economic outcomes without promising income.

## MW-09 — Opportunities, Connectors & My Market Convergence
**Purpose:** unify Store/Community/Circle discovery in the trader operating room.  
**YUI:** opportunity inbox; pass/respond/claim; provenance; connector contribution; My Market convergence.  
**Backend:** opportunity domain, permissions, status, provenance.  
**Exit:** My Market coherently presents work and opportunity.

## MW-10 — Real Market Masters & Expertise Registry
**Purpose:** recognise measurable practical expertise without opaque trust scoring.  
**YUI:** Masters by industry/community; evidence basis; rates; availability; profile; “Why this person is a Master.”  
**Backend:** eligibility, category status, evidence sources, anti-manipulation, rate floor KES 1,000/hour.  
**Exit:** relevant Masters are discoverable and explainable.

## MW-11 — Master Consultation Inside Real Agreements
**Purpose:** allow paid second opinions without transferring agreement authority.  
**YUI:** Ask a Master; inviter=fee bearer; rate/hour; invite; scoped joint chat; timer/extension; Master Opinion.  
**Backend:** consultation object, scoped access, rate snapshot, billing, immutable opinion, close/revoke.  
**Exit:** Master advises at KES 1,000+/hour; parties retain authority.

## MW-12 — Recovery & Resolution + Stalemate Master Opinion
**Purpose:** humanise disputes as structured recovery.  
**YUI:** Recovery Room; evidence/chat; what happened→meaning→next; Master invite at stalemate; Adopt / Partially Adopt / Ignore; resolution record.  
**Backend:** recovery state, evidence, KES 100 formal dispute fee, Master Opinion linkage, party disposition, audit trail.  
**Exit:** informed perspective without Master/SecurePay adjudication.

## MW-13 — Game Foundation: Profile, Cycle, Health & Coins
**Purpose:** build the real Market Game economy.  
**YUI:** `/game`; profile; Yin–Yang Game Health; capital/resources; Cycle clock; Personal/Business cycle; 5/12 coins; no rollover; Game Store/history.  
**Game service:** separate domain/session authority; cycle entitlement; coin ledger; reset; deterministic history.  
**Exit:** player enters a Game Cycle with unmistakably simulated resources.

## MW-14 — Trade / Life / Balance / Market Card Engine
**Purpose:** make the Game extensible and life-aware.  
**YUI:** card presentation, choices, consequences, balance effects.  
**Game service:** scenario schema, authoring/versioning, safe draw rules, age suitability, context.  
**Exit:** scenarios can be added without rewriting the Game.

## MW-15 — Simulated SecurePay Journeys & Market Mathematics
**Purpose:** make Game play rehearse actual SecurePay behaviour.  
**YUI:** simulated SecureLinks, Group SecureLinks, SecureFlow, Group SecureFlow, obligations, evidence, confirmations, Game Recovery, Game Master Opinion, 1-coin dispute, Store/QR/referral/Circle missions.  
**Game service:** Game-only agreement engine and ledger; authoritative Game arithmetic.  
**Exit:** system keeps the maths; no real trade effect.

## MW-16 — Online Multiplayer Rooms & Session Commerce
**Purpose:** turn Game into a live social experience.  
**YUI:** create/join room; invite; lobby; live state; chat; reconnect; rounds; host controls; results.  
**Game service:** realtime state, reconnection, anti-cheat, session clock, room billing; KES 100/hour 3+ player group concept; lock exact payer rule before live billing.  
**Exit:** multiple remote players can complete a stable synchronized session.

## MW-17 — Game Social Missions, Game Circles & Challenge Network
**Purpose:** make players learn through one another.  
**YUI:** SecureLink challenges; QR challenges; Store visits; opportunity passing; Circle/team missions; Community support; challenge sharing/replay.  
**Game service:** challenge domain, team state, validation, farming controls.  
**Exit:** social play teaches Market behaviour.

## MW-18 — Balanced Leaderboards, Achievements & Game Masters
**Purpose:** recognise strong Game performance without making wealth the only success measure.  
**YUI:** balance leaderboard; growth; Health; collaboration; Circle/Community contribution; badges; Game Master status; cosmetics.  
**Game service:** transparent scoring; anti-cheat; seasons; no mapping to Real Master status.  
**Exit:** every Game ranking is explainable and cannot imply real trust.

## MW-19 — Trainer/Game → Real Market Bridge, Safety & Launch Certification
**Purpose:** safely connect learning/practice to real trade and certify the ecosystem.  
**YUI:** Do This For Real; draft-intent carry; real auth; real KS re-establishment; fresh Store/availability; real consent; mobile/accessibility certification.  
**Backend/Game:** strict boundary; youth/minor rules; privacy; abuse prevention; Plug/Master fraud controls; QR abuse; performance/load; controlled rollout.  
**Exit:** three-world isolation proven and production launch certified.

---

# 12. Dependency map

```text
MW-00 Rebaseline
   |
MW-01 Three-world identity/mode boundary
   |-------------------|--------------------|
   |                   |                    |
TRAINER LANE         REAL MARKET LANE      GAME LANE
MW-02               MW-03 Store            MW-13 Game foundation
                     MW-04 Owner/Health      MW-14 Cards
                     MW-05 QR/Share          MW-15 Simulation
                     MW-06 Plug Economy      MW-16 Multiplayer
                     MW-07 Communities       MW-17 Social missions
                     MW-08 Circles           MW-18 Leaderboards
                     MW-09 Opportunities         |
                     MW-10 Masters               |
                     MW-11 Consultation          |
                     MW-12 Recovery              |
   |_______________________|_____________________|
                           |
                         MW-19
                   Bridge + Safety + Launch
```

---

# 13. Phase execution rule

Every phase must include:

1. live GitHub inspection before current-state claims;
2. branch from the accepted/current canonical baseline;
3. explicit YUI and SecurePayAPI files in scope;
4. authority analysis;
5. negative/misuse cases;
6. responsive/mobile checks;
7. tests;
8. completion report;
9. one focused PR;
10. dependent phase begins only after required dependency is merged/certified.

SecurePayAPI backend merges remain human-controlled.

---

# 14. MW-00 execution instruction

Treat `kimaniks001/YuI` branch `yui-accepted-baseline-2026-08-22` at `ffd09b8` as the accepted frontend baseline. Treat `SecurePayAPI/main` as backend truth. Treat UIyamwisho as historical/reference only. Inspect both repositories live first. Then execute MW-00 only: create the YUI-native three-world constitution, architecture map, capability matrix, authority matrix, gap register and replacement roadmap documents. Do not begin MW-01 until MW-00 is reviewed and closed.

---

# 15. Final product statement

SecurePay should ultimately feel like one coherent Market:

- **My KS Store is my Market address.**
- **Communities are where I belong.**
- **Circles are where I deliberately grow with others.**
- **Plugs help opportunity travel.**
- **Masters help me think with experience.**
- **Recovery & Resolution helps traders recover when things go wrong.**
- **The Trainer teaches me the Market safely.**
- **The Game lets me practise trade and life through consequences.**
- **The Market is where I authenticate and do it for real.**

And throughout all three worlds:

> **Money should follow the agreement.**
