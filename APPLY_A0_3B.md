# Apply Alpha 0.6D A0.3B — Character-Build Consequence / Learning Sources

Apply this overlay over the **working A0.3A project with the accepted Main Menu Shell 1.3 runtime bridge**.

1. Back up the current project.
2. Extract this ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-3b`.
4. Save schema remains **v12**. A0.3B uses existing character abilities, specializations, training history, PlayerState knowledge, world events, relationships, crowns, and shared world time; it adds no new persistent campaign owner.
5. **No new Supabase migration is required for A0.3B.**
6. Run, in this order:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `node --test tests/alpha-06d-a0-3b-character-build-learning-sources.test.mjs`
   - `npm test`
   - `node --test tests/alpha-06d-a0-1b-npc-planner-durability.test.mjs tests/alpha-06d-a0-1c-economy-cohesion.test.mjs tests/alpha-06d-a0-3a-port-service-capability.test.mjs`
   - `npm run alpha:art-layouts`
7. Browser sanity check after a hard refresh:
   - Start menu -> New Voyage still enters Character Creator.
   - Create/continue a captain normally.
   - At Veyrholm, Government can show the Admiralty written source.
   - At a port, People can show available/locked officer or teacher instruction.
   - Religious districts expose a concise participation/observation action.
   - Old Veyr Beacon discovery training stays locked until the site is searched or a shore party investigates it.
   - Captain/Creator geometry should look structurally unchanged; the pass should feel like new content inside the existing UI, not a redesign.

A0.3B does **not** implement A0.3C live kingdom/policy/world-event authority, R2 customs/smuggling/privateering/wartime law, world expansion, mutiny, a skill-tree UI, a training dashboard, a new character-creation face builder, or a direct Arcane/Industrial slider.

Next audit phase after A0.3B: **A0.3C — Minimal Live Kingdom / Policy / Religion / World-Event Bridge**.
