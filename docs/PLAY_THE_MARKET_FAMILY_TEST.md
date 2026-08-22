# Play the Market — Family, Friends & Team Test Build

**Product:** SecurePay YUI v1 Explorer  
**Mode:** Training / education only  
**Money:** Demo Capital only — no real monetary value  
**Live API:** Not connected  
**Authentication:** Not required in Explorer  

## What is being tested

Play the Market turns SecurePay Explorer into a safe financial-learning game. Testers choose starting Demo Capital, take on Kenyan trade/project scenarios, make agreement decisions, work with other players, gain XP/reputation, move through levels and compare themselves on a fair-trader leaderboard.

The game is meant to teach one behaviour through experience:

> Money should follow the agreement.

## Game modes

- **Solo Market** — free.
- **Two Traders** — free, pass-and-play on one device.
- **Market Room** — 3–6 players, pass-and-play on one device.
- **Market Pass concept** — KES 100/month for 3–6 player rooms. In Explorer, testers activate a test pass and no payment is collected.

Remote multiplayer is deliberately not implemented before the real identity/session API. This test build uses one-device pass-and-play so no fake account, payment or network authority is introduced.

## Fair leaderboard rule

Starting with more Demo Capital does not automatically make someone the better trader. Fair Trader Score combines:

- XP earned from decisions;
- reputation;
- projects completed;
- normalized capital growth;
- productive player-to-player trade.

## Project deck

The first deck includes trade, construction, digital, community and family scenarios such as cement delivery, perimeter wall, SACCO website, solar installation, estate CCTV, school trip, rental renovation, water tank, borehole and family support.

## 15-minute tester script

1. Open `/play`.
2. Choose Solo, Two Traders or Market Room.
3. Give each player any Demo Capital amount.
4. In a 3–6 player room, activate the test Market Pass.
5. Complete at least three projects.
6. In multiplayer, use another player as a project partner at least once.
7. Open `/play/leaderboard`.
8. Compare capital growth, reputation, projects and Fair Trader Score.
9. Return to `/explore` and confirm the rest of YUI v1 still works.

## Ask testers

- Did you understand what SecurePay is trying to teach without a long explanation?
- Did the game feel fair when players chose different starting capital?
- Did you understand why some agreement choices were stronger than rushed choices?
- Did player-to-player trade feel cooperative rather than purely competitive?
- Were the projects relatable?
- Would you play another round?
- Did the KES 100/month Market Pass concept for 3–6 players feel natural?
- Was it always obvious that Demo Capital was not real money?
- Where did you get confused or stuck?

## Safety boundary

Explorer game code uses local browser storage only. It makes no SecurePay API call and does not initiate M-PESA, bank, payout, release, withdrawal, ledger or settlement actions. Game outcomes are educational simulations, not predictions or guarantees about real transactions.
