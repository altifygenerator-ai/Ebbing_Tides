# Apply Alpha 0.6D A0.1A — Vessel / Combat Lifecycle Repair

Apply this overlay directly over the accepted **RPG R1.2** project (`0.6.0-alpha.d.rpg-r1.2`).

1. Back up the accepted R1.2 project.
2. Extract the A0.1A overlay ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-1a`.
4. Save schema remains **v12**. No save migration is required. Existing v12 ships without a lifecycle field are interpreted as active.
5. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
6. Manual smoke check:
   - resolve a naval victory and confirm the prize/crew-share event occurs once;
   - after the encounter, the defeated ship should not return as normal traffic;
   - a boarding prize should create an ordinary-company prize-share obligation just like another captured prize;
   - no accepted R1.2 Captain/crew/ship/port layout should visually change.

A0.1A does not begin R2. The next corrective target from the audit is **A0.1B — NPC Planner Survival / Deadlock Repair**.
