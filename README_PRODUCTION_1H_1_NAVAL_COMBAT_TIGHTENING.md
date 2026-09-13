# Production 1H.1 — Naval Combat Tightening

Apply this overlay **after** `Ebbing_Tides_Production_1H_Complete_Ship_Art_Wiring_OVERLAY` by extracting it into the project root and allowing matching files to be replaced.

## Included correction

- Registers all 33 Production 1H ship families in the real runtime asset table.
- Uses the pristine / damaged-treatment / wrecked thresholds at over 50%, 21–50%, and 20% or lower hull.
- Corrects every logical north/east/south/west heading without duplicating or repainting the supplied token files.
- Makes the navigation token follow the selected or active route segment.
- Places opposed east/west ships in one rectangular tactical lane during combat.
- Removes the circular token badges, mirrored enemy portrait, nested ornamental frame, and portrait movement by range.
- Keeps exact yards, range bands, targeting, repairs, surrender, grappling, boarding, fleeing, prize value, crew share, and legal consequences owned by the existing mechanics.
- Holds terminal encounters on a dedicated after-action screen until the player selects Continue Voyage or Return to Chart.
- Changes no save fields; schema remains v12.

## Victory disposition follow-up

The requested **Destroy Vessel** choice is intentionally not faked in this correction. A safe later pass should place it on the victory screen alongside the current captured/disabled result and define:

1. whether prize/salvage value is reduced or forfeited;
2. the vessel transition to `sunk` through the existing one-time lifecycle resolver;
3. a deterministic survivor roll based on remaining hull, fire, flooding, crew, weather, and rescue choice;
4. persistent alive/dead/missing status for named characters and removal from plans, encounters, dialogue, and future simulation;
5. witness, piracy, faction, reputation, prisoner, rescue, and crew-morale consequences.

That needs a deliberate character-lifecycle addition rather than deleting NPC records ad hoc. This 1H.1 pass only exposes the resolved outcome already produced by current combat.

## Verification

- Alpha TypeScript no-emit check: passed
- Compiled Alpha runtime build: passed
- Production 1H.1 focused checks: 5/5 passed
- Vessel lifecycle and tactical-distance regression subset: 23/24 passed; the one failure is a pre-existing atlas art-style string mismatch in Git commit `20f416bb4012a1d4194070e6b95d9c50595a9d16`, unrelated to naval combat
- Save schema: unchanged at v12
