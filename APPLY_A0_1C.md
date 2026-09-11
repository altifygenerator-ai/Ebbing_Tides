# Apply Alpha 0.6D A0.1C — Economy Source-of-Truth / NPC Trade Integration

Apply this overlay directly over **A0.1B** (`0.6.0-alpha.d.a0-1b`).

1. Back up the A0.1B project.
2. Extract this overlay over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-1c`.
4. Save schema remains **v12**; no save migration is required.
5. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
6. Backend smoke checks if desired:
   - buy/sell a commodity and confirm local stock/price responds;
   - buy ship stores and confirm staple market stock is consumed;
   - advance days and confirm stock changes from production/consumption/coarse LOD supply rather than moving toward target merely because a target exists;
   - let merchant NPCs sail and confirm they remove cargo from source stock and add it to destination stock;
   - advance a long campaign and confirm NPC planner durability from A0.1B remains intact.

No structural visual approval is required. The Harbor/Shipyard stores line may show a different live price or `Stores unavailable`; this is intentional functional feedback from the unified economy.

This completes the **P0 A0.1 repair trilogy** (A0.1A vessel lifecycle, A0.1B NPC planner durability, A0.1C economy source of truth). Remaining A0 repairs continue with **A0.2A — Information Durability & Ownership** before R2.
