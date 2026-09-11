# Apply Alpha 0.6D A0.2D — Law Information Lifecycle

Apply this overlay directly over **A0.2C** (`0.6.0-alpha.d.a0-2c`).

1. Back up the current A0.2C project.
2. Extract this ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-2d`.
4. Save schema remains **v12**. A0.2D law-information fields are additive and are normalized on v12 load.
5. **No new Supabase migration is required for A0.2D.** The canonical alpha campaign law state remains inside the versioned `game_saves.snapshot`; A0.2D does not introduce a competing normalized law-state owner.
6. Run, in this order:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
7. Optional explicit durability recheck:
   - `node --test tests/alpha-06d-a0-1b-npc-planner-durability.test.mjs tests/alpha-06d-a0-1c-economy-cohesion.test.mjs`

No structural visual approval is required for this backend corrective pass because accepted Navigation, contextual-location, Crew, Naval Combat Pass 1, R1.2 Character/Creator, and atlas geometry are unchanged.

A0.2D deliberately does **not** implement R2 customs/smuggling/privateering/wartime law, a broad political simulation, world expansion, mutiny, or a new player-facing legal dashboard.

Next audit phase after A0.2D: **A0.3A — Port / Service Capability Authority**.
