# Apply Alpha 0.6D RPG R1.1 — Standing / Relationships UI Cleanup

Apply this overlay directly over the accepted **RPG R1** project (`0.6.0-alpha.d.rpg-r1`).

1. Back up the current R1 project.
2. Extract the R1.1 overlay ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.rpg-r1.1`.
4. Save schema remains **v12**. No migration is required from R1.
5. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
6. Manually inspect Captain -> Character Sheet:
   - Known Powers / Standing & Law can collapse and expand.
   - Personal Relationships can collapse and expand.
   - Local Standing can collapse and expand.
   - Large relationship/port lists default closed; small lists remain open.
   - Active legal trouble remains visible in the Standing & Law summary even while its body is closed.
   - Expanded Personal Relationships is no longer limited to six people.

R1.1 is presentation cleanup only. Discuss R2 before beginning its mechanics.
