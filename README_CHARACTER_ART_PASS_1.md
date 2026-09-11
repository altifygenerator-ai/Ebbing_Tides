# Ebbing Tides Alpha 0.6D — Character Creator / Captain Purpose-Painted Art Pass 1

Presentation overlay on the accepted `0.6.0-alpha.d.r2` baseline. Save schema remains v12.

## Scope
This pass is deliberately limited to:
- Character Creator
- Captain -> Character Sheet

It does **not** reskin Crew, Journal, Ship, Market, port contexts, Inventory / Equipment, or Port Outfitter.

## Locked art rule
- Code remains the sole owner of live geometry, scroll regions, controls, rows, accordions, portrait slots, values, and changing content.
- Culture is the primary visual skin.
- Religion is a restrained secondary accent.
- No full-screen UI screenshot or sample-state mockup is used as runtime art.

## First shipped packs
### Culture
- `skeldran` — primary culture pack for Creator + Captain.

### Religion accents
- `old_gods`
- `covenant`

Other cultures and religions intentionally remain on the neutral locked layout until their own packs are authored. They do not borrow Skeldran art.

## Runtime behavior
The Character Creator updates its art immediately when Culture or Religion changes. The Captain sheet reads the saved captain's Culture and Religion every time it renders, so loading a different captain can select a different visual combination later without changing gameplay mechanics.

The Skeldran pack paints materials and safe negative space around the locked UI: dark naval/timber margins, parchment texture, painted maritime vignettes, portrait framing, and restrained brass treatment. Old Gods / Covenant add only the secondary mark and accent treatment.

## Verification
A fresh application of this overlay onto the accepted R2 tree was verified independently: TypeScript PASS, Alpha build PASS, **466/466** full tests, **45/45** focused R2/readiness/durability tests, and art-layout verification **2/2 PASS**. Manual visual acceptance remains intentionally pending until the pack is viewed in the user's live browser.
