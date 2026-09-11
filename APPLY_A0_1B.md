# Apply Alpha 0.6D A0.1B — NPC Planner Durability Repair

Apply this overlay directly over **A0.1A** (`0.6.0-alpha.d.a0-1a`).

1. Back up the A0.1A project.
2. Extract this overlay over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-1b`.
4. Save schema remains **v12**. Existing v12 saves are normalized on load; retired simulation wakeups are compacted and live current-plan checkpoints are restored.
5. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
6. Backend smoke check if desired:
   - advance world time repeatedly and confirm ship NPCs continue arriving/departing;
   - force a ship NPC's food/water reserve low at sea and confirm it returns to a reachable port instead of repeatedly interrupting;
   - save/load and confirm only live scheduled simulation checkpoints remain.

No visual/manual UI approval is required for this pass because accepted UI geometry is unchanged.

Next P0 audit repair: **A0.1C — Economy Source-of-Truth / NPC Trade Integration**.
