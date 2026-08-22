# SecurePay YuI — Final Visual Review Checklist v1

## 1. Market atmosphere
Open `/preview/themes` and switch through Market Day, Green Market, Town Market and Evening Market.

Confirm:
- the page feels different without SecurePay becoming a different brand;
- official icon/wordmark stay unchanged;
- green success, orange caution, waiting and review meaning remain stable;
- no theme makes money or agreement state look more advanced than it is.

## 2. Opening ritual
Open the real signed-out `/` in a fresh browser session.

Confirm:
- the ritual is brief and skippable;
- the official SecurePay icon feels like the Market light, not a literal lighthouse;
- after the ritual, the approved Home layout is unchanged;
- reloading in the same session does not replay it;
- reduced-motion mode does not depend on animation for meaning.

## 3. Whole-Market continuity
Open `/review`, then sample at minimum:
- Home;
- Identity / Create KSNumber;
- Agreement Creation;
- Trader Home + My Market;
- Agreement Workspace;
- Joining + Digital Store;
- Money Rooms;
- SecureFlow + Community;
- Reviews & Recovery;
- Developer + Help/Trust;
- System States.

For each room ask: does the trader remain central, does the Living Mark use the right posture, and can the user see what happened / what it means / what comes next?

## 4. Phone certification
Open `/preview/responsive` and inspect 360×800, 390×844, 412×915 and 430×932. Also resize the actual approved rooms at those widths.

Confirm no horizontal page overflow, hidden primary action, clipped KES amount, broken long name, unusable keyboard-open layout or tiny touch target.

## 5. Final technical gate
Run:

```bash
npm run certify
```

The visual v1 baseline is ready to lock only when Batch 11 is human-approved and this command completes successfully on the complete local working copy.
