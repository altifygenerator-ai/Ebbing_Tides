# Apply Alpha 0.6D A0.3C — Minimal Live Kingdom / Policy / Religion / World-Event Bridge

Apply this overlay over the accepted **A0.3B3** project.

1. Back up the current project.
2. Extract this ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-3c`.
4. Save schema remains **v12**. Old v12 saves receive an empty `worldCauses` collection through additive normalization.
5. **No new Supabase migration is required.** The canonical campaign snapshot remains the persistence owner for current live cause state.
6. Run, in this order:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `node --test tests/alpha-06d-a0-3c-world-cause-bridge.test.mjs`
   - `npm test`
   - `node --test tests/alpha-06d-a0-1b-npc-planner-durability.test.mjs tests/alpha-06d-a0-1c-economy-cohesion.test.mjs`
   - `npm run alpha:art-layouts`
7. Browser sanity check after a hard refresh:
   - Existing Character Creator, Captain, Journal, People/conversation, Market, Ship, Navigation, and port flows should remain visually unchanged except that Government/Religion can now host compact **Current public notices** when a live public cause actually exists and its news can reach that port.
   - There should be no kingdom-management or strategy dashboard.
   - No default war/famine/embargo should suddenly appear in a normal fresh campaign; A0.3C deliberately seeds none without approved canon.

A0.3C does **not** implement R2 customs, smuggling, contraband enforcement, letters of marque/privateering, wartime target selection, full kingdom AI, world expansion, mutiny, or the final Character Creator/Captain purpose-painted art pass.

Next step after acceptance: **explicit R2 readiness review**. Only if those gates pass should R2 begin.
