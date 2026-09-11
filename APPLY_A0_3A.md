# Apply Alpha 0.6D A0.3A — Port / Service Capability Authority

Apply this overlay directly over the **clean A0.2D combined baseline** (`0.6.0-alpha.d.a0-2d`).

1. Back up the current A0.2D project.
2. Extract this ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-3a`.
4. Save schema remains **v12**. A0.3A adds settlement capability data and derives service quotes from existing campaign market state; it does not add new persistent campaign state.
5. **No new Supabase migration is required for A0.3A.**
6. Run, in this order:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `node --test tests/alpha-06d-a0-3a-port-service-capability.test.mjs`
   - `npm test`
   - `node --test tests/alpha-06d-a0-1b-npc-planner-durability.test.mjs tests/alpha-06d-a0-1c-economy-cohesion.test.mjs`
   - `npm run alpha:art-layouts`

A0.3A changes service truth and concise availability/cost/time labels only. It does not redesign accepted Navigation, contextual-location grammar, Crew UI, Naval Combat Pass 1, Captain/Creator geometry, or atlas calibration.

A0.3A deliberately does **not** implement A0.3B character-build consequence/learning sources, A0.3C kingdom/policy/event state, R2 customs/smuggling/privateering/wartime law, world expansion, mutiny, or workshop micromanagement.

Next audit phase after A0.3A: **A0.3B — Character-Build Consequence / Learning-Source Pass**.
