# SecurePay — Bolt Design Direction Pack v2

## Why this pack exists

Do NOT invent SecurePay from a blank prompt.

The official UI repository and product doctrine already define the product. The task is to reinterpret the PUBLIC SIGNED-OUT HOME so it expresses SecurePay more clearly and more beautifully without changing what SecurePay is.

The previous Bolt experiments were wrong because they interpreted “market” as a marketplace/listings board. That is NOT SecurePay.

---

# 1. Product truth

SecurePay exists to help people **trade, create, collect, contribute, build and cooperate with greater confidence**.

Traditional payment systems mainly answer:

> Where should the money go?

SecurePay asks:

> What must happen before the money should move?

Guiding principle:

> **MONEY SHOULD FOLLOW THE AGREEMENT.**

SecurePay is the agreement-driven layer beneath many kinds of trade.

The customer begins with ordinary language:

- “I want to buy this.”
- “I want to sell this.”
- “I will pay after delivery.”
- “I need proof.”
- “Let us contribute.”
- “Pay these people when they finish.”
- “I want to know where the money went.”

SecurePay translates that intention into a clear agreement and shows what happens next.

---

# 2. What “the Market” means

**DO NOT build Jiji, Amazon, Facebook Marketplace, a classifieds board, job board, or stock exchange.**

The Market is a metaphor and operating world for all the economic intentions SecurePay helps people organise.

The user should feel that SecurePay understands the many things they may be trying to do.

The public signed-out homepage should communicate:

> **POSSIBILITY**

The signed-in experience later communicates:

> **FLUENCY IN TRADE**

So the signed-out home should make someone feel:

- I can buy with clarity.
- I can sell with clarity.
- I can hire someone.
- I can get paid for work.
- I can supply goods.
- I can organise a contribution.
- I can support family.
- I can build a project.
- I can create something and get paid.
- I can see how SecurePay can help the deal become clear.

The homepage should NOT pretend strangers are browsing and matching with each other inside SecurePay.

---

# 3. The user archetype

Design for the ordinary person who needs to cooperate with others around money without damaging relationships.

They may be:

- a parent paying school fees
- a fundi waiting for payment
- a contractor
- a hardware owner
- a farmer
- a creator
- a student
- a chama member
- a diaspora investor
- an adult child supporting parents
- a community leader
- a business owner

Different roles. One need:

> **Peace of mind through clear agreements.**

The product question is:

> Does this help the person work, contribute, build and invest with confidence?

---

# 4. The correct first-screen idea

The first screen should NOT be:
- a giant slogan
- a listings wall
- a dashboard
- a large photo with marketing text
- a single cement example
- feature cards

It should be a **human invitation + immediate possibility + one concrete demonstration**.

Recommended architecture:

### A. Welcome
Use a warm, confident line:

**Welcome to the market.**

This is not a literal marketplace listing screen. It is the front door into SecurePay’s world of trade.

### B. Intention first
The biggest useful control on the page should be:

**Tell SecurePay what you’re doing.**

Natural-language example:

> I’m buying a generator for KES 85,000 and collecting it on Saturday.

or another relatable scenario.

Below it, a small number of human intention shortcuts:

- I’m buying something
- I’m selling something
- I’m paying for work
- I’m supplying goods
- I’m collecting together
- I’m supporting family
- Something else

### C. Show possibility around the main action
Do NOT render 12 fake live listings.

Instead show a curated visual strip / story mosaic of **situations SecurePay can help with**:

- Paying a contractor
- Supplying goods
- Buying equipment
- Supporting family
- School fees / welfare
- Construction stages
- Digital work / creative work

These are examples of possibility, not live marketplace inventory.

### D. One live-looking but clearly illustrative agreement
Beside the intent input, show ONE concrete example of how SecurePay makes a trade clear:

- amount
- parties / roles
- what is being traded
- delivery / completion condition
- what must happen next
- when money moves

Label it **Illustrative example** or **Demo**, not “live transaction”.

This is how the user understands the product without reading an essay.

---

# 5. Keep from the existing signed-out master

Reference file:
`02_SIGNED_OUT_MASTER_DESKTOP.png`

The current official frontend already has several good ideas:

- intention-first interaction
- ordinary customer language
- a clear agreement example
- visible stages
- “money moves after confirmation”
- relatable trade situations
- restrained green/orange palette
- readable visual hierarchy

Do NOT throw away that product logic.

The redesign may become more vibrant, warm and human, but the underlying interaction model should survive.

---

# 6. What to learn from the market-feel reference

Reference file:
`04_MARKET_FEEL_REFERENCE.png`

Use this only for:
- warmth
- human photography
- visual energy
- “Welcome to the market”
- showing family, school, business, construction as possibilities
- making SecurePay feel connected to life beyond the transaction

DO NOT copy its unsupported claims.

Specifically DO NOT use wording such as:
- SecurePay holds funds
- your money is safe until...
- secure & regulated
- bank-grade
unless authoritative backend/legal copy explicitly supports it.

Do not use fake metrics, fake partner logos, or fake social proof.

---

# 7. What to learn from the trade-clarity reference

Reference file:
`05_TRADE_CLARITY_REFERENCE.png`

Use this for:
- typography balance
- strong “Welcome to the market”
- intent input
- one agreement example
- popular situations
- clear buyer/seller/work balance

Do not treat it as a locked layout.

---

# 8. Visual language

Use the exact official logo in:
`01_OFFICIAL_LOGO.jpeg`

The site should feel like the logo expanded into a world.

Primary palette:
- SecurePay green
- SecurePay orange
- charcoal / near-black
- warm off-white / cream

Avoid:
- generic fintech blue
- purple
- neon
- crypto aesthetics
- excessive gradients
- glassmorphism
- giant geometric SaaS typography
- dashboard-density
- endless tiny cards

Typography:
- warm, confident, human
- editorial character for big storytelling moments is welcome
- highly readable sans for functional controls
- do NOT make the whole site look like a software admin interface

Photography:
- contemporary African commerce
- capable people at work
- workshops, shops, farms, construction, creators, families
- no poverty stereotypes
- no generic handshake stock imagery as the whole story

---

# 9. Signed-out vs signed-in design law

This public page is **SIGNED OUT**.

Its job:

> **SHOW POSSIBILITY.**

Do not try to show the user’s personal tasks, balances, deadlines or private trade activity here.

Later signed-in pages will do:

> **FLUENCY IN TRADE**

Meaning:
- what happened
- what it means
- what I can do next
- who is waiting
- what is blocking
- where money stands
- what is complete

Do not mix the two experiences.

---

# 10. Truth boundaries

SecurePay is NOT:
- a bank
- an insurer
- a guarantor
- a court
- an investment platform

Do not say:
- guaranteed
- 100% protected
- fraud-proof
- risk-free
- guaranteed payment
- guaranteed delivery

Do not invent:
- user counts
- transaction values
- real marketplace activity
- regulatory approvals
- security certifications
- bank partnerships
- testimonials

The frontend must not independently invent financial truth.

---

# 11. Build target for Bolt

Create ONLY a signed-out homepage prototype.

Do not build backend, auth, payments, database or real marketplace matching.

The target above the fold on desktop:

1. Exact official SecurePay logo.
2. “Welcome to the market.”
3. One strong natural-language intention entry.
4. A small number of possibility shortcuts.
5. One illustrative agreement that visibly shows how money follows the agreement.
6. A visually rich but curated glimpse of other real-life situations.
7. Human photography that makes work and life visible.
8. One obvious next action.

The user should understand the entire product gist without scrolling.

The emotional response should be:

> “I can see what I can do here.”

> “I can see my work here.”

> “I want to use this for something I’m already trying to do.”

Not:

> “This is a marketplace where I browse listings.”

Not:

> “This is a fintech dashboard.”

Not:

> “This is a marketing poster.”

---

# 12. First deliverable only

DO NOT redesign the whole website yet.

First produce ONE desktop 1440×900 above-the-fold signed-out homepage.

Do not spend effort below the fold.

Do not create multiple pages.

Do not create auth.

Do not create a new logo.

Show that first screen for approval before continuing.
