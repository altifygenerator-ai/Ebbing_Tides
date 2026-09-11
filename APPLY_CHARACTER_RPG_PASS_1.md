# Ebbing Tides Alpha 0.6D — Character / RPG Pass 1

## Apply target
Apply this overlay to the **manually accepted Alpha 0.6D Naval Combat Pass 1 build** (`0.6.0-alpha.d.naval1`).

Copy the contents of the patch folder into the project root and allow files to overwrite their matching paths.

## Result
- Package version: `0.6.0-alpha.d.character1`
- Save schema: **v11 unchanged**
- Character Creator, Captain Sheet, Crew Roster / named Crew Sheet, and Ship's Journal use the shared Captain's Manuscript presentation language.
- Captain Sheet now surfaces existing political/faction standing and qualitative personal relationships.
- Character Creator explains the gameplay lens already associated with background/profession choices.
- No crime, warrant, customs, smuggling, Letter of Marque, port-standing, or lawful-vessel disposition system is introduced in this pass. Those remain Phase 2+ work.

## Verification gate run before packaging
- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — PASS, **261/261**
- `npm run alpha:art-layouts` — PASS, **2/2 layouts**

## Manual acceptance check
Inspect at normal desktop zoom:
1. Character Creator at several steps, especially Background / Profession and Portrait / Review.
2. Captain > Character Sheet, including Origins, Standing, Relationships, Skills and Condition.
3. Crew Roster and at least one named crew member's Character Sheet.
4. Ship's Journal on each tab and with page navigation where entries exist.
5. Confirm the manuscript treatment reads as art around dynamic UI rather than painted/fake controls.
