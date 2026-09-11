# Alpha 0.6D A0.3B1 — Creator & Interaction UX Lock

## Purpose

A0.3B made character-build consequences and learning sources real. A0.3B1 makes those consequences legible at creation and fixes several high-friction interactions noticed during live play, without opening a new system or beginning final art production.

## Character Creator authority

The final review must describe the state that `createGame(...)` will actually produce. To keep one owner:

- `startingSkillContributions(...)` now owns the named starting skill additions from core training, social origin, background, recent profession and trait; `buildStartingSkills(...)` consumes it.
- `startingShipOriginImpact(...)` owns Tideworn starting hull/cargo/crown adjustments from ship origin; ship creation consumes it.
- `startingCrownsForChoices(...)` owns initial crown calculation; game creation consumes it.
- Review uses those owners plus `buildCapabilityState(...)` to derive final attributes, skill ratings, abilities, specializations and schematics.

No new character-stat truth was created for UI display.

## Interaction stability

The runtime still rerenders code-owned screens after state-changing actions, but A0.3B1 captures intentional scroll owners when the logical view key has not changed and restores them after the render. The view key includes meaningful subtabs such as Ship/Harbor, Captain subtabs, Crew inspector/subtabs and Journal tabs. A true screen/subscreen change therefore does not inherit unrelated scroll state.

## Market quantity

The UI now passes the selected integer quantity into the existing `transact(state, commodityId, quantity, direction)` owner. That owner already validates live stock, crowns, cargo capacity and sellable cargo and performs one canonical event/state mutation for the requested amount. A0.3B1 does not create repeated one-unit loops or a second trade calculation.

## Ship service redundancy

A0.3A remains the service authority. Overview labels and status shortcuts consume `quoteShipSupplies(...)` / `quoteShipRepair(...)`, while all buttons route to the existing `buySupplies(...)` / `repairShip(...)` actions. A shortcut does not represent a second repair or supply system.

## Art-lock rule

No painted UI layer was introduced. Character Creator remains explicitly `pre-art`. This pass deliberately improves code-owned density/click targets/review geometry now so the post-R2 Character Creator + Captain art pass can paint around stable code with purpose rather than forcing dynamic content into a baked mockup.

## Verification

- TypeScript: PASS
- Alpha build: PASS
- Full suite: 403/403 PASS
- Dedicated A0.3B1: 10/10 PASS
- 1000-day NPC/economy durability pair: 13/13 PASS
- Art-layout verification: 2/2 PASS
- A0.3B → A0.3B1 mechanics-preservation comparison: PASS across 70 representative/exhaustive option cases for refactored starting skills/crowns/ship state
- Production Next build: not run because the local `next` executable is not installed in this sandbox; Alpha source/build gates are green.
